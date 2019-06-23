<script>
    import chroma from 'chroma-js';
    import { beforeUpdate, onMount } from 'svelte';
    import Checkbox from './Checkbox.svelte';
    import InputColors from './InputColors.svelte';
    import PalettePreview from './PalettePreview.svelte';
    import Export from './Export.svelte';
    import StepChart from './StepChart.svelte';
    import Card from './Card.svelte';
    import ColorBlindCheck from './ColorBlindCheck.svelte';

    export let name;

    let steps = [];
    let bezier = true;
    let correctLightness = true;

    let colors = '00429d,96ffea,lightyellow'.split(/\s*,\s*/).map(c => chroma(c));
    let colors2 = 'ffffe0,ff005e,93003a'.split(/\s*,\s*/).map(c => chroma(c));
    let numColors = 9;
    let mode = 'sequential';
    let simulate = 'none';

    if (window.location.hash) {
        readStateFromHash();
    }

    $: hash = [
        numColors,
        mode.substr(0,1),
        colors.map(c=>c.hex().substr(1)).join(','),
        colors2.length ? colors2.map(c=>c.hex().substr(1)).join(',') : '',
        correctLightness ? 1:0,
        bezier?1:0
    ].join('|');

    let _hash = '';
    let _mounted = false;
    let _mode = 'sequential';

    beforeUpdate(() => {
        if (hash !== _hash) {
            _hash = hash;
            window.location.hash = `#/${hash}`;
        }
        if (mode !== _mode) {
            if (mode === 'diverging' && !colors2.length) {
                colors2 = colors.slice(0).reverse();
            }
            _mode = mode;
        }
    });

    // onMount(() => {
    //     if (window.location.hash) {
    //         console.log('initial hash', window.location.hash);
    //         readStateFromHash();
    //     }
    //     _mounted = true;
    // })

    function readStateFromHash() {
        const parts = window.location.hash.substr(2).split('|');
        if (parts.length === 6) {
            setTimeout(() => {
                numColors = +parts[0];
                mode = parts[1] === 's' ? 'sequential' : 'diverging';
                _mode = mode;
                colors = parts[2].split(',').map(c => c && chroma(c));
                colors2 = parts[3] !== '' ? parts[3].split(',').map(c => c && chroma(c)) : [];
                correctLightness = parts[4] === '1';
                bezier = parts[5] === '1';
            })
        } else {
            window.location.hash = '';
        }
    }

    function hashChange() {
        if (window.location.hash !== `#/${hash}`) {
            // deserialize hash
            readStateFromHash();
        }
    }
</script>

<style>
    .head {
        margin: 1em 0 1em;
    }
    h1 {
    }
    select.custom-select {
        display: inline-block;
        width: auto;
        font-size: inherit;
        padding: 0.4em 1.7em 0.4em 0.4em;
        margin: 0px 0.7ex 5px;
    }
    input[type=number] {
        width: 4em;
        text-align: center;
        margin: 0px 0.7ex 5px;
    }
    p { margin-bottom: 0 }
    .foot {
        margin-bottom: 1em;
    }
    :global(.fa-svelte) {
        vertical-align: sub;
    }
</style>

<svelte:window on:hashchange={hashChange} />

<div class="container">
    <div class="head">
        <h1>Chroma.js Color Palette Helper</h1>
        <p>This <a href="https://github.com/gka/chroma.js" target="_blank">chroma.js</a>-powered tool is here to help us  <a target="_blank" href="http://vis4.net/blog/posts/mastering-multi-hued-color-scales/">mastering multi-hued, multi-stops color scales</a>.</p>
    </div>
    <Card step="1" title="What kind of palette do you want to create?">
        <p>I want to create a
            <select bind:value={mode} class="custom-select">
                <option>sequential</option>
                <option>diverging</option>
                <!-- <option>qualitative</option> -->
            </select>
        color palette with <input type="number" min="2" bind:value={numColors} /> colors.</p>
    </Card>

    <Card step="2" title="Select and arrange input colors">
        <InputColors diverging="{mode==='diverging'}" bind:colors bind:colors2 />
    </Card>

    <Card step="3" title="Check and configure the resulting palette">
        <div class="row" style="margin-bottom: 10px">
            <div class="col">
                <Checkbox bind:value={correctLightness} label="correct lightness" />
                <Checkbox bind:value={bezier} label="bezier interpolation" />
            </div>
            <div class="col">
                <ColorBlindCheck bind:colors={steps} bind:active={simulate} />
            </div>
        </div>
        <PalettePreview
            bind:steps
            bind:correctLightness
            bind:bezier
            bind:colors
            bind:colors2
            diverging="{mode === 'diverging'}"
            simulate={simulate}
            bind:numColors />
        <div class="row">
            <div class="col">
                <StepChart title="lightness" steps={steps} mode={0} />
            </div>
            <div class="col">
                <StepChart title="saturation" steps={steps} mode={1} />
            </div>
            <div class="col">
                <StepChart title="hue" steps={steps} mode={2} />
            </div>
        </div>
    </Card>

    <Card step="4" title="Export the color codes in various formats">
        <Export steps={steps} />
    </Card>
    <div class="foot">
        <hr>
        <p>Created by <a href="https://vis4.net/blog">Gregor Aisch</a> for the sake of better
        use of colors in maps and data visualizations. Feel free to <a href="https://github.com/gka/palettes">fork on Github</a>.</p>
    </div>
</div>