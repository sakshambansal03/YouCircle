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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    if (!loading && !user) navigate('/');
    if (user) fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          seller_id,
          listing_images (image_url),
          created_at,
          ifsold
        `)
        .eq('ifsold', false)
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
        seller_id: l.seller_id, // Include seller_id for conversation creation
        images: l.listing_images?.map(img => img.image_url).filter(Boolean) || [],
        seller: l.seller_name || 'Unknown',
        categoryClass: (l.category || 'uncategorized').toLowerCase(),
        created_at: l.created_at,
        ifsold: l.ifsold || false,
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

  // Filter listings based on search query and category
  const filteredListings = listings.filter(listing => {
    // Filter by category
    if (selectedCategory !== 'All Categories' && listing.category !== selectedCategory) {
      return false;
    }
    
    // Filter by search query
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

  return (
    <div className="home-screen">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <SideDrawer />

      <div className="home-content">
        <div className="recent-listings-header">
          <h2 className="recent-listings-title">Recent Listings</h2>
          <div className="header-actions">
            <select 
              className="category-filter-dropdown"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="Services">Services</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Study Material">Study Material</option>
              <option value="Clothing and Accessories">Clothing and Accessories</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
            <button className="add-listing-btn" onClick={() => setShowAddDialog(true)}>
              + Add New Listing
            </button>
          </div>
        </div>

        <div className="listings-container">
          {filteredListings.length === 0 ? (
            <p className="no-listings-message">
              {searchQuery || selectedCategory !== 'All Categories' 
                ? 'No listings match your filters.' 
                : 'There are no listings yet.'}
            </p>
          ) : (
            filteredListings.map(item => (
              <ListingCard 
                key={item.id} 
                {...item} 
                onUpdate={fetchListings}
              />
            ))
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