import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fbApi } from "./firebaseApi";

export const ADMIN_EMAILS = ["mainplatform.nexus@gmail.com"];

export const DISTRO_EXCLUSIVE_MS = 24 * 60 * 60 * 1000;
export const DISTRO_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const DISTROS_PLAN_ID = "distros";
export const DISTROS_PLAN_LABEL = "Distros — 1 Month";
export const DISTROS_PLAN_DAYS = 30;
export const DISTROS_PLAN_DEFAULT_PRICE = 50000;

export function getCreatedAtMs(item: any): number {
  if (!item) return 0;
  const v = item.createdAt;
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v?.seconds === "number") return v.seconds * 1000;
  return 0;
}

export function isDistroExclusive(item: any): boolean {
  const created = getCreatedAtMs(item);
  if (!created) return false;
  return Date.now() - created < DISTRO_EXCLUSIVE_MS;
}

export function isInDistrosWindow(item: any): boolean {
  const created = getCreatedAtMs(item);
  if (!created) return false;
  return Date.now() - created < DISTRO_WINDOW_MS;
}

export function timeLeftLabel(item: any, total: number): string {
  const created = getCreatedAtMs(item);
  if (!created) return "";
  const remaining = total - (Date.now() - created);
  if (remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  if (hours < 1) {
    const mins = Math.max(1, Math.floor(remaining / (60 * 1000)));
    return `${mins}m left`;
  }
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  const restHours = hours - days * 24;
  return restHours > 0 ? `${days}d ${restHours}h left` : `${days}d left`;
}

// Role-based admin/operator check (admin email or distro role on the profile).
// This grants Distros access without needing a paid subscription.
export function checkIsDistroOperator(user: any, profile: any): boolean {
  if (!user) return false;
  if (ADMIN_EMAILS.includes(user.email || "")) return true;
  const role = profile?.role;
  return role === "distro" || role === "distros" || role === "distributor" || role === "admin";
}

// Backwards-compatible alias used by existing callers.
export function checkIsDistro(user: any, profile: any): boolean {
  return checkIsDistroOperator(user, profile);
}

export function useIsDistroOperator(): boolean {
  const { user, profile } = useAuth();
  return checkIsDistroOperator(user, profile);
}

// True when the viewer has effective Distros access:
//  - admin / distro-role operator, OR
//  - signed-in user with an active "distros" subscription.
export function useIsDistroSubscriber(): { active: boolean; loading: boolean; expiresAt: number | null } {
  const { user, profile } = useAuth();
  const isOperator = checkIsDistroOperator(user, profile);
  const [active, setActive] = useState<boolean>(isOperator);
  const [loading, setLoading] = useState<boolean>(!isOperator && !!user);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (isOperator) {
      setActive(true);
      setLoading(false);
      setExpiresAt(null);
      return;
    }
    if (!user?.uid) {
      setActive(false);
      setLoading(false);
      setExpiresAt(null);
      return;
    }
    setLoading(true);
    fbApi.subscriptions
      .getActiveByPlan(user.uid, DISTROS_PLAN_ID)
      .then((sub: any) => {
        if (cancelled) return;
        setActive(!!sub);
        setExpiresAt(sub?.expiresAt ?? null);
      })
      .catch(() => {
        if (!cancelled) setActive(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid, isOperator]);

  return { active, loading, expiresAt };
}

// Convenience flag for use in listing pages — true when the viewer should
// see distros-exclusive items (operator OR active distros subscriber).
export function useIsDistro(): boolean {
  const op = useIsDistroOperator();
  const { active } = useIsDistroSubscriber();
  return op || active;
}

export function filterPublicVisible<T>(items: T[], isDistro: boolean): T[] {
  if (isDistro) return items;
  return items.filter((it) => !isDistroExclusive(it));
}
