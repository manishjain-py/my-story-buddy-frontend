import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const OTPModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: email input, 2: OTP input
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const { sendOTP, verifyOTP } = useAuth();

  if (!isOpen) return null;

  // Timer for OTP expiration
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await sendOTP(email);
    
    if (result.success) {
      setStep(2);
      setTimeLeft(300); // 5 minutes
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      onClose();
      setStep(1);
      setEmail('');
      setOtp('');
      setTimeLeft(0);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setOtp('');

    const result = await sendOTP(email);
    
    if (result.success) {
      setTimeLeft(300);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setError('');
    setTimeLeft(0);
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>
            {step === 1 ? 'Sign in with Code 🔢' : 'Enter Verification Code 📧'}
          </h2>
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
          
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="otp-email">Email Address</label>
                <input
                  id="otp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                <p className="auth-helper-text">
                  We'll send you a 6-digit code to sign in
                </p>
              </div>
              
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Send Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="otp-code">Verification Code</label>
                <input
                  id="otp-code"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                  disabled={loading}
                  className="otp-input"
                />
                <p className="auth-helper-text">
                  Code sent to {email}
                  {timeLeft > 0 && (
                    <span className="otp-timer">
                      {' '}• Expires in {formatTime(timeLeft)}
                    </span>
                  )}
                </p>
              </div>
              
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <div className="otp-actions">
                <button 
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Change Email
                </button>
                
                {timeLeft === 0 && (
                  <button 
                    type="button"
                    className="auth-link-btn"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        
        <div className="auth-modal-footer">
          <p>
            Prefer password login? 
            <button 
              className="auth-link-btn" 
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Sign in with password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;