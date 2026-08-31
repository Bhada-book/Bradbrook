import React, { useState, useEffect, useRef } from 'react';
import './AddManager.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import Navbar from './navbar.jsx';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function AddManager({ onBack, onNavigate, editData }) {
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    permanentAddress: '',
    state: '',
    city: '',
    pinCode: '',
    document: ''
  });

  // Automatically fill the form when editData is passed
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        surname: editData.surname || '',
        mobile: editData.mobile || '',
        email: editData.email || '',
        permanentAddress: editData.permanentAddress || '',
        state: editData.state || '',
        city: editData.city || '',
        pinCode: editData.pinCode || '',
        document: editData.document || ''
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection from the hidden file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        document: file.name
      }));
    }
  };

  // Trigger hidden file input click when upload button is clicked
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData && editData.id) {
        // Update existing record in Firestore
        const docRef = doc(db, editData.collectionName || 'managers', editData.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('Manager updated successfully!');
      } else {
        // Add new record
        await addDoc(collection(db, 'managers'), {
          ...formData,
          createdAt: new Date()
        });
        alert('Manager added successfully to Firebase!');
      }

      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('profile');
      }
    } catch (error) {
      console.error('Error saving manager document: ', error);
      alert('Failed to save manager details.');
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
          <h2>{editData ? 'Edit Manager' : 'Add Manager'}</h2>
        </div>
        <hr />

        <form className="building-form" onSubmit={handleSubmit}>
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

          {/* Hidden File Input for Image/Document Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*,.pdf" 
            onChange={handleFileChange} 
          />

          <div className="form-group file-upload-group">
            <input 
              type="text" 
              placeholder="Document (Adhaar/Pan/DL)" 
              value={formData.document}
              readOnly 
            />
            <button 
              type="button" 
              className="upload-icon-btn" 
              aria-label="Upload Document"
              onClick={handleUploadClick}
            >
              <img src="images/Group5.png" alt="Upload" />
            </button>
          </div>

          <button type="submit" className="submit-btn">{editData ? 'Update Manager' : 'Add Manager'}</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}