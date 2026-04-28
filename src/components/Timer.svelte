<script lang="ts">
	let { timeLeft }: { timeLeft: number } = $props();

	const seconds = $derived(Math.ceil(timeLeft / 1000));
	const pct = $derived((timeLeft / 15_000) * 100);
	const urgent = $derived(timeLeft < 5_000);
</script>

<div class="w-full" aria-label={urgent ? 'Hurry!' : undefined}>
	<div class="flex justify-between items-center mb-1">
		<span class={`text-sm font-semibold ${urgent ? 'text-red-600' : 'text-gray-700'}`}>
			{#if urgent}⚠️ Hurry!{:else}Time{/if}
		</span>
		<span class={`text-lg font-bold tabular-nums ${urgent ? 'text-red-600' : 'text-gray-900'}`}>
			{seconds}s
		</span>
	</div>
	<div class="w-full bg-gray-200 rounded-full h-2">
		<div
			class={`h-2 rounded-full transition-all duration-100 ${urgent ? 'bg-red-500' : 'bg-blue-500'}`}
			style="width: {pct}%"
		></div>
	</div>
</div>
