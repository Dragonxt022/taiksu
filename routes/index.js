const express = require('express');
const router = express.Router();

router.use(require('./homeRoutes'));
router.use(require('./authRoutes'));
router.use(require('./healthRoutes'));
router.use('/api/v1/users', require('./userRoutes'));

module.exports = router;
