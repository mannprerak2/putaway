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
    .empty-item-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 100%;
    }
    .drop-indicator {
        width: 3px;
        height: 80%;
        border-radius: 2px;
        margin-right: 6px;
        transition: all 0.2s ease;
        background-color: transparent;
    }
    .drop-indicator.active {
        background-color: var(--drop-indicator);
        box-shadow: 0 0 8px var(--drop-indicator);
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
