import React, { useState } from 'react';
import './AddManager.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js';
import { collection, addDoc } from 'firebase/firestore';

export default function AddManager({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0]?.name || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'managers'), {
        ...formData,
        createdAt: new Date()
      });
      alert('Manager added successfully to Firebase!');
      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error('Error adding manager document: ', error);
      alert('Failed to save manager details.');
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
            <span className="search-icon"><img src="images/Vector.png" alt="Search" /></span>
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
        <div className="form-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Add Manager</h2>
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
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
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
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
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

          <div className="form-group file-upload-group">
            <input 
              type="text" 
              placeholder="Document (Adhaar/Pan/DL)" 
              value={formData.document}
              readOnly 
            />
            <button type="button" className="upload-icon-btn" aria-label="Upload Document">
              <img src="images/Group5.png" alt="Upload"></img>
            </button>
          </div>

          <button type="submit" className="submit-btn">Add Manager</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}