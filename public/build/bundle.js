
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
    function empty() {
        return text('');
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
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
        $capture_state() { }
        $inject_state() { }
    }

    /* src\layout\Navbar.svelte generated by Svelte v3.20.1 */

    const file = "src\\layout\\Navbar.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div;
    	let a0;
    	let t1;
    	let ul;
    	let li;
    	let a1;
    	let i;
    	let t2;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			a0 = element("a");
    			a0.textContent = "COVID-19 Stats";
    			t1 = space();
    			ul = element("ul");
    			li = element("li");
    			a1 = element("a");
    			i = element("i");
    			t2 = text("\r\n\t\t\t\t\tby Mvtthew");
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 10, 2, 174);
    			attr_dev(i, "class", "bx bxl-github");
    			add_location(i, file, 16, 5, 387);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "https://github.com/Mvtthew/covid-19-stats");
    			add_location(a1, file, 13, 4, 299);
    			attr_dev(li, "class", "nav-item active");
    			add_location(li, file, 12, 3, 265);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file, 11, 2, 229);
    			attr_dev(div, "class", "container");
    			add_location(div, file, 9, 1, 147);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-dark bg-dark svelte-vjxei");
    			add_location(nav, file, 8, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, a0);
    			append_dev(div, t1);
    			append_dev(div, ul);
    			append_dev(ul, li);
    			append_dev(li, a1);
    			append_dev(a1, i);
    			append_dev(a1, t2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
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

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\SumStats.svelte generated by Svelte v3.20.1 */

    const file$1 = "src\\components\\SumStats.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let h4;
    	let i0;
    	let t0;
    	let t1;
    	let div1;
    	let ul;
    	let li0;
    	let p0;
    	let strong0;
    	let t3;
    	let span0;
    	let t4_value = /*data*/ ctx[0].cases + "";
    	let t4;
    	let t5;
    	let i1;
    	let t6;
    	let li1;
    	let p1;
    	let strong1;
    	let t8;
    	let span1;
    	let t9_value = /*data*/ ctx[0].recovered + "";
    	let t9;
    	let t10;
    	let i2;
    	let t11;
    	let li2;
    	let p2;
    	let strong2;
    	let t13;
    	let span2;
    	let t14_value = /*data*/ ctx[0].deaths + "";
    	let t14;
    	let t15;
    	let i3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			i0 = element("i");
    			t0 = text("\r\n\t\t\tSummary");
    			t1 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "All cases";
    			t3 = space();
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			i1 = element("i");
    			t6 = space();
    			li1 = element("li");
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Recovered";
    			t8 = space();
    			span1 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			i2 = element("i");
    			t11 = space();
    			li2 = element("li");
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Deaths";
    			t13 = space();
    			span2 = element("span");
    			t14 = text(t14_value);
    			t15 = space();
    			i3 = element("i");
    			attr_dev(i0, "class", "bx bx-data");
    			add_location(i0, file$1, 7, 3, 123);
    			attr_dev(h4, "class", "m-0");
    			add_location(h4, file$1, 6, 2, 102);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$1, 5, 1, 73);
    			add_location(strong0, file$1, 15, 5, 339);
    			attr_dev(i1, "class", "bx bxs-layer");
    			add_location(i1, file$1, 18, 6, 406);
    			add_location(span0, file$1, 16, 5, 372);
    			attr_dev(p0, "class", "mb-0 d-flex justify-content-between");
    			add_location(p0, file$1, 14, 4, 285);
    			attr_dev(li0, "class", "list-group-item bg-transparent");
    			add_location(li0, file$1, 13, 3, 236);
    			add_location(strong1, file$1, 24, 5, 574);
    			attr_dev(i2, "class", "bx bx-plus-medical");
    			add_location(i2, file$1, 27, 6, 645);
    			add_location(span1, file$1, 25, 5, 607);
    			attr_dev(p1, "class", "mb-0 d-flex justify-content-between");
    			add_location(p1, file$1, 23, 4, 520);
    			attr_dev(li1, "class", "list-group-item bg-transparent");
    			add_location(li1, file$1, 22, 3, 471);
    			add_location(strong2, file$1, 33, 5, 819);
    			attr_dev(i3, "class", "bx bxs-skull");
    			add_location(i3, file$1, 36, 6, 884);
    			add_location(span2, file$1, 34, 5, 849);
    			attr_dev(p2, "class", "mb-0 d-flex justify-content-between");
    			add_location(p2, file$1, 32, 4, 765);
    			attr_dev(li2, "class", "list-group-item bg-transparent");
    			add_location(li2, file$1, 31, 3, 716);
    			attr_dev(ul, "class", "list-group ");
    			add_location(ul, file$1, 12, 2, 207);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$1, 11, 1, 180);
    			attr_dev(div2, "class", "card shadow-lg");
    			add_location(div2, file$1, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h4);
    			append_dev(h4, i0);
    			append_dev(h4, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t3);
    			append_dev(p0, span0);
    			append_dev(span0, t4);
    			append_dev(span0, t5);
    			append_dev(span0, i1);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(li1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t8);
    			append_dev(p1, span1);
    			append_dev(span1, t9);
    			append_dev(span1, t10);
    			append_dev(span1, i2);
    			append_dev(ul, t11);
    			append_dev(ul, li2);
    			append_dev(li2, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t13);
    			append_dev(p2, span2);
    			append_dev(span2, t14);
    			append_dev(span2, t15);
    			append_dev(span2, i3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t4_value !== (t4_value = /*data*/ ctx[0].cases + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*data*/ 1 && t9_value !== (t9_value = /*data*/ ctx[0].recovered + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*data*/ 1 && t14_value !== (t14_value = /*data*/ ctx[0].deaths + "")) set_data_dev(t14, t14_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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
    	let { data } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SumStats> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SumStats", $$slots, []);

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class SumStats extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SumStats",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<SumStats> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<SumStats>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SumStats>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CountryStats.svelte generated by Svelte v3.20.1 */

    const file$2 = "src\\components\\CountryStats.svelte";

    // (20:3) {:else}
    function create_else_block(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "bx bx-map");
    			add_location(i, file$2, 20, 4, 419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(20:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:3) {#if emojiHtml}
    function create_if_block(ctx) {
    	let html_tag;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(/*emojiHtml*/ ctx[0], null);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(target, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*emojiHtml*/ 1) html_tag.p(/*emojiHtml*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:3) {#if emojiHtml}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let h4;
    	let t0;
    	let t1_value = /*countryData*/ ctx[1].country + "";
    	let t1;
    	let t2;
    	let div1;
    	let ul;
    	let li0;
    	let p0;
    	let strong0;
    	let t4;
    	let span0;
    	let t5_value = /*countryData*/ ctx[1].cases + "";
    	let t5;
    	let t6;
    	let i0;
    	let t7;
    	let li1;
    	let p1;
    	let strong1;
    	let t9;
    	let span1;
    	let t10_value = /*countryData*/ ctx[1].active + "";
    	let t10;
    	let t11;
    	let i1;
    	let t12;
    	let li2;
    	let p2;
    	let strong2;
    	let t14;
    	let span2;
    	let t15_value = /*countryData*/ ctx[1].recovered + "";
    	let t15;
    	let t16;
    	let i2;
    	let t17;
    	let li3;
    	let p3;
    	let strong3;
    	let t19;
    	let span3;
    	let t20_value = /*countryData*/ ctx[1].deaths + "";
    	let t20;
    	let t21;
    	let i3;

    	function select_block_type(ctx, dirty) {
    		if (/*emojiHtml*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			if_block.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "All cases";
    			t4 = space();
    			span0 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			i0 = element("i");
    			t7 = space();
    			li1 = element("li");
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Active cases";
    			t9 = space();
    			span1 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			i1 = element("i");
    			t12 = space();
    			li2 = element("li");
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Recovered";
    			t14 = space();
    			span2 = element("span");
    			t15 = text(t15_value);
    			t16 = space();
    			i2 = element("i");
    			t17 = space();
    			li3 = element("li");
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Deaths";
    			t19 = space();
    			span3 = element("span");
    			t20 = text(t20_value);
    			t21 = space();
    			i3 = element("i");
    			attr_dev(h4, "class", "m-0");
    			add_location(h4, file$2, 16, 2, 342);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$2, 15, 1, 313);
    			add_location(strong0, file$2, 29, 5, 657);
    			attr_dev(i0, "class", "bx bxs-layer");
    			add_location(i0, file$2, 32, 6, 731);
    			add_location(span0, file$2, 30, 5, 690);
    			attr_dev(p0, "class", "mb-0 d-flex justify-content-between");
    			add_location(p0, file$2, 28, 4, 603);
    			attr_dev(li0, "class", "list-group-item bg-transparent");
    			add_location(li0, file$2, 27, 3, 554);
    			add_location(strong1, file$2, 38, 5, 899);
    			attr_dev(i1, "class", "bx bx-layer");
    			add_location(i1, file$2, 41, 6, 977);
    			add_location(span1, file$2, 39, 5, 935);
    			attr_dev(p1, "class", "mb-0 d-flex justify-content-between");
    			add_location(p1, file$2, 37, 4, 845);
    			attr_dev(li1, "class", "list-group-item bg-transparent");
    			add_location(li1, file$2, 36, 3, 796);
    			add_location(strong2, file$2, 47, 5, 1144);
    			attr_dev(i2, "class", "bx bx-plus-medical");
    			add_location(i2, file$2, 50, 6, 1222);
    			add_location(span2, file$2, 48, 5, 1177);
    			attr_dev(p2, "class", "mb-0 d-flex justify-content-between");
    			add_location(p2, file$2, 46, 4, 1090);
    			attr_dev(li2, "class", "list-group-item bg-transparent");
    			add_location(li2, file$2, 45, 3, 1041);
    			add_location(strong3, file$2, 56, 5, 1396);
    			attr_dev(i3, "class", "bx bxs-skull");
    			add_location(i3, file$2, 59, 6, 1468);
    			add_location(span3, file$2, 57, 5, 1426);
    			attr_dev(p3, "class", "mb-0 d-flex justify-content-between");
    			add_location(p3, file$2, 55, 4, 1342);
    			attr_dev(li3, "class", "list-group-item bg-transparent");
    			add_location(li3, file$2, 54, 3, 1293);
    			attr_dev(ul, "class", "list-group");
    			add_location(ul, file$2, 26, 2, 526);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$2, 25, 1, 499);
    			attr_dev(div2, "class", "card shadow-lg");
    			add_location(div2, file$2, 14, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h4);
    			if_block.m(h4, null);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(p0, span0);
    			append_dev(span0, t5);
    			append_dev(span0, t6);
    			append_dev(span0, i0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(li1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t9);
    			append_dev(p1, span1);
    			append_dev(span1, t10);
    			append_dev(span1, t11);
    			append_dev(span1, i1);
    			append_dev(ul, t12);
    			append_dev(ul, li2);
    			append_dev(li2, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t14);
    			append_dev(p2, span2);
    			append_dev(span2, t15);
    			append_dev(span2, t16);
    			append_dev(span2, i2);
    			append_dev(ul, t17);
    			append_dev(ul, li3);
    			append_dev(li3, p3);
    			append_dev(p3, strong3);
    			append_dev(p3, t19);
    			append_dev(p3, span3);
    			append_dev(span3, t20);
    			append_dev(span3, t21);
    			append_dev(span3, i3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h4, t0);
    				}
    			}

    			if (dirty & /*countryData*/ 2 && t1_value !== (t1_value = /*countryData*/ ctx[1].country + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*countryData*/ 2 && t5_value !== (t5_value = /*countryData*/ ctx[1].cases + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*countryData*/ 2 && t10_value !== (t10_value = /*countryData*/ ctx[1].active + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*countryData*/ 2 && t15_value !== (t15_value = /*countryData*/ ctx[1].recovered + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*countryData*/ 2 && t20_value !== (t20_value = /*countryData*/ ctx[1].deaths + "")) set_data_dev(t20, t20_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
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
    	let { data } = $$props;
    	let { countryName } = $$props;
    	let { emojiHtml } = $$props;
    	let { index } = $$props;
    	let countryData;
    	const writable_props = ["data", "countryName", "emojiHtml", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CountryStats> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CountryStats", $$slots, []);

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    		if ("countryName" in $$props) $$invalidate(3, countryName = $$props.countryName);
    		if ("emojiHtml" in $$props) $$invalidate(0, emojiHtml = $$props.emojiHtml);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		data,
    		countryName,
    		emojiHtml,
    		index,
    		countryData
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    		if ("countryName" in $$props) $$invalidate(3, countryName = $$props.countryName);
    		if ("emojiHtml" in $$props) $$invalidate(0, emojiHtml = $$props.emojiHtml);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("countryData" in $$props) $$invalidate(1, countryData = $$props.countryData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, countryName, countryData*/ 14) {
    			 {
    				$$invalidate(1, countryData = data.filter(item => item.country === countryName));

    				if (countryData.length > 0) {
    					$$invalidate(1, countryData = countryData[0]);
    				}
    			}
    		}
    	};

    	return [emojiHtml, countryData, data, countryName, index];
    }

    class CountryStats extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			data: 2,
    			countryName: 3,
    			emojiHtml: 0,
    			index: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CountryStats",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[2] === undefined && !("data" in props)) {
    			console.warn("<CountryStats> was created without expected prop 'data'");
    		}

    		if (/*countryName*/ ctx[3] === undefined && !("countryName" in props)) {
    			console.warn("<CountryStats> was created without expected prop 'countryName'");
    		}

    		if (/*emojiHtml*/ ctx[0] === undefined && !("emojiHtml" in props)) {
    			console.warn("<CountryStats> was created without expected prop 'emojiHtml'");
    		}

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<CountryStats> was created without expected prop 'index'");
    		}
    	}

    	get data() {
    		throw new Error("<CountryStats>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<CountryStats>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get countryName() {
    		throw new Error("<CountryStats>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set countryName(value) {
    		throw new Error("<CountryStats>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get emojiHtml() {
    		throw new Error("<CountryStats>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emojiHtml(value) {
    		throw new Error("<CountryStats>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<CountryStats>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<CountryStats>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var store = {
    	apiUrl: 'https://coronavirus-19-api.herokuapp.com/'
    };

    var dataSchema = {
    	summary: {
    		cases: 0,
    		deaths: 0,
    		recovered: 0
    	},
    	countries: [
    		{
    			country: '',
    			cases: 0,
    			todayCases: 0,
    			deaths: 0,
    			todayDeaths: 0,
    			recovered: 0,
    			active: 0,
    			critical: 0,
    			casesPerOneMillion: 0,
    			deathsPerOneMillion: 0
    		}
    	]
    };

    /* src\App.svelte generated by Svelte v3.20.1 */
    const file$3 = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (61:3) {#if countriesData.length > 1}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = Array(3);
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
    			if (dirty & /*countriesData*/ 2) {
    				each_value = Array(3);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(61:3) {#if countriesData.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (62:4) {#each Array(3) as _, i}
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let current;

    	const countrystats = new CountryStats({
    			props: {
    				data: /*countriesData*/ ctx[1],
    				countryName: /*countriesData*/ ctx[1][/*i*/ ctx[6]].country,
    				index: /*i*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(countrystats.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "col-md-4 mt-4");
    			add_location(div, file$3, 62, 5, 1489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(countrystats, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const countrystats_changes = {};
    			if (dirty & /*countriesData*/ 2) countrystats_changes.data = /*countriesData*/ ctx[1];
    			if (dirty & /*countriesData*/ 2) countrystats_changes.countryName = /*countriesData*/ ctx[1][/*i*/ ctx[6]].country;
    			countrystats.$set(countrystats_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(countrystats.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(countrystats.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(countrystats);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:4) {#each Array(3) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div8;
    	let t0;
    	let div7;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div4;
    	let div3;
    	let h20;
    	let t4;
    	let t5;
    	let div6;
    	let div5;
    	let h21;
    	let current;
    	const navbar = new Navbar({ $$inline: true });

    	const sumstats = new SumStats({
    			props: { data: /*summaryData*/ ctx[0] },
    			$$inline: true
    		});

    	const countrystats = new CountryStats({
    			props: {
    				data: /*countriesData*/ ctx[1],
    				countryName: "Poland",
    				emojiHtml: "🇵🇱"
    			},
    			$$inline: true
    		});

    	let if_block = /*countriesData*/ ctx[1].length > 1 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div7 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(sumstats.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(countrystats.$$.fragment);
    			t2 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "The worst situation";
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h21 = element("h2");
    			h21.textContent = "All statistics";
    			attr_dev(div0, "class", "col-md-8 mt-4 mr-auto");
    			add_location(div0, file$3, 46, 3, 1069);
    			attr_dev(div1, "class", "col-md-4 mt-4");
    			add_location(div1, file$3, 49, 3, 1157);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$3, 45, 2, 1047);
    			add_location(h20, file$3, 58, 4, 1378);
    			attr_dev(div3, "class", "col-12");
    			add_location(div3, file$3, 57, 3, 1352);
    			attr_dev(div4, "class", "row shadow-lg mt-4 p-lg-4");
    			add_location(div4, file$3, 56, 2, 1308);
    			add_location(h21, file$3, 73, 4, 1751);
    			attr_dev(div5, "class", "col-12");
    			add_location(div5, file$3, 72, 3, 1725);
    			attr_dev(div6, "class", "row shadow-lg mt-4 p-4");
    			add_location(div6, file$3, 71, 2, 1684);
    			attr_dev(div7, "class", "container");
    			attr_dev(div7, "id", "main");
    			add_location(div7, file$3, 44, 1, 1010);
    			attr_dev(div8, "id", "app");
    			add_location(div8, file$3, 42, 0, 980);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			mount_component(navbar, div8, null);
    			append_dev(div8, t0);
    			append_dev(div8, div7);
    			append_dev(div7, div2);
    			append_dev(div2, div0);
    			mount_component(sumstats, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(countrystats, div1, null);
    			append_dev(div7, t2);
    			append_dev(div7, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h20);
    			append_dev(div4, t4);
    			if (if_block) if_block.m(div4, null);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h21);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sumstats_changes = {};
    			if (dirty & /*summaryData*/ 1) sumstats_changes.data = /*summaryData*/ ctx[0];
    			sumstats.$set(sumstats_changes);
    			const countrystats_changes = {};
    			if (dirty & /*countriesData*/ 2) countrystats_changes.data = /*countriesData*/ ctx[1];
    			countrystats.$set(countrystats_changes);

    			if (/*countriesData*/ ctx[1].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
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
    			transition_in(navbar.$$.fragment, local);
    			transition_in(sumstats.$$.fragment, local);
    			transition_in(countrystats.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(sumstats.$$.fragment, local);
    			transition_out(countrystats.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(navbar);
    			destroy_component(sumstats);
    			destroy_component(countrystats);
    			if (if_block) if_block.d();
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
    	let summaryData = dataSchema.summary;
    	let countriesData = dataSchema.countries;

    	const getSummaryData = () => {
    		fetch(`${store.apiUrl}all`).then(res => res.json()).then(resData => {
    			if (summaryData.cases !== resData.cases || summaryData.deaths !== resData.deaths || summaryData.recovered !== resData.recovered) {
    				$$invalidate(0, summaryData = resData);
    				getCountriesData();
    			}
    		});
    	};

    	const getCountriesData = () => {
    		fetch(`${store.apiUrl}countries`).then(res => res.json()).then(resData => {
    			$$invalidate(1, countriesData = resData);
    		});
    	};

    	// Auto refresh data
    	setInterval(
    		() => {
    			getSummaryData();
    		},
    		5000
    	);

    	getSummaryData();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Navbar,
    		SumStats,
    		CountryStats,
    		store,
    		dataSchema,
    		summaryData,
    		countriesData,
    		getSummaryData,
    		getCountriesData
    	});

    	$$self.$inject_state = $$props => {
    		if ("summaryData" in $$props) $$invalidate(0, summaryData = $$props.summaryData);
    		if ("countriesData" in $$props) $$invalidate(1, countriesData = $$props.countriesData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [summaryData, countriesData];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
