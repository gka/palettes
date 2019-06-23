<script>
    import Icon from 'fa-svelte';
    import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
    import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
    import { colorBlindCheck } from'./colorBlind';

    $: result = colorBlindCheck(colors);

    export let colors = [];
    export let result = [];

    export let active = 'none';

    const types = ['none', 'deuteranopia', 'protanopia', 'tritanopia'];
</script>

<style>
.colorblind-sim {
    text-align: right;
    position: absolute;
    right: 20px;
    top: -46px;
}
.text-muted {
    padding-right: 1em;
    font-size: 0.85rem;
    padding-top: 6px;
}
.btn-group {
    margin-top: -20px;
}
</style>


<div class="colorblind-sim">
    {#if result.length}
    <p class="text-danger" style="text-align: right;"><Icon icon={faExclamationTriangle} /> This palette is not colorblind-safe.</p>
    {:else}
    <p class="text-secondary" style="text-align: right;"><Icon icon={faCheck} /> This palette is colorblind-safe.</p>
    {/if}
    <div class="btn-group btn-group-toggle" data-toggle="buttons">
        <div class="text-muted">simulate:</div>
        {#each types as type}
        <label class="btn btn-sm btn-light"
            class:text-danger="{result.indexOf(type) > -1}"
            class:active={active===type}>
            <input bind:group={active} value="{type}" type="radio" name="options" id="option1" autocomplete="off" checked={active===type}>{type === 'none' ? 'normal' : type.substr(0,4)+'.'}
        </label>
        {/each}
    </div>
</div>
