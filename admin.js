const STORAGE_KEY = "worldcup_demo_config";

const fields = {
  logoPreview: document.getElementById("admin-logo-preview"),
  brandName: document.getElementById("brand-name"),
  brandLogo: document.getElementById("brand-logo"),
  brandPrimary: document.getElementById("brand-primary"),
  brandSecondary: document.getElementById("brand-secondary"),
  brandAccent: document.getElementById("brand-accent"),
  brandBg: document.getElementById("brand-bg"),
  campaignId: document.getElementById("campaign-id"),
  campaignName: document.getElementById("campaign-name"),
  campaignSource: document.getElementById("campaign-source"),
  returnPhone: document.getElementById("return-phone"),
  returnMessage: document.getElementById("return-message"),
  endpointEnabled: document.getElementById("endpoint-enabled"),
  endpointUrl: document.getElementById("endpoint-url"),
  payloadEditor: document.getElementById("payload-editor"),
  saveConfigBtn: document.getElementById("save-config-btn"),
  openGameBtn: document.getElementById("open-game-btn"),
  resetConfigBtn: document.getElementById("reset-config-btn"),
  generatedUrl: document.getElementById("generated-url")
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return clone(DEMO_CONFIG);

  try {
    const parsed = JSON.parse(saved);

    return {
      ...clone(DEMO_CONFIG),
      ...parsed,
      brand: { ...DEMO_CONFIG.brand, ...(parsed.brand || {}) },
      campaign: { ...DEMO_CONFIG.campaign, ...(parsed.campaign || {}) },
      whatsapp: { ...DEMO_CONFIG.whatsapp, ...(parsed.whatsapp || {}) },
      eventEndpoint: { ...DEMO_CONFIG.eventEndpoint, ...(parsed.eventEndpoint || {}) },
      payloadTemplate: { ...DEMO_CONFIG.payloadTemplate, ...(parsed.payloadTemplate || {}) }
    };
  } catch {
    return clone(DEMO_CONFIG);
  }
}

function init() {
  const config = loadConfig();

  fillForm(config);
  updatePreview(config);
  updateUrl(config);

  fields.saveConfigBtn.addEventListener("click", saveConfig);
  fields.openGameBtn.addEventListener("click", openGame);
  fields.resetConfigBtn.addEventListener("click", resetConfig);

  Object.values(fields).forEach((field) => {
    if (!field || field.tagName === "PRE" || field.tagName === "IMG") return;
    field.addEventListener("input", liveUpdate);
    field.addEventListener("change", liveUpdate);
  });
}

function fillForm(config) {
  fields.brandName.value = config.brand.name;
  fields.brandLogo.value = config.brand.logoUrl;
  fields.brandPrimary.value = config.brand.primaryColor;
  fields.brandSecondary.value = config.brand.secondaryColor;
  fields.brandAccent.value = config.brand.accentColor;
  fields.brandBg.value = config.brand.backgroundColor;

  fields.campaignId.value = config.campaign.campaignId;
  fields.campaignName.value = config.campaign.campaignName;
  fields.campaignSource.value = config.campaign.source;

  fields.returnPhone.value = config.whatsapp.returnPhone;
  fields.returnMessage.value = config.whatsapp.returnMessage;

  fields.endpointEnabled.checked = config.eventEndpoint.enabled;
  fields.endpointUrl.value = config.eventEndpoint.url;

  fields.payloadEditor.value = JSON.stringify(config.payloadTemplate, null, 2);
}

function getConfigFromForm(silent = false) {
  let payload;

  try {
    payload = JSON.parse(fields.payloadEditor.value || "{}");
  } catch {
    if (!silent) alert("Payload no es JSON válido.");
    return null;
  }

  return {
    ...clone(DEMO_CONFIG),
    brand: {
      name: fields.brandName.value.trim() || "Marca Demo",
      logoUrl: fields.brandLogo.value.trim() || DEMO_CONFIG.brand.logoUrl,
      primaryColor: fields.brandPrimary.value,
      secondaryColor: fields.brandSecondary.value,
      accentColor: fields.brandAccent.value,
      backgroundColor: fields.brandBg.value
    },
    campaign: {
      campaignId: fields.campaignId.value.trim() || "worldcup_2026_demo",
      campaignName: fields.campaignName.value.trim() || "Mundial Fan Challenge",
      source: fields.campaignSource.value.trim() || "whatsapp"
    },
    whatsapp: {
      returnPhone: fields.returnPhone.value.trim() || "525500000000",
      returnMessage: fields.returnMessage.value.trim() || "Quiero continuar con mi experiencia mundialista"
    },
    teams: clone(DEMO_CONFIG.teams),
    wheelItems: clone(DEMO_CONFIG.wheelItems),
    eventEndpoint: {
      enabled: fields.endpointEnabled.checked,
      url: fields.endpointUrl.value.trim()
    },
    payloadTemplate: payload
  };
}

function updatePreview(config) {
  fields.logoPreview.src = config.brand.logoUrl;

  document.documentElement.style.setProperty("--brand-bg", config.brand.backgroundColor);
  document.documentElement.style.setProperty("--brand-primary", config.brand.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", config.brand.secondaryColor);
  document.documentElement.style.setProperty("--brand-accent", config.brand.accentColor);
}

function liveUpdate() {
  const config = getConfigFromForm(true);
  if (!config) return;

  updatePreview(config);
  updateUrl(config);
}

function saveConfig() {
  const config = getConfigFromForm();
  if (!config) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  updateUrl(config);
  alert("Guardado.");
}

function resetConfig() {
  localStorage.removeItem(STORAGE_KEY);
  fillForm(clone(DEMO_CONFIG));
  updatePreview(clone(DEMO_CONFIG));
  updateUrl(clone(DEMO_CONFIG));
  alert("Reseteado.");
}

function encodeConfig(config) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(config))));
}

function getGameUrl() {
  const url = new URL(window.location.href);
  return `${url.origin}${url.pathname.replace("admin.html", "index.html")}`;
}

function updateUrl(config) {
  const encoded = encodeConfig(config);

  fields.generatedUrl.textContent =
    `${getGameUrl()}?config=${encoded}&wa_id=525512345678&campaign_id=${encodeURIComponent(config.campaign.campaignId)}`;
}

function openGame() {
  const config = getConfigFromForm();
  if (!config) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

  const encoded = encodeConfig(config);

  window.open(
    `${getGameUrl()}?config=${encoded}&wa_id=525512345678&campaign_id=${encodeURIComponent(config.campaign.campaignId)}`,
    "_blank"
  );
}

init();
