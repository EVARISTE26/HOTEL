import { FormEvent, useEffect, useState } from 'react';
import { api, Booking, Guest, Room } from '../api';

const statusColors: Record<Booking['status'], string> = {
  confirmed: 'status-confirmed',
  checked_out: 'status-checked-out',
  cancelled: 'status-cancelled',
};

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ room_id: '', guest_id: '', check_in: '', check_out: '' });
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getBookings(), api.getRooms(), api.getGuests()])
      .then(([b, r, g]) => {
        setBookings(b);
        setRooms(r);
        setGuests(g);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const availableRooms = rooms.filter((r) => r.status === 'available');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createBooking({
        room_id: Number(form.room_id),
        guest_id: Number(form.guest_id),
        check_in: form.check_in,
        check_out: form.check_out,
      });
      setForm({ room_id: '', guest_id: '', check_in: '', check_out: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  const handleStatusChange = async (id: number, status: Booking['status']) => {
    await api.updateBooking(id, status);
    loadData();
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="bookings">
      <div className="section-header">
        <h2>Bookings</h2>
        <button className="btn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Booking'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>New Booking</h3>
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <label>
              Room
              <select
                required
                value={form.room_id}
                onChange={(e) => setForm({ ...form, room_id: e.target.value })}
              >
                <option value="">Select room</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.number} — {r.type} (${r.price}/night)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Guest
              <select
                required
                value={form.guest_id}
                onChange={(e) => setForm({ ...form, guest_id: e.target.value })}
              >
                <option value="">Select guest</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
            <label>
              Check-in
              <input
                required
                type="date"
                value={form.check_in}
                onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              />
            </label>
            <label>
              Check-out
              <input
                required
                type="date"
                value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value })}
              />
            </label>
          </div>
          <button type="submit" className="btn primary">Create Booking</button>
        </form>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className="empty">No bookings yet.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.guest_name}</strong>
                    <br /><small>{b.guest_email}</small>
                  </td>
                  <td>{b.room_number} ({b.room_type})</td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td>${b.total_price}</td>
                  <td>
                    <span className={`badge ${statusColors[b.status]}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.status === 'confirmed' && (
                      <div className="action-buttons">
                        <button
                          className="btn small"
                          onClick={() => handleStatusChange(b.id, 'checked_out')}
                        >
                          Check Out
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
