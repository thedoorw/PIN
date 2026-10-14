/* PIN private research board v0.1 — browser OAuth, no public sheet projection. */
(() => {
  "use strict";
  const SHEET_ID = "1xyJdKCScnB4Krq8sdSdqaWIrM4EyCoy1hUbk6QFewD0";
  const SHEET_NAME = "PIN 研究索引";
  const SHEET_RANGE = "'" + SHEET_NAME.replaceAll("'", "''") + "'!";
  const API = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/";
  const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
  const CLIENT_KEY = "pin:research:oauth-client-id:v1";
  const COLS = [1, 0, 5, 6, 7, 2, 3, 4];
  const root = document.getElementById("pin-private-research");
  if (!root) return;
  const clientInput = document.getElementById("pin-research-client-id");
  const connectButton = document.getElementById("pin-research-connect");
  const logoutButton = document.getElementById("pin-research-disconnect");
  const reloadButton = document.getElementById("pin-research-reload");
  const addButton = document.getElementById("pin-research-add");
  const addCategory = document.getElementById("pin-research-new-category");
  const statusLabel = document.getElementById("pin-research-status");
  const setup = document.getElementById("pin-research-setup");
  const board = document.getElementById("pin-research-board");
  const table = document.getElementById("pin-research-table");
  const count = document.getElementById("pin-research-count");
  let token = "";
  let tokenExpiry = 0;
  let oauthClient = null;
  let lastClientId = "";
  let baseline = [];
  let pending = 0;

  try { clientInput.value = localStorage.getItem(CLIENT_KEY) || ""; } catch {}
  function setStatus(message, kind = "") {
    statusLabel.textContent = message;
    statusLabel.dataset.kind = kind;
  }
  function connected() { return !!token && Date.now() < tokenExpiry; }
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  function columnName(i) { return String.fromCharCode(65 + i); }
  function cellAddress(row, col) { return SHEET_RANGE + columnName(col) + (row + 1); }
  function normalized(row) {
    return Array.from({length: 8}, (_, i) => String(row?.[i] ?? ""));
  }
  function validateLink(value) {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }
  function unsaved() {
    return [...table.querySelectorAll("[data-research-cell]")].some(input => {
      const row = +input.dataset.row, col = +input.dataset.col;
      return input.value !== (baseline[row]?.[col] ?? "");
    });
  }
  function canRefresh() {
    if (pending) { setStatus("正在儲存，完成後再重新整理。", "warning"); return false; }
    if (unsaved() && !confirm("有尚未儲存的修改。要捨棄這些修改並重新讀取嗎？")) return false;
    return true;
  }
  function showAuthenticated(isAuthenticated) {
    setup.hidden = isAuthenticated;
    board.hidden = !isAuthenticated;
    logoutButton.hidden = !isAuthenticated;
    if (!isAuthenticated) {
      baseline = [];
      table.replaceChildren();
      count.textContent = "";
    }
  }
  async function api(url, options = {}) {
    if (!connected()) {
      token = "";
      showAuthenticated(false);
      throw new Error("Google 授權已過期，請重新連接。");
    }
    let response;
    try {
      response = await fetch(url, {
        ...options,
        cache: "no-store",
        headers: { Authorization: "Bearer " + token, ...(options.body ? {"Content-Type": "application/json"} : {}), ...options.headers }
      });
    } catch {
      throw new Error("網路連線失敗，請檢查網路後重試。");
    }
    if (!response.ok) {
      let detail = "";
      try {
        const json = await response.json();
        detail = String(json.error?.message || "");
      } catch {}
      if (response.status === 401) {
        token = "";
        showAuthenticated(false);
        throw new Error("Google 授權已過期，請重新連接。");
      }
      if (response.status === 403) throw new Error("Google 拒絕存取（403）。請確認使用正確帳號、Sheets API 已啟用，以及這份試算表的存取權限。" + (detail ? " " + detail : ""));
      throw new Error("Google Sheets 回應 " + response.status + (detail ? "：" + detail : ""));
    }
    return response.json();
  }
  const valuesUrl = range => API + encodeURIComponent(range);
  async function readCell(row, col) {
    const result = await api(valuesUrl(cellAddress(row, col)));
    return String(result.values?.[0]?.[0] ?? "");
  }
  function setCellPhase(input, phase) {
    input.closest(".pin-research-cell").dataset.phase = phase;
  }
  async function saveCell(input) {
    if (!connected()) { setStatus("請先連接 Google。", "warning"); return; }
    const row = +input.dataset.row, col = +input.dataset.col;
    const oldValue = baseline[row]?.[col] ?? "";
    const proposed = input.value;
    if (proposed === oldValue) return;
    if (input.dataset.phase === "saving") return;
    pending++;
    input.disabled = true;
    setCellPhase(input, "saving");
    setStatus("正在儲存至私人 Google 試算表…");
    try {
      const remote = await readCell(row, col);
      if (remote !== oldValue) {
        setCellPhase(input, "conflict");
        setStatus("儲存已停止：Google 試算表的這格內容已被其他地方修改。請先複製您的文字，再按「重新讀取」比較。", "warning");
        return;
      }
      await api(valuesUrl(cellAddress(row, col)) + "?valueInputOption=RAW", {
        method: "PUT", body: JSON.stringify({values: [[proposed]]})
      });
      baseline[row][col] = proposed;
      setCellPhase(input, "saved");
      setStatus("已儲存至私人 Google 試算表。", "success");
    } catch (error) {
      setCellPhase(input, "error");
      setStatus("尚未儲存：" + error.message, "error");
    } finally {
      pending--;
      input.disabled = false;
    }
  }
  function render() {
    table.replaceChildren();
    const thead = el("thead");
    const headRow = el("tr");
    COLS.forEach(index => headRow.append(el("th", "", baseline[0]?.[index] || columnName(index))));
    thead.append(headRow);
    const tbody = el("tbody");
    for (let row = 1; row < baseline.length; row++) {
      const tr = el("tr");
      for (const col of COLS) {
        const td = el("td", "pin-research-cell");
        const value = baseline[row][col];
        const multi = [2, 5, 6, 7].includes(col);
        const input = el(multi ? "textarea" : "input", "pin-research-cell-input");
        if (!multi) input.type = "text";
        if (multi) input.rows = 2;
        input.value = value;
        input.dataset.row = String(row);
        input.dataset.col = String(col);
        input.dataset.researchCell = "1";
        input.setAttribute("aria-label", "第 " + (row + 1) + " 列：" + (baseline[0]?.[col] || columnName(col)));
        input.spellcheck = true;
        if (col === 4) input.placeholder = "https://";
        if (col === 5) input.placeholder = "記下您的觀察或想問 PR 的問題";
        if (col === 6) input.placeholder = "由 PR 在 ChatGPT 中讀取、研究後填寫";
        if (col === 7) input.placeholder = "整理已確認的結論";
        input.addEventListener("change", () => saveCell(input));
        if (multi) input.addEventListener("keydown", e => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); input.blur(); }
        });
        td.append(input);
        if (col === 4) {
          const link = el("a", "pin-research-source-link", "開啟來源 ↗");
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          function updateLink() {
            const href = validateLink(input.value.trim());
            link.hidden = !href;
            if (href) link.href = href;
            else link.removeAttribute("href");
          }
          input.addEventListener("input", updateLink);
          updateLink();
          td.append(link);
        }
        tr.append(td);
      }
      tbody.append(tr);
    }
    table.append(thead, tbody);
    count.textContent = Math.max(0, baseline.length - 1) + " 項研究紀錄";
  }
  async function load() {
    setStatus("讀取私人研究資料中…");
    try {
      const result = await api(valuesUrl(SHEET_RANGE + "A1:H1000"));
      const data = result.values || [];
      if (!data.length) throw new Error("Google 試算表沒有資料。");
      baseline = data.map(normalized);
      render();
      setStatus("已讀取私人資料；編輯欄位後離開欄位即自動儲存。", "success");
      showAuthenticated(true);
    } catch (error) { setStatus("無法載入：" + error.message, "error"); }
  }
  async function addResearchRow() {
    if (!connected() || !canRefresh()) return;
    addButton.disabled = true;
    setStatus("正在新增研究紀錄…");
    try {
      const category = addCategory.value;
      await api(valuesUrl(SHEET_RANGE + "A:H") + ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS", {
        method: "POST",
        body: JSON.stringify({values: [[category, "新研究項目", "", "待研究", "", "", "", ""]]})
      });
      await load();
      setStatus("已新增研究項目，可以直接編輯標題與備註。", "success");
    } catch (error) { setStatus("新增失敗：" + error.message, "error"); }
    finally { addButton.disabled = false; }
  }
  function oauthReady() {
    return !!window.google?.accounts?.oauth2?.initTokenClient;
  }
  connectButton.addEventListener("click", () => {
    const clientId = clientInput.value.trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
      setStatus("請先輸入 Google Cloud 的網頁應用程式 OAuth Client ID。", "warning");
      clientInput.focus();
      return;
    }
    if (!oauthReady()) {
      setStatus("Google 登入程式尚未載入。請稍候再按連接，或確認瀏覽器未封鎖 Google 登入服務。", "error");
      return;
    }
    try {
      localStorage.setItem(CLIENT_KEY, clientId); // An OAuth client ID is public, never a secret.
      if (!oauthClient || clientId !== lastClientId) {
        lastClientId = clientId;
        oauthClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId, scope: SCOPE,
          callback: async response => {
            if (response.error || !response.access_token) {
              setStatus("Google 授權未完成：" + (response.error_description || response.error || "未收到存取權杖"), "error");
              return;
            }
            if (!response.scope?.split(/\s+/).includes(SCOPE)) {
              setStatus("Google 未授予試算表編輯權限。", "error");
              return;
            }
            token = response.access_token; // Memory only, never localStorage or public GitHub.
            tokenExpiry = Date.now() + Math.max(0, Number(response.expires_in || 3300) - 60) * 1000;
            await load();
          },
          error_callback: err => setStatus("Google 登入未完成：" + (err.type || "視窗已關閉或遭封鎖"), "warning")
        });
      }
      setStatus("請在 Google 彈出視窗中選擇帳號並授權。");
      oauthClient.requestAccessToken({prompt: "select_account"});
    } catch (error) { setStatus("登入設定失敗：" + error.message, "error"); }
  });
  logoutButton.addEventListener("click", () => {
    if (pending || unsaved()) {
      setStatus("仍有未完成儲存的欄位，請先處理。", "warning");
      return;
    }
    const previous = token;
    token = "";
    tokenExpiry = 0;
    if (previous && window.google?.accounts?.oauth2?.revoke) {
      google.accounts.oauth2.revoke(previous, () => {});
    }
    showAuthenticated(false);
    setStatus("已從 PIN 斷開 Google 授權；私人資料已從頁面清除。");
  });
  reloadButton.addEventListener("click", () => { if (canRefresh()) load(); });
  addButton.addEventListener("click", addResearchRow);
  window.addEventListener("pagehide", () => { token = ""; });
  showAuthenticated(false);
  setStatus("私人研究資料不會在未登入時載入。請設定 OAuth Client ID 後連接 Google。");
})();