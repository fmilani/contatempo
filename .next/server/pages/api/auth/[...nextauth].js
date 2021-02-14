module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/auth/[...nextauth].js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./pages/api/auth/[...nextauth].js":
/*!*****************************************!*\
  !*** ./pages/api/auth/[...nextauth].js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"next-auth\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers */ \"next-auth/providers\");\n/* harmony import */ var next_auth_providers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_providers__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst options = {\n  site: process.env.VERCEL_URL,\n  providers: [// When configuring oAuth providers make sure you enabling requesting\n  // permission to get the users email address (required to sign in)\n  next_auth_providers__WEBPACK_IMPORTED_MODULE_1___default.a.Google({\n    clientId: process.env.GOOGLE_ID,\n    clientSecret: process.env.GOOGLE_SECRET\n  })],\n  // The 'database' option should be a connection string or TypeORM\n  // configuration object https://typeorm.io/#/connection-options\n  //\n  // Notes:\n  // * You need to install an appropriate node_module for your database!\n  // * The email sign in provider requires a database but OAuth providers do not\n  database: process.env.DATABASE_URL,\n  session: {// Use JSON Web Tokens for session instead of database sessions.\n    // This option can be used with or without a database for users/accounts.\n    // Note: `jwt` is automatically set to `true` if no database is specified.\n    // jwt: true,\n    // Seconds - How long until an idle session expires and is no longer valid.\n    // maxAge: 30 * 24 * 60 * 60, // 30 days\n    // Seconds - Throttle how frequently to write to database to extend a session.\n    // Use it to limit write operations. Set to 0 to always update the database.\n    // Note: This option is ignored if using JSON Web Tokens\n    // updateAge: 24 * 60 * 60, // 24 hours\n    // Easily add custom properties to response from `/api/auth/session`.\n    // Note: This should not return any sensitive information.\n\n    /*\n    get: async (session) => {\n      session.customSessionProperty = \"ABC123\"\n      return session\n    }\n    */\n  },\n  // JSON Web Token options\n  jwt: {// secret: 'my-secret-123', // Recommended (but auto-generated if not specified)\n    // Custom encode/decode functions for signing + encryption can be specified.\n    // if you want to override what is in the JWT or how it is signed.\n    // encode: async ({ secret, key, token, maxAge }) => {},\n    // decode: async ({ secret, key, token, maxAge }) => {},\n    // Easily add custom to the JWT. It is updated every time it is accessed.\n    // This is encrypted and signed by default and may contain sensitive information\n    // as long as a reasonable secret is defined.\n\n    /*\n    set: async (token) => {\n      token.customJwtProperty = \"ABC123\"\n      return token\n    }\n    */\n  },\n  // Control which users / accounts can sign in\n  // You can use this option in conjunction with OAuth and JWT to control which\n  // accounts can sign in without having to use a database.\n  allowSignin: async (user, account) => {\n    // Return true if user / account is allowed to sign in.\n    // Return false to display an access denied message.\n    return true;\n  },\n  // You can define custom pages to override the built-in pages\n  // The routes shown here are the default URLs that will be used.\n  pages: {// signin: '/api/auth/signin',  // Displays signin buttons\n    // signout: '/api/auth/signout', // Displays form with sign out button\n    // error: '/api/auth/error', // Error code passed in query string as ?error=\n    // verifyRequest: '/api/auth/verify-request', // Used for check email page\n    // newUser: null // If set, new users will be directed here on first sign in\n  },\n  // Additional options\n  // secret: 'abcdef123456789' // Recommended (but auto-generated if not specified)\n  // debug: true, // Use this option to enable debug messages in the console\n  callbacks: {\n    async signIn(user, account, profile) {\n      // user.accessToken = 'abacateiro123'\n      return true;\n    },\n\n    async session(session, token) {\n      // session.accessToken = token.accessToken\n      console.log(' SESSA', session);\n      return session;\n    },\n\n    async jwt(token, user, account, profile, isNewUser) {\n      // if (user) {\n      //   token = { accessToken: user.accessToken }\n      // }\n      console.log('TOK=', token);\n      return token;\n    }\n\n  }\n};\n\nconst Auth = (req, res) => next_auth__WEBPACK_IMPORTED_MODULE_0___default()(req, res, options);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Auth);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdLmpzPzk5MDkiXSwibmFtZXMiOlsib3B0aW9ucyIsInNpdGUiLCJwcm9jZXNzIiwiZW52IiwiVkVSQ0VMX1VSTCIsInByb3ZpZGVycyIsIlByb3ZpZGVycyIsIkdvb2dsZSIsImNsaWVudElkIiwiR09PR0xFX0lEIiwiY2xpZW50U2VjcmV0IiwiR09PR0xFX1NFQ1JFVCIsImRhdGFiYXNlIiwiREFUQUJBU0VfVVJMIiwic2Vzc2lvbiIsImp3dCIsImFsbG93U2lnbmluIiwidXNlciIsImFjY291bnQiLCJwYWdlcyIsImNhbGxiYWNrcyIsInNpZ25JbiIsInByb2ZpbGUiLCJ0b2tlbiIsImNvbnNvbGUiLCJsb2ciLCJpc05ld1VzZXIiLCJBdXRoIiwicmVxIiwicmVzIiwiTmV4dEF1dGgiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBRUEsTUFBTUEsT0FBTyxHQUFHO0FBQ2RDLE1BQUksRUFBRUMsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFVBREo7QUFFZEMsV0FBUyxFQUFFLENBQ1Q7QUFDQTtBQUNBQyw0REFBUyxDQUFDQyxNQUFWLENBQWlCO0FBQ2ZDLFlBQVEsRUFBRU4sT0FBTyxDQUFDQyxHQUFSLENBQVlNLFNBRFA7QUFFZkMsZ0JBQVksRUFBRVIsT0FBTyxDQUFDQyxHQUFSLENBQVlRO0FBRlgsR0FBakIsQ0FIUyxDQUZHO0FBVWQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FDLFVBQVEsRUFBRVYsT0FBTyxDQUFDQyxHQUFSLENBQVlVLFlBaEJSO0FBa0JkQyxTQUFPLEVBQUUsQ0FDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7Ozs7OztBQWJPLEdBbEJLO0FBdUNkO0FBQ0FDLEtBQUcsRUFBRSxDQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7Ozs7OztBQVRHLEdBeENTO0FBeURkO0FBQ0E7QUFDQTtBQUNBQyxhQUFXLEVBQUUsT0FBT0MsSUFBUCxFQUFhQyxPQUFiLEtBQXlCO0FBQ3BDO0FBQ0E7QUFDQSxXQUFPLElBQVA7QUFDRCxHQWhFYTtBQWtFZDtBQUNBO0FBQ0FDLE9BQUssRUFBRSxDQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMSyxHQXBFTztBQTRFZDtBQUNBO0FBQ0E7QUFDQUMsV0FBUyxFQUFFO0FBQ1QsVUFBTUMsTUFBTixDQUFhSixJQUFiLEVBQW1CQyxPQUFuQixFQUE0QkksT0FBNUIsRUFBcUM7QUFDbkM7QUFDQSxhQUFPLElBQVA7QUFDRCxLQUpROztBQUtULFVBQU1SLE9BQU4sQ0FBY0EsT0FBZCxFQUF1QlMsS0FBdkIsRUFBOEI7QUFDNUI7QUFDQUMsYUFBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQlgsT0FBdEI7QUFDQSxhQUFPQSxPQUFQO0FBQ0QsS0FUUTs7QUFVVCxVQUFNQyxHQUFOLENBQVVRLEtBQVYsRUFBaUJOLElBQWpCLEVBQXVCQyxPQUF2QixFQUFnQ0ksT0FBaEMsRUFBeUNJLFNBQXpDLEVBQW9EO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBRixhQUFPLENBQUNDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CRixLQUFwQjtBQUVBLGFBQU9BLEtBQVA7QUFDRDs7QUFqQlE7QUEvRUcsQ0FBaEI7O0FBb0dBLE1BQU1JLElBQUksR0FBRyxDQUFDQyxHQUFELEVBQU1DLEdBQU4sS0FBY0MsZ0RBQVEsQ0FBQ0YsR0FBRCxFQUFNQyxHQUFOLEVBQVc3QixPQUFYLENBQW5DOztBQUVlMkIsbUVBQWYiLCJmaWxlIjoiLi9wYWdlcy9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoIGZyb20gJ25leHQtYXV0aCdcbmltcG9ydCBQcm92aWRlcnMgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycydcblxuY29uc3Qgb3B0aW9ucyA9IHtcbiAgc2l0ZTogcHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLy8gV2hlbiBjb25maWd1cmluZyBvQXV0aCBwcm92aWRlcnMgbWFrZSBzdXJlIHlvdSBlbmFibGluZyByZXF1ZXN0aW5nXG4gICAgLy8gcGVybWlzc2lvbiB0byBnZXQgdGhlIHVzZXJzIGVtYWlsIGFkZHJlc3MgKHJlcXVpcmVkIHRvIHNpZ24gaW4pXG4gICAgUHJvdmlkZXJzLkdvb2dsZSh7XG4gICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuR09PR0xFX0lELFxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HT09HTEVfU0VDUkVULFxuICAgIH0pLFxuICBdLFxuICAvLyBUaGUgJ2RhdGFiYXNlJyBvcHRpb24gc2hvdWxkIGJlIGEgY29ubmVjdGlvbiBzdHJpbmcgb3IgVHlwZU9STVxuICAvLyBjb25maWd1cmF0aW9uIG9iamVjdCBodHRwczovL3R5cGVvcm0uaW8vIy9jb25uZWN0aW9uLW9wdGlvbnNcbiAgLy9cbiAgLy8gTm90ZXM6XG4gIC8vICogWW91IG5lZWQgdG8gaW5zdGFsbCBhbiBhcHByb3ByaWF0ZSBub2RlX21vZHVsZSBmb3IgeW91ciBkYXRhYmFzZSFcbiAgLy8gKiBUaGUgZW1haWwgc2lnbiBpbiBwcm92aWRlciByZXF1aXJlcyBhIGRhdGFiYXNlIGJ1dCBPQXV0aCBwcm92aWRlcnMgZG8gbm90XG4gIGRhdGFiYXNlOiBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsXG5cbiAgc2Vzc2lvbjoge1xuICAgIC8vIFVzZSBKU09OIFdlYiBUb2tlbnMgZm9yIHNlc3Npb24gaW5zdGVhZCBvZiBkYXRhYmFzZSBzZXNzaW9ucy5cbiAgICAvLyBUaGlzIG9wdGlvbiBjYW4gYmUgdXNlZCB3aXRoIG9yIHdpdGhvdXQgYSBkYXRhYmFzZSBmb3IgdXNlcnMvYWNjb3VudHMuXG4gICAgLy8gTm90ZTogYGp3dGAgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gYHRydWVgIGlmIG5vIGRhdGFiYXNlIGlzIHNwZWNpZmllZC5cbiAgICAvLyBqd3Q6IHRydWUsXG4gICAgLy8gU2Vjb25kcyAtIEhvdyBsb25nIHVudGlsIGFuIGlkbGUgc2Vzc2lvbiBleHBpcmVzIGFuZCBpcyBubyBsb25nZXIgdmFsaWQuXG4gICAgLy8gbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGF5c1xuICAgIC8vIFNlY29uZHMgLSBUaHJvdHRsZSBob3cgZnJlcXVlbnRseSB0byB3cml0ZSB0byBkYXRhYmFzZSB0byBleHRlbmQgYSBzZXNzaW9uLlxuICAgIC8vIFVzZSBpdCB0byBsaW1pdCB3cml0ZSBvcGVyYXRpb25zLiBTZXQgdG8gMCB0byBhbHdheXMgdXBkYXRlIHRoZSBkYXRhYmFzZS5cbiAgICAvLyBOb3RlOiBUaGlzIG9wdGlvbiBpcyBpZ25vcmVkIGlmIHVzaW5nIEpTT04gV2ViIFRva2Vuc1xuICAgIC8vIHVwZGF0ZUFnZTogMjQgKiA2MCAqIDYwLCAvLyAyNCBob3Vyc1xuICAgIC8vIEVhc2lseSBhZGQgY3VzdG9tIHByb3BlcnRpZXMgdG8gcmVzcG9uc2UgZnJvbSBgL2FwaS9hdXRoL3Nlc3Npb25gLlxuICAgIC8vIE5vdGU6IFRoaXMgc2hvdWxkIG5vdCByZXR1cm4gYW55IHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi5cbiAgICAvKlxuICAgIGdldDogYXN5bmMgKHNlc3Npb24pID0+IHtcbiAgICAgIHNlc3Npb24uY3VzdG9tU2Vzc2lvblByb3BlcnR5ID0gXCJBQkMxMjNcIlxuICAgICAgcmV0dXJuIHNlc3Npb25cbiAgICB9XG4gICAgKi9cbiAgfSxcblxuICAvLyBKU09OIFdlYiBUb2tlbiBvcHRpb25zXG4gIGp3dDoge1xuICAgIC8vIHNlY3JldDogJ215LXNlY3JldC0xMjMnLCAvLyBSZWNvbW1lbmRlZCAoYnV0IGF1dG8tZ2VuZXJhdGVkIGlmIG5vdCBzcGVjaWZpZWQpXG4gICAgLy8gQ3VzdG9tIGVuY29kZS9kZWNvZGUgZnVuY3Rpb25zIGZvciBzaWduaW5nICsgZW5jcnlwdGlvbiBjYW4gYmUgc3BlY2lmaWVkLlxuICAgIC8vIGlmIHlvdSB3YW50IHRvIG92ZXJyaWRlIHdoYXQgaXMgaW4gdGhlIEpXVCBvciBob3cgaXQgaXMgc2lnbmVkLlxuICAgIC8vIGVuY29kZTogYXN5bmMgKHsgc2VjcmV0LCBrZXksIHRva2VuLCBtYXhBZ2UgfSkgPT4ge30sXG4gICAgLy8gZGVjb2RlOiBhc3luYyAoeyBzZWNyZXQsIGtleSwgdG9rZW4sIG1heEFnZSB9KSA9PiB7fSxcbiAgICAvLyBFYXNpbHkgYWRkIGN1c3RvbSB0byB0aGUgSldULiBJdCBpcyB1cGRhdGVkIGV2ZXJ5IHRpbWUgaXQgaXMgYWNjZXNzZWQuXG4gICAgLy8gVGhpcyBpcyBlbmNyeXB0ZWQgYW5kIHNpZ25lZCBieSBkZWZhdWx0IGFuZCBtYXkgY29udGFpbiBzZW5zaXRpdmUgaW5mb3JtYXRpb25cbiAgICAvLyBhcyBsb25nIGFzIGEgcmVhc29uYWJsZSBzZWNyZXQgaXMgZGVmaW5lZC5cbiAgICAvKlxuICAgIHNldDogYXN5bmMgKHRva2VuKSA9PiB7XG4gICAgICB0b2tlbi5jdXN0b21Kd3RQcm9wZXJ0eSA9IFwiQUJDMTIzXCJcbiAgICAgIHJldHVybiB0b2tlblxuICAgIH1cbiAgICAqL1xuICB9LFxuXG4gIC8vIENvbnRyb2wgd2hpY2ggdXNlcnMgLyBhY2NvdW50cyBjYW4gc2lnbiBpblxuICAvLyBZb3UgY2FuIHVzZSB0aGlzIG9wdGlvbiBpbiBjb25qdW5jdGlvbiB3aXRoIE9BdXRoIGFuZCBKV1QgdG8gY29udHJvbCB3aGljaFxuICAvLyBhY2NvdW50cyBjYW4gc2lnbiBpbiB3aXRob3V0IGhhdmluZyB0byB1c2UgYSBkYXRhYmFzZS5cbiAgYWxsb3dTaWduaW46IGFzeW5jICh1c2VyLCBhY2NvdW50KSA9PiB7XG4gICAgLy8gUmV0dXJuIHRydWUgaWYgdXNlciAvIGFjY291bnQgaXMgYWxsb3dlZCB0byBzaWduIGluLlxuICAgIC8vIFJldHVybiBmYWxzZSB0byBkaXNwbGF5IGFuIGFjY2VzcyBkZW5pZWQgbWVzc2FnZS5cbiAgICByZXR1cm4gdHJ1ZVxuICB9LFxuXG4gIC8vIFlvdSBjYW4gZGVmaW5lIGN1c3RvbSBwYWdlcyB0byBvdmVycmlkZSB0aGUgYnVpbHQtaW4gcGFnZXNcbiAgLy8gVGhlIHJvdXRlcyBzaG93biBoZXJlIGFyZSB0aGUgZGVmYXVsdCBVUkxzIHRoYXQgd2lsbCBiZSB1c2VkLlxuICBwYWdlczoge1xuICAgIC8vIHNpZ25pbjogJy9hcGkvYXV0aC9zaWduaW4nLCAgLy8gRGlzcGxheXMgc2lnbmluIGJ1dHRvbnNcbiAgICAvLyBzaWdub3V0OiAnL2FwaS9hdXRoL3NpZ25vdXQnLCAvLyBEaXNwbGF5cyBmb3JtIHdpdGggc2lnbiBvdXQgYnV0dG9uXG4gICAgLy8gZXJyb3I6ICcvYXBpL2F1dGgvZXJyb3InLCAvLyBFcnJvciBjb2RlIHBhc3NlZCBpbiBxdWVyeSBzdHJpbmcgYXMgP2Vycm9yPVxuICAgIC8vIHZlcmlmeVJlcXVlc3Q6ICcvYXBpL2F1dGgvdmVyaWZ5LXJlcXVlc3QnLCAvLyBVc2VkIGZvciBjaGVjayBlbWFpbCBwYWdlXG4gICAgLy8gbmV3VXNlcjogbnVsbCAvLyBJZiBzZXQsIG5ldyB1c2VycyB3aWxsIGJlIGRpcmVjdGVkIGhlcmUgb24gZmlyc3Qgc2lnbiBpblxuICB9LFxuXG4gIC8vIEFkZGl0aW9uYWwgb3B0aW9uc1xuICAvLyBzZWNyZXQ6ICdhYmNkZWYxMjM0NTY3ODknIC8vIFJlY29tbWVuZGVkIChidXQgYXV0by1nZW5lcmF0ZWQgaWYgbm90IHNwZWNpZmllZClcbiAgLy8gZGVidWc6IHRydWUsIC8vIFVzZSB0aGlzIG9wdGlvbiB0byBlbmFibGUgZGVidWcgbWVzc2FnZXMgaW4gdGhlIGNvbnNvbGVcbiAgY2FsbGJhY2tzOiB7XG4gICAgYXN5bmMgc2lnbkluKHVzZXIsIGFjY291bnQsIHByb2ZpbGUpIHtcbiAgICAgIC8vIHVzZXIuYWNjZXNzVG9rZW4gPSAnYWJhY2F0ZWlybzEyMydcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHNlc3Npb24sIHRva2VuKSB7XG4gICAgICAvLyBzZXNzaW9uLmFjY2Vzc1Rva2VuID0gdG9rZW4uYWNjZXNzVG9rZW5cbiAgICAgIGNvbnNvbGUubG9nKCcgU0VTU0EnLCBzZXNzaW9uKVxuICAgICAgcmV0dXJuIHNlc3Npb25cbiAgICB9LFxuICAgIGFzeW5jIGp3dCh0b2tlbiwgdXNlciwgYWNjb3VudCwgcHJvZmlsZSwgaXNOZXdVc2VyKSB7XG4gICAgICAvLyBpZiAodXNlcikge1xuICAgICAgLy8gICB0b2tlbiA9IHsgYWNjZXNzVG9rZW46IHVzZXIuYWNjZXNzVG9rZW4gfVxuICAgICAgLy8gfVxuICAgICAgY29uc29sZS5sb2coJ1RPSz0nLCB0b2tlbilcblxuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IEF1dGggPSAocmVxLCByZXMpID0+IE5leHRBdXRoKHJlcSwgcmVzLCBvcHRpb25zKVxuXG5leHBvcnQgZGVmYXVsdCBBdXRoXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/api/auth/[...nextauth].js\n");

/***/ }),

/***/ "next-auth":
/*!****************************!*\
  !*** external "next-auth" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"next-auth\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJuZXh0LWF1dGhcIj8yOWY3Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6Im5leHQtYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5leHQtYXV0aFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///next-auth\n");

/***/ }),

/***/ "next-auth/providers":
/*!**************************************!*\
  !*** external "next-auth/providers" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"next-auth/providers\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJuZXh0LWF1dGgvcHJvdmlkZXJzXCI/NjljNyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJuZXh0LWF1dGgvcHJvdmlkZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmV4dC1hdXRoL3Byb3ZpZGVyc1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///next-auth/providers\n");

/***/ })

/******/ });