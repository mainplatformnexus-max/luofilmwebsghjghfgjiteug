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
        {/* Close button */}
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
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,20,20,0.85)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.72)")}
        >
          <X size={12} style={{ pointerEvents: "none" }} />
        </button>

        {/* Image + bottom fade */}
        <div style={{ position: "relative", lineHeight: 0, userSelect: "none" }}>
          <img
            src="/download-app-banner.png"
            alt="Download LUOFILM App"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />

          {/* Small bottom-edge fade overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "22%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(8,8,8,0.65) 60%, rgba(8,8,8,0.95) 100%)",
              pointerEvents: "none",
            }}
          />
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
