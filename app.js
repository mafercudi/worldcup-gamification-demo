const STORAGE_KEY = "worldcup_demo_config";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getRuntimeConfig() {
  const qs = new URLSearchParams(window.location.search);
  const encodedConfig = qs.get("config");

  if (encodedConfig) {
    try {
      const json = decodeURIComponent(escape(atob(encodedConfig)));
      const parsedConfig = JSON.parse(json);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedConfig));
      return mergeConfig(clone(DEMO_CONFIG), parsedConfig);
    } catch (error) {
      console.error("Invalid config param", error);
    }
  }

  const savedConfig = localStorage.getItem(STORAGE_KEY);

  if (savedConfig) {
    try {
      return mergeConfig(clone(DEMO_CONFIG), JSON.parse(savedConfig));
    } catch (error) {
      console.error("Invalid saved config", error);
    }
  }

  return clone(DEMO_CONFIG);
}

function mergeConfig(base, override) {
  return {
    ...base,
    ...override,
    brand: {
      ...base.brand,
      ...(override.brand || {})
    },
    campaign: {
      ...base.campaign,
      ...(override.campaign || {})
    },
    eventEndpoint: {
      ...base.eventEndpoint,
      ...(override.eventEndpoint || {})
    }
  };
}

const APP_CONFIG = getRuntimeConfig();
const { Wheel } = spinWheel;

const qs = new URLSearchParams(window.location.search);

const state = {
  userRef: qs.get("user_ref") || qs.get("wa_id") || qs.get("phone") || "demo_user",
  playerName: qs.get("name") || "",
  campaignId: qs.get("campaign_id") || APP_CONFIG.campaign.campaignId,
  selectedTeam: qs.get("team") || "",
  selectedTeamLabel: "",
  scoreTotal: 0,
  wheel: null,
  isSpinning: false
};

const elements = {
  brandLogo: document.getElementById("brand-logo"),
  campaignEyebrow: document.getElementById("campaign-eyebrow"),
  campaignTitle: document.getElementById("campaign-title"),

  playerTitle: document.getElementById("player-title"),
  playerSubtitle: document.getElementById("player-subtitle"),

  countryCard: document.getElementById("country-card"),
  teamSelector: document.getElementById("team-selector"),

  spinBtn: document.getElementById("spin-btn"),

  resultCard: document.getElementById("result-card"),
  resultTitle: document.getElementById("result-title"),
  resultDescription: document.getElementById("result-description"),

  eventPreview: document.getElementById("event-preview"),

  metricTeam: document.getElementById("metric-team"),
  metricScore: document.getElementById("metric-score")
};

function init() {
  applyBrand(APP_CONFIG.brand);
  hydrateTeamFromUrl();
  renderTeams();
  configureGameMode();
  createWheel();
  bindEvents();
  updateMetrics();
}

function applyBrand(brand) {
  document.documentElement.style.setProperty("--brand-primary", brand.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", brand.secondaryColor);
  document.documentElement.style.setProperty("--brand-accent", brand.accentColor);
  document.documentElement.style.setProperty("--brand-bg", brand.backgroundColor);

  elements.brandLogo.src = brand.logoUrl;
  elements.brandLogo.alt = `${brand.name} logo`;

  elements.campaignEyebrow.textContent = APP_CONFIG.campaign.campaignName;
  elements.campaignTitle.textContent = "Gira y gana puntos";
}

function hydrateTeamFromUrl() {
  if (!state.selectedTeam) return;

  const team = APP_CONFIG.teams.find((item) => item.id === state.selectedTeam);

  if (team) {
    state.selectedTeam = team.id;
    state.selectedTeamLabel = team.label;
  } else {
    state.selectedTeamLabel = state.selectedTeam;
  }
}

function configureGameMode() {
  if (state.selectedTeam) {
    elements.countryCard.classList.add("hidden");
    elements.spinBtn.disabled = false;
    elements.spinBtn.textContent = "Girar ruleta";

    const greeting = state.playerName
      ? `${state.playerName}, juegas por ${state.selectedTeamLabel}`
      : `Juegas por ${state.selectedTeamLabel}`;

    elements.playerTitle.textContent = greeting;
    elements.playerSubtitle.textContent =
      "Gira la ruleta y suma puntos. Podrás volver mañana para una nueva jugada.";

    return;
  }

  elements.countryCard.classList.remove("hidden");
  elements.spinBtn.disabled = true;
  elements.spinBtn.textContent = "Selecciona un país";

  elements.playerTitle.textContent = "Elige tu selección para jugar";
  elements.playerSubtitle.textContent =
    "Si el link viene desde WhatsApp, esta selección debería venir precargada.";
}

function renderTeams() {
  elements.teamSelector.innerHTML = "";

  APP_CONFIG.teams.forEach((team) => {
    const button = document.createElement("button");
    button.className = "team-btn";
    button.dataset.teamId = team.id;
    button.dataset.teamLabel = team.label;
    button.innerHTML = `${team.flag} ${team.label}`;

    if (team.id === state.selectedTeam) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => selectTeam(team, button));

    elements.teamSelector.appendChild(button);
  });
}

function selectTeam(team, button) {
  state.selectedTeam = team.id;
  state.selectedTeamLabel = team.label;

  document.querySelectorAll(".team-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar ruleta";

  elements.playerTitle.textContent = `Juegas por ${state.selectedTeamLabel}`;
  elements.playerSubtitle.textContent =
    "Gira la ruleta y suma puntos. Podrás volver mañana para una nueva jugada.";

  updateMetrics();
}

function createWheel() {
  const container = document.querySelector(".wheel-container");

  const props = {
    items: APP_CONFIG.wheelItems.map((item) => ({
      label: item.label
    })),

    itemBackgroundColors: [
      APP_CONFIG.brand.primaryColor,
      APP_CONFIG.brand.secondaryColor,
      APP_CONFIG.brand.accentColor,
      "#ffffff"
    ],

    itemLabelColors: ["#ffffff", "#111111"],
    itemLabelFont: "Arial, sans-serif",
    itemLabelFontSizeMax: 24,
    itemLabelRadius: 0.82,
    itemLabelRadiusMax: 0.32,
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
      const rewardIndex = event.currentIndex;
      handleWheelResult(rewardIndex);
    }
  };

  state.wheel = new Wheel(container, props);
}

function spinWheelControlled() {
  if (!state.selectedTeam || state.isSpinning) return;

  const winningItemIndex = getRandomWinningIndex();
  const duration = 3800;
  const spinToCenter = true;
  const numberOfRevolutions = 5;
  const direction = 1;

  state.wheel.spinToItem(
    winningItemIndex,
    duration,
    spinToCenter,
    numberOfRevolutions,
    direction
  );
}

function getRandomWinningIndex() {
  return Math.floor(Math.random() * APP_CONFIG.wheelItems.length);
}

function handleWheelResult(rewardIndex) {
  const reward = APP_CONFIG.wheelItems[rewardIndex];

  state.isSpinning = false;
  state.scoreTotal += reward.points;

  const payload = buildCustomEventPayload(reward.points);

  elements.resultCard.classList.remove("hidden");
  elements.resultTitle.textContent = `Ganaste ${reward.points} puntos`;
  elements.resultDescription.textContent =
    `${state.selectedTeamLabel} suma ${reward.points} puntos. Vuelve mañana para una nueva jugada.`;

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Jugar otra vez";

  updateMetrics();
  emitPayload(payload);
}

function buildCustomEventPayload(pointsAwarded) {
  return {
    event_name: "worldcup_game_completed",
    user_ref: state.userRef,
    campaign_id: state.campaignId,
    team_selected: state.selectedTeam,
    points_awarded: pointsAwarded
  };
}

function updateMetrics() {
  elements.metricTeam.textContent = state.selectedTeamLabel || "—";
  elements.metricScore.textContent = String(state.scoreTotal);
}

function emitPayload(payload) {
  elements.eventPreview.textContent = JSON.stringify(payload, null, 2);

  console.log("CUSTOM_INTEGRATION_PAYLOAD", payload);

  if (APP_CONFIG.eventEndpoint.enabled && APP_CONFIG.eventEndpoint.url) {
    sendEventToEndpoint(payload);
  }
}

async function sendEventToEndpoint(payload) {
  try {
    await fetch(APP_CONFIG.eventEndpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Error sending event", error);
  }
}

function bindEvents() {
  elements.spinBtn.addEventListener("click", spinWheelControlled);
}

init();
