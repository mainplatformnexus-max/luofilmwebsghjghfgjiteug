import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Smartphone, X } from "lucide-react";

const STORAGE_KEY = "luofilm_open_in_app_dismissed";
const DEFAULT_LINK = "https://pub-4810ad32eae44d3db8b886164bf3650f.r2.dev/luofilm.apk";

export default function OpenInAppBanner() {
  const [visible, setVisible] = useState(false);
  const [appLink, setAppLink] = useState(DEFAULT_LINK);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    getDoc(doc(db, "settings", "main")).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.floatBannerLink) setAppLink(d.floatBannerLink);
      }
      setVisible(true);
    }).catch(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (visible) {
      document.body.classList.add("open-in-app-banner-visible");
    } else {
      document.body.classList.remove("open-in-app-banner-visible");
    }
    return () => document.body.classList.remove("open-in-app-banner-visible");
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 54,
        left: 0,
        right: 0,
        zIndex: 99,
        background: "linear-gradient(90deg, #0e0e0e 0%, #141428 50%, #0e0e0e 100%)",
        borderBottom: "1px solid rgba(0,169,245,0.2)",
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(10px, 2vw, 24px)",
        height: 40,
        gap: 10,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "rgba(0,169,245,0.15)",
        border: "1px solid rgba(0,169,245,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Smartphone size={14} color="#00a9f5" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 500 }}>
          Get a better experience on the{" "}
          <strong style={{ color: "#cc00cc" }}>LUOFILM</strong> app
        </span>
      </div>

      <a
        href={appLink}
        download={appLink.endsWith(".apk") ? "luofilm.apk" : undefined}
        target={appLink.endsWith(".apk") ? undefined : "_blank"}
        rel="noopener noreferrer"
        onClick={dismiss}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "linear-gradient(135deg, #00a9f5, #0080c8)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "5px 12px", borderRadius: 20,
          textDecoration: "none", flexShrink: 0,
          letterSpacing: "0.04em", whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(0,169,245,0.35)",
        }}
      >
        Open in App
      </a>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.35)",
          cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
          flexShrink: 0, borderRadius: 4,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
      >
        <X size={14} />
      </button>
    </div>
  );
}
