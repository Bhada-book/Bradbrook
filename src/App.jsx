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

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); 
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
        <SideMenuDrawer 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={(page) => { setCurrentPage(page); setIsMenuOpen(false); }} 
        />
      </div>
    );
  }

  return null;
}

export default App;