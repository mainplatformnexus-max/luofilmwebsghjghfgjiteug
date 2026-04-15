import { useEffect } from "react";
import { X } from "lucide-react";

// New image: 626×417, transparent only on left (44px). Content area: 564×417.
// scale = 626/564 = 1.110  → img width = 111%
// left offset = -(44/564)*100 = -7.80%
// top offset = 0 (no top transparent strip)
//
// Two STACKED dark buttons (visual estimate, content-space %):
//   Button 1 (Download):       left≈76%  top≈71%  w≈21%  h≈10%
//   Button 2 (Continue Online): left≈76%  top≈83%  w≈21%  h≈10%

const APP_DOWNLOAD_URL = "https://luofilm.site/download";

interface Props {
  onClose: () => void;
}

export default function DownloadAppModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Blurred backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 8999,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          animation: "dlBgIn 0.25s ease",
        }}
      />

      {/* Floating card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9000,
          width: "min(580px, 94vw)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 8px 28px rgba(0,0,0,0.55)",
          animation: "dlFloatIn 0.36s cubic-bezier(0.34,1.35,0.64,1)",
          background: "#fff",
          lineHeight: 0,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 20,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,0,0,0.15)",
            color: "#222",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(210,25,25,0.85)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.18)")}
        >
          <X size={13} style={{ pointerEvents: "none", color: "#fff" }} />
        </button>

        {/* ── Image crop container ─────────────────────────────────────────
            Aspect ratio = content W / content H = 564 / 417
            Image scaled to 111% width and shifted -7.8% left to clip
            the 44 px transparent left margin.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "564 / 417",
            overflow: "hidden",
          }}
        >
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{
              position: "absolute",
              width: "111%",
              left: "-7.8%",
              top: "0%",
            }}
          />

          {/* ── Download button — top dark box ────────────────────────────── */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "76%",
              top: "71%",
              width: "21%",
              height: "10%",
              background: "#1a1a2e",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "clamp(6px, 1.4vw, 10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8%",
              cursor: "pointer",
              textDecoration: "none",
              boxSizing: "border-box",
              transition: "filter 0.15s, transform 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1.6)";
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1)";
              el.style.transform = "scale(1)";
            }}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: "20%", flexShrink: 0 }}>
              <path d="M8 12l-4.5-4.5 1.06-1.06L7 9.38V2h2v7.38l2.44-2.94 1.06 1.06L8 12zM2 13h12v1.5H2z"/>
            </svg>
            Download
          </a>

          {/* ── Continue Online button — bottom dark box ──────────────────── */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              left: "76%",
              top: "83%",
              width: "21%",
              height: "10%",
              background: "#1a1a2e",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "clamp(6px, 1.4vw, 10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8%",
              cursor: "pointer",
              boxSizing: "border-box",
              transition: "filter 0.15s, transform 0.15s",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              padding: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1.6)";
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1)";
              el.style.transform = "scale(1)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20%", flexShrink: 0 }}>
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            Online
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dlBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dlFloatIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 28px)) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
