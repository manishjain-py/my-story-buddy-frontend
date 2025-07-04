import { useState, useEffect } from 'react'
import './App.css'

// Import authentication components
import { AuthProvider, useAuth } from './components/Auth/AuthContext'
import LoginModal from './components/Auth/LoginModal'
import SignupModal from './components/Auth/SignupModal'
import OTPModal from './components/Auth/OTPModal'
import UserProfile from './components/Auth/UserProfile'

// Import story components
import MyStories from './components/MyStories/MyStories'
import StoryViewer from './components/StoryViewer/StoryViewer'
import PersonalizationPage from './components/Personalization/PersonalizationPage'

function AppContent() {
  const { user, isAuthenticated, token } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
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
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [pendingStoryId, setPendingStoryId] = useState(null) // Track story being generated
  const [pollingInterval, setPollingInterval] = useState(null) // Store polling interval ID
  const [completedAvatarsCount, setCompletedAvatarsCount] = useState(0) // Track completed avatars
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'my-stories', 'story-viewer', 'personalization'
  const [selectedStory, setSelectedStory] = useState(null)
  const [newStoriesCount, setNewStoriesCount] = useState(0)

  const API_URL = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' 
      ? 'http://127.0.0.1:8003'
      : '/api'  // Production backend via CloudFront /api path
  );

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (token) {
      // Handle successful OAuth
      localStorage.setItem('auth_token', token);
      
      // Fetch user data with the token
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(userData => {
        // This will be handled by AuthContext
        window.location.href = '/'; // Redirect to home and let AuthContext handle the rest
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error);
        localStorage.removeItem('auth_token');
        window.location.href = '/';
      });
    } else if (error) {
      console.error('OAuth error:', error);
      // You might want to show an error message to the user
      window.location.href = '/';
    }
  }, [API_URL]);

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
      const container = document.querySelector('.comic-fullscreen-container');
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
    if (currentPage === 'story-viewer') {
      setCurrentPage('my-stories')
      setSelectedStory(null)
    } else if (currentPage === 'my-stories' || currentPage === 'personalization') {
      setCurrentPage('home')
    } else if (story) {
      // Reset to prompt page on home
      setStory('')
      setTitle('')
      setImageUrls([])
      setError('')
    }
  }

  // Navigation handlers
  const handleGoToMyStories = () => {
    setCurrentPage('my-stories')
    setShowHamburgerMenu(false)
  }

  const handleStorySelect = (story) => {
    setSelectedStory(story)
    setCurrentPage('story-viewer')
  }

  const handleGoHome = () => {
    setCurrentPage('home')
    setShowHamburgerMenu(false)
  }

  const handleGoToPersonalization = () => {
    setCurrentPage('personalization')
    setShowHamburgerMenu(false)
    // Clear completed avatars count when visiting personalization page
    setCompletedAvatarsCount(0)
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

  // Function to poll story status
  const pollStoryStatus = async (storyId) => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/story/${storyId}/status`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        console.error('Failed to check story status:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('Story status check:', data);
      
      if (data.status === 'NEW') {
        // Story is complete!
        console.log('Story completed:', data);
        setTitle(data.title);
        setStory(data.story);
        setImageUrls(data.image_urls || []);
        setShowFunFactsModal(false);
        setLoading(false);
        setPendingStoryId(null);
        
        // Ensure we stay on the home page to show the generated story
        setCurrentPage('home');
        
        return true; // Story completed
      }
      
      return false; // Story still in progress
    } catch (error) {
      console.error('Error polling story status:', error);
      return null;
    }
  };

  // Function to start polling for story completion
  const startPolling = (storyId) => {
    console.log('Starting polling for story:', storyId);
    
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Poll every 3 seconds
    const intervalId = setInterval(async () => {
      const completed = await pollStoryStatus(storyId);
      if (completed === true) {
        // Story completed, stop polling
        console.log('Story completed, stopping polling');
        clearInterval(intervalId);
        setPollingInterval(null);
        return;
      } else if (completed === null) {
        // Error occurred, stop polling
        console.error('Polling failed, stopping...');
        clearInterval(intervalId);
        setPollingInterval(null);
        setLoading(false);
        setShowFunFactsModal(false);
        setError('Failed to check story status. Please refresh and try again.');
      }
    }, 3000);
    
    setPollingInterval(intervalId);
  };

  // Function to fetch new stories count for notification badge
  const fetchNewStoriesCount = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/my-stories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNewStoriesCount(data.new_stories_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch new stories count:', error);
    }
  };

  // Function to fetch completed avatars count for notification badge
  const fetchCompletedAvatarsCount = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/personalization/completed-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedAvatarsCount(data.completed_avatars_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch completed avatars count:', error);
    }
  };

  // Fetch notification counts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNewStoriesCount();
      fetchCompletedAvatarsCount();
      
      // Set up periodic refresh for notification badges (every 30 seconds)
      const interval = setInterval(() => {
        fetchNewStoriesCount();
        fetchCompletedAvatarsCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Function to fetch fun facts
  const fetchFunFacts = async (prompt) => {
    try {
      console.log('Fetching fun facts for prompt:', prompt);
      
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add authentication header if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/generateFunFacts`, {
        method: 'POST',
        headers,
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
      console.log('Sending async story request with prompt:', description);
      
      // Start fun facts fetch immediately (don't wait for it)
      fetchFunFacts(description);
      
      // Submit the story generation request (async)
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add authentication header if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/generateStory`, {
        method: 'POST',
        headers,
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
        throw new Error(`Failed to submit story request: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json()
      console.log('Story submission response:', data);
      
      if (data.story_id && data.status === 'IN_PROGRESS') {
        // Story submission successful, start polling
        console.log('Story submitted successfully with ID:', data.story_id);
        setPendingStoryId(data.story_id);
        startPolling(data.story_id);
        
        // Update fun facts modal to show generation message
        setShowFunFactsModal(true);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: missing story_id or wrong status')
      }
    } catch (err) {
      setError(`Error submitting story request: ${err.message}`)
      console.error('Detailed error:', err)
      setTitle('')
      setStory('')
      setImageUrls([])
      setPendingStoryId(null)
      setShowFunFactsModal(false)
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
        <button className="hamburger-button" onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="app-title">Storytime</h1>
        <button className="back-button" onClick={handleBack} style={{ opacity: (story || currentPage !== 'home') ? 1 : 0.3 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {currentPage === 'my-stories' ? (
          <MyStories 
            onStorySelect={handleStorySelect}
            onBack={handleBack}
            onNewStoriesCountChange={setNewStoriesCount}
          />
        ) : currentPage === 'personalization' ? (
          <PersonalizationPage 
            onBack={handleBack}
            onAvatarViewed={() => setCompletedAvatarsCount(0)}
          />
        ) : currentPage === 'story-viewer' && selectedStory ? (
          <StoryViewer 
            story={selectedStory}
            onBack={handleBack}
            onShowTextModal={() => {
              setStory(selectedStory.story_content)
              setTitle(selectedStory.title)
              setShowTextModal(true)
            }}
            onShowComicModal={() => {
              setStory(selectedStory.story_content)
              setTitle(selectedStory.title)
              setImageUrls(selectedStory.image_urls || [])
              setShowComicModal(true)
              setCurrentComicPage(0)
            }}
          />
        ) : !story ? (
          <>
            {/* Question Section */}
            <div className="question-section">
              <h2 className="main-question">What do you want to learn today?</h2>
            </div>

            {/* Input Section */}
            <div className="input-section">
              <div className="input-container">
                <textarea
                  className="topic-input"
                  placeholder="Enter your question or topic"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={loading}
                />
                <div className="input-actions">
                  <button className="input-action-btn" title="Attach Image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59722 21.9983 8.005 21.9983C6.41278 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0953 2.00492 15.155 2.00492C16.2147 2.00492 17.2294 2.42944 17.98 3.18C18.7306 3.93056 19.1551 4.94533 19.1551 6.005C19.1551 7.06467 18.7306 8.07944 17.98 8.83L10.25 16.56C9.87473 16.9353 9.36755 17.1444 8.84 17.1444C8.31245 17.1444 7.80527 16.9353 7.43 16.56C7.05473 16.1847 6.84555 15.6776 6.84555 15.15C6.84555 14.6224 7.05473 14.1153 7.43 13.74L15.07 6.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="input-action-btn" title="Record Audio">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12V4C10 2.89543 10.8954 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19 10V12C19 16.4183 15.4183 20 11 20H13C8.58172 20 5 16.4183 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 20V24M8 24H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
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

      {/* Hamburger Menu */}
      {showHamburgerMenu && (
        <div className="hamburger-menu">
          <div className="menu-backdrop" onClick={() => setShowHamburgerMenu(false)}></div>
          <div className="menu-content">
            <div className="menu-header">
              <h3>Menu</h3>
              <button className="menu-close-btn" onClick={() => setShowHamburgerMenu(false)}>
                ✕
              </button>
            </div>
            <div className="menu-items">
              {/* User authentication section */}
              {isAuthenticated ? (
                <div className="menu-auth-section">
                  <UserProfile />
                </div>
              ) : (
                <div className="menu-auth-buttons">
                  <button 
                    className="auth-submit-btn" 
                    onClick={() => {
                      setShowLoginModal(true);
                      setShowHamburgerMenu(false);
                    }}
                  >
                    Sign In
                  </button>
                  <button 
                    className="auth-otp-btn" 
                    onClick={() => {
                      setShowSignupModal(true);
                      setShowHamburgerMenu(false);
                    }}
                  >
                    Create Account
                  </button>
                </div>
              )}
              
              <button 
                className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
                onClick={handleGoHome}
              >
                <span className="menu-icon">🏠</span>
                Home
              </button>
              {isAuthenticated && (
                <>
                  <button 
                    className={`menu-item ${currentPage === 'my-stories' ? 'active' : ''}`}
                    onClick={handleGoToMyStories}
                  >
                    <span className="menu-icon">📖</span>
                    My Stories
                    {newStoriesCount > 0 && (
                      <span className="notification-badge">{newStoriesCount}</span>
                    )}
                  </button>
                  <button 
                    className={`menu-item ${currentPage === 'personalization' ? 'active' : ''}`}
                    onClick={handleGoToPersonalization}
                  >
                    <span className="menu-icon">🎭</span>
                    Personalization
                    {completedAvatarsCount > 0 && (
                      <span className="notification-badge">{completedAvatarsCount}</span>
                    )}
                  </button>
                </>
              )}
              <button className="menu-item">
                <span className="menu-icon">👤</span>
                Profile
              </button>
              <button className="menu-item">
                <span className="menu-icon">⚙️</span>
                Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fun Facts Modal */}
      {showFunFactsModal && (
        <div className="fun-facts-modal">
          <div className="modal-backdrop"></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">💡 Creating your magical story... 💡</h2>
              <p className="modal-subtitle">Meanwhile, here are some fun facts to discover!</p>
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
        <div className="fullscreen-text-viewer">
          {/* Close Button */}
          <button className="text-close-btn" onClick={() => setShowTextModal(false)}>
            ✕
          </button>
          
          {/* Full Screen Text */}
          <div className="text-fullscreen-container">
            <div className="story-text-content">
              {formatStory(story)}
            </div>
          </div>
        </div>
      )}

      {/* Comic Story Modal */}
      {showComicModal && imageUrls.length > 0 && (
        <div className="fullscreen-comic-viewer">
          {/* Close Button */}
          <button className="comic-close-btn" onClick={() => setShowComicModal(false)}>
            ✕
          </button>
          
          {/* Page Indicator */}
          <div className="comic-page-indicator">
            {currentComicPage + 1}/{imageUrls.length}
          </div>
          
          {/* Full Screen Image */}
          <div 
            className="comic-fullscreen-container"
            onClick={() => {
              if (currentComicPage < imageUrls.length - 1) {
                const newPage = currentComicPage + 1;
                if (!preloadedImages.has(imageUrls[newPage])) {
                  setImageLoading(true);
                }
                setCurrentComicPage(newPage);
              }
            }}
            style={{ cursor: currentComicPage < imageUrls.length - 1 ? 'pointer' : 'default' }}
          >
            {imageLoading && (
              <div className="comic-loading-overlay">
                <div className="spinner"></div>
              </div>
            )}
            <img 
              src={imageUrls[currentComicPage]} 
              alt={`${title} - Page ${currentComicPage + 1}`}
              className="comic-fullscreen-image"
              onLoad={() => setImageLoading(false)}
              onLoadStart={() => setImageLoading(true)}
              style={{ opacity: imageLoading ? 0.3 : 1 }}
            />
          </div>
        </div>
      )}

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onSwitchToOTP={() => {
          setShowLoginModal(false);
          setShowOTPModal(true);
        }}
      />
      
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        onSwitchToOTP={() => {
          setShowSignupModal(false);
          setShowOTPModal(true);
        }}
      />
      
      <OTPModal 
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSwitchToLogin={() => {
          setShowOTPModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  )
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
