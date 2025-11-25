import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';
import ListingCard from '../ListingCard.js'
import ProfileDropdown from '../ProfileDropdown.js'
import AddListingDialog from '../AddListingDialog.js';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../supabaseClient";
import SideDrawer from "../SideDrawer.js";
import Header from '../Header.js';

function HomeScreen() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [listings, setListings] = useState([]);

  // const [listings, setListings] = useState([ { title: "Calculus Tutoring - Ace Your Exams", category: "Tutoring", categoryClass: "tutoring", description: "Experienced math tutor offering one-on-one calculus help.", seller: "Sarah Chen", price: 25, images: [ "https://images.unsplash.com/photo-1509228468512-4e8b5b3c8b0c?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop" ] }, { title: "Used iPhone 13 - Excellent Condition", category: "Electronics", categoryClass: "electronics", description: "Selling my iPhone 13 in great condition. Includes charger and case.", seller: "John Doe", address: 'Pick up at JQA Hall, Southwest', price: 500, images: [ "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=600&fit=crop" ] }, { title: "Haircut Services", category: "Services", categoryClass: "services", description: "Get professional haircut services from a certified stylist.", seller: "Matthew Zhang", address: 'McKimmie Hall, Southwest', price: 25, images: [ "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop" ] }, { title: "Selling a bicycle", category: "Classifieds", categoryClass: "classifieds", description: "I am selling my bicycle for $75. It is in great condition and has been well maintained.", seller: "Joe White", address: 'Pick up at Dwight Hall, Northeast', price: 75, images: [ "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1502744688674-c619d1586c4a?w=800&h=600&fit=crop" ] }] );

  useEffect(() => {
    if (!loading && !user) navigate('/');

    if (user) fetchListings();
  }, [user, loading]);

  const fetchListings = async () => {
    // Fetch listings
    const { data: listingsData, error } = await supabase
      .from('listings')
      .select(`id, title, category, description, price, address, seller_id, created_at, 
               listing_images (image_url)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      // Transform data to match ListingCard props
      const formattedListings = listingsData.map((l) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        description: l.description,
        price: l.price,
        address: l.address,
        images: l.listing_images.map((img) => img.image_url),
        seller: userProfile?.name || 'Unknown', // optional, you can fetch actual seller
        categoryClass: l.category.toLowerCase(),
      }));

      setListings(formattedListings);
    }
  };

  const handleAddListing = async (newListing) => {
    // Insert into listings table
    const { data: insertedListing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: userProfile?.id,
        title: newListing.title,
        category: newListing.category,
        description: newListing.description,
        price: newListing.price,
        address: newListing.address,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding listing:', error);
      return;
    }

    // Insert images
    if (newListing.images.length > 0) {
      const imagesToInsert = newListing.images.map((url) => ({
        listing_id: insertedListing.id,
        image_url: url, // if you upload files, replace with file URL
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imagesToInsert);

      if (imagesError) console.error('Error adding images:', imagesError);
    }

    // Refresh listings
    fetchListings();
    setShowAddDialog(false);
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

  if (!user) return null;

  return (
    <div className="home-screen">
      <Header/>
      <SideDrawer />

      <div className="home-content">
        <div className="recent-listings-header">
          <h2 className="recent-listings-title">Recent Listings</h2>
          <button className="add-listing-btn" onClick={() => setShowAddDialog(true)}>
            + Add New Listing
          </button>
        </div>

        <div className="listings-container">
          {listings.map((item) => (
            <ListingCard key={item.id} {...item} />
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
    </div>
  );
}

export default HomeScreen;