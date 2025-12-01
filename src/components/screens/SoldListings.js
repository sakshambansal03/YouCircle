import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';
import ListingCard from '../ListingCard';
import Header from '../Header';
import SideDrawer from '../SideDrawer';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../supabaseClient";

function SoldListings() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/');
    if (user) fetchSoldListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const fetchSoldListings = async () => {
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
          created_at,
          ifsold,
          seller_id
        `)
        .eq('seller_id', userProfile?.id)
        .eq('ifsold', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sold listings:', error);
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
        seller_id: l.seller_id,
        images: l.listing_images?.map(img => img.image_url).filter(Boolean) || [],
        seller: l.seller_name || 'Unknown',
        categoryClass: (l.category || 'uncategorized').toLowerCase(),
        created_at: l.created_at,
        ifsold: l.ifsold,
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error('Unexpected error fetching sold listings:', err);
    }
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
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <SideDrawer />

      <div className="home-content">
        <div className="recent-listings-header">
          <h2 className="recent-listings-title">Sold Listings</h2>
        </div>

        <div className="listings-container">
          {filteredListings.length === 0 ? (
            <p className="no-listings-message">
              {searchQuery 
                ? 'No sold listings match your search.' 
                : 'There are no sold listings yet.'}
            </p>
          ) : (
            filteredListings.map(item => (
              <ListingCard 
                key={item.id} 
                {...item} 
                onUpdate={fetchSoldListings}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SoldListings;

