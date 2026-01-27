import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return "••••••••" + key.slice(-4);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return `${formatDate(d)} at ${formatTime(d)}`;
}

export function formatRevenue(value: number | undefined | null): string {
  const numValue = value ?? 0;

  if (numValue >= 1000000000) {
    const billions = numValue / 1000000000;
    return `$${billions.toFixed(billions >= 10 ? 0 : 1)}B`;
  } else if (numValue >= 1000000) {
    const millions = numValue / 1000000;
    return `$${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
  } else if (numValue >= 1000) {
    const thousands = numValue / 1000;
    return `$${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
  } else {
    return `$${numValue.toLocaleString("en-US")}`;
  }
}

export function formatValueInMillions(value: number | undefined | null): {
  value: string;
  suffix: string;
} {
  const numValue = value ?? 0;

  if (numValue >= 1000000000) {
    const billions = numValue / 1000000000;
    const formatted = billions.toFixed(2);
    return {
      value: formatted.replace(/\.?0+$/, ""),
      suffix: "B",
    };
  } else if (numValue >= 1000000) {
    const millions = numValue / 1000000;
    const formatted = millions.toFixed(2);
    return {
      value: formatted.replace(/\.?0+$/, ""),
      suffix: "M",
    };
  }
  return {
    value: numValue.toLocaleString("en-US"),
    suffix: "",
  };
}
