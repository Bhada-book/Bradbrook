import React, { useState, useEffect } from 'react';
import './TenantList.css'; // Reusing your table styles
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

export default function DocumentViewer({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentsList, setDocumentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch managers and collectors who have uploaded documents
  useEffect(() => {
    let managersData = [];
    let collectorsData = [];

    const processDocs = () => {
      const combined = [
        ...managers.map(m => ({ ...m, role: 'Manager' })),
        ...collectors.map(c => ({ ...c, role: 'Collector' }))
      ].filter(item => item.document); // Only show profiles with documents

      setDocumentsList(combined);
      setLoading(false);
    };

    let managers = [];
    let collectors = [];

    const unsubManagers = onSnapshot(collection(db, 'managers'), (snapshot) => {
      managers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      processDocs();
    });

    const unsubCollectors = onSnapshot(collection(db, 'collectors'), (snapshot) => {
      collectors = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      processDocs();
    });

    return () => {
      unsubManagers();
      unsubCollectors();
    };
  }, []);

  const handleViewDocument = (docName) => {
    alert(`Viewing document: ${docName}`);
    // You can also open this in a new tab if it's a URL: window.open(docUrl, '_blank');
  };

  return (
    <div className="tenant-list-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <button className="icon-btn menu-btn" onClick={() => setIsMenuOpen(true)}>☰</button>
        </div>
      </header>

      <SideMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={onNavigate} />

      {/* --- MAIN CONTENT --- */}
      <main className="tenant-list-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h2>Uploaded Documents View</h2>
        </div>
        <hr />

        <div className="tenant-table-card" style={{ marginTop: '15px' }}>
          <div className="table-header-row">
            <span className="col-name">Name</span>
            <span className="col-unit">Role</span>
            <span className="col-since">Document File</span>
            <span className="col-actions">Action</span>
          </div>

          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading documents...</p>
          ) : documentsList.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No documents uploaded yet.</p>
          ) : (
            documentsList.map((item) => (
              <div className="table-data-row" key={item.id}>
                <span className="col-name">{item.name} {item.surname}</span>
                <span className="col-unit">
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    background: item.role === 'Manager' ? '#e6f2ff' : '#e6ffe6',
                    color: item.role === 'Manager' ? '#004080' : '#006600',
                    fontWeight: 'bold'
                  }}>
                    {item.role}
                  </span>
                </span>
                <span className="col-since" style={{ fontSize: '12px', color: '#333' }}>{item.document}</span>
                <div className="col-actions action-btns">
                  <button className="action-eye-btn" aria-label="View Document" onClick={() => handleViewDocument(item.document)}>
                    <img src="images/eye.png" alt="View" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="profile" />
    </div>
  );
}