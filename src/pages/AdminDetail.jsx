import React, { useState, useEffect } from 'react';
import './AddManager.css'; 
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import Navbar from './navbar.jsx';

export default function AdminDetail({ onBack, onNavigate, adminData }) {

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    permanentAddress: '',
    state: '',
    city: '',
    pinCode: ''
  });

  // Automatically populate data when loaded
  useEffect(() => {
    if (adminData) {
      setFormData({
        name: adminData.name || '',
        surname: adminData.surname || '',
        mobile: adminData.mobile || '',
        email: adminData.email || '',
        permanentAddress: adminData.permanentAddress || '',
        state: adminData.state || '',
        city: adminData.city || '',
        pinCode: adminData.pinCode || adminData.pincode || ''
      });
    }
  }, [adminData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (adminData && adminData.id) {
        const adminRef = doc(db, adminData.collectionName || 'users', adminData.id);
        await updateDoc(adminRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('Admin profile updated successfully!');
        if (onBack) onBack(); // Automatically go back after saving
      }
    } catch (error) {
      console.error('Error updating admin profile:', error);
      alert('Failed to update profile.');
    }
  };
// Add this state near your other state initializations
const [notificationsData, setNotificationsData] = useState([]);

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
    <div className="building-container">
      {/* --- TOP NAVBAR --- */}
  <Navbar notificationsData={notificationsData} onNavigate={onNavigate} />
      {/* --- MAIN CONTENT AREA --- */}
      <main className="building-content">
        <div className="form-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Edit Admin / Landlord Details</h2>
        </div>
        <hr />

        {/* Editable form shows directly */}
        <form className="building-form" onSubmit={handleUpdate} style={{ marginTop: '15px' }}>
          <div className="form-group">
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="surname"
              placeholder="Surname" 
              value={formData.surname}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="tel" 
              name="mobile"
              placeholder="Mobile Number" 
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="email" 
              name="email"
              placeholder="E-mail" 
              value={formData.email}
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="permanentAddress"
              placeholder="Permanent Address" 
              value={formData.permanentAddress}
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
              <option value="maharashtra">Maharashtra</option>
              <option value="karnataka">Karnataka</option>
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
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="submit-btn" style={{ flex: 1 }}>Save Changes</button>
            <button type="button" className="submit-btn" style={{ flex: 1, background: '#6c757d' }} onClick={onBack}>Cancel</button>
          </div>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}