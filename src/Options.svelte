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
    display: table;
    width: 100vw;
    height: 100vh;
  }

  #left-side-bar {
    width: 20vw;
    display: table-cell;
    overflow: hidden;
    height: 100%;
    border-right: 1px solid gray;
    padding: 10px;
  }

  .left-side-tile{
    font-size: 2em;
    width: 100%;
    word-wrap: break-word;
    padding: 10px;
    margin-bottom: 5px;
    cursor: pointer;
  }

  #right-panel {
    display: table-cell;
    width: auto;
    height: 100%;
    padding: 10px;
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
        <div class="flex-collumn-container">
          <!-- Header -->
          <div class="flex-row-container" style="margin-bottom: 20px;">
            <img alt="logo" src="images/logo32.png" />
            &nbsp &nbsp
            <h1>PutAway</h1>
          </div>
          <!-- Setting options -->
          {#each settingPages as page,index (page.name)}
          {#if index==currentSettingPage}
            <div class="left-side-tile" style="background-color: #00ff0022">
              {page.name}
            </div>
            {:else}
            <div class="left-side-tile" on:click={()=>changePage(index)}>
              {page.name}
            </div>
            {/if}
          {/each}
        </div>
      </div>
      <div id="right-panel">
        <h1 style="font-size: 3em;"><u>{settingPages[currentSettingPage].fullName}</u></h1>
        <div style="overflow-x: hidden; overflow-y: auto; scrollbar-width: 0; height: 95vh;">
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
