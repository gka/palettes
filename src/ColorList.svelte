<script>
    import chroma from 'chroma-js';
    import Color from './Color.svelte';

	export let colors;
	let edit = false;
	let input;

	let colorString = '';

	function enterEditMode() {
		edit = true;
		colorString = colors.map(c => c.name()).join(', ');
		input.focus();
	}

	function exitEditMode() {
		edit = false;
		colors = colorString
			.split(/\s*[,|\s]\s*/)
			.filter(c => chroma.valid(c))
			.map(c => chroma(c));
	}
</script>

<style>
	div.form-control {
		cursor: text;
	}
	.hidden {
		position: absolute;
		opacity: 0;
		left: -99999px;
	}
</style>

<input class:hidden={!edit} bind:this={input} type="text" class="form-control" bind:value={colorString} on:blur={exitEditMode}>
{#if !edit}
<div class="form-control" on:click={enterEditMode}>
    {#each colors as color}
    <Color bind:value={color} />
    {/each}
</div>
{/if}