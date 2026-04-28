import { describe, it, expect, beforeEach } from 'vitest';
import { loadCountries, saveCountries } from './countries';
import type { Country } from '$lib/types';

const sample: Country[] = [
	{
		cca3: 'PRT',
		name: 'Portugal',
		flagUrl: 'https://flagcdn.com/pt.svg',
		flagAlt: 'The flag of Portugal...',
		region: 'Europe',
		subregion: 'Southern Europe'
	}
];

beforeEach(() => {
	localStorage.clear();
});

describe('countries cache', () => {
	it('returns null on cache miss', () => {
		expect(loadCountries()).toBeNull();
	});

	it('round-trips countries through localStorage', () => {
		saveCountries(sample);
		const loaded = loadCountries();
		expect(loaded).toEqual(sample);
	});

	it('returns null when schema version mismatches', () => {
		localStorage.setItem(
			'vexillologist_countries_v2',
			JSON.stringify({ schemaVersion: 1, fetchedAt: Date.now(), countries: sample })
		);
		expect(loadCountries()).toBeNull();
	});

	it('returns null on corrupt JSON', () => {
		localStorage.setItem('vexillologist_countries_v2', 'not-json{{{');
		expect(loadCountries()).toBeNull();
	});
});
