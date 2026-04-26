import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Truck, Clock, Lock, Globe2, ArrowLeft } from "lucide-react";
import { fbApi } from "../lib/firebaseApi";
import { useAuth } from "../contexts/AuthContext";
import {
  checkIsDistro,
  isDistroExclusive,
  isInDistrosWindow,
  getCreatedAtMs,
  timeLeftLabel,
  DISTRO_EXCLUSIVE_MS,
  DISTRO_WINDOW_MS,
} from "../lib/distros";
import ShowCard from "../components/ShowCard";

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
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(15,15,20,0.85)",
              color: "#fbbf24",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.05em",
              border: "1px solid rgba(251,191,36,0.4)",
            }}
          >
            <Lock size={9} /> DISTROS ONLY
          </span>
        )}
        {mode === "window" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(15,15,20,0.85)",
              color: "#34d399",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.05em",
              border: "1px solid rgba(52,211,153,0.4)",
            }}
          >
            <Globe2 size={9} /> NOW PUBLIC
          </span>
        )}
        <CountdownBadge item={show} mode={mode} />
      </div>
    </div>
  );
}

export default function DistrosPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const isDistro = checkIsDistro(user, profile);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDistro) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fbApi.publicContent
      .listAll()
      .then((docs) => {
        const inWindow = (docs || [])
          .filter((d: any) => isInDistrosWindow(d))
          .map(toShow)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setShows(inWindow);
      })
      .finally(() => setLoading(false));
  }, [isDistro]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 54 }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  if (!isDistro) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: "120px 20px 60px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(245,158,11,0.4)" }}>
          <Lock size={26} color="#f59e0b" />
        </div>
        <div style={{ color: "#fbbf24", fontSize: 18, fontWeight: 700 }}>Distros Area</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, maxWidth: 380, lineHeight: 1.6 }}>
          This page is reserved for our distributor partners. New uploads land here first for 24 hours before going public, and remain visible to distros for one week.
        </div>
        <Link href="/">
          <button style={{ marginTop: 8, padding: "10px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={13} /> Back to Home
          </button>
        </Link>
      </div>
    );
  }

  const exclusive = shows.filter((s) => isDistroExclusive(s));
  const nowPublic = shows.filter((s) => !isDistroExclusive(s));

  return (
    <div style={{ paddingTop: 54, minHeight: "100vh" }}>
      <div style={{ padding: "20px clamp(12px,2vw,40px) 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(245,158,11,0.35)" }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "0.03em" }}>DISTROS</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              First-look distribution feed · exclusive for 24h, in distros for 7 days
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: "rgba(245,158,11,0.08)",
            borderRadius: 10,
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#fbbf24", fontSize: 12 }}>
            <Lock size={13} /> <strong>{exclusive.length}</strong> distros-only
          </div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#34d399", fontSize: 12 }}>
            <Globe2 size={13} /> <strong>{nowPublic.length}</strong> already public
          </div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            <Clock size={13} /> auto-publishes after 24h, leaves distros after 7d
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Loading distros feed…
        </div>
      ) : shows.length === 0 ? (
        <div style={{ padding: 80, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          No items in the distros window right now. New uploads will appear here automatically.
        </div>
      ) : (
        <div style={{ padding: "8px clamp(12px,2vw,40px) 60px" }}>
          {exclusive.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Lock size={15} color="#fbbf24" />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                  EXCLUSIVE TO DISTROS · FIRST 24 HOURS
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 14,
                }}
              >
                {exclusive.map((s) => (
                  <CardWithCountdown key={s.id} show={s} mode="exclusive" />
                ))}
              </div>
            </section>
          )}

          {nowPublic.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Globe2 size={15} color="#34d399" />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                  PUBLISHED · STILL IN DISTROS WINDOW
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 14,
                }}
              >
                {nowPublic.map((s) => (
                  <CardWithCountdown key={s.id} show={s} mode="window" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
