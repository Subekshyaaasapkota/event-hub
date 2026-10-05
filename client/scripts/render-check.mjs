// Renders every routed page component to a string in Node and reports failures.
//
// This exists because the two worst bugs in this project passed eslint and
// passed `npm run build`, and still broke the page: a temporal dead zone error
// ("Cannot access 'triggerRef' before initialization") and an undeclared
// element. Both only surface when a component actually executes, so a green
// build is not evidence that a page renders.
//
// Effects do not run under renderToString, which is what makes this cheap and
// safe: no API calls, no navigation, no side effects. What is being tested is
// that the module loads, every binding resolves, and the component completes
// its first render.
//
// Usage: npm run render:check   (from the client folder)

import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Imported directly rather than through Vite. Asking Vite's SSR pipeline to
// inline them fails on their CommonJS internals with "module is not defined",
// and they do not need transforming anyway. Vite externalises dependencies by
// default, so app source loaded below ends up resolving to these same
// instances rather than a second copy, which is what keeps a Provider here
// visible to a useSelector inside a page.
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Minimal browser surface for the few things dependencies touch at import time.
// If a component genuinely needs something more during render, it shows up
// below as a failure, which is a real signal rather than something to hide.
const stubEl = () => ({
  style: {},
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  setAttribute() {},
  removeAttribute() {},
  getAttribute: () => null,
  appendChild() {},
  removeChild() {},
  addEventListener() {},
  removeEventListener() {},
  querySelector: () => null,
  querySelectorAll: () => [],
  focus() {},
  blur() {},
  click() {},
  getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
});

globalThis.window ??= globalThis;
globalThis.self ??= globalThis;
// axios decides it is in a browser because both window and document exist, then
// reads window.location.href straight away, so the stub needs a location.
globalThis.location ??= {
  href: "http://localhost:5173/",
  origin: "http://localhost:5173",
  pathname: "/",
  search: "",
  hash: "",
  host: "localhost:5173",
  hostname: "localhost",
  port: "5173",
  protocol: "http:",
  assign() {},
  replace() {},
  reload() {},
};
globalThis.document ??= {
  documentElement: stubEl(),
  body: stubEl(),
  head: stubEl(),
  createElement: () => stubEl(),
  createElementNS: () => stubEl(),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
};
globalThis.navigator ??= { userAgent: "node", language: "en" };
// leaflet reads these at module scope to work out whether it is on a retina
// display. react-leaflet is externalised, so this value comes from here
// rather than from any alias, and an absent screen throws before render.
globalThis.screen ??= {
  width: 1440,
  height: 900,
  deviceXDPI: 96,
  logicalXDPI: 96,
};
globalThis.localStorage ??= {
  getItem: () => null,
  setItem() {},
  removeItem() {},
  clear() {},
  key: () => null,
  length: 0,
};
globalThis.matchMedia ??= () => ({
  matches: false,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
});

const PAGES = [
  ["public/Home", "Home"],
  ["public/Events", "Events"],
  ["public/EventDetails", "EventDetails"],
  ["public/About", "About"],
  ["public/Contact", "Contact"],
  ["public/SupportCenter", "SupportCenter"],
  ["public/PaymentSuccess", "PaymentSuccess"],
  ["public/EsewaPayment", "EsewaPayment"],
  ["public/NotFound", "NotFound"],
  ["public/RegistrationForm", "RegistrationForm"],
  ["auth/Login", "Login"],
  ["auth/Signup", "Signup"],
  ["user/Dashboard", "Dashboard"],
  ["user/RegisteredEvents", "RegisteredEvents"],
  ["user/Profile", "Profile"],
  ["club/ClubDashboard", "ClubDashboard"],
  ["club/CreateEvents", "CreateEvents"],
  ["club/ClubEventListing", "ManageYourEvents"],
  ["club/ManageEventDetails", "AdminEventManagement"],
  ["club/ClubRegistration", "ClubRegistration"],
  ["club/ManageEventRegisterByUser", "ManageEventRegisterByUser"],
  ["club/EventAnalytics", "EventAnalytics"],
  ["admin/AdminDashboard", "AdminDashboard"],
  ["admin/ManageEvents", "AdminManageEvents"],
  ["admin/ManageClubs", "AdminManageClubs"],
  ["admin/AllUsers", "AdminAllUsers"],
  ["admin/AllClubs", "AdminAllClubs"],
  ["admin/AdminEventDetails", "AdminEventDetails"],
  ["admin/AdminRegistrations", "AdminRegistrations"],
  ["admin/AdminHome", "AdminHome"],
  ["../components/Organizer/ClubRedirection", "ClubPortal"],
];

const here = path.dirname(fileURLToPath(import.meta.url));

const server = await createServer({
  configFile: "vite.config.js",
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  resolve: {
    // Browser-only libraries are swapped for no-op stand-ins so their import
    // time DOM access cannot take a page down before it has rendered a
    // single element. This affects only what this harness observes.
    //
    // Written as anchored regexes rather than plain string keys. A string key
    // in Vite matches on prefix, so "leaflet" would also swallow
    // "leaflet/dist/leaflet.css" and replace a stylesheet with a module. That
    // is why CreateEvents crashed with a deviceXDPI error for as long as the
    // stub existed but the alias pointing at it did not.
    alias: [
      {
        find: /^leaflet$/,
        replacement: path.join(here, "ssr-stubs", "leaflet.js"),
      },
      {
        find: /^react-hot-toast$/,
        replacement: path.join(here, "ssr-stubs", "react-hot-toast.js"),
      },
      {
        find: /^recharts$/,
        replacement: path.join(here, "ssr-stubs", "recharts.js"),
      },
    ],
  },
  ssr: {
    // Explicit rather than relying on the default, because the correctness of
    // this check depends on app source and this script sharing one React.
    external: [
      "react",
      "react-dom",
      "react-dom/server",
      "react-router-dom",
      "react-redux",
      "react-redux/es",
      "@reduxjs/toolkit",
      "redux",
    ],
    // react-leaflet lives in node_modules, so Vite externalises it and Node
    // resolves its own "leaflet" import natively, past any alias. leaflet
    // reads window.screen.deviceXDPI at module scope, which is undefined
    // here, so CreateEvents dies before it renders a single element. Keeping
    // the package externalised and giving screen a shape is the honest fix;
    // forcing noExternal rewrites it through Vite and breaks on CJS deps.
    noExternal: ["react-leaflet"],
  },
});

// Only app source goes through Vite. The source uses extensionless relative
// imports that Node's ESM resolver rejects but Vite accepts, so the page
// modules and the reducer cannot be imported directly.
const rootReducer = (await server.ssrLoadModule("/src/redux/rootReducer.js")).default;

// A plain store: redux-persist needs localStorage and rehydrates
// asynchronously, which would leave auth-dependent pages rendering a spinner
// and prove nothing about the page itself.
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

const results = [];

for (const [path, label] of PAGES) {
  try {
    const mod = await server.ssrLoadModule(`/src/pages/${path}`);
    const Component = mod.default;
    if (typeof Component !== "function" && typeof Component !== "object") {
      results.push([label, "NO COMPONENT", "default export is not a component", true]);
      continue;
    }
    const html = renderToString(
      React.createElement(
        Provider,
        { store },
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(Component, { id: "1" }),
        ),
      ),
    );
    const len = html.length;
    results.push([
      label,
      len > 0 ? "ok" : "EMPTY",
      len > 0 ? `${len} chars` : "rendered nothing",
      len === 0,
    ]);
  } catch (error) {
    const msg = String(error?.message ?? error).split("\n")[0];
    // The first stack frame inside src/ says whether this is a page fault or an
    // artefact of rendering an auth-gated page with an empty store.
    const frame = String(error?.stack ?? "")
      .split("\n")
      .find((l) => l.includes("/src/") && !l.includes("render-check"));
    results.push([label, "CRASH", `${msg}  <- ${(frame ?? "").trim().slice(0, 150)}`, true]);
  }
}

await server.close();

const bad = results.filter((r) => r[3]).length;
console.log("\npage                       result   detail");
console.log("-".repeat(80));
for (const [label, status, detail] of results) {
  console.log(`${status === "ok" ? " " : "!"} ${label.padEnd(25)} ${status.padEnd(9)} ${detail}`);
}
console.log("-".repeat(80));
console.log(`${results.length} pages, ${results.length - bad} rendered, ${bad} need attention\n`);
process.exit(bad ? 1 : 0);
