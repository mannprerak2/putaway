<script>
  import { onMount } from "svelte";
  import CollectionTilePopup from "./components/tiles/CollectionTilePopup.svelte";
  import { loadGlobalSettings } from "./services/hooks.js"
  import { getDarkTheme } from "./services/storage.js";

  //font awesome icons
  import Fa from "sveltejs-fontawesome";
  //import { faSave } from '@fortawesome/free-solid-svg-icons/faSave'
  import { faSave } from "@fortawesome/free-regular-svg-icons/faSave";
  import { faImage } from "@fortawesome/free-regular-svg-icons/faImage";
  import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
  //font awesome icons

  let darkTheme = $state(false);
  let searchText = $state("");
  // array of BookmarkTreeNode
  let allCollections = $state([]);
  let map = $state({});
  let globalSettings = $state({});
  let quickLinkBmId = $state(undefined);

  let tab = $state(undefined);
  let savedId = $state(undefined);
  let isNewTab = $state(false);
  let sessionSaved = $state(false);
  let quickLinkSaved = $state(false);

  function checkIfQuickLinkSaved() {
    if (globalSettings.quickLinksFolderId && tab && tab.url) {
      chrome.bookmarks.getChildren(globalSettings.quickLinksFolderId, function (children) {
        if (chrome.runtime.lastError) return;
        let match = children.find(e => e.url === tab.url);
        if (match) {
          quickLinkSaved = true;
          quickLinkBmId = match.id;
        } else {
          quickLinkSaved = false;
          quickLinkBmId = undefined;
        }
      });
    }
  }

  onMount(() => {
    getDarkTheme(function (v) {
      darkTheme = v;
    });
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      tab = tabs[0];
      if (tab.url != "chrome://newtab/") {
        chrome.bookmarks.search({ url: tab.url }, function (bms) {
          bms.forEach((b) => {
            map[b.parentId] = true;
          });
        });
        chrome.storage.local.get("pid", function (res) {
          chrome.bookmarks.getChildren(res.pid, function (children) {
            // only folders
            allCollections = children.filter((e) => e.url == null);
          });
        });
        globalSettings = await loadGlobalSettings();
        checkIfQuickLinkSaved();
      } else {
        isNewTab = true;
      }
    });
  });

  const saveSession = () => {
    if (sessionSaved) {
      chrome.bookmarks.removeTree(savedId);
      sessionSaved = false;
    } else {
      var dt = new Date();
      let sessionName = `Session ${dt.getDate()}-${(
        dt.getMonth() + 1
      ).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}-${dt.getFullYear()}, ${dt.getHours()}:${dt
        .getMinutes()
        .toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${dt.getSeconds().toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;

      chrome.storage.local.get("pid", function (map) {
        chrome.bookmarks.create(
          {
            parentId: map.pid,
            title: sessionName,
            index: 0,
          },
          function (c) {
            chrome.tabs.query(
              {
                currentWindow: true,
              },
              (tabs) => {
                let allTabs = tabs.filter(function (tab) {
                  return tab.url != "chrome://newtab/";
                });
                var count = allTabs.length;
                allTabs.forEach((tab) => {
                  chrome.bookmarks.create(
                    {
                      parentId: c.id,
                      url: tab.url,
                      title: tab.title + ":::::" + tab.favIconUrl,
                    },
                    function (node) {
                      count--;
                      if (count == 0) {
                        // reload tab to take effect
                        savedId = c.id;
                        sessionSaved = true;
                      }
                    }
                  );
                });
              }
            );
          }
        );
      });
    }
  };

  function saveToFolder(folderId) {
    chrome.bookmarks.create({
      parentId: folderId,
      url: tab.url,
      title: tab.title + ":::::" + tab.favIconUrl
    }, function (node) {
      quickLinkSaved = true;
      quickLinkBmId = node.id;
    });
  }

  const saveQuickLink = () => {
    if (quickLinkSaved) {
      if (quickLinkBmId) {
        chrome.bookmarks.remove(quickLinkBmId, () => {
          quickLinkSaved = false;
          quickLinkBmId = undefined;
        });
      }
    } else {
      if (globalSettings.quickLinksFolderId) {
        saveToFolder(globalSettings.quickLinksFolderId);
      } else {
        chrome.storage.local.get("pid", function (localRes) {
          if (localRes.pid) {
            chrome.bookmarks.create({
              parentId: localRes.pid,
              title: "Quick Links",
              index: 0
            }, function (newFolder) {
              globalSettings.quickLinksFolderId = newFolder.id;
              chrome.storage.sync.set({ globalSettings }, () => {
                saveToFolder(newFolder.id);
              });
            });
          }
        });
      }
    }
  };

  const openPutAway = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("newtab.html") });
  };
</script>

<svelte:head>
  {#if darkTheme}
    <link rel="stylesheet" href="global-dark.css" />
  {:else}
    <link rel="stylesheet" href="global-light.css" />
  {/if}
</svelte:head>

<div id="popup">
  {#if !isNewTab}
    <div id="main">
      <div id="top">
        <div class="search-container">
          <div class="search-icon-wrapper">
            <Fa icon={faSearch} size="sm" color="var(--icon-color)" />
          </div>
          <!-- svelte-ignore a11y_autofocus -->
          <input
            autofocus
            type="text"
            placeholder="Search collections..."
            bind:value={searchText}
          />
        </div>
        <button id="open-putaway" class="pointer" onclick={openPutAway}>
          Open App
        </button>
      </div>
      <div id="list">
        {#each allCollections as collection, i (collection.id)}
          {#if collection.title
            .toLowerCase()
            .includes(searchText.toLowerCase())}
            <CollectionTilePopup
              {collection}
              {tab}
              alreadySaved={map[collection.id]}
            />
          {/if}
        {/each}
      </div>
    </div>
    
    <div class="action-footer">
      <button
        id="save-session"
        class="pointer big-popup-button"
        onclick={saveSession}
      >
        {#if sessionSaved}
          ✓ Saved (click to undo)
        {:else}
          <Fa
            icon={faSave}
            size="sm"
            color="currentColor"
          />
          Save Session
        {/if}
      </button>
      <button
        id="save-quicklink"
        class="pointer big-popup-button"
        onclick={saveQuickLink}
      >
        {#if quickLinkSaved}
          ✓ Saved (click to undo)
        {:else}
          <Fa
            icon={faImage}
            size="sm"
            color="currentColor"
          />
          Save Quick Link
        {/if}
      </button>
    </div>
  {:else}
    <div id="newtab-popup">
      <img alt="logo" src="images/logo128.png" />
      <button id="newtab-open-putaway" class="pointer" onclick={openPutAway}>
        Open PutAway
      </button>
      <div style="font-size: 0.85rem; line-height: 1.4; color: var(--icon-color);">
        This is an empty tab.
        <br />
        You cannot add this page to a collection.
      </div>
    </div>
  {/if}
</div>

<style>
  #popup {
    width: 300px;
    height: 400px;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--txt);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    box-sizing: border-box;
    overflow: hidden;
  }

  #main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: calc(100% - 96px); /* space for action-footer */
  }

  #top {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--collection-separator);
    gap: 8px;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .search-container {
    position: relative;
    flex-grow: 1;
    display: flex;
    align-items: center;
  }

  .search-icon-wrapper {
    position: absolute;
    left: 10px;
    color: var(--icon-color);
    display: flex;
    align-items: center;
    opacity: 0.65;
  }

  input {
    border: 1px solid var(--outline-btn-border);
    padding: 8px 12px 8px 30px;
    border-radius: 20px;
    font-size: 0.85rem;
    outline: none;
    background: var(--tile-bg);
    color: var(--txt);
    width: 100%;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  input:focus {
    border-color: var(--accent);
    background: var(--bg);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }

  #open-putaway {
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    border-radius: 20px;
    border: 1px solid var(--outline-btn-border);
    padding: 8px 12px;
    color: var(--txt);
    background: var(--outline-btn-hover);
    transition: all 0.2s;
    white-space: nowrap;
  }

  #open-putaway:hover {
    border-color: var(--icon-color);
    background-color: var(--outline-btn-hover);
    transform: translateY(-1px);
  }

  #list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 8px 12px;
    box-sizing: border-box;
  }

  #list::-webkit-scrollbar {
    width: 4px;
  }
  #list::-webkit-scrollbar-track {
    background: transparent;
  }
  #list::-webkit-scrollbar-thumb {
    background-color: var(--outline-btn-border);
    border-radius: 2px;
  }

  .action-footer {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--collection-separator);
    background: var(--sidebar-bg);
    flex-shrink: 0;
  }

  .big-popup-button {
    width: 100%;
    height: 48px;
    text-align: center;
    color: var(--txt);
    font-size: 0.85rem;
    font-weight: 500;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
  }

  .big-popup-button:hover {
    background-color: var(--outline-btn-hover);
  }
  
  .big-popup-button:not(:last-child) {
    border-bottom: 1px solid var(--collection-separator);
  }

  #newtab-popup {
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--icon-color);
    font-size: 0.9rem;
    padding: 24px;
    box-sizing: border-box;
    gap: 16px;
  }

  #newtab-popup img {
    width: 64px;
    height: 64px;
  }

  #newtab-open-putaway {
    color: var(--accent-txt, white);
    font-weight: 600;
    background: var(--accent);
    border: none;
    border-radius: 20px;
    padding: 10px 24px;
    box-shadow: 0 4px 10px var(--accent-glow);
    transition: all 0.2s;
    font-size: 0.85rem;
  }

  #newtab-open-putaway:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
</style>
