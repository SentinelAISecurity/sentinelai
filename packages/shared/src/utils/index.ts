export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "GAS"];

export function compareSeverity(a: string, b: string): number {
  const indexA = SEVERITY_ORDER.indexOf(a);
  const indexB = SEVERITY_ORDER.indexOf(b);
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  return indexA - indexB;
}

export function formatAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function calculateSecurityScore(
  vulnerabilities: Array<{ severity: string }>,
): number {
  const weights: Record<string, number> = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 8,
    LOW: 3,
    INFO: 0,
    GAS: 1,
  };

  let penalty = 0;
  for (const vuln of vulnerabilities) {
    penalty += weights[vuln.severity] ?? 0;
  }

  return Math.max(0, Math.min(100, 100 - penalty));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
