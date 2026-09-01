import React, { useState , useEffect} from 'react';
import './Profile.css';
import Side from '../Tenant/Side';
import SimpleBottomNav from './SimpleBottomNav';
import { 
  FaArrowLeft, FaUser, FaBuilding, FaIdCard, FaPhone, 
  FaEnvelope, FaMapMarkerAlt, FaFilePdf, FaImage 
} from 'react-icons/fa';

import { db } from '../../firebase'; // Adjust your firebase config import path if needed
import { doc, getDoc } from 'firebase/firestore';

export default function TenantProfile({ onBack, onNavigate, tenantIdProp = "ONRiTsjWb2sbqr3j2u6A" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenantData() {
      try {
        const docRef = doc(db, "tenants", tenantIdProp);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTenantData(docSnap.data());
        } else {
          console.log("No such tenant document!");
        }
      } catch (error) {
        console.error("Error fetching tenant data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTenantData();
  }, [tenantIdProp]);

  if (loading) {
    return <div className="tenant-container" style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
  }

  if (!tenantData) {
    return <div className="tenant-container" style={{ textAlign: 'center', padding: '50px' }}>Tenant data not found.</div>;
  }

  // Pick the first photo from propertyPhotos array as profile avatar if available
  const profileImage = tenantData.propertyPhotos && tenantData.propertyPhotos.length > 0 
    ? tenantData.propertyPhotos[0] 
    : null;

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
          <h2>Tenant Profile</h2>
        </div>

        {/* Profile Header Card with Photo */}
        <div className="profile-avatar-card">
          <div className="profile-avatar-container">
            {profileImage ? (
              <img src={profileImage} alt="Tenant Profile" className="profile-avatar-img" />
            ) : (
              <FaUser className="profile-avatar-placeholder" />
            )}
          </div>
          <h3>{tenantData.name} {tenantData.surname}</h3>
          <span className="profile-unit-badge">Unit {tenantData.propertyOrUnit || tenantData.unitId}</span>
        </div>

        {/* Profile Details List */}
        <div className="profile-details-card">
          <div className="profile-detail-row">
            <div className="detail-icon-label"><FaBuilding /> Building / Complex</div>
            <div className="detail-value">{tenantData.buildingOrComplex}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label"><FaIdCard /> Tenant ID</div>
            <div className="detail-value">{tenantData.tenantId}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label"><FaPhone /> Phone Number</div>
            <div className="detail-value">{tenantData.mobile}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label"><FaEnvelope /> Email Address</div>
            <div className="detail-value">{tenantData.email}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label"><FaMapMarkerAlt /> Address / City</div>
            <div className="detail-value">{tenantData.permanentAddress}, {tenantData.city}, {tenantData.state} - {tenantData.pinCode}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label">Company Name</div>
            <div className="detail-value">{tenantData.companyName}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label">Monthly Rental</div>
            <div className="detail-value">₹{tenantData.finalMonthlyRental}</div>
          </div>
          <div className="profile-detail-row">
            <div className="detail-icon-label">Security Deposit</div>
            <div className="detail-value">₹{tenantData.securityDeposit}</div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="profile-section-title" style={{ margin: '20px 0 10px 0', fontWeight: 'bold', color: '#b30000' }}>
          Documents & Agreements
        </div>
        <div className="profile-details-card" style={{ marginBottom: '20px' }}>
          {tenantData.agreementCopy && (
            <div className="profile-detail-row">
              <div className="detail-icon-label"><FaFilePdf style={{ color: '#d9534f' }} /> Agreement Copy</div>
              <a href={tenantData.agreementCopy} target="_blank" rel="noopener noreferrer" className="detail-link-value">
                View PDF
              </a>
            </div>
          )}
          {tenantData.document && (
            <div className="profile-detail-row">
              <div className="detail-icon-label"><FaFilePdf style={{ color: '#d9534f' }} /> Tenant List / Document</div>
              <a href={tenantData.document} target="_blank" rel="noopener noreferrer" className="detail-link-value">
                View PDF
              </a>
            </div>
          )}
        </div>

        {/* Property / Uploaded Photos Gallery Section */}
        {tenantData.propertyPhotos && tenantData.propertyPhotos.length > 0 && (
          <>
            <div className="profile-section-title" style={{ margin: '20px 0 10px 0', fontWeight: 'bold', color: '#b30000' }}>
              Uploaded Photos
            </div>
            <div className="profile-photos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {tenantData.propertyPhotos.map((photoUrl, index) => (
                <a key={index} href={photoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                  <img src={photoUrl} alt={`Property Photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation with Popup */}
    <SimpleBottomNav onNavigate={onNavigate} activeTab="home" />
    </div>
  );
}