import React, { useState } from 'react';
import './OpenListing.css';

function OpenListing({ listing, onClose }) {
  const [review, setReview] = useState('');

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (review.trim()) {
      alert('Review submitted: ' + review);
      setReview('');
    }
  };

  return (
    <div className="open-listing-overlay" onClick={onClose}>
      <div className="open-listing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="open-listing-images">
          {listing.images && listing.images.length > 0 ? (
            listing.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${listing.title} ${idx + 1}`}
                className="open-listing-image"
              />
            ))
          ) : (
            <div className="no-image">No images available</div>
          )}
        </div>

        <div className="open-listing-details">
          <h2 className="open-listing-title">{listing.title}</h2>
          <p className="open-listing-price">${listing.price}</p>
          <p className="open-listing-description">{listing.description}</p>
          <p className="open-listing-seller">Seller: {listing.seller}</p>
          <p className="open-listing-address">Address: {listing.address || 'N/A'}</p>
        </div>

        <div className="open-listing-review">
          <h3>Write a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="review-textarea"
              rows="4"
            ></textarea>
            <button type="submit" className="submit-review-btn">
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OpenListing;
