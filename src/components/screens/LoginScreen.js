import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });
    // Navigate to home page after successful login
    navigate('/home');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempt:', signupData);
    // Add your signup logic here
    // For now, just navigate to home after signup
    navigate('/home');
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };


  return (
    <div className="login-screen">
      <div className="login-box">
        <h1 className="login-title">YouCircle</h1>
        <h2 className="login-subtitle">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        <div className="login-footer">
          <p>Don't have an account? <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setShowSignup(true); }}>Sign up</a></p>
        </div>
      </div>

      {/* Signup Dialog */}
      {showSignup && (
        <div className="signup-overlay">
          <div className="signup-box">
            <div className="signup-header">
              <h1 className="signup-title">Create Account</h1>
              <button className="close-btn" onClick={() => setShowSignup(false)}>×</button>
            </div>
            <form onSubmit={handleSignupSubmit} className="signup-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="signupUsername">Username</label>
                <input
                  type="text"
                  id="signupUsername"
                  name="username"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="signupPassword">Password</label>
                <input
                  type="password"
                  id="signupPassword"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Create a password"
                  required
                />
              </div>
              <button type="submit" className="signup-button">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginScreen;
