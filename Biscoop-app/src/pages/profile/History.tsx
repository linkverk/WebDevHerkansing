import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserHistory, getCurrentUserId } from '../../api/users';
import type { FilmHistory } from '../../api/users';
import './profile.css';

type SortOption = 'name' | 'rating' | 'duration' | 'dateAdded';
type GroupOption = 'none' | 'month' | 'year';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<FilmHistory[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<FilmHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Display options
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movies, searchQuery, selectedGenres, ratingFilter, durationFilter, yearFilter, dateRange, sortBy]);

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
      // Add mock dateAdded for demonstration
      const historyWithDates = history.map((movie, index) => ({
        ...movie,
        dateAdded: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      setMovies(historyWithDates as any);
      setError('');
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...movies];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(movie => 
        movie.name.toLowerCase().includes(query) ||
        movie.genre?.toLowerCase().includes(query) ||
        movie.description?.toLowerCase().includes(query)
      );
    }

    // Genre filter (multiple selection)
    if (selectedGenres.length > 0) {
      result = result.filter(movie => 
        movie.genre && selectedGenres.includes(movie.genre)
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      result = result.filter(movie => movie.rating === ratingFilter);
    }

    // Duration filter
    if (durationFilter !== 'all') {
      result = result.filter(movie => {
        const duration = movie.duration || 0;
        switch (durationFilter) {
          case 'short': return duration < 90;
          case 'medium': return duration >= 90 && duration <= 120;
          case 'long': return duration > 120;
          default: return true;
        }
      });
    }

    // Year filter (extract from movie data if available)
    if (yearFilter !== 'all') {
      // This would need year data in the movie object
      // For now, we'll skip this filter
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(movie => {
        const movieDate = (movie as any).dateAdded ? new Date((movie as any).dateAdded) : null;
        if (!movieDate) return true;
        
        if (dateRange.from && new Date(dateRange.from) > movieDate) return false;
        if (dateRange.to && new Date(dateRange.to) < movieDate) return false;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating':
          return (b.rating || '').localeCompare(a.rating || '');
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'dateAdded':
          const dateA = (a as any).dateAdded ? new Date((a as any).dateAdded).getTime() : 0;
          const dateB = (b as any).dateAdded ? new Date((b as any).dateAdded).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

    setFilteredMovies(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setRatingFilter('all');
    setDurationFilter('all');
    setYearFilter('all');
    setDateRange({ from: '', to: '' });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Get unique genres and years from movies
  const availableGenres = Array.from(new Set(movies.map(m => m.genre).filter(Boolean)));
  const availableYears = Array.from(new Set(
    movies.map(m => (m as any).dateAdded ? new Date((m as any).dateAdded).getFullYear() : null)
      .filter(Boolean)
  )).sort((a, b) => (b as number) - (a as number));

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = filteredMovies.slice(startIndex, endIndex);

  // Calculate statistics
  const totalMovies = movies.length;
  const totalHours = Math.round(movies.reduce((sum, movie) => sum + (movie.duration || 0), 0) / 60);
  const filteredCount = filteredMovies.length;

  // Group movies if needed
  const groupedMovies = groupBy === 'none' ? { 'All Movies': currentMovies } : (() => {
    const groups: Record<string, typeof currentMovies> = {};
    currentMovies.forEach(movie => {
      const dateAdded = (movie as any).dateAdded ? new Date((movie as any).dateAdded) : null;
      if (!dateAdded) {
        groups['Unknown'] = groups['Unknown'] || [];
        groups['Unknown'].push(movie);
        return;
      }

      let key = '';
      if (groupBy === 'month') {
        key = dateAdded.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      } else if (groupBy === 'year') {
        key = dateAdded.getFullYear().toString();
      }
      
      groups[key] = groups[key] || [];
      groups[key].push(movie);
    });
    return groups;
  })();

  if (loading) {
    return (
      <div className="profile-container">
        <div className="history-card">
          <p style={{ textAlign: 'center', color: '#9ab0c9' }}>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="history-card">
        <div className="history-header">
          <h2 className="history-title">Movie History</h2>
          <button 
            onClick={() => navigate('/profile')} 
            className="btn-back-inline"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {/* Statistics */}
        <div className="history-stats">
          <div className="history-stat">
            <span className="history-stat-value">{totalMovies}</span>
            <span className="history-stat-label">Total Movies</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{totalHours}</span>
            <span className="history-stat-label">Hours Watched</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{filteredCount}</span>
            <span className="history-stat-label">Showing</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by title, genre, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="search-clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            {/* Genre Filter (Multiple Selection) */}
            <div className="filter-group">
              <label className="filter-label">Genres:</label>
              <div className="genre-chips">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`genre-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="filter-label">Rating:</label>
              <select 
                value={ratingFilter} 
                onChange={(e) => setRatingFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="filter-group">
              <label className="filter-label">Duration:</label>
              <select 
                value={durationFilter} 
                onChange={(e) => setDurationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Durations</option>
                <option value="short">&lt; 90 minutes</option>
                <option value="medium">90-120 minutes</option>
                <option value="long">&gt; 120 minutes</option>
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-group date-range">
            <label className="filter-label">Date Range:</label>
            <div className="date-inputs">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="date-input"
                placeholder="From"
              />
              <span style={{ color: '#9ab0c9' }}>to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="date-input"
                placeholder="To"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="filter-actions">
            <button onClick={resetFilters} className="btn-reset">
              Reset All Filters
            </button>
            <span className="filter-count">
              {filteredCount !== totalMovies && `${filteredCount} of ${totalMovies} movies`}
            </span>
          </div>
        </div>

        {/* Display Options */}
        <div className="display-options">
          <div className="option-group">
            <label className="option-label">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="option-select"
            >
              <option value="name">Title (A-Z)</option>
              <option value="rating">Rating</option>
              <option value="duration">Duration</option>
              <option value="dateAdded">Date Added</option>
            </select>
          </div>

          <div className="option-group">
            <label className="option-label">Group by:</label>
            <select 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value as GroupOption)}
              className="option-select"
            >
              <option value="none">No Grouping</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          <div className="option-group">
            <label className="option-label">Per page:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="option-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Movie List */}
        <div className="movie-list">
          {Object.entries(groupedMovies).map(([groupName, groupMovies]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <h3 className="group-header">{groupName}</h3>
              )}
              {groupMovies.length > 0 ? (
                groupMovies.map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <div className="movie-poster-small">🎬</div>
                    <div className="movie-info">
                      <div className="movie-title">{movie.name}</div>
                      <div className="movie-meta">
                        {movie.genre && <span>📁 {movie.genre}</span>}
                        {movie.duration && <span>⏱️ {movie.duration} min</span>}
                        {movie.rating && <span>🎭 {movie.rating}</span>}
                      </div>
                      {movie.description && (
                        <div className="movie-review">"{movie.description}"</div>
                      )}
                      {(movie as any).dateAdded && (
                        <div className="movie-date">
                          Added: {new Date((movie as any).dateAdded).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMovies.length === 0 && (
          <div className="no-movies">
            <p>No movies found matching your filters.</p>
            <button onClick={resetFilters} className="btn-reset-filters">
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
              <span className="pagination-range">
                ({startIndex + 1}-{Math.min(endIndex, filteredCount)} of {filteredCount})
              </span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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