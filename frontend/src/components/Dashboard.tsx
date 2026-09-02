import { useEffect, useState } from 'react';
import { api } from '../api';

type Stats = {
  totalRooms: number;
  availableRooms: number;
  activeBookings: number;
  totalGuests: number;
  revenue: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="error">Failed to load stats</div>;

  const occupancyRate = stats.totalRooms
    ? Math.round(((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100)
    : 0;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalRooms}</span>
          <span className="stat-label">Total Rooms</span>
        </div>
        <div className="stat-card available">
          <span className="stat-value">{stats.availableRooms}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-card occupied">
          <span className="stat-value">{stats.activeBookings}</span>
          <span className="stat-label">Active Bookings</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalGuests}</span>
          <span className="stat-label">Total Guests</span>
        </div>
        <div className="stat-card revenue">
          <span className="stat-value">${stats.revenue.toLocaleString()}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{occupancyRate}%</span>
          <span className="stat-label">Occupancy Rate</span>
        </div>
      </div>
    </div>
  );
}
