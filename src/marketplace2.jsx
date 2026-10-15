// TestMandi marketplace, TpT-style: product cards, product pages for tests
// and teaching resources, the seller upload form for resources, and the
// buyer's resource library. Wired into AppShell in App.jsx.
import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "./api.js";
import { T } from "./theme.js";
import {
  Star, Bookmark, Download, Share2, Copy, Check, X, ChevronLeft, ChevronRight, GraduationCap,
  BookOpen, Tag, FileText, Globe, School, Clock, ClipboardList, Package, Upload, Loader2, Eye,
  Trash2, Plus, Play, Layers, ImagePlus, Pencil, Search, MessageCircle, Store,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Helpers                                                                */
/* ---------------------------------------------------------------------- */
export function slugify(title) {
  // Must match slugify() in App.jsx, frontend-server.js and generate-sitemap.js.
  return (title || "test").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "test";
}

export function itemPath(item) {
  return `/${item.kind === "resource" ? "resources" : "tests"}/${item.id}/${slugify(item.title)}`;
}

export const asTest = (t) => (t ? { ...t, kind: "test" } : null);
export const asResource = (r) => (r ? { ...r, kind: "resource" } : null);

export function priceLabel(p) {
  return Number(p) === 0 ? "Free" : `₹${Number(p).toLocaleString("en-IN")}`;
}

function fmtCount(n) {
  if (!n) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

function fmtBytes(b) {
  if (!b) return "";
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

const COVER_COLORS = ["#1B2A4A", "#2F7A4F", "#B8503E", "#6B4A9A", "#1F6E8C", "#B5701A", "#55662C", "#8C3B5E"];
function colorFor(key) {
  let h = 0;
  for (const ch of String(key || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COVER_COLORS[h % COVER_COLORS.length];
}

function initials(name) {
  return (name || "?").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function itemHighlights(item) {
  if (item.kind === "resource") return [item.grade, item.resourceType, item.language].filter(Boolean).join(" · ");
  const qs = item.questionCount ?? item.questions?.length ?? 0;
  return [item.category, `${qs} Qs`, item.duration ? `${item.duration} min` : null].filter(Boolean).join(" · ");
}

/* ---------------------------------------------------------------------- */
/* Small pieces                                                           */
/* ---------------------------------------------------------------------- */
export function ItemCover({ item, variant = "card" }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (item.kind === "resource" && item.hasCover && !imgFailed) {
    return (
      <img
        className={`tpt-cover tpt-cover-img tpt-cover-${variant}`}
        src={api.resourceImageUrl(item.id, "cover")}
        alt=""
        loading="lazy"
        onError={() => setImgFailed(true)}
      />
    );
  }
  const isRes = item.kind === "resource";
  const big = isRes ? (item.subject || item.resourceType) : item.category;
  const small = isRes ? item.grade : `${item.questionCount ?? item.questions?.length ?? 0} questions`;
  return (
    <div className={`tpt-cover tpt-cover-gen tpt-cover-${variant}`} style={{ backgroundColor: colorFor(big || item.title) }} aria-hidden="true">
      <span className="tpt-cover-tag">{isRes ? item.resourceType : "MCQ test"}</span>
      <span className="tpt-cover-big">{big || "TestMandi"}</span>
      <span className="tpt-cover-small">{small}</span>
    </div>
  );
}

function RatingLine({ item, onClick, compact }) {
  if (!item.ratingCount) return <span className="tpt-rating tpt-rating-new">New</span>;
  const inner = (
    <>
      <span className="tpt-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={13} strokeWidth={1.5} color={T.saffronDeep} fill={i <= Math.round(item.rating) ? T.saffronDeep : "none"} />
        ))}
      </span>
      <b>{Number(item.rating).toFixed(1)}</b>
      <span className="tpt-rating-count">({fmtCount(item.ratingCount)}{compact ? "" : " ratings"})</span>
    </>
  );
  return onClick
    ? <button type="button" className="tpt-rating tpt-plain" onClick={onClick} aria-label="Go to reviews">{inner}</button>
    : <span className="tpt-rating" aria-label={`Rated ${Number(item.rating).toFixed(1)} out of 5`}>{inner}</span>;
}

function SellerAvatar({ name, size = 22 }) {
  return (
    <span className="tpt-avatar" style={{ width: size, height: size, fontSize: size * 0.42, background: colorFor(name) }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

function BookmarkButton({ active, onClick, size = 34, label }) {
  return (
    <button type="button" className="tpt-bookmark" style={{ width: size, height: size }} aria-pressed={!!active} aria-label={active ? "Remove from wishlist" : "Save to wishlist"} onClick={onClick}>
      <Bookmark size={16} fill={active ? "currentColor" : "none"} />
      {label && <span>{label}</span>}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Product card                                                           */
/* ---------------------------------------------------------------------- */
export function ProductCard({ item, owned, wishlisted, onToggleWishlist, onOpen, onBuy, onOwnedAction }) {
  const href = itemPath(item);
  const open = (e) => { e.preventDefault(); onOpen(item); };
  return (
    <article className="tpt-card">
      <a className="tpt-card-thumb" href={href} onClick={open} tabIndex={-1} aria-hidden="true">
        <ItemCover item={item} />
      </a>
      <div className="tpt-card-body">
        <a className="tpt-card-title" href={href} onClick={open}>{item.title}</a>
        <div className="tpt-card-seller"><SellerAvatar name={item.sellerName} size={20} /><span className="tpt-ellipsis">{item.sellerName}</span></div>
        <RatingLine item={item} compact />
        <div className="tpt-card-hl">{itemHighlights(item)}</div>
      </div>
      <div className="tpt-card-foot">
        <span className={`tpt-price ${Number(item.price) === 0 ? "tpt-free" : ""}`}>{priceLabel(item.price)}</span>
        {owned ? (
          <button type="button" className="tpt-btn tpt-btn-ghost tpt-btn-sm" onClick={onOwnedAction}>
            {item.kind === "resource" ? <><Download size={14} /> Download</> : <><Play size={14} /> Go to test</>}
          </button>
        ) : (
          <button type="button" className="tpt-btn tpt-btn-cart tpt-btn-sm" onClick={onBuy}>
            {Number(item.price) === 0 ? "Get free" : "Buy now"}
          </button>
        )}
        {onToggleWishlist && <BookmarkButton active={wishlisted} onClick={onToggleWishlist} />}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------- */
/* Resource browser (the "Teaching resources" tab of the marketplace)     */
/* ---------------------------------------------------------------------- */
export function ResourceBrowser({ resources, options, ownedIds, wishlistIds, onToggleWishlist, onOpen, onBuy, onDownload, onSellClick }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [grade, setGrade] = useState("");
  const [lang, setLang] = useState("");
  const [price, setPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 40;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = resources.filter((r) =>
      (!q || [r.title, r.sellerName, r.subject, ...(r.tags || [])].join(" ").toLowerCase().includes(q)) &&
      (type === "All" || r.resourceType === type) &&
      (!grade || r.grade === grade) &&
      (!lang || r.language === lang) &&
      (!price || (price === "free" ? r.price === 0 : price === "u50" ? r.price > 0 && r.price < 50 : price === "u100" ? r.price < 100 : r.price >= 100))
    );
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }, [resources, search, type, grade, lang, price, sort]);
  useEffect(() => { setPage(1); }, [search, type, grade, lang, price, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const types = options?.types || [];

  return (
    <div>
      <div className="tpt-filters">
        <div className="search-box">
          <Search size={15} color={T.muted} />
          <input placeholder="Search worksheets, notes, slides…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search resources" />
        </div>
        <select className="select-box" value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Class or level">
          <option value="">All classes</option>
          {(options?.grades || []).map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="select-box" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
          <option value="">All languages</option>
          {(options?.languages || []).map((l) => <option key={l}>{l}</option>)}
        </select>
        <select className="select-box" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price">
          <option value="">Any price</option>
          <option value="free">Free</option>
          <option value="u50">Under ₹50</option>
          <option value="u100">Under ₹100</option>
          <option value="o100">₹100 and up</option>
        </select>
        <select className="select-box" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="rating">Top rated</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["All", ...types].map((t) => (
          <button key={t} type="button" onClick={() => setType(t)} className={`chip ${type === t ? "chip-active" : ""}`}>{t}</button>
        ))}
      </div>

      {resources.length === 0 ? (
        <div className="empty-panel">
          <Layers size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Teaching resources are opening soon</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, marginBottom: 14 }}>Worksheets, notes, slides and question banks made by Indian teachers will appear here.</div>
          <button type="button" className="btn-primary" onClick={onSellClick}><Upload size={15} /> Be one of the first to sell</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 10 }}>
            {filtered.length === 0 ? "No resources match these filters — clear one and try again." : `Showing ${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, filtered.length)} of ${filtered.length} resources`}
          </div>
          <div className="tpt-grid">
            {shown.map((r) => (
              <ProductCard
                key={r.id}
                item={r}
                owned={ownedIds.has(r.id)}
                wishlisted={wishlistIds?.has(r.id)}
                onToggleWishlist={onToggleWishlist ? () => onToggleWishlist(r.id, wishlistIds?.has(r.id)) : undefined}
                onOpen={onOpen}
                onBuy={() => onBuy(r)}
                onOwnedAction={() => onDownload(r)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Resource pages" style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 22 }}>
              <button type="button" className="btn-outline" disabled={current === 1} onClick={() => setPage(current - 1)} style={{ opacity: current === 1 ? 0.5 : 1 }}><ChevronLeft size={14} /> Prev</button>
              <span style={{ alignSelf: "center", fontSize: 13, color: T.muted }}>Page {current} of {totalPages}</span>
              <button type="button" className="btn-outline" disabled={current === totalPages} onClick={() => setPage(current + 1)} style={{ opacity: current === totalPages ? 0.5 : 1 }}>Next <ChevronRight size={14} /></button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Product page                                                           */
/* ---------------------------------------------------------------------- */
function HRow({ icon: Icon, label, children }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="tpt-hrow">
      <Icon size={17} />
      <b>{label}</b>
      <span>{children}</span>
    </div>
  );
}

function PreviewModal({ item, onClose, onBuy, owned }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Preview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Preview · {item.title}</div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: "grid", gap: 14, background: T.paperAlt }}>
          {Array.from({ length: item.previewCount }).map((_, i) => (
            <img key={i} src={api.resourceImageUrl(item.id, i)} alt={`Preview page ${i + 1}`} style={{ width: "100%", borderRadius: 6, border: `1px solid ${T.line}`, background: "#fff" }} loading="lazy" />
          ))}
          {!owned && (
            <button type="button" className="tpt-btn tpt-btn-cart" onClick={() => { onClose(); onBuy(); }}>
              {Number(item.price) === 0 ? "Get it free" : `Buy now · ${priceLabel(item.price)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductPage({
  item, loading, notFound, allTests, allResources, bundles, owned, purchasedBundleIds,
  wishlisted, onToggleWishlist, onBuy, onBuyBundle, onOwnedAction, onOpen, onBack, session,
  following, onToggleFollow,
}) {
  const [followers, setFollowers] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [slot, setSlot] = useState("cover");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    setReviews(null);
    setSlot("cover");
    const load = item.kind === "resource" ? api.getResourceReviews(item.id) : api.getTestReviews(item.id);
    load.then((d) => setReviews(d.reviews || [])).catch(() => setReviews([]));
    window.scrollTo({ top: 0 });
  }, [item?.id, item?.kind]);

  useEffect(() => {
    setFollowers(null);
    if (!item?.sellerEmail) return;
    api.getSellerProfile(item.sellerEmail).then((p) => setFollowers(p.followerCount)).catch(() => {});
  }, [item?.sellerEmail]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [item?.id, owned]);

  if (loading) {
    return <div className="tpt-page" style={{ color: T.muted, padding: "60px 28px", textAlign: "center" }}><Loader2 size={24} className="spin" /> <div style={{ marginTop: 10 }}>Loading…</div></div>;
  }
  if (notFound || !item) {
    return (
      <div className="tpt-page" style={{ padding: "40px 28px" }}>
        <div className="empty-panel">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>This listing isn't available</div>
          <div style={{ fontSize: 13.5, color: T.muted, margin: "6px 0 14px" }}>It may have been removed by the seller. Browse the marketplace for similar tests and resources.</div>
          <button type="button" className="btn-primary" onClick={onBack}><Store size={15} /> Back to marketplace</button>
        </div>
      </div>
    );
  }

  const isRes = item.kind === "resource";
  const free = Number(item.price) === 0;
  const pool = isRes ? allResources : allTests;
  const more = pool.filter((x) => x.sellerName === item.sellerName && x.id !== item.id).slice(0, 4);
  const similar = pool.filter((x) => x.id !== item.id && x.sellerName !== item.sellerName && (isRes ? x.subject && x.subject === item.subject : x.category === item.category)).slice(0, 4);
  const testsById = Object.fromEntries(allTests.map((t) => [t.id, t]));
  const myBundles = isRes ? [] : (bundles || []).filter((b) => b.testIds?.includes(item.id)).slice(0, 3);
  const shareUrl = `${window.location.origin}${itemPath(item)}`;
  const shareText = `${item.title} on TestMandi — ${priceLabel(item.price)}: ${shareUrl}`;
  const tags = isRes ? item.tags || [] : (item.topics || []).slice(0, 8);
  const qCount = item.questionCount ?? item.questions?.length ?? 0;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };
  const toReviews = () => reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const toggleWish = onToggleWishlist ? () => onToggleWishlist(item.id, wishlisted) : null;
  const isOwnStore = session?.email && session.email === item.sellerEmail;
  const toggleFollow = async () => {
    const n = await onToggleFollow(item.sellerEmail, following);
    if (typeof n === "number") setFollowers(n);
  };

  const primary = owned ? (
    <button ref={buyRef} type="button" className="tpt-btn tpt-btn-cart tpt-btn-lg" onClick={onOwnedAction}>
      {isRes ? <><Download size={17} /> Download</> : <><Play size={17} /> Start test</>}
    </button>
  ) : (
    <button ref={buyRef} type="button" className="tpt-btn tpt-btn-cart tpt-btn-lg" onClick={onBuy}>
      {free ? "Get it free" : `Buy now · ${priceLabel(item.price)}`}
    </button>
  );

  const quotes = (reviews || []).filter((r) => r.text).slice(0, 2);
  const othersBlock = quotes.length > 0 ? (
    <>
      <h2>What others say</h2>
      {quotes.map((r, i) => (
        <blockquote key={i}>“{r.text}”<footer>{r.buyerName?.split(" ")[0] || "A buyer"}</footer></blockquote>
      ))}
      <button type="button" className="tpt-plain tpt-link" onClick={toReviews}>See all reviews</button>
    </>
  ) : null;

  const slots = isRes ? ["cover", ...Array.from({ length: item.previewCount || 0 }, (_, i) => i)] : ["cover"];

  return (
    <div className="tpt-page">
      <nav className="tpt-crumbs" aria-label="Breadcrumb">
        <button type="button" className="tpt-plain" onClick={onBack}><ChevronLeft size={14} /> Marketplace</button>
        <span>›</span><span>{isRes ? "Teaching resources" : "Mock tests"}</span>
        {(isRes ? item.grade : item.category) && <><span>›</span><span>{isRes ? item.grade : item.category}</span></>}
      </nav>

      <div className="tpt-pp">
        <div className={`tpt-gallery ${slots.length > 1 ? "" : "tpt-gallery-single"}`}>
          {slots.length > 1 && (
            <div className="tpt-thumbs" role="tablist" aria-label="Preview pages">
              {slots.map((s) => (
                <button key={s} type="button" role="tab" aria-selected={slot === s} className="tpt-thumb" onClick={() => setSlot(s)} aria-label={s === "cover" ? "Cover" : `Preview page ${s + 1}`}>
                  {s === "cover" ? <ItemCover item={item} variant="thumb" /> : <img src={api.resourceImageUrl(item.id, s)} alt="" loading="lazy" />}
                </button>
              ))}
            </div>
          )}
          <div className="tpt-main-img">
            {slot === "cover" ? <ItemCover item={item} variant="main" /> : <img src={api.resourceImageUrl(item.id, slot)} alt={`Preview page ${slot + 1}`} />}
          </div>
          <div className="tpt-gallery-foot">
            {isRes && item.previewCount > 0 && (
              <button type="button" className="tpt-btn tpt-btn-outline" onClick={() => setShowPreview(true)}><Eye size={15} /> View preview</button>
            )}
            <div className="tpt-share">
              Share
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> WhatsApp</a>
              <button type="button" className="tpt-plain" onClick={copyLink}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}</button>
            </div>
          </div>

          {othersBlock && <div className="tpt-others tpt-others-desktop">{othersBlock}</div>}
        </div>

        <aside className="tpt-side">
          <h1>{item.title}</h1>
          <RatingLine item={item} onClick={item.ratingCount ? toReviews : undefined} />
          <div className="tpt-seller-line">
            <SellerAvatar name={item.sellerName} size={34} />
            <div style={{ minWidth: 0 }}>
              <div className="tpt-seller-name">{item.sellerName}</div>
              <div style={{ fontSize: 12.5, color: T.muted }}>{more.length ? `${more.length + 1}+ ${isRes ? "resources" : "tests"} on TestMandi` : "Seller on TestMandi"}</div>
            </div>
            {item.sellerEmail && !isOwnStore && onToggleFollow && (
              <button type="button" className="tpt-follow" aria-pressed={!!following} onClick={toggleFollow}>
                <Star size={15} fill={following ? "currentColor" : "none"} /> {following ? "Following" : "Follow"}
              </button>
            )}
            {followers !== null && <span className="tpt-followers">{fmtCount(followers)} follower{followers === 1 ? "" : "s"}</span>}
          </div>
          <div className={`tpt-bigprice ${free ? "tpt-free" : ""}`}>{priceLabel(item.price)}</div>
          {primary}
          <div className="tpt-buyrow">
            <a className="tpt-btn tpt-btn-dark" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><Share2 size={15} /> Share with students</a>
            {toggleWish ? (
              <button type="button" className="tpt-wish" aria-pressed={!!wishlisted} onClick={toggleWish}><Bookmark size={16} fill={wishlisted ? "currentColor" : "none"} /> {wishlisted ? "Saved" : "Wish list"}</button>
            ) : !session ? (
              <span style={{ fontSize: 12.5, color: T.muted, textAlign: "center" }}>Log in to save</span>
            ) : <span />}
          </div>
          {!owned && <div style={{ fontSize: 12.5, color: T.muted }}>{isRes ? "Instant download after payment. UPI, cards and net banking via Razorpay." : "Attempt online right after payment and get an instant score report."}</div>}

          <div className="tpt-highlights">
            <h3>Highlights</h3>
            {isRes ? (
              <>
                <HRow icon={GraduationCap} label="Grades">{item.grade}</HRow>
                <HRow icon={School} label="Exam / board">{item.category}</HRow>
                <HRow icon={BookOpen} label="Subject">{item.subject}</HRow>
                <HRow icon={Layers} label="Type">{item.resourceType}</HRow>
                <HRow icon={Globe} label="Language">{item.language}</HRow>
                <HRow icon={FileText} label="Pages">{item.pages}</HRow>
                <HRow icon={Download} label="Format">{[item.fileType, fmtBytes(item.fileSize)].filter(Boolean).join(" · ")}</HRow>
                <HRow icon={Tag} label="Tags">{tags.join(", ")}</HRow>
              </>
            ) : (
              <>
                <HRow icon={School} label="Exam">{item.category}</HRow>
                <HRow icon={ClipboardList} label="Questions">{qCount}</HRow>
                <HRow icon={Clock} label="Duration">{item.duration ? `${item.duration} minutes` : null}</HRow>
                <HRow icon={FileText} label="Format">Online MCQ test · instant topic-wise report</HRow>
                <HRow icon={Tag} label="Topics">{tags.join(", ")}</HRow>
              </>
            )}
          </div>

          {myBundles.length > 0 && (
            <div>
              <h3 className="tpt-h3">Save even more with bundles</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {myBundles.map((b) => {
                  const included = b.testIds.map((id) => testsById[id]).filter(Boolean);
                  const sum = included.reduce((s, t) => s + t.price, 0);
                  const bought = purchasedBundleIds?.has(b.id);
                  return (
                    <div key={b.id} className="tpt-bundle">
                      <div className="tpt-bundle-icon" style={{ background: colorFor(b.title) }}><Package size={22} color="#fff" /></div>
                      <div style={{ minWidth: 0 }}>
                        <b>{b.title}</b>
                        <div style={{ fontSize: 12.5, color: T.muted }}>{included.length} tests · {b.sellerName}</div>
                        <div className="tpt-bp">
                          <span className="tpt-price">{priceLabel(b.price)}</span>
                          {sum > b.price && <><s>{priceLabel(sum)}</s><span className="tpt-save">Save {priceLabel(sum - b.price)}</span></>}
                        </div>
                      </div>
                      {!bought && <button type="button" className="tpt-btn tpt-btn-cart tpt-btn-sm" onClick={() => onBuyBundle(b)}>Buy</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
        {othersBlock && <div className="tpt-others tpt-others-mobile">{othersBlock}</div>}
      </div>

      <section className="tpt-section">
        <h2>Description</h2>
        <div className="tpt-desc">{item.description || (isRes ? "No description provided." : `A ${qCount}-question practice test for ${item.category}.`)}</div>
        {!isRes && (
          <ul className="tpt-desc-list">
            <li>Timed online test you can attempt on phone or laptop</li>
            <li>Instant score report with topic-wise strengths and weak areas</li>
            <li>Retake any time from My Learning</li>
          </ul>
        )}
        {isRes && <p style={{ fontSize: 13, color: T.muted }}>Licence: for use by one teacher with their own students. Please don't re-share the file publicly.</p>}
      </section>

      <section className="tpt-section" ref={reviewsRef} style={{ scrollMarginTop: 80 }}>
        <h2>Reviews {item.ratingCount ? <span style={{ fontSize: 15, color: T.muted, fontWeight: 400 }}>({item.ratingCount})</span> : null}</h2>
        {reviews === null ? <div style={{ color: T.muted, fontSize: 13.5 }}>Loading reviews…</div>
          : reviews.length === 0 ? <div style={{ color: T.muted, fontSize: 13.5 }}>No written reviews yet. Buyers can rate this after {isRes ? "downloading it" : "attempting it"}.</div>
          : reviews.map((r, i) => (
            <div key={i} className="tpt-review">
              <span className="tpt-stars">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} strokeWidth={1.5} color={T.saffronDeep} fill={n <= r.value ? T.saffronDeep : "none"} />)}</span>
              {r.text && <div>{r.text}</div>}
              <div className="tpt-review-who">{r.buyerName || "Buyer"} · {new Date(r.ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
            </div>
          ))}
      </section>

      {more.length > 0 && (
        <section className="tpt-section">
          <h2>More from {item.sellerName}</h2>
          <div className="tpt-grid">{more.map((x) => <ProductCard key={x.id} item={x} onOpen={onOpen} onBuy={() => onOpen(x)} />)}</div>
        </section>
      )}
      {similar.length > 0 && (
        <section className="tpt-section">
          <h2>You may also like</h2>
          <div className="tpt-grid">{similar.map((x) => <ProductCard key={x.id} item={x} onOpen={onOpen} onBuy={() => onOpen(x)} />)}</div>
        </section>
      )}

      {showSticky && (
        <div className="tpt-sticky" role="region" aria-label="Quick buy">
          <div className="tpt-sticky-inner">
            <div className="tpt-sticky-thumb"><ItemCover item={item} variant="thumb" /></div>
            <div className="tpt-sticky-title"><b>{item.title}</b><RatingLine item={item} /></div>
            <span className={`tpt-price ${free ? "tpt-free" : ""}`}>{priceLabel(item.price)}</span>
            {owned
              ? <button type="button" className="tpt-btn tpt-btn-cart tpt-btn-sm" onClick={onOwnedAction}>{isRes ? "Download" : "Start test"}</button>
              : <button type="button" className="tpt-btn tpt-btn-cart tpt-btn-sm" onClick={onBuy}>{free ? "Get free" : "Buy now"}</button>}
            {toggleWish && <BookmarkButton active={wishlisted} onClick={toggleWish} />}
          </div>
        </div>
      )}

      {showPreview && <PreviewModal item={item} owned={owned} onBuy={onBuy} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Seller: upload a resource                                              */
/* ---------------------------------------------------------------------- */
const MAX_FILE_MB = 50;
const MAX_IMG_MB = 3;

export function ResourceUploadWizard({ categories, options, onClose, onPublished }) {
  const [f, setF] = useState({ title: "", resourceType: "Worksheet", grade: "Class 9-10", category: "", subject: "", language: "English", price: "49", pages: "", tags: "", description: "" });
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const coverUrl = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  const previewUrls = useMemo(() => previews.map((p) => URL.createObjectURL(p)), [previews]);
  useEffect(() => () => { if (coverUrl) URL.revokeObjectURL(coverUrl); }, [coverUrl]);
  useEffect(() => () => previewUrls.forEach((u) => URL.revokeObjectURL(u)), [previewUrls]);

  const pickFile = (e) => {
    const x = e.target.files?.[0];
    if (!x) return;
    if (x.size > MAX_FILE_MB * 1024 * 1024) { setError(`That file is ${fmtBytes(x.size)}. The limit is ${MAX_FILE_MB} MB — compress the PDF or split it into parts.`); return; }
    setError(""); setFile(x);
    if (!f.title) setF((v) => ({ ...v, title: x.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 140) }));
  };
  const pickCover = (e) => {
    const x = e.target.files?.[0];
    if (!x) return;
    if (x.size > MAX_IMG_MB * 1024 * 1024) { setError(`Cover image must be under ${MAX_IMG_MB} MB.`); return; }
    setError(""); setCover(x);
  };
  const pickPreviews = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.some((x) => x.size > MAX_IMG_MB * 1024 * 1024)) { setError(`Each preview image must be under ${MAX_IMG_MB} MB.`); return; }
    setError(""); setPreviews((p) => [...p, ...list].slice(0, 4));
    e.target.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Attach the resource file first (PDF, Word, PowerPoint, Excel or ZIP)."); return; }
    if (!f.title.trim()) { setError("Add a title."); return; }
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);
    if (cover) fd.append("cover", cover);
    previews.forEach((p) => fd.append("previews", p));
    setError(""); setProgress(0);
    try {
      const { resource } = await api.uploadResource(fd, setProgress);
      onPublished(resource);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setProgress(null);
    }
  };

  const busy = progress !== null;
  const yourShare = options?.sellerShare ?? null;

  return (
    <div className="modal-backdrop">
      <form className="modal-card" style={{ maxWidth: 760 }} onSubmit={submit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>Upload a teaching resource</div>
          {!busy && <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>}
        </div>
        <div className="modal-body tpt-upload">
          <div className="tpt-upload-grid">
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <label className="tpt-drop">
                <input type="file" accept=".pdf,.docx,.pptx,.xlsx,.zip" onChange={pickFile} disabled={busy} />
                <Upload size={20} color={T.saffronDeep} />
                {file ? <span><b>{file.name}</b><br />{fmtBytes(file.size)} · tap to change</span> : <span><b>Choose the resource file</b><br />PDF, Word, PowerPoint, Excel or ZIP · up to {MAX_FILE_MB} MB</span>}
              </label>
              <label className="field-label">Title
                <input id="res-title" className="field-input" value={f.title} onChange={set("title")} maxLength={140} placeholder="e.g. Class 10 Chemical Reactions worksheet with answer key" required />
              </label>
              <div className="tpt-two">
                <label className="field-label">Resource type
                  <select id="res-type" className="field-input" value={f.resourceType} onChange={set("resourceType")}>{(options?.types || []).map((t) => <option key={t}>{t}</option>)}</select>
                </label>
                <label className="field-label">Class / level
                  <select id="res-grade" className="field-input" value={f.grade} onChange={set("grade")}>{(options?.grades || []).map((g) => <option key={g}>{g}</option>)}</select>
                </label>
              </div>
              <div className="tpt-two">
                <label className="field-label">Subject
                  <input id="res-subject" className="field-input" value={f.subject} onChange={set("subject")} placeholder="e.g. Chemistry" maxLength={60} />
                </label>
                <label className="field-label">Exam / board (optional)
                  <select id="res-category" className="field-input" value={f.category} onChange={set("category")}>
                    <option value="">None</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div className="tpt-two">
                <label className="field-label">Language
                  <select id="res-lang" className="field-input" value={f.language} onChange={set("language")}>{(options?.languages || []).map((l) => <option key={l}>{l}</option>)}</select>
                </label>
                <label className="field-label">Pages
                  <input id="res-pages" className="field-input" type="number" min="1" value={f.pages} onChange={set("pages")} placeholder="e.g. 12" />
                </label>
              </div>
              <div className="tpt-two">
                <label className="field-label">Price (₹, 0 for free)
                  <input id="res-price" className="field-input" type="number" min="0" max="10000" value={f.price} onChange={set("price")} required />
                </label>
                <label className="field-label">Tags (comma separated)
                  <input id="res-tags" className="field-input" value={f.tags} onChange={set("tags")} placeholder="CBSE, revision, answer key" />
                </label>
              </div>
              <label className="field-label">Description
                <textarea id="res-desc" className="field-input" rows={4} value={f.description} onChange={set("description")} placeholder="What's inside, how teachers can use it in class, and whether an answer key is included." />
              </label>
            </div>

            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <div className="field-label">Cover image (shown on the card)
                <label className="tpt-imgpick">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickCover} disabled={busy} />
                  {coverUrl ? <img src={coverUrl} alt="Cover preview" /> : <span><ImagePlus size={20} /><br />Add cover<br /><small>PNG/JPG, portrait works best</small></span>}
                </label>
              </div>
              <div className="field-label">Preview pages (up to 4)
                <div className="tpt-prevpick">
                  {previewUrls.map((u, i) => (
                    <div key={u} className="tpt-prev">
                      <img src={u} alt={`Preview ${i + 1}`} />
                      <button type="button" aria-label="Remove preview" onClick={() => setPreviews((p) => p.filter((_, j) => j !== i))}><X size={12} /></button>
                    </div>
                  ))}
                  {previews.length < 4 && (
                    <label className="tpt-prev tpt-prev-add">
                      <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={pickPreviews} disabled={busy} />
                      <Plus size={18} />
                    </label>
                  )}
                </div>
                <small style={{ color: T.muted, fontWeight: 400 }}>Screenshots of 2–3 pages help teachers decide to buy. Add a "Sample" watermark if you like.</small>
              </div>
              {yourShare !== null && Number(f.price) > 0 && (
                <div className="split-note">You earn about <b>₹{Math.round(Number(f.price) * yourShare / 100)}</b> per sale ({yourShare}% of ₹{f.price}).</div>
              )}
            </div>
          </div>

          {error && <div className="tpt-error" role="alert">{error}</div>}
          {busy && (
            <div className="tpt-progress" aria-live="polite">
              <div className="tpt-progress-bar"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
              <span>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : "Saving…"}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            {!busy && <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>}
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? <><Loader2 size={15} className="spin" /> Publishing…</> : <><Upload size={15} /> Publish resource</>}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Seller: resource catalogue panel (inside Seller Studio)                */
/* ---------------------------------------------------------------------- */
export function SellerResourcesPanel({ myResources, sellerShare, categories, onPublished, onUpdated, onRemoved, onOpen }) {
  const [options, setOptions] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { id, price }
  const [msg, setMsg] = useState("");
  useEffect(() => { api.getResourceOptions().then(setOptions).catch(() => setOptions({ types: [], grades: [], languages: [], uploadsEnabled: false })); }, []);

  const savePrice = async () => {
    try {
      const { resource } = await api.updateResource(editing.id, { price: Number(editing.price) });
      onUpdated(resource); setEditing(null);
    } catch (err) { setMsg(err.message); }
  };
  const remove = async (r) => {
    if (!window.confirm(`Remove "${r.title}" from the marketplace? Teachers who already bought it can still download it.`)) return;
    try { await api.deleteResource(r.id); onRemoved(r.id); } catch (err) { setMsg(err.message); }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: T.saffronDeep, textTransform: "uppercase", marginBottom: 4 }}>Catalogue</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: T.ink, margin: 0 }}>Your teaching resources</h2>
        </div>
        <button type="button" className="btn-primary" onClick={() => setOpen(true)} disabled={options && !options.uploadsEnabled}><Upload size={15} /> Upload resource</button>
      </div>
      {options && !options.uploadsEnabled && (
        <div className="split-note" style={{ marginBottom: 14 }}>Resource uploads switch on shortly — file storage is being connected.</div>
      )}
      {msg && <div className="tpt-error" role="alert" style={{ marginBottom: 12 }}>{msg}</div>}
      {myResources.length === 0 ? (
        <div className="empty-panel">
          <Layers size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Sell your notes and worksheets too</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>Upload PDFs, slides or question banks you already use in class. You keep {sellerShare}% of every sale.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {myResources.map((r) => {
            const earn = Math.round((r.gross || 0) * (sellerShare / 100));
            return (
              <div key={r.id} className="ledger-row">
                <div style={{ width: 54, flexShrink: 0 }}><ItemCover item={asResource(r)} variant="thumb" /></div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16.5, color: T.ink }}>{r.title}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, fontFamily: "var(--font-mono)" }}>{r.resourceType} · {r.grade} · {r.fileType}</div>
                </div>
                <div className="ledger-figures">
                  <div><div className="fig-label">Price</div>
                    {editing?.id === r.id ? (
                      <span style={{ display: "flex", gap: 4 }}>
                        <input className="field-input" style={{ width: 80, padding: "4px 6px" }} type="number" min="0" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} aria-label="New price" />
                        <button type="button" className="icon-btn" onClick={savePrice} aria-label="Save price"><Check size={15} /></button>
                      </span>
                    ) : <div className="fig-value">{priceLabel(r.price)}</div>}
                  </div>
                  <div><div className="fig-label">Sold</div><div className="fig-value">{r.unitsSold || 0}</div></div>
                  <div><div className="fig-label">Gross</div><div className="fig-value">₹{r.gross || 0}</div></div>
                  <div><div className="fig-label">You earn</div><div className="fig-value" style={{ color: T.green }}>₹{earn}</div></div>
                </div>
                <button type="button" className="icon-btn" title="View listing" onClick={() => onOpen(asResource(r))}><Eye size={15} /></button>
                <button type="button" className="icon-btn" title="Edit price" onClick={() => setEditing({ id: r.id, price: r.price })}><Pencil size={15} /></button>
                <button type="button" className="icon-btn" title="Remove listing" onClick={() => remove(r)}><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
      )}
      {open && options && (
        <ResourceUploadWizard
          categories={categories}
          options={{ ...options, sellerShare }}
          onClose={() => setOpen(false)}
          onPublished={(r) => { setOpen(false); onPublished(r); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Buyer: resource library (inside My Learning)                           */
/* ---------------------------------------------------------------------- */
export function MyResourcesPanel({ resources, purchases, onOpen, onBrowse, onDownload, onRated }) {
  const [rating, setRating] = useState(null); // { resource, value, text }
  const [msg, setMsg] = useState("");
  const byId = Object.fromEntries(resources.map((r) => [r.id, r]));
  const mine = purchases.map((p) => byId[p.resourceId]).filter(Boolean);

  const sendRating = async () => {
    try {
      const { resource } = await api.rateResource(rating.resource.id, rating.value, rating.text);
      onRated(resource); setRating(null); setMsg("Thanks — your review is posted.");
    } catch (err) { setMsg(err.message); setRating(null); }
  };

  if (mine.length === 0) {
    return (
      <div className="empty-panel">
        <Layers size={22} color={T.saffronDeep} />
        <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>No resources yet</div>
        <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, marginBottom: 14 }}>Worksheets, notes and slides you buy or get free will be here to download any time.</div>
        <button type="button" className="btn-primary" onClick={onBrowse}><Store size={15} /> Browse resources</button>
      </div>
    );
  }
  return (
    <>
      {msg && <div className="split-note" style={{ marginBottom: 12 }}>{msg}</div>}
      <div className="tpt-grid">
        {mine.map((r) => (
          <article key={r.id} className="tpt-card">
            <a className="tpt-card-thumb" href={itemPath(asResource(r))} onClick={(e) => { e.preventDefault(); onOpen(asResource(r)); }} tabIndex={-1} aria-hidden="true"><ItemCover item={asResource(r)} /></a>
            <div className="tpt-card-body">
              <div className="tpt-card-title" style={{ cursor: "default" }}>{r.title}</div>
              <div className="tpt-card-hl">{r.fileType} · {fmtBytes(r.fileSize)}</div>
            </div>
            <div className="tpt-card-foot">
              <button type="button" className="tpt-btn tpt-btn-cart tpt-btn-sm" style={{ flex: 1 }} onClick={() => onDownload(r)}><Download size={14} /> Download</button>
              <button type="button" className="tpt-btn tpt-btn-ghost tpt-btn-sm" onClick={() => setRating({ resource: r, value: 5, text: "" })}><Star size={14} /> Rate</button>
            </div>
          </article>
        ))}
      </div>
      {rating && (
        <div className="modal-backdrop" onClick={() => setRating(null)}>
          <div className="modal-card" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Rate resource">
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: T.ink }}>Rate “{rating.resource.title}”</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className="icon-btn" aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating({ ...rating, value: n })}>
                    <Star size={26} color={T.saffronDeep} fill={n <= rating.value ? T.saffronDeep : "none"} />
                  </button>
                ))}
              </div>
              <label className="field-label">How did you use it? (optional)
                <textarea className="field-input" rows={3} maxLength={600} value={rating.text} onChange={(e) => setRating({ ...rating, text: e.target.value })} />
              </label>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline" onClick={() => setRating(null)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={sendRating}>Post review</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Styles (appended to AppShell's <style> block)                          */
/* ---------------------------------------------------------------------- */
export const TPT_CSS = `
  .tpt-plain { background: none; border: none; padding: 0; color: inherit; font: inherit; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
  .tpt-link { color: ${T.saffronDeep}; font-weight: 600; font-size: 13.5px; }
  .tpt-tabs { display: flex; gap: 6px; border-bottom: 1px solid ${T.line}; margin-bottom: 20px; }
  .tpt-tab { background: none; border: none; padding: 10px 4px 12px; margin-right: 14px; font-size: 15px; font-weight: 500; color: ${T.muted}; border-bottom: 2.5px solid transparent; display: inline-flex; align-items: center; gap: 6px; }
  .tpt-tab[aria-selected="true"] { color: ${T.ink}; font-weight: 700; border-bottom-color: ${T.saffronDeep}; }
  .tpt-tab .tpt-count { font-family: var(--font-mono); font-size: 11px; background: ${T.paperAlt}; border-radius: 999px; padding: 1px 7px; color: ${T.inkSoft}; }
  .tpt-filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }

  .tpt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
  .tpt-card { background: #fff; border: 1px solid ${T.line}; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
  .tpt-card:hover { border-color: ${T.ink}; box-shadow: 0 4px 14px rgba(27,42,74,0.08); }
  .tpt-card-thumb, .tpt-card-thumb:hover { text-decoration: none; }
  .tpt-ellipsis { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tpt-others-mobile { display: none; }
  .tpt-card-thumb { display: grid; place-items: center; background: ${T.paperAlt}; padding: 18px 0; border-bottom: 1px solid ${T.line}; }
  .tpt-card-body { padding: 12px 14px 8px; display: grid; gap: 5px; flex: 1; align-content: start; }
  .tpt-card-title { font-weight: 600; font-size: 14.5px; line-height: 1.3; color: ${T.ink}; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .tpt-card-title:hover { text-decoration: underline; }
  .tpt-card-seller { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: ${T.muted}; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tpt-card-hl { font-size: 12.5px; color: ${T.inkSoft}; }
  .tpt-card-foot { display: flex; align-items: center; gap: 8px; padding: 4px 14px 14px; }
  .tpt-card-foot .tpt-price { margin-right: auto; }

  .tpt-cover { display: block; border-radius: 4px; box-shadow: 0 3px 10px rgba(27,42,74,0.22); }
  .tpt-cover-card { width: 64%; aspect-ratio: 3 / 4; }
  .tpt-cover-main { width: 100%; aspect-ratio: 4 / 3; border-radius: 0; box-shadow: none; }
  .tpt-cover-thumb { width: 100%; aspect-ratio: 1; border-radius: 4px; box-shadow: none; }
  .tpt-cover-img { object-fit: cover; background: #fff; }
  .tpt-cover-main.tpt-cover-img { object-fit: contain; background: ${T.paperAlt}; }
  .tpt-cover-gen { color: #fff; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;
    background-image: repeating-linear-gradient(180deg, transparent 0 17px, rgba(255,255,255,0.13) 17px 18px); }
  .tpt-cover-tag { align-self: flex-start; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; background: rgba(0,0,0,0.25); border-radius: 4px; padding: 2px 7px; }
  .tpt-cover-big { font-family: var(--font-display); font-weight: 700; font-size: 20px; line-height: 1.1; overflow-wrap: anywhere; }
  .tpt-cover-small { font-size: 11.5px; opacity: 0.9; }
  .tpt-cover-main.tpt-cover-gen { padding: 28px; }
  .tpt-cover-main .tpt-cover-big { font-size: clamp(28px, 4vw, 46px); }
  .tpt-cover-thumb.tpt-cover-gen { padding: 5px; }
  .tpt-cover-thumb .tpt-cover-tag, .tpt-cover-thumb .tpt-cover-small { display: none; }
  .tpt-cover-thumb .tpt-cover-big { font-size: 10px; }

  .tpt-rating { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; white-space: nowrap; color: ${T.ink}; }
  .tpt-rating-new { font-family: var(--font-mono); font-size: 11px; color: ${T.green}; text-transform: uppercase; letter-spacing: 0.05em; }
  .tpt-rating-count { color: ${T.muted}; }
  .tpt-stars { display: inline-flex; gap: 1px; }
  .tpt-avatar { display: inline-grid; place-items: center; border-radius: 50%; color: #fff; font-weight: 700; font-family: var(--font-body); flex-shrink: 0; }

  .tpt-price { font-family: var(--font-display); font-size: 19px; color: ${T.ink}; font-weight: 700; }
  .tpt-free { color: ${T.green}; }
  .tpt-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; border-radius: 999px; padding: 10px 18px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
  .tpt-btn-sm { padding: 7px 14px; font-size: 13px; }
  .tpt-btn-lg { width: 100%; padding: 13px; font-size: 16px; }
  .tpt-btn-cart { background: ${T.green}; color: #fff; }
  .tpt-btn-cart:hover { background: #276843; }
  .tpt-btn-dark { background: ${T.ink}; color: ${T.paper}; }
  .tpt-btn-dark:hover { background: ${T.inkSoft}; }
  .tpt-btn-ghost { background: ${T.paperAlt}; color: ${T.ink}; }
  .tpt-btn-outline { background: transparent; color: ${T.ink}; border: 1.5px solid ${T.ink}; padding: 8px 28px; }
  .tpt-bookmark { flex-shrink: 0; border-radius: 50%; border: 1px solid ${T.line}; background: #fff; color: ${T.ink}; display: grid; place-items: center; padding: 0; }
  .tpt-bookmark[aria-pressed="true"] { background: ${T.green}; border-color: ${T.green}; color: #fff; }

  .tpt-page { padding: 18px 28px 48px; max-width: 1240px; margin: 0 auto; }
  .tpt-crumbs { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; font-size: 13px; color: ${T.muted}; margin-bottom: 16px; }
  .tpt-crumbs .tpt-plain { color: ${T.ink}; font-weight: 600; }
  .tpt-pp { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 40px; align-items: start; }
  .tpt-gallery { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 14px; align-items: start; }
  .tpt-gallery-single { grid-template-columns: minmax(0, 1fr); }
  .tpt-gallery-single .tpt-gallery-foot { grid-column: auto; }
  .tpt-thumbs { display: flex; flex-direction: column; gap: 10px; }
  .tpt-thumb { width: 72px; height: 72px; border: 2px solid ${T.line}; border-radius: 8px; background: #fff; padding: 3px; overflow: hidden; }
  .tpt-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
  .tpt-thumb[aria-selected="true"] { border-color: ${T.ink}; }
  .tpt-main-img { border: 1px solid ${T.line}; border-radius: 12px; overflow: hidden; background: ${T.paperAlt}; }
  .tpt-main-img > img { width: 100%; display: block; max-height: 640px; object-fit: contain; }
  .tpt-gallery-foot { grid-column: 2; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
  .tpt-share { display: flex; gap: 12px; align-items: center; font-size: 13px; color: ${T.muted}; flex-wrap: wrap; }
  .tpt-share a, .tpt-share .tpt-plain { color: ${T.ink}; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
  .tpt-others { grid-column: 1 / -1; margin-top: 18px; display: grid; gap: 12px; justify-items: start; }
  .tpt-others h2, .tpt-section h2 { font-family: var(--font-display); font-size: 23px; color: ${T.ink}; margin: 0; }
  .tpt-others blockquote { margin: 0; font-size: 15px; line-height: 1.55; color: ${T.ink}; max-width: 62ch; }
  .tpt-others blockquote footer { font-size: 13px; color: ${T.muted}; margin-top: 4px; font-weight: 600; }

  .tpt-side { display: grid; gap: 14px; min-width: 0; }
  .tpt-side h1 { font-family: var(--font-display); font-size: 27px; line-height: 1.2; color: ${T.ink}; margin: 0; text-wrap: balance; }
  .tpt-seller-line { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .tpt-follow { display: inline-flex; align-items: center; gap: 5px; background: none; border: none; padding: 4px 2px; color: #2B6BE0; font-weight: 600; font-size: 14px; }
  .tpt-follow[aria-pressed="true"] { color: ${T.green}; }
  .tpt-followers { font-size: 13px; color: ${T.muted}; }
  .tpt-seller-name { font-weight: 600; font-size: 15.5px; color: ${T.ink}; }
  .tpt-bigprice { font-family: var(--font-display); font-size: 34px; font-weight: 700; color: ${T.ink}; line-height: 1; }
  .tpt-buyrow { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: center; }
  .tpt-wish { background: none; border: none; color: ${T.ink}; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; }
  .tpt-wish[aria-pressed="true"] { color: ${T.green}; }
  .tpt-highlights { border-top: 1px solid ${T.line}; padding-top: 14px; }
  .tpt-highlights h3, .tpt-h3 { font-family: var(--font-display); font-size: 21px; color: ${T.ink}; margin: 0 0 8px; }
  .tpt-hrow { display: flex; gap: 10px; align-items: flex-start; font-size: 14.5px; padding: 4px 0; color: ${T.ink}; }
  .tpt-hrow svg { flex: 0 0 17px; margin-top: 2px; color: ${T.muted}; }
  .tpt-hrow b { min-width: 96px; font-weight: 600; }
  .tpt-bundle { display: grid; grid-template-columns: 54px minmax(0, 1fr) auto; gap: 12px; align-items: center; border: 1px solid ${T.line}; border-radius: 10px; padding: 10px; background: #fff; }
  .tpt-bundle-icon { width: 54px; height: 54px; border-radius: 8px; display: grid; place-items: center; }
  .tpt-bundle b { display: block; font-size: 14px; line-height: 1.3; color: ${T.ink}; }
  .tpt-bp { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; margin-top: 2px; }
  .tpt-bp s { color: ${T.muted}; font-size: 13px; }
  .tpt-save { color: ${T.red}; font-weight: 600; font-size: 13px; }

  .tpt-section { margin-top: 36px; display: grid; gap: 12px; }
  .tpt-desc { white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: ${T.ink}; max-width: 72ch; }
  .tpt-desc-list { margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 1.7; color: ${T.inkSoft}; }
  .tpt-review { border-bottom: 1px solid ${T.line}; padding: 12px 0; display: grid; gap: 4px; font-size: 14.5px; max-width: 72ch; }
  .tpt-review-who { font-size: 12.5px; color: ${T.muted}; }

  .tpt-sticky { position: fixed; top: 0; left: 0; right: 0; z-index: 40; background: #fff; border-bottom: 1px solid ${T.line}; box-shadow: 0 2px 12px rgba(27,42,74,0.12); padding-top: env(safe-area-inset-top, 0px); }
  .tpt-sticky-inner { max-width: 1240px; margin: 0 auto; display: flex; align-items: center; gap: 12px; padding: 8px 28px; }
  .tpt-sticky-thumb { width: 44px; flex-shrink: 0; }
  .tpt-sticky-title { flex: 1; min-width: 0; display: grid; }
  .tpt-sticky-title b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${T.ink}; font-size: 14.5px; }

  .tpt-upload-grid { display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 20px; }
  .tpt-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .tpt-drop { display: flex; gap: 12px; align-items: center; border: 2px dashed ${T.line}; border-radius: 10px; padding: 14px; background: #fff; cursor: pointer; font-size: 13px; color: ${T.inkSoft}; }
  .tpt-drop input, .tpt-imgpick input, .tpt-prev-add input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .tpt-drop:focus-within, .tpt-imgpick:focus-within, .tpt-prev-add:focus-within { outline: 3px solid ${T.saffron}; }
  .tpt-imgpick { position: relative; display: grid; place-items: center; aspect-ratio: 3 / 4; border: 2px dashed ${T.line}; border-radius: 10px; background: #fff; cursor: pointer; text-align: center; font-size: 12.5px; color: ${T.muted}; overflow: hidden; }
  .tpt-imgpick img { width: 100%; height: 100%; object-fit: cover; }
  .tpt-prevpick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .tpt-prev { position: relative; aspect-ratio: 3 / 4; border: 1px solid ${T.line}; border-radius: 6px; overflow: hidden; background: #fff; }
  .tpt-prev img { width: 100%; height: 100%; object-fit: cover; }
  .tpt-prev button { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; border: none; background: rgba(0,0,0,0.6); color: #fff; display: grid; place-items: center; padding: 0; }
  .tpt-prev-add { display: grid; place-items: center; border-style: dashed; cursor: pointer; color: ${T.muted}; }
  .tpt-error { color: ${T.red}; font-size: 13px; background: rgba(184,80,62,0.1); border: 1px solid ${T.red}; border-radius: 8px; padding: 10px 12px; margin-top: 12px; }
  .tpt-progress { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: 13px; color: ${T.inkSoft}; }
  .tpt-progress-bar { flex: 1; height: 8px; border-radius: 4px; background: ${T.paperAlt}; overflow: hidden; }
  .tpt-progress-bar div { height: 100%; background: ${T.green}; transition: width 0.2s; }

  @media (max-width: 900px) {
    .tpt-pp { grid-template-columns: 1fr; gap: 24px; }
    .tpt-upload-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .tpt-page { padding: 14px 16px 40px; }
    .tpt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .tpt-card-thumb { padding: 12px 0; }
    .tpt-card-body { padding: 10px 10px 6px; }
    .tpt-card-foot { padding: 4px 10px 10px; flex-wrap: wrap; }
    .tpt-card-foot .tpt-btn-sm { padding: 6px 10px; }
    .tpt-gallery { grid-template-columns: 1fr; }
    .tpt-thumbs { flex-direction: row; order: 2; overflow-x: auto; }
    .tpt-thumb { flex: 0 0 60px; width: 60px; height: 60px; }
    .tpt-gallery-foot { grid-column: auto; order: 3; }
    .tpt-others-desktop { display: none; }
    .tpt-others-mobile { display: grid; margin-top: 0; }
    .tpt-sticky-inner { padding: 8px 16px; }
    .tpt-sticky-title .tpt-rating { display: none; }
    .tpt-two { grid-template-columns: 1fr; }
    .tpt-side h1 { font-size: 23px; }
  }
  @media (max-width: 380px) {
    .tpt-grid { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) { .tpt-progress-bar div { transition: none; } }
`;
