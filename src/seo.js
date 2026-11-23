// Search-result titles/descriptions for test pages. Shared by the crawler
// renderer (frontend-server.js) and the SPA (App.jsx) so Google sees the same
// title whether or not it runs our JavaScript.
//
// Why: Search Console showed test pages ranking top-5 for searches like
// "body fluids and circulation neet pyq" / "plant growth and development neet
// notes" with 0 clicks — the old titles led with "NEET Zoology - …: Chapter
// Test 1 (20 Questions)", which doesn't match how students search. Titles now
// lead with the chapter name and the words they type (NEET, MCQs, PYQ).
//
// Wording is deliberately "PYQ Pattern", not "PYQ": these are practice MCQs
// in the previous-year-question style, not a previous-year paper.

const BRAND = " | TestMandi";
const MAX_TITLE = 60; // roughly where Google truncates on mobile

function priceLabel(test) {
  const p = Number(test.price) || 0;
  return p ? `₹${p}` : "Free";
}

function withBrand(title) {
  return title.length + BRAND.length <= MAX_TITLE ? title + BRAND : title;
}

function clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

export function buildTestSeo(test) {
  const raw = clean(test.title);
  const price = priceLabel(test);
  const q = test.questionCount ?? test.questions?.length ?? 0;
  let m;

  // "NEET Zoology - Animal Kingdom: Chapter Test 1 (20 Questions)"
  // "JEE Main Physics - Alternating Current: Chapter Test 1 (20 Questions)"
  if ((m = raw.match(/^(NEET|JEE Main|JEE Advanced|JEE)\s+([A-Za-z]+)\s*[-–—:]\s*(.+?)\s*:\s*Chapter Test\s*(\d+)\s*(?:\((\d+)\s*Questions?\))?/i))) {
    const [, exam, subject, chapter, set, qs] = m;
    const n = qs || q;
    const isNeet = /^neet/i.test(exam);
    const title = withBrand(`${chapter} ${isNeet ? "NEET" : "JEE Main"} MCQs, PYQ Pattern – Set ${set} | ${price}`);
    const description = `${n} ${chapter} ${isNeet ? "NEET" : "JEE Main"} ${subject} MCQs in PYQ pattern. Timed online test, instant score & topic-wise report. ${price === "Free" ? "Free" : `Only ${price}`}.`;
    return { title, description };
  }

  // "NEET Full Mock Test 7 (180 Questions: Physics 45, …)"
  if ((m = raw.match(/^NEET Full Mock Test\s*(\d+)/i))) {
    return {
      title: withBrand(`NEET Full Mock Test ${m[1]} – 180 Qs, NTA Pattern | ${price}`),
      description: `Full-length NEET mock test ${m[1]}: 180 questions (Physics 45, Chemistry 45, Biology 90) in the NTA exam pattern. Attempt online, get an instant score and topic-wise report. ${price}.`,
    };
  }

  // "NEET Half Mock Test 11 (90 Questions…)"
  if ((m = raw.match(/^NEET Half Mock Test\s*(\d+)/i))) {
    return {
      title: withBrand(`NEET Half Mock Test ${m[1]} – 90 Qs Online | ${price}`),
      description: `NEET half-length mock test ${m[1]} with 90 questions across Physics, Chemistry and Biology. Timed online test, instant score and topic-wise report. ${price}.`,
    };
  }

  // "JEE Main Chemistry Practice Test 40 (25 Questions)" / "NEET Biology Practice Test 22 (45 Questions)"
  if ((m = raw.match(/^(NEET|JEE Main)\s+([A-Za-z]+)\s+Practice Test\s*(\d+)\s*(?:\((\d+)\s*Questions?\))?/i))) {
    const [, exam, subject, set, qs] = m;
    return {
      title: withBrand(`${exam} ${subject} MCQ Practice Test ${set} – ${qs || q} Qs | ${price}`),
      description: `${qs || q} ${exam} ${subject} MCQs in previous-year-question pattern, mixed chapters. Timed online test with instant score and topic-wise report. ${price}.`,
    };
  }

  // "TNPSC Complete Practice Test — Tamil Nadu GK, General Studies"
  if ((m = raw.match(/^(.+?)\s+Complete Practice Test\s*(?:[-–—:]\s*(.+))?$/i))) {
    const [, exam, topics] = m;
    return {
      title: withBrand(`${exam} Mock Test Online${topics ? ` – ${topics}` : ""} | ${price}`),
      description: `${exam} online mock test${topics ? ` covering ${topics}` : ""}. ${q ? `${q} questions, ` : ""}timed, with instant score and topic-wise report. ${price}.`,
    };
  }

  // Anything else (seller-made tests, bundles): keep the old shape.
  const mockWord = /mock|test/i.test(raw) ? "" : " Mock Test";
  return {
    title: `${raw}${mockWord} — ${price} Online${q ? `, ${q} Qs` : ""}${BRAND}`,
    description: null, // caller falls back to its own description
  };
}
