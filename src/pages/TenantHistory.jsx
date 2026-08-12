import React, { useState, useEffect } from 'react';
import './TenantHistory.css'; 
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import { handleRoleBasedDelete } from '../approvalHelper'; // Optional: Use if deleting elements here

export default function TenantHistory({ onBack, onNavigate, selectedUnitId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dropdown filter states
  const [propertiesList, setPropertiesList] = useState([]);
  const [buildingsList, setBuildingsList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [currentUnitId, setCurrentUnitId] = useState(selectedUnitId || '101');

  const [unitData, setUnitData] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [allHistoryData, setAllHistoryData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile expand/collapse toggle state
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);

  // Year filter states
  const [selectedYear, setSelectedYear] = useState('All');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const availableYears = ['All', '2026', '2025', '2024', '2023'];

  // Check user role for permissions (Admin vs Collector vs Manager)
  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';

  // 1. Fetch available properties/units on mount with Collector Property Restrictions
  useEffect(() => {
    const fetchPropertiesDropdown = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const allowedProps = userData.allowedProperties || []; // Properties allowed by Admin for Collector

        const querySnapshot = await getDocs(collection(db, 'properties'));
        let props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // IF COLLECTOR: Filter list to only show properties permitted by the admin[cite: 12]
        if (userRole === 'Collector') {
          props = props.filter(p => allowedProps.includes(p.propertyName) || allowedProps.includes(p.buildingOrComplex) || allowedProps.includes(p.propertyId));
        }

        setPropertiesList(props);

        const uniqueBuildings = [...new Set(props.map(item => item.buildingOrComplex).filter(Boolean))];
        setBuildingsList(uniqueBuildings);

        const uniqueUnits = [...new Set(props.map(item => item.propertyName || item.unitId).filter(Boolean))];
        setUnitsList(uniqueUnits);

        if (!currentUnitId && uniqueUnits.length > 0) {
          setCurrentUnitId(uniqueUnits[0]);
        }
      } catch (error) {
        console.error('Error fetching properties filter list:', error);
      }
    };

    fetchPropertiesDropdown();
  }, [userRole]);

  // 2. Fetch Unit Data, Tenant Data, and History whenever currentUnitId changes
  useEffect(() => {
    const fetchHistoryDetails = async () => {
      if (!currentUnitId) return;
      setLoading(true);
      try {
        const propertiesRef = collection(db, 'properties');
        const propSnapshot = await getDocs(propertiesRef);
        let currentUnit = null;
        propSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.propertyName === currentUnitId || data.propertyId === currentUnitId || docSnap.id === currentUnitId) {
            currentUnit = data;
          }
        });
        setUnitData(currentUnit);
        if (currentUnit?.buildingOrComplex) {
          setSelectedBuilding(currentUnit.buildingOrComplex);
        }

        const tenantsRef = collection(db, 'tenants');
        const tenantSnapshot = await getDocs(tenantsRef);
        let currentTenant = null;
        tenantSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (
            data.propertyOrUnit === currentUnitId || 
            data.unitId === currentUnitId || 
            data.propertyName === currentUnitId
          ) {
            currentTenant = { id: docSnap.id, ...data };
          }
        });
        setTenantData(currentTenant);

        let fetchedPayments = [];
        const collectionsToTry = ['payments', 'transactions', 'history'];
        
        for (const colName of collectionsToTry) {
          try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (
                data.propertyOrUnit === currentUnitId || 
                data.unitId === currentUnitId || 
                data.propertyName === currentUnitId ||
                data.unit === currentUnitId
              ) {
                const itemDateStr = data.date || data.createdAt?.toDate?.()?.toLocaleDateString() || '01/03/2026';
                
                let itemYear = '2026';
                if (itemDateStr.includes('/')) {
                  const parts = itemDateStr.split('/');
                  if (parts.length === 3) {
                    itemYear = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                  }
                } else if (itemDateStr.length >= 4) {
                  itemYear = itemDateStr.substring(0, 4);
                }

                fetchedPayments.push({
                  title: data.title || data.paymentType || 'Payment',
                  amount: data.amount || data.finalMonthlyRental || currentUnit?.expectedMonthlyRental || '0',
                  date: itemDateStr,
                  year: itemYear
                });
              }
            });
          } catch (err) {
            console.log(`Collection ${colName} not queried or empty.`);
          }
        }

        if (fetchedPayments.length === 0) {
          const defaultRent = currentUnit?.expectedMonthlyRental || currentTenant?.totalMonthlyRental || '10,000';
          fetchedPayments = [
            { title: 'Deposit Pay', amount: defaultRent, date: '01/03/2026', year: '2026' },
            { title: 'March 2026 Payment', amount: defaultRent, date: '01/04/2026', year: '2026' }
          ];
        }

        setAllHistoryData(fetchedPayments);
      } catch (error) {
        console.error('Error fetching tenant history details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryDetails();
  }, [currentUnitId]);

  // 3. Filter history by selected year
  useEffect(() => {
    if (selectedYear === 'All') {
      setFilteredHistoryData(allHistoryData);
    } else {
      const filtered = allHistoryData.filter(item => item.year === selectedYear);
      setFilteredHistoryData(filtered);
    }
  }, [allHistoryData, selectedYear]);

  const handleBuildingChange = (e) => {
    const bldg = e.target.value;
    setSelectedBuilding(bldg);
    const matchingUnits = propertiesList.filter(p => !bldg || p.buildingOrComplex === bldg);
    if (matchingUnits.length > 0) {
      setCurrentUnitId(matchingUnits[0].propertyName || matchingUnits[0].unitId);
    }
  };

  const handleUnitChange = (e) => {
    setCurrentUnitId(e.target.value);
  };

  const handleDownloadHistoryPDF = (item) => {
    const docPdf = new jsPDF();
    const unitName = currentUnitId;
    const tenantName = tenantData ? `${tenantData.name || ''} ${tenantData.surname || ''}`.trim() : 'Sandeep Ghige';

    docPdf.setFontSize(18);
    docPdf.setTextColor(179, 0, 0); 
    docPdf.text('Transaction Receipt', 14, 20);

    docPdf.setFontSize(10);
    docPdf.setTextColor(100);
    docPdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

    let startY = 40;
    docPdf.setFontSize(11);

    const details = [
      { label: 'Unit / Property', value: unitName },
      { label: 'Tenant Name', value: tenantName },
      { label: 'Transaction Type', value: item.title },
      { label: 'Amount Paid', value: `Rs. ${item.amount}` },
      { label: 'Date', value: item.date },
      { label: 'Status', value: 'Success / Completed' }
    ];

    details.forEach((detail) => {
      docPdf.setTextColor(100, 100, 100);
      docPdf.text(`${detail.label}:`, 14, startY);
      docPdf.setTextColor(20, 20, 20);
      docPdf.text(String(detail.value), 70, startY);
      docPdf.setDrawColor(220, 220, 220);
      docPdf.line(14, startY + 3, 196, startY + 3);
      startY += 10;
    });

    docPdf.save(`${unitName}_${item.title.replace(/\s+/g, '_')}_Receipt.pdf`);
  };

  const handleDownloadAllHistoryPDF = () => {
    const docPdf = new jsPDF();
    const unitName = currentUnitId;
    const tenantName = tenantData ? `${tenantData.name || ''} ${tenantData.surname || ''}`.trim() : 'Sandeep Ghige';

    docPdf.setFontSize(18);
    docPdf.setTextColor(179, 0, 0); 
    docPdf.text(`Payment History Report - Unit ${unitName}`, 14, 20);

    docPdf.setFontSize(10);
    docPdf.setTextColor(100);
    docPdf.text(`Tenant: ${tenantName} | Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

    let startY = 38;
    docPdf.setFontSize(11);

    filteredHistoryData.forEach((item, index) => {
      if (startY > 270) {
        docPdf.addPage();
        startY = 20;
      }

      docPdf.setTextColor(179, 0, 0);
      docPdf.text(`Record #${index + 1}: ${item.title}`, 14, startY);
      startY += 6;

      docPdf.setTextColor(80, 80, 80);
      docPdf.text(`Amount: Rs. ${item.amount}  |  Date: ${item.date}  |  Year: ${item.year}`, 14, startY);
      
      docPdf.setDrawColor(220, 220, 220);
      docPdf.line(14, startY + 4, 196, startY + 4);
      startY += 10;
    });

    docPdf.save(`${unitName}_Complete_History_Report.pdf`);
  };

  // Role-based delete handler (Sends approval request if manager, deletes if admin)
  const handleDeleteTenant = async () => {
    if (!tenantData?.id) {
      alert('No active tenant record found to delete.');
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('userData') || '{}');
    const tenantName = `${tenantData.name || ''} ${tenantData.surname || ''}`.trim();

    await handleRoleBasedDelete(
      userRole,
      loggedInUser,
      'tenants',
      tenantData.id,
      tenantName
    );
  };

  const handleViewHistoryItem = (item) => {
    const unitName = currentUnitId;
    const tenantName = tenantData ? `${tenantData.name || ''} ${tenantData.surname || ''}`.trim() : 'Sandeep Ghige';
    alert(`Transaction Details:\n\nUnit: ${unitName}\nTenant: ${tenantName}\nType: ${item.title}\nAmount: Rs.${item.amount}\nDate: ${item.date}`);
  };

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

          {/* NOTIFICATION BUTTON SHOWN ONLY TO ADMIN OWNER */}
          {isAdmin && (
            <button className="icon-btn notification-btn" aria-label="Notifications" onClick={() => onNavigate('adminApprovals')}>
              <img src="/images/n.png" alt="Notifications" style={{ height: '22px', objectFit: 'contain' }} />
            </button>
          )}

          <button className="icon-btn menu-btn" aria-label="Menu" onClick={() => setIsMenuOpen(true)}>
            ☰
          </button>
        </div>
      </header>

      <SideMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={onNavigate} />

      {/* --- MAIN CONTENT --- */}
      <main className="tenant-history-content">
        <div className="form-header" style={{ marginBottom: "5px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
            <h2>Tenant Profile</h2>
          </div>

          {/* Property & Unit Selector Filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <select 
              value={selectedBuilding} 
              onChange={handleBuildingChange}
              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d8d0d0', color: '#b30000', background: '#e7e1e1' }}
            >
              <option value="">All Buildings</option>
              {buildingsList.map((bldg, idx) => (
                <option key={idx} value={bldg}>{bldg}</option>
              ))}
            </select>

            <select 
              value={currentUnitId} 
              onChange={handleUnitChange}
              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #b30000', background: '#b30000', color: '#fff', fontWeight: 'bold' }}
            >
              {propertiesList
                .filter(p => !selectedBuilding || p.buildingOrComplex === selectedBuilding)
                .map((prop, idx) => {
                  const unitVal = prop.propertyName || prop.unitId;
                  return <option key={idx} value={unitVal}>Unit {unitVal}</option>;
                })}
            </select>
          </div>
        </div>
        <hr />

        {/* TENANT PROFILE CARD */}
        {loading ? (
          <p style={{ padding: '15px', textAlign: 'center' }}>Loading profile...</p>
        ) : (
          <div className="profile-details-card" style={{ marginBottom: '15px' }}>
            <div className="profile-card-header">
              <div className="profile-title-group" style={{ textAlign: 'left' }}>
                <span className="building-name-small" style={{ marginBottom: '-7px' }}>
                  {unitData?.buildingOrComplex || tenantData?.buildingOrComplex || selectedBuilding || 'Building Name'}
                </span>
                <div className="profile-title-row" style={{ marginBottom: '-7px' }}>
                  <h3>{currentUnitId}</h3>
                </div>
                <span className="tenant-name-main">
                  {tenantData ? `${tenantData.name || ''} ${tenantData.surname || ''}`.trim() : 'Sandeep Ghige'}
                </span>
              </div>

              <div className="profile-top-right-group">
                <div className="profile-top-badges">
                  {userRole !== 'Collector' && (
                    <button className="edit-profile-btn" aria-label="Edit Profile" onClick={() => onNavigate('tenant')}>
                      <img src='images/edit.png' alt="Edit" />
                    </button>
                  )}
                </div>
                <div className="tenant-id-wrapper">
                  <span className={`badge-overdue ${tenantData?.paymentStatus || 'overdue'}`}>
                    ● {tenantData?.paymentStatus ? tenantData.paymentStatus.charAt(0).toUpperCase() + tenantData.paymentStatus.slice(1) : 'Overdue'}
                  </span>
                  <span className="badge-flat">{unitData?.propertyType || 'Flat'}</span>
                  <p className="tenant-id-text">Tenant ID : {tenantData?.tenantId || '[Tenant Redacted]'}</p>
                </div>
              </div>
            </div>

            {isProfileExpanded && (
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
                </div>

                <div className="info-column">
                  <h4>Commercial Information</h4>
                  <p><strong>Move IN Date :</strong> {tenantData?.moveInDate || 'N/A'}</p>
                  <p><strong>Security Deposit :</strong> {tenantData?.securityDeposit || 'N/A'}</p>
                  <p><strong>Total Monthly Rental :</strong> {tenantData?.totalMonthlyRental || unitData?.expectedMonthlyRental || 'N/A'}</p>
                  <p><strong>Parking :</strong> {tenantData?.parking || 'N/A'}</p>
                  <p><strong>Monthly Payment :</strong> {tenantData?.monthlyPayment || 'N/A'}</p>
                  <p><strong>Agreement End Date :</strong> {tenantData?.agreementEndDate || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="show-less-bar" onClick={() => setIsProfileExpanded(!isProfileExpanded)} style={{ cursor: 'pointer' }}>
              <span>{isProfileExpanded ? 'Show Less' : 'Show More'}</span>
              <span className="arrow-up">{isProfileExpanded ? '▲' : '▼'}</span>
            </div>
          </div>
        )}

        {/* HISTORY SECTION */}
        <div className="history-section-header">
          <h3>History</h3>
          <div className="year-dropdown" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}>
            <span>{selectedYear}</span>
            <span className="arrow" style={{ height: '20px', marginLeft: '6px' }}><img src='images/arrow.png' alt="Arrow"></img></span>
            
            {isYearDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10,
                width: '95px',
                marginTop: '4px'
              }}>
                {availableYears.map((yr) => (
                  <div 
                    key={yr}
                    onClick={() => { setSelectedYear(yr); setIsYearDropdownOpen(false); }}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: selectedYear === yr ? '#b30000' : '#333',
                      fontWeight: selectedYear === yr ? 'bold' : 'normal',
                      borderBottom: '1px solid #f0f0f0',
                      textAlign: 'center'
                    }}
                  >
                    {yr}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="history-list">
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading history...</p>
          ) : filteredHistoryData.length > 0 ? (
            filteredHistoryData.map((item, index) => (
              <div className="history-row" key={index}>
                <div className="history-item-title">
                  {item.title} <span style={{ fontSize: '10px', color: '#888', marginLeft: '6px' }}>({item.year})</span>
                </div>
                <div className="history-item-details">
                  <span className="history-amount">Rs.{item.amount}</span>
                  <span className="history-date">{item.date}</span>
                  <button className="action-eye-btn" aria-label="View" onClick={() => handleViewHistoryItem(item)}>
                    <img src="images/eye.png" alt="View"></img>
                  </button>
                  <button className="action-download-btn" aria-label="Download" onClick={() => handleDownloadHistoryPDF(item)}>
                    <img src="images/down.png" alt="Download"></img>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ padding: '25px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
              No history records found for {selectedYear} in unit {currentUnitId}.
            </p>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="profile-action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', marginBottom:'80px' }}>
          <button className="download-tenant-btn" onClick={handleDownloadAllHistoryPDF}>
            Download All History
          </button>
          
          <button className="record-payment-btn" onClick={() => onNavigate('recordPayment')} style={{ marginTop: '0px' }}>
            Record Payment
          </button>

          {userRole !== 'Collector' && (
            <button className="delete-tenant-btn" onClick={handleDeleteTenant} style={{ background: '#b30000', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer'}}>
              Delete Tenant
            </button>
          )}
        </div>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}