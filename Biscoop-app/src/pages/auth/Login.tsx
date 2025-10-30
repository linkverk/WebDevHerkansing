import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

export interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const ADMIN_EMAIL = 'johndoe@test.test';
const ADMIN_PASSWORD = '123456';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Check for hardcoded admin account
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onLogin(email, password);
      navigate('/home');
    }

    // Check for registered user
    const registeredUser = localStorage.getItem('registeredUser');
    if (registeredUser) {
      try {
        const userData = JSON.parse(registeredUser);
        if (userData.email === email && userData.password === password) {
          onLogin(email, password);
          navigate('/profile');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // If we get here, credentials are invalid
    setError('Invalid email or password. Please try again or register a new account.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        
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
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
              required
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
            />
          </div>
          
          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>
        
        <div className="auth-footer">
          <span className="auth-text">Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="link-button"
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