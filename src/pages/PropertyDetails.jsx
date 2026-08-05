import React, { useState, useEffect } from 'react';
import './PropertyDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; // Ensure your firebase configuration path is correct
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function PropertyDetails({ onBack, onNavigate }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buildings, setBuildings] = useState([]);

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
    status: 'Vacant' // Default status for home page mapping
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'properties'), {
        ...formData,
        createdAt: new Date()
      });
      alert('Property details successfully added to Firebase!');
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error("Error adding property document: ", error);
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
            <span className="search-icon"><img src='images/Vector.png' alt="Search"></img></span>
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
          <h2>Property or Unit Details</h2>
        </div>
        <hr></hr>

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
            <span className="dropdown-arrow white-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
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
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
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

          {/* Property Photo Section */}
          <div className="photo-section-card">
            <label className="photo-label">Property Photo</label>
            <div className="photo-grid">
              {[1].map((_, index) => (
                <div className="photo-upload-box" key={index}>
                  <button type="button" className="upload-icon-btn" aria-label="Upload Photo">
                    <img src="/images/Group.png" alt="Upload"></img>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">Add</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}