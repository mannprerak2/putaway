<script>
    // import { fade } from "svelte/transition";

    // // FontAwesome icons.
    // import Fa from "sveltejs-fontawesome";
    // import { faPenAlt } from "@fortawesome/free-solid-svg-icons/faPenAlt";
    // import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";

    let quickLinks = [];
</script>

<div class="dashbox-div flex-row-container">
    {#if quickLinks.length > 0}
        {#each quickLinks as ql}
            hello
        {/each}
    {:else}
        <div class="dashbox-div" style="font-size: 2.5em;">Quick Links</div>
    {/if}
</div>

<style>
    .dashbox-div {
        color: red;
    }
</style>
