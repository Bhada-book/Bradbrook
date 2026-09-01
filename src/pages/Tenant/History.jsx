import React, { useState, useEffect } from 'react';
import './History.css';
import Side from '../../pages/Tenant/Side';
import SimpleBottomNav from './SimpleBottomNav.jsx';
import { FaChevronDown, FaEye, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { db } from '../../firebase.js'; 
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function TenantHistory({ onBack, onNavigate, isMenuOpen, setIsMenuOpen, tenantIdProp = "0987654321" }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const availableYears = Array.from({ length: 4 }, (_, i) => (new Date().getFullYear() - i).toString());

  const [tenantInfo, setTenantInfo] = useState({
    name: 'Loading...',
    buildingOrComplex: 'Loading...',
    roomNumber: '---'
  });

  useEffect(() => {
    async function fetchTenantDataAndHistory() {
      try {
        // 1. Fetch Tenant Profile Details
        if (tenantIdProp) {
          const qTenant = query(collection(db, 'tenants'), where('id', '==', tenantIdProp));
          const querySnapshot = await getDocs(qTenant);

          if (!querySnapshot.empty) {
            setTenantInfo(querySnapshot.docs[0].data());
          } else {
            const tenantDocRef = doc(db, 'tenants', tenantIdProp);
            const tenantDocSnap = await getDoc(tenantDocRef);
            if (tenantDocSnap.exists()) {
              setTenantInfo(tenantDocSnap.data());
            } else {
              setTenantInfo({ 
                name: 'Default Tenant', 
                buildingOrComplex: 'Building A', 
                roomNumber: '101' 
              });
            }
          }
        }

        // 2. Fetch Payment History Records (Checking current tenantIdProp and legacy fallback ID)
        const paymentsRef = collection(db, 'payments');
        
        const qPaymentsCurrent = query(
          paymentsRef, 
          where('tenantId', '==', tenantIdProp),
          where('status', '==', 'Approved')
        );
        
        const qPaymentsLegacy = query(
          paymentsRef, 
          where('tenantId', '==', '0987654321'),
          where('status', '==', 'Approved')
        );

        const [snapshotCurrent, snapshotLegacy] = await Promise.all([
          getDocs(qPaymentsCurrent), 
          getDocs(qPaymentsLegacy)
        ]);
        
        // Combine results uniquely using a Map to avoid duplicates
        const paymentMap = new Map();
        snapshotCurrent.forEach((docSnap) => {
          paymentMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
        });
        snapshotLegacy.forEach((docSnap) => {
          paymentMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
        });

        setHistoryData(Array.from(paymentMap.values()));
      } catch (error) {
        console.error('Error fetching history or tenant profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTenantDataAndHistory();
  }, [tenantIdProp]);

  // Filter history records based on the selected year
  const filteredHistoryData = historyData.filter((item) => {
    if (!item.date) return false;
    return item.date.includes(selectedYear);
  });

  // Function to generate and download history as PDF
  const handleDownloadPdf = () => {
    if (!filteredHistoryData || filteredHistoryData.length === 0) {
      alert(`No history records available for ${selectedYear} to download.`);
      return;
    }

    const printWindow = window.open('', '_blank');
    const rowsHTML = filteredHistoryData.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title || item.paymentType || 'Rent Payment'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.amount || '00,000/-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.date || 'N/A'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.status || 'Approved'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Tenant History Report - ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #333; }
            h2 { color: #b30000; margin-bottom: 5px; }
            .meta { margin-bottom: 20px; font-size: 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f8f9fa; padding: 12px 10px; text-align: left; border-bottom: 2px solid #ccc; font-size: 14px; }
            td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>Unit History Report (${selectedYear})</h2>
          <div class="meta">
            <p><strong>Tenant:</strong> ${tenantInfo.name || 'N/A'} ${tenantInfo.surname || ''} (${tenantInfo.buildingOrComplex || 'Building'} - Unit ${tenantInfo.roomNumber || tenantInfo.flatNo || 'N/A'})</p>
            <p><strong>Tenant ID:</strong> ${tenantIdProp}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Payment Title</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="tenant-container">
      {/* Top Header */}
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

      {/* Main Content Area */}
      <main className="tenant-main">
        {/* Back and Title Row */}
        <div className="page-header-row">
          <button className="back-btn" onClick={onBack}>
            <FaArrowLeft />
          </button>
          <h2>Unit History</h2>
        </div>

        {/* Tenant Info Card */}
        <div className="user-info-strip">
          <div className="building-details">
            <span className="building-label">{tenantInfo.buildingOrComplex || tenantInfo.buildingName || 'Building Name'}</span>
            <h2 className="room-number">{tenantInfo.roomNumber || tenantInfo.flatNo || tenantInfo.roomNo || tenantInfo.propertyOrUnit || '101'}</h2>
            <p className="tenant-name">{tenantInfo.name ? `${tenantInfo.name} ${tenantInfo.surname || ''}` : 'Tenant Name'}</p>
          </div>
          <div className="tenant-meta">
            <span className="flat-badge">Flat</span>
            <span className="tenant-id">Tenant ID : {tenantIdProp}</span>
          </div>
        </div>

        {/* History Section Header with Dropdown */}
        <div className="ledger-header-row" style={{ position: 'relative' }}>
          <h3 className="ledger-title">History Records</h3>
          <div 
            className="year-dropdown small" 
            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' ,color:'#b30000' }}
          >
            <span>{selectedYear}</span>
            <FaChevronDown />
          </div>

          {/* Year Dropdown Menu */}
          {isYearDropdownOpen && (
            <div style={{ 
              position: 'absolute', top: '100%', right: 0, background: '#fff', 
              border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '120px' 
            }}>
              {availableYears.map((year, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { 
                    setSelectedYear(year); 
                    setIsYearDropdownOpen(false); 
                  }}
                  style={{ padding: '8px 12px', fontSize: '12px', color: '#333', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="ledger-table">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading history...</div>
          ) : filteredHistoryData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No history records found for {selectedYear}.</div>
          ) : (
            filteredHistoryData.map((item, idx) => {
              const handleViewReceipt = (e) => {
                e.preventDefault();
                if (!item.receiptUrl) return;
                
                const win = window.open();
                win.document.write(`
                  <html>
                    <head><title>Receipt View - ${item.title || 'Payment'}</title></head>
                    <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#333;">
                      <img src="${item.receiptUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="Receipt" />
                    </body>
                  </html>
                `);
              };

              return (
                <div className="ledger-row" key={item.id || idx}>
                  <div className="ledger-col item-name">{item.title || item.paymentType || 'Rent Payment'}</div>
                  <div className="ledger-col item-amount">₹{item.amount || '00,000/-'}</div>
                  <div className="ledger-col item-date">{item.date || 'N/A'}</div>
                  <div className="ledger-col item-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {item.receiptUrl ? (
                      <span onClick={handleViewReceipt} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} title="View Receipt">
                        <FaEye className="icon-action" />
                      </span>
                    ) : (
                      <FaEye className="icon-action" style={{ opacity: 0.4, cursor: 'not-allowed' }} />
                    )}

                    {item.receiptUrl ? (
                      <a 
                        href={item.receiptUrl} 
                        download={`Receipt_${item.date || 'Payment'}.png`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Download Receipt"
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                      >
                        <FaDownload className="icon-action red" />
                      </a>
                    ) : (
                      <FaDownload className="icon-action red" style={{ opacity: 0.4, pointerEvents: 'none' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Download PDF Button */}
        <button className="action-btn green-bg" onClick={handleDownloadPdf}>
          Download History PDF
        </button>
      </main>

      {/* Bottom Navigation with Popup */}
    <SimpleBottomNav onNavigate={onNavigate} activeTab="home" />
    </div>
  );
}