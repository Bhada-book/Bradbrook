import React, { useState, useEffect } from 'react';
import './BuildingDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function BuildingDetails({ onBack, onNavigate, editData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State to hold form input values
  const [formData, setFormData] = useState({
    propertyNickname: '',
    buildingName: '',
    wing: '',
    googleLocation: '',
    town: '',
    state: '',
    city: '',
    pinCode: ''
  });

  // Automatically fill the form if editData is passed
  useEffect(() => {
    if (editData) {
      setFormData({
        propertyNickname: editData.propertyNickname || '',
        buildingName: editData.buildingName || '',
        wing: editData.wing || '',
        googleLocation: editData.googleLocation || '',
        town: editData.town || '',
        state: editData.state || '',
        city: editData.city || '',
        pinCode: editData.pinCode || ''
      });
    }
  }, [editData]);

  // Handle changes for inputs and selects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission to Firebase Firestore (supports Add & Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData && editData.id) {
        // Update existing record
        const docRef = doc(db, 'buildings', editData.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('Building details updated successfully!');
      } else {
        // Add new record
        await addDoc(collection(db, 'buildings'), {
          ...formData,
          createdAt: new Date()
        });
        alert('Building details stored successfully in Firebase!');
      }

      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error('Error saving building document: ', error);
      alert('Failed to save building details.');
    }
  };

  return (
    <div className="building-container">
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
      <main className="building-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{editData ? 'Edit Building Details' : 'Building or Complex Details'}</h2>
        </div>
        <hr />

        <form className="building-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              name="propertyNickname"
              placeholder="Property Nickname" 
              value={formData.propertyNickname}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="buildingName"
              placeholder="Building or Complex Name" 
              value={formData.buildingName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="wing"
              placeholder="Wing" 
              value={formData.wing}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group location-group">
            <input 
              type="text" 
              name="googleLocation"
              placeholder="Google Location" 
              value={formData.googleLocation}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="town"
              placeholder="Town" 
              value={formData.town}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group select-group">
            <select 
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="" disabled>State</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group select-group">
            <select 
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            >
              <option value="" disabled>City</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="pinCode"
              placeholder="Pin Code" 
              value={formData.pinCode}
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="submit-btn">{editData ? 'Update Building' : 'Add'}</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}