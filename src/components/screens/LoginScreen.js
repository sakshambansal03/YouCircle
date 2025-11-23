import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';
import logoImage from '../../images/youcircle_logo.png';
import { supabase } from "../../supabaseClient";

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@umass.edu")) {
      showError("Please use your @umass.edu email");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showError(error.message);
      return;
    }

    console.log("Logged in user:", data.user);
    navigate("/home");
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!signupData.email.endsWith("@umass.edu")) {
      showError("Please use your @umass.edu email");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          first_name: signupData.firstName,
          last_name: signupData.lastName,
        }
      }
    });

    if (error) {
      showError(error.message);
      return;
    }

    showError("Check your email to verify your UMass account");
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-screen">
      <div className="login-container">

        {/* Left - Promo */}
        <div className="promo-section">
          <div className="promo-content">
            <img src={logoImage} alt="YouCircle Logo" className="promo-logo" />
            <h1 className="promo-title">Your Campus Marketplace, Simplified</h1>
            <p className="promo-tagline">
              Connect with verified students to buy, sell, trade, and share services safely within your campus community.
            </p>
            {/* Feature Cards */}
            <div className="feature-cards">
              {/* Card 1 */}
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Verified Community</h3>
                  <p>Access restricted to verified university email addresses for maximum safety</p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Easy Discovery</h3>
                  <p>Browse tutoring, rides, services, and marketplace items all in one place</p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 10V3H14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Save Time & Money</h3>
                  <p>Affordable peer-to-peer transactions within your campus community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="form-section">
          <div className="login-box">
            <div className="tab-container">
              <button 
                className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button 
                className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="form-error">
                {errorMessage}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                  />
                </div>
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <a href="#" className="forgot-password">Forgot password?</a>
                <button type="submit" className="login-button">Sign In</button>
                <button type="button" className="browse-button">Just browsing?</button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="login-form">
                <div className="input-row">
                  <div className="input-group">
                    <input
                      type="text"
                      name="firstName"
                      value={signupData.firstName}
                      onChange={handleSignupChange}
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="you@university.edu"
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="Create a password"
                    required
                  />
                </div>
                <button type="submit" className="login-button">Create Account</button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginScreen;
