// Interfaces para Cloudflare Workers & D1
export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
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
}

// Lista de países permitidos: LATAM + España + Estados Unidos
const ALLOWED_COUNTRIES = new Set([
  // América Latina
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT',
  'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE',
  // España y Estados Unidos
  'ES', 'US'
]);

// Mensajes exactos solicitados
const MSG_GEO_BLOCK = "Lo siento pero para evitar ataques masivos bloqueamos la mayoria de paises que no son hispanohablantes";
const MSG_DAILY_LIMIT = "Tus likes son muy valiosos, solo 1 al dia ;)";
const MSG_ALREADY_LIKED = "Ya le diste like a este post";
const MSG_HIGH_VOLUME = "Estamos recibiendo una alta cantidad de likes en este momento. Por favor intenta en unos minutos ;)";

// Protección contra ráfagas (Circuit Breaker en memoria del Edge)
const BURST_WINDOW_MS = 10000; // Ventana de 10 segundos
const MAX_BURST_PER_WINDOW = 15; // Máximo 15 votos en 10 segundos por nodo edge
let writeTimestamps: number[] = [];

// Hashea la IP con SHA-256 + salt para privacidad
async function hashIP(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint de Likes
    if (url.pathname === '/api/likes' || url.pathname === '/api/likes/') {
      // Manejo de CORS Preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      // ==========================================
      // GET: Obtener conteo de likes por post
      // ==========================================
      if (request.method === 'GET') {
        // 1. Revisar si la respuesta ya está en el Edge Cache
        const cache = (caches as unknown as { default: { match(req: Request): Promise<Response | undefined>; put(req: Request, res: Response): Promise<void> } }).default;
        const cacheKey = new Request(url.toString(), request);
        const cachedResponse = await cache?.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          if (!env.DB) {
            return jsonResponse({ success: true, likes: {} });
          }

          // Consultar el total de likes agrupados por post
          const { results } = await env.DB.prepare(
            'SELECT post_id, COUNT(*) as count FROM post_likes GROUP BY post_id'
          ).all<{ post_id: string; count: number }>();

          const likesMap: Record<string, number> = {};
          if (results) {
            for (const row of results) {
              likesMap[row.post_id] = row.count;
            }
          }

          const response = jsonResponse(
            { success: true, likes: likesMap },
            200,
            {
              // Se guarda en el Edge CDN de Cloudflare durante 1 hora (3600 segundos)
              'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            }
          );

          // Guardar en Edge Cache de Cloudflare sin bloquear la respuesta
          if (cache) {
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
          }
          return response;
        } catch (error) {
          console.error('[API likes GET error]:', error);
          return jsonResponse({ success: false, error: 'Error al consultar likes' }, 500);
        }
      }

      // ==========================================
      // POST: Registrar un nuevo like
      // ==========================================
      if (request.method === 'POST') {
        try {
          let body: { postId?: string } = {};
          try {
            body = await request.json();
          } catch {
            return jsonResponse({ success: false, error: 'JSON inválido' }, 400);
          }

          const postId = body.postId?.trim();
          if (!postId || typeof postId !== 'string' || postId.length > 100) {
            return jsonResponse({ success: false, error: 'ID de post inválido' }, 400);
          }

          // 1. Detección de IP y País
          const clientIP =
            request.headers.get('cf-connecting-ip') ||
            request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            '127.0.0.1';

          // Cloudflare provee request.cf.country (código ISO de 2 letras)
          const cf = (request as unknown as { cf?: { country?: string } }).cf;
          const country = (cf?.country || request.headers.get('cf-ipcountry') || 'XX').toUpperCase();

          // Permitir localhost para pruebas de desarrollo local
          const isLocal = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.');

          // REGLA 1: Geolocalización (Solo LATAM + España + USA)
          if (!isLocal && !ALLOWED_COUNTRIES.has(country)) {
            return jsonResponse({ success: false, error: MSG_GEO_BLOCK }, 403);
          }

          // REGLA 1.5: Circuit Breaker en Memoria (Protege a D1 de ráfagas en segundos)
          const now = Date.now();
          writeTimestamps = writeTimestamps.filter((t) => now - t < BURST_WINDOW_MS);
          if (writeTimestamps.length >= MAX_BURST_PER_WINDOW) {
            return jsonResponse({ success: false, error: MSG_HIGH_VOLUME }, 429);
          }
          writeTimestamps.push(now);

          if (!env.DB) {
            return jsonResponse({ success: false, error: 'Base de datos no configurada' }, 503);
          }

          // REGLA 1.8: Circuit Breaker Global (Máx 50 likes por minuto en todo el blog)
          const oneMinuteAgo = now - 60 * 1000;
          const globalRecent = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM post_likes WHERE created_at > ?'
          )
            .bind(oneMinuteAgo)
            .first<{ total: number }>();

          if (globalRecent && globalRecent.total >= 50) {
            return jsonResponse({ success: false, error: MSG_HIGH_VOLUME }, 429);
          }

          const salt = env.IP_SALT || 'jesus-oyola-music-blog-salt-secret';
          const ipHash = await hashIP(clientIP, salt);
          const oneDayAgo = now - 24 * 60 * 60 * 1000;

          // REGLA 2: Una IP no puede darle like al mismo post dos veces en toda su vida
          const existingPostLike = await env.DB.prepare(
            'SELECT 1 FROM post_likes WHERE post_id = ? AND ip_hash = ? LIMIT 1'
          )
            .bind(postId, ipHash)
            .first();

          if (existingPostLike) {
            return jsonResponse({ success: false, error: MSG_ALREADY_LIKED }, 409);
          }

          // REGLA 3: Máximo 1 like por día por IP en todo el blog
          const dailyLikesCount = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM post_likes WHERE ip_hash = ? AND created_at > ?'
          )
            .bind(ipHash, oneDayAgo)
            .first<{ total: number }>();

          if (dailyLikesCount && dailyLikesCount.total >= 1) {
            return jsonResponse({ success: false, error: MSG_DAILY_LIMIT }, 429);
          }

          // Insertar el like único
          await env.DB.prepare(
            'INSERT INTO post_likes (post_id, ip_hash, country, created_at) VALUES (?, ?, ?, ?)'
          )
            .bind(postId, ipHash, country, now)
            .run();

          // Obtener el conteo actualizado de este post
          const updated = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM post_likes WHERE post_id = ?'
          )
            .bind(postId)
            .first<{ total: number }>();

          return jsonResponse({
            success: true,
            likes: updated?.total ?? 1,
          });
        } catch (error) {
          console.error('[API likes POST error]:', error);
          return jsonResponse({ success: false, error: 'Error al procesar el like' }, 500);
        }
      }

      return jsonResponse({ error: 'Método no permitido' }, 405);
    }

    // Para cualquier otra ruta, servir el contenido estático de ./dist
    return env.ASSETS.fetch(request);
  },
};
