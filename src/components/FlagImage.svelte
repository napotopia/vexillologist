<script lang="ts">
	let { flagUrl, flagAlt, onError }: { flagUrl: string; flagAlt: string; onError: () => void } =
		$props();
</script>

<div class="flex items-center justify-center w-full">
	<img
		src={flagUrl}
		alt={flagAlt}
		loading="eager"
		class="max-w-full max-h-48 object-contain rounded shadow-md"
		onerror={onError}
	/>
</div>
