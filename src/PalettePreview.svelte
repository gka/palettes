<script>
    import chroma from 'chroma-js';
    import { colorBlindSim } from'./colorBlind';
    import _range from 'lodash-es/range';

    export let colors = ['red']
    export let colors2 = [];
    export let numColors = 7;
    export let diverging = false;
    export let bezier;
    export let correctLightness;

    export let simulate = 'none';
    export let steps;

    $: even = numColors % 2 === 0;

    $: numColorsLeft = diverging ? Math.ceil(numColors/2) + (even?1:0) : numColors;
    $: numColorsRight = diverging ? Math.ceil(numColors/2) + (even?1:0) : 0;

    $: genColors = colors.length !== 1 ? colors : autoColors(colors[0], numColorsLeft);
    $: genColors2 = colors2.length !== 1 ? colors2 : autoColors(colors2[0], numColorsRight, true);

    $: stepsLeft = colors.length ? chroma.scale(bezier && colors.length>1 ? chroma.bezier(genColors) : genColors)
        .correctLightness(correctLightness)
        .colors(numColorsLeft) : [];

    $: stepsRight = diverging && colors2.length ? chroma.scale(bezier&& colors2.length>1 ? chroma.bezier(genColors2) : genColors2)
        .correctLightness(correctLightness)
        .colors(numColorsRight) : [];

    $: steps = (even && diverging ? stepsLeft.slice(0, stepsLeft.length-1) : stepsLeft).concat(stepsRight.slice(1));

    function autoGradient(color, numColors) {
        const lab = chroma(color).lab();
        const lRange = 100 * (0.95 - 1/numColors);
        const lStep = lRange / (numColors-1);
        let lStart = (100-lRange)*0.5;
        const range = _range(lStart, lStart+numColors*lStep, lStep);
        let offset = 0;
        if (!diverging) {
            offset = 9999;
            for (let i=0; i < numColors; i++) {
                let diff = lab[0] - range[i];
                if (Math.abs(diff) < Math.abs(offset)) {
                    offset = diff;
                }
            }
        }
        return range.map(l => chroma.lab([l + offset, lab[1], lab[2]]));
    }

    function autoColors(color, numColors, reverse=false) {
        if (diverging) {
            const colors = autoGradient(color, 3).concat(chroma('#f5f5f5'));
            if (reverse) colors.reverse();
            return colors;
        } else {
            return autoGradient(color, numColors);
        }
    }
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
    <div class="step" style="background: {simulate === 'none' ? step : colorBlindSim(step, simulate)}"></div>
    {/each}
</div>