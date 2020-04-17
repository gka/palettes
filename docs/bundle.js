
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
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
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.type = 'text/html';
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_render.push(fn);
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
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_binding_callback(fn) {
        binding_callbacks.push(fn);
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
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
        after_render.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            if (detaching)
                component.$$.fragment.d(1);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var chroma = createCommonjsModule(function (module, exports) {
    /**
     * chroma.js - JavaScript library for color conversions
     *
     * Copyright (c) 2011-2019, Gregor Aisch
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are met:
     *
     * 1. Redistributions of source code must retain the above copyright notice, this
     * list of conditions and the following disclaimer.
     *
     * 2. Redistributions in binary form must reproduce the above copyright notice,
     * this list of conditions and the following disclaimer in the documentation
     * and/or other materials provided with the distribution.
     *
     * 3. The name Gregor Aisch may not be used to endorse or promote products
     * derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
     * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
     * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
     * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
     * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     *
     * -------------------------------------------------------
     *
     * chroma.js includes colors from colorbrewer2.org, which are released under
     * the following license:
     *
     * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
     * and The Pennsylvania State University.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
     * either express or implied. See the License for the specific
     * language governing permissions and limitations under the License.
     *
     * ------------------------------------------------------
     *
     * Named colors are taken from X11 Color Names.
     * http://www.w3.org/TR/css3-color/#svg-color
     *
     * @preserve
     */

    (function (global, factory) {
        module.exports = factory();
    }(commonjsGlobal, (function () {
        var limit = function (x, min, max) {
            if ( min === void 0 ) min=0;
            if ( max === void 0 ) max=1;

            return x < min ? min : x > max ? max : x;
        };

        var clip_rgb = function (rgb) {
            rgb._clipped = false;
            rgb._unclipped = rgb.slice(0);
            for (var i=0; i<=3; i++) {
                if (i < 3) {
                    if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
                    rgb[i] = limit(rgb[i], 0, 255);
                } else if (i === 3) {
                    rgb[i] = limit(rgb[i], 0, 1);
                }
            }
            return rgb;
        };

        // ported from jQuery's $.type
        var classToType = {};
        for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
            var name = list[i];

            classToType[("[object " + name + "]")] = name.toLowerCase();
        }
        var type = function(obj) {
            return classToType[Object.prototype.toString.call(obj)] || "object";
        };

        var unpack = function (args, keyOrder) {
            if ( keyOrder === void 0 ) keyOrder=null;

        	// if called with more than 3 arguments, we return the arguments
            if (args.length >= 3) { return Array.prototype.slice.call(args); }
            // with less than 3 args we check if first arg is object
            // and use the keyOrder string to extract and sort properties
        	if (type(args[0]) == 'object' && keyOrder) {
        		return keyOrder.split('')
        			.filter(function (k) { return args[0][k] !== undefined; })
        			.map(function (k) { return args[0][k]; });
        	}
        	// otherwise we just return the first argument
        	// (which we suppose is an array of args)
            return args[0];
        };

        var last = function (args) {
            if (args.length < 2) { return null; }
            var l = args.length-1;
            if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
            return null;
        };

        var PI = Math.PI;

        var utils = {
        	clip_rgb: clip_rgb,
        	limit: limit,
        	type: type,
        	unpack: unpack,
        	last: last,
        	PI: PI,
        	TWOPI: PI*2,
        	PITHIRD: PI/3,
        	DEG2RAD: PI / 180,
        	RAD2DEG: 180 / PI
        };

        var input = {
        	format: {},
        	autodetect: []
        };

        var last$1 = utils.last;
        var clip_rgb$1 = utils.clip_rgb;
        var type$1 = utils.type;


        var Color = function Color() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var me = this;
            if (type$1(args[0]) === 'object' &&
                args[0].constructor &&
                args[0].constructor === this.constructor) {
                // the argument is already a Color instance
                return args[0];
            }

            // last argument could be the mode
            var mode = last$1(args);
            var autodetect = false;

            if (!mode) {
                autodetect = true;
                if (!input.sorted) {
                    input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
                    input.sorted = true;
                }
                // auto-detect format
                for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
                    var chk = list[i];

                    mode = chk.test.apply(chk, args);
                    if (mode) { break; }
                }
            }

            if (input.format[mode]) {
                var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
                me._rgb = clip_rgb$1(rgb);
            } else {
                throw new Error('unknown format: '+args);
            }

            // add alpha channel
            if (me._rgb.length === 3) { me._rgb.push(1); }
        };

        Color.prototype.toString = function toString () {
            if (type$1(this.hex) == 'function') { return this.hex(); }
            return ("[" + (this._rgb.join(',')) + "]");
        };

        var Color_1 = Color;

        var chroma = function () {
        	var args = [], len = arguments.length;
        	while ( len-- ) args[ len ] = arguments[ len ];

        	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
        };

        chroma.Color = Color_1;
        chroma.version = '2.0.4';

        var chroma_1 = chroma;

        var unpack$1 = utils.unpack;
        var max = Math.max;

        var rgb2cmyk = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$1(args, 'rgb');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            r = r / 255;
            g = g / 255;
            b = b / 255;
            var k = 1 - max(r,max(g,b));
            var f = k < 1 ? 1 / (1-k) : 0;
            var c = (1-r-k) * f;
            var m = (1-g-k) * f;
            var y = (1-b-k) * f;
            return [c,m,y,k];
        };

        var rgb2cmyk_1 = rgb2cmyk;

        var unpack$2 = utils.unpack;

        var cmyk2rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$2(args, 'cmyk');
            var c = args[0];
            var m = args[1];
            var y = args[2];
            var k = args[3];
            var alpha = args.length > 4 ? args[4] : 1;
            if (k === 1) { return [0,0,0,alpha]; }
            return [
                c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
                m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
                y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
                alpha
            ];
        };

        var cmyk2rgb_1 = cmyk2rgb;

        var unpack$3 = utils.unpack;
        var type$2 = utils.type;



        Color_1.prototype.cmyk = function() {
            return rgb2cmyk_1(this._rgb);
        };

        chroma_1.cmyk = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
        };

        input.format.cmyk = cmyk2rgb_1;

        input.autodetect.push({
            p: 2,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$3(args, 'cmyk');
                if (type$2(args) === 'array' && args.length === 4) {
                    return 'cmyk';
                }
            }
        });

        var unpack$4 = utils.unpack;
        var last$2 = utils.last;
        var rnd = function (a) { return Math.round(a*100)/100; };

        /*
         * supported arguments:
         * - hsl2css(h,s,l)
         * - hsl2css(h,s,l,a)
         * - hsl2css([h,s,l], mode)
         * - hsl2css([h,s,l,a], mode)
         * - hsl2css({h,s,l,a}, mode)
         */
        var hsl2css = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var hsla = unpack$4(args, 'hsla');
            var mode = last$2(args) || 'lsa';
            hsla[0] = rnd(hsla[0] || 0);
            hsla[1] = rnd(hsla[1]*100) + '%';
            hsla[2] = rnd(hsla[2]*100) + '%';
            if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
                hsla[3] = hsla.length > 3 ? hsla[3] : 1;
                mode = 'hsla';
            } else {
                hsla.length = 3;
            }
            return (mode + "(" + (hsla.join(',')) + ")");
        };

        var hsl2css_1 = hsl2css;

        var unpack$5 = utils.unpack;

        /*
         * supported arguments:
         * - rgb2hsl(r,g,b)
         * - rgb2hsl(r,g,b,a)
         * - rgb2hsl([r,g,b])
         * - rgb2hsl([r,g,b,a])
         * - rgb2hsl({r,g,b,a})
         */
        var rgb2hsl = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$5(args, 'rgba');
            var r = args[0];
            var g = args[1];
            var b = args[2];

            r /= 255;
            g /= 255;
            b /= 255;

            var min = Math.min(r, g, b);
            var max = Math.max(r, g, b);

            var l = (max + min) / 2;
            var s, h;

            if (max === min){
                s = 0;
                h = Number.NaN;
            } else {
                s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
            }

            if (r == max) { h = (g - b) / (max - min); }
            else if (g == max) { h = 2 + (b - r) / (max - min); }
            else if (b == max) { h = 4 + (r - g) / (max - min); }

            h *= 60;
            if (h < 0) { h += 360; }
            if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
            return [h,s,l];
        };

        var rgb2hsl_1 = rgb2hsl;

        var unpack$6 = utils.unpack;
        var last$3 = utils.last;


        var round = Math.round;

        /*
         * supported arguments:
         * - rgb2css(r,g,b)
         * - rgb2css(r,g,b,a)
         * - rgb2css([r,g,b], mode)
         * - rgb2css([r,g,b,a], mode)
         * - rgb2css({r,g,b,a}, mode)
         */
        var rgb2css = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var rgba = unpack$6(args, 'rgba');
            var mode = last$3(args) || 'rgb';
            if (mode.substr(0,3) == 'hsl') {
                return hsl2css_1(rgb2hsl_1(rgba), mode);
            }
            rgba[0] = round(rgba[0]);
            rgba[1] = round(rgba[1]);
            rgba[2] = round(rgba[2]);
            if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
                rgba[3] = rgba.length > 3 ? rgba[3] : 1;
                mode = 'rgba';
            }
            return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
        };

        var rgb2css_1 = rgb2css;

        var unpack$7 = utils.unpack;
        var round$1 = Math.round;

        var hsl2rgb = function () {
            var assign;

            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];
            args = unpack$7(args, 'hsl');
            var h = args[0];
            var s = args[1];
            var l = args[2];
            var r,g,b;
            if (s === 0) {
                r = g = b = l*255;
            } else {
                var t3 = [0,0,0];
                var c = [0,0,0];
                var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
                var t1 = 2 * l - t2;
                var h_ = h / 360;
                t3[0] = h_ + 1/3;
                t3[1] = h_;
                t3[2] = h_ - 1/3;
                for (var i=0; i<3; i++) {
                    if (t3[i] < 0) { t3[i] += 1; }
                    if (t3[i] > 1) { t3[i] -= 1; }
                    if (6 * t3[i] < 1)
                        { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
                    else if (2 * t3[i] < 1)
                        { c[i] = t2; }
                    else if (3 * t3[i] < 2)
                        { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
                    else
                        { c[i] = t1; }
                }
                (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
            }
            if (args.length > 3) {
                // keep alpha channel
                return [r,g,b,args[3]];
            }
            return [r,g,b,1];
        };

        var hsl2rgb_1 = hsl2rgb;

        var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
        var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
        var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
        var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
        var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
        var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

        var round$2 = Math.round;

        var css2rgb = function (css) {
            css = css.toLowerCase().trim();
            var m;

            if (input.format.named) {
                try {
                    return input.format.named(css);
                } catch (e) {
                    // eslint-disable-next-line
                }
            }

            // rgb(250,20,0)
            if ((m = css.match(RE_RGB))) {
                var rgb = m.slice(1,4);
                for (var i=0; i<3; i++) {
                    rgb[i] = +rgb[i];
                }
                rgb[3] = 1;  // default alpha
                return rgb;
            }

            // rgba(250,20,0,0.4)
            if ((m = css.match(RE_RGBA))) {
                var rgb$1 = m.slice(1,5);
                for (var i$1=0; i$1<4; i$1++) {
                    rgb$1[i$1] = +rgb$1[i$1];
                }
                return rgb$1;
            }

            // rgb(100%,0%,0%)
            if ((m = css.match(RE_RGB_PCT))) {
                var rgb$2 = m.slice(1,4);
                for (var i$2=0; i$2<3; i$2++) {
                    rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
                }
                rgb$2[3] = 1;  // default alpha
                return rgb$2;
            }

            // rgba(100%,0%,0%,0.4)
            if ((m = css.match(RE_RGBA_PCT))) {
                var rgb$3 = m.slice(1,5);
                for (var i$3=0; i$3<3; i$3++) {
                    rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
                }
                rgb$3[3] = +rgb$3[3];
                return rgb$3;
            }

            // hsl(0,100%,50%)
            if ((m = css.match(RE_HSL))) {
                var hsl = m.slice(1,4);
                hsl[1] *= 0.01;
                hsl[2] *= 0.01;
                var rgb$4 = hsl2rgb_1(hsl);
                rgb$4[3] = 1;
                return rgb$4;
            }

            // hsla(0,100%,50%,0.5)
            if ((m = css.match(RE_HSLA))) {
                var hsl$1 = m.slice(1,4);
                hsl$1[1] *= 0.01;
                hsl$1[2] *= 0.01;
                var rgb$5 = hsl2rgb_1(hsl$1);
                rgb$5[3] = +m[4];  // default alpha = 1
                return rgb$5;
            }
        };

        css2rgb.test = function (s) {
            return RE_RGB.test(s) ||
                RE_RGBA.test(s) ||
                RE_RGB_PCT.test(s) ||
                RE_RGBA_PCT.test(s) ||
                RE_HSL.test(s) ||
                RE_HSLA.test(s);
        };

        var css2rgb_1 = css2rgb;

        var type$3 = utils.type;




        Color_1.prototype.css = function(mode) {
            return rgb2css_1(this._rgb, mode);
        };

        chroma_1.css = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
        };

        input.format.css = css2rgb_1;

        input.autodetect.push({
            p: 5,
            test: function (h) {
                var rest = [], len = arguments.length - 1;
                while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

                if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
                    return 'css';
                }
            }
        });

        var unpack$8 = utils.unpack;

        input.format.gl = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var rgb = unpack$8(args, 'rgba');
            rgb[0] *= 255;
            rgb[1] *= 255;
            rgb[2] *= 255;
            return rgb;
        };

        chroma_1.gl = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
        };

        Color_1.prototype.gl = function() {
            var rgb = this._rgb;
            return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
        };

        var unpack$9 = utils.unpack;

        var rgb2hcg = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$9(args, 'rgb');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            var min = Math.min(r, g, b);
            var max = Math.max(r, g, b);
            var delta = max - min;
            var c = delta * 100 / 255;
            var _g = min / (255 - delta) * 100;
            var h;
            if (delta === 0) {
                h = Number.NaN;
            } else {
                if (r === max) { h = (g - b) / delta; }
                if (g === max) { h = 2+(b - r) / delta; }
                if (b === max) { h = 4+(r - g) / delta; }
                h *= 60;
                if (h < 0) { h += 360; }
            }
            return [h, c, _g];
        };

        var rgb2hcg_1 = rgb2hcg;

        var unpack$a = utils.unpack;
        var floor = Math.floor;

        /*
         * this is basically just HSV with some minor tweaks
         *
         * hue.. [0..360]
         * chroma .. [0..1]
         * grayness .. [0..1]
         */

        var hcg2rgb = function () {
            var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];
            args = unpack$a(args, 'hcg');
            var h = args[0];
            var c = args[1];
            var _g = args[2];
            var r,g,b;
            _g = _g * 255;
            var _c = c * 255;
            if (c === 0) {
                r = g = b = _g;
            } else {
                if (h === 360) { h = 0; }
                if (h > 360) { h -= 360; }
                if (h < 0) { h += 360; }
                h /= 60;
                var i = floor(h);
                var f = h - i;
                var p = _g * (1 - c);
                var q = p + _c * (1 - f);
                var t = p + _c * f;
                var v = p + _c;
                switch (i) {
                    case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                    case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                    case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                    case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                    case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                    case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
                }
            }
            return [r, g, b, args.length > 3 ? args[3] : 1];
        };

        var hcg2rgb_1 = hcg2rgb;

        var unpack$b = utils.unpack;
        var type$4 = utils.type;






        Color_1.prototype.hcg = function() {
            return rgb2hcg_1(this._rgb);
        };

        chroma_1.hcg = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
        };

        input.format.hcg = hcg2rgb_1;

        input.autodetect.push({
            p: 1,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$b(args, 'hcg');
                if (type$4(args) === 'array' && args.length === 3) {
                    return 'hcg';
                }
            }
        });

        var unpack$c = utils.unpack;
        var last$4 = utils.last;
        var round$3 = Math.round;

        var rgb2hex = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$c(args, 'rgba');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            var a = ref[3];
            var mode = last$4(args) || 'auto';
            if (a === undefined) { a = 1; }
            if (mode === 'auto') {
                mode = a < 1 ? 'rgba' : 'rgb';
            }
            r = round$3(r);
            g = round$3(g);
            b = round$3(b);
            var u = r << 16 | g << 8 | b;
            var str = "000000" + u.toString(16); //#.toUpperCase();
            str = str.substr(str.length - 6);
            var hxa = '0' + round$3(a * 255).toString(16);
            hxa = hxa.substr(hxa.length - 2);
            switch (mode.toLowerCase()) {
                case 'rgba': return ("#" + str + hxa);
                case 'argb': return ("#" + hxa + str);
                default: return ("#" + str);
            }
        };

        var rgb2hex_1 = rgb2hex;

        var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        var RE_HEXA = /^#?([A-Fa-f0-9]{8})$/;

        var hex2rgb = function (hex) {
            if (hex.match(RE_HEX)) {
                // remove optional leading #
                if (hex.length === 4 || hex.length === 7) {
                    hex = hex.substr(1);
                }
                // expand short-notation to full six-digit
                if (hex.length === 3) {
                    hex = hex.split('');
                    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
                }
                var u = parseInt(hex, 16);
                var r = u >> 16;
                var g = u >> 8 & 0xFF;
                var b = u & 0xFF;
                return [r,g,b,1];
            }

            // match rgba hex format, eg #FF000077
            if (hex.match(RE_HEXA)) {
                if (hex.length === 9) {
                    // remove optional leading #
                    hex = hex.substr(1);
                }
                var u$1 = parseInt(hex, 16);
                var r$1 = u$1 >> 24 & 0xFF;
                var g$1 = u$1 >> 16 & 0xFF;
                var b$1 = u$1 >> 8 & 0xFF;
                var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
                return [r$1,g$1,b$1,a];
            }

            // we used to check for css colors here
            // if _input.css? and rgb = _input.css hex
            //     return rgb

            throw new Error(("unknown hex color: " + hex));
        };

        var hex2rgb_1 = hex2rgb;

        var type$5 = utils.type;




        Color_1.prototype.hex = function(mode) {
            return rgb2hex_1(this._rgb, mode);
        };

        chroma_1.hex = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
        };

        input.format.hex = hex2rgb_1;
        input.autodetect.push({
            p: 4,
            test: function (h) {
                var rest = [], len = arguments.length - 1;
                while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

                if (!rest.length && type$5(h) === 'string' && [3,4,6,7,8,9].includes(h.length)) {
                    return 'hex';
                }
            }
        });

        var unpack$d = utils.unpack;
        var TWOPI = utils.TWOPI;
        var min = Math.min;
        var sqrt = Math.sqrt;
        var acos = Math.acos;

        var rgb2hsi = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            /*
            borrowed from here:
            http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
            */
            var ref = unpack$d(args, 'rgb');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            r /= 255;
            g /= 255;
            b /= 255;
            var h;
            var min_ = min(r,g,b);
            var i = (r+g+b) / 3;
            var s = i > 0 ? 1 - min_/i : 0;
            if (s === 0) {
                h = NaN;
            } else {
                h = ((r-g)+(r-b)) / 2;
                h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
                h = acos(h);
                if (b > g) {
                    h = TWOPI - h;
                }
                h /= TWOPI;
            }
            return [h*360,s,i];
        };

        var rgb2hsi_1 = rgb2hsi;

        var unpack$e = utils.unpack;
        var limit$1 = utils.limit;
        var TWOPI$1 = utils.TWOPI;
        var PITHIRD = utils.PITHIRD;
        var cos = Math.cos;

        /*
         * hue [0..360]
         * saturation [0..1]
         * intensity [0..1]
         */
        var hsi2rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            /*
            borrowed from here:
            http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
            */
            args = unpack$e(args, 'hsi');
            var h = args[0];
            var s = args[1];
            var i = args[2];
            var r,g,b;

            if (isNaN(h)) { h = 0; }
            if (isNaN(s)) { s = 0; }
            // normalize hue
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 360;
            if (h < 1/3) {
                b = (1-s)/3;
                r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
                g = 1 - (b+r);
            } else if (h < 2/3) {
                h -= 1/3;
                r = (1-s)/3;
                g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
                b = 1 - (r+g);
            } else {
                h -= 2/3;
                g = (1-s)/3;
                b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
                r = 1 - (g+b);
            }
            r = limit$1(i*r*3);
            g = limit$1(i*g*3);
            b = limit$1(i*b*3);
            return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
        };

        var hsi2rgb_1 = hsi2rgb;

        var unpack$f = utils.unpack;
        var type$6 = utils.type;






        Color_1.prototype.hsi = function() {
            return rgb2hsi_1(this._rgb);
        };

        chroma_1.hsi = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
        };

        input.format.hsi = hsi2rgb_1;

        input.autodetect.push({
            p: 2,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$f(args, 'hsi');
                if (type$6(args) === 'array' && args.length === 3) {
                    return 'hsi';
                }
            }
        });

        var unpack$g = utils.unpack;
        var type$7 = utils.type;






        Color_1.prototype.hsl = function() {
            return rgb2hsl_1(this._rgb);
        };

        chroma_1.hsl = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
        };

        input.format.hsl = hsl2rgb_1;

        input.autodetect.push({
            p: 2,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$g(args, 'hsl');
                if (type$7(args) === 'array' && args.length === 3) {
                    return 'hsl';
                }
            }
        });

        var unpack$h = utils.unpack;
        var min$1 = Math.min;
        var max$1 = Math.max;

        /*
         * supported arguments:
         * - rgb2hsv(r,g,b)
         * - rgb2hsv([r,g,b])
         * - rgb2hsv({r,g,b})
         */
        var rgb2hsl$1 = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$h(args, 'rgb');
            var r = args[0];
            var g = args[1];
            var b = args[2];
            var min_ = min$1(r, g, b);
            var max_ = max$1(r, g, b);
            var delta = max_ - min_;
            var h,s,v;
            v = max_ / 255.0;
            if (max_ === 0) {
                h = Number.NaN;
                s = 0;
            } else {
                s = delta / max_;
                if (r === max_) { h = (g - b) / delta; }
                if (g === max_) { h = 2+(b - r) / delta; }
                if (b === max_) { h = 4+(r - g) / delta; }
                h *= 60;
                if (h < 0) { h += 360; }
            }
            return [h, s, v]
        };

        var rgb2hsv = rgb2hsl$1;

        var unpack$i = utils.unpack;
        var floor$1 = Math.floor;

        var hsv2rgb = function () {
            var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];
            args = unpack$i(args, 'hsv');
            var h = args[0];
            var s = args[1];
            var v = args[2];
            var r,g,b;
            v *= 255;
            if (s === 0) {
                r = g = b = v;
            } else {
                if (h === 360) { h = 0; }
                if (h > 360) { h -= 360; }
                if (h < 0) { h += 360; }
                h /= 60;

                var i = floor$1(h);
                var f = h - i;
                var p = v * (1 - s);
                var q = v * (1 - s * f);
                var t = v * (1 - s * (1 - f));

                switch (i) {
                    case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                    case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                    case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                    case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                    case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                    case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
                }
            }
            return [r,g,b,args.length > 3?args[3]:1];
        };

        var hsv2rgb_1 = hsv2rgb;

        var unpack$j = utils.unpack;
        var type$8 = utils.type;






        Color_1.prototype.hsv = function() {
            return rgb2hsv(this._rgb);
        };

        chroma_1.hsv = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
        };

        input.format.hsv = hsv2rgb_1;

        input.autodetect.push({
            p: 2,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$j(args, 'hsv');
                if (type$8(args) === 'array' && args.length === 3) {
                    return 'hsv';
                }
            }
        });

        var labConstants = {
            // Corresponds roughly to RGB brighter/darker
            Kn: 18,

            // D65 standard referent
            Xn: 0.950470,
            Yn: 1,
            Zn: 1.088830,

            t0: 0.137931034,  // 4 / 29
            t1: 0.206896552,  // 6 / 29
            t2: 0.12841855,   // 3 * t1 * t1
            t3: 0.008856452,  // t1 * t1 * t1
        };

        var unpack$k = utils.unpack;
        var pow = Math.pow;

        var rgb2lab = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$k(args, 'rgb');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            var ref$1 = rgb2xyz(r,g,b);
            var x = ref$1[0];
            var y = ref$1[1];
            var z = ref$1[2];
            var l = 116 * y - 16;
            return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
        };

        var rgb_xyz = function (r) {
            if ((r /= 255) <= 0.04045) { return r / 12.92; }
            return pow((r + 0.055) / 1.055, 2.4);
        };

        var xyz_lab = function (t) {
            if (t > labConstants.t3) { return pow(t, 1 / 3); }
            return t / labConstants.t2 + labConstants.t0;
        };

        var rgb2xyz = function (r,g,b) {
            r = rgb_xyz(r);
            g = rgb_xyz(g);
            b = rgb_xyz(b);
            var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
            var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
            var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
            return [x,y,z];
        };

        var rgb2lab_1 = rgb2lab;

        var unpack$l = utils.unpack;
        var pow$1 = Math.pow;

        /*
         * L* [0..100]
         * a [-100..100]
         * b [-100..100]
         */
        var lab2rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$l(args, 'lab');
            var l = args[0];
            var a = args[1];
            var b = args[2];
            var x,y,z, r,g,b_;

            y = (l + 16) / 116;
            x = isNaN(a) ? y : y + a / 500;
            z = isNaN(b) ? y : y - b / 200;

            y = labConstants.Yn * lab_xyz(y);
            x = labConstants.Xn * lab_xyz(x);
            z = labConstants.Zn * lab_xyz(z);

            r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
            g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
            b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

            return [r,g,b_,args.length > 3 ? args[3] : 1];
        };

        var xyz_rgb = function (r) {
            return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
        };

        var lab_xyz = function (t) {
            return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
        };

        var lab2rgb_1 = lab2rgb;

        var unpack$m = utils.unpack;
        var type$9 = utils.type;






        Color_1.prototype.lab = function() {
            return rgb2lab_1(this._rgb);
        };

        chroma_1.lab = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
        };

        input.format.lab = lab2rgb_1;

        input.autodetect.push({
            p: 2,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$m(args, 'lab');
                if (type$9(args) === 'array' && args.length === 3) {
                    return 'lab';
                }
            }
        });

        var unpack$n = utils.unpack;
        var RAD2DEG = utils.RAD2DEG;
        var sqrt$1 = Math.sqrt;
        var atan2 = Math.atan2;
        var round$4 = Math.round;

        var lab2lch = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$n(args, 'lab');
            var l = ref[0];
            var a = ref[1];
            var b = ref[2];
            var c = sqrt$1(a * a + b * b);
            var h = (atan2(b, a) * RAD2DEG + 360) % 360;
            if (round$4(c*10000) === 0) { h = Number.NaN; }
            return [l, c, h];
        };

        var lab2lch_1 = lab2lch;

        var unpack$o = utils.unpack;



        var rgb2lch = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$o(args, 'rgb');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            var ref$1 = rgb2lab_1(r,g,b);
            var l = ref$1[0];
            var a = ref$1[1];
            var b_ = ref$1[2];
            return lab2lch_1(l,a,b_);
        };

        var rgb2lch_1 = rgb2lch;

        var unpack$p = utils.unpack;
        var DEG2RAD = utils.DEG2RAD;
        var sin = Math.sin;
        var cos$1 = Math.cos;

        var lch2lab = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            /*
            Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
            These formulas were invented by David Dalrymple to obtain maximum contrast without going
            out of gamut if the parameters are in the range 0-1.

            A saturation multiplier was added by Gregor Aisch
            */
            var ref = unpack$p(args, 'lch');
            var l = ref[0];
            var c = ref[1];
            var h = ref[2];
            if (isNaN(h)) { h = 0; }
            h = h * DEG2RAD;
            return [l, cos$1(h) * c, sin(h) * c]
        };

        var lch2lab_1 = lch2lab;

        var unpack$q = utils.unpack;



        var lch2rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$q(args, 'lch');
            var l = args[0];
            var c = args[1];
            var h = args[2];
            var ref = lch2lab_1 (l,c,h);
            var L = ref[0];
            var a = ref[1];
            var b_ = ref[2];
            var ref$1 = lab2rgb_1 (L,a,b_);
            var r = ref$1[0];
            var g = ref$1[1];
            var b = ref$1[2];
            return [r, g, b, args.length > 3 ? args[3] : 1];
        };

        var lch2rgb_1 = lch2rgb;

        var unpack$r = utils.unpack;


        var hcl2rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var hcl = unpack$r(args, 'hcl').reverse();
            return lch2rgb_1.apply(void 0, hcl);
        };

        var hcl2rgb_1 = hcl2rgb;

        var unpack$s = utils.unpack;
        var type$a = utils.type;






        Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
        Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

        chroma_1.lch = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
        };
        chroma_1.hcl = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
        };

        input.format.lch = lch2rgb_1;
        input.format.hcl = hcl2rgb_1;

        ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
            p: 2,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$s(args, m);
                if (type$a(args) === 'array' && args.length === 3) {
                    return m;
                }
            }
        }); });

        /**
        	X11 color names

        	http://www.w3.org/TR/css3-color/#svg-color
        */

        var w3cx11 = {
            aliceblue: '#f0f8ff',
            antiquewhite: '#faebd7',
            aqua: '#00ffff',
            aquamarine: '#7fffd4',
            azure: '#f0ffff',
            beige: '#f5f5dc',
            bisque: '#ffe4c4',
            black: '#000000',
            blanchedalmond: '#ffebcd',
            blue: '#0000ff',
            blueviolet: '#8a2be2',
            brown: '#a52a2a',
            burlywood: '#deb887',
            cadetblue: '#5f9ea0',
            chartreuse: '#7fff00',
            chocolate: '#d2691e',
            coral: '#ff7f50',
            cornflower: '#6495ed',
            cornflowerblue: '#6495ed',
            cornsilk: '#fff8dc',
            crimson: '#dc143c',
            cyan: '#00ffff',
            darkblue: '#00008b',
            darkcyan: '#008b8b',
            darkgoldenrod: '#b8860b',
            darkgray: '#a9a9a9',
            darkgreen: '#006400',
            darkgrey: '#a9a9a9',
            darkkhaki: '#bdb76b',
            darkmagenta: '#8b008b',
            darkolivegreen: '#556b2f',
            darkorange: '#ff8c00',
            darkorchid: '#9932cc',
            darkred: '#8b0000',
            darksalmon: '#e9967a',
            darkseagreen: '#8fbc8f',
            darkslateblue: '#483d8b',
            darkslategray: '#2f4f4f',
            darkslategrey: '#2f4f4f',
            darkturquoise: '#00ced1',
            darkviolet: '#9400d3',
            deeppink: '#ff1493',
            deepskyblue: '#00bfff',
            dimgray: '#696969',
            dimgrey: '#696969',
            dodgerblue: '#1e90ff',
            firebrick: '#b22222',
            floralwhite: '#fffaf0',
            forestgreen: '#228b22',
            fuchsia: '#ff00ff',
            gainsboro: '#dcdcdc',
            ghostwhite: '#f8f8ff',
            gold: '#ffd700',
            goldenrod: '#daa520',
            gray: '#808080',
            green: '#008000',
            greenyellow: '#adff2f',
            grey: '#808080',
            honeydew: '#f0fff0',
            hotpink: '#ff69b4',
            indianred: '#cd5c5c',
            indigo: '#4b0082',
            ivory: '#fffff0',
            khaki: '#f0e68c',
            laserlemon: '#ffff54',
            lavender: '#e6e6fa',
            lavenderblush: '#fff0f5',
            lawngreen: '#7cfc00',
            lemonchiffon: '#fffacd',
            lightblue: '#add8e6',
            lightcoral: '#f08080',
            lightcyan: '#e0ffff',
            lightgoldenrod: '#fafad2',
            lightgoldenrodyellow: '#fafad2',
            lightgray: '#d3d3d3',
            lightgreen: '#90ee90',
            lightgrey: '#d3d3d3',
            lightpink: '#ffb6c1',
            lightsalmon: '#ffa07a',
            lightseagreen: '#20b2aa',
            lightskyblue: '#87cefa',
            lightslategray: '#778899',
            lightslategrey: '#778899',
            lightsteelblue: '#b0c4de',
            lightyellow: '#ffffe0',
            lime: '#00ff00',
            limegreen: '#32cd32',
            linen: '#faf0e6',
            magenta: '#ff00ff',
            maroon: '#800000',
            maroon2: '#7f0000',
            maroon3: '#b03060',
            mediumaquamarine: '#66cdaa',
            mediumblue: '#0000cd',
            mediumorchid: '#ba55d3',
            mediumpurple: '#9370db',
            mediumseagreen: '#3cb371',
            mediumslateblue: '#7b68ee',
            mediumspringgreen: '#00fa9a',
            mediumturquoise: '#48d1cc',
            mediumvioletred: '#c71585',
            midnightblue: '#191970',
            mintcream: '#f5fffa',
            mistyrose: '#ffe4e1',
            moccasin: '#ffe4b5',
            navajowhite: '#ffdead',
            navy: '#000080',
            oldlace: '#fdf5e6',
            olive: '#808000',
            olivedrab: '#6b8e23',
            orange: '#ffa500',
            orangered: '#ff4500',
            orchid: '#da70d6',
            palegoldenrod: '#eee8aa',
            palegreen: '#98fb98',
            paleturquoise: '#afeeee',
            palevioletred: '#db7093',
            papayawhip: '#ffefd5',
            peachpuff: '#ffdab9',
            peru: '#cd853f',
            pink: '#ffc0cb',
            plum: '#dda0dd',
            powderblue: '#b0e0e6',
            purple: '#800080',
            purple2: '#7f007f',
            purple3: '#a020f0',
            rebeccapurple: '#663399',
            red: '#ff0000',
            rosybrown: '#bc8f8f',
            royalblue: '#4169e1',
            saddlebrown: '#8b4513',
            salmon: '#fa8072',
            sandybrown: '#f4a460',
            seagreen: '#2e8b57',
            seashell: '#fff5ee',
            sienna: '#a0522d',
            silver: '#c0c0c0',
            skyblue: '#87ceeb',
            slateblue: '#6a5acd',
            slategray: '#708090',
            slategrey: '#708090',
            snow: '#fffafa',
            springgreen: '#00ff7f',
            steelblue: '#4682b4',
            tan: '#d2b48c',
            teal: '#008080',
            thistle: '#d8bfd8',
            tomato: '#ff6347',
            turquoise: '#40e0d0',
            violet: '#ee82ee',
            wheat: '#f5deb3',
            white: '#ffffff',
            whitesmoke: '#f5f5f5',
            yellow: '#ffff00',
            yellowgreen: '#9acd32'
        };

        var w3cx11_1 = w3cx11;

        var type$b = utils.type;





        Color_1.prototype.name = function() {
            var hex = rgb2hex_1(this._rgb, 'rgb');
            for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
                var n = list[i];

                if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
            }
            return hex;
        };

        input.format.named = function (name) {
            name = name.toLowerCase();
            if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
            throw new Error('unknown color name: '+name);
        };

        input.autodetect.push({
            p: 5,
            test: function (h) {
                var rest = [], len = arguments.length - 1;
                while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

                if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
                    return 'named';
                }
            }
        });

        var unpack$t = utils.unpack;

        var rgb2num = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = unpack$t(args, 'rgb');
            var r = ref[0];
            var g = ref[1];
            var b = ref[2];
            return (r << 16) + (g << 8) + b;
        };

        var rgb2num_1 = rgb2num;

        var type$c = utils.type;

        var num2rgb = function (num) {
            if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
                var r = num >> 16;
                var g = (num >> 8) & 0xFF;
                var b = num & 0xFF;
                return [r,g,b,1];
            }
            throw new Error("unknown num color: "+num);
        };

        var num2rgb_1 = num2rgb;

        var type$d = utils.type;



        Color_1.prototype.num = function() {
            return rgb2num_1(this._rgb);
        };

        chroma_1.num = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
        };

        input.format.num = num2rgb_1;

        input.autodetect.push({
            p: 5,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
                    return 'num';
                }
            }
        });

        var unpack$u = utils.unpack;
        var type$e = utils.type;
        var round$5 = Math.round;

        Color_1.prototype.rgb = function(rnd) {
            if ( rnd === void 0 ) rnd=true;

            if (rnd === false) { return this._rgb.slice(0,3); }
            return this._rgb.slice(0,3).map(round$5);
        };

        Color_1.prototype.rgba = function(rnd) {
            if ( rnd === void 0 ) rnd=true;

            return this._rgb.slice(0,4).map(function (v,i) {
                return i<3 ? (rnd === false ? v : round$5(v)) : v;
            });
        };

        chroma_1.rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
        };

        input.format.rgb = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var rgba = unpack$u(args, 'rgba');
            if (rgba[3] === undefined) { rgba[3] = 1; }
            return rgba;
        };

        input.autodetect.push({
            p: 3,
            test: function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                args = unpack$u(args, 'rgba');
                if (type$e(args) === 'array' && (args.length === 3 ||
                    args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
                    return 'rgb';
                }
            }
        });

        /*
         * Based on implementation by Neil Bartlett
         * https://github.com/neilbartlett/color-temperature
         */

        var log = Math.log;

        var temperature2rgb = function (kelvin) {
            var temp = kelvin / 100;
            var r,g,b;
            if (temp < 66) {
                r = 255;
                g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
                b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
            } else {
                r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
                g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
                b = 255;
            }
            return [r,g,b,1];
        };

        var temperature2rgb_1 = temperature2rgb;

        /*
         * Based on implementation by Neil Bartlett
         * https://github.com/neilbartlett/color-temperature
         **/


        var unpack$v = utils.unpack;
        var round$6 = Math.round;

        var rgb2temperature = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var rgb = unpack$v(args, 'rgb');
            var r = rgb[0], b = rgb[2];
            var minTemp = 1000;
            var maxTemp = 40000;
            var eps = 0.4;
            var temp;
            while (maxTemp - minTemp > eps) {
                temp = (maxTemp + minTemp) * 0.5;
                var rgb$1 = temperature2rgb_1(temp);
                if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
                    maxTemp = temp;
                } else {
                    minTemp = temp;
                }
            }
            return round$6(temp);
        };

        var rgb2temperature_1 = rgb2temperature;

        Color_1.prototype.temp =
        Color_1.prototype.kelvin =
        Color_1.prototype.temperature = function() {
            return rgb2temperature_1(this._rgb);
        };

        chroma_1.temp =
        chroma_1.kelvin =
        chroma_1.temperature = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
        };

        input.format.temp =
        input.format.kelvin =
        input.format.temperature = temperature2rgb_1;

        var type$f = utils.type;

        Color_1.prototype.alpha = function(a, mutate) {
            if ( mutate === void 0 ) mutate=false;

            if (a !== undefined && type$f(a) === 'number') {
                if (mutate) {
                    this._rgb[3] = a;
                    return this;
                }
                return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
            }
            return this._rgb[3];
        };

        Color_1.prototype.clipped = function() {
            return this._rgb._clipped || false;
        };

        Color_1.prototype.darken = function(amount) {
        	if ( amount === void 0 ) amount=1;

        	var me = this;
        	var lab = me.lab();
        	lab[0] -= labConstants.Kn * amount;
        	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
        };

        Color_1.prototype.brighten = function(amount) {
        	if ( amount === void 0 ) amount=1;

        	return this.darken(-amount);
        };

        Color_1.prototype.darker = Color_1.prototype.darken;
        Color_1.prototype.brighter = Color_1.prototype.brighten;

        Color_1.prototype.get = function(mc) {
            var ref = mc.split('.');
            var mode = ref[0];
            var channel = ref[1];
            var src = this[mode]();
            if (channel) {
                var i = mode.indexOf(channel);
                if (i > -1) { return src[i]; }
                throw new Error(("unknown channel " + channel + " in mode " + mode));
            } else {
                return src;
            }
        };

        var type$g = utils.type;
        var pow$2 = Math.pow;

        var EPS = 1e-7;
        var MAX_ITER = 20;

        Color_1.prototype.luminance = function(lum) {
            if (lum !== undefined && type$g(lum) === 'number') {
                if (lum === 0) {
                    // return pure black
                    return new Color_1([0,0,0,this._rgb[3]], 'rgb');
                }
                if (lum === 1) {
                    // return pure white
                    return new Color_1([255,255,255,this._rgb[3]], 'rgb');
                }
                // compute new color using...
                var cur_lum = this.luminance();
                var mode = 'rgb';
                var max_iter = MAX_ITER;

                var test = function (low, high) {
                    var mid = low.interpolate(high, 0.5, mode);
                    var lm = mid.luminance();
                    if (Math.abs(lum - lm) < EPS || !max_iter--) {
                        // close enough
                        return mid;
                    }
                    return lm > lum ? test(low, mid) : test(mid, high);
                };

                var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
                return new Color_1(rgb.concat( [this._rgb[3]]));
            }
            return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
        };


        var rgb2luminance = function (r,g,b) {
            // relative luminance
            // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
            r = luminance_x(r);
            g = luminance_x(g);
            b = luminance_x(b);
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        var luminance_x = function (x) {
            x /= 255;
            return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
        };

        var interpolator = {};

        var type$h = utils.type;


        var mix = function (col1, col2, f) {
            if ( f === void 0 ) f=0.5;
            var rest = [], len = arguments.length - 3;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

            var mode = rest[0] || 'lrgb';
            if (!interpolator[mode] && !rest.length) {
                // fall back to the first supported mode
                mode = Object.keys(interpolator)[0];
            }
            if (!interpolator[mode]) {
                throw new Error(("interpolation mode " + mode + " is not defined"));
            }
            if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
            if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
            return interpolator[mode](col1, col2, f)
                .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
        };

        Color_1.prototype.mix =
        Color_1.prototype.interpolate = function(col2, f) {
        	if ( f === void 0 ) f=0.5;
        	var rest = [], len = arguments.length - 2;
        	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

        	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
        };

        Color_1.prototype.premultiply = function(mutate) {
        	if ( mutate === void 0 ) mutate=false;

        	var rgb = this._rgb;
        	var a = rgb[3];
        	if (mutate) {
        		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
        		return this;
        	} else {
        		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
        	}
        };

        Color_1.prototype.saturate = function(amount) {
        	if ( amount === void 0 ) amount=1;

        	var me = this;
        	var lch = me.lch();
        	lch[1] += labConstants.Kn * amount;
        	if (lch[1] < 0) { lch[1] = 0; }
        	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
        };

        Color_1.prototype.desaturate = function(amount) {
        	if ( amount === void 0 ) amount=1;

        	return this.saturate(-amount);
        };

        var type$i = utils.type;

        Color_1.prototype.set = function(mc, value, mutate) {
            if ( mutate === void 0 ) mutate=false;

            var ref = mc.split('.');
            var mode = ref[0];
            var channel = ref[1];
            var src = this[mode]();
            if (channel) {
                var i = mode.indexOf(channel);
                if (i > -1) {
                    if (type$i(value) == 'string') {
                        switch(value.charAt(0)) {
                            case '+': src[i] += +value; break;
                            case '-': src[i] += +value; break;
                            case '*': src[i] *= +(value.substr(1)); break;
                            case '/': src[i] /= +(value.substr(1)); break;
                            default: src[i] = +value;
                        }
                    } else if (type$i(value) === 'number') {
                        src[i] = value;
                    } else {
                        throw new Error("unsupported value for Color.set");
                    }
                    var out = new Color_1(src, mode);
                    if (mutate) {
                        this._rgb = out._rgb;
                        return this;
                    }
                    return out;
                }
                throw new Error(("unknown channel " + channel + " in mode " + mode));
            } else {
                return src;
            }
        };

        var rgb$1 = function (col1, col2, f) {
            var xyz0 = col1._rgb;
            var xyz1 = col2._rgb;
            return new Color_1(
                xyz0[0] + f * (xyz1[0]-xyz0[0]),
                xyz0[1] + f * (xyz1[1]-xyz0[1]),
                xyz0[2] + f * (xyz1[2]-xyz0[2]),
                'rgb'
            )
        };

        // register interpolator
        interpolator.rgb = rgb$1;

        var sqrt$2 = Math.sqrt;
        var pow$3 = Math.pow;

        var lrgb = function (col1, col2, f) {
            var ref = col1._rgb;
            var x1 = ref[0];
            var y1 = ref[1];
            var z1 = ref[2];
            var ref$1 = col2._rgb;
            var x2 = ref$1[0];
            var y2 = ref$1[1];
            var z2 = ref$1[2];
            return new Color_1(
                sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
                sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
                sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
                'rgb'
            )
        };

        // register interpolator
        interpolator.lrgb = lrgb;

        var lab$1 = function (col1, col2, f) {
            var xyz0 = col1.lab();
            var xyz1 = col2.lab();
            return new Color_1(
                xyz0[0] + f * (xyz1[0]-xyz0[0]),
                xyz0[1] + f * (xyz1[1]-xyz0[1]),
                xyz0[2] + f * (xyz1[2]-xyz0[2]),
                'lab'
            )
        };

        // register interpolator
        interpolator.lab = lab$1;

        var _hsx = function (col1, col2, f, m) {
            var assign, assign$1;

            var xyz0, xyz1;
            if (m === 'hsl') {
                xyz0 = col1.hsl();
                xyz1 = col2.hsl();
            } else if (m === 'hsv') {
                xyz0 = col1.hsv();
                xyz1 = col2.hsv();
            } else if (m === 'hcg') {
                xyz0 = col1.hcg();
                xyz1 = col2.hcg();
            } else if (m === 'hsi') {
                xyz0 = col1.hsi();
                xyz1 = col2.hsi();
            } else if (m === 'lch' || m === 'hcl') {
                m = 'hcl';
                xyz0 = col1.hcl();
                xyz1 = col2.hcl();
            }

            var hue0, hue1, sat0, sat1, lbv0, lbv1;
            if (m.substr(0, 1) === 'h') {
                (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
                (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
            }

            var sat, hue, lbv, dh;

            if (!isNaN(hue0) && !isNaN(hue1)) {
                // both colors have hue
                if (hue1 > hue0 && hue1 - hue0 > 180) {
                    dh = hue1-(hue0+360);
                } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                    dh = hue1+360-hue0;
                } else{
                    dh = hue1 - hue0;
                }
                hue = hue0 + f * dh;
            } else if (!isNaN(hue0)) {
                hue = hue0;
                if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
            } else if (!isNaN(hue1)) {
                hue = hue1;
                if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
            } else {
                hue = Number.NaN;
            }

            if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
            lbv = lbv0 + f * (lbv1-lbv0);
            return new Color_1([hue, sat, lbv], m);
        };

        var lch$1 = function (col1, col2, f) {
        	return _hsx(col1, col2, f, 'lch');
        };

        // register interpolator
        interpolator.lch = lch$1;
        interpolator.hcl = lch$1;

        var num$1 = function (col1, col2, f) {
            var c1 = col1.num();
            var c2 = col2.num();
            return new Color_1(c1 + f * (c2-c1), 'num')
        };

        // register interpolator
        interpolator.num = num$1;

        var hcg$1 = function (col1, col2, f) {
        	return _hsx(col1, col2, f, 'hcg');
        };

        // register interpolator
        interpolator.hcg = hcg$1;

        var hsi$1 = function (col1, col2, f) {
        	return _hsx(col1, col2, f, 'hsi');
        };

        // register interpolator
        interpolator.hsi = hsi$1;

        var hsl$1 = function (col1, col2, f) {
        	return _hsx(col1, col2, f, 'hsl');
        };

        // register interpolator
        interpolator.hsl = hsl$1;

        var hsv$1 = function (col1, col2, f) {
        	return _hsx(col1, col2, f, 'hsv');
        };

        // register interpolator
        interpolator.hsv = hsv$1;

        var clip_rgb$2 = utils.clip_rgb;
        var pow$4 = Math.pow;
        var sqrt$3 = Math.sqrt;
        var PI$1 = Math.PI;
        var cos$2 = Math.cos;
        var sin$1 = Math.sin;
        var atan2$1 = Math.atan2;

        var average = function (colors, mode) {
            if ( mode === void 0 ) mode='lrgb';

            var l = colors.length;
            // convert colors to Color objects
            colors = colors.map(function (c) { return new Color_1(c); });
            if (mode === 'lrgb') {
                return _average_lrgb(colors)
            }
            var first = colors.shift();
            var xyz = first.get(mode);
            var cnt = [];
            var dx = 0;
            var dy = 0;
            // initial color
            for (var i=0; i<xyz.length; i++) {
                xyz[i] = xyz[i] || 0;
                cnt.push(isNaN(xyz[i]) ? 0 : 1);
                if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
                    var A = xyz[i] / 180 * PI$1;
                    dx += cos$2(A);
                    dy += sin$1(A);
                }
            }

            var alpha = first.alpha();
            colors.forEach(function (c) {
                var xyz2 = c.get(mode);
                alpha += c.alpha();
                for (var i=0; i<xyz.length; i++) {
                    if (!isNaN(xyz2[i])) {
                        cnt[i]++;
                        if (mode.charAt(i) === 'h') {
                            var A = xyz2[i] / 180 * PI$1;
                            dx += cos$2(A);
                            dy += sin$1(A);
                        } else {
                            xyz[i] += xyz2[i];
                        }
                    }
                }
            });

            for (var i$1=0; i$1<xyz.length; i$1++) {
                if (mode.charAt(i$1) === 'h') {
                    var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
                    while (A$1 < 0) { A$1 += 360; }
                    while (A$1 >= 360) { A$1 -= 360; }
                    xyz[i$1] = A$1;
                } else {
                    xyz[i$1] = xyz[i$1]/cnt[i$1];
                }
            }
            alpha /= l;
            return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
        };


        var _average_lrgb = function (colors) {
            var l = colors.length;
            var f = 1/l;
            var xyz = [0,0,0,0];
            for (var i = 0, list = colors; i < list.length; i += 1) {
                var col = list[i];

                var rgb = col._rgb;
                xyz[0] += pow$4(rgb[0],2) * f;
                xyz[1] += pow$4(rgb[1],2) * f;
                xyz[2] += pow$4(rgb[2],2) * f;
                xyz[3] += rgb[3] * f;
            }
            xyz[0] = sqrt$3(xyz[0]);
            xyz[1] = sqrt$3(xyz[1]);
            xyz[2] = sqrt$3(xyz[2]);
            if (xyz[3] > 0.9999999) { xyz[3] = 1; }
            return new Color_1(clip_rgb$2(xyz));
        };

        // minimal multi-purpose interface

        // @requires utils color analyze


        var type$j = utils.type;

        var pow$5 = Math.pow;

        var scale = function(colors) {

            // constructor
            var _mode = 'rgb';
            var _nacol = chroma_1('#ccc');
            var _spread = 0;
            // const _fixed = false;
            var _domain = [0, 1];
            var _pos = [];
            var _padding = [0,0];
            var _classes = false;
            var _colors = [];
            var _out = false;
            var _min = 0;
            var _max = 1;
            var _correctLightness = false;
            var _colorCache = {};
            var _useCache = true;
            var _gamma = 1;

            // private methods

            var setColors = function(colors) {
                colors = colors || ['#fff', '#000'];
                if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
                    chroma_1.brewer[colors.toLowerCase()]) {
                    colors = chroma_1.brewer[colors.toLowerCase()];
                }
                if (type$j(colors) === 'array') {
                    // handle single color
                    if (colors.length === 1) {
                        colors = [colors[0], colors[0]];
                    }
                    // make a copy of the colors
                    colors = colors.slice(0);
                    // convert to chroma classes
                    for (var c=0; c<colors.length; c++) {
                        colors[c] = chroma_1(colors[c]);
                    }
                    // auto-fill color position
                    _pos.length = 0;
                    for (var c$1=0; c$1<colors.length; c$1++) {
                        _pos.push(c$1/(colors.length-1));
                    }
                }
                resetCache();
                return _colors = colors;
            };

            var getClass = function(value) {
                if (_classes != null) {
                    var n = _classes.length-1;
                    var i = 0;
                    while (i < n && value >= _classes[i]) {
                        i++;
                    }
                    return i-1;
                }
                return 0;
            };

            var tmap = function (t) { return t; };

            // const classifyValue = function(value) {
            //     let val = value;
            //     if (_classes.length > 2) {
            //         const n = _classes.length-1;
            //         const i = getClass(value);
            //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
            //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
            //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
            //     }
            //     return val;
            // };

            var getColor = function(val, bypassMap) {
                var col, t;
                if (bypassMap == null) { bypassMap = false; }
                if (isNaN(val) || (val === null)) { return _nacol; }
                if (!bypassMap) {
                    if (_classes && (_classes.length > 2)) {
                        // find the class
                        var c = getClass(val);
                        t = c / (_classes.length-2);
                    } else if (_max !== _min) {
                        // just interpolate between min/max
                        t = (val - _min) / (_max - _min);
                    } else {
                        t = 1;
                    }
                } else {
                    t = val;
                }

                if (!bypassMap) {
                    t = tmap(t);  // lightness correction
                }

                if (_gamma !== 1) { t = pow$5(t, _gamma); }

                t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

                t = Math.min(1, Math.max(0, t));

                var k = Math.floor(t * 10000);

                if (_useCache && _colorCache[k]) {
                    col = _colorCache[k];
                } else {
                    if (type$j(_colors) === 'array') {
                        //for i in [0.._pos.length-1]
                        for (var i=0; i<_pos.length; i++) {
                            var p = _pos[i];
                            if (t <= p) {
                                col = _colors[i];
                                break;
                            }
                            if ((t >= p) && (i === (_pos.length-1))) {
                                col = _colors[i];
                                break;
                            }
                            if (t > p && t < _pos[i+1]) {
                                t = (t-p)/(_pos[i+1]-p);
                                col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
                                break;
                            }
                        }
                    } else if (type$j(_colors) === 'function') {
                        col = _colors(t);
                    }
                    if (_useCache) { _colorCache[k] = col; }
                }
                return col;
            };

            var resetCache = function () { return _colorCache = {}; };

            setColors(colors);

            // public interface

            var f = function(v) {
                var c = chroma_1(getColor(v));
                if (_out && c[_out]) { return c[_out](); } else { return c; }
            };

            f.classes = function(classes) {
                if (classes != null) {
                    if (type$j(classes) === 'array') {
                        _classes = classes;
                        _domain = [classes[0], classes[classes.length-1]];
                    } else {
                        var d = chroma_1.analyze(_domain);
                        if (classes === 0) {
                            _classes = [d.min, d.max];
                        } else {
                            _classes = chroma_1.limits(d, 'e', classes);
                        }
                    }
                    return f;
                }
                return _classes;
            };


            f.domain = function(domain) {
                if (!arguments.length) {
                    return _domain;
                }
                _min = domain[0];
                _max = domain[domain.length-1];
                _pos = [];
                var k = _colors.length;
                if ((domain.length === k) && (_min !== _max)) {
                    // update positions
                    for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
                        var d = list[i];

                      _pos.push((d-_min) / (_max-_min));
                    }
                } else {
                    for (var c=0; c<k; c++) {
                        _pos.push(c/(k-1));
                    }
                }
                _domain = [_min, _max];
                return f;
            };

            f.mode = function(_m) {
                if (!arguments.length) {
                    return _mode;
                }
                _mode = _m;
                resetCache();
                return f;
            };

            f.range = function(colors, _pos) {
                setColors(colors);
                return f;
            };

            f.out = function(_o) {
                _out = _o;
                return f;
            };

            f.spread = function(val) {
                if (!arguments.length) {
                    return _spread;
                }
                _spread = val;
                return f;
            };

            f.correctLightness = function(v) {
                if (v == null) { v = true; }
                _correctLightness = v;
                resetCache();
                if (_correctLightness) {
                    tmap = function(t) {
                        var L0 = getColor(0, true).lab()[0];
                        var L1 = getColor(1, true).lab()[0];
                        var pol = L0 > L1;
                        var L_actual = getColor(t, true).lab()[0];
                        var L_ideal = L0 + ((L1 - L0) * t);
                        var L_diff = L_actual - L_ideal;
                        var t0 = 0;
                        var t1 = 1;
                        var max_iter = 20;
                        while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                            (function() {
                                if (pol) { L_diff *= -1; }
                                if (L_diff < 0) {
                                    t0 = t;
                                    t += (t1 - t) * 0.5;
                                } else {
                                    t1 = t;
                                    t += (t0 - t) * 0.5;
                                }
                                L_actual = getColor(t, true).lab()[0];
                                return L_diff = L_actual - L_ideal;
                            })();
                        }
                        return t;
                    };
                } else {
                    tmap = function (t) { return t; };
                }
                return f;
            };

            f.padding = function(p) {
                if (p != null) {
                    if (type$j(p) === 'number') {
                        p = [p,p];
                    }
                    _padding = p;
                    return f;
                } else {
                    return _padding;
                }
            };

            f.colors = function(numColors, out) {
                // If no arguments are given, return the original colors that were provided
                if (arguments.length < 2) { out = 'hex'; }
                var result = [];

                if (arguments.length === 0) {
                    result = _colors.slice(0);

                } else if (numColors === 1) {
                    result = [f(0.5)];

                } else if (numColors > 1) {
                    var dm = _domain[0];
                    var dd = _domain[1] - dm;
                    result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

                } else { // returns all colors based on the defined classes
                    colors = [];
                    var samples = [];
                    if (_classes && (_classes.length > 2)) {
                        for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                            samples.push((_classes[i-1]+_classes[i])*0.5);
                        }
                    } else {
                        samples = _domain;
                    }
                    result = samples.map(function (v) { return f(v); });
                }

                if (chroma_1[out]) {
                    result = result.map(function (c) { return c[out](); });
                }
                return result;
            };

            f.cache = function(c) {
                if (c != null) {
                    _useCache = c;
                    return f;
                } else {
                    return _useCache;
                }
            };

            f.gamma = function(g) {
                if (g != null) {
                    _gamma = g;
                    return f;
                } else {
                    return _gamma;
                }
            };

            f.nodata = function(d) {
                if (d != null) {
                    _nacol = chroma_1(d);
                    return f;
                } else {
                    return _nacol;
                }
            };

            return f;
        };

        function __range__(left, right, inclusive) {
          var range = [];
          var ascending = left < right;
          var end = !inclusive ? right : ascending ? right + 1 : right - 1;
          for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
            range.push(i);
          }
          return range;
        }

        //
        // interpolates between a set of colors uzing a bezier spline
        //

        // @requires utils lab




        var bezier = function(colors) {
            var assign, assign$1, assign$2;

            var I, lab0, lab1, lab2;
            colors = colors.map(function (c) { return new Color_1(c); });
            if (colors.length === 2) {
                // linear interpolation
                (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
                I = function(t) {
                    var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
                    return new Color_1(lab, 'lab');
                };
            } else if (colors.length === 3) {
                // quadratic bezier interpolation
                (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
                I = function(t) {
                    var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
                    return new Color_1(lab, 'lab');
                };
            } else if (colors.length === 4) {
                // cubic bezier interpolation
                var lab3;
                (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
                I = function(t) {
                    var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
                    return new Color_1(lab, 'lab');
                };
            } else if (colors.length === 5) {
                var I0 = bezier(colors.slice(0, 3));
                var I1 = bezier(colors.slice(2, 5));
                I = function(t) {
                    if (t < 0.5) {
                        return I0(t*2);
                    } else {
                        return I1((t-0.5)*2);
                    }
                };
            }
            return I;
        };

        var bezier_1 = function (colors) {
            var f = bezier(colors);
            f.scale = function () { return scale(f); };
            return f;
        };

        /*
         * interpolates between a set of colors uzing a bezier spline
         * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
         */




        var blend = function (bottom, top, mode) {
            if (!blend[mode]) {
                throw new Error('unknown blend mode ' + mode);
            }
            return blend[mode](bottom, top);
        };

        var blend_f = function (f) { return function (bottom,top) {
                var c0 = chroma_1(top).rgb();
                var c1 = chroma_1(bottom).rgb();
                return chroma_1.rgb(f(c0, c1));
            }; };

        var each = function (f) { return function (c0, c1) {
                var out = [];
                out[0] = f(c0[0], c1[0]);
                out[1] = f(c0[1], c1[1]);
                out[2] = f(c0[2], c1[2]);
                return out;
            }; };

        var normal = function (a) { return a; };
        var multiply = function (a,b) { return a * b / 255; };
        var darken$1 = function (a,b) { return a > b ? b : a; };
        var lighten = function (a,b) { return a > b ? a : b; };
        var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
        var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
        var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
        var dodge = function (a,b) {
            if (a === 255) { return 255; }
            a = 255 * (b / 255) / (1 - a / 255);
            return a > 255 ? 255 : a
        };

        // # add = (a,b) ->
        // #     if (a + b > 255) then 255 else a + b

        blend.normal = blend_f(each(normal));
        blend.multiply = blend_f(each(multiply));
        blend.screen = blend_f(each(screen));
        blend.overlay = blend_f(each(overlay));
        blend.darken = blend_f(each(darken$1));
        blend.lighten = blend_f(each(lighten));
        blend.dodge = blend_f(each(dodge));
        blend.burn = blend_f(each(burn));
        // blend.add = blend_f(each(add));

        var blend_1 = blend;

        // cubehelix interpolation
        // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
        // http://astron-soc.in/bulletin/11June/289392011.pdf

        var type$k = utils.type;
        var clip_rgb$3 = utils.clip_rgb;
        var TWOPI$2 = utils.TWOPI;
        var pow$6 = Math.pow;
        var sin$2 = Math.sin;
        var cos$3 = Math.cos;


        var cubehelix = function(start, rotations, hue, gamma, lightness) {
            if ( start === void 0 ) start=300;
            if ( rotations === void 0 ) rotations=-1.5;
            if ( hue === void 0 ) hue=1;
            if ( gamma === void 0 ) gamma=1;
            if ( lightness === void 0 ) lightness=[0,1];

            var dh = 0, dl;
            if (type$k(lightness) === 'array') {
                dl = lightness[1] - lightness[0];
            } else {
                dl = 0;
                lightness = [lightness, lightness];
            }

            var f = function(fract) {
                var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
                var l = pow$6(lightness[0] + (dl * fract), gamma);
                var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
                var amp = (h * l * (1-l)) / 2;
                var cos_a = cos$3(a);
                var sin_a = sin$2(a);
                var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
                var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
                var b = l + (amp * (+1.97294 * cos_a));
                return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
            };

            f.start = function(s) {
                if ((s == null)) { return start; }
                start = s;
                return f;
            };

            f.rotations = function(r) {
                if ((r == null)) { return rotations; }
                rotations = r;
                return f;
            };

            f.gamma = function(g) {
                if ((g == null)) { return gamma; }
                gamma = g;
                return f;
            };

            f.hue = function(h) {
                if ((h == null)) { return hue; }
                hue = h;
                if (type$k(hue) === 'array') {
                    dh = hue[1] - hue[0];
                    if (dh === 0) { hue = hue[1]; }
                } else {
                    dh = 0;
                }
                return f;
            };

            f.lightness = function(h) {
                if ((h == null)) { return lightness; }
                if (type$k(h) === 'array') {
                    lightness = h;
                    dl = h[1] - h[0];
                } else {
                    lightness = [h,h];
                    dl = 0;
                }
                return f;
            };

            f.scale = function () { return chroma_1.scale(f); };

            f.hue(hue);

            return f;
        };

        var digits = '0123456789abcdef';

        var floor$2 = Math.floor;
        var random = Math.random;

        var random_1 = function () {
            var code = '#';
            for (var i=0; i<6; i++) {
                code += digits.charAt(floor$2(random() * 16));
            }
            return new Color_1(code, 'hex');
        };

        var log$1 = Math.log;
        var pow$7 = Math.pow;
        var floor$3 = Math.floor;
        var abs = Math.abs;


        var analyze = function (data, key) {
            if ( key === void 0 ) key=null;

            var r = {
                min: Number.MAX_VALUE,
                max: Number.MAX_VALUE*-1,
                sum: 0,
                values: [],
                count: 0
            };
            if (type(data) === 'object') {
                data = Object.values(data);
            }
            data.forEach(function (val) {
                if (key && type(val) === 'object') { val = val[key]; }
                if (val !== undefined && val !== null && !isNaN(val)) {
                    r.values.push(val);
                    r.sum += val;
                    if (val < r.min) { r.min = val; }
                    if (val > r.max) { r.max = val; }
                    r.count += 1;
                }
            });

            r.domain = [r.min, r.max];

            r.limits = function (mode, num) { return limits(r, mode, num); };

            return r;
        };


        var limits = function (data, mode, num) {
            if ( mode === void 0 ) mode='equal';
            if ( num === void 0 ) num=7;

            if (type(data) == 'array') {
                data = analyze(data);
            }
            var min = data.min;
            var max = data.max;
            var values = data.values.sort(function (a,b) { return a-b; });

            if (num === 1) { return [min,max]; }

            var limits = [];

            if (mode.substr(0,1) === 'c') { // continuous
                limits.push(min);
                limits.push(max);
            }

            if (mode.substr(0,1) === 'e') { // equal interval
                limits.push(min);
                for (var i=1; i<num; i++) {
                    limits.push(min+((i/num)*(max-min)));
                }
                limits.push(max);
            }

            else if (mode.substr(0,1) === 'l') { // log scale
                if (min <= 0) {
                    throw new Error('Logarithmic scales are only possible for values > 0');
                }
                var min_log = Math.LOG10E * log$1(min);
                var max_log = Math.LOG10E * log$1(max);
                limits.push(min);
                for (var i$1=1; i$1<num; i$1++) {
                    limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
                }
                limits.push(max);
            }

            else if (mode.substr(0,1) === 'q') { // quantile scale
                limits.push(min);
                for (var i$2=1; i$2<num; i$2++) {
                    var p = ((values.length-1) * i$2)/num;
                    var pb = floor$3(p);
                    if (pb === p) {
                        limits.push(values[pb]);
                    } else { // p > pb
                        var pr = p - pb;
                        limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
                    }
                }
                limits.push(max);

            }

            else if (mode.substr(0,1) === 'k') { // k-means clustering
                /*
                implementation based on
                http://code.google.com/p/figue/source/browse/trunk/figue.js#336
                simplified for 1-d input values
                */
                var cluster;
                var n = values.length;
                var assignments = new Array(n);
                var clusterSizes = new Array(num);
                var repeat = true;
                var nb_iters = 0;
                var centroids = null;

                // get seed values
                centroids = [];
                centroids.push(min);
                for (var i$3=1; i$3<num; i$3++) {
                    centroids.push(min + ((i$3/num) * (max-min)));
                }
                centroids.push(max);

                while (repeat) {
                    // assignment step
                    for (var j=0; j<num; j++) {
                        clusterSizes[j] = 0;
                    }
                    for (var i$4=0; i$4<n; i$4++) {
                        var value = values[i$4];
                        var mindist = Number.MAX_VALUE;
                        var best = (void 0);
                        for (var j$1=0; j$1<num; j$1++) {
                            var dist = abs(centroids[j$1]-value);
                            if (dist < mindist) {
                                mindist = dist;
                                best = j$1;
                            }
                            clusterSizes[best]++;
                            assignments[i$4] = best;
                        }
                    }

                    // update centroids step
                    var newCentroids = new Array(num);
                    for (var j$2=0; j$2<num; j$2++) {
                        newCentroids[j$2] = null;
                    }
                    for (var i$5=0; i$5<n; i$5++) {
                        cluster = assignments[i$5];
                        if (newCentroids[cluster] === null) {
                            newCentroids[cluster] = values[i$5];
                        } else {
                            newCentroids[cluster] += values[i$5];
                        }
                    }
                    for (var j$3=0; j$3<num; j$3++) {
                        newCentroids[j$3] *= 1/clusterSizes[j$3];
                    }

                    // check convergence
                    repeat = false;
                    for (var j$4=0; j$4<num; j$4++) {
                        if (newCentroids[j$4] !== centroids[j$4]) {
                            repeat = true;
                            break;
                        }
                    }

                    centroids = newCentroids;
                    nb_iters++;

                    if (nb_iters > 200) {
                        repeat = false;
                    }
                }

                // finished k-means clustering
                // the next part is borrowed from gabrielflor.it
                var kClusters = {};
                for (var j$5=0; j$5<num; j$5++) {
                    kClusters[j$5] = [];
                }
                for (var i$6=0; i$6<n; i$6++) {
                    cluster = assignments[i$6];
                    kClusters[cluster].push(values[i$6]);
                }
                var tmpKMeansBreaks = [];
                for (var j$6=0; j$6<num; j$6++) {
                    tmpKMeansBreaks.push(kClusters[j$6][0]);
                    tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
                }
                tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
                limits.push(tmpKMeansBreaks[0]);
                for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
                    var v = tmpKMeansBreaks[i$7];
                    if (!isNaN(v) && (limits.indexOf(v) === -1)) {
                        limits.push(v);
                    }
                }
            }
            return limits;
        };

        var analyze_1 = {analyze: analyze, limits: limits};

        var contrast = function (a, b) {
            // WCAG contrast ratio
            // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
            a = new Color_1(a);
            b = new Color_1(b);
            var l1 = a.luminance();
            var l2 = b.luminance();
            return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
        };

        var sqrt$4 = Math.sqrt;
        var atan2$2 = Math.atan2;
        var abs$1 = Math.abs;
        var cos$4 = Math.cos;
        var PI$2 = Math.PI;

        var deltaE = function(a, b, L, C) {
            if ( L === void 0 ) L=1;
            if ( C === void 0 ) C=1;

            // Delta E (CMC)
            // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
            a = new Color_1(a);
            b = new Color_1(b);
            var ref = Array.from(a.lab());
            var L1 = ref[0];
            var a1 = ref[1];
            var b1 = ref[2];
            var ref$1 = Array.from(b.lab());
            var L2 = ref$1[0];
            var a2 = ref$1[1];
            var b2 = ref$1[2];
            var c1 = sqrt$4((a1 * a1) + (b1 * b1));
            var c2 = sqrt$4((a2 * a2) + (b2 * b2));
            var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
            var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
            var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
            while (h1 < 0) { h1 += 360; }
            while (h1 >= 360) { h1 -= 360; }
            var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
            var c4 = c1 * c1 * c1 * c1;
            var f = sqrt$4(c4 / (c4 + 1900.0));
            var sh = sc * (((f * t) + 1.0) - f);
            var delL = L1 - L2;
            var delC = c1 - c2;
            var delA = a1 - a2;
            var delB = b1 - b2;
            var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
            var v1 = delL / (L * sl);
            var v2 = delC / (C * sc);
            var v3 = sh;
            return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
        };

        // simple Euclidean distance
        var distance = function(a, b, mode) {
            if ( mode === void 0 ) mode='lab';

            // Delta E (CIE 1976)
            // see http://www.brucelindbloom.com/index.html?Equations.html
            a = new Color_1(a);
            b = new Color_1(b);
            var l1 = a.get(mode);
            var l2 = b.get(mode);
            var sum_sq = 0;
            for (var i in l1) {
                var d = (l1[i] || 0) - (l2[i] || 0);
                sum_sq += d*d;
            }
            return Math.sqrt(sum_sq);
        };

        var valid = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            try {
                new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
                return true;
            } catch (e) {
                return false;
            }
        };

        // some pre-defined color scales:




        var scales = {
        	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
        	hot: function hot() { return scale(['#000','#f00','#ff0','#fff']).mode('rgb') }
        };

        /**
            ColorBrewer colors for chroma.js

            Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
            Pennsylvania State University.

            Licensed under the Apache License, Version 2.0 (the "License");
            you may not use this file except in compliance with the License.
            You may obtain a copy of the License at
            http://www.apache.org/licenses/LICENSE-2.0

            Unless required by applicable law or agreed to in writing, software distributed
            under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
            CONDITIONS OF ANY KIND, either express or implied. See the License for the
            specific language governing permissions and limitations under the License.
        */

        var colorbrewer = {
            // sequential
            OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
            PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
            BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
            Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
            BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
            YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
            YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
            Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
            RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
            Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
            YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
            Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
            GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
            Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
            YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
            PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
            Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
            PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
            Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

            // diverging

            Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
            RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
            RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
            PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
            PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
            RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
            BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
            RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
            PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

            // qualitative

            Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
            Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
            Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
            Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
            Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
            Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
            Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
            Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
        };

        // add lowercase aliases for case-insensitive matches
        for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
            var key = list$1[i$1];

            colorbrewer[key.toLowerCase()] = colorbrewer[key];
        }

        var colorbrewer_1 = colorbrewer;

        // feel free to comment out anything to rollup
        // a smaller chroma.js built

        // io --> convert colors















        // operators --> modify existing Colors










        // interpolators










        // generators -- > create new colors
        chroma_1.average = average;
        chroma_1.bezier = bezier_1;
        chroma_1.blend = blend_1;
        chroma_1.cubehelix = cubehelix;
        chroma_1.mix = chroma_1.interpolate = mix;
        chroma_1.random = random_1;
        chroma_1.scale = scale;

        // other utility methods
        chroma_1.analyze = analyze_1.analyze;
        chroma_1.contrast = contrast;
        chroma_1.deltaE = deltaE;
        chroma_1.distance = distance;
        chroma_1.limits = analyze_1.limits;
        chroma_1.valid = valid;

        // scale
        chroma_1.scales = scales;

        // colors
        chroma_1.colors = w3cx11_1;
        chroma_1.brewer = colorbrewer_1;

        var chroma_js = chroma_1;

        return chroma_js;

    })));
    });

    /* src\Checkbox.svelte generated by Svelte v3.5.3 */

    const file = "src\\Checkbox.svelte";

    function create_fragment(ctx) {
    	var div, input, t0, label_1, t1, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(ctx.label);
    			attr(input, "type", "checkbox");
    			attr(input, "class", "custom-control-input");
    			attr(input, "id", ctx.id);
    			add_location(input, file, 8, 4, 260);
    			attr(label_1, "class", "custom-control-label");
    			attr(label_1, "for", ctx.id);
    			add_location(label_1, file, 9, 4, 349);
    			attr(div, "class", "custom-control custom-checkbox");
    			toggle_class(div, "custom-control-inline", ctx.inline);
    			add_location(div, file, 7, 0, 173);
    			dispose = listen(input, "change", ctx.input_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);

    			input.checked = ctx.value;

    			append(div, t0);
    			append(div, label_1);
    			append(label_1, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.value) input.checked = ctx.value;

    			if (changed.label) {
    				set_data(t1, ctx.label);
    			}

    			if (changed.inline) {
    				toggle_class(div, "custom-control-inline", ctx.inline);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { value = false, inline = true, label = '' } = $$props;
        const id = Math.round(Math.random()*1e7).toString(36);

    	const writable_props = ['value', 'inline', 'label'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('inline' in $$props) $$invalidate('inline', inline = $$props.inline);
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    	};

    	return {
    		value,
    		inline,
    		label,
    		id,
    		input_change_handler
    	};
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["value", "inline", "label"]);
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeCeil = Math.ceil,
        nativeMax = Math.max;

    /**
     * The base implementation of `_.range` and `_.rangeRight` which doesn't
     * coerce arguments.
     *
     * @private
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @param {number} step The value to increment or decrement by.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the range of numbers.
     */
    function baseRange(start, end, step, fromRight) {
      var index = -1,
          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);

      while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol = root.Symbol;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0,
        MAX_INTEGER = 1.7976931348623157e+308;

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    /**
     * Creates a `_.range` or `_.rangeRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new range function.
     */
    function createRange(fromRight) {
      return function(start, end, step) {
        if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
          end = step = undefined;
        }
        // Ensure the sign of `-0` is preserved.
        start = toFinite(start);
        if (end === undefined) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
        return baseRange(start, end, step, fromRight);
      };
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to, but not including, `end`. A step of `-1` is used if a negative
     * `start` is specified without an `end` or `step`. If `end` is not specified,
     * it's set to `start` with `start` then set to `0`.
     *
     * **Note:** JavaScript follows the IEEE-754 standard for resolving
     * floating-point values which can produce unexpected results.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the range of numbers.
     * @see _.inRange, _.rangeRight
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(-4);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    var range = createRange();

    /* src\Color.svelte generated by Svelte v3.5.3 */

    const file$1 = "src\\Color.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.c = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.c = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.l = list[i];
    	return child_ctx;
    }

    // (85:4) {#if open && !dragging}
    function create_if_block(ctx) {
    	var div6, div5, div0, t0, h3, t1, div4, div1, span0, t3, t4, div2, span1, t6, t7, div3, span2, t9;

    	var each_value_2 = ctx.lightness;

    	var each_blocks_2 = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	var each_value_1 = ctx.saturation;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	var each_value = ctx.hue;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h3 = element("h3");
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "L";
    			t3 = space();

    			for (var i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "S";
    			t6 = space();

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			div3 = element("div");
    			span2 = element("span");
    			span2.textContent = "H";
    			t9 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", "arrow");
    			set_style(div0, "left", "121px");
    			add_location(div0, file$1, 89, 12, 2444);
    			attr(h3, "class", "popover-header svelte-fua55c");
    			add_location(h3, file$1, 90, 12, 2504);
    			attr(span0, "class", "lbl svelte-fua55c");
    			add_location(span0, file$1, 93, 20, 2639);
    			attr(div1, "class", "color-row svelte-fua55c");
    			add_location(div1, file$1, 92, 16, 2594);
    			attr(span1, "class", "lbl svelte-fua55c");
    			add_location(span1, file$1, 99, 20, 2933);
    			attr(div2, "class", "color-row svelte-fua55c");
    			add_location(div2, file$1, 98, 16, 2888);
    			attr(span2, "class", "lbl svelte-fua55c");
    			add_location(span2, file$1, 105, 20, 3228);
    			attr(div3, "class", "color-row svelte-fua55c");
    			add_location(div3, file$1, 104, 16, 3183);
    			attr(div4, "class", "popover-body svelte-fua55c");
    			add_location(div4, file$1, 91, 12, 2550);
    			attr(div5, "class", "popover fade show bs-popover-bottom svelte-fua55c");
    			attr(div5, "role", "tooltip");
    			attr(div5, "x-placement", "bottom");
    			add_location(div5, file$1, 86, 8, 2319);
    			set_style(div6, "position", "absolute");
    			set_style(div6, "top", "0px");
    			set_style(div6, "left", "0");
    			set_style(div6, "right", "0");
    			set_style(div6, "height", "40px");
    			add_location(div6, file$1, 85, 4, 2241);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, div0);
    			append(div5, t0);
    			append(div5, h3);
    			append(div5, t1);
    			append(div5, div4);
    			append(div4, div1);
    			append(div1, span0);
    			append(div1, t3);

    			for (var i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append(div4, t4);
    			append(div4, div2);
    			append(div2, span1);
    			append(div2, t6);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append(div4, t7);
    			append(div4, div3);
    			append(div3, span2);
    			append(div3, t9);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.lightness) {
    				each_value_2 = ctx.lightness;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(changed, child_ctx);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}
    				each_blocks_2.length = each_value_2.length;
    			}

    			if (changed.saturation) {
    				each_value_1 = ctx.saturation;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.hue) {
    				each_value = ctx.hue;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			destroy_each(each_blocks_2, detaching);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (95:20) {#each lightness as l}
    function create_each_block_2(ctx) {
    	var span, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			span = element("span");
    			attr(span, "class", "color svelte-fua55c");
    			set_style(span, "background", ctx.l.hex());
    			add_location(span, file$1, 95, 20, 2731);
    			dispose = listen(span, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.lightness) {
    				set_style(span, "background", ctx.l.hex());
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			dispose();
    		}
    	};
    }

    // (101:20) {#each saturation as c}
    function create_each_block_1(ctx) {
    	var span, dispose;

    	function click_handler_1() {
    		return ctx.click_handler_1(ctx);
    	}

    	return {
    		c: function create() {
    			span = element("span");
    			attr(span, "class", "color svelte-fua55c");
    			set_style(span, "background", ctx.c.hex());
    			add_location(span, file$1, 101, 20, 3026);
    			dispose = listen(span, "click", click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.saturation) {
    				set_style(span, "background", ctx.c.hex());
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			dispose();
    		}
    	};
    }

    // (107:20) {#each hue as c}
    function create_each_block(ctx) {
    	var span, dispose;

    	function click_handler_2() {
    		return ctx.click_handler_2(ctx);
    	}

    	return {
    		c: function create() {
    			span = element("span");
    			attr(span, "class", "color svelte-fua55c");
    			set_style(span, "background", ctx.c.hex());
    			add_location(span, file$1, 107, 20, 3314);
    			dispose = listen(span, "click", click_handler_2);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.hue) {
    				set_style(span, "background", ctx.c.hex());
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var span1, span0, t0_value = ctx.value.hex().substr(1), t0, t1, dispose;

    	var if_block = (ctx.open && !ctx.dragging) && create_if_block(ctx);

    	return {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(span0, "class", "hex svelte-fua55c");
    			add_location(span0, file$1, 83, 4, 2158);
    			attr(span1, "draggable", "true");
    			attr(span1, "class", "badge shadow-sm svelte-fua55c");
    			set_style(span1, "background", ctx.value.hex());
    			toggle_class(span1, "inverted", ctx.value.lab()[0]<50);
    			add_location(span1, file$1, 72, 0, 1768);

    			dispose = [
    				listen(span1, "dragstart", ctx.dragstart_handler),
    				listen(span1, "dragstart", ctx.dragstart_handler_1),
    				listen(span1, "dragend", ctx.dragend_handler, ctx.open = false),
    				listen(span1, "mouseenter", ctx.toggleEditOpen),
    				listen(span1, "mouseleave", ctx.toggleEditClose),
    				listen(span1, "click", stop_propagation(click_handler_3))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span1, anchor);
    			append(span1, span0);
    			append(span0, t0);
    			append(span1, t1);
    			if (if_block) if_block.m(span1, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.value) && t0_value !== (t0_value = ctx.value.hex().substr(1))) {
    				set_data(t0, t0_value);
    			}

    			if (ctx.open && !ctx.dragging) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.value) {
    				set_style(span1, "background", ctx.value.hex());
    				toggle_class(span1, "inverted", ctx.value.lab()[0]<50);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span1);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function click_handler_3() {
    	return false;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
        let { value = chroma('red') } = $$props;

        let open = false;
        let dragging = false;

        function toggleEditOpen() { $$invalidate('open', open = true); }
        function toggleEditClose() { $$invalidate('open', open = false); }

    	const writable_props = ['value'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Color> was created with unknown prop '${key}'`);
    	});

    	function dragstart_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler({ l }) {
    		const $$result = value = l;
    		$$invalidate('value', value);
    		return $$result;
    	}

    	function click_handler_1({ c }) {
    		const $$result = value = c;
    		$$invalidate('value', value);
    		return $$result;
    	}

    	function click_handler_2({ c }) {
    		const $$result = value = c;
    		$$invalidate('value', value);
    		return $$result;
    	}

    	function dragstart_handler_1(event) {
    		const $$result = dragging = true;
    		$$invalidate('dragging', dragging);
    		return $$result;
    	}

    	function dragend_handler(event) {
    		const $$result = dragging = false;
    		$$invalidate('dragging', dragging);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    	};

    	let lch, lightness, saturation, hue;

    	$$self.$$.update = ($$dirty = { value: 1, lch: 1 }) => {
    		if ($$dirty.value) { $$invalidate('lch', lch = value.lch()); }
    		if ($$dirty.lch) { $$invalidate('lightness', lightness = range(-5,6)
                    .map(l => lch[0] + Math.pow(l/8,2)*80*(l<0?-1:1))
                    .map(l => chroma.lch(l, lch[1], lch[2]))); }
    		if ($$dirty.lch) { $$invalidate('saturation', saturation = range(-5,6)
                    .map(s => Math.max(0, lch[1] + Math.pow(s/5,2)*80*(s<0?-1:1)))
                    .map(s => chroma.lch(lch[0], s, lch[2]))); }
    		if ($$dirty.lch) { $$invalidate('hue', hue = range(-5,6)
                    .map(h => lch[2] + Math.pow(h/5,2)*80*(h<0?-1:1))
                    .map(h => chroma.lch(lch[0], lch[1], h < 0 ? h + 360 : h > 360 ? h - 360 : h))); }
    	};

    	return {
    		value,
    		open,
    		dragging,
    		toggleEditOpen,
    		toggleEditClose,
    		lightness,
    		saturation,
    		hue,
    		dragstart_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		dragstart_handler_1,
    		dragend_handler
    	};
    }

    class Color extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["value"]);
    	}

    	get value() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ColorList.svelte generated by Svelte v3.5.3 */

    const file$2 = "src\\ColorList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.color = list[i];
    	child_ctx.each_value = list;
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (70:0) {#if !edit}
    function create_if_block$1(ctx) {
    	var div, t, span, current, dispose;

    	var each_value = ctx.colors;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			span = element("span");
    			attr(span, "class", "inv svelte-r8qk73");
    			add_location(span, file$2, 80, 4, 2080);
    			attr(div, "class", "form-control svelte-r8qk73");
    			add_location(div, file$2, 70, 0, 1751);

    			dispose = [
    				listen(div, "drop", prevent_default(ctx.drop_handler)),
    				listen(div, "dragover", prevent_default(ctx.dragover_handler)),
    				listen(div, "click", ctx.enterEditMode)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append(div, t);
    			append(div, span);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.colors) {
    				each_value = ctx.colors;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    }

    // (76:4) {#each colors as color,i}
    function create_each_block$1(ctx) {
    	var updating_value, current;

    	function color_value_binding(value) {
    		ctx.color_value_binding.call(null, value, ctx);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	function dragstart_handler(...args) {
    		return ctx.dragstart_handler(ctx, ...args);
    	}

    	let color_props = {};
    	if (ctx.color !== void 0) {
    		color_props.value = ctx.color;
    	}
    	var color = new Color({ props: color_props, $$inline: true });

    	add_binding_callback(() => bind(color, 'value', color_value_binding));
    	color.$on("dragstart", dragstart_handler);

    	return {
    		c: function create() {
    			color.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(color, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var color_changes = {};
    			if (!updating_value && changed.colors) {
    				color_changes.value = ctx.color;
    			}
    			color.$set(color_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(color.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(color.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(color, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var input_1, t, if_block_anchor, current, dispose;

    	var if_block = (!ctx.edit) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			input_1 = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(input_1, "type", "text");
    			attr(input_1, "class", "form-control svelte-r8qk73");
    			toggle_class(input_1, "hidden", !ctx.edit);
    			add_location(input_1, file$2, 68, 0, 1609);

    			dispose = [
    				listen(input_1, "input", ctx.input_1_input_handler),
    				listen(input_1, "blur", ctx.exitEditMode)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, input_1, anchor);

    			input_1.value = ctx.colorString;

    			add_binding_callback(() => ctx.input_1_binding(input_1, null));
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.colorString && (input_1.value !== ctx.colorString)) input_1.value = ctx.colorString;
    			if (changed.items) {
    				ctx.input_1_binding(null, input_1);
    				ctx.input_1_binding(input_1, null);
    			}

    			if (changed.edit) {
    				toggle_class(input_1, "hidden", !ctx.edit);
    			}

    			if (!ctx.edit) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
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
    			if (detaching) {
    				detach(input_1);
    			}

    			ctx.input_1_binding(null, input_1);

    			if (detaching) {
    				detach(t);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function dragstart(event, index) {
        event.dataTransfer.setData('index', index);
    }

    function dragover(event) {
        event.dataTransfer.dropEffect = 'move';
    }

    function findIndex(el) {
        const siblings = el.parentNode.children;
        for (let i=0; i<siblings.length; i++) {
            if (siblings[i] === el) return i;
        }
        return -1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

        let { colors } = $$props;
        let edit = false;
        let input;

        let colorString = '';

        function enterEditMode() {
            $$invalidate('edit', edit = true);
            $$invalidate('colorString', colorString = colors.map(c => c.name()).join(', '));
            input.focus();
        }

        function exitEditMode() {
            $$invalidate('edit', edit = false);
            $$invalidate('colors', colors = colorString
                .split(/\s*[,|\s]\s*/)
                .filter(c => chroma.valid(c))
                .map(c => chroma(c)));
        }

        function drop(event) {
            const index = event.dataTransfer.getData('index');
            const newIndex = findIndex(event.target);
            const col = colors.splice(index, 1, null)[0];
            colors.splice(newIndex, 0, col);
            $$invalidate('colors', colors = colors.filter(c => c !== null));
        }

    	const writable_props = ['colors'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ColorList> was created with unknown prop '${key}'`);
    	});

    	function input_1_input_handler() {
    		colorString = this.value;
    		$$invalidate('colorString', colorString);
    	}

    	function input_1_binding($$node, check) {
    		input = $$node;
    		$$invalidate('input', input);
    	}

    	function color_value_binding(value, { color, each_value, i }) {
    		each_value[i] = value;
    		$$invalidate('colors', colors);
    	}

    	function dragstart_handler({ i }, event) {
    		return dragstart(event, i);
    	}

    	function drop_handler(event) {
    		return drop(event);
    	}

    	function dragover_handler(event) {
    		return dragover(event);
    	}

    	$$self.$set = $$props => {
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    	};

    	return {
    		colors,
    		edit,
    		input,
    		colorString,
    		enterEditMode,
    		exitEditMode,
    		drop,
    		input_1_input_handler,
    		input_1_binding,
    		color_value_binding,
    		dragstart_handler,
    		drop_handler,
    		dragover_handler
    	};
    }

    class ColorList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["colors"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.colors === undefined && !('colors' in props)) {
    			console.warn("<ColorList> was created without expected prop 'colors'");
    		}
    	}

    	get colors() {
    		throw new Error("<ColorList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<ColorList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\InputColors.svelte generated by Svelte v3.5.3 */

    const file$3 = "src\\InputColors.svelte";

    // (16:4) {#if diverging}
    function create_if_block$2(ctx) {
    	var div, updating_colors, current;

    	function colorlist_colors_binding_1(value) {
    		ctx.colorlist_colors_binding_1.call(null, value);
    		updating_colors = true;
    		add_flush_callback(() => updating_colors = false);
    	}

    	let colorlist_props = {};
    	if (ctx.colors2 !== void 0) {
    		colorlist_props.colors = ctx.colors2;
    	}
    	var colorlist = new ColorList({ props: colorlist_props, $$inline: true });

    	add_binding_callback(() => bind(colorlist, 'colors', colorlist_colors_binding_1));

    	return {
    		c: function create() {
    			div = element("div");
    			colorlist.$$.fragment.c();
    			attr(div, "class", "col-md");
    			add_location(div, file$3, 16, 4, 306);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(colorlist, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var colorlist_changes = {};
    			if (!updating_colors && changed.colors2) {
    				colorlist_changes.colors = ctx.colors2;
    			}
    			colorlist.$set(colorlist_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorlist.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(colorlist.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(colorlist, );
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var div1, div0, updating_colors, t, current;

    	function colorlist_colors_binding(value) {
    		ctx.colorlist_colors_binding.call(null, value);
    		updating_colors = true;
    		add_flush_callback(() => updating_colors = false);
    	}

    	let colorlist_props = {};
    	if (ctx.colors !== void 0) {
    		colorlist_props.colors = ctx.colors;
    	}
    	var colorlist = new ColorList({ props: colorlist_props, $$inline: true });

    	add_binding_callback(() => bind(colorlist, 'colors', colorlist_colors_binding));

    	var if_block = (ctx.diverging) && create_if_block$2(ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			colorlist.$$.fragment.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr(div0, "class", "col-md");
    			add_location(div0, file$3, 12, 4, 212);
    			attr(div1, "class", "row");
    			add_location(div1, file$3, 11, 0, 189);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			mount_component(colorlist, div0, null);
    			append(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var colorlist_changes = {};
    			if (!updating_colors && changed.colors) {
    				colorlist_changes.colors = ctx.colors;
    			}
    			colorlist.$set(colorlist_changes);

    			if (ctx.diverging) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorlist.$$.fragment, local);

    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(colorlist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_component(colorlist, );

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { colors = [], colors2 = [], diverging = false } = $$props;

    	const writable_props = ['colors', 'colors2', 'diverging'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<InputColors> was created with unknown prop '${key}'`);
    	});

    	function colorlist_colors_binding(value) {
    		colors = value;
    		$$invalidate('colors', colors);
    	}

    	function colorlist_colors_binding_1(value) {
    		colors2 = value;
    		$$invalidate('colors2', colors2);
    	}

    	$$self.$set = $$props => {
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    		if ('colors2' in $$props) $$invalidate('colors2', colors2 = $$props.colors2);
    		if ('diverging' in $$props) $$invalidate('diverging', diverging = $$props.diverging);
    	};

    	return {
    		colors,
    		colors2,
    		diverging,
    		colorlist_colors_binding,
    		colorlist_colors_binding_1
    	};
    }

    class InputColors extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["colors", "colors2", "diverging"]);
    	}

    	get colors() {
    		throw new Error("<InputColors>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<InputColors>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors2() {
    		throw new Error("<InputColors>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors2(value) {
    		throw new Error("<InputColors>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get diverging() {
    		throw new Error("<InputColors>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set diverging(value) {
    		throw new Error("<InputColors>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* globals blinder */

    function colorBlindCheck(colors) {
        const types = ["deuteranopia", "protanopia", "tritanopia"];
        const invalid = [];
        for (let i = 0; i < types.length; i++) {
            if (!checkType(colors, types[i])) invalid.push(types[i]);
        }
        return invalid;
    }

    function colorBlindSim(color, type) {
        return blinder[type](chroma(color).hex());
    }

    function checkType(colors, type) {
        // let ok = 0;
        let notok = 0;
        let ratioThreshold = 5;
        let smallestPerceivableDistance = 9;
        let k = colors.length;
        if (!k) {
            // console.log('no colors', type);
            return true;
        }
        // compute distances between colors
        for (let a = 0; a < k; a++) {
            for (let b = a + 1; b < k; b++) {
                let colorA = chroma(colors[a]);
                let colorB = chroma(colors[b]);
                let distanceNorm = difference(colorA, colorB);
                if (distanceNorm < smallestPerceivableDistance) continue;
                let aSim = blinder[type](colorA.hex());
                let bSim = blinder[type](colorB.hex());
                let distanceSim = difference(aSim, bSim);
                let isNotOk =
                    distanceNorm / distanceSim > ratioThreshold &&
                    distanceSim < smallestPerceivableDistance;
                // count combinations that are problematic
                if (isNotOk) notok++;
                // else ok++;
            }
        }
        // console.log(type, notok/(ok+notok));
        // compute share of problematic colorss
        return notok === 0;
    }

    function difference(colorA, colorB) {
        return (
            0.5 * (chroma.deltaE(colorA, colorB) + chroma.deltaE(colorB, colorA))
        );
    }

    /* src\PalettePreview.svelte generated by Svelte v3.5.3 */

    const file$4 = "src\\PalettePreview.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.step = list[i];
    	return child_ctx;
    }

    // (79:4) {#each steps as step}
    function create_each_block$2(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "step svelte-qylrh0");
    			set_style(div, "background", (ctx.simulate === 'none' ? ctx.step : colorBlindSim(ctx.step, ctx.simulate)));
    			add_location(div, file$4, 79, 4, 2641);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.simulate || changed.steps || changed.colorBlindSim) {
    				set_style(div, "background", (ctx.simulate === 'none' ? ctx.step : colorBlindSim(ctx.step, ctx.simulate)));
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var div;

    	var each_value = ctx.steps;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", "palette svelte-qylrh0");
    			add_location(div, file$4, 77, 0, 2587);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.simulate || changed.steps || changed.colorBlindSim) {
    				each_value = ctx.steps;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

        let { colors = ['red'], colors2 = [], numColors = 7, diverging = false, bezier, correctLightness, simulate = 'none', steps } = $$props;

        function autoGradient(color, numColors) {
            const lab = chroma(color).lab();
            const lRange = 100 * (0.95 - 1/numColors);
            const lStep = lRange / (numColors-1);
            let lStart = (100-lRange)*0.5;
            const range$1 = range(lStart, lStart+numColors*lStep, lStep);
            let offset = 0;
            if (!diverging) {
                offset = 9999;
                for (let i=0; i < numColors; i++) {
                    let diff = lab[0] - range$1[i];
                    if (Math.abs(diff) < Math.abs(offset)) {
                        offset = diff;
                    }
                }
            }
            return range$1.map(l => chroma.lab([l + offset, lab[1], lab[2]]));
        }

        function autoColors(color, numColors, reverse=false) {
            if (diverging) {
                const colors = autoGradient(color, 3).concat(chroma('#f5f5f5'));
                if (reverse) colors.reverse();
                return colors;
            } else {
                return autoGradient(color, numColors);
            }
        }

    	const writable_props = ['colors', 'colors2', 'numColors', 'diverging', 'bezier', 'correctLightness', 'simulate', 'steps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PalettePreview> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    		if ('colors2' in $$props) $$invalidate('colors2', colors2 = $$props.colors2);
    		if ('numColors' in $$props) $$invalidate('numColors', numColors = $$props.numColors);
    		if ('diverging' in $$props) $$invalidate('diverging', diverging = $$props.diverging);
    		if ('bezier' in $$props) $$invalidate('bezier', bezier = $$props.bezier);
    		if ('correctLightness' in $$props) $$invalidate('correctLightness', correctLightness = $$props.correctLightness);
    		if ('simulate' in $$props) $$invalidate('simulate', simulate = $$props.simulate);
    		if ('steps' in $$props) $$invalidate('steps', steps = $$props.steps);
    	};

    	let even, numColorsLeft, numColorsRight, genColors, genColors2, stepsLeft, stepsRight;

    	$$self.$$.update = ($$dirty = { numColors: 1, diverging: 1, even: 1, colors: 1, numColorsLeft: 1, colors2: 1, numColorsRight: 1, bezier: 1, genColors: 1, correctLightness: 1, genColors2: 1, stepsLeft: 1, stepsRight: 1 }) => {
    		if ($$dirty.numColors) { $$invalidate('even', even = numColors % 2 === 0); }
    		if ($$dirty.diverging || $$dirty.numColors || $$dirty.even) { $$invalidate('numColorsLeft', numColorsLeft = diverging ? Math.ceil(numColors/2) + (even?1:0) : numColors); }
    		if ($$dirty.diverging || $$dirty.numColors || $$dirty.even) { $$invalidate('numColorsRight', numColorsRight = diverging ? Math.ceil(numColors/2) + (even?1:0) : 0); }
    		if ($$dirty.colors || $$dirty.numColorsLeft) { $$invalidate('genColors', genColors = colors.length !== 1 ? colors : autoColors(colors[0], numColorsLeft)); }
    		if ($$dirty.colors2 || $$dirty.numColorsRight) { $$invalidate('genColors2', genColors2 = colors2.length !== 1 ? colors2 : autoColors(colors2[0], numColorsRight, true)); }
    		if ($$dirty.colors || $$dirty.bezier || $$dirty.genColors || $$dirty.correctLightness || $$dirty.numColorsLeft) { $$invalidate('stepsLeft', stepsLeft = colors.length ? chroma.scale(bezier && colors.length>1 ? chroma.bezier(genColors) : genColors)
                    .correctLightness(correctLightness)
                    .colors(numColorsLeft) : []); }
    		if ($$dirty.diverging || $$dirty.colors2 || $$dirty.bezier || $$dirty.genColors2 || $$dirty.correctLightness || $$dirty.numColorsRight) { $$invalidate('stepsRight', stepsRight = diverging && colors2.length ? chroma.scale(bezier&& colors2.length>1 ? chroma.bezier(genColors2) : genColors2)
                    .correctLightness(correctLightness)
                    .colors(numColorsRight) : []); }
    		if ($$dirty.even || $$dirty.diverging || $$dirty.stepsLeft || $$dirty.stepsRight) { $$invalidate('steps', steps = (even && diverging ? stepsLeft.slice(0, stepsLeft.length-1) : stepsLeft).concat(stepsRight.slice(1))); }
    	};

    	return {
    		colors,
    		colors2,
    		numColors,
    		diverging,
    		bezier,
    		correctLightness,
    		simulate,
    		steps
    	};
    }

    class PalettePreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["colors", "colors2", "numColors", "diverging", "bezier", "correctLightness", "simulate", "steps"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.bezier === undefined && !('bezier' in props)) {
    			console.warn("<PalettePreview> was created without expected prop 'bezier'");
    		}
    		if (ctx.correctLightness === undefined && !('correctLightness' in props)) {
    			console.warn("<PalettePreview> was created without expected prop 'correctLightness'");
    		}
    		if (ctx.steps === undefined && !('steps' in props)) {
    			console.warn("<PalettePreview> was created without expected prop 'steps'");
    		}
    	}

    	get colors() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors2() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors2(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numColors() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numColors(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get diverging() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set diverging(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bezier() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bezier(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correctLightness() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctLightness(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simulate() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simulate(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get steps() {
    		throw new Error("<PalettePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set steps(value) {
    		throw new Error("<PalettePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Export.svelte generated by Svelte v3.5.3 */

    const file$5 = "src\\Export.svelte";

    function create_fragment$5(ctx) {
    	var pre0, t0, t1, pre1, t2, t3_value = ctx.steps.join(`', '`), t3, t4, t5, pre2, t6, t7_value = ctx.steps.join(`', '`), t7, t8, t9, pre3, t10_value = ctx.steps.join('\n'), t10, t11, pre4, t12, t13_value = ctx.steps.map(func).join(`,`), t13, t14, t15, pre5, t16, t17_value = ctx.steps.length, t17, t18, t19_value = ctx.steps.join(`', '`), t19, t20, t21_value = ctx.steps.slice(1).map(func_1), t21, t22;

    	return {
    		c: function create() {
    			pre0 = element("pre");
    			t0 = text(ctx.steps);
    			t1 = space();
    			pre1 = element("pre");
    			t2 = text("'");
    			t3 = text(t3_value);
    			t4 = text("'");
    			t5 = space();
    			pre2 = element("pre");
    			t6 = text("['");
    			t7 = text(t7_value);
    			t8 = text("']");
    			t9 = space();
    			pre3 = element("pre");
    			t10 = text(t10_value);
    			t11 = space();
    			pre4 = element("pre");
    			t12 = text("[");
    			t13 = text(t13_value);
    			t14 = text("]");
    			t15 = space();
    			pre5 = element("pre");
    			t16 = text("import { scaleThreshold } from 'd3-scale';\r\n\r\nfunction palette(min, max) {\r\n    const d = (max-min)/");
    			t17 = text(t17_value);
    			t18 = text(";\r\n    return = scaleThreshold()\r\n        .range(['");
    			t19 = text(t19_value);
    			t20 = text("'])\r\n        .domain([");
    			t21 = text(t21_value);
    			t22 = text("]);\r\n}");
    			attr(pre0, "class", "svelte-1rj5ek4");
    			add_location(pre0, file$5, 12, 0, 172);
    			attr(pre1, "class", "svelte-1rj5ek4");
    			add_location(pre1, file$5, 13, 0, 192);
    			attr(pre2, "class", "svelte-1rj5ek4");
    			add_location(pre2, file$5, 14, 0, 227);
    			attr(pre3, "class", "svelte-1rj5ek4");
    			add_location(pre3, file$5, 15, 0, 264);
    			attr(pre4, "class", "svelte-1rj5ek4");
    			add_location(pre4, file$5, 16, 0, 295);
    			attr(pre5, "class", "svelte-1rj5ek4");
    			add_location(pre5, file$5, 17, 0, 354);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, pre0, anchor);
    			append(pre0, t0);
    			insert(target, t1, anchor);
    			insert(target, pre1, anchor);
    			append(pre1, t2);
    			append(pre1, t3);
    			append(pre1, t4);
    			insert(target, t5, anchor);
    			insert(target, pre2, anchor);
    			append(pre2, t6);
    			append(pre2, t7);
    			append(pre2, t8);
    			insert(target, t9, anchor);
    			insert(target, pre3, anchor);
    			append(pre3, t10);
    			insert(target, t11, anchor);
    			insert(target, pre4, anchor);
    			append(pre4, t12);
    			append(pre4, t13);
    			append(pre4, t14);
    			insert(target, t15, anchor);
    			insert(target, pre5, anchor);
    			append(pre5, t16);
    			append(pre5, t17);
    			append(pre5, t18);
    			append(pre5, t19);
    			append(pre5, t20);
    			append(pre5, t21);
    			append(pre5, t22);
    		},

    		p: function update(changed, ctx) {
    			if (changed.steps) {
    				set_data(t0, ctx.steps);
    			}

    			if ((changed.steps) && t3_value !== (t3_value = ctx.steps.join(`', '`))) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.steps) && t7_value !== (t7_value = ctx.steps.join(`', '`))) {
    				set_data(t7, t7_value);
    			}

    			if ((changed.steps) && t10_value !== (t10_value = ctx.steps.join('\n'))) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.steps) && t13_value !== (t13_value = ctx.steps.map(func).join(`,`))) {
    				set_data(t13, t13_value);
    			}

    			if ((changed.steps) && t17_value !== (t17_value = ctx.steps.length)) {
    				set_data(t17, t17_value);
    			}

    			if ((changed.steps) && t19_value !== (t19_value = ctx.steps.join(`', '`))) {
    				set_data(t19, t19_value);
    			}

    			if ((changed.steps) && t21_value !== (t21_value = ctx.steps.slice(1).map(func_1))) {
    				set_data(t21, t21_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(pre0);
    				detach(t1);
    				detach(pre1);
    				detach(t5);
    				detach(pre2);
    				detach(t9);
    				detach(pre3);
    				detach(t11);
    				detach(pre4);
    				detach(t15);
    				detach(pre5);
    			}
    		}
    	};
    }

    function func(c) {
    	return '0x'+c.substr(1);
    }

    function func_1(v,i) {
    	return `min + d*${i+1}`;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { steps = [] } = $$props;

    	const writable_props = ['steps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Export> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('steps' in $$props) $$invalidate('steps', steps = $$props.steps);
    	};

    	return { steps };
    }

    class Export extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["steps"]);
    	}

    	get steps() {
    		throw new Error("<Export>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set steps(value) {
    		throw new Error("<Export>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);
    var bisectRight = ascendingBisect.right;

    function extent(values, valueof) {
      let min;
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
      return [min, max];
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        start = Math.floor(start * step);
        stop = Math.ceil(stop * step);
        ticks = new Array(n = Math.ceil(start - stop + 1));
        while (++i < n) ticks[i] = (start - i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color$1() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex3 = /^#([0-9a-f]{3})$/,
        reHex6 = /^#([0-9a-f]{6})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color$1, color, {
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: function() {
        return this.rgb().hex();
      },
      toString: function() {
        return this.rgb() + "";
      }
    });

    function color(format) {
      var m;
      format = (format + "").trim().toLowerCase();
      return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
          : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format])
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color$1)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color$1, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (0 <= this.r && this.r <= 255)
            && (0 <= this.g && this.g <= 255)
            && (0 <= this.b && this.b <= 255)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: function() {
        return "#" + hex(this.r) + hex(this.g) + hex(this.b);
      },
      toString: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "rgb(" : "rgba(")
            + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.b) || 0))
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color$1)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color$1, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var deg2rad = Math.PI / 180;
    var rad2deg = 180 / Math.PI;

    // https://beta.observablehq.com/@mbostock/lab-and-rgb
    var K = 18,
        Xn = 0.96422,
        Yn = 1,
        Zn = 0.82521,
        t0 = 4 / 29,
        t1 = 6 / 29,
        t2 = 3 * t1 * t1,
        t3 = t1 * t1 * t1;

    function labConvert(o) {
      if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
      if (o instanceof Hcl) {
        if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
        var h = o.h * deg2rad;
        return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
      }
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = rgb2lrgb(o.r),
          g = rgb2lrgb(o.g),
          b = rgb2lrgb(o.b),
          y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
      if (r === g && g === b) x = z = y; else {
        x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
        z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
      }
      return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
    }

    function lab(l, a, b, opacity) {
      return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
    }

    function Lab(l, a, b, opacity) {
      this.l = +l;
      this.a = +a;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Lab, lab, extend(Color$1, {
      brighter: function(k) {
        return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      darker: function(k) {
        return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      rgb: function() {
        var y = (this.l + 16) / 116,
            x = isNaN(this.a) ? y : y + this.a / 500,
            z = isNaN(this.b) ? y : y - this.b / 200;
        x = Xn * lab2xyz(x);
        y = Yn * lab2xyz(y);
        z = Zn * lab2xyz(z);
        return new Rgb(
          lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
          lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
          lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
          this.opacity
        );
      }
    }));

    function xyz2lab(t) {
      return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
    }

    function lab2xyz(t) {
      return t > t1 ? t * t * t : t2 * (t - t0);
    }

    function lrgb2rgb(x) {
      return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    }

    function rgb2lrgb(x) {
      return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }

    function hclConvert(o) {
      if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
      if (!(o instanceof Lab)) o = labConvert(o);
      if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0, o.l, o.opacity);
      var h = Math.atan2(o.b, o.a) * rad2deg;
      return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
    }

    function hcl(h, c, l, opacity) {
      return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
    }

    function Hcl(h, c, l, opacity) {
      this.h = +h;
      this.c = +c;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hcl, hcl, extend(Color$1, {
      brighter: function(k) {
        return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
      },
      darker: function(k) {
        return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
      },
      rgb: function() {
        return labConvert(this).rgb();
      }
    }));

    var A = -0.14861,
        B = +1.78277,
        C = -0.29227,
        D = -0.90649,
        E = +1.97294,
        ED = E * D,
        EB = E * B,
        BC_DA = B * C - D * A;

    function cubehelixConvert(o) {
      if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
          bl = b - l,
          k = (E * (g - l) - C * bl) / D,
          s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
          h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
      return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
    }

    function cubehelix(h, s, l, opacity) {
      return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
    }

    function Cubehelix(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Cubehelix, cubehelix, extend(Color$1, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
            l = +this.l,
            a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
            cosh = Math.cos(h),
            sinh = Math.sin(h);
        return new Rgb(
          255 * (l + a * (A * cosh + B * sinh)),
          255 * (l + a * (C * cosh + D * sinh)),
          255 * (l + a * (E * cosh)),
          this.opacity
        );
      }
    }));

    function constant(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function array(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b -= a, function(t) {
        return d.setTime(a + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b -= a, function(t) {
        return a + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolateValue(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolateValue(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : Array.isArray(b) ? array
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b -= a, function(t) {
        return Math.round(a + b * t);
      };
    }

    var degrees = 180 / Math.PI;

    var rho = Math.SQRT2;

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function number(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constant$1(isNaN(b) ? NaN : 0.5);
    }

    function clamper(domain) {
      var a = domain[0], b = domain[domain.length - 1], t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate = interpolateValue,
          transform,
          untransform,
          unknown,
          clamp = identity,
          piecewise,
          output,
          input;

      function rescale() {
        piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number), clamp === identity || (clamp = clamper(domain)), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? clamper(domain) : identity, scale) : clamp !== identity;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous(transform, untransform) {
      return transformer()(transform, untransform);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimal(1.23) returns ["123", 0].
    function formatDecimal(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      return new FormatSpecifier(specifier);
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      this.fill = match[1] || " ";
      this.align = match[2] || ">";
      this.sign = match[3] || "-";
      this.symbol = match[4] || "";
      this.zero = !!match[5];
      this.width = match[6] && +match[6];
      this.comma = !!match[7];
      this.precision = match[8] && +match[8].slice(1);
      this.trim = !!match[9];
      this.type = match[10] || "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width == null ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": function(x, p) { return (x * 100).toFixed(p); },
      "b": function(x) { return Math.round(x).toString(2); },
      "c": function(x) { return x + ""; },
      "d": function(x) { return Math.round(x).toString(10); },
      "e": function(x, p) { return x.toExponential(p); },
      "f": function(x, p) { return x.toFixed(p); },
      "g": function(x, p) { return x.toPrecision(p); },
      "o": function(x) { return Math.round(x).toString(8); },
      "p": function(x, p) { return formatRounded(x * 100, p); },
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
      "x": function(x) { return Math.round(x).toString(16); }
    };

    function identity$1(x) {
      return x;
    }

    var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$1,
          currency = locale.currency,
          decimal = locale.decimal,
          numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$1,
          percent = locale.percent || "%";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision == null && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision == null ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Perform the initial formatting.
            var valueNegative = value < 0;
            value = formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero during formatting, treat as positive.
            if (valueNegative && +value === 0) valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain(),
            i0 = 0,
            i1 = d.length - 1,
            start = d[i0],
            stop = d[i1],
            step;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }

        step = tickIncrement(start, stop, count);

        if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
          step = tickIncrement(start, stop, count);
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
          step = tickIncrement(start, stop, count);
        }

        if (step > 0) {
          d[i0] = Math.floor(start / step) * step;
          d[i1] = Math.ceil(stop / step) * step;
          domain(d);
        } else if (step < 0) {
          d[i0] = Math.ceil(start * step) / step;
          d[i1] = Math.floor(stop * step) / step;
          domain(d);
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous(identity, identity);

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    var t0$1 = new Date,
        t1$1 = new Date;

    function newInterval(floori, offseti, count, field) {

      function interval(date) {
        return floori(date = new Date(+date)), date;
      }

      interval.floor = interval;

      interval.ceil = function(date) {
        return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
      };

      interval.round = function(date) {
        var d0 = interval(date),
            d1 = interval.ceil(date);
        return date - d0 < d1 - date ? d0 : d1;
      };

      interval.offset = function(date, step) {
        return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
      };

      interval.range = function(start, stop, step) {
        var range = [], previous;
        start = interval.ceil(start);
        step = step == null ? 1 : Math.floor(step);
        if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
        do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
        while (previous < start && start < stop);
        return range;
      };

      interval.filter = function(test) {
        return newInterval(function(date) {
          if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
        }, function(date, step) {
          if (date >= date) {
            if (step < 0) while (++step <= 0) {
              while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
            } else while (--step >= 0) {
              while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
            }
          }
        });
      };

      if (count) {
        interval.count = function(start, end) {
          t0$1.setTime(+start), t1$1.setTime(+end);
          floori(t0$1), floori(t1$1);
          return Math.floor(count(t0$1, t1$1));
        };

        interval.every = function(step) {
          step = Math.floor(step);
          return !isFinite(step) || !(step > 0) ? null
              : !(step > 1) ? interval
              : interval.filter(field
                  ? function(d) { return field(d) % step === 0; }
                  : function(d) { return interval.count(0, d) % step === 0; });
        };
      }

      return interval;
    }

    var millisecond = newInterval(function() {
      // noop
    }, function(date, step) {
      date.setTime(+date + step);
    }, function(start, end) {
      return end - start;
    });

    // An optimized implementation for this simple case.
    millisecond.every = function(k) {
      k = Math.floor(k);
      if (!isFinite(k) || !(k > 0)) return null;
      if (!(k > 1)) return millisecond;
      return newInterval(function(date) {
        date.setTime(Math.floor(date / k) * k);
      }, function(date, step) {
        date.setTime(+date + step * k);
      }, function(start, end) {
        return (end - start) / k;
      });
    };

    var durationSecond = 1e3;
    var durationMinute = 6e4;
    var durationHour = 36e5;
    var durationDay = 864e5;
    var durationWeek = 6048e5;

    var second = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds());
    }, function(date, step) {
      date.setTime(+date + step * durationSecond);
    }, function(start, end) {
      return (end - start) / durationSecond;
    }, function(date) {
      return date.getUTCSeconds();
    });

    var minute = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getMinutes();
    });

    var hour = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getHours();
    });

    var day = newInterval(function(date) {
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
    }, function(date) {
      return date.getDate() - 1;
    });

    function weekday(i) {
      return newInterval(function(date) {
        date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setDate(date.getDate() + step * 7);
      }, function(start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      });
    }

    var sunday = weekday(0);
    var monday = weekday(1);
    var tuesday = weekday(2);
    var wednesday = weekday(3);
    var thursday = weekday(4);
    var friday = weekday(5);
    var saturday = weekday(6);

    var month = newInterval(function(date) {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setMonth(date.getMonth() + step);
    }, function(start, end) {
      return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
    }, function(date) {
      return date.getMonth();
    });

    var year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start, end) {
      return end.getFullYear() - start.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });

    // An optimized implementation for this simple case.
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };

    var utcMinute = newInterval(function(date) {
      date.setUTCSeconds(0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getUTCMinutes();
    });

    var utcHour = newInterval(function(date) {
      date.setUTCMinutes(0, 0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getUTCHours();
    });

    var utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start, end) {
      return (end - start) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });

    function utcWeekday(i) {
      return newInterval(function(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      }, function(start, end) {
        return (end - start) / durationWeek;
      });
    }

    var utcSunday = utcWeekday(0);
    var utcMonday = utcWeekday(1);
    var utcTuesday = utcWeekday(2);
    var utcWednesday = utcWeekday(3);
    var utcThursday = utcWeekday(4);
    var utcFriday = utcWeekday(5);
    var utcSaturday = utcWeekday(6);

    var utcMonth = newInterval(function(date) {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCMonth(date.getUTCMonth() + step);
    }, function(start, end) {
      return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
    }, function(date) {
      return date.getUTCMonth();
    });

    var utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });

    // An optimized implementation for this simple case.
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };

    function localDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
      }
      return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }

    function utcDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
      }
      return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }

    function newYear(y) {
      return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
    }

    function formatLocale$1(locale) {
      var locale_dateTime = locale.dateTime,
          locale_date = locale.date,
          locale_time = locale.time,
          locale_periods = locale.periods,
          locale_weekdays = locale.days,
          locale_shortWeekdays = locale.shortDays,
          locale_months = locale.months,
          locale_shortMonths = locale.shortMonths;

      var periodRe = formatRe(locale_periods),
          periodLookup = formatLookup(locale_periods),
          weekdayRe = formatRe(locale_weekdays),
          weekdayLookup = formatLookup(locale_weekdays),
          shortWeekdayRe = formatRe(locale_shortWeekdays),
          shortWeekdayLookup = formatLookup(locale_shortWeekdays),
          monthRe = formatRe(locale_months),
          monthLookup = formatLookup(locale_months),
          shortMonthRe = formatRe(locale_shortMonths),
          shortMonthLookup = formatLookup(locale_shortMonths);

      var formats = {
        "a": formatShortWeekday,
        "A": formatWeekday,
        "b": formatShortMonth,
        "B": formatMonth,
        "c": null,
        "d": formatDayOfMonth,
        "e": formatDayOfMonth,
        "f": formatMicroseconds,
        "H": formatHour24,
        "I": formatHour12,
        "j": formatDayOfYear,
        "L": formatMilliseconds,
        "m": formatMonthNumber,
        "M": formatMinutes,
        "p": formatPeriod,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatSeconds,
        "u": formatWeekdayNumberMonday,
        "U": formatWeekNumberSunday,
        "V": formatWeekNumberISO,
        "w": formatWeekdayNumberSunday,
        "W": formatWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatYear,
        "Y": formatFullYear,
        "Z": formatZone,
        "%": formatLiteralPercent
      };

      var utcFormats = {
        "a": formatUTCShortWeekday,
        "A": formatUTCWeekday,
        "b": formatUTCShortMonth,
        "B": formatUTCMonth,
        "c": null,
        "d": formatUTCDayOfMonth,
        "e": formatUTCDayOfMonth,
        "f": formatUTCMicroseconds,
        "H": formatUTCHour24,
        "I": formatUTCHour12,
        "j": formatUTCDayOfYear,
        "L": formatUTCMilliseconds,
        "m": formatUTCMonthNumber,
        "M": formatUTCMinutes,
        "p": formatUTCPeriod,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatUTCSeconds,
        "u": formatUTCWeekdayNumberMonday,
        "U": formatUTCWeekNumberSunday,
        "V": formatUTCWeekNumberISO,
        "w": formatUTCWeekdayNumberSunday,
        "W": formatUTCWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatUTCYear,
        "Y": formatUTCFullYear,
        "Z": formatUTCZone,
        "%": formatLiteralPercent
      };

      var parses = {
        "a": parseShortWeekday,
        "A": parseWeekday,
        "b": parseShortMonth,
        "B": parseMonth,
        "c": parseLocaleDateTime,
        "d": parseDayOfMonth,
        "e": parseDayOfMonth,
        "f": parseMicroseconds,
        "H": parseHour24,
        "I": parseHour24,
        "j": parseDayOfYear,
        "L": parseMilliseconds,
        "m": parseMonthNumber,
        "M": parseMinutes,
        "p": parsePeriod,
        "Q": parseUnixTimestamp,
        "s": parseUnixTimestampSeconds,
        "S": parseSeconds,
        "u": parseWeekdayNumberMonday,
        "U": parseWeekNumberSunday,
        "V": parseWeekNumberISO,
        "w": parseWeekdayNumberSunday,
        "W": parseWeekNumberMonday,
        "x": parseLocaleDate,
        "X": parseLocaleTime,
        "y": parseYear,
        "Y": parseFullYear,
        "Z": parseZone,
        "%": parseLiteralPercent
      };

      // These recursive directive definitions must be deferred.
      formats.x = newFormat(locale_date, formats);
      formats.X = newFormat(locale_time, formats);
      formats.c = newFormat(locale_dateTime, formats);
      utcFormats.x = newFormat(locale_date, utcFormats);
      utcFormats.X = newFormat(locale_time, utcFormats);
      utcFormats.c = newFormat(locale_dateTime, utcFormats);

      function newFormat(specifier, formats) {
        return function(date) {
          var string = [],
              i = -1,
              j = 0,
              n = specifier.length,
              c,
              pad,
              format;

          if (!(date instanceof Date)) date = new Date(+date);

          while (++i < n) {
            if (specifier.charCodeAt(i) === 37) {
              string.push(specifier.slice(j, i));
              if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
              else pad = c === "e" ? " " : "0";
              if (format = formats[c]) c = format(date, pad);
              string.push(c);
              j = i + 1;
            }
          }

          string.push(specifier.slice(j, i));
          return string.join("");
        };
      }

      function newParse(specifier, newDate) {
        return function(string) {
          var d = newYear(1900),
              i = parseSpecifier(d, specifier, string += "", 0),
              week, day$1;
          if (i != string.length) return null;

          // If a UNIX timestamp is specified, return it.
          if ("Q" in d) return new Date(d.Q);

          // The am-pm flag is 0 for AM, and 1 for PM.
          if ("p" in d) d.H = d.H % 12 + d.p * 12;

          // Convert day-of-week and week-of-year to day-of-year.
          if ("V" in d) {
            if (d.V < 1 || d.V > 53) return null;
            if (!("w" in d)) d.w = 1;
            if ("Z" in d) {
              week = utcDate(newYear(d.y)), day$1 = week.getUTCDay();
              week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
              week = utcDay.offset(week, (d.V - 1) * 7);
              d.y = week.getUTCFullYear();
              d.m = week.getUTCMonth();
              d.d = week.getUTCDate() + (d.w + 6) % 7;
            } else {
              week = newDate(newYear(d.y)), day$1 = week.getDay();
              week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
              week = day.offset(week, (d.V - 1) * 7);
              d.y = week.getFullYear();
              d.m = week.getMonth();
              d.d = week.getDate() + (d.w + 6) % 7;
            }
          } else if ("W" in d || "U" in d) {
            if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
            day$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
            d.m = 0;
            d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
          }

          // If a time zone is specified, all fields are interpreted as UTC and then
          // offset according to the specified time zone.
          if ("Z" in d) {
            d.H += d.Z / 100 | 0;
            d.M += d.Z % 100;
            return utcDate(d);
          }

          // Otherwise, all fields are in local time.
          return newDate(d);
        };
      }

      function parseSpecifier(d, specifier, string, j) {
        var i = 0,
            n = specifier.length,
            m = string.length,
            c,
            parse;

        while (i < n) {
          if (j >= m) return -1;
          c = specifier.charCodeAt(i++);
          if (c === 37) {
            c = specifier.charAt(i++);
            parse = parses[c in pads ? specifier.charAt(i++) : c];
            if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
          } else if (c != string.charCodeAt(j++)) {
            return -1;
          }
        }

        return j;
      }

      function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, locale_dateTime, string, i);
      }

      function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, locale_date, string, i);
      }

      function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, locale_time, string, i);
      }

      function formatShortWeekday(d) {
        return locale_shortWeekdays[d.getDay()];
      }

      function formatWeekday(d) {
        return locale_weekdays[d.getDay()];
      }

      function formatShortMonth(d) {
        return locale_shortMonths[d.getMonth()];
      }

      function formatMonth(d) {
        return locale_months[d.getMonth()];
      }

      function formatPeriod(d) {
        return locale_periods[+(d.getHours() >= 12)];
      }

      function formatUTCShortWeekday(d) {
        return locale_shortWeekdays[d.getUTCDay()];
      }

      function formatUTCWeekday(d) {
        return locale_weekdays[d.getUTCDay()];
      }

      function formatUTCShortMonth(d) {
        return locale_shortMonths[d.getUTCMonth()];
      }

      function formatUTCMonth(d) {
        return locale_months[d.getUTCMonth()];
      }

      function formatUTCPeriod(d) {
        return locale_periods[+(d.getUTCHours() >= 12)];
      }

      return {
        format: function(specifier) {
          var f = newFormat(specifier += "", formats);
          f.toString = function() { return specifier; };
          return f;
        },
        parse: function(specifier) {
          var p = newParse(specifier += "", localDate);
          p.toString = function() { return specifier; };
          return p;
        },
        utcFormat: function(specifier) {
          var f = newFormat(specifier += "", utcFormats);
          f.toString = function() { return specifier; };
          return f;
        },
        utcParse: function(specifier) {
          var p = newParse(specifier, utcDate);
          p.toString = function() { return specifier; };
          return p;
        }
      };
    }

    var pads = {"-": "", "_": " ", "0": "0"},
        numberRe = /^\s*\d+/, // note: ignores next directive
        percentRe = /^%/,
        requoteRe = /[\\^$*+?|[\]().{}]/g;

    function pad(value, fill, width) {
      var sign = value < 0 ? "-" : "",
          string = (sign ? -value : value) + "",
          length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }

    function requote(s) {
      return s.replace(requoteRe, "\\$&");
    }

    function formatRe(names) {
      return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
    }

    function formatLookup(names) {
      var map = {}, i = -1, n = names.length;
      while (++i < n) map[names[i].toLowerCase()] = i;
      return map;
    }

    function parseWeekdayNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.w = +n[0], i + n[0].length) : -1;
    }

    function parseWeekdayNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.u = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.U = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberISO(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.V = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.W = +n[0], i + n[0].length) : -1;
    }

    function parseFullYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 4));
      return n ? (d.y = +n[0], i + n[0].length) : -1;
    }

    function parseYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }

    function parseZone(d, string, i) {
      var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
      return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }

    function parseMonthNumber(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
    }

    function parseDayOfMonth(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.d = +n[0], i + n[0].length) : -1;
    }

    function parseDayOfYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }

    function parseHour24(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.H = +n[0], i + n[0].length) : -1;
    }

    function parseMinutes(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.M = +n[0], i + n[0].length) : -1;
    }

    function parseSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.S = +n[0], i + n[0].length) : -1;
    }

    function parseMilliseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.L = +n[0], i + n[0].length) : -1;
    }

    function parseMicroseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 6));
      return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
    }

    function parseLiteralPercent(d, string, i) {
      var n = percentRe.exec(string.slice(i, i + 1));
      return n ? i + n[0].length : -1;
    }

    function parseUnixTimestamp(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }

    function parseUnixTimestampSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
    }

    function formatDayOfMonth(d, p) {
      return pad(d.getDate(), p, 2);
    }

    function formatHour24(d, p) {
      return pad(d.getHours(), p, 2);
    }

    function formatHour12(d, p) {
      return pad(d.getHours() % 12 || 12, p, 2);
    }

    function formatDayOfYear(d, p) {
      return pad(1 + day.count(year(d), d), p, 3);
    }

    function formatMilliseconds(d, p) {
      return pad(d.getMilliseconds(), p, 3);
    }

    function formatMicroseconds(d, p) {
      return formatMilliseconds(d, p) + "000";
    }

    function formatMonthNumber(d, p) {
      return pad(d.getMonth() + 1, p, 2);
    }

    function formatMinutes(d, p) {
      return pad(d.getMinutes(), p, 2);
    }

    function formatSeconds(d, p) {
      return pad(d.getSeconds(), p, 2);
    }

    function formatWeekdayNumberMonday(d) {
      var day = d.getDay();
      return day === 0 ? 7 : day;
    }

    function formatWeekNumberSunday(d, p) {
      return pad(sunday.count(year(d), d), p, 2);
    }

    function formatWeekNumberISO(d, p) {
      var day = d.getDay();
      d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
      return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
    }

    function formatWeekdayNumberSunday(d) {
      return d.getDay();
    }

    function formatWeekNumberMonday(d, p) {
      return pad(monday.count(year(d), d), p, 2);
    }

    function formatYear(d, p) {
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatFullYear(d, p) {
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatZone(d) {
      var z = d.getTimezoneOffset();
      return (z > 0 ? "-" : (z *= -1, "+"))
          + pad(z / 60 | 0, "0", 2)
          + pad(z % 60, "0", 2);
    }

    function formatUTCDayOfMonth(d, p) {
      return pad(d.getUTCDate(), p, 2);
    }

    function formatUTCHour24(d, p) {
      return pad(d.getUTCHours(), p, 2);
    }

    function formatUTCHour12(d, p) {
      return pad(d.getUTCHours() % 12 || 12, p, 2);
    }

    function formatUTCDayOfYear(d, p) {
      return pad(1 + utcDay.count(utcYear(d), d), p, 3);
    }

    function formatUTCMilliseconds(d, p) {
      return pad(d.getUTCMilliseconds(), p, 3);
    }

    function formatUTCMicroseconds(d, p) {
      return formatUTCMilliseconds(d, p) + "000";
    }

    function formatUTCMonthNumber(d, p) {
      return pad(d.getUTCMonth() + 1, p, 2);
    }

    function formatUTCMinutes(d, p) {
      return pad(d.getUTCMinutes(), p, 2);
    }

    function formatUTCSeconds(d, p) {
      return pad(d.getUTCSeconds(), p, 2);
    }

    function formatUTCWeekdayNumberMonday(d) {
      var dow = d.getUTCDay();
      return dow === 0 ? 7 : dow;
    }

    function formatUTCWeekNumberSunday(d, p) {
      return pad(utcSunday.count(utcYear(d), d), p, 2);
    }

    function formatUTCWeekNumberISO(d, p) {
      var day = d.getUTCDay();
      d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
      return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
    }

    function formatUTCWeekdayNumberSunday(d) {
      return d.getUTCDay();
    }

    function formatUTCWeekNumberMonday(d, p) {
      return pad(utcMonday.count(utcYear(d), d), p, 2);
    }

    function formatUTCYear(d, p) {
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCFullYear(d, p) {
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCZone() {
      return "+0000";
    }

    function formatLiteralPercent() {
      return "%";
    }

    function formatUnixTimestamp(d) {
      return +d;
    }

    function formatUnixTimestampSeconds(d) {
      return Math.floor(+d / 1000);
    }

    var locale$1;
    var timeFormat;
    var timeParse;
    var utcFormat;
    var utcParse;

    defaultLocale$1({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });

    function defaultLocale$1(definition) {
      locale$1 = formatLocale$1(definition);
      timeFormat = locale$1.format;
      timeParse = locale$1.parse;
      utcFormat = locale$1.utcFormat;
      utcParse = locale$1.utcParse;
      return locale$1;
    }

    var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

    function formatIsoNative(date) {
      return date.toISOString();
    }

    var formatIso = Date.prototype.toISOString
        ? formatIsoNative
        : utcFormat(isoSpecifier);

    function parseIsoNative(string) {
      var date = new Date(string);
      return isNaN(date) ? null : date;
    }

    var parseIso = +new Date("2000-01-01T00:00:00.000Z")
        ? parseIsoNative
        : utcParse(isoSpecifier);

    var pi = Math.PI,
        tau = 2 * pi,
        epsilon = 1e-6,
        tauEpsilon = tau - epsilon;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau + tau;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    function constant$2(x) {
      return function constant() {
        return x;
      };
    }

    var pi$1 = Math.PI;

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // proceed
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    function line() {
      var x$1 = x,
          y$1 = y,
          defined = constant$2(true),
          context = null,
          curve = curveLinear,
          output = null;

      function line(data) {
        var i,
            n = data.length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$2(+_), line) : x$1;
      };

      line.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$2(+_), line) : y$1;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant$2(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

    function sign(x) {
      return x < 0 ? -1 : 1;
    }

    // Calculate the slopes of the tangents (Hermite-type interpolation) based on
    // the following paper: Steffen, M. 1990. A Simple Method for Monotonic
    // Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
    // NOV(II), P. 443, 1990.
    function slope3(that, x2, y2) {
      var h0 = that._x1 - that._x0,
          h1 = x2 - that._x1,
          s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
          s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
          p = (s0 * h1 + s1 * h0) / (h0 + h1);
      return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
    }

    // Calculate a one-sided slope.
    function slope2(that, t) {
      var h = that._x1 - that._x0;
      return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
    }

    // According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
    // "you can express cubic Hermite interpolation in terms of cubic Bézier curves
    // with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
    function point(that, t0, t1) {
      var x0 = that._x0,
          y0 = that._y0,
          x1 = that._x1,
          y1 = that._y1,
          dx = (x1 - x0) / 3;
      that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
    }

    function MonotoneX(context) {
      this._context = context;
    }

    MonotoneX.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 =
        this._y0 = this._y1 =
        this._t0 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 2: this._context.lineTo(this._x1, this._y1); break;
          case 3: point(this, this._t0, slope2(this, this._t0)); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        var t1 = NaN;

        x = +x, y = +y;
        if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; point(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
          default: point(this, this._t0, t1 = slope3(this, x, y)); break;
        }

        this._x0 = this._x1, this._x1 = x;
        this._y0 = this._y1, this._y1 = y;
        this._t0 = t1;
      }
    };

    function MonotoneY(context) {
      this._context = new ReflectContext(context);
    }

    (MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
      MonotoneX.prototype.point.call(this, y, x);
    };

    function ReflectContext(context) {
      this._context = context;
    }

    ReflectContext.prototype = {
      moveTo: function(x, y) { this._context.moveTo(y, x); },
      closePath: function() { this._context.closePath(); },
      lineTo: function(x, y) { this._context.lineTo(y, x); },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
    };

    function Step(context, t) {
      this._context = context;
      this._t = t;
    }

    Step.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x = this._y = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // proceed
          default: {
            if (this._t <= 0) {
              this._context.lineTo(this._x, y);
              this._context.lineTo(x, y);
            } else {
              var x1 = this._x * (1 - this._t) + x * this._t;
              this._context.lineTo(x1, this._y);
              this._context.lineTo(x1, y);
            }
            break;
          }
        }
        this._x = x, this._y = y;
      }
    };

    function stepAfter(context) {
      return new Step(context, 1);
    }

    /* src\StepChart.svelte generated by Svelte v3.5.3 */

    const file$6 = "src\\StepChart.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.y = list[i];
    	return child_ctx;
    }

    // (86:8) {#if values.length}
    function create_if_block$3(ctx) {
    	var line_1, line_1_x__value, line_1_x__value_1, line_1_y__value, line_1_y__value_1, path_1;

    	var each_value = ctx.yScale.ticks(6);

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			line_1 = svg_element("line");
    			path_1 = svg_element("path");
    			attr(line_1, "class", "direct svelte-1cvjt29");
    			attr(line_1, "x1", line_1_x__value = ctx.padding.left);
    			attr(line_1, "x2", line_1_x__value_1 = ctx.width-ctx.padding.right);
    			attr(line_1, "y1", line_1_y__value = ctx.yScale(ctx.values[0]));
    			attr(line_1, "y2", line_1_y__value_1 = ctx.yScale(ctx.values[ctx.values.length-1]));
    			add_location(line_1, file$6, 90, 12, 2254);
    			attr(path_1, "d", ctx.path);
    			attr(path_1, "class", "svelte-1cvjt29");
    			add_location(path_1, file$6, 96, 12, 2487);
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, line_1, anchor);
    			insert(target, path_1, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.padding || changed.width || changed.yScale) {
    				each_value = ctx.yScale.ticks(6);

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(line_1.parentNode, line_1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((changed.width) && line_1_x__value_1 !== (line_1_x__value_1 = ctx.width-ctx.padding.right)) {
    				attr(line_1, "x2", line_1_x__value_1);
    			}

    			if ((changed.yScale || changed.values) && line_1_y__value !== (line_1_y__value = ctx.yScale(ctx.values[0]))) {
    				attr(line_1, "y1", line_1_y__value);
    			}

    			if ((changed.yScale || changed.values) && line_1_y__value_1 !== (line_1_y__value_1 = ctx.yScale(ctx.values[ctx.values.length-1]))) {
    				attr(line_1, "y2", line_1_y__value_1);
    			}

    			if (changed.path) {
    				attr(path_1, "d", ctx.path);
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(line_1);
    				detach(path_1);
    			}
    		}
    	};
    }

    // (87:12) {#each yScale.ticks(6) as y}
    function create_each_block$3(ctx) {
    	var text_1, t_value = ctx.y, t, text_1_x_value, text_1_y_value, line_1, line_1_x__value, line_1_x__value_1, line_1_transform_value;

    	return {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			line_1 = svg_element("line");
    			attr(text_1, "x", text_1_x_value = ctx.padding.left-5);
    			attr(text_1, "y", text_1_y_value = ctx.yScale(ctx.y));
    			attr(text_1, "class", "svelte-1cvjt29");
    			add_location(text_1, file$6, 87, 12, 2060);
    			attr(line_1, "x1", line_1_x__value = ctx.padding.left);
    			attr(line_1, "x2", line_1_x__value_1 = ctx.width-ctx.padding.right);
    			attr(line_1, "transform", line_1_transform_value = "translate(0," + ctx.yScale(ctx.y) + ")");
    			attr(line_1, "class", "svelte-1cvjt29");
    			add_location(line_1, file$6, 88, 12, 2127);
    		},

    		m: function mount(target, anchor) {
    			insert(target, text_1, anchor);
    			append(text_1, t);
    			insert(target, line_1, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.yScale) && t_value !== (t_value = ctx.y)) {
    				set_data(t, t_value);
    			}

    			if ((changed.yScale) && text_1_y_value !== (text_1_y_value = ctx.yScale(ctx.y))) {
    				attr(text_1, "y", text_1_y_value);
    			}

    			if ((changed.width) && line_1_x__value_1 !== (line_1_x__value_1 = ctx.width-ctx.padding.right)) {
    				attr(line_1, "x2", line_1_x__value_1);
    			}

    			if ((changed.yScale) && line_1_transform_value !== (line_1_transform_value = "translate(0," + ctx.yScale(ctx.y) + ")")) {
    				attr(line_1, "transform", line_1_transform_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(text_1);
    				detach(line_1);
    			}
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var div_1, h4, t0, t1, svg, svg_height_value, div_1_resize_listener;

    	var if_block = (ctx.values.length) && create_if_block$3(ctx);

    	return {
    		c: function create() {
    			div_1 = element("div");
    			h4 = element("h4");
    			t0 = text(ctx.title);
    			t1 = space();
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			attr(h4, "class", "svelte-1cvjt29");
    			add_location(h4, file$6, 83, 4, 1926);
    			attr(svg, "height", svg_height_value = ctx.height || 50);
    			attr(svg, "class", "svelte-1cvjt29");
    			add_location(svg, file$6, 84, 4, 1948);
    			add_render_callback(() => ctx.div_1_resize_handler.call(div_1));
    			set_style(div_1, "margin-top", "1em");
    			add_location(div_1, file$6, 82, 0, 1866);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div_1, anchor);
    			append(div_1, h4);
    			append(h4, t0);
    			append(div_1, t1);
    			append(div_1, svg);
    			if (if_block) if_block.m(svg, null);
    			div_1_resize_listener = add_resize_listener(div_1, ctx.div_1_resize_handler.bind(div_1));
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data(t0, ctx.title);
    			}

    			if (ctx.values.length) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(svg, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.height) && svg_height_value !== (svg_height_value = ctx.height || 50)) {
    				attr(svg, "height", svg_height_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div_1);
    			}

    			if (if_block) if_block.d();
    			div_1_resize_listener.cancel();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
        let width;
        let { title = '' } = $$props;

        const padding = {
            left: 30,
            right: 10,
            top: 20,
            bottom: 20
        };

        let { steps = [], mode = 0 } = $$props;
        let yDomain;

    	const writable_props = ['title', 'steps', 'mode'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<StepChart> was created with unknown prop '${key}'`);
    	});

    	function div_1_resize_handler() {
    		width = this.clientWidth;
    		$$invalidate('width', width);
    	}

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('steps' in $$props) $$invalidate('steps', steps = $$props.steps);
    		if ('mode' in $$props) $$invalidate('mode', mode = $$props.mode);
    	};

    	let height, values, values2, xScale, minDomain, yScale, y0, y1, lineGen, path;

    	$$self.$$.update = ($$dirty = { width: 1, steps: 1, mode: 1, values: 1, yDomain: 1, minDomain: 1, height: 1, yScale: 1, xScale: 1, lineGen: 1, values2: 1 }) => {
    		if ($$dirty.width) { $$invalidate('height', height = width * 0.7); }
    		if ($$dirty.steps || $$dirty.mode) { $$invalidate('values', values = steps.map(c => chroma(c).lch()[mode]).map(mode === 2 ? h=>h: d=>d)); }
    		if ($$dirty.values) { $$invalidate('values2', values2 = values.concat(values[values.length-1])); }
    		if ($$dirty.steps || $$dirty.width) { $$invalidate('xScale', xScale = linear$1()
                    .domain([0, steps.length])
                    .range([padding.left, width - padding.right])); }
    		if ($$dirty.mode) { $$invalidate('minDomain', minDomain = mode === 1 ? 80 : 50); }
    		if ($$dirty.values || $$dirty.yDomain || $$dirty.minDomain) { {
                    $$invalidate('yDomain', yDomain = extent(values));
                    let diff = Math.abs(yDomain[1] - yDomain[0]);
                    if (diff < minDomain) {
                        yDomain[0] -= (minDomain-diff)*0.5; $$invalidate('yDomain', yDomain), $$invalidate('values', values), $$invalidate('minDomain', minDomain), $$invalidate('steps', steps), $$invalidate('mode', mode);
                        yDomain[1] += (minDomain-diff)*0.5; $$invalidate('yDomain', yDomain), $$invalidate('values', values), $$invalidate('minDomain', minDomain), $$invalidate('steps', steps), $$invalidate('mode', mode);
                        $$invalidate('yDomain', yDomain), $$invalidate('values', values), $$invalidate('minDomain', minDomain), $$invalidate('steps', steps), $$invalidate('mode', mode);
                    }
                } }
    		if ($$dirty.yDomain || $$dirty.height) { $$invalidate('yScale', yScale = linear$1()
                    .domain(yDomain)
                    .nice()
                    .rangeRound([height - padding.bottom, padding.top])); }
    		if ($$dirty.yScale) { y0 = yScale.domain()[0]; }
    		if ($$dirty.yScale) { y1 = yScale.domain()[1]; }
    		if ($$dirty.xScale || $$dirty.yScale) { $$invalidate('lineGen', lineGen = line().x((v,i) => xScale(i)).y(yScale).curve(stepAfter)); }
    		if ($$dirty.lineGen || $$dirty.values2) { $$invalidate('path', path = lineGen(values2)); }
    	};

    	return {
    		width,
    		title,
    		padding,
    		steps,
    		mode,
    		height,
    		values,
    		yScale,
    		path,
    		div_1_resize_handler
    	};
    }

    class StepChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["title", "steps", "mode"]);
    	}

    	get title() {
    		throw new Error("<StepChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<StepChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get steps() {
    		throw new Error("<StepChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set steps(value) {
    		throw new Error("<StepChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<StepChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<StepChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Card.svelte generated by Svelte v3.5.3 */

    const file$7 = "src\\Card.svelte";

    // (27:25) {#if step}
    function create_if_block$4(ctx) {
    	var span, t;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.step);
    			attr(span, "class", "step rounded-circle svelte-ruts6u");
    			add_location(span, file$7, 26, 35, 556);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.step) {
    				set_data(t, ctx.step);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var div1, div0, h5, t0, t1, current;

    	var if_block = (ctx.step) && create_if_block$4(ctx);

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			if (if_block) if_block.c();
    			t0 = text(ctx.title);
    			t1 = space();

    			if (default_slot) default_slot.c();
    			attr(h5, "class", "card-title svelte-ruts6u");
    			add_location(h5, file$7, 26, 2, 523);

    			attr(div0, "class", "card-body svelte-ruts6u");
    			add_location(div0, file$7, 25, 1, 496);
    			attr(div1, "class", "card shadow-sm svelte-ruts6u");
    			toggle_class(div1, "rounded-0", ctx.noBorderTop);
    			toggle_class(div1, "border-top-0", ctx.noBorderTop);
    			add_location(div1, file$7, 24, 0, 402);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h5);
    			if (if_block) if_block.m(h5, null);
    			append(h5, t0);
    			append(div0, t1);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.step) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(h5, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || changed.title) {
    				set_data(t0, ctx.title);
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (changed.noBorderTop) {
    				toggle_class(div1, "rounded-0", ctx.noBorderTop);
    				toggle_class(div1, "border-top-0", ctx.noBorderTop);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (if_block) if_block.d();

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { title = '', step = '', noBorderTop = false } = $$props;

    	const writable_props = ['title', 'step', 'noBorderTop'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('noBorderTop' in $$props) $$invalidate('noBorderTop', noBorderTop = $$props.noBorderTop);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		title,
    		step,
    		noBorderTop,
    		$$slots,
    		$$scope
    	};
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["title", "step", "noBorderTop"]);
    	}

    	get title() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noBorderTop() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noBorderTop(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\fa-svelte\src\Icon.html generated by Svelte v3.5.3 */

    const file$8 = "node_modules\\fa-svelte\\src\\Icon.html";

    function create_fragment$8(ctx) {
    	var svg, path_1;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			attr(path_1, "fill", "currentColor");
    			attr(path_1, "d", ctx.path);
    			add_location(path_1, file$8, 7, 2, 129);
    			attr(svg, "aria-hidden", "true");
    			attr(svg, "class", "" + ctx.classes + " svelte-p8vizn");
    			attr(svg, "role", "img");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", ctx.viewBox);
    			add_location(svg, file$8, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path_1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.path) {
    				attr(path_1, "d", ctx.path);
    			}

    			if (changed.classes) {
    				attr(svg, "class", "" + ctx.classes + " svelte-p8vizn");
    			}

    			if (changed.viewBox) {
    				attr(svg, "viewBox", ctx.viewBox);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { icon } = $$props;

      let path = [];
      let classes = "";
      let viewBox = "";

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('icon' in $$props) $$invalidate('icon', icon = $$props.icon);
    	};

    	$$self.$$.update = ($$dirty = { icon: 1, $$props: 1 }) => {
    		if ($$dirty.icon) { $$invalidate('viewBox', viewBox = "0 0 " + icon.icon[0] + " " + icon.icon[1]); }
    		$$invalidate('classes', classes = "fa-svelte " + ($$props.class ? $$props.class : ""));
    		if ($$dirty.icon) { $$invalidate('path', path = icon.icon[4]); }
    	};

    	return {
    		icon,
    		path,
    		classes,
    		viewBox,
    		$$props: $$props = exclude_internal_props($$props)
    	};
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["icon"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.icon === undefined && !('icon' in props)) {
    			console.warn("<Icon> was created without expected prop 'icon'");
    		}
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var faCheck = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'check';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f00c';
    var svgPathData = 'M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z';

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

    exports.faCheck = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faCheck);
    var faCheck_1 = faCheck.definition;
    var faCheck_2 = faCheck.faCheck;
    var faCheck_3 = faCheck.prefix;
    var faCheck_4 = faCheck.iconName;
    var faCheck_5 = faCheck.width;
    var faCheck_6 = faCheck.height;
    var faCheck_7 = faCheck.ligatures;
    var faCheck_8 = faCheck.unicode;
    var faCheck_9 = faCheck.svgPathData;

    var faExclamationTriangle = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'exclamation-triangle';
    var width = 576;
    var height = 512;
    var ligatures = [];
    var unicode = 'f071';
    var svgPathData = 'M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z';

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

    exports.faExclamationTriangle = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faExclamationTriangle);
    var faExclamationTriangle_1 = faExclamationTriangle.definition;
    var faExclamationTriangle_2 = faExclamationTriangle.faExclamationTriangle;
    var faExclamationTriangle_3 = faExclamationTriangle.prefix;
    var faExclamationTriangle_4 = faExclamationTriangle.iconName;
    var faExclamationTriangle_5 = faExclamationTriangle.width;
    var faExclamationTriangle_6 = faExclamationTriangle.height;
    var faExclamationTriangle_7 = faExclamationTriangle.ligatures;
    var faExclamationTriangle_8 = faExclamationTriangle.unicode;
    var faExclamationTriangle_9 = faExclamationTriangle.svgPathData;

    /* src\ColorBlindCheck.svelte generated by Svelte v3.5.3 */

    const file$9 = "src\\ColorBlindCheck.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.type = list[i];
    	return child_ctx;
    }

    // (46:4) {:else}
    function create_else_block(ctx) {
    	var p, t, current;

    	var icon = new Icon({
    		props: { icon: faCheck_2 },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			p = element("p");
    			icon.$$.fragment.c();
    			t = text(" This palette is colorblind-safe.");
    			attr(p, "class", "res text-secondary svelte-ylsdbc");
    			add_location(p, file$9, 46, 4, 1072);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			mount_component(icon, p, null);
    			append(p, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var icon_changes = {};
    			if (changed.faCheck) icon_changes.icon = faCheck_2;
    			icon.$set(icon_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}

    			destroy_component(icon, );
    		}
    	};
    }

    // (44:4) {#if result.length}
    function create_if_block$5(ctx) {
    	var p, t, current;

    	var icon = new Icon({
    		props: { icon: faExclamationTriangle_2 },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			p = element("p");
    			icon.$$.fragment.c();
    			t = text(" This palette is not colorblind-safe.");
    			attr(p, "class", "res text-danger svelte-ylsdbc");
    			add_location(p, file$9, 44, 4, 948);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			mount_component(icon, p, null);
    			append(p, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var icon_changes = {};
    			if (changed.faExclamationTriangle) icon_changes.icon = faExclamationTriangle_2;
    			icon.$set(icon_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}

    			destroy_component(icon, );
    		}
    	};
    }

    // (52:12) {#each types as type}
    function create_each_block$4(ctx) {
    	var label, input, input_value_value, input_checked_value, t0_value = ctx.type === 'none' ? 'normal' : ctx.type.substr(0,4)+'.', t0, t1, dispose;

    	return {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = text(t0_value);
    			t1 = space();
    			ctx.$$binding_groups[0].push(input);
    			input.__value = input_value_value = ctx.type;
    			input.value = input.__value;
    			attr(input, "type", "radio");
    			attr(input, "name", "options");
    			attr(input, "id", "option1");
    			attr(input, "autocomplete", "off");
    			input.checked = input_checked_value = ctx.active===ctx.type;
    			add_location(input, file$9, 55, 16, 1549);
    			attr(label, "class", "btn btn-sm btn-outline-secondary");
    			toggle_class(label, "btn-outline-danger", ctx.result.indexOf(ctx.type) > -1);
    			toggle_class(label, "active", ctx.active===ctx.type);
    			add_location(label, file$9, 52, 12, 1365);
    			dispose = listen(input, "change", ctx.input_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, label, anchor);
    			append(label, input);

    			input.checked = input.__value === ctx.active;

    			append(label, t0);
    			append(label, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.active) input.checked = input.__value === ctx.active;
    			input.value = input.__value;

    			if ((changed.active) && input_checked_value !== (input_checked_value = ctx.active===ctx.type)) {
    				input.checked = input_checked_value;
    			}

    			if ((changed.result || changed.types)) {
    				toggle_class(label, "btn-outline-danger", ctx.result.indexOf(ctx.type) > -1);
    			}

    			if ((changed.active || changed.types)) {
    				toggle_class(label, "active", ctx.active===ctx.type);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(label);
    			}

    			ctx.$$binding_groups[0].splice(ctx.$$binding_groups[0].indexOf(input), 1);
    			dispose();
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var div3, current_block_type_index, if_block, t0, div2, div0, t2, div1, current;

    	var if_block_creators = [
    		create_if_block$5,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.result.length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	var each_value = ctx.types;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div3 = element("div");
    			if_block.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "simulate:";
    			t2 = space();
    			div1 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", "text-muted svelte-ylsdbc");
    			add_location(div0, file$9, 49, 8, 1205);
    			attr(div1, "class", "btn-group btn-group-toggle");
    			div1.dataset.toggle = "buttons";
    			add_location(div1, file$9, 50, 8, 1254);
    			attr(div2, "class", "c1 svelte-ylsdbc");
    			add_location(div2, file$9, 48, 4, 1179);
    			attr(div3, "class", "colorblind-sim svelte-ylsdbc");
    			add_location(div3, file$9, 42, 0, 889);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			if_blocks[current_block_type_index].m(div3, null);
    			append(div3, t0);
    			append(div3, div2);
    			append(div2, div0);
    			append(div2, t2);
    			append(div2, div1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div3, t0);
    			}

    			if (changed.result || changed.types || changed.active) {
    				each_value = ctx.types;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
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
    			if (detaching) {
    				detach(div3);
    			}

    			if_blocks[current_block_type_index].d();

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

        let { colors = [], result = [], active = 'none' } = $$props;

        const types = ['none', 'deuteranopia', 'protanopia', 'tritanopia'];

    	const writable_props = ['colors', 'result', 'active'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ColorBlindCheck> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		active = this.__value;
    		$$invalidate('active', active);
    	}

    	$$self.$set = $$props => {
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    		if ('result' in $$props) $$invalidate('result', result = $$props.result);
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    	};

    	$$self.$$.update = ($$dirty = { colors: 1 }) => {
    		if ($$dirty.colors) { $$invalidate('result', result = colorBlindCheck(colors)); }
    	};

    	return {
    		colors,
    		result,
    		active,
    		types,
    		input_change_handler,
    		$$binding_groups
    	};
    }

    class ColorBlindCheck extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["colors", "result", "active"]);
    	}

    	get colors() {
    		throw new Error("<ColorBlindCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<ColorBlindCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get result() {
    		throw new Error("<ColorBlindCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set result(value) {
    		throw new Error("<ColorBlindCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ColorBlindCheck>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ColorBlindCheck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ButtonGroup.svelte generated by Svelte v3.5.3 */

    const file$a = "src\\ButtonGroup.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.option = list[i];
    	return child_ctx;
    }

    // (20:4) {#each options2 as option}
    function create_each_block$5(ctx) {
    	var label_1, input, input_value_value, input_checked_value, t0_value = ctx.option.title, t0, t1, dispose;

    	return {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t0 = text(t0_value);
    			t1 = space();
    			ctx.$$binding_groups[0].push(input);
    			input.__value = input_value_value = ctx.option.value;
    			input.value = input.__value;
    			attr(input, "type", "radio");
    			attr(input, "name", "options");
    			attr(input, "id", ctx.id);
    			attr(input, "autocomplete", "off");
    			input.checked = input_checked_value = ctx.value===ctx.option.value;
    			add_location(input, file$a, 22, 8, 552);
    			attr(label_1, "class", "btn btn-outline-secondary");
    			toggle_class(label_1, "active", ctx.value===ctx.option.value);
    			add_location(label_1, file$a, 20, 4, 456);
    			dispose = listen(input, "change", ctx.input_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, label_1, anchor);
    			append(label_1, input);

    			input.checked = input.__value === ctx.value;

    			append(label_1, t0);
    			append(label_1, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.value) input.checked = input.__value === ctx.value;

    			if ((changed.options2) && input_value_value !== (input_value_value = ctx.option.value)) {
    				input.__value = input_value_value;
    			}

    			input.value = input.__value;

    			if ((changed.value || changed.options2) && input_checked_value !== (input_checked_value = ctx.value===ctx.option.value)) {
    				input.checked = input_checked_value;
    			}

    			if ((changed.options2) && t0_value !== (t0_value = ctx.option.title)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.value || changed.options2)) {
    				toggle_class(label_1, "active", ctx.value===ctx.option.value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(label_1);
    			}

    			ctx.$$binding_groups[0].splice(ctx.$$binding_groups[0].indexOf(input), 1);
    			dispose();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var div;

    	var each_value = ctx.options2;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", "btn-group btn-group-toggle svelte-t0e0bc");
    			div.dataset.toggle = "buttons";
    			add_location(div, file$a, 18, 0, 356);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.value || changed.options2 || changed.id) {
    				each_value = ctx.options2;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { options = [] } = $$props;
    	let { value, label = '' } = $$props;
    	const id = Math.round(Math.random()*1e7).toString(36);

    	const writable_props = ['options', 'value', 'label'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ButtonGroup> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		value = this.__value;
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    	};

    	let options2;

    	$$self.$$.update = ($$dirty = { options: 1 }) => {
    		if ($$dirty.options) { $$invalidate('options2', options2 = options.map(s => typeof s === 'string' ? {value:s, title:s} : s)); }
    	};

    	return {
    		options,
    		value,
    		label,
    		id,
    		options2,
    		input_change_handler,
    		$$binding_groups
    	};
    }

    class ButtonGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["options", "value", "label"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.value === undefined && !('value' in props)) {
    			console.warn("<ButtonGroup> was created without expected prop 'value'");
    		}
    	}

    	get options() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<ButtonGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<ButtonGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.5.3 */

    const file$b = "src\\App.svelte";

    // (141:4) <Card step="1" title="What kind of palette do you want to create?">
    function create_default_slot_3(ctx) {
    	var div2, div0, t0, updating_value, t1, div1, t2, input, current, dispose;

    	function buttongroup_value_binding(value) {
    		ctx.buttongroup_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let buttongroup_props = { options: ['sequential', 'diverging'] };
    	if (ctx.mode !== void 0) {
    		buttongroup_props.value = ctx.mode;
    	}
    	var buttongroup = new ButtonGroup({ props: buttongroup_props, $$inline: true });

    	add_binding_callback(() => bind(buttongroup, 'value', buttongroup_value_binding));

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Palette type:\r\n                ");
    			buttongroup.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Number of colors: ");
    			input = element("input");
    			attr(div0, "class", "col-md");
    			add_location(div0, file$b, 142, 12, 4441);
    			attr(input, "type", "number");
    			attr(input, "min", "2");
    			attr(input, "class", "svelte-1cvo05r");
    			add_location(input, file$b, 147, 34, 4673);
    			attr(div1, "class", "col-md");
    			add_location(div1, file$b, 146, 12, 4617);
    			attr(div2, "class", "row");
    			add_location(div2, file$b, 141, 8, 4410);
    			dispose = listen(input, "input", ctx.input_input_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, t0);
    			mount_component(buttongroup, div0, null);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, t2);
    			append(div1, input);

    			input.value = ctx.numColors;

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var buttongroup_changes = {};
    			if (!updating_value && changed.mode) {
    				buttongroup_changes.value = ctx.mode;
    			}
    			buttongroup.$set(buttongroup_changes);

    			if (changed.numColors) input.value = ctx.numColors;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttongroup.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(buttongroup.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_component(buttongroup, );

    			dispose();
    		}
    	};
    }

    // (153:4) <Card step="2" title="Select and arrange input colors">
    function create_default_slot_2(ctx) {
    	var updating_colors, updating_colors2, current;

    	function inputcolors_colors_binding(value) {
    		ctx.inputcolors_colors_binding.call(null, value);
    		updating_colors = true;
    		add_flush_callback(() => updating_colors = false);
    	}

    	function inputcolors_colors2_binding(value_1) {
    		ctx.inputcolors_colors2_binding.call(null, value_1);
    		updating_colors2 = true;
    		add_flush_callback(() => updating_colors2 = false);
    	}

    	let inputcolors_props = { diverging: ctx.mode==='diverging' };
    	if (ctx.colors !== void 0) {
    		inputcolors_props.colors = ctx.colors;
    	}
    	if (ctx.colors2 !== void 0) {
    		inputcolors_props.colors2 = ctx.colors2;
    	}
    	var inputcolors = new InputColors({ props: inputcolors_props, $$inline: true });

    	add_binding_callback(() => bind(inputcolors, 'colors', inputcolors_colors_binding));
    	add_binding_callback(() => bind(inputcolors, 'colors2', inputcolors_colors2_binding));

    	return {
    		c: function create() {
    			inputcolors.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(inputcolors, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var inputcolors_changes = {};
    			if (changed.mode) inputcolors_changes.diverging = ctx.mode==='diverging';
    			if (!updating_colors && changed.colors) {
    				inputcolors_changes.colors = ctx.colors;
    			}
    			if (!updating_colors2 && changed.colors2) {
    				inputcolors_changes.colors2 = ctx.colors2;
    			}
    			inputcolors.$set(inputcolors_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputcolors.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(inputcolors.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(inputcolors, detaching);
    		}
    	};
    }

    // (157:4) <Card step="3" title="Check and configure the resulting palette">
    function create_default_slot_1(ctx) {
    	var div2, div0, updating_value, t0, updating_value_1, t1, div1, updating_colors, updating_active, t2, updating_steps, updating_correctLightness, updating_bezier, updating_colors_1, updating_colors2, updating_numColors, t3, div6, div3, t4, div4, t5, div5, current;

    	function checkbox0_value_binding(value) {
    		ctx.checkbox0_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let checkbox0_props = { label: "correct lightness" };
    	if (ctx.correctLightness !== void 0) {
    		checkbox0_props.value = ctx.correctLightness;
    	}
    	var checkbox0 = new Checkbox({ props: checkbox0_props, $$inline: true });

    	add_binding_callback(() => bind(checkbox0, 'value', checkbox0_value_binding));

    	function checkbox1_value_binding(value_1) {
    		ctx.checkbox1_value_binding.call(null, value_1);
    		updating_value_1 = true;
    		add_flush_callback(() => updating_value_1 = false);
    	}

    	let checkbox1_props = { label: "bezier interpolation" };
    	if (ctx.bezier !== void 0) {
    		checkbox1_props.value = ctx.bezier;
    	}
    	var checkbox1 = new Checkbox({ props: checkbox1_props, $$inline: true });

    	add_binding_callback(() => bind(checkbox1, 'value', checkbox1_value_binding));

    	function colorblindcheck_colors_binding(value_2) {
    		ctx.colorblindcheck_colors_binding.call(null, value_2);
    		updating_colors = true;
    		add_flush_callback(() => updating_colors = false);
    	}

    	function colorblindcheck_active_binding(value_3) {
    		ctx.colorblindcheck_active_binding.call(null, value_3);
    		updating_active = true;
    		add_flush_callback(() => updating_active = false);
    	}

    	let colorblindcheck_props = {};
    	if (ctx.steps !== void 0) {
    		colorblindcheck_props.colors = ctx.steps;
    	}
    	if (ctx.simulate !== void 0) {
    		colorblindcheck_props.active = ctx.simulate;
    	}
    	var colorblindcheck = new ColorBlindCheck({
    		props: colorblindcheck_props,
    		$$inline: true
    	});

    	add_binding_callback(() => bind(colorblindcheck, 'colors', colorblindcheck_colors_binding));
    	add_binding_callback(() => bind(colorblindcheck, 'active', colorblindcheck_active_binding));

    	function palettepreview_steps_binding(value_4) {
    		ctx.palettepreview_steps_binding.call(null, value_4);
    		updating_steps = true;
    		add_flush_callback(() => updating_steps = false);
    	}

    	function palettepreview_correctLightness_binding(value_5) {
    		ctx.palettepreview_correctLightness_binding.call(null, value_5);
    		updating_correctLightness = true;
    		add_flush_callback(() => updating_correctLightness = false);
    	}

    	function palettepreview_bezier_binding(value_6) {
    		ctx.palettepreview_bezier_binding.call(null, value_6);
    		updating_bezier = true;
    		add_flush_callback(() => updating_bezier = false);
    	}

    	function palettepreview_colors_binding(value_7) {
    		ctx.palettepreview_colors_binding.call(null, value_7);
    		updating_colors_1 = true;
    		add_flush_callback(() => updating_colors_1 = false);
    	}

    	function palettepreview_colors2_binding(value_8) {
    		ctx.palettepreview_colors2_binding.call(null, value_8);
    		updating_colors2 = true;
    		add_flush_callback(() => updating_colors2 = false);
    	}

    	function palettepreview_numColors_binding(value_9) {
    		ctx.palettepreview_numColors_binding.call(null, value_9);
    		updating_numColors = true;
    		add_flush_callback(() => updating_numColors = false);
    	}

    	let palettepreview_props = {
    		diverging: ctx.mode === 'diverging',
    		simulate: ctx.simulate
    	};
    	if (ctx.steps !== void 0) {
    		palettepreview_props.steps = ctx.steps;
    	}
    	if (ctx.correctLightness !== void 0) {
    		palettepreview_props.correctLightness = ctx.correctLightness;
    	}
    	if (ctx.bezier !== void 0) {
    		palettepreview_props.bezier = ctx.bezier;
    	}
    	if (ctx.colors !== void 0) {
    		palettepreview_props.colors = ctx.colors;
    	}
    	if (ctx.colors2 !== void 0) {
    		palettepreview_props.colors2 = ctx.colors2;
    	}
    	if (ctx.numColors !== void 0) {
    		palettepreview_props.numColors = ctx.numColors;
    	}
    	var palettepreview = new PalettePreview({
    		props: palettepreview_props,
    		$$inline: true
    	});

    	add_binding_callback(() => bind(palettepreview, 'steps', palettepreview_steps_binding));
    	add_binding_callback(() => bind(palettepreview, 'correctLightness', palettepreview_correctLightness_binding));
    	add_binding_callback(() => bind(palettepreview, 'bezier', palettepreview_bezier_binding));
    	add_binding_callback(() => bind(palettepreview, 'colors', palettepreview_colors_binding));
    	add_binding_callback(() => bind(palettepreview, 'colors2', palettepreview_colors2_binding));
    	add_binding_callback(() => bind(palettepreview, 'numColors', palettepreview_numColors_binding));

    	var stepchart0 = new StepChart({
    		props: {
    		title: "lightness",
    		steps: ctx.steps,
    		mode: 0
    	},
    		$$inline: true
    	});

    	var stepchart1 = new StepChart({
    		props: {
    		title: "saturation",
    		steps: ctx.steps,
    		mode: 1
    	},
    		$$inline: true
    	});

    	var stepchart2 = new StepChart({
    		props: {
    		title: "hue",
    		steps: ctx.steps,
    		mode: 2
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			checkbox0.$$.fragment.c();
    			t0 = space();
    			checkbox1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			colorblindcheck.$$.fragment.c();
    			t2 = space();
    			palettepreview.$$.fragment.c();
    			t3 = space();
    			div6 = element("div");
    			div3 = element("div");
    			stepchart0.$$.fragment.c();
    			t4 = space();
    			div4 = element("div");
    			stepchart1.$$.fragment.c();
    			t5 = space();
    			div5 = element("div");
    			stepchart2.$$.fragment.c();
    			attr(div0, "class", "col-md");
    			add_location(div0, file$b, 158, 12, 5077);
    			attr(div1, "class", "col-md");
    			add_location(div1, file$b, 162, 12, 5296);
    			attr(div2, "class", "row");
    			set_style(div2, "margin-bottom", "10px");
    			add_location(div2, file$b, 157, 8, 5018);
    			attr(div3, "class", "col-md");
    			add_location(div3, file$b, 176, 12, 5745);
    			attr(div4, "class", "col-md");
    			add_location(div4, file$b, 179, 12, 5871);
    			attr(div5, "class", "col-md");
    			add_location(div5, file$b, 182, 12, 5998);
    			attr(div6, "class", "row");
    			add_location(div6, file$b, 175, 8, 5714);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(checkbox0, div0, null);
    			append(div0, t0);
    			mount_component(checkbox1, div0, null);
    			append(div2, t1);
    			append(div2, div1);
    			mount_component(colorblindcheck, div1, null);
    			insert(target, t2, anchor);
    			mount_component(palettepreview, target, anchor);
    			insert(target, t3, anchor);
    			insert(target, div6, anchor);
    			append(div6, div3);
    			mount_component(stepchart0, div3, null);
    			append(div6, t4);
    			append(div6, div4);
    			mount_component(stepchart1, div4, null);
    			append(div6, t5);
    			append(div6, div5);
    			mount_component(stepchart2, div5, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var checkbox0_changes = {};
    			if (!updating_value && changed.correctLightness) {
    				checkbox0_changes.value = ctx.correctLightness;
    			}
    			checkbox0.$set(checkbox0_changes);

    			var checkbox1_changes = {};
    			if (!updating_value_1 && changed.bezier) {
    				checkbox1_changes.value = ctx.bezier;
    			}
    			checkbox1.$set(checkbox1_changes);

    			var colorblindcheck_changes = {};
    			if (!updating_colors && changed.steps) {
    				colorblindcheck_changes.colors = ctx.steps;
    			}
    			if (!updating_active && changed.simulate) {
    				colorblindcheck_changes.active = ctx.simulate;
    			}
    			colorblindcheck.$set(colorblindcheck_changes);

    			var palettepreview_changes = {};
    			if (changed.mode) palettepreview_changes.diverging = ctx.mode === 'diverging';
    			if (changed.simulate) palettepreview_changes.simulate = ctx.simulate;
    			if (!updating_steps && changed.steps) {
    				palettepreview_changes.steps = ctx.steps;
    			}
    			if (!updating_correctLightness && changed.correctLightness) {
    				palettepreview_changes.correctLightness = ctx.correctLightness;
    			}
    			if (!updating_bezier && changed.bezier) {
    				palettepreview_changes.bezier = ctx.bezier;
    			}
    			if (!updating_colors_1 && changed.colors) {
    				palettepreview_changes.colors = ctx.colors;
    			}
    			if (!updating_colors2 && changed.colors2) {
    				palettepreview_changes.colors2 = ctx.colors2;
    			}
    			if (!updating_numColors && changed.numColors) {
    				palettepreview_changes.numColors = ctx.numColors;
    			}
    			palettepreview.$set(palettepreview_changes);

    			var stepchart0_changes = {};
    			if (changed.steps) stepchart0_changes.steps = ctx.steps;
    			stepchart0.$set(stepchart0_changes);

    			var stepchart1_changes = {};
    			if (changed.steps) stepchart1_changes.steps = ctx.steps;
    			stepchart1.$set(stepchart1_changes);

    			var stepchart2_changes = {};
    			if (changed.steps) stepchart2_changes.steps = ctx.steps;
    			stepchart2.$set(stepchart2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);

    			transition_in(checkbox1.$$.fragment, local);

    			transition_in(colorblindcheck.$$.fragment, local);

    			transition_in(palettepreview.$$.fragment, local);

    			transition_in(stepchart0.$$.fragment, local);

    			transition_in(stepchart1.$$.fragment, local);

    			transition_in(stepchart2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			transition_out(colorblindcheck.$$.fragment, local);
    			transition_out(palettepreview.$$.fragment, local);
    			transition_out(stepchart0.$$.fragment, local);
    			transition_out(stepchart1.$$.fragment, local);
    			transition_out(stepchart2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_component(checkbox0, );

    			destroy_component(checkbox1, );

    			destroy_component(colorblindcheck, );

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(palettepreview, detaching);

    			if (detaching) {
    				detach(t3);
    				detach(div6);
    			}

    			destroy_component(stepchart0, );

    			destroy_component(stepchart1, );

    			destroy_component(stepchart2, );
    		}
    	};
    }

    // (189:4) <Card step="4" title="Export the color codes in various formats">
    function create_default_slot(ctx) {
    	var p, t0, a, t1, a_href_value, t2, kbd0, t3_value = ctx.isMac ? 'cmd' : 'ctrl', t3, t4, kbd1, t6, t7, current;

    	var export_1 = new Export({
    		props: { steps: ctx.steps },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			p = element("p");
    			t0 = text("You can also save your palette for later by bookmarking ");
    			a = element("a");
    			t1 = text("this page");
    			t2 = text(" using ");
    			kbd0 = element("kbd");
    			t3 = text(t3_value);
    			t4 = text("+");
    			kbd1 = element("kbd");
    			kbd1.textContent = "d";
    			t6 = text(".");
    			t7 = space();
    			export_1.$$.fragment.c();
    			attr(a, "href", a_href_value = "#/" + ctx.hash);
    			add_location(a, file$b, 189, 67, 6275);
    			attr(kbd0, "class", "svelte-1cvo05r");
    			add_location(kbd0, file$b, 189, 106, 6314);
    			attr(kbd1, "class", "svelte-1cvo05r");
    			add_location(kbd1, file$b, 189, 142, 6350);
    			add_location(p, file$b, 189, 8, 6216);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t0);
    			append(p, a);
    			append(a, t1);
    			append(p, t2);
    			append(p, kbd0);
    			append(kbd0, t3);
    			append(p, t4);
    			append(p, kbd1);
    			append(p, t6);
    			insert(target, t7, anchor);
    			mount_component(export_1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.hash) && a_href_value !== (a_href_value = "#/" + ctx.hash)) {
    				attr(a, "href", a_href_value);
    			}

    			var export_1_changes = {};
    			if (changed.steps) export_1_changes.steps = ctx.steps;
    			export_1.$set(export_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(export_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(export_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    				detach(t7);
    			}

    			destroy_component(export_1, detaching);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	var div2, div0, h1, t1, p0, t2, a0, t4, a1, t6, t7, t8, t9, t10, t11, div1, hr, t12, p1, t13, a2, t15, a3, t17, current, dispose;

    	var card0 = new Card({
    		props: {
    		step: "1",
    		title: "What kind of palette do you want to create?",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var card1 = new Card({
    		props: {
    		step: "2",
    		title: "Select and arrange input colors",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var card2 = new Card({
    		props: {
    		step: "3",
    		title: "Check and configure the resulting palette",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var card3 = new Card({
    		props: {
    		step: "4",
    		title: "Export the color codes in various formats",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Chroma.js Color Palette Helper";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("This ");
    			a0 = element("a");
    			a0.textContent = "chroma.js";
    			t4 = text("-powered tool is here to help us  ");
    			a1 = element("a");
    			a1.textContent = "mastering multi-hued, multi-stops color scales";
    			t6 = text(".");
    			t7 = space();
    			card0.$$.fragment.c();
    			t8 = space();
    			card1.$$.fragment.c();
    			t9 = space();
    			card2.$$.fragment.c();
    			t10 = space();
    			card3.$$.fragment.c();
    			t11 = space();
    			div1 = element("div");
    			hr = element("hr");
    			t12 = space();
    			p1 = element("p");
    			t13 = text("Created by ");
    			a2 = element("a");
    			a2.textContent = "Gregor Aisch";
    			t15 = text(" for the sake of better\r\n        use of colors in maps and data visualizations. Feel free to ");
    			a3 = element("a");
    			a3.textContent = "fork on Github";
    			t17 = text(".");
    			attr(h1, "class", "svelte-1cvo05r");
    			add_location(h1, file$b, 137, 8, 4009);
    			attr(a0, "href", "https://github.com/gka/chroma.js");
    			attr(a0, "target", "_blank");
    			add_location(a0, file$b, 138, 16, 4066);
    			attr(a1, "target", "_blank");
    			attr(a1, "href", "http://vis4.net/blog/posts/mastering-multi-hued-color-scales/");
    			add_location(a1, file$b, 138, 122, 4172);
    			add_location(p0, file$b, 138, 8, 4058);
    			attr(div0, "class", "head svelte-1cvo05r");
    			add_location(div0, file$b, 136, 4, 3981);
    			add_location(hr, file$b, 193, 8, 6448);
    			attr(a2, "href", "https://vis4.net/blog");
    			add_location(a2, file$b, 194, 22, 6476);
    			attr(a3, "href", "https://github.com/gka/palettes");
    			add_location(a3, file$b, 195, 68, 6617);
    			add_location(p1, file$b, 194, 8, 6462);
    			attr(div1, "class", "foot svelte-1cvo05r");
    			add_location(div1, file$b, 192, 4, 6420);
    			attr(div2, "class", "container");
    			add_location(div2, file$b, 135, 0, 3952);
    			dispose = listen(window, "hashchange", ctx.hashChange);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, h1);
    			append(div0, t1);
    			append(div0, p0);
    			append(p0, t2);
    			append(p0, a0);
    			append(p0, t4);
    			append(p0, a1);
    			append(p0, t6);
    			append(div2, t7);
    			mount_component(card0, div2, null);
    			append(div2, t8);
    			mount_component(card1, div2, null);
    			append(div2, t9);
    			mount_component(card2, div2, null);
    			append(div2, t10);
    			mount_component(card3, div2, null);
    			append(div2, t11);
    			append(div2, div1);
    			append(div1, hr);
    			append(div1, t12);
    			append(div1, p1);
    			append(p1, t13);
    			append(p1, a2);
    			append(p1, t15);
    			append(p1, a3);
    			append(p1, t17);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var card0_changes = {};
    			if (changed.$$scope || changed.numColors || changed.mode) card0_changes.$$scope = { changed, ctx };
    			card0.$set(card0_changes);

    			var card1_changes = {};
    			if (changed.$$scope || changed.mode || changed.colors || changed.colors2) card1_changes.$$scope = { changed, ctx };
    			card1.$set(card1_changes);

    			var card2_changes = {};
    			if (changed.$$scope || changed.steps || changed.mode || changed.simulate || changed.correctLightness || changed.bezier || changed.colors || changed.colors2 || changed.numColors) card2_changes.$$scope = { changed, ctx };
    			card2.$set(card2_changes);

    			var card3_changes = {};
    			if (changed.$$scope || changed.steps || changed.hash) card3_changes.$$scope = { changed, ctx };
    			card3.$set(card3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(card0.$$.fragment, local);

    			transition_in(card1.$$.fragment, local);

    			transition_in(card2.$$.fragment, local);

    			transition_in(card3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			transition_out(card2.$$.fragment, local);
    			transition_out(card3.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_component(card0, );

    			destroy_component(card1, );

    			destroy_component(card2, );

    			destroy_component(card3, );

    			dispose();
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	

        let { name } = $$props;

        let steps = [];
        let bezier = true;
        let correctLightness = true;

        let colors = '00429d,96ffea,lightyellow'.split(/\s*,\s*/).map(c => chroma(c));
        let colors2 = 'ffffe0,ff005e,93003a'.split(/\s*,\s*/).map(c => chroma(c));
        let numColors = 9;
        let mode = 'sequential';
        let simulate = 'none';

        if (window.location.hash) {
            readStateFromHash();
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') > -1;

        let _hash = '';
        let _mode = 'sequential';

        beforeUpdate(() => {
            if (hash !== _hash) {
                _hash = hash;
                window.location.hash = `#/${hash}`;
            }
            if (mode !== _mode) {
                if (mode === 'diverging' && !colors2.length) {
                    $$invalidate('colors2', colors2 = colors.slice(0).reverse());
                }
                _mode = mode;
            }
        });

        // onMount(() => {
        //     if (window.location.hash) {
        //         console.log('initial hash', window.location.hash);
        //         readStateFromHash();
        //     }
        //     _mounted = true;
        // })

        function readStateFromHash() {
            const parts = window.location.hash.substr(2).split('|');
            if (parts.length === 6) {
                setTimeout(() => {
                    $$invalidate('numColors', numColors = +parts[0]);
                    $$invalidate('mode', mode = parts[1] === 's' ? 'sequential' : 'diverging');
                    _mode = mode;
                    $$invalidate('colors', colors = parts[2].split(',').map(c => c && chroma(c)));
                    $$invalidate('colors2', colors2 = parts[3] !== '' ? parts[3].split(',').map(c => c && chroma(c)) : []);
                    $$invalidate('correctLightness', correctLightness = parts[4] === '1');
                    $$invalidate('bezier', bezier = parts[5] === '1');
                });
            } else {
                window.location.hash = '';
            }
        }

        function hashChange() {
            if (window.location.hash !== `#/${hash}`) {
                // deserialize hash
                readStateFromHash();
            }
        }

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function buttongroup_value_binding(value) {
    		mode = value;
    		$$invalidate('mode', mode);
    	}

    	function input_input_handler() {
    		numColors = to_number(this.value);
    		$$invalidate('numColors', numColors);
    	}

    	function inputcolors_colors_binding(value) {
    		colors = value;
    		$$invalidate('colors', colors);
    	}

    	function inputcolors_colors2_binding(value_1) {
    		colors2 = value_1;
    		$$invalidate('colors2', colors2);
    	}

    	function checkbox0_value_binding(value) {
    		correctLightness = value;
    		$$invalidate('correctLightness', correctLightness);
    	}

    	function checkbox1_value_binding(value_1) {
    		bezier = value_1;
    		$$invalidate('bezier', bezier);
    	}

    	function colorblindcheck_colors_binding(value_2) {
    		steps = value_2;
    		$$invalidate('steps', steps);
    	}

    	function colorblindcheck_active_binding(value_3) {
    		simulate = value_3;
    		$$invalidate('simulate', simulate);
    	}

    	function palettepreview_steps_binding(value_4) {
    		steps = value_4;
    		$$invalidate('steps', steps);
    	}

    	function palettepreview_correctLightness_binding(value_5) {
    		correctLightness = value_5;
    		$$invalidate('correctLightness', correctLightness);
    	}

    	function palettepreview_bezier_binding(value_6) {
    		bezier = value_6;
    		$$invalidate('bezier', bezier);
    	}

    	function palettepreview_colors_binding(value_7) {
    		colors = value_7;
    		$$invalidate('colors', colors);
    	}

    	function palettepreview_colors2_binding(value_8) {
    		colors2 = value_8;
    		$$invalidate('colors2', colors2);
    	}

    	function palettepreview_numColors_binding(value_9) {
    		numColors = value_9;
    		$$invalidate('numColors', numColors);
    	}

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	let hash;

    	$$self.$$.update = ($$dirty = { numColors: 1, mode: 1, colors: 1, colors2: 1, correctLightness: 1, bezier: 1 }) => {
    		if ($$dirty.numColors || $$dirty.mode || $$dirty.colors || $$dirty.colors2 || $$dirty.correctLightness || $$dirty.bezier) { $$invalidate('hash', hash = [
                    numColors,
                    mode.substr(0,1),
                    colors.map(c=>c.hex().substr(1)).join(','),
                    colors2.length ? colors2.map(c=>c.hex().substr(1)).join(',') : '',
                    correctLightness ? 1:0,
                    bezier?1:0
                ].join('|')); }
    	};

    	return {
    		name,
    		steps,
    		bezier,
    		correctLightness,
    		colors,
    		colors2,
    		numColors,
    		mode,
    		simulate,
    		isMac,
    		hashChange,
    		hash,
    		buttongroup_value_binding,
    		input_input_handler,
    		inputcolors_colors_binding,
    		inputcolors_colors2_binding,
    		checkbox0_value_binding,
    		checkbox1_value_binding,
    		colorblindcheck_colors_binding,
    		colorblindcheck_active_binding,
    		palettepreview_steps_binding,
    		palettepreview_correctLightness_binding,
    		palettepreview_bezier_binding,
    		palettepreview_colors_binding,
    		palettepreview_colors2_binding,
    		palettepreview_numColors_binding
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["name"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
