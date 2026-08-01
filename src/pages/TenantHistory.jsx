import React, {useState} from 'react';
import './TenantHistory.css'; 
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function TenantHistory({ onBack, onNavigate }) {
        const [isMenuOpen, setIsMenuOpen] = useState(false);
  const historyData = [
    { title: 'Deposit Pay', amount: '00,000/-', date: '01/03/2026' },
    { title: 'March 2026 Payment Pay', amount: '00,000/-', date: '01/04/2026' },
    { title: 'April 2026 Payment Pay', amount: '00,000/-', date: '01/05/2026' },
    { title: 'May 2026 Payment Pay', amount: '00,000/-', date: '01/06/2026' },
    { title: 'June 2026 Payment Pay', amount: '00,000/-', date: '01/07/2026' },
  ];

  return (
    <div className="tenant-history-container">
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
            

      {/* --- MAIN CONTENT --- */}
      <main className="tenant-history-content">
        <div className="form-header" style={{marginBottom:"5px"}}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>101 Unit History</h2>
        </div>
        <hr></hr>

        {/* UNIT INFO CARD */}
        <div className="unit-info-card">
          <div className="unit-info-top" style={{textAlign:"left" , marginBottom:'-10px'}}>
            <span className="bldg-name" >Building Name</span>
          </div>
          <div className="unit-info-body">
            <div>
              <h3 className="unit-title-no">101</h3>
              <p className="tenant-fullname">Sandeep Ghige</p>
            </div>
            <div className="unit-info-badges">
              <span className="status-badge1 overdue1">● Overdue</span>
              <span className="badge-tag1 flat1">Flat</span>
              <span className="badge-tag occupied" style={{fontSize:'9px'}}> Tenant ID : 0987654321</span>
            </div>
          </div>
        
        </div>

        {/* HISTORY SECTION */}
        <div className="history-section-header">
          <h3>History</h3>
          <div className="year-dropdown">
            <span>2026</span>
            <span className="arrow">▼</span>
          </div>
        </div>

        <div className="history-list">
          {historyData.map((item, index) => (
            <div className="history-row" key={index}>
              <div className="history-item-title">{item.title}</div>
              <div className="history-item-details">
                <span className="history-amount">{item.amount}</span>
                <span className="history-date">{item.date}</span>
                <button className="action-eye-btn" aria-label="View"><img src="images/eye.png"></img></button>
                <button className="action-download-btn" aria-label="Download"><img src="images/down.png"></img></button>
              </div>
            </div>
          ))}
        </div>

        {/* RECORD PAYMENT BUTTON */}
        <button className="record-payment-btn1">Record Payment</button>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}