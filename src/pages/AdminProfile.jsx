import React, { useState, useEffect } from 'react';
import './AdminProfile.css';
import './TenantList.css'; // Added for table styles
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function AdminProfile({ onBack, onNavigate, onEditProfile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profilesData, setProfilesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch profiles from all 3 collections in real-time (Admin/Landlord, Managers, Collectors)
  useEffect(() => {
    let cache = { users: [], managers: [], collectors: [] };

    const updateCombinedProfiles = (data, type) => {
      cache[type] = data;
      const combined = [...cache.users, ...cache.managers, ...cache.collectors];
      setProfilesData(combined);
      setLoading(false);
    };

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(d => ({ id: d.id, ...d.data(), role: 'Admin/Landlord', collectionName: 'users' }));
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
  }, []);

  // Delete profile from Firestore
  const handleDelete = async (profile) => {
    if (window.confirm(`Are you sure you want to delete ${profile.name || 'this user'}?`)) {
      try {
        await deleteDoc(doc(db, profile.collectionName, profile.id));
        alert('Profile deleted successfully!');
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile.');
      }
    }
  };

  // Handle Edit click: Passes profile data and navigates to the respective form
const handleEdit = (profile) => {
    if (onEditProfile) {
      onEditProfile(profile); 
    }

    if (profile.role === 'Admin/Landlord') {
      onNavigate('adminDetail'); // Route to the admin info/registration screen
    } else if (profile.role === 'Manager') {
      onNavigate('addManager');
    } else if (profile.role === 'Collector') {
      onNavigate('addCollector');
    }
  };

  return (
    <div className="admin-profile-container tenant-list-container">
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
      <main className="admin-profile-content tenant-list-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>All Profiles (Manager, Collector)</h2>
        </div>
        <hr />

        {/* PROFILES TABLE LIST */}
        <div className="tenant-table-card" style={{ marginTop: '15px' }}>
          <div className="table-header-row">
            <span className="col-name">Name</span>
            <span className="col-unit">Role</span>
            <span className="col-since">Mobile</span>
            <span className="col-actions">Actions</span>
          </div>

          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading profiles...</p>
          ) : profilesData.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No profiles found.</p>
          ) : (
            profilesData.map((profile) => (
              <div className="table-data-row" key={profile.id}>
                <span className="col-name">{profile.name} {profile.surname}</span>
                <span className="col-unit">
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    background: profile.role === 'Admin/Landlord' ? '#ffe6e6' : profile.role === 'Manager' ? '#e6f2ff' : '#e6ffe6',
                    color: profile.role === 'Admin/Landlord' ? '#b30000' : profile.role === 'Manager' ? '#004080' : '#006600',
                    fontWeight: 'bold'
                  }}>
                    {profile.role}
                  </span>
                </span>
                <span className="col-since">{profile.mobile || 'N/A'}</span>
                <div className="col-actions action-btns">
                  <button className="action-edit-btn" aria-label="Edit" onClick={() => handleEdit(profile)}>
                    <img src='images/edit.png' alt="Edit" />
                  </button>
                  <button className="action-delete-btn" aria-label="Delete" onClick={() => handleDelete(profile)}>
                    <img src='images/delete.png' alt="Delete" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <hr style={{ margin: '20px 0' }} />

        {/* ACTION BUTTONS */}
        <div className="admin-action-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
         <button 
  className="add-manager-btn" 
  style={{ background: '#b30000', color: '#fff' }}
  onClick={() => onNavigate('documentViewer')}
>
  View Documents
</button>
          <button className="add-manager-btn" onClick={() => { if(onEditProfile) onEditProfile(null); onNavigate('addManager'); }}>Add Manager</button>
          <button className="add-collector-btn" onClick={() => { if(onEditProfile) onEditProfile(null); onNavigate('addCollector'); }}>Add Collector</button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="profile" />
    </div>
  );
}