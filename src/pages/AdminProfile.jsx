import React, { useState, useEffect } from 'react';
import './AdminProfile.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db, auth } from '../firebase.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function AdminProfile({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Admin / Landlord profile data from Firebase Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // If a user is logged in via Firebase Auth, fetch their document by UID
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setProfileData(userSnap.data());
          }
        } else {
          // Fallback: Fetch the first profile from 'users' collection if no auth session is active
          const querySnapshot = await getDocs(collection(db, 'users'));
          if (!querySnapshot.empty) {
            setProfileData(querySnapshot.docs[0].data());
          }
        }
      } catch (error) {
        console.error('Error fetching admin profile: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="admin-profile-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src='images/Vector.png' alt="Search"></img></span>
            <input type="text" placeholder="Search" />
          </div>
          <button 
            className="icon-btn notification-btn" 
            aria-label="Notifications"
            onClick={() => onNavigate('notifications')}
          >
            <img src="/images/n.png" alt="Notifications" style={{ height: '22px', objectFit: 'contain' }} />
          </button>
          <button 
            className="icon-btn menu-btn" 
            aria-label="Menu"
            onClick={() => setIsMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* --- SIDE MENU DRAWER --- */}
      <SideMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      {/* --- MAIN CONTENT --- */}
      <main className="admin-profile-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Profile</h2>
        </div>
        <hr />

        {/* ADMIN PROFILE CARD */}
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Loading profile...</p>
        ) : (
          <div className="admin-profile-card">
            <div className="admin-card-header">
              <div>
                <span className="landlord-tag">Landlord</span>
                <h3>
                  {profileData ? `${profileData.name || ''} ${profileData.surname || ''}`.trim() || 'Sandeep Ghige' : 'Sandeep Ghige'}
                </h3>
              </div>
              <div className="admin-card-actions">
                <button className="action-edit-btn" aria-label="Edit Profile">
                  <img src="images/edit.png" alt="Edit Profile" />
                </button>
                <button className="action-delete-btn" aria-label="Delete Profile">
                  <img src="images/delete.png" alt="Delete Profile" />
                </button>
              </div>
            </div>

            <div className="admin-details-body">
              <p>{profileData?.mobile || '9822886696'}</p>
              <p>{profileData?.email || 'sandeep.ghige@outlook.com'}</p>
              <p>
                {profileData?.city && profileData?.state 
                  ? `${profileData.city}, ${profileData.state}` 
                  : 'Akurdi, Pune, Maharashtra'}
              </p>
              <p>{profileData?.pinCode || profileData?.pincode || '411035'}</p>
            </div>
          </div>
        )}
        
        <hr />

        {/* ACTION BUTTONS */}
        <div className="admin-action-buttons">
          <button className="add-landlord-btn" onClick={() => onNavigate('addLandlord')}>Add Landlord</button>
          <button className="add-manager-btn" onClick={() => onNavigate('addManager')}>Add Manager</button>
          <button className="add-collector-btn" onClick={() => onNavigate('addCollector')}>Add Collector</button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="profile" />
    </div>
  );
}