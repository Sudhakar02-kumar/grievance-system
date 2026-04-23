const express   = require('express');
const Grievance = require('../models/Grievance');
const protect   = require('../middleware/auth');
const router    = express.Router();

// All routes below are protected
router.use(protect);

// POST /api/grievances
router.post('/', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const g = await Grievance.create({ studentId: req.student.id, title, description, category });
    res.status(201).json(g);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/grievances/search?title=xyz  (must be before /:id)
router.get('/search', async (req, res) => {
  try {
    const { title } = req.query;
    const results = await Grievance.find({
      studentId: req.student.id,
      title: { $regex: title, $options: 'i' }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/grievances
router.get('/', async (req, res) => {
  try {
    const grievances = await Grievance.find({ studentId: req.student.id }).sort({ createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/grievances/:id
router.get('/:id', async (req, res) => {
  try {
    const g = await Grievance.findOne({ _id: req.params.id, studentId: req.student.id });
    if (!g) return res.status(404).json({ message: 'Not found' });
    res.json(g);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/grievances/:id
router.put('/:id', async (req, res) => {
  try {
    const g = await Grievance.findOneAndUpdate(
      { _id: req.params.id, studentId: req.student.id },
      req.body,
      { new: true }
    );
    if (!g) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json(g);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/grievances/:id
router.delete('/:id', async (req, res) => {
  try {
    const g = await Grievance.findOneAndDelete({ _id: req.params.id, studentId: req.student.id });
    if (!g) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;