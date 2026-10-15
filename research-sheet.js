/* PIN private research board v0.1 — browser OAuth, no public sheet projection. */
(() => {
  "use strict";
  const SHEET_ID = "1xyJdKCScnB4Krq8sdSdqaWIrM4EyCoy1hUbk6QFewD0";
  const SHEET_NAME = "PIN 研究索引";
  const SHEET_RANGE = "'" + SHEET_NAME.replaceAll("'", "''") + "'!";
  const API = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/";
  const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
  const CLIENT_KEY = "pin:research:oauth-client-id:v1";
  const ACCOUNT_HINT_KEY = "pin:research:google-account-hint:v1";
  // Use only the columns currently named in the real Google Sheet header.
  // Never recreate cleared/deleted trailing columns merely because the grid has spare cells.
  let COLS = [];
  const SIZE_KEY = "pin:research:table-size:v3";
  const PREVIOUS_SIZE_KEY = "pin:research:table-size:v2";
  const LEGACY_SIZE_KEY = "pin:research:table-size:v1";
  const LEGACY_COLUMN_ORDER = [1, 0, 5, 6, 7, 2, 3, 4];
  const LEGACY_DEFAULT_WIDTHS = [230, 190, 280, 280, 250, 230, 110, 170];
  const DEFAULT_WIDTHS = [210, 225, 320, 105, 270, 300, 310, 310];
  const DEFAULT_ROW_HEIGHT = 64;
  const clampSize = (v, min, max) => Math.max(min, Math.min(max, v));
  let sizes = {columns: [...DEFAULT_WIDTHS], rows: {}};
  let lastSavedColumnCount = 0;
  try {
    const current = JSON.parse(localStorage.getItem(SIZE_KEY) || "null");
    const previous = current ? null : JSON.parse(localStorage.getItem(PREVIOUS_SIZE_KEY) || "null");
    const legacy = current || previous ? null : JSON.parse(localStorage.getItem(LEGACY_SIZE_KEY) || "null");
    const saved = current || previous || legacy;
    if (saved && typeof saved === "object") {
      if (Array.isArray(saved.columns)) {
        if (legacy && saved.columns.length === LEGACY_COLUMN_ORDER.length) {
          saved.columns.forEach((width, oldPosition) => {
            const sheetIndex = LEGACY_COLUMN_ORDER[oldPosition];
            if (Number.isFinite(width) && width !== LEGACY_DEFAULT_WIDTHS[oldPosition])
              sizes.columns[sheetIndex] = clampSize(width, 90, 760);
          });
        } else {
          saved.columns.forEach((width, sheetIndex) => {
            if (Number.isFinite(width)) sizes.columns[sheetIndex] = clampSize(width, 90, 760);
          });
        }
      }
      if (saved.rows && typeof saved.rows === "object" && !Array.isArray(saved.rows))
        for (const [key, height] of Object.entries(saved.rows))
          if (/^[1-9][0-9]*$/.test(key) && Number.isFinite(height))
            sizes.rows[key] = clampSize(height, 56, 540);
      if (current && Number.isInteger(current.columnCount)) lastSavedColumnCount = current.columnCount;
    }
  } catch {}
  function saveSizes() {
    try { localStorage.setItem(SIZE_KEY, JSON.stringify({...sizes, columnCount: COLS.length})); }
    catch { setStatus("此瀏覽器無法保存欄寬與列高設定。", "warning"); }
  }
  function rowHeight(index) { return sizes.rows[index] || DEFAULT_ROW_HEIGHT; }
  function applyTableWidth() {
    table.style.width = COLS.reduce((sum, index) => sum + (sizes.columns[index] || DEFAULT_WIDTHS[index] || 180), 0) + "px";
  }
  function fitVisibleColumnsToFrame() {
    // Fit the actual sheet columns once after the column count changes.
    // User-drags afterward may deliberately make the table horizontally scrollable.
    const frame = document.querySelector(".pin-research-scroller");
    const space = Math.floor((frame?.clientWidth || 0) - 2);
    if (space <= 0 || !COLS.length) return;
    const widths = COLS.map(index => sizes.columns[index] || DEFAULT_WIDTHS[index] || 180);
    const minimum = COLS.map(index => index === 3 ? 88 : 105);
    const floorTotal = minimum.reduce((a, b) => a + b, 0);
    if (space <= floorTotal) return; // Narrow screens need horizontal scrolling.
    const total = widths.reduce((a, b) => a + b, 0);
    const excess = Math.max(0, total - floorTotal);
    const availableExcess = space - floorTotal;
    const resized = widths.map((width, i) => {
      const weight = excess > 0 ? Math.max(0, width - minimum[i]) / excess : 1 / widths.length;
      return Math.round(minimum[i] + weight * availableExcess);
    });
    const remainder = space - resized.reduce((a, b) => a + b, 0);
    resized[resized.length - 1] += remainder;
    COLS.forEach((index, i) => { sizes.columns[index] = resized[i]; });
  }
    function applyRowHeight(tr, index) {
    tr.style.setProperty("--pin-research-row-height", rowHeight(index) + "px");
  }
  function changeColumnWidth(index, width) {
    sizes.columns[index] = clampSize(width, 110, 760);
    const col = table.querySelector("colgroup")?.children[index];
    if (col) col.style.width = sizes.columns[index] + "px";
    applyTableWidth();
  }
  function changeRowHeight(index, height) {
    const value = clampSize(height, 56, 540);
    if (value === DEFAULT_ROW_HEIGHT) delete sizes.rows[index];
    else sizes.rows[index] = value;
    const tr = table.querySelector('tr[data-research-row="' + index + '"]');
    if (tr) applyRowHeight(tr, index);
  }
  function beginResize(e, axis, getValue, updateValue) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const start = axis === "x" ? e.clientX : e.clientY;
    const origin = getValue();
    const activeBoundary = e.currentTarget.closest(axis === "x" ? "th" : "tr");
    activeBoundary?.classList.add(axis === "x" ? "pin-research-dragging-column" : "pin-research-dragging-row");
    document.documentElement.classList.add("pin-research-is-resizing");
    const move = ev => {
      const coordinate = axis === "x" ? ev.clientX : ev.clientY;
      updateValue(origin + coordinate - start);
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      document.documentElement.classList.remove("pin-research-is-resizing");
      activeBoundary?.classList.remove(axis === "x" ? "pin-research-dragging-column" : "pin-research-dragging-row");
      saveSizes();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  }

  const root = document.getElementById("pin-private-research");
  if (!root) return;
  const clientInput = document.getElementById("pin-research-client-id");
  const accountInput = document.getElementById("pin-research-account-hint");
  const connectButton = document.getElementById("pin-research-connect");
  // Keep Google revocation in the global settings menu, not above the research table.
  const researchSettings = document.createElement("details");
  researchSettings.className = "pin-settings-section";
  researchSettings.id = "pin-research-auth-settings";
  researchSettings.hidden = true;
  const researchSettingsLabel = document.createElement("summary");
  researchSettingsLabel.textContent = "研究文件授權";
  const logoutButton = document.createElement("button");
  logoutButton.type = "button";
  logoutButton.id = "pin-research-disconnect";
  logoutButton.textContent = "斷開 Google 授權";
  logoutButton.hidden = true;
  researchSettings.append(researchSettingsLabel, logoutButton);
  document.querySelector(".site-settings-sheet")?.append(researchSettings);
  const reloadButton = document.getElementById("pin-research-reload");
  const resetSizesButton = document.getElementById("pin-research-reset-size");
  const addButton = document.getElementById("pin-research-add");
  const addCategory = document.getElementById("pin-research-new-category");
  const statusLabel = document.getElementById("pin-research-status");
  const boardStatusLabel = document.getElementById("pin-research-board-status");
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

  const configuration = document.getElementById("pin-research-configuration");
  const returningNote = document.getElementById("pin-research-returning-note");
  let savedClientId = "";
  try { savedClientId = localStorage.getItem(CLIENT_KEY) || ""; } catch {}
  clientInput.value = savedClientId;
  try { accountInput.value = localStorage.getItem(ACCOUNT_HINT_KEY) || ""; } catch {}
  accountInput.addEventListener("change", () => {
    const email = accountInput.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("帳號提示不是有效的電子郵件格式，請修正或清空。", "warning");
      return;
    }
    try {
      if (email) localStorage.setItem(ACCOUNT_HINT_KEY, email);
      else localStorage.removeItem(ACCOUNT_HINT_KEY);
    } catch { setStatus("此瀏覽器無法儲存常用帳號；這次連接仍可使用。", "warning"); }
  });
  function syncConnectionSetup() {
    const remembered = !!savedClientId && clientInput.value.trim() === savedClientId;
    returningNote.hidden = !remembered;
    connectButton.textContent = remembered ? "開啟私人研究畫板" : "連接 Google（讀取／編輯）";
  }
  configuration.open = !savedClientId;
  clientInput.addEventListener("input", syncConnectionSetup);
  syncConnectionSetup();
  function setStatus(message, kind = "") {
    statusLabel.textContent = message;
    statusLabel.dataset.kind = kind;
    // On the connected board, progress and errors stay in the existing controls row.
    boardStatusLabel.textContent = message;
    boardStatusLabel.dataset.kind = kind;
    boardStatusLabel.title = message;
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
    return COLS.map(i => String(row?.[i] ?? ""));
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
    researchSettings.hidden = !isAuthenticated;
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
    const colgroup = el("colgroup");
    COLS.forEach((_, i) => {
      const col = el("col");
      col.style.width = sizes.columns[i] + "px";
      colgroup.append(col);
    });
    table.append(colgroup);
    applyTableWidth();
    const thead = el("thead");
    const headRow = el("tr");
    COLS.forEach((index, i) => {
      const th = el("th", "", baseline[0]?.[index] || columnName(index));
      const handle = el("button", "pin-research-col-resize");
      handle.type = "button";
      handle.title = "拖曳調整欄寬；方向鍵微調";
      handle.setAttribute("aria-label", (baseline[0]?.[index] || columnName(index)) + "：調整欄寬");
      handle.addEventListener("pointerdown", e => beginResize(e, "x", () => sizes.columns[i], width => changeColumnWidth(i, width)));
      handle.addEventListener("keydown", e => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        changeColumnWidth(i, sizes.columns[i] + (e.key === "ArrowRight" ? 10 : -10));
        saveSizes();
      });
      th.append(handle);
      headRow.append(th);
    });
    thead.append(headRow);
    const tbody = el("tbody");
    for (let row = 1; row < baseline.length; row++) {
      const tr = el("tr");
      tr.dataset.researchRow = String(row);
      applyRowHeight(tr, row);
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
        input.addEventListener("change", () => saveCell(input));
        if (multi) input.addEventListener("keydown", e => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); input.blur(); }
        });
        td.append(input);
        {
          // The visible row border is also the resize target in every column.
          const handle = el("button", "pin-research-row-resize");
          if (col !== COLS[0]) handle.tabIndex = -1;
          handle.type = "button";
          handle.title = "拖曳調整這一列高度；方向鍵微調";
          handle.setAttribute("aria-label", "第 " + (row + 1) + " 列：調整列高");
          handle.addEventListener("pointerdown", e => beginResize(e, "y", () => rowHeight(row), height => changeRowHeight(row, height)));
          handle.addEventListener("keydown", e => {
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            e.preventDefault();
            changeRowHeight(row, rowHeight(row) + (e.key === "ArrowDown" ? 10 : -10));
            saveSizes();
          });
          td.append(handle);
        }
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
      const result = await api(valuesUrl(SHEET_RANGE + "1:1000"));
      const data = result.values || [];
      if (!data.length) throw new Error("Google 試算表沒有資料。");
      // Google Sheets typically omits trailing empty cells in each values row.
      // Only headers with actual names define the visible columns; spare grid columns are ignored.
      const headers = data[0] || [];
      let lastNamed = headers.length - 1;
      while (lastNamed >= 0 && !String(headers[lastNamed] ?? "").trim()) lastNamed--;
      if (lastNamed < 0) throw new Error("試算表第一列沒有欄位名稱。");
      if (lastNamed >= 26) throw new Error("研究表格暫時支援 A～Z 欄。");
      COLS = Array.from({length: lastNamed + 1}, (_, i) => i);
      baseline = data.map(normalized);
      if (lastSavedColumnCount !== COLS.length) {
        fitVisibleColumnsToFrame();
        saveSizes();
        lastSavedColumnCount = COLS.length;
      }
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
      if (!COLS.length) throw new Error("請先載入試算表欄位。");
      const lastColumn = columnName(COLS[COLS.length - 1]);
      const newRow = COLS.map(index =>
        index === 0 ? category : index === 1 ? "新研究項目" : index === 3 ? "待研究" : "");
      await api(valuesUrl(SHEET_RANGE + "A:" + lastColumn) + ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS", {
        method: "POST",
        body: JSON.stringify({values: [newRow]})
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
    const accountHint = accountInput.value.trim();
    if (accountHint && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountHint)) {
      setStatus("常用 Google 帳號格式不正確；請修正或清空後再連接。", "warning");
      accountInput.focus();
      return;
    }
    try {
      if (accountHint) localStorage.setItem(ACCOUNT_HINT_KEY, accountHint);
      else localStorage.removeItem(ACCOUNT_HINT_KEY);
    } catch {}
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
      try {
        localStorage.setItem(CLIENT_KEY, clientId); // Client ID is public, unlike an access token.
        savedClientId = clientId;
      } catch {
        setStatus("此瀏覽器拒絕儲存設定；本次仍可登入，下次可能須重新填寫 Client ID。", "warning");
      }
      syncConnectionSetup();
      if (!oauthClient || clientId !== lastClientId) {
        lastClientId = clientId;
        oauthClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId, scope: SCOPE, prompt: "",
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
      setStatus(accountHint ? "正在使用常用 Google 帳號提示恢復授權；必要時仍需在 Google 確認。" : "正在恢復 Google 存取授權；必要時請在彈出視窗確認帳號。");
      oauthClient.requestAccessToken(accountHint ? {prompt: "", login_hint: accountHint} : {prompt: ""});
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
  resetSizesButton.addEventListener("click", () => {
    sizes = {columns: [...DEFAULT_WIDTHS], rows: {}};
    fitVisibleColumnsToFrame();
    for (let i = 0; i < COLS.length; i++) changeColumnWidth(i, sizes.columns[COLS[i]]);
    table.querySelectorAll("tr[data-research-row]").forEach(tr =>
      applyRowHeight(tr, Number(tr.dataset.researchRow)));
    saveSizes();
    setStatus("已還原預設欄寬與列高（僅影響此瀏覽器）。", "success");
  });
  addButton.addEventListener("click", addResearchRow);
  window.addEventListener("pagehide", () => { token = ""; tokenExpiry = 0; showAuthenticated(false); });
  showAuthenticated(false);
  setStatus(savedClientId ? "重新整理後只需按一次「開啟私人研究畫板」；為保護私人資料，不會長期儲存 Google 存取權杖。" : "首次連接請在下方設定 OAuth Client ID。");
})();