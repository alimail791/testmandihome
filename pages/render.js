// Server-rendered landing pages for search: one hub per exam category
// (/neet-mock-tests, /ssc-cgl-mock-tests, …) and the seller page
// (/sell-mock-tests-online). Plain HTML for every visitor, same look as /blog.
// All numbers come from the live /api/tests list so the title, H1, FAQ and
// llms.txt can never disagree.
import { layout, escapeHtml } from "../blog/render.js";

// A hub with fewer tests than this is thin: it still renders for visitors
// but is noindex,follow and left out of the sitemap until it fills up.
export const MIN_TESTS_TO_INDEX = 3;
export const SELLER_PATH = "/sell-mock-tests-online";
const SELLER_SHARE = 80; // % of each sale the seller keeps

export function slugify(s) {
  return (s || "test").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "test";
}
export const testUrl = (t) => `/tests/${t.id}/${slugify(t.title)}`;
export const categoryPath = (cat) => `/${slugify(cat)}-mock-tests`;
const price = (t) => Number(t.price) || 0;
const rupees = (n) => (n ? `₹${n}` : "Free");

export function groupByCategory(tests) {
  const m = new Map();
  for (const t of tests) {
    const c = t.category || "Other";
    if (!m.has(c)) m.set(c, []);
    m.get(c).push(t);
  }
  return [...m.entries()]
    .map(([name, list]) => ({ name, path: categoryPath(name), tests: list, indexable: list.length >= MIN_TESTS_TO_INDEX }))
    .sort((a, b) => b.tests.length - a.tests.length);
}

export function findCategoryByPath(tests, reqPath) {
  return groupByCategory(tests).find((c) => c.path === reqPath) || null;
}

function stats(list) {
  const prices = list.map(price);
  const paid = prices.filter(Boolean);
  const topicCounts = new Map();
  for (const t of list) for (const tp of t.topics || []) topicCounts.set(tp, (topicCounts.get(tp) || 0) + 1);
  const topics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const questions = list.reduce((n, t) => n + (Number(t.questionCount) || 0), 0);
  const sellers = new Set(list.map((t) => t.sellerName).filter(Boolean));
  return { count: list.length, free: prices.filter((p) => !p).length, min: paid.length ? Math.min(...paid) : 0, max: paid.length ? Math.max(...paid) : 0, topics, questions, sellers: sellers.size };
}

const EXTRA_CSS = `<style>
  .hub-sub { font-size: 17px; color: var(--ink-soft); line-height: 1.6; margin: 0 0 22px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 26px; }
  .chip { background: var(--paper-alt); border: 1px solid var(--line); border-radius: 999px; padding: 5px 12px; font-size: 13px; font-weight: 600; text-decoration: none; }
  .tcard { padding: 18px 20px; text-decoration: none; display: block; }
  .tcard h2 { font-family: 'Zilla Slab', Georgia, serif; font-size: 21px; margin: 0 0 6px; }
  .tcard p { margin: 0 0 6px; color: var(--ink-soft); font-size: 15px; line-height: 1.5; }
  .tcard .facts { font-size: 14px; color: var(--muted); }
  .tcard .pr { float: right; font-weight: 700; color: var(--saffron-deep); font-size: 17px; margin-left: 12px; }
  .faq h2 { font-family: 'Zilla Slab', Georgia, serif; font-size: 26px; margin: 40px 0 12px; }
  .faq h3 { font-size: 17px; margin: 18px 0 6px; }
  .faq p { margin: 0; color: var(--ink-soft); line-height: 1.65; }
  .steps { padding-left: 20px; line-height: 1.7; color: var(--ink-soft); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 10px 0 8px; }
  .grid .card { padding: 18px; }
  .grid h3 { margin: 0 0 6px; font-size: 16px; }
  .grid p { margin: 0; font-size: 14px; color: var(--ink-soft); line-height: 1.55; }
  .big { font-size: 40px; font-family: 'Zilla Slab', Georgia, serif; font-weight: 700; color: var(--saffron-deep); }
</style>`;

const faqHtml = (faqs) => `<section class="faq"><h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join("")}</section>`;
const faqLd = (faqs) => ({ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

function testCard(t) {
  const facts = [`${Number(t.questionCount) || 0} questions`, t.duration ? `${t.duration} min` : null, t.sellerName ? `by ${t.sellerName}` : null,
    t.ratingCount > 0 ? `${Number(t.rating || 0).toFixed(1)}★ (${t.ratingCount})` : null].filter(Boolean).join(" · ");
  const topics = (t.topics || []).slice(0, 6);
  return `<a class="card tcard" href="${escapeHtml(testUrl(t))}">
    <span class="pr">${rupees(price(t))}</span>
    <h2>${escapeHtml(t.title)}</h2>
    ${t.description ? `<p>${escapeHtml(String(t.description).slice(0, 200))}</p>` : ""}
    ${topics.length ? `<p>Topics: ${topics.map(escapeHtml).join(", ")}</p>` : ""}
    <div class="facts">${escapeHtml(facts)}</div>
  </a>`;
}

export function renderCategoryPage(cat, allTests, origin) {
  const list = [...cat.tests].sort((a, b) => price(a) - price(b));
  const s = stats(list);
  const name = cat.name;
  const url = `${origin}${cat.path}`;
  const priceBit = s.free && s.min ? `${s.free} free, paid from ₹${s.min}` : s.free ? `${s.free} free` : `from ₹${s.min}`;
  const title = `${name} Mock Tests Online — ${s.count} Test${s.count === 1 ? "" : "s"}, ${priceBit} | TestMandi`;
  const description = `${s.count} online ${name} mock tests and MCQ practice tests (${priceBit})${s.topics.length ? ` covering ${s.topics.slice(0, 4).join(", ")}` : ""}. Instant score and topic-wise report after every test.`.slice(0, 300);
  const faqs = [
    { q: `How many ${name} mock tests are on TestMandi?`, a: `There are ${s.count} ${name} tests right now${s.questions ? ` with ${s.questions} questions in total` : ""}, from ${s.sellers || 1} teacher${s.sellers === 1 ? "" : "s"} and institute${s.sellers === 1 ? "" : "s"}. New tests are added as sellers publish them.` },
    { q: `Are there free ${name} mock tests?`, a: s.free ? `Yes. ${s.free} of the ${s.count} ${name} tests are free; sign up and attempt them straight away.` : `Not at the moment. Paid ${name} tests start at ₹${s.min}.` },
    { q: `How much does a ${name} mock test cost?`, a: s.max ? `Paid ${name} tests cost between ₹${s.min} and ₹${s.max}. You pay once and can attempt the test online immediately.` : `All ${name} tests listed here are free right now.` },
    { q: "What do I get after finishing a test?", a: "An instant score with the correct answers and a topic-wise breakdown, so you can see which chapters need more revision." },
    ...(s.topics.length ? [{ q: `Which ${name} topics do these tests cover?`, a: `Most-covered topics: ${s.topics.slice(0, 10).join(", ")}.` }] : []),
  ];
  const others = groupByCategory(allTests).filter((c) => c.name !== name && c.indexable).slice(0, 12);
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: `${name} Mock Tests Online`, url, description },
    { "@type": "ItemList", numberOfItems: s.count, itemListElement: list.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}${testUrl(t)}`, name: t.title })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "TestMandi", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: `${name} mock tests`, item: url },
    ] },
    faqLd(faqs),
  ] };
  const html = layout({
    title, description, canonical: url, image: `${origin}/og-image.png`, jsonLd,
    body: `${EXTRA_CSS}<main class="wrap" style="max-width:900px">
      <a class="back" href="/">← All exams</a>
      <h1 style="margin-top:14px">${escapeHtml(name)} Mock Tests Online</h1>
      <p class="hub-sub">${s.count} ${escapeHtml(name)} practice test${s.count === 1 ? "" : "s"} (${escapeHtml(priceBit)}) from teachers and coaching institutes. Attempt online, get your score instantly with a topic-wise report.</p>
      ${s.topics.length ? `<div class="chips">${s.topics.slice(0, 12).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      <div class="list">${list.map(testCard).join("")}</div>
      <div class="card promo" style="margin-top:28px">
        <h2>Teach ${escapeHtml(name)}? Sell your own mock tests here</h2>
        <p>List your ${escapeHtml(name)} tests on TestMandi and keep ${SELLER_SHARE}% of every sale. Buyers attempt them online and get instant reports; you get paid to your UPI or bank account.</p>
        <a class="btn" href="${SELLER_PATH}">How selling works</a>
      </div>
      ${faqHtml(faqs)}
      ${others.length ? `<div class="related"><h2>Mock tests for other exams</h2>${others.map((c) => `<a href="${escapeHtml(c.path)}">${escapeHtml(c.name)} mock tests (${c.tests.length})</a>`).join("")}</div>` : ""}
    </main>`,
  });
  return cat.indexable ? html : html.replace("<meta charset", '<meta name="robots" content="noindex, follow">\n<meta charset');
}

export function renderSellerPage(allTests, origin) {
  const cats = groupByCategory(allTests);
  const url = `${origin}${SELLER_PATH}`;
  const title = `Sell Mock Tests Online — Keep ${SELLER_SHARE}% of Every Sale | TestMandi`;
  const description = `Teachers, coaching institutes and schools: sell your MCQ mock tests online on TestMandi. Free to list, keep ${SELLER_SHARE}% of each sale, get paid by UPI or bank transfer. Students get instant score reports.`;
  const faqs = [
    { q: "How much does it cost to sell tests on TestMandi?", a: `Listing is free. When a test sells you keep ${SELLER_SHARE}% of the price and TestMandi keeps ${100 - SELLER_SHARE}% to run payments, hosting and the marketplace.` },
    { q: "How do I get paid?", a: "Add your UPI ID, UPI QR code or bank details in Seller Studio, then tap Withdraw. Your request shows as Pending and changes to Completed once the money is sent." },
    { q: "Who can sell?", a: "Individual teachers, coaching institutes, schools and exam-prep publishers. Register with the Teacher / Institute (Seller) option." },
    { q: "Which exams can I sell tests for?", a: `Any exam on the platform, including ${cats.slice(0, 8).map((c) => c.name).join(", ") || "NEET, JEE, UPSC, SSC and banking"}. You set the price in rupees and the time limit.` },
    { q: "Can students copy my questions?", a: "Questions are only shown to buyers while they attempt the test; public test pages show the title, description, topics and price, never the questions or answers." },
    { q: "Is there a referral bonus?", a: "Yes. You get a ₹200 bonus when a seller you refer publishes their first test, or a buyer you refer makes their first purchase. It is paid on top of your sales earnings." },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", name: "Sell mock tests online on TestMandi", url, description },
    faqLd(faqs),
  ] };
  return layout({
    title, description, canonical: url, image: `${origin}/og-image.png`, jsonLd,
    body: `${EXTRA_CSS}<main class="wrap" style="max-width:900px">
      <h1>Sell your mock tests online. Keep ${SELLER_SHARE}% of every sale.</h1>
      <p class="hub-sub">TestMandi is a marketplace where students across India buy MCQ practice tests for NEET, JEE, UPSC, SSC, banking and more. You write the test and set the price; we handle payments, the online exam, and the score reports.</p>
      <p><a class="btn" href="/?join=seller">Register as a seller — free</a></p>
      <div class="grid" style="margin-top:28px">
        <div class="card"><div class="big">${SELLER_SHARE}%</div><p>of each sale is yours. No listing fee, no monthly charge.</p></div>
        <div class="card"><div class="big">${allTests.length}</div><p>tests live on TestMandi across ${cats.length} exam categories.</p></div>
        <div class="card"><div class="big">₹200</div><p>referral bonus for each seller or buyer you bring in.</p></div>
      </div>
      <h2 style="font-family:'Zilla Slab',Georgia,serif;font-size:26px;margin:36px 0 10px">How it works</h2>
      <ol class="steps">
        <li><strong>Register</strong> as Teacher / Institute (Seller) with your institute or brand name.</li>
        <li><strong>Create a test</strong> in Seller Studio: title, exam, time limit and price, then add questions with 4 options, the answer, an explanation and a topic tag. You can generate draft questions with AI and edit them.</li>
        <li><strong>Publish</strong>. Your test gets its own page and appears in its exam category.</li>
        <li><strong>Share it</strong> with your students on WhatsApp using the share link on every test.</li>
        <li><strong>Withdraw</strong> your earnings to UPI or your bank account.</li>
      </ol>
      <h2 style="font-family:'Zilla Slab',Georgia,serif;font-size:26px;margin:36px 0 10px">What you get as a seller</h2>
      <div class="grid">
        <div class="card"><h3>Auto-graded online exams</h3><p>Timed tests that submit automatically; students see their score and the correct answers instantly.</p></div>
        <div class="card"><h3>Topic-wise reports</h3><p>Each question's topic tag turns into a chapter-wise breakdown for the student.</p></div>
        <div class="card"><h3>Bundles and coupons</h3><p>Group tests into a discounted bundle and create coupon codes for your own batches.</p></div>
        <div class="card"><h3>Sales dashboard</h3><p>See how many times each test sold and what you earned from it.</p></div>
      </div>
      ${cats.length ? `<div class="related"><h2>See what's selling</h2>${cats.filter((c) => c.indexable).slice(0, 12).map((c) => `<a href="${escapeHtml(c.path)}">${escapeHtml(c.name)} mock tests (${c.tests.length})</a>`).join("")}</div>` : ""}
      ${faqHtml(faqs)}
      <div class="card promo" style="margin-top:28px">
        <h2>Ready to list your first test?</h2>
        <p>Registration takes about a minute. Questions? Email <a href="mailto:info@testmandi.in">info@testmandi.in</a>.</p>
        <a class="btn" href="/?join=seller">Register as a seller</a>
        <a href="/seller-guide.pdf" style="font-size:14px;font-weight:600;color:var(--saffron-deep)">Download the seller guide (PDF)</a>
      </div>
    </main>`,
  });
}
