import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { toWebpUrl, preloadImage } from '../../lib/media';
import {
  getArcRadius,
  getDiscStep,
  slotOffset,
  getShortestStepDelta,
} from '../../lib/heroArc';
import { getHeroDestIntro } from '../../lib/heroDestinations';

const HERO_BG = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&q=75&fm=webp';
const AUTO_MS = 5500;
const SNAP_MS = 420;

export default function HeroSection({ tours = [], loading = false }) {
  const router = useRouter();
  const heroRef = useRef(null);
  const snapTimer = useRef(null);
  const transitionLock = useRef(false);
  const activeIndexRef = useRef(0);
  const pendingIndexRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [orbitIndex, setOrbitIndex] = useState(0);
  const [discRotation, setDiscRotation] = useState(0);
  const [snapTransition, setSnapTransition] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [arcRadius, setArcRadius] = useState(220);
  const [bgLayers, setBgLayers] = useState([
    { url: HERO_BG, visible: true },
    { url: HERO_BG, visible: false },
  ]);

  const carouselTours = useMemo(() => tours.slice(0, 5), [tours]);
  const count = carouselTours.length;
  const discStep = getDiscStep(count);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setArcRadius(getArcRadius(window.innerWidth)), 120);
    };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setPageVisible(document.visibilityState === 'visible');
    };

    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => () => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    setOrbitIndex(0);
    setDiscRotation(0);
    setSnapTransition(false);
    activeIndexRef.current = 0;
    pendingIndexRef.current = null;
    transitionLock.current = false;
    if (snapTimer.current) clearTimeout(snapTimer.current);
  }, [count]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const rotateBy = useCallback((delta, instant = false) => {
    if (!delta) return;
    setDiscRotation((r) => r - delta * discStep);
    if (instant && !reduceMotion) {
      setSnapTransition(true);
      if (snapTimer.current) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => setSnapTransition(false), SNAP_MS);
    }
  }, [discStep, reduceMotion]);

  const moveTo = useCallback((target, { instant = false } = {}) => {
    if (!count || transitionLock.current) return;

    const current = activeIndexRef.current;
    const normalizedTarget = ((target % count) + count) % count;
    if (current === normalizedTarget) return;

    transitionLock.current = true;
    pendingIndexRef.current = normalizedTarget;
    activeIndexRef.current = normalizedTarget;
    setActiveIndex(normalizedTarget);

    const delta = getShortestStepDelta(current, normalizedTarget, count);
    rotateBy(delta, instant);

    if (reduceMotion) {
      setOrbitIndex(normalizedTarget);
      pendingIndexRef.current = null;
      transitionLock.current = false;
    }
  }, [count, reduceMotion, rotateBy]);

  const handleRingTransitionEnd = useCallback((event) => {
    if (event.propertyName !== 'transform') return;
    const pendingIndex = pendingIndexRef.current;
    if (pendingIndex === null) return;

    setOrbitIndex(pendingIndex);
    pendingIndexRef.current = null;
    transitionLock.current = false;
  }, []);

  const next = useCallback(() => {
    if (!count) return;
    moveTo(activeIndexRef.current + 1, { instant: false });
  }, [count, moveTo]);

  const prev = useCallback(() => {
    if (!count) return;
    moveTo(activeIndexRef.current - 1, { instant: false });
  }, [count, moveTo]);

  useEffect(() => {
    if (count <= 1 || reduceMotion || !inView || !pageVisible) return undefined;
    const timer = setInterval(() => {
      next();
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [count, next, reduceMotion, inView, pageVisible]);

  const activeTour = carouselTours[activeIndex] || tours[activeIndex];
  const destIntro = useMemo(() => getHeroDestIntro(activeTour), [activeTour]);

  const heroBgUrl = useMemo(
    () => toWebpUrl(activeTour?.MainImageUrl || HERO_BG, 'full'),
    [activeTour?.MainImageUrl],
  );

  useEffect(() => {
    let cancelled = false;
    preloadImage(heroBgUrl).then(() => {
      if (cancelled) return;
      setBgLayers((prev) => {
        const visibleIdx = prev.findIndex((layer) => layer.visible);
        if (visibleIdx >= 0 && prev[visibleIdx].url === heroBgUrl) return prev;

        const nextIdx = visibleIdx === 0 ? 1 : 0;
        return prev.map((layer, i) => ({
          url: i === nextIdx ? heroBgUrl : layer.url,
          visible: i === nextIdx,
        }));
      });
    });
    return () => { cancelled = true; };
  }, [heroBgUrl]);

  useEffect(() => {
    if (!count) return;
    preloadImage(toWebpUrl(carouselTours[(activeIndex + 1) % count]?.MainImageUrl, 'full'));
  }, [activeIndex, carouselTours, count]);

  const search = () => {
    const dest = document.getElementById('searchDestination')?.value;
    const dur = document.getElementById('searchDuration')?.value;
    const params = new URLSearchParams();
    if (dest) params.set('search', dest);
    if (dur) params.set('duration', dur);
    router.push(`/tours?${params.toString()}`);
  };

  const labelText = activeTour
    ? `${activeTour.Title}${activeTour.DestinationNames ? `, ${activeTour.DestinationNames}` : ''}`
    : 'Khám phá Việt Nam';

  const featuredCardSrc = toWebpUrl(activeTour?.MainImageUrl, 'card')
    || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=240&q=75&fm=webp';
  const dotCount = count || Math.min(tours.length, 6);

  return (
    <section
      ref={heroRef}
      className={`hero hero-v2${reduceMotion ? ' hero-reduced-motion' : ''}`}
      id="hero"
    >
      <div className="hero-bg">
        {bgLayers.map((layer, i) => (
          <img
            key={i}
            src={layer.url}
            alt=""
            className={`hero-bg-img${layer.visible ? ' is-visible' : ''}`}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="hero-inner">
        <div className="hero-content-box">
          <div className="hero-badge">
            <i className="fas fa-star" /> Hơn 500+ tour chất lượng cao
          </div>
          <h1 className="hero-title">
            Khám Phá Việt Nam
            <span className="hero-title-accent">Tuyệt Vời Cùng VietTravel</span>
          </h1>
          <p className="hero-subtitle">
            Trải nghiệm hành trình đáng nhớ với dịch vụ tour du lịch chuyên nghiệp.
          </p>

          <div className="hero-search-box search-box">
            <div className="search-group">
              <label><i className="fas fa-map-marker-alt" /> Điểm đến</label>
              <input type="text" id="searchDestination" placeholder="Bạn muốn đi đâu?" />
            </div>
            <div className="search-group">
              <label><i className="fas fa-calendar-alt" /> Thời gian</label>
              <select id="searchDuration">
                <option value="">Tất cả</option>
                <option value="1-3">1 - 3 ngày</option>
                <option value="4-7">4 - 7 ngày</option>
                <option value="8+">Trên 8 ngày</option>
              </select>
            </div>
            <button type="button" className="btn-search hero-explore-btn" onClick={search}>
              Tìm kiếm <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="hero-disc"
        aria-label="Tour nổi bật"
        style={{ '--disc-radius': `${arcRadius}px` }}
      >
        {loading ? (
          <div className="hero-disc-loader"><div className="loader" /></div>
        ) : count ? (
          <>
            <div className="hero-disc-slot">
              <div className="hero-dest-intro" key={activeIndex} aria-live="polite">
                <p className="hero-dest-eyebrow">Điểm đến nổi bật</p>
                <h2 className="hero-dest-name">{destIntro.name}</h2>
                <p className="hero-dest-desc">{destIntro.text}</p>
              </div>

              <div className="hero-disc-featured" aria-label={activeTour?.Title || 'Tour nổi bật'}>
                <span className="hero-disc-card-frame">
                  <img src={featuredCardSrc} alt={activeTour?.Title || 'Tour nổi bật'} decoding="async" loading="eager" width={240} height={320} />
                </span>
              </div>
            </div>

            <div
              className={`hero-disc-ring${snapTransition ? ' is-snapping' : ''}`}
              style={{ transform: `rotate(${discRotation}deg)` }}
              onTransitionEnd={handleRingTransitionEnd}
            >
              {carouselTours.map((tour, i) => {
                const slot = slotOffset(i, orbitIndex, count);
                const isBack = count > 2 && slot === Math.floor(count / 2);
                const isHidden = i === activeIndex;
                const cardCounter = -(discRotation + (i * discStep));
                const cardSrc = toWebpUrl(tour.MainImageUrl, 'card')
                  || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=240&q=75&fm=webp';

                return (
                  <div
                    key={tour.TourId}
                    className="hero-disc-orbit"
                    style={{ transform: `rotate(${i * discStep}deg) translateX(calc(-1 * var(--disc-radius)))` }}
                  >
                    <button
                      type="button"
                      className={`hero-disc-card is-orbit${isBack ? ' is-back' : ''}${isHidden ? ' is-hidden' : ''}`}
                      style={{
                        transform: `rotate(${cardCounter}deg)`,
                        zIndex: isHidden ? 5 : count - slot,
                      }}
                      onClick={() => moveTo(i, { instant: true })}
                      aria-label={tour.Title}
                    >
                      <span className="hero-disc-card-frame">
                        <img src={cardSrc} alt={tour.Title} decoding="async" loading="lazy" width={240} height={320} />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {!loading && tours.length > 0 && (
        <div className="hero-bottom-nav">
          <p className="hero-tour-label">
            <i className="fas fa-gem" /> {labelText}
          </p>
          {count > 1 && (
            <>
              <div className="hero-nav-controls">
                <button type="button" className="hero-nav-btn" onClick={prev} aria-label="Tour trước">
                  <i className="fas fa-chevron-left" />
                </button>
                <button type="button" className="hero-nav-btn" onClick={next} aria-label="Tour tiếp">
                  <i className="fas fa-chevron-right" />
                </button>
              </div>
              <div className="hero-dots">
                {Array.from({ length: dotCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`hero-dot${i === activeIndex ? ' active' : ''}`}
                    onClick={() => moveTo(i, { instant: true })}
                    aria-label={`Tour ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
