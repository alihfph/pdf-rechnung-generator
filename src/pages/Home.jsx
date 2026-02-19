import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading, isBackendConfigured } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="app">
      <header className="header">
        <h1>PDF Rechnung Generator</h1>
        <p>
          {!isBackendConfigured && 'Backend nicht konfiguriert.'}
          {isBackendConfigured && !user && 'Willkommen. Besuchen Sie das Restaurant oder bestellen Sie.'}
          {isBackendConfigured && user && !isAdmin && 'Willkommen. Restaurant ansehen oder bestellen.'}
          {isBackendConfigured && isAdmin && 'Admin-Bereich: Restaurant, Dienstplan, PDF, Bestellungen, Admins.'}
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/daawat-restaurant" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#c45c26' }}>
            Daawat Restaurant
          </Link>
          {isBackendConfigured && (
            <Link to="/order" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#059669' }}>
              Bestellen (Menü)
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to="/generate-pdf" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                PDF erzeugen
              </Link>
              <Link to="/roster" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#2c5282' }}>
                Dienstplan / Roster
              </Link>
              <Link to="/admin" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#553c9a' }}>
                Bestellen (Admin)
              </Link>
              <Link to="/admin/admins" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#b45309' }}>
                Admins verwalten
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
