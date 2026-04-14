import { useEffect } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const APP_DOWNLOAD_URL = "https://luofilm.site/download";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.luofilm.app";

// Image natural size: 612 × 408 px
// All overlay positions are expressed as % of that natural size.
// Measured against the original image content (transparent bg removed):
//   QR placeholder:     left=45.6%, top=53.4%, w=12.6%, h=19.1%
//   Button 1 (Play):    left=59.8%, top=65.4%, w=15.5%, h=11.5%
//   Button 2 (APK):     left=77.3%, top=65.4%, w=15.5%, h=11.5%

interface Props {
  onClose: () => void;
}

export default function DownloadAppModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const btnStyle = (left: string, top: string, width: string, height: string): React.CSSProperties => ({
    position: "absolute",
    left, top, width, height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6%",
    background: "#0e0e0e",
    borderRadius: "7px",
    textDecoration: "none",
    overflow: "hidden",
    transition: "filter 0.15s, transform 0.15s",
    cursor: "pointer",
    boxSizing: "border-box",
    padding: "0 4%",
  });

  const hover = {
    enter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      (e.currentTarget as HTMLElement).style.filter = "brightness(1.4)";
      (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
    },
    leave: (e: React.MouseEvent<HTMLAnchorElement>) => {
      (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
    },
  };

  return (
    <>
      {/* Floating card — centered, no backdrop */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9000,
          width: "min(640px, 94vw)",
          pointerEvents: "auto",
          animation: "dlFloatIn 0.38s cubic-bezier(0.34,1.4,0.64,1)",
          filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.75)) drop-shadow(0 6px 16px rgba(0,0,0,0.55))",
        }}
      >
        {/* ── Close button ─────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "2%",
            right: "1.5%",
            zIndex: 20,
            width: "5%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.72)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,20,20,0.85)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.72)")}
        >
          <X size={12} style={{ pointerEvents: "none" }} />
        </button>

        {/* ── Image + overlay container ────────────────────────────────── */}
        <div style={{ position: "relative", lineHeight: 0, userSelect: "none" }}>
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />

          {/* ── Bottom fade — like hero slide ──────────────────────────── */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "28%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.55) 55%, rgba(10,10,10,0.92) 100%)",
              borderRadius: "0 0 4px 4px",
              pointerEvents: "none",
            }}
          />

          {/* ── QR Code ─────────────────────────────────────────────────── */}
          {/* Covers the QR placeholder printed in the image */}
          <div
            style={{
              position: "absolute",
              left: "45.6%",
              top: "52%",
              width: "12.7%",
              aspectRatio: "1 / 1",
              background: "#fff",
              borderRadius: "5px",
              padding: "3%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <QRCodeSVG
              value={APP_DOWNLOAD_URL}
              size={512}
              style={{ width: "100%", height: "100%", display: "block" }}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* ── Google Play button ───────────────────────────────────────── */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={btnStyle("59.8%", "65.2%", "15.5%", "11.5%")}
            onMouseEnter={hover.enter}
            onMouseLeave={hover.leave}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: "16%", flexShrink: 0 }}>
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5c-.5.33-1.5.33-1.5-.5z" fill="#34a853" />
              <path d="M3 3.5L13.5 14 3 20.5V3.5z" fill="#fbbc05" />
              <path d="M3 3.5L13.5 14l4-4L4.5 3C4 2.67 3 2.67 3 3.5z" fill="#ea4335" />
              <path d="M3 20.5l10.5-6.5 4 4L4.5 21c-.5.33-1.5.33-1.5-.5z" fill="#4285f4" />
            </svg>
            <div style={{ lineHeight: 1.15, minWidth: 0 }}>
              <div style={{ fontSize: "clamp(4px,1.1vw,7px)", color: "rgba(255,255,255,0.55)", fontWeight: 500, whiteSpace: "nowrap" }}>GET IT ON</div>
              <div style={{ fontSize: "clamp(6px,1.4vw,10px)", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>Google Play</div>
            </div>
          </a>

          {/* ── Direct APK button ────────────────────────────────────────── */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={btnStyle("77.3%", "65.2%", "15.5%", "11.5%")}
            onMouseEnter={hover.enter}
            onMouseLeave={hover.leave}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00a9f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16%", flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div style={{ lineHeight: 1.15, minWidth: 0 }}>
              <div style={{ fontSize: "clamp(4px,1.1vw,7px)", color: "rgba(255,255,255,0.55)", fontWeight: 500, whiteSpace: "nowrap" }}>DIRECT</div>
              <div style={{ fontSize: "clamp(6px,1.4vw,10px)", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>APK Download</div>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes dlFloatIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 30px)) scale(0.93); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
