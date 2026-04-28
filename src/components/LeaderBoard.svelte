<script lang="ts">
	import { loadScores } from '$lib/cache/scores';

	const scores = $derived(loadScores());
</script>

<section aria-label="Personal leaderboard">
	<h2 class="text-lg font-bold text-gray-800 mb-3">Your Top Scores</h2>
	{#if scores.length === 0}
		<p class="text-gray-400 text-sm text-center py-6">No scores yet — play a round to start!</p>
	{:else}
		<ol class="space-y-2">
			{#each scores as entry, i}
				<li class="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
					<span class="text-gray-400 font-bold w-6 text-sm">#{i + 1}</span>
					<span class="font-black text-blue-700 text-lg flex-1 text-center">
						{entry.totalScore.toLocaleString()}
					</span>
					<span class="text-xs text-gray-400 text-right">
						{entry.correctCount}/10 correct<br />
						{new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(entry.playedAt))}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
