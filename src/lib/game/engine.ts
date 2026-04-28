import type { Country, FlagQuestion, Round } from '$lib/types';
import { selectDistractors } from './distractors';

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

export function buildRound(countries: Country[]): Round {
	if (countries.length < 13) {
		throw new Error('Insufficient country data');
	}
	const shuffled = shuffle(countries);
	const selected = shuffled.slice(0, 10);
	const pool = shuffled.slice(10);

	const questions: FlagQuestion[] = selected.map((correct) => {
		const distractors = selectDistractors(correct, countries);
		const choices = shuffle([correct, ...distractors]) as [Country, Country, Country, Country];
		return { correct, distractors, choices };
	});

	return { questions, currentIndex: 0, pool };
}

export function computeScore(secondsRemaining: number, multiplier: 1 | 1.5 | 2): number {
	const clamped = Math.max(0, Math.min(15, secondsRemaining));
	return (1000 + Math.floor(clamped) * 10) * multiplier;
}

export function nextMultiplier(streak: number): 1 | 1.5 | 2 {
	if (streak >= 6) return 2;
	if (streak >= 3) return 1.5;
	return 1;
}

export function replaceFlagOnError(round: Round, failedIndex: number): Round {
	if (round.pool.length === 0) return round;

	const [replacement, ...remainingPool] = round.pool;
	const distractors = selectDistractors(replacement, round.questions.map((q) => q.correct));
	const choices = shuffle([replacement, ...distractors]) as [Country, Country, Country, Country];
	const newQuestion: FlagQuestion = { correct: replacement, distractors, choices };

	const questions = [...round.questions];
	questions[failedIndex] = newQuestion;

	return { ...round, questions, pool: remainingPool };
}
