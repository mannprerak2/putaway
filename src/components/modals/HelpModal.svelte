<script>
    import { getContext } from "svelte";
    const { close } = getContext("simple-modal");
</script>

<style>
    .help-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--collection-separator);
    }
    .help-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--txt);
        margin: 0;
    }
    .help-icon {
        font-size: 1.5rem;
    }
    .help-content {
        display: flex;
        flex-direction: column;
        gap: 18px;
        color: var(--txt);
        font-size: 0.9rem;
        line-height: 1.5;
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 8px;
        scrollbar-width: thin;
    }
    .section-card {
        background: var(--card-hover-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 8px;
        padding: 14px;
    }
    .section-title {
        font-weight: 600;
        font-size: 0.95rem;
        margin-top: 0;
        margin-bottom: 8px;
        color: var(--accent);
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .feature-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 0;
        padding-left: 0;
        list-style: none;
    }
    .feature-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    .feature-emoji {
        flex-shrink: 0;
        font-size: 1rem;
    }
    .modal-bottom-bar {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 12px;
        border-top: 1px solid var(--collection-separator);
    }
    .btn-close {
        background-color: var(--accent);
        color: var(--accent-txt, white);
        border: none;
        border-radius: 8px;
        padding: 8px 24px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px var(--accent-glow);
    }
    .btn-close:hover {
        background-color: var(--accent-hover);
        transform: translateY(-1px);
    }
</style>

<main>
    <div class="help-header">
        <span class="help-icon">💡</span>
        <h3 class="help-title">How PutAway Works</h3>
    </div>

    <div class="help-content">
        <div class="section-card">
            <h4 class="section-title">📦 Where is my data stored?</h4>
            <p style="margin: 0;">
                All your collections and bookmarks are stored <strong>100% locally on your computer</strong> using Chrome's native <strong>Bookmarks API</strong>. 
                Each collection corresponds directly to a bookmark folder inside <code>Other Bookmarks &gt; PutAway</code>. 
                If you have Chrome Sync enabled, your collections will sync securely to your other devices automatically!
            </p>
        </div>

        <div class="section-card">
            <h4 class="section-title">🔒 Privacy & Security</h4>
            <p style="margin: 0;">
                PutAway is entirely serverless and client-side. We have <strong>no analytics, no telemetry trackers, and no external servers</strong>. 
                Your tab and bookmark data never leaves your local browser sandbox.
            </p>
        </div>

        <div class="section-card">
            <h4 class="section-title">✨ Drag-and-Drop Guides</h4>
            <ul class="feature-list">
                <li class="feature-item">
                    <span class="feature-emoji">📂</span>
                    <span>Drag a collection card header to reorder your collections.</span>
                </li>
                <li class="feature-item">
                    <span class="feature-emoji">🔖</span>
                    <span>Drag bookmark tiles to reorder them or move them between collections.</span>
                </li>
                <li class="feature-item">
                    <span class="feature-emoji">💻</span>
                    <span>Drag open tabs from the sidebar to save them. Hold <strong>Ctrl</strong> or <strong>Alt</strong> while dropping to close the tab in your browser automatically.</span>
                </li>
                <li class="feature-item">
                    <span class="feature-emoji">🗑️</span>
                    <span>Drag any tab, bookmark, or collection card to the red <strong>Trash Zone</strong> at the bottom center to instantly close or delete it.</span>
                </li>
            </ul>
        </div>
    </div>

    <div class="modal-bottom-bar">
        <button class="btn-close pointer" onclick={close}>Got it</button>
    </div>
</main>
