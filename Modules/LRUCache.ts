"use strict";

/**
 * Least Recently Used (LRU) Cache
 */
class LRUCache<K, V> {
    private _capacity: number;
    private _cache: Map<K, V>;

    constructor(capacity: number) {
        this._capacity = capacity;
        this._cache = new Map<K, V>();
    };

    /**
     * Get the capacity of the cache
     * @returns The capacity of the cache
     */
    get capacity(): number {
        return this._capacity;
    };

    /**
     * Get the cache object
     * @returns The cache object
     */
    get cache(): Map<K, V> {
        return this._cache;
    };

    /**
     * Checks if the key exists in the cache
     * @param key - The key to check
     * @returns True if the key exists, false otherwise
     */
    has(key: K): boolean {
        return this._cache.has(key);
    };

    /**
     * Gets the value associated with the key and moves it to the end (most recently used)
     * @param key - The key to retrieve
     * @returns The value associated with the key, or undefined if not found
     */
    get(key: K): V | undefined {
        if (!this.has(key)) return undefined;
        const value = this._cache.get(key);
        this._cache.delete(key);
        this._cache.set(key, value!);
        return value;
    };

    /**
     * Sets a key-value pair in the cache
     * @param key - The key to set
     * @param value - The value to associate with the key
     * @returns The cache instance for method chaining
     */
    set(key: K, value: V): this {
        if (this.has(key)) this._cache.delete(key);
        else if (this._cache.size >= this._capacity) {
            const firstKey = this._cache.keys().next().value;
            if (firstKey !== undefined) {
                this._cache.delete(firstKey);
            };
        };
        this._cache.set(key, value);
        return this;
    };

    /**
     * Get the size of the cache
     * @returns The size of the cache
     */
    size(): number {
        return this._cache.size;
    };

    /**
     * Clear the cache
     */
    clear(): void {
        this._cache.clear();
    };
};

export default LRUCache;
