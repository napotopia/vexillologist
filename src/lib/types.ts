export interface Country {
	cca3: string;
	name: string;
	flagUrl: string;
	flagAlt: string;
	region: string;
	subregion: string;
}

export interface FlagQuestion {
	correct: Country;
	distractors: [Country, Country, Country];
	choices: [Country, Country, Country, Country];
}

export interface Round {
	questions: FlagQuestion[];
	currentIndex: number;
	pool: Country[];
}

export interface AnsweredQuestion {
	question: FlagQuestion;
	selectedCca3: string | null;
	wasCorrect: boolean;
	secondsRemainingAtAnswer: number;
	baseScore: number;
	multiplierApplied: 1 | 1.5 | 2;
	finalScore: number;
}

export interface ScoreEntry {
	totalScore: number;
	correctCount: number;
	playedAt: number;
}

export type GameState =
	| { phase: 'idle' }
	| { phase: 'loading' }
	| { phase: 'error'; message: string }
	| {
			phase: 'question_active';
			round: Round;
			question: FlagQuestion;
			streak: number;
			multiplier: 1 | 1.5 | 2;
			timeLeft: number;
			answered: AnsweredQuestion[];
	  }
	| {
			phase: 'feedback';
			round: Round;
			last: AnsweredQuestion;
			streak: number;
			multiplier: 1 | 1.5 | 2;
			answered: AnsweredQuestion[];
	  }
	| {
			phase: 'round_complete';
			entry: ScoreEntry;
			answered: AnsweredQuestion[];
	  };
