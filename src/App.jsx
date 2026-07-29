import React, { useState } from 'react';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); 
  // 'welcome' -> 'login' -> 'register' -> 'dashboard'

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

  // Render the Home/Dashboard screen after login/registration success
  return <Home />;
}

export default App;