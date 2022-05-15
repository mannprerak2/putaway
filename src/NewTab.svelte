<script>
  import TopBar from "./components/TopBar.svelte";
  import MainArea from "./components/MainArea.svelte";
  import OpenTabsBar from "./components/OpenTabsBar.svelte";
  import Modal from "./components/Modal.svelte";
  import { setDarkTheme, getDarkTheme } from "./services/storage.js";
  import { onMount } from "svelte";
  import { loadGlobalSettings, getOpenTabsBarWidth } from './services/hooks.js'

  let darkTheme = false;
  var toggleTheme = () => {
    darkTheme = !darkTheme;
    setDarkTheme(darkTheme);
  };

  let pageReady = false;
  let openTabsBarWidth = getOpenTabsBarWidth();
  onMount(async () => {
    getDarkTheme(function (v) {
      darkTheme = v;
    });
    await loadGlobalSettings();
    openTabsBarWidth = getOpenTabsBarWidth();
    pageReady = true
  });
</script>

<style>
  .container-table {
    display: table;
    width: 100%;
    height: 100%;
  }

  #right-fixed-bar {
    width: 20vw;
    display: table-cell;
    overflow: hidden;
    height: 100%;
    border-left: 1px solid gray;
    padding: 10px;
  }

  #left-free-area {
    display: table-cell;
    width: auto;
    height: 100%;
  }

  #top-bar {
    width: 100%;
    height: 2cm;
    border-bottom: 1px solid gray;
  }

  #top-bar-container {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  #main-free-area {
    width: 100%;
    height: 100%;
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
          <MainArea />
        </div>
      </div>

      <div id="right-fixed-bar" style="width: {openTabsBarWidth}vw">
        <OpenTabsBar />
      </div>
    </div>
  </Modal>
{:else}
  <div></div>
{/if}
