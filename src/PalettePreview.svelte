<script>
    import chroma from 'chroma-js';

    export let colors = ['red']
    export let colors2 = [];
    export let numColors = 7;
    export let diverging = false;
    export let bezier;
    export let correctLightness;

    export let steps;

    $: even = numColors % 2 === 0;

    $: numColorsLeft = diverging ? Math.ceil(numColors/2) + (even?1:0) : numColors;
    $: numColorsRight = diverging ? Math.ceil(numColors/2) + (even?1:0) : 0;

    $: stepsLeft = colors.length ? chroma.scale(bezier ? chroma.bezier(colors) : colors)
        .correctLightness(correctLightness)
        .colors(numColorsLeft) : [];

    $: stepsRight = diverging && colors2.length ? chroma.scale(bezier ? chroma.bezier(colors2) : colors2)
        .correctLightness(correctLightness)
        .colors(numColorsRight) : [];

    $: steps = (even && diverging ? stepsLeft.slice(0, stepsLeft.length-1) : stepsLeft).concat(stepsRight.slice(1))
</script>

<style>
    .palette {
        background: #eee;
        padding: 10px;
        display: flex;
        height: 100px;
    }
    .step {
       height: 100%;
       display: block;
       flex-grow: 1;
    }
</style>

<div class="palette">
    {#each steps as step}
    <div class="step" style="background: {step}"></div>
    {/each}
</div>