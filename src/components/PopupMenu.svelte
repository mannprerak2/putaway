<script>
    export let items;
    export let onClickItem;

    let show = false;

    var click = (e) => {
        show = !show;
    };
    var hidePopup = (e) => {
        show = false;
    };
</script>

<style>
    /* The container <div> - needed to position the dropdown content */
    .dropdown {
        position: relative;
        display: inline-block;
    }

    /* Dropdown Content (Hidden by Default) */
    .dropdown-content {
        display: block;
        position: absolute;
        background-color: #ffffff;
        margin-left: -3cm;
        width: 3cm;
        font-size: 0.5em;
        box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
        z-index: 2;
    }

    .item {
        color: black;
        padding: 10px;
        text-decoration: none;
        display: block;
    }

    .item:hover {
        background-color: #d1d1d1;
    }
</style>

<div class="dropdown pointer">
    {#if show}
        <div class="dropbtn" style="font-size: 0.8em;" on:click={click}>▲</div>
        <div class="dropdown-content">
            {#each items as item, index}
                <div
                    class="item"
                    on:click={() => {
                        show = false;
                        onClickItem(item, index);
                    }}>
                    {item}
                </div>
            {/each}
        </div>
    {:else}
        <div class="dropbtn" style="font-size: 0.8em;" on:click={click}>⋮</div>
    {/if}
</div>
