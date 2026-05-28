<!-- used for adding drop functionality at the last of the array -->
<script>
    export let index;
    export let onCollectionDrop;
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    };
    var onDragLeave = (e) => {
        dropLine = false;
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onCollectionDrop(e, index);
    };
</script>

<style>
    .drop-line-indicator {
        height: 3px;
        background: transparent;
        width: calc(100% - 40px);
        margin: 10px auto;
        border-radius: 2px;
        transition: all 0.2s ease;
    }
    .drop-line-indicator.active {
        background: var(--drop-indicator);
        box-shadow: 0 0 8px var(--drop-indicator);
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
