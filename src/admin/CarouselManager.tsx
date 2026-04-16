import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Image, Lock } from "lucide-react";
import { api } from "./api";

const FEATURED_HOME_MAX = 6;

const inp = {
  width: "100%", boxSizing: "border-box" as const, background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px",
  color: "#fff", fontSize: 13, outline: "none"
};

const LEFT_PAGES = ["home", "drama", "movie", "variety", "sports", "documentary", "anime"];

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

function CarouselForm({ initial, onSave, onClose, contentList, pageOptions, defaultPage }: any) {
  const [form, setForm] = useState({ contentId: "", page: defaultPage || "home", sortOrder: 0, isActive: true, customTitle: "", customDescription: "", customImageUrl: "", ...initial });
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
        {pageOptions && pageOptions.length > 1 && (
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Page</label>
            <select style={inp} value={form.page} onChange={e => set("page", e.target.value)}>
              {pageOptions.map((p: string) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        )}
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
          {saving ? "Saving..." : (initial?.id ? "Update" : "Add Slide")}
        </button>
      </div>
    </div>
  );
}

function FeaturedForm({ initial, onSave, onClose, contentList }: any) {
  const [form, setForm] = useState({ contentId: "", page: "home", isActive: true, order: 0, ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.contentId) { alert("Please select content."); return; }
    setSaving(true);
    try {
      const data = { ...form };
      if (initial?.id) await api.featured.update(initial.id, data);
      else await api.featured.create(data);
      onSave();
    } catch (e) { alert(String(e)); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Select Content *</label>
          <select style={inp} value={form.contentId} onChange={e => set("contentId", e.target.value)}>
            <option value="">— Choose a movie or series —</option>
            {contentList.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>Position (order)</label>
          <input style={inp} type="number" min={0} value={form.order} onChange={e => set("order", Number(e.target.value))} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
          <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} id="fIsActive" />
          <label htmlFor="fIsActive" style={{ fontSize: 13, color: "#fff" }}>Active</label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={onClose} style={{ ...inp, width: "auto", cursor: "pointer" }}>Cancel</button>
        <button onClick={save} style={{ padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving..." : (initial?.id ? "Update Featured" : "Add to Featured")}
        </button>
      </div>
    </div>
  );
}

function CarouselTable({ items, onEdit, onDelete }: { items: any[]; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
        <Image size={32} style={{ margin: "0 auto 10px", display: "block", opacity: 0.3 }} />
        No slides yet. Add your first slide!
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {["Image", "Page", "Order", "Content Link", "Custom Title", "Status", "Actions"].map(h => (
            <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(c => (
          <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <td style={{ padding: "10px 14px" }}>
              {c.customImageUrl
                ? <img src={c.customImageUrl} alt="" style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }} />
                : <div style={{ width: 80, height: 45, borderRadius: 4, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={16} color="#444" /></div>}
            </td>
            <td style={{ padding: "10px 14px", color: "#818cf8", textTransform: "capitalize", fontWeight: 600 }}>{c.page}</td>
            <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{c.sortOrder}</td>
            <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{c.contentId ? `ID: ${c.contentId.slice(0, 8)}…` : "Custom"}</td>
            <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.7)" }}>{c.customTitle || "-"}</td>
            <td style={{ padding: "10px 14px" }}>
              <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: c.isActive ? "#10b98122" : "#ef444422", color: c.isActive ? "#34d399" : "#f87171" }}>{c.isActive ? "Active" : "Inactive"}</span>
            </td>
            <td style={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onEdit(c)} style={{ padding: "4px 8px", background: "#6366f122", border: "none", borderRadius: 6, color: "#818cf8", cursor: "pointer" }}><Edit size={12} /></button>
                <button onClick={() => onDelete(c.id)} style={{ padding: "4px 8px", background: "#ef444422", border: "none", borderRadius: 6, color: "#f87171", cursor: "pointer" }}><Trash2 size={12} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CarouselManager() {
  const [tab, setTab] = useState<"left" | "right" | "featured">("left");
  const [carousel, setCarousel] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "create" | any>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.carousel.list(), api.featured.list(), api.featured.contentList()])
      .then(([c, f, cl]) => {
        setCarousel(c.carousel || []);
        setFeatured(f.featured || []);
        setContentList(cl.content || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const leftSlides = carousel.filter((c: any) => c.page !== "carousel2");
  const rightSlides = carousel.filter((c: any) => c.page === "carousel2");
  const homeFeatured = featured.filter((f: any) => f.page === "home");
  const homeFeaturedFull = homeFeatured.length >= FEATURED_HOME_MAX;

  const delCarousel = async (id: string) => {
    if (!confirm("Remove this carousel slide?")) return;
    await api.carousel.delete(id);
    load();
  };

  const delFeatured = async (id: string) => {
    if (!confirm("Remove this featured item?")) return;
    await api.featured.delete(id);
    load();
  };

  const isCreating = modal === "create";
  const isEditing = modal && modal !== "create";

  const getModalTitle = () => {
    if (tab === "left") return isCreating ? "Add Main Hero Slide" : "Edit Main Hero Slide";
    if (tab === "right") return isCreating ? "Add Right Carousel Slide" : "Edit Right Carousel Slide";
    return isCreating ? "Add Featured Item" : "Edit Featured Item";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Carousel & Featured</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Manage homepage carousels and featured middle panel content
          </p>
        </div>
        {tab === "featured" && homeFeaturedFull ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#78350f22", border: "1px solid #f59e0b44", borderRadius: 8 }}>
            <Lock size={14} color="#f59e0b" />
            <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>All {FEATURED_HOME_MAX} slots filled — edit existing to change</span>
          </div>
        ) : (
          <button
            onClick={() => setModal("create")}
            style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> Add Item
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden", width: "fit-content" }}>
        {([
          { key: "left", label: "🎠 Main Hero (Left)" },
          { key: "right", label: "🎞 Right Carousel" },
          { key: "featured", label: "⭐ Featured (Middle)" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "8px 22px", background: tab === t.key ? "#6366f1" : "transparent", color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p> : (
        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          {tab === "left" && (
            <CarouselTable items={leftSlides} onEdit={item => setModal({ ...item, _tab: "left" })} onDelete={delCarousel} />
          )}
          {tab === "right" && (
            <CarouselTable items={rightSlides} onEdit={item => setModal({ ...item, _tab: "right" })} onDelete={delCarousel} />
          )}
          {tab === "featured" && (
            <>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Home middle panel slots:
                  <span style={{ marginLeft: 8, fontWeight: 700, color: homeFeaturedFull ? "#f59e0b" : "#34d399" }}>
                    {homeFeatured.length} / {FEATURED_HOME_MAX}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  Slots 1–2 appear as large cards · Slots 3–6 appear as small cards
                </span>
              </div>
              {homeFeatured.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                  No featured items set for the home middle panel yet.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["#", "Thumbnail", "Title", "Type", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {homeFeatured.map((f, idx) => {
                      const content = contentList.find((c: any) => c.id === f.contentId);
                      return (
                        <tr key={f.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "10px 14px", color: idx < 2 ? "#818cf8" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14 }}>
                            {idx + 1} {idx < 2 ? <span style={{ fontSize: 10, color: "#818cf8" }}>LARGE</span> : <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>SMALL</span>}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {content?.thumbnailUrl || content?.coverUrl
                              ? <img src={content.thumbnailUrl || content.coverUrl} alt="" style={{ width: 64, height: 40, objectFit: "cover", borderRadius: 4 }} />
                              : <div style={{ width: 64, height: 40, borderRadius: 4, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={14} color="#444" /></div>}
                          </td>
                          <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{content?.title || `Content #${(f.contentId || "").slice(0, 8)}`}</td>
                          <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{content?.type || "-"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: f.isActive ? "#10b98122" : "#ef444422", color: f.isActive ? "#34d399" : "#f87171" }}>{f.isActive ? "Active" : "Inactive"}</span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => setModal({ ...f, _tab: "featured" })} style={{ padding: "4px 8px", background: "#6366f122", border: "none", borderRadius: 6, color: "#818cf8", cursor: "pointer" }}><Edit size={12} /></button>
                              <button onClick={() => delFeatured(f.id)} style={{ padding: "4px 8px", background: "#ef444422", border: "none", borderRadius: 6, color: "#f87171", cursor: "pointer" }}><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}

      {modal && (
        <Modal title={getModalTitle()} onClose={() => setModal(null)}>
          {tab === "featured" || (isEditing && modal._tab === "featured") ? (
            <FeaturedForm
              initial={isEditing ? modal : { page: "home" }}
              contentList={contentList}
              onSave={() => { setModal(null); load(); }}
              onClose={() => setModal(null)}
            />
          ) : (
            <CarouselForm
              initial={isEditing ? modal : null}
              contentList={contentList}
              pageOptions={tab === "right" || (isEditing && modal._tab === "right") ? ["carousel2"] : LEFT_PAGES}
              defaultPage={tab === "right" || (isEditing && modal._tab === "right") ? "carousel2" : "home"}
              onSave={() => { setModal(null); load(); }}
              onClose={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
