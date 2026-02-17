import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthBar.css';

export default function AuthBar() {
  const { user, login, register, logout, isBackendConfigured } = useAuth();
  const [showForm, setShowForm] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isBackendConfigured) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (showForm === 'login') await login(email, password);
      else await register(email, password);
      setShowForm(null);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err?.message || 'Failed');
    }
  };

  if (user) {
    return (
      <div className="auth-bar">
        <Link to="/order" className="auth-bar-link">Bestellen</Link>
        {user.role === 'admin' && (
          <Link to="/admin" className="auth-bar-link">Admin</Link>
        )}
        <span className="auth-bar-user">{user.email}</span>
        <button type="button" className="auth-bar-btn" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="auth-bar auth-bar-form">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="auth-bar-error">{error}</p>}
          <div className="auth-bar-form-btns">
            <button type="submit">{showForm === 'login' ? 'Login' : 'Register'}</button>
            <button type="button" onClick={() => { setShowForm(null); setError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      <button type="button" className="auth-bar-btn" onClick={() => setShowForm('login')}>
        Login
      </button>
      <button type="button" className="auth-bar-btn auth-bar-btn-primary" onClick={() => setShowForm('register')}>
        Register
      </button>
    </div>
  );
}
