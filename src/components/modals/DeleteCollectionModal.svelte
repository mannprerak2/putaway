<script>
    import { getContext } from "svelte";

    export let collectionName;

    const { close } = getContext("simple-modal");
</script>

<style>
    .modal-title {
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: 24px;
        color: var(--txt);
        padding: 4px;
    }

    .modal-bottom-bar {
        display: flex;
        justify-content: flex-end;
    }

    button {
        background-color: var(--danger);
        border-radius: 8px;
        color: white;
        padding: 8px 24px;
        font-size: 0.9rem;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    button:hover {
        background-color: var(--danger-hover);
        box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2);
        transform: translateY(-1px);
    }
    button:active {
        transform: translateY(0);
    }
</style>

<main>
    <div class="modal-title">
        Are you sure you want to delete collection <strong>{collectionName}</strong>?
    </div>
    <div class="modal-bottom-bar">
        <button class="pointer" onclick={close}>Delete</button>
    </div>
</main>
