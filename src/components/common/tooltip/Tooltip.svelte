<script>
    import { fade } from "svelte/transition";
	export let title = '';
	export let xpos = "0";
	export let ypos = "25";
	export let fontsize = "1em";
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
		x = event.pageX + parseInt(xpos);
		y = event.pageY + parseInt(ypos);
	}
	function mouseMove(event) {
		x = event.pageX + parseInt(xpos);
		y = event.pageY + parseInt(ypos);
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
	<div in:fade style="top: {y}px; left: {x}px; font-size: {fontsize};" class="tooltip">{truncatedTitle}</div>
{/if}
