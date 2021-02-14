module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/index.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./components/nav.module.css":
/*!***********************************!*\
  !*** ./components/nav.module.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Exports\nmodule.exports = {\n\t\"loading\": \"nav_loading__1HVCg\",\n\t\"loaded\": \"nav_loaded__3hMZN\",\n\t\"signedIn\": \"nav_signedIn__3KKcN\",\n\t\"notSignedIn\": \"nav_notSignedIn__3l14p\",\n\t\"avatar\": \"nav_avatar__JhWsF\",\n\t\"signinButton\": \"nav_signinButton__3Vf9C\",\n\t\"signoutButton\": \"nav_signoutButton__2LsMu\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL25hdi5tb2R1bGUuY3NzPzIyNjAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiLi9jb21wb25lbnRzL25hdi5tb2R1bGUuY3NzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwibG9hZGluZ1wiOiBcIm5hdl9sb2FkaW5nX18xSFZDZ1wiLFxuXHRcImxvYWRlZFwiOiBcIm5hdl9sb2FkZWRfXzNoTVpOXCIsXG5cdFwic2lnbmVkSW5cIjogXCJuYXZfc2lnbmVkSW5fXzNLS2NOXCIsXG5cdFwibm90U2lnbmVkSW5cIjogXCJuYXZfbm90U2lnbmVkSW5fXzNsMTRwXCIsXG5cdFwiYXZhdGFyXCI6IFwibmF2X2F2YXRhcl9fSmhXc0ZcIixcblx0XCJzaWduaW5CdXR0b25cIjogXCJuYXZfc2lnbmluQnV0dG9uX18zVmY5Q1wiLFxuXHRcInNpZ25vdXRCdXR0b25cIjogXCJuYXZfc2lnbm91dEJ1dHRvbl9fMkxzTXVcIlxufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/nav.module.css\n");

/***/ }),

/***/ "./components/nav.tsx":
/*!****************************!*\
  !*** ./components/nav.tsx ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/client */ \"next-auth/client\");\n/* harmony import */ var next_auth_client__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_client__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _nav_module_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./nav.module.css */ \"./components/nav.module.css\");\n/* harmony import */ var _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_nav_module_css__WEBPACK_IMPORTED_MODULE_2__);\nvar _jsxFileName = \"/home/felipe/Projects/contatempo/components/nav.tsx\";\n\nvar __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;\n\n\n/**\n * The approach used in this component shows how to built a sign in and sign out\n * component that works on pages which support both client and server side\n * rendering, and avoids any flash incorrect content on initial page load.\n **/\n\nconst Nav = () => {\n  const [session, loading] = Object(next_auth_client__WEBPACK_IMPORTED_MODULE_1__[\"useSession\"])();\n  return __jsx(\"nav\", {\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 13,\n      columnNumber: 5\n    }\n  }, __jsx(\"noscript\", {\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 14,\n      columnNumber: 7\n    }\n  }, __jsx(\"style\", {\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 15,\n      columnNumber: 9\n    }\n  }, `.nojs-show { opacity: 1; top: 0; }`)), __jsx(\"p\", {\n    className: `nojs-show ${!session && loading ? _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.loading : _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.loaded}`,\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 17,\n      columnNumber: 7\n    }\n  }, !session && __jsx(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, __jsx(\"span\", {\n    className: _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.notSignedIn,\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 24,\n      columnNumber: 13\n    }\n  }, \"Not signed in\"), __jsx(\"a\", {\n    href: `/api/auth/signin`,\n    onClick: e => {\n      e.preventDefault();\n      Object(next_auth_client__WEBPACK_IMPORTED_MODULE_1__[\"signin\"])();\n    },\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 25,\n      columnNumber: 13\n    }\n  }, __jsx(\"button\", {\n    className: _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.signinButton,\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 32,\n      columnNumber: 15\n    }\n  }, \"Sign in\"))), session && __jsx(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, __jsx(\"span\", {\n    style: {\n      backgroundImage: `url(${session.user.image})`\n    },\n    className: _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.avatar,\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 38,\n      columnNumber: 13\n    }\n  }), __jsx(\"span\", {\n    className: _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.signedIn,\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 42,\n      columnNumber: 13\n    }\n  }, \"Signed in as \", __jsx(\"strong\", {\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 43,\n      columnNumber: 28\n    }\n  }, session.user.email)), __jsx(\"a\", {\n    href: `/api/auth/signout`,\n    onClick: e => {\n      e.preventDefault();\n      Object(next_auth_client__WEBPACK_IMPORTED_MODULE_1__[\"signout\"])();\n    },\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 45,\n      columnNumber: 13\n    }\n  }, __jsx(\"button\", {\n    className: _nav_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.signoutButton,\n    __self: undefined,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 52,\n      columnNumber: 15\n    }\n  }, \"Sign out\")))));\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Nav);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL25hdi50c3g/ODlmMyJdLCJuYW1lcyI6WyJOYXYiLCJzZXNzaW9uIiwibG9hZGluZyIsInVzZVNlc3Npb24iLCJzdHlsZXMiLCJsb2FkZWQiLCJub3RTaWduZWRJbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInNpZ25pbiIsInNpZ25pbkJ1dHRvbiIsImJhY2tncm91bmRJbWFnZSIsInVzZXIiLCJpbWFnZSIsImF2YXRhciIsInNpZ25lZEluIiwiZW1haWwiLCJzaWdub3V0Iiwic2lnbm91dEJ1dHRvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFFQTs7Ozs7O0FBS0EsTUFBTUEsR0FBRyxHQUFHLE1BQU07QUFDaEIsUUFBTSxDQUFDQyxPQUFELEVBQVVDLE9BQVYsSUFBcUJDLG1FQUFVLEVBQXJDO0FBRUEsU0FDRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQ0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUNFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBUyxvQ0FBVCxDQURGLENBREYsRUFJRTtBQUNFLGFBQVMsRUFBRyxhQUNWLENBQUNGLE9BQUQsSUFBWUMsT0FBWixHQUFzQkUsc0RBQU0sQ0FBQ0YsT0FBN0IsR0FBdUNFLHNEQUFNLENBQUNDLE1BQy9DLEVBSEg7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUtHLENBQUNKLE9BQUQsSUFDQyxtRUFDRTtBQUFNLGFBQVMsRUFBRUcsc0RBQU0sQ0FBQ0UsV0FBeEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFERixFQUVFO0FBQ0UsUUFBSSxFQUFHLGtCQURUO0FBRUUsV0FBTyxFQUFHQyxDQUFELElBQU87QUFDZEEsT0FBQyxDQUFDQyxjQUFGO0FBQ0FDLHFFQUFNO0FBQ1AsS0FMSDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBT0U7QUFBUSxhQUFTLEVBQUVMLHNEQUFNLENBQUNNLFlBQTFCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFQRixDQUZGLENBTkosRUFtQkdULE9BQU8sSUFDTixtRUFDRTtBQUNFLFNBQUssRUFBRTtBQUFFVSxxQkFBZSxFQUFHLE9BQU1WLE9BQU8sQ0FBQ1csSUFBUixDQUFhQyxLQUFNO0FBQTdDLEtBRFQ7QUFFRSxhQUFTLEVBQUVULHNEQUFNLENBQUNVLE1BRnBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFERixFQUtFO0FBQU0sYUFBUyxFQUFFVixzREFBTSxDQUFDVyxRQUF4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUNlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBU2QsT0FBTyxDQUFDVyxJQUFSLENBQWFJLEtBQXRCLENBRGYsQ0FMRixFQVFFO0FBQ0UsUUFBSSxFQUFHLG1CQURUO0FBRUUsV0FBTyxFQUFHVCxDQUFELElBQU87QUFDZEEsT0FBQyxDQUFDQyxjQUFGO0FBQ0FTLHNFQUFPO0FBQ1IsS0FMSDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBT0U7QUFBUSxhQUFTLEVBQUViLHNEQUFNLENBQUNjLGFBQTFCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZ0JBUEYsQ0FSRixDQXBCSixDQUpGLENBREY7QUErQ0QsQ0FsREQ7O0FBb0RlbEIsa0VBQWYiLCJmaWxlIjoiLi9jb21wb25lbnRzL25hdi50c3guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaWduaW4sIHNpZ25vdXQsIHVzZVNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgvY2xpZW50J1xuaW1wb3J0IHN0eWxlcyBmcm9tICcuL25hdi5tb2R1bGUuY3NzJ1xuXG4vKipcbiAqIFRoZSBhcHByb2FjaCB1c2VkIGluIHRoaXMgY29tcG9uZW50IHNob3dzIGhvdyB0byBidWlsdCBhIHNpZ24gaW4gYW5kIHNpZ24gb3V0XG4gKiBjb21wb25lbnQgdGhhdCB3b3JrcyBvbiBwYWdlcyB3aGljaCBzdXBwb3J0IGJvdGggY2xpZW50IGFuZCBzZXJ2ZXIgc2lkZVxuICogcmVuZGVyaW5nLCBhbmQgYXZvaWRzIGFueSBmbGFzaCBpbmNvcnJlY3QgY29udGVudCBvbiBpbml0aWFsIHBhZ2UgbG9hZC5cbiAqKi9cbmNvbnN0IE5hdiA9ICgpID0+IHtcbiAgY29uc3QgW3Nlc3Npb24sIGxvYWRpbmddID0gdXNlU2Vzc2lvbigpXG5cbiAgcmV0dXJuIChcbiAgICA8bmF2PlxuICAgICAgPG5vc2NyaXB0PlxuICAgICAgICA8c3R5bGU+e2Aubm9qcy1zaG93IHsgb3BhY2l0eTogMTsgdG9wOiAwOyB9YH08L3N0eWxlPlxuICAgICAgPC9ub3NjcmlwdD5cbiAgICAgIDxwXG4gICAgICAgIGNsYXNzTmFtZT17YG5vanMtc2hvdyAke1xuICAgICAgICAgICFzZXNzaW9uICYmIGxvYWRpbmcgPyBzdHlsZXMubG9hZGluZyA6IHN0eWxlcy5sb2FkZWRcbiAgICAgICAgfWB9XG4gICAgICA+XG4gICAgICAgIHshc2Vzc2lvbiAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c3R5bGVzLm5vdFNpZ25lZElufT5Ob3Qgc2lnbmVkIGluPC9zcGFuPlxuICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgaHJlZj17YC9hcGkvYXV0aC9zaWduaW5gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgIHNpZ25pbigpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPXtzdHlsZXMuc2lnbmluQnV0dG9ufT5TaWduIGluPC9idXR0b24+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC8+XG4gICAgICAgICl9XG4gICAgICAgIHtzZXNzaW9uICYmIChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZEltYWdlOiBgdXJsKCR7c2Vzc2lvbi51c2VyLmltYWdlfSlgIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17c3R5bGVzLmF2YXRhcn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3N0eWxlcy5zaWduZWRJbn0+XG4gICAgICAgICAgICAgIFNpZ25lZCBpbiBhcyA8c3Ryb25nPntzZXNzaW9uLnVzZXIuZW1haWx9PC9zdHJvbmc+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8YVxuICAgICAgICAgICAgICBocmVmPXtgL2FwaS9hdXRoL3NpZ25vdXRgfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgIHNpZ25vdXQoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17c3R5bGVzLnNpZ25vdXRCdXR0b259PlNpZ24gb3V0PC9idXR0b24+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC8+XG4gICAgICAgICl9XG4gICAgICA8L3A+XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTmF2XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/nav.tsx\n");

/***/ }),

/***/ "./pages/index.tsx":
/*!*************************!*\
  !*** ./pages/index.tsx ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Home; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_nav__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/nav */ \"./components/nav.tsx\");\nvar _jsxFileName = \"/home/felipe/Projects/contatempo/pages/index.tsx\";\n\nvar __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;\n\n\nfunction Home() {\n  Object(react__WEBPACK_IMPORTED_MODULE_0__[\"useEffect\"])(() => {\n    const fetchData = async () => {\n      const r = await fetch('/api/record');\n      const t = await r.text();\n      console.log(t);\n    };\n\n    fetchData();\n  });\n  return __jsx(\"div\", {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 14,\n      columnNumber: 5\n    }\n  }, __jsx(_components_nav__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 15,\n      columnNumber: 7\n    }\n  }), __jsx(\"main\", {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 16,\n      columnNumber: 7\n    }\n  }, __jsx(\"h1\", {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 17,\n      columnNumber: 9\n    }\n  }, \"Welcome to Contatempo\")));\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9pbmRleC50c3g/ZGI3NiJdLCJuYW1lcyI6WyJIb21lIiwidXNlRWZmZWN0IiwiZmV0Y2hEYXRhIiwiciIsImZldGNoIiwidCIsInRleHQiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFFZSxTQUFTQSxJQUFULEdBQWdCO0FBQzdCQyx5REFBUyxDQUFDLE1BQU07QUFDZCxVQUFNQyxTQUFTLEdBQUcsWUFBWTtBQUM1QixZQUFNQyxDQUFDLEdBQUcsTUFBTUMsS0FBSyxDQUFDLGFBQUQsQ0FBckI7QUFDQSxZQUFNQyxDQUFDLEdBQUcsTUFBTUYsQ0FBQyxDQUFDRyxJQUFGLEVBQWhCO0FBQ0FDLGFBQU8sQ0FBQ0MsR0FBUixDQUFZSCxDQUFaO0FBQ0QsS0FKRDs7QUFLQUgsYUFBUztBQUNWLEdBUFEsQ0FBVDtBQVFBLFNBQ0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUNFLE1BQUMsdURBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQURGLEVBRUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUNFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNkJBREYsQ0FGRixDQURGO0FBUUQiLCJmaWxlIjoiLi9wYWdlcy9pbmRleC50c3guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3VzZUVmZmVjdH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IE5hdiBmcm9tICcuLi9jb21wb25lbnRzL25hdidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSG9tZSgpIHtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmZXRjaERhdGEgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCByID0gYXdhaXQgZmV0Y2goJy9hcGkvcmVjb3JkJylcbiAgICAgIGNvbnN0IHQgPSBhd2FpdCByLnRleHQoKVxuICAgICAgY29uc29sZS5sb2codClcbiAgICB9XG4gICAgZmV0Y2hEYXRhKClcbiAgfSlcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPE5hdiAvPlxuICAgICAgPG1haW4+XG4gICAgICAgIDxoMT5XZWxjb21lIHRvIENvbnRhdGVtcG88L2gxPlxuICAgICAgPC9tYWluPlxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/index.tsx\n");

/***/ }),

/***/ "next-auth/client":
/*!***********************************!*\
  !*** external "next-auth/client" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"next-auth/client\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJuZXh0LWF1dGgvY2xpZW50XCI/ZDNiMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJuZXh0LWF1dGgvY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmV4dC1hdXRoL2NsaWVudFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///next-auth/client\n");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdFwiPzU4OGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWFjdFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react\n");

/***/ })

/******/ });