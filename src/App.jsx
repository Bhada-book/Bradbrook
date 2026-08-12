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
import SideMenuDrawer from './pages/SideMenuDrawer';
import './App.css';
import UnitLedger from './pages/UnitLedger';
import TenantProfile from './pages/TenantProfile';
import Notifications from './pages/Notifications';
import AdminProfile from './pages/AdminProfile';
import AdminDetail from './pages/AdminDetail';
import BottomNavWithPopup from './pages/BottomNavWithPopup';
import AddManager from './pages/AddManager';
import AddCollector from './pages/AddCollector';
import Overdue from './pages/Overdue';
import DocumentViewer from './pages/DocumentViewer';
import AdminApprovalNotifications from './pages/AdminApprovalNotifications';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); // 'welcome', 'login', 'register', 'dashboard'
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingTenantData, setEditingTenantData] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

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
    return (
      <div className="app-container">
        {currentPage === 'home' && (
          <Home onNavigate={setCurrentPage} onOpenMenu={() => setIsMenuOpen(true)} />
        )}
        {currentPage === 'building' && (
          <BuildingDetails onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'property' && (
          <PropertyDetails onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'tenant' && (
          <TenantInformation 
            onBack={() => { setEditingTenantData(null); setCurrentPage('tenantList'); }} 
            onNavigate={(page) => { setEditingTenantData(null); setCurrentPage(page); }}
            editData={editingTenantData} 
          />
        )}
        {currentPage === 'history' && (
          <TenantHistory onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'tenantList' && (
          <TenantList 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
            onEditTenant={(tenant) => { setEditingTenantData(tenant); setCurrentPage('tenant'); }}
          />
        )}
        {currentPage === 'unit-ledger' && (
          <UnitLedger onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'profile' && (
          <TenantProfile onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'notifications' && (
          <Notifications onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'adminProfile' && (
          <AdminProfile 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
            onEditProfile={(profile) => setSelectedProfile(profile)}
          />
        )}
        {currentPage === 'adminDetail' && (
          <AdminDetail 
            onBack={() => { setSelectedProfile(null); setCurrentPage('adminProfile'); }} 
            onNavigate={(page) => { setSelectedProfile(null); setCurrentPage(page); }} 
            adminData={selectedProfile} 
          />
        )}
        {currentPage === 'addManager' && (
          <AddManager 
            onBack={() => { setSelectedProfile(null); setCurrentPage('adminProfile'); }} 
            onNavigate={(page) => { setSelectedProfile(null); setCurrentPage(page); }} 
            editData={selectedProfile} 
          />
        )}
        {currentPage === 'addCollector' && (
          <AddCollector 
            onBack={() => { setSelectedProfile(null); setCurrentPage('adminProfile'); }} 
            onNavigate={(page) => { setSelectedProfile(null); setCurrentPage(page); }} 
            editData={selectedProfile} 
          />
        )}
        {currentPage === 'overdue' && (
          <Overdue onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'documentViewer' && (
          <DocumentViewer 
            onBack={() => setCurrentPage('adminProfile')} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'adminApprovals' && (
          <AdminApprovalNotifications 
            onBack={() => setCurrentPage('adminProfile')} 
            onNavigate={setCurrentPage} 
          />
        )}

        <SideMenuDrawer 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={(page) => { 
            if (page === 'login') {
              // Clear session storage values
              localStorage.removeItem('userRole');
              localStorage.removeItem('userData');
              localStorage.removeItem('allowedProperties');
              
              // Shift App level step back to login screen
              setCurrentStep('login');
              setCurrentPage('home');
            } else {
              setCurrentPage(page); 
            }
            setIsMenuOpen(false); 
          }} 
        />
      </div>
    );
  }

  // Fallback view to completely prevent white/blank screens
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