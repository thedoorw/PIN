import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");
const c = JSON.parse(read("catalog/entries.json"));
const entries = c.items;
const errors = [];
if (!Array.isArray(entries) || !entries.length) errors.push("Missing catalog items");
const ids = new Set();
const types = new Set(["ATN","JSX","SCRIPT","RECIPE","WORKFLOW","MATURE","SUPPORT"]);
for (const item of Array.isArray(entries) ? entries : []) {
  if (!item.id || ids.has(item.id)) errors.push("Duplicate/missing ID: " + item.id);
  ids.add(item.id);
  if (!types.has(item.type)) errors.push(item.id + ": unknown type");
  if (item.access === "paid") errors.push(item.id + ": confirmed paid entry in active catalog");
  if (!/^https?:\/\//.test(item.url || "")) errors.push(item.id + ": invalid source URL");
  if (item.image && !/^https?:\/\//.test(item.image)) errors.push(item.id + ": invalid thumbnail URL");
  if (item.showcaseUrl && !/^https?:\/\//.test(item.showcaseUrl)) errors.push(item.id + ": invalid artwork URL");
  if (!Array.isArray(item.styleTags)) errors.push(item.id + ": styleTags is missing");
  if (!(item.type === "MATURE" || item.styleTags?.includes("海報") || item.styleTags?.includes("字體"))) errors.push(item.id + ": outside the three retained categories");
  if (item.styleTags?.some(t => !["海報","字體"].includes(t))) errors.push(item.id + ": disallowed style after curation");
}
const html = read("index.html"), js = read("app.js");
const setting = JSON.parse(read("config/site.json"));
if (!setting.siteName || !setting.faviconUrl) errors.push("Incomplete public site configuration");
if (!html.includes("./site-settings.js?")) errors.push("Missing site settings script");
if (!read("site-settings.js").includes('fetch("./config/site.json"')) errors.push("Wrong site-config path");
if (!read("assets/favicon.svg").includes("<svg")) errors.push("Missing default favicon");
if (!html.includes("./app.js?v=")) errors.push("GitHub Pages JS script is not relative");
if (!js.includes('fetch("./catalog/entries.json"')) errors.push("JS must fetch its own catalog");
if (!html.includes("aspect-ratio:3/2")) errors.push("Missing 3:2 image grid");
if (!html.includes('data-type="POSTER"') || !html.includes('data-type="TYPOGRAPHY"') || !html.includes('data-type="MATURE"')) errors.push("Three-category tabs missing");
if (html.includes('data-style="3D"') || html.includes('data-style="幾何形"')) errors.push("Retired style tabs still displayed");
if (!read("README.md").includes("我說.md")) errors.push("Root README must link user notes");
const illustrated = entries.filter(x => x.image).length;
const settingsSource = read("site-settings.js");
if (!html.includes('class="site-settings-trigger"') || !html.includes("⋯")) errors.push("Missing three-dot settings button");
if (!settingsSource.includes('document.addEventListener("pointerdown"') || !settingsSource.includes('event.key === "Escape"')) errors.push("Missing settings click-away or Escape support");
if (!js.includes('className = "pin-reject"') || !js.includes('"detail-toggle", "來源"')) errors.push("Missing source-only PIN card layout");
if (js.includes('"image-edit-trigger"') || js.includes('"memo-label"') || js.includes('"linked-record"')) errors.push("Legacy per-card editor remains in render function");

console.log(JSON.stringify({catalog:"PIN",items:entries.length,illustrated,linkOnly:entries.length-illustrated,errors},null,2));
if (errors.length) process.exitCode = 1;

