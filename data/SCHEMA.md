# Content schema

`content.json` and `sources.json` are the v3 pack (see `data/README.md`). The app reads that shape. It does not rename fields. `meta.version` in the file is still 1.

## content.json

```json
{
  "meta": { "pack": "celtic-ireland", "version": 1, "created": "2026-10-22" },
  "history": [Entry],
  "cycles": [Entry],
  "places": [Entry],
  "primary_texts": [Entry],
  "people": [Entry],
  "timeline": [Entry],
  "further_reading": [Entry]
}
```

Entries are grouped by section. `history`, `cycles`, `places`, `primary_texts`, `people`, `timeline`, and `further_reading` are required. Any further array beside `meta` is treated as another section, in file order after those.

Counts in this pack: history 7, cycles 7, places 40, primary texts 17, people 15, timeline 12, further reading 8. 106 entries. 32 sources.

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
| `myth_link` | no | Pack link from a place to a cycle. Shown with the place and used for cross-links |
| `figure_type` | no | `mythological` or `scholar` on people |
| `year` | no | Sort key for the timeline. Negative values are BCE. A year is labelled in the interface only when that number already appears in `text` |
| `status` | no | `sourced` (assumed when omitted), `placeholder`, or `example` |

`placeholder` and `example` must render the visible words **Example data**. This pack has neither, so the site shows none.

### Badge

The raw `label` is kept. The badge is one of `evidence`, `inference`, or `abstract-only`:

- `abstract-only` when the label says the source was an abstract, a summary, a snippet, or that the full text was not read
- otherwise `inference` when the label says inference
- otherwise `evidence`

`abstract-only` wins over `inference`, so a conclusion taken from an unread paper is not badged as if the paper had been read. A parenthetical in the raw label is shown beside the badge.

### Coordinates

`source_format` is the string the decimal pair was taken from. UNESCO values are DMS, for example `N53 41 40.9 W6 28 31.8`, and those decimals are site centroids. National Monuments Service “Monuments to Visit” points are the published decimals (22 mapped places cite `nms-mtv`).

32 places are pinned. Eight are not: `pl3`, `pl4`, `pl10`, `pl11`, `pl12`, `pl13`, `pl15`, `pl16`. Tara (`pl9`, `pl19`) is pinned. The older Navan Fort note `pl10` has no coordinates; `pl39` is the converted Irish Grid reference and is labelled inference. Carrowkeel Cairn F (`pl40`) is the same kind of conversion, also labelled inference. Lough Derravaragh still has no coordinates.

### Periods

The period filter lights an entry when its own text names the period: Neolithic, Iron Age, or early medieval. It does not assign a year the pack does not give. The filter is a pop-out, and non-matching pins stay on the map, dimmed.

### Pages

Hashes `#people`, `#timeline`, and `#further-reading` open those sections. `#place/<id>`, `#story/<id>`, `#text/<id>`, `#person/<id>`, and `#event/<id>` open one entry. `#glossary` lists terms whose definitions are pack sentences. `#compare/<id>/<id>` shows two entries side by side. `#search/<query>` lists matches. Search, comparisons, and the period filter are pop-outs. Linked entries are other pack rows that share a name, a cycle, or a place-name the pack uses.

## sources.json

Array of `{ id, title, author_org, url, date_accessed, quality }`. Every entry source id must resolve. `quality` is shown, including when a source was read at abstract level.

## Primary texts

`primary_texts` entries catalogue English translations. Optional fields: `cycle`, `translator`, `url`, `licence_note`.

The site does not render `text`, `translator`, or `licence_note` for an entry that has a translation URL. It renders the source title as a link to that URL. That includes the Acallam (`t16`, O'Grady 1892) and Lebor Gabála Érenn (`t17`, Macalister). The Book of Leinster Táin (`t6`, source `celt-t301035`) is restricted to academic use: the same link, plus the words “Academic use only”, and no quotation. An entry with no translation URL is a gap note and may show its own sentence. This pack has no gap notes.

## What this pack does not contain

No túath or kingdom boundaries, no present-day administrative overlay, and no pronunciation audio. Those are omitted rather than filled with example geography. Present-day in the interface is the basemap with the pins hidden.
