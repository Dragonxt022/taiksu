const express = require('express');
const router = express.Router();

const getExpressVersion = () => {
  try {
    const pkg = require('express/package.json');
    return pkg.version;
  } catch {
    return 'unknown';
  }
};

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'TAIKSU - Perfil',
    expressVersion: getExpressVersion(),
  });
});

module.exports = router;