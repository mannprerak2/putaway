<script>
  import TopBar from "./components/TopBar.svelte";
  import MainArea from "./components/MainArea.svelte";
  import OpenTabsBar from "./components/OpenTabsBar.svelte";
  import Modal from "./components/Modal.svelte";
  import { setDarkTheme, getDarkTheme } from "./services/storage.js";
  import { onMount, onDestroy } from "svelte";
  import { loadGlobalSettings, getOpenTabsBarWidth,
    getReloadBookmarkSectionOnChange, getReloadOpenTabsSectionOnChange,
    getlastNewTabOperationTimeNowDiffMs} from './services/hooks.js'

  import Fa from "sveltejs-fontawesome";
  import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
  import { dragActive, dragType, deo } from "./stores/stores.js";
  import { fly } from "svelte/transition";

  let darkTheme = $state(false);
  let pageReady = $state(false);
  let openTabsBarWidth = $state(getOpenTabsBarWidth());
  let mainAreaReloadKey = $state(0);
  let openTabsBarReloadKey = $state(0);
  let trashHover = $state(false);
  let trashDragCounter = 0;

  const toggleTheme = () => {
    darkTheme = !darkTheme;
    setDarkTheme(darkTheme);
  };

  const mainAreaReloadKeyUpdate = () => {
    if (getlastNewTabOperationTimeNowDiffMs() < 2000) return;
    mainAreaReloadKey+=1;
  }

  const openTabsBarReloadKeyUpdate = () => {
    if (getlastNewTabOperationTimeNowDiffMs() < 2000) return;
    openTabsBarReloadKey+=1;
  }

  const handleTrashDragEnter = (e) => {
    trashDragCounter++;
    if (trashDragCounter === 1) {
      trashHover = true;
    }
  };

  const handleTrashDragLeave = (e) => {
    trashDragCounter--;
    if (trashDragCounter === 0) {
      trashHover = false;
    }
  };

  const handleTrashDrop = (e) => {
    e.preventDefault();
    trashDragCounter = 0;
    trashHover = false;
    const rawData = e.dataTransfer.getData("text");
    const objStr = e.dataTransfer.getData("object");
    let obj = null;
    if (objStr) {
      try {
        obj = JSON.parse(objStr);
      } catch (err) {
        console.error("Failed to parse dropped object", err);
      }
    }
    deo.set({
      source: rawData,
      target: "delete",
      sourceObj: obj,
      targetObj: null,
      ctrl: false
    });
  };

  const unsubscribeDrag = dragActive.subscribe((active) => {
    if (!active) {
      trashDragCounter = 0;
      trashHover = false;
    }
  });

  onDestroy(() => {
    unsubscribeDrag();
  });

  onMount(async () => {
    getDarkTheme(function (v) {
      darkTheme = v;
    });
    await loadGlobalSettings();
    openTabsBarWidth = getOpenTabsBarWidth();
    pageReady = true
    if(getReloadBookmarkSectionOnChange()){
      chrome.bookmarks.onCreated.addListener((id, bookmark) => {mainAreaReloadKeyUpdate()});
      chrome.bookmarks.onMoved.addListener((id, moveInfo) => {mainAreaReloadKeyUpdate()});
      chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {mainAreaReloadKeyUpdate()});
    }
    if(getReloadOpenTabsSectionOnChange()){
      chrome.tabs.onCreated.addListener((tab) => {openTabsBarReloadKeyUpdate()});
      chrome.tabs.onMoved.addListener((id, moveInfo) => {openTabsBarReloadKeyUpdate()});
      chrome.tabs.onUpdated.addListener((id, info) => {if (info.status === 'complete') openTabsBarReloadKeyUpdate()});
      chrome.tabs.onRemoved.addListener((id, removeInfo) => {openTabsBarReloadKeyUpdate()});
    }
  });
</script>

<style>
  .container-table {
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  #right-fixed-bar {
    overflow: hidden;
    height: 100vh;
    border-left: 1px solid var(--collection-separator);
    padding: 12px 10px;
    background: var(--sidebar-bg);
    box-sizing: border-box;
    transition: width 0.2s ease;
  }

  #left-free-area {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
  }

  #top-bar {
    width: 100%;
    height: 52px;
    border-bottom: 1px solid var(--collection-separator);
    flex-shrink: 0;
  }

  #top-bar-container {
    width: 100%;
    height: 100%;
    padding: 8px 20px;
    box-sizing: border-box;
  }

  #main-free-area {
    width: 100%;
    flex-grow: 1;
    overflow: hidden;
    box-sizing: border-box;
  }

  .trash-dropzone {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 28px;
    background: rgba(220, 53, 69, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px dashed rgba(220, 53, 69, 0.4);
    border-radius: 40px;
    color: var(--danger);
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 8px 32px rgba(220, 53, 69, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .trash-dropzone.dragover {
    background: var(--danger);
    color: #ffffff;
    border-color: var(--danger);
    border-style: solid;
    transform: translateX(-50%) scale(1.08);
    box-shadow: 0 12px 40px rgba(220, 53, 69, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .trash-dropzone * {
    pointer-events: none;
  }
</style>

<svelte:head>
  {#if darkTheme}
    <link rel="stylesheet" href="global-dark.css" />
  {:else}
    <link rel="stylesheet" href="global-light.css" />
  {/if}
</svelte:head>
{#if pageReady}
  <Modal closeButton={false}>
    <div class="container-table">
      <div id="left-free-area">
        <div id="top-bar">
          <div id="top-bar-container">
            <TopBar {darkTheme} {toggleTheme} />
          </div>
        </div>
        <div id="main-free-area">
            {#key mainAreaReloadKey}
              <MainArea />
            {/key}
        </div>
      </div>

      <div id="right-fixed-bar" style="width: {openTabsBarWidth}vw">
        {#key openTabsBarReloadKey}
          <OpenTabsBar />
        {/key}
      </div>
    </div>
    {#if $dragActive}
      <div
        class="trash-dropzone"
        class:dragover={trashHover}
        ondragover={(e) => e.preventDefault()}
        ondragenter={handleTrashDragEnter}
        ondragleave={handleTrashDragLeave}
        ondrop={handleTrashDrop}
        transition:fly={{ y: 60, duration: 250 }}
      >
        <Fa icon={faTrashAlt} size="lg" />
        <span>Drop here to Delete / Close</span>
      </div>
    {/if}
  </Modal>
{:else}
  <div></div>
{/if}
