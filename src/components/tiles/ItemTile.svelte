<script>
    import { fade } from "svelte/transition";

    export let index;
    export let item;
    export let onItemDelete;
    export let onClickItem;
    export let onClickItemEdit;
    export let onDrop;
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    };
    var onDragLeave = (e) => {
        dropLine = false;
    };

    var handleDragStart = (e) => {
        e.dataTransfer.setData("text", "i" + index.toString());
        e.dataTransfer.setData("object", JSON.stringify(item));
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onDrop(e, index);
    };
</script>

<style>
    .item {
        /* box-shadow: 1px 2px var(--box-shadow); */
        border: 1px solid var(--box-shadow);
        border-radius: 5px;
        width: 15em;
        /* do not use margin top/bottom, it will overflow */
        height: 95%;
        /* margin-right: 10px; */
        padding: 10px;
        display: inline-block;
        box-sizing: border-box;
        position: relative;
    }

    .close-icon {
        display: none;
    }

    .edit-icon {
        display: none;
    }
    .item:hover {
        background-color: var(--outline-btn-hover);
    }

    .item:hover .close-icon {
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
        background: -webkit-linear-gradient(
                -45deg,
                transparent 0%,
                transparent 46%,
                white 46%,
                white 56%,
                transparent 56%,
                transparent 100%
            ),
            -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, white
                        46%, white 56%, transparent 56%, transparent 100%);
        background-color: gray;
    }

    .item:hover .edit-icon {
        position: absolute;
        right: -16px;
        margin-right: 10px;
        top: 0;
        display: block;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border-width: 3px;
        border-style: solid;
        border-color: gray;
        border-radius: 100%;
        background-color: gray;
        transform: scaleX(-1);
    }

    .text-concat {
        position: relative;
        display: inline-block;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 2em;
        line-height: 1em;
        font-size: 1.2em;
    }
</style>

<div class="flex-row-container" style="height: 100%;">
    {#if dropLine}
        <div class="vl" style="border-color: var(--drop-indicator);" />
    {:else}
        <div class="vl" style="border-color: var(--bg);" />
    {/if}
    <div
        class="item"
        draggable="true"
        out:fade
        on:dragover|preventDefault={onDragEnter}
        on:dragleave={onDragLeave}
        on:dragstart={handleDragStart}
        on:drop={handleDrop}
        on:click|preventDefault={(e) => onClickItem(item, e)}>
        <button
            class="close-icon pointer"
            on:click|preventDefault|stopPropagation={() => onItemDelete(item, index)} />
        <button
            class="edit-icon pointer"
            on:click|preventDefault|stopPropagation={() => onClickItemEdit(item, index)}>
            <div style="color:white; margin-left: -5px; margin-top: -4px;">✎</div>
        </button>

        <div class="flex-row-container">
            <img
                alt=" "
                src={item.title.split(':::::')[1]}
                height="20px"
                style="margin-right: 10px;" />

            <div class="text-concat" title={item.title.split(':::::')[0]}>
                {item.title.split(':::::')[0]}
            </div>
        </div>
    </div>
</div>
