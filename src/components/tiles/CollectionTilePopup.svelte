<script>
    export let collection;
    export let tab;
    export let alreadySaved;

    let savedInThis = false;
    if (alreadySaved) {
        savedInThis = alreadySaved;
    }

    // will contain a bookmark if one was created rn
    let bm;
    var click = () => {
        savedInThis = !savedInThis;

        if (savedInThis) {
            saveTabToBookmark(tab);
        } else {
            if (bm) {
                chrome.bookmarks.remove(bm.id);
            } else {
                // remove all bookmarks in this with url of this tab
                chrome.bookmarks.search({ url: tab.url }, function (bms) {
                    bms.forEach(b => {
                        chrome.bookmarks.remove(b.id);
                    });
                });
            }
        }
    }

    function saveTabToBookmark(tab) {
        chrome.bookmarks.create(
            {
                parentId: collection.id,
                url: tab.url,
                title: tab.title + ":::::" + tab.favIconUrl
            }, function (node) {
                bm = node;
            }
        );
    }
</script>
<style>
    .popup-collection-tile {
        height: 50px;
        width: 100%;
        /* border-bottom: 1px solid rgb(201, 201, 201); */
        color: gray;
        padding-left: 15px;
        box-sizing: border-box;
        font-size: 2em;
        line-height: 50px;
        user-select: none;
        font-weight: 600;
    }

    .popup-collection-tile:hover {
        background-color: #e6e6e6;
    }

    .save {
        display: inline;
        color: green;
    }
</style>

<div class="popup-collection-tile pointer" on:click={click}>
    {#if savedInThis}
    <div class="save">✓</div>
    {/if}
    {collection.title}
</div>
<hr style="border: 1px solid rgb(240, 240, 240); margin: 0; margin-left: 5px; margin-right: 5px;">