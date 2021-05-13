<script>
    import { getContext } from "svelte";
    const { close } = getContext("simple-modal");

    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";

    export let quickLinks;

    function onClickSave() {
        close(quickLinks);
    }

    function handleKeyUp(event) {
        // on press enter
        if (event.keyCode == 13) {
            onClickSave();
        }
    }
    function deleteLink(index) {
        quickLinks.splice(index, 1);
        quickLinks = quickLinks;
    }
    function addQuickLink() {
        quickLinks.push({ icon: "", url: "" });
        quickLinks = quickLinks;
    }
</script>

<svelte:window on:keyup={handleKeyUp} />

<main>
    <h1>Edit Quick links -</h1>

    {#each quickLinks as ql, index}
        <div class="flex-row-container">
            <img alt=" " src={ql.icon} height="26px" style="padding: 5px" />
            <strong>URL: </strong>
            <input bind:value={ql.url} type="text" />
            <strong style="margin-left: 5px">ICON: </strong>
            <input bind:value={ql.icon} type="text" />
            <div class="pointer" on:click={() => deleteLink(index)}>
                <Fa icon={faTimesCircle} size="2x" style="margin-left: 5px" />
            </div>
        </div>
    {/each}
    <div id="add-quick-link" class="pointer flex-row-container" on:click={addQuickLink} style="font-size: 2em; margin-right:30%; margin-left: 30%; margin-top: 5px; border: 1px dashed gray; border-radius: 30px; justify-content: space-evenly;">
        Add new link
    </div>
    <div class="modal-bottom-bar" style="margin: auto">
        <button class="pointer" on:click={onClickSave}>Save</button>
    </div>
</main>

<style>
    input {
        width: 100%;
        outline: none;
        padding: 4px;
        box-sizing: border-box;
    }

    .modal-bottom-bar {
        margin-top: 20px;
        display: flex;
        flex-direction: row;
        float: right;
        align-items: center;
    }

    button {
        background-color: gray;
        border-radius: 10px;
        color: white;
        padding: 8px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
    }

    #add-quick-link:hover{
        background-color: #e6e6e6;
    }
</style>
