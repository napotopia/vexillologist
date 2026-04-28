import { describe, it, expect } from 'vitest';
import { selectDistractors } from './distractors';
import type { Country } from '$lib/types';

function makeCountry(cca3: string, region: string, subregion = ''): Country {
	return {
		cca3,
		name: cca3,
		flagUrl: `https://flagcdn.com/${cca3.toLowerCase()}.svg`,
		flagAlt: `Flag of ${cca3}`,
		region,
		subregion
	};
}

const europe = ['ESP', 'FRA', 'DEU', 'ITA', 'NLD'].map((c) => makeCountry(c, 'Europe', 'Western Europe'));
const africa = ['NGA', 'KEN', 'ZAF'].map((c) => makeCountry(c, 'Africa', 'Sub-Saharan Africa'));
const correct = makeCountry('PRT', 'Europe', 'Western Europe');
const pool = [...europe, ...africa, correct];

describe('selectDistractors', () => {
	it('returns exactly 3 distractors', () => {
		const result = selectDistractors(correct, pool);
		expect(result).toHaveLength(3);
	});

	it('never includes the correct country', () => {
		const result = selectDistractors(correct, pool);
		expect(result.find((c) => c.cca3 === correct.cca3)).toBeUndefined();
	});

	it('all distractors are distinct', () => {
		const result = selectDistractors(correct, pool);
		const codes = result.map((c) => c.cca3);
		expect(new Set(codes).size).toBe(3);
	});

	it('prefers same-region countries', () => {
		const result = selectDistractors(correct, pool);
		const europeanDistractors = result.filter((c) => c.region === 'Europe');
		expect(europeanDistractors.length).toBe(3);
	});

	it('falls back to full pool when region is small', () => {
		const smallPool = [
			makeCountry('AAA', 'Europe', 'Western Europe'),
			makeCountry('BBB', 'Africa', 'North Africa'),
			makeCountry('CCC', 'Asia', 'East Asia'),
			correct
		];
		const result = selectDistractors(correct, smallPool);
		expect(result).toHaveLength(3);
		expect(result.find((c) => c.cca3 === correct.cca3)).toBeUndefined();
	});

	it('throws when pool has fewer than 3 other countries', () => {
		const tinyPool = [makeCountry('AAA', 'Europe'), makeCountry('BBB', 'Europe'), correct];
		expect(() => selectDistractors(correct, tinyPool)).toThrow('Insufficient countries');
	});
});
