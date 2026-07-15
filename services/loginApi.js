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

module.exports = { request, getMe, logout, LoginApiError };
