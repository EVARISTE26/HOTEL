// Type definitions
export type Room = {
  id: number;
  number: string;
  type: string;
  price: number;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
};

export type Guest = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type Booking = {
  id: number;
  room_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  status: 'confirmed' | 'checked_out' | 'cancelled';
  total_price: number;
  created_at: string;
  room_number?: string;
  room_type?: string;
  guest_name?: string;
  guest_email?: string;
};

export type Stats = {
  totalRooms: number;
  availableRooms: number;
  activeBookings: number;
  totalGuests: number;
  revenue: number;
};

// Helper function
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// API object
export const api = {
  getStats: () => request<Stats>('/api/stats'),
  getRooms: () => request<Room[]>('/api/rooms'),
  updateRoom: (id: number, status: Room['status']) =>
    request<Room>(`/api/rooms/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getGuests: () => request<Guest[]>('/api/guests'),
  createGuest: (data: { name: string; email: string; phone?: string }) =>
    request<Guest>('/api/guests', { method: 'POST', body: JSON.stringify(data) }),
  getBookings: () => request<Booking[]>('/api/bookings'),
  createBooking: (data: { room_id: number; guest_id: number; check_in: string; check_out: string }) =>
    request<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id: number, status: Booking['status']) =>
    request<Booking>(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
