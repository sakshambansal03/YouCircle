import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import './MessagesScreen.css';
import Header from '../Header';
import SideDrawer from '../SideDrawer';
import ChatWindow from '../ChatWindow';

function MessagesScreen() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
    if (user) {
      fetchConversations();
      const unsubscribe = subscribeToConversations();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Handle conversation selection from URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      // First try to find in existing conversations
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        navigate('/messages', { replace: true });
      } else {
        // If not found, fetch it directly
        fetchConversationById(conversationId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, searchParams]);

  const fetchConversationById = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          listing_id,
          seller_id,
          buyer_id,
          buyer_name,
          seller_name,
          created_at,
          updated_at,
          listings (
            id,
            title,
            price,
            seller_name,
            listing_images (image_url)
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error || !data) {
        console.error('Error fetching conversation:', error);
        return;
      }

      // Get the latest message
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const otherUserId = data.seller_id === user.id ? data.buyer_id : data.seller_id;
      const otherUserName = data.seller_id === user.id 
        ? (data.buyer_name || 'Buyer') // User is seller, show buyer name
        : (data.seller_name || data.listings?.seller_name || 'Unknown'); // User is buyer, show seller name

      const conversation = {
        ...data,
        lastMessage: messages,
        otherUserId,
        otherUserName,
        unreadCount: 0,
      };

      setSelectedConversation(conversation);
      navigate('/messages', { replace: true });
      
      // Refresh conversations list to include this one (silently)
      fetchConversations(false);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const fetchConversations = async (showLoading = true, preserveSelected = true) => {
    try {
      if (showLoading) {
        setLoadingConversations(true);
      }
      
      // Store the currently selected conversation ID to preserve it
      const currentSelectedId = selectedConversation?.id;
      
      // Fetch conversations where user is either buyer or seller
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          listing_id,
          seller_id,
          buyer_id,
          buyer_name,
          seller_name,
          created_at,
          updated_at,
          listings (
            id,
            title,
            price,
            seller_name,
            listing_images (image_url)
          )
        `)
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Get the latest message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages not read and not sent by current user)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          // Get the other participant's name
          const otherUserId = conv.seller_id === user.id ? conv.buyer_id : conv.seller_id;
          const otherUserName = conv.seller_id === user.id 
            ? (conv.buyer_name || 'Buyer') // User is seller, show buyer name
            : (conv.seller_name || conv.listings?.seller_name || 'Unknown'); // User is buyer, show seller name

          return {
            ...conv,
            lastMessage: messages,
            otherUserId,
            otherUserName,
            unreadCount: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithMessages);
      
      // Calculate total unread count across all conversations
      const totalUnread = conversationsWithMessages.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setTotalUnreadCount(totalUnread);
      
      // Only update selected conversation if preserveSelected is false (explicit refresh)
      // Otherwise, don't touch the selected conversation to prevent switching
      if (currentSelectedId && !preserveSelected) {
        const updatedConv = conversationsWithMessages.find(c => c.id === currentSelectedId);
        if (updatedConv) {
          setSelectedConversation(updatedConv);
        }
      }
      // If preserveSelected is true (default), we don't update the selected conversation
      // This ensures the current chat stays open
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (showLoading) {
        setLoadingConversations(false);
      }
    }
  };

  const subscribeToConversations = () => {
    if (!user?.id) return null;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `seller_id=eq.${user.id}`,
        },
        () => {
          // Silently refresh conversations without showing loading screen
          // preserveSelected=true ensures we don't change the selected conversation
          fetchConversations(false, true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `buyer_id=eq.${user.id}`,
        },
        () => {
          // Silently refresh conversations without showing loading screen
          // preserveSelected=true ensures we don't change the selected conversation
          fetchConversations(false, true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Refresh conversations when messages are marked as read to update unread counts
          fetchConversations(false, true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading || loadingConversations) {
    return (
      <div className="messages-screen">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="messages-screen">
      <Header />
      <SideDrawer unreadCount={totalUnreadCount} />

      <div className="messages-content">
        <div className="conversations-list">
          <h2 className="messages-title">Messages</h2>
          
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <i className="fa fa-envelope-open"></i>
              <p>No messages yet</p>
              <p className="no-conversations-subtitle">Start a conversation by messaging a seller from a listing!</p>
            </div>
          ) : (
            <div className="conversations-container">
              {conversations.map((conv) => {
                const listing = conv.listings;
                const listingImage = listing?.listing_images?.[0]?.image_url || null;
                
                return (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="conversation-image">
                      {listingImage ? (
                        <img src={listingImage} alt={listing?.title} />
                      ) : (
                        <div className="conversation-image-placeholder">
                          <i className="fa fa-image"></i>
                        </div>
                      )}
                    </div>
                    <div className="conversation-details">
                      <div className="conversation-header">
                        <h3 className="conversation-listing-title">{listing?.title || 'Unknown Listing'}</h3>
                        {conv.lastMessage && (
                          <span className="conversation-time">
                            {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="conversation-participant">
                        {conv.otherUserName}
                      </p>
                      {conv.lastMessage && (
                        <div className="conversation-preview-container">
                          <p className="conversation-preview">
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <div className="unread-badge">{conv.unreadCount}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="chat-area">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={user}
              onClose={() => setSelectedConversation(null)}
              onMessageSent={async () => {
                // Store the current selected conversation ID to ensure we preserve it
                const currentSelectedId = selectedConversation?.id;
                
                // Silently refresh conversations list after message is sent
                // preserveSelected=true ensures we don't change the selected conversation
                await fetchConversations(false, true);
                
                // Only update the selected conversation if it's still the same one
                // This ensures we stay on the current chat
                if (currentSelectedId) {
                  const { data: updatedConv, error } = await supabase
                    .from('conversations')
                    .select(`
                      id,
                      listing_id,
                      seller_id,
                      buyer_id,
                      buyer_name,
                      seller_name,
                      created_at,
                      updated_at,
                      listings (
                        id,
                        title,
                        price,
                        seller_name,
                        listing_images (image_url)
                      )
                    `)
                    .eq('id', currentSelectedId)
                    .single();
                  
                  if (!error && updatedConv) {
                    const { data: messages } = await supabase
                      .from('messages')
                      .select('*')
                      .eq('conversation_id', updatedConv.id)
                      .order('created_at', { ascending: false })
                      .limit(1)
                      .single();
                    
                    const otherUserId = updatedConv.seller_id === user.id ? updatedConv.buyer_id : updatedConv.seller_id;
                    const otherUserName = updatedConv.seller_id === user.id 
                      ? (updatedConv.buyer_name || 'Buyer')
                      : (updatedConv.seller_name || updatedConv.listings?.seller_name || 'Unknown');
                    
                    // Only update if it's still the selected conversation
                    setSelectedConversation(prev => {
                      // Double-check that we're still on the same conversation
                      if (prev && prev.id === currentSelectedId) {
                        return {
                          ...updatedConv,
                          lastMessage: messages,
                          otherUserId,
                          otherUserName,
                          unreadCount: 0,
                        };
                      }
                      // If somehow the conversation changed, keep the previous one
                      return prev;
                    });
                  }
                }
              }}
            />
          ) : (
            <div className="no-chat-selected">
              <i className="fa fa-comments"></i>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesScreen;

