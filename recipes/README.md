# PIN — Recipe 工作區

PIN 的 Recipe 與型錄是同一套長期創作資料庫，**不必跨 Repo Publish**。

- 正式索引：[catalog/entries.json](../catalog/entries.json)（目前無 RECIPE 類別，未來再依新的收藏結果建立）。
- [Recipe 格式 v0.1](./RECIPE_FORMAT_v0.1.md)：研究轉譯的資訊與驗證要求。
- [原始研究草稿](../research/archive/recipes/)：G001–G005 因本輪僅保留海報、字體及成熟作品，已移至歷史歸檔；尚未證實能在 INK 執行。

## 目前研究個案（非 INK 可執行 Recipe）

- [DC002 — flowshape Truchet 策展海報／來源與 INK 轉譯 Gate](./drafts/DC002.md)：已固定來源 Git SHA、原作 URL、幾何與海報參數，完成 Translator Registry 靜態 admission 檢查；**尚未**在 INK Runtime 執行、沒有合法 Recipe translation 或 Native Preview PASS。沿用既有型錄 ID；不新增 PIN 卡片。

## 工作狀態

`COLLECTED → ANALYZED → TRANSLATED → INK_TRIED → VERIFIED`

- COLLECTED：有真實來源與創作目標。
- ANALYZED：分析作品結構與必要條件。
- TRANSLATED：提出可供 INK 嘗試的參數與動作。
- INK_TRIED：已有實際 INK 嘗試紀錄，成功失敗皆需留存。
- VERIFIED：有可重現、可追溯的成功結果。

狀態不得越級虛報。**PIN ⇄ INK** 雙向迭代 Recipe 與創作成果；只有主程式問題需修正時才回 INK-Browser-QA。

新增 Recipe 草稿以原研究編號命名（例如 `recipes/drafts/G006.md`），不自行重複創造作品索引。
