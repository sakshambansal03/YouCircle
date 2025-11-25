import React, { useState } from 'react';
import './screens/HomeScreen.css'
import OpenListing from './OpenListing.js';

function ListingCard({ id, title, category, description, seller, address, price, categoryClass, images = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="listing-card" onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyPress={() => setOpen(true)}>
        <div className="listing-image-placeholder">
          {images && images.length > 0 ? (
            <img src={images[0]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            'No image'
          )}
        </div>
        <div className="listing-content">
          <h3 className="listing-title">{title}</h3>
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

      {open && (
        <OpenListing
          onClose={() => setOpen(false)}
          listing={{ id, title, category, description, seller, address, price, images }}
        />
      )}
    </>
  );
}

export default ListingCard;