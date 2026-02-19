import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Renders children only if user is admin; otherwise redirects to home. */
export default function AdminRoute({ children }) {
  const { user, loading, isBackendConfigured } = useAuth();

  if (!isBackendConfigured) return null;
  if (loading) return <div className="app">Loading…</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
