# PIN — INK Personal Visual Research

**PIN 是視覺收藏、作品篩選及 Recipe／ATN／JSX／Script 研究的主要資料庫；INK 是執行、創作與編輯的正式工具。**

## 永久入口

- [我說.md](./我說.md)：使用者本人想說的話，專用空白文件；沒有明確授權不得改寫。
- [型錄首頁](./index.html)：PIN Gallery 的 HTML／CSS。
- [型錄唯一權威索引](./catalog/entries.json) · [資料規則](./catalog/README.md)。
- [Recipe 工作區](./recipes/README.md) · [Recipe 格式](./recipes/RECIPE_FORMAT_v0.1.md)。
- [ATN／JSX／Script 研究規則](./library/README.md)。
- [永久創作及 CHAT／WORK 操作規則](./governance/PIN_OPERATING_RULES.md)。
- [網站發布、備份與驗證規則](./governance/PIN_PUBLISH_RULES.md)。
- [網站名稱與 Favicon](./governance/PIN_SITE_SETTINGS.md) — 本機預覽與正式公開設定。
- [建立來源及移轉紀錄](./research/ORIGIN_AND_MIGRATION_20261011.md)。

## 工作分工

| Repo | 責任 |
|---|---|
| **thedoorw/PIN** | 收藏作品、分類、Recipe／JSX／ATN／Script 研究、視覺型錄與發布 |
| **thedoorw/INK** | 正式創作、執行 Recipe、繪製與編輯，成果回饋 PIN |
| **INK-Browser-QA** | **僅在 INK 主程式需要工程修正／驗證時介入**；不是創作和 PIN 發布的中間站 |

**PIN ⇄ INK** 直接構成創作閉環。PIN 的 HTML、Recipe 與型錄資料存同一 Repo，出版時不需跨 Repo 取資料。

## 初始盤點（2026-10-11）

- 活躍型錄 **210 筆**（233 筆歷史基線中已排除 23 筆須付費案例）。
- 有縮圖 150 筆，無縮圖 60 筆；同一圖片網址在展示層去重，不刪原研究 ID。
- 取得條件未明者仍標示 unknown，**不能當作免費**。
- 現有 **G001–G005 共五筆 Recipe 研究候選**；不代表已具可執行 INK Recipe。
- 原作者圖片以來源網址引用，不擅自複製至公開 Repo。
- 風格分類仍為初步研究標籤，待使用者持續視覺校正。

## 網站與 GitHub Pages

本 Repo 是無需建置工具的靜態網站，根目錄 `index.html` 讀取同 Repo `./app.js` 與 `./catalog/entries.json`，不用 Val Town／Blob API，也不必自行安裝 npm。

管理者可於 **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)** 啟用預期網址：

[開啟 PIN 網站](https://thedoorw.github.io/PIN/)

**這是預定網址，不代表 Pages 已啟用或瀏覽器驗收完成。** 發布前後可執行 `node tools/verify.mjs`。用瀏覽器本機直接打開 HTML 可能受 `file://` 的 JSON fetch 限制，建議使用靜態 HTTP 伺服器。

## 個人標記與移站

勾選「不考慮」、個人文字備註與自行選擇的縮圖儲存在**瀏覽器本機**；不同網域不會自動同步。由 Val Town 舊站移至 GitHub Pages 之前，**先在舊站匯出含縮圖的 JSON，於新站匯入，再確認成果**。不要直接把備份檔提交到 Public Repo。

在使用者驗收前保留舊的 https://ink-visual-catalog.val.run/ 可用，不自行關閉。保留研究來源、ID 與其他權威證據。

**禁止未經授權啟動 IMAGE。** 此 Repo 的工作方法持續以使用者創作目標和實際視覺品質為優先。
