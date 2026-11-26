"use strict";

// PIN UI Master v002. Flat independent-panels design draft:
// no Google authorization, network data writes, or private notes.
const state = {
  scene: "body",
  activePane: "left",
  views: { left: "research", right: "collection" },
};

const sceneNames = ["cover", "body", "back"];
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
  document.title = "PIN — " + ({ cover: "封面", body: "雙視窗", back: "封底" })[name] + " / UI Master v002";
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
  const sceneButton = event.target.closest("button[data-scene]");
  if (sceneButton) return openScene(sceneButton.dataset.scene);

  const viewButton = event.target.closest("button[data-pane][data-view]");
  if (viewButton) return chooseView(viewButton.dataset.pane, viewButton.dataset.view);

  const paneButton = event.target.closest("button[data-show-pane]");
  if (paneButton) return chooseActivePane(paneButton.dataset.showPane);
});

document.getElementById("print-spread").addEventListener("click", () => window.print());

chooseView("left", "research");
chooseView("right", "collection");
chooseActivePane("left");
openScene("body");
