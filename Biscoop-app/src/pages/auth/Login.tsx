import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveCurrentUserId, loginUserAuth, saveAuthToken } from '../../api/users';
import './auth.css';

export interface LoginProps {
  onLogin: (userId: string, email: string, firstName: string, lastName: string) => void;
}

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
      // Try login with backend (handles all users including demo account)
      const data = await loginUserAuth({ email, password });
      
      // Save user data
      saveCurrentUserId(data.id);
      
      // Save JWT token
      if (data.token) {
        saveAuthToken(data.token);
        console.log('🔐 JWT token received and saved');
      }
      
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User';
      localStorage.setItem('username', fullName);
      
      // Also update registeredUser for consistency
      localStorage.setItem('registeredUser', JSON.stringify({
        id: data.id,
        name: fullName,
        email: data.email,
        password: password,
      }));

      console.log('✅ Login successful:', fullName);
      onLogin(data.id, data.email, data.firstName, data.lastName);
      navigate('/home');
    } catch (err) {
      console.error('❌ Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
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