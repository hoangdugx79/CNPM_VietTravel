import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AUTH_CHANGE_EVENT, getAdminUser, clearAdminAuth } from '../../lib/auth';
import { toggleDarkMode, syncDarkModeIcons } from '../../lib/theme';

const NAV = [
  { section: 'Tổng quan', items: [{ href: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard', key: 'index' }] },
  { section: 'Quản lý tour', items: [
    { href: '/admin/tours', icon: 'fa-map-marked-alt', label: 'Danh sách tour', key: 'tours' },
    { href: '/admin/departures', icon: 'fa-calendar-alt', label: 'Lịch khởi hành', key: 'departures' },
    { href: '/admin/destinations', icon: 'fa-compass', label: 'Điểm đến', key: 'destinations' },
  ]},
  { section: 'Vận tải', items: [
    { href: '/admin/vehicles', icon: 'fa-bus', label: 'Quản lý xe', key: 'vehicles' },
    { href: '/admin/drivers', icon: 'fa-id-card', label: 'Tài xế', key: 'drivers' },
    { href: '/admin/providers', icon: 'fa-building', label: 'Nhà cung cấp', key: 'providers' },
    { href: '/admin/routes', icon: 'fa-route', label: 'Tuyến đường', key: 'routes' },
  ]},
  { section: 'Kinh doanh', items: [
    { href: '/admin/bookings', icon: 'fa-suitcase', label: 'Quản lý booking', key: 'bookings' },
    { href: '/admin/promotions', icon: 'fa-tag', label: 'Khuyến mãi', key: 'promotions' },
  ]},
  { section: 'Hệ thống', items: [{ href: '/admin/users', icon: 'fa-users', label: 'Người dùng', key: 'users' }] },
];

export default function AdminLayout({ children, title = 'Admin', subtitle }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (router.pathname === '/admin/login') return;
    const syncUser = () => {
      const nextUser = getAdminUser();
      if (!nextUser) {
        setUser(null);
        router.replace('/admin/login');
        return;
      }
      setUser(nextUser);
    };

    syncUser();
    syncDarkModeIcons();
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [router]);

  if (router.pathname === '/admin/login') return children;

  const logout = () => { clearAdminAuth(); router.push('/admin/login'); };

  return (
    <div className="admin-shell">
      <Head>
        <title>{title} - VietTravel Admin</title>
        <link rel="stylesheet" href="/css/admin.css" />
      </Head>
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><img src="/brand-logo-64.png" alt="VietTravel logo" /></div>
          <div><div className="logo-text">VietTravel</div><div className="logo-sub">Admin Panel</div></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((sec) => (
            <div className="nav-section" key={sec.section}>
              <div className="nav-section-title">{sec.section}</div>
              {sec.items.map((item) => (
                <div
                  key={item.href}
                  className={`nav-item ${router.pathname === item.href || (item.key !== 'index' && router.pathname.includes(item.key)) ? 'active' : ''}`}
                  onClick={() => router.push(item.href)}
                  role="button"
                  tabIndex={0}
                >
                  <i className={`fas ${item.icon}`} /> {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{(user?.FullName || 'A')[0].toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.FullName || 'Admin'}</div>
              <div className="user-role">{user?.Role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</div>
            </div>
            <button type="button" className="logout-btn" onClick={logout} title="Đăng xuất"><i className="fas fa-sign-out-alt" /></button>
          </div>
        </div>
      </aside>
      <div className="main-content">
        <header className="admin-header">
          <div className="header-title"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
          <div className="header-actions">
            <button type="button" className="header-btn dark-mode-toggle" onClick={toggleDarkMode} title="Dark mode"><i className="fas fa-moon" /></button>
            <Link href="/" target="_blank" className="btn btn-outline btn-sm"><i className="fas fa-external-link-alt" /> Xem trang web</Link>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </div>
      <div className="toast-container" id="toastContainer" />
    </div>
  );
}
