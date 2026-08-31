import React, { useState } from 'react';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import BuildingDetails from './pages/BuildingDetails';
import PropertyDetails from './pages/PropertyDetails';
import TenantInformation from './pages/TenantInformation';
import TenantHistory from './pages/TenantHistory';
import TenantList from './pages/TenantList';
import Home from './pages/Home';
import './App.css';
import UnitLedger from './pages/UnitLedger';
import TenantProfile from './pages/TenantProfile';
import Notifications from './pages/Notifications';
import AdminProfile from './pages/AdminProfile';
import AdminDetail from './pages/AdminDetail';
import AddManager from './pages/AddManager';
import AddCollector from './pages/AddCollector';
import Overdue from './pages/Overdue';
import DocumentViewer from './pages/DocumentViewer';
import AdminApprovalNotifications from './pages/AdminApprovalNotifications';
import Side from './pages/Tenant/Side';
import History from '../src/pages/Tenant/History'
import Profile from '../src/pages/Tenant/Profile'
import Navbar from './pages/navbar';

// Import Tenant Specific Pages
import TenantHome from './pages/Tenant/TenantHome';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); 
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingTenantData, setEditingTenantData] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Centralized navigation handler
 // Centralized navigation handler
  const handleAppNavigation = (page) => {
    if (page === 'login' || page === 'logout') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      localStorage.removeItem('allowedProperties');
      
      setCurrentStep('login'); // This switches the main view back to Login
      setCurrentPage('home');
    } else {
      setCurrentPage(page);
    }
    setIsMenuOpen(false);
  };

  if (currentStep === 'welcome') {
    return <Welcome onContinue={() => setCurrentStep('login')} />;
  }

  if (currentStep === 'login') {
    return (
      <Login 
        onLoginSuccess={() => setCurrentStep('dashboard')} 
        onNavigateToRegister={() => setCurrentStep('register')} 
      />
    );
  }

  if (currentStep === 'register') {
    return (
      <Register 
        onRegisterSuccess={() => setCurrentStep('dashboard')} 
        onBackToLogin={() => setCurrentStep('login')} 
      />
    );
  }

  if (currentStep === 'dashboard') {
    const userRole = localStorage.getItem('userRole');

    // Route 1: Tenant Dashboard Flow
    if (userRole === 'Tenant') {
      return (
        <div className="app-container">
          {currentPage === 'home' && (
            <TenantHome 
              onNavigate={handleAppNavigation} 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen} 
            />
          )}
          {currentPage === 'profile' && (
            <Profile onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
          )}
          {currentPage === 'notifications' && (
            <Notifications onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
          )}
         {currentPage === 'history' && (
  <History onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
)}
          {currentPage === 'invoices' && (
            <div style={{ padding: '20px' }}>
              <h2>Invoices Page</h2>
              <button onClick={() => setCurrentPage('home')}>Back to Home</button>
            </div>
          )}

          {/* Correct Side Drawer Component for Tenant */}
          <Side 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            onNavigate={handleAppNavigation} 
          />
        </div>
      );
    }

    // Route 2: Admin / Manager / Collector Dashboard Flow
    return (
      <div className="app-container">
        {currentPage === 'home' && (
          <Home onNavigate={handleAppNavigation} onOpenMenu={() => setIsMenuOpen(true)} />
        )}
        {currentPage === 'building' && (
          <BuildingDetails onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'navbar' && (
          <Navbar onBack={() => setCurrentPage ('navbar')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'property' && (
          <PropertyDetails onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'tenant' && (
          <TenantInformation 
            onBack={() => { setEditingTenantData(null); setCurrentPage('tenantList'); }} 
            onNavigate={(page) => { setEditingTenantData(null); handleAppNavigation(page); }} 
            editData={editingTenantData} 
          />
        )}
        {currentPage === 'history' && (
          <TenantHistory onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'tenantList' && (
          <TenantList 
            onBack={() => setCurrentPage('home')} 
            onNavigate={handleAppNavigation} 
            onEditTenant={(tenant) => { setEditingTenantData(tenant); setCurrentPage('tenant'); }}
          />
        )}
        {currentPage === 'unit-ledger' && (
          <UnitLedger onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'profile' && (
          <TenantProfile onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'notifications' && (
          <Notifications onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'adminProfile' && (
          <AdminProfile 
            onBack={() => setCurrentPage('home')} 
            onNavigate={handleAppNavigation} 
            onEditProfile={(profile) => setSelectedProfile(profile)}
          />
        )}
        {currentPage === 'adminDetail' && (
          <AdminDetail 
            onBack={() => { setSelectedProfile(null); setCurrentPage('adminProfile'); }} 
            onNavigate={(page) => { setSelectedProfile(null); handleAppNavigation(page); }} 
            adminData={selectedProfile} 
          />
        )}
        {currentPage === 'addManager' && (
          <AddManager 
            onBack={() => { setSelectedProfile(null); setCurrentPage('adminProfile'); }} 
            onNavigate={(page) => { setSelectedProfile(null); handleAppNavigation(page); }} 
            editData={selectedProfile} 
          />
        )}
        {currentPage === 'addCollector' && (
          <AddCollector 
            onBack={() => { setSelectedProfile(null); setCurrentPage('adminProfile'); }} 
            onNavigate={(page) => { setSelectedProfile(null); handleAppNavigation(page); }} 
            editData={selectedProfile} 
          />
        )}
        {currentPage === 'overdue' && (
          <Overdue onBack={() => setCurrentPage('home')} onNavigate={handleAppNavigation} />
        )}
        {currentPage === 'documentViewer' && (
          <DocumentViewer 
            onBack={() => setCurrentPage('adminProfile')} 
            onNavigate={handleAppNavigation} 
          />
        )}
        {currentPage === 'adminApprovals' && (
          <AdminApprovalNotifications 
            onBack={() => setCurrentPage('adminProfile')} 
            onNavigate={handleAppNavigation} 
          />
        )}

        <Side 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={handleAppNavigation} 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2>Session Ended or Page Not Found</h2>
      <button 
        onClick={() => { setCurrentStep('login'); setCurrentPage('home'); }}
        style={{ marginTop: '15px', padding: '10px 20px', background: '#b30000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Go to Login
      </button>
    </div>
  );
}

export default App;