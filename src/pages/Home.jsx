import React, { useState, useEffect } from 'react';
import './Home.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; // Ensure your firebase path is correct
import { collection, onSnapshot } from 'firebase/firestore';

export default function PropertyDetails({ onBack, onNavigate }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for dynamic Firebase data
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Fetch properties and tenants real-time from Firebase
  useEffect(() => {
    const unsubscribeProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
      const propList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProperties(propList);
    });

    const unsubscribeTenants = onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const tenantList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTenants(tenantList);
    });

    return () => {
      unsubscribeProperties();
      unsubscribeTenants();
    };
  }, []);

  // Separate properties into occupied and vacant based on status/tenant assignment
  const occupiedUnits = properties.filter(p => p.status === 'Occupied' || p.status === 'Active');
  const vacantUnits = properties.filter(p => p.status === 'Vacant' || !p.status);

  return (
    <div className="home-container">
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

      {/* --- MAIN CONTENT SCROLLABLE AREA --- */}
      <main className="home-content">
        
        {/* COLLECTION SUMMARY CARD */}
        <section className="summary-section">
          <div className="summary-header">
            <h2>July 2026 - Collection Summary</h2>
            <div className="dropdown-filter">
              <span>Property</span>
              <span className="arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
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
              <p className="status-orange">● Old Pending</p>
            </div>
          </div>

          <div className="occupancy-pill">
            Occupied Units : <span>{String(occupiedUnits.length).padStart(3, '0')}</span> &nbsp;|&nbsp; Vacant Units : <span>{String(vacantUnits.length).padStart(3, '0')}</span>
          </div>
        </section>

        {/* UNITS SECTION (Occupied/Active) */}
        <section className="units-section">
          <div className="section-header-bar1">
            <h3>UNITS</h3>
            <div className="filters-row">
              <div className="mini-dropdown">Property <span style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span></div>
              <div className="mini-dropdown">Status <span style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span></div>
            </div>
          </div>
          <hr></hr>

          <div className="unit-cards-grid">
            {occupiedUnits.length === 0 ? (
              <p style={{ padding: '20px', color: '#777' }}>No occupied units found.</p>
            ) : (
              occupiedUnits.map((unit) => {
                const tenant = tenants.find(t => t.propertyOrUnit === unit.propertyName || t.propertyUnit === unit.propertyName) || {};
                const typeClass = unit.propertyType ? unit.propertyType.toLowerCase() : 'flat';
                
                return (
                  <div className="unit-card" key={unit.id}>
                    <div className="unit-card-top">
                      <span className="bldg-name">{unit.buildingOrComplex || 'Building Name'}</span>
                      <span className={`badge-tag ${typeClass}`}>{unit.propertyType || 'Flat'}</span>
                    </div>
                    <div className="unit-card-body">
                      <div>
                        <h4 className="unit-no">{unit.propertyName || '101'}</h4>
                        <p className="tenant-name">{tenant.name ? `${tenant.name} ${tenant.surname || ''}` : 'Sandeep Ghige'}</p>
                        <div className="status-container">
                          <span className={`status-badge ${tenant.paymentStatus || 'paid'}`}>
                            ● {tenant.paymentStatus ? tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1) : 'Paid'}
                          </span>
                        </div>
                      </div>
                      <div className="unit-card-right">
                        <span className="rent-amount">Rs.{unit.expectedMonthlyRental || '10,000'}/-</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* VACANT UNITS SECTION */}
        <section className="units-section vacant-section">
          <div className="section-header-bar1">
            <h3>VACANT UNITS</h3>
            <div className="filters-row">
              <div className="mini-dropdown">Property <span style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span></div>
            </div>
          </div>
          <hr></hr>

          <div className="unit-cards-grid">
            {vacantUnits.length === 0 ? (
              <p style={{ padding: '20px', color: '#777' }}>No vacant units found.</p>
            ) : (
              vacantUnits.map((unit) => {
                const typeClass = unit.propertyType ? unit.propertyType.toLowerCase() : 'flat';
                
                return (
                  <div className="unit-card vacant-card" key={unit.id}>
                    <div className="unit-card-top">
                      <span className="bldg-name">{unit.buildingOrComplex || 'Building Name'}</span>
                      <span className={`badge-tag ${typeClass}`}>
                        {unit.propertyType || 'Flat'}
                      </span>
                    </div>
                    <div className="unit-card-body">
                      <div>
                        <h4 className="unit-no">{unit.propertyName || '101'}</h4>
                        <p className="sub-info">{unit.area || '750'} sqft</p>
                      </div>
                      <div className="unit-card-right">
                        <span className="rent-amount">Rs.{unit.expectedMonthlyRental || '10,000'}/-</span>
                      </div>
                    </div>
                    <div className="vacant-footer-info">
                      Parking : {unit.parking || 'Two Wheeler + Four Wheeler'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
  
      </main>
      
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}