import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import AdminRoute from '../components/AdminRoute';
import './Admin.css';

export default function ManageAdmins() {
  const { user, isBackendConfigured } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadAdmins = () => {
    if (!isAdmin) return;
    apiFetch('/users/admins')
      .then(setAdmins)
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isBackendConfigured || !isAdmin) {
      setLoading(false);
      return;
    }
    loadAdmins();
  }, [isBackendConfigured, isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/users/admins', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setEmail('');
      setPassword('');
      loadAdmins();
    } catch (err) {
      setError(err?.message || 'Fehler beim Anlegen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminRoute>
      <div className="app">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/admin" className="auth-bar-link">← Zurück zu Bestellen (Admin)</Link>
        </div>
        <h1 className="header" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          Admins verwalten
        </h1>
        <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
          Neue Admins anlegen. Nur eingeloggte Admins können diese Seite sehen.
        </p>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>Neuen Admin anlegen</h2>
          <form onSubmit={handleCreate} className="form-container">
            <div>
              <label htmlFor="new-admin-email" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
                E-Mail
              </label>
              <input
                id="new-admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={{ width: '100%', maxWidth: '320px', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label htmlFor="new-admin-password" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
                Passwort (min. 6 Zeichen)
              </label>
              <input
                id="new-admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                style={{ width: '100%', maxWidth: '320px', padding: '0.5rem' }}
              />
            </div>
            {error && <p style={{ color: '#c53030', margin: 0 }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Wird angelegt…' : 'Admin anlegen'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Admins</h2>
          {loading ? (
            <p>Lade…</p>
          ) : admins.length === 0 ? (
            <p style={{ color: '#4a5568' }}>Noch keine Admins (außer Ihnen).</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {admins.map((a) => (
                <li key={a.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <strong>{a.email}</strong>
                  <span style={{ color: '#718096', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                    (angelegt {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '–'})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}
