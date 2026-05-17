
const { Wheel } = spinWheel;

const state = {
  waId: null,
  campaignId: null,
  selectedTeam: null,
  selectedTeamLabel: null,
  scoreTotal: 0,
  lastReward: null,
  lastEvent: null,
  wheel: null,
  isSpinning: false
};

const qs = new URLSearchParams(window.location.search);

state.waId = qs.get("wa_id") || "demo_user";
state.campaignId = qs.get("campaign_id") || DEMO_CONFIG.campaign.campaignId;

const elements = {
  brandLogo: document.getElementById("brand-logo"),
  campaignTitle: document.getElementById("campaign-title"),
  brandNameInput: document.getElementById("brand-name-input"),
  brandLogoInput: document.getElementById("brand-logo-input"),
  brandColorInput: document.getElementById("brand-color-input"),
  applyBrandBtn: document.getElementById("apply-brand-btn"),
  teamSelector: document.getElementById("team-selector"),
  spinBtn: document.getElementById("spin-btn"),
  resultCard: document.getElementById("result-card"),
  resultTitle: document.getElementById("result-title"),
  resultDescription: document.getElementById("result-description"),
  eventPreview: document.getElementById("event-preview"),
  returnWhatsappBtn: document.getElementById("return-whatsapp-btn")
};

function init() {
  applyBrand(DEMO_CONFIG.brand);
  renderBrandEditorDefaults();
  renderTeams();
  createWheel();
  bindEvents();

  emitEvent("page_loaded", {
    event_label: "Microsite loaded"
  });
}

function applyBrand(brand) {
  document.documentElement.style.setProperty("--brand-primary", brand.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", brand.secondaryColor);
  document.documentElement.style.setProperty("--brand-accent", brand.accentColor);
  document.documentElement.style.setProperty("--brand-bg", brand.backgroundColor);

  elements.brandLogo.src = brand.logoUrl;
  elements.brandLogo.alt = `${brand.name} logo`;
  elements.campaignTitle.textContent = `${brand.name}: gira, suma puntos y desbloquea premios`;
}

function renderBrandEditorDefaults() {
  elements.brandNameInput.value = DEMO_CONFIG.brand.name;
  elements.brandLogoInput.value = DEMO_CONFIG.brand.logoUrl;
  elements.brandColorInput.value = DEMO_CONFIG.brand.primaryColor;
}

function renderTeams() {
  elements.teamSelector.innerHTML = "";

  DEMO_CONFIG.teams.forEach((team) => {
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

  document.querySelectorAll(".team-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar ruleta";

  emitEvent("team_selected", {
    team_selected: team.id,
    team_label: team.label,
    segment: `fan_${team.id}`,
    next_action: "show_spin_wheel"
  });
}

function createWheel() {
  const container = document.querySelector(".wheel-container");

  const props = {
    items: DEMO_CONFIG.wheelItems.map((item) => ({
      label: item.label
    })),
    itemBackgroundColors: [
      DEMO_CONFIG.brand.primaryColor,
      DEMO_CONFIG.brand.secondaryColor,
      DEMO_CONFIG.brand.accentColor,
      "#ffffff"
    ],
    itemLabelColors: ["#ffffff", "#111111"],
    itemLabelFont: "Inter, Arial, sans-serif",
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
  return Math.floor(Math.random() * DEMO_CONFIG.wheelItems.length);
}

function handleWheelResult(rewardIndex) {
  const reward = DEMO_CONFIG.wheelItems[rewardIndex];

  state.isSpinning = false;
  state.lastReward = reward;
  state.scoreTotal += reward.points;

  const segment = calculateSegment(reward);

  elements.resultCard.classList.remove("hidden");
  elements.resultTitle.textContent = `Ganaste ${reward.label}`;
  elements.resultDescription.textContent =
    `Ahora tienes ${state.scoreTotal} puntos. Segmento generado: ${segment}.`;

  elements.spinBtn.disabled = false;
  elements.spinBtn.textContent = "Girar otra vez";

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

function emitEvent(eventType, payload = {}) {
  const event = {
    event_id: crypto.randomUUID(),
    event_type: eventType,
    channel: "whatsapp",
    wa_id: state.waId,
    campaign_id: state.campaignId,
    source: DEMO_CONFIG.campaign.source,
    brand_name: DEMO_CONFIG.brand.name,
    microsite_url: window.location.href,
    timestamp: new Date().toISOString(),
    payload
  };

  state.lastEvent = event;
  elements.eventPreview.textContent = JSON.stringify(event, null, 2);

  console.log("WORLD_CUP_DEMO_EVENT", event);

  if (DEMO_CONFIG.eventEndpoint.enabled && DEMO_CONFIG.eventEndpoint.url) {
    sendEventToEndpoint(event);
  }

  return event;
}

async function sendEventToEndpoint(event) {
  try {
    await fetch(DEMO_CONFIG.eventEndpoint.url, {
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
  const message = encodeURIComponent(
    `${DEMO_CONFIG.whatsapp.returnMessage}. Mi segmento es: ${state.lastEvent?.payload?.segment || "demo_segment"}`
  );

  const url = `https://wa.me/${DEMO_CONFIG.whatsapp.returnPhone}?text=${message}`;

  emitEvent("return_to_whatsapp_clicked", {
    score_total: state.scoreTotal,
    team_selected: state.selectedTeam,
    last_reward: state.lastReward?.label || null,
    next_action: "continue_conversation_in_whatsapp"
  });

  window.open(url, "_blank");
}

function bindEvents() {
  elements.spinBtn.addEventListener("click", spinWheelControlled);

  elements.applyBrandBtn.addEventListener("click", () => {
    const updatedBrand = {
      ...DEMO_CONFIG.brand,
      name: elements.brandNameInput.value || DEMO_CONFIG.brand.name,
      logoUrl: elements.brandLogoInput.value || DEMO_CONFIG.brand.logoUrl,
      primaryColor: elements.brandColorInput.value || DEMO_CONFIG.brand.primaryColor
    };

    DEMO_CONFIG.brand = updatedBrand;
    applyBrand(updatedBrand);

    emitEvent("brand_updated", {
      brand_name: updatedBrand.name,
      logo_url: updatedBrand.logoUrl,
      primary_color: updatedBrand.primaryColor
    });
  });

  elements.returnWhatsappBtn.addEventListener("click", returnToWhatsApp);
}

init();
