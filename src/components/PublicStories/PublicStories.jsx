import React, { useState, useEffect } from 'react'
import './PublicStories.css'

const PublicStories = ({ onStorySelect, onBack }) => {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  
  const API_URL = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' 
      ? 'http://127.0.0.1:8003'
      : '/api'
  );

  const storiesPerPage = 10

  const fetchPublicStories = async (page = 1, category = '', featuredOnly = false) => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: storiesPerPage.toString()
      })
      
      if (category) {
        params.append('category', category)
      }
      
      if (featuredOnly) {
        params.append('featured_only', 'true')
      }

      const response = await fetch(`${API_URL}/public-stories?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch public stories: ${response.status}`)
      }

      const data = await response.json()
      setStories(data.stories || [])
      setTotalCount(data.total_count || 0)
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Error fetching public stories:', err)
      setError('Failed to load public stories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicStories(currentPage, selectedCategory, showFeaturedOnly)
  }, [currentPage, selectedCategory, showFeaturedOnly])

  const handleStoryClick = (story) => {
    // Add source information for proper navigation
    const storyWithSource = {
      ...story,
      source: 'public'
    }
    onStorySelect(storyWithSource)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleFeaturedToggle = () => {
    setShowFeaturedOnly(!showFeaturedOnly)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const totalPages = Math.ceil(totalCount / storiesPerPage)

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="public-stories">
      <div className="public-stories-header">
        <h2>Public Stories</h2>
        <p>Discover amazing stories created for everyone to enjoy!</p>
        
        {/* Filters */}
        <div className="public-stories-filters">
          <div className="filter-group">
            <label htmlFor="category-select">Category:</label>
            <select 
              id="category-select"
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="featured-toggle">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={handleFeaturedToggle}
              />
              Featured Stories Only
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading public stories...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-btn" 
            onClick={() => fetchPublicStories(currentPage, selectedCategory, showFeaturedOnly)}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && stories.length === 0 && (
        <div className="no-stories-container">
          <div className="no-stories-icon">📚</div>
          <p>No public stories found.</p>
          <p>Check back later for new stories!</p>
        </div>
      )}

      {!loading && !error && stories.length > 0 && (
        <>
          <div className="stories-grid">
            {stories.map((story) => (
              <div 
                key={story.id} 
                className={`story-card ${story.featured ? 'featured' : ''}`}
                onClick={() => handleStoryClick(story)}
              >
                {story.featured && <div className="featured-badge">⭐ Featured</div>}
                
                <div className="story-card-header">
                  <h3 className="story-title">{story.title}</h3>
                  <div className="story-meta">
                    <span className="story-category">{story.category}</span>
                    <span className="story-age">{story.age_group}</span>
                  </div>
                </div>
                
                <div className="story-preview">
                  <p>{truncateText(story.story_content)}</p>
                </div>
                
                <div className="story-formats">
                  {story.formats && story.formats.map(format => (
                    <span key={format} className="format-tag">{format}</span>
                  ))}
                </div>
                
                {story.image_urls && story.image_urls.length > 0 && (
                  <div className="story-thumbnail">
                    <img 
                      src={story.image_urls[0]} 
                      alt={story.title}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="story-card-footer">
                  <span className="story-date">
                    Created: {formatDate(story.created_at)}
                  </span>
                  {story.tags && story.tags.length > 0 && (
                    <div className="story-tags">
                      {story.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="story-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages} ({totalCount} stories)
              </span>
              
              <button 
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PublicStories