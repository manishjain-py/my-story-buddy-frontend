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

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8003'
    : 'https://e23mdrxxzglqosvp4maifljwky0mxabd.lambda-url.us-west-2.on.aws';

  // Rotate through fun facts while loading
  useEffect(() => {
    let interval;
    if (showFunFactsModal && funFacts.length > 0) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
      }, 3500); // Change fact every 3.5 seconds
    }
    return () => clearInterval(interval);
  }, [showFunFactsModal, funFacts]);

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
        body: JSON.stringify({ prompt: description })
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
    <div className="container">
      <h1>✨ My Story Buddy - Where Magic Happens! ✨</h1>
      <p>Tell me what kind of story you want, and I'll create a magical tale just for you! 🌟</p>
      <p className="subtitle">Or just click the button for a surprise story! 🎁</p>
      <textarea
        className="story-input"
        rows={3}
        placeholder="What kind of story would you like? (e.g., A story about a friendly dragon who loves to dance)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={loading}
      />
      <br />
      <button 
        onClick={handleGenerate} 
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? '✨ Creating your magical story... ✨' : '🎨 Generate Story 🎨'}
      </button>
      {error && <p className="error">❌ {error}</p>}
      {story && (
        <div className="story-ready-container">
          <h2 className="story-ready-title">🎉 Your Story is Ready! 🎉</h2>
          <h3 className="story-title-display">✨ {title} ✨</h3>
          <p className="format-instruction">Choose how you'd like to experience your adventure:</p>
          
          <div className="format-buttons">
            <button 
              className="format-button text-format"
              onClick={() => {
                setShowTextModal(true);
                setCurrentComicPage(0);
              }}
            >
              📖 Read as Text
              <span className="format-description">Read the full story</span>
            </button>
            
            <button 
              className="format-button comic-format"
              onClick={() => {
                setShowComicModal(true);
                setCurrentComicPage(0);
              }}
              disabled={imageUrls.length === 0}
            >
              🎨 View as Comic
              <span className="format-description">Explore the illustrated adventure</span>
            </button>
          </div>
          
          {imageUrls.length === 0 && (
            <p className="comic-loading">Comic illustrations are still being created...</p>
          )}
        </div>
      )}

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
              <h2 className="modal-story-title">🎨 {title}</h2>
              <span className="page-indicator">
                Page {currentComicPage + 1} of {imageUrls.length}
              </span>
              <button className="close-button" onClick={() => setShowComicModal(false)}>✕</button>
            </div>
            <div className="comic-content">
              <div className="comic-image-container">
                <img 
                  src={imageUrls[currentComicPage]} 
                  alt={`${title} - Page ${currentComicPage + 1}`}
                  className="comic-image"
                />
                <div className="comic-page-title">
                  {currentComicPage === 0 && "🌟 Part 1: The Beginning"}
                  {currentComicPage === 1 && "🚀 Part 2: The Adventure"}
                  {currentComicPage === 2 && "⚡ Part 3: The Challenge"}
                  {currentComicPage === 3 && "🎉 Part 4: The Resolution"}
                </div>
              </div>
              
              <div className="comic-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={() => setCurrentComicPage(Math.max(0, currentComicPage - 1))}
                  disabled={currentComicPage === 0}
                >
                  ← Previous
                </button>
                
                <div className="page-dots">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      className={`page-dot ${index === currentComicPage ? 'active' : ''}`}
                      onClick={() => setCurrentComicPage(index)}
                    >
                    </button>
                  ))}
                </div>
                
                <button 
                  className="nav-button next-button"
                  onClick={() => setCurrentComicPage(Math.min(imageUrls.length - 1, currentComicPage + 1))}
                  disabled={currentComicPage === imageUrls.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
