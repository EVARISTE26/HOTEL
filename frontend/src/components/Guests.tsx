import { FormEvent, useEffect, useState } from 'react';
import { api, Guest } from '../api';

export function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const loadGuests = () => {
    setLoading(true);
    api.getGuests().then(setGuests).finally(() => setLoading(false));
  };

  useEffect(() => { loadGuests(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createGuest(form);
      setForm({ name: '', email: '', phone: '' });
      setShowForm(false);
      loadGuests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guest');
    }
  };

  if (loading) return <div className="loading">Loading guests...</div>;

  return (
    <div className="guests">
      <div className="section-header">
        <h2>Guests</h2>
        <button className="btn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Guest'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Guest</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555-0100"
              />
            </label>
          </div>
          <button type="submit" className="btn primary">Save Guest</button>
        </form>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr><td colSpan={4} className="empty">No guests yet. Add one to get started.</td></tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest.id}>
                  <td><strong>{guest.name}</strong></td>
                  <td>{guest.email}</td>
                  <td>{guest.phone || '—'}</td>
                  <td>{new Date(guest.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
