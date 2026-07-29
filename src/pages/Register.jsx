import React, { useState } from 'react';
import './Register.css';

export default function Register({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    town: '',
    state: '',
    city: '',
    pinCode: '',
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Please agree to the Terms & Conditions');
      return;
    }
    onRegisterSuccess();
  };

  return (
    <div className="register-page-container">
      {/* Top Rounded Red Header Card */}
      <div className="register-header-card">

      
          <div className="badge-content">
          <img src="/images/logot.png" style={{ height: '120px' }} alt="Logo Text" />
          </div>
   
      </div>

      {/* Bottom Form Section */}
      <div className="register-form-section">
        <h2 className="form-title">Create a new account</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="text" 
              name="surname" 
              placeholder="Surname" 
              value={formData.surname} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="tel" 
              name="mobile" 
              placeholder="Mobile Number" 
              value={formData.mobile} 
              onChange={handleChange} 
              maxLength={10} 
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="email" 
              name="email" 
              placeholder="E-mail" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type="text" 
              name="town" 
              placeholder="Town" 
              value={formData.town} 
              onChange={handleChange} 
            />
          </div>

          <div className="input-group select-group">
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="" disabled>State</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>

          <div className="input-group select-group">
            <select name="city" value={formData.city} onChange={handleChange} required>
              <option value="" disabled>City</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              name="pinCode" 
              placeholder="Pin Code" 
              value={formData.pinCode} 
              onChange={handleChange} 
              maxLength={6} 
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="terms-container">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeTerms" 
                checked={formData.agreeTerms} 
                onChange={handleChange} 
              />
              <span className="terms-text">
                I agree Bhada Book <strong>Terms & Conditions</strong>
              </span>
            </label>
          </div>

          {/* Register Button */}
<button type="submit" className="register-submit-btn">
    Register
  </button>
        </form>

        <div className="login-redirect-footer">
          Already have an account?{' '}
          <span className="login-link" onClick={onBackToLogin}>
            Log In
          </span>
        </div>
      </div>
    </div>
  );
}