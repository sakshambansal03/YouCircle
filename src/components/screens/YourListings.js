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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/'); // redirect if not logged in
    if (user) fetchYourListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        seller_id: userProfile?.id, // Include seller_id
        images: l.listing_images?.map(img => img.image_url).filter(Boolean) || [],
        seller: l.seller_name || 'Unknown',
        categoryClass: (l.category || 'uncategorized').toLowerCase(),
        created_at: l.created_at,
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error('Unexpected error fetching your listings:', err);
    }
  };

  const handleListingUpdate = () => {
    fetchYourListings();
  };

  const handleListingDelete = () => {
    fetchYourListings();
  };

  // Filter listings based on search query
  const filteredListings = listings.filter(listing => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title?.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query) ||
      listing.category?.toLowerCase().includes(query) ||
      listing.seller?.toLowerCase().includes(query) ||
      listing.address?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="listings-screen">
        <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="listings-screen">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <SideDrawer />

      <div className="listings-content">
        <h2 className="listings-title">Your Listings</h2>
        {filteredListings.length === 0 ? (
          <p style={{ marginLeft: '40px', marginTop: '30px' }}>
            {searchQuery ? 'No listings match your search.' : 'You haven\'t posted any listings yet.'}
          </p>
        ) : (
          <div className="listings-container">
            {filteredListings.map((item) => (
              <ListingCard
                key={item.id}
                {...item}
                editable={true}
                onUpdate={handleListingUpdate}
                onDelete={handleListingDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default YourListings;
