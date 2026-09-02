import React, { useState, useEffect } from 'react';
import './TenantHome.css';
import Side from '../../pages/Tenant/Side';
import SimpleBottomNav from './SimpleBottomNav.jsx';
import { db } from '../../firebase.js';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  FaChevronDown, FaEye, FaDownload, FaTimes, FaUpload 
} from 'react-icons/fa';

export default function TenantHome({ onNavigate, isMenuOpen, setIsMenuOpen, tenantIdProp = "ONRiTsjWb2sbqr3j2u6A" }) {
  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  // Record Payment Form states
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamically get the current year (e.g., 2026)
  const currentYear = new Date().getFullYear().toString();
  
  // Payment Mode & Recipient states
  const [paymentMode, setPaymentMode] = useState('UPI'); 
  const [paidToName, setPaidToName] = useState(''); 
  const [paymentAmount, setPaymentAmount] = useState('');

  // Year filter states
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Automatically generate available years dynamically (Current year + past 3 years)
  const availableYears = Array.from({ length: 4 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Ledger state from Firebase
  const [ledgerData, setLedgerData] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(true);

  // Tenant Profile state from Firebase
  const [tenantData, setTenantData] = useState({
    name: 'Loading...',
    buildingOrComplex: 'Loading...',
    roomNumber: '---'
  });
  const [loadingTenant, setLoadingTenant] = useState(true);

  // Fetch tenant profile details from 'tenants' collection
  useEffect(() => {
    async function fetchTenantProfile() {
      try {
        const tenantDocRef = doc(db, 'tenants', tenantIdProp);
        const tenantDocSnap = await getDoc(tenantDocRef);

        if (tenantDocSnap.exists()) {
          setTenantData(tenantDocSnap.data());
        } else {
          const q = query(collection(db, 'tenants'), where('id', '==', tenantIdProp));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setTenantData(querySnapshot.docs[0].data());
          }
        }
      } catch (error) {
        console.error('Error fetching tenant profile:', error);
      } finally {
        setLoadingTenant(false);
      }
    }

    if (tenantIdProp) {
      fetchTenantProfile();
    }
  }, [tenantIdProp]);

  // Fetch tenant ledger/payment history from Firebase (Supports multi-query / legacy fallback)
  useEffect(() => {
    async function fetchLedgerData() {
      try {
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
        
        const paymentMap = new Map();
        snapshotCurrent.forEach((docSnap) => {
          paymentMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
        });
        snapshotLegacy.forEach((docSnap) => {
          paymentMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
        });

        setLedgerData(Array.from(paymentMap.values()));
      } catch (error) {
        console.error('Error fetching ledger history:', error);
      } finally {
        setLoadingLedger(false);
      }
    }

    if (tenantIdProp) {
      fetchLedgerData();
    }
  }, [tenantIdProp]);

  // Filter ledger and history records based on the selected year
  const filteredLedgerByYear = ledgerData.filter((item) => {
    if (!item.date) return false;
    return item.date.includes(selectedYear);
  });

  // Calculate Year-Wise Total Received Amount
  const totalReceived = filteredLedgerByYear.reduce((sum, item) => {
    const cleanAmount = parseFloat((item.amount || '0').replace(/[^0-9.]/g, '')) || 0;
    return sum + cleanAmount;
  }, 0);

  const formattedReceived = totalReceived > 0 ? totalReceived.toLocaleString('en-IN') + '/-' : '00,00,000/-';

  // Function to download filtered year ledger history as a CSV file
  const handleDownloadLedger = () => {
    if (!filteredLedgerByYear || filteredLedgerByYear.length === 0) {
      alert(`No ledger history available for ${selectedYear} to download.`);
      return;
    }

    const headers = ['Payment Title', 'Amount', 'Date', 'Mode', 'Given To / Recipient', 'Status'];
    
    const rows = filteredLedgerByYear.map(item => [
      `"${item.title || item.paymentType || 'Rent Payment'}"`,
      `"${item.amount || '00,000/-'}"`,
      `"${item.date || 'N/A'}"`,
      `"${item.mode || 'N/A'}"`,
      `"${item.paidTo || '-'}"`,
      `"${item.status || 'N/A'}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Tenant_Ledger_${tenantIdProp}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentDate || !receiptFile || !paymentAmount) {
      alert('Please fill in the amount, date, and upload a receipt image.');
      return;
    }

    if ((paymentMode === 'Cash' || paymentMode === 'Check') && !paidToName.trim()) {
      alert(`Please enter the name of the person you gave the ${paymentMode} to.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(receiptFile);
      reader.onload = async () => {
        const base64Image = reader.result;

        const paymentPayload = {
          tenantId: tenantIdProp,
          ownerId: tenantData.ownerId || tenantData.landlordId || null,
          date: paymentDate,
          title: `Offline Payment (${paymentMode})`,
          amount: paymentAmount,
          mode: paymentMode,
          paidTo: (paymentMode === 'Cash' || paymentMode === 'Check') ? paidToName : null,
          status: 'Pending',
          receiptUrl: base64Image,
          createdAt: new Date()
        };

        const paymentDocRef = await addDoc(collection(db, 'payments'), paymentPayload);

        await addDoc(collection(db, 'notifications'), {
          ...paymentPayload,
          paymentId: paymentDocRef.id,
          title: 'Payment Approval'
        });

        setIsSubmitting(false);
        alert('Payment recorded successfully and sent to Admin for approval!');
        setIsRecordPaymentModalOpen(false);
        setPaymentAmount('');
        setPaymentDate('');
        setReceiptFile(null);
        setPaymentMode('UPI');
        setPaidToName('');
      };
    } catch (error) {
      console.error('Error saving payment record: ', error);
      alert('Failed to record payment. Please try again.');
      setIsSubmitting(false);
    }
  };
  // Helper function to calculate if payment is overdue after the 30th
  const getComputedPaymentStatus = () => {
    // Check if any approved payment exists for the current month/year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYearNum = currentDate.getFullYear().toString();
    const currentDay = currentDate.getDate();

    const hasPaidThisMonth = ledgerData.some(item => {
      if (!item.date || item.status !== 'Approved') return false;
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear().toString() === currentYearNum;
    });

    // If past the 30th and payment not done for current month -> Overdue
    if (currentDay > 30 && !hasPaidThisMonth && selectedYear === currentYearNum) {
      return 'overdue';
    }

    return 'paid';
  };

  const currentPaymentStatus = getComputedPaymentStatus();
  const isOverdue = currentPaymentStatus === 'overdue';

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
            <span className="building-label">{tenantData.buildingOrComplex || tenantData.buildingName || 'Building Name'}</span>
            <h2 className="room-number">{tenantData.roomNumber || tenantData.flatNo || tenantData.roomNo || tenantData.propertyOrUnit || '101'}</h2>
            <p className="tenant-name">{tenantData.name ? `${tenantData.name} ${tenantData.surname || ''}` : 'Tenant Name'}</p>
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
              <h3>{formattedReceived}</h3>
              <p className="status-green">● Paid</p>
            </div>
            <div className="summary-card1">
              <span className="card-label1">Rs.</span>
              <h3>{isOverdue ? (tenantData.totalMonthlyRental || tenantData.finalMonthlyRental || '10,000') + '/-' : '00,00,000/-'}</h3>
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
       {/* Invoice Banner */}
        <div className="invoice-banner" style={{ background: isOverdue ? '#ffe6e6' : '#e6f4ea', borderLeft: `5px solid ${isOverdue ? '#dc3545' : '#28a745'}` }}>
          <div className="invoice-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span className="invoice-title">
              Invoice Current Month 
              <span className="invoice-status" style={{ background: isOverdue ? '#dc3545' : '#28a745', color: '#fff', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', fontSize: '11px' }}>
                {isOverdue ? 'Overdue' : 'Paid'}
              </span>
            </span>
            {isOverdue && (
              <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>
                Due since 30th
              </span>
            )}
          </div>
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
          <h3 className="ledger-title">Ledger ({selectedYear})</h3>
        </div>

        <div className="ledger-table">
          {loadingLedger ? (
            <div style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '13px' }}>Loading ledger...</div>
          ) : filteredLedgerByYear.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '13px' }}>No payment records found for {selectedYear}.</div>
          ) : (
            filteredLedgerByYear.map((item, idx) => {
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
                    
                    {/* View Icon */}
                    {item.receiptUrl ? (
                      <span onClick={handleViewReceipt} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} title="View Receipt">
                        <FaEye className="icon-action" />
                      </span>
                    ) : (
                      <FaEye className="icon-action" style={{ opacity: 0.4, cursor: 'not-allowed' }} />
                    )}

                    {/* Download Icon */}
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

        <button className="download-ledger-btn" onClick={handleDownloadLedger}>
          Download Ledger ({selectedYear})
        </button>
      </main>

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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Payment Mode</label>
                <select 
                  value={paymentMode} 
                  onChange={(e) => setPaymentMode(e.target.value)} 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: '#838383' }}
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>

              {(paymentMode === 'Cash' || paymentMode === 'Check') && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                    Given To (Person Name) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder={`Enter name of person who received the ${paymentMode}`}
                    value={paidToName} 
                    onChange={(e) => setPaidToName(e.target.value)} 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    required 
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                  Amount (₹) <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter amount paid (e.g., 5000/-)"
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  required 
                />
              </div>

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
     <SimpleBottomNav onNavigate={onNavigate} activeTab="home" />
    </div>
  );
}