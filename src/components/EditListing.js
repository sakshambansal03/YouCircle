import React, { useState } from 'react';
import './EditListing.css';
import { supabase } from '../supabaseClient';

function EditListing({ listing, onClose, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    title: listing.title || '',
    category: listing.category || '',
    description: listing.description || '',
    price: listing.price || '',
    address: listing.address || '',
  });
  
  // Track existing images (from database) and new images (to be uploaded)
  const [existingImages, setExistingImages] = useState(listing.images || []);
  const [newImages, setNewImages] = useState([]); // Data URLs for new images
  const [imagesToDelete, setImagesToDelete] = useState([]); // URLs of images to delete from DB
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Combine existing and new images for display
  const allImages = [...existingImages, ...newImages];
  const mainImage = allImages[selectedImageIndex] || null;

  const showError = (message) => {
    setErrorMessage(message);

    // Start fade-out just before clearing
    setTimeout(() => {
      const errorElement = document.querySelector('.form-error');
      if (errorElement) errorElement.classList.add('fade-out');
    }, 4500);

    // Clear message completely after 5s
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file. Please select an image.`);
          reject(new Error('Not an image'));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then((dataURLs) => {
        setNewImages(prev => [...prev, ...dataURLs]);
      })
      .catch(() => {
        // Error already handled
      });

    e.target.value = '';
  };

    const handleRemoveExistingImage = (index) => {
        const imageUrl = existingImages[index];

        setImagesToDelete(prev => [...prev, imageUrl]);

        setExistingImages(prev => {
            const updated = prev.filter((_, i) => i !== index);

            const totalImages = updated.length + newImages.length;
            if (selectedImageIndex >= totalImages) {
            setSelectedImageIndex(Math.max(0, totalImages - 1));
            }

            return updated;
        });
    };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    
    // Adjust selected index if needed
    const adjustedIndex = existingImages.length + index;
    if (selectedImageIndex >= adjustedIndex) {
      setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const totalImages = existingImages.length + newImages.length;

    if (totalImages === 0) {
        showError("Please upload at least one image");
        return; 
    }

  setSaving(true);

  try {
    // Update listing details
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        address: formData.address.trim(),
      })
      .eq('id', listing.id);

    if (updateError) {
      console.error('Error updating listing:', updateError);
      showError('Failed to update listing. Please try again.');
      return; 
    }

    // If any images were deleted or added, rebuild the images
    if (imagesToDelete.length > 0 || newImages.length > 0) {
      // Delete ALL existing images for this listing from database
      const { error: deleteAllError } = await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listing.id);

      if (deleteAllError) {
        console.error('Error deleting images:', deleteAllError);
        showError('Failed to update images. Please try again.');
        return;
      }

      // Re-insert the remaining existing images + new images
      const allImagesToInsert = [...existingImages, ...newImages];
      
      if (allImagesToInsert.length > 0) {
        const imagesToInsert = allImagesToInsert.map(url => ({
          listing_id: listing.id,
          image_url: url,
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error('Error adding images:', imagesError);
          showError('Failed to save images. Please try again.');
          return;
        }
      }
    }
    
    onUpdate?.();
    onClose();
  } catch (err) {
    console.error('Error updating listing:', err);
    showError('An unexpected error occurred. Please try again.');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async () => {
    if (deleting) return;

    setDeleting(true);
    try {
      // First delete associated images from listing_images
      const { error: imagesError } = await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listing.id);

      if (imagesError) {
        console.error('Error deleting listing images:', imagesError);
      }

      // Delete associated conversations and messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        
        await supabase
          .from('messages')
          .delete()
          .in('conversation_id', conversationIds);

        await supabase
          .from('conversations')
          .delete()
          .eq('listing_id', listing.id);
      }

      // Finally delete the listing
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id);

      if (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
        return;
      }

      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="edit-listing-overlay" onClick={onClose}>
      <div className="edit-listing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="edit-listing-content">
          <div className="edit-listing-image-section">
            {mainImage ? (
              <>
                <div className="main-image-container">
                  <img
                    src={mainImage}
                    alt={formData.title}
                    className="main-image"
                  />
                </div>
                {allImages.length > 1 && (
                  <div className="thumbnail-container">
                    {allImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${formData.title} ${idx + 1}`}
                        className={`thumbnail ${selectedImageIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-image-placeholder">
                <i className="fa fa-image"></i>
                <p>No images yet</p>
              </div>
            )}
          </div>

          <div className="edit-listing-form-section">
            <h2 className="edit-listing-header">
                Edit Listing
            </h2>

            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                    <option value="Services">Services</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Study Material">Study Material</option>
                    <option value="Clothing and Accessories">Clothing and Accessories</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Location</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item..."
                  rows="3"
                />
              </div>

              {/* Image Management Section */}
              <div className="form-group">
                <label>
                  Images
                </label>
                
                <div className="upload-section">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    Add Images
                  </label>
                </div>

                {errorMessage && (
                    <div className="form-error">
                        {errorMessage}
                    </div>
                )}

                {/* Image Grid with Delete Option */}
                {allImages.length > 0 && (
                  <div className="images-grid">
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="image-item">
                        <img src={img} alt={`Listing ${index + 1}`} />
                        <button
                          type="button"
                          className="close-btn image-close-btn"
                          onClick={() => handleRemoveExistingImage(index)}
                          title="Remove image"
                        >
                            &times;
                        </button>
                      </div>
                    ))}
                    {newImages.map((img, index) => (
                      <div key={`new-${index}`} className="image-item new-image">
                        <img src={img} alt={`New ${index + 1}`} />
                        <span className="new-badge">NEW</span>
                        <button
                          type="button"
                          className="close-btn image-close-btn"
                          onClick={() => handleRemoveNewImage(index)}
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                >
                  Delete Listing
                </button>
              </div>
            </form>

            {showDeleteConfirm && (
              <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
                <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Delete Listing</h3>
                  <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
                  <div className="delete-confirm-actions">
                    <button
                      className="cancel-delete-btn"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-delete-btn"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <i className="fa fa-spinner fa-spin"></i> Deleting...
                        </>
                      ) : (
                        'Yes, Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditListing;
