(function () {
  "use strict";

  var SAVE_KEY = "life2.0_save";

  var TIME_ORDER = ["morning", "day", "evening", "night"];

  var i18n = {
    is: {
      energy: "Orka",
      mood: "Skap",
      money: "Peningar",
      time: "Tími",
      dayCount: "Dagur",
      back: "← Til baka",
      newGame: "Byrja upp á nýtt",
      whatToDo: "Hvað viltu gera?",
      sleep: "Sofa",
      eat: "Borða",
      computer: "Tölva",
      work: "Fara í vinnu",
      shop: "Kaupa mat",
      shopTitle: "Verslun",
      foodStock: "Matur í birgðum:",
      shopDesc: "Kaupa mat kostar peninga og bætir mat í birgðir. Þú getur borðað síðar.",
      buy1: "1 matur",
      buy5: "5 matir",
      buy10: "10 matir",
      timeMorning: "Morgunn",
      timeDay: "Dagur",
      timeEvening: "Kveld",
      timeNight: "Nótt",
    },
    en: {
      energy: "Energy",
      mood: "Mood",
      money: "Money",
      time: "Time",
      dayCount: "Day",
      back: "← Back",
      newGame: "New game",
      whatToDo: "What do you want to do?",
      sleep: "Sleep",
      eat: "Eat",
      computer: "Computer",
      work: "Go to work",
      shop: "Buy food",
      shopTitle: "Shop",
      foodStock: "Food in stock:",
      shopDesc: "Buying food costs money and adds to your stock. You can eat later.",
      buy1: "1 food",
      buy5: "5 food",
      buy10: "10 food",
      timeMorning: "Morning",
      timeDay: "Day",
      timeEvening: "Evening",
      timeNight: "Night",
    },
  };

  function defaultState(lang) {
    return {
      energy: 80,
      mood: 70,
      money: 0,
      food: 0,
      time: "day",
      dayCount: 1,
      language: lang || "is",
    };
  }

  var state = defaultState("is");

  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function advanceTime() {
    var idx = TIME_ORDER.indexOf(state.time);
    idx = (idx + 1) % TIME_ORDER.length;
    state.time = TIME_ORDER[idx];
    if (state.time === "morning") {
      state.dayCount += 1;
      state.energy = clamp(state.energy + 30, 0, 100);
    }
  }

  function applyAction(actionId) {
    switch (actionId) {
      case "sleep":
        state.energy = clamp(state.energy + 40, 0, 100);
        state.mood = clamp(state.mood - 5, 0, 100);
        advanceTime();
        advanceTime();
        break;
      case "eat":
        if (state.food < 1) return false;
        state.food -= 1;
        state.energy = clamp(state.energy + 15, 0, 100);
        state.mood = clamp(state.mood + 10, 0, 100);
        advanceTime();
        break;
      case "computer":
        state.mood = clamp(state.mood + 8, 0, 100);
        state.energy = clamp(state.energy - 15, 0, 100);
        advanceTime();
        break;
      case "work":
        if (state.energy < 20) return false;
        state.energy = clamp(state.energy - 25, 0, 100);
        state.mood = clamp(state.mood - 5, 0, 100);
        state.money += 50;
        advanceTime();
        advanceTime();
        break;
      default:
        return false;
    }
    return true;
  }

  function buyFood(amount, cost) {
    if (state.money < cost) return false;
    state.money -= cost;
    state.food += amount;
    advanceTime();
    return true;
  }

  function t(key) {
    return i18n[state.language][key] || key;
  }

  function timeLabel() {
    var key = "time" + state.time.charAt(0).toUpperCase() + state.time.slice(1);
    return t(key);
  }

  function render() {
    var energyEl = document.getElementById("energy-value");
    var moodEl = document.getElementById("mood-value");
    var moneyEl = document.getElementById("money-value");
    var timeEl = document.getElementById("time-value");
    var dayEl = document.getElementById("day-value");
    var foodEl = document.getElementById("food-value");
    var energyBar = document.getElementById("energy-bar");
    var moodBar = document.getElementById("mood-bar");

    if (energyEl) energyEl.textContent = Math.round(state.energy);
    if (moodEl) moodEl.textContent = Math.round(state.mood);
    if (moneyEl) moneyEl.textContent = state.money;
    if (timeEl) {
      timeEl.textContent = timeLabel();
      timeEl.setAttribute("data-i18n-value", state.time);
    }
    if (dayEl) dayEl.textContent = state.dayCount;
    if (foodEl) foodEl.textContent = state.food;
    if (energyBar) energyBar.style.width = state.energy + "%";
    if (moodBar) moodBar.style.width = state.mood + "%";

    var eatBtn = document.querySelector('[data-action="eat"]');
    var workBtn = document.querySelector('[data-action="work"]');
    if (eatBtn) eatBtn.disabled = state.food < 1;
    if (workBtn) workBtn.disabled = state.energy < 20;

    var shopOptions = document.querySelectorAll(".shop-option");
    shopOptions.forEach(function (btn) {
      var cost = parseInt(btn.getAttribute("data-cost"), 10);
      btn.disabled = state.money < cost;
    });

    applyI18n();
  }

  function applyI18n() {
    var lang = state.language;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var val = i18n[lang][key];
      if (val != null) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-value]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-value");
      if (key === "morning" || key === "day" || key === "evening" || key === "night") {
        var timeKey = "time" + key.charAt(0).toUpperCase() + key.slice(1);
        var val = i18n[lang][timeKey];
        if (val != null) el.textContent = val;
      }
    });
    var langToggle = document.getElementById("lang-toggle");
    if (langToggle) langToggle.textContent = state.language === "is" ? "EN" : "IS";
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      state.energy = clamp(data.energy ?? 80, 0, 100);
      state.mood = clamp(data.mood ?? 70, 0, 100);
      state.money = data.money ?? 0;
      state.food = data.food ?? 0;
      state.time = TIME_ORDER.indexOf(data.time) >= 0 ? data.time : "day";
      state.dayCount = Math.max(1, data.dayCount ?? 1);
      state.language = data.language === "en" ? "en" : "is";
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    if (typeof confirm !== "function" || confirm(t("newGame") + "?")) {
      state = defaultState(state.language);
      save();
      render();
    }
  }

  function openShop() {
    var modal = document.getElementById("shop-modal");
    if (modal) modal.classList.remove("hidden");
  }

  function closeShop() {
    var modal = document.getElementById("shop-modal");
    if (modal) modal.classList.add("hidden");
  }

  function init() {
    load();
    render();

    document.querySelectorAll(".room-btn[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        if (action === "shop") {
          openShop();
          return;
        }
        if (applyAction(action)) {
          save();
          render();
        }
      });
    });

    document.getElementById("shop-close").addEventListener("click", closeShop);
    document.querySelector(".modal-backdrop").addEventListener("click", closeShop);

    document.querySelectorAll(".shop-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var amount = parseInt(btn.getAttribute("data-buy"), 10);
        var cost = parseInt(btn.getAttribute("data-cost"), 10);
        if (buyFood(amount, cost)) {
          save();
          render();
        }
      });
    });

    document.getElementById("lang-toggle").addEventListener("click", function () {
      state.language = state.language === "is" ? "en" : "is";
      save();
      render();
    });

    document.getElementById("reset-btn").addEventListener("click", reset);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
