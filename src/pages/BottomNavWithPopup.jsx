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
      <style>{`
        /* --- POPUP OVERLAY BACKDROP --- */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
          animation: fadeIn 0.2s ease-in-out;
        }

        /* --- POPUP BOTTOM SHEET CONTAINER --- */
        .popup-menu-sheet {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          max-height: 85vh; /* Prevents it from overflowing the screen */
          overflow-y: auto; /* Allows scrolling if screen is too short */
          background-color: #ffffff;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          padding: 16px 20px 90px 20px; /* Increased bottom padding so options clear the bottom bar */
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          z-index: 999;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        /* --- HANDLE BAR --- */
        .popup-handle-bar {
          width: 40px;
          height: 4px;
          background-color: #e0e0e0;
          border-radius: 2px;
          margin: 0 auto 12px auto;
        }

        /* --- TITLE --- */
        .popup-title {
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 12px;
          text-align: left;
        }

        /* --- OPTIONS LIST --- */
        .popup-options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* --- OPTION ITEMS / BUTTONS --- */
        .popup-option-item {
          width: 100%;
          padding: 12px 16px;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .popup-option-item:hover {
          background-color: #fdf2f2;
          border-color: #dc2626;
          color: #dc2626;
        }

        /* --- ANIMATIONS --- */
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100%);
          }
          to {
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

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
              <span className="option-icon"></span>
              <span>Building or Complex Details</span>
            </button>

            <button 
              className="popup-option-item"
              onClick={() => handleSelectOption('property')}
            >
              <span className="option-icon"></span>
              <span>Property or Unit Details</span>
            </button>

            <button 
              className="popup-option-item"
              onClick={() => handleSelectOption('tenant')}
            >
              <span className="option-icon"></span>
              <span> Add Tenant</span>
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
          <img src='/images/Home.png' alt="Home" style={{height:'24px'}} />
        </button>

        <button 
          className={`nav-item ${currentActive === 'unit-ledger' ? 'active' : ''}`} 
          aria-label="Records"
          onClick={() => onNavigate && onNavigate('unit-ledger')}
        >
          <img src='/images/Ledger.png' alt="Ledger" style={{height:'24px'}} />
        </button>

        {/* Center Floating Plus Action Button */}
        <div className="fab-container">
          <button 
            className={`fab-btn ${isPopupOpen ? 'active' : ''}`} 
            onClick={togglePopup} 
            aria-label="Add New"
          >
            <img src='images/plus.png' className='plus' style={{height:'30px', paddingTop:'2px'}} alt="Plus" />
          </button>
        </div>

        <button 
          className={`nav-item ${currentActive === 'settings' ? 'active' : ''}`} 
          aria-label="Settings"
          onClick={() => onNavigate && onNavigate('settings')}
        >
          <img src='/images/Setting.png' alt="Settings" style={{height:'24px'}} />
        </button>

        <button 
          className={`nav-item ${currentActive === 'profile' ? 'active' : ''}`} 
          aria-label="Profile"
          onClick={() => onNavigate && onNavigate('profile')}
        >
          <img src='/images/Profile.png' alt="Profile" style={{height:'24px'}} />
        </button>
      </nav>
    </>
  );
}