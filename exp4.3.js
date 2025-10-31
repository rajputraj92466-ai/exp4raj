const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize 10 seats as available
let seats = {};
for (let i = 1; i <= 10; i++) {
  seats[i] = { status: 'available', lockTime: null };
}

// Endpoint 1: Get all seat statuses
app.get('/seats', (req, res) => {
  res.json(seats);
});

// Endpoint 2: Lock a seat temporarily
app.post('/lock/:id', (req, res) => {
  const seatId = req.params.id;
  const seat = seats[seatId];

  if (!seat) {
    return res.status(404).json({ message: "Seat not found." });
  }

  // If already booked
  if (seat.status === 'booked') {
    return res.status(400).json({ message: `Seat ${seatId} is already booked.` });
  }

  // If locked and not expired
  if (seat.status === 'locked') {
    const now = Date.now();
    if (now - seat.lockTime < 60 * 1000) { // 1 minute
      return res.status(400).json({ message: `Seat ${seatId} is already locked by another user.` });
    } else {
      // Expired lock — release it
      seat.status = 'available';
      seat.lockTime = null;
    }
  }

  // Lock the seat
  seat.status = 'locked';
  seat.lockTime = Date.now();

  // Auto-unlock after 1 minute
  setTimeout(() => {
    if (seat.status === 'locked' && Date.now() - seat.lockTime >= 60 * 1000) {
      seat.status = 'available';
      seat.lockTime = null;
      console.log(`Seat ${seatId} automatically unlocked after 1 minute.`);
    }
  }, 60 * 1000);

  res.json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

// Endpoint 3: Confirm a booking
app.post('/confirm/:id', (req, res) => {
  const seatId = req.params.id;
  const seat = seats[seatId];

  if (!seat) {
    return res.status(404).json({ message: "Seat not found." });
  }

  // Check if seat is locked and within valid time
  if (seat.status !== 'locked') {
    return res.status(400).json({ message: `Seat ${seatId} is not locked and cannot be booked.` });
  }

  const now = Date.now();
  if (now - seat.lockTime > 60 * 1000) {
    // Lock expired
    seat.status = 'available';
    seat.lockTime = null;
    return res.status(400).json({ message: `Lock expired. Please lock seat ${seatId} again.` });
  }

  // Confirm booking
  seat.status = 'booked';
  seat.lockTime = null;

  res.json({ message: `Seat ${seatId} booked successfully!` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🎟️ Ticket Booking API running at http://localhost:${PORT}`);
});
