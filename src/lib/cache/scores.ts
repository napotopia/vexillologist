import type { ScoreEntry } from '$lib/types';

const SCORES_KEY = 'vexillologist_scores_v1';
const MAX_SCORES = 10;

interface ScoresPayload {
	scores: ScoreEntry[];
}

export function loadScores(): ScoreEntry[] {
	try {
		const raw = localStorage.getItem(SCORES_KEY);
		if (!raw) return [];
		const parsed: ScoresPayload = JSON.parse(raw);
		return parsed.scores ?? [];
	} catch {
		return [];
	}
}

export function saveScore(entry: ScoreEntry): void {
	try {
		const existing = loadScores();
		const merged = [...existing, entry]
			.sort((a, b) => b.totalScore - a.totalScore)
			.slice(0, MAX_SCORES);
		const payload: ScoresPayload = { scores: merged };
		localStorage.setItem(SCORES_KEY, JSON.stringify(payload));
	} catch {
		// storage unavailable — game proceeds without persistence
	}
}
