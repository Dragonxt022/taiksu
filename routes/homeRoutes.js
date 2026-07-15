const express = require('express');
const router = express.Router();

const { sessaoData } = require('../middlewares');
const homeController = require('../controllers/homeController');

router.get('/', sessaoData, homeController.index);
router.get('/editar', sessaoData, homeController.editar);

module.exports = router;
