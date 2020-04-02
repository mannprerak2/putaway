
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    /* src/components/tiles/CollectionTilePopup.svelte generated by Svelte v3.18.1 */

    const file = "src/components/tiles/CollectionTilePopup.svelte";

    // (67:4) {#if savedInThis}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "✓";
    			attr_dev(div, "class", "save svelte-9polyd");
    			add_location(div, file, 67, 4, 1599);
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
    		source: "(67:4) {#if savedInThis}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*collection*/ ctx[0].title + "";
    	let t1;
    	let dispose;
    	let if_block = /*savedInThis*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(div, "class", "popup-collection-tile svelte-9polyd");
    			add_location(div, file, 65, 0, 1520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			dispose = listen_dev(div, "click", /*click*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*savedInThis*/ ctx[1]) {
    				if (!if_block) {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*collection*/ 1 && t1_value !== (t1_value = /*collection*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
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
    	let { collection } = $$props;
    	let { tab } = $$props;
    	let { alreadySaved } = $$props;
    	let savedInThis = false;

    	if (alreadySaved) {
    		savedInThis = alreadySaved;
    	}

    	// will contain a bookmark if one was created rn
    	let bm;

    	var click = () => {
    		$$invalidate(1, savedInThis = !savedInThis);

    		if (savedInThis) {
    			saveTabToBookmark(tab);
    		} else {
    			if (bm) {
    				chrome.bookmarks.remove(bm.id);
    			} else {
    				// remove all bookmarks in this with url of this tab
    				chrome.bookmarks.search({ url: tab.url }, function (bms) {
    					bms.forEach(b => {
    						chrome.bookmarks.remove(b.id);
    					});
    				});
    			}
    		}
    	};

    	function saveTabToBookmark(tab) {
    		chrome.bookmarks.create(
    			{
    				parentId: collection.id,
    				url: tab.url,
    				title: tab.title + ":::::" + tab.favIconUrl
    			},
    			function (node) {
    				bm = node;
    			}
    		);
    	}

    	const writable_props = ["collection", "tab", "alreadySaved"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CollectionTilePopup> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("collection" in $$props) $$invalidate(0, collection = $$props.collection);
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    		if ("alreadySaved" in $$props) $$invalidate(4, alreadySaved = $$props.alreadySaved);
    	};

    	$$self.$capture_state = () => {
    		return {
    			collection,
    			tab,
    			alreadySaved,
    			savedInThis,
    			bm,
    			click
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("collection" in $$props) $$invalidate(0, collection = $$props.collection);
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    		if ("alreadySaved" in $$props) $$invalidate(4, alreadySaved = $$props.alreadySaved);
    		if ("savedInThis" in $$props) $$invalidate(1, savedInThis = $$props.savedInThis);
    		if ("bm" in $$props) bm = $$props.bm;
    		if ("click" in $$props) $$invalidate(2, click = $$props.click);
    	};

    	return [collection, savedInThis, click, tab, alreadySaved];
    }

    class CollectionTilePopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { collection: 0, tab: 3, alreadySaved: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CollectionTilePopup",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*collection*/ ctx[0] === undefined && !("collection" in props)) {
    			console.warn("<CollectionTilePopup> was created without expected prop 'collection'");
    		}

    		if (/*tab*/ ctx[3] === undefined && !("tab" in props)) {
    			console.warn("<CollectionTilePopup> was created without expected prop 'tab'");
    		}

    		if (/*alreadySaved*/ ctx[4] === undefined && !("alreadySaved" in props)) {
    			console.warn("<CollectionTilePopup> was created without expected prop 'alreadySaved'");
    		}
    	}

    	get collection() {
    		throw new Error("<CollectionTilePopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collection(value) {
    		throw new Error("<CollectionTilePopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tab() {
    		throw new Error("<CollectionTilePopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tab(value) {
    		throw new Error("<CollectionTilePopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alreadySaved() {
    		throw new Error("<CollectionTilePopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alreadySaved(value) {
    		throw new Error("<CollectionTilePopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Popup.svelte generated by Svelte v3.18.1 */
    const file$1 = "src/Popup.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (108:8) {#if (collection.title.toLowerCase().includes(searchText.toLowerCase())) }
    function create_if_block$1(ctx) {
    	let current;

    	const collectiontilepopup = new CollectionTilePopup({
    			props: {
    				collection: /*collection*/ ctx[5],
    				tab: /*tab*/ ctx[3],
    				alreadySaved: /*map*/ ctx[2][/*collection*/ ctx[5].id]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(collectiontilepopup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(collectiontilepopup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const collectiontilepopup_changes = {};
    			if (dirty & /*allCollections*/ 2) collectiontilepopup_changes.collection = /*collection*/ ctx[5];
    			if (dirty & /*tab*/ 8) collectiontilepopup_changes.tab = /*tab*/ ctx[3];
    			if (dirty & /*map, allCollections*/ 6) collectiontilepopup_changes.alreadySaved = /*map*/ ctx[2][/*collection*/ ctx[5].id];
    			collectiontilepopup.$set(collectiontilepopup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collectiontilepopup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collectiontilepopup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(collectiontilepopup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(108:8) {#if (collection.title.toLowerCase().includes(searchText.toLowerCase())) }",
    		ctx
    	});

    	return block;
    }

    // (107:6) {#each allCollections as collection,i (collection.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let show_if = /*collection*/ ctx[5].title.toLowerCase().includes(/*searchText*/ ctx[0].toLowerCase());
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$1(ctx);

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
    			if (dirty & /*allCollections, searchText*/ 3) show_if = /*collection*/ ctx[5].title.toLowerCase().includes(/*searchText*/ ctx[0].toLowerCase());

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
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
    		source: "(107:6) {#each allCollections as collection,i (collection.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div6;
    	let div4;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let t1;
    	let br;
    	let t2;
    	let t3;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t4;
    	let div2;
    	let t5;
    	let div5;
    	let current;
    	let dispose;
    	let each_value = /*allCollections*/ ctx[1];
    	const get_key = ctx => /*collection*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Open ");
    			br = element("br");
    			t2 = text(" PutAway");
    			t3 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div5 = element("div");
    			div5.textContent = "⭳Save Session";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "🔍 Search");
    			attr_dev(input, "class", "svelte-1sp2kpn");
    			add_location(input, file$1, 102, 6, 1968);
    			add_location(br, file$1, 103, 34, 2072);
    			attr_dev(div0, "id", "open-putaway");
    			attr_dev(div0, "class", "svelte-1sp2kpn");
    			add_location(div0, file$1, 103, 6, 2044);
    			attr_dev(div1, "id", "top");
    			attr_dev(div1, "class", "svelte-1sp2kpn");
    			add_location(div1, file$1, 101, 4, 1947);
    			set_style(div2, "height", "60px");
    			add_location(div2, file$1, 111, 6, 2386);
    			attr_dev(div3, "id", "list");
    			attr_dev(div3, "class", "svelte-1sp2kpn");
    			add_location(div3, file$1, 105, 4, 2106);
    			attr_dev(div4, "id", "main");
    			attr_dev(div4, "class", "svelte-1sp2kpn");
    			add_location(div4, file$1, 100, 2, 1927);
    			attr_dev(div5, "id", "save-session");
    			attr_dev(div5, "class", "svelte-1sp2kpn");
    			add_location(div5, file$1, 114, 2, 2442);
    			attr_dev(div6, "id", "popup");
    			attr_dev(div6, "class", "svelte-1sp2kpn");
    			add_location(div6, file$1, 99, 0, 1908);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div4);
    			append_dev(div4, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*searchText*/ ctx[0]);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			current = true;
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchText*/ 1 && input.value !== /*searchText*/ ctx[0]) {
    				set_input_value(input, /*searchText*/ ctx[0]);
    			}

    			const each_value = /*allCollections*/ ctx[1];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div3, outro_and_destroy_block, create_each_block, t4, get_each_context);
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
    			if (detaching) detach_dev(div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			dispose();
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
    	let searchText = "";

    	// array of BookmarkTreeNode
    	let allCollections = [];

    	let map = {};
    	let tab;

    	onMount(() => {
    		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    			chrome.bookmarks.search({ url: tabs[0].url }, function (bms) {
    				$$invalidate(3, tab = tabs[0]);

    				bms.forEach(b => {
    					$$invalidate(2, map[b.parentId] = true, map);
    				});
    			});
    		});

    		chrome.storage.local.get("pid", function (res) {
    			chrome.bookmarks.getChildren(res.pid, function (children) {
    				// only folders
    				$$invalidate(1, allCollections = children.filter(e => e.url == null));
    			});
    		});
    	});

    	function input_input_handler() {
    		searchText = this.value;
    		$$invalidate(0, searchText);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("searchText" in $$props) $$invalidate(0, searchText = $$props.searchText);
    		if ("allCollections" in $$props) $$invalidate(1, allCollections = $$props.allCollections);
    		if ("map" in $$props) $$invalidate(2, map = $$props.map);
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    	};

    	return [searchText, allCollections, map, tab, input_input_handler];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new Popup({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=popup.bundle.js.map
