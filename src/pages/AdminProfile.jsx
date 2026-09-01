import React, { useState, useEffect } from 'react';
import './AdminProfile.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { handleRoleBasedDelete } from '../approvalHelper.js';
import Navbar from './navbar.jsx';

export default function AdminProfile({ onBack, onNavigate, onEditProfile }) {

  const [profilesData, setProfilesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsData, setNotificationsData] = useState([]);

  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';
  const loggedInUser = JSON.parse(localStorage.getItem('userData') || '{}');

  // Fetch profiles from all 3 collections in real-time
  useEffect(() => {
    let cache = { users: [], managers: [], collectors: [] };

    const updateCombinedProfiles = (data, type) => {
      cache[type] = data;
      const combined = [...cache.users, ...cache.managers, ...cache.collectors];
      
      // If user is Admin/Landlord, show all profiles. Otherwise, filter to show only their own profile.
      if (isAdmin) {
        setProfilesData(combined);
      } else {
        const filtered = combined.filter(profile => 
          profile.id === loggedInUser.id || 
          (profile.email && loggedInUser.email && profile.email.toLowerCase() === loggedInUser.email.toLowerCase()) ||
          (profile.mobile && loggedInUser.mobile && profile.mobile === loggedInUser.mobile)
        );
        setProfilesData(filtered);
      }
      
      setLoading(false);
    };

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(d => ({ id: d.id, ...d.data(), role: 'Landlord', collectionName: 'users' }));
      updateCombinedProfiles(users, 'users');
    }, (error) => console.error("Error fetching users:", error));

    const unsubManagers = onSnapshot(collection(db, 'managers'), (snapshot) => {
      const managers = snapshot.docs.map(d => ({ id: d.id, ...d.data(), role: 'Manager', collectionName: 'managers' }));
      updateCombinedProfiles(managers, 'managers');
    }, (error) => console.error("Error fetching managers:", error));

    const unsubCollectors = onSnapshot(collection(db, 'collectors'), (snapshot) => {
      const collectors = snapshot.docs.map(d => ({ id: d.id, ...d.data(), role: 'Collector', collectionName: 'collectors' }));
      updateCombinedProfiles(collectors, 'collectors');
    }, (error) => console.error("Error fetching collectors:", error));

    return () => {
      unsubUsers();
      unsubManagers();
      unsubCollectors();
    };
  }, [isAdmin, loggedInUser.id, loggedInUser.email, loggedInUser.mobile]);

  // Fetch notifications for the Navbar
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'notifications'));
        const notifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotificationsData(notifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Delete profile from Firestore
  const handleDelete = async (profile) => {
    await handleRoleBasedDelete(
      userRole, 
      loggedInUser, 
      profile.collectionName, 
      profile.id, 
      `${profile.name || ''} ${profile.surname || ''}`
    );
  };

  // Handle Edit click
  const handleEdit = (profile) => {
    if (onEditProfile) {
      onEditProfile(profile); 
    }

    if (profile.role === 'Landlord' || profile.role === 'Admin/Landlord') {
      onNavigate('adminDetail'); 
    } else if (profile.role === 'Manager') {
      onNavigate('addManager');
    } else if (profile.role === 'Collector') {
      onNavigate('addCollector');
    }
  };

  return (
    <div className="admin-profile-container">
      {/* --- TOP NAVBAR --- */}
      <Navbar notificationsData={notificationsData} onNavigate={onNavigate} />

      {/* --- MAIN CONTENT --- */}
      <main className="admin-profile-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Profile</h2>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '12px 0 16px 0' }} />

        {/* PROFILES LIST CARDS */}
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Loading profiles...</p>
        ) : profilesData.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No profile found.</p>
        ) : (
          profilesData.map((profile) => (
            <div className="admin-profile-card" key={profile.id} style={{ marginBottom: '16px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
              <div className="admin-card-header">
                <div>
                  <span className="landlord-tag">{profile.role}</span>
                  <h3>{profile.name} {profile.surname}</h3>
                </div>
                <div className="admin-card-actions">
                  <button className="action-edit-btn" aria-label="Edit" onClick={() => handleEdit(profile)}>
                    <img src='images/edit.png' alt="Edit" style={{ width: '16px', height: '16px' }} />
                  </button>
                  {isAdmin && (
                    <button className="action-delete-btn" aria-label="Delete" onClick={() => handleDelete(profile)}>
                      <img src='images/delete.png' alt="Delete" style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-details-body">
                <p>{profile.mobile || profile.phone || 'N/A'}</p>
                {profile.email && <p>{profile.email}</p>}
                {(profile.address || profile.city || profile.state || profile.pincode) && (
                  <p>
                    {[profile.address, profile.city, profile.state].filter(Boolean).join(', ')}
                    {profile.pincode ? `\n${profile.pincode}` : ''}
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {/* ACTION BUTTONS (As requested, buttons remain visible) */}
        <div className="admin-action-buttons">
          <button 
            className="add-landlord-btn" 
            onClick={() => { if(onEditProfile) onEditProfile(null); onNavigate('adminDetail'); }}
          >
            Add Landlord
          </button>

          <button 
            className="add-manager-btn" 
            onClick={() => { if(onEditProfile) onEditProfile(null); onNavigate('addManager'); }}
          >
            Add Manager
          </button>

          <button 
            className="add-collector-btn" 
            onClick={() => { if(onEditProfile) onEditProfile(null); onNavigate('addCollector'); }}
          >
            Add Collector
          </button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="profile" />
    </div>
  );
}