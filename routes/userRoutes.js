const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middlewares');
const userController = require('../controllers/userController');

router.get('/me', requireAuth, userController.me);
router.patch('/me', requireAuth, userController.updateMe);
router.put('/me/password', requireAuth, userController.changePassword);
router.post('/me/pin/regenerate', requireAuth, userController.regeneratePin);

module.exports = router;
