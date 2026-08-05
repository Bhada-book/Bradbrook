import React, { useState, useEffect } from 'react';
import './TenantHistory.css'; 
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TenantHistory({ onBack, onNavigate, selectedUnitId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unitData, setUnitData] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch unit details, tenant data, and transaction history from Firestore
  useEffect(() => {
    const fetchHistoryDetails = async () => {
      try {
        const unitQueryId = selectedUnitId || '101';

        // 1. Fetch Unit Information
        const propertiesRef = collection(db, 'properties');
        const propQuery = query(propertiesRef, where('propertyName', '==', unitQueryId));
        const propSnapshot = await getDocs(propQuery);
        
        let currentUnit = null;
        if (!propSnapshot.empty) {
          currentUnit = propSnapshot.docs[0].data();
          setUnitData(currentUnit);
        }

        // 2. Fetch Tenant Information linked to this unit
        const tenantsRef = collection(db, 'tenants');
        const tenantQuery = query(tenantsRef, where('propertyOrUnit', '==', unitQueryId));
        const tenantSnapshot = await getDocs(tenantQuery);

        let currentTenant = null;
        if (!tenantSnapshot.empty) {
          currentTenant = tenantSnapshot.docs[0].data();
          setTenantData(currentTenant);
        }

        // 3. Fetch Payment/Transaction History for this unit
        const paymentsRef = collection(db, 'payments');
        const paymentQuery = query(paymentsRef, where('propertyOrUnit', '==', unitQueryId));
        const paymentSnapshot = await getDocs(paymentQuery);

        if (!paymentSnapshot.empty) {
          const payments = paymentSnapshot.docs.map(doc => doc.data());
          setHistoryData(payments);
        } else {
          // Default fallback data if no payment records exist yet in Firestore
          const defaultRent = currentUnit?.expectedMonthlyRental || currentUnit?.expectedMonthlyRental === 0 ? currentUnit.expectedMonthlyRental : '10,000';
          setHistoryData([
            { title: 'Deposit Pay', amount: `${defaultRent}/-`, date: '01/03/2026' },
            { title: 'March 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/04/2026' },
            { title: 'April 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/05/2026' },
            { title: 'May 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/06/2026' },
            { title: 'June 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/07/2026' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching tenant history details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryDetails();
  }, [selectedUnitId]);

  return (
    <div className="tenant-history-container">
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

      <SideMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      {/* --- MAIN CONTENT --- */}
      <main className="tenant-history-content">
        <div className="form-header" style={{ marginBottom: "5px" }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{unitData?.propertyName || '101'} Unit History</h2>
        </div>
        <hr />

        {/* UNIT INFO CARD */}
        <div className="unit-info-card">
          <div className="unit-info-top" style={{ textAlign: "left", marginBottom: '-10px' }}>
            <span className="bldg-name">{unitData?.buildingOrComplex || 'Building Name'}</span>
          </div>
          <div className="unit-info-body">
            <div>
              <h3 className="unit-title-no">{unitData?.propertyName || '101'}</h3>
              <p className="tenant-fullname">
                {tenantData ? `${tenantData.name} ${tenantData.surname || ''}` : 'Sandeep Ghige'}
              </p>
            </div>
            <div className="unit-info-badges">
              <span className={`status-badge1 ${tenantData?.paymentStatus || 'overdue1'}`}>
                ● {tenantData?.paymentStatus ? tenantData.paymentStatus.charAt(0).toUpperCase() + tenantData.paymentStatus.slice(1) : 'Overdue'}
              </span>
              <span className="badge-tag1 flat1">{unitData?.propertyType || 'Flat'}</span>
              <span className="badge-tag occupied" style={{ fontSize: '9px' }}> 
                Tenant ID : {tenantData?.tenantId || '0987654321'}
              </span>
            </div>
          </div>
        </div>

        {/* HISTORY SECTION */}
        <div className="history-section-header">
          <h3>History</h3>
          <div className="year-dropdown">
            <span>2026</span>
            <span className="arrow" style={{ height: '20px' }}><img src='images/arrow.png' alt="Arrow"></img></span>
          </div>
        </div>

        <div className="history-list">
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading history...</p>
          ) : (
            historyData.map((item, index) => (
              <div className="history-row" key={index}>
                <div className="history-item-title">{item.title}</div>
                <div className="history-item-details">
                  <span className="history-amount">Rs.{item.amount}</span>
                  <span className="history-date">{item.date}</span>
                  <button className="action-eye-btn" aria-label="View"><img src="images/eye.png" alt="View"></img></button>
                  <button className="action-download-btn" aria-label="Download"><img src="images/down.png" alt="Download"></img></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RECORD PAYMENT BUTTON */}
        <button 
          className="record-payment-btn1"
          onClick={() => onNavigate('recordPayment')}
        >
          Record Payment
        </button>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}