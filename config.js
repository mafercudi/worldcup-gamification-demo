const DEMO_CONFIG = {
  brand: {
    name: "Marca Demo",
    logoUrl: "https://dummyimage.com/180x72/ffffff/111111.png&text=LOGO",
    primaryColor: "#0B5C3B",
    secondaryColor: "#D6B15D",
    accentColor: "#E63946",
    backgroundColor: "#06140F"
  },

  campaign: {
    campaignId: "worldcup_2026_demo",
    campaignName: "Mundial Fan Challenge",
    source: "whatsapp"
  },

  teams: [
    { id: "mexico", label: "México", flag: "🇲🇽" },
    { id: "brasil", label: "Brasil", flag: "🇧🇷" },
    { id: "argentina", label: "Argentina", flag: "🇦🇷" },
    { id: "espana", label: "España", flag: "🇪🇸" },
    { id: "francia", label: "Francia", flag: "🇫🇷" },
    { id: "usa", label: "USA", flag: "🇺🇸" }
  ],

  wheelItems: [
    { label: "50 pts", points: 50 },
    { label: "100 pts", points: 100 },
    { label: "150 pts", points: 150 },
    { label: "200 pts", points: 200 },
    { label: "250 pts", points: 250 },
    { label: "300 pts", points: 300 }
  ],

  eventEndpoint: {
    enabled: false,
    url: ""
  }
};
