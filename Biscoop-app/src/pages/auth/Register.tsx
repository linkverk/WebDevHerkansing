import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const FORBIDDEN_USERNAMES = ['admin', 'administrator', 'root', 'system', 'moderator', 'support'];

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Field validation states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { text: 'At least 6 characters', met: false },
    { text: 'Contains a number', met: false },
    { text: 'Contains uppercase letter', met: false },
    { text: 'Contains lowercase letter', met: false }
  ]);

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Validate name in real-time
  useEffect(() => {
    if (name.length > 0) {
      const nameLower = name.toLowerCase();
      if (name.length < 2) {
        setNameError('Name must be at least 2 characters');
      } else if (FORBIDDEN_USERNAMES.some(forbidden => nameLower.includes(forbidden))) {
        setNameError('This username is not allowed');
      } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        setNameError('Name can only contain letters and spaces');
      } else {
        setNameError('');
      }
    } else {
      setNameError('');
    }
  }, [name]);

  // Validate email in real-time
  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        
        // Provide suggestions
        if (email.includes('@') && !email.includes('.')) {
          const domain = email.split('@')[1];
          if (domain) {
            const suggestions = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
            const suggestion = suggestions.find(s => s.startsWith(domain.charAt(0)));
            if (suggestion) {
              setEmailError(`Did you mean ${email.split('@')[0]}@${suggestion}?`);
            }
          }
        }
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validate password in real-time
  useEffect(() => {
    if (password.length > 0) {
      const requirements = [
        { text: 'At least 6 characters', met: password.length >= 6 },
        { text: 'Contains a number', met: /\d/.test(password) },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { text: 'Contains lowercase letter', met: /[a-z]/.test(password) }
      ];
      
      setPasswordRequirements(requirements);
      
      const metCount = requirements.filter(r => r.met).length;
      if (metCount <= 1) {
        setPasswordStrength('weak');
        setPasswordError('Password is too weak');
      } else if (metCount === 2 || metCount === 3) {
        setPasswordStrength('medium');
        setPasswordError('');
      } else {
        setPasswordStrength('strong');
        setPasswordError('');
      }
    } else {
      setPasswordError('');
      setPasswordStrength('weak');
    }
  }, [password]);

  // Validate confirm password in real-time
  useEffect(() => {
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setError('Please fix the errors before submitting.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to register.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength === 'weak') {
      setError('Please choose a stronger password.');
      return;
    }

    const userData = {
      name: name,
      email: email,
      password: password,
      registeredAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      localStorage.setItem('userName', name);
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('User registered:', name);
      
      navigate('/login', { 
        state: { 
          message: 'Account successfully created! Please log in.',
          registeredName: name 
        } 
      });
    } catch (err) {
      setError('Error saving registration. Please try again.');
      console.error('Registration error:', err);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'strong': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        
        {error && (
          <div className="error-message" style={{ 
            color: '#e74c3c', 
            marginBottom: '1rem', 
            padding: '0.75rem',
            backgroundColor: '#fee',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={`form-input ${nameError ? 'input-error' : name.length > 0 && !nameError ? 'input-success' : ''}`}
              required
            />
            {nameError && <div className="field-error">{nameError}</div>}
            {name.length > 0 && !nameError && <div className="field-success">✓ Name looks good</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`form-input ${emailError ? 'input-error' : email.length > 0 && !emailError ? 'input-success' : ''}`}
              required
            />
            {emailError && <div className="field-error">{emailError}</div>}
            {email.length > 0 && !emailError && <div className="field-success">✓ Valid email address</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={`form-input ${passwordError ? 'input-error' : ''}`}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {password.length > 0 && (
              <>
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{ 
                      width: getPasswordStrengthWidth(),
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  />
                </div>
                <div 
                  className="password-strength-label"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </div>
                
                <div className="password-requirements">
                  {passwordRequirements.map((req, index) => (
                    <div 
                      key={index}
                      className={`requirement-item ${req.met ? 'requirement-met' : ''}`}
                    >
                      <span className="requirement-icon">{req.met ? '✓' : '○'}</span>
                      <span className="requirement-text">{req.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`form-input ${confirmPasswordError ? 'input-error' : confirmPassword.length > 0 && !confirmPasswordError ? 'input-success' : ''}`}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {confirmPasswordError && <div className="field-error">{confirmPasswordError}</div>}
            {confirmPassword.length > 0 && !confirmPasswordError && password === confirmPassword && (
              <div className="field-success">✓ Passwords match</div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                I accept the <button type="button" className="link-button inline-link">Terms & Conditions</button> and <button type="button" className="link-button inline-link">Privacy Policy</button>
              </span>
            </label>
          </div>
          
          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>
        
        <div className="auth-footer">
          <span className="auth-text">Already have an account? </span>
          <button 
            onClick={() => navigate('/login')} 
            className="link-button"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;