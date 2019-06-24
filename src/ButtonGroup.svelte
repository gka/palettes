<script>
	export let options = [];
	$: options2 = options.map(s => typeof s === 'string' ? {value:s, title:s} : s);
	export let value;
	export let label = '';
	const id = Math.round(Math.random()*1e7).toString(36);

</script>

<style>
	.btn-group {
		position: relative;
		top: -4px;
		padding-left:1ex;
		padding-right:1ex;
	}
</style>

<div class="btn-group btn-group-toggle" data-toggle="buttons">
    {#each options2 as option}
    <label class="btn btn-outline-secondary"
        class:active={value===option.value}>
        <input bind:group={value} value="{option.value}" type="radio" name="options" id="{id}" autocomplete="off" checked={value===option.value}>{option.title}
    </label>
    {/each}
</div>