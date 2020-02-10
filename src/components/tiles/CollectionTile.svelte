<script>
    import { fade, fly } from 'svelte/transition';
    
    export let collection;
</script>
<style>
    .collection {
        border-bottom: 1px solid gray;
        height: 100px;
        width: 100%;
        padding: 10px;
    }
</style>
<div class="collection" in:fade="{{duration: 1000}}" out:fade>
    {collection.title}
</div>