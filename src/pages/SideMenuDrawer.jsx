import React from 'react';
import './SideMenuDrawer.css';

export default function SideMenuDrawer({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  const userRole = localStorage.getItem('userRole') || 'Admin/Landlord';
  const isCollector = userRole === 'Collector';

  let menuOptions = [];

  if (isCollector) {
    menuOptions = [
     { name: 'Profile', page: 'adminProfile' },
       {  name: 'Tenant List', page: 'tenantList' },
      { name: 'Add Tenant', page: 'tenant' }
    ];
  } else {
    menuOptions = [
      { name: 'Tenant History', page: 'history' },
      { name: 'Unit Ledger / Payments', page: 'unit-ledger' },
      { name: 'Add Manager', page: 'addManager' },
      { name: 'Add Collector', page: 'addCollector' },
           { name: 'Profile', page: 'adminProfile' },
       {  name: 'Tenant List', page: 'tenantList' },
    ];
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('allowedProperties');
    
    onClose();
    
    if (typeof onNavigate === 'function') {
      onNavigate('login');
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
                if (typeof onNavigate === 'function') {
                  onNavigate(item.page);
                } else {
                  console.warn('onNavigate function is missing in SideMenuDrawer');
                }
                onClose();
              }}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}

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