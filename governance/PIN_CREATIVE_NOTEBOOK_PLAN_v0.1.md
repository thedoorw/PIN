# PIN 創作手札｜改造工作計畫 v0.1

**會議日期：2026-11-19（台灣時間）**  
**狀態：三方研究完成；隔離式 UI 候選已建立，正式網站／私人資料尚未變更。**  
**Owner：INK PR／USER 視覺決策**  
**工程 SSOT：本 `thedoorw/PIN` Repo；私人文稿與資料以使用者持有的 Google Drive 為候選。**

### 本輪驗證紀錄（如實登錄）

- `node --check prototypes/notebook-v0/app.js`：PASS。
- `node tools/verify.mjs`：**BASELINE FAIL**。正式 `main` 的舊驗證器仍在 `index.html` 內找 `aspect-ratio:3/2`、字元 `⋯` 及舊 card layout 寫法；但現行來源已分離 CSS、SVG 三點及新卡片 DOM。此次未修改主站檔案，這三項屬既有驗證規則過期，須另以正確選擇器更新驗證器，不能當新候選改壞主站或直接標 PASS。
- 本機 Headless Chromium 因執行環境的 socket 權限遭拒；互動／多尺寸／PDF 的 `qa.mjs` 尚未實際 PASS。桌面受管理政策亦阻擋 `file://` 直接開啟，因此**仍待可授權的瀏覽器環境進行視覺 QA 與 USER 審美確認**。
- 以上限制不影響原站 `main`，且所有候選文件仍不含私人文稿與憑證。

## 1. 這次改造要解決什麼

PIN 從原有作品與 Recipe 型錄，擴展為「一冊可以展開的創作手札」：生活影像、無目的的片段、研究文件、個人創作、ChatGPT 對話及開發反思，可先自由收集，再對照、編排、出版。美感不是附屬：需要有安靜、可閱讀、像精緻書房的空間品質。

這段**需求摘要不是私人對話原文**。原始逐字記錄留在既有私人位置，不得複製到公開 PIN、PR 或 GitHub Pages；USER 正評估改由 Google Drive 保存私人資料。

四項產品目標：

1. **美的網站**：雙頁手札作主體，照片牆只是其中一種觀看方式。
2. **開發年鑑**：從 PRIVATE `INK-Browser-QA` Repo 建立的第一天起，依 GitHub 可核實日期、Issue／PR／Commit／Actions 建立事件與方法反思，而不是以回憶猜測年份。
3. **網站設計方法**：`WEB-Design-Lab`／未來 WEB 研究參考網站、模矩、排版重現、視覺差異與可重用模板；PIN 作成果實驗與使用場域，兩者不互相取代。
4. **私人 AI 研究手札**：Google Drive/Docs/Sheets 管資料與權限；ChatGPT 已有的 Plus／連接器作研究協作，不增加任何 API 訂閱費用。

## 2. 三方會議定案的設計方向（待 USER 視覺核可）

| 視圖 | 核心動作 | 第一階段範圍 |
| --- | --- | --- |
| **手札 Notebook** | 橫向 A4（297×210mm）分為左右頁，讓圖像／文字、研究／回應並置；可輸出本頁 PDF | 隔離 UI；手機單頁；有限內容排版 |
| **自由輯錄 Capture** | 不必先分類，記錄獨白、圖像、GPT 片段、引用與靈感 | 隔離展示、記憶體暫存與手動 JSON 下載；不假稱同步 |
| **開發年鑑 Timeline** | 每筆事件記日期、來源證據、成果／失敗、心得、下一次方法 | 公開已核實事件樣本；PRIVATE Repo 建立日與完整歷史待授權回溯 |
| **現有型錄 Gallery／Research** | 現有作品、Recipe 與私人研究表 | 完整保留原入口、索引與 OAuth；不做資料重建 |

視覺候選：柔和近白紙 `#F8F6F0`、墨色 `#252420`、細中縫、宋體標題與克制留白。桌面雙頁，手機頁面垂直排列；不要把 A4 整張縮成手機微字。A4 橫向 PDF 與真正可摺印的小冊**不是同一個已完成的功能**，頁序拼版另列後續。

## 3. 現有程式與不可退化的 Gate

- `main/index.html`、`app.js`、`catalog/entries.json`：正式 PIN 靜態 Gallery，已有本機篩除、備份、來源連結及研究分類。
- `styles/base.css` 與既有 G0／00 TopNav／03A Gallery／03B Research：2026-10 月已有指定幾何及互動驗收，不因新 UI 擅改。
- `research-sheet.js`：已有 Google Identity Services OAuth、Sheets API 讀取／新增／編輯逐格、遠端覆寫前檢查；既有 scope 是完整 `spreadsheets`，**不是** `drive.file`。這是舊功能的已實作範圍，不能等同所有真實瀏覽器新授權情境都已 PASS。
- `governance/PIN_OPERATING_RULES.md`：2026-10-22 CHAT 的 Google Drive／Sheets connector **READ PASS**；**WRITE 尚未實測**。CHAT connector 與 PIN 瀏覽器 OAuth 是獨立授權，不能互借憑證。
- PUBLIC PIN 是公開 GitHub Repo 和 GitHub Pages：任何支線 GitHub PR 檔案都可能公開，不能放個人原話、Google private row、憑證或未授權圖片。

第一版不改正式 `main`、不觸發正式 Pages 合併／發布、不新建額外收費服務、不啟動 IMAGE、不動 INK Core。

## 4. 私人內容與資料架構（設計提案，未建立）

| 存放處 | 權威資料 | 可見邊界 |
| --- | --- | --- |
| **PIN GitHub（公開）** | 網站程式、公開型錄、經核可的設計規範與公共作品 | 任何人可見 |
| **現有私人 Google Sheet** | `PIN 研究索引`，由目前的 03B 顯示與編輯 | Google 檔案 ACL 控制；沿用，不建立同內容副本 |
| **候選 PIN 私人索引 Sheet** | `Items`（素材索引）、`Spreads`（左右頁編排）、`Timeline`（事件／證據／方法） | 僅 Google 帳號持有者；建立需單獨授權 |
| **Google Docs** | 長文、獨白、AI 對話摘錄及研究稿件 | Google 檔案 ACL；不自動發布 |
| **Google Drive 個人檔案** | 原始影像、草圖、INK 成品與附件 | 授權下載／預覽；不以匿名 URL 當成隱私保護 |

一個素材可同時參與多個雙頁；原件與編排記錄分離，避免重新排版時改動原件。`privacy=private` 只能當 UI 記錄，真正存取控制仍由 Google ACL 執行。

候選索引欄位：

- `Items`: `id,type,title,created_at,updated_at,source_kind,source_ref,privacy,notes,tags`。
- `Spreads`: `spread_id,position,left_item_id,right_item_id,layout,caption`。
- `Timeline`: `event_id,occurred_at,timezone,project,kind,title,github_evidence_url,verification,method_note,linked_item_id`。

**登入及權限**：新 Notebook 研究 Google Picker + `drive.file` 逐檔授權；Docs、Sheets、圖片分別驗證讀取與寫入。不把 `drive.readonly`、完整 Drive 讀取或新付款權限當成預設。現有 03B 暫不變動；新的 OAuth app/Personal mode 需 USER 核准後建立，且以官方當期資格為準。

## 5. 人機協作：$0 新增費用原則

**現時可用**：CHAT 中研究／整理 → 已驗證 connector 讀 PRIVATE 研究 Sheet → 使用者決定採納內容 → PIN 既有 Sheets 編輯介面寫入。以人決策作審核節點；尚未驗證 CHAT connector 直接 WRITE，不冒稱雙向全自動。

**後續待測**：經許可的 Google Docs／Sheets connector 寫入、Google `drive.file` + Picker、PIN UI 與私有資料互通、授權後的 AI 追加註記以及人工審核再出版。任何 API 超額付費擴容禁止啟用。

2026 官方 `Sign in with ChatGPT` 存在對合格開源／本機 App 以 Plus 額度做部分 AI 推論的機制；但公開遠端託管的 PIN **沒有取得該資格的證據**，官方要求另行申請。因此只列「可行性研究」，不能作為第一版免費 API 功能承諾，也不能把 OpenAI 憑證藏在公開前端。

## 6. 階段與完成定義

| 階段 | 行動 | 驗收／下一個 Gate |
| --- | --- | --- |
| **P0：本輪** | 三方研究、現況核查、建立本計畫與 `prototypes/notebook-v0/` 隔離雙頁候選 | Node source check、舊 PIN verify、雙頁／手機／PDF 預覽，無私人內容；**USER 視覺核可前不替換主站** |
| **P1：手札設計** | 依 USER 審美修正字體、紙面、圖文節奏、採集和年表的互動 | 1440×900、1024×768、390×844、320×700；鍵盤／焦點／行動裝置無溢出；正式版面比對 |
| **P2：私有資料** | 授權後 Google OAuth `drive.file`、Picker、Docs/Sheets REST；候選索引跨裝置；保留既有 03B | 新／舊表讀寫分別 PASS；私人 ACL、登出／過期、授權失敗、覆寫衝突、跨裝置 E2E |
| **P3：開發年鑑** | 以 `INK-Browser-QA` 建庫首日為起點，回溯 GitHub 事件；用方法評述而非只列成功 | 每筆時間含時區、固定來源 URI／SHA、證據等級與去重；使用者核定可見性 |
| **P4：協作與出版** | 試驗 CHAT 寫回；安排選稿／私轉公、雙頁列印與成冊拼版 | 不同步曝光私人資料；另行 USER 明確核可出版內容、網站來源 SHA 與正式合併／部署 |

每一階段都要分別記錄 `SOURCE_READY / TEST_PASS / LIVE_PASS / USER_VISUAL_ACCEPTED`；不得因 GitHub Commit 或 Actions SUCCESS 就宣稱真人 Chrome 視覺已驗收。

## 7. 第一輪已採用的設計與技術來源

- [Are.na Channels](https://help.are.na/docs/getting-started/channels) — 無目的收集和關聯。
- [Obsidian Canvas](https://obsidian.md/help/plugins/canvas) — 自由佈局與不同媒材並置。
- [Notion Views](https://www.notion.com/help/views-filters-and-sorts) — 同一資料多視圖。
- [W3C CSS Paged Media](https://www.w3.org/TR/css-page-3/) — 紙張頁面與列印。
- [Playwright visual snapshots](https://playwright.dev/docs/test-snapshots) — 跨版本視覺回歸。
- [Google Drive `drive.file` scope](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)、[Picker](https://developers.google.com/workspace/drive/picker/guides/web-picker)、[Docs scopes](https://developers.google.com/workspace/docs/api/auth)、[Sheets scopes](https://developers.google.com/workspace/sheets/api/scopes)。
- [Google Cloud Personal OAuth mode](https://support.google.com/cloud/answer/15549945?hl=en) — 單使用者模式候選，未配置。
- [Google Drive quota](https://developers.google.com/workspace/drive/api/guides/limits) — 免費標準用量與新版限額須持續核對。
- [OpenAI Sign in with ChatGPT integration eligibility](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) — 本機開源可用資格與遠端申請限制。

## 8. 保留的使用者決策

- 不自行新購 API、MCP、託管或 Google Cloud 付費服務。
- 不發動 IMAGE；原有 INK 產品、WORK／CHAT DRAW 工作線不在此 PR 內。
- PRIVATE `studio/` 可日後整理，但它包含 INK 技術文件，不能因 PIN 改造整個刪除。
- WEB Repo 改名／轉 Private 仍未決定；此候選不替使用者處置 Repo。
- 原始私人創作對話保留在原處；若要遷至私人 Drive，待使用者授權、實際搬移與回讀確認。
