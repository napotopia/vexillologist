import type { Country } from '$lib/types';

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

export function selectDistractors(
	correct: Country,
	pool: Country[]
): [Country, Country, Country] {
	const candidates = pool.filter((c) => c.cca3 !== correct.cca3);

	const sameRegion = shuffle(candidates.filter((c) => c.region === correct.region));
	const sameSubregion = shuffle(
		candidates.filter(
			(c) => c.subregion === correct.subregion && c.region !== correct.region
		)
	);
	const rest = shuffle(
		candidates.filter(
			(c) => c.region !== correct.region && c.subregion !== correct.subregion
		)
	);

	const ordered = [...sameRegion, ...sameSubregion, ...rest];
	if (ordered.length < 3) {
		throw new Error('Insufficient countries to generate distractors');
	}
	return [ordered[0], ordered[1], ordered[2]];
}
