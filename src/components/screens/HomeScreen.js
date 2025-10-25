import React from 'react';
import './HomeScreen.css';

function HomeScreen() {
  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-logo">YouCircle</div>
        <div className="home-search-bar">
          <i className="fa fa-search"></i>
          <input type="text" placeholder="Search for services, items, or tutors..." />
        </div>
        <div className="home-avatar">AJ</div>
      </header>

      <h2 className="recent-listings-title">Recent Listings</h2>

      <div className="listings-container">
        {/* Listing Card 1: Calculus Tutoring */}
        <div className="listing-card">
          <div className="listing-image-placeholder">No image</div>
          <div className="listing-content">
            <h3 className="listing-title">Calculus Tutoring - Ace Your Exams</h3>
            <span className="listing-category tutoring">Tutoring</span>
            <p className="listing-description">Experienced math tutor offering one-on-one calculus help.</p>
            <div className="listing-footer">
              <div className="listing-seller">
                <i className="fa fa-user"></i>
                <span>Sarah Chen</span>
                <span className="listing-verified">Verified</span>
              </div>
              <span className="listing-price">$25</span>
            </div>
          </div>
        </div>

        {/* Listing Card 2: Used iPhone 13 */}
        <div className="listing-card">
          <div className="listing-image-placeholder">No image</div>
          <div className="listing-content">
            <h3 className="listing-title">Used iPhone 13 - Excellent Condition</h3>
            <span className="listing-category electronics">Electronics</span>
            <p className="listing-description">Selling my iPhone 13 in great condition. Includes charger and case.</p>
            <div className="listing-footer">
              <div className="listing-seller">
                <i className="fa fa-user"></i>
                <span>John Doe</span>
                <span className="listing-verified">Verified</span>
              </div>
              <span className="listing-price">$500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;

