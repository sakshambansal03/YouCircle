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
      
      // Refresh conversations list to include this one
      fetchConversations();
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      
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

      // Get the latest message for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

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
            unreadCount: 0, // TODO: Calculate unread messages
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
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
          fetchConversations();
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
          fetchConversations();
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
      <SideDrawer />

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
                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
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
                        <p className="conversation-preview">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="unread-badge">{conv.unreadCount}</div>
                    )}
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

