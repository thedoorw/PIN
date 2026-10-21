# PIN — Recipe 工作區

PIN 的 Recipe 與型錄是同一套長期創作資料庫，**不必跨 Repo Publish**。

- 正式索引：[catalog/entries.json](../catalog/entries.json)（目前無 RECIPE 類別，未來再依新的收藏結果建立）。
- [Recipe 格式 v0.1](./RECIPE_FORMAT_v0.1.md)：研究轉譯的資訊與驗證要求。
- [原始研究草稿](../research/archive/recipes/)：G001–G005 因本輪僅保留海報、字體及成熟作品，已移至歷史歸檔；尚未證實能在 INK 執行。

## 目前研究個案（非 INK 可執行 Recipe）

- [DC002 — flowshape Truchet／已完成 PUBLIC Native Path 編輯驗收](./drafts/DC002.md)：**PUBLIC INK File→Open／640 Path 顯示／單一節點編輯／History／Undo／Redo／Save→Reopen PASS**（[Issue #2 收據](https://github.com/thedoorw/PIN/issues/2#issuecomment-6313403538)）。使用的是來源衍生灰階 QA 圖案，**不是**原作者完整 A3 海報重現，也沒有 TypeScript→Recipe Translator PASS；原 Issue／Draft PR 測試線已關閉、不重啟。

## 工作狀態

`COLLECTED → ANALYZED → TRANSLATED → INK_TRIED → VERIFIED`

- COLLECTED：有真實來源與創作目標。
- ANALYZED：分析作品結構與必要條件。
- TRANSLATED：提出可供 INK 嘗試的參數與動作。
- INK_TRIED：已有實際 INK 嘗試紀錄，成功失敗皆需留存。
- VERIFIED：有可重現、可追溯的成功結果。

狀態不得越級虛報。**PIN ⇄ INK** 雙向迭代 Recipe 與創作成果；只有主程式問題需修正時才回 INK-Browser-QA。

新增 Recipe 草稿以原研究編號命名（例如 `recipes/drafts/G006.md`），不自行重複創造作品索引。
