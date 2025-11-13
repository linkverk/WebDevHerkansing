import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCurrentUserId, createOrGetUser } from '../../api/users';
import './auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // Create user in database
      const user = await createOrGetUser({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName
      });

      // Save to localStorage as backup
      const userData = {
        id: user.id,
        name: name,
        email: email,
        password: password,
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      localStorage.setItem('userName', name);
      
      // Save the userId
      saveCurrentUserId(user.id);
      
      console.log('User registered in database with ID:', user.id);
      
      navigate('/login', { 
        state: { 
          message: 'Account successfully created! Please log in.',
          registeredName: name 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create account. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { 
      label: 'Full Name', 
      type: 'text', 
      value: name, 
      onChange: setName, 
      placeholder: 'Enter your name' 
    },
    { 
      label: 'Email', 
      type: 'email', 
      value: email, 
      onChange: setEmail, 
      placeholder: 'Enter your email' 
    },
    { 
      label: 'Password', 
      type: 'password', 
      value: password, 
      onChange: setPassword, 
      placeholder: 'Create a password' 
    }
  ];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        
        {error && (
          <div className="error-message" style={{ 
            color: '#e74c3c', 
            marginBottom: '1rem', 
            padding: '0.5rem',
            backgroundColor: '#fee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {fields.map((field, i) => (
            <div key={i} className="form-group">
              <label className="form-label">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          ))}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <span className="auth-text">Already have an account? </span>
          <button 
            onClick={() => navigate('/login')} 
            className="link-button"
            disabled={loading}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;