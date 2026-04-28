import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCountries } from './countries';

const mockApiResponse = [
	{
		cca3: 'PRT',
		name: { common: 'Portugal' },
		flags: { svg: 'https://flagcdn.com/pt.svg', alt: 'The flag of Portugal...' },
		region: 'Europe',
		subregion: 'Southern Europe'
	},
	{
		cca3: 'ESP',
		name: { common: 'Spain' },
		flags: { svg: 'https://flagcdn.com/es.svg', alt: 'The flag of Spain...' },
		region: 'Europe',
		subregion: 'Southern Europe'
	},
	{
		cca3: 'XYZ',
		name: { common: 'No Alt Country' },
		flags: { svg: 'https://example.com/flag.svg', alt: '' },
		region: 'Europe',
		subregion: ''
	}
];

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn());
});

describe('fetchCountries', () => {
	it('normalizes API response to Country shape', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockApiResponse
		} as Response);

		const countries = await fetchCountries();
		expect(countries[0]).toEqual({
			cca3: 'PRT',
			name: 'Portugal',
			flagUrl: 'https://flagcdn.com/pt.svg',
			flagAlt: 'The flag of Portugal...',
			region: 'Europe',
			subregion: 'Southern Europe'
		});
	});

	it('filters out entries with empty flagAlt', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockApiResponse
		} as Response);

		const countries = await fetchCountries();
		expect(countries.find((c) => c.cca3 === 'XYZ')).toBeUndefined();
		expect(countries).toHaveLength(2);
	});

	it('throws on non-OK response', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 503
		} as Response);

		await expect(fetchCountries()).rejects.toThrow('Failed to fetch countries: 503');
	});
});
