import React, { useState, useEffect } from 'react';
import './History.css';
import Side from '../../pages/Tenant/Side';
import BottomNavWithPopup from '../SideMenuDrawer';
import { FaChevronDown, FaEye, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { db } from '../../firebase'; // Adjust path to your firebase config if needed
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TenantHistory({ onBack, onNavigate, tenantIdProp = "ONRiTsjWb2sbqr3j2u6A" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState({
    name: 'Loading...',
    unit: '',
    building: '',
    tenantId: tenantIdProp
  });

  useEffect(() => {
    async function fetchTenantHistoryAndDetails() {
      try {
        // 1. Optional: Fetch specific tenant info to display name/unit dynamically
        const tenantQuery = query(collection(db, "tenants"), where("tenantId", "==", tenantIdProp));
        // Or if tenantIdProp is the exact Firestore document ID:
        // const tenantDocRef = doc(db, "tenants", tenantIdProp);
        
        // Fetch payment history records linked to this tenant
        const q = query(collection(db, "payments"), where("tenantId", "==", tenantIdProp));
        const querySnapshot = await getDocs(q);
        
        const payments = [];
        querySnapshot.forEach((doc) => {
          payments.push({ id: doc.id, ...doc.data() });
        });

        setHistoryData(payments);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTenantHistoryAndDetails();
  }, [tenantIdProp]);

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
            <span className="building-label">Building / Unit</span>
            <h2 className="room-number">{tenantInfo.unit || '402'}</h2>
            <p className="tenant-name">{tenantInfo.name || 'Rutuja Khade'}</p>
          </div>
          <div className="tenant-meta">
            <span className="flat-badge">Flat</span>
            <span className="tenant-id">Tenant ID : {tenantIdProp}</span>
          </div>
        </div>

        {/* History Section Header */}
        <div className="ledger-header-row">
          <h3 className="ledger-title">History Records</h3>
          <div className="year-dropdown small">
            <span>2026</span>
            <FaChevronDown />
          </div>
        </div>

        {/* History Table */}
        <div className="ledger-table">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading history...</div>
          ) : historyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No history records found for this tenant.</div>
          ) : (
            historyData.map((item, idx) => (
              <div className="ledger-row" key={item.id || idx}>
                <div className="ledger-col item-name">{item.title || item.paymentType || 'Rent Payment'}</div>
                <div className="ledger-col item-amount">₹{item.amount || item.finalMonthlyRental || '00,000'}</div>
                <div className="ledger-col item-date">{item.date || item.createdAt || 'N/A'}</div>
                <div className="ledger-col item-actions">
                  {item.receiptUrl ? (
                    <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <FaEye className="icon-action" />
                    </a>
                  ) : (
                    <FaEye className="icon-action" style={{ opacity: 0.4 }} />
                  )}
                  {item.receiptUrl && (
                    <a href={item.receiptUrl} download target="_blank" rel="noopener noreferrer">
                      <FaDownload className="icon-action red" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Record Payment Button */}
        <button className="action-btn green-bg" onClick={() => onNavigate('recordPayment')}>
          Record Payment
        </button>
      </main>

      {/* Bottom Navigation with Popup */}
      <BottomNavWithPopup onNavigate={onNavigate} />
    </div>
  );
}