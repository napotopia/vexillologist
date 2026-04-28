import { describe, it, expect } from 'vitest';
import { buildRound, computeScore, nextMultiplier, replaceFlagOnError } from './engine';
import type { Country } from '$lib/types';

function makeCountry(cca3: string, region = 'Europe'): Country {
	return {
		cca3,
		name: cca3,
		flagUrl: `https://flagcdn.com/${cca3.toLowerCase()}.svg`,
		flagAlt: `Flag of ${cca3}`,
		region,
		subregion: 'Western Europe'
	};
}

const regions = ['Europe', 'Africa', 'Americas', 'Asia', 'Oceania'];
const largePool: Country[] = Array.from({ length: 60 }, (_, i) =>
	makeCountry(`C${String(i).padStart(2, '0')}`, regions[i % 5])
);

describe('computeScore', () => {
	it('returns 1150 for 15s remaining at 1x', () => {
		expect(computeScore(15, 1)).toBe(1150);
	});

	it('returns 1000 for 0s remaining at 1x', () => {
		expect(computeScore(0, 1)).toBe(1000);
	});

	it('applies 1.5x multiplier', () => {
		expect(computeScore(10, 1.5)).toBe((1000 + 100) * 1.5);
	});

	it('applies 2x multiplier', () => {
		expect(computeScore(5, 2)).toBe((1000 + 50) * 2);
	});

	it('floors fractional seconds', () => {
		expect(computeScore(7.9, 1)).toBe(1070);
	});

	it('clamps to [0, 15]', () => {
		expect(computeScore(-1, 1)).toBe(1000);
		expect(computeScore(20, 1)).toBe(1150);
	});
});

describe('nextMultiplier', () => {
	it('returns 1 for streak 0-2', () => {
		expect(nextMultiplier(0)).toBe(1);
		expect(nextMultiplier(2)).toBe(1);
	});

	it('returns 1.5 for streak 3-5', () => {
		expect(nextMultiplier(3)).toBe(1.5);
		expect(nextMultiplier(5)).toBe(1.5);
	});

	it('returns 2 for streak 6+', () => {
		expect(nextMultiplier(6)).toBe(2);
		expect(nextMultiplier(100)).toBe(2);
	});
});

describe('buildRound', () => {
	it('returns a round with exactly 10 questions', () => {
		const round = buildRound(largePool);
		expect(round.questions).toHaveLength(10);
	});

	it('all questions have distinct correct countries', () => {
		const round = buildRound(largePool);
		const codes = round.questions.map((q) => q.correct.cca3);
		expect(new Set(codes).size).toBe(10);
	});

	it('each question has exactly 4 choices including the correct answer', () => {
		const round = buildRound(largePool);
		for (const q of round.questions) {
			expect(q.choices).toHaveLength(4);
			expect(q.choices.find((c) => c.cca3 === q.correct.cca3)).toBeDefined();
		}
	});

	it('throws with fewer than 13 countries', () => {
		expect(() => buildRound(largePool.slice(0, 12))).toThrow('Insufficient country data');
	});
});

describe('replaceFlagOnError', () => {
	it('replaces the failed question with a pool entry', () => {
		const round = buildRound(largePool);
		const originalCca3 = round.questions[0].correct.cca3;
		const updated = replaceFlagOnError(round, 0);
		expect(updated.questions[0].correct.cca3).not.toBe(originalCca3);
	});

	it('reduces pool size by 1', () => {
		const round = buildRound(largePool);
		const poolSize = round.pool.length;
		const updated = replaceFlagOnError(round, 0);
		expect(updated.pool).toHaveLength(poolSize - 1);
	});

	it('returns round unchanged when pool is empty', () => {
		const round = buildRound(largePool);
		const emptyPool = { ...round, pool: [] };
		const updated = replaceFlagOnError(emptyPool, 0);
		expect(updated).toBe(emptyPool);
	});
});
