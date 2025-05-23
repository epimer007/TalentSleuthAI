const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const { uploadResume } = require('../controllers/resumeController');

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), uploadResume);

module.exports = router;
