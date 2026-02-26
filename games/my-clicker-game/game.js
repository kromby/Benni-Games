(function () {
  "use strict";

  var SAVE_KEY = "fh-clicker-save";
  var AUTOSAVE_INTERVAL_MS = 30000; // 30 sekúndur

  // ─── State ─────────────────────────────────────────────────────────────
  var kokur = 0;
  var kokurPerSmell = 1;
  var kokurPerSekunda = 0;
  var lastTime = performance.now();
  var rebirthCount = 0;

  var upgrades = [
    { id: "betri-mus", name: "Betri mús", baseCost: 50, owned: 0, bonus: 1 },
    { id: "hradari-fingur", name: "Hraðari fingur", baseCost: 200, owned: 0, bonus: 2 },
    { id: "kokutoflur", name: "FH-töflur", baseCost: 3000, owned: 0, bonus: 5 },
    { id: "kokukefli", name: "FH-kefli", baseCost: 10000, owned: 0, bonus: 10 },
    { id: "kokurafl", name: "FH-afl", baseCost: 50000, owned: 0, bonus: 25 },
    { id: "kokudrottning", name: "FH-drottning", baseCost: 200000, owned: 0, bonus: 100 },
    { id: "tvofoldun", name: "Tvöföldun", baseCost: 500000, owned: 0, multiply: true },
    { id: "kokukraftur", name: "FH-kraftur", baseCost: 50, owned: 0, cps: 1 },
    { id: "kokumagn", name: "FH-magn", baseCost: 200, owned: 0, cps: 5 },
    { id: "kokualdur", name: "FH-aldur", baseCost: 2000, owned: 0, cps: 20 },
    { id: "kokuveldi", name: "FH-veldi", baseCost: 5000, owned: 0, cps: 50 },
    { id: "kokuheimur", name: "FH-heimur", baseCost: 20000, owned: 0, cps: 100 },
    { id: "kokukosmos", name: "FH-kosmos", baseCost: 100000, owned: 0, cps: 1000 },
    { id: "framleidslutvofoldun", name: "Framleiðslutvöföldun", baseCost: 500000, owned: 0, cpsMultiply: true },
  ];

  var buildings = [
  ];

  // ─── Helpers ────────────────────────────────────────────────────────────
  function buildingCost(b) {
    return Math.floor(b.baseCost * Math.pow(1.15, b.owned));
  }

  function upgradeCost(u) {
    return Math.floor(u.baseCost * Math.pow(1.15, u.owned));
  }

  function rebirthCost() {
    return Math.floor(1e7 * Math.pow(1.75, rebirthCount));
  }

  function rebirthMultiplier() {
    return 1 + rebirthCount;
  }

  function updateCps() {
    var baseCps = buildings.reduce(function (sum, b) {
      return sum + b.owned * b.cps;
    }, 0);
    upgrades.forEach(function (u) {
      if (u.cps) baseCps += u.owned * u.cps;
    });
    var multUpgrade = upgrades.filter(function (u) { return u.cpsMultiply; })[0];
    var mult = multUpgrade ? Math.pow(2, multUpgrade.owned) : 1;
    kokurPerSekunda = baseCps * mult;
  }

  function recomputeKokurPerSmell() {
    kokurPerSmell = 1;
    upgrades.forEach(function (u) {
      if (u.multiply) kokurPerSmell *= Math.pow(2, u.owned);
      else if (u.bonus) kokurPerSmell += u.owned * u.bonus;
    });
  }

  // ─── Autosave ───────────────────────────────────────────────────────────
  function getSaveData() {
    return {
      kokur: kokur,
      kokurPerSmell: kokurPerSmell,
      kokurPerSekunda: kokurPerSekunda,
      lastTime: lastTime,
      rebirthCount: rebirthCount,
      upgradeOwned: upgrades.map(function (u) { return u.owned; }),
      buildingOwned: buildings.map(function (b) { return b.owned; }),
    };
  }

  function save() {
    try {
      var data = getSaveData();
      data.lastTime = performance.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("FH clicker: ekki tókst að vista:", e);
    }
  }

  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data.kokur !== "number") return;

      kokur = data.kokur;
      rebirthCount = data.rebirthCount || 0;
      lastTime = typeof data.lastTime === "number" ? data.lastTime : performance.now();

      if (Array.isArray(data.upgradeOwned)) {
        data.upgradeOwned.forEach(function (owned, i) {
          if (upgrades[i] && typeof owned === "number") upgrades[i].owned = owned;
        });
      }
      if (Array.isArray(data.buildingOwned)) {
        data.buildingOwned.forEach(function (owned, i) {
          if (buildings[i] && typeof owned === "number") buildings[i].owned = owned;
        });
      }

      recomputeKokurPerSmell();
      updateCps();

      // Offline framvinda: bæta við FH fyrir tíma sem liðinn er síðan lastTime
      var dt = (performance.now() - lastTime) / 1000;
      if (dt > 0 && dt < 86400 * 7) {
        kokur += kokurPerSekunda * rebirthMultiplier() * dt;
      }
      lastTime = performance.now();
    } catch (e) {
      console.warn("FH clicker: ekki tókst að hlaða vistu:", e);
    }
  }

  function formatNumber(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + " mrð.";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " mln.";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + " þús.";
    return Math.floor(n).toString();
  }

  // ─── DOM refs ────────────────────────────────────────────────────────────
  var kokurDisplay = document.getElementById("kokur-display");
  var cpsDisplay = document.getElementById("cps-display");
  var perClickDisplay = document.getElementById("per-click-display");
  var kakaBtn = document.getElementById("kaka-btn");
  var upgradesList = document.getElementById("upgrades-list");
  var upgradesCpsList = document.getElementById("upgrades-cps-list");
  var buildingsList = document.getElementById("buildings-list");
  var shopTrigger = document.getElementById("shop-trigger");
  var shopModal = document.getElementById("shop-modal");
  var shopModalBackdrop = shopModal && shopModal.querySelector(".shop-modal-backdrop");
  var shopModalClose = shopModal && shopModal.querySelector(".shop-modal-close");
  var shopBadge = document.getElementById("shop-badge");
  var rebirthBtn = document.getElementById("rebirth-btn");
  var rebirthCostDisplay = document.getElementById("rebirth-cost-display");
  var rebirthMultDisplay = document.getElementById("rebirth-mult-display");

  // ─── Render ─────────────────────────────────────────────────────────────
  function renderScore() {
    kokurDisplay.textContent = formatNumber(kokur);
    var cpsShown = kokurPerSekunda * rebirthMultiplier();
    cpsDisplay.textContent = cpsShown % 1 === 0 ? cpsShown : cpsShown.toFixed(1);
    var perClick = kokurPerSmell * rebirthMultiplier();
    if (perClickDisplay) {
      perClickDisplay.textContent = perClick % 1 === 0 ? perClick : perClick.toFixed(1);
    }
  }

  function renderOneUpgrade(u, listEl) {
    var cost = upgradeCost(u);
    var canAfford = kokur >= cost;
    var metaText;
    if (u.multiply) {
      metaText = "x2 FH á smell" + (u.owned > 0 ? " · Í eigu: " + u.owned : "");
    } else if (u.cpsMultiply) {
      metaText = "x2 FH/s" + (u.owned > 0 ? " · Í eigu: " + u.owned : "");
    } else if (u.cps) {
      metaText = "+" + u.cps + " FH/s" + (u.owned > 0 ? " · Í eigu: " + u.owned : "");
    } else {
      metaText = "+" + u.bonus + " FH á smell" + (u.owned > 0 ? " · Í eigu: " + u.owned : "");
    }
    var div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML =
      "<span class=\"name\">" + u.name + "</span>" +
      "<span class=\"meta\">" + metaText + "</span>" +
      "<button type=\"button\" data-upgrade-id=\"" + u.id + "\" " + (canAfford ? "" : "disabled") + ">Kaupa (" + formatNumber(cost) + ")</button>";
    div.querySelector("button").addEventListener("click", function () {
      buyUpgrade(u);
    });
    listEl.appendChild(div);
  }

  function renderUpgrades() {
    upgradesList.innerHTML = "";
    upgradesCpsList.innerHTML = "";
    upgrades.forEach(function (u) {
      var isCps = u.cps || u.cpsMultiply;
      renderOneUpgrade(u, isCps ? upgradesCpsList : upgradesList);
    });
  }

  function renderBuildings() {
    buildingsList.innerHTML = "";
    buildings.forEach(function (b) {
      var cost = buildingCost(b);
      var canAfford = kokur >= cost;
      var div = document.createElement("div");
      div.className = "shop-item";
      div.innerHTML =
        "<span class=\"name\">" + b.name + "</span>" +
        "<span class=\"meta\">" + b.cps + " FH/s · Í eigu: " + b.owned + "</span>" +
        "<button type=\"button\" data-building-id=\"" + b.id + "\" " + (canAfford ? "" : "disabled") + ">Kaupa (" + formatNumber(cost) + ")</button>";
      div.querySelector("button").addEventListener("click", function () {
        buyBuilding(b);
      });
      buildingsList.appendChild(div);
    });
  }

  function canAffordSomething() {
    var i;
    if (kokur >= rebirthCost()) return true;
    for (i = 0; i < upgrades.length; i++) {
      if (kokur >= upgradeCost(upgrades[i])) return true;
    }
    for (i = 0; i < buildings.length; i++) {
      if (kokur >= buildingCost(buildings[i])) return true;
    }
    return false;
  }

  function renderRebirth() {
    if (!rebirthBtn || !rebirthCostDisplay || !rebirthMultDisplay) return;
    var cost = rebirthCost();
    var canAfford = kokur >= cost;
    rebirthCostDisplay.textContent = formatNumber(cost) + " FH";
    rebirthMultDisplay.textContent = (rebirthMultiplier() + 1) + "x";
    rebirthBtn.disabled = !canAfford;
  }

  function updateShopBadge() {
    if (!shopBadge) return;
    if (canAffordSomething()) {
      shopBadge.classList.add("visible");
      shopBadge.setAttribute("aria-hidden", "false");
    } else {
      shopBadge.classList.remove("visible");
      shopBadge.setAttribute("aria-hidden", "true");
    }
  }

  function render() {
    renderScore();
    renderUpgrades();
    renderBuildings();
    renderRebirth();
    updateShopBadge();
  }

  // ─── Actions ────────────────────────────────────────────────────────────
  function onSmell() {
    kokur += kokurPerSmell * rebirthMultiplier();
    render();
  }

  function buyUpgrade(u) {
    var cost = upgradeCost(u);
    if (kokur < cost) return;
    kokur -= cost;
    u.owned += 1;
    if (u.multiply) {
      kokurPerSmell *= 2;
    } else if (u.bonus) {
      kokurPerSmell += u.bonus;
    }
    if (u.cps || u.cpsMultiply) updateCps();
    render();
    save();
  }

  function buyBuilding(b) {
    var cost = buildingCost(b);
    if (kokur < cost) return;
    kokur -= cost;
    b.owned += 1;
    updateCps();
    render();
    save();
  }

  function doRebirth() {
    var cost = rebirthCost();
    if (kokur < cost) return;
    kokur = 0;
    kokurPerSmell = 1;
    upgrades.forEach(function (u) {
      u.owned = 0;
    });
    buildings.forEach(function (b) {
      b.owned = 0;
    });
    rebirthCount += 1;
    updateCps();
    render();
    save();
  }

  // ─── Game loop ─────────────────────────────────────────────────────────
  var lastRenderTime = 0;
  var RENDER_INTERVAL_MS = 200;

  function tick(now) {
    var dt = (now - lastTime) / 1000;
    lastTime = now;
    if (kokurPerSekunda > 0) {
      kokur += kokurPerSekunda * rebirthMultiplier() * dt;
      renderScore();
      updateShopBadge();
      if (now - lastRenderTime >= RENDER_INTERVAL_MS) {
        lastRenderTime = now;
        renderUpgrades();
        renderBuildings();
        renderRebirth();
      }
    }
    requestAnimationFrame(tick);
  }

  // ─── Verslun modal ─────────────────────────────────────────────────────
  function openShop() {
    if (shopModal) {
      shopModal.classList.remove("hidden");
      shopModal.setAttribute("aria-hidden", "false");
    }
  }
  function closeShop() {
    if (shopModal) {
      shopModal.classList.add("hidden");
      shopModal.setAttribute("aria-hidden", "true");
    }
  }
  if (shopTrigger) shopTrigger.addEventListener("click", openShop);
  if (shopModalBackdrop) shopModalBackdrop.addEventListener("click", closeShop);
  if (shopModalClose) shopModalClose.addEventListener("click", closeShop);
  if (rebirthBtn) rebirthBtn.addEventListener("click", doRebirth);

  // ─── Init ───────────────────────────────────────────────────────────────
  loadSave();
  kakaBtn.addEventListener("click", onSmell);
  render();
  lastTime = performance.now();
  requestAnimationFrame(tick);

  setInterval(save, AUTOSAVE_INTERVAL_MS);
  window.addEventListener("beforeunload", save);
})();
