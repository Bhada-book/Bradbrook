import React, { useState, useEffect } from 'react';
import './Notifications.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { FaTimes, FaCheck, FaBan } from 'react-icons/fa';

export default function Notifications({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for viewing specific notification details modal
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications real-time from Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let statusClass = 'status-received';
        const statusLower = (data.status || '').toLowerCase();
        
        if (statusLower === 'approved') statusClass = 'status-approved';
        else if (statusLower === 'pending') statusClass = 'status-pending';
        else if (statusLower === 'rejected') statusClass = 'status-rejected';

        return {
          id: docSnap.id,
          date: data.date || '01/02/2026',
          title: data.title || 'Payment Approval',
          mode: data.mode || 'Offline Transfer',
          status: data.status || 'Received',
          receiptUrl: data.receiptUrl || '',
          statusClass
        };
      });

      if (notifList.length > 0) {
        setNotificationsData(notifList);
      } else {
        setNotificationsData([
          { id: '1', date: '01/02/2026', title: 'Payment Approval', mode: 'Cash', status: 'Approved', receiptUrl: '', statusClass: 'status-approved' },
          { id: '2', date: '01/02/2026', title: 'Payment Approval', mode: 'UPI', status: 'Pending', receiptUrl: '', statusClass: 'status-pending' },
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';

  // Function to handle status updates (Approved / Rejected)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { status: newStatus });
      alert(`Payment marked as ${newStatus}! Tenant ledger history updated.`);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="notifications-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src='images/Vector.png' alt="Search" /></span>
            <input type="text" placeholder="Search" />
          </div>

          {isAdmin && (
            <button 
              className="icon-btn notification-btn" 
              aria-label="Notifications"
              onClick={() => onNavigate('adminApprovals')}
            >
              <img src="/images/n.png" alt="Notifications" style={{ height: '22px', objectFit: 'contain' }} />
            </button>
          )}

          <button 
            className="icon-btn menu-btn" 
            aria-label="Menu"
            onClick={() => setIsMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* --- SIDE MENU DRAWER --- */}
      <SideMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      {/* --- MAIN CONTENT --- */}
      <main className="notifications-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Notifications</h2>
        </div>

        {/* NOTIFICATIONS LIST CARD */}
        <div className="notifications-table-card">
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading notifications...</p>
          ) : (
            notificationsData.map((item, index) => (
              <div className="notification-row" key={item.id || index}>
                <span className="notif-date">{item.date}</span>
                <span className="notif-title">{item.title}</span>
                <span className="notif-mode">{item.mode}</span>
                <div className="notif-actions">
                  <button 
                    className="action-eye-btn" 
                    aria-label="View Details"
                    onClick={() => setSelectedNotification(item)}
                  >
                    <img src='images/eye.png' alt="View" />
                  </button>
                  <span className={`status-badge ${item.statusClass}`}>{item.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- VIEW DETAILS & APPROVAL MODAL --- */}
      {selectedNotification && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px'
        }} onClick={() => setSelectedNotification(null)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '420px', borderRadius: '12px', padding: '20px', boxSizing: 'border-box'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Payment Details</h3>
              <button onClick={() => setSelectedNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ fontSize: '14px', color: '#444', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div><strong>Title:</strong> {selectedNotification.title}</div>
              <div><strong>Date:</strong> {selectedNotification.date}</div>
              <div><strong>Payment Mode:</strong> {selectedNotification.mode}</div>
              <div><strong>Current Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedNotification.status}</span></div>

              <div>
                <strong>Uploaded Receipt:</strong>
                <div style={{ marginTop: '8px', border: '1px solid #ddd', borderRadius: '6px', padding: '5px', textAlign: 'center', background: '#f9f9f9' }}>
                  {selectedNotification.receiptUrl ? (
                    <img src={selectedNotification.receiptUrl} alt="Receipt Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#777' }}>No image preview available</span>
                  )}
                </div>
              </div>
            </div>

            {/* Approval Action Buttons */}
            {isAdmin && selectedNotification.status === 'Pending' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleUpdateStatus(selectedNotification.id, 'Approved')}
                  style={{ flex: 1, background: '#28a745', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FaCheck /> Approve
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedNotification.id, 'Rejected')}
                  style={{ flex: 1, background: '#dc3545', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FaBan /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}