const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/Note');

const router = express.Router();

// Middleware to protect routes using JWT.
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (error, decoded) => {
    if (error) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.userId = decoded.id;
    next();
  });
}

// Get all notes for the logged-in user.
router.get('/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note for the logged-in user.
router.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const note = await Note.create({ title, description, userId: req.userId });
    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note if it belongs to the logged-in user.
router.put('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.title = title;
    note.description = description;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note if it belongs to the logged-in user.
router.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
