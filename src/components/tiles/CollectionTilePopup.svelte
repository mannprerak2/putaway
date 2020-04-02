<script>
    export let collection;

    let savedInThis = false;
</script>
<style>
    .popup-collection-tile {
        height: 50px;
        width: 100%;
        border-bottom: 1px solid gray;
    }
</style>

<div class="popup-collection-tile">
    {collection.title}
</div>