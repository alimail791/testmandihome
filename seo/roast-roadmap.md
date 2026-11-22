# SEO Roast Roadmap: testmandi.in (2026-11-22)

Verdict: Google could see your tests. ChatGPT, Perplexity and Claude saw an empty page.

Money pages: the homepage (buyers + "Sell your tests"), every `/tests/:id/:slug` page.
Conversions: test purchase, seller signup.

| # | Tier | Issue | Revenue impact | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | FATAL | AI crawlers (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot…) weren't in `BOT_UA`, so they got `<div id="root"></div>` with no content | TestMandi can't be recommended in AI answers to "best NEET mock test site" | Added ~15 AI crawler user agents | agent | in patch |
| 2 | FATAL | `/tests/<unknown-id>` returned 200 (soft 404) for people and for crawlers | Deleted/typo test URLs index as duplicate homepages | Real 404 when the id isn't in the API list (skipped if the API is down) | agent | in patch |
| 3 | REVENUE | Sitemap generated only at build time | A seller's new test stays invisible to Google until you redeploy | Live `/sitemap.xml` route from the API, 10-min cache | agent | in patch |
| 4 | REVENUE | Test titles were "X — TestMandi": no "mock test", price or size | Loses the click to results that show "Free" / price | Title is now "X Mock Test — ₹49 Online, 30 Qs \| TestMandi" | agent | in patch |
| 5 | REVENUE | No exam category hub pages (`/neet-mock-tests`, `/ssc-cgl-mock-tests`…) | The head terms people actually search ("NEET mock test online") have no landing page; breadcrumb level 2 points at `/` | `/<exam>-mock-tests` hubs, server-rendered for everyone; title/H1/FAQ counts from live data; noindex until a hub has 3+ tests; linked from home, every test page and llms.txt | agent | in patch |
| 6 | REVENUE | No dedicated seller landing page (`/sell-mock-tests-online`) | Seller recruitment (and the planned Google Ads) has no organic page; "sell mock tests online" traffic goes to competitors | `/sell-mock-tests-online`: 80% payout, how it works, FAQ, `/?join=seller` CTA opens the seller signup form | agent | in patch |
| 7 | COMPOUNDING | No public seller storefronts | Missed backlink loop: each institute would link to "our tests on TestMandi" | `/sellers/:slug` page + "Sell on TestMandi" badge snippet sellers paste on their sites | agent | later |
| 8 | COMPOUNDING | Near-zero referring domains (DR ~0) | Even perfect pages can't outrank Testbook/Adda247 on head terms | Run directory-submissions; list in edtech/startup directories; cross-link from yneet.in / classcoach.in (already partly done) | Akbar | next |
| 9 | COMPOUNDING | Unknown AI visibility | Can't tell if fixes 1 and 3 worked | Re-check in 2–3 weeks with aiseotracker or by asking ChatGPT/Perplexity directly | Akbar | after deploy |
| 10 | COMPOUNDING | Live index status not checked in this audit (sandbox couldn't reach testmandi.in) | Need to know which test pages are "Discovered – not indexed" | Google Search Console + Bing Webmaster Tools: submit `/sitemap.xml`, inspect 3 test URLs | Akbar | after deploy |

Also in the patch: added `/llms.txt` (live counts from the API), `X-Robots-Tag: noindex` on `/cart` and `/admin/*`, removed a fake `SearchAction` (`/?search=` isn't handled by the app), and removed the duplicate Organization JSON-LD on the homepage.

## Fluff (ignore until rows above ship)
- `<meta name="keywords">` is ignored by Google; harmless
- Organization `sameAs` is empty: add social profile URLs when you have them
- Main JS bundle > 500 kB (Vite warning); split later for speed
