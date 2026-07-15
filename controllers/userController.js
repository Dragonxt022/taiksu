const profileService = require('../services/profileService');
const loginApi = require('../services/loginApi');

function handleLoginApiError(res, err, fallbackMessage) {
  if (err instanceof loginApi.LoginApiError) {
    let body = null;
    try { body = JSON.parse(err.message); } catch { /* resposta não-JSON */ }

    return res.status(err.status).json({
      error: {
        code: err.status === 401 ? 'UNAUTHENTICATED' : 'VALIDATION_ERROR',
        message: (body && body.message) || fallbackMessage,
        fields: (body && body.errors) || undefined,
      },
    });
  }

  console.error(fallbackMessage, err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: fallbackMessage },
  });
}

/* GET /api/v1/users/me */
async function me(req, res) {
  try {
    const user = await profileService.getProfile(req.session);
    res.json(user);
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao buscar dados do perfil.');
  }
}

/* PATCH /api/v1/users/me */
async function updateMe(req, res) {
  const data = profileService.pickEditableFields(req.body || {});
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Nenhum campo editável informado.' },
    });
  }

  try {
    const result = await profileService.updateProfile(req.session, req.body);
    res.json(result);
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao atualizar o perfil.');
  }
}

/* PUT /api/v1/users/me/password */
async function changePassword(req, res) {
  const { newPassword, confirmPassword } = req.body || {};

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A nova senha deve ter no mínimo 6 caracteres.',
        fields: { newPassword: 'Mínimo de 6 caracteres' },
      },
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'As senhas não conferem.',
        fields: { confirmPassword: 'As senhas não conferem' },
      },
    });
  }

  try {
    await profileService.changePassword(req.session, newPassword);
    res.status(204).end();
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao alterar a senha.');
  }
}

/* POST /api/v1/users/me/pin/regenerate */
async function regeneratePin(req, res) {
  try {
    const result = await profileService.regeneratePin(req.session);
    res.json({ pin: result.pin });
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao regenerar o PIN.');
  }
}

module.exports = { me, updateMe, changePassword, regeneratePin };
