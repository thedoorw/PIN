# PIN 同 Repo 發布與驗證規則

## GitHub Pages

- `thedoorw/PIN/main` 是網站、型錄資料與 Recipe 唯一工作來源。
- `index.html`、`app.js` 與 `catalog/entries.json` 必須一起可用，路徑使用 **相對路徑**，支援 `/PIN/` 子目錄。
- Repo 管理者至 **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)** 啟用靜態發布。
- 沒有額外 npm build、Val Town、外部 Blob API 或 INK-Browser-QA 動態服務依賴。
- Pages 網址預計 `https://thedoorw.github.io/PIN/`，**未經實測不可聲稱已成功發布**。

## 發布檢查

執行 `node tools/verify.mjs`，確認 JSON 與 JavaScript、ID 唯一、沒有混入已知付費資料、作品來源及必要相對路徑。網站測試最少包含：目前三類（海報／字體／成熟作品）篩選、縮圖原作連結、來源限定下拉、右側無文字篩除勾選、三點設定的 click-away／Escape、本機設定與正式外觀載入。對完整瀏覽器互動、來源圖是否可載入及部署版本身份不應推測。

**USER 已放棄舊 Val Town 個人資料移轉**，改為在 GitHub Pages 的 PIN 重新篩選。舊專案刪除僅限 `thedoorw/ink-visual-catalog-demo`，先核實 Pages 狀況及真正刪除對象；不可刪除其他 Val、GitHub Repository 或歷史研究。

舊 Val Town PIN 專案已有 USER 刪除授權，但尚未執行。任何 INK 主程式修改仍須遵守 INK-Browser-QA Private SSOT 與正式權責。

## 網站外觀設定

公開名稱與 Favicon 以 `config/site.json` 為準；網站面板可先在瀏覽器本機預覽，匯出 JSON 並提交 Repo 後才會公開。參考 [PIN_SITE_SETTINGS.md](./PIN_SITE_SETTINGS.md)。

## PIN 2026-10-11 瀏覽介面

每張 PIN 的詳細資料下拉只呈現作者／作品來源連結，勾選篩除移到來源下拉上方右側。其他過時的每卡操作不再顯示。三點設定點留白關閉；資料仍由 `catalog/entries.json` 提供。
