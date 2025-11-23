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
</style>

<div>
    {#if dropLine}
        <hr style="border: 1px solid var(--drop-indicator);" />
    {:else}
        <hr style="border: 1px solid var(--bg);" />
    {/if}
    <div
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondrop={handleDrop}
        style="height: 200px;" />
</div>
