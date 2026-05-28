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
    import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";

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
        } else if (obj.source[0] == "c" && obj.target == "delete") {
            var dragIndex = parseInt(obj.source.substring(1));
            setlastNewTabOperationTimeNow();
            chrome.bookmarks.removeTree(allCollections[dragIndex].id);
            allCollections.splice(dragIndex, 1);
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

<main style="position: relative; height: 100%; width: 100%; box-sizing: border-box;">
    {#if allCollections.length == 0}
        <div class="no-collections-indicator">
            {#if !$archiveOnly}
                <div class="empty-state-info flex-collumn-container">
                    <span class="empty-state-icon">📂</span>
                    <h3>No collections created yet</h3>
                    <p>Click the <span class="plus-text-indicator"><Fa icon={faPlus} size="xs" color="var(--accent-txt, white)" /></span> button at the bottom-right to create your first collection.</p>
                </div>
            {:else}
                <div class="empty-state-info flex-collumn-container">
                    <span class="empty-state-icon">📦</span>
                    <h3>No archived collections</h3>
                    <p>Collections you archive will show up in this section.</p>
                </div>
            {/if}
        </div>
    {/if}

    {#if !$archiveOnly}
        <button
            class="plus-icon pointer"
            onclick={clickAddCollection}
            aria-label="Add Collection"
        >
            <Fa icon={faPlus} size="lg" color="var(--accent-txt, white)" />
        </button>
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
    .plus-icon {
        position: absolute;
        bottom: 24px;
        right: 24px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--accent);
        color: var(--accent-txt, white);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px var(--accent-glow), 0 8px 16px rgba(0,0,0,0.15);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        z-index: 10;
    }
    .plus-icon:hover {
        background: var(--accent-hover);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 20px var(--accent-glow), 0 12px 24px rgba(0,0,0,0.2);
    }
    .plus-icon:active {
        transform: translateY(0) scale(0.95);
    }

    .no-collections-indicator {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        max-width: 400px;
    }
    .empty-state-info h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 16px 0 8px 0;
        color: var(--txt);
    }
    .empty-state-info p {
        font-size: 0.9rem;
        color: var(--icon-color);
        margin: 0;
        line-height: 1.5;
    }
    .empty-state-icon {
        font-size: 3rem;
        opacity: 0.8;
    }
    .plus-text-indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--accent);
        color: white;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        vertical-align: middle;
        margin: 0 2px;
    }
</style>
