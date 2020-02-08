
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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

    /* src/components/TopBar.svelte generated by Svelte v3.18.1 */

    const file = "src/components/TopBar.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "TopBar";
    			add_location(h1, file, 6, 4, 48);
    			add_location(main, file, 5, 0, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

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
    			add_location(h1, file$1, 58, 4, 1157);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "onchange", /*keepTrimed*/ ctx[4]);
    			input.autofocus = true;
    			attr_dev(input, "class", "svelte-shfknq");
    			add_location(input, file$1, 61, 4, 1231);
    			set_style(div0, "padding", "10px");
    			set_style(div0, "color", "red");
    			add_location(div0, file$1, 64, 8, 1355);
    			attr_dev(button, "class", "svelte-shfknq");
    			add_location(button, file$1, 65, 8, 1423);
    			attr_dev(div1, "class", "modal-bottom-bar svelte-shfknq");
    			add_location(div1, file$1, 63, 4, 1316);
    			add_location(main, file$1, 57, 0, 1146);
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
    				listen_dev(window, "keydown", /*handleKeydown*/ ctx[3], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    				listen_dev(button, "click", /*onClickCreate*/ ctx[2], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
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

    function instance($$self, $$props, $$invalidate) {
    	let collectionName = "";
    	let errorString = "";

    	var onClickCreate = () => {
    		if (collectionName.length > 0) {
    			$$invalidate(1, errorString = "");
    		} else {
    			$$invalidate(1, errorString = "Enter a collection Name");
    		}
    	};

    	function handleKeydown(event) {
    		// on press enter
    		if (event.keyCode == 13) {
    			onClickCreate();
    		}
    	}

    	function keepTrimed() {
    		$$invalidate(0, collectionName = collectionName.trim());
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
    		handleKeydown,
    		keepTrimed,
    		input_input_handler
    	];
    }

    class CreateCollectionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateCollectionModal",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/MainArea.svelte generated by Svelte v3.18.1 */
    const file$2 = "src/components/MainArea.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (60:4) {#if allCollections.length==0}
    function create_if_block(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "No Collections";
    			add_location(h3, file$2, 60, 8, 1587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:4) {#if allCollections.length==0}",
    		ctx
    	});

    	return block;
    }

    // (67:8) {#each allCollections as collection,i}
    function create_each_block(ctx) {
    	let div;
    	let t_value = /*collection*/ ctx[3].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "collection svelte-2pie9p");
    			add_location(div, file$2, 67, 12, 1806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allCollections*/ 1 && t_value !== (t_value = /*collection*/ ctx[3].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(67:8) {#each allCollections as collection,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let t0;
    	let button;
    	let t1;
    	let div1;
    	let t2;
    	let div0;
    	let dispose;
    	let if_block = /*allCollections*/ ctx[0].length == 0 && create_if_block(ctx);
    	let each_value = /*allCollections*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			attr_dev(button, "class", "plus-icon svelte-2pie9p");
    			add_location(button, file$2, 63, 4, 1626);
    			set_style(div0, "height", "200px");
    			add_location(div0, file$2, 71, 8, 1909);
    			attr_dev(div1, "class", "scroll");
    			add_location(div1, file$2, 65, 4, 1726);
    			set_style(main, "position", "relative");
    			add_location(main, file$2, 58, 0, 1509);
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
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			dispose = listen_dev(button, "click", stop_propagation(prevent_default(/*createCollection*/ ctx[1])), false, true, true);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*allCollections*/ ctx[0].length == 0) {
    				if (!if_block) {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*allCollections*/ 1) {
    				each_value = /*allCollections*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			dispose();
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

    function instance$1($$self, $$props, $$invalidate) {
    	const { open } = getContext("simple-modal");
    	let allCollections = [];

    	onMount(() => {
    		chrome.storage.local.get("pid", function (res) {
    			chrome.bookmarks.getChildren(res["pid"], function (children) {
    				$$invalidate(0, allCollections = children);
    			});
    		});
    	});

    	var createCollection = () => {
    		open(CreateCollectionModal, {});
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("allCollections" in $$props) $$invalidate(0, allCollections = $$props.allCollections);
    		if ("createCollection" in $$props) $$invalidate(1, createCollection = $$props.createCollection);
    	};

    	return [allCollections, createCollection];
    }

    class MainArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainArea",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/OpenTabsBar.svelte generated by Svelte v3.18.1 */
    const file$3 = "src/components/OpenTabsBar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (81:8) {#each allTabs as tab,i (tab.id)}
    function create_each_block$1(key_1, ctx) {
    	let div2;
    	let button;
    	let t0;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let div0;
    	let t2_value = /*tab*/ ctx[5].title + "";
    	let t2;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*tab*/ ctx[5], /*i*/ ctx[7], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[4](/*tab*/ ctx[5], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div2 = element("div");
    			button = element("button");
    			t0 = space();
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			attr_dev(button, "class", "close-icon svelte-1rm5iiq");
    			add_location(button, file$3, 82, 12, 2209);
    			attr_dev(img, "alt", "tab");
    			if (img.src !== (img_src_value = /*tab*/ ctx[5].favIconUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "20px");
    			set_style(img, "margin-right", "10px");
    			add_location(img, file$3, 85, 16, 2389);
    			attr_dev(div0, "class", "text-concat svelte-1rm5iiq");
    			add_location(div0, file$3, 87, 16, 2503);
    			attr_dev(div1, "class", "flex-row-container");
    			add_location(div1, file$3, 84, 12, 2340);
    			attr_dev(div2, "class", "card svelte-1rm5iiq");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$3, 81, 12, 2064);
    			this.first = div2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, button);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			current = true;

    			dispose = [
    				listen_dev(button, "click", stop_propagation(prevent_default(click_handler)), false, true, true),
    				listen_dev(div2, "click", prevent_default(click_handler_1), false, true, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*allTabs*/ 1 && img.src !== (img_src_value = /*tab*/ ctx[5].favIconUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*allTabs*/ 1) && t2_value !== (t2_value = /*tab*/ ctx[5].title + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, fly, { x: 500, duration: 400 });
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_outro) div2_outro.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(81:8) {#each allTabs as tab,i (tab.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let h2;
    	let t0;
    	let t1_value = /*allTabs*/ ctx[0].length + "";
    	let t1;
    	let t2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t3;
    	let div0;
    	let current;
    	let each_value = /*allTabs*/ ctx[0];
    	const get_key = ctx => /*tab*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			t0 = text("Open Tabs - ");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div0 = element("div");
    			add_location(h2, file$3, 77, 4, 1942);
    			set_style(div0, "height", "200px");
    			add_location(div0, file$3, 93, 8, 2642);
    			attr_dev(div1, "class", "scroll");
    			add_location(div1, file$3, 79, 4, 1989);
    			set_style(main, "height", "100%");
    			add_location(main, file$3, 76, 0, 1909);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(main, t2);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*allTabs*/ 1) && t1_value !== (t1_value = /*allTabs*/ ctx[0].length + "")) set_data_dev(t1, t1_value);
    			const each_value = /*allTabs*/ ctx[0];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$1, t3, get_each_context$1);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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

    function instance$2($$self, $$props, $$invalidate) {
    	let allTabs = [];

    	onMount(() => {
    		chrome.tabs.query({ currentWindow: true }, tabs => {
    			$$invalidate(0, allTabs = tabs.filter(function (tab) {
    				return tab.url != "chrome://newtab/";
    			}));
    		});
    	});

    	var onClickTabCard = tab => {
    		chrome.tabs.update(tab.id, { active: true });
    	};

    	var onTabTileClose = (tab, i) => {
    		allTabs.splice(i, 1);
    		$$invalidate(0, allTabs);
    		chrome.tabs.remove(tab.id);
    	};

    	const click_handler = (tab, i) => onTabTileClose(tab, i);
    	const click_handler_1 = tab => onClickTabCard(tab);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("allTabs" in $$props) $$invalidate(0, allTabs = $$props.allTabs);
    		if ("onClickTabCard" in $$props) $$invalidate(1, onClickTabCard = $$props.onClickTabCard);
    		if ("onTabTileClose" in $$props) $$invalidate(2, onTabTileClose = $$props.onTabTileClose);
    	};

    	return [allTabs, onClickTabCard, onTabTileClose, click_handler, click_handler_1];
    }

    class OpenTabsBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpenTabsBar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* node_modules/svelte-simple-modal/src/Modal.svelte generated by Svelte v3.18.1 */

    const { Object: Object_1 } = globals;
    const file$4 = "node_modules/svelte-simple-modal/src/Modal.svelte";

    // (189:2) {#if Component}
    function create_if_block$1(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let dispose;
    	let if_block = /*closeButton*/ ctx[0] && create_if_block_1(ctx);
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
    			attr_dev(div0, "class", "content svelte-fnsfcv");
    			attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			add_location(div0, file$4, 205, 10, 4825);
    			attr_dev(div1, "class", "window svelte-fnsfcv");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			add_location(div1, file$4, 197, 8, 4580);
    			attr_dev(div2, "class", "window-wrap svelte-fnsfcv");
    			add_location(div2, file$4, 196, 6, 4529);
    			attr_dev(div3, "class", "bg svelte-fnsfcv");
    			attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			add_location(div3, file$4, 189, 4, 4362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(component, div0, null);
    			/*div2_binding*/ ctx[30](div2);
    			/*div3_binding*/ ctx[31](div3);
    			current = true;
    			dispose = listen_dev(div3, "click", /*handleOuterClick*/ ctx[14], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*closeButton*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
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
    			/*div2_binding*/ ctx[30](null);
    			/*div3_binding*/ ctx[31](null);
    			if (detaching && div3_transition) div3_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(189:2) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (203:10) {#if closeButton}
    function create_if_block_1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-fnsfcv");
    			add_location(button, file$4, 203, 12, 4750);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(203:10) {#if closeButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t;
    	let current;
    	let dispose;
    	let if_block = /*Component*/ ctx[5] && create_if_block$1(ctx);
    	const default_slot_template = /*$$slots*/ ctx[29].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[28], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-fnsfcv");
    			add_location(div, file$4, 187, 0, 4334);
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
    					if_block = create_if_block$1(ctx);
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

    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 268435456) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[28], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[28], dirty, null));
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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

    	const open = (NewComponent, newProps = {}, style = { bg: {}, window: {}, content: {} }) => {
    		$$invalidate(5, Component = NewComponent);
    		$$invalidate(6, props = newProps);
    		$$invalidate(22, customStyleBg = style.bg || {});
    		$$invalidate(23, customStyleWindow = style.window || {});
    		$$invalidate(24, customStyleContent = style.content || {});
    	};

    	const close = () => {
    		$$invalidate(5, Component = null);
    		$$invalidate(6, props = null);
    		$$invalidate(22, customStyleBg = {});
    		$$invalidate(23, customStyleWindow = {});
    		$$invalidate(24, customStyleContent = {});
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
    		if ("$$scope" in $$props) $$invalidate(28, $$scope = $$props.$$scope);
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
    			instance$3,
    			create_fragment$4,
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
    			id: create_fragment$4.name
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
    const file$5 = "src/NewTab.svelte";

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
    			attr_dev(div0, "class", "svelte-ko6hza");
    			add_location(div0, file$5, 51, 8, 924);
    			attr_dev(div1, "id", "top-bar");
    			attr_dev(div1, "class", "svelte-ko6hza");
    			add_location(div1, file$5, 50, 6, 897);
    			attr_dev(div2, "id", "main-free-area");
    			attr_dev(div2, "class", "svelte-ko6hza");
    			add_location(div2, file$5, 55, 6, 1008);
    			attr_dev(div3, "id", "left-free-area");
    			attr_dev(div3, "class", "svelte-ko6hza");
    			add_location(div3, file$5, 49, 4, 865);
    			attr_dev(div4, "id", "right-fixed-bar");
    			attr_dev(div4, "class", "svelte-ko6hza");
    			add_location(div4, file$5, 60, 4, 1084);
    			attr_dev(div5, "class", "container-table svelte-ko6hza");
    			add_location(div5, file$5, 47, 2, 830);
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

    function create_fragment$5(ctx) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class NewTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTab",
    			options,
    			id: create_fragment$5.name
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
