import { useEffect } from "react";
import { X } from "lucide-react";

// Image: 612×408 with transparent bg.
// After -trim, visible content is 493×323 at offset +59+42.
//
// Button coords in original image (visual estimate from rendered image):
//   Box1 (Download):        x≈365–445, y≈280–322  → in original px
//   Box2 (Continue Online): x≈455–535, y≈280–322
//
// Mapped to the cropped content (493×323) coordinate space:
//   Box1: left=(365-59)/493=62.1%  top=(280-42)/323=73.7%  w=80/493=16.2%  h=42/323=13%
//   Box2: left=(455-59)/493=80.3%  top=(280-42)/323=73.7%  w=80/493=16.2%  h=42/323=13%

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
      {/* Blurred backdrop — click to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 8999,
          background: "rgba(0,0,0,0.6)",
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
          width: "min(600px, 94vw)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 8px 28px rgba(0,0,0,0.6)",
          animation: "dlFloatIn 0.36s cubic-bezier(0.34,1.35,0.64,1)",
          background: "#000",
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
            background: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(210,25,25,0.9)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.75)")}
        >
          <X size={13} style={{ pointerEvents: "none" }} />
        </button>

        {/* ── Image crop wrapper ────────────────────────────────────────────
            Container uses the exact CONTENT aspect-ratio (493:323) so no
            transparent gutters are ever visible.
            The <img> is scaled up and shifted to clip away the empty margins.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            /* aspect-ratio = content W / content H = 493 / 323 */
            aspectRatio: "493 / 323",
            overflow: "hidden",
          }}
        >
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{
              position: "absolute",
              /* scale so content-width fills container: 612/493 ≈ 124.1% */
              width: "124.14%",
              /* shift left to hide transparent left margin (59 / 493 * 100) */
              left: "-11.97%",
              /* shift up to hide transparent top margin (42 / 493 * 100)   */
              top: "-8.52%",
            }}
          />

          {/* ── Download button — left dark box ──────────────────────────── */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "62.1%",
              top: "73.7%",
              width: "16.2%",
              height: "13%",
              background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
              border: "none",
              borderRadius: "7px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "clamp(6px, 1.5vw, 11px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8%",
              cursor: "pointer",
              textDecoration: "none",
              boxSizing: "border-box",
              transition: "filter 0.15s, transform 0.15s",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1.2)";
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1)";
              el.style.transform = "scale(1)";
            }}
          >
            {/* Download icon */}
            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: "22%", flexShrink: 0 }}>
              <path d="M8 12l-4.5-4.5 1.06-1.06L7 9.38V2h2v7.38l2.44-2.94 1.06 1.06L8 12zM2 13h12v1.5H2z"/>
            </svg>
            Download
          </a>

          {/* ── Continue Online button — right dark box ───────────────────── */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              left: "80.3%",
              top: "73.7%",
              width: "16.2%",
              height: "13%",
              background: "rgba(20,20,40,0.9)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "7px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              fontSize: "clamp(5px, 1.4vw, 10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6%",
              cursor: "pointer",
              boxSizing: "border-box",
              transition: "filter 0.15s, transform 0.15s",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
              fontFamily: "inherit",
              padding: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1.5)";
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = "brightness(1)";
              el.style.transform = "scale(1)";
            }}
          >
            {/* Monitor icon */}
            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: "22%", flexShrink: 0 }}>
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v9a1.5 1.5 0 0 1-1.5 1.5H9v1h1a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1h1v-1H2.5A1.5 1.5 0 0 1 1 11.5zM2.5 2a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/>
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
