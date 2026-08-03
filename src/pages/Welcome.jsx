import React from 'react';
import './Welcome.css';

export default function Welcome({ onContinue }) {
  return (
    <div className="splash-container">
      <div className="content-wrapper">
        
        {/* --- TOP SECTION --- */}
        <div className="header-section">
          <img src="/images/blogo.png" style={{ height: '150px' }} alt="Logo" />
        </div>

        {/* --- MIDDLE LOGO SECTION --- */}
        <div className="logo-section">
          <div className="logo-wrapper">
            <div className="logo-text-top">
              <img src="/images/logot.png" style={{ height: '100px' }} alt="Logo Text" />
            </div>
          </div>
        </div>

        {/* --- BOTTOM BUTTON SECTION --- */}
        <button className="continue-btn" onClick={onContinue}>
          <span className="btn-text">Continue</span>
          <span className="btn-arrow" >  <img src='images/row.png' style={{height:'12px'}}></img></span>
        </button>

      </div>
    </div>
  );
}