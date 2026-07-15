const authService = require('../services/authService');
const loginApi = require('../services/loginApi');

async function callback(req, res) {
  const token = req.query.token; // Pega o Token da Query String URL
  if (!token) return res.status(400).send('Token não informado');

  try {
    await authService.loginWithToken(req.session, token);
    res.redirect('/');
  } catch (err) {
    if (err instanceof loginApi.LoginApiError && err.status === 401) {
      console.error('Erro SSO:', err.message);
      return res.status(401).send('Token inválido ou expirado');
    }
    console.error('Erro ao validar token:', err);
    res.status(500).send('Erro interno ao validar token');
  }
}

async function logout(req, res) {
  try {
    await authService.logout(req.session);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao destruir sessão:', err);
    res.status(500).json({ success: false });
  }
}

module.exports = { callback, logout };
