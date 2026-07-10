/**
 * Vite plugin that serves /sitemap-dynamic.xml
 * Fetches all published content from Firestore REST API and generates
 * a rich sitemap with image entries for every movie/series poster.
 */
import type { Plugin } from "vite";

const BASE_URL = "https://luofilm.site";
const PROJECT_ID = "luo-film-site";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function esc(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function str(field: any): string {
  return field?.stringValue || "";
}

function toDate(field: any): string {
  if (!field) return new Date().toISOString().split("T")[0];
  const t = field.timestampValue || field.stringValue || "";
  return t ? t.split("T")[0] : new Date().toISOString().split("T")[0];
}

async function generateSitemap(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: "/",           freq: "daily",   pri: "1.0", img: "/logo.png", imgTitle: "LUOFILM.SITE — Luo Translated Movies Streaming by SENIOR PAUL" },
    { loc: "/drama",      freq: "daily",   pri: "0.9" },
    { loc: "/movie",      freq: "daily",   pri: "0.9" },
    { loc: "/anime",      freq: "daily",   pri: "0.8" },
    { loc: "/variety",    freq: "daily",   pri: "0.8" },
    { loc: "/sports",     freq: "weekly",  pri: "0.7" },
    { loc: "/documentary",freq: "weekly",  pri: "0.7" },
    { loc: "/search",     freq: "daily",   pri: "0.8" },
    { loc: "/distros",    freq: "daily",   pri: "0.8" },
    { loc: "/terms",      freq: "monthly", pri: "0.3" },
    { loc: "/privacy",    freq: "monthly", pri: "0.3" },
    { loc: "/cookies",    freq: "monthly", pri: "0.3" },
    { loc: "/dmca",       freq: "monthly", pri: "0.4" },
    { loc: "/contact",    freq: "monthly", pri: "0.5" },
    { loc: "/guidelines", freq: "monthly", pri: "0.3" },
  ].map(u => {
    const imgTag = u.img
      ? `\n    <image:image>\n      <image:loc>${BASE_URL}${u.img}</image:loc>\n      <image:title>${esc(u.imgTitle || "")}</image:title>\n    </image:image>`
      : "";
    return `  <url>\n    <loc>${BASE_URL}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>${imgTag}\n  </url>`;
  }).join("\n");

  let contentUrls = "";
  try {
    const url = `${FIRESTORE_URL}/content?pageSize=500`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data: any = await res.json();
      const docs: any[] = data.documents || [];
      for (const docItem of docs) {
        const f = docItem.fields || {};
        if (str(f.status) !== "published") continue;
        const id = docItem.name.split("/").pop();
        const title = str(f.title);
        const type = str(f.type) === "movie" ? "Movie" : "Series";
        const genre = str(f.genre);
        const year = f.year?.integerValue || f.year?.doubleValue || "";
        const thumbnail = str(f.thumbnailUrl) || str(f.coverUrl);
        const coverUrl = str(f.coverUrl) || str(f.thumbnailUrl);
        const lastmod = toDate(f.updatedAt) || toDate(f.createdAt) || today;
        const desc = str(f.description) || `Watch ${title} — Luo translated ${type} by SENIOR PAUL on LUOFILM.SITE`;

        const imageEntries = [thumbnail, coverUrl]
          .filter((u, i, a) => u && a.indexOf(u) === i) // dedupe
          .map(imgUrl => `\n    <image:image>\n      <image:loc>${esc(imgUrl)}</image:loc>\n      <image:title>${esc(title)} — Luo Translated ${type}${year ? ` (${year})` : ""} | SENIOR PAUL | LUOFILM.SITE</image:title>\n      <image:caption>${esc(desc.slice(0, 200))}</image:caption>\n      <image:geo_location>Uganda, East Africa</image:geo_location>\n    </image:image>`)
          .join("");

        contentUrls += `\n  <url>\n    <loc>${BASE_URL}/play/${id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>${imageEntries}\n  </url>`;
      }
    }
  } catch (err) {
    console.error("[sitemap-plugin] Failed to fetch Firestore content:", err);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticUrls}
${contentUrls}
</urlset>`;
}

let cachedSitemap: string | null = null;
let cacheTs = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function sitemapHandler(_req: any, res: any) {
  try {
    const now = Date.now();
    if (!cachedSitemap || now - cacheTs > CACHE_TTL) {
      cachedSitemap = await generateSitemap();
      cacheTs = now;
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.end(cachedSitemap);
  } catch (err) {
    res.statusCode = 500;
    res.end("<!-- sitemap generation error -->");
  }
}

export function dynamicSitemapPlugin(): Plugin {
  return {
    name: "dynamic-sitemap",
    configureServer(server) {
      server.middlewares.use("/sitemap-dynamic.xml", sitemapHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/sitemap-dynamic.xml", sitemapHandler);
    },
  };
}
