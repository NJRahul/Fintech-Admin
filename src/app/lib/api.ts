// Shared API client — uses hardcoded public anon key (safe for client-side)
const BASE = 'https://cravrmznedxpicdsosfy.supabase.co/functions/v1/make-server-63e5b79e';
const KEY  = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXZybXpuZWR4cGljZHNvc2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNTIwOTYsImV4cCI6MjA5ODgyODA5Nn0._DwxaB2tmOVAff756srxXINhBsL8Esmg4VDsmJQBWuU';

export async function api(path: string, method = 'GET', body?: unknown): Promise<any> {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: KEY },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDt(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getDate()).padStart(2,'0')} ${M[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export function fmtDtShort(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getDate()).padStart(2,'0')} ${M[d.getMonth()]} ${d.getFullYear()}`;
}

export function queueAge(iso: string): string {
  if (!iso) return '—';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}
