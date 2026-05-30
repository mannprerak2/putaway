<script>
    import { fade, fly } from "svelte/transition";
    import { dragActive, dragType } from "../../stores/stores.js";
    import { onDestroy } from "svelte";
    import Fa from "sveltejs-fontawesome";
    import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";

    export let tab;
    export let index;
    export let onClickTabCard;
    export let onTabTileClose;
    export let onDrop; // dont call directly, set dropline to false before calling
    let dropLine = false;
    let dragging = false;
    let dragCounter = 0;

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
        dragType.set("tab");
        e.dataTransfer.setData("text", "t" + index.toString());
        e.dataTransfer.setData("object", JSON.stringify(tab));
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
    .card {
        border: 1px solid var(--outline-btn-border);
        border-radius: 8px;
        margin: 3px 4px;
        padding: 4px 8px;
        position: relative;
        background: var(--tile-bg);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        cursor: grab;
        user-select: none;
        overflow: hidden;
    }
    .card:active {
        cursor: grabbing;
    }
    .card.dragging {
        opacity: 0.35;
        border-style: dashed;
        transform: scale(0.95);
    }
    .card:hover {
        background-color: var(--card-hover-bg);
        border-color: var(--icon-color);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px var(--box-shadow);
    }
    .card-content {
        display: flex;
        align-items: center;
        width: 100%;
        padding-right: 16px; /* space for close button */
        box-sizing: border-box;
    }
    .card-favicon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        border-radius: 3px;
        flex-shrink: 0;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.15));
    }
    .text-concat {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--txt);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
    .close-btn {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: transparent;
        color: var(--icon-color);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.2s ease;
        border: none;
        padding: 0;
    }
    .card:hover .close-btn {
        opacity: 0.8;
    }
    .close-btn:hover {
        background: var(--danger);
        color: white !important;
        opacity: 1 !important;
    }
    .drop-indicator-line {
        height: 2px;
        background: transparent;
        width: calc(100% - 8px);
        margin: 4px auto;
        border-radius: 2px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .drop-indicator-line.active {
        height: 4px;
        margin: 3px auto;
        background: var(--drop-indicator);
        box-shadow: 0 0 10px var(--drop-indicator);
    }
    .card.drag-active:not(.dragging) * {
        pointer-events: none;
    }
</style>

<div in:fly={{ x: 100, duration: 300 }} out:fade>
    <div class="drop-indicator-line" class:active={dropLine}></div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="card"
        class:dragging={dragging}
        class:drag-active={$dragActive && $dragType === "tab"}
        draggable="true"
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}
        ondrop={handleDrop}
        onclick={(e) => {
            e.preventDefault();
            onClickTabCard(tab);
        }}>
        
        <div class="card-content">
            <img
                alt=""
                src={tab.favIconUrl}
                class="card-favicon" />

            <div class="text-concat" title={tab.title}>{tab.title}</div>
        </div>

        <button
            class="close-btn pointer"
            onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabTileClose(tab, index)
            }}>
            <Fa icon={faTimes} size="xs" color="currentColor" />
        </button>
    </div>
</div>
