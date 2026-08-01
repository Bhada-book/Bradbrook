import React, { useState } from 'react';
import './TenantProfile.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function TenantProfile({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const historyData = [
    { title: 'Deposit Pay', amount: '00,000/-', date: '01/03/2026' },
    { title: 'March 2026 Payment Pay', amount: '00,000/-', date: '01/04/2026' },
    { title: 'April 2026 Payment Pay', amount: '00,000/-', date: '01/05/2026' },
    { title: 'May 2026 Payment Pay', amount: '00,000/-', date: '01/06/2026' },
    { title: 'June 2026 Payment Pay', amount: '00,000/-', date: '01/07/2026' },
  ];

  return (
    <div className="tenant-profile-container">
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
 <main className="tenant-profile-content">
  <div className="form-header" style={{ marginBottom: '9px' }}>
    <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
    <h2>101 Tenant</h2>
  </div>
  <hr />

  {/* TENANT DETAILS CARD */}
  <div className="profile-details-card">
    <div className="profile-card-header">
      <div className="profile-title-group" style={{textAlign:'left'}}>
        <span className="building-name-small" style={{marginBottom:'-7px'}}>Building Name</span>
        <div className="profile-title-row" style={{marginBottom:'-7px'}}>
          <h3>101</h3>
        </div>
        <span className="tenant-name-main">Sandeep Ghige</span>
      </div>

      <div className="profile-top-right-group">
        <div className="profile-top-badges">
             <button className="edit-profile-btn" aria-label="Edit Profile"><img src='images/edit.png'></img></button>
         
        </div>
        <div className="tenant-id-wrapper">
          <span className="badge-overdue">●Overdue</span>
           <span className="badge-flat">Flat</span>
          <p className="tenant-id-text">Tenant ID : 0987654321</p>
       
        </div>
      </div>
    </div>

    <div className="profile-info-grid">
      <div className="info-column">
        <h4>Personal Information</h4>
        <p><strong>Mobile :</strong> 0987654321</p>
        <p><strong>Company Name :</strong> XYZ</p>
        <p><strong>E-mail :</strong> xyz@gmail.com</p>
        <p><strong>Permanent Address :</strong> Flat 01</p>
        <p><strong>State :</strong> Maharashtra</p>
        <p><strong>City :</strong> Pune</p>
        <p><strong>Pin Code :</strong> 411035</p>
        <p><strong>Document :</strong> (Adhaar/Pan/DL)</p>
      </div>

      <div className="info-column">
        <h4>Commercial Information</h4>
        <p><strong>Move IN Date :</strong> 01/02/2026</p>
        <p><strong>Security Deposit :</strong> 00,000</p>
        <p><strong>Final Monthly Rental :</strong> 00,000</p>
        <p><strong>Maintenance Cost :</strong> 000</p>
        <p><strong>Total Monthly Rental :</strong> 00,000</p>
        <p><strong>Parking :</strong> Two wheeler + Four wheeler</p>
        <p><strong>Monthly Payment :</strong> Advance</p>
        <p><strong>Agreement Copy :</strong> (PDF/JPG)</p>
        <p><strong>Agreement End Date :</strong> 01/02/2026</p>
        <p><strong>Yearly Hike :</strong> 5%</p>
      </div>
    </div>

    <div className="photos-section">
      <p className="photos-label">Photos:</p>
      <div className="photos-grid">
        <div className="photo-box"></div>
        <div className="photo-box"></div>
        <div className="photo-box"></div>
        <div className="photo-box"></div>
      </div>
    </div>

    <div className="show-less-bar">
      <span>Show Less</span>
      <span className="arrow-up">▲</span>
    </div>
  </div>


        {/* HISTORY SECTION */}
        <section className="profile-history-section">
          <div className="section-header-bar">
            <h3>History</h3>
            <div className="year-dropdown">
              <span>2026</span>
              <span className="arrow">▼</span>
            </div>
          </div>
<hr></hr>
          <div className="history-table-card">
            {historyData.map((item, index) => (
              <div className="history-row" key={index}>
                <span className="history-item-title">{item.title}</span>
           <span className="history-item-amount" style={{  }}>{item.amount}</span>
                <span className="history-item-date">{item.date}</span>
                <div className="history-item-actions">
                 <button className="action-eye-btn" aria-label="View">
  <img src="images/eye.png" alt="View" />
</button>  <button className="action-download-btn" aria-label="Download"><img src='images/down.png'></img></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION BUTTONS */}
    <div className="profile-action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
  <button className="download-tenant-btn">Download History</button>
  <button className="record-payment-btn" style={{padding:'10px'}}>Record Payment</button>
  <button className="delete-tenant-btn">Delete Tenant</button>
</div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}