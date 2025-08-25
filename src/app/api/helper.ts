export function serializeBigInts(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInts);
    } else if (typeof obj === 'object' && obj !== null) {
        const serialized: Record<string, unknown> = {};
        for (const key in obj as Record<string, unknown>) {
            const value = (obj as Record<string, unknown>)[key];
            serialized[key] =
                typeof value === 'bigint' ? value.toString() : serializeBigInts(value);
        }
        return serialized;
    }
    return obj;
}
