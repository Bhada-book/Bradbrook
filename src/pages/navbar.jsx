import React, { useState } from 'react';
import SideMenuDrawer from './SideMenuDrawer';

export default function Navbar({ onNavigate, notificationsData = [], searchQuery = '', setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';

  const hasPendingNotifications = Array.isArray(notificationsData) 
    ? notificationsData.some(n => n && n.status === 'Pending') 
    : false;

  return (
    <>
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src="images/Vector.png" alt="Search" /></span>
            <input 
              type="text" 
              placeholder="Search units, tenants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery ? setSearchQuery(e.target.value) : null}
            />
          </div>
          
          {isAdmin && (
            <button 
              className="icon-btn notification-btn" 
              aria-label="Notifications"
              onClick={() => onNavigate('notifications')}
              style={{ position: 'relative' }}
            >
              <img src="/images/n.png" alt="Notifications" style={{ height: '22px', objectFit: 'contain' }} />
              
              {hasPendingNotifications && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#dc3545',
                  borderRadius: '50%'
                }} />
              )}
            </button>
          )}
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
    </>
  );
}