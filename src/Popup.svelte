<script>
  import { onMount } from "svelte";
  import CollectionTilePopup from "./components/tiles/CollectionTilePopup.svelte";
  import { loadGlobalSettings } from "./services/hooks.js"

  //font awesome icons
  import Fa from "sveltejs-fontawesome";
  //import { faSave } from '@fortawesome/free-solid-svg-icons/faSave'
  import { faSave } from "@fortawesome/free-regular-svg-icons/faSave";
  import { faImage } from "@fortawesome/free-regular-svg-icons/faImage";
  import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
  //font awesome icons

  let searchText = "";
  // array of BookmarkTreeNode
  let allCollections = [];
  let map = {};

  let tab;
  let savedId;
  let isNewTab = false;
  let sessionSaved = false;
  let quickLinkSaved = false;

  onMount(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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
      } else {
        isNewTab = true;
      }
    });
    loadGlobalSettings()
  });

  var saveSession = () => {
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

  var saveQuickLink = () => {
    chrome.storage.sync.get("quickLinks", async (v) => {
      let quickLinks = [];
      if (v.quickLinks) {
        quickLinks = v.quickLinks;
      }

      if (quickLinkSaved) {
        quickLinks.pop();
      } else {
        quickLinks.push({
          icon: tab.favIconUrl,
          url: tab.url,
        });
      }

      chrome.storage.sync.set({ quickLinks: quickLinks });
      quickLinkSaved = !quickLinkSaved;
    });
  };

  var openPutAway = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("newtab.html") });
  };
</script>

<div id="popup">
  {#if !isNewTab}
    <div id="main">
      <div id="top">
        <!-- svelte-ignore a11y-autofocus -->
        <input
          autofocus
          type="text"
          placeholder="Search"
          bind:value={searchText}
        />
        <div id="search-logo">
          <Fa icon={faSearch} size="2x" />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id="open-putaway" class="pointer" on:click={openPutAway}>
          Open
          <br />
          PutAway
        </div>
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
        <div style="height: 60px;" />
      </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      id="save-session"
      class="pointer big-popup-button"
      on:click={saveSession}
    >
      {#if sessionSaved}
        ✓Saved (click to undo)
      {:else}
        <Fa
          icon={faSave}
          size="sm"
          style="position:relative; top:3px; opacity: 0.7;"
        />
        Save Session
      {/if}
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      id="save-quicklink"
      class="pointer big-popup-button"
      on:click={saveQuickLink}
    >
      {#if quickLinkSaved}
        ✓Saved (click to undo)
      {:else}
        <Fa
          icon={faImage}
          size="sm"
          style="position:relative; top:3px; opacity: 0.7;"
        />
        Save Quick Link
      {/if}
    </div>
  {:else}
    <div id="newtab-popup">
      <img alt="logo" src="images/logo128.png" />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div id="newtab-open-putaway" class="pointer" on:click={openPutAway}>
        Open PutAway
      </div>
      <div>
        This is an Empty Tab.
        <br />
        You cannot add this to a collection.
      </div>
    </div>
  {/if}
</div>

<style>
  #popup {
    width: 300px;
    height: 400px;
    display: block;
  }

  #main {
    height: 350px;
  }

  #top {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 2px;
    border-bottom: 1px solid rgb(201, 201, 201);
    height: 50px;
  }

  .big-popup-button {
    width: 100%;
    height: 50px;
    border-top: 1px solid rgb(201, 201, 201);
    text-align: center;
    color: rgb(83, 81, 81);
    font-size: 2em;
    line-height: 50px;
  }

  .big-popup-button:hover {
    background-color: #e6e6e6;
  }

  input {
    border: 1px dashed gray;
    padding: 6px;
    padding-left: 30px;
    border-radius: 0 20px 20px 0;
    font-size: 1.8em;
    outline: none;
    color: gray;
    width: 70%;
    margin: 5px;
  }

  #open-putaway {
    flex-grow: 1;
    text-align: center;
    border-radius: 20px 0 0 20px;
    border: 1px dashed gray;
    margin: 5px;
    padding: 2px;
    color: gray;
    font-size: 1.2em;
  }

  #open-putaway:hover {
    background-color: #e6e6e6;
  }

  #list {
    height: 300px;
    overflow-y: scroll;
    scrollbar-width: none;
  }

  #list::-webkit-scrollbar {
    display: none;
  }

  #newtab-popup {
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgb(190, 190, 190);
    font-size: 2em;
  }

  #newtab-open-putaway {
    color: gray;
    font-size: 1.2em;
    border: 1px dashed gray;
    border-radius: 50px;
    padding: 10px;
    margin: 10px;
  }

  #newtab-open-putaway:hover {
    background-color: #e6e6e6;
  }
  #search-logo {
    position: absolute;
    right: 16.8rem;
    opacity: 0.5;
  }
</style>
