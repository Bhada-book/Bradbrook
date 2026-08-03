import React, { useState } from 'react';
import './AddCollector.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function AddCollector({ onBack, onNavigate }) {
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
          <h2>Add Collector</h2>
        </div>
        <hr />

        <form className="building-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <input type="text" placeholder="Name" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Surname" />
          </div>

          <div className="form-group">
            <input type="tel" placeholder="Mobile Number" />
          </div>

          <div className="form-group">
            <input type="email" placeholder="E-mail" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Permanent Address" />
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>State</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="karnataka">Karnataka</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>City</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Pin Code" />
          </div>

          <div className="form-group file-upload-group">
            <input type="text" placeholder="Document (Adhaar/Pan/DL)" readOnly />
            <button type="button" className="upload-icon-btn" aria-label="Upload Document">
              <img src='images/Group5.png'></img>
            </button>
          </div>

          <button type="submit" className="submit-btn">Add Collector</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}