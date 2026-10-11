# PIN UI 與型錄整理待辦 — 使用者意見彙整

**狀態：58 筆型錄與介面前三項已實作、Pages 發布成功；實際 USER 瀏覽器互動驗收尚未回報；Val Town 舊專案刪除待執行；後續等待 USER 提供 Recipe 參考網站。**

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
VAL_TOWN_RETIREMENT       = PENDING; exact target thedoorw/ink-visual-catalog-demo
USER_CHECKPOINT_REQUIRED  = USER supplies website references before new Recipe discovery; deletion tool confirmation if required
NEXT_EXECUTABLE_ACTION    = confirm live UI behavior + delete only obsolete Val Town catalog; then wait for USER examples
```

**本次換窗只作 GitHub SSOT 狀態登錄，沒有新增 UI 功能、沒有刪除 Val Town。**

已完成的三項（不可在新視窗誤判為未開始）：
1. 網頁右上角的 36px 級別 `⋯` 設定按鈕；設定打開後可點面板外或按 Escape 關閉，原設定內容保留。
2. 每張 PIN 展開欄位只呈現來源連結；過時的備註、測試、標籤編輯及縮圖管理不再在卡片詳細區呈現。
3. 無文字的「不考慮」勾取方塊移到研究 ID 右側、下拉上方，原 localStorage 標記機制仍在。

以上有 GitHub source commit 與 Pages SUCCESS，**尚不代表真實瀏覽器點擊、可見對齊、個人標記等全面 PASS**；新視窗先查看當前網站 `https://thedoorw.github.io/PIN/` 及必要的互動證據，不能只因 Actions SUCCESS 宣稱使用者已驗收。

USER 已表示不需要 Val Town 舊資料，明確要求完全移除過時網站；只授權處理原 PIN 舊 Val `thedoorw/ink-visual-catalog-demo`，不得誤刪其他 Val 或 GitHub 資料。確認 GitHub Pages 仍獨立可用後可依工具的永久刪除確認流程處理，並核實刪除結果。此動作**目前尚未執行**。

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

舊 Val Town 僅限 `thedoorw/ink-visual-catalog-demo` 作為待刪除對象，須先證明 GitHub Pages 新版可發布，再依 Val Town 刪除工具的永久刪除確認要求完成（其餘專案不可動）。
