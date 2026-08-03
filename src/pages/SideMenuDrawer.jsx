import React from 'react';
import './SideMenuDrawer.css';

export default function SideMenuDrawer({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  const menuOptions = [
    { name: 'Tenant History', page: 'history'},
    { name: 'Tenant List', page: 'tenantList' },
    { name: 'Tenant Profile', page: 'profile'},
    { name: 'Unit Ledger / Payments', page: 'unit-ledger' },
    { name: 'Admin Profile', page: 'adminProfile' },
    { name: 'Add Manager', page: 'addManager'},
    { name: 'Add Collector', page: 'addCollector'},
    { name: 'Overdue Details', page: 'overdue' },
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