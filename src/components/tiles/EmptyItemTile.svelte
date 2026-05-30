<!-- used for adding drop functionality at the last of the array -->
<script>
    import { dragActive } from "../../stores/stores.js";
    import { onDestroy } from "svelte";

    export let index;
    export let onDrop;
    let dropLine = false;
    let dragCounter = 0;

    var onDragEnter = (e) => {
        dragCounter++;
        if (dragCounter === 1) {
            dropLine = true;
        }
    };
    var onDragLeave = (e) => {
        dragCounter--;
        if (dragCounter === 0) {
            dropLine = false;
        }
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dragCounter = 0;
        dropLine = false;
        onDrop(e, index);
    };

    const unsubscribeDrag = dragActive.subscribe((active) => {
        if (!active) {
            dragCounter = 0;
            dropLine = false;
        }
    });

    onDestroy(() => {
        unsubscribeDrag();
    });
</script>

<style>
    .empty-item-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 100%;
    }
    .drop-indicator {
        width: 4px;
        height: 80%;
        border-radius: 2px;
        margin-right: 4px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background-color: transparent;
        flex-shrink: 0;
    }
    .drop-indicator.active {
        width: 6px;
        margin-right: 2px;
        background-color: var(--drop-indicator);
        box-shadow: 0 0 10px var(--drop-indicator);
    }
    .empty-dropzone {
        width: 120px;
        height: 90%;
        display: inline-block;
        box-sizing: border-box;
    }
</style>

<div class="empty-item-container">
    <div class="drop-indicator" class:active={dropLine}></div>
    <div
        class="empty-dropzone"
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondrop={handleDrop}></div>
</div>
