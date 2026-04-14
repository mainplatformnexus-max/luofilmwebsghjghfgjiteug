import { useEffect } from "react";
import { X } from "lucide-react";

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
      {/* Dim backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 8999,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
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
          width: "min(580px, 92vw)",
          background: "linear-gradient(155deg, #1c1230 0%, #0f1b3a 100%)",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)",
          animation: "dlFloatIn 0.35s cubic-bezier(0.34,1.35,0.64,1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 20,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,30,30,0.8)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          <X size={15} style={{ pointerEvents: "none" }} />
        </button>

        {/* Banner image */}
        <div style={{ position: "relative", lineHeight: 0 }}>
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />

          {/* Bottom-edge gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "30%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(15,27,58,0.7) 55%, rgba(15,27,58,0.98) 100%)",
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
