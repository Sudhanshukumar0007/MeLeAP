const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// GET /leads — all leads, newest first
router.get('/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /test-lead — create a fake lead with a guaranteed unique metaLeadId
router.post('/test-lead', async (req, res) => {
  try {
    const metaLeadId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const lead = await Lead.create({
      metaLeadId,
      name: 'Test User',
      email: 'test@example.com',
      phone: '+910000000000',
      status: 'NEW',
    });

    // Emit real-time event to all connected socket clients
    const io = req.app.get('io');
    if (io) {
      io.emit('newLead', lead);
    }

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
