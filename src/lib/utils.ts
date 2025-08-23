import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDateTR(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "az önce";
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays === 1) return "dün";
  if (diffDays === 2) return "evvelsi gün";
  return `${diffDays} gün önce`;
}