# PIN 同 Repo 發布與驗證規則

## GitHub Pages

- `thedoorw/PIN/main` 是網站、型錄資料與 Recipe 唯一工作來源。
- `index.html`、`app.js` 與 `catalog/entries.json` 必須一起可用，路徑使用 **相對路徑**，支援 `/PIN/` 子目錄。
- Repo 管理者至 **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)** 啟用靜態發布。
- 沒有額外 npm build、Val Town、外部 Blob API 或 INK-Browser-QA 動態服務依賴。
- Pages 網址預計 `https://thedoorw.github.io/PIN/`，**未經實測不可聲稱已成功發布**。

## 發布檢查

執行 `node tools/verify.mjs`，確認 JSON 與 JavaScript、ID 唯一、沒有混入已知付費資料、作品來源及必要相對路徑。網站測試最少包含：ATN/JSX/SCRIPT/RECIPE 切換、風格多選、縮圖連結、詳細資料、備註勾選、匯入及匯出。對完整瀏覽器互動、來源圖是否可載入及部署版本身份不應推測。

**先移轉個人資料再考慮關閉舊站：** Val Town 與 GitHub Pages 不是相同網域，私有 localStorage／IndexedDB 不會自動同步。舊站匯出含本機圖片的 JSON，在 Pages 新站匯入，確認沒有資料遺失。

未獲使用者同意前不刪除舊 Val Town 網站，也不改動 INK 主程式。

## 網站外觀設定

公開名稱與 Favicon 以 `config/site.json` 為準；網站面板可先在瀏覽器本機預覽，匯出 JSON 並提交 Repo 後才會公開。參考 [PIN_SITE_SETTINGS.md](./PIN_SITE_SETTINGS.md)。

## PIN 2026-10-11 瀏覽介面

每張 PIN 的詳細資料下拉只呈現作者／作品來源連結，勾選篩除移到來源下拉上方右側。其他過時的每卡操作不再顯示。三點設定點留白關閉；資料仍由 `catalog/entries.json` 提供。
