/**
 * Limitador de requisicoes em memoria (sliding window).
 *
 * Escopo: protege contra abuso trivial em uma unica instancia do servidor.
 * Limitacao conhecida: em ambientes serverless multi-instancia o contador nao
 * e compartilhado. Para producao seria necessario um store distribuido (ex.: Redis).
 */

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Segundos ate liberar (aprox.), quando bloqueado. */
  retryAfterSeconds: number;
}

const MAX_TRACKED_KEYS = 10_000;

const hits = new Map<string, number[]>();

function prune(now: number, windowMs: number): void {
  if (hits.size <= MAX_TRACKED_KEYS) return;
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const { limit, windowMs } = options;

  prune(now, windowMs);

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const retryAfterMs = windowMs - (now - oldest);
    hits.set(key, recent);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, remaining: Math.max(0, limit - recent.length), retryAfterSeconds: 0 };
}

/** Apenas para testes: limpa o estado acumulado. */
export function resetRateLimit(): void {
  hits.clear();
}
