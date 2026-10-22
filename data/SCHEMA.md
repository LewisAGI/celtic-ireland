# Content schema

`content.json` and `sources.json` are the v1 pack (see `data/README.md`). The app reads that shape. It does not rename fields.

## content.json

```json
{
  "meta": { "pack": "celtic-ireland", "version": 1, "created": "2026-10-22" },
  "history": [Entry],
  "cycles": [Entry],
  "places": [Entry]
}
```

Entries are grouped by section. `history`, `cycles`, and `places` are required. Any further array beside `meta` is treated as another section, in file order after those three.

### Entry

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique across the pack |
| `text` | yes | The sourced note |
| `sources` | yes | One or more ids from `sources.json` |
| `label` | yes | Raw label from the pack |
| `coords` | no | `{ lat, lon, source_format? }` or `null`. Only a numeric lat/lon is mapped. `null` or a missing field is listed and has no pin |
| `uncertainty` | no | Shown with the entry |
| `sensitivity` | no | Shown with the entry |
| `debate` | no | `true` marks the note for the ‘Celts’ label panel |
| `name` | no | Section title, used for cycle names |
| `note` | no | Pack note, shown with the entry |
| `status` | no | `sourced` (assumed when omitted), `placeholder`, or `example` |

`placeholder` and `example` must render the visible words **Example data**. The v1 pack has neither, so the site shows none.

### Badge

The raw `label` is kept. The badge is one of `evidence`, `inference`, or `abstract-only`:

- `abstract-only` when the label says the source was an abstract, a summary, a snippet, or that the full text was not read
- otherwise `inference` when the label says inference
- otherwise `evidence`

`abstract-only` wins over `inference`, so a conclusion taken from an unread paper is not badged as if the paper had been read. A parenthetical in the raw label is shown beside the badge.

### Coordinates

`source_format` is the DMS string the decimal pair was converted from, for example `N53 41 40.9 W6 28 31.8`. The decimals are site centroids from UNESCO. A `null` coordinate is not invented: Navan Fort / Emain Macha, the Children of Lir places, Cooley, and the Sligo complexes stay unpinned. Tara has a tentative-list coordinate and is pinned.

### Periods

The timeline only lights an entry when its own text names the period: Neolithic, Iron Age, or early medieval. It does not assign a year the pack does not give.

## sources.json

Array of `{ id, title, author_org, url, date_accessed, quality }`. Every entry source id must resolve. `quality` is shown, including when a source was read at abstract level.

## Primary texts

`primary_texts` entries catalogue English translations, mostly on CELT. Optional fields: `cycle`, `translator`, `url`, `licence_note`.

The site does not render `text`, `translator`, or `licence_note` for an entry that has a translation URL. It renders the source title as a link to that URL. The Book of Leinster Táin (`celt-t301035`) is restricted to academic use: the same link, plus the words “Academic use only”, and no quotation. An entry with no translation URL (the Acallam gap) shows its own pack sentence.

## What this pack does not contain

No túath or kingdom boundaries, no present-day administrative overlay, and no pronunciation audio. Those are omitted rather than filled with example geography. Present-day in the interface is the basemap with the pins hidden.

v2 coordinates: Brú na Bóinne, Sceilg Mhichíl, and the Royal Sites that publish a lat/lon on the UNESCO tentative list (Cashel, Dún Ailinne, Uisneach, Rathcroghan, Tara). Still no pin for Navan Fort / Emain Macha, the Children of Lir places, Cooley, Carrowmore, or Carrowkeel. The pack’s `meta.version` remains 1; `data/README.md` describes this file as the v2 expansion (46 entries, 27 sources).
