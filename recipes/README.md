# PIN — Recipe 工作區

PIN 的 Recipe 與型錄是同一套長期創作資料庫，**不必跨 Repo Publish**。

- 正式索引：[catalog/entries.json](../catalog/entries.json)（以 `type: RECIPE` 篩選）。
- [Recipe 格式 v0.1](./RECIPE_FORMAT_v0.1.md)：研究轉譯的資訊與驗證要求。
- [初始草稿](./drafts/)：G001–G005 五件獨立研究案例，尚未證實能在 INK 執行。

## 工作狀態

`COLLECTED → ANALYZED → TRANSLATED → INK_TRIED → VERIFIED`

- COLLECTED：有真實來源與創作目標。
- ANALYZED：分析作品結構與必要條件。
- TRANSLATED：提出可供 INK 嘗試的參數與動作。
- INK_TRIED：已有實際 INK 嘗試紀錄，成功失敗皆需留存。
- VERIFIED：有可重現、可追溯的成功結果。

狀態不得越級虛報。**PIN ⇄ INK** 雙向迭代 Recipe 與創作成果；只有主程式問題需修正時才回 INK-Browser-QA。

新增 Recipe 草稿以原研究編號命名（例如 `recipes/drafts/G006.md`），不自行重複創造作品索引。
