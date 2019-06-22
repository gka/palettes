<script>
    import { scaleLinear } from 'd3-scale';
    import { extent } from 'd3-array';
    import { line, curveStepAfter } from 'd3-shape';
    import chroma from 'chroma-js';

    let div;
    let width;
    $: height = width * 0.7;
    export let title = '';

    const padding = {
        left: 30,
        right: 10,
        top: 20,
        bottom: 20
    };

    export let steps = [];
    export let mode = 0;

    $: values = steps.map(c => chroma(c).lch()[mode]).map(mode === 2 ? h=>h > 180 ? h-360:h: d=>d);
    $: values2 = values.concat(values[values.length-1]);

    $: xScale = scaleLinear()
        .domain([0, steps.length])
        .range([padding.left, width - padding.right]);

    $: minDomain = mode === 1 ? 80 : 50;
    let yDomain;
    $: {
        yDomain = extent(values);
        let diff = Math.abs(yDomain[1] - yDomain[0]);
        if (diff < minDomain) {
            yDomain[0] -= (minDomain-diff)*0.5;
            yDomain[1] += (minDomain-diff)*0.5;
            yDomain = yDomain;
        }
    }

    $: yScale = scaleLinear()
        .domain(yDomain)
        .nice()
        .rangeRound([height - padding.bottom, padding.top]);

    $: y0 = yScale.domain()[0];
    $: y1 = yScale.domain()[1];

    $: lineGen = line().x((v,i) => xScale(i)).y(yScale).curve(curveStepAfter);
    $: path = lineGen(values2);


</script>

<style>
    h4 {
        font-size: 1rem;
    }
    svg {
        width: 100%;
    }
    path {
        fill: none;
        stroke: black;
        stroke-width: 2;
    }
    text {
        dominant-baseline: central;
        font-size: 13px;
        text-anchor: end;
    }
    line {
        fill: none;
        stroke: #ddd;
    }
    line.direct {
        stroke-width: 2;
        stroke: #ccc;
        stroke-dasharray: 6,4;
    }
</style>

<div bind:clientWidth={width} style="margin-top: 1em">
    <h4>{title}</h4>
    <svg height={height || 50}>
        {#if values.length}
            {#each yScale.ticks(6) as y}
            <text x="{padding.left-5}" y="{yScale(y)}">{y}</text>
            <line x1="{padding.left}" x2="{width-padding.right}" transform="translate(0,{yScale(y)})" />
            {/each}
            <line
                class="direct"
                x1="{padding.left}"
                x2="{width-padding.right}"
                y1="{yScale(values[0])}"
                y2="{yScale(values[values.length-1])}" />
            <path d={path} />
        {/if}
    </svg>
</div>