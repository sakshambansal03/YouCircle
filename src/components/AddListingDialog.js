import React, { useState, useEffect } from 'react';
import './AddListingDialog.css';
import { useAuth } from '../contexts/AuthContext';

function AddListingDialog({ onClose, onAdd }) {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    seller: userProfile?.name || '',
    address: '',
    price: '',
    images: []
  });

  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    if (userProfile?.name) {
      setForm(prev => ({ ...prev, seller: userProfile.name }));
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Process all files and collect their data URLs
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

    // Wait for all files to be read, then update state once
    Promise.all(filePromises)
      .then((dataURLs) => {
        setForm((prevForm) => ({
          ...prevForm,
          images: [...prevForm.images, ...dataURLs]
        }));
      })
      .catch(() => {
        // Error already handled in individual file processing
      });

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const updatedImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updatedImages });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.seller || !form.price || form.images.length === 0) {
      showError("Please fill all required fields");
      return;
    }
    onAdd({
      ...form,
      price: Number(form.price),
      categoryClass: form.category.toLowerCase(),
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close-btn" onClick={onClose}>
          &times;
        </button>
        
        <h2 className="dialog-title">Add New Listing</h2>

        {errorMessage && (
              <div className="form-error">
                {errorMessage}
              </div>
            )}

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-group">
            <label htmlFor="title" className="required">
              <i className="fa fa-heading"></i> Title
            </label>
            <input
              id="title"
              name="title"
              placeholder="Enter listing title"
              value={form.title}
              onChange={handleChange}
              // required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="required">
              <i className="fa fa-tag"></i> Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="category-dropdown"
            >
              <option value="" disabled hidden>Select a category</option>
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
              <label htmlFor="seller">
                <i className="fa fa-user"></i> Seller Name
              </label>
              <input
                id="seller"
                name="seller"
                placeholder="Your name"
                value={form.seller}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="required">
                <i className="fa fa-dollar-sign"></i> Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                placeholder="0"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                // required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              <i className="fa fa-map-marker"></i> Pick-up Address
            </label>
            <input
              id="address"
              name="address"
              placeholder="Optional: Where can buyers pick this up?"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <i className="fa fa-align-left"></i> Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your listing in detail"
              value={form.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="images-label required">
              <i className="fa fa-images"></i> Images
            </label>
            
            {/* File Upload Button */}
            <div className="upload-section">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="file-input"
                // required
              />
              <label htmlFor="file-upload" className="upload-btn">
                <i className="fa fa-upload"></i> Upload from Device
              </label>
            </div>

            {/* Image Previews */}
            {form.images.length > 0 && (
              <div className="images-preview-container">
                {form.images.map((img, index) => (
                  <div key={index} className="image-item">
                    <div className="image-preview-wrapper">
                      <img src={img} alt={`Preview ${index + 1}`} className="image-preview" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dialog-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <i className="fa fa-check"></i> Add Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddListingDialog;
