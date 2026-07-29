import React from 'react';
import './TenantInformation.css';
import BottomNavWithPopup from './BottomNavWithPopup';

export default function TenantInformation( onBack, onNavigate) {
  return (
    <div className="tenant-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search" />
          </div>
          <button className="icon-btn notification-btn" aria-label="Notifications">
            <img src="/images/n.png" alt="Notifications" style={{ height: '22px', objectFit: 'contain' }} />
          </button>
          <button className="icon-btn menu-btn" aria-label="Menu">
            ☰
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="tenant-content">
        <div className="form-header">
       <button className="back-btn" aria-label="Go Back" onClick={onBack}>←</button>
          <h2>Tenant Information</h2>
        </div>

        <form className="tenant-form" onSubmit={(e) => e.preventDefault()}>
          {/* Top Red Dropdowns */}
          <div className="form-group select-group red-dropdown">
            <select defaultValue="">
              <option value="" disabled>Building or Complex</option>
              <option value="complex1">Complex 1</option>
            </select>
            <span className="dropdown-arrow white-arrow">▼</span>
          </div>

          <div className="form-group select-group red-dropdown">
            <select defaultValue="">
              <option value="" disabled>Property or Unit</option>
              <option value="unit1">Unit 101</option>
            </select>
            <span className="dropdown-arrow white-arrow">▼</span>
          </div>

          <p className="section-subtitle">Create a new account</p>

          <div className="form-group">
            <input type="text" placeholder="Name" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Surname" />
          </div>

          <div className="form-group">
            <input type="tel" placeholder="Mobile Number" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Company Name" />
          </div>

          <div className="form-group">
            <input type="email" placeholder="E-mail" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Permanent Address" />
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>State</option>
              <option value="state1">State 1</option>
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>City</option>
              <option value="city1">City 1</option>
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Pin Code" />
          </div>

          <div className="form-group upload-row-group">
            <input type="text" placeholder="Document  (Adhaar/Pan/DL)" readOnly />
            <button type="button" className="upload-inline-btn" aria-label="Upload Document">
              📤
            </button>
          </div>

          <p className="section-subtitle">Commercial Information</p>

          <div className="form-group">
            <input type="text" placeholder="Tenant ID" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Move IN Date" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Security Deposit" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Final Monthly Rental" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Maintenance Cost" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Total Monthly Rental" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Parking ( 2 wheeler / 4 wheeler )" />
          </div>

          <div className="form-group select-group">
            <select defaultValue="">
              <option value="" disabled>Monthly Payment</option>
              <option value="online">Online</option>
              <option value="cash">Cash</option>
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Expected Deposit" />
          </div>

          <div className="form-group upload-row-group">
            <input type="text" placeholder="Agreement Copy  (PDF/JPG)" readOnly />
            <button type="button" className="upload-inline-btn" aria-label="Upload Agreement">
              📤
            </button>
          </div>

          <div className="form-group">
            <input type="text" placeholder="Agreement End Date" />
          </div>

          <div className="form-group">
            <input type="text" placeholder="Yearly Hike %" />
          </div>

          {/* Handover Property Photos Card */}
          <div className="photo-section-card">
            <label className="photo-label">Handover Property Photos</label>
            <div className="photo-grid">
              {[1, 2, 3, 4].map((_, index) => (
                <div className="photo-upload-box" key={index}>
                  <button type="button" className="upload-icon-btn" aria-label="Upload Photo">
                    📤
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