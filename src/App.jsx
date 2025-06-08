import { useState } from 'react'
import './App.css'

function App() {
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Sending request with prompt:', description);
      const response = await fetch('https://os5rm4hff4.execute-api.us-west-2.amazonaws.com/default/generateStory', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5173'
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
      
      if (data.title && data.story) {
        setTitle(data.title)
        setStory(data.story)
        console.log('State updated - Title:', data.title);
        console.log('State updated - Story:', data.story);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: missing title or story')
      }
    } catch (err) {
      setError(`Error generating story: ${err.message}`)
      console.error('Detailed error:', err)
      setTitle('')
      setStory('')
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
        <div className="story-output">
          <div className="story-title-container">
            <h2 className="story-title">{title}</h2>
          </div>
          <pre>{formatStory(story)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
