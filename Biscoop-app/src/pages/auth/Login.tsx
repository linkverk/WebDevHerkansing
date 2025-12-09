import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveCurrentUserId, loginUserAuth, createOrGetUser } from '../../api/users';
import './auth.css';

export interface LoginProps {
  onLogin: (userId: string, email: string, firstName: string, lastName: string) => void;
}

// Demo account credentials
const ADMIN_EMAIL = 'johndoe@test.test';
const ADMIN_PASSWORD = '123456';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for success message from registration
  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // Check for hardcoded admin account
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          // Create or get admin user from database
          const user = await createOrGetUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            firstName: 'John',
            lastName: 'Doe'
          });
          
          saveCurrentUserId(user.id);
          localStorage.setItem('username', `${user.firstName} ${user.lastName}`);
          
          // Call onLogin with full user data
          onLogin(user.id, user.email, user.firstName || 'John', user.lastName || 'Doe');
          navigate('/home');
          return;
        } catch (err) {
          console.error('Failed to create/get admin user:', err);
          setError('Failed to connect to server. Please make sure the backend is running.');
          setLoading(false);
          return;
        }
      }

      // Check for registered user in localStorage
      const registeredUser = localStorage.getItem('registeredUser');
      if (registeredUser) {
        try {
          const userData = JSON.parse(registeredUser);
          if (userData.email === email && userData.password === password) {
            // Try to get/create user in database
            try {
              const nameParts = userData.name.split(' ');
              const firstName = nameParts[0];
              const lastName = nameParts.slice(1).join(' ') || 'User';
              
              const user = await createOrGetUser({
                email: userData.email,
                password: userData.password,
                firstName: firstName,
                lastName: lastName
              });
              
              saveCurrentUserId(user.id);
              localStorage.setItem('username', userData.name);
              
              // Call onLogin with full user data
              onLogin(user.id, user.email, user.firstName || firstName, user.lastName || lastName);
              navigate('/home');
              return;
            } catch (err) {
              console.error('Failed to create user in database:', err);
              // Continue with localStorage only
              const userId = userData.id || crypto.randomUUID();
              saveCurrentUserId(userId);
              localStorage.setItem('username', userData.name);
              
              const nameParts = userData.name.split(' ');
              onLogin(userId, email, nameParts[0], nameParts.slice(1).join(' ') || '');
              navigate('/home');
              return;
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      // Try login with auth controller
      try {
        const data = await loginUserAuth({ email, password });
        
        // Save user data
        saveCurrentUserId(data.id);
        
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User';
        localStorage.setItem('username', fullName);
        
        // Also update registeredUser for consistency
        localStorage.setItem('registeredUser', JSON.stringify({
          id: data.id,
          name: fullName,
          email: data.email,
          password: password, // Keep for future reference
        }));

        onLogin(data.id, data.email, data.firstName, data.lastName);
        navigate('/home');
      } catch (err) {
        console.error('❌ Login error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Invalid email or password. Please try again.');
        }
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        
        {successMessage && (
          <div className="success-message" style={{ 
            color: '#2c5f2d', 
            marginBottom: '1rem', 
            padding: '0.75rem',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            ✓ {successMessage}
          </div>
        )}
        
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
        
        <div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="button" 
            className="btn-primary" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <div className="auth-footer">
          <span className="auth-text">Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="link-button"
            disabled={loading}
          >
            Sign up
          </button>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '0.75rem', 
          backgroundColor: '#0a0a0f',
          border: '1px solid #2e2e38',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#9ab0c9'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Demo Account:</p>
          <p style={{ margin: '0' }}>Email: johndoe@test.test</p>
          <p style={{ margin: '0' }}>Password: 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;