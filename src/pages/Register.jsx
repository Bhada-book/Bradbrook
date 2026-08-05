import React, { useState } from 'react';
import { db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';
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

  // State to track error messages for each field
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict mobile and pinCode to numbers only
    let processedValue = value;
    if (name === 'mobile') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pinCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : processedValue,
    });

    // Clear error message when user starts typing/selecting
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validate fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid e-mail address';
    }

    if (!formData.town.trim()) newErrors.town = 'Town is required';
    if (!formData.state) newErrors.state = 'Please select a state';
    if (!formData.city) newErrors.city = 'Please select a city';

    if (!formData.pinCode) {
      newErrors.pinCode = 'Pin code is required';
    } else if (formData.pinCode.length !== 6) {
      newErrors.pinCode = 'Pin code must be exactly 6 digits';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Please agree to the Terms & Conditions';
    }

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Save user data to Firestore database
      await setDoc(doc(db, 'users', formData.mobile), {
        name: formData.name,
        surname: formData.surname,
        mobile: formData.mobile,
        email: formData.email,
        town: formData.town,
        state: formData.state,
        city: formData.city,
        pinCode: formData.pinCode,
        createdAt: new Date()
      });

      // Success
      onRegisterSuccess();
    } catch (error) {
      console.error('Error saving user data: ', error);
      alert('Registration failed. Please try again.');
    }
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

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {/* Name */}
          <div className="input-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Name *" 
              value={formData.name} 
              onChange={handleChange} 
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Surname */}
          <div className="input-group">
            <input 
              type="text" 
              name="surname" 
              placeholder="Surname *" 
              value={formData.surname} 
              onChange={handleChange} 
            />
            {errors.surname && <span className="error-text">{errors.surname}</span>}
          </div>

          {/* Mobile Number */}
          <div className="input-group">
            <input 
              type="tel" 
              name="mobile" 
              placeholder="Mobile Number *" 
              value={formData.mobile} 
              onChange={handleChange} 
              maxLength={10} 
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <input 
              type="email" 
              name="email" 
              placeholder="E-mail *" 
              value={formData.email} 
              onChange={handleChange} 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Town */}
          <div className="input-group">
            <input 
              type="text" 
              name="town" 
              placeholder="Town *" 
              value={formData.town} 
              onChange={handleChange} 
            />
            {errors.town && <span className="error-text">{errors.town}</span>}
          </div>

          {/* State */}
          <div className="input-group select-group">
            <select name="state" value={formData.state} onChange={handleChange}>
              <option value="" disabled>State *</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
            </select>
            {errors.state && <span className="error-text">{errors.state}</span>}
          </div>

          {/* City */}
          <div className="input-group select-group">
            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="" disabled>City *</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          {/* Pin Code */}
          <div className="input-group">
            <input 
              type="text" 
              name="pinCode" 
              placeholder="Pin Code *" 
              value={formData.pinCode} 
              onChange={handleChange} 
              maxLength={6} 
            />
            {errors.pinCode && <span className="error-text">{errors.pinCode}</span>}
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
                I agree Bhada Book <strong>Terms & Conditions</strong> *
              </span>
            </label>
            {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
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