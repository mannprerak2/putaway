<script>
    import { fade } from "svelte/transition";
    export let title = '';
    export let xpos = "10";
    export let ypos = "-35"; /* Default position slightly above the cursor */
    export let fontsize = "0.75rem";
    let truncatedTitle = '';
    let isHovered = false;
    let x = 0;
    let y = 0;

    function mouseOver(event) {
        if (title.length > 50) {
            truncatedTitle = title.slice(0, 50) + '...';
        } else {
            truncatedTitle = title;
        }
        isHovered = true;
        x = event.clientX + parseInt(xpos);
        y = event.clientY + parseInt(ypos);
    }
    
    function mouseMove(event) {
        x = event.clientX + parseInt(xpos);
        y = event.clientY + parseInt(ypos);
    }
    
    function mouseLeave() {
        isHovered = false;
    }
</script>

<style>
    .tooltip {
        z-index: 10000;
        background-color: var(--glass-bg);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        position: fixed;
        border: 1px solid var(--glass-border);
        border-radius: 6px;
        padding: 6px 10px;
        color: var(--txt);
        box-shadow: 0 4px 12px var(--box-shadow);
        pointer-events: none; /* Prevents cursor flickering */
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
</style>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
    onmouseover={mouseOver}
    onmouseleave={mouseLeave}
    onmousemove={mouseMove}
    style="display: inline-block;">
    <slot />
</div>

{#if isHovered && truncatedTitle}
    <div in:fade={{ duration: 100 }} style="top: {y}px; left: {x}px; font-size: {fontsize};" class="tooltip">
        {truncatedTitle}
    </div>
{/if}
