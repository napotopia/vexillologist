import type { Country, GameState, AnsweredQuestion } from '$lib/types';
import { buildRound, computeScore, nextMultiplier, replaceFlagOnError } from '$lib/game/engine';
import { loadCountries, saveCountries } from '$lib/cache/countries';
import { saveScore } from '$lib/cache/scores';
import { fetchCountries } from '$lib/api/countries';

const ROUND_DURATION_MS = 15_000;
const FEEDBACK_DURATION_MS = 1_500;
const TICK_INTERVAL_MS = 100;

let state = $state<GameState>({ phase: 'idle' });
let timerStart = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

function clearTimer() {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

function startTimer() {
	clearTimer();
	timerStart = performance.now();
	intervalId = setInterval(() => {
		if (state.phase !== 'question_active') {
			clearTimer();
			return;
		}
		const elapsed = performance.now() - timerStart;
		const timeLeft = Math.max(0, ROUND_DURATION_MS - elapsed);
		state = { ...state, timeLeft };
		if (timeLeft === 0) {
			handleTimeout();
		}
	}, TICK_INTERVAL_MS);
}

function handleTimeout() {
	if (state.phase !== 'question_active') return;
	clearTimer();
	const { round, question, streak: _streak, answered } = state;
	const answered_q: AnsweredQuestion = {
		question,
		selectedCca3: null,
		wasCorrect: false,
		secondsRemainingAtAnswer: 0,
		baseScore: 0,
		multiplierApplied: 1,
		finalScore: 0
	};
	const allAnswered = [...answered, answered_q];
	state = { phase: 'feedback', round, last: answered_q, streak: 0, multiplier: 1, answered: allAnswered };
	setTimeout(() => advanceAfterFeedback(round, allAnswered, 0, 1), FEEDBACK_DURATION_MS);
}

function advanceAfterFeedback(
	round: typeof state extends { phase: 'feedback' } ? typeof state['round'] : never,
	answered: AnsweredQuestion[],
	streak: number,
	multiplier: 1 | 1.5 | 2
) {
	const nextIndex = answered.length;
	if (nextIndex >= 10) {
		const totalScore = answered.reduce((sum, a) => sum + a.finalScore, 0);
		const correctCount = answered.filter((a) => a.wasCorrect).length;
		const entry = { totalScore, correctCount, playedAt: Date.now() };
		saveScore(entry);
		state = { phase: 'round_complete', entry, answered };
		return;
	}
	const updatedRound = { ...round, currentIndex: nextIndex };
	const question = updatedRound.questions[nextIndex];
	state = {
		phase: 'question_active',
		round: updatedRound,
		question,
		streak,
		multiplier,
		timeLeft: ROUND_DURATION_MS,
		answered
	};
	startTimer();
}

export function getState(): GameState {
	return state;
}

export async function startRound() {
	state = { phase: 'loading' };
	try {
		let countries = loadCountries();
		if (!countries) {
			countries = await fetchCountries();
			saveCountries(countries);
		}
		const round = buildRound(countries);
		state = {
			phase: 'question_active',
			round,
			question: round.questions[0],
			streak: 0,
			multiplier: 1,
			timeLeft: ROUND_DURATION_MS,
			answered: []
		};
		startTimer();
	} catch (e) {
		state = { phase: 'error', message: e instanceof Error ? e.message : 'Unknown error' };
	}
}

export function submitAnswer(selectedCca3: string) {
	if (state.phase !== 'question_active') return;
	clearTimer();
	const { round, question, streak, multiplier, answered } = state;
	const elapsed = performance.now() - timerStart;
	const secondsRemaining = Math.max(0, (ROUND_DURATION_MS - elapsed) / 1000);
	const wasCorrect = selectedCca3 === question.correct.cca3;
	const newStreak = wasCorrect ? streak + 1 : 0;
	const newMultiplier = nextMultiplier(newStreak);
	const baseScore = wasCorrect ? computeScore(secondsRemaining, multiplier) : 0;
	const answeredQ: AnsweredQuestion = {
		question,
		selectedCca3,
		wasCorrect,
		secondsRemainingAtAnswer: Math.floor(secondsRemaining),
		baseScore: wasCorrect ? 1000 + Math.floor(secondsRemaining) * 10 : 0,
		multiplierApplied: multiplier,
		finalScore: baseScore
	};
	const allAnswered = [...answered, answeredQ];
	state = { phase: 'feedback', round, last: answeredQ, streak: newStreak, multiplier: newMultiplier, answered: allAnswered };
	setTimeout(() => advanceAfterFeedback(round, allAnswered, newStreak, newMultiplier), FEEDBACK_DURATION_MS);
}

export function handleFlagError(questionIndex: number) {
	if (state.phase !== 'question_active') return;
	const updatedRound = replaceFlagOnError(state.round, questionIndex);
	state = { ...state, round: updatedRound, question: updatedRound.questions[updatedRound.currentIndex] };
}

export function resetToIdle() {
	clearTimer();
	state = { phase: 'idle' };
}
