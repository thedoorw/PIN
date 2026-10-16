# PIN UI 模組化與共用排版契約 v0.1（2026-10-16）

**狀態：第一輪結構盤點與規格草案；尚待 USER 視覺確認；未套用到 CSS／JS／正式網站。**

## 1. 為什麼先做模組化

PIN 現有頁面已多次因照片牆的外距／捲軸、研究表格的寬度／內部捲動而反覆修補，拖慢後續 INK 轉譯測試。目標不是再調一輪局部 px，而是讓每個畫面區塊遵守**同一套外框、基準線、模矩及責任分工**，後續新增介面只需遵循契約，不再個別拼湊。

**先固定規律，再決定數值；先做版面規格，再做程式拆分或 CSS 落地。**

## 2. 目前 PIN 畫面由上而下（已據 GitHub main 原始碼核對）

| 順序／代號 | 現有 DOM | 畫面職責 | 當前原始碼設定／觀察 | 目標對齊 |
| --- | --- | --- | --- | --- |
| G0 共用頁面外框 | `html > body > main` | 全頁寬度、置中、兩側捲軸留位 | `html{scrollbar-gutter:stable both-edges}`; `main{max-width:1580px;margin:auto;padding:16px 59px 44px}`；手機 ≤640px padding 左右 10px | 所有可見模組使用**同一個內容左線 L 與右線 R** |
| M1 網站標頭 | `header`／`.site-brand-row`／`#pin-custom-caption` | PIN 名稱、自訂文字、右上搜尋／設定 | 標題 line-height 40px；右側按鈕 36×36px；`.pin-head-actions{right:-32px}` 目前超出內容右線；`header{margin-bottom:24px}` | 標題靠 L、操作靠 R；自訂文字從 L 向右延展，不影響 R |
| M2 分類導覽 | `.filter-shell > nav.category-bar` | 全部／海報／字體／成熟作品／研究文件切換 | sticky top 0、上下 padding 10px；標籤按鈕內距 7px 14px、gap 8px；目前 `.pin-controls` 的部分子項由 JS 移入設定面板 | L→R 同寬；導航標籤從 L 起；控制列與主內容不互相擠壓 |
| M3A 照片牆內容（選項 A） | `#cards.grid` → `.card` | 縮圖、名稱、來源與研究 ID | 桌面 4 欄、gap **15px**、margin-top **13px**；縮圖 `.art` 3:2；≤960 3 欄、≤640 2 欄、≤355 1 欄 | **照片牆首框左緣 L、末框右緣 R**；卡片寬由內容寬與間距計算 |
| M3A-2 分頁／追加 | `.load-wrap` | 顯示更多 | margin 上下 22px，按鈕置中 | 跟隨照片牆內容區置中；不得改變外框 |
| M3B 研究文件（選項 B） | `#pin-private-research` | 私人文件畫板（與照片牆互斥） | 寬度 100%、padding 上 6px 下 20px；有 Google 登入狀態與實際表格兩種畫面 | **與照片牆共用 L/R**，不另外訂一套左右留白 |
| M3B-1 研究工具列 | `.pin-research-board-head` | 筆數、新增、重讀、尺寸還原、Google Sheets 入口 | flex、wrap、gap 8px、margin-bottom 6px | 操作起點 L，排列可換行但不撐寬容器 |
| M3B-2 研究資料表 | `.pin-research-scroller > .pin-research-table` | 目前來源 Sheets 的動態欄位、編輯與連結 | 外框寬 100%；表格平時 100%；確實溢出才切水平捲動；垂直由整個頁面捲動；預設列高 64px | 表格外框 L/R 一致；欄寬可以因資料／編輯動態調整，不影響全頁基線 |
| M3B-3 狀態說明 | `.pin-research-bottom-note` | 儲存提醒與協作說明 | font 11px，line-height 1.7，margin-top 11px | 跟隨研究內容區 L |
| M4 浮動設定（非文流的獨立模組） | `#site-settings-panel > .site-settings-sheet` | 網站外觀、研究授權、進階篩選、管理工具 | width min(440px, 100vw-28px)；定位於觸發按鈕正下方；含自己的面板捲動。 `app.js/setupGalleryFirstLayout()` 會把部分 UI 節點移入此處 | 定位以觸發器／R 為錨，**不參與主內容分欄、不造成水平溢出** |
| M5 頁尾（目前隱藏） | `footer` | 補充說明 | `base.css` 設為 `display:none` | 只有重新啟用時才定義間距，現階段不干擾上方模組 |

> M3A、M3B 是同一頁**切換顯示**的兩個內容面，不是左右並排。M4 設定面板是浮層，不可視為佔主內容寬度的另一欄。已被 JS 移入設定面板的篩選／資訊，也不能因 HTML 原本位置而誤認為常駐畫面。

## 3. 共用排版契約（擬定規則；取代各模組獨立硬編碼）

### 3.1 外框與水平座標

- 單一 **PageShell** 擁有 viewport、捲軸 gutter、最大內容寬及響應式左右留白；M1、M2、M3A、M3B 不可重複設定對外負外距或獨立中心軸。
- 定義共同左線 `L`、右線 `R`；對任一主模組 `module.left = L`, `module.right = R`。內部縮圖或表格單元可以另外分欄，但模組外邊界不得漂移。
- 實際瀏覽器卷軸／gutter 必須納入整體視窗中心，不可把「扣除右側捲軸後的內容區中心」誤認成使用者所要求的視窗中心。
- 功能按鈕、浮層可單獨錨定於 R，不得靠 `right:-32px` 之類的局部偏移繞過頁面規則。

### 3.2 基本模矩、照片牆

- **16px 是目前正在探索的基礎模矩**，不是「每個尺寸必須被 16 整除」；可使用 8／16／24／32px 節奏，實際應在瀏覽器驗證後決定。
- 桌面照片牆維持**四欄**（明確排除五欄）；列距、欄距先以 16px 為候選，共用同一 token。不擅自更動現行響應式斷點。
- 既定**候選計算範例**：1280px 視窗，兩側**總留白各 64px（包含捲軸／gutter）**，四個縮圖框各 276px，三個欄距各 16px：`64 + 4×276 + 3×16 + 64 = 1280`。**這是用以找規律的範例，不是固定 CSS 值。**
- 一般式：`C=(W-2M-(N-1)G)/N`，W 為**完整視窗寬度**，M 為兩側包含 gutter 的**總留白**，N 為欄數，G 為框距，C 為單框寬。不同視窗尺寸選擇合適 M/N，**C 由公式自動算出**。
- 卡片內部結構（3:2 圖面、名稱、來源、ID）只歸 **GalleryCard** 管理；卡片不自行改變外部 gap、PageShell、導航位置。

### 3.3 垂直區塊與對齊

- **Header** 先決定自身內容高度；Header→Nav 的區段間隔只歸共用 Layout token 管理，不能由上區 margin + 下區 padding 各加一份未定義空白。
- **Nav** 保留 sticky 行為；tab 的文字與互動熱區由 Nav 自己處理，**Nav→Content** 間距全頁統一（Gallery／Research 不再分別採 13px／6px）。
- **MainContent** 佔滿 L/R；照片牆與研究表格都是 MainContent 的視圖切換，使用相同的區塊起始 Y 和外框。
- **Overlay**（設定）與頁面區塊分開管理；其展開／收合不推擠內容，超過視窗時可有自己的捲動，不讓整頁產生橫向 scrollbar。
- 預計將垂直間距整理為單一階梯（例如 `8/16/24/32`），**最終值仍待實際視覺判斷，不在此視為驗收通過**。

## 4. 責任歸屬／如何真正做到模組化

| 領域 | 建議唯一負責處 | 不可重複定義的規則 |
| --- | --- | --- |
| 全域模矩、容器、水平中心、主區塊上下間距 | 共用 Layout tokens／`styles/base.css` | 各模組不得再覆蓋主容器左右 margin/padding |
| Header／Nav | Header／Nav 專屬樣式或基礎 layout 區段 | 不靠浮動 icon 補位、不把 Nav 分配交給內容模組 |
| 照片牆 | `styles/gallery.css` | 只控制內部欄數、框距、卡片／縮圖；不控制全頁左右留白 |
| 研究畫板 | `styles/research-sheet.css` | 只控制表格／儲存格／工具列；遵守 PageShell L/R |
| 設定浮層 | `styles/settings.css` | 定位依 Header 的右錨點，不更動 PageShell |
| 互動與資料 | `app.js`、`research-sheet.js` | 禁止 JS 用固定 px 修正共用 Layout；現有 DOM 移動先盤點、後拆分，保持功能不退化 |

**模組化不代表立刻拆大量檔案。** 先固定「一條規則只由一個模組擁有」，再決定是否拆 CSS、HTML、JS，以免製造新的分散來源。

## 5. 實施順序與驗收閘門

1. **USER 先確認**上述由上而下模組、共同 L/R 對齊、16px 探索方向；模矩範例保持候選狀態。
2. 統一 PageShell 的水平幾何與 gutter → 對齊 Header/Nav/Gallery/Research 的 L/R；去除右上方 -32px 越界。
3. 統一區塊的垂直 spacing tokens → Gallery gap 候選 16px；Research 的起始 Y 與 Gallery 一致；不改無關功能。
4. 驗證桌面不同視窗寬度（包含 1280px 候選）、窄視窗、瀏覽器有／無卷軸、Gallery/Research 切換。至少核對外框左右、四欄公式、浮層定位、無無故橫向捲軸。
5. 驗證功能不退化：分類切換、卡片連結與篩選、設定開關、Google OAuth、研究資料讀寫、超連結、欄寬／列高拖曳；私有研究資料不公開。
6. **GitHub Pages success ≠ 視覺驗收**：須記錄 commit→部署→實際瀏覽器視覺／操作證據；USER 未看過的畫面不得標為已驗收。

## 6. 本次工作邊界

此文件僅確認**現有畫面模組盤點 + 共用排版契約草案**。不修改網站 HTML/CSS/JS，也不修改私人 Google Sheets、PIN 收藏、使用者內容、INK 程式。正式幾何參數與動態斷點等待 USER 共同確定。
