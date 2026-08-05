import React, { useState, useEffect } from 'react';
import './TenantProfile.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function TenantProfile({ onBack, onNavigate, selectedUnitId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tenant, unit, and payment history data from Firebase Firestore
  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const unitQueryId = selectedUnitId || '101';

        // 1. Fetch Tenant Information linked to this unit
        const tenantsRef = collection(db, 'tenants');
        const tenantQuery = query(tenantsRef, where('propertyOrUnit', '==', unitQueryId));
        const tenantSnapshot = await getDocs(tenantQuery);

        let currentTenant = null;
        if (!tenantSnapshot.empty) {
          currentTenant = { id: tenantSnapshot.docs[0].id, ...tenantSnapshot.docs[0].data() };
          setTenantData(currentTenant);
        }

        // 2. Fetch Unit Information
        const propertiesRef = collection(db, 'properties');
        const propQuery = query(propertiesRef, where('propertyName', '==', unitQueryId));
        const propSnapshot = await getDocs(propQuery);
        
        let currentUnit = null;
        if (!propSnapshot.empty) {
          currentUnit = propSnapshot.docs[0].data();
          setUnitData(currentUnit);
        }

        // 3. Fetch Transaction History
        const paymentsRef = collection(db, 'payments');
        const paymentQuery = query(paymentsRef, where('propertyOrUnit', '==', unitQueryId));
        const paymentSnapshot = await getDocs(paymentQuery);

        if (!paymentSnapshot.empty) {
          const payments = paymentSnapshot.docs.map(doc => doc.data());
          setHistoryData(payments);
        } else {
          const defaultRent = currentUnit?.expectedMonthlyRental || currentTenant?.totalMonthlyRental || '00,000';
          setHistoryData([
            { title: 'Deposit Pay', amount: `${defaultRent}/-`, date: '01/03/2026' },
            { title: 'March 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/04/2026' },
            { title: 'April 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/05/2026' },
            { title: 'May 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/06/2026' },
            { title: 'June 2026 Payment Pay', amount: `${defaultRent}/-`, date: '01/07/2026' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching tenant profile details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [selectedUnitId]);

  // Handle Delete Tenant
  const handleDeleteTenant = async () => {
    if (!tenantData?.id) {
      alert('No active tenant record found to delete.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this tenant profile?')) {
      try {
        await deleteDoc(doc(db, 'tenants', tenantData.id));
        alert('Tenant deleted successfully.');
        if (onBack) {
          onBack();
        } else {
          onNavigate('tenantList');
        }
      } catch (error) {
        console.error('Error deleting tenant: ', error);
        alert('Failed to delete tenant.');
      }
    }
  };

  return (
    <div className="tenant-profile-container">
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
      <main className="tenant-profile-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{unitData?.propertyName || '101'} Tenant</h2>
        </div>
        <hr />

        {/* TENANT DETAILS CARD */}
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Loading tenant profile...</p>
        ) : (
          <div className="profile-details-card">
            <div className="profile-card-header">
              <div className="profile-title-group" style={{ textAlign: 'left' }}>
                <span className="building-name-small" style={{ marginBottom: '-7px' }}>
                  {unitData?.buildingOrComplex || 'Building Name'}
                </span>
                <div className="profile-title-row" style={{ marginBottom: '-7px' }}>
                  <h3>{unitData?.propertyName || '101'}</h3>
                </div>
                <span className="tenant-name-main">
                  {tenantData ? `${tenantData.name} ${tenantData.surname || ''}` : 'Sandeep Ghige'}
                </span>
              </div>

              <div className="profile-top-right-group">
                <div className="profile-top-badges">
                  <button className="edit-profile-btn" aria-label="Edit Profile"><img src='images/edit.png' alt="Edit"></img></button>
                </div>
                <div className="tenant-id-wrapper">
                  <span className="badge-overdue">● {tenantData?.paymentStatus || 'Overdue'}</span>
                  <span className="badge-flat">{unitData?.propertyType || 'Flat'}</span>
                  <p className="tenant-id-text">Tenant ID : {tenantData?.tenantId || '0987654321'}</p>
                </div>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="info-column">
                <h4>Personal Information</h4>
                <p><strong>Mobile :</strong> {tenantData?.mobile || '0987654321'}</p>
                <p><strong>Company Name :</strong> {tenantData?.companyName || 'XYZ'}</p>
                <p><strong>E-mail :</strong> {tenantData?.email || 'xyz@gmail.com'}</p>
                <p><strong>Permanent Address :</strong> {tenantData?.permanentAddress || 'Flat 01'}</p>
                <p><strong>State :</strong> {tenantData?.state || 'Maharashtra'}</p>
                <p><strong>City :</strong> {tenantData?.city || 'Pune'}</p>
                <p><strong>Pin Code :</strong> {tenantData?.pinCode || '411035'}</p>
                <p><strong>Document :</strong> {tenantData?.document || '(Adhaar/Pan/DL)'}</p>
              </div>

              <div className="info-column">
                <h4>Commercial Information</h4>
                <p><strong>Move IN Date :</strong> {tenantData?.moveInDate || '01/02/2026'}</p>
                <p><strong>Security Deposit :</strong> {tenantData?.securityDeposit || '00,000'}</p>
                <p><strong>Final Monthly Rental :</strong> {tenantData?.finalMonthlyRental || '00,000'}</p>
                <p><strong>Maintenance Cost :</strong> {tenantData?.maintenanceCost || '000'}</p>
                <p><strong>Total Monthly Rental :</strong> {tenantData?.totalMonthlyRental || '00,000'}</p>
                <p><strong>Parking :</strong> {tenantData?.parking || 'Two wheeler + Four wheeler'}</p>
                <p><strong>Monthly Payment :</strong> {tenantData?.monthlyPayment || 'Advance'}</p>
                <p><strong>Agreement Copy :</strong> {tenantData?.agreementCopy || '(PDF/JPG)'}</p>
                <p><strong>Agreement End Date :</strong> {tenantData?.agreementEndDate || '01/02/2026'}</p>
                <p><strong>Yearly Hike :</strong> {tenantData?.yearlyHike ? `${tenantData.yearlyHike}%` : '5%'}</p>
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
        )}

        {/* HISTORY SECTION */}
        <section className="profile-history-section">
          <div className="section-header-bar">
            <h3>History</h3>
            <div className="year-dropdown">
              <span>2026</span>
              <span className="arrow" style={{ height: '20px' }}><img src='images/arrow.png' alt="Arrow"></img></span>
            </div>
          </div>
          <hr />
          <div className="history-table-card">
            {historyData.map((item, index) => (
              <div className="history-row" key={index}>
                <span className="history-item-title">{item.title}</span>
                <span className="history-item-amount">Rs.{item.amount}</span>
                <span className="history-item-date">{item.date}</span>
                <div className="history-item-actions">
                  <button className="action-eye-btn" aria-label="View">
                    <img src="images/eye.png" alt="View" />
                  </button>
                  <button className="action-download-btn" aria-label="Download"><img src='images/down.png' alt="Download"></img></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="profile-action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="download-tenant-btn">Download History</button>
          <button 
            className="record-payment-btn" 
            style={{ padding: '10px' }}
            onClick={() => onNavigate('recordPayment')}
          >
            Record Payment
          </button>
          <button className="delete-tenant-btn" onClick={handleDeleteTenant}>Delete Tenant</button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}