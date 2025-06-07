import { useState } from 'react'
import './App.css'

function App() {
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!description.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:8000/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: description })
      })
      if (!response.ok) {
        throw new Error('Failed to generate story')
      }
      const data = await response.json()
      setStory(data.story)
    } catch (err) {
      setError('Error generating story. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>My Story Buddy</h1>
      <p>Tell me what kind of story you want, and I'll create it for you!</p>
      <textarea
        className="story-input"
        rows={5}
        placeholder="Describe your dream story (e.g., A bedtime story about a brave rabbit)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={loading}
      />
      <br />
      <button onClick={handleGenerate} disabled={loading || !description.trim()}>
        {loading ? 'Creating your story...' : 'Generate Story'}
      </button>
      {error && <p className="error">{error}</p>}
      {story && (
        <div className="story-output">
          <h2>Your Story</h2>
          <pre>{story}</pre>
        </div>
      )}
    </div>
  )
}

export default App
