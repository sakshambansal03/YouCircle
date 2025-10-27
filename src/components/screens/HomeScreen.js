import React from 'react';
import './HomeScreen.css';
import ListingCard from '../ListingCard.js'

function HomeScreen() {
  const listings = [
    {
      title: "Calculus Tutoring - Ace Your Exams",
      category: "Tutoring",
      categoryClass: "tutoring",
      description: "Experienced math tutor offering one-on-one calculus help.",
      seller: "Sarah Chen",
      price: 25
    },
    {
      title: "Used iPhone 13 - Excellent Condition",
      category: "Electronics",
      categoryClass: "electronics",
      description: "Selling my iPhone 13 in great condition. Includes charger and case.",
      seller: "John Doe",
      address: 'Pick up at JQA Hall, Southwest',
      price: 500
    },
    {
      title: "Haircut Services",
      category: "Services",
      categoryClass: "services",
      description: "Get professional haircut services from a certified stylist.",
      seller: "Matthew Zhang",
      address: 'McKimmie Hall, Southwest',
      price: 25
    },
    {
      title: "Selling a bicycle",
      category: "Classifieds",
      categoryClass: "classifieds",
      description: "I am selling my bicycle for $75. It is in great condition and has been well maintained.",
      seller: "Joe White",
      address: 'Pick up at Dwight Hall, Northeast',
      price: 75
    }
  ];

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-logo">YouCircle</div>
        <div className="home-search-bar">
          <i className="fa fa-search"></i>
          <input type="text" placeholder="Search for services, items, or tutors..." />
        </div>
        <div className="home-avatar">AJ</div>
      </header>

      <h2 className="recent-listings-title">Recent Listings</h2>

      <div className="listings-container">
        {listings.map((item, index) => (
          <ListingCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;