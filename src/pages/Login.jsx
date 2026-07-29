import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (mobile.length === 10) {
      setOtpSent(true);
      alert('OTP sent to ' + mobile);
    } else {
      alert('Please enter a valid 10-digit mobile number');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Trigger login success to switch to the dashboard view
    onLoginSuccess();
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
        <button className="google-btn" onClick={onLoginSuccess}>
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
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          {/* OTP Input with Send OTP */}
          <div className="input-group otp-group">
            <input 
              type="text" 
              placeholder="OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button type="button" className="send-otp-btn" onClick={handleSendOtp}>
              Send OTP
            </button>
          </div>
          
          <span className="resend-text">Resend OTP</span>

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