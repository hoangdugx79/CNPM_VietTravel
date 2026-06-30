import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Lenis from 'lenis';

function shouldDisableSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  const smallViewport = window.innerWidth <= 1180;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData);
  const slowNetwork = typeof connection?.effectiveType === 'string' && /2g|3g/i.test(connection.effectiveType);
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;

  return prefersReducedMotion || touchDevice || smallViewport || saveData || slowNetwork || lowMemory || lowCpu;
}

export default function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (router.pathname.startsWith('/admin')) return undefined;
    if (shouldDisableSmoothScroll()) {
      document.documentElement.classList.add('lenis-disabled');
      return () => {
        document.documentElement.classList.remove('lenis-disabled');
      };
    }

    const lenis = new Lenis({
      duration: 0.95,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1,
      syncTouch: false,
    });

    window.__lenis = lenis;
    const emitScroll = (event) => {
      window.dispatchEvent(new CustomEvent('lenis:scroll', {
        detail: {
          scroll: event.scroll,
          velocity: event.velocity,
          progress: event.progress,
        },
      }));
    };
    lenis.on('scroll', emitScroll);

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-disabled');
      delete window.__lenis;
      lenis.destroy();
    };
  }, [router.pathname]);

  return null;
}
