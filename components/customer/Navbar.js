import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AUTH_CHANGE_EVENT, clearAuth, getUser } from '../../lib/auth';
import { useAuthModal } from '../auth/AuthModalProvider';
import { syncDarkModeIcons, toggleDarkMode } from '../../lib/theme';

export default function Navbar({ scrolled = false }) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(scrolled);

  useEffect(() => {
    const syncUser = () => {
      const nextUser = getUser();
      setUser(nextUser);
      if (!nextUser) setDropdownOpen(false);
    };

    syncUser();
    syncDarkModeIcons();
    const onScroll = () => setIsScrolled(window.scrollY > 50 || scrolled);
    const onAuthChange = () => syncUser();
    const onStorage = (event) => {
      if (!event.key || ['user', 'token'].includes(event.key)) syncUser();
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    window.addEventListener('storage', onStorage);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [scrolled]);

  const logout = () => {
    clearAuth();
    router.push('/');
  };

  const isActive = (path) => router.pathname === path;

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container">
        <Link href="/" className="navbar-brand">
          <img src="/brand-logo-40.png" alt="VietTravel logo" />
          <span>VietTravel</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`} id="navLinks">
          <li><Link href="/" className={isActive('/') ? 'active' : ''}><i className="fas fa-home" /> Trang chủ</Link></li>
          <li><Link href="/tours" className={isActive('/tours') || router.pathname.startsWith('/tours/') ? 'active' : ''}><i className="fas fa-map-marked-alt" /> Tours</Link></li>
          <li><a href="/#destinations"><i className="fas fa-compass" /> Điểm đến</a></li>
          <li><a href="/#contact"><i className="fas fa-envelope" /> Liên hệ</a></li>
        </ul>

        <div className="nav-auth" id="navAuth">
          <button type="button" className="btn btn-outline dark-mode-toggle" onClick={toggleDarkMode} style={{ padding: '8px 12px', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }} title="Giao diện tối/sáng">
            <i className={`fas ${typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>

          {user ? (
            <div className="user-menu" style={{ position: 'relative' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                <i className="fas fa-user-circle" /> {user.FullName?.split(' ').pop()}
              </button>
              {dropdownOpen && (
                <div className="user-dropdown" style={{ display: 'block', position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', borderRadius: 12, minWidth: 200, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 999 }}>
                  <Link href="/my-bookings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#0f172a', borderBottom: '1px solid #f0f0f0' }}><i className="fas fa-suitcase" style={{ color: '#FF6B35' }} /> Booking của tôi</Link>
                  {(user.Role === 'admin' || user.Role === 'staff') && (
                    <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#0f172a', borderBottom: '1px solid #f0f0f0' }}><i className="fas fa-tachometer-alt" style={{ color: '#FF6B35' }} /> Quản trị</Link>
                  )}
                  <button type="button" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}><i className="fas fa-sign-out-alt" /> Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button type="button" className="btn btn-outline" onClick={() => openAuthModal({ mode: 'login', redirectPath: router.asPath })}>Đăng nhập</button>
              <button type="button" className="btn btn-primary" onClick={() => openAuthModal({ mode: 'register', redirectPath: router.asPath })}>Đăng ký</button>
            </>
          )}
        </div>

        <button type="button" className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}><i className="fas fa-bars" /></button>
      </div>
    </nav>
  );
}
