import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';
import ListingCard from '../ListingCard';
import ProfileDropdown from '../ProfileDropdown';
import AddListingDialog from '../AddListingDialog';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../supabaseClient";
import SideDrawer from "../SideDrawer";
import Header from '../Header';

function HomeScreen() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate('/');
    if (user) fetchListings();
  }, [user, loading]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      if (!data || data.length === 0) {
        setListings([]);
        return;
      }

      const formattedListings = data.map((l) => ({
        id: l.id,
        title: l.title || 'Untitled',
        category: l.category || 'Uncategorized',
        description: l.description || '',
        price: l.price || 0,
        address: l.address || '',
        images: l.listing_images?.map(img => img.image_url).filter(Boolean) || [],
        seller: l.seller_name || 'Unknown',
        categoryClass: (l.category || 'uncategorized').toLowerCase(),
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error('Unexpected error fetching listings:', err);
    }
  };

  const handleAddListing = async (newListing) => {
    const insertData = {
      seller_id: userProfile?.id,
      seller_name: userProfile?.name || 'Unknown',
      title: newListing.title,
      category: newListing.category,
      description: newListing.description,
      price: newListing.price,
      address: newListing.address,
    };

    try {
      const { data: insertedListing, error } = await supabase
        .from('listings')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error adding listing:', error);
        return;
      }

      if (newListing.images?.length > 0) {
        const imagesToInsert = newListing.images.map(url => ({
          listing_id: insertedListing.id,
          image_url: url,
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imagesToInsert);

        if (imagesError) console.error('Error adding images:', imagesError);
      }

      fetchListings();
      setShowAddDialog(false);
    } catch (err) {
      console.error('Unexpected error adding listing:', err);
    }
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
      <Header />
      <SideDrawer />

      <div className="home-content">
        <div className="recent-listings-header">
          <h2 className="recent-listings-title">Recent Listings</h2>
          <button className="add-listing-btn" onClick={() => setShowAddDialog(true)}>
            + Add New Listing
          </button>
        </div>

        <div className="listings-container">
          {listings.length === 0 ? (
            <p>There are no listings yet.</p>
          ) : (
            listings.map(item => <ListingCard key={item.id} {...item} />)
          )}
        </div>

        {showAddDialog && (
          <AddListingDialog onClose={() => setShowAddDialog(false)} onAdd={handleAddListing} />
        )}

        {showProfile && userProfile && (
          <ProfileDropdown profile={userProfile} onClose={() => setShowProfile(false)} />
        )}
      </div>
    </div>
  );
}

export default HomeScreen;