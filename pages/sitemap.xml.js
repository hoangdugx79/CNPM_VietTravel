const config = require('../src/config');

function buildUrlXml(url, lastmod, changefreq = 'weekly', priority = '0.7') {
  return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function getServerSideProps({ res }) {
  const { connectDB, disconnectDB } = require('../src/db');
  const { Tour, Destination } = require('../src/models');
  const siteUrl = config.siteUrl.replace(/\/$/, '');
  const today = new Date().toISOString();

  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/tours', changefreq: 'daily', priority: '0.9' },
    { path: '/login', changefreq: 'monthly', priority: '0.4' },
    { path: '/register', changefreq: 'monthly', priority: '0.4' },
    { path: '/my-bookings', changefreq: 'weekly', priority: '0.4' },
  ];

  await connectDB();
  const [tours, destinations] = await Promise.all([
    Tour.find({ status: 'active' }, 'slug updatedAt').lean(),
    Destination.find({ status: 'active' }, 'slug updatedAt').lean(),
  ]);
  await disconnectDB();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map((route) => buildUrlXml(`${siteUrl}${route.path}`, today, route.changefreq, route.priority)).join('')}
${tours.map((tour) => buildUrlXml(`${siteUrl}/tours/${tour.slug}`, new Date(tour.updatedAt || Date.now()).toISOString(), 'weekly', '0.8')).join('')}
${destinations.map((destination) => buildUrlXml(`${siteUrl}/tours?destination=${destination.slug}`, new Date(destination.updatedAt || Date.now()).toISOString(), 'weekly', '0.6')).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
