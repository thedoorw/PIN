# PIN G0 共用外框實作設計 v0.1

**狀態：G0 首輪版面已實作於 PIN main、GitHub Pages 部署成功；USER 已確認三項指定的正式網站視覺對齊，判定 G0 對齊 checkpoint 通過。其他互動功能與全部響應式畫面未因此自動判定通過。1280px 範例仍是模矩研究基準，不是寫死的框寬。**
2026-10-20；依據 [PIN UI 模組化與共用排版契約 v0.2](./PIN_UI_MODULE_LAYOUT_CONTRACT_v0.2.md) 與 [16px 模矩探索](./PIN_SHARED_LAYOUT_GRID_EXPLORATION.md)。
`thedoorw/PIN/main` 為唯一來源。本文件不更動正式 HTML／CSS／JS、Google Sheets 或私人研究資料。

## 一、G0 的唯一責任

G0 PageShell 不製作新畫面功能，只為 **00（未來）／01 標頭／02 分類／03A 照片牆／03B 研究文件**提供同一套：
- 視窗中心、捲軸預留、水平左右總留白；
- 共用左、右邊界 L/R，最大內容寬度；
- 模組之間的垂直間距 token；
- 響應式容器尺寸；不管畫面內容增加多少，外框不另起一套規則。

01／02／03 的「自身內部」排版留在其所屬模組；G0 **不直接掌管表格欄位寬度或卡片內容高度**。

## 二、尺寸規律：先有數學關係，數字是候選

### 2.1 基礎尺寸

| Token／規則 | 首輪設計值 | 責任 |
| --- | ---: | --- |
| `--pin-unit` | 16px | 基礎模矩 |
| `--pin-shell-padding` 桌面（>960px） | 48px = 3u | PageShell 左右**內**留白 |
| `--pin-shell-padding` 中螢幕（641–960px） | 32px = 2u | PageShell 左右**內**留白 |
| `--pin-shell-padding` 小螢幕（≤640px） | 16px = 1u | PageShell 左右**內**留白 |
| `--pin-content-max` | 1440px = 90u | 內文 L 到 R **最大寬度** |
| `--pin-gallery-gap` | 16px = 1u | 照片牆四欄間距**候選** |
| `--pin-header-nav-gap` | 24px = 1.5u | 01 → 02 |
| `--pin-nav-content-gap` | 16px = 1u | 02 → 03A／03B |
| 主內容最上方內距 | 16px = 1u | 頁面頂部 → 01（00 尚未存在） |

寬度是**設計候選**，不是永遠固定 64／276。上列斷點沿用 PIN 現有 960／640 切換作第一輪驗證，不宣告其已是最佳斷點。≤355 的單欄縮圖門檻暫沿用現狀。

### 2.2 同一個 PageShell 公式

令 `W` 為包含經典捲軸的完整視窗寬度，`s` 為瀏覽器每側 `scrollbar-gutter:stable both-edges` 實際保留的寬度（overlay scrollbar 可為 0），`p` 為 G0 的單側 padding，`K=1440` 為內容最大寬度：

- `A = W - 2s`：gutter 之間的可用 viewport 寬度。
- `T = min(A, K + 2p)`：PageShell 的**含 padding**總寬。
- `B = T - 2p`：真正共用內容寬，即 `R-L`，不得被其他模組改寫。
- `M = (W-B)/2`：完整視窗兩側**總留白**，包括 gutter、主容器外側自動 margin、內部 padding。
- 桌面照片牆 `N=4`，框距 `G=16` 時，`C = [B-(N-1)G]/N`。若畫面不足，照目前 3／2／1 欄斷點切換。

依 `scrollbar-gutter:stable both-edges`，左右捲軸預留**對稱**；所以左右留白同為 `M`，不用猜 15px 或用 JS 人工左右平移。頁面擁有最大內容寬度，寬螢幕多出來的空間由左右自動 margin 吸收。

### 2.3 1280px 範例的正確解讀

若 `W=1280` 且 `s=16`：`p=48`，則
- `A=1248`；
- `B=1248−96=1152`；
- `M=(1280−1152)/2=64`；
- `C=(1152−3×16)/4=276`。

即使用者提出的候選：**64 + 4×276 + 3×16 + 64 = 1280**。

**重要**：`s=16` 只是範例條件，**不是固定瀏覽器捲軸寬**。例如 `s=15`，則 `M=63`、`C=276.5`；捲軸是 overlay、`s=0` 時，`M=48`、`C=284`。三種情況都保持**真正視窗置中**，不因捲軸出現／消失而偏移。

### 2.4 手算檢查矩陣（示例，以 s=16）

| 完整視窗 W | 單側 p | 內容 B | 照片牆欄數 | 框距 G | 單框 C | 左右總留白 M |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1280 | 48 | 1152 | 4 | 16 | 276 | 64 |
| 1440 | 48 | 1312 | 4 | 16 | 316 | 64 |
| 1920 | 48 | 1440（達上限） | 4 | 16 | 348 | 240 |
| 960 | 32 | 864 | 3 | 16 | 約 277.33 | 48 |
| 640 | 16 | 576 | 2 | 16 | 280 | 32 |

表內 s=16 與欄數僅作設計算式驗證；實際 gutter、捲軸與斷點仍待 Chrome 驗證。寬度不整除時允許瀏覽器做亞像素分配，不用人工四捨五入每卡造成水平溢出。

### 2.5 USER 新增構想：01 標頭左側內容內縮 16px（2026-10-20）

**USER 期待：**「標頭始終比下方內容左側邊界退縮 16px」，避免標頭與照片牆共線時，後續縮圖的視覺量體造成對齊混亂。這是**有意識的視覺層級差**，不是 G0 左右總留白計算錯誤。

定義兩種座標：
- **主內容左基準線 L：** 02 分類導覽的模組外框、03A 照片牆首框左緣、03B 研究表格外框等仍依 G0 的 L 定位。
- **標頭文字／左側內容起點 H = L + 16px：** 01 標頭內的 PIN 名稱與其下方自訂文字一起內縮 16px；**所有視窗寬度都保留此相對差距**，不因 RWD 變回齊 L。
- **標頭模組自身仍占用 L 到 R 的外框**；右上搜尋及設定仍向共用右基準 R 對齊。不能用移動整個 `header`、放大整頁 padding 或負 margin 的方式實作。
- 00 TopNav 尚未設計，**不自動繼承**此 16px 內縮；02/03 亦不跟著內縮。日後若其他模組需要視覺縮排，應另外明確定義所屬子層與來源 token。

單一參數候選：`--pin-header-leading-inset: 16px`（= 1u），由 **01 Header 內部排版**使用，而非覆蓋 G0 的 L/R；如此既維持共用外框，又容許刻意的視覺錯位。

**狀態：新加入之 USER 設計構想，尚未編輯正式 CSS／尚未瀏覽器驗收。** 與原先「全部文字都從 L 開始」的草案不同，已明確區分「模組外框基準線」與「模組內部文字起點」。

## 三、共用縱向節奏：每個區段間距只有一名擁有者

目前 `header{margin-bottom:24px}`、導覽區自己有 padding、照片牆 `margin-top:13px`、研究表格 `padding-top:6px`，來源重複。

首輪設計：
1. **頁面頂部 → 01**：G0 padding-block-start = 16px。
2. **01 → 02**：G0 的唯一模組間距 = 24px。01 高度由內容決定，不額外設定固定高度。
3. **02 → 03**：G0 的唯一模組間距 = 16px。**03A 和 03B 共用**；Gallery 自身 13px top margin、Research 自身 6px top padding 不再另加。
4. 03A 與 03B 內部各自有工具列、卡片、表格、說明文字，但不得覆寫 03 的共用起始 Y/L/R。
5. **00 未建立**：不放置空白 placeholder、不提前增加任何高度；正式增加 00 後，G0 根據實際模組加入新的分隔 token。
6. 02 現有 sticky top:0 保持；未來 00 若設 sticky 必須重算 02 的 sticky offset，不能互相遮擋。

**G0 只有模組分隔權；模組內距／按鈕間距各歸原元件。** Nav sticky 的 padding 8px（候選）屬於 Nav 自身的高度，不與 01→02 的 24px 重複計算。

## 四、CSS 實作輪廓（設計樣板；尚未套用）

```css
/* Concept only. The final implementation must preserve existing interactions. */
:root {
  --pin-unit: 16px;
  --pin-content-max: 1440px;
  --pin-shell-padding: 48px;
  --pin-gallery-gap: 16px;
  --pin-header-nav-gap: 24px;
  --pin-nav-content-gap: 16px;
}
html { scrollbar-gutter: stable both-edges; }

/* Same class can be used by 00's future inner frame and current main. */
.pin-shell {
  box-sizing: border-box;
  width: 100%;
  max-width: calc(var(--pin-content-max) + var(--pin-shell-padding) + var(--pin-shell-padding));
  margin-inline: auto;
  padding-inline: var(--pin-shell-padding);
}
@media (max-width: 960px) {
  :root { --pin-shell-padding: 32px; }
}
@media (max-width: 640px) {
  :root { --pin-shell-padding: 16px; }
}
/* 01/02/03 share L/R; spacing applied on a single structural wrapper. */
.pin-module-header { margin-block-end: var(--pin-header-nav-gap); }
.pin-module-content { margin-block-start: var(--pin-nav-content-gap); }
.pin-gallery-grid { gap: var(--pin-gallery-gap); }
```

**整合註記**：目前網站使用 `main`、`.filter-shell`、`#cards.grid`、`#pin-private-research` 的原始 DOM。真正實作時應先建立共用 `pin-module-content` 結構（涵蓋互斥的 Gallery／Research）再移除舊的個別 margin/padding；不得只把上述 CSS 直接疊到舊樣式產生雙倍間距。新 shell class 需用一致的 L/R 契約，不可為 00 導覽列另設一套座標。

## 五、目前程式需移除／收斂的分散規則

| 位置 | 現狀 | G0 實作方向 |
| --- | --- | --- |
| `styles/base.css` `main` | max-width 1580px、左右 padding 59px | 一個 shell 最大內容 1440px、候選分段 padding 48／32／16px |
| `styles/base.css` `.pin-head-actions` | `right:-32px` | 交由 Header 靠 R 對齊，操作按鈕不得向右穿出 shell |
| `styles/base.css` `header` | `margin-bottom:24px` | 轉移為 01→02 單一 module-gap token，不疊加 |
| `styles/gallery.css` `.grid` | `gap:15px` + `margin-top:13px` | 框距候選 16px；頂部外距改由 02→03 token 獨占 |
| `styles/research-sheet.css` `#pin-private-research` | `padding-top:6px`（手機 5px） | 不再用這一層定義 02→03 的距離；保持表格、Sheets 資料原狀 |
| 00 TopNav | 尚未存在 | 只預留設計規則，不建立 DOM、高度或假功能 |

## 六、驗證與放行

1. **幾何**：1280、1440、1920、960、640px；量測 Header/Nav/Gallery/Research 的可見 L/R；左右 viewport 總留白對稱；達最大內容寬後不再增加；框距一律用既定 token。
2. **捲軸**：頁面垂直捲軸出現／消失不讓中心左右跳動（對稱 gutter），狹窄視窗只有實際表格溢出才有內部**水平**捲動，body 不額外出現水平捲軸。
3. **垂直**：01→02 唯一 24px，02→03A/03B 唯一 16px；切換內容後起始 Y 不漂移；Nav sticky 不遮擋內容。
4. **功能回歸**：照片牆分類／卡片連結／搜尋／設定，及私人研究 Google OAuth／讀寫／超連結／列高欄寬操作，必須保持正常；不把 Google 資料帶入公開 repo。
5. **狀態**：文件已建立不等於原始碼已落地；提交 GitHub 不等於 Pages 已載入；部署成功也不等於 Chrome／USER 視覺驗收成功。

**下一個交付閘門**：待 USER 接受 G0 的水平與垂直分配，再以最小必要變更改正式 CSS／HTML，搭配實際截圖及功能核對。不可在研究文件階段搶先宣稱功能完成。

## 七、2026-10-20 G0 首輪實作與驗證紀錄

USER 在確認 01 標頭左側文字 `L+16px` 構想後指示「就先這樣，你可以繼續了」，首輪實作依此範圍進行。**僅正式套用 G0 排版，不增加 00 頂部導覽列功能。**

- `styles/base.css`：建立 `--pin-*` tokens、可重用 `.pin-shell`，最大內容寬 1440px；桌面／中尺寸／手機的單側內距 48／32／16px。保留 `scrollbar-gutter:stable both-edges`；標題與自訂文字相對 Gallery 左緣 `+16px`；設定按鈕 `right:0`；標頭→導覽 24px、導覽→照片牆／研究文件 16px。
- `styles/gallery.css`：保留桌面四欄與原 RWD 欄數，欄距／列距採共用 16px token；移除原 13px 自定上距與手機 9px 框距。
- `styles/research-sheet.css`：取消研究模組自身 6px（手機 5px）頂部內距，改由 G0 統一提供；維持原有動態欄位、表格讀寫與必要時的水平捲動。
- `index.html`：`<main class="pin-shell">`，更新三份 CSS 的 cache-busting 版本。未改動 `app.js`、`research-sheet.js`、Google Sheets、型錄或 INK。
- 相關 CSS/HTML 最後一筆實作提交：`5f612ff993d4c638fd1352b3fe4305ce7a19e38e`，GitHub Pages run `39366528881`：`success`。
- 本機 Chromium **獨立版面測試夾具**驗證 1920／1440／1280／960／640／390／320px：左右總留白對稱、標題與自訂文字 `L+16px`、Gallery／Research 外框及起點一致、主要內容無水平溢出等測試全部通過。**測試夾具不是從正式 PIN 載入的瀏覽器頁面**，不能以此宣稱 Live UI/Google OAuth/私人研究操作 PASS。
- **下一個 USER checkpoint**：打開 `https://thedoorw.github.io/PIN/`，驗收「全部」照片牆和「研究文件」的邊界、標頭 16px 內縮、捲軸、右側設定位置；實際畫面可接受後，再推進 00 頂部導覽列或恢復 INK 的轉譯研究，不因額外美化持續阻塞創作。

**設計數值的性質**：48／32／16px PageShell padding 與 16px Gallery gap 是本輪實作值；若 USER 後續釐清更穩定的模矩規律，可由唯一 G0 token 統一調整，而不再修改各個模組的硬編碼。

## 八、2026-10-20 USER 正式視覺驗收 — G0 對齊 checkpoint 通過

USER 已在正式 PIN 查看後明確確認以下三項**都處理好了**：

1. **01 標頭左側內容相對下方主內容內縮 16px**。
2. **03A 照片牆左右留白**的視覺對稱。
3. **切換至 03B「研究文件」時，外框仍維持對齊**。

**狀態：上述三項 USER_VISUAL_ACCEPTANCE = PASS（2026-10-20）。** 不再把它們列為「等待 USER 驗收」，後續修改不得無故破壞或重新採用局部負邊距修補。

**範圍限制：** 這是使用者針對以上三項視覺表現的確認，不等於 Google OAuth／儲存格寫入／超連結／每種視窗寬度／所有瀏覽器互動均已驗收通過，也不代表 00 頂部導覽列已製作。

**下一步：** 固定 G0 作為其餘 UI 模組的共同排版基線；回到使用者優先的 INK 創作與轉譯測試。00 頂部導覽列保留規劃，不因尚未實作而阻擋轉譯研究。

## 九、00 TopNav 新增（2026-10-20；待瀏覽器驗收）

繼 USER 確認 G0 三項對齊通過後，新增 **00 頂部導覽列**：

- 高度 **48px**（對應 INK 現行左側單欄工具列寬度 48px，亦為 3×16px 模矩）；採正常文流，**不 sticky**。
- 內部沿用 G0 `.pin-shell`，LOGO 文字／圖片對齊照片牆左邊界 L；搜尋與設定同一組原有控件靠 R；非另造功能假入口。
- 01 標頭 `L+16px`、02 分類與 03A／03B 內容外框保留既有共用對齊規則；Gallery 四欄與 Research 私人資料欄位不修改。
- `site-settings.js` 新增獨立的 LOGO 文字／圖片預覽、儲存及匯出欄位；未修改使用者既有網頁名稱／Favicon／私人試算表。
- GitHub Pages 完成部署；**LOGO 顯示、搜尋、設定展開及手機視覺仍待 USER 正式 Chrome 驗收**。原有 G0 三項已通過的驗收不因此取消。

此新增不改動 G0 排版中心、左右捲軸預留及主模組欄寬，未來 00 若要改 sticky，必須重新檢查 02 的 sticky offset。
