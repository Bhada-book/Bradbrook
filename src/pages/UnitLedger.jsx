import React, { useState, useEffect } from 'react';
import './UnitLedger.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from './navbar.jsx';

export default function UnitLedger({ onBack, onNavigate, selectedUnitId }) {


  // Filter dropdown lists
  const [propertiesList, setPropertiesList] = useState([]);
  const [buildingsList, setBuildingsList] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');

  // Year filter states
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isSummaryYearDropdownOpen, setIsSummaryYearDropdownOpen] = useState(false);
  const [isLedgerYearDropdownOpen, setIsLedgerYearDropdownOpen] = useState(false);
  const availableYears = ['2026', '2025', '2024', '2023', 'All'];

  const [allLedgerData, setAllLedgerData] = useState([]);
  const [filteredLedgerData, setFilteredLedgerData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    received: '00,00,000/-',
    overdue: '00,00,000/-',
    oldPending: '00,00,000/-'
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch properties & buildings on mount for filter dropdowns
  useEffect(() => {
    const fetchPropertiesDropdown = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'properties'));
        const props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPropertiesList(props);

        const uniqueBuildings = [...new Set(props.map(item => item.buildingOrComplex).filter(Boolean))];
        setBuildingsList(uniqueBuildings);

        if (uniqueBuildings.length > 0 && !selectedBuilding) {
          setSelectedBuilding(uniqueBuildings[0]);
        }
      } catch (error) {
        console.error('Error fetching properties list:', error);
      }
    };

    fetchPropertiesDropdown();
  }, []);

  // 2. Fetch building-wide ledger transactions and calculate summary when selectedBuilding changes
  useEffect(() => {
    const fetchBuildingLedgerDetails = async () => {
      if (!selectedBuilding) return;
      setLoading(true);
      try {
        // Find all unit/property names belonging to this building
        const matchingUnits = propertiesList
          .filter(p => p.buildingOrComplex === selectedBuilding)
          .map(p => p.propertyName || p.unitId);

        let fetchedPayments = [];
        const collectionsToTry = ['payments', 'transactions', 'history'];

        for (const colName of collectionsToTry) {
          try {
            const snapshot = await getDocs(collection(db, colName));
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const unitKey = data.propertyOrUnit || data.unitId || data.propertyName || data.unit;
              
              // Include record if it matches any unit in this building
              if (matchingUnits.includes(unitKey)) {
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
                  title: `${unitKey} - ${data.title || data.paymentType || 'Payment'}`,
                  amount: data.amount || '10,000',
                  date: itemDateStr,
                  year: itemYear,
                  status: data.status || 'received'
                });
              }
            });
          } catch (err) {
            console.log(`Collection ${colName} empty or error.`);
          }
        }

        if (fetchedPayments.length === 0) {
          fetchedPayments = [
            { title: 'Unit 101 - Deposit Pay', amount: '10,000', date: '01/03/2026', year: '2026', status: 'received' },
            { title: 'Unit 102 - March Payment', amount: '10,000', date: '01/04/2026', year: '2026', status: 'received' },
            { title: 'Unit 103 - April Payment', amount: '10,000', date: '01/05/2026', year: '2026', status: 'overdue' },
          ];
        }

        setAllLedgerData(fetchedPayments);
      } catch (error) {
        console.error('Error fetching building ledger data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingLedgerDetails();
  }, [selectedBuilding, propertiesList]);

  // 3. Filter ledger and summary totals based on selected Year
  useEffect(() => {
    let yearFiltered = allLedgerData;
    if (selectedYear !== 'All') {
      yearFiltered = allLedgerData.filter(item => item.year === selectedYear);
    }
    setFilteredLedgerData(yearFiltered);

    let totalReceived = 0;
    let totalOverdue = 0;
    yearFiltered.forEach(p => {
      const amt = parseFloat(String(p.amount).replace(/[^0-9.]/g, '')) || 0;
      if (p.status === 'received' || p.type === 'Received') {
        totalReceived += amt;
      } else {
        totalOverdue += amt;
      }
    });

    setSummaryData({
      received: totalReceived > 0 ? `${totalReceived.toLocaleString('en-IN')}/-` : '00,00,000/-',
      overdue: totalOverdue > 0 ? `${totalOverdue.toLocaleString('en-IN')}/-` : '00,00,000/-',
      oldPending: '00,00,000/-'
    });
  }, [allLedgerData, selectedYear]);

  // Handle Building Filter Change
  const handleBuildingChange = (e) => {
    setSelectedBuilding(e.target.value);
  };
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
    <div className="unit-ledger-container" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* --- TOP NAVBAR --- */}
<Navbar notificationsData={notificationsData} onNavigate={onNavigate} />

      {/* --- MAIN CONTENT --- */}
      <main className="unit-ledger-content">
        <div className="form-header" style={{ marginBottom: '9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
            <h2>Property Collection</h2>
          </div>

          {/* Building / Property Wise Selector Filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <select 
              value={selectedBuilding} 
              onChange={handleBuildingChange}
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #b30000', color: '#fff', background: '#b30000', fontWeight: 'bold' }}
            >
              <option value="" disabled>Select Building</option>
              {buildingsList.map((bldg, idx) => (
                <option key={idx} value={bldg}>{bldg}</option>
              ))}
            </select>
          </div>
        </div>
        <hr />

        {/* COLLECTION SUMMARY CARD WITH YEAR FILTER */}
        <section className="ledger-summary-section">
          <div className="ledger-summary-top-bar">
            <span className="summary-title-tab">Collection Summary ({selectedBuilding || 'All Properties'})</span>
            <div className="year-dropdown" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsSummaryYearDropdownOpen(!isSummaryYearDropdownOpen)}>
              <span>{selectedYear}</span>
              <span className="arrow" style={{ height: '20px', marginLeft: '4px' }}><img src='images/arrow.png' alt="Arrow"></img></span>

              {isSummaryYearDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '80px' }}>
                  {availableYears.map((yr) => (
                    <div 
                      key={yr} 
                      onClick={(e) => { e.stopPropagation(); setSelectedYear(yr); setIsSummaryYearDropdownOpen(false); }}
                      style={{ padding: '6px 10px', fontSize: '12px', color: selectedYear === yr ? '#b30000' : '#333', textAlign: 'center', borderBottom: '1px solid #eee' }}
                    >
                      {yr}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="summary-cards-grid">
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>{summaryData.received}</h3>
              <p className="status-green">● Received</p>
            </div>
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>{summaryData.overdue}</h3>
              <p className="status-red">● Overdue</p>
            </div>
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>{summaryData.oldPending}</h3>
              <p className="status-red">● Old Pending</p>
            </div>
          </div>
        </section>

        {/* LEDGER TRANSACTIONS SECTION WITH YEAR FILTER */}
        <section className="ledger-transactions-section">
          <div className="section-header-bar">
            <h3>Building Ledger Transactions</h3>
            <div className="year-dropdown" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsLedgerYearDropdownOpen(!isLedgerYearDropdownOpen)}>
              <span>{selectedYear}</span>
              <span className="arrow" style={{ height: '20px', marginLeft: '4px' }}><img src='images/arrow.png' alt="Arrow"></img></span>

              {isLedgerYearDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '80px' }}>
                  {availableYears.map((yr) => (
                    <div 
                      key={yr} 
                      onClick={(e) => { e.stopPropagation(); setSelectedYear(yr); setIsLedgerYearDropdownOpen(false); }}
                      style={{ padding: '6px 10px', fontSize: '12px', color: selectedYear === yr ? '#b30000' : '#333', textAlign: 'center', borderBottom: '1px solid #eee' }}
                    >
                      {yr}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ledger-table-card">
            {loading ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>Loading ledger...</p>
            ) : filteredLedgerData.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No ledger records found for {selectedYear} in {selectedBuilding}.</p>
            ) : (
              filteredLedgerData.map((item, index) => (
                <div className="ledger-row" key={index}>
                  <span className="ledger-item-title">{item.title}</span>
                  <span className="ledger-item-amount">Rs.{item.amount}</span>
                  <span className="ledger-item-date">{item.date}</span>
                  <div className="ledger-item-actions">
                    <button className="action-eye-btn" aria-label="View"><img src='images/eye.png' alt="View"></img></button>
                    <button className="action-download-btn" aria-label="Download"><img src='images/down.png' alt="Download"></img></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="ledger-action-buttons">
          <button className="download-ledger-btn">Download</button>
          <button 
            className="record-payment-btn"
            onClick={() => onNavigate('recordPayment')}
          >
            Record Payment
          </button>
          <button className="send-ledger-btn">
            <span className="whatsapp-icon"><img src='images/whatsup.png' alt="WhatsApp"></img></span> Send Ledger
          </button>
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}