import React, { useState, useEffect } from 'react';
import './StoryViewer.css';

const StoryViewer = ({ story, onBack, onShowTextModal, onShowComicModal }) => {
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // Preload images when component mounts
  useEffect(() => {
    if (story.image_urls && story.image_urls.length > 0) {
      const preloadImages = () => {
        story.image_urls.forEach((url, index) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Preloaded image ${index + 1}/${story.image_urls.length}: ${url}`);
            setPreloadedImages(prev => new Set([...prev, url]));
          };
          img.onerror = () => {
            console.error(`Failed to preload image ${index + 1}: ${url}`);
          };
          img.src = url;
        });
      };

      const timeoutId = setTimeout(preloadImages, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [story.image_urls]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const showComingSoon = (format) => {
    alert(`${format} feature is coming soon! 🚀\n\nWe're working hard to bring you this amazing format. Stay tuned for updates!`);
  };

  return (
    <div className="story-viewer-container">
      <div className="story-viewer-header">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="story-meta">
          <h1 className="story-viewer-title">{story.title}</h1>
          <p className="story-created-date">Created {formatDate(story.created_at)}</p>
        </div>
      </div>

      <div className="story-viewer-content">
        <div className="story-info-section">
          <div className="story-prompt-card">
            <h3>Original Prompt</h3>
            <p>{story.prompt}</p>
          </div>
        </div>

        <div className="format-selection-section">
          <h2>Choose Your Experience</h2>
          <p className="format-instruction">Select how you'd like to experience this story:</p>
          
          <div className="format-options-grid">
            {story.formats && story.formats.includes('Text Story') && (
              <button 
                className="format-option-card"
                onClick={onShowTextModal}
              >
                <div className="format-icon text-icon">📄</div>
                <div className="format-info">
                  <h4>Text Story</h4>
                  <p>Read the full story</p>
                </div>
                <div className="format-status available">Available</div>
              </button>
            )}
            
            {story.formats && story.formats.includes('Comic Book') && (
              <button 
                className="format-option-card"
                onClick={onShowComicModal}
                disabled={!story.image_urls || story.image_urls.length === 0}
              >
                <div className="format-icon comic-icon">📚</div>
                <div className="format-info">
                  <h4>Comic Book</h4>
                  <p>Explore the illustrated adventure</p>
                  {story.image_urls && story.image_urls.length > 0 && (
                    <span className="image-count">{story.image_urls.length} pages</span>
                  )}
                </div>
                <div className={`format-status ${story.image_urls && story.image_urls.length > 0 ? 'available' : 'loading'}`}>
                  {story.image_urls && story.image_urls.length > 0 ? 'Available' : 'Loading...'}
                </div>
              </button>
            )}
            
            {story.formats && story.formats.includes('Animated Video') && (
              <button 
                className="format-option-card coming-soon"
                onClick={() => showComingSoon('Animated Video')}
              >
                <div className="format-icon video-icon">🎬</div>
                <div className="format-info">
                  <h4>Animated Video</h4>
                  <p>Watch your story come to life</p>
                </div>
                <div className="format-status coming-soon-badge">Coming Soon</div>
              </button>
            )}
            
            {story.formats && story.formats.includes('Audio Story') && (
              <button 
                className="format-option-card coming-soon"
                onClick={() => showComingSoon('Audio Story')}
              >
                <div className="format-icon audio-icon">🎧</div>
                <div className="format-info">
                  <h4>Audio Story</h4>
                  <p>Listen to your adventure</p>
                </div>
                <div className="format-status coming-soon-badge">Coming Soon</div>
              </button>
            )}
          </div>
        </div>

        {story.formats && story.formats.includes('Comic Book') && (!story.image_urls || story.image_urls.length === 0) && (
          <div className="loading-notice">
            <div className="loading-icon">⏳</div>
            <h3>Comic illustrations are being created...</h3>
            <p>Your comic book version will be available shortly. Try the text version while you wait!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;