import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Rooms } from './components/Rooms';
import { Guests } from './components/Guests';
import { Bookings } from './components/Bookings';
import './App.css';

type Tab = 'dashboard' | 'rooms' | 'guests' | 'bookings';

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'guests', label: 'Guests' },
  { id: 'bookings', label: 'Bookings' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">🏨</span>
          <h1>HOTEL</h1>
          <span className="subtitle">Management System</span>
        </div>
        <nav className="nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'rooms' && <Rooms />}
        {activeTab === 'guests' && <Guests />}
        {activeTab === 'bookings' && <Bookings />}
      </main>
    </div>
  );
}

export default App;
