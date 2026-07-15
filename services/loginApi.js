const BASE_URL = process.env.LOGIN_API_URL || 'https://login.taiksu.com.br';

class LoginApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'LoginApiError';
    this.status = status;
  }
}

async function request(path, token, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new LoginApiError(body || `Login API respondeu ${response.status}`, response.status);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

function getMe(token) {
  return request('/api/user/me', token);
}

function logout(token) {
  return request('/api/logout', token, { method: 'POST' });
}

function updateMe(token, data) {
  return request('/api/user/profile', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

function regeneratePin(token) {
  return request('/api/user/regenerate-pin', token, { method: 'POST' });
}

function changePassword(token, novaSenha) {
  return request('/api/user/change-password', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'nova-senha': novaSenha,
      'nova-senha_confirmation': novaSenha,
    }),
  });
}

// Envia a foto de perfil como multipart/form-data (file vem do multer, em memória).
function uploadPhoto(token, file) {
  const form = new FormData();
  form.append('foto', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  // Sem Content-Type manual: o fetch define o boundary do multipart sozinho.
  return request('/api/user/profile/photo', token, { method: 'POST', body: form });
}

function updateUnidade(token, unidadeId) {
  return request('/api/user/profile/unidade', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unidade_id: unidadeId }),
  });
}

function updateRole(token, roleId) {
  return request('/api/user/profile/role', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId }),
  });
}

function getRoles(token) {
  return request('/api/user/profile/roles', token);
}

function getPermissions(token) {
  return request('/api/user/profile/permissions', token);
}

function togglePermission(token, permissionName) {
  return request('/api/user/profile/toggle-permission', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permission: permissionName }),
  });
}

function getUnidades(token) {
  return request('/api/infor-unidades', token);
}

module.exports = {
  request, getMe, logout, updateMe, regeneratePin, changePassword,
  uploadPhoto, updateUnidade, updateRole, getRoles, getUnidades,
  getPermissions, togglePermission,
  LoginApiError,
};
