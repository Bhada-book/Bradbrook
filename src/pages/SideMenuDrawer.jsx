import React from 'react';
import './SideMenuDrawer.css';

export default function SideMenuDrawer({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  const menuOptions = [
    { name: 'Tenant History', page: 'history', icon: '📜' },

    { name: 'Tenant List', page: 'tenantList', icon: '📋' },
    { name: 'Tenant Profile', page: 'tenantProfile', icon: '📇' },
    { name: 'Unit Ledger / Payments', page: 'unitLedger', icon: '💰' },
    { name: 'Admin Profile', page: 'adminProfile', icon: '⚙️' },
    { name: 'Add Manager', page: 'addManager', icon: '➕' },
    { name: 'Add Collector', page: 'addCollector', icon: '➕' },
    { name: 'Overdue Details', page: 'overdue', icon: '⚠️' },
  ];

  return (
    <div className="side-menu-overlay" onClick={onClose}>
      <div className="side-menu-container" onClick={(e) => e.stopPropagation()}>
        <div className="side-menu-header">
          <h3>Menu Options</h3>
          <button className="close-drawer-btn" onClick={onClose}>✕</button>
        </div>

        <div className="side-menu-list">
          {menuOptions.map((item, index) => (
            <button 
              key={index} 
              className="side-menu-item"
              onClick={() => {
                onNavigate(item.page);
                onClose();
              }}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}