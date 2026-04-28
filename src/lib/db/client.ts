import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Only imported in server-side code where env vars are available
function createDb() {
	const url = process.env.TURSO_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;
	if (!url) throw new Error('TURSO_URL is not set — add it to .env.local');
	const client = createClient({ url, authToken });
	return drizzle(client, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
	if (!_db) _db = createDb();
	return _db;
}
