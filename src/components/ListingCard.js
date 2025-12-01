import React, { useState } from 'react';
import './screens/HomeScreen.css'
import OpenListing from './OpenListing.js';
import EditListing from './EditListing.js';

function ListingCard({ id, title, category, description, seller, address, price, categoryClass, images = [], seller_id, created_at, ifsold = false, editable = false, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);

  const listing = { id, title, category, description, seller, address, price, images, seller_id, created_at, sold: ifsold };

  // Calculate how many days ago the listing was posted
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';

    // Force UTC parsing
    const posted = new Date(dateString + 'Z');
    const now = new Date();

    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const timeAgo = getTimeAgo(created_at);

  return (
    <>
      <div className={`listing-card ${ifsold ? 'sold-listing' : ''}`} onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyPress={() => setOpen(true)}>
        {ifsold && (
          <div className="sold-badge">
            <i className="fa fa-check-circle"></i> SOLD
          </div>
        )}
        <div className="listing-image-placeholder">
          {images && images.length > 0 ? (
            <img src={images[0]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: ifsold ? 0.6 : 1 }} />
          ) : (
            'No image'
          )}
        </div>
        <div className="listing-content">
          <div className="listing-title-row">
            <h3 className="listing-title">{title}</h3>
            {timeAgo && <span className="listing-time-ago">{timeAgo} </span>}
          </div>
          <span className={`listing-category ${categoryClass}`}>{category}</span>
          <div className="listing-footer">
            <div className="listing-seller">
              <i className="fa fa-user"></i>
              <span>{seller}</span>
            </div>
            <span className="listing-price">${price}</span>
          </div>
        </div>
      </div>

      {open && !editable && (
        <OpenListing
          onClose={() => setOpen(false)}
          listing={listing}
          onUpdate={() => {
            setOpen(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {open && editable && (
        <EditListing
          onClose={() => setOpen(false)}
          listing={listing}
          onUpdate={() => {
            setOpen(false);
            if (onUpdate) onUpdate();
          }}
          onDelete={() => {
            setOpen(false);
            if (onDelete) onDelete();
          }}
        />
      )}
    </>
  );
}

export default ListingCard;
