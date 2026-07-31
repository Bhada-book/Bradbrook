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

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); 
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Home 
            onNavigate={setCurrentPage} 
            onOpenMenu={() => setIsMenuOpen(true)} 
          />
        )}
        {currentPage === 'building' && (
          <BuildingDetails 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'property' && (
          <PropertyDetails 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'tenant' && (
          <TenantInformation 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'history' && (
          <TenantHistory 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'tenantList' && (
          <TenantList 
            onBack={() => setCurrentPage('home')} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'unitLedger' && (
  <UnitLedger 
    onBack={() => setCurrentPage('tenantList')} 
    onNavigate={setCurrentPage} 
  />
)}
{currentPage === 'tenantProfile' && (
  <TenantProfile 
    onBack={() => setCurrentPage('tenantList')} 
    onNavigate={setCurrentPage} 
  />
)}
{currentPage === 'notifications' && (
  <Notifications 
    onBack={() => setCurrentPage('home')} 
    onNavigate={setCurrentPage} 
  />
)}
{currentPage === 'adminProfile' && (
  <AdminProfile 
    onBack={() => setCurrentPage('home')} 
    onNavigate={setCurrentPage} 
  />
)}
        {/* --- GLOBAL SIDE MENU DRAWER --- */}
        <SideMenuDrawer 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={(page) => {
            setCurrentPage(page);
            setIsMenuOpen(false);
          }} 
        />
      </div>
    );
  }

  return null;
}

export default App;