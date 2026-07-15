const getExpressVersion = () => {
  try {
    const pkg = require('express/package.json');
    return pkg.version;
  } catch {
    return 'unknown';
  }
};

function index(req, res) {
  res.render('index', {
    title: 'Taiksu - Perfil',
    expressVersion: getExpressVersion(),
  });
}

module.exports = { index };
