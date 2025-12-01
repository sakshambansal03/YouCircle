import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideDrawer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faList, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function SideDrawer({ unreadCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation(); 

  const drawerItems = [
    { title: "Browse All", path: "/home", icon: faBagShopping },
    { title: "Your Listings", path: "/listings", icon: faList },
    { title: "Messages", path: "/messages", icon: faEnvelope, badge: unreadCount },
  ];

  return (
    <div className="side-drawer">
      <h2 className="drawer-title">Menu</h2>

      {drawerItems.map((item) => (
        <div
          key={item.path}
          className={`drawer-item ${location.pathname === item.path ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          <FontAwesomeIcon icon={item.icon} className="drawer-icon" />
          <span className="drawer-item-text">{item.title}</span>
          {item.badge > 0 && (
            <span className="drawer-badge">{item.badge > 99 ? '99+' : item.badge}</span>
          )}
        </div>
      ))}
    </div>
  );
}
