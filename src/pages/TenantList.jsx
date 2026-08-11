import React, { useState, useEffect } from 'react';
import './TenantList.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';

export default function TenantList({ onBack, onNavigate, onEditTenant }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tenantsData, setTenantsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for View and Edit Modals
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [editingTenant, setEditingTenant] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Fetch tenants real-time from Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const tenantList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const fullName = [data.name, data.surname].filter(Boolean).join(' ') || 'Sandeep Ghige';
        
        return {
          id: docSnap.id,
          ...data, 
          name: fullName,
          unitId: data.propertyOrUnit || data.unitId || '101',
          since: data.moveInDate || data.since || '01/03/2026'
        };
      });

      if (tenantList.length > 0) {
        setTenantsData(tenantList);
      } else {
        setTenantsData([
          { id: '1', name: 'Sandeep Ghige', unitId: '101', since: '01/03/2026', phone: '9876543210', email: 'sandeep@example.com' },
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewClick = (tenant) => {
    setSelectedTenant(tenant);
    setIsViewModalOpen(true);
  };

  // Function to Download All Tenants List as PDF
  const handleDownloadPDF = () => {
    const docPdf = new jsPDF();

    docPdf.setFontSize(18);
    docPdf.setTextColor(179, 0, 0); 
    docPdf.text('Complete Tenant List Report', 14, 20);
    
    docPdf.setFontSize(10);
    docPdf.setTextColor(100);
    docPdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    let startY = 36;

    tenantsData.forEach((tenant, index) => {
      if (startY > 250) {
        docPdf.addPage();
        startY = 20;
      }

      docPdf.setFillColor(179, 0, 0);
      docPdf.rect(14, startY, 182, 7, 'F');
      docPdf.setFontSize(10);
      docPdf.setTextColor(255, 255, 255);
      docPdf.text(`Tenant #${index + 1}: ${tenant.name || 'N/A'}`, 18, startY + 5);

      startY += 10;
      docPdf.setFontSize(9);

      const fields = [
        { label: 'Building/Complex', value: tenant.buildingOrComplex || 'N/A' },
        { label: 'Property/Unit', value: tenant.propertyOrUnit || tenant.unitId || 'N/A' },
        { label: 'Mobile Number', value: tenant.mobile || tenant.phone || 'N/A' },
        { label: 'Email', value: tenant.email || 'N/A' },
        { label: 'Move-In Date', value: tenant.moveInDate || tenant.since || 'N/A' },
        { label: 'Security Deposit', value: tenant.securityDeposit ? `Rs. ${tenant.securityDeposit}` : 'N/A' },
        { label: 'Total Monthly Rental', value: tenant.totalMonthlyRental ? `Rs. ${tenant.totalMonthlyRental}` : 'N/A' },
        { label: 'Monthly Payment Mode', value: tenant.monthlyPayment || 'N/A' }
      ];

      fields.forEach((field) => {
        docPdf.setTextColor(100, 100, 100);
        docPdf.text(`${field.label}:`, 18, startY);
        docPdf.setTextColor(20, 20, 20);
        docPdf.text(String(field.value), 70, startY);
        startY += 6;
      });

      startY += 8; 
    });

    docPdf.save('Complete_Tenant_List.pdf');
  };

  // Function to Send Single Tenant's Full Information via WhatsApp
  const handleShareTenantWhatsApp = (tenant) => {
    if (!tenant) return;

    let message = `*Tenant Details Report*%0A%0A`;
    message += `*Name:* ${tenant.name || ''} ${tenant.surname || ''}%0A`;
    message += `*Building/Complex:* ${tenant.buildingOrComplex || 'N/A'}%0A`;
    message += `*Property/Unit:* ${tenant.propertyOrUnit || tenant.unitId || 'N/A'}%0A`;
    message += `*Mobile:* ${tenant.mobile || tenant.phone || 'N/A'}%0A`;
    message += `*Email:* ${tenant.email || 'N/A'}%0A`;
    message += `*Company:* ${tenant.companyName || 'N/A'}%0A`;
    message += `*Permanent Address:* ${tenant.permanentAddress || 'N/A'}, ${tenant.city || ''}, ${tenant.state || ''} - ${tenant.pinCode || ''}%0A`;
    message += `*Move-In Date:* ${tenant.moveInDate || tenant.since || 'N/A'}%0A`;
    message += `*Agreement End Date:* ${tenant.agreementEndDate || 'N/A'}%0A`;
    message += `*Security Deposit:* ₹${tenant.securityDeposit || '0'}%0A`;
    message += `*Total Monthly Rental:* ₹${tenant.totalMonthlyRental || '0'}%0A`;
    message += `*Monthly Payment:* ${tenant.monthlyPayment || 'N/A'}%0A`;
    message += `*Tenant ID:* ${tenant.tenantId || 'N/A'}%0A`;
    if (tenant.document) message += `*Document URL:* ${tenant.document}%0A`;
    if (tenant.agreementCopy) message += `*Agreement URL:* ${tenant.agreementCopy}%0A`;

    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEditClick = (tenant) => {
    if (onEditTenant) {
      onEditTenant(tenant);
    }
  };

  // Function to Download Selected Single Tenant PDF (Includes Links to Document, Agreement, & Photos)
  const handleDownloadSinglePDF = (tenant) => {
    const docPdf = new jsPDF();

    docPdf.setFontSize(18);
    docPdf.setTextColor(179, 0, 0); 
    docPdf.text('Tenant Details Report', 14, 20);

    docPdf.setFontSize(10);
    docPdf.setTextColor(100);
    docPdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

    const details = [
      { label: 'Full Name', value: tenant.name || 'N/A' },
      { label: 'Building / Complex', value: tenant.buildingOrComplex || 'N/A' },
      { label: 'Property / Unit ID', value: tenant.unitId || 'N/A' },
      { label: 'Mobile Number', value: tenant.mobile || tenant.phone || 'N/A' },
      { label: 'Email Address', value: tenant.email || 'N/A' },
      { label: 'Company Name', value: tenant.companyName || 'N/A' },
      { label: 'Permanent Address', value: tenant.permanentAddress || 'N/A' },
      { label: 'State / City', value: `${tenant.state || ''} ${tenant.city ? '- ' + tenant.city : ''}` || 'N/A' },
      { label: 'Move-In Date', value: tenant.since || 'N/A' },
      { label: 'Security Deposit', value: tenant.securityDeposit ? `Rs. ${tenant.securityDeposit}` : 'N/A' },
      { label: 'Monthly Rental', value: tenant.totalMonthlyRental ? `Rs. ${tenant.totalMonthlyRental}` : 'N/A' },
      { label: 'Monthly Payment Mode', value: tenant.monthlyPayment || 'N/A' },
      { label: 'Agreement End Date', value: tenant.agreementEndDate || 'N/A' },
      { label: 'Document (Aadhar/Pan)', value: tenant.document ? 'Available (Click to View)' : 'Not Uploaded', link: tenant.document },
      { label: 'Agreement Copy', value: tenant.agreementCopy ? 'Available (Click to View)' : 'Not Uploaded', link: tenant.agreementCopy }
    ];

    let startY = 38;
    docPdf.setFontSize(11);

    details.forEach((item) => {
      if (startY > 270) {
        docPdf.addPage();
        startY = 20;
      }

      docPdf.setTextColor(100, 100, 100);
      docPdf.text(`${item.label}:`, 14, startY);

      docPdf.setTextColor(item.link ? 0 : 20, item.link ? 0 : 20, item.link ? 255 : 20);
      docPdf.text(String(item.value), 70, startY);

      if (item.link) {
        docPdf.link(70, startY - 4, 100, 6, { url: item.link });
      }

      docPdf.setDrawColor(220, 220, 220);
      docPdf.line(14, startY + 3, 196, startY + 3);

      startY += 10;
    });

    // Add Property Photos Links into PDF if available
    if (tenant.propertyPhotos && tenant.propertyPhotos.length > 0) {
      if (startY > 250) { docPdf.addPage(); startY = 20; }
      docPdf.setTextColor(179, 0, 0);
      docPdf.text('Handover Property Photos:', 14, startY);
      startY += 8;

      tenant.propertyPhotos.forEach((photo, idx) => {
        docPdf.setTextColor(0, 0, 255);
        docPdf.text(`- View Photo ${idx + 1}`, 20, startY);
        docPdf.link(20, startY - 4, 60, 6, { url: photo });
        startY += 7;
      });
    }

    docPdf.save(`${(tenant.name || 'Tenant').replace(/\s+/g, '_')}_Details.pdf`);
  };

  return (
    <div className="tenant-list-container">
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
            className="icon-btn notification-btn" 
            aria-label="Notifications"
            onClick={() => onNavigate('notifications')}
          >
            <img src="/images/n.png" alt="Notifications" style={{ height: '22px', objectFit: 'contain' }} />
          </button>
          <button 
            className="icon-btn menu-btn" 
            aria-label="Menu"
            onClick={() => setIsMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      <SideMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate} 
      />

      <main className="tenant-list-content">
        <div className="form-header" style={{ marginBottom: '9px' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Tenant List</h2>
        </div>
        <hr />

        <div className="tenant-table-card">
          <div className="table-header-row">
            <span className="col-name">Name</span>
            <span className="col-unit">Unit ID</span>
            <span className="col-since">Since</span>
            <span className="col-actions">Actions</span>
          </div>

          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading tenants...</p>
          ) : (
            tenantsData.map((tenant, index) => (
              <div className="table-data-row" key={tenant.id || index}>
                <span className="col-name">{tenant.name}</span>
                <span className="col-unit">{tenant.unitId}</span>
                <span className="col-since">{tenant.since}</span>
                <div className="col-actions action-btns">
                  <button className="action-eye-btn" aria-label="View" onClick={() => handleViewClick(tenant)}>
                    <img src='images/eye.png' alt="View" />
                  </button>
                  <button className="action-edit-btn" aria-label="Edit" onClick={() => handleEditClick(tenant)}>
                    <img src='images/edit.png' alt="Edit" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="tenant-action-buttons">
          <button className="add-tenant-btn" onClick={() => onNavigate('tenant')}>
            Add Tenant
          </button>
          <button className="download-tenant-btn" onClick={handleDownloadPDF}>Download Tenant List</button>
          <button 
            type="button" 
            className="send-tenant-btn" 
            style={{ marginTop: '10px' }}
            onClick={() => handleShareTenantWhatsApp(selectedTenant)}
          >
            <span className="whatsapp-icon">
              <img src='images/whatsup.png' style={{ height: '18px' }} alt="WhatsApp" />
            </span> 
            Share via WhatsApp
          </button>
        </div>
      </main>

      {/* --- VIEW POPUP MODAL --- */}
      {isViewModalOpen && selectedTenant && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h3>Tenant Information</h3>
            <div className="modal-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <p><strong>Name:</strong> {selectedTenant.name}</p>
              <p><strong>Building/Complex:</strong> {selectedTenant.buildingOrComplex || 'N/A'}</p>
              <p><strong>Unit ID:</strong> {selectedTenant.unitId}</p>
              <p><strong>Mobile:</strong> {selectedTenant.mobile || selectedTenant.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedTenant.email || 'N/A'}</p>
              <p><strong>Company Name:</strong> {selectedTenant.companyName || 'N/A'}</p>
              <p><strong>Permanent Address:</strong> {selectedTenant.permanentAddress || 'N/A'}</p>
              <p><strong>State / City:</strong> {selectedTenant.state || 'N/A'} / {selectedTenant.city || 'N/A'}</p>
              <p><strong>Move-in Since:</strong> {selectedTenant.since}</p>
              <p><strong>Security Deposit:</strong> {selectedTenant.securityDeposit ? `₹${selectedTenant.securityDeposit}` : 'N/A'}</p>
              <p><strong>Monthly Rental:</strong> {selectedTenant.totalMonthlyRental ? `₹${selectedTenant.totalMonthlyRental}` : 'N/A'}</p>
              
              {/* Document & Agreement Links in View Modal */}
              <p><strong>Document (Aadhar/Pan):</strong> {selectedTenant.document ? <a href={selectedTenant.document} target="_blank" rel="noopener noreferrer">View Document</a> : 'N/A'}</p>
              <p><strong>Agreement Copy:</strong> {selectedTenant.agreementCopy ? <a href={selectedTenant.agreementCopy} target="_blank" rel="noopener noreferrer">View Agreement</a> : 'N/A'}</p>

              {/* Handover Property Photos Viewer Section */}
              <div style={{ marginTop: '15px' }}>
                <p><strong>Handover Property Photos:</strong></p>
                {selectedTenant.propertyPhotos && selectedTenant.propertyPhotos.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                    {selectedTenant.propertyPhotos.map((photo, idx) => (
                      <a href={photo} target="_blank" rel="noopener noreferrer" key={idx}>
                        <img 
                          src={photo} 
                          alt={`Property ${idx}`} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} 
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#777', fontSize: '13px' }}>No photos attached.</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                type="button" 
                className="save-modal-btn" 
                onClick={() => handleDownloadSinglePDF(selectedTenant)}
              >
                Download PDF
              </button>
              <button 
                type="button" 
                className="close-modal-btn" 
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="tenant" />
    </div>
  );
}