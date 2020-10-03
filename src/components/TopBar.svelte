<script>
    import { searchText } from './../stores/searchTextStore.js'
    export let darkTheme;
    export let toggleTheme;

    //font awesome icons
    import Fa from "sveltejs-fontawesome"
    import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
    //font awesome icons

</script>
<style>
    input {
        padding: 6px;
        padding-left: 50px;
        border: 1px dashed gray;
        border-radius: 20px;
        margin-top: 8px;
        margin-right: 16px;
        font-size: 2.5em;
        outline: none;
        background-color: var(--bg);
        color: rgb(117, 117, 117);
    }
    .search-logo{
        position: absolute;
        left: 1rem;
        opacity: 0.5;
        top:1.5rem;
        
    }
</style>

<main>
    <div class="flex-row-container">
        <input type="text" placeholder="Search" bind:value={$searchText}/>
        <div class = "search-logo">
            <Fa 
            icon={faSearch}
            size="3x" ></Fa>
        </div>
        <div style="flex-grow:1;"/>
        {#if darkTheme}
        <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">☽</div>
        {:else}
        <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">☀</div>
        {/if}
    </div>
</main>