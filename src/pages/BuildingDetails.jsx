import React, { useState } from 'react';
import './BuildingDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; // Make sure the path to your firebase config is correct
import { collection, addDoc } from 'firebase/firestore';

export default function BuildingDetails({ onBack, onNavigate }) {
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

  // Handle changes for inputs and selects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission to Firebase Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'buildings'), {
        ...formData,
        createdAt: new Date()
      });
      alert('Building details stored successfully in Firebase!');
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error adding building document: ', error);
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
          <h2>Building or Complex Details</h2>
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
              <option value="state1">State 1</option>
              <option value="state2">State 2</option>
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
              <option value="city1">City 1</option>
              <option value="city2">City 2</option>
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

          <button type="submit" className="submit-btn">Add</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}