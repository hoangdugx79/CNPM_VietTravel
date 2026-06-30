const config = require('../src/config');

export async function getServerSideProps({ res }) {
  const siteUrl = config.siteUrl.replace(/\/$/, '');
  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(body);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
