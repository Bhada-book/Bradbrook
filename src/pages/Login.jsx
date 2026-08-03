import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // State to track error messages for each field
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = () => {
    // Clear previous mobile error
    setMobileError('');

    if (mobile.length === 10) {
      setOtpSent(true);
      alert('OTP sent to ' + mobile); // Or replace with your success banner
    } else {
      setMobileError('Please enter a valid 10-digit mobile number');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    let isValid = true;

    // Validate mobile number
    if (mobile.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
      isValid = false;
    } else {
      setMobileError('');
    }

    // Validate OTP
    if (otp.length !== 6) {
      setOtpError('OTP must be exactly 6 digits');
      isValid = false;
    } else {
      setOtpError('');
    }

    // If both are valid, proceed to home page
    if (isValid) {
      onLoginSuccess();
    }
  };

  return (
    <div className="login-page-container">
      {/* Top Rounded Red Header Card */}
      <div className="login-header-card">
        <div className="header-content">
            <img src="/images/blogo.png" style={{ height: '120px', paddingTop: '15px' }} alt="Logo" />
            <div className="badge-text">
              <img src="/images/logor.png" style={{ height: '100px', paddingTop: '25px' }} alt="Logo Text" />
            </div>
        </div>
      </div>

      {/* Bottom Form Section */}
      <div className="login-form-section">
        
        {/* Google Continue Button */}
        <button className="google-btn" onClick={onLoginSuccess} type="button">
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo" 
            className="google-icon" 
          />
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {/* Mobile Number Input */}
          <div className="input-group">
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ''));
                if (mobileError) setMobileError(''); // Clear error as user types
              }}
              maxLength={10}
              required
            />
            {/* Mobile Error Message */}
            {mobileError && <span className="error-text">{mobileError}</span>}
          </div>

          {/* OTP Input with Send OTP */}
          <div className="input-group otp-group">
            <div className="otp-input-wrapper" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="OTP" 
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if (otpError) setOtpError(''); // Clear error as user types
                  }}
                  maxLength={6}
                  required
                />
                <button type="button" className="send-otp-btn" onClick={handleSendOtp}>
                  Send OTP
                </button>
              </div>
              {/* OTP Error Message */}
              {otpError && <span className="error-text">{otpError}</span>}
            </div>
          </div>
          
          <span className="resend-text" onClick={handleSendOtp}>Resend OTP</span>

          {/* Log In Button */}
          <button type="submit" className="login-submit-btn">
            Log In
          </button>
        </form>

        <div className="signup-footer">
          Don't have an account?{' '}
          <span className="signup-link" onClick={onNavigateToRegister}>
            Sign Up
          </span>
        </div>

      </div>
    </div>
  );
}