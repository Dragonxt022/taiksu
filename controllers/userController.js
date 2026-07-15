const profileService = require('../services/profileService');
const loginApi = require('../services/loginApi');

function handleLoginApiError(res, err, fallbackMessage) {
  if (err instanceof loginApi.LoginApiError) {
    let body = null;
    try { body = JSON.parse(err.message); } catch { /* resposta não-JSON */ }

    const codes = { 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN' };
    return res.status(err.status).json({
      error: {
        code: codes[err.status] || 'VALIDATION_ERROR',
        message: (body && (body.message || body.error)) || fallbackMessage,
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

/* POST /api/v1/users/me/avatar (multipart, campo "avatar") */
async function updateAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Envie uma imagem no campo "avatar".',
        fields: { avatar: 'Arquivo obrigatório' },
      },
    });
  }

  try {
    const result = await profileService.updateAvatar(req.session, req.file);
    res.json({ avatarUrl: result.avatarUrl });
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao atualizar a foto de perfil.');
  }
}

/* PATCH /api/v1/users/me/unidade */
async function updateUnidade(req, res) {
  const { unidade_id } = req.body || {};
  if (!unidade_id) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Informe a unidade.', fields: { unidade_id: 'Obrigatório' } },
    });
  }

  try {
    const result = await profileService.updateUnidade(req.session, unidade_id);
    res.json(result);
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao trocar de unidade.');
  }
}

/* PATCH /api/v1/users/me/cargo */
async function updateRole(req, res) {
  const { role_id } = req.body || {};
  if (!role_id) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Informe o cargo.', fields: { role_id: 'Obrigatório' } },
    });
  }

  try {
    const result = await profileService.updateRole(req.session, role_id);
    res.json(result);
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao trocar de cargo.');
  }
}

/* POST /api/v1/users/me/permissions/toggle */
async function togglePermission(req, res) {
  const { permission } = req.body || {};
  if (!permission) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Informe a permissão.', fields: { permission: 'Obrigatório' } },
    });
  }

  try {
    const result = await profileService.togglePermission(req.session, permission);
    res.json({ status: result.status });
  } catch (err) {
    handleLoginApiError(res, err, 'Erro ao alterar a permissão.');
  }
}

module.exports = { me, updateMe, changePassword, regeneratePin, updateAvatar, updateUnidade, updateRole, togglePermission };
