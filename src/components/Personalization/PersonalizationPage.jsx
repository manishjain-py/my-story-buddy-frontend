import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import './PersonalizationPage.css';

function PersonalizationPage({ onBack, onAvatarViewed }) {
  const { token } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [avatarName, setAvatarName] = useState('');
  const [traitsDescription, setTraitsDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' 
      ? 'http://127.0.0.1:8003'
      : '/api'
  );

  // Fetch existing avatar on component mount
  useEffect(() => {
    fetchAvatar();
  }, []);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && showAvatarModal) {
        setShowAvatarModal(false);
      }
    };

    if (showAvatarModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showAvatarModal]);

  const fetchAvatar = async () => {
    try {
      const response = await fetch(`${API_URL}/personalization/avatar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // No avatar exists, show create form
        setAvatar(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch avatar');
      }

      const data = await response.json();
      setAvatar(data);
      setAvatarName(data.avatar_name);
      setTraitsDescription(data.traits_description);
      // Mark avatar as viewed when it's fetched and displayed
      if (data && onAvatarViewed) {
        onAvatarViewed();
      }
    } catch (err) {
      console.error('Error fetching avatar:', err);
      setError('Failed to load avatar data');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file too large (max 10MB)');
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!avatarName.trim()) {
      setError('Please enter an avatar name');
      return;
    }

    if (!traitsDescription.trim()) {
      setError('Please enter personality traits');
      return;
    }

    if ((!avatar || isCreatingNew) && !selectedImage) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedImage || isCreatingNew) {
        // Create new avatar using async endpoint
        const formData = new FormData();
        formData.append('avatar_name', avatarName.trim());
        formData.append('traits_description', traitsDescription.trim());
        formData.append('image', selectedImage);

        const response = await fetch(`${API_URL}/personalization/avatar/async`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to start avatar generation');
        }

        const data = await response.json();
        setSuccess('Avatar generation started! Check back in a few minutes. You can continue using the app in the meantime.');
        setSelectedImage(null);
        setImagePreview(null);
        
        // Clear the form
        setAvatarName('');
        setTraitsDescription('');
        setIsCreatingNew(false);
        
        // Refresh to check for any existing avatar
        await fetchAvatar();
      } else {
        // Update existing avatar details
        const response = await fetch(`${API_URL}/personalization/avatar`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            avatar_name: avatarName.trim(),
            traits_description: traitsDescription.trim()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to update avatar');
        }

        const data = await response.json();
        setAvatar(data);
        setSuccess('Avatar updated successfully!');
      }

      setIsEditing(false);
      setIsCreatingNew(false);
    } catch (err) {
      console.error('Error submitting avatar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsCreatingNew(false);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreatingNew(false);
    setError('');
    setSuccess('');
    setSelectedImage(null);
    setImagePreview(null);
    
    // Reset form to current avatar data
    if (avatar) {
      setAvatarName(avatar.avatar_name);
      setTraitsDescription(avatar.traits_description);
    }
  };

  const resetForm = () => {
    setAvatarName('');
    setTraitsDescription('');
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="personalization-page">
      <div className="page-header">
        <h2>Personalization</h2>
        <p>Create a comic-style avatar for your stories</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {avatar && !isEditing ? (
        // Display existing avatar
        <div className="avatar-display">
          <div className="avatar-card">
            <img 
              src={avatar.s3_image_url} 
              alt={avatar.avatar_name}
              className="avatar-image clickable"
              onClick={() => setShowAvatarModal(true)}
              title="Click to view full size"
            />
            <div className="avatar-details">
              <h3>{avatar.avatar_name}</h3>
              <p className="avatar-traits">{avatar.traits_description}</p>
              {/* <p className="avatar-created">
                Created: {new Date(avatar.created_at).toLocaleDateString()}
              </p> */}
            </div>
          </div>
          
          <div className="avatar-actions">
            <button 
              className="edit-button"
              onClick={handleEdit}
            >
              Edit Details
            </button>
            <button 
              className="new-avatar-button"
              onClick={() => {
                setIsEditing(true);
                setIsCreatingNew(true);
                resetForm();
              }}
            >
              Create New Avatar
            </button>
          </div>
        </div>
      ) : (
        // Avatar creation/editing form
        <div className="avatar-form">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>{isCreatingNew ? 'Create New Avatar' : avatar ? 'Edit Avatar' : 'Create Your Avatar'}</h3>
              
              {(!avatar || selectedImage || isCreatingNew) && (
                <div className="image-upload-section">
                  <label className="image-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="image-upload-input"
                    />
                    <div className="image-upload-area">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="image-preview"
                        />
                      ) : (
                        <div className="image-upload-placeholder">
                          <span className="upload-icon">📸</span>
                          <span>Click to upload image</span>
                          <span className="upload-hint">Max 10MB • JPG, PNG</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="avatarName">Avatar Name</label>
                <input
                  type="text"
                  id="avatarName"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder="Enter a name for your avatar"
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="traitsDescription">Personality Traits</label>
                <textarea
                  id="traitsDescription"
                  value={traitsDescription}
                  onChange={(e) => setTraitsDescription(e.target.value)}
                  placeholder="Describe 1-2 personality traits (e.g., funny and creative, brave and kind)"
                  rows={3}
                  maxLength={500}
                  required
                />
                <small className="form-hint">
                  These traits will influence how your avatar appears in stories
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {avatar && !selectedImage && !isCreatingNew ? 'Updating...' : 'Creating Avatar...'}
                    </>
                  ) : (
                    avatar && !selectedImage && !isCreatingNew ? 'Update Avatar' : 'Create Avatar'
                  )}
                </button>
                
                {avatar && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="info-section">
        <h4>About Personalized Avatars</h4>
        <ul>
          <li>Upload a photo to create a comic-style avatar</li>
          <li>Your avatar can be featured in future stories</li>
          <li>Personality traits influence how your avatar appears</li>
          <li>Only one avatar per account (you can replace it anytime)</li>
        </ul>
      </div>

      {/* Avatar Full-Screen Modal */}
      {showAvatarModal && avatar && (
        <div className="fullscreen-avatar-viewer">
          {/* Close Button */}
          <button className="avatar-close-btn" onClick={() => setShowAvatarModal(false)}>
            ✕
          </button>
          
          {/* Avatar Details */}
          <div className="avatar-fullscreen-details">
            <h2>{avatar.avatar_name}</h2>
            <p>{avatar.traits_description}</p>
          </div>
          
          {/* Full Screen Image */}
          <div className="avatar-fullscreen-container">
            <img 
              src={avatar.s3_image_url} 
              alt={avatar.avatar_name}
              className="avatar-fullscreen-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalizationPage;