var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function r(e){return"function"==typeof e}function i(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function c(e,t){e.appendChild(t)}function a(e,t,n){e.insertBefore(t,n||null)}function l(e){e.parentNode.removeChild(e)}function s(e){return document.createElement(e)}function u(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function f(e){return document.createTextNode(e)}function d(){return f(" ")}function p(){return f("")}function m(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function h(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function g(e,t){(null!=t||e.value)&&(e.value=t)}function y(e,t,n,o){e.style.setProperty(t,n,o?"important":"")}let v;function $(e){v=e}function b(e){(function(){if(!v)throw new Error("Function called outside component initialization");return v})().$$.on_mount.push(e)}const w=[],x=[],k=[],S=[],_=Promise.resolve();let M=!1;function C(e){k.push(e)}const z=new Set;function q(){do{for(;w.length;){const e=w.shift();$(e),L(e.$$)}for(;x.length;)x.pop()();for(let e=0;e<k.length;e+=1){const t=k[e];z.has(t)||(z.add(t),t())}k.length=0}while(w.length);for(;S.length;)S.pop()();M=!1,z.clear()}function L(e){if(null!==e.fragment){e.update(),o(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(C)}}const E=new Set;let O;function N(){O={r:0,c:[],p:O}}function P(){O.r||o(O.c),O=O.p}function A(e,t){e&&e.i&&(E.delete(e),e.i(t))}function D(e,t,n,o){if(e&&e.o){if(E.has(e))return;E.add(e),O.c.push(()=>{E.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}}function I(e,t){D(e,1,1,()=>{t.delete(e.key)})}function H(e){e&&e.c()}function T(e,n,i){const{fragment:c,on_mount:a,on_destroy:l,after_update:s}=e.$$;c&&c.m(n,i),C(()=>{const n=a.map(t).filter(r);l?l.push(...n):o(n),e.$$.on_mount=[]}),s.forEach(C)}function U(e,t){const n=e.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function j(e,t){-1===e.$$.dirty[0]&&(w.push(e),M||(M=!0,_.then(q)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function V(t,r,i,c,a,l,s=[-1]){const u=v;$(t);const f=r.props||{},d=t.$$={fragment:null,ctx:null,props:l,update:e,not_equal:a,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:n(),dirty:s};let p=!1;d.ctx=i?i(t,f,(e,n,...o)=>{const r=o.length?o[0]:n;return d.ctx&&a(d.ctx[e],d.ctx[e]=r)&&(d.bound[e]&&d.bound[e](r),p&&j(t,e)),n}):[],d.update(),p=!0,o(d.before_update),d.fragment=!!c&&c(d.ctx),r.target&&(r.hydrate?d.fragment&&d.fragment.l(function(e){return Array.from(e.childNodes)}(r.target)):d.fragment&&d.fragment.c(),r.intro&&A(t.$$.fragment),T(t,r.target,r.anchor),q()),$(u)}class Y{$destroy(){U(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}function B(e){let t;return{c(){t=s("div"),t.textContent="✓",h(t,"class","save svelte-g7ewbd")},m(e,n){a(e,t,n)},d(e){e&&l(t)}}}function G(t){let n,o,r,i,u,p,g,v=t[0].title+"",$=t[1]&&B();return{c(){n=s("div"),$&&$.c(),o=d(),r=f(v),u=d(),p=s("hr"),h(n,"class","popup-collection-tile pointer svelte-g7ewbd"),h(n,"title",i=t[0].title),y(p,"border","1px solid rgb(240, 240, 240)"),y(p,"margin","0"),y(p,"margin-left","5px"),y(p,"margin-right","5px")},m(e,i){a(e,n,i),$&&$.m(n,null),c(n,o),c(n,r),a(e,u,i),a(e,p,i),g=m(n,"click",t[2])},p(e,[t]){e[1]?$||($=B(),$.c(),$.m(n,o)):$&&($.d(1),$=null),1&t&&v!==(v=e[0].title+"")&&function(e,t){t=""+t,e.data!==t&&(e.data=t)}(r,v),1&t&&i!==(i=e[0].title)&&h(n,"title",i)},i:e,o:e,d(e){e&&l(n),$&&$.d(),e&&l(u),e&&l(p),g()}}}function F(e,t,n){let o,{collection:r}=t,{tab:i}=t,{alreadySaved:c}=t,a=!1;c&&(a=c);return e.$set=e=>{"collection"in e&&n(0,r=e.collection),"tab"in e&&n(3,i=e.tab),"alreadySaved"in e&&n(4,c=e.alreadySaved)},[r,a,()=>{n(1,a=!a),a?function(e){chrome.bookmarks.create({parentId:r.id,url:e.url,title:e.title+":::::"+e.favIconUrl},(function(e){o=e}))}(i):o?chrome.bookmarks.remove(o.id):chrome.bookmarks.search({url:i.url},(function(e){e.forEach(e=>{chrome.bookmarks.remove(e.id)})}))},i,c]}class W extends Y{constructor(e){super(),V(this,e,F,G,i,{collection:0,tab:3,alreadySaved:4})}}function X(e){let t,n;return{c(){t=u("path"),h(t,"d",n=e[1].icon[4]),h(t,"fill",e[2])},m(e,n){a(e,t,n)},p(e,o){2&o&&n!==(n=e[1].icon[4])&&h(t,"d",n),4&o&&h(t,"fill",e[2])},d(e){e&&l(t)}}}function R(e){let t,n,o,r,i;return{c(){t=u("path"),r=u("path"),h(t,"d",n=e[1].icon[4][0]),h(t,"fill",e[2]),h(t,"style",o=`opacity: ${e[4]}`),h(r,"d",i=e[1].icon[4][1]),h(r,"fill",e[3])},m(e,n){a(e,t,n),a(e,r,n)},p(e,c){2&c&&n!==(n=e[1].icon[4][0])&&h(t,"d",n),4&c&&h(t,"fill",e[2]),16&c&&o!==(o=`opacity: ${e[4]}`)&&h(t,"style",o),2&c&&i!==(i=e[1].icon[4][1])&&h(r,"d",i),8&c&&h(r,"fill",e[3])},d(e){e&&l(t),e&&l(r)}}}function J(t){let n,o,r,i;function c(e,t){return(null==o||2&t)&&(o=!!Array.isArray(e[1].icon[4])),o?R:X}let s=c(t,-1),f=s(t);return{c(){n=u("svg"),f.c(),h(n,"xmlns","http://www.w3.org/2000/svg"),h(n,"viewBox",r=`0 0 ${t[1].icon[0]} ${t[1].icon[1]}`),h(n,"height",t[6]),h(n,"aria-hidden","true"),h(n,"role","img"),h(n,"style",i=`transform: rotate(${t[0]}turn) scaleX(${t[7]}) scaleY(${t[8]}); ${t[5]}`)},m(e,t){a(e,n,t),f.m(n,null)},p(e,[t]){s===(s=c(e,t))&&f?f.p(e,t):(f.d(1),f=s(e),f&&(f.c(),f.m(n,null))),2&t&&r!==(r=`0 0 ${e[1].icon[0]} ${e[1].icon[1]}`)&&h(n,"viewBox",r),64&t&&h(n,"height",e[6]),417&t&&i!==(i=`transform: rotate(${e[0]}turn) scaleX(${e[7]}) scaleY(${e[8]}); ${e[5]}`)&&h(n,"style",i)},i:e,o:e,d(e){e&&l(n),f.d()}}}function K(e,t,n){let{icon:o}=t,{color:r="#000000"}=t,{secondaryColor:i=r}=t,{secondaryOpacity:c="0.5"}=t,{size:a="xs"}=t,{flip:l="none"}=t,{rotate:s="0"}=t,{style:u=""}=t,f=a,d="1",p="1";return e.$set=e=>{"icon"in e&&n(1,o=e.icon),"color"in e&&n(2,r=e.color),"secondaryColor"in e&&n(3,i=e.secondaryColor),"secondaryOpacity"in e&&n(4,c=e.secondaryOpacity),"size"in e&&n(9,a=e.size),"flip"in e&&n(10,l=e.flip),"rotate"in e&&n(0,s=e.rotate),"style"in e&&n(5,u=e.style)},e.$$.update=()=>{if(1537&e.$$.dirty){switch(a){case"xs":n(6,f="0.75em");break;case"sm":n(6,f="0.875em");break;case"lg":n(6,f="1.33em");break;case"2x":n(6,f="2em");break;case"3x":n(6,f="3em");break;case"4x":n(6,f="4em");break;case"5x":n(6,f="5em");break;case"6x":n(6,f="6em");break;case"7x":n(6,f="7em");break;case"8x":n(6,f="8em");break;case"9x":n(6,f="9em");break;case"10x":n(6,f="10em")}switch(n(0,s/=360),l){case"h":n(7,d=-1);break;case"v":n(8,p=-1);break;case"hv":n(7,d=-1),n(8,p=-1);break;default:n(7,d=1),n(8,p=1)}}},[s,o,r,i,c,u,f,d,p,a,l]}class Q extends Y{constructor(e){super(),V(this,e,K,J,i,{icon:1,color:2,secondaryColor:3,secondaryOpacity:4,size:9,flip:10,rotate:0,style:5})}}function Z(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function ee(e,t){return e(t={exports:{}},t.exports),t.exports}var te=ee((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=[],o="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z";t.definition={prefix:"far",iconName:"save",icon:[448,512,n,"f0c7",o]},t.faSave=t.definition,t.prefix="far",t.iconName="save",t.width=448,t.height=512,t.ligatures=n,t.unicode="f0c7",t.svgPathData=o}));Z(te);te.definition;var ne=te.faSave,oe=(te.prefix,te.iconName,te.width,te.height,te.ligatures,te.unicode,te.svgPathData,ee((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=[],o="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z";t.definition={prefix:"fas",iconName:"search",icon:[512,512,n,"f002",o]},t.faSearch=t.definition,t.prefix="fas",t.iconName="search",t.width=512,t.height=512,t.ligatures=n,t.unicode="f002",t.svgPathData=o})));Z(oe);oe.definition;var re=oe.faSearch;oe.prefix,oe.iconName,oe.width,oe.height,oe.ligatures,oe.unicode,oe.svgPathData;function ie(e,t,n){const o=e.slice();return o[10]=t[n],o[12]=n,o}function ce(t){let n,o,r,i,u,f,p,g;return{c(){n=s("div"),o=s("img"),i=d(),u=s("div"),u.textContent="Open PutAway",f=d(),p=s("div"),p.innerHTML="\n        This is an Empty Tab.\n        <br>\n        You cannot add this to a collection.\n      ",h(o,"alt","logo"),o.src!==(r="images/logo128.png")&&h(o,"src","images/logo128.png"),h(u,"id","newtab-open-putaway"),h(u,"class","pointer svelte-yp1uqn"),h(n,"id","newtab-popup"),h(n,"class","svelte-yp1uqn")},m(e,r){a(e,n,r),c(n,o),c(n,i),c(n,u),c(n,f),c(n,p),g=m(u,"click",t[7])},p:e,i:e,o:e,d(e){e&&l(n),g()}}}function ae(e){let t,n,r,i,u,f,p,v,$,b,w,x,k,S,_,M,C,z=[],q=new Map;const L=new Q({props:{icon:re,size:"2x"}});let E=e[1];const O=e=>e[10].id;for(let t=0;t<E.length;t+=1){let n=ie(e,E,t),o=O(n);q.set(o,z[t]=se(o,n))}const j=[fe,ue],V=[];function Y(e,t){return e[5]?0:1}return S=Y(e),_=V[S]=j[S](e),{c(){t=s("div"),n=s("div"),r=s("input"),i=d(),u=s("div"),H(L.$$.fragment),f=d(),p=s("div"),p.innerHTML="\n          Open\n          <br>\n          PutAway\n        ",v=d(),$=s("div");for(let e=0;e<z.length;e+=1)z[e].c();b=d(),w=s("div"),x=d(),k=s("div"),_.c(),r.autofocus=!0,h(r,"type","text"),h(r,"placeholder","Search"),h(r,"class","svelte-yp1uqn"),h(u,"id","search-logo"),h(u,"class","svelte-yp1uqn"),h(p,"id","open-putaway"),h(p,"class","pointer svelte-yp1uqn"),h(n,"id","top"),h(n,"class","svelte-yp1uqn"),y(w,"height","60px"),h($,"id","list"),h($,"class","svelte-yp1uqn"),h(t,"id","main"),h(t,"class","svelte-yp1uqn"),h(k,"id","save-session"),h(k,"class","pointer svelte-yp1uqn")},m(o,l){a(o,t,l),c(t,n),c(n,r),g(r,e[0]),c(n,i),c(n,u),T(L,u,null),c(n,f),c(n,p),c(t,v),c(t,$);for(let e=0;e<z.length;e+=1)z[e].m($,null);c($,b),c($,w),a(o,x,l),a(o,k,l),V[S].m(k,null),M=!0,r.focus(),C=[m(r,"input",e[9]),m(p,"click",e[7]),m(k,"click",e[6])]},p(e,t){1&t&&r.value!==e[0]&&g(r,e[0]);const n=e[1];N(),z=function(e,t,n,o,r,i,c,a,l,s,u,f){let d=e.length,p=i.length,m=d;const h={};for(;m--;)h[e[m].key]=m;const g=[],y=new Map,v=new Map;for(m=p;m--;){const e=f(r,i,m),a=n(e);let l=c.get(a);l?o&&l.p(e,t):(l=s(a,e),l.c()),y.set(a,g[m]=l),a in h&&v.set(a,Math.abs(m-h[a]))}const $=new Set,b=new Set;function w(e){A(e,1),e.m(a,u),c.set(e.key,e),u=e.first,p--}for(;d&&p;){const t=g[p-1],n=e[d-1],o=t.key,r=n.key;t===n?(u=t.first,d--,p--):y.has(r)?!c.has(o)||$.has(o)?w(t):b.has(r)?d--:v.get(o)>v.get(r)?(b.add(o),w(t)):($.add(r),d--):(l(n,c),d--)}for(;d--;){const t=e[d];y.has(t.key)||l(t,c)}for(;p;)w(g[p-1]);return g}(z,t,O,1,e,n,q,$,I,se,b,ie),P();let o=S;S=Y(e),S===o?V[S].p(e,t):(N(),D(V[o],1,1,()=>{V[o]=null}),P(),_=V[S],_||(_=V[S]=j[S](e),_.c()),A(_,1),_.m(k,null))},i(e){if(!M){A(L.$$.fragment,e);for(let e=0;e<E.length;e+=1)A(z[e]);A(_),M=!0}},o(e){D(L.$$.fragment,e);for(let e=0;e<z.length;e+=1)D(z[e]);D(_),M=!1},d(e){e&&l(t),U(L);for(let e=0;e<z.length;e+=1)z[e].d();e&&l(x),e&&l(k),V[S].d(),o(C)}}}function le(e){let t;const n=new W({props:{collection:e[10],tab:e[3],alreadySaved:e[2][e[10].id]}});return{c(){H(n.$$.fragment)},m(e,o){T(n,e,o),t=!0},p(e,t){const o={};2&t&&(o.collection=e[10]),8&t&&(o.tab=e[3]),6&t&&(o.alreadySaved=e[2][e[10].id]),n.$set(o)},i(e){t||(A(n.$$.fragment,e),t=!0)},o(e){D(n.$$.fragment,e),t=!1},d(e){U(n,e)}}}function se(e,t){let n,o,r,i=t[10].title.toLowerCase().includes(t[0].toLowerCase()),c=i&&le(t);return{key:e,first:null,c(){n=p(),c&&c.c(),o=p(),this.first=n},m(e,t){a(e,n,t),c&&c.m(e,t),a(e,o,t),r=!0},p(e,t){3&t&&(i=e[10].title.toLowerCase().includes(e[0].toLowerCase())),i?c?(c.p(e,t),A(c,1)):(c=le(e),c.c(),A(c,1),c.m(o.parentNode,o)):c&&(N(),D(c,1,1,()=>{c=null}),P())},i(e){r||(A(c),r=!0)},o(e){D(c),r=!1},d(e){e&&l(n),c&&c.d(e),e&&l(o)}}}function ue(t){let n,o;const r=new Q({props:{icon:ne,size:"sm",style:"position:relative; top:3px; opacity: 0.7;"}});return{c(){H(r.$$.fragment),n=f("\n        Save Session")},m(e,t){T(r,e,t),a(e,n,t),o=!0},p:e,i(e){o||(A(r.$$.fragment,e),o=!0)},o(e){D(r.$$.fragment,e),o=!1},d(e){U(r,e),e&&l(n)}}}function fe(t){let n;return{c(){n=f("✓Saved (click to undo)")},m(e,t){a(e,n,t)},p:e,i:e,o:e,d(e){e&&l(n)}}}function de(e){let t,n,o,r;const i=[ae,ce],c=[];function u(e,t){return e[4]?1:0}return n=u(e),o=c[n]=i[n](e),{c(){t=s("div"),o.c(),h(t,"id","popup"),h(t,"class","svelte-yp1uqn")},m(e,o){a(e,t,o),c[n].m(t,null),r=!0},p(e,[r]){let a=n;n=u(e),n===a?c[n].p(e,r):(N(),D(c[a],1,1,()=>{c[a]=null}),P(),o=c[n],o||(o=c[n]=i[n](e),o.c()),A(o,1),o.m(t,null))},i(e){r||(A(o),r=!0)},o(e){D(o),r=!1},d(e){e&&l(t),c[n].d()}}}function pe(e,t,n){let o,r,i="",c=[],a={},l=!1,s=!1;b(()=>{chrome.tabs.query({active:!0,currentWindow:!0},(function(e){n(3,o=e[0]),"chrome://newtab/"!=o.url?(chrome.bookmarks.search({url:o.url},(function(e){e.forEach(e=>{n(2,a[e.parentId]=!0,a)})})),chrome.storage.local.get("pid",(function(e){chrome.bookmarks.getChildren(e.pid,(function(e){n(1,c=e.filter(e=>null==e.url))}))}))):n(4,l=!0)}))});return[i,c,a,o,l,s,()=>{if(s)chrome.bookmarks.removeTree(r),n(5,s=!1);else{var e=new Date;let t=`Session ${e.getDate()}-${(e.getMonth()+1).toLocaleString("en-US",{minimumIntegerDigits:2,useGrouping:!1})}-${e.getFullYear()}, ${e.getHours()}:${e.getMinutes().toLocaleString("en-US",{minimumIntegerDigits:2,useGrouping:!1})}:${e.getSeconds().toLocaleString("en-US",{minimumIntegerDigits:2,useGrouping:!1})}`;chrome.storage.local.get("pid",(function(e){chrome.bookmarks.create({parentId:e.pid,title:t,index:0},(function(e){chrome.tabs.query({currentWindow:!0},t=>{let o=t.filter((function(e){return"chrome://newtab/"!=e.url}));var i=o.length;o.forEach(t=>{chrome.bookmarks.create({parentId:e.id,url:t.url,title:t.title+":::::"+t.favIconUrl},(function(t){0==--i&&(r=e.id,n(5,s=!0))}))})})}))}))}},()=>{chrome.tabs.create({url:chrome.extension.getURL("newtab.html")})},r,function(){i=this.value,n(0,i)}]}return new class extends Y{constructor(e){super(),V(this,e,pe,de,i,{})}}({target:document.body})}();
//# sourceMappingURL=popup.bundle.js.map
