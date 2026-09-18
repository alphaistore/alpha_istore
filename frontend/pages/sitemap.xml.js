import siteConfig from '../config';

const BASE_URL = siteConfig.frontendUrl || 'https://www.alphaistoregh.com';
const staticPages = [
  '',
  '/shop',
  '/about',
  '/contact',
  '/track',
  '/cart',
  '/checkout',
  '/terms',
  '/privacy',
];

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const resolveApiUrl = () => {
  const endpoint = siteConfig.apiEndpoint || 'https://alpha-istore-kkbk.onrender.com/api';
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  if (endpoint.startsWith('/')) return `${BASE_URL}${endpoint}`;
  return `${BASE_URL}/${endpoint}`;
};

export async function getServerSideProps({ res }) {
  const urls = [...staticPages];

  try {
    const apiUrl = resolveApiUrl();
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/products?limit=200`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const payload = await response.json();
      const products = Array.isArray(payload?.products) ? payload.products : Array.isArray(payload) ? payload : [];
      products.forEach((product) => {
        const slug = product?.slug || product?._id || product?.id;
        if (slug) urls.push(`/product/${encodeURIComponent(String(slug))}`);
      });
    }
  } catch (error) {
    console.warn('Sitemap product generation failed:', error.message || error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .filter(Boolean)
    .map((path) => {
      const url = `${BASE_URL}${path}`;
      return `  <url><loc>${escapeXml(url)}</loc></url>`;
    })
    .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SitemapXml() {
  return null;
}
