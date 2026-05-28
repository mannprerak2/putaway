<script>
  import Modal from "./components/Modal.svelte";
  import { setDarkTheme, getDarkTheme } from "./services/storage.js";
  import { loadGlobalSettings } from "./services/hooks.js"
  import GeneralOptions from "./option_pages/GeneralOptions.svelte";
  import SaveHookOptions from "./option_pages/SaveHookOptions.svelte";
  import { onMount } from "svelte";
  let pageReady = false;
  let settingPages = [
    {
      name: 'General',
      fullName: 'General Settings'
    },
    {
      name: 'Save Hooks',
      fullName: 'Hooks Settings'
    }
  ]
  let currentSettingPage = 0;
  var changePage = (idx) => {
    currentSettingPage = idx;
  }

  // Theme settings.
  let darkTheme = false;
  var changeTheme = (v) => {
    darkTheme = v;
    setDarkTheme(darkTheme);
  };

  // Global settings.
  let globalSettings = {};
  onMount(async () => {
    getDarkTheme(function (v) {
      darkTheme = v;
    });
    globalSettings = await loadGlobalSettings()
    pageReady = true
  });
  var setGlobalSettings = (globalSettings) => {
    chrome.storage.sync.set({globalSettings: globalSettings});
  }
</script>

<style>
  .container-table {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
  }

  #left-side-bar {
    width: 280px;
    height: 100%;
    border-right: 1px solid var(--collection-separator);
    padding: 32px 20px;
    background: var(--sidebar-bg);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .left-side-tile {
    font-size: 0.95rem;
    font-weight: 500;
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 6px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
    color: var(--icon-color);
  }
  .left-side-tile:hover {
    background-color: var(--outline-btn-hover);
    color: var(--txt);
  }
  .left-side-tile.active {
    background-color: var(--accent-glow);
    color: var(--accent);
    font-weight: 600;
  }

  #right-panel {
    flex-grow: 1;
    height: 100%;
    padding: 40px 48px;
    box-sizing: border-box;
    overflow-y: auto;
    background: var(--bg);
  }

  .logo-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--txt);
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
      <div id="left-side-bar">
        <div class="logo-header flex-row-container" style="margin-bottom: 32px; gap: 12px; padding-left: 8px;">
          <img alt="logo" src="images/logo32.png" />
          <h1>PutAway</h1>
        </div>
        <!-- Setting options -->
        <div class="flex-collumn-container" style="align-items: stretch; width: 100%;">
          {#each settingPages as page,index (page.name)}
            <button
              class="left-side-tile pointer"
              class:active={index==currentSettingPage}
              onclick={(e)=>changePage(index)}>
              {page.name}
            </button>
          {/each}
        </div>
      </div>
      <div id="right-panel">
        <h1 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; color: var(--txt);">{settingPages[currentSettingPage].fullName}</h1>
        <div style="overflow-x: hidden; overflow-y: auto; scrollbar-width: 0; height: calc(100% - 60px);">
          {#if settingPages[currentSettingPage].name == "General"}
            <GeneralOptions {darkTheme} {changeTheme} {globalSettings} {setGlobalSettings}/>
          {:else if settingPages[currentSettingPage].name == "Save Hooks"}
            <SaveHookOptions {globalSettings} {setGlobalSettings}/>
          {/if}
        </div>
      </div>
    </div>
  </Modal>
{:else}
  <div></div>
{/if}
