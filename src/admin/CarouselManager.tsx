import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Image } from "lucide-react";
import { api } from "./api";

const inp = {
  width: "100%", boxSizing: "border-box" as const, background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px",
  color: "#fff", fontSize: 13, outline: "none"
};

const PAGES = ["home", "drama", "movie", "variety", "sports", "documentary", "anime"];

function Modal({ title, onClose, children }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function CarouselForm({ initial, onSave, onClose, contentList }: any) {
  const [form, setForm] = useState({ contentId: "", page: "home", sortOrder: 0, isActive: true, customTitle: "", customDescription: "", customImageUrl: "", ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const data = { ...form, contentId: form.contentId || null };
      if (initial?.id) await api.carousel.update(initial.id, data);
      else await api.carousel.create(data);
      onSave();
    } catch (e) { alert(String(e)); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Link to Content</label>
          <select style={inp} value={form.contentId} onChange={e => set("contentId", e.target.value)}>
            <option value="">— Custom / No Link —</option>
            {contentList.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Page</label>
          <select style={inp} value={form.page} onChange={e => set("page", e.target.value)}>
            {PAGES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Sort Order</label>
          <input style={inp} type="number" value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
          <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} id="isActive" />
          <label htmlFor="isActive" style={{ fontSize: 13, color: "#fff" }}>Active</label>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Custom Title (optional)</label>
          <input style={inp} value={form.customTitle} onChange={e => set("customTitle", e.target.value)} placeholder="Override title..." />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Custom Description</label>
          <textarea style={{ ...inp, minHeight: 60, resize: "vertical" }} value={form.customDescription} onChange={e => set("customDescription", e.target.value)} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Custom Image URL</label>
          <input style={inp} value={form.customImageUrl} onChange={e => set("customImageUrl", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={onClose} style={{ ...inp, width: "auto", cursor: "pointer" }}>Cancel</button>
        <button onClick={save} style={{ padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving..." : (initial?.id ? "Update" : "Add to Carousel")}
        </button>
      </div>
    </div>
  );
}

function FeaturedForm({ initial, onSave, onClose, contentList }: any) {
  const [form, setForm] = useState({ contentId: "", page: "home", isActive: true, ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const data = { ...form, contentId: form.contentId || null };
      if (initial?.id) await api.featured.update(initial.id, data);
      else await api.featured.create(data);
      onSave();
    } catch (e) { alert(String(e)); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Content</label>
          <select style={inp} value={form.contentId} onChange={e => set("contentId", e.target.value)}>
            <option value="">— Select Content —</option>
            {contentList.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Page</label>
          <select style={inp} value={form.page} onChange={e => set("page", e.target.value)}>
            {PAGES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} id="fIsActive" />
          <label htmlFor="fIsActive" style={{ fontSize: 13, color: "#fff" }}>Active</label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={onClose} style={{ ...inp, width: "auto", cursor: "pointer" }}>Cancel</button>
        <button onClick={save} style={{ padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving..." : (initial?.id ? "Update" : "Set Featured")}
        </button>
      </div>
    </div>
  );
}

export default function CarouselManager() {
  const [tab, setTab] = useState<"carousel" | "featured">("carousel");
  const [carousel, setCarousel] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "create" | any>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.carousel.list(), api.featured.list(), api.featured.contentList()])
      .then(([c, f, cl]) => { setCarousel(c.carousel || []); setFeatured(f.featured || []); setContentList(cl.content || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const delCarousel = async (id: number) => {
    if (!confirm("Remove this carousel item?")) return;
    await api.carousel.delete(id);
    load();
  };

  const delFeatured = async (id: number) => {
    if (!confirm("Remove this featured item?")) return;
    await api.featured.delete(id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Carousel & Featured</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Manage homepage carousel and page-specific featured content</p>
        </div>
        <button onClick={() => setModal("create")} style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} /> Add Item
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden", width: "fit-content" }}>
        {(["carousel", "featured"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 24px", background: tab === t ? "#6366f1" : "transparent", color: tab === t ? "#fff" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
            {t === "carousel" ? "🎠 Carousel Slides" : "⭐ Featured Content"}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p> : (
        tab === "carousel" ? (
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Image", "Page", "Order", "Content Link", "Custom Title", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carousel.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                    <Image size={32} style={{ margin: "0 auto 10px", display: "block", opacity: 0.3 }} />
                    No carousel items. Add your first slide!
                  </td></tr>
                ) : carousel.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      {c.customImageUrl
                        ? <img src={c.customImageUrl} alt="" style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }} />
                        : <div style={{ width: 80, height: 45, borderRadius: 4, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={16} color="#444" /></div>}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#818cf8", textTransform: "capitalize", fontWeight: 600 }}>{c.page}</td>
                    <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{c.sortOrder}</td>
                    <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{c.contentId ? `Content #${c.contentId}` : "Custom"}</td>
                    <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.7)" }}>{c.customTitle || "-"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: c.isActive ? "#10b98122" : "#ef444422", color: c.isActive ? "#34d399" : "#f87171" }}>{c.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setModal({ ...c, _type: "carousel" })} style={{ padding: "4px 8px", background: "#6366f122", border: "none", borderRadius: 6, color: "#818cf8", cursor: "pointer" }}><Edit size={12} /></button>
                        <button onClick={() => delCarousel(c.id)} style={{ padding: "4px 8px", background: "#ef444422", border: "none", borderRadius: 6, color: "#f87171", cursor: "pointer" }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Page", "Content ID", "Status", "Added", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featured.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No featured items set</td></tr>
                ) : featured.map(f => (
                  <tr key={f.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 14px", color: "#818cf8", textTransform: "capitalize", fontWeight: 600 }}>{f.page}</td>
                    <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>Content #{f.contentId}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: f.isActive ? "#10b98122" : "#ef444422", color: f.isActive ? "#34d399" : "#f87171" }}>{f.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.4)" }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setModal({ ...f, _type: "featured" })} style={{ padding: "4px 8px", background: "#6366f122", border: "none", borderRadius: 6, color: "#818cf8", cursor: "pointer" }}><Edit size={12} /></button>
                        <button onClick={() => delFeatured(f.id)} style={{ padding: "4px 8px", background: "#ef444422", border: "none", borderRadius: 6, color: "#f87171", cursor: "pointer" }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {modal && (
        <Modal
          title={modal === "create" ? (tab === "carousel" ? "Add Carousel Slide" : "Set Featured Content") : "Edit Item"}
          onClose={() => setModal(null)}
        >
          {(modal === "create" ? tab : modal._type) === "carousel"
            ? <CarouselForm initial={modal === "create" ? null : modal} contentList={contentList} onSave={() => { setModal(null); load(); }} onClose={() => setModal(null)} />
            : <FeaturedForm initial={modal === "create" ? null : modal} contentList={contentList} onSave={() => { setModal(null); load(); }} onClose={() => setModal(null)} />
          }
        </Modal>
      )}
    </div>
  );
}
