import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { getDb } from '$lib/db/client';
import { sessions, users } from '$lib/db/schema';

let _lucia: Lucia | null = null;

export function getLucia(): Lucia | null {
	if (!process.env.TURSO_URL) return null;
	if (!_lucia) {
		const adapter = new DrizzleSQLiteAdapter(getDb(), sessions, users);
		_lucia = new Lucia(adapter, {
			sessionCookie: {
				attributes: { secure: process.env.NODE_ENV === 'production' }
			}
		});
	}
	return _lucia;
}
