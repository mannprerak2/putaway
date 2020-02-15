<!-- used for adding drop functionality at the last of the array -->
<script>
    export let index;
    export let onDrop;
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    }
    var onDragLeave = (e) => {
        dropLine = false;
    }

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onDrop(e, index);
    }
</script>
<style>
</style>
<div class="flex-row-container" style="height: 100%;">
    {#if dropLine}
    <div class="vl" style="border-color: black;"/>
    {:else}
    <div class="vl" style="border-color: white;"/>
    {/if}
    <div on:dragover|preventDefault={onDragEnter} on:dragleave={onDragLeave} on:drop={handleDrop}
        style="width: 200px; height: 100%; display: inline-block">
    </div>
</div>