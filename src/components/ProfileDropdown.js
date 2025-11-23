import React, { useState } from 'react';
import './ProfileDropdown.css';
import { useAuth } from '../contexts/AuthContext';

function ProfileDropdown({ profile, onClose }) {
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    username: profile?.username || '',
    phone: profile?.phone || '',
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateUserProfile({
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        password: formData.password || undefined, // Only include if provided
      });

      if (result.success) {
        setSuccess(true);
        // Clear password field on success
        setFormData({ ...formData, password: '' });
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = () => {
    if (!formData.name) return 'U';
    return formData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-dropdown-backdrop" onClick={onClose}></div>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>Profile</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="profile-modal-body">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {getUserInitials()}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-group">
              <label>
                <i className="fa fa-user"></i>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="profile-form-group">
              <label>
                <i className="fa fa-envelope"></i>
                College Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                title="Email cannot be changed"
              />
            </div>
            
            <div className="profile-form-group">
              <label>
                <i className="fa fa-user"></i>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            
            <div className="profile-form-group">
              <label>
                <i className="fa fa-phone"></i>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="profile-form-group">
              <label>
                <i className="fa fa-key"></i>
                Change Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New password (optional)"
              />
            </div>
            
            {error && (
              <div className="profile-error-message">
                <i className="fa fa-exclamation-circle"></i> {error}
              </div>
            )}
            {success && (
              <div className="profile-success-message">
                <i className="fa fa-check-circle"></i> Profile updated successfully!
              </div>
            )}
            <button 
              type="submit" 
              className="save-changes-button"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileDropdown;

