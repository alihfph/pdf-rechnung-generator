import { useState } from 'react';
import { checkAppLogin, setAppAuthenticated } from '../lib/appAuth';
import './AppLogin.css';

export default function AppLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (checkAppLogin(username, password)) {
      setAppAuthenticated(true);
      onSuccess();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="app-login">
      <div className="app-login-box">
        <h1>Internal tool</h1>
        <p className="app-login-sub">Sign in to continue</p>
        <p className="app-login-auth">Daawat Restaurant authorised: Partap Singh</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="app-login-error">{error}</p>}
          <button type="submit" className="app-login-btn">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
