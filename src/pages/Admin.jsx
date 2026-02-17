import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import './Admin.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function Admin() {
  const { user, loading: authLoading, isBackendConfigured } = useAuth();
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '' });

  const isAdmin = user?.role === 'admin';

  const loadMenu = () => apiFetch('/menu').then(setMenu).catch(() => setMenu([]));
  const loadOrders = () => apiFetch('/orders').then(setOrders).catch(() => setOrders([]));

  useEffect(() => {
    if (!isBackendConfigured || !user) {
      setLoading(false);
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    Promise.all([loadMenu(), loadOrders()])
      .finally(() => setLoading(false));
  }, [isBackendConfigured, user?.id, isAdmin]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/menu', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          price: parseFloat(form.price) || 0,
          description: form.description.trim() || undefined,
          category: form.category.trim() || undefined,
        }),
      });
      setForm({ name: '', price: '', description: '', category: '' });
      loadMenu();
    } catch (err) {
      setError(err.message || 'Failed to add');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError('');
    try {
      await apiFetch(`/menu/${editingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name.trim(),
          price: parseFloat(editForm.price) || 0,
        }),
      });
      setEditingId(null);
      loadMenu();
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    setError('');
    try {
      await apiFetch(`/menu/${id}`, { method: 'DELETE' });
      loadMenu();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setError('');
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (!isBackendConfigured) {
    return (
      <div className="admin-page">
        <div className="admin-msg admin-msg-setup">
          <p><strong>Backend not configured</strong></p>
          <p>Create a <code>.env</code> in the project root with <code>VITE_API_URL=http://localhost:3001</code>, then start the backend (<code>cd backend && npm run start:dev</code>) and restart the frontend.</p>
        </div>
        <Link to="/">Home</Link>
      </div>
    );
  }

  if (authLoading || (user && !isAdmin && loading)) {
    return <div className="admin-page"><p className="admin-msg">Loading…</p></div>;
  }

  if (!user) {
    return (
      <div className="admin-page">
        <p className="admin-msg">Please log in to access Admin.</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <p className="admin-msg">Access denied. Admin only.</p>
        <Link to="/">Home</Link> · <Link to="/order">Order food</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin</h1>
        <nav className="admin-nav">
          <Link to="/">Home</Link>
          <span> · </span>
          <Link to="/order">Order (Customer)</Link>
        </nav>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <section className="admin-section">
        <h2>Menu</h2>
        <form className="admin-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Price (€)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <button type="submit">Add item</button>
        </form>

        <ul className="admin-menu-list">
          {menu.map((item) => (
            <li key={item.id} className="admin-menu-item">
              {editingId === item.id ? (
                <form className="admin-edit-form" onSubmit={handleUpdate}>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <span className="admin-menu-name">{item.name}</span>
                  <span className="admin-menu-price">{item.price.toFixed(2)} €</span>
                  <button type="button" className="admin-btn-edit" onClick={() => {
                    setEditingId(item.id);
                    setEditForm({ name: item.name, price: String(item.price) });
                  }}>Edit</button>
                  <button type="button" className="admin-btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
        {menu.length === 0 && !loading && <p className="admin-empty">No menu items yet. Add one above.</p>}
      </section>

      <section className="admin-section">
        <h2>Orders</h2>
        <div className="admin-orders">
          {orders.length === 0 && !loading && <p className="admin-empty">No orders yet.</p>}
          {orders.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div className="admin-order-head">
                <span>#{order.id.slice(0, 8)}</span>
                <span>{order.customerEmail}</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <ul className="admin-order-items">
                {order.items.map((i, idx) => (
                  <li key={idx}>{i.name} × {i.quantity} — {(i.price * i.quantity).toFixed(2)} €</li>
                ))}
              </ul>
              <div className="admin-order-footer">
                <strong>Total: {order.total.toFixed(2)} €</strong>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
