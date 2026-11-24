// vehicle-comparison.js — GTA 6 Vehicle Comparison page logic.
// The browse-all table, best strip and default comparison are static HTML
// (SEO/GEO content). This module owns the interactive bits: the A/B picker,
// class filter, table search, share URLs, and the "Last checked" stamps
// (single source of truth = data/vehicles.json, embedded below as DATA).
// It never invents a stat, price or date: every row comes from DATA.

var DATA = {
  "coverage": {
    "note": "Phase 1: 115 vehicles with published in-game ratings; Standout variants excluded. Watercraft and Aircraft have no published stats in any source checked, so no rows ship for those classes yet. Roster base 277 per IGN (updated 21 Nov 2026).",
    "rosterBase": 277,
    "vehicles": 115
  },
  "lastChecked": "2026-11-24",
  "vehicles": [
    {
      "aliases": [],
      "class": "Coupes",
      "era": "2000s",
      "id": "ubermacht-apoc",
      "location": null,
      "maker": "Ubermacht",
      "name": "Ubermacht Apoc",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 5.4,
        "asphaltHandling": 4.3,
        "offRoadHandling": 4.1,
        "speed": 4.8,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [
        "Blista Compact"
      ],
      "class": "Coupes",
      "era": "1980s",
      "id": "dinka-blista-85",
      "location": null,
      "maker": "Dinka",
      "name": "'85 Dinka Blista",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 4.7,
        "asphaltHandling": 3.8,
        "offRoadHandling": 4.2,
        "speed": 4.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Coupes",
      "era": "2020s",
      "id": "ubermacht-cypher",
      "location": null,
      "maker": "Ubermacht",
      "name": "Ubermacht Cypher",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 7.2,
        "asphaltHandling": 4.9,
        "offRoadHandling": 4.5,
        "speed": 6.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Coupes",
      "era": "1990s",
      "id": "annis-elegy-90",
      "location": null,
      "maker": "Annis",
      "name": "'90 Annis Elegy",
      "notes": [
        "Asphalt handling disputed: tracker.gg lists 4.8; PlayDay.One lists 4.9 — shipped as 4.9."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 6.4,
        "asphaltHandling": 4.9,
        "offRoadHandling": 3.9,
        "speed": 5.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Coupes",
      "era": "1980s",
      "id": "karin-futo-85",
      "location": null,
      "maker": "Karin",
      "name": "'85 Karin Futo",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 4.5,
        "asphaltHandling": 3.5,
        "offRoadHandling": 4.2,
        "speed": 4.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Coupes",
      "era": "1930s",
      "id": "vapid-hustler-32",
      "location": null,
      "maker": "Vapid",
      "name": "'32 Vapid Hustler",
      "notes": [],
      "registerCost": 21900,
      "sellValue": 6545,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        }
      ],
      "specialist": "Hot Rods",
      "stats": {
        "acceleration": 2.7,
        "asphaltHandling": 3.3,
        "offRoadHandling": 3.0,
        "speed": 3.2,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Coupes",
      "era": "2010s",
      "id": "ascot-paragon",
      "location": null,
      "maker": "Ascot",
      "name": "Ascot Paragon",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.2,
        "asphaltHandling": 5.8,
        "offRoadHandling": 3.9,
        "speed": 6.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Coupes",
      "era": "2000s",
      "id": "maibatsu-penumbra",
      "location": null,
      "maker": "Maibatsu",
      "name": "Maibatsu Penumbra",
      "notes": [
        "Speed disputed: tracker.gg lists 5.3; PlayDay.One lists 5.2 — shipped as 5.2."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 5.7,
        "asphaltHandling": 4.2,
        "offRoadHandling": 4.3,
        "speed": 5.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [
        "82 Imponte Runner"
      ],
      "class": "Coupes",
      "era": "1980s",
      "id": "imponte-ruiner-82",
      "location": null,
      "maker": "Imponte",
      "name": "'82 Imponte Ruiner",
      "notes": [
        "Name disputed: PlayDay.One prints '82 Imponte Runner'; tracker.gg prints '82 Ruiner' — shipped as Ruiner with the alternate in aliases."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 4.6,
        "asphaltHandling": 3.7,
        "offRoadHandling": 4.1,
        "speed": 4.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1970s",
      "id": "declasse-tulip-72",
      "location": null,
      "maker": "Declasse",
      "name": "'72 Declasse Tulip",
      "notes": [
        "Speed and asphalt handling disputed: tracker.gg lists 5.0 / 3.3; PlayDay.One lists 5.1 / 3.4 — shipped as PlayDay.One's figures."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 4.8,
        "asphaltHandling": 3.4,
        "offRoadHandling": 3.9,
        "speed": 5.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1960s",
      "id": "dundreary-chino-65",
      "location": null,
      "maker": "Dundreary",
      "name": "'65 Dundreary Chino",
      "notes": [
        "Sell value $5,335 from OP.GG only (single source, flagged). No register cost published."
      ],
      "registerCost": null,
      "sellValue": 5335,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "OP.GG — GTA 6 Cars & Vehicles List",
          "url": "https://op.gg/gta6/vehicles"
        }
      ],
      "specialist": "Lowrider",
      "stats": {
        "acceleration": 4.2,
        "asphaltHandling": 3.3,
        "offRoadHandling": 4.0,
        "speed": 3.9,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "2020s",
      "id": "vapid-dominator-gt",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Dominator GT",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 6.8,
        "asphaltHandling": 5.7,
        "offRoadHandling": 3.9,
        "speed": 6.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [
        "Vapid '70 Ganado"
      ],
      "class": "Muscle Cars",
      "era": "1970s",
      "id": "vapid-ganado-70",
      "location": null,
      "maker": "Vapid",
      "name": "'70 Vapid Ganado",
      "notes": [
        "Also published as 'Vapid Ganado' and 'Vapid '70 Ganado'; early promo name 'Creado' is not used."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 5.3,
        "asphaltHandling": 3.6,
        "offRoadHandling": 4.5,
        "speed": 4.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "2010s",
      "id": "bravado-gauntlet-hellfire",
      "location": null,
      "maker": "Bravado",
      "name": "Bravado Gauntlet Hellfire",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        },
        {
          "date": "2026-11-23",
          "field": "tracker",
          "name": "Game8 — All Randy's Wishlist Vehicle Locations",
          "url": "https://cloudfront-test.game8.co/games/GTA-6/archives/639137"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 7.8,
        "asphaltHandling": 5.7,
        "offRoadHandling": 3.6,
        "speed": 7.8,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1970s",
      "id": "imponte-phoenix-77",
      "location": null,
      "maker": "Imponte",
      "name": "'77 Imponte Phoenix",
      "notes": [
        "Asphalt handling disputed: tracker.gg lists 3.3; PlayDay.One lists 3.4 — shipped as 3.4."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 4.7,
        "asphaltHandling": 3.4,
        "offRoadHandling": 4.3,
        "speed": 4.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1960s",
      "id": "classique-stallion-68",
      "location": null,
      "maker": "Classique",
      "name": "'68 Classique Stallion",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 5.7,
        "asphaltHandling": 3.7,
        "offRoadHandling": 4.5,
        "speed": 5.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1970s",
      "id": "declasse-tulip-m100-78",
      "location": null,
      "maker": "Declasse",
      "name": "'78 Declasse Tulip M-100",
      "notes": [
        "Sell value $2,420 from OP.GG only (single source, flagged). No register cost published.",
        "PlayDay.One prints the name as 'Tuliop M-100' (typo); shipped as Tulip M-100."
      ],
      "registerCost": null,
      "sellValue": 2420,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "OP.GG — GTA 6 Cars & Vehicles List",
          "url": "https://op.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 3.7,
        "asphaltHandling": 3.2,
        "offRoadHandling": 3.8,
        "speed": 3.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1960s",
      "id": "invetero-coquette-64",
      "location": null,
      "maker": "Invetero",
      "name": "Invetero Coquette '64",
      "notes": [
        "Stats from tracker.gg only; prices agree across Sportskeeda, Gurugamer and Overgear."
      ],
      "registerCost": 29150,
      "sellValue": 12320,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 5.7,
        "asphaltHandling": 3.3,
        "offRoadHandling": 4.4,
        "speed": 5.9,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1960s",
      "id": "bravado-gauntlet-custom-69",
      "location": null,
      "maker": "Bravado",
      "name": "Bravado Gauntlet Custom '69",
      "notes": [
        "No published stats found in the sources checked; prices agree across Sportskeeda, Gurugamer and Overgear."
      ],
      "registerCost": 23750,
      "sellValue": 7095,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": null,
        "asphaltHandling": null,
        "offRoadHandling": null,
        "speed": null,
        "strength": null
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1950s",
      "id": "albany-devanity-59",
      "location": null,
      "maker": "Albany",
      "name": "Albany DeVanity '59",
      "notes": [
        "tracker.gg lists this car under Sedans; IGN lists it as Muscle — shipped as Muscle Cars per IGN."
      ],
      "registerCost": 21750,
      "sellValue": 6490,
      "sources": [
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        }
      ],
      "specialist": "Lowriders",
      "stats": {
        "acceleration": 4.5,
        "asphaltHandling": 3.2,
        "offRoadHandling": 4.2,
        "speed": 4.4,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1950s",
      "id": "albany-hermes-50",
      "location": null,
      "maker": "Albany",
      "name": "Albany Hermes '50",
      "notes": [],
      "registerCost": 21650,
      "sellValue": 6435,
      "sources": [
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        }
      ],
      "specialist": "Hot Rods",
      "stats": {
        "acceleration": 6.1,
        "asphaltHandling": 3.8,
        "offRoadHandling": 4.5,
        "speed": 5.5,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Muscle Cars",
      "era": "1960s",
      "id": "sirius-transgressor-67",
      "location": null,
      "maker": "Sirius",
      "name": "Sirius Transgressor '67",
      "notes": [
        "No published stats found in the sources checked; prices agree across Sportskeeda, Gurugamer and Overgear."
      ],
      "registerCost": 21500,
      "sellValue": 6060,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": null,
        "asphaltHandling": null,
        "offRoadHandling": null,
        "speed": null,
        "strength": null
      },
      "tracker": "None",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Off-Road Vehicles",
      "era": "1970s",
      "id": "bf-bandito-77",
      "location": null,
      "maker": "BF",
      "name": "'77 BF Bandito",
      "notes": [
        "Plan-table correction: the plan left acceleration blank; PlayDay.One and tracker.gg agree on 6.0, asphalt 3.5, strength 3.5."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 6.0,
        "asphaltHandling": 3.5,
        "offRoadHandling": 7.6,
        "speed": 3.6,
        "strength": 3.5
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Off-Road Vehicles",
      "era": "1960s",
      "id": "vapid-dominator-buggy-67",
      "location": null,
      "maker": "Vapid",
      "name": "'67 Vapid Dominator Buggy",
      "notes": [
        "A published location exists (Paradise Garage, Ch. 2) but was not re-verified on the build date; location left null."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 6.1,
        "asphaltHandling": 3.5,
        "offRoadHandling": 6.7,
        "speed": 5.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Off-Road Vehicles",
      "era": "2020s",
      "id": "mer-can-blast",
      "location": null,
      "maker": "Mer-Can",
      "name": "Mer-Can Blast",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 3.4,
        "asphaltHandling": 2.5,
        "offRoadHandling": 6.5,
        "speed": 2.0,
        "strength": 3.5
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Off-Road Vehicles",
      "era": "1970s",
      "id": "bf-injection-73",
      "location": null,
      "maker": "BF",
      "name": "'73 BF Injection",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 6.0,
        "asphaltHandling": 3.9,
        "offRoadHandling": 7.3,
        "speed": 5.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Off-Road Vehicles",
      "era": "2010s",
      "id": "mer-can-outlaw",
      "location": null,
      "maker": "Mer-Can",
      "name": "Mer-Can Outlaw",
      "notes": [
        "Highest off-road handling rating in this dataset (8.4)."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 5.8,
        "asphaltHandling": 3.2,
        "offRoadHandling": 8.4,
        "speed": 3.3,
        "strength": 3.5
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Off-Road Vehicles",
      "era": "2010s",
      "id": "hvy-wastelander",
      "location": null,
      "maker": "HVY",
      "name": "HVY Wastelander",
      "notes": [
        "GTA 5 top-speed figures sometimes attached to this vehicle are not GTA 6 data and are not shipped."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 3.8,
        "asphaltHandling": 2.6,
        "offRoadHandling": 7.0,
        "speed": 3.1,
        "strength": 3.5
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "2010s",
      "id": "bravado-bison",
      "location": null,
      "maker": "Bravado",
      "name": "Bravado Bison",
      "notes": [
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 9000,
      "sellValue": 1450,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 4.6,
        "asphaltHandling": 3.8,
        "offRoadHandling": 5.0,
        "speed": 4.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "1990s",
      "id": "bravado-bison-900-95",
      "location": null,
      "maker": "Bravado",
      "name": "'95 Bravado Bison 900",
      "notes": [
        "tracker.gg lists this model as 'Bison 9000'. OP.GG lists a speed of 4.3 for 'Bison 900' (single source, not shipped)."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 4.6,
        "asphaltHandling": 2.8,
        "offRoadHandling": 6.7,
        "speed": 4.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "2010s",
      "id": "vapid-caracara-4x4",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Caracara 4x4",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 5.1,
        "asphaltHandling": 3.3,
        "offRoadHandling": 6.7,
        "speed": 4.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "2010s",
      "id": "karin-contender",
      "location": null,
      "maker": "Karin",
      "name": "Karin Contender",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 5.5,
        "asphaltHandling": 3.4,
        "offRoadHandling": 6.7,
        "speed": 4.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "1980s",
      "id": "declasse-rancher-86",
      "location": null,
      "maker": "Declasse",
      "name": "'86 Declasse Rancher",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 3.1,
        "asphaltHandling": 3.1,
        "offRoadHandling": 6.6,
        "speed": 3.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "2010s",
      "id": "vapid-reclaimer",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Reclaimer",
      "notes": [
        "Stats disputed on all four figures: tracker.gg lists 4.3 / 5.5 / 3.5 / 5.0; PlayDay.One lists 4.0 / 5.3 / 3.2 / 6.7 — no agreement, shipped as PlayDay.One's figures, flagged."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 5.3,
        "asphaltHandling": 3.2,
        "offRoadHandling": 6.7,
        "speed": 4.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "2010s",
      "id": "vapid-riata",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Riata",
      "notes": [
        "Stats from PlayDay.One only; tracker.gg lists a different model, the '70 Riata, not this one."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 5.7,
        "asphaltHandling": 3.8,
        "offRoadHandling": 6.6,
        "speed": 4.4,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "2010s",
      "id": "vapid-sandking-xl",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Sandking XL",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 4.3,
        "asphaltHandling": 3.4,
        "offRoadHandling": 4.6,
        "speed": 3.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Pickups",
      "era": "1980s",
      "id": "declasse-walton-81",
      "location": null,
      "maker": "Declasse",
      "name": "'81 Declasse Walton",
      "notes": [
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 3400,
      "sellValue": 550,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 3.8,
        "asphaltHandling": 3.6,
        "offRoadHandling": 4.2,
        "speed": 3.8,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2020s",
      "id": "obey-animus",
      "location": null,
      "maker": "Obey",
      "name": "Obey Animus",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 5.6,
        "asphaltHandling": 4.4,
        "offRoadHandling": 4.4,
        "speed": 4.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2000s",
      "id": "bravado-buffalo-07",
      "location": null,
      "maker": "Bravado",
      "name": "'07 Bravado Buffalo",
      "notes": [
        "IGN's table leaves the tracker blank for this row; tracker left null."
      ],
      "registerCost": 8000,
      "sellValue": 2365,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 5.4,
        "asphaltHandling": 4.3,
        "offRoadHandling": 4.5,
        "speed": 5.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2010s",
      "id": "bravado-buffalo-19",
      "location": null,
      "maker": "Bravado",
      "name": "'19 Bravado Buffalo",
      "notes": [
        "Stats and prices from IGN's table only."
      ],
      "registerCost": 11250,
      "sellValue": 3555,
      "sources": [
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 6.4,
        "asphaltHandling": 4.7,
        "offRoadHandling": 4.4,
        "speed": 5.5,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "1980s",
      "id": "albany-emperor-85",
      "location": null,
      "maker": "Albany",
      "name": "'85 Albany Emperor",
      "notes": [
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 5650,
      "sellValue": 450,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Lowrider",
      "stats": {
        "acceleration": 3.0,
        "asphaltHandling": 2.7,
        "offRoadHandling": 3.3,
        "speed": 3.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "1980s",
      "id": "karin-feroci-98",
      "location": null,
      "maker": "Karin",
      "name": "'98 Karin Feroci",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 5.4,
        "asphaltHandling": 4.0,
        "offRoadHandling": 4.5,
        "speed": 5.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2010s",
      "id": "bf-greta",
      "location": null,
      "maker": "BF",
      "name": "BF Greta",
      "notes": [
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 2900,
      "sellValue": 450,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 4.7,
        "asphaltHandling": 4.1,
        "offRoadHandling": 4.3,
        "speed": 4.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "1990s",
      "id": "declasse-impaler-sz-95",
      "location": null,
      "maker": "Declasse",
      "name": "'95 Declasse Impaler SZ",
      "notes": [
        "Speed disputed: tracker.gg lists 4.5; PlayDay.One lists 3.5 — shipped as 3.5."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Muscle",
      "stats": {
        "acceleration": 4.8,
        "asphaltHandling": 3.8,
        "offRoadHandling": 4.2,
        "speed": 3.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2010s",
      "id": "ocelot-jugular",
      "location": null,
      "maker": "Ocelot",
      "name": "Ocelot Jugular",
      "notes": [
        "Speed and off-road handling disputed: tracker.gg lists 6.6 / 3.9; PlayDay.One lists 6.5 / 4.5 — shipped as PlayDay.One's figures.",
        "tracker.gg classes this car as Sports; shipped as Sedans per PlayDay.One."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.3,
        "asphaltHandling": 5.8,
        "offRoadHandling": 4.5,
        "speed": 6.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2010s",
      "id": "schyster-pmp-700",
      "location": null,
      "maker": "Schyster",
      "name": "Schyster PMP 700",
      "notes": [
        "Sell value $3,200 from OP.GG only (single source, flagged). No register cost published."
      ],
      "registerCost": null,
      "sellValue": 3200,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "OP.GG — GTA 6 Cars & Vehicles List",
          "url": "https://op.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 6.4,
        "asphaltHandling": 4.3,
        "offRoadHandling": 4.5,
        "speed": 5.8,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2010s",
      "id": "coil-raiden",
      "location": null,
      "maker": "Coil",
      "name": "Coil Raiden",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 7.7,
        "asphaltHandling": 4.7,
        "offRoadHandling": 4.5,
        "speed": 6.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2010s",
      "id": "albany-v-str",
      "location": null,
      "maker": "Albany",
      "name": "Albany V-STR",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 7.2,
        "asphaltHandling": 4.5,
        "offRoadHandling": 4.5,
        "speed": 7.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sedans",
      "era": "2020s",
      "id": "declasse-impaler-20",
      "location": null,
      "maker": "Declasse",
      "name": "'20 Declasse Impaler",
      "notes": [],
      "registerCost": 5400,
      "sellValue": 1595,
      "sources": [
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "IGN — Vehicles guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Vehicles"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Donks",
      "stats": {
        "acceleration": 5.3,
        "asphaltHandling": 3.9,
        "offRoadHandling": 4.3,
        "speed": 4.6,
        "strength": 3.0
      },
      "tracker": "None",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2000s",
      "id": "bravado-banshee",
      "location": null,
      "maker": "Bravado",
      "name": "Bravado Banshee",
      "notes": [],
      "registerCost": 24500,
      "sellValue": 7315,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 6.3,
        "asphaltHandling": 5.8,
        "offRoadHandling": 3.8,
        "speed": 6.0,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2010s",
      "id": "grotti-carbonizzare",
      "location": null,
      "maker": "Grotti",
      "name": "Grotti Carbonizzare",
      "notes": [],
      "registerCost": 28300,
      "sellValue": 9845,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.1,
        "asphaltHandling": 6.0,
        "offRoadHandling": 3.6,
        "speed": 6.3,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2020s",
      "id": "pfister-comet-s2",
      "location": null,
      "maker": "Pfister",
      "name": "Pfister Comet S2",
      "notes": [],
      "registerCost": 31250,
      "sellValue": 16500,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 8.0,
        "asphaltHandling": 7.6,
        "offRoadHandling": 3.6,
        "speed": 7.7,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [
        "88 Comet",
        "Pfister Comet '88"
      ],
      "class": "Sports Cars",
      "era": "1980s",
      "id": "pfister-comet-88",
      "location": null,
      "maker": "Pfister",
      "name": "Pfister '88 Comet",
      "notes": [
        "Strength disputed: IGN lists 3.9; PlayDay.One and tracker.gg list 3.7 — shipped as 3.7."
      ],
      "registerCost": 34250,
      "sellValue": 17050,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 6.4,
        "asphaltHandling": 6.5,
        "offRoadHandling": 4.0,
        "speed": 6.1,
        "strength": 3.7
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2010s",
      "id": "invetero-coquette",
      "location": null,
      "maker": "Invetero",
      "name": "Invetero Coquette",
      "notes": [],
      "registerCost": 24000,
      "sellValue": 7205,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 6.8,
        "asphaltHandling": 5.5,
        "offRoadHandling": 3.9,
        "speed": 6.1,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2020s",
      "id": "invetero-coquette-d10",
      "location": null,
      "maker": "Invetero",
      "name": "Invetero Coquette D10",
      "notes": [],
      "registerCost": 28150,
      "sellValue": 9350,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.5,
        "asphaltHandling": 6.5,
        "offRoadHandling": 3.6,
        "speed": 7.0,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "1960s",
      "id": "declasse-mamba-gt-64",
      "location": null,
      "maker": "Declasse",
      "name": "'64 Declasse Mamba GT",
      "notes": [
        "tracker.gg lists this car under Sports Classics; shipped as Sports Cars per PlayDay.One."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.2,
        "asphaltHandling": 6.3,
        "offRoadHandling": 3.2,
        "speed": 6.9,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2020s",
      "id": "pfister-neon",
      "location": null,
      "maker": "Pfister",
      "name": "Pfister Neon",
      "notes": [
        "Acceleration disputed: tracker.gg lists 7.5; IGN and PlayDay.One list 7.4 — shipped as 7.4."
      ],
      "registerCost": 24250,
      "sellValue": 7260,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.4,
        "asphaltHandling": 5.9,
        "offRoadHandling": 3.9,
        "speed": 7.1,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2000s",
      "id": "benefactor-schafter-v12",
      "location": null,
      "maker": "Benefactor",
      "name": "Benefactor Schafter V12",
      "notes": [
        "Sell value disputed: IGN lists $3,190; HowToVideoGame's scan showed $1,700 — sell values vary with condition; shipped as IGN's figure."
      ],
      "registerCost": 10650,
      "sellValue": 3190,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 6.6,
        "asphaltHandling": 4.5,
        "offRoadHandling": 4.5,
        "speed": 6.0,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "1980s",
      "id": "ubermacht-sentinel-85",
      "location": null,
      "maker": "Ubermacht",
      "name": "'85 Ubermacht Sentinel",
      "notes": [
        "Strength disputed: PlayDay.One lists 3.7; IGN and tracker.gg list 3.0 — shipped as 3.0."
      ],
      "registerCost": 6000,
      "sellValue": 1760,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 4.9,
        "asphaltHandling": 4.2,
        "offRoadHandling": 3.7,
        "speed": 4.7,
        "strength": 3.0
      },
      "tracker": "None",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2000s",
      "id": "emperor-sultan",
      "location": null,
      "maker": "Emperor",
      "name": "Emperor Sultan",
      "notes": [
        "The $1,600 figure sometimes attached to this car is Moses's reward for delivery jobs, not a register price — it is not listed as one here."
      ],
      "registerCost": 5400,
      "sellValue": 1595,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 6.1,
        "asphaltHandling": 4.4,
        "offRoadHandling": 4.5,
        "speed": 4.9,
        "strength": 3.0
      },
      "tracker": "None",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Sports Cars",
      "era": "2020s",
      "id": "pfister-growler",
      "location": null,
      "maker": "Pfister",
      "name": "Pfister Growler",
      "notes": [],
      "registerCost": 29450,
      "sellValue": 13310,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 6.3,
        "asphaltHandling": 6.8,
        "offRoadHandling": 3.9,
        "speed": 5.5,
        "strength": 3.0
      },
      "tracker": "Standard",
      "verified": "two-source"
    },
    {
      "aliases": [
        "Cheetah '95"
      ],
      "class": "Supercars",
      "era": "1990s",
      "id": "grotti-cheetah-95",
      "location": null,
      "maker": "Grotti",
      "name": "Grotti '95 Cheetah",
      "notes": [
        "tracker.gg lists this car under Sports Classics; shipped as Supercars per the price tables.",
        "Some outlets misname this car with a '64 year; the agreeing tables list '95.",
        "A published location exists (Pegassi Residences underground garage after Ch. 5) but was not re-verified on the build date; location left null.",
        "Plan-table correction: the plan left acceleration blank; PlayDay.One and tracker.gg agree on 5.9, off-road 4.4."
      ],
      "registerCost": 32750,
      "sellValue": 16775,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 5.9,
        "asphaltHandling": 6.5,
        "offRoadHandling": 4.4,
        "speed": 6.6,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [
        "Cheerus"
      ],
      "class": "Supercars",
      "era": "2010s",
      "id": "progen-emerus",
      "location": null,
      "maker": "Progen",
      "name": "Progen Emerus",
      "notes": [
        "Listed as 'Cheerus' in-game per FPSGen; shipped as Emerus with the alternate in aliases.",
        "Post-story cheat car: complete all 10 Vehicle Challenges, then spawn it from the Cheats menu. An active cheat disables saving and achievements (GTA6Info). Not a street find — no spawn location listed."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        },
        {
          "date": "2026-11-23",
          "field": "notes",
          "name": "GTA6Info — vehicle speed ranking",
          "url": "https://gta6info.com/wiki/Fastest_Cars"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 8.3,
        "asphaltHandling": 8.4,
        "offRoadHandling": 3.4,
        "speed": 8.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [
        "Grotti Furia"
      ],
      "class": "Supercars",
      "era": "2020s",
      "id": "piccia-furia",
      "location": null,
      "maker": "Piccia",
      "name": "Piccia Furia",
      "notes": [
        "Also published as 'Grotti Furia'; shipped as Piccia Furia with the alternate in aliases."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 8.2,
        "asphaltHandling": 7.3,
        "offRoadHandling": 3.6,
        "speed": 7.8,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [
        "Infernus '96"
      ],
      "class": "Supercars",
      "era": "1990s",
      "id": "pegassi-infernus-96",
      "location": "7th floor, Crosstown Police Station car park",
      "maker": "Pegassi",
      "name": "Pegassi '96 Infernus",
      "notes": [
        "Asphalt and off-road handling disputed: tracker.gg lists 6.6 / 3.6; PlayDay.One and Leonipedia list 6.5 / 4.3 — shipped as PlayDay.One's figures.",
        "A modded figure of 8.6 speed circulates (MeowDB via GuideDistrict FR); it is an upgraded read, not stock, and is not shipped.",
        "Plan-table correction: the plan's stats table labels this car 'Sports Classics' while its price table calls it a Supercar; shipped as Supercars per the 20-class list (no Sports Classics class exists in it)."
      ],
      "registerCost": 34750,
      "sellValue": 17160,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        },
        {
          "date": "2026-11-20",
          "field": "location",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "notes",
          "name": "GuideDistrict FR — vehicle comparison page",
          "url": "https://guidedistrict.com/fr/gta-6/vehicules/comparer-les-vehicules/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.3,
        "asphaltHandling": 6.5,
        "offRoadHandling": 4.3,
        "speed": 7.1,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Supercars",
      "era": "2020s",
      "id": "grotti-itali-rsx",
      "location": null,
      "maker": "Grotti",
      "name": "Grotti Itali RSX",
      "notes": [
        "Class disputed: ProGameGuides lists it as Sports; Leonipedia lists it under Supercars — shipped as Supercars per Leonipedia and PlayDay.One."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 8.1,
        "asphaltHandling": 7.0,
        "offRoadHandling": 3.8,
        "speed": 7.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Supercars",
      "era": "2010s",
      "id": "pegassi-tempesta",
      "location": null,
      "maker": "Pegassi",
      "name": "Pegassi Tempesta",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        },
        {
          "date": "2026-11-23",
          "field": "tracker",
          "name": "Game8 — All Randy's Wishlist Vehicle Locations",
          "url": "https://cloudfront-test.game8.co/games/GTA-6/archives/639137"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.8,
        "asphaltHandling": 6.9,
        "offRoadHandling": 3.8,
        "speed": 7.6,
        "strength": 3.0
      },
      "tracker": "Advanced",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Supercars",
      "era": "2010s",
      "id": "pegassi-vitello",
      "location": null,
      "maker": "Pegassi",
      "name": "Pegassi Vitello",
      "notes": [
        "A published location exists (villa garage on Flamingo Parkway, Waning Sands) but was not re-verified on the build date; location left null."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 8.4,
        "asphaltHandling": 8.2,
        "offRoadHandling": 3.8,
        "speed": 8.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Supercars",
      "era": "2010s",
      "id": "granforma-zorrusso",
      "location": null,
      "maker": "Granforma",
      "name": "Granforma Zorrusso",
      "notes": [
        "PlayDay.One prints the maker as 'Grandforma' (typo); shipped as Granforma."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.8,
        "asphaltHandling": 7.1,
        "offRoadHandling": 3.8,
        "speed": 7.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Supercars",
      "era": null,
      "id": "truffade-thrax",
      "location": "Dalton Island clubhouse (Randy's Wishlist; reached by the Wax Island ferry)",
      "maker": "Truffade",
      "name": "Truffade Thrax",
      "notes": [
        "Speed rating 8.7 reported by five agreeing sources (GameSpot, Beebom, ShowGamer, Gameta, KhelNow) but still absent from the Dexerto, IGN and GTABase tables; GTA6Info flags it unconfirmed — shipped flagged, not two-source verified.",
        "Highest Speed rating in this dataset; the strip wording stays provisional.",
        "No price published yet. Acceleration, asphalt and off-road figures come from tracker.gg only."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "GameSpot — GTA 6 vehicle speed ranking",
          "url": "https://www.gamespot.com/articles/dont-blink-these-are-the-fastest-cars-in-gta-6/"
        },
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "Beebom — GTA 6 vehicle speed ranking",
          "url": "https://beebom.com/gta-6-fastest-cars/"
        },
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "ShowGamer — GTA 6 vehicle speed ranking",
          "url": "https://showgamer.com/en/guides/8116-samye-bystrye-mashiny-v-gta-6-top-5-luchshih-superkarov-leonidy"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-23",
          "field": "notes",
          "name": "GTA6Info — vehicle speed ranking",
          "url": "https://gta6info.com/wiki/Fastest_Cars"
        },
        {
          "date": "2026-11-23",
          "field": "location",
          "name": "Game8 — All Randy's Wishlist Vehicle Locations",
          "url": "https://cloudfront-test.game8.co/games/GTA-6/archives/639137"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 8.6,
        "asphaltHandling": 7.5,
        "offRoadHandling": 3.8,
        "speed": 8.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2010s",
      "id": "vapid-aleutian",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Aleutian",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 5.1,
        "asphaltHandling": 4.3,
        "offRoadHandling": 4.8,
        "speed": 4.3,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2010s",
      "id": "gallivanter-baller",
      "location": null,
      "maker": "Gallivanter",
      "name": "Gallivanter Baller",
      "notes": [
        "Stats from PlayDay.One only; tracker.gg lists the Baller ST-D, not this base model."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 6.2,
        "asphaltHandling": 4.4,
        "offRoadHandling": 5.0,
        "speed": 5.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "1980s",
      "id": "canis-crawler-82",
      "location": null,
      "maker": "Canis",
      "name": "'82 Canis Crawler",
      "notes": [
        "tracker.gg lists this vehicle under Off-Road; shipped as SUVs per PlayDay.One."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 3.0,
        "asphaltHandling": 3.3,
        "offRoadHandling": 6.6,
        "speed": 2.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2000s",
      "id": "declasse-granger",
      "location": null,
      "maker": "Declasse",
      "name": "Declasse Granger",
      "notes": [
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 6400,
      "sellValue": 1050,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 4.0,
        "asphaltHandling": 3.7,
        "offRoadHandling": 4.2,
        "speed": 3.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "1990s",
      "id": "annis-hellion-95",
      "location": null,
      "maker": "Annis",
      "name": "'95 Annis Hellion",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 3.4,
        "asphaltHandling": 3.0,
        "offRoadHandling": 6.7,
        "speed": 3.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2020s",
      "id": "buckingham-jubilee",
      "location": null,
      "maker": "Buckingham",
      "name": "Buckingham Jubilee",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 6.1,
        "asphaltHandling": 4.4,
        "offRoadHandling": 5.1,
        "speed": 5.4,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2010s",
      "id": "canis-kamacho",
      "location": null,
      "maker": "Canis",
      "name": "Canis Kamacho",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 4.7,
        "asphaltHandling": 3.4,
        "offRoadHandling": 6.7,
        "speed": 3.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2020s",
      "id": "dundreary-landstalker-xl",
      "location": null,
      "maker": "Dundreary",
      "name": "Dundreary Landstalker XL",
      "notes": [
        "Off-road handling is blank in PlayDay.One's table; tracker.gg lists 5.0 — shipped as 5.0, single-source for that figure."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 5.2,
        "asphaltHandling": 3.9,
        "offRoadHandling": 5.0,
        "speed": 4.4,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2020s",
      "id": "canis-mesa",
      "location": null,
      "maker": "Canis",
      "name": "Canis Mesa",
      "notes": [
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 8000,
      "sellValue": 1300,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Off-Road",
      "stats": {
        "acceleration": 5.4,
        "asphaltHandling": 3.2,
        "offRoadHandling": 6.7,
        "speed": 4.4,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2010s",
      "id": "vapid-montagne",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Montagne",
      "notes": [
        "Acceleration disputed: tracker.gg lists 4.5; PlayDay.One lists 4.6 — shipped as 4.6.",
        "Prices from HowToVideoGame's own WAiNK scans only (single source)."
      ],
      "registerCost": 2650,
      "sellValue": 450,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "HowToVideoGame — GTA 6: How to Buy Cars",
          "url": "https://howtovideogame.com/gta-6-buy-cars/"
        }
      ],
      "specialist": "Tuner",
      "stats": {
        "acceleration": 4.6,
        "asphaltHandling": 4.0,
        "offRoadHandling": 4.8,
        "speed": 4.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "SUVs",
      "era": "2010s",
      "id": "pegassi-toros",
      "location": null,
      "maker": "Pegassi",
      "name": "Pegassi Toros",
      "notes": [
        "Asphalt and off-road handling disputed: tracker.gg lists 4.7 / 4.5; PlayDay.One lists 4.6 / 5.1 — shipped as PlayDay.One's figures."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Luxury",
      "stats": {
        "acceleration": 7.0,
        "asphaltHandling": 4.6,
        "offRoadHandling": 5.1,
        "speed": 6.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Vans",
      "era": "2000s",
      "id": "brute-boxville",
      "location": null,
      "maker": "Brute",
      "name": "Brute Boxville",
      "notes": [
        "Off-road handling disputed: tracker.gg lists 3.5; PlayDay.One lists 3.4 — shipped as 3.4."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 2.7,
        "asphaltHandling": 2.7,
        "offRoadHandling": 3.4,
        "speed": 2.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Vans",
      "era": "1990s",
      "id": "declasse-burrito-98",
      "location": null,
      "maker": "Declasse",
      "name": "'98 Declasse Burrito",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 3.8,
        "asphaltHandling": 3.4,
        "offRoadHandling": 3.3,
        "speed": 3.4,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Vans",
      "era": "2000s",
      "id": "vapid-rumpo",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Rumpo",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 3.7,
        "asphaltHandling": 3.1,
        "offRoadHandling": 3.3,
        "speed": 3.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Vans",
      "era": "2020s",
      "id": "vapid-shifter",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Shifter",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 4.2,
        "asphaltHandling": 3.6,
        "offRoadHandling": 3.3,
        "speed": 3.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Vans",
      "era": "2010s",
      "id": "bravado-sojourn",
      "location": null,
      "maker": "Bravado",
      "name": "Bravado Sojourn",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 4.8,
        "asphaltHandling": 3.9,
        "offRoadHandling": 4.1,
        "speed": 4.5,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Vans",
      "era": "2010s",
      "id": "vapid-speedo",
      "location": null,
      "maker": "Vapid",
      "name": "Vapid Speedo",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Car in GTA 6",
          "url": "https://playday.one/2026/11/18/every-car-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 3.6,
        "asphaltHandling": 3.1,
        "offRoadHandling": 3.6,
        "speed": 3.4,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2020s",
      "id": "principe-alvino-v1",
      "location": null,
      "maker": "Principe",
      "name": "Principe Alvino V1",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Sports Bike",
      "stats": {
        "acceleration": 7.9,
        "asphaltHandling": 7.9,
        "offRoadHandling": 2.3,
        "speed": 6.9,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2000s",
      "id": "lcc-avarus",
      "location": null,
      "maker": "LCC",
      "name": "LCC Avarus",
      "notes": [
        "Acceleration disputed: tracker.gg lists 4.6; PlayDay.One lists 4.7 — shipped as 4.7."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 4.7,
        "asphaltHandling": 4.8,
        "offRoadHandling": 2.7,
        "speed": 3.6,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2010s",
      "id": "nagasaki-carbon-rs",
      "location": null,
      "maker": "Nagasaki",
      "name": "Nagasaki Carbon RS",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "GuideDistrict — GTA 6 Motorcycles",
          "url": "https://guidedistrict.com/en/gta-6/vehicles/motorcycles/"
        }
      ],
      "specialist": "Sports Bike",
      "stats": {
        "acceleration": 7.7,
        "asphaltHandling": 7.6,
        "offRoadHandling": 2.3,
        "speed": 6.7,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "1970s",
      "id": "dinka-enduro-72",
      "location": null,
      "maker": "Dinka",
      "name": "'72 Dinka Enduro",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Dirt Bike",
      "stats": {
        "acceleration": 5.7,
        "asphaltHandling": 5.2,
        "offRoadHandling": 7.6,
        "speed": 3.9,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2010s",
      "id": "maibatsu-manchez",
      "location": null,
      "maker": "Maibatsu",
      "name": "Maibatsu Manchez",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Dirt Bike",
      "stats": {
        "acceleration": 5.8,
        "asphaltHandling": 5.2,
        "offRoadHandling": 7.7,
        "speed": 3.9,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2000s",
      "id": "maibatsu-sanchez",
      "location": null,
      "maker": "Maibatsu",
      "name": "Maibatsu Sanchez",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Dirt Bike",
      "stats": {
        "acceleration": 5.9,
        "asphaltHandling": 5.2,
        "offRoadHandling": 7.7,
        "speed": 3.9,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2020s",
      "id": "nagasaki-sfb-1000",
      "location": null,
      "maker": "Nagasaki",
      "name": "Nagasaki SFB 1000",
      "notes": [
        "Highest Speed rating of any bike in this dataset (7.1)."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-21",
          "field": "stats",
          "name": "GuideDistrict — GTA 6 Motorcycles",
          "url": "https://guidedistrict.com/en/gta-6/vehicles/motorcycles/"
        },
        {
          "date": "2026-11-23",
          "field": "stats",
          "name": "Leonipedia — GTA 6 vehicle list by category",
          "url": "https://leonipedia.com/guides/vehicles-list/"
        }
      ],
      "specialist": "Sports Bike",
      "stats": {
        "acceleration": 8.1,
        "asphaltHandling": 8.1,
        "offRoadHandling": 2.3,
        "speed": 7.1,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "1970s",
      "id": "western-cliffhanger-72",
      "location": null,
      "maker": "Western",
      "name": "'72 Western Cliffhanger",
      "notes": [
        "Stats from tracker.gg only; PlayDay.One's bike page does not list this model."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 5.8,
        "asphaltHandling": 5.4,
        "offRoadHandling": 7.7,
        "speed": 4.9,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Bikes",
      "era": "2010s",
      "id": "nagasaki-street-blazer",
      "location": null,
      "maker": "Nagasaki",
      "name": "Nagasaki Street Blazer",
      "notes": [
        "Quad bike (ATV), classed under Bikes."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Bike in GTA 6",
          "url": "https://playday.one/2026/11/18/every-bike-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": "Dirt Bike",
      "stats": {
        "acceleration": 5.4,
        "asphaltHandling": 3.4,
        "offRoadHandling": 7.5,
        "speed": 2.8,
        "strength": 4.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Trucks",
      "era": "2000s",
      "id": "cartright-biff",
      "location": null,
      "maker": "Cartright",
      "name": "Cartright Biff",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.7,
        "asphaltHandling": 2.7,
        "offRoadHandling": 2.7,
        "speed": 2.2,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Trucks",
      "era": "2000s",
      "id": "declasse-d7700",
      "location": null,
      "maker": "Declasse",
      "name": "Declasse D7700",
      "notes": [
        "PlayDay.One prints the maker as 'Decalsse' (typo); shipped as Declasse."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 2.6,
        "asphaltHandling": 2.7,
        "offRoadHandling": 2.9,
        "speed": 2.9,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Trucks",
      "era": "2000s",
      "id": "cartright-hauler",
      "location": null,
      "maker": "Cartright",
      "name": "Cartright Hauler",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.4,
        "asphaltHandling": 2.3,
        "offRoadHandling": 2.5,
        "speed": 2.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Trucks",
      "era": "2000s",
      "id": "maibatsu-iota",
      "location": null,
      "maker": "Maibatsu",
      "name": "Maibatsu Iota",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 2.2,
        "asphaltHandling": 2.6,
        "offRoadHandling": 3.0,
        "speed": 2.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Trucks",
      "era": "2000s",
      "id": "maibatsu-mule",
      "location": null,
      "maker": "Maibatsu",
      "name": "Maibatsu Mule",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.9,
        "asphaltHandling": 2.5,
        "offRoadHandling": 2.8,
        "speed": 2.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Trucks",
      "era": "2000s",
      "id": "mtl-packer",
      "location": null,
      "maker": "MTL",
      "name": "MTL Packer",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.7,
        "asphaltHandling": 2.2,
        "offRoadHandling": 2.5,
        "speed": 2.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Utility",
      "era": "1980s",
      "id": "interstate-yankee-80",
      "location": null,
      "maker": "Interstate",
      "name": "'80 Interstate Yankee",
      "notes": [
        "Stats from tracker.gg only; PlayDay.One lists this vehicle with no stats."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.9,
        "asphaltHandling": 3.1,
        "offRoadHandling": 3.0,
        "speed": 2.6,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [
        "'82 Caddy"
      ],
      "class": "Utility",
      "era": "2000s",
      "id": "maibatsu-caddy-82",
      "location": null,
      "maker": "Maibatsu",
      "name": "Maibatsu Caddy",
      "notes": [
        "Stats from tracker.gg only; PlayDay.One lists this vehicle with no stats."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 0.9,
        "asphaltHandling": 1.2,
        "offRoadHandling": 2.6,
        "speed": 1.0,
        "strength": 3.5
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Utility",
      "era": "1990s",
      "id": "hvy-airtug",
      "location": null,
      "maker": "HVY",
      "name": "HVY Airtug",
      "notes": [
        "Stats from tracker.gg only; PlayDay.One lists this vehicle with no stats. Strength 7.5 — airport tug, not a road car."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 0.1,
        "asphaltHandling": 0.6,
        "offRoadHandling": 1.8,
        "speed": 0.5,
        "strength": 7.5
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Emergency",
      "era": "1990s",
      "id": "declasse-ambulance",
      "location": null,
      "maker": "Declasse",
      "name": "Declasse Ambulance",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 2.6,
        "asphaltHandling": 2.9,
        "offRoadHandling": 2.9,
        "speed": 3.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Emergency",
      "era": "2000s",
      "id": "hauners-brigade",
      "location": null,
      "maker": "Hauners",
      "name": "Hauners Brigade",
      "notes": [
        "Strength disputed: tracker.gg lists 3.0; PlayDay.One lists 3.4 — shipped as 3.4."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.1,
        "asphaltHandling": 1.9,
        "offRoadHandling": 5.4,
        "speed": 1.6,
        "strength": 3.4
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Emergency",
      "era": "2000s",
      "id": "brute-police-riot",
      "location": null,
      "maker": "Brute",
      "name": "Brute Police Riot",
      "notes": [
        "Stats from PlayDay.One only. Strength 4.4 — armored police transport."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 2.0,
        "asphaltHandling": 2.8,
        "offRoadHandling": 2.6,
        "speed": 2.4,
        "strength": 4.4
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Military",
      "era": "1990s",
      "id": "mammoth-patriot-92",
      "location": null,
      "maker": "Mammoth",
      "name": "Mammoth Patriot '92",
      "notes": [
        "No register cost published — Sportskeeda and Gurugamer list it as 'Not listed'. Stats from tracker.gg only."
      ],
      "registerCost": null,
      "sellValue": 10835,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Sportskeeda — 10 most expensive cars in GTA 6",
          "url": "https://www.sportskeeda.com/esports/expensive-cars-gta-6-prices"
        },
        {
          "date": "2026-11-21",
          "field": "price",
          "name": "Gurugamer — Top 10 Highest Value Cars in GTA 6",
          "url": "https://gurugamer.com/pc-console/top-10-highest-value-cars-in-gta-6-and-what-they-actually-cost-27605"
        },
        {
          "date": "2026-11-20",
          "field": "price",
          "name": "Overgear — GTA 6 Most Expensive Vehicles",
          "url": "https://overgear.com/guides/gta-6/most-expensive-vehicles/"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.8,
        "asphaltHandling": 2.7,
        "offRoadHandling": 6.7,
        "speed": 2.5,
        "strength": 3.0
      },
      "tracker": "Military",
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Military",
      "era": null,
      "id": "hauners-rhino-tank",
      "location": null,
      "maker": "Hauners",
      "name": "Hauners Rhino Tank",
      "notes": [
        "Stats from tracker.gg only; PlayDay.One lists this vehicle with no stats. Strength 8.0 — battle tank."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 0.2,
        "asphaltHandling": 1.0,
        "offRoadHandling": 2.8,
        "speed": 0.8,
        "strength": 8.0
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Industrial",
      "era": "2010s",
      "id": "stanely-furrow-tc-2350",
      "location": null,
      "maker": "Stanely",
      "name": "Stanely Furrow TC 2350",
      "notes": [
        "Stats from tracker.gg only; PlayDay.One lists this vehicle with no stats. Maker spelling as published by PlayDay.One."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 0.3,
        "asphaltHandling": 1.0,
        "offRoadHandling": 3.0,
        "speed": 1.0,
        "strength": 3.5
      },
      "tracker": null,
      "verified": "single-source"
    },
    {
      "aliases": [],
      "class": "Transport",
      "era": "2000s",
      "id": "whiffler-airport-bus",
      "location": null,
      "maker": "Whiffler",
      "name": "Whiffler Airport Bus",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.4,
        "asphaltHandling": 2.1,
        "offRoadHandling": 2.5,
        "speed": 2.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Transport",
      "era": "2020s",
      "id": "whiffler-bus",
      "location": null,
      "maker": "Whiffler",
      "name": "Whiffler Bus",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.4,
        "asphaltHandling": 2.1,
        "offRoadHandling": 2.4,
        "speed": 2.1,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Transport",
      "era": "2000s",
      "id": "whiffler-dashound",
      "location": null,
      "maker": "Whiffler",
      "name": "Whiffler Dashound",
      "notes": [],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "IGN — Sports Cars guide",
          "url": "https://openweb-ign.cdn.zephr.com/wikis/gta-6/Sports_Cars"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 1.3,
        "asphaltHandling": 2.1,
        "offRoadHandling": 2.5,
        "speed": 2.0,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    },
    {
      "aliases": [],
      "class": "Transport",
      "era": "2000s",
      "id": "brute-rental-bus",
      "location": null,
      "maker": "Brute",
      "name": "Brute Rental Bus",
      "notes": [
        "Maker disputed: PlayDay.One lists Brute; IGN lists Declasse — shipped as Brute per PlayDay.One."
      ],
      "registerCost": null,
      "sellValue": null,
      "sources": [
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "PlayDay.One — Every Service and Utility Vehicle in GTA 6",
          "url": "https://playday.one/2026/11/18/every-service-and-utility-vehicle-in-gta-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "tracker.gg — GTA 6 Cars & Vehicles List",
          "url": "https://tracker.gg/gta6/vehicles"
        }
      ],
      "specialist": null,
      "stats": {
        "acceleration": 2.4,
        "asphaltHandling": 2.8,
        "offRoadHandling": 3.0,
        "speed": 2.7,
        "strength": 3.0
      },
      "tracker": null,
      "verified": "two-source"
    }
  ],
  "version": "1.0.0"
};

var CLASS_NAMES = {"Bikes": "دراجات نارية (Bikes)", "Coupes": "سيارات كوبيه (Coupes)", "Emergency": "مركبات الطوارئ (Emergency)", "Industrial": "مركبات صناعية (Industrial)", "Military": "مركبات عسكرية (Military)", "Muscle Cars": "سيارات العضلات (Muscle Cars)", "Off-Road Vehicles": "مركبات الطرق الوعرة (Off-Road Vehicles)", "Pickups": "بيك أب (Pickups)", "SUVs": "سيارات الدفع الرباعي (SUVs)", "Sedans": "سيارات سيدان (Sedans)", "Sports Cars": "سيارات رياضية (Sports Cars)", "Supercars": "سيارات خارقة (Supercars)", "Transport": "مركبات النقل (Transport)", "Trucks": "شاحنات (Trucks)", "Utility": "مركبات الخدمات (Utility)", "Vans": "سيارات فان (Vans)"};
function formatLong(iso) {
  var parts = String(iso).split("-");
  var months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
  if (!y || !m || !d) return String(iso);
  return d + " " + months[m - 1] + " " + y;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syncStamps() {
  var text = formatLong(DATA.lastChecked);
  var stamps = document.querySelectorAll("[data-last-checked]");
  for (var i = 0; i < stamps.length; i++) {
    if (stamps[i].textContent !== text) {
      if (window.console && console.warn) {
        console.warn("vehicle-comparison: baked last-checked stamp differed from data; corrected to " + DATA.lastChecked);
      }
      stamps[i].textContent = text;
    }
    stamps[i].setAttribute("datetime", DATA.lastChecked);
  }
}

function fmtPrice(n) {
  if (n == null) return "—";
  return "$" + Number(n).toLocaleString("en-US");
}

function fmtStat(v) {
  if (v == null) return "—";
  return Number(v).toFixed(1);
}

function byId(id) {
  for (var i = 0; i < DATA.vehicles.length; i++) {
    if (DATA.vehicles[i].id === id) return DATA.vehicles[i];
  }
  return null;
}

function classes() {
  var seen = {}, out = [];
  DATA.vehicles.forEach(function (w) {
    if (!seen[w["class"]]) { seen[w["class"]] = true; out.push(w["class"]); }
  });
  return out;
}

function badge(w) {
  if (w.provenance === "on-screen") return "على الشاشة";
  if (w.verified === "single-source") return "مؤقتة";
  if (w.provenance === "provisional") return "مؤقتة";
  return "مُبلَّغ عنه";
}

function ratingBar(label, a, b) {
  var aw = a == null ? 0 : Number(a) * 10;
  var bw = b == null ? 0 : Number(b) * 10;
  var pill = "";
  if (a != null && b != null) {
    if (Number(a) > Number(b)) pill = '<span class="winner-pill">A يفوز</span>';
    else if (Number(b) > Number(a)) pill = '<span class="winner-pill">B يفوز</span>';
    else pill = '<span class="winner-pill">تعادل</span>';
  }
  return '<div class="balance-bars"><div><div class="balance-bar-head"><span class="lbl">' + esc(label) + ' — A</span><span class="val">' + fmtStat(a) + ' / 10</span></div>' +
    '<div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + aw + '%"></div></div></div>' +
    '<div><div class="balance-bar-head"><span class="lbl">' + esc(label) + ' — B</span><span class="val">' + fmtStat(b) + ' / 10</span></div>' +
    '<div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + bw + '%"></div></div></div>' +
    '<p class="field-hint">' + pill + '</p></div>';
}

function detailRow(label, a, b) {
  return '<div><dt>' + esc(label) + ' — A</dt><dd>' + a + '</dd></div>' +
    '<div><dt>' + esc(label) + ' — B</dt><dd>' + b + '</dd></div>';
}

function renderCompare() {
  var host = document.querySelector("[data-output-panel]");
  var selA = document.querySelector("[data-vehicle-a]");
  var selB = document.querySelector("[data-vehicle-b]");
  if (!host || !selA || !selB) return;
  var a = byId(selA.dataset.selectedId), b = byId(selB.dataset.selectedId);
  if (!a || !b) return;
  function fmtMoney(n, single) {
    if (n == null) return "—";
    return fmtPrice(n) + (single ? " *" : "");
  }
  var html = '<div class="verdict-body"><div><p class="verdict-kicker">' + (CLASS_NAMES[a["class"]] || esc(a["class"])) + ' vs ' + (CLASS_NAMES[b["class"]] || esc(b["class"])) + '</p>' +
    '<h3 class="verdict-title">' + esc(a.name) + ' <span class="unit">vs</span> ' + esc(b.name) + '</h3>' +
    '<p class="verdict-desc">السرعة والتسارع والتحكم على الأسفلت والتحكم على الطرق الوعرة والمتانة هي تقييمات اللعبة نفسها من 10 — وليست سرعات قصوى مقيسة. ' + esc(a.name) + ': ' + badge(a) + '. ' + esc(b.name) + ': ' + badge(b) + '.</p></div></div>' +
    ratingBar("السرعة", a.stats.speed, b.stats.speed) +
    ratingBar("التسارع", a.stats.acceleration, b.stats.acceleration) +
    ratingBar("التحكم على الأسفلت", a.stats.asphaltHandling, b.stats.asphaltHandling) +
    ratingBar("التحكم على الطرق الوعرة", a.stats.offRoadHandling, b.stats.offRoadHandling) +
    ratingBar("المتانة", a.stats.strength, b.stats.strength) +
    '<dl class="stat-grid">' +
    detailRow("تكلفة التسجيل", fmtMoney(a.registerCost, a.verified === "single-source" && a.registerCost != null), fmtMoney(b.registerCost, b.verified === "single-source" && b.registerCost != null)) +
    detailRow("قيمة البيع", fmtMoney(a.sellValue, a.verified === "single-source" && a.sellValue != null), fmtMoney(b.sellValue, b.verified === "single-source" && b.sellValue != null)) +
    detailRow("الفئة", esc(a["class"] || "—"), esc(b["class"] || "—")) +
    detailRow("الحقبة", esc(a.era || "—"), esc(b.era || "—")) +
    detailRow("المتتبع", esc(a.tracker || "—"), esc(b.tracker || "—")) +
    detailRow("الموقع", esc(a.location || "—"), esc(b.location || "—")) +
    '</dl>';
  var notes = [];
  (a.notes || []).forEach(function (n) { notes.push(esc(a.name) + ": " + esc(n)); });
  (b.notes || []).forEach(function (n) { notes.push(esc(b.name) + ": " + esc(n)); });
  if (notes.length) {
    html += '<div class="upgrade-box"><p class="eyebrow-muted">ملاحظات</p><ul>';
    notes.forEach(function (n) { html += "<li>" + n + "</li>"; });
    html += "</ul></div>";
  }
  html += '<div class="share-row"><button type="button" class="btn-chip" data-copy-link><span data-copy-link-label>نسخ رابط المقارنة</span></button></div>';
  host.innerHTML = html;
  var btn = host.querySelector("[data-copy-link]");
  if (btn) btn.addEventListener("click", function () {
    var url = location.href;
    var label = btn.querySelector("[data-copy-link-label]");
    function done(msg) { if (label) label.textContent = msg; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { done("تم نسخ الرابط"); }, function () { done("تعذّر النسخ — انسخ شريط العنوان"); });
    } else { done("انسخ شريط العنوان"); }
  });
}

function classLabel(c) {
  if (typeof CLASS !== "undefined" && CLASS[c]) return CLASS[c];
  if (typeof CLASS_NAMES !== "undefined" && CLASS_NAMES[c]) return CLASS_NAMES[c];
  return c;
}

function populateSelects() {
  var selA = document.querySelector("[data-vehicle-a]");
  var selB = document.querySelector("[data-vehicle-b]");
  var filt = document.querySelector("[data-class-filter]");
  if (!selA || !selB) return;
  var cls = classes();
  if (filt) {
    cls.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c; o.textContent = classLabel(c);
      filt.appendChild(o);
    });
  }
  var emptyCell = document.querySelector("[data-table-empty] td");
  var noResultsText = emptyCell ? emptyCell.textContent.trim() : "لا توجد مركبات تطابق بحثك.";
  var form = document.querySelector("#vehicle-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  var combos = {};
  function firstInClass(v, notId) {
    var list = v === "all" ? DATA.vehicles : DATA.vehicles.filter(function (w) { return w["class"] === v; });
    for (var i = 0; i < list.length; i++) { if (list[i].id !== notId) return list[i]; }
    return list[0] || null;
  }
  function syncUrl() {
    var q = new URLSearchParams({ a: combos.a.id, b: combos.b.id });
    history.replaceState(null, "", location.pathname + "?" + q.toString());
  }
  function setupCombo(input, listbox, side) {
    if (!listbox) listbox = document.createElement("div");
    var state = { input: input, listbox: listbox, side: side, id: null, active: -1, opts: [], open: false };
    function inClass(w) {
      return !filt || filt.value === "all" || w["class"] === filt.value;
    }
    function matches(w, q) {
      if (!inClass(w)) return false;
      if (!q) return true;
      var hay = (w.name + " " + (w.aliases || []).join(" ") + " " + w["class"] + " " + classLabel(w["class"])).toLowerCase();
      return hay.indexOf(q) !== -1;
    }
    function openList(q) {
      var query = q == null ? "" : String(q).trim().toLowerCase();
      var groups = {};
      cls.forEach(function (c) { groups[c] = []; });
      DATA.vehicles.forEach(function (w) { if (matches(w, query)) groups[w["class"]].push(w); });
      listbox.textContent = "";
      var opts = [];
      cls.forEach(function (c) {
        if (!groups[c].length) return;
        var g = document.createElement("div");
        g.setAttribute("role", "group");
        g.setAttribute("aria-label", classLabel(c));
        var h = document.createElement("div");
        h.className = "combo-group";
        h.setAttribute("aria-hidden", "true");
        h.textContent = classLabel(c);
        g.appendChild(h);
        groups[c].forEach(function (w) {
          var o = document.createElement("div");
          o.className = "combo-option";
          o.setAttribute("role", "option");
          o.id = side + "-opt-" + w.id;
          o.setAttribute("data-id", w.id);
          o.setAttribute("aria-selected", w.id === state.id ? "true" : "false");
          o.textContent = w.name;
          o.addEventListener("mousedown", function (e) { e.preventDefault(); });
          o.addEventListener("click", function () { choose(w.id); });
          g.appendChild(o);
          opts.push(o);
        });
        listbox.appendChild(g);
      });
      if (!opts.length) {
        var em = document.createElement("div");
        em.className = "combo-empty";
        em.setAttribute("role", "option");
        em.setAttribute("aria-disabled", "true");
        em.textContent = noResultsText;
        listbox.appendChild(em);
      }
      state.opts = opts;
      state.active = -1;
      input.removeAttribute("aria-activedescendant");
      listbox.hidden = false;
      input.setAttribute("aria-expanded", "true");
      state.open = true;
    }
    function closeList(restore) {
      if (restore) {
        var w = state.id ? byId(state.id) : null;
        if (w) input.value = w.name;
      }
      listbox.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      state.open = false;
      state.active = -1;
    }
    function setActive(i) {
      if (!state.opts.length) return;
      if (i < 0) i = 0;
      if (i >= state.opts.length) i = state.opts.length - 1;
      state.opts.forEach(function (o) { o.classList.remove("active"); });
      state.active = i;
      var o = state.opts[i];
      o.classList.add("active");
      input.setAttribute("aria-activedescendant", o.id);
      if (o.scrollIntoView) o.scrollIntoView({ block: "nearest" });
    }
    function choose(id) {
      var w = byId(id);
      if (!w) return;
      state.id = id;
      input.dataset.selectedId = id;
      input.value = w.name;
      closeList(false);
      syncUrl();
      renderCompare();
    }
    function commitExact() {
      var v = input.value.trim().toLowerCase();
      if (!v) return false;
      for (var i = 0; i < DATA.vehicles.length; i++) {
        var w = DATA.vehicles[i];
        if (w.name.toLowerCase() === v && inClass(w)) { choose(w.id); return true; }
      }
      return false;
    }
    function setSelected(id) {
      var w = byId(id);
      if (!w) return;
      state.id = id;
      input.dataset.selectedId = id;
      input.value = w.name;
    }
    function refresh() { if (state.open) openList(""); }
    input.addEventListener("focus", function () { openList(""); });
    input.addEventListener("input", function () {
      var v = input.value;
      var selName = state.id && byId(state.id) ? byId(state.id).name : "";
      if (selName && v.length > selName.length && v.indexOf(selName) === 0) {
        v = v.slice(selName.length);
        input.value = v;
      }
      openList(v);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!state.open) openList("");
        else setActive(state.active + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (state.open) setActive(state.active - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (state.open && state.active >= 0 && state.opts[state.active]) {
          choose(state.opts[state.active].getAttribute("data-id"));
        } else if (state.open && !commitExact()) {
          closeList(true);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (state.open) closeList(true);
      }
    });
    input.addEventListener("blur", function () {
      setTimeout(function () {
        if (document.activeElement !== input && state.open) {
          if (!commitExact()) closeList(true);
        }
      }, 0);
    });
    document.addEventListener("mousedown", function (e) {
      if (state.open && !input.parentElement.contains(e.target)) {
        if (!commitExact()) closeList(true);
      }
    });
    state.choose = choose;
    state.setSelected = setSelected;
    state.refresh = refresh;
    return state;
  }
  var params = new URLSearchParams(location.search);
  var aId = params.get("a");
  if (!byId(aId)) aId = "truffade-thrax";
  var bId = params.get("b");
  if (!byId(bId)) bId = "progen-emerus";
  combos.a = setupCombo(selA, document.querySelector("#vehicle-a-listbox"), "a");
  combos.b = setupCombo(selB, document.querySelector("#vehicle-b-listbox"), "b");
  combos.a.setSelected(aId);
  combos.b.setSelected(bId);
  if (filt) filt.addEventListener("change", function () {
    var v = filt.value;
    function inClassId(id) {
      var w = byId(id);
      return !!w && (v === "all" || w["class"] === v);
    }
    var nextA = combos.a.id, nextB = combos.b.id;
    if (!inClassId(nextA)) {
      var fa = firstInClass(v, null);
      if (fa) nextA = fa.id;
    }
    if (!inClassId(nextB) || nextB === nextA) {
      var fb = firstInClass(v, nextA);
      if (fb) nextB = fb.id;
    }
    combos.a.setSelected(nextA);
    combos.b.setSelected(nextB);
    combos.a.refresh();
    combos.b.refresh();
    filterTable();
    syncUrl();
    renderCompare();
  });
  syncUrl();
  renderCompare();
}

function filterTable() {
  var input = document.querySelector("[data-table-search]");
  var filt = document.querySelector("[data-class-filter]");
  var rows = document.querySelectorAll("[data-vehicles-rows] tr:not([data-table-empty])");
  var count = document.querySelector("[data-table-count]");
  if (!input) return;
  var q = input.value.trim().toLowerCase();
  var cls = filt ? filt.value : "all";
  var shown = 0;
  rows.forEach(function (tr) {
    var hay = (tr.getAttribute("data-search") || "").toLowerCase();
    var ok = (!q || hay.indexOf(q) !== -1) && (cls === "all" || hay.indexOf("class:" + cls.toLowerCase()) !== -1);
    tr.hidden = !ok;
    if (ok) shown++;
  });
  var empty = document.querySelector("[data-table-empty]");
  if (empty) empty.hidden = shown !== 0;
  if (count) count.textContent = "عرض " + shown + " من أصل " + DATA.vehicles.length + " مركبةً.";
}

syncStamps();
populateSelects();
var searchInput = document.querySelector("[data-table-search]");
if (searchInput) searchInput.addEventListener("input", filterTable);
filterTable();
