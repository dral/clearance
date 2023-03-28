"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[384],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=p(n),m=o,f=u["".concat(c,".").concat(m)]||u[m]||d[m]||a;return n?r.createElement(f,i(i({ref:t},s),{},{components:n})):r.createElement(f,i({ref:t},s))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[u]="string"==typeof e?e:o,i[1]=l;for(var p=2;p<a;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},143:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(7462),o=(n(7294),n(3905));const a={sidebar_position:0},i="5 min to get up and running",l={unversionedId:"contribute/getting-started",id:"contribute/getting-started",title:"5 min to get up and running",description:"Clone sources and install dependencies",source:"@site/docs/contribute/getting-started.md",sourceDirName:"contribute",slug:"/contribute/getting-started",permalink:"/clearance/docs/contribute/getting-started",draft:!1,editUrl:"https://github.com/dral/clearance/edit/main/website/docs/contribute/getting-started.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{sidebar_position:0},sidebar:"tutorialSidebar",previous:{title:"Contribute",permalink:"/clearance/docs/category/contribute"},next:{title:"npm scripts",permalink:"/clearance/docs/contribute/npm-scripts"}},c={},p=[{value:"Clone sources and install dependencies",id:"clone-sources-and-install-dependencies",level:2},{value:"Start a development server",id:"start-a-development-server",level:2},{value:"Configure the app for your local environment",id:"configure-the-app-for-your-local-environment",level:2}],s={toc:p},u="wrapper";function d(e){let{components:t,...n}=e;return(0,o.kt)(u,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"5-min-to-get-up-and-running"},"5 min to get up and running"),(0,o.kt)("h2",{id:"clone-sources-and-install-dependencies"},"Clone sources and install dependencies"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"git clone git@github.com:dral/clearance.git\ncd clearance\nnpm run i\n")),(0,o.kt)("h2",{id:"start-a-development-server"},"Start a development server"),(0,o.kt)("admonition",{type:"note"},(0,o.kt)("p",{parentName:"admonition"},"This assumes you have a running mongodb instance and the connection string defined in ",(0,o.kt)("inlineCode",{parentName:"p"},"config/development.yaml")," (",(0,o.kt)("inlineCode",{parentName:"p"},"mongodb://localhost:27017/dev"),") is correct."),(0,o.kt)("p",{parentName:"admonition"},"If you don't yet have ",(0,o.kt)("strong",{parentName:"p"},"a running mongodb instance")," see ",(0,o.kt)("a",{parentName:"p",href:"./deployment#mongodb"},"how to quickly launch a mongodb instance")),(0,o.kt)("p",{parentName:"admonition"},"If you need to use a ",(0,o.kt)("strong",{parentName:"p"},"different mongodb connection string")," you can use the ",(0,o.kt)("inlineCode",{parentName:"p"},"config/local-development.yaml")," file or the corresponding ",(0,o.kt)("inlineCode",{parentName:"p"},"mongoDbHost")," environment varialbe (see ",(0,o.kt)("a",{parentName:"p",href:"./configuration#configuration-files"},"how to configure the app"),".)")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm start\n")),(0,o.kt)("p",null,"Your local server should be available at ",(0,o.kt)("a",{parentName:"p",href:"http://localhost:3000/"},"http://localhost:3000/"),"."),(0,o.kt)("p",null,"For more development scripts see ",(0,o.kt)("a",{parentName:"p",href:"./npm-scripts#local-development"},"npm-scripts"),"."),(0,o.kt)("h2",{id:"configure-the-app-for-your-local-environment"},"Configure the app for your local environment"),(0,o.kt)("p",null,"You can cusomize configuration settings for your personal machine by creating a file ",(0,o.kt)("inlineCode",{parentName:"p"},"config/local-development.yaml")," that will override default and development settings. This file should not be commited. For more information see ",(0,o.kt)("a",{parentName:"p",href:"./configuration#configuration-files"},"Runtime settings"),"."))}d.isMDXComponent=!0}}]);