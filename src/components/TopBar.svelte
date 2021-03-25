<script>
    import { searchText } from "./../stores/searchTextStore.js";
    export let darkTheme;
    export let toggleTheme;

    //font awesome icons
    import Fa from "sveltejs-fontawesome";
    import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
    import { faSun } from "@fortawesome/free-solid-svg-icons/faSun";
    import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
    import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
    //font awesome icons
</script>

<style>
    input {
        border: none;
        font-size: 2.5em;
        outline: none;
        background-color: var(--bg);
        color: rgb(117, 117, 117);
    }
    .search-div{
        padding: 6px;
        padding-left: 40px;
        border: 1px dashed gray;
        border-radius: 20px;
        margin-top: 8px;
        margin-right: 16px;
    }
    .search-logo {
        position: absolute;
        left: 1.3rem;
        opacity: var(--icon-opacity);
        top: 1.8rem;
    }
</style>

<main>
    <div class="flex-row-container">
        <div class="search-div flex-row-container">
            <input type="text" placeholder="Search" bind:value={$searchText} />
            <div class="search-logo">
                <Fa icon={faSearch} size="2x" color="var(--icon-color)" />
            </div>
            {#if $searchText.length>0}
                <div on:click={()=>{$searchText=""}} class="pointer" style="font-size: 2em;">
                    <Fa icon={faTimesCircle} size="sm" color="var(--icon-color)" />
                </div>
            {:else}
            <div style="font-size: 2em; visibility: hidden;">
                <Fa icon={faTimesCircle} size="sm" color="var(--icon-color)" />
            </div>
            {/if}
        </div>
        <div style="flex-grow:1;" />
        {#if darkTheme}
            <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">
                <Fa icon={faSun} size="sm" color="var(--icon-color)" />
            </div>
        {:else}
            <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">
                <Fa icon={faMoon} size="sm" color="var(--icon-color)" />
            </div>
        {/if}
    </div>
</main>
