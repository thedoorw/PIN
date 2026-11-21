import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../private-drive.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const scope = "https://www.googleapis.com/auth/drive.file";
const fixtureToken = "synthetic-test-bearer";
const fixtureText = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
const flush = () => new Promise(resolve => setImmediate(resolve));

function setup({ name = "fixture.md", mime = "text/plain", error, pause } = {}) {
  class Element extends EventTarget {
    constructor(tag) {
      super();
      this.tag = tag;
      this.style = {};
      this.children = [];
    }
    replaceChildren(...children) { this.children = children; }
    set innerHTML(_) { assert.fail("Private content must never be assigned as HTML"); }
    click() { this.dispatchEvent(new Event("click")); }
  }
  const elements = new Map();
  const get = key => {
    if (!elements.has(key)) elements.set(key, new Element(key));
    return elements.get(key);
  };
  const tab = new Element("catalog-tab");
  const document = Object.assign(new EventTarget(), {
    getElementById: get, createElement: tag => new Element(tag),
    head: { append: script => script.onload() }, querySelectorAll: () => [tab]
  });
  const window = new EventTarget();
  const requests = [], revoked = [];
  let onPick, tokenClient, expiry, recheck, authorizationCount = 0, accessError;
  class PickerBuilder {
    addView() { return this; }
    setDeveloperKey() { return this; }
    setAppId() { return this; }
    setOrigin() { return this; }
    setOAuthToken(token) { assert.equal(token, fixtureToken); return this; }
    setCallback(callback) { onPick = callback; return this; }
    build() { return { setVisible() {}, dispose() {} }; }
  }
  Object.assign(window, {
    location: { origin: "http://localhost:8000" },
    gapi: { load: (_, options) => options.callback() },
    google: {
      accounts: { oauth2: { initTokenClient: options => {
        tokenClient = options;
        return { requestAccessToken: ({prompt}) => {
          assert.equal(prompt, "select_account");
          authorizationCount++;
        } };
      } } },
      picker: {
        PickerBuilder, DocsView: class { setMimeTypes() { return this; } },
        Response: { ACTION: "action", DOCUMENTS: "docs" }, Document: { ID: "id" },
        Action: { PICKED: "picked", LOADED: "loaded", CANCEL: "cancel" }
      }
    }
  });
  get("pin-research-client-id").value = "fixture.apps.googleusercontent.com";
  get("pin-drive-key").value = "fixture-browser-key";
  get("pin-drive-project").value = "123";
  runInNewContext(source, {
    document, window, AbortController, Date,
    setTimeout(callback) { expiry = callback; },
    clearTimeout() {},
    setInterval(callback) { recheck = callback; },
    clearInterval() {},
    URL: { createObjectURL: () => "blob:fixture", revokeObjectURL: url => revoked.push(url) },
    fetch: async (url, options) => {
      assert.match(url, /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\/fixture[?/]/);
      assert.equal(options.method, undefined);
      assert.equal(options.headers.Authorization, "Bearer " + fixtureToken);
      assert.equal(options.cache, "no-store");
      assert.equal(options.redirect, "error");
      requests.push({url, signal: options.signal});
      if (pause && url.includes("alt=media")) await pause;
      return {
        ok: !(error || accessError),
        status: error || accessError || 200,
        json: async () => ({name, mimeType: mime}),
        text: async () => fixtureText,
        blob: async () => new Blob(["fixture"], {type: mime})
      };
    }
  });
  return {
    get, tab, window, requests, revoked,
    preview: get("pin-drive-preview"),
    status: get("pin-drive-status"),
    close: get("pin-drive-close"),
    authorizationCount: () => authorizationCount,
    async select(response = {}) {
      get("pin-drive-open").click();
      assert.equal(tokenClient.scope, scope);
      assert.equal(tokenClient.include_granted_scopes, false);
      tokenClient.callback({scope, access_token: fixtureToken, expires_in: 3600, ...response});
      await flush();
    },
    async pick() {
      onPick({action: "loaded"});
      onPick({action: "picked", docs: [{id: "fixture"}]});
      await flush();
    },
    async denyAccess(code) {
      accessError = code;
      recheck();
      await flush();
    },
    expire: () => expiry()
  };
}

test("public assets contain no configured Picker credential, private payload, or Drive storage path", () => {
  assert.match(html, /id="pin-drive-preview"><\/div>/);
  assert.doesNotMatch(html + source, /synthetic-test-bearer|fixture-browser-key|AIza[\w-]{35}/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|caches\.|console\.|innerHTML/);
  const env = setup();
  assert.equal(env.authorizationCount(), 0);
  assert.equal(env.requests.length, 0);
  env.get("pin-drive-key").value = "";
  env.get("pin-drive-open").click();
  assert.equal(env.authorizationCount(), 0);
  assert.match(env.status.textContent, /Cloud/);
});

test("Markdown and Google Docs render literally using separate Drive endpoints", async () => {
  for (const mime of ["text/plain", "application/vnd.google-apps.document"]) {
    const env = setup({mime, name: mime === "text/plain" ? "fixture.md" : "fixture"});
    await env.select();
    await env.pick();
    assert.equal(env.preview.children[1].tag, "pre");
    assert.equal(env.preview.children[1].textContent, fixtureText);
    assert.match(env.requests[1].url, mime === "text/plain" ? /alt=media/ : /export\?mimeType=text%2Fplain/);
    env.close.click();
    assert.equal(env.preview.children.length, 0);
    assert.ok(env.requests[1].signal.aborted);
  }
});

test("all supported images use object URLs that are revoked on navigation", async () => {
  for (const mime of ["image/png", "image/jpeg", "image/webp"]) {
    const env = setup({mime});
    await env.select();
    await env.pick();
    assert.equal(env.preview.children[1].src, "blob:fixture");
    env.tab.click();
    assert.deepEqual(env.revoked, ["blob:fixture"]);
    assert.equal(env.preview.children.length, 0);
  }
});

test("unsupported types and denied accounts keep the preview empty", async () => {
  for (const error of [401, 403, 404, undefined]) {
    const env = setup({mime: "image/svg+xml", error});
    await env.select();
    await env.pick();
    assert.equal(env.preview.children.length, 0);
    assert.equal(env.requests.length, 1);
    assert.match(env.status.textContent, error ? new RegExp(error) : /不支援/);
  }
});

test("missing scope, expired token, and permission revocation clear the session", async () => {
  const denied = setup();
  await denied.select({scope: "other"});
  assert.match(denied.status.textContent, /未取得/);
  const env = setup();
  await env.select({expires_in: 0.001});
  await new Promise(resolve => setTimeout(resolve, 15));
  env.expire();
  assert.match(env.status.textContent, /過期/);
  const revoked = setup();
  await revoked.select();
  await revoked.pick();
  await revoked.denyAccess(403);
  assert.equal(revoked.preview.children.length, 0);
  assert.match(revoked.status.textContent, /403/);
});

test("global logout and pagehide prevent in-flight responses from restoring private content", async () => {
  for (const event of ["pin:google-disconnect", "pagehide"]) {
    let release;
    const pause = new Promise(resolve => { release = resolve; });
    const env = setup({pause});
    await env.select();
    await env.pick();
    env.window.dispatchEvent(new Event(event));
    release();
    await flush();
    assert.equal(env.preview.children.length, 0);
    assert.ok(env.requests[1].signal.aborted);
  }
});
