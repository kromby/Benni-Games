(function () {
  "use strict";

  // ── Constants ──
  var TRACK_SIZE = 20;
  var TOTAL_LAPS = 2;
  var CORNER_SPACES = [0, 5, 10, 15];
  var SAVE_KEY = "klesstann-rally-save";
  var AUTOSAVE_MS = 30000;
  var PRIZE_MONEY = [400, 250, 150, 75];
  var CAR_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];
  var CAR_LABELS = ["\u00de\u00fa", "A1", "A2", "A3"];

  // ── Upgrade Tiers ──
  // Engine tiers: {min, max} for dice roll range (per D-01)
  var UPGRADE_TIERS_ENGINE = [
    { min: 1, max: 3 },   // Tier 0 (base): d3
    { min: 1, max: 4 },   // Tier 1: d4
    { min: 1, max: 6 },   // Tier 2: d6
    { min: 2, max: 6 },   // Tier 3: d2-6 (higher floor)
    { min: 3, max: 8 }    // Tier 4: d3-8 (highest floor)
  ];

  // Tire tiers: slowdown probability at corners (per D-02)
  // Value = chance of slowdown (0.0 to 1.0)
  var UPGRADE_TIERS_TIRES = [0.50, 0.40, 0.30, 0.20, 0.10];

  // Upgrade costs per tier index 1-4 (tier 0 is free/base) (per D-03)
  // Index 0 unused — tiers are bought from 1 to 4
  var UPGRADE_COSTS = [0, 75, 150, 300, 500, 800];

  // ── AI Personalities (per D-05) ──
  // preference: "engine", "tires", or "balanced"
  // saveChance: probability of skipping a purchase to save money (20-30% range)
  var AI_PERSONALITIES = [
    null,  // index 0 = player (not used)
    { preference: "engine",   saveChance: 0.25 },  // A1 (blue): speed-focused
    { preference: "tires",    saveChance: 0.20 },  // A2 (green): safety-focused
    { preference: "balanced", saveChance: 0.30 }   // A3 (yellow): balanced
  ];

  var STARTING_MONEY = 100;

  // ── Track Coordinates ──
  var TRACK_COORDS = (function () {
    var coords = [];
    var c, r;
    // Top edge: row 0, col 0..5 (6 spaces)
    for (c = 0; c <= 5; c++) { coords.push({ row: 0, col: c }); }
    // Right edge: row 1..5, col 5 (5 spaces)
    for (r = 1; r <= 5; r++) { coords.push({ row: r, col: 5 }); }
    // Bottom edge: row 5, col 4..0 (5 spaces)
    for (c = 4; c >= 0; c--) { coords.push({ row: 5, col: c }); }
    // Left edge: row 4..1, col 0 (4 spaces)
    for (r = 4; r >= 1; r--) { coords.push({ row: r, col: 0 }); }
    return coords;
  }());

  if (TRACK_COORDS.length !== TRACK_SIZE) {
    throw new Error("Track geometry error: expected " + TRACK_SIZE + " spaces, got " + TRACK_COORDS.length);
  }

  // ── Cars ──
  var cars = [
    { id: "player", color: CAR_COLORS[0], label: CAR_LABELS[0], position: 0, lap: 0, finished: false, finishOrder: 0, money: STARTING_MONEY, engineTier: 0, tireTier: 0 },
    { id: "ai1",    color: CAR_COLORS[1], label: CAR_LABELS[1], position: 0, lap: 0, finished: false, finishOrder: 0, money: STARTING_MONEY, engineTier: 0, tireTier: 0 },
    { id: "ai2",    color: CAR_COLORS[2], label: CAR_LABELS[2], position: 0, lap: 0, finished: false, finishOrder: 0, money: STARTING_MONEY, engineTier: 0, tireTier: 0 },
    { id: "ai3",    color: CAR_COLORS[3], label: CAR_LABELS[3], position: 0, lap: 0, finished: false, finishOrder: 0, money: STARTING_MONEY, engineTier: 0, tireTier: 0 }
  ];

  // ── Game State ──
  var state = {
    phase: "home",  // Changed from "racing" — game starts at home per D-06
    round: 0,
    finishCount: 0,
    career: {
      racesCompleted: 0,
      wins: 0,
      totalPrizeEarned: 0,
      placements: [0, 0, 0, 0]  // count of 1st, 2nd, 3rd, 4th finishes for player
    }
  };

  // ── DOM References ──
  var trackBoardEl, standingsListEl, lapCounterEl, rollBtnEl, diceResultEl, resultsScreenEl, resultsListEl;
  var spaceEls = [];

  // ── View Management ──
  var homeViewEl, shopViewEl, standingsPanelEl;

  // ── Utility Functions ──
  function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  function rollDieRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function calculateStandings() {
    return cars.slice().sort(function (a, b) {
      // Finished cars first, sorted by finishOrder ascending
      if (a.finished && !b.finished) { return -1; }
      if (!a.finished && b.finished) { return 1; }
      if (a.finished && b.finished) { return a.finishOrder - b.finishOrder; }
      // Among unfinished, sort by progress descending
      var progA = a.lap * TRACK_SIZE + a.position;
      var progB = b.lap * TRACK_SIZE + b.position;
      return progB - progA;
    });
  }

  // ── Render Functions ──
  function renderTrack() {
    trackBoardEl.innerHTML = "";
    spaceEls = [];

    // Build lookup: space index -> array of cars at that position
    var carsAtSpace = {};
    var i, j;
    for (i = 0; i < cars.length; i++) {
      var pos = cars[i].position;
      if (!carsAtSpace[pos]) { carsAtSpace[pos] = []; }
      carsAtSpace[pos].push(cars[i]);
    }

    for (i = 0; i < TRACK_SIZE; i++) {
      var space = document.createElement("div");
      space.className = "track-space";

      // Corner space
      if (CORNER_SPACES.indexOf(i) !== -1) {
        space.classList.add("corner");
      }

      // Start/finish space
      if (i === 0) {
        space.classList.add("start");
        var sfLabel = document.createElement("span");
        sfLabel.className = "start-label";
        sfLabel.textContent = "\uD83C\uDFC1";
        space.appendChild(sfLabel);
      }

      // CSS Grid placement (1-indexed)
      space.style.gridRow = String(TRACK_COORDS[i].row + 1);
      space.style.gridColumn = String(TRACK_COORDS[i].col + 1);

      // Cars at this space
      var spaceCars = carsAtSpace[i] || [];
      if (spaceCars.length > 0) {
        for (j = 0; j < spaceCars.length; j++) {
          var img = document.createElement("img");
          img.className = "car-img";
          var carIndex = ["player","ai1","ai2","ai3"].indexOf(spaceCars[j].id);
          var colorNames = ["red","blue","green","yellow"];
          img.src = "images/car-" + colorNames[carIndex] + ".png";
          img.alt = spaceCars[j].label;
          if (spaceCars[j].id === "player") {
            img.classList.add("car-player");
          }
          space.appendChild(img);
        }
      }

      spaceEls[i] = space;
      trackBoardEl.appendChild(space);
    }
  }

  function renderStandings() {
    var sorted = calculateStandings();
    standingsListEl.innerHTML = "";

    for (var i = 0; i < sorted.length; i++) {
      var car = sorted[i];
      var row = document.createElement("div");
      row.className = "standing-row";

      // Position badge
      var badge = document.createElement("span");
      badge.className = "position-badge";
      badge.textContent = (i + 1) + ".";
      if (i === 0) { badge.classList.add("first-place"); }
      row.appendChild(badge);

      // Car color circle
      var circle = document.createElement("span");
      circle.className = "standing-circle";
      circle.style.background = car.color;
      row.appendChild(circle);

      // Car label
      var label = document.createElement("span");
      label.className = "standing-label";
      label.textContent = car.label;
      row.appendChild(label);

      // Lap indicator
      var lapSpan = document.createElement("span");
      lapSpan.className = "standing-lap";
      if (car.finished) {
        lapSpan.textContent = "Loki\u00f0";
      } else {
        lapSpan.textContent = Math.min(car.lap + 1, TOTAL_LAPS) + "/" + TOTAL_LAPS;
      }
      row.appendChild(lapSpan);

      standingsListEl.appendChild(row);
    }
  }

  function renderHeader() {
    // Find the leading unfinished car for lap display
    var leadCar = null;
    var bestProgress = -1;
    for (var i = 0; i < cars.length; i++) {
      if (!cars[i].finished) {
        var prog = cars[i].lap * TRACK_SIZE + cars[i].position;
        if (prog > bestProgress) {
          bestProgress = prog;
          leadCar = cars[i];
        }
      }
    }
    // Fallback to player if all finished
    if (!leadCar) { leadCar = cars[0]; }

    var displayLap = Math.min(leadCar.lap + 1, TOTAL_LAPS);
    lapCounterEl.textContent = "Hring " + displayLap + " af " + TOTAL_LAPS;
  }

  function renderAll() {
    renderTrack();
    renderStandings();
    renderHeader();
  }

  // ── Home Page Rendering (per D-06) ──
  function renderHome() {
    var p = cars[0]; // player

    var eTier = UPGRADE_TIERS_ENGINE[p.engineTier];
    document.getElementById("stat-engine").textContent = "Stig " + p.engineTier;
    document.getElementById("stat-engine-range").textContent = eTier.min + "\u2013" + eTier.max + " skref";

    var tChance = Math.round(UPGRADE_TIERS_TIRES[p.tireTier] * 100);
    document.getElementById("stat-tires").textContent = "Stig " + p.tireTier;
    document.getElementById("stat-tires-chance").textContent = tChance + "% h\u00e6ging";

    var pl = state.career.placements;
    document.getElementById("stat-gold").textContent = pl[0];
    document.getElementById("stat-silver").textContent = pl[1];
    document.getElementById("stat-bronze").textContent = pl[2];

    document.getElementById("stat-races").textContent = state.career.racesCompleted;
    document.getElementById("stat-earned").textContent = state.career.totalPrizeEarned + " kr.";
  }

  // ── Shop Rendering (per D-04) ──
  function renderShopCard(type) {
    // type: "engine" or "tires"
    var player = cars[0];
    var currentTier = type === "engine" ? player.engineTier : player.tireTier;
    var nextTier = currentTier + 1;
    var isMaxed = nextTier > 4;

    var currentEl = document.getElementById("shop-" + type + "-current");
    var nextEl = document.getElementById("shop-" + type + "-next");
    var buyBtn = document.getElementById("buy-" + type + "-btn");

    // Current tier display
    if (type === "engine") {
      var cur = UPGRADE_TIERS_ENGINE[currentTier];
      currentEl.textContent = "N\u00fa: Stig " + currentTier + " (" + cur.min + "-" + cur.max + ")";
    } else {
      var curChance = Math.round(UPGRADE_TIERS_TIRES[currentTier] * 100);
      currentEl.textContent = "N\u00fa: Stig " + currentTier + " (" + curChance + "% h\u00e6ging)";
    }

    if (isMaxed) {
      nextEl.innerHTML = "<span class=\"shop-maxed\">H\u00e1mark!</span>";
      buyBtn.style.display = "none";
    } else {
      var cost = UPGRADE_COSTS[nextTier];
      if (type === "engine") {
        var nxt = UPGRADE_TIERS_ENGINE[nextTier];
        nextEl.textContent = "N\u00e6st: Stig " + nextTier + " (" + nxt.min + "-" + nxt.max + ") \u2014 " + cost + " kr.";
      } else {
        var nxtChance = Math.round(UPGRADE_TIERS_TIRES[nextTier] * 100);
        nextEl.textContent = "N\u00e6st: Stig " + nextTier + " (" + nxtChance + "% h\u00e6ging) \u2014 " + cost + " kr.";
      }
      buyBtn.style.display = "";
      buyBtn.disabled = player.money < cost;
      buyBtn.textContent = "Kaupa (" + cost + " kr.)";
    }
  }

  function renderShop() {
    renderShopCard("engine");
    renderShopCard("tires");
  }

  // ── Buy Upgrade ──
  function buyUpgrade(type) {
    var player = cars[0];
    var currentTier = type === "engine" ? player.engineTier : player.tireTier;
    var nextTier = currentTier + 1;
    if (nextTier > 4) { return; }
    var cost = UPGRADE_COSTS[nextTier];
    if (player.money < cost) { return; }

    player.money -= cost;
    if (type === "engine") {
      player.engineTier = nextTier;
    } else {
      player.tireTier = nextTier;
    }

    // Re-render shop and header balance
    renderShop();
    lapCounterEl.textContent = player.money + " kr.";
    saveGame();
  }

  // ── AI Upgrade Logic (per D-05) ──
  function aiUpgrade(carIndex) {
    var car = cars[carIndex];
    var personality = AI_PERSONALITIES[carIndex];
    if (!personality) { return; }

    // Save chance: skip buying this round
    if (Math.random() < personality.saveChance) { return; }

    // Determine which upgrade to attempt based on personality
    var buyEngine = false;
    var buyTires = false;

    if (personality.preference === "engine") {
      // 70% engine, 30% tires
      buyEngine = Math.random() < 0.7;
      buyTires = !buyEngine;
    } else if (personality.preference === "tires") {
      // 30% engine, 70% tires
      buyTires = Math.random() < 0.7;
      buyEngine = !buyTires;
    } else {
      // balanced: 50/50
      buyEngine = Math.random() < 0.5;
      buyTires = !buyEngine;
    }

    // Try preferred upgrade first, fall back to other
    var attempts = buyEngine ? ["engine", "tires"] : ["tires", "engine"];
    for (var i = 0; i < attempts.length; i++) {
      var upgradeType = attempts[i];
      var tier = upgradeType === "engine" ? car.engineTier : car.tireTier;
      var next = tier + 1;
      if (next > 4) { continue; }
      var cost = UPGRADE_COSTS[next];
      if (car.money < cost) { continue; }

      car.money -= cost;
      if (upgradeType === "engine") {
        car.engineTier = next;
      } else {
        car.tireTier = next;
      }
      return; // AI buys one upgrade per shop visit (per D-05)
    }
  }

  function runAiUpgrades() {
    for (var i = 1; i < cars.length; i++) {
      aiUpgrade(i);
    }
  }

  // ── View Management ──
  function showView(viewName) {
    // viewName: "home", "racing", "shop", "finished"
    var isHome = viewName === "home";
    var isRacing = viewName === "racing";
    var isShop = viewName === "shop";
    var isFinished = viewName === "finished";

    homeViewEl.classList.toggle("hidden", !isHome);
    trackBoardEl.classList.toggle("hidden", !isRacing);
    standingsPanelEl.classList.toggle("hidden", !isRacing);
    document.getElementById("roll-area").classList.toggle("hidden", !isRacing);
    shopViewEl.classList.toggle("hidden", !isShop);
    resultsScreenEl.classList.toggle("hidden", !isFinished);

    // Header content changes per view
    if (isHome || isShop) {
      lapCounterEl.textContent = cars[0].money + " kr.";
    } else {
      renderHeader();
    }

    state.phase = viewName;
    saveGame();
  }

  // ── Corner Callout ──
  function showCallout(spaceIndex, text) {
    var spaceEl = spaceEls[spaceIndex];
    if (!spaceEl) { return; }
    var old = spaceEl.querySelector(".callout");
    if (old) { old.parentNode.removeChild(old); }
    var el = document.createElement("div");
    el.className = "callout";
    el.textContent = text;
    spaceEl.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) { el.parentNode.removeChild(el); }
    }, 1600);
  }

  // ── Race Logic ──
  function resolveCarMove(car) {
    if (car.finished) { return { steps: 0, cornerHit: false, penalty: 0, engineRoll: 0, tireRoll: 0, slowed: false }; }

    var tier = UPGRADE_TIERS_ENGINE[car.engineTier];
    var engineRoll = rollDieRange(tier.min, tier.max);
    var totalSteps = engineRoll;
    var moved = 0;
    var cornerHit = false;
    var penalty = 0;
    var tireRoll = 0;
    var cornerChecked = false;

    while (moved < totalSteps && !car.finished) {
      var prev = car.position;
      var next = (prev + 1) % TRACK_SIZE;

      // Lap wrap detection: crossing from space 19 to space 0
      if (next === 0 && prev === TRACK_SIZE - 1) {
        car.lap += 1;
        if (car.lap >= TOTAL_LAPS) {
          car.finished = true;
          car.finishOrder = ++state.finishCount;
          car.position = next;
          moved++;
          break;
        }
      }

      car.position = next;
      moved++;

      // Corner check (once per turn max) per D-05
      if (!cornerChecked && CORNER_SPACES.indexOf(next) !== -1) {
        cornerChecked = true;
        cornerHit = true;
        var slowChance = UPGRADE_TIERS_TIRES[car.tireTier];
        var roll = Math.random();
        if (roll < slowChance) {
          penalty = 1;
          totalSteps = Math.max(moved, totalSteps - penalty);
          showCallout(next, "H\u00e6gt! -1 skref");
        } else {
          showCallout(next, "Hreint horn!");
        }
      }
    }

    return { steps: moved, cornerHit: cornerHit, penalty: penalty, engineRoll: engineRoll, tireRoll: tireRoll, slowed: penalty > 0 };
  }

  function resolveRound() {
    state.round++;
    var results = [];
    for (var i = 0; i < cars.length; i++) {
      results.push(resolveCarMove(cars[i]));
    }

    // After ALL cars processed (Pitfall 4): check if any finished
    if (state.finishCount > 0 && state.phase !== "finished") {
      // Assign remaining cars their positions by current standings
      var standings = calculateStandings();
      for (var j = 0; j < standings.length; j++) {
        if (!standings[j].finished) {
          standings[j].finished = true;
          standings[j].finishOrder = ++state.finishCount;
        }
      }
      state.phase = "finished";

      // Award prize money (per D-07: awarded when results screen appears)
      for (var k = 0; k < cars.length; k++) {
        var prize = PRIZE_MONEY[cars[k].finishOrder - 1];
        cars[k].money += prize;
      }
      // Update career stats for player
      state.career.racesCompleted++;
      var playerOrder = cars[0].finishOrder;
      state.career.placements[playerOrder - 1]++;
      if (playerOrder === 1) { state.career.wins++; }
      state.career.totalPrizeEarned += PRIZE_MONEY[playerOrder - 1];
    }

    return results;
  }

  function showDiceResults(results) {
    diceResultEl.innerHTML = "";
    for (var i = 0; i < cars.length; i++) {
      if (results[i].steps === 0) { continue; }
      var row = document.createElement("div");

      var dot = document.createElement("span");
      dot.className = "dice-dot";
      dot.style.background = cars[i].color;
      row.appendChild(dot);

      var txt = document.createElement("span");
      var label = cars[i].label + ": " + results[i].engineRoll;
      if (results[i].cornerHit) {
        label += results[i].slowed ? " (horn: h\u00e6gt!)" : " (horn: hreint)";
      }
      txt.textContent = label;
      row.appendChild(txt);

      diceResultEl.appendChild(row);
    }
  }

  function showResults() {
    resultsListEl.innerHTML = "";
    var sorted = cars.slice().sort(function (a, b) { return a.finishOrder - b.finishOrder; });
    for (var i = 0; i < sorted.length; i++) {
      var car = sorted[i];
      var row = document.createElement("div");
      row.className = "result-row";
      if (car.finishOrder === 1) { row.classList.add("first-place"); }

      var pos = document.createElement("span");
      pos.textContent = car.finishOrder + ". s\u00e6ti";
      pos.style.fontWeight = "700";
      pos.style.minWidth = "60px";
      row.appendChild(pos);

      var circle = document.createElement("span");
      circle.style.display = "inline-block";
      circle.style.width = "16px";
      circle.style.height = "16px";
      circle.style.borderRadius = "50%";
      circle.style.background = car.color;
      circle.style.flexShrink = "0";
      row.appendChild(circle);

      var lbl = document.createElement("span");
      lbl.textContent = car.label;
      row.appendChild(lbl);

      var prize = document.createElement("span");
      prize.textContent = PRIZE_MONEY[car.finishOrder - 1] + " kr.";
      prize.style.marginLeft = "auto";
      prize.style.fontWeight = "700";
      row.appendChild(prize);

      resultsListEl.appendChild(row);
    }
  }

  function onRollClick() {
    if (state.phase !== "racing") { return; }
    rollBtnEl.disabled = true;
    var results = resolveRound();
    renderAll();
    showDiceResults(results);
    if (state.phase === "finished") {
      showResults();
      rollBtnEl.style.display = "none";
      showView("finished");
    } else {
      rollBtnEl.disabled = false;
    }
  }

  // ── Race Management ──
  function resetRace() {
    for (var i = 0; i < cars.length; i++) {
      cars[i].position = 0;
      cars[i].lap = 0;
      cars[i].finished = false;
      cars[i].finishOrder = 0;
    }
    state.round = 0;
    state.finishCount = 0;
    state.phase = "racing";
  }

  // ── Save/Load ──
  function getSerializableState() {
    return {
      cars: cars.map(function (c) {
        return {
          id: c.id, position: c.position, lap: c.lap,
          finished: c.finished, finishOrder: c.finishOrder,
          money: c.money, engineTier: c.engineTier, tireTier: c.tireTier
        };
      }),
      state: {
        phase: state.phase, round: state.round, finishCount: state.finishCount,
        career: state.career
      }
    };
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(getSerializableState()));
    } catch (e) { }
  }

  function loadGame() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) { return; }
      var data = JSON.parse(raw);
      if (data.cars && data.cars.length === 4) {
        for (var i = 0; i < 4; i++) {
          var pos = data.cars[i].position;
          // Validate position is integer 0..TRACK_SIZE-1
          if (typeof pos === "number" && pos >= 0 && pos < TRACK_SIZE && pos === Math.floor(pos)) {
            cars[i].position = pos;
          } else {
            cars[i].position = 0;
          }
          var lap = data.cars[i].lap;
          // Validate lap is integer >= 0
          if (typeof lap === "number" && lap >= 0 && lap === Math.floor(lap)) {
            cars[i].lap = lap;
          } else {
            cars[i].lap = 0;
          }
          cars[i].finished = !!data.cars[i].finished;
          cars[i].finishOrder = data.cars[i].finishOrder || 0;
          // Validate money (number >= 0)
          var money = data.cars[i].money;
          if (typeof money === "number" && money >= 0) {
            cars[i].money = money;
          } else {
            cars[i].money = STARTING_MONEY;
          }
          // Validate engineTier (integer 0..4)
          var et = data.cars[i].engineTier;
          if (typeof et === "number" && et >= 0 && et <= 4 && et === Math.floor(et)) {
            cars[i].engineTier = et;
          } else {
            cars[i].engineTier = 0;
          }
          // Validate tireTier (integer 0..4)
          var tt = data.cars[i].tireTier;
          if (typeof tt === "number" && tt >= 0 && tt <= 4 && tt === Math.floor(tt)) {
            cars[i].tireTier = tt;
          } else {
            cars[i].tireTier = 0;
          }
        }
      }
      if (data.state) {
        // Validate phase is one of "home", "racing", "finished", "shop"
        var validPhases = ["home", "racing", "finished", "shop"];
        if (validPhases.indexOf(data.state.phase) !== -1) {
          state.phase = data.state.phase;
        } else {
          state.phase = "home";
        }
        state.round = data.state.round || 0;
        state.finishCount = data.state.finishCount || 0;
        // Restore career stats
        if (data.state.career) {
          var c = data.state.career;
          if (typeof c.racesCompleted === "number") { state.career.racesCompleted = c.racesCompleted; }
          if (typeof c.wins === "number") { state.career.wins = c.wins; }
          if (typeof c.totalPrizeEarned === "number") { state.career.totalPrizeEarned = c.totalPrizeEarned; }
          if (Array.isArray(c.placements) && c.placements.length === 4) {
            state.career.placements = c.placements.slice();
          }
        }
      }
    } catch (e) { }
  }

  // ── Event Binding ──
  function bindEvents() {
    // Roll button (racing)
    rollBtnEl.addEventListener("click", onRollClick);

    // Home -> Shop (per D-06)
    document.getElementById("go-shop-btn").addEventListener("click", function () {
      renderShop();
      showView("shop");
    });

    // Home -> Race (per D-06)
    // AI upgrades happen "between races" — run before each race (per D-05)
    document.getElementById("go-race-btn").addEventListener("click", function () {
      runAiUpgrades();
      resetRace();
      showView("racing");
      renderAll();
      rollBtnEl.style.display = "";
      rollBtnEl.disabled = false;
    });

    // Shop -> Home
    document.getElementById("shop-home-btn").addEventListener("click", function () {
      renderHome();
      showView("home");
    });

    // Shop -> Race
    document.getElementById("shop-race-btn").addEventListener("click", function () {
      runAiUpgrades();
      resetRace();
      showView("racing");
      renderAll();
      rollBtnEl.style.display = "";
      rollBtnEl.disabled = false;
    });

    // Shop buy buttons
    document.getElementById("buy-engine-btn").addEventListener("click", function () {
      buyUpgrade("engine");
    });
    document.getElementById("buy-tires-btn").addEventListener("click", function () {
      buyUpgrade("tires");
    });

    // Results -> Home (per D-07: replaces old restart-btn)
    document.getElementById("home-btn-results").addEventListener("click", function () {
      renderHome();
      showView("home");
    });

    window.addEventListener("beforeunload", saveGame);
  }

  // ── Init ──
  function init() {
    trackBoardEl = document.getElementById("track-board");
    standingsListEl = document.getElementById("standings-list");
    lapCounterEl = document.getElementById("lap-counter");
    rollBtnEl = document.getElementById("roll-btn");
    diceResultEl = document.getElementById("dice-result");
    resultsScreenEl = document.getElementById("results-screen");
    resultsListEl = document.getElementById("results-list");
    homeViewEl = document.getElementById("home-view");
    shopViewEl = document.getElementById("shop-view");
    standingsPanelEl = document.getElementById("standings-panel");

    loadGame();

    // Route to correct view based on saved phase
    if (state.phase === "racing") {
      showView("racing");
      renderAll();
      rollBtnEl.style.display = "";
      rollBtnEl.disabled = false;
    } else if (state.phase === "finished") {
      renderAll();
      showView("finished");
      showResults();
      rollBtnEl.style.display = "none";
    } else if (state.phase === "shop") {
      renderShop();
      showView("shop");
    } else {
      // Default: home
      renderHome();
      showView("home");
    }

    bindEvents();
    setInterval(saveGame, AUTOSAVE_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
