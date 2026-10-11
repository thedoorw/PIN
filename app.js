"use strict";
// Public catalog metadata is served from the GitHub-sourced projection.
// Visitor notes and rejection marks never leave this browser.
const STORAGE_KEY = "ink-visual-catalog:annotations:v1";
const root = document.getElementById("cards");
const counter = document.getElementById("counter");
const search = document.getElementById("q");
const excludedCount = document.getElementById("excludedCount");
const accessSelect = document.getElementById("access-filter");
const imageSelect = document.getElementById("image-filter");
const testSelect = document.getElementById("test-filter");
const hideExcluded = document.getElementById("hide-excluded");
const statusLine = document.getElementById("saved-state");
let items = [], type = "ALL", term = "", access = "all", test = "all", imageMode = "pictured", visibleLimit = 40;
const selectedStyles = new Set();
const loadMore = document.getElementById("load-more");
let annotations = Object.create(null);
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_DB_NAME = "ink-visual-catalog:private-thumbnails:v1";
let imageDatabasePromise = null;
const localImageIds = new Set();
const localObjectUrls = new Map();
function imageDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("此瀏覽器不支援本機圖片儲存"));
  if (!imageDatabasePromise) imageDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("images");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("無法開啟本機圖片資料庫"));
  });
  return imageDatabasePromise;
}
async function imageStore(method, id, value) {
  const db = await imageDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", method === "get" || method === "keys" ? "readonly" : "readwrite");
    const store = tx.objectStore("images");
    let req;
    if (method === "get") req = store.get(id);
    if (method === "keys") req = store.getAllKeys();
    if (method === "put") req = store.put(value, id);
    if (method === "delete") req = store.delete(id);
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error || new Error("本機圖片存取失敗"));
    tx.onabort = () => reject(tx.error || new Error("本機圖片存取中斷"));
  });
}
function clearLocalObjectUrl(id) {
  const url = localObjectUrls.get(id);
  if (url) URL.revokeObjectURL(url);
  localObjectUrls.delete(id);
}
async function getLocalObjectUrl(id) {
  if (localObjectUrls.has(id)) return localObjectUrls.get(id);
  const record = await imageStore("get", id);
  if (!record?.blob) throw new Error("找不到已儲存的本機圖片");
  const url = URL.createObjectURL(record.blob);
  localObjectUrls.set(id, url);
  return url;
}
function isAllowedImage(file) {
  return file && ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) && file.size > 0 && file.size <= IMAGE_MAX_BYTES;
}
function isValidImageUrl(value) {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}
function currentImageAvailable(item) {
  return localImageIds.has(item.id) || !!getAnnotation(item.id).imageUrl || !!item.image;
}
function syncImageCount() {
  const label = document.getElementById("thumbnailCount");
  if (label) label.textContent = items.filter(currentImageAvailable).length;
}
function fileAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const make = (tag, cls, value) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (value !== undefined) el.textContent = String(value);
  return el;
};
function loadAnnotations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(parsed)) {
        if (!/^[A-Z0-9_-]{2,30}$/.test(key) || !value || typeof value !== "object") continue;
        annotations[key] = { rejected: value.rejected === true, note: String(value.note || "").slice(0, 1200), imageUrl: isValidImageUrl(value.imageUrl || "") ? String(value.imageUrl).slice(0, 2048) : "" };
      }
    }
  } catch {
    statusLine.textContent = "目前無法讀取本機備註；可先使用匯入功能";
  }
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    statusLine.textContent = "標記和備註已儲存於這個瀏覽器（未公開）";
  } catch {
    statusLine.textContent = "無法儲存至本機；請使用匯出備份避免遺失";
  }
}
function getAnnotation(id) {
  return annotations[id] || { rejected: false, note: "", imageUrl: "" };
}
function updateCounts() {
  excludedCount.textContent = items.filter(x => getAnnotation(x.id).rejected).length;
}
function galleryImageKey(item) {
  // Keep the source artwork identity stable if a personal thumbnail overrides an image.
  if(item.image)return "image:"+String(item.image).trim().replace(/^http:/,"https:");
  const source=String(item.url||"").trim().toLowerCase().replace(/\/$/,"");
  return source?"reference:"+source:"record:"+item.id;
}
function imagePriority(item) {
  const typeWeight = { MATURE: 700, ATN: 600, RECIPE: 560, JSX: 500, SCRIPT: 410, WORKFLOW: 350, SUPPORT: 100 };
  const evidenceWeight = { SOURCE_ORIGINAL_IMAGE: 60, SOURCE_PAGE_OG: 50, SOURCE_README: 45, RESEARCH_SHEET_PREVIEW: 40, SOURCE_COLLECTION: 20, RESEARCH_COVER: 10 };
  return (typeWeight[item.type] || 200) + (evidenceWeight[item.imageEvidence] || 0);
}
function cardImageAvailable(item) {
  return currentImageAvailable(item);
}
function buildCard(item, related = [item]) {
  const annotation = getAnnotation(item.id);
  const card = make("article", "card" + (annotation.rejected ? " is-excluded" : ""));
  const art = make("div", "art" + (!currentImageAvailable(item) ? " no-image" : ""));
  art.append(make("span", "chip", item.type));
  const primaryStyle = (item.styleTags || []).find(tag => tag !== "其他");
  if (primaryStyle) {
    const styleBadge = make("span", "style-badge", primaryStyle);
    styleBadge.title = "主要視覺風格（暫定分類）";
    art.append(styleBadge);
  }
  const personalUrl = annotation.imageUrl || "";
  const personalFile = localImageIds.has(item.id);
  const chosenUrl = personalFile ? null : (personalUrl || item.image);
  const showcase=isValidImageUrl(item.showcaseUrl||"")?item.showcaseUrl:"";
  if(personalFile||chosenUrl) {
    const img=document.createElement("img");
    img.alt=(personalFile||personalUrl?"我的個人縮圖":(item.credit||"來源圖片"))+" 預覽";
    img.loading="lazy";
    img.onerror=()=>{img.remove();art.append(make("div","pending","圖片無法載入，可更換縮圖"));};
    if(showcase){
      const link=make("a","preview-link");
      link.href=showcase;link.target="_blank";link.rel="noopener noreferrer";
      link.title="查看原始作品："+item.title;
      link.setAttribute("aria-label","開啟原始作品："+item.title);
      link.append(img);art.append(link);
    }else art.append(img);
    if(personalFile){
      getLocalObjectUrl(item.id).then(url=>{if(card.isConnected)img.src=url;})
        .catch(()=>{if(card.isConnected)art.append(make("div","pending","本機縮圖無法讀取"));});
    }else img.src=chosenUrl;
    art.append(make("span","source-image-type",personalFile?"我的縮圖":personalUrl?"我的圖片網址":item.imageEvidence==="SOURCE_COLLECTION"?"來源總覽":item.imageEvidence==="RESEARCH_SHEET_PREVIEW"?"研究示意":"原作預覽"));
  }else{
    const empty=make("div","image-empty");
    empty.append(make("div","pending","尚無作品預覽"));
    if(showcase){
      const open=make("a","source-only","查看原始示範 ↗");
      open.href=showcase;open.target="_blank";open.rel="noopener noreferrer";
      empty.append(open);
    }else empty.append(make("span","pending","技術來源請展開資料"));
    art.append(empty);
  }
  const changeImage = make("button", "image-edit-trigger", personalFile || personalUrl ? "更換縮圖" : (!item.image ? "＋ 加入縮圖" : "自選縮圖"));
  changeImage.type = "button";
  art.append(changeImage);
  card.append(art);
  const body = make("div", "cardbody");
  body.append(make("div", "name", item.title));
  const line = make("div", "cardline");
  line.append(make("span", "", item.id));

  body.append(line);
  const detail = make("details", "card-detail");
  const summary = make("summary", "detail-toggle", "詳細資料 ▾");
  detail.append(summary);
  const detailBody = make("div", "detail-body");
  const styleTags = Array.isArray(item.styleTags) ? item.styleTags : [];
  if (styleTags.length) {
    const styleGroup = make("div", "detail-style-tags");
    styleGroup.append(make("span", "detail-meta-label", "視覺風格／題材"));
    styleTags.forEach(tag => styleGroup.append(make("span", "detail-style-tag", tag)));
    detailBody.append(styleGroup);
  }
  if (related.length > 1 || related.some(x => getAnnotation(x.id).note.trim())) {
    const meta = make("div", "detail-record-meta");
    if (related.length > 1) meta.append(make("span", "related-tag", "關聯 " + related.length + " 筆研究"));
    if (related.some(x => getAnnotation(x.id).note.trim())) meta.append(make("span", "saved-tag", "已有備註"));
    detailBody.append(meta);
  }
  const editor = make("div", "image-editor");
  editor.hidden = true;
  editor.append(make("div", "image-editor-heading", "我的縮圖（僅儲存在本瀏覽器）"));
  const upload = make("button", "image-upload", "從電腦選擇圖片");
  upload.type = "button";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";
  fileInput.hidden = true;
  editor.append(upload, fileInput);
  const imageUrlInput = document.createElement("input");
  imageUrlInput.className = "image-url-input";
  imageUrlInput.type = "url";
  imageUrlInput.placeholder = "或貼上圖片網址（https://…）";
  imageUrlInput.setAttribute("aria-label", item.title + " 的縮圖網址");
  imageUrlInput.value = annotation.imageUrl || "";
  const saveImageUrl = make("button", "image-save-url", "套用網址");
  saveImageUrl.type = "button";
  editor.append(imageUrlInput, saveImageUrl);
  if (personalFile || personalUrl) {
    const reset = make("button", "image-reset", "移除自選縮圖");
    reset.type = "button";
    editor.append(reset);
    reset.addEventListener("click", async () => {
      try {
        if (localImageIds.has(item.id)) {
          await imageStore("delete", item.id);
          localImageIds.delete(item.id);
          clearLocalObjectUrl(item.id);
        }
        const previous = getAnnotation(item.id);
        annotations[item.id] = { ...previous, imageUrl: "" };
        persist(); render();
        statusLine.textContent = "已移除自選縮圖，保留原作及原有備註";
      } catch (error) { statusLine.textContent = "圖片移除失敗：" + error.message; }
    });
  }
  changeImage.addEventListener("click", () => {
    detail.open = true;
    editor.hidden = !editor.hidden;
    if (!editor.hidden) imageUrlInput.focus();
  });
  upload.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    if (!isAllowedImage(file)) {
      statusLine.textContent = "請選擇 5 MB 以內的 JPG、PNG、WebP 或 GIF";
      return;
    }
    try {
      await imageStore("put", item.id, { blob: file, name: file.name, mime: file.type });
      localImageIds.add(item.id);
      clearLocalObjectUrl(item.id);
      const previous = getAnnotation(item.id);
      annotations[item.id] = { ...previous, imageUrl: "" };
      persist(); render();
      statusLine.textContent = item.id + "：已儲存個人圖片於本瀏覽器，未上傳網站";
    } catch (error) { statusLine.textContent = "儲存失敗：" + error.message; }
  });
  saveImageUrl.addEventListener("click", async () => {
    const url = imageUrlInput.value.trim();
    if (!isValidImageUrl(url)) { statusLine.textContent = "請提供有效的 http／https 圖片網址"; return; }
    try {
      if (localImageIds.has(item.id)) {
        await imageStore("delete", item.id);
        localImageIds.delete(item.id);
        clearLocalObjectUrl(item.id);
      }
      const previous = getAnnotation(item.id);
      annotations[item.id] = { ...previous, imageUrl: url.slice(0, 2048) };
      persist(); render();
      statusLine.textContent = item.id + "：已保存圖片網址於本瀏覽器";
    } catch (error) { statusLine.textContent = "儲存失敗：" + error.message; }
  });
  detailBody.append(editor);
  const pills = make("div", "info-pills");
  const cost = make("span", "info-pill " + (item.access || "unknown"), item.accessLabel || "費用待確認");
  cost.title = item.accessDetail || "費用待確認";
  const testBadge = make("span", "info-pill " + (item.testStatus || "untested"), item.testLabel || "INK 未測試");
  testBadge.title = item.testDetail || "尚無 INK Runtime 證據";
  pills.append(cost, testBadge);
  detailBody.append(pills);
  const details = make("div", "mini-detail", item.testDetail || "");
  detailBody.append(details);
  detailBody.append(make("p", "description", item.description));
  if (!item.image && item.imageMissingReason) detailBody.append(make("div","image-reason",item.imageMissingReason));
  const mark = make("div", "annotation-area");
  const reject = make("label", "reject-label");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = annotation.rejected;
  cb.setAttribute("aria-label", "不考慮：" + item.title);
  reject.append(cb, make("span", "", "不考慮這件作品"));
  mark.append(reject);
  const memoLabel = make("label", "memo-label", "我的備註（僅本機保存）");
  const memo = make("textarea", "memo");
  memo.rows = 2;
  memo.maxLength = 1200;
  memo.placeholder = "不喜歡的原因／希望調整的方向／值得保留的部分…";
  memo.value = annotation.note;
  memo.setAttribute("aria-label", item.title + " 的個人備註");
  memoLabel.append(memo);
  mark.append(memoLabel);
  cb.addEventListener("change", () => {
    const prev = getAnnotation(item.id);
    annotations[item.id] = { ...prev, rejected: cb.checked };
    card.classList.toggle("is-excluded", cb.checked);
    persist();
    updateCounts();
    if (hideExcluded.checked) render();
  });
  memo.addEventListener("input", () => {
    annotations[item.id] = { ...getAnnotation(item.id), rejected: cb.checked, note: memo.value };
    persist();
  });
  detailBody.append(mark);
  detailBody.append(make("div", "credit", item.credit || ""));
  const source = make("a", "link", "查看原始技術／研究資料 ↗");
  if (item.url && item.url !== showcase) {
    source.href=item.url;source.target="_blank";source.rel="noopener noreferrer";
    detailBody.append(source);
  }
  if (related.length > 1) {
    const linked = make("div", "linked-group");
    linked.append(make("strong", "", "相同縮圖／來源的關聯紀錄（" + related.length + " 筆，分別保存備註）"));
    for (const other of related) {
      if (other.id === item.id) continue;
      const r = make("details", "linked-record");
      r.append(make("summary", "", other.id + " · " + other.title));
      const pane = make("div", "linked-record-body");
      pane.append(make("div", "mini-detail", (other.testLabel || "研究候選") + (other.access === "paid" ? " · 付費來源" : "")));
      if (other.url) {
        const a = make("a", "", "查看這筆研究的來源 ↗");
        a.href = other.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        pane.append(a);
      }
      const otherLabel = make("label", "reject-label");
      const otherCheck = document.createElement("input");
      otherCheck.type = "checkbox";
      otherCheck.checked = getAnnotation(other.id).rejected;
      otherLabel.append(otherCheck, make("span", "", "不考慮此研究紀錄"));
      pane.append(otherLabel);
      const otherMemo = make("textarea", "memo");
      otherMemo.rows = 2;
      otherMemo.maxLength = 1200;
      otherMemo.placeholder = "這筆研究的備註…";
      otherMemo.value = getAnnotation(other.id).note;
      otherMemo.setAttribute("aria-label", other.id + " 的備註");
      pane.append(otherMemo);
      otherCheck.addEventListener("change", () => {
        annotations[other.id] = { ...getAnnotation(other.id), rejected: otherCheck.checked };
        persist(); updateCounts();
      });
      otherMemo.addEventListener("input", () => {
        annotations[other.id] = { ...getAnnotation(other.id), note: otherMemo.value };
        persist();
      });
      r.append(pane);
      linked.append(r);
    }
    detailBody.append(linked);
  }
  detail.append(detailBody);
  body.append(detail);
  card.append(body);
  return card;
}
function render() {
  const searchable=items.filter(x=>
    (type==="ALL"||x.type===type) &&
    (access==="all"||(x.access||"unknown")===access) &&
    (imageMode==="all"||(imageMode==="pictured"?currentImageAvailable(x):!currentImageAvailable(x))) &&
    (test==="all"||(x.testStatus||"untested")===test) &&
    (!hideExcluded.checked||!getAnnotation(x.id).rejected) &&
    (!selectedStyles.size||(x.styleTags||[]).some(tag=>selectedStyles.has(tag))) &&
    [x.id,x.title,x.description,x.credit,x.accessLabel,x.testLabel,getAnnotation(x.id).note].join(" ").toLowerCase().includes(term)
  );
  const allByKey=new Map(),grouped=new Map();
  for(const x of items){const key=galleryImageKey(x);if(!allByKey.has(key))allByKey.set(key,[]);allByKey.get(key).push(x);}
  for(const x of searchable){const key=galleryImageKey(x);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(x);}
  const groups=[...grouped.entries()].map(([key,records])=>{
    const candidates=[...records].sort((a,b)=>Number(localImageIds.has(b.id)||!!getAnnotation(b.id).imageUrl)-Number(localImageIds.has(a.id)||!!getAnnotation(a.id).imageUrl)||imagePriority(b)-imagePriority(a));
    return {primary:candidates[0],linked:allByKey.get(key)||records,rank:imagePriority(candidates[0])};
  }).sort((a,b)=>Number(currentImageAvailable(b.primary))-Number(currentImageAvailable(a.primary))||b.rank-a.rank||a.primary.id.localeCompare(b.primary.id));
  counter.textContent=groups.length+" 個 PIN · "+searchable.length+" 筆研究";
  root.replaceChildren();
  const frag=document.createDocumentFragment();
  for(const group of groups.slice(0,visibleLimit))frag.append(buildCard(group.primary,group.linked));
  if(!groups.length)frag.append(make("p","empty","沒有符合篩選條件的作品。可切換「包含無圖」或清除風格篩選。"));
  root.append(frag);
  const rem=Math.max(0,groups.length-visibleLimit);
  loadMore.hidden=rem===0;
  if(rem)loadMore.textContent="再顯示 "+Math.min(40,rem)+" 個 PIN（剩餘 "+rem+"）";
  updateCounts();syncImageCount();
}
function resetFilters() {
  type="ALL";term="";access="all";test="all";imageMode="pictured";visibleLimit=40;
  selectedStyles.clear();search.value="";accessSelect.value="all";testSelect.value="all";imageSelect.value="pictured";
  hideExcluded.checked=false;
  document.querySelectorAll("[data-type]").forEach(b=>{const active=b.dataset.type==="ALL";b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
  document.querySelectorAll("[data-style]").forEach(b=>{const active=b.dataset.style==="全部風格";b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
  render();
}
async function exportNotes() {
  statusLine.textContent = "正在整理備份，包含本機圖片…";
  const images = [];
  try {
    const ids = await imageStore("keys");
    for (const id of ids) {
      // Preserve old locally saved thumbnails even when a paid case is no longer shown.
      if (!/^[A-Z0-9_-]{2,30}$/.test(id)) continue;
      const record = await imageStore("get", id);
      if (record?.blob && isAllowedImage(record.blob))
        images.push({ id, name: String(record.name || "thumbnail").slice(0, 160), dataUrl: await fileAsDataUrl(record.blob) });
    }
  } catch (error) {
    statusLine.textContent = "圖片備份無法讀取：" + error.message;
    return;
  }
  const content = {
    schema: "ink-visual-catalog-annotations-v2",
    exportedAt: new Date().toISOString(),
    entries: annotations,
    images
  };
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const objectURL = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectURL;
  a.download = "ink-visual-catalog-my-notes.json";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
  statusLine.textContent = "已匯出勾選、備註、縮圖網址和 " + images.length + " 張本機圖片；未上傳網站";
}
async function importNotes(file) {
  if (!file || file.size > 150 * 1024 * 1024) {
    statusLine.textContent = "檔案無效或超過 150 MB";
    return;
  }
  try {
    const payload = JSON.parse(await file.text());
    if (!["ink-visual-catalog-annotations-v1", "ink-visual-catalog-annotations-v2"].includes(payload.schema) ||
        !payload.entries || typeof payload.entries !== "object" || Array.isArray(payload.entries))
      throw new Error("格式不符");
    const knownIds = new Set(items.map(x => x.id));
    const staged = [];
    const files = Array.isArray(payload.images) ? payload.images : [];
    for (const picture of files) {
      if (!/^[A-Z0-9_-]{2,30}$/.test(picture.id) || typeof picture.dataUrl !== "string" ||
          !/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(picture.dataUrl)) continue;
      const imageBlob = await (await fetch(picture.dataUrl)).blob();
      if (!isAllowedImage(imageBlob)) throw new Error("備份含有不支援或大於 5 MB 的圖片");
      staged.push({ id: picture.id, blob: imageBlob, name: String(picture.name || "thumbnail").slice(0, 160) });
    }
    // Import valid backups without clearing earlier notes or images for unrelated cases.
    for (const entry of staged) {
      await imageStore("put", entry.id, { blob: entry.blob, name: entry.name, mime: entry.blob.type });
      localImageIds.add(entry.id);
      clearLocalObjectUrl(entry.id);
    }
    let count = 0;
    for (const [id, value] of Object.entries(payload.entries)) {
      if (!/^[A-Z0-9_-]{2,30}$/.test(id) || !value || typeof value !== "object") continue;
      annotations[id] = {
        rejected: value.rejected === true,
        note: String(value.note || "").slice(0, 1200),
        imageUrl: isValidImageUrl(value.imageUrl || "") ? String(value.imageUrl).slice(0, 2048) : ""
      };
      count++;
    }
    persist();
    render();
    statusLine.textContent = "已匯入 " + count + " 筆標記／備註及 " + staged.length + " 張本機圖片";
  } catch (err) {
    statusLine.textContent = "無法匯入：" + err.message;
  }
}
search.addEventListener("input",e=>{term=e.target.value.toLowerCase();visibleLimit=40;render();});
loadMore.addEventListener("click",()=>{visibleLimit+=40;render();});
document.querySelectorAll("[data-type]").forEach(b=>b.addEventListener("click",()=>{
  type=b.dataset.type;visibleLimit=40;
  document.querySelectorAll("[data-type]").forEach(other=>{const active=other===b;other.classList.toggle("active",active);other.setAttribute("aria-pressed",String(active));});
  render();
}));
document.querySelectorAll("[data-style]").forEach(b=>b.addEventListener("click",()=>{
  const t=b.dataset.style;
  if(t==="全部風格")selectedStyles.clear();
  else if(selectedStyles.has(t))selectedStyles.delete(t);
  else selectedStyles.add(t);
  document.querySelectorAll("[data-style]").forEach(other=>{
    const active=other.dataset.style==="全部風格"?!selectedStyles.size:selectedStyles.has(other.dataset.style);
    other.classList.toggle("active",active);other.setAttribute("aria-pressed",String(active));
  });
  visibleLimit=40;render();
}));
document.getElementById("clear-filters").addEventListener("click",resetFilters);
accessSelect.addEventListener("change",e=>{access=e.target.value;visibleLimit=40;render();});
imageSelect.addEventListener("change",e=>{imageMode=e.target.value;visibleLimit=40;render();});
testSelect.addEventListener("change",e=>{test=e.target.value;visibleLimit=40;render();});
hideExcluded.addEventListener("change",render);
document.getElementById("export").addEventListener("click", exportNotes);
const fileField = document.getElementById("import-file");
document.getElementById("import").addEventListener("click", () => fileField.click());
fileField.addEventListener("change", async () => {
  await importNotes(fileField.files[0]);
  fileField.value = "";
});
loadAnnotations();
Promise.all([
  fetch("./catalog/entries.json", { cache: "no-cache" })
    .then(r => { if (!r.ok) throw new Error("catalog HTTP " + r.status); return r.json(); }),
  imageStore("keys").catch(error => {
    statusLine.textContent = "圖片本機儲存暫不可用：" + error.message;
    return [];
  })
]).then(([data, savedImageIds]) => {
  if (!data || !Array.isArray(data.items)) throw new Error("作品資料格式不符");
  items = data.items;
  savedImageIds.forEach(id => localImageIds.add(id));
  document.getElementById("listed").textContent = items.length;
  imageSelect.value="pictured";
  render();
}).catch(err => {
  root.textContent = "型錄資料讀取失敗：" + err.message;
  console.error(err);
});
