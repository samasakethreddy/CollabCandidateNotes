const express = require('express');
const router = express.Router();
const { createCandidate, getCandidates } = require('../controllers/candidateController');
const auth = require('../middleware/auth');

router.post('/', auth, createCandidate);
router.get('/', auth, getCandidates);

module.exports = router;