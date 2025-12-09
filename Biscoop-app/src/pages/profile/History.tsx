import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserHistory, getCurrentUserId } from '../../api/users';
import type { FilmHistory } from '../../api/users';
import './profile.css';

type SortOption = 'name' | 'rating' | 'duration' | 'recent';
type ViewMode = 'grid' | 'list';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<FilmHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const history = await getUserHistory(userId);
      setMovies(history);
      setError('');
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique genres and ratings for filters
  const genres = ['all', ...Array.from(new Set(movies.map(m => m.genre).filter(Boolean)))];
  const ratings = ['all', ...Array.from(new Set(movies.map(m => m.rating).filter(Boolean)))];

  // Filter and sort movies
  const filteredMovies = movies
    .filter(movie => {
      const matchesGenre = filterGenre === 'all' || movie.genre === filterGenre;
      const matchesRating = filterRating === 'all' || movie.rating === filterRating;
      const matchesSearch = !searchQuery || 
        movie.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesRating && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating':
          return (b.rating || '').localeCompare(a.rating || '');
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'recent':
        default:
          return 0; // Maintain original order for recent
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage);

  // Calculate statistics
  const totalMovies = movies.length;
  const totalHours = Math.round(movies.reduce((sum, movie) => sum + (movie.duration || 0), 0) / 60);
  const favoriteGenre = genres.length > 1 
    ? genres.slice(1).reduce((a, b) => 
        movies.filter(m => m.genre === a).length > movies.filter(m => m.genre === b).length ? a : b
      )
    : 'None';

  const stats = [
    { icon: '🎬', value: totalMovies, label: 'Movies Watched' },
    { icon: '⏱️', value: totalHours, label: 'Hours Watched' },
    { icon: '❤️', value: favoriteGenre, label: 'Favorite Genre' }
  ];

  const resetFilters = () => {
    setFilterGenre('all');
    setFilterRating('all');
    setSearchQuery('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterGenre !== 'all' || filterRating !== 'all' || searchQuery !== '';

  if (loading) {
    return (
      <div className="profile-container">
        <div className="history-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="history-card">
        <div className="history-header">
          <h2 className="history-title">🎥 Movie History</h2>
          <button 
            onClick={() => navigate('/profile')} 
            className="btn-back-inline"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Statistics */}
        <div className="history-stats">
          {stats.map((stat, i) => (
            <div key={i} className="history-stat">
              <span className="history-stat-icon">{stat.icon}</span>
              <span className="history-stat-value">{stat.value}</span>
              <span className="history-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="🔍 Search movies..."
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="clear-search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="history-controls">
          <div className="history-filters">
            <div className="filter-group">
              <label className="filter-label">Genre:</label>
              <select 
                value={filterGenre} 
                onChange={(e) => {
                  setFilterGenre(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Rating:</label>
              <select 
                value={filterRating} 
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                {ratings.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === 'all' ? 'All Ratings' : rating}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="filter-select"
              >
                <option value="recent">Recent</option>
                <option value="name">Title</option>
                <option value="rating">Rating</option>
                <option value="duration">Duration</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="btn-reset-filters">
                🔄 Reset
              </button>
            )}
          </div>

          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid view"
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {filteredMovies.length > 0 && (
          <div className="results-summary">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMovies.length)} of {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Movie List */}
        <div className={`movie-list ${viewMode}-view`}>
          {paginatedMovies.length > 0 ? (
            paginatedMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster-small">
                  🎬
                </div>
                <div className="movie-info">
                  <div className="movie-title">{movie.name}</div>
                  <div className="movie-meta">
                    {movie.genre && <span className="meta-badge">📁 {movie.genre}</span>}
                    {movie.duration && <span className="meta-badge">⏱️ {movie.duration} min</span>}
                    {movie.rating && <span className="meta-badge">🎭 {movie.rating}</span>}
                  </div>
                  {movie.description && viewMode === 'list' && (
                    <div className="movie-description">{movie.description}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-movies">
              <div className="no-movies-icon">🎬</div>
              <p>
                {hasActiveFilters 
                  ? 'No movies match your filters' 
                  : 'No movies in your history yet'}
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={resetFilters}
                  className="btn-reset-filters"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}

        <div className="history-footer">
          <button 
            onClick={() => navigate('/profile')} 
            className="btn-back-center"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;