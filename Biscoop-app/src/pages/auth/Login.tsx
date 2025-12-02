import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCurrentUserId, createOrGetUser } from '../../api/users';
import './auth.css';

export interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const ADMIN_EMAIL = 'johndoe@test.test';
const ADMIN_PASSWORD = '123456';
const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION = 60000; // 1 minute in milliseconds

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Check if user is blocked on mount
  useEffect(() => {
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    if (blockedUntil) {
      const blockedTime = parseInt(blockedUntil);
      const now = Date.now();
      if (now < blockedTime) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil((blockedTime - now) / 1000));
      } else {
        localStorage.removeItem('loginBlockedUntil');
        localStorage.removeItem('loginAttempts');
      }
    }

    const attempts = localStorage.getItem('loginAttempts');
    if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
  }, []);

  // Countdown timer for blocked state
  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setBlockTimeRemaining(blockTimeRemaining - 1);
        if (blockTimeRemaining <= 1) {
          setIsBlocked(false);
          setLoginAttempts(0);
          localStorage.removeItem('loginBlockedUntil');
          localStorage.removeItem('loginAttempts');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBlocked, blockTimeRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBlocked) {
      setError(`Too many failed attempts. Please wait ${blockTimeRemaining} seconds.`);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      let loginSuccess = false;

      // Check for hardcoded admin account
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          const user = await createOrGetUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            firstName: 'John',
            lastName: 'Doe'
          });
          
          saveCurrentUserId(user.id);
          localStorage.setItem('username', `${user.firstName} ${user.lastName}`);
          onLogin(email, password);
          navigate('/home');
          loginSuccess = true;
        } catch (err) {
          console.error('Failed to create/get admin user:', err);
          setError('Failed to connect to server. Please make sure the backend is running.');
          setLoading(false);
          return;
        }
      }

      // Check for registered user in localStorage
      if (!loginSuccess) {
        const registeredUser = localStorage.getItem('registeredUser');
        if (registeredUser) {
          try {
            const userData = JSON.parse(registeredUser);
            if (userData.email === email && userData.password === password) {
              try {
                const user = await createOrGetUser({
                  email: userData.email,
                  password: userData.password,
                  firstName: userData.name.split(' ')[0],
                  lastName: userData.name.split(' ').slice(1).join(' ') || 'User'
                });
                
                saveCurrentUserId(user.id);
                localStorage.setItem('username', userData.name);
                onLogin(email, password);
                navigate('/profile');
                loginSuccess = true;
              } catch (err) {
                console.error('Failed to create user in database:', err);
                const userId = userData.id || crypto.randomUUID();
                saveCurrentUserId(userId);
                localStorage.setItem('username', userData.name);
                onLogin(email, password);
                navigate('/profile');
                loginSuccess = true;
              }
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }

      // If login failed, increment attempts
      if (!loginSuccess) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const blockUntil = Date.now() + BLOCK_DURATION;
          localStorage.setItem('loginBlockedUntil', blockUntil.toString());
          setIsBlocked(true);
          setBlockTimeRemaining(Math.ceil(BLOCK_DURATION / 1000));
          setError(`Too many failed attempts. Account temporarily blocked for 1 minute.`);
        } else {
          setError(`Invalid email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      } else {
        // Reset attempts on successful login
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockedUntil');
        setLoginAttempts(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
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
              disabled={loading || isBlocked}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="form-input"
                required
                disabled={loading || isBlocked}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isBlocked}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="link-button"
              disabled={loading || isBlocked}
            >
              Forgot password?
            </button>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading || isBlocked}>
            {loading ? 'Signing in...' : isBlocked ? `Blocked (${blockTimeRemaining}s)` : 'Sign In'}
          </button>
        </form>
        
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPassword}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeForgotPassword}>×</button>
            <h3 className="modal-title">Forgot Password?</h3>
            <p className="modal-text">
              Password reset functionality is currently under development. 
              Please contact support at support@cinema.com for assistance.
            </p>
            <button className="btn-primary" onClick={closeForgotPassword}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;