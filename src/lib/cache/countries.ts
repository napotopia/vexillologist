import type { Country } from '$lib/types';

const CACHE_KEY = 'vexillologist_countries_v2';
const SCHEMA_VERSION = 2;

interface CachePayload {
	schemaVersion: number;
	fetchedAt: number;
	countries: Country[];
}

export let storageUnavailable = false;

export function loadCountries(): Country[] | null {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed: CachePayload = JSON.parse(raw);
		if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
		return parsed.countries;
	} catch {
		storageUnavailable = true;
		return null;
	}
}

export function saveCountries(countries: Country[]): void {
	try {
		const payload: CachePayload = {
			schemaVersion: SCHEMA_VERSION,
			fetchedAt: Date.now(),
			countries
		};
		localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
	} catch {
		storageUnavailable = true;
	}
}
