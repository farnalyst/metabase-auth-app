require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database.js'); // This initializes the database

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors()); // Allow requests from the client
app.use(express.json()); // To parse JSON bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.get('/', (req, res) => {
  res.send("Connected to backend");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));