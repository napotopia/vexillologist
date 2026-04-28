<script lang="ts">
	let { score, currentFlag }: { score: number; currentFlag: number } = $props();
</script>

<div class="flex justify-between items-center text-sm font-medium text-gray-700">
	<span>Flag <strong>{currentFlag}</strong>/10</span>
	<span>Score: <strong class="text-blue-700">{score.toLocaleString()}</strong></span>
</div>
