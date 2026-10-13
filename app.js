"use strict";
// Public catalog metadata is served from the GitHub-sourced projection.
// Visitor notes and rejection marks never leave this browser.

// Browser-local trash: public GitHub Pages cannot modify the canonical catalog.
// This keeps removal decisions reversible and exportable without storing credentials.
const PIN_TRASH_KEY = "pin:trash:v1";
let pinTrash = (() => { try { const x=JSON.parse(localStorage.getItem(PIN_TRASH_KEY)||"{}"); return x&&typeof x==="object"&&!Array.isArray(x)?x:{}; } catch { return {}; } })();
let showingTrash=false;
const selectedPins = new Set();
let visibleGroupMembers = new Map();
function syncBatchButton() {
  const btn=document.getElementById("pin-trash-batch");
  if(!btn)return;
  btn.textContent=(showingTrash?"批次還原":"移至已刪除區")+"（"+selectedPins.size+"）";
  btn.disabled=selectedPins.size===0;
}
function savePinTrash() {
  try { localStorage.setItem(PIN_TRASH_KEY, JSON.stringify(pinTrash)); }
  catch(e) { statusLine.textContent="無法儲存已刪除區："+e.message; }
}
function updateTrashCounter() {
  const count=document.getElementById("pin-trash-count");
  if(count)count.textContent=Object.keys(pinTrash).filter(id=>items.some(x=>x.id===id)).length;
}
function archivePin(id) {
  const item=items.find(x=>x.id===id); if(!item)return;
  pinTrash[id]={at:new Date().toISOString(),title:item.title};
  savePinTrash(); render();
}
function restorePin(id) { delete pinTrash[id]; savePinTrash(); render(); }
function processSelectedPins() {
  if(!selectedPins.size)return;
  const affected=new Set();
  for(const primary of selectedPins) for(const id of visibleGroupMembers.get(primary)||[primary]) affected.add(id);
  const at=new Date().toISOString();
  for(const id of affected){
    if(showingTrash)delete pinTrash[id];
    else {const item=items.find(x=>x.id===id);if(item)pinTrash[id]={at,title:item.title};}
  }
  const count=selectedPins.size,operation=showingTrash?"還原":"移至已刪除區";
  selectedPins.clear();savePinTrash();render();
  statusLine.textContent="已批次"+operation+" "+count+" 個 PIN（"+affected.size+" 筆研究）";
}
function exportTrashManifest() {
  const records=items.filter(x=>pinTrash[x.id]).map(x=>({id:x.id,title:x.title,url:x.url,deletedAt:pinTrash[x.id].at}));
  const blob=new Blob([JSON.stringify({schema:"pin-trash-request-v1",exportedAt:new Date().toISOString(),items:records},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="PIN-已刪除區-GitHub刪除清單.json";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  statusLine.textContent="已匯出 "+records.length+" 筆待 GitHub 正式刪除清單；尚未修改 GitHub";
}

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
let items = [], type = "ALL", term = "", access = "all", test = "all", imageMode = "all", visibleLimit = 40;
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
    styleBadge.title = "主要視覺風格";
    art.append(styleBadge);
  }
  const personalFile = localImageIds.has(item.id);
  const personalUrl = annotation.imageUrl || "";
  const imageUrl = personalFile ? null : (personalUrl || item.image);
  const showcase = isValidImageUrl(item.showcaseUrl || "") ? item.showcaseUrl : "";
  const artworkTarget = showcase || (isValidImageUrl(item.url || "") ? item.url : "");
  if (personalFile || imageUrl) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = item.title + " — 作品預覽";
    img.onerror = () => { img.remove(); art.append(make("span", "pending", "預覽無法載入")); };
    if (artworkTarget) {
      const preview = make("a", "preview-link");
      preview.href = artworkTarget;
      preview.target = "_blank";
      preview.rel = "noopener noreferrer";
      preview.setAttribute("aria-label", "開啟作品來源：" + item.title);
      preview.append(img);
      art.append(preview);
    } else art.append(img);
    if (personalFile) {
      getLocalObjectUrl(item.id).then(url => {
        if (card.isConnected) img.src = url;
      }).catch(() => {
        if (card.isConnected) art.append(make("span", "pending", "個人縮圖無法載入"));
      });
    } else img.src = imageUrl;
    art.append(make("span", "source-image-type",
      personalFile ? "我的縮圖" : personalUrl ? "自選網址" : item.imageEvidence === "SOURCE_COLLECTION" ? "來源總覽" : item.imageEvidence === "RESEARCH_SHEET_PREVIEW" ? "研究示意" : "原作預覽"));
  } else {
    const empty = make("div", "image-empty");
    empty.append(make("span", "pending", "尚無作品預覽"));
    if (artworkTarget) {
      const link = make("a", "source-only", "查看技術來源 ↗");
      link.href = artworkTarget;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      empty.append(link);
    }
    art.append(empty);
  }
  card.append(art);
  const body = make("div", "cardbody");
  body.append(make("div", "name", item.title));
  const line = make("div", "cardline");
  line.append(make("span", "pin-id", item.id));
  const pick=document.createElement("input");
  pick.type="checkbox";pick.className="pin-batch-select";
  pick.checked=selectedPins.has(item.id);
  pick.title=showingTrash?"選取以批次還原":"選取以批次移至已刪除區";
  pick.setAttribute("aria-label",(showingTrash?"選取還原：":"選取刪除：")+item.title);
  pick.addEventListener("change",()=>{if(pick.checked)selectedPins.add(item.id);else selectedPins.delete(item.id);syncBatchButton();});
  line.append(pick);
  body.append(line);
  const detail = make("details", "card-detail");
  detail.append(make("summary", "detail-toggle", "來源"));
  const detailBody = make("div", "detail-body");
  const seen = new Set();
  const sources = [item, ...related.filter(record => record.id !== item.id)];
  for (const record of sources) {
    const url = isValidImageUrl(record.url || "") ? record.url : "";
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const label = sources.length > 1 ? "來源 · " + record.id + " ↗" : "開啟原始來源 ↗";
    const anchor = make("a", "pin-source-link", label);
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    detailBody.append(anchor);
  }
  if (!seen.size) detailBody.append(make("span", "pin-source-empty", "來源待補"));
  detail.append(detailBody);
  body.append(detail);
  card.append(body);
  return card;
}
function render() {
  const searchable=items.filter(x=>
    Boolean(pinTrash[x.id]) === showingTrash &&
    (type==="ALL" || (type==="MATURE" ? x.type==="MATURE" : (x.styleTags||[]).includes(type==="POSTER"?"海報":"字體"))) &&
    (access==="all"||(x.access||"unknown")===access) &&
    (imageMode==="all"||(imageMode==="pictured"?currentImageAvailable(x):!currentImageAvailable(x))) &&
    (test==="all"||(x.testStatus||"untested")===test) &&
    (!hideExcluded.checked||!getAnnotation(x.id).rejected) &&
    [x.id,x.title,x.description,x.credit,x.accessLabel,x.testLabel,getAnnotation(x.id).note].join(" ").toLowerCase().includes(term)
  );
  const allByKey=new Map(),grouped=new Map();
  for(const x of items){const key=galleryImageKey(x);if(!allByKey.has(key))allByKey.set(key,[]);allByKey.get(key).push(x);}
  for(const x of searchable){const key=galleryImageKey(x);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(x);}
  const groups=[...grouped.entries()].map(([key,records])=>{
    const candidates=[...records].sort((a,b)=>Number(localImageIds.has(b.id)||!!getAnnotation(b.id).imageUrl)-Number(localImageIds.has(a.id)||!!getAnnotation(a.id).imageUrl)||imagePriority(b)-imagePriority(a));
    return {primary:candidates[0],linked:allByKey.get(key)||records,rank:imagePriority(candidates[0])};
  }).sort((a,b)=>Number(/^R-PDE-00[1-3]$/.test(b.primary.id))-Number(/^R-PDE-00[1-3]$/.test(a.primary.id))||Number(currentImageAvailable(b.primary))-Number(currentImageAvailable(a.primary))||b.rank-a.rank||a.primary.id.localeCompare(b.primary.id));
  counter.textContent=groups.length+" 個 PIN · "+searchable.length+" 筆研究";
  visibleGroupMembers=new Map(groups.slice(0,visibleLimit).map(group=>[group.primary.id,group.linked.filter(x=>Boolean(pinTrash[x.id])===showingTrash).map(x=>x.id)]));
  for(const id of [...selectedPins])if(!visibleGroupMembers.has(id))selectedPins.delete(id);
  root.replaceChildren();
  const frag=document.createDocumentFragment();
  for(const group of groups.slice(0,visibleLimit))frag.append(buildCard(group.primary,group.linked));
  if(!groups.length)frag.append(make("p","empty","沒有符合篩選條件的作品。可切換「包含無圖」或清除風格篩選。"));
  root.append(frag);
  const rem=Math.max(0,groups.length-visibleLimit);
  loadMore.hidden=rem===0;
  if(rem)loadMore.textContent="再顯示 "+Math.min(40,rem)+" 個 PIN（剩餘 "+rem+"）";
  updateCounts();syncImageCount();updateTrashCounter();syncBatchButton();
}
function resetFilters() {
  type="ALL";term="";access="all";test="all";imageMode="all";visibleLimit=40;
  search.value="";accessSelect.value="all";testSelect.value="all";imageSelect.value="all";
  hideExcluded.checked=false;showingTrash=false;selectedPins.clear();document.getElementById("pin-trash-toggle").textContent="已刪除區";
  document.querySelectorAll("[data-type]").forEach(b=>{
    const active=b.dataset.type==="ALL";
    b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));
  });
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
document.getElementById("pin-trash-batch").addEventListener("click",processSelectedPins);
document.getElementById("pin-trash-toggle").addEventListener("click",()=>{selectedPins.clear();showingTrash=!showingTrash;document.getElementById("pin-trash-toggle").textContent=showingTrash?"返回型錄":"已刪除區";visibleLimit=40;render();});
document.getElementById("pin-trash-export").addEventListener("click",exportTrashManifest);
search.addEventListener("input",e=>{term=e.target.value.toLowerCase();visibleLimit=40;render();});
loadMore.addEventListener("click",()=>{visibleLimit+=40;render();});
document.querySelectorAll("[data-type]").forEach(b=>b.addEventListener("click",()=>{
  type=b.dataset.type;visibleLimit=40;
  document.querySelectorAll("[data-type]").forEach(other=>{const active=other===b;other.classList.toggle("active",active);other.setAttribute("aria-pressed",String(active));});
  render();
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


function setupGalleryFirstLayout(){
 const sheet=document.querySelector(".site-settings-sheet");
 const controls=document.querySelector(".pin-controls");
 if(!sheet||!controls)return;
 const section=(title,open=false)=>{
   const d=document.createElement("details");d.className="pin-settings-section";
   d.open=open;const s=document.createElement("summary");s.textContent=title;d.append(s);sheet.append(d);return d;
 };
 const management=section("管理與已刪除區");
 const toggle=document.createElement("label");
 toggle.style.cssText="display:flex;align-items:center;gap:9px;font-size:12px;padding:8px 0";
 const cb=document.createElement("input");cb.type="checkbox";cb.id="pin-manage-switch";
 const words=document.createElement("span");words.textContent="管理模式（顯示作品核取方塊）";
 toggle.append(cb,words);management.append(toggle);
 const actions=document.createElement("div");actions.className="pin-manager-actions";
 for(const id of ["pin-trash-batch","pin-trash-toggle","pin-trash-export"]){
   const el=document.getElementById(id);if(el)actions.append(el);
 }
 const trashCount=document.querySelector(".pin-trash-count");if(trashCount)actions.append(trashCount);
 management.append(actions);
 const filters=section("篩選與備份");
 for(const id of ["image-filter","hide-excluded","clear-filters"]){
   const el=document.getElementById(id);
   if(!el)continue;
   if(id==="hide-excluded"){const label=el.closest("label");if(label)filters.append(label);}
   else filters.append(el);
 }
 const advanced=document.querySelector(".filter-settings");if(advanced)filters.append(advanced);
 const count=document.getElementById("counter");if(count)filters.append(count);
 const info=section("型錄資訊與使用說明");
 const stats=document.querySelector("header .stats");if(stats)info.append(stats);
 const archive=document.getElementById("pin-archive-description");if(archive){archive.hidden=false;info.append(archive);}
 const help=document.getElementById("pin-help-text");if(help)info.append(help);
 const appearance=section("網站外觀");
 const heading=sheet.querySelector("h2");
 const toMove=[];
 for(let node=sheet.firstElementChild;node&&node!==management;node=node.nextElementSibling)toMove.push(node);
 for(const node of toMove)appearance.append(node);
 cb.addEventListener("change",()=>{
   document.body.classList.toggle("pin-managing",cb.checked);
   if(!cb.checked&&!showingTrash){selectedPins.clear();syncBatchButton();render();}
 });
 const trashBtn=document.getElementById("pin-trash-toggle");
 trashBtn?.addEventListener("click",()=>{
   document.body.classList.toggle("pin-trash-view",showingTrash);
   if(showingTrash){management.open=true;cb.checked=true;document.body.classList.add("pin-managing");}
   else if(!cb.checked){document.body.classList.remove("pin-managing");}
 });
 // Keep the settings open while selecting and managing gallery items.
 sheet.parentElement.addEventListener("click",event=>event.stopPropagation());
}
setupGalleryFirstLayout();


// Compact icon-triggered search beside the site settings button.
const pinSearchButton=document.getElementById("pin-search-toggle");
const pinSearchDrawer=document.getElementById("pin-search-drawer");

function setPinSearchOpen(open){
 pinSearchDrawer.hidden=!open;
 pinSearchButton.setAttribute("aria-expanded",String(open));
 pinSearchButton.setAttribute("aria-label",open?"關閉作品搜尋":"開啟作品搜尋");
 if(open)search.focus();
}
pinSearchButton.addEventListener("click",()=>setPinSearchOpen(pinSearchDrawer.hidden));

search.addEventListener("keydown",e=>{if(e.key==="Escape"){setPinSearchOpen(false);pinSearchButton.focus();}});
