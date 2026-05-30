<script>
    import { dragActive } from "../../stores/stores.js";
    import { onDestroy } from "svelte";

    export let index;
    export let onDrop;
    let indicator = false;
    let dragCounter = 0;

    var onDragEnter = (e) => {
        dragCounter++;
        if (dragCounter === 1) {
            indicator = true;
        }
    };
    var onDragLeave = (e) => {
        dragCounter--;
        if (dragCounter === 0) {
            indicator = false;
        }
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dragCounter = 0;
        indicator = false;
        onDrop(e, index);
    };

    const unsubscribeDrag = dragActive.subscribe((active) => {
        if (!active) {
            dragCounter = 0;
            indicator = false;
        }
    });

    onDestroy(() => {
        unsubscribeDrag();
    });
</script>

<style>
    .no-items-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--icon-color);
        font-size: 0.85rem;
        font-weight: 500;
        border: 2px dashed var(--outline-btn-border);
        border-radius: 8px;
        background: transparent;
        transition: all 0.2s ease;
        margin: 4px;
        text-align: center;
        box-sizing: border-box;
    }
    .no-items-indicator.active {
        border-color: var(--drop-indicator);
        color: var(--drop-indicator);
        background: var(--accent-glow);
        box-shadow: 0 0 12px var(--accent-glow);
    }
    .text {
        padding: 0 16px;
    }
</style>

<div
    class="no-items-indicator"
    class:active={indicator}
    ondragover={(e) => e.preventDefault()}
    ondragenter={onDragEnter}
    ondragleave={onDragLeave}
    ondrop={handleDrop}>
    <span class="text">
        {#if indicator}
            Drop here to add tab
        {:else}
            Drag-n-drop tabs here OR save them via the extension popup
        {/if}
    </span>
</div>
