<script>
    import { searchText } from './../stores/searchTextStore.js'
</script>
<style>
    input {
        padding: 6px;
        border: none;
        margin-top: 8px;
        margin-right: 16px;
        font-size: 2.5em;
        outline: none;
        border-bottom: 1px solid rgb(170, 170, 170);
    }
</style>

<main>
    <input type="text" placeholder="Search" bind:value={$searchText}>
</main>