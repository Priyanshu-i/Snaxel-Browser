// Simple in-memory cache utility (optional)
// This can be used in the future to cache search results

class Cache {
    constructor(ttl = 300000) { // Default 5 minutes
        this.cache = new Map();
        this.ttl = ttl;
    }

    generateKey(query, sources) {
        return `${query.toLowerCase()}-${sources.sort().join(',')}`;
    }

    set(query, sources, data) {
        const key = this.generateKey(query, sources);
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(query, sources) {
        const key = this.generateKey(query, sources);
        const cached = this.cache.get(key);

        if (!cached) return null;

        // Check if cache is still valid
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    has(query, sources) {
        return this.get(query, sources) !== null;
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    // Clean expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Export for use in routes
export default Cache;