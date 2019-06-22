<script>
	export let title = '';
	export let step = '';
	export let noBorderTop = false;
</script>

<style>
	.card {
		margin-bottom: 20px;
	}
	span.step {
		display: inline-block;
		background: #f3f3f3;
		border: 1px solid #ddd;
		color: #bbb;
		width: 1.5em;
		height: 1.5em;
		line-height: 1.5em;
		text-align: center;
		margin-right: 1ex;
		font-size: 1.35rem;
	}
</style>

<div class:rounded-0={noBorderTop} class:border-top-0={noBorderTop} class="card shadow-sm">
	<div class="card-body">
		<h5 class="card-title">{#if step}<span class="step rounded-circle">{step}</span>{/if}{title}</h5>
		<slot />
	</div>
</div>
