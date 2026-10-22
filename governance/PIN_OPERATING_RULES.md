# PIN 永久操作規則（CHAT / WORK / PIN ↔ INK）

## 跨視窗唯一入口

**先讀 Root [README](../README.md)、本文件及 [我說.md](../我說.md)**，再處理現有工作。GitHub 的 `thedoorw/PIN/main` 是 PIN 的唯一權威狀態；不能每次換新對話就重新問使用者既定工作方法。

## Repo 職責

- **PIN**：蒐集作品、建立視覺型錄、風格分類、收藏 Recipe/JSX/ATN/Script、比較及創作轉譯。
- **INK**：創作、執行與測試可用 Recipe、生成／編輯作品，回饋 PIN。
- **INK-Browser-QA**：僅用於 INK 主程式工程修正、Runtime 驗證或 QA；**不得作為 PIN 日常工作的中介**。

## Google Sheets × CHAT 直接讀取：已實證入口（2026-10-22）

**已驗證（READ PASS）：** 具備已連接 Google Drive 存取權的 CHAT，能**直接透過 Google Drive／Sheets connector** 讀取 PIN 現有的私人「PIN｜私人研究文件與創作研究索引」試算表。這與 PIN 瀏覽器端 `research-sheet.js` 的 Google OAuth 是**兩條獨立授權路徑**；CHAT 不須先在 PIN 網頁登入 OAuth，亦**不必經 INK-Browser-QA** 才能讀取該表。

**可重用、可核查的最短操作：**
1. 從本 Repo [`research-sheet.js`](../research-sheet.js) 讀取現有 `SHEET_ID` 與 `SHEET_NAME`，**不可重新建立一張試算表、猜測 ID 或另創平行索引**。
2. CHAT 在已連接的 Google Drive 工具讀取 `get_spreadsheet_metadata(spreadsheet_id=SHEET_ID)`：實證該文件的唯一 tab 為 `PIN 研究索引`、`sheetId=2034182023`，標題為「PIN｜私人研究文件與創作研究索引」。
3. 使用 `get_spreadsheet_range(spreadsheet_id=SHEET_ID, sheet_name='PIN 研究索引', range='A1:E9')` 等有界讀取；**2026-10-22 已成功讀取**五個標題欄：「研究主題／文件／研究方向／用途與現有內容／狀態／私人文件連結」，以及現有資料列與分類。
4. 如需讀取 E 欄的**文字附帶超連結**而非單純顯示值，使用 `get_spreadsheet_cells` 讀 `'PIN 研究索引'!E2:E9`，fields 包含 `formattedValue,hyperlink,userEnteredFormat(textFormat(link)),textFormatRuns(format(link))`。**2026-10-22 已實測可取得超連結 metadata**。
5. 任務要求讀／修改完整私人技能資料時，應循索引連到經授權的 Drive 文件；不得因試算表有標題便宣稱完整 Skill／Workflow 在 Drive 已建置。**現行已檢查的 E2:E9 有超連結者指向 GitHub**，仍未證明私人技能套件已搬入 Drive。

**安全與驗收界線：** 同一試算表在 2026-10-22 的 Google Drive 檔案 metadata 回報 `shared=false`，權限為單一 `user/owner`；僅此文件的權限狀態，不外推到其他檔案。以上是**此 CHAT 的 connector 真實 READ PASS**，不是對未安裝／未授權的任意新 CHAT 的通行保證；若新視窗的 Google Drive app 已連接，應**直接依最短操作核查，不再從零研究 PIN×Sheets 能否串接**。若缺權限，精確回報 `DRIVE_CONNECTOR_NOT_CONNECTED` 或實際 Google 錯誤，不將其誤認 PIN 功能缺陷。**CHAT connector 寫入尚未實測；本輪沒有變動試算表資料、分享權限或私人內容**。日後 write PASS 須有獨立非破壞性的驗收證據，不能因 PIN 瀏覽器已有 Sheets 寫入程式就推定 CHAT 的 Google Drive connector 已通過寫入。

**角色分工：** PIN 是人類瀏覽私人研究表的前端；Google Sheets／Drive 保存私有研究索引與文件；CHAT 依個人授權直接存取 Google 來源；PUBLIC INK 執行 Native 創作；PRIVATE `INK-Browser-QA` 僅在產品／技術工程缺口時介入。此處只記錄既有連線實證，**不決定將來的私有 Skill Library 最終架構**，不把私人研究內容發布到本 Repo。

## 循環工作方法

1. **讀取**：先讀本 Repo 的 `main`、型錄、Recipe、目前的 USER 指令與未完成驗證。
2. **辨別**：這次是資料收集、創作篩選、Recipe 轉譯、INK 執行，還是 INK 主程式修正？選擇最短路徑。
3. **實施**：只改需要的檔案；不動使用者私人備註、收藏判斷與原作品來源；保持 ID 穩定。
4. **驗證**：程式和 JSON 語法、網頁相對路徑、連結可用性、畫面排列、來源與原作一致性。
5. **發布**：PIN 網站與 Recipe 同 Repo 管理，遵循 [發布規則](./PIN_PUBLISH_RULES.md)。
6. **回報**：提供 commit、實際生效範圍和未驗證事項；不能把 API HTTP 200 說成實際瀏覽器驗收。

## 禁止事項

- 使用者未明確要求不得啟動 IMAGE（生成、重畫、風格轉換、修改）。
- 不得擅自改寫或填入 [我說.md](../我說.md)，這份文件保留給使用者表達。
- 不要把所有來源強迫填縮圖或重複使用示意圖來製造作品數量。
- `access: unknown` 不得假裝免費；來源圖片／程式如無再散布授權不得擅自上傳 Public Repo。
- 個人標記、備註和圖片仍儲存在瀏覽器，搬網域需先匯出、匯入與驗證。
- PIN/INK 間直接交換創作結果與 Recipe，不把 QA 工程管線當作每次創作的必要程序。
