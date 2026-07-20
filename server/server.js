require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes-app';

// Allow the frontend app to call the backend.
app.use(cors());

// Read JSON request bodies.
app.use(express.json());

// Simple health check route.
app.get('/', (req, res) => {
  res.json({ message: 'Notes API is running' });
});

// Register the authentication and notes routes.
app.use('/', authRoutes);
app.use('/', noteRoutes);

// Connect to MongoDB and start the server.
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
