"use strict";
(() => {
  const STORAGE_KEY = "pin:site-appearance-preview:v1";
  const DEFAULT = { siteName: "PIN", faviconUrl: "./assets/favicon.svg", caption: "", navLogoText: "PIN", navLogoUrl: "" };
  const LIMIT = 256 * 1024;
  const el = id => document.getElementById(id);
  const f = {
    name: el("site-name-input"), caption: el("site-caption-input"), captionDisplay: el("pin-custom-caption"), url: el("site-icon-url"), file: el("site-icon-file"),
    save: el("site-settings-save"), export: el("site-settings-export"), reset: el("site-settings-reset"),
    status: el("site-settings-status"), title: el("site-name"), footer: el("footer-site-name"),
    icon: el("site-favicon"), preview: el("site-icon-preview"), fallback: el("site-icon-fallback"),
    logoText: el("pin-nav-logo-text-input"), logoUrl: el("pin-nav-logo-url"),
    logoFile: el("pin-nav-logo-file"), logoClear: el("pin-nav-logo-clear"),
    logoDisplayText: el("pin-nav-logo-text"), logoDisplayImage: el("pin-nav-logo-image"), logoLink: el("pin-nav-logo")
  };
  if (Object.values(f).some(v => !v)) return;
  let published = { ...DEFAULT };
  let draftIcon = DEFAULT.faviconUrl;
  let draftLogo = DEFAULT.navLogoUrl;
  const cleanName = v => String(v || "").replace(/\s+/g, " ").trim().slice(0, 50);
  function safeIcon(v) {
    if (typeof v !== "string" || !v) return "";
    if (v === DEFAULT.faviconUrl) return v;
    if (/^data:image\/(?:png|jpeg|webp|x-icon|vnd\.microsoft\.icon);base64,[A-Za-z0-9+/=]+$/i.test(v) && v.length < 370000) return v;
    try { return new URL(v).protocol === "https:" ? v : ""; } catch { return ""; }
  }
  function normalize(v) {
    return { siteName: cleanName(v?.siteName) || DEFAULT.siteName,
      faviconUrl: safeIcon(v?.faviconUrl) || DEFAULT.faviconUrl, caption: String(v?.caption || "").slice(0,240),
      navLogoText: cleanName(v?.navLogoText) || DEFAULT.navLogoText,
      navLogoUrl: safeIcon(v?.navLogoUrl) || "" };
  }
  function apply(v) {
    const setting = normalize(v);
    f.logoDisplayText.textContent = setting.navLogoText;
    f.logoLink.setAttribute("aria-label", setting.navLogoText + " 首頁");
    if (setting.navLogoUrl) {
      f.logoDisplayText.hidden = true;
      f.logoDisplayImage.hidden = false;
      f.logoDisplayImage.onerror = () => {
        f.logoDisplayImage.hidden = true;
        f.logoDisplayText.hidden = false;
      };
      f.logoDisplayImage.src = setting.navLogoUrl;
    } else {
      f.logoDisplayImage.onerror = null;
      f.logoDisplayImage.hidden = true;
      f.logoDisplayImage.removeAttribute("src");
      f.logoDisplayText.hidden = false;
    }
    f.title.textContent = setting.siteName;
    f.captionDisplay.textContent = setting.caption;
    f.footer.textContent = setting.siteName;
    document.title = setting.siteName;
    f.icon.type = setting.faviconUrl.startsWith("data:image/png;") ? "image/png" : (setting.faviconUrl.endsWith(".svg") ? "image/svg+xml" : "image/x-icon");
    f.icon.href = setting.faviconUrl;
    f.fallback.textContent = setting.siteName.slice(0, 1).toUpperCase();
    f.preview.onload = () => { f.preview.hidden = false; f.fallback.hidden = true; };
    f.preview.onerror = () => { f.preview.hidden = true; f.fallback.hidden = false; };
    f.preview.src = setting.faviconUrl;
  }
  function fill(v) {
    f.name.value = v.siteName;
    f.caption.value = v.caption || "";
    f.logoText.value = v.navLogoText || DEFAULT.navLogoText;
    draftLogo = v.navLogoUrl || "";
    f.logoUrl.value = draftLogo.startsWith("https://") ? draftLogo : "";
    f.logoFile.value = "";
    draftIcon = v.faviconUrl;
    f.url.value = v.faviconUrl.startsWith("https://") ? v.faviconUrl : "";
    f.file.value = "";
  }
  function current() {
    const name = cleanName(f.name.value), typed = f.url.value.trim();
    if (!name) { f.status.textContent = "請填寫網頁名稱"; return null; }
    if (typed && !safeIcon(typed)) { f.status.textContent = "Favicon 網址必須為 https:// 連結"; return null; }
    const logoTyped = f.logoUrl.value.trim();
    const logoText = cleanName(f.logoText.value);
    if (!logoText) { f.status.textContent = "請填寫 LOGO 文字（圖片失效時也會使用）"; return null; }
    if (logoTyped && !safeIcon(logoTyped)) { f.status.textContent = "LOGO 圖片網址必須為 https:// 連結"; return null; }
    return {siteName:name, faviconUrl:typed || draftIcon, caption:f.caption.value.slice(0,240),
      navLogoText:logoText, navLogoUrl:logoTyped || draftLogo};
  }
  function livePreview() { const v = current(); if (v) apply(v); }
  f.logoText.addEventListener("input", livePreview);
  f.logoUrl.addEventListener("change", () => {
    draftLogo = f.logoUrl.value.trim();
    f.logoFile.value = "";
    livePreview();
  });
  f.logoClear.addEventListener("click", () => {
    draftLogo = "";
    f.logoUrl.value = "";
    f.logoFile.value = "";
    livePreview();
    f.status.textContent = "LOGO 已切換為文字預覽；請按「儲存本機預覽」保存。";
  });
  f.logoFile.addEventListener("change", () => {
    const image = f.logoFile.files?.[0];
    if (!image) return;
    const mimes = {"image/png":"image/png","image/jpeg":"image/jpeg","image/webp":"image/webp"};
    const mime = mimes[image.type];
    if (!mime || image.size <= 0 || image.size > LIMIT) {
      f.status.textContent = "LOGO 請選擇 256 KB 內的 PNG、JPG 或 WebP";
      f.logoFile.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => { f.status.textContent = "LOGO 圖片無法讀取"; };
    reader.onload = () => {
      const data = String(reader.result || "");
      if (!safeIcon(data)) { f.status.textContent = "LOGO 圖片格式不符合要求"; return; }
      draftLogo = data;
      f.logoUrl.value = "";
      livePreview();
      f.status.textContent = "LOGO 圖片已預覽；請按「儲存本機預覽」保存。";
    };
    reader.readAsDataURL(image);
  });
  f.name.addEventListener("input", livePreview);
  f.caption.addEventListener("input", livePreview);
  f.url.addEventListener("change", livePreview);
  f.file.addEventListener("change", () => {
    const image = f.file.files?.[0];
    if (!image) return;
    const mimes = {"image/png":"image/png","image/jpeg":"image/jpeg","image/webp":"image/webp",
      "image/x-icon":"image/x-icon","image/vnd.microsoft.icon":"image/x-icon"};
    const mime = mimes[image.type] || (!image.type && /\.ico$/i.test(image.name) ? "image/x-icon" : "");
    if (!mime || image.size <= 0 || image.size > LIMIT) {
      f.status.textContent = "請選擇 256 KB 內的 PNG、JPG、WebP 或 ICO"; f.file.value = ""; return;
    }
    const reader = new FileReader();
    reader.onerror = () => { f.status.textContent = "圖片無法讀取"; };
    reader.onload = () => {
      const base64 = String(reader.result || "").split(",")[1] || "";
      const data = "data:" + mime + ";base64," + base64;
      if (!safeIcon(data)) { f.status.textContent = "圖片格式不符合要求"; return; }
      draftIcon = data; f.url.value = ""; livePreview();
      f.status.textContent = "已預覽新圖示；請按「儲存本機預覽」保存";
    };
    reader.readAsDataURL(image);
  });
  f.save.addEventListener("click", () => {
    const value = current(); if (!value) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      apply(value);
      f.status.textContent = "已儲存在這個瀏覽器；GitHub Pages 公開版未更動。";
    } catch { f.status.textContent = "本機無法儲存，可使用「匯出公開設定檔」。"; }
  });
  f.export.addEventListener("click", () => {
    const value = current(); if (!value) return;
    const output = new Blob([JSON.stringify(value, null, 2) + "\n"], {type:"application/json"});
    const url = URL.createObjectURL(output);
    const a = document.createElement("a");
    a.href = url; a.download = "site.json"; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    f.status.textContent = "已匯出 site.json。更新 PIN Repo 的 config/site.json 後才會公開生效。";
  });
  f.reset.addEventListener("click", () => {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { f.status.textContent = "清除本機設定失敗"; return; }
    fill(published); apply(published);
    f.status.textContent = "已恢復 GitHub Pages 目前公開的設定。";
  });
  async function init() {
    try {
      const r = await fetch("./config/site.json", {cache:"no-cache"});
      if (r.ok) published = normalize(await r.json());
    } catch {}
    let v = published;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") v = normalize(saved);
    } catch {}
    fill(v); apply(v);
  }
  // Click-away and Escape close the settings panel without disturbing its controls.
  const panel = el("site-settings-panel");
  if (panel) {
    document.addEventListener("pointerdown", event => {
      if (panel.open && !panel.contains(event.target)) panel.open = false;
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && panel.open) {
        panel.open = false;
        panel.querySelector("summary")?.focus();
      }
    });
  }
  init();
})();