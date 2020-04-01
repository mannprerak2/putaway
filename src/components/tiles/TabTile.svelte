<script>
    import { fade, fly } from 'svelte/transition';

    export let tab;
    export let index;
    export let onClickTabCard;
    export let onTabTileClose;
    export let onDrop; // dont call directly, set dropline to false before calling
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    }
    var onDragLeave = (e) => {
        dropLine = false;
    }

    var handleDragStart = (e) => {
        e.dataTransfer
            .setData("text", "t" + index.toString());
        e.dataTransfer
            .setData("object", JSON.stringify(tab));
    }

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onDrop(e, index);
    }
</script>
<style>
    .card {
        /* box-shadow: 1px 2px var(--box-shadow); */
        border: 1px solid var(--box-shadow);
        border-radius: 5px;
        margin: 6px;
        padding: 8px;
        position: relative;
        height: 2em;
    }

    .card:hover {
        background-color: var(--outline-btn-hover);
        cursor: grab;
        /* padding: (p-1)px to prevent shifting */
        padding: 8px;
    }

    .close-icon {
        display: none;
    }

    .card:hover .close-icon {
        position: absolute;
        right: -16px;
        margin-right: 10px;
        bottom: 0;
        display: block;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border-width: 3px;
        border-style: solid;
        border-color: gray;
        border-radius: 100%;
        background: -webkit-linear-gradient(-45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        background-color: gray;
    }

    .text-concat {
        position: relative;
        display: inline-block;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 2em;
        line-height: 1em;
    }
</style>
<div in:fly="{{ x: 500, duration: 400 }}" out:fade>
    {#if dropLine}
        <hr style="border: 1px solid var(--drop-indicator);">
    {:else}
        <hr style="border: 1px solid var(--bg);">
    {/if}
    <div class="card" draggable="true" 
        on:dragover|preventDefault={onDragEnter}
        on:dragleave={onDragLeave}
        on:dragstart={handleDragStart}
        on:drop={handleDrop}
        on:click|preventDefault={()=>
        onClickTabCard(tab)}>
        <button class="close-icon" on:click|preventDefault|stopPropagation={()=> onTabTileClose(tab,index)}></button>

        <div class="flex-row-container">
            <img alt=' ' src={tab.favIconUrl} height="20px" style="margin-right: 10px;" />

            <div class="text-concat">
                {tab.title}
            </div>
        </div>
    </div>
</div>