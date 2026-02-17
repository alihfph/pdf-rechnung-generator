import { useState, useEffect } from 'react';
import { isAppAuthenticated } from '../lib/appAuth';
import AppLogin from './AppLogin';
import App from '../App';

export default function AppGate() {
  const [authenticated, setAuthenticated] = useState(isAppAuthenticated);

  useEffect(() => {
    setAuthenticated(isAppAuthenticated());
  }, []);

  if (authenticated) {
    return <App />;
  }

  return <AppLogin onSuccess={() => setAuthenticated(true)} />;
}
