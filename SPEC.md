# Medjet — Entity System Spec

## Overview

A single unified **Entities** system covering deities, spirits, mythological beings, and ancestors across all pantheons and practices. Practice-agnostic by design. No hierarchy between cultures.

---

## Taxonomy

### Entity Types
| Value | Description |
|-------|-------------|
| `deity` | Divine beings within a pantheon |
| `spirit` | Non-deity spiritual entities |
| `mythological` | Creatures, beings, and forces from mythology |
| `ancestor` | Venerated dead and cultural heroes |

> No "monster" classification.

### Prominence
| Value | Description |
|-------|-------------|
| `major` | Cosmically central within their culture |
| `minor` | Regionally significant or specialized role |

Prominence is **per-culture only** — not a cross-pantheon value judgment.

---

## Data Fields

### Field Guide / Seed JSON (reference data)
```json
{
  "name": "Anubis",
  "epithets": ["Lord of the Sacred Land", "He Who is Upon His Mountain"],
  "pantheon": "Kemetic",
  "culture": "Ancient Egyptian",
  "period": "3100 BCE – 400 CE",
  "type": "deity",
  "prominence": "major",
  "domain": ["death", "mummification", "transition", "judgment"],
  "symbols": ["jackal", "scales", "flail"],
  "consort": "Anput",
  "associations": {
    "element": "Earth",
    "planet": "Saturn"
  },
  "description": "...",
  "historic_data": "...",
  "wikipedia": "https://en.wikipedia.org/wiki/Anubis"
}
```

### Personal Card Fields (user-generated, local only)
```json
{
  "notes": "",
  "upg": "",
  "offerings": "",
  "first_contact": "",
  "working_since": "",
  "working_with": false,
  "source": "field-guide | manual"
}
```

---

## Seed Pantheons

Initial dataset targets commonly worked-with entities across major traditions:

| Pantheon | Culture |
|----------|---------|
| Kemetic | Ancient Egyptian |
| Greek | Ancient Greek |
| Roman | Ancient Roman |
| Norse | Norse/Germanic |
| Hindu | South Asian |
| Nahuatl | Aztec/Mesoamerican |
| Japanese | Shinto |
| Celtic | Celtic European |
| Yoruba/Orisha | West African |
| Mesopotamian | Sumerian/Babylonian |
| Slavic | Eastern European |

Start Kemetic-heavy, baseline coverage across all listed pantheons. Expand via community contribution later.

---

## Filtering — No Dropdowns

All filters use **pill/chip toggles**. Tap to activate, tap again to deactivate. Multiple filters active simultaneously. No dropdowns anywhere in this system.

### Filter Groups

**Working With** *(top of page, prominent)*
`All` · `Working With`

**By Type**
`All` · `Deity` · `Spirit` · `Mythological` · `Ancestor`

**By Prominence**
`All` · `Major` · `Minor`

**By Pantheon** *(horizontally scrollable row, dynamically generated from available data)*
`Kemetic` · `Greek` · `Norse` · `Hindu` · `Nahuatl` · `Japanese` · `Celtic` · `Yoruba` · `Mesopotamian` · `Slavic` · `...`

> Pantheon pills are generated dynamically from the JSON — adding new pantheons to the dataset automatically adds them to the filter row. No code changes required.

---

## Working With Flow

### Marking from Field Guide
1. User finds entity in field guide
2. Taps **"Working With"** toggle on entry
3. System checks personal registry:
   - **Entity exists** → sets `working_with: true` only
   - **Entity doesn't exist** → auto-generates personal card with all reference fields pre-filled, personal fields blank, `source: "field-guide"`
4. Entity appears in Entities page under **Working With** filter
5. User opens card and fills personal fields at any time

### Removing Working With
- Toggle off in field guide → sets `working_with: false`
- Does **not** delete the personal card or any user notes
- Card remains in registry, filtered out of Working With view only

---

## UI Notes

- Filter pill rows sit at top of Entities page
- Pantheon row scrolls independently — layout never breaks as pantheons are added
- Field guide entity cards display a small **"Working With"** chip if already marked
- Auto-generated cards display a subtle **"from field guide"** indicator
- Manually created cards have no source indicator
- No dropdowns. Anywhere. Ever.

---

## Architecture Notes

- **Local only** for now — no sync, no backend
- Personal registry hooks into existing `useEntityList` / `DeityCard` / `DeityList` architecture
- Field guide reads from static seed JSON
- Working With state stored in localStorage alongside other inventory data
- `source` flag distinguishes auto-generated vs manual entries

---

## Build Order

1. Seed JSON — Kemetic first, baseline across all pantheons
2. Filter pill component — reusable, will be needed elsewhere
3. Field guide entity view — reference cards with Working With toggle
4. Working With → auto-generate personal card flow
5. Entities page with filter system
6. Hook into existing DeityCard/DeityList without breaking current functionality