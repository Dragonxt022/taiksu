const loginApi = require('./loginApi');

// Campos que o usuário pode editar no próprio perfil.
const EDITABLE_FIELDS = ['name', 'email', 'telefone', 'cpf', 'data_nascimento'];

function pickEditableFields(body) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

async function getProfile(session) {
  return loginApi.getMe(session.token);
}

async function updateProfile(session, body) {
  const data = pickEditableFields(body);
  const result = await loginApi.updateMe(session.token, data);

  // Mantém a sessão em sincronia com o que foi salvo no SSO.
  if (result && result.user) {
    session.name = result.user.name;
    if (session.user) Object.assign(session.user, result.user);
    await new Promise((resolve, reject) =>
      session.save(err => err ? reject(err) : resolve())
    );
  }

  return result;
}

async function regeneratePin(session) {
  const result = await loginApi.regeneratePin(session.token);

  if (result && result.pin && session.user) {
    session.user.pin = result.pin;
    await new Promise((resolve, reject) =>
      session.save(err => err ? reject(err) : resolve())
    );
  }

  return result;
}

async function changePassword(session, novaSenha) {
  return loginApi.changePassword(session.token, novaSenha);
}

async function updateAvatar(session, file) {
  const result = await loginApi.uploadPhoto(session.token, file);

  if (result && result.avatarUrl) {
    session.foto = result.avatarUrl;
    if (session.user) session.user.foto = result.avatarUrl;
    await new Promise((resolve, reject) =>
      session.save(err => err ? reject(err) : resolve())
    );
  }

  return result;
}

async function updateUnidade(session, unidadeId) {
  const result = await loginApi.updateUnidade(session.token, unidadeId);

  if (result && result.unidade) {
    session.unidade_id = result.unidade.id;
    session.cidade = result.unidade.cidade;
    session.estado = result.unidade.estado;
    if (session.user) session.user.unidade = result.unidade;
    await new Promise((resolve, reject) =>
      session.save(err => err ? reject(err) : resolve())
    );
  }

  return result;
}

async function updateRole(session, roleId) {
  const result = await loginApi.updateRole(session.token, roleId);

  if (result && result.role) {
    session.grupo_id = result.role.id;
    if (session.user) {
      session.user.grupo_id = result.role.id;
      session.user.grupo_nome = result.role.name;
    }
    await new Promise((resolve, reject) =>
      session.save(err => err ? reject(err) : resolve())
    );
  }

  return result;
}

function getUnidades(session) {
  return loginApi.getUnidades(session.token);
}

function getRoles(session) {
  return loginApi.getRoles(session.token);
}

function getPermissions(session) {
  return loginApi.getPermissions(session.token);
}

function togglePermission(session, permissionName) {
  return loginApi.togglePermission(session.token, permissionName);
}

module.exports = {
  getProfile, updateProfile, regeneratePin, changePassword,
  updateAvatar, updateUnidade, updateRole, getUnidades, getRoles,
  getPermissions, togglePermission,
  pickEditableFields,
};
