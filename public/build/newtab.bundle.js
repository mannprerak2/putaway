
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
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
            if (typeof $$scope.dirty === 'object') {
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
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
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
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
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
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
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
    const seen_callbacks = new Set();
    function flush() {
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
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
            const d = program.b - t;
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
            if (running_program) {
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

    const globals = (typeof window !== 'undefined' ? window : global);
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
                throw new Error(`Cannot have duplicate keys in a keyed each`);
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const searchText = writable("");

    /* src/components/TopBar.svelte generated by Svelte v3.18.1 */
    const file = "src/components/TopBar.svelte";

    function create_fragment(ctx) {
    	let main;
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search");
    			attr_dev(input, "class", "svelte-1ivx5mh");
    			add_location(input, file, 16, 4, 329);
    			add_location(main, file, 15, 0, 318);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input);
    			set_input_value(input, /*$searchText*/ ctx[0]);
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$searchText*/ 1 && input.value !== /*$searchText*/ ctx[0]) {
    				set_input_value(input, /*$searchText*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			dispose();
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
    	let $searchText;
    	validate_store(searchText, "searchText");
    	component_subscribe($$self, searchText, $$value => $$invalidate(0, $searchText = $$value));

    	function input_input_handler() {
    		$searchText = this.value;
    		searchText.set($searchText);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$searchText" in $$props) searchText.set($searchText = $$props.$searchText);
    	};

    	return [$searchText, input_input_handler];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
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

    /* src/components/CreateCollectionModal.svelte generated by Svelte v3.18.1 */
    const file$1 = "src/components/CreateCollectionModal.svelte";

    function create_fragment$1(ctx) {
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
    			add_location(h1, file$1, 77, 4, 1692);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "onchange", input_onchange_value = /*inputFormatter*/ ctx[4](/*collectionName*/ ctx[0]));
    			input.autofocus = true;
    			attr_dev(input, "class", "svelte-shfknq");
    			add_location(input, file$1, 80, 4, 1766);
    			set_style(div0, "padding", "10px");
    			set_style(div0, "color", "red");
    			add_location(div0, file$1, 83, 8, 1910);
    			attr_dev(button, "class", "svelte-shfknq");
    			add_location(button, file$1, 84, 8, 1978);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-shfknq");
    			add_location(div1, file$1, 82, 4, 1871);
    			add_location(main, file$1, 76, 0, 1681);
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

    			dispose = [
    				listen_dev(window, "keyup", /*handleKeyUp*/ ctx[3], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    				listen_dev(button, "click", /*onClickCreate*/ ctx[2], false, false, false)
    			];
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
    			run_all(dispose);
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
    	let collectionName = "";
    	let errorString = "";
    	const { close } = getContext("simple-modal");

    	function createBookmarkFolder() {
    		chrome.storage.local.get("pid", function (map) {
    			chrome.bookmarks.create(
    				{
    					"parentId": map.pid,
    					"title": collectionName,
    					"index": 0
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

    	function input_input_handler() {
    		collectionName = this.value;
    		$$invalidate(0, collectionName);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("collectionName" in $$props) $$invalidate(0, collectionName = $$props.collectionName);
    		if ("errorString" in $$props) $$invalidate(1, errorString = $$props.errorString);
    		if ("onClickCreate" in $$props) $$invalidate(2, onClickCreate = $$props.onClickCreate);
    	};

    	return [
    		collectionName,
    		errorString,
    		onClickCreate,
    		handleKeyUp,
    		inputFormatter,
    		close,
    		createBookmarkFolder,
    		input_input_handler
    	];
    }

    class CreateCollectionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateCollectionModal",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/tiles/ItemTile.svelte generated by Svelte v3.18.1 */
    const file$2 = "src/components/tiles/ItemTile.svelte";

    // (82:4) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "white");
    			add_location(div, file$2, 82, 8, 2134);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(82:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#if dropLine}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "black");
    			add_location(div, file$2, 80, 8, 2067);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(80:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
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
    	let t3_value = /*item*/ ctx[1].title.split(":::::")[0] + "";
    	let t3;
    	let div2_outro;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[4]) return create_if_block;
    		return create_else_block;
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
    			attr_dev(button, "class", "close-icon svelte-13j9ulv");
    			add_location(button, file$2, 87, 8, 2436);
    			attr_dev(img, "alt", " ");
    			if (img.src !== (img_src_value = /*item*/ ctx[1].title.split(":::::")[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "20px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$2, 90, 12, 2599);
    			attr_dev(div0, "class", "text-concat svelte-13j9ulv");
    			add_location(div0, file$2, 92, 12, 2705);
    			attr_dev(div1, "class", "flex-row-container");
    			add_location(div1, file$2, 89, 8, 2554);
    			attr_dev(div2, "class", "item svelte-13j9ulv");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$2, 84, 4, 2195);
    			attr_dev(div3, "class", "flex-row-container");
    			set_style(div3, "height", "100%");
    			add_location(div3, file$2, 78, 0, 1985);
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

    			dispose = [
    				listen_dev(button, "click", stop_propagation(prevent_default(/*click_handler*/ ctx[10])), false, true, true),
    				listen_dev(div2, "dragover", prevent_default(/*onDragEnter*/ ctx[5]), false, true, false),
    				listen_dev(div2, "dragleave", /*onDragLeave*/ ctx[6], false, false, false),
    				listen_dev(div2, "dragstart", /*handleDragStart*/ ctx[7], false, false, false),
    				listen_dev(div2, "drop", /*handleDrop*/ ctx[8], false, false, false),
    				listen_dev(div2, "click", prevent_default(/*click_handler_1*/ ctx[11]), false, true, false)
    			];
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

    			if (!current || dirty & /*item*/ 2 && img.src !== (img_src_value = /*item*/ ctx[1].title.split(":::::")[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*item*/ 2) && t3_value !== (t3_value = /*item*/ ctx[1].title.split(":::::")[0] + "")) set_data_dev(t3, t3_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (div2_outro) div2_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div2_outro = create_out_transition(div2, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			if (detaching && div2_outro) div2_outro.end();
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
    	let { index } = $$props;
    	let { item } = $$props;
    	let { onItemDelete } = $$props;
    	let { onClickItem } = $$props;
    	let { onDrop } = $$props;
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(4, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(4, dropLine = false);
    	};

    	var handleDragStart = e => {
    		e.dataTransfer.setData("text", "i" + index.toString());
    		e.dataTransfer.setData("object", JSON.stringify(item));
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(4, dropLine = false);
    		onDrop(e, index);
    	};

    	const writable_props = ["index", "item", "onItemDelete", "onClickItem", "onDrop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemTile> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onItemDelete(item, index);
    	const click_handler_1 = e => onClickItem(item, e);

    	$$self.$set = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("onItemDelete" in $$props) $$invalidate(2, onItemDelete = $$props.onItemDelete);
    		if ("onClickItem" in $$props) $$invalidate(3, onClickItem = $$props.onClickItem);
    		if ("onDrop" in $$props) $$invalidate(9, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => {
    		return {
    			index,
    			item,
    			onItemDelete,
    			onClickItem,
    			onDrop,
    			dropLine,
    			onDragEnter,
    			onDragLeave,
    			handleDragStart,
    			handleDrop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("onItemDelete" in $$props) $$invalidate(2, onItemDelete = $$props.onItemDelete);
    		if ("onClickItem" in $$props) $$invalidate(3, onClickItem = $$props.onClickItem);
    		if ("onDrop" in $$props) $$invalidate(9, onDrop = $$props.onDrop);
    		if ("dropLine" in $$props) $$invalidate(4, dropLine = $$props.dropLine);
    		if ("onDragEnter" in $$props) $$invalidate(5, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(6, onDragLeave = $$props.onDragLeave);
    		if ("handleDragStart" in $$props) $$invalidate(7, handleDragStart = $$props.handleDragStart);
    		if ("handleDrop" in $$props) $$invalidate(8, handleDrop = $$props.handleDrop);
    	};

    	return [
    		index,
    		item,
    		onItemDelete,
    		onClickItem,
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

    class ItemTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			index: 0,
    			item: 1,
    			onItemDelete: 2,
    			onClickItem: 3,
    			onDrop: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemTile",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<ItemTile> was created without expected prop 'index'");
    		}

    		if (/*item*/ ctx[1] === undefined && !("item" in props)) {
    			console.warn("<ItemTile> was created without expected prop 'item'");
    		}

    		if (/*onItemDelete*/ ctx[2] === undefined && !("onItemDelete" in props)) {
    			console.warn("<ItemTile> was created without expected prop 'onItemDelete'");
    		}

    		if (/*onClickItem*/ ctx[3] === undefined && !("onClickItem" in props)) {
    			console.warn("<ItemTile> was created without expected prop 'onClickItem'");
    		}

    		if (/*onDrop*/ ctx[9] === undefined && !("onDrop" in props)) {
    			console.warn("<ItemTile> was created without expected prop 'onDrop'");
    		}
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

    	get onDrop() {
    		throw new Error("<ItemTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrop(value) {
    		throw new Error("<ItemTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/tiles/EmptyItemTile.svelte generated by Svelte v3.18.1 */

    const file$3 = "src/components/tiles/EmptyItemTile.svelte";

    // (24:4) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "white");
    			add_location(div, file$3, 24, 4, 559);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if dropLine}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "vl");
    			set_style(div, "border-color", "black");
    			add_location(div, file$3, 22, 4, 496);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(22:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
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
    			add_location(div0, file$3, 26, 4, 620);
    			attr_dev(div1, "class", "flex-row-container");
    			set_style(div1, "height", "100%");
    			add_location(div1, file$3, 20, 0, 418);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			dispose = [
    				listen_dev(div0, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    				listen_dev(div0, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    				listen_dev(div0, "drop", /*handleDrop*/ ctx[3], false, false, false)
    			];
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
    			run_all(dispose);
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

    function instance$3($$self, $$props, $$invalidate) {
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

    	const writable_props = ["index", "onDrop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EmptyItemTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onDrop" in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => {
    		return {
    			index,
    			onDrop,
    			dropLine,
    			onDragEnter,
    			onDragLeave,
    			handleDrop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onDrop" in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    		if ("dropLine" in $$props) $$invalidate(0, dropLine = $$props.dropLine);
    		if ("onDragEnter" in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ("handleDrop" in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	return [dropLine, onDragEnter, onDragLeave, handleDrop, index, onDrop];
    }

    class EmptyItemTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { index: 4, onDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmptyItemTile",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<EmptyItemTile> was created without expected prop 'index'");
    		}

    		if (/*onDrop*/ ctx[5] === undefined && !("onDrop" in props)) {
    			console.warn("<EmptyItemTile> was created without expected prop 'onDrop'");
    		}
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

    /* src/components/tiles/NoItemIndicatorTile.svelte generated by Svelte v3.18.1 */

    const file$4 = "src/components/tiles/NoItemIndicatorTile.svelte";

    // (39:0) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let h3;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Drag 'n' Drop tabs to add to 'em this collection";
    			add_location(h3, file$4, 41, 8, 1059);
    			attr_dev(div, "class", "no-items-indicator svelte-wl440h");
    			add_location(div, file$4, 39, 4, 925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);

    			dispose = [
    				listen_dev(div, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    				listen_dev(div, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    				listen_dev(div, "drop", /*handleDrop*/ ctx[3], false, false, false)
    			];
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(39:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:0) {#if indicator}
    function create_if_block$2(ctx) {
    	let div;
    	let h1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Drop to Add";
    			add_location(h1, file$4, 36, 8, 881);
    			attr_dev(div, "class", "no-items-indicator svelte-wl440h");
    			set_style(div, "border", "1px dashed gray");
    			add_location(div, file$4, 34, 4, 710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);

    			dispose = [
    				listen_dev(div, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    				listen_dev(div, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    				listen_dev(div, "drop", /*handleDrop*/ ctx[3], false, false, false)
    			];
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(34:0) {#if indicator}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*indicator*/ ctx[0]) return create_if_block$2;
    		return create_else_block$2;
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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

    	const writable_props = ["index", "onDrop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NoItemIndicatorTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onDrop" in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => {
    		return {
    			index,
    			onDrop,
    			indicator,
    			onDragEnter,
    			onDragLeave,
    			handleDrop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onDrop" in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    		if ("indicator" in $$props) $$invalidate(0, indicator = $$props.indicator);
    		if ("onDragEnter" in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ("handleDrop" in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	return [indicator, onDragEnter, onDragLeave, handleDrop, index, onDrop];
    }

    class NoItemIndicatorTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { index: 4, onDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoItemIndicatorTile",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<NoItemIndicatorTile> was created without expected prop 'index'");
    		}

    		if (/*onDrop*/ ctx[5] === undefined && !("onDrop" in props)) {
    			console.warn("<NoItemIndicatorTile> was created without expected prop 'onDrop'");
    		}
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

    const deo = writable({
        source: "null",
        target: "null"
    });
    // schema of this object
    /*
    {
        source: dragged element (string, first letter describes type (i, t)
        target: drop zone (string, can be "tab" or "item" or "collection")
        sourceObj: json of source
        targetObj: json of target
    }
    */

    /* src/components/tiles/CollectionTile.svelte generated by Svelte v3.18.1 */
    const file$5 = "src/components/tiles/CollectionTile.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[1] = i;
    	return child_ctx;
    }

    // (166:8) {:else}
    function create_else_block_1(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid white");
    			add_location(hr, file$5, 166, 12, 5193);
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(166:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (164:4) {#if dropLine}
    function create_if_block_2(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid black");
    			add_location(hr, file$5, 164, 12, 5127);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(164:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    // (175:12) {:else}
    function create_else_block$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;
    	let each_value = /*items*/ ctx[2];
    	const get_key = ctx => /*item*/ ctx[16].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const emptyitemtile = new EmptyItemTile({
    			props: {
    				index: /*items*/ ctx[2].length,
    				onDrop: /*onDrop*/ ctx[11]
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
    			const each_value = /*items*/ ctx[2];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t.parentNode, outro_and_destroy_block, create_each_block, t, get_each_context);
    			check_outros();
    			const emptyitemtile_changes = {};
    			if (dirty & /*items*/ 4) emptyitemtile_changes.index = /*items*/ ctx[2].length;
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(175:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (173:12) {#if items.length==0}
    function create_if_block$3(ctx) {
    	let current;

    	const noitemtileindicator = new NoItemIndicatorTile({
    			props: {
    				index: /*items*/ ctx[2].length,
    				onDrop: /*onDrop*/ ctx[11]
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
    			if (dirty & /*items*/ 4) noitemtileindicator_changes.index = /*items*/ ctx[2].length;
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(173:12) {#if items.length==0}",
    		ctx
    	});

    	return block;
    }

    // (177:20) {#if (item.title.toLowerCase().includes($searchText.toLowerCase()) || item.url.toLowerCase().includes($searchText.toLowerCase())) }
    function create_if_block_1(ctx) {
    	let current;

    	const itemtile = new ItemTile({
    			props: {
    				index: /*index*/ ctx[1],
    				item: /*item*/ ctx[16],
    				onItemDelete: /*onItemDelete*/ ctx[9],
    				onClickItem: /*onClickItem*/ ctx[10],
    				onDrop: /*onDrop*/ ctx[11]
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
    			if (dirty & /*items*/ 4) itemtile_changes.index = /*index*/ ctx[1];
    			if (dirty & /*items*/ 4) itemtile_changes.item = /*item*/ ctx[16];
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(177:20) {#if (item.title.toLowerCase().includes($searchText.toLowerCase()) || item.url.toLowerCase().includes($searchText.toLowerCase())) }",
    		ctx
    	});

    	return block;
    }

    // (176:16) {#each items as item,index (item.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let show_if = /*item*/ ctx[16].title.toLowerCase().includes(/*$searchText*/ ctx[4].toLowerCase()) || /*item*/ ctx[16].url.toLowerCase().includes(/*$searchText*/ ctx[4].toLowerCase());
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1(ctx);

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
    		p: function update(ctx, dirty) {
    			if (dirty & /*items, $searchText*/ 20) show_if = /*item*/ ctx[16].title.toLowerCase().includes(/*$searchText*/ ctx[4].toLowerCase()) || /*item*/ ctx[16].url.toLowerCase().includes(/*$searchText*/ ctx[4].toLowerCase());

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(176:16) {#each items as item,index (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let t0;
    	let div2;
    	let div0;
    	let t1_value = /*collection*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let span;
    	let div2_outro;
    	let t4;
    	let div3;
    	let current_block_type_index;
    	let if_block1;
    	let div4_intro;
    	let div4_outro;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[3]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*items*/ ctx[2].length == 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

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
    			span = element("span");
    			t4 = space();
    			div3 = element("div");
    			if_block1.c();
    			add_location(div0, file$5, 169, 91, 5437);
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$5, 170, 8, 5475);
    			add_location(span, file$5, 170, 36, 5503);
    			attr_dev(div2, "class", "tile-top-bar svelte-1dklzav");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$5, 168, 8, 5253);
    			attr_dev(div3, "class", "item-area svelte-1dklzav");
    			add_location(div3, file$5, 171, 8, 5525);
    			attr_dev(div4, "class", "collection svelte-1dklzav");
    			add_location(div4, file$5, 162, 0, 5007);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    			append_dev(div2, span);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			if_blocks[current_block_type_index].m(div3, null);
    			current = true;

    			dispose = [
    				listen_dev(div2, "dragover", prevent_default(/*onDragEnter*/ ctx[5]), false, true, false),
    				listen_dev(div2, "dragleave", /*onDragLeave*/ ctx[6], false, false, false),
    				listen_dev(div2, "dragstart", /*handleDragStart*/ ctx[7], false, false, false),
    				listen_dev(div2, "drop", /*handleDrop*/ ctx[8], false, false, false),
    				listen_dev(div4, "dragover", prevent_default(/*dragover_handler*/ ctx[15]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div4, t0);
    				}
    			}

    			if ((!current || dirty & /*collection*/ 1) && t1_value !== (t1_value = /*collection*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
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
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div3, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (div2_outro) div2_outro.end(1);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fade, { duration: 500 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			div2_outro = create_out_transition(div2, fade, {});
    			transition_out(if_block1);
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if (detaching && div2_outro) div2_outro.end();
    			if_blocks[current_block_type_index].d();
    			if (detaching && div4_outro) div4_outro.end();
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
    	let $searchText;
    	validate_store(searchText, "searchText");
    	component_subscribe($$self, searchText, $$value => $$invalidate(4, $searchText = $$value));
    	let items = [];
    	let { collection } = $$props;
    	let { onCollectionDrop } = $$props;
    	let { index } = $$props;
    	let dropLine = false;

    	var onDragEnter = e => {
    		$$invalidate(3, dropLine = true);
    	};

    	var onDragLeave = e => {
    		$$invalidate(3, dropLine = false);
    	};

    	var handleDragStart = e => {
    		e.dataTransfer.setData("text", "c" + index.toString());
    	};

    	var handleDrop = e => {
    		e.preventDefault();
    		$$invalidate(3, dropLine = false);
    		onCollectionDrop(e, index);
    	};

    	onMount(() => {
    		chrome.bookmarks.getChildren(collection.id, function (children) {
    			// only bookmarks
    			$$invalidate(2, items = children.filter(e => e.url != null));
    		});
    	});

    	const unsubsribe = deo.subscribe(obj => {
    		if (obj.source[0] == "i" && obj.target[0] == "i" && (obj.sourceObj.parentId == collection.id || obj.targetObj.id == collection.id)) {
    			// target is collection (not item)
    			// source is item (not collection)
    			var dragIndex = parseInt(obj.source.substr(1));

    			var dropIndex = parseInt(obj.target.substr(1));

    			// when moving item within the same collection
    			if (obj.sourceObj.parentId == collection.id && obj.targetObj.id == collection.id) {
    				// move items from dragIndex to dropIndex
    				if (dragIndex >= dropIndex) {
    					chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex });
    					items.splice(dropIndex, 0, obj.sourceObj);
    					items.splice(dragIndex + 1, 1);
    				} else {
    					chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex });
    					items.splice(dropIndex, 0, obj.sourceObj);
    					items.splice(dragIndex, 1);
    				}
    			} else // when moving item to a different collection
    			if (obj.sourceObj.parentId == collection.id) {
    				// source is responsible for movement of bookmark
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

    			$$invalidate(2, items);
    		} else if (obj.source[0] == "t" && obj.target[0] == "i" && obj.targetObj.id == collection.id) {
    			saveTabToBookmark(obj.sourceObj, parseInt(obj.target.substr(1)));
    		}
    	});

    	onDestroy(unsubsribe);

    	var onItemDelete = (item, i) => {
    		items.splice(i, 1);
    		$$invalidate(2, items);
    		chrome.bookmarks.remove(item.id);
    	};

    	var onClickItem = (item, e) => {
    		chrome.tabs.create({ url: item.url, active: !e.ctrlKey });
    	};

    	function saveTabToBookmark(tab, dropIndex) {
    		chrome.bookmarks.create(
    			{
    				parentId: collection.id,
    				url: tab.url,
    				index: dropIndex,
    				title: tab.title + ":::::" + tab.favIconUrl
    			},
    			function (node) {
    				items.splice(dropIndex, 0, node);
    				$$invalidate(2, items);
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
    			targetObj: collection
    		});
    	};

    	const writable_props = ["collection", "onCollectionDrop", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CollectionTile> was created with unknown prop '${key}'`);
    	});

    	function dragover_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("collection" in $$props) $$invalidate(0, collection = $$props.collection);
    		if ("onCollectionDrop" in $$props) $$invalidate(12, onCollectionDrop = $$props.onCollectionDrop);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => {
    		return {
    			items,
    			collection,
    			onCollectionDrop,
    			index,
    			dropLine,
    			onDragEnter,
    			onDragLeave,
    			handleDragStart,
    			handleDrop,
    			onItemDelete,
    			onClickItem,
    			onDrop,
    			$searchText
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(2, items = $$props.items);
    		if ("collection" in $$props) $$invalidate(0, collection = $$props.collection);
    		if ("onCollectionDrop" in $$props) $$invalidate(12, onCollectionDrop = $$props.onCollectionDrop);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("dropLine" in $$props) $$invalidate(3, dropLine = $$props.dropLine);
    		if ("onDragEnter" in $$props) $$invalidate(5, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(6, onDragLeave = $$props.onDragLeave);
    		if ("handleDragStart" in $$props) $$invalidate(7, handleDragStart = $$props.handleDragStart);
    		if ("handleDrop" in $$props) $$invalidate(8, handleDrop = $$props.handleDrop);
    		if ("onItemDelete" in $$props) $$invalidate(9, onItemDelete = $$props.onItemDelete);
    		if ("onClickItem" in $$props) $$invalidate(10, onClickItem = $$props.onClickItem);
    		if ("onDrop" in $$props) $$invalidate(11, onDrop = $$props.onDrop);
    		if ("$searchText" in $$props) searchText.set($searchText = $$props.$searchText);
    	};

    	return [
    		collection,
    		index,
    		items,
    		dropLine,
    		$searchText,
    		onDragEnter,
    		onDragLeave,
    		handleDragStart,
    		handleDrop,
    		onItemDelete,
    		onClickItem,
    		onDrop,
    		onCollectionDrop,
    		unsubsribe,
    		saveTabToBookmark,
    		dragover_handler
    	];
    }

    class CollectionTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			collection: 0,
    			onCollectionDrop: 12,
    			index: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CollectionTile",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*collection*/ ctx[0] === undefined && !("collection" in props)) {
    			console.warn("<CollectionTile> was created without expected prop 'collection'");
    		}

    		if (/*onCollectionDrop*/ ctx[12] === undefined && !("onCollectionDrop" in props)) {
    			console.warn("<CollectionTile> was created without expected prop 'onCollectionDrop'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<CollectionTile> was created without expected prop 'index'");
    		}
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
    }

    /* src/components/tiles/EmptyCollectionTile.svelte generated by Svelte v3.18.1 */

    const file$6 = "src/components/tiles/EmptyCollectionTile.svelte";

    // (24:4) {:else}
    function create_else_block$4(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid white");
    			add_location(hr, file$6, 24, 8, 529);
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
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if dropLine}
    function create_if_block$4(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid black");
    			add_location(hr, file$6, 22, 8, 471);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(22:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[0]) return create_if_block$4;
    		return create_else_block$4;
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
    			add_location(div0, file$6, 26, 4, 581);
    			add_location(div1, file$6, 20, 0, 438);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			dispose = [
    				listen_dev(div0, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    				listen_dev(div0, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    				listen_dev(div0, "drop", /*handleDrop*/ ctx[3], false, false, false)
    			];
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
    			run_all(dispose);
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

    	const writable_props = ["index", "onCollectionDrop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EmptyCollectionTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onCollectionDrop" in $$props) $$invalidate(5, onCollectionDrop = $$props.onCollectionDrop);
    	};

    	$$self.$capture_state = () => {
    		return {
    			index,
    			onCollectionDrop,
    			dropLine,
    			onDragEnter,
    			onDragLeave,
    			handleDrop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onCollectionDrop" in $$props) $$invalidate(5, onCollectionDrop = $$props.onCollectionDrop);
    		if ("dropLine" in $$props) $$invalidate(0, dropLine = $$props.dropLine);
    		if ("onDragEnter" in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ("handleDrop" in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	return [dropLine, onDragEnter, onDragLeave, handleDrop, index, onCollectionDrop];
    }

    class EmptyCollectionTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { index: 4, onCollectionDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmptyCollectionTile",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<EmptyCollectionTile> was created without expected prop 'index'");
    		}

    		if (/*onCollectionDrop*/ ctx[5] === undefined && !("onCollectionDrop" in props)) {
    			console.warn("<EmptyCollectionTile> was created without expected prop 'onCollectionDrop'");
    		}
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

    /* src/components/MainArea.svelte generated by Svelte v3.18.1 */
    const file$7 = "src/components/MainArea.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (113:4) {#if allCollections.length==0 }
    function create_if_block$5(ctx) {
    	let div;
    	let h30;
    	let t1;
    	let button;
    	let t2;
    	let h31;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h30 = element("h3");
    			h30.textContent = "No Collections, Click '";
    			t1 = space();
    			button = element("button");
    			t2 = space();
    			h31 = element("h3");
    			h31.textContent = "' To create one";
    			add_location(h30, file$7, 114, 12, 3852);
    			attr_dev(button, "class", "plus-icon-dummy svelte-1sz8a6i");
    			add_location(button, file$7, 115, 12, 3898);
    			add_location(h31, file$7, 116, 12, 3952);
    			attr_dev(div, "class", "no-collections-indicator svelte-1sz8a6i");
    			add_location(div, file$7, 113, 8, 3801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h30);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(div, t2);
    			append_dev(div, h31);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(113:4) {#if allCollections.length==0 }",
    		ctx
    	});

    	return block;
    }

    // (124:8) {#each allCollections as collection,i (collection.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let current;

    	const collectiontile = new CollectionTile({
    			props: {
    				collection: /*collection*/ ctx[5],
    				index: /*i*/ ctx[7],
    				onCollectionDrop: /*onCollectionDrop*/ ctx[2]
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
    		p: function update(ctx, dirty) {
    			const collectiontile_changes = {};
    			if (dirty & /*allCollections*/ 1) collectiontile_changes.collection = /*collection*/ ctx[5];
    			if (dirty & /*allCollections*/ 1) collectiontile_changes.index = /*i*/ ctx[7];
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(124:8) {#each allCollections as collection,i (collection.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let t0;
    	let button;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let current;
    	let dispose;
    	let if_block = /*allCollections*/ ctx[0].length == 0 && create_if_block$5(ctx);
    	let each_value = /*allCollections*/ ctx[0];
    	const get_key = ctx => /*collection*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const emptycollectiontile = new EmptyCollectionTile({
    			props: {
    				index: /*allCollections*/ ctx[0].length,
    				onCollectionDrop: /*onCollectionDrop*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(emptycollectiontile.$$.fragment);
    			attr_dev(button, "class", "plus-icon svelte-1sz8a6i");
    			add_location(button, file$7, 120, 4, 4007);
    			attr_dev(div, "class", "scroll");
    			add_location(div, file$7, 122, 4, 4109);
    			set_style(main, "position", "relative");
    			add_location(main, file$7, 110, 0, 3721);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, button);
    			append_dev(main, t1);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			mount_component(emptycollectiontile, div, null);
    			current = true;
    			dispose = listen_dev(button, "click", stop_propagation(prevent_default(/*clickAddCollection*/ ctx[1])), false, true, true);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*allCollections*/ ctx[0].length == 0) {
    				if (!if_block) {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(main, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const each_value = /*allCollections*/ ctx[0];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, t2, get_each_context$1);
    			check_outros();
    			const emptycollectiontile_changes = {};
    			if (dirty & /*allCollections*/ 1) emptycollectiontile_changes.index = /*allCollections*/ ctx[0].length;
    			emptycollectiontile.$set(emptycollectiontile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(emptycollectiontile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(emptycollectiontile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(emptycollectiontile);
    			dispose();
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
    	const { open } = getContext("simple-modal");

    	// array of BookmarkTreeNode
    	let allCollections = [];

    	onMount(() => {
    		chrome.storage.local.get("pid", function (res) {
    			chrome.bookmarks.getChildren(res.pid, function (children) {
    				// only folders
    				$$invalidate(0, allCollections = children.filter(e => e.url == null));
    			});
    		});
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
    			var dragIndex = parseInt(obj.source.substr(1));
    			var dropIndex = parseInt(obj.target.substr(1));

    			// move allCollections from dragIndex to dropIndex
    			if (dragIndex >= dropIndex) {
    				chrome.bookmarks.move(allCollections[dragIndex].id, { index: dropIndex });
    				allCollections.splice(dropIndex, 0, allCollections[dragIndex]);
    				allCollections.splice(dragIndex + 1, 1);
    			} else {
    				chrome.bookmarks.move(allCollections[dragIndex].id, { index: dropIndex });
    				allCollections.splice(dropIndex, 0, allCollections[dragIndex]);
    				allCollections.splice(dragIndex, 1);
    			}

    			$$invalidate(0, allCollections);
    		}
    	});

    	onDestroy(unsubsribe);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("allCollections" in $$props) $$invalidate(0, allCollections = $$props.allCollections);
    		if ("clickAddCollection" in $$props) $$invalidate(1, clickAddCollection = $$props.clickAddCollection);
    		if ("onCollectionDrop" in $$props) $$invalidate(2, onCollectionDrop = $$props.onCollectionDrop);
    	};

    	return [allCollections, clickAddCollection, onCollectionDrop];
    }

    class MainArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainArea",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/tiles/TabTile.svelte generated by Svelte v3.18.1 */
    const file$8 = "src/components/tiles/TabTile.svelte";

    // (81:4) {:else}
    function create_else_block$5(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid white");
    			add_location(hr, file$8, 81, 8, 2152);
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(81:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#if dropLine}
    function create_if_block$6(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid black");
    			add_location(hr, file$8, 79, 8, 2094);
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(79:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
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
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[4]) return create_if_block$6;
    		return create_else_block$5;
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
    			attr_dev(button, "class", "close-icon svelte-18bb33g");
    			add_location(button, file$8, 90, 8, 2468);
    			attr_dev(img, "alt", " ");
    			if (img.src !== (img_src_value = /*tab*/ ctx[0].favIconUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "20px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$8, 93, 12, 2632);
    			attr_dev(div0, "class", "text-concat svelte-18bb33g");
    			add_location(div0, file$8, 95, 12, 2724);
    			attr_dev(div1, "class", "flex-row-container");
    			add_location(div1, file$8, 92, 8, 2587);
    			attr_dev(div2, "class", "card svelte-18bb33g");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$8, 83, 4, 2204);
    			add_location(div3, file$8, 77, 0, 2015);
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

    			dispose = [
    				listen_dev(button, "click", stop_propagation(prevent_default(/*click_handler*/ ctx[10])), false, true, true),
    				listen_dev(div2, "dragover", prevent_default(/*onDragEnter*/ ctx[5]), false, true, false),
    				listen_dev(div2, "dragleave", /*onDragLeave*/ ctx[6], false, false, false),
    				listen_dev(div2, "dragstart", /*handleDragStart*/ ctx[7], false, false, false),
    				listen_dev(div2, "drop", /*handleDrop*/ ctx[8], false, false, false),
    				listen_dev(div2, "click", prevent_default(/*click_handler_1*/ ctx[11]), false, true, false)
    			];
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

    			if (!current || dirty & /*tab*/ 1 && img.src !== (img_src_value = /*tab*/ ctx[0].favIconUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*tab*/ 1) && t3_value !== (t3_value = /*tab*/ ctx[0].title + "")) set_data_dev(t3, t3_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				if (!div3_intro) div3_intro = create_in_transition(div3, fly, { x: 500, duration: 400 });
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
    			run_all(dispose);
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
    	let { tab } = $$props;
    	let { index } = $$props;
    	let { onClickTabCard } = $$props;
    	let { onTabTileClose } = $$props;
    	let { onDrop } = $$props; // dont call directly, set dropline to false before calling
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

    	const writable_props = ["tab", "index", "onClickTabCard", "onTabTileClose", "onDrop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabTile> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onTabTileClose(tab, index);
    	const click_handler_1 = () => onClickTabCard(tab);

    	$$self.$set = $$props => {
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("onClickTabCard" in $$props) $$invalidate(2, onClickTabCard = $$props.onClickTabCard);
    		if ("onTabTileClose" in $$props) $$invalidate(3, onTabTileClose = $$props.onTabTileClose);
    		if ("onDrop" in $$props) $$invalidate(9, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => {
    		return {
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
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("onClickTabCard" in $$props) $$invalidate(2, onClickTabCard = $$props.onClickTabCard);
    		if ("onTabTileClose" in $$props) $$invalidate(3, onTabTileClose = $$props.onTabTileClose);
    		if ("onDrop" in $$props) $$invalidate(9, onDrop = $$props.onDrop);
    		if ("dropLine" in $$props) $$invalidate(4, dropLine = $$props.dropLine);
    		if ("onDragEnter" in $$props) $$invalidate(5, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(6, onDragLeave = $$props.onDragLeave);
    		if ("handleDragStart" in $$props) $$invalidate(7, handleDragStart = $$props.handleDragStart);
    		if ("handleDrop" in $$props) $$invalidate(8, handleDrop = $$props.handleDrop);
    	};

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

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
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
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tab*/ ctx[0] === undefined && !("tab" in props)) {
    			console.warn("<TabTile> was created without expected prop 'tab'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<TabTile> was created without expected prop 'index'");
    		}

    		if (/*onClickTabCard*/ ctx[2] === undefined && !("onClickTabCard" in props)) {
    			console.warn("<TabTile> was created without expected prop 'onClickTabCard'");
    		}

    		if (/*onTabTileClose*/ ctx[3] === undefined && !("onTabTileClose" in props)) {
    			console.warn("<TabTile> was created without expected prop 'onTabTileClose'");
    		}

    		if (/*onDrop*/ ctx[9] === undefined && !("onDrop" in props)) {
    			console.warn("<TabTile> was created without expected prop 'onDrop'");
    		}
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

    /* src/components/tiles/EmptyTabTile.svelte generated by Svelte v3.18.1 */

    const file$9 = "src/components/tiles/EmptyTabTile.svelte";

    // (24:4) {:else}
    function create_else_block$6(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid white");
    			add_location(hr, file$9, 24, 8, 509);
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
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if dropLine}
    function create_if_block$7(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_style(hr, "border", "1px solid black");
    			add_location(hr, file$9, 22, 8, 451);
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(22:4) {#if dropLine}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dropLine*/ ctx[0]) return create_if_block$7;
    		return create_else_block$6;
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
    			add_location(div0, file$9, 26, 4, 561);
    			add_location(div1, file$9, 20, 0, 418);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			dispose = [
    				listen_dev(div0, "dragover", prevent_default(/*onDragEnter*/ ctx[1]), false, true, false),
    				listen_dev(div0, "dragleave", /*onDragLeave*/ ctx[2], false, false, false),
    				listen_dev(div0, "drop", /*handleDrop*/ ctx[3], false, false, false)
    			];
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

    	const writable_props = ["index", "onDrop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EmptyTabTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onDrop" in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    	};

    	$$self.$capture_state = () => {
    		return {
    			index,
    			onDrop,
    			dropLine,
    			onDragEnter,
    			onDragLeave,
    			handleDrop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("onDrop" in $$props) $$invalidate(5, onDrop = $$props.onDrop);
    		if ("dropLine" in $$props) $$invalidate(0, dropLine = $$props.dropLine);
    		if ("onDragEnter" in $$props) $$invalidate(1, onDragEnter = $$props.onDragEnter);
    		if ("onDragLeave" in $$props) $$invalidate(2, onDragLeave = $$props.onDragLeave);
    		if ("handleDrop" in $$props) $$invalidate(3, handleDrop = $$props.handleDrop);
    	};

    	return [dropLine, onDragEnter, onDragLeave, handleDrop, index, onDrop];
    }

    class EmptyTabTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { index: 4, onDrop: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmptyTabTile",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<EmptyTabTile> was created without expected prop 'index'");
    		}

    		if (/*onDrop*/ ctx[5] === undefined && !("onDrop" in props)) {
    			console.warn("<EmptyTabTile> was created without expected prop 'onDrop'");
    		}
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

    /* src/components/OpenTabsBar.svelte generated by Svelte v3.18.1 */
    const file$a = "src/components/OpenTabsBar.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (74:8) {#each allTabs as tab,i (tab.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const tabtile = new TabTile({
    			props: {
    				tab: /*tab*/ ctx[5],
    				index: /*i*/ ctx[7],
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
    		p: function update(ctx, dirty) {
    			const tabtile_changes = {};
    			if (dirty & /*allTabs*/ 1) tabtile_changes.tab = /*tab*/ ctx[5];
    			if (dirty & /*allTabs*/ 1) tabtile_changes.index = /*i*/ ctx[7];
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(74:8) {#each allTabs as tab,i (tab.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1_value = /*allTabs*/ ctx[0].length + "";
    	let t1;
    	let t2;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t3;
    	let current;
    	let each_value = /*allTabs*/ ctx[0];
    	const get_key = ctx => /*tab*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const emptytabtile = new EmptyTabTile({
    			props: {
    				index: /*allTabs*/ ctx[0].length,
    				onDrop: /*onDrop*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Open Tabs - ");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			create_component(emptytabtile.$$.fragment);
    			add_location(h2, file$a, 70, 4, 2237);
    			attr_dev(div0, "class", "scroll");
    			add_location(div0, file$a, 72, 4, 2280);
    			add_location(div1, file$a, 69, 0, 2227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t3);
    			mount_component(emptytabtile, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*allTabs*/ 1) && t1_value !== (t1_value = /*allTabs*/ ctx[0].length + "")) set_data_dev(t1, t1_value);
    			const each_value = /*allTabs*/ ctx[0];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$2, t3, get_each_context$2);
    			check_outros();
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
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(emptytabtile);
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
    				chrome.tabs.remove(obj.sourceObj.id);
    				allTabs.splice(parseInt(obj.source.substr(1)), 1);
    				$$invalidate(0, allTabs);
    			} else if (obj.target[0] == "t") {
    				var dragIndex = parseInt(obj.source.substr(1));
    				var dropIndex = parseInt(obj.target.substr(1));

    				// move tabs from dragIndex to dropIndex
    				if (dragIndex >= dropIndex) {
    					chrome.tabs.move(obj.sourceObj.id, { index: dropIndex });
    					allTabs.splice(dropIndex, 0, obj.sourceObj);
    					allTabs.splice(dragIndex + 1, 1);
    				} else {
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

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("allTabs" in $$props) $$invalidate(0, allTabs = $$props.allTabs);
    		if ("onClickTabCard" in $$props) $$invalidate(1, onClickTabCard = $$props.onClickTabCard);
    		if ("onTabTileClose" in $$props) $$invalidate(2, onTabTileClose = $$props.onTabTileClose);
    		if ("onDrop" in $$props) $$invalidate(3, onDrop = $$props.onDrop);
    	};

    	return [allTabs, onClickTabCard, onTabTileClose, onDrop];
    }

    class OpenTabsBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpenTabsBar",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.18.1 */

    const { Object: Object_1 } = globals;
    const file$b = "src/components/Modal.svelte";

    // (197:4) {#if Component}
    function create_if_block$8(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let dispose;
    	let if_block = /*closeButton*/ ctx[0] && create_if_block_1$1(ctx);
    	const component_spread_levels = [/*props*/ ctx[6]];
    	let component_props = {};

    	for (let i = 0; i < component_spread_levels.length; i += 1) {
    		component_props = assign(component_props, component_spread_levels[i]);
    	}

    	const component = new /*Component*/ ctx[5]({ props: component_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			create_component(component.$$.fragment);
    			attr_dev(div0, "class", "content svelte-1ge3zj3");
    			attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			add_location(div0, file$b, 213, 12, 5899);
    			attr_dev(div1, "class", "window svelte-1ge3zj3");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			add_location(div1, file$b, 205, 10, 5638);
    			attr_dev(div2, "class", "window-wrap svelte-1ge3zj3");
    			add_location(div2, file$b, 204, 8, 5585);
    			attr_dev(div3, "class", "bg svelte-1ge3zj3");
    			attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			add_location(div3, file$b, 197, 6, 5404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(component, div0, null);
    			/*div2_binding*/ ctx[31](div2);
    			/*div3_binding*/ ctx[32](div3);
    			current = true;
    			dispose = listen_dev(div3, "click", /*handleOuterClick*/ ctx[14], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*closeButton*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const component_changes = (dirty[0] & /*props*/ 64)
    			? get_spread_update(component_spread_levels, [get_spread_object(/*props*/ ctx[6])])
    			: {};

    			component.$set(component_changes);

    			if (!current || dirty[0] & /*cssContent*/ 2048) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 1024) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 512) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);

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
    			transition_out(component.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[3], /*transitionWindowProps*/ ctx[4], false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[1], /*transitionBgProps*/ ctx[2], false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			destroy_component(component);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[31](null);
    			/*div3_binding*/ ctx[32](null);
    			if (detaching && div3_transition) div3_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(197:4) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (211:12) {#if closeButton}
    function create_if_block_1$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-1ge3zj3");
    			add_location(button, file$b, 211, 14, 5820);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*close*/ ctx[12], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(211:12) {#if closeButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t;
    	let current;
    	let dispose;
    	let if_block = /*Component*/ ctx[5] && create_if_block$8(ctx);
    	const default_slot_template = /*$$slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[29], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1ge3zj3");
    			add_location(div, file$b, 195, 0, 5372);
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
    			dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[13], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$8(ctx);
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

    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 536870912) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[29], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[29], dirty, null));
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
    			dispose();
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
    		"key",
    		"closeButton",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps",
    		"styleBg",
    		"styleWindow",
    		"styleContent",
    		"setContext"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(8, wrap = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(7, background = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("key" in $$props) $$invalidate(15, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(16, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(17, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("transitionBg" in $$props) $$invalidate(1, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(2, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(3, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(4, transitionWindowProps = $$props.transitionWindowProps);
    		if ("styleBg" in $$props) $$invalidate(18, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(19, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(20, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(21, setContext$1 = $$props.setContext);
    		if ("$$scope" in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
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
    			resolver,
    			cssBg,
    			cssWindow,
    			cssContent
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(15, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(16, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(17, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("transitionBg" in $$props) $$invalidate(1, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(2, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(3, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(4, transitionWindowProps = $$props.transitionWindowProps);
    		if ("styleBg" in $$props) $$invalidate(18, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(19, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(20, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(21, setContext$1 = $$props.setContext);
    		if ("Component" in $$props) $$invalidate(5, Component = $$props.Component);
    		if ("props" in $$props) $$invalidate(6, props = $$props.props);
    		if ("background" in $$props) $$invalidate(7, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(8, wrap = $$props.wrap);
    		if ("customStyleBg" in $$props) $$invalidate(22, customStyleBg = $$props.customStyleBg);
    		if ("customStyleWindow" in $$props) $$invalidate(23, customStyleWindow = $$props.customStyleWindow);
    		if ("customStyleContent" in $$props) $$invalidate(24, customStyleContent = $$props.customStyleContent);
    		if ("resolver" in $$props) resolver = $$props.resolver;
    		if ("cssBg" in $$props) $$invalidate(9, cssBg = $$props.cssBg);
    		if ("cssWindow" in $$props) $$invalidate(10, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(11, cssContent = $$props.cssContent);
    	};

    	let cssBg;
    	let cssWindow;
    	let cssContent;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*styleBg, customStyleBg*/ 4456448) {
    			 $$invalidate(9, cssBg = toCssString(Object.assign({}, styleBg, customStyleBg)));
    		}

    		if ($$self.$$.dirty[0] & /*styleWindow, customStyleWindow*/ 8912896) {
    			 $$invalidate(10, cssWindow = toCssString(Object.assign({}, styleWindow, customStyleWindow)));
    		}

    		if ($$self.$$.dirty[0] & /*styleContent, customStyleContent*/ 17825792) {
    			 $$invalidate(11, cssContent = toCssString(Object.assign({}, styleContent, customStyleContent)));
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
    		cssBg,
    		cssWindow,
    		cssContent,
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
    		resolver,
    		camelCaseToDash,
    		toCssString,
    		open,
    		$$scope,
    		$$slots,
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
    			instance$b,
    			create_fragment$b,
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
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$b.name
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

    /* src/NewTab.svelte generated by Svelte v3.18.1 */
    const file$c = "src/NewTab.svelte";

    // (47:0) <Modal closeButton={false}>
    function create_default_slot(ctx) {
    	let div5;
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let t1;
    	let div4;
    	let current;
    	const topbar = new TopBar({ $$inline: true });
    	const mainarea = new MainArea({ $$inline: true });
    	const opentabsbar = new OpenTabsBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(topbar.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			create_component(mainarea.$$.fragment);
    			t1 = space();
    			div4 = element("div");
    			create_component(opentabsbar.$$.fragment);
    			attr_dev(div0, "id", "top-bar-container");
    			attr_dev(div0, "class", "svelte-bcfzgv");
    			add_location(div0, file$c, 51, 8, 931);
    			attr_dev(div1, "id", "top-bar");
    			attr_dev(div1, "class", "svelte-bcfzgv");
    			add_location(div1, file$c, 50, 6, 904);
    			attr_dev(div2, "id", "main-free-area");
    			attr_dev(div2, "class", "svelte-bcfzgv");
    			add_location(div2, file$c, 55, 6, 1015);
    			attr_dev(div3, "id", "left-free-area");
    			attr_dev(div3, "class", "svelte-bcfzgv");
    			add_location(div3, file$c, 49, 4, 872);
    			attr_dev(div4, "id", "right-fixed-bar");
    			attr_dev(div4, "class", "svelte-bcfzgv");
    			add_location(div4, file$c, 60, 4, 1091);
    			attr_dev(div5, "class", "container-table svelte-bcfzgv");
    			add_location(div5, file$c, 47, 2, 837);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			mount_component(topbar, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			mount_component(mainarea, div2, null);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			mount_component(opentabsbar, div4, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(mainarea.$$.fragment, local);
    			transition_in(opentabsbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(mainarea.$$.fragment, local);
    			transition_out(opentabsbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(topbar);
    			destroy_component(mainarea);
    			destroy_component(opentabsbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(47:0) <Modal closeButton={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current;

    	const modal = new Modal({
    			props: {
    				closeButton: false,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 1) {
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class NewTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTab",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new NewTab({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=newtab.bundle.js.map
