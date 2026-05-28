<!--
    Modified Methods
 1. Open - This method returns a promise which will return an
           object when modal is closed (may be null)
 2. Close - You can call this and pass an object which will be returned
           by the promise in open
-->
<script>
    import { setContext as baseSetContext } from "svelte";
    import { fade } from "svelte/transition";
    export let key = "simple-modal";
    export let closeButton = true;
    export let closeOnEsc = true;
    export let closeOnOuterClick = true;
    export let transitionBg = fade;
    export let transitionBgProps = { duration: 250 };
    export let transitionWindow = transitionBg;
    export let transitionWindowProps = transitionBgProps;
    export let styleBg = { top: 0, left: 0 };
    export let styleWindow = {};
    export let styleContent = {};
    export let setContext = baseSetContext;
    let Component = null;
    let props = null;
    let background;
    let wrap;
    let customStyleBg = {};
    let customStyleWindow = {};
    let customStyleContent = {};
    const camelCaseToDash = (str) =>
        str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    const toCssString = (props) =>
        Object.keys(props).reduce(
            (str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`,
            ""
        );
    $: cssBg = toCssString(Object.assign({}, styleBg, customStyleBg));
    $: cssWindow = toCssString(
        Object.assign({}, styleWindow, customStyleWindow)
    );
    $: cssContent = toCssString(
        Object.assign({}, styleContent, customStyleContent)
    );

    var resolver;
    const open = (
        NewComponent,
        newProps = {},
        style = { bg: {}, window: {}, content: {} }
    ) =>
        new Promise((resolve) => {
            resolver = resolve;
            Component = NewComponent;
            props = newProps;
            customStyleBg = style.bg || {};
            customStyleWindow = style.window || {};
            customStyleContent = style.content || {};
        });
    const close = (objectToReturn) => {
        Component = null;
        props = null;
        customStyleBg = {};
        customStyleWindow = {};
        customStyleContent = {};
        resolver(objectToReturn);
    };
    const handleKeyup = ({ key }) => {
        if (closeOnEsc && Component && key === "Escape") {
            event.preventDefault();
            close();
        }
    };
    const handleOuterClick = (event) => {
        if (
            closeOnOuterClick &&
            (event.target === background || event.target === wrap)
        ) {
            event.preventDefault();
            close();
        }
    };
    setContext(key, { open, close });
</script>

<style>
    * {
        box-sizing: border-box;
    }

    .bg {
        position: fixed;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    }

    .window-wrap {
        position: relative;
        margin: 2rem;
        max-height: 100%;
    }

    .window {
        position: relative;
        width: 40rem;
        max-width: 100%;
        max-height: 100%;
        margin: 2rem auto;
        color: var(--txt);
        border-radius: 12px;
        background: var(--bg);
        border: 1px solid var(--outline-btn-border);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .content {
        position: relative;
        padding: 24px;
        max-height: calc(100vh - 6rem);
        overflow: auto;
    }

    .close {
        display: block;
        box-sizing: border-box;
        position: absolute;
        z-index: 1000;
        top: 1.2rem;
        right: 1.2rem;
        margin: 0;
        padding: 0;
        width: 1.6rem;
        height: 1.6rem;
        border: 0;
        color: var(--txt);
        border-radius: 50%;
        background: var(--outline-btn-hover);
        transition: transform 0.2s, background 0.2s;
        -webkit-appearance: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close:before,
    .close:after {
        content: "";
        display: block;
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        width: 0.8rem;
        height: 2px;
        background: var(--txt);
        transform-origin: center;
        transition: background 0.2s;
    }

    .close:before {
        transform: translate(0, -50%) rotate(45deg);
        left: 0.4rem;
    }

    .close:after {
        transform: translate(0, -50%) rotate(-45deg);
        left: 0.4rem;
    }

    .close:hover {
        background: var(--danger);
    }

    .close:hover:before,
    .close:hover:after {
        background: white;
    }

    .close:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--accent);
    }

    .close:active {
        transform: scale(0.9);
    }
</style>

<!--Base Modal Code taken from https://github.com/flekschas/svelte-simple-modal/blob/master/src/Modal.svelte -->
<!--
    Modified Methods
 1. Open - This method returns a promise which will return an
           object when modal is closed (may be null)
 2. Close - You can call this and pass an object which will be returned
           by the promise in open
-->
<svelte:window on:keyup={handleKeyup} />

<div>
    {#if Component}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="bg"
            onclick={handleOuterClick}
            bind:this={background}
            transition:transitionBg={transitionBgProps}
            style={cssBg}>
            <div class="window-wrap" bind:this={wrap}>
                <div
                    class="window"
                    transition:transitionWindow={transitionWindowProps}
                    style={cssWindow}>
                    {#if closeButton}
                        <button onclick={close} class="close" />
                    {/if}
                    <div class="content" style={cssContent}>
                        <svelte:component this={Component} {...props}/>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <slot />
</div>
