<script>
  import TopBar from "./components/TopBar.svelte";
  import MainArea from "./components/MainArea.svelte";
  import OpenTabsBar from "./components/OpenTabsBar.svelte";
  import Modal from "./components/Modal.svelte";
  import { setDarkTheme, getDarkTheme } from "./services/storage.js";
  import { onMount } from "svelte";
  import { loadGlobalSettings, getOpenTabsBarWidth,
    getReloadBookmarkSectionOnChange, getReloadOpenTabsSectionOnChange,
    getlastNewTabOperationTimeNowDiffMs} from './services/hooks.js'

  let darkTheme = $state(false);
  let pageReady = $state(false);
  let openTabsBarWidth = $state(getOpenTabsBarWidth());
  let mainAreaReloadKey = $state(0);
  let openTabsBarReloadKey = $state(0);

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
  </Modal>
{:else}
  <div></div>
{/if}
