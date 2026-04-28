<script lang="ts">
	let { streak, multiplier }: { streak: number; multiplier: 1 | 1.5 | 2 } = $props();

	const visible = $derived(streak >= 3);
	const label = $derived(`${multiplier}×`);
	const cls = $derived(
		multiplier === 2
			? 'bg-yellow-400 text-yellow-900 animate-pulse'
			: 'bg-orange-300 text-orange-900'
	);
</script>

{#if visible}
	<div
		class={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${cls}`}
		aria-label="Streak multiplier {label}"
	>
		🔥 {label} streak ({streak} in a row)
	</div>
{/if}
