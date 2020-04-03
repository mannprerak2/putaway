<script>
  import { onMount } from 'svelte';
  import CollectionTilePopup from './components/tiles/CollectionTilePopup.svelte'

  let searchText = "";
  // array of BookmarkTreeNode
  let allCollections = [];
  let map = {};
  let tab;
  let isNewTab = false;
  onMount(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      tab = tabs[0];
      if (tab.url != 'chrome://newtab/') {
        chrome.bookmarks.search({ url: tab.url }, function (bms) {
          bms.forEach(b => {
            map[b.parentId] = true;
          });
        });
        chrome.storage.local.get('pid', function (res) {
          chrome.bookmarks.getChildren(res.pid, function (children) {
            // only folders
            allCollections = children.filter((e) => e.url == null);
          });
        });
      } else {
        isNewTab = true;
      }
    });
  });
</script>

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

  #save-session {
    width: 100%;
    height: 50px;
    border-top: 1px solid rgb(201, 201, 201);
    text-align: center;
    color: gray;
    font-size: 2em;
    line-height: 50px;
    cursor: pointer;
  }

  #save-session:hover {
    background-color: #e6e6e6;
  }

  input {
    border: 1px dashed gray;
    padding: 6px;
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
    cursor: pointer;
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
    cursor: pointer;
  }

  #newtab-open-putaway:hover {
    background-color: #e6e6e6;
  }
</style>

<div id="popup">
  {#if !isNewTab}
  <div id="main">
    <div id="top">
      <input autofocus type="text" placeholder="🔍 Search" bind:value={searchText} />
      <div id="open-putaway">Open <br> PutAway</div>
    </div>
    <div id="list">
      {#each allCollections as collection,i (collection.id)}
        {#if (collection.title.toLowerCase().includes(searchText.toLowerCase())) }
          <CollectionTilePopup {collection} {tab} alreadySaved={map[collection.id]}/>
        {/if}
      {/each}
      <div style="height: 60px;"></div>
    </div>
  </div>
  <div id="save-session">
    ⭳Save Session
  </div>
  {:else}
  <div id="newtab-popup">
    <div>
      This is an Empty Tab
    </div>
    <div id="newtab-open-putaway">
      Open PutAway
    </div>
    <div>
      You cannot add this to a collection
    </div>
  </div>
  {/if}
</div>