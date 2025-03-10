require('dotenv').config();
const express = require('express');
const cors = require('cors'); // useful when your frontend and backend are hosted on different domains or ports during dev or prod
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Create Express App
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Basic route for testing
app.get('/', (req, res) => {
    res.sendStatus('API Running');
});

// Error Handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ', PORT));