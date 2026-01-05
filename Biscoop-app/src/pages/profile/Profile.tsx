import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile, getCurrentUserId } from '../../api/users';
import type { User, Movie } from '../../types';
import './profile.css';

export interface ProfileProps {
  user: User;
  movies: Movie[];
  onLogout: () => void;
}

interface ExtendedProfile {
  bio: string;
  genre: string;
  avatarColor: string;
  avatarEmoji: string;
  lastUpdated: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  country?: string;
}

const Profile: React.FC<ProfileProps> = ({ user, movies, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user.email,
  });
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({
    bio: '',
    genre: '',
    avatarColor: '#7c3aed',
    avatarEmoji: '👤',
    lastUpdated: '',
    phoneNumber: '',
    countryCode: '+31',
    dateOfBirth: '',
    gender: '',
    city: '',
    country: 'Netherlands'
  });
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Always reload when component mounts or location changes
    loadProfile();
  }, [location.pathname]); // Re-load when returning from edit-profile

  const loadProfile = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('No userId found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Load from database (source of truth for core data)
      const profile = await getUserProfile(userId);
      console.log('✅ Profile loaded from database:', profile);
      
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email,
      });

      // Load extended profile data from localStorage (bio, genre, avatar)
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          console.log('✅ Extended profile loaded from localStorage:', profileData);
          setExtendedProfile({
            bio: profileData.bio || '',
            genre: profileData.genre || '',
            avatarColor: profileData.avatarColor || '#7c3aed',
            avatarEmoji: profileData.avatarEmoji || '👤',
            lastUpdated: profileData.lastUpdated || '',
            phoneNumber: profileData.phoneNumber || '',
            countryCode: profileData.countryCode || '+31',
            dateOfBirth: profileData.dateOfBirth || '',
            gender: profileData.gender || '',
            city: profileData.city || '',
            country: profileData.country || 'Netherlands'
          });
        } catch (error) {
          console.error('Error parsing extended profile:', error);
        }
      }

      // Load avatar image from localStorage
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        console.log('✅ Avatar image loaded from localStorage');
        setAvatarImage(savedAvatar);
      } else {
        setAvatarImage(null);
      }
    } catch (error) {
      console.error('❌ Error loading profile from database:', error);
      
      // Fallback to localStorage/context ONLY if database fails
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          setExtendedProfile({
            bio: profileData.bio || '',
            genre: profileData.genre || '',
            avatarColor: profileData.avatarColor || '#7c3aed',
            avatarEmoji: profileData.avatarEmoji || '👤',
            lastUpdated: profileData.lastUpdated || ''
          });
        } catch (error) {
          console.error('Error loading from localStorage:', error);
        }
      }

      // Load avatar fallback
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarImage(savedAvatar);
      }
      
      // Use context as absolute fallback
      setProfileData({
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
      });
    } finally {
      setLoading(false);
    }
  };

  const displayName = `${profileData.firstName} ${profileData.lastName}`.trim() || user.name;
  
  // Calculate dynamic stats
  const totalMovies = movies.length;
  const reviewCount = movies.filter(movie => movie.rating).length; // Movies with ratings
  const favoriteGenres = movies.reduce((acc, movie) => {
    acc[movie.genre] = (acc[movie.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topGenreCount = Math.max(...Object.values(favoriteGenres), 0);
  
  const stats = [
    { value: totalMovies, label: 'Movies Watched', icon: '🎬' },
    { value: user.points, label: 'Points Earned', icon: '⭐' },
    { value: reviewCount, label: 'Reviews Written', icon: '✍️' },
    { value: topGenreCount, label: 'Top Genre Views', icon: '❤️' }
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Create avatar style based on whether we have an image or use color/emoji
  const avatarStyle = avatarImage 
    ? { 
        backgroundImage: `url(${avatarImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        fontSize: '0' // Hide emoji when showing image
      }
    : { 
        backgroundColor: extendedProfile.avatarColor,
        fontSize: '3rem'
      };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p style={{ textAlign: 'center', color: '#9ab0c9', padding: '2rem' }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header"></div>
        
        <div className="profile-info">
          <div 
            className="profile-avatar"
            style={avatarStyle}
            title={avatarImage ? "Custom Avatar" : `${extendedProfile.avatarEmoji} - ${extendedProfile.avatarColor}`}
          >
            {!avatarImage && extendedProfile.avatarEmoji}
          </div>
          <div className="profile-name">{displayName}</div>
          <div className="profile-email">{profileData.email}</div>
          {extendedProfile.bio && (
            <div className="profile-bio">"{extendedProfile.bio}"</div>
          )}
          {extendedProfile.genre && (
            <div className="profile-genre">
              ❤️ Favorite Genre: {extendedProfile.genre.charAt(0).toUpperCase() + extendedProfile.genre.slice(1)}
            </div>
          )}
          {extendedProfile.phoneNumber && extendedProfile.countryCode && (
            <div className="profile-detail">
              📱 {extendedProfile.countryCode} {extendedProfile.phoneNumber}
            </div>
          )}
          {extendedProfile.dateOfBirth && (
            <div className="profile-detail">
              🎂 {new Date(extendedProfile.dateOfBirth).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {(() => {
                const today = new Date();
                const birthDate = new Date(extendedProfile.dateOfBirth);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return ` (${age} years old)`;
              })()}
            </div>
          )}
          {extendedProfile.gender && (
            <div className="profile-detail">
              {extendedProfile.gender === 'male' && '👨 Male'}
              {extendedProfile.gender === 'female' && '👩 Female'}
              {extendedProfile.gender === 'non-binary' && '🧑 Non-binary'}
              {extendedProfile.gender === 'other' && '👤 Other'}
            </div>
          )}
          {(extendedProfile.city || extendedProfile.country) && (
            <div className="profile-detail">
              📍 {extendedProfile.city && `${extendedProfile.city}, `}{extendedProfile.country}
            </div>
          )}
        </div>

        <div className="profile-badges">
          <div className="profile-badge">
            ⭐ Premium Member
          </div>
          {movies.length >= 10 && (
            <div className="profile-badge badge-gold">
              🎬 Movie Buff
            </div>
          )}
          {user.points >= 100 && (
            <div className="profile-badge badge-blue">
              💎 Top Reviewer
            </div>
          )}
        </div>

        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <span className="stat-value">{stat.value}</span>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="section-title">Recent Activity</div>
        <div className="activity-list">
          {movies.length > 0 ? (
            movies.slice(0, 3).map((movie) => (
              <div key={movie.id} className="activity-item">
                <div className="activity-poster">
                  {movie.poster}
                </div>
                <div className="activity-details">
                  <div className="activity-title">{movie.title}</div>
                  <div className="activity-date">Watched on {movie.watchedDate}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <p style={{ textAlign: 'center', color: '#9ab0c9', padding: '1rem' }}>
                No movies watched yet. Start watching to build your history!
              </p>
            </div>
          )}
        </div>

        <div className="button-grid">
          <button 
            onClick={() => navigate('/edit-profile')} 
            className="btn-success"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => navigate('/history')} 
            className="btn-secondary"
          >
            View History
          </button>
        </div>

        <button 
          onClick={handleLogout} 
          className="btn-logout"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;