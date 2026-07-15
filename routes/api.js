const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Taiksu API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      health: '/health',
    },
  });
});

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;