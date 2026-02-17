import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="app">
      <header className="header">
        <h1>PDF Rechnung Generator</h1>
        <p>Erstellen Sie Rechnungen als PDF.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/generate-pdf" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
            PDF erzeugen
          </Link>
          <Link to="/roster" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#2c5282' }}>
            Dienstplan / Roster
          </Link>
          <Link to="/daawat-restaurant" className="btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#c45c26' }}>
            Daawat Restaurant
          </Link>
        </div>
      </header>
    </div>
  );
}
