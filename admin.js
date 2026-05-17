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
  generatedUrl: document.getElementById("generated-url")
};

function initAdmin() {
  const config = loadSavedConfig();

  hydrateForm(config);
  updatePreview(config);
  updateGeneratedUrl(config);

  fields.saveConfigBtn.addEventListener("click", saveConfig);
  fields.openGameBtn.addEventListener("click", openGame);

  Object.values(fields).forEach((field) => {
    if (field && (field.tagName === "INPUT" || field.tagName === "TEXTAREA")) {
      field.addEventListener("input", () => {
        const liveConfig = getConfigFromForm({ silent: true });
        if (liveConfig) {
          updatePreview(liveConfig);
          updateGeneratedUrl(liveConfig);
        }
      });
    }
  });
}

function loadSavedConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return structuredClone(DEMO_CONFIG);

  try {
    return {
      ...structuredClone(DEMO_CONFIG),
      ...JSON.parse(saved)
    };
  } catch {
    return structuredClone(DEMO_CONFIG);
  }
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

  fields.returnPhone.value = config.whatsapp.returnPhone;
  fields.returnMessage.value = config.whatsapp.returnMessage;

  fields.endpointEnabled.checked = config.eventEndpoint.enabled;
  fields.endpointUrl.value = config.eventEndpoint.url;

  fields.payloadEditor.value = JSON.stringify(config.payloadTemplate, null, 2);
}

function getConfigFromForm(options = {}) {
  let payloadTemplate;

  try {
    payloadTemplate = JSON.parse(fields.payloadEditor.value || "{}");
  } catch {
    if (!options.silent) {
      alert("El payload no es un JSON válido. Revísalo antes de guardar.");
    }
    return null;
  }

  return {
    ...structuredClone(DEMO_CONFIG),

    brand: {
      name: fields.brandName.value,
      logoUrl: fields.brandLogo.value,
      primaryColor: fields.brandPrimary.value,
      secondaryColor: fields.brandSecondary.value,
      accentColor: fields.brandAccent.value,
      backgroundColor: fields.brandBg.value
    },

    campaign: {
      ...DEMO_CONFIG.campaign,
      campaignId: fields.campaignId.value,
      campaignName: fields.campaignName.value,
      source: fields.campaignSource.value
    },

    whatsapp: {
      returnPhone: fields.returnPhone.value,
      returnMessage: fields.returnMessage.value
    },

    eventEndpoint: {
      enabled: fields.endpointEnabled.checked,
      url: fields.endpointUrl.value
    },

    payloadTemplate
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

  if (!config) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  updateGeneratedUrl(config);

  alert("Configuración guardada.");
}

function encodeConfig(config) {
  const json = JSON.stringify(config);
  return btoa(unescape(encodeURIComponent(json)));
}

function updateGeneratedUrl(config) {
  const encoded = encodeConfig(config);
  const baseUrl = window.location.href.replace("admin.html", "index.html").split("?")[0];

  const demoUrl = `${baseUrl}?config=${encoded}&wa_id=525512345678&campaign_id=${encodeURIComponent(config.campaign.campaignId)}`;

  fields.generatedUrl.textContent = demoUrl;
}

function openGame() {
  const config = getConfigFromForm();

  if (!config) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

  const encoded = encodeConfig(config);
  const baseUrl = window.location.href.replace("admin.html", "index.html").split("?")[0];

  const demoUrl = `${baseUrl}?config=${encoded}&wa_id=525512345678&campaign_id=${encodeURIComponent(config.campaign.campaignId)}`;

  window.open(demoUrl, "_blank");
}

initAdmin();
