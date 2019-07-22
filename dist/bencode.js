!(function(e) {
  var t = {};
  function n(r) {
    if (t[r]) return t[r].exports;
    var o = (t[r] = { i: r, l: !1, exports: {} });
    return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
  }
  (n.m = e),
    (n.c = t),
    (n.d = function(e, t, r) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r });
    }),
    (n.r = function(e) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (n.t = function(e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e;
      if (4 & t && "object" == typeof e && e && e.__esModule) return e;
      var r = Object.create(null);
      if (
        (n.r(r),
        Object.defineProperty(r, "default", { enumerable: !0, value: e }),
        2 & t && "string" != typeof e)
      )
        for (var o in e)
          n.d(
            r,
            o,
            function(t) {
              return e[t];
            }.bind(null, o)
          );
      return r;
    }),
    (n.n = function(e) {
      var t =
        e && e.__esModule
          ? function() {
              return e.default;
            }
          : function() {
              return e;
            };
      return n.d(t, "a", t), t;
    }),
    (n.o = function(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.p = ""),
    n((n.s = 0));
})([
  function(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });
    const r = n(1);
    t.encode = r.encode;
    const o = n(2);
    t.decode = o.decode;
  },
  function(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });
    class r extends Error {
      constructor(e) {
        super(e);
      }
    }
    function o(e) {
      const t = typeof e;
      return "object" === t
        ? null === e
          ? "null"
          : e instanceof Array
          ? "list"
          : "dict"
        : t;
    }
    function c(e) {
      return `${e.length}:${e}`;
    }
    function i(e) {
      return `i${e.toString()}e`;
    }
    function d(e) {
      const t = [];
      return (
        e.forEach(e => {
          const n = o(e);
          if ("list" === n) t.push(d(e));
          else if ("dict" === n) t.push(s(e));
          else if ("bigint" === n) t.push(i(e));
          else {
            if ("string" !== n) throw new r(`encodeList: wrong type ${n}`);
            t.push(c(e));
          }
        }),
        `l${t.join("")}e`
      );
    }
    function s(e) {
      const t = [],
        n = Object.keys(e);
      n.sort();
      for (let l of n) {
        const n = o(e[l]);
        if ((t.push(`${l.length}:${l}`), "dict" === n)) t.push(s(e[l]));
        else if ("list" === n) t.push(d(e[l]));
        else if ("string" === n) t.push(c(e[l]));
        else {
          if ("bigint" !== n) throw new r(`encodeDict: wrong type ${n}`);
          t.push(i(e[l]));
        }
      }
      return `d${t.join("")}e`;
    }
    (t.EncodeError = r),
      (t.getType = o),
      (t.encodeString = c),
      (t.encodeInt = i),
      (t.encodeList = d),
      (t.encodeDict = s),
      (t.encode = function(e) {
        const t = o(e);
        if ("dict" === t) return s(e);
        if ("list" === t) return d(e);
        if ("bigint" === t) return i(e);
        if ("string" === t) return c(e);
        throw new r(`encodeDict: wrong type ${t}`);
      });
  },
  function(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });
    class r extends Error {
      constructor(e) {
        super(e);
      }
    }
    function o(e, t) {
      e++;
      const n = t.indexOf("e", e);
      let o;
      if ("0" === t[e] && "e" !== t[e + 1])
        throw new r("decodeInt: leading zero");
      if ("-" === t[e] && !"123456789".includes(t[e + 1]))
        throw new r("decodeInt: invalid value");
      try {
        o = BigInt(t.slice(e, n));
      } catch (e) {
        throw new r("decodeInt: invalid value");
      }
      return [n + 1, o];
    }
    function c(e, t) {
      let n = t.indexOf(":", e);
      if (-1 === n) throw new r("decodeString: no colon found");
      const o = parseInt(t.slice(e, n));
      if (t.slice(n + 1).length < o)
        throw new r("decodeString: data too short");
      return [++n + o, t.slice(n, n + o)];
    }
    function i(e, t) {
      e++;
      const n = [];
      for (; e < t.length && "e" !== t[e]; ) {
        let s, l;
        if ("i" === t[e])
          try {
            [s, l] = o(e, t);
          } catch (e) {
            throw new r("decodeList: error while int");
          }
        else if ("0123456789".includes(t[e]))
          try {
            [s, l] = c(e, t);
          } catch (e) {
            throw new r("decodeList: error while decoding string");
          }
        else if ("l" === t[e])
          try {
            [s, l] = i(e, t);
          } catch (e) {
            throw new r("decodeList: error decoding list");
          }
        else {
          if ("d" !== t[e]) throw new r("decodeList: invalid value");
          try {
            [s, l] = d(e, t);
          } catch (e) {
            throw new r("decodeList: error decoding dict");
          }
        }
        n.push(l), (e = s);
      }
      if ("e" !== t[e]) throw new r("decodeList: unexpected end");
      return [e + 1, n];
    }
    function d(e, t) {
      e++;
      const n = {};
      for (; e < t.length && "e" !== t[e]; ) {
        let s, l, u;
        try {
          [s, u] = c(e, t);
        } catch (e) {
          throw new r("decodeDict: error decoding key");
        }
        if ("i" === t[(e = s)])
          try {
            [s, l] = o(e, t);
          } catch (e) {
            throw new r("decodeDict: error decoding int");
          }
        else if ("0123456789".includes(t[e]))
          try {
            [s, l] = c(e, t);
          } catch (e) {
            throw new r("decodeDict: error decoding string");
          }
        else if ("l" === t[e])
          try {
            [s, l] = i(e, t);
          } catch (e) {
            throw new r("decodeDict: decoding list");
          }
        else {
          if ("d" !== t[e]) throw new r("decodeDict: invalid value");
          try {
            [s, l] = d(e, t);
          } catch (e) {
            throw new r("decodeDict: error decoding dict");
          }
        }
        (n[u] = l), (e = s);
      }
      if ("e" !== t[e]) throw new r("decodeDict: unexpected end");
      return [e + 1, n];
    }
    (t.DecodeError = r),
      (t.decodeInt = o),
      (t.decodeString = c),
      (t.decodeList = i),
      (t.decodeDict = d),
      (t.decode = function(e) {
        const t = [];
        let n = 0;
        for (; n < e.length; ) {
          let s, l;
          if ("i" === e[n])
            try {
              [s, l] = o(n, e);
            } catch (e) {
              throw new r("decode: error decoding int");
            }
          else if ("0123456789".includes(e[n]))
            try {
              [s, l] = c(n, e);
            } catch (e) {
              throw new r("decode: error decoding string");
            }
          else if ("l" === e[n])
            try {
              [s, l] = i(n, e);
            } catch (e) {
              throw new r("decode: error decoding list");
            }
          else {
            if ("d" !== e[n]) throw new r("decode: invalid value");
            try {
              [s, l] = d(n, e);
            } catch (e) {
              throw new r("decode: error decoding dict");
            }
          }
          t.push(l), (n = s);
        }
        return t.length > 1 ? t : t.length ? t[0] : null;
      });
  }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9lbmNvZGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29kZS50cyJdLCJuYW1lcyI6WyJpbnN0YWxsZWRNb2R1bGVzIiwiX193ZWJwYWNrX3JlcXVpcmVfXyIsIm1vZHVsZUlkIiwiZXhwb3J0cyIsIm1vZHVsZSIsImkiLCJsIiwibW9kdWxlcyIsImNhbGwiLCJtIiwiYyIsImQiLCJuYW1lIiwiZ2V0dGVyIiwibyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZW51bWVyYWJsZSIsImdldCIsInIiLCJTeW1ib2wiLCJ0b1N0cmluZ1RhZyIsInZhbHVlIiwidCIsIm1vZGUiLCJfX2VzTW9kdWxlIiwibnMiLCJjcmVhdGUiLCJrZXkiLCJiaW5kIiwibiIsIm9iamVjdCIsInByb3BlcnR5IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJwIiwicyIsImVuY29kZV8xIiwiZW5jb2RlIiwiZGVjb2RlXzEiLCJkZWNvZGUiLCJFbmNvZGVFcnJvciIsIkVycm9yIiwiW29iamVjdCBPYmplY3RdIiwibWVzc2FnZSIsInN1cGVyIiwiZ2V0VHlwZSIsImVsdCIsInR5cGUiLCJBcnJheSIsImVuY29kZVN0cmluZyIsInN0ciIsImxlbmd0aCIsImVuY29kZUludCIsInRvU3RyaW5nIiwiZW5jb2RlTGlzdCIsImxpc3QiLCJyZXN1bHQiLCJmb3JFYWNoIiwicHVzaCIsImVuY29kZURpY3QiLCJqb2luIiwiZGljdCIsImtleXMiLCJzb3J0IiwiayIsIkRlY29kZUVycm9yIiwiZGVjb2RlSW50IiwiaW5kZXgiLCJkYXRhIiwiZW5kSW5kZXgiLCJpbmRleE9mIiwibmIiLCJpbmNsdWRlcyIsIkJpZ0ludCIsInNsaWNlIiwiX2EiLCJkZWNvZGVTdHJpbmciLCJjb2xvbkluZGV4IiwibGVuIiwicGFyc2VJbnQiLCJkZWNvZGVMaXN0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QVdoRSxFQUFBMEUsZUFBYzFFLEVBQUE4RSxhQUFZOUUsRUFBQWtGLGFBQVlsRixFQUFBcUMsT0ExQ3ZFLFNBQWdCNkIsR0FDZCxNQUFNWixFQUFnQixHQUN0QixJQUFJVyxFQUFRLEVBRVosS0FBT0EsRUFBUUMsRUFBS2pCLFFBQVEsQ0FDMUIsSUFBSThCLEVBQVc1RCxFQUVmLEdBQW9CLE1BQWhCK0MsRUFBS0QsR0FDUCxLQUNHYyxFQUFXNUQsR0FBUzZDLEVBQVVDLEVBQU9DLEdBQ3RDLE1BQUFPLEdBQ0EsTUFBTSxJQUFJVixFQUFZLG1DQUVuQixHQUFJLGFBQWFPLFNBQVNKLEVBQUtELElBQ3BDLEtBQ0djLEVBQVc1RCxHQUFTdUQsRUFBYVQsRUFBT0MsR0FDekMsTUFBQWMsR0FDQSxNQUFNLElBQUlqQixFQUFZLHNDQUVuQixHQUFvQixNQUFoQkcsRUFBS0QsR0FDZCxLQUNHYyxFQUFXNUQsR0FBUzJELEVBQVdiLEVBQU9DLEdBQ3ZDLE1BQUFlLEdBQ0EsTUFBTSxJQUFJbEIsRUFBWSxtQ0FFbkIsSUFBb0IsTUFBaEJHLEVBQUtELEdBT2QsTUFBTSxJQUFJRixFQUFZLHlCQU50QixLQUNHZ0IsRUFBVzVELEdBQVMrRCxFQUFXakIsRUFBT0MsR0FDdkMsTUFBQWlCLEdBQ0EsTUFBTSxJQUFJcEIsRUFBWSxnQ0FNMUJULEVBQU9FLEtBQUtyQyxHQUNaOEMsRUFBUWMsRUFHVixPQUFPekIsRUFBT0wsT0FBUyxFQUFJSyxFQUFTQSxFQUFPTCxPQUFTSyxFQUFPLEdBQUsiLCJmaWxlIjoiYmVuY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcbiIsImltcG9ydCB7IGVuY29kZSB9IGZyb20gXCIuL2VuY29kZVwiO1xuaW1wb3J0IHsgZGVjb2RlIH0gZnJvbSBcIi4vZGVjb2RlXCI7XG5cbmV4cG9ydCB7IGVuY29kZSwgZGVjb2RlIH07XG4iLCIvKipcbiAqIFRoaXMgZmlsZSBjb250YWlucyBhbGwgdGhlIGZ1bmN0aW9ucyBuZWVkZWQgdG8gZW5jb2RlIGEgamF2YXNjcmlwdCBvYmplY3RcbiAqIHRvIGl0J3MgYmVuY29kZWQgZXF1aXZhbGVudFxuICovXG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gZW5jb2RpbmcgZXJyb3IuXG4gKiBAZXh0ZW5kcyBFcnJvclxuICovXG5jbGFzcyBFbmNvZGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBFbmNvZGVFcnJvciBvYmplY3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gQSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgZXJyb3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciAtIHJldHVybiB0aGUgdHlwZSBvZiB0aGUgZWxlbWVudCBnaXZlbiBpbiBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gZWx0IC0gVGhlIGVsZW1lbnQgZnJvbSB3aGljaCB3ZSB3YW50IHRoZSB0eXBlLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGdldFR5cGUoZWx0OiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCB0eXBlID0gdHlwZW9mIGVsdDtcblxuICBpZiAodHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgIHJldHVybiBlbHQgPT09IG51bGwgPyBcIm51bGxcIiA6IGVsdCBpbnN0YW5jZW9mIEFycmF5ID8gXCJsaXN0XCIgOiBcImRpY3RcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybiBhIGJlbmNvZGVkIHN0cmluZyBnaXZlbiBhIGphdmFzY3JpcHQgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciAtIFRoZSBqYXZhc2NyaXB0IHN0cmluZy5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGJlbmNvZGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlU3RyaW5nKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3N0ci5sZW5ndGh9OiR7c3RyfWA7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgYmVuY29kZWQgaW50IGdpdmVuIGEgamF2YXNjcmlwdCBCaWdJbnQuXG4gKiBAcGFyYW0ge0JpZ0ludGVnZXJ9IG4gLSBUaGUgamF2YXNjcmlwdCBCaWdJbnQuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBiZW5jb2RlZCBpbnQuXG4gKi9cbmZ1bmN0aW9uIGVuY29kZUludChuOiBCaWdJbnQpOiBzdHJpbmcge1xuICByZXR1cm4gYGkke24udG9TdHJpbmcoKX1lYDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBiZW5jb2RlZCBsaXN0IGdpdmVuIGEgamF2YXNjcmlwdCBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gbGlzdCAtIFRoZSBqYXZhc2NyaXB0IGFycmF5LlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgYmVuY29kZWQgbGlzdC5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlTGlzdChsaXN0OiBhbnlbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcblxuICBsaXN0LmZvckVhY2goZWx0ID0+IHtcbiAgICBjb25zdCB0eXBlID0gZ2V0VHlwZShlbHQpO1xuXG4gICAgaWYgKHR5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICByZXN1bHQucHVzaChlbmNvZGVMaXN0KGVsdCkpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJkaWN0XCIpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGVuY29kZURpY3QoZWx0KSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJpZ2ludFwiKSB7XG4gICAgICByZXN1bHQucHVzaChlbmNvZGVJbnQoZWx0KSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXN1bHQucHVzaChlbmNvZGVTdHJpbmcoZWx0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFbmNvZGVFcnJvcihgZW5jb2RlTGlzdDogd3JvbmcgdHlwZSAke3R5cGV9YCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYGwke3Jlc3VsdC5qb2luKFwiXCIpfWVgO1xufVxuXG4vKipcbiAqIFJldHVybiBhIGJlbmNvZGVkIGRpY3QgZ2l2ZW4gYSBqYXZhc2NyaXB0IG9iamVjdC5cbiAqIEBwYXJhbSB7Kn0gZGljdCAtIFRoZSBqYXZhc2NyaXB0IG9iamVjdC5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGJlbmNvZGVkIGRpY3QuXG4gKi9cbmZ1bmN0aW9uIGVuY29kZURpY3QoZGljdDogYW55KTogc3RyaW5nIHtcbiAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZGljdCk7XG5cbiAga2V5cy5zb3J0KCk7XG5cbiAgZm9yIChsZXQgayBvZiBrZXlzKSB7XG4gICAgY29uc3QgdHlwZSA9IGdldFR5cGUoZGljdFtrXSk7XG5cbiAgICByZXN1bHQucHVzaChgJHtrLmxlbmd0aH06JHtrfWApO1xuICAgIGlmICh0eXBlID09PSBcImRpY3RcIikge1xuICAgICAgcmVzdWx0LnB1c2goZW5jb2RlRGljdChkaWN0W2tdKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgcmVzdWx0LnB1c2goZW5jb2RlTGlzdChkaWN0W2tdKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXN1bHQucHVzaChlbmNvZGVTdHJpbmcoZGljdFtrXSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgcmVzdWx0LnB1c2goZW5jb2RlSW50KGRpY3Rba10pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVuY29kZUVycm9yKGBlbmNvZGVEaWN0OiB3cm9uZyB0eXBlICR7dHlwZX1gKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYGQke3Jlc3VsdC5qb2luKFwiXCIpfWVgO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgYmVuY29kZWQgZm9ybSBvZiB0aGUgZ2l2ZW4gYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGVsdCAtIFRoZSBqYXZhc2NyaXB0IGVsZW1lbnQgdG8gZW5jb2RlLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgYmVuY29kZWQgZm9ybSBvZiB0aGUgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlKGVsdDogYW55KTogc3RyaW5nIHtcbiAgY29uc3QgdHlwZSA9IGdldFR5cGUoZWx0KTtcblxuICBpZiAodHlwZSA9PT0gXCJkaWN0XCIpIHtcbiAgICByZXR1cm4gZW5jb2RlRGljdChlbHQpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgcmV0dXJuIGVuY29kZUxpc3QoZWx0KTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSBcImJpZ2ludFwiKSB7XG4gICAgcmV0dXJuIGVuY29kZUludChlbHQpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gZW5jb2RlU3RyaW5nKGVsdCk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVuY29kZUVycm9yKGBlbmNvZGVEaWN0OiB3cm9uZyB0eXBlICR7dHlwZX1gKTtcbiAgfVxufVxuXG5leHBvcnQge1xuICBFbmNvZGVFcnJvcixcbiAgZ2V0VHlwZSxcbiAgZW5jb2RlU3RyaW5nLFxuICBlbmNvZGVJbnQsXG4gIGVuY29kZUxpc3QsXG4gIGVuY29kZURpY3QsXG4gIGVuY29kZVxufTtcbiIsIi8qKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGFsbCB0aGUgZnVuY3Rpb25zIG5lZWRlZCB0byBkZWNvZGUgYmVuY29kZWQgdmFsdWVzXG4gKiB0byB0aGVpciBqYXZhc2NyaXB0IGVxdWl2YWxlbnQuXG4gKi9cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGRlY29kaW5nIGVycm9yLlxuICogQGV4dGVuZHMgRXJyb3JcbiAqL1xuY2xhc3MgRGVjb2RlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gRGVjb2RlRXJyb3Igb2JqZWN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGVycm9yLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm4gYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbmV4dCBzdGFydGluZyBpbmRleCBhbmQgdGhlIGRlY29kZWQgaW50LlxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHN0YXJ0aW5nIGluZGV4LlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgZGF0YSB0byBkZWNvZGUuXG4gKiBAcmV0dXJuIHtbbnVtYmVyLCBiaWdpbnRdfSBUaGUgYXJyYXkgY29udGFpbmluZyB0aGUgbmV4dCBpbmRleCBhbmQgdGhlXG4gKiBkZWNvZGVkIGludC5cbiAqL1xuZnVuY3Rpb24gZGVjb2RlSW50KGluZGV4OiBudW1iZXIsIGRhdGE6IHN0cmluZyk6IFtudW1iZXIsIGJpZ2ludF0ge1xuICBpbmRleCsrO1xuXG4gIGNvbnN0IGVuZEluZGV4ID0gZGF0YS5pbmRleE9mKFwiZVwiLCBpbmRleCk7XG4gIGxldCBuYjogYmlnaW50O1xuXG4gIGlmIChkYXRhW2luZGV4XSA9PT0gXCIwXCIgJiYgZGF0YVtpbmRleCArIDFdICE9PSBcImVcIikge1xuICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZUludDogbGVhZGluZyB6ZXJvXCIpO1xuICB9IGVsc2UgaWYgKGRhdGFbaW5kZXhdID09PSBcIi1cIiAmJiAhXCIxMjM0NTY3ODlcIi5pbmNsdWRlcyhkYXRhW2luZGV4ICsgMV0pKSB7XG4gICAgdGhyb3cgbmV3IERlY29kZUVycm9yKFwiZGVjb2RlSW50OiBpbnZhbGlkIHZhbHVlXCIpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBuYiA9IEJpZ0ludChkYXRhLnNsaWNlKGluZGV4LCBlbmRJbmRleCkpO1xuICB9IGNhdGNoIHtcbiAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVJbnQ6IGludmFsaWQgdmFsdWVcIik7XG4gIH1cblxuICByZXR1cm4gW2VuZEluZGV4ICsgMSwgbmJdO1xufVxuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBjb250YWluaW5nIHRoZSBuZXh0IHN0YXJ0aW5nIGluZGV4IGFuZCB0aGUgZGVjb2RlZCBzdHJpbmcuXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgc3RhcnRpbmcgaW5kZXguXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIFRoZSBkYXRhIHRvIGRlY29kZS5cbiAqIEByZXR1cm4ge1tudW1iZXIsIHN0cmluZ119IFRoZSBhcnJheSBjb250YWluaW5nIHRoZSBuZXh0IHN0YXJ0aW5nIGluZGV4IGFuZFxuICogdGhlIGRlY29kZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBkZWNvZGVTdHJpbmcoaW5kZXg6IG51bWJlciwgZGF0YTogc3RyaW5nKTogW251bWJlciwgc3RyaW5nXSB7XG4gIGxldCBjb2xvbkluZGV4ID0gZGF0YS5pbmRleE9mKFwiOlwiLCBpbmRleCk7XG4gIGlmIChjb2xvbkluZGV4ID09PSAtMSkge1xuICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZVN0cmluZzogbm8gY29sb24gZm91bmRcIik7XG4gIH1cblxuICBjb25zdCBsZW4gPSBwYXJzZUludChkYXRhLnNsaWNlKGluZGV4LCBjb2xvbkluZGV4KSk7XG4gIGlmIChkYXRhLnNsaWNlKGNvbG9uSW5kZXggKyAxKS5sZW5ndGggPCBsZW4pIHtcbiAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVTdHJpbmc6IGRhdGEgdG9vIHNob3J0XCIpO1xuICB9XG5cbiAgY29sb25JbmRleCsrO1xuXG4gIHJldHVybiBbY29sb25JbmRleCArIGxlbiwgZGF0YS5zbGljZShjb2xvbkluZGV4LCBjb2xvbkluZGV4ICsgbGVuKV07XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG5leHQgc3RhcnRpbmcgaW5kZXggYW5kIHRoZSBkZWNvZGVkIGxpc3QuXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgc3RhcnRpbmcgaW5kZXguXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIFRoZSBkYXRhIHRvIGRlY29kZS5cbiAqIEByZXR1cm4ge1tudW1iZXIsICpbXV19IFRoZSBhcnJhYXkgY29udGFpbmluZyB0aGUgbmV4dCBzdGFydGluZyBpbmRleCBhbmRcbiAqIHRoZSBkZWNvZGVkIGxpc3QuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUxpc3QoaW5kZXg6IG51bWJlciwgZGF0YTogc3RyaW5nKTogYW55W10ge1xuICBpbmRleCsrO1xuXG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlIChpbmRleCA8IGRhdGEubGVuZ3RoICYmIGRhdGFbaW5kZXhdICE9PSBcImVcIikge1xuICAgIGxldCBuZXh0SW5kZXgsIHZhbHVlO1xuXG4gICAgaWYgKGRhdGFbaW5kZXhdID09PSBcImlcIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgW25leHRJbmRleCwgdmFsdWVdID0gZGVjb2RlSW50KGluZGV4LCBkYXRhKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVMaXN0OiBlcnJvciB3aGlsZSBpbnRcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcIjAxMjM0NTY3ODlcIi5pbmNsdWRlcyhkYXRhW2luZGV4XSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFtuZXh0SW5kZXgsIHZhbHVlXSA9IGRlY29kZVN0cmluZyhpbmRleCwgZGF0YSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhyb3cgbmV3IERlY29kZUVycm9yKFwiZGVjb2RlTGlzdDogZXJyb3Igd2hpbGUgZGVjb2Rpbmcgc3RyaW5nXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGF0YVtpbmRleF0gPT09IFwibFwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBbbmV4dEluZGV4LCB2YWx1ZV0gPSBkZWNvZGVMaXN0KGluZGV4LCBkYXRhKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVMaXN0OiBlcnJvciBkZWNvZGluZyBsaXN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGF0YVtpbmRleF0gPT09IFwiZFwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBbbmV4dEluZGV4LCB2YWx1ZV0gPSBkZWNvZGVEaWN0KGluZGV4LCBkYXRhKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVMaXN0OiBlcnJvciBkZWNvZGluZyBkaWN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVMaXN0OiBpbnZhbGlkIHZhbHVlXCIpO1xuICAgIH1cblxuICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICBpbmRleCA9IG5leHRJbmRleDtcbiAgfVxuXG4gIGlmIChkYXRhW2luZGV4XSAhPT0gXCJlXCIpIHtcbiAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVMaXN0OiB1bmV4cGVjdGVkIGVuZFwiKTtcbiAgfVxuXG4gIHJldHVybiBbaW5kZXggKyAxLCByZXN1bHRdO1xufVxuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBjb250YWluaW5nIHRoZSBuZXh0IHN0YXJ0aW5nIGluZGV4IGFuZCB0aGUgZGVjb2RlZCBkaWN0LlxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHN0YXJ0aW5nIGluZGV4LlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgZGF0YSB0byBkZWNvZGUuXG4gKiBAcmV0dXJuIHtbbnVtYmVyLCAqXX0gVGhlIGFycmF5IGNvbnRhaW5pbmcgdGhlIG5leHQgc3RhcnRpbmcgaW5kZXggYW5kIHRoZVxuICogZGVjb2RlZCBkaWN0LlxuICovXG5mdW5jdGlvbiBkZWNvZGVEaWN0KGluZGV4OiBudW1iZXIsIGRhdGE6IHN0cmluZyk6IFtudW1iZXIsIGFueV0ge1xuICBpbmRleCsrO1xuXG4gIGNvbnN0IHJlc3VsdDogYW55ID0ge307XG5cbiAgd2hpbGUgKGluZGV4IDwgZGF0YS5sZW5ndGggJiYgZGF0YVtpbmRleF0gIT09IFwiZVwiKSB7XG4gICAgbGV0IG5leHRJbmRleCwgdmFsdWUsIGtleTtcblxuICAgIHRyeSB7XG4gICAgICBbbmV4dEluZGV4LCBrZXldID0gZGVjb2RlU3RyaW5nKGluZGV4LCBkYXRhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZURpY3Q6IGVycm9yIGRlY29kaW5nIGtleVwiKTtcbiAgICB9XG4gICAgaW5kZXggPSBuZXh0SW5kZXg7XG5cbiAgICBpZiAoZGF0YVtpbmRleF0gPT09IFwiaVwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBbbmV4dEluZGV4LCB2YWx1ZV0gPSBkZWNvZGVJbnQoaW5kZXgsIGRhdGEpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZURpY3Q6IGVycm9yIGRlY29kaW5nIGludFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwiMDEyMzQ1Njc4OVwiLmluY2x1ZGVzKGRhdGFbaW5kZXhdKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgW25leHRJbmRleCwgdmFsdWVdID0gZGVjb2RlU3RyaW5nKGluZGV4LCBkYXRhKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVEaWN0OiBlcnJvciBkZWNvZGluZyBzdHJpbmdcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChkYXRhW2luZGV4XSA9PT0gXCJsXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFtuZXh0SW5kZXgsIHZhbHVlXSA9IGRlY29kZUxpc3QoaW5kZXgsIGRhdGEpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZURpY3Q6IGRlY29kaW5nIGxpc3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChkYXRhW2luZGV4XSA9PT0gXCJkXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFtuZXh0SW5kZXgsIHZhbHVlXSA9IGRlY29kZURpY3QoaW5kZXgsIGRhdGEpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZURpY3Q6IGVycm9yIGRlY29kaW5nIGRpY3RcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZURpY3Q6IGludmFsaWQgdmFsdWVcIik7XG4gICAgfVxuXG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICBpbmRleCA9IG5leHRJbmRleDtcbiAgfVxuXG4gIGlmIChkYXRhW2luZGV4XSAhPT0gXCJlXCIpIHtcbiAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGVEaWN0OiB1bmV4cGVjdGVkIGVuZFwiKTtcbiAgfVxuXG4gIHJldHVybiBbaW5kZXggKyAxLCByZXN1bHRdO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgZGVjb2RlZCBiZW5jb2RlZCBkYXRhIHN0cmluZyBjb252ZXJ0ZWQgaW50byBqYXZhc2NyaXB0IG9iamVjdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIC0gVGhlIGJlbmNvZGVkIGRhdGEuXG4gKiBAcmV0dXJuIHsqfSBUaGUgamF2YXNjcmlwdCBvYmplY3Qgb2J0YWluZWQgYnkgZGVjb2RpbmcgdGhlIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZShkYXRhOiBzdHJpbmcpOiBhbnkge1xuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG4gIGxldCBpbmRleCA9IDA7XG5cbiAgd2hpbGUgKGluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICBsZXQgbmV4dEluZGV4LCB2YWx1ZTtcblxuICAgIGlmIChkYXRhW2luZGV4XSA9PT0gXCJpXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFtuZXh0SW5kZXgsIHZhbHVlXSA9IGRlY29kZUludChpbmRleCwgZGF0YSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhyb3cgbmV3IERlY29kZUVycm9yKFwiZGVjb2RlOiBlcnJvciBkZWNvZGluZyBpbnRcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcIjAxMjM0NTY3ODlcIi5pbmNsdWRlcyhkYXRhW2luZGV4XSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFtuZXh0SW5kZXgsIHZhbHVlXSA9IGRlY29kZVN0cmluZyhpbmRleCwgZGF0YSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhyb3cgbmV3IERlY29kZUVycm9yKFwiZGVjb2RlOiBlcnJvciBkZWNvZGluZyBzdHJpbmdcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChkYXRhW2luZGV4XSA9PT0gXCJsXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIFtuZXh0SW5kZXgsIHZhbHVlXSA9IGRlY29kZUxpc3QoaW5kZXgsIGRhdGEpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHRocm93IG5ldyBEZWNvZGVFcnJvcihcImRlY29kZTogZXJyb3IgZGVjb2RpbmcgbGlzdFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRhdGFbaW5kZXhdID09PSBcImRcIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgW25leHRJbmRleCwgdmFsdWVdID0gZGVjb2RlRGljdChpbmRleCwgZGF0YSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhyb3cgbmV3IERlY29kZUVycm9yKFwiZGVjb2RlOiBlcnJvciBkZWNvZGluZyBkaWN0XCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRGVjb2RlRXJyb3IoXCJkZWNvZGU6IGludmFsaWQgdmFsdWVcIik7XG4gICAgfVxuXG4gICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIGluZGV4ID0gbmV4dEluZGV4O1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPiAxID8gcmVzdWx0IDogcmVzdWx0Lmxlbmd0aCA/IHJlc3VsdFswXSA6IG51bGw7XG59XG5cbmV4cG9ydCB7IERlY29kZUVycm9yLCBkZWNvZGVJbnQsIGRlY29kZVN0cmluZywgZGVjb2RlTGlzdCwgZGVjb2RlRGljdCwgZGVjb2RlIH07XG4iXSwic291cmNlUm9vdCI6IiJ9
