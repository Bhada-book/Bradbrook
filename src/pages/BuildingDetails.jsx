import React, { useState, useEffect } from 'react';
import './BuildingDetails.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import Navbar from './navbar.jsx';

export default function BuildingDetails({ onBack, onNavigate, editData }) {

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

  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsData, setNotificationsData] = useState([]);

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

  // Fetch notifications from Firestore
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
    <div className="building-container">
      {/* --- TOP NAVBAR --- */}
      <Navbar 
        onNavigate={onNavigate} 
        notificationsData={notificationsData} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
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