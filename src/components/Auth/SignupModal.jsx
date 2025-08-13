import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/(?=.*[a-z])/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[!@#$%^&*])/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    return { strength, checks };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    const result = await signup(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );
    
    if (result.success) {
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };


  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Join My Story Buddy! 🎉</h2>
          <button className="auth-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="auth-modal-content">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label htmlFor="signup-firstName">First Name</label>
                <input
                  id="signup-firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor="signup-lastName">Last Name</label>
                <input
                  id="signup-lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="password-input-container">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="password-requirements">
                  <div className="password-strength">
                    <div className="password-strength-bar">
                      <div 
                        className={`password-strength-fill strength-${getPasswordStrength().strength}`}
                        style={{ width: `${(getPasswordStrength().strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="password-strength-text">
                      {getPasswordStrength().strength < 3 ? 'Weak' : 
                       getPasswordStrength().strength < 4 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  <div className="password-checklist">
                    <div className={`password-check ${getPasswordStrength().checks.length ? 'valid' : ''}`}>
                      ✓ At least 8 characters
                    </div>
                    <div className={`password-check ${getPasswordStrength().checks.lowercase ? 'valid' : ''}`}>
                      ✓ One lowercase letter
                    </div>
                    <div className={`password-check ${getPasswordStrength().checks.uppercase ? 'valid' : ''}`}>
                      ✓ One uppercase letter
                    </div>
                    <div className={`password-check ${getPasswordStrength().checks.number ? 'valid' : ''}`}>
                      ✓ One number
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="signup-confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  id="signup-confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="auth-helper-text error">Passwords do not match</p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
        </div>
        
        <div className="auth-modal-footer">
          <p>
            Already have an account? 
            <button 
              className="auth-link-btn" 
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;