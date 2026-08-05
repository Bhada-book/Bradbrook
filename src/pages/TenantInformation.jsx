import React, { useState, useEffect } from 'react';
import './TenantInformation.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';
import { db } from '../firebase.js'; 
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function TenantInformation({ onBack, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dropdown options data fetched from Firebase
  const [buildings, setBuildings] = useState([]);
  const [properties, setProperties] = useState([]);

  // Form state inputs
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
    document: '', // Placeholder for document upload URL/status
    tenantId: '',
    moveInDate: '',
    securityDeposit: '',
    finalMonthlyRental: '',
    maintenanceCost: '',
    totalMonthlyRental: '',
    parking: '',
    monthlyPayment: '',
    expectedDeposit: '',
    agreementCopy: '', // Placeholder for agreement copy URL/status
    agreementEndDate: '',
    yearlyHike: ''
  });

  // Fetch buildings and properties from Firestore on load
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'properties'));
        const propList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProperties(propList);

        // Extract unique buildings/complexes
        const uniqueBuildings = [...new Set(propList.map(item => item.buildingOrComplex).filter(Boolean))];
        setBuildings(uniqueBuildings);
      } catch (error) {
        console.error('Error fetching properties data: ', error);
      }
    };

    fetchDropdownData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission to Firebase Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tenants'), {
        ...formData,
        createdAt: new Date()
      });
      alert('Tenant added successfully!');
      if (onNavigate) {
        onNavigate('home'); // Redirect back home or wherever appropriate after adding
      }
    } catch (error) {
      console.error('Error adding tenant: ', error);
      alert('Failed to add tenant: ' + error.message);
    }
  };

  return (
    <div className="tenant-container">
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
      <main className="tenant-content">
        <div className="form-header">
          <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Tenant Information</h2>
        </div>
        <hr></hr>

        <form className="tenant-form" onSubmit={handleSubmit}>
          {/* Top Red Dropdowns */}
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
              <img src='images/arrow.png' alt="Arrow"></img>
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
              <img src='images/arrow.png' alt="Arrow"></img>
            </span>
          </div>

          <p className="section-subtitle">Create a new account</p>

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
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
          </div>

          <div className="form-group select-group">
            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="" disabled>City</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
          </div>

          <div className="form-group">
            <input type="text" name="pinCode" placeholder="Pin Code" value={formData.pinCode} onChange={handleChange} />
          </div>

          <div className="form-group upload-row-group">
            <input type="text" placeholder="Document  (Adhaar/Pan/DL)" value={formData.document} readOnly />
            <button type="button" className="upload-inline-btn" aria-label="Upload Document">
             <img src="images/Group5.png" style={{height:"20px"}} alt="Upload"></img>
            </button>
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
            <span className="dropdown-arrow" style={{height:'20px'}}><img src='images/arrow.png' alt="Arrow"></img></span>
          </div>

          <div className="form-group">
            <input type="number" name="expectedDeposit" placeholder="Expected Deposit" value={formData.expectedDeposit} onChange={handleChange} />
          </div>

          <div className="form-group upload-row-group">
            <input type="text" placeholder="Agreement Copy  (PDF/JPG)" value={formData.agreementCopy} readOnly />
            <button type="button" className="upload-inline-btn" aria-label="Upload Agreement">
             <img src="images/Group5.png" style={{height:"20px"}} alt="Upload"></img>
            </button>
          </div>

          <div className="form-group">
            <input type="date" name="agreementEndDate" placeholder="Agreement End Date" value={formData.agreementEndDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <input type="number" name="yearlyHike" placeholder="Yearly Hike %" value={formData.yearlyHike} onChange={handleChange} />
          </div>

          {/* Handover Property Photos Card */}
          <div className="photo-section-card">
            <label className="photo-label">Handover Property Photos</label>
            <div className="photo-grid">
              {[1].map((_, index) => (
                <div className="photo-upload-box" key={index}>
                  <button type="button" className="upload-icon-btn" aria-label="Upload Photo">
                    <img src="/images/Group.png" alt="Photo upload"></img>
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