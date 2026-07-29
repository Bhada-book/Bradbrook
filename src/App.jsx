import React, { useState } from 'react';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import BuildingDetails from './pages/BuildingDetails';
import PropertyDetails from './pages/PropertyDetails';
import TenantInformation from './pages/TenantInformation';
import Home from './pages/Home';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); 
  const [currentPage, setCurrentPage] = useState('home');

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
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
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
      </div>
    );
  }

  return null;
}

export default App;