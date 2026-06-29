/** Chuyển URL upload sang WebP; variant card = ảnh nhỏ cho thumbnail hero */
export function toWebpUrl(url, variant = 'full') {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http')) return url;

  const cleaned = url.split('?')[0];
  const m = cleaned.match(/^(\/uploads\/[^/]+?)(?:-card)?\.(png|jpe?g|webp)$/i);
  if (!m) return url;

  const base = m[1];
  const isNumericHero = /\/uploads\/\d+$/.test(base);

  if (variant === 'card' && isNumericHero) {
    return `${base}-card.webp`;
  }
  return `${base}.webp`;
}

export function preloadImage(src) {
  if (!src || typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(src);
    img.onerror = () => resolve(src);
    img.src = src;
  });
}
