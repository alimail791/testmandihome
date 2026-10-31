// Server-rendered blog pages for testmandi.in/blog. Plain HTML (no React),
// so visitors and search engines get the full article on first load.
// Posts come from the API (testmandiserver/blog.js); the HTML bodies are
// already sanitized there when the admin saves them.

const GA_ID = "G-1D8TK2X4TY";

export function escapeHtml(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "");
const minutes = (html) => Math.max(1, Math.round(String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200));

function layout({ title, description, canonical, image, jsonLd, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="TestMandi">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="theme-color" content="#1B2A4A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/blog-content.css">
<style>
  :root { --ink:#1B2A4A; --ink-soft:#3B4C72; --paper:#FBF7EE; --paper-alt:#F1E9D6; --saffron:#E8A33D; --saffron-deep:#C97F1B; --line:#CBBFA0; --muted:#79705C; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'Inter', system-ui, sans-serif; }
  a { color: inherit; }
  .bar { background: var(--ink); color: var(--paper); }
  .bar-in { max-width: 1100px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .brand { font-family: 'Zilla Slab', Georgia, serif; font-size: 24px; font-weight: 700; text-decoration: none; color: var(--paper); }
  .brand span { color: var(--saffron); }
  .bar nav { display: flex; gap: 18px; align-items: center; font-size: 14px; font-weight: 600; }
  .bar nav a { text-decoration: none; color: var(--paper); opacity: .85; }
  .btn { display: inline-block; background: var(--saffron); color: var(--ink) !important; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; opacity: 1 !important; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 44px 20px 32px; }
  h1 { font-family: 'Zilla Slab', Georgia, serif; font-size: 38px; line-height: 1.18; margin: 0 0 12px; }
  .meta { color: var(--muted); font-size: 14px; margin: 0 0 26px; }
  .back { font-size: 14px; font-weight: 600; color: var(--saffron-deep); text-decoration: none; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 12px; }
  .list { display: flex; flex-direction: column; gap: 16px; }
  .item { display: flex; gap: 18px; padding: 20px 22px; text-decoration: none; }
  .item img { width: 150px; height: 100px; object-fit: cover; border-radius: 8px; flex: none; }
  .item h2 { font-family: 'Zilla Slab', Georgia, serif; font-size: 22px; line-height: 1.25; margin: 0 0 6px; }
  .item p { margin: 0 0 8px; color: var(--ink-soft); line-height: 1.55; font-size: 15px; }
  .item small { color: var(--muted); }
  .promo { padding: 24px; display: flex; flex-direction: column; gap: 10px; border-color: var(--saffron); margin-top: 8px; }
  .promo h2 { font-family: 'Zilla Slab', Georgia, serif; margin: 0; font-size: 22px; }
  .promo p { margin: 0; color: var(--ink-soft); line-height: 1.6; }
  .promo .btn { align-self: flex-start; }
  .related { margin-top: 36px; }
  .related h2 { font-family: 'Zilla Slab', Georgia, serif; font-size: 20px; margin: 0 0 10px; }
  .related a { display: block; padding: 6px 0; color: var(--saffron-deep); font-weight: 600; }
  .blog-content { --blog-ink: var(--ink); --blog-muted: var(--ink-soft); --blog-accent: var(--ink); --blog-line: var(--line); --blog-tint: var(--paper-alt); }
  .blog-content h2, .blog-content h3 { font-family: 'Zilla Slab', Georgia, serif; }
  footer { border-top: 1px solid var(--line); margin-top: 40px; }
  footer div { max-width: 1100px; margin: 0 auto; padding: 22px 20px; display: flex; gap: 18px; flex-wrap: wrap; font-size: 13px; color: var(--muted); }
  @media (max-width: 640px) { h1 { font-size: 29px; } .item { flex-direction: column; } .item img { width: 100%; height: 160px; } }
</style>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body>
<header class="bar"><div class="bar-in">
  <a class="brand" href="/">Test<span>Mandi</span></a>
  <nav><a href="/blog">Blog</a><a href="/">Browse tests</a><a class="btn" href="/">Sign up free</a></nav>
</div></header>
${body}
<footer><div>
  <a href="/">TestMandi</a><a href="/blog">Blog</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a>
  <a href="mailto:info@testmandi.in">info@testmandi.in</a><span>© ${new Date().getFullYear()} TestMandi</span>
</div><div>
  <span>More from our team:</span>
  <a href="https://www.classcoach.in/?utm_source=testmandi&amp;utm_medium=blog_footer">ClassCoach — AI tests for teachers</a>
  <a href="https://yneet.in/?utm_source=testmandi&amp;utm_medium=blog_footer">YNeet — NEET preparation</a>
  <a href="https://vasulbook.com/?utm_source=testmandi&amp;utm_medium=blog_footer">VasulBook — collect fee dues</a>
</div></footer>
</body>
</html>`;
}

const PROMO = `<div class="card promo">
  <h2>Practise with real mock tests on TestMandi</h2>
  <p>MCQ practice tests and full mock tests for NEET, JEE, SSC, banking and more, with an instant score and a topic-wise report after every test. Teachers and institutes can sell their own tests and keep 80% of every sale.</p>
  <a class="btn" href="/">Browse tests</a>
</div>`;

export function renderBlogIndex(posts, origin) {
  const items = posts.length
    ? posts.map((p) => `<a class="card item" href="/blog/${escapeHtml(p.slug)}">
        ${p.coverImageUrl ? `<img src="${escapeHtml(p.coverImageUrl)}" alt="" loading="lazy">` : ""}
        <div><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.excerpt)}</p><small>${fmtDate(p.publishedAt)}</small></div>
      </a>`).join("")
    : `<div class="card" style="padding:24px"><p style="margin:0">New articles are on the way. Meanwhile, <a href="/" style="color:var(--saffron-deep);font-weight:600">browse practice tests</a>.</p></div>`;
  return layout({
    title: "Blog — Exam Preparation Tips, Mock Test Strategy & More | TestMandi",
    description: "Guides on preparing for NEET, JEE, SSC, banking and other exams: how to use mock tests, analyse your score and plan your revision.",
    canonical: `${origin}/blog`,
    image: `${origin}/og-image.png`,
    jsonLd: { "@context": "https://schema.org", "@type": "Blog", name: "TestMandi Blog", url: `${origin}/blog` },
    body: `<main class="wrap" style="max-width:860px">
      <h1>TestMandi Blog</h1>
      <p class="meta" style="font-size:16px;color:var(--ink-soft)">Exam preparation guides: mock test strategy, score analysis and revision plans.</p>
      <div class="list">${items}</div>
      <div style="margin-top:28px">${PROMO}</div>
    </main>`,
  });
}

export function renderBlogPost(post, related, origin) {
  const url = `${origin}/blog/${post.slug}`;
  const description = post.metaDescription || String(post.bodyHtml || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
  return layout({
    title: `${post.title} | TestMandi`,
    description,
    canonical: url,
    image: post.coverImageUrl || `${origin}/og-image.png`,
    jsonLd: {
      "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description, url, mainEntityOfPage: url,
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      image: post.coverImageUrl || `${origin}/og-image.png`,
      author: { "@type": "Organization", name: "TestMandi", url: `${origin}/` },
      publisher: { "@type": "Organization", name: "TestMandi", url: `${origin}/`, logo: { "@type": "ImageObject", url: `${origin}/logo.png` } },
    },
    body: `<main class="wrap">
      <a class="back" href="/blog">← All articles</a>
      <article>
        <h1 style="margin-top:14px">${escapeHtml(post.title)}</h1>
        <p class="meta">${fmtDate(post.publishedAt)} · ${minutes(post.bodyHtml)} min read</p>
        ${post.coverImageUrl ? `<img src="${escapeHtml(post.coverImageUrl)}" alt="" style="width:100%;border-radius:12px;margin-bottom:26px">` : ""}
        <div class="blog-content">${post.bodyHtml}</div>
      </article>
      ${PROMO}
      ${related.length ? `<div class="related"><h2>More from the blog</h2>${related.map((r) => `<a href="/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a>`).join("")}</div>` : ""}
    </main>`,
  });
}

export function renderBlogSitemap(posts, origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/blog</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
${posts.map((p) => `  <url><loc>${origin}/blog/${escapeHtml(p.slug)}</loc><lastmod>${new Date(p.updatedAt || p.publishedAt).toISOString().slice(0, 10)}</lastmod><priority>0.7</priority></url>`).join("\n")}
</urlset>
`;
}
