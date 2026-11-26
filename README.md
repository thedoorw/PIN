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
- [PIN 目前工作狀態／待辦](./governance/PIN_UI_PENDING_REVIEW_20261011.md) — 最新完成版本、未完成關卡、下個動作（換窗從此接續）。
- [共用排版模矩探索](./governance/PIN_SHARED_LAYOUT_GRID_EXPLORATION.md) — 1280px 四欄配置候選，尚非正式 CSS 規格。
- [PIN UI 模組化與共用排版契約 v0.2](./governance/PIN_UI_MODULE_LAYOUT_CONTRACT_v0.2.md) — G0 與 01～03 已實作；00 的 48px 頂部導覽列已部署；2026-10-20 USER 已通過 LOGO 對齊、搜尋／設定及 LOGO 自訂保留三項驗收。
- [G0 共用外框設計與實作狀態](./governance/PIN_G0_SHARED_SHELL_DESIGN_v0.1.md) — PageShell 已部署；2026-10-20 USER 已確認標頭 16px 內縮、照片牆左右留白及研究文件外框對齊三項視覺驗收通過。
- [建立來源及移轉紀錄](./research/ORIGIN_AND_MIGRATION_20261011.md)。
- [創作手札改造計畫／隔離候選 Draft PR #7](https://github.com/thedoorw/PIN/pull/7) — 尚未整合正式站。
- [私人 Google Drive 文件唯讀預覽 Draft PR #9](https://github.com/thedoorw/PIN/pull/9) — 驗收與授權尚未完成。

## PIN 創作手札｜2026-11-26 設計方向

**狀態：USER 已確認核心互動方向；此節是需求與研究入口，不代表正式 PIN 網站已改造或部署。** 原有 Gallery／Recipe 研究與已完成的 UI 不能因此被覆蓋。

- **美感與定位**：PIN 從作品型錄延伸為精緻、帶有科技感的個人創作手札／AI 研究空間，保留既有 Notebook v0 候選的溫度與書頁感。
- **左右雙獨立視窗（已確認）**：左右可以各自捲動、切換內容而不影響另一側；中央分隔線可調整比例。參考 [Semirare Panels](https://demo-panels.semirare.com/) 的左右構成與空間感，但不照搬其切換方式；[Material Design Split screen](https://m1.material.io/layout/split-screen.html) 只作雙窗互動參考（原規範針對 Android）。
- **自由輯錄與創作**：生活見聞、圖像、草圖、個人獨白、CHAT／AI 對話及研究文件可以並置、對照、整理；公開／私人內容有明確界線。
- **開發年鑑與方法**：以 `INK-Browser-QA` 建庫首日為起點，依可核實時間與 GitHub 證據記錄開發大事記、回顧經驗；並與 WEB 網站設計方法研究相互參照。
- **工作與出版分離**：日常使用可自由調整雙窗；需要排版出版時才整理為 A4 橫式雙頁，成冊拼版另行設計。
- **私人資料及人機協作**：以使用者帳號控管的 Google Drive／Docs／Sheets 為候選，不把私人對話、憑證或原始檔寫入公開 Repo；不新增付費 API／MCP。現有私人 Drive 預覽另由 [Issue #8](https://github.com/thedoorw/PIN/issues/8) 與 [Draft PR #9](https://github.com/thedoorw/PIN/pull/9) 處理，仍待真實驗收。

設計工作單與隔離 Notebook v0 見 [Draft PR #7](https://github.com/thedoorw/PIN/pull/7)；**雙獨立視窗需求是 2026-11-26 新確認的方向，既有 v0 翻頁候選尚未實現此規格**。

## BLOG 文章計畫｜荒漠甘泉讀書會（標題登記，內容待定）

- **新計畫標題**：BLOG｜荒漠甘泉讀書會文章計畫。
- **來源網站**：[荒漠甘泉讀書會](https://stmdst.blogspot.com/)（USER 本人網誌）。
- **狀態**：先保留名稱與來源；具體用途、整理方式及是否與 PIN 整合，待 USER 後續決定。不得據此自行轉換、搬移或出版文章。
- **資料邊界**：原始 Blogger 備份 `feed.atom`、私人資料及未公開內容不提交到 Public PIN Repo／Pages。

## 工作分工

| Repo | 責任 |
|---|---|
| **thedoorw/PIN** | 收藏作品、分類、Recipe／JSX／ATN／Script 研究、視覺型錄與發布 |
| **thedoorw/INK** | 正式創作、執行 Recipe、繪製與編輯，成果回饋 PIN |
| **INK-Browser-QA** | **僅在 INK 主程式需要工程修正／驗證時介入**；不是創作和 PIN 發布的中間站 |

**PIN ⇄ INK** 直接構成創作閉環。PIN 的 HTML、Recipe 與型錄資料存同一 Repo，出版時不需跨 Repo 取資料。

## 初始盤點（2026-10-11）

- 活躍型錄 **58 筆**，僅保留「海報、字體、成熟作品」三類；清理前 210 筆型錄已歸檔（並維持原先排除 23 筆須付費案例的規則）。
- 有縮圖 **49 筆**，無縮圖 **9 筆**；展示層以相同圖片網址去重，原研究 ID 可在歷史歸檔查回。
- 取得條件未明者仍標示 unknown，**不能當作免費**。
- 原 G001–G005 Recipe 研究草稿已移至 `research/archive/recipes/`，**不屬於本次保留的三類型錄**；不代表已具可執行 INK Recipe。
- 原作者圖片以來源網址引用，不擅自複製至公開 Repo。
- [2026-10-11 三類清理紀錄](./research/PIN_THREE_CATEGORY_CURATION_20261011.md) 與 [清理前 210 筆完整快照](./research/archive/PIN_CATALOG_BEFORE_THREE_CATEGORY_REDUCTION_20261011.json)。
- 風格分類仍為初步研究標籤，待使用者持續視覺校正。

## 網站與 GitHub Pages

本 Repo 是無需建置工具的靜態網站，根目錄 `index.html` 讀取同 Repo `./app.js` 與 `./catalog/entries.json`，不用 Val Town／Blob API，也不必自行安裝 npm。

管理者可於 **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)** 啟用預期網址：

[開啟 PIN 網站](https://thedoorw.github.io/PIN/)

**這是預定網址，不代表 Pages 已啟用或瀏覽器驗收完成。** 發布前後可執行 `node tools/verify.mjs`。用瀏覽器本機直接打開 HTML 可能受 `file://` 的 JSON fetch 限制，建議使用靜態 HTTP 伺服器。

## 個人標記及舊站退役

目前正式 PIN 網站已部署於 [GitHub Pages](https://thedoorw.github.io/PIN/)，唯一正式來源為本 Repo `main`。個人「不考慮」等標記儲存在瀏覽器本機，請勿公開備份中的私人資料。

**USER 已明確決定不轉移任何舊 Val Town 個人資料**，將直接在 PIN 重新篩選。原 Val Town `thedoorw/ink-visual-catalog-demo` 已獲刪除授權但**尚未刪除**。當前確切狀態及下一步，請先讀 [PIN 現況／待辦](./governance/PIN_UI_PENDING_REVIEW_20261011.md)。保留研究 ID 及歷史歸檔，不誤刪其他 Val 或 GitHub Repo。

**禁止未經授權啟動 IMAGE。** 本 Repo 工作方法持續以使用者創作目的與實際視覺品質為優先。
