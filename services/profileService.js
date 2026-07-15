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

module.exports = { getProfile, updateProfile, regeneratePin, changePassword, pickEditableFields };
