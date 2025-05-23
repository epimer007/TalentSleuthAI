const express = require('express');
const router = express.Router();
const { searchLinkedInProfile } = require('../services/serpService');

router.post('/enrich', async (req, res) => {
  const { fullName, location } = req.body;

  if (!fullName) return res.status(400).json({ error: 'fullName is required' });

  const linkedInData = await searchLinkedInProfile(fullName, location || '');

  res.json({ linkedIn: linkedInData });
});

module.exports = router;
