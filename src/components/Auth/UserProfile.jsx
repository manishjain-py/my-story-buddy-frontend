import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const UserProfile = () => {
  const { user, logout, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const result = await deleteAccount();
      
      if (result.success) {
        // Account deleted successfully, user will be automatically logged out
        alert('Your account has been permanently deleted. All data has been removed and cannot be recovered.');
      } else {
        setDeleteError(result.error || 'Failed to delete account');
        setIsDeleting(false);
      }
    } catch (error) {
      setDeleteError('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleDeleteConfirmation = () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account?\n\n' +
      'This action will:\n' +
      '• Permanently delete all your stories\n' +
      '• Remove your avatar and personalization data\n' +
      '• Delete your account information\n' +
      '• Cannot be undone\n\n' +
      'Click OK to proceed with deletion, or Cancel to keep your account.'
    );
    
    if (confirmed) {
      setShowDeleteConfirm(true);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="user-profile-card">
      <div className="user-profile-header">
        <div className="user-avatar">
          {getInitials(user.first_name, user.last_name)}
        </div>
        <div className="user-details">
          <h4 className="user-name">
            {user.first_name} {user.last_name}
          </h4>
          <p className="user-email">{user.email}</p>
        </div>
      </div>
      <div className="user-profile-actions">
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
        
        <button className="delete-account-btn" onClick={handleDeleteConfirmation} disabled={isDeleting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>

      {deleteError && (
        <div className="delete-error-message">
          <p>{deleteError}</p>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Final Confirmation</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteConfirm(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p><strong>You are about to permanently delete your MyStoryBuddy account.</strong></p>
              <p>This will immediately and permanently remove:</p>
              <ul>
                <li>All your generated stories</li>
                <li>Your avatar and personalization settings</li>
                <li>Your account profile and login information</li>
                <li>All associated data</li>
              </ul>
              <p><strong>This action cannot be undone.</strong></p>
              <p>Are you absolutely sure you want to proceed?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-delete-btn" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel - Keep My Account
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting Account...' : 'Yes, Delete My Account Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;