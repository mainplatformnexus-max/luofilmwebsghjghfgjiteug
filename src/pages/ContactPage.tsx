export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#fff", padding: "30px 20px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Contact Us</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 36 }}>We're here to help. Reach out to us through any of the channels below.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
          {[
            { icon: "📧", title: "General Support", desc: "For account issues, billing, and general inquiries.", email: "support@luofilm.site" },
            { icon: "🛡️", title: "Privacy & Data", desc: "For privacy concerns or data removal requests.", email: "privacy@luofilm.site" },
            { icon: "©️", title: "Copyright / DMCA", desc: "For copyright infringement reports.", email: "dmca@luofilm.site" },
            { icon: "📢", title: "Content Reports", desc: "To report inappropriate or policy-violating content.", email: "content@luofilm.site" },
            { icon: "🤝", title: "Business & Partnerships", desc: "For licensing, partnerships, and business opportunities.", email: "business@luofilm.site" },
            { icon: "📰", title: "Press & Media", desc: "For press inquiries and media coverage.", email: "press@luofilm.site" },
          ].map(({ icon, title, desc, email }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "20px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 10 }}>{desc}</p>
              <a href={`mailto:${email}`} style={{ color: "#cc00cc", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>{email}</a>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "24px 22px" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Response Times</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
            Our support team typically responds within <strong style={{ color: "#fff" }}>24–48 hours</strong> for general inquiries. DMCA and legal matters are addressed within <strong style={{ color: "#fff" }}>3–5 business days</strong>. We appreciate your patience and will do our best to resolve all issues promptly.
          </p>
        </div>

        <div style={{ marginTop: 32, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Social Media</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>
            You can also reach us and follow our updates on social media. We are active on Facebook, Instagram, Twitter (X), YouTube, TikTok, and Telegram. Search for <strong style={{ color: "#fff" }}>@LUOFILM</strong> on your preferred platform.
          </p>
        </div>
      </div>
    </div>
  );
}
