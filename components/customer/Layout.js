import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';
import { useToast } from '../Toast';

const SITE_NAME = 'VietTravel';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://viettravel.brandgens.com';
const DEFAULT_DESCRIPTION = 'VietTravel mang đến tour du lịch trọn gói tại Việt Nam với lịch trình tinh gọn, dịch vụ rõ ràng và trải nghiệm đặt tour nhanh trên mọi thiết bị.';
const DEFAULT_IMAGE = '/brand-logo-512.png';

function toAbsoluteUrl(input) {
  if (!input) return `${SITE_URL}${DEFAULT_IMAGE}`;
  if (/^https?:\/\//i.test(input)) return input;
  return new URL(input.startsWith('/') ? input : `/${input}`, SITE_URL).toString();
}

function getImageType(input) {
  if (!input) return 'image/png';
  if (/\.webp(?:$|\?)/i.test(input)) return 'image/webp';
  if (/\.jpe?g(?:$|\?)/i.test(input)) return 'image/jpeg';
  if (/\.svg(?:$|\?)/i.test(input)) return 'image/svg+xml';
  return 'image/png';
}

export default function CustomerLayout({
  children,
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  navbarScrolled = false,
}) {
  const router = useRouter();
  const { ToastContainer } = useToast();

  const path = router.asPath ? router.asPath.split('#')[0].split('?')[0] : '/';
  const canonical = toAbsoluteUrl(path === '/' ? '/' : path);
  const privateRoute = /^\/(?:my-bookings|bookings)(?:\/|$)/.test(path);
  const robots = noindex || privateRoute ? 'noindex,nofollow' : 'index,follow,max-image-preview:large';
  const fullTitle = title === SITE_NAME ? SITE_NAME : title;
  const seoImage = toAbsoluteUrl(image);
  const seoImageType = getImageType(image);
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: toAbsoluteUrl(DEFAULT_IMAGE),
    sameAs: [SITE_URL],
  };
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/tours?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robots} />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="theme-color" content="#ffffff" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href={canonical} />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:locale" content="vi_VN" />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:type" content={seoImageType} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content={fullTitle} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:image:alt" content={fullTitle} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </Head>
      <Navbar scrolled={navbarScrolled} />
      {children}
      <Footer />
      <ChatWidget />
      <ToastContainer />
    </>
  );
}
