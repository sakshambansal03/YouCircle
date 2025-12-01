import React, { useState } from "react";
import "./Header.css";
import { useAuth } from "../contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

export default function Header({ searchQuery = '', onSearchChange, hideSearch = false }) {
  const { userProfile } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const getUserInitials = () => {
    if (!userProfile?.name) return "U";
    return userProfile.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="home-header">
      <div className="home-logo">YouCircle</div>

      {!hideSearch && (
        <div className="home-search-bar">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search for services, items, or tutors..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      )}

      <div
        className="home-avatar"
        onClick={() => setShowProfile(true)}
        style={{ cursor: "pointer" }}
      >
        {getUserInitials()}
      </div>

      {showProfile && (
        <ProfileDropdown
          profile={userProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </header>
  );
}