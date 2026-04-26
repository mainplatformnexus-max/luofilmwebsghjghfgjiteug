import { useAuth } from "../contexts/AuthContext";

export const ADMIN_EMAILS = ["mainplatform.nexus@gmail.com"];

export const DISTRO_EXCLUSIVE_MS = 24 * 60 * 60 * 1000;
export const DISTRO_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

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

export function checkIsDistro(user: any, profile: any): boolean {
  if (!user) return false;
  if (ADMIN_EMAILS.includes(user.email || "")) return true;
  const role = profile?.role;
  return role === "distro" || role === "distros" || role === "distributor" || role === "admin";
}

export function useIsDistro(): boolean {
  const { user, profile } = useAuth();
  return checkIsDistro(user, profile);
}

export function filterPublicVisible<T>(items: T[], isDistro: boolean): T[] {
  if (isDistro) return items;
  return items.filter((it) => !isDistroExclusive(it));
}
