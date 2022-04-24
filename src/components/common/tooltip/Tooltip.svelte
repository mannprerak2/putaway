<script>
    import { fade } from "svelte/transition";
	export let title = '';
	let truncatedTitle = ''
	let isHovered = false;
	let x;
	let y;

	function mouseOver(event) {
		if (title.length > 50){
			truncatedTitle = title.slice(0,50) + '...'
		} else {
			truncatedTitle = title
		}
		isHovered = true;
		x = event.pageX;
		y = event.pageY + 25;
	}
	function mouseMove(event) {
		x = event.pageX;
		y = event.pageY + 25;
	}
	function mouseLeave() {
		isHovered = false;
	}
</script>

<style>
	.tooltip{
		z-index: 3;
		background-color: var(--bg);
		position: absolute;
		border: 1px solid #aaa;
		border-radius: 5px;
		padding: 4px;
	}
</style>

<div
	on:mouseover={mouseOver}
    on:mouseleave={mouseLeave}
	on:mousemove={mouseMove}>
	<slot />
</div>

{#if isHovered}
	<div in:fade style="top: {y}px; left: {x}px;" class="tooltip">{truncatedTitle}</div>
{/if}
