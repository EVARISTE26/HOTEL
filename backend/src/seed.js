import db from './db.js';

const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
if (roomCount > 0) {
  console.log('Database already seeded.');
  process.exit(0);
}

const insertRoom = db.prepare(
  'INSERT INTO rooms (number, type, price, capacity, status) VALUES (?, ?, ?, ?, ?)'
);

const rooms = [
  ['101', 'Standard', 89, 2, 'available'],
  ['102', 'Standard', 89, 2, 'available'],
  ['201', 'Deluxe', 149, 2, 'available'],
  ['202', 'Deluxe', 149, 2, 'available'],
  ['301', 'Suite', 249, 4, 'available'],
  ['302', 'Suite', 249, 4, 'available'],
  ['401', 'Presidential', 499, 6, 'available'],
];

const seedRooms = db.transaction(() => {
  for (const room of rooms) {
    insertRoom.run(...room);
  }
});

seedRooms();
console.log(`Seeded ${rooms.length} rooms.`);
