<script lang="ts">
	import type { Country } from '$lib/types';

	let {
		choices,
		onSelect,
		disabled = false,
		correctCca3 = null,
		selectedCca3 = null
	}: {
		choices: [Country, Country, Country, Country];
		onSelect: (cca3: string) => void;
		disabled?: boolean;
		correctCca3?: string | null;
		selectedCca3?: string | null;
	} = $props();

	function buttonClass(cca3: string, index: number): string {
		const base =
			'min-h-[44px] w-full px-3 py-3 rounded-lg border-2 text-left text-sm font-medium transition-colors';
		if (!disabled) return `${base} border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-400`;
		if (cca3 === correctCca3) return `${base} border-green-500 bg-green-50 text-green-800`;
		if (cca3 === selectedCca3 && cca3 !== correctCca3)
			return `${base} border-red-500 bg-red-50 text-red-800`;
		return `${base} border-gray-200 bg-gray-50 text-gray-400`;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;
		const digit = parseInt(event.key);
		if (digit >= 1 && digit <= 4) {
			onSelect(choices[digit - 1].cca3);
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="grid grid-cols-2 gap-3">
	{#each choices as choice, i}
		<button
			class={buttonClass(choice.cca3, i)}
			aria-label="Option {i + 1}: {choice.name}"
			onclick={() => !disabled && onSelect(choice.cca3)}
			{disabled}
		>
			<span class="text-xs text-gray-400 mr-1">{i + 1}.</span>
			{choice.name}
		</button>
	{/each}
</div>
