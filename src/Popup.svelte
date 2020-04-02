<script>
  import { onMount } from 'svelte';
  import CollectionTilePopup from './components/tiles/CollectionTilePopup.svelte'

  let searchText = "";
  // array of BookmarkTreeNode
  let allCollections = [];

  onMount(() => {
    chrome.storage.local.get('pid', function (res) {
      chrome.bookmarks.getChildren(res.pid, function (children) {
        // only folders
        allCollections = children.filter((e) => e.url == null);
      });
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
    border-bottom: 1px solid gray;
    height: 50px;
  }

  #save-session {
    width: 100%;
    height: 50px;
    border-top: 1px solid gray;
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
  }

  #open-putaway {
    flex-grow: 1;
    text-align: center;
    border-radius: 20px 0 0 20px;
    border: 1px dashed gray;
    margin-left: 5px;
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
    scrollbar-width: 0;
  }
</style>

<div id="popup">
  <div id="main">
    <div id="top">
      <input type="text" placeholder="🔍 Search" bind:value={searchText} />
      <div id="open-putaway">Open <br> PutAway</div>
    </div>
    <div id="list">
      {#each allCollections as collection,i (collection.id)}
          <CollectionTilePopup {collection}/>
      {/each}
    </div>
  </div>
  <div id="save-session">
    ⭳Save Session
  </div>
</div>