import React from 'react';
import './Side.css';
import { FaTimes, FaUser, FaHistory, FaBell, FaSignOutAlt } from 'react-icons/fa';

export default function Side({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className="side-drawer-overlay" onClick={onClose}>
      <div className="side-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="side-drawer-header">
          <h3>Menu</h3>
          <button className="close-drawer-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <ul className="side-drawer-links">
          <li onClick={() => { onNavigate('profile'); onClose(); }}>
            <FaUser /> Profile
          </li>
         <li onClick={() => { onNavigate('history'); onClose(); }}>
  <FaHistory /> History
</li>
        
          <li 
            className="logout-item" 
            onClick={() => { onNavigate('logout'); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#352c2c', cursor: 'pointer' }}
          >
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>
    </div>
  );
}