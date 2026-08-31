import React, { useState, useEffect } from 'react';
import './Home.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, onSnapshot } from 'firebase/firestore';
import Navbar from './navbar.jsx';

export default function PropertyDetails({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for dynamic Firebase data
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]); // <-- Added missing state

  // Role management state
  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';

  // Filter States
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedVacantPropertyFilter, setSelectedVacantPropertyFilter] = useState('All');
  
  // Dropdown open/close toggles
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isVacantPropertyDropdownOpen, setIsVacantPropertyDropdownOpen] = useState(false);

  // Fetch properties, tenants, and notifications real-time from Firebase
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

    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotificationsData(notifList);
    });

    return () => {
      unsubscribeProperties();
      unsubscribeTenants();
      unsubscribeNotifications();
    };
  }, []);

  // Check if a property unit has an assigned tenant
  const isUnitOccupied = (unit) => {
    return tenants.some(t => 
      String(t.propertyOrUnit || t.propertyUnit || '').trim().toLowerCase() === String(unit.propertyName || '').trim().toLowerCase()
    );
  };

  // Get unique list of properties/buildings for the property dropdown filter
  const uniqueBuildings = ['All', ...new Set(properties.map(p => p.buildingOrComplex).filter(Boolean))];

  // Base classification
  const occupiedUnitsRaw = properties.filter(p => isUnitOccupied(p));
  const vacantUnitsRaw = properties.filter(p => !isUnitOccupied(p));

  // Apply filters to Occupied Units
  const occupiedUnits = occupiedUnitsRaw.filter(unit => {
    const tenant = tenants.find(t => 
      String(t.propertyOrUnit || t.propertyUnit || '').trim().toLowerCase() === String(unit.propertyName || '').trim().toLowerCase()
    ) || {};
    const paymentStatus = tenant.paymentStatus ? tenant.paymentStatus.toLowerCase() : 'paid';

    const matchesProperty = selectedPropertyFilter === 'All' || unit.buildingOrComplex === selectedPropertyFilter;
    const matchesStatus = selectedStatusFilter === 'All' || paymentStatus === selectedStatusFilter.toLowerCase();

    return matchesProperty && matchesStatus;
  });

  // Apply filters to Vacant Units (using its own independent filter dropdown)
  const vacantUnits = vacantUnitsRaw.filter(unit => {
    return selectedVacantPropertyFilter === 'All' || unit.buildingOrComplex === selectedVacantPropertyFilter;
  });

  return (
    <div className="home-container" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* --- TOP NAVBAR --- */}
      <Navbar onNavigate={onNavigate} notificationsData={notificationsData} />

      {/* --- MAIN CONTENT SCROLLABLE AREA --- */}
      <main className="home-content">
        
        {/* COLLECTION SUMMARY CARD */}
        <section className="summary-section">
          <div className="summary-header">
            <h2>July 2026 - Collection Summary</h2>
            <div className="dropdown-filter" onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)} style={{ cursor: 'pointer', position: 'relative', marginBottom:'6px'}}>
              <span>{selectedPropertyFilter}</span>
              <span className="arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
              
              {/* Property Filter Popup Menu */}
              {isPropertyDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '150px' }}>
                  {uniqueBuildings.map((bldg, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { setSelectedPropertyFilter(bldg); setIsPropertyDropdownOpen(false); }}
                      style={{ padding: '8px 12px', fontSize: '12px', color: '#333', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    >
                      {bldg}
                    </div>
                  ))}
                </div>
              )}
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
            Occupied Units : <span>{String(occupiedUnitsRaw.length).padStart(3, '0')}</span> &nbsp;|&nbsp; Vacant Units : <span>{String(vacantUnitsRaw.length).padStart(3, '0')}</span>
          </div>
        </section>

        {/* UNITS SECTION (Occupied/Active with Clickable Filters) */}
        <section className="units-section">
          <div className="section-header-bar1">
            <h3>UNITS</h3>
            <div className="filters-row" style={{ display: 'flex', gap: '10px' }}>
              
              {/* Property Filter Dropdown */}
              <div className="mini-dropdown" onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                {selectedPropertyFilter} <span style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
              </div>

              {/* Status Filter Dropdown */}
              <div className="mini-dropdown" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                {selectedStatusFilter} <span style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
                
                {isStatusDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '120px' }}>
                    {['All', 'Paid', 'Overdue', 'Pending'].map((status, idx) => (
                      <div 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setSelectedStatusFilter(status); setIsStatusDropdownOpen(false); }}
                        style={{ padding: '8px 12px', fontSize: '12px', color: '#333', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
          <hr />

          <div className="unit-cards-grid">
            {occupiedUnits.length === 0 ? (
              <p style={{ padding: '20px', color: '#777' }}>No matching occupied units found.</p>
            ) : (
              occupiedUnits.map((unit) => {
                const tenant = tenants.find(t => 
                  String(t.propertyOrUnit || t.propertyUnit || '').trim().toLowerCase() === String(unit.propertyName || '').trim().toLowerCase()
                ) || {};

                const typeClass = unit.propertyType ? unit.propertyType.toLowerCase() : 'flat';
                const paymentStatus = tenant.paymentStatus ? tenant.paymentStatus.toLowerCase() : 'paid';
                const statusLabel = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);

                return (
                  <div className="unit-card" key={unit.id}>
                    <div className="unit-card-top">
                      <span className="bldg-name">{unit.buildingOrComplex || 'Building Name'}</span>
                      <span className={`badge-tag ${typeClass}`}>{unit.propertyType || 'Flat'}</span>
                    </div>
                    <div className="unit-card-body">
                      <div>
                        <h4 className="unit-no">{unit.propertyName || '101'}</h4>
                        <p className="tenant-name">{tenant.name ? `${tenant.name} ${tenant.surname || ''}` : 'Tenant Assigned'}</p>
                        <div className="status-container">
                          <span className={`status-badge ${paymentStatus}`}>
                            ● {statusLabel}
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

        {/* VACANT UNITS SECTION WITH PROPERTY FILTER */}
        <section className="units-section vacant-section" style={{ marginTop: '20px' }}>
          <div className="section-header-bar1">
            <h3>VACANT UNITS</h3>
            <div className="filters-row" style={{ display: 'flex', gap: '10px' }}>
              
              {/* Vacant Property Filter Dropdown */}
              <div className="mini-dropdown" onClick={() => setIsVacantPropertyDropdownOpen(!isVacantPropertyDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                {selectedVacantPropertyFilter} <span style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
                
                {isVacantPropertyDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '150px' }}>
                    {uniqueBuildings.map((bldg, idx) => (
                      <div 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setSelectedVacantPropertyFilter(bldg); setIsVacantPropertyDropdownOpen(false); }}
                        style={{ padding: '8px 12px', fontSize: '12px', color: '#333', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                      >
                        {bldg}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
          <hr />

          <div className="unit-cards-grid">
            {vacantUnits.length === 0 ? (
              <p style={{ padding: '20px', color: '#777' }}>No vacant units found.</p>
            ) : (
              vacantUnits.map((unit) => {
                const typeClass = unit.propertyType ? unit.propertyType.toLowerCase() : 'flat';
                
                return (
                  <div className="unit-card vacant-card" key={unit.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
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
                      <div className="vacant-footer-info" style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Parking : {unit.parking || 'N/A'}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', textAlign: 'right', paddingTop: '8px' }}>
                      <button 
                        onClick={() => {
                          if (onNavigate) onNavigate('tenant');
                        }} 
                        style={{
                          background: '#b30000',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Add Tenant
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}