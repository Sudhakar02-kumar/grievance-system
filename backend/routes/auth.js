const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Student = require('../models/Student');
const router  = express.Router();

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashed });
    res.status(201).json({ message: 'Registered successfully', id: student._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: student._id, name: student.name, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, student: { id: student._id, name: student.name, email: student.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;