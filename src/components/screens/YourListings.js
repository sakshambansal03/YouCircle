import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './YourListings.css';
import Header from '../Header';
import SideDrawer from '../SideDrawer';
import ListingCard from '../ListingCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../supabaseClient";

function YourListings() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate('/'); // redirect if not logged in
    if (user) fetchYourListings();
  }, [user, loading]);

  const fetchYourListings = async () => {
    const { data: listingsData, error } = await supabase
      .from('listings')
      .select(`id, title, category, description, price, address, seller_id, created_at,
               listing_images (image_url)`)
      .eq('seller_id', userProfile?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching your listings:', error);
    } else {
      const formattedListings = listingsData.map((l) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        description: l.description,
        price: l.price,
        address: l.address,
        images: l.listing_images.map((img) => img.image_url),
        seller: userProfile?.name || 'Unknown',
        categoryClass: l.category.toLowerCase(),
      }));

      setListings(formattedListings);
    }
  };

  if (loading) {
    return (
      <div className="listings-screen">
        <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="listings-screen">
      <Header />
      <SideDrawer />

      <div className="listings-content">
        <h2 className="listings-title">Your Listings</h2>
        {listings.length === 0 ? (
          <p style={{ marginLeft: '40px', marginTop: '30px' }}>You haven't posted any listings yet.</p>
        ) : (
          <div className="listings-container">
            {listings.map((item) => (
              <ListingCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default YourListings;

