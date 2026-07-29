import React, { useState } from 'react';

export default function BottomNavWithPopup({ onNavigate, currentActive = 'home' }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
    <>
      {/* --- POPUP BACKDROP & BOTTOM SHEET --- */}
      {isPopupOpen && (
        <div className="popup-overlay" onClick={togglePopup}></div>
      )}
      {isPopupOpen && (
        <div className="popup-menu-sheet">
          <div className="popup-handle-bar"></div>
          <h3 className="popup-title">Add New Details</h3>
          
          <div className="popup-options-list">
            <button 
              className="popup-option-item"
              onClick={() => handleSelectOption('building')}
            >
              <span className="option-icon">🏢</span>
              <span>Building or Complex Details</span>
            </button>

            <button 
              className="popup-option-item"
              onClick={() => handleSelectOption('property')}
            >
              <span className="option-icon">🏠</span>
              <span>Property or Unit Details</span>
            </button>

            <button 
              className="popup-option-item"
              onClick={() => handleSelectOption('tenant')}
            >
              <span className="option-icon">👤</span>
              <span>Tenant Information</span>
            </button>
          </div>
        </div>
      )}

      {/* --- BOTTOM FLOATING TAB BAR --- */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentActive === 'home' ? 'active' : ''}`} 
          aria-label="Home"
          onClick={() => onNavigate && onNavigate('home')}
        >
          <img src='/images/Home.png' alt="Home" style={{height:'20px'}} />
        </button>

        <button className="nav-item" aria-label="Records">
          <img src='/images/Ledger.png' alt="Ledger" style={{height:'20px'}} />
        </button>
        
        {/* Center Floating Plus Action Button */}
        <div className="fab-container">
          <button 
            className={`fab-btn ${isPopupOpen ? 'active' : ''}`} 
            onClick={togglePopup} 
            aria-label="Add New"
          >
            +
          </button>
        </div>

        <button className="nav-item" aria-label="Settings">
          <img src='/images/Setting.png' alt="Settings" style={{height:'20px'}} />
        </button>

        <button className="nav-item" aria-label="Profile">
          <img src='/images/Profile.png' alt="Profile" style={{height:'20px'}} />
        </button>
      </nav>
    </>
  );
}