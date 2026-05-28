<!-- used for adding drop functionality at the last of the array -->
<script>
    export let index;
    export let onDrop;
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
        onDrop(e, index);
    };
</script>

<style>
    .drop-indicator-line {
        height: 3px;
        background: transparent;
        width: calc(100% - 8px);
        margin: 0 auto;
        border-radius: 2px;
        transition: all 0.2s ease;
    }
    .drop-indicator-line.active {
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
    <div class="drop-indicator-line" class:active={dropLine}></div>
    <div
        class="empty-dropzone"
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondrop={handleDrop}></div>
</div>
