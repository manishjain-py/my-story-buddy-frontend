import { useState } from 'react'
import './App.css'

function App() {
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrls, setImageUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8003'
    : 'https://e23mdrxxzglqosvp4maifljwky0mxabd.lambda-url.us-west-2.on.aws';

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Sending request with prompt:', description);
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
        <div className="story-container">
          <h2 className="story-title">✨ {title} ✨</h2>
          <div className="story-text">
            {formatStory(story)}
          </div>
          
          {imageUrls.length > 0 && (
            <div className="story-images">
              <h3 className="images-title">📚 Story Illustrations 📚</h3>
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className="story-image-container">
                  <div className="image-header">
                    <h4 className="image-title">
                      {index === 0 && "🌟 Part 1: The Beginning"}
                      {index === 1 && "🚀 Part 2: The Adventure"}
                      {index === 2 && "⚡ Part 3: The Challenge"}
                      {index === 3 && "🎉 Part 4: The Resolution"}
                    </h4>
                  </div>
                  <img 
                    src={imageUrl} 
                    alt={`${title} - Part ${index + 1}`} 
                    className="story-image"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
