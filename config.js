
const DEMO_CONFIG = {
  brand: {
    name: "Marca Demo",
    logoUrl: "https://dummyimage.com/160x60/ffffff/111111.png&text=LOGO",
    primaryColor: "#0F7A3A",
    secondaryColor: "#C8A24A",
    accentColor: "#E63946",
    backgroundColor: "#071013"
  },

  campaign: {
    campaignId: "worldcup_2026_demo",
    campaignName: "Mundial Fan Challenge",
    source: "whatsapp",
    defaultCountry: "Mexico"
  },

  whatsapp: {
    returnPhone: "525500000000",
    returnMessage: "Quiero continuar con mi experiencia mundialista"
  },

  teams: [
    {
      id: "mexico",
      label: "México",
      flag: "🇲🇽"
    },
    {
      id: "brasil",
      label: "Brasil",
      flag: "🇧🇷"
    },
    {
      id: "argentina",
      label: "Argentina",
      flag: "🇦🇷"
    },
    {
      id: "espana",
      label: "España",
      flag: "🇪🇸"
    }
  ],

  wheelItems: [
    {
      label: "50 pts",
      points: 50,
      rewardType: "points"
    },
    {
      label: "100 pts",
      points: 100,
      rewardType: "points"
    },
    {
      label: "200 pts",
      points: 200,
      rewardType: "points"
    },
    {
      label: "Póster",
      points: 150,
      rewardType: "poster_unlock"
    },
    {
      label: "Cupón",
      points: 100,
      rewardType: "coupon"
    },
    {
      label: "Doble chance",
      points: 75,
      rewardType: "double_chance"
    }
  ],

  eventEndpoint: {
    enabled: false,
    url: ""
  }
};
