<script>
    import ColorList from './ColorList.svelte';
    export let colors = [];
    export let colors2 = [];
    export let diverging = false;
</script>

<style>

</style>

<div class="row">
    <div class="col">
        <ColorList bind:colors />
    </div>
    {#if diverging}
    <div class="col">
        <ColorList bind:colors={colors2} />
    </div>
    {/if}
</div>