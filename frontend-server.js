// Drop-in replacement for `serve -s dist`. Real visitors get the exact same
// SPA, byte for byte. Search/social crawlers (Googlebot, Bingbot, WhatsApp
// link previews, etc.) additionally get real <title>/<meta>/visible content
// for /tests/:id/:slug pages, fetched server-side from the API — no headless
// browser involved, so there's no Chromium/system-dependency risk on deploy.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");
const PORT = process.env.PORT || 8080;

// Same backend the SPA itself talks to (see src/api.js / VITE_API_BASE).
const API_BASE = process.env.VITE_API_BASE || "https://testmandiserver-production.up.railway.app";

const BOT_UA = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|applebot/i;

const TESTMANDI_CONTACT_EMAIL = "info@testmandi.in";

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

function renderTestPageHtml(template, test, origin) {
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

app.use(async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!BOT_UA.test(ua)) return next(); // real visitors: fall through to normal static serving below

  const cacheKey = req.path;
  const cached = renderCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.set("Content-Type", "text/html");
    return res.send(cached.html);
  }

  const origin = `${req.protocol}://${req.get("host")}`;

  if (req.path === "/") {
    const html = baseTemplate().replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify(buildHomeJsonLd(origin))}</script>\n</head>`
    );
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

  const html = renderTestPageHtml(baseTemplate(), test, origin);
  renderCache.set(cacheKey, { html, at: Date.now() });
  res.set("Content-Type", "text/html");
  res.send(html);
});

// Normal static file serving — identical behavior to `serve -s dist`: serve
// real files as-is.
app.use(express.static(DIST_DIR, { extensions: [] }));

// SPA fallback for anything express.static didn't already serve. Only the
// app's actual two URL shapes ("/" and "/tests/:id/:slug") are real pages,
// so only those get a 200 — everything else (bad links, bot probes like
// /.docker/secrets.json or /wp-admin) gets a real 404 instead of silently
// pretending to be a valid page. A 200 on junk paths is a "soft 404" signal
// that can hurt how much Google trusts the rest of the site's status codes.
const KNOWN_APP_PATH = /^\/(tests\/[^/]+(\/.*)?)?$/;
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
