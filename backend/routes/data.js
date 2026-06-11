const express = require('express');
const BusinessData = require('../models/BusinessData');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/data — Load all business data for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    let data = await BusinessData.findOne({ user: req.user._id });
    if (!data) {
      // Create default data if none exists
      data = await BusinessData.create({ user: req.user._id });
    }
    res.json(data);
  } catch (error) {
    console.error('Data load error:', error);
    res.status(500).json({ message: 'Failed to load data' });
  }
});

// PUT /api/data — Save all business data (full replace)
router.put('/', protect, async (req, res) => {
  try {
    const { cfg, ue, op, pay, biz } = req.body;
    const update = {};
    if (cfg !== undefined) update.cfg = cfg;
    if (ue !== undefined) update.ue = ue;
    if (op !== undefined) update.op = op;
    if (pay !== undefined) update.pay = pay;
    if (biz !== undefined) update.biz = biz;

    const data = await BusinessData.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, runValidators: false }
    );
    res.json({ message: 'Saved', updatedAt: data.updatedAt });
  } catch (error) {
    console.error('Data save error:', error);
    res.status(500).json({ message: 'Failed to save data' });
  }
});

// PATCH /api/data/:section — Save a single section (cfg, ue, op, pay, biz)
router.patch('/:section', protect, async (req, res) => {
  try {
    const { section } = req.params;
    const validSections = ['cfg', 'ue', 'op', 'pay', 'biz'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: 'Invalid section: ' + section });
    }

    const update = { [section]: req.body };
    const data = await BusinessData.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, runValidators: false }
    );
    res.json({ message: 'Saved ' + section, updatedAt: data.updatedAt });
  } catch (error) {
    console.error('Section save error:', error);
    res.status(500).json({ message: 'Failed to save ' + req.params.section });
  }
});

// DELETE /api/data — Reset all data to defaults
router.delete('/', protect, async (req, res) => {
  try {
    await BusinessData.findOneAndDelete({ user: req.user._id });
    const data = await BusinessData.create({ user: req.user._id });
    res.json({ message: 'Reset complete', data });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Failed to reset data' });
  }
});

module.exports = router;
