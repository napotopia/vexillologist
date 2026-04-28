<script lang="ts">
	import LeaderBoard from '$components/LeaderBoard.svelte';
</script>

<svelte:head>
	<title>Vexillologist — Flag Quiz</title>
	<meta name="description" content="Test your knowledge of the world's flags!" />
</svelte:head>

<main class="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 pt-12">
	<div class="w-full max-w-md space-y-8">

		<div class="text-center space-y-2">
			<h1 class="text-4xl font-black text-gray-900">🏳️ Vexillologist</h1>
			<p class="text-gray-500">How well do you know the world's flags?</p>
		</div>

		<a
			href="/game"
			class="block w-full text-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg min-h-[44px] transition-colors shadow-md"
		>
			Play
		</a>

		<LeaderBoard />

	</div>
</main>
