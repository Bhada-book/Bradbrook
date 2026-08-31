import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js'; 
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [confirmationResultObj, setConfirmationResultObj] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);

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

  // Helper function to find user role & profile across collections by mobile number
 // Helper function to find user role & profile across collections by mobile number
  const identifyUserRoleAndSave = async (mobileNum) => {
    let role = 'Admin/Landlord';
    let profileData = { mobile: mobileNum };

    // 1. Check 'users' (Admin)
    const userRef = doc(db, 'users', mobileNum);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      role = 'Admin/Landlord';
      profileData = { id: userSnap.id, ...userSnap.data() };
    } else {
      // 2. Check 'managers'
      const managersRef = collection(db, 'managers');
      const managerQuery = query(managersRef, where('mobile', '==', mobileNum));
      const managerSnap = await getDocs(managerQuery);
      if (!managerSnap.empty) {
        role = 'Manager';
        profileData = { id: managerSnap.docs[0].id, ...managerSnap.docs[0].data() };
      } else {
        // 3. Check 'collectors'
        const collectorsRef = collection(db, 'collectors');
        const collectorQuery = query(collectorsRef, where('mobile', '==', mobileNum));
        const collectorSnap = await getDocs(collectorQuery);
        if (!collectorSnap.empty) {
          role = 'Collector';
          profileData = { id: collectorSnap.docs[0].id, ...collectorSnap.docs[0].data() };
        } else {
          // 4. Check 'tenants' (नवीन जोडलेले)
          const tenantsRef = collection(db, 'tenants');
          // काही डेटाबेसमधून mobile ऐवजी phone फील्ड सुद्धा असू शकते, म्हणून दोन्ही तपासावे
          const tenantQueryMobile = query(tenantsRef, where('mobile', '==', mobileNum));
          let tenantSnap = await getDocs(tenantQueryMobile);
          
          if (tenantSnap.empty) {
            const tenantQueryPhone = query(tenantsRef, where('phone', '==', mobileNum));
            tenantSnap = await getDocs(tenantQueryPhone);
          }

          if (!tenantSnap.empty) {
            role = 'Tenant';
            profileData = { id: tenantSnap.docs[0].id, ...tenantSnap.docs[0].data() };
          }
        }
      }
    }

    // Save session info to localStorage for global permission handling
    localStorage.setItem('userRole', role);
    localStorage.setItem('userData', JSON.stringify(profileData));
    localStorage.setItem('allowedProperties', JSON.stringify(profileData.allowedProperties || []));
  };

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

      localStorage.setItem('userRole', 'Admin/Landlord');
      onLoginSuccess();
    } catch (error) {
      console.error('Google login error: ', error);
      alert('Google Login failed: ' + error.message);
    }
  };

 const handleSendOtp = async () => {
    setMobileError('');

    if (mobile.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      let exists = false;
      const userSnap = await getDoc(doc(db, 'users', mobile));
      if (userSnap.exists()) {
        exists = true;
      } else {
        const mSnap = await getDocs(query(collection(db, 'managers'), where('mobile', '==', mobile)));
        if (!mSnap.empty) {
          exists = true;
        } else {
          const cSnap = await getDocs(query(collection(db, 'collectors'), where('mobile', '==', mobile)));
          if (!cSnap.empty) {
            exists = true;
          } else {
            // Check in tenants collection
            const tSnapMobile = await getDocs(query(collection(db, 'tenants'), where('mobile', '==', mobile)));
            const tSnapPhone = await getDocs(query(collection(db, 'tenants'), where('phone', '==', mobile)));
            if (!tSnapMobile.empty || !tSnapPhone.empty) {
              exists = true;
            }
          }
        }
      }

      if (exists) {
        setIsTestMode(true);
        setOtpSent(true);
        alert('Test mode active! Use OTP: 000000 to log in.');
        return;
      }

      setIsTestMode(false);
      const phoneNumber = '+91' + mobile; 
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResultObj(confirmationResult);
      setOtpSent(true);
      alert('OTP sent successfully to ' + mobile);
    } catch (error) {
      console.error('Error sending OTP code:', error);
      setMobileError('Failed to send OTP: ' + error.message);
    }
  };

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
        if (otp === '000000') {
          await identifyUserRoleAndSave(mobile);
          onLoginSuccess();
          return;
        } else {
          setOtpError('Invalid Test OTP. Please use 000000.');
          return;
        }
      }

      await confirmationResultObj.confirm(otp);
      await identifyUserRoleAndSave(mobile);
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
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="google-icon" />
          <span>Continue with Google</span>
        </button>

        <div className="divider"><span>or</span></div>

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
                <button type="button" className="send-otp-btn" onClick={handleSendOtp}>Send OTP</button>
              </div>
              {otpError && <span className="error-text">{otpError}</span>}
            </div>
          </div>
          
          <span className="resend-text" onClick={handleSendOtp}>Resend OTP</span>
          <button type="submit" className="login-submit-btn">Log In</button>
        </form>

        <div className="signup-footer">
          Don't have an account? <span className="signup-link" onClick={onNavigateToRegister}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}