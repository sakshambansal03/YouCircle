# YouCircle

YouCircle is a peer-to-peer campus marketplace where students can easily discover, book, and offer services, as well as purchase items directly from other students. By fostering affordability, convenience, and trust, YouCircle strengthens student connections while saving time and enhancing campus life and resources.

👉 The app is live at: https://youcircle.netlify.app

## Project Objective
YouCircle's main goal is to create a safe, student-driven ecosystem that allows peers to exchange services and goods easily. The platform aims to address the common challenges college students face — finding affordable, trustworthy, and accessible options for tutoring, personal services, and item exchanges, all within a verified student environment.

## Motivation
Existing platforms like Facebook Marketplace, Craigslist, or Snapchat Marketplace often fall short for student users. They can be:

-> Too broad and not campus-focused

-> Prone to scams or unverified users

-> Difficult to navigate for localized, student-centric needs

YouCircle solves this by fostering a campus-only community where trust is built on verified student identities and safe in-app interactions.

## Core Features 

- **Student-verified authentication** using Supabase restricted to `.edu` domains  
- **Listing creation, editing, and deletion**, with full image upload support  
- **Dedicated listing page** showing item details, seller information, and an option to message the seller  
- **Category-based filtering and keyword search** for quick service and item discovery  
- **Real-time messaging** between students using Supabase Realtime  
- **User-specific pages** such as *Your Listings* and *Sold Listings*  
- **Secure database operations** for storing listings, messages, and user metadata  

## Steps to Run the Project

Follow these steps to run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/sakshambansal03/YouCircle.git
```
### 2. Naivgate to the local project repository using the terminal
```bash
cd your-repo-name
```
### Install Dependencies
Make sure you have Node.js and npm installed. If not, 
```bash
npm install
```

### Start the Development Server
```bash
npm start
```

### Open in Your Browser
Once the app starts, it will automatically open in your default browser.
If not, visit:
👉 http://localhost:3000

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### ⚠️ Supabase Environment Keys Required

To run YouCircle locally, you must provide your own Supabase environment variables 
(`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, etc.).  
These keys are not included in the repository for security purposes.

If you need access for development or testing, please contact the project owner 
to request the required credentials.

For more details about the backend architecture, database design, and API usage, please refer to **Backend-Summary.md**.

## Frontend and Backend Summary

To learn more about the frontend and backend for this app, please read `Frontend-summary.md` and `Backend-summary.md`
