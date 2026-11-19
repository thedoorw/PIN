"use strict";

// Isolated, public-only design study. No OAuth, remote writes, or private records.
const tabs = Array.from(document.querySelectorAll("[data-view]"));
const views = new Map(Array.from(document.querySelectorAll(".view")).map(node => [node.id.replace("view-", ""), node]));
function switchView(name) {
  if (!views.has(name)) return;
  tabs.forEach(tab => {
    const current = tab.dataset.view === name;
    tab.classList.toggle("is-active", current);
    if (current) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
  for (const [key, section] of views) {
    section.hidden = key !== name;
    section.classList.toggle("is-visible", key === name);
  }
  window.scrollTo({top: 0, behavior: "instant"});
}
tabs.forEach(tab => tab.addEventListener("click", () => switchView(tab.dataset.view)));

const fallbackImage = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="620" viewBox="0 0 800 620"><rect width="800" height="620" fill="#e3ded4"/><path d="M180 150h440v320H180z" fill="none" stroke="#968d7f" stroke-width="2"/><path d="M180 470L620 150M180 150L620 470" stroke="#c2bbaf"/><text x="400" y="530" fill="#867b6e" text-anchor="middle" font-size="18" font-family="serif">PUBLIC SOURCE PREVIEW</text></svg>');
const displays = [
  {id: "G007", title: "從觀看開始", rightLines: ["收藏之後，", "讓創作發生。"], rightText: ["此處將能放入自由獨白、與 AI 的對話、研究節錄，或一段還沒有目的的文字。", "現在只顯示設計示意，不讀取任何私人 Google 文件。"]},
  {id: "T001", title: "觀察文字的形狀", rightLines: ["兩頁之間，", "是一段對話。"], rightText: ["左頁可以是來自世界的一件作品，右頁可以是今天重新看它時的思考。", "編排從關係開始，而不是從分類開始。"]}
];
let entries = new Map();
let spreadIndex = 0;
function textContent(id, value) { document.getElementById(id).textContent = value; }
function renderSpread() {
  const spread = displays[spreadIndex];
  const entry = entries.get(spread.id);
  textContent("left-page-title", spread.title);
  const title = document.getElementById("right-page-title");
  title.replaceChildren();
  spread.rightLines.forEach((line, i) => {
    if (i) title.append(document.createElement("br"));
    title.append(document.createTextNode(line));
  });
  const body = document.getElementById("paper-body");
  body.replaceChildren(...spread.rightText.map(line => { const p = document.createElement("p"); p.textContent = line; return p; }));
  textContent("source-credit", entry?.credit || "公開來源資料讀取中");
  textContent("source-id", "PIN / " + spread.id);
  const link = document.getElementById("source-link");
  link.href = entry?.showcaseUrl || entry?.url || "../../index.html";
  const image = document.getElementById("source-image");
  image.src = entry?.image || fallbackImage;
  image.alt = entry ? entry.title + " 原作者公開展示縮圖" : "公開資料未載入，使用中性佔位圖";
  image.onerror = () => { image.onerror = null; image.src = fallbackImage; image.alt = "原作者縮圖目前無法載入"; };
  const page = spreadIndex * 2 + 1;
  textContent("spread-left-index", String(page).padStart(2, "0"));
  textContent("spread-right-index", String(page + 1).padStart(2, "0"));
  textContent("spread-counter", String(spreadIndex + 1).padStart(2, "0") + " / " + String(displays.length).padStart(2, "0"));
  document.getElementById("previous-spread").disabled = spreadIndex === 0;
  document.getElementById("next-spread").disabled = spreadIndex === displays.length - 1;
}
document.getElementById("previous-spread").addEventListener("click", () => { spreadIndex = Math.max(0, spreadIndex - 1); renderSpread(); });
document.getElementById("next-spread").addEventListener("click", () => { spreadIndex = Math.min(displays.length - 1, spreadIndex + 1); renderSpread(); });
document.getElementById("print-spread").addEventListener("click", () => window.print());
renderSpread();
fetch("../../catalog/entries.json", {cache: "no-store"})
  .then(response => { if (!response.ok) throw new Error("Catalog HTTP " + response.status); return response.json(); })
  .then(data => { entries = new Map((data.items || []).map(item => [item.id, item])); renderSpread(); })
  .catch(() => { /* Keep the public-only paper preview usable offline. */ });

const captures = [];
const captureList = document.getElementById("capture-list");
function renderCaptures() {
  captureList.replaceChildren();
  textContent("capture-count", captures.length + " ITEMS");
  if (!captures.length) {
    const empty = document.createElement("p"); empty.className = "empty-shelf";
    empty.textContent = "尚未放入片段。這裡會是一面開放的標本牆。";
    captureList.append(empty); return;
  }
  captures.forEach((capture, index) => {
    const card = document.createElement("article"); card.className = "capture-card";
    const p = document.createElement("p"); p.textContent = capture.text;
    const small = document.createElement("small"); small.textContent = "FRAGMENT / " + String(index + 1).padStart(2, "0");
    card.append(p, small); captureList.append(card);
  });
}
document.getElementById("capture-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("capture-text");
  const text = input.value.trim(); if (!text) return;
  captures.unshift({id: crypto.randomUUID(), text, created_at: new Date().toISOString()});
  input.value = ""; renderCaptures(); input.focus();
});
document.getElementById("export-capture").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({format: "pin-notebook-v0-temporary-captures", exported_at: new Date().toISOString(), items: captures}, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "pin-notebook-temporary.json";
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
