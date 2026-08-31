import React, { useState, useEffect } from 'react';
import './TenantHome.css';
import Side from '../../pages/Tenant/Side';
import BottomNavWithPopup from '../../pages/BottomNavWithPopup';
import { db } from '../../firebase.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { 
  FaChevronDown, FaEye, FaDownload, FaTimes, FaMobileAlt, FaUniversity, FaCreditCard, FaUpload 
} from 'react-icons/fa';

export default function TenantHome({ onNavigate, isMenuOpen, setIsMenuOpen, tenantIdProp = "0987654321" }) {
  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  // Record Payment Form states
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamically get the current year (e.g., 2026)
  const currentYear = new Date().getFullYear().toString();

  // Year filter states
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Automatically generate available years dynamically (Current year + past 3 years)
  const availableYears = Array.from({ length: 4 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Ledger state from Firebase
  const [ledgerData, setLedgerData] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(true);

  // Fetch tenant ledger/payment history from Firebase
  useEffect(() => {
    async function fetchLedgerData() {
      try {
        const q = query(collection(db, 'payments'), where('tenantId', '==', tenantIdProp));
        const querySnapshot = await getDocs(q);
        
        const payments = [];
        querySnapshot.forEach((doc) => {
          payments.push({ id: doc.id, ...doc.data() });
        });

        setLedgerData(payments);
      } catch (error) {
        console.error('Error fetching ledger history:', error);
      } finally {
        setLoadingLedger(false);
      }
    }

    fetchLedgerData();
  }, [tenantIdProp]);

  const handlePaymentSelect = (method) => {
    alert(`Redirecting to ${method} payment gateway...`);
    setIsPaymentModalOpen(false);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentDate || !receiptFile) {
      alert('Please select a date and upload a receipt image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(receiptFile);
      reader.onload = async () => {
        const base64Image = reader.result;

        // Push record into Firebase 'payments' and 'notifications' collection
        await addDoc(collection(db, 'payments'), {
          tenantId: tenantIdProp,
          date: paymentDate,
          title: 'Offline Payment Record',
          amount: '00,000/-',
          mode: 'Offline Transfer',
          status: 'Pending',
          receiptUrl: base64Image,
          createdAt: new Date()
        });

        await addDoc(collection(db, 'notifications'), {
          tenantId: tenantIdProp,
          date: paymentDate,
          title: 'Payment Approval',
          mode: 'Offline Transfer',
          status: 'Pending',
          receiptUrl: base64Image,
          createdAt: new Date()
        });

        setIsSubmitting(false);
        alert('Payment recorded successfully and sent to Admin for approval!');
        setIsRecordPaymentModalOpen(false);
        setPaymentDate('');
        setReceiptFile(null);

        // Refresh ledger list locally
        setLedgerData(prev => [
          ...prev, 
          { title: 'Offline Payment Record', amount: '00,000/-', date: paymentDate, status: 'Pending' }
        ]);
      };
    } catch (error) {
      console.error('Error saving payment record: ', error);
      alert('Failed to record payment. Please try again.');
      setIsSubmitting(false);
    }
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
        
        {/* User Info Strip */}
        <div className="user-info-strip">
          <div className="building-details">
            <span className="building-label">Building Name</span>
            <h2 className="room-number">101</h2>
            <p className="tenant-name">Sandeep Ghige</p>
          </div>
          <div className="tenant-meta">
            <span className="flat-badge">Flat</span>
            <span className="tenant-id">Tenant ID : {tenantIdProp}</span>
          </div>
        </div>

        {/* Payment Summary Section */}
        <section className="summary-section1">
          <div className="summary-header1">
            <h2>Payment Summary</h2>
            <div 
              className="dropdown-filter1" 
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)} 
              style={{ cursor: 'pointer', position: 'relative', marginBottom:'6px' }}
            >
              <span>{selectedYear}</span>
              <span className="arrow" style={{ height: '20px' }}>
                <img src='images/arrow.png' alt="Arrow" />
              </span>
              
              {isYearDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '150px' }}>
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
          </div>

          <div className="summary-cards-grid1">
            <div className="summary-card1">
              <span className="card-label1">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-green">● Received</p>
            </div>
            <div className="summary-card1">
              <span className="card-label1">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-red">● Overdue</p>
            </div>
            <div className="summary-card1">
              <span className="card-label1">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-orange">● Old Pending</p>
            </div>
          </div>
        </section>

        {/* Invoice Banner */}
        <div className="invoice-banner">
          <div className="invoice-info">
            <span className="invoice-title">Invoice BB26270001 <span className="invoice-status">Overdue</span></span>
          </div>
          <button className="pay-btn" onClick={() => setIsPaymentModalOpen(true)}>Pay</button>
        </div>

        {/* Advertisement Banner */}
        <div className="ad-banner">
          <span>ADVT</span>
        </div>

        {/* Action Buttons */}
        <button className="action-btn green-bg" onClick={() => setIsRecordPaymentModalOpen(true)}>Record Payment</button>
        <button className="action-btn red-bg">Raise Complaint</button>

        {/* Ledger Section */}
        <div className="ledger-header-row" style={{ position: 'relative' }}>
          <h3 className="ledger-title">Ledger</h3>
        
          
        
        </div>

        <div className="ledger-table">
          {loadingLedger ? (
            <div style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '13px' }}>Loading ledger...</div>
          ) : ledgerData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '13px' }}>No payment records found.</div>
          ) : (
            ledgerData.map((item, idx) => (
              <div className="ledger-row" key={item.id || idx}>
                <div className="ledger-col item-name">{item.title || item.paymentType || 'Rent Payment'}</div>
                <div className="ledger-col item-amount">₹{item.amount || '00,000/-'}</div>
                <div className="ledger-col item-date">{item.date || 'N/A'}</div>
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

        <button className="download-ledger-btn">Download Ledger</button>
      </main>

      {/* Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000
        }} onClick={() => setIsPaymentModalOpen(false)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '480px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Select Payment Method</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div onClick={() => handlePaymentSelect('Google Pay / PhonePe / UPI')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer' }}>
                <FaMobileAlt size={22} color="#b30000" />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>UPI Apps (GPay, PhonePe, Paytm)</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Pay instantly using UPI handles</div>
                </div>
              </div>
              <div onClick={() => handlePaymentSelect('Net Banking')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer' }}>
                <FaUniversity size={22} color="#b30000" />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Net Banking</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>All major Indian banks supported</div>
                </div>
              </div>
              <div onClick={() => handlePaymentSelect('Credit / Debit Card')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer' }}>
                <FaCreditCard size={22} color="#b30000" />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Visa, MasterCard, RuPay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000
        }} onClick={() => setIsRecordPaymentModalOpen(false)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '480px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Record Offline Payment</h3>
              <button onClick={() => setIsRecordPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Payment Date</label>
                <input 
                  type="date" 
                  value={paymentDate} 
                  onChange={(e) => setPaymentDate(e.target.value)} 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Upload Receipt Image</label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px', border: '2px dashed #ccc', borderRadius: '6px', cursor: 'pointer', background: '#fafafa', textAlign: 'center'
                }}>
                  <FaUpload size={24} color="#666" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px', color: '#333' }}>{receiptFile ? receiptFile.name : 'Click to upload receipt image'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setReceiptFile(e.target.files[0])} 
                    style={{ display: 'none' }} 
                    required 
                  />
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} style={{
                background: '#28a745', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px', opacity: isSubmitting ? 0.7 : 1
              }}>
                {isSubmitting ? 'Submitting...' : 'Submit Payment Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation with Popup */}
      <BottomNavWithPopup onNavigate={onNavigate} />
    </div>
  );
}