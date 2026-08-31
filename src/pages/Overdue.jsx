import React, { useState, useEffect } from 'react';
import './Overdue.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from './navbar.jsx';

export default function Overdue({ onBack, onNavigate, selectedUnitId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unitData, setUnitData] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch unit and tenant details from Firebase based on selected unit ID
  useEffect(() => {
    const fetchOverdueDetails = async () => {
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
// Add this state near your other state initializations
const [notificationsData, setNotificationsData] = useState([]);

// Add an effect to fetch notifications if they come from Firestore, for example:
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
  return (
    <div className="building-container">
      {/* --- TOP NAVBAR --- */}
<Navbar notificationsData={notificationsData} onNavigate={onNavigate} />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="building-content">
        <div className="form-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{unitData?.propertyName || '101'} Overdue</h2>
        </div>
        <hr />

        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Loading overdue details...</p>
        ) : (
          /* OVERDUE CARD */
          <div className="overdue-card">
            <div className="overdue-card-header">
              <div>
                <span className="building-name-small1">{unitData?.buildingOrComplex || 'Building Name'}</span>
                <div className="profile-title-row">
                  <h3>{unitData?.propertyName || '101'}</h3>
                </div>
                <span className="tenant-name-main1">
                  {tenantData ? `${tenantData.name} ${tenantData.surname || ''}` : 'Sandeep Ghige'}
                </span>
              </div>
              <div className="profile-top-right-group1">
                <div className="profile-top-badges">
                  <span className="badge-overdue">● Overdue</span>
                  <span className="badge-flat">{unitData?.propertyType || 'Flat'}</span>
                </div>
                <p className="tenant-id-text">Tenant ID : {tenantData?.tenantId || '0987654321'}</p>
              </div>
            </div>

            <div className="overdue-amount-section">
              <span className="currency-label">Rs.</span>
              <h1 className="overdue-amount">
                {unitData?.expectedMonthlyRental || tenantData?.totalMonthlyRental || '20,000'}/-
              </h1>
              <p className="rental-subtext">
                Monthly Rental : {unitData?.expectedMonthlyRental || tenantData?.totalMonthlyRental || '20,000'} monthly
              </p>
            </div>

            <div className="overdue-banner">
              <span>Overdue by 23 days</span>
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
            <span className="whatsapp-icon"><img src='images/whatsup.png' alt="WhatsApp"></img></span> Send Reminder
          </button>
        </div>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}