<!-- used for adding drop functionality at the last of the array -->
<script>
    import { dragActive } from "../../stores/stores.js";
    import { onDestroy } from "svelte";

    export let index;
    export let onCollectionDrop;
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
        onCollectionDrop(e, index);
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
    .drop-line-indicator {
        height: 4px;
        background: transparent;
        width: calc(100% - 40px);
        margin: 10px auto;
        border-radius: 2px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .drop-line-indicator.active {
        background: var(--drop-indicator);
        box-shadow: 0 0 10px var(--drop-indicator);
    }
    .empty-dropzone {
        height: 120px;
        width: 100%;
        box-sizing: border-box;
    }
</style>

<div>
    <div class="drop-line-indicator" class:active={dropLine}></div>
    <div
        class="empty-dropzone"
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondrop={handleDrop}></div>
</div>
