import React, { useState, useEffect } from 'react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage(''); // Clear success message if showing

    // Start fade-out just before clearing
    setTimeout(() => {
      const errorElement = document.querySelector('.form-error');
      if (errorElement) errorElement.classList.add('fade-out');
    }, 4500);

    // Clear message completely after 5s
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage(''); // Clear error message if showing

    // Start fade-out just before clearing
    setTimeout(() => {
      const successElement = document.querySelector('.form-success');
      if (successElement) successElement.classList.add('fade-out');
    }, 4500);

    // Clear message completely after 5s
    setTimeout(() => setSuccessMessage(''), 5000);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!forgotPasswordEmail.endsWith("@umass.edu")) {
      showError("Please use your @umass.edu email");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      showError(error.message);
      return;
    }

    setForgotPasswordSent(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    if (resetPasswordData.password.length < 6) {
      showError("Password must be at least 6 characters long");
      return;
    }

    // Check if user has a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showError("Session expired. Please request a new reset link.");
      setShowResetPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: resetPasswordData.password
    });

    if (error) {
      showError(error.message);
      return;
    }

    // Success - sign out user so they can login with new password
    await supabase.auth.signOut();
    
    // Show success message and close modal
    setErrorMessage('');
    setShowResetPassword(false);
    setResetPasswordData({ password: '', confirmPassword: '' });
    showSuccess("Password reset successfully! You can now login with your new password.");
    
    // Switch to login tab
    setActiveTab('login');
  };

  // Check if user is coming from password reset link
  useEffect(() => {
    const checkPasswordReset = async () => {
      // Check URL hash for password reset token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          // Exchange the tokens for a session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            showError(error.message || 'Invalid or expired reset link');
            return;
          }

          // Session established successfully, show reset password form
          setShowResetPassword(true);
          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname);
        } catch (err) {
          showError('Failed to process reset link. Please request a new one.');
        }
      }
    };
    checkPasswordReset();
  }, []);

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
            {/* Success Message */}
            {successMessage && (
              <div className="form-success">
                {successMessage}
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
                <a 
                  href="#" 
                  className="forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                >
                  Forgot password?
                </a>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="forgot-password-backdrop" onClick={() => {
            setShowForgotPassword(false);
            setForgotPasswordSent(false);
            setForgotPasswordEmail('');
          }}></div>
          <div className="forgot-password-box">
            <button 
              className="forgot-password-close"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordSent(false);
                setForgotPasswordEmail('');
              }}
            >
              ×
            </button>
            {!forgotPasswordSent ? (
              <>
                <h2>Reset Password</h2>
                <p className="forgot-password-text">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword} className="forgot-password-form">
                  <div className="input-group">
                    <div className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="you@umass.edu"
                      required
                    />
                  </div>
                  {errorMessage && (
                    <div className="form-error">{errorMessage}</div>
                  )}
                  <button type="submit" className="login-button">
                    Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              <div className="forgot-password-success">
                <div className="success-icon">✓</div>
                <h2>Check Your Email</h2>
                <p>
                  We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                </p>
                <p className="success-note">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <button 
                  className="login-button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordSent(false);
                    setForgotPasswordEmail('');
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="forgot-password-modal">
          <div className="forgot-password-backdrop" onClick={() => setShowResetPassword(false)}></div>
          <div className="forgot-password-box">
            <button 
              className="forgot-password-close"
              onClick={() => setShowResetPassword(false)}
            >
              ×
            </button>
            <h2>Set New Password</h2>
            <p className="forgot-password-text">
              Please enter your new password below.
            </p>
            <form onSubmit={handleResetPassword} className="forgot-password-form">
              <div className="input-group">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <input
                  type="password"
                  value={resetPasswordData.password}
                  onChange={(e) => setResetPasswordData({
                    ...resetPasswordData,
                    password: e.target.value
                  })}
                  placeholder="New password (min 6 characters)"
                  required
                  minLength={6}
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
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({
                    ...resetPasswordData,
                    confirmPassword: e.target.value
                  })}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              {errorMessage && (
                <div className="form-error">{errorMessage}</div>
              )}
              <button type="submit" className="login-button">
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginScreen;
