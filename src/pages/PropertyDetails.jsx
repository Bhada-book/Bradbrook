import React, { useState, useEffect, useRef } from 'react';
import './PropertyDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function PropertyDetails({ onBack, onNavigate, editData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const fileInputRef = useRef(null);

  // Form state fields matching inputs
  const [formData, setFormData] = useState({
    buildingOrComplex: '',
    propertyType: '',
    propertyName: '',
    propertyId: '',
    area: '',
    meterNumber: '',
    parking: '',
    expectedMonthlyRental: '',
    expectedDeposit: '',
    propertyPhoto: '',
    status: 'Vacant'
  });

  // Automatically fill the form if editData is passed
  useEffect(() => {
    if (editData) {
      setFormData({
        buildingOrComplex: editData.buildingOrComplex || '',
        propertyType: editData.propertyType || '',
        propertyName: editData.propertyName || '',
        propertyId: editData.propertyId || '',
        area: editData.area || '',
        meterNumber: editData.meterNumber || '',
        parking: editData.parking || '',
        expectedMonthlyRental: editData.expectedMonthlyRental || '',
        expectedDeposit: editData.expectedDeposit || '',
        propertyPhoto: editData.propertyPhoto || '',
        status: editData.status || 'Vacant'
      });
    }
  }, [editData]);

  // Fetch buildings from Firestore on mount to populate dropdown
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'buildings'));
        const buildingList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBuildings(buildingList);
      } catch (error) {
        console.error("Error fetching buildings: ", error);
      }
    };

    fetchBuildings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle photo file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, propertyPhoto: file.name }));
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission to Firebase Firestore (supports Add & Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData && editData.id) {
        // Update existing property record
        const docRef = doc(db, 'properties', editData.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('Property details updated successfully!');
      } else {
        // Add new property record
        await addDoc(collection(db, 'properties'), {
          ...formData,
          createdAt: new Date()
        });
        alert('Property details successfully added to Firebase!');
      }

      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error("Error saving property document: ", error);
      alert('Failed to save property details.');
    }
  };

  return (
    <div className="property-container">
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="property-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{editData ? 'Edit Property Details' : 'Property or Unit Details'}</h2>
        </div>
        <hr />

        <form className="property-form" onSubmit={handleSubmit}>
          <div className="form-group select-group red-dropdown">
            <select 
              name="buildingOrComplex"
              value={formData.buildingOrComplex}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Building or Complex</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.buildingName || b.propertyNickname}>
                  {b.buildingName || b.propertyNickname}
                </option>
              ))}
            </select>
            <span className="dropdown-arrow white-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group select-group">
            <select 
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Property Type</option>
              <option value="Flat">Flat</option>
              <option value="Commercial">Commercial</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="propertyName"
              placeholder="Property Name / Number" 
              value={formData.propertyName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="propertyId"
              placeholder="Property ID" 
              value={formData.propertyId}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group suffix-group">
            <input 
              type="text" 
              name="area"
              placeholder="Area" 
              value={formData.area}
              onChange={handleChange} 
            />
            <span className="input-suffix">SqFt</span>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="meterNumber"
              placeholder="Meter Number" 
              value={formData.meterNumber}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="parking"
              placeholder="Parking ( 2 wheeler / 4 wheeler )" 
              value={formData.parking}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="expectedMonthlyRental"
              placeholder="Expected Monthly Rental" 
              value={formData.expectedMonthlyRental}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="expectedDeposit"
              placeholder="Expected Deposit" 
              value={formData.expectedDeposit}
              onChange={handleChange} 
            />
          </div>

          {/* Hidden File Input for Property Photo Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />

          {/* Property Photo Section */}
          <div className="photo-section-card">
            <label className="photo-label">
              Property Photo {formData.propertyPhoto && `(${formData.propertyPhoto})`}
            </label>
            <div className="photo-grid">
              <div className="photo-upload-box">
                <button 
                  type="button" 
                  className="upload-icon-btn" 
                  aria-label="Upload Photo"
                  onClick={handleUploadClick}
                >
                  <img src="/images/Group.png" alt="Upload" />
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn">{editData ? 'Update Property' : 'Add'}</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}