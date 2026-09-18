// scripts/generate-sitemap.js
// Run this before every build to create an up-to-date public/sitemap.xml.
//
// Pulls from the real, existing GET /api/tests endpoint — there is no
// /tests/all-slugs or /sellers/all-slugs endpoint on the backend, and no
// public seller profile pages exist in the app, so neither is referenced
// here. URLs match the real routing added to the frontend: /tests/:id/:slug
// (the id drives the lookup; the slug is a decorative, keyword-rich suffix).

import fs from 'fs';

const API_BASE = process.env.VITE_API_BASE || 'https://testmandiserver-production.up.railway.app';
const SITE_URL = 'https://testmandi.in';

// Mirrors the frontend's slugify() in testmandi.jsx — keep these two in sync
// if that function ever changes, since a sitemap URL that doesn't match what
// the app itself generates is just a broken link waiting to happen.
function slugify(title) {
  return (title || 'test')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'test';
}

async function generateSitemap() {
  let tests = [];

  try {
    const res = await fetch(`${API_BASE}/api/tests`);
    const data = res.ok ? await res.json() : { tests: [] };
    tests = data.tests || [];
  } catch (err) {
    console.error('Could not fetch tests for sitemap:', err.message);
  }

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
  ];

  const testUrls = tests.map((t) => ({
    loc: `${SITE_URL}/tests/${t.id}/${slugify(t.title)}`,
    lastmod: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : undefined,
    priority: '0.8',
  }));

  const allUrls = [...staticUrls, ...testUrls];

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
  console.log(`Sitemap written with ${allUrls.length} URLs (${testUrls.length} tests).`);
}

generateSitemap();
