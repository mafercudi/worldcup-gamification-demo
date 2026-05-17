const STORAGE_KEY = "worldcup_demo_config";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeConfig(base, override) {
  return {
    ...base,
    ...override,
    brand: { ...base.brand, ...(override.brand || {}) },
    campaign: { ...base.campaign, ...(override.campaign || {}) },
    whatsapp: { ...base.whatsapp, ...(override.whatsapp || {}) },
    teams: override.teams || base.teams,
    wheelItems: override.wheelItems || base.wheelItems,
    eventEndpoint: { ...base.eventEndpoint, ...(override.eventEndpoint || {}) },
    payloadTemplate: { ...base.payloadTemplate, ...(override.payloadTemplate || {}) }
  };
}

function getRuntimeConfig() {
  const qs = new URLSearchParams(window.location.search);
  const encodedConfig = qs.get("config");

  if (encodedConfig) {
    try {
      const json = decodeURIComponent(escape(atob(encodedConfig)));
      const parsed = JSON.parse(json);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return mergeConfig(clone(DEMO_CONFIG), parsed);
    } catch (error) {
      console.error("Invalid config param", error);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return mergeConfig(clone(DEMO_CONFIG), JSON.parse(saved));
    } catch (error) {
      console.error("Invalid saved config", error);
    }
  }

  return clone(DEMO_CONFIG);
}

const APP_CONFIG = getRuntimeConfig();
const { Wheel } = spinWheel;

const qs = new URLSearchParams(window.location.search);

const state = {
  waId: qs.get("wa_id") || "demo_user",
  campaignId: qs.get("campaign_id") || APP_CONFIG.campaign.campaignId,
  selectedTeam: null,
  selectedTeamLabel: null,
  scoreTotal: 0,
  lastReward: null,
  lastSegment: null,
  lastEvent: null,
  wheel: null,
  isSpinning: false
};

const elements = {
  brandLogo: document.getElementById("brand-logo"),
  campaignEyebrow: document.getElementById("campaign-eyebrow"),
  campaignTitle: document.getElementById("campaign-title"),
  campaignSubtitle: document.getElementById("campaign-subtitle"),
  teamSelector: document.getElementById("team-selector"),
  teamSearch: document.getElementById("team-search"),
  spinBtn: document.getElementById("spin-btn"),
  resultCard: document.getElementById("result-card"),
  resultTitle: document.getElementById("result-title"),
  resultDescription: document.getElementById("result-description"),
  returnWhatsappBtn: document.getElementById("return-whatsapp-btn"),
  metricTeam: document.getElementById("metric-team"),
  metricScore: document.getElementById("metric-score")
};

function init() {
  applyBrand();
  renderTeams(APP_CONFIG.teams);
  createWheel();
  bindEvents();
  updateMetrics();
  emitEvent("page_loaded");
}

function applyBrand() {
  document.documentElement.style.setProperty("--brand-primary", APP_CONFIG.brand.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", APP_CONFIG.brand.secondaryColor);
  document.documentElement.style.setProperty("--brand-accent", APP_CONFIG.brand.accentColor);
  document.documentElement.style.setProperty("--brand-bg", APP_CONFIG.brand.backgroundColor);

  elements.brandLogo.src = APP_CONFIG.brand.logoUrl;
  elements.campaignEyebrow.textContent = "MATCHDAY GAME";
  elements.campaignTitle.textContent = `${APP_CONFIG.brand.name} Fan Challenge`;
  elements.campaignSubtitle.textContent = "Elige tu selección, gira la ruleta y gana puntos.";
}

function renderTeams(teams) {
  elements.teamSelector.innerHTML = "";

  teams.forEach((team) => {
    const button = document.createElement("button");
    button.className = "team-btn";
    button.dataset.teamId = team.id;
    button.innerHTML = `${team.flag} ${team.label}`;

    if (team.id === state.selectedTeam) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => selectTeam(team));

    elements.teamSelector.appendChild(button);
  });
}

function filterTeams() {
  const value = elements.teamSearch.value.toLowerCase().trim();

  const filtered = APP_CONFIG.teams.filter((team) =>
    team.label.toLowerCase().includes(value)
  );

  renderTeams(filtered);
}

function selectTeam(team) {
  state.selectedTeam = team.id;
  state.selectedTeamLabel = team.label;
  state.scoreTotal = 0;
  state.lastReward = null;
  state.lastSegment = `fan_${team.id}`;
  state.lastEvent = null;
  state.isSpinning = false;

  document.querySelectorAll(".team-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.teamId === team.id);
  });

  elements.resultCard.classList.add("hidden");
  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar ruleta";

  updateMetrics();
  emitEvent("team_selected");
}

function createWheel() {
  const container = document.querySelector(".wheel-container");

  state.wheel = new Wheel(container, {
    items: APP_CONFIG.wheelItems.map((item) => ({ label: item.label })),

    itemBackgroundColors: [
      APP_CONFIG.brand.primaryColor,
      "#8cc63f",
      APP_CONFIG.brand.accentColor,
      "#ffffff",
      "#0b7a2a",
      "#8cc63f"
    ],

    itemLabelColors: ["#ffffff", "#111111"],
    itemLabelFont: "Arial, sans-serif",
    itemLabelFontSizeMax: 22,
    itemLabelRadius: 0.78,
    itemLabelRadiusMax: 0.34,
    itemLabelRotation: 0,

    lineColor: "rgba(255,255,255,0.65)",
    lineWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    borderWidth: 3,
    radius: 0.92,

    isInteractive: false,
    pointerAngle: 270,

    onSpin: () => {
      state.isSpinning = true;
      elements.spinBtn.disabled = true;
      elements.spinBtn.textContent = "Girando...";
    },

    onRest: (event) => {
      handleWheelResult(event.currentIndex);
    }
  });
}

function spinWheel() {
  if (!state.selectedTeam || state.isSpinning) return;

  const index = Math.floor(Math.random() * APP_CONFIG.wheelItems.length);

  state.wheel.spinToItem(index, 4200, true, 5, 1);
}

function handleWheelResult(index) {
  const reward = APP_CONFIG.wheelItems[index];

  state.isSpinning = false;
  state.lastReward = reward;
  state.scoreTotal = reward.points;
  state.lastSegment = `fan_${state.selectedTeam}`;

  elements.resultCard.classList.remove("hidden");
  elements.resultTitle.textContent = `Ganaste ${reward.label}`;
  elements.resultDescription.textContent =
    `Apoyas a ${state.selectedTeamLabel}. Segmento: ${state.lastSegment}.`;

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar otra vez";

  updateMetrics();
  emitEvent("spin_completed");
}

function updateMetrics() {
  elements.metricTeam.textContent = state.selectedTeamLabel || "—";
  elements.metricScore.textContent = String(state.scoreTotal || 0);
}

function getNextAction() {
  if (!state.selectedTeam) return "select_team";
  if (!state.lastReward) return "spin_wheel";

  if (state.lastReward.rewardType === "poster_unlock") return "send_poster_unlock_template";
  if (state.lastReward.rewardType === "coupon") return "send_coupon_template";

  return "send_continue_playing_template";
}

function emitEvent(eventType) {
  const event = {
    ...APP_CONFIG.payloadTemplate,
    event_type: eventType,
    wa_id: state.waId,
    campaign_id: state.campaignId,
    brand_name: APP_CONFIG.brand.name,
    team_selected: state.selectedTeam,
    team_label: state.selectedTeamLabel,
    segment: state.lastSegment,
    score_total: state.scoreTotal,
    reward: state.lastReward ? state.lastReward.label : null,
    reward_type: state.lastReward ? state.lastReward.rewardType : null,
    next_action: getNextAction(),
    timestamp: new Date().toISOString()
  };

  state.lastEvent = event;
  console.log("WORLD_CUP_DEMO_EVENT", event);

  if (APP_CONFIG.eventEndpoint.enabled && APP_CONFIG.eventEndpoint.url) {
    fetch(APP_CONFIG.eventEndpoint.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    }).catch(console.error);
  }

  return event;
}

function returnToWhatsApp() {
  const message = encodeURIComponent(
    `${APP_CONFIG.whatsapp.returnMessage}. Mi segmento es: ${state.lastSegment || "demo_segment"}`
  );

  emitEvent("return_to_whatsapp_clicked");

  window.open(`https://wa.me/${APP_CONFIG.whatsapp.returnPhone}?text=${message}`, "_blank");
}

function bindEvents() {
  elements.teamSearch.addEventListener("input", filterTeams);
  elements.spinBtn.addEventListener("click", spinWheel);
  elements.returnWhatsappBtn.addEventListener("click", returnToWhatsApp);
}

init();
