import React, { useState } from 'react';
import './PropertyDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function PropertyDetails({ onBack, onNavigate }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleSelectOption = (pageName) => {
    setIsPopupOpen(false);
    if (onNavigate) {
      onNavigate(pageName);
    }
  };

  return (
    <div className="property-container">
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
       <SideMenuDrawer 
                    isOpen={isMenuOpen} 
                    onClose={() => setIsMenuOpen(false)} 
                    onNavigate={onNavigate} 
                  />
      

      {/* --- MAIN CONTENT AREA --- */}
      <main className="property-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Property or Unit Details</h2>
        </div>
<hr></hr>
        <form className="property-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group select-group red-dropdown">
            <select defaultValue="">
              <option value="" disabled>Building or Complex</option>
              <option value="complex1">Complex 1</option>
              <option value="complex2">Complex 2</option>
            </select>
            <span className="dropdown-arrow white-arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>Property Type</option>
              <option value="flat">Flat</option>
              <option value="commercial">Commercial</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Property Name / Number" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Property ID" />
          </div>

          <div className="form-group suffix-group">
            <input type="text" placeholder="Area" />
            <span className="input-suffix">SqFt</span>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Meter Number" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Parking ( 2 wheeler / 4 wheeler )" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Expected Monthly Rental" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Expected Deposit" />
          </div>

          {/* Property Photo Section */}
          <div className="photo-section-card">
            <label className="photo-label">Property Photo</label>
            <div className="photo-grid">
              {[1 ].map((_, index) => (
                <div className="photo-upload-box" key={index}>
                  <button type="button" className="upload-icon-btn" aria-label="Upload Photo">
                  <img src="/images/Group.png"></img>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">Add</button>
        </form>
      </main>

     <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}