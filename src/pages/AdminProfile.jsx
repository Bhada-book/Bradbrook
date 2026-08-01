import React, { useState } from 'react';
import './AdminProfile.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function AdminProfile({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="admin-profile-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
          <span className="search-icon"><img src='images/Vector.png'></img></span>
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
        <div className="form-header" style={{ marginBottom:'9px'}}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Profile</h2>
        </div>
<hr></hr>
        {/* ADMIN PROFILE CARD */}
        <div className="admin-profile-card">
          <div className="admin-card-header">
            <div>
              <span className="landlord-tag">Landlord</span>
              <h3>Sandeep Ghige</h3>
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
            <p>9822886696</p>
            <p>sandeep.ghige@outlook.com</p>
            <p>Akurdi, Pune, Maharashtra</p>
            <p>411035</p>
          </div>
     
        </div>
             <hr></hr>

        {/* ACTION BUTTONS */}
        <div className="admin-action-buttons">
          <button className="add-landlord-btn">Add Landlord</button>
          <button className="add-manager-btn">Add Manager</button>
          <button className="add-collector-btn">Add Collector</button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="profile" />
    </div>
  );
}