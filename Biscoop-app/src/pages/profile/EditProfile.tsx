import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { getUserProfile, updateUserProfile, getCurrentUserId } from '../../api/users';
import './profile.css';

interface ExtendedUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
  genre: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  
  const [formData, setFormData] = useState<ExtendedUserData>({
    firstName: '',
    lastName: '',
    email: user.email,
    password: '',
    confirmPassword: '',
    bio: '',
    genre: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const userId = user.id || getCurrentUserId();
    if (!userId) {
      setErrorMessage('User not logged in');
      return;
    }

    try {
      setLoading(true);
      const profile = await getUserProfile(userId);
      
      // Load extended profile data from localStorage
      const savedProfile = localStorage.getItem('userProfile');
      let extendedData = { bio: '', genre: '' };
      
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          extendedData = {
            bio: profileData.bio || '',
            genre: profileData.genre || ''
          };
        } catch (e) {
          console.error('Error loading extended profile:', e);
        }
      }

      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email,
        password: '',
        confirmPassword: '',
        bio: extendedData.bio,
        genre: extendedData.genre
      });

      // Load avatar if exists
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarPreview(savedAvatar);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorMessage('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 2MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    localStorage.removeItem('userAvatar');
    setHasChanges(true);
  };

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: '#e74c3c' },
      { score: 2, label: 'Fair', color: '#f39c12' },
      { score: 3, label: 'Good', color: '#f1c40f' },
      { score: 4, label: 'Strong', color: '#2ecc71' },
      { score: 5, label: 'Very Strong', color: '#27ae60' }
    ];

    return strengths[score];
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const textFields = [
    { key: 'firstName', label: 'First Name', placeholder: 'Enter first name', required: true },
    { key: 'lastName', label: 'Last Name', placeholder: 'Enter last name', required: true },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter email', required: true }
  ];

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSuccessMessage('');
    setErrorMessage('');
    setHasChanges(true);
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
    if (formData.password && formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    const userId = user.id || getCurrentUserId();
    if (!userId) {
      setErrorMessage('User not logged in');
      return;
    }

    try {
      setLoading(true);

      // Save avatar to localStorage
      if (avatarPreview) {
        localStorage.setItem('userAvatar', avatarPreview);
      }

      // Update via API
      const updateData: any = {
        id: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedProfile = await updateUserProfile(userId, updateData);

      // Update the user context
      const fullName = `${updatedProfile.firstName} ${updatedProfile.lastName}`;
      setUser({
        ...user,
        id: userId,
        name: fullName,
        email: updatedProfile.email
      });

      // Save extended profile data to localStorage
      const profileData = {
        bio: formData.bio,
        genre: formData.genre,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('userProfile', JSON.stringify(profileData));

      // Update registered user data in localStorage
      const registeredUser = localStorage.getItem('registeredUser');
      if (registeredUser) {
        const userData = JSON.parse(registeredUser);
        userData.id = userId;
        userData.name = fullName;
        userData.email = formData.email;
        if (formData.password) {
          userData.password = formData.password;
        }
        localStorage.setItem('registeredUser', JSON.stringify(userData));
      }

      localStorage.setItem('username', fullName);

      setSuccessMessage('Profile updated successfully!');
      setHasChanges(false);
      
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

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
          <div className="edit-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-image" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </div>
          <div className="avatar-actions">
            <label className="btn-change-avatar">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
            </label>
            {avatarPreview && (
              <button onClick={removeAvatar} className="btn-remove-avatar">
                Remove
              </button>
            )}
          </div>
          <p className="avatar-hint">JPG, PNG or GIF (max 2MB)</p>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3 className="section-subtitle">Basic Information</h3>
          {textFields.map(field => (
            <div key={field.key} className="form-group">
              <label className="form-label">
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <input
                type={field.type || 'text'}
                value={formData[field.key as keyof typeof formData]}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="form-input"
                required={field.required}
              />
            </div>
          ))}
        </div>

        {/* Password Section */}
        <div className="form-section">
          <h3 className="section-subtitle">Change Password</h3>
          <p className="section-description">Leave blank to keep current password</p>
          
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Enter new password"
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className="form-input"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="form-section">
          <h3 className="section-subtitle">Additional Information</h3>
          
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="form-textarea"
              maxLength={500}
            />
            <span className="char-count">{formData.bio.length}/500</span>
          </div>
          
          <div className="form-group">
            <label className="form-label">Favorite Genre</label>
            <select
              value={formData.genre}
              onChange={(e) => updateField('genre', e.target.value)}
              className="form-select"
            >
              <option value="">Select a genre</option>
              {['Action & Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction', 'Thriller', 'Documentary', 'Animation'].map(g => (
                <option key={g} value={g.toLowerCase()}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="button-grid">
          <button 
            onClick={handleSave} 
            className="btn-success"
            disabled={loading || !!successMessage || !hasChanges}
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
      </div>
    </div>
  );
};

export default EditProfile;