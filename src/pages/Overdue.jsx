import React, { useState } from 'react';
import './Overdue.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function Overdue({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="building-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src="images/Vector.png" alt="Search" /></span>
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

      <SideMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="building-content">
        <div className="form-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>101 Overdue</h2>
        </div>
        <hr />

        {/* OVERDUE CARD */}
        <div className="overdue-card">
          <div className="overdue-card-header">
            <div>
              <span className="building-name-small1" >Building Name</span>
              <div className="profile-title-row">
                <h3>101</h3>
              </div>
              <span className="tenant-name-main1">Sandeep Ghige</span>
            </div>
            <div className="profile-top-right-group1">
              <div className="profile-top-badges">
                <span className="badge-overdue">● Overdue</span>
                <span className="badge-flat">Flat</span>
              </div>
              <p className="tenant-id-text">Tenant ID : 0987654321</p>
            </div>
          </div>

          <div className="overdue-amount-section">
            <span className="currency-label">Rs.</span>
            <h1 className="overdue-amount">20,000/-</h1>
            <p className="rental-subtext">Monthly Rental : 20,000 monthly</p>
          </div>

          <div className="overdue-banner">
            <span>Overdue by 23 days</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="overdue-action-buttons">
          <button className="record-payment-btn">Record Payment</button>
          <button className="whatsapp-reminder-btn">
            <span className="whatsapp-icon"><img src='images/whatsup.png'></img></span> Send Reminder
          </button>
        </div>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}