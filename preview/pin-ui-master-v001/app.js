"use strict";

// PIN UI Master v001. This is a public, browser-only design draft:
// no Google authorization, network data writes, or private notes.
const state = {
  scene: "cover",
  template: "folio",
  activePane: "left",
  views: { left: "research", right: "dialogue" },
};

const sceneNames = ["cover", "body", "back"];
const templateNames = ["folio", "index", "exhibit"];
const viewNames = ["research", "dialogue", "timeline", "collection"];
const viewLabels = {
  research: ["研究摘錄", "自由輯錄 / FIELD NOTES"],
  dialogue: ["對話紀錄", "我說 / 你詮釋"],
  timeline: ["創作大事記", "PROCESS / CHRONICLE"],
  collection: ["視覺收藏", "IMAGE / FORM / IDEA"],
};

function openScene(name) {
  if (!sceneNames.includes(name)) return;
  state.scene = name;

  for (const scene of sceneNames) {
    const section = document.getElementById("scene-" + scene);
    const active = scene === name;
    section.hidden = !active;
    section.classList.toggle("is-active", active);
  }
  for (const button of document.querySelectorAll("[data-scene]")) {
    if (button.closest(".scene-nav")) {
      if (button.dataset.scene === name) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
  }
  document.title = "PIN — " + ({ cover: "封面", body: "雙頁手札", back: "封底" })[name] + " / UI Master v001";
}

function chooseTemplate(name) {
  if (!templateNames.includes(name)) return;
  state.template = name;
  document.getElementById("notebook").dataset.template = name;
  for (const button of document.querySelectorAll("[data-template]")) {
    const selected = button.dataset.template === name;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
}

function chooseView(pane, name) {
  if (!(pane in state.views) || !viewNames.includes(name)) return;
  const source = document.getElementById("view-" + name);
  const target = document.getElementById(pane + "-content");
  if (!source || !target) return;

  state.views[pane] = name;
  target.replaceChildren(source.content.cloneNode(true));
  document.getElementById(pane + "-page-label").textContent = viewLabels[name][0];
  document.querySelector(".page-" + pane + " .page-label-line > span").textContent = viewLabels[name][1];
  for (const button of document.querySelectorAll('[data-pane="' + pane + '"][data-view]')) {
    button.setAttribute("aria-pressed", String(button.dataset.view === name));
  }
  // Only this page moves to its newly selected content; the other page is untouched.
  document.getElementById(pane + "-scroll").scrollTop = 0;
}

function chooseActivePane(pane) {
  if (!(pane in state.views)) return;
  state.activePane = pane;
  document.getElementById("notebook").dataset.activePane = pane;
  for (const button of document.querySelectorAll("[data-show-pane]")) {
    const selected = button.dataset.showPane === pane;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
}

document.addEventListener("click", (event) => {
  const sceneButton = event.target.closest("[data-scene]");
  if (sceneButton) return openScene(sceneButton.dataset.scene);

  const templateButton = event.target.closest("[data-template]");
  if (templateButton) return chooseTemplate(templateButton.dataset.template);

  const viewButton = event.target.closest("[data-pane][data-view]");
  if (viewButton) return chooseView(viewButton.dataset.pane, viewButton.dataset.view);

  const paneButton = event.target.closest("[data-show-pane]");
  if (paneButton) return chooseActivePane(paneButton.dataset.showPane);
});

document.getElementById("print-spread").addEventListener("click", () => window.print());

chooseView("left", "research");
chooseView("right", "dialogue");
chooseTemplate("folio");
chooseActivePane("left");
openScene("cover");
