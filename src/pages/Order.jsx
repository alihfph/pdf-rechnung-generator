import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import './Order.css';

export default function Order() {
  const { user, loading: authLoading, isBackendConfigured } = useAuth();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (!isBackendConfigured) {
      setLoading(false);
      return;
    }
    apiFetch('/menu')
      .then(setMenu)
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, [isBackendConfigured]);

  useEffect(() => {
    if (!isBackendConfigured || !user) return;
    apiFetch('/orders/mine')
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [isBackendConfigured, user?.id, orderSuccess]);

  const addToCart = (item, qty = 1) => {
    const existing = cart.find((c) => c.menuId === item.id);
    if (existing) {
      setCart(cart.map((c) => c.menuId === item.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { menuId: item.id, name: item.name, price: item.price, quantity: qty }]);
    }
  };

  const updateQty = (menuId, delta) => {
    setCart(cart.map((c) => {
      if (c.menuId !== menuId) return c;
      const q = c.quantity + delta;
      return q <= 0 ? null : { ...c, quantity: q };
    }).filter(Boolean));
  };

  const removeFromCart = (menuId) => {
    setCart(cart.filter((c) => c.menuId !== menuId));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !user) return;
    setError('');
    setOrderSuccess(null);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((i) => ({
            menuId: i.menuId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      setCart([]);
      setOrderSuccess(true);
    } catch (err) {
      setError(err.message || 'Order failed');
    }
  };

  if (!isBackendConfigured) {
    return (
      <div className="order-page">
        <div className="order-msg order-msg-setup">
          <p><strong>Backend not configured</strong></p>
          <p>To order food, run the backend and set the API URL:</p>
          <ol>
            <li>In the project root, create a file <code>.env</code> (or edit it) and add:<br />
              <code>VITE_API_URL=http://localhost:3001</code>
            </li>
            <li>Start the backend: <code>cd backend && npm run start:dev</code></li>
            <li>Restart the frontend dev server (e.g. <code>npm run dev</code>) so it picks up <code>.env</code>.</li>
          </ol>
          <p>Then reload this page. Login/Register will appear in the top bar.</p>
        </div>
        <Link to="/">Home</Link>
      </div>
    );
  }

  return (
    <div className="order-page">
      <header className="order-header">
        <h1>Bestellen</h1>
        <nav className="order-nav">
          <Link to="/">Home</Link>
          {user?.role === 'admin' && (
            <>
              <span> · </span>
              <Link to="/admin">Admin</Link>
            </>
          )}
        </nav>
      </header>

      {error && <p className="order-error">{error}</p>}
      {orderSuccess && <p className="order-success">Order placed successfully.</p>}

      {loading ? (
        <p className="order-msg">Loading menu…</p>
      ) : (
        <>
          <section className="order-section">
            <h2>Menü</h2>
            <ul className="order-menu-list">
              {menu.map((item) => (
                <li key={item.id} className="order-menu-item">
                  <div className="order-menu-info">
                    <span className="order-menu-name">{item.name}</span>
                    {item.description && <span className="order-menu-desc">{item.description}</span>}
                    <span className="order-menu-price">{item.price.toFixed(2)} €</span>
                  </div>
                  <button
                    type="button"
                    className="order-btn-add"
                    onClick={() => addToCart(item)}
                  >
                    + Add
                  </button>
                </li>
              ))}
            </ul>
            {menu.length === 0 && <p className="order-empty">No items on the menu yet.</p>}
          </section>

          <section className="order-section order-cart">
            <h2>Warenkorb</h2>
            {cart.length === 0 ? (
              <p className="order-empty">Cart is empty.</p>
            ) : (
              <>
                <ul className="order-cart-list">
                  {cart.map((i) => (
                    <li key={i.menuId} className="order-cart-item">
                      <span className="order-cart-name">{i.name}</span>
                      <span className="order-cart-qty">
                        <button type="button" onClick={() => updateQty(i.menuId, -1)}>−</button>
                        <span>{i.quantity}</span>
                        <button type="button" onClick={() => updateQty(i.menuId, 1)}>+</button>
                      </span>
                      <span className="order-cart-price">{(i.price * i.quantity).toFixed(2)} €</span>
                      <button type="button" className="order-cart-remove" onClick={() => removeFromCart(i.menuId)}>×</button>
                    </li>
                  ))}
                </ul>
                <p className="order-cart-total">Total: <strong>{cartTotal.toFixed(2)} €</strong></p>
                {user ? (
                  <button type="button" className="order-btn-submit" onClick={handlePlaceOrder}>
                    Order now
                  </button>
                ) : (
                  <p className="order-login-hint">Please <Link to="/">log in</Link> to place an order.</p>
                )}
              </>
            )}
          </section>

          {user && orders.length > 0 && (
            <section className="order-section">
              <h2>My orders</h2>
              <ul className="order-my-orders">
                {orders.slice(0, 10).map((o) => (
                  <li key={o.id} className="order-my-order">
                    <span className="order-my-order-id">#{o.id.slice(0, 8)}</span>
                    <span>{o.items.length} item(s)</span>
                    <span>{o.total.toFixed(2)} €</span>
                    <span className={`order-status order-status-${o.status}`}>{o.status}</span>
                    <span className="order-my-order-date">{new Date(o.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
