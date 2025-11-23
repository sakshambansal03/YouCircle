import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';
import ListingCard from '../ListingCard.js'
import ProfileDropdown from '../ProfileDropdown.js'
import AddListingDialog from '../AddListingDialog.js';
import { useAuth } from '../../contexts/AuthContext';

function HomeScreen() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

   const [listings, setListings] = useState([
    {
      title: "Calculus Tutoring - Ace Your Exams",
      category: "Tutoring",
      categoryClass: "tutoring",
      description: "Experienced math tutor offering one-on-one calculus help.",
      seller: "Sarah Chen",
      price: 25,
      images: [
        "https://images.unsplash.com/photo-1509228468512-4e8b5b3c8b0c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Used iPhone 13 - Excellent Condition",
      category: "Electronics",
      categoryClass: "electronics",
      description: "Selling my iPhone 13 in great condition. Includes charger and case.",
      seller: "John Doe",
      address: 'Pick up at JQA Hall, Southwest',
      price: 500,
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Haircut Services",
      category: "Services",
      categoryClass: "services",
      description: "Get professional haircut services from a certified stylist.",
      seller: "Matthew Zhang",
      address: 'McKimmie Hall, Southwest',
      price: 25,
      images: [
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Selling a bicycle",
      category: "Classifieds",
      categoryClass: "classifieds",
      description: "I am selling my bicycle for $75. It is in great condition and has been well maintained.",
      seller: "Joe White",
      address: 'Pick up at Dwight Hall, Northeast',
      price: 75,
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502744688674-c619d1586c4a?w=800&h=600&fit=crop"
      ]
    }]
   );

   const handleAddListing = (newListing) => {
    // Automatically set seller from authenticated user profile
    const listingWithSeller = {
      ...newListing,
      seller: userProfile?.name || newListing.seller || 'Unknown',
    };
    setListings((prev) => [listingWithSeller, ...prev]); // add to top
    setShowAddDialog(false);
  };

  const getUserInitials = () => {
    if (!userProfile?.name) return 'U';
    return userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="home-screen">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

      <div className="recent-listings-header">
        <h2 className="recent-listings-title">Recent Listings</h2>
        <button className="add-listing-btn" onClick={() => setShowAddDialog(true)}>
          + Add New Listing
        </button>
      </div>

      <div className="listings-container">
        {listings.map((item, index) => (
          <ListingCard key={index} {...item} />
        ))}
      </div>

      {showAddDialog && (
        <AddListingDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddListing}
        />
      )}

      {showProfile && userProfile && (
        <ProfileDropdown
          profile={userProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default HomeScreen;