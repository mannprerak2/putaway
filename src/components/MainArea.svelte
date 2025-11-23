<script>
    import { onDestroy, getContext } from "svelte";
    import CreateCollectionModal from "./modals/CreateCollectionModal.svelte";
    import DeleteCollectionModal from "./modals/DeleteCollectionModal.svelte";
    import ShareCollectionModal from "./modals/ShareCollectionModal.svelte";
    import ArchiveCollectionModal from "./modals/ArchiveCollectionModal.svelte";
    import CollectionTile from "./tiles/CollectionTile.svelte";
    const { open } = getContext("simple-modal");
    import { deo, archiveOnly } from "./../stores/stores.js";
    import EmptyCollectionTile from "./tiles/EmptyCollectionTile.svelte";

    import { setlastNewTabOperationTimeNow } from "../services/hooks.js";

    import Fa from "sveltejs-fontawesome";
    import { faArchive } from "@fortawesome/free-solid-svg-icons/faArchive";

    // Gets ID of folder inside Other Bookmarks and creates one if it doesn't
    // exist.
    function getIDforFolder(folderName, callback) {
        chrome.bookmarks.getTree(function (tree) {
            var otherBookmarksFolderId = tree[0].children[1].id;
            chrome.bookmarks.getChildren(
                otherBookmarksFolderId,
                function (children) {
                    var putawayfolder = children.find(
                        (e) => e.title == folderName
                    );
                    var pid;
                    if (!putawayfolder) {
                        // Folder doesn't exist, so we create one
                        chrome.bookmarks.create(
                            {
                                parentId: otherBookmarksFolderId,
                                title: folderName,
                            },
                            function (newFolder) {
                                pid = newFolder.id;
                                callback(pid);
                            }
                        );
                    } else {
                        pid = putawayfolder.id;
                        callback(pid);
                    }
                }
            );
        });
    }

    // array of BookmarkTreeNode
    let allCollections = $state([]);

    // Called only if pid no longer points to the correct putaway folder.
    function refreshPidAndloadCollections(pid, pidVar) {
        // store pid in local storage for use later
        chrome.storage.local.set({ [pidVar]: pid });
        loadCollections(pid, false);
    }

    function loadCollections(
        pid,
        retry = true,
        folderName = "PutAway",
        pidVar = "pid"
    ) {
        chrome.bookmarks.getChildren(pid, function (children) {
            try {
                if (chrome.runtime.lastError) {
                    console.log('Putaway folder pid invalidated, refreshing.')
                    throw "Putaway folder pid invalidated, refreshing.";
                }
                // only folders
                allCollections = children.filter((e) => e.url == null);
            } catch (e) {
                if (retry) {
                    // pid is invalidated, add it again.
                    getIDforFolder(folderName, (pid) => {
                        refreshPidAndloadCollections(pid, pidVar);
                    });
                }
            }
        });
    }
    const unsubsribeArc = archiveOnly.subscribe((value) => {
        if (value) {
            chrome.storage.local.get("paid", function (res) {
                if (res.paid) {
                    loadCollections(res.paid, true, "PutAway Archives", "paid");
                } else {
                    loadCollections("-1", true, "PutAway Archives", "paid");
                }
            });
        } else {
            chrome.storage.local.get("pid", function (res) {
                if (res.pid) {
                    loadCollections(res.pid);
                } else {
                    loadCollections("-1");
                }
            });
        }
    });

    const clickAddCollection = async () => {
        var c = await open(CreateCollectionModal);
        if (c) {
            // add to list at its index
            allCollections.splice(c.index, 0, c);
            allCollections = allCollections;
        }
    };

    const onCollectionDrop = (e, dropIndex) => {
        e.preventDefault();
        var rawData = e.dataTransfer.getData("text");

        deo.set({
            source: rawData,
            target: "c" + dropIndex.toString(),
            sourceObj: null,
            targetObj: null,
        });
    };

    const unsubsribe = deo.subscribe((obj) => {
        if (obj.source[0] == "c" && obj.target[0] == "c") {
            var dragIndex = parseInt(obj.source.substring(1));
            var dropIndex = parseInt(obj.target.substring(1));
            // move allCollections from dragIndex to dropIndex
            if (dragIndex >= dropIndex) {
                setlastNewTabOperationTimeNow();
                chrome.bookmarks.move(allCollections[dragIndex].id, {
                    index: dropIndex,
                });
                allCollections.splice(dropIndex, 0, allCollections[dragIndex]);
                allCollections.splice(dragIndex + 1, 1);
            } else {
                setlastNewTabOperationTimeNow();
                chrome.bookmarks.move(allCollections[dragIndex].id, {
                    index: dropIndex,
                });
                allCollections.splice(dropIndex, 0, allCollections[dragIndex]);
                allCollections.splice(dragIndex, 1);
            }
            allCollections = allCollections;
        }
    });

    onDestroy(() => {
        unsubsribeArc();
        unsubsribe();
    });

    const clickDeleteCollection = async (index) => {
        var c = await open(DeleteCollectionModal, {
            collectionName: allCollections[index].title,
        });
        if (c) {
            setlastNewTabOperationTimeNow();
            chrome.bookmarks.removeTree(allCollections[index].id);
            allCollections.splice(index, 1);
            allCollections = allCollections;
        }
    };

    const clickShareCollection = async (index, items) => {
        var shareText = "";
        items.forEach((item) => {
            shareText += item.title.split(":::::")[0];
            shareText += " - ";
            shareText += item.url;
            shareText += "\n\n";
        });
        await open(ShareCollectionModal, {
            collectionName: allCollections[index].title,
            shareText: shareText,
        });
    };

    const clickArchiveCollection = async (index) => {
        var c = await open(ArchiveCollectionModal, {
            collection: allCollections[index],
            toArchive: !$archiveOnly,
        });
        if (c) {
            let folder = $archiveOnly ? "PutAway" : "PutAway Archives";
            getIDforFolder(folder, (pid) => {
                chrome.bookmarks.move(allCollections[index].id, {
                    parentId: pid,
                });
                allCollections.splice(index, 1);
                allCollections = allCollections;
            });
        }
    };
</script>

<main style="position: relative;">
    {#if allCollections.length == 0}
        <div class="no-collections-indicator">
            {#if !$archiveOnly}
                <h3 style="color: var(--txt);">No Collections, Click '</h3>
                <button class="plus-icon-dummy" />
                <h3 style="color: var(--txt);">' To create one</h3>
            {:else}
                <h3 style="color: var(--txt);">No Archives, Click '</h3>
                <div
                    class="pointer"
                    style="font-size: 2em; opacity:var(--icon-opacity);"
                    alt="Archive"
                >
                    <Fa icon={faArchive} size="sm" color="var(--icon-color)" />
                </div>
                <h3 style="color: var(--txt);">' To archive a collections.</h3>
            {/if}
        </div>
    {/if}

    {#if !$archiveOnly}
        <button
            class="plus-icon pointer"
            onclick={clickAddCollection}
        />
    {/if}
    <div class="scroll">
        {#each allCollections as collection, i (collection.id)}
            <CollectionTile
                {collection}
                index={i}
                {onCollectionDrop}
                {clickShareCollection}
                {clickDeleteCollection}
                {clickArchiveCollection}
            />
        {/each}
        <EmptyCollectionTile index={allCollections.length} {onCollectionDrop} />
    </div>
</main>

<style>
    .plus-icon-dummy {
        width: 20px;
        height: 20px;
        border-width: 3px;
        border-radius: 100%;
        background: -webkit-linear-gradient(
                0deg,
                transparent 0%,
                transparent 46%,
                white 46%,
                white 56%,
                transparent 56%,
                transparent 100%
            ),
            -webkit-linear-gradient(90deg, transparent 0%, transparent 46%, white
                        46%, white 56%, transparent 56%, transparent 100%);
        border-color: gray;
        background-color: gray;
    }

    .plus-icon {
        position: absolute;
        margin-right: 20px;
        margin-bottom: 8vh;
        bottom: 0;
        right: 0;
        width: 40px;
        height: 40px;
        border-width: 8px;
        border-radius: 100%;
        background: -webkit-linear-gradient(
                0deg,
                transparent 0%,
                transparent 46%,
                white 46%,
                white 56%,
                transparent 56%,
                transparent 100%
            ),
            -webkit-linear-gradient(90deg, transparent 0%, transparent 46%, white
                        46%, white 56%, transparent 56%, transparent 100%);
        border-color: gray;
        background-color: gray;
        z-index: 2;
    }

    .no-collections-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        margin-bottom: 100px;
        left: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        align-content: center;
        justify-content: center;
    }
</style>
