import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });
    // Navigate to home page after successful login
    navigate('/home');
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
          <p>Don't have an account? <a href="#" className="signup-link">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
