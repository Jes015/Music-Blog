// Interfaces mínimas de Cloudflare Workers & D1
export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: { changes?: number };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IP_SALT?: string;
  TURNSTILE_SECRET?: string;
}

interface EdgeCache {
  match(req: Request): Promise<Response | undefined>;
  put(req: Request, res: Response): Promise<void>;
}

interface CfProperties {
  country?: string;
  asn?: number;
}

// ==========================================
// Configuración
// ==========================================

// Países permitidos: LATAM + España + Estados Unidos
const ALLOWED_COUNTRIES = new Set([
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT',
  'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE',
  'ES', 'US',
]);

// Redes de data centers / nubes (de ahí salen casi todos los bots, no lectores reales)
const BLOCKED_ASNS = new Set([
  16509, 14618, 8987,          // Amazon AWS
  15169, 396982, 19527,        // Google Cloud
  8075, 8068,                  // Microsoft Azure
  14061,                       // DigitalOcean
  24940, 213230,               // Hetzner
  16276,                       // OVH
  63949,                       // Linode / Akamai
  20473,                       // Vultr
  31898,                       // Oracle Cloud
  45102,                       // Alibaba Cloud
  132203,                      // Tencent Cloud
  9009,                        // M247 (VPNs)
  60068,                       // CDN77 / Datacamp (VPNs)
  212238,                      // Datacamp
]);

const MSG_GEO_BLOCK = "Lo siento pero para evitar ataques masivos bloqueamos la mayoria de paises que no son hispanohablantes";
const MSG_DAILY_LIMIT = "Tus likes son muy valiosos, solo 1 al dia ;)";
const MSG_ALREADY_LIKED = "Ya le diste like a este post";
const MSG_HIGH_VOLUME = "Estamos recibiendo una alta cantidad de likes en este momento. Por favor intenta en unos minutos ;)";
const MSG_BLOCKED_NETWORK = "Para evitar bots no se permiten likes desde VPNs o servidores ;)";

// Cortacircuitos
const GLOBAL_MAX_PER_MINUTE = 30;   // Máx likes por minuto en TODO el blog
const GLOBAL_MAX_PER_DAY = 500;     // Máx likes por día en TODO el blog (somos pequeños, sobra)
const BURST_WINDOW_MS = 10_000;     // Ventana local de 10 s
const BURST_MAX = 10;               // Máx intentos por ventana en cada nodo edge

const LIKES_CACHE_SECONDS = 3600;   // 1 hora
const MAX_BODY_BYTES = 32768;       // 32 KB: permite tokens de Turnstile (que pueden medir 2-4 KB) sin riesgo

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ==========================================
// Estado en memoria del isolate (gratis, no toca D1)
// ==========================================
let attemptTimestamps: number[] = [];
let validPostIds: Set<string> | null = null;
let validPostIdsLoadedAt = 0;

// ==========================================
// Utilidades
// ==========================================

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

// IPv6: un hogar/servidor recibe un bloque /64 entero (trillones de IPs).
// Si no lo agrupamos, un bot puede rotar IPs infinitas dentro de su bloque.
function normalizeIP(ip: string): string {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail ? tail.split(':') : [];
  const missing = Math.max(0, 8 - headParts.length - tailParts.length);
  const full = [...headParts, ...Array(missing).fill('0'), ...tailParts];
  return full.slice(0, 4).map((p) => p.toLowerCase() || '0').join(':') + '::/64';
}

async function hashIP(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Solo se aceptan likes para posts que existen de verdad.
// Se lee del JSON estático del build (servir assets es gratis, no cuenta como request).
async function isRealPost(postId: string, env: Env, origin: string): Promise<boolean> {
  const now = Date.now();
  if (!validPostIds || now - validPostIdsLoadedAt > 10 * 60_000) {
    try {
      const res = await env.ASSETS.fetch(new Request(`${origin}/api/post-map.json`));
      if (res.ok) {
        const map = (await res.json()) as Record<string, number>;
        validPostIds = new Set(Object.keys(map));
        validPostIdsLoadedAt = now;
      }
    } catch (error) {
      console.error('[likes] no se pudo cargar post-map.json:', error);
    }
  }
  // Si por algún motivo no se pudo cargar, basta con el formato UUID
  return validPostIds ? validPostIds.has(postId) : true;
}

// ==========================================
// GET /api/likes
// ==========================================
async function handleGet(url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  const cache = (caches as unknown as { default?: EdgeCache }).default;
  // Clave FIJA: ignora cualquier ?query para que nadie pueda saltarse el caché
  const cacheKey = new Request(`${url.origin}/api/likes`, { method: 'GET' });

  const cached = await cache?.match(cacheKey);
  if (cached) return cached;

  if (!env.DB) return jsonResponse({ success: true, likes: {} });

  try {
    const { results } = await env.DB.prepare(
      'SELECT post_id, COUNT(*) AS count FROM post_likes GROUP BY post_id'
    ).all<{ post_id: string; count: number }>();

    const likes: Record<string, number> = {};
    for (const row of results ?? []) likes[row.post_id] = row.count;

    const response = jsonResponse({ success: true, likes }, 200, {
      'Cache-Control': `public, max-age=${LIKES_CACHE_SECONDS}, s-maxage=${LIKES_CACHE_SECONDS}`,
    });
    if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    console.error('[likes GET]', error);
    return jsonResponse({ success: false, error: 'Error al consultar likes' }, 500);
  }
}

// ==========================================
// POST /api/likes
// ==========================================
async function handlePost(request: Request, url: URL, env: Env): Promise<Response> {
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // 1. Solo desde nuestra propia web (evita que otras páginas usen a sus visitantes como bots)
  const origin = request.headers.get('Origin');
  if (!isLocalDev && origin !== url.origin) {
    return jsonResponse({ success: false, error: 'Origen no permitido' }, 403);
  }

  // 2. Cuerpo pequeño y válido
  const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, error: 'Petición demasiado grande' }, 413);
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, error: 'Petición demasiado grande' }, 413);
  }
  let postId = '';
  let turnstileToken = '';
  try {
    const body = JSON.parse(raw) as { postId?: unknown; turnstileToken?: unknown };
    postId = typeof body.postId === 'string' ? body.postId.trim().toLowerCase() : '';
    turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';
  } catch {
    return jsonResponse({ success: false, error: 'JSON inválido' }, 400);
  }
  if (!UUID_RE.test(postId)) {
    return jsonResponse({ success: false, error: 'ID de post inválido' }, 400);
  }

  // Verificación de Turnstile (si el secret está configurado)
  if (env.TURNSTILE_SECRET && !isLocalDev) {
    if (!turnstileToken) {
      return jsonResponse({ success: false, error: 'Verificación de seguridad requerida' }, 403);
    }
    try {
      const verifyFormData = new FormData();
      verifyFormData.append('secret', env.TURNSTILE_SECRET);
      verifyFormData.append('response', turnstileToken);
      const clientIP = request.headers.get('cf-connecting-ip');
      if (clientIP) {
        verifyFormData.append('remoteip', clientIP);
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyFormData,
      });

      const outcome = (await verifyRes.json()) as { success: boolean };
      if (!outcome.success) {
        return jsonResponse(
          { success: false, error: 'No se pudo verificar que seas humano. Intenta de nuevo ;)' },
          403
        );
      }
    } catch (e) {
      console.error('[turnstile verify error]', e);
      return jsonResponse({ success: false, error: 'Error en la verificación de seguridad' }, 500);
    }
  }

  // 3. País (Cloudflare lo da gratis en cada request)
  const cf = (request as unknown as { cf?: CfProperties }).cf;
  const country = (cf?.country ?? 'XX').toUpperCase();
  if (!isLocalDev && !ALLOWED_COUNTRIES.has(country)) {
    return jsonResponse({ success: false, error: MSG_GEO_BLOCK }, 403);
  }

  // 4. Data centers / VPNs conocidos
  if (!isLocalDev && cf?.asn && BLOCKED_ASNS.has(cf.asn)) {
    return jsonResponse({ success: false, error: MSG_BLOCKED_NETWORK }, 403);
  }

  // 5. Cortacircuitos local en memoria (frena ráfagas sin tocar la base de datos)
  const now = Date.now();
  attemptTimestamps = attemptTimestamps.filter((t) => now - t < BURST_WINDOW_MS);
  if (attemptTimestamps.length >= BURST_MAX) {
    return jsonResponse({ success: false, error: MSG_HIGH_VOLUME }, 429);
  }
  attemptTimestamps.push(now);

  // 6. El post tiene que existir
  if (!(await isRealPost(postId, env, url.origin))) {
    return jsonResponse({ success: false, error: 'Ese post no existe' }, 404);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Base de datos no configurada' }, 503);
  }

  // cf-connecting-ip lo pone Cloudflare y no se puede falsificar
  const clientIP = request.headers.get('cf-connecting-ip') ?? (isLocalDev ? '127.0.0.1' : '');
  if (!clientIP) {
    return jsonResponse({ success: false, error: 'No se pudo identificar la conexión' }, 400);
  }
  const ipHash = await hashIP(normalizeIP(clientIP), env.IP_SALT || 'jesus-oyola-music-blog-salt-secret');

  const oneMinuteAgo = now - 60_000;
  const oneDayAgo = now - 86_400_000;

  try {
    // 7. Una sola consulta para todas las reglas (menos lecturas = menos costo)
    const status = await env.DB.prepare(
      `SELECT
         EXISTS(SELECT 1 FROM post_likes WHERE post_id = ?1 AND ip_hash = ?2) AS already_liked,
         (SELECT COUNT(*) FROM post_likes WHERE ip_hash = ?2 AND created_at > ?3) AS ip_today,
         (SELECT COUNT(*) FROM post_likes WHERE created_at > ?4) AS global_minute,
         (SELECT COUNT(*) FROM post_likes WHERE created_at > ?3) AS global_day`
    )
      .bind(postId, ipHash, oneDayAgo, oneMinuteAgo)
      .first<{ already_liked: number; ip_today: number; global_minute: number; global_day: number }>();

    if (status?.already_liked) {
      return jsonResponse({ success: false, error: MSG_ALREADY_LIKED, alreadyLiked: true }, 409);
    }
    if ((status?.ip_today ?? 0) >= 1) {
      return jsonResponse({ success: false, error: MSG_DAILY_LIMIT }, 429);
    }
    if ((status?.global_minute ?? 0) >= GLOBAL_MAX_PER_MINUTE || (status?.global_day ?? 0) >= GLOBAL_MAX_PER_DAY) {
      return jsonResponse({ success: false, error: MSG_HIGH_VOLUME }, 429);
    }

    // 8. Inserción ATÓMICA: vuelve a validar las reglas dentro del mismo INSERT.
    //    Si llegan 2 peticiones simultáneas de la misma IP, solo una entra.
    const result = await env.DB.prepare(
      `INSERT OR IGNORE INTO post_likes (post_id, ip_hash, country, created_at)
       SELECT ?1, ?2, ?3, ?4
       WHERE NOT EXISTS (SELECT 1 FROM post_likes WHERE ip_hash = ?2 AND created_at > ?5)
         AND (SELECT COUNT(*) FROM post_likes WHERE created_at > ?6) < ?7`
    )
      .bind(postId, ipHash, country, now, oneDayAgo, oneMinuteAgo, GLOBAL_MAX_PER_MINUTE)
      .run();

    if (!result.meta?.changes) {
      return jsonResponse({ success: false, error: MSG_DAILY_LIMIT }, 429);
    }

    const updated = await env.DB.prepare('SELECT COUNT(*) AS total FROM post_likes WHERE post_id = ?')
      .bind(postId)
      .first<{ total: number }>();

    return jsonResponse({ success: true, likes: updated?.total ?? 1 });
  } catch (error) {
    console.error('[likes POST]', error);
    return jsonResponse({ success: false, error: 'Error al procesar el like' }, 500);
  }
}

// ==========================================
// Entrada del Worker
// ==========================================
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Solo la ruta exacta: así la regla de rate limiting de Cloudflare (path eq /api/likes) cubre todo
    if (url.pathname === '/api/likes') {
      if (request.method === 'GET') return handleGet(url, env, ctx);
      if (request.method === 'POST') return handlePost(request, url, env);
      return jsonResponse({ error: 'Método no permitido' }, 405, { Allow: 'GET, POST' });
    }

    // Todo lo demás: archivos estáticos del blog
    return env.ASSETS.fetch(request);
  },
};
