(function () {
    const Y = document.createElement("link").relList;
    if (Y && Y.supports && Y.supports("modulepreload")) return;
    for (const R of document.querySelectorAll('link[rel="modulepreload"]')) d(R);
    new MutationObserver(R => {
        for (const X of R) if (X.type === "childList") for (const M of X.addedNodes) M.tagName === "LINK" && M.rel === "modulepreload" && d(M)
    }).observe(document, {childList: !0, subtree: !0});

    function C(R) {
        const X = {};
        return R.integrity && (X.integrity = R.integrity), R.referrerPolicy && (X.referrerPolicy = R.referrerPolicy), R.crossOrigin === "use-credentials" ? X.credentials = "include" : R.crossOrigin === "anonymous" ? X.credentials = "omit" : X.credentials = "same-origin", X
    }

    function d(R) {
        if (R.ep) return;
        R.ep = !0;
        const X = C(R);
        fetch(R.href, X)
    }
})();
var sc = {exports: {}}, pe = {};
var by;

function a1() {
    if (by) return pe;
    by = 1;
    var E = Symbol.for("react.transitional.element"), Y = Symbol.for("react.fragment");

    function C(d, R, X) {
        var M = null;
        if (X !== void 0 && (M = "" + X), R.key !== void 0 && (M = "" + R.key), "key" in R) {
            X = {};
            for (var P in R) P !== "key" && (X[P] = R[P])
        } else X = R;
        return R = X.ref, {$$typeof: E, type: d, key: M, ref: R !== void 0 ? R : null, props: X}
    }

    return pe.Fragment = Y, pe.jsx = C, pe.jsxs = C, pe
}

var zy;

function u1() {
    return zy || (zy = 1, sc.exports = a1()), sc.exports
}

var D = u1(), oc = {exports: {}}, V = {};
var Ty;

function e1() {
    if (Ty) return V;
    Ty = 1;
    var E = Symbol.for("react.transitional.element"), Y = Symbol.for("react.portal"), C = Symbol.for("react.fragment"),
        d = Symbol.for("react.strict_mode"), R = Symbol.for("react.profiler"), X = Symbol.for("react.consumer"),
        M = Symbol.for("react.context"), P = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"),
        S = Symbol.for("react.memo"), L = Symbol.for("react.lazy"), O = Symbol.for("react.activity"),
        j = Symbol.iterator;

    function cl(o) {
        return o === null || typeof o != "object" ? null : (o = j && o[j] || o["@@iterator"], typeof o == "function" ? o : null)
    }

    var rl = {
        isMounted: function () {
            return !1
        }, enqueueForceUpdate: function () {
        }, enqueueReplaceState: function () {
        }, enqueueSetState: function () {
        }
    }, El = Object.assign, xl = {};

    function Ml(o, p, U) {
        this.props = o, this.context = p, this.refs = xl, this.updater = U || rl
    }

    Ml.prototype.isReactComponent = {}, Ml.prototype.setState = function (o, p) {
        if (typeof o != "object" && typeof o != "function" && o != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, o, p, "setState")
    }, Ml.prototype.forceUpdate = function (o) {
        this.updater.enqueueForceUpdate(this, o, "forceUpdate")
    };

    function ll() {
    }

    ll.prototype = Ml.prototype;

    function bl(o, p, U) {
        this.props = o, this.context = p, this.refs = xl, this.updater = U || rl
    }

    var sl = bl.prototype = new ll;
    sl.constructor = bl, El(sl, Ml.prototype), sl.isPureReactComponent = !0;
    var ql = Array.isArray;

    function pl() {
    }

    var x = {H: null, A: null, T: null, S: null}, dl = Object.prototype.hasOwnProperty;

    function Fl(o, p, U) {
        var N = U.ref;
        return {$$typeof: E, type: o, key: p, ref: N !== void 0 ? N : null, props: U}
    }

    function St(o, p) {
        return Fl(o.type, p, o.props)
    }

    function Xl(o) {
        return typeof o == "object" && o !== null && o.$$typeof === E
    }

    function Ul(o) {
        var p = {"=": "=0", ":": "=2"};
        return "$" + o.replace(/[=:]/g, function (U) {
            return p[U]
        })
    }

    var B = /\/+/g;

    function al(o, p) {
        return typeof o == "object" && o !== null && o.key != null ? Ul("" + o.key) : p.toString(36)
    }

    function Wl(o) {
        switch (o.status) {
            case"fulfilled":
                return o.value;
            case"rejected":
                throw o.reason;
            default:
                switch (typeof o.status == "string" ? o.then(pl, pl) : (o.status = "pending", o.then(function (p) {
                    o.status === "pending" && (o.status = "fulfilled", o.value = p)
                }, function (p) {
                    o.status === "pending" && (o.status = "rejected", o.reason = p)
                })), o.status) {
                    case"fulfilled":
                        return o.value;
                    case"rejected":
                        throw o.reason
                }
        }
        throw o
    }

    function b(o, p, U, N, K) {
        var W = typeof o;
        (W === "undefined" || W === "boolean") && (o = null);
        var ol = !1;
        if (o === null) ol = !0; else switch (W) {
            case"bigint":
            case"string":
            case"number":
                ol = !0;
                break;
            case"object":
                switch (o.$$typeof) {
                    case E:
                    case Y:
                        ol = !0;
                        break;
                    case L:
                        return ol = o._init, b(ol(o._payload), p, U, N, K)
                }
        }
        if (ol) return K = K(o), ol = N === "" ? "." + al(o, 0) : N, ql(K) ? (U = "", ol != null && (U = ol.replace(B, "$&/") + "/"), b(K, p, U, "", function (Uu) {
            return Uu
        })) : K != null && (Xl(K) && (K = St(K, U + (K.key == null || o && o.key === K.key ? "" : ("" + K.key).replace(B, "$&/") + "/") + ol)), p.push(K)), 1;
        ol = 0;
        var kl = N === "" ? "." : N + ":";
        if (ql(o)) for (var Nl = 0; Nl < o.length; Nl++) N = o[Nl], W = kl + al(N, Nl), ol += b(N, p, U, W, K); else if (Nl = cl(o), typeof Nl == "function") for (o = Nl.call(o), Nl = 0; !(N = o.next()).done;) N = N.value, W = kl + al(N, Nl++), ol += b(N, p, U, W, K); else if (W === "object") {
            if (typeof o.then == "function") return b(Wl(o), p, U, N, K);
            throw p = String(o), Error("Objects are not valid as a React child (found: " + (p === "[object Object]" ? "object with keys {" + Object.keys(o).join(", ") + "}" : p) + "). If you meant to render a collection of children, use an array instead.")
        }
        return ol
    }

    function _(o, p, U) {
        if (o == null) return o;
        var N = [], K = 0;
        return b(o, N, "", "", function (W) {
            return p.call(U, W, K++)
        }), N
    }

    function Q(o) {
        if (o._status === -1) {
            var p = o._result;
            p = p(), p.then(function (U) {
                (o._status === 0 || o._status === -1) && (o._status = 1, o._result = U)
            }, function (U) {
                (o._status === 0 || o._status === -1) && (o._status = 2, o._result = U)
            }), o._status === -1 && (o._status = 0, o._result = p)
        }
        if (o._status === 1) return o._result.default;
        throw o._result
    }

    var ul = typeof reportError == "function" ? reportError : function (o) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var p = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message: typeof o == "object" && o !== null && typeof o.message == "string" ? String(o.message) : String(o),
                error: o
            });
            if (!window.dispatchEvent(p)) return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", o);
            return
        }
        console.error(o)
    }, il = {
        map: _, forEach: function (o, p, U) {
            _(o, function () {
                p.apply(this, arguments)
            }, U)
        }, count: function (o) {
            var p = 0;
            return _(o, function () {
                p++
            }), p
        }, toArray: function (o) {
            return _(o, function (p) {
                return p
            }) || []
        }, only: function (o) {
            if (!Xl(o)) throw Error("React.Children.only expected to receive a single React element child.");
            return o
        }
    };
    return V.Activity = O, V.Children = il, V.Component = Ml, V.Fragment = C, V.Profiler = R, V.PureComponent = bl, V.StrictMode = d, V.Suspense = y, V.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = x, V.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function (o) {
            return x.H.useMemoCache(o)
        }
    }, V.cache = function (o) {
        return function () {
            return o.apply(null, arguments)
        }
    }, V.cacheSignal = function () {
        return null
    }, V.cloneElement = function (o, p, U) {
        if (o == null) throw Error("The argument must be a React element, but you passed " + o + ".");
        var N = El({}, o.props), K = o.key;
        if (p != null) for (W in p.key !== void 0 && (K = "" + p.key), p) !dl.call(p, W) || W === "key" || W === "__self" || W === "__source" || W === "ref" && p.ref === void 0 || (N[W] = p[W]);
        var W = arguments.length - 2;
        if (W === 1) N.children = U; else if (1 < W) {
            for (var ol = Array(W), kl = 0; kl < W; kl++) ol[kl] = arguments[kl + 2];
            N.children = ol
        }
        return Fl(o.type, K, N)
    }, V.createContext = function (o) {
        return o = {
            $$typeof: M,
            _currentValue: o,
            _currentValue2: o,
            _threadCount: 0,
            Provider: null,
            Consumer: null
        }, o.Provider = o, o.Consumer = {$$typeof: X, _context: o}, o
    }, V.createElement = function (o, p, U) {
        var N, K = {}, W = null;
        if (p != null) for (N in p.key !== void 0 && (W = "" + p.key), p) dl.call(p, N) && N !== "key" && N !== "__self" && N !== "__source" && (K[N] = p[N]);
        var ol = arguments.length - 2;
        if (ol === 1) K.children = U; else if (1 < ol) {
            for (var kl = Array(ol), Nl = 0; Nl < ol; Nl++) kl[Nl] = arguments[Nl + 2];
            K.children = kl
        }
        if (o && o.defaultProps) for (N in ol = o.defaultProps, ol) K[N] === void 0 && (K[N] = ol[N]);
        return Fl(o, W, K)
    }, V.createRef = function () {
        return {current: null}
    }, V.forwardRef = function (o) {
        return {$$typeof: P, render: o}
    }, V.isValidElement = Xl, V.lazy = function (o) {
        return {$$typeof: L, _payload: {_status: -1, _result: o}, _init: Q}
    }, V.memo = function (o, p) {
        return {$$typeof: S, type: o, compare: p === void 0 ? null : p}
    }, V.startTransition = function (o) {
        var p = x.T, U = {};
        x.T = U;
        try {
            var N = o(), K = x.S;
            K !== null && K(U, N), typeof N == "object" && N !== null && typeof N.then == "function" && N.then(pl, ul)
        } catch (W) {
            ul(W)
        } finally {
            p !== null && U.types !== null && (p.types = U.types), x.T = p
        }
    }, V.unstable_useCacheRefresh = function () {
        return x.H.useCacheRefresh()
    }, V.use = function (o) {
        return x.H.use(o)
    }, V.useActionState = function (o, p, U) {
        return x.H.useActionState(o, p, U)
    }, V.useCallback = function (o, p) {
        return x.H.useCallback(o, p)
    }, V.useContext = function (o) {
        return x.H.useContext(o)
    }, V.useDebugValue = function () {
    }, V.useDeferredValue = function (o, p) {
        return x.H.useDeferredValue(o, p)
    }, V.useEffect = function (o, p) {
        return x.H.useEffect(o, p)
    }, V.useEffectEvent = function (o) {
        return x.H.useEffectEvent(o)
    }, V.useId = function () {
        return x.H.useId()
    }, V.useImperativeHandle = function (o, p, U) {
        return x.H.useImperativeHandle(o, p, U)
    }, V.useInsertionEffect = function (o, p) {
        return x.H.useInsertionEffect(o, p)
    }, V.useLayoutEffect = function (o, p) {
        return x.H.useLayoutEffect(o, p)
    }, V.useMemo = function (o, p) {
        return x.H.useMemo(o, p)
    }, V.useOptimistic = function (o, p) {
        return x.H.useOptimistic(o, p)
    }, V.useReducer = function (o, p, U) {
        return x.H.useReducer(o, p, U)
    }, V.useRef = function (o) {
        return x.H.useRef(o)
    }, V.useState = function (o) {
        return x.H.useState(o)
    }, V.useSyncExternalStore = function (o, p, U) {
        return x.H.useSyncExternalStore(o, p, U)
    }, V.useTransition = function () {
        return x.H.useTransition()
    }, V.version = "19.2.4", V
}

var py;

function gc() {
    return py || (py = 1, oc.exports = e1()), oc.exports
}

var lt = gc(), yc = {exports: {}}, Ae = {}, mc = {exports: {}}, dc = {};
var Ay;

function n1() {
    return Ay || (Ay = 1, (function (E) {
        function Y(b, _) {
            var Q = b.length;
            b.push(_);
            l:for (; 0 < Q;) {
                var ul = Q - 1 >>> 1, il = b[ul];
                if (0 < R(il, _)) b[ul] = _, b[Q] = il, Q = ul; else break l
            }
        }

        function C(b) {
            return b.length === 0 ? null : b[0]
        }

        function d(b) {
            if (b.length === 0) return null;
            var _ = b[0], Q = b.pop();
            if (Q !== _) {
                b[0] = Q;
                l:for (var ul = 0, il = b.length, o = il >>> 1; ul < o;) {
                    var p = 2 * (ul + 1) - 1, U = b[p], N = p + 1, K = b[N];
                    if (0 > R(U, Q)) N < il && 0 > R(K, U) ? (b[ul] = K, b[N] = Q, ul = N) : (b[ul] = U, b[p] = Q, ul = p); else if (N < il && 0 > R(K, Q)) b[ul] = K, b[N] = Q, ul = N; else break l
                }
            }
            return _
        }

        function R(b, _) {
            var Q = b.sortIndex - _.sortIndex;
            return Q !== 0 ? Q : b.id - _.id
        }

        if (E.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
            var X = performance;
            E.unstable_now = function () {
                return X.now()
            }
        } else {
            var M = Date, P = M.now();
            E.unstable_now = function () {
                return M.now() - P
            }
        }
        var y = [], S = [], L = 1, O = null, j = 3, cl = !1, rl = !1, El = !1, xl = !1,
            Ml = typeof setTimeout == "function" ? setTimeout : null,
            ll = typeof clearTimeout == "function" ? clearTimeout : null,
            bl = typeof setImmediate < "u" ? setImmediate : null;

        function sl(b) {
            for (var _ = C(S); _ !== null;) {
                if (_.callback === null) d(S); else if (_.startTime <= b) d(S), _.sortIndex = _.expirationTime, Y(y, _); else break;
                _ = C(S)
            }
        }

        function ql(b) {
            if (El = !1, sl(b), !rl) if (C(y) !== null) rl = !0, pl || (pl = !0, Ul()); else {
                var _ = C(S);
                _ !== null && Wl(ql, _.startTime - b)
            }
        }

        var pl = !1, x = -1, dl = 5, Fl = -1;

        function St() {
            return xl ? !0 : !(E.unstable_now() - Fl < dl)
        }

        function Xl() {
            if (xl = !1, pl) {
                var b = E.unstable_now();
                Fl = b;
                var _ = !0;
                try {
                    l:{
                        rl = !1, El && (El = !1, ll(x), x = -1), cl = !0;
                        var Q = j;
                        try {
                            t:{
                                for (sl(b), O = C(y); O !== null && !(O.expirationTime > b && St());) {
                                    var ul = O.callback;
                                    if (typeof ul == "function") {
                                        O.callback = null, j = O.priorityLevel;
                                        var il = ul(O.expirationTime <= b);
                                        if (b = E.unstable_now(), typeof il == "function") {
                                            O.callback = il, sl(b), _ = !0;
                                            break t
                                        }
                                        O === C(y) && d(y), sl(b)
                                    } else d(y);
                                    O = C(y)
                                }
                                if (O !== null) _ = !0; else {
                                    var o = C(S);
                                    o !== null && Wl(ql, o.startTime - b), _ = !1
                                }
                            }
                            break l
                        } finally {
                            O = null, j = Q, cl = !1
                        }
                        _ = void 0
                    }
                } finally {
                    _ ? Ul() : pl = !1
                }
            }
        }

        var Ul;
        if (typeof bl == "function") Ul = function () {
            bl(Xl)
        }; else if (typeof MessageChannel < "u") {
            var B = new MessageChannel, al = B.port2;
            B.port1.onmessage = Xl, Ul = function () {
                al.postMessage(null)
            }
        } else Ul = function () {
            Ml(Xl, 0)
        };

        function Wl(b, _) {
            x = Ml(function () {
                b(E.unstable_now())
            }, _)
        }

        E.unstable_IdlePriority = 5, E.unstable_ImmediatePriority = 1, E.unstable_LowPriority = 4, E.unstable_NormalPriority = 3, E.unstable_Profiling = null, E.unstable_UserBlockingPriority = 2, E.unstable_cancelCallback = function (b) {
            b.callback = null
        }, E.unstable_forceFrameRate = function (b) {
            0 > b || 125 < b ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : dl = 0 < b ? Math.floor(1e3 / b) : 5
        }, E.unstable_getCurrentPriorityLevel = function () {
            return j
        }, E.unstable_next = function (b) {
            switch (j) {
                case 1:
                case 2:
                case 3:
                    var _ = 3;
                    break;
                default:
                    _ = j
            }
            var Q = j;
            j = _;
            try {
                return b()
            } finally {
                j = Q
            }
        }, E.unstable_requestPaint = function () {
            xl = !0
        }, E.unstable_runWithPriority = function (b, _) {
            switch (b) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                default:
                    b = 3
            }
            var Q = j;
            j = b;
            try {
                return _()
            } finally {
                j = Q
            }
        }, E.unstable_scheduleCallback = function (b, _, Q) {
            var ul = E.unstable_now();
            switch (typeof Q == "object" && Q !== null ? (Q = Q.delay, Q = typeof Q == "number" && 0 < Q ? ul + Q : ul) : Q = ul, b) {
                case 1:
                    var il = -1;
                    break;
                case 2:
                    il = 250;
                    break;
                case 5:
                    il = 1073741823;
                    break;
                case 4:
                    il = 1e4;
                    break;
                default:
                    il = 5e3
            }
            return il = Q + il, b = {
                id: L++,
                callback: _,
                priorityLevel: b,
                startTime: Q,
                expirationTime: il,
                sortIndex: -1
            }, Q > ul ? (b.sortIndex = Q, Y(S, b), C(y) === null && b === C(S) && (El ? (ll(x), x = -1) : El = !0, Wl(ql, Q - ul))) : (b.sortIndex = il, Y(y, b), rl || cl || (rl = !0, pl || (pl = !0, Ul()))), b
        }, E.unstable_shouldYield = St, E.unstable_wrapCallback = function (b) {
            var _ = j;
            return function () {
                var Q = j;
                j = _;
                try {
                    return b.apply(this, arguments)
                } finally {
                    j = Q
                }
            }
        }
    })(dc)), dc
}

var Ey;

function i1() {
    return Ey || (Ey = 1, mc.exports = n1()), mc.exports
}

var vc = {exports: {}}, $l = {};
var My;

function f1() {
    if (My) return $l;
    My = 1;
    var E = gc();

    function Y(y) {
        var S = "https://react.dev/errors/" + y;
        if (1 < arguments.length) {
            S += "?args[]=" + encodeURIComponent(arguments[1]);
            for (var L = 2; L < arguments.length; L++) S += "&args[]=" + encodeURIComponent(arguments[L])
        }
        return "Minified React error #" + y + "; visit " + S + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }

    function C() {
    }

    var d = {
        d: {
            f: C, r: function () {
                throw Error(Y(522))
            }, D: C, C, L: C, m: C, X: C, S: C, M: C
        }, p: 0, findDOMNode: null
    }, R = Symbol.for("react.portal");

    function X(y, S, L) {
        var O = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        return {$$typeof: R, key: O == null ? null : "" + O, children: y, containerInfo: S, implementation: L}
    }

    var M = E.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

    function P(y, S) {
        if (y === "font") return "";
        if (typeof S == "string") return S === "use-credentials" ? S : ""
    }

    return $l.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = d, $l.createPortal = function (y, S) {
        var L = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!S || S.nodeType !== 1 && S.nodeType !== 9 && S.nodeType !== 11) throw Error(Y(299));
        return X(y, S, null, L)
    }, $l.flushSync = function (y) {
        var S = M.T, L = d.p;
        try {
            if (M.T = null, d.p = 2, y) return y()
        } finally {
            M.T = S, d.p = L, d.d.f()
        }
    }, $l.preconnect = function (y, S) {
        typeof y == "string" && (S ? (S = S.crossOrigin, S = typeof S == "string" ? S === "use-credentials" ? S : "" : void 0) : S = null, d.d.C(y, S))
    }, $l.prefetchDNS = function (y) {
        typeof y == "string" && d.d.D(y)
    }, $l.preinit = function (y, S) {
        if (typeof y == "string" && S && typeof S.as == "string") {
            var L = S.as, O = P(L, S.crossOrigin), j = typeof S.integrity == "string" ? S.integrity : void 0,
                cl = typeof S.fetchPriority == "string" ? S.fetchPriority : void 0;
            L === "style" ? d.d.S(y, typeof S.precedence == "string" ? S.precedence : void 0, {
                crossOrigin: O,
                integrity: j,
                fetchPriority: cl
            }) : L === "script" && d.d.X(y, {
                crossOrigin: O,
                integrity: j,
                fetchPriority: cl,
                nonce: typeof S.nonce == "string" ? S.nonce : void 0
            })
        }
    }, $l.preinitModule = function (y, S) {
        if (typeof y == "string") if (typeof S == "object" && S !== null) {
            if (S.as == null || S.as === "script") {
                var L = P(S.as, S.crossOrigin);
                d.d.M(y, {
                    crossOrigin: L,
                    integrity: typeof S.integrity == "string" ? S.integrity : void 0,
                    nonce: typeof S.nonce == "string" ? S.nonce : void 0
                })
            }
        } else S == null && d.d.M(y)
    }, $l.preload = function (y, S) {
        if (typeof y == "string" && typeof S == "object" && S !== null && typeof S.as == "string") {
            var L = S.as, O = P(L, S.crossOrigin);
            d.d.L(y, L, {
                crossOrigin: O,
                integrity: typeof S.integrity == "string" ? S.integrity : void 0,
                nonce: typeof S.nonce == "string" ? S.nonce : void 0,
                type: typeof S.type == "string" ? S.type : void 0,
                fetchPriority: typeof S.fetchPriority == "string" ? S.fetchPriority : void 0,
                referrerPolicy: typeof S.referrerPolicy == "string" ? S.referrerPolicy : void 0,
                imageSrcSet: typeof S.imageSrcSet == "string" ? S.imageSrcSet : void 0,
                imageSizes: typeof S.imageSizes == "string" ? S.imageSizes : void 0,
                media: typeof S.media == "string" ? S.media : void 0
            })
        }
    }, $l.preloadModule = function (y, S) {
        if (typeof y == "string") if (S) {
            var L = P(S.as, S.crossOrigin);
            d.d.m(y, {
                as: typeof S.as == "string" && S.as !== "script" ? S.as : void 0,
                crossOrigin: L,
                integrity: typeof S.integrity == "string" ? S.integrity : void 0
            })
        } else d.d.m(y)
    }, $l.requestFormReset = function (y) {
        d.d.r(y)
    }, $l.unstable_batchedUpdates = function (y, S) {
        return y(S)
    }, $l.useFormState = function (y, S, L) {
        return M.H.useFormState(y, S, L)
    }, $l.useFormStatus = function () {
        return M.H.useHostTransitionStatus()
    }, $l.version = "19.2.4", $l
}

var _y;

function c1() {
    if (_y) return vc.exports;
    _y = 1;

    function E() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(E)
        } catch (Y) {
            console.error(Y)
        }
    }

    return E(), vc.exports = f1(), vc.exports
}

var Oy;

function s1() {
    if (Oy) return Ae;
    Oy = 1;
    var E = i1(), Y = gc(), C = c1();

    function d(l) {
        var t = "https://react.dev/errors/" + l;
        if (1 < arguments.length) {
            t += "?args[]=" + encodeURIComponent(arguments[1]);
            for (var a = 2; a < arguments.length; a++) t += "&args[]=" + encodeURIComponent(arguments[a])
        }
        return "Minified React error #" + l + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }

    function R(l) {
        return !(!l || l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11)
    }

    function X(l) {
        var t = l, a = l;
        if (l.alternate) for (; t.return;) t = t.return; else {
            l = t;
            do t = l, (t.flags & 4098) !== 0 && (a = t.return), l = t.return; while (l)
        }
        return t.tag === 3 ? a : null
    }

    function M(l) {
        if (l.tag === 13) {
            var t = l.memoizedState;
            if (t === null && (l = l.alternate, l !== null && (t = l.memoizedState)), t !== null) return t.dehydrated
        }
        return null
    }

    function P(l) {
        if (l.tag === 31) {
            var t = l.memoizedState;
            if (t === null && (l = l.alternate, l !== null && (t = l.memoizedState)), t !== null) return t.dehydrated
        }
        return null
    }

    function y(l) {
        if (X(l) !== l) throw Error(d(188))
    }

    function S(l) {
        var t = l.alternate;
        if (!t) {
            if (t = X(l), t === null) throw Error(d(188));
            return t !== l ? null : l
        }
        for (var a = l, u = t; ;) {
            var e = a.return;
            if (e === null) break;
            var n = e.alternate;
            if (n === null) {
                if (u = e.return, u !== null) {
                    a = u;
                    continue
                }
                break
            }
            if (e.child === n.child) {
                for (n = e.child; n;) {
                    if (n === a) return y(e), l;
                    if (n === u) return y(e), t;
                    n = n.sibling
                }
                throw Error(d(188))
            }
            if (a.return !== u.return) a = e, u = n; else {
                for (var i = !1, f = e.child; f;) {
                    if (f === a) {
                        i = !0, a = e, u = n;
                        break
                    }
                    if (f === u) {
                        i = !0, u = e, a = n;
                        break
                    }
                    f = f.sibling
                }
                if (!i) {
                    for (f = n.child; f;) {
                        if (f === a) {
                            i = !0, a = n, u = e;
                            break
                        }
                        if (f === u) {
                            i = !0, u = n, a = e;
                            break
                        }
                        f = f.sibling
                    }
                    if (!i) throw Error(d(189))
                }
            }
            if (a.alternate !== u) throw Error(d(190))
        }
        if (a.tag !== 3) throw Error(d(188));
        return a.stateNode.current === a ? l : t
    }

    function L(l) {
        var t = l.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6) return l;
        for (l = l.child; l !== null;) {
            if (t = L(l), t !== null) return t;
            l = l.sibling
        }
        return null
    }

    var O = Object.assign, j = Symbol.for("react.element"), cl = Symbol.for("react.transitional.element"),
        rl = Symbol.for("react.portal"), El = Symbol.for("react.fragment"), xl = Symbol.for("react.strict_mode"),
        Ml = Symbol.for("react.profiler"), ll = Symbol.for("react.consumer"), bl = Symbol.for("react.context"),
        sl = Symbol.for("react.forward_ref"), ql = Symbol.for("react.suspense"), pl = Symbol.for("react.suspense_list"),
        x = Symbol.for("react.memo"), dl = Symbol.for("react.lazy"), Fl = Symbol.for("react.activity"),
        St = Symbol.for("react.memo_cache_sentinel"), Xl = Symbol.iterator;

    function Ul(l) {
        return l === null || typeof l != "object" ? null : (l = Xl && l[Xl] || l["@@iterator"], typeof l == "function" ? l : null)
    }

    var B = Symbol.for("react.client.reference");

    function al(l) {
        if (l == null) return null;
        if (typeof l == "function") return l.$$typeof === B ? null : l.displayName || l.name || null;
        if (typeof l == "string") return l;
        switch (l) {
            case El:
                return "Fragment";
            case Ml:
                return "Profiler";
            case xl:
                return "StrictMode";
            case ql:
                return "Suspense";
            case pl:
                return "SuspenseList";
            case Fl:
                return "Activity"
        }
        if (typeof l == "object") switch (l.$$typeof) {
            case rl:
                return "Portal";
            case bl:
                return l.displayName || "Context";
            case ll:
                return (l._context.displayName || "Context") + ".Consumer";
            case sl:
                var t = l.render;
                return l = l.displayName, l || (l = t.displayName || t.name || "", l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef"), l;
            case x:
                return t = l.displayName || null, t !== null ? t : al(l.type) || "Memo";
            case dl:
                t = l._payload, l = l._init;
                try {
                    return al(l(t))
                } catch {
                }
        }
        return null
    }

    var Wl = Array.isArray, b = Y.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
        _ = C.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
        Q = {pending: !1, data: null, method: null, action: null}, ul = [], il = -1;

    function o(l) {
        return {current: l}
    }

    function p(l) {
        0 > il || (l.current = ul[il], ul[il] = null, il--)
    }

    function U(l, t) {
        il++, ul[il] = l.current, l.current = t
    }

    var N = o(null), K = o(null), W = o(null), ol = o(null);

    function kl(l, t) {
        switch (U(W, t), U(K, l), U(N, null), t.nodeType) {
            case 9:
            case 11:
                l = (l = t.documentElement) && (l = l.namespaceURI) ? xo(l) : 0;
                break;
            default:
                if (l = t.tagName, t = t.namespaceURI) t = xo(t), l = Lo(t, l); else switch (l) {
                    case"svg":
                        l = 1;
                        break;
                    case"math":
                        l = 2;
                        break;
                    default:
                        l = 0
                }
        }
        p(N), U(N, l)
    }

    function Nl() {
        p(N), p(K), p(W)
    }

    function Uu(l) {
        l.memoizedState !== null && U(ol, l);
        var t = N.current, a = Lo(t, l.type);
        t !== a && (U(K, l), U(N, a))
    }

    function Ee(l) {
        K.current === l && (p(N), p(K)), ol.current === l && (p(ol), Se._currentValue = Q)
    }

    var Vn, rc;

    function Ma(l) {
        if (Vn === void 0) try {
            throw Error()
        } catch (a) {
            var t = a.stack.trim().match(/\n( *(at )?)/);
            Vn = t && t[1] || "", rc = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : ""
        }
        return `
` + Vn + l + rc
    }

    var Kn = !1;

    function Jn(l, t) {
        if (!l || Kn) return "";
        Kn = !0;
        var a = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var u = {
                DetermineComponentFrameRoot: function () {
                    try {
                        if (t) {
                            var A = function () {
                                throw Error()
                            };
                            if (Object.defineProperty(A.prototype, "props", {
                                set: function () {
                                    throw Error()
                                }
                            }), typeof Reflect == "object" && Reflect.construct) {
                                try {
                                    Reflect.construct(A, [])
                                } catch (r) {
                                    var g = r
                                }
                                Reflect.construct(l, [], A)
                            } else {
                                try {
                                    A.call()
                                } catch (r) {
                                    g = r
                                }
                                l.call(A.prototype)
                            }
                        } else {
                            try {
                                throw Error()
                            } catch (r) {
                                g = r
                            }
                            (A = l()) && typeof A.catch == "function" && A.catch(function () {
                            })
                        }
                    } catch (r) {
                        if (r && g && typeof r.stack == "string") return [r.stack, g.stack]
                    }
                    return [null, null]
                }
            };
            u.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var e = Object.getOwnPropertyDescriptor(u.DetermineComponentFrameRoot, "name");
            e && e.configurable && Object.defineProperty(u.DetermineComponentFrameRoot, "name", {value: "DetermineComponentFrameRoot"});
            var n = u.DetermineComponentFrameRoot(), i = n[0], f = n[1];
            if (i && f) {
                var c = i.split(`
`), h = f.split(`
`);
                for (e = u = 0; u < c.length && !c[u].includes("DetermineComponentFrameRoot");) u++;
                for (; e < h.length && !h[e].includes("DetermineComponentFrameRoot");) e++;
                if (u === c.length || e === h.length) for (u = c.length - 1, e = h.length - 1; 1 <= u && 0 <= e && c[u] !== h[e];) e--;
                for (; 1 <= u && 0 <= e; u--, e--) if (c[u] !== h[e]) {
                    if (u !== 1 || e !== 1) do if (u--, e--, 0 > e || c[u] !== h[e]) {
                        var z = `
` + c[u].replace(" at new ", " at ");
                        return l.displayName && z.includes("<anonymous>") && (z = z.replace("<anonymous>", l.displayName)), z
                    } while (1 <= u && 0 <= e);
                    break
                }
            }
        } finally {
            Kn = !1, Error.prepareStackTrace = a
        }
        return (a = l ? l.displayName || l.name : "") ? Ma(a) : ""
    }

    function qy(l, t) {
        switch (l.tag) {
            case 26:
            case 27:
            case 5:
                return Ma(l.type);
            case 16:
                return Ma("Lazy");
            case 13:
                return l.child !== t && t !== null ? Ma("Suspense Fallback") : Ma("Suspense");
            case 19:
                return Ma("SuspenseList");
            case 0:
            case 15:
                return Jn(l.type, !1);
            case 11:
                return Jn(l.type.render, !1);
            case 1:
                return Jn(l.type, !0);
            case 31:
                return Ma("Activity");
            default:
                return ""
        }
    }

    function Sc(l) {
        try {
            var t = "", a = null;
            do t += qy(l, a), a = l, l = l.return; while (l);
            return t
        } catch (u) {
            return `
Error generating stack: ` + u.message + `
` + u.stack
        }
    }

    var wn = Object.prototype.hasOwnProperty, Wn = E.unstable_scheduleCallback, $n = E.unstable_cancelCallback,
        Cy = E.unstable_shouldYield, jy = E.unstable_requestPaint, ct = E.unstable_now,
        By = E.unstable_getCurrentPriorityLevel, bc = E.unstable_ImmediatePriority,
        zc = E.unstable_UserBlockingPriority, Me = E.unstable_NormalPriority, Yy = E.unstable_LowPriority,
        Tc = E.unstable_IdlePriority, Gy = E.log, Xy = E.unstable_setDisableYieldValue, Nu = null, st = null;

    function la(l) {
        if (typeof Gy == "function" && Xy(l), st && typeof st.setStrictMode == "function") try {
            st.setStrictMode(Nu, l)
        } catch {
        }
    }

    var ot = Math.clz32 ? Math.clz32 : xy, Qy = Math.log, Zy = Math.LN2;

    function xy(l) {
        return l >>>= 0, l === 0 ? 32 : 31 - (Qy(l) / Zy | 0) | 0
    }

    var _e = 256, Oe = 262144, De = 4194304;

    function _a(l) {
        var t = l & 42;
        if (t !== 0) return t;
        switch (l & -l) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 4:
                return 4;
            case 8:
                return 8;
            case 16:
                return 16;
            case 32:
                return 32;
            case 64:
                return 64;
            case 128:
                return 128;
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
                return l & 261888;
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return l & 3932160;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
                return l & 62914560;
            case 67108864:
                return 67108864;
            case 134217728:
                return 134217728;
            case 268435456:
                return 268435456;
            case 536870912:
                return 536870912;
            case 1073741824:
                return 0;
            default:
                return l
        }
    }

    function Ue(l, t, a) {
        var u = l.pendingLanes;
        if (u === 0) return 0;
        var e = 0, n = l.suspendedLanes, i = l.pingedLanes;
        l = l.warmLanes;
        var f = u & 134217727;
        return f !== 0 ? (u = f & ~n, u !== 0 ? e = _a(u) : (i &= f, i !== 0 ? e = _a(i) : a || (a = f & ~l, a !== 0 && (e = _a(a))))) : (f = u & ~n, f !== 0 ? e = _a(f) : i !== 0 ? e = _a(i) : a || (a = u & ~l, a !== 0 && (e = _a(a)))), e === 0 ? 0 : t !== 0 && t !== e && (t & n) === 0 && (n = e & -e, a = t & -t, n >= a || n === 32 && (a & 4194048) !== 0) ? t : e
    }

    function Ru(l, t) {
        return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & t) === 0
    }

    function Ly(l, t) {
        switch (l) {
            case 1:
            case 2:
            case 4:
            case 8:
            case 64:
                return t + 250;
            case 16:
            case 32:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return t + 5e3;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
                return -1;
            case 67108864:
            case 134217728:
            case 268435456:
            case 536870912:
            case 1073741824:
                return -1;
            default:
                return -1
        }
    }

    function pc() {
        var l = De;
        return De <<= 1, (De & 62914560) === 0 && (De = 4194304), l
    }

    function Fn(l) {
        for (var t = [], a = 0; 31 > a; a++) t.push(l);
        return t
    }

    function Hu(l, t) {
        l.pendingLanes |= t, t !== 268435456 && (l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0)
    }

    function Vy(l, t, a, u, e, n) {
        var i = l.pendingLanes;
        l.pendingLanes = a, l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0, l.expiredLanes &= a, l.entangledLanes &= a, l.errorRecoveryDisabledLanes &= a, l.shellSuspendCounter = 0;
        var f = l.entanglements, c = l.expirationTimes, h = l.hiddenUpdates;
        for (a = i & ~a; 0 < a;) {
            var z = 31 - ot(a), A = 1 << z;
            f[z] = 0, c[z] = -1;
            var g = h[z];
            if (g !== null) for (h[z] = null, z = 0; z < g.length; z++) {
                var r = g[z];
                r !== null && (r.lane &= -536870913)
            }
            a &= ~A
        }
        u !== 0 && Ac(l, u, 0), n !== 0 && e === 0 && l.tag !== 0 && (l.suspendedLanes |= n & ~(i & ~t))
    }

    function Ac(l, t, a) {
        l.pendingLanes |= t, l.suspendedLanes &= ~t;
        var u = 31 - ot(t);
        l.entangledLanes |= t, l.entanglements[u] = l.entanglements[u] | 1073741824 | a & 261930
    }

    function Ec(l, t) {
        var a = l.entangledLanes |= t;
        for (l = l.entanglements; a;) {
            var u = 31 - ot(a), e = 1 << u;
            e & t | l[u] & t && (l[u] |= t), a &= ~e
        }
    }

    function Mc(l, t) {
        var a = t & -t;
        return a = (a & 42) !== 0 ? 1 : kn(a), (a & (l.suspendedLanes | t)) !== 0 ? 0 : a
    }

    function kn(l) {
        switch (l) {
            case 2:
                l = 1;
                break;
            case 8:
                l = 4;
                break;
            case 32:
                l = 16;
                break;
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
                l = 128;
                break;
            case 268435456:
                l = 134217728;
                break;
            default:
                l = 0
        }
        return l
    }

    function In(l) {
        return l &= -l, 2 < l ? 8 < l ? (l & 134217727) !== 0 ? 32 : 268435456 : 8 : 2
    }

    function _c() {
        var l = _.p;
        return l !== 0 ? l : (l = window.event, l === void 0 ? 32 : my(l.type))
    }

    function Oc(l, t) {
        var a = _.p;
        try {
            return _.p = l, t()
        } finally {
            _.p = a
        }
    }

    var ta = Math.random().toString(36).slice(2), Ll = "__reactFiber$" + ta, tt = "__reactProps$" + ta,
        Ka = "__reactContainer$" + ta, Pn = "__reactEvents$" + ta, Ky = "__reactListeners$" + ta,
        Jy = "__reactHandles$" + ta, Dc = "__reactResources$" + ta, qu = "__reactMarker$" + ta;

    function li(l) {
        delete l[Ll], delete l[tt], delete l[Pn], delete l[Ky], delete l[Jy]
    }

    function Ja(l) {
        var t = l[Ll];
        if (t) return t;
        for (var a = l.parentNode; a;) {
            if (t = a[Ka] || a[Ll]) {
                if (a = t.alternate, t.child !== null || a !== null && a.child !== null) for (l = Fo(l); l !== null;) {
                    if (a = l[Ll]) return a;
                    l = Fo(l)
                }
                return t
            }
            l = a, a = l.parentNode
        }
        return null
    }

    function wa(l) {
        if (l = l[Ll] || l[Ka]) {
            var t = l.tag;
            if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return l
        }
        return null
    }

    function Cu(l) {
        var t = l.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6) return l.stateNode;
        throw Error(d(33))
    }

    function Wa(l) {
        var t = l[Dc];
        return t || (t = l[Dc] = {hoistableStyles: new Map, hoistableScripts: new Map}), t
    }

    function Ql(l) {
        l[qu] = !0
    }

    var Uc = new Set, Nc = {};

    function Oa(l, t) {
        $a(l, t), $a(l + "Capture", t)
    }

    function $a(l, t) {
        for (Nc[l] = t, l = 0; l < t.length; l++) Uc.add(t[l])
    }

    var wy = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),
        Rc = {}, Hc = {};

    function Wy(l) {
        return wn.call(Hc, l) ? !0 : wn.call(Rc, l) ? !1 : wy.test(l) ? Hc[l] = !0 : (Rc[l] = !0, !1)
    }

    function Ne(l, t, a) {
        if (Wy(t)) if (a === null) l.removeAttribute(t); else {
            switch (typeof a) {
                case"undefined":
                case"function":
                case"symbol":
                    l.removeAttribute(t);
                    return;
                case"boolean":
                    var u = t.toLowerCase().slice(0, 5);
                    if (u !== "data-" && u !== "aria-") {
                        l.removeAttribute(t);
                        return
                    }
            }
            l.setAttribute(t, "" + a)
        }
    }

    function Re(l, t, a) {
        if (a === null) l.removeAttribute(t); else {
            switch (typeof a) {
                case"undefined":
                case"function":
                case"symbol":
                case"boolean":
                    l.removeAttribute(t);
                    return
            }
            l.setAttribute(t, "" + a)
        }
    }

    function Bt(l, t, a, u) {
        if (u === null) l.removeAttribute(a); else {
            switch (typeof u) {
                case"undefined":
                case"function":
                case"symbol":
                case"boolean":
                    l.removeAttribute(a);
                    return
            }
            l.setAttributeNS(t, a, "" + u)
        }
    }

    function bt(l) {
        switch (typeof l) {
            case"bigint":
            case"boolean":
            case"number":
            case"string":
            case"undefined":
                return l;
            case"object":
                return l;
            default:
                return ""
        }
    }

    function qc(l) {
        var t = l.type;
        return (l = l.nodeName) && l.toLowerCase() === "input" && (t === "checkbox" || t === "radio")
    }

    function $y(l, t, a) {
        var u = Object.getOwnPropertyDescriptor(l.constructor.prototype, t);
        if (!l.hasOwnProperty(t) && typeof u < "u" && typeof u.get == "function" && typeof u.set == "function") {
            var e = u.get, n = u.set;
            return Object.defineProperty(l, t, {
                configurable: !0, get: function () {
                    return e.call(this)
                }, set: function (i) {
                    a = "" + i, n.call(this, i)
                }
            }), Object.defineProperty(l, t, {enumerable: u.enumerable}), {
                getValue: function () {
                    return a
                }, setValue: function (i) {
                    a = "" + i
                }, stopTracking: function () {
                    l._valueTracker = null, delete l[t]
                }
            }
        }
    }

    function ti(l) {
        if (!l._valueTracker) {
            var t = qc(l) ? "checked" : "value";
            l._valueTracker = $y(l, t, "" + l[t])
        }
    }

    function Cc(l) {
        if (!l) return !1;
        var t = l._valueTracker;
        if (!t) return !0;
        var a = t.getValue(), u = "";
        return l && (u = qc(l) ? l.checked ? "true" : "false" : l.value), l = u, l !== a ? (t.setValue(l), !0) : !1
    }

    function He(l) {
        if (l = l || (typeof document < "u" ? document : void 0), typeof l > "u") return null;
        try {
            return l.activeElement || l.body
        } catch {
            return l.body
        }
    }

    var Fy = /[\n"\\]/g;

    function zt(l) {
        return l.replace(Fy, function (t) {
            return "\\" + t.charCodeAt(0).toString(16) + " "
        })
    }

    function ai(l, t, a, u, e, n, i, f) {
        l.name = "", i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" ? l.type = i : l.removeAttribute("type"), t != null ? i === "number" ? (t === 0 && l.value === "" || l.value != t) && (l.value = "" + bt(t)) : l.value !== "" + bt(t) && (l.value = "" + bt(t)) : i !== "submit" && i !== "reset" || l.removeAttribute("value"), t != null ? ui(l, i, bt(t)) : a != null ? ui(l, i, bt(a)) : u != null && l.removeAttribute("value"), e == null && n != null && (l.defaultChecked = !!n), e != null && (l.checked = e && typeof e != "function" && typeof e != "symbol"), f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? l.name = "" + bt(f) : l.removeAttribute("name")
    }

    function jc(l, t, a, u, e, n, i, f) {
        if (n != null && typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" && (l.type = n), t != null || a != null) {
            if (!(n !== "submit" && n !== "reset" || t != null)) {
                ti(l);
                return
            }
            a = a != null ? "" + bt(a) : "", t = t != null ? "" + bt(t) : a, f || t === l.value || (l.value = t), l.defaultValue = t
        }
        u = u ?? e, u = typeof u != "function" && typeof u != "symbol" && !!u, l.checked = f ? l.checked : !!u, l.defaultChecked = !!u, i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" && (l.name = i), ti(l)
    }

    function ui(l, t, a) {
        t === "number" && He(l.ownerDocument) === l || l.defaultValue === "" + a || (l.defaultValue = "" + a)
    }

    function Fa(l, t, a, u) {
        if (l = l.options, t) {
            t = {};
            for (var e = 0; e < a.length; e++) t["$" + a[e]] = !0;
            for (a = 0; a < l.length; a++) e = t.hasOwnProperty("$" + l[a].value), l[a].selected !== e && (l[a].selected = e), e && u && (l[a].defaultSelected = !0)
        } else {
            for (a = "" + bt(a), t = null, e = 0; e < l.length; e++) {
                if (l[e].value === a) {
                    l[e].selected = !0, u && (l[e].defaultSelected = !0);
                    return
                }
                t !== null || l[e].disabled || (t = l[e])
            }
            t !== null && (t.selected = !0)
        }
    }

    function Bc(l, t, a) {
        if (t != null && (t = "" + bt(t), t !== l.value && (l.value = t), a == null)) {
            l.defaultValue !== t && (l.defaultValue = t);
            return
        }
        l.defaultValue = a != null ? "" + bt(a) : ""
    }

    function Yc(l, t, a, u) {
        if (t == null) {
            if (u != null) {
                if (a != null) throw Error(d(92));
                if (Wl(u)) {
                    if (1 < u.length) throw Error(d(93));
                    u = u[0]
                }
                a = u
            }
            a == null && (a = ""), t = a
        }
        a = bt(t), l.defaultValue = a, u = l.textContent, u === a && u !== "" && u !== null && (l.value = u), ti(l)
    }

    function ka(l, t) {
        if (t) {
            var a = l.firstChild;
            if (a && a === l.lastChild && a.nodeType === 3) {
                a.nodeValue = t;
                return
            }
        }
        l.textContent = t
    }

    var ky = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));

    function Gc(l, t, a) {
        var u = t.indexOf("--") === 0;
        a == null || typeof a == "boolean" || a === "" ? u ? l.setProperty(t, "") : t === "float" ? l.cssFloat = "" : l[t] = "" : u ? l.setProperty(t, a) : typeof a != "number" || a === 0 || ky.has(t) ? t === "float" ? l.cssFloat = a : l[t] = ("" + a).trim() : l[t] = a + "px"
    }

    function Xc(l, t, a) {
        if (t != null && typeof t != "object") throw Error(d(62));
        if (l = l.style, a != null) {
            for (var u in a) !a.hasOwnProperty(u) || t != null && t.hasOwnProperty(u) || (u.indexOf("--") === 0 ? l.setProperty(u, "") : u === "float" ? l.cssFloat = "" : l[u] = "");
            for (var e in t) u = t[e], t.hasOwnProperty(e) && a[e] !== u && Gc(l, e, u)
        } else for (var n in t) t.hasOwnProperty(n) && Gc(l, n, t[n])
    }

    function ei(l) {
        if (l.indexOf("-") === -1) return !1;
        switch (l) {
            case"annotation-xml":
            case"color-profile":
            case"font-face":
            case"font-face-src":
            case"font-face-uri":
            case"font-face-format":
            case"font-face-name":
            case"missing-glyph":
                return !1;
            default:
                return !0
        }
    }

    var Iy = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]),
        Py = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;

    function qe(l) {
        return Py.test("" + l) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : l
    }

    function Yt() {
    }

    var ni = null;

    function ii(l) {
        return l = l.target || l.srcElement || window, l.correspondingUseElement && (l = l.correspondingUseElement), l.nodeType === 3 ? l.parentNode : l
    }

    var Ia = null, Pa = null;

    function Qc(l) {
        var t = wa(l);
        if (t && (l = t.stateNode)) {
            var a = l[tt] || null;
            l:switch (l = t.stateNode, t.type) {
                case"input":
                    if (ai(l, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name), t = a.name, a.type === "radio" && t != null) {
                        for (a = l; a.parentNode;) a = a.parentNode;
                        for (a = a.querySelectorAll('input[name="' + zt("" + t) + '"][type="radio"]'), t = 0; t < a.length; t++) {
                            var u = a[t];
                            if (u !== l && u.form === l.form) {
                                var e = u[tt] || null;
                                if (!e) throw Error(d(90));
                                ai(u, e.value, e.defaultValue, e.defaultValue, e.checked, e.defaultChecked, e.type, e.name)
                            }
                        }
                        for (t = 0; t < a.length; t++) u = a[t], u.form === l.form && Cc(u)
                    }
                    break l;
                case"textarea":
                    Bc(l, a.value, a.defaultValue);
                    break l;
                case"select":
                    t = a.value, t != null && Fa(l, !!a.multiple, t, !1)
            }
        }
    }

    var fi = !1;

    function Zc(l, t, a) {
        if (fi) return l(t, a);
        fi = !0;
        try {
            var u = l(t);
            return u
        } finally {
            if (fi = !1, (Ia !== null || Pa !== null) && (Tn(), Ia && (t = Ia, l = Pa, Pa = Ia = null, Qc(t), l))) for (t = 0; t < l.length; t++) Qc(l[t])
        }
    }

    function ju(l, t) {
        var a = l.stateNode;
        if (a === null) return null;
        var u = a[tt] || null;
        if (u === null) return null;
        a = u[t];
        l:switch (t) {
            case"onClick":
            case"onClickCapture":
            case"onDoubleClick":
            case"onDoubleClickCapture":
            case"onMouseDown":
            case"onMouseDownCapture":
            case"onMouseMove":
            case"onMouseMoveCapture":
            case"onMouseUp":
            case"onMouseUpCapture":
            case"onMouseEnter":
                (u = !u.disabled) || (l = l.type, u = !(l === "button" || l === "input" || l === "select" || l === "textarea")), l = !u;
                break l;
            default:
                l = !1
        }
        if (l) return null;
        if (a && typeof a != "function") throw Error(d(231, t, typeof a));
        return a
    }

    var Gt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"),
        ci = !1;
    if (Gt) try {
        var Bu = {};
        Object.defineProperty(Bu, "passive", {
            get: function () {
                ci = !0
            }
        }), window.addEventListener("test", Bu, Bu), window.removeEventListener("test", Bu, Bu)
    } catch {
        ci = !1
    }
    var aa = null, si = null, Ce = null;

    function xc() {
        if (Ce) return Ce;
        var l, t = si, a = t.length, u, e = "value" in aa ? aa.value : aa.textContent, n = e.length;
        for (l = 0; l < a && t[l] === e[l]; l++) ;
        var i = a - l;
        for (u = 1; u <= i && t[a - u] === e[n - u]; u++) ;
        return Ce = e.slice(l, 1 < u ? 1 - u : void 0)
    }

    function je(l) {
        var t = l.keyCode;
        return "charCode" in l ? (l = l.charCode, l === 0 && t === 13 && (l = 13)) : l = t, l === 10 && (l = 13), 32 <= l || l === 13 ? l : 0
    }

    function Be() {
        return !0
    }

    function Lc() {
        return !1
    }

    function at(l) {
        function t(a, u, e, n, i) {
            this._reactName = a, this._targetInst = e, this.type = u, this.nativeEvent = n, this.target = i, this.currentTarget = null;
            for (var f in l) l.hasOwnProperty(f) && (a = l[f], this[f] = a ? a(n) : n[f]);
            return this.isDefaultPrevented = (n.defaultPrevented != null ? n.defaultPrevented : n.returnValue === !1) ? Be : Lc, this.isPropagationStopped = Lc, this
        }

        return O(t.prototype, {
            preventDefault: function () {
                this.defaultPrevented = !0;
                var a = this.nativeEvent;
                a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = Be)
            }, stopPropagation: function () {
                var a = this.nativeEvent;
                a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = Be)
            }, persist: function () {
            }, isPersistent: Be
        }), t
    }

    var Da = {
            eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function (l) {
                return l.timeStamp || Date.now()
            }, defaultPrevented: 0, isTrusted: 0
        }, Ye = at(Da), Yu = O({}, Da, {view: 0, detail: 0}), lm = at(Yu), oi, yi, Gu, Ge = O({}, Yu, {
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            getModifierState: di,
            button: 0,
            buttons: 0,
            relatedTarget: function (l) {
                return l.relatedTarget === void 0 ? l.fromElement === l.srcElement ? l.toElement : l.fromElement : l.relatedTarget
            },
            movementX: function (l) {
                return "movementX" in l ? l.movementX : (l !== Gu && (Gu && l.type === "mousemove" ? (oi = l.screenX - Gu.screenX, yi = l.screenY - Gu.screenY) : yi = oi = 0, Gu = l), oi)
            },
            movementY: function (l) {
                return "movementY" in l ? l.movementY : yi
            }
        }), Vc = at(Ge), tm = O({}, Ge, {dataTransfer: 0}), am = at(tm), um = O({}, Yu, {relatedTarget: 0}), mi = at(um),
        em = O({}, Da, {animationName: 0, elapsedTime: 0, pseudoElement: 0}), nm = at(em), im = O({}, Da, {
            clipboardData: function (l) {
                return "clipboardData" in l ? l.clipboardData : window.clipboardData
            }
        }), fm = at(im), cm = O({}, Da, {data: 0}), Kc = at(cm), sm = {
            Esc: "Escape",
            Spacebar: " ",
            Left: "ArrowLeft",
            Up: "ArrowUp",
            Right: "ArrowRight",
            Down: "ArrowDown",
            Del: "Delete",
            Win: "OS",
            Menu: "ContextMenu",
            Apps: "ContextMenu",
            Scroll: "ScrollLock",
            MozPrintableKey: "Unidentified"
        }, om = {
            8: "Backspace",
            9: "Tab",
            12: "Clear",
            13: "Enter",
            16: "Shift",
            17: "Control",
            18: "Alt",
            19: "Pause",
            20: "CapsLock",
            27: "Escape",
            32: " ",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "ArrowLeft",
            38: "ArrowUp",
            39: "ArrowRight",
            40: "ArrowDown",
            45: "Insert",
            46: "Delete",
            112: "F1",
            113: "F2",
            114: "F3",
            115: "F4",
            116: "F5",
            117: "F6",
            118: "F7",
            119: "F8",
            120: "F9",
            121: "F10",
            122: "F11",
            123: "F12",
            144: "NumLock",
            145: "ScrollLock",
            224: "Meta"
        }, ym = {Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey"};

    function mm(l) {
        var t = this.nativeEvent;
        return t.getModifierState ? t.getModifierState(l) : (l = ym[l]) ? !!t[l] : !1
    }

    function di() {
        return mm
    }

    var dm = O({}, Yu, {
            key: function (l) {
                if (l.key) {
                    var t = sm[l.key] || l.key;
                    if (t !== "Unidentified") return t
                }
                return l.type === "keypress" ? (l = je(l), l === 13 ? "Enter" : String.fromCharCode(l)) : l.type === "keydown" || l.type === "keyup" ? om[l.keyCode] || "Unidentified" : ""
            },
            code: 0,
            location: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            repeat: 0,
            locale: 0,
            getModifierState: di,
            charCode: function (l) {
                return l.type === "keypress" ? je(l) : 0
            },
            keyCode: function (l) {
                return l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0
            },
            which: function (l) {
                return l.type === "keypress" ? je(l) : l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0
            }
        }), vm = at(dm), hm = O({}, Ge, {
            pointerId: 0,
            width: 0,
            height: 0,
            pressure: 0,
            tangentialPressure: 0,
            tiltX: 0,
            tiltY: 0,
            twist: 0,
            pointerType: 0,
            isPrimary: 0
        }), Jc = at(hm), gm = O({}, Yu, {
            touches: 0,
            targetTouches: 0,
            changedTouches: 0,
            altKey: 0,
            metaKey: 0,
            ctrlKey: 0,
            shiftKey: 0,
            getModifierState: di
        }), rm = at(gm), Sm = O({}, Da, {propertyName: 0, elapsedTime: 0, pseudoElement: 0}), bm = at(Sm), zm = O({}, Ge, {
            deltaX: function (l) {
                return "deltaX" in l ? l.deltaX : "wheelDeltaX" in l ? -l.wheelDeltaX : 0
            }, deltaY: function (l) {
                return "deltaY" in l ? l.deltaY : "wheelDeltaY" in l ? -l.wheelDeltaY : "wheelDelta" in l ? -l.wheelDelta : 0
            }, deltaZ: 0, deltaMode: 0
        }), Tm = at(zm), pm = O({}, Da, {newState: 0, oldState: 0}), Am = at(pm), Em = [9, 13, 27, 32],
        vi = Gt && "CompositionEvent" in window, Xu = null;
    Gt && "documentMode" in document && (Xu = document.documentMode);
    var Mm = Gt && "TextEvent" in window && !Xu, wc = Gt && (!vi || Xu && 8 < Xu && 11 >= Xu), Wc = " ", $c = !1;

    function Fc(l, t) {
        switch (l) {
            case"keyup":
                return Em.indexOf(t.keyCode) !== -1;
            case"keydown":
                return t.keyCode !== 229;
            case"keypress":
            case"mousedown":
            case"focusout":
                return !0;
            default:
                return !1
        }
    }

    function kc(l) {
        return l = l.detail, typeof l == "object" && "data" in l ? l.data : null
    }

    var lu = !1;

    function _m(l, t) {
        switch (l) {
            case"compositionend":
                return kc(t);
            case"keypress":
                return t.which !== 32 ? null : ($c = !0, Wc);
            case"textInput":
                return l = t.data, l === Wc && $c ? null : l;
            default:
                return null
        }
    }

    function Om(l, t) {
        if (lu) return l === "compositionend" || !vi && Fc(l, t) ? (l = xc(), Ce = si = aa = null, lu = !1, l) : null;
        switch (l) {
            case"paste":
                return null;
            case"keypress":
                if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                    if (t.char && 1 < t.char.length) return t.char;
                    if (t.which) return String.fromCharCode(t.which)
                }
                return null;
            case"compositionend":
                return wc && t.locale !== "ko" ? null : t.data;
            default:
                return null
        }
    }

    var Dm = {
        color: !0,
        date: !0,
        datetime: !0,
        "datetime-local": !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };

    function Ic(l) {
        var t = l && l.nodeName && l.nodeName.toLowerCase();
        return t === "input" ? !!Dm[l.type] : t === "textarea"
    }

    function Pc(l, t, a, u) {
        Ia ? Pa ? Pa.push(u) : Pa = [u] : Ia = u, t = Dn(t, "onChange"), 0 < t.length && (a = new Ye("onChange", "change", null, a, u), l.push({
            event: a,
            listeners: t
        }))
    }

    var Qu = null, Zu = null;

    function Um(l) {
        Bo(l, 0)
    }

    function Xe(l) {
        var t = Cu(l);
        if (Cc(t)) return l
    }

    function ls(l, t) {
        if (l === "change") return t
    }

    var ts = !1;
    if (Gt) {
        var hi;
        if (Gt) {
            var gi = "oninput" in document;
            if (!gi) {
                var as = document.createElement("div");
                as.setAttribute("oninput", "return;"), gi = typeof as.oninput == "function"
            }
            hi = gi
        } else hi = !1;
        ts = hi && (!document.documentMode || 9 < document.documentMode)
    }

    function us() {
        Qu && (Qu.detachEvent("onpropertychange", es), Zu = Qu = null)
    }

    function es(l) {
        if (l.propertyName === "value" && Xe(Zu)) {
            var t = [];
            Pc(t, Zu, l, ii(l)), Zc(Um, t)
        }
    }

    function Nm(l, t, a) {
        l === "focusin" ? (us(), Qu = t, Zu = a, Qu.attachEvent("onpropertychange", es)) : l === "focusout" && us()
    }

    function Rm(l) {
        if (l === "selectionchange" || l === "keyup" || l === "keydown") return Xe(Zu)
    }

    function Hm(l, t) {
        if (l === "click") return Xe(t)
    }

    function qm(l, t) {
        if (l === "input" || l === "change") return Xe(t)
    }

    function Cm(l, t) {
        return l === t && (l !== 0 || 1 / l === 1 / t) || l !== l && t !== t
    }

    var yt = typeof Object.is == "function" ? Object.is : Cm;

    function xu(l, t) {
        if (yt(l, t)) return !0;
        if (typeof l != "object" || l === null || typeof t != "object" || t === null) return !1;
        var a = Object.keys(l), u = Object.keys(t);
        if (a.length !== u.length) return !1;
        for (u = 0; u < a.length; u++) {
            var e = a[u];
            if (!wn.call(t, e) || !yt(l[e], t[e])) return !1
        }
        return !0
    }

    function ns(l) {
        for (; l && l.firstChild;) l = l.firstChild;
        return l
    }

    function is(l, t) {
        var a = ns(l);
        l = 0;
        for (var u; a;) {
            if (a.nodeType === 3) {
                if (u = l + a.textContent.length, l <= t && u >= t) return {node: a, offset: t - l};
                l = u
            }
            l:{
                for (; a;) {
                    if (a.nextSibling) {
                        a = a.nextSibling;
                        break l
                    }
                    a = a.parentNode
                }
                a = void 0
            }
            a = ns(a)
        }
    }

    function fs(l, t) {
        return l && t ? l === t ? !0 : l && l.nodeType === 3 ? !1 : t && t.nodeType === 3 ? fs(l, t.parentNode) : "contains" in l ? l.contains(t) : l.compareDocumentPosition ? !!(l.compareDocumentPosition(t) & 16) : !1 : !1
    }

    function cs(l) {
        l = l != null && l.ownerDocument != null && l.ownerDocument.defaultView != null ? l.ownerDocument.defaultView : window;
        for (var t = He(l.document); t instanceof l.HTMLIFrameElement;) {
            try {
                var a = typeof t.contentWindow.location.href == "string"
            } catch {
                a = !1
            }
            if (a) l = t.contentWindow; else break;
            t = He(l.document)
        }
        return t
    }

    function ri(l) {
        var t = l && l.nodeName && l.nodeName.toLowerCase();
        return t && (t === "input" && (l.type === "text" || l.type === "search" || l.type === "tel" || l.type === "url" || l.type === "password") || t === "textarea" || l.contentEditable === "true")
    }

    var jm = Gt && "documentMode" in document && 11 >= document.documentMode, tu = null, Si = null, Lu = null, bi = !1;

    function ss(l, t, a) {
        var u = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
        bi || tu == null || tu !== He(u) || (u = tu, "selectionStart" in u && ri(u) ? u = {
            start: u.selectionStart,
            end: u.selectionEnd
        } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = {
            anchorNode: u.anchorNode,
            anchorOffset: u.anchorOffset,
            focusNode: u.focusNode,
            focusOffset: u.focusOffset
        }), Lu && xu(Lu, u) || (Lu = u, u = Dn(Si, "onSelect"), 0 < u.length && (t = new Ye("onSelect", "select", null, t, a), l.push({
            event: t,
            listeners: u
        }), t.target = tu)))
    }

    function Ua(l, t) {
        var a = {};
        return a[l.toLowerCase()] = t.toLowerCase(), a["Webkit" + l] = "webkit" + t, a["Moz" + l] = "moz" + t, a
    }

    var au = {
        animationend: Ua("Animation", "AnimationEnd"),
        animationiteration: Ua("Animation", "AnimationIteration"),
        animationstart: Ua("Animation", "AnimationStart"),
        transitionrun: Ua("Transition", "TransitionRun"),
        transitionstart: Ua("Transition", "TransitionStart"),
        transitioncancel: Ua("Transition", "TransitionCancel"),
        transitionend: Ua("Transition", "TransitionEnd")
    }, zi = {}, os = {};
    Gt && (os = document.createElement("div").style, "AnimationEvent" in window || (delete au.animationend.animation, delete au.animationiteration.animation, delete au.animationstart.animation), "TransitionEvent" in window || delete au.transitionend.transition);

    function Na(l) {
        if (zi[l]) return zi[l];
        if (!au[l]) return l;
        var t = au[l], a;
        for (a in t) if (t.hasOwnProperty(a) && a in os) return zi[l] = t[a];
        return l
    }

    var ys = Na("animationend"), ms = Na("animationiteration"), ds = Na("animationstart"), Bm = Na("transitionrun"),
        Ym = Na("transitionstart"), Gm = Na("transitioncancel"), vs = Na("transitionend"), hs = new Map,
        Ti = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    Ti.push("scrollEnd");

    function Ut(l, t) {
        hs.set(l, t), Oa(t, [l])
    }

    var Qe = typeof reportError == "function" ? reportError : function (l) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var t = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message: typeof l == "object" && l !== null && typeof l.message == "string" ? String(l.message) : String(l),
                error: l
            });
            if (!window.dispatchEvent(t)) return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", l);
            return
        }
        console.error(l)
    }, Tt = [], uu = 0, pi = 0;

    function Ze() {
        for (var l = uu, t = pi = uu = 0; t < l;) {
            var a = Tt[t];
            Tt[t++] = null;
            var u = Tt[t];
            Tt[t++] = null;
            var e = Tt[t];
            Tt[t++] = null;
            var n = Tt[t];
            if (Tt[t++] = null, u !== null && e !== null) {
                var i = u.pending;
                i === null ? e.next = e : (e.next = i.next, i.next = e), u.pending = e
            }
            n !== 0 && gs(a, e, n)
        }
    }

    function xe(l, t, a, u) {
        Tt[uu++] = l, Tt[uu++] = t, Tt[uu++] = a, Tt[uu++] = u, pi |= u, l.lanes |= u, l = l.alternate, l !== null && (l.lanes |= u)
    }

    function Ai(l, t, a, u) {
        return xe(l, t, a, u), Le(l)
    }

    function Ra(l, t) {
        return xe(l, null, null, t), Le(l)
    }

    function gs(l, t, a) {
        l.lanes |= a;
        var u = l.alternate;
        u !== null && (u.lanes |= a);
        for (var e = !1, n = l.return; n !== null;) n.childLanes |= a, u = n.alternate, u !== null && (u.childLanes |= a), n.tag === 22 && (l = n.stateNode, l === null || l._visibility & 1 || (e = !0)), l = n, n = n.return;
        return l.tag === 3 ? (n = l.stateNode, e && t !== null && (e = 31 - ot(a), l = n.hiddenUpdates, u = l[e], u === null ? l[e] = [t] : u.push(t), t.lane = a | 536870912), n) : null
    }

    function Le(l) {
        if (50 < ye) throw ye = 0, qf = null, Error(d(185));
        for (var t = l.return; t !== null;) l = t, t = l.return;
        return l.tag === 3 ? l.stateNode : null
    }

    var eu = {};

    function Xm(l, t, a, u) {
        this.tag = l, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null
    }

    function mt(l, t, a, u) {
        return new Xm(l, t, a, u)
    }

    function Ei(l) {
        return l = l.prototype, !(!l || !l.isReactComponent)
    }

    function Xt(l, t) {
        var a = l.alternate;
        return a === null ? (a = mt(l.tag, t, l.key, l.mode), a.elementType = l.elementType, a.type = l.type, a.stateNode = l.stateNode, a.alternate = l, l.alternate = a) : (a.pendingProps = t, a.type = l.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = l.flags & 65011712, a.childLanes = l.childLanes, a.lanes = l.lanes, a.child = l.child, a.memoizedProps = l.memoizedProps, a.memoizedState = l.memoizedState, a.updateQueue = l.updateQueue, t = l.dependencies, a.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        }, a.sibling = l.sibling, a.index = l.index, a.ref = l.ref, a.refCleanup = l.refCleanup, a
    }

    function rs(l, t) {
        l.flags &= 65011714;
        var a = l.alternate;
        return a === null ? (l.childLanes = 0, l.lanes = t, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = a.childLanes, l.lanes = a.lanes, l.child = a.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = a.memoizedProps, l.memoizedState = a.memoizedState, l.updateQueue = a.updateQueue, l.type = a.type, t = a.dependencies, l.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        }), l
    }

    function Ve(l, t, a, u, e, n) {
        var i = 0;
        if (u = l, typeof l == "function") Ei(l) && (i = 1); else if (typeof l == "string") i = Vd(l, a, N.current) ? 26 : l === "html" || l === "head" || l === "body" ? 27 : 5; else l:switch (l) {
            case Fl:
                return l = mt(31, a, t, e), l.elementType = Fl, l.lanes = n, l;
            case El:
                return Ha(a.children, e, n, t);
            case xl:
                i = 8, e |= 24;
                break;
            case Ml:
                return l = mt(12, a, t, e | 2), l.elementType = Ml, l.lanes = n, l;
            case ql:
                return l = mt(13, a, t, e), l.elementType = ql, l.lanes = n, l;
            case pl:
                return l = mt(19, a, t, e), l.elementType = pl, l.lanes = n, l;
            default:
                if (typeof l == "object" && l !== null) switch (l.$$typeof) {
                    case bl:
                        i = 10;
                        break l;
                    case ll:
                        i = 9;
                        break l;
                    case sl:
                        i = 11;
                        break l;
                    case x:
                        i = 14;
                        break l;
                    case dl:
                        i = 16, u = null;
                        break l
                }
                i = 29, a = Error(d(130, l === null ? "null" : typeof l, "")), u = null
        }
        return t = mt(i, a, t, e), t.elementType = l, t.type = u, t.lanes = n, t
    }

    function Ha(l, t, a, u) {
        return l = mt(7, l, u, t), l.lanes = a, l
    }

    function Mi(l, t, a) {
        return l = mt(6, l, null, t), l.lanes = a, l
    }

    function Ss(l) {
        var t = mt(18, null, null, 0);
        return t.stateNode = l, t
    }

    function _i(l, t, a) {
        return t = mt(4, l.children !== null ? l.children : [], l.key, t), t.lanes = a, t.stateNode = {
            containerInfo: l.containerInfo,
            pendingChildren: null,
            implementation: l.implementation
        }, t
    }

    var bs = new WeakMap;

    function pt(l, t) {
        if (typeof l == "object" && l !== null) {
            var a = bs.get(l);
            return a !== void 0 ? a : (t = {value: l, source: t, stack: Sc(t)}, bs.set(l, t), t)
        }
        return {value: l, source: t, stack: Sc(t)}
    }

    var nu = [], iu = 0, Ke = null, Vu = 0, At = [], Et = 0, ua = null, Ht = 1, qt = "";

    function Qt(l, t) {
        nu[iu++] = Vu, nu[iu++] = Ke, Ke = l, Vu = t
    }

    function zs(l, t, a) {
        At[Et++] = Ht, At[Et++] = qt, At[Et++] = ua, ua = l;
        var u = Ht;
        l = qt;
        var e = 32 - ot(u) - 1;
        u &= ~(1 << e), a += 1;
        var n = 32 - ot(t) + e;
        if (30 < n) {
            var i = e - e % 5;
            n = (u & (1 << i) - 1).toString(32), u >>= i, e -= i, Ht = 1 << 32 - ot(t) + e | a << e | u, qt = n + l
        } else Ht = 1 << n | a << e | u, qt = l
    }

    function Oi(l) {
        l.return !== null && (Qt(l, 1), zs(l, 1, 0))
    }

    function Di(l) {
        for (; l === Ke;) Ke = nu[--iu], nu[iu] = null, Vu = nu[--iu], nu[iu] = null;
        for (; l === ua;) ua = At[--Et], At[Et] = null, qt = At[--Et], At[Et] = null, Ht = At[--Et], At[Et] = null
    }

    function Ts(l, t) {
        At[Et++] = Ht, At[Et++] = qt, At[Et++] = ua, Ht = t.id, qt = t.overflow, ua = l
    }

    var Vl = null, zl = null, tl = !1, ea = null, Mt = !1, Ui = Error(d(519));

    function na(l) {
        var t = Error(d(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""));
        throw Ku(pt(t, l)), Ui
    }

    function ps(l) {
        var t = l.stateNode, a = l.type, u = l.memoizedProps;
        switch (t[Ll] = l, t[tt] = u, a) {
            case"dialog":
                F("cancel", t), F("close", t);
                break;
            case"iframe":
            case"object":
            case"embed":
                F("load", t);
                break;
            case"video":
            case"audio":
                for (a = 0; a < de.length; a++) F(de[a], t);
                break;
            case"source":
                F("error", t);
                break;
            case"img":
            case"image":
            case"link":
                F("error", t), F("load", t);
                break;
            case"details":
                F("toggle", t);
                break;
            case"input":
                F("invalid", t), jc(t, u.value, u.defaultValue, u.checked, u.defaultChecked, u.type, u.name, !0);
                break;
            case"select":
                F("invalid", t);
                break;
            case"textarea":
                F("invalid", t), Yc(t, u.value, u.defaultValue, u.children)
        }
        a = u.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || u.suppressHydrationWarning === !0 || Qo(t.textContent, a) ? (u.popover != null && (F("beforetoggle", t), F("toggle", t)), u.onScroll != null && F("scroll", t), u.onScrollEnd != null && F("scrollend", t), u.onClick != null && (t.onclick = Yt), t = !0) : t = !1, t || na(l, !0)
    }

    function As(l) {
        for (Vl = l.return; Vl;) switch (Vl.tag) {
            case 5:
            case 31:
            case 13:
                Mt = !1;
                return;
            case 27:
            case 3:
                Mt = !0;
                return;
            default:
                Vl = Vl.return
        }
    }

    function fu(l) {
        if (l !== Vl) return !1;
        if (!tl) return As(l), tl = !0, !1;
        var t = l.tag, a;
        if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = l.type, a = !(a !== "form" && a !== "button") || Wf(l.type, l.memoizedProps)), a = !a), a && zl && na(l), As(l), t === 13) {
            if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(d(317));
            zl = $o(l)
        } else if (t === 31) {
            if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(d(317));
            zl = $o(l)
        } else t === 27 ? (t = zl, ba(l.type) ? (l = Pf, Pf = null, zl = l) : zl = t) : zl = Vl ? Ot(l.stateNode.nextSibling) : null;
        return !0
    }

    function qa() {
        zl = Vl = null, tl = !1
    }

    function Ni() {
        var l = ea;
        return l !== null && (it === null ? it = l : it.push.apply(it, l), ea = null), l
    }

    function Ku(l) {
        ea === null ? ea = [l] : ea.push(l)
    }

    var Ri = o(null), Ca = null, Zt = null;

    function ia(l, t, a) {
        U(Ri, t._currentValue), t._currentValue = a
    }

    function xt(l) {
        l._currentValue = Ri.current, p(Ri)
    }

    function Hi(l, t, a) {
        for (; l !== null;) {
            var u = l.alternate;
            if ((l.childLanes & t) !== t ? (l.childLanes |= t, u !== null && (u.childLanes |= t)) : u !== null && (u.childLanes & t) !== t && (u.childLanes |= t), l === a) break;
            l = l.return
        }
    }

    function qi(l, t, a, u) {
        var e = l.child;
        for (e !== null && (e.return = l); e !== null;) {
            var n = e.dependencies;
            if (n !== null) {
                var i = e.child;
                n = n.firstContext;
                l:for (; n !== null;) {
                    var f = n;
                    n = e;
                    for (var c = 0; c < t.length; c++) if (f.context === t[c]) {
                        n.lanes |= a, f = n.alternate, f !== null && (f.lanes |= a), Hi(n.return, a, l), u || (i = null);
                        break l
                    }
                    n = f.next
                }
            } else if (e.tag === 18) {
                if (i = e.return, i === null) throw Error(d(341));
                i.lanes |= a, n = i.alternate, n !== null && (n.lanes |= a), Hi(i, a, l), i = null
            } else i = e.child;
            if (i !== null) i.return = e; else for (i = e; i !== null;) {
                if (i === l) {
                    i = null;
                    break
                }
                if (e = i.sibling, e !== null) {
                    e.return = i.return, i = e;
                    break
                }
                i = i.return
            }
            e = i
        }
    }

    function cu(l, t, a, u) {
        l = null;
        for (var e = t, n = !1; e !== null;) {
            if (!n) {
                if ((e.flags & 524288) !== 0) n = !0; else if ((e.flags & 262144) !== 0) break
            }
            if (e.tag === 10) {
                var i = e.alternate;
                if (i === null) throw Error(d(387));
                if (i = i.memoizedProps, i !== null) {
                    var f = e.type;
                    yt(e.pendingProps.value, i.value) || (l !== null ? l.push(f) : l = [f])
                }
            } else if (e === ol.current) {
                if (i = e.alternate, i === null) throw Error(d(387));
                i.memoizedState.memoizedState !== e.memoizedState.memoizedState && (l !== null ? l.push(Se) : l = [Se])
            }
            e = e.return
        }
        l !== null && qi(t, l, a, u), t.flags |= 262144
    }

    function Je(l) {
        for (l = l.firstContext; l !== null;) {
            if (!yt(l.context._currentValue, l.memoizedValue)) return !0;
            l = l.next
        }
        return !1
    }

    function ja(l) {
        Ca = l, Zt = null, l = l.dependencies, l !== null && (l.firstContext = null)
    }

    function Kl(l) {
        return Es(Ca, l)
    }

    function we(l, t) {
        return Ca === null && ja(l), Es(l, t)
    }

    function Es(l, t) {
        var a = t._currentValue;
        if (t = {context: t, memoizedValue: a, next: null}, Zt === null) {
            if (l === null) throw Error(d(308));
            Zt = t, l.dependencies = {lanes: 0, firstContext: t}, l.flags |= 524288
        } else Zt = Zt.next = t;
        return a
    }

    var Qm = typeof AbortController < "u" ? AbortController : function () {
            var l = [], t = this.signal = {
                aborted: !1, addEventListener: function (a, u) {
                    l.push(u)
                }
            };
            this.abort = function () {
                t.aborted = !0, l.forEach(function (a) {
                    return a()
                })
            }
        }, Zm = E.unstable_scheduleCallback, xm = E.unstable_NormalPriority,
        Cl = {$$typeof: bl, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0};

    function Ci() {
        return {controller: new Qm, data: new Map, refCount: 0}
    }

    function Ju(l) {
        l.refCount--, l.refCount === 0 && Zm(xm, function () {
            l.controller.abort()
        })
    }

    var wu = null, ji = 0, su = 0, ou = null;

    function Lm(l, t) {
        if (wu === null) {
            var a = wu = [];
            ji = 0, su = Xf(), ou = {
                status: "pending", value: void 0, then: function (u) {
                    a.push(u)
                }
            }
        }
        return ji++, t.then(Ms, Ms), t
    }

    function Ms() {
        if (--ji === 0 && wu !== null) {
            ou !== null && (ou.status = "fulfilled");
            var l = wu;
            wu = null, su = 0, ou = null;
            for (var t = 0; t < l.length; t++) (0, l[t])()
        }
    }

    function Vm(l, t) {
        var a = [], u = {
            status: "pending", value: null, reason: null, then: function (e) {
                a.push(e)
            }
        };
        return l.then(function () {
            u.status = "fulfilled", u.value = t;
            for (var e = 0; e < a.length; e++) (0, a[e])(t)
        }, function (e) {
            for (u.status = "rejected", u.reason = e, e = 0; e < a.length; e++) (0, a[e])(void 0)
        }), u
    }

    var _s = b.S;
    b.S = function (l, t) {
        so = ct(), typeof t == "object" && t !== null && typeof t.then == "function" && Lm(l, t), _s !== null && _s(l, t)
    };
    var Ba = o(null);

    function Bi() {
        var l = Ba.current;
        return l !== null ? l : Sl.pooledCache
    }

    function We(l, t) {
        t === null ? U(Ba, Ba.current) : U(Ba, t.pool)
    }

    function Os() {
        var l = Bi();
        return l === null ? null : {parent: Cl._currentValue, pool: l}
    }

    var yu = Error(d(460)), Yi = Error(d(474)), $e = Error(d(542)), Fe = {
        then: function () {
        }
    };

    function Ds(l) {
        return l = l.status, l === "fulfilled" || l === "rejected"
    }

    function Us(l, t, a) {
        switch (a = l[a], a === void 0 ? l.push(t) : a !== t && (t.then(Yt, Yt), t = a), t.status) {
            case"fulfilled":
                return t.value;
            case"rejected":
                throw l = t.reason, Rs(l), l;
            default:
                if (typeof t.status == "string") t.then(Yt, Yt); else {
                    if (l = Sl, l !== null && 100 < l.shellSuspendCounter) throw Error(d(482));
                    l = t, l.status = "pending", l.then(function (u) {
                        if (t.status === "pending") {
                            var e = t;
                            e.status = "fulfilled", e.value = u
                        }
                    }, function (u) {
                        if (t.status === "pending") {
                            var e = t;
                            e.status = "rejected", e.reason = u
                        }
                    })
                }
                switch (t.status) {
                    case"fulfilled":
                        return t.value;
                    case"rejected":
                        throw l = t.reason, Rs(l), l
                }
                throw Ga = t, yu
        }
    }

    function Ya(l) {
        try {
            var t = l._init;
            return t(l._payload)
        } catch (a) {
            throw a !== null && typeof a == "object" && typeof a.then == "function" ? (Ga = a, yu) : a
        }
    }

    var Ga = null;

    function Ns() {
        if (Ga === null) throw Error(d(459));
        var l = Ga;
        return Ga = null, l
    }

    function Rs(l) {
        if (l === yu || l === $e) throw Error(d(483))
    }

    var mu = null, Wu = 0;

    function ke(l) {
        var t = Wu;
        return Wu += 1, mu === null && (mu = []), Us(mu, l, t)
    }

    function $u(l, t) {
        t = t.props.ref, l.ref = t !== void 0 ? t : null
    }

    function Ie(l, t) {
        throw t.$$typeof === j ? Error(d(525)) : (l = Object.prototype.toString.call(t), Error(d(31, l === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : l)))
    }

    function Hs(l) {
        function t(m, s) {
            if (l) {
                var v = m.deletions;
                v === null ? (m.deletions = [s], m.flags |= 16) : v.push(s)
            }
        }

        function a(m, s) {
            if (!l) return null;
            for (; s !== null;) t(m, s), s = s.sibling;
            return null
        }

        function u(m) {
            for (var s = new Map; m !== null;) m.key !== null ? s.set(m.key, m) : s.set(m.index, m), m = m.sibling;
            return s
        }

        function e(m, s) {
            return m = Xt(m, s), m.index = 0, m.sibling = null, m
        }

        function n(m, s, v) {
            return m.index = v, l ? (v = m.alternate, v !== null ? (v = v.index, v < s ? (m.flags |= 67108866, s) : v) : (m.flags |= 67108866, s)) : (m.flags |= 1048576, s)
        }

        function i(m) {
            return l && m.alternate === null && (m.flags |= 67108866), m
        }

        function f(m, s, v, T) {
            return s === null || s.tag !== 6 ? (s = Mi(v, m.mode, T), s.return = m, s) : (s = e(s, v), s.return = m, s)
        }

        function c(m, s, v, T) {
            var G = v.type;
            return G === El ? z(m, s, v.props.children, T, v.key) : s !== null && (s.elementType === G || typeof G == "object" && G !== null && G.$$typeof === dl && Ya(G) === s.type) ? (s = e(s, v.props), $u(s, v), s.return = m, s) : (s = Ve(v.type, v.key, v.props, null, m.mode, T), $u(s, v), s.return = m, s)
        }

        function h(m, s, v, T) {
            return s === null || s.tag !== 4 || s.stateNode.containerInfo !== v.containerInfo || s.stateNode.implementation !== v.implementation ? (s = _i(v, m.mode, T), s.return = m, s) : (s = e(s, v.children || []), s.return = m, s)
        }

        function z(m, s, v, T, G) {
            return s === null || s.tag !== 7 ? (s = Ha(v, m.mode, T, G), s.return = m, s) : (s = e(s, v), s.return = m, s)
        }

        function A(m, s, v) {
            if (typeof s == "string" && s !== "" || typeof s == "number" || typeof s == "bigint") return s = Mi("" + s, m.mode, v), s.return = m, s;
            if (typeof s == "object" && s !== null) {
                switch (s.$$typeof) {
                    case cl:
                        return v = Ve(s.type, s.key, s.props, null, m.mode, v), $u(v, s), v.return = m, v;
                    case rl:
                        return s = _i(s, m.mode, v), s.return = m, s;
                    case dl:
                        return s = Ya(s), A(m, s, v)
                }
                if (Wl(s) || Ul(s)) return s = Ha(s, m.mode, v, null), s.return = m, s;
                if (typeof s.then == "function") return A(m, ke(s), v);
                if (s.$$typeof === bl) return A(m, we(m, s), v);
                Ie(m, s)
            }
            return null
        }

        function g(m, s, v, T) {
            var G = s !== null ? s.key : null;
            if (typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint") return G !== null ? null : f(m, s, "" + v, T);
            if (typeof v == "object" && v !== null) {
                switch (v.$$typeof) {
                    case cl:
                        return v.key === G ? c(m, s, v, T) : null;
                    case rl:
                        return v.key === G ? h(m, s, v, T) : null;
                    case dl:
                        return v = Ya(v), g(m, s, v, T)
                }
                if (Wl(v) || Ul(v)) return G !== null ? null : z(m, s, v, T, null);
                if (typeof v.then == "function") return g(m, s, ke(v), T);
                if (v.$$typeof === bl) return g(m, s, we(m, v), T);
                Ie(m, v)
            }
            return null
        }

        function r(m, s, v, T, G) {
            if (typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint") return m = m.get(v) || null, f(s, m, "" + T, G);
            if (typeof T == "object" && T !== null) {
                switch (T.$$typeof) {
                    case cl:
                        return m = m.get(T.key === null ? v : T.key) || null, c(s, m, T, G);
                    case rl:
                        return m = m.get(T.key === null ? v : T.key) || null, h(s, m, T, G);
                    case dl:
                        return T = Ya(T), r(m, s, v, T, G)
                }
                if (Wl(T) || Ul(T)) return m = m.get(v) || null, z(s, m, T, G, null);
                if (typeof T.then == "function") return r(m, s, v, ke(T), G);
                if (T.$$typeof === bl) return r(m, s, v, we(s, T), G);
                Ie(s, T)
            }
            return null
        }

        function H(m, s, v, T) {
            for (var G = null, el = null, q = s, w = s = 0, I = null; q !== null && w < v.length; w++) {
                q.index > w ? (I = q, q = null) : I = q.sibling;
                var nl = g(m, q, v[w], T);
                if (nl === null) {
                    q === null && (q = I);
                    break
                }
                l && q && nl.alternate === null && t(m, q), s = n(nl, s, w), el === null ? G = nl : el.sibling = nl, el = nl, q = I
            }
            if (w === v.length) return a(m, q), tl && Qt(m, w), G;
            if (q === null) {
                for (; w < v.length; w++) q = A(m, v[w], T), q !== null && (s = n(q, s, w), el === null ? G = q : el.sibling = q, el = q);
                return tl && Qt(m, w), G
            }
            for (q = u(q); w < v.length; w++) I = r(q, m, w, v[w], T), I !== null && (l && I.alternate !== null && q.delete(I.key === null ? w : I.key), s = n(I, s, w), el === null ? G = I : el.sibling = I, el = I);
            return l && q.forEach(function (Ea) {
                return t(m, Ea)
            }), tl && Qt(m, w), G
        }

        function Z(m, s, v, T) {
            if (v == null) throw Error(d(151));
            for (var G = null, el = null, q = s, w = s = 0, I = null, nl = v.next(); q !== null && !nl.done; w++, nl = v.next()) {
                q.index > w ? (I = q, q = null) : I = q.sibling;
                var Ea = g(m, q, nl.value, T);
                if (Ea === null) {
                    q === null && (q = I);
                    break
                }
                l && q && Ea.alternate === null && t(m, q), s = n(Ea, s, w), el === null ? G = Ea : el.sibling = Ea, el = Ea, q = I
            }
            if (nl.done) return a(m, q), tl && Qt(m, w), G;
            if (q === null) {
                for (; !nl.done; w++, nl = v.next()) nl = A(m, nl.value, T), nl !== null && (s = n(nl, s, w), el === null ? G = nl : el.sibling = nl, el = nl);
                return tl && Qt(m, w), G
            }
            for (q = u(q); !nl.done; w++, nl = v.next()) nl = r(q, m, w, nl.value, T), nl !== null && (l && nl.alternate !== null && q.delete(nl.key === null ? w : nl.key), s = n(nl, s, w), el === null ? G = nl : el.sibling = nl, el = nl);
            return l && q.forEach(function (t1) {
                return t(m, t1)
            }), tl && Qt(m, w), G
        }

        function gl(m, s, v, T) {
            if (typeof v == "object" && v !== null && v.type === El && v.key === null && (v = v.props.children), typeof v == "object" && v !== null) {
                switch (v.$$typeof) {
                    case cl:
                        l:{
                            for (var G = v.key; s !== null;) {
                                if (s.key === G) {
                                    if (G = v.type, G === El) {
                                        if (s.tag === 7) {
                                            a(m, s.sibling), T = e(s, v.props.children), T.return = m, m = T;
                                            break l
                                        }
                                    } else if (s.elementType === G || typeof G == "object" && G !== null && G.$$typeof === dl && Ya(G) === s.type) {
                                        a(m, s.sibling), T = e(s, v.props), $u(T, v), T.return = m, m = T;
                                        break l
                                    }
                                    a(m, s);
                                    break
                                } else t(m, s);
                                s = s.sibling
                            }
                            v.type === El ? (T = Ha(v.props.children, m.mode, T, v.key), T.return = m, m = T) : (T = Ve(v.type, v.key, v.props, null, m.mode, T), $u(T, v), T.return = m, m = T)
                        }
                        return i(m);
                    case rl:
                        l:{
                            for (G = v.key; s !== null;) {
                                if (s.key === G) if (s.tag === 4 && s.stateNode.containerInfo === v.containerInfo && s.stateNode.implementation === v.implementation) {
                                    a(m, s.sibling), T = e(s, v.children || []), T.return = m, m = T;
                                    break l
                                } else {
                                    a(m, s);
                                    break
                                } else t(m, s);
                                s = s.sibling
                            }
                            T = _i(v, m.mode, T), T.return = m, m = T
                        }
                        return i(m);
                    case dl:
                        return v = Ya(v), gl(m, s, v, T)
                }
                if (Wl(v)) return H(m, s, v, T);
                if (Ul(v)) {
                    if (G = Ul(v), typeof G != "function") throw Error(d(150));
                    return v = G.call(v), Z(m, s, v, T)
                }
                if (typeof v.then == "function") return gl(m, s, ke(v), T);
                if (v.$$typeof === bl) return gl(m, s, we(m, v), T);
                Ie(m, v)
            }
            return typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint" ? (v = "" + v, s !== null && s.tag === 6 ? (a(m, s.sibling), T = e(s, v), T.return = m, m = T) : (a(m, s), T = Mi(v, m.mode, T), T.return = m, m = T), i(m)) : a(m, s)
        }

        return function (m, s, v, T) {
            try {
                Wu = 0;
                var G = gl(m, s, v, T);
                return mu = null, G
            } catch (q) {
                if (q === yu || q === $e) throw q;
                var el = mt(29, q, null, m.mode);
                return el.lanes = T, el.return = m, el
            }
        }
    }

    var Xa = Hs(!0), qs = Hs(!1), fa = !1;

    function Gi(l) {
        l.updateQueue = {
            baseState: l.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {pending: null, lanes: 0, hiddenCallbacks: null},
            callbacks: null
        }
    }

    function Xi(l, t) {
        l = l.updateQueue, t.updateQueue === l && (t.updateQueue = {
            baseState: l.baseState,
            firstBaseUpdate: l.firstBaseUpdate,
            lastBaseUpdate: l.lastBaseUpdate,
            shared: l.shared,
            callbacks: null
        })
    }

    function ca(l) {
        return {lane: l, tag: 0, payload: null, callback: null, next: null}
    }

    function sa(l, t, a) {
        var u = l.updateQueue;
        if (u === null) return null;
        if (u = u.shared, (fl & 2) !== 0) {
            var e = u.pending;
            return e === null ? t.next = t : (t.next = e.next, e.next = t), u.pending = t, t = Le(l), gs(l, null, a), t
        }
        return xe(l, u, t, a), Le(l)
    }

    function Fu(l, t, a) {
        if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
            var u = t.lanes;
            u &= l.pendingLanes, a |= u, t.lanes = a, Ec(l, a)
        }
    }

    function Qi(l, t) {
        var a = l.updateQueue, u = l.alternate;
        if (u !== null && (u = u.updateQueue, a === u)) {
            var e = null, n = null;
            if (a = a.firstBaseUpdate, a !== null) {
                do {
                    var i = {lane: a.lane, tag: a.tag, payload: a.payload, callback: null, next: null};
                    n === null ? e = n = i : n = n.next = i, a = a.next
                } while (a !== null);
                n === null ? e = n = t : n = n.next = t
            } else e = n = t;
            a = {
                baseState: u.baseState,
                firstBaseUpdate: e,
                lastBaseUpdate: n,
                shared: u.shared,
                callbacks: u.callbacks
            }, l.updateQueue = a;
            return
        }
        l = a.lastBaseUpdate, l === null ? a.firstBaseUpdate = t : l.next = t, a.lastBaseUpdate = t
    }

    var Zi = !1;

    function ku() {
        if (Zi) {
            var l = ou;
            if (l !== null) throw l
        }
    }

    function Iu(l, t, a, u) {
        Zi = !1;
        var e = l.updateQueue;
        fa = !1;
        var n = e.firstBaseUpdate, i = e.lastBaseUpdate, f = e.shared.pending;
        if (f !== null) {
            e.shared.pending = null;
            var c = f, h = c.next;
            c.next = null, i === null ? n = h : i.next = h, i = c;
            var z = l.alternate;
            z !== null && (z = z.updateQueue, f = z.lastBaseUpdate, f !== i && (f === null ? z.firstBaseUpdate = h : f.next = h, z.lastBaseUpdate = c))
        }
        if (n !== null) {
            var A = e.baseState;
            i = 0, z = h = c = null, f = n;
            do {
                var g = f.lane & -536870913, r = g !== f.lane;
                if (r ? (k & g) === g : (u & g) === g) {
                    g !== 0 && g === su && (Zi = !0), z !== null && (z = z.next = {
                        lane: 0,
                        tag: f.tag,
                        payload: f.payload,
                        callback: null,
                        next: null
                    });
                    l:{
                        var H = l, Z = f;
                        g = t;
                        var gl = a;
                        switch (Z.tag) {
                            case 1:
                                if (H = Z.payload, typeof H == "function") {
                                    A = H.call(gl, A, g);
                                    break l
                                }
                                A = H;
                                break l;
                            case 3:
                                H.flags = H.flags & -65537 | 128;
                            case 0:
                                if (H = Z.payload, g = typeof H == "function" ? H.call(gl, A, g) : H, g == null) break l;
                                A = O({}, A, g);
                                break l;
                            case 2:
                                fa = !0
                        }
                    }
                    g = f.callback, g !== null && (l.flags |= 64, r && (l.flags |= 8192), r = e.callbacks, r === null ? e.callbacks = [g] : r.push(g))
                } else r = {
                    lane: g,
                    tag: f.tag,
                    payload: f.payload,
                    callback: f.callback,
                    next: null
                }, z === null ? (h = z = r, c = A) : z = z.next = r, i |= g;
                if (f = f.next, f === null) {
                    if (f = e.shared.pending, f === null) break;
                    r = f, f = r.next, r.next = null, e.lastBaseUpdate = r, e.shared.pending = null
                }
            } while (!0);
            z === null && (c = A), e.baseState = c, e.firstBaseUpdate = h, e.lastBaseUpdate = z, n === null && (e.shared.lanes = 0), va |= i, l.lanes = i, l.memoizedState = A
        }
    }

    function Cs(l, t) {
        if (typeof l != "function") throw Error(d(191, l));
        l.call(t)
    }

    function js(l, t) {
        var a = l.callbacks;
        if (a !== null) for (l.callbacks = null, l = 0; l < a.length; l++) Cs(a[l], t)
    }

    var du = o(null), Pe = o(0);

    function Bs(l, t) {
        l = kt, U(Pe, l), U(du, t), kt = l | t.baseLanes
    }

    function xi() {
        U(Pe, kt), U(du, du.current)
    }

    function Li() {
        kt = Pe.current, p(du), p(Pe)
    }

    var dt = o(null), _t = null;

    function oa(l) {
        var t = l.alternate;
        U(Rl, Rl.current & 1), U(dt, l), _t === null && (t === null || du.current !== null || t.memoizedState !== null) && (_t = l)
    }

    function Vi(l) {
        U(Rl, Rl.current), U(dt, l), _t === null && (_t = l)
    }

    function Ys(l) {
        l.tag === 22 ? (U(Rl, Rl.current), U(dt, l), _t === null && (_t = l)) : ya()
    }

    function ya() {
        U(Rl, Rl.current), U(dt, dt.current)
    }

    function vt(l) {
        p(dt), _t === l && (_t = null), p(Rl)
    }

    var Rl = o(0);

    function ln(l) {
        for (var t = l; t !== null;) {
            if (t.tag === 13) {
                var a = t.memoizedState;
                if (a !== null && (a = a.dehydrated, a === null || kf(a) || If(a))) return t
            } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
                if ((t.flags & 128) !== 0) return t
            } else if (t.child !== null) {
                t.child.return = t, t = t.child;
                continue
            }
            if (t === l) break;
            for (; t.sibling === null;) {
                if (t.return === null || t.return === l) return null;
                t = t.return
            }
            t.sibling.return = t.return, t = t.sibling
        }
        return null
    }

    var Lt = 0, J = null, vl = null, jl = null, tn = !1, vu = !1, Qa = !1, an = 0, Pu = 0, hu = null, Km = 0;

    function Ol() {
        throw Error(d(321))
    }

    function Ki(l, t) {
        if (t === null) return !1;
        for (var a = 0; a < t.length && a < l.length; a++) if (!yt(l[a], t[a])) return !1;
        return !0
    }

    function Ji(l, t, a, u, e, n) {
        return Lt = n, J = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, b.H = l === null || l.memoizedState === null ? z0 : cf, Qa = !1, n = a(u, e), Qa = !1, vu && (n = Xs(t, a, u, e)), Gs(l), n
    }

    function Gs(l) {
        b.H = ae;
        var t = vl !== null && vl.next !== null;
        if (Lt = 0, jl = vl = J = null, tn = !1, Pu = 0, hu = null, t) throw Error(d(300));
        l === null || Bl || (l = l.dependencies, l !== null && Je(l) && (Bl = !0))
    }

    function Xs(l, t, a, u) {
        J = l;
        var e = 0;
        do {
            if (vu && (hu = null), Pu = 0, vu = !1, 25 <= e) throw Error(d(301));
            if (e += 1, jl = vl = null, l.updateQueue != null) {
                var n = l.updateQueue;
                n.lastEffect = null, n.events = null, n.stores = null, n.memoCache != null && (n.memoCache.index = 0)
            }
            b.H = T0, n = t(a, u)
        } while (vu);
        return n
    }

    function Jm() {
        var l = b.H, t = l.useState()[0];
        return t = typeof t.then == "function" ? le(t) : t, l = l.useState()[0], (vl !== null ? vl.memoizedState : null) !== l && (J.flags |= 1024), t
    }

    function wi() {
        var l = an !== 0;
        return an = 0, l
    }

    function Wi(l, t, a) {
        t.updateQueue = l.updateQueue, t.flags &= -2053, l.lanes &= ~a
    }

    function $i(l) {
        if (tn) {
            for (l = l.memoizedState; l !== null;) {
                var t = l.queue;
                t !== null && (t.pending = null), l = l.next
            }
            tn = !1
        }
        Lt = 0, jl = vl = J = null, vu = !1, Pu = an = 0, hu = null
    }

    function Il() {
        var l = {memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null};
        return jl === null ? J.memoizedState = jl = l : jl = jl.next = l, jl
    }

    function Hl() {
        if (vl === null) {
            var l = J.alternate;
            l = l !== null ? l.memoizedState : null
        } else l = vl.next;
        var t = jl === null ? J.memoizedState : jl.next;
        if (t !== null) jl = t, vl = l; else {
            if (l === null) throw J.alternate === null ? Error(d(467)) : Error(d(310));
            vl = l, l = {
                memoizedState: vl.memoizedState,
                baseState: vl.baseState,
                baseQueue: vl.baseQueue,
                queue: vl.queue,
                next: null
            }, jl === null ? J.memoizedState = jl = l : jl = jl.next = l
        }
        return jl
    }

    function un() {
        return {lastEffect: null, events: null, stores: null, memoCache: null}
    }

    function le(l) {
        var t = Pu;
        return Pu += 1, hu === null && (hu = []), l = Us(hu, l, t), t = J, (jl === null ? t.memoizedState : jl.next) === null && (t = t.alternate, b.H = t === null || t.memoizedState === null ? z0 : cf), l
    }

    function en(l) {
        if (l !== null && typeof l == "object") {
            if (typeof l.then == "function") return le(l);
            if (l.$$typeof === bl) return Kl(l)
        }
        throw Error(d(438, String(l)))
    }

    function Fi(l) {
        var t = null, a = J.updateQueue;
        if (a !== null && (t = a.memoCache), t == null) {
            var u = J.alternate;
            u !== null && (u = u.updateQueue, u !== null && (u = u.memoCache, u != null && (t = {
                data: u.data.map(function (e) {
                    return e.slice()
                }), index: 0
            })))
        }
        if (t == null && (t = {
            data: [],
            index: 0
        }), a === null && (a = un(), J.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0) for (a = t.data[t.index] = Array(l), u = 0; u < l; u++) a[u] = St;
        return t.index++, a
    }

    function Vt(l, t) {
        return typeof t == "function" ? t(l) : t
    }

    function nn(l) {
        var t = Hl();
        return ki(t, vl, l)
    }

    function ki(l, t, a) {
        var u = l.queue;
        if (u === null) throw Error(d(311));
        u.lastRenderedReducer = a;
        var e = l.baseQueue, n = u.pending;
        if (n !== null) {
            if (e !== null) {
                var i = e.next;
                e.next = n.next, n.next = i
            }
            t.baseQueue = e = n, u.pending = null
        }
        if (n = l.baseState, e === null) l.memoizedState = n; else {
            t = e.next;
            var f = i = null, c = null, h = t, z = !1;
            do {
                var A = h.lane & -536870913;
                if (A !== h.lane ? (k & A) === A : (Lt & A) === A) {
                    var g = h.revertLane;
                    if (g === 0) c !== null && (c = c.next = {
                        lane: 0,
                        revertLane: 0,
                        gesture: null,
                        action: h.action,
                        hasEagerState: h.hasEagerState,
                        eagerState: h.eagerState,
                        next: null
                    }), A === su && (z = !0); else if ((Lt & g) === g) {
                        h = h.next, g === su && (z = !0);
                        continue
                    } else A = {
                        lane: 0,
                        revertLane: h.revertLane,
                        gesture: null,
                        action: h.action,
                        hasEagerState: h.hasEagerState,
                        eagerState: h.eagerState,
                        next: null
                    }, c === null ? (f = c = A, i = n) : c = c.next = A, J.lanes |= g, va |= g;
                    A = h.action, Qa && a(n, A), n = h.hasEagerState ? h.eagerState : a(n, A)
                } else g = {
                    lane: A,
                    revertLane: h.revertLane,
                    gesture: h.gesture,
                    action: h.action,
                    hasEagerState: h.hasEagerState,
                    eagerState: h.eagerState,
                    next: null
                }, c === null ? (f = c = g, i = n) : c = c.next = g, J.lanes |= A, va |= A;
                h = h.next
            } while (h !== null && h !== t);
            if (c === null ? i = n : c.next = f, !yt(n, l.memoizedState) && (Bl = !0, z && (a = ou, a !== null))) throw a;
            l.memoizedState = n, l.baseState = i, l.baseQueue = c, u.lastRenderedState = n
        }
        return e === null && (u.lanes = 0), [l.memoizedState, u.dispatch]
    }

    function Ii(l) {
        var t = Hl(), a = t.queue;
        if (a === null) throw Error(d(311));
        a.lastRenderedReducer = l;
        var u = a.dispatch, e = a.pending, n = t.memoizedState;
        if (e !== null) {
            a.pending = null;
            var i = e = e.next;
            do n = l(n, i.action), i = i.next; while (i !== e);
            yt(n, t.memoizedState) || (Bl = !0), t.memoizedState = n, t.baseQueue === null && (t.baseState = n), a.lastRenderedState = n
        }
        return [n, u]
    }

    function Qs(l, t, a) {
        var u = J, e = Hl(), n = tl;
        if (n) {
            if (a === void 0) throw Error(d(407));
            a = a()
        } else a = t();
        var i = !yt((vl || e).memoizedState, a);
        if (i && (e.memoizedState = a, Bl = !0), e = e.queue, tf(Ls.bind(null, u, e, l), [l]), e.getSnapshot !== t || i || jl !== null && jl.memoizedState.tag & 1) {
            if (u.flags |= 2048, gu(9, {destroy: void 0}, xs.bind(null, u, e, a, t), null), Sl === null) throw Error(d(349));
            n || (Lt & 127) !== 0 || Zs(u, t, a)
        }
        return a
    }

    function Zs(l, t, a) {
        l.flags |= 16384, l = {
            getSnapshot: t,
            value: a
        }, t = J.updateQueue, t === null ? (t = un(), J.updateQueue = t, t.stores = [l]) : (a = t.stores, a === null ? t.stores = [l] : a.push(l))
    }

    function xs(l, t, a, u) {
        t.value = a, t.getSnapshot = u, Vs(t) && Ks(l)
    }

    function Ls(l, t, a) {
        return a(function () {
            Vs(t) && Ks(l)
        })
    }

    function Vs(l) {
        var t = l.getSnapshot;
        l = l.value;
        try {
            var a = t();
            return !yt(l, a)
        } catch {
            return !0
        }
    }

    function Ks(l) {
        var t = Ra(l, 2);
        t !== null && ft(t, l, 2)
    }

    function Pi(l) {
        var t = Il();
        if (typeof l == "function") {
            var a = l;
            if (l = a(), Qa) {
                la(!0);
                try {
                    a()
                } finally {
                    la(!1)
                }
            }
        }
        return t.memoizedState = t.baseState = l, t.queue = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: Vt,
            lastRenderedState: l
        }, t
    }

    function Js(l, t, a, u) {
        return l.baseState = a, ki(l, vl, typeof u == "function" ? u : Vt)
    }

    function wm(l, t, a, u, e) {
        if (sn(l)) throw Error(d(485));
        if (l = t.action, l !== null) {
            var n = {
                payload: e,
                action: l,
                next: null,
                isTransition: !0,
                status: "pending",
                value: null,
                reason: null,
                listeners: [],
                then: function (i) {
                    n.listeners.push(i)
                }
            };
            b.T !== null ? a(!0) : n.isTransition = !1, u(n), a = t.pending, a === null ? (n.next = t.pending = n, ws(t, n)) : (n.next = a.next, t.pending = a.next = n)
        }
    }

    function ws(l, t) {
        var a = t.action, u = t.payload, e = l.state;
        if (t.isTransition) {
            var n = b.T, i = {};
            b.T = i;
            try {
                var f = a(e, u), c = b.S;
                c !== null && c(i, f), Ws(l, t, f)
            } catch (h) {
                lf(l, t, h)
            } finally {
                n !== null && i.types !== null && (n.types = i.types), b.T = n
            }
        } else try {
            n = a(e, u), Ws(l, t, n)
        } catch (h) {
            lf(l, t, h)
        }
    }

    function Ws(l, t, a) {
        a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(function (u) {
            $s(l, t, u)
        }, function (u) {
            return lf(l, t, u)
        }) : $s(l, t, a)
    }

    function $s(l, t, a) {
        t.status = "fulfilled", t.value = a, Fs(t), l.state = a, t = l.pending, t !== null && (a = t.next, a === t ? l.pending = null : (a = a.next, t.next = a, ws(l, a)))
    }

    function lf(l, t, a) {
        var u = l.pending;
        if (l.pending = null, u !== null) {
            u = u.next;
            do t.status = "rejected", t.reason = a, Fs(t), t = t.next; while (t !== u)
        }
        l.action = null
    }

    function Fs(l) {
        l = l.listeners;
        for (var t = 0; t < l.length; t++) (0, l[t])()
    }

    function ks(l, t) {
        return t
    }

    function Is(l, t) {
        if (tl) {
            var a = Sl.formState;
            if (a !== null) {
                l:{
                    var u = J;
                    if (tl) {
                        if (zl) {
                            t:{
                                for (var e = zl, n = Mt; e.nodeType !== 8;) {
                                    if (!n) {
                                        e = null;
                                        break t
                                    }
                                    if (e = Ot(e.nextSibling), e === null) {
                                        e = null;
                                        break t
                                    }
                                }
                                n = e.data, e = n === "F!" || n === "F" ? e : null
                            }
                            if (e) {
                                zl = Ot(e.nextSibling), u = e.data === "F!";
                                break l
                            }
                        }
                        na(u)
                    }
                    u = !1
                }
                u && (t = a[0])
            }
        }
        return a = Il(), a.memoizedState = a.baseState = t, u = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: ks,
            lastRenderedState: t
        }, a.queue = u, a = r0.bind(null, J, u), u.dispatch = a, u = Pi(!1), n = ff.bind(null, J, !1, u.queue), u = Il(), e = {
            state: t,
            dispatch: null,
            action: l,
            pending: null
        }, u.queue = e, a = wm.bind(null, J, e, n, a), e.dispatch = a, u.memoizedState = l, [t, a, !1]
    }

    function Ps(l) {
        var t = Hl();
        return l0(t, vl, l)
    }

    function l0(l, t, a) {
        if (t = ki(l, t, ks)[0], l = nn(Vt)[0], typeof t == "object" && t !== null && typeof t.then == "function") try {
            var u = le(t)
        } catch (i) {
            throw i === yu ? $e : i
        } else u = t;
        t = Hl();
        var e = t.queue, n = e.dispatch;
        return a !== t.memoizedState && (J.flags |= 2048, gu(9, {destroy: void 0}, Wm.bind(null, e, a), null)), [u, n, l]
    }

    function Wm(l, t) {
        l.action = t
    }

    function t0(l) {
        var t = Hl(), a = vl;
        if (a !== null) return l0(t, a, l);
        Hl(), t = t.memoizedState, a = Hl();
        var u = a.queue.dispatch;
        return a.memoizedState = l, [t, u, !1]
    }

    function gu(l, t, a, u) {
        return l = {
            tag: l,
            create: a,
            deps: u,
            inst: t,
            next: null
        }, t = J.updateQueue, t === null && (t = un(), J.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = l.next = l : (u = a.next, a.next = l, l.next = u, t.lastEffect = l), l
    }

    function a0() {
        return Hl().memoizedState
    }

    function fn(l, t, a, u) {
        var e = Il();
        J.flags |= l, e.memoizedState = gu(1 | t, {destroy: void 0}, a, u === void 0 ? null : u)
    }

    function cn(l, t, a, u) {
        var e = Hl();
        u = u === void 0 ? null : u;
        var n = e.memoizedState.inst;
        vl !== null && u !== null && Ki(u, vl.memoizedState.deps) ? e.memoizedState = gu(t, n, a, u) : (J.flags |= l, e.memoizedState = gu(1 | t, n, a, u))
    }

    function u0(l, t) {
        fn(8390656, 8, l, t)
    }

    function tf(l, t) {
        cn(2048, 8, l, t)
    }

    function $m(l) {
        J.flags |= 4;
        var t = J.updateQueue;
        if (t === null) t = un(), J.updateQueue = t, t.events = [l]; else {
            var a = t.events;
            a === null ? t.events = [l] : a.push(l)
        }
    }

    function e0(l) {
        var t = Hl().memoizedState;
        return $m({ref: t, nextImpl: l}), function () {
            if ((fl & 2) !== 0) throw Error(d(440));
            return t.impl.apply(void 0, arguments)
        }
    }

    function n0(l, t) {
        return cn(4, 2, l, t)
    }

    function i0(l, t) {
        return cn(4, 4, l, t)
    }

    function f0(l, t) {
        if (typeof t == "function") {
            l = l();
            var a = t(l);
            return function () {
                typeof a == "function" ? a() : t(null)
            }
        }
        if (t != null) return l = l(), t.current = l, function () {
            t.current = null
        }
    }

    function c0(l, t, a) {
        a = a != null ? a.concat([l]) : null, cn(4, 4, f0.bind(null, t, l), a)
    }

    function af() {
    }

    function s0(l, t) {
        var a = Hl();
        t = t === void 0 ? null : t;
        var u = a.memoizedState;
        return t !== null && Ki(t, u[1]) ? u[0] : (a.memoizedState = [l, t], l)
    }

    function o0(l, t) {
        var a = Hl();
        t = t === void 0 ? null : t;
        var u = a.memoizedState;
        if (t !== null && Ki(t, u[1])) return u[0];
        if (u = l(), Qa) {
            la(!0);
            try {
                l()
            } finally {
                la(!1)
            }
        }
        return a.memoizedState = [u, t], u
    }

    function uf(l, t, a) {
        return a === void 0 || (Lt & 1073741824) !== 0 && (k & 261930) === 0 ? l.memoizedState = t : (l.memoizedState = a, l = yo(), J.lanes |= l, va |= l, a)
    }

    function y0(l, t, a, u) {
        return yt(a, t) ? a : du.current !== null ? (l = uf(l, a, u), yt(l, t) || (Bl = !0), l) : (Lt & 42) === 0 || (Lt & 1073741824) !== 0 && (k & 261930) === 0 ? (Bl = !0, l.memoizedState = a) : (l = yo(), J.lanes |= l, va |= l, t)
    }

    function m0(l, t, a, u, e) {
        var n = _.p;
        _.p = n !== 0 && 8 > n ? n : 8;
        var i = b.T, f = {};
        b.T = f, ff(l, !1, t, a);
        try {
            var c = e(), h = b.S;
            if (h !== null && h(f, c), c !== null && typeof c == "object" && typeof c.then == "function") {
                var z = Vm(c, u);
                te(l, t, z, rt(l))
            } else te(l, t, u, rt(l))
        } catch (A) {
            te(l, t, {
                then: function () {
                }, status: "rejected", reason: A
            }, rt())
        } finally {
            _.p = n, i !== null && f.types !== null && (i.types = f.types), b.T = i
        }
    }

    function Fm() {
    }

    function ef(l, t, a, u) {
        if (l.tag !== 5) throw Error(d(476));
        var e = d0(l).queue;
        m0(l, e, t, Q, a === null ? Fm : function () {
            return v0(l), a(u)
        })
    }

    function d0(l) {
        var t = l.memoizedState;
        if (t !== null) return t;
        t = {
            memoizedState: Q,
            baseState: Q,
            baseQueue: null,
            queue: {pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Vt, lastRenderedState: Q},
            next: null
        };
        var a = {};
        return t.next = {
            memoizedState: a,
            baseState: a,
            baseQueue: null,
            queue: {pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Vt, lastRenderedState: a},
            next: null
        }, l.memoizedState = t, l = l.alternate, l !== null && (l.memoizedState = t), t
    }

    function v0(l) {
        var t = d0(l);
        t.next === null && (t = l.alternate.memoizedState), te(l, t.next.queue, {}, rt())
    }

    function nf() {
        return Kl(Se)
    }

    function h0() {
        return Hl().memoizedState
    }

    function g0() {
        return Hl().memoizedState
    }

    function km(l) {
        for (var t = l.return; t !== null;) {
            switch (t.tag) {
                case 24:
                case 3:
                    var a = rt();
                    l = ca(a);
                    var u = sa(t, l, a);
                    u !== null && (ft(u, t, a), Fu(u, t, a)), t = {cache: Ci()}, l.payload = t;
                    return
            }
            t = t.return
        }
    }

    function Im(l, t, a) {
        var u = rt();
        a = {
            lane: u,
            revertLane: 0,
            gesture: null,
            action: a,
            hasEagerState: !1,
            eagerState: null,
            next: null
        }, sn(l) ? S0(t, a) : (a = Ai(l, t, a, u), a !== null && (ft(a, l, u), b0(a, t, u)))
    }

    function r0(l, t, a) {
        var u = rt();
        te(l, t, a, u)
    }

    function te(l, t, a, u) {
        var e = {lane: u, revertLane: 0, gesture: null, action: a, hasEagerState: !1, eagerState: null, next: null};
        if (sn(l)) S0(t, e); else {
            var n = l.alternate;
            if (l.lanes === 0 && (n === null || n.lanes === 0) && (n = t.lastRenderedReducer, n !== null)) try {
                var i = t.lastRenderedState, f = n(i, a);
                if (e.hasEagerState = !0, e.eagerState = f, yt(f, i)) return xe(l, t, e, 0), Sl === null && Ze(), !1
            } catch {
            }
            if (a = Ai(l, t, e, u), a !== null) return ft(a, l, u), b0(a, t, u), !0
        }
        return !1
    }

    function ff(l, t, a, u) {
        if (u = {
            lane: 2,
            revertLane: Xf(),
            gesture: null,
            action: u,
            hasEagerState: !1,
            eagerState: null,
            next: null
        }, sn(l)) {
            if (t) throw Error(d(479))
        } else t = Ai(l, a, u, 2), t !== null && ft(t, l, 2)
    }

    function sn(l) {
        var t = l.alternate;
        return l === J || t !== null && t === J
    }

    function S0(l, t) {
        vu = tn = !0;
        var a = l.pending;
        a === null ? t.next = t : (t.next = a.next, a.next = t), l.pending = t
    }

    function b0(l, t, a) {
        if ((a & 4194048) !== 0) {
            var u = t.lanes;
            u &= l.pendingLanes, a |= u, t.lanes = a, Ec(l, a)
        }
    }

    var ae = {
        readContext: Kl,
        use: en,
        useCallback: Ol,
        useContext: Ol,
        useEffect: Ol,
        useImperativeHandle: Ol,
        useLayoutEffect: Ol,
        useInsertionEffect: Ol,
        useMemo: Ol,
        useReducer: Ol,
        useRef: Ol,
        useState: Ol,
        useDebugValue: Ol,
        useDeferredValue: Ol,
        useTransition: Ol,
        useSyncExternalStore: Ol,
        useId: Ol,
        useHostTransitionStatus: Ol,
        useFormState: Ol,
        useActionState: Ol,
        useOptimistic: Ol,
        useMemoCache: Ol,
        useCacheRefresh: Ol
    };
    ae.useEffectEvent = Ol;
    var z0 = {
        readContext: Kl, use: en, useCallback: function (l, t) {
            return Il().memoizedState = [l, t === void 0 ? null : t], l
        }, useContext: Kl, useEffect: u0, useImperativeHandle: function (l, t, a) {
            a = a != null ? a.concat([l]) : null, fn(4194308, 4, f0.bind(null, t, l), a)
        }, useLayoutEffect: function (l, t) {
            return fn(4194308, 4, l, t)
        }, useInsertionEffect: function (l, t) {
            fn(4, 2, l, t)
        }, useMemo: function (l, t) {
            var a = Il();
            t = t === void 0 ? null : t;
            var u = l();
            if (Qa) {
                la(!0);
                try {
                    l()
                } finally {
                    la(!1)
                }
            }
            return a.memoizedState = [u, t], u
        }, useReducer: function (l, t, a) {
            var u = Il();
            if (a !== void 0) {
                var e = a(t);
                if (Qa) {
                    la(!0);
                    try {
                        a(t)
                    } finally {
                        la(!1)
                    }
                }
            } else e = t;
            return u.memoizedState = u.baseState = e, l = {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: l,
                lastRenderedState: e
            }, u.queue = l, l = l.dispatch = Im.bind(null, J, l), [u.memoizedState, l]
        }, useRef: function (l) {
            var t = Il();
            return l = {current: l}, t.memoizedState = l
        }, useState: function (l) {
            l = Pi(l);
            var t = l.queue, a = r0.bind(null, J, t);
            return t.dispatch = a, [l.memoizedState, a]
        }, useDebugValue: af, useDeferredValue: function (l, t) {
            var a = Il();
            return uf(a, l, t)
        }, useTransition: function () {
            var l = Pi(!1);
            return l = m0.bind(null, J, l.queue, !0, !1), Il().memoizedState = l, [!1, l]
        }, useSyncExternalStore: function (l, t, a) {
            var u = J, e = Il();
            if (tl) {
                if (a === void 0) throw Error(d(407));
                a = a()
            } else {
                if (a = t(), Sl === null) throw Error(d(349));
                (k & 127) !== 0 || Zs(u, t, a)
            }
            e.memoizedState = a;
            var n = {value: a, getSnapshot: t};
            return e.queue = n, u0(Ls.bind(null, u, n, l), [l]), u.flags |= 2048, gu(9, {destroy: void 0}, xs.bind(null, u, n, a, t), null), a
        }, useId: function () {
            var l = Il(), t = Sl.identifierPrefix;
            if (tl) {
                var a = qt, u = Ht;
                a = (u & ~(1 << 32 - ot(u) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = an++, 0 < a && (t += "H" + a.toString(32)), t += "_"
            } else a = Km++, t = "_" + t + "r_" + a.toString(32) + "_";
            return l.memoizedState = t
        }, useHostTransitionStatus: nf, useFormState: Is, useActionState: Is, useOptimistic: function (l) {
            var t = Il();
            t.memoizedState = t.baseState = l;
            var a = {pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null};
            return t.queue = a, t = ff.bind(null, J, !0, a), a.dispatch = t, [l, t]
        }, useMemoCache: Fi, useCacheRefresh: function () {
            return Il().memoizedState = km.bind(null, J)
        }, useEffectEvent: function (l) {
            var t = Il(), a = {impl: l};
            return t.memoizedState = a, function () {
                if ((fl & 2) !== 0) throw Error(d(440));
                return a.impl.apply(void 0, arguments)
            }
        }
    }, cf = {
        readContext: Kl,
        use: en,
        useCallback: s0,
        useContext: Kl,
        useEffect: tf,
        useImperativeHandle: c0,
        useInsertionEffect: n0,
        useLayoutEffect: i0,
        useMemo: o0,
        useReducer: nn,
        useRef: a0,
        useState: function () {
            return nn(Vt)
        },
        useDebugValue: af,
        useDeferredValue: function (l, t) {
            var a = Hl();
            return y0(a, vl.memoizedState, l, t)
        },
        useTransition: function () {
            var l = nn(Vt)[0], t = Hl().memoizedState;
            return [typeof l == "boolean" ? l : le(l), t]
        },
        useSyncExternalStore: Qs,
        useId: h0,
        useHostTransitionStatus: nf,
        useFormState: Ps,
        useActionState: Ps,
        useOptimistic: function (l, t) {
            var a = Hl();
            return Js(a, vl, l, t)
        },
        useMemoCache: Fi,
        useCacheRefresh: g0
    };
    cf.useEffectEvent = e0;
    var T0 = {
        readContext: Kl,
        use: en,
        useCallback: s0,
        useContext: Kl,
        useEffect: tf,
        useImperativeHandle: c0,
        useInsertionEffect: n0,
        useLayoutEffect: i0,
        useMemo: o0,
        useReducer: Ii,
        useRef: a0,
        useState: function () {
            return Ii(Vt)
        },
        useDebugValue: af,
        useDeferredValue: function (l, t) {
            var a = Hl();
            return vl === null ? uf(a, l, t) : y0(a, vl.memoizedState, l, t)
        },
        useTransition: function () {
            var l = Ii(Vt)[0], t = Hl().memoizedState;
            return [typeof l == "boolean" ? l : le(l), t]
        },
        useSyncExternalStore: Qs,
        useId: h0,
        useHostTransitionStatus: nf,
        useFormState: t0,
        useActionState: t0,
        useOptimistic: function (l, t) {
            var a = Hl();
            return vl !== null ? Js(a, vl, l, t) : (a.baseState = l, [l, a.queue.dispatch])
        },
        useMemoCache: Fi,
        useCacheRefresh: g0
    };
    T0.useEffectEvent = e0;

    function sf(l, t, a, u) {
        t = l.memoizedState, a = a(u, t), a = a == null ? t : O({}, t, a), l.memoizedState = a, l.lanes === 0 && (l.updateQueue.baseState = a)
    }

    var of = {
        enqueueSetState: function (l, t, a) {
            l = l._reactInternals;
            var u = rt(), e = ca(u);
            e.payload = t, a != null && (e.callback = a), t = sa(l, e, u), t !== null && (ft(t, l, u), Fu(t, l, u))
        }, enqueueReplaceState: function (l, t, a) {
            l = l._reactInternals;
            var u = rt(), e = ca(u);
            e.tag = 1, e.payload = t, a != null && (e.callback = a), t = sa(l, e, u), t !== null && (ft(t, l, u), Fu(t, l, u))
        }, enqueueForceUpdate: function (l, t) {
            l = l._reactInternals;
            var a = rt(), u = ca(a);
            u.tag = 2, t != null && (u.callback = t), t = sa(l, u, a), t !== null && (ft(t, l, a), Fu(t, l, a))
        }
    };

    function p0(l, t, a, u, e, n, i) {
        return l = l.stateNode, typeof l.shouldComponentUpdate == "function" ? l.shouldComponentUpdate(u, n, i) : t.prototype && t.prototype.isPureReactComponent ? !xu(a, u) || !xu(e, n) : !0
    }

    function A0(l, t, a, u) {
        l = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, u), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, u), t.state !== l && of.enqueueReplaceState(t, t.state, null)
    }

    function Za(l, t) {
        var a = t;
        if ("ref" in t) {
            a = {};
            for (var u in t) u !== "ref" && (a[u] = t[u])
        }
        if (l = l.defaultProps) {
            a === t && (a = O({}, a));
            for (var e in l) a[e] === void 0 && (a[e] = l[e])
        }
        return a
    }

    function E0(l) {
        Qe(l)
    }

    function M0(l) {
        console.error(l)
    }

    function _0(l) {
        Qe(l)
    }

    function on(l, t) {
        try {
            var a = l.onUncaughtError;
            a(t.value, {componentStack: t.stack})
        } catch (u) {
            setTimeout(function () {
                throw u
            })
        }
    }

    function O0(l, t, a) {
        try {
            var u = l.onCaughtError;
            u(a.value, {componentStack: a.stack, errorBoundary: t.tag === 1 ? t.stateNode : null})
        } catch (e) {
            setTimeout(function () {
                throw e
            })
        }
    }

    function yf(l, t, a) {
        return a = ca(a), a.tag = 3, a.payload = {element: null}, a.callback = function () {
            on(l, t)
        }, a
    }

    function D0(l) {
        return l = ca(l), l.tag = 3, l
    }

    function U0(l, t, a, u) {
        var e = a.type.getDerivedStateFromError;
        if (typeof e == "function") {
            var n = u.value;
            l.payload = function () {
                return e(n)
            }, l.callback = function () {
                O0(t, a, u)
            }
        }
        var i = a.stateNode;
        i !== null && typeof i.componentDidCatch == "function" && (l.callback = function () {
            O0(t, a, u), typeof e != "function" && (ha === null ? ha = new Set([this]) : ha.add(this));
            var f = u.stack;
            this.componentDidCatch(u.value, {componentStack: f !== null ? f : ""})
        })
    }

    function Pm(l, t, a, u, e) {
        if (a.flags |= 32768, u !== null && typeof u == "object" && typeof u.then == "function") {
            if (t = a.alternate, t !== null && cu(t, a, e, !0), a = dt.current, a !== null) {
                switch (a.tag) {
                    case 31:
                    case 13:
                        return _t === null ? pn() : a.alternate === null && Dl === 0 && (Dl = 3), a.flags &= -257, a.flags |= 65536, a.lanes = e, u === Fe ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = new Set([u]) : t.add(u), Bf(l, u, e)), !1;
                    case 22:
                        return a.flags |= 65536, u === Fe ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = {
                            transitions: null,
                            markerInstances: null,
                            retryQueue: new Set([u])
                        }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = new Set([u]) : a.add(u)), Bf(l, u, e)), !1
                }
                throw Error(d(435, a.tag))
            }
            return Bf(l, u, e), pn(), !1
        }
        if (tl) return t = dt.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = e, u !== Ui && (l = Error(d(422), {cause: u}), Ku(pt(l, a)))) : (u !== Ui && (t = Error(d(423), {cause: u}), Ku(pt(t, a))), l = l.current.alternate, l.flags |= 65536, e &= -e, l.lanes |= e, u = pt(u, a), e = yf(l.stateNode, u, e), Qi(l, e), Dl !== 4 && (Dl = 2)), !1;
        var n = Error(d(520), {cause: u});
        if (n = pt(n, a), oe === null ? oe = [n] : oe.push(n), Dl !== 4 && (Dl = 2), t === null) return !0;
        u = pt(u, a), a = t;
        do {
            switch (a.tag) {
                case 3:
                    return a.flags |= 65536, l = e & -e, a.lanes |= l, l = yf(a.stateNode, u, l), Qi(a, l), !1;
                case 1:
                    if (t = a.type, n = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || n !== null && typeof n.componentDidCatch == "function" && (ha === null || !ha.has(n)))) return a.flags |= 65536, e &= -e, a.lanes |= e, e = D0(e), U0(e, l, a, u), Qi(a, e), !1
            }
            a = a.return
        } while (a !== null);
        return !1
    }

    var mf = Error(d(461)), Bl = !1;

    function Jl(l, t, a, u) {
        t.child = l === null ? qs(t, null, a, u) : Xa(t, l.child, a, u)
    }

    function N0(l, t, a, u, e) {
        a = a.render;
        var n = t.ref;
        if ("ref" in u) {
            var i = {};
            for (var f in u) f !== "ref" && (i[f] = u[f])
        } else i = u;
        return ja(t), u = Ji(l, t, a, i, n, e), f = wi(), l !== null && !Bl ? (Wi(l, t, e), Kt(l, t, e)) : (tl && f && Oi(t), t.flags |= 1, Jl(l, t, u, e), t.child)
    }

    function R0(l, t, a, u, e) {
        if (l === null) {
            var n = a.type;
            return typeof n == "function" && !Ei(n) && n.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = n, H0(l, t, n, u, e)) : (l = Ve(a.type, null, u, t, t.mode, e), l.ref = t.ref, l.return = t, t.child = l)
        }
        if (n = l.child, !zf(l, e)) {
            var i = n.memoizedProps;
            if (a = a.compare, a = a !== null ? a : xu, a(i, u) && l.ref === t.ref) return Kt(l, t, e)
        }
        return t.flags |= 1, l = Xt(n, u), l.ref = t.ref, l.return = t, t.child = l
    }

    function H0(l, t, a, u, e) {
        if (l !== null) {
            var n = l.memoizedProps;
            if (xu(n, u) && l.ref === t.ref) if (Bl = !1, t.pendingProps = u = n, zf(l, e)) (l.flags & 131072) !== 0 && (Bl = !0); else return t.lanes = l.lanes, Kt(l, t, e)
        }
        return df(l, t, a, u, e)
    }

    function q0(l, t, a, u) {
        var e = u.children, n = l !== null ? l.memoizedState : null;
        if (l === null && t.stateNode === null && (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null
        }), u.mode === "hidden") {
            if ((t.flags & 128) !== 0) {
                if (n = n !== null ? n.baseLanes | a : a, l !== null) {
                    for (u = t.child = l.child, e = 0; u !== null;) e = e | u.lanes | u.childLanes, u = u.sibling;
                    u = e & ~n
                } else u = 0, t.child = null;
                return C0(l, t, n, a, u)
            }
            if ((a & 536870912) !== 0) t.memoizedState = {
                baseLanes: 0,
                cachePool: null
            }, l !== null && We(t, n !== null ? n.cachePool : null), n !== null ? Bs(t, n) : xi(), Ys(t); else return u = t.lanes = 536870912, C0(l, t, n !== null ? n.baseLanes | a : a, a, u)
        } else n !== null ? (We(t, n.cachePool), Bs(t, n), ya(), t.memoizedState = null) : (l !== null && We(t, null), xi(), ya());
        return Jl(l, t, e, a), t.child
    }

    function ue(l, t) {
        return l !== null && l.tag === 22 || t.stateNode !== null || (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null
        }), t.sibling
    }

    function C0(l, t, a, u, e) {
        var n = Bi();
        return n = n === null ? null : {parent: Cl._currentValue, pool: n}, t.memoizedState = {
            baseLanes: a,
            cachePool: n
        }, l !== null && We(t, null), xi(), Ys(t), l !== null && cu(l, t, u, !0), t.childLanes = e, null
    }

    function yn(l, t) {
        return t = dn({mode: t.mode, children: t.children}, l.mode), t.ref = l.ref, l.child = t, t.return = l, t
    }

    function j0(l, t, a) {
        return Xa(t, l.child, null, a), l = yn(t, t.pendingProps), l.flags |= 2, vt(t), t.memoizedState = null, l
    }

    function ld(l, t, a) {
        var u = t.pendingProps, e = (t.flags & 128) !== 0;
        if (t.flags &= -129, l === null) {
            if (tl) {
                if (u.mode === "hidden") return l = yn(t, u), t.lanes = 536870912, ue(null, l);
                if (Vi(t), (l = zl) ? (l = Wo(l, Mt), l = l !== null && l.data === "&" ? l : null, l !== null && (t.memoizedState = {
                    dehydrated: l,
                    treeContext: ua !== null ? {id: Ht, overflow: qt} : null,
                    retryLane: 536870912,
                    hydrationErrors: null
                }, a = Ss(l), a.return = t, t.child = a, Vl = t, zl = null)) : l = null, l === null) throw na(t);
                return t.lanes = 536870912, null
            }
            return yn(t, u)
        }
        var n = l.memoizedState;
        if (n !== null) {
            var i = n.dehydrated;
            if (Vi(t), e) if (t.flags & 256) t.flags &= -257, t = j0(l, t, a); else if (t.memoizedState !== null) t.child = l.child, t.flags |= 128, t = null; else throw Error(d(558)); else if (Bl || cu(l, t, a, !1), e = (a & l.childLanes) !== 0, Bl || e) {
                if (u = Sl, u !== null && (i = Mc(u, a), i !== 0 && i !== n.retryLane)) throw n.retryLane = i, Ra(l, i), ft(u, l, i), mf;
                pn(), t = j0(l, t, a)
            } else l = n.treeContext, zl = Ot(i.nextSibling), Vl = t, tl = !0, ea = null, Mt = !1, l !== null && Ts(t, l), t = yn(t, u), t.flags |= 4096;
            return t
        }
        return l = Xt(l.child, {mode: u.mode, children: u.children}), l.ref = t.ref, t.child = l, l.return = t, l
    }

    function mn(l, t) {
        var a = t.ref;
        if (a === null) l !== null && l.ref !== null && (t.flags |= 4194816); else {
            if (typeof a != "function" && typeof a != "object") throw Error(d(284));
            (l === null || l.ref !== a) && (t.flags |= 4194816)
        }
    }

    function df(l, t, a, u, e) {
        return ja(t), a = Ji(l, t, a, u, void 0, e), u = wi(), l !== null && !Bl ? (Wi(l, t, e), Kt(l, t, e)) : (tl && u && Oi(t), t.flags |= 1, Jl(l, t, a, e), t.child)
    }

    function B0(l, t, a, u, e, n) {
        return ja(t), t.updateQueue = null, a = Xs(t, u, a, e), Gs(l), u = wi(), l !== null && !Bl ? (Wi(l, t, n), Kt(l, t, n)) : (tl && u && Oi(t), t.flags |= 1, Jl(l, t, a, n), t.child)
    }

    function Y0(l, t, a, u, e) {
        if (ja(t), t.stateNode === null) {
            var n = eu, i = a.contextType;
            typeof i == "object" && i !== null && (n = Kl(i)), n = new a(u, n), t.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = of, t.stateNode = n, n._reactInternals = t, n = t.stateNode, n.props = u, n.state = t.memoizedState, n.refs = {}, Gi(t), i = a.contextType, n.context = typeof i == "object" && i !== null ? Kl(i) : eu, n.state = t.memoizedState, i = a.getDerivedStateFromProps, typeof i == "function" && (sf(t, a, i, u), n.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof n.getSnapshotBeforeUpdate == "function" || typeof n.UNSAFE_componentWillMount != "function" && typeof n.componentWillMount != "function" || (i = n.state, typeof n.componentWillMount == "function" && n.componentWillMount(), typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount(), i !== n.state && of.enqueueReplaceState(n, n.state, null), Iu(t, u, n, e), ku(), n.state = t.memoizedState), typeof n.componentDidMount == "function" && (t.flags |= 4194308), u = !0
        } else if (l === null) {
            n = t.stateNode;
            var f = t.memoizedProps, c = Za(a, f);
            n.props = c;
            var h = n.context, z = a.contextType;
            i = eu, typeof z == "object" && z !== null && (i = Kl(z));
            var A = a.getDerivedStateFromProps;
            z = typeof A == "function" || typeof n.getSnapshotBeforeUpdate == "function", f = t.pendingProps !== f, z || typeof n.UNSAFE_componentWillReceiveProps != "function" && typeof n.componentWillReceiveProps != "function" || (f || h !== i) && A0(t, n, u, i), fa = !1;
            var g = t.memoizedState;
            n.state = g, Iu(t, u, n, e), ku(), h = t.memoizedState, f || g !== h || fa ? (typeof A == "function" && (sf(t, a, A, u), h = t.memoizedState), (c = fa || p0(t, a, c, u, g, h, i)) ? (z || typeof n.UNSAFE_componentWillMount != "function" && typeof n.componentWillMount != "function" || (typeof n.componentWillMount == "function" && n.componentWillMount(), typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount()), typeof n.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = u, t.memoizedState = h), n.props = u, n.state = h, n.context = i, u = c) : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), u = !1)
        } else {
            n = t.stateNode, Xi(l, t), i = t.memoizedProps, z = Za(a, i), n.props = z, A = t.pendingProps, g = n.context, h = a.contextType, c = eu, typeof h == "object" && h !== null && (c = Kl(h)), f = a.getDerivedStateFromProps, (h = typeof f == "function" || typeof n.getSnapshotBeforeUpdate == "function") || typeof n.UNSAFE_componentWillReceiveProps != "function" && typeof n.componentWillReceiveProps != "function" || (i !== A || g !== c) && A0(t, n, u, c), fa = !1, g = t.memoizedState, n.state = g, Iu(t, u, n, e), ku();
            var r = t.memoizedState;
            i !== A || g !== r || fa || l !== null && l.dependencies !== null && Je(l.dependencies) ? (typeof f == "function" && (sf(t, a, f, u), r = t.memoizedState), (z = fa || p0(t, a, z, u, g, r, c) || l !== null && l.dependencies !== null && Je(l.dependencies)) ? (h || typeof n.UNSAFE_componentWillUpdate != "function" && typeof n.componentWillUpdate != "function" || (typeof n.componentWillUpdate == "function" && n.componentWillUpdate(u, r, c), typeof n.UNSAFE_componentWillUpdate == "function" && n.UNSAFE_componentWillUpdate(u, r, c)), typeof n.componentDidUpdate == "function" && (t.flags |= 4), typeof n.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof n.componentDidUpdate != "function" || i === l.memoizedProps && g === l.memoizedState || (t.flags |= 4), typeof n.getSnapshotBeforeUpdate != "function" || i === l.memoizedProps && g === l.memoizedState || (t.flags |= 1024), t.memoizedProps = u, t.memoizedState = r), n.props = u, n.state = r, n.context = c, u = z) : (typeof n.componentDidUpdate != "function" || i === l.memoizedProps && g === l.memoizedState || (t.flags |= 4), typeof n.getSnapshotBeforeUpdate != "function" || i === l.memoizedProps && g === l.memoizedState || (t.flags |= 1024), u = !1)
        }
        return n = u, mn(l, t), u = (t.flags & 128) !== 0, n || u ? (n = t.stateNode, a = u && typeof a.getDerivedStateFromError != "function" ? null : n.render(), t.flags |= 1, l !== null && u ? (t.child = Xa(t, l.child, null, e), t.child = Xa(t, null, a, e)) : Jl(l, t, a, e), t.memoizedState = n.state, l = t.child) : l = Kt(l, t, e), l
    }

    function G0(l, t, a, u) {
        return qa(), t.flags |= 256, Jl(l, t, a, u), t.child
    }

    var vf = {dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null};

    function hf(l) {
        return {baseLanes: l, cachePool: Os()}
    }

    function gf(l, t, a) {
        return l = l !== null ? l.childLanes & ~a : 0, t && (l |= gt), l
    }

    function X0(l, t, a) {
        var u = t.pendingProps, e = !1, n = (t.flags & 128) !== 0, i;
        if ((i = n) || (i = l !== null && l.memoizedState === null ? !1 : (Rl.current & 2) !== 0), i && (e = !0, t.flags &= -129), i = (t.flags & 32) !== 0, t.flags &= -33, l === null) {
            if (tl) {
                if (e ? oa(t) : ya(), (l = zl) ? (l = Wo(l, Mt), l = l !== null && l.data !== "&" ? l : null, l !== null && (t.memoizedState = {
                    dehydrated: l,
                    treeContext: ua !== null ? {id: Ht, overflow: qt} : null,
                    retryLane: 536870912,
                    hydrationErrors: null
                }, a = Ss(l), a.return = t, t.child = a, Vl = t, zl = null)) : l = null, l === null) throw na(t);
                return If(l) ? t.lanes = 32 : t.lanes = 536870912, null
            }
            var f = u.children;
            return u = u.fallback, e ? (ya(), e = t.mode, f = dn({
                mode: "hidden",
                children: f
            }, e), u = Ha(u, e, a, null), f.return = t, u.return = t, f.sibling = u, t.child = f, u = t.child, u.memoizedState = hf(a), u.childLanes = gf(l, i, a), t.memoizedState = vf, ue(null, u)) : (oa(t), rf(t, f))
        }
        var c = l.memoizedState;
        if (c !== null && (f = c.dehydrated, f !== null)) {
            if (n) t.flags & 256 ? (oa(t), t.flags &= -257, t = Sf(l, t, a)) : t.memoizedState !== null ? (ya(), t.child = l.child, t.flags |= 128, t = null) : (ya(), f = u.fallback, e = t.mode, u = dn({
                mode: "visible",
                children: u.children
            }, e), f = Ha(f, e, a, null), f.flags |= 2, u.return = t, f.return = t, u.sibling = f, t.child = u, Xa(t, l.child, null, a), u = t.child, u.memoizedState = hf(a), u.childLanes = gf(l, i, a), t.memoizedState = vf, t = ue(null, u)); else if (oa(t), If(f)) {
                if (i = f.nextSibling && f.nextSibling.dataset, i) var h = i.dgst;
                i = h, u = Error(d(419)), u.stack = "", u.digest = i, Ku({
                    value: u,
                    source: null,
                    stack: null
                }), t = Sf(l, t, a)
            } else if (Bl || cu(l, t, a, !1), i = (a & l.childLanes) !== 0, Bl || i) {
                if (i = Sl, i !== null && (u = Mc(i, a), u !== 0 && u !== c.retryLane)) throw c.retryLane = u, Ra(l, u), ft(i, l, u), mf;
                kf(f) || pn(), t = Sf(l, t, a)
            } else kf(f) ? (t.flags |= 192, t.child = l.child, t = null) : (l = c.treeContext, zl = Ot(f.nextSibling), Vl = t, tl = !0, ea = null, Mt = !1, l !== null && Ts(t, l), t = rf(t, u.children), t.flags |= 4096);
            return t
        }
        return e ? (ya(), f = u.fallback, e = t.mode, c = l.child, h = c.sibling, u = Xt(c, {
            mode: "hidden",
            children: u.children
        }), u.subtreeFlags = c.subtreeFlags & 65011712, h !== null ? f = Xt(h, f) : (f = Ha(f, e, a, null), f.flags |= 2), f.return = t, u.return = t, u.sibling = f, t.child = u, ue(null, u), u = t.child, f = l.child.memoizedState, f === null ? f = hf(a) : (e = f.cachePool, e !== null ? (c = Cl._currentValue, e = e.parent !== c ? {
            parent: c,
            pool: c
        } : e) : e = Os(), f = {
            baseLanes: f.baseLanes | a,
            cachePool: e
        }), u.memoizedState = f, u.childLanes = gf(l, i, a), t.memoizedState = vf, ue(l.child, u)) : (oa(t), a = l.child, l = a.sibling, a = Xt(a, {
            mode: "visible",
            children: u.children
        }), a.return = t, a.sibling = null, l !== null && (i = t.deletions, i === null ? (t.deletions = [l], t.flags |= 16) : i.push(l)), t.child = a, t.memoizedState = null, a)
    }

    function rf(l, t) {
        return t = dn({mode: "visible", children: t}, l.mode), t.return = l, l.child = t
    }

    function dn(l, t) {
        return l = mt(22, l, null, t), l.lanes = 0, l
    }

    function Sf(l, t, a) {
        return Xa(t, l.child, null, a), l = rf(t, t.pendingProps.children), l.flags |= 2, t.memoizedState = null, l
    }

    function Q0(l, t, a) {
        l.lanes |= t;
        var u = l.alternate;
        u !== null && (u.lanes |= t), Hi(l.return, t, a)
    }

    function bf(l, t, a, u, e, n) {
        var i = l.memoizedState;
        i === null ? l.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: u,
            tail: a,
            tailMode: e,
            treeForkCount: n
        } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = u, i.tail = a, i.tailMode = e, i.treeForkCount = n)
    }

    function Z0(l, t, a) {
        var u = t.pendingProps, e = u.revealOrder, n = u.tail;
        u = u.children;
        var i = Rl.current, f = (i & 2) !== 0;
        if (f ? (i = i & 1 | 2, t.flags |= 128) : i &= 1, U(Rl, i), Jl(l, t, u, a), u = tl ? Vu : 0, !f && l !== null && (l.flags & 128) !== 0) l:for (l = t.child; l !== null;) {
            if (l.tag === 13) l.memoizedState !== null && Q0(l, a, t); else if (l.tag === 19) Q0(l, a, t); else if (l.child !== null) {
                l.child.return = l, l = l.child;
                continue
            }
            if (l === t) break l;
            for (; l.sibling === null;) {
                if (l.return === null || l.return === t) break l;
                l = l.return
            }
            l.sibling.return = l.return, l = l.sibling
        }
        switch (e) {
            case"forwards":
                for (a = t.child, e = null; a !== null;) l = a.alternate, l !== null && ln(l) === null && (e = a), a = a.sibling;
                a = e, a === null ? (e = t.child, t.child = null) : (e = a.sibling, a.sibling = null), bf(t, !1, e, a, n, u);
                break;
            case"backwards":
            case"unstable_legacy-backwards":
                for (a = null, e = t.child, t.child = null; e !== null;) {
                    if (l = e.alternate, l !== null && ln(l) === null) {
                        t.child = e;
                        break
                    }
                    l = e.sibling, e.sibling = a, a = e, e = l
                }
                bf(t, !0, a, null, n, u);
                break;
            case"together":
                bf(t, !1, null, null, void 0, u);
                break;
            default:
                t.memoizedState = null
        }
        return t.child
    }

    function Kt(l, t, a) {
        if (l !== null && (t.dependencies = l.dependencies), va |= t.lanes, (a & t.childLanes) === 0) if (l !== null) {
            if (cu(l, t, a, !1), (a & t.childLanes) === 0) return null
        } else return null;
        if (l !== null && t.child !== l.child) throw Error(d(153));
        if (t.child !== null) {
            for (l = t.child, a = Xt(l, l.pendingProps), t.child = a, a.return = t; l.sibling !== null;) l = l.sibling, a = a.sibling = Xt(l, l.pendingProps), a.return = t;
            a.sibling = null
        }
        return t.child
    }

    function zf(l, t) {
        return (l.lanes & t) !== 0 ? !0 : (l = l.dependencies, !!(l !== null && Je(l)))
    }

    function td(l, t, a) {
        switch (t.tag) {
            case 3:
                kl(t, t.stateNode.containerInfo), ia(t, Cl, l.memoizedState.cache), qa();
                break;
            case 27:
            case 5:
                Uu(t);
                break;
            case 4:
                kl(t, t.stateNode.containerInfo);
                break;
            case 10:
                ia(t, t.type, t.memoizedProps.value);
                break;
            case 31:
                if (t.memoizedState !== null) return t.flags |= 128, Vi(t), null;
                break;
            case 13:
                var u = t.memoizedState;
                if (u !== null) return u.dehydrated !== null ? (oa(t), t.flags |= 128, null) : (a & t.child.childLanes) !== 0 ? X0(l, t, a) : (oa(t), l = Kt(l, t, a), l !== null ? l.sibling : null);
                oa(t);
                break;
            case 19:
                var e = (l.flags & 128) !== 0;
                if (u = (a & t.childLanes) !== 0, u || (cu(l, t, a, !1), u = (a & t.childLanes) !== 0), e) {
                    if (u) return Z0(l, t, a);
                    t.flags |= 128
                }
                if (e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null, e.lastEffect = null), U(Rl, Rl.current), u) break;
                return null;
            case 22:
                return t.lanes = 0, q0(l, t, a, t.pendingProps);
            case 24:
                ia(t, Cl, l.memoizedState.cache)
        }
        return Kt(l, t, a)
    }

    function x0(l, t, a) {
        if (l !== null) if (l.memoizedProps !== t.pendingProps) Bl = !0; else {
            if (!zf(l, a) && (t.flags & 128) === 0) return Bl = !1, td(l, t, a);
            Bl = (l.flags & 131072) !== 0
        } else Bl = !1, tl && (t.flags & 1048576) !== 0 && zs(t, Vu, t.index);
        switch (t.lanes = 0, t.tag) {
            case 16:
                l:{
                    var u = t.pendingProps;
                    if (l = Ya(t.elementType), t.type = l, typeof l == "function") Ei(l) ? (u = Za(l, u), t.tag = 1, t = Y0(null, t, l, u, a)) : (t.tag = 0, t = df(null, t, l, u, a)); else {
                        if (l != null) {
                            var e = l.$$typeof;
                            if (e === sl) {
                                t.tag = 11, t = N0(null, t, l, u, a);
                                break l
                            } else if (e === x) {
                                t.tag = 14, t = R0(null, t, l, u, a);
                                break l
                            }
                        }
                        throw t = al(l) || l, Error(d(306, t, ""))
                    }
                }
                return t;
            case 0:
                return df(l, t, t.type, t.pendingProps, a);
            case 1:
                return u = t.type, e = Za(u, t.pendingProps), Y0(l, t, u, e, a);
            case 3:
                l:{
                    if (kl(t, t.stateNode.containerInfo), l === null) throw Error(d(387));
                    u = t.pendingProps;
                    var n = t.memoizedState;
                    e = n.element, Xi(l, t), Iu(t, u, null, a);
                    var i = t.memoizedState;
                    if (u = i.cache, ia(t, Cl, u), u !== n.cache && qi(t, [Cl], a, !0), ku(), u = i.element, n.isDehydrated) if (n = {
                        element: u,
                        isDehydrated: !1,
                        cache: i.cache
                    }, t.updateQueue.baseState = n, t.memoizedState = n, t.flags & 256) {
                        t = G0(l, t, u, a);
                        break l
                    } else if (u !== e) {
                        e = pt(Error(d(424)), t), Ku(e), t = G0(l, t, u, a);
                        break l
                    } else for (l = t.stateNode.containerInfo, l.nodeType === 9 ? l = l.body : l = l.nodeName === "HTML" ? l.ownerDocument.body : l, zl = Ot(l.firstChild), Vl = t, tl = !0, ea = null, Mt = !0, a = qs(t, null, u, a), t.child = a; a;) a.flags = a.flags & -3 | 4096, a = a.sibling; else {
                        if (qa(), u === e) {
                            t = Kt(l, t, a);
                            break l
                        }
                        Jl(l, t, u, a)
                    }
                    t = t.child
                }
                return t;
            case 26:
                return mn(l, t), l === null ? (a = ly(t.type, null, t.pendingProps, null)) ? t.memoizedState = a : tl || (a = t.type, l = t.pendingProps, u = Un(W.current).createElement(a), u[Ll] = t, u[tt] = l, wl(u, a, l), Ql(u), t.stateNode = u) : t.memoizedState = ly(t.type, l.memoizedProps, t.pendingProps, l.memoizedState), null;
            case 27:
                return Uu(t), l === null && tl && (u = t.stateNode = ko(t.type, t.pendingProps, W.current), Vl = t, Mt = !0, e = zl, ba(t.type) ? (Pf = e, zl = Ot(u.firstChild)) : zl = e), Jl(l, t, t.pendingProps.children, a), mn(l, t), l === null && (t.flags |= 4194304), t.child;
            case 5:
                return l === null && tl && ((e = u = zl) && (u = Rd(u, t.type, t.pendingProps, Mt), u !== null ? (t.stateNode = u, Vl = t, zl = Ot(u.firstChild), Mt = !1, e = !0) : e = !1), e || na(t)), Uu(t), e = t.type, n = t.pendingProps, i = l !== null ? l.memoizedProps : null, u = n.children, Wf(e, n) ? u = null : i !== null && Wf(e, i) && (t.flags |= 32), t.memoizedState !== null && (e = Ji(l, t, Jm, null, null, a), Se._currentValue = e), mn(l, t), Jl(l, t, u, a), t.child;
            case 6:
                return l === null && tl && ((l = a = zl) && (a = Hd(a, t.pendingProps, Mt), a !== null ? (t.stateNode = a, Vl = t, zl = null, l = !0) : l = !1), l || na(t)), null;
            case 13:
                return X0(l, t, a);
            case 4:
                return kl(t, t.stateNode.containerInfo), u = t.pendingProps, l === null ? t.child = Xa(t, null, u, a) : Jl(l, t, u, a), t.child;
            case 11:
                return N0(l, t, t.type, t.pendingProps, a);
            case 7:
                return Jl(l, t, t.pendingProps, a), t.child;
            case 8:
                return Jl(l, t, t.pendingProps.children, a), t.child;
            case 12:
                return Jl(l, t, t.pendingProps.children, a), t.child;
            case 10:
                return u = t.pendingProps, ia(t, t.type, u.value), Jl(l, t, u.children, a), t.child;
            case 9:
                return e = t.type._context, u = t.pendingProps.children, ja(t), e = Kl(e), u = u(e), t.flags |= 1, Jl(l, t, u, a), t.child;
            case 14:
                return R0(l, t, t.type, t.pendingProps, a);
            case 15:
                return H0(l, t, t.type, t.pendingProps, a);
            case 19:
                return Z0(l, t, a);
            case 31:
                return ld(l, t, a);
            case 22:
                return q0(l, t, a, t.pendingProps);
            case 24:
                return ja(t), u = Kl(Cl), l === null ? (e = Bi(), e === null && (e = Sl, n = Ci(), e.pooledCache = n, n.refCount++, n !== null && (e.pooledCacheLanes |= a), e = n), t.memoizedState = {
                    parent: u,
                    cache: e
                }, Gi(t), ia(t, Cl, e)) : ((l.lanes & a) !== 0 && (Xi(l, t), Iu(t, null, null, a), ku()), e = l.memoizedState, n = t.memoizedState, e.parent !== u ? (e = {
                    parent: u,
                    cache: u
                }, t.memoizedState = e, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = e), ia(t, Cl, u)) : (u = n.cache, ia(t, Cl, u), u !== e.cache && qi(t, [Cl], a, !0))), Jl(l, t, t.pendingProps.children, a), t.child;
            case 29:
                throw t.pendingProps
        }
        throw Error(d(156, t.tag))
    }

    function Jt(l) {
        l.flags |= 4
    }

    function Tf(l, t, a, u, e) {
        if ((t = (l.mode & 32) !== 0) && (t = !1), t) {
            if (l.flags |= 16777216, (e & 335544128) === e) if (l.stateNode.complete) l.flags |= 8192; else if (go()) l.flags |= 8192; else throw Ga = Fe, Yi
        } else l.flags &= -16777217
    }

    function L0(l, t) {
        if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0) l.flags &= -16777217; else if (l.flags |= 16777216, !ny(t)) if (go()) l.flags |= 8192; else throw Ga = Fe, Yi
    }

    function vn(l, t) {
        t !== null && (l.flags |= 4), l.flags & 16384 && (t = l.tag !== 22 ? pc() : 536870912, l.lanes |= t, zu |= t)
    }

    function ee(l, t) {
        if (!tl) switch (l.tailMode) {
            case"hidden":
                t = l.tail;
                for (var a = null; t !== null;) t.alternate !== null && (a = t), t = t.sibling;
                a === null ? l.tail = null : a.sibling = null;
                break;
            case"collapsed":
                a = l.tail;
                for (var u = null; a !== null;) a.alternate !== null && (u = a), a = a.sibling;
                u === null ? t || l.tail === null ? l.tail = null : l.tail.sibling = null : u.sibling = null
        }
    }

    function Tl(l) {
        var t = l.alternate !== null && l.alternate.child === l.child, a = 0, u = 0;
        if (t) for (var e = l.child; e !== null;) a |= e.lanes | e.childLanes, u |= e.subtreeFlags & 65011712, u |= e.flags & 65011712, e.return = l, e = e.sibling; else for (e = l.child; e !== null;) a |= e.lanes | e.childLanes, u |= e.subtreeFlags, u |= e.flags, e.return = l, e = e.sibling;
        return l.subtreeFlags |= u, l.childLanes = a, t
    }

    function ad(l, t, a) {
        var u = t.pendingProps;
        switch (Di(t), t.tag) {
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
                return Tl(t), null;
            case 1:
                return Tl(t), null;
            case 3:
                return a = t.stateNode, u = null, l !== null && (u = l.memoizedState.cache), t.memoizedState.cache !== u && (t.flags |= 2048), xt(Cl), Nl(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (l === null || l.child === null) && (fu(t) ? Jt(t) : l === null || l.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Ni())), Tl(t), null;
            case 26:
                var e = t.type, n = t.memoizedState;
                return l === null ? (Jt(t), n !== null ? (Tl(t), L0(t, n)) : (Tl(t), Tf(t, e, null, u, a))) : n ? n !== l.memoizedState ? (Jt(t), Tl(t), L0(t, n)) : (Tl(t), t.flags &= -16777217) : (l = l.memoizedProps, l !== u && Jt(t), Tl(t), Tf(t, e, l, u, a)), null;
            case 27:
                if (Ee(t), a = W.current, e = t.type, l !== null && t.stateNode != null) l.memoizedProps !== u && Jt(t); else {
                    if (!u) {
                        if (t.stateNode === null) throw Error(d(166));
                        return Tl(t), null
                    }
                    l = N.current, fu(t) ? ps(t) : (l = ko(e, u, a), t.stateNode = l, Jt(t))
                }
                return Tl(t), null;
            case 5:
                if (Ee(t), e = t.type, l !== null && t.stateNode != null) l.memoizedProps !== u && Jt(t); else {
                    if (!u) {
                        if (t.stateNode === null) throw Error(d(166));
                        return Tl(t), null
                    }
                    if (n = N.current, fu(t)) ps(t); else {
                        var i = Un(W.current);
                        switch (n) {
                            case 1:
                                n = i.createElementNS("http://www.w3.org/2000/svg", e);
                                break;
                            case 2:
                                n = i.createElementNS("http://www.w3.org/1998/Math/MathML", e);
                                break;
                            default:
                                switch (e) {
                                    case"svg":
                                        n = i.createElementNS("http://www.w3.org/2000/svg", e);
                                        break;
                                    case"math":
                                        n = i.createElementNS("http://www.w3.org/1998/Math/MathML", e);
                                        break;
                                    case"script":
                                        n = i.createElement("div"), n.innerHTML = "<script><\/script>", n = n.removeChild(n.firstChild);
                                        break;
                                    case"select":
                                        n = typeof u.is == "string" ? i.createElement("select", {is: u.is}) : i.createElement("select"), u.multiple ? n.multiple = !0 : u.size && (n.size = u.size);
                                        break;
                                    default:
                                        n = typeof u.is == "string" ? i.createElement(e, {is: u.is}) : i.createElement(e)
                                }
                        }
                        n[Ll] = t, n[tt] = u;
                        l:for (i = t.child; i !== null;) {
                            if (i.tag === 5 || i.tag === 6) n.appendChild(i.stateNode); else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                                i.child.return = i, i = i.child;
                                continue
                            }
                            if (i === t) break l;
                            for (; i.sibling === null;) {
                                if (i.return === null || i.return === t) break l;
                                i = i.return
                            }
                            i.sibling.return = i.return, i = i.sibling
                        }
                        t.stateNode = n;
                        l:switch (wl(n, e, u), e) {
                            case"button":
                            case"input":
                            case"select":
                            case"textarea":
                                u = !!u.autoFocus;
                                break l;
                            case"img":
                                u = !0;
                                break l;
                            default:
                                u = !1
                        }
                        u && Jt(t)
                    }
                }
                return Tl(t), Tf(t, t.type, l === null ? null : l.memoizedProps, t.pendingProps, a), null;
            case 6:
                if (l && t.stateNode != null) l.memoizedProps !== u && Jt(t); else {
                    if (typeof u != "string" && t.stateNode === null) throw Error(d(166));
                    if (l = W.current, fu(t)) {
                        if (l = t.stateNode, a = t.memoizedProps, u = null, e = Vl, e !== null) switch (e.tag) {
                            case 27:
                            case 5:
                                u = e.memoizedProps
                        }
                        l[Ll] = t, l = !!(l.nodeValue === a || u !== null && u.suppressHydrationWarning === !0 || Qo(l.nodeValue, a)), l || na(t, !0)
                    } else l = Un(l).createTextNode(u), l[Ll] = t, t.stateNode = l
                }
                return Tl(t), null;
            case 31:
                if (a = t.memoizedState, l === null || l.memoizedState !== null) {
                    if (u = fu(t), a !== null) {
                        if (l === null) {
                            if (!u) throw Error(d(318));
                            if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(d(557));
                            l[Ll] = t
                        } else qa(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                        Tl(t), l = !1
                    } else a = Ni(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = a), l = !0;
                    if (!l) return t.flags & 256 ? (vt(t), t) : (vt(t), null);
                    if ((t.flags & 128) !== 0) throw Error(d(558))
                }
                return Tl(t), null;
            case 13:
                if (u = t.memoizedState, l === null || l.memoizedState !== null && l.memoizedState.dehydrated !== null) {
                    if (e = fu(t), u !== null && u.dehydrated !== null) {
                        if (l === null) {
                            if (!e) throw Error(d(318));
                            if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(d(317));
                            e[Ll] = t
                        } else qa(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
                        Tl(t), e = !1
                    } else e = Ni(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = e), e = !0;
                    if (!e) return t.flags & 256 ? (vt(t), t) : (vt(t), null)
                }
                return vt(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = u !== null, l = l !== null && l.memoizedState !== null, a && (u = t.child, e = null, u.alternate !== null && u.alternate.memoizedState !== null && u.alternate.memoizedState.cachePool !== null && (e = u.alternate.memoizedState.cachePool.pool), n = null, u.memoizedState !== null && u.memoizedState.cachePool !== null && (n = u.memoizedState.cachePool.pool), n !== e && (u.flags |= 2048)), a !== l && a && (t.child.flags |= 8192), vn(t, t.updateQueue), Tl(t), null);
            case 4:
                return Nl(), l === null && Lf(t.stateNode.containerInfo), Tl(t), null;
            case 10:
                return xt(t.type), Tl(t), null;
            case 19:
                if (p(Rl), u = t.memoizedState, u === null) return Tl(t), null;
                if (e = (t.flags & 128) !== 0, n = u.rendering, n === null) if (e) ee(u, !1); else {
                    if (Dl !== 0 || l !== null && (l.flags & 128) !== 0) for (l = t.child; l !== null;) {
                        if (n = ln(l), n !== null) {
                            for (t.flags |= 128, ee(u, !1), l = n.updateQueue, t.updateQueue = l, vn(t, l), t.subtreeFlags = 0, l = a, a = t.child; a !== null;) rs(a, l), a = a.sibling;
                            return U(Rl, Rl.current & 1 | 2), tl && Qt(t, u.treeForkCount), t.child
                        }
                        l = l.sibling
                    }
                    u.tail !== null && ct() > bn && (t.flags |= 128, e = !0, ee(u, !1), t.lanes = 4194304)
                } else {
                    if (!e) if (l = ln(n), l !== null) {
                        if (t.flags |= 128, e = !0, l = l.updateQueue, t.updateQueue = l, vn(t, l), ee(u, !0), u.tail === null && u.tailMode === "hidden" && !n.alternate && !tl) return Tl(t), null
                    } else 2 * ct() - u.renderingStartTime > bn && a !== 536870912 && (t.flags |= 128, e = !0, ee(u, !1), t.lanes = 4194304);
                    u.isBackwards ? (n.sibling = t.child, t.child = n) : (l = u.last, l !== null ? l.sibling = n : t.child = n, u.last = n)
                }
                return u.tail !== null ? (l = u.tail, u.rendering = l, u.tail = l.sibling, u.renderingStartTime = ct(), l.sibling = null, a = Rl.current, U(Rl, e ? a & 1 | 2 : a & 1), tl && Qt(t, u.treeForkCount), l) : (Tl(t), null);
            case 22:
            case 23:
                return vt(t), Li(), u = t.memoizedState !== null, l !== null ? l.memoizedState !== null !== u && (t.flags |= 8192) : u && (t.flags |= 8192), u ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (Tl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Tl(t), a = t.updateQueue, a !== null && vn(t, a.retryQueue), a = null, l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (a = l.memoizedState.cachePool.pool), u = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (u = t.memoizedState.cachePool.pool), u !== a && (t.flags |= 2048), l !== null && p(Ba), null;
            case 24:
                return a = null, l !== null && (a = l.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), xt(Cl), Tl(t), null;
            case 25:
                return null;
            case 30:
                return null
        }
        throw Error(d(156, t.tag))
    }

    function ud(l, t) {
        switch (Di(t), t.tag) {
            case 1:
                return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
            case 3:
                return xt(Cl), Nl(), l = t.flags, (l & 65536) !== 0 && (l & 128) === 0 ? (t.flags = l & -65537 | 128, t) : null;
            case 26:
            case 27:
            case 5:
                return Ee(t), null;
            case 31:
                if (t.memoizedState !== null) {
                    if (vt(t), t.alternate === null) throw Error(d(340));
                    qa()
                }
                return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
            case 13:
                if (vt(t), l = t.memoizedState, l !== null && l.dehydrated !== null) {
                    if (t.alternate === null) throw Error(d(340));
                    qa()
                }
                return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
            case 19:
                return p(Rl), null;
            case 4:
                return Nl(), null;
            case 10:
                return xt(t.type), null;
            case 22:
            case 23:
                return vt(t), Li(), l !== null && p(Ba), l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
            case 24:
                return xt(Cl), null;
            case 25:
                return null;
            default:
                return null
        }
    }

    function V0(l, t) {
        switch (Di(t), t.tag) {
            case 3:
                xt(Cl), Nl();
                break;
            case 26:
            case 27:
            case 5:
                Ee(t);
                break;
            case 4:
                Nl();
                break;
            case 31:
                t.memoizedState !== null && vt(t);
                break;
            case 13:
                vt(t);
                break;
            case 19:
                p(Rl);
                break;
            case 10:
                xt(t.type);
                break;
            case 22:
            case 23:
                vt(t), Li(), l !== null && p(Ba);
                break;
            case 24:
                xt(Cl)
        }
    }

    function ne(l, t) {
        try {
            var a = t.updateQueue, u = a !== null ? a.lastEffect : null;
            if (u !== null) {
                var e = u.next;
                a = e;
                do {
                    if ((a.tag & l) === l) {
                        u = void 0;
                        var n = a.create, i = a.inst;
                        u = n(), i.destroy = u
                    }
                    a = a.next
                } while (a !== e)
            }
        } catch (f) {
            ml(t, t.return, f)
        }
    }

    function ma(l, t, a) {
        try {
            var u = t.updateQueue, e = u !== null ? u.lastEffect : null;
            if (e !== null) {
                var n = e.next;
                u = n;
                do {
                    if ((u.tag & l) === l) {
                        var i = u.inst, f = i.destroy;
                        if (f !== void 0) {
                            i.destroy = void 0, e = t;
                            var c = a, h = f;
                            try {
                                h()
                            } catch (z) {
                                ml(e, c, z)
                            }
                        }
                    }
                    u = u.next
                } while (u !== n)
            }
        } catch (z) {
            ml(t, t.return, z)
        }
    }

    function K0(l) {
        var t = l.updateQueue;
        if (t !== null) {
            var a = l.stateNode;
            try {
                js(t, a)
            } catch (u) {
                ml(l, l.return, u)
            }
        }
    }

    function J0(l, t, a) {
        a.props = Za(l.type, l.memoizedProps), a.state = l.memoizedState;
        try {
            a.componentWillUnmount()
        } catch (u) {
            ml(l, t, u)
        }
    }

    function ie(l, t) {
        try {
            var a = l.ref;
            if (a !== null) {
                switch (l.tag) {
                    case 26:
                    case 27:
                    case 5:
                        var u = l.stateNode;
                        break;
                    case 30:
                        u = l.stateNode;
                        break;
                    default:
                        u = l.stateNode
                }
                typeof a == "function" ? l.refCleanup = a(u) : a.current = u
            }
        } catch (e) {
            ml(l, t, e)
        }
    }

    function Ct(l, t) {
        var a = l.ref, u = l.refCleanup;
        if (a !== null) if (typeof u == "function") try {
            u()
        } catch (e) {
            ml(l, t, e)
        } finally {
            l.refCleanup = null, l = l.alternate, l != null && (l.refCleanup = null)
        } else if (typeof a == "function") try {
            a(null)
        } catch (e) {
            ml(l, t, e)
        } else a.current = null
    }

    function w0(l) {
        var t = l.type, a = l.memoizedProps, u = l.stateNode;
        try {
            l:switch (t) {
                case"button":
                case"input":
                case"select":
                case"textarea":
                    a.autoFocus && u.focus();
                    break l;
                case"img":
                    a.src ? u.src = a.src : a.srcSet && (u.srcset = a.srcSet)
            }
        } catch (e) {
            ml(l, l.return, e)
        }
    }

    function pf(l, t, a) {
        try {
            var u = l.stateNode;
            Md(u, l.type, a, t), u[tt] = t
        } catch (e) {
            ml(l, l.return, e)
        }
    }

    function W0(l) {
        return l.tag === 5 || l.tag === 3 || l.tag === 26 || l.tag === 27 && ba(l.type) || l.tag === 4
    }

    function Af(l) {
        l:for (; ;) {
            for (; l.sibling === null;) {
                if (l.return === null || W0(l.return)) return null;
                l = l.return
            }
            for (l.sibling.return = l.return, l = l.sibling; l.tag !== 5 && l.tag !== 6 && l.tag !== 18;) {
                if (l.tag === 27 && ba(l.type) || l.flags & 2 || l.child === null || l.tag === 4) continue l;
                l.child.return = l, l = l.child
            }
            if (!(l.flags & 2)) return l.stateNode
        }
    }

    function Ef(l, t, a) {
        var u = l.tag;
        if (u === 5 || u === 6) l = l.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(l, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(l), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = Yt)); else if (u !== 4 && (u === 27 && ba(l.type) && (a = l.stateNode, t = null), l = l.child, l !== null)) for (Ef(l, t, a), l = l.sibling; l !== null;) Ef(l, t, a), l = l.sibling
    }

    function hn(l, t, a) {
        var u = l.tag;
        if (u === 5 || u === 6) l = l.stateNode, t ? a.insertBefore(l, t) : a.appendChild(l); else if (u !== 4 && (u === 27 && ba(l.type) && (a = l.stateNode), l = l.child, l !== null)) for (hn(l, t, a), l = l.sibling; l !== null;) hn(l, t, a), l = l.sibling
    }

    function $0(l) {
        var t = l.stateNode, a = l.memoizedProps;
        try {
            for (var u = l.type, e = t.attributes; e.length;) t.removeAttributeNode(e[0]);
            wl(t, u, a), t[Ll] = l, t[tt] = a
        } catch (n) {
            ml(l, l.return, n)
        }
    }

    var wt = !1, Yl = !1, Mf = !1, F0 = typeof WeakSet == "function" ? WeakSet : Set, Zl = null;

    function ed(l, t) {
        if (l = l.containerInfo, Jf = Bn, l = cs(l), ri(l)) {
            if ("selectionStart" in l) var a = {start: l.selectionStart, end: l.selectionEnd}; else l:{
                a = (a = l.ownerDocument) && a.defaultView || window;
                var u = a.getSelection && a.getSelection();
                if (u && u.rangeCount !== 0) {
                    a = u.anchorNode;
                    var e = u.anchorOffset, n = u.focusNode;
                    u = u.focusOffset;
                    try {
                        a.nodeType, n.nodeType
                    } catch {
                        a = null;
                        break l
                    }
                    var i = 0, f = -1, c = -1, h = 0, z = 0, A = l, g = null;
                    t:for (; ;) {
                        for (var r; A !== a || e !== 0 && A.nodeType !== 3 || (f = i + e), A !== n || u !== 0 && A.nodeType !== 3 || (c = i + u), A.nodeType === 3 && (i += A.nodeValue.length), (r = A.firstChild) !== null;) g = A, A = r;
                        for (; ;) {
                            if (A === l) break t;
                            if (g === a && ++h === e && (f = i), g === n && ++z === u && (c = i), (r = A.nextSibling) !== null) break;
                            A = g, g = A.parentNode
                        }
                        A = r
                    }
                    a = f === -1 || c === -1 ? null : {start: f, end: c}
                } else a = null
            }
            a = a || {start: 0, end: 0}
        } else a = null;
        for (wf = {
            focusedElem: l,
            selectionRange: a
        }, Bn = !1, Zl = t; Zl !== null;) if (t = Zl, l = t.child, (t.subtreeFlags & 1028) !== 0 && l !== null) l.return = t, Zl = l; else for (; Zl !== null;) {
            switch (t = Zl, n = t.alternate, l = t.flags, t.tag) {
                case 0:
                    if ((l & 4) !== 0 && (l = t.updateQueue, l = l !== null ? l.events : null, l !== null)) for (a = 0; a < l.length; a++) e = l[a], e.ref.impl = e.nextImpl;
                    break;
                case 11:
                case 15:
                    break;
                case 1:
                    if ((l & 1024) !== 0 && n !== null) {
                        l = void 0, a = t, e = n.memoizedProps, n = n.memoizedState, u = a.stateNode;
                        try {
                            var H = Za(a.type, e);
                            l = u.getSnapshotBeforeUpdate(H, n), u.__reactInternalSnapshotBeforeUpdate = l
                        } catch (Z) {
                            ml(a, a.return, Z)
                        }
                    }
                    break;
                case 3:
                    if ((l & 1024) !== 0) {
                        if (l = t.stateNode.containerInfo, a = l.nodeType, a === 9) Ff(l); else if (a === 1) switch (l.nodeName) {
                            case"HEAD":
                            case"HTML":
                            case"BODY":
                                Ff(l);
                                break;
                            default:
                                l.textContent = ""
                        }
                    }
                    break;
                case 5:
                case 26:
                case 27:
                case 6:
                case 4:
                case 17:
                    break;
                default:
                    if ((l & 1024) !== 0) throw Error(d(163))
            }
            if (l = t.sibling, l !== null) {
                l.return = t.return, Zl = l;
                break
            }
            Zl = t.return
        }
    }

    function k0(l, t, a) {
        var u = a.flags;
        switch (a.tag) {
            case 0:
            case 11:
            case 15:
                $t(l, a), u & 4 && ne(5, a);
                break;
            case 1:
                if ($t(l, a), u & 4) if (l = a.stateNode, t === null) try {
                    l.componentDidMount()
                } catch (i) {
                    ml(a, a.return, i)
                } else {
                    var e = Za(a.type, t.memoizedProps);
                    t = t.memoizedState;
                    try {
                        l.componentDidUpdate(e, t, l.__reactInternalSnapshotBeforeUpdate)
                    } catch (i) {
                        ml(a, a.return, i)
                    }
                }
                u & 64 && K0(a), u & 512 && ie(a, a.return);
                break;
            case 3:
                if ($t(l, a), u & 64 && (l = a.updateQueue, l !== null)) {
                    if (t = null, a.child !== null) switch (a.child.tag) {
                        case 27:
                        case 5:
                            t = a.child.stateNode;
                            break;
                        case 1:
                            t = a.child.stateNode
                    }
                    try {
                        js(l, t)
                    } catch (i) {
                        ml(a, a.return, i)
                    }
                }
                break;
            case 27:
                t === null && u & 4 && $0(a);
            case 26:
            case 5:
                $t(l, a), t === null && u & 4 && w0(a), u & 512 && ie(a, a.return);
                break;
            case 12:
                $t(l, a);
                break;
            case 31:
                $t(l, a), u & 4 && lo(l, a);
                break;
            case 13:
                $t(l, a), u & 4 && to(l, a), u & 64 && (l = a.memoizedState, l !== null && (l = l.dehydrated, l !== null && (a = dd.bind(null, a), qd(l, a))));
                break;
            case 22:
                if (u = a.memoizedState !== null || wt, !u) {
                    t = t !== null && t.memoizedState !== null || Yl, e = wt;
                    var n = Yl;
                    wt = u, (Yl = t) && !n ? Ft(l, a, (a.subtreeFlags & 8772) !== 0) : $t(l, a), wt = e, Yl = n
                }
                break;
            case 30:
                break;
            default:
                $t(l, a)
        }
    }

    function I0(l) {
        var t = l.alternate;
        t !== null && (l.alternate = null, I0(t)), l.child = null, l.deletions = null, l.sibling = null, l.tag === 5 && (t = l.stateNode, t !== null && li(t)), l.stateNode = null, l.return = null, l.dependencies = null, l.memoizedProps = null, l.memoizedState = null, l.pendingProps = null, l.stateNode = null, l.updateQueue = null
    }

    var Al = null, ut = !1;

    function Wt(l, t, a) {
        for (a = a.child; a !== null;) P0(l, t, a), a = a.sibling
    }

    function P0(l, t, a) {
        if (st && typeof st.onCommitFiberUnmount == "function") try {
            st.onCommitFiberUnmount(Nu, a)
        } catch {
        }
        switch (a.tag) {
            case 26:
                Yl || Ct(a, t), Wt(l, t, a), a.memoizedState ? a.memoizedState.count-- : a.stateNode && (a = a.stateNode, a.parentNode.removeChild(a));
                break;
            case 27:
                Yl || Ct(a, t);
                var u = Al, e = ut;
                ba(a.type) && (Al = a.stateNode, ut = !1), Wt(l, t, a), he(a.stateNode), Al = u, ut = e;
                break;
            case 5:
                Yl || Ct(a, t);
            case 6:
                if (u = Al, e = ut, Al = null, Wt(l, t, a), Al = u, ut = e, Al !== null) if (ut) try {
                    (Al.nodeType === 9 ? Al.body : Al.nodeName === "HTML" ? Al.ownerDocument.body : Al).removeChild(a.stateNode)
                } catch (n) {
                    ml(a, t, n)
                } else try {
                    Al.removeChild(a.stateNode)
                } catch (n) {
                    ml(a, t, n)
                }
                break;
            case 18:
                Al !== null && (ut ? (l = Al, Jo(l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l, a.stateNode), Du(l)) : Jo(Al, a.stateNode));
                break;
            case 4:
                u = Al, e = ut, Al = a.stateNode.containerInfo, ut = !0, Wt(l, t, a), Al = u, ut = e;
                break;
            case 0:
            case 11:
            case 14:
            case 15:
                ma(2, a, t), Yl || ma(4, a, t), Wt(l, t, a);
                break;
            case 1:
                Yl || (Ct(a, t), u = a.stateNode, typeof u.componentWillUnmount == "function" && J0(a, t, u)), Wt(l, t, a);
                break;
            case 21:
                Wt(l, t, a);
                break;
            case 22:
                Yl = (u = Yl) || a.memoizedState !== null, Wt(l, t, a), Yl = u;
                break;
            default:
                Wt(l, t, a)
        }
    }

    function lo(l, t) {
        if (t.memoizedState === null && (l = t.alternate, l !== null && (l = l.memoizedState, l !== null))) {
            l = l.dehydrated;
            try {
                Du(l)
            } catch (a) {
                ml(t, t.return, a)
            }
        }
    }

    function to(l, t) {
        if (t.memoizedState === null && (l = t.alternate, l !== null && (l = l.memoizedState, l !== null && (l = l.dehydrated, l !== null)))) try {
            Du(l)
        } catch (a) {
            ml(t, t.return, a)
        }
    }

    function nd(l) {
        switch (l.tag) {
            case 31:
            case 13:
            case 19:
                var t = l.stateNode;
                return t === null && (t = l.stateNode = new F0), t;
            case 22:
                return l = l.stateNode, t = l._retryCache, t === null && (t = l._retryCache = new F0), t;
            default:
                throw Error(d(435, l.tag))
        }
    }

    function gn(l, t) {
        var a = nd(l);
        t.forEach(function (u) {
            if (!a.has(u)) {
                a.add(u);
                var e = vd.bind(null, l, u);
                u.then(e, e)
            }
        })
    }

    function et(l, t) {
        var a = t.deletions;
        if (a !== null) for (var u = 0; u < a.length; u++) {
            var e = a[u], n = l, i = t, f = i;
            l:for (; f !== null;) {
                switch (f.tag) {
                    case 27:
                        if (ba(f.type)) {
                            Al = f.stateNode, ut = !1;
                            break l
                        }
                        break;
                    case 5:
                        Al = f.stateNode, ut = !1;
                        break l;
                    case 3:
                    case 4:
                        Al = f.stateNode.containerInfo, ut = !0;
                        break l
                }
                f = f.return
            }
            if (Al === null) throw Error(d(160));
            P0(n, i, e), Al = null, ut = !1, n = e.alternate, n !== null && (n.return = null), e.return = null
        }
        if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) ao(t, l), t = t.sibling
    }

    var Nt = null;

    function ao(l, t) {
        var a = l.alternate, u = l.flags;
        switch (l.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                et(t, l), nt(l), u & 4 && (ma(3, l, l.return), ne(3, l), ma(5, l, l.return));
                break;
            case 1:
                et(t, l), nt(l), u & 512 && (Yl || a === null || Ct(a, a.return)), u & 64 && wt && (l = l.updateQueue, l !== null && (u = l.callbacks, u !== null && (a = l.shared.hiddenCallbacks, l.shared.hiddenCallbacks = a === null ? u : a.concat(u))));
                break;
            case 26:
                var e = Nt;
                if (et(t, l), nt(l), u & 512 && (Yl || a === null || Ct(a, a.return)), u & 4) {
                    var n = a !== null ? a.memoizedState : null;
                    if (u = l.memoizedState, a === null) if (u === null) if (l.stateNode === null) {
                        l:{
                            u = l.type, a = l.memoizedProps, e = e.ownerDocument || e;
                            t:switch (u) {
                                case"title":
                                    n = e.getElementsByTagName("title")[0], (!n || n[qu] || n[Ll] || n.namespaceURI === "http://www.w3.org/2000/svg" || n.hasAttribute("itemprop")) && (n = e.createElement(u), e.head.insertBefore(n, e.querySelector("head > title"))), wl(n, u, a), n[Ll] = l, Ql(n), u = n;
                                    break l;
                                case"link":
                                    var i = uy("link", "href", e).get(u + (a.href || ""));
                                    if (i) {
                                        for (var f = 0; f < i.length; f++) if (n = i[f], n.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && n.getAttribute("rel") === (a.rel == null ? null : a.rel) && n.getAttribute("title") === (a.title == null ? null : a.title) && n.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                                            i.splice(f, 1);
                                            break t
                                        }
                                    }
                                    n = e.createElement(u), wl(n, u, a), e.head.appendChild(n);
                                    break;
                                case"meta":
                                    if (i = uy("meta", "content", e).get(u + (a.content || ""))) {
                                        for (f = 0; f < i.length; f++) if (n = i[f], n.getAttribute("content") === (a.content == null ? null : "" + a.content) && n.getAttribute("name") === (a.name == null ? null : a.name) && n.getAttribute("property") === (a.property == null ? null : a.property) && n.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && n.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                                            i.splice(f, 1);
                                            break t
                                        }
                                    }
                                    n = e.createElement(u), wl(n, u, a), e.head.appendChild(n);
                                    break;
                                default:
                                    throw Error(d(468, u))
                            }
                            n[Ll] = l, Ql(n), u = n
                        }
                        l.stateNode = u
                    } else ey(e, l.type, l.stateNode); else l.stateNode = ay(e, u, l.memoizedProps); else n !== u ? (n === null ? a.stateNode !== null && (a = a.stateNode, a.parentNode.removeChild(a)) : n.count--, u === null ? ey(e, l.type, l.stateNode) : ay(e, u, l.memoizedProps)) : u === null && l.stateNode !== null && pf(l, l.memoizedProps, a.memoizedProps)
                }
                break;
            case 27:
                et(t, l), nt(l), u & 512 && (Yl || a === null || Ct(a, a.return)), a !== null && u & 4 && pf(l, l.memoizedProps, a.memoizedProps);
                break;
            case 5:
                if (et(t, l), nt(l), u & 512 && (Yl || a === null || Ct(a, a.return)), l.flags & 32) {
                    e = l.stateNode;
                    try {
                        ka(e, "")
                    } catch (H) {
                        ml(l, l.return, H)
                    }
                }
                u & 4 && l.stateNode != null && (e = l.memoizedProps, pf(l, e, a !== null ? a.memoizedProps : e)), u & 1024 && (Mf = !0);
                break;
            case 6:
                if (et(t, l), nt(l), u & 4) {
                    if (l.stateNode === null) throw Error(d(162));
                    u = l.memoizedProps, a = l.stateNode;
                    try {
                        a.nodeValue = u
                    } catch (H) {
                        ml(l, l.return, H)
                    }
                }
                break;
            case 3:
                if (Hn = null, e = Nt, Nt = Nn(t.containerInfo), et(t, l), Nt = e, nt(l), u & 4 && a !== null && a.memoizedState.isDehydrated) try {
                    Du(t.containerInfo)
                } catch (H) {
                    ml(l, l.return, H)
                }
                Mf && (Mf = !1, uo(l));
                break;
            case 4:
                u = Nt, Nt = Nn(l.stateNode.containerInfo), et(t, l), nt(l), Nt = u;
                break;
            case 12:
                et(t, l), nt(l);
                break;
            case 31:
                et(t, l), nt(l), u & 4 && (u = l.updateQueue, u !== null && (l.updateQueue = null, gn(l, u)));
                break;
            case 13:
                et(t, l), nt(l), l.child.flags & 8192 && l.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Sn = ct()), u & 4 && (u = l.updateQueue, u !== null && (l.updateQueue = null, gn(l, u)));
                break;
            case 22:
                e = l.memoizedState !== null;
                var c = a !== null && a.memoizedState !== null, h = wt, z = Yl;
                if (wt = h || e, Yl = z || c, et(t, l), Yl = z, wt = h, nt(l), u & 8192) l:for (t = l.stateNode, t._visibility = e ? t._visibility & -2 : t._visibility | 1, e && (a === null || c || wt || Yl || xa(l)), a = null, t = l; ;) {
                    if (t.tag === 5 || t.tag === 26) {
                        if (a === null) {
                            c = a = t;
                            try {
                                if (n = c.stateNode, e) i = n.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none"; else {
                                    f = c.stateNode;
                                    var A = c.memoizedProps.style,
                                        g = A != null && A.hasOwnProperty("display") ? A.display : null;
                                    f.style.display = g == null || typeof g == "boolean" ? "" : ("" + g).trim()
                                }
                            } catch (H) {
                                ml(c, c.return, H)
                            }
                        }
                    } else if (t.tag === 6) {
                        if (a === null) {
                            c = t;
                            try {
                                c.stateNode.nodeValue = e ? "" : c.memoizedProps
                            } catch (H) {
                                ml(c, c.return, H)
                            }
                        }
                    } else if (t.tag === 18) {
                        if (a === null) {
                            c = t;
                            try {
                                var r = c.stateNode;
                                e ? wo(r, !0) : wo(c.stateNode, !1)
                            } catch (H) {
                                ml(c, c.return, H)
                            }
                        }
                    } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === l) && t.child !== null) {
                        t.child.return = t, t = t.child;
                        continue
                    }
                    if (t === l) break l;
                    for (; t.sibling === null;) {
                        if (t.return === null || t.return === l) break l;
                        a === t && (a = null), t = t.return
                    }
                    a === t && (a = null), t.sibling.return = t.return, t = t.sibling
                }
                u & 4 && (u = l.updateQueue, u !== null && (a = u.retryQueue, a !== null && (u.retryQueue = null, gn(l, a))));
                break;
            case 19:
                et(t, l), nt(l), u & 4 && (u = l.updateQueue, u !== null && (l.updateQueue = null, gn(l, u)));
                break;
            case 30:
                break;
            case 21:
                break;
            default:
                et(t, l), nt(l)
        }
    }

    function nt(l) {
        var t = l.flags;
        if (t & 2) {
            try {
                for (var a, u = l.return; u !== null;) {
                    if (W0(u)) {
                        a = u;
                        break
                    }
                    u = u.return
                }
                if (a == null) throw Error(d(160));
                switch (a.tag) {
                    case 27:
                        var e = a.stateNode, n = Af(l);
                        hn(l, n, e);
                        break;
                    case 5:
                        var i = a.stateNode;
                        a.flags & 32 && (ka(i, ""), a.flags &= -33);
                        var f = Af(l);
                        hn(l, f, i);
                        break;
                    case 3:
                    case 4:
                        var c = a.stateNode.containerInfo, h = Af(l);
                        Ef(l, h, c);
                        break;
                    default:
                        throw Error(d(161))
                }
            } catch (z) {
                ml(l, l.return, z)
            }
            l.flags &= -3
        }
        t & 4096 && (l.flags &= -4097)
    }

    function uo(l) {
        if (l.subtreeFlags & 1024) for (l = l.child; l !== null;) {
            var t = l;
            uo(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), l = l.sibling
        }
    }

    function $t(l, t) {
        if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) k0(l, t.alternate, t), t = t.sibling
    }

    function xa(l) {
        for (l = l.child; l !== null;) {
            var t = l;
            switch (t.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                    ma(4, t, t.return), xa(t);
                    break;
                case 1:
                    Ct(t, t.return);
                    var a = t.stateNode;
                    typeof a.componentWillUnmount == "function" && J0(t, t.return, a), xa(t);
                    break;
                case 27:
                    he(t.stateNode);
                case 26:
                case 5:
                    Ct(t, t.return), xa(t);
                    break;
                case 22:
                    t.memoizedState === null && xa(t);
                    break;
                case 30:
                    xa(t);
                    break;
                default:
                    xa(t)
            }
            l = l.sibling
        }
    }

    function Ft(l, t, a) {
        for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null;) {
            var u = t.alternate, e = l, n = t, i = n.flags;
            switch (n.tag) {
                case 0:
                case 11:
                case 15:
                    Ft(e, n, a), ne(4, n);
                    break;
                case 1:
                    if (Ft(e, n, a), u = n, e = u.stateNode, typeof e.componentDidMount == "function") try {
                        e.componentDidMount()
                    } catch (h) {
                        ml(u, u.return, h)
                    }
                    if (u = n, e = u.updateQueue, e !== null) {
                        var f = u.stateNode;
                        try {
                            var c = e.shared.hiddenCallbacks;
                            if (c !== null) for (e.shared.hiddenCallbacks = null, e = 0; e < c.length; e++) Cs(c[e], f)
                        } catch (h) {
                            ml(u, u.return, h)
                        }
                    }
                    a && i & 64 && K0(n), ie(n, n.return);
                    break;
                case 27:
                    $0(n);
                case 26:
                case 5:
                    Ft(e, n, a), a && u === null && i & 4 && w0(n), ie(n, n.return);
                    break;
                case 12:
                    Ft(e, n, a);
                    break;
                case 31:
                    Ft(e, n, a), a && i & 4 && lo(e, n);
                    break;
                case 13:
                    Ft(e, n, a), a && i & 4 && to(e, n);
                    break;
                case 22:
                    n.memoizedState === null && Ft(e, n, a), ie(n, n.return);
                    break;
                case 30:
                    break;
                default:
                    Ft(e, n, a)
            }
            t = t.sibling
        }
    }

    function _f(l, t) {
        var a = null;
        l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (a = l.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== a && (l != null && l.refCount++, a != null && Ju(a))
    }

    function Of(l, t) {
        l = null, t.alternate !== null && (l = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== l && (t.refCount++, l != null && Ju(l))
    }

    function Rt(l, t, a, u) {
        if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) eo(l, t, a, u), t = t.sibling
    }

    function eo(l, t, a, u) {
        var e = t.flags;
        switch (t.tag) {
            case 0:
            case 11:
            case 15:
                Rt(l, t, a, u), e & 2048 && ne(9, t);
                break;
            case 1:
                Rt(l, t, a, u);
                break;
            case 3:
                Rt(l, t, a, u), e & 2048 && (l = null, t.alternate !== null && (l = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== l && (t.refCount++, l != null && Ju(l)));
                break;
            case 12:
                if (e & 2048) {
                    Rt(l, t, a, u), l = t.stateNode;
                    try {
                        var n = t.memoizedProps, i = n.id, f = n.onPostCommit;
                        typeof f == "function" && f(i, t.alternate === null ? "mount" : "update", l.passiveEffectDuration, -0)
                    } catch (c) {
                        ml(t, t.return, c)
                    }
                } else Rt(l, t, a, u);
                break;
            case 31:
                Rt(l, t, a, u);
                break;
            case 13:
                Rt(l, t, a, u);
                break;
            case 23:
                break;
            case 22:
                n = t.stateNode, i = t.alternate, t.memoizedState !== null ? n._visibility & 2 ? Rt(l, t, a, u) : fe(l, t) : n._visibility & 2 ? Rt(l, t, a, u) : (n._visibility |= 2, ru(l, t, a, u, (t.subtreeFlags & 10256) !== 0 || !1)), e & 2048 && _f(i, t);
                break;
            case 24:
                Rt(l, t, a, u), e & 2048 && Of(t.alternate, t);
                break;
            default:
                Rt(l, t, a, u)
        }
    }

    function ru(l, t, a, u, e) {
        for (e = e && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null;) {
            var n = l, i = t, f = a, c = u, h = i.flags;
            switch (i.tag) {
                case 0:
                case 11:
                case 15:
                    ru(n, i, f, c, e), ne(8, i);
                    break;
                case 23:
                    break;
                case 22:
                    var z = i.stateNode;
                    i.memoizedState !== null ? z._visibility & 2 ? ru(n, i, f, c, e) : fe(n, i) : (z._visibility |= 2, ru(n, i, f, c, e)), e && h & 2048 && _f(i.alternate, i);
                    break;
                case 24:
                    ru(n, i, f, c, e), e && h & 2048 && Of(i.alternate, i);
                    break;
                default:
                    ru(n, i, f, c, e)
            }
            t = t.sibling
        }
    }

    function fe(l, t) {
        if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
            var a = l, u = t, e = u.flags;
            switch (u.tag) {
                case 22:
                    fe(a, u), e & 2048 && _f(u.alternate, u);
                    break;
                case 24:
                    fe(a, u), e & 2048 && Of(u.alternate, u);
                    break;
                default:
                    fe(a, u)
            }
            t = t.sibling
        }
    }

    var ce = 8192;

    function Su(l, t, a) {
        if (l.subtreeFlags & ce) for (l = l.child; l !== null;) no(l, t, a), l = l.sibling
    }

    function no(l, t, a) {
        switch (l.tag) {
            case 26:
                Su(l, t, a), l.flags & ce && l.memoizedState !== null && Kd(a, Nt, l.memoizedState, l.memoizedProps);
                break;
            case 5:
                Su(l, t, a);
                break;
            case 3:
            case 4:
                var u = Nt;
                Nt = Nn(l.stateNode.containerInfo), Su(l, t, a), Nt = u;
                break;
            case 22:
                l.memoizedState === null && (u = l.alternate, u !== null && u.memoizedState !== null ? (u = ce, ce = 16777216, Su(l, t, a), ce = u) : Su(l, t, a));
                break;
            default:
                Su(l, t, a)
        }
    }

    function io(l) {
        var t = l.alternate;
        if (t !== null && (l = t.child, l !== null)) {
            t.child = null;
            do t = l.sibling, l.sibling = null, l = t; while (l !== null)
        }
    }

    function se(l) {
        var t = l.deletions;
        if ((l.flags & 16) !== 0) {
            if (t !== null) for (var a = 0; a < t.length; a++) {
                var u = t[a];
                Zl = u, co(u, l)
            }
            io(l)
        }
        if (l.subtreeFlags & 10256) for (l = l.child; l !== null;) fo(l), l = l.sibling
    }

    function fo(l) {
        switch (l.tag) {
            case 0:
            case 11:
            case 15:
                se(l), l.flags & 2048 && ma(9, l, l.return);
                break;
            case 3:
                se(l);
                break;
            case 12:
                se(l);
                break;
            case 22:
                var t = l.stateNode;
                l.memoizedState !== null && t._visibility & 2 && (l.return === null || l.return.tag !== 13) ? (t._visibility &= -3, rn(l)) : se(l);
                break;
            default:
                se(l)
        }
    }

    function rn(l) {
        var t = l.deletions;
        if ((l.flags & 16) !== 0) {
            if (t !== null) for (var a = 0; a < t.length; a++) {
                var u = t[a];
                Zl = u, co(u, l)
            }
            io(l)
        }
        for (l = l.child; l !== null;) {
            switch (t = l, t.tag) {
                case 0:
                case 11:
                case 15:
                    ma(8, t, t.return), rn(t);
                    break;
                case 22:
                    a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, rn(t));
                    break;
                default:
                    rn(t)
            }
            l = l.sibling
        }
    }

    function co(l, t) {
        for (; Zl !== null;) {
            var a = Zl;
            switch (a.tag) {
                case 0:
                case 11:
                case 15:
                    ma(8, a, t);
                    break;
                case 23:
                case 22:
                    if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
                        var u = a.memoizedState.cachePool.pool;
                        u != null && u.refCount++
                    }
                    break;
                case 24:
                    Ju(a.memoizedState.cache)
            }
            if (u = a.child, u !== null) u.return = a, Zl = u; else l:for (a = l; Zl !== null;) {
                u = Zl;
                var e = u.sibling, n = u.return;
                if (I0(u), u === a) {
                    Zl = null;
                    break l
                }
                if (e !== null) {
                    e.return = n, Zl = e;
                    break l
                }
                Zl = n
            }
        }
    }

    var id = {
            getCacheForType: function (l) {
                var t = Kl(Cl), a = t.data.get(l);
                return a === void 0 && (a = l(), t.data.set(l, a)), a
            }, cacheSignal: function () {
                return Kl(Cl).controller.signal
            }
        }, fd = typeof WeakMap == "function" ? WeakMap : Map, fl = 0, Sl = null, $ = null, k = 0, yl = 0, ht = null,
        da = !1, bu = !1, Df = !1, kt = 0, Dl = 0, va = 0, La = 0, Uf = 0, gt = 0, zu = 0, oe = null, it = null,
        Nf = !1, Sn = 0, so = 0, bn = 1 / 0, zn = null, ha = null, Gl = 0, ga = null, Tu = null, It = 0, Rf = 0,
        Hf = null, oo = null, ye = 0, qf = null;

    function rt() {
        return (fl & 2) !== 0 && k !== 0 ? k & -k : b.T !== null ? Xf() : _c()
    }

    function yo() {
        if (gt === 0) if ((k & 536870912) === 0 || tl) {
            var l = Oe;
            Oe <<= 1, (Oe & 3932160) === 0 && (Oe = 262144), gt = l
        } else gt = 536870912;
        return l = dt.current, l !== null && (l.flags |= 32), gt
    }

    function ft(l, t, a) {
        (l === Sl && (yl === 2 || yl === 9) || l.cancelPendingCommit !== null) && (pu(l, 0), ra(l, k, gt, !1)), Hu(l, a), ((fl & 2) === 0 || l !== Sl) && (l === Sl && ((fl & 2) === 0 && (La |= a), Dl === 4 && ra(l, k, gt, !1)), jt(l))
    }

    function mo(l, t, a) {
        if ((fl & 6) !== 0) throw Error(d(327));
        var u = !a && (t & 127) === 0 && (t & l.expiredLanes) === 0 || Ru(l, t), e = u ? od(l, t) : jf(l, t, !0), n = u;
        do {
            if (e === 0) {
                bu && !u && ra(l, t, 0, !1);
                break
            } else {
                if (a = l.current.alternate, n && !cd(a)) {
                    e = jf(l, t, !1), n = !1;
                    continue
                }
                if (e === 2) {
                    if (n = t, l.errorRecoveryDisabledLanes & n) var i = 0; else i = l.pendingLanes & -536870913, i = i !== 0 ? i : i & 536870912 ? 536870912 : 0;
                    if (i !== 0) {
                        t = i;
                        l:{
                            var f = l;
                            e = oe;
                            var c = f.current.memoizedState.isDehydrated;
                            if (c && (pu(f, i).flags |= 256), i = jf(f, i, !1), i !== 2) {
                                if (Df && !c) {
                                    f.errorRecoveryDisabledLanes |= n, La |= n, e = 4;
                                    break l
                                }
                                n = it, it = e, n !== null && (it === null ? it = n : it.push.apply(it, n))
                            }
                            e = i
                        }
                        if (n = !1, e !== 2) continue
                    }
                }
                if (e === 1) {
                    pu(l, 0), ra(l, t, 0, !0);
                    break
                }
                l:{
                    switch (u = l, n = e, n) {
                        case 0:
                        case 1:
                            throw Error(d(345));
                        case 4:
                            if ((t & 4194048) !== t) break;
                        case 6:
                            ra(u, t, gt, !da);
                            break l;
                        case 2:
                            it = null;
                            break;
                        case 3:
                        case 5:
                            break;
                        default:
                            throw Error(d(329))
                    }
                    if ((t & 62914560) === t && (e = Sn + 300 - ct(), 10 < e)) {
                        if (ra(u, t, gt, !da), Ue(u, 0, !0) !== 0) break l;
                        It = t, u.timeoutHandle = Vo(vo.bind(null, u, a, it, zn, Nf, t, gt, La, zu, da, n, "Throttled", -0, 0), e);
                        break l
                    }
                    vo(u, a, it, zn, Nf, t, gt, La, zu, da, n, null, -0, 0)
                }
            }
            break
        } while (!0);
        jt(l)
    }

    function vo(l, t, a, u, e, n, i, f, c, h, z, A, g, r) {
        if (l.timeoutHandle = -1, A = t.subtreeFlags, A & 8192 || (A & 16785408) === 16785408) {
            A = {
                stylesheets: null,
                count: 0,
                imgCount: 0,
                imgBytes: 0,
                suspenseyImages: [],
                waitingForImages: !0,
                waitingForViewTransition: !1,
                unsuspend: Yt
            }, no(t, n, A);
            var H = (n & 62914560) === n ? Sn - ct() : (n & 4194048) === n ? so - ct() : 0;
            if (H = Jd(A, H), H !== null) {
                It = n, l.cancelPendingCommit = H(po.bind(null, l, t, n, a, u, e, i, f, c, z, A, null, g, r)), ra(l, n, i, !h);
                return
            }
        }
        po(l, t, n, a, u, e, i, f, c)
    }

    function cd(l) {
        for (var t = l; ;) {
            var a = t.tag;
            if ((a === 0 || a === 11 || a === 15) && t.flags & 16384 && (a = t.updateQueue, a !== null && (a = a.stores, a !== null))) for (var u = 0; u < a.length; u++) {
                var e = a[u], n = e.getSnapshot;
                e = e.value;
                try {
                    if (!yt(n(), e)) return !1
                } catch {
                    return !1
                }
            }
            if (a = t.child, t.subtreeFlags & 16384 && a !== null) a.return = t, t = a; else {
                if (t === l) break;
                for (; t.sibling === null;) {
                    if (t.return === null || t.return === l) return !0;
                    t = t.return
                }
                t.sibling.return = t.return, t = t.sibling
            }
        }
        return !0
    }

    function ra(l, t, a, u) {
        t &= ~Uf, t &= ~La, l.suspendedLanes |= t, l.pingedLanes &= ~t, u && (l.warmLanes |= t), u = l.expirationTimes;
        for (var e = t; 0 < e;) {
            var n = 31 - ot(e), i = 1 << n;
            u[n] = -1, e &= ~i
        }
        a !== 0 && Ac(l, a, t)
    }

    function Tn() {
        return (fl & 6) === 0 ? (me(0), !1) : !0
    }

    function Cf() {
        if ($ !== null) {
            if (yl === 0) var l = $.return; else l = $, Zt = Ca = null, $i(l), mu = null, Wu = 0, l = $;
            for (; l !== null;) V0(l.alternate, l), l = l.return;
            $ = null
        }
    }

    function pu(l, t) {
        var a = l.timeoutHandle;
        a !== -1 && (l.timeoutHandle = -1, Dd(a)), a = l.cancelPendingCommit, a !== null && (l.cancelPendingCommit = null, a()), It = 0, Cf(), Sl = l, $ = a = Xt(l.current, null), k = t, yl = 0, ht = null, da = !1, bu = Ru(l, t), Df = !1, zu = gt = Uf = La = va = Dl = 0, it = oe = null, Nf = !1, (t & 8) !== 0 && (t |= t & 32);
        var u = l.entangledLanes;
        if (u !== 0) for (l = l.entanglements, u &= t; 0 < u;) {
            var e = 31 - ot(u), n = 1 << e;
            t |= l[e], u &= ~n
        }
        return kt = t, Ze(), a
    }

    function ho(l, t) {
        J = null, b.H = ae, t === yu || t === $e ? (t = Ns(), yl = 3) : t === Yi ? (t = Ns(), yl = 4) : yl = t === mf ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, ht = t, $ === null && (Dl = 1, on(l, pt(t, l.current)))
    }

    function go() {
        var l = dt.current;
        return l === null ? !0 : (k & 4194048) === k ? _t === null : (k & 62914560) === k || (k & 536870912) !== 0 ? l === _t : !1
    }

    function ro() {
        var l = b.H;
        return b.H = ae, l === null ? ae : l
    }

    function So() {
        var l = b.A;
        return b.A = id, l
    }

    function pn() {
        Dl = 4, da || (k & 4194048) !== k && dt.current !== null || (bu = !0), (va & 134217727) === 0 && (La & 134217727) === 0 || Sl === null || ra(Sl, k, gt, !1)
    }

    function jf(l, t, a) {
        var u = fl;
        fl |= 2;
        var e = ro(), n = So();
        (Sl !== l || k !== t) && (zn = null, pu(l, t)), t = !1;
        var i = Dl;
        l:do try {
            if (yl !== 0 && $ !== null) {
                var f = $, c = ht;
                switch (yl) {
                    case 8:
                        Cf(), i = 6;
                        break l;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        dt.current === null && (t = !0);
                        var h = yl;
                        if (yl = 0, ht = null, Au(l, f, c, h), a && bu) {
                            i = 0;
                            break l
                        }
                        break;
                    default:
                        h = yl, yl = 0, ht = null, Au(l, f, c, h)
                }
            }
            sd(), i = Dl;
            break
        } catch (z) {
            ho(l, z)
        } while (!0);
        return t && l.shellSuspendCounter++, Zt = Ca = null, fl = u, b.H = e, b.A = n, $ === null && (Sl = null, k = 0, Ze()), i
    }

    function sd() {
        for (; $ !== null;) bo($)
    }

    function od(l, t) {
        var a = fl;
        fl |= 2;
        var u = ro(), e = So();
        Sl !== l || k !== t ? (zn = null, bn = ct() + 500, pu(l, t)) : bu = Ru(l, t);
        l:do try {
            if (yl !== 0 && $ !== null) {
                t = $;
                var n = ht;
                t:switch (yl) {
                    case 1:
                        yl = 0, ht = null, Au(l, t, n, 1);
                        break;
                    case 2:
                    case 9:
                        if (Ds(n)) {
                            yl = 0, ht = null, zo(t);
                            break
                        }
                        t = function () {
                            yl !== 2 && yl !== 9 || Sl !== l || (yl = 7), jt(l)
                        }, n.then(t, t);
                        break l;
                    case 3:
                        yl = 7;
                        break l;
                    case 4:
                        yl = 5;
                        break l;
                    case 7:
                        Ds(n) ? (yl = 0, ht = null, zo(t)) : (yl = 0, ht = null, Au(l, t, n, 7));
                        break;
                    case 5:
                        var i = null;
                        switch ($.tag) {
                            case 26:
                                i = $.memoizedState;
                            case 5:
                            case 27:
                                var f = $;
                                if (i ? ny(i) : f.stateNode.complete) {
                                    yl = 0, ht = null;
                                    var c = f.sibling;
                                    if (c !== null) $ = c; else {
                                        var h = f.return;
                                        h !== null ? ($ = h, An(h)) : $ = null
                                    }
                                    break t
                                }
                        }
                        yl = 0, ht = null, Au(l, t, n, 5);
                        break;
                    case 6:
                        yl = 0, ht = null, Au(l, t, n, 6);
                        break;
                    case 8:
                        Cf(), Dl = 6;
                        break l;
                    default:
                        throw Error(d(462))
                }
            }
            yd();
            break
        } catch (z) {
            ho(l, z)
        } while (!0);
        return Zt = Ca = null, b.H = u, b.A = e, fl = a, $ !== null ? 0 : (Sl = null, k = 0, Ze(), Dl)
    }

    function yd() {
        for (; $ !== null && !Cy();) bo($)
    }

    function bo(l) {
        var t = x0(l.alternate, l, kt);
        l.memoizedProps = l.pendingProps, t === null ? An(l) : $ = t
    }

    function zo(l) {
        var t = l, a = t.alternate;
        switch (t.tag) {
            case 15:
            case 0:
                t = B0(a, t, t.pendingProps, t.type, void 0, k);
                break;
            case 11:
                t = B0(a, t, t.pendingProps, t.type.render, t.ref, k);
                break;
            case 5:
                $i(t);
            default:
                V0(a, t), t = $ = rs(t, kt), t = x0(a, t, kt)
        }
        l.memoizedProps = l.pendingProps, t === null ? An(l) : $ = t
    }

    function Au(l, t, a, u) {
        Zt = Ca = null, $i(t), mu = null, Wu = 0;
        var e = t.return;
        try {
            if (Pm(l, e, t, a, k)) {
                Dl = 1, on(l, pt(a, l.current)), $ = null;
                return
            }
        } catch (n) {
            if (e !== null) throw $ = e, n;
            Dl = 1, on(l, pt(a, l.current)), $ = null;
            return
        }
        t.flags & 32768 ? (tl || u === 1 ? l = !0 : bu || (k & 536870912) !== 0 ? l = !1 : (da = l = !0, (u === 2 || u === 9 || u === 3 || u === 6) && (u = dt.current, u !== null && u.tag === 13 && (u.flags |= 16384))), To(t, l)) : An(t)
    }

    function An(l) {
        var t = l;
        do {
            if ((t.flags & 32768) !== 0) {
                To(t, da);
                return
            }
            l = t.return;
            var a = ad(t.alternate, t, kt);
            if (a !== null) {
                $ = a;
                return
            }
            if (t = t.sibling, t !== null) {
                $ = t;
                return
            }
            $ = t = l
        } while (t !== null);
        Dl === 0 && (Dl = 5)
    }

    function To(l, t) {
        do {
            var a = ud(l.alternate, l);
            if (a !== null) {
                a.flags &= 32767, $ = a;
                return
            }
            if (a = l.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !t && (l = l.sibling, l !== null)) {
                $ = l;
                return
            }
            $ = l = a
        } while (l !== null);
        Dl = 6, $ = null
    }

    function po(l, t, a, u, e, n, i, f, c) {
        l.cancelPendingCommit = null;
        do En(); while (Gl !== 0);
        if ((fl & 6) !== 0) throw Error(d(327));
        if (t !== null) {
            if (t === l.current) throw Error(d(177));
            if (n = t.lanes | t.childLanes, n |= pi, Vy(l, a, n, i, f, c), l === Sl && ($ = Sl = null, k = 0), Tu = t, ga = l, It = a, Rf = n, Hf = e, oo = u, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (l.callbackNode = null, l.callbackPriority = 0, hd(Me, function () {
                return Oo(), null
            })) : (l.callbackNode = null, l.callbackPriority = 0), u = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || u) {
                u = b.T, b.T = null, e = _.p, _.p = 2, i = fl, fl |= 4;
                try {
                    ed(l, t, a)
                } finally {
                    fl = i, _.p = e, b.T = u
                }
            }
            Gl = 1, Ao(), Eo(), Mo()
        }
    }

    function Ao() {
        if (Gl === 1) {
            Gl = 0;
            var l = ga, t = Tu, a = (t.flags & 13878) !== 0;
            if ((t.subtreeFlags & 13878) !== 0 || a) {
                a = b.T, b.T = null;
                var u = _.p;
                _.p = 2;
                var e = fl;
                fl |= 4;
                try {
                    ao(t, l);
                    var n = wf, i = cs(l.containerInfo), f = n.focusedElem, c = n.selectionRange;
                    if (i !== f && f && f.ownerDocument && fs(f.ownerDocument.documentElement, f)) {
                        if (c !== null && ri(f)) {
                            var h = c.start, z = c.end;
                            if (z === void 0 && (z = h), "selectionStart" in f) f.selectionStart = h, f.selectionEnd = Math.min(z, f.value.length); else {
                                var A = f.ownerDocument || document, g = A && A.defaultView || window;
                                if (g.getSelection) {
                                    var r = g.getSelection(), H = f.textContent.length, Z = Math.min(c.start, H),
                                        gl = c.end === void 0 ? Z : Math.min(c.end, H);
                                    !r.extend && Z > gl && (i = gl, gl = Z, Z = i);
                                    var m = is(f, Z), s = is(f, gl);
                                    if (m && s && (r.rangeCount !== 1 || r.anchorNode !== m.node || r.anchorOffset !== m.offset || r.focusNode !== s.node || r.focusOffset !== s.offset)) {
                                        var v = A.createRange();
                                        v.setStart(m.node, m.offset), r.removeAllRanges(), Z > gl ? (r.addRange(v), r.extend(s.node, s.offset)) : (v.setEnd(s.node, s.offset), r.addRange(v))
                                    }
                                }
                            }
                        }
                        for (A = [], r = f; r = r.parentNode;) r.nodeType === 1 && A.push({
                            element: r,
                            left: r.scrollLeft,
                            top: r.scrollTop
                        });
                        for (typeof f.focus == "function" && f.focus(), f = 0; f < A.length; f++) {
                            var T = A[f];
                            T.element.scrollLeft = T.left, T.element.scrollTop = T.top
                        }
                    }
                    Bn = !!Jf, wf = Jf = null
                } finally {
                    fl = e, _.p = u, b.T = a
                }
            }
            l.current = t, Gl = 2
        }
    }

    function Eo() {
        if (Gl === 2) {
            Gl = 0;
            var l = ga, t = Tu, a = (t.flags & 8772) !== 0;
            if ((t.subtreeFlags & 8772) !== 0 || a) {
                a = b.T, b.T = null;
                var u = _.p;
                _.p = 2;
                var e = fl;
                fl |= 4;
                try {
                    k0(l, t.alternate, t)
                } finally {
                    fl = e, _.p = u, b.T = a
                }
            }
            Gl = 3
        }
    }

    function Mo() {
        if (Gl === 4 || Gl === 3) {
            Gl = 0, jy();
            var l = ga, t = Tu, a = It, u = oo;
            (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Gl = 5 : (Gl = 0, Tu = ga = null, _o(l, l.pendingLanes));
            var e = l.pendingLanes;
            if (e === 0 && (ha = null), In(a), t = t.stateNode, st && typeof st.onCommitFiberRoot == "function") try {
                st.onCommitFiberRoot(Nu, t, void 0, (t.current.flags & 128) === 128)
            } catch {
            }
            if (u !== null) {
                t = b.T, e = _.p, _.p = 2, b.T = null;
                try {
                    for (var n = l.onRecoverableError, i = 0; i < u.length; i++) {
                        var f = u[i];
                        n(f.value, {componentStack: f.stack})
                    }
                } finally {
                    b.T = t, _.p = e
                }
            }
            (It & 3) !== 0 && En(), jt(l), e = l.pendingLanes, (a & 261930) !== 0 && (e & 42) !== 0 ? l === qf ? ye++ : (ye = 0, qf = l) : ye = 0, me(0)
        }
    }

    function _o(l, t) {
        (l.pooledCacheLanes &= t) === 0 && (t = l.pooledCache, t != null && (l.pooledCache = null, Ju(t)))
    }

    function En() {
        return Ao(), Eo(), Mo(), Oo()
    }

    function Oo() {
        if (Gl !== 5) return !1;
        var l = ga, t = Rf;
        Rf = 0;
        var a = In(It), u = b.T, e = _.p;
        try {
            _.p = 32 > a ? 32 : a, b.T = null, a = Hf, Hf = null;
            var n = ga, i = It;
            if (Gl = 0, Tu = ga = null, It = 0, (fl & 6) !== 0) throw Error(d(331));
            var f = fl;
            if (fl |= 4, fo(n.current), eo(n, n.current, i, a), fl = f, me(0, !1), st && typeof st.onPostCommitFiberRoot == "function") try {
                st.onPostCommitFiberRoot(Nu, n)
            } catch {
            }
            return !0
        } finally {
            _.p = e, b.T = u, _o(l, t)
        }
    }

    function Do(l, t, a) {
        t = pt(a, t), t = yf(l.stateNode, t, 2), l = sa(l, t, 2), l !== null && (Hu(l, 2), jt(l))
    }

    function ml(l, t, a) {
        if (l.tag === 3) Do(l, l, a); else for (; t !== null;) {
            if (t.tag === 3) {
                Do(t, l, a);
                break
            } else if (t.tag === 1) {
                var u = t.stateNode;
                if (typeof t.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (ha === null || !ha.has(u))) {
                    l = pt(a, l), a = D0(2), u = sa(t, a, 2), u !== null && (U0(a, u, t, l), Hu(u, 2), jt(u));
                    break
                }
            }
            t = t.return
        }
    }

    function Bf(l, t, a) {
        var u = l.pingCache;
        if (u === null) {
            u = l.pingCache = new fd;
            var e = new Set;
            u.set(t, e)
        } else e = u.get(t), e === void 0 && (e = new Set, u.set(t, e));
        e.has(a) || (Df = !0, e.add(a), l = md.bind(null, l, t, a), t.then(l, l))
    }

    function md(l, t, a) {
        var u = l.pingCache;
        u !== null && u.delete(t), l.pingedLanes |= l.suspendedLanes & a, l.warmLanes &= ~a, Sl === l && (k & a) === a && (Dl === 4 || Dl === 3 && (k & 62914560) === k && 300 > ct() - Sn ? (fl & 2) === 0 && pu(l, 0) : Uf |= a, zu === k && (zu = 0)), jt(l)
    }

    function Uo(l, t) {
        t === 0 && (t = pc()), l = Ra(l, t), l !== null && (Hu(l, t), jt(l))
    }

    function dd(l) {
        var t = l.memoizedState, a = 0;
        t !== null && (a = t.retryLane), Uo(l, a)
    }

    function vd(l, t) {
        var a = 0;
        switch (l.tag) {
            case 31:
            case 13:
                var u = l.stateNode, e = l.memoizedState;
                e !== null && (a = e.retryLane);
                break;
            case 19:
                u = l.stateNode;
                break;
            case 22:
                u = l.stateNode._retryCache;
                break;
            default:
                throw Error(d(314))
        }
        u !== null && u.delete(t), Uo(l, a)
    }

    function hd(l, t) {
        return Wn(l, t)
    }

    var Mn = null, Eu = null, Yf = !1, _n = !1, Gf = !1, Sa = 0;

    function jt(l) {
        l !== Eu && l.next === null && (Eu === null ? Mn = Eu = l : Eu = Eu.next = l), _n = !0, Yf || (Yf = !0, rd())
    }

    function me(l, t) {
        if (!Gf && _n) {
            Gf = !0;
            do for (var a = !1, u = Mn; u !== null;) {
                if (l !== 0) {
                    var e = u.pendingLanes;
                    if (e === 0) var n = 0; else {
                        var i = u.suspendedLanes, f = u.pingedLanes;
                        n = (1 << 31 - ot(42 | l) + 1) - 1, n &= e & ~(i & ~f), n = n & 201326741 ? n & 201326741 | 1 : n ? n | 2 : 0
                    }
                    n !== 0 && (a = !0, qo(u, n))
                } else n = k, n = Ue(u, u === Sl ? n : 0, u.cancelPendingCommit !== null || u.timeoutHandle !== -1), (n & 3) === 0 || Ru(u, n) || (a = !0, qo(u, n));
                u = u.next
            } while (a);
            Gf = !1
        }
    }

    function gd() {
        No()
    }

    function No() {
        _n = Yf = !1;
        var l = 0;
        Sa !== 0 && Od() && (l = Sa);
        for (var t = ct(), a = null, u = Mn; u !== null;) {
            var e = u.next, n = Ro(u, t);
            n === 0 ? (u.next = null, a === null ? Mn = e : a.next = e, e === null && (Eu = a)) : (a = u, (l !== 0 || (n & 3) !== 0) && (_n = !0)), u = e
        }
        Gl !== 0 && Gl !== 5 || me(l), Sa !== 0 && (Sa = 0)
    }

    function Ro(l, t) {
        for (var a = l.suspendedLanes, u = l.pingedLanes, e = l.expirationTimes, n = l.pendingLanes & -62914561; 0 < n;) {
            var i = 31 - ot(n), f = 1 << i, c = e[i];
            c === -1 ? ((f & a) === 0 || (f & u) !== 0) && (e[i] = Ly(f, t)) : c <= t && (l.expiredLanes |= f), n &= ~f
        }
        if (t = Sl, a = k, a = Ue(l, l === t ? a : 0, l.cancelPendingCommit !== null || l.timeoutHandle !== -1), u = l.callbackNode, a === 0 || l === t && (yl === 2 || yl === 9) || l.cancelPendingCommit !== null) return u !== null && u !== null && $n(u), l.callbackNode = null, l.callbackPriority = 0;
        if ((a & 3) === 0 || Ru(l, a)) {
            if (t = a & -a, t === l.callbackPriority) return t;
            switch (u !== null && $n(u), In(a)) {
                case 2:
                case 8:
                    a = zc;
                    break;
                case 32:
                    a = Me;
                    break;
                case 268435456:
                    a = Tc;
                    break;
                default:
                    a = Me
            }
            return u = Ho.bind(null, l), a = Wn(a, u), l.callbackPriority = t, l.callbackNode = a, t
        }
        return u !== null && u !== null && $n(u), l.callbackPriority = 2, l.callbackNode = null, 2
    }

    function Ho(l, t) {
        if (Gl !== 0 && Gl !== 5) return l.callbackNode = null, l.callbackPriority = 0, null;
        var a = l.callbackNode;
        if (En() && l.callbackNode !== a) return null;
        var u = k;
        return u = Ue(l, l === Sl ? u : 0, l.cancelPendingCommit !== null || l.timeoutHandle !== -1), u === 0 ? null : (mo(l, u, t), Ro(l, ct()), l.callbackNode != null && l.callbackNode === a ? Ho.bind(null, l) : null)
    }

    function qo(l, t) {
        if (En()) return null;
        mo(l, t, !0)
    }

    function rd() {
        Ud(function () {
            (fl & 6) !== 0 ? Wn(bc, gd) : No()
        })
    }

    function Xf() {
        if (Sa === 0) {
            var l = su;
            l === 0 && (l = _e, _e <<= 1, (_e & 261888) === 0 && (_e = 256)), Sa = l
        }
        return Sa
    }

    function Co(l) {
        return l == null || typeof l == "symbol" || typeof l == "boolean" ? null : typeof l == "function" ? l : qe("" + l)
    }

    function jo(l, t) {
        var a = t.ownerDocument.createElement("input");
        return a.name = t.name, a.value = t.value, l.id && a.setAttribute("form", l.id), t.parentNode.insertBefore(a, t), l = new FormData(l), a.parentNode.removeChild(a), l
    }

    function Sd(l, t, a, u, e) {
        if (t === "submit" && a && a.stateNode === e) {
            var n = Co((e[tt] || null).action), i = u.submitter;
            i && (t = (t = i[tt] || null) ? Co(t.formAction) : i.getAttribute("formAction"), t !== null && (n = t, i = null));
            var f = new Ye("action", "action", null, u, e);
            l.push({
                event: f, listeners: [{
                    instance: null, listener: function () {
                        if (u.defaultPrevented) {
                            if (Sa !== 0) {
                                var c = i ? jo(e, i) : new FormData(e);
                                ef(a, {pending: !0, data: c, method: e.method, action: n}, null, c)
                            }
                        } else typeof n == "function" && (f.preventDefault(), c = i ? jo(e, i) : new FormData(e), ef(a, {
                            pending: !0,
                            data: c,
                            method: e.method,
                            action: n
                        }, n, c))
                    }, currentTarget: e
                }]
            })
        }
    }

    for (var Qf = 0; Qf < Ti.length; Qf++) {
        var Zf = Ti[Qf], bd = Zf.toLowerCase(), zd = Zf[0].toUpperCase() + Zf.slice(1);
        Ut(bd, "on" + zd)
    }
    Ut(ys, "onAnimationEnd"), Ut(ms, "onAnimationIteration"), Ut(ds, "onAnimationStart"), Ut("dblclick", "onDoubleClick"), Ut("focusin", "onFocus"), Ut("focusout", "onBlur"), Ut(Bm, "onTransitionRun"), Ut(Ym, "onTransitionStart"), Ut(Gm, "onTransitionCancel"), Ut(vs, "onTransitionEnd"), $a("onMouseEnter", ["mouseout", "mouseover"]), $a("onMouseLeave", ["mouseout", "mouseover"]), $a("onPointerEnter", ["pointerout", "pointerover"]), $a("onPointerLeave", ["pointerout", "pointerover"]), Oa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Oa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Oa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), Oa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Oa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Oa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var de = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
        Td = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(de));

    function Bo(l, t) {
        t = (t & 4) !== 0;
        for (var a = 0; a < l.length; a++) {
            var u = l[a], e = u.event;
            u = u.listeners;
            l:{
                var n = void 0;
                if (t) for (var i = u.length - 1; 0 <= i; i--) {
                    var f = u[i], c = f.instance, h = f.currentTarget;
                    if (f = f.listener, c !== n && e.isPropagationStopped()) break l;
                    n = f, e.currentTarget = h;
                    try {
                        n(e)
                    } catch (z) {
                        Qe(z)
                    }
                    e.currentTarget = null, n = c
                } else for (i = 0; i < u.length; i++) {
                    if (f = u[i], c = f.instance, h = f.currentTarget, f = f.listener, c !== n && e.isPropagationStopped()) break l;
                    n = f, e.currentTarget = h;
                    try {
                        n(e)
                    } catch (z) {
                        Qe(z)
                    }
                    e.currentTarget = null, n = c
                }
            }
        }
    }

    function F(l, t) {
        var a = t[Pn];
        a === void 0 && (a = t[Pn] = new Set);
        var u = l + "__bubble";
        a.has(u) || (Yo(t, l, 2, !1), a.add(u))
    }

    function xf(l, t, a) {
        var u = 0;
        t && (u |= 4), Yo(a, l, u, t)
    }

    var On = "_reactListening" + Math.random().toString(36).slice(2);

    function Lf(l) {
        if (!l[On]) {
            l[On] = !0, Uc.forEach(function (a) {
                a !== "selectionchange" && (Td.has(a) || xf(a, !1, l), xf(a, !0, l))
            });
            var t = l.nodeType === 9 ? l : l.ownerDocument;
            t === null || t[On] || (t[On] = !0, xf("selectionchange", !1, t))
        }
    }

    function Yo(l, t, a, u) {
        switch (my(t)) {
            case 2:
                var e = $d;
                break;
            case 8:
                e = Fd;
                break;
            default:
                e = ec
        }
        a = e.bind(null, t, a, l), e = void 0, !ci || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (e = !0), u ? e !== void 0 ? l.addEventListener(t, a, {
            capture: !0,
            passive: e
        }) : l.addEventListener(t, a, !0) : e !== void 0 ? l.addEventListener(t, a, {passive: e}) : l.addEventListener(t, a, !1)
    }

    function Vf(l, t, a, u, e) {
        var n = u;
        if ((t & 1) === 0 && (t & 2) === 0 && u !== null) l:for (; ;) {
            if (u === null) return;
            var i = u.tag;
            if (i === 3 || i === 4) {
                var f = u.stateNode.containerInfo;
                if (f === e) break;
                if (i === 4) for (i = u.return; i !== null;) {
                    var c = i.tag;
                    if ((c === 3 || c === 4) && i.stateNode.containerInfo === e) return;
                    i = i.return
                }
                for (; f !== null;) {
                    if (i = Ja(f), i === null) return;
                    if (c = i.tag, c === 5 || c === 6 || c === 26 || c === 27) {
                        u = n = i;
                        continue l
                    }
                    f = f.parentNode
                }
            }
            u = u.return
        }
        Zc(function () {
            var h = n, z = ii(a), A = [];
            l:{
                var g = hs.get(l);
                if (g !== void 0) {
                    var r = Ye, H = l;
                    switch (l) {
                        case"keypress":
                            if (je(a) === 0) break l;
                        case"keydown":
                        case"keyup":
                            r = vm;
                            break;
                        case"focusin":
                            H = "focus", r = mi;
                            break;
                        case"focusout":
                            H = "blur", r = mi;
                            break;
                        case"beforeblur":
                        case"afterblur":
                            r = mi;
                            break;
                        case"click":
                            if (a.button === 2) break l;
                        case"auxclick":
                        case"dblclick":
                        case"mousedown":
                        case"mousemove":
                        case"mouseup":
                        case"mouseout":
                        case"mouseover":
                        case"contextmenu":
                            r = Vc;
                            break;
                        case"drag":
                        case"dragend":
                        case"dragenter":
                        case"dragexit":
                        case"dragleave":
                        case"dragover":
                        case"dragstart":
                        case"drop":
                            r = am;
                            break;
                        case"touchcancel":
                        case"touchend":
                        case"touchmove":
                        case"touchstart":
                            r = rm;
                            break;
                        case ys:
                        case ms:
                        case ds:
                            r = nm;
                            break;
                        case vs:
                            r = bm;
                            break;
                        case"scroll":
                        case"scrollend":
                            r = lm;
                            break;
                        case"wheel":
                            r = Tm;
                            break;
                        case"copy":
                        case"cut":
                        case"paste":
                            r = fm;
                            break;
                        case"gotpointercapture":
                        case"lostpointercapture":
                        case"pointercancel":
                        case"pointerdown":
                        case"pointermove":
                        case"pointerout":
                        case"pointerover":
                        case"pointerup":
                            r = Jc;
                            break;
                        case"toggle":
                        case"beforetoggle":
                            r = Am
                    }
                    var Z = (t & 4) !== 0, gl = !Z && (l === "scroll" || l === "scrollend"),
                        m = Z ? g !== null ? g + "Capture" : null : g;
                    Z = [];
                    for (var s = h, v; s !== null;) {
                        var T = s;
                        if (v = T.stateNode, T = T.tag, T !== 5 && T !== 26 && T !== 27 || v === null || m === null || (T = ju(s, m), T != null && Z.push(ve(s, T, v))), gl) break;
                        s = s.return
                    }
                    0 < Z.length && (g = new r(g, H, null, a, z), A.push({event: g, listeners: Z}))
                }
            }
            if ((t & 7) === 0) {
                l:{
                    if (g = l === "mouseover" || l === "pointerover", r = l === "mouseout" || l === "pointerout", g && a !== ni && (H = a.relatedTarget || a.fromElement) && (Ja(H) || H[Ka])) break l;
                    if ((r || g) && (g = z.window === z ? z : (g = z.ownerDocument) ? g.defaultView || g.parentWindow : window, r ? (H = a.relatedTarget || a.toElement, r = h, H = H ? Ja(H) : null, H !== null && (gl = X(H), Z = H.tag, H !== gl || Z !== 5 && Z !== 27 && Z !== 6) && (H = null)) : (r = null, H = h), r !== H)) {
                        if (Z = Vc, T = "onMouseLeave", m = "onMouseEnter", s = "mouse", (l === "pointerout" || l === "pointerover") && (Z = Jc, T = "onPointerLeave", m = "onPointerEnter", s = "pointer"), gl = r == null ? g : Cu(r), v = H == null ? g : Cu(H), g = new Z(T, s + "leave", r, a, z), g.target = gl, g.relatedTarget = v, T = null, Ja(z) === h && (Z = new Z(m, s + "enter", H, a, z), Z.target = v, Z.relatedTarget = gl, T = Z), gl = T, r && H) t:{
                            for (Z = pd, m = r, s = H, v = 0, T = m; T; T = Z(T)) v++;
                            T = 0;
                            for (var G = s; G; G = Z(G)) T++;
                            for (; 0 < v - T;) m = Z(m), v--;
                            for (; 0 < T - v;) s = Z(s), T--;
                            for (; v--;) {
                                if (m === s || s !== null && m === s.alternate) {
                                    Z = m;
                                    break t
                                }
                                m = Z(m), s = Z(s)
                            }
                            Z = null
                        } else Z = null;
                        r !== null && Go(A, g, r, Z, !1), H !== null && gl !== null && Go(A, gl, H, Z, !0)
                    }
                }
                l:{
                    if (g = h ? Cu(h) : window, r = g.nodeName && g.nodeName.toLowerCase(), r === "select" || r === "input" && g.type === "file") var el = ls; else if (Ic(g)) if (ts) el = qm; else {
                        el = Rm;
                        var q = Nm
                    } else r = g.nodeName, !r || r.toLowerCase() !== "input" || g.type !== "checkbox" && g.type !== "radio" ? h && ei(h.elementType) && (el = ls) : el = Hm;
                    if (el && (el = el(l, h))) {
                        Pc(A, el, a, z);
                        break l
                    }
                    q && q(l, g, h), l === "focusout" && h && g.type === "number" && h.memoizedProps.value != null && ui(g, "number", g.value)
                }
                switch (q = h ? Cu(h) : window, l) {
                    case"focusin":
                        (Ic(q) || q.contentEditable === "true") && (tu = q, Si = h, Lu = null);
                        break;
                    case"focusout":
                        Lu = Si = tu = null;
                        break;
                    case"mousedown":
                        bi = !0;
                        break;
                    case"contextmenu":
                    case"mouseup":
                    case"dragend":
                        bi = !1, ss(A, a, z);
                        break;
                    case"selectionchange":
                        if (jm) break;
                    case"keydown":
                    case"keyup":
                        ss(A, a, z)
                }
                var w;
                if (vi) l:{
                    switch (l) {
                        case"compositionstart":
                            var I = "onCompositionStart";
                            break l;
                        case"compositionend":
                            I = "onCompositionEnd";
                            break l;
                        case"compositionupdate":
                            I = "onCompositionUpdate";
                            break l
                    }
                    I = void 0
                } else lu ? Fc(l, a) && (I = "onCompositionEnd") : l === "keydown" && a.keyCode === 229 && (I = "onCompositionStart");
                I && (wc && a.locale !== "ko" && (lu || I !== "onCompositionStart" ? I === "onCompositionEnd" && lu && (w = xc()) : (aa = z, si = "value" in aa ? aa.value : aa.textContent, lu = !0)), q = Dn(h, I), 0 < q.length && (I = new Kc(I, l, null, a, z), A.push({
                    event: I,
                    listeners: q
                }), w ? I.data = w : (w = kc(a), w !== null && (I.data = w)))), (w = Mm ? _m(l, a) : Om(l, a)) && (I = Dn(h, "onBeforeInput"), 0 < I.length && (q = new Kc("onBeforeInput", "beforeinput", null, a, z), A.push({
                    event: q,
                    listeners: I
                }), q.data = w)), Sd(A, l, h, a, z)
            }
            Bo(A, t)
        })
    }

    function ve(l, t, a) {
        return {instance: l, listener: t, currentTarget: a}
    }

    function Dn(l, t) {
        for (var a = t + "Capture", u = []; l !== null;) {
            var e = l, n = e.stateNode;
            if (e = e.tag, e !== 5 && e !== 26 && e !== 27 || n === null || (e = ju(l, a), e != null && u.unshift(ve(l, e, n)), e = ju(l, t), e != null && u.push(ve(l, e, n))), l.tag === 3) return u;
            l = l.return
        }
        return []
    }

    function pd(l) {
        if (l === null) return null;
        do l = l.return; while (l && l.tag !== 5 && l.tag !== 27);
        return l || null
    }

    function Go(l, t, a, u, e) {
        for (var n = t._reactName, i = []; a !== null && a !== u;) {
            var f = a, c = f.alternate, h = f.stateNode;
            if (f = f.tag, c !== null && c === u) break;
            f !== 5 && f !== 26 && f !== 27 || h === null || (c = h, e ? (h = ju(a, n), h != null && i.unshift(ve(a, h, c))) : e || (h = ju(a, n), h != null && i.push(ve(a, h, c)))), a = a.return
        }
        i.length !== 0 && l.push({event: t, listeners: i})
    }

    var Ad = /\r\n?/g, Ed = /\u0000|\uFFFD/g;

    function Xo(l) {
        return (typeof l == "string" ? l : "" + l).replace(Ad, `
`).replace(Ed, "")
    }

    function Qo(l, t) {
        return t = Xo(t), Xo(l) === t
    }

    function hl(l, t, a, u, e, n) {
        switch (a) {
            case"children":
                typeof u == "string" ? t === "body" || t === "textarea" && u === "" || ka(l, u) : (typeof u == "number" || typeof u == "bigint") && t !== "body" && ka(l, "" + u);
                break;
            case"className":
                Re(l, "class", u);
                break;
            case"tabIndex":
                Re(l, "tabindex", u);
                break;
            case"dir":
            case"role":
            case"viewBox":
            case"width":
            case"height":
                Re(l, a, u);
                break;
            case"style":
                Xc(l, u, n);
                break;
            case"data":
                if (t !== "object") {
                    Re(l, "data", u);
                    break
                }
            case"src":
            case"href":
                if (u === "" && (t !== "a" || a !== "href")) {
                    l.removeAttribute(a);
                    break
                }
                if (u == null || typeof u == "function" || typeof u == "symbol" || typeof u == "boolean") {
                    l.removeAttribute(a);
                    break
                }
                u = qe("" + u), l.setAttribute(a, u);
                break;
            case"action":
            case"formAction":
                if (typeof u == "function") {
                    l.setAttribute(a, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                    break
                } else typeof n == "function" && (a === "formAction" ? (t !== "input" && hl(l, t, "name", e.name, e, null), hl(l, t, "formEncType", e.formEncType, e, null), hl(l, t, "formMethod", e.formMethod, e, null), hl(l, t, "formTarget", e.formTarget, e, null)) : (hl(l, t, "encType", e.encType, e, null), hl(l, t, "method", e.method, e, null), hl(l, t, "target", e.target, e, null)));
                if (u == null || typeof u == "symbol" || typeof u == "boolean") {
                    l.removeAttribute(a);
                    break
                }
                u = qe("" + u), l.setAttribute(a, u);
                break;
            case"onClick":
                u != null && (l.onclick = Yt);
                break;
            case"onScroll":
                u != null && F("scroll", l);
                break;
            case"onScrollEnd":
                u != null && F("scrollend", l);
                break;
            case"dangerouslySetInnerHTML":
                if (u != null) {
                    if (typeof u != "object" || !("__html" in u)) throw Error(d(61));
                    if (a = u.__html, a != null) {
                        if (e.children != null) throw Error(d(60));
                        l.innerHTML = a
                    }
                }
                break;
            case"multiple":
                l.multiple = u && typeof u != "function" && typeof u != "symbol";
                break;
            case"muted":
                l.muted = u && typeof u != "function" && typeof u != "symbol";
                break;
            case"suppressContentEditableWarning":
            case"suppressHydrationWarning":
            case"defaultValue":
            case"defaultChecked":
            case"innerHTML":
            case"ref":
                break;
            case"autoFocus":
                break;
            case"xlinkHref":
                if (u == null || typeof u == "function" || typeof u == "boolean" || typeof u == "symbol") {
                    l.removeAttribute("xlink:href");
                    break
                }
                a = qe("" + u), l.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a);
                break;
            case"contentEditable":
            case"spellCheck":
            case"draggable":
            case"value":
            case"autoReverse":
            case"externalResourcesRequired":
            case"focusable":
            case"preserveAlpha":
                u != null && typeof u != "function" && typeof u != "symbol" ? l.setAttribute(a, "" + u) : l.removeAttribute(a);
                break;
            case"inert":
            case"allowFullScreen":
            case"async":
            case"autoPlay":
            case"controls":
            case"default":
            case"defer":
            case"disabled":
            case"disablePictureInPicture":
            case"disableRemotePlayback":
            case"formNoValidate":
            case"hidden":
            case"loop":
            case"noModule":
            case"noValidate":
            case"open":
            case"playsInline":
            case"readOnly":
            case"required":
            case"reversed":
            case"scoped":
            case"seamless":
            case"itemScope":
                u && typeof u != "function" && typeof u != "symbol" ? l.setAttribute(a, "") : l.removeAttribute(a);
                break;
            case"capture":
            case"download":
                u === !0 ? l.setAttribute(a, "") : u !== !1 && u != null && typeof u != "function" && typeof u != "symbol" ? l.setAttribute(a, u) : l.removeAttribute(a);
                break;
            case"cols":
            case"rows":
            case"size":
            case"span":
                u != null && typeof u != "function" && typeof u != "symbol" && !isNaN(u) && 1 <= u ? l.setAttribute(a, u) : l.removeAttribute(a);
                break;
            case"rowSpan":
            case"start":
                u == null || typeof u == "function" || typeof u == "symbol" || isNaN(u) ? l.removeAttribute(a) : l.setAttribute(a, u);
                break;
            case"popover":
                F("beforetoggle", l), F("toggle", l), Ne(l, "popover", u);
                break;
            case"xlinkActuate":
                Bt(l, "http://www.w3.org/1999/xlink", "xlink:actuate", u);
                break;
            case"xlinkArcrole":
                Bt(l, "http://www.w3.org/1999/xlink", "xlink:arcrole", u);
                break;
            case"xlinkRole":
                Bt(l, "http://www.w3.org/1999/xlink", "xlink:role", u);
                break;
            case"xlinkShow":
                Bt(l, "http://www.w3.org/1999/xlink", "xlink:show", u);
                break;
            case"xlinkTitle":
                Bt(l, "http://www.w3.org/1999/xlink", "xlink:title", u);
                break;
            case"xlinkType":
                Bt(l, "http://www.w3.org/1999/xlink", "xlink:type", u);
                break;
            case"xmlBase":
                Bt(l, "http://www.w3.org/XML/1998/namespace", "xml:base", u);
                break;
            case"xmlLang":
                Bt(l, "http://www.w3.org/XML/1998/namespace", "xml:lang", u);
                break;
            case"xmlSpace":
                Bt(l, "http://www.w3.org/XML/1998/namespace", "xml:space", u);
                break;
            case"is":
                Ne(l, "is", u);
                break;
            case"innerText":
            case"textContent":
                break;
            default:
                (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (a = Iy.get(a) || a, Ne(l, a, u))
        }
    }

    function Kf(l, t, a, u, e, n) {
        switch (a) {
            case"style":
                Xc(l, u, n);
                break;
            case"dangerouslySetInnerHTML":
                if (u != null) {
                    if (typeof u != "object" || !("__html" in u)) throw Error(d(61));
                    if (a = u.__html, a != null) {
                        if (e.children != null) throw Error(d(60));
                        l.innerHTML = a
                    }
                }
                break;
            case"children":
                typeof u == "string" ? ka(l, u) : (typeof u == "number" || typeof u == "bigint") && ka(l, "" + u);
                break;
            case"onScroll":
                u != null && F("scroll", l);
                break;
            case"onScrollEnd":
                u != null && F("scrollend", l);
                break;
            case"onClick":
                u != null && (l.onclick = Yt);
                break;
            case"suppressContentEditableWarning":
            case"suppressHydrationWarning":
            case"innerHTML":
            case"ref":
                break;
            case"innerText":
            case"textContent":
                break;
            default:
                if (!Nc.hasOwnProperty(a)) l:{
                    if (a[0] === "o" && a[1] === "n" && (e = a.endsWith("Capture"), t = a.slice(2, e ? a.length - 7 : void 0), n = l[tt] || null, n = n != null ? n[a] : null, typeof n == "function" && l.removeEventListener(t, n, e), typeof u == "function")) {
                        typeof n != "function" && n !== null && (a in l ? l[a] = null : l.hasAttribute(a) && l.removeAttribute(a)), l.addEventListener(t, u, e);
                        break l
                    }
                    a in l ? l[a] = u : u === !0 ? l.setAttribute(a, "") : Ne(l, a, u)
                }
        }
    }

    function wl(l, t, a) {
        switch (t) {
            case"div":
            case"span":
            case"svg":
            case"path":
            case"a":
            case"g":
            case"p":
            case"li":
                break;
            case"img":
                F("error", l), F("load", l);
                var u = !1, e = !1, n;
                for (n in a) if (a.hasOwnProperty(n)) {
                    var i = a[n];
                    if (i != null) switch (n) {
                        case"src":
                            u = !0;
                            break;
                        case"srcSet":
                            e = !0;
                            break;
                        case"children":
                        case"dangerouslySetInnerHTML":
                            throw Error(d(137, t));
                        default:
                            hl(l, t, n, i, a, null)
                    }
                }
                e && hl(l, t, "srcSet", a.srcSet, a, null), u && hl(l, t, "src", a.src, a, null);
                return;
            case"input":
                F("invalid", l);
                var f = n = i = e = null, c = null, h = null;
                for (u in a) if (a.hasOwnProperty(u)) {
                    var z = a[u];
                    if (z != null) switch (u) {
                        case"name":
                            e = z;
                            break;
                        case"type":
                            i = z;
                            break;
                        case"checked":
                            c = z;
                            break;
                        case"defaultChecked":
                            h = z;
                            break;
                        case"value":
                            n = z;
                            break;
                        case"defaultValue":
                            f = z;
                            break;
                        case"children":
                        case"dangerouslySetInnerHTML":
                            if (z != null) throw Error(d(137, t));
                            break;
                        default:
                            hl(l, t, u, z, a, null)
                    }
                }
                jc(l, n, f, c, h, i, e, !1);
                return;
            case"select":
                F("invalid", l), u = i = n = null;
                for (e in a) if (a.hasOwnProperty(e) && (f = a[e], f != null)) switch (e) {
                    case"value":
                        n = f;
                        break;
                    case"defaultValue":
                        i = f;
                        break;
                    case"multiple":
                        u = f;
                    default:
                        hl(l, t, e, f, a, null)
                }
                t = n, a = i, l.multiple = !!u, t != null ? Fa(l, !!u, t, !1) : a != null && Fa(l, !!u, a, !0);
                return;
            case"textarea":
                F("invalid", l), n = e = u = null;
                for (i in a) if (a.hasOwnProperty(i) && (f = a[i], f != null)) switch (i) {
                    case"value":
                        u = f;
                        break;
                    case"defaultValue":
                        e = f;
                        break;
                    case"children":
                        n = f;
                        break;
                    case"dangerouslySetInnerHTML":
                        if (f != null) throw Error(d(91));
                        break;
                    default:
                        hl(l, t, i, f, a, null)
                }
                Yc(l, u, e, n);
                return;
            case"option":
                for (c in a) a.hasOwnProperty(c) && (u = a[c], u != null) && (c === "selected" ? l.selected = u && typeof u != "function" && typeof u != "symbol" : hl(l, t, c, u, a, null));
                return;
            case"dialog":
                F("beforetoggle", l), F("toggle", l), F("cancel", l), F("close", l);
                break;
            case"iframe":
            case"object":
                F("load", l);
                break;
            case"video":
            case"audio":
                for (u = 0; u < de.length; u++) F(de[u], l);
                break;
            case"image":
                F("error", l), F("load", l);
                break;
            case"details":
                F("toggle", l);
                break;
            case"embed":
            case"source":
            case"link":
                F("error", l), F("load", l);
            case"area":
            case"base":
            case"br":
            case"col":
            case"hr":
            case"keygen":
            case"meta":
            case"param":
            case"track":
            case"wbr":
            case"menuitem":
                for (h in a) if (a.hasOwnProperty(h) && (u = a[h], u != null)) switch (h) {
                    case"children":
                    case"dangerouslySetInnerHTML":
                        throw Error(d(137, t));
                    default:
                        hl(l, t, h, u, a, null)
                }
                return;
            default:
                if (ei(t)) {
                    for (z in a) a.hasOwnProperty(z) && (u = a[z], u !== void 0 && Kf(l, t, z, u, a, void 0));
                    return
                }
        }
        for (f in a) a.hasOwnProperty(f) && (u = a[f], u != null && hl(l, t, f, u, a, null))
    }

    function Md(l, t, a, u) {
        switch (t) {
            case"div":
            case"span":
            case"svg":
            case"path":
            case"a":
            case"g":
            case"p":
            case"li":
                break;
            case"input":
                var e = null, n = null, i = null, f = null, c = null, h = null, z = null;
                for (r in a) {
                    var A = a[r];
                    if (a.hasOwnProperty(r) && A != null) switch (r) {
                        case"checked":
                            break;
                        case"value":
                            break;
                        case"defaultValue":
                            c = A;
                        default:
                            u.hasOwnProperty(r) || hl(l, t, r, null, u, A)
                    }
                }
                for (var g in u) {
                    var r = u[g];
                    if (A = a[g], u.hasOwnProperty(g) && (r != null || A != null)) switch (g) {
                        case"type":
                            n = r;
                            break;
                        case"name":
                            e = r;
                            break;
                        case"checked":
                            h = r;
                            break;
                        case"defaultChecked":
                            z = r;
                            break;
                        case"value":
                            i = r;
                            break;
                        case"defaultValue":
                            f = r;
                            break;
                        case"children":
                        case"dangerouslySetInnerHTML":
                            if (r != null) throw Error(d(137, t));
                            break;
                        default:
                            r !== A && hl(l, t, g, r, u, A)
                    }
                }
                ai(l, i, f, c, h, z, n, e);
                return;
            case"select":
                r = i = f = g = null;
                for (n in a) if (c = a[n], a.hasOwnProperty(n) && c != null) switch (n) {
                    case"value":
                        break;
                    case"multiple":
                        r = c;
                    default:
                        u.hasOwnProperty(n) || hl(l, t, n, null, u, c)
                }
                for (e in u) if (n = u[e], c = a[e], u.hasOwnProperty(e) && (n != null || c != null)) switch (e) {
                    case"value":
                        g = n;
                        break;
                    case"defaultValue":
                        f = n;
                        break;
                    case"multiple":
                        i = n;
                    default:
                        n !== c && hl(l, t, e, n, u, c)
                }
                t = f, a = i, u = r, g != null ? Fa(l, !!a, g, !1) : !!u != !!a && (t != null ? Fa(l, !!a, t, !0) : Fa(l, !!a, a ? [] : "", !1));
                return;
            case"textarea":
                r = g = null;
                for (f in a) if (e = a[f], a.hasOwnProperty(f) && e != null && !u.hasOwnProperty(f)) switch (f) {
                    case"value":
                        break;
                    case"children":
                        break;
                    default:
                        hl(l, t, f, null, u, e)
                }
                for (i in u) if (e = u[i], n = a[i], u.hasOwnProperty(i) && (e != null || n != null)) switch (i) {
                    case"value":
                        g = e;
                        break;
                    case"defaultValue":
                        r = e;
                        break;
                    case"children":
                        break;
                    case"dangerouslySetInnerHTML":
                        if (e != null) throw Error(d(91));
                        break;
                    default:
                        e !== n && hl(l, t, i, e, u, n)
                }
                Bc(l, g, r);
                return;
            case"option":
                for (var H in a) g = a[H], a.hasOwnProperty(H) && g != null && !u.hasOwnProperty(H) && (H === "selected" ? l.selected = !1 : hl(l, t, H, null, u, g));
                for (c in u) g = u[c], r = a[c], u.hasOwnProperty(c) && g !== r && (g != null || r != null) && (c === "selected" ? l.selected = g && typeof g != "function" && typeof g != "symbol" : hl(l, t, c, g, u, r));
                return;
            case"img":
            case"link":
            case"area":
            case"base":
            case"br":
            case"col":
            case"embed":
            case"hr":
            case"keygen":
            case"meta":
            case"param":
            case"source":
            case"track":
            case"wbr":
            case"menuitem":
                for (var Z in a) g = a[Z], a.hasOwnProperty(Z) && g != null && !u.hasOwnProperty(Z) && hl(l, t, Z, null, u, g);
                for (h in u) if (g = u[h], r = a[h], u.hasOwnProperty(h) && g !== r && (g != null || r != null)) switch (h) {
                    case"children":
                    case"dangerouslySetInnerHTML":
                        if (g != null) throw Error(d(137, t));
                        break;
                    default:
                        hl(l, t, h, g, u, r)
                }
                return;
            default:
                if (ei(t)) {
                    for (var gl in a) g = a[gl], a.hasOwnProperty(gl) && g !== void 0 && !u.hasOwnProperty(gl) && Kf(l, t, gl, void 0, u, g);
                    for (z in u) g = u[z], r = a[z], !u.hasOwnProperty(z) || g === r || g === void 0 && r === void 0 || Kf(l, t, z, g, u, r);
                    return
                }
        }
        for (var m in a) g = a[m], a.hasOwnProperty(m) && g != null && !u.hasOwnProperty(m) && hl(l, t, m, null, u, g);
        for (A in u) g = u[A], r = a[A], !u.hasOwnProperty(A) || g === r || g == null && r == null || hl(l, t, A, g, u, r)
    }

    function Zo(l) {
        switch (l) {
            case"css":
            case"script":
            case"font":
            case"img":
            case"image":
            case"input":
            case"link":
                return !0;
            default:
                return !1
        }
    }

    function _d() {
        if (typeof performance.getEntriesByType == "function") {
            for (var l = 0, t = 0, a = performance.getEntriesByType("resource"), u = 0; u < a.length; u++) {
                var e = a[u], n = e.transferSize, i = e.initiatorType, f = e.duration;
                if (n && f && Zo(i)) {
                    for (i = 0, f = e.responseEnd, u += 1; u < a.length; u++) {
                        var c = a[u], h = c.startTime;
                        if (h > f) break;
                        var z = c.transferSize, A = c.initiatorType;
                        z && Zo(A) && (c = c.responseEnd, i += z * (c < f ? 1 : (f - h) / (c - h)))
                    }
                    if (--u, t += 8 * (n + i) / (e.duration / 1e3), l++, 10 < l) break
                }
            }
            if (0 < l) return t / l / 1e6
        }
        return navigator.connection && (l = navigator.connection.downlink, typeof l == "number") ? l : 5
    }

    var Jf = null, wf = null;

    function Un(l) {
        return l.nodeType === 9 ? l : l.ownerDocument
    }

    function xo(l) {
        switch (l) {
            case"http://www.w3.org/2000/svg":
                return 1;
            case"http://www.w3.org/1998/Math/MathML":
                return 2;
            default:
                return 0
        }
    }

    function Lo(l, t) {
        if (l === 0) switch (t) {
            case"svg":
                return 1;
            case"math":
                return 2;
            default:
                return 0
        }
        return l === 1 && t === "foreignObject" ? 0 : l
    }

    function Wf(l, t) {
        return l === "textarea" || l === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null
    }

    var $f = null;

    function Od() {
        var l = window.event;
        return l && l.type === "popstate" ? l === $f ? !1 : ($f = l, !0) : ($f = null, !1)
    }

    var Vo = typeof setTimeout == "function" ? setTimeout : void 0,
        Dd = typeof clearTimeout == "function" ? clearTimeout : void 0,
        Ko = typeof Promise == "function" ? Promise : void 0,
        Ud = typeof queueMicrotask == "function" ? queueMicrotask : typeof Ko < "u" ? function (l) {
            return Ko.resolve(null).then(l).catch(Nd)
        } : Vo;

    function Nd(l) {
        setTimeout(function () {
            throw l
        })
    }

    function ba(l) {
        return l === "head"
    }

    function Jo(l, t) {
        var a = t, u = 0;
        do {
            var e = a.nextSibling;
            if (l.removeChild(a), e && e.nodeType === 8) if (a = e.data, a === "/$" || a === "/&") {
                if (u === 0) {
                    l.removeChild(e), Du(t);
                    return
                }
                u--
            } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&") u++; else if (a === "html") he(l.ownerDocument.documentElement); else if (a === "head") {
                a = l.ownerDocument.head, he(a);
                for (var n = a.firstChild; n;) {
                    var i = n.nextSibling, f = n.nodeName;
                    n[qu] || f === "SCRIPT" || f === "STYLE" || f === "LINK" && n.rel.toLowerCase() === "stylesheet" || a.removeChild(n), n = i
                }
            } else a === "body" && he(l.ownerDocument.body);
            a = e
        } while (a);
        Du(t)
    }

    function wo(l, t) {
        var a = l;
        l = 0;
        do {
            var u = a.nextSibling;
            if (a.nodeType === 1 ? t ? (a._stashedDisplay = a.style.display, a.style.display = "none") : (a.style.display = a._stashedDisplay || "", a.getAttribute("style") === "" && a.removeAttribute("style")) : a.nodeType === 3 && (t ? (a._stashedText = a.nodeValue, a.nodeValue = "") : a.nodeValue = a._stashedText || ""), u && u.nodeType === 8) if (a = u.data, a === "/$") {
                if (l === 0) break;
                l--
            } else a !== "$" && a !== "$?" && a !== "$~" && a !== "$!" || l++;
            a = u
        } while (a)
    }

    function Ff(l) {
        var t = l.firstChild;
        for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
            var a = t;
            switch (t = t.nextSibling, a.nodeName) {
                case"HTML":
                case"HEAD":
                case"BODY":
                    Ff(a), li(a);
                    continue;
                case"SCRIPT":
                case"STYLE":
                    continue;
                case"LINK":
                    if (a.rel.toLowerCase() === "stylesheet") continue
            }
            l.removeChild(a)
        }
    }

    function Rd(l, t, a, u) {
        for (; l.nodeType === 1;) {
            var e = a;
            if (l.nodeName.toLowerCase() !== t.toLowerCase()) {
                if (!u && (l.nodeName !== "INPUT" || l.type !== "hidden")) break
            } else if (u) {
                if (!l[qu]) switch (t) {
                    case"meta":
                        if (!l.hasAttribute("itemprop")) break;
                        return l;
                    case"link":
                        if (n = l.getAttribute("rel"), n === "stylesheet" && l.hasAttribute("data-precedence")) break;
                        if (n !== e.rel || l.getAttribute("href") !== (e.href == null || e.href === "" ? null : e.href) || l.getAttribute("crossorigin") !== (e.crossOrigin == null ? null : e.crossOrigin) || l.getAttribute("title") !== (e.title == null ? null : e.title)) break;
                        return l;
                    case"style":
                        if (l.hasAttribute("data-precedence")) break;
                        return l;
                    case"script":
                        if (n = l.getAttribute("src"), (n !== (e.src == null ? null : e.src) || l.getAttribute("type") !== (e.type == null ? null : e.type) || l.getAttribute("crossorigin") !== (e.crossOrigin == null ? null : e.crossOrigin)) && n && l.hasAttribute("async") && !l.hasAttribute("itemprop")) break;
                        return l;
                    default:
                        return l
                }
            } else if (t === "input" && l.type === "hidden") {
                var n = e.name == null ? null : "" + e.name;
                if (e.type === "hidden" && l.getAttribute("name") === n) return l
            } else return l;
            if (l = Ot(l.nextSibling), l === null) break
        }
        return null
    }

    function Hd(l, t, a) {
        if (t === "") return null;
        for (; l.nodeType !== 3;) if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !a || (l = Ot(l.nextSibling), l === null)) return null;
        return l
    }

    function Wo(l, t) {
        for (; l.nodeType !== 8;) if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !t || (l = Ot(l.nextSibling), l === null)) return null;
        return l
    }

    function kf(l) {
        return l.data === "$?" || l.data === "$~"
    }

    function If(l) {
        return l.data === "$!" || l.data === "$?" && l.ownerDocument.readyState !== "loading"
    }

    function qd(l, t) {
        var a = l.ownerDocument;
        if (l.data === "$~") l._reactRetry = t; else if (l.data !== "$?" || a.readyState !== "loading") t(); else {
            var u = function () {
                t(), a.removeEventListener("DOMContentLoaded", u)
            };
            a.addEventListener("DOMContentLoaded", u), l._reactRetry = u
        }
    }

    function Ot(l) {
        for (; l != null; l = l.nextSibling) {
            var t = l.nodeType;
            if (t === 1 || t === 3) break;
            if (t === 8) {
                if (t = l.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
                if (t === "/$" || t === "/&") return null
            }
        }
        return l
    }

    var Pf = null;

    function $o(l) {
        l = l.nextSibling;
        for (var t = 0; l;) {
            if (l.nodeType === 8) {
                var a = l.data;
                if (a === "/$" || a === "/&") {
                    if (t === 0) return Ot(l.nextSibling);
                    t--
                } else a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || t++
            }
            l = l.nextSibling
        }
        return null
    }

    function Fo(l) {
        l = l.previousSibling;
        for (var t = 0; l;) {
            if (l.nodeType === 8) {
                var a = l.data;
                if (a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&") {
                    if (t === 0) return l;
                    t--
                } else a !== "/$" && a !== "/&" || t++
            }
            l = l.previousSibling
        }
        return null
    }

    function ko(l, t, a) {
        switch (t = Un(a), l) {
            case"html":
                if (l = t.documentElement, !l) throw Error(d(452));
                return l;
            case"head":
                if (l = t.head, !l) throw Error(d(453));
                return l;
            case"body":
                if (l = t.body, !l) throw Error(d(454));
                return l;
            default:
                throw Error(d(451))
        }
    }

    function he(l) {
        for (var t = l.attributes; t.length;) l.removeAttributeNode(t[0]);
        li(l)
    }

    var Dt = new Map, Io = new Set;

    function Nn(l) {
        return typeof l.getRootNode == "function" ? l.getRootNode() : l.nodeType === 9 ? l : l.ownerDocument
    }

    var Pt = _.d;
    _.d = {f: Cd, r: jd, D: Bd, C: Yd, L: Gd, m: Xd, X: Zd, S: Qd, M: xd};

    function Cd() {
        var l = Pt.f(), t = Tn();
        return l || t
    }

    function jd(l) {
        var t = wa(l);
        t !== null && t.tag === 5 && t.type === "form" ? v0(t) : Pt.r(l)
    }

    var Mu = typeof document > "u" ? null : document;

    function Po(l, t, a) {
        var u = Mu;
        if (u && typeof t == "string" && t) {
            var e = zt(t);
            e = 'link[rel="' + l + '"][href="' + e + '"]', typeof a == "string" && (e += '[crossorigin="' + a + '"]'), Io.has(e) || (Io.add(e), l = {
                rel: l,
                crossOrigin: a,
                href: t
            }, u.querySelector(e) === null && (t = u.createElement("link"), wl(t, "link", l), Ql(t), u.head.appendChild(t)))
        }
    }

    function Bd(l) {
        Pt.D(l), Po("dns-prefetch", l, null)
    }

    function Yd(l, t) {
        Pt.C(l, t), Po("preconnect", l, t)
    }

    function Gd(l, t, a) {
        Pt.L(l, t, a);
        var u = Mu;
        if (u && l && t) {
            var e = 'link[rel="preload"][as="' + zt(t) + '"]';
            t === "image" && a && a.imageSrcSet ? (e += '[imagesrcset="' + zt(a.imageSrcSet) + '"]', typeof a.imageSizes == "string" && (e += '[imagesizes="' + zt(a.imageSizes) + '"]')) : e += '[href="' + zt(l) + '"]';
            var n = e;
            switch (t) {
                case"style":
                    n = _u(l);
                    break;
                case"script":
                    n = Ou(l)
            }
            Dt.has(n) || (l = O({
                rel: "preload",
                href: t === "image" && a && a.imageSrcSet ? void 0 : l,
                as: t
            }, a), Dt.set(n, l), u.querySelector(e) !== null || t === "style" && u.querySelector(ge(n)) || t === "script" && u.querySelector(re(n)) || (t = u.createElement("link"), wl(t, "link", l), Ql(t), u.head.appendChild(t)))
        }
    }

    function Xd(l, t) {
        Pt.m(l, t);
        var a = Mu;
        if (a && l) {
            var u = t && typeof t.as == "string" ? t.as : "script",
                e = 'link[rel="modulepreload"][as="' + zt(u) + '"][href="' + zt(l) + '"]', n = e;
            switch (u) {
                case"audioworklet":
                case"paintworklet":
                case"serviceworker":
                case"sharedworker":
                case"worker":
                case"script":
                    n = Ou(l)
            }
            if (!Dt.has(n) && (l = O({rel: "modulepreload", href: l}, t), Dt.set(n, l), a.querySelector(e) === null)) {
                switch (u) {
                    case"audioworklet":
                    case"paintworklet":
                    case"serviceworker":
                    case"sharedworker":
                    case"worker":
                    case"script":
                        if (a.querySelector(re(n))) return
                }
                u = a.createElement("link"), wl(u, "link", l), Ql(u), a.head.appendChild(u)
            }
        }
    }

    function Qd(l, t, a) {
        Pt.S(l, t, a);
        var u = Mu;
        if (u && l) {
            var e = Wa(u).hoistableStyles, n = _u(l);
            t = t || "default";
            var i = e.get(n);
            if (!i) {
                var f = {loading: 0, preload: null};
                if (i = u.querySelector(ge(n))) f.loading = 5; else {
                    l = O({rel: "stylesheet", href: l, "data-precedence": t}, a), (a = Dt.get(n)) && lc(l, a);
                    var c = i = u.createElement("link");
                    Ql(c), wl(c, "link", l), c._p = new Promise(function (h, z) {
                        c.onload = h, c.onerror = z
                    }), c.addEventListener("load", function () {
                        f.loading |= 1
                    }), c.addEventListener("error", function () {
                        f.loading |= 2
                    }), f.loading |= 4, Rn(i, t, u)
                }
                i = {type: "stylesheet", instance: i, count: 1, state: f}, e.set(n, i)
            }
        }
    }

    function Zd(l, t) {
        Pt.X(l, t);
        var a = Mu;
        if (a && l) {
            var u = Wa(a).hoistableScripts, e = Ou(l), n = u.get(e);
            n || (n = a.querySelector(re(e)), n || (l = O({
                src: l,
                async: !0
            }, t), (t = Dt.get(e)) && tc(l, t), n = a.createElement("script"), Ql(n), wl(n, "link", l), a.head.appendChild(n)), n = {
                type: "script",
                instance: n,
                count: 1,
                state: null
            }, u.set(e, n))
        }
    }

    function xd(l, t) {
        Pt.M(l, t);
        var a = Mu;
        if (a && l) {
            var u = Wa(a).hoistableScripts, e = Ou(l), n = u.get(e);
            n || (n = a.querySelector(re(e)), n || (l = O({
                src: l,
                async: !0,
                type: "module"
            }, t), (t = Dt.get(e)) && tc(l, t), n = a.createElement("script"), Ql(n), wl(n, "link", l), a.head.appendChild(n)), n = {
                type: "script",
                instance: n,
                count: 1,
                state: null
            }, u.set(e, n))
        }
    }

    function ly(l, t, a, u) {
        var e = (e = W.current) ? Nn(e) : null;
        if (!e) throw Error(d(446));
        switch (l) {
            case"meta":
            case"title":
                return null;
            case"style":
                return typeof a.precedence == "string" && typeof a.href == "string" ? (t = _u(a.href), a = Wa(e).hoistableStyles, u = a.get(t), u || (u = {
                    type: "style",
                    instance: null,
                    count: 0,
                    state: null
                }, a.set(t, u)), u) : {type: "void", instance: null, count: 0, state: null};
            case"link":
                if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
                    l = _u(a.href);
                    var n = Wa(e).hoistableStyles, i = n.get(l);
                    if (i || (e = e.ownerDocument || e, i = {
                        type: "stylesheet",
                        instance: null,
                        count: 0,
                        state: {loading: 0, preload: null}
                    }, n.set(l, i), (n = e.querySelector(ge(l))) && !n._p && (i.instance = n, i.state.loading = 5), Dt.has(l) || (a = {
                        rel: "preload",
                        as: "style",
                        href: a.href,
                        crossOrigin: a.crossOrigin,
                        integrity: a.integrity,
                        media: a.media,
                        hrefLang: a.hrefLang,
                        referrerPolicy: a.referrerPolicy
                    }, Dt.set(l, a), n || Ld(e, l, a, i.state))), t && u === null) throw Error(d(528, ""));
                    return i
                }
                if (t && u !== null) throw Error(d(529, ""));
                return null;
            case"script":
                return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ou(a), a = Wa(e).hoistableScripts, u = a.get(t), u || (u = {
                    type: "script",
                    instance: null,
                    count: 0,
                    state: null
                }, a.set(t, u)), u) : {type: "void", instance: null, count: 0, state: null};
            default:
                throw Error(d(444, l))
        }
    }

    function _u(l) {
        return 'href="' + zt(l) + '"'
    }

    function ge(l) {
        return 'link[rel="stylesheet"][' + l + "]"
    }

    function ty(l) {
        return O({}, l, {"data-precedence": l.precedence, precedence: null})
    }

    function Ld(l, t, a, u) {
        l.querySelector('link[rel="preload"][as="style"][' + t + "]") ? u.loading = 1 : (t = l.createElement("link"), u.preload = t, t.addEventListener("load", function () {
            return u.loading |= 1
        }), t.addEventListener("error", function () {
            return u.loading |= 2
        }), wl(t, "link", a), Ql(t), l.head.appendChild(t))
    }

    function Ou(l) {
        return '[src="' + zt(l) + '"]'
    }

    function re(l) {
        return "script[async]" + l
    }

    function ay(l, t, a) {
        if (t.count++, t.instance === null) switch (t.type) {
            case"style":
                var u = l.querySelector('style[data-href~="' + zt(a.href) + '"]');
                if (u) return t.instance = u, Ql(u), u;
                var e = O({}, a, {"data-href": a.href, "data-precedence": a.precedence, href: null, precedence: null});
                return u = (l.ownerDocument || l).createElement("style"), Ql(u), wl(u, "style", e), Rn(u, a.precedence, l), t.instance = u;
            case"stylesheet":
                e = _u(a.href);
                var n = l.querySelector(ge(e));
                if (n) return t.state.loading |= 4, t.instance = n, Ql(n), n;
                u = ty(a), (e = Dt.get(e)) && lc(u, e), n = (l.ownerDocument || l).createElement("link"), Ql(n);
                var i = n;
                return i._p = new Promise(function (f, c) {
                    i.onload = f, i.onerror = c
                }), wl(n, "link", u), t.state.loading |= 4, Rn(n, a.precedence, l), t.instance = n;
            case"script":
                return n = Ou(a.src), (e = l.querySelector(re(n))) ? (t.instance = e, Ql(e), e) : (u = a, (e = Dt.get(n)) && (u = O({}, a), tc(u, e)), l = l.ownerDocument || l, e = l.createElement("script"), Ql(e), wl(e, "link", u), l.head.appendChild(e), t.instance = e);
            case"void":
                return null;
            default:
                throw Error(d(443, t.type))
        } else t.type === "stylesheet" && (t.state.loading & 4) === 0 && (u = t.instance, t.state.loading |= 4, Rn(u, a.precedence, l));
        return t.instance
    }

    function Rn(l, t, a) {
        for (var u = a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), e = u.length ? u[u.length - 1] : null, n = e, i = 0; i < u.length; i++) {
            var f = u[i];
            if (f.dataset.precedence === t) n = f; else if (n !== e) break
        }
        n ? n.parentNode.insertBefore(l, n.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(l, t.firstChild))
    }

    function lc(l, t) {
        l.crossOrigin == null && (l.crossOrigin = t.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy), l.title == null && (l.title = t.title)
    }

    function tc(l, t) {
        l.crossOrigin == null && (l.crossOrigin = t.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy), l.integrity == null && (l.integrity = t.integrity)
    }

    var Hn = null;

    function uy(l, t, a) {
        if (Hn === null) {
            var u = new Map, e = Hn = new Map;
            e.set(a, u)
        } else e = Hn, u = e.get(a), u || (u = new Map, e.set(a, u));
        if (u.has(l)) return u;
        for (u.set(l, null), a = a.getElementsByTagName(l), e = 0; e < a.length; e++) {
            var n = a[e];
            if (!(n[qu] || n[Ll] || l === "link" && n.getAttribute("rel") === "stylesheet") && n.namespaceURI !== "http://www.w3.org/2000/svg") {
                var i = n.getAttribute(t) || "";
                i = l + i;
                var f = u.get(i);
                f ? f.push(n) : u.set(i, [n])
            }
        }
        return u
    }

    function ey(l, t, a) {
        l = l.ownerDocument || l, l.head.insertBefore(a, t === "title" ? l.querySelector("head > title") : null)
    }

    function Vd(l, t, a) {
        if (a === 1 || t.itemProp != null) return !1;
        switch (l) {
            case"meta":
            case"title":
                return !0;
            case"style":
                if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
                return !0;
            case"link":
                if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
                return t.rel === "stylesheet" ? (l = t.disabled, typeof t.precedence == "string" && l == null) : !0;
            case"script":
                if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0
        }
        return !1
    }

    function ny(l) {
        return !(l.type === "stylesheet" && (l.state.loading & 3) === 0)
    }

    function Kd(l, t, a, u) {
        if (a.type === "stylesheet" && (typeof u.media != "string" || matchMedia(u.media).matches !== !1) && (a.state.loading & 4) === 0) {
            if (a.instance === null) {
                var e = _u(u.href), n = t.querySelector(ge(e));
                if (n) {
                    t = n._p, t !== null && typeof t == "object" && typeof t.then == "function" && (l.count++, l = qn.bind(l), t.then(l, l)), a.state.loading |= 4, a.instance = n, Ql(n);
                    return
                }
                n = t.ownerDocument || t, u = ty(u), (e = Dt.get(e)) && lc(u, e), n = n.createElement("link"), Ql(n);
                var i = n;
                i._p = new Promise(function (f, c) {
                    i.onload = f, i.onerror = c
                }), wl(n, "link", u), a.instance = n
            }
            l.stylesheets === null && (l.stylesheets = new Map), l.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (l.count++, a = qn.bind(l), t.addEventListener("load", a), t.addEventListener("error", a))
        }
    }

    var ac = 0;

    function Jd(l, t) {
        return l.stylesheets && l.count === 0 && jn(l, l.stylesheets), 0 < l.count || 0 < l.imgCount ? function (a) {
            var u = setTimeout(function () {
                if (l.stylesheets && jn(l, l.stylesheets), l.unsuspend) {
                    var n = l.unsuspend;
                    l.unsuspend = null, n()
                }
            }, 6e4 + t);
            0 < l.imgBytes && ac === 0 && (ac = 62500 * _d());
            var e = setTimeout(function () {
                if (l.waitingForImages = !1, l.count === 0 && (l.stylesheets && jn(l, l.stylesheets), l.unsuspend)) {
                    var n = l.unsuspend;
                    l.unsuspend = null, n()
                }
            }, (l.imgBytes > ac ? 50 : 800) + t);
            return l.unsuspend = a, function () {
                l.unsuspend = null, clearTimeout(u), clearTimeout(e)
            }
        } : null
    }

    function qn() {
        if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
            if (this.stylesheets) jn(this, this.stylesheets); else if (this.unsuspend) {
                var l = this.unsuspend;
                this.unsuspend = null, l()
            }
        }
    }

    var Cn = null;

    function jn(l, t) {
        l.stylesheets = null, l.unsuspend !== null && (l.count++, Cn = new Map, t.forEach(wd, l), Cn = null, qn.call(l))
    }

    function wd(l, t) {
        if (!(t.state.loading & 4)) {
            var a = Cn.get(l);
            if (a) var u = a.get(null); else {
                a = new Map, Cn.set(l, a);
                for (var e = l.querySelectorAll("link[data-precedence],style[data-precedence]"), n = 0; n < e.length; n++) {
                    var i = e[n];
                    (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") && (a.set(i.dataset.precedence, i), u = i)
                }
                u && a.set(null, u)
            }
            e = t.instance, i = e.getAttribute("data-precedence"), n = a.get(i) || u, n === u && a.set(null, e), a.set(i, e), this.count++, u = qn.bind(this), e.addEventListener("load", u), e.addEventListener("error", u), n ? n.parentNode.insertBefore(e, n.nextSibling) : (l = l.nodeType === 9 ? l.head : l, l.insertBefore(e, l.firstChild)), t.state.loading |= 4
        }
    }

    var Se = {$$typeof: bl, Provider: null, Consumer: null, _currentValue: Q, _currentValue2: Q, _threadCount: 0};

    function Wd(l, t, a, u, e, n, i, f, c) {
        this.tag = 1, this.containerInfo = l, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Fn(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Fn(0), this.hiddenUpdates = Fn(null), this.identifierPrefix = u, this.onUncaughtError = e, this.onCaughtError = n, this.onRecoverableError = i, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = new Map
    }

    function iy(l, t, a, u, e, n, i, f, c, h, z, A) {
        return l = new Wd(l, t, a, i, c, h, z, A, f), t = 1, n === !0 && (t |= 24), n = mt(3, null, null, t), l.current = n, n.stateNode = l, t = Ci(), t.refCount++, l.pooledCache = t, t.refCount++, n.memoizedState = {
            element: u,
            isDehydrated: a,
            cache: t
        }, Gi(n), l
    }

    function fy(l) {
        return l ? (l = eu, l) : eu
    }

    function cy(l, t, a, u, e, n) {
        e = fy(e), u.context === null ? u.context = e : u.pendingContext = e, u = ca(t), u.payload = {element: a}, n = n === void 0 ? null : n, n !== null && (u.callback = n), a = sa(l, u, t), a !== null && (ft(a, l, t), Fu(a, l, t))
    }

    function sy(l, t) {
        if (l = l.memoizedState, l !== null && l.dehydrated !== null) {
            var a = l.retryLane;
            l.retryLane = a !== 0 && a < t ? a : t
        }
    }

    function uc(l, t) {
        sy(l, t), (l = l.alternate) && sy(l, t)
    }

    function oy(l) {
        if (l.tag === 13 || l.tag === 31) {
            var t = Ra(l, 67108864);
            t !== null && ft(t, l, 67108864), uc(l, 67108864)
        }
    }

    function yy(l) {
        if (l.tag === 13 || l.tag === 31) {
            var t = rt();
            t = kn(t);
            var a = Ra(l, t);
            a !== null && ft(a, l, t), uc(l, t)
        }
    }

    var Bn = !0;

    function $d(l, t, a, u) {
        var e = b.T;
        b.T = null;
        var n = _.p;
        try {
            _.p = 2, ec(l, t, a, u)
        } finally {
            _.p = n, b.T = e
        }
    }

    function Fd(l, t, a, u) {
        var e = b.T;
        b.T = null;
        var n = _.p;
        try {
            _.p = 8, ec(l, t, a, u)
        } finally {
            _.p = n, b.T = e
        }
    }

    function ec(l, t, a, u) {
        if (Bn) {
            var e = nc(u);
            if (e === null) Vf(l, t, u, Yn, a), dy(l, u); else if (Id(e, l, t, a, u)) u.stopPropagation(); else if (dy(l, u), t & 4 && -1 < kd.indexOf(l)) {
                for (; e !== null;) {
                    var n = wa(e);
                    if (n !== null) switch (n.tag) {
                        case 3:
                            if (n = n.stateNode, n.current.memoizedState.isDehydrated) {
                                var i = _a(n.pendingLanes);
                                if (i !== 0) {
                                    var f = n;
                                    for (f.pendingLanes |= 2, f.entangledLanes |= 2; i;) {
                                        var c = 1 << 31 - ot(i);
                                        f.entanglements[1] |= c, i &= ~c
                                    }
                                    jt(n), (fl & 6) === 0 && (bn = ct() + 500, me(0))
                                }
                            }
                            break;
                        case 31:
                        case 13:
                            f = Ra(n, 2), f !== null && ft(f, n, 2), Tn(), uc(n, 2)
                    }
                    if (n = nc(u), n === null && Vf(l, t, u, Yn, a), n === e) break;
                    e = n
                }
                e !== null && u.stopPropagation()
            } else Vf(l, t, u, null, a)
        }
    }

    function nc(l) {
        return l = ii(l), ic(l)
    }

    var Yn = null;

    function ic(l) {
        if (Yn = null, l = Ja(l), l !== null) {
            var t = X(l);
            if (t === null) l = null; else {
                var a = t.tag;
                if (a === 13) {
                    if (l = M(t), l !== null) return l;
                    l = null
                } else if (a === 31) {
                    if (l = P(t), l !== null) return l;
                    l = null
                } else if (a === 3) {
                    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
                    l = null
                } else t !== l && (l = null)
            }
        }
        return Yn = l, null
    }

    function my(l) {
        switch (l) {
            case"beforetoggle":
            case"cancel":
            case"click":
            case"close":
            case"contextmenu":
            case"copy":
            case"cut":
            case"auxclick":
            case"dblclick":
            case"dragend":
            case"dragstart":
            case"drop":
            case"focusin":
            case"focusout":
            case"input":
            case"invalid":
            case"keydown":
            case"keypress":
            case"keyup":
            case"mousedown":
            case"mouseup":
            case"paste":
            case"pause":
            case"play":
            case"pointercancel":
            case"pointerdown":
            case"pointerup":
            case"ratechange":
            case"reset":
            case"resize":
            case"seeked":
            case"submit":
            case"toggle":
            case"touchcancel":
            case"touchend":
            case"touchstart":
            case"volumechange":
            case"change":
            case"selectionchange":
            case"textInput":
            case"compositionstart":
            case"compositionend":
            case"compositionupdate":
            case"beforeblur":
            case"afterblur":
            case"beforeinput":
            case"blur":
            case"fullscreenchange":
            case"focus":
            case"hashchange":
            case"popstate":
            case"select":
            case"selectstart":
                return 2;
            case"drag":
            case"dragenter":
            case"dragexit":
            case"dragleave":
            case"dragover":
            case"mousemove":
            case"mouseout":
            case"mouseover":
            case"pointermove":
            case"pointerout":
            case"pointerover":
            case"scroll":
            case"touchmove":
            case"wheel":
            case"mouseenter":
            case"mouseleave":
            case"pointerenter":
            case"pointerleave":
                return 8;
            case"message":
                switch (By()) {
                    case bc:
                        return 2;
                    case zc:
                        return 8;
                    case Me:
                    case Yy:
                        return 32;
                    case Tc:
                        return 268435456;
                    default:
                        return 32
                }
            default:
                return 32
        }
    }

    var fc = !1, za = null, Ta = null, pa = null, be = new Map, ze = new Map, Aa = [],
        kd = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");

    function dy(l, t) {
        switch (l) {
            case"focusin":
            case"focusout":
                za = null;
                break;
            case"dragenter":
            case"dragleave":
                Ta = null;
                break;
            case"mouseover":
            case"mouseout":
                pa = null;
                break;
            case"pointerover":
            case"pointerout":
                be.delete(t.pointerId);
                break;
            case"gotpointercapture":
            case"lostpointercapture":
                ze.delete(t.pointerId)
        }
    }

    function Te(l, t, a, u, e, n) {
        return l === null || l.nativeEvent !== n ? (l = {
            blockedOn: t,
            domEventName: a,
            eventSystemFlags: u,
            nativeEvent: n,
            targetContainers: [e]
        }, t !== null && (t = wa(t), t !== null && oy(t)), l) : (l.eventSystemFlags |= u, t = l.targetContainers, e !== null && t.indexOf(e) === -1 && t.push(e), l)
    }

    function Id(l, t, a, u, e) {
        switch (t) {
            case"focusin":
                return za = Te(za, l, t, a, u, e), !0;
            case"dragenter":
                return Ta = Te(Ta, l, t, a, u, e), !0;
            case"mouseover":
                return pa = Te(pa, l, t, a, u, e), !0;
            case"pointerover":
                var n = e.pointerId;
                return be.set(n, Te(be.get(n) || null, l, t, a, u, e)), !0;
            case"gotpointercapture":
                return n = e.pointerId, ze.set(n, Te(ze.get(n) || null, l, t, a, u, e)), !0
        }
        return !1
    }

    function vy(l) {
        var t = Ja(l.target);
        if (t !== null) {
            var a = X(t);
            if (a !== null) {
                if (t = a.tag, t === 13) {
                    if (t = M(a), t !== null) {
                        l.blockedOn = t, Oc(l.priority, function () {
                            yy(a)
                        });
                        return
                    }
                } else if (t === 31) {
                    if (t = P(a), t !== null) {
                        l.blockedOn = t, Oc(l.priority, function () {
                            yy(a)
                        });
                        return
                    }
                } else if (t === 3 && a.stateNode.current.memoizedState.isDehydrated) {
                    l.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
                    return
                }
            }
        }
        l.blockedOn = null
    }

    function Gn(l) {
        if (l.blockedOn !== null) return !1;
        for (var t = l.targetContainers; 0 < t.length;) {
            var a = nc(l.nativeEvent);
            if (a === null) {
                a = l.nativeEvent;
                var u = new a.constructor(a.type, a);
                ni = u, a.target.dispatchEvent(u), ni = null
            } else return t = wa(a), t !== null && oy(t), l.blockedOn = a, !1;
            t.shift()
        }
        return !0
    }

    function hy(l, t, a) {
        Gn(l) && a.delete(t)
    }

    function Pd() {
        fc = !1, za !== null && Gn(za) && (za = null), Ta !== null && Gn(Ta) && (Ta = null), pa !== null && Gn(pa) && (pa = null), be.forEach(hy), ze.forEach(hy)
    }

    function Xn(l, t) {
        l.blockedOn === t && (l.blockedOn = null, fc || (fc = !0, E.unstable_scheduleCallback(E.unstable_NormalPriority, Pd)))
    }

    var Qn = null;

    function gy(l) {
        Qn !== l && (Qn = l, E.unstable_scheduleCallback(E.unstable_NormalPriority, function () {
            Qn === l && (Qn = null);
            for (var t = 0; t < l.length; t += 3) {
                var a = l[t], u = l[t + 1], e = l[t + 2];
                if (typeof u != "function") {
                    if (ic(u || a) === null) continue;
                    break
                }
                var n = wa(a);
                n !== null && (l.splice(t, 3), t -= 3, ef(n, {pending: !0, data: e, method: a.method, action: u}, u, e))
            }
        }))
    }

    function Du(l) {
        function t(c) {
            return Xn(c, l)
        }

        za !== null && Xn(za, l), Ta !== null && Xn(Ta, l), pa !== null && Xn(pa, l), be.forEach(t), ze.forEach(t);
        for (var a = 0; a < Aa.length; a++) {
            var u = Aa[a];
            u.blockedOn === l && (u.blockedOn = null)
        }
        for (; 0 < Aa.length && (a = Aa[0], a.blockedOn === null);) vy(a), a.blockedOn === null && Aa.shift();
        if (a = (l.ownerDocument || l).$$reactFormReplay, a != null) for (u = 0; u < a.length; u += 3) {
            var e = a[u], n = a[u + 1], i = e[tt] || null;
            if (typeof n == "function") i || gy(a); else if (i) {
                var f = null;
                if (n && n.hasAttribute("formAction")) {
                    if (e = n, i = n[tt] || null) f = i.formAction; else if (ic(e) !== null) continue
                } else f = i.action;
                typeof f == "function" ? a[u + 1] = f : (a.splice(u, 3), u -= 3), gy(a)
            }
        }
    }

    function ry() {
        function l(n) {
            n.canIntercept && n.info === "react-transition" && n.intercept({
                handler: function () {
                    return new Promise(function (i) {
                        return e = i
                    })
                }, focusReset: "manual", scroll: "manual"
            })
        }

        function t() {
            e !== null && (e(), e = null), u || setTimeout(a, 20)
        }

        function a() {
            if (!u && !navigation.transition) {
                var n = navigation.currentEntry;
                n && n.url != null && navigation.navigate(n.url, {
                    state: n.getState(),
                    info: "react-transition",
                    history: "replace"
                })
            }
        }

        if (typeof navigation == "object") {
            var u = !1, e = null;
            return navigation.addEventListener("navigate", l), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(a, 100), function () {
                u = !0, navigation.removeEventListener("navigate", l), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), e !== null && (e(), e = null)
            }
        }
    }

    function cc(l) {
        this._internalRoot = l
    }

    Zn.prototype.render = cc.prototype.render = function (l) {
        var t = this._internalRoot;
        if (t === null) throw Error(d(409));
        var a = t.current, u = rt();
        cy(a, u, l, t, null, null)
    }, Zn.prototype.unmount = cc.prototype.unmount = function () {
        var l = this._internalRoot;
        if (l !== null) {
            this._internalRoot = null;
            var t = l.containerInfo;
            cy(l.current, 2, null, l, null, null), Tn(), t[Ka] = null
        }
    };

    function Zn(l) {
        this._internalRoot = l
    }

    Zn.prototype.unstable_scheduleHydration = function (l) {
        if (l) {
            var t = _c();
            l = {blockedOn: null, target: l, priority: t};
            for (var a = 0; a < Aa.length && t !== 0 && t < Aa[a].priority; a++) ;
            Aa.splice(a, 0, l), a === 0 && vy(l)
        }
    };
    var Sy = Y.version;
    if (Sy !== "19.2.4") throw Error(d(527, Sy, "19.2.4"));
    _.findDOMNode = function (l) {
        var t = l._reactInternals;
        if (t === void 0) throw typeof l.render == "function" ? Error(d(188)) : (l = Object.keys(l).join(","), Error(d(268, l)));
        return l = S(t), l = l !== null ? L(l) : null, l = l === null ? null : l.stateNode, l
    };
    var l1 = {
        bundleType: 0,
        version: "19.2.4",
        rendererPackageName: "react-dom",
        currentDispatcherRef: b,
        reconcilerVersion: "19.2.4"
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var xn = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!xn.isDisabled && xn.supportsFiber) try {
            Nu = xn.inject(l1), st = xn
        } catch {
        }
    }
    return Ae.createRoot = function (l, t) {
        if (!R(l)) throw Error(d(299));
        var a = !1, u = "", e = E0, n = M0, i = _0;
        return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (u = t.identifierPrefix), t.onUncaughtError !== void 0 && (e = t.onUncaughtError), t.onCaughtError !== void 0 && (n = t.onCaughtError), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = iy(l, 1, !1, null, null, a, u, null, e, n, i, ry), l[Ka] = t.current, Lf(l), new cc(t)
    }, Ae.hydrateRoot = function (l, t, a) {
        if (!R(l)) throw Error(d(299));
        var u = !1, e = "", n = E0, i = M0, f = _0, c = null;
        return a != null && (a.unstable_strictMode === !0 && (u = !0), a.identifierPrefix !== void 0 && (e = a.identifierPrefix), a.onUncaughtError !== void 0 && (n = a.onUncaughtError), a.onCaughtError !== void 0 && (i = a.onCaughtError), a.onRecoverableError !== void 0 && (f = a.onRecoverableError), a.formState !== void 0 && (c = a.formState)), t = iy(l, 1, !0, t, a ?? null, u, e, c, n, i, f, ry), t.context = fy(null), a = t.current, u = rt(), u = kn(u), e = ca(u), e.callback = null, sa(a, e, u), a = u, t.current.lanes = a, Hu(t, a), jt(t), l[Ka] = t.current, Lf(l), new Zn(t)
    }, Ae.version = "19.2.4", Ae
}

var Dy;

function o1() {
    if (Dy) return yc.exports;
    Dy = 1;

    function E() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(E)
        } catch (Y) {
            console.error(Y)
        }
    }

    return E(), yc.exports = s1(), yc.exports
}

var y1 = o1();
const Ln = 9.80665;

function hc(E, Y, C, d) {
    const R = E * (.5 - C), X = d * Math.PI / 180, M = R * Math.cos(X);
    return {torqueNm: Y * Ln * M, comFromPivotM: R, horizontalArmM: M, angleRad: X}
}

const _l = "'JetBrains Mono', monospace", Ry = "'Space Grotesk', sans-serif";

function Va(E, Y = 4) {
    return E == null || isNaN(E) ? "—" : Math.abs(E) < 1e-4 && E !== 0 ? E.toExponential(Y) : parseFloat(E.toFixed(Y)).toString()
}

const Pl = {
    card: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: 16
    },
    cardSubtle: {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: 16
    },
    label: {
        fontFamily: Ry,
        fontSize: 11,
        fontWeight: 600,
        opacity: .5,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 12
    },
    fieldLabel: {fontSize: 10, letterSpacing: "0.08em", opacity: .6, fontFamily: _l, textTransform: "uppercase"},
    mono: {fontFamily: _l},
    input: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 4,
        padding: "4px 8px",
        fontSize: 13,
        color: "#e2e8f0",
        fontFamily: _l,
        outline: "none",
        width: 96
    },
    inputSmall: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 13,
        color: "#e2e8f0",
        fontFamily: _l,
        outline: "none",
        width: 56,
        textAlign: "center"
    },
    unit: {fontSize: 11, opacity: .4, fontFamily: _l, marginLeft: 4},
    btn: E => ({
        padding: "4px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontFamily: _l,
        cursor: "pointer",
        background: E ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)",
        color: E ? "#f97316" : "rgba(255,255,255,0.5)",
        border: E ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)"
    })
};

function Uy({label: E, value: Y, onChange: C, unit: d, style: R, inputStyle: X}) {
    return D.jsxs("div", {
        style: {
            display: "flex",
            flexDirection: E ? "column" : "row",
            gap: 4,
            alignItems: E ? "flex-start" : "center", ...R
        },
        children: [E && D.jsx("label", {style: Pl.fieldLabel, children: E}), D.jsxs("div", {
            style: {
                display: "flex",
                alignItems: "center",
                gap: 4
            },
            children: [D.jsx("input", {
                type: "number",
                value: Y,
                onChange: M => C(parseFloat(M.target.value) || 0),
                style: {...Pl.input, ...X}
            }), d && D.jsx("span", {style: Pl.unit, children: d})]
        })]
    })
}

function Hy(E, Y, C, d, R) {
    lt.useEffect(() => {
        const X = Y.current, M = E.current;
        if (!X || !M) return;
        const P = window.devicePixelRatio || 1, y = M.clientWidth;
        X.width = y * P, X.height = C * P, X.style.width = y + "px", X.style.height = C + "px";
        const S = X.getContext("2d");
        S.scale(P, P), S.clearRect(0, 0, y, C), d(S, y, C)
    }, R)
}

function m1(E, Y, C, d, R = 5, X = 5) {
    E.strokeStyle = "rgba(255,255,255,0.06)", E.lineWidth = 1;
    for (let M = 0; M <= R; M++) {
        const P = Y.l + M / R * C;
        E.beginPath(), E.moveTo(P, Y.t), E.lineTo(P, Y.t + d), E.stroke()
    }
    for (let M = 0; M <= X; M++) {
        const P = Y.t + M / X * d;
        E.beginPath(), E.moveTo(Y.l, P), E.lineTo(Y.l + C, P), E.stroke()
    }
    E.strokeStyle = "rgba(255,255,255,0.2)", E.beginPath(), E.moveTo(Y.l, Y.t), E.lineTo(Y.l, Y.t + d), E.lineTo(Y.l + C, Y.t + d), E.stroke()
}

function d1({lengthM: E, massKg: Y, pivotFraction: C, angleDeg: d, torqueNm: R, comFromPivotM: X}) {
    const M = lt.useRef(null), P = lt.useRef(null);
    return Hy(P, M, 320, (y, S, L) => {
        const O = S / 2, j = L / 2, cl = Math.min(S * .35, L * .38), rl = d * Math.PI / 180, El = C * cl,
            xl = (1 - C) * cl, Ml = O - El * Math.cos(rl), ll = j + El * Math.sin(rl), bl = O + xl * Math.cos(rl),
            sl = j - xl * Math.sin(rl), pl = (.5 - C) * cl, x = O + pl * Math.cos(rl), dl = j - pl * Math.sin(rl);
        y.strokeStyle = "rgba(255,255,255,0.08)", y.lineWidth = 1, y.setLineDash([4, 4]), y.beginPath(), y.moveTo(O - cl * 1.3, j), y.lineTo(O + cl * 1.3, j), y.stroke(), y.beginPath(), y.moveTo(O, j - cl * 1.3), y.lineTo(O, j + cl * 1.3), y.stroke(), y.setLineDash([]);
        const Fl = Math.min(40, cl * .25), St = -rl;
        if (Math.abs(d) > .5) {
            y.strokeStyle = "rgba(249,115,22,0.3)", y.lineWidth = 1.5, y.beginPath(), y.arc(O, j, Fl, Math.min(0, St), Math.max(0, St)), y.stroke();
            const b = St / 2, _ = Fl + 14;
            y.fillStyle = "rgba(249,115,22,0.6)", y.font = `11px ${_l}`, y.textAlign = "center", y.textBaseline = "middle", y.fillText(`${d}°`, O + _ * Math.cos(b), j + _ * Math.sin(b))
        }
        y.strokeStyle = "#e2e8f0", y.lineWidth = 6, y.lineCap = "round", y.beginPath(), y.moveTo(Ml, ll), y.lineTo(bl, sl), y.stroke(), y.strokeStyle = "rgba(255,255,255,0.15)", y.lineWidth = 2, y.beginPath(), y.moveTo(Ml, ll), y.lineTo(bl, sl), y.stroke();
        const Xl = Math.min(50, cl * .35), Ul = 6;
        if (y.strokeStyle = "#3b82f6", y.fillStyle = "#3b82f6", y.lineWidth = 2, y.beginPath(), y.moveTo(x, dl), y.lineTo(x, dl + Xl), y.stroke(), y.beginPath(), y.moveTo(x, dl + Xl + 2), y.lineTo(x - Ul, dl + Xl - Ul), y.lineTo(x + Ul, dl + Xl - Ul), y.closePath(), y.fill(), y.font = `10px ${_l}`, y.textAlign = "left", y.fillStyle = "rgba(59,130,246,0.7)", y.fillText("mg", x + 8, dl + Xl - 2), Math.abs(R) > .001) {
            const _ = R > 0 ? "#10b981" : "#f43f5e";
            y.strokeStyle = _, y.lineWidth = 2.5;
            const Q = -Math.PI * .6, ul = Math.PI * .3;
            y.beginPath(), R > 0 ? y.arc(O, j, 22, Q, ul) : y.arc(O, j, 22, ul, Q, !0), y.stroke();
            const il = R > 0 ? ul : Q, o = R > 0 ? 1 : -1, p = O + 22 * Math.cos(il), U = j + 22 * Math.sin(il),
                N = il + Math.PI / 2 * o;
            y.fillStyle = _, y.beginPath(), y.moveTo(p + 5 * Math.cos(N), U + 5 * Math.sin(N)), y.lineTo(p + 5 * Math.cos(N + 2.4), U + 5 * Math.sin(N + 2.4)), y.lineTo(p + 5 * Math.cos(N - 2.4), U + 5 * Math.sin(N - 2.4)), y.closePath(), y.fill(), y.font = `bold 11px ${_l}`, y.textAlign = "center", y.fillStyle = R > 0 ? "rgba(16,185,129,0.8)" : "rgba(244,63,94,0.8)", y.fillText("τ", O, j - 22 - 8)
        }
        y.beginPath(), y.arc(O, j, 7, 0, Math.PI * 2), y.fillStyle = "#f97316", y.fill(), y.beginPath(), y.arc(O, j, 4, 0, Math.PI * 2), y.fillStyle = "#0c0e14", y.fill(), y.beginPath(), y.arc(O, j, 2, 0, Math.PI * 2), y.fillStyle = "#f97316", y.fill(), y.beginPath(), y.arc(x, dl, 5, 0, Math.PI * 2), y.fillStyle = "#3b82f6", y.fill(), y.beginPath(), y.arc(bl, sl, 4, 0, Math.PI * 2), y.fillStyle = "rgba(255,255,255,0.4)", y.fill(), y.beginPath(), y.arc(Ml, ll, 4, 0, Math.PI * 2), y.fillStyle = "rgba(255,255,255,0.25)", y.fill();
        let B = 14;
        const al = 12;
        y.font = `10px ${_l}`, y.textAlign = "left", [["#f97316", "Pivot"], ["#3b82f6", "CoM"]].forEach(([b, _]) => {
            y.fillStyle = b, y.beginPath(), y.arc(al + 4, B, 3, 0, Math.PI * 2), y.fill(), y.fillStyle = "rgba(255,255,255,0.5)", y.fillText(_, al + 14, B + 3), B += 16
        }), y.fillStyle = "#3b82f6", y.fillRect(al + 1, B - 2, 2, 10), y.beginPath(), y.moveTo(al + 2, B + 10), y.lineTo(al - 1, B + 6), y.lineTo(al + 5, B + 6), y.closePath(), y.fill(), y.fillStyle = "rgba(255,255,255,0.5)", y.fillText("Gravity (mg)", al + 14, B + 5)
    }, [E, Y, C, d, R, X]), D.jsx("div", {
        ref: P,
        style: {width: "100%"},
        children: D.jsx("canvas", {ref: M, style: {display: "block"}})
    })
}

function v1({lengthM: E, massKg: Y, pivotFraction: C, currentAngle: d}) {
    const R = lt.useRef(null), X = lt.useRef(null);
    return Hy(X, R, 260, (M, P, y) => {
        const S = {t: 24, r: 24, b: 50, l: 70}, L = P - S.l - S.r, O = y - S.t - S.b,
            j = Math.abs(Y * Ln * E * (.5 - C)), cl = j > 0 ? j * 1.15 : 1;
        m1(M, S, L, O, 6, 4);
        const rl = S.t + O / 2;
        M.strokeStyle = "rgba(255,255,255,0.12)", M.lineWidth = 1, M.beginPath(), M.moveTo(S.l, rl), M.lineTo(S.l + L, rl), M.stroke(), M.fillStyle = "rgba(255,255,255,0.4)", M.font = `10px ${_l}`, M.textAlign = "center";
        const El = [-180, -120, -60, 0, 60, 120, 180];
        El.forEach((sl, ql) => M.fillText(sl + "°", S.l + ql / (El.length - 1) * L, S.t + O + 16)), M.fillText("Angle (degrees)", S.l + L / 2, S.t + O + 38), M.textAlign = "right";
        for (let sl = 0; sl <= 4; sl++) {
            const ql = S.t + sl / 4 * O, pl = cl - sl / 4 * 2 * cl;
            M.fillText(Va(pl, 2), S.l - 8, ql + 3)
        }
        M.save(), M.translate(14, S.t + O / 2), M.rotate(-Math.PI / 2), M.textAlign = "center", M.fillText("Torque (N·m)", 0, 0), M.restore();
        const xl = 360;
        M.strokeStyle = "#f97316", M.lineWidth = 2.5, M.beginPath();
        for (let sl = 0; sl <= xl; sl++) {
            const ql = -180 + sl / xl * 360, {torqueNm: pl} = hc(E, Y, C, ql), x = S.l + (ql + 180) / 360 * L,
                dl = S.t + O / 2 - pl / cl * (O / 2);
            sl === 0 ? M.moveTo(x, dl) : M.lineTo(x, dl)
        }
        M.stroke();
        const {torqueNm: Ml} = hc(E, Y, C, d), ll = S.l + (d + 180) / 360 * L, bl = S.t + O / 2 - Ml / cl * (O / 2);
        M.strokeStyle = "rgba(249,115,22,0.3)", M.lineWidth = 1, M.setLineDash([3, 3]), M.beginPath(), M.moveTo(ll, S.t), M.lineTo(ll, S.t + O), M.stroke(), M.setLineDash([]), M.beginPath(), M.arc(ll, bl, 6, 0, Math.PI * 2), M.fillStyle = "#f97316", M.fill(), M.beginPath(), M.arc(ll, bl, 3, 0, Math.PI * 2), M.fillStyle = "#0c0e14", M.fill(), M.fillStyle = "#f97316", M.font = `bold 11px ${_l}`, M.textAlign = ll > S.l + L / 2 ? "right" : "left", M.fillText(`${Va(Ml, 3)} N·m`, ll + (ll > S.l + L / 2 ? -12 : 12), bl - 10)
    }, [E, Y, C, d]), D.jsx("div", {
        ref: X,
        style: {width: "100%"},
        children: D.jsx("canvas", {ref: R, style: {display: "block"}})
    })
}

const Ny = [{id: "custom", label: "Custom", length: 1, mass: 5, pivot: 0}, {
    id: "intake",
    label: "Intake Arm",
    length: .45,
    mass: 3.5,
    pivot: 0
}, {id: "singleStage", label: "Single-Stage Arm", length: .7, mass: 5, pivot: 0}, {
    id: "doubleStage",
    label: "Double-Stage Arm",
    length: 1.1,
    mass: 8,
    pivot: 0
}, {id: "wrist", label: "Wrist / End Effector", length: .25, mass: 2, pivot: 0}, {
    id: "balanced",
    label: "Counterbalanced",
    length: .8,
    mass: 6,
    pivot: .3
}];

function h1() {
    const [E, Y] = lt.useState("singleStage"), [C, d] = lt.useState(.7), [R, X] = lt.useState(5), [M, P] = lt.useState(0), [y, S] = lt.useState(0), [L, O] = lt.useState("diagram"), [j, cl] = lt.useState("metric"),
        rl = lt.useCallback(B => {
            if (Y(B), B !== "custom") {
                const al = Ny.find(Wl => Wl.id === B);
                al && (d(al.length), X(al.mass), P(al.pivot))
            }
        }, []), El = B => {
            d(B), Y("custom")
        }, xl = B => {
            X(B), Y("custom")
        }, Ml = B => {
            P(B), Y("custom")
        }, ll = lt.useMemo(() => hc(C, R, M, y), [C, R, M, y]), bl = j === "imperial" ? ll.torqueNm * 8.8507 : ll.torqueNm,
        sl = j === "imperial" ? ll.comFromPivotM * 39.3701 : ll.comFromPivotM * 100,
        ql = j === "imperial" ? ll.horizontalArmM * 39.3701 : ll.horizontalArmM * 100,
        pl = j === "imperial" ? "lbf·in" : "N·m", x = j === "imperial" ? "in" : "cm",
        dl = Math.abs(R * Ln * C * (.5 - M)), Fl = j === "imperial" ? dl * 8.8507 : dl,
        St = Math.abs(ll.torqueNm) > .001 ? ll.torqueNm > 0 ? "#10b981" : "#f43f5e" : "#f97316",
        Xl = Math.abs(ll.torqueNm) > .001 ? ll.torqueNm > 0 ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)" : "rgba(249,115,22,0.06)",
        Ul = Math.abs(ll.torqueNm) > .001 ? ll.torqueNm > 0 ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(244,63,94,0.15)" : "1px solid rgba(249,115,22,0.15)";
    return D.jsxs("div", {
        style: {
            minHeight: "100vh",
            background: "linear-gradient(180deg, #0c0e14 0%, #111420 50%, #0c0e14 100%)",
            color: "#c8ced8",
            fontFamily: Ry
        },
        children: [D.jsx("link", {
            href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
            rel: "stylesheet"
        }), D.jsxs("header", {
            style: {padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)"},
            children: [D.jsxs("div", {
                style: {display: "flex", alignItems: "baseline", gap: 12},
                children: [D.jsx("h1", {
                    style: {
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: "-0.025em",
                        color: "#f97316",
                        margin: 0
                    }, children: "ArmTorque"
                }), D.jsx("span", {
                    style: {fontSize: 12, opacity: .3, fontFamily: _l},
                    children: "Gravity Load Calculator"
                })]
            }), D.jsx("p", {
                style: {fontSize: 12, opacity: .3, marginTop: 4},
                children: "FRC arm gravity torque analysis & visualization"
            })]
        }), D.jsxs("div", {
            style: {padding: "20px 24px"},
            children: [D.jsxs("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 8
                },
                children: [D.jsxs("div", {
                    style: {display: "flex", alignItems: "center", gap: 8},
                    children: [D.jsx("span", {
                        style: {
                            fontSize: 11,
                            fontWeight: 600,
                            opacity: .5,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em"
                        }, children: "Preset"
                    }), D.jsx("select", {
                        value: E,
                        onChange: B => rl(B.target.value),
                        style: {
                            background: "transparent",
                            color: "#e2e8f0",
                            fontFamily: _l,
                            fontSize: 13,
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 4,
                            padding: "4px 8px",
                            outline: "none",
                            cursor: "pointer"
                        },
                        children: Ny.map(B => D.jsx("option", {
                            value: B.id,
                            style: {background: "#1a1d2e"},
                            children: B.label
                        }, B.id))
                    })]
                }), D.jsx("div", {
                    style: {display: "flex", gap: 4},
                    children: ["metric", "imperial"].map(B => D.jsx("button", {
                        onClick: () => cl(B),
                        style: Pl.btn(j === B),
                        children: B === "metric" ? "Metric" : "Imperial"
                    }, B))
                })]
            }), D.jsxs("div", {
                style: {...Pl.cardSubtle, marginBottom: 20},
                children: [D.jsx("div", {style: Pl.label, children: "Parameters"}), D.jsxs("div", {
                    style: {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16},
                    children: [D.jsx(Uy, {
                        label: "Arm Length",
                        value: parseFloat((j === "imperial" ? C * 39.3701 : C).toFixed(4)),
                        onChange: B => El(Math.max(.001, j === "imperial" ? B / 39.3701 : B)),
                        unit: j === "imperial" ? "in" : "m"
                    }), D.jsx(Uy, {
                        label: "Arm Mass",
                        value: parseFloat((j === "imperial" ? R * 2.20462 : R).toFixed(4)),
                        onChange: B => xl(Math.max(.001, j === "imperial" ? B / 2.20462 : B)),
                        unit: j === "imperial" ? "lb" : "kg"
                    }), D.jsxs("div", {
                        style: {display: "flex", flexDirection: "column", gap: 4},
                        children: [D.jsx("label", {
                            style: Pl.fieldLabel,
                            children: "Pivot Location"
                        }), D.jsxs("div", {
                            style: {display: "flex", alignItems: "center", gap: 8},
                            children: [D.jsx("input", {
                                type: "range",
                                min: 0,
                                max: 1,
                                step: .01,
                                value: M,
                                onChange: B => Ml(parseFloat(B.target.value)),
                                style: {accentColor: "#f97316", width: 100}
                            }), D.jsx("input", {
                                type: "number",
                                value: parseFloat(M.toFixed(2)),
                                min: 0,
                                max: 1,
                                step: .01,
                                onChange: B => {
                                    let al = parseFloat(B.target.value);
                                    isNaN(al) && (al = 0), Ml(Math.max(0, Math.min(1, al)))
                                },
                                style: Pl.inputSmall
                            })]
                        }), D.jsxs("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 9,
                                opacity: .25,
                                fontFamily: _l,
                                width: 100
                            }, children: [D.jsx("span", {children: "Base"}), D.jsx("span", {children: "Tip"})]
                        })]
                    })]
                }), D.jsxs("div", {
                    style: {marginTop: 16, display: "flex", flexDirection: "column", gap: 4},
                    children: [D.jsx("label", {
                        style: Pl.fieldLabel,
                        children: "Angle"
                    }), D.jsxs("div", {
                        style: {display: "flex", alignItems: "center", gap: 12},
                        children: [D.jsx("input", {
                            type: "range",
                            min: -180,
                            max: 180,
                            step: 1,
                            value: y,
                            onChange: B => S(parseFloat(B.target.value)),
                            style: {flex: 1, accentColor: "#f97316"}
                        }), D.jsxs("div", {
                            style: {display: "flex", alignItems: "center", gap: 4},
                            children: [D.jsx("input", {
                                type: "number",
                                value: y,
                                min: -180,
                                max: 180,
                                step: 1,
                                onChange: B => {
                                    let al = parseFloat(B.target.value);
                                    isNaN(al) && (al = 0), S(Math.max(-180, Math.min(180, al)))
                                },
                                style: Pl.inputSmall
                            }), D.jsx("span", {style: Pl.unit, children: "°"})]
                        })]
                    }), D.jsxs("div", {
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 9,
                            opacity: .25,
                            fontFamily: _l,
                            padding: "0 2px"
                        },
                        children: [D.jsx("span", {children: "−180°"}), D.jsx("span", {children: "−90°"}), D.jsx("span", {children: "0° horiz"}), D.jsx("span", {children: "90°"}), D.jsx("span", {children: "180°"})]
                    })]
                })]
            }), D.jsxs("div", {
                style: {
                    borderRadius: 8,
                    padding: "16px 20px",
                    marginBottom: 20,
                    background: Xl,
                    border: Ul
                },
                children: [D.jsxs("div", {
                    style: {display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap"},
                    children: [D.jsx("span", {
                        style: {fontSize: 12, opacity: .5, fontFamily: _l},
                        children: "Torque due to gravity:"
                    }), D.jsx("span", {
                        style: {fontSize: 24, fontWeight: 700, fontFamily: _l, color: St},
                        children: Va(bl, 4)
                    }), D.jsx("span", {style: {fontSize: 13, opacity: .4, fontFamily: _l}, children: pl})]
                }), D.jsx("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "4px 24px",
                        marginTop: 12
                    },
                    children: [["|τ| at 0°", `${Va(Fl, 4)} ${pl}`], ["CoM from pivot", `${Va(sl, 2)} ${x}`], ["Horizontal arm", `${Va(ql, 2)} ${x}`], ["Weight force", `${Va(R * Ln, 3)} N`]].map(([B, al], Wl) => D.jsxs("div", {
                        style: {
                            display: "flex",
                            alignItems: "baseline",
                            gap: 8
                        },
                        children: [D.jsxs("span", {
                            style: {fontSize: 12, opacity: .4, fontFamily: _l},
                            children: [B, ":"]
                        }), D.jsx("span", {style: {fontSize: 12, fontFamily: _l, color: "#e2e8f0"}, children: al})]
                    }, Wl))
                })]
            }), D.jsxs("div", {
                style: {...Pl.cardSubtle, marginBottom: 20},
                children: [D.jsx("div", {
                    style: {display: "flex", gap: 4, marginBottom: 16},
                    children: [{id: "diagram", label: "Arm Diagram"}, {
                        id: "torque_angle",
                        label: "Torque vs Angle"
                    }].map(B => D.jsx("button", {
                        onClick: () => O(B.id),
                        style: Pl.btn(L === B.id),
                        children: B.label
                    }, B.id))
                }), L === "diagram" && D.jsx(d1, {
                    lengthM: C,
                    massKg: R,
                    pivotFraction: M,
                    angleDeg: y,
                    torqueNm: ll.torqueNm,
                    comFromPivotM: ll.comFromPivotM
                }), L === "torque_angle" && D.jsx(v1, {lengthM: C, massKg: R, pivotFraction: M, currentAngle: y})]
            }), D.jsxs("div", {
                style: {...Pl.cardSubtle, border: "1px solid rgba(255,255,255,0.05)"},
                children: [D.jsx("div", {
                    style: Pl.label,
                    children: "Arm Gravity Torque Reference"
                }), D.jsxs("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 8,
                        fontSize: 12,
                        opacity: .6,
                        fontFamily: _l
                    },
                    children: [D.jsx("div", {children: "d_com = L · (0.5 − pivot_fraction)"}), D.jsx("div", {children: "d_horiz = d_com · cos(θ)"}), D.jsx("div", {children: "τ = m · g · d_horiz"}), D.jsx("div", {children: "g = 9.80665 m/s²"}), D.jsx("div", {children: "θ = 0° → horizontal (max torque)"}), D.jsx("div", {children: "θ = ±90° → vertical (zero torque)"}), D.jsx("div", {children: "pivot = 0 → base, 1 → tip"}), D.jsx("div", {children: "Uniform mass distribution assumed"})]
                })]
            })]
        }), D.jsx("footer", {
            style: {padding: "16px 24px", textAlign: "center"},
            children: D.jsx("span", {
                style: {fontSize: 12, opacity: .2, fontFamily: _l},
                children: "Arm Gravity Torque Calculator — FRC Mechanism Design"
            })
        })]
    })
}

y1.createRoot(document.getElementById("root")).render(D.jsx(lt.StrictMode, {children: D.jsx(h1, {})}));
