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
    whatsapp: {
      ...base.whatsapp,
      ...(override.whatsapp || {})
    },
    eventEndpoint: {
      ...base.eventEndpoint,
      ...(override.eventEndpoint || {})
    },
    payloadTemplate: {
      ...base.payloadTemplate,
      ...(override.payloadTemplate || {}),
      metadata: {
        ...(base.payloadTemplate.metadata || {}),
        ...((override.payloadTemplate || {}).metadata || {})
      }
    }
  };
}

const APP_CONFIG = getRuntimeConfig();

const { Wheel } = spinWheel;

const state = {
  waId: null,
  campaignId: null,
  selectedTeam: null,
  selectedTeamLabel: null,
  scoreTotal: 0,
  lastReward: null,
  lastSegment: null,
  lastEvent: null,
  wheel: null,
  isSpinning: false
};

const qs = new URLSearchParams(window.location.search);

state.waId = qs.get("wa_id") || "demo_user";
state.campaignId = qs.get("campaign_id") || APP_CONFIG.campaign.campaignId;

const elements = {
  brandLogo: document.getElementById("brand-logo"),
  campaignEyebrow: document.getElementById("campaign-eyebrow"),
  campaignTitle: document.getElementById("campaign-title"),
  campaignSubtitle: document.getElementById("campaign-subtitle"),

  teamSelector: document.getElementById("team-selector"),
  spinBtn: document.getElementById("spin-btn"),

  resultCard: document.getElementById("result-card"),
  resultTitle: document.getElementById("result-title"),
  resultDescription: document.getElementById("result-description"),

  eventPreview: document.getElementById("event-preview"),
  returnWhatsappBtn: document.getElementById("return-whatsapp-btn"),

  metricTeam: document.getElementById("metric-team"),
  metricScore: document.getElementById("metric-score"),
  metricSegment: document.getElementById("metric-segment")
};

function init() {
  applyBrand(APP_CONFIG.brand);
  renderTeams();
  createWheel();
  bindEvents();

  emitEvent("page_loaded", {
    event_label: "Microsite loaded",
    next_action: "select_team"
  });
}

function applyBrand(brand) {
  document.documentElement.style.setProperty("--brand-primary", brand.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", brand.secondaryColor);
  document.documentElement.style.setProperty("--brand-accent", brand.accentColor);
  document.documentElement.style.setProperty("--brand-bg", brand.backgroundColor);

  elements.brandLogo.src = brand.logoUrl;
  elements.brandLogo.alt = `${brand.name} logo`;

  elements.campaignEyebrow.textContent = APP_CONFIG.campaign.campaignName;
  elements.campaignTitle.textContent = `${brand.name}: gira, suma puntos y desbloquea premios`;
  elements.campaignSubtitle.textContent =
    "Vive una experiencia mundialista personalizada, acumula puntos y desbloquea recompensas para tu selección.";
}

function renderTeams() {
  elements.teamSelector.innerHTML = "";

  APP_CONFIG.teams.forEach((team) => {
    const button = document.createElement("button");
    button.className = "team-btn";
    button.dataset.teamId = team.id;
    button.dataset.teamLabel = team.label;
    button.innerHTML = `${team.flag} ${team.label}`;

    button.addEventListener("click", () => selectTeam(team, button));

    elements.teamSelector.appendChild(button);
  });
}

function selectTeam(team, button) {
  state.selectedTeam = team.id;
  state.selectedTeamLabel = team.label;
  state.lastSegment = `fan_${team.id}`;

  document.querySelectorAll(".team-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar ruleta";

  updateMetrics();

  emitEvent("team_selected", {
    team_selected: team.id,
    team_label: team.label,
    segment: state.lastSegment,
    next_action: "show_spin_wheel"
  });
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
    itemLabelFontSizeMax: 26,
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
  const duration = 4200;
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
  state.lastReward = reward;
  state.scoreTotal += reward.points;

  const segment = calculateSegment(reward);
  state.lastSegment = segment;

  elements.resultCard.classList.remove("hidden");
  elements.resultTitle.textContent = `Ganaste ${reward.label}`;
  elements.resultDescription.textContent =
    `Ahora tienes ${state.scoreTotal} puntos. Segmento generado: ${segment}.`;

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar otra vez";

  updateMetrics();

  emitEvent("spin_completed", {
    team_selected: state.selectedTeam,
    team_label: state.selectedTeamLabel,
    reward: reward.label,
    reward_type: reward.rewardType,
    points_awarded: reward.points,
    score_total: state.scoreTotal,
    segment,
    next_action: getNextAction(reward, segment)
  });
}

function calculateSegment(reward) {
  if (reward.rewardType === "poster_unlock") {
    return `${state.selectedTeam}_poster_unlocked`;
  }

  if (reward.rewardType === "coupon") {
    return `${state.selectedTeam}_reward_eligible`;
  }

  if (state.scoreTotal >= 200) {
    return `${state.selectedTeam}_high_engagement`;
  }

  return `${state.selectedTeam}_engaged`;
}

function getNextAction(reward, segment) {
  if (reward.rewardType === "poster_unlock") {
    return "send_poster_unlock_template";
  }

  if (reward.rewardType === "coupon") {
    return "send_coupon_template";
  }

  if (segment.includes("high_engagement")) {
    return "send_high_engagement_template";
  }

  return "send_continue_playing_template";
}

function updateMetrics() {
  elements.metricTeam.textContent = state.selectedTeamLabel || "—";
  elements.metricScore.textContent = String(state.scoreTotal);
  elements.metricSegment.textContent = state.lastSegment || "—";
}

function emitEvent(eventType, payload = {}) {
  const event = {
    event_id: crypto.randomUUID(),
    event_type: eventType,
    channel: "whatsapp",
    wa_id: state.waId,
    campaign_id: state.campaignId,
    source: APP_CONFIG.campaign.source,
    brand_name: APP_CONFIG.brand.name,
    microsite_url: window.location.href,
    timestamp: new Date().toISOString(),

    custom_integration_payload: {
      ...APP_CONFIG.payloadTemplate,
      event_type: eventType,
      wa_id: state.waId,
      campaign_id: state.campaignId,
      brand_name: APP_CONFIG.brand.name,
      team_selected: state.selectedTeam,
      score_total: state.scoreTotal,
      segment: state.lastSegment,
      last_reward: state.lastReward ? state.lastReward.label : null
    },

    payload
  };

  state.lastEvent = event;
  elements.eventPreview.textContent = JSON.stringify(event, null, 2);

  console.log("WORLD_CUP_DEMO_EVENT", event);

  if (APP_CONFIG.eventEndpoint.enabled && APP_CONFIG.eventEndpoint.url) {
    sendEventToEndpoint(event);
  }

  return event;
}

async function sendEventToEndpoint(event) {
  try {
    await fetch(APP_CONFIG.eventEndpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });
  } catch (error) {
    console.error("Error sending event", error);
  }
}

function returnToWhatsApp() {
  const segment = state.lastEvent?.payload?.segment || state.lastSegment || "demo_segment";

  const message = encodeURIComponent(
    `${APP_CONFIG.whatsapp.returnMessage}. Mi segmento es: ${segment}`
  );

  const url = `https://wa.me/${APP_CONFIG.whatsapp.returnPhone}?text=${message}`;

  emitEvent("return_to_whatsapp_clicked", {
    score_total: state.scoreTotal,
    team_selected: state.selectedTeam,
    team_label: state.selectedTeamLabel,
    last_reward: state.lastReward?.label || null,
    segment,
    next_action: "continue_conversation_in_whatsapp"
  });

  window.open(url, "_blank");
}

function bindEvents() {
  elements.spinBtn.addEventListener("click", spinWheelControlled);
  elements.returnWhatsappBtn.addEventListener("click", returnToWhatsApp);
}

init();
