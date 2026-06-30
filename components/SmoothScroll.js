import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Lenis from 'lenis';

export default function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (router.pathname.startsWith('/admin')) return undefined;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
    });

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
    };
  }, [router.pathname]);

  return null;
}
