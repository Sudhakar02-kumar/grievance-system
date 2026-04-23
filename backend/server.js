const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const grievanceRoutes = require('./routes/grievances');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://grievance-frontend-hitn.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/grievances', grievanceRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error(err));