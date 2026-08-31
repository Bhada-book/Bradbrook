import React, { useState, useEffect } from 'react';
import './Notifications.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import Navbar from './navbar.jsx'; // <-- Imported Navbar component
import { db } from '../firebase.js';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { FaTimes, FaCheck, FaBan } from 'react-icons/fa';

export default function Notifications({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state: 'All', 'Pending', 'Approved', 'Rejected'
  const [activeTab, setActiveTab] = useState('Pending');

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
          paymentId: data.paymentId || null,
          date: data.date || '01/02/2026',
          title: data.title || 'Payment Approval',
          mode: data.mode || 'Offline Transfer',
          status: data.status || 'Pending',
          receiptUrl: data.receiptUrl || '',
          statusClass
        };
      });

      setNotificationsData(notifList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';

  // Function to handle status updates (Approved / Rejected)
// Updated handleUpdateStatus function inside Notifications.jsx
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { status: newStatus });

      // If this is a profile deletion approval and status is set to Approved, execute the deletion
      if (selectedNotification && selectedNotification.targetCollection && selectedNotification.targetDocumentId && newStatus === 'Approved') {
        const targetRef = doc(db, selectedNotification.targetCollection, selectedNotification.targetDocumentId);
        await deleteDoc(targetRef);
      }

      // Handle standard payment approvals if applicable
      if (selectedNotification && selectedNotification.paymentId) {
        const paymentRef = doc(db, 'payments', selectedNotification.paymentId);
        await updateDoc(paymentRef, { status: newStatus });
      }

      alert(`Request marked as ${newStatus}!`);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    }
  };
  // Filter notifications based on the selected tab
  const filteredNotifications = notificationsData.filter(item => {
    if (activeTab === 'All') return true;
    return item.status.toLowerCase() === activeTab.toLowerCase();
  });

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
    <div className="notifications-container">
      {/* --- TOP NAVBAR --- */}
      <Navbar onNavigate={onNavigate} notificationsData={notificationsData} />

      {/* --- SIDE MENU DRAWER --- */}
      <SideMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      {/* --- MAIN CONTENT --- */}
      <main className="notifications-content">
        <div className="form-header" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Back button with arrow pointing back to home */}
          <button 
            className="back-btn" 
            aria-label="Go Back" 
            onClick={() => onNavigate ? onNavigate('home') : onBack()}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>Notifications</h2>
        </div>

        {/* --- CLICKABLE STATUS TABS (Pending / Approved / Rejected / All) --- */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: activeTab === tab ? '#b30000' : '#e0e0e0',
                color: activeTab === tab ? '#fff' : '#333',
                transition: 'background 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST CARD */}
        <div className="notifications-table-card">
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading notifications...</p>
          ) : filteredNotifications.length === 0 ? (
            <p style={{ padding: '25px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
              No {activeTab.toLowerCase()} notifications found.
            </p>
          ) : (
            filteredNotifications.map((item, index) => (
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