import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrls, setImageUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [funFacts, setFunFacts] = useState([])
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [showFunFactsModal, setShowFunFactsModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [showComicModal, setShowComicModal] = useState(false)
  const [currentComicPage, setCurrentComicPage] = useState(0)
  const [preloadedImages, setPreloadedImages] = useState(new Set())
  const [imageLoading, setImageLoading] = useState(false)
  const [selectedFormats, setSelectedFormats] = useState(['Comic Book', 'Text Story']) // Default selections

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8003'
    : 'https://e23mdrxxzglqosvp4maifljwky0mxabd.lambda-url.us-west-2.on.aws';

  // Rotate through fun facts while loading
  useEffect(() => {
    let interval;
    if (showFunFactsModal && funFacts.length > 0) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
      }, 5500); // Change fact every 5.5 seconds
    }
    return () => clearInterval(interval);
  }, [showFunFactsModal, funFacts]);

  // Keyboard navigation for comic viewer
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (showComicModal && imageUrls.length > 0) {
        if (event.key === 'ArrowLeft' && currentComicPage > 0) {
          const newPage = currentComicPage - 1;
          if (!preloadedImages.has(imageUrls[newPage])) {
            setImageLoading(true);
          }
          setCurrentComicPage(newPage);
        } else if (event.key === 'ArrowRight' && currentComicPage < imageUrls.length - 1) {
          const newPage = currentComicPage + 1;
          if (!preloadedImages.has(imageUrls[newPage])) {
            setImageLoading(true);
          }
          setCurrentComicPage(newPage);
        } else if (event.key === 'Escape') {
          setShowComicModal(false);
        }
      }
      if (showTextModal && event.key === 'Escape') {
        setShowTextModal(false);
      }
    };

    if (showComicModal || showTextModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showComicModal, showTextModal, currentComicPage, imageUrls.length, preloadedImages]);

  // Reset scroll position when comic page changes
  useEffect(() => {
    if (showComicModal) {
      const container = document.querySelector('.comic-image-container');
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [currentComicPage, showComicModal]);

  // Preload all comic images when modal opens or imageUrls change
  useEffect(() => {
    if (showComicModal && imageUrls.length > 0) {
      const preloadImages = () => {
        const newPreloaded = new Set();
        
        imageUrls.forEach((url, index) => {
          if (!preloadedImages.has(url)) {
            const img = new Image();
            img.onload = () => {
              console.log(`Preloaded image ${index + 1}/${imageUrls.length}: ${url}`);
              newPreloaded.add(url);
              setPreloadedImages(prev => new Set([...prev, url]));
            };
            img.onerror = () => {
              console.error(`Failed to preload image ${index + 1}: ${url}`);
            };
            img.src = url;
          }
        });
      };

      // Start preloading after a short delay to prioritize current image
      const timeoutId = setTimeout(preloadImages, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [showComicModal, imageUrls, preloadedImages]);

  // Priority preload: Load current and next images immediately
  useEffect(() => {
    if (showComicModal && imageUrls.length > 0) {
      const priorityUrls = [
        imageUrls[currentComicPage], // Current image
        imageUrls[currentComicPage + 1], // Next image
        imageUrls[currentComicPage - 1]  // Previous image
      ].filter(Boolean);

      priorityUrls.forEach((url) => {
        if (!preloadedImages.has(url)) {
          const img = new Image();
          img.onload = () => {
            setPreloadedImages(prev => new Set([...prev, url]));
          };
          img.src = url;
        }
      });
    }
  }, [currentComicPage, showComicModal, imageUrls, preloadedImages]);

  // Handle back button
  const handleBack = () => {
    if (story) {
      // Reset to prompt page
      setStory('')
      setTitle('')
      setImageUrls([])
      setError('')
    }
  }

  // Handle format selection
  const toggleFormat = (format) => {
    setSelectedFormats(prev => {
      if (prev.includes(format)) {
        return prev.filter(f => f !== format)
      } else {
        return [...prev, format]
      }
    })
  }

  // Show coming soon modal
  const showComingSoon = (format) => {
    alert(`${format} feature is coming soon! 🚀\n\nWe're working hard to bring you this amazing format. Stay tuned for updates!`)
  }

  // Function to fetch fun facts
  const fetchFunFacts = async (prompt) => {
    try {
      console.log('Fetching fun facts for prompt:', prompt);
      const response = await fetch(`${API_URL}/generateFunFacts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt })
      });
      if (!response.ok) throw new Error('Failed to fetch fun facts');
      const data = await response.json();
      console.log('Fun facts received:', data);
      setFunFacts(data.facts || []);
    } catch (err) {
      console.error('Error fetching fun facts:', err);
      // Add default fun facts if API fails
      setFunFacts([
        {
          question: "Did you know stories can take you anywhere?",
          answer: "Yes! With your imagination, you can visit magical worlds."
        },
        {
          question: "Did you know reading helps your brain grow?",
          answer: "Amazing! Every story makes your mind stronger and smarter."
        }
      ]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setFunFacts([])
    setCurrentFactIndex(0)
    setShowFunFactsModal(true)
    
    try {
      console.log('Sending request with prompt:', description);
      
      // Start fun facts fetch immediately (don't wait for it)
      fetchFunFacts(description);
      
      // Generate the story
      const response = await fetch(`${API_URL}/generateStory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: description,
          formats: selectedFormats 
        })
      })
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        throw new Error(`Failed to generate story: ${response.status} ${response.statusText}`);
      }
      const data = await response.json()
      console.log('Raw API Response:', data);
      console.log('Title from response:', data.title);
      console.log('Story from response:', data.story);
      console.log('Image URLs from response:', data.image_urls);
      
      if (data.title && data.story) {
        setTitle(data.title)
        setStory(data.story)
        setImageUrls(data.image_urls || [])
        console.log('State updated - Title:', data.title);
        console.log('State updated - Story:', data.story);
        console.log('State updated - Image URLs:', data.image_urls);
        
        // Hide the fun facts modal after successful generation
        setShowFunFactsModal(false);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: missing title or story')
      }
    } catch (err) {
      setError(`Error generating story: ${err.message}`)
      console.error('Detailed error:', err)
      setTitle('')
      setStory('')
      setImageUrls([])
      setShowFunFactsModal(false)
    } finally {
      setLoading(false)
    }
  }

  const formatStory = (storyText) => {
    // Split the story into paragraphs
    const paragraphs = storyText.split('\n\n').filter(p => p.trim());
    
    // Format each paragraph
    return paragraphs.map((paragraph, index) => (
      <p key={index}>{paragraph.trim()}</p>
    ));
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <button className="back-button" onClick={handleBack} style={{ opacity: story ? 1 : 0.3 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="app-title">Storytime</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!story ? (
          <>
            {/* Question Section */}
            <div className="question-section">
              <h2 className="main-question">What do you want to learn today?</h2>
            </div>

            {/* Input Section */}
            <div className="input-section">
              <textarea
                className="topic-input"
                placeholder="Enter your question or topic"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="action-btn secondary">
                <span className="btn-icon">📷</span>
                Upload Image
              </button>
              <button className="action-btn secondary">
                <span className="btn-icon">🎤</span>
                Record Audio
              </button>
            </div>

            {/* Generate Button */}
            <button 
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || selectedFormats.length === 0}
            >
              {loading ? 'Creating your story...' : 'Generate Story'}
            </button>

            {error && <p className="error-message">{error}</p>}

            {/* Story Formats Section */}
            <div className="formats-section">
              <h3 className="formats-title">Choose Your Preferred Story Formats</h3>
              <p className="formats-subtitle">Select the formats you'd like to see for your story</p>
              <div className="format-grid">
                <div 
                  className={`format-card ${selectedFormats.includes('Comic Book') ? 'selected' : ''}`}
                  onClick={() => toggleFormat('Comic Book')}
                >
                  <div className="format-icon comic-icon">📚</div>
                  <div className="format-info">
                    <h4>Comic Book</h4>
                  </div>
                  {selectedFormats.includes('Comic Book') && <div className="selection-check">✓</div>}
                </div>
                <div 
                  className={`format-card ${selectedFormats.includes('Text Story') ? 'selected' : ''}`}
                  onClick={() => toggleFormat('Text Story')}
                >
                  <div className="format-icon text-icon">📄</div>
                  <div className="format-info">
                    <h4>Text Story</h4>
                  </div>
                  {selectedFormats.includes('Text Story') && <div className="selection-check">✓</div>}
                </div>
                <div 
                  className={`format-card ${selectedFormats.includes('Animated Video') ? 'selected' : ''}`}
                  onClick={() => toggleFormat('Animated Video')}
                >
                  <div className="format-icon video-icon">🎬</div>
                  <div className="format-info">
                    <h4>Animated Video</h4>
                  </div>
                  {selectedFormats.includes('Animated Video') && <div className="selection-check">✓</div>}
                </div>
                <div 
                  className={`format-card ${selectedFormats.includes('Audio Story') ? 'selected' : ''}`}
                  onClick={() => toggleFormat('Audio Story')}
                >
                  <div className="format-icon audio-icon">🎧</div>
                  <div className="format-info">
                    <h4>Audio Story</h4>
                  </div>
                  {selectedFormats.includes('Audio Story') && <div className="selection-check">✓</div>}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Story Results */
          <div className="story-results">
            <h2 className="story-title">{title}</h2>
            <p className="format-instruction">Choose how you'd like to experience your story:</p>
            
            <div className="result-format-grid">
              {selectedFormats.includes('Text Story') && (
                <button 
                  className="result-format-card"
                  onClick={() => {
                    setShowTextModal(true);
                    setCurrentComicPage(0);
                  }}
                >
                  <div className="format-icon text-icon">📄</div>
                  <div className="format-info">
                    <h4>Text Story</h4>
                    <p>Read the full story</p>
                  </div>
                </button>
              )}
              
              {selectedFormats.includes('Comic Book') && (
                <button 
                  className="result-format-card"
                  onClick={() => {
                    setShowComicModal(true);
                    setCurrentComicPage(0);
                  }}
                  disabled={imageUrls.length === 0}
                >
                  <div className="format-icon comic-icon">📚</div>
                  <div className="format-info">
                    <h4>Comic Book</h4>
                    <p>Explore the illustrated adventure</p>
                  </div>
                </button>
              )}
              
              {selectedFormats.includes('Animated Video') && (
                <button 
                  className="result-format-card"
                  onClick={() => showComingSoon('Animated Video')}
                >
                  <div className="format-icon video-icon">🎬</div>
                  <div className="format-info">
                    <h4>Animated Video</h4>
                    <p>Watch your story come to life</p>
                  </div>
                  <div className="coming-soon-badge">Coming Soon</div>
                </button>
              )}
              
              {selectedFormats.includes('Audio Story') && (
                <button 
                  className="result-format-card"
                  onClick={() => showComingSoon('Audio Story')}
                >
                  <div className="format-icon audio-icon">🎧</div>
                  <div className="format-info">
                    <h4>Audio Story</h4>
                    <p>Listen to your adventure</p>
                  </div>
                  <div className="coming-soon-badge">Coming Soon</div>
                </button>
              )}
            </div>
            
            {selectedFormats.includes('Comic Book') && imageUrls.length === 0 && (
              <p className="comic-loading">Comic illustrations are still being created...</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item active">
          <div className="nav-icon">🏠</div>
          <span>Home</span>
        </button>
        <button className="nav-item">
          <div className="nav-icon">📖</div>
          <span>Stories</span>
        </button>
        <button className="nav-item">
          <div className="nav-icon">👤</div>
          <span>Profile</span>
        </button>
      </div>

      {/* Fun Facts Modal */}
      {showFunFactsModal && (
        <div className="fun-facts-modal">
          <div className="modal-backdrop"></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">✨ Creating your magical story... ✨</h2>
              <p className="modal-subtitle">Meanwhile, here are some fun facts!</p>
            </div>
            
            {funFacts.length > 0 && (
              <div className="fun-fact-display">
                <div className="fun-fact-card" key={currentFactIndex}>
                  <div className="fun-fact-icon">🤔</div>
                  <h3 className="fun-fact-question">Did you know...</h3>
                  <p className="fact-question">{funFacts[currentFactIndex]?.question}</p>
                  <p className="fact-answer">{funFacts[currentFactIndex]?.answer}</p>
                </div>
              </div>
            )}
            
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="loading-text">Crafting your adventure...</p>
            </div>
          </div>
        </div>
      )}

      {/* Text Story Modal */}
      {showTextModal && (
        <div className="story-modal text-story-modal">
          <div className="modal-backdrop" onClick={() => setShowTextModal(false)}></div>
          <div className="story-modal-content">
            <div className="modal-header">
              <h2 className="modal-story-title">📖 {title}</h2>
              <button className="close-button" onClick={() => setShowTextModal(false)}>✕</button>
            </div>
            <div className="text-story-content">
              <div className="story-text-scrollable">
                {formatStory(story)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comic Story Modal */}
      {showComicModal && imageUrls.length > 0 && (
        <div className="story-modal comic-story-modal">
          <div className="modal-backdrop" onClick={() => setShowComicModal(false)}></div>
          <div className="story-modal-content">
            <div className="modal-header">
              <button 
                className="header-nav-button"
                onClick={() => {
                  const newPage = Math.max(0, currentComicPage - 1);
                  if (!preloadedImages.has(imageUrls[newPage])) {
                    setImageLoading(true);
                  }
                  setCurrentComicPage(newPage);
                }}
                disabled={currentComicPage === 0}
                title="Previous page"
              >
                ←
              </button>
              
              <div className="header-title-section">
                <h2 className="modal-story-title">🎨 {title}</h2>
                <span className="page-indicator">({currentComicPage + 1}/{imageUrls.length})</span>
              </div>
              
              <button 
                className="header-nav-button"
                onClick={() => {
                  const newPage = Math.min(imageUrls.length - 1, currentComicPage + 1);
                  if (!preloadedImages.has(imageUrls[newPage])) {
                    setImageLoading(true);
                  }
                  setCurrentComicPage(newPage);
                }}
                disabled={currentComicPage === imageUrls.length - 1}
                title="Next page"
              >
                →
              </button>
              
              <button className="close-button" onClick={() => setShowComicModal(false)}>✕</button>
            </div>
            <div className="comic-content">
              <div className="comic-image-container">
                {imageLoading && (
                  <div className="image-loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading comic page...</p>
                  </div>
                )}
                <img 
                  src={imageUrls[currentComicPage]} 
                  alt={`${title} - Page ${currentComicPage + 1}`}
                  className="comic-image"
                  onLoad={() => setImageLoading(false)}
                  onLoadStart={() => setImageLoading(true)}
                  style={{ opacity: imageLoading ? 0.3 : 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
