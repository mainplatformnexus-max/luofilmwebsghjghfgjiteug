import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fbApi } from "../lib/firebaseApi";
import { auth } from "../lib/firebase";

interface Show {
  id: string;
  title: string;
  type: string;
  episodeCount?: number;
  badge?: string;
  genre?: string;
  year?: number;
  rating?: number;
  description?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
}

interface CarouselItem {
  id: string;
  contentId?: string;
  page?: string;
  isActive?: boolean;
  sortOrder?: number;
  customTitle?: string;
  customDescription?: string;
  customImageUrl?: string;
}

function toShow(d: any): Show {
  return {
    id: d.id,
    title: d.title || "",
    type: d.type || "series",
    episodeCount: d.episodeCount || 0,
    badge: d.badge || "none",
    genre: d.genre || "",
    year: d.year || new Date().getFullYear(),
    rating: d.rating || 0,
    description: d.description || "",
    coverUrl: d.coverUrl || d.thumbnailUrl || "",
    thumbnailUrl: d.thumbnailUrl || d.coverUrl || "",
  };
}

function carouselToShow(item: CarouselItem, contentMap: Map<string, Show>): Show | null {
  if (item.contentId) {
    const content = contentMap.get(item.contentId);
    if (content) {
      return {
        ...content,
        title: item.customTitle || content.title,
        description: item.customDescription || content.description,
        thumbnailUrl: item.customImageUrl || content.thumbnailUrl,
        coverUrl: item.customImageUrl || content.coverUrl,
      };
    }
  }
  if (item.customTitle && item.customImageUrl) {
    return {
      id: item.id,
      title: item.customTitle,
      type: "movie",
      description: item.customDescription || "",
      thumbnailUrl: item.customImageUrl,
      coverUrl: item.customImageUrl,
      badge: "none",
      genre: "",
    };
  }
  return null;
}

export default function HomePage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [bannerShows, setBannerShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cu = auth.currentUser;
    fbApi.activities.log({
      userId: cu?.uid || null,
      userName: cu?.displayName || null,
      userEmail: cu?.email || null,
      actionType: "page_view",
      page: "/",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fbApi.publicContent.listAll(),
      fbApi.publicContent.getCarousel(),
    ])
      .then(([contentDocs, carouselItems]) => {
        const allShows = contentDocs.map(toShow);
        setShows(allShows);

        const contentMap = new Map<string, Show>(allShows.map(s => [s.id, s]));
        const homeCarousel = (carouselItems as CarouselItem[])
          .filter(item => (!item.page || item.page === "home") && item.isActive !== false);

        const banners: Show[] = [];
        for (const item of homeCarousel) {
          const s = carouselToShow(item, contentMap);
          if (s) banners.push(s);
        }

        if (banners.length > 0) {
          setBannerShows(banners);
        } else if (allShows.length > 0) {
          setBannerShows(allShows.slice(0, 6));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setActiveSlide(index);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % Math.max(bannerShows.length, 1));
  }, [bannerShows.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + Math.max(bannerShows.length, 1)) % Math.max(bannerShows.length, 1));
  }, [bannerShows.length]);

  useEffect(() => {
    if (bannerShows.length === 0) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [nextSlide, bannerShows.length]);

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 5000);
  };

  const handleGoToSlide = (i: number) => { goToSlide(i); restartTimer(); };
  const handlePrev = () => { prevSlide(); restartTimer(); };
  const handleNext = () => { nextSlide(); restartTimer(); };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  const currentIdx = bannerShows.length > 0 ? Math.min(activeSlide, bannerShows.length - 1) : 0;
  const currentShow = bannerShows[currentIdx];
  const sideShows = bannerShows.filter((_, i) => i !== currentIdx).slice(0, 2);
  const miniShows = shows.slice(bannerShows.length, bannerShows.length + 4);

  const movies = shows.filter(s => s.type === "movie");
  const series = shows.filter(s => s.type === "series");
  const byGenre = (g: string) => shows.filter(s => (s.genre || "").toLowerCase().includes(g));

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#fff" }}>
      <div className="mobile-header-spacer" style={{ height: 54 }} />

      {bannerShows.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
          No content published yet. Add content from the admin panel.
        </div>
      ) : (
        <div className="carousel-wrapper" style={{ display: "flex", gap: 8, padding: "10px 12px", boxSizing: "border-box" }}>
          <div className="carousel-main-wrap" style={{ flex: "0 0 auto", position: "relative", width: "100%" }}>
            <div className="carousel-mobile-full" style={{ width: "calc(56vw - 20px)", minWidth: 480, maxWidth: 760, position: "relative", overflow: "hidden", borderRadius: 6, background: "#1a1a1a" }}>
              <div style={{ paddingTop: "56.25%" }} />
              <img
                key={currentShow.id}
                src={currentShow.thumbnailUrl}
                alt={currentShow.title}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                  opacity: isTransitioning ? 0.7 : 1, transition: "opacity 0.4s ease",
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)" }} />

              <div className="carousel-overlay" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 20px 20px" }}>
                {currentShow.badge && currentShow.badge !== "none" && (
                  <span style={{
                    display: "inline-block", padding: "1px 8px", borderRadius: 2, fontSize: 11, fontWeight: 700, marginBottom: 8,
                    background: currentShow.badge === "VIP" ? "linear-gradient(90deg,#ffc552,#ffdd9a)" : currentShow.badge === "Express" ? "linear-gradient(90deg,#00a3f5,#00c9fd)" : "linear-gradient(90deg,#8819ff,#ad61ff)",
                    color: currentShow.badge === "VIP" ? "#4e2d03" : "#fff",
                  }}>{currentShow.badge}</span>
                )}
                <h2 className="carousel-title" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 6, textShadow: "0 1px 4px rgba(0,0,0,0.8)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {currentShow.title}
                </h2>
                <p className="carousel-desc" style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 12, maxWidth: 380 }}>
                  {currentShow.description}
                </p>
                <div className="carousel-actions" style={{ display: "flex", gap: 8 }}>
                  <Link href={`/play/${currentShow.id}`}>
                    <button className="carousel-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 20, background: "#00a9f5", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
                      ▶ PLAY NOW
                    </button>
                  </Link>
                  <Link href={`/play/${currentShow.id}`}>
                    <button className="carousel-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 20, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                      DETAILS
                    </button>
                  </Link>
                </div>
              </div>

              <button onClick={handlePrev} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNext} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronRight size={16} />
              </button>

              <div style={{ position: "absolute", bottom: 8, right: 12, display: "flex", gap: 4 }}>
                {bannerShows.map((_, i) => (
                  <button key={i} onClick={() => handleGoToSlide(i)} style={{ height: 3, width: i === currentIdx ? 20 : 6, borderRadius: 2, background: i === currentIdx ? "#fff" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
                ))}
              </div>
            </div>
          </div>

          <div className="carousel-side-panel" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
              {sideShows.map((show) => <SideShowCard key={show.id} show={show} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {miniShows.map((show) => <MiniShowCard key={show.id} show={show} />)}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "8px 12px 40px" }}>
        {shows.length > 0 && (
          <ContentRow title="ALL CONTENT" subtitle="RECENTLY ADDED" shows={shows.slice(0, 10)} categoryHref="/drama" />
        )}
        {series.length > 0 && (
          <ContentRow title="SERIES" shows={series.slice(0, 10)} categoryHref="/drama" />
        )}
        {movies.length > 0 && (
          <ContentRow title="MOVIES" shows={movies.slice(0, 10)} categoryHref="/movie" />
        )}
        {byGenre("romance").length > 0 && (
          <ContentRow title="ROMANCE" shows={byGenre("romance").slice(0, 10)} categoryHref="/drama" />
        )}
        {byGenre("fantasy").length > 0 && (
          <ContentRow title="FANTASY & WUXIA" shows={byGenre("fantasy").slice(0, 10)} categoryHref="/anime" />
        )}
        {byGenre("historical").length > 0 && (
          <ContentRow title="HISTORICAL" shows={byGenre("historical").slice(0, 10)} categoryHref="/documentary" />
        )}
        {byGenre("action").length > 0 && (
          <ContentRow title="ACTION" shows={byGenre("action").slice(0, 10)} categoryHref="/sports" />
        )}
        {byGenre("drama").length > 0 && (
          <ContentRow title="DRAMA" shows={byGenre("drama").slice(0, 10)} categoryHref="/drama" />
        )}
        {shows.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
            No content available yet. The admin can add content from the admin panel.
          </div>
        )}
      </div>
    </div>
  );
}

function SideShowCard({ show }: { show: Show }) {
  return (
    <Link href={`/play/${show.id}`}>
      <div style={{ flex: 1, position: "relative", borderRadius: 6, overflow: "hidden", background: "#1a1a1a", cursor: "pointer" }}>
        <div style={{ paddingTop: "56.25%" }} />
        <img src={show.thumbnailUrl} alt={show.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }} />
        {show.badge && show.badge !== "none" && (
          <span style={{ position: "absolute", top: 0, right: 0, padding: "2px 7px", borderRadius: "0 6px 0 6px", fontSize: 11, fontWeight: 700, background: show.badge === "VIP" ? "linear-gradient(90deg,#ffc552,#ffdd9a)" : show.badge === "Express" ? "linear-gradient(90deg,#00a3f5,#00c9fd)" : "linear-gradient(90deg,#8819ff,#ad61ff)", color: show.badge === "VIP" ? "#4e2d03" : "#fff" }}>
            {show.badge}
          </span>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>{show.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{show.type === "series" ? `${show.episodeCount} EPS` : "Movie"}</div>
        </div>
      </div>
    </Link>
  );
}

function MiniShowCard({ show }: { show: Show }) {
  return (
    <Link href={`/play/${show.id}`}>
      <div
        style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 6px", borderRadius: 4, cursor: "pointer", transition: "background 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <div style={{ flexShrink: 0, width: 64, height: 42, borderRadius: 3, overflow: "hidden", background: "#1a1a1a" }}>
          <img src={show.thumbnailUrl} alt={show.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "rgba(255,255,255,0.9)" }}>{show.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{show.genre} · {show.type === "series" ? `${show.episodeCount} EPS` : "Movie"}</div>
        </div>
        {show.badge && show.badge !== "none" && (
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 2, background: show.badge === "VIP" ? "linear-gradient(90deg,#ffc552,#ffdd9a)" : "linear-gradient(90deg,#00a3f5,#00c9fd)", color: show.badge === "VIP" ? "#4e2d03" : "#fff" }}>
            {show.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

function ContentRow({ title, subtitle, shows, categoryHref }: { title: string; subtitle?: string; shows: Show[]; categoryHref?: string }) {
  if (!shows.length) return null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  return (
    <section className="content-row-section" style={{ marginBottom: 24 }}>
      <div className="content-row-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 3, height: 14, borderRadius: 2, background: "#00a9f5" }} />
          <span className="content-row-title" style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{title}</span>
          {subtitle && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 2 }}>{subtitle}</span>}
        </div>
        <div className="content-row-nav" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button onClick={() => scroll("left")} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={12} />
          </button>
          <button onClick={() => scroll("right")} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight size={12} />
          </button>
          {categoryHref ? (
            <Link href={categoryHref}>
              <span style={{ fontSize: 11, color: "#00a9f5", background: "transparent", border: "none", cursor: "pointer", marginLeft: 2, fontWeight: 600 }}>ALL &gt;</span>
            </Link>
          ) : (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: 2 }}>ALL &gt;</span>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="content-row-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 4 }}>
        {shows.map((show, idx) => <ContentCard key={show.id} show={show} rank={idx + 1} />)}
      </div>
    </section>
  );
}

function ContentCard({ show, rank }: { show: Show; rank: number }) {
  const [hovered, setHovered] = useState(false);
  function handleClick() {
    const cu = auth.currentUser;
    fbApi.activities.log({
      userId: cu?.uid || null,
      userName: cu?.displayName || null,
      userEmail: cu?.email || null,
      actionType: "content_click",
      contentId: show.id,
      contentTitle: show.title,
      page: "/",
    }).catch(() => {});
  }
  return (
    <Link href={`/play/${show.id}`}>
      <div className="content-card" style={{ flexShrink: 0, width: 128, cursor: "pointer" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={handleClick}>
        <div style={{ position: "relative", paddingTop: "133.33%", borderRadius: 5, overflow: "hidden", background: "#1a1a1a" }}>
          <img src={show.thumbnailUrl} alt={show.title} loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.35s ease" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 44, backgroundImage: "linear-gradient(180deg, transparent, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.55))" }} />
          {show.badge && show.badge !== "none" && (
            <span style={{
              position: "absolute", top: 0, right: 0, height: 16, lineHeight: "16px", padding: "0 5px",
              borderRadius: "0 5px 0 5px", fontSize: 10, fontWeight: 700,
              background: show.badge === "VIP" ? "linear-gradient(45deg,#ffc552,#ffdd9a)" : show.badge === "Express" ? "linear-gradient(45deg,#00a3f5,#00c9fd)" : "linear-gradient(45deg,#8819ff,#ad61ff)",
              color: show.badge === "VIP" ? "#4e2d03" : "#fff",
            }}>{show.badge}</span>
          )}
          {rank <= 3 && (
            <span style={{ position: "absolute", bottom: 5, left: 5, fontSize: 20, fontWeight: 900, color: rank === 1 ? "#ffc552" : rank === 2 ? "#c0c0c0" : "#cd7f32", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{rank}</span>
          )}
        </div>
        <div style={{ paddingTop: 5, paddingBottom: 3 }}>
          <div className="content-card-title" style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: hovered ? "#00a9f5" : "rgba(255,255,255,0.9)", transition: "color 0.2s" }}>
            {show.title}
          </div>
          <div className="content-card-sub" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
            {show.type === "series" ? `${show.episodeCount} EPS` : "Movie"}
          </div>
        </div>
      </div>
    </Link>
  );
}
