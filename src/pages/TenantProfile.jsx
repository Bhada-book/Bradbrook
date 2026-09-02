import React, { useState, useEffect } from 'react';
import './TenantProfile.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import Navbar from './navbar.jsx';

export default function TenantProfile({ onBack, onNavigate, selectedUnitId }) {
 
  const [tenantData, setTenantData] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsData, setNotificationsData] = useState([]);

  // Fetch notifications from Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'notifications'));
        const notifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotificationsData(notifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Fetch tenant, unit, and payment history data from Firebase Firestore
  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const unitQueryId = selectedUnitId || '101';
        console.log("Searching for unit/tenant ID:", unitQueryId);

        // 1. Fetch all tenants and find matching unit or name client-side for robust matching
        const tenantsRef = collection(db, 'tenants');
        const tenantSnapshot = await getDocs(tenantsRef);
        
        let currentTenant = null;
        tenantSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Check against multiple potential property mapping keys
          if (
            data.propertyOrUnit === unitQueryId || 
            data.propertyUnit === unitQueryId || 
            data.propertyName === unitQueryId ||
            docSnap.id === unitQueryId
          ) {
            currentTenant = { id: docSnap.id, ...data };
          }
        });

        if (currentTenant) {
          console.log("Found cloud tenant data:", currentTenant);
          setTenantData(currentTenant);
        } else {
          console.warn("No tenant found matching query ID in cloud.");
        }

        // 2. Fetch Unit Information similarly
        const propertiesRef = collection(db, 'properties');
        const propSnapshot = await getDocs(propertiesRef);
        
        let currentUnit = null;
        propSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.propertyName === unitQueryId || docSnap.id === unitQueryId) {
            currentUnit = data;
          }
        });

        if (currentUnit) {
          setUnitData(currentUnit);
        }

        // 3. Fetch Transaction History
        const paymentsRef = collection(db, 'payments');
        const paymentSnapshot = await getDocs(paymentsRef);
        const payments = [];
        paymentSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.propertyOrUnit === unitQueryId || data.unitId === unitQueryId) {
            payments.push(data);
          }
        });

        if (payments.length > 0) {
          setHistoryData(payments);
        } else {
          const defaultRent = currentUnit?.expectedMonthlyRental || currentTenant?.totalMonthlyRental || '10,000';
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
      <Navbar 
        onNavigate={onNavigate} 
        notificationsData={notificationsData} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      {/* --- MAIN CONTENT --- */}
      <main className="tenant-profile-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{unitData?.propertyName || selectedUnitId || '101'} Tenant</h2>
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
                  {unitData?.buildingOrComplex || tenantData?.buildingOrComplex || 'Building Name'}
                </span>
                <div className="profile-title-row" style={{ marginBottom: '-7px' }}>
                  <h3>{unitData?.propertyName || tenantData?.propertyOrUnit || '101'}</h3>
                </div>
                <span className="tenant-name-main">
                  {tenantData ? `${tenantData.name || ''} ${tenantData.surname || ''}`.trim() : 'No Tenant Assigned'}
                </span>
              </div>

              <div className="profile-top-right-group">
                <div className="profile-top-badges">
                  <button className="edit-profile-btn" aria-label="Edit Profile"><img src='images/edit.png' alt="Edit"></img></button>
                </div>
                <div className="tenant-id-wrapper">
                  <span className="badge-overdue">● {tenantData?.paymentStatus || 'Overdue'}</span>
                  <span className="badge-flat">{unitData?.propertyType || 'Flat'}</span>
                  <p className="tenant-id-text">Tenant ID : {tenantData?.tenantId || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="info-column">
                <h4>Personal Information</h4>
                <p><strong>Mobile :</strong> {tenantData?.mobile || 'N/A'}</p>
                <p><strong>Company Name :</strong> {tenantData?.companyName || 'N/A'}</p>
                <p><strong>E-mail :</strong> {tenantData?.email || 'N/A'}</p>
                <p><strong>Permanent Address :</strong> {tenantData?.permanentAddress || 'N/A'}</p>
                <p><strong>State :</strong> {tenantData?.state || 'N/A'}</p>
                <p><strong>City :</strong> {tenantData?.city || 'N/A'}</p>
                <p><strong>Pin Code :</strong> {tenantData?.pinCode || 'N/A'}</p>
                <p><strong>Document :</strong> {tenantData?.document || 'N/A'}</p>
              </div>

              <div className="info-column">
                <h4>Commercial Information</h4>
                <p><strong>Move IN Date :</strong> {tenantData?.moveInDate || 'N/A'}</p>
                <p><strong>Security Deposit :</strong> {tenantData?.securityDeposit || 'N/A'}</p>
                <p><strong>Final Monthly Rental :</strong> {tenantData?.finalMonthlyRental || 'N/A'}</p>
                <p><strong>Maintenance Cost :</strong> {tenantData?.maintenanceCost || 'N/A'}</p>
                <p><strong>Total Monthly Rental :</strong> {tenantData?.totalMonthlyRental || 'N/A'}</p>
                <p><strong>Parking :</strong> {tenantData?.parking || 'N/A'}</p>
                <p><strong>Monthly Payment :</strong> {tenantData?.monthlyPayment || 'N/A'}</p>
                <p><strong>Agreement Copy :</strong> {tenantData?.agreementCopy || 'N/A'}</p>
                <p><strong>Agreement End Date :</strong> {tenantData?.agreementEndDate || 'N/A'}</p>
                <p><strong>Yearly Hike :</strong> {tenantData?.yearlyHike ? `${tenantData.yearlyHike}%` : 'N/A'}</p>
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