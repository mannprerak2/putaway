<script>
    import { fade } from "svelte/transition";
    import { getItemTileWidth } from '../../services/hooks.js'
    import { dragActive, dragType } from "../../stores/stores.js";

    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faPenAlt } from "@fortawesome/free-solid-svg-icons/faPenAlt";
    import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";


    export let index;
    export let item;
    export let onItemDelete;
    export let onClickItem;
    export let onClickItemEdit;
    export let onDrop;
    let tileWidth = getItemTileWidth();
    let dropLine = false;
    let dragging = false;

    var onDragEnter = (e) => {
        dropLine = true;
    };
    var onDragLeave = (e) => {
        dropLine = false;
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
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onDrop(e, index);
    };
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

    .item:hover .tile-actions {
        opacity: 1;
    }

    .action-hover-btn {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: #ffffff;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
    }

    .action-hover-btn:hover {
        background: var(--accent);
        color: var(--accent-txt, #ffffff);
        transform: scale(1.1);
    }

    .action-hover-btn.close:hover {
        background: var(--danger);
        color: #ffffff;
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
</style>

<div class="item-container">
    <div class="drop-indicator" class:active={dropLine}></div>
    
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="item"
        class:dragging={dragging}
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

        <div class="tile-actions">
            <button
                class="action-hover-btn pointer"
                onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClickItemEdit(item, index)
                }}>
                <Fa icon={faPenAlt} size="xs" color="currentColor" />
            </button>
            <button
                class="action-hover-btn close pointer"
                onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onItemDelete(item, index)
                }}>
                <Fa icon={faTimes} size="xs" color="currentColor" />
            </button>
        </div>
    </div>
</div>
