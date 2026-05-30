<script>
    import { fade } from "svelte/transition";
    import { onDestroy } from "svelte";
    import { getItemTileWidth } from '../../services/hooks.js'
    import { dragActive, dragType } from "../../stores/stores.js";

    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faPenAlt } from "@fortawesome/free-solid-svg-icons/faPenAlt";
    import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
    import { faEllipsisV } from "@fortawesome/free-solid-svg-icons/faEllipsisV";


    export let index;
    export let item;
    export let onItemDelete;
    export let onClickItem;
    export let onClickItemEdit;
    export let onDrop;
    let tileWidth = getItemTileWidth();
    let dropLine = false;
    let dragging = false;
    let showMenu = false;
    let dragCounter = 0;

    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        showMenu = !showMenu;
    }

    function closeMenu() {
        showMenu = false;
    }

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

    var handleDragStart = (e) => {
        dragging = true;
        dragActive.set(true);
        dragType.set("item");
        e.dataTransfer.setData("text", "i" + index.toString());
        e.dataTransfer.setData("object", JSON.stringify(item));
    };

    var handleDragEnd = (e) => {
        dragging = false;
        dragActive.set(false);
        dragType.set("");
        dragCounter = 0;
        dropLine = false;
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
    .item-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 100%;
    }

    .item {
        border: 1px solid var(--outline-btn-border);
        border-radius: 8px;
        background: var(--tile-bg);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        height: 90%;
        padding: 4px 8px;
        display: inline-block;
        box-sizing: border-box;
        position: relative;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        overflow: hidden;
    }

    .item.menu-open {
        overflow: visible;
        z-index: 10;
    }

    .item.dragging {
        opacity: 0.35;
        border-style: dashed;
        transform: scale(0.95);
    }

    .item:hover {
        background-color: var(--card-hover-bg);
        border-color: var(--icon-color);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--box-shadow);
    }

    .item-inner {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding-right: 16px; /* leave room for hover actions */
        box-sizing: border-box;
    }

    .item-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        border-radius: 4px;
        flex-shrink: 0;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.15));
    }

    .text-concat {
        position: relative;
        display: inline-block;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 2em;
        line-height: 1.05em;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--txt);
    }

    .tile-actions {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .item:hover .tile-actions,
    .tile-actions.menu-active {
        opacity: 1;
    }

    .action-hover-btn {
        width: 18px;
        height: 18px;
        background: transparent;
        color: var(--icon-color);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
    }

    .action-hover-btn:hover {
        color: var(--txt);
        transform: scale(1.2);
    }

    .tile-actions.menu-active .action-hover-btn {
        color: var(--txt);
    }

    .context-menu {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 28px;
        background: var(--bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 6px;
        box-shadow: 0 4px 12px var(--box-shadow);
        z-index: 100;
        display: flex;
        flex-direction: column;
        padding: 4px;
        min-width: 90px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    .context-menu-item {
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--txt);
        padding: 6px 10px;
        text-align: left;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        box-sizing: border-box;
    }

    .context-menu-item:hover {
        background: var(--card-hover-bg);
    }

    .context-menu-item.delete:hover {
        background: var(--danger);
        color: #ffffff;
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
    .item.drag-active:not(.dragging) * {
        pointer-events: none;
    }
</style>

<svelte:window onclick={closeMenu} />

<div class="item-container">
    <div class="drop-indicator" class:active={dropLine}></div>
    
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="item"
        class:dragging={dragging}
        class:menu-open={showMenu}
        class:drag-active={$dragActive && ($dragType === "item" || $dragType === "tab")}
        style="background-color: {item.title.split(":::::")[2] || 'var(--tile-bg)'}; width: {tileWidth}em"
        draggable="true"
        out:fade
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}
        ondrop={handleDrop}
        onauxclick={(e) => {
            e.preventDefault();
            onClickItem(item, e, true)
        }}
        onclick={(e) => {
            e.preventDefault();
            onClickItem(item, e)
        }}>
        
        <div class="item-inner">
            <img
                alt=""
                src={item.title.split(':::::')[1]}
                class="item-icon" />

            <div class="text-concat" title={item.title.split(':::::')[0]}>
                {item.title.split(':::::')[0]}
            </div>
        </div>

        <div class="tile-actions" class:menu-active={showMenu}>
            <button
                class="action-hover-btn pointer"
                onclick={toggleMenu}>
                <Fa icon={faEllipsisV} size="xs" color="currentColor" />
            </button>
        </div>

        {#if showMenu}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div class="context-menu" onclick={(e) => e.stopPropagation()}>
                <button
                    class="context-menu-item pointer"
                    onclick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showMenu = false;
                        onClickItemEdit(item, index);
                    }}>
                    <Fa icon={faPenAlt} size="xs" color="currentColor" />
                    <span>Edit</span>
                </button>
                <button
                    class="context-menu-item delete pointer"
                    onclick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showMenu = false;
                        onItemDelete(item, index);
                    }}>
                    <Fa icon={faTimes} size="xs" color="currentColor" />
                    <span>Delete</span>
                </button>
            </div>
        {/if}
    </div>
</div>
