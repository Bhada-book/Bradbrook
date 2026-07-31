import React, { useState } from 'react';
import './TenantList.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function TenantList({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tenantsData = [
    { name: 'Sandeep Ghige', unitId: '101', since: '01/03/2026' },
    { name: 'Rahul Sharma', unitId: '102', since: '15/03/2026' },
    { name: 'Amit Patil', unitId: '201', since: '01/04/2026' },
    { name: 'Priya Deshmukh', unitId: '202', since: '10/04/2026' },
    { name: 'Vikas Jadhav', unitId: '301', since: '01/05/2026' },
  ];

  return (
    <div className="tenant-list-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search" />
          </div>
          <button className="icon-btn notification-btn" aria-label="Notifications">
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
      <main className="tenant-list-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Tenant List</h2>
        </div>

        {/* TENANT TABLE SECTION */}
        <div className="tenant-table-card">
          <div className="table-header-row">
            <span className="col-name">Name</span>
            <span className="col-unit">Unit ID</span>
            <span className="col-since">Since</span>
            <span className="col-actions">Actions</span>
          </div>

          {tenantsData.map((tenant, index) => (
            <div className="table-data-row" key={index}>
              <span className="col-name">{tenant.name}</span>
              <span className="col-unit">{tenant.unitId}</span>
              <span className="col-since">{tenant.since}</span>
              <div className="col-actions action-btns">
                <button className="action-eye-btn" aria-label="View">👁️</button>
                <button className="action-edit-btn" aria-label="Edit">✏️</button>
              </div>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="tenant-action-buttons">
          <button className="add-tenant-btn">Add Tenant</button>
          <button className="download-tenant-btn">Download Tenant List</button>
          <button className="send-tenant-btn">
            <span className="whatsapp-icon">💬</span> Send Tenant List
          </button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}