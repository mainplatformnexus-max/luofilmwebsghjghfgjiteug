import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

/* ── Icons ────────────────────────────────────────────────────────────── */
function HomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8a1 1 0 0 0 1 1h5v-6h2v6h5a1 1 0 0 0 1-1v-8h3L12 3z" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function MovieIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="7" y1="2" x2="7" y2="22" stroke="#0c1426" strokeWidth="1.5" />
      <line x1="17" y1="2" x2="17" y2="22" stroke="#0c1426" strokeWidth="1.5" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#0c1426" strokeWidth="1.5" />
      <line x1="2" y1="7" x2="7" y2="7" stroke="#0c1426" strokeWidth="1.5" />
      <line x1="17" y1="7" x2="22" y2="7" stroke="#0c1426" strokeWidth="1.5" />
      <line x1="2" y1="17" x2="7" y2="17" stroke="#0c1426" strokeWidth="1.5" />
      <line x1="17" y1="17" x2="22" y2="17" stroke="#0c1426" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
      <line x1="17" y1="7" x2="22" y2="7" /><line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
    </svg>
  );
}
function SeriesIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function LiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8h20M2 12h20M2 16h20M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}
function DistrosIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function MeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_STATIC = [
  { label: "Home",    path: "/",        Icon: HomeIcon },
  { label: "Movies",  path: "/movie",   Icon: MovieIcon },
  { label: "Series",  path: "/series",  Icon: SeriesIcon },
  { label: "Live TV", path: "/live",    Icon: LiveIcon },
  { label: "Distros", path: "/distros", Icon: DistrosIcon },
];

export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const meActive = location.startsWith("/profile") || location.startsWith("/history") || location.startsWith("/watchlist") || location.startsWith("/downloads");

  function handleMe() {
    if (user) navigate("/profile");
    else setShowAuth(true);
  }

  return (
    <>
      <nav className="mobile-bottom-nav">
        {NAV_STATIC.map((item) => {
          const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
          return (
            <Link key={item.path} href={item.path}>
              <div className="nav-item-holder">
                <div className={`nav-icon-wrap ${isActive ? "nav-icon-active" : ""}`}>
                  <div className={`nav-icon-inner ${isActive ? "nav-icon-inner-active" : ""}`}>
                    <item.Icon active={isActive} />
                  </div>
                  {isActive && <span className="nav-active-dot" />}
                </div>
                <span className={`nav-label ${isActive ? "nav-label-active" : ""}`}>{item.label}</span>
              </div>
            </Link>
          );
        })}
        {/* ME button — auth-aware */}
        <div className="nav-item-holder" onClick={handleMe} style={{ cursor: "pointer" }}>
          <div className={`nav-icon-wrap ${meActive ? "nav-icon-active" : ""}`}>
            <div className={`nav-icon-inner ${meActive ? "nav-icon-inner-active" : ""}`}>
              <MeIcon active={meActive} />
            </div>
            {meActive && <span className="nav-active-dot" />}
          </div>
          <span className={`nav-label ${meActive ? "nav-label-active" : ""}`}>ME</span>
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
