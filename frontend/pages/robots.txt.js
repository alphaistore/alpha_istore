import siteConfig from '../config';

export async function getServerSideProps({ res }) {
  const baseUrl = siteConfig.frontendUrl || 'https://www.alphaistoregh.com';
  const robots = `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /api/
Disallow: /checkout
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(robots);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
