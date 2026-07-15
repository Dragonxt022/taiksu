const loginApi = require('./loginApi');

async function fetchCurrentUser(token) {
  return loginApi.getMe(token);
}

function mapUserToLocals(userData) {
  return {
    userFoto: userData.foto || null,
    userNome: userData.name || null,
    userEmail: userData.email || null,
    userGrupo: userData.grupo_id || null,
    userCargo: userData.grupo_nome || null,
    userCidade: userData.unidade ? userData.unidade.cidade : null,
    user_id: userData.id || null,
    unidade_id: userData.unidade ? userData.unidade.id : null,
    userPin: userData.pin || null,
  };
}

async function loginWithToken(session, token) {
  const userData = await fetchCurrentUser(token);

  session.user = userData;
  session.id_user = userData.id;
  session.name = userData.name;
  session.foto = userData.foto;
  session.unidade_id = userData.unidade ? userData.unidade.id : null;
  session.cidade = userData.unidade ? userData.unidade.cidade : null;
  session.estado = userData.unidade ? userData.unidade.estado : null;
  session.grupo_id = userData.grupo_id;
  session.token = token;

  await new Promise((resolve, reject) =>
    session.save(err => err ? reject(err) : resolve())
  );

  return userData;
}

async function logout(session) {
  const token = session.token;
  if (token) {
    await loginApi.logout(token).catch(() => {});
  }

  await new Promise((resolve, reject) =>
    session.destroy(err => err ? reject(err) : resolve())
  );
}

module.exports = { fetchCurrentUser, mapUserToLocals, loginWithToken, logout };
