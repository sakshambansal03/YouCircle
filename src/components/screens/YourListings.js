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
    try {
      const { data: listingsData, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          category,
          description,
          price,
          address,
          seller_name,
          listing_images (image_url),
          created_at
        `)
        .eq('seller_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching your listings:', error);
        return;
      }

      const formattedListings = listingsData.map((l) => ({
        id: l.id,
        title: l.title || 'Untitled',
        category: l.category || 'Uncategorized',
        description: l.description || '',
        price: l.price || 0,
        address: l.address || '',
        images: l.listing_images?.map(img => img.image_url).filter(Boolean) || [],
        seller: l.seller_name || 'Unknown',   // ← FIXED
        categoryClass: (l.category || 'uncategorized').toLowerCase(),
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error('Unexpected error fetching your listings:', err);
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
          <p style={{ marginLeft: '40px', marginTop: '30px' }}>
            You haven't posted any listings yet.
          </p>
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