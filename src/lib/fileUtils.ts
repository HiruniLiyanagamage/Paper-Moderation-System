/**
 * Returns true only if the URL is an absolute, externally accessible URL
 * (e.g. a Supabase Storage public URL like https://xxx.supabase.co/...).
 *
 * Returns false for legacy local paths like /uploads/... which were
 * written to disk before Vercel deployment and are no longer accessible.
 */
export function isAccessibleUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}
