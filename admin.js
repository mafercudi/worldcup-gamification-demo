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

  endpointEnabled: document.getElementById("endpoint-enabled"),
  endpointUrl: document.getElementById("endpoint-url"),

  saveConfigBtn: document.getElementById("save-config-btn"),
  openGameBtn: document.getElementById("open-game-btn"),
  generatedUrl: document.getElementById("generated-url")
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function initAdmin() {
  const config = loadSavedConfig();

  hydrateForm(config);
  updatePreview(config);
  updateGeneratedUrl(config);

  fields.saveConfigBtn.addEventListener("click", saveConfig);
  fields.openGameBtn.addEventListener("click", openGame);

  [
    fields.brandName,
    fields.brandLogo,
    fields.brandPrimary,
    fields.brandSecondary,
    fields.brandAccent,
    fields.brandBg,
    fields.campaignId,
    fields.campaignName,
    fields.campaignSource,
    fields.endpointEnabled,
    fields.endpointUrl
  ].forEach((field) => {
    field.addEventListener("input", handleLiveUpdate);
    field.addEventListener("change", handleLiveUpdate);
  });
}

function handleLiveUpdate() {
  const liveConfig = getConfigFromForm();
  updatePreview(liveConfig);
  updateGeneratedUrl(liveConfig);
}

function loadSavedConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return clone(DEMO_CONFIG);

  try {
    return mergeConfig(clone(DEMO_CONFIG), JSON.parse(saved));
  } catch (error) {
    console.error("Invalid saved config", error);
    return clone(DEMO_CONFIG);
  }
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

function hydrateForm(config) {
  fields.brandName.value = config.brand.name;
  fields.brandLogo.value = config.brand.logoUrl;
  fields.brandPrimary.value = config.brand.primaryColor;
  fields.brandSecondary.value = config.brand.secondaryColor;
  fields.brandAccent.value = config.brand.accentColor;
  fields.brandBg.value = config.brand.backgroundColor;

  fields.campaignId.value = config.campaign.campaignId;
  fields.campaignName.value = config.campaign.campaignName;
  fields.campaignSource.value = config.campaign.source;

  fields.endpointEnabled.checked = config.eventEndpoint.enabled;
  fields.endpointUrl.value = config.eventEndpoint.url;
}

function getConfigFromForm() {
  return {
    ...clone(DEMO_CONFIG),

    brand: {
      name: fields.brandName.value.trim() || DEMO_CONFIG.brand.name,
      logoUrl: fields.brandLogo.value.trim() || DEMO_CONFIG.brand.logoUrl,
      primaryColor: fields.brandPrimary.value || DEMO_CONFIG.brand.primaryColor,
      secondaryColor: fields.brandSecondary.value || DEMO_CONFIG.brand.secondaryColor,
      accentColor: fields.brandAccent.value || DEMO_CONFIG.brand.accentColor,
      backgroundColor: fields.brandBg.value || DEMO_CONFIG.brand.backgroundColor
    },

    campaign: {
      ...DEMO_CONFIG.campaign,
      campaignId: fields.campaignId.value.trim() || DEMO_CONFIG.campaign.campaignId,
      campaignName: fields.campaignName.value.trim() || DEMO_CONFIG.campaign.campaignName,
      source: fields.campaignSource.value.trim() || DEMO_CONFIG.campaign.source
    },

    teams: clone(DEMO_CONFIG.teams),
    wheelItems: clone(DEMO_CONFIG.wheelItems),

    eventEndpoint: {
      enabled: fields.endpointEnabled.checked,
      url: fields.endpointUrl.value.trim()
    }
  };
}

function updatePreview(config) {
  fields.logoPreview.src = config.brand.logoUrl;
  fields.logoPreview.alt = `${config.brand.name} logo`;

  document.documentElement.style.setProperty("--brand-primary", config.brand.primaryColor);
  document.documentElement.style.setProperty("--brand-secondary", config.brand.secondaryColor);
  document.documentElement.style.setProperty("--brand-accent", config.brand.accentColor);
  document.documentElement.style.setProperty("--brand-bg", config.brand.backgroundColor);
}

function saveConfig() {
  const config = getConfigFromForm();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  updateGeneratedUrl(config);

  alert("Configuración guardada.");
}

function encodeConfig(config) {
  const json = JSON.stringify(config);
  return btoa(unescape(encodeURIComponent(json)));
}

function getGameBaseUrl() {
  const currentUrl = new URL(window.location.href);
  const path = currentUrl.pathname.replace("admin.html", "index.html");
  return `${currentUrl.origin}${path}`;
}

function updateGeneratedUrl(config) {
  const encoded = encodeConfig(config);
  const baseUrl = getGameBaseUrl();

  const demoUrl =
    `${baseUrl}?config=${encoded}` +
    `&user_ref=525512345678` +
    `&team=mexico` +
    `&campaign_id=${encodeURIComponent(config.campaign.campaignId)}`;

  fields.generatedUrl.textContent = demoUrl;
}

function openGame() {
  const config = getConfigFromForm();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

  const encoded = encodeConfig(config);
  const baseUrl = getGameBaseUrl();

  const demoUrl =
    `${baseUrl}?config=${encoded}` +
    `&user_ref=525512345678` +
    `&team=mexico` +
    `&campaign_id=${encodeURIComponent(config.campaign.campaignId)}`;

  window.open(demoUrl, "_blank");
}

initAdmin();
