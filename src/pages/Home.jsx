import React, { useState } from 'react';
import './Home.css';
import BottomNavWithPopup from './BottomNavWithPopup';
import SideMenuDrawer from './SideMenuDrawer';

export default function PropertyDetails({ onBack, onNavigate }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleSelectOption = (pageName) => {
    setIsPopupOpen(false);
    if (onNavigate) {
      onNavigate(pageName); 
    }
  };
  return (
    <div className="home-container">
      {/* --- TOP NAVBAR --- */}
      <header className="home-navbar">
        <div className="nav-logo-area">
          <img src="/images/logot.png" alt="Logo" className="nav-blogo" />
        </div>
        <div className="nav-right-icons">
          <div className="search-box">
            <span className="search-icon"><img src='images/Vector.png'></img></span>
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
      {/* --- MAIN CONTENT SCROLLABLE AREA --- */}
      <main className="home-content">
        
        {/* COLLECTION SUMMARY CARD */}
        <section className="summary-section">
          <div className="summary-header">
            <h2>July 2026 - Collection Summary</h2>
            <div className="dropdown-filter">
              <span>Property</span>
              <span className="arrow" style={{height:'20px'}}><img src='images/arrow.png'></img></span>
            </div>
          </div>

          <div className="summary-cards-grid">
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-green">● Received</p>
            </div>
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-red">● Overdue</p>
            </div>
            <div className="summary-card">
              <span className="card-label">Rs.</span>
              <h3>00,00,000/-</h3>
              <p className="status-orange">● Old Pending</p>
            </div>
          </div>

          <div className="occupancy-pill">
            Occupied Units : <span>010</span> &nbsp;|&nbsp; Vacant Units : <span>002</span>
          </div>
        </section>

        {/* UNITS SECTION (Occupied/Active) */}
        <section className="units-section">
          <div className="section-header-bar1">
            <h3>UNITS</h3>
            <div className="filters-row">
              <div className="mini-dropdown">Property <span style={{height:'20px'}}><img src='images/arrow.png'></img></span></div>
              <div className="mini-dropdown">Status <span style={{height:'20px'}}><img src='images/arrow.png'></img></span></div>
            </div>
          </div>
          <hr></hr>

        <div className="unit-cards-grid">
  {/* Unit Card 1 - Paid */}
  <div className="unit-card">
    <div className="unit-card-top">
      <span className="bldg-name">Building Name</span>
      <span className="badge-tag commercial">Commercial</span>
    </div>
    <div className="unit-card-body">
      <div>
        <h4 className="unit-no">101</h4>
        <p className="tenant-name">Sandeep Ghige</p>
        <div className="status-container">
          <span className="status-badge paid">● Paid</span>
        </div>
      </div>
      <div className="unit-card-right">
        <span className="rent-amount">Rs.10,000/-</span>
      </div>
    </div>
  </div>

  {/* Unit Card 2 - Overdue */}
  <div className="unit-card">
    <div className="unit-card-top">
      <span className="bldg-name">Building Name</span>
      <span className="badge-tag flat">Flat</span>
    </div>
    <div className="unit-card-body">
      <div>
        <h4 className="unit-no">101</h4>
        <p className="tenant-name">Sandeep Ghige</p>
        <div className="status-container">
          <span className="status-badge overdue">● Overdue</span>
        </div>
      </div>
      <div className="unit-card-right">
        <span className="rent-amount">Rs.10,000/-</span>
      </div>
    </div>
  </div>

  {/* Unit Card 3 - Paid */}
  <div className="unit-card">
    <div className="unit-card-top">
      <span className="bldg-name">Building Name</span>
      <span className="badge-tag commercial">Commercial</span>
    </div>
    <div className="unit-card-body">
      <div>
        <h4 className="unit-no">101</h4>
        <p className="tenant-name">Sandeep Ghige</p>
        <div className="status-container">
          <span className="status-badge paid">● Paid</span>
        </div>
      </div>
      <div className="unit-card-right">
        <span className="rent-amount">Rs.10,000/-</span>
      </div>
    </div>
  </div>

  {/* Unit Card 4 - Overdue */}
  <div className="unit-card">
    <div className="unit-card-top">
      <span className="bldg-name">Building Name</span>
      <span className="badge-tag flat">Flat</span>
    </div>
    <div className="unit-card-body">
      <div>
        <h4 className="unit-no">101</h4>
        <p className="tenant-name">Sandeep Ghige</p>
        <div className="status-container">
          <span className="status-badge overdue">● Overdue</span>
        </div>
      </div>
      <div className="unit-card-right">
        <span className="rent-amount">Rs.10,000/-</span>
      </div>
    </div>
  </div>

  {/* Unit Card 5 - Paid */}
  <div className="unit-card">
    <div className="unit-card-top">
      <span className="bldg-name">Building Name</span>
      <span className="badge-tag commercial">Commercial</span>
    </div>
    <div className="unit-card-body">
      <div>
        <h4 className="unit-no">101</h4>
        <p className="tenant-name">Sandeep Ghige</p>
        <div className="status-container">
          <span className="status-badge paid">● Paid</span>
        </div>
      </div>
      <div className="unit-card-right">
        <span className="rent-amount">Rs.10,000/-</span>
      </div>
    </div>
  </div>

</div>
      
        </section>

        {/* VACANT UNITS SECTION */}
        <section className="units-section vacant-section">
          <div className="section-header-bar1">
            <h3>VACANT UNITS</h3>
            <div className="filters-row">
              <div className="mini-dropdown">Property <span style={{height:'20px'}}><img src='images/arrow.png'></img></span></div>
            </div>
          </div>
          <hr></hr>

          <div className="unit-cards-grid">
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <div className="unit-card vacant-card" key={index}>
                <div className="unit-card-top">
                  <span className="bldg-name">Building Name</span>
                  <span className={`badge-tag ${index % 2 === 0 ? 'commercial' : 'flat'}`}>
                    {index % 2 === 0 ? 'Commercial' : 'Flat'}
                  </span>
                </div>
                <div className="unit-card-body">
                  <div>
                    <h4 className="unit-no">101</h4>
                    <p className="sub-info">750 sqft</p>
                  </div>
                  <div className="unit-card-right">
                    <span className="rent-amount">Rs.10,000/-</span>
                  </div>
                </div>
                <div className="vacant-footer-info">
                  Parking : Two Wheeler + Four Wheeler
                </div>
              </div>
            ))}
          </div>
        </section>
  
      </main><BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
      </div>
  );
}