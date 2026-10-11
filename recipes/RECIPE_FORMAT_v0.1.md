# PIN Recipe 研究格式 v0.1

建議每一份 Recipe 記錄包含：

| 欄位 | 定義 |
|---|---|
| PIN-ID | 與 `catalog/entries.json` 的永久 ID 一致 |
| Status | COLLECTED / ANALYZED / TRANSLATED / INK_TRIED / VERIFIED |
| Reference | 原作者、原作示範、技術資料、授權條件 |
| Visual Target | 希望達到的形狀、構圖、層次、視覺效果 |
| Parameters | 幾何、顏色、尺寸、密度、隨機種子、材質與變體（未知請明示） |
| Steps | INK 或使用者可以重現的步驟 |
| Evidence | 輸入、輸出、執行環境、成功失敗與差異 |
| Feedback | 使用後如何調整 Recipe 的紀錄 |

這是可持續進化的研究格式，不代表已經存在可執行的 INK Recipe Schema。**不能用單純描述或未實證的猜測取代已驗證執行結果**。
