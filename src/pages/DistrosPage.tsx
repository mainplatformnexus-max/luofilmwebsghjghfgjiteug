import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Truck, Clock, Lock, Globe2, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { fbApi } from "../lib/firebaseApi";
import { useAuth } from "../contexts/AuthContext";
import {
  isDistroExclusive,
  timeLeftLabel,
  useIsDistroSubscriber,
  useIsDistroOperator,
  DISTRO_EXCLUSIVE_MS,
  DISTRO_WINDOW_MS,
  DISTROS_PLAN_DAYS,
  DISTROS_PLAN_DEFAULT_PRICE,
} from "../lib/distros";
import ShowCard from "../components/ShowCard";
import DistrosSubscribeModal from "../components/DistrosSubscribeModal";
import AuthModal from "../components/AuthModal";

interface Show {
  id: string;
  title: string;
  type: string;
  episodeCount?: number;
  badge?: string;
  genre?: string;
  year?: number;
  rating?: number;
  description?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  createdAt?: number;
}

function toShow(d: any): Show {
  return {
    id: d.id,
    title: d.title || "",
    type: d.type || "series",
    episodeCount: d.episodeCount || 0,
    badge: d.badge || "none",
    genre: d.genre || "",
    year: d.year || new Date().getFullYear(),
    rating: d.rating || 0,
    description: d.description || "",
    coverUrl: d.coverUrl || d.thumbnailUrl || "",
    thumbnailUrl: d.thumbnailUrl || d.coverUrl || "",
    createdAt: d.createdAt || 0,
  };
}

function CountdownBadge({ item, mode }: { item: any; mode: "exclusive" | "window" }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const total = mode === "exclusive" ? DISTRO_EXCLUSIVE_MS : DISTRO_WINDOW_MS;
  const label = timeLeftLabel(item, total);
  const color = mode === "exclusive" ? "#f59e0b" : "#10b981";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: `${color}22`, border: `1px solid ${color}55`, color, fontSize: 10, fontWeight: 700 }}>
      <Clock size={10} /> {label}
    </span>
  );
}

function CardWithCountdown({ show, mode }: { show: Show; mode: "exclusive" | "window" }) {
  return (
    <div style={{ position: "relative" }}>
      <ShowCard show={show as any} />
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 5, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
        {mode === "exclusive" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: "rgba(12,20,38,0.88)", color: "#fbbf24", fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", border: "1px solid rgba(251,191,36,0.4)" }}>
            <Lock size={9} /> DISTROS ONLY
          </span>
        )}
        {mode === "window" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: "rgba(12,20,38,0.88)", color: "#34d399", fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", border: "1px solid rgba(52,211,153,0.4)" }}>
            <Globe2 size={9} /> NOW PUBLIC
          </span>
        )}
        <CountdownBadge item={show} mode={mode} />
      </div>
    </div>
  );
}

/** Locked card — shown to non-subscribers for exclusive items. Clicking opens the subscribe modal. */
function GatedCard({ show, onLocked }: { show: Show; onLocked: () => void }) {
  return (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={onLocked}>
      <CardWithCountdown show={show} mode="exclusive" />
      {/* Full overlay that intercepts clicks and blocks navigation */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "rgba(8,14,30,0.75)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          borderRadius: 8,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(245,158,11,0.18)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(245,158,11,0.4)" }}>
          <Lock size={16} color="#fbbf24" />
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#fbbf24", letterSpacing: "0.06em" }}>DISTROS ONLY</span>
        <span style={{ fontSize: 9, color: "rgba(180,210,255,0.6)", textAlign: "center", lineHeight: 1.4 }}>Subscribe for<br />24h early access</span>
      </div>
    </div>
  );
}

function formatExpiry(ms: number | null): string {
  if (!ms) return "";
  const remaining = ms - Date.now();
  if (remaining <= 0) return "expired";
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} left`;
  const hours = Math.max(1, Math.floor(remaining / (60 * 60 * 1000)));
  return `${hours}h left`;
}

export default function DistrosPage() {
  const { user, loading: authLoading } = useAuth();
  const isOperator = useIsDistroOperator();
  const { active: hasDistros, loading: subLoading, expiresAt } = useIsDistroSubscriber();
  const hasAccess = isOperator || hasDistros;

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [price, setPrice] = useState<number>(DISTROS_PLAN_DEFAULT_PRICE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    fbApi.settings.get().then((s: any) => {
      if (s && typeof s.planDistrosPrice === "number") setPrice(Number(s.planDistrosPrice));
    }).catch(() => {});
  }, []);

  // Always load shows for everyone — subscription gates play access, not visibility
  useEffect(() => {
    setLoading(true);
    fbApi.publicContent.listDistros()
      .then((docs) => {
        const mapped = (docs || []).map(toShow).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setShows(mapped);
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  useEffect(() => {
    fbApi.activities.log({
      userId: user?.uid || null,
      userName: user?.displayName || null,
      userEmail: user?.email || null,
      actionType: "page_view",
      page: "/distros",
      details: hasAccess ? "distros member" : "non-subscriber viewing distros",
    }).catch(() => {});
  }, [user?.uid, hasAccess]);

  const handleLockedClick = () => {
    if (!user) { setShowAuth(true); return; }
    setShowSubscribe(true);
  };

  if (authLoading || subLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 54 }}>
        <div style={{ color: "rgba(180,210,255,0.5)", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  const exclusive = shows.filter((s) => isDistroExclusive(s));
  const nowPublic = shows.filter((s) => !isDistroExclusive(s));
  const expired = !!user && !!expiresAt && expiresAt < Date.now();

  return (
    <div style={{ paddingTop: 54, minHeight: "100vh", background: "#0c1426" }}>
      {/* ── Header ── */}
      <div style={{ padding: "20px clamp(12px,2vw,40px) 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(245,158,11,0.35)" }}>
            <Truck size={20} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "0.03em" }}>DISTROS</h1>
            <div style={{ fontSize: 12, color: "rgba(180,210,255,0.55)" }}>
              First-look distribution feed · exclusive for 24h, in distros for 7 days
            </div>
          </div>
          {hasAccess && !isOperator && expiresAt && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(180,210,255,0.45)" }}>
                Membership: <strong style={{ color: "#34d399" }}>{formatExpiry(expiresAt)}</strong>
              </span>
              <button
                onClick={() => setShowSubscribe(true)}
                style={{ padding: "6px 12px", background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.35)", color: "#fbbf24", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <RefreshCw size={11} /> Renew
              </button>
            </div>
          )}
        </div>

        {/* ── Subscribe banner for non-subscribers ── */}
        {!hasAccess && (
          <div style={{ marginBottom: 14, padding: "14px 18px", background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.08))", border: "1px solid rgba(245,158,11,0.28)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 3 }}>
                🔒 Get 24h early access before the public
              </div>
              <div style={{ fontSize: 11, color: "rgba(180,210,255,0.55)" }}>
                {expired ? "Your Distros pass expired. Renew to unlock all early releases." : `UGX ${price.toLocaleString()} · ${DISTROS_PLAN_DAYS}-day Distros membership · Mobile Money`}
              </div>
            </div>
            <button
              onClick={handleLockedClick}
              style={{ padding: "10px 22px", borderRadius: 22, background: "linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#ef4444 100%)", border: "none", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(245,158,11,0.4)", whiteSpace: "nowrap" }}
            >
              {expired ? "Renew Distros Pass" : "Subscribe to Distros"}
            </button>
          </div>
        )}

        {/* ── Stats bar (subscribers only) ── */}
        {hasAccess && shows.length > 0 && (
          <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(245,158,11,0.07)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#fbbf24", fontSize: 12 }}>
              <Lock size={13} /> <strong>{exclusive.length}</strong> distros-only
            </div>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#34d399", fontSize: 12 }}>
              <Globe2 size={13} /> <strong>{nowPublic.length}</strong> already public
            </div>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "rgba(180,210,255,0.55)", fontSize: 12 }}>
              <Clock size={13} /> auto-publishes after 24h, leaves distros after 7d
            </div>
          </div>
        )}
      </div>

      {/* ── Content grid ── */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "rgba(180,210,255,0.4)", fontSize: 13 }}>
          Loading distros feed…
        </div>
      ) : shows.length === 0 ? (
        <div style={{ padding: 80, textAlign: "center", color: "rgba(180,210,255,0.4)", fontSize: 13 }}>
          No items in the distros window right now. New uploads appear here automatically.
        </div>
      ) : (
        <div style={{ padding: "8px clamp(12px,2vw,40px) 80px" }}>

          {/* Exclusive section */}
          {exclusive.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Lock size={15} color="#fbbf24" />
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.06em" }}>
                  EXCLUSIVE TO DISTROS · FIRST 24 HOURS
                </h2>
                {!hasAccess && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(245,158,11,0.8)", fontWeight: 600, cursor: "pointer" }} onClick={handleLockedClick}>
                    🔒 Subscribe to unlock →
                  </span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {exclusive.map((s) =>
                  hasAccess ? (
                    <Link key={s.id} href={`/play/${s.id}`}>
                      <CardWithCountdown show={s} mode="exclusive" />
                    </Link>
                  ) : (
                    <GatedCard key={s.id} show={s} onLocked={handleLockedClick} />
                  )
                )}
              </div>
            </section>
          )}

          {/* Now public section — visible and clickable for everyone */}
          {nowPublic.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Globe2 size={15} color="#34d399" />
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.06em" }}>
                  PUBLISHED · STILL IN DISTROS WINDOW
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {nowPublic.map((s) => (
                  <Link key={s.id} href={`/play/${s.id}`}>
                    <CardWithCountdown show={s} mode="window" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Back link for non-subscribers who want to go home */}
      {!hasAccess && shows.length === 0 && (
        <div style={{ textAlign: "center", paddingBottom: 40 }}>
          <Link href="/">
            <button style={{ padding: "10px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          </Link>
        </div>
      )}

      {showSubscribe && (
        <DistrosSubscribeModal
          renewal={expired}
          onClose={() => setShowSubscribe(false)}
          onSubscribed={() => { setShowSubscribe(false); setReloadKey((k) => k + 1); }}
          onOpenAuth={() => { setShowSubscribe(false); setShowAuth(true); }}
        />
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Benefit cards — shown to non-subscribers at the bottom */}
      {!hasAccess && (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px 80px", textAlign: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
            {[
              { icon: Lock,      color: "#f59e0b", title: "First 24 hours",   desc: "Distros-only access" },
              { icon: Globe2,    color: "#10b981", title: "Full 7 days",       desc: "Stays in your distros feed" },
              { icon: ShieldCheck,color: "#6366f1",title: "Mobile Money",      desc: "Instant activation" },
              { icon: RefreshCw, color: "#ec4899", title: "Auto expires",      desc: "Renew anytime in one tap" },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 8, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "left" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: b.color + "22", color: b.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <b.icon size={14} />
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{b.title}</div>
                  <div style={{ color: "rgba(180,210,255,0.45)", fontSize: 10.5, marginTop: 2 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
