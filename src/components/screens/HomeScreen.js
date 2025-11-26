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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const fetchListings = async () => {
    try {
      // First try with seller_name, if that fails, try without it
      let { data: listingsData, error } = await supabase
        .from('listings')
        .select(`id, title, category, description, price, address, seller_id, seller_name, created_at, 
                 listing_images (image_url)`)
        .order('created_at', { ascending: false });

      // If seller_name column doesn't exist, try without it
      if (error && error.message && error.message.includes('seller_name')) {
        console.warn('seller_name column not found, fetching without it');
        const result = await supabase
          .from('listings')
          .select(`id, title, category, description, price, address, seller_id, created_at, 
                   listing_images (image_url)`)
          .order('created_at', { ascending: false });
        
        listingsData = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      if (!listingsData || listingsData.length === 0) {
        console.log('No listings found');
        setListings([]);
        return;
      }

      // Get unique seller IDs that don't have seller_name
      const sellerIdsNeedingName = [...new Set(
        listingsData
          .filter(l => !l.seller_name && l.seller_id)
          .map(l => l.seller_id)
      )];

      // Try to fetch seller names from profiles table if it exists
      let sellerNameMap = {};
      if (sellerIdsNeedingName.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', sellerIdsNeedingName);
          
          if (profiles) {
            profiles.forEach(profile => {
              sellerNameMap[profile.id] = profile.name;
            });
          }
        } catch (profilesError) {
          // Profiles table doesn't exist or error, that's okay
          console.log('Profiles table not available or error:', profilesError);
        }

        // For listings without seller_name, try to backfill from profiles or current user
        const listingsToUpdate = listingsData.filter(l => 
          !l.seller_name && 
          l.seller_id && 
          (sellerNameMap[l.seller_id] || l.seller_id === userProfile?.id)
        );

        if (listingsToUpdate.length > 0) {
          // Update listings with seller_name
          for (const listing of listingsToUpdate) {
            const sellerName = sellerNameMap[listing.seller_id] || 
                             (listing.seller_id === userProfile?.id ? userProfile?.name : null);
            
            if (sellerName) {
              try {
                await supabase
                  .from('listings')
                  .update({ seller_name: sellerName })
                  .eq('id', listing.id);
              } catch (updateError) {
                console.log('Could not update seller_name:', updateError);
              }
            }
          }
        }
      }

      // Transform data to match ListingCard props
      const formattedListings = listingsData.map((l) => {
        // Determine seller name: use stored, or from map, or current user if match, or Unknown
        let sellerName = l.seller_name;
        if (!sellerName && l.seller_id) {
          sellerName = sellerNameMap[l.seller_id] || 
                      (l.seller_id === userProfile?.id ? userProfile?.name : null) ||
                      'Unknown';
        } else if (!sellerName) {
          sellerName = 'Unknown';
        }

        return {
          id: l.id,
          title: l.title || 'Untitled',
          category: l.category || 'Uncategorized',
          description: l.description || '',
          price: l.price || 0,
          address: l.address || '',
          images: (l.listing_images && Array.isArray(l.listing_images) && l.listing_images.length > 0)
            ? l.listing_images.map((img) => img.image_url).filter(Boolean)
            : [],
          seller: sellerName,
          categoryClass: (l.category || 'uncategorized').toLowerCase(),
        };
      });

      console.log('Formatted listings:', formattedListings);
      setListings(formattedListings);
    } catch (err) {
      console.error('Unexpected error fetching listings:', err);
    }
  };

  const handleAddListing = async (newListing) => {
    // Prepare insert data
    const insertData = {
      seller_id: userProfile?.id,
      title: newListing.title,
      category: newListing.category,
      description: newListing.description,
      price: newListing.price,
      address: newListing.address,
    };

    // Try to include seller_name (will fail gracefully if column doesn't exist)
    const sellerName = userProfile?.name || newListing.seller || 'Unknown';
    insertData.seller_name = sellerName;

    // Insert into listings table
    let { data: insertedListing, error } = await supabase
      .from('listings')
      .insert(insertData)
      .select()
      .single();

    // If seller_name column doesn't exist, try without it
    if (error && error.message && error.message.includes('seller_name')) {
      console.warn('seller_name column not found, inserting without it');
      delete insertData.seller_name;
      const retryResult = await supabase
        .from('listings')
        .insert(insertData)
        .select()
        .single();
      
      if (retryResult.error) {
        console.error('Error adding listing:', retryResult.error);
        return;
      }
      insertedListing = retryResult.data;
      error = null;
    }

    if (error) {
      console.error('Error adding listing:', error);
      return;
    }

    // Insert images
    await handleImages(insertedListing.id, newListing.images);

    // Refresh listings
    fetchListings();
    setShowAddDialog(false);
  };

  const handleImages = async (listingId, images) => {
    if (images && images.length > 0) {
      const imagesToInsert = images.map((url) => ({
        listing_id: listingId,
        image_url: url, // if you upload files, replace with file URL
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imagesToInsert);

      if (imagesError) {
        console.error('Error adding images:', imagesError);
        return { error: imagesError };
      }
    }
    return { error: null };
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