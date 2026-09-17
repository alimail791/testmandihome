// scripts/generate-sitemap.js
// Run this before every build to create an up-to-date public/sitemap.xml

import fs from 'fs';

const API_BASE = process.env.VITE_API_BASE || 'https://testmandiserver-production.up.railway.app';
const SITE_URL = 'https://testmandi.in';

async function generateSitemap() {
  let testSlugs = [];
  let sellerSlugs = [];

  try {
    const testsRes = await fetch(`${API_BASE}/tests/all-slugs`);
    testSlugs = testsRes.ok ? await testsRes.json() : [];
  } catch (err) {
    console.error('Could not fetch test slugs:', err.message);
  }

  try {
    const sellersRes = await fetch(`${API_BASE}/sellers/all-slugs`);
    sellerSlugs = sellersRes.ok ? await sellersRes.json() : [];
  } catch (err) {
    console.error('Could not fetch seller slugs:', err.message);
  }

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
  ];

  const testUrls = testSlugs.map((t) => ({
    loc: `${SITE_URL}/tests/${t.slug}`,
    lastmod: t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : undefined,
    priority: '0.8',
  }));

  const sellerUrls = sellerSlugs.map((s) => ({
    loc: `${SITE_URL}/sellers/${s.slug}`,
    lastmod: s.updatedAt ? new Date(s.updatedAt).toISOString().split('T')[0] : undefined,
    priority: '0.6',
  }));

  const allUrls = [...staticUrls, ...testUrls, ...sellerUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.writeFileSync('public/sitemap.xml', xml);
  console.log(`Sitemap written with ${allUrls.length} URLs.`);
}

generateSitemap();
