
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const searchText = writable("");
    const archiveOnly = writable(false);

    // schema of this object
    /*
    {
        source: dragged element (string, first letter describes type (i, t)
        target: drop zone (string, can be "tab" or "item" or "collection")
        sourceObj: json of source
        targetObj: json of target
    }
    */
    const deo = writable({
        source: "null",
        target: "null"
    });

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/common/tooltip/Tooltip.svelte generated by Svelte v3.52.0 */
    const file = "src/components/common/tooltip/Tooltip.svelte";

    // (50:0) {#if isHovered}
    function create_if_block(ctx) {
    	let div;
    	let t;
    	let div_intro;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*truncatedTitle*/ ctx[1]);
    			set_style(div, "top", /*y*/ ctx[4] + "px");
    			set_style(div, "left", /*x*/ ctx[3] + "px");
    			set_style(div, "font-size", /*fontsize*/ ctx[0]);
    			attr_dev(div, "class", "tooltip svelte-aipbli");
    			add_location(div, file, 50, 1, 969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*truncatedTitle*/ 2) set_data_dev(t, /*truncatedTitle*/ ctx[1]);

    			if (dirty & /*y*/ 16) {
    				set_style(div, "top", /*y*/ ctx[4] + "px");
    			}

    			if (dirty & /*x*/ 8) {
    				set_style(div, "left", /*x*/ ctx[3] + "px");
    			}

    			if (dirty & /*fontsize*/ 1) {
    				set_style(div, "font-size", /*fontsize*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(50:0) {#if isHovered}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);
    	let if_block = /*isHovered*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(div, file, 42, 0, 845);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", /*mouseOver*/ ctx[5], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseLeave*/ ctx[7], false, false, false),
    					listen_dev(div, "mousemove", /*mouseMove*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*isHovered*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isHovered*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tooltip', slots, ['default']);
    	let { title = '' } = $$props;
    	let { xpos = "0" } = $$props;
    	let { ypos = "25" } = $$props;
    	let { fontsize = "1em" } = $$props;
    	let truncatedTitle = '';
    	let isHovered = false;
    	let x;
    	let y;

    	function mouseOver(event) {
    		if (title.length > 50) {
    			$$invalidate(1, truncatedTitle = title.slice(0, 50) + '...');
    		} else {
    			$$invalidate(1, truncatedTitle = title);
    		}

    		$$invalidate(2, isHovered = true);
    		$$invalidate(3, x = event.pageX + parseInt(xpos));
    		$$invalidate(4, y = event.pageY + parseInt(ypos));
    	}

    	function mouseMove(event) {
    		$$invalidate(3, x = event.pageX + parseInt(xpos));
    		$$invalidate(4, y = event.pageY + parseInt(ypos));
    	}

    	function mouseLeave() {
    		$$invalidate(2, isHovered = false);
    	}

    	const writable_props = ['title', 'xpos', 'ypos', 'fontsize'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tooltip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(8, title = $$props.title);
    		if ('xpos' in $$props) $$invalidate(9, xpos = $$props.xpos);
    		if ('ypos' in $$props) $$invalidate(10, ypos = $$props.ypos);
    		if ('fontsize' in $$props) $$invalidate(0, fontsize = $$props.fontsize);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		title,
    		xpos,
    		ypos,
    		fontsize,
    		truncatedTitle,
    		isHovered,
    		x,
    		y,
    		mouseOver,
    		mouseMove,
    		mouseLeave
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(8, title = $$props.title);
    		if ('xpos' in $$props) $$invalidate(9, xpos = $$props.xpos);
    		if ('ypos' in $$props) $$invalidate(10, ypos = $$props.ypos);
    		if ('fontsize' in $$props) $$invalidate(0, fontsize = $$props.fontsize);
    		if ('truncatedTitle' in $$props) $$invalidate(1, truncatedTitle = $$props.truncatedTitle);
    		if ('isHovered' in $$props) $$invalidate(2, isHovered = $$props.isHovered);
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fontsize,
    		truncatedTitle,
    		isHovered,
    		x,
    		y,
    		mouseOver,
    		mouseMove,
    		mouseLeave,
    		title,
    		xpos,
    		ypos,
    		$$scope,
    		slots
    	];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { title: 8, xpos: 9, ypos: 10, fontsize: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get title() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xpos() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xpos(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ypos() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ypos(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontsize() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontsize(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltejs-fontawesome/index.svelte generated by Svelte v3.52.0 */

    const file$1 = "node_modules/sveltejs-fontawesome/index.svelte";

    // (90:2) {:else}
    function create_else_block(ctx) {
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*icon*/ ctx[1].icon[4]);
    			attr_dev(path, "fill", /*color*/ ctx[2]);
    			add_location(path, file$1, 90, 4, 1796);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2 && path_d_value !== (path_d_value = /*icon*/ ctx[1].icon[4])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "fill", /*color*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(90:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:2) {#if Array.isArray(icon.icon[4])}
    function create_if_block$1(ctx) {
    	let path0;
    	let path0_d_value;
    	let path0_style_value;
    	let path1;
    	let path1_d_value;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", path0_d_value = /*icon*/ ctx[1].icon[4][0]);
    			attr_dev(path0, "fill", /*color*/ ctx[2]);
    			attr_dev(path0, "style", path0_style_value = `opacity: ${/*secondaryOpacity*/ ctx[4]}`);
    			add_location(path0, file$1, 84, 4, 1628);
    			attr_dev(path1, "d", path1_d_value = /*icon*/ ctx[1].icon[4][1]);
    			attr_dev(path1, "fill", /*secondaryColor*/ ctx[3]);
    			add_location(path1, file$1, 88, 4, 1731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2 && path0_d_value !== (path0_d_value = /*icon*/ ctx[1].icon[4][0])) {
    				attr_dev(path0, "d", path0_d_value);
    			}

    			if (dirty & /*color*/ 4) {
    				attr_dev(path0, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*secondaryOpacity*/ 16 && path0_style_value !== (path0_style_value = `opacity: ${/*secondaryOpacity*/ ctx[4]}`)) {
    				attr_dev(path0, "style", path0_style_value);
    			}

    			if (dirty & /*icon*/ 2 && path1_d_value !== (path1_d_value = /*icon*/ ctx[1].icon[4][1])) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (dirty & /*secondaryColor*/ 8) {
    				attr_dev(path1, "fill", /*secondaryColor*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(84:2) {#if Array.isArray(icon.icon[4])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let svg;
    	let show_if;
    	let svg_viewBox_value;
    	let svg_style_value;

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*icon*/ 2) show_if = null;
    		if (show_if == null) show_if = !!Array.isArray(/*icon*/ ctx[1].icon[4]);
    		if (show_if) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if_block.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = `0 0 ${/*icon*/ ctx[1].icon[0]} ${/*icon*/ ctx[1].icon[1]}`);
    			attr_dev(svg, "height", /*height*/ ctx[6]);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "style", svg_style_value = `transform: rotate(${/*rotate*/ ctx[0]}turn) scaleX(${/*flipX*/ ctx[7]}) scaleY(${/*flipY*/ ctx[8]}); ${/*style*/ ctx[5]}`);
    			add_location(svg, file$1, 75, 0, 1360);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if_block.m(svg, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(svg, null);
    				}
    			}

    			if (dirty & /*icon*/ 2 && svg_viewBox_value !== (svg_viewBox_value = `0 0 ${/*icon*/ ctx[1].icon[0]} ${/*icon*/ ctx[1].icon[1]}`)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*height*/ 64) {
    				attr_dev(svg, "height", /*height*/ ctx[6]);
    			}

    			if (dirty & /*rotate, flipX, flipY, style*/ 417 && svg_style_value !== (svg_style_value = `transform: rotate(${/*rotate*/ ctx[0]}turn) scaleX(${/*flipX*/ ctx[7]}) scaleY(${/*flipY*/ ctx[8]}); ${/*style*/ ctx[5]}`)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sveltejs_fontawesome', slots, []);
    	let { icon } = $$props;
    	let { color = "#000000" } = $$props;
    	let { secondaryColor = color } = $$props;
    	let { secondaryOpacity = "0.5" } = $$props;
    	let { size = "xs" } = $$props;
    	let { flip = "none" } = $$props;
    	let { rotate = "0" } = $$props;
    	let { style = "" } = $$props;
    	let height = size;
    	let flipX = "1";
    	let flipY = "1";

    	$$self.$$.on_mount.push(function () {
    		if (icon === undefined && !('icon' in $$props || $$self.$$.bound[$$self.$$.props['icon']])) {
    			console.warn("<Sveltejs_fontawesome> was created without expected prop 'icon'");
    		}
    	});

    	const writable_props = [
    		'icon',
    		'color',
    		'secondaryColor',
    		'secondaryOpacity',
    		'size',
    		'flip',
    		'rotate',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sveltejs_fontawesome> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('secondaryColor' in $$props) $$invalidate(3, secondaryColor = $$props.secondaryColor);
    		if ('secondaryOpacity' in $$props) $$invalidate(4, secondaryOpacity = $$props.secondaryOpacity);
    		if ('size' in $$props) $$invalidate(9, size = $$props.size);
    		if ('flip' in $$props) $$invalidate(10, flip = $$props.flip);
    		if ('rotate' in $$props) $$invalidate(0, rotate = $$props.rotate);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		icon,
    		color,
    		secondaryColor,
    		secondaryOpacity,
    		size,
    		flip,
    		rotate,
    		style,
    		height,
    		flipX,
    		flipY
    	});

    	$$self.$inject_state = $$props => {
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('secondaryColor' in $$props) $$invalidate(3, secondaryColor = $$props.secondaryColor);
    		if ('secondaryOpacity' in $$props) $$invalidate(4, secondaryOpacity = $$props.secondaryOpacity);
    		if ('size' in $$props) $$invalidate(9, size = $$props.size);
    		if ('flip' in $$props) $$invalidate(10, flip = $$props.flip);
    		if ('rotate' in $$props) $$invalidate(0, rotate = $$props.rotate);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    		if ('height' in $$props) $$invalidate(6, height = $$props.height);
    		if ('flipX' in $$props) $$invalidate(7, flipX = $$props.flipX);
    		if ('flipY' in $$props) $$invalidate(8, flipY = $$props.flipY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*size, rotate, flip*/ 1537) {
    			 {
    				switch (size) {
    					case "xs":
    						$$invalidate(6, height = "0.75em");
    						break;
    					case "sm":
    						$$invalidate(6, height = "0.875em");
    						break;
    					case "lg":
    						$$invalidate(6, height = "1.33em");
    						break;
    					case "2x":
    						$$invalidate(6, height = "2em");
    						break;
    					case "3x":
    						$$invalidate(6, height = "3em");
    						break;
    					case "4x":
    						$$invalidate(6, height = "4em");
    						break;
    					case "5x":
    						$$invalidate(6, height = "5em");
    						break;
    					case "6x":
    						$$invalidate(6, height = "6em");
    						break;
    					case "7x":
    						$$invalidate(6, height = "7em");
    						break;
    					case "8x":
    						$$invalidate(6, height = "8em");
    						break;
    					case "9x":
    						$$invalidate(6, height = "9em");
    						break;
    					case "10x":
    						$$invalidate(6, height = "10em");
    						break;
    				}

    				$$invalidate(0, rotate = rotate / 360);

    				switch (flip) {
    					case "h":
    						$$invalidate(7, flipX = -1);
    						break;
    					case "v":
    						$$invalidate(8, flipY = -1);
    						break;
    					case "hv":
    						$$invalidate(7, flipX = -1);
    						$$invalidate(8, flipY = -1);
    						break;
    					default:
    						$$invalidate(7, flipX = 1);
    						$$invalidate(8, flipY = 1);
    						break;
    				}
    			}
    		}
    	};

    	return [
    		rotate,
    		icon,
    		color,
    		secondaryColor,
    		secondaryOpacity,
    		style,
    		height,
    		flipX,
    		flipY,
    		size,
    		flip
    	];
    }

    class Sveltejs_fontawesome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			icon: 1,
    			color: 2,
    			secondaryColor: 3,
    			secondaryOpacity: 4,
    			size: 9,
    			flip: 10,
    			rotate: 0,
    			style: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sveltejs_fontawesome",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get icon() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryColor() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryColor(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryOpacity() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryOpacity(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Sveltejs_fontawesome>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var faTimesCircle = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'times-circle';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f057';
    var svgPathData = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faTimesCircle = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faTimesCircle);
    var faTimesCircle_1 = faTimesCircle.definition;
    var faTimesCircle_2 = faTimesCircle.faTimesCircle;
    var faTimesCircle_3 = faTimesCircle.prefix;
    var faTimesCircle_4 = faTimesCircle.iconName;
    var faTimesCircle_5 = faTimesCircle.width;
    var faTimesCircle_6 = faTimesCircle.height;
    var faTimesCircle_7 = faTimesCircle.ligatures;
    var faTimesCircle_8 = faTimesCircle.unicode;
    var faTimesCircle_9 = faTimesCircle.svgPathData;

    /* src/components/modals/EditQuickLinksModal.svelte generated by Svelte v3.52.0 */
    const file$2 = "src/components/modals/EditQuickLinksModal.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (36:4) {#each quickLinks as ql, index}
    function create_each_block(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let strong0;
    	let t2;
    	let input0;
    	let t3;
    	let strong1;
    	let t5;
    	let input1;
    	let t6;
    	let div0;
    	let fa;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[5].call(input0, /*each_value*/ ctx[10], /*index*/ ctx[11]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[6].call(input1, /*each_value*/ ctx[10], /*index*/ ctx[11]);
    	}

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faTimesCircle_2,
    				size: "2x",
    				style: "margin-left: 5px"
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*index*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			strong0 = element("strong");
    			strong0.textContent = "URL:";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			strong1 = element("strong");
    			strong1.textContent = "ICON:";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			div0 = element("div");
    			create_component(fa.$$.fragment);
    			t7 = space();
    			attr_dev(img, "alt", " ");
    			if (!src_url_equal(img.src, img_src_value = /*ql*/ ctx[9].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "26px");
    			set_style(img, "padding", "5px");
    			add_location(img, file$2, 37, 12, 893);
    			add_location(strong0, file$2, 38, 12, 970);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-u4xvfp");
    			add_location(input0, file$2, 39, 12, 1005);
    			set_style(strong1, "margin-left", "5px");
    			add_location(strong1, file$2, 40, 12, 1059);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-u4xvfp");
    			add_location(input1, file$2, 41, 12, 1120);
    			attr_dev(div0, "class", "pointer");
    			add_location(div0, file$2, 43, 12, 1244);
    			attr_dev(div1, "class", "flex-row-container");
    			add_location(div1, file$2, 36, 8, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, strong0);
    			append_dev(div1, t2);
    			append_dev(div1, input0);
    			set_input_value(input0, /*ql*/ ctx[9].url);
    			append_dev(div1, t3);
    			append_dev(div1, strong1);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			set_input_value(input1, /*ql*/ ctx[9].icon);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			mount_component(fa, div0, null);
    			append_dev(div1, t7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(div0, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*quickLinks*/ 1 && !src_url_equal(img.src, img_src_value = /*ql*/ ctx[9].icon)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*quickLinks*/ 1 && input0.value !== /*ql*/ ctx[9].url) {
    				set_input_value(input0, /*ql*/ ctx[9].url);
    			}

    			if (dirty & /*quickLinks*/ 1 && input1.value !== /*ql*/ ctx[9].icon) {
    				set_input_value(input1, /*ql*/ ctx[9].icon);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(fa);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(36:4) {#each quickLinks as ql, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let t2;
    	let div0;
    	let t4;
    	let div1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*quickLinks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Edit Quick links -";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Add new link";
    			t4 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Save";
    			add_location(h1, file$2, 33, 4, 775);
    			attr_dev(div0, "id", "add-quick-link");
    			attr_dev(div0, "class", "pointer flex-row-container svelte-u4xvfp");
    			set_style(div0, "font-size", "2em");
    			set_style(div0, "margin-right", "30%");
    			set_style(div0, "margin-left", "30%");
    			set_style(div0, "margin-top", "5px");
    			set_style(div0, "border", "1px dashed gray");
    			set_style(div0, "border-radius", "30px");
    			set_style(div0, "justify-content", "space-evenly");
    			add_location(div0, file$2, 49, 4, 1491);
    			attr_dev(button, "class", "pointer svelte-u4xvfp");
    			add_location(button, file$2, 53, 8, 1826);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-u4xvfp");
    			set_style(div1, "margin", "auto");
    			add_location(div1, file$2, 52, 4, 1766);
    			add_location(main, file$2, 32, 0, 764);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t2);
    			append_dev(main, div0);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*handleKeyUp*/ ctx[2], false, false, false),
    					listen_dev(div0, "click", /*addQuickLink*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*onClickSave*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteLink, faTimesCircle, quickLinks*/ 9) {
    				each_value = /*quickLinks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditQuickLinksModal', slots, []);
    	const { close } = getContext("simple-modal");
    	let { quickLinks } = $$props;

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
    		$$invalidate(0, quickLinks);
    	}

    	function addQuickLink() {
    		quickLinks.push({ icon: "", url: "" });
    		$$invalidate(0, quickLinks);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (quickLinks === undefined && !('quickLinks' in $$props || $$self.$$.bound[$$self.$$.props['quickLinks']])) {
    			console.warn("<EditQuickLinksModal> was created without expected prop 'quickLinks'");
    		}
    	});

    	const writable_props = ['quickLinks'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditQuickLinksModal> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler(each_value, index) {
    		each_value[index].url = this.value;
    		$$invalidate(0, quickLinks);
    	}

    	function input1_input_handler(each_value, index) {
    		each_value[index].icon = this.value;
    		$$invalidate(0, quickLinks);
    	}

    	const click_handler = index => deleteLink(index);

    	$$self.$$set = $$props => {
    		if ('quickLinks' in $$props) $$invalidate(0, quickLinks = $$props.quickLinks);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		close,
    		Fa: Sveltejs_fontawesome,
    		faTimesCircle: faTimesCircle_2,
    		quickLinks,
    		onClickSave,
    		handleKeyUp,
    		deleteLink,
    		addQuickLink
    	});

    	$$self.$inject_state = $$props => {
    		if ('quickLinks' in $$props) $$invalidate(0, quickLinks = $$props.quickLinks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		quickLinks,
    		onClickSave,
    		handleKeyUp,
    		deleteLink,
    		addQuickLink,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler
    	];
    }

    class EditQuickLinksModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { quickLinks: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditQuickLinksModal",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get quickLinks() {
    		throw new Error("<EditQuickLinksModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quickLinks(value) {
    		throw new Error("<EditQuickLinksModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var faPenAlt = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'pen-alt';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f305';
    var svgPathData = 'M497.94 74.17l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.75 18.75-49.15 0-67.91zm-246.8-20.53c-15.62-15.62-40.94-15.62-56.56 0L75.8 172.43c-6.25 6.25-6.25 16.38 0 22.62l22.63 22.63c6.25 6.25 16.38 6.25 22.63 0l101.82-101.82 22.63 22.62L93.95 290.03A327.038 327.038 0 0 0 .17 485.11l-.03.23c-1.7 15.28 11.21 28.2 26.49 26.51a327.02 327.02 0 0 0 195.34-93.8l196.79-196.79-82.77-82.77-84.85-84.85z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faPenAlt = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faPenAlt);
    var faPenAlt_1 = faPenAlt.definition;
    var faPenAlt_2 = faPenAlt.faPenAlt;
    var faPenAlt_3 = faPenAlt.prefix;
    var faPenAlt_4 = faPenAlt.iconName;
    var faPenAlt_5 = faPenAlt.width;
    var faPenAlt_6 = faPenAlt.height;
    var faPenAlt_7 = faPenAlt.ligatures;
    var faPenAlt_8 = faPenAlt.unicode;
    var faPenAlt_9 = faPenAlt.svgPathData;

    /* src/components/QuickLinks.svelte generated by Svelte v3.52.0 */
    const file$3 = "src/components/QuickLinks.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (50:4) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Quick Links";
    			set_style(div, "font-size", "2.5em");
    			set_style(div, "color", "gray");
    			add_location(div, file$3, 50, 8, 1583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(50:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#if quickLinks.length > 0}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*quickLinks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quickLinks, onClickLink*/ 1) {
    				each_value = /*quickLinks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(35:4) {#if quickLinks.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (37:12) <Tooltip title={ql.url}>
    function create_default_slot_1(ctx) {
    	let img;
    	let img_src_value;
    	let img_intro;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*ql*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr_dev(img, "alt", " ");
    			attr_dev(img, "class", "pointer");
    			if (!src_url_equal(img.src, img_src_value = /*ql*/ ctx[4].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "26px");
    			attr_dev(img, "width", "26px");
    			set_style(img, "padding", "5px");
    			add_location(img, file$3, 38, 16, 1230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*quickLinks*/ 1 && !src_url_equal(img.src, img_src_value = /*ql*/ ctx[4].icon)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fade, {});
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(37:12) <Tooltip title={ql.url}>",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#each quickLinks as ql}
    function create_each_block$1(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				title: /*ql*/ ctx[4].url,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};
    			if (dirty & /*quickLinks*/ 1) tooltip_changes.title = /*ql*/ ctx[4].url;

    			if (dirty & /*$$scope, quickLinks*/ 129) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:8) {#each quickLinks as ql}",
    		ctx
    	});

    	return block;
    }

    // (53:4) <Tooltip title="Edit">
    function create_default_slot(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faPenAlt_2,
    				size: "1.5em",
    				color: "var(--icon-color)",
    				style: "margin-left: 5px"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			add_location(div, file$3, 54, 8, 1754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onClickEditQuickLink*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(53:4) <Tooltip title=\\\"Edit\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let tooltip;
    	let div_intro;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*quickLinks*/ ctx[0].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	tooltip = new Tooltip({
    			props: {
    				title: "Edit",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			create_component(tooltip.$$.fragment);
    			attr_dev(div, "class", "dashbox-div flex-row-container svelte-1795gnt");
    			add_location(div, file$3, 33, 0, 986);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			mount_component(tooltip, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}

    			const tooltip_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(tooltip.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			destroy_component(tooltip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onClickLink(ql) {
    	chrome.tabs.create({ url: ql.url });
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('QuickLinks', slots, []);
    	const { open } = getContext("simple-modal");
    	let quickLinks = [];

    	onMount(() => {
    		chrome.storage.sync.get("quickLinks", function (v) {
    			if (v.quickLinks) {
    				$$invalidate(0, quickLinks = v.quickLinks);
    			}
    		});
    	});

    	async function onClickEditQuickLink() {
    		var c = await open(EditQuickLinksModal, { quickLinks });

    		if (c != null) {
    			$$invalidate(0, quickLinks = c);
    			chrome.storage.sync.set({ quickLinks });
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<QuickLinks> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ql => onClickLink(ql);

    	$$self.$capture_state = () => ({
    		Tooltip,
    		onMount,
    		getContext,
    		fade,
    		open,
    		EditQuickLinksModal,
    		Fa: Sveltejs_fontawesome,
    		faPenAlt: faPenAlt_2,
    		quickLinks,
    		onClickEditQuickLink,
    		onClickLink
    	});

    	$$self.$inject_state = $$props => {
    		if ('quickLinks' in $$props) $$invalidate(0, quickLinks = $$props.quickLinks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quickLinks, onClickEditQuickLink, click_handler];
    }

    class QuickLinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuickLinks",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var faSearch = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'search';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f002';
    var svgPathData = 'M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faSearch = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faSearch);
    var faSearch_1 = faSearch.definition;
    var faSearch_2 = faSearch.faSearch;
    var faSearch_3 = faSearch.prefix;
    var faSearch_4 = faSearch.iconName;
    var faSearch_5 = faSearch.width;
    var faSearch_6 = faSearch.height;
    var faSearch_7 = faSearch.ligatures;
    var faSearch_8 = faSearch.unicode;
    var faSearch_9 = faSearch.svgPathData;

    var faSun = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'sun';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f185';
    var svgPathData = 'M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faSun = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faSun);
    var faSun_1 = faSun.definition;
    var faSun_2 = faSun.faSun;
    var faSun_3 = faSun.prefix;
    var faSun_4 = faSun.iconName;
    var faSun_5 = faSun.width;
    var faSun_6 = faSun.height;
    var faSun_7 = faSun.ligatures;
    var faSun_8 = faSun.unicode;
    var faSun_9 = faSun.svgPathData;

    var faMoon = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'moon';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f186';
    var svgPathData = 'M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faMoon = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faMoon);
    var faMoon_1 = faMoon.definition;
    var faMoon_2 = faMoon.faMoon;
    var faMoon_3 = faMoon.prefix;
    var faMoon_4 = faMoon.iconName;
    var faMoon_5 = faMoon.width;
    var faMoon_6 = faMoon.height;
    var faMoon_7 = faMoon.ligatures;
    var faMoon_8 = faMoon.unicode;
    var faMoon_9 = faMoon.svgPathData;

    var faCog = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'cog';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f013';
    var svgPathData = 'M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faCog = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faCog);
    var faCog_1 = faCog.definition;
    var faCog_2 = faCog.faCog;
    var faCog_3 = faCog.prefix;
    var faCog_4 = faCog.iconName;
    var faCog_5 = faCog.width;
    var faCog_6 = faCog.height;
    var faCog_7 = faCog.ligatures;
    var faCog_8 = faCog.unicode;
    var faCog_9 = faCog.svgPathData;

    /* src/components/TopBar.svelte generated by Svelte v3.52.0 */
    const file$4 = "src/components/TopBar.svelte";

    // (70:12) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let fa;
    	let current;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faTimesCircle_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			set_style(div, "font-size", "2em");
    			set_style(div, "visibility", "hidden");
    			add_location(div, file$4, 70, 12, 2259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(70:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:12) {#if $searchText.length>0}
    function create_if_block_2(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faTimesCircle_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "2em");
    			add_location(div, file$4, 66, 16, 2042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(65:12) {#if $searchText.length>0}",
    		ctx
    	});

    	return block;
    }

    // (88:12) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Archive";
    			attr_dev(div, "id", "view-archive-button");
    			attr_dev(div, "class", "rounded-button pointer");
    			set_style(div, "font-size", "1.5em");
    			add_location(div, file$4, 89, 12, 3010);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleArchive*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(88:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:12) {#if archive}
    function create_if_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Archive";
    			attr_dev(div, "id", "view-archive-button");
    			attr_dev(div, "class", "rounded-button pointer");
    			set_style(div, "font-size", "1.5em");
    			set_style(div, "background-color", "#00ff0022");
    			add_location(div, file$4, 80, 12, 2661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleArchive*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(79:12) {#if archive}",
    		ctx
    	});

    	return block;
    }

    // (78:8) <Tooltip title="Toggle Archived Collections">
    function create_default_slot_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*archive*/ ctx[2]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(78:8) <Tooltip title=\\\"Toggle Archived Collections\\\">",
    		ctx
    	});

    	return block;
    }

    // (107:12) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faMoon_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "2em");
    			add_location(div, file$4, 108, 16, 3715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*toggleTheme*/ ctx[1])) /*toggleTheme*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(107:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (102:12) {#if darkTheme}
    function create_if_block$3(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faSun_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "2em");
    			add_location(div, file$4, 103, 16, 3438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*toggleTheme*/ ctx[1])) /*toggleTheme*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(102:12) {#if darkTheme}",
    		ctx
    	});

    	return block;
    }

    // (101:8) <Tooltip title="Toggle Theme">
    function create_default_slot_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*darkTheme*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(101:8) <Tooltip title=\\\"Toggle Theme\\\">",
    		ctx
    	});

    	return block;
    }

    // (115:8) <Tooltip title="Open Settings">
    function create_default_slot$1(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faCog_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "2em");
    			add_location(div, file$4, 116, 12, 4062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*openOptionsPage*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(115:8) <Tooltip title=\\\"Open Settings\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let div3;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let fa;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let quicklinks;
    	let t3;
    	let div2;
    	let t4;
    	let tooltip0;
    	let t5;
    	let tooltip1;
    	let t6;
    	let tooltip2;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faSearch_2,
    				size: "2x",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$searchText*/ ctx[3].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	quicklinks = new QuickLinks({ $$inline: true });

    	tooltip0 = new Tooltip({
    			props: {
    				title: "Toggle Archived Collections",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tooltip1 = new Tooltip({
    			props: {
    				title: "Toggle Theme",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tooltip2 = new Tooltip({
    			props: {
    				title: "Open Settings",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			create_component(fa.$$.fragment);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			create_component(quicklinks.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			create_component(tooltip0.$$.fragment);
    			t5 = text("\n\n         \n        ");
    			create_component(tooltip1.$$.fragment);
    			t6 = text("\n           \n        ");
    			create_component(tooltip2.$$.fragment);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search");
    			set_style(input, "width", "150px");
    			attr_dev(input, "class", "svelte-bqhk0s");
    			add_location(input, file$4, 60, 12, 1694);
    			attr_dev(div0, "class", "search-logo svelte-bqhk0s");
    			add_location(div0, file$4, 61, 12, 1794);
    			attr_dev(div1, "class", "search-div flex-row-container svelte-bqhk0s");
    			add_location(div1, file$4, 59, 8, 1638);
    			set_style(div2, "flex-grow", "1");
    			add_location(div2, file$4, 76, 8, 2471);
    			attr_dev(div3, "class", "flex-row-container");
    			add_location(div3, file$4, 58, 4, 1597);
    			add_location(main, file$4, 57, 0, 1586);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*$searchText*/ ctx[3]);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(fa, div0, null);
    			append_dev(div1, t1);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div3, t2);
    			mount_component(quicklinks, div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div3, t4);
    			mount_component(tooltip0, div3, null);
    			append_dev(div3, t5);
    			mount_component(tooltip1, div3, null);
    			append_dev(div3, t6);
    			mount_component(tooltip2, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$searchText*/ 8 && input.value !== /*$searchText*/ ctx[3]) {
    				set_input_value(input, /*$searchText*/ ctx[3]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			const tooltip0_changes = {};

    			if (dirty & /*$$scope, archive*/ 516) {
    				tooltip0_changes.$$scope = { dirty, ctx };
    			}

    			tooltip0.$set(tooltip0_changes);
    			const tooltip1_changes = {};

    			if (dirty & /*$$scope, toggleTheme, darkTheme*/ 515) {
    				tooltip1_changes.$$scope = { dirty, ctx };
    			}

    			tooltip1.$set(tooltip1_changes);
    			const tooltip2_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				tooltip2_changes.$$scope = { dirty, ctx };
    			}

    			tooltip2.$set(tooltip2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(quicklinks.$$.fragment, local);
    			transition_in(tooltip0.$$.fragment, local);
    			transition_in(tooltip1.$$.fragment, local);
    			transition_in(tooltip2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(quicklinks.$$.fragment, local);
    			transition_out(tooltip0.$$.fragment, local);
    			transition_out(tooltip1.$$.fragment, local);
    			transition_out(tooltip2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(fa);
    			if_blocks[current_block_type_index].d();
    			destroy_component(quicklinks);
    			destroy_component(tooltip0);
    			destroy_component(tooltip1);
    			destroy_component(tooltip2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $searchText;
    	validate_store(searchText, 'searchText');
    	component_subscribe($$self, searchText, $$value => $$invalidate(3, $searchText = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopBar', slots, []);
    	let { darkTheme } = $$props;
    	let { toggleTheme } = $$props;

    	//font awesome icons
    	let archive;

    	const unsubscribe = archiveOnly.subscribe(value => {
    		$$invalidate(2, archive = value);
    	});

    	var toggleArchive = () => {
    		$$invalidate(2, archive = !archive);
    		archiveOnly.set(archive);
    		searchText.set("");
    	};

    	var openOptionsPage = () => {
    		chrome.runtime.openOptionsPage();
    	};

    	onDestroy(unsubscribe);

    	$$self.$$.on_mount.push(function () {
    		if (darkTheme === undefined && !('darkTheme' in $$props || $$self.$$.bound[$$self.$$.props['darkTheme']])) {
    			console.warn("<TopBar> was created without expected prop 'darkTheme'");
    		}

    		if (toggleTheme === undefined && !('toggleTheme' in $$props || $$self.$$.bound[$$self.$$.props['toggleTheme']])) {
    			console.warn("<TopBar> was created without expected prop 'toggleTheme'");
    		}
    	});

    	const writable_props = ['darkTheme', 'toggleTheme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopBar> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$searchText = this.value;
    		searchText.set($searchText);
    	}

    	const click_handler = () => {
    		set_store_value(searchText, $searchText = "", $searchText);
    	};

    	$$self.$$set = $$props => {
    		if ('darkTheme' in $$props) $$invalidate(0, darkTheme = $$props.darkTheme);
    		if ('toggleTheme' in $$props) $$invalidate(1, toggleTheme = $$props.toggleTheme);
    	};

    	$$self.$capture_state = () => ({
    		searchText,
    		archiveOnly,
    		onDestroy,
    		Quicklinks: QuickLinks,
    		Tooltip,
    		darkTheme,
    		toggleTheme,
    		Fa: Sveltejs_fontawesome,
    		faSearch: faSearch_2,
    		faSun: faSun_2,
    		faMoon: faMoon_2,
    		faCog: faCog_2,
    		faTimesCircle: faTimesCircle_2,
    		archive,
    		unsubscribe,
    		toggleArchive,
    		openOptionsPage,
    		$searchText
    	});

    	$$self.$inject_state = $$props => {
    		if ('darkTheme' in $$props) $$invalidate(0, darkTheme = $$props.darkTheme);
    		if ('toggleTheme' in $$props) $$invalidate(1, toggleTheme = $$props.toggleTheme);
    		if ('archive' in $$props) $$invalidate(2, archive = $$props.archive);
    		if ('toggleArchive' in $$props) $$invalidate(4, toggleArchive = $$props.toggleArchive);
    		if ('openOptionsPage' in $$props) $$invalidate(5, openOptionsPage = $$props.openOptionsPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		darkTheme,
    		toggleTheme,
    		archive,
    		$searchText,
    		toggleArchive,
    		openOptionsPage,
    		input_input_handler,
    		click_handler
    	];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { darkTheme: 0, toggleTheme: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get darkTheme() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set darkTheme(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleTheme() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleTheme(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let globalSettings;

    async function loadGlobalSettings() {
        globalSettings = (await chrome.storage.sync.get("globalSettings")).globalSettings || {};
        return globalSettings
    }

    function saveTabHook(tab){
        if (!globalSettings) return

        // TODO: expose these settings via an Options Page
        if (globalSettings.saveTabHookTitleMatcher && globalSettings.saveTabHookTitleRenamer) {
            try{
                let matcher = globalSettings.saveTabHookTitleMatcher;
                let groups = tab.title.match(matcher);
                console.log(groups);
                if (groups.length < 2) return
                let renamer = globalSettings.saveTabHookTitleRenamer;
                // Replace groups if in renamer.
                for (var i=1; i<groups.length; i++) {
                    renamer = renamer.replace(`\$${i}`, groups[i]);
                }
                tab.title = renamer;
            }catch(e){}
        }
    }

    function useTabGroupInOpenAllTabs() {
        if (!globalSettings || !globalSettings.useTabGroupInOpenAllTabs) return 'open'
        return globalSettings.useTabGroupInOpenAllTabs
    }

    function getItemTileWidth() {
        if (!globalSettings || !globalSettings.itemTileWidth) return 15;
        return globalSettings.itemTileWidth
    }

    function getOpenTabsBarWidth() {
        if (!globalSettings || !globalSettings.openTabsBarWidth) return 20;
        return globalSettings.openTabsBarWidth
    }

    function getReloadBookmarkSectionOnChange() {
        if (!globalSettings || globalSettings.reloadBookmarkSectionOnChange === undefined) return true;
        return globalSettings.reloadBookmarkSectionOnChange
    }

    function getReloadOpenTabsSectionOnChange() {
        if (!globalSettings || globalSettings.reloadOpenTabsSectionOnChange === undefined) return true;
        return globalSettings.reloadOpenTabsSectionOnChange
    }

    // This is set when we create/move/update/delete via the new tab page only.
    let lastNewTabOperationTime = Date.now();

    function getlastNewTabOperationTimeNowDiffMs() {
        return Date.now() - lastNewTabOperationTime;
    }

    function setlastNewTabOperationTimeNow() {
        lastNewTabOperationTime = Date.now();
    }

    /* src/components/modals/CreateCollectionModal.svelte generated by Svelte v3.52.0 */
    const file$5 = "src/components/modals/CreateCollectionModal.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let input;
    	let input_onchange_value;
    	let t2;
    	let div1;
    	let div0;
    	let t3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Collection Name -";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t3 = text(/*errorString*/ ctx[1]);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Create Collection";
    			add_location(h1, file$5, 79, 4, 1827);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "onchange", input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]));
    			input.autofocus = true;
    			attr_dev(input, "class", "svelte-1dkdkti");
    			add_location(input, file$5, 82, 4, 1901);
    			set_style(div0, "padding", "10px");
    			set_style(div0, "color", "red");
    			add_location(div0, file$5, 85, 8, 2045);
    			attr_dev(button, "class", "pointer svelte-1dkdkti");
    			add_location(button, file$5, 86, 8, 2113);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-1dkdkti");
    			add_location(div1, file$5, 84, 4, 2006);
    			add_location(main, file$5, 78, 0, 1816);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, input);
    			set_input_value(input, /*collectionName*/ ctx[0]);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			input.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*handleKeyUp*/ ctx[3], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*onClickCreate*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*collectionName*/ 1 && input_onchange_value !== (input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]))) {
    				attr_dev(input, "onchange", input_onchange_value);
    			}

    			if (dirty & /*collectionName*/ 1 && input.value !== /*collectionName*/ ctx[0]) {
    				set_input_value(input, /*collectionName*/ ctx[0]);
    			}

    			if (dirty & /*errorString*/ 2) set_data_dev(t3, /*errorString*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CreateCollectionModal', slots, []);
    	let collectionName = "";
    	let errorString = "";
    	const { close } = getContext("simple-modal");

    	function createBookmarkFolder() {
    		chrome.storage.local.get("pid", function (map) {
    			setlastNewTabOperationTimeNow();

    			chrome.bookmarks.create(
    				{
    					parentId: map.pid,
    					title: collectionName,
    					index: 0
    				},
    				function (createdFolder) {
    					close(createdFolder);
    				}
    			);
    		});
    	}

    	var onClickCreate = () => {
    		$$invalidate(0, collectionName = collectionName.trim());

    		if (collectionName.length > 0) {
    			$$invalidate(1, errorString = "");
    			createBookmarkFolder();
    		} else {
    			$$invalidate(1, errorString = "Enter a collection Name");
    		}
    	};

    	function handleKeyUp(event) {
    		// on press enter
    		if (event.keyCode == 13) {
    			onClickCreate();
    		}
    	}

    	function inputFormatter(str) {
    		$$invalidate(0, collectionName = str.replace(/\s+/g, " "));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CreateCollectionModal> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		collectionName = this.value;
    		$$invalidate(0, collectionName);
    	}

    	$$self.$capture_state = () => ({
    		getContext,
    		setlastNewTabOperationTimeNow,
    		collectionName,
    		errorString,
    		close,
    		createBookmarkFolder,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter
    	});

    	$$self.$inject_state = $$props => {
    		if ('collectionName' in $$props) $$invalidate(0, collectionName = $$props.collectionName);
    		if ('errorString' in $$props) $$invalidate(1, errorString = $$props.errorString);
    		if ('onClickCreate' in $$props) $$invalidate(2, onClickCreate = $$props.onClickCreate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		collectionName,
    		errorString,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter,
    		input_input_handler
    	];
    }

    class CreateCollectionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateCollectionModal",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/modals/DeleteCollectionModal.svelte generated by Svelte v3.52.0 */
    const file$6 = "src/components/modals/DeleteCollectionModal.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = text("Are you sure you want to delete\n        ");
    			t1 = text(/*collectionName*/ ctx[0]);
    			t2 = text("\n        ?");
    			t3 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			set_style(div0, "padding", "10px");
    			set_style(div0, "font-size", "2em");
    			add_location(div0, file$6, 31, 4, 597);
    			attr_dev(button, "class", "pointer svelte-esd7z4");
    			add_location(button, file$6, 37, 8, 771);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-esd7z4");
    			add_location(div1, file$6, 36, 4, 732);
    			add_location(main, file$6, 30, 0, 586);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*collectionName*/ 1) set_data_dev(t1, /*collectionName*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DeleteCollectionModal', slots, []);
    	let { collectionName } = $$props;
    	const { close } = getContext("simple-modal");

    	$$self.$$.on_mount.push(function () {
    		if (collectionName === undefined && !('collectionName' in $$props || $$self.$$.bound[$$self.$$.props['collectionName']])) {
    			console.warn("<DeleteCollectionModal> was created without expected prop 'collectionName'");
    		}
    	});

    	const writable_props = ['collectionName'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DeleteCollectionModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('collectionName' in $$props) $$invalidate(0, collectionName = $$props.collectionName);
    	};

    	$$self.$capture_state = () => ({ getContext, collectionName, close });

    	$$self.$inject_state = $$props => {
    		if ('collectionName' in $$props) $$invalidate(0, collectionName = $$props.collectionName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [collectionName, close];
    }

    class DeleteCollectionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { collectionName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DeleteCollectionModal",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get collectionName() {
    		throw new Error("<DeleteCollectionModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collectionName(value) {
    		throw new Error("<DeleteCollectionModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/modals/ShareCollectionModal.svelte generated by Svelte v3.52.0 */
    const file$7 = "src/components/modals/ShareCollectionModal.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let textarea;
    	let t3;
    	let div1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = text("Share Collection -\n        ");
    			t1 = text(/*collectionName*/ ctx[1]);
    			t2 = space();
    			textarea = element("textarea");
    			t3 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Copy Text";
    			set_style(div0, "padding", "10px");
    			set_style(div0, "font-size", "2em");
    			add_location(div0, file$7, 55, 4, 1149);
    			attr_dev(textarea, "id", "share-text-input");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "svelte-11ov3yo");
    			add_location(textarea, file$7, 60, 4, 1262);
    			attr_dev(button, "class", "pointer svelte-11ov3yo");
    			add_location(button, file$7, 63, 8, 1375);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-11ov3yo");
    			add_location(div1, file$7, 62, 4, 1336);
    			add_location(main, file$7, 54, 0, 1138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(main, t2);
    			append_dev(main, textarea);
    			set_input_value(textarea, /*shareText*/ ctx[0]);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[3]),
    					listen_dev(button, "click", /*copyTextAndClose*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*collectionName*/ 2) set_data_dev(t1, /*collectionName*/ ctx[1]);

    			if (dirty & /*shareText*/ 1) {
    				set_input_value(textarea, /*shareText*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ShareCollectionModal', slots, []);
    	let { collectionName } = $$props;
    	let { shareText } = $$props;
    	const { close } = getContext("simple-modal");

    	var copyTextAndClose = () => {
    		var copyText = document.getElementById("share-text-input");

    		/* Select the text field */
    		copyText.select();

    		/* Copy the text inside the text field */
    		document.execCommand("copy");

    		close();
    	};

    	$$self.$$.on_mount.push(function () {
    		if (collectionName === undefined && !('collectionName' in $$props || $$self.$$.bound[$$self.$$.props['collectionName']])) {
    			console.warn("<ShareCollectionModal> was created without expected prop 'collectionName'");
    		}

    		if (shareText === undefined && !('shareText' in $$props || $$self.$$.bound[$$self.$$.props['shareText']])) {
    			console.warn("<ShareCollectionModal> was created without expected prop 'shareText'");
    		}
    	});

    	const writable_props = ['collectionName', 'shareText'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ShareCollectionModal> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		shareText = this.value;
    		$$invalidate(0, shareText);
    	}

    	$$self.$$set = $$props => {
    		if ('collectionName' in $$props) $$invalidate(1, collectionName = $$props.collectionName);
    		if ('shareText' in $$props) $$invalidate(0, shareText = $$props.shareText);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		collectionName,
    		shareText,
    		close,
    		copyTextAndClose
    	});

    	$$self.$inject_state = $$props => {
    		if ('collectionName' in $$props) $$invalidate(1, collectionName = $$props.collectionName);
    		if ('shareText' in $$props) $$invalidate(0, shareText = $$props.shareText);
    		if ('copyTextAndClose' in $$props) $$invalidate(2, copyTextAndClose = $$props.copyTextAndClose);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [shareText, collectionName, copyTextAndClose, textarea_input_handler];
    }

    class ShareCollectionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { collectionName: 1, shareText: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShareCollectionModal",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get collectionName() {
    		throw new Error("<ShareCollectionModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collectionName(value) {
    		throw new Error("<ShareCollectionModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shareText() {
    		throw new Error("<ShareCollectionModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shareText(value) {
    		throw new Error("<ShareCollectionModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/modals/ArchiveCollectionModal.svelte generated by Svelte v3.52.0 */
    const file$8 = "src/components/modals/ArchiveCollectionModal.svelte";

    // (14:8) {:else}
    function create_else_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Unarchive");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(14:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:8) {#if toArchive}
    function create_if_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Archive");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:8) {#if toArchive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let t1;
    	let t2_value = /*collection*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*toArchive*/ ctx[1]) return create_if_block$4;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = text("Are you sure you want to\n        ");
    			if_block.c();
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text("\n        ?");
    			t4 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Yes";
    			set_style(div0, "padding", "10px");
    			set_style(div0, "font-size", "2em");
    			add_location(div0, file$8, 9, 4, 176);
    			attr_dev(button, "class", "pointer svelte-esd7z4");
    			add_location(button, file$8, 20, 8, 441);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-esd7z4");
    			add_location(div1, file$8, 19, 4, 402);
    			add_location(main, file$8, 8, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, t0);
    			if_block.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, t1);
    				}
    			}

    			if (dirty & /*collection*/ 1 && t2_value !== (t2_value = /*collection*/ ctx[0].title + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ArchiveCollectionModal', slots, []);
    	let { collection } = $$props;
    	let { toArchive } = $$props;
    	const { close } = getContext("simple-modal");

    	$$self.$$.on_mount.push(function () {
    		if (collection === undefined && !('collection' in $$props || $$self.$$.bound[$$self.$$.props['collection']])) {
    			console.warn("<ArchiveCollectionModal> was created without expected prop 'collection'");
    		}

    		if (toArchive === undefined && !('toArchive' in $$props || $$self.$$.bound[$$self.$$.props['toArchive']])) {
    			console.warn("<ArchiveCollectionModal> was created without expected prop 'toArchive'");
    		}
    	});

    	const writable_props = ['collection', 'toArchive'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ArchiveCollectionModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('collection' in $$props) $$invalidate(0, collection = $$props.collection);
    		if ('toArchive' in $$props) $$invalidate(1, toArchive = $$props.toArchive);
    	};

    	$$self.$capture_state = () => ({ getContext, collection, toArchive, close });

    	$$self.$inject_state = $$props => {
    		if ('collection' in $$props) $$invalidate(0, collection = $$props.collection);
    		if ('toArchive' in $$props) $$invalidate(1, toArchive = $$props.toArchive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [collection, toArchive, close];
    }

    class ArchiveCollectionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { collection: 0, toArchive: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArchiveCollectionModal",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get collection() {
    		throw new Error("<ArchiveCollectionModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collection(value) {
    		throw new Error("<ArchiveCollectionModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toArchive() {
    		throw new Error("<ArchiveCollectionModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toArchive(value) {
    		throw new Error("<ArchiveCollectionModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var faTimes = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'times';
    var width = 352;
    var height = 512;
    var ligatures = [];
    var unicode = 'f00d';
    var svgPathData = 'M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faTimes = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faTimes);
    var faTimes_1 = faTimes.definition;
    var faTimes_2 = faTimes.faTimes;
    var faTimes_3 = faTimes.prefix;
    var faTimes_4 = faTimes.iconName;
    var faTimes_5 = faTimes.width;
    var faTimes_6 = faTimes.height;
    var faTimes_7 = faTimes.ligatures;
    var faTimes_8 = faTimes.unicode;
    var faTimes_9 = faTimes.svgPathData;

    /* src/components/tiles/ItemTile.svelte generated by Svelte v3.52.0 */
    const file$9 = "src/components/tiles/ItemTile.svelte";

    // (110:4) {:else}
    function create_else_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "var(--bg)");
    			add_location(div, file$9, 110, 8, 2707);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(110:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if dropLine}
    function create_if_block$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "var(--drop-indicator)");
    			add_location(div, file$9, 108, 8, 2623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(108:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div5;
    	let t0;
    	let div4;
    	let button0;
    	let div0;
    	let fa0;
    	let t1;
    	let button1;
    	let div1;
    	let fa1;
    	let t2;
    	let div3;
    	let img;
    	let img_src_value;
    	let t3;
    	let div2;
    	let t4_value = /*item*/ ctx[1].title.split(':::::')[0] + "";
    	let t4;
    	let div2_title_value;
    	let div4_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[5]) return create_if_block$5;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	fa0 = new Sveltejs_fontawesome({
    			props: {
    				icon: faTimes_2,
    				size: "sm",
    				color: "white"
    			},
    			$$inline: true
    		});

    	fa1 = new Sveltejs_fontawesome({
    			props: {
    				icon: faPenAlt_2,
    				size: "sm",
    				color: "white"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			if_block.c();
    			t0 = space();
    			div4 = element("div");
    			button0 = element("button");
    			div0 = element("div");
    			create_component(fa0.$$.fragment);
    			t1 = space();
    			button1 = element("button");
    			div1 = element("div");
    			create_component(fa1.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			img = element("img");
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			set_style(div0, "color", "white");
    			set_style(div0, "margin-left", "-4px");
    			set_style(div0, "margin-top", "-2px");
    			add_location(div0, file$9, 127, 12, 3430);
    			attr_dev(button0, "class", "close-icon pointer svelte-sksnrd");
    			add_location(button0, file$9, 124, 8, 3283);
    			set_style(div1, "color", "white");
    			set_style(div1, "margin-left", "-5px");
    			set_style(div1, "margin-top", "-3px");
    			set_style(div1, "transform", "scale(0.8)");
    			add_location(div1, file$9, 134, 16, 3765);
    			attr_dev(button1, "class", "edit-icon pointer svelte-sksnrd");
    			add_location(button1, file$9, 131, 12, 3605);
    			attr_dev(img, "alt", " ");
    			attr_dev(img, "border", "0");
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[1].title.split(':::::')[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "20px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$9, 140, 12, 4018);
    			attr_dev(div2, "class", "text-concat svelte-sksnrd");
    			attr_dev(div2, "title", div2_title_value = /*item*/ ctx[1].title.split(':::::')[0]);
    			add_location(div2, file$9, 147, 12, 4215);
    			attr_dev(div3, "class", "flex-row-container");
    			add_location(div3, file$9, 139, 8, 3973);
    			attr_dev(div4, "class", "item svelte-sksnrd");
    			set_style(div4, "background-color", /*item*/ ctx[1].title.split(":::::")[2]);
    			set_style(div4, "width", /*tileWidth*/ ctx[6] + "em");
    			attr_dev(div4, "draggable", "true");
    			add_location(div4, file$9, 113, 4, 2834);
    			attr_dev(div5, "class", "flex-row-container");
    			set_style(div5, "height", "100%");
    			add_location(div5, file$9, 106, 0, 2541);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			if_block.m(div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(button0, div0);
    			mount_component(fa0, div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, button1);
    			append_dev(button1, div1);
    			mount_component(fa1, div1, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, img);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", stop_propagation(prevent_default(/*click_handler*/ ctx[12])), false, true, true),
    					listen_dev(button1, "click", stop_propagation(prevent_default(/*click_handler_1*/ ctx[13])), false, true, true),
    					listen_dev(div4, "dragover", prevent_default(/*onDragEnter*/ ctx[7]), false, true, false),
    					listen_dev(div4, "dragleave", /*onDragLeave*/ ctx[8], false, false, false),
    					listen_dev(div4, "dragstart", /*handleDragStart*/ ctx[9], false, false, false),
    					listen_dev(div4, "drop", /*handleDrop*/ ctx[10], false, false, false),
    					listen_dev(div4, "auxclick", prevent_default(/*auxclick_handler*/ ctx[14]), false, true, false),
    					listen_dev(div4, "click", prevent_default(/*click_handler_2*/ ctx[15]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div5, t0);
    				}
    			}

    			if (!current || dirty & /*item*/ 2 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[1].title.split(':::::')[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*item*/ 2) && t4_value !== (t4_value = /*item*/ ctx[1].title.split(':::::')[0] + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*item*/ 2 && div2_title_value !== (div2_title_value = /*item*/ ctx[1].title.split(':::::')[0])) {
    				attr_dev(div2, "title", div2_title_value);
    			}

    			if (!current || dirty & /*item*/ 2) {
    				set_style(div4, "background-color", /*item*/ ctx[1].title.split(":::::")[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa0.$$.fragment, local);
    			transition_in(fa1.$$.fragment, local);
    			if (div4_outro) div4_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa0.$$.fragment, local);
    			transition_out(fa1.$$.fragment, local);
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block.d();
    			destroy_component(fa0);
    			destroy_component(fa1);
    			if (detaching && div4_outro) div4_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemTile', slots, []);
    	let { index } = $$props;
    	let { item } = $$props;
    	let { onItemDelete } = $$props;
    	let { onClickItem } = $$props;
    	let { onClickItemEdit } = $$props;
    	let { onDrop } = $$props;
    	let tileWidth = getItemTileWidth();
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(5, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(5, dropLine = false);
    	};

    	var handleDragStart = e => {
    		e.dataTransfer.setData("text", "i" + index.toString());
    		e.dataTransfer.setData("object", JSON.stringify(item));
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(5, dropLine = false);
    		onDrop(e, index);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<ItemTile> was created without expected prop 'index'");
    		}

    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console.warn("<ItemTile> was created without expected prop 'item'");
    		}

    		if (onItemDelete === undefined && !('onItemDelete' in $$props || $$self.$$.bound[$$self.$$.props['onItemDelete']])) {
    			console.warn("<ItemTile> was created without expected prop 'onItemDelete'");
    		}

    		if (onClickItem === undefined && !('onClickItem' in $$props || $$self.$$.bound[$$self.$$.props['onClickItem']])) {
    			console.warn("<ItemTile> was created without expected prop 'onClickItem'");
    		}

    		if (onClickItemEdit === undefined && !('onClickItemEdit' in $$props || $$self.$$.bound[$$self.$$.props['onClickItemEdit']])) {
    			console.warn("<ItemTile> was created without expected prop 'onClickItemEdit'");
    		}

    		if (onDrop === undefined && !('onDrop' in $$props || $$self.$$.bound[$$self.$$.props['onDrop']])) {
    			console.warn("<ItemTile> was created without expected prop 'onDrop'");
    		}
    	});

    	const writable_props = ['index', 'item', 'onItemDelete', 'onClickItem', 'onClickItemEdit', 'onDrop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemTile> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onItemDelete(item, index);
    	const click_handler_1 = () => onClickItemEdit(item, index);
    	const auxclick_handler = e => onClickItem(item, e, true);
    	const click_handler_2 = e => onClickItem(item, e);

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    		if ('item' in $$props) $$invalidate(1, item = $$props.item);
    		if ('onItemDelete' in $$props) $$invalidate(2, onItemDelete = $$props.onItemDelete);
    		if ('onClickItem' in $$props) $$invalidate(3, onClickItem = $$props.onClickItem);
    		if ('onClickItemEdit' in $$props) $$invalidate(4, onClickItemEdit = $$props.onClickItemEdit);
    		if ('onDrop' in $$props) $$invalidate(11, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		getItemTileWidth,
    		Fa: Sveltejs_fontawesome,
    		faPenAlt: faPenAlt_2,
    		faTimes: faTimes_2,
    		index,
    		item,
    		onItemDelete,
    		onClickItem,
    		onClickItemEdit,
    		onDrop,
    		tileWidth,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    		if ('item' in $$props) $$invalidate(1, item = $$props.item);
    		if ('onItemDelete' in $$props) $$invalidate(2, onItemDelete = $$props.onItemDelete);
    		if ('onClickItem' in $$props) $$invalidate(3, onClickItem = $$props.onClickItem);
    		if ('onClickItemEdit' in $$props) $$invalidate(4, onClickItemEdit = $$props.onClickItemEdit);
    		if ('onDrop' in $$props) $$invalidate(11, onDrop = $$props.onDrop);
    		if ('tileWidth' in $$props) $$invalidate(6, tileWidth = $$props.tileWidth);
    		if ('dropLine' in $$props) $$invalidate(5, dropLine = $$props.dropLine);
    		if ('onDragEnter' in $$props) $$invalidate(7, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(8, onDragLeave = $$props.onDragLeave);
    		if ('handleDragStart' in $$props) $$invalidate(9, handleDragStart = $$props.handleDragStart);
    		if ('handleDrop' in $$props) $$invalidate(10, handleDrop = $$props.handleDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		item,
    		onItemDelete,
    		onClickItem,
    		onClickItemEdit,
    		dropLine,
    		tileWidth,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop,
    		onDrop,
    		click_handler,
    		click_handler_1,
    		auxclick_handler,
    		click_handler_2
    	];
    }

    class ItemTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			index: 0,
    			item: 1,
    			onItemDelete: 2,
    			onClickItem: 3,
    			onClickItemEdit: 4,
    			onDrop: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemTile",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get index() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onItemDelete() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onItemDelete(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClickItem() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClickItem(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClickItemEdit() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClickItemEdit(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrop() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrop(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/tiles/EmptyItemTile.svelte generated by Svelte v3.52.0 */

    const file$a = "src/components/tiles/EmptyItemTile.svelte";

    // (26:4) {:else}
    function create_else_block$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "var(--bg)");
    			add_location(div, file$a, 26, 8, 589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(26:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#if dropLine}
    function create_if_block$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "var(--drop-indicator)");
    			add_location(div, file$a, 24, 8, 505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(24:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[0]) return create_if_block$6;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t = space();
    			div0 = element("div");
    			set_style(div0, "width", "200px");
    			set_style(div0, "height", "100%");
    			set_style(div0, "display", "inline-block");
    			add_location(div0, file$a, 28, 4, 655);
    			attr_dev(div1, "class", "flex-row-container");
    			set_style(div1, "height", "100%");
    			add_location(div1, file$a, 22, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    					listen_dev(div0, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    					listen_dev(div0, "drop", /*handleDrop*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EmptyItemTile', slots, []);
    	let { index } = $$props;
    	let { onDrop } = $$props;
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(0, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(0, dropLine = false);
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(0, dropLine = false);
    		onDrop(e, index);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<EmptyItemTile> was created without expected prop 'index'");
    		}

    		if (onDrop === undefined && !('onDrop' in $$props || $$self.$$.bound[$$self.$$.props['onDrop']])) {
    			console.warn("<EmptyItemTile> was created without expected prop 'onDrop'");
    		}
    	});

    	const writable_props = ['index', 'onDrop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EmptyItemTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onDrop' in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => ({
    		index,
    		onDrop,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDrop
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onDrop' in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    		if ('dropLine' in $$props) $$invalidate(0, dropLine = $$props.dropLine);
    		if ('onDragEnter' in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ('handleDrop' in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dropLine, onDragEnter, onDragLeave, handleDrop, index, onDrop];
    }

    class EmptyItemTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { index: 4, onDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmptyItemTile",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get index() {
    		throw new Error("<EmptyItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<EmptyItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrop() {
    		throw new Error("<EmptyItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrop(value) {
    		throw new Error("<EmptyItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/tiles/NoItemIndicatorTile.svelte generated by Svelte v3.52.0 */

    const file$b = "src/components/tiles/NoItemIndicatorTile.svelte";

    // (45:0) {:else}
    function create_else_block$6(ctx) {
    	let div;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Drag-n-Drop tabs here OR save them via the Extension Popup";
    			set_style(h3, "color", "var(--txt)");
    			add_location(h3, file$b, 50, 8, 1124);
    			attr_dev(div, "class", "no-items-indicator svelte-wl440h");
    			add_location(div, file$b, 45, 4, 962);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    					listen_dev(div, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    					listen_dev(div, "drop", /*handleDrop*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(45:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:0) {#if indicator}
    function create_if_block$7(ctx) {
    	let div;
    	let h1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Drop to Add";
    			add_location(h1, file$b, 42, 8, 918);
    			attr_dev(div, "class", "no-items-indicator svelte-wl440h");
    			set_style(div, "border", "1px dashed gray");
    			add_location(div, file$b, 36, 4, 715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    					listen_dev(div, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    					listen_dev(div, "drop", /*handleDrop*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(36:0) {#if indicator}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*indicator*/ ctx[0]) return create_if_block$7;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NoItemIndicatorTile', slots, []);
    	let { index } = $$props;
    	let { onDrop } = $$props;
    	let indicator = false;

    	var onDragEnter = e => {
    		$$invalidate(0, indicator = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(0, indicator = false);
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(0, indicator = false);
    		onDrop(e, index);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<NoItemIndicatorTile> was created without expected prop 'index'");
    		}

    		if (onDrop === undefined && !('onDrop' in $$props || $$self.$$.bound[$$self.$$.props['onDrop']])) {
    			console.warn("<NoItemIndicatorTile> was created without expected prop 'onDrop'");
    		}
    	});

    	const writable_props = ['index', 'onDrop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NoItemIndicatorTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onDrop' in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => ({
    		index,
    		onDrop,
    		indicator,
    		onDragEnter,
    		onDragLeave,
    		handleDrop
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onDrop' in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    		if ('indicator' in $$props) $$invalidate(0, indicator = $$props.indicator);
    		if ('onDragEnter' in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ('handleDrop' in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [indicator, onDragEnter, onDragLeave, handleDrop, index, onDrop];
    }

    class NoItemIndicatorTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { index: 4, onDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoItemIndicatorTile",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get index() {
    		throw new Error("<NoItemIndicatorTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<NoItemIndicatorTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrop() {
    		throw new Error("<NoItemIndicatorTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrop(value) {
    		throw new Error("<NoItemIndicatorTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/modals/EditCollectionNameModal.svelte generated by Svelte v3.52.0 */
    const file$c = "src/components/modals/EditCollectionNameModal.svelte";

    function create_fragment$c(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let input;
    	let input_onchange_value;
    	let t2;
    	let div1;
    	let div0;
    	let t3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Edit Collection Name -";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t3 = text(/*errorString*/ ctx[1]);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Save";
    			add_location(h1, file$c, 74, 4, 1560);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "onchange", input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]));
    			input.autofocus = true;
    			attr_dev(input, "class", "svelte-1dkdkti");
    			add_location(input, file$c, 77, 4, 1639);
    			set_style(div0, "padding", "10px");
    			set_style(div0, "color", "red");
    			add_location(div0, file$c, 80, 8, 1783);
    			attr_dev(button, "class", "pointer svelte-1dkdkti");
    			add_location(button, file$c, 81, 8, 1851);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-1dkdkti");
    			add_location(div1, file$c, 79, 4, 1744);
    			add_location(main, file$c, 73, 0, 1549);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, input);
    			set_input_value(input, /*collectionName*/ ctx[0]);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			input.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*handleKeyUp*/ ctx[3], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(button, "click", /*onClickCreate*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*collectionName*/ 1 && input_onchange_value !== (input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]))) {
    				attr_dev(input, "onchange", input_onchange_value);
    			}

    			if (dirty & /*collectionName*/ 1 && input.value !== /*collectionName*/ ctx[0]) {
    				set_input_value(input, /*collectionName*/ ctx[0]);
    			}

    			if (dirty & /*errorString*/ 2) set_data_dev(t3, /*errorString*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditCollectionNameModal', slots, []);
    	let { collection } = $$props;
    	let collectionName = collection.title;
    	let errorString = "";
    	const { close } = getContext("simple-modal");

    	function renameCollection() {
    		chrome.bookmarks.update(collection.id, { title: collectionName }, function (i) {
    			close(i.title);
    		});
    	}

    	var onClickCreate = () => {
    		$$invalidate(0, collectionName = collectionName.trim());

    		if (collectionName.length > 0) {
    			$$invalidate(1, errorString = "");
    			renameCollection();
    		} else {
    			$$invalidate(1, errorString = "Collection name cannot be empty");
    		}
    	};

    	function handleKeyUp(event) {
    		// on press enter
    		if (event.keyCode == 13) {
    			onClickCreate();
    		}
    	}

    	function inputFormatter(str) {
    		$$invalidate(0, collectionName = str.replace(/\s+/g, " "));
    	}

    	$$self.$$.on_mount.push(function () {
    		if (collection === undefined && !('collection' in $$props || $$self.$$.bound[$$self.$$.props['collection']])) {
    			console.warn("<EditCollectionNameModal> was created without expected prop 'collection'");
    		}
    	});

    	const writable_props = ['collection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditCollectionNameModal> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		collectionName = this.value;
    		$$invalidate(0, collectionName);
    	}

    	$$self.$$set = $$props => {
    		if ('collection' in $$props) $$invalidate(5, collection = $$props.collection);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		collection,
    		collectionName,
    		errorString,
    		close,
    		renameCollection,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter
    	});

    	$$self.$inject_state = $$props => {
    		if ('collection' in $$props) $$invalidate(5, collection = $$props.collection);
    		if ('collectionName' in $$props) $$invalidate(0, collectionName = $$props.collectionName);
    		if ('errorString' in $$props) $$invalidate(1, errorString = $$props.errorString);
    		if ('onClickCreate' in $$props) $$invalidate(2, onClickCreate = $$props.onClickCreate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		collectionName,
    		errorString,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter,
    		collection,
    		input_input_handler
    	];
    }

    class EditCollectionNameModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { collection: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditCollectionNameModal",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get collection() {
    		throw new Error("<EditCollectionNameModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collection(value) {
    		throw new Error("<EditCollectionNameModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/modals/EditItemModal.svelte generated by Svelte v3.52.0 */
    const file$d = "src/components/modals/EditItemModal.svelte";

    function create_fragment$d(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let strong0;
    	let t3;
    	let input0;
    	let input0_onchange_value;
    	let t4;
    	let br0;
    	let br1;
    	let t5;
    	let strong1;
    	let t7;
    	let input1;
    	let t8;
    	let br2;
    	let br3;
    	let t9;
    	let div1;
    	let div0;
    	let t10;
    	let t11;
    	let button;
    	let t13;
    	let strong2;
    	let t15;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Edit Item -";
    			t1 = space();
    			strong0 = element("strong");
    			strong0.textContent = "Name";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t5 = space();
    			strong1 = element("strong");
    			strong1.textContent = "Icon Url";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t9 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t10 = text(/*errorString*/ ctx[0]);
    			t11 = space();
    			button = element("button");
    			button.textContent = "Update";
    			t13 = space();
    			strong2 = element("strong");
    			strong2.textContent = "Color";
    			t15 = text("\n     \n    ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "None";
    			option1 = element("option");
    			option1.textContent = "Red";
    			option2 = element("option");
    			option2.textContent = "Green";
    			option3 = element("option");
    			option3.textContent = "Blue";
    			option4 = element("option");
    			option4.textContent = "Yellow";
    			option5 = element("option");
    			option5.textContent = "Purple";
    			option6 = element("option");
    			option6.textContent = "Cyan";
    			add_location(h1, file$d, 83, 4, 1820);
    			add_location(strong0, file$d, 85, 4, 1846);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "onchange", input0_onchange_value = /*inputFormatter*/ ctx[6](/*itemName*/ ctx[1]));
    			attr_dev(input0, "class", "svelte-1dkdkti");
    			add_location(input0, file$d, 86, 4, 1872);
    			add_location(br0, file$d, 90, 4, 1980);
    			add_location(br1, file$d, 90, 8, 1984);
    			add_location(strong1, file$d, 91, 4, 1993);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-1dkdkti");
    			add_location(input1, file$d, 92, 4, 2023);
    			add_location(br2, file$d, 95, 4, 2093);
    			add_location(br3, file$d, 95, 8, 2097);
    			set_style(div0, "padding", "10px");
    			set_style(div0, "color", "red");
    			add_location(div0, file$d, 97, 8, 2145);
    			attr_dev(button, "class", "pointer svelte-1dkdkti");
    			add_location(button, file$d, 98, 8, 2213);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-1dkdkti");
    			add_location(div1, file$d, 96, 4, 2106);
    			add_location(strong2, file$d, 100, 4, 2293);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$d, 103, 8, 2384);
    			option1.__value = "#ff000022";
    			option1.value = option1.__value;
    			add_location(option1, file$d, 104, 8, 2423);
    			option2.__value = "#00ff0022";
    			option2.value = option2.__value;
    			add_location(option2, file$d, 105, 8, 2470);
    			option3.__value = "#0000ff22";
    			option3.value = option3.__value;
    			add_location(option3, file$d, 106, 8, 2519);
    			option4.__value = "#ffff0022";
    			option4.value = option4.__value;
    			add_location(option4, file$d, 107, 8, 2567);
    			option5.__value = "#ff00ff22";
    			option5.value = option5.__value;
    			add_location(option5, file$d, 108, 8, 2617);
    			option6.__value = "#00ffff22";
    			option6.value = option6.__value;
    			add_location(option6, file$d, 109, 8, 2667);
    			attr_dev(select, "name", "colors");
    			if (/*itemColor*/ ctx[3] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$d, 102, 4, 2330);
    			set_style(main, "background-color", /*itemColor*/ ctx[3]);
    			add_location(main, file$d, 82, 0, 1771);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, strong0);
    			append_dev(main, t3);
    			append_dev(main, input0);
    			set_input_value(input0, /*itemName*/ ctx[1]);
    			append_dev(main, t4);
    			append_dev(main, br0);
    			append_dev(main, br1);
    			append_dev(main, t5);
    			append_dev(main, strong1);
    			append_dev(main, t7);
    			append_dev(main, input1);
    			set_input_value(input1, /*itemFavIconLink*/ ctx[2]);
    			append_dev(main, t8);
    			append_dev(main, br2);
    			append_dev(main, br3);
    			append_dev(main, t9);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t10);
    			append_dev(div1, t11);
    			append_dev(div1, button);
    			append_dev(main, t13);
    			append_dev(main, strong2);
    			append_dev(main, t15);
    			append_dev(main, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			append_dev(select, option6);
    			select_option(select, /*itemColor*/ ctx[3]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*handleKeyUp*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(button, "click", /*onClickCreate*/ ctx[4], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*itemName*/ 2 && input0_onchange_value !== (input0_onchange_value = /*inputFormatter*/ ctx[6](/*itemName*/ ctx[1]))) {
    				attr_dev(input0, "onchange", input0_onchange_value);
    			}

    			if (dirty & /*itemName*/ 2 && input0.value !== /*itemName*/ ctx[1]) {
    				set_input_value(input0, /*itemName*/ ctx[1]);
    			}

    			if (dirty & /*itemFavIconLink*/ 4 && input1.value !== /*itemFavIconLink*/ ctx[2]) {
    				set_input_value(input1, /*itemFavIconLink*/ ctx[2]);
    			}

    			if (dirty & /*errorString*/ 1) set_data_dev(t10, /*errorString*/ ctx[0]);

    			if (dirty & /*itemColor*/ 8) {
    				select_option(select, /*itemColor*/ ctx[3]);
    			}

    			if (dirty & /*itemColor*/ 8) {
    				set_style(main, "background-color", /*itemColor*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditItemModal', slots, []);
    	let { item } = $$props;
    	let errorString = "";
    	let title = item.title.split(":::::");
    	let itemName = title[0];
    	let itemFavIconLink = title.length > 1 ? title[1] : "";
    	let itemColor = title.length > 2 ? title[2] : "";
    	const { close } = getContext("simple-modal");

    	function updateCollection() {
    		let newTitle = itemName + ":::::" + itemFavIconLink + ":::::" + itemColor;

    		chrome.bookmarks.update(item.id, { title: newTitle }, function (i) {
    			close(newTitle);
    		});
    	}

    	var onClickCreate = () => {
    		$$invalidate(1, itemName = itemName.trim());

    		if (itemName.length > 0) {
    			$$invalidate(0, errorString = "");
    			updateCollection();
    		} else {
    			$$invalidate(0, errorString = "Item name cannot be empty");
    		}
    	};

    	function handleKeyUp(event) {
    		// on press enter
    		if (event.keyCode == 13) {
    			onClickCreate();
    		}
    	}

    	function inputFormatter(str) {
    		$$invalidate(1, itemName = str.replace(/\s+/g, " "));
    	}

    	$$self.$$.on_mount.push(function () {
    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console.warn("<EditItemModal> was created without expected prop 'item'");
    		}
    	});

    	const writable_props = ['item'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditItemModal> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		itemName = this.value;
    		$$invalidate(1, itemName);
    	}

    	function input1_input_handler() {
    		itemFavIconLink = this.value;
    		$$invalidate(2, itemFavIconLink);
    	}

    	function select_change_handler() {
    		itemColor = select_value(this);
    		$$invalidate(3, itemColor);
    	}

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(7, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		item,
    		errorString,
    		title,
    		itemName,
    		itemFavIconLink,
    		itemColor,
    		close,
    		updateCollection,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(7, item = $$props.item);
    		if ('errorString' in $$props) $$invalidate(0, errorString = $$props.errorString);
    		if ('title' in $$props) title = $$props.title;
    		if ('itemName' in $$props) $$invalidate(1, itemName = $$props.itemName);
    		if ('itemFavIconLink' in $$props) $$invalidate(2, itemFavIconLink = $$props.itemFavIconLink);
    		if ('itemColor' in $$props) $$invalidate(3, itemColor = $$props.itemColor);
    		if ('onClickCreate' in $$props) $$invalidate(4, onClickCreate = $$props.onClickCreate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		errorString,
    		itemName,
    		itemFavIconLink,
    		itemColor,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter,
    		item,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class EditItemModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { item: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditItemModal",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get item() {
    		throw new Error("<EditItemModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<EditItemModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var faTrashAlt = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'trash-alt';
    var width = 448;
    var height = 512;
    var ligatures = [];
    var unicode = 'f2ed';
    var svgPathData = 'M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faTrashAlt = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faTrashAlt);
    var faTrashAlt_1 = faTrashAlt.definition;
    var faTrashAlt_2 = faTrashAlt.faTrashAlt;
    var faTrashAlt_3 = faTrashAlt.prefix;
    var faTrashAlt_4 = faTrashAlt.iconName;
    var faTrashAlt_5 = faTrashAlt.width;
    var faTrashAlt_6 = faTrashAlt.height;
    var faTrashAlt_7 = faTrashAlt.ligatures;
    var faTrashAlt_8 = faTrashAlt.unicode;
    var faTrashAlt_9 = faTrashAlt.svgPathData;

    var faShareAlt = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'share-alt';
    var width = 448;
    var height = 512;
    var ligatures = [];
    var unicode = 'f1e0';
    var svgPathData = 'M352 320c-22.608 0-43.387 7.819-59.79 20.895l-102.486-64.054a96.551 96.551 0 0 0 0-41.683l102.486-64.054C308.613 184.181 329.392 192 352 192c53.019 0 96-42.981 96-96S405.019 0 352 0s-96 42.981-96 96c0 7.158.79 14.13 2.276 20.841L155.79 180.895C139.387 167.819 118.608 160 96 160c-53.019 0-96 42.981-96 96s42.981 96 96 96c22.608 0 43.387-7.819 59.79-20.895l102.486 64.054A96.301 96.301 0 0 0 256 416c0 53.019 42.981 96 96 96s96-42.981 96-96-42.981-96-96-96z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faShareAlt = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faShareAlt);
    var faShareAlt_1 = faShareAlt.definition;
    var faShareAlt_2 = faShareAlt.faShareAlt;
    var faShareAlt_3 = faShareAlt.prefix;
    var faShareAlt_4 = faShareAlt.iconName;
    var faShareAlt_5 = faShareAlt.width;
    var faShareAlt_6 = faShareAlt.height;
    var faShareAlt_7 = faShareAlt.ligatures;
    var faShareAlt_8 = faShareAlt.unicode;
    var faShareAlt_9 = faShareAlt.svgPathData;

    var faEdit = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'edit';
    var width = 576;
    var height = 512;
    var ligatures = [];
    var unicode = 'f044';
    var svgPathData = 'M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faEdit = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faEdit);
    var faEdit_1 = faEdit.definition;
    var faEdit_2 = faEdit.faEdit;
    var faEdit_3 = faEdit.prefix;
    var faEdit_4 = faEdit.iconName;
    var faEdit_5 = faEdit.width;
    var faEdit_6 = faEdit.height;
    var faEdit_7 = faEdit.ligatures;
    var faEdit_8 = faEdit.unicode;
    var faEdit_9 = faEdit.svgPathData;

    var faArchive = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'archive';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f187';
    var svgPathData = 'M32 448c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V160H32v288zm160-212c0-6.6 5.4-12 12-12h104c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12H204c-6.6 0-12-5.4-12-12v-8zM480 32H32C14.3 32 0 46.3 0 64v48c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16V64c0-17.7-14.3-32-32-32z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faArchive = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faArchive);
    var faArchive_1 = faArchive.definition;
    var faArchive_2 = faArchive.faArchive;
    var faArchive_3 = faArchive.prefix;
    var faArchive_4 = faArchive.iconName;
    var faArchive_5 = faArchive.width;
    var faArchive_6 = faArchive.height;
    var faArchive_7 = faArchive.ligatures;
    var faArchive_8 = faArchive.unicode;
    var faArchive_9 = faArchive.svgPathData;

    /* src/components/tiles/CollectionTile.svelte generated by Svelte v3.52.0 */
    const file$e = "src/components/tiles/CollectionTile.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (286:0) {#if $searchText.length==0 || hasSearchMatch}
    function create_if_block$8(ctx) {
    	let div4;
    	let t0;
    	let div2;
    	let div0;
    	let t1_value = /*collection*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let tooltip0;
    	let t5;
    	let tooltip1;
    	let t6;
    	let tooltip2;
    	let t7;
    	let tooltip3;
    	let div2_outro;
    	let t8;
    	let div3;
    	let current_block_type_index;
    	let if_block2;
    	let div4_intro;
    	let div4_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[6]) return create_if_block_4;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*items*/ ctx[5].length > 0 && create_if_block_3(ctx);

    	tooltip0 = new Tooltip({
    			props: {
    				title: "Share",
    				ypos: "-50",
    				fontsize: "0.5em",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tooltip1 = new Tooltip({
    			props: {
    				title: "Delete",
    				ypos: "-50",
    				fontsize: "0.5em",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tooltip2 = new Tooltip({
    			props: {
    				title: "Edit",
    				ypos: "-50",
    				fontsize: "0.5em",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tooltip3 = new Tooltip({
    			props: {
    				title: "Archive",
    				ypos: "-50",
    				fontsize: "0.5em",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_1$1, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*items*/ ctx[5].length == 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			create_component(tooltip0.$$.fragment);
    			t5 = text("\n         \n        ");
    			create_component(tooltip1.$$.fragment);
    			t6 = text("\n         \n        ");
    			create_component(tooltip2.$$.fragment);
    			t7 = text("\n         \n        ");
    			create_component(tooltip3.$$.fragment);
    			t8 = space();
    			div3 = element("div");
    			if_block2.c();
    			add_location(div0, file$e, 304, 8, 9763);
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$e, 305, 8, 9801);
    			attr_dev(div2, "class", "tile-top-bar svelte-zh24vc");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$e, 296, 4, 9526);
    			attr_dev(div3, "class", "item-area svelte-zh24vc");
    			set_style(div3, "width", /*itemAreaWidth*/ ctx[9] + "vw");
    			add_location(div3, file$e, 361, 4, 12107);
    			attr_dev(div4, "class", "collection svelte-zh24vc");
    			add_location(div4, file$e, 286, 0, 9260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			if_block0.m(div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div2, t3);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t4);
    			mount_component(tooltip0, div2, null);
    			append_dev(div2, t5);
    			mount_component(tooltip1, div2, null);
    			append_dev(div2, t6);
    			mount_component(tooltip2, div2, null);
    			append_dev(div2, t7);
    			mount_component(tooltip3, div2, null);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			if_blocks[current_block_type_index].m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "dragover", prevent_default(/*onDragEnter*/ ctx[10]), false, true, false),
    					listen_dev(div2, "dragleave", /*onDragLeave*/ ctx[11], false, false, false),
    					listen_dev(div2, "dragstart", /*handleDragStart*/ ctx[12], false, false, false),
    					listen_dev(div2, "drop", /*handleDrop*/ ctx[13], false, false, false),
    					listen_dev(div4, "dragover", prevent_default(/*dragover_handler*/ ctx[22]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div4, t0);
    				}
    			}

    			if ((!current || dirty[0] & /*collection*/ 1) && t1_value !== (t1_value = /*collection*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (/*items*/ ctx[5].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div2, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const tooltip0_changes = {};

    			if (dirty[0] & /*clickShareCollection, index, items*/ 52 | dirty[1] & /*$$scope*/ 2) {
    				tooltip0_changes.$$scope = { dirty, ctx };
    			}

    			tooltip0.$set(tooltip0_changes);
    			const tooltip1_changes = {};

    			if (dirty[0] & /*clickDeleteCollection, index*/ 18 | dirty[1] & /*$$scope*/ 2) {
    				tooltip1_changes.$$scope = { dirty, ctx };
    			}

    			tooltip1.$set(tooltip1_changes);
    			const tooltip2_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				tooltip2_changes.$$scope = { dirty, ctx };
    			}

    			tooltip2.$set(tooltip2_changes);
    			const tooltip3_changes = {};

    			if (dirty[0] & /*clickArchiveCollection, index*/ 24 | dirty[1] & /*$$scope*/ 2) {
    				tooltip3_changes.$$scope = { dirty, ctx };
    			}

    			tooltip3.$set(tooltip3_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				} else {
    					if_block2.p(ctx, dirty);
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(div3, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip0.$$.fragment, local);
    			transition_in(tooltip1.$$.fragment, local);
    			transition_in(tooltip2.$$.fragment, local);
    			transition_in(tooltip3.$$.fragment, local);
    			if (div2_outro) div2_outro.end(1);
    			transition_in(if_block2);

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				div4_intro = create_in_transition(div4, fade, { duration: 500 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip0.$$.fragment, local);
    			transition_out(tooltip1.$$.fragment, local);
    			transition_out(tooltip2.$$.fragment, local);
    			transition_out(tooltip3.$$.fragment, local);
    			div2_outro = create_out_transition(div2, fade, {});
    			transition_out(if_block2);
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(tooltip0);
    			destroy_component(tooltip1);
    			destroy_component(tooltip2);
    			destroy_component(tooltip3);
    			if (detaching && div2_outro) div2_outro.end();
    			if_blocks[current_block_type_index].d();
    			if (detaching && div4_outro) div4_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(286:0) {#if $searchText.length==0 || hasSearchMatch}",
    		ctx
    	});

    	return block;
    }

    // (294:4) {:else}
    function create_else_block_1$1(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--bg)");
    			add_location(hr, file$e, 294, 8, 9468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(294:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (292:4) {#if dropLine}
    function create_if_block_4(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--drop-indicator)");
    			add_location(hr, file$e, 292, 8, 9392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(292:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    // (307:8) {#if items.length > 0}
    function create_if_block_3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*items*/ ctx[5].length + "";
    	let t1;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Open\n                ");
    			t1 = text(t1_value);
    			t2 = text("\n                Tabs");
    			t3 = text("\n             ");
    			attr_dev(div, "id", "open-all-tabs");
    			attr_dev(div, "class", "rounded-button pointer");
    			add_location(div, file$e, 308, 12, 9942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			insert_dev(target, t3, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[23], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*items*/ 32 && t1_value !== (t1_value = /*items*/ ctx[5].length + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(307:8) {#if items.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (319:8) <Tooltip title="Share" ypos="-50" fontsize="0.5em">
    function create_default_slot_3(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faShareAlt_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "0.8em");
    			set_style(div, "opacity", "var(--icon-opacity)");
    			add_location(div, file$e, 320, 12, 10364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[24], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(319:8) <Tooltip title=\\\"Share\\\" ypos=\\\"-50\\\" fontsize=\\\"0.5em\\\">",
    		ctx
    	});

    	return block;
    }

    // (329:8) <Tooltip title="Delete" ypos="-50" fontsize="0.5em">
    function create_default_slot_2$1(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faTrashAlt_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "0.8em");
    			set_style(div, "opacity", "var(--icon-opacity)");
    			add_location(div, file$e, 330, 12, 10812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_2*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(329:8) <Tooltip title=\\\"Delete\\\" ypos=\\\"-50\\\" fontsize=\\\"0.5em\\\">",
    		ctx
    	});

    	return block;
    }

    // (339:8) <Tooltip title="Edit" ypos="-50" fontsize="0.5em">
    function create_default_slot_1$2(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faEdit_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "0.8em");
    			set_style(div, "opacity", "var(--icon-opacity)");
    			attr_dev(div, "alt", "Edit Name");
    			add_location(div, file$e, 340, 12, 11252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*openEditCollectionNameModal*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(339:8) <Tooltip title=\\\"Edit\\\" ypos=\\\"-50\\\" fontsize=\\\"0.5em\\\">",
    		ctx
    	});

    	return block;
    }

    // (350:8) <Tooltip title="Archive" ypos="-50" fontsize="0.5em">
    function create_default_slot$2(ctx) {
    	let div;
    	let fa;
    	let current;
    	let mounted;
    	let dispose;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faArchive_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fa.$$.fragment);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "0.8em");
    			set_style(div, "opacity", "var(--icon-opacity)");
    			attr_dev(div, "alt", "Archive");
    			add_location(div, file$e, 351, 12, 11718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(350:8) <Tooltip title=\\\"Archive\\\" ypos=\\\"-50\\\" fontsize=\\\"0.5em\\\">",
    		ctx
    	});

    	return block;
    }

    // (365:12) {:else}
    function create_else_block$7(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let emptyitemtile;
    	let current;
    	let each_value = /*items*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[30].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	emptyitemtile = new EmptyItemTile({
    			props: {
    				index: /*items*/ ctx[5].length,
    				onDrop: /*onDrop*/ ctx[18]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(emptyitemtile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(emptyitemtile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*items, onItemDelete, onClickItem, onDrop, onClickItemEdit, matchSearch, $searchText*/ 1425696) {
    				each_value = /*items*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t.parentNode, outro_and_destroy_block, create_each_block$2, t, get_each_context$2);
    				check_outros();
    			}

    			const emptyitemtile_changes = {};
    			if (dirty[0] & /*items*/ 32) emptyitemtile_changes.index = /*items*/ ctx[5].length;
    			emptyitemtile.$set(emptyitemtile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(emptyitemtile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(emptyitemtile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			destroy_component(emptyitemtile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(365:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (363:12) {#if items.length==0}
    function create_if_block_1$1(ctx) {
    	let noitemtileindicator;
    	let current;

    	noitemtileindicator = new NoItemIndicatorTile({
    			props: {
    				index: /*items*/ ctx[5].length,
    				onDrop: /*onDrop*/ ctx[18]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(noitemtileindicator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noitemtileindicator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const noitemtileindicator_changes = {};
    			if (dirty[0] & /*items*/ 32) noitemtileindicator_changes.index = /*items*/ ctx[5].length;
    			noitemtileindicator.$set(noitemtileindicator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noitemtileindicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noitemtileindicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noitemtileindicator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(363:12) {#if items.length==0}",
    		ctx
    	});

    	return block;
    }

    // (367:20) {#if (matchSearch(item, $searchText)) }
    function create_if_block_2$1(ctx) {
    	let itemtile;
    	let current;

    	itemtile = new ItemTile({
    			props: {
    				index: /*index*/ ctx[4],
    				item: /*item*/ ctx[30],
    				onItemDelete: /*onItemDelete*/ ctx[14],
    				onClickItem: /*onClickItem*/ ctx[15],
    				onDrop: /*onDrop*/ ctx[18],
    				onClickItemEdit: /*onClickItemEdit*/ ctx[16]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(itemtile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemtile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const itemtile_changes = {};
    			if (dirty[0] & /*items*/ 32) itemtile_changes.index = /*index*/ ctx[4];
    			if (dirty[0] & /*items*/ 32) itemtile_changes.item = /*item*/ ctx[30];
    			itemtile.$set(itemtile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemtile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemtile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemtile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(367:20) {#if (matchSearch(item, $searchText)) }",
    		ctx
    	});

    	return block;
    }

    // (366:16) {#each items as item,index (item.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let show_if = /*matchSearch*/ ctx[20](/*item*/ ctx[30], /*$searchText*/ ctx[8]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_2$1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*items, $searchText*/ 288) show_if = /*matchSearch*/ ctx[20](/*item*/ ctx[30], /*$searchText*/ ctx[8]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*items, $searchText*/ 288) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(366:16) {#each items as item,index (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*$searchText*/ ctx[8].length == 0 || /*hasSearchMatch*/ ctx[7]) && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$searchText*/ ctx[8].length == 0 || /*hasSearchMatch*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*$searchText, hasSearchMatch*/ 384) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $searchText;
    	validate_store(searchText, 'searchText');
    	component_subscribe($$self, searchText, $$value => $$invalidate(8, $searchText = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CollectionTile', slots, []);
    	const { open } = getContext("simple-modal");

    	//font awesome icons
    	let items = [];

    	let { collection } = $$props;
    	let { onCollectionDrop } = $$props;
    	let { index } = $$props;
    	let { clickDeleteCollection } = $$props;
    	let { clickShareCollection } = $$props;
    	let { clickArchiveCollection } = $$props;
    	let itemAreaWidth = 97 - getOpenTabsBarWidth();
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(6, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(6, dropLine = false);
    	};

    	var handleDragStart = e => {
    		e.dataTransfer.setData("text", "c" + index.toString());
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(6, dropLine = false);
    		onCollectionDrop(e, index);
    	};

    	onMount(() => {
    		chrome.bookmarks.getChildren(collection.id, function (children) {
    			// only bookmarks
    			$$invalidate(5, items = children.filter(e => e.url != null));
    		});
    	});

    	const unsubsribe = deo.subscribe(obj => {
    		if (obj.source[0] == "i" && obj.target[0] == "i" && (obj.sourceObj.parentId == collection.id || obj.targetObj.id == collection.id)) {
    			// target is collection (not item)
    			// source is item (not collection)
    			var dragIndex = parseInt(obj.source.substring(1));

    			var dropIndex = parseInt(obj.target.substring(1));

    			// when moving item within the same collection
    			if (obj.sourceObj.parentId == collection.id && obj.targetObj.id == collection.id) {
    				// move items from dragIndex to dropIndex
    				if (dragIndex >= dropIndex) {
    					setlastNewTabOperationTimeNow();
    					chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex });
    					items.splice(dropIndex, 0, obj.sourceObj);
    					items.splice(dragIndex + 1, 1);
    				} else {
    					setlastNewTabOperationTimeNow();
    					chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex });
    					items.splice(dropIndex, 0, obj.sourceObj);
    					items.splice(dragIndex, 1);
    				}
    			} else // when moving item to a different collection
    			if (obj.sourceObj.parentId == collection.id) {
    				// source is responsible for movement of bookmark
    				setlastNewTabOperationTimeNow();

    				chrome.bookmarks.move(obj.sourceObj.id, {
    					index: dropIndex,
    					parentId: obj.targetObj.id
    				});

    				items.splice(dragIndex, 1);
    			} else {
    				// obj.targetObj.id == collection.id
    				var newObj = JSON.parse(JSON.stringify(obj.sourceObj));

    				newObj.parentId = collection.id;
    				items.splice(dropIndex, 0, newObj);
    			}

    			$$invalidate(5, items);
    		} else if (obj.source[0] == "t" && obj.target[0] == "i" && obj.targetObj.id == collection.id) {
    			saveTabToBookmark(obj.sourceObj, parseInt(obj.target.substring(1)), !obj.ctrl);
    		}
    	});

    	onDestroy(unsubsribe);

    	var onItemDelete = (item, i) => {
    		items.splice(i, 1);
    		$$invalidate(5, items);
    		setlastNewTabOperationTimeNow();
    		chrome.bookmarks.remove(item.id);
    	};

    	var onClickItem = (item, e) => {
    		chrome.tabs.create({
    			url: item.url,
    			active: !(e.ctrlKey || e.metaKey || e.button == 1)
    		});
    	};

    	var onClickItemEdit = async (item, i) => {
    		var c = await open(EditItemModal, { item });

    		if (c != null) {
    			$$invalidate(5, items[i].title = c, items);
    			$$invalidate(5, items);
    		}
    	};

    	var openAllOfCollection = collectionName => {
    		let tabOpenType = useTabGroupInOpenAllTabs();

    		if (tabOpenType == 'openTabGroup') {
    			if (items.length < 1) return;

    			chrome.tabs.create({ url: items[0].url }, tab => {
    				chrome.tabs.group({ tabIds: [tab.id] }, groupId => {
    					for (var i = 1; i < items.length; i++) {
    						chrome.tabs.create({ url: items[i].url }, tab => {
    							chrome.tabs.group({ tabIds: [tab.id], groupId });
    						});
    					}

    					chrome.tabGroups.update(groupId, { title: collectionName });
    				});
    			});
    		} else if (tabOpenType == 'openTabWindow') {
    			chrome.windows.create({}, window => {
    				items.forEach(i => {
    					chrome.tabs.create({ url: i.url, windowId: window.id });
    				});
    			});
    		} else {
    			items.forEach(i => {
    				chrome.tabs.create({ url: i.url });
    			});
    		}
    	};

    	function saveTabToBookmark(tab, dropIndex) {
    		setlastNewTabOperationTimeNow();
    		saveTabHook(tab);

    		chrome.bookmarks.create(
    			{
    				parentId: collection.id,
    				url: tab.url,
    				index: dropIndex,
    				title: tab.title + ":::::" + tab.favIconUrl
    			},
    			function (node) {
    				items.splice(dropIndex, 0, node);
    				$$invalidate(5, items);
    			}
    		);
    	}

    	// called when an item drops (child components call this)
    	var onDrop = (e, dropIndex) => {
    		e.preventDefault();
    		var rawData = e.dataTransfer.getData("text");
    		var obj = JSON.parse(e.dataTransfer.getData("object"));

    		deo.set({
    			source: rawData,
    			target: "i" + dropIndex.toString(),
    			sourceObj: obj,
    			targetObj: collection,
    			ctrl: e.ctrlKey || e.altKey
    		});
    	};

    	var openEditCollectionNameModal = async () => {
    		var c = await open(EditCollectionNameModal, { collection });
    		if (c != null) $$invalidate(0, collection.title = c, collection);
    	};

    	var matchSearch = (item, text) => {
    		return item.title.toLowerCase().includes(text.toLowerCase()) || item.url.toLowerCase().includes(text.toLowerCase());
    	};

    	var hasSearchMatch = true;

    	searchText.subscribe(val => {
    		let setTo = true;

    		if (val.length > 0) {
    			setTo = false;

    			for (let i = 0; i < items.length; i++) {
    				const item = items[i];

    				if (matchSearch(item, val)) {
    					setTo = true;
    					break;
    				}
    			}
    		}

    		$$invalidate(7, hasSearchMatch = setTo);
    	});

    	$$self.$$.on_mount.push(function () {
    		if (collection === undefined && !('collection' in $$props || $$self.$$.bound[$$self.$$.props['collection']])) {
    			console.warn("<CollectionTile> was created without expected prop 'collection'");
    		}

    		if (onCollectionDrop === undefined && !('onCollectionDrop' in $$props || $$self.$$.bound[$$self.$$.props['onCollectionDrop']])) {
    			console.warn("<CollectionTile> was created without expected prop 'onCollectionDrop'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<CollectionTile> was created without expected prop 'index'");
    		}

    		if (clickDeleteCollection === undefined && !('clickDeleteCollection' in $$props || $$self.$$.bound[$$self.$$.props['clickDeleteCollection']])) {
    			console.warn("<CollectionTile> was created without expected prop 'clickDeleteCollection'");
    		}

    		if (clickShareCollection === undefined && !('clickShareCollection' in $$props || $$self.$$.bound[$$self.$$.props['clickShareCollection']])) {
    			console.warn("<CollectionTile> was created without expected prop 'clickShareCollection'");
    		}

    		if (clickArchiveCollection === undefined && !('clickArchiveCollection' in $$props || $$self.$$.bound[$$self.$$.props['clickArchiveCollection']])) {
    			console.warn("<CollectionTile> was created without expected prop 'clickArchiveCollection'");
    		}
    	});

    	const writable_props = [
    		'collection',
    		'onCollectionDrop',
    		'index',
    		'clickDeleteCollection',
    		'clickShareCollection',
    		'clickArchiveCollection'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CollectionTile> was created with unknown prop '${key}'`);
    	});

    	function dragover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler = () => openAllOfCollection(collection.title);
    	const click_handler_1 = () => clickShareCollection(index, items);
    	const click_handler_2 = () => clickDeleteCollection(index);
    	const click_handler_3 = () => clickArchiveCollection(index);

    	$$self.$$set = $$props => {
    		if ('collection' in $$props) $$invalidate(0, collection = $$props.collection);
    		if ('onCollectionDrop' in $$props) $$invalidate(21, onCollectionDrop = $$props.onCollectionDrop);
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('clickDeleteCollection' in $$props) $$invalidate(1, clickDeleteCollection = $$props.clickDeleteCollection);
    		if ('clickShareCollection' in $$props) $$invalidate(2, clickShareCollection = $$props.clickShareCollection);
    		if ('clickArchiveCollection' in $$props) $$invalidate(3, clickArchiveCollection = $$props.clickArchiveCollection);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		onMount,
    		onDestroy,
    		getContext,
    		ItemTile,
    		EmptyItemTile,
    		NoItemTileIndicator: NoItemIndicatorTile,
    		saveTabHook,
    		useTabGroupInOpenAllTabs,
    		getOpenTabsBarWidth,
    		deo,
    		searchText,
    		EditCollectionNameModal,
    		EditItemModal,
    		Tooltip,
    		setlastNewTabOperationTimeNow,
    		open,
    		Fa: Sveltejs_fontawesome,
    		faTrashAlt: faTrashAlt_2,
    		faShareAlt: faShareAlt_2,
    		faEdit: faEdit_2,
    		faArchive: faArchive_2,
    		items,
    		collection,
    		onCollectionDrop,
    		index,
    		clickDeleteCollection,
    		clickShareCollection,
    		clickArchiveCollection,
    		itemAreaWidth,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop,
    		unsubsribe,
    		onItemDelete,
    		onClickItem,
    		onClickItemEdit,
    		openAllOfCollection,
    		saveTabToBookmark,
    		onDrop,
    		openEditCollectionNameModal,
    		matchSearch,
    		hasSearchMatch,
    		$searchText
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('collection' in $$props) $$invalidate(0, collection = $$props.collection);
    		if ('onCollectionDrop' in $$props) $$invalidate(21, onCollectionDrop = $$props.onCollectionDrop);
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('clickDeleteCollection' in $$props) $$invalidate(1, clickDeleteCollection = $$props.clickDeleteCollection);
    		if ('clickShareCollection' in $$props) $$invalidate(2, clickShareCollection = $$props.clickShareCollection);
    		if ('clickArchiveCollection' in $$props) $$invalidate(3, clickArchiveCollection = $$props.clickArchiveCollection);
    		if ('itemAreaWidth' in $$props) $$invalidate(9, itemAreaWidth = $$props.itemAreaWidth);
    		if ('dropLine' in $$props) $$invalidate(6, dropLine = $$props.dropLine);
    		if ('onDragEnter' in $$props) $$invalidate(10, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(11, onDragLeave = $$props.onDragLeave);
    		if ('handleDragStart' in $$props) $$invalidate(12, handleDragStart = $$props.handleDragStart);
    		if ('handleDrop' in $$props) $$invalidate(13, handleDrop = $$props.handleDrop);
    		if ('onItemDelete' in $$props) $$invalidate(14, onItemDelete = $$props.onItemDelete);
    		if ('onClickItem' in $$props) $$invalidate(15, onClickItem = $$props.onClickItem);
    		if ('onClickItemEdit' in $$props) $$invalidate(16, onClickItemEdit = $$props.onClickItemEdit);
    		if ('openAllOfCollection' in $$props) $$invalidate(17, openAllOfCollection = $$props.openAllOfCollection);
    		if ('onDrop' in $$props) $$invalidate(18, onDrop = $$props.onDrop);
    		if ('openEditCollectionNameModal' in $$props) $$invalidate(19, openEditCollectionNameModal = $$props.openEditCollectionNameModal);
    		if ('matchSearch' in $$props) $$invalidate(20, matchSearch = $$props.matchSearch);
    		if ('hasSearchMatch' in $$props) $$invalidate(7, hasSearchMatch = $$props.hasSearchMatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		collection,
    		clickDeleteCollection,
    		clickShareCollection,
    		clickArchiveCollection,
    		index,
    		items,
    		dropLine,
    		hasSearchMatch,
    		$searchText,
    		itemAreaWidth,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop,
    		onItemDelete,
    		onClickItem,
    		onClickItemEdit,
    		openAllOfCollection,
    		onDrop,
    		openEditCollectionNameModal,
    		matchSearch,
    		onCollectionDrop,
    		dragover_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class CollectionTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				collection: 0,
    				onCollectionDrop: 21,
    				index: 4,
    				clickDeleteCollection: 1,
    				clickShareCollection: 2,
    				clickArchiveCollection: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CollectionTile",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get collection() {
    		throw new Error("<CollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collection(value) {
    		throw new Error("<CollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCollectionDrop() {
    		throw new Error("<CollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCollectionDrop(value) {
    		throw new Error("<CollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<CollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<CollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickDeleteCollection() {
    		throw new Error("<CollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickDeleteCollection(value) {
    		throw new Error("<CollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickShareCollection() {
    		throw new Error("<CollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickShareCollection(value) {
    		throw new Error("<CollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickArchiveCollection() {
    		throw new Error("<CollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickArchiveCollection(value) {
    		throw new Error("<CollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/tiles/EmptyCollectionTile.svelte generated by Svelte v3.52.0 */

    const file$f = "src/components/tiles/EmptyCollectionTile.svelte";

    // (26:4) {:else}
    function create_else_block$8(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--bg)");
    			add_location(hr, file$f, 26, 8, 552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(26:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#if dropLine}
    function create_if_block$9(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--drop-indicator)");
    			add_location(hr, file$f, 24, 8, 476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(24:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[0]) return create_if_block$9;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t = space();
    			div0 = element("div");
    			set_style(div0, "height", "200px");
    			add_location(div0, file$f, 28, 4, 610);
    			add_location(div1, file$f, 22, 0, 443);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    					listen_dev(div0, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    					listen_dev(div0, "drop", /*handleDrop*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EmptyCollectionTile', slots, []);
    	let { index } = $$props;
    	let { onCollectionDrop } = $$props;
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(0, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(0, dropLine = false);
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(0, dropLine = false);
    		onCollectionDrop(e, index);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<EmptyCollectionTile> was created without expected prop 'index'");
    		}

    		if (onCollectionDrop === undefined && !('onCollectionDrop' in $$props || $$self.$$.bound[$$self.$$.props['onCollectionDrop']])) {
    			console.warn("<EmptyCollectionTile> was created without expected prop 'onCollectionDrop'");
    		}
    	});

    	const writable_props = ['index', 'onCollectionDrop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EmptyCollectionTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onCollectionDrop' in $$props) $$invalidate(5, onCollectionDrop = $$props.onCollectionDrop);
    	};

    	$$self.$capture_state = () => ({
    		index,
    		onCollectionDrop,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDrop
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onCollectionDrop' in $$props) $$invalidate(5, onCollectionDrop = $$props.onCollectionDrop);
    		if ('dropLine' in $$props) $$invalidate(0, dropLine = $$props.dropLine);
    		if ('onDragEnter' in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ('handleDrop' in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dropLine, onDragEnter, onDragLeave, handleDrop, index, onCollectionDrop];
    }

    class EmptyCollectionTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { index: 4, onCollectionDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmptyCollectionTile",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get index() {
    		throw new Error("<EmptyCollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<EmptyCollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCollectionDrop() {
    		throw new Error("<EmptyCollectionTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCollectionDrop(value) {
    		throw new Error("<EmptyCollectionTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MainArea.svelte generated by Svelte v3.52.0 */

    const { console: console_1 } = globals;
    const file$g = "src/components/MainArea.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (199:4) {#if allCollections.length == 0}
    function create_if_block_1$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_else_block$9];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$archiveOnly*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "no-collections-indicator svelte-7qib36");
    			add_location(div, file$g, 199, 8, 7186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(199:4) {#if allCollections.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (205:12) {:else}
    function create_else_block$9(ctx) {
    	let h30;
    	let t1;
    	let div;
    	let fa;
    	let t2;
    	let h31;
    	let current;

    	fa = new Sveltejs_fontawesome({
    			props: {
    				icon: faArchive_2,
    				size: "sm",
    				color: "var(--icon-color)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "No Archives, Click '";
    			t1 = space();
    			div = element("div");
    			create_component(fa.$$.fragment);
    			t2 = space();
    			h31 = element("h3");
    			h31.textContent = "' To archive a collections.";
    			set_style(h30, "color", "var(--txt)");
    			add_location(h30, file$g, 205, 16, 7488);
    			attr_dev(div, "class", "pointer");
    			set_style(div, "font-size", "2em");
    			set_style(div, "opacity", "var(--icon-opacity)");
    			attr_dev(div, "alt", "Archive");
    			add_location(div, file$g, 206, 16, 7561);
    			set_style(h31, "color", "var(--txt)");
    			add_location(h31, file$g, 213, 16, 7846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(fa, div, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h31, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h31);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(205:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (201:12) {#if !$archiveOnly}
    function create_if_block_2$2(ctx) {
    	let h30;
    	let t1;
    	let button;
    	let t2;
    	let h31;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "No Collections, Click '";
    			t1 = space();
    			button = element("button");
    			t2 = space();
    			h31 = element("h3");
    			h31.textContent = "' To create one";
    			set_style(h30, "color", "var(--txt)");
    			add_location(h30, file$g, 201, 16, 7273);
    			attr_dev(button, "class", "plus-icon-dummy svelte-7qib36");
    			add_location(button, file$g, 202, 16, 7349);
    			set_style(h31, "color", "var(--txt)");
    			add_location(h31, file$g, 203, 16, 7400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h31, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h31);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(201:12) {#if !$archiveOnly}",
    		ctx
    	});

    	return block;
    }

    // (219:4) {#if !$archiveOnly}
    function create_if_block$a(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "plus-icon pointer svelte-7qib36");
    			add_location(button, file$g, 219, 8, 7986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", stop_propagation(prevent_default(/*clickAddCollection*/ ctx[2])), false, true, true);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(219:4) {#if !$archiveOnly}",
    		ctx
    	});

    	return block;
    }

    // (226:8) {#each allCollections as collection, i (collection.id)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let collectiontile;
    	let current;

    	collectiontile = new CollectionTile({
    			props: {
    				collection: /*collection*/ ctx[12],
    				index: /*i*/ ctx[14],
    				onCollectionDrop: /*onCollectionDrop*/ ctx[3],
    				clickShareCollection: /*clickShareCollection*/ ctx[5],
    				clickDeleteCollection: /*clickDeleteCollection*/ ctx[4],
    				clickArchiveCollection: /*clickArchiveCollection*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(collectiontile.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(collectiontile, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const collectiontile_changes = {};
    			if (dirty & /*allCollections*/ 1) collectiontile_changes.collection = /*collection*/ ctx[12];
    			if (dirty & /*allCollections*/ 1) collectiontile_changes.index = /*i*/ ctx[14];
    			collectiontile.$set(collectiontile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collectiontile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collectiontile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(collectiontile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(226:8) {#each allCollections as collection, i (collection.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let emptycollectiontile;
    	let current;
    	let if_block0 = /*allCollections*/ ctx[0].length == 0 && create_if_block_1$2(ctx);
    	let if_block1 = !/*$archiveOnly*/ ctx[1] && create_if_block$a(ctx);
    	let each_value = /*allCollections*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*collection*/ ctx[12].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	emptycollectiontile = new EmptyCollectionTile({
    			props: {
    				index: /*allCollections*/ ctx[0].length,
    				onCollectionDrop: /*onCollectionDrop*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(emptycollectiontile.$$.fragment);
    			attr_dev(div, "class", "scroll");
    			add_location(div, file$g, 224, 4, 8130);
    			set_style(main, "position", "relative");
    			add_location(main, file$g, 197, 0, 7106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			mount_component(emptycollectiontile, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*allCollections*/ ctx[0].length == 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*allCollections*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*$archiveOnly*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					if_block1.m(main, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*allCollections, onCollectionDrop, clickShareCollection, clickDeleteCollection, clickArchiveCollection*/ 121) {
    				each_value = /*allCollections*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$3, t2, get_each_context$3);
    				check_outros();
    			}

    			const emptycollectiontile_changes = {};
    			if (dirty & /*allCollections*/ 1) emptycollectiontile_changes.index = /*allCollections*/ ctx[0].length;
    			emptycollectiontile.$set(emptycollectiontile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(emptycollectiontile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(emptycollectiontile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(emptycollectiontile);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getIDforFolder(folderName, callback) {
    	chrome.bookmarks.getTree(function (tree) {
    		var otherBookmarksFolderId = tree[0].children[1].id;

    		chrome.bookmarks.getChildren(otherBookmarksFolderId, function (children) {
    			var putawayfolder = children.find(e => e.title == folderName);
    			var pid;

    			if (!putawayfolder) {
    				// Folder doesn't exist, so we create one
    				chrome.bookmarks.create(
    					{
    						parentId: otherBookmarksFolderId,
    						title: folderName
    					},
    					function (newFolder) {
    						pid = newFolder.id;
    						callback(pid);
    					}
    				);
    			} else {
    				pid = putawayfolder.id;
    				callback(pid);
    			}
    		});
    	});
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $archiveOnly;
    	validate_store(archiveOnly, 'archiveOnly');
    	component_subscribe($$self, archiveOnly, $$value => $$invalidate(1, $archiveOnly = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainArea', slots, []);
    	const { open } = getContext("simple-modal");

    	// array of BookmarkTreeNode
    	let allCollections = [];

    	// Called only if pid no longer points to the correct putaway folder.
    	function refreshPidAndloadCollections(pid, pidVar) {
    		// store pid in local storage for use later
    		chrome.storage.local.set({ [pidVar]: pid });

    		loadCollections(pid, false);
    	}

    	function loadCollections(pid, retry = true, folderName = "PutAway", pidVar = "pid") {
    		chrome.bookmarks.getChildren(pid, function (children) {
    			try {
    				if (chrome.runtime.lastError) {
    					console.log('Putaway folder pid invalidated, refreshing.');
    					throw "Putaway folder pid invalidated, refreshing.";
    				}

    				// only folders
    				$$invalidate(0, allCollections = children.filter(e => e.url == null));
    			} catch(e) {
    				if (retry) {
    					// pid is invalidated, add it again.
    					getIDforFolder(folderName, pid => {
    						refreshPidAndloadCollections(pid, pidVar);
    					});
    				}
    			}
    		});
    	}

    	const unsubsribeArc = archiveOnly.subscribe(value => {
    		if (value) {
    			chrome.storage.local.get("paid", function (res) {
    				if (res.paid) {
    					loadCollections(res.paid, true, "PutAway Archives", "paid");
    				} else {
    					loadCollections("-1", true, "PutAway Archives", "paid");
    				}
    			});
    		} else {
    			chrome.storage.local.get("pid", function (res) {
    				if (res.pid) {
    					loadCollections(res.pid);
    				} else {
    					loadCollections("-1");
    				}
    			});
    		}
    	});

    	var clickAddCollection = async () => {
    		var c = await open(CreateCollectionModal);

    		if (c) {
    			// add to list at its index
    			allCollections.splice(c.index, 0, c);

    			$$invalidate(0, allCollections);
    		}
    	};

    	var onCollectionDrop = (e, dropIndex) => {
    		e.preventDefault();
    		var rawData = e.dataTransfer.getData("text");

    		deo.set({
    			source: rawData,
    			target: "c" + dropIndex.toString(),
    			sourceObj: null,
    			targetObj: null
    		});
    	};

    	const unsubsribe = deo.subscribe(obj => {
    		if (obj.source[0] == "c" && obj.target[0] == "c") {
    			var dragIndex = parseInt(obj.source.substring(1));
    			var dropIndex = parseInt(obj.target.substring(1));

    			// move allCollections from dragIndex to dropIndex
    			if (dragIndex >= dropIndex) {
    				setlastNewTabOperationTimeNow();
    				chrome.bookmarks.move(allCollections[dragIndex].id, { index: dropIndex });
    				allCollections.splice(dropIndex, 0, allCollections[dragIndex]);
    				allCollections.splice(dragIndex + 1, 1);
    			} else {
    				setlastNewTabOperationTimeNow();
    				chrome.bookmarks.move(allCollections[dragIndex].id, { index: dropIndex });
    				allCollections.splice(dropIndex, 0, allCollections[dragIndex]);
    				allCollections.splice(dragIndex, 1);
    			}

    			$$invalidate(0, allCollections);
    		}
    	});

    	onDestroy(() => {
    		unsubsribeArc();
    		unsubsribe();
    	});

    	var clickDeleteCollection = async index => {
    		var c = await open(DeleteCollectionModal, {
    			collectionName: allCollections[index].title
    		});

    		if (c) {
    			setlastNewTabOperationTimeNow();
    			chrome.bookmarks.removeTree(allCollections[index].id);
    			allCollections.splice(index, 1);
    			$$invalidate(0, allCollections);
    		}
    	};

    	var clickShareCollection = async (index, items) => {
    		var shareText = "";

    		items.forEach(item => {
    			shareText += item.title.split(":::::")[0];
    			shareText += " - ";
    			shareText += item.url;
    			shareText += "\n\n";
    		});

    		await open(ShareCollectionModal, {
    			collectionName: allCollections[index].title,
    			shareText
    		});
    	};

    	var clickArchiveCollection = async index => {
    		var c = await open(ArchiveCollectionModal, {
    			collection: allCollections[index],
    			toArchive: !$archiveOnly
    		});

    		if (c) {
    			let folder = $archiveOnly ? "PutAway" : "PutAway Archives";

    			getIDforFolder(folder, pid => {
    				chrome.bookmarks.move(allCollections[index].id, { parentId: pid });
    				allCollections.splice(index, 1);
    				$$invalidate(0, allCollections);
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<MainArea> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		getContext,
    		CreateCollectionModal,
    		DeleteCollectionModal,
    		ShareCollectionModal,
    		ArchiveCollectionModal,
    		CollectionTile,
    		open,
    		deo,
    		archiveOnly,
    		EmptyCollectionTile,
    		setlastNewTabOperationTimeNow,
    		Fa: Sveltejs_fontawesome,
    		faArchive: faArchive_2,
    		getIDforFolder,
    		allCollections,
    		refreshPidAndloadCollections,
    		loadCollections,
    		unsubsribeArc,
    		clickAddCollection,
    		onCollectionDrop,
    		unsubsribe,
    		clickDeleteCollection,
    		clickShareCollection,
    		clickArchiveCollection,
    		$archiveOnly
    	});

    	$$self.$inject_state = $$props => {
    		if ('allCollections' in $$props) $$invalidate(0, allCollections = $$props.allCollections);
    		if ('clickAddCollection' in $$props) $$invalidate(2, clickAddCollection = $$props.clickAddCollection);
    		if ('onCollectionDrop' in $$props) $$invalidate(3, onCollectionDrop = $$props.onCollectionDrop);
    		if ('clickDeleteCollection' in $$props) $$invalidate(4, clickDeleteCollection = $$props.clickDeleteCollection);
    		if ('clickShareCollection' in $$props) $$invalidate(5, clickShareCollection = $$props.clickShareCollection);
    		if ('clickArchiveCollection' in $$props) $$invalidate(6, clickArchiveCollection = $$props.clickArchiveCollection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		allCollections,
    		$archiveOnly,
    		clickAddCollection,
    		onCollectionDrop,
    		clickDeleteCollection,
    		clickShareCollection,
    		clickArchiveCollection
    	];
    }

    class MainArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainArea",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/tiles/TabTile.svelte generated by Svelte v3.52.0 */
    const file$h = "src/components/tiles/TabTile.svelte";

    // (91:4) {:else}
    function create_else_block$a(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--bg)");
    			add_location(hr, file$h, 91, 8, 2325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(91:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#if dropLine}
    function create_if_block$b(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--drop-indicator)");
    			add_location(hr, file$h, 89, 8, 2249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(89:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let button;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div0;
    	let t3_value = /*tab*/ ctx[0].title + "";
    	let t3;
    	let div3_intro;
    	let div3_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[4]) return create_if_block$b;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if_block.c();
    			t0 = space();
    			div2 = element("div");
    			button = element("button");
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			attr_dev(button, "class", "close-icon svelte-17s7imu");
    			add_location(button, file$h, 102, 8, 2716);
    			attr_dev(img, "alt", " ");
    			if (!src_url_equal(img.src, img_src_value = /*tab*/ ctx[0].favIconUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "20px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$h, 107, 12, 2899);
    			attr_dev(div0, "class", "text-concat svelte-17s7imu");
    			add_location(div0, file$h, 113, 12, 3055);
    			attr_dev(div1, "class", "flex-row-container");
    			add_location(div1, file$h, 106, 8, 2854);
    			attr_dev(div2, "class", "card svelte-17s7imu");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$h, 94, 4, 2444);
    			add_location(div3, file$h, 87, 0, 2172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if_block.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", stop_propagation(prevent_default(/*click_handler*/ ctx[10])), false, true, true),
    					listen_dev(div2, "dragover", prevent_default(/*onDragEnter*/ ctx[5]), false, true, false),
    					listen_dev(div2, "dragleave", /*onDragLeave*/ ctx[6], false, false, false),
    					listen_dev(div2, "dragstart", /*handleDragStart*/ ctx[7], false, false, false),
    					listen_dev(div2, "drop", /*handleDrop*/ ctx[8], false, false, false),
    					listen_dev(div2, "click", prevent_default(/*click_handler_1*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, t0);
    				}
    			}

    			if (!current || dirty & /*tab*/ 1 && !src_url_equal(img.src, img_src_value = /*tab*/ ctx[0].favIconUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*tab*/ 1) && t3_value !== (t3_value = /*tab*/ ctx[0].title + "")) set_data_dev(t3, t3_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				div3_intro = create_in_transition(div3, fly, { x: 500, duration: 400 });
    				div3_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			if (detaching && div3_outro) div3_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabTile', slots, []);
    	let { tab } = $$props;
    	let { index } = $$props;
    	let { onClickTabCard } = $$props;
    	let { onTabTileClose } = $$props;
    	let { onDrop } = $$props;
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(4, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(4, dropLine = false);
    	};

    	var handleDragStart = e => {
    		e.dataTransfer.setData("text", "t" + index.toString());
    		e.dataTransfer.setData("object", JSON.stringify(tab));
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(4, dropLine = false);
    		onDrop(e, index);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (tab === undefined && !('tab' in $$props || $$self.$$.bound[$$self.$$.props['tab']])) {
    			console.warn("<TabTile> was created without expected prop 'tab'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<TabTile> was created without expected prop 'index'");
    		}

    		if (onClickTabCard === undefined && !('onClickTabCard' in $$props || $$self.$$.bound[$$self.$$.props['onClickTabCard']])) {
    			console.warn("<TabTile> was created without expected prop 'onClickTabCard'");
    		}

    		if (onTabTileClose === undefined && !('onTabTileClose' in $$props || $$self.$$.bound[$$self.$$.props['onTabTileClose']])) {
    			console.warn("<TabTile> was created without expected prop 'onTabTileClose'");
    		}

    		if (onDrop === undefined && !('onDrop' in $$props || $$self.$$.bound[$$self.$$.props['onDrop']])) {
    			console.warn("<TabTile> was created without expected prop 'onDrop'");
    		}
    	});

    	const writable_props = ['tab', 'index', 'onClickTabCard', 'onTabTileClose', 'onDrop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabTile> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onTabTileClose(tab, index);
    	const click_handler_1 = () => onClickTabCard(tab);

    	$$self.$$set = $$props => {
    		if ('tab' in $$props) $$invalidate(0, tab = $$props.tab);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('onClickTabCard' in $$props) $$invalidate(2, onClickTabCard = $$props.onClickTabCard);
    		if ('onTabTileClose' in $$props) $$invalidate(3, onTabTileClose = $$props.onTabTileClose);
    		if ('onDrop' in $$props) $$invalidate(9, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		tab,
    		index,
    		onClickTabCard,
    		onTabTileClose,
    		onDrop,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop
    	});

    	$$self.$inject_state = $$props => {
    		if ('tab' in $$props) $$invalidate(0, tab = $$props.tab);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('onClickTabCard' in $$props) $$invalidate(2, onClickTabCard = $$props.onClickTabCard);
    		if ('onTabTileClose' in $$props) $$invalidate(3, onTabTileClose = $$props.onTabTileClose);
    		if ('onDrop' in $$props) $$invalidate(9, onDrop = $$props.onDrop);
    		if ('dropLine' in $$props) $$invalidate(4, dropLine = $$props.dropLine);
    		if ('onDragEnter' in $$props) $$invalidate(5, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(6, onDragLeave = $$props.onDragLeave);
    		if ('handleDragStart' in $$props) $$invalidate(7, handleDragStart = $$props.handleDragStart);
    		if ('handleDrop' in $$props) $$invalidate(8, handleDrop = $$props.handleDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tab,
    		index,
    		onClickTabCard,
    		onTabTileClose,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop,
    		onDrop,
    		click_handler,
    		click_handler_1
    	];
    }

    class TabTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			tab: 0,
    			index: 1,
    			onClickTabCard: 2,
    			onTabTileClose: 3,
    			onDrop: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabTile",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get tab() {
    		throw new Error("<TabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tab(value) {
    		throw new Error("<TabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<TabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<TabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClickTabCard() {
    		throw new Error("<TabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClickTabCard(value) {
    		throw new Error("<TabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onTabTileClose() {
    		throw new Error("<TabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onTabTileClose(value) {
    		throw new Error("<TabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrop() {
    		throw new Error("<TabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrop(value) {
    		throw new Error("<TabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/tiles/EmptyTabTile.svelte generated by Svelte v3.52.0 */

    const file$i = "src/components/tiles/EmptyTabTile.svelte";

    // (26:4) {:else}
    function create_else_block$b(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--bg)");
    			add_location(hr, file$i, 26, 8, 532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$b.name,
    		type: "else",
    		source: "(26:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#if dropLine}
    function create_if_block$c(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid var(--drop-indicator)");
    			add_location(hr, file$i, 24, 8, 456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(24:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[0]) return create_if_block$c;
    		return create_else_block$b;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t = space();
    			div0 = element("div");
    			set_style(div0, "height", "200px");
    			add_location(div0, file$i, 28, 4, 590);
    			add_location(div1, file$i, 22, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    					listen_dev(div0, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    					listen_dev(div0, "drop", /*handleDrop*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EmptyTabTile', slots, []);
    	let { index } = $$props;
    	let { onDrop } = $$props;
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(0, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(0, dropLine = false);
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(0, dropLine = false);
    		onDrop(e, index);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<EmptyTabTile> was created without expected prop 'index'");
    		}

    		if (onDrop === undefined && !('onDrop' in $$props || $$self.$$.bound[$$self.$$.props['onDrop']])) {
    			console.warn("<EmptyTabTile> was created without expected prop 'onDrop'");
    		}
    	});

    	const writable_props = ['index', 'onDrop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EmptyTabTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onDrop' in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => ({
    		index,
    		onDrop,
    		dropLine,
    		onDragEnter,
    		onDragLeave,
    		handleDrop
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(4, index = $$props.index);
    		if ('onDrop' in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    		if ('dropLine' in $$props) $$invalidate(0, dropLine = $$props.dropLine);
    		if ('onDragEnter' in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ('onDragLeave' in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ('handleDrop' in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dropLine, onDragEnter, onDragLeave, handleDrop, index, onDrop];
    }

    class EmptyTabTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { index: 4, onDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmptyTabTile",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get index() {
    		throw new Error("<EmptyTabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<EmptyTabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrop() {
    		throw new Error("<EmptyTabTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrop(value) {
    		throw new Error("<EmptyTabTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/modals/SaveSessionModal.svelte generated by Svelte v3.52.0 */
    const file$j = "src/components/modals/SaveSessionModal.svelte";

    function create_fragment$j(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let input;
    	let input_onchange_value;
    	let t2;
    	let div1;
    	let div0;
    	let t3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Collection Name -";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t3 = text(/*errorString*/ ctx[1]);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Save Session to\n            Collection";
    			add_location(h1, file$j, 93, 4, 2211);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "onchange", input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]));
    			input.autofocus = true;
    			attr_dev(input, "class", "svelte-1dkdkti");
    			add_location(input, file$j, 96, 4, 2285);
    			set_style(div0, "padding", "10px");
    			set_style(div0, "color", "red");
    			add_location(div0, file$j, 99, 8, 2429);
    			attr_dev(button, "class", "pointer svelte-1dkdkti");
    			add_location(button, file$j, 100, 8, 2497);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-1dkdkti");
    			add_location(div1, file$j, 98, 4, 2390);
    			add_location(main, file$j, 92, 0, 2200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, input);
    			set_input_value(input, /*collectionName*/ ctx[0]);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			input.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*handleKeyUp*/ ctx[3], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*onClickCreate*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*collectionName*/ 1 && input_onchange_value !== (input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]))) {
    				attr_dev(input, "onchange", input_onchange_value);
    			}

    			if (dirty & /*collectionName*/ 1 && input.value !== /*collectionName*/ ctx[0]) {
    				set_input_value(input, /*collectionName*/ ctx[0]);
    			}

    			if (dirty & /*errorString*/ 2) set_data_dev(t3, /*errorString*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SaveSessionModal', slots, []);
    	var dt = new Date();

    	let collectionName = `Session ${dt.getDate()}-${(dt.getMonth() + 1).toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false
	})}-${dt.getFullYear()}, ${dt.getHours()}:${dt.getMinutes().toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false
	})}:${dt.getSeconds().toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false
	})}`;

    	let errorString = "";
    	const { close } = getContext("simple-modal");

    	function createBookmarkFolder() {
    		chrome.storage.local.get("pid", function (map) {
    			chrome.bookmarks.create(
    				{
    					parentId: map.pid,
    					title: collectionName,
    					index: 0
    				},
    				function (createdFolder) {
    					close(createdFolder);
    				}
    			);
    		});
    	}

    	var onClickCreate = () => {
    		$$invalidate(0, collectionName = collectionName.trim());

    		if (collectionName.length > 0) {
    			$$invalidate(1, errorString = "");
    			createBookmarkFolder();
    		} else {
    			$$invalidate(1, errorString = "Enter a collection Name");
    		}
    	};

    	function handleKeyUp(event) {
    		// on press enter
    		if (event.keyCode == 13) {
    			onClickCreate();
    		}
    	}

    	function inputFormatter(str) {
    		$$invalidate(0, collectionName = str.replace(/\s+/g, " "));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SaveSessionModal> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		collectionName = this.value;
    		$$invalidate(0, collectionName);
    	}

    	$$self.$capture_state = () => ({
    		getContext,
    		dt,
    		collectionName,
    		errorString,
    		close,
    		createBookmarkFolder,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter
    	});

    	$$self.$inject_state = $$props => {
    		if ('dt' in $$props) dt = $$props.dt;
    		if ('collectionName' in $$props) $$invalidate(0, collectionName = $$props.collectionName);
    		if ('errorString' in $$props) $$invalidate(1, errorString = $$props.errorString);
    		if ('onClickCreate' in $$props) $$invalidate(2, onClickCreate = $$props.onClickCreate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		collectionName,
    		errorString,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter,
    		input_input_handler
    	];
    }

    class SaveSessionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SaveSessionModal",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/components/OpenTabsBar.svelte generated by Svelte v3.52.0 */
    const file$k = "src/components/OpenTabsBar.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (118:8) {#if allTabs.length > 0}
    function create_if_block$d(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Save Session";
    			attr_dev(div, "class", "rounded-button pointer");
    			set_style(div, "font-size", "1em");
    			add_location(div, file$k, 119, 12, 4173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*saveSession*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(118:8) {#if allTabs.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (130:8) {#each allTabs as tab, i (tab.id)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let tabtile;
    	let current;

    	tabtile = new TabTile({
    			props: {
    				tab: /*tab*/ ctx[7],
    				index: /*i*/ ctx[9],
    				onClickTabCard: /*onClickTabCard*/ ctx[1],
    				onTabTileClose: /*onTabTileClose*/ ctx[2],
    				onDrop: /*onDrop*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tabtile.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tabtile, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tabtile_changes = {};
    			if (dirty & /*allTabs*/ 1) tabtile_changes.tab = /*tab*/ ctx[7];
    			if (dirty & /*allTabs*/ 1) tabtile_changes.index = /*i*/ ctx[9];
    			tabtile.$set(tabtile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabtile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabtile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tabtile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(130:8) {#each allTabs as tab, i (tab.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let t0;
    	let t1_value = /*allTabs*/ ctx[0].length + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t5;
    	let emptytabtile;
    	let current;
    	let if_block = /*allTabs*/ ctx[0].length > 0 && create_if_block$d(ctx);
    	let each_value = /*allTabs*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*tab*/ ctx[7].id;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	emptytabtile = new EmptyTabTile({
    			props: {
    				index: /*allTabs*/ ctx[0].length,
    				onDrop: /*onDrop*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Open Tabs - ");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			create_component(emptytabtile.$$.fragment);
    			set_style(div0, "font-size", "1.8em");
    			add_location(div0, file$k, 115, 8, 3956);
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$k, 116, 8, 4030);
    			attr_dev(div2, "class", "flex-row-container");
    			add_location(div2, file$k, 114, 4, 3915);
    			attr_dev(div3, "class", "scroll");
    			add_location(div3, file$k, 128, 4, 4383);
    			add_location(div4, file$k, 113, 0, 3905);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div2, t3);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div4, t4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div3, t5);
    			mount_component(emptytabtile, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*allTabs*/ 1) && t1_value !== (t1_value = /*allTabs*/ ctx[0].length + "")) set_data_dev(t1, t1_value);

    			if (/*allTabs*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*allTabs, onClickTabCard, onTabTileClose, onDrop*/ 15) {
    				each_value = /*allTabs*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div3, outro_and_destroy_block, create_each_block$4, t5, get_each_context$4);
    				check_outros();
    			}

    			const emptytabtile_changes = {};
    			if (dirty & /*allTabs*/ 1) emptytabtile_changes.index = /*allTabs*/ ctx[0].length;
    			emptytabtile.$set(emptytabtile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(emptytabtile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(emptytabtile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(emptytabtile);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OpenTabsBar', slots, []);
    	const { open } = getContext("simple-modal");
    	let allTabs = [];

    	onMount(() => {
    		chrome.tabs.query({ currentWindow: true }, tabs => {
    			$$invalidate(0, allTabs = tabs.filter(function (tab) {
    				return tab.url != "chrome://newtab/";
    			}));
    		});
    	});

    	const unsubsribe = deo.subscribe(obj => {
    		if (obj.source[0] == "t") {
    			if (obj.target[0] == "i") {
    				if (obj.ctrl != null && !obj.ctrl) {
    					//  only delete tab if ctrl wasn't held by user
    					setlastNewTabOperationTimeNow();

    					chrome.tabs.remove(obj.sourceObj.id);
    					allTabs.splice(parseInt(obj.source.substring(1)), 1);
    					$$invalidate(0, allTabs);
    				}
    			} else if (obj.target[0] == "t") {
    				var dragIndex = parseInt(obj.source.substring(1));
    				var dropIndex = parseInt(obj.target.substring(1));

    				// move tabs from dragIndex to dropIndex
    				if (dragIndex >= dropIndex) {
    					setlastNewTabOperationTimeNow();
    					chrome.tabs.move(obj.sourceObj.id, { index: dropIndex });
    					allTabs.splice(dropIndex, 0, obj.sourceObj);
    					allTabs.splice(dragIndex + 1, 1);
    				} else {
    					setlastNewTabOperationTimeNow();
    					chrome.tabs.move(obj.sourceObj.id, { index: dropIndex - 1 });
    					allTabs.splice(dropIndex, 0, obj.sourceObj);
    					allTabs.splice(dragIndex, 1);
    				}

    				$$invalidate(0, allTabs);
    			}
    		}
    	});

    	onDestroy(unsubsribe);

    	var onClickTabCard = tab => {
    		chrome.tabs.update(tab.id, { active: true });
    	};

    	var onTabTileClose = (tab, i) => {
    		allTabs.splice(i, 1);
    		$$invalidate(0, allTabs);
    		setlastNewTabOperationTimeNow();
    		chrome.tabs.remove(tab.id);
    	};

    	var onDrop = (e, dropIndex) => {
    		e.preventDefault();
    		var rawData = e.dataTransfer.getData("text");
    		var obj = JSON.parse(e.dataTransfer.getData("object"));

    		deo.set({
    			source: rawData,
    			target: "t" + dropIndex.toString(),
    			sourceObj: obj,
    			targetObj: allTabs[dropIndex]
    		});
    	};

    	var saveSession = async () => {
    		var c = await open(SaveSessionModal);

    		if (c) {
    			var count = allTabs.length;
    			setlastNewTabOperationTimeNow();

    			allTabs.forEach(tab => {
    				chrome.bookmarks.create(
    					{
    						parentId: c.id,
    						url: tab.url,
    						title: tab.title + ":::::" + tab.favIconUrl
    					},
    					function (node) {
    						count--;

    						if (count == 0) {
    							// reload tab to take effect
    							chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    								chrome.tabs.reload(tabs[0].id);
    							});
    						}
    					}
    				);
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OpenTabsBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		getContext,
    		TabTile,
    		EmptyTabTile,
    		deo,
    		setlastNewTabOperationTimeNow,
    		open,
    		SaveSessionModal,
    		allTabs,
    		unsubsribe,
    		onClickTabCard,
    		onTabTileClose,
    		onDrop,
    		saveSession
    	});

    	$$self.$inject_state = $$props => {
    		if ('allTabs' in $$props) $$invalidate(0, allTabs = $$props.allTabs);
    		if ('onClickTabCard' in $$props) $$invalidate(1, onClickTabCard = $$props.onClickTabCard);
    		if ('onTabTileClose' in $$props) $$invalidate(2, onTabTileClose = $$props.onTabTileClose);
    		if ('onDrop' in $$props) $$invalidate(3, onDrop = $$props.onDrop);
    		if ('saveSession' in $$props) $$invalidate(4, saveSession = $$props.saveSession);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [allTabs, onClickTabCard, onTabTileClose, onDrop, saveSession];
    }

    class OpenTabsBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpenTabsBar",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.52.0 */

    const { Object: Object_1 } = globals;
    const file$l = "src/components/Modal.svelte";

    // (212:4) {#if Component}
    function create_if_block$e(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*closeButton*/ ctx[0] && create_if_block_1$3(ctx);
    	const switch_instance_spread_levels = [/*props*/ ctx[6]];
    	var switch_value = /*Component*/ ctx[5];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-1olnpzh");
    			attr_dev(div0, "style", /*cssContent*/ ctx[9]);
    			add_location(div0, file$l, 227, 20, 6339);
    			attr_dev(div1, "class", "window svelte-1olnpzh");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			add_location(div1, file$l, 220, 16, 6038);
    			attr_dev(div2, "class", "window-wrap svelte-1olnpzh");
    			add_location(div2, file$l, 219, 12, 5979);
    			attr_dev(div3, "class", "bg svelte-1olnpzh");
    			attr_dev(div3, "style", /*cssBg*/ ctx[11]);
    			add_location(div3, file$l, 213, 8, 5781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			if (switch_instance) mount_component(switch_instance, div0, null);
    			/*div2_binding*/ ctx[27](div2);
    			/*div3_binding*/ ctx[28](div3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*handleOuterClick*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*closeButton*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const switch_instance_changes = (dirty[0] & /*props*/ 64)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[6])])
    			: {};

    			if (switch_value !== (switch_value = /*Component*/ ctx[5])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 512) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 1024) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 2048) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[3], /*transitionWindowProps*/ ctx[4], true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[1], /*transitionBgProps*/ ctx[2], true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[3], /*transitionWindowProps*/ ctx[4], false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[1], /*transitionBgProps*/ ctx[2], false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[27](null);
    			/*div3_binding*/ ctx[28](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(212:4) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (225:20) {#if closeButton}
    function create_if_block_1$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-1olnpzh");
    			add_location(button, file$l, 225, 24, 6251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(225:20) {#if closeButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[5] && create_if_block$e(ctx);
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1olnpzh");
    			add_location(div, file$l, 210, 0, 5682);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[25],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[25])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[25], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let cssBg;
    	let cssWindow;
    	let cssContent;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	let { key = "simple-modal" } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;
    	let { styleBg = { top: 0, left: 0 } } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { setContext: setContext$1 = setContext } = $$props;
    	let Component = null;
    	let props = null;
    	let background;
    	let wrap;
    	let customStyleBg = {};
    	let customStyleWindow = {};
    	let customStyleContent = {};
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");
    	var resolver;

    	const open = (NewComponent, newProps = {}, style = { bg: {}, window: {}, content: {} }) => new Promise(resolve => {
    			resolver = resolve;
    			$$invalidate(5, Component = NewComponent);
    			$$invalidate(6, props = newProps);
    			$$invalidate(22, customStyleBg = style.bg || {});
    			$$invalidate(23, customStyleWindow = style.window || {});
    			$$invalidate(24, customStyleContent = style.content || {});
    		});

    	const close = objectToReturn => {
    		$$invalidate(5, Component = null);
    		$$invalidate(6, props = null);
    		$$invalidate(22, customStyleBg = {});
    		$$invalidate(23, customStyleWindow = {});
    		$$invalidate(24, customStyleContent = {});
    		resolver(objectToReturn);
    	};

    	const handleKeyup = ({ key }) => {
    		if (closeOnEsc && Component && key === "Escape") {
    			event.preventDefault();
    			close();
    		}
    	};

    	const handleOuterClick = event => {
    		if (closeOnOuterClick && (event.target === background || event.target === wrap)) {
    			event.preventDefault();
    			close();
    		}
    	};

    	setContext$1(key, { open, close });

    	const writable_props = [
    		'key',
    		'closeButton',
    		'closeOnEsc',
    		'closeOnOuterClick',
    		'transitionBg',
    		'transitionBgProps',
    		'transitionWindow',
    		'transitionWindowProps',
    		'styleBg',
    		'styleWindow',
    		'styleContent',
    		'setContext'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrap = $$value;
    			$$invalidate(8, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			background = $$value;
    			$$invalidate(7, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('key' in $$props) $$invalidate(15, key = $$props.key);
    		if ('closeButton' in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(16, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(17, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('transitionBg' in $$props) $$invalidate(1, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(2, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(3, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(4, transitionWindowProps = $$props.transitionWindowProps);
    		if ('styleBg' in $$props) $$invalidate(18, styleBg = $$props.styleBg);
    		if ('styleWindow' in $$props) $$invalidate(19, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(20, styleContent = $$props.styleContent);
    		if ('setContext' in $$props) $$invalidate(21, setContext$1 = $$props.setContext);
    		if ('$$scope' in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		baseSetContext: setContext,
    		fade,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext: setContext$1,
    		Component,
    		props,
    		background,
    		wrap,
    		customStyleBg,
    		customStyleWindow,
    		customStyleContent,
    		camelCaseToDash,
    		toCssString,
    		resolver,
    		open,
    		close,
    		handleKeyup,
    		handleOuterClick,
    		cssContent,
    		cssWindow,
    		cssBg
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(15, key = $$props.key);
    		if ('closeButton' in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(16, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(17, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('transitionBg' in $$props) $$invalidate(1, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(2, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(3, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(4, transitionWindowProps = $$props.transitionWindowProps);
    		if ('styleBg' in $$props) $$invalidate(18, styleBg = $$props.styleBg);
    		if ('styleWindow' in $$props) $$invalidate(19, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(20, styleContent = $$props.styleContent);
    		if ('setContext' in $$props) $$invalidate(21, setContext$1 = $$props.setContext);
    		if ('Component' in $$props) $$invalidate(5, Component = $$props.Component);
    		if ('props' in $$props) $$invalidate(6, props = $$props.props);
    		if ('background' in $$props) $$invalidate(7, background = $$props.background);
    		if ('wrap' in $$props) $$invalidate(8, wrap = $$props.wrap);
    		if ('customStyleBg' in $$props) $$invalidate(22, customStyleBg = $$props.customStyleBg);
    		if ('customStyleWindow' in $$props) $$invalidate(23, customStyleWindow = $$props.customStyleWindow);
    		if ('customStyleContent' in $$props) $$invalidate(24, customStyleContent = $$props.customStyleContent);
    		if ('resolver' in $$props) resolver = $$props.resolver;
    		if ('cssContent' in $$props) $$invalidate(9, cssContent = $$props.cssContent);
    		if ('cssWindow' in $$props) $$invalidate(10, cssWindow = $$props.cssWindow);
    		if ('cssBg' in $$props) $$invalidate(11, cssBg = $$props.cssBg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*styleBg, customStyleBg*/ 4456448) {
    			 $$invalidate(11, cssBg = toCssString(Object.assign({}, styleBg, customStyleBg)));
    		}

    		if ($$self.$$.dirty[0] & /*styleWindow, customStyleWindow*/ 8912896) {
    			 $$invalidate(10, cssWindow = toCssString(Object.assign({}, styleWindow, customStyleWindow)));
    		}

    		if ($$self.$$.dirty[0] & /*styleContent, customStyleContent*/ 17825792) {
    			 $$invalidate(9, cssContent = toCssString(Object.assign({}, styleContent, customStyleContent)));
    		}
    	};

    	return [
    		closeButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		Component,
    		props,
    		background,
    		wrap,
    		cssContent,
    		cssWindow,
    		cssBg,
    		close,
    		handleKeyup,
    		handleOuterClick,
    		key,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext$1,
    		customStyleBg,
    		customStyleWindow,
    		customStyleContent,
    		$$scope,
    		slots,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$l,
    			create_fragment$l,
    			safe_not_equal,
    			{
    				key: 15,
    				closeButton: 0,
    				closeOnEsc: 16,
    				closeOnOuterClick: 17,
    				transitionBg: 1,
    				transitionBgProps: 2,
    				transitionWindow: 3,
    				transitionWindowProps: 4,
    				styleBg: 18,
    				styleWindow: 19,
    				styleContent: 20,
    				setContext: 21
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // a few storage utilities (not for location of folder)

    const setDarkTheme = function (v) {
        chrome.storage.sync.set({ dark: v });
    };

    const getDarkTheme = function (callback) {
        chrome.storage.sync.get('dark', function (v) {
            if (v.dark) {
                callback(v.dark);
            } else {
                callback(false);
            }
        });
    };

    /* src/NewTab.svelte generated by Svelte v3.52.0 */

    const file$m = "src/NewTab.svelte";

    // (99:2) {:else}
    function create_else_block_1$2(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "global-light.css");
    			add_location(link, file$m, 99, 4, 2710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(99:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (97:2) {#if darkTheme}
    function create_if_block_1$4(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "global-dark.css");
    			add_location(link, file$m, 97, 4, 2647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(97:2) {#if darkTheme}",
    		ctx
    	});

    	return block;
    }

    // (126:0) {:else}
    function create_else_block$c(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$m, 126, 2, 3379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$c.name,
    		type: "else",
    		source: "(126:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (103:0) {#if pageReady}
    function create_if_block$f(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				closeButton: false,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, openTabsBarWidth, openTabsBarReloadKey, mainAreaReloadKey, darkTheme*/ 285) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(103:0) {#if pageReady}",
    		ctx
    	});

    	return block;
    }

    // (113:12) {#key mainAreaReloadKey}
    function create_key_block_1(ctx) {
    	let mainarea;
    	let current;
    	mainarea = new MainArea({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mainarea.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mainarea, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mainarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mainarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mainarea, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(113:12) {#key mainAreaReloadKey}",
    		ctx
    	});

    	return block;
    }

    // (120:8) {#key openTabsBarReloadKey}
    function create_key_block(ctx) {
    	let opentabsbar;
    	let current;
    	opentabsbar = new OpenTabsBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(opentabsbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(opentabsbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(opentabsbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(opentabsbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(opentabsbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(120:8) {#key openTabsBarReloadKey}",
    		ctx
    	});

    	return block;
    }

    // (104:2) <Modal closeButton={false}>
    function create_default_slot$3(ctx) {
    	let div5;
    	let div3;
    	let div1;
    	let div0;
    	let topbar;
    	let t0;
    	let div2;
    	let previous_key = /*mainAreaReloadKey*/ ctx[3];
    	let t1;
    	let div4;
    	let previous_key_1 = /*openTabsBarReloadKey*/ ctx[4];
    	let current;

    	topbar = new TopBar({
    			props: {
    				darkTheme: /*darkTheme*/ ctx[0],
    				toggleTheme: /*toggleTheme*/ ctx[5]
    			},
    			$$inline: true
    		});

    	let key_block0 = create_key_block_1(ctx);
    	let key_block1 = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(topbar.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			key_block0.c();
    			t1 = space();
    			div4 = element("div");
    			key_block1.c();
    			attr_dev(div0, "id", "top-bar-container");
    			attr_dev(div0, "class", "svelte-1v069xm");
    			add_location(div0, file$m, 107, 10, 2932);
    			attr_dev(div1, "id", "top-bar");
    			attr_dev(div1, "class", "svelte-1v069xm");
    			add_location(div1, file$m, 106, 8, 2903);
    			attr_dev(div2, "id", "main-free-area");
    			attr_dev(div2, "class", "svelte-1v069xm");
    			add_location(div2, file$m, 111, 8, 3050);
    			attr_dev(div3, "id", "left-free-area");
    			attr_dev(div3, "class", "svelte-1v069xm");
    			add_location(div3, file$m, 105, 6, 2869);
    			attr_dev(div4, "id", "right-fixed-bar");
    			set_style(div4, "width", /*openTabsBarWidth*/ ctx[2] + "vw");
    			attr_dev(div4, "class", "svelte-1v069xm");
    			add_location(div4, file$m, 118, 6, 3194);
    			attr_dev(div5, "class", "container-table svelte-1v069xm");
    			add_location(div5, file$m, 104, 4, 2833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			mount_component(topbar, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			key_block0.m(div2, null);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			key_block1.m(div4, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const topbar_changes = {};
    			if (dirty & /*darkTheme*/ 1) topbar_changes.darkTheme = /*darkTheme*/ ctx[0];
    			topbar.$set(topbar_changes);

    			if (dirty & /*mainAreaReloadKey*/ 8 && safe_not_equal(previous_key, previous_key = /*mainAreaReloadKey*/ ctx[3])) {
    				group_outros();
    				transition_out(key_block0, 1, 1, noop);
    				check_outros();
    				key_block0 = create_key_block_1(ctx);
    				key_block0.c();
    				transition_in(key_block0, 1);
    				key_block0.m(div2, null);
    			} else {
    				key_block0.p(ctx, dirty);
    			}

    			if (dirty & /*openTabsBarReloadKey*/ 16 && safe_not_equal(previous_key_1, previous_key_1 = /*openTabsBarReloadKey*/ ctx[4])) {
    				group_outros();
    				transition_out(key_block1, 1, 1, noop);
    				check_outros();
    				key_block1 = create_key_block(ctx);
    				key_block1.c();
    				transition_in(key_block1, 1);
    				key_block1.m(div4, null);
    			} else {
    				key_block1.p(ctx, dirty);
    			}

    			if (!current || dirty & /*openTabsBarWidth*/ 4) {
    				set_style(div4, "width", /*openTabsBarWidth*/ ctx[2] + "vw");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(key_block0);
    			transition_in(key_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(key_block0);
    			transition_out(key_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(topbar);
    			key_block0.d(detaching);
    			key_block1.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(104:2) <Modal closeButton={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let if_block0_anchor;
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*darkTheme*/ ctx[0]) return create_if_block_1$4;
    		return create_else_block_1$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$f, create_else_block$c];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*pageReady*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			if_block0_anchor = empty();
    			t = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block0.m(document.head, null);
    			append_dev(document.head, if_block0_anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_block0.d(detaching);
    			detach_dev(if_block0_anchor);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NewTab', slots, []);
    	let darkTheme = false;

    	var toggleTheme = () => {
    		$$invalidate(0, darkTheme = !darkTheme);
    		setDarkTheme(darkTheme);
    	};

    	let pageReady = false;
    	let openTabsBarWidth = getOpenTabsBarWidth();
    	let mainAreaReloadKey = 0;
    	let openTabsBarReloadKey = 0;

    	let mainAreaReloadKeyUpdate = () => {
    		if (getlastNewTabOperationTimeNowDiffMs() < 2000) return;
    		$$invalidate(3, mainAreaReloadKey += 1);
    	};

    	let openTabsBarReloadKeyUpdate = () => {
    		if (getlastNewTabOperationTimeNowDiffMs() < 2000) return;
    		$$invalidate(4, openTabsBarReloadKey += 1);
    	};

    	onMount(async () => {
    		getDarkTheme(function (v) {
    			$$invalidate(0, darkTheme = v);
    		});

    		await loadGlobalSettings();
    		$$invalidate(2, openTabsBarWidth = getOpenTabsBarWidth());
    		$$invalidate(1, pageReady = true);

    		if (getReloadBookmarkSectionOnChange()) {
    			chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    				mainAreaReloadKeyUpdate();
    			});

    			chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
    				mainAreaReloadKeyUpdate();
    			});

    			chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    				mainAreaReloadKeyUpdate();
    			});
    		}

    		if (getReloadOpenTabsSectionOnChange()) {
    			chrome.tabs.onCreated.addListener(tab => {
    				openTabsBarReloadKeyUpdate();
    			});

    			chrome.tabs.onMoved.addListener((id, moveInfo) => {
    				openTabsBarReloadKeyUpdate();
    			});

    			chrome.tabs.onUpdated.addListener((id, info) => {
    				if (info.status === 'complete') openTabsBarReloadKeyUpdate();
    			});

    			chrome.tabs.onRemoved.addListener((id, removeInfo) => {
    				openTabsBarReloadKeyUpdate();
    			});
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NewTab> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TopBar,
    		MainArea,
    		OpenTabsBar,
    		Modal,
    		setDarkTheme,
    		getDarkTheme,
    		onMount,
    		loadGlobalSettings,
    		getOpenTabsBarWidth,
    		getReloadBookmarkSectionOnChange,
    		getReloadOpenTabsSectionOnChange,
    		getlastNewTabOperationTimeNowDiffMs,
    		darkTheme,
    		toggleTheme,
    		pageReady,
    		openTabsBarWidth,
    		mainAreaReloadKey,
    		openTabsBarReloadKey,
    		mainAreaReloadKeyUpdate,
    		openTabsBarReloadKeyUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ('darkTheme' in $$props) $$invalidate(0, darkTheme = $$props.darkTheme);
    		if ('toggleTheme' in $$props) $$invalidate(5, toggleTheme = $$props.toggleTheme);
    		if ('pageReady' in $$props) $$invalidate(1, pageReady = $$props.pageReady);
    		if ('openTabsBarWidth' in $$props) $$invalidate(2, openTabsBarWidth = $$props.openTabsBarWidth);
    		if ('mainAreaReloadKey' in $$props) $$invalidate(3, mainAreaReloadKey = $$props.mainAreaReloadKey);
    		if ('openTabsBarReloadKey' in $$props) $$invalidate(4, openTabsBarReloadKey = $$props.openTabsBarReloadKey);
    		if ('mainAreaReloadKeyUpdate' in $$props) mainAreaReloadKeyUpdate = $$props.mainAreaReloadKeyUpdate;
    		if ('openTabsBarReloadKeyUpdate' in $$props) openTabsBarReloadKeyUpdate = $$props.openTabsBarReloadKeyUpdate;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		darkTheme,
    		pageReady,
    		openTabsBarWidth,
    		mainAreaReloadKey,
    		openTabsBarReloadKey,
    		toggleTheme
    	];
    }

    class NewTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTab",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    const app = new NewTab({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=newtab.bundle.js.map
