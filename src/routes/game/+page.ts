import type { PageLoad } from './$types';
import { loadCountries, saveCountries } from '$lib/cache/countries';
import { fetchCountries } from '$lib/api/countries';

export const load: PageLoad = async ({ fetch: _fetch }) => {
	let countries = loadCountries();
	if (!countries) {
		try {
			countries = await fetchCountries();
			saveCountries(countries);
		} catch {
			return { countries: null, fetchError: true };
		}
	}
	return { countries, fetchError: false };
};
