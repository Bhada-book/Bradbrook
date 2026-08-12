import React, { useState, useEffect } from 'react';
import './Notifications.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Notifications({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications real-time from Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifList = snapshot.docs.map(doc => {
        const data = doc.data();
        let statusClass = 'status-received';
        const statusLower = (data.status || '').toLowerCase();
        
        if (statusLower === 'approved') statusClass = 'status-approved';
        else if (statusLower === 'pending') statusClass = 'status-pending';
        else if (statusLower === 'rejected') statusClass = 'status-rejected';

        return {
          id: doc.id,
          date: data.date || '01/02/2026',
          title: data.title || 'Payment Approval',
          mode: data.mode || 'Cash',
          status: data.status || 'Received',
          statusClass
        };
      });

      if (notifList.length > 0) {
        setNotificationsData(notifList);
      } else {
        // Fallback default notifications if collection is empty
        setNotificationsData([
          { date: '01/02/2026', title: 'Payment Approval', mode: 'Cash', status: 'Approved', statusClass: 'status-approved' },
          { date: '01/02/2026', title: 'Payment Approval', mode: 'UPI', status: 'Pending', statusClass: 'status-pending' },
          { date: '01/02/2026', title: 'Payment Approval', mode: 'Cheque', status: 'Rejected', statusClass: 'status-rejected' },
          { date: '01/02/2026', title: 'Complaint', mode: 'Other', status: 'Received', statusClass: 'status-received' },
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isAdmin = userRole === 'Admin/Landlord';

  return (
    <div className="notifications-container">
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

    {/* SHOW NOTIFICATION BUTTON ONLY FOR ADMIN OWNER */}
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
                  <button className="action-eye-btn" aria-label="View"><img src='images/eye.png' alt="View"></img></button>
                  <span className={`status-badge ${item.statusClass}`}>{item.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION & POPUP --- */}
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}