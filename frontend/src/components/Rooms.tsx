import { useEffect, useState } from 'react';
import { api, Room } from '../api';

const statusColors: Record<Room['status'], string> = {
  available: 'status-available',
  occupied: 'status-occupied',
  maintenance: 'status-maintenance',
};

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = () => {
    setLoading(true);
    api.getRooms().then(setRooms).finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, []);

  const handleStatusChange = async (id: number, status: Room['status']) => {
    await api.updateRoom(id, status);
    loadRooms();
  };

  if (loading) return <div className="loading">Loading rooms...</div>;

  return (
    <div className="rooms">
      <h2>Rooms</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Price/night</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td><strong>{room.number}</strong></td>
                <td>{room.type}</td>
                <td>${room.price}</td>
                <td>{room.capacity} guests</td>
                <td>
                  <span className={`badge ${statusColors[room.status]}`}>
                    {room.status}
                  </span>
                </td>
                <td>
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.id, e.target.value as Room['status'])}
                    className="status-select"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
