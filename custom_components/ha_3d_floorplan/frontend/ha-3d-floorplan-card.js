/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Zr = globalThis, vl = Zr.ShadowRoot && (Zr.ShadyCSS === void 0 || Zr.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xl = Symbol(), ac = /* @__PURE__ */ new WeakMap();
let gu = class {
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
const zd = (i) => new gu(typeof i == "string" ? i : i + "", void 0, xl), _u = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((n, s, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + i[r + 1], i[0]);
  return new gu(e, i, xl);
}, Hd = (i, t) => {
  if (vl) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const n = document.createElement("style"), s = Zr.litNonce;
    s !== void 0 && n.setAttribute("nonce", s), n.textContent = e.cssText, i.appendChild(n);
  }
}, lc = vl ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const n of t.cssRules) e += n.cssText;
  return zd(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Gd, defineProperty: Vd, getOwnPropertyDescriptor: Wd, getOwnPropertyNames: $d, getOwnPropertySymbols: Xd, getPrototypeOf: jd } = Object, xo = globalThis, cc = xo.trustedTypes, Yd = cc ? cc.emptyScript : "", qd = xo.reactiveElementPolyfillSupport, ks = (i, t) => i, oo = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Yd : null;
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
} }, yl = (i, t) => !Gd(i, t), hc = { attribute: !0, type: String, converter: oo, reflect: !1, useDefault: !1, hasChanged: yl };
Symbol.metadata ??= Symbol("metadata"), xo.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let qi = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = hc) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const n = Symbol(), s = this.getPropertyDescriptor(t, n, e);
      s !== void 0 && Vd(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, n) {
    const { get: s, set: r } = Wd(this.prototype, t) ?? { get() {
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
    const t = jd(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ks("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ks("properties"))) {
      const e = this.properties, n = [...$d(e), ...Xd(e)];
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
    return Hd(t, this.constructor.elementStyles), t;
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
qi.elementStyles = [], qi.shadowRootOptions = { mode: "open" }, qi[ks("elementProperties")] = /* @__PURE__ */ new Map(), qi[ks("finalized")] = /* @__PURE__ */ new Map(), qd?.({ ReactiveElement: qi }), (xo.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ml = globalThis, uc = (i) => i, ao = Ml.trustedTypes, dc = ao ? ao.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, vu = "$lit$", Qn = `lit$${Math.random().toFixed(9).slice(2)}$`, xu = "?" + Qn, Kd = `<${xu}>`, Mi = document, Xs = () => Mi.createComment(""), js = (i) => i === null || typeof i != "object" && typeof i != "function", Sl = Array.isArray, Zd = (i) => Sl(i) || typeof i?.[Symbol.iterator] == "function", Po = `[ 	
\f\r]`, Ms = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, fc = /-->/g, pc = />/g, ci = RegExp(`>|${Po}(?:([^\\s"'>=/]+)(${Po}*=${Po}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), mc = /'/g, gc = /"/g, yu = /^(?:script|style|textarea|title)$/i, Jd = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), Ot = Jd(1), ss = Symbol.for("lit-noChange"), Lt = Symbol.for("lit-nothing"), _c = /* @__PURE__ */ new WeakMap(), yi = Mi.createTreeWalker(Mi, 129);
function Mu(i, t) {
  if (!Sl(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return dc !== void 0 ? dc.createHTML(t) : t;
}
const Qd = (i, t) => {
  const e = i.length - 1, n = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ms;
  for (let a = 0; a < e; a++) {
    const l = i[a];
    let c, h, u = -1, d = 0;
    for (; d < l.length && (o.lastIndex = d, h = o.exec(l), h !== null); ) d = o.lastIndex, o === Ms ? h[1] === "!--" ? o = fc : h[1] !== void 0 ? o = pc : h[2] !== void 0 ? (yu.test(h[2]) && (s = RegExp("</" + h[2], "g")), o = ci) : h[3] !== void 0 && (o = ci) : o === ci ? h[0] === ">" ? (o = s ?? Ms, u = -1) : h[1] === void 0 ? u = -2 : (u = o.lastIndex - h[2].length, c = h[1], o = h[3] === void 0 ? ci : h[3] === '"' ? gc : mc) : o === gc || o === mc ? o = ci : o === fc || o === pc ? o = Ms : (o = ci, s = void 0);
    const f = o === ci && i[a + 1].startsWith("/>") ? " " : "";
    r += o === Ms ? l + Kd : u >= 0 ? (n.push(c), l.slice(0, u) + vu + l.slice(u) + Qn + f) : l + Qn + (u === -2 ? a : f);
  }
  return [Mu(i, r + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), n];
};
class Ys {
  constructor({ strings: t, _$litType$: e }, n) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [c, h] = Qd(t, e);
    if (this.el = Ys.createElement(c, n), yi.currentNode = this.el.content, e === 2 || e === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = yi.nextNode()) !== null && l.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(vu)) {
          const d = h[o++], f = s.getAttribute(u).split(Qn), g = /([.?@])?(.*)/.exec(d);
          l.push({ type: 1, index: r, name: g[2], strings: f, ctor: g[1] === "." ? ef : g[1] === "?" ? nf : g[1] === "@" ? sf : yo }), s.removeAttribute(u);
        } else u.startsWith(Qn) && (l.push({ type: 6, index: r }), s.removeAttribute(u));
        if (yu.test(s.tagName)) {
          const u = s.textContent.split(Qn), d = u.length - 1;
          if (d > 0) {
            s.textContent = ao ? ao.emptyScript : "";
            for (let f = 0; f < d; f++) s.append(u[f], Xs()), yi.nextNode(), l.push({ type: 2, index: ++r });
            s.append(u[d], Xs());
          }
        }
      } else if (s.nodeType === 8) if (s.data === xu) l.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(Qn, u + 1)) !== -1; ) l.push({ type: 7, index: r }), u += Qn.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const n = Mi.createElement("template");
    return n.innerHTML = t, n;
  }
}
function rs(i, t, e = i, n) {
  if (t === ss) return t;
  let s = n !== void 0 ? e._$Co?.[n] : e._$Cl;
  const r = js(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(i), s._$AT(i, e, n)), n !== void 0 ? (e._$Co ??= [])[n] = s : e._$Cl = s), s !== void 0 && (t = rs(i, s._$AS(i, t.values), s, n)), t;
}
class tf {
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
    const { el: { content: e }, parts: n } = this._$AD, s = (t?.creationScope ?? Mi).importNode(e, !0);
    yi.currentNode = s;
    let r = yi.nextNode(), o = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new sr(r, r.nextSibling, this, t) : l.type === 1 ? c = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (c = new rf(r, this, t)), this._$AV.push(c), l = n[++a];
      }
      o !== l?.index && (r = yi.nextNode(), o++);
    }
    return yi.currentNode = Mi, s;
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
    this.type = 2, this._$AH = Lt, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = n, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    t = rs(this, t, e), js(t) ? t === Lt || t == null || t === "" ? (this._$AH !== Lt && this._$AR(), this._$AH = Lt) : t !== this._$AH && t !== ss && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Zd(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== Lt && js(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Mi.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: n } = t, s = typeof n == "number" ? this._$AC(t) : (n.el === void 0 && (n.el = Ys.createElement(Mu(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const r = new tf(s, this), o = r.u(this.options);
      r.p(e), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = _c.get(t.strings);
    return e === void 0 && _c.set(t.strings, e = new Ys(t)), e;
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
      const n = uc(t).nextSibling;
      uc(t).remove(), t = n;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class yo {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, n, s, r) {
    this.type = 1, this._$AH = Lt, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = Lt;
  }
  _$AI(t, e = this, n, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = rs(this, t, e, 0), o = !js(t) || t !== this._$AH && t !== ss, o && (this._$AH = t);
    else {
      const a = t;
      let l, c;
      for (t = r[0], l = 0; l < r.length - 1; l++) c = rs(this, a[n + l], e, l), c === ss && (c = this._$AH[l]), o ||= !js(c) || c !== this._$AH[l], c === Lt ? t = Lt : t !== Lt && (t += (c ?? "") + r[l + 1]), this._$AH[l] = c;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === Lt ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ef extends yo {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === Lt ? void 0 : t;
  }
}
class nf extends yo {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== Lt);
  }
}
class sf extends yo {
  constructor(t, e, n, s, r) {
    super(t, e, n, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = rs(this, t, e, 0) ?? Lt) === ss) return;
    const n = this._$AH, s = t === Lt && n !== Lt || t.capture !== n.capture || t.once !== n.once || t.passive !== n.passive, r = t !== Lt && (n === Lt || s);
    s && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class rf {
  constructor(t, e, n) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    rs(this, t);
  }
}
const of = Ml.litHtmlPolyfillSupport;
of?.(Ys, sr), (Ml.litHtmlVersions ??= []).push("3.3.3");
const af = (i, t, e) => {
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
class Ji extends qi {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = af(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ss;
  }
}
Ji._$litElement$ = !0, Ji.finalized = !0, bl.litElementHydrateSupport?.({ LitElement: Ji });
const lf = bl.litElementPolyfillSupport;
lf?.({ LitElement: Ji });
(bl.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Su = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const cf = { attribute: !0, type: String, converter: oo, reflect: !1, hasChanged: yl }, hf = (i = cf, t, e) => {
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
  return (t, e) => typeof e == "object" ? hf(i, t, e) : ((n, s, r) => {
    const o = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Zt(i) {
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
function df(i, t) {
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
const El = "169", pn = { ROTATE: 0, DOLLY: 1, PAN: 2 }, mn = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, ff = 0, vc = 1, pf = 2, bu = 1, Eu = 2, Un = 3, Hn = 0, je = 1, on = 2, ii = 0, Qi = 1, xc = 2, yc = 3, Mc = 4, mf = 5, vi = 100, gf = 101, _f = 102, vf = 103, xf = 104, yf = 200, Mf = 201, Sf = 202, bf = 203, Sa = 204, ba = 205, Ef = 206, wf = 207, Tf = 208, Af = 209, Rf = 210, Cf = 211, Pf = 212, Lf = 213, If = 214, Ea = 0, wa = 1, Ta = 2, os = 3, Aa = 4, Ra = 5, Ca = 6, Pa = 7, wu = 0, Df = 1, Nf = 2, si = 0, Uf = 1, Of = 2, Ff = 3, Bf = 4, kf = 5, zf = 6, Hf = 7, Sc = "attached", Gf = "detached", Tu = 300, as = 301, ls = 302, La = 303, Ia = 304, Mo = 306, ri = 1e3, ei = 1001, lo = 1002, Ve = 1003, Au = 1004, Fs = 1005, tn = 1006, Jr = 1007, Bn = 1008, Gn = 1009, Ru = 1010, Cu = 1011, qs = 1012, wl = 1013, Si = 1014, _n = 1015, or = 1016, Tl = 1017, Al = 1018, cs = 1020, Pu = 35902, Lu = 1021, Iu = 1022, ln = 1023, Du = 1024, Nu = 1025, ts = 1026, hs = 1027, Rl = 1028, Cl = 1029, Uu = 1030, Pl = 1031, Ll = 1033, Qr = 33776, to = 33777, eo = 33778, no = 33779, Da = 35840, Na = 35841, Ua = 35842, Oa = 35843, Fa = 36196, Ba = 37492, ka = 37496, za = 37808, Ha = 37809, Ga = 37810, Va = 37811, Wa = 37812, $a = 37813, Xa = 37814, ja = 37815, Ya = 37816, qa = 37817, Ka = 37818, Za = 37819, Ja = 37820, Qa = 37821, io = 36492, tl = 36494, el = 36495, Ou = 36283, nl = 36284, il = 36285, sl = 36286, Ks = 2300, Zs = 2301, Lo = 2302, bc = 2400, Ec = 2401, wc = 2402, Vf = 2500, Wf = 0, Fu = 1, rl = 2, $f = 3200, Xf = 3201, Bu = 0, jf = 1, ti = "", ke = "srgb", Oe = "srgb-linear", Il = "display-p3", So = "display-p3-linear", co = "linear", xe = "srgb", ho = "rec709", uo = "p3", Ai = 7680, Tc = 519, Yf = 512, qf = 513, Kf = 514, ku = 515, Zf = 516, Jf = 517, Qf = 518, tp = 519, ol = 35044, Ac = "300 es", kn = 2e3, fo = 2001;
class wi {
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
const zs = Math.PI / 180, us = 180 / Math.PI;
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
function ep(i, t, e, n, s) {
  return n + (i - t) * (s - n) / (e - t);
}
function np(i, t, e) {
  return i !== t ? (e - i) / (t - i) : 0;
}
function Hs(i, t, e) {
  return (1 - e) * i + e * t;
}
function ip(i, t, e, n) {
  return Hs(i, t, 1 - Math.exp(-e * n));
}
function sp(i, t = 1) {
  return t - Math.abs(Dl(i, t * 2) - t);
}
function rp(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
}
function op(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
}
function ap(i, t) {
  return i + Math.floor(Math.random() * (t - i + 1));
}
function lp(i, t) {
  return i + Math.random() * (t - i);
}
function cp(i) {
  return i * (0.5 - Math.random());
}
function hp(i) {
  i !== void 0 && (Rc = i);
  let t = Rc += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function up(i) {
  return i * zs;
}
function dp(i) {
  return i * us;
}
function fp(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function pp(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function mp(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function gp(i, t, e, n, s) {
  const r = Math.cos, o = Math.sin, a = r(e / 2), l = o(e / 2), c = r((t + n) / 2), h = o((t + n) / 2), u = r((t - n) / 2), d = o((t - n) / 2), f = r((n - t) / 2), g = o((n - t) / 2);
  switch (s) {
    case "XYX":
      i.set(a * h, l * u, l * d, a * c);
      break;
    case "YZY":
      i.set(l * d, a * h, l * u, a * c);
      break;
    case "ZXZ":
      i.set(l * u, l * d, a * h, a * c);
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
const es = {
  DEG2RAD: zs,
  RAD2DEG: us,
  generateUUID: cn,
  clamp: Re,
  euclideanModulo: Dl,
  mapLinear: ep,
  inverseLerp: np,
  lerp: Hs,
  damp: ip,
  pingpong: sp,
  smoothstep: rp,
  smootherstep: op,
  randInt: ap,
  randFloat: lp,
  randFloatSpread: cp,
  seededRandom: hp,
  degToRad: up,
  radToDeg: dp,
  isPowerOfTwo: fp,
  ceilPowerOfTwo: pp,
  floorPowerOfTwo: mp,
  setQuaternionFromProperEuler: gp,
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
class Ht {
  constructor(t, e, n, s, r, o, a, l, c) {
    Ht.prototype.isMatrix3 = !0, this.elements = [
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
    const n = t.elements, s = e.elements, r = this.elements, o = n[0], a = n[3], l = n[6], c = n[1], h = n[4], u = n[7], d = n[2], f = n[5], g = n[8], v = s[0], p = s[3], m = s[6], y = s[1], _ = s[4], M = s[7], R = s[2], T = s[5], w = s[8];
    return r[0] = o * v + a * y + l * R, r[3] = o * p + a * _ + l * T, r[6] = o * m + a * M + l * w, r[1] = c * v + h * y + u * R, r[4] = c * p + h * _ + u * T, r[7] = c * m + h * M + u * w, r[2] = d * v + f * y + g * R, r[5] = d * p + f * _ + g * T, r[8] = d * m + f * M + g * w, this;
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
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = h * o - a * c, d = a * l - h * r, f = c * r - o * l, g = e * u + n * d + s * f;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const v = 1 / g;
    return t[0] = u * v, t[1] = (s * c - h * n) * v, t[2] = (a * n - s * o) * v, t[3] = d * v, t[4] = (h * e - s * l) * v, t[5] = (s * r - a * e) * v, t[6] = f * v, t[7] = (n * l - c * e) * v, t[8] = (o * e - n * r) * v, this;
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
    return this.premultiply(Io.makeScale(t, e)), this;
  }
  rotate(t) {
    return this.premultiply(Io.makeRotation(-t)), this;
  }
  translate(t, e) {
    return this.premultiply(Io.makeTranslation(t, e)), this;
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
const Io = /* @__PURE__ */ new Ht();
function zu(i) {
  for (let t = i.length - 1; t >= 0; --t)
    if (i[t] >= 65535) return !0;
  return !1;
}
function Js(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function _p() {
  const i = Js("canvas");
  return i.style.display = "block", i;
}
const Cc = {};
function so(i) {
  i in Cc || (Cc[i] = !0, console.warn(i));
}
function vp(i, t, e) {
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
function xp(i) {
  const t = i.elements;
  t[2] = 0.5 * t[2] + 0.5 * t[3], t[6] = 0.5 * t[6] + 0.5 * t[7], t[10] = 0.5 * t[10] + 0.5 * t[11], t[14] = 0.5 * t[14] + 0.5 * t[15];
}
function yp(i) {
  const t = i.elements;
  t[11] === -1 ? (t[10] = -t[10] - 1, t[14] = -t[14]) : (t[10] = -t[10], t[14] = -t[14] + 1);
}
const Pc = /* @__PURE__ */ new Ht().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), Lc = /* @__PURE__ */ new Ht().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), Ss = {
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
  [So]: {
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
}, Mp = /* @__PURE__ */ new Set([Oe, So]), te = {
  enabled: !0,
  _workingColorSpace: Oe,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(i) {
    if (!Mp.has(i))
      throw new Error(`Unsupported working color space, "${i}".`);
    this._workingColorSpace = i;
  },
  convert: function(i, t, e) {
    if (this.enabled === !1 || t === e || !t || !e)
      return i;
    const n = Ss[t].toReference, s = Ss[e].fromReference;
    return s(n(i));
  },
  fromWorkingColorSpace: function(i, t) {
    return this.convert(i, this._workingColorSpace, t);
  },
  toWorkingColorSpace: function(i, t) {
    return this.convert(i, t, this._workingColorSpace);
  },
  getPrimaries: function(i) {
    return Ss[i].primaries;
  },
  getTransfer: function(i) {
    return i === ti ? co : Ss[i].transfer;
  },
  getLuminanceCoefficients: function(i, t = this._workingColorSpace) {
    return i.fromArray(Ss[t].luminanceCoefficients);
  }
};
function ns(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function Do(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let Ri;
class Sp {
  static getDataURL(t) {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u")
      return t.src;
    let e;
    if (t instanceof HTMLCanvasElement)
      e = t;
    else {
      Ri === void 0 && (Ri = Js("canvas")), Ri.width = t.width, Ri.height = t.height;
      const n = Ri.getContext("2d");
      t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = Ri;
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
        r[o] = ns(r[o] / 255) * 255;
      return n.putImageData(s, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(ns(e[n] / 255) * 255) : e[n] = ns(e[n]);
      return {
        data: e,
        width: t.width,
        height: t.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let bp = 0;
class Hu {
  constructor(t = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: bp++ }), this.uuid = cn(), this.data = t, this.dataReady = !0, this.version = 0;
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
          s[o].isDataTexture ? r.push(No(s[o].image)) : r.push(No(s[o]));
      } else
        r = No(s);
      n.url = r;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function No(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Sp.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let Ep = 0;
class Ce extends wi {
  constructor(t = Ce.DEFAULT_IMAGE, e = Ce.DEFAULT_MAPPING, n = ei, s = ei, r = tn, o = Bn, a = ln, l = Gn, c = Ce.DEFAULT_ANISOTROPY, h = ti) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Ep++ }), this.uuid = cn(), this.name = "", this.source = new Hu(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new nt(0, 0), this.repeat = new nt(1, 1), this.center = new nt(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ht(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
    if (this.mapping !== Tu) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1)
      switch (this.wrapS) {
        case ri:
          t.x = t.x - Math.floor(t.x);
          break;
        case ei:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case lo:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case ri:
          t.y = t.y - Math.floor(t.y);
          break;
        case ei:
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
Ce.DEFAULT_MAPPING = Tu;
Ce.DEFAULT_ANISOTROPY = 1;
class se {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    se.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = n, this.w = s;
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
    const l = t.elements, c = l[0], h = l[4], u = l[8], d = l[1], f = l[5], g = l[9], v = l[2], p = l[6], m = l[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(u - v) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(u + v) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(c + f + m - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const _ = (c + 1) / 2, M = (f + 1) / 2, R = (m + 1) / 2, T = (h + d) / 4, w = (u + v) / 4, C = (g + p) / 4;
      return _ > M && _ > R ? _ < 0.01 ? (n = 0, s = 0.707106781, r = 0.707106781) : (n = Math.sqrt(_), s = T / n, r = w / n) : M > R ? M < 0.01 ? (n = 0.707106781, s = 0, r = 0.707106781) : (s = Math.sqrt(M), n = T / s, r = C / s) : R < 0.01 ? (n = 0.707106781, s = 0.707106781, r = 0) : (r = Math.sqrt(R), n = w / r, s = C / r), this.set(n, s, r, e), this;
    }
    let y = Math.sqrt((p - g) * (p - g) + (u - v) * (u - v) + (d - h) * (d - h));
    return Math.abs(y) < 1e-3 && (y = 1), this.x = (p - g) / y, this.y = (u - v) / y, this.z = (d - h) / y, this.w = Math.acos((c + f + m - 1) / 2), this;
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
class wp extends wi {
  constructor(t = 1, e = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = t, this.height = e, this.depth = 1, this.scissor = new se(0, 0, t, e), this.scissorTest = !1, this.viewport = new se(0, 0, t, e);
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
    return this.texture.source = new Hu(e), this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class bi extends wp {
  constructor(t = 1, e = 1, n = {}) {
    super(t, e, n), this.isWebGLRenderTarget = !0;
  }
}
class Gu extends Ce {
  constructor(t = null, e = 1, n = 1, s = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: t, width: e, height: n, depth: s }, this.magFilter = Ve, this.minFilter = Ve, this.wrapR = ei, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Tp extends Ce {
  constructor(t = null, e = 1, n = 1, s = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: t, width: e, height: n, depth: s }, this.magFilter = Ve, this.minFilter = Ve, this.wrapR = ei, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class Sn {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    this.isQuaternion = !0, this._x = t, this._y = e, this._z = n, this._w = s;
  }
  static slerpFlat(t, e, n, s, r, o, a) {
    let l = n[s + 0], c = n[s + 1], h = n[s + 2], u = n[s + 3];
    const d = r[o + 0], f = r[o + 1], g = r[o + 2], v = r[o + 3];
    if (a === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
      return;
    }
    if (a === 1) {
      t[e + 0] = d, t[e + 1] = f, t[e + 2] = g, t[e + 3] = v;
      return;
    }
    if (u !== v || l !== d || c !== f || h !== g) {
      let p = 1 - a;
      const m = l * d + c * f + h * g + u * v, y = m >= 0 ? 1 : -1, _ = 1 - m * m;
      if (_ > Number.EPSILON) {
        const R = Math.sqrt(_), T = Math.atan2(R, m * y);
        p = Math.sin(p * T) / R, a = Math.sin(a * T) / R;
      }
      const M = a * y;
      if (l = l * p + d * M, c = c * p + f * M, h = h * p + g * M, u = u * p + v * M, p === 1 - a) {
        const R = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
        l *= R, c *= R, h *= R, u *= R;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
  }
  static multiplyQuaternionsFlat(t, e, n, s, r, o) {
    const a = n[s], l = n[s + 1], c = n[s + 2], h = n[s + 3], u = r[o], d = r[o + 1], f = r[o + 2], g = r[o + 3];
    return t[e] = a * g + h * u + l * f - c * d, t[e + 1] = l * g + h * d + c * u - a * f, t[e + 2] = c * g + h * f + a * d - l * u, t[e + 3] = h * g - a * u - l * d - c * f, t;
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
    const n = t._x, s = t._y, r = t._z, o = t._order, a = Math.cos, l = Math.sin, c = a(n / 2), h = a(s / 2), u = a(r / 2), d = l(n / 2), f = l(s / 2), g = l(r / 2);
    switch (o) {
      case "XYZ":
        this._x = d * h * u + c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u - d * f * g;
        break;
      case "YXZ":
        this._x = d * h * u + c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u + d * f * g;
        break;
      case "ZXY":
        this._x = d * h * u - c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u - d * f * g;
        break;
      case "ZYX":
        this._x = d * h * u - c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u + d * f * g;
        break;
      case "YZX":
        this._x = d * h * u + c * f * g, this._y = c * f * u + d * h * g, this._z = c * h * g - d * f * u, this._w = c * h * u - d * f * g;
        break;
      case "XZY":
        this._x = d * h * u - c * f * g, this._y = c * f * u - d * h * g, this._z = c * h * g + d * f * u, this._w = c * h * u + d * f * g;
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
    const e = t.elements, n = e[0], s = e[4], r = e[8], o = e[1], a = e[5], l = e[9], c = e[2], h = e[6], u = e[10], d = n + a + u;
    if (d > 0) {
      const f = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / f, this._x = (h - l) * f, this._y = (r - c) * f, this._z = (o - s) * f;
    } else if (n > a && n > u) {
      const f = 2 * Math.sqrt(1 + n - a - u);
      this._w = (h - l) / f, this._x = 0.25 * f, this._y = (s + o) / f, this._z = (r + c) / f;
    } else if (a > u) {
      const f = 2 * Math.sqrt(1 + a - n - u);
      this._w = (r - c) / f, this._x = (s + o) / f, this._y = 0.25 * f, this._z = (l + h) / f;
    } else {
      const f = 2 * Math.sqrt(1 + u - n - a);
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
    const c = Math.sqrt(l), h = Math.atan2(c, a), u = Math.sin((1 - e) * h) / c, d = Math.sin(e * h) / c;
    return this._w = o * u + this._w * d, this._x = n * u + this._x * d, this._y = s * u + this._y * d, this._z = r * u + this._z * d, this._onChangeCallback(), this;
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
    const e = this.x, n = this.y, s = this.z, r = t.x, o = t.y, a = t.z, l = t.w, c = 2 * (o * s - a * n), h = 2 * (a * e - r * s), u = 2 * (r * n - o * e);
    return this.x = e + l * c + o * u - a * h, this.y = n + l * h + a * c - r * u, this.z = s + l * u + r * h - o * c, this;
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
    return Uo.copy(this).projectOnVector(t), this.sub(Uo);
  }
  reflect(t) {
    return this.sub(Uo.copy(t).multiplyScalar(2 * this.dot(t)));
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
const Uo = /* @__PURE__ */ new P(), Ic = /* @__PURE__ */ new Sn();
class Ye {
  constructor(t = new P(1 / 0, 1 / 0, 1 / 0), e = new P(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = t, this.max = e;
  }
  set(t, e) {
    return this.min.copy(t), this.max.copy(e), this;
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3)
      this.expandByPoint(un.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++)
      this.expandByPoint(un.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++)
      this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    const n = un.copy(e).multiplyScalar(0.5);
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
          t.isMesh === !0 ? t.getVertexPosition(o, un) : un.fromBufferAttribute(r, o), un.applyMatrix4(t.matrixWorld), this.expandByPoint(un);
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
    return this.clampPoint(t.center, un), un.distanceToSquared(t.center) <= t.radius * t.radius;
  }
  intersectsPlane(t) {
    let e, n;
    return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
  }
  intersectsTriangle(t) {
    if (this.isEmpty())
      return !1;
    this.getCenter(bs), pr.subVectors(this.max, bs), Ci.subVectors(t.a, bs), Pi.subVectors(t.b, bs), Li.subVectors(t.c, bs), $n.subVectors(Pi, Ci), Xn.subVectors(Li, Pi), hi.subVectors(Ci, Li);
    let e = [
      0,
      -$n.z,
      $n.y,
      0,
      -Xn.z,
      Xn.y,
      0,
      -hi.z,
      hi.y,
      $n.z,
      0,
      -$n.x,
      Xn.z,
      0,
      -Xn.x,
      hi.z,
      0,
      -hi.x,
      -$n.y,
      $n.x,
      0,
      -Xn.y,
      Xn.x,
      0,
      -hi.y,
      hi.x,
      0
    ];
    return !Oo(e, Ci, Pi, Li, pr) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Oo(e, Ci, Pi, Li, pr)) ? !1 : (mr.crossVectors($n, Xn), e = [mr.x, mr.y, mr.z], Oo(e, Ci, Pi, Li, pr));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, un).distanceTo(t);
  }
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(un).length() * 0.5), t;
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
], un = /* @__PURE__ */ new P(), fr = /* @__PURE__ */ new Ye(), Ci = /* @__PURE__ */ new P(), Pi = /* @__PURE__ */ new P(), Li = /* @__PURE__ */ new P(), $n = /* @__PURE__ */ new P(), Xn = /* @__PURE__ */ new P(), hi = /* @__PURE__ */ new P(), bs = /* @__PURE__ */ new P(), pr = /* @__PURE__ */ new P(), mr = /* @__PURE__ */ new P(), ui = /* @__PURE__ */ new P();
function Oo(i, t, e, n, s) {
  for (let r = 0, o = i.length - 3; r <= o; r += 3) {
    ui.fromArray(i, r);
    const a = s.x * Math.abs(ui.x) + s.y * Math.abs(ui.y) + s.z * Math.abs(ui.z), l = t.dot(ui), c = e.dot(ui), h = n.dot(ui);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a)
      return !1;
  }
  return !0;
}
const Ap = /* @__PURE__ */ new Ye(), Es = /* @__PURE__ */ new P(), Fo = /* @__PURE__ */ new P();
class En {
  constructor(t = new P(), e = -1) {
    this.isSphere = !0, this.center = t, this.radius = e;
  }
  set(t, e) {
    return this.center.copy(t), this.radius = e, this;
  }
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : Ap.setFromPoints(t).getCenter(n);
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
    Es.subVectors(t, this.center);
    const e = Es.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), s = (n - this.radius) * 0.5;
      this.center.addScaledVector(Es, s / n), this.radius += s;
    }
    return this;
  }
  union(t) {
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (Fo.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(Es.copy(t.center).add(Fo)), this.expandByPoint(Es.copy(t.center).sub(Fo))), this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Pn = /* @__PURE__ */ new P(), Bo = /* @__PURE__ */ new P(), gr = /* @__PURE__ */ new P(), jn = /* @__PURE__ */ new P(), ko = /* @__PURE__ */ new P(), _r = /* @__PURE__ */ new P(), zo = /* @__PURE__ */ new P();
class gs {
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
    Bo.copy(t).add(e).multiplyScalar(0.5), gr.copy(e).sub(t).normalize(), jn.copy(this.origin).sub(Bo);
    const r = t.distanceTo(e) * 0.5, o = -this.direction.dot(gr), a = jn.dot(this.direction), l = -jn.dot(gr), c = jn.lengthSq(), h = Math.abs(1 - o * o);
    let u, d, f, g;
    if (h > 0)
      if (u = o * l - a, d = o * a - l, g = r * h, u >= 0)
        if (d >= -g)
          if (d <= g) {
            const v = 1 / h;
            u *= v, d *= v, f = u * (u + o * d + 2 * a) + d * (o * u + d + 2 * l) + c;
          } else
            d = r, u = Math.max(0, -(o * d + a)), f = -u * u + d * (d + 2 * l) + c;
        else
          d = -r, u = Math.max(0, -(o * d + a)), f = -u * u + d * (d + 2 * l) + c;
      else
        d <= -g ? (u = Math.max(0, -(-o * r + a)), d = u > 0 ? -r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c) : d <= g ? (u = 0, d = Math.min(Math.max(-r, -l), r), f = d * (d + 2 * l) + c) : (u = Math.max(0, -(o * r + a)), d = u > 0 ? r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c);
    else
      d = o > 0 ? -r : r, u = Math.max(0, -(o * d + a)), f = -u * u + d * (d + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, u), s && s.copy(Bo).addScaledVector(gr, d), f;
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
    const c = 1 / this.direction.x, h = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
    return c >= 0 ? (n = (t.min.x - d.x) * c, s = (t.max.x - d.x) * c) : (n = (t.max.x - d.x) * c, s = (t.min.x - d.x) * c), h >= 0 ? (r = (t.min.y - d.y) * h, o = (t.max.y - d.y) * h) : (r = (t.max.y - d.y) * h, o = (t.min.y - d.y) * h), n > o || r > s || ((r > n || isNaN(n)) && (n = r), (o < s || isNaN(s)) && (s = o), u >= 0 ? (a = (t.min.z - d.z) * u, l = (t.max.z - d.z) * u) : (a = (t.max.z - d.z) * u, l = (t.min.z - d.z) * u), n > l || a > s) || ((a > n || n !== n) && (n = a), (l < s || s !== s) && (s = l), s < 0) ? null : this.at(n >= 0 ? n : s, e);
  }
  intersectsBox(t) {
    return this.intersectBox(t, Pn) !== null;
  }
  intersectTriangle(t, e, n, s, r) {
    ko.subVectors(e, t), _r.subVectors(n, t), zo.crossVectors(ko, _r);
    let o = this.direction.dot(zo), a;
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
    const c = a * this.direction.dot(ko.cross(jn));
    if (c < 0 || l + c > o)
      return null;
    const h = -a * jn.dot(zo);
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
  constructor(t, e, n, s, r, o, a, l, c, h, u, d, f, g, v, p) {
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
    ], t !== void 0 && this.set(t, e, n, s, r, o, a, l, c, h, u, d, f, g, v, p);
  }
  set(t, e, n, s, r, o, a, l, c, h, u, d, f, g, v, p) {
    const m = this.elements;
    return m[0] = t, m[4] = e, m[8] = n, m[12] = s, m[1] = r, m[5] = o, m[9] = a, m[13] = l, m[2] = c, m[6] = h, m[10] = u, m[14] = d, m[3] = f, m[7] = g, m[11] = v, m[15] = p, this;
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
    const e = this.elements, n = t.elements, s = 1 / Ii.setFromMatrixColumn(t, 0).length(), r = 1 / Ii.setFromMatrixColumn(t, 1).length(), o = 1 / Ii.setFromMatrixColumn(t, 2).length();
    return e[0] = n[0] * s, e[1] = n[1] * s, e[2] = n[2] * s, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * o, e[9] = n[9] * o, e[10] = n[10] * o, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    const e = this.elements, n = t.x, s = t.y, r = t.z, o = Math.cos(n), a = Math.sin(n), l = Math.cos(s), c = Math.sin(s), h = Math.cos(r), u = Math.sin(r);
    if (t.order === "XYZ") {
      const d = o * h, f = o * u, g = a * h, v = a * u;
      e[0] = l * h, e[4] = -l * u, e[8] = c, e[1] = f + g * c, e[5] = d - v * c, e[9] = -a * l, e[2] = v - d * c, e[6] = g + f * c, e[10] = o * l;
    } else if (t.order === "YXZ") {
      const d = l * h, f = l * u, g = c * h, v = c * u;
      e[0] = d + v * a, e[4] = g * a - f, e[8] = o * c, e[1] = o * u, e[5] = o * h, e[9] = -a, e[2] = f * a - g, e[6] = v + d * a, e[10] = o * l;
    } else if (t.order === "ZXY") {
      const d = l * h, f = l * u, g = c * h, v = c * u;
      e[0] = d - v * a, e[4] = -o * u, e[8] = g + f * a, e[1] = f + g * a, e[5] = o * h, e[9] = v - d * a, e[2] = -o * c, e[6] = a, e[10] = o * l;
    } else if (t.order === "ZYX") {
      const d = o * h, f = o * u, g = a * h, v = a * u;
      e[0] = l * h, e[4] = g * c - f, e[8] = d * c + v, e[1] = l * u, e[5] = v * c + d, e[9] = f * c - g, e[2] = -c, e[6] = a * l, e[10] = o * l;
    } else if (t.order === "YZX") {
      const d = o * l, f = o * c, g = a * l, v = a * c;
      e[0] = l * h, e[4] = v - d * u, e[8] = g * u + f, e[1] = u, e[5] = o * h, e[9] = -a * h, e[2] = -c * h, e[6] = f * u + g, e[10] = d - v * u;
    } else if (t.order === "XZY") {
      const d = o * l, f = o * c, g = a * l, v = a * c;
      e[0] = l * h, e[4] = -u, e[8] = c * h, e[1] = d * u + v, e[5] = o * h, e[9] = f * u - g, e[2] = g * u - f, e[6] = a * h, e[10] = v * u + d;
    }
    return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Rp, t, Cp);
  }
  lookAt(t, e, n) {
    const s = this.elements;
    return Je.subVectors(t, e), Je.lengthSq() === 0 && (Je.z = 1), Je.normalize(), Yn.crossVectors(n, Je), Yn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Je.x += 1e-4 : Je.z += 1e-4, Je.normalize(), Yn.crossVectors(n, Je)), Yn.normalize(), vr.crossVectors(Je, Yn), s[0] = Yn.x, s[4] = vr.x, s[8] = Je.x, s[1] = Yn.y, s[5] = vr.y, s[9] = Je.y, s[2] = Yn.z, s[6] = vr.z, s[10] = Je.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements, s = e.elements, r = this.elements, o = n[0], a = n[4], l = n[8], c = n[12], h = n[1], u = n[5], d = n[9], f = n[13], g = n[2], v = n[6], p = n[10], m = n[14], y = n[3], _ = n[7], M = n[11], R = n[15], T = s[0], w = s[4], C = s[8], B = s[12], x = s[1], b = s[5], F = s[9], k = s[13], G = s[2], Z = s[6], W = s[10], et = s[14], $ = s[3], lt = s[7], ut = s[11], Mt = s[15];
    return r[0] = o * T + a * x + l * G + c * $, r[4] = o * w + a * b + l * Z + c * lt, r[8] = o * C + a * F + l * W + c * ut, r[12] = o * B + a * k + l * et + c * Mt, r[1] = h * T + u * x + d * G + f * $, r[5] = h * w + u * b + d * Z + f * lt, r[9] = h * C + u * F + d * W + f * ut, r[13] = h * B + u * k + d * et + f * Mt, r[2] = g * T + v * x + p * G + m * $, r[6] = g * w + v * b + p * Z + m * lt, r[10] = g * C + v * F + p * W + m * ut, r[14] = g * B + v * k + p * et + m * Mt, r[3] = y * T + _ * x + M * G + R * $, r[7] = y * w + _ * b + M * Z + R * lt, r[11] = y * C + _ * F + M * W + R * ut, r[15] = y * B + _ * k + M * et + R * Mt, this;
  }
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
  }
  determinant() {
    const t = this.elements, e = t[0], n = t[4], s = t[8], r = t[12], o = t[1], a = t[5], l = t[9], c = t[13], h = t[2], u = t[6], d = t[10], f = t[14], g = t[3], v = t[7], p = t[11], m = t[15];
    return g * (+r * l * u - s * c * u - r * a * d + n * c * d + s * a * f - n * l * f) + v * (+e * l * f - e * c * d + r * o * d - s * o * f + s * c * h - r * l * h) + p * (+e * c * u - e * a * f - r * o * u + n * o * f + r * a * h - n * c * h) + m * (-s * a * h - e * l * u + e * a * d + s * o * u - n * o * d + n * l * h);
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
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = t[9], d = t[10], f = t[11], g = t[12], v = t[13], p = t[14], m = t[15], y = u * p * c - v * d * c + v * l * f - a * p * f - u * l * m + a * d * m, _ = g * d * c - h * p * c - g * l * f + o * p * f + h * l * m - o * d * m, M = h * v * c - g * u * c + g * a * f - o * v * f - h * a * m + o * u * m, R = g * u * l - h * v * l - g * a * d + o * v * d + h * a * p - o * u * p, T = e * y + n * _ + s * M + r * R;
    if (T === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const w = 1 / T;
    return t[0] = y * w, t[1] = (v * d * r - u * p * r - v * s * f + n * p * f + u * s * m - n * d * m) * w, t[2] = (a * p * r - v * l * r + v * s * c - n * p * c - a * s * m + n * l * m) * w, t[3] = (u * l * r - a * d * r - u * s * c + n * d * c + a * s * f - n * l * f) * w, t[4] = _ * w, t[5] = (h * p * r - g * d * r + g * s * f - e * p * f - h * s * m + e * d * m) * w, t[6] = (g * l * r - o * p * r - g * s * c + e * p * c + o * s * m - e * l * m) * w, t[7] = (o * d * r - h * l * r + h * s * c - e * d * c - o * s * f + e * l * f) * w, t[8] = M * w, t[9] = (g * u * r - h * v * r - g * n * f + e * v * f + h * n * m - e * u * m) * w, t[10] = (o * v * r - g * a * r + g * n * c - e * v * c - o * n * m + e * a * m) * w, t[11] = (h * a * r - o * u * r - h * n * c + e * u * c + o * n * f - e * a * f) * w, t[12] = R * w, t[13] = (h * v * s - g * u * s + g * n * d - e * v * d - h * n * p + e * u * p) * w, t[14] = (g * a * s - o * v * s - g * n * l + e * v * l + o * n * p - e * a * p) * w, t[15] = (o * u * s - h * a * s + h * n * l - e * u * l - o * n * d + e * a * d) * w, this;
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
    const s = this.elements, r = e._x, o = e._y, a = e._z, l = e._w, c = r + r, h = o + o, u = a + a, d = r * c, f = r * h, g = r * u, v = o * h, p = o * u, m = a * u, y = l * c, _ = l * h, M = l * u, R = n.x, T = n.y, w = n.z;
    return s[0] = (1 - (v + m)) * R, s[1] = (f + M) * R, s[2] = (g - _) * R, s[3] = 0, s[4] = (f - M) * T, s[5] = (1 - (d + m)) * T, s[6] = (p + y) * T, s[7] = 0, s[8] = (g + _) * w, s[9] = (p - y) * w, s[10] = (1 - (d + v)) * w, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this;
  }
  decompose(t, e, n) {
    const s = this.elements;
    let r = Ii.set(s[0], s[1], s[2]).length();
    const o = Ii.set(s[4], s[5], s[6]).length(), a = Ii.set(s[8], s[9], s[10]).length();
    this.determinant() < 0 && (r = -r), t.x = s[12], t.y = s[13], t.z = s[14], dn.copy(this);
    const c = 1 / r, h = 1 / o, u = 1 / a;
    return dn.elements[0] *= c, dn.elements[1] *= c, dn.elements[2] *= c, dn.elements[4] *= h, dn.elements[5] *= h, dn.elements[6] *= h, dn.elements[8] *= u, dn.elements[9] *= u, dn.elements[10] *= u, e.setFromRotationMatrix(dn), n.x = r, n.y = o, n.z = a, this;
  }
  makePerspective(t, e, n, s, r, o, a = kn) {
    const l = this.elements, c = 2 * r / (e - t), h = 2 * r / (n - s), u = (e + t) / (e - t), d = (n + s) / (n - s);
    let f, g;
    if (a === kn)
      f = -(o + r) / (o - r), g = -2 * o * r / (o - r);
    else if (a === fo)
      f = -o / (o - r), g = -o * r / (o - r);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + a);
    return l[0] = c, l[4] = 0, l[8] = u, l[12] = 0, l[1] = 0, l[5] = h, l[9] = d, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = f, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(t, e, n, s, r, o, a = kn) {
    const l = this.elements, c = 1 / (e - t), h = 1 / (n - s), u = 1 / (o - r), d = (e + t) * c, f = (n + s) * h;
    let g, v;
    if (a === kn)
      g = (o + r) * u, v = -2 * u;
    else if (a === fo)
      g = r * u, v = -1 * u;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + a);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -d, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -f, l[2] = 0, l[6] = 0, l[10] = v, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
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
const Ii = /* @__PURE__ */ new P(), dn = /* @__PURE__ */ new Ft(), Rp = /* @__PURE__ */ new P(0, 0, 0), Cp = /* @__PURE__ */ new P(1, 1, 1), Yn = /* @__PURE__ */ new P(), vr = /* @__PURE__ */ new P(), Je = /* @__PURE__ */ new P(), Dc = /* @__PURE__ */ new Ft(), Nc = /* @__PURE__ */ new Sn();
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
    const s = t.elements, r = s[0], o = s[4], a = s[8], l = s[1], c = s[5], h = s[9], u = s[2], d = s[6], f = s[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Re(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-o, r)) : (this._x = Math.atan2(d, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Re(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, f), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Re(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Re(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-o, c));
        break;
      case "YZX":
        this._z = Math.asin(Re(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(a, f));
        break;
      case "XZY":
        this._z = Math.asin(-Re(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(a, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
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
let Pp = 0;
const Uc = /* @__PURE__ */ new P(), Di = /* @__PURE__ */ new Sn(), Ln = /* @__PURE__ */ new Ft(), xr = /* @__PURE__ */ new P(), ws = /* @__PURE__ */ new P(), Lp = /* @__PURE__ */ new P(), Ip = /* @__PURE__ */ new Sn(), Oc = /* @__PURE__ */ new P(1, 0, 0), Fc = /* @__PURE__ */ new P(0, 1, 0), Bc = /* @__PURE__ */ new P(0, 0, 1), kc = { type: "added" }, Dp = { type: "removed" }, Ni = { type: "childadded", child: null }, Ho = { type: "childremoved", child: null };
class ye extends wi {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Pp++ }), this.uuid = cn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = ye.DEFAULT_UP.clone();
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
        value: new Ht()
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
    return Di.setFromAxisAngle(t, e), this.quaternion.multiply(Di), this;
  }
  rotateOnWorldAxis(t, e) {
    return Di.setFromAxisAngle(t, e), this.quaternion.premultiply(Di), this;
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
    this.updateWorldMatrix(!0, !1), ws.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Ln.lookAt(ws, xr, this.up) : Ln.lookAt(xr, ws, this.up), this.quaternion.setFromRotationMatrix(Ln), s && (Ln.extractRotation(s.matrixWorld), Di.setFromRotationMatrix(Ln), this.quaternion.premultiply(Di.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++)
        this.add(arguments[e]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(kc), Ni.child = t, this.dispatchEvent(Ni), Ni.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Dp), Ho.child = t, this.dispatchEvent(Ho), Ho.child = null), this;
  }
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(!0, !1), Ln.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), Ln.multiply(t.parent.matrixWorld)), t.applyMatrix4(Ln), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(kc), Ni.child = t, this.dispatchEvent(Ni), Ni.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ws, t, Lp), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ws, Ip, t), t;
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
            const u = l[c];
            r(t.shapes, u);
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
      const a = o(t.geometries), l = o(t.materials), c = o(t.textures), h = o(t.images), u = o(t.shapes), d = o(t.skeletons), f = o(t.animations), g = o(t.nodes);
      a.length > 0 && (n.geometries = a), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), g.length > 0 && (n.nodes = g);
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
const fn = /* @__PURE__ */ new P(), In = /* @__PURE__ */ new P(), Go = /* @__PURE__ */ new P(), Dn = /* @__PURE__ */ new P(), Ui = /* @__PURE__ */ new P(), Oi = /* @__PURE__ */ new P(), zc = /* @__PURE__ */ new P(), Vo = /* @__PURE__ */ new P(), Wo = /* @__PURE__ */ new P(), $o = /* @__PURE__ */ new P(), Xo = /* @__PURE__ */ new se(), jo = /* @__PURE__ */ new se(), Yo = /* @__PURE__ */ new se();
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
    fn.subVectors(s, e), In.subVectors(n, e), Go.subVectors(t, e);
    const o = fn.dot(fn), a = fn.dot(In), l = fn.dot(Go), c = In.dot(In), h = In.dot(Go), u = o * c - a * a;
    if (u === 0)
      return r.set(0, 0, 0), null;
    const d = 1 / u, f = (c * l - a * h) * d, g = (o * h - a * l) * d;
    return r.set(1 - f - g, g, f);
  }
  static containsPoint(t, e, n, s) {
    return this.getBarycoord(t, e, n, s, Dn) === null ? !1 : Dn.x >= 0 && Dn.y >= 0 && Dn.x + Dn.y <= 1;
  }
  static getInterpolation(t, e, n, s, r, o, a, l) {
    return this.getBarycoord(t, e, n, s, Dn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, Dn.x), l.addScaledVector(o, Dn.y), l.addScaledVector(a, Dn.z), l);
  }
  static getInterpolatedAttribute(t, e, n, s, r, o) {
    return Xo.setScalar(0), jo.setScalar(0), Yo.setScalar(0), Xo.fromBufferAttribute(t, e), jo.fromBufferAttribute(t, n), Yo.fromBufferAttribute(t, s), o.setScalar(0), o.addScaledVector(Xo, r.x), o.addScaledVector(jo, r.y), o.addScaledVector(Yo, r.z), o;
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
    Ui.subVectors(s, n), Oi.subVectors(r, n), Vo.subVectors(t, n);
    const l = Ui.dot(Vo), c = Oi.dot(Vo);
    if (l <= 0 && c <= 0)
      return e.copy(n);
    Wo.subVectors(t, s);
    const h = Ui.dot(Wo), u = Oi.dot(Wo);
    if (h >= 0 && u <= h)
      return e.copy(s);
    const d = l * u - h * c;
    if (d <= 0 && l >= 0 && h <= 0)
      return o = l / (l - h), e.copy(n).addScaledVector(Ui, o);
    $o.subVectors(t, r);
    const f = Ui.dot($o), g = Oi.dot($o);
    if (g >= 0 && f <= g)
      return e.copy(r);
    const v = f * c - l * g;
    if (v <= 0 && c >= 0 && g <= 0)
      return a = c / (c - g), e.copy(n).addScaledVector(Oi, a);
    const p = h * g - f * u;
    if (p <= 0 && u - h >= 0 && f - g >= 0)
      return zc.subVectors(r, s), a = (u - h) / (u - h + (f - g)), e.copy(s).addScaledVector(zc, a);
    const m = 1 / (p + v + d);
    return o = v * m, a = d * m, e.copy(n).addScaledVector(Ui, o).addScaledVector(Oi, a);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const Vu = {
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
function qo(i, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
}
class Tt {
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
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, te.toWorkingColorSpace(this, e), this;
  }
  setRGB(t, e, n, s = te.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, te.toWorkingColorSpace(this, s), this;
  }
  setHSL(t, e, n, s = te.workingColorSpace) {
    if (t = Dl(t, 1), e = Re(e, 0, 1), n = Re(n, 0, 1), e === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, o = 2 * n - r;
      this.r = qo(o, r, t + 1 / 3), this.g = qo(o, r, t), this.b = qo(o, r, t - 1 / 3);
    }
    return te.toWorkingColorSpace(this, s), this;
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
    const n = Vu[t.toLowerCase()];
    return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return this.r = t.r, this.g = t.g, this.b = t.b, this;
  }
  copySRGBToLinear(t) {
    return this.r = ns(t.r), this.g = ns(t.g), this.b = ns(t.b), this;
  }
  copyLinearToSRGB(t) {
    return this.r = Do(t.r), this.g = Do(t.g), this.b = Do(t.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(t = ke) {
    return te.fromWorkingColorSpace(Be.copy(this), t), Math.round(Re(Be.r * 255, 0, 255)) * 65536 + Math.round(Re(Be.g * 255, 0, 255)) * 256 + Math.round(Re(Be.b * 255, 0, 255));
  }
  getHexString(t = ke) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = te.workingColorSpace) {
    te.fromWorkingColorSpace(Be.copy(this), e);
    const n = Be.r, s = Be.g, r = Be.b, o = Math.max(n, s, r), a = Math.min(n, s, r);
    let l, c;
    const h = (a + o) / 2;
    if (a === o)
      l = 0, c = 0;
    else {
      const u = o - a;
      switch (c = h <= 0.5 ? u / (o + a) : u / (2 - o - a), o) {
        case n:
          l = (s - r) / u + (s < r ? 6 : 0);
          break;
        case s:
          l = (r - n) / u + 2;
          break;
        case r:
          l = (n - s) / u + 4;
          break;
      }
      l /= 6;
    }
    return t.h = l, t.s = c, t.l = h, t;
  }
  getRGB(t, e = te.workingColorSpace) {
    return te.fromWorkingColorSpace(Be.copy(this), e), t.r = Be.r, t.g = Be.g, t.b = Be.b, t;
  }
  getStyle(t = ke) {
    te.fromWorkingColorSpace(Be.copy(this), t);
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
const Be = /* @__PURE__ */ new Tt();
Tt.NAMES = Vu;
let Np = 0;
class vn extends wi {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Np++ }), this.uuid = cn(), this.name = "", this.type = "Material", this.blending = Qi, this.side = Hn, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = Sa, this.blendDst = ba, this.blendEquation = vi, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Tt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = os, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Tc, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Ai, this.stencilZFail = Ai, this.stencilZPass = Ai, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Qi && (n.blending = this.blending), this.side !== Hn && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== Sa && (n.blendSrc = this.blendSrc), this.blendDst !== ba && (n.blendDst = this.blendDst), this.blendEquation !== vi && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== os && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Tc && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Ai && (n.stencilFail = this.stencilFail), this.stencilZFail !== Ai && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Ai && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
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
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Tt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new bn(), this.combine = wu, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(t);
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
    this.isBufferAttribute = !0, this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = ol, this.updateRanges = [], this.gpuType = _n, this.version = 0;
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
    return this.name !== "" && (t.name = this.name), this.usage !== ol && (t.usage = this.usage), t;
  }
}
class Wu extends Ue {
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class $u extends Ue {
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class de extends Ue {
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let Up = 0;
const sn = /* @__PURE__ */ new Ft(), Ko = /* @__PURE__ */ new ye(), Fi = /* @__PURE__ */ new P(), Qe = /* @__PURE__ */ new Ye(), Ts = /* @__PURE__ */ new Ye(), De = /* @__PURE__ */ new P();
class Ie extends wi {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Up++ }), this.uuid = cn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (zu(t) ? $u : Wu)(t, 1) : this.index = t, this;
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
      const r = new Ht().getNormalMatrix(t);
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
    return Ko.lookAt(t), Ko.updateMatrix(), this.applyMatrix4(Ko.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Fi).negate(), this.translate(Fi.x, Fi.y, Fi.z), this;
  }
  setFromPoints(t) {
    const e = [];
    for (let n = 0, s = t.length; n < s; n++) {
      const r = t[n];
      e.push(r.x, r.y, r.z || 0);
    }
    return this.setAttribute("position", new de(e, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Ye());
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
          Ts.setFromBufferAttribute(a), this.morphTargetsRelative ? (De.addVectors(Qe.min, Ts.min), Qe.expandByPoint(De), De.addVectors(Qe.max, Ts.max), Qe.expandByPoint(De)) : (Qe.expandByPoint(Ts.min), Qe.expandByPoint(Ts.max));
        }
      Qe.getCenter(n);
      let s = 0;
      for (let r = 0, o = t.count; r < o; r++)
        De.fromBufferAttribute(t, r), s = Math.max(s, n.distanceToSquared(De));
      if (e)
        for (let r = 0, o = e.length; r < o; r++) {
          const a = e[r], l = this.morphTargetsRelative;
          for (let c = 0, h = a.count; c < h; c++)
            De.fromBufferAttribute(a, c), l && (Fi.fromBufferAttribute(t, c), De.add(Fi)), s = Math.max(s, n.distanceToSquared(De));
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
    for (let C = 0; C < n.count; C++)
      a[C] = new P(), l[C] = new P();
    const c = new P(), h = new P(), u = new P(), d = new nt(), f = new nt(), g = new nt(), v = new P(), p = new P();
    function m(C, B, x) {
      c.fromBufferAttribute(n, C), h.fromBufferAttribute(n, B), u.fromBufferAttribute(n, x), d.fromBufferAttribute(r, C), f.fromBufferAttribute(r, B), g.fromBufferAttribute(r, x), h.sub(c), u.sub(c), f.sub(d), g.sub(d);
      const b = 1 / (f.x * g.y - g.x * f.y);
      isFinite(b) && (v.copy(h).multiplyScalar(g.y).addScaledVector(u, -f.y).multiplyScalar(b), p.copy(u).multiplyScalar(f.x).addScaledVector(h, -g.x).multiplyScalar(b), a[C].add(v), a[B].add(v), a[x].add(v), l[C].add(p), l[B].add(p), l[x].add(p));
    }
    let y = this.groups;
    y.length === 0 && (y = [{
      start: 0,
      count: t.count
    }]);
    for (let C = 0, B = y.length; C < B; ++C) {
      const x = y[C], b = x.start, F = x.count;
      for (let k = b, G = b + F; k < G; k += 3)
        m(
          t.getX(k + 0),
          t.getX(k + 1),
          t.getX(k + 2)
        );
    }
    const _ = new P(), M = new P(), R = new P(), T = new P();
    function w(C) {
      R.fromBufferAttribute(s, C), T.copy(R);
      const B = a[C];
      _.copy(B), _.sub(R.multiplyScalar(R.dot(B))).normalize(), M.crossVectors(T, B);
      const b = M.dot(l[C]) < 0 ? -1 : 1;
      o.setXYZW(C, _.x, _.y, _.z, b);
    }
    for (let C = 0, B = y.length; C < B; ++C) {
      const x = y[C], b = x.start, F = x.count;
      for (let k = b, G = b + F; k < G; k += 3)
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
        for (let d = 0, f = n.count; d < f; d++)
          n.setXYZ(d, 0, 0, 0);
      const s = new P(), r = new P(), o = new P(), a = new P(), l = new P(), c = new P(), h = new P(), u = new P();
      if (t)
        for (let d = 0, f = t.count; d < f; d += 3) {
          const g = t.getX(d + 0), v = t.getX(d + 1), p = t.getX(d + 2);
          s.fromBufferAttribute(e, g), r.fromBufferAttribute(e, v), o.fromBufferAttribute(e, p), h.subVectors(o, r), u.subVectors(s, r), h.cross(u), a.fromBufferAttribute(n, g), l.fromBufferAttribute(n, v), c.fromBufferAttribute(n, p), a.add(h), l.add(h), c.add(h), n.setXYZ(g, a.x, a.y, a.z), n.setXYZ(v, l.x, l.y, l.z), n.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let d = 0, f = e.count; d < f; d += 3)
          s.fromBufferAttribute(e, d + 0), r.fromBufferAttribute(e, d + 1), o.fromBufferAttribute(e, d + 2), h.subVectors(o, r), u.subVectors(s, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
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
      const c = a.array, h = a.itemSize, u = a.normalized, d = new c.constructor(l.length * h);
      let f = 0, g = 0;
      for (let v = 0, p = l.length; v < p; v++) {
        a.isInterleavedBufferAttribute ? f = l[v] * a.data.stride + a.offset : f = l[v] * h;
        for (let m = 0; m < h; m++)
          d[g++] = c[f++];
      }
      return new Ue(d, h, u);
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
      for (let h = 0, u = c.length; h < u; h++) {
        const d = c[h], f = t(d, n);
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
      for (let u = 0, d = c.length; u < d; u++) {
        const f = c[u];
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
      const h = [], u = r[c];
      for (let d = 0, f = u.length; d < f; d++)
        h.push(u[d].clone(e));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const o = t.groups;
    for (let c = 0, h = o.length; c < h; c++) {
      const u = o[c];
      this.addGroup(u.start, u.count, u.materialIndex);
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
const Hc = /* @__PURE__ */ new Ft(), di = /* @__PURE__ */ new gs(), Sr = /* @__PURE__ */ new En(), Gc = /* @__PURE__ */ new P(), br = /* @__PURE__ */ new P(), Er = /* @__PURE__ */ new P(), wr = /* @__PURE__ */ new P(), Zo = /* @__PURE__ */ new P(), Tr = /* @__PURE__ */ new P(), Vc = /* @__PURE__ */ new P(), Ar = /* @__PURE__ */ new P();
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
        const h = a[l], u = r[l];
        h !== 0 && (Zo.fromBufferAttribute(u, t), o ? Tr.addScaledVector(Zo, h) : Tr.addScaledVector(Zo.sub(e), h));
      }
      e.add(Tr);
    }
    return e;
  }
  raycast(t, e) {
    const n = this.geometry, s = this.material, r = this.matrixWorld;
    s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Sr.copy(n.boundingSphere), Sr.applyMatrix4(r), di.copy(t.ray).recast(t.near), !(Sr.containsPoint(di.origin) === !1 && (di.intersectSphere(Sr, Gc) === null || di.origin.distanceToSquared(Gc) > (t.far - t.near) ** 2)) && (Hc.copy(r).invert(), di.copy(t.ray).applyMatrix4(Hc), !(n.boundingBox !== null && di.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(t, e, di)));
  }
  _computeIntersections(t, e, n) {
    let s;
    const r = this.geometry, o = this.material, a = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, u = r.attributes.normal, d = r.groups, f = r.drawRange;
    if (a !== null)
      if (Array.isArray(o))
        for (let g = 0, v = d.length; g < v; g++) {
          const p = d[g], m = o[p.materialIndex], y = Math.max(p.start, f.start), _ = Math.min(a.count, Math.min(p.start + p.count, f.start + f.count));
          for (let M = y, R = _; M < R; M += 3) {
            const T = a.getX(M), w = a.getX(M + 1), C = a.getX(M + 2);
            s = Rr(this, m, t, n, c, h, u, T, w, C), s && (s.faceIndex = Math.floor(M / 3), s.face.materialIndex = p.materialIndex, e.push(s));
          }
        }
      else {
        const g = Math.max(0, f.start), v = Math.min(a.count, f.start + f.count);
        for (let p = g, m = v; p < m; p += 3) {
          const y = a.getX(p), _ = a.getX(p + 1), M = a.getX(p + 2);
          s = Rr(this, o, t, n, c, h, u, y, _, M), s && (s.faceIndex = Math.floor(p / 3), e.push(s));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(o))
        for (let g = 0, v = d.length; g < v; g++) {
          const p = d[g], m = o[p.materialIndex], y = Math.max(p.start, f.start), _ = Math.min(l.count, Math.min(p.start + p.count, f.start + f.count));
          for (let M = y, R = _; M < R; M += 3) {
            const T = M, w = M + 1, C = M + 2;
            s = Rr(this, m, t, n, c, h, u, T, w, C), s && (s.faceIndex = Math.floor(M / 3), s.face.materialIndex = p.materialIndex, e.push(s));
          }
        }
      else {
        const g = Math.max(0, f.start), v = Math.min(l.count, f.start + f.count);
        for (let p = g, m = v; p < m; p += 3) {
          const y = p, _ = p + 1, M = p + 2;
          s = Rr(this, o, t, n, c, h, u, y, _, M), s && (s.faceIndex = Math.floor(p / 3), e.push(s));
        }
      }
  }
}
function Op(i, t, e, n, s, r, o, a) {
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
  const h = Op(i, t, e, n, br, Er, wr, Vc);
  if (h) {
    const u = new P();
    an.getBarycoord(Vc, br, Er, wr, u), s && (h.uv = an.getInterpolatedAttribute(s, a, l, c, u, new nt())), r && (h.uv1 = an.getInterpolatedAttribute(r, a, l, c, u, new nt())), o && (h.normal = an.getInterpolatedAttribute(o, a, l, c, u, new P()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = {
      a,
      b: l,
      c,
      normal: new P(),
      materialIndex: 0
    };
    an.getNormal(br, Er, wr, d.normal), h.face = d, h.barycoord = u;
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
    const l = [], c = [], h = [], u = [];
    let d = 0, f = 0;
    g("z", "y", "x", -1, -1, n, e, t, o, r, 0), g("z", "y", "x", 1, -1, n, e, -t, o, r, 1), g("x", "z", "y", 1, 1, t, n, e, s, o, 2), g("x", "z", "y", 1, -1, t, n, -e, s, o, 3), g("x", "y", "z", 1, -1, t, e, n, s, r, 4), g("x", "y", "z", -1, -1, t, e, -n, s, r, 5), this.setIndex(l), this.setAttribute("position", new de(c, 3)), this.setAttribute("normal", new de(h, 3)), this.setAttribute("uv", new de(u, 2));
    function g(v, p, m, y, _, M, R, T, w, C, B) {
      const x = M / w, b = R / C, F = M / 2, k = R / 2, G = T / 2, Z = w + 1, W = C + 1;
      let et = 0, $ = 0;
      const lt = new P();
      for (let ut = 0; ut < W; ut++) {
        const Mt = ut * b - k;
        for (let ee = 0; ee < Z; ee++) {
          const ae = ee * x - F;
          lt[v] = ae * y, lt[p] = Mt * _, lt[m] = G, c.push(lt.x, lt.y, lt.z), lt[v] = 0, lt[p] = 0, lt[m] = T > 0 ? 1 : -1, h.push(lt.x, lt.y, lt.z), u.push(ee / w), u.push(1 - ut / C), et += 1;
        }
      }
      for (let ut = 0; ut < C; ut++)
        for (let Mt = 0; Mt < w; Mt++) {
          const ee = d + Mt + Z * ut, ae = d + Mt + Z * (ut + 1), j = d + (Mt + 1) + Z * (ut + 1), it = d + (Mt + 1) + Z * ut;
          l.push(ee, ae, it), l.push(ae, j, it), $ += 6;
        }
      a.addGroup(f, $, B), f += $, d += et;
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
function Fp(i) {
  const t = [];
  for (let e = 0; e < i.length; e++)
    t.push(i[e].clone());
  return t;
}
function Xu(i) {
  const t = i.getRenderTarget();
  return t === null ? i.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : te.workingColorSpace;
}
const Bp = { clone: ds, merge: Ge };
var kp = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, zp = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class oi extends vn {
  constructor(t) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = kp, this.fragmentShader = zp, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = ds(t.uniforms), this.uniformsGroups = Fp(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
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
class ju extends ye {
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
const Kn = /* @__PURE__ */ new P(), Wc = /* @__PURE__ */ new nt(), $c = /* @__PURE__ */ new nt();
class ze extends ju {
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
    this.fov = us * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const t = Math.tan(zs * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  getEffectiveFOV() {
    return us * 2 * Math.atan(
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
    Kn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(Kn.x, Kn.y).multiplyScalar(-t / Kn.z), Kn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Kn.x, Kn.y).multiplyScalar(-t / Kn.z);
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
const Bi = -90, ki = 1;
class Hp extends ye {
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const s = new ze(Bi, ki, t, e);
    s.layers = this.layers, this.add(s);
    const r = new ze(Bi, ki, t, e);
    r.layers = this.layers, this.add(r);
    const o = new ze(Bi, ki, t, e);
    o.layers = this.layers, this.add(o);
    const a = new ze(Bi, ki, t, e);
    a.layers = this.layers, this.add(a);
    const l = new ze(Bi, ki, t, e);
    l.layers = this.layers, this.add(l);
    const c = new ze(Bi, ki, t, e);
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
    const [r, o, a, l, c, h] = this.children, u = t.getRenderTarget(), d = t.getActiveCubeFace(), f = t.getActiveMipmapLevel(), g = t.xr.enabled;
    t.xr.enabled = !1;
    const v = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, t.setRenderTarget(n, 0, s), t.render(e, r), t.setRenderTarget(n, 1, s), t.render(e, o), t.setRenderTarget(n, 2, s), t.render(e, a), t.setRenderTarget(n, 3, s), t.render(e, l), t.setRenderTarget(n, 4, s), t.render(e, c), n.texture.generateMipmaps = v, t.setRenderTarget(n, 5, s), t.render(e, h), t.setRenderTarget(u, d, f), t.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class Yu extends Ce {
  constructor(t, e, n, s, r, o, a, l, c, h) {
    t = t !== void 0 ? t : [], e = e !== void 0 ? e : as, super(t, e, n, s, r, o, a, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class Gp extends bi {
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = !0;
    const n = { width: t, height: t, depth: 1 }, s = [n, n, n, n, n, n];
    this.texture = new Yu(s, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = e.generateMipmaps !== void 0 ? e.generateMipmaps : !1, this.texture.minFilter = e.minFilter !== void 0 ? e.minFilter : tn;
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
    }, s = new Vn(5, 5, 5), r = new oi({
      name: "CubemapFromEquirect",
      uniforms: ds(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: je,
      blending: ii
    });
    r.uniforms.tEquirect.value = e;
    const o = new ge(s, r), a = e.minFilter;
    return e.minFilter === Bn && (e.minFilter = tn), new Hp(1, 10, this).update(t, o), e.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
  }
  clear(t, e, n, s) {
    const r = t.getRenderTarget();
    for (let o = 0; o < 6; o++)
      t.setRenderTarget(this, o), t.clear(e, n, s);
    t.setRenderTarget(r);
  }
}
const Jo = /* @__PURE__ */ new P(), Vp = /* @__PURE__ */ new P(), Wp = /* @__PURE__ */ new Ht();
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
    const s = Jo.subVectors(n, e).cross(Vp.subVectors(t, e)).normalize();
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
    const n = t.delta(Jo), s = this.normal.dot(n);
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
    const n = e || Wp.getNormalMatrix(t), s = this.coplanarPoint(Jo).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
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
const fi = /* @__PURE__ */ new En(), Cr = /* @__PURE__ */ new P();
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
    const n = this.planes, s = t.elements, r = s[0], o = s[1], a = s[2], l = s[3], c = s[4], h = s[5], u = s[6], d = s[7], f = s[8], g = s[9], v = s[10], p = s[11], m = s[12], y = s[13], _ = s[14], M = s[15];
    if (n[0].setComponents(l - r, d - c, p - f, M - m).normalize(), n[1].setComponents(l + r, d + c, p + f, M + m).normalize(), n[2].setComponents(l + o, d + h, p + g, M + y).normalize(), n[3].setComponents(l - o, d - h, p - g, M - y).normalize(), n[4].setComponents(l - a, d - u, p - v, M - _).normalize(), e === kn)
      n[5].setComponents(l + a, d + u, p + v, M + _).normalize();
    else if (e === fo)
      n[5].setComponents(a, u, v, _).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0)
      t.boundingSphere === null && t.computeBoundingSphere(), fi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), fi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(fi);
  }
  intersectsSprite(t) {
    return fi.center.set(0, 0, 0), fi.radius = 0.7071067811865476, fi.applyMatrix4(t.matrixWorld), this.intersectsSphere(fi);
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
function qu() {
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
function $p(i) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(a, l) {
    const c = a.array, h = a.usage, u = c.byteLength, d = i.createBuffer();
    i.bindBuffer(l, d), i.bufferData(l, c, h), a.onUploadCallback();
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
      buffer: d,
      type: f,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: a.version,
      size: u
    };
  }
  function n(a, l, c) {
    const h = l.array, u = l.updateRanges;
    if (i.bindBuffer(c, a), u.length === 0)
      i.bufferSubData(c, 0, h);
    else {
      u.sort((f, g) => f.start - g.start);
      let d = 0;
      for (let f = 1; f < u.length; f++) {
        const g = u[d], v = u[f];
        v.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          v.start + v.count - g.start
        ) : (++d, u[d] = v);
      }
      u.length = d + 1;
      for (let f = 0, g = u.length; f < g; f++) {
        const v = u[f];
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
    const r = t / 2, o = e / 2, a = Math.floor(n), l = Math.floor(s), c = a + 1, h = l + 1, u = t / a, d = e / l, f = [], g = [], v = [], p = [];
    for (let m = 0; m < h; m++) {
      const y = m * d - o;
      for (let _ = 0; _ < c; _++) {
        const M = _ * u - r;
        g.push(M, -y, 0), v.push(0, 0, 1), p.push(_ / a), p.push(1 - m / l);
      }
    }
    for (let m = 0; m < l; m++)
      for (let y = 0; y < a; y++) {
        const _ = y + c * m, M = y + c * (m + 1), R = y + 1 + c * (m + 1), T = y + 1 + c * m;
        f.push(_, M, T), f.push(M, R, T);
      }
    this.setIndex(f), this.setAttribute("position", new de(g, 3)), this.setAttribute("normal", new de(v, 3)), this.setAttribute("uv", new de(p, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new ar(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
var Xp = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, jp = `#ifdef USE_ALPHAHASH
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
#endif`, Yp = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, qp = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Kp = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Zp = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, Jp = `#ifdef USE_AOMAP
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
#endif`, Qp = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, tm = `#ifdef USE_BATCHING
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
#endif`, em = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, nm = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, im = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, sm = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, rm = `#ifdef USE_IRIDESCENCE
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
#endif`, om = `#ifdef USE_BUMPMAP
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
#endif`, am = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, lm = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, cm = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, hm = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, um = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, dm = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, fm = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, pm = `#if defined( USE_COLOR_ALPHA )
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
#endif`, mm = `#define PI 3.141592653589793
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
} // validated`, gm = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, _m = `vec3 transformedNormal = objectNormal;
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
#endif`, vm = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, xm = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, ym = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Mm = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Sm = "gl_FragColor = linearToOutputTexel( gl_FragColor );", bm = `
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
}`, Em = `#ifdef USE_ENVMAP
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
#endif`, wm = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Tm = `#ifdef USE_ENVMAP
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
#endif`, Am = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Rm = `#ifdef USE_ENVMAP
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
#endif`, Cm = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Pm = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Lm = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Im = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Dm = `#ifdef USE_GRADIENTMAP
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
}`, Nm = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Um = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Om = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Fm = `uniform bool receiveShadow;
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
#endif`, Bm = `#ifdef USE_ENVMAP
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
#endif`, km = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, zm = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Hm = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Gm = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Vm = `PhysicalMaterial material;
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
#endif`, Wm = `struct PhysicalMaterial {
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
}`, $m = `
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
#endif`, Xm = `#if defined( RE_IndirectDiffuse )
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
#endif`, jm = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Ym = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, qm = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Km = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Zm = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Jm = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, Qm = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, tg = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, eg = `#if defined( USE_POINTS_UV )
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
#endif`, ng = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, ig = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, sg = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, rg = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, og = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, ag = `#ifdef USE_MORPHTARGETS
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
#endif`, lg = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, cg = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, hg = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, ug = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, dg = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, fg = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, pg = `#ifdef USE_NORMALMAP
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
#endif`, mg = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, gg = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, _g = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, vg = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, xg = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, yg = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, Mg = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Sg = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, bg = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Eg = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, wg = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Tg = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Ag = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Rg = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Cg = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, Pg = `float getShadowMask() {
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
}`, Lg = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Ig = `#ifdef USE_SKINNING
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
#endif`, Dg = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Ng = `#ifdef USE_SKINNING
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
#endif`, Ug = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Og = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Fg = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Bg = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, kg = `#ifdef USE_TRANSMISSION
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
#endif`, zg = `#ifdef USE_TRANSMISSION
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
#endif`, Hg = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Gg = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Vg = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Wg = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const $g = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, Xg = `uniform sampler2D t2D;
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
}`, jg = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Yg = `#ifdef ENVMAP_TYPE_CUBE
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
}`, qg = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Kg = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Zg = `#include <common>
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
}`, Jg = `#if DEPTH_PACKING == 3200
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
}`, Qg = `#define DISTANCE
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
}`, t0 = `#define DISTANCE
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
}`, e0 = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, n0 = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, i0 = `uniform float scale;
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
}`, s0 = `uniform vec3 diffuse;
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
}`, r0 = `#include <common>
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
}`, o0 = `uniform vec3 diffuse;
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
}`, a0 = `#define LAMBERT
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
}`, l0 = `#define LAMBERT
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
}`, c0 = `#define MATCAP
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
}`, h0 = `#define MATCAP
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
}`, u0 = `#define NORMAL
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
}`, d0 = `#define NORMAL
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
}`, f0 = `#define PHONG
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
}`, p0 = `#define PHONG
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
}`, m0 = `#define STANDARD
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
}`, g0 = `#define STANDARD
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
}`, _0 = `#define TOON
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
}`, v0 = `#define TOON
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
}`, x0 = `uniform float size;
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
}`, y0 = `uniform vec3 diffuse;
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
}`, M0 = `#include <common>
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
}`, S0 = `uniform vec3 color;
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
}`, b0 = `uniform float rotation;
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
}`, E0 = `uniform vec3 diffuse;
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
}`, zt = {
  alphahash_fragment: Xp,
  alphahash_pars_fragment: jp,
  alphamap_fragment: Yp,
  alphamap_pars_fragment: qp,
  alphatest_fragment: Kp,
  alphatest_pars_fragment: Zp,
  aomap_fragment: Jp,
  aomap_pars_fragment: Qp,
  batching_pars_vertex: tm,
  batching_vertex: em,
  begin_vertex: nm,
  beginnormal_vertex: im,
  bsdfs: sm,
  iridescence_fragment: rm,
  bumpmap_pars_fragment: om,
  clipping_planes_fragment: am,
  clipping_planes_pars_fragment: lm,
  clipping_planes_pars_vertex: cm,
  clipping_planes_vertex: hm,
  color_fragment: um,
  color_pars_fragment: dm,
  color_pars_vertex: fm,
  color_vertex: pm,
  common: mm,
  cube_uv_reflection_fragment: gm,
  defaultnormal_vertex: _m,
  displacementmap_pars_vertex: vm,
  displacementmap_vertex: xm,
  emissivemap_fragment: ym,
  emissivemap_pars_fragment: Mm,
  colorspace_fragment: Sm,
  colorspace_pars_fragment: bm,
  envmap_fragment: Em,
  envmap_common_pars_fragment: wm,
  envmap_pars_fragment: Tm,
  envmap_pars_vertex: Am,
  envmap_physical_pars_fragment: Bm,
  envmap_vertex: Rm,
  fog_vertex: Cm,
  fog_pars_vertex: Pm,
  fog_fragment: Lm,
  fog_pars_fragment: Im,
  gradientmap_pars_fragment: Dm,
  lightmap_pars_fragment: Nm,
  lights_lambert_fragment: Um,
  lights_lambert_pars_fragment: Om,
  lights_pars_begin: Fm,
  lights_toon_fragment: km,
  lights_toon_pars_fragment: zm,
  lights_phong_fragment: Hm,
  lights_phong_pars_fragment: Gm,
  lights_physical_fragment: Vm,
  lights_physical_pars_fragment: Wm,
  lights_fragment_begin: $m,
  lights_fragment_maps: Xm,
  lights_fragment_end: jm,
  logdepthbuf_fragment: Ym,
  logdepthbuf_pars_fragment: qm,
  logdepthbuf_pars_vertex: Km,
  logdepthbuf_vertex: Zm,
  map_fragment: Jm,
  map_pars_fragment: Qm,
  map_particle_fragment: tg,
  map_particle_pars_fragment: eg,
  metalnessmap_fragment: ng,
  metalnessmap_pars_fragment: ig,
  morphinstance_vertex: sg,
  morphcolor_vertex: rg,
  morphnormal_vertex: og,
  morphtarget_pars_vertex: ag,
  morphtarget_vertex: lg,
  normal_fragment_begin: cg,
  normal_fragment_maps: hg,
  normal_pars_fragment: ug,
  normal_pars_vertex: dg,
  normal_vertex: fg,
  normalmap_pars_fragment: pg,
  clearcoat_normal_fragment_begin: mg,
  clearcoat_normal_fragment_maps: gg,
  clearcoat_pars_fragment: _g,
  iridescence_pars_fragment: vg,
  opaque_fragment: xg,
  packing: yg,
  premultiplied_alpha_fragment: Mg,
  project_vertex: Sg,
  dithering_fragment: bg,
  dithering_pars_fragment: Eg,
  roughnessmap_fragment: wg,
  roughnessmap_pars_fragment: Tg,
  shadowmap_pars_fragment: Ag,
  shadowmap_pars_vertex: Rg,
  shadowmap_vertex: Cg,
  shadowmask_pars_fragment: Pg,
  skinbase_vertex: Lg,
  skinning_pars_vertex: Ig,
  skinning_vertex: Dg,
  skinnormal_vertex: Ng,
  specularmap_fragment: Ug,
  specularmap_pars_fragment: Og,
  tonemapping_fragment: Fg,
  tonemapping_pars_fragment: Bg,
  transmission_fragment: kg,
  transmission_pars_fragment: zg,
  uv_pars_fragment: Hg,
  uv_pars_vertex: Gg,
  uv_vertex: Vg,
  worldpos_vertex: Wg,
  background_vert: $g,
  background_frag: Xg,
  backgroundCube_vert: jg,
  backgroundCube_frag: Yg,
  cube_vert: qg,
  cube_frag: Kg,
  depth_vert: Zg,
  depth_frag: Jg,
  distanceRGBA_vert: Qg,
  distanceRGBA_frag: t0,
  equirect_vert: e0,
  equirect_frag: n0,
  linedashed_vert: i0,
  linedashed_frag: s0,
  meshbasic_vert: r0,
  meshbasic_frag: o0,
  meshlambert_vert: a0,
  meshlambert_frag: l0,
  meshmatcap_vert: c0,
  meshmatcap_frag: h0,
  meshnormal_vert: u0,
  meshnormal_frag: d0,
  meshphong_vert: f0,
  meshphong_frag: p0,
  meshphysical_vert: m0,
  meshphysical_frag: g0,
  meshtoon_vert: _0,
  meshtoon_frag: v0,
  points_vert: x0,
  points_frag: y0,
  shadow_vert: M0,
  shadow_frag: S0,
  sprite_vert: b0,
  sprite_frag: E0
}, ot = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Tt(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ht() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ht() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Ht() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Ht() },
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
    aoMapTransform: { value: /* @__PURE__ */ new Ht() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Ht() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Ht() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Ht() },
    normalScale: { value: /* @__PURE__ */ new nt(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Ht() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Ht() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Ht() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Ht() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Tt(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new Tt(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ht() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Ht() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Tt(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new nt(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ht() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ht() },
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
    vertexShader: zt.meshbasic_vert,
    fragmentShader: zt.meshbasic_frag
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
        emissive: { value: /* @__PURE__ */ new Tt(0) }
      }
    ]),
    vertexShader: zt.meshlambert_vert,
    fragmentShader: zt.meshlambert_frag
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
        emissive: { value: /* @__PURE__ */ new Tt(0) },
        specular: { value: /* @__PURE__ */ new Tt(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: zt.meshphong_vert,
    fragmentShader: zt.meshphong_frag
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
        emissive: { value: /* @__PURE__ */ new Tt(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: zt.meshphysical_vert,
    fragmentShader: zt.meshphysical_frag
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
        emissive: { value: /* @__PURE__ */ new Tt(0) }
      }
    ]),
    vertexShader: zt.meshtoon_vert,
    fragmentShader: zt.meshtoon_frag
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
    vertexShader: zt.meshmatcap_vert,
    fragmentShader: zt.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Ge([
      ot.points,
      ot.fog
    ]),
    vertexShader: zt.points_vert,
    fragmentShader: zt.points_frag
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
    vertexShader: zt.linedashed_vert,
    fragmentShader: zt.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.displacementmap
    ]),
    vertexShader: zt.depth_vert,
    fragmentShader: zt.depth_frag
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
    vertexShader: zt.meshnormal_vert,
    fragmentShader: zt.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Ge([
      ot.sprite,
      ot.fog
    ]),
    vertexShader: zt.sprite_vert,
    fragmentShader: zt.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Ht() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: zt.background_vert,
    fragmentShader: zt.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Ht() }
    },
    vertexShader: zt.backgroundCube_vert,
    fragmentShader: zt.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: zt.cube_vert,
    fragmentShader: zt.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: zt.equirect_vert,
    fragmentShader: zt.equirect_frag
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
    vertexShader: zt.distanceRGBA_vert,
    fragmentShader: zt.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Ge([
      ot.lights,
      ot.fog,
      {
        color: { value: /* @__PURE__ */ new Tt(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: zt.shadow_vert,
    fragmentShader: zt.shadow_frag
  }
};
Mn.physical = {
  uniforms: /* @__PURE__ */ Ge([
    Mn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Ht() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Ht() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new nt(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Ht() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Ht() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Ht() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Tt(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Ht() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Ht() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Ht() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new nt() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Ht() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Tt(0) },
      specularColor: { value: /* @__PURE__ */ new Tt(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Ht() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Ht() },
      anisotropyVector: { value: /* @__PURE__ */ new nt() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Ht() }
    }
  ]),
  vertexShader: zt.meshphysical_vert,
  fragmentShader: zt.meshphysical_frag
};
const Pr = { r: 0, b: 0, g: 0 }, pi = /* @__PURE__ */ new bn(), w0 = /* @__PURE__ */ new Ft();
function T0(i, t, e, n, s, r, o) {
  const a = new Tt(0);
  let l = r === !0 ? 0 : 1, c, h, u = null, d = 0, f = null;
  function g(y) {
    let _ = y.isScene === !0 ? y.background : null;
    return _ && _.isTexture && (_ = (y.backgroundBlurriness > 0 ? e : t).get(_)), _;
  }
  function v(y) {
    let _ = !1;
    const M = g(y);
    M === null ? m(a, l) : M && M.isColor && (m(M, 1), _ = !0);
    const R = i.xr.getEnvironmentBlendMode();
    R === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, o) : R === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, o), (i.autoClear || _) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function p(y, _) {
    const M = g(_);
    M && (M.isCubeTexture || M.mapping === Mo) ? (h === void 0 && (h = new ge(
      new Vn(1, 1, 1),
      new oi({
        name: "BackgroundCubeMaterial",
        uniforms: ds(Mn.backgroundCube.uniforms),
        vertexShader: Mn.backgroundCube.vertexShader,
        fragmentShader: Mn.backgroundCube.fragmentShader,
        side: je,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(R, T, w) {
      this.matrixWorld.copyPosition(w.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), s.update(h)), pi.copy(_.backgroundRotation), pi.x *= -1, pi.y *= -1, pi.z *= -1, M.isCubeTexture && M.isRenderTargetTexture === !1 && (pi.y *= -1, pi.z *= -1), h.material.uniforms.envMap.value = M, h.material.uniforms.flipEnvMap.value = M.isCubeTexture && M.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = _.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = _.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(w0.makeRotationFromEuler(pi)), h.material.toneMapped = te.getTransfer(M.colorSpace) !== xe, (u !== M || d !== M.version || f !== i.toneMapping) && (h.material.needsUpdate = !0, u = M, d = M.version, f = i.toneMapping), h.layers.enableAll(), y.unshift(h, h.geometry, h.material, 0, 0, null)) : M && M.isTexture && (c === void 0 && (c = new ge(
      new ar(2, 2),
      new oi({
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
    }), s.update(c)), c.material.uniforms.t2D.value = M, c.material.uniforms.backgroundIntensity.value = _.backgroundIntensity, c.material.toneMapped = te.getTransfer(M.colorSpace) !== xe, M.matrixAutoUpdate === !0 && M.updateMatrix(), c.material.uniforms.uvTransform.value.copy(M.matrix), (u !== M || d !== M.version || f !== i.toneMapping) && (c.material.needsUpdate = !0, u = M, d = M.version, f = i.toneMapping), c.layers.enableAll(), y.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function m(y, _) {
    y.getRGB(Pr, Xu(i)), n.buffers.color.setClear(Pr.r, Pr.g, Pr.b, _, o);
  }
  return {
    getClearColor: function() {
      return a;
    },
    setClearColor: function(y, _ = 1) {
      a.set(y), l = _, m(a, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(y) {
      l = y, m(a, l);
    },
    render: v,
    addToRenderList: p
  };
}
function A0(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, s = d(null);
  let r = s, o = !1;
  function a(x, b, F, k, G) {
    let Z = !1;
    const W = u(k, F, b);
    r !== W && (r = W, c(r.object)), Z = f(x, k, F, G), Z && g(x, k, F, G), G !== null && t.update(G, i.ELEMENT_ARRAY_BUFFER), (Z || o) && (o = !1, M(x, b, F, k), G !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(G).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(x) {
    return i.bindVertexArray(x);
  }
  function h(x) {
    return i.deleteVertexArray(x);
  }
  function u(x, b, F) {
    const k = F.wireframe === !0;
    let G = n[x.id];
    G === void 0 && (G = {}, n[x.id] = G);
    let Z = G[b.id];
    Z === void 0 && (Z = {}, G[b.id] = Z);
    let W = Z[k];
    return W === void 0 && (W = d(l()), Z[k] = W), W;
  }
  function d(x) {
    const b = [], F = [], k = [];
    for (let G = 0; G < e; G++)
      b[G] = 0, F[G] = 0, k[G] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: b,
      enabledAttributes: F,
      attributeDivisors: k,
      object: x,
      attributes: {},
      index: null
    };
  }
  function f(x, b, F, k) {
    const G = r.attributes, Z = b.attributes;
    let W = 0;
    const et = F.getAttributes();
    for (const $ in et)
      if (et[$].location >= 0) {
        const ut = G[$];
        let Mt = Z[$];
        if (Mt === void 0 && ($ === "instanceMatrix" && x.instanceMatrix && (Mt = x.instanceMatrix), $ === "instanceColor" && x.instanceColor && (Mt = x.instanceColor)), ut === void 0 || ut.attribute !== Mt || Mt && ut.data !== Mt.data) return !0;
        W++;
      }
    return r.attributesNum !== W || r.index !== k;
  }
  function g(x, b, F, k) {
    const G = {}, Z = b.attributes;
    let W = 0;
    const et = F.getAttributes();
    for (const $ in et)
      if (et[$].location >= 0) {
        let ut = Z[$];
        ut === void 0 && ($ === "instanceMatrix" && x.instanceMatrix && (ut = x.instanceMatrix), $ === "instanceColor" && x.instanceColor && (ut = x.instanceColor));
        const Mt = {};
        Mt.attribute = ut, ut && ut.data && (Mt.data = ut.data), G[$] = Mt, W++;
      }
    r.attributes = G, r.attributesNum = W, r.index = k;
  }
  function v() {
    const x = r.newAttributes;
    for (let b = 0, F = x.length; b < F; b++)
      x[b] = 0;
  }
  function p(x) {
    m(x, 0);
  }
  function m(x, b) {
    const F = r.newAttributes, k = r.enabledAttributes, G = r.attributeDivisors;
    F[x] = 1, k[x] === 0 && (i.enableVertexAttribArray(x), k[x] = 1), G[x] !== b && (i.vertexAttribDivisor(x, b), G[x] = b);
  }
  function y() {
    const x = r.newAttributes, b = r.enabledAttributes;
    for (let F = 0, k = b.length; F < k; F++)
      b[F] !== x[F] && (i.disableVertexAttribArray(F), b[F] = 0);
  }
  function _(x, b, F, k, G, Z, W) {
    W === !0 ? i.vertexAttribIPointer(x, b, F, G, Z) : i.vertexAttribPointer(x, b, F, k, G, Z);
  }
  function M(x, b, F, k) {
    v();
    const G = k.attributes, Z = F.getAttributes(), W = b.defaultAttributeValues;
    for (const et in Z) {
      const $ = Z[et];
      if ($.location >= 0) {
        let lt = G[et];
        if (lt === void 0 && (et === "instanceMatrix" && x.instanceMatrix && (lt = x.instanceMatrix), et === "instanceColor" && x.instanceColor && (lt = x.instanceColor)), lt !== void 0) {
          const ut = lt.normalized, Mt = lt.itemSize, ee = t.get(lt);
          if (ee === void 0) continue;
          const ae = ee.buffer, j = ee.type, it = ee.bytesPerElement, xt = j === i.INT || j === i.UNSIGNED_INT || lt.gpuType === wl;
          if (lt.isInterleavedBufferAttribute) {
            const pt = lt.data, Bt = pt.stride, Ct = lt.offset;
            if (pt.isInstancedInterleavedBuffer) {
              for (let Yt = 0; Yt < $.locationSize; Yt++)
                m($.location + Yt, pt.meshPerAttribute);
              x.isInstancedMesh !== !0 && k._maxInstanceCount === void 0 && (k._maxInstanceCount = pt.meshPerAttribute * pt.count);
            } else
              for (let Yt = 0; Yt < $.locationSize; Yt++)
                p($.location + Yt);
            i.bindBuffer(i.ARRAY_BUFFER, ae);
            for (let Yt = 0; Yt < $.locationSize; Yt++)
              _(
                $.location + Yt,
                Mt / $.locationSize,
                j,
                ut,
                Bt * it,
                (Ct + Mt / $.locationSize * Yt) * it,
                xt
              );
          } else {
            if (lt.isInstancedBufferAttribute) {
              for (let pt = 0; pt < $.locationSize; pt++)
                m($.location + pt, lt.meshPerAttribute);
              x.isInstancedMesh !== !0 && k._maxInstanceCount === void 0 && (k._maxInstanceCount = lt.meshPerAttribute * lt.count);
            } else
              for (let pt = 0; pt < $.locationSize; pt++)
                p($.location + pt);
            i.bindBuffer(i.ARRAY_BUFFER, ae);
            for (let pt = 0; pt < $.locationSize; pt++)
              _(
                $.location + pt,
                Mt / $.locationSize,
                j,
                ut,
                Mt * it,
                Mt / $.locationSize * pt * it,
                xt
              );
          }
        } else if (W !== void 0) {
          const ut = W[et];
          if (ut !== void 0)
            switch (ut.length) {
              case 2:
                i.vertexAttrib2fv($.location, ut);
                break;
              case 3:
                i.vertexAttrib3fv($.location, ut);
                break;
              case 4:
                i.vertexAttrib4fv($.location, ut);
                break;
              default:
                i.vertexAttrib1fv($.location, ut);
            }
        }
      }
    }
    y();
  }
  function R() {
    C();
    for (const x in n) {
      const b = n[x];
      for (const F in b) {
        const k = b[F];
        for (const G in k)
          h(k[G].object), delete k[G];
        delete b[F];
      }
      delete n[x];
    }
  }
  function T(x) {
    if (n[x.id] === void 0) return;
    const b = n[x.id];
    for (const F in b) {
      const k = b[F];
      for (const G in k)
        h(k[G].object), delete k[G];
      delete b[F];
    }
    delete n[x.id];
  }
  function w(x) {
    for (const b in n) {
      const F = n[b];
      if (F[x.id] === void 0) continue;
      const k = F[x.id];
      for (const G in k)
        h(k[G].object), delete k[G];
      delete F[x.id];
    }
  }
  function C() {
    B(), o = !0, r !== s && (r = s, c(r.object));
  }
  function B() {
    s.geometry = null, s.program = null, s.wireframe = !1;
  }
  return {
    setup: a,
    reset: C,
    resetDefaultState: B,
    dispose: R,
    releaseStatesOfGeometry: T,
    releaseStatesOfProgram: w,
    initAttributes: v,
    enableAttribute: p,
    disableUnusedAttributes: y
  };
}
function R0(i, t, e) {
  let n;
  function s(c) {
    n = c;
  }
  function r(c, h) {
    i.drawArrays(n, c, h), e.update(h, n, 1);
  }
  function o(c, h, u) {
    u !== 0 && (i.drawArraysInstanced(n, c, h, u), e.update(h, n, u));
  }
  function a(c, h, u) {
    if (u === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, u);
    let f = 0;
    for (let g = 0; g < u; g++)
      f += h[g];
    e.update(f, n, 1);
  }
  function l(c, h, u, d) {
    if (u === 0) return;
    const f = t.get("WEBGL_multi_draw");
    if (f === null)
      for (let g = 0; g < c.length; g++)
        o(c[g], h[g], d[g]);
    else {
      f.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, d, 0, u);
      let g = 0;
      for (let v = 0; v < u; v++)
        g += h[v];
      for (let v = 0; v < d.length; v++)
        e.update(g, n, d[v]);
    }
  }
  this.setMode = s, this.render = r, this.renderInstances = o, this.renderMultiDraw = a, this.renderMultiDrawInstances = l;
}
function C0(i, t, e, n) {
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
    const C = w === or && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(w !== Gn && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    w !== _n && !C);
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
  const u = e.logarithmicDepthBuffer === !0, d = e.reverseDepthBuffer === !0 && t.has("EXT_clip_control");
  if (d === !0) {
    const w = t.get("EXT_clip_control");
    w.clipControlEXT(w.LOWER_LEFT_EXT, w.ZERO_TO_ONE_EXT);
  }
  const f = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), v = i.getParameter(i.MAX_TEXTURE_SIZE), p = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), m = i.getParameter(i.MAX_VERTEX_ATTRIBS), y = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), _ = i.getParameter(i.MAX_VARYING_VECTORS), M = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), R = g > 0, T = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: r,
    getMaxPrecision: l,
    textureFormatReadable: o,
    textureTypeReadable: a,
    precision: c,
    logarithmicDepthBuffer: u,
    reverseDepthBuffer: d,
    maxTextures: f,
    maxVertexTextures: g,
    maxTextureSize: v,
    maxCubemapSize: p,
    maxAttributes: m,
    maxVertexUniforms: y,
    maxVaryings: _,
    maxFragmentUniforms: M,
    vertexTextures: R,
    maxSamples: T
  };
}
function P0(i) {
  const t = this;
  let e = null, n = 0, s = !1, r = !1;
  const o = new Fn(), a = new Ht(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
    const f = u.length !== 0 || d || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || s;
    return s = d, n = u.length, f;
  }, this.beginShadows = function() {
    r = !0, h(null);
  }, this.endShadows = function() {
    r = !1;
  }, this.setGlobalState = function(u, d) {
    e = h(u, d, 0);
  }, this.setState = function(u, d, f) {
    const g = u.clippingPlanes, v = u.clipIntersection, p = u.clipShadows, m = i.get(u);
    if (!s || g === null || g.length === 0 || r && !p)
      r ? h(null) : c();
    else {
      const y = r ? 0 : n, _ = y * 4;
      let M = m.clippingState || null;
      l.value = M, M = h(g, d, _, f);
      for (let R = 0; R !== _; ++R)
        M[R] = e[R];
      m.clippingState = M, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += y;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function h(u, d, f, g) {
    const v = u !== null ? u.length : 0;
    let p = null;
    if (v !== 0) {
      if (p = l.value, g !== !0 || p === null) {
        const m = f + v * 4, y = d.matrixWorldInverse;
        a.getNormalMatrix(y), (p === null || p.length < m) && (p = new Float32Array(m));
        for (let _ = 0, M = f; _ !== v; ++_, M += 4)
          o.copy(u[_]).applyMatrix4(y, a), o.normal.toArray(p, M), p[M + 3] = o.constant;
      }
      l.value = p, l.needsUpdate = !0;
    }
    return t.numPlanes = v, t.numIntersection = 0, p;
  }
}
function L0(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(o, a) {
    return a === La ? o.mapping = as : a === Ia && (o.mapping = ls), o;
  }
  function n(o) {
    if (o && o.isTexture) {
      const a = o.mapping;
      if (a === La || a === Ia)
        if (t.has(o)) {
          const l = t.get(o).texture;
          return e(l, o.mapping);
        } else {
          const l = o.image;
          if (l && l.height > 0) {
            const c = new Gp(l.height);
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
class Ol extends ju {
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
const Ki = 4, Xc = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], xi = 20, Qo = /* @__PURE__ */ new Ol(), jc = /* @__PURE__ */ new Tt();
let ta = null, ea = 0, na = 0, ia = !1;
const _i = (1 + Math.sqrt(5)) / 2, zi = 1 / _i, Yc = [
  /* @__PURE__ */ new P(-_i, zi, 0),
  /* @__PURE__ */ new P(_i, zi, 0),
  /* @__PURE__ */ new P(-zi, 0, _i),
  /* @__PURE__ */ new P(zi, 0, _i),
  /* @__PURE__ */ new P(0, _i, -zi),
  /* @__PURE__ */ new P(0, _i, zi),
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
    ta = this._renderer.getRenderTarget(), ea = this._renderer.getActiveCubeFace(), na = this._renderer.getActiveMipmapLevel(), ia = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
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
    this._renderer.setRenderTarget(ta, ea, na), this._renderer.xr.enabled = ia, t.scissorTest = !1, Lr(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === as || t.mapping === ls ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), ta = this._renderer.getRenderTarget(), ea = this._renderer.getActiveCubeFace(), na = this._renderer.getActiveMipmapLevel(), ia = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
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
    }, s = Kc(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Kc(t, e, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = I0(r)), this._blurMaterial = D0(r, t, e);
    }
    return s;
  }
  _compileMaterial(t) {
    const e = new ge(this._lodPlanes[0], t);
    this._renderer.compile(e, Qo);
  }
  _sceneToCubeUV(t, e, n, s) {
    const a = new ze(90, 1, e, n), l = [1, -1, 1, 1, 1, 1], c = [1, 1, 1, -1, -1, -1], h = this._renderer, u = h.autoClear, d = h.toneMapping;
    h.getClearColor(jc), h.toneMapping = si, h.autoClear = !1;
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
      const y = m % 3;
      y === 0 ? (a.up.set(0, l[m], 0), a.lookAt(c[m], 0, 0)) : y === 1 ? (a.up.set(0, 0, l[m]), a.lookAt(0, c[m], 0)) : (a.up.set(0, l[m], 0), a.lookAt(0, 0, c[m]));
      const _ = this._cubeSize;
      Lr(s, y * _, m > 2 ? _ : 0, _, _), h.setRenderTarget(s), v && h.render(g, a), h.render(t, a);
    }
    g.geometry.dispose(), g.material.dispose(), h.toneMapping = d, h.autoClear = u, t.background = p;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, s = t.mapping === as || t.mapping === ls;
    s ? (this._cubemapMaterial === null && (this._cubemapMaterial = Jc()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Zc());
    const r = s ? this._cubemapMaterial : this._equirectMaterial, o = new ge(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = t;
    const l = this._cubeSize;
    Lr(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(o, Qo);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = !1;
    const s = this._lodPlanes.length;
    for (let r = 1; r < s; r++) {
      const o = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = Yc[(s - r - 1) % Yc.length];
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
    const h = 3, u = new ge(this._lodPlanes[s], c), d = c.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * xi - 1), v = r / g, p = isFinite(r) ? 1 + Math.floor(h * v) : xi;
    p > xi && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${xi}`);
    const m = [];
    let y = 0;
    for (let w = 0; w < xi; ++w) {
      const C = w / v, B = Math.exp(-C * C / 2);
      m.push(B), w === 0 ? y += B : w < p && (y += 2 * B);
    }
    for (let w = 0; w < m.length; w++)
      m[w] = m[w] / y;
    d.envMap.value = t.texture, d.samples.value = p, d.weights.value = m, d.latitudinal.value = o === "latitudinal", a && (d.poleAxis.value = a);
    const { _lodMax: _ } = this;
    d.dTheta.value = g, d.mipInt.value = _ - n;
    const M = this._sizeLods[s], R = 3 * M * (s > _ - Ki ? s - _ + Ki : 0), T = 4 * (this._cubeSize - M);
    Lr(e, R, T, 3 * M, 2 * M), l.setRenderTarget(e), l.render(u, Qo);
  }
}
function I0(i) {
  const t = [], e = [], n = [];
  let s = i;
  const r = i - Ki + 1 + Xc.length;
  for (let o = 0; o < r; o++) {
    const a = Math.pow(2, s);
    e.push(a);
    let l = 1 / a;
    o > i - Ki ? l = Xc[o - i + Ki - 1] : o === 0 && (l = 0), n.push(l);
    const c = 1 / (a - 2), h = -c, u = 1 + c, d = [h, h, u, h, u, u, h, h, u, u, h, u], f = 6, g = 6, v = 3, p = 2, m = 1, y = new Float32Array(v * g * f), _ = new Float32Array(p * g * f), M = new Float32Array(m * g * f);
    for (let T = 0; T < f; T++) {
      const w = T % 3 * 2 / 3 - 1, C = T > 2 ? 0 : -1, B = [
        w,
        C,
        0,
        w + 2 / 3,
        C,
        0,
        w + 2 / 3,
        C + 1,
        0,
        w,
        C,
        0,
        w + 2 / 3,
        C + 1,
        0,
        w,
        C + 1,
        0
      ];
      y.set(B, v * g * T), _.set(d, p * g * T);
      const x = [T, T, T, T, T, T];
      M.set(x, m * g * T);
    }
    const R = new Ie();
    R.setAttribute("position", new Ue(y, v)), R.setAttribute("uv", new Ue(_, p)), R.setAttribute("faceIndex", new Ue(M, m)), t.push(R), s > Ki && s--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function Kc(i, t, e) {
  const n = new bi(i, t, e);
  return n.texture.mapping = Mo, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Lr(i, t, e, n, s) {
  i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s);
}
function D0(i, t, e) {
  const n = new Float32Array(xi), s = new P(0, 1, 0);
  return new oi({
    name: "SphericalGaussianBlur",
    defines: {
      n: xi,
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
    blending: ii,
    depthTest: !1,
    depthWrite: !1
  });
}
function Zc() {
  return new oi({
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
    blending: ii,
    depthTest: !1,
    depthWrite: !1
  });
}
function Jc() {
  return new oi({
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
    blending: ii,
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
function N0(i) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(a) {
    if (a && a.isTexture) {
      const l = a.mapping, c = l === La || l === Ia, h = l === as || l === ls;
      if (c || h) {
        let u = t.get(a);
        const d = u !== void 0 ? u.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== d)
          return e === null && (e = new qc(i)), u = c ? e.fromEquirectangular(a, u) : e.fromCubemap(a, u), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), u.texture;
        if (u !== void 0)
          return u.texture;
        {
          const f = a.image;
          return c && f && f.height > 0 || h && f && s(f) ? (e === null && (e = new qc(i)), u = c ? e.fromEquirectangular(a) : e.fromCubemap(a), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), a.addEventListener("dispose", r), u.texture) : null;
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
function U0(i) {
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
function O0(i, t, e, n) {
  const s = {}, r = /* @__PURE__ */ new WeakMap();
  function o(u) {
    const d = u.target;
    d.index !== null && t.remove(d.index);
    for (const g in d.attributes)
      t.remove(d.attributes[g]);
    for (const g in d.morphAttributes) {
      const v = d.morphAttributes[g];
      for (let p = 0, m = v.length; p < m; p++)
        t.remove(v[p]);
    }
    d.removeEventListener("dispose", o), delete s[d.id];
    const f = r.get(d);
    f && (t.remove(f), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, e.memory.geometries--;
  }
  function a(u, d) {
    return s[d.id] === !0 || (d.addEventListener("dispose", o), s[d.id] = !0, e.memory.geometries++), d;
  }
  function l(u) {
    const d = u.attributes;
    for (const g in d)
      t.update(d[g], i.ARRAY_BUFFER);
    const f = u.morphAttributes;
    for (const g in f) {
      const v = f[g];
      for (let p = 0, m = v.length; p < m; p++)
        t.update(v[p], i.ARRAY_BUFFER);
    }
  }
  function c(u) {
    const d = [], f = u.index, g = u.attributes.position;
    let v = 0;
    if (f !== null) {
      const y = f.array;
      v = f.version;
      for (let _ = 0, M = y.length; _ < M; _ += 3) {
        const R = y[_ + 0], T = y[_ + 1], w = y[_ + 2];
        d.push(R, T, T, w, w, R);
      }
    } else if (g !== void 0) {
      const y = g.array;
      v = g.version;
      for (let _ = 0, M = y.length / 3 - 1; _ < M; _ += 3) {
        const R = _ + 0, T = _ + 1, w = _ + 2;
        d.push(R, T, T, w, w, R);
      }
    } else
      return;
    const p = new (zu(d) ? $u : Wu)(d, 1);
    p.version = v;
    const m = r.get(u);
    m && t.remove(m), r.set(u, p);
  }
  function h(u) {
    const d = r.get(u);
    if (d) {
      const f = u.index;
      f !== null && d.version < f.version && c(u);
    } else
      c(u);
    return r.get(u);
  }
  return {
    get: a,
    update: l,
    getWireframeAttribute: h
  };
}
function F0(i, t, e) {
  let n;
  function s(d) {
    n = d;
  }
  let r, o;
  function a(d) {
    r = d.type, o = d.bytesPerElement;
  }
  function l(d, f) {
    i.drawElements(n, f, r, d * o), e.update(f, n, 1);
  }
  function c(d, f, g) {
    g !== 0 && (i.drawElementsInstanced(n, f, r, d * o, g), e.update(f, n, g));
  }
  function h(d, f, g) {
    if (g === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, f, 0, r, d, 0, g);
    let p = 0;
    for (let m = 0; m < g; m++)
      p += f[m];
    e.update(p, n, 1);
  }
  function u(d, f, g, v) {
    if (g === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null)
      for (let m = 0; m < d.length; m++)
        c(d[m] / o, f[m], v[m]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, f, 0, r, d, 0, v, 0, g);
      let m = 0;
      for (let y = 0; y < g; y++)
        m += f[y];
      for (let y = 0; y < v.length; y++)
        e.update(m, n, v[y]);
    }
  }
  this.setMode = s, this.setIndex = a, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function B0(i) {
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
function k0(i, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), s = new se();
  function r(o, a, l) {
    const c = o.morphTargetInfluences, h = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let d = n.get(a);
    if (d === void 0 || d.count !== u) {
      let B = function() {
        w.dispose(), n.delete(a), a.removeEventListener("dispose", B);
      };
      d !== void 0 && d.texture.dispose();
      const f = a.morphAttributes.position !== void 0, g = a.morphAttributes.normal !== void 0, v = a.morphAttributes.color !== void 0, p = a.morphAttributes.position || [], m = a.morphAttributes.normal || [], y = a.morphAttributes.color || [];
      let _ = 0;
      f === !0 && (_ = 1), g === !0 && (_ = 2), v === !0 && (_ = 3);
      let M = a.attributes.position.count * _, R = 1;
      M > t.maxTextureSize && (R = Math.ceil(M / t.maxTextureSize), M = t.maxTextureSize);
      const T = new Float32Array(M * R * 4 * u), w = new Gu(T, M, R, u);
      w.type = _n, w.needsUpdate = !0;
      const C = _ * 4;
      for (let x = 0; x < u; x++) {
        const b = p[x], F = m[x], k = y[x], G = M * R * 4 * x;
        for (let Z = 0; Z < b.count; Z++) {
          const W = Z * C;
          f === !0 && (s.fromBufferAttribute(b, Z), T[G + W + 0] = s.x, T[G + W + 1] = s.y, T[G + W + 2] = s.z, T[G + W + 3] = 0), g === !0 && (s.fromBufferAttribute(F, Z), T[G + W + 4] = s.x, T[G + W + 5] = s.y, T[G + W + 6] = s.z, T[G + W + 7] = 0), v === !0 && (s.fromBufferAttribute(k, Z), T[G + W + 8] = s.x, T[G + W + 9] = s.y, T[G + W + 10] = s.z, T[G + W + 11] = k.itemSize === 4 ? s.w : 1);
        }
      }
      d = {
        count: u,
        texture: w,
        size: new nt(M, R)
      }, n.set(a, d), a.addEventListener("dispose", B);
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
    l.getUniforms().setValue(i, "morphTargetsTexture", d.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", d.size);
  }
  return {
    update: r
  };
}
function z0(i, t, e, n) {
  let s = /* @__PURE__ */ new WeakMap();
  function r(l) {
    const c = n.render.frame, h = l.geometry, u = t.get(l, h);
    if (s.get(u) !== c && (t.update(u), s.set(u, c)), l.isInstancedMesh && (l.hasEventListener("dispose", a) === !1 && l.addEventListener("dispose", a), s.get(l) !== c && (e.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER), s.set(l, c))), l.isSkinnedMesh) {
      const d = l.skeleton;
      s.get(d) !== c && (d.update(), s.set(d, c));
    }
    return u;
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
class Ku extends Ce {
  constructor(t, e, n, s, r, o, a, l, c, h = ts) {
    if (h !== ts && h !== hs)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && h === ts && (n = Si), n === void 0 && h === hs && (n = cs), super(null, s, r, o, a, l, h, n, c), this.isDepthTexture = !0, this.image = { width: t, height: e }, this.magFilter = a !== void 0 ? a : Ve, this.minFilter = l !== void 0 ? l : Ve, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
const Zu = /* @__PURE__ */ new Ce(), Qc = /* @__PURE__ */ new Ku(1, 1), Ju = /* @__PURE__ */ new Gu(), Qu = /* @__PURE__ */ new Tp(), td = /* @__PURE__ */ new Yu(), th = [], eh = [], nh = new Float32Array(16), ih = new Float32Array(9), sh = new Float32Array(4);
function _s(i, t, e) {
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
function bo(i, t) {
  let e = eh[t];
  e === void 0 && (e = new Int32Array(t), eh[t] = e);
  for (let n = 0; n !== t; ++n)
    e[n] = i.allocateTextureUnit();
  return e;
}
function H0(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
}
function G0(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Pe(e, t)) return;
    i.uniform2fv(this.addr, t), Le(e, t);
  }
}
function V0(i, t) {
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
function W0(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Pe(e, t)) return;
    i.uniform4fv(this.addr, t), Le(e, t);
  }
}
function $0(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Pe(e, t)) return;
    i.uniformMatrix2fv(this.addr, !1, t), Le(e, t);
  } else {
    if (Pe(e, n)) return;
    sh.set(n), i.uniformMatrix2fv(this.addr, !1, sh), Le(e, n);
  }
}
function X0(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Pe(e, t)) return;
    i.uniformMatrix3fv(this.addr, !1, t), Le(e, t);
  } else {
    if (Pe(e, n)) return;
    ih.set(n), i.uniformMatrix3fv(this.addr, !1, ih), Le(e, n);
  }
}
function j0(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Pe(e, t)) return;
    i.uniformMatrix4fv(this.addr, !1, t), Le(e, t);
  } else {
    if (Pe(e, n)) return;
    nh.set(n), i.uniformMatrix4fv(this.addr, !1, nh), Le(e, n);
  }
}
function Y0(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
}
function q0(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Pe(e, t)) return;
    i.uniform2iv(this.addr, t), Le(e, t);
  }
}
function K0(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Pe(e, t)) return;
    i.uniform3iv(this.addr, t), Le(e, t);
  }
}
function Z0(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Pe(e, t)) return;
    i.uniform4iv(this.addr, t), Le(e, t);
  }
}
function J0(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
}
function Q0(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Pe(e, t)) return;
    i.uniform2uiv(this.addr, t), Le(e, t);
  }
}
function t_(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Pe(e, t)) return;
    i.uniform3uiv(this.addr, t), Le(e, t);
  }
}
function e_(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Pe(e, t)) return;
    i.uniform4uiv(this.addr, t), Le(e, t);
  }
}
function n_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
  let r;
  this.type === i.SAMPLER_2D_SHADOW ? (Qc.compareFunction = ku, r = Qc) : r = Zu, e.setTexture2D(t || r, s);
}
function i_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture3D(t || Qu, s);
}
function s_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTextureCube(t || td, s);
}
function r_(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture2DArray(t || Ju, s);
}
function o_(i) {
  switch (i) {
    case 5126:
      return H0;
    case 35664:
      return G0;
    case 35665:
      return V0;
    case 35666:
      return W0;
    case 35674:
      return $0;
    case 35675:
      return X0;
    case 35676:
      return j0;
    case 5124:
    case 35670:
      return Y0;
    case 35667:
    case 35671:
      return q0;
    case 35668:
    case 35672:
      return K0;
    case 35669:
    case 35673:
      return Z0;
    case 5125:
      return J0;
    case 36294:
      return Q0;
    case 36295:
      return t_;
    case 36296:
      return e_;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return n_;
    case 35679:
    case 36299:
    case 36307:
      return i_;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return s_;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return r_;
  }
}
function a_(i, t) {
  i.uniform1fv(this.addr, t);
}
function l_(i, t) {
  const e = _s(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function c_(i, t) {
  const e = _s(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function h_(i, t) {
  const e = _s(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function u_(i, t) {
  const e = _s(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function d_(i, t) {
  const e = _s(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function f_(i, t) {
  const e = _s(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function p_(i, t) {
  i.uniform1iv(this.addr, t);
}
function m_(i, t) {
  i.uniform2iv(this.addr, t);
}
function g_(i, t) {
  i.uniform3iv(this.addr, t);
}
function __(i, t) {
  i.uniform4iv(this.addr, t);
}
function v_(i, t) {
  i.uniform1uiv(this.addr, t);
}
function x_(i, t) {
  i.uniform2uiv(this.addr, t);
}
function y_(i, t) {
  i.uniform3uiv(this.addr, t);
}
function M_(i, t) {
  i.uniform4uiv(this.addr, t);
}
function S_(i, t, e) {
  const n = this.cache, s = t.length, r = bo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture2D(t[o] || Zu, r[o]);
}
function b_(i, t, e) {
  const n = this.cache, s = t.length, r = bo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture3D(t[o] || Qu, r[o]);
}
function E_(i, t, e) {
  const n = this.cache, s = t.length, r = bo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTextureCube(t[o] || td, r[o]);
}
function w_(i, t, e) {
  const n = this.cache, s = t.length, r = bo(e, s);
  Pe(n, r) || (i.uniform1iv(this.addr, r), Le(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture2DArray(t[o] || Ju, r[o]);
}
function T_(i) {
  switch (i) {
    case 5126:
      return a_;
    case 35664:
      return l_;
    case 35665:
      return c_;
    case 35666:
      return h_;
    case 35674:
      return u_;
    case 35675:
      return d_;
    case 35676:
      return f_;
    case 5124:
    case 35670:
      return p_;
    case 35667:
    case 35671:
      return m_;
    case 35668:
    case 35672:
      return g_;
    case 35669:
    case 35673:
      return __;
    case 5125:
      return v_;
    case 36294:
      return x_;
    case 36295:
      return y_;
    case 36296:
      return M_;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return S_;
    case 35679:
    case 36299:
    case 36307:
      return b_;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return E_;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return w_;
  }
}
class A_ {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = o_(e.type);
  }
}
class R_ {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = T_(e.type);
  }
}
class C_ {
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
const sa = /(\w+)(\])?(\[|\.)?/g;
function rh(i, t) {
  i.seq.push(t), i.map[t.id] = t;
}
function P_(i, t, e) {
  const n = i.name, s = n.length;
  for (sa.lastIndex = 0; ; ) {
    const r = sa.exec(n), o = sa.lastIndex;
    let a = r[1];
    const l = r[2] === "]", c = r[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === s) {
      rh(e, c === void 0 ? new A_(a, i, t) : new R_(a, i, t));
      break;
    } else {
      let u = e.map[a];
      u === void 0 && (u = new C_(a), rh(e, u)), e = u;
    }
  }
}
class ro {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let s = 0; s < n; ++s) {
      const r = t.getActiveUniform(e, s), o = t.getUniformLocation(e, r.name);
      P_(r, o, this);
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
const L_ = 37297;
let I_ = 0;
function D_(i, t) {
  const e = i.split(`
`), n = [], s = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
  for (let o = s; o < r; o++) {
    const a = o + 1;
    n.push(`${a === t ? ">" : " "} ${a}: ${e[o]}`);
  }
  return n.join(`
`);
}
function N_(i) {
  const t = te.getPrimaries(te.workingColorSpace), e = te.getPrimaries(i);
  let n;
  switch (t === e ? n = "" : t === uo && e === ho ? n = "LinearDisplayP3ToLinearSRGB" : t === ho && e === uo && (n = "LinearSRGBToLinearDisplayP3"), i) {
    case Oe:
    case So:
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

` + D_(i.getShaderSource(t), o);
  } else
    return s;
}
function U_(i, t) {
  const e = N_(t);
  return `vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`;
}
function O_(i, t) {
  let e;
  switch (t) {
    case Uf:
      e = "Linear";
      break;
    case Of:
      e = "Reinhard";
      break;
    case Ff:
      e = "Cineon";
      break;
    case Bf:
      e = "ACESFilmic";
      break;
    case zf:
      e = "AgX";
      break;
    case Hf:
      e = "Neutral";
      break;
    case kf:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const Ir = /* @__PURE__ */ new P();
function F_() {
  te.getLuminanceCoefficients(Ir);
  const i = Ir.x.toFixed(4), t = Ir.y.toFixed(4), e = Ir.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function B_(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Bs).join(`
`);
}
function k_(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function z_(i, t) {
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
const H_ = /^[ \t]*#include +<([\w\d./]+)>/gm;
function al(i) {
  return i.replace(H_, V_);
}
const G_ = /* @__PURE__ */ new Map();
function V_(i, t) {
  let e = zt[t];
  if (e === void 0) {
    const n = G_.get(t);
    if (n !== void 0)
      e = zt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else
      throw new Error("Can not resolve #include <" + t + ">");
  }
  return al(e);
}
const W_ = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function hh(i) {
  return i.replace(W_, $_);
}
function $_(i, t, e, n) {
  let s = "";
  for (let r = parseInt(t); r < parseInt(e); r++)
    s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return s;
}
function uh(i) {
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
function X_(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === bu ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === Eu ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === Un && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function j_(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case as:
      case ls:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case Mo:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function Y_(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  if (i.envMap)
    switch (i.envMapMode) {
      case ls:
        t = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return t;
}
function q_(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case wu:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Df:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case Nf:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function K_(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 7 * 16)), texelHeight: n, maxMip: e };
}
function Z_(i, t, e, n) {
  const s = i.getContext(), r = e.defines;
  let o = e.vertexShader, a = e.fragmentShader;
  const l = X_(e), c = j_(e), h = Y_(e), u = q_(e), d = K_(e), f = B_(e), g = k_(r), v = s.createProgram();
  let p, m, y = e.glslVersion ? "#version " + e.glslVersion + `
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
    uh(e),
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
    uh(e),
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
    e.envMap ? "#define " + u : "",
    d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "",
    d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "",
    d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "",
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
    e.toneMapping !== si ? "#define TONE_MAPPING" : "",
    e.toneMapping !== si ? zt.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    e.toneMapping !== si ? O_("toneMapping", e.toneMapping) : "",
    e.dithering ? "#define DITHERING" : "",
    e.opaque ? "#define OPAQUE" : "",
    zt.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    U_("linearToOutputTexel", e.outputColorSpace),
    F_(),
    e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
    `
`
  ].filter(Bs).join(`
`)), o = al(o), o = lh(o, e), o = ch(o, e), a = al(a), a = lh(a, e), a = ch(a, e), o = hh(o), a = hh(a), e.isRawShaderMaterial !== !0 && (y = `#version 300 es
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
  const _ = y + p + o, M = y + m + a, R = oh(s, s.VERTEX_SHADER, _), T = oh(s, s.FRAGMENT_SHADER, M);
  s.attachShader(v, R), s.attachShader(v, T), e.index0AttributeName !== void 0 ? s.bindAttribLocation(v, 0, e.index0AttributeName) : e.morphTargets === !0 && s.bindAttribLocation(v, 0, "position"), s.linkProgram(v);
  function w(b) {
    if (i.debug.checkShaderErrors) {
      const F = s.getProgramInfoLog(v).trim(), k = s.getShaderInfoLog(R).trim(), G = s.getShaderInfoLog(T).trim();
      let Z = !0, W = !0;
      if (s.getProgramParameter(v, s.LINK_STATUS) === !1)
        if (Z = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(s, v, R, T);
        else {
          const et = ah(s, R, "vertex"), $ = ah(s, T, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(v, s.VALIDATE_STATUS) + `

Material Name: ` + b.name + `
Material Type: ` + b.type + `

Program Info Log: ` + F + `
` + et + `
` + $
          );
        }
      else F !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", F) : (k === "" || G === "") && (W = !1);
      W && (b.diagnostics = {
        runnable: Z,
        programLog: F,
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
    s.deleteShader(R), s.deleteShader(T), C = new ro(s, v), B = z_(s, v);
  }
  let C;
  this.getUniforms = function() {
    return C === void 0 && w(this), C;
  };
  let B;
  this.getAttributes = function() {
    return B === void 0 && w(this), B;
  };
  let x = e.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return x === !1 && (x = s.getProgramParameter(v, L_)), x;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), s.deleteProgram(v), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = I_++, this.cacheKey = t, this.usedTimes = 1, this.program = v, this.vertexShader = R, this.fragmentShader = T, this;
}
let J_ = 0;
class Q_ {
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
    return n === void 0 && (n = new tv(t), e.set(t, n)), n;
  }
}
class tv {
  constructor(t) {
    this.id = J_++, this.code = t, this.usedTimes = 0;
  }
}
function ev(i, t, e, n, s, r, o) {
  const a = new Nl(), l = new Q_(), c = /* @__PURE__ */ new Set(), h = [], u = s.logarithmicDepthBuffer, d = s.reverseDepthBuffer, f = s.vertexTextures;
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
  function p(x) {
    return c.add(x), x === 0 ? "uv" : `uv${x}`;
  }
  function m(x, b, F, k, G) {
    const Z = k.fog, W = G.geometry, et = x.isMeshStandardMaterial ? k.environment : null, $ = (x.isMeshStandardMaterial ? e : t).get(x.envMap || et), lt = $ && $.mapping === Mo ? $.image.height : null, ut = v[x.type];
    x.precision !== null && (g = s.getMaxPrecision(x.precision), g !== x.precision && console.warn("THREE.WebGLProgram.getParameters:", x.precision, "not supported, using", g, "instead."));
    const Mt = W.morphAttributes.position || W.morphAttributes.normal || W.morphAttributes.color, ee = Mt !== void 0 ? Mt.length : 0;
    let ae = 0;
    W.morphAttributes.position !== void 0 && (ae = 1), W.morphAttributes.normal !== void 0 && (ae = 2), W.morphAttributes.color !== void 0 && (ae = 3);
    let j, it, xt, pt;
    if (ut) {
      const $e = Mn[ut];
      j = $e.vertexShader, it = $e.fragmentShader;
    } else
      j = x.vertexShader, it = x.fragmentShader, l.update(x), xt = l.getVertexShaderID(x), pt = l.getFragmentShaderID(x);
    const Bt = i.getRenderTarget(), Ct = G.isInstancedMesh === !0, Yt = G.isBatchedMesh === !0, fe = !!x.map, qt = !!x.matcap, I = !!$, qe = !!x.aoMap, Xt = !!x.lightMap, Jt = !!x.bumpMap, It = !!x.normalMap, _e = !!x.displacementMap, Ut = !!x.emissiveMap, A = !!x.metalnessMap, S = !!x.roughnessMap, z = x.anisotropy > 0, q = x.clearcoat > 0, tt = x.dispersion > 0, Y = x.iridescence > 0, St = x.sheen > 0, at = x.transmission > 0, mt = z && !!x.anisotropyMap, Qt = q && !!x.clearcoatMap, st = q && !!x.clearcoatNormalMap, gt = q && !!x.clearcoatRoughnessMap, Dt = Y && !!x.iridescenceMap, Nt = Y && !!x.iridescenceThicknessMap, _t = St && !!x.sheenColorMap, jt = St && !!x.sheenRoughnessMap, kt = !!x.specularMap, me = !!x.specularColorMap, N = !!x.specularIntensityMap, dt = at && !!x.transmissionMap, X = at && !!x.thicknessMap, Q = !!x.gradientMap, ct = !!x.alphaMap, ft = x.alphaTest > 0, Kt = !!x.alphaHash, Ee = !!x.extensions;
    let We = si;
    x.toneMapped && (Bt === null || Bt.isXRRenderTarget === !0) && (We = i.toneMapping);
    const ne = {
      shaderID: ut,
      shaderType: x.type,
      shaderName: x.name,
      vertexShader: j,
      fragmentShader: it,
      defines: x.defines,
      customVertexShaderID: xt,
      customFragmentShaderID: pt,
      isRawShaderMaterial: x.isRawShaderMaterial === !0,
      glslVersion: x.glslVersion,
      precision: g,
      batching: Yt,
      batchingColor: Yt && G._colorsTexture !== null,
      instancing: Ct,
      instancingColor: Ct && G.instanceColor !== null,
      instancingMorph: Ct && G.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: Bt === null ? i.outputColorSpace : Bt.isXRRenderTarget === !0 ? Bt.texture.colorSpace : Oe,
      alphaToCoverage: !!x.alphaToCoverage,
      map: fe,
      matcap: qt,
      envMap: I,
      envMapMode: I && $.mapping,
      envMapCubeUVHeight: lt,
      aoMap: qe,
      lightMap: Xt,
      bumpMap: Jt,
      normalMap: It,
      displacementMap: f && _e,
      emissiveMap: Ut,
      normalMapObjectSpace: It && x.normalMapType === jf,
      normalMapTangentSpace: It && x.normalMapType === Bu,
      metalnessMap: A,
      roughnessMap: S,
      anisotropy: z,
      anisotropyMap: mt,
      clearcoat: q,
      clearcoatMap: Qt,
      clearcoatNormalMap: st,
      clearcoatRoughnessMap: gt,
      dispersion: tt,
      iridescence: Y,
      iridescenceMap: Dt,
      iridescenceThicknessMap: Nt,
      sheen: St,
      sheenColorMap: _t,
      sheenRoughnessMap: jt,
      specularMap: kt,
      specularColorMap: me,
      specularIntensityMap: N,
      transmission: at,
      transmissionMap: dt,
      thicknessMap: X,
      gradientMap: Q,
      opaque: x.transparent === !1 && x.blending === Qi && x.alphaToCoverage === !1,
      alphaMap: ct,
      alphaTest: ft,
      alphaHash: Kt,
      combine: x.combine,
      //
      mapUv: fe && p(x.map.channel),
      aoMapUv: qe && p(x.aoMap.channel),
      lightMapUv: Xt && p(x.lightMap.channel),
      bumpMapUv: Jt && p(x.bumpMap.channel),
      normalMapUv: It && p(x.normalMap.channel),
      displacementMapUv: _e && p(x.displacementMap.channel),
      emissiveMapUv: Ut && p(x.emissiveMap.channel),
      metalnessMapUv: A && p(x.metalnessMap.channel),
      roughnessMapUv: S && p(x.roughnessMap.channel),
      anisotropyMapUv: mt && p(x.anisotropyMap.channel),
      clearcoatMapUv: Qt && p(x.clearcoatMap.channel),
      clearcoatNormalMapUv: st && p(x.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: gt && p(x.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Dt && p(x.iridescenceMap.channel),
      iridescenceThicknessMapUv: Nt && p(x.iridescenceThicknessMap.channel),
      sheenColorMapUv: _t && p(x.sheenColorMap.channel),
      sheenRoughnessMapUv: jt && p(x.sheenRoughnessMap.channel),
      specularMapUv: kt && p(x.specularMap.channel),
      specularColorMapUv: me && p(x.specularColorMap.channel),
      specularIntensityMapUv: N && p(x.specularIntensityMap.channel),
      transmissionMapUv: dt && p(x.transmissionMap.channel),
      thicknessMapUv: X && p(x.thicknessMap.channel),
      alphaMapUv: ct && p(x.alphaMap.channel),
      //
      vertexTangents: !!W.attributes.tangent && (It || z),
      vertexColors: x.vertexColors,
      vertexAlphas: x.vertexColors === !0 && !!W.attributes.color && W.attributes.color.itemSize === 4,
      pointsUvs: G.isPoints === !0 && !!W.attributes.uv && (fe || ct),
      fog: !!Z,
      useFog: x.fog === !0,
      fogExp2: !!Z && Z.isFogExp2,
      flatShading: x.flatShading === !0,
      sizeAttenuation: x.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reverseDepthBuffer: d,
      skinning: G.isSkinnedMesh === !0,
      morphTargets: W.morphAttributes.position !== void 0,
      morphNormals: W.morphAttributes.normal !== void 0,
      morphColors: W.morphAttributes.color !== void 0,
      morphTargetsCount: ee,
      morphTextureStride: ae,
      numDirLights: b.directional.length,
      numPointLights: b.point.length,
      numSpotLights: b.spot.length,
      numSpotLightMaps: b.spotLightMap.length,
      numRectAreaLights: b.rectArea.length,
      numHemiLights: b.hemi.length,
      numDirLightShadows: b.directionalShadowMap.length,
      numPointLightShadows: b.pointShadowMap.length,
      numSpotLightShadows: b.spotShadowMap.length,
      numSpotLightShadowsWithMaps: b.numSpotLightShadowsWithMaps,
      numLightProbes: b.numLightProbes,
      numClippingPlanes: o.numPlanes,
      numClipIntersection: o.numIntersection,
      dithering: x.dithering,
      shadowMapEnabled: i.shadowMap.enabled && F.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: We,
      decodeVideoTexture: fe && x.map.isVideoTexture === !0 && te.getTransfer(x.map.colorSpace) === xe,
      premultipliedAlpha: x.premultipliedAlpha,
      doubleSided: x.side === on,
      flipSided: x.side === je,
      useDepthPacking: x.depthPacking >= 0,
      depthPacking: x.depthPacking || 0,
      index0AttributeName: x.index0AttributeName,
      extensionClipCullDistance: Ee && x.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Ee && x.extensions.multiDraw === !0 || Yt) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: x.customProgramCacheKey()
    };
    return ne.vertexUv1s = c.has(1), ne.vertexUv2s = c.has(2), ne.vertexUv3s = c.has(3), c.clear(), ne;
  }
  function y(x) {
    const b = [];
    if (x.shaderID ? b.push(x.shaderID) : (b.push(x.customVertexShaderID), b.push(x.customFragmentShaderID)), x.defines !== void 0)
      for (const F in x.defines)
        b.push(F), b.push(x.defines[F]);
    return x.isRawShaderMaterial === !1 && (_(b, x), M(b, x), b.push(i.outputColorSpace)), b.push(x.customProgramCacheKey), b.join();
  }
  function _(x, b) {
    x.push(b.precision), x.push(b.outputColorSpace), x.push(b.envMapMode), x.push(b.envMapCubeUVHeight), x.push(b.mapUv), x.push(b.alphaMapUv), x.push(b.lightMapUv), x.push(b.aoMapUv), x.push(b.bumpMapUv), x.push(b.normalMapUv), x.push(b.displacementMapUv), x.push(b.emissiveMapUv), x.push(b.metalnessMapUv), x.push(b.roughnessMapUv), x.push(b.anisotropyMapUv), x.push(b.clearcoatMapUv), x.push(b.clearcoatNormalMapUv), x.push(b.clearcoatRoughnessMapUv), x.push(b.iridescenceMapUv), x.push(b.iridescenceThicknessMapUv), x.push(b.sheenColorMapUv), x.push(b.sheenRoughnessMapUv), x.push(b.specularMapUv), x.push(b.specularColorMapUv), x.push(b.specularIntensityMapUv), x.push(b.transmissionMapUv), x.push(b.thicknessMapUv), x.push(b.combine), x.push(b.fogExp2), x.push(b.sizeAttenuation), x.push(b.morphTargetsCount), x.push(b.morphAttributeCount), x.push(b.numDirLights), x.push(b.numPointLights), x.push(b.numSpotLights), x.push(b.numSpotLightMaps), x.push(b.numHemiLights), x.push(b.numRectAreaLights), x.push(b.numDirLightShadows), x.push(b.numPointLightShadows), x.push(b.numSpotLightShadows), x.push(b.numSpotLightShadowsWithMaps), x.push(b.numLightProbes), x.push(b.shadowMapType), x.push(b.toneMapping), x.push(b.numClippingPlanes), x.push(b.numClipIntersection), x.push(b.depthPacking);
  }
  function M(x, b) {
    a.disableAll(), b.supportsVertexTextures && a.enable(0), b.instancing && a.enable(1), b.instancingColor && a.enable(2), b.instancingMorph && a.enable(3), b.matcap && a.enable(4), b.envMap && a.enable(5), b.normalMapObjectSpace && a.enable(6), b.normalMapTangentSpace && a.enable(7), b.clearcoat && a.enable(8), b.iridescence && a.enable(9), b.alphaTest && a.enable(10), b.vertexColors && a.enable(11), b.vertexAlphas && a.enable(12), b.vertexUv1s && a.enable(13), b.vertexUv2s && a.enable(14), b.vertexUv3s && a.enable(15), b.vertexTangents && a.enable(16), b.anisotropy && a.enable(17), b.alphaHash && a.enable(18), b.batching && a.enable(19), b.dispersion && a.enable(20), b.batchingColor && a.enable(21), x.push(a.mask), a.disableAll(), b.fog && a.enable(0), b.useFog && a.enable(1), b.flatShading && a.enable(2), b.logarithmicDepthBuffer && a.enable(3), b.reverseDepthBuffer && a.enable(4), b.skinning && a.enable(5), b.morphTargets && a.enable(6), b.morphNormals && a.enable(7), b.morphColors && a.enable(8), b.premultipliedAlpha && a.enable(9), b.shadowMapEnabled && a.enable(10), b.doubleSided && a.enable(11), b.flipSided && a.enable(12), b.useDepthPacking && a.enable(13), b.dithering && a.enable(14), b.transmission && a.enable(15), b.sheen && a.enable(16), b.opaque && a.enable(17), b.pointsUvs && a.enable(18), b.decodeVideoTexture && a.enable(19), b.alphaToCoverage && a.enable(20), x.push(a.mask);
  }
  function R(x) {
    const b = v[x.type];
    let F;
    if (b) {
      const k = Mn[b];
      F = Bp.clone(k.uniforms);
    } else
      F = x.uniforms;
    return F;
  }
  function T(x, b) {
    let F;
    for (let k = 0, G = h.length; k < G; k++) {
      const Z = h[k];
      if (Z.cacheKey === b) {
        F = Z, ++F.usedTimes;
        break;
      }
    }
    return F === void 0 && (F = new Z_(i, b, x, r), h.push(F)), F;
  }
  function w(x) {
    if (--x.usedTimes === 0) {
      const b = h.indexOf(x);
      h[b] = h[h.length - 1], h.pop(), x.destroy();
    }
  }
  function C(x) {
    l.remove(x);
  }
  function B() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: y,
    getUniforms: R,
    acquireProgram: T,
    releaseProgram: w,
    releaseShaderCache: C,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: B
  };
}
function nv() {
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
function iv(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
}
function dh(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
}
function fh() {
  const i = [];
  let t = 0;
  const e = [], n = [], s = [];
  function r() {
    t = 0, e.length = 0, n.length = 0, s.length = 0;
  }
  function o(u, d, f, g, v, p) {
    let m = i[t];
    return m === void 0 ? (m = {
      id: u.id,
      object: u,
      geometry: d,
      material: f,
      groupOrder: g,
      renderOrder: u.renderOrder,
      z: v,
      group: p
    }, i[t] = m) : (m.id = u.id, m.object = u, m.geometry = d, m.material = f, m.groupOrder = g, m.renderOrder = u.renderOrder, m.z = v, m.group = p), t++, m;
  }
  function a(u, d, f, g, v, p) {
    const m = o(u, d, f, g, v, p);
    f.transmission > 0 ? n.push(m) : f.transparent === !0 ? s.push(m) : e.push(m);
  }
  function l(u, d, f, g, v, p) {
    const m = o(u, d, f, g, v, p);
    f.transmission > 0 ? n.unshift(m) : f.transparent === !0 ? s.unshift(m) : e.unshift(m);
  }
  function c(u, d) {
    e.length > 1 && e.sort(u || iv), n.length > 1 && n.sort(d || dh), s.length > 1 && s.sort(d || dh);
  }
  function h() {
    for (let u = t, d = i.length; u < d; u++) {
      const f = i[u];
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
function sv() {
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
function rv() {
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
            color: new Tt()
          };
          break;
        case "SpotLight":
          e = {
            position: new P(),
            direction: new P(),
            color: new Tt(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          e = {
            position: new P(),
            color: new Tt(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          e = {
            direction: new P(),
            skyColor: new Tt(),
            groundColor: new Tt()
          };
          break;
        case "RectAreaLight":
          e = {
            color: new Tt(),
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
let av = 0;
function lv(i, t) {
  return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
}
function cv(i) {
  const t = new rv(), e = ov(), n = {
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
    let h = 0, u = 0, d = 0;
    for (let B = 0; B < 9; B++) n.probe[B].set(0, 0, 0);
    let f = 0, g = 0, v = 0, p = 0, m = 0, y = 0, _ = 0, M = 0, R = 0, T = 0, w = 0;
    c.sort(lv);
    for (let B = 0, x = c.length; B < x; B++) {
      const b = c[B], F = b.color, k = b.intensity, G = b.distance, Z = b.shadow && b.shadow.map ? b.shadow.map.texture : null;
      if (b.isAmbientLight)
        h += F.r * k, u += F.g * k, d += F.b * k;
      else if (b.isLightProbe) {
        for (let W = 0; W < 9; W++)
          n.probe[W].addScaledVector(b.sh.coefficients[W], k);
        w++;
      } else if (b.isDirectionalLight) {
        const W = t.get(b);
        if (W.color.copy(b.color).multiplyScalar(b.intensity), b.castShadow) {
          const et = b.shadow, $ = e.get(b);
          $.shadowIntensity = et.intensity, $.shadowBias = et.bias, $.shadowNormalBias = et.normalBias, $.shadowRadius = et.radius, $.shadowMapSize = et.mapSize, n.directionalShadow[f] = $, n.directionalShadowMap[f] = Z, n.directionalShadowMatrix[f] = b.shadow.matrix, y++;
        }
        n.directional[f] = W, f++;
      } else if (b.isSpotLight) {
        const W = t.get(b);
        W.position.setFromMatrixPosition(b.matrixWorld), W.color.copy(F).multiplyScalar(k), W.distance = G, W.coneCos = Math.cos(b.angle), W.penumbraCos = Math.cos(b.angle * (1 - b.penumbra)), W.decay = b.decay, n.spot[v] = W;
        const et = b.shadow;
        if (b.map && (n.spotLightMap[R] = b.map, R++, et.updateMatrices(b), b.castShadow && T++), n.spotLightMatrix[v] = et.matrix, b.castShadow) {
          const $ = e.get(b);
          $.shadowIntensity = et.intensity, $.shadowBias = et.bias, $.shadowNormalBias = et.normalBias, $.shadowRadius = et.radius, $.shadowMapSize = et.mapSize, n.spotShadow[v] = $, n.spotShadowMap[v] = Z, M++;
        }
        v++;
      } else if (b.isRectAreaLight) {
        const W = t.get(b);
        W.color.copy(F).multiplyScalar(k), W.halfWidth.set(b.width * 0.5, 0, 0), W.halfHeight.set(0, b.height * 0.5, 0), n.rectArea[p] = W, p++;
      } else if (b.isPointLight) {
        const W = t.get(b);
        if (W.color.copy(b.color).multiplyScalar(b.intensity), W.distance = b.distance, W.decay = b.decay, b.castShadow) {
          const et = b.shadow, $ = e.get(b);
          $.shadowIntensity = et.intensity, $.shadowBias = et.bias, $.shadowNormalBias = et.normalBias, $.shadowRadius = et.radius, $.shadowMapSize = et.mapSize, $.shadowCameraNear = et.camera.near, $.shadowCameraFar = et.camera.far, n.pointShadow[g] = $, n.pointShadowMap[g] = Z, n.pointShadowMatrix[g] = b.shadow.matrix, _++;
        }
        n.point[g] = W, g++;
      } else if (b.isHemisphereLight) {
        const W = t.get(b);
        W.skyColor.copy(b.color).multiplyScalar(k), W.groundColor.copy(b.groundColor).multiplyScalar(k), n.hemi[m] = W, m++;
      }
    }
    p > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = ot.LTC_FLOAT_1, n.rectAreaLTC2 = ot.LTC_FLOAT_2) : (n.rectAreaLTC1 = ot.LTC_HALF_1, n.rectAreaLTC2 = ot.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
    const C = n.hash;
    (C.directionalLength !== f || C.pointLength !== g || C.spotLength !== v || C.rectAreaLength !== p || C.hemiLength !== m || C.numDirectionalShadows !== y || C.numPointShadows !== _ || C.numSpotShadows !== M || C.numSpotMaps !== R || C.numLightProbes !== w) && (n.directional.length = f, n.spot.length = v, n.rectArea.length = p, n.point.length = g, n.hemi.length = m, n.directionalShadow.length = y, n.directionalShadowMap.length = y, n.pointShadow.length = _, n.pointShadowMap.length = _, n.spotShadow.length = M, n.spotShadowMap.length = M, n.directionalShadowMatrix.length = y, n.pointShadowMatrix.length = _, n.spotLightMatrix.length = M + R - T, n.spotLightMap.length = R, n.numSpotLightShadowsWithMaps = T, n.numLightProbes = w, C.directionalLength = f, C.pointLength = g, C.spotLength = v, C.rectAreaLength = p, C.hemiLength = m, C.numDirectionalShadows = y, C.numPointShadows = _, C.numSpotShadows = M, C.numSpotMaps = R, C.numLightProbes = w, n.version = av++);
  }
  function l(c, h) {
    let u = 0, d = 0, f = 0, g = 0, v = 0;
    const p = h.matrixWorldInverse;
    for (let m = 0, y = c.length; m < y; m++) {
      const _ = c[m];
      if (_.isDirectionalLight) {
        const M = n.directional[u];
        M.direction.setFromMatrixPosition(_.matrixWorld), s.setFromMatrixPosition(_.target.matrixWorld), M.direction.sub(s), M.direction.transformDirection(p), u++;
      } else if (_.isSpotLight) {
        const M = n.spot[f];
        M.position.setFromMatrixPosition(_.matrixWorld), M.position.applyMatrix4(p), M.direction.setFromMatrixPosition(_.matrixWorld), s.setFromMatrixPosition(_.target.matrixWorld), M.direction.sub(s), M.direction.transformDirection(p), f++;
      } else if (_.isRectAreaLight) {
        const M = n.rectArea[g];
        M.position.setFromMatrixPosition(_.matrixWorld), M.position.applyMatrix4(p), o.identity(), r.copy(_.matrixWorld), r.premultiply(p), o.extractRotation(r), M.halfWidth.set(_.width * 0.5, 0, 0), M.halfHeight.set(0, _.height * 0.5, 0), M.halfWidth.applyMatrix4(o), M.halfHeight.applyMatrix4(o), g++;
      } else if (_.isPointLight) {
        const M = n.point[d];
        M.position.setFromMatrixPosition(_.matrixWorld), M.position.applyMatrix4(p), d++;
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
  const t = new cv(i), e = [], n = [];
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
function hv(i) {
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
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = $f, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class dv extends vn {
  constructor(t) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
  }
}
const fv = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, pv = `uniform sampler2D shadow_pass;
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
function mv(i, t, e) {
  let n = new Ul();
  const s = new nt(), r = new nt(), o = new se(), a = new uv({ depthPacking: Xf }), l = new dv(), c = {}, h = e.maxTextureSize, u = { [Hn]: je, [je]: Hn, [on]: on }, d = new oi({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new nt() },
      radius: { value: 4 }
    },
    vertexShader: fv,
    fragmentShader: pv
  }), f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new Ie();
  g.setAttribute(
    "position",
    new Ue(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const v = new ge(g, d), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = bu;
  let m = this.type;
  this.render = function(T, w, C) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || T.length === 0) return;
    const B = i.getRenderTarget(), x = i.getActiveCubeFace(), b = i.getActiveMipmapLevel(), F = i.state;
    F.setBlending(ii), F.buffers.color.setClear(1, 1, 1, 1), F.buffers.depth.setTest(!0), F.setScissorTest(!1);
    const k = m !== Un && this.type === Un, G = m === Un && this.type !== Un;
    for (let Z = 0, W = T.length; Z < W; Z++) {
      const et = T[Z], $ = et.shadow;
      if ($ === void 0) {
        console.warn("THREE.WebGLShadowMap:", et, "has no shadow.");
        continue;
      }
      if ($.autoUpdate === !1 && $.needsUpdate === !1) continue;
      s.copy($.mapSize);
      const lt = $.getFrameExtents();
      if (s.multiply(lt), r.copy($.mapSize), (s.x > h || s.y > h) && (s.x > h && (r.x = Math.floor(h / lt.x), s.x = r.x * lt.x, $.mapSize.x = r.x), s.y > h && (r.y = Math.floor(h / lt.y), s.y = r.y * lt.y, $.mapSize.y = r.y)), $.map === null || k === !0 || G === !0) {
        const Mt = this.type !== Un ? { minFilter: Ve, magFilter: Ve } : {};
        $.map !== null && $.map.dispose(), $.map = new bi(s.x, s.y, Mt), $.map.texture.name = et.name + ".shadowMap", $.camera.updateProjectionMatrix();
      }
      i.setRenderTarget($.map), i.clear();
      const ut = $.getViewportCount();
      for (let Mt = 0; Mt < ut; Mt++) {
        const ee = $.getViewport(Mt);
        o.set(
          r.x * ee.x,
          r.y * ee.y,
          r.x * ee.z,
          r.y * ee.w
        ), F.viewport(o), $.updateMatrices(et, Mt), n = $.getFrustum(), M(w, C, $.camera, et, this.type);
      }
      $.isPointLightShadow !== !0 && this.type === Un && y($, C), $.needsUpdate = !1;
    }
    m = this.type, p.needsUpdate = !1, i.setRenderTarget(B, x, b);
  };
  function y(T, w) {
    const C = t.update(v);
    d.defines.VSM_SAMPLES !== T.blurSamples && (d.defines.VSM_SAMPLES = T.blurSamples, f.defines.VSM_SAMPLES = T.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), T.mapPass === null && (T.mapPass = new bi(s.x, s.y)), d.uniforms.shadow_pass.value = T.map.texture, d.uniforms.resolution.value = T.mapSize, d.uniforms.radius.value = T.radius, i.setRenderTarget(T.mapPass), i.clear(), i.renderBufferDirect(w, null, C, d, v, null), f.uniforms.shadow_pass.value = T.mapPass.texture, f.uniforms.resolution.value = T.mapSize, f.uniforms.radius.value = T.radius, i.setRenderTarget(T.map), i.clear(), i.renderBufferDirect(w, null, C, f, v, null);
  }
  function _(T, w, C, B) {
    let x = null;
    const b = C.isPointLight === !0 ? T.customDistanceMaterial : T.customDepthMaterial;
    if (b !== void 0)
      x = b;
    else if (x = C.isPointLight === !0 ? l : a, i.localClippingEnabled && w.clipShadows === !0 && Array.isArray(w.clippingPlanes) && w.clippingPlanes.length !== 0 || w.displacementMap && w.displacementScale !== 0 || w.alphaMap && w.alphaTest > 0 || w.map && w.alphaTest > 0) {
      const F = x.uuid, k = w.uuid;
      let G = c[F];
      G === void 0 && (G = {}, c[F] = G);
      let Z = G[k];
      Z === void 0 && (Z = x.clone(), G[k] = Z, w.addEventListener("dispose", R)), x = Z;
    }
    if (x.visible = w.visible, x.wireframe = w.wireframe, B === Un ? x.side = w.shadowSide !== null ? w.shadowSide : w.side : x.side = w.shadowSide !== null ? w.shadowSide : u[w.side], x.alphaMap = w.alphaMap, x.alphaTest = w.alphaTest, x.map = w.map, x.clipShadows = w.clipShadows, x.clippingPlanes = w.clippingPlanes, x.clipIntersection = w.clipIntersection, x.displacementMap = w.displacementMap, x.displacementScale = w.displacementScale, x.displacementBias = w.displacementBias, x.wireframeLinewidth = w.wireframeLinewidth, x.linewidth = w.linewidth, C.isPointLight === !0 && x.isMeshDistanceMaterial === !0) {
      const F = i.properties.get(x);
      F.light = C;
    }
    return x;
  }
  function M(T, w, C, B, x) {
    if (T.visible === !1) return;
    if (T.layers.test(w.layers) && (T.isMesh || T.isLine || T.isPoints) && (T.castShadow || T.receiveShadow && x === Un) && (!T.frustumCulled || n.intersectsObject(T))) {
      T.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse, T.matrixWorld);
      const k = t.update(T), G = T.material;
      if (Array.isArray(G)) {
        const Z = k.groups;
        for (let W = 0, et = Z.length; W < et; W++) {
          const $ = Z[W], lt = G[$.materialIndex];
          if (lt && lt.visible) {
            const ut = _(T, lt, B, x);
            T.onBeforeShadow(i, T, w, C, k, ut, $), i.renderBufferDirect(C, null, k, ut, T, $), T.onAfterShadow(i, T, w, C, k, ut, $);
          }
        }
      } else if (G.visible) {
        const Z = _(T, G, B, x);
        T.onBeforeShadow(i, T, w, C, k, Z, null), i.renderBufferDirect(C, null, k, Z, T, null), T.onAfterShadow(i, T, w, C, k, Z, null);
      }
    }
    const F = T.children;
    for (let k = 0, G = F.length; k < G; k++)
      M(F[k], w, C, B, x);
  }
  function R(T) {
    T.target.removeEventListener("dispose", R);
    for (const C in c) {
      const B = c[C], x = T.target.uuid;
      x in B && (B[x].dispose(), delete B[x]);
    }
  }
}
const gv = {
  [Ea]: wa,
  [Ta]: Ca,
  [Aa]: Pa,
  [os]: Ra,
  [wa]: Ea,
  [Ca]: Ta,
  [Pa]: Aa,
  [Ra]: os
};
function _v(i) {
  function t() {
    let N = !1;
    const dt = new se();
    let X = null;
    const Q = new se(0, 0, 0, 0);
    return {
      setMask: function(ct) {
        X !== ct && !N && (i.colorMask(ct, ct, ct, ct), X = ct);
      },
      setLocked: function(ct) {
        N = ct;
      },
      setClear: function(ct, ft, Kt, Ee, We) {
        We === !0 && (ct *= Ee, ft *= Ee, Kt *= Ee), dt.set(ct, ft, Kt, Ee), Q.equals(dt) === !1 && (i.clearColor(ct, ft, Kt, Ee), Q.copy(dt));
      },
      reset: function() {
        N = !1, X = null, Q.set(-1, 0, 0, 0);
      }
    };
  }
  function e() {
    let N = !1, dt = !1, X = null, Q = null, ct = null;
    return {
      setReversed: function(ft) {
        dt = ft;
      },
      setTest: function(ft) {
        ft ? xt(i.DEPTH_TEST) : pt(i.DEPTH_TEST);
      },
      setMask: function(ft) {
        X !== ft && !N && (i.depthMask(ft), X = ft);
      },
      setFunc: function(ft) {
        if (dt && (ft = gv[ft]), Q !== ft) {
          switch (ft) {
            case Ea:
              i.depthFunc(i.NEVER);
              break;
            case wa:
              i.depthFunc(i.ALWAYS);
              break;
            case Ta:
              i.depthFunc(i.LESS);
              break;
            case os:
              i.depthFunc(i.LEQUAL);
              break;
            case Aa:
              i.depthFunc(i.EQUAL);
              break;
            case Ra:
              i.depthFunc(i.GEQUAL);
              break;
            case Ca:
              i.depthFunc(i.GREATER);
              break;
            case Pa:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          Q = ft;
        }
      },
      setLocked: function(ft) {
        N = ft;
      },
      setClear: function(ft) {
        ct !== ft && (i.clearDepth(ft), ct = ft);
      },
      reset: function() {
        N = !1, X = null, Q = null, ct = null;
      }
    };
  }
  function n() {
    let N = !1, dt = null, X = null, Q = null, ct = null, ft = null, Kt = null, Ee = null, We = null;
    return {
      setTest: function(ne) {
        N || (ne ? xt(i.STENCIL_TEST) : pt(i.STENCIL_TEST));
      },
      setMask: function(ne) {
        dt !== ne && !N && (i.stencilMask(ne), dt = ne);
      },
      setFunc: function(ne, $e, Rn) {
        (X !== ne || Q !== $e || ct !== Rn) && (i.stencilFunc(ne, $e, Rn), X = ne, Q = $e, ct = Rn);
      },
      setOp: function(ne, $e, Rn) {
        (ft !== ne || Kt !== $e || Ee !== Rn) && (i.stencilOp(ne, $e, Rn), ft = ne, Kt = $e, Ee = Rn);
      },
      setLocked: function(ne) {
        N = ne;
      },
      setClear: function(ne) {
        We !== ne && (i.clearStencil(ne), We = ne);
      },
      reset: function() {
        N = !1, dt = null, X = null, Q = null, ct = null, ft = null, Kt = null, Ee = null, We = null;
      }
    };
  }
  const s = new t(), r = new e(), o = new n(), a = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
  let c = {}, h = {}, u = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, v = null, p = null, m = null, y = null, _ = null, M = null, R = null, T = new Tt(0, 0, 0), w = 0, C = !1, B = null, x = null, b = null, F = null, k = null;
  const G = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let Z = !1, W = 0;
  const et = i.getParameter(i.VERSION);
  et.indexOf("WebGL") !== -1 ? (W = parseFloat(/^WebGL (\d)/.exec(et)[1]), Z = W >= 1) : et.indexOf("OpenGL ES") !== -1 && (W = parseFloat(/^OpenGL ES (\d)/.exec(et)[1]), Z = W >= 2);
  let $ = null, lt = {};
  const ut = i.getParameter(i.SCISSOR_BOX), Mt = i.getParameter(i.VIEWPORT), ee = new se().fromArray(ut), ae = new se().fromArray(Mt);
  function j(N, dt, X, Q) {
    const ct = new Uint8Array(4), ft = i.createTexture();
    i.bindTexture(N, ft), i.texParameteri(N, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(N, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let Kt = 0; Kt < X; Kt++)
      N === i.TEXTURE_3D || N === i.TEXTURE_2D_ARRAY ? i.texImage3D(dt, 0, i.RGBA, 1, 1, Q, 0, i.RGBA, i.UNSIGNED_BYTE, ct) : i.texImage2D(dt + Kt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, ct);
    return ft;
  }
  const it = {};
  it[i.TEXTURE_2D] = j(i.TEXTURE_2D, i.TEXTURE_2D, 1), it[i.TEXTURE_CUBE_MAP] = j(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), it[i.TEXTURE_2D_ARRAY] = j(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), it[i.TEXTURE_3D] = j(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), r.setClear(1), o.setClear(0), xt(i.DEPTH_TEST), r.setFunc(os), Xt(!1), Jt(vc), xt(i.CULL_FACE), I(ii);
  function xt(N) {
    c[N] !== !0 && (i.enable(N), c[N] = !0);
  }
  function pt(N) {
    c[N] !== !1 && (i.disable(N), c[N] = !1);
  }
  function Bt(N, dt) {
    return h[N] !== dt ? (i.bindFramebuffer(N, dt), h[N] = dt, N === i.DRAW_FRAMEBUFFER && (h[i.FRAMEBUFFER] = dt), N === i.FRAMEBUFFER && (h[i.DRAW_FRAMEBUFFER] = dt), !0) : !1;
  }
  function Ct(N, dt) {
    let X = d, Q = !1;
    if (N) {
      X = u.get(dt), X === void 0 && (X = [], u.set(dt, X));
      const ct = N.textures;
      if (X.length !== ct.length || X[0] !== i.COLOR_ATTACHMENT0) {
        for (let ft = 0, Kt = ct.length; ft < Kt; ft++)
          X[ft] = i.COLOR_ATTACHMENT0 + ft;
        X.length = ct.length, Q = !0;
      }
    } else
      X[0] !== i.BACK && (X[0] = i.BACK, Q = !0);
    Q && i.drawBuffers(X);
  }
  function Yt(N) {
    return f !== N ? (i.useProgram(N), f = N, !0) : !1;
  }
  const fe = {
    [vi]: i.FUNC_ADD,
    [gf]: i.FUNC_SUBTRACT,
    [_f]: i.FUNC_REVERSE_SUBTRACT
  };
  fe[vf] = i.MIN, fe[xf] = i.MAX;
  const qt = {
    [yf]: i.ZERO,
    [Mf]: i.ONE,
    [Sf]: i.SRC_COLOR,
    [Sa]: i.SRC_ALPHA,
    [Rf]: i.SRC_ALPHA_SATURATE,
    [Tf]: i.DST_COLOR,
    [Ef]: i.DST_ALPHA,
    [bf]: i.ONE_MINUS_SRC_COLOR,
    [ba]: i.ONE_MINUS_SRC_ALPHA,
    [Af]: i.ONE_MINUS_DST_COLOR,
    [wf]: i.ONE_MINUS_DST_ALPHA,
    [Cf]: i.CONSTANT_COLOR,
    [Pf]: i.ONE_MINUS_CONSTANT_COLOR,
    [Lf]: i.CONSTANT_ALPHA,
    [If]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function I(N, dt, X, Q, ct, ft, Kt, Ee, We, ne) {
    if (N === ii) {
      g === !0 && (pt(i.BLEND), g = !1);
      return;
    }
    if (g === !1 && (xt(i.BLEND), g = !0), N !== mf) {
      if (N !== v || ne !== C) {
        if ((p !== vi || _ !== vi) && (i.blendEquation(i.FUNC_ADD), p = vi, _ = vi), ne)
          switch (N) {
            case Qi:
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
              console.error("THREE.WebGLState: Invalid blending: ", N);
              break;
          }
        else
          switch (N) {
            case Qi:
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
              console.error("THREE.WebGLState: Invalid blending: ", N);
              break;
          }
        m = null, y = null, M = null, R = null, T.set(0, 0, 0), w = 0, v = N, C = ne;
      }
      return;
    }
    ct = ct || dt, ft = ft || X, Kt = Kt || Q, (dt !== p || ct !== _) && (i.blendEquationSeparate(fe[dt], fe[ct]), p = dt, _ = ct), (X !== m || Q !== y || ft !== M || Kt !== R) && (i.blendFuncSeparate(qt[X], qt[Q], qt[ft], qt[Kt]), m = X, y = Q, M = ft, R = Kt), (Ee.equals(T) === !1 || We !== w) && (i.blendColor(Ee.r, Ee.g, Ee.b, We), T.copy(Ee), w = We), v = N, C = !1;
  }
  function qe(N, dt) {
    N.side === on ? pt(i.CULL_FACE) : xt(i.CULL_FACE);
    let X = N.side === je;
    dt && (X = !X), Xt(X), N.blending === Qi && N.transparent === !1 ? I(ii) : I(N.blending, N.blendEquation, N.blendSrc, N.blendDst, N.blendEquationAlpha, N.blendSrcAlpha, N.blendDstAlpha, N.blendColor, N.blendAlpha, N.premultipliedAlpha), r.setFunc(N.depthFunc), r.setTest(N.depthTest), r.setMask(N.depthWrite), s.setMask(N.colorWrite);
    const Q = N.stencilWrite;
    o.setTest(Q), Q && (o.setMask(N.stencilWriteMask), o.setFunc(N.stencilFunc, N.stencilRef, N.stencilFuncMask), o.setOp(N.stencilFail, N.stencilZFail, N.stencilZPass)), _e(N.polygonOffset, N.polygonOffsetFactor, N.polygonOffsetUnits), N.alphaToCoverage === !0 ? xt(i.SAMPLE_ALPHA_TO_COVERAGE) : pt(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Xt(N) {
    B !== N && (N ? i.frontFace(i.CW) : i.frontFace(i.CCW), B = N);
  }
  function Jt(N) {
    N !== ff ? (xt(i.CULL_FACE), N !== x && (N === vc ? i.cullFace(i.BACK) : N === pf ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : pt(i.CULL_FACE), x = N;
  }
  function It(N) {
    N !== b && (Z && i.lineWidth(N), b = N);
  }
  function _e(N, dt, X) {
    N ? (xt(i.POLYGON_OFFSET_FILL), (F !== dt || k !== X) && (i.polygonOffset(dt, X), F = dt, k = X)) : pt(i.POLYGON_OFFSET_FILL);
  }
  function Ut(N) {
    N ? xt(i.SCISSOR_TEST) : pt(i.SCISSOR_TEST);
  }
  function A(N) {
    N === void 0 && (N = i.TEXTURE0 + G - 1), $ !== N && (i.activeTexture(N), $ = N);
  }
  function S(N, dt, X) {
    X === void 0 && ($ === null ? X = i.TEXTURE0 + G - 1 : X = $);
    let Q = lt[X];
    Q === void 0 && (Q = { type: void 0, texture: void 0 }, lt[X] = Q), (Q.type !== N || Q.texture !== dt) && ($ !== X && (i.activeTexture(X), $ = X), i.bindTexture(N, dt || it[N]), Q.type = N, Q.texture = dt);
  }
  function z() {
    const N = lt[$];
    N !== void 0 && N.type !== void 0 && (i.bindTexture(N.type, null), N.type = void 0, N.texture = void 0);
  }
  function q() {
    try {
      i.compressedTexImage2D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function tt() {
    try {
      i.compressedTexImage3D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Y() {
    try {
      i.texSubImage2D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function St() {
    try {
      i.texSubImage3D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function at() {
    try {
      i.compressedTexSubImage2D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function mt() {
    try {
      i.compressedTexSubImage3D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Qt() {
    try {
      i.texStorage2D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function st() {
    try {
      i.texStorage3D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function gt() {
    try {
      i.texImage2D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Dt() {
    try {
      i.texImage3D.apply(i, arguments);
    } catch (N) {
      console.error("THREE.WebGLState:", N);
    }
  }
  function Nt(N) {
    ee.equals(N) === !1 && (i.scissor(N.x, N.y, N.z, N.w), ee.copy(N));
  }
  function _t(N) {
    ae.equals(N) === !1 && (i.viewport(N.x, N.y, N.z, N.w), ae.copy(N));
  }
  function jt(N, dt) {
    let X = l.get(dt);
    X === void 0 && (X = /* @__PURE__ */ new WeakMap(), l.set(dt, X));
    let Q = X.get(N);
    Q === void 0 && (Q = i.getUniformBlockIndex(dt, N.name), X.set(N, Q));
  }
  function kt(N, dt) {
    const Q = l.get(dt).get(N);
    a.get(dt) !== Q && (i.uniformBlockBinding(dt, Q, N.__bindingPointIndex), a.set(dt, Q));
  }
  function me() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), c = {}, $ = null, lt = {}, h = {}, u = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, v = null, p = null, m = null, y = null, _ = null, M = null, R = null, T = new Tt(0, 0, 0), w = 0, C = !1, B = null, x = null, b = null, F = null, k = null, ee.set(0, 0, i.canvas.width, i.canvas.height), ae.set(0, 0, i.canvas.width, i.canvas.height), s.reset(), r.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: r,
      stencil: o
    },
    enable: xt,
    disable: pt,
    bindFramebuffer: Bt,
    drawBuffers: Ct,
    useProgram: Yt,
    setBlending: I,
    setMaterial: qe,
    setFlipSided: Xt,
    setCullFace: Jt,
    setLineWidth: It,
    setPolygonOffset: _e,
    setScissorTest: Ut,
    activeTexture: A,
    bindTexture: S,
    unbindTexture: z,
    compressedTexImage2D: q,
    compressedTexImage3D: tt,
    texImage2D: gt,
    texImage3D: Dt,
    updateUBOMapping: jt,
    uniformBlockBinding: kt,
    texStorage2D: Qt,
    texStorage3D: st,
    texSubImage2D: Y,
    texSubImage3D: St,
    compressedTexSubImage2D: at,
    compressedTexSubImage3D: mt,
    scissor: Nt,
    viewport: _t,
    reset: me
  };
}
function mh(i, t, e, n) {
  const s = vv(n);
  switch (e) {
    case Lu:
      return i * t;
    case Du:
      return i * t;
    case Nu:
      return i * t * 2;
    case Rl:
      return i * t / s.components * s.byteLength;
    case Cl:
      return i * t / s.components * s.byteLength;
    case Uu:
      return i * t * 2 / s.components * s.byteLength;
    case Pl:
      return i * t * 2 / s.components * s.byteLength;
    case Iu:
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
    case Na:
    case Oa:
      return Math.max(i, 16) * Math.max(t, 8) / 4;
    case Da:
    case Ua:
      return Math.max(i, 8) * Math.max(t, 8) / 2;
    case Fa:
    case Ba:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case ka:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case za:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Ha:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Ga:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Va:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case Wa:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case $a:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case Xa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case ja:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case Ya:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case qa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case Ka:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case Za:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case Ja:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case Qa:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case io:
    case tl:
    case el:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    case Ou:
    case nl:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case il:
    case sl:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${e} format.`
  );
}
function vv(i) {
  switch (i) {
    case Gn:
    case Ru:
      return { byteLength: 1, components: 1 };
    case qs:
    case Cu:
    case or:
      return { byteLength: 2, components: 1 };
    case Tl:
    case Al:
      return { byteLength: 2, components: 4 };
    case Si:
    case wl:
    case _n:
      return { byteLength: 4, components: 1 };
    case Pu:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
function xv(i, t, e, n, s, r, o) {
  const a = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new nt(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const d = /* @__PURE__ */ new WeakMap();
  let f = !1;
  try {
    f = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(A, S) {
    return f ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(A, S)
    ) : Js("canvas");
  }
  function v(A, S, z) {
    let q = 1;
    const tt = Ut(A);
    if ((tt.width > z || tt.height > z) && (q = z / Math.max(tt.width, tt.height)), q < 1)
      if (typeof HTMLImageElement < "u" && A instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && A instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && A instanceof ImageBitmap || typeof VideoFrame < "u" && A instanceof VideoFrame) {
        const Y = Math.floor(q * tt.width), St = Math.floor(q * tt.height);
        u === void 0 && (u = g(Y, St));
        const at = S ? g(Y, St) : u;
        return at.width = Y, at.height = St, at.getContext("2d").drawImage(A, 0, 0, Y, St), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + tt.width + "x" + tt.height + ") to (" + Y + "x" + St + ")."), at;
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
  function y(A, S, z, q, tt = !1) {
    if (A !== null) {
      if (i[A] !== void 0) return i[A];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + A + "'");
    }
    let Y = S;
    if (S === i.RED && (z === i.FLOAT && (Y = i.R32F), z === i.HALF_FLOAT && (Y = i.R16F), z === i.UNSIGNED_BYTE && (Y = i.R8)), S === i.RED_INTEGER && (z === i.UNSIGNED_BYTE && (Y = i.R8UI), z === i.UNSIGNED_SHORT && (Y = i.R16UI), z === i.UNSIGNED_INT && (Y = i.R32UI), z === i.BYTE && (Y = i.R8I), z === i.SHORT && (Y = i.R16I), z === i.INT && (Y = i.R32I)), S === i.RG && (z === i.FLOAT && (Y = i.RG32F), z === i.HALF_FLOAT && (Y = i.RG16F), z === i.UNSIGNED_BYTE && (Y = i.RG8)), S === i.RG_INTEGER && (z === i.UNSIGNED_BYTE && (Y = i.RG8UI), z === i.UNSIGNED_SHORT && (Y = i.RG16UI), z === i.UNSIGNED_INT && (Y = i.RG32UI), z === i.BYTE && (Y = i.RG8I), z === i.SHORT && (Y = i.RG16I), z === i.INT && (Y = i.RG32I)), S === i.RGB_INTEGER && (z === i.UNSIGNED_BYTE && (Y = i.RGB8UI), z === i.UNSIGNED_SHORT && (Y = i.RGB16UI), z === i.UNSIGNED_INT && (Y = i.RGB32UI), z === i.BYTE && (Y = i.RGB8I), z === i.SHORT && (Y = i.RGB16I), z === i.INT && (Y = i.RGB32I)), S === i.RGBA_INTEGER && (z === i.UNSIGNED_BYTE && (Y = i.RGBA8UI), z === i.UNSIGNED_SHORT && (Y = i.RGBA16UI), z === i.UNSIGNED_INT && (Y = i.RGBA32UI), z === i.BYTE && (Y = i.RGBA8I), z === i.SHORT && (Y = i.RGBA16I), z === i.INT && (Y = i.RGBA32I)), S === i.RGB && z === i.UNSIGNED_INT_5_9_9_9_REV && (Y = i.RGB9_E5), S === i.RGBA) {
      const St = tt ? co : te.getTransfer(q);
      z === i.FLOAT && (Y = i.RGBA32F), z === i.HALF_FLOAT && (Y = i.RGBA16F), z === i.UNSIGNED_BYTE && (Y = St === xe ? i.SRGB8_ALPHA8 : i.RGBA8), z === i.UNSIGNED_SHORT_4_4_4_4 && (Y = i.RGBA4), z === i.UNSIGNED_SHORT_5_5_5_1 && (Y = i.RGB5_A1);
    }
    return (Y === i.R16F || Y === i.R32F || Y === i.RG16F || Y === i.RG32F || Y === i.RGBA16F || Y === i.RGBA32F) && t.get("EXT_color_buffer_float"), Y;
  }
  function _(A, S) {
    let z;
    return A ? S === null || S === Si || S === cs ? z = i.DEPTH24_STENCIL8 : S === _n ? z = i.DEPTH32F_STENCIL8 : S === qs && (z = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : S === null || S === Si || S === cs ? z = i.DEPTH_COMPONENT24 : S === _n ? z = i.DEPTH_COMPONENT32F : S === qs && (z = i.DEPTH_COMPONENT16), z;
  }
  function M(A, S) {
    return p(A) === !0 || A.isFramebufferTexture && A.minFilter !== Ve && A.minFilter !== tn ? Math.log2(Math.max(S.width, S.height)) + 1 : A.mipmaps !== void 0 && A.mipmaps.length > 0 ? A.mipmaps.length : A.isCompressedTexture && Array.isArray(A.image) ? S.mipmaps.length : 1;
  }
  function R(A) {
    const S = A.target;
    S.removeEventListener("dispose", R), w(S), S.isVideoTexture && h.delete(S);
  }
  function T(A) {
    const S = A.target;
    S.removeEventListener("dispose", T), B(S);
  }
  function w(A) {
    const S = n.get(A);
    if (S.__webglInit === void 0) return;
    const z = A.source, q = d.get(z);
    if (q) {
      const tt = q[S.__cacheKey];
      tt.usedTimes--, tt.usedTimes === 0 && C(A), Object.keys(q).length === 0 && d.delete(z);
    }
    n.remove(A);
  }
  function C(A) {
    const S = n.get(A);
    i.deleteTexture(S.__webglTexture);
    const z = A.source, q = d.get(z);
    delete q[S.__cacheKey], o.memory.textures--;
  }
  function B(A) {
    const S = n.get(A);
    if (A.depthTexture && A.depthTexture.dispose(), A.isWebGLCubeRenderTarget)
      for (let q = 0; q < 6; q++) {
        if (Array.isArray(S.__webglFramebuffer[q]))
          for (let tt = 0; tt < S.__webglFramebuffer[q].length; tt++) i.deleteFramebuffer(S.__webglFramebuffer[q][tt]);
        else
          i.deleteFramebuffer(S.__webglFramebuffer[q]);
        S.__webglDepthbuffer && i.deleteRenderbuffer(S.__webglDepthbuffer[q]);
      }
    else {
      if (Array.isArray(S.__webglFramebuffer))
        for (let q = 0; q < S.__webglFramebuffer.length; q++) i.deleteFramebuffer(S.__webglFramebuffer[q]);
      else
        i.deleteFramebuffer(S.__webglFramebuffer);
      if (S.__webglDepthbuffer && i.deleteRenderbuffer(S.__webglDepthbuffer), S.__webglMultisampledFramebuffer && i.deleteFramebuffer(S.__webglMultisampledFramebuffer), S.__webglColorRenderbuffer)
        for (let q = 0; q < S.__webglColorRenderbuffer.length; q++)
          S.__webglColorRenderbuffer[q] && i.deleteRenderbuffer(S.__webglColorRenderbuffer[q]);
      S.__webglDepthRenderbuffer && i.deleteRenderbuffer(S.__webglDepthRenderbuffer);
    }
    const z = A.textures;
    for (let q = 0, tt = z.length; q < tt; q++) {
      const Y = n.get(z[q]);
      Y.__webglTexture && (i.deleteTexture(Y.__webglTexture), o.memory.textures--), n.remove(z[q]);
    }
    n.remove(A);
  }
  let x = 0;
  function b() {
    x = 0;
  }
  function F() {
    const A = x;
    return A >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + A + " texture units while this GPU supports only " + s.maxTextures), x += 1, A;
  }
  function k(A) {
    const S = [];
    return S.push(A.wrapS), S.push(A.wrapT), S.push(A.wrapR || 0), S.push(A.magFilter), S.push(A.minFilter), S.push(A.anisotropy), S.push(A.internalFormat), S.push(A.format), S.push(A.type), S.push(A.generateMipmaps), S.push(A.premultiplyAlpha), S.push(A.flipY), S.push(A.unpackAlignment), S.push(A.colorSpace), S.join();
  }
  function G(A, S) {
    const z = n.get(A);
    if (A.isVideoTexture && It(A), A.isRenderTargetTexture === !1 && A.version > 0 && z.__version !== A.version) {
      const q = A.image;
      if (q === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (q.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        ae(z, A, S);
        return;
      }
    }
    e.bindTexture(i.TEXTURE_2D, z.__webglTexture, i.TEXTURE0 + S);
  }
  function Z(A, S) {
    const z = n.get(A);
    if (A.version > 0 && z.__version !== A.version) {
      ae(z, A, S);
      return;
    }
    e.bindTexture(i.TEXTURE_2D_ARRAY, z.__webglTexture, i.TEXTURE0 + S);
  }
  function W(A, S) {
    const z = n.get(A);
    if (A.version > 0 && z.__version !== A.version) {
      ae(z, A, S);
      return;
    }
    e.bindTexture(i.TEXTURE_3D, z.__webglTexture, i.TEXTURE0 + S);
  }
  function et(A, S) {
    const z = n.get(A);
    if (A.version > 0 && z.__version !== A.version) {
      j(z, A, S);
      return;
    }
    e.bindTexture(i.TEXTURE_CUBE_MAP, z.__webglTexture, i.TEXTURE0 + S);
  }
  const $ = {
    [ri]: i.REPEAT,
    [ei]: i.CLAMP_TO_EDGE,
    [lo]: i.MIRRORED_REPEAT
  }, lt = {
    [Ve]: i.NEAREST,
    [Au]: i.NEAREST_MIPMAP_NEAREST,
    [Fs]: i.NEAREST_MIPMAP_LINEAR,
    [tn]: i.LINEAR,
    [Jr]: i.LINEAR_MIPMAP_NEAREST,
    [Bn]: i.LINEAR_MIPMAP_LINEAR
  }, ut = {
    [Yf]: i.NEVER,
    [tp]: i.ALWAYS,
    [qf]: i.LESS,
    [ku]: i.LEQUAL,
    [Kf]: i.EQUAL,
    [Qf]: i.GEQUAL,
    [Zf]: i.GREATER,
    [Jf]: i.NOTEQUAL
  };
  function Mt(A, S) {
    if (S.type === _n && t.has("OES_texture_float_linear") === !1 && (S.magFilter === tn || S.magFilter === Jr || S.magFilter === Fs || S.magFilter === Bn || S.minFilter === tn || S.minFilter === Jr || S.minFilter === Fs || S.minFilter === Bn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(A, i.TEXTURE_WRAP_S, $[S.wrapS]), i.texParameteri(A, i.TEXTURE_WRAP_T, $[S.wrapT]), (A === i.TEXTURE_3D || A === i.TEXTURE_2D_ARRAY) && i.texParameteri(A, i.TEXTURE_WRAP_R, $[S.wrapR]), i.texParameteri(A, i.TEXTURE_MAG_FILTER, lt[S.magFilter]), i.texParameteri(A, i.TEXTURE_MIN_FILTER, lt[S.minFilter]), S.compareFunction && (i.texParameteri(A, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(A, i.TEXTURE_COMPARE_FUNC, ut[S.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (S.magFilter === Ve || S.minFilter !== Fs && S.minFilter !== Bn || S.type === _n && t.has("OES_texture_float_linear") === !1) return;
      if (S.anisotropy > 1 || n.get(S).__currentAnisotropy) {
        const z = t.get("EXT_texture_filter_anisotropic");
        i.texParameterf(A, z.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(S.anisotropy, s.getMaxAnisotropy())), n.get(S).__currentAnisotropy = S.anisotropy;
      }
    }
  }
  function ee(A, S) {
    let z = !1;
    A.__webglInit === void 0 && (A.__webglInit = !0, S.addEventListener("dispose", R));
    const q = S.source;
    let tt = d.get(q);
    tt === void 0 && (tt = {}, d.set(q, tt));
    const Y = k(S);
    if (Y !== A.__cacheKey) {
      tt[Y] === void 0 && (tt[Y] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, o.memory.textures++, z = !0), tt[Y].usedTimes++;
      const St = tt[A.__cacheKey];
      St !== void 0 && (tt[A.__cacheKey].usedTimes--, St.usedTimes === 0 && C(S)), A.__cacheKey = Y, A.__webglTexture = tt[Y].texture;
    }
    return z;
  }
  function ae(A, S, z) {
    let q = i.TEXTURE_2D;
    (S.isDataArrayTexture || S.isCompressedArrayTexture) && (q = i.TEXTURE_2D_ARRAY), S.isData3DTexture && (q = i.TEXTURE_3D);
    const tt = ee(A, S), Y = S.source;
    e.bindTexture(q, A.__webglTexture, i.TEXTURE0 + z);
    const St = n.get(Y);
    if (Y.version !== St.__version || tt === !0) {
      e.activeTexture(i.TEXTURE0 + z);
      const at = te.getPrimaries(te.workingColorSpace), mt = S.colorSpace === ti ? null : te.getPrimaries(S.colorSpace), Qt = S.colorSpace === ti || at === mt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, S.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, S.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Qt);
      let st = v(S.image, !1, s.maxTextureSize);
      st = _e(S, st);
      const gt = r.convert(S.format, S.colorSpace), Dt = r.convert(S.type);
      let Nt = y(S.internalFormat, gt, Dt, S.colorSpace, S.isVideoTexture);
      Mt(q, S);
      let _t;
      const jt = S.mipmaps, kt = S.isVideoTexture !== !0, me = St.__version === void 0 || tt === !0, N = Y.dataReady, dt = M(S, st);
      if (S.isDepthTexture)
        Nt = _(S.format === hs, S.type), me && (kt ? e.texStorage2D(i.TEXTURE_2D, 1, Nt, st.width, st.height) : e.texImage2D(i.TEXTURE_2D, 0, Nt, st.width, st.height, 0, gt, Dt, null));
      else if (S.isDataTexture)
        if (jt.length > 0) {
          kt && me && e.texStorage2D(i.TEXTURE_2D, dt, Nt, jt[0].width, jt[0].height);
          for (let X = 0, Q = jt.length; X < Q; X++)
            _t = jt[X], kt ? N && e.texSubImage2D(i.TEXTURE_2D, X, 0, 0, _t.width, _t.height, gt, Dt, _t.data) : e.texImage2D(i.TEXTURE_2D, X, Nt, _t.width, _t.height, 0, gt, Dt, _t.data);
          S.generateMipmaps = !1;
        } else
          kt ? (me && e.texStorage2D(i.TEXTURE_2D, dt, Nt, st.width, st.height), N && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, st.width, st.height, gt, Dt, st.data)) : e.texImage2D(i.TEXTURE_2D, 0, Nt, st.width, st.height, 0, gt, Dt, st.data);
      else if (S.isCompressedTexture)
        if (S.isCompressedArrayTexture) {
          kt && me && e.texStorage3D(i.TEXTURE_2D_ARRAY, dt, Nt, jt[0].width, jt[0].height, st.depth);
          for (let X = 0, Q = jt.length; X < Q; X++)
            if (_t = jt[X], S.format !== ln)
              if (gt !== null)
                if (kt) {
                  if (N)
                    if (S.layerUpdates.size > 0) {
                      const ct = mh(_t.width, _t.height, S.format, S.type);
                      for (const ft of S.layerUpdates) {
                        const Kt = _t.data.subarray(
                          ft * ct / _t.data.BYTES_PER_ELEMENT,
                          (ft + 1) * ct / _t.data.BYTES_PER_ELEMENT
                        );
                        e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, ft, _t.width, _t.height, 1, gt, Kt, 0, 0);
                      }
                      S.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, 0, _t.width, _t.height, st.depth, gt, _t.data, 0, 0);
                } else
                  e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, X, Nt, _t.width, _t.height, st.depth, 0, _t.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              kt ? N && e.texSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, 0, _t.width, _t.height, st.depth, gt, Dt, _t.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, X, Nt, _t.width, _t.height, st.depth, 0, gt, Dt, _t.data);
        } else {
          kt && me && e.texStorage2D(i.TEXTURE_2D, dt, Nt, jt[0].width, jt[0].height);
          for (let X = 0, Q = jt.length; X < Q; X++)
            _t = jt[X], S.format !== ln ? gt !== null ? kt ? N && e.compressedTexSubImage2D(i.TEXTURE_2D, X, 0, 0, _t.width, _t.height, gt, _t.data) : e.compressedTexImage2D(i.TEXTURE_2D, X, Nt, _t.width, _t.height, 0, _t.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : kt ? N && e.texSubImage2D(i.TEXTURE_2D, X, 0, 0, _t.width, _t.height, gt, Dt, _t.data) : e.texImage2D(i.TEXTURE_2D, X, Nt, _t.width, _t.height, 0, gt, Dt, _t.data);
        }
      else if (S.isDataArrayTexture)
        if (kt) {
          if (me && e.texStorage3D(i.TEXTURE_2D_ARRAY, dt, Nt, st.width, st.height, st.depth), N)
            if (S.layerUpdates.size > 0) {
              const X = mh(st.width, st.height, S.format, S.type);
              for (const Q of S.layerUpdates) {
                const ct = st.data.subarray(
                  Q * X / st.data.BYTES_PER_ELEMENT,
                  (Q + 1) * X / st.data.BYTES_PER_ELEMENT
                );
                e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, Q, st.width, st.height, 1, gt, Dt, ct);
              }
              S.clearLayerUpdates();
            } else
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, st.width, st.height, st.depth, gt, Dt, st.data);
        } else
          e.texImage3D(i.TEXTURE_2D_ARRAY, 0, Nt, st.width, st.height, st.depth, 0, gt, Dt, st.data);
      else if (S.isData3DTexture)
        kt ? (me && e.texStorage3D(i.TEXTURE_3D, dt, Nt, st.width, st.height, st.depth), N && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, st.width, st.height, st.depth, gt, Dt, st.data)) : e.texImage3D(i.TEXTURE_3D, 0, Nt, st.width, st.height, st.depth, 0, gt, Dt, st.data);
      else if (S.isFramebufferTexture) {
        if (me)
          if (kt)
            e.texStorage2D(i.TEXTURE_2D, dt, Nt, st.width, st.height);
          else {
            let X = st.width, Q = st.height;
            for (let ct = 0; ct < dt; ct++)
              e.texImage2D(i.TEXTURE_2D, ct, Nt, X, Q, 0, gt, Dt, null), X >>= 1, Q >>= 1;
          }
      } else if (jt.length > 0) {
        if (kt && me) {
          const X = Ut(jt[0]);
          e.texStorage2D(i.TEXTURE_2D, dt, Nt, X.width, X.height);
        }
        for (let X = 0, Q = jt.length; X < Q; X++)
          _t = jt[X], kt ? N && e.texSubImage2D(i.TEXTURE_2D, X, 0, 0, gt, Dt, _t) : e.texImage2D(i.TEXTURE_2D, X, Nt, gt, Dt, _t);
        S.generateMipmaps = !1;
      } else if (kt) {
        if (me) {
          const X = Ut(st);
          e.texStorage2D(i.TEXTURE_2D, dt, Nt, X.width, X.height);
        }
        N && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, gt, Dt, st);
      } else
        e.texImage2D(i.TEXTURE_2D, 0, Nt, gt, Dt, st);
      p(S) && m(q), St.__version = Y.version, S.onUpdate && S.onUpdate(S);
    }
    A.__version = S.version;
  }
  function j(A, S, z) {
    if (S.image.length !== 6) return;
    const q = ee(A, S), tt = S.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, A.__webglTexture, i.TEXTURE0 + z);
    const Y = n.get(tt);
    if (tt.version !== Y.__version || q === !0) {
      e.activeTexture(i.TEXTURE0 + z);
      const St = te.getPrimaries(te.workingColorSpace), at = S.colorSpace === ti ? null : te.getPrimaries(S.colorSpace), mt = S.colorSpace === ti || St === at ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, S.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, S.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, mt);
      const Qt = S.isCompressedTexture || S.image[0].isCompressedTexture, st = S.image[0] && S.image[0].isDataTexture, gt = [];
      for (let Q = 0; Q < 6; Q++)
        !Qt && !st ? gt[Q] = v(S.image[Q], !0, s.maxCubemapSize) : gt[Q] = st ? S.image[Q].image : S.image[Q], gt[Q] = _e(S, gt[Q]);
      const Dt = gt[0], Nt = r.convert(S.format, S.colorSpace), _t = r.convert(S.type), jt = y(S.internalFormat, Nt, _t, S.colorSpace), kt = S.isVideoTexture !== !0, me = Y.__version === void 0 || q === !0, N = tt.dataReady;
      let dt = M(S, Dt);
      Mt(i.TEXTURE_CUBE_MAP, S);
      let X;
      if (Qt) {
        kt && me && e.texStorage2D(i.TEXTURE_CUBE_MAP, dt, jt, Dt.width, Dt.height);
        for (let Q = 0; Q < 6; Q++) {
          X = gt[Q].mipmaps;
          for (let ct = 0; ct < X.length; ct++) {
            const ft = X[ct];
            S.format !== ln ? Nt !== null ? kt ? N && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct, 0, 0, ft.width, ft.height, Nt, ft.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct, jt, ft.width, ft.height, 0, ft.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : kt ? N && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct, 0, 0, ft.width, ft.height, Nt, _t, ft.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct, jt, ft.width, ft.height, 0, Nt, _t, ft.data);
          }
        }
      } else {
        if (X = S.mipmaps, kt && me) {
          X.length > 0 && dt++;
          const Q = Ut(gt[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, dt, jt, Q.width, Q.height);
        }
        for (let Q = 0; Q < 6; Q++)
          if (st) {
            kt ? N && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, 0, 0, gt[Q].width, gt[Q].height, Nt, _t, gt[Q].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, jt, gt[Q].width, gt[Q].height, 0, Nt, _t, gt[Q].data);
            for (let ct = 0; ct < X.length; ct++) {
              const Kt = X[ct].image[Q].image;
              kt ? N && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct + 1, 0, 0, Kt.width, Kt.height, Nt, _t, Kt.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct + 1, jt, Kt.width, Kt.height, 0, Nt, _t, Kt.data);
            }
          } else {
            kt ? N && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, 0, 0, Nt, _t, gt[Q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, jt, Nt, _t, gt[Q]);
            for (let ct = 0; ct < X.length; ct++) {
              const ft = X[ct];
              kt ? N && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct + 1, 0, 0, Nt, _t, ft.image[Q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ct + 1, jt, Nt, _t, ft.image[Q]);
            }
          }
      }
      p(S) && m(i.TEXTURE_CUBE_MAP), Y.__version = tt.version, S.onUpdate && S.onUpdate(S);
    }
    A.__version = S.version;
  }
  function it(A, S, z, q, tt, Y) {
    const St = r.convert(z.format, z.colorSpace), at = r.convert(z.type), mt = y(z.internalFormat, St, at, z.colorSpace);
    if (!n.get(S).__hasExternalTextures) {
      const st = Math.max(1, S.width >> Y), gt = Math.max(1, S.height >> Y);
      tt === i.TEXTURE_3D || tt === i.TEXTURE_2D_ARRAY ? e.texImage3D(tt, Y, mt, st, gt, S.depth, 0, St, at, null) : e.texImage2D(tt, Y, mt, st, gt, 0, St, at, null);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, A), Jt(S) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, q, tt, n.get(z).__webglTexture, 0, Xt(S)) : (tt === i.TEXTURE_2D || tt >= i.TEXTURE_CUBE_MAP_POSITIVE_X && tt <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, q, tt, n.get(z).__webglTexture, Y), e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function xt(A, S, z) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, A), S.depthBuffer) {
      const q = S.depthTexture, tt = q && q.isDepthTexture ? q.type : null, Y = _(S.stencilBuffer, tt), St = S.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, at = Xt(S);
      Jt(S) ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, at, Y, S.width, S.height) : z ? i.renderbufferStorageMultisample(i.RENDERBUFFER, at, Y, S.width, S.height) : i.renderbufferStorage(i.RENDERBUFFER, Y, S.width, S.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, St, i.RENDERBUFFER, A);
    } else {
      const q = S.textures;
      for (let tt = 0; tt < q.length; tt++) {
        const Y = q[tt], St = r.convert(Y.format, Y.colorSpace), at = r.convert(Y.type), mt = y(Y.internalFormat, St, at, Y.colorSpace), Qt = Xt(S);
        z && Jt(S) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Qt, mt, S.width, S.height) : Jt(S) ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Qt, mt, S.width, S.height) : i.renderbufferStorage(i.RENDERBUFFER, mt, S.width, S.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function pt(A, S) {
    if (S && S.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (e.bindFramebuffer(i.FRAMEBUFFER, A), !(S.depthTexture && S.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(S.depthTexture).__webglTexture || S.depthTexture.image.width !== S.width || S.depthTexture.image.height !== S.height) && (S.depthTexture.image.width = S.width, S.depthTexture.image.height = S.height, S.depthTexture.needsUpdate = !0), G(S.depthTexture, 0);
    const q = n.get(S.depthTexture).__webglTexture, tt = Xt(S);
    if (S.depthTexture.format === ts)
      Jt(S) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, q, 0, tt) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, q, 0);
    else if (S.depthTexture.format === hs)
      Jt(S) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, q, 0, tt) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, q, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Bt(A) {
    const S = n.get(A), z = A.isWebGLCubeRenderTarget === !0;
    if (S.__boundDepthTexture !== A.depthTexture) {
      const q = A.depthTexture;
      if (S.__depthDisposeCallback && S.__depthDisposeCallback(), q) {
        const tt = () => {
          delete S.__boundDepthTexture, delete S.__depthDisposeCallback, q.removeEventListener("dispose", tt);
        };
        q.addEventListener("dispose", tt), S.__depthDisposeCallback = tt;
      }
      S.__boundDepthTexture = q;
    }
    if (A.depthTexture && !S.__autoAllocateDepthBuffer) {
      if (z) throw new Error("target.depthTexture not supported in Cube render targets");
      pt(S.__webglFramebuffer, A);
    } else if (z) {
      S.__webglDepthbuffer = [];
      for (let q = 0; q < 6; q++)
        if (e.bindFramebuffer(i.FRAMEBUFFER, S.__webglFramebuffer[q]), S.__webglDepthbuffer[q] === void 0)
          S.__webglDepthbuffer[q] = i.createRenderbuffer(), xt(S.__webglDepthbuffer[q], A, !1);
        else {
          const tt = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Y = S.__webglDepthbuffer[q];
          i.bindRenderbuffer(i.RENDERBUFFER, Y), i.framebufferRenderbuffer(i.FRAMEBUFFER, tt, i.RENDERBUFFER, Y);
        }
    } else if (e.bindFramebuffer(i.FRAMEBUFFER, S.__webglFramebuffer), S.__webglDepthbuffer === void 0)
      S.__webglDepthbuffer = i.createRenderbuffer(), xt(S.__webglDepthbuffer, A, !1);
    else {
      const q = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, tt = S.__webglDepthbuffer;
      i.bindRenderbuffer(i.RENDERBUFFER, tt), i.framebufferRenderbuffer(i.FRAMEBUFFER, q, i.RENDERBUFFER, tt);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Ct(A, S, z) {
    const q = n.get(A);
    S !== void 0 && it(q.__webglFramebuffer, A, A.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), z !== void 0 && Bt(A);
  }
  function Yt(A) {
    const S = A.texture, z = n.get(A), q = n.get(S);
    A.addEventListener("dispose", T);
    const tt = A.textures, Y = A.isWebGLCubeRenderTarget === !0, St = tt.length > 1;
    if (St || (q.__webglTexture === void 0 && (q.__webglTexture = i.createTexture()), q.__version = S.version, o.memory.textures++), Y) {
      z.__webglFramebuffer = [];
      for (let at = 0; at < 6; at++)
        if (S.mipmaps && S.mipmaps.length > 0) {
          z.__webglFramebuffer[at] = [];
          for (let mt = 0; mt < S.mipmaps.length; mt++)
            z.__webglFramebuffer[at][mt] = i.createFramebuffer();
        } else
          z.__webglFramebuffer[at] = i.createFramebuffer();
    } else {
      if (S.mipmaps && S.mipmaps.length > 0) {
        z.__webglFramebuffer = [];
        for (let at = 0; at < S.mipmaps.length; at++)
          z.__webglFramebuffer[at] = i.createFramebuffer();
      } else
        z.__webglFramebuffer = i.createFramebuffer();
      if (St)
        for (let at = 0, mt = tt.length; at < mt; at++) {
          const Qt = n.get(tt[at]);
          Qt.__webglTexture === void 0 && (Qt.__webglTexture = i.createTexture(), o.memory.textures++);
        }
      if (A.samples > 0 && Jt(A) === !1) {
        z.__webglMultisampledFramebuffer = i.createFramebuffer(), z.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, z.__webglMultisampledFramebuffer);
        for (let at = 0; at < tt.length; at++) {
          const mt = tt[at];
          z.__webglColorRenderbuffer[at] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, z.__webglColorRenderbuffer[at]);
          const Qt = r.convert(mt.format, mt.colorSpace), st = r.convert(mt.type), gt = y(mt.internalFormat, Qt, st, mt.colorSpace, A.isXRRenderTarget === !0), Dt = Xt(A);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, Dt, gt, A.width, A.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + at, i.RENDERBUFFER, z.__webglColorRenderbuffer[at]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), A.depthBuffer && (z.__webglDepthRenderbuffer = i.createRenderbuffer(), xt(z.__webglDepthRenderbuffer, A, !0)), e.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (Y) {
      e.bindTexture(i.TEXTURE_CUBE_MAP, q.__webglTexture), Mt(i.TEXTURE_CUBE_MAP, S);
      for (let at = 0; at < 6; at++)
        if (S.mipmaps && S.mipmaps.length > 0)
          for (let mt = 0; mt < S.mipmaps.length; mt++)
            it(z.__webglFramebuffer[at][mt], A, S, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, mt);
        else
          it(z.__webglFramebuffer[at], A, S, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, 0);
      p(S) && m(i.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (St) {
      for (let at = 0, mt = tt.length; at < mt; at++) {
        const Qt = tt[at], st = n.get(Qt);
        e.bindTexture(i.TEXTURE_2D, st.__webglTexture), Mt(i.TEXTURE_2D, Qt), it(z.__webglFramebuffer, A, Qt, i.COLOR_ATTACHMENT0 + at, i.TEXTURE_2D, 0), p(Qt) && m(i.TEXTURE_2D);
      }
      e.unbindTexture();
    } else {
      let at = i.TEXTURE_2D;
      if ((A.isWebGL3DRenderTarget || A.isWebGLArrayRenderTarget) && (at = A.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(at, q.__webglTexture), Mt(at, S), S.mipmaps && S.mipmaps.length > 0)
        for (let mt = 0; mt < S.mipmaps.length; mt++)
          it(z.__webglFramebuffer[mt], A, S, i.COLOR_ATTACHMENT0, at, mt);
      else
        it(z.__webglFramebuffer, A, S, i.COLOR_ATTACHMENT0, at, 0);
      p(S) && m(at), e.unbindTexture();
    }
    A.depthBuffer && Bt(A);
  }
  function fe(A) {
    const S = A.textures;
    for (let z = 0, q = S.length; z < q; z++) {
      const tt = S[z];
      if (p(tt)) {
        const Y = A.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D, St = n.get(tt).__webglTexture;
        e.bindTexture(Y, St), m(Y), e.unbindTexture();
      }
    }
  }
  const qt = [], I = [];
  function qe(A) {
    if (A.samples > 0) {
      if (Jt(A) === !1) {
        const S = A.textures, z = A.width, q = A.height;
        let tt = i.COLOR_BUFFER_BIT;
        const Y = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, St = n.get(A), at = S.length > 1;
        if (at)
          for (let mt = 0; mt < S.length; mt++)
            e.bindFramebuffer(i.FRAMEBUFFER, St.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + mt, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, St.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + mt, i.TEXTURE_2D, null, 0);
        e.bindFramebuffer(i.READ_FRAMEBUFFER, St.__webglMultisampledFramebuffer), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, St.__webglFramebuffer);
        for (let mt = 0; mt < S.length; mt++) {
          if (A.resolveDepthBuffer && (A.depthBuffer && (tt |= i.DEPTH_BUFFER_BIT), A.stencilBuffer && A.resolveStencilBuffer && (tt |= i.STENCIL_BUFFER_BIT)), at) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, St.__webglColorRenderbuffer[mt]);
            const Qt = n.get(S[mt]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, Qt, 0);
          }
          i.blitFramebuffer(0, 0, z, q, 0, 0, z, q, tt, i.NEAREST), l === !0 && (qt.length = 0, I.length = 0, qt.push(i.COLOR_ATTACHMENT0 + mt), A.depthBuffer && A.resolveDepthBuffer === !1 && (qt.push(Y), I.push(Y), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, I)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, qt));
        }
        if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), at)
          for (let mt = 0; mt < S.length; mt++) {
            e.bindFramebuffer(i.FRAMEBUFFER, St.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + mt, i.RENDERBUFFER, St.__webglColorRenderbuffer[mt]);
            const Qt = n.get(S[mt]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, St.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + mt, i.TEXTURE_2D, Qt, 0);
          }
        e.bindFramebuffer(i.DRAW_FRAMEBUFFER, St.__webglMultisampledFramebuffer);
      } else if (A.depthBuffer && A.resolveDepthBuffer === !1 && l) {
        const S = A.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [S]);
      }
    }
  }
  function Xt(A) {
    return Math.min(s.maxSamples, A.samples);
  }
  function Jt(A) {
    const S = n.get(A);
    return A.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && S.__useRenderToTexture !== !1;
  }
  function It(A) {
    const S = o.render.frame;
    h.get(A) !== S && (h.set(A, S), A.update());
  }
  function _e(A, S) {
    const z = A.colorSpace, q = A.format, tt = A.type;
    return A.isCompressedTexture === !0 || A.isVideoTexture === !0 || z !== Oe && z !== ti && (te.getTransfer(z) === xe ? (q !== ln || tt !== Gn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", z)), S;
  }
  function Ut(A) {
    return typeof HTMLImageElement < "u" && A instanceof HTMLImageElement ? (c.width = A.naturalWidth || A.width, c.height = A.naturalHeight || A.height) : typeof VideoFrame < "u" && A instanceof VideoFrame ? (c.width = A.displayWidth, c.height = A.displayHeight) : (c.width = A.width, c.height = A.height), c;
  }
  this.allocateTextureUnit = F, this.resetTextureUnits = b, this.setTexture2D = G, this.setTexture2DArray = Z, this.setTexture3D = W, this.setTextureCube = et, this.rebindTextures = Ct, this.setupRenderTarget = Yt, this.updateRenderTargetMipmap = fe, this.updateMultisampleRenderTarget = qe, this.setupDepthRenderbuffer = Bt, this.setupFrameBufferTexture = it, this.useMultisampledRTT = Jt;
}
function yv(i, t) {
  function e(n, s = ti) {
    let r;
    const o = te.getTransfer(s);
    if (n === Gn) return i.UNSIGNED_BYTE;
    if (n === Tl) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Al) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Pu) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Ru) return i.BYTE;
    if (n === Cu) return i.SHORT;
    if (n === qs) return i.UNSIGNED_SHORT;
    if (n === wl) return i.INT;
    if (n === Si) return i.UNSIGNED_INT;
    if (n === _n) return i.FLOAT;
    if (n === or) return i.HALF_FLOAT;
    if (n === Lu) return i.ALPHA;
    if (n === Iu) return i.RGB;
    if (n === ln) return i.RGBA;
    if (n === Du) return i.LUMINANCE;
    if (n === Nu) return i.LUMINANCE_ALPHA;
    if (n === ts) return i.DEPTH_COMPONENT;
    if (n === hs) return i.DEPTH_STENCIL;
    if (n === Rl) return i.RED;
    if (n === Cl) return i.RED_INTEGER;
    if (n === Uu) return i.RG;
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
    if (n === Da || n === Na || n === Ua || n === Oa)
      if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === Da) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Na) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Ua) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Oa) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === Fa || n === Ba || n === ka)
      if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === Fa || n === Ba) return o === xe ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === ka) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === za || n === Ha || n === Ga || n === Va || n === Wa || n === $a || n === Xa || n === ja || n === Ya || n === qa || n === Ka || n === Za || n === Ja || n === Qa)
      if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === za) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ha) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Ga) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Va) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === Wa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === $a) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Xa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === ja) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === Ya) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === qa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === Ka) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Za) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Ja) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Qa) return o === xe ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === io || n === tl || n === el)
      if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === io) return o === xe ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === tl) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === el) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === Ou || n === nl || n === il || n === sl)
      if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === io) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === nl) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === il) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === sl) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === cs ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
class Mv extends ze {
  constructor(t = []) {
    super(), this.isArrayCamera = !0, this.cameras = t;
  }
}
class J extends ye {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Sv = { type: "move" };
class ra {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new J(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new J(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new P(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new P()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new J(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new P(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new P()), this._grip;
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
        const h = c.joints["index-finger-tip"], u = c.joints["thumb-tip"], d = h.position.distanceTo(u.position), f = 0.02, g = 5e-3;
        c.inputState.pinching && d > f + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: t.handedness,
          target: this
        })) : !c.inputState.pinching && d <= f - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: t.handedness,
          target: this
        }));
      } else
        l !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1));
      a !== null && (s = e.getPose(t.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (a.matrix.fromArray(s.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(s.linearVelocity)) : a.hasLinearVelocity = !1, s.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(s.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent(Sv)));
    }
    return a !== null && (a.visible = s !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = o !== null), this;
  }
  // private method
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new J();
      n.matrixAutoUpdate = !1, n.visible = !1, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
const bv = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Ev = `
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
class wv {
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
      const e = t.cameras[0].viewport, n = new oi({
        vertexShader: bv,
        fragmentShader: Ev,
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
class Tv extends wi {
  constructor(t, e) {
    super();
    const n = this;
    let s = null, r = 1, o = null, a = "local-floor", l = 1, c = null, h = null, u = null, d = null, f = null, g = null;
    const v = new wv(), p = e.getContextAttributes();
    let m = null, y = null;
    const _ = [], M = [], R = new nt();
    let T = null;
    const w = new ze();
    w.layers.enable(1), w.viewport = new se();
    const C = new ze();
    C.layers.enable(2), C.viewport = new se();
    const B = [w, C], x = new Mv();
    x.layers.enable(1), x.layers.enable(2);
    let b = null, F = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(j) {
      let it = _[j];
      return it === void 0 && (it = new ra(), _[j] = it), it.getTargetRaySpace();
    }, this.getControllerGrip = function(j) {
      let it = _[j];
      return it === void 0 && (it = new ra(), _[j] = it), it.getGripSpace();
    }, this.getHand = function(j) {
      let it = _[j];
      return it === void 0 && (it = new ra(), _[j] = it), it.getHandSpace();
    };
    function k(j) {
      const it = M.indexOf(j.inputSource);
      if (it === -1)
        return;
      const xt = _[it];
      xt !== void 0 && (xt.update(j.inputSource, j.frame, c || o), xt.dispatchEvent({ type: j.type, data: j.inputSource }));
    }
    function G() {
      s.removeEventListener("select", k), s.removeEventListener("selectstart", k), s.removeEventListener("selectend", k), s.removeEventListener("squeeze", k), s.removeEventListener("squeezestart", k), s.removeEventListener("squeezeend", k), s.removeEventListener("end", G), s.removeEventListener("inputsourceschange", Z);
      for (let j = 0; j < _.length; j++) {
        const it = M[j];
        it !== null && (M[j] = null, _[j].disconnect(it));
      }
      b = null, F = null, v.reset(), t.setRenderTarget(m), f = null, d = null, u = null, s = null, y = null, ae.stop(), n.isPresenting = !1, t.setPixelRatio(T), t.setSize(R.width, R.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(j) {
      r = j, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(j) {
      a = j, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || o;
    }, this.setReferenceSpace = function(j) {
      c = j;
    }, this.getBaseLayer = function() {
      return d !== null ? d : f;
    }, this.getBinding = function() {
      return u;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return s;
    }, this.setSession = async function(j) {
      if (s = j, s !== null) {
        if (m = t.getRenderTarget(), s.addEventListener("select", k), s.addEventListener("selectstart", k), s.addEventListener("selectend", k), s.addEventListener("squeeze", k), s.addEventListener("squeezestart", k), s.addEventListener("squeezeend", k), s.addEventListener("end", G), s.addEventListener("inputsourceschange", Z), p.xrCompatible !== !0 && await e.makeXRCompatible(), T = t.getPixelRatio(), t.getSize(R), s.renderState.layers === void 0) {
          const it = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(s, e, it), s.updateRenderState({ baseLayer: f }), t.setPixelRatio(1), t.setSize(f.framebufferWidth, f.framebufferHeight, !1), y = new bi(
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
          let it = null, xt = null, pt = null;
          p.depth && (pt = p.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, it = p.stencil ? hs : ts, xt = p.stencil ? cs : Si);
          const Bt = {
            colorFormat: e.RGBA8,
            depthFormat: pt,
            scaleFactor: r
          };
          u = new XRWebGLBinding(s, e), d = u.createProjectionLayer(Bt), s.updateRenderState({ layers: [d] }), t.setPixelRatio(1), t.setSize(d.textureWidth, d.textureHeight, !1), y = new bi(
            d.textureWidth,
            d.textureHeight,
            {
              format: ln,
              type: Gn,
              depthTexture: new Ku(d.textureWidth, d.textureHeight, xt, void 0, void 0, void 0, void 0, void 0, void 0, it),
              stencilBuffer: p.stencil,
              colorSpace: t.outputColorSpace,
              samples: p.antialias ? 4 : 0,
              resolveDepthBuffer: d.ignoreDepthValues === !1
            }
          );
        }
        y.isXRRenderTarget = !0, this.setFoveation(l), c = null, o = await s.requestReferenceSpace(a), ae.setContext(s), ae.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (s !== null)
        return s.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return v.getDepthTexture();
    };
    function Z(j) {
      for (let it = 0; it < j.removed.length; it++) {
        const xt = j.removed[it], pt = M.indexOf(xt);
        pt >= 0 && (M[pt] = null, _[pt].disconnect(xt));
      }
      for (let it = 0; it < j.added.length; it++) {
        const xt = j.added[it];
        let pt = M.indexOf(xt);
        if (pt === -1) {
          for (let Ct = 0; Ct < _.length; Ct++)
            if (Ct >= M.length) {
              M.push(xt), pt = Ct;
              break;
            } else if (M[Ct] === null) {
              M[Ct] = xt, pt = Ct;
              break;
            }
          if (pt === -1) break;
        }
        const Bt = _[pt];
        Bt && Bt.connect(xt);
      }
    }
    const W = new P(), et = new P();
    function $(j, it, xt) {
      W.setFromMatrixPosition(it.matrixWorld), et.setFromMatrixPosition(xt.matrixWorld);
      const pt = W.distanceTo(et), Bt = it.projectionMatrix.elements, Ct = xt.projectionMatrix.elements, Yt = Bt[14] / (Bt[10] - 1), fe = Bt[14] / (Bt[10] + 1), qt = (Bt[9] + 1) / Bt[5], I = (Bt[9] - 1) / Bt[5], qe = (Bt[8] - 1) / Bt[0], Xt = (Ct[8] + 1) / Ct[0], Jt = Yt * qe, It = Yt * Xt, _e = pt / (-qe + Xt), Ut = _e * -qe;
      if (it.matrixWorld.decompose(j.position, j.quaternion, j.scale), j.translateX(Ut), j.translateZ(_e), j.matrixWorld.compose(j.position, j.quaternion, j.scale), j.matrixWorldInverse.copy(j.matrixWorld).invert(), Bt[10] === -1)
        j.projectionMatrix.copy(it.projectionMatrix), j.projectionMatrixInverse.copy(it.projectionMatrixInverse);
      else {
        const A = Yt + _e, S = fe + _e, z = Jt - Ut, q = It + (pt - Ut), tt = qt * fe / S * A, Y = I * fe / S * A;
        j.projectionMatrix.makePerspective(z, q, tt, Y, A, S), j.projectionMatrixInverse.copy(j.projectionMatrix).invert();
      }
    }
    function lt(j, it) {
      it === null ? j.matrixWorld.copy(j.matrix) : j.matrixWorld.multiplyMatrices(it.matrixWorld, j.matrix), j.matrixWorldInverse.copy(j.matrixWorld).invert();
    }
    this.updateCamera = function(j) {
      if (s === null) return;
      let it = j.near, xt = j.far;
      v.texture !== null && (v.depthNear > 0 && (it = v.depthNear), v.depthFar > 0 && (xt = v.depthFar)), x.near = C.near = w.near = it, x.far = C.far = w.far = xt, (b !== x.near || F !== x.far) && (s.updateRenderState({
        depthNear: x.near,
        depthFar: x.far
      }), b = x.near, F = x.far);
      const pt = j.parent, Bt = x.cameras;
      lt(x, pt);
      for (let Ct = 0; Ct < Bt.length; Ct++)
        lt(Bt[Ct], pt);
      Bt.length === 2 ? $(x, w, C) : x.projectionMatrix.copy(w.projectionMatrix), ut(j, x, pt);
    };
    function ut(j, it, xt) {
      xt === null ? j.matrix.copy(it.matrixWorld) : (j.matrix.copy(xt.matrixWorld), j.matrix.invert(), j.matrix.multiply(it.matrixWorld)), j.matrix.decompose(j.position, j.quaternion, j.scale), j.updateMatrixWorld(!0), j.projectionMatrix.copy(it.projectionMatrix), j.projectionMatrixInverse.copy(it.projectionMatrixInverse), j.isPerspectiveCamera && (j.fov = us * 2 * Math.atan(1 / j.projectionMatrix.elements[5]), j.zoom = 1);
    }
    this.getCamera = function() {
      return x;
    }, this.getFoveation = function() {
      if (!(d === null && f === null))
        return l;
    }, this.setFoveation = function(j) {
      l = j, d !== null && (d.fixedFoveation = j), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = j);
    }, this.hasDepthSensing = function() {
      return v.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return v.getMesh(x);
    };
    let Mt = null;
    function ee(j, it) {
      if (h = it.getViewerPose(c || o), g = it, h !== null) {
        const xt = h.views;
        f !== null && (t.setRenderTargetFramebuffer(y, f.framebuffer), t.setRenderTarget(y));
        let pt = !1;
        xt.length !== x.cameras.length && (x.cameras.length = 0, pt = !0);
        for (let Ct = 0; Ct < xt.length; Ct++) {
          const Yt = xt[Ct];
          let fe = null;
          if (f !== null)
            fe = f.getViewport(Yt);
          else {
            const I = u.getViewSubImage(d, Yt);
            fe = I.viewport, Ct === 0 && (t.setRenderTargetTextures(
              y,
              I.colorTexture,
              d.ignoreDepthValues ? void 0 : I.depthStencilTexture
            ), t.setRenderTarget(y));
          }
          let qt = B[Ct];
          qt === void 0 && (qt = new ze(), qt.layers.enable(Ct), qt.viewport = new se(), B[Ct] = qt), qt.matrix.fromArray(Yt.transform.matrix), qt.matrix.decompose(qt.position, qt.quaternion, qt.scale), qt.projectionMatrix.fromArray(Yt.projectionMatrix), qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(), qt.viewport.set(fe.x, fe.y, fe.width, fe.height), Ct === 0 && (x.matrix.copy(qt.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), pt === !0 && x.cameras.push(qt);
        }
        const Bt = s.enabledFeatures;
        if (Bt && Bt.includes("depth-sensing")) {
          const Ct = u.getDepthInformation(xt[0]);
          Ct && Ct.isValid && Ct.texture && v.init(t, Ct, s.renderState);
        }
      }
      for (let xt = 0; xt < _.length; xt++) {
        const pt = M[xt], Bt = _[xt];
        pt !== null && Bt !== void 0 && Bt.update(pt, it, c || o);
      }
      Mt && Mt(j, it), it.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: it }), g = null;
    }
    const ae = new qu();
    ae.setAnimationLoop(ee), this.setAnimationLoop = function(j) {
      Mt = j;
    }, this.dispose = function() {
    };
  }
}
const mi = /* @__PURE__ */ new bn(), Av = /* @__PURE__ */ new Ft();
function Rv(i, t) {
  function e(p, m) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), m.value.copy(p.matrix);
  }
  function n(p, m) {
    m.color.getRGB(p.fogColor.value, Xu(i)), m.isFog ? (p.fogNear.value = m.near, p.fogFar.value = m.far) : m.isFogExp2 && (p.fogDensity.value = m.density);
  }
  function s(p, m, y, _, M) {
    m.isMeshBasicMaterial || m.isMeshLambertMaterial ? r(p, m) : m.isMeshToonMaterial ? (r(p, m), u(p, m)) : m.isMeshPhongMaterial ? (r(p, m), h(p, m)) : m.isMeshStandardMaterial ? (r(p, m), d(p, m), m.isMeshPhysicalMaterial && f(p, m, M)) : m.isMeshMatcapMaterial ? (r(p, m), g(p, m)) : m.isMeshDepthMaterial ? r(p, m) : m.isMeshDistanceMaterial ? (r(p, m), v(p, m)) : m.isMeshNormalMaterial ? r(p, m) : m.isLineBasicMaterial ? (o(p, m), m.isLineDashedMaterial && a(p, m)) : m.isPointsMaterial ? l(p, m, y, _) : m.isSpriteMaterial ? c(p, m) : m.isShadowMaterial ? (p.color.value.copy(m.color), p.opacity.value = m.opacity) : m.isShaderMaterial && (m.uniformsNeedUpdate = !1);
  }
  function r(p, m) {
    p.opacity.value = m.opacity, m.color && p.diffuse.value.copy(m.color), m.emissive && p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity), m.map && (p.map.value = m.map, e(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, e(m.alphaMap, p.alphaMapTransform)), m.bumpMap && (p.bumpMap.value = m.bumpMap, e(m.bumpMap, p.bumpMapTransform), p.bumpScale.value = m.bumpScale, m.side === je && (p.bumpScale.value *= -1)), m.normalMap && (p.normalMap.value = m.normalMap, e(m.normalMap, p.normalMapTransform), p.normalScale.value.copy(m.normalScale), m.side === je && p.normalScale.value.negate()), m.displacementMap && (p.displacementMap.value = m.displacementMap, e(m.displacementMap, p.displacementMapTransform), p.displacementScale.value = m.displacementScale, p.displacementBias.value = m.displacementBias), m.emissiveMap && (p.emissiveMap.value = m.emissiveMap, e(m.emissiveMap, p.emissiveMapTransform)), m.specularMap && (p.specularMap.value = m.specularMap, e(m.specularMap, p.specularMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
    const y = t.get(m), _ = y.envMap, M = y.envMapRotation;
    _ && (p.envMap.value = _, mi.copy(M), mi.x *= -1, mi.y *= -1, mi.z *= -1, _.isCubeTexture && _.isRenderTargetTexture === !1 && (mi.y *= -1, mi.z *= -1), p.envMapRotation.value.setFromMatrix4(Av.makeRotationFromEuler(mi)), p.flipEnvMap.value = _.isCubeTexture && _.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = m.reflectivity, p.ior.value = m.ior, p.refractionRatio.value = m.refractionRatio), m.lightMap && (p.lightMap.value = m.lightMap, p.lightMapIntensity.value = m.lightMapIntensity, e(m.lightMap, p.lightMapTransform)), m.aoMap && (p.aoMap.value = m.aoMap, p.aoMapIntensity.value = m.aoMapIntensity, e(m.aoMap, p.aoMapTransform));
  }
  function o(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, m.map && (p.map.value = m.map, e(m.map, p.mapTransform));
  }
  function a(p, m) {
    p.dashSize.value = m.dashSize, p.totalSize.value = m.dashSize + m.gapSize, p.scale.value = m.scale;
  }
  function l(p, m, y, _) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.size.value = m.size * y, p.scale.value = _ * 0.5, m.map && (p.map.value = m.map, e(m.map, p.uvTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, e(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function c(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.rotation.value = m.rotation, m.map && (p.map.value = m.map, e(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, e(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function h(p, m) {
    p.specular.value.copy(m.specular), p.shininess.value = Math.max(m.shininess, 1e-4);
  }
  function u(p, m) {
    m.gradientMap && (p.gradientMap.value = m.gradientMap);
  }
  function d(p, m) {
    p.metalness.value = m.metalness, m.metalnessMap && (p.metalnessMap.value = m.metalnessMap, e(m.metalnessMap, p.metalnessMapTransform)), p.roughness.value = m.roughness, m.roughnessMap && (p.roughnessMap.value = m.roughnessMap, e(m.roughnessMap, p.roughnessMapTransform)), m.envMap && (p.envMapIntensity.value = m.envMapIntensity);
  }
  function f(p, m, y) {
    p.ior.value = m.ior, m.sheen > 0 && (p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen), p.sheenRoughness.value = m.sheenRoughness, m.sheenColorMap && (p.sheenColorMap.value = m.sheenColorMap, e(m.sheenColorMap, p.sheenColorMapTransform)), m.sheenRoughnessMap && (p.sheenRoughnessMap.value = m.sheenRoughnessMap, e(m.sheenRoughnessMap, p.sheenRoughnessMapTransform))), m.clearcoat > 0 && (p.clearcoat.value = m.clearcoat, p.clearcoatRoughness.value = m.clearcoatRoughness, m.clearcoatMap && (p.clearcoatMap.value = m.clearcoatMap, e(m.clearcoatMap, p.clearcoatMapTransform)), m.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = m.clearcoatRoughnessMap, e(m.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), m.clearcoatNormalMap && (p.clearcoatNormalMap.value = m.clearcoatNormalMap, e(m.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale), m.side === je && p.clearcoatNormalScale.value.negate())), m.dispersion > 0 && (p.dispersion.value = m.dispersion), m.iridescence > 0 && (p.iridescence.value = m.iridescence, p.iridescenceIOR.value = m.iridescenceIOR, p.iridescenceThicknessMinimum.value = m.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = m.iridescenceThicknessRange[1], m.iridescenceMap && (p.iridescenceMap.value = m.iridescenceMap, e(m.iridescenceMap, p.iridescenceMapTransform)), m.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = m.iridescenceThicknessMap, e(m.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), m.transmission > 0 && (p.transmission.value = m.transmission, p.transmissionSamplerMap.value = y.texture, p.transmissionSamplerSize.value.set(y.width, y.height), m.transmissionMap && (p.transmissionMap.value = m.transmissionMap, e(m.transmissionMap, p.transmissionMapTransform)), p.thickness.value = m.thickness, m.thicknessMap && (p.thicknessMap.value = m.thicknessMap, e(m.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = m.attenuationDistance, p.attenuationColor.value.copy(m.attenuationColor)), m.anisotropy > 0 && (p.anisotropyVector.value.set(m.anisotropy * Math.cos(m.anisotropyRotation), m.anisotropy * Math.sin(m.anisotropyRotation)), m.anisotropyMap && (p.anisotropyMap.value = m.anisotropyMap, e(m.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = m.specularIntensity, p.specularColor.value.copy(m.specularColor), m.specularColorMap && (p.specularColorMap.value = m.specularColorMap, e(m.specularColorMap, p.specularColorMapTransform)), m.specularIntensityMap && (p.specularIntensityMap.value = m.specularIntensityMap, e(m.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function g(p, m) {
    m.matcap && (p.matcap.value = m.matcap);
  }
  function v(p, m) {
    const y = t.get(m).light;
    p.referencePosition.value.setFromMatrixPosition(y.matrixWorld), p.nearDistance.value = y.shadow.camera.near, p.farDistance.value = y.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: s
  };
}
function Cv(i, t, e, n) {
  let s = {}, r = {}, o = [];
  const a = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(y, _) {
    const M = _.program;
    n.uniformBlockBinding(y, M);
  }
  function c(y, _) {
    let M = s[y.id];
    M === void 0 && (g(y), M = h(y), s[y.id] = M, y.addEventListener("dispose", p));
    const R = _.program;
    n.updateUBOMapping(y, R);
    const T = t.render.frame;
    r[y.id] !== T && (d(y), r[y.id] = T);
  }
  function h(y) {
    const _ = u();
    y.__bindingPointIndex = _;
    const M = i.createBuffer(), R = y.__size, T = y.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, M), i.bufferData(i.UNIFORM_BUFFER, R, T), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, _, M), M;
  }
  function u() {
    for (let y = 0; y < a; y++)
      if (o.indexOf(y) === -1)
        return o.push(y), y;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(y) {
    const _ = s[y.id], M = y.uniforms, R = y.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, _);
    for (let T = 0, w = M.length; T < w; T++) {
      const C = Array.isArray(M[T]) ? M[T] : [M[T]];
      for (let B = 0, x = C.length; B < x; B++) {
        const b = C[B];
        if (f(b, T, B, R) === !0) {
          const F = b.__offset, k = Array.isArray(b.value) ? b.value : [b.value];
          let G = 0;
          for (let Z = 0; Z < k.length; Z++) {
            const W = k[Z], et = v(W);
            typeof W == "number" || typeof W == "boolean" ? (b.__data[0] = W, i.bufferSubData(i.UNIFORM_BUFFER, F + G, b.__data)) : W.isMatrix3 ? (b.__data[0] = W.elements[0], b.__data[1] = W.elements[1], b.__data[2] = W.elements[2], b.__data[3] = 0, b.__data[4] = W.elements[3], b.__data[5] = W.elements[4], b.__data[6] = W.elements[5], b.__data[7] = 0, b.__data[8] = W.elements[6], b.__data[9] = W.elements[7], b.__data[10] = W.elements[8], b.__data[11] = 0) : (W.toArray(b.__data, G), G += et.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, F, b.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function f(y, _, M, R) {
    const T = y.value, w = _ + "_" + M;
    if (R[w] === void 0)
      return typeof T == "number" || typeof T == "boolean" ? R[w] = T : R[w] = T.clone(), !0;
    {
      const C = R[w];
      if (typeof T == "number" || typeof T == "boolean") {
        if (C !== T)
          return R[w] = T, !0;
      } else if (C.equals(T) === !1)
        return C.copy(T), !0;
    }
    return !1;
  }
  function g(y) {
    const _ = y.uniforms;
    let M = 0;
    const R = 16;
    for (let w = 0, C = _.length; w < C; w++) {
      const B = Array.isArray(_[w]) ? _[w] : [_[w]];
      for (let x = 0, b = B.length; x < b; x++) {
        const F = B[x], k = Array.isArray(F.value) ? F.value : [F.value];
        for (let G = 0, Z = k.length; G < Z; G++) {
          const W = k[G], et = v(W), $ = M % R, lt = $ % et.boundary, ut = $ + lt;
          M += lt, ut !== 0 && R - ut < et.storage && (M += R - ut), F.__data = new Float32Array(et.storage / Float32Array.BYTES_PER_ELEMENT), F.__offset = M, M += et.storage;
        }
      }
    }
    const T = M % R;
    return T > 0 && (M += R - T), y.__size = M, y.__cache = {}, this;
  }
  function v(y) {
    const _ = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof y == "number" || typeof y == "boolean" ? (_.boundary = 4, _.storage = 4) : y.isVector2 ? (_.boundary = 8, _.storage = 8) : y.isVector3 || y.isColor ? (_.boundary = 16, _.storage = 12) : y.isVector4 ? (_.boundary = 16, _.storage = 16) : y.isMatrix3 ? (_.boundary = 48, _.storage = 48) : y.isMatrix4 ? (_.boundary = 64, _.storage = 64) : y.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", y), _;
  }
  function p(y) {
    const _ = y.target;
    _.removeEventListener("dispose", p);
    const M = o.indexOf(_.__bindingPointIndex);
    o.splice(M, 1), i.deleteBuffer(s[_.id]), delete s[_.id], delete r[_.id];
  }
  function m() {
    for (const y in s)
      i.deleteBuffer(s[y]);
    o = [], s = {}, r = {};
  }
  return {
    bind: l,
    update: c,
    dispose: m
  };
}
class ed {
  constructor(t = {}) {
    const {
      canvas: e = _p(),
      context: n = null,
      depth: s = !0,
      stencil: r = !1,
      alpha: o = !1,
      antialias: a = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: u = !1
    } = t;
    this.isWebGLRenderer = !0;
    let d;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      d = n.getContextAttributes().alpha;
    } else
      d = o;
    const f = new Uint32Array(4), g = new Int32Array(4);
    let v = null, p = null;
    const m = [], y = [];
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = ke, this.toneMapping = si, this.toneMappingExposure = 1;
    const _ = this;
    let M = !1, R = 0, T = 0, w = null, C = -1, B = null;
    const x = new se(), b = new se();
    let F = null;
    const k = new Tt(0);
    let G = 0, Z = e.width, W = e.height, et = 1, $ = null, lt = null;
    const ut = new se(0, 0, Z, W), Mt = new se(0, 0, Z, W);
    let ee = !1;
    const ae = new Ul();
    let j = !1, it = !1;
    const xt = new Ft(), pt = new Ft(), Bt = new P(), Ct = new se(), Yt = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let fe = !1;
    function qt() {
      return w === null ? et : 1;
    }
    let I = n;
    function qe(E, U) {
      return e.getContext(E, U);
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
        failIfMajorPerformanceCaveat: u
      };
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${El}`), e.addEventListener("webglcontextlost", Q, !1), e.addEventListener("webglcontextrestored", ct, !1), e.addEventListener("webglcontextcreationerror", ft, !1), I === null) {
        const U = "webgl2";
        if (I = qe(U, E), I === null)
          throw qe(U) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (E) {
      throw console.error("THREE.WebGLRenderer: " + E.message), E;
    }
    let Xt, Jt, It, _e, Ut, A, S, z, q, tt, Y, St, at, mt, Qt, st, gt, Dt, Nt, _t, jt, kt, me, N;
    function dt() {
      Xt = new U0(I), Xt.init(), kt = new yv(I, Xt), Jt = new C0(I, Xt, t, kt), It = new _v(I), Jt.reverseDepthBuffer && It.buffers.depth.setReversed(!0), _e = new B0(I), Ut = new nv(), A = new xv(I, Xt, It, Ut, Jt, kt, _e), S = new L0(_), z = new N0(_), q = new $p(I), me = new A0(I, q), tt = new O0(I, q, _e, me), Y = new z0(I, tt, q, _e), Nt = new k0(I, Jt, A), st = new P0(Ut), St = new ev(_, S, z, Xt, Jt, me, st), at = new Rv(_, Ut), mt = new sv(), Qt = new hv(Xt), Dt = new T0(_, S, z, It, Y, d, l), gt = new mv(_, Y, Jt), N = new Cv(I, _e, Jt, It), _t = new R0(I, Xt, _e), jt = new F0(I, Xt, _e), _e.programs = St.programs, _.capabilities = Jt, _.extensions = Xt, _.properties = Ut, _.renderLists = mt, _.shadowMap = gt, _.state = It, _.info = _e;
    }
    dt();
    const X = new Tv(_, I);
    this.xr = X, this.getContext = function() {
      return I;
    }, this.getContextAttributes = function() {
      return I.getContextAttributes();
    }, this.forceContextLoss = function() {
      const E = Xt.get("WEBGL_lose_context");
      E && E.loseContext();
    }, this.forceContextRestore = function() {
      const E = Xt.get("WEBGL_lose_context");
      E && E.restoreContext();
    }, this.getPixelRatio = function() {
      return et;
    }, this.setPixelRatio = function(E) {
      E !== void 0 && (et = E, this.setSize(Z, W, !1));
    }, this.getSize = function(E) {
      return E.set(Z, W);
    }, this.setSize = function(E, U, H = !0) {
      if (X.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Z = E, W = U, e.width = Math.floor(E * et), e.height = Math.floor(U * et), H === !0 && (e.style.width = E + "px", e.style.height = U + "px"), this.setViewport(0, 0, E, U);
    }, this.getDrawingBufferSize = function(E) {
      return E.set(Z * et, W * et).floor();
    }, this.setDrawingBufferSize = function(E, U, H) {
      Z = E, W = U, et = H, e.width = Math.floor(E * H), e.height = Math.floor(U * H), this.setViewport(0, 0, E, U);
    }, this.getCurrentViewport = function(E) {
      return E.copy(x);
    }, this.getViewport = function(E) {
      return E.copy(ut);
    }, this.setViewport = function(E, U, H, V) {
      E.isVector4 ? ut.set(E.x, E.y, E.z, E.w) : ut.set(E, U, H, V), It.viewport(x.copy(ut).multiplyScalar(et).round());
    }, this.getScissor = function(E) {
      return E.copy(Mt);
    }, this.setScissor = function(E, U, H, V) {
      E.isVector4 ? Mt.set(E.x, E.y, E.z, E.w) : Mt.set(E, U, H, V), It.scissor(b.copy(Mt).multiplyScalar(et).round());
    }, this.getScissorTest = function() {
      return ee;
    }, this.setScissorTest = function(E) {
      It.setScissorTest(ee = E);
    }, this.setOpaqueSort = function(E) {
      $ = E;
    }, this.setTransparentSort = function(E) {
      lt = E;
    }, this.getClearColor = function(E) {
      return E.copy(Dt.getClearColor());
    }, this.setClearColor = function() {
      Dt.setClearColor.apply(Dt, arguments);
    }, this.getClearAlpha = function() {
      return Dt.getClearAlpha();
    }, this.setClearAlpha = function() {
      Dt.setClearAlpha.apply(Dt, arguments);
    }, this.clear = function(E = !0, U = !0, H = !0) {
      let V = 0;
      if (E) {
        let O = !1;
        if (w !== null) {
          const rt = w.texture.format;
          O = rt === Ll || rt === Pl || rt === Cl;
        }
        if (O) {
          const rt = w.texture.type, ht = rt === Gn || rt === Si || rt === qs || rt === cs || rt === Tl || rt === Al, vt = Dt.getClearColor(), yt = Dt.getClearAlpha(), At = vt.r, Pt = vt.g, bt = vt.b;
          ht ? (f[0] = At, f[1] = Pt, f[2] = bt, f[3] = yt, I.clearBufferuiv(I.COLOR, 0, f)) : (g[0] = At, g[1] = Pt, g[2] = bt, g[3] = yt, I.clearBufferiv(I.COLOR, 0, g));
        } else
          V |= I.COLOR_BUFFER_BIT;
      }
      U && (V |= I.DEPTH_BUFFER_BIT, I.clearDepth(this.capabilities.reverseDepthBuffer ? 0 : 1)), H && (V |= I.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), I.clear(V);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", Q, !1), e.removeEventListener("webglcontextrestored", ct, !1), e.removeEventListener("webglcontextcreationerror", ft, !1), mt.dispose(), Qt.dispose(), Ut.dispose(), S.dispose(), z.dispose(), Y.dispose(), me.dispose(), N.dispose(), St.dispose(), X.dispose(), X.removeEventListener("sessionstart", Ql), X.removeEventListener("sessionend", tc), li.stop();
    };
    function Q(E) {
      E.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), M = !0;
    }
    function ct() {
      console.log("THREE.WebGLRenderer: Context Restored."), M = !1;
      const E = _e.autoReset, U = gt.enabled, H = gt.autoUpdate, V = gt.needsUpdate, O = gt.type;
      dt(), _e.autoReset = E, gt.enabled = U, gt.autoUpdate = H, gt.needsUpdate = V, gt.type = O;
    }
    function ft(E) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", E.statusMessage);
    }
    function Kt(E) {
      const U = E.target;
      U.removeEventListener("dispose", Kt), Ee(U);
    }
    function Ee(E) {
      We(E), Ut.remove(E);
    }
    function We(E) {
      const U = Ut.get(E).programs;
      U !== void 0 && (U.forEach(function(H) {
        St.releaseProgram(H);
      }), E.isShaderMaterial && St.releaseShaderCache(E));
    }
    this.renderBufferDirect = function(E, U, H, V, O, rt) {
      U === null && (U = Yt);
      const ht = O.isMesh && O.matrixWorld.determinant() < 0, vt = Od(E, U, H, V, O);
      It.setMaterial(V, ht);
      let yt = H.index, At = 1;
      if (V.wireframe === !0) {
        if (yt = tt.getWireframeAttribute(H), yt === void 0) return;
        At = 2;
      }
      const Pt = H.drawRange, bt = H.attributes.position;
      let le = Pt.start * At, ve = (Pt.start + Pt.count) * At;
      rt !== null && (le = Math.max(le, rt.start * At), ve = Math.min(ve, (rt.start + rt.count) * At)), yt !== null ? (le = Math.max(le, 0), ve = Math.min(ve, yt.count)) : bt != null && (le = Math.max(le, 0), ve = Math.min(ve, bt.count));
      const Se = ve - le;
      if (Se < 0 || Se === 1 / 0) return;
      me.setup(O, V, vt, H, yt);
      let Ke, re = _t;
      if (yt !== null && (Ke = q.get(yt), re = jt, re.setIndex(Ke)), O.isMesh)
        V.wireframe === !0 ? (It.setLineWidth(V.wireframeLinewidth * qt()), re.setMode(I.LINES)) : re.setMode(I.TRIANGLES);
      else if (O.isLine) {
        let Et = V.linewidth;
        Et === void 0 && (Et = 1), It.setLineWidth(Et * qt()), O.isLineSegments ? re.setMode(I.LINES) : O.isLineLoop ? re.setMode(I.LINE_LOOP) : re.setMode(I.LINE_STRIP);
      } else O.isPoints ? re.setMode(I.POINTS) : O.isSprite && re.setMode(I.TRIANGLES);
      if (O.isBatchedMesh)
        if (O._multiDrawInstances !== null)
          re.renderMultiDrawInstances(O._multiDrawStarts, O._multiDrawCounts, O._multiDrawCount, O._multiDrawInstances);
        else if (Xt.get("WEBGL_multi_draw"))
          re.renderMultiDraw(O._multiDrawStarts, O._multiDrawCounts, O._multiDrawCount);
        else {
          const Et = O._multiDrawStarts, Ne = O._multiDrawCounts, oe = O._multiDrawCount, hn = yt ? q.get(yt).bytesPerElement : 1, Ti = Ut.get(V).currentProgram.getUniforms();
          for (let Ze = 0; Ze < oe; Ze++)
            Ti.setValue(I, "_gl_DrawID", Ze), re.render(Et[Ze] / hn, Ne[Ze]);
        }
      else if (O.isInstancedMesh)
        re.renderInstances(le, Se, O.count);
      else if (H.isInstancedBufferGeometry) {
        const Et = H._maxInstanceCount !== void 0 ? H._maxInstanceCount : 1 / 0, Ne = Math.min(H.instanceCount, Et);
        re.renderInstances(le, Se, Ne);
      } else
        re.render(le, Se);
    };
    function ne(E, U, H) {
      E.transparent === !0 && E.side === on && E.forceSinglePass === !1 ? (E.side = je, E.needsUpdate = !0, dr(E, U, H), E.side = Hn, E.needsUpdate = !0, dr(E, U, H), E.side = on) : dr(E, U, H);
    }
    this.compile = function(E, U, H = null) {
      H === null && (H = E), p = Qt.get(H), p.init(U), y.push(p), H.traverseVisible(function(O) {
        O.isLight && O.layers.test(U.layers) && (p.pushLight(O), O.castShadow && p.pushShadow(O));
      }), E !== H && E.traverseVisible(function(O) {
        O.isLight && O.layers.test(U.layers) && (p.pushLight(O), O.castShadow && p.pushShadow(O));
      }), p.setupLights();
      const V = /* @__PURE__ */ new Set();
      return E.traverse(function(O) {
        if (!(O.isMesh || O.isPoints || O.isLine || O.isSprite))
          return;
        const rt = O.material;
        if (rt)
          if (Array.isArray(rt))
            for (let ht = 0; ht < rt.length; ht++) {
              const vt = rt[ht];
              ne(vt, H, O), V.add(vt);
            }
          else
            ne(rt, H, O), V.add(rt);
      }), y.pop(), p = null, V;
    }, this.compileAsync = function(E, U, H = null) {
      const V = this.compile(E, U, H);
      return new Promise((O) => {
        function rt() {
          if (V.forEach(function(ht) {
            Ut.get(ht).currentProgram.isReady() && V.delete(ht);
          }), V.size === 0) {
            O(E);
            return;
          }
          setTimeout(rt, 10);
        }
        Xt.get("KHR_parallel_shader_compile") !== null ? rt() : setTimeout(rt, 10);
      });
    };
    let $e = null;
    function Rn(E) {
      $e && $e(E);
    }
    function Ql() {
      li.stop();
    }
    function tc() {
      li.start();
    }
    const li = new qu();
    li.setAnimationLoop(Rn), typeof self < "u" && li.setContext(self), this.setAnimationLoop = function(E) {
      $e = E, X.setAnimationLoop(E), E === null ? li.stop() : li.start();
    }, X.addEventListener("sessionstart", Ql), X.addEventListener("sessionend", tc), this.render = function(E, U) {
      if (U !== void 0 && U.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (M === !0) return;
      if (E.matrixWorldAutoUpdate === !0 && E.updateMatrixWorld(), U.parent === null && U.matrixWorldAutoUpdate === !0 && U.updateMatrixWorld(), X.enabled === !0 && X.isPresenting === !0 && (X.cameraAutoUpdate === !0 && X.updateCamera(U), U = X.getCamera()), E.isScene === !0 && E.onBeforeRender(_, E, U, w), p = Qt.get(E, y.length), p.init(U), y.push(p), pt.multiplyMatrices(U.projectionMatrix, U.matrixWorldInverse), ae.setFromProjectionMatrix(pt), it = this.localClippingEnabled, j = st.init(this.clippingPlanes, it), v = mt.get(E, m.length), v.init(), m.push(v), X.enabled === !0 && X.isPresenting === !0) {
        const rt = _.xr.getDepthSensingMesh();
        rt !== null && To(rt, U, -1 / 0, _.sortObjects);
      }
      To(E, U, 0, _.sortObjects), v.finish(), _.sortObjects === !0 && v.sort($, lt), fe = X.enabled === !1 || X.isPresenting === !1 || X.hasDepthSensing() === !1, fe && Dt.addToRenderList(v, E), this.info.render.frame++, j === !0 && st.beginShadows();
      const H = p.state.shadowsArray;
      gt.render(H, E, U), j === !0 && st.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const V = v.opaque, O = v.transmissive;
      if (p.setupLights(), U.isArrayCamera) {
        const rt = U.cameras;
        if (O.length > 0)
          for (let ht = 0, vt = rt.length; ht < vt; ht++) {
            const yt = rt[ht];
            nc(V, O, E, yt);
          }
        fe && Dt.render(E);
        for (let ht = 0, vt = rt.length; ht < vt; ht++) {
          const yt = rt[ht];
          ec(v, E, yt, yt.viewport);
        }
      } else
        O.length > 0 && nc(V, O, E, U), fe && Dt.render(E), ec(v, E, U);
      w !== null && (A.updateMultisampleRenderTarget(w), A.updateRenderTargetMipmap(w)), E.isScene === !0 && E.onAfterRender(_, E, U), me.resetDefaultState(), C = -1, B = null, y.pop(), y.length > 0 ? (p = y[y.length - 1], j === !0 && st.setGlobalState(_.clippingPlanes, p.state.camera)) : p = null, m.pop(), m.length > 0 ? v = m[m.length - 1] : v = null;
    };
    function To(E, U, H, V) {
      if (E.visible === !1) return;
      if (E.layers.test(U.layers)) {
        if (E.isGroup)
          H = E.renderOrder;
        else if (E.isLOD)
          E.autoUpdate === !0 && E.update(U);
        else if (E.isLight)
          p.pushLight(E), E.castShadow && p.pushShadow(E);
        else if (E.isSprite) {
          if (!E.frustumCulled || ae.intersectsSprite(E)) {
            V && Ct.setFromMatrixPosition(E.matrixWorld).applyMatrix4(pt);
            const ht = Y.update(E), vt = E.material;
            vt.visible && v.push(E, ht, vt, H, Ct.z, null);
          }
        } else if ((E.isMesh || E.isLine || E.isPoints) && (!E.frustumCulled || ae.intersectsObject(E))) {
          const ht = Y.update(E), vt = E.material;
          if (V && (E.boundingSphere !== void 0 ? (E.boundingSphere === null && E.computeBoundingSphere(), Ct.copy(E.boundingSphere.center)) : (ht.boundingSphere === null && ht.computeBoundingSphere(), Ct.copy(ht.boundingSphere.center)), Ct.applyMatrix4(E.matrixWorld).applyMatrix4(pt)), Array.isArray(vt)) {
            const yt = ht.groups;
            for (let At = 0, Pt = yt.length; At < Pt; At++) {
              const bt = yt[At], le = vt[bt.materialIndex];
              le && le.visible && v.push(E, ht, le, H, Ct.z, bt);
            }
          } else vt.visible && v.push(E, ht, vt, H, Ct.z, null);
        }
      }
      const rt = E.children;
      for (let ht = 0, vt = rt.length; ht < vt; ht++)
        To(rt[ht], U, H, V);
    }
    function ec(E, U, H, V) {
      const O = E.opaque, rt = E.transmissive, ht = E.transparent;
      p.setupLightsView(H), j === !0 && st.setGlobalState(_.clippingPlanes, H), V && It.viewport(x.copy(V)), O.length > 0 && ur(O, U, H), rt.length > 0 && ur(rt, U, H), ht.length > 0 && ur(ht, U, H), It.buffers.depth.setTest(!0), It.buffers.depth.setMask(!0), It.buffers.color.setMask(!0), It.setPolygonOffset(!1);
    }
    function nc(E, U, H, V) {
      if ((H.isScene === !0 ? H.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[V.id] === void 0 && (p.state.transmissionRenderTarget[V.id] = new bi(1, 1, {
        generateMipmaps: !0,
        type: Xt.has("EXT_color_buffer_half_float") || Xt.has("EXT_color_buffer_float") ? or : Gn,
        minFilter: Bn,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: te.workingColorSpace
      }));
      const rt = p.state.transmissionRenderTarget[V.id], ht = V.viewport || x;
      rt.setSize(ht.z, ht.w);
      const vt = _.getRenderTarget();
      _.setRenderTarget(rt), _.getClearColor(k), G = _.getClearAlpha(), G < 1 && _.setClearColor(16777215, 0.5), _.clear(), fe && Dt.render(H);
      const yt = _.toneMapping;
      _.toneMapping = si;
      const At = V.viewport;
      if (V.viewport !== void 0 && (V.viewport = void 0), p.setupLightsView(V), j === !0 && st.setGlobalState(_.clippingPlanes, V), ur(E, H, V), A.updateMultisampleRenderTarget(rt), A.updateRenderTargetMipmap(rt), Xt.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Pt = !1;
        for (let bt = 0, le = U.length; bt < le; bt++) {
          const ve = U[bt], Se = ve.object, Ke = ve.geometry, re = ve.material, Et = ve.group;
          if (re.side === on && Se.layers.test(V.layers)) {
            const Ne = re.side;
            re.side = je, re.needsUpdate = !0, ic(Se, H, V, Ke, re, Et), re.side = Ne, re.needsUpdate = !0, Pt = !0;
          }
        }
        Pt === !0 && (A.updateMultisampleRenderTarget(rt), A.updateRenderTargetMipmap(rt));
      }
      _.setRenderTarget(vt), _.setClearColor(k, G), At !== void 0 && (V.viewport = At), _.toneMapping = yt;
    }
    function ur(E, U, H) {
      const V = U.isScene === !0 ? U.overrideMaterial : null;
      for (let O = 0, rt = E.length; O < rt; O++) {
        const ht = E[O], vt = ht.object, yt = ht.geometry, At = V === null ? ht.material : V, Pt = ht.group;
        vt.layers.test(H.layers) && ic(vt, U, H, yt, At, Pt);
      }
    }
    function ic(E, U, H, V, O, rt) {
      E.onBeforeRender(_, U, H, V, O, rt), E.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, E.matrixWorld), E.normalMatrix.getNormalMatrix(E.modelViewMatrix), O.onBeforeRender(_, U, H, V, E, rt), O.transparent === !0 && O.side === on && O.forceSinglePass === !1 ? (O.side = je, O.needsUpdate = !0, _.renderBufferDirect(H, U, V, O, E, rt), O.side = Hn, O.needsUpdate = !0, _.renderBufferDirect(H, U, V, O, E, rt), O.side = on) : _.renderBufferDirect(H, U, V, O, E, rt), E.onAfterRender(_, U, H, V, O, rt);
    }
    function dr(E, U, H) {
      U.isScene !== !0 && (U = Yt);
      const V = Ut.get(E), O = p.state.lights, rt = p.state.shadowsArray, ht = O.state.version, vt = St.getParameters(E, O.state, rt, U, H), yt = St.getProgramCacheKey(vt);
      let At = V.programs;
      V.environment = E.isMeshStandardMaterial ? U.environment : null, V.fog = U.fog, V.envMap = (E.isMeshStandardMaterial ? z : S).get(E.envMap || V.environment), V.envMapRotation = V.environment !== null && E.envMap === null ? U.environmentRotation : E.envMapRotation, At === void 0 && (E.addEventListener("dispose", Kt), At = /* @__PURE__ */ new Map(), V.programs = At);
      let Pt = At.get(yt);
      if (Pt !== void 0) {
        if (V.currentProgram === Pt && V.lightsStateVersion === ht)
          return rc(E, vt), Pt;
      } else
        vt.uniforms = St.getUniforms(E), E.onBeforeCompile(vt, _), Pt = St.acquireProgram(vt, yt), At.set(yt, Pt), V.uniforms = vt.uniforms;
      const bt = V.uniforms;
      return (!E.isShaderMaterial && !E.isRawShaderMaterial || E.clipping === !0) && (bt.clippingPlanes = st.uniform), rc(E, vt), V.needsLights = Bd(E), V.lightsStateVersion = ht, V.needsLights && (bt.ambientLightColor.value = O.state.ambient, bt.lightProbe.value = O.state.probe, bt.directionalLights.value = O.state.directional, bt.directionalLightShadows.value = O.state.directionalShadow, bt.spotLights.value = O.state.spot, bt.spotLightShadows.value = O.state.spotShadow, bt.rectAreaLights.value = O.state.rectArea, bt.ltc_1.value = O.state.rectAreaLTC1, bt.ltc_2.value = O.state.rectAreaLTC2, bt.pointLights.value = O.state.point, bt.pointLightShadows.value = O.state.pointShadow, bt.hemisphereLights.value = O.state.hemi, bt.directionalShadowMap.value = O.state.directionalShadowMap, bt.directionalShadowMatrix.value = O.state.directionalShadowMatrix, bt.spotShadowMap.value = O.state.spotShadowMap, bt.spotLightMatrix.value = O.state.spotLightMatrix, bt.spotLightMap.value = O.state.spotLightMap, bt.pointShadowMap.value = O.state.pointShadowMap, bt.pointShadowMatrix.value = O.state.pointShadowMatrix), V.currentProgram = Pt, V.uniformsList = null, Pt;
    }
    function sc(E) {
      if (E.uniformsList === null) {
        const U = E.currentProgram.getUniforms();
        E.uniformsList = ro.seqWithValue(U.seq, E.uniforms);
      }
      return E.uniformsList;
    }
    function rc(E, U) {
      const H = Ut.get(E);
      H.outputColorSpace = U.outputColorSpace, H.batching = U.batching, H.batchingColor = U.batchingColor, H.instancing = U.instancing, H.instancingColor = U.instancingColor, H.instancingMorph = U.instancingMorph, H.skinning = U.skinning, H.morphTargets = U.morphTargets, H.morphNormals = U.morphNormals, H.morphColors = U.morphColors, H.morphTargetsCount = U.morphTargetsCount, H.numClippingPlanes = U.numClippingPlanes, H.numIntersection = U.numClipIntersection, H.vertexAlphas = U.vertexAlphas, H.vertexTangents = U.vertexTangents, H.toneMapping = U.toneMapping;
    }
    function Od(E, U, H, V, O) {
      U.isScene !== !0 && (U = Yt), A.resetTextureUnits();
      const rt = U.fog, ht = V.isMeshStandardMaterial ? U.environment : null, vt = w === null ? _.outputColorSpace : w.isXRRenderTarget === !0 ? w.texture.colorSpace : Oe, yt = (V.isMeshStandardMaterial ? z : S).get(V.envMap || ht), At = V.vertexColors === !0 && !!H.attributes.color && H.attributes.color.itemSize === 4, Pt = !!H.attributes.tangent && (!!V.normalMap || V.anisotropy > 0), bt = !!H.morphAttributes.position, le = !!H.morphAttributes.normal, ve = !!H.morphAttributes.color;
      let Se = si;
      V.toneMapped && (w === null || w.isXRRenderTarget === !0) && (Se = _.toneMapping);
      const Ke = H.morphAttributes.position || H.morphAttributes.normal || H.morphAttributes.color, re = Ke !== void 0 ? Ke.length : 0, Et = Ut.get(V), Ne = p.state.lights;
      if (j === !0 && (it === !0 || E !== B)) {
        const nn = E === B && V.id === C;
        st.setState(V, E, nn);
      }
      let oe = !1;
      V.version === Et.__version ? (Et.needsLights && Et.lightsStateVersion !== Ne.state.version || Et.outputColorSpace !== vt || O.isBatchedMesh && Et.batching === !1 || !O.isBatchedMesh && Et.batching === !0 || O.isBatchedMesh && Et.batchingColor === !0 && O.colorTexture === null || O.isBatchedMesh && Et.batchingColor === !1 && O.colorTexture !== null || O.isInstancedMesh && Et.instancing === !1 || !O.isInstancedMesh && Et.instancing === !0 || O.isSkinnedMesh && Et.skinning === !1 || !O.isSkinnedMesh && Et.skinning === !0 || O.isInstancedMesh && Et.instancingColor === !0 && O.instanceColor === null || O.isInstancedMesh && Et.instancingColor === !1 && O.instanceColor !== null || O.isInstancedMesh && Et.instancingMorph === !0 && O.morphTexture === null || O.isInstancedMesh && Et.instancingMorph === !1 && O.morphTexture !== null || Et.envMap !== yt || V.fog === !0 && Et.fog !== rt || Et.numClippingPlanes !== void 0 && (Et.numClippingPlanes !== st.numPlanes || Et.numIntersection !== st.numIntersection) || Et.vertexAlphas !== At || Et.vertexTangents !== Pt || Et.morphTargets !== bt || Et.morphNormals !== le || Et.morphColors !== ve || Et.toneMapping !== Se || Et.morphTargetsCount !== re) && (oe = !0) : (oe = !0, Et.__version = V.version);
      let hn = Et.currentProgram;
      oe === !0 && (hn = dr(V, U, O));
      let Ti = !1, Ze = !1, Ao = !1;
      const be = hn.getUniforms(), Wn = Et.uniforms;
      if (It.useProgram(hn.program) && (Ti = !0, Ze = !0, Ao = !0), V.id !== C && (C = V.id, Ze = !0), Ti || B !== E) {
        Jt.reverseDepthBuffer ? (xt.copy(E.projectionMatrix), xp(xt), yp(xt), be.setValue(I, "projectionMatrix", xt)) : be.setValue(I, "projectionMatrix", E.projectionMatrix), be.setValue(I, "viewMatrix", E.matrixWorldInverse);
        const nn = be.map.cameraPosition;
        nn !== void 0 && nn.setValue(I, Bt.setFromMatrixPosition(E.matrixWorld)), Jt.logarithmicDepthBuffer && be.setValue(
          I,
          "logDepthBufFC",
          2 / (Math.log(E.far + 1) / Math.LN2)
        ), (V.isMeshPhongMaterial || V.isMeshToonMaterial || V.isMeshLambertMaterial || V.isMeshBasicMaterial || V.isMeshStandardMaterial || V.isShaderMaterial) && be.setValue(I, "isOrthographic", E.isOrthographicCamera === !0), B !== E && (B = E, Ze = !0, Ao = !0);
      }
      if (O.isSkinnedMesh) {
        be.setOptional(I, O, "bindMatrix"), be.setOptional(I, O, "bindMatrixInverse");
        const nn = O.skeleton;
        nn && (nn.boneTexture === null && nn.computeBoneTexture(), be.setValue(I, "boneTexture", nn.boneTexture, A));
      }
      O.isBatchedMesh && (be.setOptional(I, O, "batchingTexture"), be.setValue(I, "batchingTexture", O._matricesTexture, A), be.setOptional(I, O, "batchingIdTexture"), be.setValue(I, "batchingIdTexture", O._indirectTexture, A), be.setOptional(I, O, "batchingColorTexture"), O._colorsTexture !== null && be.setValue(I, "batchingColorTexture", O._colorsTexture, A));
      const Ro = H.morphAttributes;
      if ((Ro.position !== void 0 || Ro.normal !== void 0 || Ro.color !== void 0) && Nt.update(O, H, hn), (Ze || Et.receiveShadow !== O.receiveShadow) && (Et.receiveShadow = O.receiveShadow, be.setValue(I, "receiveShadow", O.receiveShadow)), V.isMeshGouraudMaterial && V.envMap !== null && (Wn.envMap.value = yt, Wn.flipEnvMap.value = yt.isCubeTexture && yt.isRenderTargetTexture === !1 ? -1 : 1), V.isMeshStandardMaterial && V.envMap === null && U.environment !== null && (Wn.envMapIntensity.value = U.environmentIntensity), Ze && (be.setValue(I, "toneMappingExposure", _.toneMappingExposure), Et.needsLights && Fd(Wn, Ao), rt && V.fog === !0 && at.refreshFogUniforms(Wn, rt), at.refreshMaterialUniforms(Wn, V, et, W, p.state.transmissionRenderTarget[E.id]), ro.upload(I, sc(Et), Wn, A)), V.isShaderMaterial && V.uniformsNeedUpdate === !0 && (ro.upload(I, sc(Et), Wn, A), V.uniformsNeedUpdate = !1), V.isSpriteMaterial && be.setValue(I, "center", O.center), be.setValue(I, "modelViewMatrix", O.modelViewMatrix), be.setValue(I, "normalMatrix", O.normalMatrix), be.setValue(I, "modelMatrix", O.matrixWorld), V.isShaderMaterial || V.isRawShaderMaterial) {
        const nn = V.uniformsGroups;
        for (let Co = 0, kd = nn.length; Co < kd; Co++) {
          const oc = nn[Co];
          N.update(oc, hn), N.bind(oc, hn);
        }
      }
      return hn;
    }
    function Fd(E, U) {
      E.ambientLightColor.needsUpdate = U, E.lightProbe.needsUpdate = U, E.directionalLights.needsUpdate = U, E.directionalLightShadows.needsUpdate = U, E.pointLights.needsUpdate = U, E.pointLightShadows.needsUpdate = U, E.spotLights.needsUpdate = U, E.spotLightShadows.needsUpdate = U, E.rectAreaLights.needsUpdate = U, E.hemisphereLights.needsUpdate = U;
    }
    function Bd(E) {
      return E.isMeshLambertMaterial || E.isMeshToonMaterial || E.isMeshPhongMaterial || E.isMeshStandardMaterial || E.isShadowMaterial || E.isShaderMaterial && E.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return R;
    }, this.getActiveMipmapLevel = function() {
      return T;
    }, this.getRenderTarget = function() {
      return w;
    }, this.setRenderTargetTextures = function(E, U, H) {
      Ut.get(E.texture).__webglTexture = U, Ut.get(E.depthTexture).__webglTexture = H;
      const V = Ut.get(E);
      V.__hasExternalTextures = !0, V.__autoAllocateDepthBuffer = H === void 0, V.__autoAllocateDepthBuffer || Xt.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), V.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(E, U) {
      const H = Ut.get(E);
      H.__webglFramebuffer = U, H.__useDefaultFramebuffer = U === void 0;
    }, this.setRenderTarget = function(E, U = 0, H = 0) {
      w = E, R = U, T = H;
      let V = !0, O = null, rt = !1, ht = !1;
      if (E) {
        const yt = Ut.get(E);
        if (yt.__useDefaultFramebuffer !== void 0)
          It.bindFramebuffer(I.FRAMEBUFFER, null), V = !1;
        else if (yt.__webglFramebuffer === void 0)
          A.setupRenderTarget(E);
        else if (yt.__hasExternalTextures)
          A.rebindTextures(E, Ut.get(E.texture).__webglTexture, Ut.get(E.depthTexture).__webglTexture);
        else if (E.depthBuffer) {
          const bt = E.depthTexture;
          if (yt.__boundDepthTexture !== bt) {
            if (bt !== null && Ut.has(bt) && (E.width !== bt.image.width || E.height !== bt.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            A.setupDepthRenderbuffer(E);
          }
        }
        const At = E.texture;
        (At.isData3DTexture || At.isDataArrayTexture || At.isCompressedArrayTexture) && (ht = !0);
        const Pt = Ut.get(E).__webglFramebuffer;
        E.isWebGLCubeRenderTarget ? (Array.isArray(Pt[U]) ? O = Pt[U][H] : O = Pt[U], rt = !0) : E.samples > 0 && A.useMultisampledRTT(E) === !1 ? O = Ut.get(E).__webglMultisampledFramebuffer : Array.isArray(Pt) ? O = Pt[H] : O = Pt, x.copy(E.viewport), b.copy(E.scissor), F = E.scissorTest;
      } else
        x.copy(ut).multiplyScalar(et).floor(), b.copy(Mt).multiplyScalar(et).floor(), F = ee;
      if (It.bindFramebuffer(I.FRAMEBUFFER, O) && V && It.drawBuffers(E, O), It.viewport(x), It.scissor(b), It.setScissorTest(F), rt) {
        const yt = Ut.get(E.texture);
        I.framebufferTexture2D(I.FRAMEBUFFER, I.COLOR_ATTACHMENT0, I.TEXTURE_CUBE_MAP_POSITIVE_X + U, yt.__webglTexture, H);
      } else if (ht) {
        const yt = Ut.get(E.texture), At = U || 0;
        I.framebufferTextureLayer(I.FRAMEBUFFER, I.COLOR_ATTACHMENT0, yt.__webglTexture, H || 0, At);
      }
      C = -1;
    }, this.readRenderTargetPixels = function(E, U, H, V, O, rt, ht) {
      if (!(E && E.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let vt = Ut.get(E).__webglFramebuffer;
      if (E.isWebGLCubeRenderTarget && ht !== void 0 && (vt = vt[ht]), vt) {
        It.bindFramebuffer(I.FRAMEBUFFER, vt);
        try {
          const yt = E.texture, At = yt.format, Pt = yt.type;
          if (!Jt.textureFormatReadable(At)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Jt.textureTypeReadable(Pt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          U >= 0 && U <= E.width - V && H >= 0 && H <= E.height - O && I.readPixels(U, H, V, O, kt.convert(At), kt.convert(Pt), rt);
        } finally {
          const yt = w !== null ? Ut.get(w).__webglFramebuffer : null;
          It.bindFramebuffer(I.FRAMEBUFFER, yt);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(E, U, H, V, O, rt, ht) {
      if (!(E && E.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let vt = Ut.get(E).__webglFramebuffer;
      if (E.isWebGLCubeRenderTarget && ht !== void 0 && (vt = vt[ht]), vt) {
        const yt = E.texture, At = yt.format, Pt = yt.type;
        if (!Jt.textureFormatReadable(At))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!Jt.textureTypeReadable(Pt))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (U >= 0 && U <= E.width - V && H >= 0 && H <= E.height - O) {
          It.bindFramebuffer(I.FRAMEBUFFER, vt);
          const bt = I.createBuffer();
          I.bindBuffer(I.PIXEL_PACK_BUFFER, bt), I.bufferData(I.PIXEL_PACK_BUFFER, rt.byteLength, I.STREAM_READ), I.readPixels(U, H, V, O, kt.convert(At), kt.convert(Pt), 0);
          const le = w !== null ? Ut.get(w).__webglFramebuffer : null;
          It.bindFramebuffer(I.FRAMEBUFFER, le);
          const ve = I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return I.flush(), await vp(I, ve, 4), I.bindBuffer(I.PIXEL_PACK_BUFFER, bt), I.getBufferSubData(I.PIXEL_PACK_BUFFER, 0, rt), I.deleteBuffer(bt), I.deleteSync(ve), rt;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(E, U = null, H = 0) {
      E.isTexture !== !0 && (so("WebGLRenderer: copyFramebufferToTexture function signature has changed."), U = arguments[0] || null, E = arguments[1]);
      const V = Math.pow(2, -H), O = Math.floor(E.image.width * V), rt = Math.floor(E.image.height * V), ht = U !== null ? U.x : 0, vt = U !== null ? U.y : 0;
      A.setTexture2D(E, 0), I.copyTexSubImage2D(I.TEXTURE_2D, H, 0, 0, ht, vt, O, rt), It.unbindTexture();
    }, this.copyTextureToTexture = function(E, U, H = null, V = null, O = 0) {
      E.isTexture !== !0 && (so("WebGLRenderer: copyTextureToTexture function signature has changed."), V = arguments[0] || null, E = arguments[1], U = arguments[2], O = arguments[3] || 0, H = null);
      let rt, ht, vt, yt, At, Pt;
      H !== null ? (rt = H.max.x - H.min.x, ht = H.max.y - H.min.y, vt = H.min.x, yt = H.min.y) : (rt = E.image.width, ht = E.image.height, vt = 0, yt = 0), V !== null ? (At = V.x, Pt = V.y) : (At = 0, Pt = 0);
      const bt = kt.convert(U.format), le = kt.convert(U.type);
      A.setTexture2D(U, 0), I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL, U.flipY), I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL, U.premultiplyAlpha), I.pixelStorei(I.UNPACK_ALIGNMENT, U.unpackAlignment);
      const ve = I.getParameter(I.UNPACK_ROW_LENGTH), Se = I.getParameter(I.UNPACK_IMAGE_HEIGHT), Ke = I.getParameter(I.UNPACK_SKIP_PIXELS), re = I.getParameter(I.UNPACK_SKIP_ROWS), Et = I.getParameter(I.UNPACK_SKIP_IMAGES), Ne = E.isCompressedTexture ? E.mipmaps[O] : E.image;
      I.pixelStorei(I.UNPACK_ROW_LENGTH, Ne.width), I.pixelStorei(I.UNPACK_IMAGE_HEIGHT, Ne.height), I.pixelStorei(I.UNPACK_SKIP_PIXELS, vt), I.pixelStorei(I.UNPACK_SKIP_ROWS, yt), E.isDataTexture ? I.texSubImage2D(I.TEXTURE_2D, O, At, Pt, rt, ht, bt, le, Ne.data) : E.isCompressedTexture ? I.compressedTexSubImage2D(I.TEXTURE_2D, O, At, Pt, Ne.width, Ne.height, bt, Ne.data) : I.texSubImage2D(I.TEXTURE_2D, O, At, Pt, rt, ht, bt, le, Ne), I.pixelStorei(I.UNPACK_ROW_LENGTH, ve), I.pixelStorei(I.UNPACK_IMAGE_HEIGHT, Se), I.pixelStorei(I.UNPACK_SKIP_PIXELS, Ke), I.pixelStorei(I.UNPACK_SKIP_ROWS, re), I.pixelStorei(I.UNPACK_SKIP_IMAGES, Et), O === 0 && U.generateMipmaps && I.generateMipmap(I.TEXTURE_2D), It.unbindTexture();
    }, this.copyTextureToTexture3D = function(E, U, H = null, V = null, O = 0) {
      E.isTexture !== !0 && (so("WebGLRenderer: copyTextureToTexture3D function signature has changed."), H = arguments[0] || null, V = arguments[1] || null, E = arguments[2], U = arguments[3], O = arguments[4] || 0);
      let rt, ht, vt, yt, At, Pt, bt, le, ve;
      const Se = E.isCompressedTexture ? E.mipmaps[O] : E.image;
      H !== null ? (rt = H.max.x - H.min.x, ht = H.max.y - H.min.y, vt = H.max.z - H.min.z, yt = H.min.x, At = H.min.y, Pt = H.min.z) : (rt = Se.width, ht = Se.height, vt = Se.depth, yt = 0, At = 0, Pt = 0), V !== null ? (bt = V.x, le = V.y, ve = V.z) : (bt = 0, le = 0, ve = 0);
      const Ke = kt.convert(U.format), re = kt.convert(U.type);
      let Et;
      if (U.isData3DTexture)
        A.setTexture3D(U, 0), Et = I.TEXTURE_3D;
      else if (U.isDataArrayTexture || U.isCompressedArrayTexture)
        A.setTexture2DArray(U, 0), Et = I.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL, U.flipY), I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL, U.premultiplyAlpha), I.pixelStorei(I.UNPACK_ALIGNMENT, U.unpackAlignment);
      const Ne = I.getParameter(I.UNPACK_ROW_LENGTH), oe = I.getParameter(I.UNPACK_IMAGE_HEIGHT), hn = I.getParameter(I.UNPACK_SKIP_PIXELS), Ti = I.getParameter(I.UNPACK_SKIP_ROWS), Ze = I.getParameter(I.UNPACK_SKIP_IMAGES);
      I.pixelStorei(I.UNPACK_ROW_LENGTH, Se.width), I.pixelStorei(I.UNPACK_IMAGE_HEIGHT, Se.height), I.pixelStorei(I.UNPACK_SKIP_PIXELS, yt), I.pixelStorei(I.UNPACK_SKIP_ROWS, At), I.pixelStorei(I.UNPACK_SKIP_IMAGES, Pt), E.isDataTexture || E.isData3DTexture ? I.texSubImage3D(Et, O, bt, le, ve, rt, ht, vt, Ke, re, Se.data) : U.isCompressedArrayTexture ? I.compressedTexSubImage3D(Et, O, bt, le, ve, rt, ht, vt, Ke, Se.data) : I.texSubImage3D(Et, O, bt, le, ve, rt, ht, vt, Ke, re, Se), I.pixelStorei(I.UNPACK_ROW_LENGTH, Ne), I.pixelStorei(I.UNPACK_IMAGE_HEIGHT, oe), I.pixelStorei(I.UNPACK_SKIP_PIXELS, hn), I.pixelStorei(I.UNPACK_SKIP_ROWS, Ti), I.pixelStorei(I.UNPACK_SKIP_IMAGES, Ze), O === 0 && U.generateMipmaps && I.generateMipmap(Et), It.unbindTexture();
    }, this.initRenderTarget = function(E) {
      Ut.get(E).__webglFramebuffer === void 0 && A.setupRenderTarget(E);
    }, this.initTexture = function(E) {
      E.isCubeTexture ? A.setTextureCube(E, 0) : E.isData3DTexture ? A.setTexture3D(E, 0) : E.isDataArrayTexture || E.isCompressedArrayTexture ? A.setTexture2DArray(E, 0) : A.setTexture2D(E, 0), It.unbindTexture();
    }, this.resetState = function() {
      R = 0, T = 0, w = null, It.reset(), me.reset();
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
    e.drawingBufferColorSpace = t === Il ? "display-p3" : "srgb", e.unpackColorSpace = te.workingColorSpace === So ? "display-p3" : "srgb";
  }
}
class nd extends ye {
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
class id {
  constructor(t, e) {
    this.isInterleavedBuffer = !0, this.array = t, this.stride = e, this.count = t !== void 0 ? t.length / e : 0, this.usage = ol, this.updateRanges = [], this.version = 0, this.uuid = cn();
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
class sd extends vn {
  constructor(t) {
    super(), this.isSpriteMaterial = !0, this.type = "SpriteMaterial", this.color = new Tt(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = !0, this.transparent = !0, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.rotation = t.rotation, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
let Hi;
const As = /* @__PURE__ */ new P(), Gi = /* @__PURE__ */ new P(), Vi = /* @__PURE__ */ new P(), Wi = /* @__PURE__ */ new nt(), Rs = /* @__PURE__ */ new nt(), rd = /* @__PURE__ */ new Ft(), Dr = /* @__PURE__ */ new P(), Cs = /* @__PURE__ */ new P(), Nr = /* @__PURE__ */ new P(), gh = /* @__PURE__ */ new nt(), oa = /* @__PURE__ */ new nt(), _h = /* @__PURE__ */ new nt();
class Pv extends ye {
  constructor(t = new sd()) {
    if (super(), this.isSprite = !0, this.type = "Sprite", Hi === void 0) {
      Hi = new Ie();
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
      ]), n = new id(e, 5);
      Hi.setIndex([0, 1, 2, 0, 2, 3]), Hi.setAttribute("position", new Qs(n, 3, 0, !1)), Hi.setAttribute("uv", new Qs(n, 2, 3, !1));
    }
    this.geometry = Hi, this.material = t, this.center = new nt(0.5, 0.5);
  }
  raycast(t, e) {
    t.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), Gi.setFromMatrixScale(this.matrixWorld), rd.copy(t.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse, this.matrixWorld), Vi.setFromMatrixPosition(this.modelViewMatrix), t.camera.isPerspectiveCamera && this.material.sizeAttenuation === !1 && Gi.multiplyScalar(-Vi.z);
    const n = this.material.rotation;
    let s, r;
    n !== 0 && (r = Math.cos(n), s = Math.sin(n));
    const o = this.center;
    Ur(Dr.set(-0.5, -0.5, 0), Vi, o, Gi, s, r), Ur(Cs.set(0.5, -0.5, 0), Vi, o, Gi, s, r), Ur(Nr.set(0.5, 0.5, 0), Vi, o, Gi, s, r), gh.set(0, 0), oa.set(1, 0), _h.set(1, 1);
    let a = t.ray.intersectTriangle(Dr, Cs, Nr, !1, As);
    if (a === null && (Ur(Cs.set(-0.5, 0.5, 0), Vi, o, Gi, s, r), oa.set(0, 1), a = t.ray.intersectTriangle(Dr, Nr, Cs, !1, As), a === null))
      return;
    const l = t.ray.origin.distanceTo(As);
    l < t.near || l > t.far || e.push({
      distance: l,
      point: As.clone(),
      uv: an.getInterpolation(As, Dr, Cs, Nr, gh, oa, _h, new nt()),
      face: null,
      object: this
    });
  }
  copy(t, e) {
    return super.copy(t, e), t.center !== void 0 && this.center.copy(t.center), this.material = t.material, this;
  }
}
function Ur(i, t, e, n, s, r) {
  Wi.subVectors(i, e).addScalar(0.5).multiply(n), s !== void 0 ? (Rs.x = r * Wi.x - s * Wi.y, Rs.y = s * Wi.x + r * Wi.y) : Rs.copy(Wi), i.copy(t), i.x += Rs.x, i.y += Rs.y, i.applyMatrix4(rd);
}
const vh = /* @__PURE__ */ new P(), xh = /* @__PURE__ */ new se(), yh = /* @__PURE__ */ new se(), Lv = /* @__PURE__ */ new P(), Mh = /* @__PURE__ */ new Ft(), Or = /* @__PURE__ */ new P(), aa = /* @__PURE__ */ new En(), Sh = /* @__PURE__ */ new Ft(), la = /* @__PURE__ */ new gs();
class Iv extends ge {
  constructor(t, e) {
    super(t, e), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = Sc, this.bindMatrix = new Ft(), this.bindMatrixInverse = new Ft(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const t = this.geometry;
    this.boundingBox === null && (this.boundingBox = new Ye()), this.boundingBox.makeEmpty();
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
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), aa.copy(this.boundingSphere), aa.applyMatrix4(s), t.ray.intersectsSphere(aa) !== !1 && (Sh.copy(s).invert(), la.copy(t.ray).applyMatrix4(Sh), !(this.boundingBox !== null && la.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(t, e, la)));
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
    const t = new se(), e = this.geometry.attributes.skinWeight;
    for (let n = 0, s = e.count; n < s; n++) {
      t.fromBufferAttribute(e, n);
      const r = 1 / t.manhattanLength();
      r !== 1 / 0 ? t.multiplyScalar(r) : t.set(1, 0, 0, 0), e.setXYZW(n, t.x, t.y, t.z, t.w);
    }
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.bindMode === Sc ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === Gf ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(t, e) {
    const n = this.skeleton, s = this.geometry;
    xh.fromBufferAttribute(s.attributes.skinIndex, t), yh.fromBufferAttribute(s.attributes.skinWeight, t), vh.copy(e).applyMatrix4(this.bindMatrix), e.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const o = yh.getComponent(r);
      if (o !== 0) {
        const a = xh.getComponent(r);
        Mh.multiplyMatrices(n.bones[a].matrixWorld, n.boneInverses[a]), e.addScaledVector(Lv.copy(vh).applyMatrix4(Mh), o);
      }
    }
    return e.applyMatrix4(this.bindMatrixInverse);
  }
}
class od extends ye {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}
class ad extends Ce {
  constructor(t = null, e = 1, n = 1, s, r, o, a, l, c = Ve, h = Ve, u, d) {
    super(null, o, a, l, c, h, s, r, u, d), this.isDataTexture = !0, this.image = { data: t, width: e, height: n }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
const bh = /* @__PURE__ */ new Ft(), Dv = /* @__PURE__ */ new Ft();
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
      const a = t[r] ? t[r].matrixWorld : Dv;
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
    const n = new ad(e, t, t, ln, _n);
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
      o === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), o = new od()), this.bones.push(o), this.boneInverses.push(new Ft().fromArray(t.boneInverses[n]));
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
class ll extends Ue {
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
const $i = /* @__PURE__ */ new Ft(), Eh = /* @__PURE__ */ new Ft(), Fr = [], wh = /* @__PURE__ */ new Ye(), Nv = /* @__PURE__ */ new Ft(), Ps = /* @__PURE__ */ new ge(), Ls = /* @__PURE__ */ new En();
class Uv extends ge {
  constructor(t, e, n) {
    super(t, e), this.isInstancedMesh = !0, this.instanceMatrix = new ll(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let s = 0; s < n; s++)
      this.setMatrixAt(s, Nv);
  }
  computeBoundingBox() {
    const t = this.geometry, e = this.count;
    this.boundingBox === null && (this.boundingBox = new Ye()), t.boundingBox === null && t.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < e; n++)
      this.getMatrixAt(n, $i), wh.copy(t.boundingBox).applyMatrix4($i), this.boundingBox.union(wh);
  }
  computeBoundingSphere() {
    const t = this.geometry, e = this.count;
    this.boundingSphere === null && (this.boundingSphere = new En()), t.boundingSphere === null && t.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < e; n++)
      this.getMatrixAt(n, $i), Ls.copy(t.boundingSphere).applyMatrix4($i), this.boundingSphere.union(Ls);
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
    if (Ps.geometry = this.geometry, Ps.material = this.material, Ps.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), Ls.copy(this.boundingSphere), Ls.applyMatrix4(n), t.ray.intersectsSphere(Ls) !== !1))
      for (let r = 0; r < s; r++) {
        this.getMatrixAt(r, $i), Eh.multiplyMatrices(n, $i), Ps.matrixWorld = Eh, Ps.raycast(t, Fr);
        for (let o = 0, a = Fr.length; o < a; o++) {
          const l = Fr[o];
          l.instanceId = r, l.object = this, e.push(l);
        }
        Fr.length = 0;
      }
  }
  setColorAt(t, e) {
    this.instanceColor === null && (this.instanceColor = new ll(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), e.toArray(this.instanceColor.array, t * 3);
  }
  setMatrixAt(t, e) {
    e.toArray(this.instanceMatrix.array, t * 16);
  }
  setMorphAt(t, e) {
    const n = e.morphTargetInfluences, s = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new ad(new Float32Array(s * this.count), s, this.count, Rl, _n));
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
class Eo extends vn {
  constructor(t) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Tt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const po = /* @__PURE__ */ new P(), mo = /* @__PURE__ */ new P(), Th = /* @__PURE__ */ new Ft(), Is = /* @__PURE__ */ new gs(), Br = /* @__PURE__ */ new En(), ca = /* @__PURE__ */ new P(), Ah = /* @__PURE__ */ new P();
class kl extends ye {
  constructor(t = new Ie(), e = new Eo()) {
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
      t.setAttribute("lineDistance", new de(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(t, e) {
    const n = this.geometry, s = this.matrixWorld, r = t.params.Line.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Br.copy(n.boundingSphere), Br.applyMatrix4(s), Br.radius += r, t.ray.intersectsSphere(Br) === !1) return;
    Th.copy(s).invert(), Is.copy(t.ray).applyMatrix4(Th);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = this.isLineSegments ? 2 : 1, h = n.index, d = n.attributes.position;
    if (h !== null) {
      const f = Math.max(0, o.start), g = Math.min(h.count, o.start + o.count);
      for (let v = f, p = g - 1; v < p; v += c) {
        const m = h.getX(v), y = h.getX(v + 1), _ = kr(this, t, Is, l, m, y);
        _ && e.push(_);
      }
      if (this.isLineLoop) {
        const v = h.getX(g - 1), p = h.getX(f), m = kr(this, t, Is, l, v, p);
        m && e.push(m);
      }
    } else {
      const f = Math.max(0, o.start), g = Math.min(d.count, o.start + o.count);
      for (let v = f, p = g - 1; v < p; v += c) {
        const m = kr(this, t, Is, l, v, v + 1);
        m && e.push(m);
      }
      if (this.isLineLoop) {
        const v = kr(this, t, Is, l, g - 1, f);
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
  if (po.fromBufferAttribute(o, s), mo.fromBufferAttribute(o, r), e.distanceSqToSegment(po, mo, ca, Ah) > n) return;
  ca.applyMatrix4(i.matrixWorld);
  const l = t.ray.origin.distanceTo(ca);
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
      t.setAttribute("lineDistance", new de(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Ov extends kl {
  constructor(t, e) {
    super(t, e), this.isLineLoop = !0, this.type = "LineLoop";
  }
}
class ld extends vn {
  constructor(t) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new Tt(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
  }
}
const Ph = /* @__PURE__ */ new Ft(), cl = /* @__PURE__ */ new gs(), zr = /* @__PURE__ */ new En(), Hr = /* @__PURE__ */ new P();
class Fv extends ye {
  constructor(t = new Ie(), e = new ld()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = t, this.material = e, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  raycast(t, e) {
    const n = this.geometry, s = this.matrixWorld, r = t.params.Points.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), zr.copy(n.boundingSphere), zr.applyMatrix4(s), zr.radius += r, t.ray.intersectsSphere(zr) === !1) return;
    Ph.copy(s).invert(), cl.copy(t.ray).applyMatrix4(Ph);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = n.index, u = n.attributes.position;
    if (c !== null) {
      const d = Math.max(0, o.start), f = Math.min(c.count, o.start + o.count);
      for (let g = d, v = f; g < v; g++) {
        const p = c.getX(g);
        Hr.fromBufferAttribute(u, p), Lh(Hr, p, l, s, t, e, this);
      }
    } else {
      const d = Math.max(0, o.start), f = Math.min(u.count, o.start + o.count);
      for (let g = d, v = f; g < v; g++)
        Hr.fromBufferAttribute(u, g), Lh(Hr, g, l, s, t, e, this);
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
  const a = cl.distanceSqToPoint(i);
  if (a < e) {
    const l = new P();
    cl.closestPointToPoint(i, l), l.applyMatrix4(n);
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
class cd extends Ce {
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
    const h = n[s], d = n[s + 1] - h, f = (o - h) / d;
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
    const h = Math.abs(s[0].x), u = Math.abs(s[0].y), d = Math.abs(s[0].z);
    h <= c && (c = h, n.set(1, 0, 0)), u <= c && (c = u, n.set(0, 1, 0)), d <= c && n.set(0, 0, 1), a.crossVectors(s[0], n).normalize(), r[0].crossVectors(s[0], a), o[0].crossVectors(s[0], r[0]);
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
      const h = Math.cos(this.aRotation), u = Math.sin(this.aRotation), d = l - this.aX, f = c - this.aY;
      l = d * h - f * u + this.aX, c = d * u + f * h + this.aY;
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
class Bv extends Hl {
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
    initNonuniformCatmullRom: function(r, o, a, l, c, h, u) {
      let d = (o - r) / c - (a - r) / (c + h) + (a - o) / h, f = (a - o) / h - (l - o) / (h + u) + (l - a) / u;
      d *= h, f *= h, s(o, a, d, f);
    },
    calc: function(r) {
      const o = r * r, a = o * r;
      return i + t * r + e * o + n * a;
    }
  };
}
const Gr = /* @__PURE__ */ new P(), ha = /* @__PURE__ */ new Gl(), ua = /* @__PURE__ */ new Gl(), da = /* @__PURE__ */ new Gl();
class kv extends wn {
  constructor(t = [], e = !1, n = "centripetal", s = 0.5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = t, this.closed = e, this.curveType = n, this.tension = s;
  }
  getPoint(t, e = new P()) {
    const n = e, s = this.points, r = s.length, o = (r - (this.closed ? 0 : 1)) * t;
    let a = Math.floor(o), l = o - a;
    this.closed ? a += a > 0 ? 0 : (Math.floor(Math.abs(a) / r) + 1) * r : l === 0 && a === r - 1 && (a = r - 2, l = 1);
    let c, h;
    this.closed || a > 0 ? c = s[(a - 1) % r] : (Gr.subVectors(s[0], s[1]).add(s[0]), c = Gr);
    const u = s[a % r], d = s[(a + 1) % r];
    if (this.closed || a + 2 < r ? h = s[(a + 2) % r] : (Gr.subVectors(s[r - 1], s[r - 2]).add(s[r - 1]), h = Gr), this.curveType === "centripetal" || this.curveType === "chordal") {
      const f = this.curveType === "chordal" ? 0.5 : 0.25;
      let g = Math.pow(c.distanceToSquared(u), f), v = Math.pow(u.distanceToSquared(d), f), p = Math.pow(d.distanceToSquared(h), f);
      v < 1e-4 && (v = 1), g < 1e-4 && (g = v), p < 1e-4 && (p = v), ha.initNonuniformCatmullRom(c.x, u.x, d.x, h.x, g, v, p), ua.initNonuniformCatmullRom(c.y, u.y, d.y, h.y, g, v, p), da.initNonuniformCatmullRom(c.z, u.z, d.z, h.z, g, v, p);
    } else this.curveType === "catmullrom" && (ha.initCatmullRom(c.x, u.x, d.x, h.x, this.tension), ua.initCatmullRom(c.y, u.y, d.y, h.y, this.tension), da.initCatmullRom(c.z, u.z, d.z, h.z, this.tension));
    return n.set(
      ha.calc(l),
      ua.calc(l),
      da.calc(l)
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
function zv(i, t) {
  const e = 1 - i;
  return e * e * t;
}
function Hv(i, t) {
  return 2 * (1 - i) * i * t;
}
function Gv(i, t) {
  return i * i * t;
}
function Gs(i, t, e, n) {
  return zv(i, t) + Hv(i, e) + Gv(i, n);
}
function Vv(i, t) {
  const e = 1 - i;
  return e * e * e * t;
}
function Wv(i, t) {
  const e = 1 - i;
  return 3 * e * e * i * t;
}
function $v(i, t) {
  return 3 * (1 - i) * i * i * t;
}
function Xv(i, t) {
  return i * i * i * t;
}
function Vs(i, t, e, n, s) {
  return Vv(i, t) + Wv(i, e) + $v(i, n) + Xv(i, s);
}
class hd extends wn {
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
class jv extends wn {
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
class ud extends wn {
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
class Yv extends wn {
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
class dd extends wn {
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
class qv extends wn {
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
class fd extends wn {
  constructor(t = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = t;
  }
  getPoint(t, e = new nt()) {
    const n = e, s = this.points, r = (s.length - 1) * t, o = Math.floor(r), a = r - o, l = s[o === 0 ? o : o - 1], c = s[o], h = s[o > s.length - 2 ? s.length - 1 : o + 1], u = s[o > s.length - 3 ? s.length - 1 : o + 2];
    return n.set(
      Ih(a, l.x, c.x, h.x, u.x),
      Ih(a, l.y, c.y, h.y, u.y)
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
  ArcCurve: Bv,
  CatmullRomCurve3: kv,
  CubicBezierCurve: hd,
  CubicBezierCurve3: jv,
  EllipseCurve: Hl,
  LineCurve: ud,
  LineCurve3: Yv,
  QuadraticBezierCurve: dd,
  QuadraticBezierCurve3: qv,
  SplineCurve: fd
});
class Kv extends wn {
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
class Nh extends Kv {
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
    const n = new ud(this.currentPoint.clone(), new nt(t, e));
    return this.curves.push(n), this.currentPoint.set(t, e), this;
  }
  quadraticCurveTo(t, e, n, s) {
    const r = new dd(
      this.currentPoint.clone(),
      new nt(t, e),
      new nt(n, s)
    );
    return this.curves.push(r), this.currentPoint.set(n, s), this;
  }
  bezierCurveTo(t, e, n, s, r, o) {
    const a = new hd(
      this.currentPoint.clone(),
      new nt(t, e),
      new nt(n, s),
      new nt(r, o)
    );
    return this.curves.push(a), this.currentPoint.set(r, o), this;
  }
  splineThru(t) {
    const e = [this.currentPoint.clone()].concat(t), n = new fd(e);
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
      const u = c.getPoint(0);
      u.equals(this.currentPoint) || this.lineTo(u.x, u.y);
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
    for (let u = 0, d = 3; u <= e; u++, d += 3) {
      const f = n + u / e * s;
      c.x = t * Math.cos(f), c.y = t * Math.sin(f), o.push(c.x, c.y, c.z), a.push(0, 0, 1), h.x = (o[d] / t + 1) / 2, h.y = (o[d + 1] / t + 1) / 2, l.push(h.x, h.y);
    }
    for (let u = 1; u <= e; u++)
      r.push(u, u + 1, 0);
    this.setIndex(r), this.setAttribute("position", new de(o, 3)), this.setAttribute("normal", new de(a, 3)), this.setAttribute("uv", new de(l, 2));
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
    const h = [], u = [], d = [], f = [];
    let g = 0;
    const v = [], p = n / 2;
    let m = 0;
    y(), o === !1 && (t > 0 && _(!0), e > 0 && _(!1)), this.setIndex(h), this.setAttribute("position", new de(u, 3)), this.setAttribute("normal", new de(d, 3)), this.setAttribute("uv", new de(f, 2));
    function y() {
      const M = new P(), R = new P();
      let T = 0;
      const w = (e - t) / n;
      for (let C = 0; C <= r; C++) {
        const B = [], x = C / r, b = x * (e - t) + t;
        for (let F = 0; F <= s; F++) {
          const k = F / s, G = k * l + a, Z = Math.sin(G), W = Math.cos(G);
          R.x = b * Z, R.y = -x * n + p, R.z = b * W, u.push(R.x, R.y, R.z), M.set(Z, w, W).normalize(), d.push(M.x, M.y, M.z), f.push(k, 1 - x), B.push(g++);
        }
        v.push(B);
      }
      for (let C = 0; C < s; C++)
        for (let B = 0; B < r; B++) {
          const x = v[B][C], b = v[B + 1][C], F = v[B + 1][C + 1], k = v[B][C + 1];
          t > 0 && (h.push(x, b, k), T += 3), e > 0 && (h.push(b, F, k), T += 3);
        }
      c.addGroup(m, T, 0), m += T;
    }
    function _(M) {
      const R = g, T = new nt(), w = new P();
      let C = 0;
      const B = M === !0 ? t : e, x = M === !0 ? 1 : -1;
      for (let F = 1; F <= s; F++)
        u.push(0, p * x, 0), d.push(0, x, 0), f.push(0.5, 0.5), g++;
      const b = g;
      for (let F = 0; F <= s; F++) {
        const G = F / s * l + a, Z = Math.cos(G), W = Math.sin(G);
        w.x = B * W, w.y = p * x, w.z = B * Z, u.push(w.x, w.y, w.z), d.push(0, x, 0), T.x = Z * 0.5 + 0.5, T.y = W * 0.5 * x + 0.5, f.push(T.x, T.y), g++;
      }
      for (let F = 0; F < s; F++) {
        const k = R + F, G = b + F;
        M === !0 ? h.push(G, G + 1, k) : h.push(G + 1, G, k), C += 3;
      }
      c.addGroup(m, C, M === !0 ? 1 : 2), m += C;
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
    a(s), c(n), h(), this.setAttribute("position", new de(r, 3)), this.setAttribute("normal", new de(r.slice(), 3)), this.setAttribute("uv", new de(o, 2)), s === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function a(y) {
      const _ = new P(), M = new P(), R = new P();
      for (let T = 0; T < e.length; T += 3)
        f(e[T + 0], _), f(e[T + 1], M), f(e[T + 2], R), l(_, M, R, y);
    }
    function l(y, _, M, R) {
      const T = R + 1, w = [];
      for (let C = 0; C <= T; C++) {
        w[C] = [];
        const B = y.clone().lerp(M, C / T), x = _.clone().lerp(M, C / T), b = T - C;
        for (let F = 0; F <= b; F++)
          F === 0 && C === T ? w[C][F] = B : w[C][F] = B.clone().lerp(x, F / b);
      }
      for (let C = 0; C < T; C++)
        for (let B = 0; B < 2 * (T - C) - 1; B++) {
          const x = Math.floor(B / 2);
          B % 2 === 0 ? (d(w[C][x + 1]), d(w[C + 1][x]), d(w[C][x])) : (d(w[C][x + 1]), d(w[C + 1][x + 1]), d(w[C + 1][x]));
        }
    }
    function c(y) {
      const _ = new P();
      for (let M = 0; M < r.length; M += 3)
        _.x = r[M + 0], _.y = r[M + 1], _.z = r[M + 2], _.normalize().multiplyScalar(y), r[M + 0] = _.x, r[M + 1] = _.y, r[M + 2] = _.z;
    }
    function h() {
      const y = new P();
      for (let _ = 0; _ < r.length; _ += 3) {
        y.x = r[_ + 0], y.y = r[_ + 1], y.z = r[_ + 2];
        const M = p(y) / 2 / Math.PI + 0.5, R = m(y) / Math.PI + 0.5;
        o.push(M, 1 - R);
      }
      g(), u();
    }
    function u() {
      for (let y = 0; y < o.length; y += 6) {
        const _ = o[y + 0], M = o[y + 2], R = o[y + 4], T = Math.max(_, M, R), w = Math.min(_, M, R);
        T > 0.9 && w < 0.1 && (_ < 0.2 && (o[y + 0] += 1), M < 0.2 && (o[y + 2] += 1), R < 0.2 && (o[y + 4] += 1));
      }
    }
    function d(y) {
      r.push(y.x, y.y, y.z);
    }
    function f(y, _) {
      const M = y * 3;
      _.x = t[M + 0], _.y = t[M + 1], _.z = t[M + 2];
    }
    function g() {
      const y = new P(), _ = new P(), M = new P(), R = new P(), T = new nt(), w = new nt(), C = new nt();
      for (let B = 0, x = 0; B < r.length; B += 9, x += 6) {
        y.set(r[B + 0], r[B + 1], r[B + 2]), _.set(r[B + 3], r[B + 4], r[B + 5]), M.set(r[B + 6], r[B + 7], r[B + 8]), T.set(o[x + 0], o[x + 1]), w.set(o[x + 2], o[x + 3]), C.set(o[x + 4], o[x + 5]), R.copy(y).add(_).add(M).divideScalar(3);
        const b = p(R);
        v(T, x + 0, y, b), v(w, x + 2, _, b), v(C, x + 4, M, b);
      }
    }
    function v(y, _, M, R) {
      R < 0 && y.x === 1 && (o[_] = y.x - 1), M.x === 0 && M.z === 0 && (o[_] = R / 2 / Math.PI + 0.5);
    }
    function p(y) {
      return Math.atan2(y.z, -y.x);
    }
    function m(y) {
      return Math.atan2(-y.y, Math.sqrt(y.x * y.x + y.z * y.z));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new $l(t.vertices, t.indices, t.radius, t.details);
  }
}
class pd extends Nh {
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
const Zv = {
  triangulate: function(i, t, e = 2) {
    const n = t && t.length, s = n ? t[0] * e : i.length;
    let r = md(i, 0, s, e, !0);
    const o = [];
    if (!r || r.next === r.prev) return o;
    let a, l, c, h, u, d, f;
    if (n && (r = nx(i, t, r, e)), i.length > 80 * e) {
      a = c = i[0], l = h = i[1];
      for (let g = e; g < s; g += e)
        u = i[g], d = i[g + 1], u < a && (a = u), d < l && (l = d), u > c && (c = u), d > h && (h = d);
      f = Math.max(c - a, h - l), f = f !== 0 ? 32767 / f : 0;
    }
    return tr(r, o, e, a, l, f, 0), o;
  }
};
function md(i, t, e, n, s) {
  let r, o;
  if (s === fx(i, t, e, n) > 0)
    for (r = t; r < e; r += n) o = Uh(r, i[r], i[r + 1], o);
  else
    for (r = e - n; r >= t; r -= n) o = Uh(r, i[r], i[r + 1], o);
  return o && wo(o, o.next) && (nr(o), o = o.next), o;
}
function Ei(i, t) {
  if (!i) return i;
  t || (t = i);
  let e = i, n;
  do
    if (n = !1, !e.steiner && (wo(e, e.next) || Me(e.prev, e, e.next) === 0)) {
      if (nr(e), e = t = e.prev, e === e.next) break;
      n = !0;
    } else
      e = e.next;
  while (n || e !== t);
  return t;
}
function tr(i, t, e, n, s, r, o) {
  if (!i) return;
  !o && r && ax(i, n, s, r);
  let a = i, l, c;
  for (; i.prev !== i.next; ) {
    if (l = i.prev, c = i.next, r ? Qv(i, n, s, r) : Jv(i)) {
      t.push(l.i / e | 0), t.push(i.i / e | 0), t.push(c.i / e | 0), nr(i), i = c.next, a = c.next;
      continue;
    }
    if (i = c, i === a) {
      o ? o === 1 ? (i = tx(Ei(i), t, e), tr(i, t, e, n, s, r, 2)) : o === 2 && ex(i, t, e, n, s, r) : tr(Ei(i), t, e, n, s, r, 1);
      break;
    }
  }
}
function Jv(i) {
  const t = i.prev, e = i, n = i.next;
  if (Me(t, e, n) >= 0) return !1;
  const s = t.x, r = e.x, o = n.x, a = t.y, l = e.y, c = n.y, h = s < r ? s < o ? s : o : r < o ? r : o, u = a < l ? a < c ? a : c : l < c ? l : c, d = s > r ? s > o ? s : o : r > o ? r : o, f = a > l ? a > c ? a : c : l > c ? l : c;
  let g = n.next;
  for (; g !== t; ) {
    if (g.x >= h && g.x <= d && g.y >= u && g.y <= f && Zi(s, a, r, l, o, c, g.x, g.y) && Me(g.prev, g, g.next) >= 0) return !1;
    g = g.next;
  }
  return !0;
}
function Qv(i, t, e, n) {
  const s = i.prev, r = i, o = i.next;
  if (Me(s, r, o) >= 0) return !1;
  const a = s.x, l = r.x, c = o.x, h = s.y, u = r.y, d = o.y, f = a < l ? a < c ? a : c : l < c ? l : c, g = h < u ? h < d ? h : d : u < d ? u : d, v = a > l ? a > c ? a : c : l > c ? l : c, p = h > u ? h > d ? h : d : u > d ? u : d, m = hl(f, g, t, e, n), y = hl(v, p, t, e, n);
  let _ = i.prevZ, M = i.nextZ;
  for (; _ && _.z >= m && M && M.z <= y; ) {
    if (_.x >= f && _.x <= v && _.y >= g && _.y <= p && _ !== s && _ !== o && Zi(a, h, l, u, c, d, _.x, _.y) && Me(_.prev, _, _.next) >= 0 || (_ = _.prevZ, M.x >= f && M.x <= v && M.y >= g && M.y <= p && M !== s && M !== o && Zi(a, h, l, u, c, d, M.x, M.y) && Me(M.prev, M, M.next) >= 0)) return !1;
    M = M.nextZ;
  }
  for (; _ && _.z >= m; ) {
    if (_.x >= f && _.x <= v && _.y >= g && _.y <= p && _ !== s && _ !== o && Zi(a, h, l, u, c, d, _.x, _.y) && Me(_.prev, _, _.next) >= 0) return !1;
    _ = _.prevZ;
  }
  for (; M && M.z <= y; ) {
    if (M.x >= f && M.x <= v && M.y >= g && M.y <= p && M !== s && M !== o && Zi(a, h, l, u, c, d, M.x, M.y) && Me(M.prev, M, M.next) >= 0) return !1;
    M = M.nextZ;
  }
  return !0;
}
function tx(i, t, e) {
  let n = i;
  do {
    const s = n.prev, r = n.next.next;
    !wo(s, r) && gd(s, n, n.next, r) && er(s, r) && er(r, s) && (t.push(s.i / e | 0), t.push(n.i / e | 0), t.push(r.i / e | 0), nr(n), nr(n.next), n = i = r), n = n.next;
  } while (n !== i);
  return Ei(n);
}
function ex(i, t, e, n, s, r) {
  let o = i;
  do {
    let a = o.next.next;
    for (; a !== o.prev; ) {
      if (o.i !== a.i && hx(o, a)) {
        let l = _d(o, a);
        o = Ei(o, o.next), l = Ei(l, l.next), tr(o, t, e, n, s, r, 0), tr(l, t, e, n, s, r, 0);
        return;
      }
      a = a.next;
    }
    o = o.next;
  } while (o !== i);
}
function nx(i, t, e, n) {
  const s = [];
  let r, o, a, l, c;
  for (r = 0, o = t.length; r < o; r++)
    a = t[r] * n, l = r < o - 1 ? t[r + 1] * n : i.length, c = md(i, a, l, n, !1), c === c.next && (c.steiner = !0), s.push(cx(c));
  for (s.sort(ix), r = 0; r < s.length; r++)
    e = sx(s[r], e);
  return e;
}
function ix(i, t) {
  return i.x - t.x;
}
function sx(i, t) {
  const e = rx(i, t);
  if (!e)
    return t;
  const n = _d(e, i);
  return Ei(n, n.next), Ei(e, e.next);
}
function rx(i, t) {
  let e = t, n = -1 / 0, s;
  const r = i.x, o = i.y;
  do {
    if (o <= e.y && o >= e.next.y && e.next.y !== e.y) {
      const d = e.x + (o - e.y) * (e.next.x - e.x) / (e.next.y - e.y);
      if (d <= r && d > n && (n = d, s = e.x < e.next.x ? e : e.next, d === r))
        return s;
    }
    e = e.next;
  } while (e !== t);
  if (!s) return null;
  const a = s, l = s.x, c = s.y;
  let h = 1 / 0, u;
  e = s;
  do
    r >= e.x && e.x >= l && r !== e.x && Zi(o < c ? r : n, o, l, c, o < c ? n : r, o, e.x, e.y) && (u = Math.abs(o - e.y) / (r - e.x), er(e, i) && (u < h || u === h && (e.x > s.x || e.x === s.x && ox(s, e))) && (s = e, h = u)), e = e.next;
  while (e !== a);
  return s;
}
function ox(i, t) {
  return Me(i.prev, i, t.prev) < 0 && Me(t.next, i, i.next) < 0;
}
function ax(i, t, e, n) {
  let s = i;
  do
    s.z === 0 && (s.z = hl(s.x, s.y, t, e, n)), s.prevZ = s.prev, s.nextZ = s.next, s = s.next;
  while (s !== i);
  s.prevZ.nextZ = null, s.prevZ = null, lx(s);
}
function lx(i) {
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
function hl(i, t, e, n, s) {
  return i = (i - e) * s | 0, t = (t - n) * s | 0, i = (i | i << 8) & 16711935, i = (i | i << 4) & 252645135, i = (i | i << 2) & 858993459, i = (i | i << 1) & 1431655765, t = (t | t << 8) & 16711935, t = (t | t << 4) & 252645135, t = (t | t << 2) & 858993459, t = (t | t << 1) & 1431655765, i | t << 1;
}
function cx(i) {
  let t = i, e = i;
  do
    (t.x < e.x || t.x === e.x && t.y < e.y) && (e = t), t = t.next;
  while (t !== i);
  return e;
}
function Zi(i, t, e, n, s, r, o, a) {
  return (s - o) * (t - a) >= (i - o) * (r - a) && (i - o) * (n - a) >= (e - o) * (t - a) && (e - o) * (r - a) >= (s - o) * (n - a);
}
function hx(i, t) {
  return i.next.i !== t.i && i.prev.i !== t.i && !ux(i, t) && // dones't intersect other edges
  (er(i, t) && er(t, i) && dx(i, t) && // locally visible
  (Me(i.prev, i, t.prev) || Me(i, t.prev, t)) || // does not create opposite-facing sectors
  wo(i, t) && Me(i.prev, i, i.next) > 0 && Me(t.prev, t, t.next) > 0);
}
function Me(i, t, e) {
  return (t.y - i.y) * (e.x - t.x) - (t.x - i.x) * (e.y - t.y);
}
function wo(i, t) {
  return i.x === t.x && i.y === t.y;
}
function gd(i, t, e, n) {
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
    if (e.i !== i.i && e.next.i !== i.i && e.i !== t.i && e.next.i !== t.i && gd(e, e.next, i, t)) return !0;
    e = e.next;
  } while (e !== i);
  return !1;
}
function er(i, t) {
  return Me(i.prev, i, i.next) < 0 ? Me(i, t, i.next) >= 0 && Me(i, i.prev, t) >= 0 : Me(i, t, i.prev) < 0 || Me(i, i.next, t) < 0;
}
function dx(i, t) {
  let e = i, n = !1;
  const s = (i.x + t.x) / 2, r = (i.y + t.y) / 2;
  do
    e.y > r != e.next.y > r && e.next.y !== e.y && s < (e.next.x - e.x) * (r - e.y) / (e.next.y - e.y) + e.x && (n = !n), e = e.next;
  while (e !== i);
  return n;
}
function _d(i, t) {
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
function fx(i, t, e, n) {
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
    const a = Zv.triangulate(n, s);
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
  constructor(t = new pd([new nt(0, 0.5), new nt(-0.5, -0.5), new nt(0.5, -0.5)]), e = 12) {
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
    this.setIndex(n), this.setAttribute("position", new de(s, 3)), this.setAttribute("normal", new de(r, 3)), this.setAttribute("uv", new de(o, 2));
    function c(h) {
      const u = s.length / 3, d = h.extractPoints(e);
      let f = d.shape;
      const g = d.holes;
      Ws.isClockWise(f) === !1 && (f = f.reverse());
      for (let p = 0, m = g.length; p < m; p++) {
        const y = g[p];
        Ws.isClockWise(y) === !0 && (g[p] = y.reverse());
      }
      const v = Ws.triangulateShape(f, g);
      for (let p = 0, m = g.length; p < m; p++) {
        const y = g[p];
        f = f.concat(y);
      }
      for (let p = 0, m = f.length; p < m; p++) {
        const y = f[p];
        s.push(y.x, y.y, 0), r.push(0, 0, 1), o.push(y.x, y.y);
      }
      for (let p = 0, m = v.length; p < m; p++) {
        const y = v[p], _ = y[0] + u, M = y[1] + u, R = y[2] + u;
        n.push(_, M, R), l += 3;
      }
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  toJSON() {
    const t = super.toJSON(), e = this.parameters.shapes;
    return px(e, t);
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
function px(i, t) {
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
    const h = [], u = new P(), d = new P(), f = [], g = [], v = [], p = [];
    for (let m = 0; m <= n; m++) {
      const y = [], _ = m / n;
      let M = 0;
      m === 0 && o === 0 ? M = 0.5 / e : m === n && l === Math.PI && (M = -0.5 / e);
      for (let R = 0; R <= e; R++) {
        const T = R / e;
        u.x = -t * Math.cos(s + T * r) * Math.sin(o + _ * a), u.y = t * Math.cos(o + _ * a), u.z = t * Math.sin(s + T * r) * Math.sin(o + _ * a), g.push(u.x, u.y, u.z), d.copy(u).normalize(), v.push(d.x, d.y, d.z), p.push(T + M, 1 - _), y.push(c++);
      }
      h.push(y);
    }
    for (let m = 0; m < n; m++)
      for (let y = 0; y < e; y++) {
        const _ = h[m][y + 1], M = h[m][y], R = h[m + 1][y], T = h[m + 1][y + 1];
        (m !== 0 || o > 0) && f.push(_, M, T), (m !== n - 1 || l < Math.PI) && f.push(M, R, T);
      }
    this.setIndex(f), this.setAttribute("position", new de(g, 3)), this.setAttribute("normal", new de(v, 3)), this.setAttribute("uv", new de(p, 2));
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
    const o = [], a = [], l = [], c = [], h = new P(), u = new P(), d = new P();
    for (let f = 0; f <= n; f++)
      for (let g = 0; g <= s; g++) {
        const v = g / s * r, p = f / n * Math.PI * 2;
        u.x = (t + e * Math.cos(p)) * Math.cos(v), u.y = (t + e * Math.cos(p)) * Math.sin(v), u.z = e * Math.sin(p), a.push(u.x, u.y, u.z), h.x = t * Math.cos(v), h.y = t * Math.sin(v), d.subVectors(u, h).normalize(), l.push(d.x, d.y, d.z), c.push(g / s), c.push(f / n);
      }
    for (let f = 1; f <= n; f++)
      for (let g = 1; g <= s; g++) {
        const v = (s + 1) * f + g - 1, p = (s + 1) * (f - 1) + g - 1, m = (s + 1) * (f - 1) + g, y = (s + 1) * f + g;
        o.push(v, p, y), o.push(p, m, y);
      }
    this.setIndex(o), this.setAttribute("position", new de(a, 3)), this.setAttribute("normal", new de(l, 3)), this.setAttribute("uv", new de(c, 2));
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
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new Tt(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Tt(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Bu, this.normalScale = new nt(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new bn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t);
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
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new Tt(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new Tt(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new Tt(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(t);
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
function mx(i) {
  return ArrayBuffer.isView(i) && !(i instanceof DataView);
}
function gx(i) {
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
function vd(i, t, e, n) {
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
class _x extends lr {
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
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = t * a, c = l - a, h = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, f = this._weightNext, g = (n - e) / (s - e), v = g * g, p = v * g, m = -d * p + 2 * d * v - d * g, y = (1 + d) * p + (-1.5 - 2 * d) * v + (-0.5 + d) * g + 1, _ = (-1 - f) * p + (1.5 + f) * v + 0.5 * g, M = f * p - f * v;
    for (let R = 0; R !== a; ++R)
      r[R] = m * o[h + R] + y * o[c + R] + _ * o[l + R] + M * o[u + R];
    return r;
  }
}
class vx extends lr {
  constructor(t, e, n, s) {
    super(t, e, n, s);
  }
  interpolate_(t, e, n, s) {
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = t * a, c = l - a, h = (n - e) / (s - e), u = 1 - h;
    for (let d = 0; d !== a; ++d)
      r[d] = o[c + d] * u + o[l + d] * h;
    return r;
  }
}
class xx extends lr {
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
    return new xx(this.times, this.values, this.getValueSize(), t);
  }
  InterpolantFactoryMethodLinear(t) {
    return new vx(this.times, this.values, this.getValueSize(), t);
  }
  InterpolantFactoryMethodSmooth(t) {
    return new _x(this.times, this.values, this.getValueSize(), t);
  }
  setInterpolation(t) {
    let e;
    switch (t) {
      case Ks:
        e = this.InterpolantFactoryMethodDiscrete;
        break;
      case Zs:
        e = this.InterpolantFactoryMethodLinear;
        break;
      case Lo:
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
        return Ks;
      case this.InterpolantFactoryMethodLinear:
        return Zs;
      case this.InterpolantFactoryMethodSmooth:
        return Lo;
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
    if (s !== void 0 && mx(s))
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
    const t = this.times.slice(), e = this.values.slice(), n = this.getValueSize(), s = this.getInterpolation() === Lo, r = t.length - 1;
    let o = 1;
    for (let a = 1; a < r; ++a) {
      let l = !1;
      const c = t[a], h = t[a + 1];
      if (c !== h && (a !== 1 || c !== t[0]))
        if (s)
          l = !0;
        else {
          const u = a * n, d = u - n, f = u + n;
          for (let g = 0; g !== n; ++g) {
            const v = e[u + g];
            if (v !== e[d + g] || v !== e[f + g]) {
              l = !0;
              break;
            }
          }
        }
      if (l) {
        if (a !== o) {
          t[o] = t[a];
          const u = a * n, d = o * n;
          for (let f = 0; f !== n; ++f)
            e[d + f] = e[u + f];
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
class vs extends An {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(t, e, n) {
    super(t, e, n);
  }
}
vs.prototype.ValueTypeName = "bool";
vs.prototype.ValueBufferType = Array;
vs.prototype.DefaultInterpolation = Ks;
vs.prototype.InterpolantFactoryMethodLinear = void 0;
vs.prototype.InterpolantFactoryMethodSmooth = void 0;
class xd extends An {
}
xd.prototype.ValueTypeName = "color";
class fs extends An {
}
fs.prototype.ValueTypeName = "number";
class yx extends lr {
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
class ps extends An {
  InterpolantFactoryMethodLinear(t) {
    return new yx(this.times, this.values, this.getValueSize(), t);
  }
}
ps.prototype.ValueTypeName = "quaternion";
ps.prototype.InterpolantFactoryMethodSmooth = void 0;
class xs extends An {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(t, e, n) {
    super(t, e, n);
  }
}
xs.prototype.ValueTypeName = "string";
xs.prototype.ValueBufferType = Array;
xs.prototype.DefaultInterpolation = Ks;
xs.prototype.InterpolantFactoryMethodLinear = void 0;
xs.prototype.InterpolantFactoryMethodSmooth = void 0;
class ms extends An {
}
ms.prototype.ValueTypeName = "vector";
class Mx {
  constructor(t = "", e = -1, n = [], s = Vf) {
    this.name = t, this.tracks = n, this.duration = e, this.blendMode = s, this.uuid = cn(), this.duration < 0 && this.resetDuration();
  }
  static parse(t) {
    const e = [], n = t.tracks, s = 1 / (t.fps || 1);
    for (let o = 0, a = n.length; o !== a; ++o)
      e.push(bx(n[o]).scale(s));
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
      const h = gx(l);
      l = Bh(l, 1, h), c = Bh(c, 1, h), !s && l[0] === 0 && (l.push(r), c.push(c[0])), o.push(
        new fs(
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
        const u = h[1];
        let d = s[u];
        d || (s[u] = d = []), d.push(c);
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
    const n = function(u, d, f, g, v) {
      if (f.length !== 0) {
        const p = [], m = [];
        vd(f, p, m, g), p.length !== 0 && v.push(new u(d, p, m));
      }
    }, s = [], r = t.name || "default", o = t.fps || 30, a = t.blendMode;
    let l = t.length || -1;
    const c = t.hierarchy || [];
    for (let u = 0; u < c.length; u++) {
      const d = c[u].keys;
      if (!(!d || d.length === 0))
        if (d[0].morphTargets) {
          const f = {};
          let g;
          for (g = 0; g < d.length; g++)
            if (d[g].morphTargets)
              for (let v = 0; v < d[g].morphTargets.length; v++)
                f[d[g].morphTargets[v]] = -1;
          for (const v in f) {
            const p = [], m = [];
            for (let y = 0; y !== d[g].morphTargets.length; ++y) {
              const _ = d[g];
              p.push(_.time), m.push(_.morphTarget === v ? 1 : 0);
            }
            s.push(new fs(".morphTargetInfluence[" + v + "]", p, m));
          }
          l = f.length * o;
        } else {
          const f = ".bones[" + e[u].name + "]";
          n(
            ms,
            f + ".position",
            d,
            "pos",
            s
          ), n(
            ps,
            f + ".quaternion",
            d,
            "rot",
            s
          ), n(
            ms,
            f + ".scale",
            d,
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
function Sx(i) {
  switch (i.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return fs;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return ms;
    case "color":
      return xd;
    case "quaternion":
      return ps;
    case "bool":
    case "boolean":
      return vs;
    case "string":
      return xs;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + i);
}
function bx(i) {
  if (i.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const t = Sx(i.type);
  if (i.times === void 0) {
    const e = [], n = [];
    vd(i.keys, e, n, "value"), i.times = e, i.values = n;
  }
  return t.parse !== void 0 ? t.parse(i) : new t(i.name, i.times, i.values, i.interpolation);
}
const ni = {
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
class Ex {
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
    }, this.addHandler = function(h, u) {
      return c.push(h, u), this;
    }, this.removeHandler = function(h) {
      const u = c.indexOf(h);
      return u !== -1 && c.splice(u, 2), this;
    }, this.getHandler = function(h) {
      for (let u = 0, d = c.length; u < d; u += 2) {
        const f = c[u], g = c[u + 1];
        if (f.global && (f.lastIndex = 0), f.test(h))
          return g;
      }
      return null;
    };
  }
}
const wx = /* @__PURE__ */ new Ex();
class ys {
  constructor(t) {
    this.manager = t !== void 0 ? t : wx, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
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
ys.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const Nn = {};
class Tx extends Error {
  constructor(t, e) {
    super(t), this.response = e;
  }
}
class yd extends ys {
  constructor(t) {
    super(t);
  }
  load(t, e, n, s) {
    t === void 0 && (t = ""), this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const r = ni.get(t);
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
        const h = Nn[t], u = c.body.getReader(), d = c.headers.get("X-File-Size") || c.headers.get("Content-Length"), f = d ? parseInt(d) : 0, g = f !== 0;
        let v = 0;
        const p = new ReadableStream({
          start(m) {
            y();
            function y() {
              u.read().then(({ done: _, value: M }) => {
                if (_)
                  m.close();
                else {
                  v += M.byteLength;
                  const R = new ProgressEvent("progress", { lengthComputable: g, loaded: v, total: f });
                  for (let T = 0, w = h.length; T < w; T++) {
                    const C = h[T];
                    C.onProgress && C.onProgress(R);
                  }
                  m.enqueue(M), y();
                }
              }, (_) => {
                m.error(_);
              });
            }
          }
        });
        return new Response(p);
      } else
        throw new Tx(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`, c);
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
            const u = /charset="?([^;"\s]*)"?/i.exec(a), d = u && u[1] ? u[1].toLowerCase() : void 0, f = new TextDecoder(d);
            return c.arrayBuffer().then((g) => f.decode(g));
          }
      }
    }).then((c) => {
      ni.add(t, c);
      const h = Nn[t];
      delete Nn[t];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
        f.onLoad && f.onLoad(c);
      }
    }).catch((c) => {
      const h = Nn[t];
      if (h === void 0)
        throw this.manager.itemError(t), c;
      delete Nn[t];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
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
class Ax extends ys {
  constructor(t) {
    super(t);
  }
  load(t, e, n, s) {
    this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const r = this, o = ni.get(t);
    if (o !== void 0)
      return r.manager.itemStart(t), setTimeout(function() {
        e && e(o), r.manager.itemEnd(t);
      }, 0), o;
    const a = Js("img");
    function l() {
      h(), ni.add(t, this), e && e(this), r.manager.itemEnd(t);
    }
    function c(u) {
      h(), s && s(u), r.manager.itemError(t), r.manager.itemEnd(t);
    }
    function h() {
      a.removeEventListener("load", l, !1), a.removeEventListener("error", c, !1);
    }
    return a.addEventListener("load", l, !1), a.addEventListener("error", c, !1), t.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (a.crossOrigin = this.crossOrigin), r.manager.itemStart(t), a.src = t, a;
  }
}
class Md extends ys {
  constructor(t) {
    super(t);
  }
  load(t, e, n, s) {
    const r = new Ce(), o = new Ax(this.manager);
    return o.setCrossOrigin(this.crossOrigin), o.setPath(this.path), o.load(t, function(a) {
      r.image = a, r.needsUpdate = !0, e !== void 0 && e(r);
    }, n, s), r;
  }
}
class cr extends ye {
  constructor(t, e = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Tt(t), this.intensity = e;
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
class Rx extends cr {
  constructor(t, e, n) {
    super(t, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(ye.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Tt(e);
  }
  copy(t, e) {
    return super.copy(t, e), this.groundColor.copy(t.groundColor), this;
  }
}
const fa = /* @__PURE__ */ new Ft(), kh = /* @__PURE__ */ new P(), zh = /* @__PURE__ */ new P();
class Yl {
  constructor(t) {
    this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new nt(512, 512), this.map = null, this.mapPass = null, this.matrix = new Ft(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Ul(), this._frameExtents = new nt(1, 1), this._viewportCount = 1, this._viewports = [
      new se(0, 0, 1, 1)
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
    kh.setFromMatrixPosition(t.matrixWorld), e.position.copy(kh), zh.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(zh), e.updateMatrixWorld(), fa.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(fa), n.set(
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
    ), n.multiply(fa);
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
class Cx extends Yl {
  constructor() {
    super(new ze(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(t) {
    const e = this.camera, n = us * 2 * t.angle * this.focus, s = this.mapSize.width / this.mapSize.height, r = t.distance || e.far;
    (n !== e.fov || s !== e.aspect || r !== e.far) && (e.fov = n, e.aspect = s, e.far = r, e.updateProjectionMatrix()), super.updateMatrices(t);
  }
  copy(t) {
    return super.copy(t), this.focus = t.focus, this;
  }
}
class Px extends cr {
  constructor(t, e, n = 0, s = Math.PI / 3, r = 0, o = 2) {
    super(t, e), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(ye.DEFAULT_UP), this.updateMatrix(), this.target = new ye(), this.distance = n, this.angle = s, this.penumbra = r, this.decay = o, this.map = null, this.shadow = new Cx();
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
const Hh = /* @__PURE__ */ new Ft(), Ds = /* @__PURE__ */ new P(), pa = /* @__PURE__ */ new P();
class Lx extends Yl {
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
      new se(2, 1, 1, 1),
      // negative X
      new se(0, 1, 1, 1),
      // positive Z
      new se(3, 1, 1, 1),
      // negative Z
      new se(1, 1, 1, 1),
      // positive Y
      new se(3, 0, 1, 1),
      // negative Y
      new se(1, 0, 1, 1)
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
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), Ds.setFromMatrixPosition(t.matrixWorld), n.position.copy(Ds), pa.copy(n.position), pa.add(this._cubeDirections[e]), n.up.copy(this._cubeUps[e]), n.lookAt(pa), n.updateMatrixWorld(), s.makeTranslation(-Ds.x, -Ds.y, -Ds.z), Hh.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Hh);
  }
}
class Sd extends cr {
  constructor(t, e, n = 0, s = 2) {
    super(t, e), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = s, this.shadow = new Lx();
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
class Ix extends Yl {
  constructor() {
    super(new Ol(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class ql extends cr {
  constructor(t, e) {
    super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(ye.DEFAULT_UP), this.updateMatrix(), this.target = new ye(), this.shadow = new Ix();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
}
class bd extends cr {
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
class Dx extends ys {
  constructor(t) {
    super(t), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" };
  }
  setOptions(t) {
    return this.options = t, this;
  }
  load(t, e, n, s) {
    t === void 0 && (t = ""), this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const r = this, o = ni.get(t);
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
      return ni.add(t, c), e && e(c), r.manager.itemEnd(t), c;
    }).catch(function(c) {
      s && s(c), ni.remove(t), r.manager.itemError(t), r.manager.itemEnd(t);
    });
    ni.add(t, l), r.manager.itemStart(t);
  }
}
class Nx {
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
const Kl = "\\[\\]\\.:\\/", Ux = new RegExp("[" + Kl + "]", "g"), Zl = "[^" + Kl + "]", Ox = "[^" + Kl.replace("\\.", "") + "]", Fx = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Zl), Bx = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", Ox), kx = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Zl), zx = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Zl), Hx = new RegExp(
  "^" + Fx + Bx + kx + zx + "$"
), Gx = ["material", "materials", "bones", "map"];
class Vx {
  constructor(t, e, n) {
    const s = n || ue.parseTrackName(e);
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
class ue {
  constructor(t, e, n) {
    this.path = e, this.parsedPath = n || ue.parseTrackName(e), this.node = ue.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(t, e, n) {
    return t && t.isAnimationObjectGroup ? new ue.Composite(t, e, n) : new ue(t, e, n);
  }
  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(t) {
    return t.replace(/\s/g, "_").replace(Ux, "");
  }
  static parseTrackName(t) {
    const e = Hx.exec(t);
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
      Gx.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, s), n.objectName = r);
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
    if (t || (t = ue.findNode(this.rootNode, e.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
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
ue.Composite = Vx;
ue.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
ue.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
ue.prototype.GetterByBindingType = [
  ue.prototype._getValue_direct,
  ue.prototype._getValue_array,
  ue.prototype._getValue_arrayElement,
  ue.prototype._getValue_toArray
];
ue.prototype.SetterByBindingTypeAndVersioning = [
  [
    // Direct
    ue.prototype._setValue_direct,
    ue.prototype._setValue_direct_setNeedsUpdate,
    ue.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    // EntireArray
    ue.prototype._setValue_array,
    ue.prototype._setValue_array_setNeedsUpdate,
    ue.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    // ArrayElement
    ue.prototype._setValue_arrayElement,
    ue.prototype._setValue_arrayElement_setNeedsUpdate,
    ue.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    // HasToFromArray
    ue.prototype._setValue_fromArray,
    ue.prototype._setValue_fromArray_setNeedsUpdate,
    ue.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
const Vh = /* @__PURE__ */ new Ft();
class Wx {
  constructor(t, e, n = 0, s = 1 / 0) {
    this.ray = new gs(t, e), this.near = n, this.far = s, this.camera = null, this.layers = new Nl(), this.params = {
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
    return dl(t, this, n, e), n.sort(Wh), n;
  }
  intersectObjects(t, e = !0, n = []) {
    for (let s = 0, r = t.length; s < r; s++)
      dl(t[s], this, n, e);
    return n.sort(Wh), n;
  }
}
function Wh(i, t) {
  return i.distance - t.distance;
}
function dl(i, t, e, n) {
  let s = !0;
  if (i.layers.test(t.layers) && i.raycast(t, e) === !1 && (s = !1), s === !0 && n === !0) {
    const r = i.children;
    for (let o = 0, a = r.length; o < a; o++)
      dl(r[o], t, e, !0);
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
class $x extends zl {
  constructor(t = 10, e = 10, n = 4473924, s = 8947848) {
    n = new Tt(n), s = new Tt(s);
    const r = e / 2, o = t / e, a = t / 2, l = [], c = [];
    for (let d = 0, f = 0, g = -a; d <= e; d++, g += o) {
      l.push(-a, 0, g, a, 0, g), l.push(g, 0, -a, g, 0, a);
      const v = d === r ? n : s;
      v.toArray(c, f), f += 3, v.toArray(c, f), f += 3, v.toArray(c, f), f += 3, v.toArray(c, f), f += 3;
    }
    const h = new Ie();
    h.setAttribute("position", new de(l, 3)), h.setAttribute("color", new de(c, 3));
    const u = new Eo({ vertexColors: !0, toneMapped: !1 });
    super(h, u), this.type = "GridHelper";
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
const Xr = /* @__PURE__ */ new Ye();
class Xx extends zl {
  constructor(t, e = 16776960) {
    const n = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]), s = new Float32Array(8 * 3), r = new Ie();
    r.setIndex(new Ue(n, 1)), r.setAttribute("position", new Ue(s, 3)), super(r, new Eo({ color: e, toneMapped: !1 })), this.object = t, this.type = "BoxHelper", this.matrixAutoUpdate = !1, this.update();
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
class jx extends wi {
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
const Xh = { type: "change" }, Jl = { type: "start" }, Ed = { type: "end" }, jr = new gs(), jh = new Fn(), Yx = Math.cos(70 * es.DEG2RAD), Ae = new P(), Xe = 2 * Math.PI, pe = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, ma = 1e-6;
class qx extends jx {
  constructor(t, e = null) {
    super(t, e), this.state = pe.NONE, this.enabled = !0, this.target = new P(), this.cursor = new P(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: pn.ROTATE, MIDDLE: pn.DOLLY, RIGHT: pn.PAN }, this.touches = { ONE: mn.ROTATE, TWO: mn.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new P(), this._lastQuaternion = new Sn(), this._lastTargetPosition = new P(), this._quat = new Sn().setFromUnitVectors(t.up, new P(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new $h(), this._sphericalDelta = new $h(), this._scale = 1, this._panOffset = new P(), this._rotateStart = new nt(), this._rotateEnd = new nt(), this._rotateDelta = new nt(), this._panStart = new nt(), this._panEnd = new nt(), this._panDelta = new nt(), this._dollyStart = new nt(), this._dollyEnd = new nt(), this._dollyDelta = new nt(), this._dollyDirection = new P(), this._mouse = new nt(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Zx.bind(this), this._onPointerDown = Kx.bind(this), this._onPointerUp = Jx.bind(this), this._onContextMenu = ry.bind(this), this._onMouseWheel = ey.bind(this), this._onKeyDown = ny.bind(this), this._onTouchStart = iy.bind(this), this._onTouchMove = sy.bind(this), this._onMouseDown = Qx.bind(this), this._onMouseMove = ty.bind(this), this._interceptControlDown = oy.bind(this), this._interceptControlUp = ay.bind(this), this.domElement !== null && this.connect(), this.update();
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
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (jr.origin.copy(this.object.position), jr.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(jr.direction)) < Yx ? this.object.lookAt(this.target) : (jh.setFromNormalAndCoplanarPoint(this.object.up, this.target), jr.intersectPlane(jh, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), r = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, r || this._lastPosition.distanceToSquared(this.object.position) > ma || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > ma || this._lastTargetPosition.distanceToSquared(this.target) > ma ? (this.dispatchEvent(Xh), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
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
function Kx(i) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
}
function Zx(i) {
  this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function Jx(i) {
  switch (this._removePointer(i), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Ed), this.state = pe.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function Qx(i) {
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
function ty(i) {
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
function ey(i) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== pe.NONE || (i.preventDefault(), this.dispatchEvent(Jl), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(Ed));
}
function ny(i) {
  this.enabled === !1 || this.enablePan === !1 || this._handleKeyDown(i);
}
function iy(i) {
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
function sy(i) {
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
function ry(i) {
  this.enabled !== !1 && i.preventDefault();
}
function oy(i) {
  i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function ay(i) {
  i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function Yh(i, t) {
  if (t === Wf)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), i;
  if (t === rl || t === Fu) {
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
    if (t === rl)
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
class ly extends ys {
  constructor(t) {
    super(t), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(e) {
      return new fy(e);
    }), this.register(function(e) {
      return new py(e);
    }), this.register(function(e) {
      return new by(e);
    }), this.register(function(e) {
      return new Ey(e);
    }), this.register(function(e) {
      return new wy(e);
    }), this.register(function(e) {
      return new gy(e);
    }), this.register(function(e) {
      return new _y(e);
    }), this.register(function(e) {
      return new vy(e);
    }), this.register(function(e) {
      return new xy(e);
    }), this.register(function(e) {
      return new dy(e);
    }), this.register(function(e) {
      return new yy(e);
    }), this.register(function(e) {
      return new my(e);
    }), this.register(function(e) {
      return new Sy(e);
    }), this.register(function(e) {
      return new My(e);
    }), this.register(function(e) {
      return new hy(e);
    }), this.register(function(e) {
      return new Ty(e);
    }), this.register(function(e) {
      return new Ay(e);
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
    }, l = new yd(this.manager);
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
      if (l.decode(new Uint8Array(t, 0, 4)) === wd) {
        try {
          o[Gt.KHR_BINARY_GLTF] = new Ry(t);
        } catch (u) {
          s && s(u);
          return;
        }
        r = JSON.parse(o[Gt.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(l.decode(t));
    else
      r = t;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      s && s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const c = new Hy(r, {
      path: e || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    c.fileLoader.setRequestHeader(this.requestHeader);
    for (let h = 0; h < this.pluginCallbacks.length; h++) {
      const u = this.pluginCallbacks[h](c);
      u.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), a[u.name] = u, o[u.name] = !0;
    }
    if (r.extensionsUsed)
      for (let h = 0; h < r.extensionsUsed.length; ++h) {
        const u = r.extensionsUsed[h], d = r.extensionsRequired || [];
        switch (u) {
          case Gt.KHR_MATERIALS_UNLIT:
            o[u] = new uy();
            break;
          case Gt.KHR_DRACO_MESH_COMPRESSION:
            o[u] = new Cy(r, this.dracoLoader);
            break;
          case Gt.KHR_TEXTURE_TRANSFORM:
            o[u] = new Py();
            break;
          case Gt.KHR_MESH_QUANTIZATION:
            o[u] = new Ly();
            break;
          default:
            d.indexOf(u) >= 0 && a[u] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + u + '".');
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
function cy() {
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
const Gt = {
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
class hy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
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
    const h = new Tt(16777215);
    l.color !== void 0 && h.setRGB(l.color[0], l.color[1], l.color[2], Oe);
    const u = l.range !== void 0 ? l.range : 0;
    switch (l.type) {
      case "directional":
        c = new ql(h), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new Sd(h), c.distance = u;
        break;
      case "spot":
        c = new Px(h), c.distance = u, l.spot = l.spot || {}, l.spot.innerConeAngle = l.spot.innerConeAngle !== void 0 ? l.spot.innerConeAngle : 0, l.spot.outerConeAngle = l.spot.outerConeAngle !== void 0 ? l.spot.outerConeAngle : Math.PI / 4, c.angle = l.spot.outerConeAngle, c.penumbra = 1 - l.spot.innerConeAngle / l.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
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
    this.name = Gt.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return en;
  }
  extendParams(t, e, n) {
    const s = [];
    t.color = new Tt(1, 1, 1), t.opacity = 1;
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
class dy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(t, e) {
    const s = this.parser.json.materials[t];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name].emissiveStrength;
    return r !== void 0 && (e.emissiveIntensity = r), Promise.resolve();
  }
}
class fy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_CLEARCOAT;
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
class py {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_DISPERSION;
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
class my {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_IRIDESCENCE;
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
class gy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_SHEEN;
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
    e.sheenColor = new Tt(0, 0, 0), e.sheenRoughness = 0, e.sheen = 1;
    const o = s.extensions[this.name];
    if (o.sheenColorFactor !== void 0) {
      const a = o.sheenColorFactor;
      e.sheenColor.setRGB(a[0], a[1], a[2], Oe);
    }
    return o.sheenRoughnessFactor !== void 0 && (e.sheenRoughness = o.sheenRoughnessFactor), o.sheenColorTexture !== void 0 && r.push(n.assignTexture(e, "sheenColorMap", o.sheenColorTexture, ke)), o.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(e, "sheenRoughnessMap", o.sheenRoughnessTexture)), Promise.all(r);
  }
}
class _y {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_TRANSMISSION;
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
class vy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_VOLUME;
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
    return e.attenuationColor = new Tt().setRGB(a[0], a[1], a[2], Oe), Promise.all(r);
  }
}
class xy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_IOR;
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
class yy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_SPECULAR;
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
    return e.specularColor = new Tt().setRGB(a[0], a[1], a[2], Oe), o.specularColorTexture !== void 0 && r.push(n.assignTexture(e, "specularColorMap", o.specularColorTexture, ke)), Promise.all(r);
  }
}
class My {
  constructor(t) {
    this.parser = t, this.name = Gt.EXT_MATERIALS_BUMP;
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
class Sy {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_MATERIALS_ANISOTROPY;
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
class by {
  constructor(t) {
    this.parser = t, this.name = Gt.KHR_TEXTURE_BASISU;
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
class Ey {
  constructor(t) {
    this.parser = t, this.name = Gt.EXT_TEXTURE_WEBP, this.isSupported = null;
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
class wy {
  constructor(t) {
    this.parser = t, this.name = Gt.EXT_TEXTURE_AVIF, this.isSupported = null;
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
class Ty {
  constructor(t) {
    this.name = Gt.EXT_MESHOPT_COMPRESSION, this.parser = t;
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
        const l = s.byteOffset || 0, c = s.byteLength || 0, h = s.count, u = s.byteStride, d = new Uint8Array(a, l, c);
        return o.decodeGltfBufferAsync ? o.decodeGltfBufferAsync(h, u, d, s.mode, s.filter).then(function(f) {
          return f.buffer;
        }) : o.ready.then(function() {
          const f = new ArrayBuffer(h * u);
          return o.decodeGltfBuffer(new Uint8Array(f), h, u, d, s.mode, s.filter), f;
        });
      });
    } else
      return null;
  }
}
class Ay {
  constructor(t) {
    this.name = Gt.EXT_MESH_GPU_INSTANCING, this.parser = t;
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
      const h = c.pop(), u = h.isGroup ? h.children : [h], d = c[0].count, f = [];
      for (const g of u) {
        const v = new Ft(), p = new P(), m = new Sn(), y = new P(1, 1, 1), _ = new Uv(g.geometry, g.material, d);
        for (let M = 0; M < d; M++)
          l.TRANSLATION && p.fromBufferAttribute(l.TRANSLATION, M), l.ROTATION && m.fromBufferAttribute(l.ROTATION, M), l.SCALE && y.fromBufferAttribute(l.SCALE, M), _.setMatrixAt(M, v.compose(p, m, y));
        for (const M in l)
          if (M === "_COLOR_0") {
            const R = l[M];
            _.instanceColor = new ll(R.array, R.itemSize, R.normalized);
          } else M !== "TRANSLATION" && M !== "ROTATION" && M !== "SCALE" && g.geometry.setAttribute(M, l[M]);
        ye.prototype.copy.call(_, g), this.parser.assignFinalMaterial(_), f.push(_);
      }
      return h.isGroup ? (h.clear(), h.add(...f), h) : f[0];
    }));
  }
}
const wd = "glTF", Ns = 12, qh = { JSON: 1313821514, BIN: 5130562 };
class Ry {
  constructor(t) {
    this.name = Gt.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const e = new DataView(t, 0, Ns), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(t.slice(0, 4))),
      version: e.getUint32(4, !0),
      length: e.getUint32(8, !0)
    }, this.header.magic !== wd)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - Ns, r = new DataView(t, Ns);
    let o = 0;
    for (; o < s; ) {
      const a = r.getUint32(o, !0);
      o += 4;
      const l = r.getUint32(o, !0);
      if (o += 4, l === qh.JSON) {
        const c = new Uint8Array(t, Ns + o, a);
        this.content = n.decode(c);
      } else if (l === qh.BIN) {
        const c = Ns + o;
        this.body = t.slice(c, c + a);
      }
      o += a;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Cy {
  constructor(t, e) {
    if (!e)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = Gt.KHR_DRACO_MESH_COMPRESSION, this.json = t, this.dracoLoader = e, this.dracoLoader.preload();
  }
  decodePrimitive(t, e) {
    const n = this.json, s = this.dracoLoader, r = t.extensions[this.name].bufferView, o = t.extensions[this.name].attributes, a = {}, l = {}, c = {};
    for (const h in o) {
      const u = fl[h] || h.toLowerCase();
      a[u] = o[h];
    }
    for (const h in t.attributes) {
      const u = fl[h] || h.toLowerCase();
      if (o[h] !== void 0) {
        const d = n.accessors[t.attributes[h]], f = is[d.componentType];
        c[u] = f.name, l[u] = d.normalized === !0;
      }
    }
    return e.getDependency("bufferView", r).then(function(h) {
      return new Promise(function(u, d) {
        s.decodeDracoFile(h, function(f) {
          for (const g in f.attributes) {
            const v = f.attributes[g], p = l[g];
            p !== void 0 && (v.normalized = p);
          }
          u(f);
        }, a, c, Oe, d);
      });
    });
  }
}
class Py {
  constructor() {
    this.name = Gt.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(t, e) {
    return (e.texCoord === void 0 || e.texCoord === t.channel) && e.offset === void 0 && e.rotation === void 0 && e.scale === void 0 || (t = t.clone(), e.texCoord !== void 0 && (t.channel = e.texCoord), e.offset !== void 0 && t.offset.fromArray(e.offset), e.rotation !== void 0 && (t.rotation = e.rotation), e.scale !== void 0 && t.repeat.fromArray(e.scale), t.needsUpdate = !0), t;
  }
}
class Ly {
  constructor() {
    this.name = Gt.KHR_MESH_QUANTIZATION;
  }
}
class Td extends lr {
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
    const r = this.resultBuffer, o = this.sampleValues, a = this.valueSize, l = a * 2, c = a * 3, h = s - e, u = (n - e) / h, d = u * u, f = d * u, g = t * c, v = g - c, p = -2 * f + 3 * d, m = f - d, y = 1 - p, _ = m - d + u;
    for (let M = 0; M !== a; M++) {
      const R = o[v + M + a], T = o[v + M + l] * h, w = o[g + M + a], C = o[g + M] * h;
      r[M] = y * R + _ * T + p * w + m * C;
    }
    return r;
  }
}
const Iy = new Sn();
class Dy extends Td {
  interpolate_(t, e, n, s) {
    const r = super.interpolate_(t, e, n, s);
    return Iy.fromArray(r).normalize().toArray(r), r;
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
}, is = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, Kh = {
  9728: Ve,
  9729: tn,
  9984: Au,
  9985: Jr,
  9986: Fs,
  9987: Bn
}, Zh = {
  33071: ei,
  33648: lo,
  10497: ri
}, ga = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, fl = {
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
}, Ny = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: Zs,
  STEP: Ks
}, _a = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Uy(i) {
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
function gi(i, t, e) {
  for (const n in e.extensions)
    i[n] === void 0 && (t.userData.gltfExtensions = t.userData.gltfExtensions || {}, t.userData.gltfExtensions[n] = e.extensions[n]);
}
function On(i, t) {
  t.extras !== void 0 && (typeof t.extras == "object" ? Object.assign(i.userData, t.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + t.extras));
}
function Oy(i, t, e) {
  let n = !1, s = !1, r = !1;
  for (let c = 0, h = t.length; c < h; c++) {
    const u = t[c];
    if (u.POSITION !== void 0 && (n = !0), u.NORMAL !== void 0 && (s = !0), u.COLOR_0 !== void 0 && (r = !0), n && s && r) break;
  }
  if (!n && !s && !r) return Promise.resolve(i);
  const o = [], a = [], l = [];
  for (let c = 0, h = t.length; c < h; c++) {
    const u = t[c];
    if (n) {
      const d = u.POSITION !== void 0 ? e.getDependency("accessor", u.POSITION) : i.attributes.position;
      o.push(d);
    }
    if (s) {
      const d = u.NORMAL !== void 0 ? e.getDependency("accessor", u.NORMAL) : i.attributes.normal;
      a.push(d);
    }
    if (r) {
      const d = u.COLOR_0 !== void 0 ? e.getDependency("accessor", u.COLOR_0) : i.attributes.color;
      l.push(d);
    }
  }
  return Promise.all([
    Promise.all(o),
    Promise.all(a),
    Promise.all(l)
  ]).then(function(c) {
    const h = c[0], u = c[1], d = c[2];
    return n && (i.morphAttributes.position = h), s && (i.morphAttributes.normal = u), r && (i.morphAttributes.color = d), i.morphTargetsRelative = !0, i;
  });
}
function Fy(i, t) {
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
function By(i) {
  let t;
  const e = i.extensions && i.extensions[Gt.KHR_DRACO_MESH_COMPRESSION];
  if (e ? t = "draco:" + e.bufferView + ":" + e.indices + ":" + va(e.attributes) : t = i.indices + ":" + va(i.attributes) + ":" + i.mode, i.targets !== void 0)
    for (let n = 0, s = i.targets.length; n < s; n++)
      t += ":" + va(i.targets[n]);
  return t;
}
function va(i) {
  let t = "";
  const e = Object.keys(i).sort();
  for (let n = 0, s = e.length; n < s; n++)
    t += e[n] + ":" + i[e[n]] + ";";
  return t;
}
function pl(i) {
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
function ky(i) {
  return i.search(/\.jpe?g($|\?)/i) > 0 || i.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : i.search(/\.webp($|\?)/i) > 0 || i.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const zy = new Ft();
class Hy {
  constructor(t = {}, e = {}) {
    this.json = t, this.extensions = {}, this.plugins = {}, this.options = e, this.cache = new cy(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, s = -1, r = !1, o = -1;
    if (typeof navigator < "u") {
      const a = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(a) === !0;
      const l = a.match(/Version\/(\d+)/);
      s = n && l ? parseInt(l[1], 10) : -1, r = a.indexOf("Firefox") > -1, o = r ? a.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && s < 17 || r && o < 98 ? this.textureLoader = new Md(this.options.manager) : this.textureLoader = new Dx(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new yd(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
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
      return gi(r, a, s), On(a, s), Promise.all(n._invokeAll(function(l) {
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
      return Promise.resolve(this.extensions[Gt.KHR_BINARY_GLTF].body);
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
      const o = ga[s.type], a = is[s.componentType], l = s.normalized === !0, c = new a(s.count * o);
      return Promise.resolve(new Ue(c, o, l));
    }
    const r = [];
    return s.bufferView !== void 0 ? r.push(this.getDependency("bufferView", s.bufferView)) : r.push(null), s.sparse !== void 0 && (r.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(r).then(function(o) {
      const a = o[0], l = ga[s.type], c = is[s.componentType], h = c.BYTES_PER_ELEMENT, u = h * l, d = s.byteOffset || 0, f = s.bufferView !== void 0 ? n.bufferViews[s.bufferView].byteStride : void 0, g = s.normalized === !0;
      let v, p;
      if (f && f !== u) {
        const m = Math.floor(d / f), y = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + m + ":" + s.count;
        let _ = e.cache.get(y);
        _ || (v = new c(a, m * f, s.count * f / h), _ = new id(v, f / h), e.cache.add(y, _)), p = new Qs(_, l, d % f / h, g);
      } else
        a === null ? v = new c(s.count * l) : v = new c(a, d, s.count * l), p = new Ue(v, l, g);
      if (s.sparse !== void 0) {
        const m = ga.SCALAR, y = is[s.sparse.indices.componentType], _ = s.sparse.indices.byteOffset || 0, M = s.sparse.values.byteOffset || 0, R = new y(o[1], _, s.sparse.count * m), T = new c(o[2], M, s.sparse.count * l);
        a !== null && (p = new Ue(p.array.slice(), p.itemSize, p.normalized)), p.normalized = !1;
        for (let w = 0, C = R.length; w < C; w++) {
          const B = R[w];
          if (p.setX(B, T[w * l]), l >= 2 && p.setY(B, T[w * l + 1]), l >= 3 && p.setZ(B, T[w * l + 2]), l >= 4 && p.setW(B, T[w * l + 3]), l >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
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
      const d = (r.samplers || {})[o.sampler] || {};
      return h.magFilter = Kh[d.magFilter] || tn, h.minFilter = Kh[d.minFilter] || Bn, h.wrapS = Zh[d.wrapS] || ri, h.wrapT = Zh[d.wrapT] || ri, s.associations.set(h, { textures: t }), h;
    }).catch(function() {
      return null;
    });
    return this.textureCache[l] = c, c;
  }
  loadImageSource(t, e) {
    const n = this, s = this.json, r = this.options;
    if (this.sourceCache[t] !== void 0)
      return this.sourceCache[t].then((u) => u.clone());
    const o = s.images[t], a = self.URL || self.webkitURL;
    let l = o.uri || "", c = !1;
    if (o.bufferView !== void 0)
      l = n.getDependency("bufferView", o.bufferView).then(function(u) {
        c = !0;
        const d = new Blob([u], { type: o.mimeType });
        return l = a.createObjectURL(d), l;
      });
    else if (o.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + t + " is missing URI and bufferView");
    const h = Promise.resolve(l).then(function(u) {
      return new Promise(function(d, f) {
        let g = d;
        e.isImageBitmapLoader === !0 && (g = function(v) {
          const p = new Ce(v);
          p.needsUpdate = !0, d(p);
        }), e.load($s.resolveURL(u, r.path), g, void 0, f);
      });
    }).then(function(u) {
      return c === !0 && a.revokeObjectURL(l), On(u, o), u.userData.mimeType = o.mimeType || ky(o.uri), u;
    }).catch(function(u) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", l), u;
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
      if (n.texCoord !== void 0 && n.texCoord > 0 && (o = o.clone(), o.channel = n.texCoord), r.extensions[Gt.KHR_TEXTURE_TRANSFORM]) {
        const a = n.extensions !== void 0 ? n.extensions[Gt.KHR_TEXTURE_TRANSFORM] : void 0;
        if (a) {
          const l = r.associations.get(o);
          o = r.extensions[Gt.KHR_TEXTURE_TRANSFORM].extendTexture(o, a), r.associations.set(o, l);
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
      l || (l = new ld(), vn.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, l.sizeAttenuation = !1, this.cache.add(a, l)), n = l;
    } else if (t.isLine) {
      const a = "LineBasicMaterial:" + n.uuid;
      let l = this.cache.get(a);
      l || (l = new Eo(), vn.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, this.cache.add(a, l)), n = l;
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
    if (l[Gt.KHR_MATERIALS_UNLIT]) {
      const u = s[Gt.KHR_MATERIALS_UNLIT];
      o = u.getMaterialType(), c.push(u.extendParams(a, r, e));
    } else {
      const u = r.pbrMetallicRoughness || {};
      if (a.color = new Tt(1, 1, 1), a.opacity = 1, Array.isArray(u.baseColorFactor)) {
        const d = u.baseColorFactor;
        a.color.setRGB(d[0], d[1], d[2], Oe), a.opacity = d[3];
      }
      u.baseColorTexture !== void 0 && c.push(e.assignTexture(a, "map", u.baseColorTexture, ke)), a.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, a.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (c.push(e.assignTexture(a, "metalnessMap", u.metallicRoughnessTexture)), c.push(e.assignTexture(a, "roughnessMap", u.metallicRoughnessTexture))), o = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(t);
      }), c.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(t, a);
      })));
    }
    r.doubleSided === !0 && (a.side = on);
    const h = r.alphaMode || _a.OPAQUE;
    if (h === _a.BLEND ? (a.transparent = !0, a.depthWrite = !1) : (a.transparent = !1, h === _a.MASK && (a.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && o !== en && (c.push(e.assignTexture(a, "normalMap", r.normalTexture)), a.normalScale = new nt(1, 1), r.normalTexture.scale !== void 0)) {
      const u = r.normalTexture.scale;
      a.normalScale.set(u, u);
    }
    if (r.occlusionTexture !== void 0 && o !== en && (c.push(e.assignTexture(a, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (a.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && o !== en) {
      const u = r.emissiveFactor;
      a.emissive = new Tt().setRGB(u[0], u[1], u[2], Oe);
    }
    return r.emissiveTexture !== void 0 && o !== en && c.push(e.assignTexture(a, "emissiveMap", r.emissiveTexture, ke)), Promise.all(c).then(function() {
      const u = new o(a);
      return r.name && (u.name = r.name), On(u, r), e.associations.set(u, { materials: t }), r.extensions && gi(s, u, r), u;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(t) {
    const e = ue.sanitizeNodeName(t || "");
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
      return n[Gt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a, e).then(function(l) {
        return Jh(l, a, e);
      });
    }
    const o = [];
    for (let a = 0, l = t.length; a < l; a++) {
      const c = t[a], h = By(c), u = s[h];
      if (u)
        o.push(u.promise);
      else {
        let d;
        c.extensions && c.extensions[Gt.KHR_DRACO_MESH_COMPRESSION] ? d = r(c) : d = Jh(new Ie(), c, e), s[h] = { primitive: c, promise: d }, o.push(d);
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
      const h = o[l].material === void 0 ? Uy(this.cache) : this.getDependency("material", o[l].material);
      a.push(h);
    }
    return a.push(e.loadGeometries(o)), Promise.all(a).then(function(l) {
      const c = l.slice(0, l.length - 1), h = l[l.length - 1], u = [];
      for (let f = 0, g = h.length; f < g; f++) {
        const v = h[f], p = o[f];
        let m;
        const y = c[f];
        if (p.mode === rn.TRIANGLES || p.mode === rn.TRIANGLE_STRIP || p.mode === rn.TRIANGLE_FAN || p.mode === void 0)
          m = r.isSkinnedMesh === !0 ? new Iv(v, y) : new ge(v, y), m.isSkinnedMesh === !0 && m.normalizeSkinWeights(), p.mode === rn.TRIANGLE_STRIP ? m.geometry = Yh(m.geometry, Fu) : p.mode === rn.TRIANGLE_FAN && (m.geometry = Yh(m.geometry, rl));
        else if (p.mode === rn.LINES)
          m = new zl(v, y);
        else if (p.mode === rn.LINE_STRIP)
          m = new kl(v, y);
        else if (p.mode === rn.LINE_LOOP)
          m = new Ov(v, y);
        else if (p.mode === rn.POINTS)
          m = new Fv(v, y);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
        Object.keys(m.geometry.morphAttributes).length > 0 && Fy(m, r), m.name = e.createUniqueName(r.name || "mesh_" + t), On(m, r), p.extensions && gi(s, m, p), e.assignFinalMaterial(m), u.push(m);
      }
      for (let f = 0, g = u.length; f < g; f++)
        e.associations.set(u[f], {
          meshes: t,
          primitives: f
        });
      if (u.length === 1)
        return r.extensions && gi(s, u[0], r), u[0];
      const d = new J();
      r.extensions && gi(s, d, r), e.associations.set(d, { meshes: t });
      for (let f = 0, g = u.length; f < g; f++)
        d.add(u[f]);
      return d;
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
    return n.type === "perspective" ? e = new ze(es.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : n.type === "orthographic" && (e = new Ol(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), n.name && (e.name = this.createUniqueName(n.name)), On(e, n), Promise.resolve(e);
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
        const u = o[c];
        if (u) {
          a.push(u);
          const d = new Ft();
          r !== null && d.fromArray(r.array, c * 16), l.push(d);
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
    for (let u = 0, d = s.channels.length; u < d; u++) {
      const f = s.channels[u], g = s.samplers[f.sampler], v = f.target, p = v.node, m = s.parameters !== void 0 ? s.parameters[g.input] : g.input, y = s.parameters !== void 0 ? s.parameters[g.output] : g.output;
      v.node !== void 0 && (o.push(this.getDependency("node", p)), a.push(this.getDependency("accessor", m)), l.push(this.getDependency("accessor", y)), c.push(g), h.push(v));
    }
    return Promise.all([
      Promise.all(o),
      Promise.all(a),
      Promise.all(l),
      Promise.all(c),
      Promise.all(h)
    ]).then(function(u) {
      const d = u[0], f = u[1], g = u[2], v = u[3], p = u[4], m = [];
      for (let y = 0, _ = d.length; y < _; y++) {
        const M = d[y], R = f[y], T = g[y], w = v[y], C = p[y];
        if (M === void 0) continue;
        M.updateMatrix && M.updateMatrix();
        const B = n._createAnimationTracks(M, R, T, w, C);
        if (B)
          for (let x = 0; x < B.length; x++)
            m.push(B[x]);
      }
      return new Mx(r, void 0, m);
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
      const h = c[0], u = c[1], d = c[2];
      d !== null && h.traverse(function(f) {
        f.isSkinnedMesh && f.bind(d, zy);
      });
      for (let f = 0, g = u.length; f < g; f++)
        h.add(u[f]);
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
      if (r.isBone === !0 ? h = new od() : c.length > 1 ? h = new J() : c.length === 1 ? h = c[0] : h = new ye(), h !== c[0])
        for (let u = 0, d = c.length; u < d; u++)
          h.add(c[u]);
      if (r.name && (h.userData.name = r.name, h.name = o), On(h, r), r.extensions && gi(n, h, r), r.matrix !== void 0) {
        const u = new Ft();
        u.fromArray(r.matrix), h.applyMatrix4(u);
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
    const e = this.extensions, n = this.json.scenes[t], s = this, r = new J();
    n.name && (r.name = s.createUniqueName(n.name)), On(r, n), n.extensions && gi(e, r, n);
    const o = n.nodes || [], a = [];
    for (let l = 0, c = o.length; l < c; l++)
      a.push(s.getDependency("node", o[l]));
    return Promise.all(a).then(function(l) {
      for (let h = 0, u = l.length; h < u; h++)
        r.add(l[h]);
      const c = (h) => {
        const u = /* @__PURE__ */ new Map();
        for (const [d, f] of s.associations)
          (d instanceof vn || d instanceof Ce) && u.set(d, f);
        return h.traverse((d) => {
          const f = s.associations.get(d);
          f != null && u.set(d, f);
        }), u;
      };
      return s.associations = c(r), r;
    });
  }
  _createAnimationTracks(t, e, n, s, r) {
    const o = [], a = t.name ? t.name : t.uuid, l = [];
    Zn[r.path] === Zn.weights ? t.traverse(function(d) {
      d.morphTargetInfluences && l.push(d.name ? d.name : d.uuid);
    }) : l.push(a);
    let c;
    switch (Zn[r.path]) {
      case Zn.weights:
        c = fs;
        break;
      case Zn.rotation:
        c = ps;
        break;
      case Zn.position:
      case Zn.scale:
        c = ms;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            c = fs;
            break;
          case 2:
          case 3:
          default:
            c = ms;
            break;
        }
        break;
    }
    const h = s.interpolation !== void 0 ? Ny[s.interpolation] : Zs, u = this._getArrayFromAccessor(n);
    for (let d = 0, f = l.length; d < f; d++) {
      const g = new c(
        l[d] + "." + Zn[r.path],
        e.array,
        u,
        h
      );
      s.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(g), o.push(g);
    }
    return o;
  }
  _getArrayFromAccessor(t) {
    let e = t.array;
    if (t.normalized) {
      const n = pl(e.constructor), s = new Float32Array(e.length);
      for (let r = 0, o = e.length; r < o; r++)
        s[r] = e[r] * n;
      e = s;
    }
    return e;
  }
  _createCubicSplineTrackInterpolant(t) {
    t.createInterpolant = function(n) {
      const s = this instanceof ps ? Dy : Td;
      return new s(this.times, this.values, this.getValueSize() / 3, n);
    }, t.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function Gy(i, t, e) {
  const n = t.attributes, s = new Ye();
  if (n.POSITION !== void 0) {
    const a = e.json.accessors[n.POSITION], l = a.min, c = a.max;
    if (l !== void 0 && c !== void 0) {
      if (s.set(
        new P(l[0], l[1], l[2]),
        new P(c[0], c[1], c[2])
      ), a.normalized) {
        const h = pl(is[a.componentType]);
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
      const u = r[c];
      if (u.POSITION !== void 0) {
        const d = e.json.accessors[u.POSITION], f = d.min, g = d.max;
        if (f !== void 0 && g !== void 0) {
          if (l.setX(Math.max(Math.abs(f[0]), Math.abs(g[0]))), l.setY(Math.max(Math.abs(f[1]), Math.abs(g[1]))), l.setZ(Math.max(Math.abs(f[2]), Math.abs(g[2]))), d.normalized) {
            const v = pl(is[d.componentType]);
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
    const a = fl[o] || o.toLowerCase();
    a in i.attributes || s.push(r(n[o], a));
  }
  if (t.indices !== void 0 && !i.index) {
    const o = e.getDependency("accessor", t.indices).then(function(a) {
      i.setIndex(a);
    });
    s.push(o);
  }
  return te.workingColorSpace !== Oe && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${te.workingColorSpace}" not supported.`), On(i, t), Gy(i, t, e), Promise.all(s).then(function() {
    return t.targets !== void 0 ? Oy(i, t.targets, e) : i;
  });
}
const Wt = 10251071, Xi = 7306636, Rt = 12106948, ce = 15921906, ie = 2830134, ji = 8962256;
function L(i, t = {}) {
  return new zn({
    color: i,
    roughness: 0.8,
    metalness: 0.05,
    ...t
  });
}
function D(i, t, e, n, s = 0, r = 0, o = 0) {
  const a = new ge(new Vn(i, t, e), n);
  return a.position.set(s, r, o), a.castShadow = !0, a.receiveShadow = !0, a;
}
function wt(i, t, e, n, s = 0, r = 0, o = 0, a = 16) {
  const l = new ge(new Wl(i, t, e, a), n);
  return l.position.set(s, r, o), l.castShadow = !0, l.receiveShadow = !0, l;
}
function K(i, t) {
  return i.material.color.copy(t), i;
}
const ml = {
  sofa: (i) => {
    const t = new J(), e = L(Xi);
    return t.add(K(D(1.9, 0.4, 0.85, e, 0, 0.2, 0), i)), t.add(K(D(1.9, 0.5, 0.2, e, 0, 0.55, -0.32), i)), t.add(K(D(0.2, 0.45, 0.85, e, -0.85, 0.5, 0), i)), t.add(K(D(0.2, 0.45, 0.85, e, 0.85, 0.5, 0), i)), t;
  },
  bed: (i) => {
    const t = new J();
    return t.add(D(1.6, 0.3, 2, L(Wt), 0, 0.15, 0)), t.add(K(D(1.55, 0.18, 1.95, L(ce), 0, 0.39, 0), i)), t.add(D(1.6, 0.6, 0.1, L(Wt), 0, 0.5, -0.95)), t.add(D(0.5, 0.12, 0.35, L(ce), -0.45, 0.5, -0.7)), t.add(D(0.5, 0.12, 0.35, L(ce), 0.45, 0.5, -0.7)), t;
  },
  table: (i) => {
    const t = new J(), e = L(Wt);
    t.add(K(D(1.4, 0.06, 0.8, e, 0, 0.74, 0), i));
    const n = 0.62, s = 0.32;
    for (const [r, o] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.07, 0.74, 0.07, e, r * n, 0.37, o * s));
    return t;
  },
  chair: (i) => {
    const t = new J(), e = L(Wt);
    t.add(K(D(0.45, 0.05, 0.45, e, 0, 0.45, 0), i)), t.add(K(D(0.45, 0.45, 0.05, e, 0, 0.68, -0.2), i));
    const n = 0.18, s = 0.18;
    for (const [r, o] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.05, 0.45, 0.05, e, r * n, 0.22, o * s));
    return t;
  },
  wardrobe: (i) => {
    const t = new J();
    return t.add(K(D(1.2, 2, 0.6, L(Wt), 0, 1, 0), i)), t.add(D(0.04, 1.8, 0.02, L(Rt), -0.02, 1, 0.31)), t.add(wt(0.02, 0.02, 0.15, L(Rt), -0.2, 1, 0.32)), t.add(wt(0.02, 0.02, 0.15, L(Rt), 0.16, 1, 0.32)), t;
  },
  kitchen_counter: (i) => {
    const t = new J();
    return t.add(K(D(2, 0.85, 0.6, L(ce), 0, 0.425, 0), i)), t.add(D(2.05, 0.05, 0.65, L(ie), 0, 0.875, 0)), t;
  },
  tv: (i) => {
    const t = new J();
    return t.add(K(D(1.3, 0.78, 0.06, L(ie), 0, 0, 0.03), i)), t.add(D(1.18, 0.66, 0.02, L(657930, { emissive: 1119255 }), 0, 0, 0.07)), t;
  },
  fridge: (i) => {
    const t = new J();
    return t.add(K(D(0.7, 1.8, 0.7, L(Rt), 0, 0.9, 0), i)), t.add(D(0.04, 0.1, 0.02, L(ie), 0.3, 1.3, 0.36)), t.add(D(0.04, 0.1, 0.02, L(ie), 0.3, 0.6, 0.36)), t;
  },
  sink: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.8, 0.5, L(ce), 0, 0.4, 0), i)), t.add(D(0.5, 0.08, 0.4, L(Rt), 0, 0.82, 0)), t.add(wt(0.02, 0.02, 0.25, L(Rt), 0, 0.95, -0.12)), t;
  },
  toilet: (i) => {
    const t = new J();
    return t.add(K(wt(0.22, 0.25, 0.4, L(ce), 0, 0.2, 0.05), i)), t.add(D(0.35, 0.5, 0.18, L(ce), 0, 0.45, -0.18)), t.add(wt(0.24, 0.24, 0.05, L(ce), 0, 0.42, 0.05)), t;
  },
  door: (i) => {
    const t = new J(), e = L(ce);
    t.add(D(0.06, 2.06, 0.16, e, -0.46, 1.03, 0)), t.add(D(0.06, 2.06, 0.16, e, 0.46, 1.03, 0)), t.add(D(0.98, 0.06, 0.16, e, 0, 2.06, 0));
    const n = K(D(0.84, 2, 0.06, L(Wt), 0, 1, 0), i);
    return t.add(n), t.add(wt(0.03, 0.03, 0.12, L(12096302), 0.33, 1, 0.06)), t;
  },
  window_frame: (i) => {
    const t = new J(), e = L(5595242), n = 1.2, s = 1.2, r = 1.45, o = 0.07, a = 0.1;
    return t.add(K(D(n, o, a, e, 0, r + s / 2, 0), i)), t.add(K(D(n, o, a, e, 0, r - s / 2, 0), i)), t.add(D(o, s, a, e, -n / 2 + o / 2, r, 0)), t.add(D(o, s, a, e, n / 2 - o / 2, r, 0)), t.add(D(0.05, s, a * 0.6, e, 0, r, 0)), t.add(D(n, 0.05, a * 0.6, e, 0, r, 0)), t.add(D(n - o, s - o, 0.02, L(10274778, { transparent: !0, opacity: 0.5, metalness: 0.2 }), 0, r, 0)), t;
  },
  ceiling_light: (i) => {
    const t = new J(), e = wt(0.18, 0.22, 0.12, L(ce, { emissive: 0 }), 0, 0, 0);
    return e.name = "emissive", t.add(K(e, i)), t.add(wt(0.01, 0.01, 0.25, L(Rt), 0, 0.18, 0)), t;
  },
  ac_unit: (i) => {
    const t = new J();
    return t.add(K(D(0.9, 0.28, 0.18, L(ce), 0, 0, 0), i)), t.add(D(0.8, 0.04, 0.02, L(ie), 0, -0.1, 0.09)), t;
  },
  intercom: (i) => {
    const t = new J();
    t.add(K(D(0.16, 0.26, 0.04, L(ie), 0, 0, 0), i));
    const e = D(0.12, 0.14, 0.01, L(1053720, { emissive: 666170 }), 0, 0.03, 0.025);
    return e.name = "emissive", t.add(e), t;
  },
  armchair: (i) => {
    const t = new J(), e = L(Xi);
    return t.add(K(D(0.85, 0.4, 0.85, e, 0, 0.2, 0), i)), t.add(K(D(0.85, 0.5, 0.18, e, 0, 0.55, -0.33), i)), t.add(K(D(0.16, 0.45, 0.85, e, -0.42, 0.5, 0), i)), t.add(K(D(0.16, 0.45, 0.85, e, 0.42, 0.5, 0), i)), t;
  },
  coffee_table: (i) => {
    const t = new J();
    t.add(K(D(1, 0.05, 0.55, L(Wt), 0, 0.4, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.06, 0.4, 0.06, L(Wt), e * 0.42, 0.2, n * 0.22));
    return t;
  },
  dining_table: (i) => {
    const t = new J();
    t.add(K(D(1.8, 0.06, 0.95, L(Wt), 0, 0.75, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.08, 0.75, 0.08, L(Wt), e * 0.8, 0.37, n * 0.4));
    return t;
  },
  bookshelf: (i) => {
    const t = new J();
    t.add(K(D(1, 1.8, 0.32, L(Wt), 0, 0.9, 0), i));
    for (let e = 1; e <= 4; e++) t.add(D(0.94, 0.03, 0.3, L(ie), 0, e * 0.36, 0));
    return t;
  },
  desk: (i) => {
    const t = new J();
    return t.add(K(D(1.3, 0.05, 0.65, L(Wt), 0, 0.74, 0), i)), t.add(D(0.5, 0.7, 0.6, L(ie), 0.35, 0.37, 0)), t.add(D(0.05, 0.74, 0.6, L(Wt), -0.6, 0.37, 0)), t;
  },
  office_chair: (i) => {
    const t = new J();
    return t.add(K(D(0.5, 0.06, 0.5, L(ie), 0, 0.5, 0), i)), t.add(K(D(0.5, 0.5, 0.06, L(ie), 0, 0.78, -0.22), i)), t.add(wt(0.04, 0.04, 0.45, L(Rt), 0, 0.25, 0)), t.add(wt(0.26, 0.26, 0.04, L(Rt), 0, 0.04, 0)), t;
  },
  nightstand: (i) => {
    const t = new J();
    return t.add(K(D(0.45, 0.5, 0.4, L(Wt), 0, 0.25, 0), i)), t.add(D(0.4, 0.02, 0.02, L(Rt), 0, 0.32, 0.21)), t;
  },
  dresser: (i) => {
    const t = new J();
    t.add(K(D(1.1, 0.85, 0.5, L(Wt), 0, 0.42, 0), i));
    for (let e = 0; e < 3; e++) t.add(D(0.9, 0.02, 0.02, L(Rt), 0, 0.2 + e * 0.25, 0.26));
    return t;
  },
  stove: (i) => {
    const t = new J();
    t.add(K(D(0.6, 0.85, 0.6, L(Rt), 0, 0.42, 0), i)), t.add(D(0.55, 0.02, 0.55, L(ie), 0, 0.86, 0));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(wt(0.08, 0.08, 0.01, L(2236962), e * 0.13, 0.875, n * 0.13));
    return t;
  },
  microwave: (i) => {
    const t = new J();
    return t.add(K(D(0.5, 0.3, 0.35, L(ie), 0, 0.15, 0), i)), t.add(D(0.32, 0.22, 0.01, L(1053720, { emissive: 662050 }), -0.05, 0.15, 0.18)), t;
  },
  dishwasher: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.85, 0.6, L(Rt), 0, 0.42, 0), i)), t.add(D(0.5, 0.02, 0.02, L(ie), 0, 0.75, 0.31)), t;
  },
  washing_machine: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.85, 0.6, L(ce), 0, 0.42, 0), i)), t.add(wt(0.2, 0.2, 0.04, L(ie), 0, 0.45, 0.31).rotateX(Math.PI / 2)), t;
  },
  bathtub: (i) => {
    const t = new J();
    return t.add(K(D(1.6, 0.55, 0.75, L(ce), 0, 0.275, 0), i)), t.add(D(1.45, 0.2, 0.6, L(14675698), 0, 0.4, 0)), t;
  },
  shower: (i) => {
    const t = new J();
    return t.add(K(D(0.9, 0.04, 0.9, L(ce), 0, 0.02, 0), i)), t.add(D(0.04, 2, 0.9, L(ji, { transparent: !0, opacity: 0.25 }), -0.43, 1, 0)), t.add(D(0.9, 2, 0.04, L(ji, { transparent: !0, opacity: 0.25 }), 0, 1, -0.43)), t.add(wt(0.06, 0.06, 0.04, L(Rt), 0.3, 1.9, 0.3)), t;
  },
  mirror: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.9, 0.04, L(Rt), 0, 0, 0), i)), t.add(D(0.5, 0.8, 0.01, L(11195616, { metalness: 0.9, roughness: 0.1 }), 0, 0, 0.03)), t;
  },
  plant: (i) => {
    const t = new J();
    return t.add(wt(0.16, 0.2, 0.3, L(9067056), 0, 0.15, 0)), t.add(K(new ge(new Xl(0.32, 0), L(4160831)), i).translateY(0.6)), t;
  },
  rug: (i) => {
    const t = new J();
    return t.add(K(D(2, 0.02, 1.4, L(8930372), 0, 0.012, 0), i)), t;
  },
  stairs: (i) => {
    const t = new J(), e = 8;
    for (let n = 0; n < e; n++)
      t.add(K(D(1, 0.18, 0.3, L(Wt), 0, 0.09 + n * 0.18, -n * 0.3), i));
    return t;
  },
  curtain: (i) => {
    const t = new J();
    return t.add(K(D(1.4, 1.8, 0.05, L(Xi), 0, 1.4, 0), i)), t;
  },
  painting: (i) => {
    const t = new J();
    return t.add(K(D(0.7, 0.5, 0.04, L(Wt), 0, 0, 0), i)), t.add(D(0.6, 0.4, 0.01, L(6719658), 0, 0, 0.03)), t;
  },
  speaker: (i) => {
    const t = new J();
    return t.add(K(D(0.25, 0.4, 0.25, L(ie), 0, 0.2, 0), i)), t.add(wt(0.08, 0.08, 0.01, L(1118481), 0, 0.26, 0.13).rotateX(Math.PI / 2)), t;
  },
  security_camera: (i) => {
    const t = new J();
    t.add(K(wt(0.06, 0.06, 0.18, L(ce), 0, 0, 0), i));
    const e = wt(0.04, 0.04, 0.04, L(1053720, { emissive: 3145728 }), 0, 0, 0.1);
    return e.name = "emissive", e.rotateX(Math.PI / 2), t.add(e), t;
  },
  radiator: (i) => {
    const t = new J();
    for (let e = 0; e < 8; e++) t.add(K(D(0.06, 0.6, 0.1, L(ce), -0.35 + e * 0.1, 0.4, 0), i));
    return t;
  },
  // ---- Lighting (освещение) — each has an 'emissive' mesh + reads as a lamp ----
  floor_lamp: (i) => {
    const t = new J();
    t.add(wt(0.18, 0.22, 0.03, L(Rt), 0, 0.015, 0)), t.add(wt(0.02, 0.02, 1.5, L(Rt), 0, 0.75, 0));
    const e = wt(0.18, 0.25, 0.28, L(16774358, { emissive: 0 }), 0, 1.55, 0);
    return e.name = "emissive", t.add(K(e, i)), t;
  },
  table_lamp: (i) => {
    const t = new J();
    t.add(wt(0.1, 0.12, 0.03, L(Rt), 0, 0.015, 0)), t.add(wt(0.015, 0.015, 0.3, L(Rt), 0, 0.18, 0));
    const e = wt(0.12, 0.16, 0.18, L(16774358, { emissive: 0 }), 0, 0.42, 0);
    return e.name = "emissive", t.add(K(e, i)), t;
  },
  wall_light: (i) => {
    const t = new J();
    t.add(D(0.12, 0.2, 0.08, L(Rt), 0, 0, 0));
    const e = D(0.1, 0.16, 0.04, L(16774358, { emissive: 0 }), 0, 0, 0.06);
    return e.name = "emissive", t.add(K(e, i)), t;
  },
  chandelier: (i) => {
    const t = new J();
    t.add(wt(0.01, 0.01, 0.3, L(Rt), 0, 0.15, 0)), t.add(wt(0.25, 0.3, 0.04, L(Rt), 0, 0, 0));
    for (let e = 0; e < 6; e++) {
      const n = e / 6 * Math.PI * 2, s = new ge(
        new ir(0.06, 10, 10),
        L(16774358, { emissive: 0 })
      );
      s.name = "emissive", s.position.set(Math.cos(n) * 0.28, -0.05, Math.sin(n) * 0.28), t.add(K(s, i));
    }
    return t;
  },
  spotlight: (i) => {
    const t = new J();
    t.add(wt(0.05, 0.07, 0.06, L(Rt), 0, 0, 0));
    const e = wt(0.05, 0.05, 0.01, L(16774358, { emissive: 0 }), 0, -0.03, 0);
    return e.name = "emissive", t.add(K(e, i)), t;
  },
  pendant_light: (i) => {
    const t = new J();
    t.add(wt(8e-3, 8e-3, 0.4, L(ie), 0, 0.2, 0));
    const e = wt(0.16, 0.05, 0.2, L(16774358, { emissive: 0 }), 0, -0.1, 0);
    return e.name = "emissive", t.add(K(e, i)), t;
  },
  led_strip: (i) => {
    const t = new J(), e = D(1.5, 0.03, 0.04, L(16777215, { emissive: 0 }), 0, 0, 0);
    return e.name = "emissive", t.add(K(e, i)), t;
  },
  double_door: (i) => {
    const t = new J();
    return t.add(K(D(0.7, 2, 0.05, L(Wt), -0.36, 1, 0), i)), t.add(K(D(0.7, 2, 0.05, L(Wt), 0.36, 1, 0), i)), t.add(wt(0.025, 0.025, 0.1, L(Rt), -0.05, 1, 0.05)), t.add(wt(0.025, 0.025, 0.1, L(Rt), 0.05, 1, 0.05)), t;
  },
  sliding_door: (i) => {
    const t = new J();
    return t.add(D(1.6, 0.06, 0.08, L(Rt), 0, 2.05, 0)), t.add(K(D(0.78, 1.95, 0.04, L(ji, { transparent: !0, opacity: 0.4 }), -0.4, 1, 0), i)), t.add(K(D(0.78, 1.95, 0.04, L(ji, { transparent: !0, opacity: 0.4 }), 0.4, 1, 0.05), i)), t;
  },
  wall_panel: (i) => {
    const t = new J();
    return t.add(K(D(1.5, 2.6, 0.12, L(15132390), 0, 1.3, 0), i)), t;
  },
  arch: (i) => {
    const t = new J();
    return t.add(K(D(0.15, 2, 0.25, L(15132390), -0.6, 1, 0), i)), t.add(K(D(0.15, 2, 0.25, L(15132390), 0.6, 1, 0), i)), t.add(K(D(1.35, 0.25, 0.25, L(15132390), 0, 2.1, 0), i)), t;
  },
  bar_stool: (i) => {
    const t = new J();
    return t.add(K(wt(0.18, 0.18, 0.05, L(Wt), 0, 0.66, 0), i)), t.add(wt(0.03, 0.03, 0.66, L(Rt), 0, 0.33, 0)), t.add(wt(0.2, 0.2, 0.02, L(Rt), 0, 0.02, 0)), t;
  },
  tv_stand: (i) => {
    const t = new J();
    return t.add(K(D(1.4, 0.4, 0.4, L(ie), 0, 0.2, 0), i)), t.add(D(0.6, 0.02, 0.36, L(Rt), -0.35, 0.41, 0)), t;
  },
  kitchen_island: (i) => {
    const t = new J();
    return t.add(K(D(1.6, 0.9, 0.9, L(ce), 0, 0.45, 0), i)), t.add(D(1.7, 0.05, 1, L(ie), 0, 0.92, 0)), t;
  },
  sideboard: (i) => {
    const t = new J();
    t.add(K(D(1.6, 0.8, 0.45, L(Wt), 0, 0.4, 0), i));
    for (let e = -1; e <= 1; e++) t.add(D(0.02, 0.1, 0.02, L(Rt), e * 0.5, 0.5, 0.23));
    return t;
  },
  bunk_bed: (i) => {
    const t = new J();
    for (const e of [0.4, 1.4])
      t.add(D(1, 0.12, 2, L(Wt), 0, e, 0)), t.add(K(D(0.95, 0.12, 1.95, L(ce), 0, e + 0.12, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.08, 1.9, 0.08, L(Wt), e * 0.46, 0.95, n * 0.96));
    return t;
  },
  bar_counter: (i) => {
    const t = new J();
    return t.add(K(D(2, 1.05, 0.55, L(Wt), 0, 0.525, 0), i)), t.add(D(2.1, 0.05, 0.65, L(ie), 0, 1.07, 0)), t;
  },
  piano: (i) => {
    const t = new J();
    return t.add(K(D(1.5, 0.9, 0.6, L(1447964), 0, 0.45, 0), i)), t.add(D(1.4, 0.06, 0.25, L(ce), 0, 0.78, 0.18)), t;
  },
  range_hood: (i) => {
    const t = new J();
    return t.add(K(D(0.9, 0.25, 0.5, L(Rt), 0, 0, 0), i)), t.add(D(0.3, 0.4, 0.3, L(Rt), 0, 0.3, 0)), t;
  },
  wall_clock: (i) => {
    const t = new J(), e = wt(0.18, 0.18, 0.04, L(ce), 0, 0, 0, 24);
    return e.rotateX(Math.PI / 2), t.add(K(e, i)), t;
  },
  patio_door: (i) => {
    const t = new J(), e = L(5595242), n = 2.6, s = 2.2, r = 0.08, o = 0.1;
    return t.add(K(D(n, r, o, e, 0, s - r / 2, 0), i)), t.add(D(n, r, o, e, 0, r / 2, 0)), t.add(D(r, s, o, e, -n / 2 + r / 2, s / 2, 0)), t.add(D(r, s, o, e, n / 2 - r / 2, s / 2, 0)), t.add(D(0.06, s, o * 0.6, e, -n / 6, s / 2, 0)), t.add(D(0.06, s, o * 0.6, e, n / 6, s / 2, 0)), t.add(D(n - r, s - r, 0.02, L(10274778, { transparent: !0, opacity: 0.42, metalness: 0.2 }), 0, s / 2, 0)), t;
  },
  terrace_window: (i) => {
    const t = new J(), e = L(5595242), n = 2.6, s = 1.5, r = 0.07, o = 0.1;
    return t.add(K(D(n, r, o, e, 0, s / 2, 0), i)), t.add(D(n, r, o, e, 0, -s / 2, 0)), t.add(D(r, s, o, e, -n / 2 + r / 2, 0, 0)), t.add(D(r, s, o, e, n / 2 - r / 2, 0, 0)), t.add(D(0.05, s, o * 0.6, e, -n / 4, 0, 0)), t.add(D(0.05, s, o * 0.6, e, n / 4, 0, 0)), t.add(D(n - r, s - r, 0.02, L(10274778, { transparent: !0, opacity: 0.45 }), 0, 0, 0)), t;
  },
  // ---- Kitchen ----
  oven: (i) => {
    const t = new J();
    t.add(K(D(0.6, 0.9, 0.6, L(Rt, { metalness: 0.6, roughness: 0.4 }), 0, 0.45, 0), i)), t.add(D(0.5, 0.5, 0.02, L(1119255, { metalness: 0.3 }), 0, 0.5, 0.3)), t.add(D(0.5, 0.06, 0.04, L(ie), 0, 0.78, 0.31));
    for (const e of [-0.18, -0.06, 0.06, 0.18]) t.add(wt(0.03, 0.03, 0.04, L(ie), e, 0.86, 0.31, 12));
    return t;
  },
  kettle: (i) => {
    const t = new J();
    return t.add(wt(0.11, 0.11, 0.03, L(ie), 0, 0.015, 0, 18)), t.add(K(wt(0.09, 0.11, 0.2, L(Rt, { metalness: 0.5, roughness: 0.3 }), 0, 0.12, 0, 18), i)), t.add(D(0.04, 0.14, 0.04, L(ie), 0, 0.18, -0.11)), t;
  },
  coffee_machine: (i) => {
    const t = new J();
    return t.add(K(D(0.26, 0.36, 0.3, L(ie), 0, 0.18, 0), i)), t.add(D(0.2, 0.05, 0.06, L(Rt), 0, 0.12, 0.16)), t.add(wt(0.05, 0.05, 0.08, L(7031343), 0, 0.05, 0.13, 12)), t;
  },
  toaster: (i) => {
    const t = new J();
    return t.add(K(D(0.3, 0.18, 0.16, L(Rt, { metalness: 0.6, roughness: 0.3 }), 0, 0.09, 0), i)), t.add(D(0.22, 0.02, 0.02, L(ie), 0, 0.19, 0)), t;
  },
  blender: (i) => {
    const t = new J();
    return t.add(D(0.15, 0.1, 0.15, L(ie), 0, 0.05, 0)), t.add(K(wt(0.07, 0.06, 0.22, L(ji, { transparent: !0, opacity: 0.5 }), 0, 0.21, 0, 14), i)), t;
  },
  trash_can: (i) => {
    const t = new J();
    return t.add(K(wt(0.18, 0.16, 0.5, L(Rt, { metalness: 0.5, roughness: 0.4 }), 0, 0.25, 0, 20), i)), t.add(wt(0.19, 0.19, 0.03, L(Rt, { metalness: 0.5 }), 0, 0.51, 0, 20)), t;
  },
  wine_rack: (i) => {
    const t = new J(), e = L(Wt);
    for (const [n, s] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(K(D(0.05, 0.8, 0.05, e, n * 0.28, 0.4, s * 0.14), i));
    for (const n of [0.15, 0.35, 0.55, 0.75]) t.add(D(0.56, 0.03, 0.28, e, 0, n, 0));
    return t;
  },
  // ---- Living / common ----
  recliner: (i) => {
    const t = new J(), e = L(Xi);
    return t.add(K(D(0.9, 0.4, 0.95, e, 0, 0.25, 0), i)), t.add(K(D(0.9, 0.7, 0.18, e, 0, 0.6, -0.38), i)), t.add(K(D(0.18, 0.35, 0.95, e, -0.45, 0.45, 0), i)), t.add(K(D(0.18, 0.35, 0.95, e, 0.45, 0.45, 0), i)), t.add(D(0.78, 0.16, 0.36, e, 0, 0.22, 0.62)), t;
  },
  ottoman: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.4, 0.6, L(Xi), 0, 0.2, 0), i)), t;
  },
  console_table: (i) => {
    const t = new J(), e = L(Wt);
    t.add(K(D(1.2, 0.05, 0.4, e, 0, 0.8, 0), i));
    for (const n of [-1, 1]) t.add(D(0.06, 0.8, 0.36, e, n * 0.55, 0.4, 0));
    return t.add(D(1.1, 0.04, 0.36, e, 0, 0.4, 0)), t;
  },
  fireplace: (i) => {
    const t = new J(), e = L(9079430, { roughness: 1 });
    return t.add(K(D(1.4, 1.2, 0.4, e, 0, 0.6, 0), i)), t.add(D(0.9, 0.7, 0.26, L(1315860), 0, 0.5, 0.1)), t.add(D(0.74, 0.36, 0.18, L(16742960, { emissive: 16734746 }), 0, 0.4, 0.14)), t.add(D(1.5, 0.1, 0.5, e, 0, 1.22, 0)), t;
  },
  floor_vase: (i) => {
    const t = new J();
    t.add(K(wt(0.1, 0.18, 0.7, L(11887901), 0, 0.35, 0, 20), i)), t.add(wt(0.12, 0.1, 0.08, L(11887901), 0, 0.74, 0, 20));
    for (const e of [-0.05, 0.05, 0]) t.add(D(0.012, 0.5, 0.012, L(3828538), e, 1, 0));
    return t;
  },
  aquarium: (i) => {
    const t = new J();
    return t.add(D(1, 0.5, 0.4, L(Wt), 0, 0.25, 0)), t.add(D(0.95, 0.18, 0.38, L(2781088, { transparent: !0, opacity: 0.55 }), 0, 0.62, 0)), t.add(K(D(0.96, 0.46, 0.39, L(ji, { transparent: !0, opacity: 0.28, metalness: 0.1 }), 0, 0.73, 0), i)), t;
  },
  pool_table: (i) => {
    const t = new J();
    t.add(D(2.1, 0.16, 1.2, L(Wt), 0, 0.68, 0)), t.add(K(D(1.96, 0.06, 1.06, L(2062909), 0, 0.79, 0), i));
    for (const [e, n] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.14, 0.6, 0.14, L(Wt), e * 0.95, 0.3, n * 0.5));
    return t;
  },
  // ---- Bedroom ----
  crib: (i) => {
    const t = new J(), e = L(ce);
    t.add(K(D(0.66, 0.1, 1.16, e, 0, 0.5, 0), i));
    for (const n of [-1, 1]) t.add(D(0.7, 0.5, 0.04, e, 0, 0.65, n * 0.58));
    for (const n of [-1, 1]) t.add(D(0.04, 0.5, 1.2, e, n * 0.33, 0.65, 0));
    return t;
  },
  vanity: (i) => {
    const t = new J(), e = L(ce);
    t.add(K(D(1, 0.05, 0.45, e, 0, 0.78, 0), i));
    for (const n of [-1, 1]) t.add(D(0.36, 0.78, 0.42, e, n * 0.3, 0.39, 0));
    return t.add(D(0.66, 0.66, 0.04, e, 0, 1.2, -0.22)), t.add(D(0.6, 0.6, 0.02, L(13623526, { metalness: 0.4, roughness: 0.1 }), 0, 1.2, -0.2)), t;
  },
  bench: (i) => {
    const t = new J(), e = L(Wt);
    t.add(K(D(1.1, 0.1, 0.4, L(Xi), 0, 0.45, 0), i));
    for (const n of [-1, 1]) t.add(D(0.06, 0.45, 0.36, e, n * 0.5, 0.225, 0));
    return t;
  },
  ceiling_fan: (i) => {
    const t = new J();
    return t.add(wt(0.1, 0.1, 0.1, L(Rt), 0, 0, 0, 16)), t.add(K(D(1.4, 0.02, 0.18, L(Wt), 0, -0.02, 0), i)), t.add(K(D(0.18, 0.02, 1.4, L(Wt), 0, -0.02, 0), i)), t.add(wt(0.04, 0.04, 0.22, L(Rt), 0, 0.14, 0, 10)), t;
  },
  // ---- Bathroom ----
  bidet: (i) => {
    const t = new J();
    return t.add(K(D(0.4, 0.4, 0.55, L(ce), 0, 0.2, 0), i)), t.add(wt(0.16, 0.18, 0.12, L(ce), 0, 0.42, 0.05, 18)), t;
  },
  towel_rack: (i) => {
    const t = new J();
    return t.add(D(0.6, 0.04, 0.05, L(Rt, { metalness: 0.6, roughness: 0.3 }), 0, 0.12, 0.04)), t.add(K(D(0.5, 0.32, 0.02, L(ce), 0, -0.05, 0.06), i)), t;
  },
  bathroom_cabinet: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.7, 0.15, L(ce), 0, 0, 0.075), i)), t.add(D(0.56, 0.66, 0.02, L(13623526, { metalness: 0.4, roughness: 0.1 }), 0, 0, 0.16)), t;
  },
  dryer: (i) => {
    const t = new J();
    return t.add(K(D(0.6, 0.85, 0.6, L(ce), 0, 0.425, 0), i)), t.add(wt(0.22, 0.22, 0.04, L(2764598, { metalness: 0.3 }), 0, 0.5, 0.3, 24)), t.add(D(0.5, 0.08, 0.04, L(Rt), 0, 0.78, 0.31)), t;
  },
  // ---- Office ----
  filing_cabinet: (i) => {
    const t = new J();
    t.add(K(D(0.45, 1, 0.55, L(Rt, { metalness: 0.4, roughness: 0.5 }), 0, 0.5, 0), i));
    for (const e of [0.25, 0.5, 0.75]) t.add(D(0.4, 0.02, 0.02, L(ie), 0, e, 0.28));
    return t;
  },
  monitor: (i) => {
    const t = new J();
    return t.add(K(D(0.5, 0.32, 0.03, L(ie), 0, 0.45, 0), i)), t.add(D(0.46, 0.28, 0.01, L(657930, { emissive: 1053466 }), 0, 0.45, 0.02)), t.add(wt(0.03, 0.03, 0.18, L(ie), 0, 0.3, -0.02, 10)), t.add(D(0.2, 0.02, 0.14, L(ie), 0, 0.21, -0.02)), t;
  },
  printer: (i) => {
    const t = new J();
    return t.add(K(D(0.45, 0.3, 0.4, L(ce), 0, 0.15, 0), i)), t.add(D(0.4, 0.02, 0.3, L(ie), 0, 0.31, 0)), t.add(D(0.34, 0.04, 0.08, L(14540270), 0, 0.3, 0.12)), t;
  },
  whiteboard: (i) => {
    const t = new J();
    return t.add(K(D(1.26, 0.86, 0.02, L(Rt), 0, 0, 0), i)), t.add(D(1.2, 0.8, 0.02, L(16185078), 0, 0, 0.02)), t.add(D(0.4, 0.03, 0.06, L(Rt), 0, -0.36, 0.05)), t;
  },
  // ---- Entry / utility / decor ----
  shoe_rack: (i) => {
    const t = new J(), e = L(Wt);
    for (const n of [0.1, 0.3, 0.5]) t.add(K(D(0.8, 0.03, 0.3, e, 0, n, 0), i));
    for (const [n, s] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      t.add(D(0.04, 0.55, 0.04, e, n * 0.38, 0.275, s * 0.13));
    return t;
  },
  coat_rack: (i) => {
    const t = new J(), e = L(Wt);
    t.add(K(wt(0.04, 0.06, 1.7, e, 0, 0.85, 0, 12), i)), t.add(wt(0.25, 0.25, 0.04, e, 0, 0.02, 0, 16));
    for (let n = 0; n < 4; n++) {
      const s = n * Math.PI / 2;
      t.add(D(0.18, 0.03, 0.03, e, Math.cos(s) * 0.09, 1.6, Math.sin(s) * 0.09));
    }
    return t;
  },
  water_heater: (i) => {
    const t = new J();
    return t.add(K(wt(0.25, 0.25, 0.9, L(ce), 0, 0.45, 0, 20), i)), t.add(wt(0.25, 0.25, 0.05, L(Rt), 0, 0.9, 0, 20)), t.add(D(0.1, 0.1, 0.1, L(Rt), 0, 0.2, 0.26)), t;
  },
  books: (i) => {
    const t = new J(), e = [9059131, 3889802, 3902042, 11899183];
    let n = 0.02;
    for (let s = 0; s < 4; s++)
      t.add(D(0.22, 0.04, 0.16, L(e[s % e.length]), 0, n, s % 2 * 0.01)), n += 0.045;
    return K(t.children[0], i), t;
  },
  vase: (i) => {
    const t = new J();
    t.add(K(wt(0.06, 0.1, 0.28, L(14673642, { metalness: 0.1, roughness: 0.3 }), 0, 0.14, 0, 18), i));
    for (const e of [-0.03, 0.03, 0]) t.add(D(0.01, 0.3, 0.01, L(3828538), e, 0.4, 0));
    return t;
  },
  wall_shelf: (i) => {
    const t = new J(), e = L(Wt);
    return t.add(K(D(0.8, 0.04, 0.22, e, 0, 0, 0.11), i)), t.add(D(0.04, 0.2, 0.2, e, -0.36, -0.1, 0.1)), t.add(D(0.04, 0.2, 0.2, e, 0.36, -0.1, 0.1)), t;
  },
  // Generic fallback marker so an unknown model key still renders something.
  marker: (i) => {
    const t = new J();
    return t.add(K(wt(0, 0.12, 0.3, L(16733525), 0, 0.15, 0, 8), i)), t;
  }
}, Vy = Object.keys(ml).filter((i) => i !== "marker"), Wy = [
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
  "wall_shelf"
];
function Qh(i) {
  return Wy.includes(i);
}
const $y = [
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
  "wall_shelf"
];
function Xy(i) {
  return $y.includes(i);
}
const gl = [
  "ceiling_light",
  "floor_lamp",
  "table_lamp",
  "wall_light",
  "chandelier",
  "spotlight",
  "pendant_light",
  "led_strip"
];
function jy(i) {
  if (gl.includes(i)) return ["light", "switch"];
  switch (i) {
    case "ac_unit":
      return ["climate", "fan", "switch"];
    case "ceiling_fan":
      return ["fan", "switch"];
    case "tv":
    case "tv_stand":
      return ["media_player", "switch"];
    case "speaker":
      return ["media_player"];
    case "curtain":
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
function Yy(i, t = 2.6) {
  return i === "ceiling_light" || i === "chandelier" || i === "pendant_light" ? t - 0.05 : i === "spotlight" || i === "led_strip" ? t - 0.02 : i === "ceiling_fan" ? t - 0.25 : i === "wall_light" || i === "ac_unit" || i === "security_camera" ? 2 : i === "bathroom_cabinet" || i === "whiteboard" ? 1.5 : i === "wall_shelf" || i === "painting" || i === "mirror" || i === "tv" || i === "intercom" ? 1.4 : i === "towel_rack" ? 1.1 : i === "terrace_window" ? 1.2 : i === "wall_clock" ? 1.7 : i === "range_hood" ? 1.6 : i === "curtain" ? 0.1 : 0;
}
function _l(i, t) {
  const e = ml[i] ?? ml.marker, n = new Tt(t ?? "#ffffff"), s = e(n);
  return s.userData.model = i, s;
}
const qy = new ly(), tu = /* @__PURE__ */ new Map();
function Ky(i) {
  let t = tu.get(i);
  return t || (t = new Promise((e, n) => {
    qy.load(
      i,
      (s) => {
        s.scene.traverse((r) => {
          r.castShadow = !0, r.receiveShadow = !0;
        }), e(s.scene);
      },
      void 0,
      (s) => n(s)
    );
  }), tu.set(i, t)), t;
}
function eu(i, t) {
  i.position.set(t.position[0], t.position[1], t.position[2]), t.rotation && (i.rotation.y = es.degToRad(t.rotation));
  const e = t.scale ?? 1;
  Array.isArray(e) ? i.scale.set(e[0], e[1], e[2]) : i.scale.setScalar(e);
}
function Zy(i, t) {
  const e = t ? new Tt(t) : null;
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
function Jy(i) {
  if (i.glb) {
    const e = new J();
    eu(e, i), e.userData.furnitureId = i.id;
    const n = _l("marker", i.color);
    return e.add(n), Ky(i.glb).then((s) => {
      const r = s.clone(!0);
      Zy(r, i.color), e.remove(n), e.add(r);
    }).catch((s) => {
      console.error(`[3d-floorplan] failed to load GLB "${i.glb}":`, s);
    }), e;
  }
  const t = _l(i.model, i.color);
  return eu(t, i), t.userData.furnitureId = i.id, t;
}
function xn(i) {
  return !!i.shape;
}
function Qy(i, t, e) {
  const n = e * Math.PI / 180, s = Math.cos(n), r = Math.sin(n);
  return [i * s - t * r, i * r + t * s];
}
function Jn(i) {
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
      const [u, d] = Qy(c, h, r);
      return [t + u, e + d];
    });
  }
  return i.polygon ?? [];
}
function tM(i, t, e) {
  const n = Jn(i), s = [];
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
const eM = ["plain", "stripes", "plaster", "brick", "panel"], nM = ["plain", "wood", "tile", "plaster"], xa = /* @__PURE__ */ new Map();
function iM(i = 256) {
  const t = document.createElement("canvas");
  return t.width = t.height = i, [t, t.getContext("2d")];
}
function sM(i) {
  if (i === "plain") return null;
  const [t, e] = iM(256);
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
  const n = new cd(t);
  return n.wrapS = n.wrapT = ri, n;
}
function Ad(i) {
  const t = i || "plain";
  return xa.has(t) || xa.set(t, sM(t)), xa.get(t) ?? null;
}
function rM(i, t, e) {
  if (!i) return null;
  const n = i.clone();
  return n.needsUpdate = !0, n.wrapS = n.wrapT = ri, n.repeat.set(Math.max(1, t / 1), Math.max(1, e / 1)), n;
}
const oM = 2.6, Rd = 0.12;
function aM(i, t) {
  return new zn({
    color: i ?? "#e6e6e6",
    roughness: 0.95,
    metalness: 0,
    map: t && t !== "plain" ? rM(Ad(t), 3, 2) : null
  });
}
function Us(i, t, e, n, s, r, o, a, l, c) {
  const h = r - s;
  if (h <= 1e-4) return;
  const u = a - o;
  if (u <= 1e-4) return;
  const d = new Vn(h, u, l), f = new ge(d, c);
  f.castShadow = !0, f.receiveShadow = !0;
  const g = s + h / 2, v = t.x + e.x * g, p = t.y + e.y * g;
  f.position.set(v, o + u / 2, p), f.rotation.y = n, i.add(f);
}
function nu(i, t, e, n) {
  const s = new nt(t.start[0], t.start[1]), r = new nt(t.end[0], t.end[1]), o = r.clone().sub(s), a = o.length();
  if (a <= 1e-4) return null;
  const l = o.clone().normalize(), c = new J();
  c.userData.wallIndex = n;
  const u = -Math.atan2(l.y, l.x), d = t.height ?? e, f = t.thickness ?? Rd, g = aM(t.color, t.material), v = new zn({ color: 12159570, roughness: 0.6 }), p = new zn({
    color: 10274778,
    transparent: !0,
    opacity: 0.55,
    // more visible than before (was nearly see-through)
    roughness: 0.05,
    metalness: 0.25
  }), m = new zn({ color: 5595242, roughness: 0.6 }), y = [...t.openings ?? []].sort((M, R) => M.position - R.position);
  let _ = 0;
  for (const M of y) {
    const R = iu(M.position, 0, a), T = iu(M.position + M.width, 0, a);
    if (T <= _) continue;
    Us(c, s, l, u, _, R, 0, d, f, g);
    const w = M.sill ?? (M.kind === "window" ? 0.9 : 0), C = M.top ?? (M.kind === "window" ? 2.1 : M.kind === "opening" ? 2.4 : 2.05);
    if (w > 0 && Us(c, s, l, u, R, T, 0, w, f, g), C < d && Us(c, s, l, u, R, T, C, d, f, g), M.bare) {
      _ = Math.max(_, T);
      continue;
    }
    const B = (b, F, k, G, Z, W) => Us(c, s, l, u, b, F, k, G, Z, W), x = 0.06;
    if (M.kind === "door")
      B(R, T, w, C, 0.06, v);
    else {
      B(R, R + x, w, C, f * 1.1, m), B(T - x, T, w, C, f * 1.1, m), B(R, T, w, w + x, f * 1.1, m), B(R, T, C - x, C, f * 1.1, m), B(R + x, T - x, w + x, C - x, 0.04, p);
      const b = (R + T) / 2;
      B(b - 0.03, b + 0.03, w + x, C - x, 0.06, m);
      const F = (w + C) / 2;
      B(R + x, T - x, F - 0.03, F + 0.03, 0.06, m);
    }
    _ = Math.max(_, T);
  }
  Us(c, s, l, u, _, a, 0, d, f, g);
  for (const M of [s, r]) {
    const R = new ge(new Vn(f, d, f), g);
    R.position.set(M.x, d / 2, M.y), R.castShadow = !0, R.receiveShadow = !0, c.add(R);
  }
  return i.add(c), c;
}
function lM(i, t, e, n) {
  if (!n || n.length < 3) return null;
  const s = new pd();
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
      map: t.material && t.material !== "plain" ? Ad(t.material) : null
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
function cM(i, t) {
  const e = new J();
  e.position.y = i.elevation ?? 0;
  const n = i.wallHeight ?? t ?? oM, s = [], r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  (i.rooms ?? []).forEach((c, h) => {
    const u = xn(c) ? Jn(c) : c.polygon, d = lM(e, c, h, u);
    if (d && o.set(h, d.mesh), xn(c)) {
      const f = c.thickness ?? Rd;
      for (const g of tM(c, c.height ?? n, f)) {
        const v = nu(e, g, c.height ?? n, -1);
        v && (delete v.userData.wallIndex, v.userData.roomIndex = h);
      }
    }
  }), (i.walls ?? []).forEach((c, h) => {
    const u = nu(e, c, n, h);
    u && r.set(h, u);
  });
  const a = /* @__PURE__ */ new Map();
  for (const c of i.furniture ?? []) {
    const h = Jy(c);
    e.add(h), c.id && a.set(c.id, h);
  }
  const l = new Ye().setFromObject(e);
  return { group: e, furnitureById: a, wallById: r, roomById: o, bbox: l, labels: s };
}
function iu(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
class Cd {
  constructor(t = 1) {
    this.current = "", this.canvas = document.createElement("canvas"), this.canvas.width = 256, this.canvas.height = 128, this.ctx = this.canvas.getContext("2d"), this.texture = new cd(this.canvas), this.texture.anisotropy = 4;
    const e = new sd({
      map: this.texture,
      transparent: !0,
      depthWrite: !1,
      depthTest: !1
    });
    this.sprite = new Pv(e), this.sprite.scale.set(1 * t, 0.5 * t, 1), this.sprite.renderOrder = 999;
  }
  setText(t, e = "#ffffff") {
    if (t === this.current) return;
    this.current = t;
    const n = this.ctx;
    n.clearRect(0, 0, this.canvas.width, this.canvas.height), n.fillStyle = "rgba(20,22,26,0.78)", hM(n, 8, 28, 240, 72, 16), n.fill(), n.fillStyle = e, n.font = "bold 48px system-ui, sans-serif", n.textAlign = "center", n.textBaseline = "middle", n.fillText(t, 128, 64, 224), this.texture.needsUpdate = !0;
  }
  setPosition(t, e, n) {
    this.sprite.position.set(t, e, n);
  }
  dispose() {
    this.texture.dispose(), this.sprite.material.dispose();
  }
}
function hM(i, t, e, n, s, r) {
  i.beginPath(), i.moveTo(t + r, e), i.arcTo(t + n, e, t + n, e + s, r), i.arcTo(t + n, e + s, t, e + s, r), i.arcTo(t, e + s, t, e, r), i.arcTo(t, e, t + n, e, r), i.closePath();
}
const uM = /* @__PURE__ */ new Set(["light", "switch", "fan", "cover", "media_player"]);
function Pd(i) {
  return i.split(".")[0];
}
function dM(i) {
  return i.behavior && i.behavior !== "auto" ? i.behavior : Pd(i.entity_id);
}
function fM(i) {
  const t = [];
  i.traverse((n) => {
    const s = n;
    s.isMesh && (s.name === "emissive" ? t.unshift(s) : t.push(s));
  });
  const e = t.filter((n) => n.name === "emissive");
  return e.length ? e : t;
}
class pM {
  constructor(t) {
    this.bindings = [], this.byEntity = /* @__PURE__ */ new Map(), this.root = t;
  }
  /** Register all bindings for a freshly built floor. */
  register(t, e) {
    for (const n of e) {
      const s = dM(n);
      let r = null;
      const o = new P();
      n.anchor_object && t.furnitureById.has(n.anchor_object) ? (r = t.furnitureById.get(n.anchor_object), r.getWorldPosition(o)) : n.anchor ? (o.set(n.anchor[0], n.anchor[1], n.anchor[2]), o.y += t.group.position.y) : (t.bbox.getCenter(o), o.y = t.group.position.y + 1.5);
      const a = {
        def: n,
        behavior: s,
        anchor: r,
        worldPos: o,
        emissiveMeshes: r ? fM(r) : []
      };
      this.setupVisual(a, t), this.bindings.push(a), this.byEntity.has(n.entity_id) || this.byEntity.set(n.entity_id, []), this.byEntity.get(n.entity_id).push(a), r && (r.userData.bindingEntity = n.entity_id);
    }
  }
  setupVisual(t, e) {
    const { behavior: n, worldPos: s } = t;
    if (n === "light") {
      const r = new Sd(16773584, 0, 8, 2);
      r.position.copy(s), r.castShadow = !1, this.root.add(r), t.pointLight = r;
    }
    if (n === "climate" || n === "sensor" || n === "binary_sensor" || n === "lock" || n === "media_player" || n === "label") {
      const r = new Cd(1.2), o = t.anchor ? 0.6 : 0;
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
        t.label?.setText(`${su(s)}: ${n}${r}`, "#ffe7a0");
        break;
      }
      case "binary_sensor": {
        const r = n === "on";
        t.label?.setText(
          `${su(s)}: ${r ? "ON" : "off"}`,
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
        const r = n === "open";
        this.setEmissive(t, r ? 5230698 : 0, r ? 0.4 : 0);
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
  /** Per-frame animation for fans etc. */
  animate(t) {
    for (const e of this.bindings)
      e.behavior === "fan" && e.spin && (e.spin.rotation.y += t * 6);
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
function mM(i, t) {
  const e = Pd(i), n = { entity_id: i };
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
      return uM.has(e) ? { domain: e, service: "toggle", data: n } : null;
  }
}
function su(i) {
  return i.length > 18 ? i.slice(0, 16) + "…" : i;
}
class gM {
  constructor(t, e = "#1b1d22") {
    this.clock = new Nx(), this.running = !1, this.rafId = 0, this.floors = [], this.floorGroups = [], this.bindingManagers = [], this.activeFloor = 0, this.fullBBox = new Ye(), this.raycaster = new Wx(), this.pointer = new nt(), this.downPos = { x: 0, y: 0 }, this.downTime = 0, this.previewGroup = new J(), this.gizmoGroup = new J(), this.underlayGroup = new J(), this.editing = !1, this.groundPlane = new Fn(new P(0, 1, 0), 0), this.dragging = !1, this.container = t, this.renderer = new ed({ antialias: !0, alpha: !1 }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Eu, this.renderer.domElement.style.touchAction = "none", this.renderer.domElement.style.display = "block", this.renderer.domElement.style.width = "100%", this.renderer.domElement.style.height = "100%", t.appendChild(this.renderer.domElement), this.scene = new nd(), this.scene.background = new Tt(e), this.scene.add(this.previewGroup), this.scene.add(this.gizmoGroup), this.scene.add(this.underlayGroup), this.camera = new ze(55, 1, 0.1, 1e3), this.camera.position.set(8, 8, 8), this.controls = new qx(this.camera, this.renderer.domElement), this.controls.enableDamping = !0, this.controls.dampingFactor = 0.12, this.controls.screenSpacePanning = !1, this.controls.zoomToCursor = !0, this.controls.minDistance = 2, this.controls.maxDistance = 40, this.controls.maxPolarAngle = Math.PI * 0.49, this.controls.touches = {
      ONE: mn.ROTATE,
      TWO: mn.DOLLY_PAN
    }, this.controls.addEventListener("change", () => this.clampTarget()), this.setupLights(), this.setupResize(), this.setupPointer();
  }
  setupLights() {
    const t = new bd(16777215, 0.55);
    this.scene.add(t);
    const e = new ql(16777215, 0.9);
    e.position.set(10, 18, 8), e.castShadow = !0, e.shadow.mapSize.set(1024, 1024), e.shadow.camera.near = 1, e.shadow.camera.far = 60;
    const n = 20;
    e.shadow.camera.left = -n, e.shadow.camera.right = n, e.shadow.camera.top = n, e.shadow.camera.bottom = -n, this.scene.add(e);
    const s = new Rx(16777215, 4473941, 0.4);
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
      const l = cM(a, t.wallHeight), c = new pM(l.group);
      c.register(l, a.bindings ?? []), this.scene.add(l.group), this.floors.push(l), this.floorGroups.push(l.group), this.bindingManagers.push(c), this.fullBBox.union(l.bbox);
    });
    const o = e ? Math.min(r, this.floors.length - 1) : 0;
    this.activeFloor = Math.max(0, o), this.floorGroups.forEach((a, l) => a.visible = l === this.activeFloor), e ? (this.controls.target.copy(n), this.camera.position.copy(s), this.controls.update()) : this.resetView();
  }
  clearPlan() {
    for (const t of this.bindingManagers) t.dispose();
    for (const t of this.floors)
      for (const e of t.labels) e.dispose();
    for (const t of this.floorGroups)
      this.scene.remove(t), _M(t);
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
    (!t || t.isEmpty()) && (t = new Ye(
      new P(-4, 0, -4),
      new P(4, 2.6, 4)
    ));
    const e = t.getCenter(new P()), n = t.getSize(new P()), s = Math.max(n.x, n.z, 2);
    this.controls.target.copy(e);
    const r = s * 1.4 + 4;
    this.camera.position.set(e.x + r * 0.7, e.y + r * 0.8, e.z + r * 0.7), this.controls.maxDistance = r * 2.2, this.controls.minDistance = Math.max(1.5, s * 0.15), this.camera.lookAt(e), this.controls.update();
  }
  /** Keep the orbit target from drifting outside the floor bbox + margin. */
  clampTarget() {
    const t = this.floors[this.activeFloor]?.bbox ?? this.fullBBox;
    if (t.isEmpty()) return;
    const e = 3, n = this.controls.target, s = es.clamp(n.x, t.min.x - e, t.max.x + e), r = es.clamp(n.y, t.min.y, t.max.y + 1), o = es.clamp(n.z, t.min.z - e, t.max.z + e);
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
    this.editing = t, this.groundPlane.constant = -e, t ? (this.gridHelper || (this.gridHelper = new $x(40, 80, 4891647, 2765632), this.gridHelper.material.transparent = !0, this.gridHelper.material.opacity = 0.5, this.scene.add(this.gridHelper)), this.gridHelper.position.y = e + 2e-3, this.gridHelper.visible = !0) : (this.gridHelper && (this.gridHelper.visible = !1), this.clearPreview(), this.setSelection(null));
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
    this.selectionHelper && (this.scene.remove(this.selectionHelper), this.selectionHelper.geometry.dispose(), this.selectionHelper = void 0), t && (this.selectionHelper = new Xx(t, 5230698), this.scene.add(this.selectionHelper));
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
      h.traverse((u) => {
        const d = u;
        d.geometry && d.geometry.dispose();
        const f = d.material;
        f && (f.map?.dispose(), f.dispose());
      });
    if (this.underlayGroup.clear(), !t || !t.image) return;
    const n = t.aspect > 0 ? t.aspect : 1, s = Math.max(0.1, t.widthM || 10), r = s * n, o = new Md().load(t.image);
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
    const c = new J();
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
function _M(i) {
  i.traverse((t) => {
    const e = t;
    e.geometry && e.geometry.dispose(), e.material && (Array.isArray(e.material) ? e.material : [e.material]).forEach((s) => s.dispose());
  });
}
const vM = "0.13.2", _o = "ha-3d-floorplan-sidebar-item", ru = "ha-3d-floorplan-overlay";
function xM() {
  return window.ha3dFloorplan ?? {};
}
function yM(i) {
  const t = i.shadowRoot;
  return t.querySelector("ha-md-list") || t.querySelector("paper-listbox") || t.querySelector("ul.ha-scrollbar") || t.querySelector("ul") || t.querySelector(".menu");
}
function MM(i) {
  const t = document.createElement("a");
  t.id = _o, t.href = "#", t.setAttribute("role", "menuitem"), t.style.cssText = [
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
    s.preventDefault(), EM(i);
  }), t;
}
function ou(i, t) {
  const e = i.shadowRoot;
  if (e.getElementById(_o)) return;
  const n = yM(i), s = MM(t);
  n && n.parentNode ? n.parentNode.insertBefore(s, n.nextSibling) : e.appendChild(s);
}
function SM(i) {
  if (i.config) return { type: "custom:ha-3d-floorplan-card", height: "100vh", ...i.config };
  const t = { type: "custom:ha-3d-floorplan-card", height: "100vh" };
  return i.url && (t.url = i.url), t;
}
function bM() {
  const e = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar");
  if (!e) return 0;
  const n = e.getBoundingClientRect();
  return n.width === 0 || n.right <= 0 ? 0 : Math.max(0, Math.round(n.right));
}
function EM(i) {
  if (document.getElementById(ru)) return;
  const t = document.createElement("div");
  t.id = ru, t.style.cssText = [
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
    t.style.left = `${bM()}px`;
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
    l.setConfig(SM(i));
  } catch (v) {
    console.error("[3d-floorplan] sidebar config error:", v);
  }
  const c = document.querySelector("home-assistant");
  c?.hass && (l.hass = c.hass);
  const h = window.setInterval(() => {
    c?.hass && (l.hass = c.hass), location.pathname !== u && f();
  }, 1e3), u = location.pathname, d = () => {
    location.pathname !== u && f();
  }, f = () => {
    window.clearInterval(h), window.clearInterval(o), window.removeEventListener("resize", e), window.removeEventListener("location-changed", d), window.removeEventListener("popstate", d), n?.disconnect(), t.remove(), document.removeEventListener("keydown", g);
  }, g = (v) => {
    v.key === "Escape" && f();
  };
  window.addEventListener("location-changed", d), window.addEventListener("popstate", d), a.addEventListener("click", f), document.addEventListener("keydown", g), t.appendChild(a), t.appendChild(l), document.body.appendChild(t);
}
function wM() {
  const e = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar");
  return e && e.shadowRoot ? e : null;
}
let au = !1;
function TM() {
  const i = xM();
  if (i.sidebar === !1 || au) return;
  au = !0;
  const t = () => {
    const e = wM();
    if (!e) return;
    const n = e.shadowRoot;
    if (n.querySelector(
      'a[href="/3d-floorplan"], a[href$="/3d-floorplan"], a[href$="/ha-3d-floorplan-card"]'
    ) || window.__ha3dPanelMode) {
      n.getElementById(_o)?.remove();
      return;
    }
    if (ou(e, i), !e.__ha3dObs) {
      const r = e.shadowRoot, o = new MutationObserver(() => {
        r.getElementById(_o) || ou(e, i);
      });
      o.observe(r, { childList: !0, subtree: !0 }), e.__ha3dObs = o;
    }
  };
  t(), window.setInterval(t, 1500);
}
const AM = {
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
}, vo = 0.1, RM = 0.4, CM = 0.3, lu = Math.PI / 12, PM = 0.12, cu = 0.25, Te = (i) => Math.round(i / vo) * vo, Yi = (i, t) => Math.hypot(i[0] - t[0], i[1] - t[1]) < 1e-4, Yr = (i, t, e) => {
  const n = e * Math.PI / 180, s = Math.cos(n), r = Math.sin(n);
  return [i * s - t * r, i * r + t * s];
};
class LM {
  constructor(t, e) {
    this.floorIndex = 0, this.tool = "wall", this.selectedModel = "sofa", this.selectedKind = null, this.selectedId = null, this.selectedWall = -1, this.selectedRoom = -1, this.chain = [], this.cursor = null, this.calibrating = !1, this.calibPts = [], this.snapEnabled = !0, this.snapInfo = null, this.dragMode = null, this.dragVertex = null, this.wallDrag0 = null, this.furnDrag0 = [0, 0], this.undoStack = [], this.redoStack = [], this.dragSnapshot = null, this.HISTORY_MAX = 80, this.gizmoHandle = null, this.gizmoGrab = [0, 0], this.gizmoRoom0 = { x: 0, z: 0, width: 3, depth: 3, rotation: 0 }, this.shiftHeld = !1, this.sm = t, this.plan = e;
  }
  get pointCount() {
    return this.chain.length;
  }
  start() {
    this.measureLabel = new Cd(1.2), this.measureLabel.sprite.visible = !1, this.sm.scene.add(this.measureLabel.sprite), this.sm.setDragHandler({
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
      const r = this.sm.pickGizmo(t);
      if (r) return this.beginGizmo(r, t);
    }
    const e = this.sm.pickFurniture(t);
    if (e)
      return this.selectFurniture(e.id), this.beginFurnitureMove(t);
    const n = this.sm.pickRoom(t);
    if (n && xn(this.floor().rooms?.[n.index] ?? {}))
      return this.selectRoom(n.index), this.beginGizmo("move", t);
    const s = this.sm.groundIntersect(t);
    if (s) {
      const r = this.nearestEndpoint(s.x, s.z, 0.45);
      if (r) {
        this.dragMode = "endpoint", this.dragVertex = r;
        const l = (this.floor().walls ?? []).findIndex(
          (c) => Yi(c.start, r) || Yi(c.end, r)
        );
        return l >= 0 && this.selectWall(l), !0;
      }
      const o = this.sm.pickWall(t), a = o ? this.floor().walls?.[o.index] : null;
      if (o && a)
        return this.selectWall(o.index), this.dragMode = "wallmove", this.gizmoGrab = [s.x, s.z], this.wallDrag0 = { s: [a.start[0], a.start[1]], e: [a.end[0], a.end[1]] }, !0;
      if (this.isMovableSelected()) return this.beginMoveSelected(t, s);
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
      if (Yi(e, this.dragVertex)) return;
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
      Yi(n.start, t) && (n.start = [e[0], e[1]]), Yi(n.end, t) && (n.end = [e[0], e[1]]);
    for (const n of this.floor().rooms ?? [])
      n.polygon = n.polygon.map(
        (s) => Yi(s, t) ? [e[0], e[1]] : s
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
      position: [r, Yy(this.selectedModel, n), o],
      rotation: a,
      id: s
    }), this.rebuild(), this.selectFurniture(s);
  }
  /** Nearest point on any wall / shape-room edge, with orientation + normal/side
   *  (which face of the wall the tapped point is on), for snapping wall-mounted
   *  furniture. */
  nearestWallPoint(t, e) {
    let n = 1.2, s = null;
    const r = this.floor(), o = (a, l, c, h, u) => {
      const d = c - a, f = h - l, g = d * d + f * f;
      if (g < 1e-6) return;
      let v = ((t - a) * d + (e - l) * f) / g;
      v = Math.max(0, Math.min(1, v));
      const p = a + d * v, m = l + f * v, y = Math.hypot(t - p, e - m);
      if (y < n) {
        n = y;
        const _ = Math.sqrt(g);
        let M = -f / _, R = d / _;
        (t - p) * M + (e - m) * R < 0 && (M = -M, R = -R), s = { x: p, z: m, rotation: -Math.atan2(f, d) * 180 / Math.PI, nx: M, nz: R, thickness: u };
      }
    };
    for (const a of r.walls ?? [])
      o(a.start[0], a.start[1], a.end[0], a.end[1], a.thickness ?? 0.12);
    for (const a of r.rooms ?? []) {
      if (!xn(a)) continue;
      const l = Jn(a), c = a.thickness ?? 0.12;
      for (let h = 0; h < l.length; h++) {
        const u = l[h], d = l[(h + 1) % l.length];
        o(u[0], u[1], d[0], d[1], c);
      }
    }
    return s;
  }
  /** Resolve final position + rotation for a wall-mounted piece. Surface-mount
   *  items (TV, painting…) are pushed onto the room-side face and turned to face
   *  the room; doors/windows/curtains stay in the wall plane. */
  resolveWallMount(t, e) {
    if (!Xy(t)) return { x: e.x, z: e.z, rotation: e.rotation };
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
  clearSelection() {
    this.selectedKind = null, this.selectedId = null, this.selectedWall = -1, this.selectedRoom = -1, this.sm.setSelection(null), this.sm.clearGizmo(), this.applyReserve(), this.onChange?.();
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
    this.selectedKind === "furniture" && this.selectedId ? this.sm.setSelection(this.sm.getFurnitureObject(this.selectedId) ?? null) : this.selectedKind === "wall" && this.selectedWall >= 0 ? this.sm.setSelection(this.sm.getWallObject(this.selectedWall) ?? null) : this.selectedKind === "room" && this.selectedRoom >= 0 && (this.sm.setSelection(this.sm.getRoomObject(this.selectedRoom) ?? null), this.buildGizmo());
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
    const e = this.sm.gizmoGroup, n = this.elevation() + 0.08, s = t.x ?? 0, r = t.z ?? 0, o = t.rotation ?? 0, a = (c, h, u, d, f = !0) => {
      const g = new ge(c, new en({ color: h, depthTest: !1 }));
      f && (g.rotation.x = -Math.PI / 2), g.position.set(u[0], n, u[1]), g.renderOrder = 1e3, g.userData.gizmoHandle = d, e.add(g);
    };
    a(new Vl(0.28, 24), 4891647, [s, r], "move");
    const l = Yr(0, -((t.depth ?? 3) / 2 + 0.7), o);
    a(new go(0.2, 0.05, 8, 20), 5230698, [s + l[0], r + l[1]], "rotate"), t.shape === "rect" && Jn(t).forEach((c, h) => {
      const u = new ge(
        new ir(0.16, 12, 12),
        new en({ color: 16763972, depthTest: !1 })
      );
      u.position.set(c[0], n, c[1]), u.renderOrder = 1e3, u.userData.gizmoHandle = `corner${h}`, e.add(u);
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
      ], [a, l] = o[r] ?? [1, 1], c = [-a * n.width / 2, -l * n.depth / 2], h = Yr(c[0], c[1], n.rotation), u = n.x + h[0], d = n.z + h[1], f = Yr(t.x - n.x, t.z - n.z, -n.rotation), g = Math.max(0.5, Te(Math.abs(f[0] - -a * n.width / 2))), v = Math.max(0.5, Te(Math.abs(f[1] - -l * n.depth / 2))), p = Yr(a * g, l * v, n.rotation);
      e.width = g, e.depth = v, e.x = Te(u + p[0] / 2), e.z = Te(d + p[1] / 2);
    }
    this.rebuild(), this.reselect(), this.onChange?.();
  }
  /** Snap an axis-aligned room's edges to nearby axis-aligned rooms. */
  snapRoom(t) {
    if (Math.abs((t.rotation ?? 0) % 360) > 1) return;
    const e = 0.35, n = t.width ?? 3, s = t.depth ?? 3;
    let r = (t.x ?? 0) - n / 2, o = (t.z ?? 0) - s / 2;
    const a = (this.floor().rooms ?? []).filter(
      (d) => d !== t && xn(d) && Math.abs((d.rotation ?? 0) % 360) <= 1
    );
    let l = 0, c = e, h = 0, u = e;
    for (const d of a) {
      const f = d.width ?? 3, g = d.depth ?? 3, v = (d.x ?? 0) - f / 2, p = (d.x ?? 0) + f / 2, m = (d.z ?? 0) - g / 2, y = (d.z ?? 0) + g / 2;
      for (const _ of [r, r + n])
        for (const M of [v, p]) {
          const R = M - _;
          Math.abs(R) < c && (c = Math.abs(R), l = R);
        }
      for (const _ of [o, o + s])
        for (const M of [m, y]) {
          const R = M - _;
          Math.abs(R) < u && (u = Math.abs(R), h = R);
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
      const l = e ? this.sm.pickWall(e) : null;
      if (l) {
        this.selectWall(l.index);
        return;
      }
      const c = e ? this.sm.pickRoom(e) : null;
      c ? this.selectRoom(c.index) : this.clearSelection();
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
    const n = this.chain[this.chain.length - 1], s = (y, _) => Math.atan2(_[1] - y[1], _[0] - y[0]) * 180 / Math.PI, r = (y, _ = {}) => ({
      pt: y,
      joined: !1,
      matchedLen: !1,
      parallel: !1,
      lengthM: n ? Math.hypot(y[0] - n[0], y[1] - n[1]) : 0,
      angleDeg: n ? s(n, y) : 0,
      ..._
    });
    let o = null, a = CM;
    for (const y of [...this.existingEndpoints(), ...this.chain]) {
      const _ = Math.hypot(t - y[0], e - y[1]);
      _ < a && (a = _, o = y);
    }
    if (o) return r([o[0], o[1]], { joined: !0 });
    if (!this.snapEnabled) return r([Te(t), Te(e)]);
    if (!n) {
      let y = Te(t), _ = Te(e);
      for (const M of this.existingEndpoints())
        Math.abs(t - M[0]) < cu && (y = M[0]), Math.abs(e - M[1]) < cu && (_ = M[1]);
      return r([y, _]);
    }
    const l = t - n[0], c = e - n[1], h = Math.hypot(l, c);
    if (h < 1e-4) return r([n[0], n[1]]);
    const u = Math.round(Math.atan2(c, l) / lu) * lu;
    let d = Math.round(h / vo) * vo, f = !1, g = PM;
    for (const y of this.floor().walls ?? []) {
      const _ = Math.hypot(y.end[0] - y.start[0], y.end[1] - y.start[1]);
      Math.abs(_ - h) < g && (g = Math.abs(_ - h), d = _, f = !0);
    }
    const v = [n[0] + Math.cos(u) * d, n[1] + Math.sin(u) * d], p = Math.atan2(v[1] - n[1], v[0] - n[0]), m = (this.floor().walls ?? []).some((y) => {
      const _ = Math.atan2(y.end[1] - y.start[1], y.end[0] - y.start[0]);
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
    const l = (w, C, B, x, b) => {
      const F = B - w, k = x - C, G = F * F + k * k;
      if (G < 1e-6) return;
      let Z = ((t.x - w) * F + (t.z - C) * k) / G;
      Z = Math.max(0, Math.min(1, Z));
      const W = w + F * Z, et = C + k * Z, $ = Math.hypot(t.x - W, t.z - et);
      if ($ < o) {
        o = $;
        const lt = Math.sqrt(G);
        a = b(Z * lt, lt);
      }
    };
    for (const w of n.walls ?? [])
      l(w.start[0], w.start[1], w.end[0], w.end[1], (C, B) => ({
        type: "wall",
        wall: w,
        along: C,
        len: B
      }));
    for (const w of n.rooms ?? []) {
      if (!xn(w)) continue;
      const C = Jn(w);
      for (let B = 0; B < C.length; B++) {
        const x = C[B], b = C[(B + 1) % C.length], F = B;
        l(x[0], x[1], b[0], b[1], (k, G) => ({
          type: "room",
          room: w,
          edge: F,
          along: k,
          len: G
        }));
      }
    }
    if (!a) {
      this.onMessage?.("Tap closer to a wall (or room edge)");
      return;
    }
    const c = a, h = Math.max(0, Math.min(c.len - s, c.along - s / 2)), u = h + s / 2;
    let d;
    if (c.type === "wall")
      c.wall.openings || (c.wall.openings = []), c.wall.openings.push({ kind: e, position: h, width: s, ...r ? { bare: r } : {} }), d = [c.wall.start[0], c.wall.start[1], c.wall.end[0], c.wall.end[1]];
    else {
      c.room.openings || (c.room.openings = []), c.room.openings.push({ kind: e, edge: c.edge, position: h, width: s, ...r ? { bare: r } : {} });
      const w = Jn(c.room), C = w[c.edge], B = w[(c.edge + 1) % w.length];
      d = [C[0], C[1], B[0], B[1]];
    }
    const [f, g, v, p] = d, m = Math.hypot(v - f, p - g) || 1, y = f + (v - f) / m * u, _ = g + (p - g) / m * u, M = Math.atan2(p - g, v - f), R = (w, C, B, x) => {
      const b = B - w, F = x - C, k = b * b + F * F;
      if (k < 1e-6) return null;
      let G = Math.atan2(F, b);
      const Z = Math.abs((G - M + Math.PI) % Math.PI);
      if (Z > 0.03 && Math.abs(Z - Math.PI) > 0.03) return null;
      const W = Math.sqrt(k), et = ((y - w) * b + (_ - C) * F) / k, $ = w + b * et, lt = C + F * et;
      if (Math.hypot(y - $, _ - lt) > 0.12) return null;
      const ut = et * W;
      return ut < 0 || ut > W ? null : Math.max(0, Math.min(W - s, ut - s / 2));
    };
    for (const w of n.walls ?? []) {
      if (c.type === "wall" && w === c.wall) continue;
      const C = R(w.start[0], w.start[1], w.end[0], w.end[1]);
      C != null && (w.openings ??= []).push({ kind: e, position: C, width: s, ...r ? { bare: r } : {} });
    }
    for (const w of n.rooms ?? []) {
      if (!xn(w)) continue;
      const C = Jn(w);
      for (let B = 0; B < C.length; B++) {
        if (c.type === "room" && w === c.room && B === c.edge) continue;
        const x = C[B], b = C[(B + 1) % C.length], F = R(x[0], x[1], b[0], b[1]);
        F != null && (w.openings ??= []).push({ kind: e, edge: B, position: F, width: s, ...r ? { bare: r } : {} });
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
    const n = 0.2, s = [], r = /* @__PURE__ */ new Map(), o = (y) => {
      for (let _ = 0; _ < s.length; _++)
        if (Math.hypot(s[_][0] - y[0], s[_][1] - y[1]) <= n) return _;
      return s.push([y[0], y[1]]), r.set(s.length - 1, /* @__PURE__ */ new Set()), s.length - 1;
    }, a = [];
    for (const y of e) {
      const _ = o(y.start), M = o(y.end);
      _ !== M && (r.get(_).add(M), r.get(M).add(_), a.push([_, M]));
    }
    const l = (y, _) => Math.atan2(s[_][1] - s[y][1], s[_][0] - s[y][0]), c = Math.PI * 2, h = /* @__PURE__ */ new Set(), u = (y, _) => `${y}|${_}`, d = [];
    for (const [y, _] of a)
      for (const [M, R] of [[y, _], [_, y]]) {
        if (h.has(u(M, R))) continue;
        const T = [];
        let w = M, C = R, B = 0;
        do {
          h.add(u(w, C)), T.push(w);
          const x = l(C, w);
          let b = null, F = 1 / 0;
          for (const k of r.get(C)) {
            let G = x - l(C, k);
            G = (G % c + c) % c, G < 1e-9 && (G = c), G < F && (F = G, b = k);
          }
          if (b === null) break;
          w = C, C = b, B++;
        } while (!(w === M && C === R) && B < 1e5);
        T.length >= 3 && d.push(T.map((x) => s[x]));
      }
    const f = (y) => {
      let _ = 0;
      for (let M = 0; M < y.length; M++) {
        const R = y[M], T = y[(M + 1) % y.length];
        _ += R[0] * T[1] - T[0] * R[1];
      }
      return _ / 2;
    }, g = (y) => {
      let _ = 0, M = 0;
      for (const R of y)
        _ += R[0], M += R[1];
      return [_ / y.length, M / y.length];
    }, v = d.filter((y) => f(y) > 0.5);
    if (!v.length) {
      this.onMessage?.("No closed rooms found — make sure walls connect at corners");
      return;
    }
    const p = (t.rooms ?? []).map((y) => {
      const _ = xn(y) ? Jn(y) : y.polygon;
      return { c: g(_), a: Math.abs(f(_)) };
    });
    let m = 0;
    this.pushUndo(), t.rooms || (t.rooms = []);
    for (const y of v) {
      const _ = g(y), M = Math.abs(f(y));
      p.some(
        (T) => Math.hypot(T.c[0] - _[0], T.c[1] - _[1]) < 0.4 && Math.abs(T.a - M) / Math.max(T.a, M) < 0.2
      ) || (t.rooms.push({ polygon: y.map((T) => [Math.round(T[0] * 1e3) / 1e3, Math.round(T[1] * 1e3) / 1e3]), color: "#c9c4bb" }), p.push({ c: _, a: M }), m++);
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
      const u = Math.cos(h), d = Math.sin(h), f = a.start[0] * u + a.start[1] * d, g = a.end[0] * u + a.end[1] * d, v = a.start[0] * -d + a.start[1] * u;
      return { w: a, ang: h, perp: v, t0: Math.min(f, g), t1: Math.max(f, g) };
    }), r = new Array(s.length).fill(!1), o = [];
    for (let a = 0; a < s.length; a++) {
      if (r[a]) continue;
      const l = [s[a]];
      r[a] = !0;
      for (let T = a + 1; T < s.length; T++) {
        if (r[T]) continue;
        const w = s[a], C = s[T];
        if (!(Math.abs(w.ang - C.ang) < 0.03 && Math.abs(w.perp - C.perp) < n)) continue;
        l.some((b) => C.t1 >= b.t0 - n && C.t0 <= b.t1 + n) && (l.push(C), r[T] = !0);
      }
      if (l.length === 1) {
        o.push(l[0].w);
        continue;
      }
      const c = l[0].ang, h = Math.cos(c), u = Math.sin(c), d = Math.min(...l.map((T) => T.t0)), f = Math.max(...l.map((T) => T.t1)), g = l[0].perp, v = -u, p = h, m = g * v, y = g * p, _ = [m + h * d, y + u * d], M = [m + h * f, y + u * f], R = {
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
          const C = T.w.end[0] - T.w.start[0], B = T.w.end[1] - T.w.start[1], x = Math.hypot(C, B) || 1, b = T.w.start[0] + C / x * w.position, F = T.w.start[1] + B / x * w.position, k = (b - _[0]) * h + (F - _[1]) * u;
          R.openings.push({ ...w, position: Math.max(0, k) });
        }
      R.openings.length || delete R.openings, o.push(R);
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
      const h = r === s.length - 2 && !!this.cursor && this.snapInfo && (this.snapInfo.matchedLen || this.snapInfo.parallel), u = new ge(
        new Vn(l, n, 0.1),
        new en({
          color: h ? 5230698 : 4500223,
          transparent: !0,
          opacity: h ? 0.5 : 0.35
        })
      ), d = Math.atan2(a[1] - o[1], a[0] - o[0]);
      u.position.set((o[0] + a[0]) / 2, e + n / 2, (o[1] + a[1]) / 2), u.rotation.y = -d, t.add(u);
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
      if (Math.hypot(this.cursor[0] - r[0], this.cursor[1] - r[1]) < RM) {
        const o = new ge(
          new go(0.22, 0.04, 8, 24),
          new en({ color: 5230698 })
        );
        o.rotation.x = Math.PI / 2, o.position.set(r[0], e + 0.06, r[1]), t.add(o);
      }
    }
  }
}
const Ld = "ha3d_floorplans", Id = "ha3d-floorplans-set", IM = "ha3d-floorplan-default";
function Dd(i) {
  return !!i && Array.isArray(i.floors) && i.floors.length > 0;
}
async function DM(i) {
  try {
    const e = (await i.callWS?.({ type: "frontend/get_user_data", key: Ld }))?.value;
    if (e && e.projects) return e;
  } catch {
  }
  return null;
}
async function ya(i) {
  if (i) {
    const t = await DM(i);
    if (t) return t;
  }
  return NM() ?? { projects: {} };
}
async function hu(i, t) {
  if (UM(i), !t) return { ha: !1 };
  try {
    return await t.callWS?.({ type: "frontend/set_user_data", key: Ld, value: i }), { ha: !0 };
  } catch (e) {
    return console.error("[3d-floorplan] HA save failed, kept localStorage copy:", e), { ha: !1 };
  }
}
function NM() {
  try {
    const t = localStorage.getItem(Id);
    if (t) {
      const e = JSON.parse(t);
      if (e && e.projects) return e;
    }
  } catch {
  }
  const i = OM();
  return i ? { active: "default", projects: { default: i } } : null;
}
function UM(i) {
  try {
    localStorage.setItem(Id, JSON.stringify(i));
  } catch {
  }
}
function OM() {
  try {
    const i = localStorage.getItem(IM);
    if (!i) return null;
    const t = JSON.parse(i);
    return Dd(t) ? t : null;
  } catch {
    return null;
  }
}
function Ma(i) {
  return Object.entries(i.projects).filter(([, t]) => Dd(t)).map(([t, e]) => ({ id: t, name: e.name || t })).sort((t, e) => t.name.localeCompare(e.name));
}
function uu() {
  try {
    if (typeof crypto < "u" && crypto.randomUUID)
      return "p" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  } catch {
  }
  return `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e9).toString(36)}`;
}
function du(i = "New Plan") {
  return {
    name: i,
    wallHeight: 2.6,
    floors: [{ name: "Ground Floor", elevation: 0, wallHeight: 2.6, walls: [], rooms: [], furniture: [], bindings: [] }]
  };
}
const fu = 76, pu = /* @__PURE__ */ new Map();
let Os;
function FM() {
  return Os || (Os = new ed({
    antialias: !0,
    alpha: !0,
    preserveDrawingBuffer: !0
    // required for toDataURL
  }), Os.setSize(fu, fu), Os.setPixelRatio(1)), Os;
}
function mu(i) {
  const t = pu.get(i);
  if (t) return t;
  const e = FM(), n = new nd();
  n.add(new bd(16777215, 0.95));
  const s = new ql(16777215, 0.8);
  s.position.set(3, 5, 4), n.add(s);
  const r = _l(i, "#aab4c0");
  n.add(r);
  const o = new Ye().setFromObject(r), a = o.getCenter(new P()), l = o.getSize(new P()), c = Math.max(l.x, l.y, l.z, 0.4), h = new ze(38, 1, 0.01, 100), u = c * 2.3;
  h.position.set(a.x + u * 0.85, a.y + u * 0.7, a.z + u * 0.95), h.lookAt(a);
  let d = "";
  try {
    e.render(n, h), d = e.domElement.toDataURL("image/png");
  } catch {
    d = "";
  }
  return r.traverse((f) => {
    const g = f;
    g.geometry && g.geometry.dispose();
  }), pu.set(i, d), d;
}
const BM = Math.PI / 180, yn = (i) => Math.round(i * 1e3) / 1e3;
function kM(i, t) {
  if (!t) return i;
  const e = t * BM, n = Math.cos(e), s = Math.sin(e);
  return [i[0] * n - i[1] * s, i[0] * s + i[1] * n];
}
function Nd(i) {
  const t = i?.position?.data?.transform || i?.placement?.data?.transform || {}, e = t.t || {};
  return { t: [e.x || 0, e.y || 0], r: t.r?.z ?? 0 };
}
const Ud = /* @__PURE__ */ new Set(["floor", "building", "site"]);
function qr(i, t, e) {
  let n = e, s = t, r = 0;
  for (; s && r++ < 32; ) {
    const o = i[s];
    if (!o || Ud.has(o.space?.type)) break;
    const { t: a, r: l } = Nd(o);
    n = kM(n, l), n = [n[0] + a[0], n[1] + a[1]], s = o.space?.parent;
  }
  return n;
}
function zM(i, t) {
  let e = 0, n = t, s = 0;
  for (; n && s++ < 32; ) {
    const r = i[n];
    if (!r || Ud.has(r.space?.type)) break;
    e += Nd(r).r, n = r.space?.parent;
  }
  return e;
}
const HM = (i) => (i % 360 + 360) % 360, Kr = (i) => [yn(i[1]), yn(-i[0])];
function GM(i, t) {
  const e = i.toLowerCase();
  return t.includes("cls:building.stairs") || e.includes("stair") ? "stairs" : t.includes("plm:on-ceiling") || e.includes("ceiling light") ? "ceiling_light" : e.includes("sofa") || e.includes("couch") ? "sofa" : e.includes("closet") || e.includes("wardrobe") ? "wardrobe" : e.includes("shelf") || e.includes("bookcase") ? "bookshelf" : e.includes("bed") ? "bed" : e.includes("table") ? "dining_table" : e.includes("chair") ? "chair" : e.includes("tv") ? "tv" : e.includes("fridge") || e.includes("refriger") ? "fridge" : e.includes("toilet") ? "toilet" : e.includes("sink") ? "sink" : e.includes("bath") ? "bathtub" : e.includes("desk") ? "desk" : "marker";
}
function VM(i) {
  return i === "ceiling_light" ? 2.65 : 0;
}
function WM(i) {
  return !!(i && i.spacePlan && i.spacePlan.plan && i.spacePlan.plan.units);
}
function $M(i) {
  const t = i.spacePlan.plan.units, e = Object.keys(t), n = [], s = [], r = [], o = [];
  let a = "Floor 1";
  for (const c of e)
    if (t[c].space?.type === "floor") {
      a = t[c].info?.name || a;
      break;
    }
  for (const c of e) {
    const h = t[c], u = h.space?.type;
    if (u === "area") {
      const d = h.shape?.data, f = d?.type, g = d?.points || [];
      if (f === "room" && g.length >= 3) {
        const v = g.map((y) => Kr(qr(t, c, [y.p.x, y.p.y])));
        s.push({
          polygon: v.map((y) => [y[0], y[1]]),
          color: "#c9c4bb"
        });
        const p = d?.parts || {}, m = {};
        for (const y in p) {
          const _ = p[y].data;
          (m[_.edge] ??= []).push(_);
        }
        for (let y = 0; y < v.length; y++) {
          const _ = v[y], M = v[(y + 1) % v.length], R = `edge:${g[y].i}-${g[(y + 1) % g.length].i}`, T = Math.hypot(M[0] - _[0], M[1] - _[1]), w = (m[R] || []).map((C) => ({
            kind: "door",
            position: Math.max(0, Math.min(T, C.start)),
            width: Math.max(0.3, C.end - C.start)
          }));
          n.push({
            start: [yn(_[0]), yn(_[1])],
            end: [yn(M[0]), yn(M[1])],
            thickness: 0.12,
            openings: w.length ? w : void 0
          });
        }
      } else if (f === "divider" && g.length >= 2) {
        const v = Kr(qr(t, c, [g[0].p.x, g[0].p.y])), p = Kr(qr(t, c, [g[1].p.x, g[1].p.y])), m = Math.hypot(p[0] - v[0], p[1] - v[1]), y = d?.parts || {}, _ = Object.keys(y).map((M) => {
          const R = y[M].data;
          return {
            kind: "door",
            position: Math.max(0, Math.min(m, R.start)),
            width: Math.max(0.3, R.end - R.start)
          };
        });
        n.push({
          start: [yn(v[0]), yn(v[1])],
          end: [yn(p[0]), yn(p[1])],
          thickness: 0.1,
          openings: _.length ? _ : void 0
        });
      }
    } else if (u === "device") {
      const d = h.info?.name || "", f = h.info?.tags || [];
      if (f.includes("cls:building.door")) continue;
      const g = GM(d, f);
      if (!g) continue;
      const v = Kr(qr(t, c, [0, 0])), p = zM(t, c);
      r.push({
        model: g,
        position: [v[0], VM(g), v[1]],
        rotation: HM(-p + 90),
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
var XM = Object.defineProperty, jM = Object.getOwnPropertyDescriptor, $t = (i, t, e, n) => {
  for (var s = n > 1 ? void 0 : n ? jM(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(t, e, s) : o(s)) || s);
  return n && s && XM(t, e, s), s;
};
let Vt = class extends Ji {
  constructor() {
    super(...arguments), this.floorNames = [], this.activeFloorIndex = 0, this.editing = !1, this.editTool = "wall", this.editSelectedModel = "sofa", this.editSelectedEntity = null, this.editSelectedObjModel = null, this.editShowAllEntities = !1, this.editSnap = !0, this.editFloorIndex = 0, this.editSelectedKind = null, this.editSelectedColor = null, this.editSelectedWallLength = null, this.editRoom = null, this.editFurnScale = null, this.editMaterial = "plain", this.editCanUndo = !1, this.editCanRedo = !1, this.editUnderlay = null, this.importOpen = !1, this.importText = "", this.projectList = [], this.currentProjectId = null, this.editingProjectId = null, this.editPlanName = "", this.paletteOpen = !1, this.storedProjects = { projects: {} }, this.planLoaded = !1, this.trackShift = (i) => {
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
    return await Promise.resolve().then(() => KM), document.createElement("ha-3d-floorplan-card-editor");
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
    this.sceneManager = new gM(this.viewport, i), this.sceneManager.setPickHandler((t) => this.handlePick(t)), this.sceneManager.start(), this.loadActiveProject();
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
    this.storedProjects = await ya(this.hass), this.projectList = Ma(this.storedProjects);
    const t = this.storedProjects.active && this.storedProjects.projects[this.storedProjects.active] ? this.storedProjects.active : this.projectList[0]?.id;
    return t ? (this.currentProjectId = t, this.storedProjects.projects[t]) : (this.currentProjectId = null, AM);
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
    const e = mM(i.entity_id, i.behavior);
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
    this.editor = new LM(this.sceneManager, i), this.editor.onChange = () => {
      const t = this.editor;
      this.editTool = t.tool, this.editSelectedModel = t.selectedModel, this.editSelectedEntity = t.selectedEntity, this.editSelectedObjModel = t.selectedObjectModel, this.editSelectedKind = t.selectedKind, this.editSelectedColor = t.selectedColor, this.editSelectedWallLength = t.selectedWallLength, this.editRoom = t.selectedRoomData, this.editFurnScale = t.selectedFurnitureScale, this.editMaterial = t.selectedMaterial, this.editFloorIndex = t.floorIndex, this.editPlanName = t.plan.name ?? "", this.editCanUndo = t.canUndo, this.editCanRedo = t.canRedo, this.editUnderlay = t.underlay, this.requestUpdate();
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
  onToggleSnap() {
    this.editor && (this.editSnap = !this.editSnap, this.editor.setSnap(this.editSnap));
  }
  onNewPlan() {
    if (!this.editor || !window.confirm(
      `Create a NEW project?

Your other saved projects stay. Unsaved changes in the current one will be lost. Draw, then Save to keep the new project.`
    )) return;
    const t = `Plan ${this.projectList.length + 1}`;
    this.editingProjectId = null, this.editor.loadPlan(du(t)), this.editPlanName = t, this.showToast("New project — draw it, then Save to keep it");
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
    if (this.storedProjects = await ya(this.hass), !i || !this.storedProjects.projects[i]) {
      this.showToast("This project is not saved yet");
      return;
    }
    if (!window.confirm(`Delete project "${this.storedProjects.projects[i].name || i}"? This cannot be undone.`))
      return;
    delete this.storedProjects.projects[i];
    const t = Ma(this.storedProjects);
    this.storedProjects.active = t[0]?.id, await hu(this.storedProjects, this.hass), this.projectList = t, this.currentProjectId = this.storedProjects.active ?? null, this.editingProjectId = this.currentProjectId, this.activeFloorIndex = 0;
    const e = this.currentProjectId ? this.storedProjects.projects[this.currentProjectId] : du();
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
      if (i = WM(t) ? $M(t) : t, !i || !Array.isArray(i.floors) || i.floors.length === 0)
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
    i.name || (i.name = this.editPlanName || "Plan"), this.storedProjects = await ya(this.hass);
    let t = this.editingProjectId;
    if (!t)
      for (t = uu(); this.storedProjects.projects[t]; ) t = uu();
    this.editingProjectId = t, this.currentProjectId = t, this.storedProjects.projects[t] = JSON.parse(JSON.stringify(i)), this.storedProjects.active = t;
    const e = await hu(this.storedProjects, this.hass);
    this.currentPlan = JSON.parse(JSON.stringify(i)), this.projectList = Ma(this.storedProjects), this.floorNames = i.floors.map((n, s) => n.name || `Floor ${s + 1}`), this.showToast(
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
    return Ot`
      <button
        class="palette-cell ${i === this.editSelectedModel ? "active" : ""}"
        title=${t}
        @click=${() => this.pickModel(i)}
      >
        <img src=${mu(i)} alt="" />
        <span>${t}</span>
      </button>
    `;
  }
  renderEditor() {
    const i = this.editTool, t = (o) => o.replace(/_/g, " ").replace(/\b\w/g, (a) => a.toUpperCase()), e = Vy.filter((o) => !gl.includes(o)), n = this.editSelectedKind, s = i === "select" && !!n, r = n === "furniture";
    return Ot`
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
        ${this.editUnderlay ? Ot`<div class="toolrow">
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
              </div>` : Ot`<div class="toolrow">
              <label class="btn" title="Import a top-down 2D plan image to trace over">
                📷 Import image
                <input type="file" accept="image/*" style="display:none"
                  @change=${this.onPickUnderlay} />
              </label>
              <span class="hint">then set its width (m) and draw walls over it</span>
            </div>`}

        ${(() => {
      const o = this.editor?.plan.floors ?? [];
      return Ot`<div class="toolrow">
            <span class="hint">Floor:</span>
            ${o.length > 1 ? Ot`<select class="select" @change=${this.onSelectEditFloor}>
                  ${o.map(
        (a, l) => Ot`<option value=${l} ?selected=${l === this.editFloorIndex}>
                      ${a.name || `Floor ${l + 1}`}
                    </option>`
      )}
                </select>` : Ot`<span class="hint">${o[0]?.name || "Ground"}</span>`}
            <button class="btn" title="Add a floor above" @click=${this.onAddFloor}>➕ Floor</button>
            ${o.length > 1 ? Ot`<button class="btn" title="Delete this floor" @click=${this.onDeleteFloor}>🗑</button>` : Lt}
          </div>`;
    })()}

        ${i === "wall" || i === "floor" ? Ot`<div class="toolrow">
              <button class="btn" title="Remove the last point" @click=${this.onUndoPoint}>⤺ Undo point</button>
              <button class="btn" title="Finish this run (Enter)" @click=${this.onFinishWall}>✓ Finish</button>
              <button class="btn ${this.editSnap ? "active" : ""}"
                title="Snap assist: parallel/perpendicular angles, equal lengths, alignment"
                @click=${this.onToggleSnap}>🧲 Snap</button>
              <span class="hint">${i === "floor" ? "trace a floor: tap corners · tap start (or Finish) to close" : "tap to add points · tap start to close (adds floor) · Finish/Enter to end"}</span>
            </div>` : Lt}

        ${i === "furniture" ? Ot`<div class="toolrow">
              <button class="btn palette-btn" title="Choose a model" @click=${this.togglePalette}>
                <img class="palette-thumb" src=${mu(this.editSelectedModel)} alt="" />
                ${t(this.editSelectedModel)} ▾
              </button>
              <span class="hint">tap floor to place</span>
            </div>
            ${this.paletteOpen ? Ot`<div class="palette">
                  <div class="palette-group">Lighting</div>
                  <div class="palette-grid">
                    ${gl.map((o) => this.renderPaletteCell(o, t(o)))}
                  </div>
                  <div class="palette-group">Furniture</div>
                  <div class="palette-grid">
                    ${e.map((o) => this.renderPaletteCell(o, t(o)))}
                  </div>
                </div>` : Lt}` : Lt}

        ${s ? Ot`<div class="toolrow">
              <span class="hint">${n} selected</span>
              ${r ? Ot`<button class="btn" title="Rotate 45°" @click=${this.onRotateSelected}>⟳ Rotate</button>
                    <button class="btn" title="Lower" @click=${() => this.onNudgeHeight(-0.1)}>▼ Down</button>
                    <button class="btn" title="Raise" @click=${() => this.onNudgeHeight(0.1)}>▲ Up</button>` : Lt}
              ${n !== "room" ? Ot`<button class="btn" title="Delete" @click=${this.onDeleteSelected}>🗑 Delete</button>` : Lt}
            </div>
            <div class="toolrow">
              <span class="hint">Color:</span>
              <input
                class="color"
                type="color"
                .value=${this.editSelectedColor ?? (n === "room" ? "#cfc7ba" : n === "wall" ? "#e6e6e6" : "#ffffff")}
                @input=${this.onSetColor}
              />
              ${n === "wall" || n === "room" ? Ot`<span class="hint">${n === "room" ? "Floor" : "Wall"}:</span>
                    <select class="select" @change=${this.onSetMaterial}>
                      ${(n === "room" ? nM : eM).map(
      (o) => Ot`<option value=${o} ?selected=${o === this.editMaterial}>${o}</option>`
    )}
                    </select>` : Lt}
            </div>
            ${r && this.editFurnScale ? Ot`<div class="toolrow">
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
                </div>` : Lt}
            ${n === "wall" ? Ot`<div class="toolrow">
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
                ${this.editor && this.editor.selectedWallOpenings.length ? Ot`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                      ${this.editor.selectedWallOpenings.map(
      (o, a) => Ot`<div class="toolrow">
                          <span class="hint">${o.kind} @ ${o.position.toFixed(1)}m · ${o.width.toFixed(1)}m</span>
                          <button class="btn" title="Delete this opening"
                            @click=${() => this.onDeleteWallOpening(a)}>🗑</button>
                        </div>`
    )}` : Lt}` : Lt}
            ${n === "room" && this.editRoom?.shape ? Ot`<div class="toolrow">
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
                  ${this.editor && this.editor.selectedRoomOpenings.length ? Ot`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                        ${this.editor.selectedRoomOpenings.map(
      (o, a) => Ot`<div class="toolrow">
                            <span class="hint">${o.kind} · ${o.width.toFixed(1)}m</span>
                            <button class="btn" title="Delete this opening"
                              @click=${() => this.onDeleteRoomOpening(a)}>🗑</button>
                          </div>`
    )}` : Lt}` : Lt}
            ${r && this.hass ? (() => {
      const o = this.editShowAllEntities || !this.editSelectedObjModel ? [] : jy(this.editSelectedObjModel), { ids: a, fellBack: l } = this.candidateEntities(o);
      return Ot`<div class="toolrow">
                      <select class="select wide" @change=${this.onPickEntity}>
                        <option value="" ?selected=${!this.editSelectedEntity}>
                          — bind entity —
                        </option>
                        ${a.map(
        (c) => Ot`<option value=${c} ?selected=${c === this.editSelectedEntity}
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
    })() : Lt}` : Lt}

        ${i === "select" && !n ? Ot`<span class="hint">tap to select · DRAG furniture to move it · drag a wall end to reshape</span>` : Lt}
        ${i === "door" || i === "window" ? Ot`<span class="hint">tap a wall to add a ${i}</span>` : Lt}
        ${i === "wall" ? Ot`<span class="hint">tap 2 points = 1 wall · 🧲 snaps parallel/right-angle + equal length · drag empty space = orbit</span>` : Lt}

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
          ${this.projectList.length > 0 ? Ot`<div class="toolrow">
                <select class="select wide" @change=${this.onSelectStorageProject}>
                  ${this.editingProjectId ? Lt : Ot`<option value="" selected>(unsaved new)</option>`}
                  ${this.projectList.map(
      (o) => Ot`<option value=${o.id} ?selected=${o.id === this.editingProjectId}>${o.name}</option>`
    )}
                </select>
                <button class="btn" title="Delete this project" @click=${this.onDeleteProject}>🗑</button>
              </div>` : Lt}
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
    if (!this.config) return Lt;
    const i = this.config.height ?? "500px", t = this.config.projects ?? [];
    return Ot`
      <ha-card>
        <div class="viewport" style="height:${i}"></div>

        ${this.loadError ? Ot`<div class="error">⚠ ${this.loadError}</div>` : Lt}

        <div class="overlay top-right">
          <button class="btn" title="Reset view" @click=${this.onResetView}>
            ⌂ Reset
          </button>
          ${this.editing ? Ot`<button class="btn primary" title="Save & exit editor" @click=${this.exitEdit}>
                ✓ Done &amp; Save
              </button>` : Ot`<button class="btn" title="Edit floor plan" @click=${this.enterEdit}>
                ✎ Edit
              </button>`}
        </div>

        ${this.editing ? this.renderEditor() : Lt}

        ${this.importOpen ? Ot`<div class="import-modal">
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
            </div>` : Lt}

        ${this.toast ? Ot`<div class="toast">${this.toast}</div>` : Lt}

        ${t.length > 1 ? Ot`
              <div class="overlay top-left">
                <select class="select" @change=${this.onSelectProject}>
                  ${t.map(
      (e) => Ot`<option value=${e.id} ?selected=${e.id === this.activeProjectId}>
                      ${e.name || e.id}
                    </option>`
    )}
                </select>
              </div>
            ` : Lt}

        ${this.floorNames.length > 1 && !this.editing ? Ot`
              <div class="overlay bottom">
                ${this.floorNames.map(
      (e, n) => Ot`
                    <button
                      class="tab ${n === this.activeFloorIndex ? "active" : ""}"
                      @click=${() => this.onSelectFloor(n)}
                    >
                      ${e}
                    </button>
                  `
    )}
              </div>
            ` : Lt}
      </ha-card>
    `;
  }
};
Vt.styles = _u`
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
$t([
  rr({ attribute: !1 })
], Vt.prototype, "hass", 2);
$t([
  rr({ attribute: !1 })
], Vt.prototype, "panel", 2);
$t([
  rr({ attribute: !1 })
], Vt.prototype, "narrow", 2);
$t([
  Zt()
], Vt.prototype, "config", 2);
$t([
  Zt()
], Vt.prototype, "activeProjectId", 2);
$t([
  Zt()
], Vt.prototype, "loadError", 2);
$t([
  Zt()
], Vt.prototype, "floorNames", 2);
$t([
  Zt()
], Vt.prototype, "activeFloorIndex", 2);
$t([
  Zt()
], Vt.prototype, "editing", 2);
$t([
  Zt()
], Vt.prototype, "editTool", 2);
$t([
  Zt()
], Vt.prototype, "editSelectedModel", 2);
$t([
  Zt()
], Vt.prototype, "editSelectedEntity", 2);
$t([
  Zt()
], Vt.prototype, "editSelectedObjModel", 2);
$t([
  Zt()
], Vt.prototype, "editShowAllEntities", 2);
$t([
  Zt()
], Vt.prototype, "editSnap", 2);
$t([
  Zt()
], Vt.prototype, "editFloorIndex", 2);
$t([
  Zt()
], Vt.prototype, "editSelectedKind", 2);
$t([
  Zt()
], Vt.prototype, "editSelectedColor", 2);
$t([
  Zt()
], Vt.prototype, "editSelectedWallLength", 2);
$t([
  Zt()
], Vt.prototype, "editRoom", 2);
$t([
  Zt()
], Vt.prototype, "editFurnScale", 2);
$t([
  Zt()
], Vt.prototype, "editMaterial", 2);
$t([
  Zt()
], Vt.prototype, "editCanUndo", 2);
$t([
  Zt()
], Vt.prototype, "editCanRedo", 2);
$t([
  Zt()
], Vt.prototype, "editUnderlay", 2);
$t([
  Zt()
], Vt.prototype, "importOpen", 2);
$t([
  Zt()
], Vt.prototype, "importText", 2);
$t([
  Zt()
], Vt.prototype, "projectList", 2);
$t([
  Zt()
], Vt.prototype, "currentProjectId", 2);
$t([
  Zt()
], Vt.prototype, "editingProjectId", 2);
$t([
  Zt()
], Vt.prototype, "editPlanName", 2);
$t([
  Zt()
], Vt.prototype, "paletteOpen", 2);
$t([
  Zt()
], Vt.prototype, "toast", 2);
$t([
  df(".viewport")
], Vt.prototype, "viewport", 2);
Vt = $t([
  Su("ha-3d-floorplan-card")
], Vt);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-3d-floorplan-card",
  name: "3D Floor Plan Card",
  description: "Interactive true-3D floor plan with live entity bindings.",
  preview: !1,
  documentationURL: "https://github.com/your-org/ha-3d-floorplan-card"
});
console.info(
  `%c 3D-FLOORPLAN-CARD %c v${vM} `,
  "color:#fff;background:#03a9f4;border-radius:4px 0 0 4px;padding:2px 6px",
  "color:#03a9f4;background:#222;border-radius:0 4px 4px 0;padding:2px 6px"
);
TM();
var YM = Object.defineProperty, qM = Object.getOwnPropertyDescriptor, hr = (i, t, e, n) => {
  for (var s = n > 1 ? void 0 : n ? qM(t, e) : t, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(t, e, s) : o(s)) || s);
  return n && s && YM(t, e, s), s;
};
let ai = class extends Ji {
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
    return this._config ? Ot`
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
        ${this._jsonError ? Ot`<div class="err">⚠ ${this._jsonError}</div>` : Lt}

        <p class="hint">
          A full visual wall-drawing editor with a furniture palette and
          entity-binding dropdowns is planned (Phase 2). For now, author the
          plan JSON here or point to a file under <code>/config/www/</code>.
        </p>
      </div>
    ` : Lt;
  }
};
ai.styles = _u`
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
], ai.prototype, "hass", 2);
hr([
  Zt()
], ai.prototype, "_config", 2);
hr([
  Zt()
], ai.prototype, "_planText", 2);
hr([
  Zt()
], ai.prototype, "_jsonError", 2);
ai = hr([
  Su("ha-3d-floorplan-card-editor")
], ai);
const KM = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get Ha3dFloorplanCardEditor() {
    return ai;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  Vt as Ha3dFloorplanCard
};
