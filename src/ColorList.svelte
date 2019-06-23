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

    function dragstart(event, index) {
        event.dataTransfer.setData('index', index);
    }

    function dragover(event) {
        event.dataTransfer.dropEffect = 'move';
    }

    function drop(event) {
        const index = event.dataTransfer.getData('index');
        const newIndex = findIndex(event.target);
        const col = colors.splice(index, 1, null)[0];
        colors.splice(newIndex, 0, col);
        colors = colors.filter(c => c !== null);
    }

    function findIndex(el) {
        const siblings = el.parentNode.children;
        for (let i=0; i<siblings.length; i++) {
            if (siblings[i] === el) return i;
        }
        return -1;
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
    span.inv {
        display: inline-block;
        width: 60px;
        background: white;
        height: 100%;
        vertical-align: bottom;
    }
</style>

<input class:hidden={!edit} bind:this={input} type="text" class="form-control" bind:value={colorString} on:blur={exitEditMode}>
{#if !edit}
<div
    on:drop|preventDefault="{(event) => drop(event)}"
    on:dragover|preventDefault="{(event) => dragover(event)}"
    class="form-control"
    on:click={enterEditMode}>
    {#each colors as color,i}
    <Color
        bind:value={color}
        on:dragstart="{(event) => dragstart(event, i)}" />
    {/each}
    <span class="inv"></span>
</div>
{/if}