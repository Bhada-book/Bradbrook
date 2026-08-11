import React, { useState, useEffect } from 'react';
import './TenantInformation.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db, storage } from '../firebase.js'; 
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function TenantInformation({ onBack, onNavigate, editData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [properties, setProperties] = useState([]);

  const [formData, setFormData] = useState({
    buildingOrComplex: '',
    propertyOrUnit: '',
    name: '',
    surname: '',
    mobile: '',
    companyName: '',
    email: '',
    permanentAddress: '',
    state: '',
    city: '',
    pinCode: '',
    document: '', // Stores Aadhar/Document URL
    tenantId: '',
    moveInDate: '',
    securityDeposit: '',
    finalMonthlyRental: '',
    maintenanceCost: '',
    totalMonthlyRental: '',
    parking: '',
    monthlyPayment: '',
    expectedDeposit: '',
    agreementCopy: '', // Stores Agreement Copy URL
    agreementEndDate: '',
    yearlyHike: '',
    propertyPhotos: []
  });

  useEffect(() => {
    if (editData) {
      const nameParts = (editData.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        ...editData,
        name: editData.name || firstName,
        surname: editData.surname || lastName,
        propertyOrUnit: editData.propertyOrUnit || editData.unitId || '',
        moveInDate: editData.moveInDate || editData.since || '',
        mobile: editData.mobile || editData.phone || '',
        propertyPhotos: editData.propertyPhotos || (editData.propertyPhoto ? [editData.propertyPhoto] : [])
      }));
    }
  }, [editData]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'properties'));
        const propList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProperties(propList);

        const uniqueBuildings = [...new Set(propList.map(item => item.buildingOrComplex).filter(Boolean))];
        setBuildings(uniqueBuildings);
      } catch (error) {
        console.error('Error fetching properties data: ', error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generic Firebase Storage Upload Handler for single files (Document or Agreement)
  const handleSingleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `tenant_files/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setFormData(prev => ({
        ...prev,
        [fieldName]: downloadUrl
      }));
    } catch (error) {
      console.error('Error uploading file: ', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Multiple Image Upload Handler for Property Photos
  const handleStorageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const storageRef = ref(storage, `tenants_photos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadUrl);
      }

      setFormData(prev => ({
        ...prev,
        propertyPhotos: [...prev.propertyPhotos, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading image: ', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      propertyPhotos: prev.propertyPhotos.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData && editData.id && editData.id.length > 3) {
        const tenantRef = doc(db, 'tenants', editData.id);
        await updateDoc(tenantRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('Tenant updated successfully!');
      } else {
        await addDoc(collection(db, 'tenants'), {
          ...formData,
          createdAt: new Date()
        });
        alert('Tenant added successfully!');
      }

      if (onNavigate) {
        onNavigate('tenantList'); 
      }
    } catch (error) {
      console.error('Error saving tenant: ', error);
      alert('Failed to save tenant: ' + error.message);
    }
  };

  return (
    <div className="tenant-container">
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

      <main className="tenant-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>{editData ? 'Edit Tenant Information' : 'Tenant Information'}</h2>
        </div>
        <hr />

        <form className="tenant-form" onSubmit={handleSubmit}>
          <div className="form-group select-group red-dropdown">
            <select 
              name="buildingOrComplex" 
              value={formData.buildingOrComplex} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>Building or Complex</option>
              {buildings.map((bldg, idx) => (
                <option key={idx} value={bldg}>{bldg}</option>
              ))}
            </select>
            <span className="dropdown-arrow white-arrow" style={{height:'20px'}}>
              <img src='images/arrow.png' alt="Arrow" />
            </span>
          </div>

          <div className="form-group select-group red-dropdown">
            <select 
              name="propertyOrUnit" 
              value={formData.propertyOrUnit} 
              onChange={handleChange} 
              required
            >
              <option value="" disabled>Property or Unit</option>
              {properties
                .filter(p => !formData.buildingOrComplex || p.buildingOrComplex === formData.buildingOrComplex)
                .map((prop) => (
                  <option key={prop.id} value={prop.propertyName}>{prop.propertyName}</option>
                ))}
            </select>
            <span className="dropdown-arrow white-arrow" style={{height:'20px'}}>
              <img src='images/arrow.png' alt="Arrow" />
            </span>
          </div>

          <p className="section-subtitle">{editData ? 'Update account details' : 'Create a new account'}</p>

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
            <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="text" name="permanentAddress" placeholder="Permanent Address" value={formData.permanentAddress} onChange={handleChange} />
          </div>

          <div className="form-group select-group">
            <select name="state" value={formData.state} onChange={handleChange}>
              <option value="" disabled>State</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group select-group">
            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="" disabled>City</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group">
            <input type="text" name="pinCode" placeholder="Pin Code" value={formData.pinCode} onChange={handleChange} />
          </div>

          {/* Document Upload Input */}
          <div className="form-group upload-row-group">
            <input 
              type="text" 
              placeholder="Document (Aadhar/Pan/DL)" 
              value={formData.document ? 'Document Uploaded Successfully' : ''} 
              readOnly 
            />
            {formData.document && (
              <a href={formData.document} target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px', fontSize: '12px' }}>
                View
              </a>
            )}
            <label htmlFor="document-file-input" className="upload-inline-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src="images/Group5.png" style={{height:"20px"}} alt="Upload" />
            </label>
            <input 
              id="document-file-input" 
              type="file" 
              accept=".pdf,image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => handleSingleFileUpload(e, 'document')} 
            />
          </div>

          <p className="section-subtitle">Commercial Information</p>

          <div className="form-group">
            <input type="text" name="tenantId" placeholder="Tenant ID" value={formData.tenantId} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="date" name="moveInDate" placeholder="Move IN Date" value={formData.moveInDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="number" name="securityDeposit" placeholder="Security Deposit" value={formData.securityDeposit} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="number" name="finalMonthlyRental" placeholder="Final Monthly Rental" value={formData.finalMonthlyRental} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="number" name="maintenanceCost" placeholder="Maintenance Cost" value={formData.maintenanceCost} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="number" name="totalMonthlyRental" placeholder="Total Monthly Rental" value={formData.totalMonthlyRental} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="text" name="parking" placeholder="Parking ( 2 wheeler / 4 wheeler )" value={formData.parking} onChange={handleChange} />
          </div>

          <div className="form-group select-group">
            <select name="monthlyPayment" value={formData.monthlyPayment} onChange={handleChange}>
              <option value="" disabled>Monthly Payment</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow" /></span>
          </div>

          <div className="form-group">
            <input type="number" name="expectedDeposit" placeholder="Expected Deposit" value={formData.expectedDeposit} onChange={handleChange} />
          </div>

          {/* Agreement Copy Upload Input */}
          <div className="form-group upload-row-group">
            <input 
              type="text" 
              placeholder="Agreement Copy (PDF/JPG)" 
              value={formData.agreementCopy ? 'Agreement Uploaded Successfully' : ''} 
              readOnly 
            />
            {formData.agreementCopy && (
              <a href={formData.agreementCopy} target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px', fontSize: '12px' }}>
                View
              </a>
            )}
            <label htmlFor="agreement-file-input" className="upload-inline-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src="images/Group5.png" style={{height:"20px"}} alt="Upload" />
            </label>
            <input 
              id="agreement-file-input" 
              type="file" 
              accept=".pdf,image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => handleSingleFileUpload(e, 'agreementCopy')} 
            />
          </div>

          <div className="form-group">
            <input type="date" name="agreementEndDate" placeholder="Agreement End Date" value={formData.agreementEndDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="number" name="yearlyHike" placeholder="Yearly Hike %" value={formData.yearlyHike} onChange={handleChange} />
          </div>

          {/* Handover Property Photos Section */}
          <div className="photo-section-card">
            <label className="photo-label">Handover Property Photos</label>
            {uploading && <p style={{ color: 'blue', fontSize: '12px', margin: '4px 0' }}>Uploading files...</p>}
            
            <div className="photo-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
              {formData.propertyPhotos.map((photoUrl, index) => (
                <div key={index} style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0, border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', background: '#f9f9f9' }}>
                  <a href={photoUrl} target="_blank" rel="noopener noreferrer" title="Click to view full image">
                    <img src={photoUrl} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                  </a>
                  <button 
                    type="button" 
                    onClick={() => handleRemovePhoto(index)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255, 0, 0, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <div style={{ width: '70px', height: '70px', border: '1px dashed #bbb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', flexShrink: 0 }}>
                <label htmlFor="storage-photos-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <img src="/images/Group.png" alt="Add photo" style={{ height: '22px', objectFit: 'contain' }} />
                </label>
                <input 
                  id="storage-photos-input" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={handleStorageUpload} 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={uploading}>
            {uploading ? 'Processing...' : (editData ? 'Update' : 'Add')}
          </button>
        </form>
      </main>
      
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}