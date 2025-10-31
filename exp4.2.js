// Import Express
const express = require('express');
const app = express();

// Middleware to parse JSON body
app.use(express.json());

// In-memory card collection
let cards = [
  { id: 1, suit: "Hearts", value: "A" },
  { id: 2, suit: "Spades", value: "K" },
  { id: 3, suit: "Diamonds", value: "10" }
];

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Playing Card Collection API');
});

// GET all cards
app.get('/cards', (req, res) => {
  res.json(cards);
});

// GET a specific card by ID
app.get('/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id);
  const card = cards.find(c => c.id === cardId);

  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }
  res.json(card);
});

// POST (Add a new card)
app.post('/cards', (req, res) => {
  const { suit, value } = req.body;

  if (!suit || !value) {
    return res.status(400).json({ message: "Suit and value are required" });
  }

  const newCard = {
    id: cards.length > 0 ? cards[cards.length - 1].id + 1 : 1,
    suit,
    value
  };

  cards.push(newCard);
  res.status(201).json({ message: "Card added successfully", card: newCard });
});

// DELETE a card by ID
app.delete('/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id);
  const index = cards.findIndex(c => c.id === cardId);

  if (index === -1) {
    return res.status(404).json({ message: "Card not found" });
  }

  const removed = cards.splice(index, 1)[0];
  res.json({ message: "Card deleted successfully", card: removed });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
