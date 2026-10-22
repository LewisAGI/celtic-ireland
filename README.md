# Celtic Ireland

An interactive globe of places, cycles, people, and the debate over the name ‘Celt’, drawn from the sourced pack in `data/`.

The pack is the v3 expansion: 106 entries and 32 sources. Pins are the 32 places that publish coordinates. Twenty-two of those cite National Monuments Service “Monuments to Visit” (`nms-mtv`). Navan Fort (`pl39`) and Carrowkeel Cairn F (`pl40`) stay labelled inference. Rathcroghan (`pl8`) keeps its pack label and is badged inference because the sentence ends that way. The Children of Lir exile places, including the Mayo coast, are marked “in the tale”. Eight places still have no coordinates and are listed, not pinned. Figures whose pack label still says to verify the detail against a translation are badged “unverified detail”, with a public note, and that instruction is not shown.

Story pages, site pages, people, the timeline, a glossary, search, and side-by-side comparisons are all built from those entries. English translations, including the Acallam (`t16`) and Lebor Gabála Érenn (`t17`), are links. The Book of Leinster Táin is restricted to academic use and is linked, not quoted. The pack has no pronunciation recordings, so none are shown.

Controls are icons. Their names appear on hover, or after a long press. Filters, layers, search, and comparisons open as pop-outs. Nothing in the pack is example data. An entry with `status` `placeholder` or `example` has to show the words “Example data”.

## Develop

```bash
npm ci
npm run dev
```

## Test

```bash
npm test
npm run test:e2e
```

## Data

The pack lives in [`data/content.json`](data/content.json) and [`data/sources.json`](data/sources.json). The shape, the evidence badges, and the link-only rule for translations are documented in [`data/SCHEMA.md`](data/SCHEMA.md). The pack’s own notes are in [`data/README.md`](data/README.md).

`meta.version` in the file is 1. The pack readme describes the same file as the v3 expansion.

## Respectful use

The sources panel carries a short notice. The ‘Celts’ label is disputed in the sources gathered here, and those two notes were read from abstracts and summaries, not the full papers. Stories and places belong to living communities. Kingdoms and túatha are not drawn: this pack has no sourced boundaries.

## Deploy

`npm ci && npm run build` writes a static site to `dist/`. The History of Humanity map bridge publishes that directory to the Cloudflare Pages project `celtic-ireland`. This repository does not deploy, and it has no Cloudflare secrets.

`public/_headers` sets `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` for that Pages project. The preview server sends the same headers.

## Licence

Code is MIT (see `LICENSE`). The globe uses NASA Blue Marble imagery (public domain) and Natural Earth land polygons (public domain). Pack texts stay with their cited sources. CELT translations are not reproduced. Monument coordinates from the National Monuments Service are © Government of Ireland, CC BY 4.0.
