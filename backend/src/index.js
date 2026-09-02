import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function nightsBetween(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stats', (_req, res) => {
  const totalRooms = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  const availableRooms = db
    .prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'")
    .get().count;
  const activeBookings = db
    .prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'")
    .get().count;
  const totalGuests = db.prepare('SELECT COUNT(*) as count FROM guests').get().count;
  const revenue = db
    .prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status != 'cancelled'")
    .get().total;

  res.json({ totalRooms, availableRooms, activeBookings, totalGuests, revenue });
});

app.get('/api/rooms', (_req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY number').all();
  res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

app.patch('/api/rooms/:id', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'occupied', 'maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const result = db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Room not found' });
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  res.json(room);
});

app.get('/api/guests', (_req, res) => {
  const guests = db.prepare('SELECT * FROM guests ORDER BY created_at DESC').all();
  res.json(guests);
});

app.post('/api/guests', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const result = db
    .prepare('INSERT INTO guests (name, email, phone) VALUES (?, ?, ?)')
    .run(name, email, phone || null);
  const guest = db.prepare('SELECT * FROM guests WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(guest);
});

app.get('/api/bookings', (_req, res) => {
  const bookings = db
    .prepare(`
      SELECT b.*, r.number as room_number, r.type as room_type,
             g.name as guest_name, g.email as guest_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN guests g ON b.guest_id = g.id
      ORDER BY b.check_in DESC
    `)
    .all();
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { room_id, guest_id, check_in, check_out } = req.body;
  if (!room_id || !guest_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'room_id, guest_id, check_in, and check_out are required' });
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.status !== 'available') {
    return res.status(400).json({ error: 'Room is not available' });
  }

  const guest = db.prepare('SELECT * FROM guests WHERE id = ?').get(guest_id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });

  const nights = nightsBetween(check_in, check_out);
  const total_price = nights * room.price;

  const createBooking = db.transaction(() => {
    const result = db
      .prepare(
        'INSERT INTO bookings (room_id, guest_id, check_in, check_out, total_price) VALUES (?, ?, ?, ?, ?)'
      )
      .run(room_id, guest_id, check_in, check_out, total_price);
    db.prepare("UPDATE rooms SET status = 'occupied' WHERE id = ?").run(room_id);
    return result.lastInsertRowid;
  });

  const bookingId = createBooking();
  const booking = db
    .prepare(`
      SELECT b.*, r.number as room_number, r.type as room_type,
             g.name as guest_name, g.email as guest_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN guests g ON b.guest_id = g.id
      WHERE b.id = ?
    `)
    .get(bookingId);

  res.status(201).json(booking);
});

app.patch('/api/bookings/:id', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'checked_out', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const updateBooking = db.transaction(() => {
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    if (status === 'checked_out' || status === 'cancelled') {
      db.prepare("UPDATE rooms SET status = 'available' WHERE id = ?").run(booking.room_id);
    }
  });

  updateBooking();

  const updated = db
    .prepare(`
      SELECT b.*, r.number as room_number, r.type as room_type,
             g.name as guest_name, g.email as guest_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN guests g ON b.guest_id = g.id
      WHERE b.id = ?
    `)
    .get(req.params.id);

  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Hotel API running on http://localhost:${PORT}`);
});
