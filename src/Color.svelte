<script>
    import chroma from 'chroma-js';
    import range from 'lodash-es/range';
    export let value = chroma('red');

    let open = false;

    function toggleEdit() {
        open = !open;
    }

    let colorName;

    $: lch = value.lch()
    $: lightness = range(-5,6)
        .map(l => lch[0] + Math.pow(l/8,2)*80*(l<0?-1:1))
        .map(l => chroma.lch(l, lch[1], lch[2]));
    $: saturation = range(-5,6)
        .map(s => Math.max(0, lch[1] + Math.pow(s/5,2)*80*(s<0?-1:1)))
        .map(s => chroma.lch(lch[0], s, lch[2]));
    $: hue = range(-5,6)
        .map(h => lch[2] + Math.pow(h/5,2)*80*(h<0?-1:1))
        .map(h => chroma.lch(lch[0], lch[1], h < 0 ? h + 360 : h > 360 ? h - 360 : h));
</script>

<style>
    span.badge {
        font-weight: normal;
        font-size: 100%;
        color: #000;
        position: relative;
    }
    .badge + .badge {
        margin-left: 1ex;

    }
    span.inverted {
        color: white;
    }
    .popover {
        position: absolute;
        top: 30px;
        left: -100px;
        width: 300px;
    }
    .color-row {
        display: flex;
        margin-bottom: 3px;
    }
    span.lbl {
        width: 8.333%
    }
    span.color {
        display: inline-block;
        height: 30px;
        width: 8.333%;
        border-left: 1px solid white;
        border-bottom: 1px solid white;
    }
    span.color:nth-child(7) {
        border: 2px solid black;
        margin-top:-1px;
        margin-right: 0px;
        height: 31px;
    }
    span.color:nth-child(8) {
        border-left: 0;
    }
</style>
<span
    on:mouseenter={toggleEdit}
    on:mouseleave={toggleEdit}
    on:click|stopPropagation="{() => false}"
    class:inverted={value.lab()[0]<50}
    class="badge shadow-sm"
    style="background: {value.hex()}">
    <span>{value.hex().substr(1)}</span>
    {#if open}
    <div style="position: absolute;top:0px;left:0;right:0;height: 40px">
        <div
            class="popover fade show bs-popover-bottom"
            role="tooltip" x-placement="bottom">
            <div class="arrow" style="left: 121px;"></div>
            <h3 class="popover-header"></h3>
            <div class="popover-body">
                <div class="color-row">
                    <span class="lbl">L</span>
                    {#each lightness as l}
                    <span on:click="{() => value = l}" class="color" style="background: {l.hex()}"></span>
                    {/each}
                </div>
                <div class="color-row">
                    <span class="lbl">S</span>
                    {#each saturation as c}
                    <span on:click="{() => value = c}" class="color" style="background: {c.hex()}"></span>
                    {/each}
                </div>
                <div class="color-row">
                    <span class="lbl">H</span>
                    {#each hue as c}
                    <span on:click="{() => value = c}" class="color" style="background: {c.hex()}"></span>
                    {/each}
                </div>
            </div>
        </div>
    </div>
    {/if}
</span>

