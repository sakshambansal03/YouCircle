import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import './ChatWindow.css';

function ChatWindow({ conversation, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const listing = conversation.listings;

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);

      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(
          msg => !msg.is_read && msg.sender_id !== currentUser.id
        );
        
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(m => m.id));
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const subscribeToMessages = () => {
    if (!conversation?.id) return null;

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
          
          // Mark as read if it's not from current user
          if (payload.new.sender_id !== currentUser.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: newMessage.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
        return;
      }

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const otherUserName = conversation.seller_id === currentUser.id 
    ? (conversation.buyer_name || 'Buyer') // User is seller, show buyer name
    : (conversation.seller_name || conversation.otherUserName || listing?.seller_name || 'Unknown'); // User is buyer, show seller name

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-listing-image">
            {listing?.listing_images?.[0]?.image_url ? (
              <img src={listing.listing_images[0].image_url} alt={listing.title} />
            ) : (
              <div className="chat-image-placeholder">
                <i className="fa fa-image"></i>
              </div>
            )}
          </div>
          <div className="chat-header-text">
            <h3>{listing?.title || 'Unknown Listing'}</h3>
            <p>Chatting with {otherUserName}</p>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <i className="fa fa-times"></i>
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          disabled={sending}
        />
        <button type="submit" className="chat-send-btn" disabled={sending || !newMessage.trim()}>
          {sending ? (
            <i className="fa fa-spinner fa-spin"></i>
          ) : (
            <i className="fa fa-paper-plane"></i>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;

