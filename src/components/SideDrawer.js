import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideDrawer.css";

export default function SideDrawer() {
  const navigate = useNavigate();
  const location = useLocation(); 

  return (
    <div className="side-drawer">
      <h2 className="drawer-title">Menu</h2>

      <div
        className={`drawer-item ${location.pathname === "/home" ? "active" : ""}`}
        onClick={() => navigate("/home")}
      >
        Browse All
      </div>

      <div
        className={`drawer-item ${
          location.pathname === "/listings" ? "active" : ""
        }`}
        onClick={() => navigate("/listings")}
      >
        Your Listings
      </div>

      <div
        className={`drawer-item ${location.pathname === "/messages" ? "active" : ""}`}
        onClick={() => navigate("/messages")}
      >
        Messages
      </div>
    </div>
  );
}
