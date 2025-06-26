import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import './MyStories.css';

const MyStories = ({ onStorySelect, onBack, onNewStoriesCountChange }) => {
  const { token } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStoriesCount, setNewStoriesCount] = useState(0);

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8003'
    : '/api';

  useEffect(() => {
    fetchMyStories();
  }, []);

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/my-stories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      setStories(data.stories || []);
      setNewStoriesCount(data.new_stories_count || 0);
      
      // Update parent component's new stories count
      if (onNewStoriesCountChange) {
        onNewStoriesCountChange(data.new_stories_count || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const markStoryAsViewed = async (storyId) => {
    try {
      const response = await fetch(`${API_URL}/story/${storyId}/viewed`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Story marked as viewed:', storyId);
        // Update local state to reflect the change
        setStories(prevStories => 
          prevStories.map(story => 
            story.id === storyId 
              ? { ...story, status: 'VIEWED' }
              : story
          )
        );
        // Update new stories count
        const newCount = Math.max(0, newStoriesCount - 1);
        setNewStoriesCount(newCount);
        
        // Update parent component's new stories count
        if (onNewStoriesCountChange) {
          onNewStoriesCountChange(newCount);
        }
      }
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  };

  const handleStoryClick = async (story) => {
    // Mark story as viewed if it's NEW
    if (story.status === 'NEW') {
      await markStoryAsViewed(story.id);
    }
    
    // Only allow viewing completed stories
    if (story.status === 'IN_PROGRESS') {
      // For in-progress stories, just show a message
      alert('This story is still being generated. Please wait a few moments and refresh the page.');
      return;
    }
    
    onStorySelect(story);
  };

  const getStatusIndicator = (story) => {
    switch (story.status) {
      case 'IN_PROGRESS':
        return (
          <div className="status-indicator in-progress">
            <div className="status-spinner"></div>
            <span>Generating...</span>
          </div>
        );
      case 'NEW':
        return (
          <div className="status-indicator new">
            <span className="new-badge">NEW!</span>
          </div>
        );
      case 'VIEWED':
        return null; // No indicator for viewed stories
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="my-stories-container">
        <div className="my-stories-header">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="my-stories-title">My Stories</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-stories-container">
        <div className="my-stories-header">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="my-stories-title">My Stories</h1>
        </div>
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button className="retry-button" onClick={fetchMyStories}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-stories-container">
      <div className="my-stories-header">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="my-stories-title">My Stories</h1>
      </div>

      {stories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h2>No stories yet</h2>
          <p>Create your first story to see it here!</p>
          <button className="create-story-button" onClick={onBack}>
            Create Story
          </button>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className={`story-card ${story.status ? story.status.toLowerCase() : ''}`}
              onClick={() => handleStoryClick(story)}
            >
              <div className="story-card-header">
                <h3 className="story-title">{story.title}</h3>
                <div className="story-header-right">
                  <span className="story-date">{formatDate(story.created_at)}</span>
                  {getStatusIndicator(story)}
                </div>
              </div>
              
              <div className="story-preview">
                <p className="story-prompt">
                  <strong>Prompt:</strong> {story.prompt}
                </p>
                {story.status === 'IN_PROGRESS' ? (
                  <p className="story-excerpt generating">
                    Your magical story is being created... ✨
                  </p>
                ) : (
                  <p className="story-excerpt">
                    {story.story_content.substring(0, 150)}
                    {story.story_content.length > 150 ? '...' : ''}
                  </p>
                )}
              </div>

              <div className="story-formats">
                {story.formats && story.formats.map((format, index) => (
                  <span key={index} className="format-tag">
                    {format === 'Comic Book' ? '📚' : 
                     format === 'Text Story' ? '📄' : 
                     format === 'Animated Video' ? '🎬' : 
                     format === 'Audio Story' ? '🎧' : '📖'}
                    {format}
                  </span>
                ))}
              </div>

              <div className="story-card-footer">
                <div className="story-stats">
                  {story.image_urls && story.image_urls.length > 0 && (
                    <span className="image-count">
                      🖼️ {story.image_urls.length} images
                    </span>
                  )}
                </div>
                <div className="story-actions">
                  <span className="view-story-hint">Click to view</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStories;