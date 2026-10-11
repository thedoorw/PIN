# PIN UI 與型錄整理待辦 — 使用者意見彙整

**狀態：58 筆型錄與介面前三項已實作、Pages 發布成功；公開 PIN Live 已再次取得 HTTP 200；實際 USER 瀏覽器互動驗收尚未回報；Val Town 舊專案已刪除並驗證 404；四個 USER 參考網站已收錄；雙軌小批量 Recipe 研究已獲啟動。**

此文件保留歷次 PIN UI 討論與已執行結果；早期待辦文字是原始決策背景，**實際完成狀態以頂部與 E 節為準**。PIN 主資料與網站仍以本 Repo main 為唯一 SSOT。

## 0. 視窗結束前的 PR 現況登錄（2026-10-11）

```text
OWNER_ROLE                = PR / Produce + PIN + reciPe Review
TASK                      = PIN static gallery UI simplification and Val Town retirement
AUTHORITY_REPO            = thedoorw/PIN
CURRENT_BRANCH            = main
BASE_SHA                  = 9bef98fc5559107cbd59cf29554256a292d037ae
UI_IMPLEMENTATION_SHA     = 51b54e4c769cf9e2ae7063abecf46627ec79c47d
LAST_VERIFIED_PRE_HANDOFF = b206f02824a0e6e7bc95e335f4058ffc36c66354
PAGES_RUN                 = 38139705177 / SUCCESS (for b206f028...)
PIN_ACTIVE_RECORDS        = 58 (海報、字體、成熟作品)
UI_STATUS                 = SOURCE_IMPLEMENTED / PAGES_SUCCESS
USER_VISUAL_ACCEPTANCE    = NOT_YET_VERIFIED_IN_THIS_WINDOW
PIN_LIVE_HTTP             = 200 / public fetch rechecked 2026-10-11; rendered copy reflects current simplified UI
VAL_TOWN_RETIREMENT       = COMPLETE; exact target thedoorw/ink-visual-catalog-demo; project f1c6dd03-a4c6-44a0-b57c-3fccb58a8b2e deleted 2026-10-11T13:00:29.971Z; listing count 0; endpoint 404
USER_CHECKPOINT_REQUIRED  = USER supplies website references before new Recipe discovery; USER browser visual / interaction acceptance remains separate
NEXT_EXECUTABLE_ACTION    = wait for USER example websites and browser acceptance feedback; do not resume broad Recipe acquisition
```

**本次 PR 接續已完成 Val Town 退役收尾；沒有新增 UI 功能。公開 PIN Live 再驗證為 HTTP 200，但此非 USER 瀏覽器互動驗收。**

已完成的三項（不可在新視窗誤判為未開始）：
1. 網頁右上角的 36px 級別 `⋯` 設定按鈕；設定打開後可點面板外或按 Escape 關閉，原設定內容保留。
2. 每張 PIN 展開欄位只呈現來源連結；過時的備註、測試、標籤編輯及縮圖管理不再在卡片詳細區呈現。
3. 無文字的「不考慮」勾取方塊移到研究 ID 右側、下拉上方，原 localStorage 標記機制仍在。

以上有 GitHub source commit 與 Pages SUCCESS，**尚不代表真實瀏覽器點擊、可見對齊、個人標記等全面 PASS**；新視窗先查看當前網站 `https://thedoorw.github.io/PIN/` 及必要的互動證據，不能只因 Actions SUCCESS 宣稱使用者已驗收。

USER 已表示不需要 Val Town 舊資料，並只授權處理原 PIN 舊 Val `thedoorw/ink-visual-catalog-demo`。2026-10-11 已先重新確認 `https://thedoorw.github.io/PIN/` 可獨立取得 HTTP 200，再刪除精確 Val 專案 `f1c6dd03-a4c6-44a0-b57c-3fccb58a8b2e`。刪除後同名 Val listing count = 0，舊 `https://ink-visual-catalog.val.run/` endpoint = HTTP 404。其餘 Val 與 GitHub 資料均未處理。

下一輪研究方向：USER 認為先前收集成果多數不成熟、不完整且不是預期 Recipe 形式。**等 USER 自行提供幾組網站並討論審美與 Recipe 定義後才啟動新一輪研究**；不可自動恢復舊批次大蒐集或把舊研究候選稱為可執行 Recipe。

相關 INK 角色權威：`thedoorw/INK-Browser-QA/governance/roles/INK_SMR_STUDIO_TRANSLATION_MR.md`。舊研究 Pull Request `INK-Browser-QA#218` 仍 Open／未合併，屬來源與可追溯研究，不是 PIN 網站的即時工作指令；不得為完成 PIN 工作擅自修改 INK Core 或公開 `/INK/`。

## A. 已確認的 UI 修改偏好

### A1. 網站設定入口

- 頁面**右上角**改為與 ChatGPT「更多」控制接近的位置與尺寸，約 `36px × 36px`。
- 僅有**橫向三點 `⋯`**，不要顯示「設定」兩字；保持相對低干擾的視覺。
- 點擊後仍開啟現有網站名稱、Favicon、自訂圖片上傳、本機預覽與公開設定匯出面板。
- **新的要求**：設定面板打開時，按面板以外的任意留白處即可關閉，不必再次點三點。按 `Escape` 也應能關閉；按面板內的輸入框、上傳、匯出、確認等操作時不能誤關閉。需要讓鍵盤及觸控可操作。

### A2. 每張 PIN 的「詳細資料」改為緊湊佈局

使用者截圖顯示展開的 PIN 詳情區**過長、空白過多**，使每列卡片延伸得不合理；勾選「不考慮這件作品」的文字還被壓縮到幾乎逐字換行。

預定改造：

1. 減少 `padding`、`margin`、`gap`，把次要研究狀態、來源、標籤改為緊湊的同行排列或小標籤。
2. 「不考慮」checkbox 與文字應同一行，修正目前疑似被共用 CSS `input { flex:1; ... }` 擠壓的問題，改為專用 checkbox 尺寸和佈局。
3. 備註欄保持可編輯，但未輸入時高度更低，例如兩行；不再讓每一區都佔滿多個垂直段落。
4. 關聯研究與較長技術說明保留可追溯性，避免讓所有附加資訊初始全部展開。必要時使用第二層細節收合。
5. 折疊狀態的 Pinterest 式 3:2 網格、卡片對齊、縮圖導向原作、標題兩行和研究 ID 不變。
6. 不遺失使用者勾選、備註、自選縮圖、原始研究 URL 或技術分類與風格篩選。

### A3. 移除 3D 標籤及其案例 — 已由三類清理完成

- 使用者要求：「**型錄中 3D 標籤內容都刪除不要**」。
- 現有 `catalog/entries.json` 共 **210 筆**，其中 **22 筆**有 `styleTags: ["3D", ...]`，**只有 1 筆純 3D，其餘 21 筆同時有其他風格標籤**。由於有混合標籤，不能草率把 22 筆原檔永久刪掉，可能誤損「幾何形、靜物、人物」或 `RECIPE` 研究成果。
- **完成狀態**：在 2026-10-11「僅保留海報／字體／成熟作品」清理中，3D 風格按鈕及所有 3D 標籤均已從活躍型錄移除。原來的 22 筆資料仍可在完整 210 筆歷史快照查回；非 3D 用途案例如有被保留，其現行標籤只有海報或字體。
- 刪除前保留 Git 版本／archive 與核對表，不讓研究來源不可追溯。使用者最終確認清理範圍後再執行。

## B. 型錄可能大規模清理與重新搜尋

- 使用者考慮對整個 PIN 型錄做**大清理後重新搜尋**，目標是縮小雜亂候選，提升真正成熟、值得創作與重製的視覺作品比例。
- 目前為探索中方向，**尚未確認清空、清理標準、刪除方式與重新蒐集數量**；不可依此擅自大量刪除 210 筆。
- 後續建議：先確定清理準則與保留清單，再建立批次歸檔、重新搜尋、影像唯一性及作品品質審查流程。不得將收集數量當作品質成果。
- User 明確表明**不再需要 Val Town 舊資料**；PIN 網站及 Recipe 未來直接在 `thedoorw/PIN` 維護／發布，與 INK 直接進行創作工作，不經 Browser-QA 中轉。

## C. 執行閘門

**三類型錄刪減、右上角三點與留白關閉、來源限定下拉及無文字篩除框均已完成。** 後續新 Recipe 來源及審美標準由使用者提供範例網站後討論。

實作完成需更新此檔狀態、驗證 GitHub Pages 與每筆源資料的處理結果；未完成的項目繼續保留待辦。未經要求不可使用 IMAGE。

## D. 已執行的 2026-10-11 類別裁減

USER 明確指示：「全部案例，只將 海報、字體、成熟作品 這三類先留下，其他都先刪除」。已將此項視為對**型錄內容與分類頁面**的直接授權（不是其他 UI 規格的全面開工）：210 筆中保留 58 筆、移出 152 筆；只展示全部／海報／字體／成熟作品。資料歸檔於 `research/archive/`；紀錄見 [清理報告](../research/PIN_THREE_CATEGORY_CURATION_20261011.md)。A1/A2 保持待辦，不強行同步修改。

## E. 2026-10-11 使用者追加指令／完成狀態

USER 直接授權：先完成網站設定三點選單、點擊留白或 Escape 關閉；每張 PIN 下拉不再出現風格、測試、備註、上傳、更換縮圖、關聯編輯等功能，**只顯示來源連結**；原本「不考慮」勾選框放到研究 ID 右側／下拉上方，沒有可見文字但保留 aria-label 和提示；維持現行 58 筆型錄。

操作上，勾選會保存在現有 localStorage，當「隱藏不考慮」已勾選時可立即從網格隱藏。原有本機備註／個人圖片資料不主動刪除，僅停止在每張卡片提供編輯功能。全域篩選和備份仍留作既有資料相容功能。

後續收集策略：USER 將自行提供幾組喜歡的網站後再討論成熟、完整、值得研究的 Recipe 類型；**在提供網站前不要自行大規模重新搜尋或採集**。

舊 Val Town 僅限 `thedoorw/ink-visual-catalog-demo`；此退役已於 2026-10-11 完成並以 listing count 0 + endpoint 404 核實。其餘 Val 專案不可動。

## F. 2026-10-11 設定入口與篩選框微調

USER 要求設定按鈕比照 ChatGPT 再提高，以及保留 PIN 核取方塊的正確位置但縮小。已直接於 `index.html` 實作：設定入口相對既有位置向上 14px（`margin-top:-14px`）；卡片研究 ID 旁核取方塊由 17×17px 縮為 13×13px。未改動勾選保存、來源下拉、58 筆資料或其他 Val／INK 程式。Implementation commit: `c7739e3806d2c58b00af0db556a47b450237652b`。此為 source-level 修改；新 commit 的 Pages／USER 視覺驗收須另外確認，不沿用先前 Pages 成功作此 commit 的證據。

## G. 2026-10-11 右上角設定定位修正

USER 提供實際 Chrome 截圖確認上一版設定按鈕仍靠近 PIN 標題，未達預期。已修正 `index.html`：以 `header{position:relative}` 及 `.site-settings{position:absolute;right:0;top:-16px;margin:0}` 將按鈕定位到頁首右上，而非以標題列負邊距微調。保留 36×36px 按鈕、13×13px PIN 勾選方塊及既有互動。Exact implementation commit `b51db9e5d58ca3216f41ee407a57631f184e0a21`；Pages run `38143074611` 檢查時 IN_PROGRESS，USER 截圖視覺驗收仍待確認。

## F. 2026-10-11 PR 新一輪雙軌研究啟動

USER 已提供四個明確的成熟作品網站，並確認「成熟作品參考」及「現成工具／程式／操作流程」兩類同時蒐集；優先確認來源真實存在並先刊登 PIN，之後再逐批討論方向。不必先決定固定風格配額或一次大量研究。

- 新增於唯一型錄 `catalog/entries.json`：`PR-001` Sanna Annukka、`PR-002` Evan Hecox、`PR-003` PosterLad、`PR-004` Tony Sjöman；source commit `32f786534f086656681a642405921e07f3eeacf2`。
- 四筆屬 `MATURE`／USER reference，原站網址已確認可取得；未加入未核實圖片；`testStatus=untested`、`access=unknown`，不表示可下載或重製作品，也不表示已找到對應 INK Runtime Recipe。
- 後續工作採雙軌、小批量：A 成熟完整作品及個人視覺風格；B 可取得、有實際成果展示的工具／原始碼／技法與可重現流程。可沿用現有 `ATN`／`JSX`／`SCRIPT`／`WORKFLOW`／`RECIPE` 類型，與 A 一起進同一 `catalog/entries.json`，嚴守現行三類主頁展示限制。
- 每批先刊登已核實來源，提供 USER 在 PIN 觀看、篩選及討論；再按回饋調整下一批。不可用研究候選數推估 Runtime 支援度，亦不可把付費下載品標成免費。
- 此批為資料收錄，沒有使用 IMAGE、沒有更動 INK Core，亦沒有獲得 USER 瀏覽器視覺驗收。

## G. 2026-10-11 USER clarification — collect actual Recipe/JSX, not reference websites

USER clarified that Sanna Annukka / Evan Hecox / PosterLad / Tony Sjöman are style search references only, NOT the items to be shown in PIN. The four `PR-001`–`PR-004` portfolio cards were removed from the active catalog. New source commit `024ea304c5839da7a599bb7856e9443ce8e30b25` adds three source-traceable Illustrator JSX candidates: `R-JSX-001` RepeatAfterMe grid/brick repeats, `R-JSX-002` IllustratorArt CMYK random rectangles, and `R-JSX-003` creold Illustrator scripts (library lead; requires per-script qualification). Existing `G007`/`X002` Processing Posters and `X001` generative-poster were already in PIN, so they were not duplicated. Active catalog = 61 records.

Source research is NOT INK Runtime support: three additions are `untested` and must be assessed per-script for external dependencies, translation boundary and artwork quality before runtime or visual reproduction claims. Keep artist websites as SEARCH CRITERIA only; continue finding finished-output-backed technical recipes/JSX in small batches. No IMAGE generation.

## H. 2026-10-11 JSX thumbnail-first correction

USER requires visual examples BEFORE judging source quality. Updated three newly collected JSX records in the canonical `catalog/entries.json`: `R-JSX-001` uses Josh Duncan's official README RepeatAfterMe preview image, `R-JSX-002` uses jsmentch's repository README linked related sample (not guaranteed exact execution of example 03), `R-JSX-003` is no longer a generic script-library card but the specific `RandomScribble.jsx` with creold's official documentation GIF. Source/catalog commit `2afa3b3a3f380a5a5ed5dc6c78c1690d6b52e4ec`. Preserve honest preview provenance, licensing and `INK_UNTESTED`; no generated or unrelated thumbnails. Website deployment / actual browser image loading is a separate verification.
