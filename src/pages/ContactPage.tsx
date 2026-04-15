export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#fff", padding: "30px 20px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Contact Us</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 36 }}>We're here to help. Reach out through any of the channels below.</p>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "22px 20px", marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>About LUOFILM.SITE</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8 }}>
            LUOFILM.SITE is owned by <strong style={{ color: "#fff" }}>NEXUS PLATFORM</strong> under the management of <strong style={{ color: "#fff" }}>GILBERT PAUL</strong>, licensed under <strong style={{ color: "#fff" }}>AT DEVELOPERS SMC LIMITED</strong>. We are a professionally licensed and verified streaming platform by DMCA, operating worldwide — bringing you Luo translated movies and dramas translated by <strong style={{ color: "#fff" }}>VJ Paul UG</strong>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
          <div style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 10, padding: "20px 18px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>WhatsApp</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 12 }}>Chat with us directly on WhatsApp for fast support.</p>
            <a
              href="https://wa.me/256760734679"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#25d166", fontSize: 14, textDecoration: "none", fontWeight: 700 }}
            >
              +256 760 734 679
            </a>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "20px 18px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Email</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 12 }}>Send us an email for all inquiries and support requests.</p>
            <a
              href="mailto:mainplatform.nexus@gmail.com"
              style={{ color: "#cc00cc", fontSize: 13, textDecoration: "none", fontWeight: 600 }}
            >
              mainplatform.nexus@gmail.com
            </a>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "20px 18px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🛡️</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>DMCA / Copyright</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 12 }}>For copyright infringement reports and DMCA notices.</p>
            <a
              href="mailto:mainplatform.nexus@gmail.com"
              style={{ color: "#cc00cc", fontSize: 13, textDecoration: "none", fontWeight: 600 }}
            >
              mainplatform.nexus@gmail.com
            </a>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px 22px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Response Times</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Our support team typically responds within <strong style={{ color: "#fff" }}>24–48 hours</strong> for general inquiries. For urgent issues, WhatsApp is the fastest way to reach us. DMCA and legal matters are addressed within <strong style={{ color: "#fff" }}>3–5 business days</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
