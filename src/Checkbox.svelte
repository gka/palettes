<script>
    export let value = false;
    export let inline = true;
    export let label = '';
    const id = Math.round(Math.random()*1e7).toString(36);
</script>

<div class="custom-control custom-checkbox" class:custom-control-inline={inline}>
    <input bind:checked={value} type="checkbox" class="custom-control-input" id="{id}">
    <label class="custom-control-label" for="{id}">{label}</label>
</div>