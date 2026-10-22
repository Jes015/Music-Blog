const STORAGE_KEY = 'user_liked_posts';

// ==========================================
// Gestión de Likes en LocalStorage
// ==========================================

export function getLocalLikedPosts(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function isPostLikedLocal(postId: string): boolean {
  return getLocalLikedPosts().has(postId);
}

export function markPostAsLikedLocal(postId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getLocalLikedPosts();
    set.add(postId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (error) {
    console.error('Error saving like to localStorage:', error);
  }
}

// ==========================================
// Caché en Memoria y Fetch Único Agrupado
// ==========================================

let likesCache: Record<string, number> = {};
let fetchPromise: Promise<Record<string, number>> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 60 segundos

type Listener = (likes: Record<string, number>) => void;
const listeners = new Set<Listener>();

export function subscribeToLikes(listener: Listener): () => void {
  listeners.add(listener);
  // Emitir el valor actual si ya existe
  if (Object.keys(likesCache).length > 0) {
    listener(likesCache);
  }
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  for (const listener of listeners) {
    try {
      listener(likesCache);
    } catch (e) {
      console.error('Error in likes listener:', e);
    }
  }
}

/**
 * Consulta los likes de todos los posts en una sola llamada compartida.
 * Si varios posts se montan a la vez, todos reutilizan la misma promesa HTTP.
 */
export async function getLikesMap(): Promise<Record<string, number>> {
  const now = Date.now();
  if (Object.keys(likesCache).length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return likesCache;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/likes');
      if (res.ok) {
        const json = await res.json();
        if (json?.likes && typeof json.likes === 'object') {
          likesCache = { ...likesCache, ...json.likes };
          lastFetchTime = Date.now();
          notifyListeners();
        }
      }
    } catch (error) {
      console.warn('No se pudieron sincronizar los likes remotos:', error);
    } finally {
      fetchPromise = null;
    }
    return likesCache;
  })();

  return fetchPromise;
}

/**
 * Envía el like de un post al backend
 */
export async function sendLike(
  postId: string
): Promise<{ success: boolean; likes?: number; error?: string }> {
  try {
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      // Guardar en localStorage
      markPostAsLikedLocal(postId);

      // Actualizar caché en memoria y avisar a los componentes
      if (typeof data.likes === 'number') {
        likesCache[postId] = data.likes;
        notifyListeners();
      }

      return { success: true, likes: data.likes };
    }

    return {
      success: false,
      error: data.error || 'No se pudo registrar el like. Intenta nuevamente.',
    };
  } catch (error) {
    console.error('Error enviando like:', error);
    return {
      success: false,
      error: 'Error de conexión. Intenta nuevamente.',
    };
  }
}
