import React, { useState } from 'react';
import './OpenListing.css';

function OpenListing({ listing, onClose }) {
  const [message, setMessage] = useState('Hello, is this still available?');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      alert('Message sent to ' + listing.seller + ': ' + message);
      setMessage('Hello, is this still available?');
    }
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const mainImage = images[selectedImageIndex] || null;

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
              </div>
            </div>

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
                <button type="submit" className="send-message-btn">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenListing;
