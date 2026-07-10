/**
 * Reusable skeleton loading components.
 * Used across all pages instead of spinners.
 */

const shimmerCss = `
@keyframes sk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.sk-shimmer {
  background: linear-gradient(90deg,#0f1d35 25%,#1a2f50 50%,#0f1d35 75%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.6s ease-in-out infinite;
  border-radius: 6px;
}
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === "undefined") return;
  styleInjected = true;
  const s = document.createElement("style");
  s.textContent = shimmerCss;
  document.head.appendChild(s);
}

/** Shimmer block — generic box */
export function SkeletonBox({
  width = "100%",
  height,
  radius = 6,
  style,
}: {
  width?: string | number;
  height: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  injectStyle();
  return (
    <div
      className="sk-shimmer"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

/** Poster-ratio card skeleton — mirrors ShowCard */
export function SkeletonCard({ aspectRatio = "3/4" }: { aspectRatio?: string }) {
  injectStyle();
  const pct = aspectRatio === "16/9" ? "56.25%" : "133.33%";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", paddingTop: pct, borderRadius: 8, overflow: "hidden" }}>
        <div className="sk-shimmer" style={{ position: "absolute", inset: 0, borderRadius: 8 }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <div className="sk-shimmer" style={{ height: 12, width: "78%", marginBottom: 6 }} />
        <div className="sk-shimmer" style={{ height: 10, width: "48%" }} />
      </div>
    </div>
  );
}

/** A horizontal row of SkeletonCards */
export function SkeletonRow({
  count = 6,
  label = true,
  aspectRatio,
}: {
  count?: number;
  label?: boolean;
  aspectRatio?: string;
}) {
  injectStyle();
  return (
    <div style={{ padding: "0 12px", marginBottom: 28 }}>
      {label && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div className="sk-shimmer" style={{ height: 14, width: 120 }} />
          <div className="sk-shimmer" style={{ height: 10, width: 40 }} />
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: 10,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} aspectRatio={aspectRatio} />
        ))}
      </div>
    </div>
  );
}

/** Hero-slider skeleton — 4 side-by-side 16:9 boxes */
export function SkeletonHero() {
  injectStyle();
  return (
    <div style={{ padding: "8px 14px 18px" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: "0 0 calc(25% - 6px)", minWidth: 0 }}>
            <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 8, overflow: "hidden" }}>
              <div className="sk-shimmer" style={{ position: "absolute", inset: 0, borderRadius: 8 }} />
            </div>
            <div style={{ marginTop: 6 }}>
              <div className="sk-shimmer" style={{ height: 11, width: "75%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-page skeleton for category / search pages */
export function SkeletonCategoryPage({ count = 18 }: { count?: number }) {
  injectStyle();
  return (
    <div style={{ minHeight: "100vh", background: "#0c1426", paddingTop: 70 }}>
      {/* Page header */}
      <div style={{ padding: "24px 16px 16px" }}>
        <div className="sk-shimmer" style={{ height: 20, width: 140, marginBottom: 10 }} />
        <div className="sk-shimmer" style={{ height: 12, width: 260 }} />
      </div>
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
          padding: "0 12px 40px",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

/** Full-page skeleton for PlayPage (player area + meta) */
export function SkeletonPlayPage() {
  injectStyle();
  return (
    <div style={{ minHeight: "100vh", background: "#0c1426", paddingTop: 54 }}>
      {/* Player area */}
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#0a1525" }}>
          <div className="sk-shimmer" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
          {/* Fake play button */}
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center", pointerEvents: "none",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.1)",
            }} />
          </div>
        </div>
      </div>
      {/* Meta */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
        <div className="sk-shimmer" style={{ height: 20, width: 220, marginBottom: 10 }} />
        <div className="sk-shimmer" style={{ height: 13, width: 140, marginBottom: 20 }} />
        <div className="sk-shimmer" style={{ height: 11, width: "90%", marginBottom: 6 }} />
        <div className="sk-shimmer" style={{ height: 11, width: "75%", marginBottom: 6 }} />
        <div className="sk-shimmer" style={{ height: 11, width: "55%" }} />
      </div>
    </div>
  );
}

/** Skeleton for distros cards grid */
export function SkeletonDistros({ count = 8 }: { count?: number }) {
  injectStyle();
  return (
    <div style={{ minHeight: "100vh", background: "#0c1426", paddingTop: 70 }}>
      <div style={{ padding: "20px 14px 12px" }}>
        <div className="sk-shimmer" style={{ height: 18, width: 160, marginBottom: 8 }} />
        <div className="sk-shimmer" style={{ height: 11, width: 220 }} />
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 14,
        padding: "0 14px 40px",
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

/** Channel card skeleton for Live TV page */
export function SkeletonChannelCard() {
  injectStyle();
  return (
    <div style={{ background: "#0f1d35", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div className="sk-shimmer" style={{ width: 56, height: 56, borderRadius: 10 }} />
      <div className="sk-shimmer" style={{ height: 11, width: "70%" }} />
      <div className="sk-shimmer" style={{ height: 9, width: "50%" }} />
    </div>
  );
}
