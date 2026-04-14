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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 680,
          width: "100%",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "modalPop 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 20,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>

        {/* Banner image wrapper — all overlays positioned inside this */}
        <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            style={{ width: "100%", display: "block", borderRadius: 20 }}
          />

          {/* QR Code overlay — positioned over the QR placeholder in the image */}
          <div
            style={{
              position: "absolute",
              left: "46.5%",
              top: "55%",
              width: "11.5%",
              aspectRatio: "1",
              background: "#fff",
              borderRadius: 6,
              padding: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            <QRCodeSVG
              value={APP_DOWNLOAD_URL}
              size={999}
              style={{ width: "100%", height: "100%" }}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Google Play button overlay */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              left: "60%",
              top: "68%",
              width: "17%",
              height: "9%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5c-.5.33-1.5.33-1.5-.5z" fill="#34a853" />
              <path d="M3 3.5L13.5 14 3 20.5V3.5z" fill="#fbbc05" />
              <path d="M3 3.5L13.5 14l4-4L4.5 3C4 2.67 3 2.67 3 3.5z" fill="#ea4335" />
              <path d="M3 20.5l10.5-6.5 4 4L4.5 21c-.5.33-1.5.33-1.5-.5z" fill="#4285f4" />
            </svg>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>GET IT ON</div>
              <div style={{ fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>Google Play</div>
            </div>
          </a>

          {/* Direct APK Download button overlay */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              left: "79%",
              top: "68%",
              width: "17%",
              height: "9%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00a9f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>DIRECT</div>
              <div style={{ fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>APK Download</div>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
