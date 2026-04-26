import { useState, useEffect, useRef } from "react";
import { Truck, Lock, Clock, Zap, Eye, RefreshCw } from "lucide-react";
import { fbApi } from "../lib/firebaseApi";
import { paymentApi, PaymentStatus } from "../lib/paymentApi";
import { useAuth } from "../contexts/AuthContext";
import {
  DISTROS_PLAN_ID,
  DISTROS_PLAN_LABEL,
  DISTROS_PLAN_DAYS,
  DISTROS_PLAN_DEFAULT_PRICE,
} from "../lib/distros";

interface Props {
  onClose: () => void;
  onSubscribed?: () => void;
  onOpenAuth?: () => void;
  renewal?: boolean;
}

const BENEFITS = [
  { icon: <Eye size={14} />, color: "#f59e0b", title: "First-look access", desc: "See every new title 24 hours before the public" },
  { icon: <Lock size={14} />, color: "#fbbf24", title: "Distros-only feed", desc: "Browse the dedicated distros area for 7 days per release" },
  { icon: <Zap size={14} />, color: "#10b981", title: "Instant activation", desc: "Pay once, unlocks instantly for 30 days" },
  { icon: <RefreshCw size={14} />, color: "#6366f1", title: "Easy renewal", desc: "Top up anytime to extend your distros membership" },
];

function Spinner({ small = false }: { small?: boolean }) {
  const s = small ? 12 : 16;
  return (
    <span
      style={{
        display: "inline-block",
        width: s,
        height: s,
        borderRadius: "50%",
        border: `2px solid rgba(255,255,255,0.25)`,
        borderTopColor: "#fff",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

function formatUGX(amount: number) {
  return "UGX " + amount.toLocaleString();
}

export default function DistrosSubscribeModal({ onClose, onSubscribed, onOpenAuth, renewal }: Props) {
  const { user, profile } = useAuth();
  const [price, setPrice] = useState<number>(DISTROS_PLAN_DEFAULT_PRICE);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [payStatus, setPayStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const internalRef = useRef<string>("");
  const subscriptionRef = useRef<string>("");
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const activatedRef = useRef<boolean>(false);

  useEffect(() => {
    fbApi.settings.get().then((s: any) => {
      if (s && typeof s.planDistrosPrice === "number") setPrice(Number(s.planDistrosPrice));
    }).catch(() => {});
    if (profile?.phone) setPhone(profile.phone);
  }, [profile]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
  };

  const handleStart = () => {
    if (!user) { onClose(); onOpenAuth?.(); return; }
    setError("");
    setStep(2);
  };

  const activateInFirebase = async (txData: any) => {
    if (!user) return;
    if (activatedRef.current) return;
    activatedRef.current = true;
    const expiresAt = Date.now() + DISTROS_PLAN_DAYS * 24 * 60 * 60 * 1000;
    await fbApi.subscriptions.create({
      userId: user.uid,
      userEmail: user.email || profile?.email || "",
      userName: profile?.name || user.displayName || "",
      userPhone: phone.trim(),
      plan: DISTROS_PLAN_ID,
      planLabel: DISTROS_PLAN_LABEL,
      amount: price,
      phone: phone.trim(),
      status: "active",
      paymentMethod: "mobile_money",
      expiresAt,
      reference: subscriptionRef.current,
      providerTxId: txData?.provider_transaction_id || null,
      provider: txData?.provider || null,
      paidAt: txData?.completed_at || null,
    });
    await fbApi.activities.log({
      userId: user.uid,
      userName: profile?.name || user.displayName || "",
      userEmail: user.email || profile?.email || "",
      userPhone: phone.trim(),
      actionType: renewal ? "subscription_renewal" : "subscription_purchase",
      page: window.location.pathname,
      contentTitle: DISTROS_PLAN_LABEL,
      details: `${renewal ? "Renewed" : "Activated"} distros membership for ${DISTROS_PLAN_DAYS} days`,
      metadata: JSON.stringify({ plan: DISTROS_PLAN_ID, amount: price, provider: txData?.provider }),
    });
  };

  const startPolling = () => {
    let attempts = 0;
    const MAX_ATTEMPTS = 120;
    pollTimer.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);
      try {
        const result = await paymentApi.checkStatus(internalRef.current);
        const status = result?.request_status || result?.status;
        if (status === "success") {
          stopPolling();
          await activateInFirebase(result);
          setPayStatus("success");
          setStep(3);
          onSubscribed?.();
          return;
        }
        if (status === "failed" || status === "cancelled" || status === "rejected") {
          stopPolling();
          setPayStatus("failed");
          setError("Payment was declined or cancelled. Please try again.");
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          stopPolling();
          setPayStatus("failed");
          setError("Payment timed out. If you approved the prompt, please contact support.");
        }
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          stopPolling();
          setPayStatus("failed");
          setError("Could not verify payment status. Please contact support if funds were deducted.");
        }
      }
    }, 1000);
  };

  const handlePay = async () => {
    if (!phone.trim()) { setError("Please enter your Mobile Money phone number."); return; }
    if (!user) { onClose(); onOpenAuth?.(); return; }
    setError("");
    setPayStatus("validating");
    try { await paymentApi.validatePhone(phone.trim()); } catch {}
    setPayStatus("pending");
    activatedRef.current = false;
    const reference = `DST-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    subscriptionRef.current = reference;
    let depositResult: any;
    try {
      depositResult = await paymentApi.deposit(
        phone.trim(),
        price,
        `${renewal ? "Renew" : "Activate"} Distros — 1 Month`,
        reference
      );
    } catch (e: any) {
      setPayStatus("idle");
      setError(e.message || "Could not initiate payment. Please try again.");
      return;
    }
    const intRef = depositResult?.internal_reference || depositResult?.data?.internal_reference;
    if (!intRef) {
      setPayStatus("idle");
      setError("Payment could not be initiated. Please try again.");
      return;
    }
    internalRef.current = intRef;
    setPayStatus("polling");
    setPollCount(0);
    startPolling();
  };

  const isProcessing = payStatus === "validating" || payStatus === "pending" || payStatus === "polling";

  const statusLabel = () => {
    if (payStatus === "validating") return "Validating phone…";
    if (payStatus === "pending") return "Sending request…";
    if (payStatus === "polling") return "Awaiting your approval…";
    return renewal ? "Renew Distros Pass" : "Activate Distros Pass";
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }} />

      <div style={{ position: "relative", width: 460, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", borderRadius: 16, background: "#fff", color: "#1a1a1a", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>

        <button
          onClick={() => { if (!isProcessing) onClose(); }}
          style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: "50%", background: "rgba(220,38,38,0.12)", border: "1.5px solid rgba(220,38,38,0.3)", cursor: isProcessing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#ef4444", lineHeight: 1, zIndex: 5 }}
        >×</button>

        {/* Header strip */}
        <div style={{ background: "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)", padding: "20px 22px", borderRadius: "16px 16px 0 0", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.9 }}>
                {renewal ? "RENEWAL REQUIRED" : "DISTROS MEMBERSHIP"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{DISTROS_PLAN_LABEL}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 22px 24px" }}>

          {step === 3 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, padding: "20px 0 6px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff" }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>Distros Activated!</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, maxWidth: 320 }}>
                You're now a distros member for the next <strong>{DISTROS_PLAN_DAYS} days</strong>. Enjoy first-look access to every new release.
              </div>
              <button
                onClick={onClose}
                style={{ marginTop: 6, width: "100%", padding: "12px", borderRadius: 30, background: "#10b981", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Open the Distros area
              </button>
            </div>
          ) : step === 2 ? (
            <>
              <button
                onClick={() => { if (!isProcessing) { setStep(1); setError(""); setPayStatus("idle"); stopPolling(); } }}
                style={{ background: "none", border: "none", color: "#888", fontSize: 12, cursor: isProcessing ? "not-allowed" : "pointer", padding: 0, marginBottom: 10 }}
              >← Back</button>

              <div style={{ background: "#fffaf0", border: "1px solid #f5d691", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#a86a00", fontWeight: 700, letterSpacing: "0.05em" }}>SELECTED PLAN</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#7a4900", marginTop: 2 }}>{DISTROS_PLAN_LABEL}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginTop: 4 }}>{formatUGX(price)}</div>
                <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>Valid for {DISTROS_PLAN_DAYS} days</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <img src="https://www.galaxyfm.co.ug/wp-content/uploads/2018/05/Airtel-MTN-Money-logo-horz-.jpg" alt="Mobile Money" style={{ width: "100%", maxWidth: 180, height: "auto", objectFit: "contain", display: "block", margin: "0 auto 6px" }} />
                <div style={{ fontSize: 11, color: "#888", textAlign: "center" }}>Pay via Airtel Money or MTN Mobile Money</div>
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 5, display: "block" }}>Mobile Money Number</label>
              <input
                type="tel"
                placeholder="e.g. 0770 123 456"
                value={phone}
                onChange={(e) => { if (!isProcessing) { setPhone(e.target.value); setError(""); } }}
                disabled={isProcessing}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: error && !isProcessing ? "1.5px solid #ef4444" : "1.5px solid #e0c87a", fontSize: 14, outline: "none", color: "#1a1a1a", background: "#fffef8", marginBottom: 10 }}
                autoFocus
              />

              {payStatus === "polling" && (
                <div style={{ background: "#fff9e6", border: "1px solid #f5c842", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Spinner />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#c07800" }}>Awaiting your approval</div>
                      <div style={{ fontSize: 11, color: "#a06000", marginTop: 2 }}>Approve the payment prompt on your phone.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 6 }}>Checking… ({pollCount}s)</div>
                </div>
              )}

              {error && payStatus !== "polling" && (
                <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>{error}</div>
              )}

              {payStatus === "failed" ? (
                <button
                  onClick={() => { setPayStatus("idle"); setError(""); }}
                  style={{ width: "100%", padding: "13px", borderRadius: 30, background: "#ef4444", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                >Try Again</button>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  style={{ width: "100%", padding: "13px", borderRadius: 30, background: isProcessing ? "#e5c87a" : "linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#ef4444 100%)", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: isProcessing ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {isProcessing && <Spinner small />} {statusLabel()}
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, paddingBottom: 14, borderBottom: "1px dashed #eee" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", fontWeight: 700 }}>{DISTROS_PLAN_DAYS} DAYS · DISTROS ONLY</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>UGX</span>
                    <span style={{ fontSize: 36, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>{price.toLocaleString()}</span>
                  </div>
                </div>
                <span style={{ padding: "4px 10px", background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 20, letterSpacing: "0.05em" }}>DISTROS</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", marginBottom: 16 }}>
                {BENEFITS.map((b) => (
                  <div key={b.title} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: b.color + "22", color: b.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {b.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{b.title}</div>
                      <div style={{ fontSize: 10, color: "#888", marginTop: 1, lineHeight: 1.35 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fff8ec", border: "1px solid #f6dca0", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
                <Clock size={13} color="#c07800" style={{ marginTop: 2 }} />
                <div style={{ fontSize: 11, color: "#7a4900", lineHeight: 1.5 }}>
                  Distros membership renews manually. When the {DISTROS_PLAN_DAYS} days end, you'll need to subscribe again to keep your access.
                </div>
              </div>

              {error && <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>{error}</div>}

              <button
                onClick={handleStart}
                style={{ width: "100%", padding: "14px", borderRadius: 30, background: "linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#ef4444 100%)", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(245,158,11,0.45)" }}
              >
                {renewal ? "Renew Distros Pass" : "Subscribe to Distros"}
              </button>
              {!user && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#888", textAlign: "center" }}>
                  You'll be asked to sign in first.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
