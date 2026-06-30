import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { apiRequest } from '../../lib/api';
import { applyAuthSession, getAdminToken, getToken, getUser, isAdminRole } from '../../lib/auth';
import { requestGoogleAuthCode } from '../../lib/googleAuth';
import { useToast } from '../Toast';

const AuthModalContext = createContext(null);

function AuthModal({ isOpen, mode, adminOnly, redirectPath, onClose, onOpen }) {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError('');
    }
  }, [isOpen]);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');

      const code = await requestGoogleAuthCode();
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/google';
      const { ok, data } = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      if (!ok) {
        setError(data.message || 'Không thể đăng nhập bằng Google.');
        setLoading(false);
        return;
      }

      if (adminOnly && !isAdminRole(data.user?.Role)) {
        setError('Tài khoản này không có quyền quản trị.');
        setLoading(false);
        return;
      }

      applyAuthSession(data.token, data.user);
      showToast(mode === 'register' ? 'Đăng ký bằng Google thành công.' : 'Đăng nhập bằng Google thành công.', 'success');
      onClose();
      router.push(adminOnly ? '/admin' : (redirectPath || '/'));
    } catch (err) {
      setError(err.message || 'Đăng nhập Google thất bại.');
      setLoading(false);
    }
  };

  if (!isOpen) {
    return <ToastContainer />;
  }

  return (
    <>
      <div className="auth-modal-backdrop" onClick={onClose} />
      <div className="auth-modal-shell" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Đóng">
          <i className="fas fa-times" />
        </button>

        <div className="auth-modal-panel auth-modal-form">
          <div className="auth-modal-brand">
            <img src="/brand-logo-40.png" alt="VietTravel logo" />
            <span>VietTravel</span>
          </div>

          <div className="auth-modal-copy">
            <h2 id="auth-modal-title">
              {adminOnly ? 'Đăng nhập hệ thống quản trị' : mode === 'register' ? 'Đăng ký tài khoản bằng Google' : 'Đăng nhập vào tài khoản của bạn'}
            </h2>
            <p>
              {adminOnly
                ? 'Sử dụng email Google đã được gán quyền admin hoặc staff trong hệ thống.'
                : 'Hệ thống hiện chỉ hỗ trợ đăng nhập và đăng ký bằng Google để liên kết tài khoản nhanh và đồng bộ quyền tự động.'}
            </p>
          </div>

          <button type="button" className="auth-google-btn" onClick={handleGoogleAuth} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            <span>{loading ? 'Đang xử lý...' : adminOnly ? 'Tiếp tục với Google (Admin)' : 'Tiếp tục với Google'}</span>
          </button>

          {error ? <p className="auth-modal-error">{error}</p> : null}

          <div className="auth-modal-divider"><span>Xác thực chỉ bằng Google</span></div>

          <div className="auth-modal-helper">
            {adminOnly ? (
              <p>
                Muốn vào khu khách hàng? <button type="button" onClick={() => onOpen({ mode: 'login', adminOnly: false, redirectPath: '/' })}>Đăng nhập người dùng</button>
              </p>
            ) : (
              <p>
                Cần vào khu quản trị? <button type="button" onClick={() => onOpen({ mode: 'login', adminOnly: true, redirectPath: '/admin' })}>Đăng nhập admin</button>
              </p>
            )}
          </div>
        </div>

        <div className="auth-modal-panel auth-modal-visual">
          <img src="/uploads/login.webp" alt="Đăng nhập VietTravel" className="auth-modal-image" />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export function AuthModalProvider({ children }) {
  const router = useRouter();
  const [state, setState] = useState({
    isOpen: false,
    mode: 'login',
    adminOnly: false,
    redirectPath: '/',
  });

  const openAuthModal = useCallback(({ mode = 'login', adminOnly = false, redirectPath } = {}) => {
    setState({
      isOpen: true,
      mode,
      adminOnly,
      redirectPath: redirectPath || (typeof router.query.redirect === 'string' ? router.query.redirect : '/'),
    });
  }, [router.query.redirect]);

  const closeAuthModal = useCallback(() => {
    setState((current) => ({ ...current, isOpen: false }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handler = (event) => openAuthModal(event.detail || {});
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, [openAuthModal]);

  const value = useMemo(() => ({ openAuthModal, closeAuthModal }), [closeAuthModal, openAuthModal]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={state.isOpen}
        mode={state.mode}
        adminOnly={state.adminOnly}
        redirectPath={state.redirectPath}
        onClose={closeAuthModal}
        onOpen={openAuthModal}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal phải được dùng trong AuthModalProvider.');
  }
  return context;
}

export function AuthRouteLauncher({ mode = 'login', adminOnly = false, fallbackPath = '/' }) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const token = adminOnly ? getAdminToken() : getToken();
    const user = getUser();

    if (token && (!adminOnly || isAdminRole(user?.Role))) {
      router.replace(adminOnly ? '/admin' : fallbackPath);
      return;
    }

    openAuthModal({
      mode,
      adminOnly,
      redirectPath: typeof router.query.redirect === 'string' ? router.query.redirect : (adminOnly ? '/admin' : fallbackPath),
    });
  }, [adminOnly, fallbackPath, mode, openAuthModal, router]);

  return <div className="auth-route-placeholder" />;
}
