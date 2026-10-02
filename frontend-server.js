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

// Pulls the real, distinct topic tags out of a test's own question bank
// (e.g. "Genetics", "Kinematics", "Straight Lines") instead of relying on
// the short hand-written one-liner alone. This is what makes each test
// page's crawlable content genuinely different from the next one, rather
// than 50 pages that read as the same template with the exam name swapped.
function extractTopics(test) {
  const seen = new Set();
  const topics = [];
  for (const q of test.questions || []) {
    const t = (q.topic || "").trim();
    if (t && !seen.has(t)) { seen.add(t); topics.push(t); }
  }
  return topics;
}

function renderTestPageHtml(template, test, origin) {
  const topics = extractTopics(test);
  const questionCount = test.questions?.length || 0;
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

  return html;
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

  const match = req.path.match(/^\/tests\/([^/]+)(?:\/.*)?$/);
  if (!match) return next(); // non-test routes: static index.html already has decent generic meta tags

  const testId = match[1];
  const tests = await getAllTests();
  const test = tests.find((t) => t.id === testId);
  if (!test) return next();

  const origin = `${req.protocol}://${req.get("host")}`;
  const html = renderTestPageHtml(baseTemplate(), test, origin);
  renderCache.set(cacheKey, { html, at: Date.now() });
  res.set("Content-Type", "text/html");
  res.send(html);
});

// Normal static file serving — identical behavior to `serve -s dist`: serve
// real files as-is, and fall back to index.html for any client-side route.
app.use(express.static(DIST_DIR, { extensions: [] }));
app.use((req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`frontend-server listening on ${PORT} (dynamic rendering for crawlers enabled)`);
});
