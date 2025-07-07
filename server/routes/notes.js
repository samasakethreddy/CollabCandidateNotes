const express = require('express');
const auth = require('../middleware/auth');
const { createNote, getNotes } = require('../controllers/noteController');

module.exports = (io) => {
  const router = express.Router();
  router.post('/:candidateId', auth, (req, res) => createNote(req, res, io));
  router.get('/:candidateId', auth, getNotes);
  return router;
};
