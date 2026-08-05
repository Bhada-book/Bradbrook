import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js'; 
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [confirmationResultObj, setConfirmationResultObj] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false); // Flag for test phone numbers

  // Initialize reCAPTCHA container for Phone Auth
  useEffect(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {}
    });

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Handle Google / Gmail Login
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const nameParts = (user.displayName || '').split(' ');
        await setDoc(userRef, {
          uid: user.uid,
          name: nameParts[0] || '',
          surname: nameParts.slice(1).join(' ') || '',
          mobile: user.phoneNumber || '',
          email: user.email || '',
          createdAt: new Date()
        });
      }

      onLoginSuccess();
    } catch (error) {
      console.error('Google login error: ', error);
      alert('Google Login failed: ' + error.message);
    }
  };

  // Handle Sending Mobile OTP (Checks if registered in Firestore for 000000 bypass)
  const handleSendOtp = async () => {
    setMobileError('');

    if (mobile.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      // Check if the number exists in your Firestore 'users' collection
      const userRef = doc(db, 'users', mobile);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // If registered in Firestore, enable test mode bypass with '000000'
        setIsTestMode(true);
        setOtpSent(true);
        alert('Test mode active! Use OTP: 000000 to log in.');
        return;
      }

      // Otherwise, proceed with standard Firebase Phone Authentication
      setIsTestMode(false);
      const phoneNumber = '+91' + mobile; 
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResultObj(confirmationResult);
      setOtpSent(true);
      alert('OTP sent successfully to ' + mobile);
    } catch (error) {
      console.error('Error sending OTP code:', error);
      
      if (error.code === 'auth/quota-exceeded') {
        setMobileError('SMS quota exceeded for today. Please try again tomorrow.');
      } else if (error.code === 'auth/invalid-phone-number') {
        setMobileError('The phone number format is invalid.');
      } else {
        setMobileError('Failed to send OTP: ' + error.message);
      }
    }
  };

  // Handle OTP Verification & Login
  const handleLogin = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (mobile.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
      isValid = false;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be exactly 6 digits');
      isValid = false;
    }

    if (!isValid) return;

    try {
      if (isTestMode) {
        // Bypass Firebase Auth confirmation step if test mode is enabled for registered users
        if (otp === '000000') {
          const userRef = doc(db, 'users', mobile);
          await updateDoc(userRef, { mobile: mobile });
          onLoginSuccess();
          return;
        } else {
          setOtpError('Invalid Test OTP. Please use 000000.');
          return;
        }
      }

      // Standard Firebase OTP Confirmation flow
      const result = await confirmationResultObj.confirm(otp);
      const user = result.user;

      const userRef = doc(db, 'users', mobile);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          mobile: mobile,
          createdAt: new Date()
        });
      } else {
        await updateDoc(userRef, { mobile: mobile });
      }

      onLoginSuccess();
    } catch (error) {
      console.error('Invalid OTP: ', error);
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="login-page-container">
      <div id="recaptcha-container"></div>

      <div className="login-header-card">
        <div className="header-content">
            <img src="/images/blogo.png" style={{ height: '120px', paddingTop: '15px' }} alt="Logo" />
            <div className="badge-text">
              <img src="/images/logor.png" style={{ height: '100px', paddingTop: '25px' }} alt="Logo Text" />
            </div>
        </div>
      </div>

      <div className="login-form-section">
        
        <button className="google-btn" onClick={handleGoogleLogin} type="button">
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
          <div className="input-group">
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                if (mobileError) setMobileError('');
              }}
              maxLength={10}
              required
            />
            {mobileError && <span className="error-text">{mobileError}</span>}
          </div>

          <div className="input-group otp-group">
            <div className="otp-input-wrapper" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="OTP" 
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError('');
                  }}
                  maxLength={6}
                  required
                />
                <button type="button" className="send-otp-btn" onClick={handleSendOtp}>
                  Send OTP
                </button>
              </div>
              {otpError && <span className="error-text">{otpError}</span>}
            </div>
          </div>
          
          <span className="resend-text" onClick={handleSendOtp}>Resend OTP</span>

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