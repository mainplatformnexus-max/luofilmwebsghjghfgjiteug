import { useState, useEffect } from "react";
import { Save, Shield, Globe, Database, Bell, Loader, ImageIcon, CreditCard, Trash2, Plus } from "lucide-react";
import { api } from "./api";
import { auth } from "../lib/firebase";
import { clearPaymentBaseCache } from "../lib/paymentApi";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const TIMEZONES = [
  "Africa/Kampala","Africa/Nairobi","Africa/Lagos","Africa/Accra",
  "Africa/Dar_es_Salaam","Africa/Kigali","UTC","Europe/London","America/New_York","Asia/Shanghai",
];

// Must be declared BEFORE DEFAULT_SETTINGS to avoid TDZ
const DEFAULT_VIP_PLANS = [
  { id: "week1",   label: "1 Week Pass",   price: 10000, durationValue: 7, durationUnit: "days",   tag: "TRY IT",   tagColor: "#888",    active: true },
  { id: "month1",  label: "1 Month Pass",  price: 30000, durationValue: 1, durationUnit: "months", tag: "POPULAR",  tagColor: "#f5a623", active: true },
  { id: "months3", label: "3 Months Pass", price: 75000, durationValue: 3, durationUnit: "months", tag: "BEST DEAL",tagColor: "#059669", active: true },
];

const DEFAULT_SETTINGS = {
  siteName: "LUO FILM.SITE",
  siteDescription: "Premium streaming platform for Asian content",
  contactEmail: "admin@luofilm.site",
  supportPhone: "+256 700 000000",
  timezone: "Africa/Kampala",
  maintenanceMode: false,
  userRegistration: true,
  emailVerification: false,
  freeTrialDays: 7,
  plan1WeekPrice: 10000,
  plan1MonthPrice: 30000,
  plan3MonthsPrice: 75000,
  planDistrosPrice: 50000,
  vipPlans: DEFAULT_VIP_PLANS as any[],
  maxDevices: 3,
  watermarkEnabled: true,
  analyticsEnabled: true,
  twoFactor: false,
  floatBannerUrl: "",
  floatBannerLink: "https://pub-4810ad32eae44d3db8b886164bf3650f.r2.dev/luofilm.apk",
  paymentBackendUrl: "https://function-bun-production-37b5.up.railway.app",
};

const inp: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px",
  color: "#fff", fontSize: 13, outline: "none",
};

function Section({ title, icon: Icon, children }: any) {
  return (
    <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#6366f122", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color="#818cf8" />
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 600 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: any) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", userSelect: "none" as const }}>
      <div onClick={() => onChange(!checked)} style={{ marginTop: 2, width: 38, height: 22, borderRadius: 11, background: checked ? "#6366f1" : "rgba(255,255,255,0.12)", position: "relative", flexShrink: 0, cursor: "pointer", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 3, left: checked ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.4 }}>{hint}</div>}
      </div>
    </label>
  );
}

const DISTROS_PLAN = { key: "planDistrosPrice", label: "Distros Pass — 1 Month", tag: "DISTROS", tagColor: "#f59e0b", days: 30 };

const UNIT_OPTIONS = [
  { value: "hours", label: "Hour(s)" },
  { value: "days", label: "Day(s)" },
  { value: "weeks", label: "Week(s)" },
  { value: "months", label: "Month(s)" },
  { value: "years", label: "Year(s)" },
];

const TAG_PRESETS = [
  { label: "TRY IT",   color: "#888" },
  { label: "POPULAR",  color: "#f5a623" },
  { label: "BEST DEAL",color: "#059669" },
  { label: "NEW",      color: "#3b82f6" },
  { label: "VIP",      color: "#8b5cf6" },
  { label: "HOT",      color: "#ef4444" },
  { label: "PROMO",    color: "#14b8a6" },
];

function newPlanId() { return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`; }

function PlanEditor({ plan, onChange, onDelete }: { plan: any; onChange: (p: any) => void; onDelete: () => void }) {
  const upd = (k: string, v: any) => onChange({ ...plan, [k]: v });
  return (
    <div style={{ border: `1px solid ${plan.active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`, borderRadius: 10, padding: 14, background: plan.active ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.2)", position: "relative", opacity: plan.active ? 1 : 0.55, transition: "opacity 0.2s" }}>
      <div style={{ position: "absolute", top: -1, left: -1, background: plan.tagColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: "9px 0 9px 0", letterSpacing: "0.05em" }}>{plan.tag || "PLAN"}</div>

      {/* Row 1: label, price, duration, delete */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 160px auto auto", gap: 10, marginTop: 14, alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4, fontWeight: 600 }}>Plan Label</label>
          <input style={inp} value={plan.label || ""} onChange={e => upd("label", e.target.value)} placeholder="e.g. 1 Week Pass" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4, fontWeight: 600 }}>Price (UGX)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>UGX</span>
            <input style={{ ...inp, paddingLeft: 38, color: "#fbbf24", fontWeight: 700, fontSize: 14 }} type="number" step="100" min="0" value={plan.price || 0} onChange={e => upd("price", Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4, fontWeight: 600 }}>Duration</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input style={{ ...inp, width: 56, textAlign: "center" as const }} type="number" min="1" value={plan.durationValue || 1} onChange={e => upd("durationValue", Number(e.target.value))} />
            <select style={{ ...inp, width: 110 }} value={plan.durationUnit || "days"} onChange={e => upd("durationUnit", e.target.value)}>
              {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
        <button onClick={onDelete} title="Delete plan" style={{ padding: "7px 9px", background: "#ef444420", border: "none", borderRadius: 6, color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", alignSelf: "end", marginBottom: 1 }}><Trash2 size={13} /></button>
      </div>

      {/* Row 2: tag text, tag color, active */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginTop: 10, alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4, fontWeight: 600 }}>Tag Text</label>
          <input style={inp} value={plan.tag || ""} onChange={e => upd("tag", e.target.value)} placeholder="e.g. POPULAR" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4, fontWeight: 600 }}>Tag Color</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, alignItems: "center" }}>
            {TAG_PRESETS.map(t => (
              <button key={t.color} onClick={() => { upd("tagColor", t.color); upd("tag", t.label); }}
                title={t.label}
                style={{ width: 20, height: 20, borderRadius: 4, background: t.color, border: plan.tagColor === t.color ? "2.5px solid #fff" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer", flexShrink: 0 }} />
            ))}
            <input type="color" value={plan.tagColor || "#888"} onChange={e => upd("tagColor", e.target.value)}
              style={{ width: 20, height: 20, padding: 0, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, cursor: "pointer", background: "none" }} title="Custom color" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 2 }}>
          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>ACTIVE</label>
          <div onClick={() => upd("active", !plan.active)}
            style={{ width: 34, height: 20, borderRadius: 10, background: plan.active ? "#6366f1" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: plan.active ? 16 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    api.settings.get().then((data: any) => {
      if (data) setSettings(s => ({ ...s, ...data }));
    }).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: any) => setSettings(s => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await api.settings.save({ ...settings, currency: "UGX" });
      clearPaymentBaseCache();
      setStatus("saved");
      setStatusMsg("Settings saved successfully!");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e: any) {
      setStatus("error");
      setStatusMsg("Failed to save: " + (e.message || "Unknown error"));
      setTimeout(() => setStatus("idle"), 4000);
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!pwForm.newPw || pwForm.newPw !== pwForm.confirm) {
      setPwStatus("error"); setPwMsg("Passwords do not match."); return;
    }
    if (pwForm.newPw.length < 6) {
      setPwStatus("error"); setPwMsg("Password must be at least 6 characters."); return;
    }
    const user = auth.currentUser;
    if (!user?.email) {
      setPwStatus("error"); setPwMsg("No authenticated admin user found."); return;
    }
    setPwStatus("saving");
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, pwForm.current));
      await updatePassword(user, pwForm.newPw);
      setPwStatus("saved"); setPwMsg("Password updated successfully!");
      setPwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch (e: any) {
      setPwStatus("error");
      setPwMsg(
        e.code === "auth/wrong-password" ? "Current password is incorrect." :
        e.code === "auth/too-many-requests" ? "Too many attempts. Try again later." :
        "Failed: " + (e.message || "Unknown error")
      );
      setTimeout(() => setPwStatus("idle"), 4000);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
      <Loader size={20} color="#818cf8" />
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading settings...</span>
    </div>
  );

  return (
    <div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Configure platform settings and preferences</p>
        </div>
        <button
          onClick={save} disabled={saving}
          style={{ padding: "9px 22px", background: status === "saved" ? "#10b981" : status === "error" ? "#ef4444" : "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1, transition: "background 0.3s" }}
        >
          {saving ? <Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
          {saving ? "Saving..." : status === "saved" ? "Saved!" : status === "error" ? "Error!" : "Save Settings"}
        </button>
      </div>

      {statusMsg && status !== "idle" && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 18, background: status === "saved" ? "#10b98122" : "#ef444422", border: `1px solid ${status === "saved" ? "#10b981" : "#ef4444"}44`, color: status === "saved" ? "#10b981" : "#f87171", fontSize: 13 }}>
          {statusMsg}
        </div>
      )}

      <Section title="General" icon={Globe}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Site Name"><input style={inp} value={settings.siteName} onChange={e => set("siteName", e.target.value)} /></Field>
          <Field label="Contact Email"><input style={inp} type="email" value={settings.contactEmail} onChange={e => set("contactEmail", e.target.value)} /></Field>
          <Field label="Support Phone"><input style={inp} value={settings.supportPhone} onChange={e => set("supportPhone", e.target.value)} placeholder="+256 700 000000" /></Field>
          <Field label="Currency">
            <div style={{ ...inp, cursor: "not-allowed", color: "#fbbf24", fontWeight: 600, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
              <span>🇺🇬</span> UGX — Ugandan Shilling
            </div>
          </Field>
          <Field label="Timezone">
            <select style={inp} value={settings.timezone} onChange={e => set("timezone", e.target.value)}>
              {TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>
          <Field label="Site Description"><input style={inp} value={settings.siteDescription} onChange={e => set("siteDescription", e.target.value)} /></Field>
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 12, flexWrap: "wrap" as const }}>
          <Toggle checked={settings.maintenanceMode} onChange={(v: boolean) => set("maintenanceMode", v)} label="Maintenance Mode" hint="Block all users from accessing the site" />
          <Toggle checked={settings.userRegistration} onChange={(v: boolean) => set("userRegistration", v)} label="Allow Registration" hint="Allow new users to sign up" />
          <Toggle checked={settings.emailVerification} onChange={(v: boolean) => set("emailVerification", v)} label="Email Verification" hint="Require email verification on signup" />
        </div>
      </Section>

      <Section title="VIP Subscription Plans" icon={Database}>
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(245,166,35,0.08)", borderRadius: 8, border: "1px solid rgba(245,166,35,0.25)" }}>
          <span style={{ fontSize: 12, color: "#fbbf24" }}>
            🇺🇬 All plans priced in <strong>UGX</strong> — add, edit, or remove plans anytime. Duration can be hours, days, weeks, months, or years. Changes update the VIP modal in real time.
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {((settings as any).vipPlans || DEFAULT_VIP_PLANS).map((plan: any, idx: number) => (
            <PlanEditor
              key={plan.id || idx}
              plan={plan}
              onChange={(updated: any) => {
                const plans = [...((settings as any).vipPlans || DEFAULT_VIP_PLANS)];
                plans[idx] = updated;
                set("vipPlans", plans);
              }}
              onDelete={() => {
                const plans = ((settings as any).vipPlans || DEFAULT_VIP_PLANS).filter((_: any, i: number) => i !== idx);
                set("vipPlans", plans);
              }}
            />
          ))}
        </div>
        <button
          onClick={() => {
            const plans = [...((settings as any).vipPlans || DEFAULT_VIP_PLANS)];
            plans.push({ id: newPlanId(), label: "New Plan", price: 0, durationValue: 1, durationUnit: "months", tag: "NEW", tagColor: "#3b82f6", active: true });
            set("vipPlans", plans);
          }}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "rgba(99,102,241,0.15)", border: "1px dashed rgba(99,102,241,0.4)", borderRadius: 8, color: "#818cf8", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 20 }}
        >
          <Plus size={14} /> Add New Plan
        </button>
        <div style={{ marginTop: 4, marginBottom: 18, padding: "12px 14px", background: "rgba(245,158,11,0.06)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fbbf24", fontWeight: 800 }}>D</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>{DISTROS_PLAN.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  Separate distributor membership — gives early access to new uploads in the Distros area
                </div>
              </div>
            </div>
            <div style={{ position: "relative", width: 200 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600 }}>UGX</span>
              <input
                style={{ ...inp, paddingLeft: 42, fontWeight: 700, fontSize: 15, color: "#fbbf24" }}
                type="number"
                step="100"
                min="0"
                value={(settings as any)[DISTROS_PLAN.key] ?? 50000}
                onChange={e => set(DISTROS_PLAN.key, Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <Field label="Free Trial (Days)">
          <input style={{ ...inp, width: 120 }} type="number" value={settings.freeTrialDays} onChange={e => set("freeTrialDays", Number(e.target.value))} />
        </Field>
        <Field label="Max Devices per Account" hint="How many devices can stream simultaneously on one subscription">
          <input style={{ ...inp, width: 120 }} type="number" value={settings.maxDevices} onChange={e => set("maxDevices", Number(e.target.value))} />
        </Field>
      </Section>

      <Section title="Content Settings" icon={Bell}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" as const }}>
          <Toggle checked={settings.watermarkEnabled} onChange={(v: boolean) => set("watermarkEnabled", v)} label="Enable Watermark" hint="Show platform watermark on videos" />
          <Toggle checked={settings.analyticsEnabled} onChange={(v: boolean) => set("analyticsEnabled", v)} label="Track Analytics" hint="Track and record user activity" />
        </div>
      </Section>

      <Section title="Float Banner (Welcome Modal)" icon={ImageIcon}>
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.25)" }}>
          <span style={{ fontSize: 12, color: "#818cf8" }}>
            The banner image shown automatically when visitors land on the site. Paste an image URL below — leave blank to use the default local image.
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <Field label="Banner Image URL" hint="Direct image URL (JPG, PNG, AVIF, WebP)">
            <input
              style={inp}
              value={(settings as any).floatBannerUrl || ""}
              onChange={e => set("floatBannerUrl", e.target.value)}
              placeholder="https://example.com/my-banner.png"
            />
          </Field>
          <Field label="Click Destination URL" hint="Where to send users when they click the banner">
            <input
              style={inp}
              value={(settings as any).floatBannerLink || ""}
              onChange={e => set("floatBannerLink", e.target.value)}
              placeholder="https://pub-xxx.r2.dev/luofilm.apk"
            />
          </Field>
        </div>
        {(settings as any).floatBannerUrl && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Preview:</div>
            <img
              src={(settings as any).floatBannerUrl}
              alt="Banner preview"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              style={{ maxWidth: 320, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", display: "block" }}
            />
          </div>
        )}
      </Section>

      <Section title="Payment Backend" icon={CreditCard}>
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(16,185,129,0.08)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.25)" }}>
          <span style={{ fontSize: 12, color: "#10b981" }}>
            Set the base URL of your payment backend server. All payment requests (deposits, withdrawals, status checks) will be sent to this URL. Leave as default if unchanged.
          </span>
        </div>
        <Field label="Payment Backend URL" hint="e.g. https://your-payment-server.railway.app — no trailing slash">
          <input
            style={inp}
            value={(settings as any).paymentBackendUrl || ""}
            onChange={e => set("paymentBackendUrl", e.target.value)}
            placeholder="https://function-bun-production-37b5.up.railway.app"
          />
        </Field>
        {(settings as any).paymentBackendUrl && (
          <div style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Active endpoint: <span style={{ color: "#34d399", fontWeight: 600 }}>{(settings as any).paymentBackendUrl}</span>
          </div>
        )}
      </Section>

      <Section title="Security" icon={Shield}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Change Admin Password</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, maxWidth: 620 }}>
            <Field label="Current Password">
              <input style={inp} type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
            </Field>
            <Field label="New Password">
              <input style={inp} type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} placeholder="••••••••" />
            </Field>
            <Field label="Confirm New Password" hint="Leave blank to keep current password">
              <input style={inp} type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
            </Field>
          </div>
          {pwMsg && pwStatus !== "idle" && (
            <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 10, background: pwStatus === "saved" ? "#10b98122" : "#ef444422", border: `1px solid ${pwStatus === "saved" ? "#10b981" : "#ef4444"}44`, color: pwStatus === "saved" ? "#10b981" : "#f87171", fontSize: 12, maxWidth: 620 }}>
              {pwMsg}
            </div>
          )}
          <button
            onClick={changePassword}
            disabled={pwStatus === "saving" || (!pwForm.current && !pwForm.newPw)}
            style={{ padding: "8px 18px", background: pwStatus === "saved" ? "#10b981" : pwStatus === "error" ? "#ef4444" : "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pwStatus === "saving" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: (!pwForm.current && !pwForm.newPw) ? 0.4 : 1 }}
          >
            {pwStatus === "saving" ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {pwStatus === "saving" ? "Updating..." : pwStatus === "saved" ? "Updated!" : "Update Password"}
          </button>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginTop: 4 }}>
          <Toggle checked={settings.twoFactor} onChange={(v: boolean) => set("twoFactor", v)} label="Two-Factor Authentication" hint="Add an extra layer of security to your admin account" />
        </div>
      </Section>
    </div>
  );
}
