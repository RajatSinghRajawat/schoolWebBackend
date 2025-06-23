require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const cors = require('cors');
const path = require('path');

const app = express();


// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/otp', otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/competitions', competitionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Student Onboarding API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 