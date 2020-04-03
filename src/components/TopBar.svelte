<script>
    import { searchText } from './../stores/searchTextStore.js'

    export let darkTheme;
    export let toggleTheme;
</script>
<style>
    input {
        padding: 6px;
        padding-left: 20px;
        border: 1px dashed gray;
        border-radius: 20px;
        margin-top: 8px;
        margin-right: 16px;
        font-size: 2.5em;
        outline: none;
        background-color: var(--bg);
        color: var(--txt);
    }
</style>

<main>
    <div class="flex-row-container">
        <input type="text" placeholder="🔍 Search" bind:value={$searchText}/>
        <div style="flex-grow:1;"/>
        {#if darkTheme}
        <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">☽</div>
        {:else}
        <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">☀</div>
        {/if}
    </div>
</main>