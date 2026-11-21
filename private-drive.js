(() => {
  "use strict";
  const scope = "https://www.googleapis.com/auth/drive.file";
  const docs = "application/vnd.google-apps.document";
  const images = new Set(["image/png", "image/jpeg", "image/webp"]);
  const byId = id => document.getElementById(id);
  const panel = byId("pin-drive");
  const open = byId("pin-drive-open");
  const close = byId("pin-drive-close");
  const preview = byId("pin-drive-preview");
  const status = byId("pin-drive-status");
  let session, pickerLibrary;

  function clear(message) {
    const previous = session;
    session = undefined;
    preview.replaceChildren();
    open.disabled = false;
    close.hidden = true;
    if (message) status.textContent = message;
    if (!previous) return;
    previous.token = undefined;
    previous.request.abort();
    clearTimeout(previous.timer);
    clearInterval(previous.recheck);
    previous.picker?.dispose();
    if (previous.imageUrl) URL.revokeObjectURL(previous.imageUrl);
  }

  function active(current) {
    if (current !== session) return false;
    if (current.expiry && Date.now() >= current.expiry) {
      clear("Google 授權已過期。請重新選取文件。");
      return false;
    }
    return true;
  }

  function loadPicker() {
    pickerLibrary ||= new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onerror = () => reject(new Error("Picker 程式載入失敗。"));
      script.onload = () => window.gapi.load("picker", {
        callback: resolve,
        onerror: () => reject(new Error("Picker 元件載入失敗。")),
        timeout: 10000,
        ontimeout: () => reject(new Error("Picker 元件載入逾時。"))
      });
      document.head.append(script);
    }).catch(error => {
      pickerLibrary = undefined;
      throw error;
    });
    return pickerLibrary;
  }

  async function driveGet(current, url) {
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + current.token },
      cache: "no-store",
      redirect: "error",
      signal: current.request.signal
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error("Google 授權失效（401）。請重新選取文件。");
      if ([403, 404].includes(response.status)) {
        throw new Error(`無法讀取文件（${response.status}）。請確認 Google 帳號、文件權限及 Drive API 設定。`);
      }
      throw new Error("Drive 文件讀取失敗。");
    }
    return response;
  }

  async function recheckAccess(current) {
    if (!active(current) || !current.accessUrl || current.checking) return;
    current.checking = true;
    try {
      await driveGet(current, current.accessUrl);
    } catch (error) {
      if (active(current)) clear(error instanceof TypeError ? "無法確認 Google Drive 存取權限。" : error.message);
    } finally {
      current.checking = false;
    }
  }

  async function readFile(current, id) {
    const file = "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id);
    try {
      status.textContent = "正在讀取私人文件…";
      const metadata = await (await driveGet(current, file + "?fields=name,mimeType&supportsAllDrives=true")).json();
      if (!active(current)) return;
      const mime = metadata.mimeType;
      const image = images.has(mime);
      const markdown = /\.md$/i.test(metadata.name) &&
        ["text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"].includes(mime);
      if (mime !== docs && !image && !markdown) throw new Error("此檔案類型不支援預覽。");
      const url = mime === docs ? file + "/export?mimeType=text%2Fplain" : file + "?alt=media&supportsAllDrives=true";
      const response = await driveGet(current, url);
      const content = image ? await response.blob() : await response.text();
      if (!active(current)) return;

      const title = document.createElement("h3");
      title.textContent = metadata.name;
      const body = document.createElement(image ? "img" : "pre");
      if (image) {
        const blob = content.slice(0, content.size, mime);
        current.imageUrl = URL.createObjectURL(blob);
        body.src = current.imageUrl;
        body.alt = metadata.name;
        body.style.maxWidth = "100%";
      } else {
        body.textContent = content;
        body.style.whiteSpace = "pre-wrap";
        body.style.overflowWrap = "anywhere";
      }
      current.accessUrl = file + "?fields=id&supportsAllDrives=true";
      current.recheck = setInterval(() => void recheckAccess(current), 30000);
      preview.replaceChildren(title, body);
      status.textContent = "私人文件唯讀預覽。";
      open.disabled = false;
    } catch (error) {
      if (active(current)) clear(error instanceof TypeError ? "無法連線至 Google Drive。" : error.message);
    }
  }

  async function showPicker(current, key, project) {
    try {
      await loadPicker();
      if (!active(current)) return;
      const picker = window.google.picker;
      current.picker = new picker.PickerBuilder()
        .addView(new picker.DocsView().setMimeTypes([docs, ...images, "text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"].join(",")))
        .setDeveloperKey(key)
        .setAppId(project)
        .setOrigin(window.location.origin)
        .setOAuthToken(current.token)
        .setCallback(data => {
          if (!active(current)) return;
          const action = data[picker.Response.ACTION];
          if (action === picker.Action.LOADED) return;
          if (action === picker.Action.PICKED && !current.picked) {
            current.picked = true;
            const id = data[picker.Response.DOCUMENTS]?.[0]?.[picker.Document.ID];
            if (id) void readFile(current, id);
            else clear("Picker 未回傳檔案。");
          } else if (!current.picked) {
            clear(action === picker.Action.CANCEL ? "已取消選取。" : "Picker 無法選取文件。請確認 Cloud 設定。");
          }
        })
        .build();
      current.picker.setVisible(true);
    } catch {
      if (active(current)) clear("無法開啟 Google Picker。請確認 Cloud 設定及網路連線。");
    }
  }

  open.addEventListener("click", () => {
    clear();
    const clientId = byId("pin-research-client-id").value.trim();
    const key = byId("pin-drive-key").value.trim();
    const project = byId("pin-drive-project").value.trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId) || !key || !/^\d+$/.test(project)) {
      clear("請先填入研究畫板的 OAuth Client ID、Cloud 專案編號與 Picker API key。");
      return;
    }
    const oauth = window.google?.accounts?.oauth2;
    if (!oauth) {
      clear("Google 登入程式尚未載入。請稍候再試。");
      return;
    }

    const current = { request: new AbortController() };
    session = current;
    open.disabled = true;
    close.hidden = false;
    status.textContent = "請在 Google 選擇有權限的帳號。";
    try {
      oauth.initTokenClient({
        client_id: clientId,
        scope,
        include_granted_scopes: false,
        callback: response => {
          if (!active(current)) return;
          const seconds = Number(response.expires_in);
          if (response.error || !response.access_token || !response.scope?.split(/\s+/).includes(scope) ||
              !Number.isFinite(seconds) || seconds <= 0) {
            clear("未取得 Drive 逐檔授權。請選擇有權限的 Google 帳號再試。");
            return;
          }
          current.token = response.access_token;
          current.expiry = Date.now() + seconds * 1000;
          current.timer = setTimeout(() => active(current), seconds * 1000);
          void showPicker(current, key, project);
        },
        error_callback: () => {
          if (active(current)) clear("Google 授權視窗已關閉或遭封鎖。");
        }
      }).requestAccessToken({ prompt: "select_account" });
    } catch {
      if (active(current)) clear("無法啟動 Google 授權。請確認 OAuth 設定。");
    }
  });

  close.addEventListener("click", () => clear("已登出 Drive 預覽，私人文件已清除。"));
  panel.addEventListener("toggle", () => { if (!panel.open) clear("私人文件已清除。"); });
  document.querySelectorAll("button[data-type]").forEach(button =>
    button.addEventListener("click", () => { if (session) clear("私人文件已清除。"); }));
  window.addEventListener("pin:google-disconnect", () => clear("Google 授權已斷開，私人文件已清除。"));
  window.addEventListener("pagehide", () => clear("私人文件已清除。"));
  document.addEventListener("visibilitychange", () => {
    // Avoid retaining a previously visible private document in the DOM while
    // another browser tab is active (including after remote access revocation).
    if (document.hidden && session?.picked) {
      clear("已離開分頁，私人文件已清除。請重新選取文件。");
    } else if (!document.hidden && session) {
      void recheckAccess(session);
    }
  });
})();
