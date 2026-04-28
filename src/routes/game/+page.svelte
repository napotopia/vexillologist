<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import FlagImage from '$components/FlagImage.svelte';
	import Timer from '$components/Timer.svelte';
	import ChoiceGrid from '$components/ChoiceGrid.svelte';
	import ScoreBar from '$components/ScoreBar.svelte';
	import StreakBadge from '$components/StreakBadge.svelte';
	import {
		getState,
		startRound,
		submitAnswer,
		handleFlagError,
		resetToIdle
	} from '$lib/stores/game.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let gameState = $derived(getState());

	onMount(() => {
		startRound();
		return () => resetToIdle();
	});

	const runningScore = $derived(
		gameState.phase === 'question_active' || gameState.phase === 'feedback'
			? gameState.answered.reduce((s, a) => s + a.finalScore, 0)
			: 0
	);
</script>

<svelte:head>
	<title>Playing — Vexillologist</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 pt-8">
	<div class="w-full max-w-md space-y-4">

		{#if gameState.phase === 'loading'}
			<div class="text-center text-gray-500 py-16">Loading flags…</div>

		{:else if gameState.phase === 'error'}
			<div class="text-center py-16 space-y-4">
				<p class="text-red-600 font-medium">Could not load flag data.</p>
				<p class="text-sm text-gray-500">{gameState.message}</p>
				<button
					class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold min-h-[44px]"
					onclick={() => startRound()}
				>
					Retry
				</button>
			</div>

		{:else if gameState.phase === 'question_active'}
			<ScoreBar score={runningScore} currentFlag={gameState.round.currentIndex + 1} />
			<StreakBadge streak={gameState.streak} multiplier={gameState.multiplier} />
			<Timer timeLeft={gameState.timeLeft} />
			<FlagImage
				flagUrl={gameState.question.correct.flagUrl}
				flagAlt={gameState.question.correct.flagAlt}
				onError={() => handleFlagError(gameState.phase === 'question_active' ? gameState.round.currentIndex : 0)}
			/>
			<ChoiceGrid
				choices={gameState.question.choices}
				onSelect={submitAnswer}
				disabled={false}
			/>

		{:else if gameState.phase === 'feedback'}
			<ScoreBar score={runningScore} currentFlag={gameState.round.currentIndex + 1} />
			<StreakBadge streak={gameState.streak} multiplier={gameState.multiplier} />
			<div class="text-center py-2">
				{#if gameState.last.wasCorrect}
					<span class="text-green-600 font-bold text-lg">✓ Correct! +{gameState.last.finalScore}</span>
				{:else}
					<span class="text-red-600 font-bold text-lg">✗ {gameState.last.selectedCca3 ? 'Wrong' : 'Time up!'}</span>
				{/if}
			</div>
			<FlagImage
				flagUrl={gameState.last.question.correct.flagUrl}
				flagAlt={gameState.last.question.correct.flagAlt}
				onError={() => {}}
			/>
			<ChoiceGrid
				choices={gameState.last.question.choices}
				onSelect={() => {}}
				disabled={true}
				correctCca3={gameState.last.question.correct.cca3}
				selectedCca3={gameState.last.selectedCca3}
			/>

		{:else if gameState.phase === 'round_complete'}
			<div class="text-center space-y-4 py-8">
				<h1 class="text-2xl font-bold text-gray-900">Round complete!</h1>
				<p class="text-4xl font-black text-blue-700">{gameState.entry.totalScore.toLocaleString()}</p>
				<p class="text-gray-500">{gameState.entry.correctCount}/10 correct</p>
				<div class="flex gap-3 justify-center pt-4">
					<button
						class="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold min-h-[44px]"
						onclick={() => startRound()}
					>
						Play Again
					</button>
					<button
						class="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold min-h-[44px]"
						onclick={() => goto('/')}
					>
						Home
					</button>
				</div>
			</div>
		{/if}

	</div>
</main>
