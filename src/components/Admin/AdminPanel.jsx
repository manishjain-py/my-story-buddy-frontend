import React, { useState, useRef } from 'react'
import { useAuth } from '../Auth/AuthContext'
import './AdminPanel.css'

const AdminPanel = ({ onBack }) => {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    story_content: '',
    prompt: '',
    category: 'Adventure',
    age_group: '3-5',
    featured: false,
    tags: ['adventure', 'brave', 'journey']
  })
  
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  
  const fileInputRef = useRef(null)
  
  const API_URL = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' 
      ? 'http://127.0.0.1:8003'
      : '/api'
  );
  
  const categories = ['Adventure', 'Friendship', 'Magic', 'Animals', 'Learning', 'Fantasy', 'Family', 'Courage', 'Discovery']
  
  const tagOptions = {
    'Adventure': ['adventure', 'brave', 'journey', 'explore', 'quest'],
    'Friendship': ['friendship', 'kindness', 'sharing', 'caring', 'together'],
    'Magic': ['magic', 'wonder', 'fantasy', 'magical', 'enchanting'],
    'Animals': ['animals', 'nature', 'cute', 'wildlife', 'pets'],
    'Learning': ['learning', 'discovery', 'growth', 'education', 'knowledge'],
    'Fantasy': ['fantasy', 'magical', 'imagination', 'dreams', 'wonder'],
    'Family': ['family', 'love', 'together', 'home', 'caring'],
    'Courage': ['courage', 'brave', 'hero', 'strong', 'fearless'],
    'Discovery': ['discovery', 'explore', 'find', 'adventure', 'new']
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-update tags when category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        tags: tagOptions[value] || []
      }))
    }
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            sequence: images.length + 1,
            uploaded: false,
            url: null
          }
          setImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const moveImage = (imageId, direction) => {
    setImages(prev => {
      const newImages = [...prev]
      const index = newImages.findIndex(img => img.id === imageId)
      
      if (direction === 'up' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      }
      
      // Update sequence numbers
      return newImages.map((img, idx) => ({ ...img, sequence: idx + 1 }))
    })
  }

  const uploadImages = async () => {
    setUploading(true)
    setError('')
    
    try {
      const uploadedImages = []
      
      for (const image of images) {
        if (!image.uploaded) {
          const formData = new FormData()
          formData.append('image', image.file)
          formData.append('story_id', 'admin_upload_' + Date.now())
          
          const response = await fetch(`${API_URL}/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${image.file.name}`)
          }
          
          const result = await response.json()
          uploadedImages.push(result.image_url)
          
          // Update the image as uploaded
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, uploaded: true, url: result.image_url }
              : img
          ))
        } else {
          uploadedImages.push(image.url)
        }
      }
      
      return uploadedImages
    } catch (err) {
      setError(`Image upload failed: ${err.message}`)
      return null
    } finally {
      setUploading(false)
    }
  }

  const createStory = async () => {
    setCreating(true)
    setError('')
    setSuccess('')
    
    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.story_content.trim()) {
        throw new Error('Story content is required')
      }
      if (images.length === 0) {
        throw new Error('At least one image is required')
      }
      
      // Upload images first
      const imageUrls = await uploadImages()
      if (!imageUrls) {
        return // Error already set in uploadImages
      }
      
      // Create the story
      const storyData = {
        ...formData,
        image_urls: imageUrls,
        formats: ['Text Story', 'Comic Book']
      }
      
      const response = await fetch(`${API_URL}/admin/create-public-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create story')
      }
      
      const result = await response.json()
      setSuccess(`Story "${formData.title}" created successfully!`)
      
      // Reset form
      setFormData({
        title: '',
        story_content: '',
        prompt: '',
        category: 'Adventure',
        age_group: '3-5',
        featured: false,
        tags: ['adventure', 'brave', 'journey']
      })
      setImages([])
      
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleTagChange = (tag, checked) => {
    setFormData(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }))
  }

  if (previewMode) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>Story Preview</h2>
          <div className="admin-actions">
            <button className="back-btn" onClick={() => setPreviewMode(false)}>
              ← Back to Edit
            </button>
          </div>
        </div>
        
        <div className="story-preview">
          <div className="preview-header">
            <h3>{formData.title}</h3>
            <div className="preview-meta">
              <span className={`category-tag ${formData.category.toLowerCase()}`}>
                {formData.category}
              </span>
              <span className="age-tag">{formData.age_group}</span>
              {formData.featured && <span className="featured-tag">⭐ Featured</span>}
            </div>
          </div>
          
          <div className="preview-content">
            <div className="story-text">
              {formData.story_content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {images.length > 0 && (
              <div className="preview-images">
                <h4>Comic Images ({images.length} panels)</h4>
                <div className="image-grid">
                  {images.map((image, index) => (
                    <div key={image.id} className="preview-image">
                      <img src={image.preview} alt={`Panel ${index + 1}`} />
                      <span className="panel-number">Panel {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="preview-tags">
              <h4>Tags:</h4>
              <div className="tag-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="preview-actions">
            <button 
              className="create-btn"
              onClick={createStory}
              disabled={creating}
            >
              {creating ? 'Creating Story...' : 'Create Public Story'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Create Public Story</h2>
        <div className="admin-actions">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>

      {error && (
        <div className="alert error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      <div className="admin-form">
        {/* Basic Story Info */}
        <div className="form-section">
          <h3>Story Details</h3>
          
          <div className="form-group">
            <label htmlFor="title">Story Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter story title"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prompt">Story Prompt</label>
            <input
              type="text"
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Original prompt or inspiration"
            />
          </div>

          <div className="form-group">
            <label htmlFor="story_content">Story Content *</label>
            <textarea
              id="story_content"
              value={formData.story_content}
              onChange={(e) => handleInputChange('story_content', e.target.value)}
              placeholder="Write your story here..."
              rows="12"
            />
            <div className="char-count">
              {formData.story_content.length} characters
            </div>
          </div>
        </div>

        {/* Story Metadata */}
        <div className="form-section">
          <h3>Story Metadata</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="age_group">Age Group</label>
              <select
                id="age_group"
                value={formData.age_group}
                onChange={(e) => handleInputChange('age_group', e.target.value)}
              >
                <option value="3-5">3-5 years</option>
                <option value="5-7">5-7 years</option>
                <option value="7-9">7-9 years</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
              />
              <span className="checkmark"></span>
              Featured Story
            </label>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-selection">
              {tagOptions[formData.category]?.map(tag => (
                <label key={tag} className="tag-option">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={(e) => handleTagChange(tag, e.target.checked)}
                  />
                  <span className="tag-label">#{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-section">
          <h3>Story Images</h3>
          
          <div className="upload-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '📁 Add Images'}
            </button>
            
            <p className="upload-hint">
              Upload images for your story comic panels. You can reorder them below.
            </p>
          </div>

          {images.length > 0 && (
            <div className="image-list">
              <h4>Comic Panels ({images.length})</h4>
              {images.map((image, index) => (
                <div key={image.id} className="image-item">
                  <div className="image-preview">
                    <img src={image.preview} alt={`Panel ${index + 1}`} />
                  </div>
                  
                  <div className="image-info">
                    <div className="image-meta">
                      <span className="panel-number">Panel {index + 1}</span>
                      <span className="file-name">{image.file.name}</span>
                      {image.uploaded && <span className="upload-status">✅ Uploaded</span>}
                    </div>
                    
                    <div className="image-controls">
                      <button
                        className="move-btn"
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="move-btn"
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === images.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeImage(image.id)}
                        title="Remove image"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button 
            className="preview-btn"
            onClick={() => setPreviewMode(true)}
            disabled={!formData.title || !formData.story_content}
          >
            👁️ Preview Story
          </button>
          
          <button 
            className="create-btn"
            onClick={createStory}
            disabled={creating || !formData.title || !formData.story_content || images.length === 0}
          >
            {creating ? 'Creating...' : '✨ Create Public Story'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel