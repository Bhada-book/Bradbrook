import React, { useState } from 'react';
import './UnitLedger.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function UnitLedger({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ledgerData = [
    { title: 'Deposit Pay', amount: '00,000/-', date: '01/03/2026' },
    { title: 'March 2026 Payment Pay', amount: '00,000/-', date: '01/04/2026' },
    { title: 'April 2026 Payment Pay', amount: '00,000/-', date: '01/05/2026' },
    { title: 'May 2026 Payment Pay', amount: '00,000/-', date: '01/06/2026' },
    { title: 'June 2026 Payment Pay', amount: '00,000/-', date: '01/07/2026' },
  ];

  return (
    <div className="unit-ledger-container">
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
      <main className="unit-ledger-content">
        <div className="form-header" style={{ marginBottom:'9px'}}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>101 Unit Ledger</h2>
        </div>
<hr></hr>
        {/* COLLECTION SUMMARY CARD */}
        <section className="ledger-summary-section">
          <div className="ledger-summary-top-bar">
            <span className="summary-title-tab">Collection Summary</span>
            <div className="year-dropdown">
              <span>2026</span>
              <span className="arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
            </div>
          </div>

          <div className="summary-cards-grid">
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-green">● Received</p>
            </div>
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-red">● Overdue</p>
            </div>
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-red">● Old Pending</p>
            </div>
          </div>
        </section>

        {/* LEDGER TRANSACTIONS SECTION */}
        <section className="ledger-transactions-section">
          <div className="section-header-bar">
            <h3>Ledger</h3>
            <div className="year-dropdown">
              <span>2026</span>
              <span className="arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
            </div>
          </div>

          <div className="ledger-table-card">
            {ledgerData.map((item, index) => (
              <div className="ledger-row" key={index}>
                <span className="ledger-item-title">{item.title}</span>
                <span className="ledger-item-amount">{item.amount}</span>
                <span className="ledger-item-date">{item.date}</span>
                <div className="ledger-item-actions">
                  <button className="action-eye-btn" aria-label="View"><img src='images/eye.png'></img></button>
                  <button className="action-download-btn" aria-label="Download"><img src='images/down.png'></img></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="ledger-action-buttons">
          <button className="download-ledger-btn">Download</button>
          <button className="record-payment-btn">Record Payment</button>
          <button className="send-ledger-btn">
            <span className="whatsapp-icon"><img src='images/whatsup.png'></img></span> Send Ledger
          </button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}