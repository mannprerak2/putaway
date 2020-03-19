<script>
    import { fade } from 'svelte/transition';

    export let index;
    export let item;
    export let onItemDelete;
    export let onClickItem;
    export let onDrop;
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    }
    var onDragLeave = (e) => {
        dropLine = false;
    }

    var handleDragStart = (e) => {
        e.dataTransfer
            .setData("text", "i" + index.toString());
        e.dataTransfer
            .setData("object", JSON.stringify(item));
    }

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onDrop(e, index);
    }
</script>
<style>
    .item {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
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
        background: -webkit-linear-gradient(-45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        background-color: gray;
    }

    .close-icon:hover {
        cursor: pointer;
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
        <div class="vl" style="border-color: black;"/>
    {:else}
        <div class="vl" style="border-color: white;"/>
    {/if}
    <div class="item" draggable="true" out:fade on:dragover|preventDefault={onDragEnter} on:dragleave={onDragLeave}
        on:dragstart={handleDragStart} on:drop={handleDrop} on:click|preventDefault={(e)=>
        onClickItem(item,e)}>
        <button class="close-icon" on:click|preventDefault|stopPropagation={()=> onItemDelete(item,index)}></button>

        <div class="flex-row-container">
            <img alt=' ' src={item.title.split(":::::")[1]} height="20px" style="margin-right: 10px;" />

            <div class="text-concat" title={item.title.split(":::::")[0]}>
                {item.title.split(':::::')[0]}
            </div>
        </div>
    </div>
</div>