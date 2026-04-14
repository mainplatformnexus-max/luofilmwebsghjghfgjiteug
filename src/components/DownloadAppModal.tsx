import { useEffect } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const APP_DOWNLOAD_URL = "https://luofilm.site/download";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.luofilm.app";

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
      {/* Floating card — no backdrop, floats over the page */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9000,
          width: "min(680px, 96vw)",
          animation: "floatIn 0.35s cubic-bezier(0.34,1.45,0.64,1)",
          filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.7)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
          pointerEvents: "auto",
        }}
      >
        {/* Close button — above everything */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 10,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,30,30,0.85)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.75)")}
        >
          <X size={14} />
        </button>

        {/* The image IS the card — overlays sit on top */}
        <div style={{ position: "relative", lineHeight: 0, userSelect: "none" }}>
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{ width: "100%", display: "block", borderRadius: 18 }}
          />

          {/* ── QR Code ─────────────────────────────────────────────────────── */}
          {/* Covers the QR placeholder square on the purple card */}
          <div
            style={{
              position: "absolute",
              left: "46.8%",
              top: "54.5%",
              width: "10.8%",
              aspectRatio: "1 / 1",
              background: "#fff",
              borderRadius: 5,
              padding: "3%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          {/* Left black button placeholder */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "59.5%",
              top: "67%",
              width: "17.5%",
              height: "12%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5%",
              background: "#111",
              borderRadius: 9,
              textDecoration: "none",
              overflow: "hidden",
              transition: "filter 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.35)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1)")}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: "18%", flexShrink: 0 }}>
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5c-.5.33-1.5.33-1.5-.5z" fill="#34a853" />
              <path d="M3 3.5L13.5 14 3 20.5V3.5z" fill="#fbbc05" />
              <path d="M3 3.5L13.5 14l4-4L4.5 3C4 2.67 3 2.67 3 3.5z" fill="#ea4335" />
              <path d="M3 20.5l10.5-6.5 4 4L4.5 21c-.5.33-1.5.33-1.5-.5z" fill="#4285f4" />
            </svg>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: "clamp(5px,1.2vw,8px)", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>GET IT ON</div>
              <div style={{ fontSize: "clamp(7px,1.5vw,11px)", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>Google Play</div>
            </div>
          </a>

          {/* ── APK Download button ──────────────────────────────────────── */}
          {/* Right black button placeholder */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "79%",
              top: "67%",
              width: "17.5%",
              height: "12%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5%",
              background: "#111",
              borderRadius: 9,
              textDecoration: "none",
              overflow: "hidden",
              transition: "filter 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.35)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1)")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00a9f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18%", flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: "clamp(5px,1.2vw,8px)", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>DIRECT</div>
              <div style={{ fontSize: "clamp(7px,1.5vw,11px)", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>APK Download</div>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateX(-50%) translateY(40px) scale(0.93); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);    }
        }
      `}</style>
    </>
  );
}
