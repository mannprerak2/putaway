<script>
  import TopBar from "./components/TopBar.svelte";
  import MainArea from "./components/MainArea.svelte";
  import OpenTabsBar from "./components/OpenTabsBar.svelte";
</script>

<style>
  .container-table {
    display: table;
    width: 100%;
    height: 100%;
  }

  #right-fixed-bar {
    width: 6cm;
    display: table-cell;
    overflow: hidden;
    height: 100%;
    border-left: 1px solid black;
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
    border-bottom: 1px solid black;
  }
  #top-bar-container {
    width: 100%;
    height: 100%;
    padding: 10px;
  }

  #main-free-area {
    width: 100%;
    height: 100%;
    padding: 10px;
  }
</style>

<div class="container-table">

  <div id="left-free-area">
    <div id="top-bar">
      <div id="top-bar-container">
        <TopBar />
      </div>
    </div>
    <div id="main-free-area">
      <MainArea />
    </div>
  </div>

  <div id="right-fixed-bar">
    <OpenTabsBar />
  </div>

</div>