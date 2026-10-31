// Drop-in replacement for `serve -s dist`. Real visitors get the exact same
// SPA, byte for byte. Search/social crawlers (Googlebot, Bingbot, WhatsApp
// link previews, etc.) additionally get real <title>/<meta>/visible content
// for /tests/:id/:slug pages, fetched server-side from the API — no headless
// browser involved, so there's no Chromium/system-dependency risk on deploy.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { renderBlogIndex, renderBlogPost, renderBlogSitemap } from "./blog/render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");
const PORT = process.env.PORT || 8080;

// Same backend the SPA itself talks to (see src/api.js / VITE_API_BASE).
const API_BASE = process.env.VITE_API_BASE || "https://testmandiserver-production.up.railway.app";

const BOT_UA = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|applebot/i;

const TESTMANDI_CONTACT_EMAIL = "info@testmandi.in";

// The one canonical origin, matching sitemap.xml. Don't derive it from the
// request: behind Railway's proxy `req.protocol` is "http", which made every
// canonical/og:url/JSON-LD URL an http:// address that redirects to https —
// a canonical pointing at a redirect, which Google discounts.
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://testmandi.in";

function slugify(title) {
  return (title || "test")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "test";
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// In-memory cache of rendered bot HTML, 6-hour TTL — avoids re-fetching the
// test list from the API on every crawl.
const renderCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
let testsCache = { data: null, fetchedAt: 0 };
const TESTS_TTL_MS = 10 * 60 * 1000; // list refreshes more often than page cache

async function getAllTests() {
  if (testsCache.data && Date.now() - testsCache.fetchedAt < TESTS_TTL_MS) return testsCache.data;
  try {
    const res = await fetch(`${API_BASE}/api/tests`);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const json = await res.json();
    testsCache = { data: json.tests || [], fetchedAt: Date.now() };
  } catch (err) {
    console.error("frontend-server: failed to fetch tests for prerender:", err.message);
    if (!testsCache.data) testsCache.data = [];
  }
  return testsCache.data;
}

let resourcesCache = { data: null, fetchedAt: 0 };
async function getAllResources() {
  if (resourcesCache.data && Date.now() - resourcesCache.fetchedAt < TESTS_TTL_MS) return resourcesCache.data;
  try {
    const res = await fetch(`${API_BASE}/api/resources`);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const json = await res.json();
    resourcesCache = { data: json.resources || [], fetchedAt: Date.now() };
  } catch (err) {
    console.error("frontend-server: failed to fetch resources for prerender:", err.message);
    if (!resourcesCache.data) resourcesCache.data = [];
  }
  return resourcesCache.data;
}

function resourceUrl(r) {
  return `/resources/${r.id}/${slugify(r.title)}`;
}

// Same idea as renderTestPageHtml, for a teaching resource (worksheet, notes…).
function renderResourcePageHtml(template, r, origin, allResources = []) {
  const price = Number(r.price) || 0;
  const facts = [r.resourceType, r.grade, r.subject, r.language, r.pages ? `${r.pages} pages` : null].filter(Boolean).join(" · ");
  const description = `${r.description || r.title} — ${facts}. ${price ? `₹${price}` : "Free"} on TestMandi.`.slice(0, 300);
  const title = `${r.title} — ${price ? `₹${price}` : "Free"} | TestMandi`;
  const url = `${origin}${resourceUrl(r)}`;
  const image = r.hasCover ? `${API_BASE}/api/resources/${r.id}/image/cover` : `${origin}/og-image.png`;

  let html = template;
  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escapeHtml(url)}$2`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escapeHtml(image)}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  if (!/<link rel="canonical"/.test(html)) {
    html = html.replace("</head>", `<link rel="canonical" href="${escapeHtml(url)}" />\n</head>`);
  } else {
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(url)}$2`);
  }
  const related = allResources.filter((x) => x.id !== r.id && (x.subject === r.subject || x.grade === r.grade)).slice(0, 12);
  const crawlableBlock = `
    <div id="prerendered-seo-content">
      <h1>${escapeHtml(r.title)}</h1>
      <p>${escapeHtml(description)}</p>
      ${r.tags?.length ? `<p>Tags: ${r.tags.map(escapeHtml).join(", ")}</p>` : ""}
      ${r.sellerName ? `<p>By ${escapeHtml(r.sellerName)}</p>` : ""}
      ${related.length ? `<nav aria-label="Related resources"><h2>More teaching resources</h2><ul>${related.map((x) => `<li><a href="${escapeHtml(resourceUrl(x))}">${escapeHtml(x.title)}</a></li>`).join("")}</ul></nav>` : ""}
      <p><a href="/">Browse tests and teaching resources on TestMandi</a></p>
    </div>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${crawlableBlock}</div>`);
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: r.title, description, url, image,
    brand: { "@type": "Brand", name: r.sellerName || "TestMandi" },
    offers: { "@type": "Offer", price: String(price), priceCurrency: "INR", availability: "https://schema.org/InStock", url },
    ...(r.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(r.rating || 0).toFixed(1), reviewCount: String(r.ratingCount) } } : {}),
  };
  html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`);
  return html;
}

function baseTemplate() {
  return fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
}

// The public /api/tests endpoint no longer ships the real question bank
// (it strips `questions` to keep correct answers from being scraped — see
// testmandiserver's `publicTest()`); it returns the distinct topic tags and
// question count pre-computed instead, as `test.topics` / `test.questionCount`.
// This is what makes each test page's crawlable content genuinely different
// from the next one, rather than 50 pages that read as the same template
// with the exam name swapped.
function extractTopics(test) {
  return Array.isArray(test.topics) ? test.topics : [];
}

function testUrl(t) {
  return `/tests/${t.id}/${slugify(t.title)}`;
}

// Plain <a href> links crawlers can follow. The SPA's own listing only has
// onClick buttons, so without these Google could reach test pages solely
// through the sitemap — which is why most sat in "Discovered – currently not
// indexed". Same tests a visitor can browse; just expressed as links.
function linkList(tests) {
  return `<ul>${tests.map((t) => `<li><a href="${escapeHtml(testUrl(t))}">${escapeHtml(t.title)}</a></li>`).join("")}</ul>`;
}

function relatedTests(test, allTests, limit = 12) {
  const same = allTests.filter((t) => t.id !== test.id && t.category === test.category);
  // Start right after this test so neighbouring pages link to different sets
  // and every test in a big category gets linked from somewhere.
  const i = allTests.findIndex((t) => t.id === test.id);
  const rotated = [...same.filter((t) => allTests.indexOf(t) > i), ...same.filter((t) => allTests.indexOf(t) < i)];
  return rotated.slice(0, limit);
}

function renderHomeDirectory(allTests) {
  const byCategory = new Map();
  for (const t of allTests) {
    const c = t.category || "Other";
    if (!byCategory.has(c)) byCategory.set(c, []);
    byCategory.get(c).push(t);
  }
  const sections = [...byCategory.entries()]
    .map(([c, list]) => `<section><h2>${escapeHtml(c)} practice tests</h2>${linkList(list)}</section>`)
    .join("");
  return `
    <div id="prerendered-seo-content">
      <h1>TestMandi — MCQ practice tests for NEET, JEE, UPSC, SSC, Banking &amp; more</h1>
      <p>Buy online MCQ practice tests and full mock tests for 30+ Indian competitive exams, with instant score reports and topic-wise breakdowns — or sell your own tests as a teacher or institute.</p>
      <nav aria-label="All tests">${sections}</nav>
      <nav aria-label="More from the TestMandi team">
        <h2>More from our team</h2>
        <ul>
          <li><a href="https://www.classcoach.in/?utm_source=testmandi&amp;utm_medium=home_links">ClassCoach</a> — AI test maker for teachers and coaching institutes: tests in a minute, auto-grading, parent reports on WhatsApp</li>
          <li><a href="https://yneet.in/?utm_source=testmandi&amp;utm_medium=home_links">YNeet</a> — NEET preparation with practice, PYQs and mock tests</li>
          <li><a href="https://vasulbook.com/?utm_source=testmandi&amp;utm_medium=home_links">VasulBook</a> — collect fee and payment dues with automatic reminders</li>
        </ul>
      </nav>
    </div>`;
}

function renderTestPageHtml(template, test, origin, allTests = []) {
  const topics = extractTopics(test);
  const questionCount = test.questionCount ?? test.questions?.length ?? 0;
  const baseDescription = test.description || `Practice test: ${test.title}.`;
  const description = (topics.length
    ? `${baseDescription} Covers ${topics.slice(0, 6).join(", ")}${topics.length > 6 ? " and more" : ""} — ${questionCount} questions, instant score report with topic-wise breakdown on TestMandi.`
    : `${baseDescription} ${questionCount} questions, ${test.duration || "timed"} — instant score report on TestMandi.`
  ).slice(0, 300);
  const title = `${test.title} — TestMandi`;
  const url = `${origin}/tests/${test.id}/${slugify(test.title)}`;
  const image = `${origin}/og-image.png`;

  let html = template;
  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escapeHtml(url)}$2`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escapeHtml(image)}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  if (!/<link rel="canonical"/.test(html)) {
    html = html.replace("</head>", `<link rel="canonical" href="${escapeHtml(url)}" />\n</head>`);
  } else {
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(url)}$2`);
  }

  // Real, crawlable visible content — no test questions/answers included,
  // just the same summary a shopper sees on the card before buying, plus
  // the real topic list pulled from the question bank so each page reads
  // as genuinely distinct content rather than one template with the exam
  // name swapped in.
  const crawlableBlock = `
    <div id="prerendered-seo-content">
      <h1>${escapeHtml(test.title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p>Category: ${escapeHtml(test.category || "General")} · Price: ₹${escapeHtml(test.price)} · Duration: ${escapeHtml(test.duration || "N/A")} minutes · ${escapeHtml(questionCount)} questions</p>
      ${topics.length ? `<p>Topics covered: ${topics.map(escapeHtml).join(", ")}</p>` : ""}
      ${test.sellerName ? `<p>By ${escapeHtml(test.sellerName)}</p>` : ""}
      ${(() => {
        const related = relatedTests(test, allTests);
        return related.length ? `<nav aria-label="Related tests"><h2>More ${escapeHtml(test.category || "")} tests</h2>${linkList(related)}</nav>` : "";
      })()}
      <p><a href="/">Browse all tests on TestMandi</a></p>
    </div>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${crawlableBlock}</div>`);

  // Structured data: a Product (so a price + star rating can show up directly
  // in search results) plus a BreadcrumbList, so this reads as one specific,
  // priced item rather than an undifferentiated page.
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    {
      "@type": "Product",
      name: test.title,
      description,
      url,
      image,
      brand: { "@type": "Brand", name: test.sellerName || "TestMandi" },
      offers: {
        "@type": "Offer",
        price: String(Number(test.price) || 0),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url,
        // Digital good, delivered instantly inside the account — no physical
        // shipment, so handling + transit time are both 0 days and the rate is
        // free. Google's Merchant listing checks want this field present even
        // for a non-shipped digital product.
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
          },
        },
        // A purchased test unlocks access immediately and isn't a returnable
        // good, so the policy is "no returns" rather than a window of days.
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "IN",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        },
      },
      ...(test.ratingCount > 0 ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(test.rating || 0).toFixed(1),
          reviewCount: String(test.ratingCount),
        },
      } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "TestMandi", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: test.category || "Tests", item: `${origin}/` },
        { "@type": "ListItem", position: 3, name: test.title, item: url },
      ],
    },
  ] };
  html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`);

  return html;
}

// Organization + WebSite structured data for the homepage — identifies
// TestMandi itself as an entity to Google, separate from any one test page.
function buildHomeJsonLd(origin) {
  return { "@context": "https://schema.org", "@graph": [
    {
      "@type": "Organization",
      name: "TestMandi",
      url: `${origin}/`,
      description: "India's marketplace for exam-prep MCQ practice tests — NEET, JEE, UPSC, SSC, Banking, GATE and more.",
      email: TESTMANDI_CONTACT_EMAIL,
    },
    {
      "@type": "WebSite",
      name: "TestMandi",
      url: `${origin}/`,
    },
  ] };
}

const app = express();

/* ---------------------------------------------------------------------- */
/* Blog — /blog, /blog/:slug, /blog-sitemap.xml and the /admin/blog editor. */
/* Rendered here for every visitor (not just crawlers) so each article is   */
/* plain HTML on first load. Posts come from the API; see blog/render.js.   */
/* ---------------------------------------------------------------------- */
const BLOG_TTL_MS = 60 * 1000;
let blogListCache = { data: null, at: 0 };
async function getBlogPosts() {
  if (blogListCache.data && Date.now() - blogListCache.at < BLOG_TTL_MS) return blogListCache.data;
  try {
    const r = await fetch(`${API_BASE}/api/blog`);
    if (!r.ok) throw new Error(`API responded ${r.status}`);
    blogListCache = { data: (await r.json()).posts || [], at: Date.now() };
  } catch (err) {
    console.error("frontend-server: failed to fetch blog posts:", err.message);
    if (!blogListCache.data) return [];
  }
  return blogListCache.data;
}
const blogPostCache = new Map();
async function getBlogPost(slug) {
  const hit = blogPostCache.get(slug);
  if (hit && Date.now() - hit.at < BLOG_TTL_MS) return hit.post;
  const r = await fetch(`${API_BASE}/api/blog/${encodeURIComponent(slug)}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`API responded ${r.status}`);
  const post = (await r.json()).post;
  blogPostCache.set(slug, { post, at: Date.now() });
  return post;
}

app.get("/blog", async (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.type("html").send(renderBlogIndex(await getBlogPosts(), SITE_ORIGIN));
});

app.get("/blog/:slug", async (req, res, next) => {
  try {
    const post = await getBlogPost(req.params.slug);
    if (!post) return next(); // falls through to the 404 handler below
    const related = (await getBlogPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);
    res.set("Cache-Control", "public, max-age=60");
    res.type("html").send(renderBlogPost(post, related, SITE_ORIGIN));
  } catch (err) {
    console.error("frontend-server: blog post render failed:", err.message);
    res.status(503).type("text").send("The blog is temporarily unavailable. Please try again in a minute.");
  }
});

app.get("/blog-sitemap.xml", async (req, res) => {
  res.type("application/xml").send(renderBlogSitemap(await getBlogPosts(), SITE_ORIGIN));
});

const BLOG_ADMIN_HTML = fs.readFileSync(path.join(__dirname, "blog", "admin.html"), "utf8").replace("__API_BASE__", API_BASE);
app.get("/admin/blog", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("html").send(BLOG_ADMIN_HTML);
});


app.use(async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!BOT_UA.test(ua)) return next(); // real visitors: fall through to normal static serving below

  const cacheKey = req.path;
  const cached = renderCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.set("Content-Type", "text/html");
    return res.send(cached.html);
  }

  const origin = SITE_ORIGIN;

  if (req.path === "/") {
    const allTests = await getAllTests();
    const html = baseTemplate()
      .replace(
        "</head>",
        `<script type="application/ld+json">${JSON.stringify(buildHomeJsonLd(origin))}</script>\n</head>`
      )
      .replace('<div id="root"></div>', `<div id="root">${renderHomeDirectory(allTests)}</div>`);
    renderCache.set(cacheKey, { html, at: Date.now() });
    res.set("Content-Type", "text/html");
    return res.send(html);
  }

  const resMatch = req.path.match(/^\/resources\/([^/]+)(?:\/.*)?$/);
  if (resMatch) {
    const all = await getAllResources();
    const r = all.find((x) => x.id === resMatch[1]);
    if (!r) return next();
    const html = renderResourcePageHtml(baseTemplate(), r, origin, all);
    renderCache.set(cacheKey, { html, at: Date.now() });
    res.set("Content-Type", "text/html");
    return res.send(html);
  }

  const match = req.path.match(/^\/tests\/([^/]+)(?:\/.*)?$/);
  if (!match) return next(); // non-test routes: static index.html already has decent generic meta tags

  const testId = match[1];
  const tests = await getAllTests();
  const test = tests.find((t) => t.id === testId);
  if (!test) return next();

  const html = renderTestPageHtml(baseTemplate(), test, origin, tests);
  renderCache.set(cacheKey, { html, at: Date.now() });
  res.set("Content-Type", "text/html");
  res.send(html);
});

// Normal static file serving — identical behavior to `serve -s dist`: serve
// real files as-is.
app.use(express.static(DIST_DIR, { extensions: [] }));

// SPA fallback for anything express.static didn't already serve. Only the
// app's real URL shapes ("/", "/tests/:id/:slug", "/privacy", "/terms") are pages,
// so only those get a 200 — everything else (bad links, bot probes like
// /.docker/secrets.json or /wp-admin) gets a real 404 instead of silently
// pretending to be a valid page. A 200 on junk paths is a "soft 404" signal
// that can hurt how much Google trusts the rest of the site's status codes.
const KNOWN_APP_PATH = /^\/((tests|resources)\/[^/]+(\/.*)?|privacy|terms|cart)?$/;
app.use((req, res) => {
  const indexHtml = path.join(DIST_DIR, "index.html");
  if (KNOWN_APP_PATH.test(req.path)) {
    return res.sendFile(indexHtml);
  }
  res.status(404).sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`frontend-server listening on ${PORT} (dynamic rendering for crawlers enabled)`);
});
