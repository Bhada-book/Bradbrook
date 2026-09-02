import React, { useState, useEffect, useRef } from 'react';
import './AddCollector.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import Navbar from './navbar.jsx';
import { db } from '../firebase.js';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';

export default function AddCollector({ onBack, onNavigate, editData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [notificationsData, setNotificationsData] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Properties ani Tenants sathi states
  const [propertiesList, setPropertiesList] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    permanentAddress: '',
    state: '',
    city: '',
    pinCode: '',
    document: '',
    allowedProperties: [] // Yithe collector la allow kelelya properties che IDs save hotil
  });

  // Properties ani Tenants Firebase madhun fetch karne
  useEffect(() => {
    const fetchData = async () => {
      try {
        const propSnapshot = await getDocs(collection(db, 'properties'));
        const props = propSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPropertiesList(props);

        const tenantSnapshot = await getDocs(collection(db, 'tenants'));
        const tenants = tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTenantsList(tenants);
      } catch (error) {
        console.error('Error fetching properties or tenants:', error);
      }
    };
    fetchData();
  }, []);

  // Automatically populate the form fields when editData is passed
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
        document: editData.document || '',
        allowedProperties: editData.allowedProperties || []
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

  // Property checkbox toggle logic
  const handlePropertyCheckboxChange = (propId) => {
    setFormData(prev => {
      const currentList = prev.allowedProperties || [];
      if (currentList.includes(propId)) {
        return { ...prev, allowedProperties: currentList.filter(id => id !== propId) };
      } else {
        return { ...prev, allowedProperties: [...currentList, propId] };
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        document: file.name
      }));
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData && editData.id) {
        const docRef = doc(db, editData.collectionName || 'collectors', editData.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('Collector updated successfully!');
      } else {
        await addDoc(collection(db, 'collectors'), {
          ...formData,
          createdAt: new Date()
        });
        alert('Collector added successfully to Firebase with assigned units!');
      }

      if (onBack) {
        onBack();
      } else if (onNavigate) {
        onNavigate('profile');
      }
    } catch (error) {
      console.error('Error saving collector document: ', error);
      alert('Failed to save collector details.');
    }
  };

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
      <Navbar 
        onNavigate={onNavigate} 
        notificationsData={notificationsData} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      <main className="building-content">
        <div className="form-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{editData ? 'Edit Collector' : 'Add Collector'}</h2>
        </div>
        <hr />

        <form className="building-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} maxLength={10} required />
          </div>

          <div className="form-group">
            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="text" name="permanentAddress" placeholder="Permanent Address" value={formData.permanentAddress} onChange={handleChange} />
          </div>

          <div className="form-group select-group">
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="" disabled>State</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="karnataka">Karnataka</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group select-group">
            <select name="city" value={formData.city} onChange={handleChange} required>
              <option value="" disabled>City</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group">
            <input type="text" name="pinCode" placeholder="Pin Code" value={formData.pinCode} onChange={handleChange} />
          </div>

          {/* --- Assign Building & Properties with Tenant / Vacant Info --- */}
          <div className="form-group" style={{ gridColumn: '1 / -1', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
              Assign Buildings / Properties & View Tenants:
            </label>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {propertiesList.length > 0 ? (
                propertiesList.map(prop => {
                  // Shoodha ki ya property/unit madhe kon tenant ahe ka
                  const assignedTenant = tenantsList.find(t => 
                    t.propertyId === prop.id || 
                    t.unitNumber === prop.propertyName || 
                    t.unitId === prop.id
                  );

                  return (
                    <label key={prop.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox"
                          checked={formData.allowedProperties.includes(prop.id)}
                          onChange={() => handlePropertyCheckboxChange(prop.id)}
                        />
                        <span>
                          <strong>{prop.buildingOrComplex || 'Building'}</strong> ({prop.propertyName || prop.unitId || prop.id})
                        </span>
                      </div>
                      <div>
                        {assignedTenant ? (
                          <span style={{ fontSize: '12px', background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                            Tenant: {assignedTenant.name || assignedTenant.fullName || 'Assigned'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', background: '#fce8e6', color: '#c5221f', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                            Vacant Unit
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })
              ) : (
                <span style={{ fontSize: '13px', color: '#777' }}>No properties found.</span>
              )}
            </div>
          </div>

          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleFileChange} />

          <div className="form-group file-upload-group">
            <input type="text" placeholder="Document (Adhaar/Pan/DL)" value={formData.document} readOnly />
            <button type="button" className="upload-icon-btn" aria-label="Upload Document" onClick={handleUploadClick}>
              <img src='images/Group5.png' alt="Upload" />
            </button>
          </div>

          <button type="submit" className="submit-btn">{editData ? 'Update Collector' : 'Add Collector'}</button>
        </form>
      </main>

      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}