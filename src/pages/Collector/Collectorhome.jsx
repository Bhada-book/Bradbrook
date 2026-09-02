import React, { useState, useEffect } from 'react';
import BottomNavWithPopup from '../BottomNavWithPopup.jsx';
import SideMenuDrawer from '../SideMenuDrawer.jsx';
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../navbar.jsx';
import '../Collector/Collectorhome.css';

export default function CollectorHome({ onNavigate }) {
  const [propertiesList, setPropertiesList] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [notificationsData, setNotificationsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState('July 2026');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSummaryPropertyDropdownOpen, setIsSummaryPropertyDropdownOpen] = useState(false);
const [selectedSummaryProperty, setSelectedSummaryProperty] = useState('All');


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

 useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Collector la allow kelelya properties/buildings localstorage madhun ghene
        const allowedPropsRaw = localStorage.getItem('allowedProperties');
        let allowedArray = [];
        try {
          allowedArray = allowedPropsRaw ? JSON.parse(allowedPropsRaw) : [];
        } catch (e) {
          allowedArray = [];
        }

        const propSnapshot = await getDocs(collection(db, 'properties'));
        let props = propSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Jar allowed properties set asel, tar fakt tich properties filter kara
        if (allowedArray.length > 0) {
          props = props.filter(prop => 
            allowedArray.includes(prop.id) || 
            allowedArray.includes(prop.buildingOrComplex) ||
            allowedArray.includes(prop.propertyName)
          );
        }

        setPropertiesList(props);

        const tenantSnapshot = await getDocs(collection(db, 'tenants'));
        const tenants = tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTenantsList(tenants);

        const paymentSnapshot = await getDocs(collection(db, 'payments'));
        const payments = paymentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPaymentsList(payments);
      } catch (error) {
        console.error('Error fetching collector home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Selected month ani property nusar payments calculate karne
const filteredPayments = paymentsList.filter(payment => {
    const matchesMonth = selectedSummaryMonth ? payment.month === selectedSummaryMonth : true;
    
    const matchesProperty = selectedSummaryProperty === 'All' || 
      payment.buildingName === selectedSummaryProperty || 
      payment.propertyOrUnit === selectedSummaryProperty;

    return matchesMonth && matchesProperty;
  });

  // Total Received, Overdue, Old Pending calculation
  const totalReceived = filteredPayments
    .filter(p => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'received')
    .reduce((sum, p) => sum + Number(p.amount || p.totalMonthlyRental || 0), 0);

  const totalOverdue = filteredPayments
    .filter(p => p.status?.toLowerCase() === 'overdue')
    .reduce((sum, p) => sum + Number(p.amount || p.totalMonthlyRental || 0), 0);

  const totalOldPending = filteredPayments
    .filter(p => p.status?.toLowerCase() === 'old pending' || p.status?.toLowerCase() === 'pending')
    .reduce((sum, p) => sum + Number(p.amount || p.totalMonthlyRental || 0), 0);

  // Format numbers to Indian currency style (e.g., 10,000/-)
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN') + '/-';
  };


  const unitsData = propertiesList.map(prop => {
    const unitKey = prop.propertyName || prop.unitId || prop.id;
    const matchedTenant = tenantsList.find(t => 
      t.propertyOrUnit === unitKey || t.propertyUnit === unitKey || t.propertyName === unitKey
    );
    const matchedPayment = paymentsList.find(p => 
      p.propertyOrUnit === unitKey || p.unitId === unitKey
    );

    const isOccupied = Boolean(matchedTenant);
    return {
      id: prop.id,
      unitNumber: unitKey,
      buildingName: prop.buildingOrComplex || 'Building Name',
      propertyType: prop.propertyType || 'Commercial',
      tenantName: matchedTenant ? `${matchedTenant.name || ''} ${matchedTenant.surname || ''}`.trim() : 'Vacant Unit',
      amount: matchedTenant?.totalMonthlyRental || prop.expectedMonthlyRental || '10,000/-',
      status: matchedPayment?.status || matchedTenant?.paymentStatus || (isOccupied ? 'Paid' : 'Vacant'),
      squareFeet: prop.squareFeet || '750 sqft',
      parking: prop.parking || 'Parking : Two Wheeler + Four Wheeler',
      isOccupied
    };
  });

  

  const displayUnits = unitsData.length > 0 ? unitsData : [
    { id: '1', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Commercial', tenantName: 'Sandeep Ghige', amount: '10,000/-', status: 'Paid', isOccupied: true },
    { id: '2', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Flat', tenantName: 'Sandeep Ghige', amount: '10,000/-', status: 'Overdue', isOccupied: true },
    { id: '3', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Commercial', tenantName: 'Sandeep Ghige', amount: '10,000/-', status: 'Paid', isOccupied: true },
    { id: '4', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Flat', tenantName: 'Sandeep Ghige', amount: '10,000/-', status: 'Overdue', isOccupied: true },
    { id: '5', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Commercial', tenantName: 'Sandeep Ghige', amount: '10,000/-', status: 'Paid', isOccupied: true },
    { id: '6', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Commercial', tenantName: '', amount: '10,000/-', status: 'Vacant', isOccupied: false, squareFeet: '750 sqft', parking: 'Parking : Two Wheeler + Four Wheeler' },
    { id: '7', unitNumber: '101', buildingName: 'Building Name', propertyType: 'Flat', tenantName: '', amount: '10,000/-', status: 'Vacant', isOccupied: false, squareFeet: '750 sqft', parking: 'Parking : Two Wheeler + Four Wheeler' },
  ];

  const searchedUnits = displayUnits.filter(unit => {
    const query = searchQuery.toLowerCase();
    return (
      unit.unitNumber.toLowerCase().includes(query) ||
      unit.tenantName.toLowerCase().includes(query) ||
      unit.buildingName.toLowerCase().includes(query)
    );
  });

const filteredUnits = displayUnits.filter(unit => {
    const query = searchQuery.toLowerCase();
    
    // Search query match
    const matchesSearch = 
      unit.unitNumber.toLowerCase().includes(query) ||
      unit.tenantName.toLowerCase().includes(query) ||
      unit.buildingName.toLowerCase().includes(query);

    // Property dropdown filter match (e.g., 'All', 'Commercial', 'Flat')
    const matchesProperty = selectedPropertyFilter === 'All' || 
      unit.propertyType.toLowerCase() === selectedPropertyFilter.toLowerCase();

    // Status dropdown filter match (e.g., 'All', 'Paid', 'Overdue')
    const matchesStatus = selectedStatusFilter === 'All' || 
      unit.status.toLowerCase() === selectedStatusFilter.toLowerCase();

    return matchesSearch && matchesProperty && matchesStatus;
  });

  // Aata filtered units madhun occupied ani vacant separate kara
  const occupiedUnits = filteredUnits.filter(u => u.isOccupied);
  const vacantUnits = filteredUnits.filter(u => !u.isOccupied);

  const occupiedCount = String(occupiedUnits.length).padStart(3, '0');
  const vacantCount = String(vacantUnits.length).padStart(3, '0');

  // Units section sathi property dropdown state add kara (jar nasel tar)
  const [isUnitPropertyDropdownOpen, setIsUnitPropertyDropdownOpen] = useState(false);
  const [selectedUnitProperty, setSelectedUnitProperty] = useState('All');

  return (
    <div className="collector-container">
      <Navbar 
        onNavigate={onNavigate} 
        notificationsData={notificationsData} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      <main className="collector-content">
        
        <section className="collector-summary-section">
         <div className="collector-summary-top-bar">
            <span className="collector-summary-title">{selectedSummaryMonth} - Collection Summary</span>
            
            {/* Property Filter Dropdown */}
            <div 
              className="collector-year-dropdown" 
              onClick={() => setIsSummaryPropertyDropdownOpen(!isSummaryPropertyDropdownOpen)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <span>{selectedSummaryProperty}</span>
              <span className="collector-arrow">
                <img src='images/arrow.png' alt="Arrow" className="red-arrow" />
              </span>

              {isSummaryPropertyDropdownOpen && (
                <div className="collector-dropdown-menu" style={{ display: 'block', position: 'absolute', top: '100%', right: '0', background: '#fff', zIndex: 10, boxShadow: '0px 4px 10px rgba(0,0,0,0.1)', borderRadius: '6px', minWidth: '140px', marginTop: '5px' }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); setSelectedSummaryProperty('All'); setIsSummaryPropertyDropdownOpen(false); }} 
                    className="collector-dropdown-item"
                    style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}
                  >
                    All Properties
                  </div>
                  {propertiesList.map(prop => {
                    const propName = prop.buildingOrComplex || prop.propertyName || prop.unitId;
                    return (
                      <div 
                        key={prop.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedSummaryProperty(propName); setIsSummaryPropertyDropdownOpen(false); }} 
                        className="collector-dropdown-item"
                        style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}
                      >
                        {propName}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        <div className="collector-summary-cards-grid">
            <div className="collector-summary-card">
              <span className="collector-card-label">Rs.</span>
              <h3>{formatCurrency(totalReceived)}</h3>
              <p className="collector-status-green">● Received</p>
            </div>
            <div className="collector-summary-card">
              <span className="collector-card-label">Rs.</span>
              <h3>{formatCurrency(totalOverdue)}</h3>
              <p className="collector-status-red">● Overdue</p>
            </div>
            <div className="collector-summary-card">
              <span className="collector-card-label">Rs.</span>
              <h3>{formatCurrency(totalOldPending)}</h3>
              <p className="collector-status-red">● Old Pending</p>
            </div>
          </div>

          <div className="collector-occupancy-pill">
            Occupied Units : {occupiedCount} &nbsp;&nbsp;|&nbsp;&nbsp; Vacant Units : {vacantCount}
          </div>
        </section>

        <section className="collector-transactions-section">
          <div className="collector-section-header">
            <h3>UNITS</h3>
            <div className="collector-filters-row">
            <div className="collector-mini-dropdown" onClick={() => setIsUnitPropertyDropdownOpen(!isUnitPropertyDropdownOpen)}>
                <span>{selectedUnitProperty}</span>
                <span><img src='images/arrow.png' alt="Arrow" /></span>
                {isUnitPropertyDropdownOpen && (
                  <div className="collector-dropdown-menu">
                    <div onClick={(e) => { e.stopPropagation(); setSelectedUnitProperty('All'); setIsUnitPropertyDropdownOpen(false); }} className="collector-dropdown-item">All</div>
                    {['Commercial', 'Flat'].map(prop => (
                      <div key={prop} onClick={(e) => { e.stopPropagation(); setSelectedUnitProperty(prop); setIsUnitPropertyDropdownOpen(false); }} className="collector-dropdown-item">{prop}</div>
                    ))}
                  </div>
                )}
              </div>

             <div className="collector-mini-dropdown" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}>
                <span>{selectedStatusFilter}</span>
                <span><img src='images/arrow.png' alt="Arrow" /></span>
                {isStatusDropdownOpen && (
                  <div className="collector-dropdown-menu">
                    {['All', 'Paid', 'Overdue'].map(status => (
                      <div 
                        key={status} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedStatusFilter(status); 
                          setIsStatusDropdownOpen(false); 
                        }} 
                        className="collector-dropdown-item"
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="collector-divider" />

          <div className="collector-units-grid">
            {occupiedUnits.map((unit, index) => (
              <div key={index} onClick={() => onNavigate('profile')} className="collector-unit-card">
                <div className="collector-unit-top">
                  <span className="collector-building-name">{unit.buildingName}</span>
                  <span className="collector-property-tag">{unit.propertyType}</span>
                </div>
                <div className="collector-unit-middle">
                  <span className="collector-unit-number">{unit.unitNumber}</span>
                  <span className="collector-unit-amount">Rs.{unit.amount}</span>
                </div>
                <div className="collector-tenant-name">{unit.tenantName}</div>
                <div className={`collector-status-indicator ${unit.status.toLowerCase() === 'paid' ? 'green' : 'red'}`}>
                  <span>●</span> {unit.status}
                </div>
              </div>
            ))}
          </div>
        </section>

       <section className="collector-transactions-section" style={{ marginTop: '20px' }}>
          <div className="collector-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>VACANT UNITS</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Add Unit Button */}
              <button 
                onClick={() => {
                  if (onNavigate) onNavigate('property'); 
                }} 
                style={{
                  background: '#b30000',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center', // Fix kele (alignItem aivji alignItems)
                  gap: '4px'
                }}
              >
                + Add Unit
              </button>

             
            </div>
          </div>

          <hr className="collector-divider" />

          <div className="collector-units-grid">
            {vacantUnits.map((unit, index) => (
              <div key={index} className="collector-unit-card">
                <div className="collector-unit-top">
                  <span className="collector-building-name">{unit.buildingName}</span>
                  <span className="collector-property-tag">{unit.propertyType}</span>
                </div>
                <div className="collector-unit-middle">
                  <span className="collector-unit-number">{unit.unitNumber}</span>
                  <span className="collector-unit-amount">Rs.{unit.amount}</span>
                </div>
                <div className="collector-vacant-footer">
                  <div>{unit.squareFeet}</div>
                  <div>{unit.parking}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}