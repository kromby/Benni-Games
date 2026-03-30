(function () {
  "use strict";

  // ── Constants ──
  var GRID_COLS = 12;
  var GRID_ROWS = 8;
  var GRID_SIZE = GRID_COLS * GRID_ROWS;
  var SAVE_KEY = "klesstann-save";
  var STARTING_MONEY = 5000;
  var AUTOSAVE_MS = 30000;
  var STAT_NAMES = {
    hradi: "Hraði",
    kraftur: "Kraftur",
    vopnastyrkur: "Vopnastyrkur",
    thol: "Þol",
    stjornun: "Stjórnun",
  };
  var STAT_KEYS = Object.keys(STAT_NAMES);
  var MAX_STAT_DISPLAY = 200; // bar fills at this value

  // ── Part Types ──
  var PART_TYPES = {
    vel: { name: "Vél", emoji: "⚙️", color: "#e88a1a" },
    eldsneyti: { name: "Eldsneyti", emoji: "⛽", color: "#f5c518" },
    sprengja: { name: "Sprengja", emoji: "💣", color: "#f44336" },
    kanona: { name: "Kanóna", emoji: "🔫", color: "#9c27b0" },
    hlif: { name: "Hlíf", emoji: "🛡️", color: "#2196f3" },
    hjol: { name: "Hjól", emoji: "🛞", color: "#607d8b" },
  };

  // ── Shop Catalog: 3 tiers × 6 types = 18 items ──
  var SHOP_CATALOG = [
    // Vél (engines) — boost hraði + kraftur
    { id: "vel1", type: "vel", tier: 1, name: "Lítil vél", price: 500, stats: { hradi: 5, kraftur: 3 } },
    { id: "vel2", type: "vel", tier: 2, name: "Meðal vél", price: 1500, stats: { hradi: 12, kraftur: 8 } },
    { id: "vel3", type: "vel", tier: 3, name: "Túrbó vél", price: 5000, stats: { hradi: 25, kraftur: 18 } },
    // Eldsneyti (fuel) — boost kraftur + hraði
    { id: "eld1", type: "eldsneyti", tier: 1, name: "Bensín", price: 400, stats: { kraftur: 5, hradi: 2 } },
    { id: "eld2", type: "eldsneyti", tier: 2, name: "Dísel", price: 1200, stats: { kraftur: 12, hradi: 5 } },
    { id: "eld3", type: "eldsneyti", tier: 3, name: "Raketeldsneyti", price: 4500, stats: { kraftur: 25, hradi: 12 } },
    // Sprengja (explosives) — boost vopnastyrkur
    { id: "spr1", type: "sprengja", tier: 1, name: "Smásprengja", price: 600, stats: { vopnastyrkur: 8 } },
    { id: "spr2", type: "sprengja", tier: 2, name: "Sprengja", price: 1800, stats: { vopnastyrkur: 18 } },
    { id: "spr3", type: "sprengja", tier: 3, name: "Risasprengja", price: 5500, stats: { vopnastyrkur: 35 } },
    // Kanóna (cannons) — boost vopnastyrkur + stjornun
    { id: "kan1", type: "kanona", tier: 1, name: "Lítil kanóna", price: 550, stats: { vopnastyrkur: 5, stjornun: 3 } },
    { id: "kan2", type: "kanona", tier: 2, name: "Meðal kanóna", price: 1600, stats: { vopnastyrkur: 12, stjornun: 7 } },
    { id: "kan3", type: "kanona", tier: 3, name: "Stór kanóna", price: 5200, stats: { vopnastyrkur: 24, stjornun: 15 } },
    // Hlíf (shields) — boost thol
    { id: "hli1", type: "hlif", tier: 1, name: "Járnhlíf", price: 450, stats: { thol: 8 } },
    { id: "hli2", type: "hlif", tier: 2, name: "Stálhlíf", price: 1400, stats: { thol: 18 } },
    { id: "hli3", type: "hlif", tier: 3, name: "Títanhlíf", price: 4800, stats: { thol: 35 } },
    // Hjól (wheels) — boost stjornun + hraði
    { id: "hjo1", type: "hjol", tier: 1, name: "Venjuleg hjól", price: 400, stats: { stjornun: 5, hradi: 3 } },
    { id: "hjo2", type: "hjol", tier: 2, name: "Keppnishjól", price: 1300, stats: { stjornun: 12, hradi: 7 } },
    { id: "hjo3", type: "hjol", tier: 3, name: "Ofurhjól", price: 4500, stats: { stjornun: 25, hradi: 15 } },
  ];

  var catalogById = {};
  SHOP_CATALOG.forEach(function (item) {
    catalogById[item.id] = item;
  });

  // ── Chassis shape (pre-placed, immovable) ──
  // 1 = chassis cell, cells marked here cannot hold parts but define car shape
  // Row 0 is top, row 7 is bottom
  var CHASSIS_MASK = buildChassisMask();

  function buildChassisMask() {
    var mask = new Array(GRID_SIZE).fill(false);
    // Bottom row: wheels area
    for (var c = 1; c <= 10; c++) mask[7 * GRID_COLS + c] = true;
    // Row 6: undercarriage
    for (var c = 2; c <= 9; c++) mask[6 * GRID_COLS + c] = true;
    // Row 5: lower body
    for (var c = 1; c <= 10; c++) mask[5 * GRID_COLS + c] = true;
    // Row 4: mid body
    for (var c = 1; c <= 10; c++) mask[4 * GRID_COLS + c] = true;
    // Row 3: upper body
    for (var c = 2; c <= 9; c++) mask[3 * GRID_COLS + c] = true;
    // Row 2: roof
    for (var c = 3; c <= 8; c++) mask[2 * GRID_COLS + c] = true;
    return mask;
  }

  // ── Game State ──
  var state = {
    money: STARTING_MONEY,
    inventory: {}, // { catalogId: count }
    grid: new Array(GRID_SIZE).fill(null), // null or catalogId
  };

  // ── Drag State ──
  var dragging = null; // { catalogId, sourceType: 'inventory'|'grid', sourceIndex, ghostEl }

  // ── DOM References ──
  var gridEl = document.getElementById("car-grid");
  var inventoryEl = document.getElementById("inventory-list");
  var moneyEl = document.getElementById("money-display");
  var shopModal = document.getElementById("shop-modal");
  var shopBackdrop = shopModal.querySelector(".shop-modal-backdrop");
  var shopClose = shopModal.querySelector(".shop-modal-close");
  var shopGrid = document.getElementById("shop-grid");
  var shopTrigger = document.getElementById("shop-trigger");
  var resetBtn = document.getElementById("reset-btn");

  // ── Initialization ──
  function init() {
    loadGame();
    renderGrid();
    renderInventory();
    renderStats();
    updateMoneyDisplay();
    renderShop();
    updateShopBadge();
    bindEvents();
    setInterval(saveGame, AUTOSAVE_MS);
  }

  // ── Grid Rendering ──
  function renderGrid() {
    gridEl.innerHTML = "";
    for (var i = 0; i < GRID_SIZE; i++) {
      var cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.index = i;
      if (CHASSIS_MASK[i]) {
        cell.classList.add("chassis");
      }
      if (state.grid[i]) {
        var item = catalogById[state.grid[i]];
        if (item) {
          cell.classList.add("has-part");
          var span = document.createElement("span");
          span.className = "part-placed";
          span.textContent = PART_TYPES[item.type].emoji;
          span.title = item.name;
          cell.appendChild(span);
        }
      }
      gridEl.appendChild(cell);
    }
  }

  // ── Inventory Rendering ──
  function renderInventory() {
    inventoryEl.innerHTML = "";
    var ids = Object.keys(state.inventory);
    if (ids.length === 0) {
      inventoryEl.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;">Engir hlutir</p>';
      return;
    }
    ids.forEach(function (catalogId) {
      var count = state.inventory[catalogId];
      if (count <= 0) return;
      var item = catalogById[catalogId];
      if (!item) return;
      var card = document.createElement("div");
      card.className = "inv-card";
      card.dataset.catalogId = catalogId;
      card.innerHTML =
        '<span class="emoji">' + PART_TYPES[item.type].emoji + "</span>" +
        '<span class="name">' + item.name + "</span>" +
        '<span class="count">' + count + "</span>";
      inventoryEl.appendChild(card);
    });
  }

  // ── Stats ──
  function calculateStats() {
    var stats = {};
    STAT_KEYS.forEach(function (k) { stats[k] = 0; });
    state.grid.forEach(function (catalogId) {
      if (!catalogId) return;
      var item = catalogById[catalogId];
      if (!item) return;
      STAT_KEYS.forEach(function (k) {
        if (item.stats[k]) stats[k] += item.stats[k];
      });
    });
    return stats;
  }

  function calculateStatsWithChange(gridIndex, newCatalogId) {
    var stats = {};
    STAT_KEYS.forEach(function (k) { stats[k] = 0; });
    state.grid.forEach(function (catalogId, i) {
      var id = i === gridIndex ? newCatalogId : catalogId;
      if (!id) return;
      var item = catalogById[id];
      if (!item) return;
      STAT_KEYS.forEach(function (k) {
        if (item.stats[k]) stats[k] += item.stats[k];
      });
    });
    return stats;
  }

  function renderStats(previewStats) {
    var current = calculateStats();
    STAT_KEYS.forEach(function (k) {
      var row = document.querySelector('tr[data-stat="' + k + '"]');
      if (!row) return;
      var valueCell = row.querySelector(".stat-value");
      var fill = row.querySelector(".stat-fill");
      var val = current[k];
      var pct = Math.min(100, (val / MAX_STAT_DISPLAY) * 100);
      fill.style.width = pct + "%";
      if (previewStats) {
        var delta = previewStats[k] - val;
        var deltaHtml = "";
        if (delta > 0) deltaHtml = ' <span class="stat-delta positive">+' + delta + "</span>";
        else if (delta < 0) deltaHtml = ' <span class="stat-delta negative">' + delta + "</span>";
        valueCell.innerHTML = val + deltaHtml;
      } else {
        valueCell.textContent = val;
      }
    });
  }

  // ── Money ──
  function updateMoneyDisplay() {
    moneyEl.textContent = state.money.toLocaleString("is-IS");
  }

  // ── Shop ──
  function renderShop() {
    shopGrid.innerHTML = "";
    SHOP_CATALOG.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "shop-card";
      var stars = "";
      for (var t = 0; t < item.tier; t++) stars += "⭐";
      var statLines = [];
      STAT_KEYS.forEach(function (k) {
        if (item.stats[k]) statLines.push(STAT_NAMES[k] + " +" + item.stats[k]);
      });
      card.innerHTML =
        '<div class="card-top">' +
          '<span class="emoji">' + PART_TYPES[item.type].emoji + "</span>" +
          '<div class="card-info">' +
            '<div class="card-name">' + item.name + "</div>" +
            '<div class="card-tier">' + stars + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="card-stats">' + statLines.join("<br>") + "</div>" +
        '<button class="card-buy" data-id="' + item.id + '"' +
          (state.money < item.price ? " disabled" : "") +
        ">" + item.price.toLocaleString("is-IS") + " kr.</button>";
      shopGrid.appendChild(card);
    });
  }

  function buyPart(catalogId) {
    var item = catalogById[catalogId];
    if (!item || state.money < item.price) return;
    state.money -= item.price;
    state.inventory[catalogId] = (state.inventory[catalogId] || 0) + 1;
    updateMoneyDisplay();
    renderInventory();
    renderShop();
    updateShopBadge();
  }

  function openShop() {
    renderShop();
    shopModal.classList.remove("hidden");
    shopModal.setAttribute("aria-hidden", "false");
  }

  function closeShop() {
    shopModal.classList.add("hidden");
    shopModal.setAttribute("aria-hidden", "true");
  }

  function updateShopBadge() {
    var canAfford = SHOP_CATALOG.some(function (item) {
      return state.money >= item.price;
    });
    shopTrigger.classList.toggle("has-affordable", canAfford);
  }

  // ── Drag & Drop (Pointer Events) ──
  function startDrag(catalogId, sourceType, sourceIndex, x, y) {
    var item = catalogById[catalogId];
    if (!item) return;
    var ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.textContent = PART_TYPES[item.type].emoji;
    ghost.style.left = x + "px";
    ghost.style.top = y + "px";
    document.body.appendChild(ghost);
    dragging = {
      catalogId: catalogId,
      sourceType: sourceType,
      sourceIndex: sourceIndex,
      ghostEl: ghost,
    };
    // Dim source
    if (sourceType === "grid") {
      var cell = gridEl.querySelector('[data-index="' + sourceIndex + '"]');
      if (cell) cell.style.opacity = "0.3";
    }
  }

  function moveDrag(x, y) {
    if (!dragging) return;
    dragging.ghostEl.style.left = x + "px";
    dragging.ghostEl.style.top = y + "px";
    // Highlight cell under pointer
    dragging.ghostEl.style.display = "none";
    var elUnder = document.elementFromPoint(x, y);
    dragging.ghostEl.style.display = "";
    clearDragHighlights();
    if (elUnder) {
      var cell = elUnder.closest(".grid-cell");
      if (cell) {
        var idx = parseInt(cell.dataset.index, 10);
        if (isValidDrop(idx)) {
          cell.classList.add("drag-over");
          // Preview stats
          var preview = calculateStatsWithChange(idx, dragging.catalogId);
          renderStats(preview);
        } else {
          cell.classList.add("drag-over-invalid");
        }
        return;
      }
      // Check if over inventory panel
      if (elUnder.closest("#inventory-panel")) {
        renderStats(); // Clear preview
        return;
      }
    }
    renderStats(); // Clear preview
  }

  function endDrag(x, y) {
    if (!dragging) return;
    dragging.ghostEl.style.display = "none";
    var elUnder = document.elementFromPoint(x, y);
    dragging.ghostEl.style.display = "";
    var placed = false;

    if (elUnder) {
      var cell = elUnder.closest(".grid-cell");
      if (cell) {
        var idx = parseInt(cell.dataset.index, 10);
        if (isValidDrop(idx)) {
          // Place part on grid
          state.grid[idx] = dragging.catalogId;
          removeFromSource();
          placed = true;
        }
      } else if (elUnder.closest("#inventory-panel") && dragging.sourceType === "grid") {
        // Return to inventory from grid
        state.inventory[dragging.catalogId] = (state.inventory[dragging.catalogId] || 0) + 1;
        state.grid[dragging.sourceIndex] = null;
        placed = true;
      }
    }

    // Restore source if not placed
    if (!placed && dragging.sourceType === "grid") {
      var srcCell = gridEl.querySelector('[data-index="' + dragging.sourceIndex + '"]');
      if (srcCell) srcCell.style.opacity = "";
    }

    // Cleanup
    if (dragging.ghostEl.parentNode) {
      dragging.ghostEl.parentNode.removeChild(dragging.ghostEl);
    }
    dragging = null;
    clearDragHighlights();
    renderGrid();
    renderInventory();
    renderStats();
    updateShopBadge();
  }

  function removeFromSource() {
    if (dragging.sourceType === "inventory") {
      state.inventory[dragging.catalogId]--;
      if (state.inventory[dragging.catalogId] <= 0) {
        delete state.inventory[dragging.catalogId];
      }
    } else if (dragging.sourceType === "grid") {
      state.grid[dragging.sourceIndex] = null;
    }
  }

  function isValidDrop(gridIndex) {
    if (!dragging) return false;
    // Must be a chassis cell
    if (!CHASSIS_MASK[gridIndex]) return false;
    // Must be empty (or the drag source itself)
    if (state.grid[gridIndex] !== null) {
      if (dragging.sourceType === "grid" && dragging.sourceIndex === gridIndex) return true;
      return false;
    }
    return true;
  }

  function clearDragHighlights() {
    var cells = gridEl.querySelectorAll(".drag-over, .drag-over-invalid");
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove("drag-over", "drag-over-invalid");
    }
  }

  // ── Event Binding (delegation) ──
  function bindEvents() {
    // Shop
    shopTrigger.addEventListener("click", openShop);
    shopBackdrop.addEventListener("click", closeShop);
    shopClose.addEventListener("click", closeShop);
    shopGrid.addEventListener("click", function (e) {
      var btn = e.target.closest(".card-buy");
      if (btn && !btn.disabled) {
        buyPart(btn.dataset.id);
      }
    });

    // Reset
    resetBtn.addEventListener("click", function () {
      if (confirm("Ertu viss um að þú viljir byrja upp á nýtt?")) {
        localStorage.removeItem(SAVE_KEY);
        state.money = STARTING_MONEY;
        state.inventory = {};
        state.grid = new Array(GRID_SIZE).fill(null);
        renderGrid();
        renderInventory();
        renderStats();
        updateMoneyDisplay();
        renderShop();
        updateShopBadge();
      }
    });

    // Drag from inventory (delegation)
    inventoryEl.addEventListener("pointerdown", function (e) {
      var card = e.target.closest(".inv-card");
      if (!card) return;
      e.preventDefault();
      card.setPointerCapture(e.pointerId);
      startDrag(card.dataset.catalogId, "inventory", null, e.clientX, e.clientY);
    });

    inventoryEl.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      e.preventDefault();
      moveDrag(e.clientX, e.clientY);
    });

    inventoryEl.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      e.preventDefault();
      endDrag(e.clientX, e.clientY);
    });

    // Drag from grid (delegation)
    gridEl.addEventListener("pointerdown", function (e) {
      var cell = e.target.closest(".grid-cell");
      if (!cell) return;
      var idx = parseInt(cell.dataset.index, 10);
      if (!state.grid[idx]) return;
      e.preventDefault();
      cell.setPointerCapture(e.pointerId);
      startDrag(state.grid[idx], "grid", idx, e.clientX, e.clientY);
    });

    gridEl.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      e.preventDefault();
      moveDrag(e.clientX, e.clientY);
    });

    gridEl.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      e.preventDefault();
      endDrag(e.clientX, e.clientY);
    });

    // Global pointer up (in case drag ends outside containers)
    document.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      endDrag(e.clientX, e.clientY);
    });

    // Keyboard: Escape to close shop
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeShop();
    });

    // Save before unload
    window.addEventListener("beforeunload", saveGame);
  }

  // ── Save/Load ──
  function saveGame() {
    var data = {
      money: state.money,
      inventory: state.inventory,
      grid: state.grid,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // Silently fail
    }
  }

  function loadGame() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (typeof data.money === "number") state.money = data.money;
      if (data.inventory && typeof data.inventory === "object") state.inventory = data.inventory;
      if (Array.isArray(data.grid) && data.grid.length === GRID_SIZE) state.grid = data.grid;
    } catch (e) {
      // Corrupted save, use defaults
    }
  }

  // ── Start ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
