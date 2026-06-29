import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthModalProvider } from '../components/auth/AuthModalProvider';
import SmoothScroll from '../components/SmoothScroll';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark-theme');
    }
  }, []);

  useEffect(() => {
    if (router.pathname.startsWith('/admin') && router.pathname !== '/admin/login') {
      const link = document.getElementById('admin-css');
      if (!link) {
        const el = document.createElement('link');
        el.id = 'admin-css';
        el.rel = 'stylesheet';
        el.href = '/css/admin.css';
        document.head.appendChild(el);
      }
    }
  }, [router.pathname]);

  return (
    <AuthModalProvider>
      <SmoothScroll />
      <Component {...pageProps} />
    </AuthModalProvider>
  );
}
