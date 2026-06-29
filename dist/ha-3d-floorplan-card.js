/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Zr = globalThis, vl = Zr.ShadowRoot && (Zr.ShadyCSS === void 0 || Zr.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xl = Symbol(), ac = /* @__PURE__ */ new WeakMap();
let _d = class {
  constructor(t, e, n) {
    if (this._$cssResult$ = !0, n !== xl) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (vl && t === void 0) {
      const n = e !== void 0 && e.length === 1;
      n && (t = ac.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), n && ac.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Hu = (i) => new _d(typeof i == "string" ? i : i + "", void 0, xl), vd = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((n, s, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + i[r + 1], i[0]);
  return new _d(e, i, xl);
}, Gu = (i, t) => {
  if (vl) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const n = document.createElement("style"), s = Zr.litNonce;
    s !== void 0 && n.setAttribute("nonce", s), n.textContent = e.cssText, i.appendChild(n);
  }
}, lc = vl ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const n of t.cssRules) e += n.cssText;
  return Hu(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Vu, defineProperty: Wu, getOwnPropertyDescriptor: $u, getOwnPropertyNames: Xu, getOwnPropertySymbols: ju, getPrototypeOf: Ku } = Object, yo = globalThis, cc = yo.trustedTypes, qu = cc ? cc.emptyScript : "", Yu = yo.reactiveElementPolyfillSupport, ks = (i, t) => i, oo = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? qu : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, yl = (i, t) => !Vu(i, t), hc = { attribute: !0, type: String, converter: oo, reflect: !1, useDefault: !1, hasChanged: yl };
Symbol.metadata ??= Symbol("metadata"), yo.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Ki = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = hc) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const n = Symbol(), s = this.getPropertyDescriptor(t, n, e);
      s !== void 0 && Wu(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, n) {
    const { get: s, set: r } = $u(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: s, set(o) {
      const a = s?.call(this);
      r?.call(this, o), this.requestUpdate(t, a, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? hc;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ks("elementProperties"))) return;
    const t = Ku(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ks("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ks("properties"))) {
      const e = this.properties, n = [...Xu(e), ...ju(e)];
      for (const s of n) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [n, s] of e) this.elementProperties.set(n, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, n] of this.elementProperties) {
      const s = this._$Eu(e, n);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const n = new Set(t.flat(1 / 0).reverse());
      for (const s of n) e.unshift(lc(s));
    } else t !== void 0 && e.push(lc(t));
    return e;
  }
  static _$Eu(t, e) {
    const n = e.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const n of e.keys()) this.hasOwnProperty(n) && (t.set(n, this[n]), delete this[n]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Gu(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, n) {
    this._$AK(t, n);
  }
  _$ET(t, e) {
    const n = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, n);
    if (s !== void 0 && n.reflect === !0) {
      const r = (n.converter?.toAttribute !== void 0 ? n.converter : oo).toAttribute(e, n.type);
      this._$Em = t, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const n = this.constructor, s = n._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const r = n.getPropertyOptions(s), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : oo;
      this._$Em = s;
      const a = o.fromAttribute(e, r.type);
      this[s] = a ?? this._$Ej?.get(s) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, e, n, s = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (r = this[t]), n ??= o.getPropertyOptions(t), !((n.hasChanged ?? yl)(r, e) || n.useDefault && n.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, n)))) return;
      this.C(t, e, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: n, reflect: s, wrapped: r }, o) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || n || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, r] of this._$Ep) this[s] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [s, r] of n) {
        const { wrapped: o } = r, a = this[s];
        o !== !0 || this._$AL.has(s) || a === void 0 || this.C(s, void 0, r, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Ki.elementStyles = [], Ki.shadowRootOptions = { mode: "open" }, Ki[ks("elementProperties")] = /* @__PURE__ */ new Map(), Ki[ks("finalized")] = /* @__PURE__ */ new Map(), Yu?.({ ReactiveElement: Ki }), (yo.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ml = globalThis, dc = (i) => i, ao = Ml.trustedTypes, uc = ao ? ao.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, xd = "$lit$", ti = `lit$${Math.random().toFixed(9).slice(2)}$`, yd = "?" + ti, Zu = `<${yd}>`, Si = document, Xs = () => Si.createComment(""), js = (i) => i === null || typeof i != "object" && typeof i != "function", Sl = Array.isArray, Ju = (i) => Sl(i) || typeof i?.[Symbol.iterator] == "function", Lo = `[ 	
\f\r]`, ys = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, fc = /-->/g, pc = />/g, hi = RegExp(`>|${Lo}(?:([^\\s"'>=/]+)(${Lo}*=${Lo}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), mc = /'/g, gc = /"/g, Md = /^(?:script|style|textarea|title)$/i, Qu = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), At = Qu(1), is = Symbol.for("lit-noChange"), Rt = Symbol.for("lit-nothing"), _c = /* @__PURE__ */ new WeakMap(), Mi = Si.createTreeWalker(Si, 129);
function Sd(i, t) {
  if (!Sl(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return uc !== void 0 ? uc.createHTML(t) : t;
}
const tf = (i, t) => {
  const e = i.length - 1, n = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ys;
  for (let a = 0; a < e; a++) {
    const l = i[a];
    let c, h, d = -1, u = 0;
    for (; u < l.length && (o.lastIndex = u, h = o.exec(l), h !== null); ) u = o.lastIndex, o === ys ? h[1] === "!--" ? o = fc : h[1] !== void 0 ? o = pc : h[2] !== void 0 ? (Md.test(h[2]) && (s = RegExp("</" + h[2], "g")), o = hi) : h[3] !== void 0 && (o = hi) : o === hi ? h[0] === ">" ? (o = s ?? ys, d = -1) : h[1] === void 0 ? d = -2 : (d = o.lastIndex - h[2].length, c = h[1], o = h[3] === void 0 ? hi : h[3] === '"' ? gc : mc) : o === gc || o === mc ? o = hi : o === fc || o === pc ? o = ys : (o = hi, s = void 0);
    const f = o === hi && i[a + 1].startsWith("/>") ? " " : "";
    r += o === ys ? l + Zu : d >= 0 ? (n.push(c), l.slice(0, d) + xd + l.slice(d) + ti + f) : l + ti + (d === -2 ? a : f);
  }
  return [Sd(i, r + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), n];
};
class Ks {
  constructor({ strings: t, _$litType$: e }, n) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [c, h] = tf(t, e);
    if (this.el = Ks.createElement(c, n), Mi.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (s = Mi.nextNode()) !== null && l.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const d of s.getAttributeNames()) if (d.endsWith(xd)) {
          const u = h[o++], f = s.getAttribute(d).split(ti), g = /([.?@])?(.*)/.exec(u);
          l.push({ type: 1, index: r, name: g[2], strings: f, ctor: g[1] === "." ? nf : g[1] === "?" ? sf : g[1] === "@" ? rf : Mo }), s.removeAttribute(d);
        } else d.startsWith(ti) && (l.push({ type: 6, index: r }), s.removeAttribute(d));
        if (Md.test(s.tagName)) {
          const d = s.textContent.split(ti), u = d.length - 1;
          if (u > 0) {
            s.textContent = ao ? ao.emptyScript : "";
            for (let f = 0; f < u; f++) s.append(d[f], Xs()), Mi.nextNode(), l.push({ type: 2, index: ++r });
            s.append(d[u], Xs());
          }
        }
      } else if (s.nodeType === 8) if (s.data === yd) l.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = s.data.indexOf(ti, d + 1)) !== -1; ) l.push({ type: 7, index: r }), d += ti.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const n = Si.createElement("template");
    return n.innerHTML = t, n;
  }
}
function ss(i, t, e = i, n) {
  if (t === is) return t;
  let s = n !== void 0 ? e._$Co?.[n] : e._$Cl;
  const r = js(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(i), s._$AT(i, e, n)), n !== void 0 ? (e._$Co ??= [])[n] = s : e._$Cl = s), s !== void 0 && (t = ss(i, s._$AS(i, t.values), s, n)), t;
}
class ef {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: n } = this._$AD, s = (t?.creationScope ?? Si).importNode(e, !0);
    Mi.currentNode = s;
    let r = Mi.nextNode(), o = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new sr(r, r.nextSibling, this, t) : l.type === 1 ? c = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (c = new of(r, this, t)), this._$AV.push(c), l = n[++a];
      }
      o !== l?.index && (r = Mi.nextNode(), o++);
    }
    return Mi.currentNode = Si, s;
  }
  p(t) {
    let e = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(t, n, e), e += n.strings.length - 2) : n._$AI(t[e])), e++;
  }
}
class sr {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, n, s) {
    this.type = 2, this._$AH = Rt, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = n, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = ss(this, t, e), js(t) ? t === Rt || t == null || t === "" ? (this._$AH !== Rt && this._$AR(), this._$AH = Rt) : t !== this._$AH && t !== is && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ju(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== Rt && js(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Si.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: n } = t, s = typeof n == "number" ? this._$AC(t) : (n.el === void 0 && (n.el = Ks.createElement(Sd(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const r = new ef(s, this), o = r.u(this.options);
      r.p(e), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = _c.get(t.strings);
    return e === void 0 && _c.set(t.strings, e = new Ks(t)), e;
  }
  k(t) {
    Sl(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let n, s = 0;
    for (const r of t) s === e.length ? e.push(n = new sr(this.O(Xs()), this.O(Xs()), this, this.options)) : n = e[s], n._$AI(r), s++;
    s < e.length && (this._$AR(n && n._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const n = dc(t).nextSibling;
      dc(t).remove(), t = n;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Mo {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, n, s, r) {
    this.type = 1, this._$AH = Rt, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = Rt;
  }
  _$AI(t, e = this, n, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = ss(this, t, e, 0), o = !js(t) || t !== this._$AH && t !== is, o && (this._$AH = t);
    else {
      const a = t;
      let l, c;
      for (t = r[0], l = 0; l < r.length - 1; l++) c = ss(this, a[n + l], e, l), c === is && (c = this._$AH[l]), o ||= !js(c) || c !== this._$AH[l], c === Rt ? t = Rt : t !== Rt && (t += (c ?? "") + r[l + 1]), this._$AH[l] = c;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === Rt ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class nf extends Mo {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === Rt ? void 0 : t;
  }
}
class sf extends Mo {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== Rt);
  }
}
class rf extends Mo {
  constructor(t, e, n, s, r) {
    super(t, e, n, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = ss(this, t, e, 0) ?? Rt) === is) return;
    const n = this._$AH, s = t === Rt && n !== Rt || t.capture !== n.capture || t.once !== n.once || t.passive !== n.passive, r = t !== Rt && (n === Rt || s);
    s && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class of {
  constructor(t, e, n) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ss(this, t);
  }
}
const af = Ml.litHtmlPolyfillSupport;
af?.(Ks, sr), (Ml.litHtmlVersions ??= []).push("3.3.3");
const lf = (i, t, e) => {
  const n = e?.renderBefore ?? t;
  let s = n._$litPart$;
  if (s === void 0) {
    const r = e?.renderBefore ?? null;
    n._$litPart$ = s = new sr(t.insertBefore(Xs(), r), r, void 0, e ?? {});
  }
  return s._$AI(i), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bl = globalThis;
class Zi extends Ki {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = lf(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return is;
  }
}
Zi._$litElement$ = !0, Zi.finalized = !0, bl.litElementHydrateSupport?.({ LitElement: Zi });
const cf = bl.litElementPolyfillSupport;
cf?.({ LitElement: Zi });
(bl.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bd = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hf = { attribute: !0, type: String, converter: oo, reflect: !1, hasChanged: yl }, df = (i = hf, t, e) => {
  const { kind: n, metadata: s } = e;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), n === "setter" && ((i = Object.create(i)).wrapped = !0), r.set(e.name, i), n === "accessor") {
    const { name: o } = e;
    return { set(a) {
      const l = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, l, i, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, i, a), a;
    } };
  }
  if (n === "setter") {
    const { name: o } = e;
    return function(a) {
      const l = this[o];
      t.call(this, a), this.requestUpdate(o, l, i, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function rr(i) {
  return (t, e) => typeof e == "object" ? df(i, t, e) : ((n, s, r) => {
    const o = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $t(i) {
  return rr({ ...i, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const uf = (i, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(i, t, e), e);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ff(i, t) {
  return (e, n, s) => {
    const r = (o) => o.renderRoot?.querySelector(i) ?? null;
    return uf(e, n, { get() {
      return r(this);
    } });
  };
}
/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const El = "169", pn = { ROTATE: 0, DOLLY: 1, PAN: 2 }, mn = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, pf = 0, vc = 1, mf = 2, Ed = 1, wd = 2, Un = 3, Hn = 0, je = 1, on = 2, si = 0, Ji = 1, xc = 2, yc = 3, Mc = 4, gf = 5, xi = 100, _f = 101, vf = 102, xf = 103, yf = 104, Mf = 200, Sf = 201, bf = 202, Ef = 203, ba = 204, Ea = 205, wf = 206, Tf = 207, Af = 208, Rf = 209, Cf = 210, Pf = 211, Lf = 212, If = 213, Df = 214, wa = 0, Ta = 1, Aa = 2, rs = 3, Ra = 4, Ca = 5, Pa = 6, La = 7, Td = 0, Nf = 1, Uf = 2, ri = 0, Of = 1, Ff = 2, Bf = 3, kf = 4, zf = 5, Hf = 6, Gf = 7, Sc = "attached", Vf = "detached", Ad = 300, os = 301, as = 302, Ia = 303, Da = 304, So = 306, oi = 1e3, ni = 1001, lo = 1002, Ve = 1003, Rd = 1004, Fs = 1005, tn = 1006, Jr = 1007, Bn = 1008, Gn = 1009, Cd = 1010, Pd = 1011, qs = 1012, wl = 1013, bi = 1014, _n = 1015, or = 1016, Tl = 1017, Al = 1018, ls = 1020, Ld = 35902, Id = 1021, Dd = 1022, ln = 1023, Nd = 1024, Ud = 1025, Qi = 1026, cs = 1027, Rl = 1028, Cl = 1029, Od = 1030, Pl = 1031, Ll = 1033, Qr = 33776, to = 33777, eo = 33778, no = 33779, Na = 35840, Ua = 35841, Oa = 35842, Fa = 35843, Ba = 36196, ka = 37492, za = 37496, Ha = 37808, Ga = 37809, Va = 37810, Wa = 37811, $a = 37812, Xa = 37813, ja = 37814, Ka = 37815, qa = 37816, Ya = 37817, Za = 37818, Ja = 37819, Qa = 37820, tl = 37821, io = 36492, el = 36494, nl = 36495, Fd = 36283, il = 36284, sl = 36285, rl = 36286, Ys = 2300, Zs = 2301, Io = 2302, bc = 2400, Ec = 2401, wc = 2402, Wf = 2500, $f = 0, Bd = 1, ol = 2, Xf = 3200, jf = 3201, kd = 0, Kf = 1, ei = "", ke = "srgb", Oe = "srgb-linear", Il = "display-p3", bo = "display-p3-linear", co = "linear", xe = "srgb", ho = "rec709", uo = "p3", Ri = 7680, Tc = 519, qf = 512, Yf = 513, Zf = 514, zd = 515, Jf = 516, Qf = 517, tp = 518, ep = 519, al = 35044, Ac = "300 es", kn = 2e3, fo = 2001;
class Ti {
  addEventListener(t, e) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e);
  }
  hasEventListener(t, e) {
    if (this._listeners === void 0) return !1;
    const n = this._listeners;
    return n[t] !== void 0 && n[t].indexOf(e) !== -1;
  }
  removeEventListener(t, e) {
    if (this._listeners === void 0) return;
    const s = this._listeners[t];
    if (s !== void 0) {
      const r = s.indexOf(e);
      r !== -1 && s.splice(r, 1);
    }
  }
  dispatchEvent(t) {
    if (this._listeners === void 0) return;
    const n = this._listeners[t.type];
    if (n !== void 0) {
      t.target = this;
      const s = n.slice(0);
      for (let r = 0, o = s.length; r < o; r++)
        s[r].call(this, t);
      t.target = null;
    }
  }
}
const Fe = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Rc = 1234567;
const zs = Math.PI / 180, hs = 180 / Math.PI;
function cn() {
  const i = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Fe[i & 255] + Fe[i >> 8 & 255] + Fe[i >> 16 & 255] + Fe[i >> 24 & 255] + "-" + Fe[t & 255] + Fe[t >> 8 & 255] + "-" + Fe[t >> 16 & 15 | 64] + Fe[t >> 24 & 255] + "-" + Fe[e & 63 | 128] + Fe[e >> 8 & 255] + "-" + Fe[e >> 16 & 255] + Fe[e >> 24 & 255] + Fe[n & 255] + Fe[n >> 8 & 255] + Fe[n >> 16 & 255] + Fe[n >> 24 & 255]).toLowerCase();
}
function Re(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function Dl(i, t) {
  return (i % t + t) % t;
}
function np(i, t, e, n, s) {
  return n + (i - t) * (s - n) / (e - t);
}
function ip(i, t, e) {
  return i !== t ? (e - i) / (t - i) : 0;
}
function Hs(i, t, e) {
  return (1 - e) * i + e * t;
}
function sp(i, t, e, n) {
  return Hs(i, t, 1 - Math.exp(-e * n));
}
function rp(i, t = 1) {
  return t - Math.abs(Dl(i, t * 2) - t);
}
function op(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
}
function ap(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
}
function lp(i, t) {
  return i + Math.floor(Math.random() * (t - i + 1));
}
function cp(i, t) {
  return i + Math.random() * (t - i);
}
function hp(i) {
  return i * (0.5 - Math.random());
}
function dp(i) {
  i !== void 0 && (Rc = i);
  let t = Rc += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function up(i) {
  return i * zs;
}
function fp(i) {
  return i * hs;
}
function pp(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function mp(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function gp(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function _p(i, t, e, n, s) {
  const r = Math.cos, o = Math.sin, a = r(e / 2), l = o(e / 2), c = r((t + n) / 2), h = o((t + n) / 2), d = r((t - n) / 2), u = o((t - n) / 2), f = r((n - t) / 2), g = o((n - t) / 2);
  switch (s) {
    case "XYX":
      i.set(a * h, l * d, l * u, a * c);
      break;
    case "YZY":
      i.set(l * u, a * h, l * d, a * c);
      break;
    case "ZXZ":
      i.set(l * d, l * u, a * h, a * c);
      break;
    case "XZX":
      i.set(a * h, l * g, l * f, a * c);
      break;
    case "YXY":
      i.set(l * f, a * h, l * g, a * c);
      break;
    case "ZYZ":
      i.set(l * g, l * f, a * h, a * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + s);
  }
}
function gn(i, t) {
  switch (t.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return i / 4294967295;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int32Array:
      return Math.max(i / 2147483647, -1);
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function he(i, t) {
  switch (t.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return Math.round(i * 4294967295);
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int32Array:
      return Math.round(i * 2147483647);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const ts = {
  DEG2RAD: zs,
  RAD2DEG: hs,
  generateUUID: cn,
  clamp: Re,
  euclideanModulo: Dl,
  mapLinear: np,
  inverseLerp: ip,
  lerp: Hs,
  damp: sp,
  pingpong: rp,
  smoothstep: op,
  smootherstep: ap,
  randInt: lp,
  randFloat: cp,
  randFloatSpread: hp,
  seededRandom: dp,
  degToRad: up,
  radToDeg: fp,
  isPowerOfTwo: pp,
  ceilPowerOfTwo: mp,
  floorPowerOfTwo: gp,
  setQuaternionFromProperEuler: _p,
  normalize: he,
  denormalize: gn
};
class nt {
  constructor(t = 0, e = 0) {
    nt.prototype.isVector2 = !0, this.x = t, this.y = e;
  }
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  set(t, e) {
    return this.x = t, this.y = e, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  applyMatrix3(t) {
    const e = this.x, n = this.y, s = t.elements;
    return this.x = s[0] * e + s[3] * n + s[6], this.y = s[1] * e + s[4] * n + s[7], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
  }
  clamp(t, e) {
    return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), this;
  }
  clampScalar(t, e) {
    return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(t, Math.min(e, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  cross(t) {
    return this.x * t.y - this.y * t.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Re(n, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const e = this.x - t.x, n = this.y - t.y;
    return e * e + n * n;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this;
  }
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this;
  }
  rotateAround(t, e) {
    const n = Math.cos(e), s = Math.sin(e), r = this.x - t.x, o = this.y - t.y;
    return this.x = r * n - o * s + t.x, this.y = r * s + o * n + t.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class Vt {
  constructor(t, e, n, s, r, o, a, l, c) {
    Vt.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, e, n, s, r, o, a, l, c);
  }
  set(t, e, n, s, r, o, a, l, c) {
    const h = this.elements;
    return h[0] = t, h[1] = s, h[2] = a, h[3] = e, h[4] = r, h[5] = l, h[6] = n, h[7] = o, h[8] = c, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ), this;
  }
  copy(t) {
    const e = this.elements, n = t.elements;
    return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], this;
  }
  extractBasis(t, e, n) {
    return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(t) {
    const e = t.elements;
    return this.set(
      e[0],
      e[4],
      e[8],
      e[1],
      e[5],
      e[9],
      e[2],
      e[6],
      e[10]
    ), this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements, s = e.elements, r = this.elements, o = n[0], a = n[3], l = n[6], c = n[1], h = n[4], d = n[7], u = n[2], f = n[5], g = n[8], v = s[0], p = s[3], m = s[6], x = s[1], _ = s[4], M = s[7], L = s[2], T = s[5], w = s[8];
    return r[0] = o * v + a * x + l * L, r[3] = o * p + a * _ + l * T, r[6] = o * m + a * M + l * w, r[1] = c * v + h * x + d * L, r[4] = c * p + h * _ + d * T, r[7] = c * m + h * M + d * w, r[2] = u * v + f * x + g * L, r[5] = u * p + f * _ + g * T, r[8] = u * m + f * M + g * w, this;
  }
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
  }
  determinant() {
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8];
    return e * o * h - e * a * c - n * r * h + n * a * l + s * r * c - s * o * l;
  }
  invert() {
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], d = h * o - a * c, u = a * l - h * r, f = c * r - o * l, g = e * d + n * u + s * f;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const v = 1 / g;
    return t[0] = d * v, t[1] = (s * c - h * n) * v, t[2] = (a * n - s * o) * v, t[3] = u * v, t[4] = (h * e - s * l) * v, t[5] = (s * r - a * e) * v, t[6] = f * v, t[7] = (n * l - c * e) * v, t[8] = (o * e - n * r) * v, this;
  }
  transpose() {
    let t;
    const e = this.elements;
    return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this;
  }
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  transposeIntoArray(t) {
    const e = this.elements;
    return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this;
  }
  setUvTransform(t, e, n, s, r, o, a) {
    const l = Math.cos(r), c = Math.sin(r);
    return this.set(
      n * l,
      n * c,
      -n * (l * o + c * a) + o + t,
      -s * c,
      s * l,
      -s * (-c * o + l * a) + a + e,
      0,
      0,
      1
    ), this;
  }
  //
  scale(t, e) {
    return this.premultiply(Do.makeScale(t, e)), this;
  }
  rotate(t) {
    return this.premultiply(Do.makeRotation(-t)), this;
  }
  translate(t, e) {
    return this.premultiply(Do.makeTranslation(t, e)), this;
  }
  // for 2D Transforms
  makeTranslation(t, e) {
    return t.isVector2 ? this.set(
      1,
      0,
      t.x,
      0,
      1,
      t.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      t,
      0,
      1,
      e,
      0,
      0,
      1
    ), this;
  }
  makeRotation(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      e,
      -n,
      0,
      n,
      e,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(t, e) {
    return this.set(
      t,
      0,
      0,
      0,
      e,
      0,
      0,
      0,
      1
    ), this;
  }
  //
  equals(t) {
    const e = this.elements, n = t.elements;
    for (let s = 0; s < 9; s++)
      if (e[s] !== n[s]) return !1;
    return !0;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 9; n++)
      this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const Do = /* @__PURE__ */ new Vt();
function Hd(i) {
  for (let t = i.length - 1; t >= 0; --t)
    if (i[t] >= 65535) return !0;
  return !1;
}
function Js(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function vp() {
  const i = Js("canvas");
  return i.style.display = "block", i;
}
const Cc = {};
function so(i) {
  i in Cc || (Cc[i] = !0, console.warn(i));
}
function xp(i, t, e) {
  return new Promise(function(n, s) {
    function r() {
      switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          s();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(r, e);
          break;
        default:
          n();
      }
    }
    setTimeout(r, e);
  });
}
function yp(i) {
  const t = i.elements;
  t[2] = 0.5 * t[2] + 0.5 * t[3], t[6] = 0.5 * t[6] + 0.5 * t[7], t[10] = 0.5 * t[10] + 0.5 * t[11], t[14] = 0.5 * t[14] + 0.5 * t[15];
}
function Mp(i) {
  const t = i.elements;
  t[11] === -1 ? (t[10] = -t[10] - 1, t[14] = -t[14]) : (t[10] = -t[10], t[14] = -t[14] + 1);
}
const Pc = /* @__PURE__ */ new Vt().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), Lc = /* @__PURE__ */ new Vt().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), Ms = {
  [Oe]: {
    transfer: co,
    primaries: ho,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (i) => i,
    fromReference: (i) => i
  },
  [ke]: {
    transfer: xe,
    primaries: ho,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (i) => i.convertSRGBToLinear(),
    fromReference: (i) => i.convertLinearToSRGB()
  },
  [bo]: {
    transfer: co,
    primaries: uo,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (i) => i.applyMatrix3(Lc),
    fromReference: (i) => i.applyMatrix3(Pc)
  },
  [Il]: {
    transfer: xe,
    primaries: uo,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (i) => i.convertSRGBToLinear().applyMatrix3(Lc),
    fromReference: (i) => i.applyMatrix3(Pc).convertLinearToSRGB()
  }
}, Sp = /* @__PURE__ */ new Set([Oe, bo]), ne = {
  enabled: !0,
  _workingColorSpace: Oe,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(i) {
    if (!Sp.has(i))
      throw new Error(`Unsupported working color space, "${i}".`);
    this._workingColorSpace = i;
  },
  convert: function(i, t, e) {
    if (this.enabled === !1 || t === e || !t || !e)
      return i;
    const n = Ms[t].toReference, s = Ms[e].fromReference;
    return s(n(i));
  },
  fromWorkingColorSpace: function(i, t) {
    return this.convert(i, this._workingColorSpace, t);
  },
  toWorkingColorSpace: function(i, t) {
    return this.convert(i, t, this._workingColorSpace);
  },
  getPrimaries: function(i) {
    return Ms[i].primaries;
  },
  getTransfer: function(i) {
    return i === ei ? co : Ms[i].transfer;
  },
  getLuminanceCoefficients: function(i, t = this._workingColorSpace) {
    return i.fromArray(Ms[t].luminanceCoefficients);
  }
};
function es(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function No(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let Ci;
class bp {
  static getDataURL(t) {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u")
      return t.src;
    let e;
    if (t instanceof HTMLCanvasElement)
      e = t;
    else {
      Ci === void 0 && (Ci = Js("canvas")), Ci.width = t.width, Ci.height = t.height;
      const n = Ci.getContext("2d");
      t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = Ci;
    }
    return e.width > 2048 || e.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", t), e.toDataURL("image/jpeg", 0.6)) : e.toDataURL("image/png");
  }
  static sRGBToLinear(t) {
    if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
      const e = Js("canvas");
      e.width = t.width, e.height = t.height;
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const s = n.getImageData(0, 0, t.width, t.height), r = s.data;
      for (let o = 0; o < r.length; o++)
        r[o] = es(r[o] / 255) * 255;
      return n.putImageData(s, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(es(e[n] / 255) * 255) : e[n] = es(e[n]);
      return {
        data: e,
        width: t.width,
        height: t.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let Ep = 0;
class Gd {
  constructor(t = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Ep++ }), this.uuid = cn(), this.data = t, this.dataReady = !0, this.version = 0;
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.images[this.uuid] !== void 0)
      return t.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, s = this.data;
    if (s !== null) {
      let r;
      if (Array.isArray(s)) {
        r = [];
        for (let o = 0, a = s.length; o < a; o++)
          s[o].isDataTexture ? r.push(Uo(s[o].image)) : r.push(Uo(s[o]));
      } else
        r = Uo(s);
      n.url = r;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function Uo(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? bp.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let wp = 0;
class Ce extends Ti {
  constructor(t = Ce.DEFAULT_IMAGE, e = Ce.DEFAULT_MAPPING, n = ni, s = ni, r = tn, o = Bn, a = ln, l = Gn, c = Ce.DEFAULT_ANISOTROPY, h = ei) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: wp++ }), this.uuid = cn(), this.name = "", this.source = new Gd(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new nt(0, 0), this.repeat = new nt(1, 1), this.center = new nt(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Vt(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
  }
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this;
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.textures[this.uuid] !== void 0)
      return t.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.6,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(t).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), e || (t.textures[this.uuid] = n), n;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== Ad) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1)
      switch (this.wrapS) {
        case oi:
          t.x = t.x - Math.floor(t.x);
          break;
        case ni:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case lo:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case oi:
          t.y = t.y - Math.floor(t.y);
          break;
        case ni:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case lo:
          Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
          break;
      }
    return this.flipY && (t.y = 1 - t.y), t;
  }
  set needsUpdate(t) {
    t === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(t) {
    t === !0 && this.pmremVersion++;
  }
}
Ce.DEFAULT_IMAGE = null;
Ce.DEFAULT_MAPPING = Ad;
Ce.DEFAULT_ANISOTROPY = 1;
class re {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    re.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = n, this.w = s;
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, e, n, s) {
    return this.x = t, this.y = e, this.z = n, this.w = s, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this.w = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setW(t) {
    return this.w = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      case 3:
        this.w = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this.w += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
  }
  applyMatrix4(t) {
    const e = this.x, n = this.y, s = this.z, r = this.w, o = t.elements;
    return this.x = o[0] * e + o[4] * n + o[8] * s + o[12] * r, this.y = o[1] * e + o[5] * n + o[9] * s + o[13] * r, this.z = o[2] * e + o[6] * n + o[10] * s + o[14] * r, this.w = o[3] * e + o[7] * n + o[11] * s + o[15] * r, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const e = Math.sqrt(1 - t.w * t.w);
    return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this;
  }
  setAxisAngleFromRotationMatrix(t) {
    let e, n, s, r;
    const l = t.elements, c = l[0], h = l[4], d = l[8], u = l[1], f = l[5], g = l[9], v = l[2], p = l[6], m = l[10];
    if (Math.abs(h - u) < 0.01 && Math.abs(d - v) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(h + u) < 0.1 && Math.abs(d + v) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(c + f + m - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const _ = (c + 1) / 2, M = (f + 1) / 2, L = (m + 1) / 2, T = (h + u) / 4, w = (d + v) / 4, R = (g + p) / 4;
      return _ > M && _ > L ? _ < 0.01 ? (n = 0, s = 0.707106781, r = 0.707106781) : (n = Math.sqrt(_), s = T / n, r = w / n) : M > L ? M < 0.01 ? (n = 0.707106781, s = 0, r = 0.707106781) : (s = Math.sqrt(M), n = T / s, r = R / s) : L < 0.01 ? (n = 0.707106781, s = 0.707106781, r = 0) : (r = Math.sqrt(L), n = w / r, s = R / r), this.set(n, s, r, e), this;
    }
    let x = Math.sqrt((p - g) * (p - g) + (d - v) * (d - v) + (u - h) * (u - h));
    return Math.abs(x) < 1e-3 && (x = 1), this.x = (p - g) / x, this.y = (d - v) / x, this.z = (u - h) / x, this.w = Math.acos((c + f + m - 1) / 2), this;
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
  }
  clamp(t, e) {
    return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), this.z = Math.max(t.z, Math.min(e.z, this.z)), this.w = Math.max(t.w, Math.min(e.w, this.w)), this;
  }
  clampScalar(t, e) {
    return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), this.z = Math.max(t, Math.min(e, this.z)), this.w = Math.max(t, Math.min(e, this.w)), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(t, Math.min(e, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this;
  }
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this.w = t.w + (e.w - t.w) * n, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class Tp extends Ti {
  constructor(t = 1, e = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = t, this.height = e, this.depth = 1, this.scissor = new re(0, 0, t, e), this.scissorTest = !1, this.viewport = new re(0, 0, t, e);
    const s = { width: t, height: e, depth: 1 };
    n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: tn,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1
    }, n);
    const r = new Ce(s, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
    r.flipY = !1, r.generateMipmaps = n.generateMipmaps, r.internalFormat = n.internalFormat, this.textures = [];
    const o = n.count;
    for (let a = 0; a < o; a++)
      this.textures[a] = r.clone(), this.textures[a].isRenderTargetTexture = !0;
    this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.depthTexture = n.depthTexture, this.samples = n.samples;
  }
  get texture() {
    return this.textures[0];
  }
  set texture(t) {
    this.textures[0] = t;
  }
  setSize(t, e, n = 1) {
    if (this.width !== t || this.height !== e || this.depth !== n) {
      this.width = t, this.height = e, this.depth = n;
      for (let s = 0, r = this.textures.length; s < r; s++)
        this.textures[s].image.width = t, this.textures[s].image.height = e, this.textures[s].image.depth = n;
      this.dispose();
    }
    this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.textures.length = 0;
    for (let n = 0, s = t.textures.length; n < s; n++)
      this.textures[n] = t.textures[n].clone(), this.textures[n].isRenderTargetTexture = !0;
    const e = Object.assign({}, t.texture.image);
    return this.texture.source = new Gd(e), this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Ei extends Tp {
  constructor(t = 1, e = 1, n = {}) {
    super(t, e, n), this.isWebGLRenderTarget = !0;
  }
}
class Vd extends Ce {
  constructor(t = null, e = 1, n = 1, s = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: t, width: e, height: n, depth: s }, this.magFilter = Ve, this.minFilter = Ve, this.wrapR = ni, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Ap extends Ce {
  constructor(t = null, e = 1, n = 1, s = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: t, width: e, height: n, depth: s }, this.magFilter = Ve, this.minFilter = Ve, this.wrapR = ni, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class Sn {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    this.isQuaternion = !0, this._x = t, this._y = e, this._z = n, this._w = s;
  }
  static slerpFlat(t, e, n, s, r, o, a) {
    let l = n[s + 0], c = n[s + 1], h = n[s + 2], d = n[s + 3];
    const u = r[o + 0], f = r[o + 1], g = r[o + 2], v = r[o + 3];
    if (a === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
      return;
    }
    if (a === 1) {
      t[e + 0] = u, t[e + 1] = f, t[e + 2] = g, t[e + 3] = v;
      return;
    }
    if (d !== v || l !== u || c !== f || h !== g) {
      let p = 1 - a;
      const m = l * u + c * f + h * g + d * v, x = m >= 0 ? 1 : -1, _ = 1 - m * m;
      if (_ > Number.EPSILON) {
        const L = Math.sqrt(_), T = Math.atan2(L, m * x);
        p = Math.sin(p * T) / L, a = Math.sin(a * T) / L;
      }
      const M = a * x;
      if (l = l * p + u * M, c = c * p + f * M, h = h * p + g * M, d = d * p + v * M, p === 1 - a) {
        const L = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
        l *= L, c *= L, h *= L, d *= L;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
  }
  static multiplyQuaternionsFlat(t, e, n, s, r, o) {
    const a = n[s], l = n[s + 1], c = n[s + 2], h = n[s + 3], d = r[o], u = r[o + 1], f = r[o + 2], g = r[o + 3];
    return t[e] = a * g + h * d + l * f - c * u, t[e + 1] = l * g + h * u + c * d - a * f, t[e + 2] = c * g + h * f + a * u - l * d, t[e + 3] = h * g - a * d - l * u - c * f, t;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x = t, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y = t, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(t) {
    this._z = t, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(t) {
    this._w = t, this._onChangeCallback();
  }
  set(t, e, n, s) {
    return this._x = t, this._y = e, this._z = n, this._w = s, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(t) {
    return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this;
  }
  setFromEuler(t, e = !0) {
    const n = t._x, s = t._y, r = t._z, o = t._order, a = Math.cos, l = Math.sin, c = a(n / 2), h = a(s / 2), d = a(r / 2), u = l(n / 2), f = l(s / 2), g = l(r / 2);
    switch (o) {
      case "XYZ":
        this._x = u * h * d + c * f * g, this._y = c * f * d - u * h * g, this._z = c * h * g + u * f * d, this._w = c * h * d - u * f * g;
        break;
      case "YXZ":
        this._x = u * h * d + c * f * g, this._y = c * f * d - u * h * g, this._z = c * h * g - u * f * d, this._w = c * h * d + u * f * g;
        break;
      case "ZXY":
        this._x = u * h * d - c * f * g, this._y = c * f * d + u * h * g, this._z = c * h * g + u * f * d, this._w = c * h * d - u * f * g;
        break;
      case "ZYX":
        this._x = u * h * d - c * f * g, this._y = c * f * d + u * h * g, this._z = c * h * g - u * f * d, this._w = c * h * d + u * f * g;
        break;
      case "YZX":
        this._x = u * h * d + c * f * g, this._y = c * f * d + u * h * g, this._z = c * h * g - u * f * d, this._w = c * h * d - u * f * g;
        break;
      case "XZY":
        this._x = u * h * d - c * f * g, this._y = c * f * d - u * h * g, this._z = c * h * g + u * f * d, this._w = c * h * d + u * f * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + o);
    }
    return e === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(t, e) {
    const n = e / 2, s = Math.sin(n);
    return this._x = t.x * s, this._y = t.y * s, this._z = t.z * s, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t) {
    const e = t.elements, n = e[0], s = e[4], r = e[8], o = e[1], a = e[5], l = e[9], c = e[2], h = e[6], d = e[10], u = n + a + d;
    if (u > 0) {
      const f = 0.5 / Math.sqrt(u + 1);
      this._w = 0.25 / f, this._x = (h - l) * f, this._y = (r - c) * f, this._z = (o - s) * f;
    } else if (n > a && n > d) {
      const f = 2 * Math.sqrt(1 + n - a - d);
      this._w = (h - l) / f, this._x = 0.25 * f, this._y = (s + o) / f, this._z = (r + c) / f;
    } else if (a > d) {
      const f = 2 * Math.sqrt(1 + a - n - d);
      this._w = (r - c) / f, this._x = (s + o) / f, this._y = 0.25 * f, this._z = (l + h) / f;
    } else {
      const f = 2 * Math.sqrt(1 + d - n - a);
      this._w = (o - s) / f, this._x = (r + c) / f, this._y = (l + h) / f, this._z = 0.25 * f;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(t, e) {
    let n = t.dot(e) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize();
  }
  angleTo(t) {
    return 2 * Math.acos(Math.abs(Re(this.dot(t), -1, 1)));
  }
  rotateTowards(t, e) {
    const n = this.angleTo(t);
    if (n === 0) return this;
    const s = Math.min(1, e / n);
    return this.slerp(t, s), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(t) {
    return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let t = this.length();
    return t === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this._onChangeCallback(), this;
  }
  multiply(t) {
    return this.multiplyQuaternions(this, t);
  }
  premultiply(t) {
    return this.multiplyQuaternions(t, this);
  }
  multiplyQuaternions(t, e) {
    const n = t._x, s = t._y, r = t._z, o = t._w, a = e._x, l = e._y, c = e._z, h = e._w;
    return this._x = n * h + o * a + s * c - r * l, this._y = s * h + o * l + r * a - n * c, this._z = r * h + o * c + n * l - s * a, this._w = o * h - n * a - s * l - r * c, this._onChangeCallback(), this;
  }
  slerp(t, e) {
    if (e === 0) return this;
    if (e === 1) return this.copy(t);
    const n = this._x, s = this._y, r = this._z, o = this._w;
    let a = o * t._w + n * t._x + s * t._y + r * t._z;
    if (a < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, a = -a) : this.copy(t), a >= 1)
      return this._w = o, this._x = n, this._y = s, this._z = r, this;
    const l = 1 - a * a;
    if (l <= Number.EPSILON) {
      const f = 1 - e;
      return this._w = f * o + e * this._w, this._x = f * n + e * this._x, this._y = f * s + e * this._y, this._z = f * r + e * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, a), d = Math.sin((1 - e) * h) / c, u = Math.sin(e * h) / c;
    return this._w = o * d + this._w * u, this._x = n * d + this._x * u, this._y = s * d + this._y * u, this._z = r * d + this._z * u, this._onChangeCallback(), this;
  }
  slerpQuaternions(t, e, n) {
    return this.copy(t).slerp(e, n);
  }
  random() {
    const t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), n = Math.random(), s = Math.sqrt(1 - n), r = Math.sqrt(n);
    return this.set(
      s * Math.sin(t),
      s * Math.cos(t),
      r * Math.sin(e),
      r * Math.cos(e)
    );
  }
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w;
  }
  fromArray(t, e = 0) {
    return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this._onChangeCallback(), this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t;
  }
  fromBufferAttribute(t, e) {
    return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class P {
  constructor(t = 0, e = 0, n = 0) {
    P.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = n;
  }
  set(t, e, n) {
    return n === void 0 && (n = this.z), this.x = t, this.y = e, this.z = n, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this;
  }
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this;
  }
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this;
  }
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this;
  }
  multiplyVectors(t, e) {
    return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this;
  }
  applyEuler(t) {
    return this.applyQuaternion(Ic.setFromEuler(t));
  }
  applyAxisAngle(t, e) {
    return this.applyQuaternion(Ic.setFromAxisAngle(t, e));
  }
  applyMatrix3(t) {
    const e = this.x, n = this.y, s = this.z, r = t.elements;
    return this.x = r[0] * e + r[3] * n + r[6] * s, this.y = r[1] * e + r[4] * n + r[7] * s, this.z = r[2] * e + r[5] * n + r[8] * s, this;
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    const e = this.x, n = this.y, s = this.z, r = t.elements, o = 1 / (r[3] * e + r[7] * n + r[11] * s + r[15]);
    return this.x = (r[0] * e + r[4] * n + r[8] * s + r[12]) * o, this.y = (r[1] * e + r[5] * n + r[9] * s + r[13]) * o, this.z = (r[2] * e + r[6] * n + r[10] * s + r[14]) * o, this;
  }
  applyQuaternion(t) {
    const e = this.x, n = this.y, s = this.z, r = t.x, o = t.y, a = t.z, l = t.w, c = 2 * (o * s - a * n), h = 2 * (a * e - r * s), d = 2 * (r * n - o * e);
    return this.x = e + l * c + o * d - a * h, this.y = n + l * h + a * c - r * d, this.z = s + l * d + r * h - o * c, this;
  }
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
  }
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
  }
  transformDirection(t) {
    const e = this.x, n = this.y, s = this.z, r = t.elements;
    return this.x = r[0] * e + r[4] * n + r[8] * s, this.y = r[1] * e + r[5] * n + r[9] * s, this.z = r[2] * e + r[6] * n + r[10] * s, this.normalize();
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
  }
  clamp(t, e) {
    return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), this.z = Math.max(t.z, Math.min(e.z, this.z)), this;
  }
  clampScalar(t, e) {
    return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), this.z = Math.max(t, Math.min(e, this.z)), this;
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(t, Math.min(e, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  // TODO lengthSquared?
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this;
  }
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this;
  }
  cross(t) {
    return this.crossVectors(this, t);
  }
  crossVectors(t, e) {
    const n = t.x, s = t.y, r = t.z, o = e.x, a = e.y, l = e.z;
    return this.x = s * l - r * a, this.y = r * o - n * l, this.z = n * a - s * o, this;
  }
  projectOnVector(t) {
    const e = t.lengthSq();
    if (e === 0) return this.set(0, 0, 0);
    const n = t.dot(this) / e;
    return this.copy(t).multiplyScalar(n);
  }
  projectOnPlane(t) {
    return Oo.copy(this).projectOnVector(t), this.sub(Oo);
  }
  reflect(t) {
    return this.sub(Oo.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Re(n, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const e = this.x - t.x, n = this.y - t.y, s = this.z - t.z;
    return e * e + n * n + s * s;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
  }
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  setFromSphericalCoords(t, e, n) {
    const s = Math.sin(e) * t;
    return this.x = s * Math.sin(n), this.y = Math.cos(e) * t, this.z = s * Math.cos(n), this;
  }
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  setFromCylindricalCoords(t, e, n) {
    return this.x = t * Math.sin(e), this.y = n, this.z = t * Math.cos(e), this;
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this;
  }
  setFromMatrixScale(t) {
    const e = this.setFromMatrixColumn(t, 0).length(), n = this.setFromMatrixColumn(t, 1).length(), s = this.setFromMatrixColumn(t, 2).length();
    return this.x = e, this.y = n, this.z = s, this;
  }
  setFromMatrixColumn(t, e) {
    return this.fromArray(t.elements, e * 4);
  }
  setFromMatrix3Column(t, e) {
    return this.fromArray(t.elements, e * 3);
  }
  setFromEuler(t) {
    return this.x = t._x, this.y = t._y, this.z = t._z, this;
  }
  setFromColor(t) {
    return this.x = t.r, this.y = t.g, this.z = t.b, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t;
  }
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const t = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, n = Math.sqrt(1 - e * e);
    return this.x = n * Math.cos(t), this.y = e, this.z = n * Math.sin(t), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const Oo = /* @__PURE__ */ new P(), Ic = /* @__PURE__ */ new Sn();
class Ke {
  constructor(t = new P(1 / 0, 1 / 0, 1 / 0), e = new P(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = t, this.max = e;
  }
  set(t, e) {
    return this.min.copy(t), this.max.copy(e), this;
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3)
      this.expandByPoint(dn.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++)
      this.expandByPoint(dn.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++)
      this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    const n = dn.copy(e).multiplyScalar(0.5);
    return this.min.copy(t).sub(n), this.max.copy(t).add(n), this;
  }
  setFromObject(t, e = !1) {
    return this.makeEmpty(), this.expandByObject(t, e);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.min.copy(t.min), this.max.copy(t.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
  }
  expandByPoint(t) {
    return this.min.min(t), this.max.max(t), this;
  }
  expandByVector(t) {
    return this.min.sub(t), this.max.add(t), this;
  }
  expandByScalar(t) {
    return this.min.addScalar(-t), this.max.addScalar(t), this;
  }
  expandByObject(t, e = !1) {
    t.updateWorldMatrix(!1, !1);
    const n = t.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (e === !0 && r !== void 0 && t.isInstancedMesh !== !0)
        for (let o = 0, a = r.count; o < a; o++)
          t.isMesh === !0 ? t.getVertexPosition(o, dn) : dn.fromBufferAttribute(r, o), dn.applyMatrix4(t.matrixWorld), this.expandByPoint(dn);
      else
        t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), fr.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), fr.copy(n.boundingBox)), fr.applyMatrix4(t.matrixWorld), this.union(fr);
    }
    const s = t.children;
    for (let r = 0, o = s.length; r < o; r++)
      this.expandByObject(s[r], e);
    return this;
  }
  containsPoint(t) {
    return t.x >= this.min.x && t.x <= this.max.x && t.y >= this.min.y && t.y <= this.max.y && t.z >= this.min.z && t.z <= this.max.z;
  }
  containsBox(t) {
    return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z;
  }
  getParameter(t, e) {
    return e.set(
      (t.x - this.min.x) / (this.max.x - this.min.x),
      (t.y - this.min.y) / (this.max.y - this.min.y),
      (t.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  intersectsBox(t) {
    return t.max.x >= this.min.x && t.min.x <= this.max.x && t.max.y >= this.min.y && t.min.y <= this.max.y && t.max.z >= this.min.z && t.min.z <= this.max.z;
  }
  intersectsSphere(t) {
    return this.clampPoint(t.center, dn), dn.distanceToSquared(t.center) <= t.radius * t.radius;
  }
  intersectsPlane(t) {
    let e, n;
    return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
  }
  intersectsTriangle(t) {
    if (this.isEmpty())
      return !1;
    this.getCenter(Ss), pr.subVectors(this.max, Ss), Pi.subVectors(t.a, Ss), Li.subVectors(t.b, Ss), Ii.subVectors(t.c, Ss), $n.subVectors(Li, Pi), Xn.subVectors(Ii, Li), di.subVectors(Pi, Ii);
    let e = [
      0,
      -$n.z,
      $n.y,
      0,
      -Xn.z,
      Xn.y,
      0,
      -di.z,
      di.y,
      $n.z,
      0,
      -$n.x,
      Xn.z,
      0,
      -Xn.x,
      di.z,
      0,
      -di.x,
      -$n.y,
      $n.x,
      0,
      -Xn.y,
      Xn.x,
      0,
      -di.y,
      di.x,
      0
    ];
    return !Fo(e, Pi, Li, Ii, pr) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Fo(e, Pi, Li, Ii, pr)) ? !1 : (mr.crossVectors($n, Xn), e = [mr.x, mr.y, mr.z], Fo(e, Pi, Li, Ii, pr));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, dn).distanceTo(t);
  }
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(dn).length() * 0.5), t;
  }
  intersect(t) {
    return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(t) {
    return this.min.min(t.min), this.max.max(t.max), this;
  }
  applyMatrix4(t) {
    return this.isEmpty() ? this : (Cn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), Cn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), Cn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), Cn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), Cn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), Cn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), Cn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), Cn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(Cn), this);
  }
  translate(t) {
    return this.min.add(t), this.max.add(t), this;
  }
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
  }
}
const Cn = [
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P(),
  /* @__PURE__ */ new P()
], dn = /* @__PURE__ */ new P(), fr = /* @__PURE__ */ new Ke(), Pi = /* @__PURE__ */ new P(), Li = /* @__PURE__ */ new P(), Ii = /* @__PURE__ */ new P(), $n = /* @__PURE__ */ new P(), Xn = /* @__PURE__ */ new P(), di = /* @__PURE__ */ new P(), Ss = /* @__PURE__ */ new P(), pr = /* @__PURE__ */ new P(), mr = /* @__PURE__ */ new P(), ui = /* @__PURE__ */ new P();
function Fo(i, t, e, n, s) {
  for (let r = 0, o = i.length - 3; r <= o; r += 3) {
    ui.fromArray(i, r);
    const a = s.x * Math.abs(ui.x) + s.y * Math.abs(ui.y) + s.z * Math.abs(ui.z), l = t.dot(ui), c = e.dot(ui), h = n.dot(ui);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a)
      return !1;
  }
  return !0;
}
const Rp = /* @__PURE__ */ new Ke(), bs = /* @__PURE__ */ new P(), Bo = /* @__PURE__ */ new P();
class En {
  constructor(t = new P(), e = -1) {
    this.isSphere = !0, this.center = t, this.radius = e;
  }
  set(t, e) {
    return this.center.copy(t), this.radius = e, this;
  }
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : Rp.setFromPoints(t).getCenter(n);
    let s = 0;
    for (let r = 0, o = t.length; r < o; r++)
      s = Math.max(s, n.distanceToSquared(t[r]));
    return this.radius = Math.sqrt(s), this;
  }
  copy(t) {
    return this.center.copy(t.center), this.radius = t.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(t) {
    return t.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(t) {
    return t.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(t) {
    const e = this.radius + t.radius;
    return t.center.distanceToSquared(this.center) <= e * e;
  }
  intersectsBox(t) {
    return t.intersectsSphere(this);
  }
  intersectsPlane(t) {
    return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(t, e) {
    const n = this.center.distanceToSquared(t);
    return e.copy(t), n > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e;
  }
  getBoundingBox(t) {
    return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
  }
  applyMatrix4(t) {
    return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this;
  }
  translate(t) {
    return this.center.add(t), this;
  }
  expandByPoint(t) {
    if (this.isEmpty())
      return this.center.copy(t), this.radius = 0, this;
    bs.subVectors(t, this.center);
    const e = bs.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), s = (n - this.radius) * 0.5;
      this.center.addScaledVector(bs, s / n), this.radius += s;
    }
    return this;
  }
  union(t) {
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (Bo.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(bs.copy(t.center).add(Bo)), this.expandByPoint(bs.copy(t.center).sub(Bo))), this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Pn = /* @__PURE__ */ new P(), ko = /* @__PURE__ */ new P(), gr = /* @__PURE__ */ new P(), jn = /* @__PURE__ */ new P(), zo = /* @__PURE__ */ new P(), _r = /* @__PURE__ */ new P(), Ho = /* @__PURE__ */ new P();
class ms {
  constructor(t = new P(), e = new P(0, 0, -1)) {
    this.origin = t, this.direction = e;
  }
  set(t, e) {
    return this.origin.copy(t), this.direction.copy(e), this;
  }
  copy(t) {
    return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
  }
  at(t, e) {
    return e.copy(this.origin).addScaledVector(this.direction, t);
  }
  lookAt(t) {
    return this.direction.copy(t).sub(this.origin).normalize(), this;
  }
  recast(t) {
    return this.origin.copy(this.at(t, Pn)), this;
  }
  closestPointToPoint(t, e) {
    e.subVectors(t, this.origin);
    const n = e.dot(this.direction);
    return n < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(t) {
    return Math.sqrt(this.distanceSqToPoint(t));
  }
  distanceSqToPoint(t) {
    const e = Pn.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (Pn.copy(this.origin).addScaledVector(this.direction, e), Pn.distanceToSquared(t));
  }
  distanceSqToSegment(t, e, n, s) {
    ko.copy(t).add(e).multiplyScalar(0.5), gr.copy(e).sub(t).normalize(), jn.copy(this.origin).sub(ko);
    const r = t.distanceTo(e) * 0.5, o = -this.direction.dot(gr), a = jn.dot(this.direction), l = -jn.dot(gr), c = jn.lengthSq(), h = Math.abs(1 - o * o);
    let d, u, f, g;
    if (h > 0)
      if (d = o * l - a, u = o * a - l, g = r * h, d >= 0)
        if (u >= -g)
          if (u <= g) {
            const v = 1 / h;
            d *= v, u *= v, f = d * (d + o * u + 2 * a) + u * (o * d + u + 2 * l) + c;
          } else
            u = r, d = Math.max(0, -(o * u + a)), f = -d * d + u * (u + 2 * l) + c;
        else
          u = -r, d = Math.max(0, -(o * u + a)), f = -d * d + u * (u + 2 * l) + c;
      else
        u <= -g ? (d = Math.max(0, -(-o * r + a)), u = d > 0 ? -r : Math.min(Math.max(-r, -l), r), f = -d * d + u * (u + 2 * l) + c) : u <= g ? (d = 0, u = Math.min(Math.max(-r, -l), r), f = u * (u + 2 * l) + c) : (d = Math.max(0, -(o * r + a)), u = d > 0 ? r : Math.min(Math.max(-r, -l), r), f = -d * d + u * (u + 2 * l) + c);
    else
      u = o > 0 ? -r : r, d = Math.max(0, -(o * u + a)), f = -d * d + u * (u + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, d), s && s.copy(ko).addScaledVector(gr, u), f;
  }
  intersectSphere(t, e) {
    Pn.subVectors(t.center, this.origin);
    const n = Pn.dot(this.direction), s = Pn.dot(Pn) - n * n, r = t.radius * t.radius;
    if (s > r) return null;
    const o = Math.sqrt(r - s), a = n - o, l = n + o;
    return l < 0 ? null : a < 0 ? this.at(l, e) : this.at(a, e);
  }
  intersectsSphere(t) {
    return this.distanceSqToPoint(t.center) <= t.radius * t.radius;
  }
  distanceToPlane(t) {
    const e = t.normal.dot(this.direction);
    if (e === 0)
      return t.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(t.normal) + t.constant) / e;
    return n >= 0 ? n : null;
  }
  intersectPlane(t, e) {
    const n = this.distanceToPlane(t);
    return n === null ? null : this.at(n, e);
  }
  intersectsPlane(t) {
    const e = t.distanceToPoint(this.origin);
    return e === 0 || t.normal.dot(this.direction) * e < 0;
  }
  intersectBox(t, e) {
    let n, s, r, o, a, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, d = 1 / this.direction.z, u = this.origin;
    return c >= 0 ? (n = (t.min.x - u.x) * c, s = (t.max.x - u.x) * c) : (n = (t.max.x - u.x) * c, s = (t.min.x - u.x) * c), h >= 0 ? (r = (t.min.y - u.y) * h, o = (t.max.y - u.y) * h) : (r = (t.max.y - u.y) * h, o = (t.min.y - u.y) * h), n > o || r > s || ((r > n || isNaN(n)) && (n = r), (o < s || isNaN(s)) && (s = o), d >= 0 ? (a = (t.min.z - u.z) * d, l = (t.max.z - u.z) * d) : (a = (t.max.z - u.z) * d, l = (t.min.z - u.z) * d), n > l || a > s) || ((a > n || n !== n) && (n = a), (l < s || s !== s) && (s = l), s < 0) ? null : this.at(n >= 0 ? n : s, e);
  }
  intersectsBox(t) {
    return this.intersectBox(t, Pn) !== null;
  }
  intersectTriangle(t, e, n, s, r) {
    zo.subVectors(e, t), _r.subVectors(n, t), Ho.crossVectors(zo, _r);
    let o = this.direction.dot(Ho), a;
    if (o > 0) {
      if (s) return null;
      a = 1;
    } else if (o < 0)
      a = -1, o = -o;
    else
      return null;
    jn.subVectors(this.origin, t);
    const l = a * this.direction.dot(_r.crossVectors(jn, _r));
    if (l < 0)
      return null;
    const c = a * this.direction.dot(zo.cross(jn));
    if (c < 0 || l + c > o)
      return null;
    const h = -a * jn.dot(Ho);
    return h < 0 ? null : this.at(h / o, r);
  }
  applyMatrix4(t) {
    return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this;
  }
  equals(t) {
    return t.origin.equals(this.origin) && t.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Ft {
  constructor(t, e, n, s, r, o, a, l, c, h, d, u, f, g, v, p) {
    Ft.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, e, n, s, r, o, a, l, c, h, d, u, f, g, v, p);
  }
  set(t, e, n, s, r, o, a, l, c, h, d, u, f, g, v, p) {
    const m = this.elements;
    return m[0] = t, m[4] = e, m[8] = n, m[12] = s, m[1] = r, m[5] = o, m[9] = a, m[13] = l, m[2] = c, m[6] = h, m[10] = d, m[14] = u, m[3] = f, m[7] = g, m[11] = v, m[15] = p, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  clone() {
    return new Ft().fromArray(this.elements);
  }
  copy(t) {
    const e = this.elements, n = t.elements;
    return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], e[9] = n[9], e[10] = n[10], e[11] = n[11], e[12] = n[12], e[13] = n[13], e[14] = n[14], e[15] = n[15], this;
  }
  copyPosition(t) {
    const e = this.elements, n = t.elements;
    return e[12] = n[12], e[13] = n[13], e[14] = n[14], this;
  }
  setFromMatrix3(t) {
    const e = t.elements;
    return this.set(
      e[0],
      e[3],
      e[6],
      0,
      e[1],
      e[4],
      e[7],
      0,
      e[2],
      e[5],
      e[8],
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractBasis(t, e, n) {
    return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(t, e, n) {
    return this.set(
      t.x,
      e.x,
      n.x,
      0,
      t.y,
      e.y,
      n.y,
      0,
      t.z,
      e.z,
      n.z,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractRotation(t) {
    const e = this.elements, n = t.elements, s = 1 / Di.setFromMatrixColumn(t, 0).length(), r = 1 / Di.setFromMatrixColumn(t, 1).length(), o = 1 / Di.setFromMatrixColumn(t, 2).length();
    return e[0] = n[0] * s, e[1] = n[1] * s, e[2] = n[2] * s, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * o, e[9] = n[9] * o, e[10] = n[10] * o, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    const e = this.elements, n = t.x, s = t.y, r = t.z, o = Math.cos(n), a = Math.sin(n), l = Math.cos(s), c = Math.sin(s), h = Math.cos(r), d = Math.sin(r);
    if (t.order === "XYZ") {
      const u = o * h, f = o * d, g = a * h, v = a * d;
      e[0] = l * h, e[4] = -l * d, e[8] = c, e[1] = f + g * c, e[5] = u - v * c, e[9] = -a * l, e[2] = v - u * c, e[6] = g + f * c, e[10] = o * l;
    } else if (t.order === "YXZ") {
      const u = l * h, f = l * d, g = c * h, v = c * d;
      e[0] = u + v * a, e[4] = g * a - f, e[8] = o * c, e[1] = o * d, e[5] = o * h, e[9] = -a, e[2] = f * a - g, e[6] = v + u * a, e[10] = o * l;
    } else if (t.order === "ZXY") {
      const u = l * h, f = l * d, g = c * h, v = c * d;
      e[0] = u - v * a, e[4] = -o * d, e[8] = g + f * a, e[1] = f + g * a, e[5] = o * h, e[9] = v - u * a, e[2] = -o * c, e[6] = a, e[10] = o * l;
    } else if (t.order === "ZYX") {
      const u = o * h, f = o * d, g = a * h, v = a * d;
      e[0] = l * h, e[4] = g * c - f, e[8] = u * c + v, e[1] = l * d, e[5] = v * c + u, e[9] = f * c - g, e[2] = -c, e[6] = a * l, e[10] = o * l;
    } else if (t.order === "YZX") {
      const u = o * l, f = o * c, g = a * l, v = a * c;
      e[0] = l * h, e[4] = v - u * d, e[8] = g * d + f, e[1] = d, e[5] = o * h, e[9] = -a * h, e[2] = -c * h, e[6] = f * d + g, e[10] = u - v * d;
    } else if (t.order === "XZY") {
      const u = o * l, f = o * c, g = a * l, v = a * c;
      e[0] = l * h, e[4] = -d, e[8] = c * h, e[1] = u * d + v, e[5] = o * h, e[9] = f * d - g, e[2] = g * d - f, e[6] = a * h, e[10] = v * d + u;
    }
    return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Cp, t, Pp);
  }
  lookAt(t, e, n) {
    const s = this.elements;
    return Je.subVectors(t, e), Je.lengthSq() === 0 && (Je.z = 1), Je.normalize(), Kn.crossVectors(n, Je), Kn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Je.x += 1e-4 : Je.z += 1e-4, Je.normalize(), Kn.crossVectors(n, Je)), Kn.normalize(), vr.crossVectors(Je, Kn), s[0] = Kn.x, s[4] = vr.x, s[8] = Je.x, s[1] = Kn.y, s[5] = vr.y, s[9] = Je.y, s[2] = Kn.z, s[6] = vr.z, s[10] = Je.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements, s = e.elements, r = this.elements, o = n[0], a = n[4], l = n[8], c = n[12], h = n[1], d = n[5], u = n[9], f = n[13], g = n[2], v = n[6], p = n[10], m = n[14], x = n[3], _ = n[7], M = n[11], L = n[15], T = s[0], w = s[4], R = s[8], F = s[12], y = s[1], S = s[5], N = s[9], k = s[13], G = s[2], q = s[6], W = s[10], et = s[14], $ = s[3], lt = s[7], ct = s[11], St = s[15];
    return r[0] = o * T + a * y + l * G + c * $, r[4] = o * w + a * S + l * q + c * lt, r[8] = o * R + a * N + l * W + c * ct, r[12] = o * F + a * k + l * et + c * St, r[1] = h * T + d * y + u * G + f * $, r[5] = h * w + d * S + u * q + f * lt, r[9] = h * R + d * N + u * W + f * ct, r[13] = h * F + d * k + u * et + f * St, r[2] = g * T + v * y + p * G + m * $, r[6] = g * w + v * S + p * q + m * lt, r[10] = g * R + v * N + p * W + m * ct, r[14] = g * F + v * k + p * et + m * St, r[3] = x * T + _ * y + M * G + L * $, r[7] = x * w + _ * S + M * q + L * lt, r[11] = x * R + _ * N + M * W + L * ct, r[15] = x * F + _ * k + M * et + L * St, this;
  }
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
  }
  determinant() {
    const t = this.elements, e = t[0], n = t[4], s = t[8], r = t[12], o = t[1], a = t[5], l = t[9], c = t[13], h = t[2], d = t[6], u = t[10], f = t[14], g = t[3], v = t[7], p = t[11], m = t[15];
    return g * (+r * l * d - s * c * d - r * a * u + n * c * u + s * a * f - n * l * f) + v * (+e * l * f - e * c * u + r * o * u - s * o * f + s * c * h - r * l * h) + p * (+e * c * d - e * a * f - r * o * d + n * o * f + r * a * h - n * c * h) + m * (-s * a * h - e * l * d + e * a * u + s * o * d - n * o * u + n * l * h);
  }
  transpose() {
    const t = this.elements;
    let e;
    return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
  }
  setPosition(t, e, n) {
    const s = this.elements;
    return t.isVector3 ? (s[12] = t.x, s[13] = t.y, s[14] = t.z) : (s[12] = t, s[13] = e, s[14] = n), this;
  }
  invert() {
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], d = t[9], u = t[10], f = t[11], g = t[12], v = t[13], p = t[14], m = t[15], x = d * p * c - v * u * c + v * l * f - a * p * f - d * l * m + a * u * m, _ = g * u * c - h * p * c - g * l * f + o * p * f + h * l * m - o * u * m, M = h * v * c - g * d * c + g * a * f - o * v * f - h * a * m + o * d * m, L = g * d * l - h * v * l - g * a * u + o * v * u + h * a * p - o * d * p, T = e * x + n * _ + s * M + r * L;
    if (T === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const w = 1 / T;
    return t[0] = x * w, t[1] = (v * u * r - d * p * r - v * s * f + n * p * f + d * s * m - n * u * m) * w, t[2] = (a * p * r - v * l * r + v * s * c - n * p * c - a * s * m + n * l * m) * w, t[3] = (d * l * r - a * u * r - d * s * c + n * u * c + a * s * f - n * l * f) * w, t[4] = _ * w, t[5] = (h * p * r - g * u * r + g * s * f - e * p * f - h * s * m + e * u * m) * w, t[6] = (g * l * r - o * p * r - g * s * c + e * p * c + o * s * m - e * l * m) * w, t[7] = (o * u * r - h * l * r + h * s * c - e * u * c - o * s * f + e * l * f) * w, t[8] = M * w, t[9] = (g * d * r - h * v * r - g * n * f + e * v * f + h * n * m - e * d * m) * w, t[10] = (o * v * r - g * a * r + g * n * c - e * v * c - o * n * m + e * a * m) * w, t[11] = (h * a * r - o * d * r - h * n * c + e * d * c + o * n * f - e * a * f) * w, t[12] = L * w, t[13] = (h * v * s - g * d * s + g * n * u - e * v * u - h * n * p + e * d * p) * w, t[14] = (g * a * s - o * v * s - g * n * l + e * v * l + o * n * p - e * a * p) * w, t[15] = (o * d * s - h * a * s + h * n * l - e * d * l - o * n * u + e * a * u) * w, this;
  }
  scale(t) {
    const e = this.elements, n = t.x, s = t.y, r = t.z;
    return e[0] *= n, e[4] *= s, e[8] *= r, e[1] *= n, e[5] *= s, e[9] *= r, e[2] *= n, e[6] *= s, e[10] *= r, e[3] *= n, e[7] *= s, e[11] *= r, this;
  }
  getMaxScaleOnAxis() {
    const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(e, n, s));
  }
  makeTranslation(t, e, n) {
    return t.isVector3 ? this.set(
      1,
      0,
      0,
      t.x,
      0,
      1,
      0,
      t.y,
      0,
      0,
      1,
      t.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      t,
      0,
      1,
      0,
      e,
      0,
      0,
      1,
      n,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationX(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      e,
      -n,
      0,
      0,
      n,
      e,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationY(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      e,
      0,
      n,
      0,
      0,
      1,
      0,
      0,
      -n,
      0,
      e,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationZ(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      e,
      -n,
      0,
      0,
      n,
      e,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationAxis(t, e) {
    const n = Math.cos(e), s = Math.sin(e), r = 1 - n, o = t.x, a = t.y, l = t.z, c = r * o, h = r * a;
    return this.set(
      c * o + n,
      c * a - s * l,
      c * l + s * a,
      0,
      c * a + s * l,
      h * a + n,
      h * l - s * o,
      0,
      c * l - s * a,
      h * l + s * o,
      r * l * l + n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(t, e, n) {
    return this.set(
      t,
      0,
      0,
      0,
      0,
      e,
      0,
      0,
      0,
      0,
      n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeShear(t, e, n, s, r, o) {
    return this.set(
      1,
      n,
      r,
      0,
      t,
      1,
      o,
      0,
      e,
      s,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  compose(t, e, n) {
    const s = this.elements, r = e._x, o = e._y, a = e._z, l = e._w, c = r + r, h = o + o, d = a + a, u = r * c, f = r * h, g = r * d, v = o * h, p = o * d, m = a * d, x = l * c, _ = l * h, M = l * d, L = n.x, T = n.y, w = n.z;
    return s[0] = (1 - (v + m)) * L, s[1] = (f + M) * L, s[2] = (g - _) * L, s[3] = 0, s[4] = (f - M) * T, s[5] = (1 - (u + m)) * T, s[6] = (p + x) * T, s[7] = 0, s[8] = (g + _) * w, s[9] = (p - x) * w, s[10] = (1 - (u + v)) * w, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this;
  }
  decompose(t, e, n) {
    const s = this.elements;
    let r = Di.set(s[0], s[1], s[2]).length();
    const o = Di.set(s[4], s[5], s[6]).length(), a = Di.set(s[8], s[9], s[10]).length();
    this.determinant() < 0 && (r = -r), t.x = s[12], t.y = s[13], t.z = s[14], un.copy(this);
    const c = 1 / r, h = 1 / o, d = 1 / a;
    return un.elements[0] *= c, un.elements[1] *= c, un.elements[2] *= c, un.elements[4] *= h, un.elements[5] *= h, un.elements[6] *= h, un.elements[8] *= d, un.elements[9] *= d, un.elements[10] *= d, e.setFromRotationMatrix(un), n.x = r, n.y = o, n.z = a, this;
  }
  makePerspective(t, e, n, s, r, o, a = kn) {
    const l = this.elements, c = 2 * r / (e - t), h = 2 * r / (n - s), d = (e + t) / (e - t), u = (n + s) / (n - s);
    let f, g;
    if (a === kn)
      f = -(o + r) / (o - r), g = -2 * o * r / (o - r);
    else if (a === fo)
      f = -o / (o - r), g = -o * r / (o - r);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + a);
    return l[0] = c, l[4] = 0, l[8] = d, l[12] = 0, l[1] = 0, l[5] = h, l[9] = u, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = f, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(t, e, n, s, r, o, a = kn) {
    const l = this.elements, c = 1 / (e - t), h = 1 / (n - s), d = 1 / (o - r), u = (e + t) * c, f = (n + s) * h;
    let g, v;
    if (a === kn)
      g = (o + r) * d, v = -2 * d;
    else if (a === fo)
      g = r * d, v = -1 * d;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + a);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -u, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -f, l[2] = 0, l[6] = 0, l[10] = v, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
  }
  equals(t) {
    const e = this.elements, n = t.elements;
    for (let s = 0; s < 16; s++)
      if (e[s] !== n[s]) return !1;
    return !0;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 16; n++)
      this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t[e + 9] = n[9], t[e + 10] = n[10], t[e + 11] = n[11], t[e + 12] = n[12], t[e + 13] = n[13], t[e + 14] = n[14], t[e + 15] = n[15], t;
  }
}
const Di = /* @__PURE__ */ new P(), un = /* @__PURE__ */ new Ft(), Cp = /* @__PURE__ */ new P(0, 0, 0), Pp = /* @__PURE__ */ new P(1, 1, 1), Kn = /* @__PURE__ */ new P(), vr = /* @__PURE__ */ new P(), Je = /* @__PURE__ */ new P(), Dc = /* @__PURE__ */ new Ft(), Nc = /* @__PURE__ */ new Sn();
class bn {
  constructor(t = 0, e = 0, n = 0, s = bn.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = t, this._y = e, this._z = n, this._order = s;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x = t, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y = t, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(t) {
    this._z = t, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(t) {
    this._order = t, this._onChangeCallback();
  }
  set(t, e, n, s = this._order) {
    return this._x = t, this._y = e, this._z = n, this._order = s, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(t) {
    return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t, e = this._order, n = !0) {
    const s = t.elements, r = s[0], o = s[4], a = s[8], l = s[1], c = s[5], h = s[9], d = s[2], u = s[6], f = s[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Re(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-o, r)) : (this._x = Math.atan2(u, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Re(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, f), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Re(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(-d, f), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Re(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(u, f), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-o, c));
        break;
      case "YZX":
        this._z = Math.asin(Re(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, r)) : (this._x = 0, this._y = Math.atan2(a, f));
        break;
      case "XZY":
        this._z = Math.asin(-Re(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(u, c), this._y = Math.atan2(a, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
    }
    return this._order = e, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(t, e, n) {
    return Dc.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Dc, e, n);
  }
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
  }
  reorder(t) {
    return Nc.setFromEuler(this), this.setFromQuaternion(Nc, t);
  }
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
  }
  fromArray(t) {
    return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t;
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
bn.DEFAULT_ORDER = "XYZ";
class Nl {
  constructor() {
    this.mask = 1;
  }
  set(t) {
    this.mask = (1 << t | 0) >>> 0;
  }
  enable(t) {
    this.mask |= 1 << t | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(t) {
    this.mask ^= 1 << t | 0;
  }
  disable(t) {
    this.mask &= ~(1 << t | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(t) {
    return (this.mask & t.mask) !== 0;
  }
  isEnabled(t) {
    return (this.mask & (1 << t | 0)) !== 0;
  }
}
let Lp = 0;
const Uc = /* @__PURE__ */ new P(), Ni = /* @__PURE__ */ new Sn(), Ln = /* @__PURE__ */ new Ft(), xr = /* @__PURE__ */ new P(), Es = /* @__PURE__ */ new P(), Ip = /* @__PURE__ */ new P(), Dp = /* @__PURE__ */ new Sn(), Oc = /* @__PURE__ */ new P(1, 0, 0), Fc = /* @__PURE__ */ new P(0, 1, 0), Bc = /* @__PURE__ */ new P(0, 0, 1), kc = { type: "added" }, Np = { type: "removed" }, Ui = { type: "childadded", child: null }, Go = { type: "childremoved", child: null };
class ye extends Ti {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Lp++ }), this.uuid = cn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = ye.DEFAULT_UP.clone();
    const t = new P(), e = new bn(), n = new Sn(), s = new P(1, 1, 1);
    function r() {
      n.setFromEuler(e, !1);
    }
    function o() {
      e.setFromQuaternion(n, void 0, !1);
    }
    e._onChange(r), n._onChange(o), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: s
      },
      modelViewMatrix: {
        value: new Ft()
      },
      normalMatrix: {
        value: new Vt()
      }
    }), this.matrix = new Ft(), this.matrixWorld = new Ft(), this.matrixAutoUpdate = ye.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = ye.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Nl(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(t) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(t) {
    return this.quaternion.premultiply(t), this;
  }
  setRotationFromAxisAngle(t, e) {
    this.quaternion.setFromAxisAngle(t, e);
  }
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, !0);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, e) {
    return Ni.setFromAxisAngle(t, e), this.quaternion.multiply(Ni), this;
  }
  rotateOnWorldAxis(t, e) {
    return Ni.setFromAxisAngle(t, e), this.quaternion.premultiply(Ni), this;
  }
  rotateX(t) {
    return this.rotateOnAxis(Oc, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(Fc, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(Bc, t);
  }
  translateOnAxis(t, e) {
    return Uc.copy(t).applyQuaternion(this.quaternion), this.position.add(Uc.multiplyScalar(e)), this;
  }
  translateX(t) {
    return this.translateOnAxis(Oc, t);
  }
  translateY(t) {
    return this.translateOnAxis(Fc, t);
  }
  translateZ(t) {
    return this.translateOnAxis(Bc, t);
  }
  localToWorld(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(Ln.copy(this.matrixWorld).invert());
  }
  lookAt(t, e, n) {
    t.isVector3 ? xr.copy(t) : xr.set(t, e, n);
    const s = this.parent;
    this.updateWorldMatrix(!0, !1), Es.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Ln.lookAt(Es, xr, this.up) : Ln.lookAt(xr, Es, this.up), this.quaternion.setFromRotationMatrix(Ln), s && (Ln.extractRotation(s.matrixWorld), Ni.setFromRotationMatrix(Ln), this.quaternion.premultiply(Ni.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++)
        this.add(arguments[e]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(kc), Ui.child = t, this.dispatchEvent(Ui), Ui.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Np), Go.child = t, this.dispatchEvent(Go), Go.child = null), this;
  }
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(!0, !1), Ln.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), Ln.multiply(t.parent.matrixWorld)), t.applyMatrix4(Ln), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(kc), Ui.child = t, this.dispatchEvent(Ui), Ui.child = null, this;
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, e) {
    if (this[t] === e) return this;
    for (let n = 0, s = this.children.length; n < s; n++) {
      const o = this.children[n].getObjectByProperty(t, e);
      if (o !== void 0)
        return o;
    }
  }
  getObjectsByProperty(t, e, n = []) {
    this[t] === e && n.push(this);
    const s = this.children;
    for (let r = 0, o = s.length; r < o; r++)
      s[r].getObjectsByProperty(t, e, n);
    return n;
  }
  getWorldPosition(t) {
    return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Es, t, Ip), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Es, Dp, t), t;
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(!0, !1);
    const e = this.matrixWorld.elements;
    return t.set(e[8], e[9], e[10]).normalize();
  }
  raycast() {
  }
  traverse(t) {
    t(this);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++)
      e[n].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === !1) return;
    t(this);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++)
      e[n].traverseVisible(t);
  }
  traverseAncestors(t) {
    const e = this.parent;
    e !== null && (t(e), e.traverseAncestors(t));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(t) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, t = !0);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++)
      e[n].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, e) {
    const n = this.parent;
    if (t === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === !0) {
      const s = this.children;
      for (let r = 0, o = s.length; r < o; r++)
        s[r].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string", n = {};
    e && (t = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, n.metadata = {
      version: 4.6,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const s = {};
    s.uuid = this.uuid, s.type = this.type, this.name !== "" && (s.name = this.name), this.castShadow === !0 && (s.castShadow = !0), this.receiveShadow === !0 && (s.receiveShadow = !0), this.visible === !1 && (s.visible = !1), this.frustumCulled === !1 && (s.frustumCulled = !1), this.renderOrder !== 0 && (s.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (s.userData = this.userData), s.layers = this.layers.mask, s.matrix = this.matrix.toArray(), s.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (s.matrixAutoUpdate = !1), this.isInstancedMesh && (s.type = "InstancedMesh", s.count = this.count, s.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (s.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (s.type = "BatchedMesh", s.perObjectFrustumCulled = this.perObjectFrustumCulled, s.sortObjects = this.sortObjects, s.drawRanges = this._drawRanges, s.reservedRanges = this._reservedRanges, s.visibility = this._visibility, s.active = this._active, s.bounds = this._bounds.map((a) => ({
      boxInitialized: a.boxInitialized,
      boxMin: a.box.min.toArray(),
      boxMax: a.box.max.toArray(),
      sphereInitialized: a.sphereInitialized,
      sphereRadius: a.sphere.radius,
      sphereCenter: a.sphere.center.toArray()
    })), s.maxInstanceCount = this._maxInstanceCount, s.maxVertexCount = this._maxVertexCount, s.maxIndexCount = this._maxIndexCount, s.geometryInitialized = this._geometryInitialized, s.geometryCount = this._geometryCount, s.matricesTexture = this._matricesTexture.toJSON(t), this._colorsTexture !== null && (s.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (s.boundingSphere = {
      center: s.boundingSphere.center.toArray(),
      radius: s.boundingSphere.radius
    }), this.boundingBox !== null && (s.boundingBox = {
      min: s.boundingBox.min.toArray(),
      max: s.boundingBox.max.toArray()
    }));
    function r(a, l) {
      return a[l.uuid] === void 0 && (a[l.uuid] = l.toJSON(t)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? s.background = this.background.toJSON() : this.background.isTexture && (s.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (s.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      s.geometry = r(t.geometries, this.geometry);
      const a = this.geometry.parameters;
      if (a !== void 0 && a.shapes !== void 0) {
        const l = a.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const d = l[c];
            r(t.shapes, d);
          }
        else
          r(t.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (s.bindMode = this.bindMode, s.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(t.skeletons, this.skeleton), s.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const a = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          a.push(r(t.materials, this.material[l]));
        s.material = a;
      } else
        s.material = r(t.materials, this.material);
    if (this.children.length > 0) {
      s.children = [];
      for (let a = 0; a < this.children.length; a++)
        s.children.push(this.children[a].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      s.animations = [];
      for (let a = 0; a < this.animations.length; a++) {
        const l = this.animations[a];
        s.animations.push(r(t.animations, l));
      }
    }
    if (e) {
      const a = o(t.geometries), l = o(t.materials), c = o(t.textures), h = o(t.images), d = o(t.shapes), u = o(t.skeletons), f = o(t.animations), g = o(t.nodes);
      a.length > 0 && (n.geometries = a), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), d.length > 0 && (n.shapes = d), u.length > 0 && (n.skeletons = u), f.length > 0 && (n.animations = f), g.length > 0 && (n.nodes = g);
    }
    return n.object = s, n;
    function o(a) {
      const l = [];
      for (const c in a) {
        const h = a[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, e = !0) {
    if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === !0)
      for (let n = 0; n < t.children.length; n++) {
        const s = t.children[n];
        this.add(s.clone());
      }
    return this;
  }
}
ye.DEFAULT_UP = /* @__PURE__ */ new P(0, 1, 0);
ye.DEFAULT_MATRIX_AUTO_UPDATE = !0;
ye.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const fn = /* @__PURE__ */ new P(), In = /* @__PURE__ */ new P(), Vo = /* @__PURE__ */ new P(), Dn = /* @__PURE__ */ new P(), Oi = /* @__PURE__ */ new P(), Fi = /* @__PURE__ */ new P(), zc = /* @__PURE__ */ new P(), Wo = /* @__PURE__ */ new P(), $o = /* @__PURE__ */ new P(), Xo = /* @__PURE__ */ new P(), jo = /* @__PURE__ */ new re(), Ko = /* @__PURE__ */ new re(), qo = /* @__PURE__ */ new re();
class an {
  constructor(t = new P(), e = new P(), n = new P()) {
    this.a = t, this.b = e, this.c = n;
  }
  static getNormal(t, e, n, s) {
    s.subVectors(n, e), fn.subVectors(t, e), s.cross(fn);
    const r = s.lengthSq();
    return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(t, e, n, s, r) {
    fn.subVectors(s, e), In.subVectors(n, e), Vo.subVectors(t, e);
    const o = fn.dot(fn), a = fn.dot(In), l = fn.dot(Vo), c = In.dot(In), h = In.dot(Vo), d = o * c - a * a;
    if (d === 0)
      return r.set(0, 0, 0), null;
    const u = 1 / d, f = (c * l - a * h) * u, g = (o * h - a * l) * u;
    return r.set(1 - f - g, g, f);
  }
  static containsPoint(t, e, n, s) {
    return this.getBarycoord(t, e, n, s, Dn) === null ? !1 : Dn.x >= 0 && Dn.y >= 0 && Dn.x + Dn.y <= 1;
  }
  static getInterpolation(t, e, n, s, r, o, a, l) {
    return this.getBarycoord(t, e, n, s, Dn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, Dn.x), l.addScaledVector(o, Dn.y), l.addScaledVector(a, Dn.z), l);
  }
  static getInterpolatedAttribute(t, e, n, s, r, o) {
    return jo.setScalar(0), Ko.setScalar(0), qo.setScalar(0), jo.fromBufferAttribute(t, e), Ko.fromBufferAttribute(t, n), qo.fromBufferAttribute(t, s), o.setScalar(0), o.addScaledVector(jo, r.x), o.addScaledVector(Ko, r.y), o.addScaledVector(qo, r.z), o;
  }
  static isFrontFacing(t, e, n, s) {
    return fn.subVectors(n, e), In.subVectors(t, e), fn.cross(In).dot(s) < 0;
  }
  set(t, e, n) {
    return this.a.copy(t), this.b.copy(e), this.c.copy(n), this;
  }
  setFromPointsAndIndices(t, e, n, s) {
    return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[s]), this;
  }
  setFromAttributeAndIndices(t, e, n, s) {
    return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, n), this.c.fromBufferAttribute(t, s), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
  }
  getArea() {
    return fn.subVectors(this.c, this.b), In.subVectors(this.a, this.b), fn.cross(In).length() * 0.5;
  }
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return an.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, e) {
    return an.getBarycoord(t, this.a, this.b, this.c, e);
  }
  getInterpolation(t, e, n, s, r) {
    return an.getInterpolation(t, this.a, this.b, this.c, e, n, s, r);
  }
  containsPoint(t) {
    return an.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return an.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, e) {
    const n = this.a, s = this.b, r = this.c;
    let o, a;
    Oi.subVectors(s, n), Fi.subVectors(r, n), Wo.subVectors(t, n);
    const l = Oi.dot(Wo), c = Fi.dot(Wo);
    if (l <= 0 && c <= 0)
      return e.copy(n);
    $o.subVectors(t, s);
    const h = Oi.dot($o), d = Fi.dot($o);
    if (h >= 0 && d <= h)
      return e.copy(s);
    const u = l * d - h * c;
    if (u <= 0 && l >= 0 && h <= 0)
      return o = l / (l - h), e.copy(n).addScaledVector(Oi, o);
    Xo.subVectors(t, r);
    const f = Oi.dot(Xo), g = Fi.dot(Xo);
    if (g >= 0 && f <= g)
      return e.copy(r);
    const v = f * c - l * g;
    if (v <= 0 && c >= 0 && g <= 0)
      return a = c / (c - g), e.copy(n).addScaledVector(Fi, a);
    const p = h * g - f * d;
    if (p <= 0 && d - h >= 0 && f - g >= 0)
      return zc.subVectors(r, s), a = (d - h) / (d - h + (f - g)), e.copy(s).addScaledVector(zc, a);
    const m = 1 / (p + v + u);
    return o = v * m, a = u * m, e.copy(n).addScaledVector(Oi, o).addScaledVector(Fi, a);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const Wd = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, qn = { h: 0, s: 0, l: 0 }, yr = { h: 0, s: 0, l: 0 };
function Yo(i, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
}
class Ct {
  constructor(t, e, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(t, e, n);
  }
  set(t, e, n) {
    if (e === void 0 && n === void 0) {
      const s = t;
      s && s.isColor ? this.copy(s) : typeof s == "number" ? this.setHex(s) : typeof s == "string" && this.setStyle(s);
    } else
      this.setRGB(t, e, n);
    return this;
  }
  setScalar(t) {
    return this.r = t, this.g = t, this.b = t, this;
  }
  setHex(t, e = ke) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, ne.toWorkingColorSpace(this, e), this;
  }
  setRGB(t, e, n, s = ne.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, ne.toWorkingColorSpace(this, s), this;
  }
  setHSL(t, e, n, s = ne.workingColorSpace) {
    if (t = Dl(t, 1), e = Re(e, 0, 1), n = Re(n, 0, 1), e === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, o = 2 * n - r;
      this.r = Yo(o, r, t + 1 / 3), this.g = Yo(o, r, t), this.b = Yo(o, r, t - 1 / 3);
    }
    return ne.toWorkingColorSpace(this, s), this;
  }
  setStyle(t, e = ke) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.");
    }
    let s;
    if (s = /^(\w+)\(([^\)]*)\)/.exec(t)) {
      let r;
      const o = s[1], a = s[2];
      switch (o) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(
              Math.min(255, parseInt(r[1], 10)) / 255,
              Math.min(255, parseInt(r[2], 10)) / 255,
              Math.min(255, parseInt(r[3], 10)) / 255,
              e
            );
          if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(
              Math.min(100, parseInt(r[1], 10)) / 100,
              Math.min(100, parseInt(r[2], 10)) / 100,
              Math.min(100, parseInt(r[3], 10)) / 100,
              e
            );
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setHSL(
              parseFloat(r[1]) / 360,
              parseFloat(r[2]) / 100,
              parseFloat(r[3]) / 100,
              e
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + t);
      }
    } else if (s = /^\#([A-Fa-f\d]+)$/.exec(t)) {
      const r = s[1], o = r.length;
      if (o === 3)
        return this.setRGB(
          parseInt(r.charAt(0), 16) / 15,
          parseInt(r.charAt(1), 16) / 15,
          parseInt(r.charAt(2), 16) / 15,
          e
        );
      if (o === 6)
        return this.setHex(parseInt(r, 16), e);
      console.warn("THREE.Color: Invalid hex color " + t);
    } else if (t && t.length > 0)
      return this.setColorName(t, e);
    return this;
  }
  setColorName(t, e = ke) {
    const n = Wd[t.toLowerCase()];
    return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return this.r = t.r, this.g = t.g, this.b = t.b, this;
  }
  copySRGBToLinear(t) {
    return this.r = es(t.r), this.g = es(t.g), this.b = es(t.b), this;
  }
  copyLinearToSRGB(t) {
    return this.r = No(t.r), this.g = No(t.g), this.b = No(t.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(t = ke) {
    return ne.fromWorkingColorSpace(Be.copy(this), t), Math.round(Re(Be.r * 255, 0, 255)) * 65536 + Math.round(Re(Be.g * 255, 0, 255)) * 256 + Math.round(Re(Be.b * 255, 0, 255));
  }
  getHexString(t = ke) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = ne.workingColorSpace) {
    ne.fromWorkingColorSpace(Be.copy(this), e);
    const n = Be.r, s = Be.g, r = Be.b, o = Math.max(n, s, r), a = Math.min(n, s, r);
    let l, c;
    const h = (a + o) / 2;
    if (a === o)
      l = 0, c = 0;
    else {
      const d = o - a;
      switch (c = h <= 0.5 ? d / (o + a) : d / (2 - o - a), o) {
        case n:
          l = (s - r) / d + (s < r ? 6 : 0);
          break;
        case s:
          l = (r - n) / d + 2;
          break;
        case r:
          l = (n - s) / d + 4;
          break;
      }
      l /= 6;
    }
    return t.h = l, t.s = c, t.l = h, t;
  }
  getRGB(t, e = ne.workingColorSpace) {
    return ne.fromWorkingColorSpace(Be.copy(this), e), t.r = Be.r, t.g = Be.g, t.b = Be.b, t;
  }
  getStyle(t = ke) {
    ne.fromWorkingColorSpace(Be.copy(this), t);
    const e = Be.r, n = Be.g, s = Be.b;
    return t !== ke ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
  }
  offsetHSL(t, e, n) {
    return this.getHSL(qn), this.setHSL(qn.h + t, qn.s + e, qn.l + n);
  }
  add(t) {
    return this.r += t.r, this.g += t.g, this.b += t.b, this;
  }
  addColors(t, e) {
    return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this;
  }
  addScalar(t) {
    return this.r += t, this.g += t, this.b += t, this;
  }
  sub(t) {
    return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), this;
  }
  multiply(t) {
    return this.r *= t.r, this.g *= t.g, this.b *= t.b, this;
  }
  multiplyScalar(t) {
    return this.r *= t, this.g *= t, this.b *= t, this;
  }
  lerp(t, e) {
    return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this;
  }
  lerpColors(t, e, n) {
    return this.r = t.r + (e.r - t.r) * n, this.g = t.g + (e.g - t.g) * n, this.b = t.b + (e.b - t.b) * n, this;
  }
  lerpHSL(t, e) {
    this.getHSL(qn), t.getHSL(yr);
    const n = Hs(qn.h, yr.h, e), s = Hs(qn.s, yr.s, e), r = Hs(qn.l, yr.l, e);
    return this.setHSL(n, s, r), this;
  }
  setFromVector3(t) {
    return this.r = t.x, this.g = t.y, this.b = t.z, this;
  }
  applyMatrix3(t) {
    const e = this.r, n = this.g, s = this.b, r = t.elements;
    return this.r = r[0] * e + r[3] * n + r[6] * s, this.g = r[1] * e + r[4] * n + r[7] * s, this.b = r[2] * e + r[5] * n + r[8] * s, this;
  }
  equals(t) {
    return t.r === this.r && t.g === this.g && t.b === this.b;
  }
  fromArray(t, e = 0) {
    return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this;
  }
  toArray(t = [], e = 0) {
    return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t;
  }
  fromBufferAttribute(t, e) {
    return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const Be = /* @__PURE__ */ new Ct();
Ct.NAMES = Wd;
let Up = 0;
class vn extends Ti {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Up++ }), this.uuid = cn(), this.name = "", this.type = "Material", this.blending = Ji, this.side = Hn, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = ba, this.blendDst = Ea, this.blendEquation = xi, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Ct(0, 0, 0), this.blendAlpha = 0, this.depthFunc = rs, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Tc, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Ri, this.stencilZFail = Ri, this.stencilZPass = Ri, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(t) {
    this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t;
  }
  // onBeforeRender and onBeforeCompile only supported in WebGLRenderer
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(t) {
    if (t !== void 0)
      for (const e in t) {
        const n = t[e];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);
          continue;
        }
        const s = this[e];
        if (s === void 0) {
          console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
          continue;
        }
        s && s.isColor ? s.set(n) : s && s.isVector3 && n && n.isVector3 ? s.copy(n) : this[e] = n;
      }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    e && (t = {
      textures: {},
      images: {}
    });
    const n = {
      metadata: {
        version: 4.6,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Ji && (n.blending = this.blending), this.side !== Hn && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== ba && (n.blendSrc = this.blendSrc), this.blendDst !== Ea && (n.blendDst = this.blendDst), this.blendEquation !== xi && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== rs && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Tc && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Ri && (n.stencilFail = this.stencilFail), this.stencilZFail !== Ri && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Ri && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function s(r) {
      const o = [];
      for (const a in r) {
        const l = r[a];
        delete l.metadata, o.push(l);
      }
      return o;
    }
    if (e) {
      const r = s(t.textures), o = s(t.images);
      r.length > 0 && (n.textures = r), o.length > 0 && (n.images = o);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, this.blendColor.copy(t.blendColor), this.blendAlpha = t.blendAlpha, this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
    const e = t.clippingPlanes;
    let n = null;
    if (e !== null) {
      const s = e.length;
      n = new Array(s);
      for (let r = 0; r !== s; ++r)
        n[r] = e[r].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, this.alphaHash = t.alphaHash, this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, this.forceSinglePass = t.forceSinglePass, this.visible = t.visible, this.toneMapped = t.toneMapped, this.userData = JSON.parse(JSON.stringify(t.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  onBuild() {
    console.warn("Material: onBuild() has been removed.");
  }
}
class en extends vn {
  constructor(t) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Ct(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new bn(), this.combine = Td, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
}
const we = /* @__PURE__ */ new P(), Mr = /* @__PURE__ */ new nt();
class Ue {
  constructor(t, e, n = !1) {
    if (Array.isArray(t))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = al, this.updateRanges = [], this.gpuType = _n, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  setUsage(t) {
    return this.usage = t, this;
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this;
  }
  copyAt(t, e, n) {
    t *= this.itemSize, n *= e.itemSize;
    for (let s = 0, r = this.itemSize; s < r; s++)
      this.array[t + s] = e.array[n + s];
    return this;
  }
  copyArray(t) {
    return this.array.set(t), this;
  }
  applyMatrix3(t) {
    if (this.itemSize === 2)
      for (let e = 0, n = this.count; e < n; e++)
        Mr.fromBufferAttribute(this, e), Mr.applyMatrix3(t), this.setXY(e, Mr.x, Mr.y);
    else if (this.itemSize === 3)
      for (let e = 0, n = this.count; e < n; e++)
        we.fromBufferAttribute(this, e), we.applyMatrix3(t), this.setXYZ(e, we.x, we.y, we.z);
    return this;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.count; e < n; e++)
      we.fromBufferAttribute(this, e), we.applyMatrix4(t), this.setXYZ(e, we.x, we.y, we.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++)
      we.fromBufferAttribute(this, e), we.applyNormalMatrix(t), this.setXYZ(e, we.x, we.y, we.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++)
      we.fromBufferAttribute(this, e), we.transformDirection(t), this.setXYZ(e, we.x, we.y, we.z);
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  getComponent(t, e) {
    let n = this.array[t * this.itemSize + e];
    return this.normalized && (n = gn(n, this.array)), n;
  }
  setComponent(t, e, n) {
    return this.normalized && (n = he(n, this.array)), this.array[t * this.itemSize + e] = n, this;
  }
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  setX(t, e) {
    return this.normalized && (e = he(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  setY(t, e) {
    return this.normalized && (e = he(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  setZ(t, e) {
    return this.normalized && (e = he(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  setW(t, e) {
    return this.normalized && (e = he(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
  }
  setXY(t, e, n) {
    return t *= this.itemSize, this.normalized && (e = he(e, this.array), n = he(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
  }
  setXYZ(t, e, n, s) {
    return t *= this.itemSize, this.normalized && (e = he(e, this.array), n = he(n, this.array), s = he(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this;
  }
  setXYZW(t, e, n, s, r) {
    return t *= this.itemSize, this.normalized && (e = he(e, this.array), n = he(n, this.array), s = he(s, this.array), r = he(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this.array[t + 3] = r, this;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const t = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (t.name = this.name), this.usage !== al && (t.usage = this.usage), t;
  }
}
class $d extends Ue {
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class Xd extends Ue {
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class ue extends Ue {
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let Op = 0;
const sn = /* @__PURE__ */ new Ft(), Zo = /* @__PURE__ */ new ye(), Bi = /* @__PURE__ */ new P(), Qe = /* @__PURE__ */ new Ke(), ws = /* @__PURE__ */ new Ke(), De = /* @__PURE__ */ new P();
class Ie extends Ti {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Op++ }), this.uuid = cn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (Hd(t) ? Xd : $d)(t, 1) : this.index = t, this;
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  setAttribute(t, e) {
    return this.attributes[t] = e, this;
  }
  deleteAttribute(t) {
    return delete this.attributes[t], this;
  }
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  addGroup(t, e, n = 0) {
    this.groups.push({
      start: t,
      count: e,
      materialIndex: n
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, e) {
    this.drawRange.start = t, this.drawRange.count = e;
  }
  applyMatrix4(t) {
    const e = this.attributes.position;
    e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const r = new Vt().getNormalMatrix(t);
      n.applyNormalMatrix(r), n.needsUpdate = !0;
    }
    const s = this.attributes.tangent;
    return s !== void 0 && (s.transformDirection(t), s.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(t) {
    return sn.makeRotationFromQuaternion(t), this.applyMatrix4(sn), this;
  }
  rotateX(t) {
    return sn.makeRotationX(t), this.applyMatrix4(sn), this;
  }
  rotateY(t) {
    return sn.makeRotationY(t), this.applyMatrix4(sn), this;
  }
  rotateZ(t) {
    return sn.makeRotationZ(t), this.applyMatrix4(sn), this;
  }
  translate(t, e, n) {
    return sn.makeTranslation(t, e, n), this.applyMatrix4(sn), this;
  }
  scale(t, e, n) {
    return sn.makeScale(t, e, n), this.applyMatrix4(sn), this;
  }
  lookAt(t) {
    return Zo.lookAt(t), Zo.updateMatrix(), this.applyMatrix4(Zo.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Bi).negate(), this.translate(Bi.x, Bi.y, Bi.z), this;
  }
  setFromPoints(t) {
    const e = [];
    for (let n = 0, s = t.length; n < s; n++) {
      const r = t[n];
      e.push(r.x, r.y, r.z || 0);
    }
    return this.setAttribute("position", new ue(e, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Ke());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new P(-1 / 0, -1 / 0, -1 / 0),
        new P(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), e)
        for (let n = 0, s = e.length; n < s; n++) {
          const r = e[n];
          Qe.setFromBufferAttribute(r), this.morphTargetsRelative ? (De.addVectors(this.boundingBox.min, Qe.min), this.boundingBox.expandByPoint(De), De.addVectors(this.boundingBox.max, Qe.max), this.boundingBox.expandByPoint(De)) : (this.boundingBox.expandByPoint(Qe.min), this.boundingBox.expandByPoint(Qe.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new En());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new P(), 1 / 0);
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if (Qe.setFromBufferAttribute(t), e)
        for (let r = 0, o = e.length; r < o; r++) {
          const a = e[r];
          ws.setFromBufferAttribute(a), this.morphTargetsRelative ? (De.addVectors(Qe.min, ws.min), Qe.expandByPoint(De), De.addVectors(Qe.max, ws.max), Qe.expandByPoint(De)) : (Qe.expandByPoint(ws.min), Qe.expandByPoint(ws.max));
        }
      Qe.getCenter(n);
      let s = 0;
      for (let r = 0, o = t.count; r < o; r++)
        De.fromBufferAttribute(t, r), s = Math.max(s, n.distanceToSquared(De));
      if (e)
        for (let r = 0, o = e.length; r < o; r++) {
          const a = e[r], l = this.morphTargetsRelative;
          for (let c = 0, h = a.count; c < h; c++)
            De.fromBufferAttribute(a, c), l && (Bi.fromBufferAttribute(t, c), De.add(Bi)), s = Math.max(s, n.distanceToSquared(De));
        }
      this.boundingSphere.radius = Math.sqrt(s), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const t = this.index, e = this.attributes;
    if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const n = e.position, s = e.normal, r = e.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Ue(new Float32Array(4 * n.count), 4));
    const o = this.getAttribute("tangent"), a = [], l = [];
    for (let R = 0; R < n.count; R++)
      a[R] = new P(), l[R] = new P();
    const c = new P(), h = new P(), d = new P(), u = new nt(), f = new nt(), g = new nt(), v = new P(), p = new P();
    function m(R, F, y) {
      c.fromBufferAttribute(n, R), h.fromBufferAttribute(n, F), d.fromBufferAttribute(n, y), u.fromBufferAttribute(r, R), f.fromBufferAttribute(r, F), g.fromBufferAttribute(r, y), h.sub(c), d.sub(c), f.sub(u), g.sub(u);
      const S = 1 / (f.x * g.y - g.x * f.y);
      isFinite(S) && (v.copy(h).multiplyScalar(g.y).addScaledVector(d, -f.y).multiplyScalar(S), p.copy(d).multiplyScalar(f.x).addScaledVector(h, -g.x).multiplyScalar(S), a[R].add(v), a[F].add(v), a[y].add(v), l[R].add(p), l[F].add(p), l[y].add(p));
    }
    let x = this.groups;
    x.length === 0 && (x = [{
      start: 0,
      count: t.count
    }]);
    for (let R = 0, F = x.length; R < F; ++R) {
      const y = x[R], S = y.start, N = y.count;
      for (let k = S, G = S + N; k < G; k += 3)
        m(
          t.getX(k + 0),
          t.getX(k + 1),
          t.getX(k + 2)
        );
    }
    const _ = new P(), M = new P(), L = new P(), T = new P();
    function w(R) {
      L.fromBufferAttribute(s, R), T.copy(L);
      const F = a[R];
      _.copy(F), _.sub(L.multiplyScalar(L.dot(F))).normalize(), M.crossVectors(T, F);
      const S = M.dot(l[R]) < 0 ? -1 : 1;
      o.setXYZW(R, _.x, _.y, _.z, S);
    }
    for (let R = 0, F = x.length; R < F; ++R) {
      const y = x[R], S = y.start, N = y.count;
      for (let k = S, G = S + N; k < G; k += 3)
        w(t.getX(k + 0)), w(t.getX(k + 1)), w(t.getX(k + 2));
    }
  }
  computeVertexNormals() {
    const t = this.index, e = this.getAttribute("position");
    if (e !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new Ue(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let u = 0, f = n.count; u < f; u++)
          n.setXYZ(u, 0, 0, 0);
      const s = new P(), r = new P(), o = new P(), a = new P(), l = new P(), c = new P(), h = new P(), d = new P();
      if (t)
        for (let u = 0, f = t.count; u < f; u += 3) {
          const g = t.getX(u + 0), v = t.getX(u + 1), p = t.getX(u + 2);
          s.fromBufferAttribute(e, g), r.fromBufferAttribute(e, v), o.fromBufferAttribute(e, p), h.subVectors(o, r), d.subVectors(s, r), h.cross(d), a.fromBufferAttribute(n, g), l.fromBufferAttribute(n, v), c.fromBufferAttribute(n, p), a.add(h), l.add(h), c.add(h), n.setXYZ(g, a.x, a.y, a.z), n.setXYZ(v, l.x, l.y, l.z), n.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let u = 0, f = e.count; u < f; u += 3)
          s.fromBufferAttribute(e, u + 0), r.fromBufferAttribute(e, u + 1), o.fromBufferAttribute(e, u + 2), h.subVectors(o, r), d.subVectors(s, r), h.cross(d), n.setXYZ(u + 0, h.x, h.y, h.z), n.setXYZ(u + 1, h.x, h.y, h.z), n.setXYZ(u + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let e = 0, n = t.count; e < n; e++)
      De.fromBufferAttribute(t, e), De.normalize(), t.setXYZ(e, De.x, De.y, De.z);
  }
  toNonIndexed() {
    function t(a, l) {
      const c = a.array, h = a.itemSize, d = a.normalized, u = new c.constructor(l.length * h);
      let f = 0, g = 0;
      for (let v = 0, p = l.length; v < p; v++) {
        a.isInterleavedBufferAttribute ? f = l[v] * a.data.stride + a.offset : f = l[v] * h;
        for (let m = 0; m < h; m++)
          u[g++] = c[f++];
      }
      return new Ue(u, h, d);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const e = new Ie(), n = this.index.array, s = this.attributes;
    for (const a in s) {
      const l = s[a], c = t(l, n);
      e.setAttribute(a, c);
    }
    const r = this.morphAttributes;
    for (const a in r) {
      const l = [], c = r[a];
      for (let h = 0, d = c.length; h < d; h++) {
        const u = c[h], f = t(u, n);
        l.push(f);
      }
      e.morphAttributes[a] = l;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    const o = this.groups;
    for (let a = 0, l = o.length; a < l; a++) {
      const c = o[a];
      e.addGroup(c.start, c.count, c.materialIndex);
    }
    return e;
  }
  toJSON() {
    const t = {
      metadata: {
        version: 4.6,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l)
        l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const e = this.index;
    e !== null && (t.data.index = {
      type: e.array.constructor.name,
      array: Array.prototype.slice.call(e.array)
    });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const s = {};
    let r = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let d = 0, u = c.length; d < u; d++) {
        const f = c[d];
        h.push(f.toJSON(t.data));
      }
      h.length > 0 && (s[l] = h, r = !0);
    }
    r && (t.data.morphAttributes = s, t.data.morphTargetsRelative = this.morphTargetsRelative);
    const o = this.groups;
    o.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(o)));
    const a = this.boundingSphere;
    return a !== null && (t.data.boundingSphere = {
      center: a.center.toArray(),
      radius: a.radius
    }), t;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const e = {};
    this.name = t.name;
    const n = t.index;
    n !== null && this.setIndex(n.clone(e));
    const s = t.attributes;
    for (const c in s) {
      const h = s[c];
      this.setAttribute(c, h.clone(e));
    }
    const r = t.morphAttributes;
    for (const c in r) {
      const h = [], d = r[c];
      for (let u = 0, f = d.length; u < f; u++)
        h.push(d[u].clone(e));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const o = t.groups;
    for (let c = 0, h = o.length; c < h; c++) {
      const d = o[c];
      this.addGroup(d.start, d.count, d.materialIndex);
    }
    const a = t.boundingBox;
    a !== null && (this.boundingBox = a.clone());
    const l = t.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const Hc = /* @__PURE__ */ new Ft(), fi = /* @__PURE__ */ new ms(), Sr = /* @__PURE__ */ new En(), Gc = /* @__PURE__ */ new P(), br = /* @__PURE__ */ new P(), Er = /* @__PURE__ */ new P(), wr = /* @__PURE__ */ new P(), Jo = /* @__PURE__ */ new P(), Tr = /* @__PURE__ */ new P(), Vc = /* @__PURE__ */ new P(), Ar = /* @__PURE__ */ new P();
class ge extends ye {
  constructor(t = new Ie(), e = new en()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = t, this.material = e, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), t.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), t.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const s = e[n[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = s.length; r < o; r++) {
          const a = s[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
  getVertexPosition(t, e) {
    const n = this.geometry, s = n.attributes.position, r = n.morphAttributes.position, o = n.morphTargetsRelative;
    e.fromBufferAttribute(s, t);
    const a = this.morphTargetInfluences;
    if (r && a) {
      Tr.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const h = a[l], d = r[l];
        h !== 0 && (Jo.fromBufferAttribute(d, t), o ? Tr.addScaledVector(Jo, h) : Tr.addScaledVector(Jo.sub(e), h));
      }
      e.add(Tr);
    }
    return e;
  }
  raycast(t, e) {
    const n = this.geometry, s = this.material, r = this.matrixWorld;
    s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Sr.copy(n.boundingSphere), Sr.applyMatrix4(r), fi.copy(t.ray).recast(t.near), !(Sr.containsPoint(fi.origin) === !1 && (fi.intersectSphere(Sr, Gc) === null || fi.origin.distanceToSquared(Gc) > (t.far - t.near) ** 2)) && (Hc.copy(r).invert(), fi.copy(t.ray).applyMatrix4(Hc), !(n.boundingBox !== null && fi.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(t, e, fi)));
  }
  _computeIntersections(t, e, n) {
    let s;
    const r = this.geometry, o = this.material, a = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, d = r.attributes.normal, u = r.groups, f = r.drawRange;
    if (a !== null)
      if (Array.isArray(o))
        for (let g = 0, v = u.length; g < v; g++) {
          const p = u[g], m = o[p.materialIndex], x = Math.max(p.start, f.start), _ = Math.min(a.count, Math.min(p.start + p.count, f.start + f.count));
          for (let M = x, L = _; M < L; M += 3) {
            const T = a.getX(M), w = a.getX(M + 1), R = a.getX(M + 2);
            s = Rr(this, m, t, n, c, h, d, T, w, R), s && (s.faceIndex = Math.floor(M / 3), s.face.materialIndex = p.materialIndex, e.push(s));
          }
        }
      else {
        const g = Math.max(0, f.start), v = Math.min(a.count, f.start + f.count);
        for (let p = g, m = v; p < m; p += 3) {
          const x = a.getX(p), _ = a.getX(p + 1), M = a.getX(p + 2);
          s = Rr(this, o, t, n, c, h, d, x, _, M), s && (s.faceIndex = Math.floor(p / 3), e.push(s));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(o))
        for (let g = 0, v = u.length; g < v; g++) {
          const p = u[g], m = o[p.materialIndex], x = Math.max(p.start, f.start), _ = Math.min(l.count, Math.min(p.start + p.count, f.start + f.count));
          for (let M = x, L = _; M < L; M += 3) {
            const T = M, w = M + 1, R = M + 2;
            s = Rr(this, m, t, n, c, h, d, T, w, R), s && (s.faceIndex = Math.floor(M / 3), s.face.materialIndex = p.materialIndex, e.push(s));
          }
        }
      else {
        const g = Math.max(0, f.start), v = Math.min(l.count, f.start + f.count);
        for (let p = g, m = v; p < m; p += 3) {
          const x = p, _ = p + 1, M = p + 2;
          s = Rr(this, o, t, n, c, h, d, x, _, M), s && (s.faceIndex = Math.floor(p / 3), e.push(s));
        }
      }
  }
}
function Fp(i, t, e, n, s, r, o, a) {
  let l;
  if (t.side === je ? l = n.intersectTriangle(o, r, s, !0, a) : l = n.intersectTriangle(s, r, o, t.side === Hn, a), l === null) return null;
  Ar.copy(a), Ar.applyMatrix4(i.matrixWorld);
  const c = e.ray.origin.distanceTo(Ar);
  return c < e.near || c > e.far ? null : {
    distance: c,
    point: Ar.clone(),
    object: i
  };
}
function Rr(i, t, e, n, s, r, o, a, l, c) {
  i.getVertexPosition(a, br), i.getVertexPosition(l, Er), i.getVertexPosition(c, wr);
  const h = Fp(i, t, e, n, br, Er, wr, Vc);
  if (h) {
    const d = new P();
    an.getBarycoord(Vc, br, Er, wr, d), s && (h.uv = an.getInterpolatedAttribute(s, a, l, c, d, new nt())), r && (h.uv1 = an.getInterpolatedAttribute(r, a, l, c, d, new nt())), o && (h.normal = an.getInterpolatedAttribute(o, a, l, c, d, new P()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const u = {
      a,
      b: l,
      c,
      normal: new P(),
      materialIndex: 0
    };
    an.getNormal(br, Er, wr, u.normal), h.face = u, h.barycoord = d;
  }
  return h;
}
class Vn extends Ie {
  constructor(t = 1, e = 1, n = 1, s = 1, r = 1, o = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: t,
      height: e,
      depth: n,
      widthSegments: s,
      heightSegments: r,
      depthSegments: o
    };
    const a = this;
    s = Math.floor(s), r = Math.floor(r), o = Math.floor(o);
    const l = [], c = [], h = [], d = [];
    let u = 0, f = 0;
    g("z", "y", "x", -1, -1, n, e, t, o, r, 0), g("z", "y", "x", 1, -1, n, e, -t, o, r, 1), g("x", "z", "y", 1, 1, t, n, e, s, o, 2), g("x", "z", "y", 1, -1, t, n, -e, s, o, 3), g("x", "y", "z", 1, -1, t, e, n, s, r, 4), g("x", "y", "z", -1, -1, t, e, -n, s, r, 5), this.setIndex(l), this.setAttribute("position", new ue(c, 3)), this.setAttribute("normal", new ue(h, 3)), this.setAttribute("uv", new ue(d, 2));
    function g(v, p, m, x, _, M, L, T, w, R, F) {
      const y = M / w, S = L / R, N = M / 2, k = L / 2, G = T / 2, q = w + 1, W = R + 1;
      let et = 0, $ = 0;
      const lt = new P();
      for (let ct = 0; ct < W; ct++) {
        const St = ct * S - k;
        for (let ie = 0; ie < q; ie++) {
          const le = ie * y - N;
          lt[v] = le * x, lt[p] = St * _, lt[m] = G, c.push(lt.x, lt.y, lt.z), lt[v] = 0, lt[p] = 0, lt[m] = T > 0 ? 1 : -1, h.push(lt.x, lt.y, lt.z), d.push(ie / w), d.push(1 - ct / R), et += 1;
        }
      }
      for (let ct = 0; ct < R; ct++)
        for (let St = 0; St < w; St++) {
          const ie = u + St + q * ct, le = u + St + q * (ct + 1), Y = u + (St + 1) + q * (ct + 1), it = u + (St + 1) + q * ct;
          l.push(ie, le, it), l.push(le, Y, it), $ += 6;
        }
      a.addGroup(f, $, F), f += $, u += et;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Vn(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
}
function ds(i) {
  const t = {};
  for (const e in i) {
    t[e] = {};
    for (const n in i[e]) {
      const s = i[e][n];
      s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion) ? s.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][n] = null) : t[e][n] = s.clone() : Array.isArray(s) ? t[e][n] = s.slice() : t[e][n] = s;
    }
  }
  return t;
}
function Ge(i) {
  const t = {};
  for (let e = 0; e < i.length; e++) {
    const n = ds(i[e]);
    for (const s in n)
      t[s] = n[s];
  }
  return t;
}
function Bp(i) {
  const t = [];
  for (let e = 0; e < i.length; e++)
    t.push(i[e].clone());
  return t;
}
function jd(i) {
  const t = i.getRenderTarget();
  return t === null ? i.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : ne.workingColorSpace;
}
const kp = { clone: ds, merge: Ge };
var zp = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Hp = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class ai extends vn {
  constructor(t) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = zp, this.fragmentShader = Hp, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      // set to use vertex shader clipping
      multiDraw: !1
      // set to use vertex shader multi_draw / enable gl_DrawID
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, t !== void 0 && this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = ds(t.uniforms), this.uniformsGroups = Bp(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    e.glslVersion = this.glslVersion, e.uniforms = {};
    for (const s in this.uniforms) {
      const o = this.uniforms[s].value;
      o && o.isTexture ? e.uniforms[s] = {
        type: "t",
        value: o.toJSON(t).uuid
      } : o && o.isColor ? e.uniforms[s] = {
        type: "c",
        value: o.getHex()
      } : o && o.isVector2 ? e.uniforms[s] = {
        type: "v2",
        value: o.toArray()
      } : o && o.isVector3 ? e.uniforms[s] = {
        type: "v3",
        value: o.toArray()
      } : o && o.isVector4 ? e.uniforms[s] = {
        type: "v4",
        value: o.toArray()
      } : o && o.isMatrix3 ? e.uniforms[s] = {
        type: "m3",
        value: o.toArray()
      } : o && o.isMatrix4 ? e.uniforms[s] = {
        type: "m4",
        value: o.toArray()
      } : e.uniforms[s] = {
        value: o
      };
    }
    Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
    const n = {};
    for (const s in this.extensions)
      this.extensions[s] === !0 && (n[s] = !0);
    return Object.keys(n).length > 0 && (e.extensions = n), e;
  }
}
class Kd extends ye {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Ft(), this.projectionMatrix = new Ft(), this.projectionMatrixInverse = new Ft(), this.coordinateSystem = kn;
  }
  copy(t, e) {
    return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this.coordinateSystem = t.coordinateSystem, this;
  }
  getWorldDirection(t) {
    return super.getWorldDirection(t).negate();
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(t, e) {
    super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Yn = /* @__PURE__ */ new P(), Wc = /* @__PURE__ */ new nt(), $c = /* @__PURE__ */ new nt();
class ze extends Kd {
  constructor(t = 50, e = 1, n = 0.1, s = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = s, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
  }
  /**
   * Sets the FOV by focal length in respect to the current .filmGauge.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(t) {
    const e = 0.5 * this.getFilmHeight() / t;
    this.fov = hs * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const t = Math.tan(zs * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  getEffectiveFOV() {
    return hs * 2 * Math.atan(
      Math.tan(zs * 0.5 * this.fov) / this.zoom
    );
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
   * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
   */
  getViewBounds(t, e, n) {
    Yn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(Yn.x, Yn.y).multiplyScalar(-t / Yn.z), Yn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Yn.x, Yn.y).multiplyScalar(-t / Yn.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(t, e) {
    return this.getViewBounds(t, Wc, $c), e.subVectors($c, Wc);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *
   * then for each monitor you would call it like this
   *
   *   const w = 1920;
   *   const h = 1080;
   *   const fullWidth = w * 3;
   *   const fullHeight = h * 2;
   *
   *   --A--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   *   --B--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   *   --C--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   *   --D--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   *   --E--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   *   --F--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   *
   *   Note there is no reason monitors have to be the same size or in a grid.
   */
  setViewOffset(t, e, n, s, r, o) {
    this.aspect = t / e, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const t = this.near;
    let e = t * Math.tan(zs * 0.5 * this.fov) / this.zoom, n = 2 * e, s = this.aspect * n, r = -0.5 * s;
    const o = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = o.fullWidth, c = o.fullHeight;
      r += o.offsetX * s / l, e -= o.offsetY * n / c, s *= o.width / l, n *= o.height / c;
    }
    const a = this.filmOffset;
    a !== 0 && (r += t * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + s, e, e - n, t, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e;
  }
}
const ki = -90, zi = 1;
class Gp extends ye {
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const s = new ze(ki, zi, t, e);
    s.layers = this.layers, this.add(s);
    const r = new ze(ki, zi, t, e);
    r.layers = this.layers, this.add(r);
    const o = new ze(ki, zi, t, e);
    o.layers = this.layers, this.add(o);
    const a = new ze(ki, zi, t, e);
    a.layers = this.layers, this.add(a);
    const l = new ze(ki, zi, t, e);
    l.layers = this.layers, this.add(l);
    const c = new ze(ki, zi, t, e);
    c.layers = this.layers, this.add(c);
  }
  updateCoordinateSystem() {
    const t = this.coordinateSystem, e = this.children.concat(), [n, s, r, o, a, l] = e;
    for (const c of e) this.remove(c);
    if (t === kn)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), o.up.set(0, 0, 1), o.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (t === fo)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), o.up.set(0, 0, -1), o.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
    for (const c of e)
      this.add(c), c.updateMatrixWorld();
  }
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: s } = this;
    this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
    const [r, o, a, l, c, h] = this.children, d = t.getRenderTarget(), u = t.getActiveCubeFace(), f = t.getActiveMipmapLevel(), g = t.xr.enabled;
    t.xr.enabled = !1;
    const v = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, t.setRenderTarget(n, 0, s), t.render(e, r), t.setRenderTarget(n, 1, s), t.render(e, o), t.setRenderTarget(n, 2, s), t.render(e, a), t.setRenderTarget(n, 3, s), t.render(e, l), t.setRenderTarget(n, 4, s), t.render(e, c), n.texture.generateMipmaps = v, t.setRenderTarget(n, 5, s), t.render(e, h), t.setRenderTarget(d, u, f), t.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class qd extends Ce {
  constructor(t, e, n, s, r, o, a, l, c, h) {
    t = t !== void 0 ? t : [], e = e !== void 0 ? e : os, super(t, e, n, s, r, o, a, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class Vp extends Ei {
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = !0;
    const n = { width: t, height: t, depth: 1 }, s = [n, n, n, n, n, n];
    this.texture = new qd(s, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = e.generateMipmaps !== void 0 ? e.generateMipmaps : !1, this.texture.minFilter = e.minFilter !== void 0 ? e.minFilter : tn;
  }
  fromEquirectangularTexture(t, e) {
    this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
    const n = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: (
        /* glsl */
        `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      )
    }, s = new Vn(5, 5, 5), r = new ai({
      name: "CubemapFromEquirect",
      uniforms: ds(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: je,
      blending: si
    });
    r.uniforms.tEquirect.value = e;
    const o = new ge(s, r), a = e.minFilter;
    return e.minFilter === Bn && (e.minFilter = tn), new Gp(1, 10, this).update(t, o), e.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
  }
  clear(t, e, n, s) {
    const r = t.getRenderTarget();
    for (let o = 0; o < 6; o++)
      t.setRenderTarget(this, o), t.clear(e, n, s);
    t.setRenderTarget(r);
  }
}
const Qo = /* @__PURE__ */ new P(), Wp = /* @__PURE__ */ new P(), $p = /* @__PURE__ */ new Vt();
class Fn {
  constructor(t = new P(1, 0, 0), e = 0) {
    this.isPlane = !0, this.normal = t, this.constant = e;
  }
  set(t, e) {
    return this.normal.copy(t), this.constant = e, this;
  }
  setComponents(t, e, n, s) {
    return this.normal.set(t, e, n), this.constant = s, this;
  }
  setFromNormalAndCoplanarPoint(t, e) {
    return this.normal.copy(t), this.constant = -e.dot(this.normal), this;
  }
  setFromCoplanarPoints(t, e, n) {
    const s = Qo.subVectors(n, e).cross(Wp.subVectors(t, e)).normalize();
    return this.setFromNormalAndCoplanarPoint(s, t), this;
  }
  copy(t) {
    return this.normal.copy(t.normal), this.constant = t.constant, this;
  }
  normalize() {
    const t = 1 / this.normal.length();
    return this.normal.multiplyScalar(t), this.constant *= t, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(t) {
    return this.normal.dot(t) + this.constant;
  }
  distanceToSphere(t) {
    return this.distanceToPoint(t.center) - t.radius;
  }
  projectPoint(t, e) {
    return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
  }
  intersectLine(t, e) {
    const n = t.delta(Qo), s = this.normal.dot(n);
    if (s === 0)
      return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    const r = -(t.start.dot(this.normal) + this.constant) / s;
    return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r);
  }
  intersectsLine(t) {
    const e = this.distanceToPoint(t.start), n = this.distanceToPoint(t.end);
    return e < 0 && n > 0 || n < 0 && e > 0;
  }
  intersectsBox(t) {
    return t.intersectsPlane(this);
  }
  intersectsSphere(t) {
    return t.intersectsPlane(this);
  }
  coplanarPoint(t) {
    return t.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(t, e) {
    const n = e || $p.getNormalMatrix(t), s = this.coplanarPoint(Qo).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -s.dot(r), this;
  }
  translate(t) {
    return this.constant -= t.dot(this.normal), this;
  }
  equals(t) {
    return t.normal.equals(this.normal) && t.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const pi = /* @__PURE__ */ new En(), Cr = /* @__PURE__ */ new P();
class Ul {
  constructor(t = new Fn(), e = new Fn(), n = new Fn(), s = new Fn(), r = new Fn(), o = new Fn()) {
    this.planes = [t, e, n, s, r, o];
  }
  set(t, e, n, s, r, o) {
    const a = this.planes;
    return a[0].copy(t), a[1].copy(e), a[2].copy(n), a[3].copy(s), a[4].copy(r), a[5].copy(o), this;
  }
  copy(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++)
      e[n].copy(t.planes[n]);
    return this;
  }
  setFromProjectionMatrix(t, e = kn) {
    const n = this.planes, s = t.elements, r = s[0], o = s[1], a = s[2], l = s[3], c = s[4], h = s[5], d = s[6], u = s[7], f = s[8], g = s[9], v = s[10], p = s[11], m = s[12], x = s[13], _ = s[14], M = s[15];
    if (n[0].setComponents(l - r, u - c, p - f, M - m).normalize(), n[1].setComponents(l + r, u + c, p + f, M + m).normalize(), n[2].setComponents(l + o, u + h, p + g, M + x).normalize(), n[3].setComponents(l - o, u - h, p - g, M - x).normalize(), n[4].setComponents(l - a, u - d, p - v, M - _).normalize(), e === kn)
      n[5].setComponents(l + a, u + d, p + v, M + _).normalize();
    else if (e === fo)
      n[5].setComponents(a, d, v, _).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0)
      t.boundingSphere === null && t.computeBoundingSphere(), pi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), pi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(pi);
  }
  intersectsSprite(t) {
    return pi.center.set(0, 0, 0), pi.radius = 0.7071067811865476, pi.applyMatrix4(t.matrixWorld), this.intersectsSphere(pi);
  }
  intersectsSphere(t) {
    const e = this.planes, n = t.center, s = -t.radius;
    for (let r = 0; r < 6; r++)
      if (e[r].distanceToPoint(n) < s)
        return !1;
    return !0;
  }
  intersectsBox(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) {
      const s = e[n];
      if (Cr.x = s.normal.x > 0 ? t.max.x : t.min.x, Cr.y = s.normal.y > 0 ? t.max.y : t.min.y, Cr.z = s.normal.z > 0 ? t.max.z : t.min.z, s.distanceToPoint(Cr) < 0)
        return !1;
    }
    return !0;
  }
  containsPoint(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++)
      if (e[n].distanceToPoint(t) < 0)
        return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
function Yd() {
  let i = null, t = !1, e = null, n = null;
  function s(r, o) {
    e(r, o), n = i.requestAnimationFrame(s);
  }
  return {
    start: function() {
      t !== !0 && e !== null && (n = i.requestAnimationFrame(s), t = !0);
    },
    stop: function() {
      i.cancelAnimationFrame(n), t = !1;
    },
    setAnimationLoop: function(r) {
      e = r;
    },
    setContext: function(r) {
      i = r;
    }
  };
}
function Xp(i) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(a, l) {
    const c = a.array, h = a.usage, d = c.byteLength, u = i.createBuffer();
    i.bindBuffer(l, u), i.bufferData(l, c, h), a.onUploadCallback();
    let f;
    if (c instanceof Float32Array)
      f = i.FLOAT;
    else if (c instanceof Uint16Array)
      a.isFloat16BufferAttribute ? f = i.HALF_FLOAT : f = i.UNSIGNED_SHORT;
    else if (c instanceof Int16Array)
      f = i.SHORT;
    else if (c instanceof Uint32Array)
      f = i.UNSIGNED_INT;
    else if (c instanceof Int32Array)
      f = i.INT;
    else if (c instanceof Int8Array)
      f = i.BYTE;
    else if (c instanceof Uint8Array)
      f = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray)
      f = i.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: u,
      type: f,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: a.version,
      size: d
    };
  }
  function n(a, l, c) {
    const h = l.array, d = l.updateRanges;
    if (i.bindBuffer(c, a), d.length === 0)
      i.bufferSubData(c, 0, h);
    else {
      d.sort((f, g) => f.start - g.start);
      let u = 0;
      for (let f = 1; f < d.length; f++) {
        const g = d[u], v = d[f];
        v.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          v.start + v.count - g.start
        ) : (++u, d[u] = v);
      }
      d.length = u + 1;
      for (let f = 0, g = d.length; f < g; f++) {
        const v = d[f];
        i.bufferSubData(
          c,
          v.start * h.BYTES_PER_ELEMENT,
          h,
          v.start,
          v.count
        );
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function s(a) {
    return a.isInterleavedBufferAttribute && (a = a.data), t.get(a);
  }
  function r(a) {
    a.isInterleavedBufferAttribute && (a = a.data);
    const l = t.get(a);
    l && (i.deleteBuffer(l.buffer), t.delete(a));
  }
  function o(a, l) {
    if (a.isInterleavedBufferAttribute && (a = a.data), a.isGLBufferAttribute) {
      const h = t.get(a);
      (!h || h.version < a.version) && t.set(a, {
        buffer: a.buffer,
        type: a.type,
        bytesPerElement: a.elementSize,
        version: a.version
      });
      return;
    }
    const c = t.get(a);
    if (c === void 0)
      t.set(a, e(a, l));
    else if (c.version < a.version) {
      if (c.size !== a.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(c.buffer, a, l), c.version = a.version;
    }
  }
  return {
    get: s,
    remove: r,
    update: o
  };
}
class ar extends Ie {
  constructor(t = 1, e = 1, n = 1, s = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: t,
      height: e,
      widthSegments: n,
      heightSegments: s
    };
    const r = t / 2, o = e / 2, a = Math.floor(n), l = Math.floor(s), c = a + 1, h = l + 1, d = t / a, u = e / l, f = [], g = [], v = [], p = [];
    for (let m = 0; m < h; m++) {
      const x = m * u - o;
      for (let _ = 0; _ < c; _++) {
        const M = _ * d - r;
        g.push(M, -x, 0), v.push(0, 0, 1), p.push(_ / a), p.push(1 - m / l);
      }
    }
    for (let m = 0; m < l; m++)
      for (let x = 0; x < a; x++) {
        const _ = x + c * m, M = x + c * (m + 1), L = x + 1 + c * (m + 1), T = x + 1 + c * m;
        f.push(_, M, T), f.push(M, L, T);
      }
    this.setIndex(f), this.setAttribute("position", new ue(g, 3)), this.setAttribute("normal", new ue(v, 3)), this.setAttribute("uv", new ue(p, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new ar(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
var jp = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Kp = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, qp = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Yp = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Zp = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Jp = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, Qp = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, tm = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, em = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, nm = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, im = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, sm = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, rm = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, om = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, am = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, lm = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, cm = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, hm = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, dm = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, um = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, fm = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, pm = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, mm = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, gm = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, _m = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, vm = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, xm = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, ym = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Mm = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Sm = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, bm = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Em = `
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, wm = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, Tm = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Am = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, Rm = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Cm = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, Pm = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Lm = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Im = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Dm = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Nm = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, Um = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Om = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Fm = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Bm = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, km = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, zm = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Hm = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Gm = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Vm = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Wm = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, $m = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, Xm = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, jm = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, Km = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, qm = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Ym = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Zm = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Jm = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Qm = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, t0 = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, e0 = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, n0 = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, i0 = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, s0 = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, r0 = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, o0 = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, a0 = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, l0 = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, c0 = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, h0 = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, d0 = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, u0 = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, f0 = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, p0 = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, m0 = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, g0 = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, _0 = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, v0 = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, x0 = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, y0 = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, M0 = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, S0 = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, b0 = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, E0 = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, w0 = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, T0 = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, A0 = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, R0 = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, C0 = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, P0 = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, L0 = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, I0 = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, D0 = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, N0 = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, U0 = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, O0 = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, F0 = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, B0 = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, k0 = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, z0 = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, H0 = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, G0 = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, V0 = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, W0 = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, $0 = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const X0 = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, j0 = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, K0 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, q0 = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Y0 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Z0 = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, J0 = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, Q0 = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, tg = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, eg = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, ng = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, ig = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, sg = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, rg = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, og = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, ag = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, lg = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, cg = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, hg = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, dg = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, ug = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, fg = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, pg = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, mg = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, gg = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, _g = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vg = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, xg = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, yg = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, Mg = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Sg = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, bg = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Eg = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, wg = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Gt = {
  alphahash_fragment: jp,
  alphahash_pars_fragment: Kp,
  alphamap_fragment: qp,
  alphamap_pars_fragment: Yp,
  alphatest_fragment: Zp,
  alphatest_pars_fragment: Jp,
  aomap_fragment: Qp,
  aomap_pars_fragment: tm,
  batching_pars_vertex: em,
  batching_vertex: nm,
  begin_vertex: im,
  beginnormal_vertex: sm,
  bsdfs: rm,
  iridescence_fragment: om,
  bumpmap_pars_fragment: am,
  clipping_planes_fragment: lm,
  clipping_planes_pars_fragment: cm,
  clipping_planes_pars_vertex: hm,
  clipping_planes_vertex: dm,
  color_fragment: um,
  color_pars_fragment: fm,
  color_pars_vertex: pm,
  color_vertex: mm,
  common: gm,
  cube_uv_reflection_fragment: _m,
  defaultnormal_vertex: vm,
  displacementmap_pars_vertex: xm,
  displacementmap_vertex: ym,
  emissivemap_fragment: Mm,
  emissivemap_pars_fragment: Sm,
  colorspace_fragment: bm,
  colorspace_pars_fragment: Em,
  envmap_fragment: wm,
  envmap_common_pars_fragment: Tm,
  envmap_pars_fragment: Am,
  envmap_pars_vertex: Rm,
  envmap_physical_pars_fragment: km,
  envmap_vertex: Cm,
  fog_vertex: Pm,
  fog_pars_vertex: Lm,
  fog_fragment: Im,
  fog_pars_fragment: Dm,
  gradientmap_pars_fragment: Nm,
  lightmap_pars_fragment: Um,
  lights_lambert_fragment: Om,
  lights_lambert_pars_fragment: Fm,
  lights_pars_begin: Bm,
  lights_toon_fragment: zm,
  lights_toon_pars_fragment: Hm,
  lights_phong_fragment: Gm,
  lights_phong_pars_fragment: Vm,
  lights_physical_fragment: Wm,
  lights_physical_pars_fragment: $m,
  lights_fragment_begin: Xm,
  lights_fragment_maps: jm,
  lights_fragment_end: Km,
  logdepthbuf_fragment: qm,
  logdepthbuf_pars_fragment: Ym,
  logdepthbuf_pars_vertex: Zm,
  logdepthbuf_vertex: Jm,
  map_fragment: Qm,
  map_pars_fragment: t0,
  map_particle_fragment: e0,
  map_particle_pars_fragment: n0,
  metalnessmap_fragment: i0,
  metalnessmap_pars_fragment: s0,
  morphinstance_vertex: r0,
  morphcolor_vertex: o0,
  morphnormal_vertex: a0,
  morphtarget_pars_vertex: l0,
  morphtarget_vertex: c0,
  normal_fragment_begin: h0,
  normal_fragment_maps: d0,
  normal_pars_fragment: u0,
  normal_pars_vertex: f0,
  normal_vertex: p0,
  normalmap_pars_fragment: m0,
  clearcoat_normal_fragment_begin: g0,
  clearcoat_normal_fragment_maps: _0,
  clearcoat_pars_fragment: v0,
  iridescence_pars_fragment: x0,
  opaque_fragment: y0,
  packing: M0,
  premultiplied_alpha_fragment: S0,
  project_vertex: b0,
  dithering_fragment: E0,
  dithering_pars_fragment: w0,
  roughnessmap_fragment: T0,
  roughnessmap_pars_fragment: A0,
  shadowmap_pars_fragment: R0,
  shadowmap_pars_vertex: C0,
  shadowmap_vertex: P0,
  shadowmask_pars_fragment: L0,
  skinbase_vertex: I0,
  skinning_pars_vertex: D0,
  skinning_vertex: N0,
  skinnormal_vertex: U0,
  specularmap_fragment: O0,
  specularmap_pars_fragment: F0,
  tonemapping_fragment: B0,
  tonemapping_pars_fragment: k0,
  transmission_fragment: z0,
  transmission_pars_fragment: H0,
  uv_pars_fragment: G0,
  uv_pars_vertex: V0,
  uv_vertex: W0,
  worldpos_vertex: $0,
  background_vert: X0,
  background_frag: j0,
  backgroundCube_vert: K0,
  backgroundCube_frag: q0,
  cube_vert: Y0,
  cube_frag: Z0,
  depth_vert: J0,
  depth_frag: Q0,
  distanceRGBA_vert: tg,
  distanceRGBA_frag: eg,
  equirect_vert: ng,
  equirect_frag: ig,
  linedashed_vert: sg,
  linedashed_frag: rg,
  meshbasic_vert: og,
  meshbasic_frag: ag,
  meshlambert_vert: lg,
  meshlambert_frag: cg,
  meshmatcap_vert: hg,
  meshmatcap_frag: dg,
  meshnormal_vert: ug,
  meshnormal_frag: fg,
  meshphong_vert: pg,
  meshphong_frag: mg,
  meshphysical_vert: gg,
  meshphysical_frag: _g,
  meshtoon_vert: vg,
  meshtoon_frag: xg,
  points_vert: yg,
  points_frag: Mg,
  shadow_vert: Sg,
  shadow_frag: bg,
  sprite_vert: Eg,
  sprite_frag: wg
}, ot = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Ct(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Vt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Vt() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Vt() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Vt() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    // basic, lambert, phong
    ior: { value: 1.5 },
    // physical
    refractionRatio: { value: 0.98 }
    // basic, lambert, phong
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new Vt() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Vt() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Vt() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Vt() },
    normalScale: { value: /* @__PURE__ */ new nt(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Vt() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Vt() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Vt() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Vt() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Ct(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: { value: [], properties: {
      direction: {},
      color: {}
    } },
    directionalLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {}
    } },
    spotLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {}
    } },
    pointLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },
    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new Ct(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Vt() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Vt() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Ct(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new nt(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Vt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Vt() },
    alphaTest: { value: 0 }
  }
}, Mn = {
  basic: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.specularmap,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.fog
    ]),
    vertexShader: Gt.meshbasic_vert,
    fragmentShader: Gt.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.specularmap,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Ct(0) }
      }
    ]),
    vertexShader: Gt.meshlambert_vert,
    fragmentShader: Gt.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.specularmap,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Ct(0) },
        specular: { value: /* @__PURE__ */ new Ct(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Gt.meshphong_vert,
    fragmentShader: Gt.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.roughnessmap,
      ot.metalnessmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Ct(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Gt.meshphysical_vert,
    fragmentShader: Gt.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.gradientmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Ct(0) }
      }
    ]),
    vertexShader: Gt.meshtoon_vert,
    fragmentShader: Gt.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Gt.meshmatcap_vert,
    fragmentShader: Gt.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Ge([
      ot.points,
      ot.fog
    ]),
    vertexShader: Gt.points_vert,
    fragmentShader: Gt.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Gt.linedashed_vert,
    fragmentShader: Gt.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.displacementmap
    ]),
    vertexShader: Gt.depth_vert,
    fragmentShader: Gt.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Gt.meshnormal_vert,
    fragmentShader: Gt.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Ge([
      ot.sprite,
      ot.fog
    ]),
    vertexShader: Gt.sprite_vert,
    fragmentShader: Gt.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Vt() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Gt.background_vert,
    fragmentShader: Gt.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Vt() }
    },
    vertexShader: Gt.backgroundCube_vert,
    fragmentShader: Gt.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Gt.cube_vert,
    fragmentShader: Gt.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Gt.equirect_vert,
    fragmentShader: Gt.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new P() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Gt.distanceRGBA_vert,
    fragmentShader: Gt.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Ge([
      ot.lights,
      ot.fog,
      {
        color: { value: /* @__PURE__ */ new Ct(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Gt.shadow_vert,
    fragmentShader: Gt.shadow_frag
  }
};
Mn.physical = {
  uniforms: /* @__PURE__ */ Ge([
    Mn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Vt() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Vt() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new nt(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Vt() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Vt() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Vt() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Ct(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Vt() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Vt() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Vt() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new nt() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Vt() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Ct(0) },
      specularColor: { value: /* @__PURE__ */ new Ct(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Vt() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Vt() },
      anisotropyVector: { value: /* @__PURE__ */ new nt() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Vt() }
    }
  ]),
  vertexShader: Gt.meshphysical_vert,
  fragmentShader: Gt.meshphysical_frag
};
const Pr = { r: 0, b: 0, g: 0 }, mi = /* @__PURE__ */ new bn(), Tg = /* @__PURE__ */ new Ft();
function Ag(i, t, e, n, s, r, o) {
  const a = new Ct(0);
  let l = r === !0 ? 0 : 1, c, h, d = null, u = 0, f = null;
  function g(x) {
    let _ = x.isScene === !0 ? x.background : null;
    return _ && _.isTexture && (_ = (x.backgroundBlurriness > 0 ? e : t).get(_)), _;
  }
  function v(x) {
    let _ = !1;
    const M = g(x);
    M === null ? m(a, l) : M && M.isColor && (m(M, 1), _ = !0);
    const L = i.xr.getEnvironmentBlendMode();
    L === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, o) : L === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, o), (i.autoClear || _) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function p(x, _) {
    const M = g(_);
    M && (M.isCubeTexture || M.mapping === So) ? (h === void 0 && (h = new ge(
      new Vn(1, 1, 1),
      new ai({
        name: "BackgroundCubeMaterial",
        uniforms: ds(Mn.backgroundCube.uniforms),
        vertexShader: Mn.backgroundCube.vertexShader,
        fragmentShader: Mn.backgroundCube.fragmentShader,
        side: je,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(L, T, w) {
      this.matrixWorld.copyPosition(w.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), s.update(h)), mi.copy(_.backgroundRotation), mi.x *= -1, mi.y *= -1, mi.z *= -1, M.isCubeTexture && M.isRenderTargetTexture === !1 && (mi.y *= -1, mi.z *= -1), h.material.uniforms.envMap.value = M, h.material.uniforms.flipEnvMap.value = M.isCubeTexture && M.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = _.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = _.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Tg.makeRotationFromEuler(mi)), h.material.toneMapped = ne.getTransfer(M.colorSpace) !== xe, (d !== M || u !== M.version || f !== i.toneMapping) && (h.material.needsUpdate = !0, d = M, u = M.version, f = i.toneMapping), h.layers.enableAll(), x.unshift(h, h.geometry, h.material, 0, 0, null)) : M && M.isTexture && (c === void 0 && (c = new ge(
      new ar(2, 2),
      new ai({
        name: "BackgroundMaterial",
        uniforms: ds(Mn.background.uniforms),
        vertexShader: Mn.background.vertexShader,
        fragmentShader: Mn.background.fragmentShader,
        side: Hn,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), s.update(c)), c.material.uniforms.t2D.value = M, c.material.uniforms.backgroundIntensity.value = _.backgroundIntensity, c.material.toneMapped = ne.getTransfer(M.colorSpace) !== xe, M.matrixAutoUpdate === !0 && M.updateMatrix(), c.material.uniforms.uvTransform.value.copy(M.matrix), (d !== M || u !== M.version || f !== i.toneMapping) && (c.material.needsUpdate = !0, d = M, u = M.version, f = i.toneMapping), c.layers.enableAll(), x.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function m(x, _) {
    x.getRGB(Pr, jd(i)), n.buffers.color.setClear(Pr.r, Pr.g, Pr.b, _, o);
  }
  return {
    getClearColor: function() {
      return a;
    },
    setClearColor: function(x, _ = 1) {
      a.set(x), l = _, m(a, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(x) {
      l = x, m(a, l);
    },
    render: v,
    addToRenderList: p
  };
}
function Rg(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, s = u(null);
  let r = s, o = !1;
  function a(y, S, N, k, G) {
    let q = !1;
    const W = d(k, N, S);
    r !== W && (r = W, c(r.object)), q = f(y, k, N, G), q && g(y, k, N, G), G !== null && t.update(G, i.ELEMENT_ARRAY_BUFFER), (q || o) && (o = !1, M(y, S, N, k), G !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(G).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(y) {
    return i.bindVertexArray(y);
  }
  function h(y) {
    return i.deleteVertexArray(y);
  }
  function d(y, S, N) {
    const k = N.wireframe === !0;
    let G = n[y.id];
    G === void 0 && (G = {}, n[y.id] = G);
    let q = G[S.id];
    q === void 0 && (q = {}, G[S.id] = q);
    let W = q[k];
    return W === void 0 && (W = u(l()), q[k] = W), W;
  }
  function u(y) {
    const S = [], N = [], k = [];
    for (let G = 0; G < e; G++)
      S[G] = 0, N[G] = 0, k[G] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: S,
      enabledAttributes: N,
      attributeDivisors: k,
      object: y,
      attributes: {},
      index: null
    };
  }
  function f(y, S, N, k) {
    const G = r.attributes, q = S.attributes;
    let W = 0;
    const et = N.getAttributes();
    for (const $ in et)
      if (et[$].location >= 0) {
        const ct = G[$];
        let St = q[$];
        if (St === void 0 && ($ === "instanceMatrix" && y.instanceMatrix && (St = y.instanceMatrix), $ === "instanceColor" && y.instanceColor && (St = y.instanceColor)), ct === void 0 || ct.attribute !== St || St && ct.data !== St.data) return !0;
        W++;
      }
    return r.attributesNum !== W || r.index !== k;
  }
  function g(y, S, N, k) {
    const G = {}, q = S.attributes;
    let W = 0;
    const et = N.getAttributes();
    for (const $ in et)
      if (et[$].location >= 0) {
        let ct = q[$];
        ct === void 0 && ($ === "instanceMatrix" && y.instanceMatrix && (ct = y.instanceMatrix), $ === "instanceColor" && y.instanceColor && (ct = y.instanceColor));
        const St = {};
        St.attribute = ct, ct && ct.data && (St.data = ct.data), G[$] = St, W++;
      }
    r.attributes = G, r.attributesNum = W, r.index = k;
  }
  function v() {
    const y = r.newAttributes;
    for (let S = 0, N = y.length; S < N; S++)
      y[S] = 0;
  }
  function p(y) {
    m(y, 0);
  }
  function m(y, S) {
    const N = r.newAttributes, k = r.enabledAttributes, G = r.attributeDivisors;
    N[y] = 1, k[y] === 0 && (i.enableVertexAttribArray(y), k[y] = 1), G[y] !== S && (i.vertexAttribDivisor(y, S), G[y] = S);
  }
  function x() {
    const y = r.newAttributes, S = r.enabledAttributes;
    for (let N = 0, k = S.length; N < k; N++)
      S[N] !== y[N] && (i.disableVertexAttribArray(N), S[N] = 0);
  }
  function _(y, S, N, k, G, q, W) {
    W === !0 ? i.vertexAttribIPointer(y, S, N, G, q) : i.vertexAttribPointer(y, S, N, k, G, q);
  }
  function M(y, S, N, k) {
    v();
    const G = k.attributes, q = N.getAttributes(), W = S.defaultAttributeValues;
    for (const et in q) {
      const $ = q[et];
      if ($.location >= 0) {
        let lt = G[et];
        if (lt === void 0 && (et === "instanceMatrix" && y.instanceMatrix && (lt = y.instanceMatrix), et === "instanceColor" && y.instanceColor && (lt = y.instanceColor)), lt !== void 0) {
          const ct = lt.normalized, St = lt.itemSize, ie = t.get(lt);
          if (ie === void 0) continue;
          const le = ie.buffer, Y = ie.type, it = ie.bytesPerElement, yt = Y === i.INT || Y === i.UNSIGNED_INT || lt.gpuType === wl;
          if (lt.isInterleavedBufferAttribute) {
            const mt = lt.data, kt = mt.stride, Lt = lt.offset;
            if (mt.isInstancedInterleavedBuffer) {
              for (let Yt = 0; Yt < $.locationSize; Yt++)
                m($.location + Yt, mt.meshPerAttribute);
              y.isInstancedMesh !== !0 && k._maxInstanceCount === void 0 && (k._maxInstanceCount = mt.meshPerAttribute * mt.count);
            } else
              for (let Yt = 0; Yt < $.locationSize; Yt++)
                p($.location + Yt);
            i.bindBuffer(i.ARRAY_BUFFER, le);
            for (let Yt = 0; Yt < $.locationSize; Yt++)
              _(
                $.location + Yt,
                St / $.locationSize,
                Y,
                ct,
                kt * it,
                (Lt + St / $.locationSize * Yt) * it,
                yt
              );
          } else {
            if (lt.isInstancedBufferAttribute) {
              for (let mt = 0; mt < $.locationSize; mt++)
                m($.location + mt, lt.meshPerAttribute);
              y.isInstancedMesh !== !0 && k._maxInstanceCount === void 0 && (k._maxInstanceCount = lt.meshPerAttribute * lt.count);
            } else
              for (let mt = 0; mt < $.locationSize; mt++)
                p($.location + mt);
            i.bindBuffer(i.ARRAY_BUFFER, le);
            for (let mt = 0; mt < $.locationSize; mt++)
              _(
                $.location + mt,
                St / $.locationSize,
                Y,
                ct,
                St * it,
                St / $.locationSize * mt * it,
                yt
              );
          }
        } else if (W !== void 0) {
          const ct = W[et];
          if (ct !== void 0)
            switch (ct.length) {
              case 2:
                i.vertexAttrib2fv($.location, ct);
                break;
              case 3:
                i.vertexAttrib3fv($.location, ct);
                break;
              case 4:
                i.vertexAttrib4fv($.location, ct);
                break;
              default:
                i.vertexAttrib1fv($.location, ct);
            }
        }
      }
    }
    x();
  }
  function L() {
    R();
    for (const y in n) {
      const S = n[y];
      for (const N in S) {
        const k = S[N];
        for (const G in k)
          h(k[G].object), delete k[G];
        delete S[N];
      }
      delete n[y];
    }
  }
  function T(y) {
    if (n[y.id] === void 0) return;
    const S = n[y.id];
    for (const N in S) {
      const k = S[N];
      for (const G in k)
        h(k[G].object), delete k[G];
      delete S[N];
    }
    delete n[y.id];
  }
  function w(y) {
    for (const S in n) {
      const N = n[S];
      if (N[y.id] === void 0) continue;
      const k = N[y.id];
      for (const G in k)
        h(k[G].object), delete k[G];
      delete N[y.id];
    }
  }
  function R() {
    F(), o = !0, r !== s && (r = s, c(r.object));
  }
  function F() {
    s.geometry = null, s.program = null, s.wireframe = !1;
  }
  return {
    setup: a,
    reset: R,
    resetDefaultState: F,
    dispose: L,
    releaseStatesOfGeometry: T,
    releaseStatesOfProgram: w,
    initAttributes: v,
    enableAttribute: p,
    disableUnusedAttributes: x
  };
}
function Cg(i, t, e) {
  let n;
  function s(c) {
    n = c;
  }
  function r(c, h) {
    i.drawArrays(n, c, h), e.update(h, n, 1);
  }
  function o(c, h, d) {
    d !== 0 && (i.drawArraysInstanced(n, c, h, d), e.update(h, n, d));
  }
  function a(c, h, d) {
    if (d === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, d);
    let f = 0;
    for (let g = 0; g < d; g++)
      f += h[g];
    e.update(f, n, 1);
  }
  function l(c, h, d, u) {
    if (d === 0) return;
    const f = t.get("WEBGL_multi_draw");
    if (f === null)
      for (let g = 0; g < c.length; g++)
        o(c[g], h[g], u[g]);
    else {
      f.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, u, 0, d);
      let g = 0;
      for (let v = 0; v < d; v++)
        g += h[v];
      for (let v = 0; v < u.length; v++)
        e.update(g, n, u[v]);
    }
  }
  this.setMode = s, this.render = r, this.renderInstances = o, this.renderMultiDraw = a, this.renderMultiDrawInstances = l;
}
function Pg(i, t, e, n) {
  let s;
  function r() {
    if (s !== void 0) return s;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const w = t.get("EXT_texture_filter_anisotropic");
      s = i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      s = 0;
    return s;
  }
  function o(w) {
    return !(w !== ln && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function a(w) {
    const R = w === or && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(w !== Gn && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    w !== _n && !R);
  }
  function l(w) {
    if (w === "highp") {
      if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0)
        return "highp";
      w = "mediump";
    }
    return w === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const d = e.logarithmicDepthBuffer === !0, u = e.reverseDepthBuffer === !0 && t.has("EXT_clip_control");
  if (u === !0) {
    const w = t.get("EXT_clip_control");
    w.clipControlEXT(w.LOWER_LEFT_EXT, w.ZERO_TO_ONE_EXT);
  }
  const f = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), v = i.getParameter(i.MAX_TEXTURE_SIZE), p = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), m = i.getParameter(i.MAX_VERTEX_ATTRIBS), x = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), _ = i.getParameter(i.MAX_VARYING_VECTORS), M = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), L = g > 0, T = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: r,
    getMaxPrecision: l,
    textureFormatReadable: o,
    textureTypeReadable: a,
    precision: c,
    logarithmicDepthBuffer: d,
    reverseDepthBuffer: u,
    maxTextures: f,
    maxVertexTextures: g,
    maxTextureSize: v,
    maxCubemapSize: p,
    maxAttributes: m,
    maxVertexUniforms: x,
    maxVaryings: _,
    maxFragmentUniforms: M,
    vertexTextures: L,
    maxSamples: T
  };
}
function Lg(i) {
  const t = this;
  let e = null, n = 0, s = !1, r = !1;
  const o = new Fn(), a = new Vt(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, u) {
    const f = d.length !== 0 || u || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || s;
    return s = u, n = d.length, f;
  }, this.beginShadows = function() {
    r = !0, h(null);
  }, this.endShadows = function() {
    r = !1;
  }, this.setGlobalState = function(d, u) {
    e = h(d, u, 0);
  }, this.setState = function(d, u, f) {
    const g = d.clippingPlanes, v = d.clipIntersection, p = d.clipShadows, m = i.get(d);
    if (!s || g === null || g.length === 0 || r && !p)
      r ? h(null) : c();
    else {
      const x = r ? 0 : n, _ = x * 4;
      let M = m.clippingState || null;
      l.value = M, M = h(g, u, _, f);
      for (let L = 0; L !== _; ++L)
        M[L] = e[L];
      m.clippingState = M, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += x;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function h(d, u, f, g) {
    const v = d !== null ? d.length : 0;
    let p = null;
    if (v !== 0) {
      if (p = l.value, g !== !0 || p === null) {
        const m = f + v * 4, x = u.matrixWorldInverse;
        a.getNormalMatrix(x), (p === null || p.length < m) && (p = new Float32Array(m));
        for (let _ = 0, M = f; _ !== v; ++_, M += 4)
          o.copy(d[_]).applyMatrix4(x, a), o.normal.toArray(p, M), p[M + 3] = o.constant;
      }
      l.value = p, l.needsUpdate = !0;
    }
    return t.numPlanes = v, t.numIntersection = 0, p;
  }
}
function Ig(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(o, a) {
    return a === Ia ? o.mapping = os : a === Da && (o.mapping = as), o;
  }
  function n(o) {
    if (o && o.isTexture) {
      const a = o.mapping;
      if (a === Ia || a === Da)
        if (t.has(o)) {
          const l = t.get(o).texture;
          return e(l, o.mapping);
        } else {
          const l = o.image;
          if (l && l.height > 0) {
            const c = new Vp(l.height);
            return c.fromEquirectangularTexture(i, o), t.set(o, c), o.addEventListener("dispose", s), e(c.texture, o.mapping);
          } else
            return null;
        }
    }
    return o;
  }
  function s(o) {
    const a = o.target;
    a.removeEventListener("dispose", s);
    const l = t.get(a);
    l !== void 0 && (t.delete(a), l.dispose());
  }
  function r() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: r
  };
}
class Ol extends Kd {
  constructor(t = -1, e = 1, n = 1, s = -1, r = 0.1, o = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = n, this.bottom = s, this.near = r, this.far = o, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, this.view = t.view === null ? null : Object.assign({}, t.view), this;
  }
  setViewOffset(t, e, n, s, r, o) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, s = (this.top + this.bottom) / 2;
    let r = n - t, o = n + t, a = s + e, l = s - e;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += c * this.view.offsetX, o = r + c * this.view.width, a -= h * this.view.offsetY, l = a - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, o, a, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
  }
}
const qi = 4, Xc = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], yi = 20, ta = /* @__PURE__ */ new Ol(), jc = /* @__PURE__ */ new Ct();
let ea = null, na = 0, ia = 0, sa = !1;
const vi = (1 + Math.sqrt(5)) / 2, Hi = 1 / vi, Kc = [
  /* @__PURE__ */ new P(-vi, Hi, 0),
  /* @__PURE__ */ new P(vi, Hi, 0),
  /* @__PURE__ */ new P(-Hi, 0, vi),
  /* @__PURE__ */ new P(Hi, 0, vi),
  /* @__PURE__ */ new P(0, vi, -Hi),
  /* @__PURE__ */ new P(0, vi, Hi),
  /* @__PURE__ */ new P(-1, 1, -1),
  /* @__PURE__ */ new P(1, 1, -1),
  /* @__PURE__ */ new P(-1, 1, 1),
  /* @__PURE__ */ new P(1, 1, 1)
];
class qc {
  constructor(t) {
    this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  /**
   * Generates a PMREM from a supplied Scene, which can be faster than using an
   * image if networking bandwidth is low. Optional sigma specifies a blur radius
   * in radians to be applied to the scene before PMREM generation. Optional near
   * and far planes ensure the scene is rendered in its entirety (the cubeCamera
   * is placed at the origin).
   */
  fromScene(t, e = 0, n = 0.1, s = 100) {
    ea = this._renderer.getRenderTarget(), na = this._renderer.getActiveCubeFace(), ia = this._renderer.getActiveMipmapLevel(), sa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
    const r = this._allocateTargets();
    return r.depthBuffer = !0, this._sceneToCubeUV(t, n, s, r), e > 0 && this._blur(r, 0, 0, e), this._applyPMREM(r), this._cleanup(r), r;
  }
  /**
   * Generates a PMREM from an equirectangular texture, which can be either LDR
   * or HDR. The ideal input image size is 1k (1024 x 512),
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported equirectangular image size is 64 x 32.
   */
  fromEquirectangular(t, e = null) {
    return this._fromTexture(t, e);
  }
  /**
   * Generates a PMREM from an cubemap texture, which can be either LDR
   * or HDR. The ideal input cube size is 256 x 256,
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported cube size is 16 x 16.
   */
  fromCubemap(t, e = null) {
    return this._fromTexture(t, e);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Jc(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Zc(), this._compileMaterial(this._equirectMaterial));
  }
  /**
   * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
   * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
   * one of them will cause any others to also become unusable.
   */
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  // private interface
  _setSize(t) {
    this._lodMax = Math.floor(Math.log2(t)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let t = 0; t < this._lodPlanes.length; t++)
      this._lodPlanes[t].dispose();
  }
  _cleanup(t) {
    this._renderer.setRenderTarget(ea, na, ia), this._renderer.xr.enabled = sa, t.scissorTest = !1, Lr(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === os || t.mapping === as ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), ea = this._renderer.getRenderTarget(), na = this._renderer.getActiveCubeFace(), ia = this._renderer.getActiveMipmapLevel(), sa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = e || this._allocateTargets();
    return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = {
      magFilter: tn,
      minFilter: tn,
      generateMipmaps: !1,
      type: or,
      format: ln,
      colorSpace: Oe,
      depthBuffer: !1
    }, s = Yc(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Yc(t, e, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Dg(r)), this._blurMaterial = Ng(r, t, e);
    }
    return s;
  }
  _compileMaterial(t) {
    const e = new ge(this._lodPlanes[0], t);
    this._renderer.compile(e, ta);
  }
  _sceneToCubeUV(t, e, n, s) {
    const a = new ze(90, 1, e, n), l = [1, -1, 1, 1, 1, 1], c = [1, 1, 1, -1, -1, -1], h = this._renderer, d = h.autoClear, u = h.toneMapping;
    h.getClearColor(jc), h.toneMapping = ri, h.autoClear = !1;
    const f = new en({
      name: "PMREM.Background",
      side: je,
      depthWrite: !1,
      depthTest: !1
    }), g = new ge(new Vn(), f);
    let v = !1;
    const p = t.background;
    p ? p.isColor && (f.color.copy(p), t.background = null, v = !0) : (f.color.copy(jc), v = !0);
    for (let m = 0; m < 6; m++) {
      const x = m % 3;
      x === 0 ? (a.up.set(0, l[m], 0), a.lookAt(c[m], 0, 0)) : x === 1 ? (a.up.set(0, 0, l[m]), a.lookAt(0, c[m], 0)) : (a.up.set(0, l[m], 0), a.lookAt(0, 0, c[m]));
      const _ = this._cubeSize;
      Lr(s, x * _, m > 2 ? _ : 0, _, _), h.setRenderTarget(s), v && h.render(g, a), h.render(t, a);
    }
    g.geometry.dispose(), g.material.dispose(), h.toneMapping = u, h.autoClear = d, t.background = p;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, s = t.mapping === os || t.mapping === as;
    s ? (this._cubemapMaterial === null && (this._cubemapMaterial = Jc()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Zc());
    const r = s ? this._cubemapMaterial : this._equirectMaterial, o = new ge(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = t;
    const l = this._cubeSize;
    Lr(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(o, ta);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = !1;
    const s = this._lodPlanes.length;
    for (let r = 1; r < s; r++) {
      const o = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = Kc[(s - r - 1) % Kc.length];
      this._blur(t, r - 1, r, o, a);
    }
    e.autoClear = n;
  }
  /**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   */
  _blur(t, e, n, s, r) {
    const o = this._pingPongRenderTarget;
    this._halfBlur(
      t,
      o,
      e,
      n,
      s,
      "latitudinal",
      r
    ), this._halfBlur(
      o,
      t,
      n,
      n,
      s,
      "longitudinal",
      r
    );
  }
  _halfBlur(t, e, n, s, r, o, a) {
    const l = this._renderer, c = this._blurMaterial;
    o !== "latitudinal" && o !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, d = new ge(this._lodPlanes[s], c), u = c.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * yi - 1), v = r / g, p = isFinite(r) ? 1 + Math.floor(h * v) : yi;
    p > yi && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${yi}`);
    const m = [];
    let x = 0;
    for (let w = 0; w < yi; ++w) {
      const R = w / v, F = Math.exp(-R * R / 2);
      m.push(F), w === 0 ? x += F : w < p && (x += 2 * F);
    }
    for (let w = 0; w < m.length; w++)
      m[w] = m[w] / x;
    u.envMap.value = t.texture, u.samples.value = p, u.weights.value = m, u.latitudinal.value = o === "latitudinal", a && (u.poleAxis.value = a);
    const { _lodMax: _ } = this;
    u.dTheta.value = g, u.mipInt.value = _ - n;
    const M = this._sizeLods[s], L = 3 * M * (s > _ - qi ? s - _ + qi : 0), T = 4 * (this._cubeSize - M);
    Lr(e, L, T, 3 * M, 2 * M), l.setRenderTarget(e), l.render(d, ta);
  }
}
function Dg(i) {
  const t = [], e = [], n = [];
  let s = i;
  const r = i - qi + 1 + Xc.length;
  for (let o = 0; o < r; o++) {
    const a = Math.pow(2, s);
    e.push(a);
    let l = 1 / a;
    o > i - qi ? l = Xc[o - i + qi - 1] : o === 0 && (l = 0), n.push(l);
    const c = 1 / (a - 2), h = -c, d = 1 + c, u = [h, h, d, h, d, d, h, h, d, d, h, d], f = 6, g = 6, v = 3, p = 2, m = 1, x = new Float32Array(v * g * f), _ = new Float32Array(p * g * f), M = new Float32Array(m * g * f);
    for (let T = 0; T < f; T++) {
      const w = T % 3 * 2 / 3 - 1, R = T > 2 ? 0 : -1, F = [
        w,
        R,
        0,
        w + 2 / 3,
        R,
        0,
        w + 2 / 3,
        R + 1,
        0,
        w,
        R,
        0,
        w + 2 / 3,
        R + 1,
        0,
        w,
        R + 1,
        0
      ];
      x.set(F, v * g * T), _.set(u, p * g * T);
      const y = [T, T, T, T, T, T];
      M.set(y, m * g * T);
    }
    const L = new Ie();
    L.setAttribute("position", new Ue(x, v)), L.setAttribute("uv", new Ue(_, p)), L.setAttribute("faceIndex", new Ue(M, m)), t.push(L), s > qi && s--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function Yc(i, t, e) {
  const n = new Ei(i, t, e);
  return n.texture.mapping = So, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Lr(i, t, e, n, s) {
  i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s);
}
function Ng(i, t, e) {
  const n = new Float32Array(yi), s = new P(0, 1, 0);
  return new ai({
    name: "SphericalGaussianBlur",
    defines: {
      n: yi,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / e,
      CUBEUV_MAX_MIP: `${i}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: s }
    },
    vertexShader: Fl(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`
    ),
    blending: si,
    depthTest: !1,
    depthWrite: !1
  });
}
function Zc() {
  return new ai({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: Fl(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`
    ),
    blending: si,
    depthTest: !1,
    depthWrite: !1
  });
}
function Jc() {
  return new ai({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Fl(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`
    ),
    blending: si,
    depthTest: !1,
    depthWrite: !1
  });
}
function Fl() {
  return (
    /* glsl */
    `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
  );
}
function Ug(i) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(a) {
    if (a && a.isTexture) {
      const l = a.mapping, c = l === Ia || l === Da, h = l === os || l === as;
      if (c || h) {
        let d = t.get(a);
        const u = d !== void 0 ? d.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== u)
          return e === null && (e = new qc(i)), d = c ? e.fromEquirectangular(a, d) : e.fromCubemap(a, d), d.texture.pmremVersion = a.pmremVersion, t.set(a, d), d.texture;
        if (d !== void 0)
          return d.texture;
        {
          const f = a.image;
          return c && f && f.height > 0 || h && f && s(f) ? (e === null && (e = new qc(i)), d = c ? e.fromEquirectangular(a) : e.fromCubemap(a), d.texture.pmremVersion = a.pmremVersion, t.set(a, d), a.addEventListener("dispose", r), d.texture) : null;
        }
      }
    }
    return a;
  }
  function s(a) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++)
      a[h] !== void 0 && l++;
    return l === c;
  }
  function r(a) {
    const l = a.target;
    l.removeEventListener("dispose", r);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function o() {
    t = /* @__PURE__ */ new WeakMap(), e !== null && (e.dispose(), e = null);
  }
  return {
    get: n,
    dispose: o
  };
}
function Og(i) {
  const t = {};
  function e(n) {
    if (t[n] !== void 0)
      return t[n];
    let s;
    switch (n) {
      case "WEBGL_depth_texture":
        s = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        s = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        s = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        s = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        s = i.getExtension(n);
    }
    return t[n] = s, s;
  }
  return {
    has: function(n) {
      return e(n) !== null;
    },
    init: function() {
      e("EXT_color_buffer_float"), e("WEBGL_clip_cull_distance"), e("OES_texture_float_linear"), e("EXT_color_buffer_half_float"), e("WEBGL_multisampled_render_to_texture"), e("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const s = e(n);
      return s === null && so("THREE.WebGLRenderer: " + n + " extension not supported."), s;
    }
  };
}
function Fg(i, t, e, n) {
  const s = {}, r = /* @__PURE__ */ new WeakMap();
  function o(d) {
    const u = d.target;
    u.index !== null && t.remove(u.index);
    for (const g in u.attributes)
      t.remove(u.attributes[g]);
    for (const g in u.morphAttributes) {
      const v = u.morphAttributes[g];
      for (let p = 0, m = v.length; p < m; p++)
        t.remove(v[p]);
    }
    u.removeEventListener("dispose", o), delete s[u.id];
    const f = r.get(u);
    f && (t.remove(f), r.delete(u)), n.releaseStatesOfGeometry(u), u.isInstancedBufferGeometry === !0 && delete u._maxInstanceCount, e.memory.geometries--;
  }
  function a(d, u) {
    return s[u.id] === !0 || (u.addEventListener("dispose", o), s[u.id] = !0, e.memory.geometries++), u;
  }
  function l(d) {
    const u = d.attributes;
    for (const g in u)
      t.update(u[g], i.ARRAY_BUFFER);
    const f = d.morphAttributes;
    for (const g in f) {
      const v = f[g];
      for (let p = 0, m = v.length; p < m; p++)
        t.update(v[p], i.ARRAY_BUFFER);
    }
  }
  function c(d) {
    const u = [], f = d.index, g = d.attributes.position;
    let v = 0;
    if (f !== null) {
      const x = f.array;
      v = f.version;
      for (let _ = 0, M = x.length; _ < M; _ += 3) {
        const L = x[_ + 0], T = x[_ + 1], w = x[_ + 2];
        u.push(L, T, T, w, w, L);
      }
    } else if (g !== void 0) {
      const x = g.array;
      v = g.version;
      for (let _ = 0, M = x.length / 3 - 1; _ < M; _ += 3) {
        const L = _ + 0, T = _ + 1, w = _ + 2;
        u.push(L, T, T, w, w, L);
      }
    } else
      return;
    const p = new (Hd(u) ? Xd : $d)(u, 1);
    p.version = v;
    const m = r.get(d);
    m && t.remove(m), r.set(d, p);
  }
  function h(d) {
    const u = r.get(d);
    if (u) {
      const f = d.index;
      f !== null && u.version < f.version && c(d);
    } else
      c(d);
    return r.get(d);
  }
  return {
    get: a,
    update: l,
    getWireframeAttribute: h
  };
}
function Bg(i, t, e) {
  let n;
  function s(u) {
    n = u;
  }
  let r, o;
  function a(u) {
    r = u.type, o = u.bytesPerElement;
  }
  function l(u, f) {
    i.drawElements(n, f, r, u * o), e.update(f, n, 1);
  }
  function c(u, f, g) {
    g !== 0 && (i.drawElementsInstanced(n, f, r, u * o, g), e.update(f, n, g));
  }
  function h(u, f, g) {
    if (g === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, f, 0, r, u, 0, g);
    let p = 0;
    for (let m = 0; m < g; m++)
      p += f[m];
    e.update(p, n, 1);
  }
  function d(u, f, g, v) {
    if (g === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null)
      for (let m = 0; m < u.length; m++)
        c(u[m] / o, f[m], v[m]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, f, 0, r, u, 0, v, 0, g);
      let m = 0;
      for (let x = 0; x < g; x++)
        m += f[x];
      for (let x = 0; x < v.length; x++)
        e.update(m, n, v[x]);
    }
  }
  this.setMode = s, this.setIndex = a, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
}
function kg(i) {
  const t = {
    geometries: 0,
    textures: 0
  }, e = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function n(r, o, a) {
    switch (e.calls++, o) {
      case i.TRIANGLES:
        e.triangles += a * (r / 3);
        break;
      case i.LINES:
        e.lines += a * (r / 2);
        break;
      case i.LINE_STRIP:
        e.lines += a * (r - 1);
        break;
      case i.LINE_LOOP:
        e.lines += a * r;
        break;
      case i.POINTS:
        e.points += a * r;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", o);
        break;
    }
  }
  function s() {
    e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0;
  }
  return {
    memory: t,
    render: e,
    programs: null,
    autoReset: !0,
    reset: s,
    update: n
  };
}
function zg(i, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), s = new re();
  function r(o, a, l) {
    const c = o.morphTargetInfluences, h = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color, d = h !== void 0 ? h.length : 0;
    let u = n.get(a);
    if (u === void 0 || u.count !== d) {
      let F = function() {
        w.dispose(), n.delete(a), a.removeEventListener("dispose", F);
      };
      u !== void 0 && u.texture.dispose();
      const f = a.morphAttributes.position !== void 0, g = a.morphAttributes.normal !== void 0, v = a.morphAttributes.color !== void 0, p = a.morphAttributes.position || [], m = a.morphAttributes.normal || [], x = a.morphAttributes.color || [];
      let _ = 0;
      f === !0 && (_ = 1), g === !0 && (_ = 2), v === !0 && (_ = 3);
      let M = a.attributes.position.count * _, L = 1;
      M > t.maxTextureSize && (L = Math.ceil(M / t.maxTextureSize), M = t.maxTextureSize);
      const T = new Float32Array(M * L * 4 * d), w = new Vd(T, M, L, d);
      w.type = _n, w.needsUpdate = !0;
      const R = _ * 4;
      for (let y = 0; y < d; y++) {
        const S = p[y], N = m[y], k = x[y], G = M * L * 4 * y;
        for (let q = 0; q < S.count; q++) {
          const W = q * R;
          f === !0 && (s.fromBufferAttribute(S, q), T[G + W + 0] = s.x, T[G + W + 1] = s.y, T[G + W + 2] = s.z, T[G + W + 3] = 0), g === !0 && (s.fromBufferAttribute(N, q), T[G + W + 4] = s.x, T[G + W + 5] = s.y, T[G + W + 6] = s.z, T[G + W + 7] = 0), v === !0 && (s.fromBufferAttribute(k, q), T[G + W + 8] = s.x, T[G + W + 9] = s.y, T[G + W + 10] = s.z, T[G + W + 11] = k.itemSize === 4 ? s.w : 1);
        }
      }
      u = {
        count: d,
        texture: w,
        size: new nt(M, L)
      }, n.set(a, u), a.addEventListener("dispose", F);
    }
    if (o.isInstancedMesh === !0 && o.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", o.morphTexture, e);
    else {
      let f = 0;
      for (let v = 0; v < c.length; v++)
        f += c[v];
      const g = a.morphTargetsRelative ? 1 : 1 - f;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", g), l.getUniforms().setValue(i, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", u.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", u.size);
  }
  return {
    update: r
  };
}
function Hg(i, t, e, n) {
  let s = /* @__PURE__ */ new WeakMap();
  function r(l) {
    const c = n.render.frame, h = l.geometry, d = t.get(l, h);
    if (s.get(d) !== c && (t.update(d), s.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", a) === !1 && l.addEventListener("dispose", a), s.get(l) !== c && (e.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER), s.set(l, c))), l.isSkinnedMesh) {
      const u = l.skeleton;
      s.get(u) !== c && (u.update(), s.set(u, c));
    }
    return d;
  }
  function o() {
    s = /* @__PURE__ */ new WeakMap();
  }
  function a(l) {
    const c = l.target;
    c.removeEventListener("dispose", a), e.remove(c.instanceMatrix), c.instanceColor !== null && e.remove(c.instanceColor);
  }
  return {
    update: r,
    dispose: o
  };
}
class Zd extends Ce {
  constructor(t, e, n, s, r, o, a, l, c, h = Qi) {
    if (h !== Qi && h !== cs)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && h === Qi && (n = bi), n === void 0 && h === cs && (n = ls), super(null, s, r, o, a, l, h, n, c), this.isDepthTexture = !0, this.image = { width: t, height: e }, this.magFilter = a !== void 0 ? a : Ve, this.minFilter = l !== void 0 ? l : Ve, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
const Jd = /* @__PURE__ */ new Ce(), Qc = /* @__PURE__ */ new Zd(1, 1), Qd = /* @__PURE__ */ new Vd(), tu = /* @__PURE__ */ new Ap(), eu = /* @__PURE__ */ new qd(), th = [], eh = [], nh = new Float32Array(16), ih = new Float32Array(9), sh = new Float32Array(4);
function gs(i, t, e) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const s = t * e;
  let r = th[s];
  if (r === void 0 && (r = new Float32Array(s), th[s] = r), t !== 0) {
    n.toArray(r, 0);
    for (let o = 1, a = 0; o !== t; ++o)
      a += e, i[o].toArray(r, a);
  }
  return r;
}
function Pe(i, t) {
  if (i.length !== t.length) return !1;
  for (let e = 0, n = i.length; e < n; e++)
    if (i[e] !== t[e]) return !1;
  return !0;
}
function Le(i, t) {
  for (let e = 0, n = t.length; e < n; e++)
    i[e] = t[e];
}
function Eo(i, t) {
  let e = eh[t];
  e === void 0 && (e = new Int32Array(t), eh[t] = e);
  for (let n = 0; n !== t; ++n)
    e[n] = i.allocateTextureUnit();
  return e;
}
function Gg(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
}
function Vg(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Pe(e, t)) return;
    i.uniform2fv(this.addr, t), Le(e, t);
  }
}
function Wg(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else if (t.r !== void 0)
    (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
  else {
    if (Pe(e, t)) return;
    i.uniform3fv(this.addr, t), Le(e, t);
  }
}
function $g(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Pe(e, t)) return;
    i.uniform4fv(this.addr, t), Le(e, t);
  }
}
function Xg(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Pe(e, t)) return;
    i.uniformMatrix2fv(this.addr, !1, t), Le(e, t);
  } else {
    if (Pe(e, n)) return;
    sh.set(n), i.uniformMatrix2fv(this.addr, !1, sh), Le(e, n);
  }
}
function jg(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Pe(e, t)) return;
    i.uniformMatrix3fv(this.addr, !1, t), Le(e, t);
  } else {
    if (Pe(e, n)) return;
    ih.set(n), i.uniformMatrix3fv(this.addr, !1, ih), Le(e, n);
  }
}
function Kg(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Pe(e, t)) return;
    i.uniformMatrix4fv(this.addr, !1, t), Le(e, t);
  } else {
    if (Pe(e, n)) return;
    nh.set(n), i.uniformMatrix4fv(this.addr, !1, nh), Le(e, n);
  }
}
function qg(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
}
function Yg(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Pe(e, t)) return;
    i.uniform2iv(this.addr, t), Le(e, t);
  }
}
function Zg(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Pe(e, t)) return;
    i.uniform3iv(this.addr, t), Le(e, t);
  }
}
function Jg(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Pe(e, t)) return;
    i.uniform4iv(this.addr, t), Le(e, t);
  }
}
function Qg(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
}
function t_(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Pe(e, t)) return;
    i.uniform2uiv(this.addr, t), Le(e, t);
  }
}
function e_(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Pe(e, t)) return;
    i.uniform3uiv(this.addr, t), Le(e, t);
  }
}
function n_(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Pe(e, t)) return;
    i.uniform4uiv(this.addr, t), Le(e, t);
  }
}
function i_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
  let r;
  this.type === i.SAMPLER_2D_SHADOW ? (Qc.compareFunction = zd, r = Qc) : r = Jd, e.setTexture2D(t || r, s);
}
function s_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture3D(t || tu, s);
}
function r_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTextureCube(t || eu, s);
}
function o_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture2DArray(t || Qd, s);
}
function a_(i) {
  switch (i) {
    case 5126:
      return Gg;
    case 35664:
      return Vg;
    case 35665:
      return Wg;
    case 35666:
      return $g;
    case 35674:
      return Xg;
    case 35675:
      return jg;
    case 35676:
      return Kg;
    case 5124:
    case 35670:
      return qg;
    case 35667:
    case 35671:
      return Yg;
    case 35668:
    case 35672:
      return Zg;
    case 35669:
    case 35673:
      return Jg;
    case 5125:
      return Qg;
    case 36294:
      return t_;
    case 36295:
      return e_;
    case 36296:
      return n_;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return i_;
    case 35679:
    case 36299:
    case 36307:
      return s_;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return r_;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return o_;
  }
}
function l_(i, t) {
  i.uniform1fv(this.addr, t);
}
function c_(i, t) {
  const e = gs(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function h_(i, t) {
  const e = gs(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function d_(i, t) {
  const e = gs(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function u_(i, t) {
  const e = gs(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function f_(i, t) {
  const e = gs(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function p_(i, t) {
  const e = gs(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function m_(i, t) {
  i.uniform1iv(this.addr, t);
}
function g_(i, t) {
  i.uniform2iv(this.addr, t);
}
function __(i, t) {
  i.uniform3iv(this.addr, t);
}
function v_(i, t) {
  i.uniform4iv(this.addr, t);
}
function x_(i, t) {
  i.uniform1uiv(this.addr, t);
}
function y_(i, t) {
  i.uniform2uiv(this.addr, t);
}
function M_(i, t) {
  i.uniform3uiv(this.addr, t);
}
function S_(i, t) {
  i.uniform4uiv(this.addr, t);
}
function b_(i, t, e) {
  const n = this.cache, s = t.length, r = Eo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture2D(t[o] || Jd, r[o]);
}
function E_(i, t, e) {
  const n = this.cache, s = t.length, r = Eo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture3D(t[o] || tu, r[o]);
}
function w_(i, t, e) {
  const n = this.cache, s = t.length, r = Eo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTextureCube(t[o] || eu, r[o]);
}
function T_(i, t, e) {
  const n = this.cache, s = t.length, r = Eo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture2DArray(t[o] || Qd, r[o]);
}
function A_(i) {
  switch (i) {
    case 5126:
      return l_;
    case 35664:
      return c_;
    case 35665:
      return h_;
    case 35666:
      return d_;
    case 35674:
      return u_;
    case 35675:
      return f_;
    case 35676:
      return p_;
    case 5124:
    case 35670:
      return m_;
    case 35667:
    case 35671:
      return g_;
    case 35668:
    case 35672:
      return __;
    case 35669:
    case 35673:
      return v_;
    case 5125:
      return x_;
    case 36294:
      return y_;
    case 36295:
      return M_;
    case 36296:
      return S_;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return b_;
    case 35679:
    case 36299:
    case 36307:
      return E_;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return w_;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return T_;
  }
}
class R_ {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = a_(e.type);
  }
}
class C_ {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = A_(e.type);
  }
}
class P_ {
  constructor(t) {
    this.id = t, this.seq = [], this.map = {};
  }
  setValue(t, e, n) {
    const s = this.seq;
    for (let r = 0, o = s.length; r !== o; ++r) {
      const a = s[r];
      a.setValue(t, e[a.id], n);
    }
  }
}
const ra = /(\w+)(\])?(\[|\.)?/g;
function rh(i, t) {
  i.seq.push(t), i.map[t.id] = t;
}
function L_(i, t, e) {
  const n = i.name, s = n.length;
  for (ra.lastIndex = 0; ; ) {
    const r = ra.exec(n), o = ra.lastIndex;
    let a = r[1];
    const l = r[2] === "]", c = r[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === s) {
      rh(e, c === void 0 ? new R_(a, i, t) : new C_(a, i, t));
      break;
    } else {
      let d = e.map[a];
      d === void 0 && (d = new P_(a), rh(e, d)), e = d;
    }
  }
}
class ro {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let s = 0; s < n; ++s) {
      const r = t.getActiveUniform(e, s), o = t.getUniformLocation(e, r.name);
      L_(r, o, this);
    }
  }
  setValue(t, e, n, s) {
    const r = this.map[e];
    r !== void 0 && r.setValue(t, n, s);
  }
  setOptional(t, e, n) {
    const s = e[n];
    s !== void 0 && this.setValue(t, n, s);
  }
  static upload(t, e, n, s) {
    for (let r = 0, o = e.length; r !== o; ++r) {
      const a = e[r], l = n[a.id];
      l.needsUpdate !== !1 && a.setValue(t, l.value, s);
    }
  }
  static seqWithValue(t, e) {
    const n = [];
    for (let s = 0, r = t.length; s !== r; ++s) {
      const o = t[s];
      o.id in e && n.push(o);
    }
    return n;
  }
}
function oh(i, t, e) {
  const n = i.createShader(t);
  return i.shaderSource(n, e), i.compileShader(n), n;
}
const I_ = 37297;
let D_ = 0;
function N_(i, t) {
  const e = i.split(`
`), n = [], s = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
  for (let o = s; o < r; o++) {
    const a = o + 1;
    n.push(`${a === t ? ">" : " "} ${a}: ${e[o]}`);
  }
  return n.join(`
`);
}
function U_(i) {
  const t = ne.getPrimaries(ne.workingColorSpace), e = ne.getPrimaries(i);
  let n;
  switch (t === e ? n = "" : t === uo && e === ho ? n = "LinearDisplayP3ToLinearSRGB" : t === ho && e === uo && (n = "LinearSRGBToLinearDisplayP3"), i) {
    case Oe:
    case bo:
      return [n, "LinearTransferOETF"];
    case ke:
    case Il:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", i), [n, "LinearTransferOETF"];
  }
}
function ah(i, t, e) {
  const n = i.getShaderParameter(t, i.COMPILE_STATUS), s = i.getShaderInfoLog(t).trim();
  if (n && s === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(s);
  if (r) {
    const o = parseInt(r[1]);
    return e.toUpperCase() + `

` + s + `

` + N_(i.getShaderSource(t), o);
  } else
    return s;
}
function O_(i, t) {
  const e = U_(t);
  return `vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`;
}
function F_(i, t) {
  let e;
  switch (t) {
    case Of:
      e = "Linear";
      break;
    case Ff:
      e = "Reinhard";
      break;
    case Bf:
      e = "Cineon";
      break;
    case kf:
      e = "ACESFilmic";
      break;
    case Hf:
      e = "AgX";
      break;
    case Gf:
      e = "Neutral";
      break;
    case zf:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const Ir = /* @__PURE__ */ new P();
function B_() {
  ne.getLuminanceCoefficients(Ir);
  const i = Ir.x.toFixed(4), t = Ir.y.toFixed(4), e = Ir.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function k_(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Bs).join(`
`);
}
function z_(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function H_(i, t) {
  const e = {}, n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
  for (let s = 0; s < n; s++) {
    const r = i.getActiveAttrib(t, s), o = r.name;
    let a = 1;
    r.type === i.FLOAT_MAT2 && (a = 2), r.type === i.FLOAT_MAT3 && (a = 3), r.type === i.FLOAT_MAT4 && (a = 4), e[o] = {
      type: r.type,
      location: i.getAttribLocation(t, o),
      locationSize: a
    };
  }
  return e;
}
function Bs(i) {
  return i !== "";
}
function lh(i, t) {
  const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function ch(i, t) {
  return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
const G_ = /^[ \t]*#include +<([\w\d./]+)>/gm;
function ll(i) {
  return i.replace(G_, W_);
}
const V_ = /* @__PURE__ */ new Map();
function W_(i, t) {
  let e = Gt[t];
  if (e === void 0) {
    const n = V_.get(t);
    if (n !== void 0)
      e = Gt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else
      throw new Error("Can not resolve #include <" + t + ">");
  }
  return ll(e);
}
const $_ = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function hh(i) {
  return i.replace($_, X_);
}
function X_(i, t, e, n) {
  let s = "";
  for (let r = parseInt(t); r < parseInt(e); r++)
    s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return s;
}
function dh(i) {
  let t = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return i.precision === "highp" ? t += `
#define HIGH_PRECISION` : i.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (t += `
#define LOW_PRECISION`), t;
}
function j_(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === Ed ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === wd ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === Un && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function K_(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case os:
      case as:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case So:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function q_(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  if (i.envMap)
    switch (i.envMapMode) {
      case as:
        t = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return t;
}
function Y_(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case Td:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Nf:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case Uf:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function Z_(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 7 * 16)), texelHeight: n, maxMip: e };
}
function J_(i, t, e, n) {
  const s = i.getContext(), r = e.defines;
  let o = e.vertexShader, a = e.fragmentShader;
  const l = j_(e), c = K_(e), h = q_(e), d = Y_(e), u = Z_(e), f = k_(e), g = z_(r), v = s.createProgram();
  let p, m, x = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
  e.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g
  ].filter(Bs).join(`
`), p.length > 0 && (p += `
`), m = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g
  ].filter(Bs).join(`
`), m.length > 0 && (m += `
`)) : (p = [
    dh(e),
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g,
    e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    e.batching ? "#define USE_BATCHING" : "",
    e.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    e.instancing ? "#define USE_INSTANCING" : "",
    e.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    e.useFog && e.fog ? "#define USE_FOG" : "",
    e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
    e.map ? "#define USE_MAP" : "",
    e.envMap ? "#define USE_ENVMAP" : "",
    e.envMap ? "#define " + h : "",
    e.lightMap ? "#define USE_LIGHTMAP" : "",
    e.aoMap ? "#define USE_AOMAP" : "",
    e.bumpMap ? "#define USE_BUMPMAP" : "",
    e.normalMap ? "#define USE_NORMALMAP" : "",
    e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    e.anisotropy ? "#define USE_ANISOTROPY" : "",
    e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    e.specularMap ? "#define USE_SPECULARMAP" : "",
    e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    e.metalnessMap ? "#define USE_METALNESSMAP" : "",
    e.alphaMap ? "#define USE_ALPHAMAP" : "",
    e.alphaHash ? "#define USE_ALPHAHASH" : "",
    e.transmission ? "#define USE_TRANSMISSION" : "",
    e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    //
    e.mapUv ? "#define MAP_UV " + e.mapUv : "",
    e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "",
    e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "",
    e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "",
    e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "",
    e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "",
    e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "",
    e.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv : "",
    e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "",
    e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "",
    e.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv : "",
    e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "",
    e.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv : "",
    e.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv : "",
    e.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv : "",
    e.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv : "",
    e.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv : "",
    e.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv : "",
    e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "",
    e.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv : "",
    e.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv : "",
    e.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv : "",
    e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "",
    //
    e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
    e.vertexColors ? "#define USE_COLOR" : "",
    e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    e.vertexUv1s ? "#define USE_UV1" : "",
    e.vertexUv2s ? "#define USE_UV2" : "",
    e.vertexUv3s ? "#define USE_UV3" : "",
    e.pointsUvs ? "#define USE_POINTS_UV" : "",
    e.flatShading ? "#define FLAT_SHADED" : "",
    e.skinning ? "#define USE_SKINNING" : "",
    e.morphTargets ? "#define USE_MORPHTARGETS" : "",
    e.morphNormals && e.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    e.morphColors ? "#define USE_MORPHCOLORS" : "",
    e.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride : "",
    e.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount : "",
    e.doubleSided ? "#define DOUBLE_SIDED" : "",
    e.flipSided ? "#define FLIP_SIDED" : "",
    e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    e.shadowMapEnabled ? "#define " + l : "",
    e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(Bs).join(`
`), m = [
    dh(e),
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g,
    e.useFog && e.fog ? "#define USE_FOG" : "",
    e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
    e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    e.map ? "#define USE_MAP" : "",
    e.matcap ? "#define USE_MATCAP" : "",
    e.envMap ? "#define USE_ENVMAP" : "",
    e.envMap ? "#define " + c : "",
    e.envMap ? "#define " + h : "",
    e.envMap ? "#define " + d : "",
    u ? "#define CUBEUV_TEXEL_WIDTH " + u.texelWidth : "",
    u ? "#define CUBEUV_TEXEL_HEIGHT " + u.texelHeight : "",
    u ? "#define CUBEUV_MAX_MIP " + u.maxMip + ".0" : "",
    e.lightMap ? "#define USE_LIGHTMAP" : "",
    e.aoMap ? "#define USE_AOMAP" : "",
    e.bumpMap ? "#define USE_BUMPMAP" : "",
    e.normalMap ? "#define USE_NORMALMAP" : "",
    e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    e.anisotropy ? "#define USE_ANISOTROPY" : "",
    e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    e.clearcoat ? "#define USE_CLEARCOAT" : "",
    e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    e.dispersion ? "#define USE_DISPERSION" : "",
    e.iridescence ? "#define USE_IRIDESCENCE" : "",
    e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    e.specularMap ? "#define USE_SPECULARMAP" : "",
    e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    e.metalnessMap ? "#define USE_METALNESSMAP" : "",
    e.alphaMap ? "#define USE_ALPHAMAP" : "",
    e.alphaTest ? "#define USE_ALPHATEST" : "",
    e.alphaHash ? "#define USE_ALPHAHASH" : "",
    e.sheen ? "#define USE_SHEEN" : "",
    e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    e.transmission ? "#define USE_TRANSMISSION" : "",
    e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
    e.vertexColors || e.instancingColor || e.batchingColor ? "#define USE_COLOR" : "",
    e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    e.vertexUv1s ? "#define USE_UV1" : "",
    e.vertexUv2s ? "#define USE_UV2" : "",
    e.vertexUv3s ? "#define USE_UV3" : "",
    e.pointsUvs ? "#define USE_POINTS_UV" : "",
    e.gradientMap ? "#define USE_GRADIENTMAP" : "",
    e.flatShading ? "#define FLAT_SHADED" : "",
    e.doubleSided ? "#define DOUBLE_SIDED" : "",
    e.flipSided ? "#define FLIP_SIDED" : "",
    e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    e.shadowMapEnabled ? "#define " + l : "",
    e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    e.toneMapping !== ri ? "#define TONE_MAPPING" : "",
    e.toneMapping !== ri ? Gt.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    e.toneMapping !== ri ? F_("toneMapping", e.toneMapping) : "",
    e.dithering ? "#define DITHERING" : "",
    e.opaque ? "#define OPAQUE" : "",
    Gt.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    O_("linearToOutputTexel", e.outputColorSpace),
    B_(),
    e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
    `
`
  ].filter(Bs).join(`
`)), o = ll(o), o = lh(o, e), o = ch(o, e), a = ll(a), a = lh(a, e), a = ch(a, e), o = hh(o), a = hh(a), e.isRawShaderMaterial !== !0 && (x = `#version 300 es
`, p = [
    f,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, m = [
    "#define varying in",
    e.glslVersion === Ac ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    e.glslVersion === Ac ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + m);
  const _ = x + p + o, M = x + m + a, L = oh(s, s.VERTEX_SHADER, _), T = oh(s, s.FRAGMENT_SHADER, M);
  s.attachShader(v, L), s.attachShader(v, T), e.index0AttributeName !== void 0 ? s.bindAttribLocation(v, 0, e.index0AttributeName) : e.morphTargets === !0 && s.bindAttribLocation(v, 0, "position"), s.linkProgram(v);
  function w(S) {
    if (i.debug.checkShaderErrors) {
      const N = s.getProgramInfoLog(v).trim(), k = s.getShaderInfoLog(L).trim(), G = s.getShaderInfoLog(T).trim();
      let q = !0, W = !0;
      if (s.getProgramParameter(v, s.LINK_STATUS) === !1)
        if (q = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(s, v, L, T);
        else {
          const et = ah(s, L, "vertex"), $ = ah(s, T, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(v, s.VALIDATE_STATUS) + `

Material Name: ` + S.name + `
Material Type: ` + S.type + `

Program Info Log: ` + N + `
` + et + `
` + $
          );
        }
      else N !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", N) : (k === "" || G === "") && (W = !1);
      W && (S.diagnostics = {
        runnable: q,
        programLog: N,
        vertexShader: {
          log: k,
          prefix: p
        },
        fragmentShader: {
          log: G,
          prefix: m
        }
      });
    }
    s.deleteShader(L), s.deleteShader(T), R = new ro(s, v), F = H_(s, v);
  }
  let R;
  this.getUniforms = function() {
    return R === void 0 && w(this), R;
  };
  let F;
  this.getAttributes = function() {
    return F === void 0 && w(this), F;
  };
  let y = e.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return y === !1 && (y = s.getProgramParameter(v, I_)), y;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), s.deleteProgram(v), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = D_++, this.cacheKey = t, this.usedTimes = 1, this.program = v, this.vertexShader = L, this.fragmentShader = T, this;
}
let Q_ = 0;
class tv {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(t) {
    const e = t.vertexShader, n = t.fragmentShader, s = this._getShaderStage(e), r = this._getShaderStage(n), o = this._getShaderCacheForMaterial(t);
    return o.has(s) === !1 && (o.add(s), s.usedTimes++), o.has(r) === !1 && (o.add(r), r.usedTimes++), this;
  }
  remove(t) {
    const e = this.materialCache.get(t);
    for (const n of e)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(t), this;
  }
  getVertexShaderID(t) {
    return this._getShaderStage(t.vertexShader).id;
  }
  getFragmentShaderID(t) {
    return this._getShaderStage(t.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(t) {
    const e = this.materialCache;
    let n = e.get(t);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), e.set(t, n)), n;
  }
  _getShaderStage(t) {
    const e = this.shaderCache;
    let n = e.get(t);
    return n === void 0 && (n = new ev(t), e.set(t, n)), n;
  }
}
class ev {
  constructor(t) {
    this.id = Q_++, this.code = t, this.usedTimes = 0;
  }
}
function nv(i, t, e, n, s, r, o) {
  const a = new Nl(), l = new tv(), c = /* @__PURE__ */ new Set(), h = [], d = s.logarithmicDepthBuffer, u = s.reverseDepthBuffer, f = s.vertexTextures;
  let g = s.precision;
  const v = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function p(y) {
    return c.add(y), y === 0 ? "uv" : `uv${y}`;
  }
  function m(y, S, N, k, G) {
    const q = k.fog, W = G.geometry, et = y.isMeshStandardMaterial ? k.environment : null, $ = (y.isMeshStandardMaterial ? e : t).get(y.envMap || et), lt = $ && $.mapping === So ? $.image.height : null, ct = v[y.type];
    y.precision !== null && (g = s.getMaxPrecision(y.precision), g !== y.precision && console.warn("THREE.WebGLProgram.getParameters:", y.precision, "not supported, using", g, "instead."));
    const St = W.morphAttributes.position || W.morphAttributes.normal || W.morphAttributes.color, ie = St !== void 0 ? St.length : 0;
    let le = 0;
    W.morphAttributes.position !== void 0 && (le = 1), W.morphAttributes.normal !== void 0 && (le = 2), W.morphAttributes.color !== void 0 && (le = 3);
    let Y, it, yt, mt;
    if (ct) {
      const $e = Mn[ct];
      Y = $e.vertexShader, it = $e.fragmentShader;
    } else
      Y = y.vertexShader, it = y.fragmentShader, l.update(y), yt = l.getVertexShaderID(y), mt = l.getFragmentShaderID(y);
    const kt = i.getRenderTarget(), Lt = G.isInstancedMesh === !0, Yt = G.isBatchedMesh === !0, fe = !!y.map, Zt = !!y.matcap, D = !!$, qe = !!y.aoMap, Kt = !!y.lightMap, Qt = !!y.bumpMap, Dt = !!y.normalMap, _e = !!y.displacementMap, Ot = !!y.emissiveMap, A = !!y.metalnessMap, b = !!y.roughnessMap, z = y.anisotropy > 0, J = y.clearcoat > 0, tt = y.dispersion > 0, Z = y.iridescence > 0, Et = y.sheen > 0, at = y.transmission > 0, gt = z && !!y.anisotropyMap, te = J && !!y.clearcoatMap, st = J && !!y.clearcoatNormalMap, _t = J && !!y.clearcoatRoughnessMap, Nt = Z && !!y.iridescenceMap, Ut = Z && !!y.iridescenceThicknessMap, vt = Et && !!y.sheenColorMap, qt = Et && !!y.sheenRoughnessMap, zt = !!y.specularMap, me = !!y.specularColorMap, U = !!y.specularIntensityMap, ut = at && !!y.transmissionMap, X = at && !!y.thicknessMap, Q = !!y.gradientMap, ht = !!y.alphaMap, ft = y.alphaTest > 0, Jt = !!y.alphaHash, Ee = !!y.extensions;
    let We = ri;
    y.toneMapped && (kt === null || kt.isXRRenderTarget === !0) && (We = i.toneMapping);
    const se = {
      shaderID: ct,
      shaderType: y.type,
      shaderName: y.name,
      vertexShader: Y,
      fragmentShader: it,
      defines: y.defines,
      customVertexShaderID: yt,
      customFragmentShaderID: mt,
      isRawShaderMaterial: y.isRawShaderMaterial === !0,
      glslVersion: y.glslVersion,
      precision: g,
      batching: Yt,
      batchingColor: Yt && G._colorsTexture !== null,
      instancing: Lt,
      instancingColor: Lt && G.instanceColor !== null,
      instancingMorph: Lt && G.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: kt === null ? i.outputColorSpace : kt.isXRRenderTarget === !0 ? kt.texture.colorSpace : Oe,
      alphaToCoverage: !!y.alphaToCoverage,
      map: fe,
      matcap: Zt,
      envMap: D,
      envMapMode: D && $.mapping,
      envMapCubeUVHeight: lt,
      aoMap: qe,
      lightMap: Kt,
      bumpMap: Qt,
      normalMap: Dt,
      displacementMap: f && _e,
      emissiveMap: Ot,
      normalMapObjectSpace: Dt && y.normalMapType === Kf,
      normalMapTangentSpace: Dt && y.normalMapType === kd,
      metalnessMap: A,
      roughnessMap: b,
      anisotropy: z,
      anisotropyMap: gt,
      clearcoat: J,
      clearcoatMap: te,
      clearcoatNormalMap: st,
      clearcoatRoughnessMap: _t,
      dispersion: tt,
      iridescence: Z,
      iridescenceMap: Nt,
      iridescenceThicknessMap: Ut,
      sheen: Et,
      sheenColorMap: vt,
      sheenRoughnessMap: qt,
      specularMap: zt,
      specularColorMap: me,
      specularIntensityMap: U,
      transmission: at,
      transmissionMap: ut,
      thicknessMap: X,
      gradientMap: Q,
      opaque: y.transparent === !1 && y.blending === Ji && y.alphaToCoverage === !1,
      alphaMap: ht,
      alphaTest: ft,
      alphaHash: Jt,
      combine: y.combine,
      //
      mapUv: fe && p(y.map.channel),
      aoMapUv: qe && p(y.aoMap.channel),
      lightMapUv: Kt && p(y.lightMap.channel),
      bumpMapUv: Qt && p(y.bumpMap.channel),
      normalMapUv: Dt && p(y.normalMap.channel),
      displacementMapUv: _e && p(y.displacementMap.channel),
      emissiveMapUv: Ot && p(y.emissiveMap.channel),
      metalnessMapUv: A && p(y.metalnessMap.channel),
      roughnessMapUv: b && p(y.roughnessMap.channel),
      anisotropyMapUv: gt && p(y.anisotropyMap.channel),
      clearcoatMapUv: te && p(y.clearcoatMap.channel),
      clearcoatNormalMapUv: st && p(y.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: _t && p(y.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Nt && p(y.iridescenceMap.channel),
      iridescenceThicknessMapUv: Ut && p(y.iridescenceThicknessMap.channel),
      sheenColorMapUv: vt && p(y.sheenColorMap.channel),
      sheenRoughnessMapUv: qt && p(y.sheenRoughnessMap.channel),
      specularMapUv: zt && p(y.specularMap.channel),
      specularColorMapUv: me && p(y.specularColorMap.channel),
      specularIntensityMapUv: U && p(y.specularIntensityMap.channel),
      transmissionMapUv: ut && p(y.transmissionMap.channel),
      thicknessMapUv: X && p(y.thicknessMap.channel),
      alphaMapUv: ht && p(y.alphaMap.channel),
      //
      vertexTangents: !!W.attributes.tangent && (Dt || z),
      vertexColors: y.vertexColors,
      vertexAlphas: y.vertexColors === !0 && !!W.attributes.color && W.attributes.color.itemSize === 4,
      pointsUvs: G.isPoints === !0 && !!W.attributes.uv && (fe || ht),
      fog: !!q,
      useFog: y.fog === !0,
      fogExp2: !!q && q.isFogExp2,
      flatShading: y.flatShading === !0,
      sizeAttenuation: y.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      reverseDepthBuffer: u,
      skinning: G.isSkinnedMesh === !0,
      morphTargets: W.morphAttributes.position !== void 0,
      morphNormals: W.morphAttributes.normal !== void 0,
      morphColors: W.morphAttributes.color !== void 0,
      morphTargetsCount: ie,
      morphTextureStride: le,
      numDirLights: S.directional.length,
      numPointLights: S.point.length,
      numSpotLights: S.spot.length,
      numSpotLightMaps: S.spotLightMap.length,
      numRectAreaLights: S.rectArea.length,
      numHemiLights: S.hemi.length,
      numDirLightShadows: S.directionalShadowMap.length,
      numPointLightShadows: S.pointShadowMap.length,
      numSpotLightShadows: S.spotShadowMap.length,
      numSpotLightShadowsWithMaps: S.numSpotLightShadowsWithMaps,
      numLightProbes: S.numLightProbes,
      numClippingPlanes: o.numPlanes,
      numClipIntersection: o.numIntersection,
      dithering: y.dithering,
      shadowMapEnabled: i.shadowMap.enabled && N.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: We,
      decodeVideoTexture: fe && y.map.isVideoTexture === !0 && ne.getTransfer(y.map.colorSpace) === xe,
      premultipliedAlpha: y.premultipliedAlpha,
      doubleSided: y.side === on,
      flipSided: y.side === je,
      useDepthPacking: y.depthPacking >= 0,
      depthPacking: y.depthPacking || 0,
      index0AttributeName: y.index0AttributeName,
      extensionClipCullDistance: Ee && y.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Ee && y.extensions.multiDraw === !0 || Yt) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: y.customProgramCacheKey()
    };
    return se.vertexUv1s = c.has(1), se.vertexUv2s = c.has(2), se.vertexUv3s = c.has(3), c.clear(), se;
  }
  function x(y) {
    const S = [];
    if (y.shaderID ? S.push(y.shaderID) : (S.push(y.customVertexShaderID), S.push(y.customFragmentShaderID)), y.defines !== void 0)
      for (const N in y.defines)
        S.push(N), S.push(y.defines[N]);
    return y.isRawShaderMaterial === !1 && (_(S, y), M(S, y), S.push(i.outputColorSpace)), S.push(y.customProgramCacheKey), S.join();
  }
  function _(y, S) {
    y.push(S.precision), y.push(S.outputColorSpace), y.push(S.envMapMode), y.push(S.envMapCubeUVHeight), y.push(S.mapUv), y.push(S.alphaMapUv), y.push(S.lightMapUv), y.push(S.aoMapUv), y.push(S.bumpMapUv), y.push(S.normalMapUv), y.push(S.displacementMapUv), y.push(S.emissiveMapUv), y.push(S.metalnessMapUv), y.push(S.roughnessMapUv), y.push(S.anisotropyMapUv), y.push(S.clearcoatMapUv), y.push(S.clearcoatNormalMapUv), y.push(S.clearcoatRoughnessMapUv), y.push(S.iridescenceMapUv), y.push(S.iridescenceThicknessMapUv), y.push(S.sheenColorMapUv), y.push(S.sheenRoughnessMapUv), y.push(S.specularMapUv), y.push(S.specularColorMapUv), y.push(S.specularIntensityMapUv), y.push(S.transmissionMapUv), y.push(S.thicknessMapUv), y.push(S.combine), y.push(S.fogExp2), y.push(S.sizeAttenuation), y.push(S.morphTargetsCount), y.push(S.morphAttributeCount), y.push(S.numDirLights), y.push(S.numPointLights), y.push(S.numSpotLights), y.push(S.numSpotLightMaps), y.push(S.numHemiLights), y.push(S.numRectAreaLights), y.push(S.numDirLightShadows), y.push(S.numPointLightShadows), y.push(S.numSpotLightShadows), y.push(S.numSpotLightShadowsWithMaps), y.push(S.numLightProbes), y.push(S.shadowMapType), y.push(S.toneMapping), y.push(S.numClippingPlanes), y.push(S.numClipIntersection), y.push(S.depthPacking);
  }
  function M(y, S) {
    a.disableAll(), S.supportsVertexTextures && a.enable(0), S.instancing && a.enable(1), S.instancingColor && a.enable(2), S.instancingMorph && a.enable(3), S.matcap && a.enable(4), S.envMap && a.enable(5), S.normalMapObjectSpace && a.enable(6), S.normalMapTangentSpace && a.enable(7), S.clearcoat && a.enable(8), S.iridescence && a.enable(9), S.alphaTest && a.enable(10), S.vertexColors && a.enable(11), S.vertexAlphas && a.enable(12), S.vertexUv1s && a.enable(13), S.vertexUv2s && a.enable(14), S.vertexUv3s && a.enable(15), S.vertexTangents && a.enable(16), S.anisotropy && a.enable(17), S.alphaHash && a.enable(18), S.batching && a.enable(19), S.dispersion && a.enable(20), S.batchingColor && a.enable(21), y.push(a.mask), a.disableAll(), S.fog && a.enable(0), S.useFog && a.enable(1), S.flatShading && a.enable(2), S.logarithmicDepthBuffer && a.enable(3), S.reverseDepthBuffer && a.enable(4), S.skinning && a.enable(5), S.morphTargets && a.enable(6), S.morphNormals && a.enable(7), S.morphColors && a.enable(8), S.premultipliedAlpha && a.enable(9), S.shadowMapEnabled && a.enable(10), S.doubleSided && a.enable(11), S.flipSided && a.enable(12), S.useDepthPacking && a.enable(13), S.dithering && a.enable(14), S.transmission && a.enable(15), S.sheen && a.enable(16), S.opaque && a.enable(17), S.pointsUvs && a.enable(18), S.decodeVideoTexture && a.enable(19), S.alphaToCoverage && a.enable(20), y.push(a.mask);
  }
  function L(y) {
    const S = v[y.type];
    let N;
    if (S) {
      const k = Mn[S];
      N = kp.clone(k.uniforms);
    } else
      N = y.uniforms;
    return N;
  }
  function T(y, S) {
    let N;
    for (let k = 0, G = h.length; k < G; k++) {
      const q = h[k];
      if (q.cacheKey === S) {
        N = q, ++N.usedTimes;
        break;
      }
    }
    return N === void 0 && (N = new J_(i, S, y, r), h.push(N)), N;
  }
  function w(y) {
    if (--y.usedTimes === 0) {
      const S = h.indexOf(y);
      h[S] = h[h.length - 1], h.pop(), y.destroy();
    }
  }
  function R(y) {
    l.remove(y);
  }
  function F() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: x,
    getUniforms: L,
    acquireProgram: T,
    releaseProgram: w,
    releaseShaderCache: R,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: F
  };
}
function iv() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(o) {
    return i.has(o);
  }
  function e(o) {
    let a = i.get(o);
    return a === void 0 && (a = {}, i.set(o, a)), a;
  }
  function n(o) {
    i.delete(o);
  }
  function s(o, a, l) {
    i.get(o)[a] = l;
  }
  function r() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: t,
    get: e,
    remove: n,
    update: s,
    dispose: r
  };
}
function sv(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
}
function uh(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
}
function fh() {
  const i = [];
  let t = 0;
  const e = [], n = [], s = [];
  function r() {
    t = 0, e.length = 0, n.length = 0, s.length = 0;
  }
  function o(d, u, f, g, v, p) {
    let m = i[t];
    return m === void 0 ? (m = {
      id: d.id,
      object: d,
      geometry: u,
      material: f,
      groupOrder: g,
      renderOrder: d.renderOrder,
      z: v,
      group: p
    }, i[t] = m) : (m.id = d.id, m.object = d, m.geometry = u, m.material = f, m.groupOrder = g, m.renderOrder = d.renderOrder, m.z = v, m.group = p), t++, m;
  }
  function a(d, u, f, g, v, p) {
    const m = o(d, u, f, g, v, p);
    f.transmission > 0 ? n.push(m) : f.transparent === !0 ? s.push(m) : e.push(m);
  }
  function l(d, u, f, g, v, p) {
    const m = o(d, u, f, g, v, p);
    f.transmission > 0 ? n.unshift(m) : f.transparent === !0 ? s.unshift(m) : e.unshift(m);
  }
  function c(d, u) {
    e.length > 1 && e.sort(d || sv), n.length > 1 && n.sort(u || uh), s.length > 1 && s.sort(u || uh);
  }
  function h() {
    for (let d = t, u = i.length; d < u; d++) {
      const f = i[d];
      if (f.id === null) break;
      f.id = null, f.object = null, f.geometry = null, f.material = null, f.group = null;
    }
  }
  return {
    opaque: e,
    transmissive: n,
    transparent: s,
    init: r,
    push: a,
    unshift: l,
    finish: h,
    sort: c
  };
}
function rv() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(n, s) {
    const r = i.get(n);
    let o;
    return r === void 0 ? (o = new fh(), i.set(n, [o])) : s >= r.length ? (o = new fh(), r.push(o)) : o = r[s], o;
  }
  function e() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: e
  };
}
function ov() {
  const i = {};
  return {
    get: function(t) {
      if (i[t.id] !== void 0)
        return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            direction: new P(),
            color: new Ct()
          };
          break;
        case "SpotLight":
          e = {
            position: new P(),
            direction: new P(),
            color: new Ct(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          e = {
            position: new P(),
            color: new Ct(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          e = {
            direction: new P(),
            skyColor: new Ct(),
            groundColor: new Ct()
          };
          break;
        case "RectAreaLight":
          e = {
            color: new Ct(),
            position: new P(),
            halfWidth: new P(),
            halfHeight: new P()
          };
          break;
      }
      return i[t.id] = e, e;
    }
  };
}
function av() {
  const i = {};
  return {
    get: function(t) {
      if (i[t.id] !== void 0)
        return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new nt()
          };
          break;
        case "SpotLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new nt()
          };
          break;
        case "PointLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new nt(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[t.id] = e, e;
    }
  };
}
let lv = 0;
function cv(i, t) {
  return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
}
function hv(i) {
  const t = new ov(), e = av(), n = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let c = 0; c < 9; c++) n.probe.push(new P());
  const s = new P(), r = new Ft(), o = new Ft();
  function a(c) {
    let h = 0, d = 0, u = 0;
    for (let F = 0; F < 9; F++) n.probe[F].set(0, 0, 0);
    let f = 0, g = 0, v = 0, p = 0, m = 0, x = 0, _ = 0, M = 0, L = 0, T = 0, w = 0;
    c.sort(cv);
    for (let F = 0, y = c.length; F < y; F++) {
      const S = c[F], N = S.color, k = S.intensity, G = S.distance, q = S.shadow && S.shadow.map ? S.shadow.map.texture : null;
      if (S.isAmbientLight)
        h += N.r * k, d += N.g * k, u += N.b * k;
      else if (S.isLightProbe) {
        for (let W = 0; W < 9; W++)
          n.probe[W].addScaledVector(S.sh.coefficients[W], k);
        w++;
      } else if (S.isDirectionalLight) {
        const W = t.get(S);
        if (W.color.copy(S.color).multiplyScalar(S.intensity), S.castShadow) {
          const et = S.shadow, $ = e.get(S);
          $.shadowIntensity = et.intensity, $.shadowBias = et.bias, $.shadowNormalBias = et.normalBias, $.shadowRadius = et.radius, $.shadowMapSize = et.mapSize, n.directionalShadow[f] = $, n.directionalShadowMap[f] = q, n.directionalShadowMatrix[f] = S.shadow.matrix, x++;
        }
        n.directional[f] = W, f++;
      } else if (S.isSpotLight) {
        const W = t.get(S);
        W.position.setFromMatrixPosition(S.matrixWorld), W.color.copy(N).multiplyScalar(k), W.distance = G, W.coneCos = Math.cos(S.angle), W.penumbraCos = Math.cos(S.angle * (1 - S.penumbra)), W.decay = S.decay, n.spot[v] = W;
        const et = S.shadow;
        if (S.map && (n.spotLightMap[L] = S.map, L++, et.updateMatrices(S), S.castShadow && T++), n.spotLightMatrix[v] = et.matrix, S.castShadow) {
          const $ = e.get(S);
          $.shadowIntensity = et.intensity, $.shadowBias = et.bias, $.shadowNormalBias = et.normalBias, $.shadowRadius = et.radius, $.shadowMapSize = et.mapSize, n.spotShadow[v] = $, n.spotShadowMap[v] = q, M++;
        }
        v++;
      } else if (S.isRectAreaLight) {
        const W = t.get(S);
        W.color.copy(N).multiplyScalar(k), W.halfWidth.set(S.width * 0.5, 0, 0), W.halfHeight.set(0, S.height * 0.5, 0), n.rectArea[p] = W, p++;
      } else if (S.isPointLight) {
        const W = t.get(S);
        if (W.color.copy(S.color).multiplyScalar(S.intensity), W.distance = S.distance, W.decay = S.decay, S.castShadow) {
          const et = S.shadow, $ = e.get(S);
          $.shadowIntensity = et.intensity, $.shadowBias = et.bias, $.shadowNormalBias = et.normalBias, $.shadowRadius = et.radius, $.shadowMapSize = et.mapSize, $.shadowCameraNear = et.camera.near, $.shadowCameraFar = et.camera.far, n.pointShadow[g] = $, n.pointShadowMap[g] = q, n.pointShadowMatrix[g] = S.shadow.matrix, _++;
        }
        n.point[g] = W, g++;
      } else if (S.isHemisphereLight) {
        const W = t.get(S);
        W.skyColor.copy(S.color).multiplyScalar(k), W.groundColor.copy(S.groundColor).multiplyScalar(k), n.hemi[m] = W, m++;
      }
    }
    p > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = ot.LTC_FLOAT_1, n.rectAreaLTC2 = ot.LTC_FLOAT_2) : (n.rectAreaLTC1 = ot.LTC_HALF_1, n.rectAreaLTC2 = ot.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = d, n.ambient[2] = u;
    const R = n.hash;
    (R.directionalLength !== f || R.pointLength !== g || R.spotLength !== v || R.rectAreaLength !== p || R.hemiLength !== m || R.numDirectionalShadows !== x || R.numPointShadows !== _ || R.numSpotShadows !== M || R.numSpotMaps !== L || R.numLightProbes !== w) && (n.directional.length = f, n.spot.length = v, n.rectArea.length = p, n.point.length = g, n.hemi.length = m, n.directionalShadow.length = x, n.directionalShadowMap.length = x, n.pointShadow.length = _, n.pointShadowMap.length = _, n.spotShadow.length = M, n.spotShadowMap.length = M, n.directionalShadowMatrix.length = x, n.pointShadowMatrix.length = _, n.spotLightMatrix.length = M + L - T, n.spotLightMap.length = L, n.numSpotLightShadowsWithMaps = T, n.numLightProbes = w, R.directionalLength = f, R.pointLength = g, R.spotLength = v, R.rectAreaLength = p, R.hemiLength = m, R.numDirectionalShadows = x, R.numPointShadows = _, R.numSpotShadows = M, R.numSpotMaps = L, R.numLightProbes = w, n.version = lv++);
  }
  function l(c, h) {
    let d = 0, u = 0, f = 0, g = 0, v = 0;
    const p = h.matrixWorldInverse;
    for (let m = 0, x = c.length; m < x; m++) {
      const _ = c[m];
      if (_.isDirectionalLight) {
        const M = n.directional[d];
        M.direction.setFromMatrixPosition(_.matrixWorld), s.setFromMatrixPosition(_.target.matrixWorld), M.direction.sub(s), M.direction.transformDirection(p), d++;
      } else if (_.isSpotLight) {
        const M = n.spot[f];
        M.position.setFromMatrixPosition(_.matrixWorld), M.position.applyMatrix4(p), M.direction.setFromMatrixPosition(_.matrixWorld), s.setFromMatrixPosition(_.target.matrixWorld), M.direction.sub(s), M.direction.transformDirection(p), f++;
      } else if (_.isRectAreaLight) {
        const M = n.rectArea[g];
        M.position.setFromMatrixPosition(_.matrixWorld), M.position.applyMatrix4(p), o.identity(), r.copy(_.matrixWorld), r.premultiply(p), o.extractRotation(r), M.halfWidth.set(_.width * 0.5, 0, 0), M.halfHeight.set(0, _.height * 0.5, 0), M.halfWidth.applyMatrix4(o), M.halfHeight.applyMatrix4(o), g++;
      } else if (_.isPointLight) {
        const M = n.point[u];
        M.position.setFromMatrixPosition(_.matrixWorld), M.position.applyMatrix4(p), u++;
      } else if (_.isHemisphereLight) {
        const M = n.hemi[v];
        M.direction.setFromMatrixPosition(_.matrixWorld), M.direction.transformDirection(p), v++;
      }
    }
  }
  return {
    setup: a,
    setupView: l,
    state: n
  };
}
function ph(i) {
  const t = new hv(i), e = [], n = [];
  function s(h) {
    c.camera = h, e.length = 0, n.length = 0;
  }
  function r(h) {
    e.push(h);
  }
  function o(h) {
    n.push(h);
  }
  function a() {
    t.setup(e);
  }
  function l(h) {
    t.setupView(e, h);
  }
  const c = {
    lightsArray: e,
    shadowsArray: n,
    camera: null,
    lights: t,
    transmissionRenderTarget: {}
  };
  return {
    init: s,
    state: c,
    setupLights: a,
    setupLightsView: l,
    pushLight: r,
    pushShadow: o
  };
}
function dv(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(s, r = 0) {
    const o = t.get(s);
    let a;
    return o === void 0 ? (a = new ph(i), t.set(s, [a])) : r >= o.length ? (a = new ph(i), o.push(a)) : a = o[r], a;
  }
  function n() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: n
  };
}
class uv extends vn {
  constructor(t) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = Xf, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class fv extends vn {
  constructor(t) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
  }
}
const pv = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, mv = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function gv(i, t, e) {
  let n = new Ul();
  const s = new nt(), r = new nt(), o = new re(), a = new uv({ depthPacking: jf }), l = new fv(), c = {}, h = e.maxTextureSize, d = { [Hn]: je, [je]: Hn, [on]: on }, u = new ai({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new nt() },
      radius: { value: 4 }
    },
    vertexShader: pv,
    fragmentShader: mv
  }), f = u.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new Ie();
  g.setAttribute(
    "position",
    new Ue(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const v = new ge(g, u), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = Ed;
  let m = this.type;
  this.render = function(T, w, R) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || T.length === 0) return;
    const F = i.getRenderTarget(), y = i.getActiveCubeFace(), S = i.getActiveMipmapLevel(), N = i.state;
    N.setBlending(si), N.buffers.color.setClear(1, 1, 1, 1), N.buffers.depth.setTest(!0), N.setScissorTest(!1);
    const k = m !== Un && this.type === Un, G = m === Un && this.type !== Un;
    for (let q = 0, W = T.length; q < W; q++) {
      const et = T[q], $ = et.shadow;
      if ($ === void 0) {
        console.warn("THREE.WebGLShadowMap:", et, "has no shadow.");
        continue;
      }
      if ($.autoUpdate === !1 && $.needsUpdate === !1) continue;
      s.copy($.mapSize);
      const lt = $.getFrameExtents();
      if (s.multiply(lt), r.copy($.mapSize), (s.x > h || s.y > h) && (s.x > h && (r.x = Math.floor(h / lt.x), s.x = r.x * lt.x, $.mapSize.x = r.x), s.y > h && (r.y = Math.floor(h / lt.y), s.y = r.y * lt.y, $.mapSize.y = r.y)), $.map === null || k === !0 || G === !0) {
        const St = this.type !== Un ? { minFilter: Ve, magFilter: Ve } : {};
        $.map !== null && $.map.dispose(), $.map = new Ei(s.x, s.y, St), $.map.texture.name = et.name + ".shadowMap", $.camera.updateProjectionMatrix();
      }
      i.setRenderTarget($.map), i.clear();
      const ct = $.getViewportCount();
      for (let St = 0; St < ct; St++) {
        const ie = $.getViewport(St);
        o.set(
          r.x * ie.x,
          r.y * ie.y,
          r.x * ie.z,
          r.y * ie.w
        ), N.viewport(o), $.updateMatrices(et, St), n = $.getFrustum(), M(w, R, $.camera, et, this.type);
      }
      $.isPointLightShadow !== !0 && this.type === Un && x($, R), $.needsUpdate = !1;
    }
    m = this.type, p.needsUpdate = !1, i.setRenderTarget(F, y, S);
  };
  function x(T, w) {
    const R = t.update(v);
    u.defines.VSM_SAMPLES !== T.blurSamples && (u.defines.VSM_SAMPLES = T.blurSamples, f.defines.VSM_SAMPLES = T.blurSamples, u.needsUpdate = !0, f.needsUpdate = !0), T.mapPass === null && (T.mapPass = new Ei(s.x, s.y)), u.uniforms.shadow_pass.value = T.map.texture, u.uniforms.resolution.value = T.mapSize, u.uniforms.radius.value = T.radius, i.setRenderTarget(T.mapPass), i.clear(), i.renderBufferDirect(w, null, R, u, v, null), f.uniforms.shadow_pass.value = T.mapPass.texture, f.uniforms.resolution.value = T.mapSize, f.uniforms.radius.value = T.radius, i.setRenderTarget(T.map), i.clear(), i.renderBufferDirect(w, null, R, f, v, null);
  }
  function _(T, w, R, F) {
    let y = null;
    const S = R.isPointLight === !0 ? T.customDistanceMaterial : T.customDepthMaterial;
    if (S !== void 0)
      y = S;
    else if (y = R.isPointLight === !0 ? l : a, i.localClippingEnabled && w.clipShadows === !0 && Array.isArray(w.clippingPlanes) && w.clippingPlanes.length !== 0 || w.displacementMap && w.displacementScale !== 0 || w.alphaMap && w.alphaTest > 0 || w.map && w.alphaTest > 0) {
      const N = y.uuid, k = w.uuid;
      let G = c[N];
      G === void 0 && (G = {}, c[N] = G);
      let q = G[k];
      q === void 0 && (q = y.clone(), G[k] = q, w.addEventListener("dispose", L)), y = q;
    }
    if (y.visible = w.visible, y.wireframe = w.wireframe, F === Un ? y.side = w.shadowSide !== null ? w.shadowSide : w.side : y.side = w.shadowSide !== null ? w.shadowSide : d[w.side], y.alphaMap = w.alphaMap, y.alphaTest = w.alphaTest, y.map = w.map, y.clipShadows = w.clipShadows, y.clippingPlanes = w.clippingPlanes, y.clipIntersection = w.clipIntersection, y.displacementMap = w.displacementMap, y.displacementScale = w.displacementScale, y.displacementBias = w.displacementBias, y.wireframeLinewidth = w.wireframeLinewidth, y.linewidth = w.linewidth, R.isPointLight === !0 && y.isMeshDistanceMaterial === !0) {
      const N = i.properties.get(y);
      N.light = R;
    }
    return y;
  }
  function M(T, w, R, F, y) {
    if (T.visible === !1) return;
    if (T.layers.test(w.layers) && (T.isMesh || T.isLine || T.isPoints) && (T.castShadow || T.receiveShadow && y === Un) && (!T.frustumCulled || n.intersectsObject(T))) {
      T.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse, T.matrixWorld);
      const k = t.update(T), G = T.material;
      if (Array.isArray(G)) {
        const q = k.groups;
        for (let W = 0, et = q.length; W < et; W++) {
          const $ = q[W], lt = G[$.materialIndex];
          if (lt && lt.visible) {
            const ct = _(T, lt, F, y);
            T.onBeforeShadow(i, T, w, R, k, ct, $), i.renderBufferDirect(R, null, k, ct, T, $), T.onAfterShadow(i, T, w, R, k, ct, $);
          }
        }
      } else if (G.visible) {
        const q = _(T, G, F, y);
        T.onBeforeShadow(i, T, w, R, k, q, null), i.renderBufferDirect(R, null, k, q, T, null), T.onAfterShadow(i, T, w, R, k, q, null);
      }
    }
    const N = T.children;
    for (let k = 0, G = N.length; k < G; k++)
      M(N[k], w, R, F, y);
  }
  function L(T) {
    T.target.removeEventListener("dispose", L);
    for (const R in c) {
      const F = c[R], y = T.target.uuid;
      y in F && (F[y].dispose(), delete F[y]);
    }
  }
}
const _v = {
  [wa]: Ta,
  [Aa]: Pa,
  [Ra]: La,
  [rs]: Ca,
  [Ta]: wa,
  [Pa]: Aa,
  [La]: Ra,
  [Ca]: rs
};
function vv(i) {
  function t() {
    let U = !1;
    const ut = new re();
    let X = null;
    const Q = new re(0, 0, 0, 0);
    return {
      setMask: function(ht) {
        X !== ht && !U && (i.colorMask(ht, ht, ht, ht), X = ht);
      },
      setLocked: function(ht) {
        U = ht;
      },
      setClear: function(ht, ft, Jt, Ee, We) {
        We === !0 && (ht *= Ee, ft *= Ee, Jt *= Ee), ut.set(ht, ft, Jt, Ee), Q.equals(ut) === !1 && (i.clearColor(ht, ft, Jt, Ee), Q.copy(ut));
      },
      reset: function() {
        U = !1, X = null, Q.set(-1, 0, 0, 0);
      }
    };
  }
  function e() {
    let U = !1, ut = !1, X = null, Q = null, ht = null;
    return {
      setReversed: function(ft) {
        ut = ft;
      },
      setTest: function(ft) {
        ft ? yt(i.DEPTH_TEST) : mt(i.DEPTH_TEST);
      },
      setMask: function(ft) {
        X !== ft && !U && (i.depthMask(ft), X = ft);
      },
      setFunc: function(ft) {
        if (ut && (ft = _v[ft]), Q !== ft) {
          switch (ft) {
            case wa:
              i.depthFunc(i.NEVER);
              break;
            case Ta:
              i.depthFunc(i.ALWAYS);
              break;
            case Aa:
              i.depthFunc(i.LESS);
              break;
            case rs:
              i.depthFunc(i.LEQUAL);
              break;
            case Ra:
              i.depthFunc(i.EQUAL);
              break;
            case Ca:
              i.depthFunc(i.GEQUAL);
              break;
            case Pa:
              i.depthFunc(i.GREATER);
              break;
            case La:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          Q = ft;
        }
      },
      setLocked: function(ft) {
        U = ft;
      },
      setClear: function(ft) {
        ht !== ft && (i.clearDepth(ft), ht = ft);
      },
      reset: function() {
        U = !1, X = null, Q = null, ht = null;
      }
    };
  }
  function n() {
    let U = !1, ut = null, X = null, Q = null, ht = null, ft = null, Jt = null, Ee = null, We = null;
    return {
      setTest: function(se) {
        U || (se ? yt(i.STENCIL_TEST) : mt(i.STENCIL_TEST));
      },
      setMask: function(se) {
        ut !== se && !U && (i.stencilMask(se), ut = se);
      },
      setFunc: function(se, $e, Rn) {
        (X !== se || Q !== $e || ht !== Rn) && (i.stencilFunc(se, $e, Rn), X = se, Q = $e, ht = Rn);
      },
      setOp: function(se, $e, Rn) {
        (ft !== se || Jt !== $e || Ee !== Rn) && (i.stencilOp(se, $e, Rn), ft = se, Jt = $e, Ee = Rn);
      },
      setLocked: function(se) {
        U = se;
      },
      setClear: function(se) {
        We !== se && (i.clearStencil(se), We = se);
      },
      reset: function() {
        U = !1, ut = null, X = null, Q = null, ht = null, ft = null, Jt = null, Ee = null, We = null;
      }
    };
  }
  const s = new t(), r = new e(), o = new n(), a = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
  let c = {}, h = {}, d = /* @__PURE__ */ new WeakMap(), u = [], f = null, g = !1, v = null, p = null, m = null, x = null, _ = null, M = null, L = null, T = new Ct(0, 0, 0), w = 0, R = !1, F = null, y = null, S = null, N = null, k = null;
  const G = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let q = !1, W = 0;
  const et = i.getParameter(i.VERSION);
  et.indexOf("WebGL") !== -1 ? (W = parseFloat(/^WebGL (\d)/.exec(et)[1]), q = W >= 1) : et.indexOf("OpenGL ES") !== -1 && (W = parseFloat(/^OpenGL ES (\d)/.exec(et)[1]), q = W >= 2);
  let $ = null, lt = {};
  const ct = i.getParameter(i.SCISSOR_BOX), St = i.getParameter(i.VIEWPORT), ie = new re().fromArray(ct), le = new re().fromArray(St);
  function Y(U, ut, X, Q) {
    const ht = new Uint8Array(4), ft = i.createTexture();
    i.bindTexture(U, ft), i.texParameteri(U, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(U, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let Jt = 0; Jt < X; Jt++)
      U === i.TEXTURE_3D || U === i.TEXTURE_2D_ARRAY ? i.texImage3D(ut, 0, i.RGBA, 1, 1, Q, 0, i.RGBA, i.UNSIGNED_BYTE, ht) : i.texImage2D(ut + Jt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, ht);
    return ft;
  }
  const it = {};
  it[i.TEXTURE_2D] = Y(i.TEXTURE_2D, i.TEXTURE_2D, 1), it[i.TEXTURE_CUBE_MAP] = Y(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), it[i.TEXTURE_2D_ARRAY] = Y(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), it[i.TEXTURE_3D] = Y(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), r.setClear(1), o.setClear(0), yt(i.DEPTH_TEST), r.setFunc(rs), Kt(!1), Qt(vc), yt(i.CULL_FACE), D(si);
  function yt(U) {
    c[U] !== !0 && (i.enable(U), c[U] = !0);
  }
  function mt(U) {
    c[U] !== !1 && (i.disable(U), c[U] = !1);
  }
  function kt(U, ut) {
    return h[U] !== ut ? (i.bindFramebuffer(U, ut), h[U] = ut, U === i.DRAW_FRAMEBUFFER && (h[i.FRAMEBUFFER] = ut), U === i.FRAMEBUFFER && (h[i.DRAW_FRAMEBUFFER] = ut), !0) : !1;
  }
  function Lt(U, ut) {
    let X = u, Q = !1;
    if (U) {
      X = d.get(ut), X === void 0 && (X = [], d.set(ut, X));
      const ht = U.textures;
      if (X.length !== ht.length || X[0] !== i.COLOR_ATTACHMENT0) {
        for (let ft = 0, Jt = ht.length; ft < Jt; ft++)
          X[ft] = i.COLOR_ATTACHMENT0 + ft;
        X.length = ht.length, Q = !0;
      }
    } else
      X[0] !== i.BACK && (X[0] = i.BACK, Q = !0);
    Q && i.drawBuffers(X);
  }
  function Yt(U) {
    return f !== U ? (i.useProgram(U), f = U, !0) : !1;
  }
  const fe = {
    [xi]: i.FUNC_ADD,
    [_f]: i.FUNC_SUBTRACT,
    [vf]: i.FUNC_REVERSE_SUBTRACT
  };
  fe[xf] = i.MIN, fe[yf] = i.MAX;
  const Zt = {
    [Mf]: i.ZERO,
    [Sf]: i.ONE,
    [bf]: i.SRC_COLOR,
    [ba]: i.SRC_ALPHA,
    [Cf]: i.SRC_ALPHA_SATURATE,
    [Af]: i.DST_COLOR,
    [wf]: i.DST_ALPHA,
    [Ef]: i.ONE_MINUS_SRC_COLOR,
    [Ea]: i.ONE_MINUS_SRC_ALPHA,
    [Rf]: i.ONE_MINUS_DST_COLOR,
    [Tf]: i.ONE_MINUS_DST_ALPHA,
    [Pf]: i.CONSTANT_COLOR,
    [Lf]: i.ONE_MINUS_CONSTANT_COLOR,
    [If]: i.CONSTANT_ALPHA,
    [Df]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function D(U, ut, X, Q, ht, ft, Jt, Ee, We, se) {
    if (U === si) {
      g === !0 && (mt(i.BLEND), g = !1);
      return;
    }
    if (g === !1 && (yt(i.BLEND), g = !0), U !== gf) {
      if (U !== v || se !== R) {
        if ((p !== xi || _ !== xi) && (i.blendEquation(i.FUNC_ADD), p = xi, _ = xi), se)
          switch (U) {
            case Ji:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case xc:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case yc:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Mc:
              i.blendFuncSeparate(i.ZERO, i.SRC_COLOR, i.ZERO, i.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", U);
              break;
          }
        else
          switch (U) {
            case Ji:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case xc:
              i.blendFunc(i.SRC_ALPHA, i.ONE);
              break;
            case yc:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Mc:
              i.blendFunc(i.ZERO, i.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", U);
              break;
          }
        m = null, x = null, M = null, L = null, T.set(0, 0, 0), w = 0, v = U, R = se;
      }
      return;
    }
    ht = ht || ut, ft = ft || X, Jt = Jt || Q, (ut !== p || ht !== _) && (i.blendEquationSeparate(fe[ut], fe[ht]), p = ut, _ = ht), (X !== m || Q !== x || ft !== M || Jt !== L) && (i.blendFuncSeparate(Zt[X], Zt[Q], Zt[ft], Zt[Jt]), m = X, x = Q, M = ft, L = Jt), (Ee.equals(T) === !1 || We !== w) && (i.blendColor(Ee.r, Ee.g, Ee.b, We), T.copy(Ee), w = We), v = U, R = !1;
  }
  function qe(U, ut) {
    U.side === on ? mt(i.CULL_FACE) : yt(i.CULL_FACE);
    let X = U.side === je;
    ut && (X = !X), Kt(X), U.blending === Ji && U.transparent === !1 ? D(si) : D(U.blending, U.blendEquation, U.blendSrc, U.blendDst, U.blendEquationAlpha, U.blendSrcAlpha, U.blendDstAlpha, U.blendColor, U.blendAlpha, U.premultipliedAlpha), r.setFunc(U.depthFunc), r.setTest(U.depthTest), r.setMask(U.depthWrite), s.setMask(U.colorWrite);
    const Q = U.stencilWrite;
    o.setTest(Q), Q && (o.setMask(U.stencilWriteMask), o.setFunc(U.stencilFunc, U.stencilRef, U.stencilFuncMask), o.setOp(U.stencilFail, U.stencilZFail, U.stencilZPass)), _e(U.polygonOffset, U.polygonOffsetFactor, U.polygonOffsetUnits), U.alphaToCoverage === !0 ? yt(i.SAMPLE_ALPHA_TO_COVERAGE) : mt(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Kt(U) {
    F !== U && (U ? i.frontFace(i.CW) : i.frontFace(i.CCW), F = U);
  }
  function Qt(U) {
    U !== pf ? (yt(i.CULL_FACE), U !== y && (U === vc ? i.cullFace(i.BACK) : U === mf ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : mt(i.CULL_FACE), y = U;
  }
  function Dt(U) {
    U !== S && (q && i.lineWidth(U), S = U);
  }
  function _e(U, ut, X) {
    U ? (yt(i.POLYGON_OFFSET_FILL), (N !== ut || k !== X) && (i.polygonOffset(ut, X), N = ut, k = X)) : mt(i.POLYGON_OFFSET_FILL);
  }
  function Ot(U) {
    U ? yt(i.SCISSOR_TEST) : mt(i.SCISSOR_TEST);
  }
  function A(U) {
    U === void 0 && (U = i.TEXTURE0 + G - 1), $ !== U && (i.activeTexture(U), $ = U);
  }
  function b(U, ut, X) {
    X === void 0 && ($ === null ? X = i.TEXTURE0 + G - 1 : X = $);
    let Q = lt[X];
    Q === void 0 && (Q = { type: void 0, texture: void 0 }, lt[X] = Q), (Q.type !== U || Q.texture !== ut) && ($ !== X && (i.activeTexture(X), $ = X), i.bindTexture(U, ut || it[U]), Q.type = U, Q.texture = ut);
  }
  function z() {
    const U = lt[$];
    U !== void 0 && U.type !== void 0 && (i.bindTexture(U.type, null), U.type = void 0, U.texture = void 0);
  }
  function J() {
    try {
      i.compressedTexImage2D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function tt() {
    try {
      i.compressedTexImage3D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function Z() {
    try {
      i.texSubImage2D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function Et() {
    try {
      i.texSubImage3D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function at() {
    try {
      i.compressedTexSubImage2D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function gt() {
    try {
      i.compressedTexSubImage3D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function te() {
    try {
      i.texStorage2D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function st() {
    try {
      i.texStorage3D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function _t() {
    try {
      i.texImage2D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function Nt() {
    try {
      i.texImage3D.apply(i, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function Ut(U) {
    ie.equals(U) === !1 && (i.scissor(U.x, U.y, U.z, U.w), ie.copy(U));
  }
  function vt(U) {
    le.equals(U) === !1 && (i.viewport(U.x, U.y, U.z, U.w), le.copy(U));
  }
  function qt(U, ut) {
    let X = l.get(ut);
    X === void 0 && (X = /* @__PURE__ */ new WeakMap(), l.set(ut, X));
    let Q = X.get(U);
    Q === void 0 && (Q = i.getUniformBlockIndex(ut, U.name), X.set(U, Q));
  }
  function zt(U, ut) {
    const Q = l.get(ut).get(U);
    a.get(ut) !== Q && (i.uniformBlockBinding(ut, Q, U.__bindingPointIndex), a.set(ut, Q));
  }
  function me() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), c = {}, $ = null, lt = {}, h = {}, d = /* @__PURE__ */ new WeakMap(), u = [], f = null, g = !1, v = null, p = null, m = null, x = null, _ = null, M = null, L = null, T = new Ct(0, 0, 0), w = 0, R = !1, F = null, y = null, S = null, N = null, k = null, ie.set(0, 0, i.canvas.width, i.canvas.height), le.set(0, 0, i.canvas.width, i.canvas.height), s.reset(), r.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: r,
      stencil: o
    },
    enable: yt,
    disable: mt,
    bindFramebuffer: kt,
    drawBuffers: Lt,
    useProgram: Yt,
    setBlending: D,
    setMaterial: qe,
    setFlipSided: Kt,
    setCullFace: Qt,
    setLineWidth: Dt,
    setPolygonOffset: _e,
    setScissorTest: Ot,
    activeTexture: A,
    bindTexture: b,
    unbindTexture: z,
    compressedTexImage2D: J,
    compressedTexImage3D: tt,
    texImage2D: _t,
    texImage3D: Nt,
    updateUBOMapping: qt,
    uniformBlockBinding: zt,
    texStorage2D: te,
    texStorage3D: st,
    texSubImage2D: Z,
    texSubImage3D: Et,
    compressedTexSubImage2D: at,
    compressedTexSubImage3D: gt,
    scissor: Ut,
    viewport: vt,
    reset: me
  };
}
function mh(i, t, e, n) {
  const s = xv(n);
  switch (e) {
    case Id:
      return i * t;
    case Nd:
      return i * t;
    case Ud:
      return i * t * 2;
    case Rl:
      return i * t / s.components * s.byteLength;
    case Cl:
      return i * t / s.components * s.byteLength;
    case Od:
      return i * t * 2 / s.components * s.byteLength;
    case Pl:
      return i * t * 2 / s.components * s.byteLength;
    case Dd:
      return i * t * 3 / s.components * s.byteLength;
    case ln:
      return i * t * 4 / s.components * s.byteLength;
    case Ll:
      return i * t * 4 / s.components * s.byteLength;
    case Qr:
    case to:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case eo:
    case no:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Ua:
    case Fa:
      return Math.max(i, 16) * Math.max(t, 8) / 4;
    case Na:
    case Oa:
      return Math.max(i, 8) * Math.max(t, 8) / 2;
    case Ba:
    case ka:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case za:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Ha:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Ga:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Va:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Wa:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case $a:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case Xa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case ja:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case Ka:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case qa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case Ya:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case Za:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case Ja:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case Qa:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case tl:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case io:
    case el:
    case nl:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    case Fd:
    case il:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case sl:
    case rl:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${e} format.`
  );
}
function xv(i) {
  switch (i) {
    case Gn:
    case Cd:
      return { byteLength: 1, components: 1 };
    case qs:
    case Pd:
    case or:
      return { byteLength: 2, components: 1 };
    case Tl:
    case Al:
      return { byteLength: 2, components: 4 };
    case bi:
    case wl:
    case _n:
      return { byteLength: 4, components: 1 };
    case Ld:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
function yv(i, t, e, n, s, r, o) {
  const a = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new nt(), h = /* @__PURE__ */ new WeakMap();
  let d;
  const u = /* @__PURE__ */ new WeakMap();
  let f = !1;
  try {
    f = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(A, b) {
    return f ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(A, b)
    ) : Js("canvas");
  }
  function v(A, b, z) {
    let J = 1;
    const tt = Ot(A);
    if ((tt.width > z || tt.height > z) && (J = z / Math.max(tt.width, tt.height)), J < 1)
      if (typeof HTMLImageElement < "u" && A instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && A instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && A instanceof ImageBitmap || typeof VideoFrame < "u" && A instanceof VideoFrame) {
        const Z = Math.floor(J * tt.width), Et = Math.floor(J * tt.height);
        d === void 0 && (d = g(Z, Et));
        const at = b ? g(Z, Et) : d;
        return at.width = Z, at.height = Et, at.getContext("2d").drawImage(A, 0, 0, Z, Et), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + tt.width + "x" + tt.height + ") to (" + Z + "x" + Et + ")."), at;
      } else
        return "data" in A && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + tt.width + "x" + tt.height + ")."), A;
    return A;
  }
  function p(A) {
    return A.generateMipmaps && A.minFilter !== Ve && A.minFilter !== tn;
  }
  function m(A) {
    i.generateMipmap(A);
  }
  function x(A, b, z, J, tt = !1) {
    if (A !== null) {
      if (i[A] !== void 0) return i[A];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + A + "'");
    }
    let Z = b;
    if (b === i.RED && (z === i.FLOAT && (Z = i.R32F), z === i.HALF_FLOAT && (Z = i.R16F), z === i.UNSIGNED_BYTE && (Z = i.R8)), b === i.RED_INTEGER && (z === i.UNSIGNED_BYTE && (Z = i.R8UI), z === i.UNSIGNED_SHORT && (Z = i.R16UI), z === i.UNSIGNED_INT && (Z = i.R32UI), z === i.BYTE && (Z = i.R8I), z === i.SHORT && (Z = i.R16I), z === i.INT && (Z = i.R32I)), b === i.RG && (z === i.FLOAT && (Z = i.RG32F), z === i.HALF_FLOAT && (Z = i.RG16F), z === i.UNSIGNED_BYTE && (Z = i.RG8)), b === i.RG_INTEGER && (z === i.UNSIGNED_BYTE && (Z = i.RG8UI), z === i.UNSIGNED_SHORT && (Z = i.RG16UI), z === i.UNSIGNED_INT && (Z = i.RG32UI), z === i.BYTE && (Z = i.RG8I), z === i.SHORT && (Z = i.RG16I), z === i.INT && (Z = i.RG32I)), b === i.RGB_INTEGER && (z === i.UNSIGNED_BYTE && (Z = i.RGB8UI), z === i.UNSIGNED_SHORT && (Z = i.RGB16UI), z === i.UNSIGNED_INT && (Z = i.RGB32UI), z === i.BYTE && (Z = i.RGB8I), z === i.SHORT && (Z = i.RGB16I), z === i.INT && (Z = i.RGB32I)), b === i.RGBA_INTEGER && (z === i.UNSIGNED_BYTE && (Z = i.RGBA8UI), z === i.UNSIGNED_SHORT && (Z = i.RGBA16UI), z === i.UNSIGNED_INT && (Z = i.RGBA32UI), z === i.BYTE && (Z = i.RGBA8I), z === i.SHORT && (Z = i.RGBA16I), z === i.INT && (Z = i.RGBA32I)), b === i.RGB && z === i.UNSIGNED_INT_5_9_9_9_REV && (Z = i.RGB9_E5), b === i.RGBA) {
      const Et = tt ? co : ne.getTransfer(J);
      z === i.FLOAT && (Z = i.RGBA32F), z === i.HALF_FLOAT && (Z = i.RGBA16F), z === i.UNSIGNED_BYTE && (Z = Et === xe ? i.SRGB8_ALPHA8 : i.RGBA8), z === i.UNSIGNED_SHORT_4_4_4_4 && (Z = i.RGBA4), z === i.UNSIGNED_SHORT_5_5_5_1 && (Z = i.RGB5_A1);
    }
    return (Z === i.R16F || Z === i.R32F || Z === i.RG16F || Z === i.RG32F || Z === i.RGBA16F || Z === i.RGBA32F) && t.get("EXT_color_buffer_float"), Z;
  }
  function _(A, b) {
    let z;
    return A ? b === null || b === bi || b === ls ? z = i.DEPTH24_STENCIL8 : b === _n ? z = i.DEPTH32F_STENCIL8 : b === qs && (z = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : b === null || b === bi || b === ls ? z = i.DEPTH_COMPONENT24 : b === _n ? z = i.DEPTH_COMPONENT32F : b === qs && (z = i.DEPTH_COMPONENT16), z;
  }
  function M(A, b) {
    return p(A) === !0 || A.isFramebufferTexture && A.minFilter !== Ve && A.minFilter !== tn ? Math.log2(Math.max(b.width, b.height)) + 1 : A.mipmaps !== void 0 && A.mipmaps.length > 0 ? A.mipmaps.length : A.isCompressedTexture && Array.isArray(A.image) ? b.mipmaps.length : 1;
  }
  function L(A) {
    const b = A.target;
    b.removeEventListener("dispose", L), w(b), b.isVideoTexture && h.delete(b);
  }
  function T(A) {
    const b = A.target;
    b.removeEventListener("dispose", T), F(b);
  }
  function w(A) {
    const b = n.get(A);
    if (b.__webglInit === void 0) return;
    const z = A.source, J = u.get(z);
    if (J) {
      const tt = J[b.__cacheKey];
      tt.usedTimes--, tt.usedTimes === 0 && R(A), Object.keys(J).length === 0 && u.delete(z);
    }
    n.remove(A);
  }
  function R(A) {
    const b = n.get(A);
    i.deleteTexture(b.__webglTexture);
    const z = A.source, J = u.get(z);
    delete J[b.__cacheKey], o.memory.textures--;
  }
  function F(A) {
    const b = n.get(A);
    if (A.depthTexture && A.depthTexture.dispose(), A.isWebGLCubeRenderTarget)
      for (let J = 0; J < 6; J++) {
        if (Array.isArray(b.__webglFramebuffer[J]))
          for (let tt = 0; tt < b.__webglFramebuffer[J].length; tt++) i.deleteFramebuffer(b.__webglFramebuffer[J][tt]);
        else
          i.deleteFramebuffer(b.__webglFramebuffer[J]);
        b.__webglDepthbuffer && i.deleteRenderbuffer(b.__webglDepthbuffer[J]);
      }
    else {
      if (Array.isArray(b.__webglFramebuffer))
        for (let J = 0; J < b.__webglFramebuffer.length; J++) i.deleteFramebuffer(b.__webglFramebuffer[J]);
      else
        i.deleteFramebuffer(b.__webglFramebuffer);
      if (b.__webglDepthbuffer && i.deleteRenderbuffer(b.__webglDepthbuffer), b.__webglMultisampledFramebuffer && i.deleteFramebuffer(b.__webglMultisampledFramebuffer), b.__webglColorRenderbuffer)
        for (let J = 0; J < b.__webglColorRenderbuffer.length; J++)
          b.__webglColorRenderbuffer[J] && i.deleteRenderbuffer(b.__webglColorRenderbuffer[J]);
      b.__webglDepthRenderbuffer && i.deleteRenderbuffer(b.__webglDepthRenderbuffer);
    }
    const z = A.textures;
    for (let J = 0, tt = z.length; J < tt; J++) {
      const Z = n.get(z[J]);
      Z.__webglTexture && (i.deleteTexture(Z.__webglTexture), o.memory.textures--), n.remove(z[J]);
    }
    n.remove(A);
  }
  let y = 0;
  function S() {
    y = 0;
  }
  function N() {
    const A = y;
    return A >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + A + " texture units while this GPU supports only " + s.maxTextures), y += 1, A;
  }
  function k(A) {
    const b = [];
    return b.push(A.wrapS), b.push(A.wrapT), b.push(A.wrapR || 0), b.push(A.magFilter), b.push(A.minFilter), b.push(A.anisotropy), b.push(A.internalFormat), b.push(A.format), b.push(A.type), b.push(A.generateMipmaps), b.push(A.premultiplyAlpha), b.push(A.flipY), b.push(A.unpackAlignment), b.push(A.colorSpace), b.join();
  }
  function G(A, b) {
    const z = n.get(A);
    if (A.isVideoTexture && Dt(A), A.isRenderTargetTexture === !1 && A.version > 0 && z.__version !== A.version) {
      const J = A.image;
      if (J === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (J.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        le(z, A, b);
        return;
      }
    }
    e.bindTexture(i.TEXTURE_2D, z.__webglTexture, i.TEXTURE0 + b);
  }
  function q(A, b) {
    const z = n.get(A);
    if (A.version > 0 && z.__version !== A.version) {
      le(z, A, b);
      return;
    }
    e.bindTexture(i.TEXTURE_2D_ARRAY, z.__webglTexture, i.TEXTURE0 + b);
  }
  function W(A, b) {
    const z = n.get(A);
    if (A.version > 0 && z.__version !== A.version) {
      le(z, A, b);
      return;
    }
    e.bindTexture(i.TEXTURE_3D, z.__webglTexture, i.TEXTURE0 + b);
  }
  function et(A, b) {
    const z = n.get(A);
    if (A.version > 0 && z.__version !== A.version) {
      Y(z, A, b);
      return;
    }
    e.bindTexture(i.TEXTURE_CUBE_MAP, z.__webglTexture, i.TEXTURE0 + b);
  }
  const $ = {
    [oi]: i.REPEAT,
    [ni]: i.CLAMP_TO_EDGE,
    [lo]: i.MIRRORED_REPEAT
  }, lt = {
    [Ve]: i.NEAREST,
    [Rd]: i.NEAREST_MIPMAP_NEAREST,
    [Fs]: i.NEAREST_MIPMAP_LINEAR,
    [tn]: i.LINEAR,
    [Jr]: i.LINEAR_MIPMAP_NEAREST,
    [Bn]: i.LINEAR_MIPMAP_LINEAR
  }, ct = {
    [qf]: i.NEVER,
    [ep]: i.ALWAYS,
    [Yf]: i.LESS,
    [zd]: i.LEQUAL,
    [Zf]: i.EQUAL,
    [tp]: i.GEQUAL,
    [Jf]: i.GREATER,
    [Qf]: i.NOTEQUAL
  };
  function St(A, b) {
    if (b.type === _n && t.has("OES_texture_float_linear") === !1 && (b.magFilter === tn || b.magFilter === Jr || b.magFilter === Fs || b.magFilter === Bn || b.minFilter === tn || b.minFilter === Jr || b.minFilter === Fs || b.minFilter === Bn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(A, i.TEXTURE_WRAP_S, $[b.wrapS]), i.texParameteri(A, i.TEXTURE_WRAP_T, $[b.wrapT]), (A === i.TEXTURE_3D || A === i.TEXTURE_2D_ARRAY) && i.texParameteri(A, i.TEXTURE_WRAP_R, $[b.wrapR]), i.texParameteri(A, i.TEXTURE_MAG_FILTER, lt[b.magFilter]), i.texParameteri(A, i.TEXTURE_MIN_FILTER, lt[b.minFilter]), b.compareFunction && (i.texParameteri(A, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(A, i.TEXTURE_COMPARE_FUNC, ct[b.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (b.magFilter === Ve || b.minFilter !== Fs && b.minFilter !== Bn || b.type === _n && t.has("OES_texture_float_linear") === !1) return;
      if (b.anisotropy > 1 || n.get(b).__currentAnisotropy) {
        const z = t.get("EXT_texture_filter_anisotropic");
        i.texParameterf(A, z.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(b.anisotropy, s.getMaxAnisotropy())), n.get(b).__currentAnisotropy = b.anisotropy;
      }
    }
  }
  function ie(A, b) {
    let z = !1;
    A.__webglInit === void 0 && (A.__webglInit = !0, b.addEventListener("dispose", L));
    const J = b.source;
    let tt = u.get(J);
    tt === void 0 && (tt = {}, u.set(J, tt));
    const Z = k(b);
    if (Z !== A.__cacheKey) {
      tt[Z] === void 0 && (tt[Z] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, o.memory.textures++, z = !0), tt[Z].usedTimes++;
      const Et = tt[A.__cacheKey];
      Et !== void 0 && (tt[A.__cacheKey].usedTimes--, Et.usedTimes === 0 && R(b)), A.__cacheKey = Z, A.__webglTexture = tt[Z].texture;
    }
    return z;
  }
  function le(A, b, z) {
    let J = i.TEXTURE_2D;
    (b.isDataArrayTexture || b.isCompressedArrayTexture) && (J = i.TEXTURE_2D_ARRAY), b.isData3DTexture && (J = i.TEXTURE_3D);
    const tt = ie(A, b), Z = b.source;
    e.bindTexture(J, A.__webglTexture, i.TEXTURE0 + z);
    const Et = n.get(Z);
    if (Z.version !== Et.__version || tt === !0) {
      e.activeTexture(i.TEXTURE0 + z);
      const at = ne.getPrimaries(ne.workingColorSpace), gt = b.colorSpace === ei ? null : ne.getPrimaries(b.colorSpace), te = b.colorSpace === ei || at === gt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, b.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, b.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, b.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, te);
      let st = v(b.image, !1, s.maxTextureSize);
      st = _e(b, st);
      const _t = r.convert(b.format, b.colorSpace), Nt = r.convert(b.type);
      let Ut = x(b.internalFormat, _t, Nt, b.colorSpace, b.isVideoTexture);
      St(J, b);
      let vt;
      const qt = b.mipmaps, zt = b.isVideoTexture !== !0, me = Et.__version === void 0 || tt === !0, U = Z.dataReady, ut = M(b, st);
      if (b.isDepthTexture)
        Ut = _(b.format === cs, b.type), me && (zt ? e.texStorage2D(i.TEXTURE_2D, 1, Ut, st.width, st.height) : e.texImage2D(i.TEXTURE_2D, 0, Ut, st.width, st.height, 0, _t, Nt, null));
      else if (b.isDataTexture)
        if (qt.length > 0) {
          zt && me && e.texStorage2D(i.TEXTURE_2D, ut, Ut, qt[0].width, qt[0].height);
          for (let X = 0, Q = qt.length; X < Q; X++)
            vt = qt[X], zt ? U && e.texSubImage2D(i.TEXTURE_2D, X, 0, 0, vt.width, vt.height, _t, Nt, vt.data) : e.texImage2D(i.TEXTURE_2D, X, Ut, vt.width, vt.height, 0, _t, Nt, vt.data);
          b.generateMipmaps = !1;
        } else
          zt ? (me && e.texStorage2D(i.TEXTURE_2D, ut, Ut, st.width, st.height), U && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, st.width, st.height, _t, Nt, st.data)) : e.texImage2D(i.TEXTURE_2D, 0, Ut, st.width, st.height, 0, _t, Nt, st.data);
      else if (b.isCompressedTexture)
        if (b.isCompressedArrayTexture) {
          zt && me && e.texStorage3D(i.TEXTURE_2D_ARRAY, ut, Ut, qt[0].width, qt[0].height, st.depth);
          for (let X = 0, Q = qt.length; X < Q; X++)
            if (vt = qt[X], b.format !== ln)
              if (_t !== null)
                if (zt) {
                  if (U)
                    if (b.layerUpdates.size > 0) {
                      const ht = mh(vt.width, vt.height, b.format, b.type);
                      for (const ft of b.layerUpdates) {
                        const Jt = vt.data.subarray(
                          ft * ht / vt.data.BYTES_PER_ELEMENT,
                          (ft + 1) * ht / vt.data.BYTES_PER_ELEMENT
                        );
                        e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, ft, vt.width, vt.height, 1, _t, Jt, 0, 0);
                      }
                      b.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, 0, vt.width, vt.height, st.depth, _t, vt.data, 0, 0);
                } else
                  e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, X, Ut, vt.width, vt.height, st.depth, 0, vt.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              zt ? U && e.texSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, 0, vt.width, vt.height, st.depth, _t, Nt, vt.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, X, Ut, vt.width, vt.height, st.depth, 0, _t, Nt, vt.data);
        } else {
          zt && me && e.texStorage2D(i.TEXTURE_2D, ut, Ut, qt[0].width, qt[0].height);
          for (let X = 0, Q = qt.length; X < Q; X++)
            vt = qt[X], b.format !== ln ? _t !== null ? zt ? U && e.compressedTexSubImage2D(i.TEXTURE_2D, X, 0, 0, vt.width, vt.height, _t, vt.data) : e.compressedTexImage2D(i.TEXTURE_2D, X, Ut, vt.width, vt.height, 0, vt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : zt ? U && e.texSubImage2D(i.TEXTURE_2D, X, 0, 0, vt.width, vt.height, _t, Nt, vt.data) : e.texImage2D(i.TEXTURE_2D, X, Ut, vt.width, vt.height, 0, _t, Nt, vt.data);
        }
      else if (b.isDataArrayTexture)
        if (zt) {
          if (me && e.texStorage3D(i.TEXTURE_2D_ARRAY, ut, Ut, st.width, st.height, st.depth), U)
            if (b.layerUpdates.size > 0) {
              const X = mh(st.width, st.height, b.format, b.type);
              for (const Q of b.layerUpdates) {
                const ht = st.data.subarray(
                  Q * X / st.data.BYTES_PER_ELEMENT,
                  (Q + 1) * X / st.data.BYTES_PER_ELEMENT
                );
                e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, Q, st.width, st.height, 1, _t, Nt, ht);
              }
              b.clearLayerUpdates();
            } else
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, st.width, st.height, st.depth, _t, Nt, st.data);
        } else
          e.texImage3D(i.TEXTURE_2D_ARRAY, 0, Ut, st.width, st.height, st.depth, 0, _t, Nt, st.data);
      else if (b.isData3DTexture)
        zt ? (me && e.texStorage3D(i.TEXTURE_3D, ut, Ut, st.width, st.height, st.depth), U && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, st.width, st.height, st.depth, _t, Nt, st.data)) : e.texImage3D(i.TEXTURE_3D, 0, Ut, st.width, st.height, st.depth, 0, _t, Nt, st.data);
      else if (b.isFramebufferTexture) {
        if (me)
          if (zt)
            e.texStorage2D(i.TEXTURE_2D, ut, Ut, st.width, st.height);
          else {
            let X = st.width, Q = st.height;
            for (let ht = 0; ht < ut; ht++)
              e.texImage2D(i.TEXTURE_2D, ht, Ut, X, Q, 0, _t, Nt, null), X >>= 1, Q >>= 1;
          }
      } else if (qt.length > 0) {
        if (zt && me) {
          const X = Ot(qt[0]);
          e.texStorage2D(i.TEXTURE_2D, ut, Ut, X.width, X.height);
        }
        for (let X = 0, Q = qt.length; X < Q; X++)
          vt = qt[X], zt ? U && e.texSubImage2D(i.TEXTURE_2D, X, 0, 0, _t, Nt, vt) : e.texImage2D(i.TEXTURE_2D, X, Ut, _t, Nt, vt);
        b.generateMipmaps = !1;
      } else if (zt) {
        if (me) {
          const X = Ot(st);
          e.texStorage2D(i.TEXTURE_2D, ut, Ut, X.width, X.height);
        }
        U && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, _t, Nt, st);
      } else
        e.texImage2D(i.TEXTURE_2D, 0, Ut, _t, Nt, st);
      p(b) && m(J), Et.__version = Z.version, b.onUpdate && b.onUpdate(b);
    }
    A.__version = b.version;
  }
  function Y(A, b, z) {
    if (b.image.length !== 6) return;
    const J = ie(A, b), tt = b.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, A.__webglTexture, i.TEXTURE0 + z);
    const Z = n.get(tt);
    if (tt.version !== Z.__version || J === !0) {
      e.activeTexture(i.TEXTURE0 + z);
      const Et = ne.getPrimaries(ne.workingColorSpace), at = b.colorSpace === ei ? null : ne.getPrimaries(b.colorSpace), gt = b.colorSpace === ei || Et === at ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, b.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, b.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, b.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, gt);
      const te = b.isCompressedTexture || b.image[0].isCompressedTexture, st = b.image[0] && b.image[0].isDataTexture, _t = [];
      for (let Q = 0; Q < 6; Q++)
        !te && !st ? _t[Q] = v(b.image[Q], !0, s.maxCubemapSize) : _t[Q] = st ? b.image[Q].image : b.image[Q], _t[Q] = _e(b, _t[Q]);
      const Nt = _t[0], Ut = r.convert(b.format, b.colorSpace), vt = r.convert(b.type), qt = x(b.internalFormat, Ut, vt, b.colorSpace), zt = b.isVideoTexture !== !0, me = Z.__version === void 0 || J === !0, U = tt.dataReady;
      let ut = M(b, Nt);
      St(i.TEXTURE_CUBE_MAP, b);
      let X;
      if (te) {
        zt && me && e.texStorage2D(i.TEXTURE_CUBE_MAP, ut, qt, Nt.width, Nt.height);
        for (let Q = 0; Q < 6; Q++) {
          X = _t[Q].mipmaps;
          for (let ht = 0; ht < X.length; ht++) {
            const ft = X[ht];
            b.format !== ln ? Ut !== null ? zt ? U && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht, 0, 0, ft.width, ft.height, Ut, ft.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht, qt, ft.width, ft.height, 0, ft.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : zt ? U && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht, 0, 0, ft.width, ft.height, Ut, vt, ft.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht, qt, ft.width, ft.height, 0, Ut, vt, ft.data);
          }
        }
      } else {
        if (X = b.mipmaps, zt && me) {
          X.length > 0 && ut++;
          const Q = Ot(_t[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, ut, qt, Q.width, Q.height);
        }
        for (let Q = 0; Q < 6; Q++)
          if (st) {
            zt ? U && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, 0, 0, _t[Q].width, _t[Q].height, Ut, vt, _t[Q].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, qt, _t[Q].width, _t[Q].height, 0, Ut, vt, _t[Q].data);
            for (let ht = 0; ht < X.length; ht++) {
              const Jt = X[ht].image[Q].image;
              zt ? U && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht + 1, 0, 0, Jt.width, Jt.height, Ut, vt, Jt.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht + 1, qt, Jt.width, Jt.height, 0, Ut, vt, Jt.data);
            }
          } else {
            zt ? U && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, 0, 0, Ut, vt, _t[Q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, qt, Ut, vt, _t[Q]);
            for (let ht = 0; ht < X.length; ht++) {
              const ft = X[ht];
              zt ? U && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht + 1, 0, 0, Ut, vt, ft.image[Q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ht + 1, qt, Ut, vt, ft.image[Q]);
            }
          }
      }
      p(b) && m(i.TEXTURE_CUBE_MAP), Z.__version = tt.version, b.onUpdate && b.onUpdate(b);
    }
    A.__version = b.version;
  }
  function it(A, b, z, J, tt, Z) {
    const Et = r.convert(z.format, z.colorSpace), at = r.convert(z.type), gt = x(z.internalFormat, Et, at, z.colorSpace);
    if (!n.get(b).__hasExternalTextures) {
      const st = Math.max(1, b.width >> Z), _t = Math.max(1, b.height >> Z);
      tt === i.TEXTURE_3D || tt === i.TEXTURE_2D_ARRAY ? e.texImage3D(tt, Z, gt, st, _t, b.depth, 0, Et, at, null) : e.texImage2D(tt, Z, gt, st, _t, 0, Et, at, null);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, A), Qt(b) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, J, tt, n.get(z).__webglTexture, 0, Kt(b)) : (tt === i.TEXTURE_2D || tt >= i.TEXTURE_CUBE_MAP_POSITIVE_X && tt <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, J, tt, n.get(z).__webglTexture, Z), e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function yt(A, b, z) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, A), b.depthBuffer) {
      const J = b.depthTexture, tt = J && J.isDepthTexture ? J.type : null, Z = _(b.stencilBuffer, tt), Et = b.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, at = Kt(b);
      Qt(b) ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, at, Z, b.width, b.height) : z ? i.renderbufferStorageMultisample(i.RENDERBUFFER, at, Z, b.width, b.height) : i.renderbufferStorage(i.RENDERBUFFER, Z, b.width, b.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, Et, i.RENDERBUFFER, A);
    } else {
      const J = b.textures;
      for (let tt = 0; tt < J.length; tt++) {
        const Z = J[tt], Et = r.convert(Z.format, Z.colorSpace), at = r.convert(Z.type), gt = x(Z.internalFormat, Et, at, Z.colorSpace), te = Kt(b);
        z && Qt(b) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, te, gt, b.width, b.height) : Qt(b) ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, te, gt, b.width, b.height) : i.renderbufferStorage(i.RENDERBUFFER, gt, b.width, b.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function mt(A, b) {
    if (b && b.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (e.bindFramebuffer(i.FRAMEBUFFER, A), !(b.depthTexture && b.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(b.depthTexture).__webglTexture || b.depthTexture.image.width !== b.width || b.depthTexture.image.height !== b.height) && (b.depthTexture.image.width = b.width, b.depthTexture.image.height = b.height, b.depthTexture.needsUpdate = !0), G(b.depthTexture, 0);
    const J = n.get(b.depthTexture).__webglTexture, tt = Kt(b);
    if (b.depthTexture.format === Qi)
      Qt(b) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, J, 0, tt) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, J, 0);
    else if (b.depthTexture.format === cs)
      Qt(b) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, J, 0, tt) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, J, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function kt(A) {
    const b = n.get(A), z = A.isWebGLCubeRenderTarget === !0;
    if (b.__boundDepthTexture !== A.depthTexture) {
      const J = A.depthTexture;
      if (b.__depthDisposeCallback && b.__depthDisposeCallback(), J) {
        const tt = () => {
          delete b.__boundDepthTexture, delete b.__depthDisposeCallback, J.removeEventListener("dispose", tt);
        };
        J.addEventListener("dispose", tt), b.__depthDisposeCallback = tt;
      }
      b.__boundDepthTexture = J;
    }
    if (A.depthTexture && !b.__autoAllocateDepthBuffer) {
      if (z) throw new Error("target.depthTexture not supported in Cube render targets");
      mt(b.__webglFramebuffer, A);
    } else if (z) {
      b.__webglDepthbuffer = [];
      for (let J = 0; J < 6; J++)
        if (e.bindFramebuffer(i.FRAMEBUFFER, b.__webglFramebuffer[J]), b.__webglDepthbuffer[J] === void 0)
          b.__webglDepthbuffer[J] = i.createRenderbuffer(), yt(b.__webglDepthbuffer[J], A, !1);
        else {
          const tt = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Z = b.__webglDepthbuffer[J];
          i.bindRenderbuffer(i.RENDERBUFFER, Z), i.framebufferRenderbuffer(i.FRAMEBUFFER, tt, i.RENDERBUFFER, Z);
        }
    } else if (e.bindFramebuffer(i.FRAMEBUFFER, b.__webglFramebuffer), b.__webglDepthbuffer === void 0)
      b.__webglDepthbuffer = i.createRenderbuffer(), yt(b.__webglDepthbuffer, A, !1);
    else {
      const J = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, tt = b.__webglDepthbuffer;
      i.bindRenderbuffer(i.RENDERBUFFER, tt), i.framebufferRenderbuffer(i.FRAMEBUFFER, J, i.RENDERBUFFER, tt);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Lt(A, b, z) {
    const J = n.get(A);
    b !== void 0 && it(J.__webglFramebuffer, A, A.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), z !== void 0 && kt(A);
  }
  function Yt(A) {
    const b = A.texture, z = n.get(A), J = n.get(b);
    A.addEventListener("dispose", T);
    const tt = A.textures, Z = A.isWebGLCubeRenderTarget === !0, Et = tt.length > 1;
    if (Et || (J.__webglTexture === void 0 && (J.__webglTexture = i.createTexture()), J.__version = b.version, o.memory.textures++), Z) {
      z.__webglFramebuffer = [];
      for (let at = 0; at < 6; at++)
        if (b.mipmaps && b.mipmaps.length > 0) {
          z.__webglFramebuffer[at] = [];
          for (let gt = 0; gt < b.mipmaps.length; gt++)
            z.__webglFramebuffer[at][gt] = i.createFramebuffer();
        } else
          z.__webglFramebuffer[at] = i.createFramebuffer();
    } else {
      if (b.mipmaps && b.mipmaps.length > 0) {
        z.__webglFramebuffer = [];
        for (let at = 0; at < b.mipmaps.length; at++)
          z.__webglFramebuffer[at] = i.createFramebuffer();
      } else
        z.__webglFramebuffer = i.createFramebuffer();
      if (Et)
        for (let at = 0, gt = tt.length; at < gt; at++) {
          const te = n.get(tt[at]);
          te.__webglTexture === void 0 && (te.__webglTexture = i.createTexture(), o.memory.textures++);
        }
      if (A.samples > 0 && Qt(A) === !1) {
        z.__webglMultisampledFramebuffer = i.createFramebuffer(), z.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, z.__webglMultisampledFramebuffer);
        for (let at = 0; at < tt.length; at++) {
          const gt = tt[at];
          z.__webglColorRenderbuffer[at] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, z.__webglColorRenderbuffer[at]);
          const te = r.convert(gt.format, gt.colorSpace), st = r.convert(gt.type), _t = x(gt.internalFormat, te, st, gt.colorSpace, A.isXRRenderTarget === !0), Nt = Kt(A);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, Nt, _t, A.width, A.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + at, i.RENDERBUFFER, z.__webglColorRenderbuffer[at]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), A.depthBuffer && (z.__webglDepthRenderbuffer = i.createRenderbuffer(), yt(z.__webglDepthRenderbuffer, A, !0)), e.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (Z) {
      e.bindTexture(i.TEXTURE_CUBE_MAP, J.__webglTexture), St(i.TEXTURE_CUBE_MAP, b);
      for (let at = 0; at < 6; at++)
        if (b.mipmaps && b.mipmaps.length > 0)
          for (let gt = 0; gt < b.mipmaps.length; gt++)
            it(z.__webglFramebuffer[at][gt], A, b, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, gt);
        else
          it(z.__webglFramebuffer[at], A, b, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, 0);
      p(b) && m(i.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (Et) {
      for (let at = 0, gt = tt.length; at < gt; at++) {
        const te = tt[at], st = n.get(te);
        e.bindTexture(i.TEXTURE_2D, st.__webglTexture), St(i.TEXTURE_2D, te), it(z.__webglFramebuffer, A, te, i.COLOR_ATTACHMENT0 + at, i.TEXTURE_2D, 0), p(te) && m(i.TEXTURE_2D);
      }
      e.unbindTexture();
    } else {
      let at = i.TEXTURE_2D;
      if ((A.isWebGL3DRenderTarget || A.isWebGLArrayRenderTarget) && (at = A.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(at, J.__webglTexture), St(at, b), b.mipmaps && b.mipmaps.length > 0)
        for (let gt = 0; gt < b.mipmaps.length; gt++)
          it(z.__webglFramebuffer[gt], A, b, i.COLOR_ATTACHMENT0, at, gt);
      else
        it(z.__webglFramebuffer, A, b, i.COLOR_ATTACHMENT0, at, 0);
      p(b) && m(at), e.unbindTexture();
    }
    A.depthBuffer && kt(A);
  }
  function fe(A) {
    const b = A.textures;
    for (let z = 0, J = b.length; z < J; z++) {
      const tt = b[z];
      if (p(tt)) {
        const Z = A.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D, Et = n.get(tt).__webglTexture;
        e.bindTexture(Z, Et), m(Z), e.unbindTexture();
      }
    }
  }
  const Zt = [], D = [];
  function qe(A) {
    if (A.samples > 0) {
      if (Qt(A) === !1) {
        const b = A.textures, z = A.width, J = A.height;
        let tt = i.COLOR_BUFFER_BIT;
        const Z = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Et = n.get(A), at = b.length > 1;
        if (at)
          for (let gt = 0; gt < b.length; gt++)
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + gt, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + gt, i.TEXTURE_2D, null, 0);
        e.bindFramebuffer(i.READ_FRAMEBUFFER, Et.__webglMultisampledFramebuffer), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer);
        for (let gt = 0; gt < b.length; gt++) {
          if (A.resolveDepthBuffer && (A.depthBuffer && (tt |= i.DEPTH_BUFFER_BIT), A.stencilBuffer && A.resolveStencilBuffer && (tt |= i.STENCIL_BUFFER_BIT)), at) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, Et.__webglColorRenderbuffer[gt]);
            const te = n.get(b[gt]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, te, 0);
          }
          i.blitFramebuffer(0, 0, z, J, 0, 0, z, J, tt, i.NEAREST), l === !0 && (Zt.length = 0, D.length = 0, Zt.push(i.COLOR_ATTACHMENT0 + gt), A.depthBuffer && A.resolveDepthBuffer === !1 && (Zt.push(Z), D.push(Z), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, D)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, Zt));
        }
        if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), at)
          for (let gt = 0; gt < b.length; gt++) {
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + gt, i.RENDERBUFFER, Et.__webglColorRenderbuffer[gt]);
            const te = n.get(b[gt]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + gt, i.TEXTURE_2D, te, 0);
          }
        e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglMultisampledFramebuffer);
      } else if (A.depthBuffer && A.resolveDepthBuffer === !1 && l) {
        const b = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [b]);
      }
    }
  }
  function Kt(A) {
    return Math.min(s.maxSamples, A.samples);
  }
  function Qt(A) {
    const b = n.get(A);
    return A.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && b.__useRenderToTexture !== !1;
  }
  function Dt(A) {
    const b = o.render.frame;
    h.get(A) !== b && (h.set(A, b), A.update());
  }
  function _e(A, b) {
    const z = A.colorSpace, J = A.format, tt = A.type;
    return A.isCompressedTexture === !0 || A.isVideoTexture === !0 || z !== Oe && z !== ei && (ne.getTransfer(z) === xe ? (J !== ln || tt !== Gn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", z)), b;
  }
  function Ot(A) {
    return typeof HTMLImageElement < "u" && A instanceof HTMLImageElement ? (c.width = A.naturalWidth || A.width, c.height = A.naturalHeight || A.height) : typeof VideoFrame < "u" && A instanceof VideoFrame ? (c.width = A.displayWidth, c.height = A.displayHeight) : (c.width = A.width, c.height = A.height), c;
  }
  this.allocateTextureUnit = N, this.resetTextureUnits = S, this.setTexture2D = G, this.setTexture2DArray = q, this.setTexture3D = W, this.setTextureCube = et, this.rebindTextures = Lt, this.setupRenderTarget = Yt, this.updateRenderTargetMipmap = fe, this.updateMultisampleRenderTarget = qe, this.setupDepthRenderbuffer = kt, this.setupFrameBufferTexture = it, this.useMultisampledRTT = Qt;
}
function Mv(i, t) {
  function e(n, s = ei) {
    let r;
    const o = ne.getTransfer(s);
    if (n === Gn) return i.UNSIGNED_BYTE;
    if (n === Tl) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Al) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Ld) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Cd) return i.BYTE;
    if (n === Pd) return i.SHORT;
    if (n === qs) return i.UNSIGNED_SHORT;
    if (n === wl) return i.INT;
    if (n === bi) return i.UNSIGNED_INT;
    if (n === _n) return i.FLOAT;
    if (n === or) return i.HALF_FLOAT;
    if (n === Id) return i.ALPHA;
    if (n === Dd) return i.RGB;
    if (n === ln) return i.RGBA;
    if (n === Nd) return i.LUMINANCE;
    if (n === Ud) return i.LUMINANCE_ALPHA;
    if (n === Qi) return i.DEPTH_COMPONENT;
    if (n === cs) return i.DEPTH_STENCIL;
    if (n === Rl) return i.RED;
    if (n === Cl) return i.RED_INTEGER;
    if (n === Od) return i.RG;
    if (n === Pl) return i.RG_INTEGER;
    if (n === Ll) return i.RGBA_INTEGER;
    if (n === Qr || n === to || n === eo || n === no)
      if (o === xe)
        if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
          if (n === Qr) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === to) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === eo) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === no) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
        if (n === Qr) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === to) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === eo) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === no) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === Na || n === Ua || n === Oa || n === Fa)
      if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === Na) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Ua) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Oa) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Fa) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === Ba || n === ka || n === za)
      if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === Ba || n === ka) return o === xe ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === za) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === Ha || n === Ga || n === Va || n === Wa || n === $a || n === Xa || n === ja || n === Ka || n === qa || n === Ya || n === Za || n === Ja || n === Qa || n === tl)
      if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === Ha) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ga) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Va) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Wa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === $a) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Xa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === ja) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Ka) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === qa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === Ya) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === Za) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Ja) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Qa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === tl) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === io || n === el || n === nl)
      if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === io) return o === xe ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === el) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === nl) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === Fd || n === il || n === sl || n === rl)
      if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === io) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === il) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === sl) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === rl) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === ls ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
class Sv extends ze {
  constructor(t = []) {
    super(), this.isArrayCamera = !0, this.cameras = t;
  }
}
class K extends ye {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const bv = { type: "move" };
class oa {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new K(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new K(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new P(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new P()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new K(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new P(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new P()), this._grip;
  }
  dispatchEvent(t) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(t), this._grip !== null && this._grip.dispatchEvent(t), this._hand !== null && this._hand.dispatchEvent(t), this;
  }
  connect(t) {
    if (t && t.hand) {
      const e = this._hand;
      if (e)
        for (const n of t.hand.values())
          this._getHandJoint(e, n);
    }
    return this.dispatchEvent({ type: "connected", data: t }), this;
  }
  disconnect(t) {
    return this.dispatchEvent({ type: "disconnected", data: t }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(t, e, n) {
    let s = null, r = null, o = null;
    const a = this._targetRay, l = this._grip, c = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (c && t.hand) {
        o = !0;
        for (const v of t.hand.values()) {
          const p = e.getJointPose(v, n), m = this._getHandJoint(c, v);
          p !== null && (m.matrix.fromArray(p.transform.matrix), m.matrix.decompose(m.position, m.rotation, m.scale), m.matrixWorldNeedsUpdate = !0, m.jointRadius = p.radius), m.visible = p !== null;
        }
        const h = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], u = h.position.distanceTo(d.position), f = 0.02, g = 5e-3;
        c.inputState.pinching && u > f + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: t.handedness,
          target: this
        })) : !c.inputState.pinching && u <= f - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: t.handedness,
          target: this
        }));
      } else
        l !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1));
      a !== null && (s = e.getPose(t.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (a.matrix.fromArray(s.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(s.linearVelocity)) : a.hasLinearVelocity = !1, s.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(s.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent(bv)));
    }
    return a !== null && (a.visible = s !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = o !== null), this;
  }
  // private method
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new K();
      n.matrixAutoUpdate = !1, n.visible = !1, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
const Ev = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, wv = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class Tv {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(t, e, n) {
    if (this.texture === null) {
      const s = new Ce(), r = t.properties.get(s);
      r.__webglTexture = e.texture, (e.depthNear != n.depthNear || e.depthFar != n.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = s;
    }
  }
  getMesh(t) {
    if (this.texture !== null && this.mesh === null) {
      const e = t.cameras[0].viewport, n = new ai({
        vertexShader: Ev,
        fragmentShader: wv,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: e.z },
          depthHeight: { value: e.w }
        }
      });
      this.mesh = new ge(new ar(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}
class Av extends Ti {
  constructor(t, e) {
    super();
    const n = this;
    let s = null, r = 1, o = null, a = "local-floor", l = 1, c = null, h = null, d = null, u = null, f = null, g = null;
    const v = new Tv(), p = e.getContextAttributes();
    let m = null, x = null;
    const _ = [], M = [], L = new nt();
    let T = null;
    const w = new ze();
    w.layers.enable(1), w.viewport = new re();
    const R = new ze();
    R.layers.enable(2), R.viewport = new re();
    const F = [w, R], y = new Sv();
    y.layers.enable(1), y.layers.enable(2);
    let S = null, N = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(Y) {
      let it = _[Y];
      return it === void 0 && (it = new oa(), _[Y] = it), it.getTargetRaySpace();
    }, this.getControllerGrip = function(Y) {
      let it = _[Y];
      return it === void 0 && (it = new oa(), _[Y] = it), it.getGripSpace();
    }, this.getHand = function(Y) {
      let it = _[Y];
      return it === void 0 && (it = new oa(), _[Y] = it), it.getHandSpace();
    };
    function k(Y) {
      const it = M.indexOf(Y.inputSource);
      if (it === -1)
        return;
      const yt = _[it];
      yt !== void 0 && (yt.update(Y.inputSource, Y.frame, c || o), yt.dispatchEvent({ type: Y.type, data: Y.inputSource }));
    }
    function G() {
      s.removeEventListener("select", k), s.removeEventListener("selectstart", k), s.removeEventListener("selectend", k), s.removeEventListener("squeeze", k), s.removeEventListener("squeezestart", k), s.removeEventListener("squeezeend", k), s.removeEventListener("end", G), s.removeEventListener("inputsourceschange", q);
      for (let Y = 0; Y < _.length; Y++) {
        const it = M[Y];
        it !== null && (M[Y] = null, _[Y].disconnect(it));
      }
      S = null, N = null, v.reset(), t.setRenderTarget(m), f = null, u = null, d = null, s = null, x = null, le.stop(), n.isPresenting = !1, t.setPixelRatio(T), t.setSize(L.width, L.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(Y) {
      r = Y, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(Y) {
      a = Y, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || o;
    }, this.setReferenceSpace = function(Y) {
      c = Y;
    }, this.getBaseLayer = function() {
      return u !== null ? u : f;
    }, this.getBinding = function() {
      return d;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return s;
    }, this.setSession = async function(Y) {
      if (s = Y, s !== null) {
        if (m = t.getRenderTarget(), s.addEventListener("select", k), s.addEventListener("selectstart", k), s.addEventListener("selectend", k), s.addEventListener("squeeze", k), s.addEventListener("squeezestart", k), s.addEventListener("squeezeend", k), s.addEventListener("end", G), s.addEventListener("inputsourceschange", q), p.xrCompatible !== !0 && await e.makeXRCompatible(), T = t.getPixelRatio(), t.getSize(L), s.renderState.layers === void 0) {
          const it = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(s, e, it), s.updateRenderState({ baseLayer: f }), t.setPixelRatio(1), t.setSize(f.framebufferWidth, f.framebufferHeight, !1), x = new Ei(
            f.framebufferWidth,
            f.framebufferHeight,
            {
              format: ln,
              type: Gn,
              colorSpace: t.outputColorSpace,
              stencilBuffer: p.stencil
            }
          );
        } else {
          let it = null, yt = null, mt = null;
          p.depth && (mt = p.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, it = p.stencil ? cs : Qi, yt = p.stencil ? ls : bi);
          const kt = {
            colorFormat: e.RGBA8,
            depthFormat: mt,
            scaleFactor: r
          };
          d = new XRWebGLBinding(s, e), u = d.createProjectionLayer(kt), s.updateRenderState({ layers: [u] }), t.setPixelRatio(1), t.setSize(u.textureWidth, u.textureHeight, !1), x = new Ei(
            u.textureWidth,
            u.textureHeight,
            {
              format: ln,
              type: Gn,
              depthTexture: new Zd(u.textureWidth, u.textureHeight, yt, void 0, void 0, void 0, void 0, void 0, void 0, it),
              stencilBuffer: p.stencil,
              colorSpace: t.outputColorSpace,
              samples: p.antialias ? 4 : 0,
              resolveDepthBuffer: u.ignoreDepthValues === !1
            }
          );
        }
        x.isXRRenderTarget = !0, this.setFoveation(l), c = null, o = await s.requestReferenceSpace(a), le.setContext(s), le.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (s !== null)
        return s.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return v.getDepthTexture();
    };
    function q(Y) {
      for (let it = 0; it < Y.removed.length; it++) {
        const yt = Y.removed[it], mt = M.indexOf(yt);
        mt >= 0 && (M[mt] = null, _[mt].disconnect(yt));
      }
      for (let it = 0; it < Y.added.length; it++) {
        const yt = Y.added[it];
        let mt = M.indexOf(yt);
        if (mt === -1) {
          for (let Lt = 0; Lt < _.length; Lt++)
            if (Lt >= M.length) {
              M.push(yt), mt = Lt;
              break;
            } else if (M[Lt] === null) {
              M[Lt] = yt, mt = Lt;
              break;
            }
          if (mt === -1) break;
        }
        const kt = _[mt];
        kt && kt.connect(yt);
      }
    }
    const W = new P(), et = new P();
    function $(Y, it, yt) {
      W.setFromMatrixPosition(it.matrixWorld), et.setFromMatrixPosition(yt.matrixWorld);
      const mt = W.distanceTo(et), kt = it.projectionMatrix.elements, Lt = yt.projectionMatrix.elements, Yt = kt[14] / (kt[10] - 1), fe = kt[14] / (kt[10] + 1), Zt = (kt[9] + 1) / kt[5], D = (kt[9] - 1) / kt[5], qe = (kt[8] - 1) / kt[0], Kt = (Lt[8] + 1) / Lt[0], Qt = Yt * qe, Dt = Yt * Kt, _e = mt / (-qe + Kt), Ot = _e * -qe;
      if (it.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale), Y.translateX(Ot), Y.translateZ(_e), Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale), Y.matrixWorldInverse.copy(Y.matrixWorld).invert(), kt[10] === -1)
        Y.projectionMatrix.copy(it.projectionMatrix), Y.projectionMatrixInverse.copy(it.projectionMatrixInverse);
      else {
        const A = Yt + _e, b = fe + _e, z = Qt - Ot, J = Dt + (mt - Ot), tt = Zt * fe / b * A, Z = D * fe / b * A;
        Y.projectionMatrix.makePerspective(z, J, tt, Z, A, b), Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert();
      }
    }
    function lt(Y, it) {
      it === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(it.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert();
    }
    this.updateCamera = function(Y) {
      if (s === null) return;
      let it = Y.near, yt = Y.far;
      v.texture !== null && (v.depthNear > 0 && (it = v.depthNear), v.depthFar > 0 && (yt = v.depthFar)), y.near = R.near = w.near = it, y.far = R.far = w.far = yt, (S !== y.near || N !== y.far) && (s.updateRenderState({
        depthNear: y.near,
        depthFar: y.far
      }), S = y.near, N = y.far);
      const mt = Y.parent, kt = y.cameras;
      lt(y, mt);
      for (let Lt = 0; Lt < kt.length; Lt++)
        lt(kt[Lt], mt);
      kt.length === 2 ? $(y, w, R) : y.projectionMatrix.copy(w.projectionMatrix), ct(Y, y, mt);
    };
    function ct(Y, it, yt) {
      yt === null ? Y.matrix.copy(it.matrixWorld) : (Y.matrix.copy(yt.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(it.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(!0), Y.projectionMatrix.copy(it.projectionMatrix), Y.projectionMatrixInverse.copy(it.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = hs * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1);
    }
    this.getCamera = function() {
      return y;
    }, this.getFoveation = function() {
      if (!(u === null && f === null))
        return l;
    }, this.setFoveation = function(Y) {
      l = Y, u !== null && (u.fixedFoveation = Y), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = Y);
    }, this.hasDepthSensing = function() {
      return v.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return v.getMesh(y);
    };
    let St = null;
    function ie(Y, it) {
      if (h = it.getViewerPose(c || o), g = it, h !== null) {
        const yt = h.views;
        f !== null && (t.setRenderTargetFramebuffer(x, f.framebuffer), t.setRenderTarget(x));
        let mt = !1;
        yt.length !== y.cameras.length && (y.cameras.length = 0, mt = !0);
        for (let Lt = 0; Lt < yt.length; Lt++) {
          const Yt = yt[Lt];
          let fe = null;
          if (f !== null)
            fe = f.getViewport(Yt);
          else {
            const D = d.getViewSubImage(u, Yt);
            fe = D.viewport, Lt === 0 && (t.setRenderTargetTextures(
              x,
              D.colorTexture,
              u.ignoreDepthValues ? void 0 : D.depthStencilTexture
            ), t.setRenderTarget(x));
          }
          let Zt = F[Lt];
          Zt === void 0 && (Zt = new ze(), Zt.layers.enable(Lt), Zt.viewport = new re(), F[Lt] = Zt), Zt.matrix.fromArray(Yt.transform.matrix), Zt.matrix.decompose(Zt.position, Zt.quaternion, Zt.scale), Zt.projectionMatrix.fromArray(Yt.projectionMatrix), Zt.projectionMatrixInverse.copy(Zt.projectionMatrix).invert(), Zt.viewport.set(fe.x, fe.y, fe.width, fe.height), Lt === 0 && (y.matrix.copy(Zt.matrix), y.matrix.decompose(y.position, y.quaternion, y.scale)), mt === !0 && y.cameras.push(Zt);
        }
        const kt = s.enabledFeatures;
        if (kt && kt.includes("depth-sensing")) {
          const Lt = d.getDepthInformation(yt[0]);
          Lt && Lt.isValid && Lt.texture && v.init(t, Lt, s.renderState);
        }
      }
      for (let yt = 0; yt < _.length; yt++) {
        const mt = M[yt], kt = _[yt];
        mt !== null && kt !== void 0 && kt.update(mt, it, c || o);
      }
      St && St(Y, it), it.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: it }), g = null;
    }
    const le = new Yd();
    le.setAnimationLoop(ie), this.setAnimationLoop = function(Y) {
      St = Y;
    }, this.dispose = function() {
    };
  }
}
const gi = /* @__PURE__ */ new bn(), Rv = /* @__PURE__ */ new Ft();
function Cv(i, t) {
  function e(p, m) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), m.value.copy(p.matrix);
  }
  function n(p, m) {
    m.color.getRGB(p.fogColor.value, jd(i)), m.isFog ? (p.fogNear.value = m.near, p.fogFar.value = m.far) : m.isFogExp2 && (p.fogDensity.value = m.density);
  }
  function s(p, m, x, _, M) {
    m.isMeshBasicMaterial || m.isMeshLambertMaterial ? r(p, m) : m.isMeshToonMaterial ? (r(p, m), d(p, m)) : m.isMeshPhongMaterial ? (r(p, m), h(p, m)) : m.isMeshStandardMaterial ? (r(p, m), u(p, m), m.isMeshPhysicalMaterial && f(p, m, M)) : m.isMeshMatcapMaterial ? (r(p, m), g(p, m)) : m.isMeshDepthMaterial ? r(p, m) : m.isMeshDistanceMaterial ? (r(p, m), v(p, m)) : m.isMeshNormalMaterial ? r(p, m) : m.isLineBasicMaterial ? (o(p, m), m.isLineDashedMaterial && a(p, m)) : m.isPointsMaterial ? l(p, m, x, _) : m.isSpriteMaterial ? c(p, m) : m.isShadowMaterial ? (p.color.value.copy(m.color), p.opacity.value = m.opacity) : m.isShaderMaterial && (m.uniformsNeedUpdate = !1);
  }
  function r(p, m) {
    p.opacity.value = m.opacity, m.color && p.diffuse.value.copy(m.color), m.emissive && p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity), m.map && (p.map.value = m.map, e(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, e(m.alphaMap, p.alphaMapTransform)), m.bumpMap && (p.bumpMap.value = m.bumpMap, e(m.bumpMap, p.bumpMapTransform), p.bumpScale.value = m.bumpScale, m.side === je && (p.bumpScale.value *= -1)), m.normalMap && (p.normalMap.value = m.normalMap, e(m.normalMap, p.normalMapTransform), p.normalScale.value.copy(m.normalScale), m.side === je && p.normalScale.value.negate()), m.displacementMap && (p.displacementMap.value = m.displacementMap, e(m.displacementMap, p.displacementMapTransform), p.displacementScale.value = m.displacementScale, p.displacementBias.value = m.displacementBias), m.emissiveMap && (p.emissiveMap.value = m.emissiveMap, e(m.emissiveMap, p.emissiveMapTransform)), m.specularMap && (p.specularMap.value = m.specularMap, e(m.specularMap, p.specularMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
    const x = t.get(m), _ = x.envMap, M = x.envMapRotation;
    _ && (p.envMap.value = _, gi.copy(M), gi.x *= -1, gi.y *= -1, gi.z *= -1, _.isCubeTexture && _.isRenderTargetTexture === !1 && (gi.y *= -1, gi.z *= -1), p.envMapRotation.value.setFromMatrix4(Rv.makeRotationFromEuler(gi)), p.flipEnvMap.value = _.isCubeTexture && _.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = m.reflectivity, p.ior.value = m.ior, p.refractionRatio.value = m.refractionRatio), m.lightMap && (p.lightMap.value = m.lightMap, p.lightMapIntensity.value = m.lightMapIntensity, e(m.lightMap, p.lightMapTransform)), m.aoMap && (p.aoMap.value = m.aoMap, p.aoMapIntensity.value = m.aoMapIntensity, e(m.aoMap, p.aoMapTransform));
  }
  function o(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, m.map && (p.map.value = m.map, e(m.map, p.mapTransform));
  }
  function a(p, m) {
    p.dashSize.value = m.dashSize, p.totalSize.value = m.dashSize + m.gapSize, p.scale.value = m.scale;
  }
  function l(p, m, x, _) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.size.value = m.size * x, p.scale.value = _ * 0.5, m.map && (p.map.value = m.map, e(m.map, p.uvTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, e(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function c(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.rotation.value = m.rotation, m.map && (p.map.value = m.map, e(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, e(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function h(p, m) {
    p.specular.value.copy(m.specular), p.shininess.value = Math.max(m.shininess, 1e-4);
  }
  function d(p, m) {
    m.gradientMap && (p.gradientMap.value = m.gradientMap);
  }
  function u(p, m) {
    p.metalness.value = m.metalness, m.metalnessMap && (p.metalnessMap.value = m.metalnessMap, e(m.metalnessMap, p.metalnessMapTransform)), p.roughness.value = m.roughness, m.roughnessMap && (p.roughnessMap.value = m.roughnessMap, e(m.roughnessMap, p.roughnessMapTransform)), m.envMap && (p.envMapIntensity.value = m.envMapIntensity);
  }
  function f(p, m, x) {
    p.ior.value = m.ior, m.sheen > 0 && (p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen), p.sheenRoughness.value = m.sheenRoughness, m.sheenColorMap && (p.sheenColorMap.value = m.sheenColorMap, e(m.sheenColorMap, p.sheenColorMapTransform)), m.sheenRoughnessMap && (p.sheenRoughnessMap.value = m.sheenRoughnessMap, e(m.sheenRoughnessMap, p.sheenRoughnessMapTransform))), m.clearcoat > 0 && (p.clearcoat.value = m.clearcoat, p.clearcoatRoughness.value = m.clearcoatRoughness, m.clearcoatMap && (p.clearcoatMap.value = m.clearcoatMap, e(m.clearcoatMap, p.clearcoatMapTransform)), m.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = m.clearcoatRoughnessMap, e(m.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), m.clearcoatNormalMap && (p.clearcoatNormalMap.value = m.clearcoatNormalMap, e(m.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale), m.side === je && p.clearcoatNormalScale.value.negate())), m.dispersion > 0 && (p.dispersion.value = m.dispersion), m.iridescence > 0 && (p.iridescence.value = m.iridescence, p.iridescenceIOR.value = m.iridescenceIOR, p.iridescenceThicknessMinimum.value = m.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = m.iridescenceThicknessRange[1], m.iridescenceMap && (p.iridescenceMap.value = m.iridescenceMap, e(m.iridescenceMap, p.iridescenceMapTransform)), m.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = m.iridescenceThicknessMap, e(m.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), m.transmission > 0 && (p.transmission.value = m.transmission, p.transmissionSamplerMap.value = x.texture, p.transmissionSamplerSize.value.set(x.width, x.height), m.transmissionMap && (p.transmissionMap.value = m.transmissionMap, e(m.transmissionMap, p.transmissionMapTransform)), p.thickness.value = m.thickness, m.thicknessMap && (p.thicknessMap.value = m.thicknessMap, e(m.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = m.attenuationDistance, p.attenuationColor.value.copy(m.attenuationColor)), m.anisotropy > 0 && (p.anisotropyVector.value.set(m.anisotropy * Math.cos(m.anisotropyRotation), m.anisotropy * Math.sin(m.anisotropyRotation)), m.anisotropyMap && (p.anisotropyMap.value = m.anisotropyMap, e(m.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = m.specularIntensity, p.specularColor.value.copy(m.specularColor), m.specularColorMap && (p.specularColorMap.value = m.specularColorMap, e(m.specularColorMap, p.specularColorMapTransform)), m.specularIntensityMap && (p.specularIntensityMap.value = m.specularIntensityMap, e(m.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function g(p, m) {
    m.matcap && (p.matcap.value = m.matcap);
  }
  function v(p, m) {
    const x = t.get(m).light;
    p.referencePosition.value.setFromMatrixPosition(x.matrixWorld), p.nearDistance.value = x.shadow.camera.near, p.farDistance.value = x.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: s
  };
}
function Pv(i, t, e, n) {
  let s = {}, r = {}, o = [];
  const a = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(x, _) {
    const M = _.program;
    n.uniformBlockBinding(x, M);
  }
  function c(x, _) {
    let M = s[x.id];
    M === void 0 && (g(x), M = h(x), s[x.id] = M, x.addEventListener("dispose", p));
    const L = _.program;
    n.updateUBOMapping(x, L);
    const T = t.render.frame;
    r[x.id] !== T && (u(x), r[x.id] = T);
  }
  function h(x) {
    const _ = d();
    x.__bindingPointIndex = _;
    const M = i.createBuffer(), L = x.__size, T = x.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, M), i.bufferData(i.UNIFORM_BUFFER, L, T), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, _, M), M;
  }
  function d() {
    for (let x = 0; x < a; x++)
      if (o.indexOf(x) === -1)
        return o.push(x), x;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function u(x) {
    const _ = s[x.id], M = x.uniforms, L = x.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, _);
    for (let T = 0, w = M.length; T < w; T++) {
      const R = Array.isArray(M[T]) ? M[T] : [M[T]];
      for (let F = 0, y = R.length; F < y; F++) {
        const S = R[F];
        if (f(S, T, F, L) === !0) {
          const N = S.__offset, k = Array.isArray(S.value) ? S.value : [S.value];
          let G = 0;
          for (let q = 0; q < k.length; q++) {
            const W = k[q], et = v(W);
            typeof W == "number" || typeof W == "boolean" ? (S.__data[0] = W, i.bufferSubData(i.UNIFORM_BUFFER, N + G, S.__data)) : W.isMatrix3 ? (S.__data[0] = W.elements[0], S.__data[1] = W.elements[1], S.__data[2] = W.elements[2], S.__data[3] = 0, S.__data[4] = W.elements[3], S.__data[5] = W.elements[4], S.__data[6] = W.elements[5], S.__data[7] = 0, S.__data[8] = W.elements[6], S.__data[9] = W.elements[7], S.__data[10] = W.elements[8], S.__data[11] = 0) : (W.toArray(S.__data, G), G += et.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, N, S.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function f(x, _, M, L) {
    const T = x.value, w = _ + "_" + M;
    if (L[w] === void 0)
      return typeof T == "number" || typeof T == "boolean" ? L[w] = T : L[w] = T.clone(), !0;
    {
      const R = L[w];
      if (typeof T == "number" || typeof T == "boolean") {
        if (R !== T)
          return L[w] = T, !0;
      } else if (R.equals(T) === !1)
        return R.copy(T), !0;
    }
    return !1;
  }
  function g(x) {
    const _ = x.uniforms;
    let M = 0;
    const L = 16;
    for (let w = 0, R = _.length; w < R; w++) {
      const F = Array.isArray(_[w]) ? _[w] : [_[w]];
      for (let y = 0, S = F.length; y < S; y++) {
        const N = F[y], k = Array.isArray(N.value) ? N.value : [N.value];
        for (let G = 0, q = k.length; G < q; G++) {
          const W = k[G], et = v(W), $ = M % L, lt = $ % et.boundary, ct = $ + lt;
          M += lt, ct !== 0 && L - ct < et.storage && (M += L - ct), N.__data = new Float32Array(et.storage / Float32Array.BYTES_PER_ELEMENT), N.__offset = M, M += et.storage;
        }
      }
    }
    const T = M % L;
    return T > 0 && (M += L - T), x.__size = M, x.__cache = {}, this;
  }
  function v(x) {
    const _ = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof x == "number" || typeof x == "boolean" ? (_.boundary = 4, _.storage = 4) : x.isVector2 ? (_.boundary = 8, _.storage = 8) : x.isVector3 || x.isColor ? (_.boundary = 16, _.storage = 12) : x.isVector4 ? (_.boundary = 16, _.storage = 16) : x.isMatrix3 ? (_.boundary = 48, _.storage = 48) : x.isMatrix4 ? (_.boundary = 64, _.storage = 64) : x.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", x), _;
  }
  function p(x) {
    const _ = x.target;
    _.removeEventListener("dispose", p);
    const M = o.indexOf(_.__bindingPointIndex);
    o.splice(M, 1), i.deleteBuffer(s[_.id]), delete s[_.id], delete r[_.id];
  }
  function m() {
    for (const x in s)
      i.deleteBuffer(s[x]);
    o = [], s = {}, r = {};
  }
  return {
    bind: l,
    update: c,
    dispose: m
  };
}
class nu {
  constructor(t = {}) {
    const {
      canvas: e = vp(),
      context: n = null,
      depth: s = !0,
      stencil: r = !1,
      alpha: o = !1,
      antialias: a = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: d = !1
    } = t;
    this.isWebGLRenderer = !0;
    let u;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      u = n.getContextAttributes().alpha;
    } else
      u = o;
    const f = new Uint32Array(4), g = new Int32Array(4);
    let v = null, p = null;
    const m = [], x = [];
    this.domElement = e, this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: !0,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = ke, this.toneMapping = ri, this.toneMappingExposure = 1;
    const _ = this;
    let M = !1, L = 0, T = 0, w = null, R = -1, F = null;
    const y = new re(), S = new re();
    let N = null;
    const k = new Ct(0);
    let G = 0, q = e.width, W = e.height, et = 1, $ = null, lt = null;
    const ct = new re(0, 0, q, W), St = new re(0, 0, q, W);
    let ie = !1;
    const le = new Ul();
    let Y = !1, it = !1;
    const yt = new Ft(), mt = new Ft(), kt = new P(), Lt = new re(), Yt = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let fe = !1;
    function Zt() {
      return w === null ? et : 1;
    }
    let D = n;
    function qe(E, O) {
      return e.getContext(E, O);
    }
    try {
      const E = {
        alpha: !0,
        depth: s,
        stencil: r,
        antialias: a,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: d
      };
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${El}`), e.addEventListener("webglcontextlost", Q, !1), e.addEventListener("webglcontextrestored", ht, !1), e.addEventListener("webglcontextcreationerror", ft, !1), D === null) {
        const O = "webgl2";
        if (D = qe(O, E), D === null)
          throw qe(O) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (E) {
      throw console.error("THREE.WebGLRenderer: " + E.message), E;
    }
    let Kt, Qt, Dt, _e, Ot, A, b, z, J, tt, Z, Et, at, gt, te, st, _t, Nt, Ut, vt, qt, zt, me, U;
    function ut() {
      Kt = new Og(D), Kt.init(), zt = new Mv(D, Kt), Qt = new Pg(D, Kt, t, zt), Dt = new vv(D), Qt.reverseDepthBuffer && Dt.buffers.depth.setReversed(!0), _e = new kg(D), Ot = new iv(), A = new yv(D, Kt, Dt, Ot, Qt, zt, _e), b = new Ig(_), z = new Ug(_), J = new Xp(D), me = new Rg(D, J), tt = new Fg(D, J, _e, me), Z = new Hg(D, tt, J, _e), Ut = new zg(D, Qt, A), st = new Lg(Ot), Et = new nv(_, b, z, Kt, Qt, me, st), at = new Cv(_, Ot), gt = new rv(), te = new dv(Kt), Nt = new Ag(_, b, z, Dt, Z, u, l), _t = new gv(_, Z, Qt), U = new Pv(D, _e, Qt, Dt), vt = new Cg(D, Kt, _e), qt = new Bg(D, Kt, _e), _e.programs = Et.programs, _.capabilities = Qt, _.extensions = Kt, _.properties = Ot, _.renderLists = gt, _.shadowMap = _t, _.state = Dt, _.info = _e;
    }
    ut();
    const X = new Av(_, D);
    this.xr = X, this.getContext = function() {
      return D;
    }, this.getContextAttributes = function() {
      return D.getContextAttributes();
    }, this.forceContextLoss = function() {
      const E = Kt.get("WEBGL_lose_context");
      E && E.loseContext();
    }, this.forceContextRestore = function() {
      const E = Kt.get("WEBGL_lose_context");
      E && E.restoreContext();
    }, this.getPixelRatio = function() {
      return et;
    }, this.setPixelRatio = function(E) {
      E !== void 0 && (et = E, this.setSize(q, W, !1));
    }, this.getSize = function(E) {
      return E.set(q, W);
    }, this.setSize = function(E, O, H = !0) {
      if (X.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      q = E, W = O, e.width = Math.floor(E * et), e.height = Math.floor(O * et), H === !0 && (e.style.width = E + "px", e.style.height = O + "px"), this.setViewport(0, 0, E, O);
    }, this.getDrawingBufferSize = function(E) {
      return E.set(q * et, W * et).floor();
    }, this.setDrawingBufferSize = function(E, O, H) {
      q = E, W = O, et = H, e.width = Math.floor(E * H), e.height = Math.floor(O * H), this.setViewport(0, 0, E, O);
    }, this.getCurrentViewport = function(E) {
      return E.copy(y);
    }, this.getViewport = function(E) {
      return E.copy(ct);
    }, this.setViewport = function(E, O, H, V) {
      E.isVector4 ? ct.set(E.x, E.y, E.z, E.w) : ct.set(E, O, H, V), Dt.viewport(y.copy(ct).multiplyScalar(et).round());
    }, this.getScissor = function(E) {
      return E.copy(St);
    }, this.setScissor = function(E, O, H, V) {
      E.isVector4 ? St.set(E.x, E.y, E.z, E.w) : St.set(E, O, H, V), Dt.scissor(S.copy(St).multiplyScalar(et).round());
    }, this.getScissorTest = function() {
      return ie;
    }, this.setScissorTest = function(E) {
      Dt.setScissorTest(ie = E);
    }, this.setOpaqueSort = function(E) {
      $ = E;
    }, this.setTransparentSort = function(E) {
      lt = E;
    }, this.getClearColor = function(E) {
      return E.copy(Nt.getClearColor());
    }, this.setClearColor = function() {
      Nt.setClearColor.apply(Nt, arguments);
    }, this.getClearAlpha = function() {
      return Nt.getClearAlpha();
    }, this.setClearAlpha = function() {
      Nt.setClearAlpha.apply(Nt, arguments);
    }, this.clear = function(E = !0, O = !0, H = !0) {
      let V = 0;
      if (E) {
        let B = !1;
        if (w !== null) {
          const rt = w.texture.format;
          B = rt === Ll || rt === Pl || rt === Cl;
        }
        if (B) {
          const rt = w.texture.type, dt = rt === Gn || rt === bi || rt === qs || rt === ls || rt === Tl || rt === Al, xt = Nt.getClearColor(), Mt = Nt.getClearAlpha(), Pt = xt.r, It = xt.g, wt = xt.b;
          dt ? (f[0] = Pt, f[1] = It, f[2] = wt, f[3] = Mt, D.clearBufferuiv(D.COLOR, 0, f)) : (g[0] = Pt, g[1] = It, g[2] = wt, g[3] = Mt, D.clearBufferiv(D.COLOR, 0, g));
        } else
          V |= D.COLOR_BUFFER_BIT;
      }
      O && (V |= D.DEPTH_BUFFER_BIT, D.clearDepth(this.capabilities.reverseDepthBuffer ? 0 : 1)), H && (V |= D.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), D.clear(V);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", Q, !1), e.removeEventListener("webglcontextrestored", ht, !1), e.removeEventListener("webglcontextcreationerror", ft, !1), gt.dispose(), te.dispose(), Ot.dispose(), b.dispose(), z.dispose(), Z.dispose(), me.dispose(), U.dispose(), Et.dispose(), X.dispose(), X.removeEventListener("sessionstart", Ql), X.removeEventListener("sessionend", tc), ci.stop();
    };
    function Q(E) {
      E.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), M = !0;
    }
    function ht() {
      console.log("THREE.WebGLRenderer: Context Restored."), M = !1;
      const E = _e.autoReset, O = _t.enabled, H = _t.autoUpdate, V = _t.needsUpdate, B = _t.type;
      ut(), _e.autoReset = E, _t.enabled = O, _t.autoUpdate = H, _t.needsUpdate = V, _t.type = B;
    }
    function ft(E) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", E.statusMessage);
    }
    function Jt(E) {
      const O = E.target;
      O.removeEventListener("dispose", Jt), Ee(O);
    }
    function Ee(E) {
      We(E), Ot.remove(E);
    }
    function We(E) {
      const O = Ot.get(E).programs;
      O !== void 0 && (O.forEach(function(H) {
        Et.releaseProgram(H);
      }), E.isShaderMaterial && Et.releaseShaderCache(E));
    }
    this.renderBufferDirect = function(E, O, H, V, B, rt) {
      O === null && (O = Yt);
      const dt = B.isMesh && B.matrixWorld.determinant() < 0, xt = Fu(E, O, H, V, B);
      Dt.setMaterial(V, dt);
      let Mt = H.index, Pt = 1;
      if (V.wireframe === !0) {
        if (Mt = tt.getWireframeAttribute(H), Mt === void 0) return;
        Pt = 2;
      }
      const It = H.drawRange, wt = H.attributes.position;
      let ce = It.start * Pt, ve = (It.start + It.count) * Pt;
      rt !== null && (ce = Math.max(ce, rt.start * Pt), ve = Math.min(ve, (rt.start + rt.count) * Pt)), Mt !== null ? (ce = Math.max(ce, 0), ve = Math.min(ve, Mt.count)) : wt != null && (ce = Math.max(ce, 0), ve = Math.min(ve, wt.count));
      const Se = ve - ce;
      if (Se < 0 || Se === 1 / 0) return;
      me.setup(B, V, xt, H, Mt);
      let Ye, oe = vt;
      if (Mt !== null && (Ye = J.get(Mt), oe = qt, oe.setIndex(Ye)), B.isMesh)
        V.wireframe === !0 ? (Dt.setLineWidth(V.wireframeLinewidth * Zt()), oe.setMode(D.LINES)) : oe.setMode(D.TRIANGLES);
      else if (B.isLine) {
        let Tt = V.linewidth;
        Tt === void 0 && (Tt = 1), Dt.setLineWidth(Tt * Zt()), B.isLineSegments ? oe.setMode(D.LINES) : B.isLineLoop ? oe.setMode(D.LINE_LOOP) : oe.setMode(D.LINE_STRIP);
      } else B.isPoints ? oe.setMode(D.POINTS) : B.isSprite && oe.setMode(D.TRIANGLES);
      if (B.isBatchedMesh)
        if (B._multiDrawInstances !== null)
          oe.renderMultiDrawInstances(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount, B._multiDrawInstances);
        else if (Kt.get("WEBGL_multi_draw"))
          oe.renderMultiDraw(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount);
        else {
          const Tt = B._multiDrawStarts, Ne = B._multiDrawCounts, ae = B._multiDrawCount, hn = Mt ? J.get(Mt).bytesPerElement : 1, Ai = Ot.get(V).currentProgram.getUniforms();
          for (let Ze = 0; Ze < ae; Ze++)
            Ai.setValue(D, "_gl_DrawID", Ze), oe.render(Tt[Ze] / hn, Ne[Ze]);
        }
      else if (B.isInstancedMesh)
        oe.renderInstances(ce, Se, B.count);
      else if (H.isInstancedBufferGeometry) {
        const Tt = H._maxInstanceCount !== void 0 ? H._maxInstanceCount : 1 / 0, Ne = Math.min(H.instanceCount, Tt);
        oe.renderInstances(ce, Se, Ne);
      } else
        oe.render(ce, Se);
    };
    function se(E, O, H) {
      E.transparent === !0 && E.side === on && E.forceSinglePass === !1 ? (E.side = je, E.needsUpdate = !0, ur(E, O, H), E.side = Hn, E.needsUpdate = !0, ur(E, O, H), E.side = on) : ur(E, O, H);
    }
    this.compile = function(E, O, H = null) {
      H === null && (H = E), p = te.get(H), p.init(O), x.push(p), H.traverseVisible(function(B) {
        B.isLight && B.layers.test(O.layers) && (p.pushLight(B), B.castShadow && p.pushShadow(B));
      }), E !== H && E.traverseVisible(function(B) {
        B.isLight && B.layers.test(O.layers) && (p.pushLight(B), B.castShadow && p.pushShadow(B));
      }), p.setupLights();
      const V = /* @__PURE__ */ new Set();
      return E.traverse(function(B) {
        if (!(B.isMesh || B.isPoints || B.isLine || B.isSprite))
          return;
        const rt = B.material;
        if (rt)
          if (Array.isArray(rt))
            for (let dt = 0; dt < rt.length; dt++) {
              const xt = rt[dt];
              se(xt, H, B), V.add(xt);
            }
          else
            se(rt, H, B), V.add(rt);
      }), x.pop(), p = null, V;
    }, this.compileAsync = function(E, O, H = null) {
      const V = this.compile(E, O, H);
      return new Promise((B) => {
        function rt() {
          if (V.forEach(function(dt) {
            Ot.get(dt).currentProgram.isReady() && V.delete(dt);
          }), V.size === 0) {
            B(E);
            return;
          }
          setTimeout(rt, 10);
        }
        Kt.get("KHR_parallel_shader_compile") !== null ? rt() : setTimeout(rt, 10);
      });
    };
    let $e = null;
    function Rn(E) {
      $e && $e(E);
    }
    function Ql() {
      ci.stop();
    }
    function tc() {
      ci.start();
    }
    const ci = new Yd();
    ci.setAnimationLoop(Rn), typeof self < "u" && ci.setContext(self), this.setAnimationLoop = function(E) {
      $e = E, X.setAnimationLoop(E), E === null ? ci.stop() : ci.start();
    }, X.addEventListener("sessionstart", Ql), X.addEventListener("sessionend", tc), this.render = function(E, O) {
      if (O !== void 0 && O.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (M === !0) return;
      if (E.matrixWorldAutoUpdate === !0 && E.updateMatrixWorld(), O.parent === null && O.matrixWorldAutoUpdate === !0 && O.updateMatrixWorld(), X.enabled === !0 && X.isPresenting === !0 && (X.cameraAutoUpdate === !0 && X.updateCamera(O), O = X.getCamera()), E.isScene === !0 && E.onBeforeRender(_, E, O, w), p = te.get(E, x.length), p.init(O), x.push(p), mt.multiplyMatrices(O.projectionMatrix, O.matrixWorldInverse), le.setFromProjectionMatrix(mt), it = this.localClippingEnabled, Y = st.init(this.clippingPlanes, it), v = gt.get(E, m.length), v.init(), m.push(v), X.enabled === !0 && X.isPresenting === !0) {
        const rt = _.xr.getDepthSensingMesh();
        rt !== null && Ao(rt, O, -1 / 0, _.sortObjects);
      }
      Ao(E, O, 0, _.sortObjects), v.finish(), _.sortObjects === !0 && v.sort($, lt), fe = X.enabled === !1 || X.isPresenting === !1 || X.hasDepthSensing() === !1, fe && Nt.addToRenderList(v, E), this.info.render.frame++, Y === !0 && st.beginShadows();
      const H = p.state.shadowsArray;
      _t.render(H, E, O), Y === !0 && st.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const V = v.opaque, B = v.transmissive;
      if (p.setupLights(), O.isArrayCamera) {
        const rt = O.cameras;
        if (B.length > 0)
          for (let dt = 0, xt = rt.length; dt < xt; dt++) {
            const Mt = rt[dt];
            nc(V, B, E, Mt);
          }
        fe && Nt.render(E);
        for (let dt = 0, xt = rt.length; dt < xt; dt++) {
          const Mt = rt[dt];
          ec(v, E, Mt, Mt.viewport);
        }
      } else
        B.length > 0 && nc(V, B, E, O), fe && Nt.render(E), ec(v, E, O);
      w !== null && (A.updateMultisampleRenderTarget(w), A.updateRenderTargetMipmap(w)), E.isScene === !0 && E.onAfterRender(_, E, O), me.resetDefaultState(), R = -1, F = null, x.pop(), x.length > 0 ? (p = x[x.length - 1], Y === !0 && st.setGlobalState(_.clippingPlanes, p.state.camera)) : p = null, m.pop(), m.length > 0 ? v = m[m.length - 1] : v = null;
    };
    function Ao(E, O, H, V) {
      if (E.visible === !1) return;
      if (E.layers.test(O.layers)) {
        if (E.isGroup)
          H = E.renderOrder;
        else if (E.isLOD)
          E.autoUpdate === !0 && E.update(O);
        else if (E.isLight)
          p.pushLight(E), E.castShadow && p.pushShadow(E);
        else if (E.isSprite) {
          if (!E.frustumCulled || le.intersectsSprite(E)) {
            V && Lt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(mt);
            const dt = Z.update(E), xt = E.material;
            xt.visible && v.push(E, dt, xt, H, Lt.z, null);
          }
        } else if ((E.isMesh || E.isLine || E.isPoints) && (!E.frustumCulled || le.intersectsObject(E))) {
          const dt = Z.update(E), xt = E.material;
          if (V && (E.boundingSphere !== void 0 ? (E.boundingSphere === null && E.computeBoundingSphere(), Lt.copy(E.boundingSphere.center)) : (dt.boundingSphere === null && dt.computeBoundingSphere(), Lt.copy(dt.boundingSphere.center)), Lt.applyMatrix4(E.matrixWorld).applyMatrix4(mt)), Array.isArray(xt)) {
            const Mt = dt.groups;
            for (let Pt = 0, It = Mt.length; Pt < It; Pt++) {
              const wt = Mt[Pt], ce = xt[wt.materialIndex];
              ce && ce.visible && v.push(E, dt, ce, H, Lt.z, wt);
            }
          } else xt.visible && v.push(E, dt, xt, H, Lt.z, null);
        }
      }
      const rt = E.children;
      for (let dt = 0, xt = rt.length; dt < xt; dt++)
        Ao(rt[dt], O, H, V);
    }
    function ec(E, O, H, V) {
      const B = E.opaque, rt = E.transmissive, dt = E.transparent;
      p.setupLightsView(H), Y === !0 && st.setGlobalState(_.clippingPlanes, H), V && Dt.viewport(y.copy(V)), B.length > 0 && dr(B, O, H), rt.length > 0 && dr(rt, O, H), dt.length > 0 && dr(dt, O, H), Dt.buffers.depth.setTest(!0), Dt.buffers.depth.setMask(!0), Dt.buffers.color.setMask(!0), Dt.setPolygonOffset(!1);
    }
    function nc(E, O, H, V) {
      if ((H.isScene === !0 ? H.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[V.id] === void 0 && (p.state.transmissionRenderTarget[V.id] = new Ei(1, 1, {
        generateMipmaps: !0,
        type: Kt.has("EXT_color_buffer_half_float") || Kt.has("EXT_color_buffer_float") ? or : Gn,
        minFilter: Bn,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: ne.workingColorSpace
      }));
      const rt = p.state.transmissionRenderTarget[V.id], dt = V.viewport || y;
      rt.setSize(dt.z, dt.w);
      const xt = _.getRenderTarget();
      _.setRenderTarget(rt), _.getClearColor(k), G = _.getClearAlpha(), G < 1 && _.setClearColor(16777215, 0.5), _.clear(), fe && Nt.render(H);
      const Mt = _.toneMapping;
      _.toneMapping = ri;
      const Pt = V.viewport;
      if (V.viewport !== void 0 && (V.viewport = void 0), p.setupLightsView(V), Y === !0 && st.setGlobalState(_.clippingPlanes, V), dr(E, H, V), A.updateMultisampleRenderTarget(rt), A.updateRenderTargetMipmap(rt), Kt.has("WEBGL_multisampled_render_to_texture") === !1) {
        let It = !1;
        for (let wt = 0, ce = O.length; wt < ce; wt++) {
          const ve = O[wt], Se = ve.object, Ye = ve.geometry, oe = ve.material, Tt = ve.group;
          if (oe.side === on && Se.layers.test(V.layers)) {
            const Ne = oe.side;
            oe.side = je, oe.needsUpdate = !0, ic(Se, H, V, Ye, oe, Tt), oe.side = Ne, oe.needsUpdate = !0, It = !0;
          }
        }
        It === !0 && (A.updateMultisampleRenderTarget(rt), A.updateRenderTargetMipmap(rt));
      }
      _.setRenderTarget(xt), _.setClearColor(k, G), Pt !== void 0 && (V.viewport = Pt), _.toneMapping = Mt;
    }
    function dr(E, O, H) {
      const V = O.isScene === !0 ? O.overrideMaterial : null;
      for (let B = 0, rt = E.length; B < rt; B++) {
        const dt = E[B], xt = dt.object, Mt = dt.geometry, Pt = V === null ? dt.material : V, It = dt.group;
        xt.layers.test(H.layers) && ic(xt, O, H, Mt, Pt, It);
      }
    }
    function ic(E, O, H, V, B, rt) {
      E.onBeforeRender(_, O, H, V, B, rt), E.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, E.matrixWorld), E.normalMatrix.getNormalMatrix(E.modelViewMatrix), B.onBeforeRender(_, O, H, V, E, rt), B.transparent === !0 && B.side === on && B.forceSinglePass === !1 ? (B.side = je, B.needsUpdate = !0, _.renderBufferDirect(H, O, V, B, E, rt), B.side = Hn, B.needsUpdate = !0, _.renderBufferDirect(H, O, V, B, E, rt), B.side = on) : _.renderBufferDirect(H, O, V, B, E, rt), E.onAfterRender(_, O, H, V, B, rt);
    }
    function ur(E, O, H) {
      O.isScene !== !0 && (O = Yt);
      const V = Ot.get(E), B = p.state.lights, rt = p.state.shadowsArray, dt = B.state.version, xt = Et.getParameters(E, B.state, rt, O, H), Mt = Et.getProgramCacheKey(xt);
      let Pt = V.programs;
      V.environment = E.isMeshStandardMaterial ? O.environment : null, V.fog = O.fog, V.envMap = (E.isMeshStandardMaterial ? z : b).get(E.envMap || V.environment), V.envMapRotation = V.environment !== null && E.envMap === null ? O.environmentRotation : E.envMapRotation, Pt === void 0 && (E.addEventListener("dispose", Jt), Pt = /* @__PURE__ */ new Map(), V.programs = Pt);
      let It = Pt.get(Mt);
      if (It !== void 0) {
        if (V.currentProgram === It && V.lightsStateVersion === dt)
          return rc(E, xt), It;
      } else
        xt.uniforms = Et.getUniforms(E), E.onBeforeCompile(xt, _), It = Et.acquireProgram(xt, Mt), Pt.set(Mt, It), V.uniforms = xt.uniforms;
      const wt = V.uniforms;
      return (!E.isShaderMaterial && !E.isRawShaderMaterial || E.clipping === !0) && (wt.clippingPlanes = st.uniform), rc(E, xt), V.needsLights = ku(E), V.lightsStateVersion = dt, V.needsLights && (wt.ambientLightColor.value = B.state.ambient, wt.lightProbe.value = B.state.probe, wt.directionalLights.value = B.state.directional, wt.directionalLightShadows.value = B.state.directionalShadow, wt.spotLights.value = B.state.spot, wt.spotLightShadows.value = B.state.spotShadow, wt.rectAreaLights.value = B.state.rectArea, wt.ltc_1.value = B.state.rectAreaLTC1, wt.ltc_2.value = B.state.rectAreaLTC2, wt.pointLights.value = B.state.point, wt.pointLightShadows.value = B.state.pointShadow, wt.hemisphereLights.value = B.state.hemi, wt.directionalShadowMap.value = B.state.directionalShadowMap, wt.directionalShadowMatrix.value = B.state.directionalShadowMatrix, wt.spotShadowMap.value = B.state.spotShadowMap, wt.spotLightMatrix.value = B.state.spotLightMatrix, wt.spotLightMap.value = B.state.spotLightMap, wt.pointShadowMap.value = B.state.pointShadowMap, wt.pointShadowMatrix.value = B.state.pointShadowMatrix), V.currentProgram = It, V.uniformsList = null, It;
    }
    function sc(E) {
      if (E.uniformsList === null) {
        const O = E.currentProgram.getUniforms();
        E.uniformsList = ro.seqWithValue(O.seq, E.uniforms);
      }
      return E.uniformsList;
    }
    function rc(E, O) {
      const H = Ot.get(E);
      H.outputColorSpace = O.outputColorSpace, H.batching = O.batching, H.batchingColor = O.batchingColor, H.instancing = O.instancing, H.instancingColor = O.instancingColor, H.instancingMorph = O.instancingMorph, H.skinning = O.skinning, H.morphTargets = O.morphTargets, H.morphNormals = O.morphNormals, H.morphColors = O.morphColors, H.morphTargetsCount = O.morphTargetsCount, H.numClippingPlanes = O.numClippingPlanes, H.numIntersection = O.numClipIntersection, H.vertexAlphas = O.vertexAlphas, H.vertexTangents = O.vertexTangents, H.toneMapping = O.toneMapping;
    }
    function Fu(E, O, H, V, B) {
      O.isScene !== !0 && (O = Yt), A.resetTextureUnits();
      const rt = O.fog, dt = V.isMeshStandardMaterial ? O.environment : null, xt = w === null ? _.outputColorSpace : w.isXRRenderTarget === !0 ? w.texture.colorSpace : Oe, Mt = (V.isMeshStandardMaterial ? z : b).get(V.envMap || dt), Pt = V.vertexColors === !0 && !!H.attributes.color && H.attributes.color.itemSize === 4, It = !!H.attributes.tangent && (!!V.normalMap || V.anisotropy > 0), wt = !!H.morphAttributes.position, ce = !!H.morphAttributes.normal, ve = !!H.morphAttributes.color;
      let Se = ri;
      V.toneMapped && (w === null || w.isXRRenderTarget === !0) && (Se = _.toneMapping);
      const Ye = H.morphAttributes.position || H.morphAttributes.normal || H.morphAttributes.color, oe = Ye !== void 0 ? Ye.length : 0, Tt = Ot.get(V), Ne = p.state.lights;
      if (Y === !0 && (it === !0 || E !== F)) {
        const nn = E === F && V.id === R;
        st.setState(V, E, nn);
      }
      let ae = !1;
      V.version === Tt.__version ? (Tt.needsLights && Tt.lightsStateVersion !== Ne.state.version || Tt.outputColorSpace !== xt || B.isBatchedMesh && Tt.batching === !1 || !B.isBatchedMesh && Tt.batching === !0 || B.isBatchedMesh && Tt.batchingColor === !0 && B.colorTexture === null || B.isBatchedMesh && Tt.batchingColor === !1 && B.colorTexture !== null || B.isInstancedMesh && Tt.instancing === !1 || !B.isInstancedMesh && Tt.instancing === !0 || B.isSkinnedMesh && Tt.skinning === !1 || !B.isSkinnedMesh && Tt.skinning === !0 || B.isInstancedMesh && Tt.instancingColor === !0 && B.instanceColor === null || B.isInstancedMesh && Tt.instancingColor === !1 && B.instanceColor !== null || B.isInstancedMesh && Tt.instancingMorph === !0 && B.morphTexture === null || B.isInstancedMesh && Tt.instancingMorph === !1 && B.morphTexture !== null || Tt.envMap !== Mt || V.fog === !0 && Tt.fog !== rt || Tt.numClippingPlanes !== void 0 && (Tt.numClippingPlanes !== st.numPlanes || Tt.numIntersection !== st.numIntersection) || Tt.vertexAlphas !== Pt || Tt.vertexTangents !== It || Tt.morphTargets !== wt || Tt.morphNormals !== ce || Tt.morphColors !== ve || Tt.toneMapping !== Se || Tt.morphTargetsCount !== oe) && (ae = !0) : (ae = !0, Tt.__version = V.version);
      let hn = Tt.currentProgram;
      ae === !0 && (hn = ur(V, O, B));
      let Ai = !1, Ze = !1, Ro = !1;
      const be = hn.getUniforms(), Wn = Tt.uniforms;
      if (Dt.useProgram(hn.program) && (Ai = !0, Ze = !0, Ro = !0), V.id !== R && (R = V.id, Ze = !0), Ai || F !== E) {
        Qt.reverseDepthBuffer ? (yt.copy(E.projectionMatrix), yp(yt), Mp(yt), be.setValue(D, "projectionMatrix", yt)) : be.setValue(D, "projectionMatrix", E.projectionMatrix), be.setValue(D, "viewMatrix", E.matrixWorldInverse);
        const nn = be.map.cameraPosition;
        nn !== void 0 && nn.setValue(D, kt.setFromMatrixPosition(E.matrixWorld)), Qt.logarithmicDepthBuffer && be.setValue(
          D,
          "logDepthBufFC",
          2 / (Math.log(E.far + 1) / Math.LN2)
        ), (V.isMeshPhongMaterial || V.isMeshToonMaterial || V.isMeshLambertMaterial || V.isMeshBasicMaterial || V.isMeshStandardMaterial || V.isShaderMaterial) && be.setValue(D, "isOrthographic", E.isOrthographicCamera === !0), F !== E && (F = E, Ze = !0, Ro = !0);
      }
      if (B.isSkinnedMesh) {
        be.setOptional(D, B, "bindMatrix"), be.setOptional(D, B, "bindMatrixInverse");
        const nn = B.skeleton;
        nn && (nn.boneTexture === null && nn.computeBoneTexture(), be.setValue(D, "boneTexture", nn.boneTexture, A));
      }
      B.isBatchedMesh && (be.setOptional(D, B, "batchingTexture"), be.setValue(D, "batchingTexture", B._matricesTexture, A), be.setOptional(D, B, "batchingIdTexture"), be.setValue(D, "batchingIdTexture", B._indirectTexture, A), be.setOptional(D, B, "batchingColorTexture"), B._colorsTexture !== null && be.setValue(D, "batchingColorTexture", B._colorsTexture, A));
      const Co = H.morphAttributes;
      if ((Co.position !== void 0 || Co.normal !== void 0 || Co.color !== void 0) && Ut.update(B, H, hn), (Ze || Tt.receiveShadow !== B.receiveShadow) && (Tt.receiveShadow = B.receiveShadow, be.setValue(D, "receiveShadow", B.receiveShadow)), V.isMeshGouraudMaterial && V.envMap !== null && (Wn.envMap.value = Mt, Wn.flipEnvMap.value = Mt.isCubeTexture && Mt.isRenderTargetTexture === !1 ? -1 : 1), V.isMeshStandardMaterial && V.envMap === null && O.environment !== null && (Wn.envMapIntensity.value = O.environmentIntensity), Ze && (be.setValue(D, "toneMappingExposure", _.toneMappingExposure), Tt.needsLights && Bu(Wn, Ro), rt && V.fog === !0 && at.refreshFogUniforms(Wn, rt), at.refreshMaterialUniforms(Wn, V, et, W, p.state.transmissionRenderTarget[E.id]), ro.upload(D, sc(Tt), Wn, A)), V.isShaderMaterial && V.uniformsNeedUpdate === !0 && (ro.upload(D, sc(Tt), Wn, A), V.uniformsNeedUpdate = !1), V.isSpriteMaterial && be.setValue(D, "center", B.center), be.setValue(D, "modelViewMatrix", B.modelViewMatrix), be.setValue(D, "normalMatrix", B.normalMatrix), be.setValue(D, "modelMatrix", B.matrixWorld), V.isShaderMaterial || V.isRawShaderMaterial) {
        const nn = V.uniformsGroups;
        for (let Po = 0, zu = nn.length; Po < zu; Po++) {
          const oc = nn[Po];
          U.update(oc, hn), U.bind(oc, hn);
        }
      }
      return hn;
    }
    function Bu(E, O) {
      E.ambientLightColor.needsUpdate = O, E.lightProbe.needsUpdate = O, E.directionalLights.needsUpdate = O, E.directionalLightShadows.needsUpdate = O, E.pointLights.needsUpdate = O, E.pointLightShadows.needsUpdate = O, E.spotLights.needsUpdate = O, E.spotLightShadows.needsUpdate = O, E.rectAreaLights.needsUpdate = O, E.hemisphereLights.needsUpdate = O;
    }
    function ku(E) {
      return E.isMeshLambertMaterial || E.isMeshToonMaterial || E.isMeshPhongMaterial || E.isMeshStandardMaterial || E.isShadowMaterial || E.isShaderMaterial && E.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return L;
    }, this.getActiveMipmapLevel = function() {
      return T;
    }, this.getRenderTarget = function() {
      return w;
    }, this.setRenderTargetTextures = function(E, O, H) {
      Ot.get(E.texture).__webglTexture = O, Ot.get(E.depthTexture).__webglTexture = H;
      const V = Ot.get(E);
      V.__hasExternalTextures = !0, V.__autoAllocateDepthBuffer = H === void 0, V.__autoAllocateDepthBuffer || Kt.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), V.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(E, O) {
      const H = Ot.get(E);
      H.__webglFramebuffer = O, H.__useDefaultFramebuffer = O === void 0;
    }, this.setRenderTarget = function(E, O = 0, H = 0) {
      w = E, L = O, T = H;
      let V = !0, B = null, rt = !1, dt = !1;
      if (E) {
        const Mt = Ot.get(E);
        if (Mt.__useDefaultFramebuffer !== void 0)
          Dt.bindFramebuffer(D.FRAMEBUFFER, null), V = !1;
        else if (Mt.__webglFramebuffer === void 0)
          A.setupRenderTarget(E);
        else if (Mt.__hasExternalTextures)
          A.rebindTextures(E, Ot.get(E.texture).__webglTexture, Ot.get(E.depthTexture).__webglTexture);
        else if (E.depthBuffer) {
          const wt = E.depthTexture;
          if (Mt.__boundDepthTexture !== wt) {
            if (wt !== null && Ot.has(wt) && (E.width !== wt.image.width || E.height !== wt.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            A.setupDepthRenderbuffer(E);
          }
        }
        const Pt = E.texture;
        (Pt.isData3DTexture || Pt.isDataArrayTexture || Pt.isCompressedArrayTexture) && (dt = !0);
        const It = Ot.get(E).__webglFramebuffer;
        E.isWebGLCubeRenderTarget ? (Array.isArray(It[O]) ? B = It[O][H] : B = It[O], rt = !0) : E.samples > 0 && A.useMultisampledRTT(E) === !1 ? B = Ot.get(E).__webglMultisampledFramebuffer : Array.isArray(It) ? B = It[H] : B = It, y.copy(E.viewport), S.copy(E.scissor), N = E.scissorTest;
      } else
        y.copy(ct).multiplyScalar(et).floor(), S.copy(St).multiplyScalar(et).floor(), N = ie;
      if (Dt.bindFramebuffer(D.FRAMEBUFFER, B) && V && Dt.drawBuffers(E, B), Dt.viewport(y), Dt.scissor(S), Dt.setScissorTest(N), rt) {
        const Mt = Ot.get(E.texture);
        D.framebufferTexture2D(D.FRAMEBUFFER, D.COLOR_ATTACHMENT0, D.TEXTURE_CUBE_MAP_POSITIVE_X + O, Mt.__webglTexture, H);
      } else if (dt) {
        const Mt = Ot.get(E.texture), Pt = O || 0;
        D.framebufferTextureLayer(D.FRAMEBUFFER, D.COLOR_ATTACHMENT0, Mt.__webglTexture, H || 0, Pt);
      }
      R = -1;
    }, this.readRenderTargetPixels = function(E, O, H, V, B, rt, dt) {
      if (!(E && E.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let xt = Ot.get(E).__webglFramebuffer;
      if (E.isWebGLCubeRenderTarget && dt !== void 0 && (xt = xt[dt]), xt) {
        Dt.bindFramebuffer(D.FRAMEBUFFER, xt);
        try {
          const Mt = E.texture, Pt = Mt.format, It = Mt.type;
          if (!Qt.textureFormatReadable(Pt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Qt.textureTypeReadable(It)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          O >= 0 && O <= E.width - V && H >= 0 && H <= E.height - B && D.readPixels(O, H, V, B, zt.convert(Pt), zt.convert(It), rt);
        } finally {
          const Mt = w !== null ? Ot.get(w).__webglFramebuffer : null;
          Dt.bindFramebuffer(D.FRAMEBUFFER, Mt);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(E, O, H, V, B, rt, dt) {
      if (!(E && E.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let xt = Ot.get(E).__webglFramebuffer;
      if (E.isWebGLCubeRenderTarget && dt !== void 0 && (xt = xt[dt]), xt) {
        const Mt = E.texture, Pt = Mt.format, It = Mt.type;
        if (!Qt.textureFormatReadable(Pt))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!Qt.textureTypeReadable(It))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (O >= 0 && O <= E.width - V && H >= 0 && H <= E.height - B) {
          Dt.bindFramebuffer(D.FRAMEBUFFER, xt);
          const wt = D.createBuffer();
          D.bindBuffer(D.PIXEL_PACK_BUFFER, wt), D.bufferData(D.PIXEL_PACK_BUFFER, rt.byteLength, D.STREAM_READ), D.readPixels(O, H, V, B, zt.convert(Pt), zt.convert(It), 0);
          const ce = w !== null ? Ot.get(w).__webglFramebuffer : null;
          Dt.bindFramebuffer(D.FRAMEBUFFER, ce);
          const ve = D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return D.flush(), await xp(D, ve, 4), D.bindBuffer(D.PIXEL_PACK_BUFFER, wt), D.getBufferSubData(D.PIXEL_PACK_BUFFER, 0, rt), D.deleteBuffer(wt), D.deleteSync(ve), rt;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(E, O = null, H = 0) {
      E.isTexture !== !0 && (so("WebGLRenderer: copyFramebufferToTexture function signature has changed."), O = arguments[0] || null, E = arguments[1]);
      const V = Math.pow(2, -H), B = Math.floor(E.image.width * V), rt = Math.floor(E.image.height * V), dt = O !== null ? O.x : 0, xt = O !== null ? O.y : 0;
      A.setTexture2D(E, 0), D.copyTexSubImage2D(D.TEXTURE_2D, H, 0, 0, dt, xt, B, rt), Dt.unbindTexture();
    }, this.copyTextureToTexture = function(E, O, H = null, V = null, B = 0) {
      E.isTexture !== !0 && (so("WebGLRenderer: copyTextureToTexture function signature has changed."), V = arguments[0] || null, E = arguments[1], O = arguments[2], B = arguments[3] || 0, H = null);
      let rt, dt, xt, Mt, Pt, It;
      H !== null ? (rt = H.max.x - H.min.x, dt = H.max.y - H.min.y, xt = H.min.x, Mt = H.min.y) : (rt = E.image.width, dt = E.image.height, xt = 0, Mt = 0), V !== null ? (Pt = V.x, It = V.y) : (Pt = 0, It = 0);
      const wt = zt.convert(O.format), ce = zt.convert(O.type);
      A.setTexture2D(O, 0), D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL, O.flipY), D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), D.pixelStorei(D.UNPACK_ALIGNMENT, O.unpackAlignment);
      const ve = D.getParameter(D.UNPACK_ROW_LENGTH), Se = D.getParameter(D.UNPACK_IMAGE_HEIGHT), Ye = D.getParameter(D.UNPACK_SKIP_PIXELS), oe = D.getParameter(D.UNPACK_SKIP_ROWS), Tt = D.getParameter(D.UNPACK_SKIP_IMAGES), Ne = E.isCompressedTexture ? E.mipmaps[B] : E.image;
      D.pixelStorei(D.UNPACK_ROW_LENGTH, Ne.width), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, Ne.height), D.pixelStorei(D.UNPACK_SKIP_PIXELS, xt), D.pixelStorei(D.UNPACK_SKIP_ROWS, Mt), E.isDataTexture ? D.texSubImage2D(D.TEXTURE_2D, B, Pt, It, rt, dt, wt, ce, Ne.data) : E.isCompressedTexture ? D.compressedTexSubImage2D(D.TEXTURE_2D, B, Pt, It, Ne.width, Ne.height, wt, Ne.data) : D.texSubImage2D(D.TEXTURE_2D, B, Pt, It, rt, dt, wt, ce, Ne), D.pixelStorei(D.UNPACK_ROW_LENGTH, ve), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, Se), D.pixelStorei(D.UNPACK_SKIP_PIXELS, Ye), D.pixelStorei(D.UNPACK_SKIP_ROWS, oe), D.pixelStorei(D.UNPACK_SKIP_IMAGES, Tt), B === 0 && O.generateMipmaps && D.generateMipmap(D.TEXTURE_2D), Dt.unbindTexture();
    }, this.copyTextureToTexture3D = function(E, O, H = null, V = null, B = 0) {
      E.isTexture !== !0 && (so("WebGLRenderer: copyTextureToTexture3D function signature has changed."), H = arguments[0] || null, V = arguments[1] || null, E = arguments[2], O = arguments[3], B = arguments[4] || 0);
      let rt, dt, xt, Mt, Pt, It, wt, ce, ve;
      const Se = E.isCompressedTexture ? E.mipmaps[B] : E.image;
      H !== null ? (rt = H.max.x - H.min.x, dt = H.max.y - H.min.y, xt = H.max.z - H.min.z, Mt = H.min.x, Pt = H.min.y, It = H.min.z) : (rt = Se.width, dt = Se.height, xt = Se.depth, Mt = 0, Pt = 0, It = 0), V !== null ? (wt = V.x, ce = V.y, ve = V.z) : (wt = 0, ce = 0, ve = 0);
      const Ye = zt.convert(O.format), oe = zt.convert(O.type);
      let Tt;
      if (O.isData3DTexture)
        A.setTexture3D(O, 0), Tt = D.TEXTURE_3D;
      else if (O.isDataArrayTexture || O.isCompressedArrayTexture)
        A.setTexture2DArray(O, 0), Tt = D.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL, O.flipY), D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), D.pixelStorei(D.UNPACK_ALIGNMENT, O.unpackAlignment);
      const Ne = D.getParameter(D.UNPACK_ROW_LENGTH), ae = D.getParameter(D.UNPACK_IMAGE_HEIGHT), hn = D.getParameter(D.UNPACK_SKIP_PIXELS), Ai = D.getParameter(D.UNPACK_SKIP_ROWS), Ze = D.getParameter(D.UNPACK_SKIP_IMAGES);
      D.pixelStorei(D.UNPACK_ROW_LENGTH, Se.width), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, Se.height), D.pixelStorei(D.UNPACK_SKIP_PIXELS, Mt), D.pixelStorei(D.UNPACK_SKIP_ROWS, Pt), D.pixelStorei(D.UNPACK_SKIP_IMAGES, It), E.isDataTexture || E.isData3DTexture ? D.texSubImage3D(Tt, B, wt, ce, ve, rt, dt, xt, Ye, oe, Se.data) : O.isCompressedArrayTexture ? D.compressedTexSubImage3D(Tt, B, wt, ce, ve, rt, dt, xt, Ye, Se.data) : D.texSubImage3D(Tt, B, wt, ce, ve, rt, dt, xt, Ye, oe, Se), D.pixelStorei(D.UNPACK_ROW_LENGTH, Ne), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, ae), D.pixelStorei(D.UNPACK_SKIP_PIXELS, hn), D.pixelStorei(D.UNPACK_SKIP_ROWS, Ai), D.pixelStorei(D.UNPACK_SKIP_IMAGES, Ze), B === 0 && O.generateMipmaps && D.generateMipmap(Tt), Dt.unbindTexture();
    }, this.initRenderTarget = function(E) {
      Ot.get(E).__webglFramebuffer === void 0 && A.setupRenderTarget(E);
    }, this.initTexture = function(E) {
      E.isCubeTexture ? A.setTextureCube(E, 0) : E.isData3DTexture ? A.setTexture3D(E, 0) : E.isDataArrayTexture || E.isCompressedArrayTexture ? A.setTexture2DArray(E, 0) : A.setTexture2D(E, 0), Dt.unbindTexture();
    }, this.resetState = function() {
      L = 0, T = 0, w = null, Dt.reset(), me.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return kn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(t) {
    this._outputColorSpace = t;
    const e = this.getContext();
    e.drawingBufferColorSpace = t === Il ? "display-p3" : "srgb", e.unpackColorSpace = ne.workingColorSpace === bo ? "display-p3" : "srgb";
  }
}
class iu extends ye {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new bn(), this.environmentIntensity = 1, this.environmentRotation = new bn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
}
class su {
  constructor(t, e) {
    this.isInterleavedBuffer = !0, this.array = t, this.stride = e, this.count = t !== void 0 ? t.length / e : 0, this.usage = al, this.updateRanges = [], this.version = 0, this.uuid = cn();
  }
  onUploadCallback() {
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  setUsage(t) {
    return this.usage = t, this;
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return this.array = new t.array.constructor(t.array), this.count = t.count, this.stride = t.stride, this.usage = t.usage, this;
  }
  copyAt(t, e, n) {
    t *= this.stride, n *= e.stride;
    for (let s = 0, r = this.stride; s < r; s++)
      this.array[t + s] = e.array[n + s];
    return this;
  }
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  clone(t) {
    t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = cn()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const e = new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(e, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(t) {
    return this.onUploadCallback = t, this;
  }
  toJSON(t) {
    return t.arrayBuffers === void 0 && (t.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = cn()), t.arrayBuffers[this.array.buffer._uuid] === void 0 && (t.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}
const He = /* @__PURE__ */ new P();
class Qs {
  constructor(t, e, n, s = !1) {
    this.isInterleavedBufferAttribute = !0, this.name = "", this.data = t, this.itemSize = e, this.offset = n, this.normalized = s;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(t) {
    this.data.needsUpdate = t;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.data.count; e < n; e++)
      He.fromBufferAttribute(this, e), He.applyMatrix4(t), this.setXYZ(e, He.x, He.y, He.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++)
      He.fromBufferAttribute(this, e), He.applyNormalMatrix(t), this.setXYZ(e, He.x, He.y, He.z);
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++)
      He.fromBufferAttribute(this, e), He.transformDirection(t), this.setXYZ(e, He.x, He.y, He.z);
    return this;
  }
  getComponent(t, e) {
    let n = this.array[t * this.data.stride + this.offset + e];
    return this.normalized && (n = gn(n, this.array)), n;
  }
  setComponent(t, e, n) {
    return this.normalized && (n = he(n, this.array)), this.data.array[t * this.data.stride + this.offset + e] = n, this;
  }
  setX(t, e) {
    return this.normalized && (e = he(e, this.array)), this.data.array[t * this.data.stride + this.offset] = e, this;
  }
  setY(t, e) {
    return this.normalized && (e = he(e, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = e, this;
  }
  setZ(t, e) {
    return this.normalized && (e = he(e, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = e, this;
  }
  setW(t, e) {
    return this.normalized && (e = he(e, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = e, this;
  }
  getX(t) {
    let e = this.data.array[t * this.data.stride + this.offset];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  getY(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 1];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  getZ(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 2];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  getW(t) {
    let e = this.data.array[t * this.data.stride + this.offset + 3];
    return this.normalized && (e = gn(e, this.array)), e;
  }
  setXY(t, e, n) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = he(e, this.array), n = he(n, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this;
  }
  setXYZ(t, e, n, s) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = he(e, this.array), n = he(n, this.array), s = he(s, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this.data.array[t + 2] = s, this;
  }
  setXYZW(t, e, n, s, r) {
    return t = t * this.data.stride + this.offset, this.normalized && (e = he(e, this.array), n = he(n, this.array), s = he(s, this.array), r = he(r, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = n, this.data.array[t + 2] = s, this.data.array[t + 3] = r, this;
  }
  clone(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const e = [];
      for (let n = 0; n < this.count; n++) {
        const s = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++)
          e.push(this.data.array[s + r]);
      }
      return new Ue(new this.array.constructor(e), this.itemSize, this.normalized);
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new Qs(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const e = [];
      for (let n = 0; n < this.count; n++) {
        const s = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++)
          e.push(this.data.array[s + r]);
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: e,
        normalized: this.normalized
      };
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)), {
        isInterleavedBufferAttribute: !0,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };
  }
}
class ru extends vn {
  constructor(t) {
    super(), this.isSpriteMaterial = !0, this.type = "SpriteMaterial", this.color = new Ct(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = !0, this.transparent = !0, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.rotation = t.rotation, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
let Gi;
const Ts = /* @__PURE__ */ new P(), Vi = /* @__PURE__ */ new P(), Wi = /* @__PURE__ */ new P(), $i = /* @__PURE__ */ new nt(), As = /* @__PURE__ */ new nt(), ou = /* @__PURE__ */ new Ft(), Dr = /* @__PURE__ */ new P(), Rs = /* @__PURE__ */ new P(), Nr = /* @__PURE__ */ new P(), gh = /* @__PURE__ */ new nt(), aa = /* @__PURE__ */ new nt(), _h = /* @__PURE__ */ new nt();
class Lv extends ye {
  constructor(t = new ru()) {
    if (super(), this.isSprite = !0, this.type = "Sprite", Gi === void 0) {
      Gi = new Ie();
      const e = new Float32Array([
        -0.5,
        -0.5,
        0,
        0,
        0,
        0.5,
        -0.5,
        0,
        1,
        0,
        0.5,
        0.5,
        0,
        1,
        1,
        -0.5,
        0.5,
        0,
        0,
        1
      ]), n = new su(e, 5);
      Gi.setIndex([0, 1, 2, 0, 2, 3]), Gi.setAttribute("position", new Qs(n, 3, 0, !1)), Gi.setAttribute("uv", new Qs(n, 2, 3, !1));
    }
    this.geometry = Gi, this.material = t, this.center = new nt(0.5, 0.5);
  }
  raycast(t, e) {
    t.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), Vi.setFromMatrixScale(this.matrixWorld), ou.copy(t.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse, this.matrixWorld), Wi.setFromMatrixPosition(this.modelViewMatrix), t.camera.isPerspectiveCamera && this.material.sizeAttenuation === !1 && Vi.multiplyScalar(-Wi.z);
    const n = this.material.rotation;
    let s, r;
    n !== 0 && (r = Math.cos(n), s = Math.sin(n));
    const o = this.center;
    Ur(Dr.set(-0.5, -0.5, 0), Wi, o, Vi, s, r), Ur(Rs.set(0.5, -0.5, 0), Wi, o, Vi, s, r), Ur(Nr.set(0.5, 0.5, 0), Wi, o, Vi, s, r), gh.set(0, 0), aa.set(1, 0), _h.set(1, 1);
    let a = t.ray.intersectTriangle(Dr, Rs, Nr, !1, Ts);
    if (a === null && (Ur(Rs.set(-0.5, 0.5, 0), Wi, o, Vi, s, r), aa.set(0, 1), a = t.ray.intersectTriangle(Dr, Nr, Rs, !1, Ts), a === null))
      return;
    const l = t.ray.origin.distanceTo(Ts);
    l < t.near || l > t.far || e.push({
      distance: l,
      point: Ts.clone(),
      uv: an.getInterpolation(Ts, Dr, Rs, Nr, gh, aa, _h, new nt()),
      face: null,
      object: this
    });
  }
  copy(t, e) {
    return super.copy(t, e), t.center !== void 0 && this.center.copy(t.center), this.material = t.material, this;
  }
}
function Ur(i, t, e, n, s, r) {
  $i.subVectors(i, e).addScalar(0.5).multiply(n), s !== void 0 ? (As.x = r * $i.x - s * $i.y, As.y = s * $i.x + r * $i.y) : As.copy($i), i.copy(t), i.x += As.x, i.y += As.y, i.applyMatrix4(ou);
}
const vh = /* @__PURE__ */ new P(), xh = /* @__PURE__ */ new re(), yh = /* @__PURE__ */ new re(), Iv = /* @__PURE__ */ new P(), Mh = /* @__PURE__ */ new Ft(), Or = /* @__PURE__ */ new P(), la = /* @__PURE__ */ new En(), Sh = /* @__PURE__ */ new Ft(), ca = /* @__PURE__ */ new ms();
class Dv extends ge {
  constructor(t, e) {
    super(t, e), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = Sc, this.bindMatrix = new Ft(), this.bindMatrixInverse = new Ft(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const t = this.geometry;
    this.boundingBox === null && (this.boundingBox = new Ke()), this.boundingBox.makeEmpty();
    const e = t.getAttribute("position");
    for (let n = 0; n < e.count; n++)
      this.getVertexPosition(n, Or), this.boundingBox.expandByPoint(Or);
  }
  computeBoundingSphere() {
    const t = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new En()), this.boundingSphere.makeEmpty();
    const e = t.getAttribute("position");
    for (let n = 0; n < e.count; n++)
      this.getVertexPosition(n, Or), this.boundingSphere.expandByPoint(Or);
  }
  copy(t, e) {
    return super.copy(t, e), this.bindMode = t.bindMode, this.bindMatrix.copy(t.bindMatrix), this.bindMatrixInverse.copy(t.bindMatrixInverse), this.skeleton = t.skeleton, t.boundingBox !== null && (this.boundingBox = t.boundingBox.clone()), t.boundingSphere !== null && (this.boundingSphere = t.boundingSphere.clone()), this;
  }
  raycast(t, e) {
    const n = this.material, s = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), la.copy(this.boundingSphere), la.applyMatrix4(s), t.ray.intersectsSphere(la) !== !1 && (Sh.copy(s).invert(), ca.copy(t.ray).applyMatrix4(Sh), !(this.boundingBox !== null && ca.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(t, e, ca)));
  }
  getVertexPosition(t, e) {
    return super.getVertexPosition(t, e), this.applyBoneTransform(t, e), e;
  }
  bind(t, e) {
    this.skeleton = t, e === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), e = this.matrixWorld), this.bindMatrix.copy(e), this.bindMatrixInverse.copy(e).invert();
  }
  pose() {
    this.skeleton.pose();
  }
  normalizeSkinWeights() {
    const t = new re(), e = this.geometry.attributes.skinWeight;
    for (let n = 0, s = e.count; n < s; n++) {
      t.fromBufferAttribute(e, n);
      const r = 1 / t.manhattanLength();
      r !== 1 / 0 ? t.multiplyScalar(r) : t.set(1, 0, 0, 0), e.setXYZW(n, t.x, t.y, t.z, t.w);
    }
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.bindMode === Sc ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === Vf ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(t, e) {
    const n = this.skeleton, s = this.geometry;
    xh.fromBufferAttribute(s.attributes.skinIndex, t), yh.fromBufferAttribute(s.attributes.skinWeight, t), vh.copy(e).applyMatrix4(this.bindMatrix), e.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const o = yh.getComponent(r);
      if (o !== 0) {
        const a = xh.getComponent(r);
        Mh.multiplyMatrices(n.bones[a].matrixWorld, n.boneInverses[a]), e.addScaledVector(Iv.copy(vh).applyMatrix4(Mh), o);
      }
    }
    return e.applyMatrix4(this.bindMatrixInverse);
  }
}
class au extends ye {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}
class lu extends Ce {
  constructor(t = null, e = 1, n = 1, s, r, o, a, l, c = Ve, h = Ve, d, u) {
    super(null, o, a, l, c, h, s, r, d, u), this.isDataTexture = !0, this.image = { data: t, width: e, height: n }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
const bh = /* @__PURE__ */ new Ft(), Nv = /* @__PURE__ */ new Ft();
class Bl {
  constructor(t = [], e = []) {
    this.uuid = cn(), this.bones = t.slice(0), this.boneInverses = e, this.boneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    const t = this.bones, e = this.boneInverses;
    if (this.boneMatrices = new Float32Array(t.length * 16), e.length === 0)
      this.calculateInverses();
    else if (t.length !== e.length) {
      console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let n = 0, s = this.bones.length; n < s; n++)
        this.boneInverses.push(new Ft());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let t = 0, e = this.bones.length; t < e; t++) {
      const n = new Ft();
      this.bones[t] && n.copy(this.bones[t].matrixWorld).invert(), this.boneInverses.push(n);
    }
  }
  pose() {
    for (let t = 0, e = this.bones.length; t < e; t++) {
      const n = this.bones[t];
      n && n.matrixWorld.copy(this.boneInverses[t]).invert();
    }
    for (let t = 0, e = this.bones.length; t < e; t++) {
      const n = this.bones[t];
      n && (n.parent && n.parent.isBone ? (n.matrix.copy(n.parent.matrixWorld).invert(), n.matrix.multiply(n.matrixWorld)) : n.matrix.copy(n.matrixWorld), n.matrix.decompose(n.position, n.quaternion, n.scale));
    }
  }
  update() {
    const t = this.bones, e = this.boneInverses, n = this.boneMatrices, s = this.boneTexture;
    for (let r = 0, o = t.length; r < o; r++) {
      const a = t[r] ? t[r].matrixWorld : Nv;
      bh.multiplyMatrices(a, e[r]), bh.toArray(n, r * 16);
    }
    s !== null && (s.needsUpdate = !0);
  }
  clone() {
    return new Bl(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let t = Math.sqrt(this.bones.length * 4);
    t = Math.ceil(t / 4) * 4, t = Math.max(t, 4);
    const e = new Float32Array(t * t * 4);
    e.set(this.boneMatrices);
    const n = new lu(e, t, t, ln, _n);
    return n.needsUpdate = !0, this.boneMatrices = e, this.boneTexture = n, this;
  }
  getBoneByName(t) {
    for (let e = 0, n = this.bones.length; e < n; e++) {
      const s = this.bones[e];
      if (s.name === t)
        return s;
    }
  }
  dispose() {
    this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null);
  }
  fromJSON(t, e) {
    this.uuid = t.uuid;
    for (let n = 0, s = t.bones.length; n < s; n++) {
      const r = t.bones[n];
      let o = e[r];
      o === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), o = new au()), this.bones.push(o), this.boneInverses.push(new Ft().fromArray(t.boneInverses[n]));
    }
    return this.init(), this;
  }
  toJSON() {
    const t = {
      metadata: {
        version: 4.6,
        type: "Skeleton",
        generator: "Skeleton.toJSON"
      },
      bones: [],
      boneInverses: []
    };
    t.uuid = this.uuid;
    const e = this.bones, n = this.boneInverses;
    for (let s = 0, r = e.length; s < r; s++) {
      const o = e[s];
      t.bones.push(o.uuid);
      const a = n[s];
      t.boneInverses.push(a.toArray());
    }
    return t;
  }
}
class cl extends Ue {
  constructor(t, e, n, s = 1) {
    super(t, e, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = s;
  }
  copy(t) {
    return super.copy(t), this.meshPerAttribute = t.meshPerAttribute, this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.meshPerAttribute = this.meshPerAttribute, t.isInstancedBufferAttribute = !0, t;
  }
}
const Xi = /* @__PURE__ */ new Ft(), Eh = /* @__PURE__ */ new Ft(), Fr = [], wh = /* @__PURE__ */ new Ke(), Uv = /* @__PURE__ */ new Ft(), Cs = /* @__PURE__ */ new ge(), Ps = /* @__PURE__ */ new En();
class Ov extends ge {
  constructor(t, e, n) {
    super(t, e), this.isInstancedMesh = !0, this.instanceMatrix = new cl(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let s = 0; s < n; s++)
      this.setMatrixAt(s, Uv);
  }
  computeBoundingBox() {
    const t = this.geometry, e = this.count;
    this.boundingBox === null && (this.boundingBox = new Ke()), t.boundingBox === null && t.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < e; n++)
      this.getMatrixAt(n, Xi), wh.copy(t.boundingBox).applyMatrix4(Xi), this.boundingBox.union(wh);
  }
  computeBoundingSphere() {
    const t = this.geometry, e = this.count;
    this.boundingSphere === null && (this.boundingSphere = new En()), t.boundingSphere === null && t.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < e; n++)
      this.getMatrixAt(n, Xi), Ps.copy(t.boundingSphere).applyMatrix4(Xi), this.boundingSphere.union(Ps);
  }
  copy(t, e) {
    return super.copy(t, e), this.instanceMatrix.copy(t.instanceMatrix), t.morphTexture !== null && (this.morphTexture = t.morphTexture.clone()), t.instanceColor !== null && (this.instanceColor = t.instanceColor.clone()), this.count = t.count, t.boundingBox !== null && (this.boundingBox = t.boundingBox.clone()), t.boundingSphere !== null && (this.boundingSphere = t.boundingSphere.clone()), this;
  }
  getColorAt(t, e) {
    e.fromArray(this.instanceColor.array, t * 3);
  }
  getMatrixAt(t, e) {
    e.fromArray(this.instanceMatrix.array, t * 16);
  }
  getMorphAt(t, e) {
    const n = e.morphTargetInfluences, s = this.morphTexture.source.data.data, r = n.length + 1, o = t * r + 1;
    for (let a = 0; a < n.length; a++)
      n[a] = s[o + a];
  }
  raycast(t, e) {
    const n = this.matrixWorld, s = this.count;
    if (Cs.geometry = this.geometry, Cs.material = this.material, Cs.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), Ps.copy(this.boundingSphere), Ps.applyMatrix4(n), t.ray.intersectsSphere(Ps) !== !1))
      for (let r = 0; r < s; r++) {
        this.getMatrixAt(r, Xi), Eh.multiplyMatrices(n, Xi), Cs.matrixWorld = Eh, Cs.raycast(t, Fr);
        for (let o = 0, a = Fr.length; o < a; o++) {
          const l = Fr[o];
          l.instanceId = r, l.object = this, e.push(l);
        }
        Fr.length = 0;
      }
  }
  setColorAt(t, e) {
    this.instanceColor === null && (this.instanceColor = new cl(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), e.toArray(this.instanceColor.array, t * 3);
  }
  setMatrixAt(t, e) {
    e.toArray(this.instanceMatrix.array, t * 16);
  }
  setMorphAt(t, e) {
    const n = e.morphTargetInfluences, s = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new lu(new Float32Array(s * this.count), s, this.count, Rl, _n));
    const r = this.morphTexture.source.data.data;
    let o = 0;
    for (let c = 0; c < n.length; c++)
      o += n[c];
    const a = this.geometry.morphTargetsRelative ? 1 : 1 - o, l = s * t;
    r[l] = a, r.set(n, l + 1);
  }
  updateMorphTargets() {
  }
  dispose() {
    return this.dispatchEvent({ type: "dispose" }), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null), this;
  }
}
class wo extends vn {
  constructor(t) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Ct(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const po = /* @__PURE__ */ new P(), mo = /* @__PURE__ */ new P(), Th = /* @__PURE__ */ new Ft(), Ls = /* @__PURE__ */ new ms(), Br = /* @__PURE__ */ new En(), ha = /* @__PURE__ */ new P(), Ah = /* @__PURE__ */ new P();
class kl extends ye {
  constructor(t = new Ie(), e = new wo()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = t, this.material = e, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [0];
      for (let s = 1, r = e.count; s < r; s++)
        po.fromBufferAttribute(e, s - 1), mo.fromBufferAttribute(e, s), n[s] = n[s - 1], n[s] += po.distanceTo(mo);
      t.setAttribute("lineDistance", new ue(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(t, e) {
    const n = this.geometry, s = this.matrixWorld, r = t.params.Line.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Br.copy(n.boundingSphere), Br.applyMatrix4(s), Br.radius += r, t.ray.intersectsSphere(Br) === !1) return;
    Th.copy(s).invert(), Ls.copy(t.ray).applyMatrix4(Th);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = this.isLineSegments ? 2 : 1, h = n.index, u = n.attributes.position;
    if (h !== null) {
      const f = Math.max(0, o.start), g = Math.min(h.count, o.start + o.count);
      for (let v = f, p = g - 1; v < p; v += c) {
        const m = h.getX(v), x = h.getX(v + 1), _ = kr(this, t, Ls, l, m, x);
        _ && e.push(_);
      }
      if (this.isLineLoop) {
        const v = h.getX(g - 1), p = h.getX(f), m = kr(this, t, Ls, l, v, p);
        m && e.push(m);
      }
    } else {
      const f = Math.max(0, o.start), g = Math.min(u.count, o.start + o.count);
      for (let v = f, p = g - 1; v < p; v += c) {
        const m = kr(this, t, Ls, l, v, v + 1);
        m && e.push(m);
      }
      if (this.isLineLoop) {
        const v = kr(this, t, Ls, l, g - 1, f);
        v && e.push(v);
      }
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const s = e[n[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = s.length; r < o; r++) {
          const a = s[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
}
function kr(i, t, e, n, s, r) {
  const o = i.geometry.attributes.position;
  if (po.fromBufferAttribute(o, s), mo.fromBufferAttribute(o, r), e.distanceSqToSegment(po, mo, ha, Ah) > n) return;
  ha.applyMatrix4(i.matrixWorld);
  const l = t.ray.origin.distanceTo(ha);
  if (!(l < t.near || l > t.far))
    return {
      distance: l,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: Ah.clone().applyMatrix4(i.matrixWorld),
      index: s,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
}
const Rh = /* @__PURE__ */ new P(), Ch = /* @__PURE__ */ new P();
class zl extends kl {
  constructor(t, e) {
    super(t, e), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [];
      for (let s = 0, r = e.count; s < r; s += 2)
        Rh.fromBufferAttribute(e, s), Ch.fromBufferAttribute(e, s + 1), n[s] = s === 0 ? 0 : n[s - 1], n[s + 1] = n[s] + Rh.distanceTo(Ch);
      t.setAttribute("lineDistance", new ue(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Fv extends kl {
  constructor(t, e) {
    super(t, e), this.isLineLoop = !0, this.type = "LineLoop";
  }
}
class cu extends vn {
  constructor(t) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new Ct(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
const Ph = /* @__PURE__ */ new Ft(), hl = /* @__PURE__ */ new ms(), zr = /* @__PURE__ */ new En(), Hr = /* @__PURE__ */ new P();
class Bv extends ye {
  constructor(t = new Ie(), e = new cu()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = t, this.material = e, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  raycast(t, e) {
    const n = this.geometry, s = this.matrixWorld, r = t.params.Points.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), zr.copy(n.boundingSphere), zr.applyMatrix4(s), zr.radius += r, t.ray.intersectsSphere(zr) === !1) return;
    Ph.copy(s).invert(), hl.copy(t.ray).applyMatrix4(Ph);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = n.index, d = n.attributes.position;
    if (c !== null) {
      const u = Math.max(0, o.start), f = Math.min(c.count, o.start + o.count);
      for (let g = u, v = f; g < v; g++) {
        const p = c.getX(g);
        Hr.fromBufferAttribute(d, p), Lh(Hr, p, l, s, t, e, this);
      }
    } else {
      const u = Math.max(0, o.start), f = Math.min(d.count, o.start + o.count);
      for (let g = u, v = f; g < v; g++)
        Hr.fromBufferAttribute(d, g), Lh(Hr, g, l, s, t, e, this);
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const s = e[n[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = s.length; r < o; r++) {
          const a = s[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
}
function Lh(i, t, e, n, s, r, o) {
  const a = hl.distanceSqToPoint(i);
  if (a < e) {
    const l = new P();
    hl.closestPointToPoint(i, l), l.applyMatrix4(n);
    const c = s.ray.origin.distanceTo(l);
    if (c < s.near || c > s.far) return;
    r.push({
      distance: c,
      distanceToRay: Math.sqrt(a),
      point: l,
      index: t,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: o
    });
  }
}
class hu extends Ce {
  constructor(t, e, n, s, r, o, a, l, c) {
    super(t, e, n, s, r, o, a, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class wn {
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200;
  }
  // Virtual base class method to overwrite and implement in subclasses
  //	- t [0 .. 1]
  getPoint() {
    return console.warn("THREE.Curve: .getPoint() not implemented."), null;
  }
  // Get point at relative position in curve according to arc length
  // - u [0 .. 1]
  getPointAt(t, e) {
    const n = this.getUtoTmapping(t);
    return this.getPoint(n, e);
  }
  // Get sequence of points using getPoint( t )
  getPoints(t = 5) {
    const e = [];
    for (let n = 0; n <= t; n++)
      e.push(this.getPoint(n / t));
    return e;
  }
  // Get sequence of points using getPointAt( u )
  getSpacedPoints(t = 5) {
    const e = [];
    for (let n = 0; n <= t; n++)
      e.push(this.getPointAt(n / t));
    return e;
  }
  // Get total curve arc length
  getLength() {
    const t = this.getLengths();
    return t[t.length - 1];
  }
  // Get list of cumulative segment lengths
  getLengths(t = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === t + 1 && !this.needsUpdate)
      return this.cacheArcLengths;
    this.needsUpdate = !1;
    const e = [];
    let n, s = this.getPoint(0), r = 0;
    e.push(0);
    for (let o = 1; o <= t; o++)
      n = this.getPoint(o / t), r += n.distanceTo(s), e.push(r), s = n;
    return this.cacheArcLengths = e, e;
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.getLengths();
  }
  // Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant
  getUtoTmapping(t, e) {
    const n = this.getLengths();
    let s = 0;
    const r = n.length;
    let o;
    e ? o = e : o = t * n[r - 1];
    let a = 0, l = r - 1, c;
    for (; a <= l; )
      if (s = Math.floor(a + (l - a) / 2), c = n[s] - o, c < 0)
        a = s + 1;
      else if (c > 0)
        l = s - 1;
      else {
        l = s;
        break;
      }
    if (s = l, n[s] === o)
      return s / (r - 1);
    const h = n[s], u = n[s + 1] - h, f = (o - h) / u;
    return (s + f) / (r - 1);
  }
  // Returns a unit vector tangent at t
  // In case any sub curve does not implement its tangent derivation,
  // 2 points a small delta apart will be used to find its gradient
  // which seems to give a reasonable approximation
  getTangent(t, e) {
    let s = t - 1e-4, r = t + 1e-4;
    s < 0 && (s = 0), r > 1 && (r = 1);
    const o = this.getPoint(s), a = this.getPoint(r), l = e || (o.isVector2 ? new nt() : new P());
    return l.copy(a).sub(o).normalize(), l;
  }
  getTangentAt(t, e) {
    const n = this.getUtoTmapping(t);
    return this.getTangent(n, e);
  }
  computeFrenetFrames(t, e) {
    const n = new P(), s = [], r = [], o = [], a = new P(), l = new Ft();
    for (let f = 0; f <= t; f++) {
      const g = f / t;
      s[f] = this.getTangentAt(g, new P());
    }
    r[0] = new P(), o[0] = new P();
    let c = Number.MAX_VALUE;
    const h = Math.abs(s[0].x), d = Math.abs(s[0].y), u = Math.abs(s[0].z);
    h <= c && (c = h, n.set(1, 0, 0)), d <= c && (c = d, n.set(0, 1, 0)), u <= c && n.set(0, 0, 1), a.crossVectors(s[0], n).normalize(), r[0].crossVectors(s[0], a), o[0].crossVectors(s[0], r[0]);
    for (let f = 1; f <= t; f++) {
      if (r[f] = r[f - 1].clone(), o[f] = o[f - 1].clone(), a.crossVectors(s[f - 1], s[f]), a.length() > Number.EPSILON) {
        a.normalize();
        const g = Math.acos(Re(s[f - 1].dot(s[f]), -1, 1));
        r[f].applyMatrix4(l.makeRotationAxis(a, g));
      }
      o[f].crossVectors(s[f], r[f]);
    }
    if (e === !0) {
      let f = Math.acos(Re(r[0].dot(r[t]), -1, 1));
      f /= t, s[0].dot(a.crossVectors(r[0], r[t])) > 0 && (f = -f);
      for (let g = 1; g <= t; g++)
        r[g].applyMatrix4(l.makeRotationAxis(s[g], f * g)), o[g].crossVectors(s[g], r[g]);
    }
    return {
      tangents: s,
      normals: r,
      binormals: o
    };
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.arcLengthDivisions = t.arcLengthDivisions, this;
  }
  toJSON() {
    const t = {
      metadata: {
        version: 4.6,
        type: "Curve",
        generator: "Curve.toJSON"
      }
    };
    return t.arcLengthDivisions = this.arcLengthDivisions, t.type = this.type, t;
  }
  fromJSON(t) {
    return this.arcLengthDivisions = t.arcLengthDivisions, this;
  }
}
class Hl extends wn {
  constructor(t = 0, e = 0, n = 1, s = 1, r = 0, o = Math.PI * 2, a = !1, l = 0) {
    super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = t, this.aY = e, this.xRadius = n, this.yRadius = s, this.aStartAngle = r, this.aEndAngle = o, this.aClockwise = a, this.aRotation = l;
  }
  getPoint(t, e = new nt()) {
    const n = e, s = Math.PI * 2;
    let r = this.aEndAngle - this.aStartAngle;
    const o = Math.abs(r) < Number.EPSILON;
    for (; r < 0; ) r += s;
    for (; r > s; ) r -= s;
    r < Number.EPSILON && (o ? r = 0 : r = s), this.aClockwise === !0 && !o && (r === s ? r = -s : r = r - s);
    const a = this.aStartAngle + t * r;
    let l = this.aX + this.xRadius * Math.cos(a), c = this.aY + this.yRadius * Math.sin(a);
    if (this.aRotation !== 0) {
      const h = Math.cos(this.aRotation), d = Math.sin(this.aRotation), u = l - this.aX, f = c - this.aY;
      l = u * h - f * d + this.aX, c = u * d + f * h + this.aY;
    }
    return n.set(l, c);
  }
  copy(t) {
    return super.copy(t), this.aX = t.aX, this.aY = t.aY, this.xRadius = t.xRadius, this.yRadius = t.yRadius, this.aStartAngle = t.aStartAngle, this.aEndAngle = t.aEndAngle, this.aClockwise = t.aClockwise, this.aRotation = t.aRotation, this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.aX = this.aX, t.aY = this.aY, t.xRadius = this.xRadius, t.yRadius = this.yRadius, t.aStartAngle = this.aStartAngle, t.aEndAngle = this.aEndAngle, t.aClockwise = this.aClockwise, t.aRotation = this.aRotation, t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.aX = t.aX, this.aY = t.aY, this.xRadius = t.xRadius, this.yRadius = t.yRadius, this.aStartAngle = t.aStartAngle, this.aEndAngle = t.aEndAngle, this.aClockwise = t.aClockwise, this.aRotation = t.aRotation, this;
  }
}
class kv extends Hl {
  constructor(t, e, n, s, r, o) {
    super(t, e, n, n, s, r, o), this.isArcCurve = !0, this.type = "ArcCurve";
  }
}
function Gl() {
  let i = 0, t = 0, e = 0, n = 0;
  function s(r, o, a, l) {
    i = r, t = a, e = -3 * r + 3 * o - 2 * a - l, n = 2 * r - 2 * o + a + l;
  }
  return {
    initCatmullRom: function(r, o, a, l, c) {
      s(o, a, c * (a - r), c * (l - o));
    },
    initNonuniformCatmullRom: function(r, o, a, l, c, h, d) {
      let u = (o - r) / c - (a - r) / (c + h) + (a - o) / h, f = (a - o) / h - (l - o) / (h + d) + (l - a) / d;
      u *= h, f *= h, s(o, a, u, f);
    },
    calc: function(r) {
      const o = r * r, a = o * r;
      return i + t * r + e * o + n * a;
    }
  };
}
const Gr = /* @__PURE__ */ new P(), da = /* @__PURE__ */ new Gl(), ua = /* @__PURE__ */ new Gl(), fa = /* @__PURE__ */ new Gl();
class zv extends wn {
  constructor(t = [], e = !1, n = "centripetal", s = 0.5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = t, this.closed = e, this.curveType = n, this.tension = s;
  }
  getPoint(t, e = new P()) {
    const n = e, s = this.points, r = s.length, o = (r - (this.closed ? 0 : 1)) * t;
    let a = Math.floor(o), l = o - a;
    this.closed ? a += a > 0 ? 0 : (Math.floor(Math.abs(a) / r) + 1) * r : l === 0 && a === r - 1 && (a = r - 2, l = 1);
    let c, h;
    this.closed || a > 0 ? c = s[(a - 1) % r] : (Gr.subVectors(s[0], s[1]).add(s[0]), c = Gr);
    const d = s[a % r], u = s[(a + 1) % r];
    if (this.closed || a + 2 < r ? h = s[(a + 2) % r] : (Gr.subVectors(s[r - 1], s[r - 2]).add(s[r - 1]), h = Gr), this.curveType === "centripetal" || this.curveType === "chordal") {
      const f = this.curveType === "chordal" ? 0.5 : 0.25;
      let g = Math.pow(c.distanceToSquared(d), f), v = Math.pow(d.distanceToSquared(u), f), p = Math.pow(u.distanceToSquared(h), f);
      v < 1e-4 && (v = 1), g < 1e-4 && (g = v), p < 1e-4 && (p = v), da.initNonuniformCatmullRom(c.x, d.x, u.x, h.x, g, v, p), ua.initNonuniformCatmullRom(c.y, d.y, u.y, h.y, g, v, p), fa.initNonuniformCatmullRom(c.z, d.z, u.z, h.z, g, v, p);
    } else this.curveType === "catmullrom" && (da.initCatmullRom(c.x, d.x, u.x, h.x, this.tension), ua.initCatmullRom(c.y, d.y, u.y, h.y, this.tension), fa.initCatmullRom(c.z, d.z, u.z, h.z, this.tension));
    return n.set(
      da.calc(l),
      ua.calc(l),
      fa.calc(l)
    ), n;
  }
  copy(t) {
    super.copy(t), this.points = [];
    for (let e = 0, n = t.points.length; e < n; e++) {
      const s = t.points[e];
      this.points.push(s.clone());
    }
    return this.closed = t.closed, this.curveType = t.curveType, this.tension = t.tension, this;
  }
  toJSON() {
    const t = super.toJSON();
    t.points = [];
    for (let e = 0, n = this.points.length; e < n; e++) {
      const s = this.points[e];
      t.points.push(s.toArray());
    }
    return t.closed = this.closed, t.curveType = this.curveType, t.tension = this.tension, t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.points = [];
    for (let e = 0, n = t.points.length; e < n; e++) {
      const s = t.points[e];
      this.points.push(new P().fromArray(s));
    }
    return this.closed = t.closed, this.curveType = t.curveType, this.tension = t.tension, this;
  }
}
function Ih(i, t, e, n, s) {
  const r = (n - t) * 0.5, o = (s - e) * 0.5, a = i * i, l = i * a;
  return (2 * e - 2 * n + r + o) * l + (-3 * e + 3 * n - 2 * r - o) * a + r * i + e;
}
function Hv(i, t) {
  const e = 1 - i;
  return e * e * t;
}
function Gv(i, t) {
  return 2 * (1 - i) * i * t;
}
function Vv(i, t) {
  return i * i * t;
}
function Gs(i, t, e, n) {
  return Hv(i, t) + Gv(i, e) + Vv(i, n);
}
function Wv(i, t) {
  const e = 1 - i;
  return e * e * e * t;
}
function $v(i, t) {
  const e = 1 - i;
  return 3 * e * e * i * t;
}
function Xv(i, t) {
  return 3 * (1 - i) * i * i * t;
}
function jv(i, t) {
  return i * i * i * t;
}
function Vs(i, t, e, n, s) {
  return Wv(i, t) + $v(i, e) + Xv(i, n) + jv(i, s);
}
class du extends wn {
  constructor(t = new nt(), e = new nt(), n = new nt(), s = new nt()) {
    super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = t, this.v1 = e, this.v2 = n, this.v3 = s;
  }
  getPoint(t, e = new nt()) {
    const n = e, s = this.v0, r = this.v1, o = this.v2, a = this.v3;
    return n.set(
      Vs(t, s.x, r.x, o.x, a.x),
      Vs(t, s.y, r.y, o.y, a.y)
    ), n;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this.v3.copy(t.v3), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t.v3 = this.v3.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this.v3.fromArray(t.v3), this;
  }
}
class Kv extends wn {
  constructor(t = new P(), e = new P(), n = new P(), s = new P()) {
    super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = t, this.v1 = e, this.v2 = n, this.v3 = s;
  }
  getPoint(t, e = new P()) {
    const n = e, s = this.v0, r = this.v1, o = this.v2, a = this.v3;
    return n.set(
      Vs(t, s.x, r.x, o.x, a.x),
      Vs(t, s.y, r.y, o.y, a.y),
      Vs(t, s.z, r.z, o.z, a.z)
    ), n;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this.v3.copy(t.v3), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t.v3 = this.v3.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this.v3.fromArray(t.v3), this;
  }
}
class uu extends wn {
  constructor(t = new nt(), e = new nt()) {
    super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = t, this.v2 = e;
  }
  getPoint(t, e = new nt()) {
    const n = e;
    return t === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(t).add(this.v1)), n;
  }
  // Line curve is linear, so we can overwrite default getPointAt
  getPointAt(t, e) {
    return this.getPoint(t, e);
  }
  getTangent(t, e = new nt()) {
    return e.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(t, e) {
    return this.getTangent(t, e);
  }
  copy(t) {
    return super.copy(t), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
}
class qv extends wn {
  constructor(t = new P(), e = new P()) {
    super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = t, this.v2 = e;
  }
  getPoint(t, e = new P()) {
    const n = e;
    return t === 1 ? n.copy(this.v2) : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(t).add(this.v1)), n;
  }
  // Line curve is linear, so we can overwrite default getPointAt
  getPointAt(t, e) {
    return this.getPoint(t, e);
  }
  getTangent(t, e = new P()) {
    return e.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(t, e) {
    return this.getTangent(t, e);
  }
  copy(t) {
    return super.copy(t), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
}
class fu extends wn {
  constructor(t = new nt(), e = new nt(), n = new nt()) {
    super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = t, this.v1 = e, this.v2 = n;
  }
  getPoint(t, e = new nt()) {
    const n = e, s = this.v0, r = this.v1, o = this.v2;
    return n.set(
      Gs(t, s.x, r.x, o.x),
      Gs(t, s.y, r.y, o.y)
    ), n;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
}
class Yv extends wn {
  constructor(t = new P(), e = new P(), n = new P()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = t, this.v1 = e, this.v2 = n;
  }
  getPoint(t, e = new P()) {
    const n = e, s = this.v0, r = this.v1, o = this.v2;
    return n.set(
      Gs(t, s.x, r.x, o.x),
      Gs(t, s.y, r.y, o.y),
      Gs(t, s.z, r.z, o.z)
    ), n;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
}
class pu extends wn {
  constructor(t = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = t;
  }
  getPoint(t, e = new nt()) {
    const n = e, s = this.points, r = (s.length - 1) * t, o = Math.floor(r), a = r - o, l = s[o === 0 ? o : o - 1], c = s[o], h = s[o > s.length - 2 ? s.length - 1 : o + 1], d = s[o > s.length - 3 ? s.length - 1 : o + 2];
    return n.set(
      Ih(a, l.x, c.x, h.x, d.x),
      Ih(a, l.y, c.y, h.y, d.y)
    ), n;
  }
  copy(t) {
    super.copy(t), this.points = [];
    for (let e = 0, n = t.points.length; e < n; e++) {
      const s = t.points[e];
      this.points.push(s.clone());
    }
    return this;
  }
  toJSON() {
    const t = super.toJSON();
    t.points = [];
    for (let e = 0, n = this.points.length; e < n; e++) {
      const s = this.points[e];
      t.points.push(s.toArray());
    }
    return t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.points = [];
    for (let e = 0, n = t.points.length; e < n; e++) {
      const s = t.points[e];
      this.points.push(new nt().fromArray(s));
    }
    return this;
  }
}
var Dh = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcCurve: kv,
  CatmullRomCurve3: zv,
  CubicBezierCurve: du,
  CubicBezierCurve3: Kv,
  EllipseCurve: Hl,
  LineCurve: uu,
  LineCurve3: qv,
  QuadraticBezierCurve: fu,
  QuadraticBezierCurve3: Yv,
  SplineCurve: pu
});
class Zv extends wn {
  constructor() {
    super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1;
  }
  add(t) {
    this.curves.push(t);
  }
  closePath() {
    const t = this.curves[0].getPoint(0), e = this.curves[this.curves.length - 1].getPoint(1);
    if (!t.equals(e)) {
      const n = t.isVector2 === !0 ? "LineCurve" : "LineCurve3";
      this.curves.push(new Dh[n](e, t));
    }
    return this;
  }
  // To get accurate point with reference to
  // entire path distance at time t,
  // following has to be done:
  // 1. Length of each sub path have to be known
  // 2. Locate and identify type of curve
  // 3. Get t for the curve
  // 4. Return curve.getPointAt(t')
  getPoint(t, e) {
    const n = t * this.getLength(), s = this.getCurveLengths();
    let r = 0;
    for (; r < s.length; ) {
      if (s[r] >= n) {
        const o = s[r] - n, a = this.curves[r], l = a.getLength(), c = l === 0 ? 0 : 1 - o / l;
        return a.getPointAt(c, e);
      }
      r++;
    }
    return null;
  }
  // We cannot use the default THREE.Curve getPoint() with getLength() because in
  // THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
  // getPoint() depends on getLength
  getLength() {
    const t = this.getCurveLengths();
    return t[t.length - 1];
  }
  // cacheLengths must be recalculated.
  updateArcLengths() {
    this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths();
  }
  // Compute lengths and cache them
  // We cannot overwrite getLengths() because UtoT mapping uses it.
  getCurveLengths() {
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length)
      return this.cacheLengths;
    const t = [];
    let e = 0;
    for (let n = 0, s = this.curves.length; n < s; n++)
      e += this.curves[n].getLength(), t.push(e);
    return this.cacheLengths = t, t;
  }
  getSpacedPoints(t = 40) {
    const e = [];
    for (let n = 0; n <= t; n++)
      e.push(this.getPoint(n / t));
    return this.autoClose && e.push(e[0]), e;
  }
  getPoints(t = 12) {
    const e = [];
    let n;
    for (let s = 0, r = this.curves; s < r.length; s++) {
      const o = r[s], a = o.isEllipseCurve ? t * 2 : o.isLineCurve || o.isLineCurve3 ? 1 : o.isSplineCurve ? t * o.points.length : t, l = o.getPoints(a);
      for (let c = 0; c < l.length; c++) {
        const h = l[c];
        n && n.equals(h) || (e.push(h), n = h);
      }
    }
    return this.autoClose && e.length > 1 && !e[e.length - 1].equals(e[0]) && e.push(e[0]), e;
  }
  copy(t) {
    super.copy(t), this.curves = [];
    for (let e = 0, n = t.curves.length; e < n; e++) {
      const s = t.curves[e];
      this.curves.push(s.clone());
    }
    return this.autoClose = t.autoClose, this;
  }
  toJSON() {
    const t = super.toJSON();
    t.autoClose = this.autoClose, t.curves = [];
    for (let e = 0, n = this.curves.length; e < n; e++) {
      const s = this.curves[e];
      t.curves.push(s.toJSON());
    }
    return t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.autoClose = t.autoClose, this.curves = [];
    for (let e = 0, n = t.curves.length; e < n; e++) {
      const s = t.curves[e];
      this.curves.push(new Dh[s.type]().fromJSON(s));
    }
    return this;
  }
}
class Nh extends Zv {
  constructor(t) {
    super(), this.type = "Path", this.currentPoint = new nt(), t && this.setFromPoints(t);
  }
  setFromPoints(t) {
    this.moveTo(t[0].x, t[0].y);
    for (let e = 1, n = t.length; e < n; e++)
      this.lineTo(t[e].x, t[e].y);
    return this;
  }
  moveTo(t, e) {
    return this.currentPoint.set(t, e), this;
  }
  lineTo(t, e) {
    const n = new uu(this.currentPoint.clone(), new nt(t, e));
    return this.curves.push(n), this.currentPoint.set(t, e), this;
  }
  quadraticCurveTo(t, e, n, s) {
    const r = new fu(
      this.currentPoint.clone(),
      new nt(t, e),
      new nt(n, s)
    );
    return this.curves.push(r), this.currentPoint.set(n, s), this;
  }
  bezierCurveTo(t, e, n, s, r, o) {
    const a = new du(
      this.currentPoint.clone(),
      new nt(t, e),
      new nt(n, s),
      new nt(r, o)
    );
    return this.curves.push(a), this.currentPoint.set(r, o), this;
  }
  splineThru(t) {
    const e = [this.currentPoint.clone()].concat(t), n = new pu(e);
    return this.curves.push(n), this.currentPoint.copy(t[t.length - 1]), this;
  }
  arc(t, e, n, s, r, o) {
    const a = this.currentPoint.x, l = this.currentPoint.y;
    return this.absarc(
      t + a,
      e + l,
      n,
      s,
      r,
      o
    ), this;
  }
  absarc(t, e, n, s, r, o) {
    return this.absellipse(t, e, n, n, s, r, o), this;
  }
  ellipse(t, e, n, s, r, o, a, l) {
    const c = this.currentPoint.x, h = this.currentPoint.y;
    return this.absellipse(t + c, e + h, n, s, r, o, a, l), this;
  }
  absellipse(t, e, n, s, r, o, a, l) {
    const c = new Hl(t, e, n, s, r, o, a, l);
    if (this.curves.length > 0) {
      const d = c.getPoint(0);
      d.equals(this.currentPoint) || this.lineTo(d.x, d.y);
    }
    this.curves.push(c);
    const h = c.getPoint(1);
    return this.currentPoint.copy(h), this;
  }
  copy(t) {
    return super.copy(t), this.currentPoint.copy(t.currentPoint), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.currentPoint = this.currentPoint.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.currentPoint.fromArray(t.currentPoint), this;
  }
}
class Vl extends Ie {
  constructor(t = 1, e = 32, n = 0, s = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = {
      radius: t,
      segments: e,
      thetaStart: n,
      thetaLength: s
    }, e = Math.max(3, e);
    const r = [], o = [], a = [], l = [], c = new P(), h = new nt();
    o.push(0, 0, 0), a.push(0, 0, 1), l.push(0.5, 0.5);
    for (let d = 0, u = 3; d <= e; d++, u += 3) {
      const f = n + d / e * s;
      c.x = t * Math.cos(f), c.y = t * Math.sin(f), o.push(c.x, c.y, c.z), a.push(0, 0, 1), h.x = (o[u] / t + 1) / 2, h.y = (o[u + 1] / t + 1) / 2, l.push(h.x, h.y);
    }
    for (let d = 1; d <= e; d++)
      r.push(d, d + 1, 0);
    this.setIndex(r), this.setAttribute("position", new ue(o, 3)), this.setAttribute("normal", new ue(a, 3)), this.setAttribute("uv", new ue(l, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Vl(t.radius, t.segments, t.thetaStart, t.thetaLength);
  }
}
class Wl extends Ie {
  constructor(t = 1, e = 1, n = 1, s = 32, r = 1, o = !1, a = 0, l = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: t,
      radiusBottom: e,
      height: n,
      radialSegments: s,
      heightSegments: r,
      openEnded: o,
      thetaStart: a,
      thetaLength: l
    };
    const c = this;
    s = Math.floor(s), r = Math.floor(r);
    const h = [], d = [], u = [], f = [];
    let g = 0;
    const v = [], p = n / 2;
    let m = 0;
    x(), o === !1 && (t > 0 && _(!0), e > 0 && _(!1)), this.setIndex(h), this.setAttribute("position", new ue(d, 3)), this.setAttribute("normal", new ue(u, 3)), this.setAttribute("uv", new ue(f, 2));
    function x() {
      const M = new P(), L = new P();
      let T = 0;
      const w = (e - t) / n;
      for (let R = 0; R <= r; R++) {
        const F = [], y = R / r, S = y * (e - t) + t;
        for (let N = 0; N <= s; N++) {
          const k = N / s, G = k * l + a, q = Math.sin(G), W = Math.cos(G);
          L.x = S * q, L.y = -y * n + p, L.z = S * W, d.push(L.x, L.y, L.z), M.set(q, w, W).normalize(), u.push(M.x, M.y, M.z), f.push(k, 1 - y), F.push(g++);
        }
        v.push(F);
      }
      for (let R = 0; R < s; R++)
        for (let F = 0; F < r; F++) {
          const y = v[F][R], S = v[F + 1][R], N = v[F + 1][R + 1], k = v[F][R + 1];
          t > 0 && (h.push(y, S, k), T += 3), e > 0 && (h.push(S, N, k), T += 3);
        }
      c.addGroup(m, T, 0), m += T;
    }
    function _(M) {
      const L = g, T = new nt(), w = new P();
      let R = 0;
      const F = M === !0 ? t : e, y = M === !0 ? 1 : -1;
      for (let N = 1; N <= s; N++)
        d.push(0, p * y, 0), u.push(0, y, 0), f.push(0.5, 0.5), g++;
      const S = g;
      for (let N = 0; N <= s; N++) {
        const G = N / s * l + a, q = Math.cos(G), W = Math.sin(G);
        w.x = F * W, w.y = p * y, w.z = F * q, d.push(w.x, w.y, w.z), u.push(0, y, 0), T.x = q * 0.5 + 0.5, T.y = W * 0.5 * y + 0.5, f.push(T.x, T.y), g++;
      }
      for (let N = 0; N < s; N++) {
        const k = L + N, G = S + N;
        M === !0 ? h.push(G, G + 1, k) : h.push(G + 1, G, k), R += 3;
      }
      c.addGroup(m, R, M === !0 ? 1 : 2), m += R;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Wl(t.radiusTop, t.radiusBottom, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
}
class $l extends Ie {
  constructor(t = [], e = [], n = 1, s = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = {
      vertices: t,
      indices: e,
      radius: n,
      detail: s
    };
    const r = [], o = [];
    a(s), c(n), h(), this.setAttribute("position", new ue(r, 3)), this.setAttribute("normal", new ue(r.slice(), 3)), this.setAttribute("uv", new ue(o, 2)), s === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function a(x) {
      const _ = new P(), M = new P(), L = new P();
      for (let T = 0; T < e.length; T += 3)
        f(e[T + 0], _), f(e[T + 1], M), f(e[T + 2], L), l(_, M, L, x);
    }
    function l(x, _, M, L) {
      const T = L + 1, w = [];
      for (let R = 0; R <= T; R++) {
        w[R] = [];
        const F = x.clone().lerp(M, R / T), y = _.clone().lerp(M, R / T), S = T - R;
        for (let N = 0; N <= S; N++)
          N === 0 && R === T ? w[R][N] = F : w[R][N] = F.clone().lerp(y, N / S);
      }
      for (let R = 0; R < T; R++)
        for (let F = 0; F < 2 * (T - R) - 1; F++) {
          const y = Math.floor(F / 2);
          F % 2 === 0 ? (u(w[R][y + 1]), u(w[R + 1][y]), u(w[R][y])) : (u(w[R][y + 1]), u(w[R + 1][y + 1]), u(w[R + 1][y]));
        }
    }
    function c(x) {
      const _ = new P();
      for (let M = 0; M < r.length; M += 3)
        _.x = r[M + 0], _.y = r[M + 1], _.z = r[M + 2], _.normalize().multiplyScalar(x), r[M + 0] = _.x, r[M + 1] = _.y, r[M + 2] = _.z;
    }
    function h() {
      const x = new P();
      for (let _ = 0; _ < r.length; _ += 3) {
        x.x = r[_ + 0], x.y = r[_ + 1], x.z = r[_ + 2];
        const M = p(x) / 2 / Math.PI + 0.5, L = m(x) / Math.PI + 0.5;
        o.push(M, 1 - L);
      }
      g(), d();
    }
    function d() {
      for (let x = 0; x < o.length; x += 6) {
        const _ = o[x + 0], M = o[x + 2], L = o[x + 4], T = Math.max(_, M, L), w = Math.min(_, M, L);
        T > 0.9 && w < 0.1 && (_ < 0.2 && (o[x + 0] += 1), M < 0.2 && (o[x + 2] += 1), L < 0.2 && (o[x + 4] += 1));
      }
    }
    function u(x) {
      r.push(x.x, x.y, x.z);
    }
    function f(x, _) {
      const M = x * 3;
      _.x = t[M + 0], _.y = t[M + 1], _.z = t[M + 2];
    }
    function g() {
      const x = new P(), _ = new P(), M = new P(), L = new P(), T = new nt(), w = new nt(), R = new nt();
      for (let F = 0, y = 0; F < r.length; F += 9, y += 6) {
        x.set(r[F + 0], r[F + 1], r[F + 2]), _.set(r[F + 3], r[F + 4], r[F + 5]), M.set(r[F + 6], r[F + 7], r[F + 8]), T.set(o[y + 0], o[y + 1]), w.set(o[y + 2], o[y + 3]), R.set(o[y + 4], o[y + 5]), L.copy(x).add(_).add(M).divideScalar(3);
        const S = p(L);
        v(T, y + 0, x, S), v(w, y + 2, _, S), v(R, y + 4, M, S);
      }
    }
    function v(x, _, M, L) {
      L < 0 && x.x === 1 && (o[_] = x.x - 1), M.x === 0 && M.z === 0 && (o[_] = L / 2 / Math.PI + 0.5);
    }
    function p(x) {
      return Math.atan2(x.z, -x.x);
    }
    function m(x) {
      return Math.atan2(-x.y, Math.sqrt(x.x * x.x + x.z * x.z));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new $l(t.vertices, t.indices, t.radius, t.details);
  }
}
class mu extends Nh {
  constructor(t) {
    super(t), this.uuid = cn(), this.type = "Shape", this.holes = [];
  }
  getPointsHoles(t) {
    const e = [];
    for (let n = 0, s = this.holes.length; n < s; n++)
      e[n] = this.holes[n].getPoints(t);
    return e;
  }
  // get points of shape and holes (keypoints based on segments parameter)
  extractPoints(t) {
    return {
      shape: this.getPoints(t),
      holes: this.getPointsHoles(t)
    };
  }
  copy(t) {
    super.copy(t), this.holes = [];
    for (let e = 0, n = t.holes.length; e < n; e++) {
      const s = t.holes[e];
      this.holes.push(s.clone());
    }
    return this;
  }
  toJSON() {
    const t = super.toJSON();
    t.uuid = this.uuid, t.holes = [];
    for (let e = 0, n = this.holes.length; e < n; e++) {
      const s = this.holes[e];
      t.holes.push(s.toJSON());
    }
    return t;
  }
  fromJSON(t) {
    super.fromJSON(t), this.uuid = t.uuid, this.holes = [];
    for (let e = 0, n = t.holes.length; e < n; e++) {
      const s = t.holes[e];
      this.holes.push(new Nh().fromJSON(s));
    }
    return this;
  }
}
const Jv = {
  triangulate: function(i, t, e = 2) {
    const n = t && t.length, s = n ? t[0] * e : i.length;
    let r = gu(i, 0, s, e, !0);
    const o = [];
    if (!r || r.next === r.prev) return o;
    let a, l, c, h, d, u, f;
    if (n && (r = ix(i, t, r, e)), i.length > 80 * e) {
      a = c = i[0], l = h = i[1];
      for (let g = e; g < s; g += e)
        d = i[g], u = i[g + 1], d < a && (a = d), u < l && (l = u), d > c && (c = d), u > h && (h = u);
      f = Math.max(c - a, h - l), f = f !== 0 ? 32767 / f : 0;
    }
    return tr(r, o, e, a, l, f, 0), o;
  }
};
function gu(i, t, e, n, s) {
  let r, o;
  if (s === px(i, t, e, n) > 0)
    for (r = t; r < e; r += n) o = Uh(r, i[r], i[r + 1], o);
  else
    for (r = e - n; r >= t; r -= n) o = Uh(r, i[r], i[r + 1], o);
  return o && To(o, o.next) && (nr(o), o = o.next), o;
}
function wi(i, t) {
  if (!i) return i;
  t || (t = i);
  let e = i, n;
  do
    if (n = !1, !e.steiner && (To(e, e.next) || Me(e.prev, e, e.next) === 0)) {
      if (nr(e), e = t = e.prev, e === e.next) break;
      n = !0;
    } else
      e = e.next;
  while (n || e !== t);
  return t;
}
function tr(i, t, e, n, s, r, o) {
  if (!i) return;
  !o && r && lx(i, n, s, r);
  let a = i, l, c;
  for (; i.prev !== i.next; ) {
    if (l = i.prev, c = i.next, r ? tx(i, n, s, r) : Qv(i)) {
      t.push(l.i / e | 0), t.push(i.i / e | 0), t.push(c.i / e | 0), nr(i), i = c.next, a = c.next;
      continue;
    }
    if (i = c, i === a) {
      o ? o === 1 ? (i = ex(wi(i), t, e), tr(i, t, e, n, s, r, 2)) : o === 2 && nx(i, t, e, n, s, r) : tr(wi(i), t, e, n, s, r, 1);
      break;
    }
  }
}
function Qv(i) {
  const t = i.prev, e = i, n = i.next;
  if (Me(t, e, n) >= 0) return !1;
  const s = t.x, r = e.x, o = n.x, a = t.y, l = e.y, c = n.y, h = s < r ? s < o ? s : o : r < o ? r : o, d = a < l ? a < c ? a : c : l < c ? l : c, u = s > r ? s > o ? s : o : r > o ? r : o, f = a > l ? a > c ? a : c : l > c ? l : c;
  let g = n.next;
  for (; g !== t; ) {
    if (g.x >= h && g.x <= u && g.y >= d && g.y <= f && Yi(s, a, r, l, o, c, g.x, g.y) && Me(g.prev, g, g.next) >= 0) return !1;
    g = g.next;
  }
  return !0;
}
function tx(i, t, e, n) {
  const s = i.prev, r = i, o = i.next;
  if (Me(s, r, o) >= 0) return !1;
  const a = s.x, l = r.x, c = o.x, h = s.y, d = r.y, u = o.y, f = a < l ? a < c ? a : c : l < c ? l : c, g = h < d ? h < u ? h : u : d < u ? d : u, v = a > l ? a > c ? a : c : l > c ? l : c, p = h > d ? h > u ? h : u : d > u ? d : u, m = dl(f, g, t, e, n), x = dl(v, p, t, e, n);
  let _ = i.prevZ, M = i.nextZ;
  for (; _ && _.z >= m && M && M.z <= x; ) {
    if (_.x >= f && _.x <= v && _.y >= g && _.y <= p && _ !== s && _ !== o && Yi(a, h, l, d, c, u, _.x, _.y) && Me(_.prev, _, _.next) >= 0 || (_ = _.prevZ, M.x >= f && M.x <= v && M.y >= g && M.y <= p && M !== s && M !== o && Yi(a, h, l, d, c, u, M.x, M.y) && Me(M.prev, M, M.next) >= 0)) return !1;
    M = M.nextZ;
  }
  for (; _ && _.z >= m; ) {
    if (_.x >= f && _.x <= v && _.y >= g && _.y <= p && _ !== s && _ !== o && Yi(a, h, l, d, c, u, _.x, _.y) && Me(_.prev, _, _.next) >= 0) return !1;
    _ = _.prevZ;
  }
  for (; M && M.z <= x; ) {
    if (M.x >= f && M.x <= v && M.y >= g && M.y <= p && M !== s && M !== o && Yi(a, h, l, d, c, u, M.x, M.y) && Me(M.prev, M, M.next) >= 0) return !1;
    M = M.nextZ;
  }
  return !0;
}
function ex(i, t, e) {
  let n = i;
  do {
    const s = n.prev, r = n.next.next;
    !To(s, r) && _u(s, n, n.next, r) && er(s, r) && er(r, s) && (t.push(s.i / e | 0), t.push(n.i / e | 0), t.push(r.i / e | 0), nr(n), nr(n.next), n = i = r), n = n.next;
  } while (n !== i);
  return wi(n);
}
function nx(i, t, e, n, s, r) {
  let o = i;
  do {
    let a = o.next.next;
    for (; a !== o.prev; ) {
      if (o.i !== a.i && dx(o, a)) {
        let l = vu(o, a);
        o = wi(o, o.next), l = wi(l, l.next), tr(o, t, e, n, s, r, 0), tr(l, t, e, n, s, r, 0);
        return;
      }
      a = a.next;
    }
    o = o.next;
  } while (o !== i);
}
function ix(i, t, e, n) {
  const s = [];
  let r, o, a, l, c;
  for (r = 0, o = t.length; r < o; r++)
    a = t[r] * n, l = r < o - 1 ? t[r + 1] * n : i.length, c = gu(i, a, l, n, !1), c === c.next && (c.steiner = !0), s.push(hx(c));
  for (s.sort(sx), r = 0; r < s.length; r++)
    e = rx(s[r], e);
  return e;
}
function sx(i, t) {
  return i.x - t.x;
}
function rx(i, t) {
  const e = ox(i, t);
  if (!e)
    return t;
  const n = vu(e, i);
  return wi(n, n.next), wi(e, e.next);
}
function ox(i, t) {
  let e = t, n = -1 / 0, s;
  const r = i.x, o = i.y;
  do {
    if (o <= e.y && o >= e.next.y && e.next.y !== e.y) {
      const u = e.x + (o - e.y) * (e.next.x - e.x) / (e.next.y - e.y);
      if (u <= r && u > n && (n = u, s = e.x < e.next.x ? e : e.next, u === r))
        return s;
    }
    e = e.next;
  } while (e !== t);
  if (!s) return null;
  const a = s, l = s.x, c = s.y;
  let h = 1 / 0, d;
  e = s;
  do
    r >= e.x && e.x >= l && r !== e.x && Yi(o < c ? r : n, o, l, c, o < c ? n : r, o, e.x, e.y) && (d = Math.abs(o - e.y) / (r - e.x), er(e, i) && (d < h || d === h && (e.x > s.x || e.x === s.x && ax(s, e))) && (s = e, h = d)), e = e.next;
  while (e !== a);
  return s;
}
function ax(i, t) {
  return Me(i.prev, i, t.prev) < 0 && Me(t.next, i, i.next) < 0;
}
function lx(i, t, e, n) {
  let s = i;
  do
    s.z === 0 && (s.z = dl(s.x, s.y, t, e, n)), s.prevZ = s.prev, s.nextZ = s.next, s = s.next;
  while (s !== i);
  s.prevZ.nextZ = null, s.prevZ = null, cx(s);
}
function cx(i) {
  let t, e, n, s, r, o, a, l, c = 1;
  do {
    for (e = i, i = null, r = null, o = 0; e; ) {
      for (o++, n = e, a = 0, t = 0; t < c && (a++, n = n.nextZ, !!n); t++)
        ;
      for (l = c; a > 0 || l > 0 && n; )
        a !== 0 && (l === 0 || !n || e.z <= n.z) ? (s = e, e = e.nextZ, a--) : (s = n, n = n.nextZ, l--), r ? r.nextZ = s : i = s, s.prevZ = r, r = s;
      e = n;
    }
    r.nextZ = null, c *= 2;
  } while (o > 1);
  return i;
}
function dl(i, t, e, n, s) {
  return i = (i - e) * s | 0, t = (t - n) * s | 0, i = (i | i << 8) & 16711935, i = (i | i << 4) & 252645135, i = (i | i << 2) & 858993459, i = (i | i << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, i | t << 1;
}
function hx(i) {
  let t = i, e = i;
  do
    (t.x < e.x || t.x === e.x && t.y < e.y) && (e = t), t = t.next;
  while (t !== i);
  return e;
}
function Yi(i, t, e, n, s, r, o, a) {
  return (s - o) * (t - a) >= (i - o) * (r - a) && (i - o) * (n - a) >= (e - o) * (t - a) && (e - o) * (r - a) >= (s - o) * (n - a);
}
function dx(i, t) {
  return i.next.i !== t.i && i.prev.i !== t.i && !ux(i, t) && // dones't intersect other edges
  (er(i, t) && er(t, i) && fx(i, t) && // locally visible
  (Me(i.prev, i, t.prev) || Me(i, t.prev, t)) || // does not create opposite-facing sectors
  To(i, t) && Me(i.prev, i, i.next) > 0 && Me(t.prev, t, t.next) > 0);
}
function Me(i, t, e) {
  return (t.y - i.y) * (e.x - t.x) - (t.x - i.x) * (e.y - t.y);
}
function To(i, t) {
  return i.x === t.x && i.y === t.y;
}
function _u(i, t, e, n) {
  const s = Wr(Me(i, t, e)), r = Wr(Me(i, t, n)), o = Wr(Me(e, n, i)), a = Wr(Me(e, n, t));
  return !!(s !== r && o !== a || s === 0 && Vr(i, e, t) || r === 0 && Vr(i, n, t) || o === 0 && Vr(e, i, n) || a === 0 && Vr(e, t, n));
}
function Vr(i, t, e) {
  return t.x <= Math.max(i.x, e.x) && t.x >= Math.min(i.x, e.x) && t.y <= Math.max(i.y, e.y) && t.y >= Math.min(i.y, e.y);
}
function Wr(i) {
  return i > 0 ? 1 : i < 0 ? -1 : 0;
}
function ux(i, t) {
  let e = i;
  do {
    if (e.i !== i.i && e.next.i !== i.i && e.i !== t.i && e.next.i !== t.i && _u(e, e.next, i, t)) return !0;
    e = e.next;
  } while (e !== i);
  return !1;
}
function er(i, t) {
  return Me(i.prev, i, i.next) < 0 ? Me(i, t, i.next) >= 0 && Me(i, i.prev, t) >= 0 : Me(i, t, i.prev) < 0 || Me(i, i.next, t) < 0;
}
function fx(i, t) {
  let e = i, n = !1;
  const s = (i.x + t.x) / 2, r = (i.y + t.y) / 2;
  do
    e.y > r != e.next.y > r && e.next.y !== e.y && s < (e.next.x - e.x) * (r - e.y) / (e.next.y - e.y) + e.x && (n = !n), e = e.next;
  while (e !== i);
  return n;
}
function vu(i, t) {
  const e = new ul(i.i, i.x, i.y), n = new ul(t.i, t.x, t.y), s = i.next, r = t.prev;
  return i.next = t, t.prev = i, e.next = s, s.prev = e, n.next = e, e.prev = n, r.next = n, n.prev = r, n;
}
function Uh(i, t, e, n) {
  const s = new ul(i, t, e);
  return n ? (s.next = n.next, s.prev = n, n.next.prev = s, n.next = s) : (s.prev = s, s.next = s), s;
}
function nr(i) {
  i.next.prev = i.prev, i.prev.next = i.next, i.prevZ && (i.prevZ.nextZ = i.nextZ), i.nextZ && (i.nextZ.prevZ = i.prevZ);
}
function ul(i, t, e) {
  this.i = i, this.x = t, this.y = e, this.prev = null, this.next = null, this.z = 0, this.prevZ = null, this.nextZ = null, this.steiner = !1;
}
function px(i, t, e, n) {
  let s = 0;
  for (let r = t, o = e - n; r < e; r += n)
    s += (i[o] - i[r]) * (i[r + 1] + i[o + 1]), o = r;
  return s;
}
class Ws {
  // calculate area of the contour polygon
  static area(t) {
    const e = t.length;
    let n = 0;
    for (let s = e - 1, r = 0; r < e; s = r++)
      n += t[s].x * t[r].y - t[r].x * t[s].y;
    return n * 0.5;
  }
  static isClockWise(t) {
    return Ws.area(t) < 0;
  }
  static triangulateShape(t, e) {
    const n = [], s = [], r = [];
    Oh(t), Fh(n, t);
    let o = t.length;
    e.forEach(Oh);
    for (let l = 0; l < e.length; l++)
      s.push(o), o += e[l].length, Fh(n, e[l]);
    const a = Jv.triangulate(n, s);
    for (let l = 0; l < a.length; l += 3)
      r.push(a.slice(l, l + 3));
    return r;
  }
}
function Oh(i) {
  const t = i.length;
  t > 2 && i[t - 1].equals(i[0]) && i.pop();
}
function Fh(i, t) {
  for (let e = 0; e < t.length; e++)
    i.push(t[e].x), i.push(t[e].y);
}
class Xl extends $l {
  constructor(t = 1, e = 0) {
    const n = (1 + Math.sqrt(5)) / 2, s = [
      -1,
      n,
      0,
      1,
      n,
      0,
      -1,
      -n,
      0,
      1,
      -n,
      0,
      0,
      -1,
      n,
      0,
      1,
      n,
      0,
      -1,
      -n,
      0,
      1,
      -n,
      n,
      0,
      -1,
      n,
      0,
      1,
      -n,
      0,
      -1,
      -n,
      0,
      1
    ], r = [
      0,
      11,
      5,
      0,
      5,
      1,
      0,
      1,
      7,
      0,
      7,
      10,
      0,
      10,
      11,
      1,
      5,
      9,
      5,
      11,
      4,
      11,
      10,
      2,
      10,
      7,
      6,
      7,
      1,
      8,
      3,
      9,
      4,
      3,
      4,
      2,
      3,
      2,
      6,
      3,
      6,
      8,
      3,
      8,
      9,
      4,
      9,
      5,
      2,
      4,
      11,
      6,
      2,
      10,
      8,
      6,
      7,
      9,
      8,
      1
    ];
    super(s, r, t, e), this.type = "IcosahedronGeometry", this.parameters = {
      radius: t,
      detail: e
    };
  }
  static fromJSON(t) {
    return new Xl(t.radius, t.detail);
  }
}
class jl extends Ie {
  constructor(t = new mu([new nt(0, 0.5), new nt(-0.5, -0.5), new nt(0.5, -0.5)]), e = 12) {
    super(), this.type = "ShapeGeometry", this.parameters = {
      shapes: t,
      curveSegments: e
    };
    const n = [], s = [], r = [], o = [];
    let a = 0, l = 0;
    if (Array.isArray(t) === !1)
      c(t);
    else
      for (let h = 0; h < t.length; h++)
        c(t[h]), this.addGroup(a, l, h), a += l, l = 0;
    this.setIndex(n), this.setAttribute("position", new ue(s, 3)), this.setAttribute("normal", new ue(r, 3)), this.setAttribute("uv", new ue(o, 2));
    function c(h) {
      const d = s.length / 3, u = h.extractPoints(e);
      let f = u.shape;
      const g = u.holes;
      Ws.isClockWise(f) === !1 && (f = f.reverse());
      for (let p = 0, m = g.length; p < m; p++) {
        const x = g[p];
        Ws.isClockWise(x) === !0 && (g[p] = x.reverse());
      }
      const v = Ws.triangulateShape(f, g);
      for (let p = 0, m = g.length; p < m; p++) {
        const x = g[p];
        f = f.concat(x);
      }
      for (let p = 0, m = f.length; p < m; p++) {
        const x = f[p];
        s.push(x.x, x.y, 0), r.push(0, 0, 1), o.push(x.x, x.y);
      }
      for (let p = 0, m = v.length; p < m; p++) {
        const x = v[p], _ = x[0] + d, M = x[1] + d, L = x[2] + d;
        n.push(_, M, L), l += 3;
      }
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    const t = super.toJSON(), e = this.parameters.shapes;
    return mx(e, t);
  }
  static fromJSON(t, e) {
    const n = [];
    for (let s = 0, r = t.shapes.length; s < r; s++) {
      const o = e[t.shapes[s]];
      n.push(o);
    }
    return new jl(n, t.curveSegments);
  }
}
function mx(i, t) {
  if (t.shapes = [], Array.isArray(i))
    for (let e = 0, n = i.length; e < n; e++) {
      const s = i[e];
      t.shapes.push(s.uuid);
    }
  else
    t.shapes.push(i.uuid);
  return t;
}
class ir extends Ie {
  constructor(t = 1, e = 32, n = 16, s = 0, r = Math.PI * 2, o = 0, a = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: t,
      widthSegments: e,
      heightSegments: n,
      phiStart: s,
      phiLength: r,
      thetaStart: o,
      thetaLength: a
    }, e = Math.max(3, Math.floor(e)), n = Math.max(2, Math.floor(n));
    const l = Math.min(o + a, Math.PI);
    let c = 0;
    const h = [], d = new P(), u = new P(), f = [], g = [], v = [], p = [];
    for (let m = 0; m <= n; m++) {
      const x = [], _ = m / n;
      let M = 0;
      m === 0 && o === 0 ? M = 0.5 / e : m === n && l === Math.PI && (M = -0.5 / e);
      for (let L = 0; L <= e; L++) {
        const T = L / e;
        d.x = -t * Math.cos(s + T * r) * Math.sin(o + _ * a), d.y = t * Math.cos(o + _ * a), d.z = t * Math.sin(s + T * r) * Math.sin(o + _ * a), g.push(d.x, d.y, d.z), u.copy(d).normalize(), v.push(u.x, u.y, u.z), p.push(T + M, 1 - _), x.push(c++);
      }
      h.push(x);
    }
    for (let m = 0; m < n; m++)
      for (let x = 0; x < e; x++) {
        const _ = h[m][x + 1], M = h[m][x], L = h[m + 1][x], T = h[m + 1][x + 1];
        (m !== 0 || o > 0) && f.push(_, M, T), (m !== n - 1 || l < Math.PI) && f.push(M, L, T);
      }
    this.setIndex(f), this.setAttribute("position", new ue(g, 3)), this.setAttribute("normal", new ue(v, 3)), this.setAttribute("uv", new ue(p, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new ir(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
  }
}
class go extends Ie {
  constructor(t = 1, e = 0.4, n = 12, s = 48, r = Math.PI * 2) {
    super(), this.type = "TorusGeometry", this.parameters = {
      radius: t,
      tube: e,
      radialSegments: n,
      tubularSegments: s,
      arc: r
    }, n = Math.floor(n), s = Math.floor(s);
    const o = [], a = [], l = [], c = [], h = new P(), d = new P(), u = new P();
    for (let f = 0; f <= n; f++)
      for (let g = 0; g <= s; g++) {
        const v = g / s * r, p = f / n * Math.PI * 2;
        d.x = (t + e * Math.cos(p)) * Math.cos(v), d.y = (t + e * Math.cos(p)) * Math.sin(v), d.z = e * Math.sin(p), a.push(d.x, d.y, d.z), h.x = t * Math.cos(v), h.y = t * Math.sin(v), u.subVectors(d, h).normalize(), l.push(u.x, u.y, u.z), c.push(g / s), c.push(f / n);
      }
    for (let f = 1; f <= n; f++)
      for (let g = 1; g <= s; g++) {
        const v = (s + 1) * f + g - 1, p = (s + 1) * (f - 1) + g - 1, m = (s + 1) * (f - 1) + g, x = (s + 1) * f + g;
        o.push(v, p, x), o.push(p, m, x);
      }
    this.setIndex(o), this.setAttribute("position", new ue(a, 3)), this.setAttribute("normal", new ue(l, 3)), this.setAttribute("uv", new ue(c, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new go(t.radius, t.tube, t.radialSegments, t.tubularSegments, t.arc);
  }
}
class zn extends vn {
  constructor(t) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new Ct(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Ct(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = kd, this.normalScale = new nt(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new bn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.defines = { STANDARD: "" }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
  }
}
class Tn extends zn {
  constructor(t) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new nt(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return Re(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
      },
      set: function(e) {
        this.ior = (1 + 0.4 * e) / (1 - 0.4 * e);
      }
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new Ct(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new Ct(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new Ct(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(t);
  }
  get anisotropy() {
    return this._anisotropy;
  }
  set anisotropy(t) {
    this._anisotropy > 0 != t > 0 && this.version++, this._anisotropy = t;
  }
  get clearcoat() {
    return this._clearcoat;
  }
  set clearcoat(t) {
    this._clearcoat > 0 != t > 0 && this.version++, this._clearcoat = t;
  }
  get iridescence() {
    return this._iridescence;
  }
  set iridescence(t) {
    this._iridescence > 0 != t > 0 && this.version++, this._iridescence = t;
  }
  get dispersion() {
    return this._dispersion;
  }
  set dispersion(t) {
    this._dispersion > 0 != t > 0 && this.version++, this._dispersion = t;
  }
  get sheen() {
    return this._sheen;
  }
  set sheen(t) {
    this._sheen > 0 != t > 0 && this.version++, this._sheen = t;
  }
  get transmission() {
    return this._transmission;
  }
  set transmission(t) {
    this._transmission > 0 != t > 0 && this.version++, this._transmission = t;
  }
  copy(t) {
    return super.copy(t), this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.anisotropy = t.anisotropy, this.anisotropyRotation = t.anisotropyRotation, this.anisotropyMap = t.anisotropyMap, this.clearcoat = t.clearcoat, this.clearcoatMap = t.clearcoatMap, this.clearcoatRoughness = t.clearcoatRoughness, this.clearcoatRoughnessMap = t.clearcoatRoughnessMap, this.clearcoatNormalMap = t.clearcoatNormalMap, this.clearcoatNormalScale.copy(t.clearcoatNormalScale), this.dispersion = t.dispersion, this.ior = t.ior, this.iridescence = t.iridescence, this.iridescenceMap = t.iridescenceMap, this.iridescenceIOR = t.iridescenceIOR, this.iridescenceThicknessRange = [...t.iridescenceThicknessRange], this.iridescenceThicknessMap = t.iridescenceThicknessMap, this.sheen = t.sheen, this.sheenColor.copy(t.sheenColor), this.sheenColorMap = t.sheenColorMap, this.sheenRoughness = t.sheenRoughness, this.sheenRoughnessMap = t.sheenRoughnessMap, this.transmission = t.transmission, this.transmissionMap = t.transmissionMap, this.thickness = t.thickness, this.thicknessMap = t.thicknessMap, this.attenuationDistance = t.attenuationDistance, this.attenuationColor.copy(t.attenuationColor), this.specularIntensity = t.specularIntensity, this.specularIntensityMap = t.specularIntensityMap, this.specularColor.copy(t.specularColor), this.specularColorMap = t.specularColorMap, this;
  }
}
function $r(i, t, e) {
  return !i || // let 'undefined' and 'null' pass
  !e && i.constructor === t ? i : typeof t.BYTES_PER_ELEMENT == "number" ? new t(i) : Array.prototype.slice.call(i);
}
function gx(i) {
  return ArrayBuffer.isView(i) && !(i instanceof DataView);
}
function _x(i) {
  function t(s, r) {
    return i[s] - i[r];
  }
  const e = i.length, n = new Array(e);
  for (let s = 0; s !== e; ++s) n[s] = s;
  return n.sort(t), n;
}
function Bh(i, t, e) {
  const n = i.length, s = new i.constructor(n);
  for (let r = 0, o = 0; o !== n; ++r) {
    const a = e[r] * t;
    for (let l = 0; l !== t; ++l)
      s[o++] = i[a + l];
  }
  return s;
}
function xu(i, t, e, n) {
  let s = 1, r = i[0];
  for (; r !== void 0 && r[n] === void 0; )
    r = i[s++];
  if (r === void 0) return;
  let o = r[n];
  if (o !== void 0)
    if (Array.isArray(o))
      do
        o = r[n], o !== void 0 && (t.push(r.time), e.push.apply(e, o)), r = i[s++];
      while (r !== void 0);
    else if (o.toArray !== void 0)
      do
        o = r[n], o !== void 0 && (t.push(r.time), o.toArray(e, e.length)), r = i[s++];
      while (r !== void 0);
    else
      do
        o = r[n], o !== void 0 && (t.push(r.time), e.push(o)), r = i[s++];
      while (r !== void 0);
}
class lr {
  constructor(t, e, n, s) {
    this.parameterPositions = t, this._cachedIndex = 0, this.resultBuffer = s !== void 0 ? s : new e.constructor(n), this.sampleValues = e, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
  }
  evaluate(t) {
    const e = this.parameterPositions;
    let n = this._cachedIndex, s = e[n], r = e[n - 1];
    n: {
      t: {
        let o;
        e: {
          i: if (!(t < s)) {
            for (let a = n + 2; ; ) {
              if (s === void 0) {
                if (t < r) break i;
                return n = e.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
              }
              if (n === a) break;
              if (r = s, s = e[++n], t < s)
                break t;
            }
            o = e.length;
            break e;
          }
          if (!(t >= r)) {
            const a = e[1];
            t < a && (n = 2, r = a);
            for (let l = n - 2; ; ) {
              if (r === void 0)
                return this._cachedIndex = 0, this.copySampleValue_(0);
              if (n === l) break;
              if (s = r, r = e[--n - 1], t >= r)
                break t;
            }
            o = n, n = 0;
            break e;
          }
          break n;
        }
        for (; n < o; ) {
          const a = n + o >>> 1;
          t < e[a] ? o = a : n = a + 1;
        }
        if (s = e[n], r = e[n - 1], r === void 0)
          return this._cachedIndex = 0, this.copySampleValue_(0);
        if (s === void 0)
          return n = e.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
      }
      this._cachedIndex = n, this.intervalChanged_(n, r, s);
    }
    return this.interpolate_(n, r, t, s);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(t) {
    const e = this.resultBuffer, n = this.sampleValues, s = this.valueSize, r = t * s;
    for (let o = 0; o !== s; ++o)
      e[o] = n[r + o];
    return e;
  }
  // Template methods for derived classes:
  interpolate_() {
    throw new Error("call to abstract method");
  }
  intervalChanged_() {
  }
}
class vx extends lr {
  constructor(t, e, n, s) {
    super(t, e, n, s), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
      endingStart: bc,
      endingEnd: bc
    };
  }
  intervalChanged_(t, e, n) {
    const s = this.parameterPositions;
    let r = t - 2, o = t + 1, a = s[r], l = s[o];
    if (a === void 0)
      switch (this.getSettings_().endingStart) {
        case Ec:
          r = t, a = 2 * e - n;
          break;
        case wc:
          r = s.length - 2, a = e + s[r] - s[r + 1];
          break;
        default:
          r = t, a = n;
      }
    if (l === void 0)
      switch (this.getSettings_().endingEnd) {
        case Ec:
          o = t, l = 2 * n - e;
          break;
        case wc:
          o = 1, l = n + s[1] - s[0];
          break;
        default:
          o = t - 1, l = e;
      }
    const c = (n - e) * 0.5, h = this.valueSize;
    this._weightPrev = c / (e - a), this._weightNext = c / (l - n), this._offsetPrev = r * h, this._offsetNext = o * h;
  }
  interpolate_(t, e, n, s) {
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = t * a, c = l - a, h = this._offsetPrev, d = this._offsetNext, u = this._weightPrev, f = this._weightNext, g = (n - e) / (s - e), v = g * g, p = v * g, m = -u * p + 2 * u * v - u * g, x = (1 + u) * p + (-1.5 - 2 * u) * v + (-0.5 + u) * g + 1, _ = (-1 - f) * p + (1.5 + f) * v + 0.5 * g, M = f * p - f * v;
    for (let L = 0; L !== a; ++L)
      r[L] = m * o[h + L] + x * o[c + L] + _ * o[l + L] + M * o[d + L];
    return r;
  }
}
class xx extends lr {
  constructor(t, e, n, s) {
    super(t, e, n, s);
  }
  interpolate_(t, e, n, s) {
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = t * a, c = l - a, h = (n - e) / (s - e), d = 1 - h;
    for (let u = 0; u !== a; ++u)
      r[u] = o[c + u] * d + o[l + u] * h;
    return r;
  }
}
class yx extends lr {
  constructor(t, e, n, s) {
    super(t, e, n, s);
  }
  interpolate_(t) {
    return this.copySampleValue_(t - 1);
  }
}
class An {
  constructor(t, e, n, s) {
    if (t === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (e === void 0 || e.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + t);
    this.name = t, this.times = $r(e, this.TimeBufferType), this.values = $r(n, this.ValueBufferType), this.setInterpolation(s || this.DefaultInterpolation);
  }
  // Serialization (in static context, because of constructor invocation
  // and automatic invocation of .toJSON):
  static toJSON(t) {
    const e = t.constructor;
    let n;
    if (e.toJSON !== this.toJSON)
      n = e.toJSON(t);
    else {
      n = {
        name: t.name,
        times: $r(t.times, Array),
        values: $r(t.values, Array)
      };
      const s = t.getInterpolation();
      s !== t.DefaultInterpolation && (n.interpolation = s);
    }
    return n.type = t.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(t) {
    return new yx(this.times, this.values, this.getValueSize(), t);
  }
  InterpolantFactoryMethodLinear(t) {
    return new xx(this.times, this.values, this.getValueSize(), t);
  }
  InterpolantFactoryMethodSmooth(t) {
    return new vx(this.times, this.values, this.getValueSize(), t);
  }
  setInterpolation(t) {
    let e;
    switch (t) {
      case Ys:
        e = this.InterpolantFactoryMethodDiscrete;
        break;
      case Zs:
        e = this.InterpolantFactoryMethodLinear;
        break;
      case Io:
        e = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (e === void 0) {
      const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0)
        if (t !== this.DefaultInterpolation)
          this.setInterpolation(this.DefaultInterpolation);
        else
          throw new Error(n);
      return console.warn("THREE.KeyframeTrack:", n), this;
    }
    return this.createInterpolant = e, this;
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return Ys;
      case this.InterpolantFactoryMethodLinear:
        return Zs;
      case this.InterpolantFactoryMethodSmooth:
        return Io;
    }
  }
  getValueSize() {
    return this.values.length / this.times.length;
  }
  // move all keyframes either forwards or backwards in time
  shift(t) {
    if (t !== 0) {
      const e = this.times;
      for (let n = 0, s = e.length; n !== s; ++n)
        e[n] += t;
    }
    return this;
  }
  // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
  scale(t) {
    if (t !== 1) {
      const e = this.times;
      for (let n = 0, s = e.length; n !== s; ++n)
        e[n] *= t;
    }
    return this;
  }
  // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
  // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
  trim(t, e) {
    const n = this.times, s = n.length;
    let r = 0, o = s - 1;
    for (; r !== s && n[r] < t; )
      ++r;
    for (; o !== -1 && n[o] > e; )
      --o;
    if (++o, r !== 0 || o !== s) {
      r >= o && (o = Math.max(o, 1), r = o - 1);
      const a = this.getValueSize();
      this.times = n.slice(r, o), this.values = this.values.slice(r * a, o * a);
    }
    return this;
  }
  // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
  validate() {
    let t = !0;
    const e = this.getValueSize();
    e - Math.floor(e) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), t = !1);
    const n = this.times, s = this.values, r = n.length;
    r === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), t = !1);
    let o = null;
    for (let a = 0; a !== r; a++) {
      const l = n[a];
      if (typeof l == "number" && isNaN(l)) {
        console.error("THREE.KeyframeTrack: Time is not a valid number.", this, a, l), t = !1;
        break;
      }
      if (o !== null && o > l) {
        console.error("THREE.KeyframeTrack: Out of order keys.", this, a, l, o), t = !1;
        break;
      }
      o = l;
    }
    if (s !== void 0 && gx(s))
      for (let a = 0, l = s.length; a !== l; ++a) {
        const c = s[a];
        if (isNaN(c)) {
          console.error("THREE.KeyframeTrack: Value is not a valid number.", this, a, c), t = !1;
          break;
        }
      }
    return t;
  }
  // removes equivalent sequential keys as common in morph target sequences
  // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
  optimize() {
    const t = this.times.slice(), e = this.values.slice(), n = this.getValueSize(), s = this.getInterpolation() === Io, r = t.length - 1;
    let o = 1;
    for (let a = 1; a < r; ++a) {
      let l = !1;
      const c = t[a], h = t[a + 1];
      if (c !== h && (a !== 1 || c !== t[0]))
        if (s)
          l = !0;
        else {
          const d = a * n, u = d - n, f = d + n;
          for (let g = 0; g !== n; ++g) {
            const v = e[d + g];
            if (v !== e[u + g] || v !== e[f + g]) {
              l = !0;
              break;
            }
          }
        }
      if (l) {
        if (a !== o) {
          t[o] = t[a];
          const d = a * n, u = o * n;
          for (let f = 0; f !== n; ++f)
            e[u + f] = e[d + f];
        }
        ++o;
      }
    }
    if (r > 0) {
      t[o] = t[r];
      for (let a = r * n, l = o * n, c = 0; c !== n; ++c)
        e[l + c] = e[a + c];
      ++o;
    }
    return o !== t.length ? (this.times = t.slice(0, o), this.values = e.slice(0, o * n)) : (this.times = t, this.values = e), this;
  }
  clone() {
    const t = this.times.slice(), e = this.values.slice(), n = this.constructor, s = new n(this.name, t, e);
    return s.createInterpolant = this.createInterpolant, s;
  }
}
An.prototype.TimeBufferType = Float32Array;
An.prototype.ValueBufferType = Float32Array;
An.prototype.DefaultInterpolation = Zs;
class _s extends An {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(t, e, n) {
    super(t, e, n);
  }
}
_s.prototype.ValueTypeName = "bool";
_s.prototype.ValueBufferType = Array;
_s.prototype.DefaultInterpolation = Ys;
_s.prototype.InterpolantFactoryMethodLinear = void 0;
_s.prototype.InterpolantFactoryMethodSmooth = void 0;
class yu extends An {
}
yu.prototype.ValueTypeName = "color";
class us extends An {
}
us.prototype.ValueTypeName = "number";
class Mx extends lr {
  constructor(t, e, n, s) {
    super(t, e, n, s);
  }
  interpolate_(t, e, n, s) {
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = (n - e) / (s - e);
    let c = t * a;
    for (let h = c + a; c !== h; c += 4)
      Sn.slerpFlat(r, 0, o, c - a, o, c, l);
    return r;
  }
}
class fs extends An {
  InterpolantFactoryMethodLinear(t) {
    return new Mx(this.times, this.values, this.getValueSize(), t);
  }
}
fs.prototype.ValueTypeName = "quaternion";
fs.prototype.InterpolantFactoryMethodSmooth = void 0;
class vs extends An {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(t, e, n) {
    super(t, e, n);
  }
}
vs.prototype.ValueTypeName = "string";
vs.prototype.ValueBufferType = Array;
vs.prototype.DefaultInterpolation = Ys;
vs.prototype.InterpolantFactoryMethodLinear = void 0;
vs.prototype.InterpolantFactoryMethodSmooth = void 0;
class ps extends An {
}
ps.prototype.ValueTypeName = "vector";
class Sx {
  constructor(t = "", e = -1, n = [], s = Wf) {
    this.name = t, this.tracks = n, this.duration = e, this.blendMode = s, this.uuid = cn(), this.duration < 0 && this.resetDuration();
  }
  static parse(t) {
    const e = [], n = t.tracks, s = 1 / (t.fps || 1);
    for (let o = 0, a = n.length; o !== a; ++o)
      e.push(Ex(n[o]).scale(s));
    const r = new this(t.name, t.duration, e, t.blendMode);
    return r.uuid = t.uuid, r;
  }
  static toJSON(t) {
    const e = [], n = t.tracks, s = {
      name: t.name,
      duration: t.duration,
      tracks: e,
      uuid: t.uuid,
      blendMode: t.blendMode
    };
    for (let r = 0, o = n.length; r !== o; ++r)
      e.push(An.toJSON(n[r]));
    return s;
  }
  static CreateFromMorphTargetSequence(t, e, n, s) {
    const r = e.length, o = [];
    for (let a = 0; a < r; a++) {
      let l = [], c = [];
      l.push(
        (a + r - 1) % r,
        a,
        (a + 1) % r
      ), c.push(0, 1, 0);
      const h = _x(l);
      l = Bh(l, 1, h), c = Bh(c, 1, h), !s && l[0] === 0 && (l.push(r), c.push(c[0])), o.push(
        new us(
          ".morphTargetInfluences[" + e[a].name + "]",
          l,
          c
        ).scale(1 / n)
      );
    }
    return new this(t, -1, o);
  }
  static findByName(t, e) {
    let n = t;
    if (!Array.isArray(t)) {
      const s = t;
      n = s.geometry && s.geometry.animations || s.animations;
    }
    for (let s = 0; s < n.length; s++)
      if (n[s].name === e)
        return n[s];
    return null;
  }
  static CreateClipsFromMorphTargetSequences(t, e, n) {
    const s = {}, r = /^([\w-]*?)([\d]+)$/;
    for (let a = 0, l = t.length; a < l; a++) {
      const c = t[a], h = c.name.match(r);
      if (h && h.length > 1) {
        const d = h[1];
        let u = s[d];
        u || (s[d] = u = []), u.push(c);
      }
    }
    const o = [];
    for (const a in s)
      o.push(this.CreateFromMorphTargetSequence(a, s[a], e, n));
    return o;
  }
  // parse the animation.hierarchy format
  static parseAnimation(t, e) {
    if (!t)
      return console.error("THREE.AnimationClip: No animation in JSONLoader data."), null;
    const n = function(d, u, f, g, v) {
      if (f.length !== 0) {
        const p = [], m = [];
        xu(f, p, m, g), p.length !== 0 && v.push(new d(u, p, m));
      }
    }, s = [], r = t.name || "default", o = t.fps || 30, a = t.blendMode;
    let l = t.length || -1;
    const c = t.hierarchy || [];
    for (let d = 0; d < c.length; d++) {
      const u = c[d].keys;
      if (!(!u || u.length === 0))
        if (u[0].morphTargets) {
          const f = {};
          let g;
          for (g = 0; g < u.length; g++)
            if (u[g].morphTargets)
              for (let v = 0; v < u[g].morphTargets.length; v++)
                f[u[g].morphTargets[v]] = -1;
          for (const v in f) {
            const p = [], m = [];
            for (let x = 0; x !== u[g].morphTargets.length; ++x) {
              const _ = u[g];
              p.push(_.time), m.push(_.morphTarget === v ? 1 : 0);
            }
            s.push(new us(".morphTargetInfluence[" + v + "]", p, m));
          }
          l = f.length * o;
        } else {
          const f = ".bones[" + e[d].name + "]";
          n(
            ps,
            f + ".position",
            u,
            "pos",
            s
          ), n(
            fs,
            f + ".quaternion",
            u,
            "rot",
            s
          ), n(
            ps,
            f + ".scale",
            u,
            "scl",
            s
          );
        }
    }
    return s.length === 0 ? null : new this(r, l, s, a);
  }
  resetDuration() {
    const t = this.tracks;
    let e = 0;
    for (let n = 0, s = t.length; n !== s; ++n) {
      const r = this.tracks[n];
      e = Math.max(e, r.times[r.times.length - 1]);
    }
    return this.duration = e, this;
  }
  trim() {
    for (let t = 0; t < this.tracks.length; t++)
      this.tracks[t].trim(0, this.duration);
    return this;
  }
  validate() {
    let t = !0;
    for (let e = 0; e < this.tracks.length; e++)
      t = t && this.tracks[e].validate();
    return t;
  }
  optimize() {
    for (let t = 0; t < this.tracks.length; t++)
      this.tracks[t].optimize();
    return this;
  }
  clone() {
    const t = [];
    for (let e = 0; e < this.tracks.length; e++)
      t.push(this.tracks[e].clone());
    return new this.constructor(this.name, this.duration, t, this.blendMode);
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
}
function bx(i) {
  switch (i.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return us;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return ps;
    case "color":
      return yu;
    case "quaternion":
      return fs;
    case "bool":
    case "boolean":
      return _s;
    case "string":
      return vs;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + i);
}
function Ex(i) {
  if (i.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const t = bx(i.type);
  if (i.times === void 0) {
    const e = [], n = [];
    xu(i.keys, e, n, "value"), i.times = e, i.values = n;
  }
  return t.parse !== void 0 ? t.parse(i) : new t(i.name, i.times, i.values, i.interpolation);
}
const ii = {
  enabled: !1,
  files: {},
  add: function(i, t) {
    this.enabled !== !1 && (this.files[i] = t);
  },
  get: function(i) {
    if (this.enabled !== !1)
      return this.files[i];
  },
  remove: function(i) {
    delete this.files[i];
  },
  clear: function() {
    this.files = {};
  }
};
class wx {
  constructor(t, e, n) {
    const s = this;
    let r = !1, o = 0, a = 0, l;
    const c = [];
    this.onStart = void 0, this.onLoad = t, this.onProgress = e, this.onError = n, this.itemStart = function(h) {
      a++, r === !1 && s.onStart !== void 0 && s.onStart(h, o, a), r = !0;
    }, this.itemEnd = function(h) {
      o++, s.onProgress !== void 0 && s.onProgress(h, o, a), o === a && (r = !1, s.onLoad !== void 0 && s.onLoad());
    }, this.itemError = function(h) {
      s.onError !== void 0 && s.onError(h);
    }, this.resolveURL = function(h) {
      return l ? l(h) : h;
    }, this.setURLModifier = function(h) {
      return l = h, this;
    }, this.addHandler = function(h, d) {
      return c.push(h, d), this;
    }, this.removeHandler = function(h) {
      const d = c.indexOf(h);
      return d !== -1 && c.splice(d, 2), this;
    }, this.getHandler = function(h) {
      for (let d = 0, u = c.length; d < u; d += 2) {
        const f = c[d], g = c[d + 1];
        if (f.global && (f.lastIndex = 0), f.test(h))
          return g;
      }
      return null;
    };
  }
}
const Tx = /* @__PURE__ */ new wx();
class xs {
  constructor(t) {
    this.manager = t !== void 0 ? t : Tx, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
  }
  load() {
  }
  loadAsync(t, e) {
    const n = this;
    return new Promise(function(s, r) {
      n.load(t, s, e, r);
    });
  }
  parse() {
  }
  setCrossOrigin(t) {
    return this.crossOrigin = t, this;
  }
  setWithCredentials(t) {
    return this.withCredentials = t, this;
  }
  setPath(t) {
    return this.path = t, this;
  }
  setResourcePath(t) {
    return this.resourcePath = t, this;
  }
  setRequestHeader(t) {
    return this.requestHeader = t, this;
  }
}
xs.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const Nn = {};
class Ax extends Error {
  constructor(t, e) {
    super(t), this.response = e;
  }
}
class Mu extends xs {
  constructor(t) {
    super(t);
  }
  load(t, e, n, s) {
    t === void 0 && (t = ""), this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const r = ii.get(t);
    if (r !== void 0)
      return this.manager.itemStart(t), setTimeout(() => {
        e && e(r), this.manager.itemEnd(t);
      }, 0), r;
    if (Nn[t] !== void 0) {
      Nn[t].push({
        onLoad: e,
        onProgress: n,
        onError: s
      });
      return;
    }
    Nn[t] = [], Nn[t].push({
      onLoad: e,
      onProgress: n,
      onError: s
    });
    const o = new Request(t, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? "include" : "same-origin"
      // An abort controller could be added within a future PR
    }), a = this.mimeType, l = this.responseType;
    fetch(o).then((c) => {
      if (c.status === 200 || c.status === 0) {
        if (c.status === 0 && console.warn("THREE.FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || c.body === void 0 || c.body.getReader === void 0)
          return c;
        const h = Nn[t], d = c.body.getReader(), u = c.headers.get("X-File-Size") || c.headers.get("Content-Length"), f = u ? parseInt(u) : 0, g = f !== 0;
        let v = 0;
        const p = new ReadableStream({
          start(m) {
            x();
            function x() {
              d.read().then(({ done: _, value: M }) => {
                if (_)
                  m.close();
                else {
                  v += M.byteLength;
                  const L = new ProgressEvent("progress", { lengthComputable: g, loaded: v, total: f });
                  for (let T = 0, w = h.length; T < w; T++) {
                    const R = h[T];
                    R.onProgress && R.onProgress(L);
                  }
                  m.enqueue(M), x();
                }
              }, (_) => {
                m.error(_);
              });
            }
          }
        });
        return new Response(p);
      } else
        throw new Ax(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`, c);
    }).then((c) => {
      switch (l) {
        case "arraybuffer":
          return c.arrayBuffer();
        case "blob":
          return c.blob();
        case "document":
          return c.text().then((h) => new DOMParser().parseFromString(h, a));
        case "json":
          return c.json();
        default:
          if (a === void 0)
            return c.text();
          {
            const d = /charset="?([^;"\s]*)"?/i.exec(a), u = d && d[1] ? d[1].toLowerCase() : void 0, f = new TextDecoder(u);
            return c.arrayBuffer().then((g) => f.decode(g));
          }
      }
    }).then((c) => {
      ii.add(t, c);
      const h = Nn[t];
      delete Nn[t];
      for (let d = 0, u = h.length; d < u; d++) {
        const f = h[d];
        f.onLoad && f.onLoad(c);
      }
    }).catch((c) => {
      const h = Nn[t];
      if (h === void 0)
        throw this.manager.itemError(t), c;
      delete Nn[t];
      for (let d = 0, u = h.length; d < u; d++) {
        const f = h[d];
        f.onError && f.onError(c);
      }
      this.manager.itemError(t);
    }).finally(() => {
      this.manager.itemEnd(t);
    }), this.manager.itemStart(t);
  }
  setResponseType(t) {
    return this.responseType = t, this;
  }
  setMimeType(t) {
    return this.mimeType = t, this;
  }
}
class Rx extends xs {
  constructor(t) {
    super(t);
  }
  load(t, e, n, s) {
    this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const r = this, o = ii.get(t);
    if (o !== void 0)
      return r.manager.itemStart(t), setTimeout(function() {
        e && e(o), r.manager.itemEnd(t);
      }, 0), o;
    const a = Js("img");
    function l() {
      h(), ii.add(t, this), e && e(this), r.manager.itemEnd(t);
    }
    function c(d) {
      h(), s && s(d), r.manager.itemError(t), r.manager.itemEnd(t);
    }
    function h() {
      a.removeEventListener("load", l, !1), a.removeEventListener("error", c, !1);
    }
    return a.addEventListener("load", l, !1), a.addEventListener("error", c, !1), t.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (a.crossOrigin = this.crossOrigin), r.manager.itemStart(t), a.src = t, a;
  }
}
class Su extends xs {
  constructor(t) {
    super(t);
  }
  load(t, e, n, s) {
    const r = new Ce(), o = new Rx(this.manager);
    return o.setCrossOrigin(this.crossOrigin), o.setPath(this.path), o.load(t, function(a) {
      r.image = a, r.needsUpdate = !0, e !== void 0 && e(r);
    }, n, s), r;
  }
}
class cr extends ye {
  constructor(t, e = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Ct(t), this.intensity = e;
  }
  dispose() {
  }
  copy(t, e) {
    return super.copy(t, e), this.color.copy(t.color), this.intensity = t.intensity, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.color = this.color.getHex(), e.object.intensity = this.intensity, this.groundColor !== void 0 && (e.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (e.object.distance = this.distance), this.angle !== void 0 && (e.object.angle = this.angle), this.decay !== void 0 && (e.object.decay = this.decay), this.penumbra !== void 0 && (e.object.penumbra = this.penumbra), this.shadow !== void 0 && (e.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (e.object.target = this.target.uuid), e;
  }
}
class Cx extends cr {
  constructor(t, e, n) {
    super(t, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(ye.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Ct(e);
  }
  copy(t, e) {
    return super.copy(t, e), this.groundColor.copy(t.groundColor), this;
  }
}
const pa = /* @__PURE__ */ new Ft(), kh = /* @__PURE__ */ new P(), zh = /* @__PURE__ */ new P();
class Kl {
  constructor(t) {
    this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new nt(512, 512), this.map = null, this.mapPass = null, this.matrix = new Ft(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Ul(), this._frameExtents = new nt(1, 1), this._viewportCount = 1, this._viewports = [
      new re(0, 0, 1, 1)
    ];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(t) {
    const e = this.camera, n = this.matrix;
    kh.setFromMatrixPosition(t.matrixWorld), e.position.copy(kh), zh.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(zh), e.updateMatrixWorld(), pa.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(pa), n.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), n.multiply(pa);
  }
  getViewport(t) {
    return this._viewports[t];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(t) {
    return this.camera = t.camera.clone(), this.intensity = t.intensity, this.bias = t.bias, this.radius = t.radius, this.mapSize.copy(t.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const t = {};
    return this.intensity !== 1 && (t.intensity = this.intensity), this.bias !== 0 && (t.bias = this.bias), this.normalBias !== 0 && (t.normalBias = this.normalBias), this.radius !== 1 && (t.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (t.mapSize = this.mapSize.toArray()), t.camera = this.camera.toJSON(!1).object, delete t.camera.matrix, t;
  }
}
class Px extends Kl {
  constructor() {
    super(new ze(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(t) {
    const e = this.camera, n = hs * 2 * t.angle * this.focus, s = this.mapSize.width / this.mapSize.height, r = t.distance || e.far;
    (n !== e.fov || s !== e.aspect || r !== e.far) && (e.fov = n, e.aspect = s, e.far = r, e.updateProjectionMatrix()), super.updateMatrices(t);
  }
  copy(t) {
    return super.copy(t), this.focus = t.focus, this;
  }
}
class Lx extends cr {
  constructor(t, e, n = 0, s = Math.PI / 3, r = 0, o = 2) {
    super(t, e), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(ye.DEFAULT_UP), this.updateMatrix(), this.target = new ye(), this.distance = n, this.angle = s, this.penumbra = r, this.decay = o, this.map = null, this.shadow = new Px();
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(t) {
    this.intensity = t / Math.PI;
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t, e) {
    return super.copy(t, e), this.distance = t.distance, this.angle = t.angle, this.penumbra = t.penumbra, this.decay = t.decay, this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
}
const Hh = /* @__PURE__ */ new Ft(), Is = /* @__PURE__ */ new P(), ma = /* @__PURE__ */ new P();
class Ix extends Kl {
  constructor() {
    super(new ze(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new nt(4, 2), this._viewportCount = 6, this._viewports = [
      // These viewports map a cube-map onto a 2D texture with the
      // following orientation:
      //
      //  xzXZ
      //   y Y
      //
      // X - Positive x direction
      // x - Negative x direction
      // Y - Positive y direction
      // y - Negative y direction
      // Z - Positive z direction
      // z - Negative z direction
      // positive X
      new re(2, 1, 1, 1),
      // negative X
      new re(0, 1, 1, 1),
      // positive Z
      new re(3, 1, 1, 1),
      // negative Z
      new re(1, 1, 1, 1),
      // positive Y
      new re(3, 0, 1, 1),
      // negative Y
      new re(1, 0, 1, 1)
    ], this._cubeDirections = [
      new P(1, 0, 0),
      new P(-1, 0, 0),
      new P(0, 0, 1),
      new P(0, 0, -1),
      new P(0, 1, 0),
      new P(0, -1, 0)
    ], this._cubeUps = [
      new P(0, 1, 0),
      new P(0, 1, 0),
      new P(0, 1, 0),
      new P(0, 1, 0),
      new P(0, 0, 1),
      new P(0, 0, -1)
    ];
  }
  updateMatrices(t, e = 0) {
    const n = this.camera, s = this.matrix, r = t.distance || n.far;
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), Is.setFromMatrixPosition(t.matrixWorld), n.position.copy(Is), ma.copy(n.position), ma.add(this._cubeDirections[e]), n.up.copy(this._cubeUps[e]), n.lookAt(ma), n.updateMatrixWorld(), s.makeTranslation(-Is.x, -Is.y, -Is.z), Hh.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Hh);
  }
}
class bu extends cr {
  constructor(t, e, n = 0, s = 2) {
    super(t, e), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = s, this.shadow = new Ix();
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(t) {
    this.intensity = t / (4 * Math.PI);
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t, e) {
    return super.copy(t, e), this.distance = t.distance, this.decay = t.decay, this.shadow = t.shadow.clone(), this;
  }
}
class Dx extends Kl {
  constructor() {
    super(new Ol(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class ql extends cr {
  constructor(t, e) {
    super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(ye.DEFAULT_UP), this.updateMatrix(), this.target = new ye(), this.shadow = new Dx();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
}
class Eu extends cr {
  constructor(t, e) {
    super(t, e), this.isAmbientLight = !0, this.type = "AmbientLight";
  }
}
class $s {
  static decodeText(t) {
    if (console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."), typeof TextDecoder < "u")
      return new TextDecoder().decode(t);
    let e = "";
    for (let n = 0, s = t.length; n < s; n++)
      e += String.fromCharCode(t[n]);
    try {
      return decodeURIComponent(escape(e));
    } catch {
      return e;
    }
  }
  static extractUrlBase(t) {
    const e = t.lastIndexOf("/");
    return e === -1 ? "./" : t.slice(0, e + 1);
  }
  static resolveURL(t, e) {
    return typeof t != "string" || t === "" ? "" : (/^https?:\/\//i.test(e) && /^\//.test(t) && (e = e.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(t) || /^data:.*,.*$/i.test(t) || /^blob:.*$/i.test(t) ? t : e + t);
  }
}
class Nx extends xs {
  constructor(t) {
    super(t), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" };
  }
  setOptions(t) {
    return this.options = t, this;
  }
  load(t, e, n, s) {
    t === void 0 && (t = ""), this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const r = this, o = ii.get(t);
    if (o !== void 0) {
      if (r.manager.itemStart(t), o.then) {
        o.then((c) => {
          e && e(c), r.manager.itemEnd(t);
        }).catch((c) => {
          s && s(c);
        });
        return;
      }
      return setTimeout(function() {
        e && e(o), r.manager.itemEnd(t);
      }, 0), o;
    }
    const a = {};
    a.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include", a.headers = this.requestHeader;
    const l = fetch(t, a).then(function(c) {
      return c.blob();
    }).then(function(c) {
      return createImageBitmap(c, Object.assign(r.options, { colorSpaceConversion: "none" }));
    }).then(function(c) {
      return ii.add(t, c), e && e(c), r.manager.itemEnd(t), c;
    }).catch(function(c) {
      s && s(c), ii.remove(t), r.manager.itemError(t), r.manager.itemEnd(t);
    });
    ii.add(t, l), r.manager.itemStart(t);
  }
}
class Ux {
  constructor(t = !0) {
    this.autoStart = t, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
  }
  start() {
    this.startTime = Gh(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
  }
  stop() {
    this.getElapsedTime(), this.running = !1, this.autoStart = !1;
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime;
  }
  getDelta() {
    let t = 0;
    if (this.autoStart && !this.running)
      return this.start(), 0;
    if (this.running) {
      const e = Gh();
      t = (e - this.oldTime) / 1e3, this.oldTime = e, this.elapsedTime += t;
    }
    return t;
  }
}
function Gh() {
  return performance.now();
}
const Yl = "\\[\\]\\.:\\/", Ox = new RegExp("[" + Yl + "]", "g"), Zl = "[^" + Yl + "]", Fx = "[^" + Yl.replace("\\.", "") + "]", Bx = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Zl), kx = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", Fx), zx = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Zl), Hx = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Zl), Gx = new RegExp(
  "^" + Bx + kx + zx + Hx + "$"
), Vx = ["material", "materials", "bones", "map"];
class Wx {
  constructor(t, e, n) {
    const s = n || de.parseTrackName(e);
    this._targetGroup = t, this._bindings = t.subscribe_(e, s);
  }
  getValue(t, e) {
    this.bind();
    const n = this._targetGroup.nCachedObjects_, s = this._bindings[n];
    s !== void 0 && s.getValue(t, e);
  }
  setValue(t, e) {
    const n = this._bindings;
    for (let s = this._targetGroup.nCachedObjects_, r = n.length; s !== r; ++s)
      n[s].setValue(t, e);
  }
  bind() {
    const t = this._bindings;
    for (let e = this._targetGroup.nCachedObjects_, n = t.length; e !== n; ++e)
      t[e].bind();
  }
  unbind() {
    const t = this._bindings;
    for (let e = this._targetGroup.nCachedObjects_, n = t.length; e !== n; ++e)
      t[e].unbind();
  }
}
class de {
  constructor(t, e, n) {
    this.path = e, this.parsedPath = n || de.parseTrackName(e), this.node = de.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(t, e, n) {
    return t && t.isAnimationObjectGroup ? new de.Composite(t, e, n) : new de(t, e, n);
  }
  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(t) {
    return t.replace(/\s/g, "_").replace(Ox, "");
  }
  static parseTrackName(t) {
    const e = Gx.exec(t);
    if (e === null)
      throw new Error("PropertyBinding: Cannot parse trackName: " + t);
    const n = {
      // directoryName: matches[ 1 ], // (tschw) currently unused
      nodeName: e[2],
      objectName: e[3],
      objectIndex: e[4],
      propertyName: e[5],
      // required
      propertyIndex: e[6]
    }, s = n.nodeName && n.nodeName.lastIndexOf(".");
    if (s !== void 0 && s !== -1) {
      const r = n.nodeName.substring(s + 1);
      Vx.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, s), n.objectName = r);
    }
    if (n.propertyName === null || n.propertyName.length === 0)
      throw new Error("PropertyBinding: can not parse propertyName from trackName: " + t);
    return n;
  }
  static findNode(t, e) {
    if (e === void 0 || e === "" || e === "." || e === -1 || e === t.name || e === t.uuid)
      return t;
    if (t.skeleton) {
      const n = t.skeleton.getBoneByName(e);
      if (n !== void 0)
        return n;
    }
    if (t.children) {
      const n = function(r) {
        for (let o = 0; o < r.length; o++) {
          const a = r[o];
          if (a.name === e || a.uuid === e)
            return a;
          const l = n(a.children);
          if (l) return l;
        }
        return null;
      }, s = n(t.children);
      if (s)
        return s;
    }
    return null;
  }
  // these are used to "bind" a nonexistent property
  _getValue_unavailable() {
  }
  _setValue_unavailable() {
  }
  // Getters
  _getValue_direct(t, e) {
    t[e] = this.targetObject[this.propertyName];
  }
  _getValue_array(t, e) {
    const n = this.resolvedProperty;
    for (let s = 0, r = n.length; s !== r; ++s)
      t[e++] = n[s];
  }
  _getValue_arrayElement(t, e) {
    t[e] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(t, e) {
    this.resolvedProperty.toArray(t, e);
  }
  // Direct
  _setValue_direct(t, e) {
    this.targetObject[this.propertyName] = t[e];
  }
  _setValue_direct_setNeedsUpdate(t, e) {
    this.targetObject[this.propertyName] = t[e], this.targetObject.needsUpdate = !0;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(t, e) {
    this.targetObject[this.propertyName] = t[e], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  // EntireArray
  _setValue_array(t, e) {
    const n = this.resolvedProperty;
    for (let s = 0, r = n.length; s !== r; ++s)
      n[s] = t[e++];
  }
  _setValue_array_setNeedsUpdate(t, e) {
    const n = this.resolvedProperty;
    for (let s = 0, r = n.length; s !== r; ++s)
      n[s] = t[e++];
    this.targetObject.needsUpdate = !0;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(t, e) {
    const n = this.resolvedProperty;
    for (let s = 0, r = n.length; s !== r; ++s)
      n[s] = t[e++];
    this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  // ArrayElement
  _setValue_arrayElement(t, e) {
    this.resolvedProperty[this.propertyIndex] = t[e];
  }
  _setValue_arrayElement_setNeedsUpdate(t, e) {
    this.resolvedProperty[this.propertyIndex] = t[e], this.targetObject.needsUpdate = !0;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(t, e) {
    this.resolvedProperty[this.propertyIndex] = t[e], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  // HasToFromArray
  _setValue_fromArray(t, e) {
    this.resolvedProperty.fromArray(t, e);
  }
  _setValue_fromArray_setNeedsUpdate(t, e) {
    this.resolvedProperty.fromArray(t, e), this.targetObject.needsUpdate = !0;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(t, e) {
    this.resolvedProperty.fromArray(t, e), this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _getValue_unbound(t, e) {
    this.bind(), this.getValue(t, e);
  }
  _setValue_unbound(t, e) {
    this.bind(), this.setValue(t, e);
  }
  // create getter / setter pair for a property in the scene graph
  bind() {
    let t = this.node;
    const e = this.parsedPath, n = e.objectName, s = e.propertyName;
    let r = e.propertyIndex;
    if (t || (t = de.findNode(this.rootNode, e.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
      console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
      return;
    }
    if (n) {
      let c = e.objectIndex;
      switch (n) {
        case "materials":
          if (!t.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.materials) {
            console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return;
          }
          t = t.material.materials;
          break;
        case "bones":
          if (!t.skeleton) {
            console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return;
          }
          t = t.skeleton.bones;
          for (let h = 0; h < t.length; h++)
            if (t[h].name === c) {
              c = h;
              break;
            }
          break;
        case "map":
          if ("map" in t) {
            t = t.map;
            break;
          }
          if (!t.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.map) {
            console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return;
          }
          t = t.material.map;
          break;
        default:
          if (t[n] === void 0) {
            console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          t = t[n];
      }
      if (c !== void 0) {
        if (t[c] === void 0) {
          console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
          return;
        }
        t = t[c];
      }
    }
    const o = t[s];
    if (o === void 0) {
      const c = e.nodeName;
      console.error("THREE.PropertyBinding: Trying to update property for track: " + c + "." + s + " but it wasn't found.", t);
      return;
    }
    let a = this.Versioning.None;
    this.targetObject = t, t.needsUpdate !== void 0 ? a = this.Versioning.NeedsUpdate : t.matrixWorldNeedsUpdate !== void 0 && (a = this.Versioning.MatrixWorldNeedsUpdate);
    let l = this.BindingType.Direct;
    if (r !== void 0) {
      if (s === "morphTargetInfluences") {
        if (!t.geometry) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return;
        }
        if (!t.geometry.morphAttributes) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return;
        }
        t.morphTargetDictionary[r] !== void 0 && (r = t.morphTargetDictionary[r]);
      }
      l = this.BindingType.ArrayElement, this.resolvedProperty = o, this.propertyIndex = r;
    } else o.fromArray !== void 0 && o.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = o) : Array.isArray(o) ? (l = this.BindingType.EntireArray, this.resolvedProperty = o) : this.propertyName = s;
    this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][a];
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
}
de.Composite = Wx;
de.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
de.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
de.prototype.GetterByBindingType = [
  de.prototype._getValue_direct,
  de.prototype._getValue_array,
  de.prototype._getValue_arrayElement,
  de.prototype._getValue_toArray
];
de.prototype.SetterByBindingTypeAndVersioning = [
  [
    // Direct
    de.prototype._setValue_direct,
    de.prototype._setValue_direct_setNeedsUpdate,
    de.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    // EntireArray
    de.prototype._setValue_array,
    de.prototype._setValue_array_setNeedsUpdate,
    de.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    // ArrayElement
    de.prototype._setValue_arrayElement,
    de.prototype._setValue_arrayElement_setNeedsUpdate,
    de.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    // HasToFromArray
    de.prototype._setValue_fromArray,
    de.prototype._setValue_fromArray_setNeedsUpdate,
    de.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
const Vh = /* @__PURE__ */ new Ft();
class $x {
  constructor(t, e, n = 0, s = 1 / 0) {
    this.ray = new ms(t, e), this.near = n, this.far = s, this.camera = null, this.layers = new Nl(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(t, e) {
    this.ray.set(t, e);
  }
  setFromCamera(t, e) {
    e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, 0.5).unproject(e).sub(this.ray.origin).normalize(), this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
  }
  setFromXRController(t) {
    return Vh.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Vh), this;
  }
  intersectObject(t, e = !0, n = []) {
    return fl(t, this, n, e), n.sort(Wh), n;
  }
  intersectObjects(t, e = !0, n = []) {
    for (let s = 0, r = t.length; s < r; s++)
      fl(t[s], this, n, e);
    return n.sort(Wh), n;
  }
}
function Wh(i, t) {
  return i.distance - t.distance;
}
function fl(i, t, e, n) {
  let s = !0;
  if (i.layers.test(t.layers) && i.raycast(t, e) === !1 && (s = !1), s === !0 && n === !0) {
    const r = i.children;
    for (let o = 0, a = r.length; o < a; o++)
      fl(r[o], t, e, !0);
  }
}
class $h {
  constructor(t = 1, e = 0, n = 0) {
    return this.radius = t, this.phi = e, this.theta = n, this;
  }
  set(t, e, n) {
    return this.radius = t, this.phi = e, this.theta = n, this;
  }
  copy(t) {
    return this.radius = t.radius, this.phi = t.phi, this.theta = t.theta, this;
  }
  // restrict phi to be between EPS and PI-EPS
  makeSafe() {
    return this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi)), this;
  }
  setFromVector3(t) {
    return this.setFromCartesianCoords(t.x, t.y, t.z);
  }
  setFromCartesianCoords(t, e, n) {
    return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Re(e / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Xx extends zl {
  constructor(t = 10, e = 10, n = 4473924, s = 8947848) {
    n = new Ct(n), s = new Ct(s);
    const r = e / 2, o = t / e, a = t / 2, l = [], c = [];
    for (let u = 0, f = 0, g = -a; u <= e; u++, g += o) {
      l.push(-a, 0, g, a, 0, g), l.push(g, 0, -a, g, 0, a);
      const v = u === r ? n : s;
      v.toArray(c, f), f += 3, v.toArray(c, f), f += 3, v.toArray(c, f), f += 3, v.toArray(c, f), f += 3;
    }
    const h = new Ie();
    h.setAttribute("position", new ue(l, 3)), h.setAttribute("color", new ue(c, 3));
    const d = new wo({ vertexColors: !0, toneMapped: !1 });
    super(h, d), this.type = "GridHelper";
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
const Xr = /* @__PURE__ */ new Ke();
class jx extends zl {
  constructor(t, e = 16776960) {
    const n = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]), s = new Float32Array(8 * 3), r = new Ie();
    r.setIndex(new Ue(n, 1)), r.setAttribute("position", new Ue(s, 3)), super(r, new wo({ color: e, toneMapped: !1 })), this.object = t, this.type = "BoxHelper", this.matrixAutoUpdate = !1, this.update();
  }
  update(t) {
    if (t !== void 0 && console.warn("THREE.BoxHelper: .update() has no longer arguments."), this.object !== void 0 && Xr.setFromObject(this.object), Xr.isEmpty()) return;
    const e = Xr.min, n = Xr.max, s = this.geometry.attributes.position, r = s.array;
    r[0] = n.x, r[1] = n.y, r[2] = n.z, r[3] = e.x, r[4] = n.y, r[5] = n.z, r[6] = e.x, r[7] = e.y, r[8] = n.z, r[9] = n.x, r[10] = e.y, r[11] = n.z, r[12] = n.x, r[13] = n.y, r[14] = e.z, r[15] = e.x, r[16] = n.y, r[17] = e.z, r[18] = e.x, r[19] = e.y, r[20] = e.z, r[21] = n.x, r[22] = e.y, r[23] = e.z, s.needsUpdate = !0, this.geometry.computeBoundingSphere();
  }
  setFromObject(t) {
    return this.object = t, this.update(), this;
  }
  copy(t, e) {
    return super.copy(t, e), this.object = t.object, this;
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
class Kx extends Ti {
  constructor(t, e = null) {
    super(), this.object = t, this.domElement = e, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null }, this.touches = { ONE: null, TWO: null };
  }
  connect() {
  }
  disconnect() {
  }
  dispose() {
  }
  update() {
  }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: El
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = El);
const Xh = { type: "change" }, Jl = { type: "start" }, wu = { type: "end" }, jr = new ms(), jh = new Fn(), qx = Math.cos(70 * ts.DEG2RAD), Ae = new P(), Xe = 2 * Math.PI, pe = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, ga = 1e-6;
class Yx extends Kx {
  constructor(t, e = null) {
    super(t, e), this.state = pe.NONE, this.enabled = !0, this.target = new P(), this.cursor = new P(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: pn.ROTATE, MIDDLE: pn.DOLLY, RIGHT: pn.PAN }, this.touches = { ONE: mn.ROTATE, TWO: mn.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new P(), this._lastQuaternion = new Sn(), this._lastTargetPosition = new P(), this._quat = new Sn().setFromUnitVectors(t.up, new P(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new $h(), this._sphericalDelta = new $h(), this._scale = 1, this._panOffset = new P(), this._rotateStart = new nt(), this._rotateEnd = new nt(), this._rotateDelta = new nt(), this._panStart = new nt(), this._panEnd = new nt(), this._panDelta = new nt(), this._dollyStart = new nt(), this._dollyEnd = new nt(), this._dollyDelta = new nt(), this._dollyDirection = new P(), this._mouse = new nt(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Jx.bind(this), this._onPointerDown = Zx.bind(this), this._onPointerUp = Qx.bind(this), this._onContextMenu = oy.bind(this), this._onMouseWheel = ny.bind(this), this._onKeyDown = iy.bind(this), this._onTouchStart = sy.bind(this), this._onTouchMove = ry.bind(this), this._onMouseDown = ty.bind(this), this._onMouseMove = ey.bind(this), this._interceptControlDown = ay.bind(this), this._interceptControlUp = ly.bind(this), this.domElement !== null && this.connect(), this.update();
  }
  connect() {
    this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, { passive: !0, capture: !0 }), this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: !0 }), this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  getPolarAngle() {
    return this._spherical.phi;
  }
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  listenToKeyEvents(t) {
    t.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = t;
  }
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
  }
  saveState() {
    this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
  }
  reset() {
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(Xh), this.update(), this.state = pe.NONE;
  }
  update(t = null) {
    const e = this.object.position;
    Ae.copy(e).sub(this.target), Ae.applyQuaternion(this._quat), this._spherical.setFromVector3(Ae), this.autoRotate && this.state === pe.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, s = this.maxAzimuthAngle;
    isFinite(n) && isFinite(s) && (n < -Math.PI ? n += Xe : n > Math.PI && (n -= Xe), s < -Math.PI ? s += Xe : s > Math.PI && (s -= Xe), n <= s ? this._spherical.theta = Math.max(n, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + s) / 2 ? Math.max(n, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let r = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera)
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const o = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = o != this._spherical.radius;
    }
    if (Ae.setFromSpherical(this._spherical), Ae.applyQuaternion(this._quatInverse), e.copy(this.target).add(Ae), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let o = null;
      if (this.object.isPerspectiveCamera) {
        const a = Ae.length();
        o = this._clampDistance(a * this._scale);
        const l = a - o;
        this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), r = !!l;
      } else if (this.object.isOrthographicCamera) {
        const a = new P(this._mouse.x, this._mouse.y, 0);
        a.unproject(this.object);
        const l = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = l !== this.object.zoom;
        const c = new P(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(a), this.object.updateMatrixWorld(), o = Ae.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (jr.origin.copy(this.object.position), jr.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(jr.direction)) < qx ? this.object.lookAt(this.target) : (jh.setFromNormalAndCoplanarPoint(this.object.up, this.target), jr.intersectPlane(jh, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), r = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, r || this._lastPosition.distanceToSquared(this.object.position) > ga || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > ga || this._lastTargetPosition.distanceToSquared(this.target) > ga ? (this.dispatchEvent(Xh), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? Xe / 60 * this.autoRotateSpeed * t : Xe / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(t) {
    const e = Math.abs(t * 0.01);
    return Math.pow(0.95, this.zoomSpeed * e);
  }
  _rotateLeft(t) {
    this._sphericalDelta.theta -= t;
  }
  _rotateUp(t) {
    this._sphericalDelta.phi -= t;
  }
  _panLeft(t, e) {
    Ae.setFromMatrixColumn(e, 0), Ae.multiplyScalar(-t), this._panOffset.add(Ae);
  }
  _panUp(t, e) {
    this.screenSpacePanning === !0 ? Ae.setFromMatrixColumn(e, 1) : (Ae.setFromMatrixColumn(e, 0), Ae.crossVectors(this.object.up, Ae)), Ae.multiplyScalar(t), this._panOffset.add(Ae);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(t, e) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const s = this.object.position;
      Ae.copy(s).sub(this.target);
      let r = Ae.length();
      r *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * r / n.clientHeight, this.object.matrix), this._panUp(2 * e * r / n.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(t * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(e * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(t, e) {
    if (!this.zoomToCursor)
      return;
    this._performCursorZoom = !0;
    const n = this.domElement.getBoundingClientRect(), s = t - n.left, r = e - n.top, o = n.width, a = n.height;
    this._mouse.x = s / o * 2 - 1, this._mouse.y = -(r / a) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(t) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, t));
  }
  //
  // event callbacks - update the object state
  //
  _handleMouseDownRotate(t) {
    this._rotateStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownDolly(t) {
    this._updateZoomParameters(t.clientX, t.clientX), this._dollyStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownPan(t) {
    this._panStart.set(t.clientX, t.clientY);
  }
  _handleMouseMoveRotate(t) {
    this._rotateEnd.set(t.clientX, t.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Xe * this._rotateDelta.x / e.clientHeight), this._rotateUp(Xe * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(t) {
    this._dollyEnd.set(t.clientX, t.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(t) {
    this._panEnd.set(t.clientX, t.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(t) {
    this._updateZoomParameters(t.clientX, t.clientY), t.deltaY < 0 ? this._dollyIn(this._getZoomScale(t.deltaY)) : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)), this.update();
  }
  _handleKeyDown(t) {
    let e = !1;
    switch (t.code) {
      case this.keys.UP:
        t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateUp(Xe * this.rotateSpeed / this.domElement.clientHeight) : this._pan(0, this.keyPanSpeed), e = !0;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateUp(-Xe * this.rotateSpeed / this.domElement.clientHeight) : this._pan(0, -this.keyPanSpeed), e = !0;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateLeft(Xe * this.rotateSpeed / this.domElement.clientHeight) : this._pan(this.keyPanSpeed, 0), e = !0;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateLeft(-Xe * this.rotateSpeed / this.domElement.clientHeight) : this._pan(-this.keyPanSpeed, 0), e = !0;
        break;
    }
    e && (t.preventDefault(), this.update());
  }
  _handleTouchStartRotate(t) {
    if (this._pointers.length === 1)
      this._rotateStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
      this._rotateStart.set(n, s);
    }
  }
  _handleTouchStartPan(t) {
    if (this._pointers.length === 1)
      this._panStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
      this._panStart.set(n, s);
    }
  }
  _handleTouchStartDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, s = t.pageY - e.y, r = Math.sqrt(n * n + s * s);
    this._dollyStart.set(0, r);
  }
  _handleTouchStartDollyPan(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enablePan && this._handleTouchStartPan(t);
  }
  _handleTouchStartDollyRotate(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enableRotate && this._handleTouchStartRotate(t);
  }
  _handleTouchMoveRotate(t) {
    if (this._pointers.length == 1)
      this._rotateEnd.set(t.pageX, t.pageY);
    else {
      const n = this._getSecondPointerPosition(t), s = 0.5 * (t.pageX + n.x), r = 0.5 * (t.pageY + n.y);
      this._rotateEnd.set(s, r);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Xe * this._rotateDelta.x / e.clientHeight), this._rotateUp(Xe * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(t) {
    if (this._pointers.length === 1)
      this._panEnd.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
      this._panEnd.set(n, s);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, s = t.pageY - e.y, r = Math.sqrt(n * n + s * s);
    this._dollyEnd.set(0, r), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const o = (t.pageX + e.x) * 0.5, a = (t.pageY + e.y) * 0.5;
    this._updateZoomParameters(o, a);
  }
  _handleTouchMoveDollyPan(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enablePan && this._handleTouchMovePan(t);
  }
  _handleTouchMoveDollyRotate(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enableRotate && this._handleTouchMoveRotate(t);
  }
  // pointers
  _addPointer(t) {
    this._pointers.push(t.pointerId);
  }
  _removePointer(t) {
    delete this._pointerPositions[t.pointerId];
    for (let e = 0; e < this._pointers.length; e++)
      if (this._pointers[e] == t.pointerId) {
        this._pointers.splice(e, 1);
        return;
      }
  }
  _isTrackingPointer(t) {
    for (let e = 0; e < this._pointers.length; e++)
      if (this._pointers[e] == t.pointerId) return !0;
    return !1;
  }
  _trackPointer(t) {
    let e = this._pointerPositions[t.pointerId];
    e === void 0 && (e = new nt(), this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY);
  }
  _getSecondPointerPosition(t) {
    const e = t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[e];
  }
  //
  _customWheelEvent(t) {
    const e = t.deltaMode, n = {
      clientX: t.clientX,
      clientY: t.clientY,
      deltaY: t.deltaY
    };
    switch (e) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return t.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
  }
}
function Zx(i) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
}
function Jx(i) {
  this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function Qx(i) {
  switch (this._removePointer(i), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(wu), this.state = pe.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function ty(i) {
  let t;
  switch (i.button) {
    case 0:
      t = this.mouseButtons.LEFT;
      break;
    case 1:
      t = this.mouseButtons.MIDDLE;
      break;
    case 2:
      t = this.mouseButtons.RIGHT;
      break;
    default:
      t = -1;
  }
  switch (t) {
    case pn.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(i), this.state = pe.DOLLY;
      break;
    case pn.ROTATE:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = pe.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = pe.ROTATE;
      }
      break;
    case pn.PAN:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = pe.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = pe.PAN;
      }
      break;
    default:
      this.state = pe.NONE;
  }
  this.state !== pe.NONE && this.dispatchEvent(Jl);
}
function ey(i) {
  switch (this.state) {
    case pe.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(i);
      break;
    case pe.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(i);
      break;
    case pe.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(i);
      break;
  }
}
function ny(i) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== pe.NONE || (i.preventDefault(), this.dispatchEvent(Jl), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(wu));
}
function iy(i) {
  this.enabled === !1 || this.enablePan === !1 || this._handleKeyDown(i);
}
function sy(i) {
  switch (this._trackPointer(i), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case mn.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(i), this.state = pe.TOUCH_ROTATE;
          break;
        case mn.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(i), this.state = pe.TOUCH_PAN;
          break;
        default:
          this.state = pe.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case mn.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(i), this.state = pe.TOUCH_DOLLY_PAN;
          break;
        case mn.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(i), this.state = pe.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = pe.NONE;
      }
      break;
    default:
      this.state = pe.NONE;
  }
  this.state !== pe.NONE && this.dispatchEvent(Jl);
}
function ry(i) {
  switch (this._trackPointer(i), this.state) {
    case pe.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(i), this.update();
      break;
    case pe.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(i), this.update();
      break;
    case pe.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(i), this.update();
      break;
    case pe.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(i), this.update();
      break;
    default:
      this.state = pe.NONE;
  }
}
function oy(i) {
  this.enabled !== !1 && i.preventDefault();
}
function ay(i) {
  i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function ly(i) {
  i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function Kh(i, t) {
  if (t === $f)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), i;
  if (t === ol || t === Bd) {
    let e = i.getIndex();
    if (e === null) {
      const o = [], a = i.getAttribute("position");
      if (a !== void 0) {
        for (let l = 0; l < a.count; l++)
          o.push(l);
        i.setIndex(o), e = i.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), i;
    }
    const n = e.count - 2, s = [];
    if (t === ol)
      for (let o = 1; o <= n; o++)
        s.push(e.getX(0)), s.push(e.getX(o)), s.push(e.getX(o + 1));
    else
      for (let o = 0; o < n; o++)
        o % 2 === 0 ? (s.push(e.getX(o)), s.push(e.getX(o + 1)), s.push(e.getX(o + 2))) : (s.push(e.getX(o + 2)), s.push(e.getX(o + 1)), s.push(e.getX(o)));
    s.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const r = i.clone();
    return r.setIndex(s), r.clearGroups(), r;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", t), i;
}
class cy extends xs {
  constructor(t) {
    super(t), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(e) {
      return new py(e);
    }), this.register(function(e) {
      return new my(e);
    }), this.register(function(e) {
      return new Ey(e);
    }), this.register(function(e) {
      return new wy(e);
    }), this.register(function(e) {
      return new Ty(e);
    }), this.register(function(e) {
      return new _y(e);
    }), this.register(function(e) {
      return new vy(e);
    }), this.register(function(e) {
      return new xy(e);
    }), this.register(function(e) {
      return new yy(e);
    }), this.register(function(e) {
      return new fy(e);
    }), this.register(function(e) {
      return new My(e);
    }), this.register(function(e) {
      return new gy(e);
    }), this.register(function(e) {
      return new by(e);
    }), this.register(function(e) {
      return new Sy(e);
    }), this.register(function(e) {
      return new dy(e);
    }), this.register(function(e) {
      return new Ay(e);
    }), this.register(function(e) {
      return new Ry(e);
    });
  }
  load(t, e, n, s) {
    const r = this;
    let o;
    if (this.resourcePath !== "")
      o = this.resourcePath;
    else if (this.path !== "") {
      const c = $s.extractUrlBase(t);
      o = $s.resolveURL(c, this.path);
    } else
      o = $s.extractUrlBase(t);
    this.manager.itemStart(t);
    const a = function(c) {
      s ? s(c) : console.error(c), r.manager.itemError(t), r.manager.itemEnd(t);
    }, l = new Mu(this.manager);
    l.setPath(this.path), l.setResponseType("arraybuffer"), l.setRequestHeader(this.requestHeader), l.setWithCredentials(this.withCredentials), l.load(t, function(c) {
      try {
        r.parse(c, o, function(h) {
          e(h), r.manager.itemEnd(t);
        }, a);
      } catch (h) {
        a(h);
      }
    }, n, a);
  }
  setDRACOLoader(t) {
    return this.dracoLoader = t, this;
  }
  setKTX2Loader(t) {
    return this.ktx2Loader = t, this;
  }
  setMeshoptDecoder(t) {
    return this.meshoptDecoder = t, this;
  }
  register(t) {
    return this.pluginCallbacks.indexOf(t) === -1 && this.pluginCallbacks.push(t), this;
  }
  unregister(t) {
    return this.pluginCallbacks.indexOf(t) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(t), 1), this;
  }
  parse(t, e, n, s) {
    let r;
    const o = {}, a = {}, l = new TextDecoder();
    if (typeof t == "string")
      r = JSON.parse(t);
    else if (t instanceof ArrayBuffer)
      if (l.decode(new Uint8Array(t, 0, 4)) === Tu) {
        try {
          o[Xt.KHR_BINARY_GLTF] = new Cy(t);
        } catch (d) {
          s && s(d);
          return;
        }
        r = JSON.parse(o[Xt.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(l.decode(t));
    else
      r = t;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      s && s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const c = new Gy(r, {
      path: e || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    c.fileLoader.setRequestHeader(this.requestHeader);
    for (let h = 0; h < this.pluginCallbacks.length; h++) {
      const d = this.pluginCallbacks[h](c);
      d.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), a[d.name] = d, o[d.name] = !0;
    }
    if (r.extensionsUsed)
      for (let h = 0; h < r.extensionsUsed.length; ++h) {
        const d = r.extensionsUsed[h], u = r.extensionsRequired || [];
        switch (d) {
          case Xt.KHR_MATERIALS_UNLIT:
            o[d] = new uy();
            break;
          case Xt.KHR_DRACO_MESH_COMPRESSION:
            o[d] = new Py(r, this.dracoLoader);
            break;
          case Xt.KHR_TEXTURE_TRANSFORM:
            o[d] = new Ly();
            break;
          case Xt.KHR_MESH_QUANTIZATION:
            o[d] = new Iy();
            break;
          default:
            u.indexOf(d) >= 0 && a[d] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + d + '".');
        }
      }
    c.setExtensions(o), c.setPlugins(a), c.parse(n, s);
  }
  parseAsync(t, e) {
    const n = this;
    return new Promise(function(s, r) {
      n.parse(t, e, s, r);
    });
  }
}
function hy() {
  let i = {};
  return {
    get: function(t) {
      return i[t];
    },
    add: function(t, e) {
      i[t] = e;
    },
    remove: function(t) {
      delete i[t];
    },
    removeAll: function() {
      i = {};
    }
  };
}
const Xt = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class dy {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const t = this.parser, e = this.parser.json.nodes || [];
    for (let n = 0, s = e.length; n < s; n++) {
      const r = e[n];
      r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && t._addNodeRef(this.cache, r.extensions[this.name].light);
    }
  }
  _loadLight(t) {
    const e = this.parser, n = "light:" + t;
    let s = e.cache.get(n);
    if (s) return s;
    const r = e.json, l = ((r.extensions && r.extensions[this.name] || {}).lights || [])[t];
    let c;
    const h = new Ct(16777215);
    l.color !== void 0 && h.setRGB(l.color[0], l.color[1], l.color[2], Oe);
    const d = l.range !== void 0 ? l.range : 0;
    switch (l.type) {
      case "directional":
        c = new ql(h), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new bu(h), c.distance = d;
        break;
      case "spot":
        c = new Lx(h), c.distance = d, l.spot = l.spot || {}, l.spot.innerConeAngle = l.spot.innerConeAngle !== void 0 ? l.spot.innerConeAngle : 0, l.spot.outerConeAngle = l.spot.outerConeAngle !== void 0 ? l.spot.outerConeAngle : Math.PI / 4, c.angle = l.spot.outerConeAngle, c.penumbra = 1 - l.spot.innerConeAngle / l.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + l.type);
    }
    return c.position.set(0, 0, 0), c.decay = 2, On(c, l), l.intensity !== void 0 && (c.intensity = l.intensity), c.name = e.createUniqueName(l.name || "light_" + t), s = Promise.resolve(c), e.cache.add(n, s), s;
  }
  getDependency(t, e) {
    if (t === "light")
      return this._loadLight(e);
  }
  createNodeAttachment(t) {
    const e = this, n = this.parser, r = n.json.nodes[t], a = (r.extensions && r.extensions[this.name] || {}).light;
    return a === void 0 ? null : this._loadLight(a).then(function(l) {
      return n._getNodeRef(e.cache, a, l);
    });
  }
}
class uy {
  constructor() {
    this.name = Xt.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return en;
  }
  extendParams(t, e, n) {
    const s = [];
    t.color = new Ct(1, 1, 1), t.opacity = 1;
    const r = e.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const o = r.baseColorFactor;
        t.color.setRGB(o[0], o[1], o[2], Oe), t.opacity = o[3];
      }
      r.baseColorTexture !== void 0 && s.push(n.assignTexture(t, "map", r.baseColorTexture, ke));
    }
    return Promise.all(s);
  }
}
class fy {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(t, e) {
    const s = this.parser.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name].emissiveStrength;
    return r !== void 0 && (e.emissiveIntensity = r), Promise.resolve();
  }
}
class py {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    if (o.clearcoatFactor !== void 0 && (e.clearcoat = o.clearcoatFactor), o.clearcoatTexture !== void 0 && r.push(n.assignTexture(e, "clearcoatMap", o.clearcoatTexture)), o.clearcoatRoughnessFactor !== void 0 && (e.clearcoatRoughness = o.clearcoatRoughnessFactor), o.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(e, "clearcoatRoughnessMap", o.clearcoatRoughnessTexture)), o.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(e, "clearcoatNormalMap", o.clearcoatNormalTexture)), o.clearcoatNormalTexture.scale !== void 0)) {
      const a = o.clearcoatNormalTexture.scale;
      e.clearcoatNormalScale = new nt(a, a);
    }
    return Promise.all(r);
  }
}
class my {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const s = this.parser.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name];
    return e.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
}
class gy {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    return o.iridescenceFactor !== void 0 && (e.iridescence = o.iridescenceFactor), o.iridescenceTexture !== void 0 && r.push(n.assignTexture(e, "iridescenceMap", o.iridescenceTexture)), o.iridescenceIor !== void 0 && (e.iridescenceIOR = o.iridescenceIor), e.iridescenceThicknessRange === void 0 && (e.iridescenceThicknessRange = [100, 400]), o.iridescenceThicknessMinimum !== void 0 && (e.iridescenceThicknessRange[0] = o.iridescenceThicknessMinimum), o.iridescenceThicknessMaximum !== void 0 && (e.iridescenceThicknessRange[1] = o.iridescenceThicknessMaximum), o.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(e, "iridescenceThicknessMap", o.iridescenceThicknessTexture)), Promise.all(r);
  }
}
class _y {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [];
    e.sheenColor = new Ct(0, 0, 0), e.sheenRoughness = 0, e.sheen = 1;
    const o = s.extensions[this.name];
    if (o.sheenColorFactor !== void 0) {
      const a = o.sheenColorFactor;
      e.sheenColor.setRGB(a[0], a[1], a[2], Oe);
    }
    return o.sheenRoughnessFactor !== void 0 && (e.sheenRoughness = o.sheenRoughnessFactor), o.sheenColorTexture !== void 0 && r.push(n.assignTexture(e, "sheenColorMap", o.sheenColorTexture, ke)), o.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(e, "sheenRoughnessMap", o.sheenRoughnessTexture)), Promise.all(r);
  }
}
class vy {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    return o.transmissionFactor !== void 0 && (e.transmission = o.transmissionFactor), o.transmissionTexture !== void 0 && r.push(n.assignTexture(e, "transmissionMap", o.transmissionTexture)), Promise.all(r);
  }
}
class xy {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    e.thickness = o.thicknessFactor !== void 0 ? o.thicknessFactor : 0, o.thicknessTexture !== void 0 && r.push(n.assignTexture(e, "thicknessMap", o.thicknessTexture)), e.attenuationDistance = o.attenuationDistance || 1 / 0;
    const a = o.attenuationColor || [1, 1, 1];
    return e.attenuationColor = new Ct().setRGB(a[0], a[1], a[2], Oe), Promise.all(r);
  }
}
class yy {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_IOR;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const s = this.parser.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name];
    return e.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
}
class My {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    e.specularIntensity = o.specularFactor !== void 0 ? o.specularFactor : 1, o.specularTexture !== void 0 && r.push(n.assignTexture(e, "specularIntensityMap", o.specularTexture));
    const a = o.specularColorFactor || [1, 1, 1];
    return e.specularColor = new Ct().setRGB(a[0], a[1], a[2], Oe), o.specularColorTexture !== void 0 && r.push(n.assignTexture(e, "specularColorMap", o.specularColorTexture, ke)), Promise.all(r);
  }
}
class Sy {
  constructor(t) {
    this.parser = t, this.name = Xt.EXT_MATERIALS_BUMP;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    return e.bumpScale = o.bumpFactor !== void 0 ? o.bumpFactor : 1, o.bumpTexture !== void 0 && r.push(n.assignTexture(e, "bumpMap", o.bumpTexture)), Promise.all(r);
  }
}
class by {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(t) {
    const n = this.parser.json.materials[t];
    return !n.extensions || !n.extensions[this.name] ? null : Tn;
  }
  extendMaterialParams(t, e) {
    const n = this.parser, s = n.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], o = s.extensions[this.name];
    return o.anisotropyStrength !== void 0 && (e.anisotropy = o.anisotropyStrength), o.anisotropyRotation !== void 0 && (e.anisotropyRotation = o.anisotropyRotation), o.anisotropyTexture !== void 0 && r.push(n.assignTexture(e, "anisotropyMap", o.anisotropyTexture)), Promise.all(r);
  }
}
class Ey {
  constructor(t) {
    this.parser = t, this.name = Xt.KHR_TEXTURE_BASISU;
  }
  loadTexture(t) {
    const e = this.parser, n = e.json, s = n.textures[t];
    if (!s.extensions || !s.extensions[this.name])
      return null;
    const r = s.extensions[this.name], o = e.options.ktx2Loader;
    if (!o) {
      if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return e.loadTextureImage(t, r.source, o);
  }
}
class wy {
  constructor(t) {
    this.parser = t, this.name = Xt.EXT_TEXTURE_WEBP, this.isSupported = null;
  }
  loadTexture(t) {
    const e = this.name, n = this.parser, s = n.json, r = s.textures[t];
    if (!r.extensions || !r.extensions[e])
      return null;
    const o = r.extensions[e], a = s.images[o.source];
    let l = n.textureLoader;
    if (a.uri) {
      const c = n.options.manager.getHandler(a.uri);
      c !== null && (l = c);
    }
    return this.detectSupport().then(function(c) {
      if (c) return n.loadTextureImage(t, o.source, l);
      if (s.extensionsRequired && s.extensionsRequired.indexOf(e) >= 0)
        throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
      return n.loadTexture(t);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(t) {
      const e = new Image();
      e.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", e.onload = e.onerror = function() {
        t(e.height === 1);
      };
    })), this.isSupported;
  }
}
class Ty {
  constructor(t) {
    this.parser = t, this.name = Xt.EXT_TEXTURE_AVIF, this.isSupported = null;
  }
  loadTexture(t) {
    const e = this.name, n = this.parser, s = n.json, r = s.textures[t];
    if (!r.extensions || !r.extensions[e])
      return null;
    const o = r.extensions[e], a = s.images[o.source];
    let l = n.textureLoader;
    if (a.uri) {
      const c = n.options.manager.getHandler(a.uri);
      c !== null && (l = c);
    }
    return this.detectSupport().then(function(c) {
      if (c) return n.loadTextureImage(t, o.source, l);
      if (s.extensionsRequired && s.extensionsRequired.indexOf(e) >= 0)
        throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
      return n.loadTexture(t);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(t) {
      const e = new Image();
      e.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=", e.onload = e.onerror = function() {
        t(e.height === 1);
      };
    })), this.isSupported;
  }
}
class Ay {
  constructor(t) {
    this.name = Xt.EXT_MESHOPT_COMPRESSION, this.parser = t;
  }
  loadBufferView(t) {
    const e = this.parser.json, n = e.bufferViews[t];
    if (n.extensions && n.extensions[this.name]) {
      const s = n.extensions[this.name], r = this.parser.getDependency("buffer", s.buffer), o = this.parser.options.meshoptDecoder;
      if (!o || !o.supported) {
        if (e.extensionsRequired && e.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return r.then(function(a) {
        const l = s.byteOffset || 0, c = s.byteLength || 0, h = s.count, d = s.byteStride, u = new Uint8Array(a, l, c);
        return o.decodeGltfBufferAsync ? o.decodeGltfBufferAsync(h, d, u, s.mode, s.filter).then(function(f) {
          return f.buffer;
        }) : o.ready.then(function() {
          const f = new ArrayBuffer(h * d);
          return o.decodeGltfBuffer(new Uint8Array(f), h, d, u, s.mode, s.filter), f;
        });
      });
    } else
      return null;
  }
}
class Ry {
  constructor(t) {
    this.name = Xt.EXT_MESH_GPU_INSTANCING, this.parser = t;
  }
  createNodeMesh(t) {
    const e = this.parser.json, n = e.nodes[t];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const s = e.meshes[n.mesh];
    for (const c of s.primitives)
      if (c.mode !== rn.TRIANGLES && c.mode !== rn.TRIANGLE_STRIP && c.mode !== rn.TRIANGLE_FAN && c.mode !== void 0)
        return null;
    const o = n.extensions[this.name].attributes, a = [], l = {};
    for (const c in o)
      a.push(this.parser.getDependency("accessor", o[c]).then((h) => (l[c] = h, l[c])));
    return a.length < 1 ? null : (a.push(this.parser.createNodeMesh(t)), Promise.all(a).then((c) => {
      const h = c.pop(), d = h.isGroup ? h.children : [h], u = c[0].count, f = [];
      for (const g of d) {
        const v = new Ft(), p = new P(), m = new Sn(), x = new P(1, 1, 1), _ = new Ov(g.geometry, g.material, u);
        for (let M = 0; M < u; M++)
          l.TRANSLATION && p.fromBufferAttribute(l.TRANSLATION, M), l.ROTATION && m.fromBufferAttribute(l.ROTATION, M), l.SCALE && x.fromBufferAttribute(l.SCALE, M), _.setMatrixAt(M, v.compose(p, m, x));
        for (const M in l)
          if (M === "_COLOR_0") {
            const L = l[M];
            _.instanceColor = new cl(L.array, L.itemSize, L.normalized);
          } else M !== "TRANSLATION" && M !== "ROTATION" && M !== "SCALE" && g.geometry.setAttribute(M, l[M]);
        ye.prototype.copy.call(_, g), this.parser.assignFinalMaterial(_), f.push(_);
      }
      return h.isGroup ? (h.clear(), h.add(...f), h) : f[0];
    }));
  }
}
const Tu = "glTF", Ds = 12, qh = { JSON: 1313821514, BIN: 5130562 };
class Cy {
  constructor(t) {
    this.name = Xt.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const e = new DataView(t, 0, Ds), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(t.slice(0, 4))),
      version: e.getUint32(4, !0),
      length: e.getUint32(8, !0)
    }, this.header.magic !== Tu)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - Ds, r = new DataView(t, Ds);
    let o = 0;
    for (; o < s; ) {
      const a = r.getUint32(o, !0);
      o += 4;
      const l = r.getUint32(o, !0);
      if (o += 4, l === qh.JSON) {
        const c = new Uint8Array(t, Ds + o, a);
        this.content = n.decode(c);
      } else if (l === qh.BIN) {
        const c = Ds + o;
        this.body = t.slice(c, c + a);
      }
      o += a;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Py {
  constructor(t, e) {
    if (!e)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = Xt.KHR_DRACO_MESH_COMPRESSION, this.json = t, this.dracoLoader = e, this.dracoLoader.preload();
  }
  decodePrimitive(t, e) {
    const n = this.json, s = this.dracoLoader, r = t.extensions[this.name].bufferView, o = t.extensions[this.name].attributes, a = {}, l = {}, c = {};
    for (const h in o) {
      const d = pl[h] || h.toLowerCase();
      a[d] = o[h];
    }
    for (const h in t.attributes) {
      const d = pl[h] || h.toLowerCase();
      if (o[h] !== void 0) {
        const u = n.accessors[t.attributes[h]], f = ns[u.componentType];
        c[d] = f.name, l[d] = u.normalized === !0;
      }
    }
    return e.getDependency("bufferView", r).then(function(h) {
      return new Promise(function(d, u) {
        s.decodeDracoFile(h, function(f) {
          for (const g in f.attributes) {
            const v = f.attributes[g], p = l[g];
            p !== void 0 && (v.normalized = p);
          }
          d(f);
        }, a, c, Oe, u);
      });
    });
  }
}
class Ly {
  constructor() {
    this.name = Xt.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(t, e) {
    return (e.texCoord === void 0 || e.texCoord === t.channel) && e.offset === void 0 && e.rotation === void 0 && e.scale === void 0 || (t = t.clone(), e.texCoord !== void 0 && (t.channel = e.texCoord), e.offset !== void 0 && t.offset.fromArray(e.offset), e.rotation !== void 0 && (t.rotation = e.rotation), e.scale !== void 0 && t.repeat.fromArray(e.scale), t.needsUpdate = !0), t;
  }
}
class Iy {
  constructor() {
    this.name = Xt.KHR_MESH_QUANTIZATION;
  }
}
class Au extends lr {
  constructor(t, e, n, s) {
    super(t, e, n, s);
  }
  copySampleValue_(t) {
    const e = this.resultBuffer, n = this.sampleValues, s = this.valueSize, r = t * s * 3 + s;
    for (let o = 0; o !== s; o++)
      e[o] = n[r + o];
    return e;
  }
  interpolate_(t, e, n, s) {
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = a * 2, c = a * 3, h = s - e, d = (n - e) / h, u = d * d, f = u * d, g = t * c, v = g - c, p = -2 * f + 3 * u, m = f - u, x = 1 - p, _ = m - u + d;
    for (let M = 0; M !== a; M++) {
      const L = o[v + M + a], T = o[v + M + l] * h, w = o[g + M + a], R = o[g + M] * h;
      r[M] = x * L + _ * T + p * w + m * R;
    }
    return r;
  }
}
const Dy = new Sn();
class Ny extends Au {
  interpolate_(t, e, n, s) {
    const r = super.interpolate_(t, e, n, s);
    return Dy.fromArray(r).normalize().toArray(r), r;
  }
}
const rn = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, ns = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, Yh = {
  9728: Ve,
  9729: tn,
  9984: Rd,
  9985: Jr,
  9986: Fs,
  9987: Bn
}, Zh = {
  33071: ni,
  33648: lo,
  10497: oi
}, _a = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, pl = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv1",
  TEXCOORD_2: "uv2",
  TEXCOORD_3: "uv3",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
}, Zn = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, Uy = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: Zs,
  STEP: Ys
}, va = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Oy(i) {
  return i.DefaultMaterial === void 0 && (i.DefaultMaterial = new zn({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: Hn
  })), i.DefaultMaterial;
}
function _i(i, t, e) {
  for (const n in e.extensions)
    i[n] === void 0 && (t.userData.gltfExtensions = t.userData.gltfExtensions || {}, t.userData.gltfExtensions[n] = e.extensions[n]);
}
function On(i, t) {
  t.extras !== void 0 && (typeof t.extras == "object" ? Object.assign(i.userData, t.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + t.extras));
}
function Fy(i, t, e) {
  let n = !1, s = !1, r = !1;
  for (let c = 0, h = t.length; c < h; c++) {
    const d = t[c];
    if (d.POSITION !== void 0 && (n = !0), d.NORMAL !== void 0 && (s = !0), d.COLOR_0 !== void 0 && (r = !0), n && s && r) break;
  }
  if (!n && !s && !r) return Promise.resolve(i);
  const o = [], a = [], l = [];
  for (let c = 0, h = t.length; c < h; c++) {
    const d = t[c];
    if (n) {
      const u = d.POSITION !== void 0 ? e.getDependency("accessor", d.POSITION) : i.attributes.position;
      o.push(u);
    }
    if (s) {
      const u = d.NORMAL !== void 0 ? e.getDependency("accessor", d.NORMAL) : i.attributes.normal;
      a.push(u);
    }
    if (r) {
      const u = d.COLOR_0 !== void 0 ? e.getDependency("accessor", d.COLOR_0) : i.attributes.color;
      l.push(u);
    }
  }
  return Promise.all([
    Promise.all(o),
    Promise.all(a),
    Promise.all(l)
  ]).then(function(c) {
    const h = c[0], d = c[1], u = c[2];
    return n && (i.morphAttributes.position = h), s && (i.morphAttributes.normal = d), r && (i.morphAttributes.color = u), i.morphTargetsRelative = !0, i;
  });
}
function By(i, t) {
  if (i.updateMorphTargets(), t.weights !== void 0)
    for (let e = 0, n = t.weights.length; e < n; e++)
      i.morphTargetInfluences[e] = t.weights[e];
  if (t.extras && Array.isArray(t.extras.targetNames)) {
    const e = t.extras.targetNames;
    if (i.morphTargetInfluences.length === e.length) {
      i.morphTargetDictionary = {};
      for (let n = 0, s = e.length; n < s; n++)
        i.morphTargetDictionary[e[n]] = n;
    } else
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function ky(i) {
  let t;
  const e = i.extensions && i.extensions[Xt.KHR_DRACO_MESH_COMPRESSION];
  if (e ? t = "draco:" + e.bufferView + ":" + e.indices + ":" + xa(e.attributes) : t = i.indices + ":" + xa(i.attributes) + ":" + i.mode, i.targets !== void 0)
    for (let n = 0, s = i.targets.length; n < s; n++)
      t += ":" + xa(i.targets[n]);
  return t;
}
function xa(i) {
  let t = "";
  const e = Object.keys(i).sort();
  for (let n = 0, s = e.length; n < s; n++)
    t += e[n] + ":" + i[e[n]] + ";";
  return t;
}
function ml(i) {
  switch (i) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function zy(i) {
  return i.search(/\.jpe?g($|\?)/i) > 0 || i.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : i.search(/\.webp($|\?)/i) > 0 || i.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const Hy = new Ft();
class Gy {
  constructor(t = {}, e = {}) {
    this.json = t, this.extensions = {}, this.plugins = {}, this.options = e, this.cache = new hy(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, s = -1, r = !1, o = -1;
    if (typeof navigator < "u") {
      const a = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(a) === !0;
      const l = a.match(/Version\/(\d+)/);
      s = n && l ? parseInt(l[1], 10) : -1, r = a.indexOf("Firefox") > -1, o = r ? a.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && s < 17 || r && o < 98 ? this.textureLoader = new Su(this.options.manager) : this.textureLoader = new Nx(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new Mu(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(t) {
    this.extensions = t;
  }
  setPlugins(t) {
    this.plugins = t;
  }
  parse(t, e) {
    const n = this, s = this.json, r = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(o) {
      return o._markDefs && o._markDefs();
    }), Promise.all(this._invokeAll(function(o) {
      return o.beforeRoot && o.beforeRoot();
    })).then(function() {
      return Promise.all([
        n.getDependencies("scene"),
        n.getDependencies("animation"),
        n.getDependencies("camera")
      ]);
    }).then(function(o) {
      const a = {
        scene: o[0][s.scene || 0],
        scenes: o[0],
        animations: o[1],
        cameras: o[2],
        asset: s.asset,
        parser: n,
        userData: {}
      };
      return _i(r, a, s), On(a, s), Promise.all(n._invokeAll(function(l) {
        return l.afterRoot && l.afterRoot(a);
      })).then(function() {
        for (const l of a.scenes)
          l.updateMatrixWorld();
        t(a);
      });
    }).catch(e);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   */
  _markDefs() {
    const t = this.json.nodes || [], e = this.json.skins || [], n = this.json.meshes || [];
    for (let s = 0, r = e.length; s < r; s++) {
      const o = e[s].joints;
      for (let a = 0, l = o.length; a < l; a++)
        t[o[a]].isBone = !0;
    }
    for (let s = 0, r = t.length; s < r; s++) {
      const o = t[s];
      o.mesh !== void 0 && (this._addNodeRef(this.meshCache, o.mesh), o.skin !== void 0 && (n[o.mesh].isSkinnedMesh = !0)), o.camera !== void 0 && this._addNodeRef(this.cameraCache, o.camera);
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   */
  _addNodeRef(t, e) {
    e !== void 0 && (t.refs[e] === void 0 && (t.refs[e] = t.uses[e] = 0), t.refs[e]++);
  }
  /** Returns a reference to a shared resource, cloning it if necessary. */
  _getNodeRef(t, e, n) {
    if (t.refs[e] <= 1) return n;
    const s = n.clone(), r = (o, a) => {
      const l = this.associations.get(o);
      l != null && this.associations.set(a, l);
      for (const [c, h] of o.children.entries())
        r(h, a.children[c]);
    };
    return r(n, s), s.name += "_instance_" + t.uses[e]++, s;
  }
  _invokeOne(t) {
    const e = Object.values(this.plugins);
    e.push(this);
    for (let n = 0; n < e.length; n++) {
      const s = t(e[n]);
      if (s) return s;
    }
    return null;
  }
  _invokeAll(t) {
    const e = Object.values(this.plugins);
    e.unshift(this);
    const n = [];
    for (let s = 0; s < e.length; s++) {
      const r = t(e[s]);
      r && n.push(r);
    }
    return n;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(t, e) {
    const n = t + ":" + e;
    let s = this.cache.get(n);
    if (!s) {
      switch (t) {
        case "scene":
          s = this.loadScene(e);
          break;
        case "node":
          s = this._invokeOne(function(r) {
            return r.loadNode && r.loadNode(e);
          });
          break;
        case "mesh":
          s = this._invokeOne(function(r) {
            return r.loadMesh && r.loadMesh(e);
          });
          break;
        case "accessor":
          s = this.loadAccessor(e);
          break;
        case "bufferView":
          s = this._invokeOne(function(r) {
            return r.loadBufferView && r.loadBufferView(e);
          });
          break;
        case "buffer":
          s = this.loadBuffer(e);
          break;
        case "material":
          s = this._invokeOne(function(r) {
            return r.loadMaterial && r.loadMaterial(e);
          });
          break;
        case "texture":
          s = this._invokeOne(function(r) {
            return r.loadTexture && r.loadTexture(e);
          });
          break;
        case "skin":
          s = this.loadSkin(e);
          break;
        case "animation":
          s = this._invokeOne(function(r) {
            return r.loadAnimation && r.loadAnimation(e);
          });
          break;
        case "camera":
          s = this.loadCamera(e);
          break;
        default:
          if (s = this._invokeOne(function(r) {
            return r != this && r.getDependency && r.getDependency(t, e);
          }), !s)
            throw new Error("Unknown type: " + t);
          break;
      }
      this.cache.add(n, s);
    }
    return s;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(t) {
    let e = this.cache.get(t);
    if (!e) {
      const n = this, s = this.json[t + (t === "mesh" ? "es" : "s")] || [];
      e = Promise.all(s.map(function(r, o) {
        return n.getDependency(t, o);
      })), this.cache.add(t, e);
    }
    return e;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(t) {
    const e = this.json.buffers[t], n = this.fileLoader;
    if (e.type && e.type !== "arraybuffer")
      throw new Error("THREE.GLTFLoader: " + e.type + " buffer type is not supported.");
    if (e.uri === void 0 && t === 0)
      return Promise.resolve(this.extensions[Xt.KHR_BINARY_GLTF].body);
    const s = this.options;
    return new Promise(function(r, o) {
      n.load($s.resolveURL(e.uri, s.path), r, void 0, function() {
        o(new Error('THREE.GLTFLoader: Failed to load buffer "' + e.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(t) {
    const e = this.json.bufferViews[t];
    return this.getDependency("buffer", e.buffer).then(function(n) {
      const s = e.byteLength || 0, r = e.byteOffset || 0;
      return n.slice(r, r + s);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(t) {
    const e = this, n = this.json, s = this.json.accessors[t];
    if (s.bufferView === void 0 && s.sparse === void 0) {
      const o = _a[s.type], a = ns[s.componentType], l = s.normalized === !0, c = new a(s.count * o);
      return Promise.resolve(new Ue(c, o, l));
    }
    const r = [];
    return s.bufferView !== void 0 ? r.push(this.getDependency("bufferView", s.bufferView)) : r.push(null), s.sparse !== void 0 && (r.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(r).then(function(o) {
      const a = o[0], l = _a[s.type], c = ns[s.componentType], h = c.BYTES_PER_ELEMENT, d = h * l, u = s.byteOffset || 0, f = s.bufferView !== void 0 ? n.bufferViews[s.bufferView].byteStride : void 0, g = s.normalized === !0;
      let v, p;
      if (f && f !== d) {
        const m = Math.floor(u / f), x = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + m + ":" + s.count;
        let _ = e.cache.get(x);
        _ || (v = new c(a, m * f, s.count * f / h), _ = new su(v, f / h), e.cache.add(x, _)), p = new Qs(_, l, u % f / h, g);
      } else
        a === null ? v = new c(s.count * l) : v = new c(a, u, s.count * l), p = new Ue(v, l, g);
      if (s.sparse !== void 0) {
        const m = _a.SCALAR, x = ns[s.sparse.indices.componentType], _ = s.sparse.indices.byteOffset || 0, M = s.sparse.values.byteOffset || 0, L = new x(o[1], _, s.sparse.count * m), T = new c(o[2], M, s.sparse.count * l);
        a !== null && (p = new Ue(p.array.slice(), p.itemSize, p.normalized)), p.normalized = !1;
        for (let w = 0, R = L.length; w < R; w++) {
          const F = L[w];
          if (p.setX(F, T[w * l]), l >= 2 && p.setY(F, T[w * l + 1]), l >= 3 && p.setZ(F, T[w * l + 2]), l >= 4 && p.setW(F, T[w * l + 3]), l >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        p.normalized = g;
      }
      return p;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   * @param {number} textureIndex
   * @return {Promise<THREE.Texture|null>}
   */
  loadTexture(t) {
    const e = this.json, n = this.options, r = e.textures[t].source, o = e.images[r];
    let a = this.textureLoader;
    if (o.uri) {
      const l = n.manager.getHandler(o.uri);
      l !== null && (a = l);
    }
    return this.loadTextureImage(t, r, a);
  }
  loadTextureImage(t, e, n) {
    const s = this, r = this.json, o = r.textures[t], a = r.images[e], l = (a.uri || a.bufferView) + ":" + o.sampler;
    if (this.textureCache[l])
      return this.textureCache[l];
    const c = this.loadImageSource(e, n).then(function(h) {
      h.flipY = !1, h.name = o.name || a.name || "", h.name === "" && typeof a.uri == "string" && a.uri.startsWith("data:image/") === !1 && (h.name = a.uri);
      const u = (r.samplers || {})[o.sampler] || {};
      return h.magFilter = Yh[u.magFilter] || tn, h.minFilter = Yh[u.minFilter] || Bn, h.wrapS = Zh[u.wrapS] || oi, h.wrapT = Zh[u.wrapT] || oi, s.associations.set(h, { textures: t }), h;
    }).catch(function() {
      return null;
    });
    return this.textureCache[l] = c, c;
  }
  loadImageSource(t, e) {
    const n = this, s = this.json, r = this.options;
    if (this.sourceCache[t] !== void 0)
      return this.sourceCache[t].then((d) => d.clone());
    const o = s.images[t], a = self.URL || self.webkitURL;
    let l = o.uri || "", c = !1;
    if (o.bufferView !== void 0)
      l = n.getDependency("bufferView", o.bufferView).then(function(d) {
        c = !0;
        const u = new Blob([d], { type: o.mimeType });
        return l = a.createObjectURL(u), l;
      });
    else if (o.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + t + " is missing URI and bufferView");
    const h = Promise.resolve(l).then(function(d) {
      return new Promise(function(u, f) {
        let g = u;
        e.isImageBitmapLoader === !0 && (g = function(v) {
          const p = new Ce(v);
          p.needsUpdate = !0, u(p);
        }), e.load($s.resolveURL(d, r.path), g, void 0, f);
      });
    }).then(function(d) {
      return c === !0 && a.revokeObjectURL(l), On(d, o), d.userData.mimeType = o.mimeType || zy(o.uri), d;
    }).catch(function(d) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", l), d;
    });
    return this.sourceCache[t] = h, h;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @return {Promise<Texture>}
   */
  assignTexture(t, e, n, s) {
    const r = this;
    return this.getDependency("texture", n.index).then(function(o) {
      if (!o) return null;
      if (n.texCoord !== void 0 && n.texCoord > 0 && (o = o.clone(), o.channel = n.texCoord), r.extensions[Xt.KHR_TEXTURE_TRANSFORM]) {
        const a = n.extensions !== void 0 ? n.extensions[Xt.KHR_TEXTURE_TRANSFORM] : void 0;
        if (a) {
          const l = r.associations.get(o);
          o = r.extensions[Xt.KHR_TEXTURE_TRANSFORM].extendTexture(o, a), r.associations.set(o, l);
        }
      }
      return s !== void 0 && (o.colorSpace = s), t[e] = o, o;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   * @param  {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(t) {
    const e = t.geometry;
    let n = t.material;
    const s = e.attributes.tangent === void 0, r = e.attributes.color !== void 0, o = e.attributes.normal === void 0;
    if (t.isPoints) {
      const a = "PointsMaterial:" + n.uuid;
      let l = this.cache.get(a);
      l || (l = new cu(), vn.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, l.sizeAttenuation = !1, this.cache.add(a, l)), n = l;
    } else if (t.isLine) {
      const a = "LineBasicMaterial:" + n.uuid;
      let l = this.cache.get(a);
      l || (l = new wo(), vn.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, this.cache.add(a, l)), n = l;
    }
    if (s || r || o) {
      let a = "ClonedMaterial:" + n.uuid + ":";
      s && (a += "derivative-tangents:"), r && (a += "vertex-colors:"), o && (a += "flat-shading:");
      let l = this.cache.get(a);
      l || (l = n.clone(), r && (l.vertexColors = !0), o && (l.flatShading = !0), s && (l.normalScale && (l.normalScale.y *= -1), l.clearcoatNormalScale && (l.clearcoatNormalScale.y *= -1)), this.cache.add(a, l), this.associations.set(l, this.associations.get(n))), n = l;
    }
    t.material = n;
  }
  getMaterialType() {
    return zn;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(t) {
    const e = this, n = this.json, s = this.extensions, r = n.materials[t];
    let o;
    const a = {}, l = r.extensions || {}, c = [];
    if (l[Xt.KHR_MATERIALS_UNLIT]) {
      const d = s[Xt.KHR_MATERIALS_UNLIT];
      o = d.getMaterialType(), c.push(d.extendParams(a, r, e));
    } else {
      const d = r.pbrMetallicRoughness || {};
      if (a.color = new Ct(1, 1, 1), a.opacity = 1, Array.isArray(d.baseColorFactor)) {
        const u = d.baseColorFactor;
        a.color.setRGB(u[0], u[1], u[2], Oe), a.opacity = u[3];
      }
      d.baseColorTexture !== void 0 && c.push(e.assignTexture(a, "map", d.baseColorTexture, ke)), a.metalness = d.metallicFactor !== void 0 ? d.metallicFactor : 1, a.roughness = d.roughnessFactor !== void 0 ? d.roughnessFactor : 1, d.metallicRoughnessTexture !== void 0 && (c.push(e.assignTexture(a, "metalnessMap", d.metallicRoughnessTexture)), c.push(e.assignTexture(a, "roughnessMap", d.metallicRoughnessTexture))), o = this._invokeOne(function(u) {
        return u.getMaterialType && u.getMaterialType(t);
      }), c.push(Promise.all(this._invokeAll(function(u) {
        return u.extendMaterialParams && u.extendMaterialParams(t, a);
      })));
    }
    r.doubleSided === !0 && (a.side = on);
    const h = r.alphaMode || va.OPAQUE;
    if (h === va.BLEND ? (a.transparent = !0, a.depthWrite = !1) : (a.transparent = !1, h === va.MASK && (a.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && o !== en && (c.push(e.assignTexture(a, "normalMap", r.normalTexture)), a.normalScale = new nt(1, 1), r.normalTexture.scale !== void 0)) {
      const d = r.normalTexture.scale;
      a.normalScale.set(d, d);
    }
    if (r.occlusionTexture !== void 0 && o !== en && (c.push(e.assignTexture(a, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (a.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && o !== en) {
      const d = r.emissiveFactor;
      a.emissive = new Ct().setRGB(d[0], d[1], d[2], Oe);
    }
    return r.emissiveTexture !== void 0 && o !== en && c.push(e.assignTexture(a, "emissiveMap", r.emissiveTexture, ke)), Promise.all(c).then(function() {
      const d = new o(a);
      return r.name && (d.name = r.name), On(d, r), e.associations.set(d, { materials: t }), r.extensions && _i(s, d, r), d;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(t) {
    const e = de.sanitizeNodeName(t || "");
    return e in this.nodeNamesUsed ? e + "_" + ++this.nodeNamesUsed[e] : (this.nodeNamesUsed[e] = 0, e);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(t) {
    const e = this, n = this.extensions, s = this.primitiveCache;
    function r(a) {
      return n[Xt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a, e).then(function(l) {
        return Jh(l, a, e);
      });
    }
    const o = [];
    for (let a = 0, l = t.length; a < l; a++) {
      const c = t[a], h = ky(c), d = s[h];
      if (d)
        o.push(d.promise);
      else {
        let u;
        c.extensions && c.extensions[Xt.KHR_DRACO_MESH_COMPRESSION] ? u = r(c) : u = Jh(new Ie(), c, e), s[h] = { primitive: c, promise: u }, o.push(u);
      }
    }
    return Promise.all(o);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh>}
   */
  loadMesh(t) {
    const e = this, n = this.json, s = this.extensions, r = n.meshes[t], o = r.primitives, a = [];
    for (let l = 0, c = o.length; l < c; l++) {
      const h = o[l].material === void 0 ? Oy(this.cache) : this.getDependency("material", o[l].material);
      a.push(h);
    }
    return a.push(e.loadGeometries(o)), Promise.all(a).then(function(l) {
      const c = l.slice(0, l.length - 1), h = l[l.length - 1], d = [];
      for (let f = 0, g = h.length; f < g; f++) {
        const v = h[f], p = o[f];
        let m;
        const x = c[f];
        if (p.mode === rn.TRIANGLES || p.mode === rn.TRIANGLE_STRIP || p.mode === rn.TRIANGLE_FAN || p.mode === void 0)
          m = r.isSkinnedMesh === !0 ? new Dv(v, x) : new ge(v, x), m.isSkinnedMesh === !0 && m.normalizeSkinWeights(), p.mode === rn.TRIANGLE_STRIP ? m.geometry = Kh(m.geometry, Bd) : p.mode === rn.TRIANGLE_FAN && (m.geometry = Kh(m.geometry, ol));
        else if (p.mode === rn.LINES)
          m = new zl(v, x);
        else if (p.mode === rn.LINE_STRIP)
          m = new kl(v, x);
        else if (p.mode === rn.LINE_LOOP)
          m = new Fv(v, x);
        else if (p.mode === rn.POINTS)
          m = new Bv(v, x);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
        Object.keys(m.geometry.morphAttributes).length > 0 && By(m, r), m.name = e.createUniqueName(r.name || "mesh_" + t), On(m, r), p.extensions && _i(s, m, p), e.assignFinalMaterial(m), d.push(m);
      }
      for (let f = 0, g = d.length; f < g; f++)
        e.associations.set(d[f], {
          meshes: t,
          primitives: f
        });
      if (d.length === 1)
        return r.extensions && _i(s, d[0], r), d[0];
      const u = new K();
      r.extensions && _i(s, u, r), e.associations.set(u, { meshes: t });
      for (let f = 0, g = d.length; f < g; f++)
        u.add(d[f]);
      return u;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   * @param {number} cameraIndex
   * @return {Promise<THREE.Camera>}
   */
  loadCamera(t) {
    let e;
    const n = this.json.cameras[t], s = n[n.type];
    if (!s) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return n.type === "perspective" ? e = new ze(ts.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : n.type === "orthographic" && (e = new Ol(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), n.name && (e.name = this.createUniqueName(n.name)), On(e, n), Promise.resolve(e);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(t) {
    const e = this.json.skins[t], n = [];
    for (let s = 0, r = e.joints.length; s < r; s++)
      n.push(this._loadNodeShallow(e.joints[s]));
    return e.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", e.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(s) {
      const r = s.pop(), o = s, a = [], l = [];
      for (let c = 0, h = o.length; c < h; c++) {
        const d = o[c];
        if (d) {
          a.push(d);
          const u = new Ft();
          r !== null && u.fromArray(r.array, c * 16), l.push(u);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', e.joints[c]);
      }
      return new Bl(a, l);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(t) {
    const e = this.json, n = this, s = e.animations[t], r = s.name ? s.name : "animation_" + t, o = [], a = [], l = [], c = [], h = [];
    for (let d = 0, u = s.channels.length; d < u; d++) {
      const f = s.channels[d], g = s.samplers[f.sampler], v = f.target, p = v.node, m = s.parameters !== void 0 ? s.parameters[g.input] : g.input, x = s.parameters !== void 0 ? s.parameters[g.output] : g.output;
      v.node !== void 0 && (o.push(this.getDependency("node", p)), a.push(this.getDependency("accessor", m)), l.push(this.getDependency("accessor", x)), c.push(g), h.push(v));
    }
    return Promise.all([
      Promise.all(o),
      Promise.all(a),
      Promise.all(l),
      Promise.all(c),
      Promise.all(h)
    ]).then(function(d) {
      const u = d[0], f = d[1], g = d[2], v = d[3], p = d[4], m = [];
      for (let x = 0, _ = u.length; x < _; x++) {
        const M = u[x], L = f[x], T = g[x], w = v[x], R = p[x];
        if (M === void 0) continue;
        M.updateMatrix && M.updateMatrix();
        const F = n._createAnimationTracks(M, L, T, w, R);
        if (F)
          for (let y = 0; y < F.length; y++)
            m.push(F[y]);
      }
      return new Sx(r, void 0, m);
    });
  }
  createNodeMesh(t) {
    const e = this.json, n = this, s = e.nodes[t];
    return s.mesh === void 0 ? null : n.getDependency("mesh", s.mesh).then(function(r) {
      const o = n._getNodeRef(n.meshCache, s.mesh, r);
      return s.weights !== void 0 && o.traverse(function(a) {
        if (a.isMesh)
          for (let l = 0, c = s.weights.length; l < c; l++)
            a.morphTargetInfluences[l] = s.weights[l];
      }), o;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(t) {
    const e = this.json, n = this, s = e.nodes[t], r = n._loadNodeShallow(t), o = [], a = s.children || [];
    for (let c = 0, h = a.length; c < h; c++)
      o.push(n.getDependency("node", a[c]));
    const l = s.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", s.skin);
    return Promise.all([
      r,
      Promise.all(o),
      l
    ]).then(function(c) {
      const h = c[0], d = c[1], u = c[2];
      u !== null && h.traverse(function(f) {
        f.isSkinnedMesh && f.bind(u, Hy);
      });
      for (let f = 0, g = d.length; f < g; f++)
        h.add(d[f]);
      return h;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(t) {
    const e = this.json, n = this.extensions, s = this;
    if (this.nodeCache[t] !== void 0)
      return this.nodeCache[t];
    const r = e.nodes[t], o = r.name ? s.createUniqueName(r.name) : "", a = [], l = s._invokeOne(function(c) {
      return c.createNodeMesh && c.createNodeMesh(t);
    });
    return l && a.push(l), r.camera !== void 0 && a.push(s.getDependency("camera", r.camera).then(function(c) {
      return s._getNodeRef(s.cameraCache, r.camera, c);
    })), s._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(t);
    }).forEach(function(c) {
      a.push(c);
    }), this.nodeCache[t] = Promise.all(a).then(function(c) {
      let h;
      if (r.isBone === !0 ? h = new au() : c.length > 1 ? h = new K() : c.length === 1 ? h = c[0] : h = new ye(), h !== c[0])
        for (let d = 0, u = c.length; d < u; d++)
          h.add(c[d]);
      if (r.name && (h.userData.name = r.name, h.name = o), On(h, r), r.extensions && _i(n, h, r), r.matrix !== void 0) {
        const d = new Ft();
        d.fromArray(r.matrix), h.applyMatrix4(d);
      } else
        r.translation !== void 0 && h.position.fromArray(r.translation), r.rotation !== void 0 && h.quaternion.fromArray(r.rotation), r.scale !== void 0 && h.scale.fromArray(r.scale);
      return s.associations.has(h) || s.associations.set(h, {}), s.associations.get(h).nodes = t, h;
    }), this.nodeCache[t];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(t) {
    const e = this.extensions, n = this.json.scenes[t], s = this, r = new K();
    n.name && (r.name = s.createUniqueName(n.name)), On(r, n), n.extensions && _i(e, r, n);
    const o = n.nodes || [], a = [];
    for (let l = 0, c = o.length; l < c; l++)
      a.push(s.getDependency("node", o[l]));
    return Promise.all(a).then(function(l) {
      for (let h = 0, d = l.length; h < d; h++)
        r.add(l[h]);
      const c = (h) => {
        const d = /* @__PURE__ */ new Map();
        for (const [u, f] of s.associations)
          (u instanceof vn || u instanceof Ce) && d.set(u, f);
        return h.traverse((u) => {
          const f = s.associations.get(u);
          f != null && d.set(u, f);
        }), d;
      };
      return s.associations = c(r), r;
    });
  }
  _createAnimationTracks(t, e, n, s, r) {
    const o = [], a = t.name ? t.name : t.uuid, l = [];
    Zn[r.path] === Zn.weights ? t.traverse(function(u) {
      u.morphTargetInfluences && l.push(u.name ? u.name : u.uuid);
    }) : l.push(a);
    let c;
    switch (Zn[r.path]) {
      case Zn.weights:
        c = us;
        break;
      case Zn.rotation:
        c = fs;
        break;
      case Zn.position:
      case Zn.scale:
        c = ps;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            c = us;
            break;
          case 2:
          case 3:
          default:
            c = ps;
            break;
        }
        break;
    }
    const h = s.interpolation !== void 0 ? Uy[s.interpolation] : Zs, d = this._getArrayFromAccessor(n);
    for (let u = 0, f = l.length; u < f; u++) {
      const g = new c(
        l[u] + "." + Zn[r.path],
        e.array,
        d,
        h
      );
      s.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(g), o.push(g);
    }
    return o;
  }
  _getArrayFromAccessor(t) {
    let e = t.array;
    if (t.normalized) {
      const n = ml(e.constructor), s = new Float32Array(e.length);
      for (let r = 0, o = e.length; r < o; r++)
        s[r] = e[r] * n;
      e = s;
    }
    return e;
  }
  _createCubicSplineTrackInterpolant(t) {
    t.createInterpolant = function(n) {
      const s = this instanceof fs ? Ny : Au;
      return new s(this.times, this.values, this.getValueSize() / 3, n);
    }, t.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function Vy(i, t, e) {
  const n = t.attributes, s = new Ke();
  if (n.POSITION !== void 0) {
    const a = e.json.accessors[n.POSITION], l = a.min, c = a.max;
    if (l !== void 0 && c !== void 0) {
      if (s.set(
        new P(l[0], l[1], l[2]),
        new P(c[0], c[1], c[2])
      ), a.normalized) {
        const h = ml(ns[a.componentType]);
        s.min.multiplyScalar(h), s.max.multiplyScalar(h);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const r = t.targets;
  if (r !== void 0) {
    const a = new P(), l = new P();
    for (let c = 0, h = r.length; c < h; c++) {
      const d = r[c];
      if (d.POSITION !== void 0) {
        const u = e.json.accessors[d.POSITION], f = u.min, g = u.max;
        if (f !== void 0 && g !== void 0) {
          if (l.setX(Math.max(Math.abs(f[0]), Math.abs(g[0]))), l.setY(Math.max(Math.abs(f[1]), Math.abs(g[1]))), l.setZ(Math.max(Math.abs(f[2]), Math.abs(g[2]))), u.normalized) {
            const v = ml(ns[u.componentType]);
            l.multiplyScalar(v);
          }
          a.max(l);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    s.expandByVector(a);
  }
  i.boundingBox = s;
  const o = new En();
  s.getCenter(o.center), o.radius = s.min.distanceTo(s.max) / 2, i.boundingSphere = o;
}
function Jh(i, t, e) {
  const n = t.attributes, s = [];
  function r(o, a) {
    return e.getDependency("accessor", o).then(function(l) {
      i.setAttribute(a, l);
    });
  }
  for (const o in n) {
    const a = pl[o] || o.toLowerCase();
    a in i.attributes || s.push(r(n[o], a));
  }
  if (t.indices !== void 0 && !i.index) {
    const o = e.getDependency("accessor", t.indices).then(function(a) {
      i.setIndex(a);
    });
    s.push(o);
  }
  return ne.workingColorSpace !== Oe && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ne.workingColorSpace}" not supported.`), On(i, t), Vy(i, t, e), Promise.all(s).then(function() {
    return t.targets !== void 0 ? Fy(i, t.targets, e) : i;
  });
}
const Wt = 10251071, Ns = 7306636, bt = 12106948, ee = 15921906, jt = 2830134, Jn = 8962256;
function C(i, t = {}) {
  return new zn({
    color: i,
    roughness: 0.8,
    metalness: 0.05,
    ...t
  });
}
function I(i, t, e, n, s = 0, r = 0, o = 0) {
  const a = new ge(new Vn(i, t, e), n);
  return a.position.set(s, r, o), a.castShadow = !0, a.receiveShadow = !0, a;
}
function pt(i, t, e, n, s = 0, r = 0, o = 0, a = 16) {
  const l = new ge(new Wl(i, t, e, a), n);
  return l.position.set(s, r, o), l.castShadow = !0, l.receiveShadow = !0, l;
}
function j(i, t) {
  return i.material.color.copy(t), i;
}
const gl = {
  sofa: (i) => {
    const t = new K(), e = C(Ns);
    return t.add(j(I(1.9, 0.4, 0.85, e, 0, 0.2, 0), i)), t.add(j(I(1.9, 0.5, 0.2, e, 0, 0.55, -0.32), i)), t.add(j(I(0.2, 0.45, 0.85, e, -0.85, 0.5, 0), i)), t.add(j(I(0.2, 0.45, 0.85, e, 0.85, 0.5, 0), i)), t;
  },
  bed: (i) => {
    const t = new K();
    return t.add(I(1.6, 0.3, 2, C(Wt), 0, 0.15, 0)), t.add(j(I(1.55, 0.18, 1.95, C(ee), 0, 0.39, 0), i)), t.add(I(1.6, 0.6, 0.1, C(Wt), 0, 0.5, -0.95)), t.add(I(0.5, 0.12, 0.35, C(ee), -0.45, 0.5, -0.7)), t.add(I(0.5, 0.12, 0.35, C(ee), 0.45, 0.5, -0.7)), t;
  },
  table: (i) => {
    const t = new K(), e = C(Wt);
    t.add(j(I(1.4, 0.06, 0.8, e, 0, 0.74, 0), i));
    const n = 0.62, s = 0.32;
    for (const [r, o] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.07, 0.74, 0.07, e, r * n, 0.37, o * s));
    return t;
  },
  chair: (i) => {
    const t = new K(), e = C(Wt);
    t.add(j(I(0.45, 0.05, 0.45, e, 0, 0.45, 0), i)), t.add(j(I(0.45, 0.45, 0.05, e, 0, 0.68, -0.2), i));
    const n = 0.18, s = 0.18;
    for (const [r, o] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.05, 0.45, 0.05, e, r * n, 0.22, o * s));
    return t;
  },
  wardrobe: (i) => {
    const t = new K();
    return t.add(j(I(1.2, 2, 0.6, C(Wt), 0, 1, 0), i)), t.add(I(0.04, 1.8, 0.02, C(bt), -0.02, 1, 0.31)), t.add(pt(0.02, 0.02, 0.15, C(bt), -0.2, 1, 0.32)), t.add(pt(0.02, 0.02, 0.15, C(bt), 0.16, 1, 0.32)), t;
  },
  kitchen_counter: (i) => {
    const t = new K();
    return t.add(j(I(2, 0.85, 0.6, C(ee), 0, 0.425, 0), i)), t.add(I(2.05, 0.05, 0.65, C(jt), 0, 0.875, 0)), t;
  },
  tv: (i) => {
    const t = new K();
    return t.add(j(I(1.3, 0.78, 0.06, C(jt), 0, 0, 0.03), i)), t.add(I(1.18, 0.66, 0.02, C(657930, { emissive: 1119255 }), 0, 0, 0.07)), t;
  },
  fridge: (i) => {
    const t = new K();
    return t.add(j(I(0.7, 1.8, 0.7, C(bt), 0, 0.9, 0), i)), t.add(I(0.04, 0.1, 0.02, C(jt), 0.3, 1.3, 0.36)), t.add(I(0.04, 0.1, 0.02, C(jt), 0.3, 0.6, 0.36)), t;
  },
  sink: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.8, 0.5, C(ee), 0, 0.4, 0), i)), t.add(I(0.5, 0.08, 0.4, C(bt), 0, 0.82, 0)), t.add(pt(0.02, 0.02, 0.25, C(bt), 0, 0.95, -0.12)), t;
  },
  toilet: (i) => {
    const t = new K();
    return t.add(j(pt(0.22, 0.25, 0.4, C(ee), 0, 0.2, 0.05), i)), t.add(I(0.35, 0.5, 0.18, C(ee), 0, 0.45, -0.18)), t.add(pt(0.24, 0.24, 0.05, C(ee), 0, 0.42, 0.05)), t;
  },
  door: (i) => {
    const t = new K(), e = C(ee);
    t.add(I(0.06, 2.06, 0.16, e, -0.46, 1.03, 0)), t.add(I(0.06, 2.06, 0.16, e, 0.46, 1.03, 0)), t.add(I(0.98, 0.06, 0.16, e, 0, 2.06, 0));
    const n = j(I(0.84, 2, 0.06, C(Wt), 0, 1, 0), i);
    return t.add(n), t.add(pt(0.03, 0.03, 0.12, C(12096302), 0.33, 1, 0.06)), t;
  },
  window_frame: (i) => {
    const t = new K(), e = C(5595242), n = 1.2, s = 1.2, r = 1.45, o = 0.07, a = 0.1;
    return t.add(j(I(n, o, a, e, 0, r + s / 2, 0), i)), t.add(j(I(n, o, a, e, 0, r - s / 2, 0), i)), t.add(I(o, s, a, e, -n / 2 + o / 2, r, 0)), t.add(I(o, s, a, e, n / 2 - o / 2, r, 0)), t.add(I(0.05, s, a * 0.6, e, 0, r, 0)), t.add(I(n, 0.05, a * 0.6, e, 0, r, 0)), t.add(I(n - o, s - o, 0.02, C(10274778, { transparent: !0, opacity: 0.5, metalness: 0.2 }), 0, r, 0)), t;
  },
  ceiling_light: (i) => {
    const t = new K(), e = pt(0.18, 0.22, 0.12, C(ee, { emissive: 0 }), 0, 0, 0);
    return e.name = "emissive", t.add(j(e, i)), t.add(pt(0.01, 0.01, 0.25, C(bt), 0, 0.18, 0)), t;
  },
  ac_unit: (i) => {
    const t = new K();
    return t.add(j(I(0.9, 0.28, 0.18, C(ee), 0, 0, 0), i)), t.add(I(0.8, 0.04, 0.02, C(jt), 0, -0.1, 0.09)), t;
  },
  intercom: (i) => {
    const t = new K();
    t.add(j(I(0.16, 0.26, 0.04, C(jt), 0, 0, 0), i));
    const e = I(0.12, 0.14, 0.01, C(1053720, { emissive: 666170 }), 0, 0.03, 0.025);
    return e.name = "emissive", t.add(e), t;
  },
  armchair: (i) => {
    const t = new K(), e = C(Ns);
    return t.add(j(I(0.85, 0.4, 0.85, e, 0, 0.2, 0), i)), t.add(j(I(0.85, 0.5, 0.18, e, 0, 0.55, -0.33), i)), t.add(j(I(0.16, 0.45, 0.85, e, -0.42, 0.5, 0), i)), t.add(j(I(0.16, 0.45, 0.85, e, 0.42, 0.5, 0), i)), t;
  },
  coffee_table: (i) => {
    const t = new K();
    t.add(j(I(1, 0.05, 0.55, C(Wt), 0, 0.4, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.06, 0.4, 0.06, C(Wt), e * 0.42, 0.2, n * 0.22));
    return t;
  },
  dining_table: (i) => {
    const t = new K();
    t.add(j(I(1.8, 0.06, 0.95, C(Wt), 0, 0.75, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.08, 0.75, 0.08, C(Wt), e * 0.8, 0.37, n * 0.4));
    return t;
  },
  bookshelf: (i) => {
    const t = new K();
    t.add(j(I(1, 1.8, 0.32, C(Wt), 0, 0.9, 0), i));
    for (let e = 1; e <= 4; e++) t.add(I(0.94, 0.03, 0.3, C(jt), 0, e * 0.36, 0));
    return t;
  },
  desk: (i) => {
    const t = new K();
    return t.add(j(I(1.3, 0.05, 0.65, C(Wt), 0, 0.74, 0), i)), t.add(I(0.5, 0.7, 0.6, C(jt), 0.35, 0.37, 0)), t.add(I(0.05, 0.74, 0.6, C(Wt), -0.6, 0.37, 0)), t;
  },
  office_chair: (i) => {
    const t = new K();
    return t.add(j(I(0.5, 0.06, 0.5, C(jt), 0, 0.5, 0), i)), t.add(j(I(0.5, 0.5, 0.06, C(jt), 0, 0.78, -0.22), i)), t.add(pt(0.04, 0.04, 0.45, C(bt), 0, 0.25, 0)), t.add(pt(0.26, 0.26, 0.04, C(bt), 0, 0.04, 0)), t;
  },
  nightstand: (i) => {
    const t = new K();
    return t.add(j(I(0.45, 0.5, 0.4, C(Wt), 0, 0.25, 0), i)), t.add(I(0.4, 0.02, 0.02, C(bt), 0, 0.32, 0.21)), t;
  },
  dresser: (i) => {
    const t = new K();
    t.add(j(I(1.1, 0.85, 0.5, C(Wt), 0, 0.42, 0), i));
    for (let e = 0; e < 3; e++) t.add(I(0.9, 0.02, 0.02, C(bt), 0, 0.2 + e * 0.25, 0.26));
    return t;
  },
  stove: (i) => {
    const t = new K();
    t.add(j(I(0.6, 0.85, 0.6, C(bt), 0, 0.42, 0), i)), t.add(I(0.55, 0.02, 0.55, C(jt), 0, 0.86, 0));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(pt(0.08, 0.08, 0.01, C(2236962), e * 0.13, 0.875, n * 0.13));
    return t;
  },
  microwave: (i) => {
    const t = new K();
    return t.add(j(I(0.5, 0.3, 0.35, C(jt), 0, 0.15, 0), i)), t.add(I(0.32, 0.22, 0.01, C(1053720, { emissive: 662050 }), -0.05, 0.15, 0.18)), t;
  },
  dishwasher: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.85, 0.6, C(bt), 0, 0.42, 0), i)), t.add(I(0.5, 0.02, 0.02, C(jt), 0, 0.75, 0.31)), t;
  },
  washing_machine: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.85, 0.6, C(ee), 0, 0.42, 0), i)), t.add(pt(0.2, 0.2, 0.04, C(jt), 0, 0.45, 0.31).rotateX(Math.PI / 2)), t;
  },
  bathtub: (i) => {
    const t = new K();
    return t.add(j(I(1.6, 0.55, 0.75, C(ee), 0, 0.275, 0), i)), t.add(I(1.45, 0.2, 0.6, C(14675698), 0, 0.4, 0)), t;
  },
  shower: (i) => {
    const t = new K();
    return t.add(j(I(0.9, 0.04, 0.9, C(ee), 0, 0.02, 0), i)), t.add(I(0.04, 2, 0.9, C(Jn, { transparent: !0, opacity: 0.25 }), -0.43, 1, 0)), t.add(I(0.9, 2, 0.04, C(Jn, { transparent: !0, opacity: 0.25 }), 0, 1, -0.43)), t.add(pt(0.06, 0.06, 0.04, C(bt), 0.3, 1.9, 0.3)), t;
  },
  mirror: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.9, 0.04, C(bt), 0, 0, 0), i)), t.add(I(0.5, 0.8, 0.01, C(11195616, { metalness: 0.9, roughness: 0.1 }), 0, 0, 0.03)), t;
  },
  plant: (i) => {
    const t = new K();
    return t.add(pt(0.16, 0.2, 0.3, C(9067056), 0, 0.15, 0)), t.add(j(new ge(new Xl(0.32, 0), C(4160831)), i).translateY(0.6)), t;
  },
  rug: (i) => {
    const t = new K();
    return t.add(j(I(2, 0.02, 1.4, C(8930372), 0, 0.012, 0), i)), t;
  },
  stairs: (i) => {
    const t = new K(), e = 8;
    for (let n = 0; n < e; n++)
      t.add(j(I(1, 0.18, 0.3, C(Wt), 0, 0.09 + n * 0.18, -n * 0.3), i));
    return t;
  },
  curtain: (i) => {
    const t = new K(), e = 1.8, n = 2.2, s = 0.03, r = C(10128246, { roughness: 1 }), o = pt(0.022, 0.022, e + 0.2, C(bt), 0, n + 0.02, s, 8);
    o.rotation.z = Math.PI / 2, t.add(o);
    const a = (l) => {
      const c = new K();
      c.name = "curtainPivot", c.position.x = l * e / 2;
      const h = e / 2, d = 9, u = h / d;
      for (let f = 0; f < d; f++) {
        const g = -l * (f + 0.5) * u, v = f % 2 === 0 ? 0.035 : -0.025;
        c.add(j(I(u * 0.96, n, 0.05, r, g, n / 2, s + v), i));
      }
      return c;
    };
    return t.add(a(-1)), t.add(a(1)), t;
  },
  curtain_sheer: (i) => {
    const t = new K(), e = 1.8, n = 2.2, s = 0.03, r = C(15921129, { transparent: !0, opacity: 0.5, roughness: 1 }), o = pt(0.02, 0.02, e + 0.2, C(bt), 0, n + 0.02, s, 8);
    o.rotation.z = Math.PI / 2, t.add(o);
    const a = (l) => {
      const c = new K();
      c.name = "curtainPivot", c.position.x = l * e / 2;
      const h = e / 2, d = 8, u = h / d;
      for (let f = 0; f < d; f++) {
        const g = -l * (f + 0.5) * u;
        c.add(j(I(u * 0.96, n, 0.03, r, g, n / 2, s + (f % 2 ? 0.02 : -0.02)), i));
      }
      return c;
    };
    return t.add(a(-1)), t.add(a(1)), t;
  },
  roller_blind: (i) => {
    const t = new K(), e = 1.4, n = 1.9, s = 0.02, r = pt(0.05, 0.05, e, C(14209732), 0, n, s, 10);
    r.rotation.z = Math.PI / 2, t.add(r);
    const o = new K();
    return o.name = "curtainPivot", o.add(j(I(e, n, 0.02, C(12562067, { roughness: 1 }), 0, n / 2, s), i)), t.add(o), t;
  },
  roman_blind: (i) => {
    const t = new K(), e = 1.4, n = 1.9, s = 0.02, r = C(9076588, { roughness: 1 }), o = pt(0.04, 0.04, e, C(bt), 0, n + 0.02, s, 8);
    o.rotation.z = Math.PI / 2, t.add(o);
    const a = new K();
    a.name = "curtainPivot";
    for (let l = 0; l < 5; l++)
      a.add(j(I(e, 0.36, 0.04 + (l % 2 ? 0.02 : 0), r, 0, 0.2 + l * 0.36, s), i));
    return t.add(a), t;
  },
  // ---- Extra kitchen ----
  wall_cabinet: (i) => {
    const t = new K(), e = 1.6, n = 0.7, s = 0.34;
    t.add(j(I(e, n, s, C(ee), 0, 0, 0), i));
    for (const r of [-1, 1])
      t.add(I(e / 2 - 0.03, n - 0.04, 0.02, C(16185078), r * e / 4, 0, s / 2 + 5e-3)), t.add(I(0.04, 0.18, 0.03, C(bt), r * 0.03, -n / 4, s / 2 + 0.02));
    return t;
  },
  cooktop: (i) => {
    const t = new K();
    t.add(j(I(0.6, 0.04, 0.52, C(1315860, { roughness: 0.3, metalness: 0.2 }), 0, 0.9, 0), i));
    for (const [e, n] of [[-0.15, -0.13], [0.15, -0.13], [-0.15, 0.13], [0.15, 0.13]])
      t.add(pt(0.07, 0.07, 6e-3, C(2763306), e, 0.923, n, 18));
    return t;
  },
  dish_rack: (i) => {
    const t = new K();
    t.add(j(I(0.42, 0.04, 0.3, C(bt, { metalness: 0.5, roughness: 0.4 }), 0, 0.92, 0), i));
    for (let e = 0; e < 5; e++) t.add(I(6e-3, 0.16, 0.26, C(bt), -0.18 + e * 0.09, 1, 0));
    return t;
  },
  // ---- Extra lighting (emissive; bindable as lights) ----
  track_light: (i) => {
    const t = new K(), e = I(1.2, 0.05, 0.05, C(jt), 0, 0, 0);
    t.add(j(e, i));
    for (const n of [-0.4, 0, 0.4]) {
      t.add(I(0.08, 0.1, 0.08, C(jt), n, -0.08, 0));
      const s = pt(0.05, 0.06, 0.08, C(16774358, { emissive: 0 }), n, -0.16, 0, 12);
      s.name = "emissive", t.add(s);
    }
    return t;
  },
  lantern: (i) => {
    const t = new K();
    t.add(j(I(0.22, 0.04, 0.22, C(jt), 0, 0, 0), i)), t.add(I(0.22, 0.04, 0.22, C(jt), 0, 0.5, 0));
    for (const [n, s] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.02, 0.5, 0.02, C(jt), n * 0.1, 0.25, s * 0.1));
    const e = I(0.16, 0.42, 0.16, C(16773568, { emissive: 0, transparent: !0, opacity: 0.85 }), 0, 0.25, 0);
    return e.name = "emissive", t.add(e), t;
  },
  led_panel: (i) => {
    const t = new K();
    t.add(j(I(0.6, 0.04, 0.6, C(bt), 0, 0, 0), i));
    const e = I(0.56, 0.02, 0.56, C(16251647, { emissive: 0 }), 0, -0.02, 0);
    return e.name = "emissive", t.add(e), t;
  },
  // Generic fallback marker so an unknown model key still renders something.
  painting: (i) => {
    const t = new K();
    return t.add(j(I(0.7, 0.5, 0.04, C(Wt), 0, 0, 0), i)), t.add(I(0.6, 0.4, 0.01, C(6719658), 0, 0, 0.03)), t;
  },
  speaker: (i) => {
    const t = new K();
    return t.add(j(I(0.25, 0.4, 0.25, C(jt), 0, 0.2, 0), i)), t.add(pt(0.08, 0.08, 0.01, C(1118481), 0, 0.26, 0.13).rotateX(Math.PI / 2)), t;
  },
  security_camera: (i) => {
    const t = new K();
    t.add(j(pt(0.06, 0.06, 0.18, C(ee), 0, 0, 0), i));
    const e = pt(0.04, 0.04, 0.04, C(1053720, { emissive: 3145728 }), 0, 0, 0.1);
    return e.name = "emissive", e.rotateX(Math.PI / 2), t.add(e), t;
  },
  radiator: (i) => {
    const t = new K();
    for (let e = 0; e < 8; e++) t.add(j(I(0.06, 0.6, 0.1, C(ee), -0.35 + e * 0.1, 0.4, 0), i));
    return t;
  },
  // ---- Lighting (освещение) — each has an 'emissive' mesh + reads as a lamp ----
  floor_lamp: (i) => {
    const t = new K();
    t.add(pt(0.18, 0.22, 0.03, C(bt), 0, 0.015, 0)), t.add(pt(0.02, 0.02, 1.5, C(bt), 0, 0.75, 0));
    const e = pt(0.18, 0.25, 0.28, C(16774358, { emissive: 0 }), 0, 1.55, 0);
    return e.name = "emissive", t.add(j(e, i)), t;
  },
  table_lamp: (i) => {
    const t = new K();
    t.add(pt(0.1, 0.12, 0.03, C(bt), 0, 0.015, 0)), t.add(pt(0.015, 0.015, 0.3, C(bt), 0, 0.18, 0));
    const e = pt(0.12, 0.16, 0.18, C(16774358, { emissive: 0 }), 0, 0.42, 0);
    return e.name = "emissive", t.add(j(e, i)), t;
  },
  wall_light: (i) => {
    const t = new K();
    t.add(I(0.12, 0.2, 0.08, C(bt), 0, 0, 0));
    const e = I(0.1, 0.16, 0.04, C(16774358, { emissive: 0 }), 0, 0, 0.06);
    return e.name = "emissive", t.add(j(e, i)), t;
  },
  chandelier: (i) => {
    const t = new K();
    t.add(pt(0.01, 0.01, 0.3, C(bt), 0, 0.15, 0)), t.add(pt(0.25, 0.3, 0.04, C(bt), 0, 0, 0));
    for (let e = 0; e < 6; e++) {
      const n = e / 6 * Math.PI * 2, s = new ge(
        new ir(0.06, 10, 10),
        C(16774358, { emissive: 0 })
      );
      s.name = "emissive", s.position.set(Math.cos(n) * 0.28, -0.05, Math.sin(n) * 0.28), t.add(j(s, i));
    }
    return t;
  },
  spotlight: (i) => {
    const t = new K();
    t.add(pt(0.05, 0.07, 0.06, C(bt), 0, 0, 0));
    const e = pt(0.05, 0.05, 0.01, C(16774358, { emissive: 0 }), 0, -0.03, 0);
    return e.name = "emissive", t.add(j(e, i)), t;
  },
  pendant_light: (i) => {
    const t = new K();
    t.add(pt(8e-3, 8e-3, 0.4, C(jt), 0, 0.2, 0));
    const e = pt(0.16, 0.05, 0.2, C(16774358, { emissive: 0 }), 0, -0.1, 0);
    return e.name = "emissive", t.add(j(e, i)), t;
  },
  led_strip: (i) => {
    const t = new K(), e = I(1.5, 0.03, 0.04, C(16777215, { emissive: 0 }), 0, 0, 0);
    return e.name = "emissive", t.add(j(e, i)), t;
  },
  double_door: (i) => {
    const t = new K();
    return t.add(j(I(0.7, 2, 0.05, C(Wt), -0.36, 1, 0), i)), t.add(j(I(0.7, 2, 0.05, C(Wt), 0.36, 1, 0), i)), t.add(pt(0.025, 0.025, 0.1, C(bt), -0.05, 1, 0.05)), t.add(pt(0.025, 0.025, 0.1, C(bt), 0.05, 1, 0.05)), t;
  },
  sliding_door: (i) => {
    const t = new K();
    return t.add(I(1.6, 0.06, 0.08, C(bt), 0, 2.05, 0)), t.add(j(I(0.78, 1.95, 0.04, C(Jn, { transparent: !0, opacity: 0.4 }), -0.4, 1, 0), i)), t.add(j(I(0.78, 1.95, 0.04, C(Jn, { transparent: !0, opacity: 0.4 }), 0.4, 1, 0.05), i)), t;
  },
  wall_panel: (i) => {
    const t = new K();
    return t.add(j(I(1.5, 2.6, 0.12, C(15132390), 0, 1.3, 0), i)), t;
  },
  arch: (i) => {
    const t = new K();
    return t.add(j(I(0.15, 2, 0.25, C(15132390), -0.6, 1, 0), i)), t.add(j(I(0.15, 2, 0.25, C(15132390), 0.6, 1, 0), i)), t.add(j(I(1.35, 0.25, 0.25, C(15132390), 0, 2.1, 0), i)), t;
  },
  bar_stool: (i) => {
    const t = new K();
    return t.add(j(pt(0.18, 0.18, 0.05, C(Wt), 0, 0.66, 0), i)), t.add(pt(0.03, 0.03, 0.66, C(bt), 0, 0.33, 0)), t.add(pt(0.2, 0.2, 0.02, C(bt), 0, 0.02, 0)), t;
  },
  tv_stand: (i) => {
    const t = new K();
    return t.add(j(I(1.4, 0.4, 0.4, C(jt), 0, 0.2, 0), i)), t.add(I(0.6, 0.02, 0.36, C(bt), -0.35, 0.41, 0)), t;
  },
  kitchen_island: (i) => {
    const t = new K();
    return t.add(j(I(1.6, 0.9, 0.9, C(ee), 0, 0.45, 0), i)), t.add(I(1.7, 0.05, 1, C(jt), 0, 0.92, 0)), t;
  },
  sideboard: (i) => {
    const t = new K();
    t.add(j(I(1.6, 0.8, 0.45, C(Wt), 0, 0.4, 0), i));
    for (let e = -1; e <= 1; e++) t.add(I(0.02, 0.1, 0.02, C(bt), e * 0.5, 0.5, 0.23));
    return t;
  },
  bunk_bed: (i) => {
    const t = new K();
    for (const e of [0.4, 1.4])
      t.add(I(1, 0.12, 2, C(Wt), 0, e, 0)), t.add(j(I(0.95, 0.12, 1.95, C(ee), 0, e + 0.12, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.08, 1.9, 0.08, C(Wt), e * 0.46, 0.95, n * 0.96));
    return t;
  },
  bar_counter: (i) => {
    const t = new K();
    return t.add(j(I(2, 1.05, 0.55, C(Wt), 0, 0.525, 0), i)), t.add(I(2.1, 0.05, 0.65, C(jt), 0, 1.07, 0)), t;
  },
  piano: (i) => {
    const t = new K();
    return t.add(j(I(1.5, 0.9, 0.6, C(1447964), 0, 0.45, 0), i)), t.add(I(1.4, 0.06, 0.25, C(ee), 0, 0.78, 0.18)), t;
  },
  range_hood: (i) => {
    const t = new K();
    return t.add(j(I(0.9, 0.25, 0.5, C(bt), 0, 0, 0), i)), t.add(I(0.3, 0.4, 0.3, C(bt), 0, 0.3, 0)), t;
  },
  wall_clock: (i) => {
    const t = new K(), e = pt(0.18, 0.18, 0.04, C(ee), 0, 0, 0, 24);
    return e.rotateX(Math.PI / 2), t.add(j(e, i)), t;
  },
  patio_door: (i) => {
    const t = new K(), e = C(5595242), n = 2.6, s = 2.2, r = 0.08, o = 0.1;
    return t.add(j(I(n, r, o, e, 0, s - r / 2, 0), i)), t.add(I(n, r, o, e, 0, r / 2, 0)), t.add(I(r, s, o, e, -n / 2 + r / 2, s / 2, 0)), t.add(I(r, s, o, e, n / 2 - r / 2, s / 2, 0)), t.add(I(0.06, s, o * 0.6, e, -n / 6, s / 2, 0)), t.add(I(0.06, s, o * 0.6, e, n / 6, s / 2, 0)), t.add(I(n - r, s - r, 0.02, C(10274778, { transparent: !0, opacity: 0.42, metalness: 0.2 }), 0, s / 2, 0)), t;
  },
  terrace_window: (i) => {
    const t = new K(), e = C(5595242), n = 2.6, s = 1.5, r = 0.07, o = 0.1;
    return t.add(j(I(n, r, o, e, 0, s / 2, 0), i)), t.add(I(n, r, o, e, 0, -s / 2, 0)), t.add(I(r, s, o, e, -n / 2 + r / 2, 0, 0)), t.add(I(r, s, o, e, n / 2 - r / 2, 0, 0)), t.add(I(0.05, s, o * 0.6, e, -n / 4, 0, 0)), t.add(I(0.05, s, o * 0.6, e, n / 4, 0, 0)), t.add(I(n - r, s - r, 0.02, C(10274778, { transparent: !0, opacity: 0.45 }), 0, 0, 0)), t;
  },
  // ---- Kitchen ----
  oven: (i) => {
    const t = new K();
    t.add(j(I(0.6, 0.9, 0.6, C(bt, { metalness: 0.6, roughness: 0.4 }), 0, 0.45, 0), i)), t.add(I(0.5, 0.5, 0.02, C(1119255, { metalness: 0.3 }), 0, 0.5, 0.3)), t.add(I(0.5, 0.06, 0.04, C(jt), 0, 0.78, 0.31));
    for (const e of [-0.18, -0.06, 0.06, 0.18]) t.add(pt(0.03, 0.03, 0.04, C(jt), e, 0.86, 0.31, 12));
    return t;
  },
  kettle: (i) => {
    const t = new K();
    return t.add(pt(0.11, 0.11, 0.03, C(jt), 0, 0.015, 0, 18)), t.add(j(pt(0.09, 0.11, 0.2, C(bt, { metalness: 0.5, roughness: 0.3 }), 0, 0.12, 0, 18), i)), t.add(I(0.04, 0.14, 0.04, C(jt), 0, 0.18, -0.11)), t;
  },
  coffee_machine: (i) => {
    const t = new K();
    return t.add(j(I(0.26, 0.36, 0.3, C(jt), 0, 0.18, 0), i)), t.add(I(0.2, 0.05, 0.06, C(bt), 0, 0.12, 0.16)), t.add(pt(0.05, 0.05, 0.08, C(7031343), 0, 0.05, 0.13, 12)), t;
  },
  toaster: (i) => {
    const t = new K();
    return t.add(j(I(0.3, 0.18, 0.16, C(bt, { metalness: 0.6, roughness: 0.3 }), 0, 0.09, 0), i)), t.add(I(0.22, 0.02, 0.02, C(jt), 0, 0.19, 0)), t;
  },
  blender: (i) => {
    const t = new K();
    return t.add(I(0.15, 0.1, 0.15, C(jt), 0, 0.05, 0)), t.add(j(pt(0.07, 0.06, 0.22, C(Jn, { transparent: !0, opacity: 0.5 }), 0, 0.21, 0, 14), i)), t;
  },
  trash_can: (i) => {
    const t = new K();
    return t.add(j(pt(0.18, 0.16, 0.5, C(bt, { metalness: 0.5, roughness: 0.4 }), 0, 0.25, 0, 20), i)), t.add(pt(0.19, 0.19, 0.03, C(bt, { metalness: 0.5 }), 0, 0.51, 0, 20)), t;
  },
  wine_rack: (i) => {
    const t = new K(), e = C(Wt);
    for (const [n, s] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(j(I(0.05, 0.8, 0.05, e, n * 0.28, 0.4, s * 0.14), i));
    for (const n of [0.15, 0.35, 0.55, 0.75]) t.add(I(0.56, 0.03, 0.28, e, 0, n, 0));
    return t;
  },
  // ---- Living / common ----
  recliner: (i) => {
    const t = new K(), e = C(Ns);
    return t.add(j(I(0.9, 0.4, 0.95, e, 0, 0.25, 0), i)), t.add(j(I(0.9, 0.7, 0.18, e, 0, 0.6, -0.38), i)), t.add(j(I(0.18, 0.35, 0.95, e, -0.45, 0.45, 0), i)), t.add(j(I(0.18, 0.35, 0.95, e, 0.45, 0.45, 0), i)), t.add(I(0.78, 0.16, 0.36, e, 0, 0.22, 0.62)), t;
  },
  ottoman: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.4, 0.6, C(Ns), 0, 0.2, 0), i)), t;
  },
  console_table: (i) => {
    const t = new K(), e = C(Wt);
    t.add(j(I(1.2, 0.05, 0.4, e, 0, 0.8, 0), i));
    for (const n of [-1, 1]) t.add(I(0.06, 0.8, 0.36, e, n * 0.55, 0.4, 0));
    return t.add(I(1.1, 0.04, 0.36, e, 0, 0.4, 0)), t;
  },
  fireplace: (i) => {
    const t = new K(), e = C(9079430, { roughness: 1 });
    return t.add(j(I(1.4, 1.2, 0.4, e, 0, 0.6, 0), i)), t.add(I(0.9, 0.7, 0.26, C(1315860), 0, 0.5, 0.1)), t.add(I(0.74, 0.36, 0.18, C(16742960, { emissive: 16734746 }), 0, 0.4, 0.14)), t.add(I(1.5, 0.1, 0.5, e, 0, 1.22, 0)), t;
  },
  floor_vase: (i) => {
    const t = new K();
    t.add(j(pt(0.1, 0.18, 0.7, C(11887901), 0, 0.35, 0, 20), i)), t.add(pt(0.12, 0.1, 0.08, C(11887901), 0, 0.74, 0, 20));
    for (const e of [-0.05, 0.05, 0]) t.add(I(0.012, 0.5, 0.012, C(3828538), e, 1, 0));
    return t;
  },
  aquarium: (i) => {
    const t = new K();
    return t.add(I(1, 0.5, 0.4, C(Wt), 0, 0.25, 0)), t.add(I(0.95, 0.18, 0.38, C(2781088, { transparent: !0, opacity: 0.55 }), 0, 0.62, 0)), t.add(j(I(0.96, 0.46, 0.39, C(Jn, { transparent: !0, opacity: 0.28, metalness: 0.1 }), 0, 0.73, 0), i)), t;
  },
  pool_table: (i) => {
    const t = new K();
    t.add(I(2.1, 0.16, 1.2, C(Wt), 0, 0.68, 0)), t.add(j(I(1.96, 0.06, 1.06, C(2062909), 0, 0.79, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.14, 0.6, 0.14, C(Wt), e * 0.95, 0.3, n * 0.5));
    return t;
  },
  // ---- Bedroom ----
  crib: (i) => {
    const t = new K(), e = C(ee);
    t.add(j(I(0.66, 0.1, 1.16, e, 0, 0.5, 0), i));
    for (const n of [-1, 1]) t.add(I(0.7, 0.5, 0.04, e, 0, 0.65, n * 0.58));
    for (const n of [-1, 1]) t.add(I(0.04, 0.5, 1.2, e, n * 0.33, 0.65, 0));
    return t;
  },
  vanity: (i) => {
    const t = new K(), e = C(ee);
    t.add(j(I(1, 0.05, 0.45, e, 0, 0.78, 0), i));
    for (const n of [-1, 1]) t.add(I(0.36, 0.78, 0.42, e, n * 0.3, 0.39, 0));
    return t.add(I(0.66, 0.66, 0.04, e, 0, 1.2, -0.22)), t.add(I(0.6, 0.6, 0.02, C(13623526, { metalness: 0.4, roughness: 0.1 }), 0, 1.2, -0.2)), t;
  },
  bench: (i) => {
    const t = new K(), e = C(Wt);
    t.add(j(I(1.1, 0.1, 0.4, C(Ns), 0, 0.45, 0), i));
    for (const n of [-1, 1]) t.add(I(0.06, 0.45, 0.36, e, n * 0.5, 0.225, 0));
    return t;
  },
  ceiling_fan: (i) => {
    const t = new K();
    return t.add(pt(0.1, 0.1, 0.1, C(bt), 0, 0, 0, 16)), t.add(j(I(1.4, 0.02, 0.18, C(Wt), 0, -0.02, 0), i)), t.add(j(I(0.18, 0.02, 1.4, C(Wt), 0, -0.02, 0), i)), t.add(pt(0.04, 0.04, 0.22, C(bt), 0, 0.14, 0, 10)), t;
  },
  // ---- Bathroom ----
  bidet: (i) => {
    const t = new K();
    return t.add(j(I(0.4, 0.4, 0.55, C(ee), 0, 0.2, 0), i)), t.add(pt(0.16, 0.18, 0.12, C(ee), 0, 0.42, 0.05, 18)), t;
  },
  towel_rack: (i) => {
    const t = new K();
    return t.add(I(0.6, 0.04, 0.05, C(bt, { metalness: 0.6, roughness: 0.3 }), 0, 0.12, 0.04)), t.add(j(I(0.5, 0.32, 0.02, C(ee), 0, -0.05, 0.06), i)), t;
  },
  bathroom_cabinet: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.7, 0.15, C(ee), 0, 0, 0.075), i)), t.add(I(0.56, 0.66, 0.02, C(13623526, { metalness: 0.4, roughness: 0.1 }), 0, 0, 0.16)), t;
  },
  dryer: (i) => {
    const t = new K();
    return t.add(j(I(0.6, 0.85, 0.6, C(ee), 0, 0.425, 0), i)), t.add(pt(0.22, 0.22, 0.04, C(2764598, { metalness: 0.3 }), 0, 0.5, 0.3, 24)), t.add(I(0.5, 0.08, 0.04, C(bt), 0, 0.78, 0.31)), t;
  },
  // ---- Office ----
  filing_cabinet: (i) => {
    const t = new K();
    t.add(j(I(0.45, 1, 0.55, C(bt, { metalness: 0.4, roughness: 0.5 }), 0, 0.5, 0), i));
    for (const e of [0.25, 0.5, 0.75]) t.add(I(0.4, 0.02, 0.02, C(jt), 0, e, 0.28));
    return t;
  },
  monitor: (i) => {
    const t = new K();
    return t.add(j(I(0.5, 0.32, 0.03, C(jt), 0, 0.45, 0), i)), t.add(I(0.46, 0.28, 0.01, C(657930, { emissive: 1053466 }), 0, 0.45, 0.02)), t.add(pt(0.03, 0.03, 0.18, C(jt), 0, 0.3, -0.02, 10)), t.add(I(0.2, 0.02, 0.14, C(jt), 0, 0.21, -0.02)), t;
  },
  printer: (i) => {
    const t = new K();
    return t.add(j(I(0.45, 0.3, 0.4, C(ee), 0, 0.15, 0), i)), t.add(I(0.4, 0.02, 0.3, C(jt), 0, 0.31, 0)), t.add(I(0.34, 0.04, 0.08, C(14540270), 0, 0.3, 0.12)), t;
  },
  whiteboard: (i) => {
    const t = new K();
    return t.add(j(I(1.26, 0.86, 0.02, C(bt), 0, 0, 0), i)), t.add(I(1.2, 0.8, 0.02, C(16185078), 0, 0, 0.02)), t.add(I(0.4, 0.03, 0.06, C(bt), 0, -0.36, 0.05)), t;
  },
  // ---- Entry / utility / decor ----
  shoe_rack: (i) => {
    const t = new K(), e = C(Wt);
    for (const n of [0.1, 0.3, 0.5]) t.add(j(I(0.8, 0.03, 0.3, e, 0, n, 0), i));
    for (const [n, s] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(I(0.04, 0.55, 0.04, e, n * 0.38, 0.275, s * 0.13));
    return t;
  },
  coat_rack: (i) => {
    const t = new K(), e = C(Wt);
    t.add(j(pt(0.04, 0.06, 1.7, e, 0, 0.85, 0, 12), i)), t.add(pt(0.25, 0.25, 0.04, e, 0, 0.02, 0, 16));
    for (let n = 0; n < 4; n++) {
      const s = n * Math.PI / 2;
      t.add(I(0.18, 0.03, 0.03, e, Math.cos(s) * 0.09, 1.6, Math.sin(s) * 0.09));
    }
    return t;
  },
  water_heater: (i) => {
    const t = new K();
    return t.add(j(pt(0.25, 0.25, 0.9, C(ee), 0, 0.45, 0, 20), i)), t.add(pt(0.25, 0.25, 0.05, C(bt), 0, 0.9, 0, 20)), t.add(I(0.1, 0.1, 0.1, C(bt), 0, 0.2, 0.26)), t;
  },
  books: (i) => {
    const t = new K(), e = [9059131, 3889802, 3902042, 11899183];
    let n = 0.02;
    for (let s = 0; s < 4; s++)
      t.add(I(0.22, 0.04, 0.16, C(e[s % e.length]), 0, n, s % 2 * 0.01)), n += 0.045;
    return j(t.children[0], i), t;
  },
  vase: (i) => {
    const t = new K();
    t.add(j(pt(0.06, 0.1, 0.28, C(14673642, { metalness: 0.1, roughness: 0.3 }), 0, 0.14, 0, 18), i));
    for (const e of [-0.03, 0.03, 0]) t.add(I(0.01, 0.3, 0.01, C(3828538), e, 0.4, 0));
    return t;
  },
  wall_shelf: (i) => {
    const t = new K(), e = C(Wt);
    return t.add(j(I(0.8, 0.04, 0.22, e, 0, 0, 0.11), i)), t.add(I(0.04, 0.2, 0.2, e, -0.36, -0.1, 0.1)), t.add(I(0.04, 0.2, 0.2, e, 0.36, -0.1, 0.1)), t;
  },
  // ---- Wardrobes / cabinets ----
  wardrobe_glass: (i) => {
    const t = new K(), e = 1.2, n = 2.1, s = 0.58;
    t.add(j(I(e, n, s, C(ee), 0, n / 2, 0), i)), t.add(I(e - 0.06, n - 0.06, s - 0.08, C(2106408), 0, n / 2, -0.02));
    for (const o of [0.45, 0.9, 1.35, 1.75]) t.add(I(e - 0.1, 0.03, s - 0.1, C(Wt), 0, o, 0));
    const r = C(Jn, { transparent: !0, opacity: 0.3, metalness: 0.2, roughness: 0.05 });
    return t.add(I(e / 2 - 0.04, n - 0.14, 0.02, r, -e / 4, n / 2, s / 2 + 0.01)), t.add(I(e / 2 - 0.04, n - 0.14, 0.02, r, e / 4, n / 2, s / 2 + 0.01)), t.add(I(0.04, n - 0.1, 0.05, C(bt), 0, n / 2, s / 2 + 0.015)), t.add(pt(0.012, 0.012, 0.2, C(bt), -0.06, n / 2, s / 2 + 0.05, 8)), t.add(pt(0.012, 0.012, 0.2, C(bt), 0.06, n / 2, s / 2 + 0.05, 8)), t;
  },
  display_cabinet: (i) => {
    const t = new K(), e = 0.9, n = 1.9, s = 0.4;
    t.add(j(I(e, n, s, C(Wt), 0, n / 2, 0), i)), t.add(I(e - 0.08, n - 0.2, s - 0.06, C(1843236), 0, n / 2 + 0.04, -0.01));
    const r = C(Jn, { transparent: !0, opacity: 0.26, metalness: 0.2, roughness: 0.05 });
    t.add(I(e - 0.06, n - 0.28, 0.02, r, 0, n / 2 + 0.04, s / 2));
    for (const o of [0.55, 0.95, 1.35, 1.7]) t.add(I(e - 0.1, 0.02, s - 0.08, C(15921906), 0, o, 0));
    return t.add(j(pt(0.05, 0.07, 0.16, C(14673642), -0.2, 0.63, 0, 12), i)), t.add(I(0.12, 0.18, 0.1, C(9059131), 0.18, 0.64, 0)), t;
  },
  shelving_unit: (i) => {
    const t = new K(), e = C(Wt), n = 1, s = 2, r = 0.32;
    t.add(j(I(0.04, s, r, e, -n / 2, s / 2, 0), i)), t.add(j(I(0.04, s, r, e, n / 2, s / 2, 0), i)), t.add(I(n, 0.03, 0.04, e, 0, s - 0.02, -r / 2 + 0.02));
    for (let o = 0; o < 6; o++) t.add(I(n, 0.03, r, e, 0, 0.04 + o * (s - 0.08) / 5, 0));
    return t;
  },
  wardrobe_lit: (i) => {
    const t = new K(), e = 1.2, n = 2.1, s = 0.58;
    t.add(j(I(e, n, s, C(ee), 0, n / 2, 0), i)), t.add(I(e - 0.06, n - 0.06, s - 0.08, C(1316634), 0, n / 2, -0.02));
    for (const o of [0.6, 1.5]) t.add(I(e - 0.1, 0.03, s - 0.1, C(Wt), 0, o, 0));
    const r = pt(0.015, 0.015, e - 0.16, C(bt), 0, 1.95, 0.05, 8);
    r.rotation.z = Math.PI / 2, t.add(r);
    for (const o of [n - 0.12, 1.45, 0.55]) {
      const a = I(e - 0.16, 0.035, 0.04, C(15395562, { emissive: 0 }), 0, o, s / 2 - 0.12);
      a.name = "emissive", t.add(a);
    }
    return t;
  },
  // Generic fallback marker so an unknown model key still renders something.
  marker: (i) => {
    const t = new K();
    return t.add(j(pt(0, 0.12, 0.3, C(16733525), 0, 0.15, 0, 8), i)), t;
  }
}, Wy = Object.keys(gl).filter((i) => i !== "marker"), $y = [
  "door",
  "double_door",
  "sliding_door",
  "window_frame",
  "patio_door",
  "terrace_window",
  "tv",
  "painting",
  "mirror",
  "wall_light",
  "wall_clock",
  "ac_unit",
  "intercom",
  "security_camera",
  "curtain",
  "range_hood",
  "towel_rack",
  "bathroom_cabinet",
  "whiteboard",
  "wall_shelf",
  "curtain_sheer",
  "roller_blind",
  "roman_blind",
  "wall_cabinet"
];
function Qh(i) {
  return $y.includes(i);
}
const Xy = [
  "tv",
  "painting",
  "mirror",
  "wall_light",
  "wall_clock",
  "ac_unit",
  "intercom",
  "security_camera",
  "range_hood",
  "terrace_window",
  "towel_rack",
  "bathroom_cabinet",
  "whiteboard",
  "wall_shelf",
  "wall_cabinet",
  "curtain",
  "curtain_sheer",
  "roller_blind",
  "roman_blind"
];
function jy(i) {
  return Xy.includes(i);
}
const _o = [
  "ceiling_light",
  "floor_lamp",
  "table_lamp",
  "wall_light",
  "chandelier",
  "spotlight",
  "pendant_light",
  "led_strip",
  "track_light",
  "lantern",
  "led_panel"
];
function Ky(i) {
  if (_o.includes(i)) return ["light", "switch"];
  switch (i) {
    case "ac_unit":
      return ["climate", "fan", "switch"];
    case "ceiling_fan":
      return ["fan", "switch"];
    case "wardrobe_lit":
      return ["light", "switch"];
    case "tv":
    case "tv_stand":
      return ["media_player", "switch"];
    case "speaker":
      return ["media_player"];
    case "curtain":
    case "curtain_sheer":
    case "roller_blind":
    case "roman_blind":
      return ["cover"];
    case "door":
    case "double_door":
    case "sliding_door":
      return ["lock", "cover", "binary_sensor"];
    case "security_camera":
      return ["camera", "binary_sensor"];
    case "intercom":
      return ["camera", "lock", "binary_sensor"];
    case "fridge":
    case "washing_machine":
    case "dishwasher":
    case "stove":
    case "oven":
    case "microwave":
      return ["switch", "sensor", "binary_sensor"];
    case "toilet":
    case "bathtub":
    case "shower":
    case "sink":
      return ["sensor", "binary_sensor", "switch"];
    default:
      return [];
  }
}
function qy(i, t = 2.6) {
  return i === "ceiling_light" || i === "chandelier" || i === "pendant_light" ? t - 0.05 : i === "spotlight" || i === "led_strip" || i === "led_panel" || i === "track_light" ? t - 0.02 : i === "ceiling_fan" ? t - 0.25 : i === "wall_cabinet" ? 1.55 : i === "wall_light" || i === "ac_unit" || i === "security_camera" ? 2 : i === "bathroom_cabinet" || i === "whiteboard" ? 1.5 : i === "wall_shelf" || i === "painting" || i === "mirror" || i === "tv" || i === "intercom" ? 1.4 : i === "towel_rack" ? 1.1 : i === "terrace_window" ? 1.2 : i === "wall_clock" ? 1.7 : i === "range_hood" ? 1.6 : i === "curtain" || i === "curtain_sheer" || i === "roller_blind" || i === "roman_blind" ? 0.1 : 0;
}
function _l(i, t) {
  const e = gl[i] ?? gl.marker, n = new Ct(t ?? "#ffffff"), s = e(n);
  return s.userData.model = i, s;
}
const Yy = new cy(), td = /* @__PURE__ */ new Map();
function Zy(i) {
  let t = td.get(i);
  return t || (t = new Promise((e, n) => {
    Yy.load(
      i,
      (s) => {
        s.scene.traverse((r) => {
          r.castShadow = !0, r.receiveShadow = !0;
        }), e(s.scene);
      },
      void 0,
      (s) => n(s)
    );
  }), td.set(i, t)), t;
}
function ed(i, t) {
  i.position.set(t.position[0], t.position[1], t.position[2]), t.rotation && (i.rotation.y = ts.degToRad(t.rotation));
  const e = t.scale ?? 1;
  Array.isArray(e) ? i.scale.set(e[0], e[1], e[2]) : i.scale.setScalar(e);
}
function Jy(i, t) {
  const e = t ? new Ct(t) : null;
  i.traverse((n) => {
    const s = n;
    if (s.isMesh && (s.geometry && (s.geometry = s.geometry.clone()), s.material))
      if (Array.isArray(s.material))
        s.material = s.material.map((r) => {
          const o = r.clone();
          return e && o.color && o.color.multiply(e), o;
        });
      else {
        const r = s.material.clone();
        e && r.color && r.color.multiply(e), s.material = r;
      }
  });
}
function Qy(i) {
  if (i.glb) {
    const e = new K();
    ed(e, i), e.userData.furnitureId = i.id;
    const n = _l("marker", i.color);
    return e.add(n), Zy(i.glb).then((s) => {
      const r = s.clone(!0);
      Jy(r, i.color), e.remove(n), e.add(r);
    }).catch((s) => {
      console.error(`[3d-floorplan] failed to load GLB "${i.glb}":`, s);
    }), e;
  }
  const t = _l(i.model, i.color);
  return ed(t, i), t.userData.furnitureId = i.id, t;
}
function xn(i) {
  return !!i.shape;
}
function tM(i, t, e) {
  const n = e * Math.PI / 180, s = Math.cos(n), r = Math.sin(n);
  return [i * s - t * r, i * r + t * s];
}
function Qn(i) {
  if (i.shape === "rect" || i.shape === "bevel" || i.shape === "lshape") {
    const t = i.x ?? 0, e = i.z ?? 0, n = i.width ?? 3, s = i.depth ?? 3, r = i.rotation ?? 0, o = n / 2, a = s / 2;
    let l;
    if (i.shape === "lshape")
      l = [
        [-o, -a],
        [o, -a],
        [o, 0],
        [0, 0],
        [0, a],
        [-o, a]
      ];
    else if (i.shape === "bevel") {
      const c = Math.min(o, a) * 0.4;
      l = [
        [-o + c, -a],
        [o - c, -a],
        [o, -a + c],
        [o, a - c],
        [o - c, a],
        [-o + c, a],
        [-o, a - c],
        [-o, -a + c]
      ];
    } else
      l = [
        [-o, -a],
        [o, -a],
        [o, a],
        [-o, a]
      ];
    return l.map(([c, h]) => {
      const [d, u] = tM(c, h, r);
      return [t + d, e + u];
    });
  }
  return i.polygon ?? [];
}
function eM(i, t, e) {
  const n = Qn(i), s = [];
  for (let r = 0; r < n.length; r++) {
    const o = n[r], a = n[(r + 1) % n.length], l = (i.openings ?? []).filter((c) => c.edge === r).map((c) => ({
      kind: c.kind,
      position: c.position,
      width: c.width,
      sill: c.sill,
      top: c.top,
      bare: c.bare
    }));
    s.push({
      start: o,
      end: a,
      height: i.height ?? t,
      thickness: i.thickness ?? e,
      color: i.wallColor,
      openings: l.length ? l : void 0
    });
  }
  return s;
}
const nM = ["plain", "stripes", "plaster", "brick", "panel"], iM = ["plain", "wood", "tile", "plaster"], ya = /* @__PURE__ */ new Map();
function sM(i = 256) {
  const t = document.createElement("canvas");
  return t.width = t.height = i, [t, t.getContext("2d")];
}
function rM(i) {
  if (i === "plain") return null;
  const [t, e] = sM(256);
  if (e.fillStyle = "#ffffff", e.fillRect(0, 0, 256, 256), i === "stripes") {
    e.fillStyle = "rgba(0,0,0,0.06)";
    for (let s = 0; s < 256; s += 32) e.fillRect(s, 0, 16, 256);
  } else if (i === "plaster")
    for (let s = 0; s < 9e3; s++)
      e.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`, e.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  else if (i === "brick") {
    e.strokeStyle = "rgba(0,0,0,0.18)", e.lineWidth = 2;
    const s = 28;
    for (let r = 0, o = 0; o < 256; o += s, r++) {
      e.beginPath(), e.moveTo(0, o), e.lineTo(256, o), e.stroke();
      const a = r % 2 ? 32 : 0;
      for (let l = a; l <= 256; l += 64)
        e.beginPath(), e.moveTo(l, o), e.lineTo(l, o + s), e.stroke();
    }
  } else if (i === "panel") {
    e.strokeStyle = "rgba(0,0,0,0.15)", e.lineWidth = 3;
    for (let s = 24; s < 256; s += 64)
      e.strokeRect(s, 24, 40, 208);
  } else if (i === "wood")
    for (let s = 0; s < 256; s += 26) {
      e.fillStyle = "rgba(0,0,0,0.10)", e.fillRect(0, s, 256, 2);
      for (let r = 0; r < 40; r++)
        e.fillStyle = `rgba(90,60,30,${Math.random() * 0.06})`, e.fillRect(Math.random() * 256, s + Math.random() * 24, 18, 1);
    }
  else if (i === "tile") {
    e.strokeStyle = "rgba(0,0,0,0.14)", e.lineWidth = 2;
    for (let s = 0; s <= 256; s += 64)
      e.beginPath(), e.moveTo(s, 0), e.lineTo(s, 256), e.moveTo(0, s), e.lineTo(256, s), e.stroke();
  }
  const n = new hu(t);
  return n.wrapS = n.wrapT = oi, n;
}
function Ru(i) {
  const t = i || "plain";
  return ya.has(t) || ya.set(t, rM(t)), ya.get(t) ?? null;
}
function oM(i, t, e) {
  if (!i) return null;
  const n = i.clone();
  return n.needsUpdate = !0, n.wrapS = n.wrapT = oi, n.repeat.set(Math.max(1, t / 1), Math.max(1, e / 1)), n;
}
const aM = 2.6, Cu = 0.12, lM = ["single", "double", "glass", "sliding"], cM = ["single", "double", "picture", "sliding"];
function hM(i, t) {
  return new zn({
    color: i ?? "#e6e6e6",
    roughness: 0.95,
    metalness: 0,
    map: t && t !== "plain" ? oM(Ru(t), 3, 2) : null
  });
}
function Us(i, t, e, n, s, r, o, a, l, c) {
  const h = r - s;
  if (h <= 1e-4) return;
  const d = a - o;
  if (d <= 1e-4) return;
  const u = new Vn(h, d, l), f = new ge(u, c);
  f.castShadow = !0, f.receiveShadow = !0;
  const g = s + h / 2, v = t.x + e.x * g, p = t.y + e.y * g;
  f.position.set(v, o + d / 2, p), f.rotation.y = n, i.add(f);
}
function nd(i, t, e, n) {
  const s = new nt(t.start[0], t.start[1]), r = new nt(t.end[0], t.end[1]), o = r.clone().sub(s), a = o.length();
  if (a <= 1e-4) return null;
  const l = o.clone().normalize(), c = new K();
  c.userData.wallIndex = n;
  const d = -Math.atan2(l.y, l.x), u = t.height ?? e, f = t.thickness ?? Cu, g = hM(t.color, t.material), v = new zn({ color: 12159570, roughness: 0.6 }), p = new zn({
    color: 10274778,
    transparent: !0,
    opacity: 0.38,
    // see-through: glass reads as a real opening through the wall
    roughness: 0.05,
    metalness: 0.25,
    depthWrite: !1
  }), m = new zn({ color: 5595242, roughness: 0.6 }), x = (t.openings ?? []).map((M, L) => ({ op: M, oi: L })).sort((M, L) => M.op.position - L.op.position);
  let _ = 0;
  for (const { op: M, oi: L } of x) {
    const T = id(M.position, 0, a), w = id(M.position + M.width, 0, a);
    if (w <= _) continue;
    Us(c, s, l, d, _, T, 0, u, f, g);
    const R = M.sill ?? (M.kind === "window" ? 0.9 : 0), F = M.top ?? (M.kind === "window" ? 2.1 : M.kind === "opening" ? 2.4 : 2.05);
    if (R > 0 && Us(c, s, l, d, T, w, 0, R, f, g), F < u && Us(c, s, l, d, T, w, F, u, f, g), M.bare) {
      _ = Math.max(_, w);
      continue;
    }
    const y = new K();
    n >= 0 && (y.userData.openingWall = n, y.userData.openingIndex = L), c.add(y);
    const S = (q, W, et, $, lt, ct) => Us(y, s, l, d, q, W, et, $, lt, ct), N = 0.06, k = (T + w) / 2, G = (R + F) / 2;
    if (M.kind === "door") {
      const q = M.variant || "single";
      q === "double" ? (S(T, k - 0.03, R, F, 0.06, v), S(k + 0.03, w, R, F, 0.06, v)) : q === "glass" ? (S(T, T + N, R, F, f, v), S(w - N, w, R, F, f, v), S(T, w, F - N, F, f, v), S(T + N, w - N, R, F - N, 0.04, p)) : q === "sliding" ? (S(T, k + 0.06, R, F, 0.045, p), S(k - 0.06, w, R, F, 0.05, v)) : S(T, w, R, F, 0.06, v);
    } else {
      const q = M.variant || "single";
      S(T, T + N, R, F, f * 1.05, m), S(w - N, w, R, F, f * 1.05, m), S(T, w, R, R + N, f * 1.05, m), S(T, w, F - N, F, f * 1.05, m), S(T + N, w - N, R + N, F - N, f, p), q === "single" ? (S(k - 0.03, k + 0.03, R + N, F - N, f * 1.05, m), S(T + N, w - N, G - 0.03, G + 0.03, f * 1.05, m)) : (q === "double" || q === "sliding") && S(k - 0.03, k + 0.03, R + N, F - N, f * 1.05, m);
    }
    _ = Math.max(_, w);
  }
  Us(c, s, l, d, _, a, 0, u, f, g);
  for (const M of [s, r]) {
    const L = new ge(new Vn(f, u, f), g);
    L.position.set(M.x, u / 2, M.y), L.castShadow = !0, L.receiveShadow = !0, c.add(L);
  }
  return i.add(c), c;
}
function dM(i, t, e, n) {
  if (!n || n.length < 3) return null;
  const s = new mu();
  n.forEach((c, h) => {
    h === 0 ? s.moveTo(c[0], c[1]) : s.lineTo(c[0], c[1]);
  }), s.closePath();
  const r = new jl(s);
  r.rotateX(Math.PI / 2);
  const o = new ge(
    r,
    new zn({
      color: t.color ?? "#cfc7ba",
      roughness: 1,
      metalness: 0,
      side: on,
      map: t.material && t.material !== "plain" ? Ru(t.material) : null
    })
  );
  o.position.y = 5e-3, o.receiveShadow = !0, o.userData.roomIndex = e, i.add(o);
  let a = 0, l = 0;
  for (const c of n)
    a += c[0], l += c[1];
  return {
    centroid: new nt(a / n.length, l / n.length),
    mesh: o
  };
}
function uM(i, t) {
  const e = new K();
  e.position.y = i.elevation ?? 0;
  const n = i.wallHeight ?? t ?? aM, s = [], r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  (i.rooms ?? []).forEach((c, h) => {
    const d = xn(c) ? Qn(c) : c.polygon, u = dM(e, c, h, d);
    if (u && o.set(h, u.mesh), xn(c)) {
      const f = c.thickness ?? Cu;
      for (const g of eM(c, c.height ?? n, f)) {
        const v = nd(e, g, c.height ?? n, -1);
        v && (delete v.userData.wallIndex, v.userData.roomIndex = h);
      }
    }
  }), (i.walls ?? []).forEach((c, h) => {
    const d = nd(e, c, n, h);
    d && r.set(h, d);
  });
  const a = /* @__PURE__ */ new Map();
  for (const c of i.furniture ?? []) {
    const h = Qy(c);
    c.brightness != null && c.brightness > 0 && h.traverse((d) => {
      const u = d;
      if (u.isMesh && u.name === "emissive") {
        const f = u.material;
        f && "emissive" in f && (f.emissive.setHex(16773584), f.emissiveIntensity = c.brightness);
      }
    }), e.add(h), c.id && a.set(c.id, h);
  }
  const l = new Ke().setFromObject(e);
  return { group: e, furnitureById: a, wallById: r, roomById: o, bbox: l, labels: s };
}
function id(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
class Pu {
  constructor(t = 1) {
    this.current = "", this.canvas = document.createElement("canvas"), this.canvas.width = 256, this.canvas.height = 128, this.ctx = this.canvas.getContext("2d"), this.texture = new hu(this.canvas), this.texture.anisotropy = 4;
    const e = new ru({
      map: this.texture,
      transparent: !0,
      depthWrite: !1,
      depthTest: !1
    });
    this.sprite = new Lv(e), this.sprite.scale.set(1 * t, 0.5 * t, 1), this.sprite.renderOrder = 999;
  }
  setText(t, e = "#ffffff") {
    if (t === this.current) return;
    this.current = t;
    const n = this.ctx;
    n.clearRect(0, 0, this.canvas.width, this.canvas.height), n.fillStyle = "rgba(20,22,26,0.78)", fM(n, 8, 28, 240, 72, 16), n.fill(), n.fillStyle = e, n.font = "bold 48px system-ui, sans-serif", n.textAlign = "center", n.textBaseline = "middle", n.fillText(t, 128, 64, 224), this.texture.needsUpdate = !0;
  }
  setPosition(t, e, n) {
    this.sprite.position.set(t, e, n);
  }
  dispose() {
    this.texture.dispose(), this.sprite.material.dispose();
  }
}
function fM(i, t, e, n, s, r) {
  i.beginPath(), i.moveTo(t + r, e), i.arcTo(t + n, e, t + n, e + s, r), i.arcTo(t + n, e + s, t, e + s, r), i.arcTo(t, e + s, t, e, r), i.arcTo(t, e, t + n, e, r), i.closePath();
}
const pM = /* @__PURE__ */ new Set(["light", "switch", "fan", "cover", "media_player"]);
function Lu(i) {
  return i.split(".")[0];
}
function mM(i) {
  return i.behavior && i.behavior !== "auto" ? i.behavior : Lu(i.entity_id);
}
function gM(i) {
  const t = [];
  i.traverse((n) => {
    const s = n;
    s.isMesh && (s.name === "emissive" ? t.unshift(s) : t.push(s));
  });
  const e = t.filter((n) => n.name === "emissive");
  return e.length ? e : t;
}
function _M(i, t) {
  const e = [];
  return i.traverse((n) => {
    n.name === t && e.push(n);
  }), e;
}
class vM {
  constructor(t) {
    this.bindings = [], this.byEntity = /* @__PURE__ */ new Map(), this.root = t;
  }
  /** Register all bindings for a freshly built floor. */
  register(t, e) {
    for (const n of e) {
      const s = mM(n);
      let r = null;
      const o = new P();
      n.anchor_object && t.furnitureById.has(n.anchor_object) ? (r = t.furnitureById.get(n.anchor_object), r.getWorldPosition(o)) : n.anchor ? (o.set(n.anchor[0], n.anchor[1], n.anchor[2]), o.y += t.group.position.y) : (t.bbox.getCenter(o), o.y = t.group.position.y + 1.5);
      const a = {
        def: n,
        behavior: s,
        anchor: r,
        worldPos: o,
        emissiveMeshes: r ? gM(r) : [],
        curtains: r ? _M(r, "curtainPivot") : []
      };
      this.setupVisual(a, t), this.bindings.push(a), this.byEntity.has(n.entity_id) || this.byEntity.set(n.entity_id, []), this.byEntity.get(n.entity_id).push(a), r && (r.userData.bindingEntity = n.entity_id);
    }
  }
  setupVisual(t, e) {
    const { behavior: n, worldPos: s } = t;
    if (n === "light") {
      const r = new bu(16773584, 0, 8, 2);
      r.position.copy(s), r.castShadow = !1, this.root.add(r), t.pointLight = r;
    }
    if (n === "climate" || n === "sensor" || n === "binary_sensor" || n === "lock" || n === "media_player" || n === "label") {
      const r = new Pu(1.2), o = t.anchor ? 0.6 : 0;
      r.setPosition(s.x, s.y + o + 0.4, s.z), this.root.add(r.sprite), e.labels.push(r), t.label = r;
    }
    n === "fan" && (t.spin = t.anchor ?? void 0);
  }
  /** Apply current HA state to all bindings. Only changed entities do work. */
  update(t) {
    for (const e of this.bindings) {
      const n = t.states[e.def.entity_id];
      this.applyState(e, n);
    }
  }
  /** Targeted update for a single entity (used on subscribed state changes). */
  updateEntity(t, e) {
    const n = this.byEntity.get(t);
    if (!n) return;
    const s = e.states[t];
    for (const r of n) this.applyState(r, s);
  }
  applyState(t, e) {
    const n = e?.state ?? "unavailable", s = t.def.label ?? e?.attributes?.friendly_name ?? t.def.entity_id;
    switch (t.behavior) {
      case "light": {
        const r = n === "on", o = (e?.attributes?.brightness ?? 255) / 255;
        t.pointLight && (t.pointLight.intensity = r ? 2.5 * o : 0), this.setEmissive(t, r ? 16773584 : 0, r ? o : 0);
        break;
      }
      case "switch":
      case "media_player": {
        const r = n === "on" || n === "playing" || n === "home";
        this.setEmissive(t, r ? 5230698 : 0, r ? 0.6 : 0), t.label && t.behavior === "media_player" && t.label.setText(n, r ? "#7CFC8A" : "#cccccc");
        break;
      }
      case "climate": {
        const r = e?.attributes?.current_temperature, o = e?.attributes?.temperature, a = r != null ? `${r}°${o != null ? ` → ${o}°` : ""}` : n;
        t.label?.setText(a, "#9ad0ff");
        break;
      }
      case "sensor":
      case "label": {
        const r = e?.attributes?.unit_of_measurement ?? "";
        t.label?.setText(`${sd(s)}: ${n}${r}`, "#ffe7a0");
        break;
      }
      case "binary_sensor": {
        const r = n === "on";
        t.label?.setText(
          `${sd(s)}: ${r ? "ON" : "off"}`,
          r ? "#ff8080" : "#bbbbbb"
        ), this.setEmissive(t, r ? 16733525 : 0, r ? 0.5 : 0);
        break;
      }
      case "lock": {
        const r = n === "locked";
        t.label?.setText(
          r ? "🔒 locked" : "🔓 unlocked",
          r ? "#7CFC8A" : "#ff8080"
        ), this.setEmissive(t, r ? 5230698 : 16733525, 0.5);
        break;
      }
      case "cover": {
        const r = e?.attributes?.current_position, o = typeof r == "number" ? r / 100 : n === "open" || n === "opening" ? 1 : 0;
        t.curtains && t.curtains.length ? t.coverOpen = o : this.setEmissive(t, o > 0.5 ? 5230698 : 0, o > 0.5 ? 0.4 : 0);
        break;
      }
      case "fan": {
        t.spin = n === "on" ? t.anchor ?? void 0 : void 0;
        break;
      }
    }
    t.lastState = n;
  }
  setEmissive(t, e, n) {
    for (const s of t.emissiveMeshes) {
      const r = s.material;
      !r || !("emissive" in r) || (r.emissive.setHex(e), r.emissiveIntensity = n, r.needsUpdate = !1);
    }
  }
  /** Per-frame animation for fans + sliding curtains. */
  animate(t) {
    for (const e of this.bindings)
      if (e.behavior === "fan" && e.spin && (e.spin.rotation.y += t * 6), e.curtains && e.curtains.length && e.coverOpen !== void 0) {
        const n = 1 - 0.84 * e.coverOpen, s = Math.min(1, t * 4);
        for (const r of e.curtains)
          r.scale.x += (n - r.scale.x) * s;
      }
  }
  /**
   * Given a clicked Object3D, walk up to find a bound anchor and return the
   * action to perform. Returns null if the object isn't bound.
   */
  resolveClick(t) {
    let e = t;
    for (; e; ) {
      const n = e.userData?.bindingEntity;
      if (n) {
        const s = this.byEntity.get(n)?.[0];
        return { entity_id: n, behavior: s?.behavior ?? "auto" };
      }
      e = e.parent;
    }
    return null;
  }
  /** All anchor objects, for raycasting. */
  get anchors() {
    return this.bindings.map((t) => t.anchor).filter((t) => !!t);
  }
  dispose() {
    for (const t of this.bindings)
      t.pointLight && this.root.remove(t.pointLight);
    this.bindings = [], this.byEntity.clear();
  }
}
function xM(i, t) {
  const e = Lu(i), n = { entity_id: i };
  switch (t) {
    case "light":
      return { domain: "light", service: "toggle", data: n };
    case "switch":
      return { domain: "switch", service: "toggle", data: n };
    case "fan":
      return { domain: "fan", service: "toggle", data: n };
    case "cover":
      return { domain: "cover", service: "toggle", data: n };
    case "media_player":
      return { domain: "media_player", service: "media_play_pause", data: n };
    case "lock":
      return null;
    default:
      return pM.has(e) ? { domain: e, service: "toggle", data: n } : null;
  }
}
function sd(i) {
  return i.length > 18 ? i.slice(0, 16) + "…" : i;
}
class yM {
  constructor(t, e = "#1b1d22") {
    this.clock = new Ux(), this.running = !1, this.rafId = 0, this.floors = [], this.floorGroups = [], this.bindingManagers = [], this.activeFloor = 0, this.fullBBox = new Ke(), this.cameraDistance = 1, this.raycaster = new $x(), this.pointer = new nt(), this.downPos = { x: 0, y: 0 }, this.downTime = 0, this.previewGroup = new K(), this.gizmoGroup = new K(), this.underlayGroup = new K(), this.editing = !1, this.groundPlane = new Fn(new P(0, 1, 0), 0), this.dragging = !1, this.container = t, this.renderer = new nu({ antialias: !0, alpha: !1 }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = wd, this.renderer.domElement.style.touchAction = "none", this.renderer.domElement.style.display = "block", this.renderer.domElement.style.width = "100%", this.renderer.domElement.style.height = "100%", t.appendChild(this.renderer.domElement), this.scene = new iu(), this.scene.background = new Ct(e), this.scene.add(this.previewGroup), this.scene.add(this.gizmoGroup), this.scene.add(this.underlayGroup), this.camera = new ze(55, 1, 0.1, 1e3), this.camera.position.set(8, 8, 8), this.controls = new Yx(this.camera, this.renderer.domElement), this.controls.enableDamping = !0, this.controls.dampingFactor = 0.12, this.controls.screenSpacePanning = !1, this.controls.zoomToCursor = !0, this.controls.minDistance = 2, this.controls.maxDistance = 40, this.controls.maxPolarAngle = Math.PI * 0.49, this.controls.touches = {
      ONE: mn.ROTATE,
      TWO: mn.DOLLY_PAN
    }, this.controls.addEventListener("change", () => this.clampTarget()), this.setupLights(), this.setupResize(), this.setupPointer();
  }
  setupLights() {
    const t = new Eu(16777215, 0.55);
    this.scene.add(t);
    const e = new ql(16777215, 0.9);
    e.position.set(10, 18, 8), e.castShadow = !0, e.shadow.mapSize.set(1024, 1024), e.shadow.camera.near = 1, e.shadow.camera.far = 60;
    const n = 20;
    e.shadow.camera.left = -n, e.shadow.camera.right = n, e.shadow.camera.top = n, e.shadow.camera.bottom = -n, this.scene.add(e);
    const s = new Cx(16777215, 4473941, 0.4);
    this.scene.add(s);
  }
  setupResize() {
    this.resizeObserver = new ResizeObserver(() => this.resize()), this.resizeObserver.observe(this.container), this.resize();
  }
  resize() {
    const t = this.container.clientWidth || 1, e = this.container.clientHeight || 1;
    this.renderer.setSize(t, e, !1), this.camera.aspect = t / e, this.camera.updateProjectionMatrix();
  }
  // -- Floor plan loading -----------------------------------------------------
  loadPlan(t, e = !1) {
    const n = this.controls.target.clone(), s = this.camera.position.clone(), r = this.activeFloor;
    this.clearPlan(), this.fullBBox.makeEmpty(), t.floors.forEach((a) => {
      const l = uM(a, t.wallHeight), c = new vM(l.group);
      c.register(l, a.bindings ?? []), this.scene.add(l.group), this.floors.push(l), this.floorGroups.push(l.group), this.bindingManagers.push(c), this.fullBBox.union(l.bbox);
    }), t.cameraDistance && (this.cameraDistance = t.cameraDistance);
    const o = e ? Math.min(r, this.floors.length - 1) : 0;
    this.activeFloor = Math.max(0, o), this.floorGroups.forEach((a, l) => a.visible = l === this.activeFloor), e ? (this.controls.target.copy(n), this.camera.position.copy(s), this.controls.update()) : this.resetView();
  }
  clearPlan() {
    for (const t of this.bindingManagers) t.dispose();
    for (const t of this.floors)
      for (const e of t.labels) e.dispose();
    for (const t of this.floorGroups)
      this.scene.remove(t), MM(t);
    this.floors = [], this.floorGroups = [], this.bindingManagers = [], this.activeFloor = 0;
  }
  get floorCount() {
    return this.floors.length;
  }
  setActiveFloor(t) {
    t < 0 || t >= this.floors.length || (this.activeFloor = t, this.floorGroups.forEach((e, n) => {
      e.visible = n === t;
    }), this.resetView());
  }
  get currentFloor() {
    return this.activeFloor;
  }
  // -- Camera / touch hardening ----------------------------------------------
  /** Recenter on the visible floor's bounding box. The kiosk safety net. */
  resetView() {
    let t = this.floors[this.activeFloor]?.bbox ?? this.fullBBox;
    (!t || t.isEmpty()) && (t = new Ke(
      new P(-4, 0, -4),
      new P(4, 2.6, 4)
    ));
    const e = t.getCenter(new P()), n = t.getSize(new P()), s = Math.max(n.x, n.z, 2);
    this.controls.target.copy(e);
    const r = (s * 0.95 + 3) * this.cameraDistance;
    this.camera.position.set(e.x + r * 0.7, e.y + r * 0.8, e.z + r * 0.7), this.controls.maxDistance = r * 3, this.controls.minDistance = Math.max(1.2, s * 0.1), this.camera.lookAt(e), this.controls.update();
  }
  /** Multiplier on the reset-view framing distance (from card config). */
  setCameraDistance(t) {
    t > 0 && (this.cameraDistance = t);
  }
  /** Keep the orbit target from drifting outside the floor bbox + margin. */
  clampTarget() {
    const t = this.floors[this.activeFloor]?.bbox ?? this.fullBBox;
    if (t.isEmpty()) return;
    const e = 3, n = this.controls.target, s = ts.clamp(n.x, t.min.x - e, t.max.x + e), r = ts.clamp(n.y, t.min.y, t.max.y + 1), o = ts.clamp(n.z, t.min.z - e, t.max.z + e);
    this.camera.position.x += s - n.x, this.camera.position.y += r - n.y, this.camera.position.z += o - n.z, n.set(s, r, o);
  }
  // -- Picking ----------------------------------------------------------------
  setPickHandler(t) {
    this.onPick = t;
  }
  setupPointer() {
    const t = this.renderer.domElement;
    t.addEventListener("pointerdown", (e) => {
      if (this.downPos = { x: e.clientX, y: e.clientY }, this.downTime = performance.now(), this.editing && e.isPrimary && this.onDrag && this.onDrag.start(e)) {
        this.dragging = !0, this.controls.enabled = !1;
        try {
          t.setPointerCapture(e.pointerId);
        } catch {
        }
      }
    }), t.addEventListener("pointerup", (e) => {
      if (this.dragging) {
        this.dragging = !1, this.controls.enabled = !0, this.onDrag?.end();
        try {
          t.releasePointerCapture(e.pointerId);
        } catch {
        }
        return;
      }
      const n = e.clientX - this.downPos.x, s = e.clientY - this.downPos.y, r = Math.hypot(n, s), o = performance.now() - this.downTime;
      if (!(r >= 8 || o >= 600))
        if (this.editing && this.onGround?.click) {
          const a = this.groundIntersect(e);
          a && this.onGround.click(a, e);
        } else
          this.handlePick(e);
    }), t.addEventListener("pointermove", (e) => {
      if (this.dragging && this.onDrag) {
        const n = this.groundIntersect(e);
        n && this.onDrag.move(n, e);
        return;
      }
      if (this.editing && this.onGround?.move) {
        const n = this.groundIntersect(e);
        n && this.onGround.move(n, e);
      }
    });
  }
  setDragHandler(t) {
    this.onDrag = t;
  }
  /** Keep the selection box aligned after moving an object live (during drag). */
  refreshSelection() {
    this.selectionHelper?.update();
  }
  // -- Editor API -------------------------------------------------------------
  setEditMode(t, e = 0) {
    this.editing = t, this.groundPlane.constant = -e, t ? (this.gridHelper || (this.gridHelper = new Xx(40, 80, 4891647, 2765632), this.gridHelper.material.transparent = !0, this.gridHelper.material.opacity = 0.5, this.scene.add(this.gridHelper)), this.gridHelper.position.y = e + 2e-3, this.gridHelper.visible = !0) : (this.gridHelper && (this.gridHelper.visible = !1), this.clearPreview(), this.setSelection(null));
  }
  /** Raycast a pointer event against the active floor; return the furniture
   *  placement it hits (by id), walking up to the placement group. */
  pickFurniture(t) {
    const e = this.floorGroups[this.activeFloor];
    if (!e) return null;
    const n = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = (t.clientX - n.left) / n.width * 2 - 1, this.pointer.y = -((t.clientY - n.top) / n.height) * 2 + 1, this.raycaster.setFromCamera(this.pointer, this.camera);
    const s = this.raycaster.intersectObject(e, !0);
    for (const r of s) {
      let o = r.object;
      for (; o; ) {
        const a = o.userData?.furnitureId;
        if (a) return { id: a, object: o };
        o = o.parent;
      }
    }
    return null;
  }
  getFurnitureObject(t) {
    return this.floors[this.activeFloor]?.furnitureById.get(t);
  }
  getWallObject(t) {
    return this.floors[this.activeFloor]?.wallById.get(t);
  }
  getRoomObject(t) {
    return this.floors[this.activeFloor]?.roomById.get(t);
  }
  /** Raycast for a wall sub-group (returns its wall array-index). */
  pickWall(t) {
    return this.pickByUserData(t, "wallIndex");
  }
  /** Raycast for a door/window leaf — returns the wall + opening index so the
   *  opening can be selected directly (without selecting the wall first). */
  pickOpening(t) {
    const e = this.floorGroups[this.activeFloor];
    if (!e) return null;
    const n = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = (t.clientX - n.left) / n.width * 2 - 1, this.pointer.y = -((t.clientY - n.top) / n.height) * 2 + 1, this.raycaster.setFromCamera(this.pointer, this.camera);
    const s = this.raycaster.intersectObject(e, !0);
    for (const r of s) {
      let o = r.object;
      for (; o; ) {
        const a = o.userData?.openingWall, l = o.userData?.openingIndex;
        if (a !== void 0 && l !== void 0)
          return { wallIndex: a, openingIndex: l, object: o };
        o = o.parent;
      }
    }
    return null;
  }
  /** Raycast for a room floor mesh (returns its room array-index). */
  pickRoom(t) {
    return this.pickByUserData(t, "roomIndex");
  }
  /** Raycast the gizmo handles; returns the handle id (userData.gizmoHandle). */
  pickGizmo(t) {
    if (!this.gizmoGroup.children.length) return null;
    const e = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = (t.clientX - e.left) / e.width * 2 - 1, this.pointer.y = -((t.clientY - e.top) / e.height) * 2 + 1, this.raycaster.setFromCamera(this.pointer, this.camera);
    const n = this.raycaster.intersectObjects(this.gizmoGroup.children, !0);
    for (const s of n) {
      let r = s.object;
      for (; r; ) {
        const o = r.userData?.gizmoHandle;
        if (o) return o;
        r = r.parent;
      }
    }
    return null;
  }
  clearGizmo() {
    for (const t of [...this.gizmoGroup.children]) {
      const e = t;
      e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material : [e.material]).forEach((s) => s.dispose());
    }
    this.gizmoGroup.clear();
  }
  pickByUserData(t, e) {
    const n = this.floorGroups[this.activeFloor];
    if (!n) return null;
    const s = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = (t.clientX - s.left) / s.width * 2 - 1, this.pointer.y = -((t.clientY - s.top) / s.height) * 2 + 1, this.raycaster.setFromCamera(this.pointer, this.camera);
    const r = this.raycaster.intersectObject(n, !0);
    for (const o of r) {
      let a = o.object;
      for (; a; ) {
        const l = a.userData?.[e];
        if (typeof l == "number") return { index: l, object: a };
        a = a.parent;
      }
    }
    return null;
  }
  /** Highlight a selected object with a bounding box, or clear it. */
  setSelection(t) {
    this.selectionHelper && (this.scene.remove(this.selectionHelper), this.selectionHelper.geometry.dispose(), this.selectionHelper = void 0), t && (this.selectionHelper = new jx(t, 5230698), this.scene.add(this.selectionHelper));
  }
  setGroundHandler(t) {
    this.onGround = t;
  }
  /** Enable/disable camera orbit + pan (zoom stays on so you never get stuck). */
  setControlsEnabled(t) {
    this.controls.enableRotate = t, this.controls.enablePan = t;
  }
  /**
   * In draw mode, the LEFT mouse / single finger performs the editor action
   * (draw, place, select) while RIGHT mouse / two fingers always orbit + zoom —
   * so you never have to switch to a "View" tool to move the camera. In view
   * mode, the usual controls apply.
   */
  /**
   * Camera is ALWAYS fully controllable while editing (left-drag orbit, right
   * pan, wheel zoom, one-finger orbit, two-finger pan/zoom). The editor distin-
   * guishes a TAP (tool action) from a DRAG (camera), and suspends the camera
   * only while actually dragging a grabbed object/handle (see setupPointer).
   * The `drawing` arg is kept for call-site compatibility but no longer
   * restricts the camera.
   */
  setDrawMode(t) {
    this.controls.enabled = !0, this.controls.enableRotate = !0, this.controls.enableZoom = !0, this.controls.enablePan = !0, this.controls.mouseButtons = {
      LEFT: pn.ROTATE,
      MIDDLE: pn.DOLLY,
      RIGHT: pn.PAN
    }, this.controls.touches = { ONE: mn.ROTATE, TWO: mn.DOLLY_PAN };
  }
  /**
   * When a movable object is selected, reserve LEFT mouse / one-finger for
   * dragging that object (so it moves instead of orbiting the camera). Camera
   * is still available via right-drag / two fingers.
   */
  setLeftReserved(t) {
    t ? (this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: pn.DOLLY,
      RIGHT: pn.ROTATE
    }, this.controls.touches = { ONE: null, TWO: mn.DOLLY_PAN }) : this.setDrawMode(!0);
  }
  /** Raycast a pointer event onto the current ground plane. */
  groundIntersect(t) {
    const e = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = (t.clientX - e.left) / e.width * 2 - 1, this.pointer.y = -((t.clientY - e.top) / e.height) * 2 + 1, this.raycaster.setFromCamera(this.pointer, this.camera);
    const n = new P();
    return this.raycaster.ray.intersectPlane(this.groundPlane, n) ? n : null;
  }
  clearPreview() {
    for (const t of [...this.previewGroup.children]) {
      const e = t;
      e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material : [e.material]).forEach((s) => s.dispose());
    }
    this.previewGroup.clear();
  }
  /** Show (or clear, when null) a flat reference image on the floor plane that
   *  walls can be traced over. Editor-only; not part of the rendered plan. */
  setUnderlay(t, e = 0) {
    for (const h of [...this.underlayGroup.children])
      h.traverse((d) => {
        const u = d;
        u.geometry && u.geometry.dispose();
        const f = u.material;
        f && (f.map?.dispose(), f.dispose());
      });
    if (this.underlayGroup.clear(), !t || !t.image) return;
    const n = t.aspect > 0 ? t.aspect : 1, s = Math.max(0.1, t.widthM || 10), r = s * n, o = new Su().load(t.image);
    o.colorSpace = ke;
    const a = new en({
      map: o,
      transparent: !0,
      opacity: t.opacity ?? 0.6,
      depthWrite: !1,
      // walls/floor draw over it cleanly
      side: on
    }), l = new ge(new ar(s, r), a);
    l.rotation.x = -Math.PI / 2, l.renderOrder = -1;
    const c = new K();
    c.add(l), c.position.set(t.x ?? 0, e + 0.012, t.z ?? 0), c.rotation.y = (t.rotation ?? 0) * (Math.PI / 180), this.underlayGroup.add(c);
  }
  handlePick(t) {
    if (!this.onPick) return;
    const e = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = (t.clientX - e.left) / e.width * 2 - 1, this.pointer.y = -((t.clientY - e.top) / e.height) * 2 + 1, this.raycaster.setFromCamera(this.pointer, this.camera);
    const n = this.bindingManagers[this.activeFloor];
    if (!n) {
      this.onPick(null);
      return;
    }
    const s = this.raycaster.intersectObjects(n.anchors, !0);
    if (s.length === 0) {
      this.onPick(null);
      return;
    }
    const r = n.resolveClick(s[0].object);
    this.onPick(r);
  }
  /** Targeted live update for a single entity. */
  updateEntity(t, e) {
    this.bindingManagers[this.activeFloor]?.updateEntity(t, e), this.bindingManagers.forEach((s, r) => {
      r !== this.activeFloor && s.updateEntity(t, e);
    });
  }
  /** Full state sync (called on each hass update from the card). */
  syncAll(t) {
    for (const e of this.bindingManagers) e.update(t);
  }
  // -- Render loop ------------------------------------------------------------
  start() {
    if (this.running) return;
    this.running = !0;
    const t = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(t);
      const e = this.clock.getDelta();
      this.controls.update(), this.bindingManagers[this.activeFloor]?.animate(e), this.renderer.render(this.scene, this.camera);
    };
    t();
  }
  stop() {
    this.running = !1, cancelAnimationFrame(this.rafId);
  }
  dispose() {
    this.stop(), this.resizeObserver?.disconnect(), this.clearPlan(), this.controls.dispose(), this.renderer.dispose(), this.renderer.domElement.remove();
  }
}
function MM(i) {
  i.traverse((t) => {
    const e = t;
    e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material : [e.material]).forEach((s) => s.dispose());
  });
}
const SM = "0.15.1", vo = "ha-3d-floorplan-sidebar-item", rd = "ha-3d-floorplan-overlay";
function bM() {
  return window.ha3dFloorplan ?? {};
}
function EM(i) {
  const t = i.shadowRoot;
  return t.querySelector("ha-md-list") || t.querySelector("paper-listbox") || t.querySelector("ul.ha-scrollbar") || t.querySelector("ul") || t.querySelector(".menu");
}
function wM(i) {
  const t = document.createElement("a");
  t.id = vo, t.href = "#", t.setAttribute("role", "menuitem"), t.style.cssText = [
    "display:flex",
    "align-items:center",
    "gap:12px",
    "box-sizing:border-box",
    "width:calc(100% - 12px)",
    "margin:4px 8px",
    "padding:12px",
    "border-radius:12px",
    "cursor:pointer",
    // Match the other (unselected) sidebar items: white-ish text, medium weight.
    "color:var(--sidebar-text-color, var(--primary-text-color, #e1e1e1))",
    "font:inherit",
    "font-size:14px",
    "font-weight:500",
    "text-decoration:none",
    "-webkit-tap-highlight-color:transparent"
  ].join(";");
  const e = document.createElement("ha-icon");
  e.setAttribute("icon", i.icon ?? "mdi:floor-plan"), e.style.cssText = "width:24px;height:24px;flex:0 0 24px;";
  const n = document.createElement("span");
  return n.textContent = i.title ?? "3D Floor Plan", n.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;", t.appendChild(e), t.appendChild(n), t.addEventListener("mouseenter", () => t.style.background = "var(--sidebar-selected-icon-color, rgba(255,255,255,0.06))"), t.addEventListener("mouseleave", () => t.style.background = "transparent"), t.addEventListener("click", (s) => {
    s.preventDefault(), RM(i);
  }), t;
}
function od(i, t) {
  const e = i.shadowRoot;
  if (e.getElementById(vo)) return;
  const n = EM(i), s = wM(t);
  n && n.parentNode ? n.parentNode.insertBefore(s, n.nextSibling) : e.appendChild(s);
}
function TM(i) {
  if (i.config) return { type: "custom:ha-3d-floorplan-card", height: "100vh", ...i.config };
  const t = { type: "custom:ha-3d-floorplan-card", height: "100vh" };
  return i.url && (t.url = i.url), t;
}
function AM() {
  const e = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar");
  if (!e) return 0;
  const n = e.getBoundingClientRect();
  return n.width === 0 || n.right <= 0 ? 0 : Math.max(0, Math.round(n.right));
}
function RM(i) {
  if (document.getElementById(rd)) return;
  const t = document.createElement("div");
  t.id = rd, t.style.cssText = [
    "position:fixed",
    "top:0",
    "right:0",
    "bottom:0",
    "left:0",
    "z-index:9999",
    "background:var(--primary-background-color, #111)",
    "display:block"
  ].join(";");
  const e = () => {
    t.style.left = `${AM()}px`;
  };
  e(), window.addEventListener("resize", e);
  let n;
  const r = document.querySelector("home-assistant")?.shadowRoot?.querySelector(
    "home-assistant-main"
  )?.shadowRoot?.querySelector("ha-sidebar");
  r && "ResizeObserver" in window && (n = new ResizeObserver(e), n.observe(r));
  const o = window.setInterval(e, 500), a = document.createElement("button");
  a.textContent = "✕", a.title = "Close", a.style.cssText = [
    "position:absolute",
    "bottom:14px",
    "left:14px",
    "z-index:10000",
    "width:42px",
    "height:42px",
    "border-radius:50%",
    "border:1px solid rgba(255,255,255,0.2)",
    "background:rgba(30,33,40,0.85)",
    "color:#fff",
    "font-size:18px",
    "cursor:pointer",
    "backdrop-filter:blur(4px)"
  ].join(";");
  const l = document.createElement("ha-3d-floorplan-card");
  l.style.cssText = "display:block;width:100%;height:100%;";
  try {
    l.setConfig(TM(i));
  } catch (v) {
    console.error("[3d-floorplan] sidebar config error:", v);
  }
  const c = document.querySelector("home-assistant");
  c?.hass && (l.hass = c.hass);
  const h = window.setInterval(() => {
    c?.hass && (l.hass = c.hass), location.pathname !== d && f();
  }, 1e3), d = location.pathname, u = () => {
    location.pathname !== d && f();
  }, f = () => {
    window.clearInterval(h), window.clearInterval(o), window.removeEventListener("resize", e), window.removeEventListener("location-changed", u), window.removeEventListener("popstate", u), n?.disconnect(), t.remove(), document.removeEventListener("keydown", g);
  }, g = (v) => {
    v.key === "Escape" && f();
  };
  window.addEventListener("location-changed", u), window.addEventListener("popstate", u), a.addEventListener("click", f), document.addEventListener("keydown", g), t.appendChild(a), t.appendChild(l), document.body.appendChild(t);
}
function CM() {
  const e = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar");
  return e && e.shadowRoot ? e : null;
}
let ad = !1;
function PM() {
  const i = bM();
  if (i.sidebar === !1 || ad) return;
  ad = !0;
  const t = () => {
    const e = CM();
    if (!e) return;
    const n = e.shadowRoot;
    if (n.querySelector(
      'a[href="/3d-floorplan"], a[href$="/3d-floorplan"], a[href$="/ha-3d-floorplan-card"]'
    ) || window.__ha3dPanelMode) {
      n.getElementById(vo)?.remove();
      return;
    }
    if (od(e, i), !e.__ha3dObs) {
      const r = e.shadowRoot, o = new MutationObserver(() => {
        r.getElementById(vo) || od(e, i);
      });
      o.observe(r, { childList: !0, subtree: !0 }), e.__ha3dObs = o;
    }
  };
  t(), window.setInterval(t, 1500);
}
const LM = {
  name: "Demo Home",
  wallHeight: 2.6,
  floors: [
    {
      name: "Ground Floor",
      elevation: 0,
      wallHeight: 2.6,
      walls: [
        { start: [0, 0], end: [8, 0], openings: [{ kind: "window", position: 3, width: 1.4 }] },
        { start: [8, 0], end: [8, 6] },
        { start: [8, 6], end: [0, 6], openings: [{ kind: "door", position: 3.5, width: 1 }] },
        { start: [0, 6], end: [0, 0] },
        { start: [4.5, 0], end: [4.5, 6], openings: [{ kind: "door", position: 2.5, width: 0.9 }] }
      ],
      rooms: [
        { name: "Living Room", polygon: [[0, 0], [4.5, 0], [4.5, 6], [0, 6]], color: "#cdbfa6" },
        { name: "Kitchen", polygon: [[4.5, 0], [8, 0], [8, 6], [4.5, 6]], color: "#c2c8c4" }
      ],
      furniture: [
        { model: "sofa", position: [1.2, 0, 4.6], rotation: 0, color: "#5b6b7a", id: "sofa1" },
        { model: "table", position: [2.2, 0, 2.6], color: "#8a5a30", id: "table1" },
        { model: "chair", position: [2.2, 0, 1.7], rotation: 180, id: "chair1" },
        { model: "tv", position: [2.2, 0, 0.3], rotation: 0, id: "tv1" },
        { model: "ceiling_light", position: [2.2, 2.45, 3], color: "#ffffff", id: "living_lamp" },
        { model: "kitchen_counter", position: [6.2, 0, 0.5], rotation: 0, color: "#e8e8e8", id: "counter1" },
        { model: "fridge", position: [7.5, 0, 1.5], rotation: -90, id: "fridge1" },
        { model: "sink", position: [5.2, 0, 0.5], id: "sink1" },
        { model: "ceiling_light", position: [6.2, 2.45, 3], id: "kitchen_lamp" }
      ],
      // No entity bindings in the demo, so nothing shows as "unavailable".
      bindings: []
    }
  ]
}, ld = {
  window_frame: { kind: "window", width: 1.2, variant: "single" },
  terrace_window: { kind: "window", width: 2.4, variant: "picture" },
  patio_door: { kind: "door", width: 2.4, variant: "glass", sill: 0, top: 2.2 }
}, xo = 0.1, IM = 0.4, DM = 0.3, cd = Math.PI / 12, NM = 0.12, hd = 0.25, Te = (i) => Math.round(i / xo) * xo, ji = (i, t) => Math.hypot(i[0] - t[0], i[1] - t[1]) < 1e-4, Kr = (i, t, e) => {
  const n = e * Math.PI / 180, s = Math.cos(n), r = Math.sin(n);
  return [i * s - t * r, i * r + t * s];
};
class UM {
  constructor(t, e) {
    this.floorIndex = 0, this.tool = "wall", this.selectedModel = "sofa", this.selectedKind = null, this.selectedId = null, this.selectedWall = -1, this.selectedRoom = -1, this.selectedOpeningWall = -1, this.selectedOpeningIndex = -1, this.chain = [], this.cursor = null, this.calibrating = !1, this.calibPts = [], this.snapEnabled = !0, this.snapInfo = null, this.dragMode = null, this.dragVertex = null, this.wallDrag0 = null, this.furnDrag0 = [0, 0], this.undoStack = [], this.redoStack = [], this.dragSnapshot = null, this.HISTORY_MAX = 80, this.gizmoHandle = null, this.gizmoGrab = [0, 0], this.gizmoRoom0 = { x: 0, z: 0, width: 3, depth: 3, rotation: 0 }, this.shiftHeld = !1, this.sm = t, this.plan = e;
  }
  get pointCount() {
    return this.chain.length;
  }
  start() {
    this.measureLabel = new Pu(1.2), this.measureLabel.sprite.visible = !1, this.sm.scene.add(this.measureLabel.sprite), this.sm.setDragHandler({
      start: (t) => this.dragStart(t),
      move: (t) => this.dragMoveTo(t),
      end: () => this.dragEnd()
    }), this.applySceneEditState(), this.applyUnderlay(), this.setTool("wall");
  }
  stop() {
    this.cancelChain(), this.sm.setUnderlay(null), this.measureLabel && (this.sm.scene.remove(this.measureLabel.sprite), this.measureLabel.dispose(), this.measureLabel = void 0), this.sm.setGroundHandler(void 0), this.sm.setDragHandler(void 0), this.sm.setEditMode(!1), this.sm.setDrawMode(!1);
  }
  setSnap(t) {
    this.snapEnabled = t, this.onChange?.();
  }
  /** Switch the floor being edited; keeps the scene's visible floor, grid
   *  elevation and edit target in lockstep. */
  setFloor(t) {
    t < 0 || t >= this.plan.floors.length || (this.cancelChain(), this.clearSelection(), this.floorIndex = t, this.sm.setActiveFloor(t), this.applySceneEditState(), this.applyUnderlay(), this.onChange?.());
  }
  addFloor() {
    const t = this.plan.floors[0]?.wallHeight ?? this.plan.wallHeight ?? 2.6;
    this.pushUndo();
    const e = Math.max(0, ...this.plan.floors.map((s) => s.elevation ?? 0)), n = this.plan.floors.length;
    this.plan.floors.push({
      name: `Floor ${n + 1}`,
      elevation: e + t + 0.4,
      wallHeight: t,
      walls: [],
      rooms: [],
      furniture: [],
      bindings: []
    }), this.sm.loadPlan(this.plan, !0), this.setFloor(n), this.onMessage?.(`Added "${this.plan.floors[n].name}" — draw it`);
  }
  deleteFloor() {
    if (this.plan.floors.length <= 1) {
      this.onMessage?.("Cannot delete the only floor");
      return;
    }
    this.pushUndo(), this.plan.floors.splice(this.floorIndex, 1);
    const t = Math.min(this.floorIndex, this.plan.floors.length - 1);
    this.clearSelection(), this.floorIndex = t, this.sm.loadPlan(this.plan, !1), this.setFloor(t);
  }
  // -- Drag to move (furniture) / reshape (wall endpoints) --------------------
  dragStart(t) {
    if (this.tool !== "select") return !1;
    if (this.dragSnapshot = JSON.stringify(this.plan), this.selectedKind === "room") {
      const o = this.sm.pickGizmo(t);
      if (o) return this.beginGizmo(o, t);
    }
    const e = this.sm.pickFurniture(t);
    if (e)
      return this.selectFurniture(e.id), this.beginFurnitureMove(t);
    const n = this.sm.pickOpening(t);
    if (n)
      return this.selectOpening(n.wallIndex, n.openingIndex), !1;
    const s = this.sm.pickRoom(t);
    if (s && xn(this.floor().rooms?.[s.index] ?? {}))
      return this.selectRoom(s.index), this.beginGizmo("move", t);
    const r = this.sm.groundIntersect(t);
    if (r) {
      const o = this.nearestEndpoint(r.x, r.z, 0.45);
      if (o) {
        this.dragMode = "endpoint", this.dragVertex = o;
        const c = (this.floor().walls ?? []).findIndex(
          (h) => ji(h.start, o) || ji(h.end, o)
        );
        return c >= 0 && this.selectWall(c), !0;
      }
      const a = this.sm.pickWall(t), l = a ? this.floor().walls?.[a.index] : null;
      if (a && l)
        return this.selectWall(a.index), this.dragMode = "wallmove", this.gizmoGrab = [r.x, r.z], this.wallDrag0 = { s: [l.start[0], l.start[1]], e: [l.end[0], l.end[1]] }, !0;
      if (this.isMovableSelected()) return this.beginMoveSelected(t, r);
    }
    return !1;
  }
  beginFurnitureMove(t) {
    const e = this.sm.groundIntersect(t), n = this.selectedId ? this.floor().furniture?.find((s) => s.id === this.selectedId) : null;
    return !e || !n ? !1 : (this.dragMode = "furniture", this.gizmoGrab = [e.x, e.z], this.furnDrag0 = [n.position[0], n.position[2]], !0);
  }
  beginMoveSelected(t, e) {
    if (this.selectedKind === "furniture") return this.beginFurnitureMove(t);
    if (this.selectedKind === "room") return this.beginGizmo("move", t);
    if (this.selectedKind === "wall" && this.selectedWall >= 0) {
      const n = this.floor().walls?.[this.selectedWall];
      if (n)
        return this.dragMode = "wallmove", this.gizmoGrab = [e.x, e.z], this.wallDrag0 = { s: [n.start[0], n.start[1]], e: [n.end[0], n.end[1]] }, !0;
    }
    return !1;
  }
  dragMoveTo(t) {
    if (this.dragMode === "gizmo")
      this.gizmoMoveTo(t);
    else if (this.dragMode === "furniture" && this.selectedId) {
      const e = this.sm.getFurnitureObject(this.selectedId);
      e && (e.position.x = Te(this.furnDrag0[0] + (t.x - this.gizmoGrab[0])), e.position.z = Te(this.furnDrag0[1] + (t.z - this.gizmoGrab[1])), this.sm.refreshSelection());
    } else if (this.dragMode === "endpoint" && this.dragVertex) {
      const e = [Te(t.x), Te(t.z)];
      if (ji(e, this.dragVertex)) return;
      this.moveVertex(this.dragVertex, e), this.dragVertex = e, this.rebuild(), this.reselect();
    } else if (this.dragMode === "wallmove" && this.selectedWall >= 0 && this.wallDrag0) {
      const e = this.floor().walls?.[this.selectedWall];
      if (e) {
        const n = Te(t.x - this.gizmoGrab[0]), s = Te(t.z - this.gizmoGrab[1]);
        e.start = [this.wallDrag0.s[0] + n, this.wallDrag0.s[1] + s], e.end = [this.wallDrag0.e[0] + n, this.wallDrag0.e[1] + s], this.rebuild(), this.reselect();
      }
    }
  }
  dragEnd() {
    if (this.dragMode === "furniture" && this.selectedId) {
      const t = this.sm.getFurnitureObject(this.selectedId), e = this.floor().furniture?.find((n) => n.id === this.selectedId);
      if (t && e)
        if (Qh(e.model)) {
          const n = this.nearestWallPoint(t.position.x, t.position.z);
          if (n) {
            const s = this.resolveWallMount(e.model, n);
            e.position = [s.x, e.position[1], s.z], e.rotation = s.rotation, this.rebuild(), this.reselect();
          } else
            e.position = [t.position.x, e.position[1], t.position.z];
        } else
          e.position = [t.position.x, e.position[1], t.position.z];
    }
    this.dragMode = null, this.dragVertex = null, this.gizmoHandle = null, this.wallDrag0 = null, this.dragSnapshot && this.dragSnapshot !== JSON.stringify(this.plan) && (this.undoStack.push(this.dragSnapshot), this.undoStack.length > this.HISTORY_MAX && this.undoStack.shift(), this.redoStack = []), this.dragSnapshot = null, this.onChange?.();
  }
  nearestEndpoint(t, e, n) {
    let s = null, r = n;
    for (const o of this.floor().walls ?? [])
      for (const a of [o.start, o.end]) {
        const l = Math.hypot(t - a[0], e - a[1]);
        l < r && (r = l, s = [a[0], a[1]]);
      }
    return s;
  }
  /** Move a shared vertex: all walls + room polygon points at `from` go to `to`. */
  moveVertex(t, e) {
    for (const n of this.floor().walls ?? [])
      ji(n.start, t) && (n.start = [e[0], e[1]]), ji(n.end, t) && (n.end = [e[0], e[1]]);
    for (const n of this.floor().rooms ?? [])
      n.polygon = n.polygon.map(
        (s) => ji(s, t) ? [e[0], e[1]] : s
      );
  }
  // -- Wall length ------------------------------------------------------------
  get selectedWallLength() {
    if (this.selectedKind !== "wall") return null;
    const t = this.floor().walls?.[this.selectedWall];
    return t ? Math.hypot(t.end[0] - t.start[0], t.end[1] - t.start[1]) : null;
  }
  /** Openings (doors/windows) on the selected wall — for the property list. */
  get selectedWallOpenings() {
    return this.selectedKind !== "wall" ? [] : (this.floor().walls?.[this.selectedWall]?.openings ?? []).map((t) => ({
      kind: t.kind,
      position: t.position,
      width: t.width
    }));
  }
  /** Delete one opening from the selected wall (doors/windows have no 3D click
   *  target, so they're removed from the wall's opening list). */
  deleteWallOpening(t) {
    if (this.selectedKind !== "wall") return;
    const e = this.floor().walls?.[this.selectedWall];
    e?.openings && (this.pushUndo(), e.openings.splice(t, 1), this.rebuild(), this.reselect(), this.onChange?.());
  }
  /** Openings on the selected shape room (for the property list). */
  get selectedRoomOpenings() {
    return this.selectedKind !== "room" ? [] : (this.currentRoom()?.openings ?? []).map((t) => ({
      kind: t.kind,
      position: t.position,
      width: t.width
    }));
  }
  deleteRoomOpening(t) {
    const e = this.currentRoom();
    e?.openings && (this.pushUndo(), e.openings.splice(t, 1), this.rebuild(), this.reselect(), this.onChange?.());
  }
  /** Set the selected wall's length, moving its END along the wall direction. */
  setWallLength(t) {
    if (this.selectedKind !== "wall" || !(t > 0)) return;
    const e = this.floor().walls?.[this.selectedWall];
    if (!e) return;
    this.pushUndo();
    const n = e.end[0] - e.start[0], s = e.end[1] - e.start[1], r = Math.hypot(n, s) || 1;
    e.end = [e.start[0] + n / r * t, e.start[1] + s / r * t], this.rebuild(), this.reselect(), this.onChange?.();
  }
  setTool(t) {
    this.chain.length && t !== this.tool && this.finishChain(), this.tool = t, t !== "select" && this.clearSelection(), this.applyReserve(), this.onChange?.();
  }
  floor() {
    return this.plan.floors[this.floorIndex];
  }
  get selectedEntity() {
    return this.selectedKind !== "furniture" || !this.selectedId ? null : this.floor().bindings?.find((e) => e.anchor_object === this.selectedId)?.entity_id ?? null;
  }
  /** Model key of the currently selected furniture (for domain-filtered binding). */
  get selectedObjectModel() {
    return this.selectedKind !== "furniture" || !this.selectedId ? null : this.floor().furniture?.find((e) => e.id === this.selectedId)?.model ?? null;
  }
  /** Current color of the selected furniture / wall / room (for the color picker). */
  get selectedColor() {
    const t = this.floor();
    return this.selectedKind === "furniture" ? t.furniture?.find((e) => e.id === this.selectedId)?.color ?? null : this.selectedKind === "wall" ? t.walls?.[this.selectedWall]?.color ?? null : this.selectedKind === "room" ? t.rooms?.[this.selectedRoom]?.color ?? null : null;
  }
  // -- Furniture / selection --------------------------------------------------
  placeFurniture(t) {
    const e = this.floor();
    if (ld[this.selectedModel] && this.placeGlazing(t, this.selectedModel)) return;
    this.pushUndo(), e.furniture || (e.furniture = []);
    const n = e.wallHeight ?? this.plan.wallHeight ?? 2.6, s = `f${e.furniture.length}_${Math.floor(performance.now() % 1e5)}`;
    let r = Te(t.x), o = Te(t.z), a = 0;
    if (Qh(this.selectedModel)) {
      const l = this.nearestWallPoint(t.x, t.z);
      if (l) {
        const c = this.resolveWallMount(this.selectedModel, l);
        r = c.x, o = c.z, a = c.rotation;
      }
    }
    e.furniture.push({
      model: this.selectedModel,
      position: [r, qy(this.selectedModel, n), o],
      rotation: a,
      id: s
    }), this.rebuild(), this.selectFurniture(s);
  }
  /** Cut a window/door opening into the nearest wall for a glazing furniture
   *  model. Returns false if no wall is close enough (then place as furniture). */
  placeGlazing(t, e) {
    const n = ld[e];
    if (!n) return !1;
    const s = this.floor().walls ?? [];
    let r = null, o = 0.9;
    for (let h = 0; h < s.length; h++) {
      const d = s[h], u = d.start[0], f = d.start[1], g = d.end[0], v = d.end[1], p = g - u, m = v - f, x = p * p + m * m;
      if (x < 1e-6) continue;
      let _ = ((t.x - u) * p + (t.z - f) * m) / x;
      _ = Math.max(0, Math.min(1, _));
      const M = u + p * _, L = f + m * _, T = Math.hypot(t.x - M, t.z - L);
      T < o && (o = T, r = { i: h, along: _ * Math.sqrt(x), len: Math.sqrt(x) });
    }
    if (!r) return !1;
    const a = Math.min(n.width, Math.max(0.4, r.len - 0.1)), l = Math.max(0, Math.min(r.len - a, r.along - a / 2));
    this.pushUndo();
    const c = s[r.i];
    return (c.openings ??= []).push({
      kind: n.kind,
      position: l,
      width: a,
      variant: n.variant,
      ...n.sill !== void 0 ? { sill: n.sill } : {},
      ...n.top !== void 0 ? { top: n.top } : {}
    }), this.rebuild(), this.selectOpening(r.i, c.openings.length - 1), this.onMessage?.(`${n.kind === "door" ? "Glass door" : "Window"} cut into wall`), !0;
  }
  /** Nearest point on any wall / shape-room edge, with orientation + normal/side
   *  (which face of the wall the tapped point is on), for snapping wall-mounted
   *  furniture. */
  nearestWallPoint(t, e) {
    let n = 1.2, s = null;
    const r = this.floor(), o = (a, l, c, h, d) => {
      const u = c - a, f = h - l, g = u * u + f * f;
      if (g < 1e-6) return;
      let v = ((t - a) * u + (e - l) * f) / g;
      v = Math.max(0, Math.min(1, v));
      const p = a + u * v, m = l + f * v, x = Math.hypot(t - p, e - m);
      if (x < n) {
        n = x;
        const _ = Math.sqrt(g);
        let M = -f / _, L = u / _;
        (t - p) * M + (e - m) * L < 0 && (M = -M, L = -L), s = { x: p, z: m, rotation: -Math.atan2(f, u) * 180 / Math.PI, nx: M, nz: L, thickness: d };
      }
    };
    for (const a of r.walls ?? [])
      o(a.start[0], a.start[1], a.end[0], a.end[1], a.thickness ?? 0.12);
    for (const a of r.rooms ?? []) {
      if (!xn(a)) continue;
      const l = Qn(a), c = a.thickness ?? 0.12;
      for (let h = 0; h < l.length; h++) {
        const d = l[h], u = l[(h + 1) % l.length];
        o(d[0], d[1], u[0], u[1], c);
      }
    }
    return s;
  }
  /** Resolve final position + rotation for a wall-mounted piece. Surface-mount
   *  items (TV, painting…) are pushed onto the room-side face and turned to face
   *  the room; doors/windows/curtains stay in the wall plane. */
  resolveWallMount(t, e) {
    if (!jy(t)) return { x: e.x, z: e.z, rotation: e.rotation };
    const n = e.thickness / 2 + 0.04, s = e.x + e.nx * n, r = e.z + e.nz * n, o = Math.atan2(e.nx, e.nz) * 180 / Math.PI;
    return { x: s, z: r, rotation: o };
  }
  selectFurniture(t) {
    this.selectedKind = t ? "furniture" : null, this.selectedId = t, this.selectedWall = -1, this.selectedRoom = -1, this.sm.setSelection(t ? this.sm.getFurnitureObject(t) ?? null : null), this.applyReserve(), this.onChange?.();
  }
  selectWall(t) {
    this.selectedKind = "wall", this.selectedWall = t, this.selectedId = null, this.selectedRoom = -1, this.sm.setSelection(this.sm.getWallObject(t) ?? null), this.applyReserve(), this.onChange?.();
  }
  selectRoom(t) {
    this.selectedKind = "room", this.selectedRoom = t, this.selectedId = null, this.selectedWall = -1, this.sm.setSelection(this.sm.getRoomObject(t) ?? null), this.buildGizmo(), this.applyReserve(), this.onChange?.();
  }
  /** Select a door/window opening directly (picked from its leaf/glass). */
  selectOpening(t, e) {
    this.selectedKind = "opening", this.selectedOpeningWall = t, this.selectedOpeningIndex = e, this.selectedId = null, this.selectedWall = -1, this.selectedRoom = -1, this.sm.setSelection(this.sm.getWallObject(t) ?? null), this.applyReserve(), this.onChange?.();
  }
  /** The currently-selected opening's definition (or null). */
  get selectedOpeningData() {
    return this.selectedKind !== "opening" ? null : this.floor().walls?.[this.selectedOpeningWall]?.openings?.[this.selectedOpeningIndex] ?? null;
  }
  get selectedOpeningKind() {
    return this.selectedOpeningData?.kind ?? null;
  }
  get selectedOpeningVariant() {
    return this.selectedOpeningData?.variant ?? "single";
  }
  get selectedOpeningWidth() {
    return this.selectedOpeningData?.width ?? null;
  }
  setOpeningVariant(t) {
    const e = this.selectedOpeningData;
    e && (this.pushUndo(), e.variant = t, this.rebuild(), this.reselect(), this.onChange?.());
  }
  /** Swap a selected opening between door / window / opening. */
  setOpeningKind(t) {
    const e = this.selectedOpeningData;
    e && (this.pushUndo(), e.kind = t, e.bare = t === "opening" ? !0 : void 0, delete e.sill, delete e.top, this.rebuild(), this.reselect(), this.onChange?.());
  }
  setOpeningWidth(t) {
    const e = this.selectedOpeningData;
    if (!e || !(t > 0)) return;
    const n = this.floor().walls?.[this.selectedOpeningWall];
    if (!n) return;
    const s = Math.hypot(n.end[0] - n.start[0], n.end[1] - n.start[1]);
    this.pushUndo(), e.width = Math.min(t, Math.max(0.3, s - e.position)), this.rebuild(), this.reselect(), this.onChange?.();
  }
  deleteSelectedOpening() {
    if (this.selectedKind !== "opening") return;
    const t = this.floor().walls?.[this.selectedOpeningWall];
    t?.openings && (this.pushUndo(), t.openings.splice(this.selectedOpeningIndex, 1), this.clearSelection(), this.rebuild(), this.onChange?.());
  }
  clearSelection() {
    this.selectedKind = null, this.selectedId = null, this.selectedWall = -1, this.selectedRoom = -1, this.selectedOpeningWall = -1, this.selectedOpeningIndex = -1, this.sm.setSelection(null), this.sm.clearGizmo(), this.applyReserve(), this.onChange?.();
  }
  /** A movable selection reserves left/one-finger for dragging (camera off). */
  isMovableSelected() {
    if (this.selectedKind === "furniture" || this.selectedKind === "wall") return !0;
    if (this.selectedKind === "room") {
      const t = this.currentRoom();
      return !!t && xn(t);
    }
    return !1;
  }
  applyReserve() {
    this.sm.setLeftReserved(this.isMovableSelected());
  }
  /** Re-apply the selection highlight after a rebuild (object instances change). */
  reselect() {
    this.selectedKind === "furniture" && this.selectedId ? this.sm.setSelection(this.sm.getFurnitureObject(this.selectedId) ?? null) : this.selectedKind === "wall" && this.selectedWall >= 0 ? this.sm.setSelection(this.sm.getWallObject(this.selectedWall) ?? null) : this.selectedKind === "room" && this.selectedRoom >= 0 ? (this.sm.setSelection(this.sm.getRoomObject(this.selectedRoom) ?? null), this.buildGizmo()) : this.selectedKind === "opening" && this.selectedOpeningWall >= 0 && this.sm.setSelection(this.sm.getWallObject(this.selectedOpeningWall) ?? null);
  }
  // -- Building Mode: shape rooms + Position Helper gizmo ----------------------
  currentRoom() {
    return this.selectedKind !== "room" ? null : this.floor().rooms?.[this.selectedRoom] ?? null;
  }
  get selectedRoomData() {
    return this.currentRoom();
  }
  /** Drop a parametric room shape at the camera target and select it. */
  addRoomShape(t) {
    const e = this.floor();
    this.pushUndo(), e.rooms || (e.rooms = []);
    const n = this.sm.controls.target, s = {
      id: `r${e.rooms.length}_${Math.floor(performance.now() % 1e5)}`,
      name: `Room ${e.rooms.length + 1}`,
      shape: t,
      x: Te(n.x),
      z: Te(n.z),
      width: 4,
      depth: 3,
      rotation: 0,
      polygon: []
    };
    e.rooms.push(s), this.rebuild(), this.selectRoom(e.rooms.length - 1), this.setTool("select"), this.onChange?.();
  }
  setRoomField(t, e) {
    const n = this.currentRoom();
    if (n) {
      if (this.pushUndo(), t === "name") n.name = String(e);
      else {
        const s = Number(e);
        if (Number.isNaN(s)) return;
        t === "width" ? n.width = Math.max(0.5, s) : t === "depth" ? n.depth = Math.max(0.5, s) : t === "height" ? n.height = Math.max(1, s) : t === "rotation" && (n.rotation = s);
      }
      this.rebuild(), this.reselect(), this.onChange?.();
    }
  }
  buildGizmo() {
    this.sm.clearGizmo();
    const t = this.currentRoom();
    if (!t || !xn(t)) return;
    const e = this.sm.gizmoGroup, n = this.elevation() + 0.08, s = t.x ?? 0, r = t.z ?? 0, o = t.rotation ?? 0, a = (c, h, d, u, f = !0) => {
      const g = new ge(c, new en({ color: h, depthTest: !1 }));
      f && (g.rotation.x = -Math.PI / 2), g.position.set(d[0], n, d[1]), g.renderOrder = 1e3, g.userData.gizmoHandle = u, e.add(g);
    };
    a(new Vl(0.28, 24), 4891647, [s, r], "move");
    const l = Kr(0, -((t.depth ?? 3) / 2 + 0.7), o);
    a(new go(0.2, 0.05, 8, 20), 5230698, [s + l[0], r + l[1]], "rotate"), t.shape === "rect" && Qn(t).forEach((c, h) => {
      const d = new ge(
        new ir(0.16, 12, 12),
        new en({ color: 16763972, depthTest: !1 })
      );
      d.position.set(c[0], n, c[1]), d.renderOrder = 1e3, d.userData.gizmoHandle = `corner${h}`, e.add(d);
    });
  }
  beginGizmo(t, e) {
    const n = this.currentRoom(), s = this.sm.groundIntersect(e);
    return !n || !s ? !1 : (this.dragMode = "gizmo", this.gizmoHandle = t, this.gizmoGrab = [s.x, s.z], this.gizmoRoom0 = {
      x: n.x ?? 0,
      z: n.z ?? 0,
      width: n.width ?? 3,
      depth: n.depth ?? 3,
      rotation: n.rotation ?? 0
    }, !0);
  }
  gizmoMoveTo(t) {
    const e = this.currentRoom();
    if (!e || !this.gizmoHandle) return;
    const n = this.gizmoRoom0, s = this.gizmoHandle;
    if (s === "move")
      e.x = Te(n.x + (t.x - this.gizmoGrab[0])), e.z = Te(n.z + (t.z - this.gizmoGrab[1])), this.shiftHeld || this.snapRoom(e);
    else if (s === "rotate") {
      let r = Math.atan2(t.z - (e.z ?? 0), t.x - (e.x ?? 0)) * 180 / Math.PI + 90;
      this.shiftHeld || (r = Math.round(r / 15) * 15), e.rotation = r;
    } else if (s.startsWith("corner") && e.shape === "rect") {
      const r = parseInt(s.slice(6), 10), o = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1]
      ], [a, l] = o[r] ?? [1, 1], c = [-a * n.width / 2, -l * n.depth / 2], h = Kr(c[0], c[1], n.rotation), d = n.x + h[0], u = n.z + h[1], f = Kr(t.x - n.x, t.z - n.z, -n.rotation), g = Math.max(0.5, Te(Math.abs(f[0] - -a * n.width / 2))), v = Math.max(0.5, Te(Math.abs(f[1] - -l * n.depth / 2))), p = Kr(a * g, l * v, n.rotation);
      e.width = g, e.depth = v, e.x = Te(d + p[0] / 2), e.z = Te(u + p[1] / 2);
    }
    this.rebuild(), this.reselect(), this.onChange?.();
  }
  /** Snap an axis-aligned room's edges to nearby axis-aligned rooms. */
  snapRoom(t) {
    if (Math.abs((t.rotation ?? 0) % 360) > 1) return;
    const e = 0.35, n = t.width ?? 3, s = t.depth ?? 3;
    let r = (t.x ?? 0) - n / 2, o = (t.z ?? 0) - s / 2;
    const a = (this.floor().rooms ?? []).filter(
      (u) => u !== t && xn(u) && Math.abs((u.rotation ?? 0) % 360) <= 1
    );
    let l = 0, c = e, h = 0, d = e;
    for (const u of a) {
      const f = u.width ?? 3, g = u.depth ?? 3, v = (u.x ?? 0) - f / 2, p = (u.x ?? 0) + f / 2, m = (u.z ?? 0) - g / 2, x = (u.z ?? 0) + g / 2;
      for (const _ of [r, r + n])
        for (const M of [v, p]) {
          const L = M - _;
          Math.abs(L) < c && (c = Math.abs(L), l = L);
        }
      for (const _ of [o, o + s])
        for (const M of [m, x]) {
          const L = M - _;
          Math.abs(L) < d && (d = Math.abs(L), h = L);
        }
    }
    t.x = (t.x ?? 0) + l, t.z = (t.z ?? 0) + h;
  }
  rotateSelected() {
    if (this.selectedKind !== "furniture") return;
    const t = this.floor().furniture?.find((e) => e.id === this.selectedId);
    t && (this.pushUndo(), t.rotation = ((t.rotation ?? 0) + 45) % 360, this.rebuild(), this.reselect(), this.onChange?.());
  }
  /** Move the selected furniture up/down along the vertical axis. */
  nudgeHeight(t) {
    if (this.selectedKind !== "furniture") return;
    const e = this.floor().furniture?.find((n) => n.id === this.selectedId);
    e && (this.pushUndo(), e.position[1] = Math.max(0, Math.round((e.position[1] + t) * 100) / 100), this.rebuild(), this.reselect(), this.onChange?.());
  }
  /** Current per-axis scale of the selected furniture (defaults to 1,1,1). */
  get selectedFurnitureScale() {
    if (this.selectedKind !== "furniture") return null;
    const t = this.floor().furniture?.find((n) => n.id === this.selectedId);
    if (!t) return null;
    const e = t.scale ?? 1;
    return Array.isArray(e) ? e : [e, e, e];
  }
  /** Resize the selected furniture along one axis (0=x width, 1=y height, 2=z depth). */
  setFurnitureScale(t, e) {
    if (this.selectedKind !== "furniture" || !(e > 0)) return;
    const n = this.floor().furniture?.find((o) => o.id === this.selectedId);
    if (!n) return;
    this.pushUndo();
    const s = n.scale ?? 1, r = Array.isArray(s) ? [s[0], s[1], s[2]] : [s, s, s];
    r[t] = Math.max(0.1, Math.round(e * 100) / 100), n.scale = r, this.rebuild(), this.reselect(), this.onChange?.();
  }
  /** Whether the selected furniture is a light fixture (brightness applies). */
  get selectedIsLight() {
    if (this.selectedKind !== "furniture" || !this.selectedId) return !1;
    const t = this.floor().furniture?.find((e) => e.id === this.selectedId);
    return !!t && _o.includes(t.model);
  }
  get selectedBrightness() {
    return this.selectedKind !== "furniture" || !this.selectedId ? 0 : this.floor().furniture?.find((e) => e.id === this.selectedId)?.brightness ?? 0;
  }
  /** Manually set the selected light's glow level (0..1). */
  setBrightness(t) {
    if (this.selectedKind !== "furniture" || !this.selectedId) return;
    const e = this.floor().furniture?.find((n) => n.id === this.selectedId);
    e && (this.pushUndo(), e.brightness = Math.max(0, Math.min(1, t)), this.rebuild(), this.reselect(), this.onChange?.());
  }
  /** Surface material preset for the selected wall (or floor of a room). */
  setSurfaceMaterial(t) {
    const e = this.floor();
    if (this.pushUndo(), this.selectedKind === "wall" && e.walls?.[this.selectedWall])
      e.walls[this.selectedWall].material = t;
    else if (this.selectedKind === "room" && e.rooms?.[this.selectedRoom])
      e.rooms[this.selectedRoom].material = t;
    else
      return;
    this.rebuild(), this.reselect(), this.onChange?.();
  }
  get selectedMaterial() {
    const t = this.floor();
    return this.selectedKind === "wall" ? t.walls?.[this.selectedWall]?.material ?? "plain" : this.selectedKind === "room" ? t.rooms?.[this.selectedRoom]?.material ?? "plain" : "plain";
  }
  /** Set the color of the selected furniture / wall / room. */
  setColor(t) {
    const e = this.floor();
    if (this.pushUndo(), this.selectedKind === "furniture") {
      const n = e.furniture?.find((s) => s.id === this.selectedId);
      n && (n.color = t);
    } else if (this.selectedKind === "wall" && e.walls?.[this.selectedWall])
      e.walls[this.selectedWall].color = t;
    else if (this.selectedKind === "room" && e.rooms?.[this.selectedRoom])
      e.rooms[this.selectedRoom].color = t;
    else
      return;
    this.rebuild(), this.reselect(), this.onChange?.();
  }
  deleteSelected() {
    const t = this.floor();
    if (this.selectedKind) {
      if (this.selectedKind === "opening") {
        this.deleteSelectedOpening();
        return;
      }
      if (this.pushUndo(), this.selectedKind === "furniture" && this.selectedId) {
        const e = t.furniture?.find((n) => n.id === this.selectedId);
        if (e?.attach) {
          const n = e.attach, s = n.kind === "wall" ? t.walls?.[n.index]?.openings : t.rooms?.[n.index]?.openings;
          s && n.opening < s.length && s.splice(n.opening, 1);
        }
        t.furniture = (t.furniture ?? []).filter((n) => n.id !== this.selectedId), t.bindings = (t.bindings ?? []).filter((n) => n.anchor_object !== this.selectedId);
      } else if (this.selectedKind === "wall" && this.selectedWall >= 0)
        t.walls?.splice(this.selectedWall, 1);
      else if (this.selectedKind === "room" && this.selectedRoom >= 0)
        t.rooms?.splice(this.selectedRoom, 1);
      else
        return;
      this.clearSelection(), this.rebuild();
    }
  }
  bindEntity(t) {
    if (this.selectedKind !== "furniture" || !this.selectedId) return;
    const e = this.floor();
    e.bindings || (e.bindings = []), e.bindings = e.bindings.filter((n) => n.anchor_object !== this.selectedId), t && e.bindings.push({ entity_id: t, anchor_object: this.selectedId, behavior: "auto" }), this.rebuild(), this.reselect(), this.onChange?.();
  }
  elevation() {
    return this.plan.floors[this.floorIndex]?.elevation ?? 0;
  }
  wallHeight() {
    return this.plan.floors[this.floorIndex]?.wallHeight ?? this.plan.wallHeight ?? 2.6;
  }
  applySceneEditState() {
    this.sm.setEditMode(!0, this.elevation()), this.sm.setGroundHandler({
      click: (t, e) => this.onClick(t, e),
      move: (t) => this.onMove(t)
    }), this.applyReserve();
  }
  onClick(t, e) {
    if (this.calibrating) {
      if (this.calibPts.push([t.x, t.z]), this.calibPts.length >= 2) {
        const a = this.calibPts[0], l = this.calibPts[1], c = Math.hypot(l[0] - a[0], l[1] - a[1]);
        this.calibrating = !1, this.calibPts = [], this.onCalibrate?.(c);
      } else
        this.onMessage?.("Now tap the second point");
      return;
    }
    if (this.tool === "furniture") {
      this.placeFurniture(t);
      return;
    }
    if (this.tool === "door" || this.tool === "window" || this.tool === "opening") {
      this.addOpening(t, this.tool);
      return;
    }
    if (this.tool === "select") {
      const a = e ? this.sm.pickFurniture(e) : null;
      if (a) {
        this.selectFurniture(a.id);
        return;
      }
      const l = e ? this.sm.pickOpening(e) : null;
      if (l) {
        this.selectOpening(l.wallIndex, l.openingIndex);
        return;
      }
      const c = e ? this.sm.pickWall(e) : null;
      if (c) {
        this.selectWall(c.index);
        return;
      }
      const h = e ? this.sm.pickRoom(e) : null;
      h ? this.selectRoom(h.index) : this.clearSelection();
      return;
    }
    if (this.tool !== "wall" && this.tool !== "floor") return;
    const n = this.tool === "floor", { pt: s } = this.snapPoint(t.x, t.z);
    if (this.chain.length === 0) {
      this.chain = [s], this.renderPreview(), this.onChange?.();
      return;
    }
    const r = this.chain[0], o = this.chain[this.chain.length - 1];
    if (o[0] === s[0] && o[1] === s[1]) {
      n ? this.commitFloorChain() : this.commitChain(!1);
      return;
    }
    if (this.chain.length >= 2 && Math.hypot(s[0] - r[0], s[1] - r[1]) < 0.25) {
      n ? this.commitFloorChain() : this.commitChain(!0);
      return;
    }
    this.chain.push(s), this.renderPreview(), this.onChange?.();
  }
  /** Commit the in-progress chain as a floor polygon only (no walls). */
  commitFloorChain() {
    const t = this.chain;
    if (t.length < 3) {
      this.cancelChain(), this.onMessage?.("Tap at least 3 corners for a floor");
      return;
    }
    this.pushUndo();
    const e = this.floor();
    e.rooms || (e.rooms = []), e.rooms.push({ polygon: t.map((n) => [n[0], n[1]]), color: "#c9c4bb" }), this.cancelChain(), this.rebuild(), this.onChange?.(), this.onMessage?.("Floor added");
  }
  /** Commit the in-progress wall chain. When `close`, also add the closing wall
   *  back to the start and fill the loop with a floor (room). */
  commitChain(t) {
    const e = this.chain;
    if (e.length < 2) {
      this.cancelChain();
      return;
    }
    this.pushUndo();
    const n = this.floor();
    n.walls || (n.walls = []);
    for (let r = 0; r < e.length - 1; r++)
      n.walls.push({ start: [e[r][0], e[r][1]], end: [e[r + 1][0], e[r + 1][1]] });
    if (t) {
      const r = e[e.length - 1], o = e[0];
      n.walls.push({ start: [r[0], r[1]], end: [o[0], o[1]] }), n.rooms || (n.rooms = []), n.rooms.push({ polygon: e.map((a) => [a[0], a[1]]), color: "#c9c4bb" });
    }
    const s = e.length - 1 + (t ? 1 : 0);
    this.cancelChain(), this.rebuild(), this.onChange?.(), this.onMessage?.(t ? "Room closed — floor added" : `${s} wall${s === 1 ? "" : "s"} added`);
  }
  onMove(t) {
    if (this.tool !== "wall" && this.tool !== "floor" || this.chain.length === 0) return;
    const e = this.snapPoint(t.x, t.z);
    this.cursor = e.pt, this.snapInfo = e, this.renderPreview();
  }
  /**
   * Snap a candidate point with drawing aids, in priority:
   *  1) join — onto a nearby existing endpoint / chain vertex,
   *  2) angle — snap the segment direction to 15° steps (parallel / perpendicular),
   *  3) length — match a nearby existing wall's length (equal-length walls),
   * plus first-point axis alignment. Disabled when snapEnabled is false (free grid).
   */
  snapPoint(t, e) {
    const n = this.chain[this.chain.length - 1], s = (x, _) => Math.atan2(_[1] - x[1], _[0] - x[0]) * 180 / Math.PI, r = (x, _ = {}) => ({
      pt: x,
      joined: !1,
      matchedLen: !1,
      parallel: !1,
      lengthM: n ? Math.hypot(x[0] - n[0], x[1] - n[1]) : 0,
      angleDeg: n ? s(n, x) : 0,
      ..._
    });
    let o = null, a = DM;
    for (const x of [...this.existingEndpoints(), ...this.chain]) {
      const _ = Math.hypot(t - x[0], e - x[1]);
      _ < a && (a = _, o = x);
    }
    if (o) return r([o[0], o[1]], { joined: !0 });
    if (!this.snapEnabled) return r([Te(t), Te(e)]);
    if (!n) {
      let x = Te(t), _ = Te(e);
      for (const M of this.existingEndpoints())
        Math.abs(t - M[0]) < hd && (x = M[0]), Math.abs(e - M[1]) < hd && (_ = M[1]);
      return r([x, _]);
    }
    const l = t - n[0], c = e - n[1], h = Math.hypot(l, c);
    if (h < 1e-4) return r([n[0], n[1]]);
    const d = Math.round(Math.atan2(c, l) / cd) * cd;
    let u = Math.round(h / xo) * xo, f = !1, g = NM;
    for (const x of this.floor().walls ?? []) {
      const _ = Math.hypot(x.end[0] - x.start[0], x.end[1] - x.start[1]);
      Math.abs(_ - h) < g && (g = Math.abs(_ - h), u = _, f = !0);
    }
    const v = [n[0] + Math.cos(d) * u, n[1] + Math.sin(d) * u], p = Math.atan2(v[1] - n[1], v[0] - n[0]), m = (this.floor().walls ?? []).some((x) => {
      const _ = Math.atan2(x.end[1] - x.start[1], x.end[0] - x.start[0]);
      let M = Math.abs(_ - p) % Math.PI;
      return M > Math.PI / 2 && (M = Math.PI - M), M < 0.03;
    });
    return r(v, { matchedLen: f, parallel: m });
  }
  existingEndpoints() {
    const t = [];
    for (const e of this.floor().walls ?? [])
      t.push([e.start[0], e.start[1]], [e.end[0], e.end[1]]);
    return t;
  }
  isConnection(t) {
    return this.existingEndpoints().some(
      (e) => Math.hypot(e[0] - t[0], e[1] - t[1]) < 1e-3
    );
  }
  /** Add a door/window opening to the wall nearest the tapped point. */
  addOpening(t, e) {
    const n = this.floor();
    this.pushUndo();
    const s = e === "door" ? 0.9 : e === "opening" ? 1.4 : 1, r = e === "opening";
    let o = 0.6, a = null;
    const l = (w, R, F, y, S) => {
      const N = F - w, k = y - R, G = N * N + k * k;
      if (G < 1e-6) return;
      let q = ((t.x - w) * N + (t.z - R) * k) / G;
      q = Math.max(0, Math.min(1, q));
      const W = w + N * q, et = R + k * q, $ = Math.hypot(t.x - W, t.z - et);
      if ($ < o) {
        o = $;
        const lt = Math.sqrt(G);
        a = S(q * lt, lt);
      }
    };
    for (const w of n.walls ?? [])
      l(w.start[0], w.start[1], w.end[0], w.end[1], (R, F) => ({
        type: "wall",
        wall: w,
        along: R,
        len: F
      }));
    for (const w of n.rooms ?? []) {
      if (!xn(w)) continue;
      const R = Qn(w);
      for (let F = 0; F < R.length; F++) {
        const y = R[F], S = R[(F + 1) % R.length], N = F;
        l(y[0], y[1], S[0], S[1], (k, G) => ({
          type: "room",
          room: w,
          edge: N,
          along: k,
          len: G
        }));
      }
    }
    if (!a) {
      this.onMessage?.("Tap closer to a wall (or room edge)");
      return;
    }
    const c = a, h = Math.max(0, Math.min(c.len - s, c.along - s / 2)), d = h + s / 2;
    let u;
    if (c.type === "wall")
      c.wall.openings || (c.wall.openings = []), c.wall.openings.push({ kind: e, position: h, width: s, ...r ? { bare: r } : {} }), u = [c.wall.start[0], c.wall.start[1], c.wall.end[0], c.wall.end[1]];
    else {
      c.room.openings || (c.room.openings = []), c.room.openings.push({ kind: e, edge: c.edge, position: h, width: s, ...r ? { bare: r } : {} });
      const w = Qn(c.room), R = w[c.edge], F = w[(c.edge + 1) % w.length];
      u = [R[0], R[1], F[0], F[1]];
    }
    const [f, g, v, p] = u, m = Math.hypot(v - f, p - g) || 1, x = f + (v - f) / m * d, _ = g + (p - g) / m * d, M = Math.atan2(p - g, v - f), L = (w, R, F, y) => {
      const S = F - w, N = y - R, k = S * S + N * N;
      if (k < 1e-6) return null;
      let G = Math.atan2(N, S);
      const q = Math.abs((G - M + Math.PI) % Math.PI);
      if (q > 0.03 && Math.abs(q - Math.PI) > 0.03) return null;
      const W = Math.sqrt(k), et = ((x - w) * S + (_ - R) * N) / k, $ = w + S * et, lt = R + N * et;
      if (Math.hypot(x - $, _ - lt) > 0.12) return null;
      const ct = et * W;
      return ct < 0 || ct > W ? null : Math.max(0, Math.min(W - s, ct - s / 2));
    };
    for (const w of n.walls ?? []) {
      if (c.type === "wall" && w === c.wall) continue;
      const R = L(w.start[0], w.start[1], w.end[0], w.end[1]);
      R != null && (w.openings ??= []).push({ kind: e, position: R, width: s, ...r ? { bare: r } : {} });
    }
    for (const w of n.rooms ?? []) {
      if (!xn(w)) continue;
      const R = Qn(w);
      for (let F = 0; F < R.length; F++) {
        if (c.type === "room" && w === c.room && F === c.edge) continue;
        const y = R[F], S = R[(F + 1) % R.length], N = L(y[0], y[1], S[0], S[1]);
        N != null && (w.openings ??= []).push({ kind: e, edge: F, position: N, width: s, ...r ? { bare: r } : {} });
      }
    }
    this.rebuild(), this.onChange?.();
    const T = e === "door" ? "Door" : e === "window" ? "Window" : "Opening";
    this.onMessage?.(`${T} added — select the wall to edit/delete it`);
  }
  /** Undo: remove the last committed wall of the current run (and its point). */
  undoPoint() {
    this.chain.length >= 1 ? (this.chain.pop(), this.chain.length === 0 ? this.cancelChain() : this.renderPreview()) : (this.floor().walls?.length ?? 0) > 0 && (this.pushUndo(), this.floor().walls.pop(), this.rebuild()), this.onChange?.();
  }
  /** Finish the current run: a floor polygon (floor tool) or an open wall run. */
  finishChain() {
    this.tool === "floor" ? this.commitFloorChain() : this.chain.length >= 2 ? this.commitChain(!1) : this.cancelChain();
  }
  cancelChain() {
    this.chain = [], this.cursor = null, this.snapInfo = null, this.measureLabel && (this.measureLabel.sprite.visible = !1), this.sm.clearPreview(), this.onChange?.();
  }
  /** Start a fresh blank plan to draw from scratch. */
  loadPlan(t) {
    this.plan = t, this.floorIndex = 0, this.cancelChain(), this.clearSelection(), this.sm.loadPlan(t, !1), this.applySceneEditState(), this.onChange?.();
  }
  rebuild() {
    this.sm.loadPlan(this.plan, !0), this.applySceneEditState(), this.applyUnderlay();
  }
  // -- Reference image underlay (tracing guide) -------------------------------
  /** Push the current floor's underlay into the scene (or clear it). */
  applyUnderlay() {
    this.sm.setUnderlay(this.floor().underlay ?? null, this.elevation());
  }
  get underlay() {
    return this.floor().underlay ?? null;
  }
  /** Set/replace the reference image for the current floor. */
  setUnderlayImage(t, e, n) {
    this.pushUndo();
    const s = this.floor(), r = this.sm.controls.target, o = s.underlay;
    s.underlay = {
      image: t,
      widthM: o?.widthM ?? 10,
      aspect: e > 0 ? n / e : 1,
      x: o?.x ?? Math.round(r.x * 100) / 100,
      z: o?.z ?? Math.round(r.z * 100) / 100,
      rotation: o?.rotation ?? 0,
      opacity: o?.opacity ?? 0.6
    }, this.applyUnderlay(), this.onChange?.(), this.onMessage?.("Reference image added — set its width (m), then trace walls");
  }
  setUnderlayField(t, e) {
    const n = this.floor();
    !n.underlay || Number.isNaN(e) || (this.pushUndo(), t === "widthM" ? n.underlay.widthM = Math.max(0.2, e) : t === "opacity" ? n.underlay.opacity = Math.max(0.05, Math.min(1, e)) : n.underlay[t] = e, this.applyUnderlay(), this.onChange?.());
  }
  nudgeUnderlay(t, e) {
    const n = this.floor();
    n.underlay && (this.pushUndo(), n.underlay.x = Math.round(((n.underlay.x ?? 0) + t) * 100) / 100, n.underlay.z = Math.round(((n.underlay.z ?? 0) + e) * 100) / 100, this.applyUnderlay(), this.onChange?.());
  }
  /** Begin two-point scale calibration (the next two ground taps). */
  startUnderlayCalibration() {
    if (!this.floor().underlay) {
      this.onMessage?.("Add a reference image first");
      return;
    }
    this.cancelChain(), this.calibrating = !0, this.calibPts = [], this.onMessage?.("Calibrate: tap two points a known distance apart on the image");
  }
  /** Apply a calibration: rescale the underlay so `measured` metres on screen
   *  equals the `real` metres the user entered. */
  applyUnderlayScale(t, e) {
    const n = this.floor();
    !n.underlay || !(t > 0) || !(e > 0) || (this.pushUndo(), n.underlay.widthM = Math.max(0.2, n.underlay.widthM * (e / t)), this.applyUnderlay(), this.onChange?.(), this.onMessage?.(`Scale set — ${e} m across those points`));
  }
  /** Saved reset-view distance multiplier for this project. */
  get cameraDistance() {
    return this.plan.cameraDistance ?? 1;
  }
  /** Set the default camera framing distance (persists with the project). */
  setCameraDistance(t) {
    t > 0 && (this.plan.cameraDistance = Math.round(t * 100) / 100, this.sm.setCameraDistance(t), this.sm.resetView(), this.onChange?.());
  }
  removeUnderlay() {
    const t = this.floor();
    t.underlay && (this.pushUndo(), delete t.underlay, this.applyUnderlay(), this.onChange?.(), this.onMessage?.("Reference image removed"));
  }
  // -- Undo / redo ------------------------------------------------------------
  /** Snapshot the plan before a mutating action. Call at the start of each edit. */
  pushUndo() {
    this.undoStack.push(JSON.stringify(this.plan)), this.undoStack.length > this.HISTORY_MAX && this.undoStack.shift(), this.redoStack = [];
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
  undo() {
    this.undoStack.length && (this.redoStack.push(JSON.stringify(this.plan)), this.plan = JSON.parse(this.undoStack.pop()), this.restoreHistory());
  }
  redo() {
    this.redoStack.length && (this.undoStack.push(JSON.stringify(this.plan)), this.plan = JSON.parse(this.redoStack.pop()), this.restoreHistory());
  }
  restoreHistory() {
    this.cancelChain(), this.clearSelection(), this.floorIndex >= this.plan.floors.length && (this.floorIndex = this.plan.floors.length - 1), this.sm.loadPlan(this.plan, !0), this.sm.setActiveFloor(this.floorIndex), this.applySceneEditState(), this.applyUnderlay(), this.onChange?.();
  }
  // -- Auto floors: fill every closed wall loop with a floor ------------------
  /** Detect the closed regions (faces) formed by the current floor's walls and
   *  add a floor (RoomDef polygon) to each enclosed area that doesn't already
   *  have one. Works for hand-traced walls that weren't closed via the start. */
  autoFloors() {
    const t = this.floor(), e = t.walls ?? [];
    if (e.length < 3) {
      this.onMessage?.("Draw or import some walls first");
      return;
    }
    const n = 0.2, s = [], r = /* @__PURE__ */ new Map(), o = (x) => {
      for (let _ = 0; _ < s.length; _++)
        if (Math.hypot(s[_][0] - x[0], s[_][1] - x[1]) <= n) return _;
      return s.push([x[0], x[1]]), r.set(s.length - 1, /* @__PURE__ */ new Set()), s.length - 1;
    }, a = [];
    for (const x of e) {
      const _ = o(x.start), M = o(x.end);
      _ !== M && (r.get(_).add(M), r.get(M).add(_), a.push([_, M]));
    }
    const l = (x, _) => Math.atan2(s[_][1] - s[x][1], s[_][0] - s[x][0]), c = Math.PI * 2, h = /* @__PURE__ */ new Set(), d = (x, _) => `${x}|${_}`, u = [];
    for (const [x, _] of a)
      for (const [M, L] of [[x, _], [_, x]]) {
        if (h.has(d(M, L))) continue;
        const T = [];
        let w = M, R = L, F = 0;
        do {
          h.add(d(w, R)), T.push(w);
          const y = l(R, w);
          let S = null, N = 1 / 0;
          for (const k of r.get(R)) {
            let G = y - l(R, k);
            G = (G % c + c) % c, G < 1e-9 && (G = c), G < N && (N = G, S = k);
          }
          if (S === null) break;
          w = R, R = S, F++;
        } while (!(w === M && R === L) && F < 1e5);
        T.length >= 3 && u.push(T.map((y) => s[y]));
      }
    const f = (x) => {
      let _ = 0;
      for (let M = 0; M < x.length; M++) {
        const L = x[M], T = x[(M + 1) % x.length];
        _ += L[0] * T[1] - T[0] * L[1];
      }
      return _ / 2;
    }, g = (x) => {
      let _ = 0, M = 0;
      for (const L of x)
        _ += L[0], M += L[1];
      return [_ / x.length, M / x.length];
    }, v = u.filter((x) => f(x) > 0.5);
    if (!v.length) {
      this.onMessage?.("No closed rooms found — make sure walls connect at corners");
      return;
    }
    const p = (t.rooms ?? []).map((x) => {
      const _ = xn(x) ? Qn(x) : x.polygon;
      return { c: g(_), a: Math.abs(f(_)) };
    });
    let m = 0;
    this.pushUndo(), t.rooms || (t.rooms = []);
    for (const x of v) {
      const _ = g(x), M = Math.abs(f(x));
      p.some(
        (T) => Math.hypot(T.c[0] - _[0], T.c[1] - _[1]) < 0.4 && Math.abs(T.a - M) / Math.max(T.a, M) < 0.2
      ) || (t.rooms.push({ polygon: x.map((T) => [Math.round(T[0] * 1e3) / 1e3, Math.round(T[1] * 1e3) / 1e3]), color: "#c9c4bb" }), p.push({ c: _, a: M }), m++);
    }
    this.rebuild(), this.onChange?.(), this.onMessage?.(m ? `Added ${m} floor${m === 1 ? "" : "s"}` : "All rooms already have floors");
  }
  // -- Wall cleanup: dedupe + merge collinear overlapping walls ---------------
  /** Merge duplicate / overlapping collinear walls on the current floor into
   *  single segments (so coincident walls don't block openings and corners are
   *  clean). Openings are preserved via world-coordinate remap. */
  mergeWalls() {
    const t = this.floor(), e = t.walls ?? [];
    if (e.length < 2) {
      this.onMessage?.("Nothing to merge");
      return;
    }
    this.pushUndo();
    const n = 0.08, s = e.map((a) => {
      const l = a.end[0] - a.start[0], c = a.end[1] - a.start[1];
      let h = Math.atan2(c, l);
      h < 0 && (h += Math.PI);
      const d = Math.cos(h), u = Math.sin(h), f = a.start[0] * d + a.start[1] * u, g = a.end[0] * d + a.end[1] * u, v = a.start[0] * -u + a.start[1] * d;
      return { w: a, ang: h, perp: v, t0: Math.min(f, g), t1: Math.max(f, g) };
    }), r = new Array(s.length).fill(!1), o = [];
    for (let a = 0; a < s.length; a++) {
      if (r[a]) continue;
      const l = [s[a]];
      r[a] = !0;
      for (let T = a + 1; T < s.length; T++) {
        if (r[T]) continue;
        const w = s[a], R = s[T];
        if (!(Math.abs(w.ang - R.ang) < 0.03 && Math.abs(w.perp - R.perp) < n)) continue;
        l.some((S) => R.t1 >= S.t0 - n && R.t0 <= S.t1 + n) && (l.push(R), r[T] = !0);
      }
      if (l.length === 1) {
        o.push(l[0].w);
        continue;
      }
      const c = l[0].ang, h = Math.cos(c), d = Math.sin(c), u = Math.min(...l.map((T) => T.t0)), f = Math.max(...l.map((T) => T.t1)), g = l[0].perp, v = -d, p = h, m = g * v, x = g * p, _ = [m + h * u, x + d * u], M = [m + h * f, x + d * f], L = {
        start: _,
        end: M,
        height: l[0].w.height,
        thickness: l[0].w.thickness,
        color: l[0].w.color,
        material: l[0].w.material,
        openings: []
      };
      for (const T of l)
        for (const w of T.w.openings ?? []) {
          const R = T.w.end[0] - T.w.start[0], F = T.w.end[1] - T.w.start[1], y = Math.hypot(R, F) || 1, S = T.w.start[0] + R / y * w.position, N = T.w.start[1] + F / y * w.position, k = (S - _[0]) * h + (N - _[1]) * d;
          L.openings.push({ ...w, position: Math.max(0, k) });
        }
      L.openings.length || delete L.openings, o.push(L);
    }
    t.walls = o, this.clearSelection(), this.rebuild(), this.onChange?.(), this.onMessage?.(`Walls merged: ${e.length} → ${o.length}`);
  }
  renderPreview() {
    this.sm.clearPreview();
    const t = this.sm.previewGroup, e = this.elevation(), n = this.wallHeight(), s = this.cursor ? [...this.chain, this.cursor] : [...this.chain];
    for (const r of s) {
      const o = this.isConnection(r), a = new ge(
        new ir(o ? 0.12 : 0.07, 12, 12),
        new en({ color: o ? 5230698 : 4500223 })
      );
      a.position.set(r[0], e + 0.06, r[1]), t.add(a);
    }
    for (let r = 0; r < s.length - 1; r++) {
      const o = s[r], a = s[r + 1], l = Math.hypot(a[0] - o[0], a[1] - o[1]);
      if (l < 1e-3) continue;
      const h = r === s.length - 2 && !!this.cursor && this.snapInfo && (this.snapInfo.matchedLen || this.snapInfo.parallel), d = new ge(
        new Vn(l, n, 0.1),
        new en({
          color: h ? 5230698 : 4500223,
          transparent: !0,
          opacity: h ? 0.5 : 0.35
        })
      ), u = Math.atan2(a[1] - o[1], a[0] - o[0]);
      d.position.set((o[0] + a[0]) / 2, e + n / 2, (o[1] + a[1]) / 2), d.rotation.y = -u, t.add(d);
    }
    if (this.measureLabel)
      if (this.cursor && this.chain.length >= 1 && this.snapInfo) {
        const r = this.chain[this.chain.length - 1], o = this.cursor, a = this.snapInfo, l = `${a.parallel ? " ∥" : ""}${a.matchedLen ? " =" : ""}`;
        this.measureLabel.setText(
          `${a.lengthM.toFixed(2)}m  ${Math.round((a.angleDeg % 360 + 360) % 360)}°${l}`,
          a.matchedLen || a.parallel ? "#7CFC8A" : "#ffffff"
        ), this.measureLabel.setPosition((r[0] + o[0]) / 2, e + n + 0.4, (r[1] + o[1]) / 2), this.measureLabel.sprite.visible = !0;
      } else
        this.measureLabel.sprite.visible = !1;
    if (this.chain.length >= 2 && this.cursor) {
      const r = this.chain[0];
      if (Math.hypot(this.cursor[0] - r[0], this.cursor[1] - r[1]) < IM) {
        const o = new ge(
          new go(0.22, 0.04, 8, 24),
          new en({ color: 5230698 })
        );
        o.rotation.x = Math.PI / 2, o.position.set(r[0], e + 0.06, r[1]), t.add(o);
      }
    }
  }
}
const Iu = "ha3d_floorplans", Du = "ha3d-floorplans-set", OM = "ha3d-floorplan-default";
function Nu(i) {
  return !!i && Array.isArray(i.floors) && i.floors.length > 0;
}
async function FM(i) {
  try {
    const e = (await i.callWS?.({ type: "frontend/get_user_data", key: Iu }))?.value;
    if (e && e.projects) return e;
  } catch {
  }
  return null;
}
async function Ma(i) {
  if (i) {
    const t = await FM(i);
    if (t) return t;
  }
  return BM() ?? { projects: {} };
}
async function dd(i, t) {
  if (kM(i), !t) return { ha: !1 };
  try {
    return await t.callWS?.({ type: "frontend/set_user_data", key: Iu, value: i }), { ha: !0 };
  } catch (e) {
    return console.error("[3d-floorplan] HA save failed, kept localStorage copy:", e), { ha: !1 };
  }
}
function BM() {
  try {
    const t = localStorage.getItem(Du);
    if (t) {
      const e = JSON.parse(t);
      if (e && e.projects) return e;
    }
  } catch {
  }
  const i = zM();
  return i ? { active: "default", projects: { default: i } } : null;
}
function kM(i) {
  try {
    localStorage.setItem(Du, JSON.stringify(i));
  } catch {
  }
}
function zM() {
  try {
    const i = localStorage.getItem(OM);
    if (!i) return null;
    const t = JSON.parse(i);
    return Nu(t) ? t : null;
  } catch {
    return null;
  }
}
function Sa(i) {
  return Object.entries(i.projects).filter(([, t]) => Nu(t)).map(([t, e]) => ({ id: t, name: e.name || t })).sort((t, e) => t.name.localeCompare(e.name));
}
function ud() {
  try {
    if (typeof crypto < "u" && crypto.randomUUID)
      return "p" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  } catch {
  }
  return `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e9).toString(36)}`;
}
function fd(i = "New Plan") {
  return {
    name: i,
    wallHeight: 2.6,
    floors: [{ name: "Ground Floor", elevation: 0, wallHeight: 2.6, walls: [], rooms: [], furniture: [], bindings: [] }]
  };
}
const pd = 76, md = /* @__PURE__ */ new Map();
let Os;
function HM() {
  return Os || (Os = new nu({
    antialias: !0,
    alpha: !0,
    preserveDrawingBuffer: !0
    // required for toDataURL
  }), Os.setSize(pd, pd), Os.setPixelRatio(1)), Os;
}
function gd(i) {
  const t = md.get(i);
  if (t) return t;
  const e = HM(), n = new iu();
  n.add(new Eu(16777215, 0.95));
  const s = new ql(16777215, 0.8);
  s.position.set(3, 5, 4), n.add(s);
  const r = _l(i, "#aab4c0");
  n.add(r);
  const o = new Ke().setFromObject(r), a = o.getCenter(new P()), l = o.getSize(new P()), c = Math.max(l.x, l.y, l.z, 0.4), h = new ze(38, 1, 0.01, 100), d = c * 2.3;
  h.position.set(a.x + d * 0.85, a.y + d * 0.7, a.z + d * 0.95), h.lookAt(a);
  let u = "";
  try {
    e.render(n, h), u = e.domElement.toDataURL("image/png");
  } catch {
    u = "";
  }
  return r.traverse((f) => {
    const g = f;
    g.geometry && g.geometry.dispose();
  }), md.set(i, u), u;
}
const GM = Math.PI / 180, yn = (i) => Math.round(i * 1e3) / 1e3;
function VM(i, t) {
  if (!t) return i;
  const e = t * GM, n = Math.cos(e), s = Math.sin(e);
  return [i[0] * n - i[1] * s, i[0] * s + i[1] * n];
}
function Uu(i) {
  const t = i?.position?.data?.transform || i?.placement?.data?.transform || {}, e = t.t || {};
  return { t: [e.x || 0, e.y || 0], r: t.r?.z ?? 0 };
}
const Ou = /* @__PURE__ */ new Set(["floor", "building", "site"]);
function qr(i, t, e) {
  let n = e, s = t, r = 0;
  for (; s && r++ < 32; ) {
    const o = i[s];
    if (!o || Ou.has(o.space?.type)) break;
    const { t: a, r: l } = Uu(o);
    n = VM(n, l), n = [n[0] + a[0], n[1] + a[1]], s = o.space?.parent;
  }
  return n;
}
function WM(i, t) {
  let e = 0, n = t, s = 0;
  for (; n && s++ < 32; ) {
    const r = i[n];
    if (!r || Ou.has(r.space?.type)) break;
    e += Uu(r).r, n = r.space?.parent;
  }
  return e;
}
const $M = (i) => (i % 360 + 360) % 360, Yr = (i) => [yn(i[1]), yn(-i[0])];
function XM(i, t) {
  const e = i.toLowerCase();
  return t.includes("cls:building.stairs") || e.includes("stair") ? "stairs" : t.includes("plm:on-ceiling") || e.includes("ceiling light") ? "ceiling_light" : e.includes("sofa") || e.includes("couch") ? "sofa" : e.includes("closet") || e.includes("wardrobe") ? "wardrobe" : e.includes("shelf") || e.includes("bookcase") ? "bookshelf" : e.includes("bed") ? "bed" : e.includes("table") ? "dining_table" : e.includes("chair") ? "chair" : e.includes("tv") ? "tv" : e.includes("fridge") || e.includes("refriger") ? "fridge" : e.includes("toilet") ? "toilet" : e.includes("sink") ? "sink" : e.includes("bath") ? "bathtub" : e.includes("desk") ? "desk" : "marker";
}
function jM(i) {
  return i === "ceiling_light" ? 2.65 : 0;
}
function KM(i) {
  return !!(i && i.spacePlan && i.spacePlan.plan && i.spacePlan.plan.units);
}
function qM(i) {
  const t = i.spacePlan.plan.units, e = Object.keys(t), n = [], s = [], r = [], o = [];
  let a = "Floor 1";
  for (const c of e)
    if (t[c].space?.type === "floor") {
      a = t[c].info?.name || a;
      break;
    }
  for (const c of e) {
    const h = t[c], d = h.space?.type;
    if (d === "area") {
      const u = h.shape?.data, f = u?.type, g = u?.points || [];
      if (f === "room" && g.length >= 3) {
        const v = g.map((x) => Yr(qr(t, c, [x.p.x, x.p.y])));
        s.push({
          polygon: v.map((x) => [x[0], x[1]]),
          color: "#c9c4bb"
        });
        const p = u?.parts || {}, m = {};
        for (const x in p) {
          const _ = p[x].data;
          (m[_.edge] ??= []).push(_);
        }
        for (let x = 0; x < v.length; x++) {
          const _ = v[x], M = v[(x + 1) % v.length], L = `edge:${g[x].i}-${g[(x + 1) % g.length].i}`, T = Math.hypot(M[0] - _[0], M[1] - _[1]), w = (m[L] || []).map((R) => ({
            kind: "door",
            position: Math.max(0, Math.min(T, R.start)),
            width: Math.max(0.3, R.end - R.start)
          }));
          n.push({
            start: [yn(_[0]), yn(_[1])],
            end: [yn(M[0]), yn(M[1])],
            thickness: 0.12,
            openings: w.length ? w : void 0
          });
        }
      } else if (f === "divider" && g.length >= 2) {
        const v = Yr(qr(t, c, [g[0].p.x, g[0].p.y])), p = Yr(qr(t, c, [g[1].p.x, g[1].p.y])), m = Math.hypot(p[0] - v[0], p[1] - v[1]), x = u?.parts || {}, _ = Object.keys(x).map((M) => {
          const L = x[M].data;
          return {
            kind: "door",
            position: Math.max(0, Math.min(m, L.start)),
            width: Math.max(0.3, L.end - L.start)
          };
        });
        n.push({
          start: [yn(v[0]), yn(v[1])],
          end: [yn(p[0]), yn(p[1])],
          thickness: 0.1,
          openings: _.length ? _ : void 0
        });
      }
    } else if (d === "device") {
      const u = h.info?.name || "", f = h.info?.tags || [];
      if (f.includes("cls:building.door")) continue;
      const g = XM(u, f);
      if (!g) continue;
      const v = Yr(qr(t, c, [0, 0])), p = WM(t, c);
      r.push({
        model: g,
        position: [v[0], jM(g), v[1]],
        rotation: $M(-p + 90),
        id: c
      });
      const m = h.mon?.card?.data?.switch?.uid;
      m && o.push({ entity_id: m, anchor_object: c, behavior: "light" });
    }
  }
  const l = {
    name: a,
    elevation: 0,
    wallHeight: 2.7,
    walls: n,
    rooms: s,
    furniture: r,
    bindings: o
  };
  return {
    name: i.spacePlan.info?.name || "Imported plan",
    wallHeight: 2.7,
    floors: [l]
  };
}
var YM = Object.defineProperty, ZM = Object.getOwnPropertyDescriptor, Ht = (i, t, e, n) => {
  for (var s = n > 1 ? void 0 : n ? ZM(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(t, e, s) : o(s)) || s);
  return n && s && YM(t, e, s), s;
};
let Bt = class extends Zi {
  constructor() {
    super(...arguments), this.floorNames = [], this.activeFloorIndex = 0, this.editing = !1, this.editTool = "wall", this.editSelectedModel = "sofa", this.editSelectedEntity = null, this.editSelectedObjModel = null, this.editShowAllEntities = !1, this.editSnap = !0, this.editFloorIndex = 0, this.editSelectedKind = null, this.editOpeningKind = null, this.editOpeningVariant = "single", this.editOpeningWidth = null, this.editSelectedColor = null, this.editSelectedWallLength = null, this.editRoom = null, this.editFurnScale = null, this.editMaterial = "plain", this.editCanUndo = !1, this.editCanRedo = !1, this.editUnderlay = null, this.editCameraDistance = 1, this.editIsLight = !1, this.editBrightness = 0, this.importOpen = !1, this.importText = "", this.projectList = [], this.currentProjectId = null, this.editingProjectId = null, this.editPlanName = "", this.paletteOpen = !1, this.storedProjects = { projects: {} }, this.planLoaded = !1, this.trackShift = (i) => {
      if (this.editor && (this.editor.shiftHeld = i.shiftKey), this.editing && this.editor && i.type === "keydown" && (i.ctrlKey || i.metaKey)) {
        const t = i.key.toLowerCase();
        t === "z" && !i.shiftKey ? (i.preventDefault(), this.editor.undo()) : (t === "y" || t === "z" && i.shiftKey) && (i.preventDefault(), this.editor.redo());
      }
      this.editing && this.editor && i.type === "keydown" && (i.key === "Enter" ? (i.preventDefault(), this.editor.finishChain()) : i.key === "Escape" && (i.preventDefault(), this.editor.cancelChain()));
    };
  }
  // -- Lovelace lifecycle -----------------------------------------------------
  setConfig(i) {
    if (!i) throw new Error("Invalid configuration");
    this.config = i, this.loadError = void 0, this.planLoaded = !1, this.activeProjectId = i.projects && i.projects.length ? i.projects[0].id : void 0, this.sceneManager && this.loadActiveProject();
  }
  getCardSize() {
    return 8;
  }
  static getStubConfig() {
    return {
      type: "custom:ha-3d-floorplan-card",
      height: "500px",
      plan: {
        name: "Demo",
        wallHeight: 2.6,
        floors: [
          {
            name: "Ground",
            walls: [
              { start: [0, 0], end: [6, 0] },
              { start: [6, 0], end: [6, 5] },
              { start: [6, 5], end: [0, 5] },
              { start: [0, 5], end: [0, 0], openings: [{ kind: "door", position: 2, width: 1 }] }
            ],
            rooms: [{ name: "Living", polygon: [[0, 0], [6, 0], [6, 5], [0, 5]], color: "#cfc7ba" }],
            furniture: [
              { model: "sofa", position: [1.5, 0, 1], rotation: 0, color: "#5b6b7a", id: "sofa1" },
              { model: "ceiling_light", position: [3, 2.5, 2.5], id: "lamp1" }
            ],
            bindings: [
              { entity_id: "light.living_room", anchor_object: "lamp1", behavior: "light" }
            ]
          }
        ]
      }
    };
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => tS), document.createElement("ha-3d-floorplan-card-editor");
  }
  // -- hass updates -----------------------------------------------------------
  willUpdate(i) {
    if (i.has("panel") && this.panel && !this.config) {
      window.__ha3dPanelMode = !0;
      const t = this.panel.config ?? {};
      this.setConfig({ height: "100vh", ...t, type: "custom:ha-3d-floorplan-card" });
    }
    i.has("hass") && this.hass && (this.pendingHass = this.hass);
  }
  updated(i) {
    !this.sceneManager && this.viewport && this.initScene(), this.pendingHass && this.sceneManager && this.planLoaded && !this.editing && (this.applyHass(this.pendingHass), this.pendingHass = void 0);
  }
  applyHass(i) {
    if (this.sceneManager) {
      if (!this.lastHass)
        this.sceneManager.syncAll(i);
      else
        for (const t in i.states)
          i.states[t] !== this.lastHass.states[t] && this.sceneManager.updateEntity(t, i);
      this.lastHass = i;
    }
  }
  // -- Scene setup ------------------------------------------------------------
  initScene() {
    if (!this.viewport) return;
    const i = this.config?.background ?? "#1b1d22";
    this.sceneManager = new yM(this.viewport, i), this.config?.cameraDistance && this.sceneManager.setCameraDistance(this.config.cameraDistance), this.sceneManager.setPickHandler((t) => this.handlePick(t)), this.sceneManager.start(), this.loadActiveProject();
  }
  async loadActiveProject() {
    if (!(!this.config || !this.sceneManager)) {
      this.loadError = void 0, this.planLoaded = !1;
      try {
        const i = await this.resolvePlan();
        this.currentPlan = i, this.sceneManager.loadPlan(i), this.floorNames = i.floors.map((t, e) => t.name || `Floor ${e + 1}`), this.activeFloorIndex = 0, this.planLoaded = !0, this.hass && (this.lastHass = void 0, this.applyHass(this.hass));
      } catch (i) {
        this.loadError = i?.message ?? String(i), console.error("[3d-floorplan] load failed:", i);
      }
    }
  }
  async resolvePlan() {
    const i = this.config;
    if (i.projects && i.projects.length) {
      const e = i.projects.find((n) => n.id === this.activeProjectId) ?? i.projects[0];
      return this.loadProjectRef(e);
    }
    if (i.plan) return i.plan;
    if (i.url) return this.fetchPlan(i.url);
    this.storedProjects = await Ma(this.hass), this.projectList = Sa(this.storedProjects);
    const t = this.storedProjects.active && this.storedProjects.projects[this.storedProjects.active] ? this.storedProjects.active : this.projectList[0]?.id;
    return t ? (this.currentProjectId = t, this.storedProjects.projects[t]) : (this.currentProjectId = null, LM);
  }
  async loadProjectRef(i) {
    if (i.plan) return i.plan;
    if (i.url) return this.fetchPlan(i.url);
    if (this.config?.backend)
      return this.fetchPlan(`${this.config.backend.replace(/\/$/, "")}/projects/${i.id}`);
    throw new Error(`Project "${i.id}" has no plan, url, or backend.`);
  }
  async fetchPlan(i) {
    const t = await fetch(i, { cache: "no-cache" });
    if (!t.ok) throw new Error(`Failed to fetch ${i}: ${t.status}`);
    return await t.json();
  }
  // -- Interaction ------------------------------------------------------------
  handlePick(i) {
    if (!i || !this.hass) return;
    const t = this.hass.states[i.entity_id];
    if (i.behavior === "lock" && t) {
      const n = t.state === "locked" ? "unlock" : "lock";
      this.hass.callService("lock", n, { entity_id: i.entity_id });
      return;
    }
    const e = xM(i.entity_id, i.behavior);
    e ? this.hass.callService(e.domain, e.service, e.data) : this.fireMoreInfo(i.entity_id);
  }
  fireMoreInfo(i) {
    const t = new CustomEvent("hass-more-info", {
      detail: { entityId: i },
      bubbles: !0,
      composed: !0
    });
    this.dispatchEvent(t);
  }
  onSelectFloor(i) {
    this.activeFloorIndex = i, this.sceneManager?.setActiveFloor(i), this.hass && this.sceneManager?.syncAll(this.hass);
  }
  onSelectProject(i) {
    this.activeProjectId = i.target.value, this.loadActiveProject();
  }
  onResetView() {
    this.sceneManager?.resetView();
  }
  // -- Editor -----------------------------------------------------------------
  enterEdit() {
    if (!this.sceneManager || !this.currentPlan) return;
    const i = JSON.parse(JSON.stringify(this.currentPlan));
    this.editor = new UM(this.sceneManager, i), this.editor.onChange = () => {
      const t = this.editor;
      this.editTool = t.tool, this.editSelectedModel = t.selectedModel, this.editSelectedEntity = t.selectedEntity, this.editSelectedObjModel = t.selectedObjectModel, this.editSelectedKind = t.selectedKind, this.editOpeningKind = t.selectedOpeningKind, this.editOpeningVariant = t.selectedOpeningVariant, this.editOpeningWidth = t.selectedOpeningWidth, this.editSelectedColor = t.selectedColor, this.editSelectedWallLength = t.selectedWallLength, this.editRoom = t.selectedRoomData, this.editFurnScale = t.selectedFurnitureScale, this.editMaterial = t.selectedMaterial, this.editFloorIndex = t.floorIndex, this.editPlanName = t.plan.name ?? "", this.editCanUndo = t.canUndo, this.editCanRedo = t.canRedo, this.editUnderlay = t.underlay, this.editCameraDistance = t.cameraDistance, this.editIsLight = t.selectedIsLight, this.editBrightness = t.selectedBrightness, this.requestUpdate();
    }, this.editor.onMessage = (t) => this.showToast(t), this.editor.onCalibrate = (t) => {
      const e = window.prompt(
        `Measured ${t.toFixed(2)} m on screen between those points.
Enter their REAL length in meters:`
      ), n = parseFloat(e ?? "");
      n > 0 ? this.editor?.applyUnderlayScale(t, n) : this.showToast("Calibration cancelled");
    }, this.sceneManager.loadPlan(i, !0), this.editor.floorIndex = Math.min(this.activeFloorIndex, i.floors.length - 1), this.editFloorIndex = this.editor.floorIndex, this.editor.setSnap(this.editSnap), this.editShowAllEntities = !1, this.editingProjectId = this.currentProjectId, this.editPlanName = i.name ?? "Plan", this.editor.start(), this.editing = !0, this.editTool = this.editor.tool, this.showToast('Edit mode — pick "Draw wall", tap the floor to place points');
  }
  async exitEdit() {
    this.editor && await this.onSavePlan(), this.editor?.stop(), this.editor = void 0, this.editing = !1, this.currentPlan && this.sceneManager && (this.sceneManager.loadPlan(this.currentPlan), this.hass && (this.lastHass = void 0, this.applyHass(this.hass)));
  }
  onEditTool(i) {
    this.editor?.setTool(i);
  }
  onSelectEditFloor(i) {
    const t = parseInt(i.target.value, 10);
    Number.isNaN(t) || !this.editor || t < 0 || t >= this.editor.plan.floors.length || (this.editor.setFloor(t), this.activeFloorIndex = t);
  }
  onUndoPoint() {
    this.editor?.undoPoint();
  }
  onUndo() {
    this.editor?.undo();
  }
  onRedo() {
    this.editor?.redo();
  }
  onMergeWalls() {
    this.editor?.mergeWalls();
  }
  onAutoFloors() {
    this.editor?.autoFloors();
  }
  onSetCameraDistance(i) {
    const t = parseFloat(i.target.value);
    Number.isNaN(t) || this.editor?.setCameraDistance(t);
  }
  onSetBrightness(i) {
    const t = parseFloat(i.target.value);
    Number.isNaN(t) || this.editor?.setBrightness(t);
  }
  onSetOpeningVariant(i) {
    this.editor?.setOpeningVariant(i.target.value);
  }
  onSetOpeningKind(i) {
    this.editor?.setOpeningKind(i.target.value);
  }
  onSetOpeningWidth(i) {
    const t = parseFloat(i.target.value);
    !Number.isNaN(t) && t > 0 && this.editor?.setOpeningWidth(t);
  }
  onToggleSnap() {
    this.editor && (this.editSnap = !this.editSnap, this.editor.setSnap(this.editSnap));
  }
  onNewPlan() {
    if (!this.editor || !window.confirm(
      `Create a NEW project?

Your other saved projects stay. Unsaved changes in the current one will be lost. Draw, then Save to keep the new project.`
    )) return;
    const t = `Plan ${this.projectList.length + 1}`;
    this.editingProjectId = null, this.editor.loadPlan(fd(t)), this.editPlanName = t, this.showToast("New project — draw it, then Save to keep it");
  }
  onRenamePlan(i) {
    const t = i.target.value;
    this.editPlanName = t, this.editor && (this.editor.plan.name = t);
  }
  onSelectStorageProject(i) {
    const t = i.target.value;
    if (!t || t === this.currentProjectId) return;
    const e = this.storedProjects.projects[t];
    if (!e) return;
    if (this.editing && !window.confirm("Switch project? Unsaved changes in the current one will be lost.")) {
      this.requestUpdate();
      return;
    }
    this.currentProjectId = t, this.editingProjectId = t, this.activeFloorIndex = 0;
    const n = JSON.parse(JSON.stringify(e)), s = JSON.parse(JSON.stringify(e));
    this.currentPlan = s, this.floorNames = e.floors.map((r, o) => r.name || `Floor ${o + 1}`), this.editing && this.editor ? (this.editor.loadPlan(n), this.editPlanName = n.name ?? "") : this.sceneManager && (this.sceneManager.loadPlan(s), this.hass && (this.lastHass = void 0, this.applyHass(this.hass))), this.showToast(`Loaded "${e.name || t}"`);
  }
  async onDeleteProject() {
    const i = this.editingProjectId ?? this.currentProjectId;
    if (this.storedProjects = await Ma(this.hass), !i || !this.storedProjects.projects[i]) {
      this.showToast("This project is not saved yet");
      return;
    }
    if (!window.confirm(`Delete project "${this.storedProjects.projects[i].name || i}"? This cannot be undone.`))
      return;
    delete this.storedProjects.projects[i];
    const t = Sa(this.storedProjects);
    this.storedProjects.active = t[0]?.id, await dd(this.storedProjects, this.hass), this.projectList = t, this.currentProjectId = this.storedProjects.active ?? null, this.editingProjectId = this.currentProjectId, this.activeFloorIndex = 0;
    const e = this.currentProjectId ? this.storedProjects.projects[this.currentProjectId] : fd();
    this.currentPlan = JSON.parse(JSON.stringify(e)), this.floorNames = e.floors.map((n, s) => n.name || `Floor ${s + 1}`), this.editor && (this.editor.loadPlan(JSON.parse(JSON.stringify(e))), this.editPlanName = e.name ?? ""), this.showToast("Project deleted");
  }
  onSetColor(i) {
    const t = i.target.value;
    this.editor?.setColor(t);
  }
  onSetFurnScale(i, t) {
    const e = parseFloat(t.target.value);
    Number.isNaN(e) || this.editor?.setFurnitureScale(i, e);
  }
  onSetMaterial(i) {
    this.editor?.setSurfaceMaterial(i.target.value);
  }
  onOpenImport() {
    this.importText = "", this.importOpen = !0;
  }
  onExportPlan() {
    this.editor ? this.importText = JSON.stringify(this.editor.plan, null, 2) : this.currentPlan && (this.importText = JSON.stringify(this.currentPlan, null, 2)), this.importOpen = !0;
  }
  onImportText(i) {
    this.importText = i.target.value;
  }
  async onImportLoad() {
    let i;
    try {
      const t = JSON.parse(this.importText);
      if (i = KM(t) ? qM(t) : t, !i || !Array.isArray(i.floors) || i.floors.length === 0)
        throw new Error('Plan must have a non-empty "floors" array');
    } catch (t) {
      this.showToast(`Import failed: ${t?.message ?? "invalid JSON"}`);
      return;
    }
    this.editor || this.enterEdit(), this.editor && (this.editor.loadPlan(i), this.editingProjectId = null, this.editPlanName = i.name ?? "Imported", this.importOpen = !1, await this.onSavePlan(), this.showToast(`Imported "${i.name ?? "plan"}" and saved`));
  }
  onNudgeHeight(i) {
    this.editor?.nudgeHeight(i);
  }
  onSetWallLength(i) {
    const t = parseFloat(i.target.value);
    !Number.isNaN(t) && t > 0 && this.editor?.setWallLength(t);
  }
  onDeleteWallOpening(i) {
    this.editor?.deleteWallOpening(i);
  }
  onDeleteRoomOpening(i) {
    this.editor?.deleteRoomOpening(i);
  }
  onAddFloor() {
    this.editor?.addFloor();
  }
  onAddRoomShape(i) {
    this.editor?.addRoomShape(i);
  }
  /** Import a 2D plan image as a tracing underlay (reference). */
  onPickUnderlay(i) {
    const t = i.target, e = t.files?.[0];
    if (!e || !this.editor) return;
    const n = new FileReader();
    n.onload = () => {
      const s = String(n.result || ""), r = new Image();
      r.onload = () => {
        this.editor?.setUnderlayImage(s, r.naturalWidth, r.naturalHeight);
      }, r.onerror = () => this.showToast("Could not read that image"), r.src = s;
    }, n.onerror = () => this.showToast("Could not read that file"), n.readAsDataURL(e), t.value = "";
  }
  onSetUnderlayField(i, t) {
    const e = parseFloat(t.target.value);
    this.editor?.setUnderlayField(i, e);
  }
  onNudgeUnderlay(i, t) {
    this.editor?.nudgeUnderlay(i, t);
  }
  onRemoveUnderlay() {
    this.editor?.removeUnderlay();
  }
  onCalibrateUnderlay() {
    this.editor?.startUnderlayCalibration();
  }
  onFinishWall() {
    this.editor?.finishChain();
  }
  onSetRoomField(i, t) {
    this.editor?.setRoomField(i, t.target.value);
  }
  onDeleteFloor() {
    window.confirm("Delete this floor and everything on it?") && this.editor?.deleteFloor();
  }
  pickModel(i) {
    this.editor && (this.editor.selectedModel = i, this.editSelectedModel = i, this.paletteOpen = !1);
  }
  togglePalette() {
    this.paletteOpen = !this.paletteOpen;
  }
  onRotateSelected() {
    this.editor?.rotateSelected();
  }
  onDeleteSelected() {
    this.editor?.deleteSelected();
  }
  onPickEntity(i) {
    const t = i.target.value || null;
    this.editor?.bindEntity(t), this.showToast(t ? `Bound ${t}` : "Binding cleared");
  }
  /** Entity ids for the selected piece, filtered by its natural domain(s).
   *  If the domain filter matches nothing, fall back to ALL entities so the
   *  dropdown is never empty. */
  candidateEntities(i) {
    if (!this.hass) return { ids: [], fellBack: !1 };
    const t = Object.keys(this.hass.states);
    let e = i.length ? t.filter((s) => i.includes(s.split(".")[0])) : t;
    const n = i.length > 0 && e.length === 0;
    return n && (e = t), e = [...e].sort((s, r) => {
      const o = this.entityArea(s), a = this.entityArea(r);
      return o !== a ? (o || "￿").localeCompare(a || "￿") : this.entityLabel(s).localeCompare(this.entityLabel(r));
    }), { ids: e, fellBack: n };
  }
  entityLabel(i) {
    return this.hass?.states[i]?.attributes?.friendly_name || i;
  }
  /** The HA area (room) an entity belongs to: its own area, else its device's. */
  entityArea(i) {
    const t = this.hass, e = t?.entities?.[i];
    let n = e?.area_id ?? void 0;
    return !n && e?.device_id && (n = t?.devices?.[e.device_id]?.area_id), n && t?.areas?.[n]?.name || "";
  }
  /** Rich option text: "Friendly name · Room · entity.id" so same-named
   *  entities in different rooms are easy to tell apart. */
  entityOptionText(i) {
    const t = this.entityLabel(i), e = this.entityArea(i), n = [t];
    return e && n.push(e), i !== t && n.push(i), n.join("  ·  ");
  }
  async onSavePlan() {
    if (!this.editor) return;
    const i = this.editor.plan;
    i.name || (i.name = this.editPlanName || "Plan"), this.storedProjects = await Ma(this.hass);
    let t = this.editingProjectId;
    if (!t)
      for (t = ud(); this.storedProjects.projects[t]; ) t = ud();
    this.editingProjectId = t, this.currentProjectId = t, this.storedProjects.projects[t] = JSON.parse(JSON.stringify(i)), this.storedProjects.active = t;
    const e = await dd(this.storedProjects, this.hass);
    this.currentPlan = JSON.parse(JSON.stringify(i)), this.projectList = Sa(this.storedProjects), this.floorNames = i.floors.map((n, s) => n.name || `Floor ${s + 1}`), this.showToast(
      e.ha ? `Saved "${i.name}" to Home Assistant (all devices)` : `Saved "${i.name}" locally (HA unavailable)`
    );
  }
  showToast(i) {
    this.toast = i, this.toastTimer && clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => {
      this.toast = void 0, this.requestUpdate();
    }, 3200);
  }
  // -- Lit lifecycle ----------------------------------------------------------
  connectedCallback() {
    super.connectedCallback(), this.sceneManager?.start(), window.addEventListener("keydown", this.trackShift), window.addEventListener("keyup", this.trackShift);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.sceneManager?.stop(), window.removeEventListener("keydown", this.trackShift), window.removeEventListener("keyup", this.trackShift);
  }
  renderPaletteCell(i, t) {
    return At`
      <button
        class="palette-cell ${i === this.editSelectedModel ? "active" : ""}"
        title=${t}
        @click=${() => this.pickModel(i)}
      >
        <img src=${gd(i)} alt="" />
        <span>${t}</span>
      </button>
    `;
  }
  renderEditor() {
    const i = this.editTool, t = (o) => o.replace(/_/g, " ").replace(/\b\w/g, (a) => a.toUpperCase()), e = Wy.filter((o) => !_o.includes(o)), n = this.editSelectedKind, s = i === "select" && !!n, r = n === "furniture";
    return At`
      <div class="overlay top-left toolbar">
        <div class="toolrow">
          <button class="btn" title="Undo (Ctrl+Z)" ?disabled=${!this.editCanUndo}
            @click=${this.onUndo}>↶ Undo</button>
          <button class="btn" title="Redo (Ctrl+Y)" ?disabled=${!this.editCanRedo}
            @click=${this.onRedo}>↷ Redo</button>
          <button class="btn" title="Merge duplicate / overlapping walls into one"
            @click=${this.onMergeWalls}>🧹 Merge walls</button>
          <button class="btn" title="Fill every closed wall loop with a floor"
            @click=${this.onAutoFloors}>▦ Auto floors</button>
        </div>
        <div class="toolrow">
          <button class="btn ${i === "wall" ? "active" : ""}" title="Draw walls"
            @click=${() => this.onEditTool("wall")}>▟ Wall</button>
          <button class="btn ${i === "door" ? "active" : ""}" title="Add a door — tap a wall"
            @click=${() => this.onEditTool("door")}>🚪 Door</button>
          <button class="btn ${i === "window" ? "active" : ""}" title="Add a window — tap a wall"
            @click=${() => this.onEditTool("window")}>🪟 Window</button>
          <button class="btn ${i === "opening" ? "active" : ""}" title="Add an open passage (no door) — tap a wall"
            @click=${() => this.onEditTool("opening")}>⬚ Opening</button>
          <button class="btn ${i === "floor" ? "active" : ""}" title="Trace a floor: tap corners, tap start (or Finish) to close"
            @click=${() => this.onEditTool("floor")}>▱ Floor</button>
          <button class="btn ${i === "furniture" ? "active" : ""}" title="Place furniture"
            @click=${() => this.onEditTool("furniture")}>🛋 Furniture</button>
          <button class="btn ${i === "select" ? "active" : ""}" title="Select / move / bind (camera always works: drag empty = orbit)"
            @click=${() => this.onEditTool("select")}>☝ Select</button>
        </div>
        <span class="hint">Camera always on: drag empty space = orbit · two fingers = pan/zoom · tap = act</span>

        <div class="panel-group">Building Parts — drop a room</div>
        <div class="toolrow">
          <button class="btn" title="Rectangle room" @click=${() => this.onAddRoomShape("rect")}>▭ Rect</button>
          <button class="btn" title="L-shaped room" @click=${() => this.onAddRoomShape("lshape")}>L L-shape</button>
          <button class="btn" title="Bevelled room" @click=${() => this.onAddRoomShape("bevel")}>⬡ Bevel</button>
          <span class="hint">then drag / rotate / resize it</span>
        </div>

        <div class="panel-group">Reference image — trace a 2D plan</div>
        ${this.editUnderlay ? At`<div class="toolrow">
                <label class="hint">Width (m):</label>
                <input class="num-input" type="number" min="0.5" step="0.1"
                  .value=${String(this.editUnderlay.widthM)}
                  @change=${(o) => this.onSetUnderlayField("widthM", o)} />
                <label class="hint">Opacity:</label>
                <input type="range" min="0.05" max="1" step="0.05"
                  .value=${String(this.editUnderlay.opacity ?? 0.6)}
                  @input=${(o) => this.onSetUnderlayField("opacity", o)} />
                <label class="hint">Rotate°:</label>
                <input class="num-input" type="number" step="1"
                  .value=${String(this.editUnderlay.rotation ?? 0)}
                  @change=${(o) => this.onSetUnderlayField("rotation", o)} />
              </div>
              <div class="toolrow">
                <span class="hint">Move:</span>
                <button class="btn" @click=${() => this.onNudgeUnderlay(-0.25, 0)}>◀</button>
                <button class="btn" @click=${() => this.onNudgeUnderlay(0.25, 0)}>▶</button>
                <button class="btn" @click=${() => this.onNudgeUnderlay(0, -0.25)}>▲</button>
                <button class="btn" @click=${() => this.onNudgeUnderlay(0, 0.25)}>▼</button>
                <button class="btn" title="Set scale by tapping two points of known length"
                  @click=${this.onCalibrateUnderlay}>📏 Calibrate (2 pts)</button>
                <button class="btn" title="Remove reference image" @click=${this.onRemoveUnderlay}>🗑 Remove</button>
              </div>` : At`<div class="toolrow">
              <label class="btn" title="Import a top-down 2D plan image to trace over">
                📷 Import image
                <input type="file" accept="image/*" style="display:none"
                  @change=${this.onPickUnderlay} />
              </label>
              <span class="hint">then set its width (m) and draw walls over it</span>
            </div>`}

        ${(() => {
      const o = this.editor?.plan.floors ?? [];
      return At`<div class="toolrow">
            <span class="hint">Floor:</span>
            ${o.length > 1 ? At`<select class="select" @change=${this.onSelectEditFloor}>
                  ${o.map(
        (a, l) => At`<option value=${l} ?selected=${l === this.editFloorIndex}>
                      ${a.name || `Floor ${l + 1}`}
                    </option>`
      )}
                </select>` : At`<span class="hint">${o[0]?.name || "Ground"}</span>`}
            <button class="btn" title="Add a floor above" @click=${this.onAddFloor}>➕ Floor</button>
            ${o.length > 1 ? At`<button class="btn" title="Delete this floor" @click=${this.onDeleteFloor}>🗑</button>` : Rt}
          </div>
          <div class="toolrow">
            <span class="hint">View distance:</span>
            <input type="range" min="0.4" max="2" step="0.05"
              .value=${String(this.editCameraDistance)}
              title="Default camera distance on Reset (saved with the project)"
              @input=${this.onSetCameraDistance} />
          </div>`;
    })()}

        ${i === "wall" || i === "floor" ? At`<div class="toolrow">
              <button class="btn" title="Remove the last point" @click=${this.onUndoPoint}>⤺ Undo point</button>
              <button class="btn" title="Finish this run (Enter)" @click=${this.onFinishWall}>✓ Finish</button>
              <button class="btn ${this.editSnap ? "active" : ""}"
                title="Snap assist: parallel/perpendicular angles, equal lengths, alignment"
                @click=${this.onToggleSnap}>🧲 Snap</button>
              <span class="hint">${i === "floor" ? "trace a floor: tap corners · tap start (or Finish) to close" : "tap to add points · tap start to close (adds floor) · Finish/Enter to end"}</span>
            </div>` : Rt}

        ${i === "furniture" ? At`<div class="toolrow">
              <button class="btn palette-btn" title="Choose a model" @click=${this.togglePalette}>
                <img class="palette-thumb" src=${gd(this.editSelectedModel)} alt="" />
                ${t(this.editSelectedModel)} ▾
              </button>
              <span class="hint">tap floor to place</span>
            </div>
            ${this.paletteOpen ? At`<div class="palette">
                  <div class="palette-group">Lighting</div>
                  <div class="palette-grid">
                    ${_o.map((o) => this.renderPaletteCell(o, t(o)))}
                  </div>
                  <div class="palette-group">Furniture</div>
                  <div class="palette-grid">
                    ${e.map((o) => this.renderPaletteCell(o, t(o)))}
                  </div>
                </div>` : Rt}` : Rt}

        ${s ? At`<div class="toolrow">
              <span class="hint">${n} selected</span>
              ${r ? At`<button class="btn" title="Rotate 45°" @click=${this.onRotateSelected}>⟳ Rotate</button>
                    <button class="btn" title="Lower" @click=${() => this.onNudgeHeight(-0.1)}>▼ Down</button>
                    <button class="btn" title="Raise" @click=${() => this.onNudgeHeight(0.1)}>▲ Up</button>` : Rt}
              ${n !== "room" ? At`<button class="btn" title="Delete" @click=${this.onDeleteSelected}>🗑 Delete</button>` : Rt}
            </div>
            ${r && this.editIsLight ? At`<div class="toolrow">
                  <span class="hint">Brightness:</span>
                  <input type="range" min="0" max="1" step="0.05"
                    .value=${String(this.editBrightness)}
                    title="Manual glow level (bound light overrides)"
                    @input=${this.onSetBrightness} />
                </div>` : Rt}
            ${n === "opening" ? At`<div class="toolrow">
                    <span class="hint">Type:</span>
                    <select class="select" @change=${this.onSetOpeningKind}>
                      ${["door", "window", "opening"].map(
      (o) => At`<option value=${o} ?selected=${o === this.editOpeningKind}>${o}</option>`
    )}
                    </select>
                  </div>
                  ${this.editOpeningKind !== "opening" ? At`<div class="toolrow">
                        <span class="hint">Style:</span>
                        <select class="select" @change=${this.onSetOpeningVariant}>
                          ${(this.editOpeningKind === "door" ? lM : cM).map(
      (o) => At`<option value=${o} ?selected=${o === this.editOpeningVariant}>${o}</option>`
    )}
                        </select>
                      </div>` : Rt}
                  <div class="toolrow">
                    <span class="hint">Width (m):</span>
                    <input class="num-input" type="number" min="0.3" step="0.1"
                      .value=${this.editOpeningWidth != null ? this.editOpeningWidth.toFixed(2) : ""}
                      @change=${this.onSetOpeningWidth} />
                  </div>` : Rt}
            ${n !== "opening" ? At`<div class="toolrow">
                  <span class="hint">Color:</span>
                  <input
                    class="color"
                    type="color"
                    .value=${this.editSelectedColor ?? (n === "room" ? "#cfc7ba" : n === "wall" ? "#e6e6e6" : "#ffffff")}
                    @input=${this.onSetColor}
                  />
                  ${n === "wall" || n === "room" ? At`<span class="hint">${n === "room" ? "Floor" : "Wall"}:</span>
                        <select class="select" @change=${this.onSetMaterial}>
                          ${(n === "room" ? iM : nM).map(
      (o) => At`<option value=${o} ?selected=${o === this.editMaterial}>${o}</option>`
    )}
                        </select>` : Rt}
                </div>` : Rt}
            ${r && this.editFurnScale ? At`<div class="toolrow">
                  <span class="hint">Size</span>
                  <input class="num-input" type="number" min="0.1" step="0.1" title="Width"
                    .value=${this.editFurnScale[0].toFixed(1)}
                    @change=${(o) => this.onSetFurnScale(0, o)} />
                  <input class="num-input" type="number" min="0.1" step="0.1" title="Height"
                    .value=${this.editFurnScale[1].toFixed(1)}
                    @change=${(o) => this.onSetFurnScale(1, o)} />
                  <input class="num-input" type="number" min="0.1" step="0.1" title="Depth"
                    .value=${this.editFurnScale[2].toFixed(1)}
                    @change=${(o) => this.onSetFurnScale(2, o)} />
                </div>` : Rt}
            ${n === "wall" ? At`<div class="toolrow">
                  <span class="hint">Length (m):</span>
                  <input
                    class="num-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    .value=${this.editSelectedWallLength != null ? this.editSelectedWallLength.toFixed(2) : ""}
                    @change=${this.onSetWallLength}
                  />
                  <span class="hint">or drag the wall's end point</span>
                </div>
                ${this.editor && this.editor.selectedWallOpenings.length ? At`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                      ${this.editor.selectedWallOpenings.map(
      (o, a) => At`<div class="toolrow">
                          <span class="hint">${o.kind} @ ${o.position.toFixed(1)}m · ${o.width.toFixed(1)}m</span>
                          <button class="btn" title="Delete this opening"
                            @click=${() => this.onDeleteWallOpening(a)}>🗑</button>
                        </div>`
    )}` : Rt}` : Rt}
            ${n === "room" && this.editRoom?.shape ? At`<div class="toolrow">
                    <input class="name-input" type="text" placeholder="Room name"
                      .value=${this.editRoom.name ?? ""}
                      @change=${(o) => this.onSetRoomField("name", o)} />
                  </div>
                  <div class="toolrow">
                    <span class="hint">W</span>
                    <input class="num-input" type="number" min="0.5" step="0.1"
                      .value=${(this.editRoom.width ?? 0).toFixed(1)}
                      @change=${(o) => this.onSetRoomField("width", o)} />
                    <span class="hint">D</span>
                    <input class="num-input" type="number" min="0.5" step="0.1"
                      .value=${(this.editRoom.depth ?? 0).toFixed(1)}
                      @change=${(o) => this.onSetRoomField("depth", o)} />
                  </div>
                  <div class="toolrow">
                    <span class="hint">Height</span>
                    <input class="num-input" type="number" min="1" step="0.1"
                      .value=${(this.editRoom.height ?? 2.6).toFixed(1)}
                      @change=${(o) => this.onSetRoomField("height", o)} />
                    <span class="hint">Rot°</span>
                    <input class="num-input" type="number" step="15"
                      .value=${Math.round(this.editRoom.rotation ?? 0).toString()}
                      @change=${(o) => this.onSetRoomField("rotation", o)} />
                  </div>
                  <span class="hint">drag body=move · ring=rotate · corners=resize · Shift=no snap</span>
                  ${this.editor && this.editor.selectedRoomOpenings.length ? At`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                        ${this.editor.selectedRoomOpenings.map(
      (o, a) => At`<div class="toolrow">
                            <span class="hint">${o.kind} · ${o.width.toFixed(1)}m</span>
                            <button class="btn" title="Delete this opening"
                              @click=${() => this.onDeleteRoomOpening(a)}>🗑</button>
                          </div>`
    )}` : Rt}` : Rt}
            ${r && this.hass ? (() => {
      const o = this.editShowAllEntities || !this.editSelectedObjModel ? [] : Ky(this.editSelectedObjModel), { ids: a, fellBack: l } = this.candidateEntities(o);
      return At`<div class="toolrow">
                      <select class="select wide" @change=${this.onPickEntity}>
                        <option value="" ?selected=${!this.editSelectedEntity}>
                          — bind entity —
                        </option>
                        ${a.map(
        (c) => At`<option value=${c} ?selected=${c === this.editSelectedEntity}
                            title=${c}>
                            ${this.entityOptionText(c)}
                          </option>`
      )}
                      </select>
                      <button
                        class="btn ${this.editShowAllEntities ? "active" : ""}"
                        title="Show all entities (ignore type filter)"
                        @click=${() => this.editShowAllEntities = !this.editShowAllEntities}
                      >
                        All
                      </button>
                    </div>
                    <span class="hint">
                      ${this.editSelectedEntity ? `bound: ${this.editSelectedEntity}` : l ? `${a.length} entities (no ${o.join(" / ")} found)` : o.length ? `${a.length} ${o.join(" / ")} entities (tap All for every entity)` : `${a.length} entities`}
                    </span>`;
    })() : Rt}` : Rt}

        ${i === "select" && !n ? At`<span class="hint">tap to select · DRAG furniture to move it · drag a wall end to reshape</span>` : Rt}
        ${i === "door" || i === "window" ? At`<span class="hint">tap a wall to add a ${i}</span>` : Rt}
        ${i === "wall" ? At`<span class="hint">tap 2 points = 1 wall · 🧲 snaps parallel/right-angle + equal length · drag empty space = orbit</span>` : Rt}

        <div class="panel-section">
          <div class="toolrow">
            <span class="hint">Project</span>
            <input
              class="name-input"
              type="text"
              placeholder="Project name"
              .value=${this.editPlanName}
              @input=${this.onRenamePlan}
            />
          </div>
          ${this.projectList.length > 0 ? At`<div class="toolrow">
                <select class="select wide" @change=${this.onSelectStorageProject}>
                  ${this.editingProjectId ? Rt : At`<option value="" selected>(unsaved new)</option>`}
                  ${this.projectList.map(
      (o) => At`<option value=${o.id} ?selected=${o.id === this.editingProjectId}>${o.name}</option>`
    )}
                </select>
                <button class="btn" title="Delete this project" @click=${this.onDeleteProject}>🗑</button>
              </div>` : Rt}
          <div class="toolrow">
            <button class="btn" title="Create a new project (keeps the others)" @click=${this.onNewPlan}>✚ New</button>
            <button class="btn primary" title="Save this project" @click=${this.onSavePlan}>💾 Save</button>
          </div>
          <div class="toolrow">
            <button class="btn" title="Paste a plan JSON to build it" @click=${this.onOpenImport}>📥 Import</button>
            <button class="btn" title="Copy this plan as JSON" @click=${this.onExportPlan}>📤 Export</button>
          </div>
        </div>
      </div>
    `;
  }
  // -- Render -----------------------------------------------------------------
  render() {
    if (!this.config) return Rt;
    const i = this.config.height ?? "500px", t = this.config.projects ?? [];
    return At`
      <ha-card>
        <div class="viewport" style="height:${i}"></div>

        ${this.loadError ? At`<div class="error">⚠ ${this.loadError}</div>` : Rt}

        <div class="overlay top-right">
          <button class="btn" title="Reset view" @click=${this.onResetView}>
            ⌂ Reset
          </button>
          ${this.editing ? At`<button class="btn primary" title="Save & exit editor" @click=${this.exitEdit}>
                ✓ Done &amp; Save
              </button>` : At`<button class="btn" title="Edit floor plan" @click=${this.enterEdit}>
                ✎ Edit
              </button>`}
        </div>

        ${this.editing ? this.renderEditor() : Rt}

        ${this.importOpen ? At`<div class="import-modal">
              <div class="import-box">
                <div class="import-title">Import / Export plan JSON</div>
                <textarea
                  class="import-text"
                  spellcheck="false"
                  placeholder="Paste a floor-plan JSON here, then press Load…"
                  .value=${this.importText}
                  @input=${this.onImportText}
                ></textarea>
                <div class="toolrow">
                  <button class="btn primary" @click=${this.onImportLoad}>📥 Load</button>
                  <button class="btn" @click=${() => this.importOpen = !1}>Cancel</button>
                </div>
              </div>
            </div>` : Rt}

        ${this.toast ? At`<div class="toast">${this.toast}</div>` : Rt}

        ${t.length > 1 ? At`
              <div class="overlay top-left">
                <select class="select" @change=${this.onSelectProject}>
                  ${t.map(
      (e) => At`<option value=${e.id} ?selected=${e.id === this.activeProjectId}>
                      ${e.name || e.id}
                    </option>`
    )}
                </select>
              </div>
            ` : Rt}

        ${this.floorNames.length > 1 && !this.editing ? At`
              <div class="overlay bottom">
                ${this.floorNames.map(
      (e, n) => At`
                    <button
                      class="tab ${n === this.activeFloorIndex ? "active" : ""}"
                      @click=${() => this.onSelectFloor(n)}
                    >
                      ${e}
                    </button>
                  `
    )}
              </div>
            ` : Rt}
      </ha-card>
    `;
  }
};
Bt.styles = vd`
    :host {
      display: block;
    }
    ha-card {
      position: relative;
      overflow: hidden;
      padding: 0;
    }
    .viewport {
      position: relative;
      width: 100%;
      /* Critical for tablets: stop the browser hijacking pinch into page zoom. */
      touch-action: none;
      overscroll-behavior: contain;
      background: #1b1d22;
    }
    .overlay {
      position: absolute;
      z-index: 2;
      display: flex;
      gap: 6px;
    }
    .top-right {
      top: 10px;
      right: 10px;
    }
    .top-left {
      top: 10px;
      left: 10px;
    }
    .bottom {
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      flex-wrap: wrap;
      justify-content: center;
      max-width: 90%;
    }
    .btn,
    .tab,
    .select {
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover,
    .tab:hover {
      background: rgba(55, 60, 70, 0.9);
    }
    .tab.active,
    .btn.active {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
    }
    .btn.primary {
      background: #2e7d32;
      border-color: #2e7d32;
    }
    .btn[disabled] {
      opacity: 0.4;
      cursor: default;
      pointer-events: none;
    }
    .toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      top: 10px;
      left: 10px;
      bottom: 10px;
      width: 270px;
      max-width: 80%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      scrollbar-width: thin;
      border-radius: 12px;
      background: rgba(22, 24, 28, 0.86);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(6px);
      -webkit-overflow-scrolling: touch;
    }
    /* The toolbar is a scrolling column — its children must keep their natural
       height (never shrink), or long content like the palette collapses to a
       thin unusable strip. */
    .toolbar > * {
      flex: 0 0 auto;
    }
    .panel-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .color {
      width: 42px;
      height: 30px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }
    .name-input {
      flex: 1;
      min-width: 0;
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 10px;
    }
    .num-input {
      width: 72px;
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 6px 8px;
    }
    .import-modal {
      position: absolute;
      inset: 0;
      z-index: 6;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
    }
    .import-box {
      width: min(560px, 92%);
      max-height: 86%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
      border-radius: 12px;
      background: rgba(24, 26, 30, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .import-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .import-text {
      width: 100%;
      box-sizing: border-box;
      min-height: 240px;
      resize: vertical;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 12px;
      color: #e6e6e6;
      background: rgba(15, 17, 20, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 10px;
    }
    .toolrow {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .select.wide {
      min-width: 150px;
    }
    .hint {
      font-size: 12px;
      color: #cfe0ff;
      background: rgba(30, 33, 40, 0.7);
      padding: 4px 8px;
      border-radius: 6px;
    }
    ha-entity-picker {
      width: 240px;
      max-width: 70vw;
    }
    .palette-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .palette-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
    }
    .palette {
      background: rgba(22, 24, 28, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      padding: 8px 10px;
      max-height: 50vh;
      overflow-y: auto;
      overflow-x: hidden;
      backdrop-filter: blur(6px);
      max-width: 340px;
      flex: 0 0 auto; /* never let the flex column squish it to a thin strip */
    }
    .palette-group,
    .panel-group {
      font-size: 12px;
      font-weight: 600;
      color: #9ab;
      margin: 6px 2px 4px;
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 76px);
      gap: 6px;
      justify-content: start;
    }
    .palette-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      width: 76px;
      padding: 4px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.04);
      color: #ddd;
      font: inherit;
      font-size: 10px;
      cursor: pointer;
    }
    .palette-cell:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .palette-cell.active {
      border-color: var(--primary-color, #03a9f4);
      background: rgba(3, 169, 244, 0.18);
    }
    .palette-cell img {
      width: 64px;
      height: 64px;
    }
    .palette-cell span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 68px;
    }
    .toast {
      position: absolute;
      z-index: 4;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      background: rgba(20, 22, 26, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.16);
      padding: 9px 14px;
      border-radius: 10px;
      font-size: 13px;
      max-width: 86%;
      text-align: center;
      backdrop-filter: blur(4px);
    }
    .error {
      position: absolute;
      z-index: 3;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffb3b3;
      background: rgba(40, 20, 20, 0.9);
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 80%;
      text-align: center;
    }
  `;
Ht([
  rr({ attribute: !1 })
], Bt.prototype, "hass", 2);
Ht([
  rr({ attribute: !1 })
], Bt.prototype, "panel", 2);
Ht([
  rr({ attribute: !1 })
], Bt.prototype, "narrow", 2);
Ht([
  $t()
], Bt.prototype, "config", 2);
Ht([
  $t()
], Bt.prototype, "activeProjectId", 2);
Ht([
  $t()
], Bt.prototype, "loadError", 2);
Ht([
  $t()
], Bt.prototype, "floorNames", 2);
Ht([
  $t()
], Bt.prototype, "activeFloorIndex", 2);
Ht([
  $t()
], Bt.prototype, "editing", 2);
Ht([
  $t()
], Bt.prototype, "editTool", 2);
Ht([
  $t()
], Bt.prototype, "editSelectedModel", 2);
Ht([
  $t()
], Bt.prototype, "editSelectedEntity", 2);
Ht([
  $t()
], Bt.prototype, "editSelectedObjModel", 2);
Ht([
  $t()
], Bt.prototype, "editShowAllEntities", 2);
Ht([
  $t()
], Bt.prototype, "editSnap", 2);
Ht([
  $t()
], Bt.prototype, "editFloorIndex", 2);
Ht([
  $t()
], Bt.prototype, "editSelectedKind", 2);
Ht([
  $t()
], Bt.prototype, "editOpeningKind", 2);
Ht([
  $t()
], Bt.prototype, "editOpeningVariant", 2);
Ht([
  $t()
], Bt.prototype, "editOpeningWidth", 2);
Ht([
  $t()
], Bt.prototype, "editSelectedColor", 2);
Ht([
  $t()
], Bt.prototype, "editSelectedWallLength", 2);
Ht([
  $t()
], Bt.prototype, "editRoom", 2);
Ht([
  $t()
], Bt.prototype, "editFurnScale", 2);
Ht([
  $t()
], Bt.prototype, "editMaterial", 2);
Ht([
  $t()
], Bt.prototype, "editCanUndo", 2);
Ht([
  $t()
], Bt.prototype, "editCanRedo", 2);
Ht([
  $t()
], Bt.prototype, "editUnderlay", 2);
Ht([
  $t()
], Bt.prototype, "editCameraDistance", 2);
Ht([
  $t()
], Bt.prototype, "editIsLight", 2);
Ht([
  $t()
], Bt.prototype, "editBrightness", 2);
Ht([
  $t()
], Bt.prototype, "importOpen", 2);
Ht([
  $t()
], Bt.prototype, "importText", 2);
Ht([
  $t()
], Bt.prototype, "projectList", 2);
Ht([
  $t()
], Bt.prototype, "currentProjectId", 2);
Ht([
  $t()
], Bt.prototype, "editingProjectId", 2);
Ht([
  $t()
], Bt.prototype, "editPlanName", 2);
Ht([
  $t()
], Bt.prototype, "paletteOpen", 2);
Ht([
  $t()
], Bt.prototype, "toast", 2);
Ht([
  ff(".viewport")
], Bt.prototype, "viewport", 2);
Bt = Ht([
  bd("ha-3d-floorplan-card")
], Bt);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-3d-floorplan-card",
  name: "3D Floor Plan Card",
  description: "Interactive true-3D floor plan with live entity bindings.",
  preview: !1,
  documentationURL: "https://github.com/your-org/ha-3d-floorplan-card"
});
console.info(
  `%c 3D-FLOORPLAN-CARD %c v${SM} `,
  "color:#fff;background:#03a9f4;border-radius:4px 0 0 4px;padding:2px 6px",
  "color:#03a9f4;background:#222;border-radius:0 4px 4px 0;padding:2px 6px"
);
PM();
var JM = Object.defineProperty, QM = Object.getOwnPropertyDescriptor, hr = (i, t, e, n) => {
  for (var s = n > 1 ? void 0 : n ? QM(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(t, e, s) : o(s)) || s);
  return n && s && JM(t, e, s), s;
};
let li = class extends Zi {
  constructor() {
    super(...arguments), this._planText = "";
  }
  setConfig(i) {
    this._config = i, i.plan ? this._planText = JSON.stringify(i.plan, null, 2) : !i.url && !i.projects && (this._planText = "");
  }
  _emit(i) {
    this._config = i, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: i },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _onField(i, t) {
    if (!this._config) return;
    const e = t.target.value, n = { ...this._config };
    e === "" ? delete n[i] : n[i] = e, this._emit(n);
  }
  _onPlanInput(i) {
    if (this._planText = i.target.value, !!this._config) {
      if (this._planText.trim() === "") {
        this._jsonError = void 0;
        const t = { ...this._config };
        delete t.plan, this._emit(t);
        return;
      }
      try {
        const t = JSON.parse(this._planText);
        if (!t.floors || !Array.isArray(t.floors))
          throw new Error('Plan must have a "floors" array.');
        this._jsonError = void 0;
        const e = { ...this._config, plan: t };
        delete e.url, this._emit(e);
      } catch (t) {
        this._jsonError = t?.message ?? "Invalid JSON";
      }
    }
  }
  render() {
    return this._config ? At`
      <div class="form">
        <label>
          Card height
          <input
            type="text"
            placeholder="500px"
            .value=${this._config.height ?? ""}
            @input=${(i) => this._onField("height", i)}
          />
        </label>

        <label>
          Background color
          <input
            type="text"
            placeholder="#1b1d22"
            .value=${this._config.background ?? ""}
            @input=${(i) => this._onField("background", i)}
          />
        </label>

        <label>
          Plan URL (alternative to inline plan)
          <input
            type="text"
            placeholder="/local/floorplans/home.json"
            .value=${this._config.url ?? ""}
            @input=${(i) => this._onField("url", i)}
          />
        </label>

        <label>
          Backend URL (optional, stretch goal)
          <input
            type="text"
            placeholder="http://localhost:8099"
            .value=${this._config.backend ?? ""}
            @input=${(i) => this._onField("backend", i)}
          />
        </label>

        <label class="plan">
          Floor plan JSON (inline)
          <textarea
            rows="16"
            spellcheck="false"
            .value=${this._planText}
            @input=${this._onPlanInput}
          ></textarea>
        </label>
        ${this._jsonError ? At`<div class="err">⚠ ${this._jsonError}</div>` : Rt}

        <p class="hint">
          A full visual wall-drawing editor with a furniture palette and
          entity-binding dropdowns is planned (Phase 2). For now, author the
          plan JSON here or point to a file under <code>/config/www/</code>.
        </p>
      </div>
    ` : Rt;
  }
};
li.styles = vd`
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 13px;
      gap: 4px;
      color: var(--primary-text-color, #222);
    }
    input,
    textarea {
      font: inherit;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #222);
    }
    textarea {
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 12px;
      resize: vertical;
    }
    .err {
      color: #c0392b;
      font-size: 12px;
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
    }
    code {
      background: rgba(0, 0, 0, 0.07);
      padding: 1px 4px;
      border-radius: 4px;
    }
  `;
hr([
  rr({ attribute: !1 })
], li.prototype, "hass", 2);
hr([
  $t()
], li.prototype, "_config", 2);
hr([
  $t()
], li.prototype, "_planText", 2);
hr([
  $t()
], li.prototype, "_jsonError", 2);
li = hr([
  bd("ha-3d-floorplan-card-editor")
], li);
const tS = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get Ha3dFloorplanCardEditor() {
    return li;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  Bt as Ha3dFloorplanCard
};
