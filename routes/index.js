// routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');
const content = require('../data/content.json');

router.get('/api/content', (req, res) => {
  res.json(content);
});

router.get('/api/example/:id', (req, res) => {
  const example = content.cards.find(card => card.id === req.params.id);
  if (example) {
    res.json(example);
  } else {
    res.status(404).json({ error: 'Example not found' });
  }
});

router.get('/example/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/detail.html'));
});

module.exports = router;
