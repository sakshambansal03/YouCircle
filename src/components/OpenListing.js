import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpenListing.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import EditListing from './EditListing';

function OpenListing({ listing, onClose, onUpdate }) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Hello, is this still available?');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [markingAsSold, setMarkingAsSold] = useState(false);
  const [showSoldConfirm, setShowSoldConfirm] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !listing.id) return;
      
      let sellerId = listing.seller_id;
      
      if (!sellerId) {
        const { data: listingData } = await supabase
          .from('listings')
          .select('seller_id')
          .eq('id', listing.id)
          .single();
        
        sellerId = listingData?.seller_id;
      }
      
      setIsOwner(sellerId === user.id);
    };
    
    checkOwnership();
  }, [user, listing.id, listing.seller_id]);

  const handleMarkAsSold = async () => {
    if (markingAsSold || !listing.id) return;

    setMarkingAsSold(true);
    try {
      // Update the listing to mark it as sold
      const { error } = await supabase
        .from('listings')
        .update({ ifsold: true })
        .eq('id', listing.id);

      if (error) {
        console.error('Error marking listing as sold:', error);
        alert('Failed to mark listing as sold. Please try again.');
        setMarkingAsSold(false);
        return;
      }

      // Refresh listings and close modal
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error('Error marking listing as sold:', err);
      alert('An error occurred. Please try again.');
      setMarkingAsSold(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || !user || !listing.id) return;

    setSending(true);
    try {
      // Get seller_id from listing - we need to fetch it if not available
      let sellerId = listing.seller_id;
      
      if (!sellerId && listing.id) {
        const { data: listingData } = await supabase
          .from('listings')
          .select('seller_id')
          .eq('id', listing.id)
          .single();
        
        sellerId = listingData?.seller_id;
      }

      if (!sellerId) {
        alert('Unable to find seller information. Please try again.');
        setSending(false);
        return;
      }

      // Prevent users from messaging themselves
      if (sellerId === user.id) {
        alert('You cannot message yourself about your own listing.');
        setSending(false);
        return;
      }

      // Check if conversation already exists
      let conversationId = null;
      
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        // Get buyer name (current user)
        const buyerName = userProfile?.name || user.email?.split('@')[0] || 'Buyer';
        
        // Get seller name from listing
        let sellerName = listing.seller;
        if (!sellerName && listing.id) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('seller_name')
            .eq('id', listing.id)
            .single();
          sellerName = listingData?.seller_name || 'Unknown';
        }

        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            listing_id: listing.id,
            seller_id: sellerId,
            buyer_id: user.id,
            buyer_name: buyerName,
            seller_name: sellerName,
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          alert('Failed to create conversation. Please try again.');
          setSending(false);
          return;
        }

        conversationId = newConv.id;
      }

      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message.trim(),
          is_read: false,
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        alert('Failed to send message. Please try again.');
        setSending(false);
        return;
      }

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Close modal and navigate to messages with conversation ID
      setMessage('Hello, is this still available?');
      onClose();
      navigate(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const mainImage = images[selectedImageIndex] || null;

  if (showEdit) {
    return (
      <EditListing
        listing={listing}
        onClose={() => {
          setShowEdit(false);
        }}
        onUpdate={() => {
          if (onUpdate) onUpdate();
          setShowEdit(false);
          onClose();
        }}
        onDelete={() => {
          if (onUpdate) onUpdate();
          setShowEdit(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="open-listing-overlay" onClick={onClose}>
      <div className="open-listing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="open-listing-content">
          <div className="open-listing-image-section">
            {mainImage ? (
              <>
                <div className="main-image-container">
                  <img
                    src={mainImage}
                    alt={listing.title}
                    className="main-image"
                  />
                </div>
                {images.length > 1 && (
                  <div className="thumbnail-container">
                    {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${listing.title} ${idx + 1}`}
                        className={`thumbnail ${selectedImageIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(idx)}
              />
                    ))}
                  </div>
                )}
              </>
          ) : (
              <div className="no-image-placeholder">
                <i className="fa fa-image"></i>
                <p>No images available</p>
              </div>
          )}
        </div>

          <div className="open-listing-info-section">
        <div className="open-listing-details">
              <div className="listing-header">
          <h2 className="open-listing-title">{listing.title}</h2>
          <p className="open-listing-price">${listing.price}</p>
              </div>
              
              {listing.category && (
                <span className="listing-category-badge">{listing.category}</span>
              )}
              
          <p className="open-listing-description">{listing.description}</p>
              
              <div className="seller-info">
                <div className="seller-item">
                  <i className="fa fa-user"></i>
                  <span><strong>Seller:</strong> {listing.seller}</span>
                </div>
                {listing.address && (
                  <div className="seller-item">
                    <i className="fa fa-map-marker"></i>
                    <span><strong>Location:</strong> {listing.address}</span>
                  </div>
                )}
                {listing.created_at && (
                  <div className="seller-item">
                    <i className="fa fa-calendar"></i>
                    <span>
                      <strong>Posted:</strong> {new Date(listing.created_at + 'Z').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
        </div>

            {isOwner ? (
              <div className="open-listing-message">
                <div className="owner-actions">
                  {!(listing.sold || listing.ifsold) && (
                    <button 
                      type="button" 
                      className="send-message-btn edit-btn" 
                      onClick={() => setShowEdit(true)}
                    >
                      Edit
                    </button>
                  )}
                  {!(listing.sold || listing.ifsold) && (
                    <button 
                      type="button" 
                      className="send-message-btn mark-sold-btn" 
                      onClick={() => setShowSoldConfirm(true)}
                      disabled={markingAsSold}
                    >
                      {markingAsSold ? (
                        <>
                          <i className="fa fa-spinner fa-spin"></i> Marking as Sold...
                        </>
                      ) : (
                        'Mark as Sold'
                      )}
                    </button>
                  )}
                  {(listing.sold || listing.ifsold) && (
                    <div className="sold-message">
                      <i className="fa fa-check-circle"></i> This listing has been marked as sold.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="open-listing-message">
                <h3>
                  <i className="fa fa-comment"></i> Send seller a message
                </h3>
                <form onSubmit={handleMessageSubmit}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hello, is this still available?"
                    className="message-textarea"
                    rows="4"
                  ></textarea>
                  <button type="submit" className="send-message-btn" disabled={sending}>
                    {sending ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i> Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSoldConfirm && (
        <div className="sold-confirm-overlay" onClick={() => setShowSoldConfirm(false)}>
          <div className="sold-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Mark as Sold</h3>
            <p>Are you sure you want to mark this listing as sold? The listing will be moved to your sold listings and will no longer appear in the main browse page.</p>
            <div className="sold-confirm-actions">
              <button
                className="cancel-sold-btn"
                onClick={() => setShowSoldConfirm(false)}
                disabled={markingAsSold}
              >
                Cancel
              </button>
              <button
                className="confirm-sold-btn"
                onClick={handleMarkAsSold}
                disabled={markingAsSold}
              >
                {markingAsSold ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Marking as Sold...
                  </>
                ) : (
                  'Yes, Mark as Sold'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OpenListing;
