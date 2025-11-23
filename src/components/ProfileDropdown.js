import React, { useState } from 'react';
import './ProfileDropdown.css';

function ProfileDropdown({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    username: profile.username || '',
    phone: profile.phone || '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
                onChange={handleChange}
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
            
            <button type="submit" className="save-changes-button">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileDropdown;

