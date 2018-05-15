!function(e){var t=!1;if("function"==typeof define&&define.amd&&(define(e),t=!0),"object"==typeof exports&&(module.exports=e(),t=!0),!t){var r=window.Storages,o=window.Storages=e();o.noConflict=function(){return window.Storages=r,o}}}(function(){var e={},t=e.toString,r=e.hasOwnProperty,o=r.toString,n=o.call(Object),i=Object.getPrototypeOf,s={};function a(){var e,t,r,o,n,i=this._type,s=arguments.length,a=window[i],l=arguments,f=l[0];if(s<1)throw new Error("Minimum 1 argument must be given");if(Array.isArray(f)){for(o in t={},f)if(f.hasOwnProperty(o)){e=f[o];try{t[e]=JSON.parse(a.getItem(e))}catch(r){t[e]=a.getItem(e)}}return t}if(1!=s){try{t=JSON.parse(a.getItem(f))}catch(e){throw new ReferenceError(f+" is not defined in this storage")}for(o=1;o<s-1;o++)if(void 0===(t=t[l[o]]))throw new ReferenceError([].slice.call(l,1,o+1).join(".")+" is not defined in this storage");if(Array.isArray(l[o])){for(n in r=t,t={},l[o])l[o].hasOwnProperty(n)&&(t[l[o][n]]=r[l[o][n]]);return t}return t[l[o]]}try{return JSON.parse(a.getItem(f))}catch(e){return a.getItem(f)}}function l(){var e,t,r,o,n=this._type,i=arguments.length,s=window[n],a=arguments,l=a[0],f=a[1],u=isNaN(f)?{}:[];if(i<1||!p(l)&&i<2)throw new Error("Minimum 2 arguments must be given or first parameter must be an object");if(p(l)){for(o in l)l.hasOwnProperty(o)&&(p(e=l[o])||this.alwaysUseJson?s.setItem(o,JSON.stringify(e)):s.setItem(o,e));return l}if(2==i)return"object"==typeof f||this.alwaysUseJson?s.setItem(l,JSON.stringify(f)):s.setItem(l,f),f;try{null!=(r=s.getItem(l))&&(u=JSON.parse(r))}catch(e){}for(r=u,o=1;o<i-2;o++)e=a[o],t=isNaN(a[o+1])?"object":"array",(!r[e]||"object"==t&&!p(r[e])||"array"==t&&!Array.isArray(r[e]))&&(r[e]="array"==t?[]:{}),r=r[e];return r[a[o]]=a[o+1],s.setItem(l,JSON.stringify(u)),u}function f(){var e,t,r,o,n=this._type,i=arguments.length,s=window[n],a=arguments,l=a[0];if(i<1)throw new Error("Minimum 1 argument must be given");if(Array.isArray(l)){for(r in l)l.hasOwnProperty(r)&&s.removeItem(l[r]);return!0}if(1==i)return s.removeItem(l),!0;try{e=t=JSON.parse(s.getItem(l))}catch(e){throw new ReferenceError(l+" is not defined in this storage")}for(r=1;r<i-1;r++)if(void 0===(t=t[a[r]]))throw new ReferenceError([].slice.call(a,1,r).join(".")+" is not defined in this storage");if(Array.isArray(a[r]))for(o in a[r])a[r].hasOwnProperty(o)&&delete t[a[r][o]];else delete t[a[r]];return s.setItem(l,JSON.stringify(e)),!0}function u(e){var t,r=g.call(this);for(t in r)r.hasOwnProperty(t)&&f.call(this,r[t]);if(e)for(t in s.namespaceStorages)s.namespaceStorages.hasOwnProperty(t)&&w(t)}function c(){var e,t=arguments.length,r=arguments,o=r[0];if(0==t)return 0==g.call(this).length;if(Array.isArray(o)){for(e=0;e<o.length;e++)if(!c.call(this,o[e]))return!1;return!0}try{var n=a.apply(this,arguments);for(e in Array.isArray(r[t-1])||(n={totest:n}),n)if(n.hasOwnProperty(e)&&!(p(n[e])&&m(n[e])||Array.isArray(n[e])&&!n[e].length||"boolean"!=typeof n[e]&&!n[e]))return!1;return!0}catch(e){return!0}}function h(){var e,t=arguments.length,r=arguments,o=r[0];if(t<1)throw new Error("Minimum 1 argument must be given");if(Array.isArray(o)){for(e=0;e<o.length;e++)if(!h.call(this,o[e]))return!1;return!0}try{var n=a.apply(this,arguments);for(e in Array.isArray(r[t-1])||(n={totest:n}),n)if(n.hasOwnProperty(e)&&(void 0===n[e]||null===n[e]))return!1;return!0}catch(e){return!1}}function g(){var e=this._type,t=arguments.length,r=window[e],o=[],n={};if((n=t>0?a.apply(this,arguments):r)&&n._cookie){var i=Cookies.get();for(var s in i)i.hasOwnProperty(s)&&""!=s&&o.push(s.replace(n._prefix,""))}else for(var l in n)n.hasOwnProperty(l)&&o.push(l);return o}function w(e){if(!e||"string"!=typeof e)throw new Error("First parameter must be a string");d?(window.localStorage.getItem(e)||window.localStorage.setItem(e,"{}"),window.sessionStorage.getItem(e)||window.sessionStorage.setItem(e,"{}")):(window.localCookieStorage.getItem(e)||window.localCookieStorage.setItem(e,"{}"),window.sessionCookieStorage.getItem(e)||window.sessionCookieStorage.setItem(e,"{}"));var t={localStorage:y({},s.localStorage,{_ns:e}),sessionStorage:y({},s.sessionStorage,{_ns:e})};return S&&(window.cookieStorage.getItem(e)||window.cookieStorage.setItem(e,"{}"),t.cookieStorage=y({},s.cookieStorage,{_ns:e})),s.namespaceStorages[e]=t,t}function p(e){var s,a;return!(!e||"[object Object]"!==t.call(e))&&(!(s=i(e))||"function"==typeof(a=r.call(s,"constructor")&&s.constructor)&&o.call(a)===n)}function m(e){var t;for(t in e)return!1;return!0}function y(){for(var e=1,t=arguments[0];e<arguments.length;e++){var r=arguments[e];for(var o in r)r.hasOwnProperty(o)&&(t[o]=r[o])}return t}var d=function(e){var t="jsapi";try{return!!window[e]&&(window[e].setItem(t,t),window[e].removeItem(t),!0)}catch(e){return!1}}("localStorage"),S="undefined"!=typeof Cookies,_={_type:"",_ns:"",_callMethod:function(e,t){var r=[],o=(t=Array.prototype.slice.call(t))[0];return this._ns&&r.push(this._ns),"string"==typeof o&&-1!==o.indexOf(".")&&(t.shift(),[].unshift.apply(t,o.split("."))),[].push.apply(r,t),e.apply(this,r)},alwaysUseJson:!1,get:function(){return d||S?this._callMethod(a,arguments):null},set:function(){var e=arguments.length,t=arguments,r=t[0];if(e<1||!p(r)&&e<2)throw new Error("Minimum 2 arguments must be given or first parameter must be an object");if(!d&&!S)return null;if(p(r)&&this._ns){for(var o in r)r.hasOwnProperty(o)&&this._callMethod(l,[o,r[o]]);return r}var n=this._callMethod(l,t);return this._ns?n[r.split(".")[0]]:n},remove:function(){if(arguments.length<1)throw new Error("Minimum 1 argument must be given");return d||S?this._callMethod(f,arguments):null},removeAll:function(e){return d||S?this._ns?(this._callMethod(l,[{}]),!0):this._callMethod(u,[e]):null},isEmpty:function(){return d||S?this._callMethod(c,arguments):null},isSet:function(){if(arguments.length<1)throw new Error("Minimum 1 argument must be given");return d||S?this._callMethod(h,arguments):null},keys:function(){return d||S?this._callMethod(g,arguments):null}};if(S){window.name||(window.name=Math.floor(1e8*Math.random()));var v={_cookie:!0,_prefix:"",_expires:null,_path:null,_domain:null,setItem:function(e,t){Cookies.set(this._prefix+e,t,{expires:this._expires,path:this._path,domain:this._domain})},getItem:function(e){return Cookies.get(this._prefix+e)},removeItem:function(e){return Cookies.remove(this._prefix+e,{path:this._path})},clear:function(){var e=Cookies.get();for(var t in e)e.hasOwnProperty(t)&&""!=t&&(!this._prefix&&-1===t.indexOf("ls_")&&-1===t.indexOf("ss_")||this._prefix&&0===t.indexOf(this._prefix))&&Cookies.remove(t)},setExpires:function(e){return this._expires=e,this},setPath:function(e){return this._path=e,this},setDomain:function(e){return this._domain=e,this},setConf:function(e){return e.path&&(this._path=e.path),e.domain&&(this._domain=e.domain),e.expires&&(this._expires=e.expires),this},setDefaultConf:function(){this._path=this._domain=this._expires=null}};d||(window.localCookieStorage=y({},v,{_prefix:"ls_",_expires:3650}),window.sessionCookieStorage=y({},v,{_prefix:"ss_"+window.name+"_"})),window.cookieStorage=y({},v),s.cookieStorage=y({},_,{_type:"cookieStorage",setExpires:function(e){return window.cookieStorage.setExpires(e),this},setPath:function(e){return window.cookieStorage.setPath(e),this},setDomain:function(e){return window.cookieStorage.setDomain(e),this},setConf:function(e){return window.cookieStorage.setConf(e),this},setDefaultConf:function(){return window.cookieStorage.setDefaultConf(),this}})}return s.initNamespaceStorage=function(e){return w(e)},d?(s.localStorage=y({},_,{_type:"localStorage"}),s.sessionStorage=y({},_,{_type:"sessionStorage"})):(s.localStorage=y({},_,{_type:"localCookieStorage"}),s.sessionStorage=y({},_,{_type:"sessionCookieStorage"})),s.namespaceStorages={},s.removeAllStorages=function(e){s.localStorage.removeAll(e),s.sessionStorage.removeAll(e),s.cookieStorage&&s.cookieStorage.removeAll(e),e||(s.namespaceStorages={})},s.alwaysUseJsonInStorage=function(e){_.alwaysUseJson=e,s.localStorage.alwaysUseJson=e,s.sessionStorage.alwaysUseJson=e,s.cookieStorage&&(s.cookieStorage.alwaysUseJson=e)},s});