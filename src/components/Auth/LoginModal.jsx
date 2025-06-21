import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToOTP }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      onClose();
      setEmail('');
      setPassword('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Welcome Back! 👋</h2>
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
            <div className="auth-form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or</span>
          </div>
          
          <button 
            className="auth-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          <button 
            className="auth-otp-btn"
            onClick={onSwitchToOTP}
            disabled={loading}
          >
            🔢 Sign in with Email Code
          </button>
        </div>
        
        <div className="auth-modal-footer">
          <p>
            Don't have an account? 
            <button 
              className="auth-link-btn" 
              onClick={onSwitchToSignup}
              disabled={loading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;