import type { Country } from '$lib/types';

const API_URL =
	'https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,cca3';

interface ApiCountry {
	cca3: string;
	name: { common: string };
	flags: { svg: string; alt: string };
	region: string;
	subregion: string;
}

export async function fetchCountries(): Promise<Country[]> {
	const response = await fetch(API_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch countries: ${response.status}`);
	}
	const data: ApiCountry[] = await response.json();
	return data
		.filter((c) => c.flags?.alt)
		.map((c) => ({
			cca3: c.cca3,
			name: c.name.common,
			flagUrl: c.flags.svg,
			flagAlt: c.flags.alt,
			region: c.region,
			subregion: c.subregion ?? ''
		}));
}
