import React, { useState, useEffect } from 'react';
import Side from './Side';
import SimpleBottomNav from './SimpleBottomNav';
import { db } from '../../firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Overdue.css';

export default function Overdue({ onBack, onNavigate, selectedUnitId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unitData, setUnitData] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverdueDetails = async () => {
      try {
        const unitQueryId = selectedUnitId || '101';

        // 1. Fetch Property / Unit Data
        const propertiesRef = collection(db, 'properties');
        const propQuery = query(propertiesRef, where('propertyName', '==', unitQueryId));
        const propSnapshot = await getDocs(propQuery);
        
        if (!propSnapshot.empty) {
          setUnitData(propSnapshot.docs[0].data());
        }

        // 2. Fetch Tenant Data linked to this unit
        const tenantsRef = collection(db, 'tenants');
        const tenantQuery = query(tenantsRef, where('propertyOrUnit', '==', unitQueryId));
        const tenantSnapshot = await getDocs(tenantQuery);

        if (!tenantSnapshot.empty) {
          setTenantData(tenantSnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error fetching overdue details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueDetails();
  }, [selectedUnitId]);

  // Dynamically resolve rental amount from tenant or unit data
  const currentRent = tenantData?.totalMonthlyRental || tenantData?.monthlyRent || unitData?.expectedMonthlyRental || '0';
  const displayTenantId = tenantData?.tenantId || '[Tenant ID Redacted]';

  return (
    <div className="building-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src='images/Vector.png' alt="Search" /></span>
            <input type="text" placeholder="Search" />
          </div>
          <button 
            className="icon-btn menu-btn" 
            aria-label="Menu"
            onClick={() => setIsMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      <Side 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="building-content">
        <div className="form-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2> Overdue</h2>
        </div>
        <hr />

        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Loading overdue details...</p>
        ) : (
          <div className="overdue-card">
            <div className="overdue-card-header">
              <div>
                <span className="building-name-small1">{unitData?.buildingOrComplex || 'Building Name'}</span>
                <div className="profile-title-row">
                  <h3>{unitData?.propertyName || '101'}</h3>
                </div>
                <span className="tenant-name-main1">
                  {tenantData ? `${tenantData.name} ${tenantData.surname || ''}` : 'Tenant Name'}
                </span>
              </div>
              <div className="profile-top-right-group1">
                <div className="profile-top-badges">
                  <span className="badge-overdue">● Overdue</span>
                  <span className="badge-flat">{unitData?.propertyType || 'Flat'}</span>
                </div>
                <p className="tenant-id-text">Tenant ID : {displayTenantId}</p>
              </div>
            </div>

            <div className="overdue-amount-section">
              <span className="currency-label">Rs.</span>
              <h1 className="overdue-amount">
                {Number(currentRent).toLocaleString()}/-
              </h1>
              <p className="rental-subtext">
                Monthly Rental : {Number(currentRent).toLocaleString()} monthly
              </p>
            </div>

            <div className="overdue-banner">
              <span>{tenantData?.overdueMessage || 'Overdue by 23 days'}</span>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="overdue-action-buttons">
          <button 
            className="record-payment-btn"
            onClick={() => onNavigate('recordPayment')}
          >
            Record Payment
          </button>
          <button className="whatsapp-reminder-btn">
            <span className="whatsapp-icon"><img src='images/whatsup.png' alt="WhatsApp" /></span> Send Reminder
          </button>
        </div>
      </main>

      <SimpleBottomNav onNavigate={onNavigate} activeTab="home" />
    </div>
  );
}