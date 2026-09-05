import React, { useState, useMemo, useEffect, useRef } from "react";
import { api } from "./api.js";
import {
  Star, ShoppingCart, Plus, Clock, Users, TrendingUp, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, Award, Settings, Trash2, Play, Search, X,
  Store, GraduationCap, BookOpen, Wallet, IndianRupee, Ticket, ClipboardList,
  LogIn, LogOut, User, Landmark, ShieldCheck, CreditCard, Smartphone,
  Building2, ArrowDownToLine, Loader2, Lock, MessageCircle, Send, Bot,
  Share2, Copy, Bell, Gift, Timer, Megaphone, Check, Sparkles, ShieldOff, Package,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */
const T = {
  ink: "#1B2A4A",
  inkSoft: "#3B4C72",
  paper: "#FBF7EE",
  paperAlt: "#F1E9D6",
  saffron: "#E8A33D",
  saffronDeep: "#C97F1B",
  green: "#2F7A4F",
  red: "#B8503E",
  line: "#CBBFA0",
  muted: "#79705C",
};

/* ---------------------------------------------------------------------- */
/* Seed data                                                               */
/* ---------------------------------------------------------------------- */
const CATEGORIES_SEED = [
  "NEET", "JEE Main", "UPSC CSE", "SSC CGL", "Banking (IBPS)",
  "Class 10 Boards", "Class 12 Boards", "State PSC",
];

function q(text, options, correct, topic, explanation) {
  return { text, options, correct, topic, explanation };
}

function seedTests() {
  return [
    {
      id: "t1", title: "NEET Biology — Genetics & Evolution Sprint",
      sellerName: "Dr. Meera's Biology Lab", category: "NEET", price: 149,
      duration: 20, rating: 4.7, ratingCount: 182,
      description: "20-min sprint covering Mendelian genetics, molecular basis of inheritance, and evolution — high-yield NEET topics.",
      questions: [
        q("Which nitrogenous base is unique to RNA?", ["Adenine", "Cytosine", "Uracil", "Guanine"], 2, "Molecular Biology", "Uracil replaces thymine in RNA."),
        q("Mendel's law of independent assortment applies to genes located on:", ["The same chromosome, closely linked", "Different chromosomes", "The X chromosome only", "Mitochondrial DNA"], 1, "Genetics", "Independent assortment holds for genes on different chromosome pairs."),
        q("Darwinian fitness refers to:", ["Physical strength", "Reproductive success", "Body size", "Speed of movement"], 1, "Evolution", "Fitness is a measure of reproductive output, not physical prowess."),
        q("A test cross is used to determine:", ["Phenotype of F2", "Genotype of a dominant phenotype individual", "Mutation rate", "Linkage distance only"], 1, "Genetics", "Crossing with a homozygous recessive reveals unknown genotype."),
        q("Analogous organs are a result of:", ["Divergent evolution", "Convergent evolution", "Genetic drift", "Co-dominance"], 1, "Evolution", "Analogous structures arise from convergent evolution under similar selection pressure."),
      ],
    },
    {
      id: "t2", title: "NEET Physics — Mechanics Rapid Fire",
      sellerName: "Apex Physics Institute", category: "NEET", price: 129,
      duration: 25, rating: 4.5, ratingCount: 96,
      description: "Numerical-heavy set on kinematics, laws of motion, and work-energy for last-mile NEET revision.",
      questions: [
        q("A body moving with uniform velocity has:", ["Zero acceleration", "Constant acceleration", "Increasing speed", "Zero displacement"], 0, "Kinematics", "Uniform velocity implies no change in velocity, so acceleration is zero."),
        q("The work done by a centripetal force on a body in circular motion is:", ["Positive", "Negative", "Zero", "Depends on radius"], 2, "Work-Energy", "Centripetal force is always perpendicular to velocity, so work done is zero."),
        q("Newton's third law implies action-reaction pairs act on:", ["The same body", "Different bodies", "Only rigid bodies", "Only at contact"], 1, "Laws of Motion", "Action and reaction always act on two different bodies."),
        q("Impulse is equal to change in:", ["Force", "Momentum", "Velocity only", "Acceleration"], 1, "Laws of Motion", "Impulse-momentum theorem: impulse = change in momentum."),
      ],
    },
    {
      id: "t3", title: "JEE Main — Coordinate Geometry Essentials",
      sellerName: "QuantEdge Academy", category: "JEE Main", price: 179,
      duration: 30, rating: 4.6, ratingCount: 64,
      description: "Straight lines, circles, and conic sections framed as JEE-style problem sets with full solutions.",
      questions: [
        q("The distance of point (3,4) from origin is:", ["5", "7", "25", "3"], 0, "Straight Lines", "Distance = sqrt(3^2+4^2) = 5."),
        q("The general equation of a circle is x^2+y^2+2gx+2fy+c=0. Its centre is:", ["(g,f)", "(-g,-f)", "(2g,2f)", "(-2g,-2f)"], 1, "Circles", "Centre of the general circle equation is (-g, -f)."),
        q("Eccentricity of a parabola is:", ["0", "1", "Between 0 and 1", "Greater than 1"], 1, "Conic Sections", "A parabola always has eccentricity exactly 1."),
        q("Two lines are perpendicular when the product of their slopes is:", ["0", "1", "-1", "Undefined"], 2, "Straight Lines", "Perpendicular lines satisfy m1*m2 = -1."),
        q("Length of latus rectum of y^2=4ax is:", ["a", "2a", "4a", "8a"], 2, "Conic Sections", "For y^2=4ax, latus rectum length = 4a."),
      ],
    },
    {
      id: "t4", title: "UPSC CSE Prelims — Polity Foundations",
      sellerName: "CivilPrep Mentors", category: "UPSC CSE", price: 199,
      duration: 25, rating: 4.8, ratingCount: 211,
      description: "Constitutional framework, fundamental rights, and centre-state relations for Prelims GS-1.",
      questions: [
        q("The Preamble was amended by which constitutional amendment?", ["24th", "42nd", "44th", "52nd"], 1, "Constitution", "The 42nd Amendment (1976) added 'Socialist, Secular, Integrity' to the Preamble."),
        q("Fundamental Rights are enshrined in which Part of the Constitution?", ["Part II", "Part III", "Part IV", "Part V"], 1, "Fundamental Rights", "Fundamental Rights are covered under Part III, Articles 12-35."),
        q("Which article provides for the Right to Constitutional Remedies?", ["Article 19", "Article 21", "Article 32", "Article 44"], 2, "Fundamental Rights", "Article 32 is the 'heart and soul' of the Constitution per Dr. Ambedkar."),
        q("Residuary powers under the Indian Constitution rest with:", ["State Legislature", "Parliament", "President", "Judiciary"], 1, "Centre-State Relations", "Article 248 vests residuary powers in Parliament."),
      ],
    },
    {
      id: "t5", title: "IBPS PO — Quant & Reasoning Booster",
      sellerName: "NumberCrunch Banking", category: "Banking (IBPS)", price: 99,
      duration: 20, rating: 4.3, ratingCount: 58,
      description: "Speed-focused quant and reasoning set matching IBPS PO prelims difficulty and pacing.",
      questions: [
        q("If a train 120m long crosses a pole in 12s, its speed is:", ["10 m/s", "12 m/s", "36 m/s", "8 m/s"], 0, "Quant", "Speed = distance/time = 120/12 = 10 m/s."),
        q("In a coding-decoding pattern where CAT=DBU, DOG equals:", ["EPH", "EPI", "FPH", "EOI"], 0, "Reasoning", "Each letter shifts +1: D->E, O->P, G->H."),
        q("The simple interest on Rs.1000 at 10% p.a. for 2 years is:", ["Rs.100", "Rs.150", "Rs.200", "Rs.250"], 2, "Quant", "SI = PRT/100 = 1000*10*2/100 = Rs.200."),
      ],
    },
    {
      id: "t6", title: "Class 10 Boards — Trigonometry Practice Set",
      sellerName: "Apex Physics Institute", category: "Class 10 Boards", price: 79,
      duration: 20, rating: 4.4, ratingCount: 40,
      description: "CBSE-pattern trigonometry questions with step-marked solutions, ideal for board exam drilling.",
      questions: [
        q("The value of sin30° + cos60° is:", ["0", "0.5", "1", "1.5"], 2, "Trigonometric Ratios", "sin30° = 0.5, cos60° = 0.5; sum = 1."),
        q("If tanθ = 1, θ equals:", ["30°", "45°", "60°", "90°"], 1, "Trigonometric Ratios", "tan45° = 1."),
        q("The identity sin²θ + cos²θ equals:", ["0", "1", "2", "tan²θ"], 1, "Identities", "This is the fundamental Pythagorean trigonometric identity."),
      ],
    },
  ];
}

function seedPurchases() {
  const now = Date.now();
  return [
    { id: "p1", testId: "t1", buyer: "Ritika S.", price: 149, ts: now - 86400000 * 12 },
    { id: "p2", testId: "t1", buyer: "Arjun K.", price: 149, ts: now - 86400000 * 10 },
    { id: "p3", testId: "t1", buyer: "Sneha P.", price: 149, ts: now - 86400000 * 6 },
    { id: "p4", testId: "t2", buyer: "Ritika S.", price: 129, ts: now - 86400000 * 9 },
    { id: "p5", testId: "t2", buyer: "Vignesh R.", price: 129, ts: now - 86400000 * 4 },
    { id: "p6", testId: "t3", buyer: "Naveen T.", price: 179, ts: now - 86400000 * 8 },
    { id: "p7", testId: "t4", buyer: "Divya M.", price: 199, ts: now - 86400000 * 15 },
    { id: "p8", testId: "t4", buyer: "Kabir A.", price: 199, ts: now - 86400000 * 3 },
    { id: "p9", testId: "t4", buyer: "Sana R.", price: 199, ts: now - 86400000 * 1 },
    { id: "p10", testId: "t5", buyer: "Pooja N.", price: 99, ts: now - 86400000 * 5 },
    { id: "p11", testId: "t6", buyer: "Vignesh R.", price: 79, ts: now - 86400000 * 2 },
  ];
}

const emptyDraftQuestion = () => ({
  text: "", options: ["", "", "", ""], correct: 0, topic: "", explanation: "",
});

function isBlockedTest(test) {
  return test.ratingCount > 10 && test.rating < 3;
}

function seedNotifications() {
  const now = Date.now();
  return [
    {
      id: "n1", title: "5 new NEET Chemistry sets just landed", message: "Fresh Organic Reactions and Inorganic Chemistry tests are live — perfect for this week's revision.",
      audience: "buyer", offerCode: "NEET10", ts: now - 86400000 * 2,
    },
    {
      id: "n2", title: "Sellers: exam season traffic is up 40%", message: "Candidates are searching more than usual this week — a great time to publish a new test or refresh pricing.",
      audience: "seller", offerCode: null, ts: now - 86400000 * 5,
    },
  ];
}

/* ---------------------------------------------------------------------- */
/* Small shared UI bits                                                   */
/* ---------------------------------------------------------------------- */
function Stars({ value, size = 14 }) {
  const full = Math.round(value);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} color={T.saffronDeep} fill={i <= full ? T.saffronDeep : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function BrandMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill={T.ink} stroke={T.saffron} strokeWidth="1.4" />
      <circle cx="20" cy="20" r="14" fill="none" stroke={T.saffron} strokeWidth="1" strokeDasharray="1.6 2.4" opacity="0.7" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Zilla Slab, Georgia, serif" fontWeight="700" fontSize="15" fill={T.saffron}>TM</text>
    </svg>
  );
}

function Stamp({ children }) {
  return (
    <span
      className="stamp"
      style={{
        border: `1.5px solid ${T.ink}`, color: T.ink, borderRadius: 999,
        padding: "2px 10px", fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.06em", textTransform: "uppercase", transform: "rotate(-2deg)",
        display: "inline-block", background: "rgba(232,163,61,0.12)",
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ eyebrow, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: T.saffronDeep, textTransform: "uppercase", marginBottom: 4 }}>
          {eyebrow}
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: T.ink, margin: 0 }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Auth — registration & login                                            */
/* ---------------------------------------------------------------------- */
function VerifyEmailBanner() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(true);

  const resend = async () => {
    setSending(true);
    try {
      const data = await api.resendVerification();
      setEmailConfigured(data.emailConfigured !== false);
      setSent(true);
    } catch (e) { /* stays unsent, button remains clickable */ }
    setSending(false);
  };

  return (
    <div className="verify-banner">
      <ShieldCheck size={14} />
      <span>
        {sent
          ? (emailConfigured
              ? "Verification email sent — check your inbox for the link."
              : "Verification link generated — check your backend terminal for the simulated email and open the link.")
          : "Please verify your email address."}
      </span>
      {!sent && (
        <button className="link-btn" style={{ color: T.ink, textDecoration: "underline" }} disabled={sending} onClick={resend}>
          {sending ? "Sending…" : "Resend email"}
        </button>
      )}
    </div>
  );
}

function AuthActionModal({ action, onDone }) {
  // action = { kind: 'reset' | 'verify', uid, token }
  const [status, setStatus] = useState(action.kind === "verify" ? "loading" : "form"); // loading | form | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (action.kind === "verify") {
      api.verifyEmail(action.uid, action.token)
        .then(() => setStatus("success"))
        .catch((err) => { setErrorMsg(err.message || "That verification link is invalid or has already been used."); setStatus("error"); });
    }
  }, [action]);

  const submitReset = async () => {
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setErrorMsg("Passwords don't match."); return; }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await api.resetPassword(action.uid, action.token, password);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "That reset link is invalid or has expired — request a new one.");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const title = action.kind === "verify" ? "Verify your email" : "Set a new password";

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>{title}</div>
          <button className="icon-btn" onClick={onDone}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ textAlign: status !== "form" ? "center" : "left" }}>
          {status === "loading" && (
            <div style={{ padding: "20px 0" }}>
              <Loader2 size={28} color={T.saffronDeep} className="spin" />
              <div style={{ fontSize: 13.5, color: T.muted, marginTop: 12 }}>Verifying…</div>
            </div>
          )}

          {status === "success" && action.kind === "verify" && (
            <>
              <CheckCircle2 size={36} color={T.green} style={{ margin: "10px auto 12px" }} />
              <div style={{ fontSize: 14, color: T.ink, marginBottom: 16 }}>Your email is verified.</div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onDone}>Continue to TestMandi</button>
            </>
          )}

          {status === "success" && action.kind === "reset" && (
            <>
              <CheckCircle2 size={36} color={T.green} style={{ margin: "10px auto 12px" }} />
              <div style={{ fontSize: 14, color: T.ink, marginBottom: 16 }}>Your password has been changed. Please log in again.</div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onDone}>Go to log in</button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle size={36} color={T.red} style={{ margin: "10px auto 12px" }} />
              <div style={{ fontSize: 14, color: T.ink, marginBottom: 16 }}>{errorMsg}</div>
              <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={onDone}>Close</button>
            </>
          )}

          {status === "form" && (
            <div style={{ display: "grid", gap: 12 }}>
              <label className="field-label">New password
                <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </label>
              <label className="field-label">Confirm new password
                <input className="field-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Type it again" />
              </label>
              {errorMsg && <div style={{ color: T.red, fontSize: 12.5 }}>{errorMsg}</div>}
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1 }} disabled={submitting} onClick={submitReset}>
                {submitting ? <Loader2 size={15} className="spin" /> : "Set new password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthModal({ initialMode = "login", initialRole = "buyer", onClose, onRegister, onLogin, loginError, defaultReferralCode }) {
  const isAdmin = initialRole === "admin";
  const [mode, setMode] = useState(isAdmin ? "login" : initialMode); // 'login' | 'register' | 'forgot'
  const [accType, setAccType] = useState(isAdmin ? "admin" : initialRole); // 'buyer' | 'seller' | 'advertiser' | 'admin'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [referralCode, setReferralCode] = useState(defaultReferralCode || "");
  const [localError, setLocalError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotEmailConfigured, setForgotEmailConfigured] = useState(true);

  const submitRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim() || ((accType === "seller" || accType === "advertiser") && !businessName.trim())) {
      setLocalError("Please fill in every field.");
      return;
    }
    setLocalError("");
    onRegister({ role: accType, name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password, businessName: businessName.trim(), referralCodeUsed: referralCode.trim().toUpperCase() });
  };

  const submitLogin = () => {
    if (!email.trim() || !password.trim()) { setLocalError("Enter your email and password."); return; }
    setLocalError("");
    onLogin({ email: email.trim().toLowerCase(), password, expectedRole: isAdmin ? "admin" : null });
  };

  const submitForgot = async () => {
    if (!email.trim()) { setLocalError("Enter your email."); return; }
    setLocalError("");
    setForgotSubmitting(true);
    try {
      const data = await api.forgotPassword(email.trim().toLowerCase());
      setForgotEmailConfigured(data.emailConfigured !== false);
      setForgotSent(true);
    } catch (err) {
      setLocalError(err.message || "Something went wrong — try again.");
    } finally {
      setForgotSubmitting(false);
    }
  };

  if (mode === "forgot") {
    return (
      <div className="modal-backdrop">
        <div className="modal-card" style={{ maxWidth: 420 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>Reset your password</div>
            <button className="icon-btn" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body">
            {forgotSent ? (
              <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
                <CheckCircle2 size={32} color={T.green} style={{ margin: "0 auto 12px" }} />
                {forgotEmailConfigured ? (
                  <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>
                    If that email is registered, a reset link has been sent — check your inbox (and spam folder) for it.
                  </div>
                ) : (
                  <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>
                    If that email is registered, a reset link has been generated. Since this server has no email
                    provider connected yet, check the <strong>backend terminal window</strong> for a block starting with
                    <code style={{ background: T.paperAlt, padding: "1px 5px", borderRadius: 4, margin: "0 3px" }}>--- email not sent (SMTP not configured) ---</code>
                    and open the link it prints.
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="field-label">Email
                  <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                {localError && <div style={{ color: T.red, fontSize: 12.5, marginTop: 10 }}>{localError}</div>}
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16, opacity: forgotSubmitting ? 0.6 : 1 }} disabled={forgotSubmitting} onClick={submitForgot}>
                  {forgotSubmitting ? <Loader2 size={15} className="spin" /> : <><Send size={15} /> Send reset link</>}
                </button>
              </>
            )}
            <div style={{ textAlign: "center", fontSize: 12.5, color: T.muted, marginTop: 14 }}>
              <button className="link-btn" onClick={() => { setMode("login"); setForgotSent(false); setLocalError(""); }}>Back to log in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>
            {isAdmin ? "Admin sign-in" : mode === "login" ? "Log in" : "Create an account"}
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!isAdmin && (
            <div className="role-toggle">
              <button className={`role-toggle-btn ${accType === "buyer" ? "active" : ""}`} onClick={() => setAccType("buyer")}>
                <User size={14} /> Buyer
              </button>
              <button className={`role-toggle-btn ${accType === "seller" ? "active" : ""}`} onClick={() => setAccType("seller")}>
                <GraduationCap size={14} /> Seller
              </button>
              <button className={`role-toggle-btn ${accType === "advertiser" ? "active" : ""}`} onClick={() => setAccType("advertiser")}>
                <Megaphone size={14} /> Advertiser
              </button>
            </div>
          )}

          {!isAdmin && mode === "register" && accType === "buyer" && (
            <div className="referral-promo">
              <Gift size={15} color={T.saffronDeep} style={{ flexShrink: 0 }} />
              <span>Refer friends after you sign up — once someone you refer buys their first test, you get <strong>50% off</strong> your next purchase.</span>
            </div>
          )}

          <div style={{ display: "grid", gap: 12, marginTop: isAdmin ? 0 : 16 }}>
            {mode === "register" && (
              <label className="field-label">{accType === "seller" || accType === "advertiser" ? "Contact person name" : "Full name"}
                <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" />
              </label>
            )}
            {mode === "register" && (accType === "seller" || accType === "advertiser") && (
              <label className="field-label">{accType === "seller" ? "Institute / brand name" : "Advertiser / business name"}
                <input className="field-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={accType === "seller" ? "e.g. Apex Physics Institute" : "e.g. Sunrise Stationery Co."} />
              </label>
            )}
            <label className="field-label">Email
              <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            {mode === "register" && (
              <label className="field-label">Phone number
                <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" />
              </label>
            )}
            <label className="field-label">Password
              <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </label>
            {mode === "register" && accType === "buyer" && (
              <label className="field-label">Referral code (optional)
                <input className="field-input" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} placeholder="Got a code from a friend? Enter it here" />
              </label>
            )}
          </div>

          {(localError || loginError) && (
            <div style={{ color: T.red, fontSize: 12.5, marginTop: 10 }}>{localError || loginError}</div>
          )}

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={mode === "login" ? submitLogin : submitRegister}>
            {mode === "login" ? <><LogIn size={15} /> Log in</> : <><CheckCircle2 size={15} /> Register</>}
          </button>

          {mode === "login" && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button className="link-btn" style={{ fontSize: 12 }} onClick={() => { setMode("forgot"); setLocalError(""); }}>Forgot password?</button>
            </div>
          )}

          {!isAdmin && (
            <div style={{ textAlign: "center", fontSize: 12.5, color: T.muted, marginTop: 14 }}>
              {mode === "login" ? (
                <>New here? <button className="link-btn" onClick={() => setMode("register")}>Create an account</button></>
              ) : (
                <>Already registered? <button className="link-btn" onClick={() => setMode("login")}>Log in</button></>
              )}
            </div>
          )}
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
            <Lock size={12} style={{ marginTop: 1, flexShrink: 0 }} />
            Your password is hashed and stored on your own local TestMandi server — never sent anywhere else.
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ uid, token, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("form"); // form | submitting | success

  const submit = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setError("");
    setStatus("submitting");
    try {
      await api.resetPassword(uid, token, password);
      setStatus("success");
    } catch (err) {
      setError(err.message || "That reset link is invalid or has expired — request a new one.");
      setStatus("form");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>Choose a new password</div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
              <CheckCircle2 size={32} color={T.green} style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: 13.5, color: T.ink, marginBottom: 16 }}>Your password has been reset. You've been logged out everywhere for safety — log in again with your new password.</div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onDone}>Log in</button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 12 }}>
                <label className="field-label">New password
                  <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
                </label>
                <label className="field-label">Confirm new password
                  <input className="field-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
                </label>
              </div>
              {error && <div style={{ color: T.red, fontSize: 12.5, marginTop: 10 }}>{error}</div>}
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16, opacity: status === "submitting" ? 0.6 : 1 }} disabled={status === "submitting"} onClick={submit}>
                {status === "submitting" ? <Loader2 size={15} className="spin" /> : <><CheckCircle2 size={15} /> Reset password</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Checkout — payment gateway simulation                                  */
/* ---------------------------------------------------------------------- */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutModal({ kind, itemId, adDraft, displayTitle, displayPrice, sellerName, buyerName, onClose, onSuccess }) {
  const [phase, setPhase] = useState("form"); // form | processing | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [applyReward, setApplyReward] = useState(false);
  const [hasReward, setHasReward] = useState(false);
  const [resultRecord, setResultRecord] = useState(null);
  const payerLabel = kind === "ad" ? "Advertiser" : "Buyer";

  useEffect(() => {
    if (kind === "ad") return;
    api.getMyReferrals().then((data) => setHasReward((data.rewards || []).some((r) => !r.used))).catch(() => {});
  }, [kind]);

  const shownPrice = applyReward && hasReward ? Math.round(displayPrice * 0.5) : displayPrice;

  const pay = async () => {
    setPhase("processing");
    setErrorMsg("");
    try {
      const order = await api.createOrder({ kind, itemId, adDraft, applyReward });

      if (order.free) {
        // Backend already completed this at zero cost — nothing to pay for.
        setResultRecord(order);
        setPhase("success");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setErrorMsg("Couldn't load the Razorpay checkout script — check your internet connection.");
        setPhase("error");
        return;
      }
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.order.amount,
        currency: order.order.currency,
        order_id: order.order.id,
        name: "TestMandi",
        description: order.description,
        prefill: { name: buyerName },
        theme: { color: "#1B2A4A" },
        handler: async (response) => {
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setResultRecord(verifyRes);
            setPhase("success");
          } catch (err) {
            setErrorMsg(err.message || "Payment verification failed — no purchase was recorded.");
            setPhase("error");
          }
        },
        modal: { ondismiss: () => setPhase("form") },
      });
      rzp.on("payment.failed", () => { setErrorMsg("Payment failed or was cancelled."); setPhase("form"); });
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || "Couldn't start checkout.");
      setPhase("error");
    }
  };

  if (phase === "success") {
    return (
      <div className="modal-backdrop">
        <div className="modal-card" style={{ maxWidth: 420 }}>
          <div style={{ padding: "40px 26px", textAlign: "center" }}>
            <CheckCircle2 size={40} color={T.green} style={{ margin: "0 auto 14px" }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink, marginBottom: 6 }}>Payment successful</div>
            <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 18 }}>
              {kind === "ad" ? (
                <>Your ad <strong style={{ color: T.ink }}>{displayTitle}</strong> is now live.</>
              ) : (
                <>Payment confirmed for <strong style={{ color: T.ink }}>{displayTitle}</strong>. It's now unlocked in My Learning.</>
              )}
            </div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onSuccess(resultRecord)}>
              {kind === "ad" ? "Go to Ads Studio" : "Go to My Learning"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink, display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={18} color={T.green} /> Secure checkout
          </div>
          {phase !== "processing" && <button className="icon-btn" onClick={onClose}><X size={18} /></button>}
        </div>

        <div className="modal-body">
          <div className="order-summary">
            <div>
              <div style={{ fontSize: 13.5, color: T.ink }}>{displayTitle}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{sellerName} · {payerLabel}: {buyerName}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {applyReward && hasReward && <div style={{ fontSize: 12, color: T.muted, textDecoration: "line-through" }}>₹{displayPrice}</div>}
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>₹{shownPrice}</div>
            </div>
          </div>

          {hasReward && (
            <label className="reward-toggle">
              <input type="checkbox" checked={applyReward} onChange={(e) => setApplyReward(e.target.checked)} />
              <Gift size={14} color={T.saffronDeep} />
              <span>Apply your referral reward — <strong>50% off</strong> this purchase</span>
            </label>
          )}

          {phase === "processing" && (
            <div style={{ textAlign: "center", padding: "34px 0" }}>
              <Loader2 size={28} color={T.saffronDeep} className="spin" />
              <div style={{ fontSize: 13.5, color: T.muted, marginTop: 12 }}>Opening Razorpay checkout…</div>
            </div>
          )}

          {phase === "error" && (
            <div style={{ color: T.red, fontSize: 13, background: "rgba(184,80,62,0.1)", border: `1px solid ${T.red}`, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
              {errorMsg}
            </div>
          )}

          {(phase === "form" || phase === "error") && (
            <>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={pay}>
                <Lock size={14} /> Pay ₹{shownPrice} via Razorpay
              </button>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, textAlign: "center" }}>
                Opens Razorpay's secure checkout. Use test-mode card/UPI details if your account is in test mode.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BundleWizard({ myTests, onClose, onPublish }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");

  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const sumPrice = myTests.filter((t) => selected.has(t.id)).reduce((s, t) => s + t.price, 0);
  const savings = sumPrice > 0 && price > 0 ? Math.round((1 - price / sumPrice) * 100) : 0;

  const publish = () => {
    if (!title.trim()) { setError("Give the bundle a title."); return; }
    if (selected.size < 2) { setError("Pick at least 2 tests to bundle together."); return; }
    if (!price || price <= 0) { setError("Set a bundle price."); return; }
    onPublish({ title: title.trim(), description: description.trim(), price: Number(price), testIds: Array.from(selected) });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>Bundle your tests</div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            <label className="field-label">Bundle title
              <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete NEET Biology Pack" />
            </label>
            <label className="field-label">Short description
              <textarea className="field-input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's included, and why it's a good deal together" />
            </label>
          </div>

          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Pick tests to include ({selected.size} selected)
          </div>
          <div style={{ display: "grid", gap: 6, maxHeight: 200, overflowY: "auto", marginBottom: 14 }}>
            {myTests.map((t) => (
              <label key={t.id} className="bundle-pick-row">
                <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
                <span style={{ flex: 1 }}>{t.title}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.muted }}>₹{t.price}</span>
              </label>
            ))}
            {myTests.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>Publish at least 2 individual tests first before bundling them.</div>}
          </div>

          <label className="field-label">Bundle price (₹)
            <input type="number" min={1} className="field-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </label>
          {sumPrice > 0 && (
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 6 }}>
              Individually these cost ₹{sumPrice}. {price > 0 && price < sumPrice && <span style={{ color: T.green }}>That's a {savings}% saving for buyers.</span>}
            </div>
          )}

          {error && <div style={{ color: T.red, fontSize: 12.5, marginTop: 10 }}>{error}</div>}

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 18 }} onClick={publish}>
            <Package size={15} /> Publish bundle
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareMenu({ test, variant }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}?test=${test.id}`;
  const shareText = variant === "seller"
    ? `I just listed "${test.title}" on TestMandi — ${test.questions.length} questions, ₹${test.price}. Try it here: ${shareUrl}`
    : `Try this "${test.title}" MCQ test on TestMandi and see how you score: ${shareUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (e) { /* clipboard may be unavailable in this environment */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="icon-btn share-trigger" onClick={() => setOpen((o) => !o)} title={variant === "seller" ? "Promote this test" : "Share with friends"}>
        <Share2 size={15} />
      </button>
      {open && (
        <>
          <div className="share-backdrop" onClick={() => setOpen(false)} />
          <div className="share-menu">
            <button className="share-menu-item" onClick={copyLink}>
              {copied ? <Check size={14} color={T.green} /> : <Copy size={14} />} {copied ? "Link copied!" : "Copy link"}
            </button>
            <button className="share-menu-item" onClick={shareWhatsApp}>
              <MessageCircle size={14} /> Share on WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Marketplace                                                            */
/* ---------------------------------------------------------------------- */
function TestCard({ test, purchased, onBuy, onOpenLearning }) {
  return (
    <div className="ticket-card">
      <div style={{ padding: "16px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <Stamp>{test.category}</Stamp>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars value={test.rating} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.muted }}>
              {test.rating.toFixed(1)} ({test.ratingCount})
            </span>
          </div>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: T.ink, margin: "10px 0 6px", lineHeight: 1.25 }}>
          {test.title}
        </h3>
        <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>{test.description}</p>
        <div style={{ fontSize: 12.5, color: T.inkSoft, display: "flex", gap: 14, fontFamily: "var(--font-mono)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ClipboardList size={13} /> {test.questions.length} Qs</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {test.duration} min</span>
        </div>
        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 8 }}>by <strong style={{ color: T.ink }}>{test.sellerName}</strong></div>
      </div>
      <div className="ticket-perforation" />
      <div style={{ padding: "12px 18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: T.ink }}>
          ₹{test.price}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ShareMenu test={test} variant="buyer" />
          {purchased ? (
            <button className="btn-outline" onClick={onOpenLearning}>
              <BookOpen size={15} /> Go to test
            </button>
          ) : (
            <button className="btn-primary" onClick={onBuy}>
              <ShoppingCart size={15} /> Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BundleCard({ bundle, testsById, purchased, onBuy, onOpenLearning }) {
  const included = bundle.testIds.map((id) => testsById[id]).filter(Boolean);
  const sumPrice = included.reduce((s, t) => s + t.price, 0);
  const savingsPct = sumPrice > bundle.price ? Math.round((1 - bundle.price / sumPrice) * 100) : 0;

  return (
    <div className="ticket-card" style={{ borderColor: T.ink }}>
      <div style={{ padding: "16px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <span className="offer-chip" style={{ background: "rgba(27,42,74,0.08)", borderColor: T.ink, color: T.ink }}><Package size={11} /> Bundle · {included.length} tests</span>
          {savingsPct > 0 && <span className="offer-chip"><Sparkles size={11} /> Save {savingsPct}%</span>}
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: T.ink, margin: "10px 0 6px", lineHeight: 1.25 }}>
          {bundle.title}
        </h3>
        <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>{bundle.description}</p>
        <div style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.6 }}>
          {included.map((t) => <div key={t.id}>· {t.title}</div>)}
        </div>
        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 8 }}>by <strong style={{ color: T.ink }}>{bundle.sellerName}</strong></div>
      </div>
      <div className="ticket-perforation" />
      <div style={{ padding: "12px 18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {savingsPct > 0 && <div style={{ fontSize: 12, color: T.muted, textDecoration: "line-through" }}>₹{sumPrice}</div>}
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: T.ink }}>₹{bundle.price}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ShareMenu test={bundle} variant="buyer" />
          {purchased ? (
            <button className="btn-outline" onClick={onOpenLearning}><BookOpen size={15} /> Go to tests</button>
          ) : (
            <button className="btn-primary" onClick={onBuy}><ShoppingCart size={15} /> Buy bundle</button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdBanner({ ad }) {
  return (
    <div className="ad-banner">
      <span className="ad-banner-tag"><Megaphone size={11} /> Sponsored</span>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14.5, color: T.ink }}>{ad.headline}</div>
        <div style={{ fontSize: 12.5, color: T.inkSoft }}>{ad.body}</div>
      </div>
      <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted, fontFamily: "var(--font-mono)" }}>{ad.advertiserName}</span>
    </div>
  );
}

function Marketplace({ tests, bundles, ads, purchasedIds, purchasedBundleIds, onBuy, onBuyBundle, goLearning, sellerShare, categories, sharedItemId }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("rating");

  const now = Date.now();
  const activeAds = (ads || []).filter((a) => a.endTs > now);
  const homepageAd = activeAds.find((a) => a.placement === "homepage");
  const categoryAd = cat !== "All" ? activeAds.find((a) => a.placement === cat) : null;

  const sharedTest = sharedItemId ? tests.find((t) => t.id === sharedItemId) : null;
  const sharedBundle = !sharedTest && sharedItemId ? bundles.find((b) => b.id === sharedItemId) : null;

  const filtered = useMemo(() => {
    let list = tests.filter((t) =>
      !isBlockedTest(t) &&
      (cat === "All" || t.category === cat) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) || t.sellerName.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [tests, search, cat, sort]);

  return (
    <div>
      <div className="hero-band">
        <div style={{ maxWidth: 620 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.16em", color: T.saffron, textTransform: "uppercase", marginBottom: 10 }}>
            The test bazaar
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 6vw, 40px)", color: T.paper, lineHeight: 1.15, margin: "0 0 12px" }}>
            Every exam has a seller.<br />Every candidate gets a report.
          </h1>
          <p style={{ color: "#DCD2B8", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Teachers, institutes and exam bodies list tests here; candidates buy, attempt online, and get an instant
            score report with topic-wise analysis — so you always know exactly what to study next.
          </p>
        </div>
      </div>

      <div style={{ padding: "26px 28px 8px" }}>
        {(sharedTest || sharedBundle) && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Share2 size={15} color={T.saffronDeep} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.saffronDeep }}>
                Shared with you
              </span>
            </div>
            <div className="grid-cards" style={{ maxWidth: 380 }}>
              {sharedTest && (
                <TestCard test={sharedTest} purchased={purchasedIds.has(sharedTest.id)} onBuy={() => onBuy(sharedTest)} onOpenLearning={goLearning} />
              )}
              {sharedBundle && (
                <BundleCard
                  bundle={sharedBundle}
                  testsById={Object.fromEntries(tests.map((t) => [t.id, t]))}
                  purchased={purchasedBundleIds.has(sharedBundle.id)}
                  onBuy={() => onBuyBundle(sharedBundle)}
                  onOpenLearning={goLearning}
                />
              )}
            </div>
            <div className="ticket-perforation" style={{ margin: "20px 0 0", borderTopStyle: "dashed" }} />
          </div>
        )}
        {homepageAd && <AdBanner ad={homepageAd} />}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <div className="search-box">
            <Search size={15} color={T.muted} />
            <input placeholder="Search tests or sellers…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select-box" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {["All", ...categories].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "chip-active" : ""}`}>
              {c}
            </button>
          ))}
        </div>

        {categoryAd && <AdBanner ad={categoryAd} />}

        <div className="grid-cards">
          {filtered.map((t) => (
            <TestCard
              key={t.id}
              test={t}
              purchased={purchasedIds.has(t.id)}
              onBuy={() => onBuy(t)}
              onOpenLearning={goLearning}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ color: T.muted, padding: "40px 0" }}>No tests match that search — try another category.</div>
          )}
        </div>

        {bundles.length > 0 && (
          <>
            <div style={{ marginTop: 34 }}>
              <SectionLabel eyebrow="Best value" title="Test bundles" />
            </div>
            <div className="grid-cards">
              {bundles.map((b) => (
                <BundleCard
                  key={b.id}
                  bundle={b}
                  testsById={Object.fromEntries(tests.map((t) => [t.id, t]))}
                  purchased={purchasedBundleIds.has(b.id)}
                  onBuy={() => onBuyBundle(b)}
                  onOpenLearning={goLearning}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Seller Studio                                                          */
/* ---------------------------------------------------------------------- */
function CreateTestWizard({ onPublish, onClose, categories }) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState(99);
  const [duration, setDuration] = useState(20);
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([emptyDraftQuestion()]);

  const updateQuestion = (idx, patch) =>
    setQuestions((qs) => qs.map((qu, i) => (i === idx ? { ...qu, ...patch } : qu)));
  const updateOption = (idx, optIdx, val) =>
    setQuestions((qs) => qs.map((qu, i) => (i === idx ? { ...qu, options: qu.options.map((o, oi) => (oi === optIdx ? val : o)) } : qu)));

  const canGoStep2 = title.trim() && price > 0 && duration > 0;
  const validQuestions = questions.filter((q) => q.text.trim() && q.options.every((o) => o.trim()));
  const canPublish = validQuestions.length > 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>Configure a new test</div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", gap: 6, padding: "14px 22px 0" }}>
          {["Basics", "Questions", "Review & publish"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: i === step ? T.ink : T.muted }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: `1.5px solid ${i <= step ? T.saffronDeep : T.line}`, background: i <= step ? T.saffron : "transparent",
                color: i <= step ? T.ink : T.muted, fontSize: 11,
              }}>{i + 1}</span>
              {s}{i < 2 && <ChevronRight size={13} style={{ margin: "0 4px", color: T.line }} />}
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 0 && (
            <div style={{ display: "grid", gap: 14 }}>
              <label className="field-label">Test title
                <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. NEET Chemistry — Organic Reactions Set" />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label className="field-label">Category
                  <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="field-label">Duration (minutes)
                  <input type="number" min={5} className="field-input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </label>
              </div>
              <label className="field-label">Price to candidates (₹)
                <input type="number" min={1} className="field-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </label>
              <label className="field-label">Short description
                <textarea className="field-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this test cover, and who is it for?" />
              </label>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gap: 18 }}>
              {questions.map((qu, idx) => (
                <div key={idx} className="question-editor">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.saffronDeep }}>QUESTION {idx + 1}</div>
                    {questions.length > 1 && (
                      <button className="icon-btn" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== idx))}><Trash2 size={14} /></button>
                    )}
                  </div>
                  <input className="field-input" placeholder="Question text" value={qu.text} onChange={(e) => updateQuestion(idx, { text: e.target.value })} style={{ marginBottom: 10 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {qu.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="radio" name={`correct-${idx}`} checked={qu.correct === oi} onChange={() => updateQuestion(idx, { correct: oi })} />
                        <input className="field-input" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input className="field-input" placeholder="Topic tag (e.g. Genetics)" value={qu.topic} onChange={(e) => updateQuestion(idx, { topic: e.target.value })} />
                    <input className="field-input" placeholder="Explanation (optional)" value={qu.explanation} onChange={(e) => updateQuestion(idx, { explanation: e.target.value })} />
                  </div>
                </div>
              ))}
              <button className="btn-outline" style={{ justifySelf: "start" }} onClick={() => setQuestions((qs) => [...qs, emptyDraftQuestion()])}>
                <Plus size={15} /> Add question
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="ticket-card" style={{ marginBottom: 16 }}>
                <div style={{ padding: 18 }}>
                  <Stamp>{category}</Stamp>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink, margin: "10px 0 6px" }}>{title || "Untitled test"}</h3>
                  <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 10px" }}>{description || "No description added yet."}</p>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: T.inkSoft, display: "flex", gap: 14 }}>
                    <span>{validQuestions.length} valid questions</span>
                    <span>{duration} min</span>
                    <span>₹{price}</span>
                  </div>
                </div>
              </div>
              {!canPublish && <div style={{ color: T.red, fontSize: 13 }}>Add at least one complete question (text + all 4 options filled) before publishing.</div>}
              <div className="split-note">
                Publishing this test lists it in the marketplace immediately. Sales will settle at the platform's current
                profit split, shown live in your earnings ledger.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 22px", borderTop: `1px solid ${T.line}` }}>
          <button className="btn-outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)} style={{ opacity: step === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={15} /> Back
          </button>
          {step < 2 ? (
            <button className="btn-primary" disabled={step === 0 && !canGoStep2} onClick={() => setStep((s) => s + 1)} style={{ opacity: step === 0 && !canGoStep2 ? 0.5 : 1 }}>
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={!canPublish}
              style={{ opacity: canPublish ? 1 : 0.5 }}
              onClick={() => canPublish && onPublish({ title: title || "Untitled test", category, price, duration, description, questions: validQuestions })}
            >
              <CheckCircle2 size={15} /> Publish test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PayoutPanel({ sellerKey, available, bankDetails, payoutsReady, onSaveBank, payoutHistory, onWithdraw }) {
  const [editingBank, setEditingBank] = useState(!bankDetails);
  const [accName, setAccName] = useState(bankDetails?.accName || "");
  const [accNumber, setAccNumber] = useState("");
  const [confirmNumber, setConfirmNumber] = useState("");
  const [ifsc, setIfsc] = useState(bankDetails?.ifsc || "");
  const [bankName, setBankName] = useState(bankDetails?.bankName || "");
  const [upiId, setUpiId] = useState(bankDetails?.upiId || "");
  const [qrImage, setQrImage] = useState(bankDetails?.upiQrImage || "");
  const [qrError, setQrError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const onQrFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setQrError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > 1_000_000) {
      setQrError("That image is too large — please use a smaller file (under 1MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setQrImage(reader.result);
    reader.onerror = () => setQrError("Couldn't read that file — please try again.");
    reader.readAsDataURL(file);
  };

  const doWithdraw = async () => {
    setWithdrawError("");
    setWithdrawing(true);
    try {
      await onWithdraw();
    } catch (err) {
      setWithdrawError(err.message || "Couldn't process the withdrawal — please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const saveBank = async () => {
    if (!accName.trim()) { setError("Enter your name."); return; }
    const wantsBank = accNumber.trim() || ifsc.trim() || bankName.trim();
    const wantsUpi = upiId.trim();
    const wantsQr = qrImage.trim();
    if (!wantsBank && !wantsUpi && !wantsQr) { setError("Add a UPI ID, a UPI QR code image, or full bank details (or any combination)."); return; }
    let cleanAccNumber = "";
    if (wantsBank) {
      if (!accNumber.trim() || !ifsc.trim() || !bankName.trim()) { setError("Fill in all three bank fields, or leave all three blank and use UPI instead."); return; }
      cleanAccNumber = accNumber.replace(/\s+/g, "");
      const cleanConfirm = confirmNumber.replace(/\s+/g, "");
      if (cleanAccNumber !== cleanConfirm) { setError("Account numbers don't match — check both fields carefully."); return; }
    }
    setError("");
    setSaving(true);
    try {
      await onSaveBank({
        accName: accName.trim(),
        ...(wantsBank ? { accountNumber: cleanAccNumber, ifsc: ifsc.trim().toUpperCase(), bankName: bankName.trim() } : {}),
        ...(wantsUpi ? { upiId: upiId.trim() } : {}),
        ...(wantsQr ? { upiQrImage: qrImage.trim() } : {}),
      });
      setEditingBank(false);
    } catch (err) {
      setError(err.message || "Couldn't save your payout details — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payout-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: T.ink, display: "flex", alignItems: "center", gap: 8 }}>
            <Landmark size={17} /> Bank & payouts
          </div>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Withdraw your earnings via bank transfer or UPI.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="stub-label">Available to withdraw</div>
          <div className="stub-value" style={{ color: T.green }}>₹{available.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {withdrawError && <div style={{ color: T.red, fontSize: 12.5, marginTop: 10 }}>{withdrawError}</div>}

      <div style={{ marginTop: 16 }}>
        {!editingBank && bankDetails ? (
          <div className="ledger-row" style={{ padding: "12px 16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, color: T.ink }}>{bankDetails.accName}{bankDetails.bankName ? ` · ${bankDetails.bankName}` : ""}</div>
                {payoutsReady ? (
                  <span className="offer-chip" style={{ background: "rgba(47,122,79,0.12)", borderColor: T.green, color: T.green }}>Real bank transfer</span>
                ) : (
                  <span className="blocked-badge" style={{ background: "rgba(232,163,61,0.14)", borderColor: T.saffron, color: T.saffronDeep }}>Paid manually by admin</span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: T.muted, fontFamily: "var(--font-mono)" }}>
                {bankDetails.last4 && <>A/C •••• {bankDetails.last4} · IFSC {bankDetails.ifsc}</>}
                {bankDetails.last4 && bankDetails.upiId && " · "}
                {bankDetails.upiId && <>UPI {bankDetails.upiId}</>}
                {(bankDetails.last4 || bankDetails.upiId) && bankDetails.upiQrImage && " · "}
                {bankDetails.upiQrImage && <>QR code uploaded</>}
              </div>
            </div>
            <button className="btn-outline" onClick={() => setEditingBank(true)}>Edit</button>
            <button className="btn-primary" disabled={available <= 0 || withdrawing} style={{ opacity: (available <= 0 || withdrawing) ? 0.5 : 1 }} onClick={doWithdraw}>
              {withdrawing ? <Loader2 size={14} className="spin" /> : <><ArrowDownToLine size={14} /> Withdraw ₹{available}</>}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <label className="field-label">Account holder name
              <input className="field-input" value={accName} onChange={(e) => setAccName(e.target.value)} />
            </label>

            <div className="split-note" style={{ fontSize: 12, marginTop: 2 }}>
              Add UPI, full bank details, or both. UPI is the fastest way to get set up for manual payouts.
            </div>

            <label className="field-label">UPI ID
              <input className="field-input" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
            </label>

            <label className="field-label">Or upload your UPI QR code image (from GPay, PhonePe, your bank app, etc.)
              <input type="file" accept="image/png,image/jpeg,image/webp" className="field-input" onChange={onQrFileSelected} />
            </label>
            {qrError && <div style={{ color: T.red, fontSize: 12.5 }}>{qrError}</div>}
            {qrImage && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={qrImage} alt="Your uploaded UPI QR code" width={72} height={72} style={{ borderRadius: 6, border: `1px solid ${T.line}`, objectFit: "contain" }} />
                <button className="link-btn" onClick={() => setQrImage("")}>Remove image</button>
              </div>
            )}

            <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)", marginTop: 4 }}>— and/or —</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label className="field-label">Bank name
                <input className="field-input" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Indian Bank" />
              </label>
              <label className="field-label">IFSC code
                <input className="field-input" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="e.g. SBIN0001234" />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label className="field-label">Account number
                <input className="field-input" value={accNumber} onChange={(e) => setAccNumber(e.target.value)} />
              </label>
              <label className="field-label">Confirm account number
                <input className="field-input" value={confirmNumber} onChange={(e) => setConfirmNumber(e.target.value)} />
              </label>
            </div>
            {error && <div style={{ color: T.red, fontSize: 12.5 }}>{error}</div>}
            <button className="btn-primary" style={{ justifySelf: "start", opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={saveBank}>
              {saving ? <Loader2 size={14} className="spin" /> : <><CheckCircle2 size={14} /> Save payout details</>}
            </button>
          </div>
        )}
      </div>

      {payoutHistory.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Withdrawal history</div>
          <div style={{ display: "grid", gap: 6 }}>
            {payoutHistory.slice().reverse().map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.ink, padding: "8px 12px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 6 }}>
                <span>₹{p.amount.toLocaleString("en-IN")} to •••• {bankDetails?.last4}</span>
                <span style={{
                  color: p.status === "Completed" ? T.green : p.status === "Failed" ? T.red : T.saffronDeep,
                  fontFamily: "var(--font-mono)", fontSize: 11.5,
                }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SellerStudio({ myTests, mySellerBundles, sellerShare, onPublish, session, payouts, onSaveBank, onWithdraw, onRequireLogin, categories, onPublishBundle }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [bundleWizardOpen, setBundleWizardOpen] = useState(false);

  if (!session || session.role !== "seller") {
    return (
      <div style={{ padding: "26px 28px 40px" }}>
        <SectionLabel eyebrow="Seller studio" title="Sell your tests on TestMandi" />
        <div className="split-pitch">
          <div className="split-pitch-figure">
            <span style={{ color: T.green }}>{sellerShare}%</span>
            <span className="split-pitch-caption">goes to you, the seller</span>
          </div>
          <div className="split-pitch-figure">
            <span style={{ color: T.muted }}>{100 - sellerShare}%</span>
            <span className="split-pitch-caption">platform fee — covers hosting, payments & discovery</span>
          </div>
          <div style={{ flex: 1, minWidth: 200, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
            Publish a test in minutes, set your own price, and get paid straight to your bank account — no upfront cost, ever.
          </div>
        </div>
        <div className="empty-panel">
          <GraduationCap size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Log in as a seller</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, marginBottom: 14 }}>Register or log in as a teacher, institute, school or exam body to configure and sell tests.</div>
          <button className="btn-primary" onClick={() => onRequireLogin("seller")}><LogIn size={15} /> Log in / Register as seller</button>
        </div>
      </div>
    );
  }

  const sellerName = session.businessName || session.name;

  const rows = myTests.map((t) => {
    const earn = Math.round(t.gross * (sellerShare / 100));
    return { test: t, units: t.unitsSold, gross: t.gross, earn, fee: t.gross - earn };
  });
  const bundleRows = mySellerBundles.map((b) => {
    const earn = Math.round(b.gross * (sellerShare / 100));
    return { bundle: b, units: b.unitsSold, gross: b.gross, earn, fee: b.gross - earn };
  });
  const totals = [...rows, ...bundleRows].reduce((a, r) => ({ gross: a.gross + r.gross, earn: a.earn + r.earn, fee: a.fee + r.fee, units: a.units + r.units }), { gross: 0, earn: 0, fee: 0, units: 0 });
  const available = Math.max(0, totals.earn - payouts.withdrawn);

  return (
    <div style={{ padding: "26px 28px 40px" }}>
      <SectionLabel
        eyebrow="Seller studio"
        title={`Welcome back, ${sellerName}`}
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-outline" onClick={() => setBundleWizardOpen(true)}><Package size={15} /> Bundle tests</button>
            <button className="btn-primary" onClick={() => setWizardOpen(true)}><Plus size={15} /> Create test</button>
          </div>
        }
      />

      <div className="stub-strip" style={{ marginBottom: 26 }}>
        <div className="stub"><div className="stub-label">Gross sales</div><div className="stub-value">₹{totals.gross.toLocaleString("en-IN")}</div></div>
        <div className="stub"><div className="stub-label">Your earnings ({sellerShare}%)</div><div className="stub-value" style={{ color: T.green }}>₹{totals.earn.toLocaleString("en-IN")}</div></div>
        <div className="stub"><div className="stub-label">Platform fee ({100 - sellerShare}%)</div><div className="stub-value" style={{ color: T.muted }}>₹{totals.fee.toLocaleString("en-IN")}</div></div>
        <div className="stub"><div className="stub-label">Sold (tests + bundles)</div><div className="stub-value">{totals.units}</div></div>
      </div>

      <PayoutPanel
        sellerKey={sellerName}
        available={available}
        bankDetails={payouts.bankDetails}
        payoutsReady={payouts.payoutsReady}
        onSaveBank={onSaveBank}
        payoutHistory={payouts.history}
        onWithdraw={onWithdraw}
      />

      <div style={{ marginTop: 30 }}>
        <SectionLabel eyebrow="Catalogue" title="Your tests" />
      </div>

      {rows.length === 0 && (
        <div className="empty-panel">
          <Ticket size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>No tests listed yet</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>Configure your first MCQ test and it'll go straight into the marketplace.</div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {rows.map(({ test, units, gross, earn, fee }) => {
          const blocked = isBlockedTest(test);
          return (
            <div key={test.id} className="ledger-row">
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <Stamp>{test.category}</Stamp>
                  <Stars value={test.rating} size={12} />
                  {blocked && (
                    <span className="blocked-badge"><ShieldOff size={11} /> Hidden — low ratings</span>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16.5, color: T.ink }}>{test.title}</div>
                <div style={{ fontSize: 12.5, color: T.muted, fontFamily: "var(--font-mono)" }}>{test.questions.length} Qs · {test.duration} min · ₹{test.price}</div>
              </div>
              <div className="ledger-figures">
                <div><div className="fig-label">Sold</div><div className="fig-value">{units}</div></div>
                <div><div className="fig-label">Gross</div><div className="fig-value">₹{gross}</div></div>
                <div><div className="fig-label">You earn</div><div className="fig-value" style={{ color: T.green }}>₹{earn}</div></div>
                <div><div className="fig-label">Platform</div><div className="fig-value" style={{ color: T.muted }}>₹{fee}</div></div>
              </div>
              <ShareMenu test={test} variant="seller" />
            </div>
          );
        })}
      </div>

      {mySellerBundles.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <SectionLabel eyebrow="Catalogue" title="Your bundles" />
          <div style={{ display: "grid", gap: 12 }}>
            {bundleRows.map(({ bundle, units, gross, earn, fee }) => (
              <div key={bundle.id} className="ledger-row">
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span className="offer-chip" style={{ background: "rgba(27,42,74,0.08)", borderColor: T.ink, color: T.ink }}><Package size={11} /> Bundle · {bundle.testIds.length} tests</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16.5, color: T.ink }}>{bundle.title}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, fontFamily: "var(--font-mono)" }}>₹{bundle.price}</div>
                </div>
                <div className="ledger-figures">
                  <div><div className="fig-label">Sold</div><div className="fig-value">{units}</div></div>
                  <div><div className="fig-label">Gross</div><div className="fig-value">₹{gross}</div></div>
                  <div><div className="fig-label">You earn</div><div className="fig-value" style={{ color: T.green }}>₹{earn}</div></div>
                  <div><div className="fig-label">Platform</div><div className="fig-value" style={{ color: T.muted }}>₹{fee}</div></div>
                </div>
                <ShareMenu test={bundle} variant="seller" />
              </div>
            ))}
          </div>
        </div>
      )}

      {wizardOpen && (
        <CreateTestWizard
          onClose={() => setWizardOpen(false)}
          onPublish={(draft) => { onPublish(draft, sellerName); setWizardOpen(false); }}
          categories={categories}
        />
      )}
      {bundleWizardOpen && (
        <BundleWizard
          myTests={myTests}
          onClose={() => setBundleWizardOpen(false)}
          onPublish={(draft) => { onPublishBundle(draft, sellerName); setBundleWizardOpen(false); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Ads Studio — text-only sponsored placements                            */
/* ---------------------------------------------------------------------- */
const AD_COST_HOMEPAGE = 500;
const AD_COST_CATEGORY = 200;

function AdWizard({ categories, onClose, onSubmit }) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [placement, setPlacement] = useState("homepage");
  const [days, setDays] = useState(1);
  const [error, setError] = useState("");

  const costPerDay = placement === "homepage" ? AD_COST_HOMEPAGE : AD_COST_CATEGORY;
  const totalCost = costPerDay * Math.max(1, Number(days) || 0);

  const submit = () => {
    if (!headline.trim() || !body.trim()) { setError("Headline and ad text are required."); return; }
    if (headline.length > 60) { setError("Keep the headline under 60 characters."); return; }
    if (body.length > 140) { setError("Keep the ad text under 140 characters."); return; }
    if (!days || days < 1) { setError("Ads run for at least 1 day."); return; }
    setError("");
    onSubmit({ headline: headline.trim(), body: body.trim(), placement, days: Number(days), cost: totalCost });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>Create a text ad</div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gap: 12 }}>
            <label className="field-label">Headline ({headline.length}/60)
              <input className="field-input" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. 20% off exam-prep stationery this week" />
            </label>
            <label className="field-label">Ad text ({body.length}/140)
              <textarea className="field-input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="A short line about your offer — text only, no images." />
            </label>
            <label className="field-label">Where should it show?
              <select className="field-input" value={placement} onChange={(e) => setPlacement(e.target.value)}>
                <option value="homepage">Homepage — ₹{AD_COST_HOMEPAGE}/day</option>
                {categories.map((c) => <option key={c} value={c}>{c} category page — ₹{AD_COST_CATEGORY}/day</option>)}
              </select>
            </label>
            <label className="field-label">Number of days
              <input type="number" min={1} className="field-input" value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </label>
          </div>

          <div className="split-note" style={{ marginTop: 14 }}>
            Total cost: <strong>₹{totalCost}</strong> for {days} day{days > 1 ? "s" : ""} ({placement === "homepage" ? "homepage" : `${placement} category page`}, text-only).
          </div>
          {error && <div style={{ color: T.red, fontSize: 12.5, marginTop: 10 }}>{error}</div>}

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={submit}>
            <Megaphone size={15} /> Pay & publish ad
          </button>
        </div>
      </div>
    </div>
  );
}

function AdsStudio({ session, categories, ads, onRequireLogin, onStartAdCheckout }) {
  const [wizardOpen, setWizardOpen] = useState(false);

  if (!session || session.role !== "advertiser") {
    return (
      <div style={{ padding: "26px 28px 40px" }}>
        <SectionLabel eyebrow="Ads studio" title="Advertise on TestMandi" />
        <div className="split-pitch">
          <div className="split-pitch-figure">
            <span style={{ color: T.ink }}>₹{AD_COST_HOMEPAGE}</span>
            <span className="split-pitch-caption">per day — homepage placement, seen by every visitor</span>
          </div>
          <div className="split-pitch-figure">
            <span style={{ color: T.ink }}>₹{AD_COST_CATEGORY}</span>
            <span className="split-pitch-caption">per day — a specific exam category page</span>
          </div>
          <div style={{ flex: 1, minWidth: 200, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
            Text-only ads, no design work needed. Set your message, pick where it runs and for how long, and it goes live immediately after payment.
          </div>
        </div>
        <div className="empty-panel">
          <Megaphone size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Log in as an advertiser</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, marginBottom: 14 }}>Register or log in to create, manage, and pay for text ads shown across TestMandi.</div>
          <button className="btn-primary" onClick={() => onRequireLogin("advertiser")}><LogIn size={15} /> Log in / Register as advertiser</button>
        </div>
      </div>
    );
  }

  const advertiserName = session.businessName || session.name;
  const myAds = ads.filter((a) => a.advertiserEmail === session.email).sort((a, b) => b.startTs - a.startTs);
  const now = Date.now();
  const totalSpend = myAds.reduce((s, a) => s + a.cost, 0);
  const activeCount = myAds.filter((a) => a.endTs > now).length;

  return (
    <div style={{ padding: "26px 28px 40px" }}>
      <SectionLabel
        eyebrow="Ads studio"
        title={`Welcome back, ${advertiserName}`}
        right={<button className="btn-primary" onClick={() => setWizardOpen(true)}><Plus size={15} /> Create ad</button>}
      />

      <div className="stub-strip" style={{ marginBottom: 26 }}>
        <div className="stub"><div className="stub-label">Active ads</div><div className="stub-value">{activeCount}</div></div>
        <div className="stub"><div className="stub-label">Total ads run</div><div className="stub-value">{myAds.length}</div></div>
        <div className="stub"><div className="stub-label">Total spend</div><div className="stub-value">₹{totalSpend.toLocaleString("en-IN")}</div></div>
      </div>

      {myAds.length === 0 && (
        <div className="empty-panel">
          <Megaphone size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>No ads yet</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>Create your first text ad — it goes live as soon as payment goes through.</div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {myAds.map((ad) => {
          const active = ad.endTs > now;
          const daysLeft = Math.max(0, Math.ceil((ad.endTs - now) / 86400000));
          return (
            <div key={ad.id} className="ledger-row">
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <Stamp>{ad.placement === "homepage" ? "Homepage" : ad.placement}</Stamp>
                  {active ? (
                    <span className="offer-chip" style={{ background: "rgba(47,122,79,0.12)", borderColor: T.green, color: T.green }}>Active · {daysLeft}d left</span>
                  ) : (
                    <span className="blocked-badge">Expired</span>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16.5, color: T.ink }}>{ad.headline}</div>
                <div style={{ fontSize: 12.5, color: T.muted }}>{ad.body}</div>
              </div>
              <div className="ledger-figures">
                <div><div className="fig-label">Days</div><div className="fig-value">{ad.days}</div></div>
                <div><div className="fig-label">Cost</div><div className="fig-value">₹{ad.cost}</div></div>
              </div>
            </div>
          );
        })}
      </div>

      {wizardOpen && (
        <AdWizard
          categories={categories}
          onClose={() => setWizardOpen(false)}
          onSubmit={(draft) => { onStartAdCheckout(draft); setWizardOpen(false); }}
        />
      )}
    </div>
  );
}


function TestRunner({ test, onSubmit, onExit }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(() => Date.now());
  const [secondsLeft, setSecondsLeft] = useState(test.duration * 60);
  const total = test.questions.length;

  const select = (optIdx) => setAnswers((a) => ({ ...a, [qIndex]: optIdx }));
  const submit = () => {
    let score = 0;
    const topicMap = {};
    test.questions.forEach((qu, i) => {
      const topic = qu.topic || "General";
      topicMap[topic] = topicMap[topic] || { correct: 0, total: 0 };
      topicMap[topic].total += 1;
      if (answers[i] === qu.correct) { score += 1; topicMap[topic].correct += 1; }
    });
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    onSubmit({ score, total, answers, topicMap, timeTakenSeconds });
  };

  // Real countdown, independent of answers/qIndex state — ticks every second
  // and auto-submits whatever's answered so far once time runs out.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    if (secondsLeft <= 0) { submitRef.current(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeLow = secondsLeft <= 60;

  const qu = test.questions[qIndex];

  return (
    <div style={{ padding: "26px 28px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.saffronDeep, letterSpacing: "0.1em", textTransform: "uppercase" }}>Attempting</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: T.ink }}>{test.title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="timer-pill" style={{ color: timeLow ? T.red : T.ink, borderColor: timeLow ? T.red : T.line }}>
            <Timer size={14} /> {mins}:{secs.toString().padStart(2, "0")}
          </div>
          <button className="btn-outline" onClick={onExit}><X size={14} /> Exit test</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {test.questions.map((_, i) => (
          <button key={i} onClick={() => setQIndex(i)} className="q-pill" style={{
            background: i === qIndex ? T.ink : answers[i] !== undefined ? T.saffron : "transparent",
            color: i === qIndex ? T.paper : T.ink,
          }}>{i + 1}</button>
        ))}
      </div>

      <div className="question-panel">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.muted, marginBottom: 8 }}>QUESTION {qIndex + 1} OF {total} · {qu.topic}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: T.ink, marginBottom: 16, lineHeight: 1.4 }}>{qu.text}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {qu.options.map((opt, oi) => (
            <button key={oi} onClick={() => select(oi)} className="option-row" style={{
              borderColor: answers[qIndex] === oi ? T.saffronDeep : T.line,
              background: answers[qIndex] === oi ? "rgba(232,163,61,0.14)" : "transparent",
            }}>
              <span className="option-mark" style={{ borderColor: answers[qIndex] === oi ? T.saffronDeep : T.line }}>{String.fromCharCode(65 + oi)}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button className="btn-outline" disabled={qIndex === 0} style={{ opacity: qIndex === 0 ? 0.4 : 1 }} onClick={() => setQIndex((i) => i - 1)}>
          <ChevronLeft size={15} /> Previous
        </button>
        {qIndex < total - 1 ? (
          <button className="btn-primary" onClick={() => setQIndex((i) => i + 1)}>Next <ChevronRight size={15} /></button>
        ) : (
          <button className="btn-primary" onClick={submit}><CheckCircle2 size={15} /> Submit test</button>
        )}
      </div>
    </div>
  );
}

function encouragementFor(pct) {
  if (pct >= 90) return "Outstanding performance — you're exam-ready on this topic set!";
  if (pct >= 75) return "Great job — you're well prepared, just a few gaps to close.";
  if (pct >= 50) return "Good effort — another round of practice will lift this a lot.";
  return "Keep going — every attempt sharpens your understanding. Review and retake!";
}

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function ReportView({ test, attempt, onRate, onBack, history }) {
  const [myRating, setMyRating] = useState(null);
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const chartData = Object.entries(attempt.topicMap).map(([topic, v]) => ({
    topic, Correct: v.correct, Missed: v.total - v.correct,
  }));

  const priorAttempts = (history || []).filter((a) => a.id !== attempt.id);
  const bestPriorPct = priorAttempts.length ? Math.max(...priorAttempts.map((a) => Math.round((a.score / a.total) * 100))) : null;
  const improvement = bestPriorPct === null ? null : pct - bestPriorPct;
  const isPersonalBest = bestPriorPct !== null && pct >= bestPriorPct;

  const trendData = (history || [])
    .slice()
    .sort((a, b) => a.ts - b.ts)
    .map((a, i) => ({ label: `Attempt ${i + 1}`, Accuracy: Math.round((a.score / a.total) * 100) }));

  return (
    <div style={{ padding: "26px 28px 44px", maxWidth: 860, margin: "0 auto" }}>
      <button className="btn-outline" onClick={onBack} style={{ marginBottom: 18 }}><ChevronLeft size={15} /> Back to my tests</button>

      <div className="result-slip">
        <div className="result-slip-perf" />
        <div style={{ padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.saffronDeep, letterSpacing: "0.1em", textTransform: "uppercase" }}>Result slip</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: T.ink, margin: "4px 0" }}>{test.title}</div>
            <div style={{ fontSize: 13, color: T.muted }}>{test.sellerName} · {test.category}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: pct >= 50 ? T.green : T.red, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: T.muted }}>{attempt.score} / {attempt.total} correct</div>
          </div>
        </div>
        <div className="ticket-perforation" style={{ margin: "0 26px" }} />
        <div style={{ padding: "14px 26px 20px", display: "flex", gap: 26, flexWrap: "wrap" }}>
          <div><div className="fig-label">Accuracy</div><div className="fig-value">{pct}%</div></div>
          <div><div className="fig-label">Time taken</div><div className="fig-value" style={{ display: "flex", alignItems: "center", gap: 5 }}><Timer size={14} /> {formatDuration(attempt.timeTakenSeconds || 0)}</div></div>
          {improvement !== null && (
            <div>
              <div className="fig-label">Vs. your best</div>
              <div className="fig-value" style={{ color: improvement > 0 ? T.green : improvement < 0 ? T.red : T.muted }}>
                {improvement > 0 ? `+${improvement}%` : improvement === 0 ? "Same" : `${improvement}%`}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="encouragement-banner">
        <Sparkles size={16} color={T.saffronDeep} style={{ flexShrink: 0 }} />
        <span>
          {encouragementFor(pct)}
          {isPersonalBest && priorAttempts.length > 0 && <strong style={{ color: T.green }}> New personal best!</strong>}
        </span>
      </div>

      {trendData.length > 1 && (
        <>
          <SectionLabel eyebrow="Progress" title="Your improvement over attempts" />
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "14px 10px 4px", marginBottom: 30 }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trendData} margin={{ left: 0, right: 10, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} unit="%" />
                <Tooltip contentStyle={{ fontFamily: "var(--font-body)", fontSize: 12.5, borderRadius: 6, border: `1px solid ${T.line}` }} />
                <Bar dataKey="Accuracy" fill={T.saffronDeep} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <SectionLabel eyebrow="Analysis" title="Topic-wise breakdown" />
      <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 8, padding: "14px 10px 4px", marginBottom: 30 }}>
        <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 56)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} />
            <YAxis type="category" dataKey="topic" width={140} tick={{ fontSize: 12.5, fontFamily: "var(--font-body)", fill: T.ink }} />
            <Tooltip contentStyle={{ fontFamily: "var(--font-body)", fontSize: 12.5, borderRadius: 6, border: `1px solid ${T.line}` }} />
            <Bar dataKey="Correct" stackId="a" fill={T.green} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Missed" stackId="a" fill={T.red} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionLabel eyebrow="Review" title="Question-by-question" />
      <div style={{ display: "grid", gap: 10, marginBottom: 30 }}>
        {test.questions.map((qu, i) => {
          const yourAns = attempt.answers[i];
          const correct = yourAns === qu.correct;
          return (
            <div key={i} className="review-row">
              <div style={{ display: "flex", gap: 10 }}>
                {correct ? <CheckCircle2 size={18} color={T.green} style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={18} color={T.red} style={{ flexShrink: 0, marginTop: 2 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: T.ink, marginBottom: 4 }}>{i + 1}. {qu.text}</div>
                  <div style={{ fontSize: 12.5, color: T.muted }}>
                    Your answer: <strong style={{ color: correct ? T.green : T.red }}>{yourAns !== undefined ? qu.options[yourAns] : "Not answered"}</strong>
                    {!correct && <> · Correct: <strong style={{ color: T.green }}>{qu.options[qu.correct]}</strong></>}
                  </div>
                  {qu.explanation && <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4, fontStyle: "italic" }}>{qu.explanation}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionLabel eyebrow="Feedback" title="Rate this test" />
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className="icon-btn" onClick={() => { onRate(n); setMyRating(n); }}>
            <Star size={22} color={T.saffronDeep} fill={myRating >= n ? T.saffronDeep : "none"} />
          </button>
        ))}
      </div>
      {myRating && <div style={{ fontSize: 13, color: T.green }}>Thanks — your rating helps other candidates choose.</div>}
    </div>
  );
}

function ReferralPanel({ me }) {
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState({ referralCode: me.referralCode, referredCount: 0, rewards: me.referralRewards || [] });

  useEffect(() => {
    api.getMyReferrals().then(setData).catch(() => {});
  }, [me.email]);

  const referredCount = data.referredCount;
  const rewards = data.rewards || [];
  const available = rewards.filter((r) => !r.used);
  const referralCode = data.referralCode || me.referralCode;
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}?ref=${referralCode}`;
  const shareText = `Join me on TestMandi and try MCQ tests for competitive exams! Use my code ${referralCode} when you sign up: ${shareUrl}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="referral-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: T.ink, display: "flex", alignItems: "center", gap: 8 }}>
            <Gift size={17} color={T.saffronDeep} /> Refer & earn
          </div>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
            Share your code — when a friend buys their first test, you get 50% off your next one.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="stub-label">Friends referred</div>
          <div className="stub-value">{referredCount}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <div className="referral-code-box">{referralCode}</div>
        <button className="btn-outline" onClick={copyLink}>{copied ? <><Check size={14} color={T.green} /> Copied!</> : <><Copy size={14} /> Copy invite link</>}</button>
        <button className="btn-outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")}>
          <MessageCircle size={14} /> Share on WhatsApp
        </button>
      </div>

      {available.length > 0 ? (
        <div className="offer-chip" style={{ fontSize: 12 }}>
          <Gift size={12} /> {available.length} reward{available.length > 1 ? "s" : ""} available — 50% off your next purchase, applied at checkout
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: T.muted }}>No rewards yet — they'll show up here once someone you refer makes their first purchase.</div>
      )}
    </div>
  );
}

function MyLearning({ tests, purchasedIds, attempts, onStart, onExitToMarket, activeTestId, testState, onSubmitAttempt, onExitRunner, reportAttemptId, onRate, onOpenReport, clearReport, session, onRequireLogin }) {
  const myTests = tests.filter((t) => purchasedIds.has(t.id));

  if (!session || session.role !== "buyer") {
    return (
      <div style={{ padding: "26px 28px 40px" }}>
        <SectionLabel eyebrow="My learning" title="Tests you've bought" />
        <div className="referral-promo" style={{ marginBottom: 20, fontSize: 13 }}>
          <Gift size={16} color={T.saffronDeep} style={{ flexShrink: 0 }} />
          <span>Sign up and get your own referral code — when a friend you invite buys their first test, you get <strong>50% off</strong> your next one.</span>
        </div>
        <div className="empty-panel">
          <User size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Log in to see your tests</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, marginBottom: 14 }}>Log in or register as a candidate to view purchases, attempt tests, and see score reports.</div>
          <button className="btn-primary" onClick={() => onRequireLogin("buyer")}><LogIn size={15} /> Log in / Register</button>
        </div>
      </div>
    );
  }

  if (activeTestId) {
    const test = tests.find((t) => t.id === activeTestId);
    return <TestRunner test={test} onSubmit={onSubmitAttempt} onExit={onExitRunner} />;
  }

  if (reportAttemptId) {
    const attempt = attempts.find((a) => a.id === reportAttemptId);
    const test = tests.find((t) => t.id === attempt.testId);
    const history = attempts.filter((a) => a.testId === attempt.testId);
    return <ReportView test={test} attempt={attempt} onRate={(n) => onRate(attempt.id, attempt.testId, n)} onBack={clearReport} history={history} />;
  }

  const me = session;

  return (
    <div style={{ padding: "26px 28px 40px" }}>
      <SectionLabel eyebrow="My learning" title="Tests you've bought" />
      <ReferralPanel me={me} />
      {myTests.length === 0 && (
        <div className="empty-panel">
          <BookOpen size={22} color={T.saffronDeep} />
          <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>Nothing here yet</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, marginBottom: 14 }}>Buy a test from the marketplace to attempt it and get a score report.</div>
          <button className="btn-primary" onClick={onExitToMarket}><Store size={15} /> Browse marketplace</button>
        </div>
      )}
      <div className="grid-cards">
        {myTests.map((t) => {
          const myAttempts = attempts.filter((a) => a.testId === t.id);
          const best = myAttempts.length ? myAttempts.reduce((a, b) => (b.score > a.score ? b : a)) : null;
          return (
            <div key={t.id} className="ticket-card">
              <div style={{ padding: "16px 18px 14px" }}>
                <Stamp>{t.category}</Stamp>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: T.ink, margin: "10px 0 6px" }}>{t.title}</h3>
                <div style={{ fontSize: 12.5, color: T.muted, fontFamily: "var(--font-mono)" }}>{t.questions.length} Qs · {t.duration} min</div>
                {best && (
                  <div style={{ marginTop: 10, fontSize: 13, color: T.ink }}>
                    Best score: <strong style={{ color: T.green }}>{best.score}/{best.total}</strong>
                  </div>
                )}
              </div>
              <div className="ticket-perforation" />
              <div style={{ padding: "12px 18px 16px", display: "flex", gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => onStart(t.id)}>
                  <Play size={14} /> {best ? "Retake" : "Start test"}
                </button>
                {best && (
                  <button className="btn-outline" onClick={() => onOpenReport(best.id)}>
                    Report
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin                                                                  */
/* ---------------------------------------------------------------------- */
function CategoryManager({ categories, tests, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const usageCount = (cat) => tests.filter((t) => t.category === cat).length;

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) { setError("That category already exists."); return; }
    setError("");
    onAdd(name);
    setDraft("");
  };

  const remove = (cat) => {
    if (usageCount(cat) > 0) { setError(`"${cat}" is used by ${usageCount(cat)} live test(s) — reassign or remove those tests first.`); return; }
    setError("");
    onRemove(cat);
  };

  return (
    <div className="split-panel">
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: T.ink, marginBottom: 4 }}>Exam categories</div>
      <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 14 }}>
        Controls what candidates can filter by and what sellers can list under, across the marketplace and seller studio.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          className="field-input" placeholder="e.g. CLAT, GATE, Railways RRB…" value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
      </div>
      {error && <div style={{ color: T.red, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {categories.map((c) => (
          <span key={c} className="cat-tag">
            {c} <span style={{ color: T.muted, fontFamily: "var(--font-mono)", fontSize: 10.5 }}>({usageCount(c)})</span>
            <button className="cat-tag-remove" onClick={() => remove(c)} title="Remove category"><X size={12} /></button>
          </span>
        ))}
        {categories.length === 0 && <span style={{ fontSize: 13, color: T.muted }}>No categories yet — add one above.</span>}
      </div>
    </div>
  );
}

function AccountsManager({ registeredUsers, purchases, tests, onRemove }) {
  const buyers = registeredUsers.filter((u) => u.role === "buyer");
  const sellers = registeredUsers.filter((u) => u.role === "seller");

  return (
    <div>
      <SectionLabel eyebrow="Accounts" title="Buyers & sellers" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
        <div>
          <div className="account-group-label"><User size={14} /> Buyers ({buyers.length})</div>
          <div style={{ display: "grid", gap: 8 }}>
            {buyers.map((u) => {
              const spend = purchases.filter((p) => p.buyerEmail === u.email).reduce((s, p) => s + p.price, 0);
              return (
                <div key={u.email} className="account-row">
                  <div>
                    <div style={{ fontSize: 13.5, color: T.ink }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: T.muted, fontFamily: "var(--font-mono)" }}>{u.email} · ₹{spend} spent</div>
                  </div>
                  <button className="icon-btn" onClick={() => onRemove(u.email)} title="Remove account"><Trash2 size={14} /></button>
                </div>
              );
            })}
            {buyers.length === 0 && <div className="empty-panel" style={{ padding: 20 }}>No buyer accounts yet.</div>}
          </div>
        </div>
        <div>
          <div className="account-group-label"><GraduationCap size={14} /> Sellers ({sellers.length})</div>
          <div style={{ display: "grid", gap: 8 }}>
            {sellers.map((u) => {
              const sellerName = u.businessName || u.name;
              const listed = tests.filter((t) => t.sellerName === sellerName).length;
              return (
                <div key={u.email} className="account-row">
                  <div>
                    <div style={{ fontSize: 13.5, color: T.ink }}>{sellerName}</div>
                    <div style={{ fontSize: 11.5, color: T.muted, fontFamily: "var(--font-mono)" }}>{u.email} · {listed} test(s) listed</div>
                  </div>
                  <button className="icon-btn" onClick={() => onRemove(u.email)} title="Remove account"><Trash2 size={14} /></button>
                </div>
              );
            })}
            {sellers.length === 0 && <div className="empty-panel" style={{ padding: 20 }}>No seller accounts yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationComposer({ notifications, onSend }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("both");
  const [offerCode, setOfferCode] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = title.trim() && message.trim();

  const send = () => {
    if (!canSend) return;
    onSend({ title: title.trim(), message: message.trim(), audience, offerCode: offerCode.trim() || null });
    setTitle(""); setMessage(""); setOfferCode(""); setAudience("both");
    setSent(true);
    setTimeout(() => setSent(false), 1800);
  };

  return (
    <div className="split-panel">
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: T.ink, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
        <Megaphone size={17} /> Send a marketing notification
      </div>
      <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 14 }}>
        Nudges buyers and sellers to come back and stay active — new tests, sales trends, or a limited-time offer.
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <input className="field-input" placeholder="Title, e.g. 'New JEE Physics sets are live'" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="field-input" rows={2} placeholder="Message shown to the audience…" value={message} onChange={(e) => setMessage(e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <select className="field-input" value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="both">Buyers & sellers</option>
            <option value="buyer">Buyers only</option>
            <option value="seller">Sellers only</option>
          </select>
          <input className="field-input" placeholder="Offer code (optional), e.g. SAVE20" value={offerCode} onChange={(e) => setOfferCode(e.target.value)} />
        </div>
        <button className="btn-primary" disabled={!canSend} style={{ opacity: canSend ? 1 : 0.5, justifySelf: "start" }} onClick={send}>
          {sent ? <><Check size={14} /> Sent!</> : <><Send size={14} /> Send notification</>}
        </button>
      </div>

      {notifications.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Sent history</div>
          <div style={{ display: "grid", gap: 6 }}>
            {notifications.map((n) => (
              <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 12px" }}>
                <div>
                  <span style={{ fontSize: 13, color: T.ink }}>{n.title}</span>
                  <span style={{ fontSize: 11.5, color: T.muted, marginLeft: 8, fontFamily: "var(--font-mono)" }}>
                    {n.audience === "both" ? "Everyone" : n.audience === "buyer" ? "Buyers" : "Sellers"}{n.offerCode ? ` · ${n.offerCode}` : ""}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: "var(--font-mono)" }}>{timeAgo(n.ts)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingPayoutsManager() {
  const [payouts, setPayouts] = useState(null); // null = loading
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = () => { api.getAdminPayouts().then((d) => setPayouts(d.payouts)).catch(() => setError("Couldn't load pending payouts.")); };
  useEffect(() => { load(); }, []);

  const resolve = async (id, outcome) => {
    setError("");
    if (outcome === "rejected" && !window.confirm("Reject this payout request? The seller keeps the amount available to request again.")) return;
    const reference = outcome === "paid" ? window.prompt("Optional: transaction reference / UTR number for your own records") : null;
    setBusyId(id);
    try {
      await api.resolveAdminPayout(id, outcome, reference || undefined);
      load();
    } catch (err) {
      setError(err.message || "Couldn't update that payout.");
    } finally {
      setBusyId(null);
    }
  };

  if (payouts === null) return null;

  return (
    <div style={{ marginBottom: 30 }}>
      <SectionLabel eyebrow="Payouts" title="Pending manual payouts" />
      <div className="split-note" style={{ marginBottom: 14 }}>
        These sellers don't have RazorpayX set up yet, so their withdrawal isn't automatic. Pay them yourself via bank
        transfer or UPI using the details below, then mark it here — this is what actually releases the money on your
        end and updates their balance.
      </div>
      {error && <div style={{ color: T.red, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      {payouts.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>No pending manual payouts right now.</div>}
      <div style={{ display: "grid", gap: 10 }}>
        {payouts.map((p) => {
          const bd = p.seller?.bankDetails;
          const upiUri = bd?.upiId
            ? `upi://pay?pa=${encodeURIComponent(bd.upiId)}&pn=${encodeURIComponent(bd.accName || p.seller.name)}&am=${p.amount}&cu=INR&tn=${encodeURIComponent("TestMandi payout")}`
            : null;
          // Prefer the seller's own uploaded QR (it's exactly what they actually
          // use) — only fall back to a generated one if they gave a UPI ID instead.
          const qrSrc = bd?.upiQrImage || (upiUri ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiUri)}` : null);
          const hasAnyDetails = bd?.upiId || bd?.upiQrImage || bd?.accountNumber;
          return (
            <div key={p.id} className="ledger-row">
              {qrSrc && (
                <img
                  src={qrSrc}
                  alt="Scan to pay via UPI" width={90} height={90} style={{ borderRadius: 6, border: `1px solid ${T.line}`, flexShrink: 0, objectFit: "contain", background: "#fff" }}
                />
              )}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: T.ink }}>{p.seller?.name || p.sellerEmail}</div>
                <div style={{ fontSize: 12.5, color: T.muted }}>{p.sellerEmail}</div>
                {bd?.upiId && (
                  <div style={{ fontSize: 12.5, color: T.inkSoft, fontFamily: "var(--font-mono)", marginTop: 4 }}>UPI: {bd.upiId} (scan to pay ₹{p.amount} directly)</div>
                )}
                {bd?.upiQrImage && !bd?.upiId && (
                  <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4 }}>Seller-uploaded QR code — scan to pay ₹{p.amount}</div>
                )}
                {bd?.accountNumber && (
                  <div style={{ fontSize: 12.5, color: T.inkSoft, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {bd.accName} · {bd.bankName} · A/C {bd.accountNumber} · IFSC {bd.ifsc}
                  </div>
                )}
                {!hasAnyDetails && <div style={{ fontSize: 12.5, color: T.red, marginTop: 4 }}>No payout details on file</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: T.ink }}>₹{p.amount.toLocaleString("en-IN")}</div>
                <button className="btn-outline" disabled={busyId === p.id} onClick={() => resolve(p.id, "rejected")}>Reject</button>
                <button className="btn-primary" disabled={busyId === p.id} onClick={() => resolve(p.id, "paid")}>
                  {busyId === p.id ? <Loader2 size={14} className="spin" /> : "Mark as paid"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminAccountSettings({ session, onAccountUpdated }) {
  const [newEmail, setNewEmail] = useState(session.email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(""); setSuccess(false);
    if (!currentPassword) { setError("Enter your current password to confirm this change."); return; }
    if (newPassword && newPassword !== confirmPassword) { setError("New passwords don't match."); return; }
    const payload = { currentPassword };
    if (newEmail.trim().toLowerCase() !== session.email) payload.newEmail = newEmail.trim();
    if (newPassword) payload.newPassword = newPassword;
    if (!payload.newEmail && !payload.newPassword) { setError("Change the email or password first."); return; }

    setSaving(true);
    try {
      const { user } = await api.updateAccount(payload);
      onAccountUpdated(user);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Couldn't update your account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="split-panel" style={{ marginBottom: 30 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: T.ink, marginBottom: 4 }}>Your admin account</div>
      <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 14 }}>
        Change your own login email and/or password directly here — no email link needed.
      </div>
      <div style={{ display: "grid", gap: 10, maxWidth: 380 }}>
        <label className="field-label">Email
          <input className="field-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </label>
        <label className="field-label">New password (leave blank to keep current)
          <input className="field-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
        </label>
        {newPassword && (
          <label className="field-label">Confirm new password
            <input className="field-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>
        )}
        <label className="field-label">Current password (required to confirm)
          <input className="field-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
        {error && <div style={{ color: T.red, fontSize: 12.5 }}>{error}</div>}
        {success && <div style={{ color: T.green, fontSize: 12.5 }}>Account updated.</div>}
        <button className="btn-primary" style={{ justifySelf: "start", opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={submit}>
          {saving ? <Loader2 size={14} className="spin" /> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Admin({ tests, purchases, bundles, bundlePurchases, sellerShare, setSellerShare, sellerShareError, categories, onAddCategory, onRemoveCategory, registeredUsers, onRemoveAccount, notifications, onSendNotification, ads, onDeleteTest, onDeleteBundle, onDeleteAd, session, onAccountUpdated }) {
  const gmv = purchases.reduce((s, p) => s + p.price, 0) + (bundlePurchases || []).reduce((s, p) => s + p.price, 0);
  const commission = Math.round(gmv * (1 - sellerShare / 100));
  const sellerSet = new Set([...tests.map((t) => t.sellerName), ...(bundles || []).map((b) => b.sellerName)]);
  const buyerSet = new Set([...purchases.map((p) => p.buyerEmail), ...(bundlePurchases || []).map((p) => p.buyerEmail)]);
  const adRevenue = (ads || []).reduce((s, a) => s + a.cost, 0);

  const bySeller = Array.from(sellerSet).map((name) => {
    const sellerTests = tests.filter((t) => t.sellerName === name);
    const sellerBundles = (bundles || []).filter((b) => b.sellerName === name);
    const testIds = new Set(sellerTests.map((t) => t.id));
    const bundleIds = new Set(sellerBundles.map((b) => b.id));
    const testSales = purchases.filter((p) => testIds.has(p.testId));
    const bundleSales = (bundlePurchases || []).filter((p) => bundleIds.has(p.bundleId));
    const gross = testSales.reduce((s, p) => s + p.price, 0) + bundleSales.reduce((s, p) => s + p.price, 0);
    return {
      name, testsCount: sellerTests.length, unitsSold: testSales.length + bundleSales.length, gross,
      earn: Math.round(gross * (sellerShare / 100)), fee: Math.round(gross * (1 - sellerShare / 100)),
    };
  }).sort((a, b) => b.gross - a.gross);

  return (
    <div style={{ padding: "26px 28px 44px" }}>
      <SectionLabel eyebrow="Platform admin" title="Marketplace overview" />

      <div className="stub-strip" style={{ marginBottom: 26 }}>
        <div className="stub"><div className="stub-label">Total GMV</div><div className="stub-value">₹{gmv.toLocaleString("en-IN")}</div></div>
        <div className="stub"><div className="stub-label">Platform commission</div><div className="stub-value" style={{ color: T.saffronDeep }}>₹{commission.toLocaleString("en-IN")}</div></div>
        <div className="stub"><div className="stub-label">Ad revenue</div><div className="stub-value" style={{ color: T.saffronDeep }}>₹{adRevenue.toLocaleString("en-IN")}</div></div>
        <div className="stub"><div className="stub-label">Active sellers</div><div className="stub-value">{sellerSet.size}</div></div>
        <div className="stub"><div className="stub-label">Tests live</div><div className="stub-value">{tests.length}</div></div>
        <div className="stub"><div className="stub-label">Buyers</div><div className="stub-value">{buyerSet.size}</div></div>
      </div>

      <AdminAccountSettings session={session} onAccountUpdated={onAccountUpdated} />

      <div className="split-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: T.ink }}>Default profit split</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: T.ink }}>
            Seller {sellerShare}% <span style={{ color: T.muted }}>/</span> Platform {100 - sellerShare}%
          </div>
        </div>
        <input
          type="range" min={40} max={90} value={sellerShare}
          onChange={(e) => setSellerShare(Number(e.target.value))}
          className="range-input"
        />
        {sellerShareError && <div style={{ color: T.red, fontSize: 12.5, marginTop: 8 }}>{sellerShareError}</div>}
        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 8 }}>
          Saves immediately as you drag, and takes effect for every seller right away — no refresh needed.
        </div>
      </div>

      <PendingPayoutsManager />

      <CategoryManager categories={categories} tests={tests} onAdd={onAddCategory} onRemove={onRemoveCategory} />

      <NotificationComposer notifications={notifications} onSend={onSendNotification} />

      <div style={{ marginTop: 30 }}>
        <AccountsManager registeredUsers={registeredUsers} purchases={purchases} tests={tests} onRemove={onRemoveAccount} />
      </div>

      <SectionLabel eyebrow="Sellers" title="Revenue by seller" />
      <div style={{ display: "grid", gap: 10, marginBottom: 30 }}>
        {bySeller.map((s) => (
          <div key={s.name} className="ledger-row">
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: T.ink }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: T.muted, fontFamily: "var(--font-mono)" }}>{s.testsCount} test(s) listed</div>
            </div>
            <div className="ledger-figures">
              <div><div className="fig-label">Sold</div><div className="fig-value">{s.unitsSold}</div></div>
              <div><div className="fig-label">Gross</div><div className="fig-value">₹{s.gross}</div></div>
              <div><div className="fig-label">Seller earns</div><div className="fig-value" style={{ color: T.green }}>₹{s.earn}</div></div>
              <div><div className="fig-label">Platform</div><div className="fig-value" style={{ color: T.saffronDeep }}>₹{s.fee}</div></div>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel eyebrow="Catalogue" title="All tests" />
      <div style={{ display: "grid", gap: 8 }}>
        {tests.map((t) => (
          <div key={t.id} className="ledger-row" style={{ padding: "10px 16px" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, color: T.ink }}>{t.title}</span>
              <span style={{ fontSize: 12.5, color: T.muted, marginLeft: 10 }}>{t.sellerName}</span>
              {isBlockedTest(t) && <span className="blocked-badge" style={{ marginLeft: 10 }}><ShieldOff size={11} /> Auto-hidden</span>}
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12.5, color: T.muted }}>
              <Stamp>{t.category}</Stamp>
              <span>₹{t.price}</span>
              <Stars value={t.rating} size={12} />
              <button className="icon-btn" title="Delete test" onClick={() => { if (window.confirm(`Delete "${t.title}"? This can't be undone.`)) onDeleteTest(t.id); }}>
                <Trash2 size={14} color={T.red} />
              </button>
            </div>
          </div>
        ))}
        {tests.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>No tests listed.</div>}
      </div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 10, marginBottom: 30 }}>
        Tests automatically hide from the marketplace once they cross 10 ratings with an average below 3 stars.
      </div>

      <SectionLabel eyebrow="Catalogue" title="All bundles" />
      <div style={{ display: "grid", gap: 8 }}>
        {(bundles || []).map((b) => (
          <div key={b.id} className="ledger-row" style={{ padding: "10px 16px" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, color: T.ink }}>{b.title}</span>
              <span style={{ fontSize: 12.5, color: T.muted, marginLeft: 10 }}>{b.sellerName}</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12.5, color: T.muted }}>
              <span>{b.testIds.length} tests</span>
              <span>₹{b.price}</span>
              <button className="icon-btn" title="Delete bundle" onClick={() => { if (window.confirm(`Delete "${b.title}"? This can't be undone.`)) onDeleteBundle(b.id); }}>
                <Trash2 size={14} color={T.red} />
              </button>
            </div>
          </div>
        ))}
        {(!bundles || bundles.length === 0) && <div style={{ fontSize: 13, color: T.muted }}>No bundles listed.</div>}
      </div>

      <div style={{ marginTop: 30 }}>
        <SectionLabel eyebrow="Marketing" title="All ads" />
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {(ads || []).slice().sort((a, b) => b.startTs - a.startTs).map((ad) => {
          const active = ad.endTs > Date.now();
          const daysLeft = Math.max(0, Math.ceil((ad.endTs - Date.now()) / 86400000));
          return (
            <div key={ad.id} className="ledger-row" style={{ padding: "10px 16px" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 14, color: T.ink }}>{ad.headline}</span>
                  {active ? (
                    <span className="offer-chip" style={{ background: "rgba(47,122,79,0.12)", borderColor: T.green, color: T.green }}>Active · {daysLeft}d left</span>
                  ) : (
                    <span className="blocked-badge">Expired</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: T.muted }}>{ad.body}</div>
                <div style={{ fontSize: 11.5, color: T.muted, fontFamily: "var(--font-mono)", marginTop: 2 }}>{ad.advertiserName}</div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12.5, color: T.muted }}>
                <Stamp>{ad.placement === "homepage" ? "Homepage" : ad.placement}</Stamp>
                <span>{ad.days}d</span>
                <span>₹{ad.cost}</span>
                <button className="icon-btn" title="Remove ad" onClick={() => { if (window.confirm(`Remove the ad "${ad.headline}"? This can't be undone.`)) onDeleteAd(ad.id); }}>
                  <Trash2 size={14} color={T.red} />
                </button>
              </div>
            </div>
          );
        })}
        {(!ads || ads.length === 0) && <div style={{ fontSize: 13, color: T.muted }}>No ads have been posted yet.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Notifications — marketing/engagement bell                              */
/* ---------------------------------------------------------------------- */
function timeAgo(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function NotificationBell({ notifications, session }) {
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState(new Set());

  const relevant = notifications.filter((n) => n.audience === "both" || (session && n.audience === session.role));
  const unread = relevant.filter((n) => !seenIds.has(n.id)).length;

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) setSeenIds((s) => new Set([...s, ...relevant.map((n) => n.id)]));
      return next;
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="icon-btn" style={{ color: T.paper, position: "relative" }} onClick={toggle} title="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="bell-dot">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="share-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-panel">
            <div className="notif-panel-header"><Megaphone size={14} /> Updates for you</div>
            <div className="notif-list">
              {relevant.length === 0 && <div style={{ padding: 18, fontSize: 13, color: T.muted, textAlign: "center" }}>Nothing new right now.</div>}
              {relevant.map((n) => (
                <div key={n.id} className="notif-item">
                  <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    {n.offerCode ? (
                      <span className="offer-chip"><Gift size={11} /> {n.offerCode}</span>
                    ) : <span />}
                    <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: T.muted }}>{timeAgo(n.ts)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Support chatbot — answers buyer & seller questions                     */
/* ---------------------------------------------------------------------- */
function ChatWidget({ session }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm the TestMandi help bot. Ask me anything about buying tests, selling tests, payments, or payouts." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.chat(
        nextMessages.map((m) => ({ role: m.role, text: m.text })),
        session?.role || null,
        session?.name || null
      );
      setMessages((m) => [...m, { role: "assistant", text: reply || "Sorry, I couldn't find an answer to that — try rephrasing?" }]);
    } catch (e) {
      const text = e.status === 503
        ? "The chatbot isn't set up yet — add ANTHROPIC_API_KEY to the backend's .env file to enable it."
        : "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages((m) => [...m, { role: "assistant", text }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} title="Get help">
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <Bot size={16} /> TestMandi help
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chat-bubble chat-bubble-bot"><Loader2 size={14} className="spin" /></div>}
          </div>
          <div className="chat-input-row">
            <input
              className="field-input" placeholder="Ask about buying, selling, payouts…" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="icon-btn" style={{ background: T.ink, color: T.paper, borderRadius: 6 }} onClick={send} disabled={loading}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function requiredRoleForCheckoutKind(kind) {
  return kind === "ad" ? "advertiser" : "buyer";
}

/* ---------------------------------------------------------------------- */
/* App shell                                                              */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [role, setRole] = useState("marketplace");
  const [tests, setTests] = useState(seedTests());
  const [bundles, setBundles] = useState([]);
  const [ads, setAds] = useState([]);
  const [marketplaceAds, setMarketplaceAds] = useState([]);
  const [pendingAd, setPendingAd] = useState(null);
  const [sellerShare, setSellerShare] = useState(70);
  const [sellerShareError, setSellerShareError] = useState("");

  const commitSellerShare = async (pct) => {
    const previous = sellerShare;
    setSellerShare(pct); // optimistic — slider already shows this locally
    setSellerShareError("");
    try {
      await api.updateSellerShare(pct);
    } catch (err) {
      setSellerShare(previous); // revert if the server rejected it
      setSellerShareError(err.message || "Couldn't save the new split — please try again.");
    }
  };
  const [activeTestId, setActiveTestId] = useState(null);
  const [reportAttemptId, setReportAttemptId] = useState(null);
  const [categories, setCategories] = useState(CATEGORIES_SEED);
  const [notifications, setNotifications] = useState([]);

  // --- buyer-scoped data (this account's own purchases/attempts), from the API ---
  const [purchases, setPurchases] = useState([]);
  const [bundlePurchases, setBundlePurchases] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [ratedTestIds, setRatedTestIds] = useState(new Set()); // local UI feedback only

  // --- seller-scoped data (this account's own tests/bundles + sales + payouts) ---
  const [sellerTests, setSellerTests] = useState([]);
  const [sellerBundles, setSellerBundles] = useState([]);
  const [sellerPayouts, setSellerPayouts] = useState({ bankDetails: null, history: [], grossEarnings: 0, withdrawn: 0 });

  // --- admin-scoped data (full platform visibility) ---
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [adminData, setAdminData] = useState({ tests: [], bundles: [], purchases: [], bundlePurchases: [], ads: [] });

  // --- auth ---
  // registeredUsers is a local mirror of accounts this browser session has seen
  // (via register/login/session-restore) — kept for the session chip and as a
  // safety fallback; Admin and referrals now read from the API directly.
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [session, setSession] = useState(null); // {role, name, email, phone, businessName}
  const [authModal, setAuthModal] = useState(null); // null | {mode, role}
  const [urlReferralCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("ref") || "";
  });
  const [sharedItemId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("test") || "";
  });
  const [authAction, setAuthAction] = useState(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    if (params.get("reset") && uid) return { kind: "reset", uid, token: params.get("reset") };
    if (params.get("verify") && uid) return { kind: "verify", uid, token: params.get("verify") };
    return null;
  });
  const clearAuthAction = () => {
    setAuthAction(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      ["reset", "verify", "uid"].forEach((k) => url.searchParams.delete(k));
      window.history.replaceState({}, "", url.toString());
    }
    if (authAction?.kind === "reset") openAuth("buyer", "login");
  };
  const [loginError, setLoginError] = useState("");

  // --- checkout ---
  const [checkoutTest, setCheckoutTest] = useState(null);
  const [checkoutKind, setCheckoutKind] = useState("test"); // 'test' | 'bundle' | 'ad'
  const [pendingCheckoutTest, setPendingCheckoutTest] = useState(null);
  const [pendingCheckoutKind, setPendingCheckoutKind] = useState("test");

  const purchasedIds = useMemo(() => {
    if (!session || session.role !== "buyer") return new Set();
    const direct = purchases.map((p) => p.testId);
    const myBundleIds = new Set(bundlePurchases.map((p) => p.bundleId));
    const viaBundles = bundles.filter((b) => myBundleIds.has(b.id)).flatMap((b) => b.testIds);
    return new Set([...direct, ...viaBundles]);
  }, [purchases, bundlePurchases, bundles, session]);

  const purchasedBundleIds = useMemo(
    () => new Set(session && session.role === "buyer" ? bundlePurchases.map((p) => p.bundleId) : []),
    [bundlePurchases, session]
  );

  // Load this account's own data whenever the session (or its role) changes.
  useEffect(() => {
    if (!session) {
      setPurchases([]); setBundlePurchases([]); setAttempts([]); setRatedTestIds(new Set());
      setSellerTests([]); setSellerBundles([]); setSellerPayouts({ bankDetails: null, history: [], grossEarnings: 0, withdrawn: 0 });
      setAdminAccounts([]); setAdminData({ tests: [], bundles: [], purchases: [], bundlePurchases: [], ads: [] });
      return;
    }
    api.getNotifications().then((d) => setNotifications(d.notifications)).catch(() => {});

    if (session.role === "buyer") {
      api.getMyPurchases().then((d) => setPurchases(d.purchases)).catch(() => {});
      api.getMyBundlePurchases().then((d) => setBundlePurchases(d.bundlePurchases)).catch(() => {});
      api.getMyAttempts().then((d) => setAttempts(d.attempts)).catch(() => {});
    } else if (session.role === "seller") {
      api.getMyTests().then((d) => setSellerTests(d.tests)).catch(() => {});
      api.getMyBundles().then((d) => setSellerBundles(d.bundles)).catch(() => {});
      api.getMyPayouts().then((d) => setSellerPayouts(d)).catch(() => {});
    } else if (session.role === "advertiser") {
      api.getMyAds().then((d) => setAds(d.ads)).catch(() => {});
    } else if (session.role === "admin") {
      api.getAccounts().then((d) => setAdminAccounts(d.users)).catch(() => {});
      api.getAdminAllData().then(setAdminData).catch(() => {});
    }
  }, [session]);

  const openAuth = (role, mode = "login") => { setLoginError(""); setAuthModal({ mode, role }); };
  const closeAuth = () => { setAuthModal(null); setLoginError(""); };

  const upsertLocalUser = (u) => setRegisteredUsers((rs) => {
    const exists = rs.some((r) => r.email === u.email);
    return exists ? rs.map((r) => (r.email === u.email ? u : r)) : [...rs, u];
  });

  const registerUser = async (u) => {
    setLoginError("");
    try {
      const { user } = await api.register(u);
      upsertLocalUser(user);
      setSession(user);
      setAuthModal(null);
      if (user.role === requiredRoleForCheckoutKind(pendingCheckoutKind) && pendingCheckoutTest) {
        setCheckoutTest(pendingCheckoutTest); setCheckoutKind(pendingCheckoutKind); setPendingCheckoutTest(null);
      }
    } catch (err) {
      setLoginError(err.message || "Couldn't create that account — please try again.");
    }
  };

  const loginUser = async ({ email, password, expectedRole }) => {
    setLoginError("");
    try {
      const { user } = await api.login({ email, password, expectedRole });
      upsertLocalUser(user);
      setSession(user);
      setRole(user.role === "admin" ? "admin" : "marketplace");
      setAuthModal(null);
      if (user.role === requiredRoleForCheckoutKind(pendingCheckoutKind) && pendingCheckoutTest) {
        setCheckoutTest(pendingCheckoutTest); setCheckoutKind(pendingCheckoutKind); setPendingCheckoutTest(null);
      }
    } catch (err) {
      setLoginError(err.message || "Couldn't log you in — please try again.");
    }
  };

  const logout = () => {
    api.logout();
    setSession(null);
    setRole("marketplace");
  };

  // Restore the session on page load/refresh if a valid token is stored.
  useEffect(() => {
    if (!api.isLoggedIn()) return;
    api.me()
      .then(({ user }) => { upsertLocalUser(user); setSession(user); })
      .catch(() => api.clearSession());
  }, []);

  // Load categories, tests, and bundles from the backend. Falls back to the
  // local seed data (already in state) if the backend isn't reachable, so the
  // app still shows something rather than going blank.
  const [backendUnreachable, setBackendUnreachable] = useState(false);
  useEffect(() => {
    Promise.all([api.getCategories(), api.getTests(), api.getBundles(), api.getActiveAds(), api.getSettings()])
      .then(([catData, testData, bundleData, adData, settingsData]) => {
        setCategories(catData.categories);
        setTests(testData.tests);
        setBundles(bundleData.bundles);
        setMarketplaceAds(adData.ads);
        setSellerShare(settingsData.sellerSharePercent);
        setBackendUnreachable(false);
      })
      .catch(() => setBackendUnreachable(true));
  }, []);

  const requireLoginFor = (role) => openAuth(role, "login");

  const startCheckout = (item, kind = "test") => {
    const requiredRole = requiredRoleForCheckoutKind(kind);
    if (!session || session.role !== requiredRole) { setPendingCheckoutTest(item); setPendingCheckoutKind(kind); openAuth(requiredRole, "login"); return; }
    setCheckoutTest(item);
    setCheckoutKind(kind);
  };

  // Called once /api/checkout/verify has confirmed payment and returned the
  // record it created (a purchase, bundle purchase, or ad). We just fold that
  // real record into local state — no more client-side price or referral logic.
  const handleCheckoutSuccess = (result) => {
    if (checkoutKind === "ad") {
      if (result?.ad) setAds((a) => [...a, result.ad]);
      api.getActiveAds().then((d) => setMarketplaceAds(d.ads)).catch(() => {});
      setPendingAd(null);
      setRole("ads");
    } else if (checkoutKind === "bundle") {
      if (result?.purchase) setBundlePurchases((bp) => [...bp, result.purchase]);
      setRole("learning");
    } else {
      if (result?.purchase) setPurchases((p) => [...p, result.purchase]);
      setRole("learning");
    }
    setCheckoutTest(null);
  };

  const startAdCheckout = (adDraft) => {
    setPendingAd(adDraft);
    startCheckout({ id: null, title: adDraft.headline, price: adDraft.cost, sellerName: "TestMandi Ads" }, "ad");
  };

  const publishBundle = async (draft) => {
    const { bundle } = await api.createBundle(draft);
    setBundles((b) => [bundle, ...b]);
    setSellerBundles((b) => [{ ...bundle, unitsSold: 0, gross: 0 }, ...b]);
  };

  const publishTest = async (draft) => {
    const { test } = await api.createTest(draft);
    setTests((t) => [test, ...t]);
    setSellerTests((t) => [{ ...test, unitsSold: 0, gross: 0 }, ...t]);
  };

  const submitAttempt = async ({ score, total, answers, topicMap, timeTakenSeconds }) => {
    const { attempt } = await api.submitAttempt({ testId: activeTestId, score, total, answers, topicMap, timeTakenSeconds });
    setAttempts((a) => [...a, attempt]);
    setActiveTestId(null);
    setReportAttemptId(attempt.id);
  };

  const rateAttempt = async (attemptId, testId, n) => {
    try {
      const { test } = await api.rateTest(testId, n);
      setTests((ts) => ts.map((t) => (t.id === test.id ? test : t)));
      setRatedTestIds((s) => new Set([...s, testId]));
    } catch (err) {
      // Already rated, or something else went wrong — surface nothing disruptive; the
      // UI simply won't mark it as freshly rated. Good enough for a rating action.
    }
  };

  const currentSellerName = session?.role === "seller" ? (session.businessName || session.name) : null;

  const addCategory = async (name) => {
    const { categories: updated } = await api.addCategory(name);
    setCategories(updated);
  };
  const removeCategory = async (name) => {
    const { categories: updated } = await api.removeCategory(name);
    setCategories(updated);
  };

  const sendNotification = async (n) => {
    const { notification } = await api.sendNotification(n);
    setNotifications((ns) => [notification, ...ns]);
  };

  const removeAccount = async (email) => {
    await api.removeAccount(email);
    setAdminAccounts((rs) => rs.filter((u) => u.email !== email));
    setRegisteredUsers((rs) => rs.filter((u) => u.email !== email));
    if (session && session.email === email) { setSession(null); setRole("marketplace"); }
  };

  const deleteTestAsAdmin = async (id) => {
    await api.deleteTest(id);
    setAdminData((d) => ({ ...d, tests: d.tests.filter((t) => t.id !== id) }));
    setTests((t) => t.filter((x) => x.id !== id));
  };

  const deleteBundleAsAdmin = async (id) => {
    await api.deleteBundle(id);
    setAdminData((d) => ({ ...d, bundles: d.bundles.filter((b) => b.id !== id) }));
    setBundles((b) => b.filter((x) => x.id !== id));
  };

  const deleteAdAsAdmin = async (id) => {
    await api.deleteAd(id);
    setAdminData((d) => ({ ...d, ads: d.ads.filter((a) => a.id !== id) }));
    setMarketplaceAds((a) => a.filter((x) => x.id !== id));
  };

  const saveSellerBank = async (details) => {
    const { bankDetails } = await api.saveBankDetails(details);
    setSellerPayouts((p) => ({ ...p, bankDetails }));
  };

  const withdrawSellerFunds = async () => {
    await api.withdraw(sellerShare);
    const fresh = await api.getMyPayouts();
    setSellerPayouts(fresh);
    // A real RazorpayX payout can flip from "queued" to a final status a few
    // seconds after this request returns — poll once more to catch that.
    // (Sellers without RazorpayX set up will just stay "Pending admin review"
    // until an admin resolves it, which this poll won't change.)
    setTimeout(() => { api.getMyPayouts().then(setSellerPayouts).catch(() => {}); }, 4500);
  };

  const NAV = [
    { key: "marketplace", label: "Marketplace", icon: Store },
    { key: "seller", label: "Seller Studio", icon: GraduationCap },
    { key: "learning", label: "My Learning", icon: BookOpen },
    { key: "ads", label: "Ads Studio", icon: Megaphone },
    ...(session?.role === "admin" ? [{ key: "admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <div style={{ fontFamily: "var(--font-body)", background: T.paper, minHeight: "100%", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        :root {
          --font-display: 'Zilla Slab', Georgia, serif;
          --font-body: 'Inter', system-ui, sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
        }
        * { box-sizing: border-box; }
        button { font-family: var(--font-body); cursor: pointer; }
        input, select, textarea { font-family: var(--font-body); }

        .topnav { position: sticky; top: 0; z-index: 20; background: ${T.ink}; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 62px; }
        .brand { display: flex; align-items: center; gap: 9px; color: ${T.paper}; font-family: var(--font-display); font-size: 20px; }
        .brand-mark { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .nav-tabs { display: flex; gap: 4px; }
        .nav-tab { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 6px; border: none; background: transparent; color: #C9C2AA; font-size: 13.5px; }
        .nav-tab.active { background: ${T.saffron}; color: ${T.ink}; font-weight: 600; }
        .nav-tab:not(.active):hover { background: rgba(255,255,255,0.08); color: ${T.paper}; }

        .hero-band { background: ${T.ink}; padding: 44px 28px 40px; background-image: radial-gradient(circle at 85% 20%, rgba(232,163,61,0.16), transparent 55%); }

        .search-box { display: flex; align-items: center; gap: 8px; border: 1px solid ${T.line}; border-radius: 6px; padding: 8px 12px; background: #fff; flex: 1; min-width: 220px; }
        .search-box input { border: none; outline: none; flex: 1; font-size: 13.5px; background: transparent; }
        .select-box { border: 1px solid ${T.line}; border-radius: 6px; padding: 8px 10px; font-size: 13px; background: #fff; color: ${T.ink}; }

        .chip { border: 1px solid ${T.line}; background: transparent; border-radius: 999px; padding: 6px 13px; font-size: 12.5px; color: ${T.inkSoft}; }
        .chip-active { background: ${T.ink}; color: ${T.paper}; border-color: ${T.ink}; }

        .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

        .ticket-card { background: #fff; border: 1px solid ${T.line}; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
        .ticket-perforation { border-top: 1.5px dashed ${T.line}; margin: 0 18px; position: relative; }

        .btn-primary { display: inline-flex; align-items: center; gap: 6px; background: ${T.ink}; color: ${T.paper}; border: none; border-radius: 6px; padding: 9px 15px; font-size: 13.5px; font-weight: 600; }
        .btn-primary:hover { background: ${T.inkSoft}; }
        .btn-outline { display: inline-flex; align-items: center; gap: 6px; background: transparent; color: ${T.ink}; border: 1px solid ${T.ink}; border-radius: 6px; padding: 8px 14px; font-size: 13.5px; }
        .btn-outline:hover { background: rgba(27,42,74,0.06); }
        .icon-btn { background: transparent; border: none; color: ${T.ink}; padding: 4px; border-radius: 4px; display: flex; }
        .icon-btn:hover { background: rgba(27,42,74,0.08); }

        .stub-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: ${T.line}; border: 1px solid ${T.line}; border-radius: 8px; overflow: hidden; }
        .stub { background: #fff; padding: 16px 18px; }
        .stub-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: ${T.muted}; margin-bottom: 6px; }
        .stub-value { font-family: var(--font-display); font-size: 22px; color: ${T.ink}; }

        .ledger-row { display: flex; align-items: center; gap: 18px; background: #fff; border: 1px solid ${T.line}; border-radius: 8px; padding: 14px 18px; flex-wrap: wrap; }
        .ledger-figures { display: flex; gap: 22px; flex-wrap: wrap; }
        .fig-label { font-family: var(--font-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: ${T.muted}; }
        .fig-value { font-family: var(--font-display); font-size: 16px; color: ${T.ink}; }

        .empty-panel { border: 1.5px dashed ${T.line}; border-radius: 10px; padding: 34px; text-align: center; margin-bottom: 20px; }

        .modal-backdrop { position: fixed; inset: 0; background: rgba(27,42,74,0.55); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .modal-card { background: ${T.paper}; border-radius: 10px; width: 100%; max-width: 680px; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; }
        .modal-body { padding: 20px 22px; overflow-y: auto; flex: 1; }
        .field-label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${T.inkSoft}; font-weight: 500; }
        .field-input { border: 1px solid ${T.line}; border-radius: 6px; padding: 9px 11px; font-size: 13.5px; color: ${T.ink}; background: #fff; width: 100%; }
        .question-editor { border: 1px solid ${T.line}; border-radius: 8px; padding: 14px; background: #fff; }
        .bundle-pick-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid ${T.line}; border-radius: 6px; font-size: 13px; color: ${T.ink}; background: #fff; cursor: pointer; }
        .split-note { font-size: 12.5px; color: ${T.muted}; background: rgba(232,163,61,0.12); border: 1px solid ${T.saffron}; border-radius: 6px; padding: 10px 12px; }

        .q-pill { width: 30px; height: 30px; border-radius: 6px; border: 1px solid ${T.line}; font-family: var(--font-mono); font-size: 12px; }
        .timer-pill { display: flex; align-items: center; gap: 6px; border: 1.5px solid ${T.line}; border-radius: 999px; padding: 6px 14px; font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
        .question-panel { background: #fff; border: 1px solid ${T.line}; border-radius: 10px; padding: 22px; }
        .option-row { display: flex; align-items: center; gap: 10px; text-align: left; border: 1px solid ${T.line}; border-radius: 7px; padding: 11px 13px; font-size: 14px; color: ${T.ink}; }
        .option-mark { width: 22px; height: 22px; border: 1.5px solid ${T.line}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-family: var(--font-mono); flex-shrink: 0; }

        .result-slip { background: #fff; border: 1px solid ${T.line}; border-radius: 10px; margin-bottom: 8px; position: relative; }
        .review-row { background: #fff; border: 1px solid ${T.line}; border-radius: 8px; padding: 13px 16px; }

        .split-panel { background: #fff; border: 1px solid ${T.line}; border-radius: 10px; padding: 20px; margin-bottom: 30px; }
        .range-input { width: 100%; accent-color: ${T.saffronDeep}; }

        .auth-controls { display: flex; align-items: center; gap: 10px; }
        .session-chip { display: flex; align-items: center; gap: 8px; background: rgba(232,163,61,0.14); border: 1px solid ${T.saffron}; border-radius: 999px; padding: 5px 12px 5px 6px; color: ${T.paper}; }
        .session-avatar { width: 22px; height: 22px; border-radius: 50%; background: ${T.saffron}; color: ${T.ink}; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); }
        .session-name { font-size: 12.5px; }
        .session-role { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${T.saffron}; }
        .nav-login-btn { display: flex; align-items: center; gap: 6px; background: ${T.saffron}; color: ${T.ink}; border: none; border-radius: 6px; padding: 8px 14px; font-size: 13px; font-weight: 600; }
        .admin-link-btn { background: transparent; border: none; color: #8D8462; font-size: 11.5px; text-decoration: underline; padding: 4px 2px; }
        .admin-link-btn:hover { color: ${T.paper}; }

        .role-toggle { display: flex; border: 1px solid ${T.line}; border-radius: 8px; overflow: hidden; }
        .role-toggle-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: #fff; border: none; font-size: 12.5px; color: ${T.muted}; border-right: 1px solid ${T.line}; }
        .role-toggle-btn:last-child { border-right: none; }
        .role-toggle-btn.active { background: ${T.ink}; color: ${T.paper}; }
        .link-btn { background: none; border: none; color: ${T.saffronDeep}; font-weight: 600; padding: 0; font-size: 12.5px; }

        .order-summary { display: flex; justify-content: space-between; align-items: center; background: ${T.paperAlt}; border: 1px solid ${T.line}; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
        .reward-toggle { display: flex; align-items: center; gap: 8px; background: rgba(47,122,79,0.1); border: 1px solid ${T.green}; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; font-size: 12.5px; color: ${T.ink}; cursor: pointer; }

        .referral-panel { background: #fff; border: 1px solid ${T.saffron}; border-radius: 10px; padding: 18px 20px; margin-bottom: 22px; }
        .referral-code-box { font-family: var(--font-mono); font-size: 15px; letter-spacing: 0.08em; background: ${T.paperAlt}; border: 1.5px dashed ${T.saffronDeep}; border-radius: 6px; padding: 8px 14px; color: ${T.ink}; }

        .ad-banner { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid ${T.saffron}; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
        .ad-banner-tag { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${T.saffronDeep}; background: rgba(232,163,61,0.14); border-radius: 4px; padding: 3px 7px; flex-shrink: 0; }

        .backend-warning { display: flex; align-items: center; gap: 8px; background: rgba(184,80,62,0.12); border-bottom: 1px solid ${T.red}; color: ${T.red}; font-size: 12.5px; padding: 8px 24px; }
        .backend-warning code { background: rgba(184,80,62,0.15); padding: 1px 6px; border-radius: 4px; font-family: var(--font-mono); }

        .verify-banner { display: flex; align-items: center; gap: 8px; background: rgba(232,163,61,0.14); border-bottom: 1px solid ${T.saffron}; color: ${T.ink}; font-size: 12.5px; padding: 8px 24px; }
        .pay-tabs { display: flex; border: 1px solid ${T.line}; border-radius: 8px; overflow: hidden; }
        .pay-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: #fff; border: none; border-right: 1px solid ${T.line}; font-size: 12.5px; color: ${T.muted}; }
        .pay-tab:last-child { border-right: none; }
        .pay-tab.active { background: ${T.saffron}; color: ${T.ink}; font-weight: 600; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .payout-panel { background: #fff; border: 1px solid ${T.line}; border-radius: 10px; padding: 20px; margin-bottom: 10px; }

        .cat-tag { display: inline-flex; align-items: center; gap: 6px; border: 1px solid ${T.line}; background: #fff; border-radius: 999px; padding: 5px 6px 5px 12px; font-size: 12.5px; color: ${T.ink}; }
        .cat-tag-remove { background: transparent; border: none; color: ${T.muted}; display: flex; border-radius: 50%; padding: 3px; }
        .cat-tag-remove:hover { background: rgba(184,80,62,0.14); color: ${T.red}; }

        .account-group-label { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: ${T.saffronDeep}; margin-bottom: 10px; }
        .account-row { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid ${T.line}; border-radius: 8px; padding: 10px 14px; }

        .chat-fab { position: fixed; bottom: 22px; right: 22px; width: 52px; height: 52px; border-radius: 50%; background: ${T.ink}; color: ${T.paper}; border: 2px solid ${T.saffron}; display: flex; align-items: center; justify-content: center; z-index: 60; box-shadow: 0 6px 18px rgba(27,42,74,0.35); }
        .chat-panel { position: fixed; bottom: 84px; right: 22px; width: 340px; max-width: calc(100vw - 44px); height: 440px; background: ${T.paper}; border: 1px solid ${T.line}; border-radius: 12px; z-index: 60; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(27,42,74,0.28); }
        .chat-header { background: ${T.ink}; color: ${T.paper}; padding: 12px 16px; font-family: var(--font-display); font-size: 15px; display: flex; align-items: center; gap: 8px; }
        .chat-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .chat-bubble { max-width: 85%; padding: 9px 12px; border-radius: 10px; font-size: 13px; line-height: 1.45; }
        .chat-bubble-bot { background: #fff; border: 1px solid ${T.line}; color: ${T.ink}; align-self: flex-start; }
        .chat-bubble-user { background: ${T.saffron}; color: ${T.ink}; align-self: flex-end; }
        .chat-input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid ${T.line}; background: #fff; }

        .share-backdrop { position: fixed; inset: 0; z-index: 55; }
        .share-menu { position: absolute; top: calc(100% + 6px); right: 0; background: #fff; border: 1px solid ${T.line}; border-radius: 8px; box-shadow: 0 8px 22px rgba(27,42,74,0.18); z-index: 56; overflow: hidden; min-width: 168px; }
        .share-menu-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 13px; background: #fff; border: none; font-size: 12.5px; color: ${T.ink}; text-align: left; }
        .share-menu-item:hover { background: ${T.paperAlt}; }
        .share-menu-item + .share-menu-item { border-top: 1px solid ${T.line}; }

        .blocked-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(184,80,62,0.12); border: 1px solid ${T.red}; color: ${T.red}; border-radius: 999px; padding: 2px 8px; font-size: 10.5px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em; }

        .bell-dot { position: absolute; top: -2px; right: -2px; background: ${T.red}; color: #fff; font-size: 9.5px; min-width: 15px; height: 15px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); padding: 0 3px; }
        .notif-panel { position: absolute; top: calc(100% + 10px); right: 0; width: 320px; max-width: calc(100vw - 44px); background: ${T.paper}; border: 1px solid ${T.line}; border-radius: 10px; z-index: 56; box-shadow: 0 10px 30px rgba(27,42,74,0.24); overflow: hidden; }
        .notif-panel-header { background: ${T.ink}; color: ${T.paper}; padding: 12px 16px; font-size: 13px; display: flex; align-items: center; gap: 8px; font-family: var(--font-display); }
        .notif-list { max-height: 340px; overflow-y: auto; }
        .notif-item { padding: 12px 16px; border-bottom: 1px solid ${T.line}; background: #fff; }
        .notif-item:last-child { border-bottom: none; }
        .offer-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(232,163,61,0.16); border: 1px solid ${T.saffron}; color: ${T.saffronDeep}; border-radius: 999px; padding: 2px 8px; font-size: 10.5px; font-family: var(--font-mono); }

        .encouragement-banner { display: flex; align-items: flex-start; gap: 10px; background: rgba(232,163,61,0.12); border: 1px solid ${T.saffron}; border-radius: 8px; padding: 12px 14px; margin-bottom: 26px; font-size: 13.5px; color: ${T.ink}; }

        .split-pitch { display: flex; gap: 26px; align-items: center; flex-wrap: wrap; background: #fff; border: 1px solid ${T.line}; border-radius: 10px; padding: 20px 22px; margin-bottom: 20px; }
        .split-pitch-figure { display: flex; flex-direction: column; }
        .split-pitch-figure > span:first-child { font-family: var(--font-display); font-size: 32px; line-height: 1; }
        .split-pitch-caption { font-size: 11.5px; color: ${T.muted}; margin-top: 4px; max-width: 130px; }

        .referral-promo { display: flex; gap: 8px; align-items: flex-start; background: rgba(232,163,61,0.12); border: 1px solid ${T.saffron}; border-radius: 8px; padding: 10px 12px; margin-top: 14px; font-size: 12.5px; color: ${T.ink}; line-height: 1.4; }

        /* ---------------------------------------------------------------- */
        /* Mobile                                                           */
        /* ---------------------------------------------------------------- */
        @media (max-width: 720px) {
          .topnav { padding: 0 12px; gap: 8px; }
          .brand { font-size: 16px; gap: 6px; }
          .brand-mark { width: 24px; height: 24px; }
          .nav-tabs { flex: 1; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 2px; }
          .nav-tabs::-webkit-scrollbar { display: none; }
          .nav-tab { padding: 8px 9px; flex-shrink: 0; }
          .nav-tab-label { display: none; }
          .auth-controls { gap: 6px; }
          .admin-link-btn { display: none; }
          .nav-login-label { display: none; }
          .session-chip { padding: 4px 8px 4px 4px; gap: 5px; }
          .session-role { display: none; }

          .hero-band { padding: 28px 16px 26px; }
          .grid-cards { grid-template-columns: 1fr; }
          .modal-card { max-width: calc(100vw - 32px) !important; }
          .modal-backdrop { padding: 12px; }
          .stub-strip { grid-template-columns: repeat(2, 1fr); }
          .split-pitch { padding: 16px; gap: 16px; }
          .split-pitch-figure { flex: 1 1 40%; }
          .ledger-row { padding: 12px; }
          .ledger-figures { gap: 12px; width: 100%; justify-content: space-between; }
          .question-panel { padding: 16px; }
          .option-row { padding: 10px; font-size: 13.5px; }
          .chat-panel { right: 10px; left: 10px; width: auto; bottom: 78px; }
          .chat-fab { right: 14px; bottom: 14px; }
          .notif-panel { right: 10px; left: 10px; width: auto; }
          .role-toggle { flex-direction: column; }
          .role-toggle-btn { border-right: none; border-bottom: 1px solid ${T.line}; }
          .role-toggle-btn:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="topnav">
        <div className="brand">
          <span className="brand-mark"><BrandMark size={30} /></span>
          TestMandi
        </div>
        <div className="nav-tabs">
          {NAV.map((n) => (
            <button key={n.key} className={`nav-tab ${role === n.key ? "active" : ""}`} onClick={() => setRole(n.key)}>
              <n.icon size={15} /> <span className="nav-tab-label">{n.label}</span>
            </button>
          ))}
        </div>
        <div className="auth-controls">
          <NotificationBell notifications={notifications} session={session} />
          {session ? (
            <div className="session-chip">
              <span className="session-avatar">{session.name.charAt(0).toUpperCase()}</span>
              <span>
                <div className="session-name">{session.name}</div>
                <div className="session-role">{session.role}</div>
              </span>
              <button className="icon-btn" style={{ color: T.paper }} onClick={logout} title="Log out"><LogOut size={15} /></button>
            </div>
          ) : (
            <>
              <button className="admin-link-btn" onClick={() => openAuth("admin", "login")} title="Admin sign-in">Admin</button>
              <button className="nav-login-btn" onClick={() => openAuth("buyer", "login")}><LogIn size={15} /> <span className="nav-login-label">Log in / Register</span></button>
            </>
          )}
        </div>
      </div>

      {backendUnreachable && (
        <div className="backend-warning">
          <ShieldOff size={14} /> Can't reach the TestMandi backend at <code>{api.baseUrl}</code> — showing local demo data instead. If that's meant to be your local server, make sure <code>npm run dev</code> is running in your testmandi-server folder; if it's a deployed URL, check it's actually live and that its CORS_ORIGIN allows this address.
        </div>
      )}

      {session && session.emailVerified === false && <VerifyEmailBanner />}

      {role === "marketplace" && (
        <Marketplace
          tests={tests}
          bundles={bundles}
          ads={marketplaceAds}
          purchasedIds={purchasedIds}
          purchasedBundleIds={purchasedBundleIds}
          onBuy={(t) => startCheckout(t, "test")}
          onBuyBundle={(b) => startCheckout(b, "bundle")}
          goLearning={() => setRole("learning")}
          sellerShare={sellerShare}
          categories={categories}
          sharedItemId={sharedItemId}
        />
      )}
      {role === "seller" && (
        <SellerStudio
          myTests={sellerTests}
          mySellerBundles={sellerBundles}
          onPublishBundle={publishBundle}
          sellerShare={sellerShare}
          onPublish={publishTest}
          session={session}
          payouts={sellerPayouts}
          onSaveBank={saveSellerBank}
          onWithdraw={withdrawSellerFunds}
          onRequireLogin={requireLoginFor}
          categories={categories}
        />
      )}
      {role === "learning" && (
        <MyLearning
          tests={tests}
          purchasedIds={purchasedIds}
          attempts={attempts}
          onStart={(id) => setActiveTestId(id)}
          onExitToMarket={() => setRole("marketplace")}
          activeTestId={activeTestId}
          testState={null}
          onSubmitAttempt={submitAttempt}
          onExitRunner={() => setActiveTestId(null)}
          reportAttemptId={reportAttemptId}
          onRate={rateAttempt}
          onOpenReport={(id) => setReportAttemptId(id)}
          clearReport={() => setReportAttemptId(null)}
          session={session}
          onRequireLogin={requireLoginFor}
        />
      )}
      {role === "ads" && (
        <AdsStudio
          session={session}
          categories={categories}
          ads={ads}
          onRequireLogin={requireLoginFor}
          onStartAdCheckout={startAdCheckout}
        />
      )}
      {role === "admin" && session?.role === "admin" && (
        <Admin
          tests={adminData.tests}
          purchases={adminData.purchases}
          bundles={adminData.bundles}
          bundlePurchases={adminData.bundlePurchases}
          sellerShare={sellerShare}
          setSellerShare={commitSellerShare}
          sellerShareError={sellerShareError}
          categories={categories}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          registeredUsers={adminAccounts}
          onRemoveAccount={removeAccount}
          notifications={notifications}
          onSendNotification={sendNotification}
          ads={adminData.ads}
          onDeleteTest={deleteTestAsAdmin}
          onDeleteBundle={deleteBundleAsAdmin}
          onDeleteAd={deleteAdAsAdmin}
          session={session}
          onAccountUpdated={(u) => { upsertLocalUser(u); setSession(u); }}
        />
      )}

      <ChatWidget session={session} />

      {authAction && <AuthActionModal action={authAction} onDone={clearAuthAction} />}

      {authModal && (
        <AuthModal
          initialMode={authModal.mode}
          initialRole={authModal.role}
          onClose={closeAuth}
          onRegister={registerUser}
          onLogin={loginUser}
          loginError={loginError}
          defaultReferralCode={authModal.role === "buyer" ? urlReferralCode : ""}
        />
      )}

      {checkoutTest && session && (
        <CheckoutModal
          kind={checkoutKind}
          itemId={checkoutTest.id}
          adDraft={checkoutKind === "ad" ? pendingAd : null}
          displayTitle={checkoutTest.title}
          displayPrice={checkoutTest.price}
          sellerName={checkoutTest.sellerName}
          buyerName={session.name}
          onClose={() => setCheckoutTest(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
