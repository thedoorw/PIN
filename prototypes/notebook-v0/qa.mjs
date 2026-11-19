// Run from the repository root with Node 22+ and installed Playwright/Chromium.
// This tool tests a loopback-only server in this process and makes no remote writes.
import {createRequire} from "node:module";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {join,resolve,extname,relative} from "node:path";
import {fileURLToPath} from "node:url";
import {mkdir} from "node:fs/promises";
import {tmpdir} from "node:os";

const require = createRequire(import.meta.url);
const {chromium} = require("playwright");
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const out = resolve(tmpdir(), "pin-notebook-v0-qa");
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml"};
const server = createServer(async (req, res) => {
  const target = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  if (relative(root, target).startsWith("..")) {res.writeHead(403).end();return;}
  try { const body = await readFile(target); res.writeHead(200,{"Content-Type":mime[extname(target)]||"application/octet-stream"}).end(body); }
  catch {res.writeHead(404).end();}
});
const failures = [];
const screenshots = [];
const check = (truth,description) => { if (!truth) failures.push(description); };
await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
const port = server.address().port;
// Work's system Chromium is available even if Playwright's headless-shell bundle isn't.
const browser = await chromium.launch({headless:true,executablePath:process.env.PIN_CHROMIUM_PATH||"/usr/bin/chromium",args:["--no-sandbox"]});
try {
  await mkdir(out,{recursive:true});
  for (const [width,height] of [[1440,900],[1024,768],[390,844],[320,700]]) {
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/prototypes/notebook-v0/index.html`,{waitUntil:"networkidle"});
    const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth,spread:document.getElementById("spread").getBoundingClientRect().width,pages:[...document.querySelectorAll(".paper-page")].map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}))}));
    check(geometry.scroll<=geometry.viewport+1,`${width}: horizontal overflow ${JSON.stringify(geometry)}`);
    check(errors.length===0,`${width}: JS errors ${errors.join(";")}`);
    const filename=join(out,`notebook-${width}.png`);
    await page.screenshot({path:filename,fullPage:true});screenshots.push(filename);
    if(width===1440){
      check(await page.locator("#spread-left-index").innerText()==="01","first spread index");
      await page.locator("#next-spread").click();
      check(await page.locator("#spread-left-index").innerText()==="03","next spread index");
      await page.locator("#previous-spread").click();
      await page.locator('[data-view="collect"]').click();
      check(await page.locator("#view-collect").isVisible(),"collect view visible");
      await page.locator("#capture-text").fill("保存在暫存區的測試片段");
      await page.locator("#capture-form button[type=submit]").click();
      check(await page.locator(".capture-card").count()===1,"capture in-memory card exists");
      await page.locator('[data-view="timeline"]').click();
      check(await page.locator(".timeline-list li").count()===3,"verified sample timeline has 3 events");
      await page.locator('[data-view="notebook"]').click();
      const pdf=await page.pdf({format:"A4",landscape:true,printBackground:true,preferCSSPageSize:true});
      check(pdf.length>1000,"nonempty A4 PDF");
    }
    await page.close();
  }
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
console.log(JSON.stringify({status:failures.length?"FAIL":"PASS",screenshots,failures},null,2));
if(failures.length)process.exitCode=1;
