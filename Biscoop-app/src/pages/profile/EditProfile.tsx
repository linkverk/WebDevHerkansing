import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { getUserProfile, updateUserProfile, deleteUserAccount, getCurrentUserId } from '../../api/users';
import './profile.css';

interface ExtendedUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
  genre: string;
  avatarColor: string;
  avatarEmoji: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  country: string;
}

const AVATAR_COLORS = [
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

const AVATAR_EMOJIS = ['👤', '😊', '🎬', '🎭', '🎪', '🎨', '🎵', '🎮', '🌟', '🚀', '🎯', '💫'];

const COUNTRY_CODES = [
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+32', country: 'BE', flag: '🇧🇪' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
];

const COUNTRIES = [
  'Netherlands', 'United States', 'United Kingdom', 'Germany', 
  'France', 'Spain', 'Italy', 'Belgium', 'China', 'Japan', 
  'India', 'Russia', 'Canada', 'Australia', 'Brazil', 'Mexico'
];

const CITIES_NL = [
  'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 
  'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Schiedam'
];

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ExtendedUserData>({
    firstName: '',
    lastName: '',
    email: user.email,
    password: '',
    bio: '',
    genre: '',
    avatarColor: '#7c3aed',
    avatarEmoji: '👤',
    phoneNumber: '',
    countryCode: '+31',
    dateOfBirth: '',
    gender: '',
    city: '',
    country: 'Netherlands'
  });

  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Age calculation helper
  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.dateOfBirth);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData, avatarImage]);

  const loadUserProfile = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setErrorMessage('User not logged in');
      return;
    }

    try {
      setLoading(true);
      const profile = await getUserProfile(userId);
      
      const savedProfile = localStorage.getItem('userProfile');
      let extendedData = { 
        bio: '', 
        genre: '', 
        avatarColor: '#7c3aed', 
        avatarEmoji: '👤',
        phoneNumber: '',
        countryCode: '+31',
        dateOfBirth: '',
        gender: '',
        city: '',
        country: 'Netherlands'
      };
      
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          extendedData = {
            bio: profileData.bio || '',
            genre: profileData.genre || '',
            avatarColor: profileData.avatarColor || '#7c3aed',
            avatarEmoji: profileData.avatarEmoji || '👤',
            phoneNumber: profileData.phoneNumber || '',
            countryCode: profileData.countryCode || '+31',
            dateOfBirth: profileData.dateOfBirth || '',
            gender: profileData.gender || '',
            city: profileData.city || '',
            country: profileData.country || 'Netherlands'
          };
        } catch (e) {
          console.error('Error loading extended profile:', e);
        }
      }

      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarImage(savedAvatar);
      }

      const registeredUser = localStorage.getItem('registeredUser');
      let password = '';
      if (registeredUser) {
        try {
          const userData = JSON.parse(registeredUser);
          password = userData.password || '';
        } catch (e) {
          console.error('Error loading password:', e);
        }
      }

      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email,
        password: password,
        bio: extendedData.bio,
        genre: extendedData.genre,
        avatarColor: extendedData.avatarColor,
        avatarEmoji: extendedData.avatarEmoji,
        phoneNumber: extendedData.phoneNumber,
        countryCode: extendedData.countryCode,
        dateOfBirth: extendedData.dateOfBirth,
        gender: extendedData.gender,
        city: extendedData.city,
        country: extendedData.country
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorMessage('Failed to load profile from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage('Image must be smaller than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setAvatarImage(imageData);
        setShowAvatarOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarImage(null);
    localStorage.removeItem('userAvatar');
    setShowAvatarOptions(false);
  };

  const updateField = (key: keyof ExtendedUserData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('First and last name are required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Valid email is required');
      return false;
    }
    if (formData.bio.length > 200) {
      setErrorMessage('Bio must be 200 characters or less');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setErrorMessage('User not logged in');
      return;
    }

    try {
      setLoading(true);

      const updatedProfile = await updateUserProfile(userId, {
        id: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      console.log('✅ Core profile saved to database:', updatedProfile);

      const fullName = `${updatedProfile.firstName} ${updatedProfile.lastName}`;
      setUser({
        ...user,
        name: fullName,
        email: updatedProfile.email
      });

      const profileData = {
        bio: formData.bio,
        genre: formData.genre,
        avatarColor: formData.avatarColor,
        avatarEmoji: formData.avatarEmoji,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        city: formData.city,
        country: formData.country,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      console.log('✅ Extended profile saved to localStorage:', profileData);

      if (avatarImage) {
        localStorage.setItem('userAvatar', avatarImage);
        console.log('✅ Avatar image saved to localStorage');
      } else {
        // If no avatar image, make sure it's removed
        localStorage.removeItem('userAvatar');
        console.log('✅ Avatar image removed from localStorage');
      }

      const registeredUser = localStorage.getItem('registeredUser');
      if (registeredUser) {
        const userData = JSON.parse(registeredUser);
        userData.id = userId;
        userData.name = fullName;
        userData.email = formData.email;
        userData.password = formData.password;
        localStorage.setItem('registeredUser', JSON.stringify(userData));
      }

      localStorage.setItem('username', fullName);

      setSuccessMessage('Profile updated successfully!');
      setHasUnsavedChanges(false);
      
      setTimeout(() => {
        console.log('✅ Navigating to profile page with replace=true to force reload');
        navigate('/profile', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/profile');
  };

  const handleDeleteAccount = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      setLoading(true);
      await deleteUserAccount(userId, {
        id: userId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      localStorage.clear();
      navigate('/login', { state: { message: 'Account deleted successfully' } });
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage('Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const avatarStyle = avatarImage 
    ? { backgroundImage: `url(${avatarImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: formData.avatarColor };

  if (loading && !formData.email) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p style={{ textAlign: 'center', color: '#9ab0c9' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card edit-profile-card">
        <button 
          onClick={handleCancel} 
          className="btn-back"
        >
          ← Back to Profile
        </button>
        
        <h2 className="edit-title">Edit Profile</h2>
        
        {successMessage && (
          <div className="success-message">
            ✓ {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        {/* Avatar Section */}
        <div className="avatar-section">
          <div 
            className="edit-avatar clickable"
            style={avatarStyle}
            onClick={() => setShowAvatarOptions(!showAvatarOptions)}
          >
            {!avatarImage && formData.avatarEmoji}
          </div>
          
          <button 
            className="btn-change-avatar"
            onClick={() => setShowAvatarOptions(!showAvatarOptions)}
          >
            Change Avatar
          </button>

          {showAvatarOptions && (
            <div className="avatar-options">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="avatar-option-btn"
              >
                📷 Upload Photo
              </button>
              
              <div className="avatar-colors">
                <label className="avatar-option-label">Choose Color:</label>
                <div className="color-grid">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color.value}
                      className={`color-option ${formData.avatarColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => {
                        updateField('avatarColor', color.value);
                        setAvatarImage(null);
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="avatar-emojis">
                <label className="avatar-option-label">Choose Emoji:</label>
                <div className="emoji-grid">
                  {AVATAR_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      className={`emoji-option ${formData.avatarEmoji === emoji ? 'active' : ''}`}
                      onClick={() => {
                        updateField('avatarEmoji', emoji);
                        setAvatarImage(null);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {avatarImage && (
                <button 
                  onClick={removeAvatar}
                  className="avatar-option-btn remove"
                >
                  🗑️ Remove Photo
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Form Fields */}
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Enter first name"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Enter last name"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Enter email"
            className="form-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Bio <span className="char-count">({formData.bio.length}/200)</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => {
              if (e.target.value.length <= 200) {
                updateField('bio', e.target.value);
              }
            }}
            placeholder="Tell us about yourself..."
            rows={3}
            className="form-textarea"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Favorite Genre</label>
          <select
            value={formData.genre}
            onChange={(e) => updateField('genre', e.target.value)}
            className="form-select"
          >
            <option value="">Select a genre</option>
            <option value="action">Action & Adventure</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            <option value="horror">Horror</option>
            <option value="romance">Romance</option>
            <option value="scifi">Science Fiction</option>
            <option value="thriller">Thriller</option>
          </select>
        </div>

        {/* Phone Number with Country Code */}
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div className="phone-input-group">
            <select
              value={formData.countryCode}
              onChange={(e) => updateField('countryCode', e.target.value)}
              className="country-code-select"
            >
              {COUNTRY_CODES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value.replace(/[^0-9]/g, ''))}
              className="form-input phone-input"
              placeholder="612345678"
              maxLength={15}
            />
          </div>
          {formData.phoneNumber && formData.countryCode && (
            <div className="phone-preview">
              📱 {formData.countryCode} {formData.phoneNumber}
            </div>
          )}
        </div>

        {/* Date of Birth with Age Calculator */}
        <div className="form-group">
          <label className="form-label">
            Date of Birth
            {age !== null && (
              <span className="age-indicator"> (Age: {age} years)</span>
            )}
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            className="form-input"
            max={new Date().toISOString().split('T')[0]}
          />
          {age !== null && (
            <div className="age-category">
              {age < 13 && '👶 Child'}
              {age >= 13 && age < 18 && '🧒 Teen'}
              {age >= 18 && age < 65 && '👤 Adult'}
              {age >= 65 && '👴 Senior'}
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label className="form-label">Gender (Optional)</label>
          <select
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            className="form-select"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Location - Country & City */}
        <div className="form-group">
          <label className="form-label">Country</label>
          <select
            value={formData.country}
            onChange={(e) => {
              updateField('country', e.target.value);
              updateField('city', ''); // Reset city when country changes
            }}
            className="form-select"
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          {formData.country === 'Netherlands' ? (
            <select
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="form-select"
            >
              <option value="">Select a city</option>
              {CITIES_NL.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="form-input"
              placeholder="Enter your city"
            />
          )}
        </div>

        <div className="button-grid">
          <button 
            onClick={handleSave} 
            className="btn-success"
            disabled={loading || !!successMessage || !hasUnsavedChanges}
          >
            {loading ? 'Saving...' : successMessage ? 'Saved!' : 'Save Changes'}
          </button>
          <button 
            onClick={handleCancel} 
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <div className="account-actions">
          <h3 className="section-subtitle">Account Management</h3>
          <p className="section-description">
            If you no longer wish to use this account, you can delete it permanently. This action cannot be undone.
          </p>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-delete-account"
            disabled={loading}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            <h3 className="modal-title">Delete Account?</h3>
            <p className="modal-text">
              Are you absolutely sure? This action cannot be undone. 
              All your data including bookings and history will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button 
                onClick={handleDeleteAccount}
                className="btn-delete-account"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;