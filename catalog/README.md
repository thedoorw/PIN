# PIN 型錄資料規則

`catalog/entries.json` 是 PIN **唯一的權威型錄索引（SSOT）**，由本 Repo 的 `app.js` 直接讀取。不要同時另維護一份「網站專用版」或從 INK-Browser-QA 動態取數。

## 欄位及判準

- `id`：永久研究 ID，維持瀏覽器個人註記的相容性。
- `title`／`type`／`description`：作品、技術與工具的基本資料。
- `url`：原始研究或技術來源（可以是 GitHub repository，但放在「詳細資料」）。
- `image`：來源圖片網址；`showcaseUrl`：縮圖應連到的作品展示／原始預覽，不能隨意指向 GitHub 資料夾。
- `imageEvidence`、`showcaseKind`、`credit`：來源性質；來源總覽圖不等於特定作品成品。
- `styleTags`：幾何形、人物、臉孔、靜物、立體派、Collage 等可複選的**暫定**視覺分類。
- `access`：free / paid / unknown。**unknown 不等於免費**；已確認須付費者不納入活躍型錄。
- `testStatus`：是否已有 INK 執行證據；未試作不得宣稱已經重現。

## 增加與整理

新增時先核對真實作者展示與取得條件，再寫入獨立 ID。相同圖片可以合併為一個**展示卡**，不能刪除有意義的獨立技術研究、改寫其 ID 或遺失關聯。若作品只有原始程式碼而沒有示範，保留無圖連結型條目，不借用無關縮圖。

Recipe 相關詳細轉譯存在 [recipes](../recipes/README.md)，但每一份的 PIN-ID 都必須指回本索引；完整 Recipe 不須直接重複塞進卡片元資料。

私人匯出備份不在本公開型錄資料內。
