const express = require('express');
const router = express.Router();
const Routine = require('../models/WeeklyRoutine');

// PUT - Save or Update User Routine
router.put('/', async (req, res) => {
  const { userId, routine } = req.body;

  if (!userId || !routine) {
    return res.status(400).json({ message: 'Missing userId or routine data.' });
  }

  try {
    const result = await Routine.findOneAndUpdate(
      { userId },
      { routine },
      { upsert: true, new: true }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Error saving routine:", err);
    res.status(500).json({ message: 'Failed to save routine.', error: err });
  }
});

// GET - Fetch Routine by userId
router.get('/:userId', async (req, res) => {
  try {
    const routine = await Routine.findOne({ userId: req.params.userId });
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found.' });
    }
    res.status(200).json(routine);
  } catch (err) {
    console.error("Error retrieving routine:", err);
    res.status(500).json({ message: 'Failed to retrieve routine.', error: err });
  }
});

module.exports = router;
