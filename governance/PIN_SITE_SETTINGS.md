# PIN 網頁名稱與 Favicon

公開版設定檔：`config/site.json`。網站提供右上角「設定」按鈕，支援名稱、Favicon 圖片 URL 或本機上傳（PNG/JPG/WebP/ICO，256 KB 內），立即預覽。

**GitHub Pages 是靜態網站。**「儲存本機預覽」保存在使用者自己瀏覽器的 `pin:site-appearance-preview:v1`，不會修改 GitHub，也不會影響其他訪客。

如要全站公開：使用「匯出公開設定檔」，下載 `site.json`，將它提交至本 Repo 的 `config/site.json`，等待 GitHub Pages 部署。亦可以請 ChatGPT 直接修改該 Repo 的設定檔。這兩個欄位都是公開的，不可放密碼或秘密權杖。

「還原公開版本」只清除自己的本機預覽覆蓋。變更 Favicon 後若瀏覽器仍顯示舊圖，可能需要強制重新載入／新開分頁。若選用第三方圖片，須有合法使用權。

**不在公開網站內保管 GitHub 存取權杖**；如未來要直接在前台發布所有訪客可見的設定，需另外設計身分授權。
