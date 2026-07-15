const express = require('express');
const router = express.Router();

router.use(require('./homeRoutes'));
router.use(require('./authRoutes'));
router.use(require('./healthRoutes'));

module.exports = router;
