import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './YourListings.css';
import Header from '../Header';
import SideDrawer from '../SideDrawer';

function YourListings() {
    return (
        <div className="listings-screen">
              <Header />
              <SideDrawer />
        </div>
    );
}

export default YourListings;
