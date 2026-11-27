// weapon-comparison.js — GTA 6 Weapon Comparison page logic.
// The browse-all table, best strip and default comparison are static HTML
// (SEO/GEO content). This module owns the interactive bits: the A/B picker,
// class filter, table search, share URLs, and the "Last checked" stamps
// (single source of truth = data/weapons.json, embedded below as DATA).
// It never invents a stat, price or date: every row comes from DATA.

var DATA = {
  "coverage": {
    "note": "Phase 1: 53 base guns. Unique variants, melee and throwables excluded (no published stats).",
    "rosterBase": 53,
    "weapons": 53
  },
  "lastChecked": "2026-11-24",
  "version": "1.0.0",
  "weapons": [
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".380",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "scorpio-nipper-38",
      "mag": 8,
      "maker": "Scorpio",
      "name": "Scorpio Nipper .38",
      "notes": [
        "Cheapest gun. Price contested: IGN lists $495 (via gta6everything, checked 20 Nov 2026); GTA6Info, fpsgen and tracker.gg list $550."
      ],
      "price": 550,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.0,
        "damage": 2.8,
        "handling": 9.0,
        "range": 3.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "klose-k17",
      "mag": 17,
      "maker": "Klose",
      "name": "Klose K17",
      "notes": [
        "Lucia's pistol (Rockstar-named). Accuracy contested: howtovideogame's own PS5 recording reads 4.5, not 4.2."
      ],
      "price": 975,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/pistols/klose-k17/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 4.0,
        "handling": 8.5,
        "range": 3.8
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".45",
      "class": "Pistols",
      "extendedMag": 36,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "duke-1922",
      "mag": 8,
      "maker": "Duke",
      "name": "Duke 1922",
      "notes": [
        "Price marked disputed (*) in GTA6Info's own price table; fpsgen and vAnother Level (on screen) also list $1,050.",
        "Extended magazine 8 to 36 rounds: GTA6Direct (via GTABase), single source."
      ],
      "price": 1050,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        },
        {
          "date": "2026-11-24",
          "field": "unlock",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        },
        {
          "date": "2026-11-22",
          "field": "extendedMag",
          "name": "GTA6Direct",
          "url": "https://gta6direct.com/"
        }
      ],
      "stats": {
        "accuracy": 4.8,
        "damage": 5.5,
        "handling": 8.0,
        "range": 4.6
      },
      "unlock": "Requires BuckMe bank account",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [
          "Optics",
          "Muzzle",
          "Magazine",
          "Grip",
          "Light"
        ],
        "examples": []
      },
      "calibre": "9mm",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "girardi-es9",
      "mag": 15,
      "maker": "Girardi",
      "name": "Girardi ES9",
      "notes": [
        "Jason's pistol (Rockstar-named)."
      ],
      "price": 700,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        },
        {
          "date": "2026-11-19",
          "field": "unlock",
          "name": "Pro Game Guides",
          "url": "https://progameguides.com/gta/best-weapons-in-gta-6/"
        }
      ],
      "stats": {
        "accuracy": 5.2,
        "damage": 4.2,
        "handling": 8.4,
        "range": 4.4
      },
      "unlock": "Free via 'Unwanted Attention' mission; also sold for $700",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "3-round burst",
      "group": "Sidearm",
      "id": "girardi-es18",
      "mag": 30,
      "maker": "Girardi",
      "name": "Girardi ES18",
      "notes": [
        "Accuracy/handling contested: Dexerto, fpsgen and The Games Wiki list 4.6 / 7.7; GTA6Info (DayOne), IGN, GTABase, guiasgta6 and Mobalytics list 4.4 / 8.2. Published as 4.4 / 8.2 (majority). Note: IGN lists the unique Guardian ES18 variant at 4.6 / 7.7, which may explain the split.",
        "Price: GTA6Direct lists 'Price not published yet' while Dexerto, GTA6Info, fpsgen and GTABase list $1,550."
      ],
      "price": 1550,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "IGN GTA 6 guide",
          "url": "https://www.ign.com/wikis/gta-6/"
        }
      ],
      "stats": {
        "accuracy": 4.4,
        "damage": 4.2,
        "handling": 8.2,
        "range": 4.8
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Sidearm",
      "id": "klose-k17-mcd",
      "mag": 24,
      "maker": "Klose",
      "name": "Klose K17 MCD",
      "notes": [
        "Handling contested: Dexerto, fpsgen and The Games Wiki list 7.7; GTA6Info (DayOne), IGN, GTABase, guiasgta6 and Mobalytics list 8.0. Published as 8.0 (majority)."
      ],
      "price": 1700,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/pistols/klose-k17-mcd/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.2,
        "damage": 4.0,
        "handling": 8.0,
        "range": 4.2
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "schlamm-drx",
      "mag": 17,
      "maker": "Schlamm",
      "name": "Schlamm DRX",
      "notes": [
        "Named without stats in GTA6Info's Weapons_List; stats from Dexerto, fpsgen, The Games Wiki and IGN, all agreeing 4.0 / 4.2 / 8.2 / 4.2."
      ],
      "price": 2100,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/pistols/schlamm-drx/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki",
          "url": "https://thegameswiki.com/gta6/wiki/schlamm-drx"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "IGN GTA 6 guide",
          "url": "https://www.ign.com/wikis/gta-6/"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 4.0,
        "handling": 8.2,
        "range": 4.2
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".50 Magnum",
      "class": "Pistols",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "fairview-kalinga-50",
      "mag": 7,
      "maker": "Fairview",
      "name": "Fairview Kalinga .50",
      "notes": [
        "Joint-hardest-hitting pistol (7.0 damage, shared with the Scorpio Akulus)."
      ],
      "price": 3100,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.0,
        "damage": 7.0,
        "handling": 7.8,
        "range": 5.0
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".38 Special",
      "class": "Revolvers",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "wortham-wcr1",
      "mag": 5,
      "maker": "Wortham",
      "name": "Wortham WCR1",
      "notes": [],
      "price": 600,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.8,
        "damage": 2.2,
        "handling": 9.0,
        "range": 4.5
      },
      "unlock": "Buy 4 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".38 Special",
      "class": "Revolvers",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "hawk-little-38",
      "mag": 6,
      "maker": "Hawk & Little",
      "name": "Hawk & Little .38",
      "notes": [],
      "price": 1075,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 5.0,
        "damage": 2.5,
        "handling": 8.6,
        "range": 4.5
      },
      "unlock": "Buy 4 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".357 Magnum",
      "class": "Revolvers",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "duke-mustang-357",
      "mag": 6,
      "maker": "Duke",
      "name": "Duke Mustang .357",
      "notes": [],
      "price": 1800,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.5,
        "damage": 5.7,
        "handling": 8.0,
        "range": 5.5
      },
      "unlock": "Buy 2 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".44 Magnum",
      "class": "Revolvers",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "scorpio-akulus",
      "mag": 6,
      "maker": "Scorpio",
      "name": "Scorpio Akulus",
      "notes": [
        "Joint-hardest-hitting pistol (7.0 damage, shared with the Fairview Kalinga .50)."
      ],
      "price": 3000,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 7.0,
        "handling": 7.6,
        "range": 6.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".44 Magnum",
      "class": "Revolvers",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Sidearm",
      "id": "hawk-little-morgan",
      "mag": 6,
      "maker": "Hawk & Little",
      "name": "Hawk & Little Morgan",
      "notes": [
        "Ultimate Edition revolver (Rockstar-named); not sold at Ammu-Nation, so no standard price."
      ],
      "price": null,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        },
        {
          "date": "2026-11-22",
          "field": "unlock",
          "name": "gta6.house",
          "url": "https://gta6.house/"
        }
      ],
      "stats": {
        "accuracy": 5.4,
        "damage": 5.7,
        "handling": 7.8,
        "range": 6.0
      },
      "unlock": "Ultimate Edition; unlocked at Ammu-Nation after the Chapter 2 mission 'Coffee Break' (reported)",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "vom-feuer-vf5",
      "mag": 30,
      "maker": "Vom Feuer",
      "name": "Vom Feuer VF5",
      "notes": [
        "All 8 SMGs share Damage 4.2; they differ only on Accuracy / Handling / Range."
      ],
      "price": 2325,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/submachine-guns/vom-feuer-vf5/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 5.0,
        "damage": 4.2,
        "handling": 6.7,
        "range": 4.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Sidearm",
      "id": "wortham-w-10",
      "mag": 20,
      "maker": "Wortham",
      "name": "Wortham W-10",
      "notes": [
        "Counts as a sidearm (small SMG) for the 2-sidearm carry limit."
      ],
      "price": 825,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.2,
        "damage": 4.2,
        "handling": 7.5,
        "range": 3.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Sidearm",
      "id": "zhang-wu-type-9",
      "mag": 10,
      "maker": "Zhang Wu",
      "name": "Zhang Wu Type 9",
      "notes": [
        "Counts as a sidearm (machine pistol) for the 2-sidearm carry limit."
      ],
      "price": 1100,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.8,
        "damage": 4.2,
        "handling": 7.8,
        "range": 3.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "3-round burst",
      "group": "Sidearm",
      "id": "deever-tech-dsg",
      "mag": 30,
      "maker": "Deever Tech",
      "name": "Deever Tech DSG",
      "notes": [
        "Counts as a sidearm for the 2-sidearm carry limit."
      ],
      "price": 1350,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 4.2,
        "handling": 6.9,
        "range": 4.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "vom-feuer-vf5c",
      "mag": 30,
      "maker": "Vom Feuer",
      "name": "Vom Feuer VF5C",
      "notes": [
        "Accuracy/handling contested: Dexerto, fpsgen and The Games Wiki list 4.0 / 7.9; GTA6Info (DayOne), IGN, guiasgta6 and Mobalytics list 5.0 / 6.9. Published as 5.0 / 6.9 (majority)."
      ],
      "price": 2600,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/submachine-guns/vom-feuer-vf5c/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 5.0,
        "damage": 4.2,
        "handling": 6.9,
        "range": 4.0
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "schlamm-dw-9",
      "mag": 30,
      "maker": "Schlamm",
      "name": "Schlamm DW-9",
      "notes": [],
      "price": 1750,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.5,
        "damage": 4.2,
        "handling": 6.8,
        "range": 4.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "9mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "bzi-vatra",
      "mag": 20,
      "maker": "BZI",
      "name": "BZI Vatra",
      "notes": [],
      "price": 1200,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.8,
        "damage": 4.2,
        "handling": 6.5,
        "range": 4.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [
          "Muzzle",
          "Magazine",
          "Light",
          "Grip",
          "Optics"
        ],
        "examples": []
      },
      "calibre": "5.7x28mm",
      "class": "SMGs",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "adb-pd-90",
      "mag": 30,
      "maker": "AdB",
      "name": "AdB PD-90",
      "notes": [
        "GTA6Info's stats table names this gun 'AdB PD-80'; its own price table, Dexerto, fpsgen, The Games Wiki, tracker.gg and Beebom all call it PD-90. Roster uses PD-90.",
        "Price marked disputed (*) in GTA6Info's price table; Dexerto, fpsgen, tracker.gg, The Games Wiki and Beebom all list $3,350."
      ],
      "price": 3350,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/submachine-guns/adb-pd-90/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-19",
          "field": "price",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/submachine-guns/adb-pd-90/"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki",
          "url": "https://thegameswiki.com/gta6/wiki/adb-pd-90"
        },
        {
          "date": "2026-11-24",
          "field": "unlock",
          "name": "Beebom",
          "url": "https://beebom.com/gta-6-best-weapons/"
        }
      ],
      "stats": {
        "accuracy": 4.8,
        "damage": 4.2,
        "handling": 6.6,
        "range": 4.2
      },
      "unlock": "Buy 13 more weapons to unlock (Beebom, single source)",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Break action",
      "group": "Longarm",
      "id": "mason-keen-longshot",
      "mag": 2,
      "maker": "Mason & Keen",
      "name": "Mason & Keen Longshot",
      "notes": [],
      "price": 1425,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        }
      ],
      "stats": {
        "accuracy": 4.1,
        "damage": 8.0,
        "handling": 5.0,
        "range": 2.5
      },
      "unlock": "Buy 2 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [
          "Barrel",
          "Foregrip",
          "Forend",
          "Optics",
          "Light",
          "Magazine",
          "Muzzle",
          "Grip",
          "Saddle",
          "Stock"
        ],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Pump action",
      "group": "Longarm",
      "id": "fortune-moreland-850",
      "mag": 5,
      "maker": "Fortune & Son",
      "name": "Fortune & Son Moreland 850",
      "notes": [
        "Sale price $350 is the first-visit / Gear Up mission price; standard price $700 (GamesRadar+; howtovideogame PS5 recording). fpsgen lists it as free in the story (given early in the story). fpsgen lists handling 5.2; vAnother Level read 5.6 on screen (MELOO, Ben-Gun), so 5.6 ships.",
        "Attachment slots read on screen by vAnother Level (Moreland 850 Modify menu): Barrels, Foregrips, Forends, Iron Sights, Lights, Magazines, Muzzles & Suppressors, Optics, Pistol Grips, Saddles, Stocks."
      ],
      "price": 700,
      "provenance": "on-screen",
      "salePrice": 350,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        },
        {
          "date": "2026-11-22",
          "field": "salePrice",
          "name": "howtovideogame",
          "url": "https://howtovideogame.com/"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 7.5,
        "handling": 5.6,
        "range": 2.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "girardi-verro",
      "mag": 5,
      "maker": "Girardi",
      "name": "Girardi Verro",
      "notes": [],
      "price": 2700,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.9,
        "damage": 7.4,
        "handling": 6.5,
        "range": 2.0
      },
      "unlock": "Buy 4 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "girardi-az1200",
      "mag": 5,
      "maker": "Girardi",
      "name": "Girardi AZ1200",
      "notes": [
        "vAnother Level read 7.4 / 4.8 / 5.8 / 2.5 on screen, but noted the $3,460 menu price 'includes weapon and mods' — the 4.8 accuracy is a modded read. Stock accuracy 4.5 ships (GTA6Info, fpsgen)."
      ],
      "price": 2300,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.5,
        "damage": 7.4,
        "handling": 5.8,
        "range": 2.5
      },
      "unlock": "Buy 4 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Pump action",
      "group": "Longarm",
      "id": "fortune-gorse-425",
      "mag": 5,
      "maker": "Fortune & Son",
      "name": "Fortune & Son Gorse 425",
      "notes": [],
      "price": 850,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        }
      ],
      "stats": {
        "accuracy": 3.8,
        "damage": 7.5,
        "handling": 6.2,
        "range": 2.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Break action",
      "group": "Longarm",
      "id": "shrewsbury-drifter",
      "mag": 2,
      "maker": "Shrewsbury",
      "name": "Shrewsbury Drifter",
      "notes": [
        "Double-barrel (side-by-side); the plan's earlier note that the Moreland 850 fires 'both barrels at once' is wrong — the Drifter is the double-barrel."
      ],
      "price": 1150,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        }
      ],
      "stats": {
        "accuracy": 4.1,
        "damage": 8.0,
        "handling": 5.0,
        "range": 2.5
      },
      "unlock": "Requires BuckMe bank account",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Break action",
      "group": "Longarm",
      "id": "shrewsbury-hobo",
      "mag": 2,
      "maker": "Shrewsbury",
      "name": "Shrewsbury Hobo",
      "notes": [],
      "price": 1325,
      "provenance": "on-screen",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        }
      ],
      "stats": {
        "accuracy": 3.6,
        "damage": 8.0,
        "handling": 6.4,
        "range": 2.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Break action",
      "group": "Longarm",
      "id": "mason-keen-shortstraw",
      "mag": 2,
      "maker": "Mason & Keen",
      "name": "Mason & Keen Shortstraw",
      "notes": [],
      "price": 1625,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.6,
        "damage": 8.0,
        "handling": 6.4,
        "range": 2.0
      },
      "unlock": "Buy 2 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "goodwin-comshot-12",
      "mag": 7,
      "maker": "Goodwin",
      "name": "Goodwin Comshot 12",
      "notes": [
        "Highest damage (7.7) of the magazine-fed shotguns."
      ],
      "price": 3825,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 7.7,
        "handling": 4.0,
        "range": 2.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "girardi-super400",
      "mag": 7,
      "maker": "Girardi",
      "name": "Girardi Super400",
      "notes": [],
      "price": 2825,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.2,
        "damage": 7.4,
        "handling": 5.3,
        "range": 2.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "12-gauge",
      "class": "Shotguns",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "kozlov-kvga-12",
      "mag": 8,
      "maker": "Kozlov",
      "name": "Kozlov KVGA-12",
      "notes": [
        "The only full-auto shotgun."
      ],
      "price": 3650,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/shotguns/kozlov-kvga-12/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.5,
        "damage": 7.2,
        "handling": 5.1,
        "range": 2.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x39mm",
      "class": "Assault Rifles",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "kozlov-kz-59",
      "mag": 30,
      "maker": "Kozlov",
      "name": "Kozlov KZ-59",
      "notes": [
        "A unique zombie-artwork KZ-59 is sold only at Rodgers Ranch for $2,630, after gold on all its shooting ranges (GTA6Info) — a variant, not this base gun."
      ],
      "price": 1250,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/assault-rifles/kozlov-kz-59/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 5.2,
        "damage": 5.4,
        "handling": 5.2,
        "range": 6.5
      },
      "unlock": "Buy 2 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "5.56x45mm",
      "class": "Assault Rifles",
      "extendedMag": null,
      "fireMode": "3-round burst",
      "group": "Longarm",
      "id": "hillinger-heathen",
      "mag": null,
      "maker": "Hillinger",
      "name": "Hillinger Heathen",
      "notes": [
        "Magazine size not published: GTA6Info lists '-', vAnother Level lists '?'. Left null, never guessed."
      ],
      "price": 2450,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 6.2,
        "damage": 5.0,
        "handling": 5.8,
        "range": 6.2
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [
          "Barrel",
          "Grip",
          "Light",
          "Magazine",
          "Muzzle",
          "Optics",
          "Stock"
        ],
        "examples": []
      },
      "calibre": "5.56x45mm",
      "class": "Assault Rifles",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "duke-556",
      "mag": 30,
      "maker": "Duke",
      "name": "Duke 556",
      "notes": [
        "Contested figure resolved: Dexerto, GTA6Info, vAnother Level (on screen), Exputer, guiasgta6, Pro Game Guides, gta6heists, The Games Wiki, libertycity, theleonida ('checked in the game on PS5, Nov 19') and MeowDB ('seen in gameplay') all agree 6.0 / 5.8 / 6.2. Beebom alone lists 6.8 / 5.0 / 5.8 — the outlier. RetroBroker notes early captures show range 5.5–6.2."
      ],
      "price": 1450,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/assault-rifles/duke-556/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "The Leonida",
          "url": "https://theleonida.com/weapons/duke-556"
        }
      ],
      "stats": {
        "accuracy": 6.0,
        "damage": 5.0,
        "handling": 5.8,
        "range": 6.2
      },
      "unlock": "Requires BuckMe bank account",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x39mm",
      "class": "Assault Rifles",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "kozlov-hind",
      "mag": 30,
      "maker": "Kozlov",
      "name": "Kozlov Hind",
      "notes": [
        "Accuracy/handling contested: Dexerto, fpsgen and MeowDB ('seen in gameplay') list 3.5 / 7.1; GTA6Info (DayOne), guiasgta6, Mobalytics, gta6codes and gta6heists list 4.5 / 6.1. Published as 4.5 / 6.1 (majority)."
      ],
      "price": 1700,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/assault-rifles/kozlov-hind/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.5,
        "damage": 5.4,
        "handling": 6.1,
        "range": 4.5
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "5.56x45mm",
      "class": "Assault Rifles",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "vom-feuer-vf-g1",
      "mag": 30,
      "maker": "Vom Feuer",
      "name": "Vom Feuer VF-G1",
      "notes": [
        "Joint-best assault-rifle accuracy (6.2, shared with the Hillinger Heathen) and best assault-rifle range (6.5)."
      ],
      "price": 3700,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 6.2,
        "damage": 5.0,
        "handling": 5.8,
        "range": 6.5
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x51mm",
      "class": "Assault Rifles",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "adb-fra",
      "mag": 20,
      "maker": "AdB",
      "name": "AdB FRA",
      "notes": [
        "Highest assault-rifle damage (5.8) and range (6.9)."
      ],
      "price": 2900,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 5.0,
        "damage": 5.8,
        "handling": 5.3,
        "range": 6.9
      },
      "unlock": "Buy 2 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".22 LR",
      "class": "Tactical Rifles",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "wortham-w-22",
      "mag": 15,
      "maker": "Wortham",
      "name": "Wortham W-22",
      "notes": [
        "Weakest gun in the game (1.5 damage); small-game rifle, not a combat rifle. Some guides class it as a sniper rifle; guiasgta6 classes it as a tactical rifle — shipped as Tactical Rifles.",
        "Accuracy contested by one source: MeowDB lists a 'modded' read of 8.8 accuracy / 5.0 handling / 7.8 range; GTA6Info, guiasgta6, HeistAtlas, Game8, GTABase and Exputer all list 8.0 / 5.8 / 7.0. Published as 8.0 / 5.8 / 7.0.",
        "Price left null: Game8 lists $1,100 (single source); GTA6Info's price table omits the W-22 and GTABase lists no price."
      ],
      "price": null,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-18",
          "field": "stats",
          "name": "guiasgta6",
          "url": "https://www.guiasgta6.com/en/weapons/wortham-w-22-gta-6/"
        },
        {
          "date": "2026-11-20",
          "field": "stats",
          "name": "HeistAtlas",
          "url": "https://heistatlas.com/en/database/weapons/wortham-w-22/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "Game8",
          "url": "https://game8.co/games/gta-6/archives/639071"
        }
      ],
      "stats": {
        "accuracy": 8.0,
        "damage": 1.5,
        "handling": 5.8,
        "range": 7.0
      },
      "unlock": "Hunting Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x51mm",
      "class": "Tactical Rifles",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "hillinger-m306",
      "mag": 20,
      "maker": "Hillinger",
      "name": "Hillinger M306",
      "notes": [],
      "price": 2375,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 7.5,
        "damage": 6.2,
        "handling": 4.8,
        "range": 7.5
      },
      "unlock": "Buy 4 more guns to unlock",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [
          "Optics",
          "Muzzle",
          "Magazine",
          "Barrel",
          "Grip",
          "Light"
        ],
        "examples": [
          {
            "effect": "+0.4 Handling, -0.4 Range",
            "name": "14\" Carbine barrel",
            "price": 320,
            "source": "Dexerto Mediator page, opened 22 Nov 2026"
          },
          {
            "effect": "Accuracy 7.8 to 8.0, Handling 5.6 to 5.4",
            "name": "Stiff Tip Micro sight",
            "price": 65,
            "source": "howtovideogame, own PS5 recording"
          }
        ]
      },
      "calibre": "9mm",
      "class": "Tactical Rifles",
      "extendedMag": 24,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "hawk-little-mediator",
      "mag": 17,
      "maker": "Hawk & Little",
      "name": "Hawk & Little Mediator",
      "notes": [
        "Sale price $450 is the first-visit / Gear Up mission price; standard price $900 (howtovideogame PS5 recording; Dexerto).",
        "Magazine contested: GTA6Info, Dexerto and playday.one list 17; vAnother Level's stream read showed 24 on the menu. Ships as 17 with 24 as the extended magazine (24-rd $110, $55 sale; 33-rd $130 also published by RetroBroker)."
      ],
      "price": 900,
      "provenance": "on-screen",
      "salePrice": 450,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "vAnother Level every-weapon (ON SCREEN)",
          "url": "https://vanotherlevel.com/gta-6-every-weapon/"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/tactical-rifles/hawk-little-mediator/"
        },
        {
          "date": "2026-11-22",
          "field": "salePrice",
          "name": "howtovideogame",
          "url": "https://howtovideogame.com/"
        }
      ],
      "stats": {
        "accuracy": 7.8,
        "damage": 4.8,
        "handling": 5.6,
        "range": 7.0
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "5.56x45mm",
      "class": "Tactical Rifles",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "wortham-w-14",
      "mag": 20,
      "maker": "Wortham",
      "name": "Wortham W-14",
      "notes": [],
      "price": 1400,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 7.5,
        "damage": 5.8,
        "handling": 5.2,
        "range": 7.2
      },
      "unlock": null,
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x51mm",
      "class": "Tactical Rifles",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "hillinger-m306-tmr",
      "mag": 20,
      "maker": "Hillinger",
      "name": "Hillinger M306 TMR",
      "notes": [],
      "price": 2550,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 7.8,
        "damage": 6.2,
        "handling": 5.5,
        "range": 7.5
      },
      "unlock": "Gold on all shooting range challenges",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".338 Magnum",
      "class": "Sniper Rifles",
      "extendedMag": null,
      "fireMode": "Bolt action",
      "group": "Longarm",
      "id": "fairview-ff-sr",
      "mag": 10,
      "maker": "Fairview",
      "name": "Fairview FF-SR",
      "notes": [
        "Sniper-set conflict: GTA6Info (DayOne) lists 7.5 accuracy / 3.8 handling / 7.5 range; fpsgen, The Games Wiki and gamex list 8.3 / 2.9 / 8.4. Published as 8.3 / 2.9 / 8.4 (majority + store-screen claims)."
      ],
      "price": 2950,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki (Laird 350 sniper comparison table)",
          "url": "https://thegameswiki.com/gta6/wiki/fortune-son-laird-350"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List (dissenting figure)",
          "url": "https://gta6info.com/wiki/Weapons_List"
        }
      ],
      "stats": {
        "accuracy": 8.3,
        "damage": 8.0,
        "handling": 2.9,
        "range": 8.4
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x51mm",
      "class": "Sniper Rifles",
      "extendedMag": null,
      "fireMode": "Bolt action",
      "group": "Longarm",
      "id": "shrewsbury-sm-69",
      "mag": 5,
      "maker": "Shrewsbury",
      "name": "Shrewsbury SM-69",
      "notes": [
        "Sniper-set conflict: GTA6Info (DayOne) lists 7.6 accuracy / 4.0 handling / 7.5 range; fpsgen and The Games Wiki list 8.4 / 3.1 / 8.4. Published as 8.4 / 3.1 / 8.4 (majority + store-screen claims). A free unique SM-69 ('Killtelligence SM-69') is given by Bret on his first hunting quest — a variant, not this base gun."
      ],
      "price": 1850,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki (Laird 350 sniper comparison table)",
          "url": "https://thegameswiki.com/gta6/wiki/fortune-son-laird-350"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List (dissenting figure)",
          "url": "https://gta6info.com/wiki/Weapons_List"
        }
      ],
      "stats": {
        "accuracy": 8.4,
        "damage": 6.8,
        "handling": 3.1,
        "range": 8.4
      },
      "unlock": "Buy 2 more guns to unlock; Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": null,
      "class": "Sniper Rifles",
      "extendedMag": null,
      "fireMode": "Bolt action",
      "group": "Longarm",
      "id": "shrewsbury-sms-01",
      "mag": null,
      "maker": "Shrewsbury",
      "name": "Shrewsbury SMS-01",
      "notes": [
        "Named without stats in GTA6Info's Weapons_List; stats from fpsgen and The Games Wiki, agreeing 6.8 / 8.6 / 3.3 / 8.4. gta6codes.fr also lists it as the most accurate gun (8.6) with range 8.4.",
        "Magazine size and calibre not published in the sources checked — left null, never guessed."
      ],
      "price": 2150,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki (Laird 350 sniper comparison table)",
          "url": "https://thegameswiki.com/gta6/wiki/fortune-son-laird-350"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        }
      ],
      "stats": {
        "accuracy": 8.6,
        "damage": 6.8,
        "handling": 3.3,
        "range": 8.4
      },
      "unlock": "After Bret's ninth hunting quest; Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "6.5mm",
      "class": "Sniper Rifles",
      "extendedMag": null,
      "fireMode": "Bolt action",
      "group": "Longarm",
      "id": "fortune-laird-350",
      "mag": 5,
      "maker": "Fortune & Son",
      "name": "Fortune & Son Laird 350",
      "notes": [
        "Accuracy conflict — RESOLVED toward 8.8 (see addendum (b)): Dexerto, MeowDB ('seen in gameplay'), GrindStat, fpsgen ('every stat comes from the Ammu-Nation screens'), The Games Wiki ('as the store shows them for the stock guns'), libertycity and Power Up Gaming all list 8.8 accuracy / 3.6 handling / 8.4 range. GTA6Info's DayOne table alone lists 8.0 / 4.5 / 7.5 (its own 'Quick picks' section previously said 8.8). Published as 8.8 / 3.6 / 8.4. Cheapest sniper; most accurate gun in the store."
      ],
      "price": 950,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/sniper-rifles/fortune-son-laird-350/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki (Laird 350 sniper comparison table)",
          "url": "https://thegameswiki.com/gta6/wiki/fortune-son-laird-350"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List (dissenting figure)",
          "url": "https://gta6info.com/wiki/Weapons_List"
        }
      ],
      "stats": {
        "accuracy": 8.8,
        "damage": 6.5,
        "handling": 3.6,
        "range": 8.4
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": ".50 BMG",
      "class": "Sniper Rifles",
      "extendedMag": null,
      "fireMode": "Bolt action",
      "group": "Longarm",
      "id": "fairview-ff-50",
      "mag": 5,
      "maker": "Fairview",
      "name": "Fairview FF-50",
      "notes": [
        "Highest-damage sniper (8.5). Accuracy contested: GTA6Info (DayOne) lists 7.0; fpsgen and The Games Wiki list 7.8; RetroBroker notes early captures show 7.8-8.5. Published as 7.8 (lower end of the observed range). Handling/range: GTA6Info lists 3.5 / 7.5; fpsgen, The Games Wiki and RetroBroker list 2.5 / 8.5.",
        "Calibre: GTA6Info's table prints '.50 BFG', read as .50 BMG per RetroBroker."
      ],
      "price": 3975,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "The Games Wiki (Laird 350 sniper comparison table)",
          "url": "https://thegameswiki.com/gta6/wiki/fortune-son-laird-350"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List (dissenting figure)",
          "url": "https://gta6info.com/wiki/Weapons_List"
        }
      ],
      "stats": {
        "accuracy": 7.8,
        "damage": 8.5,
        "handling": 2.5,
        "range": 8.5
      },
      "unlock": "Expanded Ammu-Nation stores only; requires bank account",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "7.62x51mm",
      "class": "Machine Guns",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "goodwin-lmg-6",
      "mag": 100,
      "maker": "Goodwin",
      "name": "Goodwin LMG 6",
      "notes": [
        "Price single-source: Dexerto alone lists $15,250 ('price and stats confirmed from in-game shop screen'); GTA6Info's Best Weapons page says 'No published price yet' and its price table omits the LMG 6. Stats (6.8 / 2.8 / 2.8 / 6.5) agree across GTA6Info, IGN, guiasgta6 and Dexerto."
      ],
      "price": 15250,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/machine-guns/goodwin-lmg-6/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "price",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/machine-guns/goodwin-lmg-6/"
        }
      ],
      "stats": {
        "accuracy": 2.8,
        "damage": 6.8,
        "handling": 2.8,
        "range": 6.5
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "single-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "5.56x45mm",
      "class": "Machine Guns",
      "extendedMag": null,
      "fireMode": "Full auto",
      "group": "Longarm",
      "id": "adb-m350",
      "mag": 100,
      "maker": "AdB",
      "name": "AdB M350",
      "notes": [],
      "price": 10000,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 3.0,
        "damage": 6.5,
        "handling": 3.2,
        "range": 6.2
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "40mm grenade",
      "class": "Launchers",
      "extendedMag": null,
      "fireMode": "Single shot",
      "group": "Longarm",
      "id": "hillinger-boomer",
      "mag": 1,
      "maker": "Hillinger",
      "name": "Hillinger Boomer",
      "notes": [
        "Joint-highest damage with the GLR40 (9.2)."
      ],
      "price": 12000,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 5.0,
        "damage": 9.2,
        "handling": 6.0,
        "range": 4.0
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "40mm grenade",
      "class": "Launchers",
      "extendedMag": null,
      "fireMode": "Semi-auto",
      "group": "Longarm",
      "id": "deever-tech-glr40",
      "mag": 6,
      "maker": "Deever Tech",
      "name": "Deever Tech GLR40",
      "notes": [
        "Price marked disputed (*) in GTA6Info's price table; Dexerto, guiasgta6, The Games Wiki and Exputer all list $15,500. One guide says the free GLR40 (Sunrise Motel store room, Tequesta) is not a unique weapon — it is the same base gun, free."
      ],
      "price": 15500,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/launchers/deever-tech-glr40/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 6.0,
        "damage": 9.2,
        "handling": 5.0,
        "range": 4.0
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    },
    {
      "attachments": {
        "categories": [],
        "examples": []
      },
      "calibre": "66mm rocket",
      "class": "Launchers",
      "extendedMag": null,
      "fireMode": "Single shot",
      "group": "Longarm",
      "id": "hauners-h-at",
      "mag": 1,
      "maker": "Hauners",
      "name": "Hauners H-AT",
      "notes": [
        "Highest damage rating in the game (9.6). Buyability contested: one guide says 'rockets cannot be bought'; Dexerto lists it as sold at Expanded Ammu-Nation stores for $16,000, and several guides report a free H-AT in the Balsero bunker (under an RV near Griffin Shooting Range)."
      ],
      "price": 16000,
      "provenance": "reported",
      "salePrice": null,
      "sources": [
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-19",
          "field": "stats",
          "name": "Dexerto GTA 6 Wiki",
          "url": "https://www.dexerto.com/wikis/gta-6/weapons/launchers/hauners-h-at/"
        },
        {
          "date": "2026-11-24",
          "field": "stats",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "GTA6Info Weapons_List",
          "url": "https://gta6info.com/wiki/Weapons_List"
        },
        {
          "date": "2026-11-24",
          "field": "price",
          "name": "fpsgen weapons list",
          "url": "https://fpsgen.com/games/gta-6/weapons"
        }
      ],
      "stats": {
        "accuracy": 4.5,
        "damage": 9.6,
        "handling": 3.0,
        "range": 8.0
      },
      "unlock": "Expanded Ammu-Nation stores only",
      "verified": "two-source"
    }
  ]
};

var CLASS_NAMES = {"Assault Rifles": "بنادق هجومية (Assault Rifles)", "Launchers": "قاذفات (Launchers)", "Machine Guns": "مدافع رشاشة (Machine Guns)", "Pistols": "مسدسات (Pistols)", "Revolvers": "مسدسات دوارة (Revolvers)", "SMGs": "رشاشات صغيرة (SMGs)", "Shotguns": "بنادق الشوزن (Shotguns)", "Sniper Rifles": "بنادق قنص (Sniper Rifles)", "Tactical Rifles": "بنادق تكتيكية (Tactical Rifles)"};
var FIREMODE = {"3-round burst": "رشقات من 3 طلقات", "Bolt action": "بالترباس", "Break action": "بكسر الماسورة", "Full auto": "آلي بالكامل", "Pump action": "بالمضخة", "Semi-auto": "شبه آلي", "Single shot": "طلقة واحدة"};

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
        console.warn("weapon-comparison: baked last-checked stamp differed from data; corrected to " + DATA.lastChecked);
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
  for (var i = 0; i < DATA.weapons.length; i++) {
    if (DATA.weapons[i].id === id) return DATA.weapons[i];
  }
  return null;
}

function classes() {
  var seen = {}, out = [];
  DATA.weapons.forEach(function (w) {
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
  return '<div class="balance-bars"><div><div class="balance-bar-head"><span class="lbl">' + esc(label) + ': A</span><span class="val">' + fmtStat(a) + ' / 10</span></div>' +
    '<div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + aw + '%"></div></div></div>' +
    '<div><div class="balance-bar-head"><span class="lbl">' + esc(label) + ': B</span><span class="val">' + fmtStat(b) + ' / 10</span></div>' +
    '<div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + bw + '%"></div></div></div>' +
    '<p class="field-hint">' + pill + '</p></div>';
}

function detailRow(label, a, b) {
  return '<div><dt>' + esc(label) + ': A</dt><dd>' + a + '</dd></div>' +
    '<div><dt>' + esc(label) + ': B</dt><dd>' + b + '</dd></div>';
}

function renderCompare() {
  var host = document.querySelector("[data-output-panel]");
  var selA = document.querySelector("[data-weapon-a]");
  var selB = document.querySelector("[data-weapon-b]");
  if (!host || !selA || !selB) return;
  var a = byId(selA.dataset.selectedId), b = byId(selB.dataset.selectedId);
  if (!a || !b) return;
  var aSale = a.salePrice != null ? ' <span class="field-hint">(مخفض ' + fmtPrice(a.salePrice) + ')</span>' : "";
  var bSale = b.salePrice != null ? ' <span class="field-hint">(مخفض ' + fmtPrice(b.salePrice) + ')</span>' : "";
  var html = '<div class="verdict-body"><div><p class="verdict-kicker">' + (CLASS_NAMES[a["class"]] || esc(a["class"])) + ' vs ' + (CLASS_NAMES[b["class"]] || esc(b["class"])) + '</p>' +
    '<h3 class="verdict-title">' + esc(a.name) + ' <span class="unit">vs</span> ' + esc(b.name) + '</h3>' +
    '<p class="verdict-desc">الضرر والدقة وسرعة التحكم والمدى هي تقييمات اللعبة نفسها من 10, وليست نقاط صحة. ' + esc(a.name) + ': ' + badge(a) + '. ' + esc(b.name) + ': ' + badge(b) + '.</p></div></div>' +
    ratingBar("الضرر", a.stats.damage, b.stats.damage) +
    ratingBar("الدقة", a.stats.accuracy, b.stats.accuracy) +
    ratingBar("سرعة التحكم", a.stats.handling, b.stats.handling) +
    ratingBar("المدى", a.stats.range, b.stats.range) +
    '<dl class="stat-grid">' +
    detailRow("المخزن", a.mag != null ? String(a.mag) + (a.extendedMag != null ? " (ext. " + a.extendedMag + ")" : "") : "—",
      b.mag != null ? String(b.mag) + (b.extendedMag != null ? " (ext. " + b.extendedMag + ")" : "") : "—") +
    detailRow("وضع الإطلاق", esc(FIREMODE[a.fireMode] || a.fireMode || "—"), esc(FIREMODE[b.fireMode] || b.fireMode || "—")) +
    detailRow("العيار", esc(a.calibre || "—"), esc(b.calibre || "—")) +
    detailRow("السعر", fmtPrice(a.price) + aSale, fmtPrice(b.price) + bSale) +
    detailRow("الفتح", esc(a.unlock || "—"), esc(b.unlock || "—")) +
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
  var selA = document.querySelector("[data-weapon-a]");
  var selB = document.querySelector("[data-weapon-b]");
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
  var noResultsText = emptyCell ? emptyCell.textContent.trim() : "No guns match your search.";
  var form = document.querySelector("#weapon-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  var combos = {};
  function firstInClass(v, notId) {
    var list = v === "all" ? DATA.weapons : DATA.weapons.filter(function (w) { return w["class"] === v; });
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
      var hay = (w.name + " " + w["class"] + " " + classLabel(w["class"])).toLowerCase();
      return hay.indexOf(q) !== -1;
    }
    function openList(q) {
      var query = q == null ? "" : String(q).trim().toLowerCase();
      var groups = {};
      cls.forEach(function (c) { groups[c] = []; });
      DATA.weapons.forEach(function (w) { if (matches(w, query)) groups[w["class"]].push(w); });
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
      for (var i = 0; i < DATA.weapons.length; i++) {
        var w = DATA.weapons[i];
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
  if (!byId(aId)) aId = "girardi-es9";
  var bId = params.get("b");
  if (!byId(bId)) bId = "klose-k17";
  combos.a = setupCombo(selA, document.querySelector("#weapon-a-listbox"), "a");
  combos.b = setupCombo(selB, document.querySelector("#weapon-b-listbox"), "b");
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
  var rows = document.querySelectorAll("[data-weapons-rows] tr:not([data-table-empty])");
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
  if (count) count.textContent = "عرض " + shown + " من أصل " + DATA.weapons.length + " سلاحًا.";
}

syncStamps();
populateSelects();
var searchInput = document.querySelector("[data-table-search]");
if (searchInput) searchInput.addEventListener("input", filterTable);
filterTable();
