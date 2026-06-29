export const AUTH_CHANGE_EVENT = 'viettravel:auth-changed';

const readJson = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const emitAuthChange = (reason = 'updated') => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, {
    detail: {
      reason,
      token: getToken(),
      user: getUser(),
      adminToken: getAdminToken(),
      adminUser: getAdminUser(),
    },
  }));
};

export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
export const getUser = () => readJson('user');
export const ADMIN_ROLES = ['admin', 'staff'];
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const setAuth = (token, user, options = {}) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  if (!options.silent) emitAuthChange('login');
};
export const clearAuth = (options = {}) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (!options.silent) emitAuthChange('logout');
};

export const getAdminToken = () => (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null);
export const getAdminUser = () => readJson('adminUser');
export const setAdminAuth = (token, user, options = {}) => {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(user));
  if (!options.silent) emitAuthChange('admin-login');
};
export const clearAdminAuth = (options = {}) => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  if (!options.silent) emitAuthChange('admin-logout');
};

export const applyAuthSession = (token, user) => {
  setAuth(token, user, { silent: true });
  if (isAdminRole(user?.Role)) {
    setAdminAuth(token, user, { silent: true });
  } else {
    clearAdminAuth({ silent: true });
  }
  emitAuthChange('session-applied');
};
