import React from 'react';
import './screens/HomeScreen.css'

function ListingCard({ title, category, description, seller, price, categoryClass }) {
  return (
    <div className="listing-card">
      <div className="listing-image-placeholder">No image</div>
      <div className="listing-content">
        <h3 className="listing-title">{title}</h3>
        <span className={`listing-category ${categoryClass}`}>{category}</span>
        <p className="listing-description">{description}</p>
        <div className="listing-footer">
          <div className="listing-seller">
            <i className="fa fa-user"></i>
            <span>{seller}</span>
          </div>
          <span className="listing-price">${price}</span>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;