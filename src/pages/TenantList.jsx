import React, { useState, useEffect } from 'react';
import './TenantList.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

export default function TenantList({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tenantsData, setTenantsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tenants real-time from Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const tenantList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Construct full name from name and surname, fallback gracefully
        const fullName = [data.name, data.surname].filter(Boolean).join(' ') || 'Sandeep Ghige';
        
        return {
          id: doc.id,
          name: fullName,
          unitId: data.propertyOrUnit || data.unitId || '101',
          since: data.moveInDate || data.since || '01/03/2026'
        };
      });

      if (tenantList.length > 0) {
        setTenantsData(tenantList);
      } else {
        // Fallback default sample data if Firestore collection is empty
        setTenantsData([
          { name: 'Sandeep Ghige', unitId: '101', since: '01/03/2026' },
          { name: 'Rahul Sharma', unitId: '102', since: '15/03/2026' },
          { name: 'Amit Patil', unitId: '201', since: '01/04/2026' },
          { name: 'Priya Deshmukh', unitId: '202', since: '10/04/2026' },
          { name: 'Vikas Jadhav', unitId: '301', since: '01/05/2026' },
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="tenant-list-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src='images/Vector.png' alt="Search"></img></span>
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
      <main className="tenant-list-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Tenant List</h2>
        </div>
        <hr />

        {/* TENANT TABLE SECTION */}
        <div className="tenant-table-card">
          <div className="table-header-row">
            <span className="col-name">Name</span>
            <span className="col-unit">Unit ID</span>
            <span className="col-since">Since</span>
            <span className="col-actions">Actions</span>
          </div>

          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading tenants...</p>
          ) : (
            tenantsData.map((tenant, index) => (
              <div className="table-data-row" key={tenant.id || index}>
                <span className="col-name">{tenant.name}</span>
                <span className="col-unit">{tenant.unitId}</span>
                <span className="col-since">{tenant.since}</span>
                <div className="col-actions action-btns">
                  <button className="action-eye-btn" aria-label="View"><img src='images/eye.png' alt="View"></img></button>
                  <button className="action-edit-btn" aria-label="Edit"><img src='images/edit.png' alt="Edit"></img></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="tenant-action-buttons">
          <button 
            className="add-tenant-btn"
            onClick={() => onNavigate('tenantInformation')}
          >
            Add Tenant
          </button>
          <button className="download-tenant-btn">Download Tenant List</button>
          <button className="send-tenant-btn">
            <span className="whatsapp-icon"><img src='images/whatsup.png' style={{ height: '18px' }} alt="WhatsApp"></img></span> Send Tenant List
          </button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}