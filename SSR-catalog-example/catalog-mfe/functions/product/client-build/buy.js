(()=>{var e={228:(e,t,r)=>{"use strict";r.r(t),r.d(t,{Component:()=>o.Component,h:()=>o.h,html:()=>i,render:()=>o.render});var o=r(328);const n=htm;var i=r.n(n)().bind(o.h)},649:(e,t,r)=>{function o(e){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o(e)}var n;function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function a(e,t){return a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},a(e,t)}function u(e,t){if(t&&("object"===o(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return f(e)}function f(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function l(e){return l=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},l(e)}function p(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var s=r(228),y=s.html,b=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&a(e,t)}(d,e);var t,r,o,s,b=(o=d,s=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=l(o);if(s){var r=l(this).constructor;e=Reflect.construct(t,arguments,r)}else e=t.apply(this,arguments);return u(this,e)});function d(){var e;i(this,d);for(var t=arguments.length,r=new Array(t),o=0;o<t;o++)r[o]=arguments[o];return p(f(e=b.call.apply(b,[this].concat(r))),"state",{}),p(f(e),"componentDidMount",(function(){e.setState({book:e.props.data})})),p(f(e),"addToCart",(function(t){t.preventDefault(),window.emitter.emit("AddToCartEvent",{id:e.state.book.id,title:e.state.book.title,qty:e.state.book.qty,price:e.state.book.price})})),e}return t=d,(r=[{key:"render",value:function(e){return y(n||(t=['<a href="#" onclick=','>\n                    <h3><i class="fa-solid fa-cart-plus"></i> BUY NOW</h3>\n                  </a>'],r||(r=t.slice(0)),n=Object.freeze(Object.defineProperties(t,{raw:{value:Object.freeze(r)}}))),this.addToCart);var t,r}}])&&c(t.prototype,r),Object.defineProperty(t,"prototype",{writable:!1}),d}(s.Component);e.exports=b},328:e=>{"use strict";e.exports=preact}},t={};function r(o){var n=t[o];if(void 0!==n)return n.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,r),i.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{"use strict";var e=r(328),t=r(649),o=r.n(t),n=JSON.parse(window.__BOOK__);(0,e.hydrate)((0,e.h)(o(),{data:n}),document.getElementById("buycontainer"))})()})();