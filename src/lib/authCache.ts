/**
 * IndexedDB Cache for Auth Data
 * Stores profile, role, and usernames for instant restore on next load
 * Dramatically reduces perceived loading time
 */

const DB_NAME = 'inventario-auth';
const DB_VERSION = 1;
const STORE_NAME = 'auth-cache';

interface CachedAuthData {
  id: 'profile' | 'role' | 'usernames';
  data: unknown;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

class AuthCache {
  private db: IDBDatabase | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async set(id: 'profile' | 'role' | 'usernames', data: unknown, ttl?: number): Promise<void> {
    if (!this.initialized) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        id,
        data,
        timestamp: Date.now(),
        ttl
      } as CachedAuthData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(id: 'profile' | 'role' | 'usernames'): Promise<unknown | null> {
    if (!this.initialized) await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedAuthData | undefined;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        if (result.ttl && Date.now() - result.timestamp > result.ttl) {
          // Cache expired, delete it
          this.delete(id).catch(err => console.error('Failed to delete expired cache:', err));
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async delete(id: 'profile' | 'role' | 'usernames'): Promise<void> {
    if (!this.initialized) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.initialized) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const authCache = new AuthCache();
