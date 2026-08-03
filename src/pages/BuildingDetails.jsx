import React from 'react';
import './BuildingDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { useState } from 'react';
export default function BuildingDetails({ onBack ,onNavigate }) {
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
      <main className="building-content">
        <div className="form-header" s    
        
        
          >
<button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Building or Complex Details</h2>
        </div>
        <hr></hr>

        <form className="building-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <input type="text" placeholder="Property Nickname" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Building or Complex Name" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Wing" />
          </div>

          <div className="form-group location-group">
            <input type="text" placeholder="Google Location" />
         
          </div>

          <div className="form-group">
            <input type="text" placeholder="Town" />
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>State</option>
              <option value="state1">State 1</option>
              <option value="state2">State 2</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>City</option>
              <option value="city1">City 1</option>
              <option value="city2">City 2</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Pin Code" />
          </div>

          <button type="submit" className="submit-btn">Add</button>
        </form>
      </main>

    <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}