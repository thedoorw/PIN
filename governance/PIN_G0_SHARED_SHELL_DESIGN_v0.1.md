# PIN G0 共用外框實作設計 v0.1

**狀態：已提出可實作的幾何方案，待 USER 視覺核准；非正式網站已完成。**
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
