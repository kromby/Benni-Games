(function () {
  "use strict";

  // ── Constants ──
  var TRACK_SIZE = 20;
  var TOTAL_LAPS = 2;
  var CORNER_SPACES = [0, 5, 10, 15];
  var SAVE_KEY = "klesstinn-rally-save";
  var AUTOSAVE_MS = 30000;
  var PRIZE_MONEY = [400, 250, 150, 75];
  var ENGINE_DICE_MAX = 4;
  var TIRE_DICE_MAX = 4;
  var CAR_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];
  var CAR_LABELS = ["\u00de\u00fa", "A1", "A2", "A3"];

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
    { id: "player", color: CAR_COLORS[0], label: CAR_LABELS[0], position: 0, lap: 0, finished: false, finishOrder: 0 },
    { id: "ai1",    color: CAR_COLORS[1], label: CAR_LABELS[1], position: 0, lap: 0, finished: false, finishOrder: 0 },
    { id: "ai2",    color: CAR_COLORS[2], label: CAR_LABELS[2], position: 0, lap: 0, finished: false, finishOrder: 0 },
    { id: "ai3",    color: CAR_COLORS[3], label: CAR_LABELS[3], position: 0, lap: 0, finished: false, finishOrder: 0 }
  ];

  // ── Game State ──
  var state = {
    phase: "racing",
    round: 0,
    finishCount: 0
  };

  // ── DOM References ──
  var trackBoardEl, standingsListEl, lapCounterEl, rollBtnEl, diceResultEl, resultsScreenEl, resultsListEl;

  // ── Utility Functions ──
  function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
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
        sfLabel.textContent = "S/F";
        space.appendChild(sfLabel);
      }

      // CSS Grid placement (1-indexed)
      space.style.gridRow = String(TRACK_COORDS[i].row + 1);
      space.style.gridColumn = String(TRACK_COORDS[i].col + 1);

      // Cars at this space
      var spaceCars = carsAtSpace[i] || [];
      if (spaceCars.length > 0) {
        space.classList.add("cars-" + spaceCars.length);
        for (j = 0; j < spaceCars.length; j++) {
          var circle = document.createElement("div");
          circle.className = "car-circle";
          circle.style.background = spaceCars[j].color;
          if (spaceCars[j].id === "player") {
            circle.classList.add("car-player");
          }
          space.appendChild(circle);
        }
      }

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
      badge.textContent = (i + 1) + ". s\u00e6ti";
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
        lapSpan.textContent = "Hring " + Math.min(car.lap + 1, TOTAL_LAPS) + "/" + TOTAL_LAPS;
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

  // ── Save/Load ──
  function getSerializableState() {
    return {
      cars: cars.map(function (c) {
        return { id: c.id, position: c.position, lap: c.lap, finished: c.finished, finishOrder: c.finishOrder };
      }),
      state: { phase: state.phase, round: state.round, finishCount: state.finishCount }
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
        }
      }
      if (data.state) {
        // Validate phase is one of "racing" or "finished"
        var validPhases = ["racing", "finished"];
        if (validPhases.indexOf(data.state.phase) !== -1) {
          state.phase = data.state.phase;
        } else {
          state.phase = "racing";
        }
        state.round = data.state.round || 0;
        state.finishCount = data.state.finishCount || 0;
      }
    } catch (e) { }
  }

  // ── Event Binding ──
  function bindEvents() {
    rollBtnEl.addEventListener("click", function () {
      // Plan 02 implements onRollClick
    });
    document.getElementById("restart-btn").addEventListener("click", function () {
      window.location.reload();
    });
    // Save before unload
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
    loadGame();
    renderAll();
    bindEvents();
    setInterval(saveGame, AUTOSAVE_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
