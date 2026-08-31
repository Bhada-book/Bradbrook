import React from 'react';
import './SideMenuDrawer.css';

export default function SideMenuDrawer({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  // Retrieve user role to conditionally hide restricted menu items
  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isCollector = userRole === 'Collector';

  // Base menu options available to all roles
  let menuOptions = [
    { name: 'Tenant History', page: 'history'},
    { name: 'Tenant List', page: 'tenantList' },
    { name: 'Unit Ledger / Payments', page: 'unit-ledger' },
    { name: 'Overdue Details', page: 'overdue' },
  ];

  // If the user is an Admin/Landlord or Manager, include administrative options
  if (!isCollector) {
    menuOptions.push(
      { name: 'Admin Profile', page: 'adminProfile' },
      { name: 'Add Manager', page: 'addManager' },
      { name: 'Add Collector', page: 'addCollector' }
    );
  }

  const handleLogout = () => {
    // Clear user role and session data from localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('allowedProperties');
    
    onClose();
    
    if (onNavigate) {
      onNavigate('login'); // Triggers lowercase 'login'
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="side-menu-overlay" onClick={onClose}>
      <div className="side-menu-container" onClick={(e) => e.stopPropagation()}>
        <div className="side-menu-header">
          <h3>Menu</h3>
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

          {/* Logout Menu Option */}
          <button 
            className="side-menu-item logout-item"
            onClick={handleLogout}
            style={{ color: '#352c2c' }}
          >
            <span></span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}