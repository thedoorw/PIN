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
}
const html = read("index.html"), js = read("app.js");
if (!html.includes("./app.js?v=")) errors.push("GitHub Pages JS script is not relative");
if (!js.includes('fetch("./catalog/entries.json"')) errors.push("JS must fetch its own catalog");
if (!html.includes("aspect-ratio:3/2")) errors.push("Missing 3:2 image grid");
if (!read("README.md").includes("我說.md")) errors.push("Root README must link user notes");
const illustrated = entries.filter(x => x.image).length;
console.log(JSON.stringify({catalog:"PIN",items:entries.length,illustrated,linkOnly:entries.length-illustrated,errors},null,2));
if (errors.length) process.exitCode = 1;
