import React from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
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

      {/* --- MAIN CONTENT SCROLLABLE AREA --- */}
      <main className="home-content">
        
        {/* COLLECTION SUMMARY CARD */}
        <section className="summary-section">
          <div className="summary-header">
            <h2>July 2026 - Collection Summary</h2>
            <div className="dropdown-filter">
              <span>Property</span>
              <span className="arrow">▼</span>
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
          <div className="section-header-bar">
            <h3>UNITS</h3>
            <div className="filters-row">
              <div className="mini-dropdown">Property <span>▼</span></div>
              <div className="mini-dropdown">Status <span>▼</span></div>
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
        <span className="status-badge overdue">● Overdue</span>
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
        <span className="status-badge paid">● Paid</span>
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
        <span className="status-badge overdue">● Overdue</span>
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
        <span className="status-badge paid">● Paid</span>
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
          <div className="section-header-bar">
            <h3>VACANT UNITS</h3>
            <div className="filters-row">
              <div className="mini-dropdown">Property <span>▼</span></div>
            </div>
          </div>

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
  
      </main>

      {/* --- BOTTOM FLOATING TAB BAR --- */}
      <nav className="bottom-nav">
        <button className="nav-item active" aria-label="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        <button className="nav-item" aria-label="Records">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        </button>
        
        {/* Center Floating Plus Action Button */}
        <div className="fab-container">
          <button className="fab-btn" aria-label="Add New">
            +
          </button>
        </div>

        <button className="nav-item" aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </button>

        <button className="nav-item" aria-label="Profile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </nav>
    </div>
  );
}