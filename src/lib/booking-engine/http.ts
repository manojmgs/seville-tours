/**
 * Resilient JSON GET for booking-provider reads.
 *
 * Adds two things the raw provider calls lacked: a hard request timeout (a slow
 * upstream must never block a render) and explicit cache intent. On any failure —
 * non-2xx, timeout, network, or parse error — it resolves to null so callers can
 * degrade gracefully rather than throw.
 */

export type FetchJsonOptions = {
  /** Upstream request timeout in milliseconds. */
  timeoutMs: number;
  /** Next.js data-cache TTL in seconds. Ignored when {@link noStore} is true. */
  revalidate?: number;
  /** Cache tags for targeted revalidation. Ignored when {@link noStore} is true. */
  tags?: string[];
  /** Bypass the data cache entirely (for real-time reads). */
  noStore?: boolean;
};

export async function fetchJson<T>(url: string, options: FetchJsonOptions): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      ...(options.noStore
        ? { cache: "no-store" }
        : { next: { revalidate: options.revalidate, tags: options.tags } }),
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
