import { useEffect } from "react";
import { X, Download, Monitor } from "lucide-react";

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

  const btnBase: React.CSSProperties = {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6%",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "filter 0.15s, transform 0.15s",
    padding: "0 4%",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textDecoration: "none",
    fontFamily: "inherit",
  };

  return (
    <>
      {/* Blurred backdrop */}
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
          background: "#000",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 8px 28px rgba(0,0,0,0.6)",
          animation: "dlFloatIn 0.36s cubic-bezier(0.34,1.35,0.64,1)",
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
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(210,25,25,0.9)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        >
          <X size={13} style={{ pointerEvents: "none" }} />
        </button>

        {/* Image + overlay buttons */}
        <div style={{ position: "relative", lineHeight: 0, userSelect: "none" }}>
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />

          {/* ── Download APK button — covers left black box ────────────────
              Image 612×408. Black boxes span roughly y=65%–77%, two side-by-side.
              Left box:  x≈59.5%–75.3%  Right box: x≈77%–93%
          ──────────────────────────────────────────────────────────────── */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              ...btnBase,
              left: "59.5%",
              top: "65%",
              width: "15.8%",
              height: "12%",
              background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
              color: "#fff",
              fontSize: "clamp(5px, 1.3vw, 9px)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <Download size={10} style={{ flexShrink: 0 }} />
            Download
          </a>

          {/* ── Continue Online button — covers right black box ───────────── */}
          <button
            onClick={onClose}
            style={{
              ...btnBase,
              left: "77%",
              top: "65%",
              width: "15.8%",
              height: "12%",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "clamp(5px, 1.3vw, 9px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.4)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <Monitor size={10} style={{ flexShrink: 0 }} />
            Online
          </button>

          {/* Bottom fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "18%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.95) 100%)",
              pointerEvents: "none",
            }}
          />
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
