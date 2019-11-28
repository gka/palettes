<script>
    export let steps = [];
</script>

<style>
    pre {
        padding: 1ex;
        background: #eee;
        white-space: pre-wrap;
    }
</style>

<pre>{steps}</pre>
<pre>'{steps.join(`', '`)}'</pre>
<pre>['{steps.join(`', '`)}']</pre>
<pre>{steps.join('\n')}</pre>
<pre>[{steps.map(c => '0x'+c.substr(1)).join(`,`)}]</pre>
<pre>
import &#123; scaleThreshold &#125; from 'd3-scale';

function palette(min, max) &#123;
    const d = (max-min)/{steps.length};
    return scaleThreshold()
        .range(['{steps.join(`', '`)}'])
        .domain([{steps.slice(1).map((v,i) => `min + d*${i+1}`)}]);
&#125;
</pre>