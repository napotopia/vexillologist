<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>Vexillologist</title>
	<meta name="description" content="A flag guessing game — how well do you know the world's flags?" />
</svelte:head>

{@render children()}
