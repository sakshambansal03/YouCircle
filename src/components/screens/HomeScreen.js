import React, { useState } from 'react';
import './HomeScreen.css';
import ListingCard from '../ListingCard.js'
import ProfileDropdown from '../ProfileDropdown.js'

function HomeScreen() {
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Alex Johnson",
    email: "alex.j@university.edu",
    username: "alexj2024",
    phone: "(555) 123-4567"
  });
  const listings = [
    {
      title: "Calculus Tutoring - Ace Your Exams",
      category: "Tutoring",
      categoryClass: "tutoring",
      description: "Experienced math tutor offering one-on-one calculus help.",
      seller: "Sarah Chen",
      price: 25
    },
    {
      title: "Used iPhone 13 - Excellent Condition",
      category: "Electronics",
      categoryClass: "electronics",
      description: "Selling my iPhone 13 in great condition. Includes charger and case.",
      seller: "John Doe",
      address: 'Pick up at JQA Hall, Southwest',
      price: 500
    },
    {
      title: "Haircut Services",
      category: "Services",
      categoryClass: "services",
      description: "Get professional haircut services from a certified stylist.",
      seller: "Matthew Zhang",
      address: 'McKimmie Hall, Southwest',
      price: 25
    },
    {
      title: "Selling a bicycle",
      category: "Classifieds",
      categoryClass: "classifieds",
      description: "I am selling my bicycle for $75. It is in great condition and has been well maintained.",
      seller: "Joe White",
      address: 'Pick up at Dwight Hall, Northeast',
      price: 75
    }
  ];

  const getUserInitials = () => {
    return userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileSave = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setShowProfile(false);
  };

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-logo">YouCircle</div>
        <div className="home-search-bar">
          <i className="fa fa-search"></i>
          <input type="text" placeholder="Search for services, items, or tutors..." />
        </div>
        <div className="home-avatar" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
          {getUserInitials()}
        </div>
      </header>

      <h2 className="recent-listings-title">Recent Listings</h2>

      <div className="listings-container">
        {listings.map((item, index) => (
          <ListingCard key={index} {...item} />
        ))}
      </div>

      {showProfile && (
        <ProfileDropdown
          profile={userProfile}
          onClose={() => setShowProfile(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
}

export default HomeScreen;