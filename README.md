# Celtic Ireland

An interactive globe of places, cycles, and the debate over the name ‘Celt’, drawn from a small sourced pack.

Pins are only the sites whose coordinates the pack takes from UNESCO. Myths and the other places are listed with their sources. English translations on [CELT](https://celt.ucc.ie/publishd.html) are links. The Book of Leinster Táin is restricted to academic use and is linked, not quoted.

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

The pack lives in [`data/content.json`](data/content.json) and [`data/sources.json`](data/sources.json). The shape, the evidence badges, and the link-only rule for CELT are documented in [`data/SCHEMA.md`](data/SCHEMA.md). The pack’s own notes are in [`data/README.md`](data/README.md).

`meta.version` in the file is 1. The pack readme describes this as the v2 expansion: 46 entries and 27 sources. Nothing in the pack is example data. A later entry with `status` `placeholder` or `example` has to show the words “Example data”.

## Respectful use

The sources panel carries a short notice. The ‘Celts’ label is disputed in the sources gathered here, and those two notes were read from abstracts and summaries, not the full papers. Stories and places belong to living communities. Kingdoms and túatha are not drawn: this pack has no sourced boundaries.

## Deploy

`npm ci && npm run build` writes a static site to `dist/`. The History of Humanity map bridge publishes that directory to the Cloudflare Pages project `celtic-ireland`. This repository does not deploy, and it has no Cloudflare secrets.

## Licence

Code is MIT (see `LICENSE`). The globe uses NASA Blue Marble imagery (public domain) and Natural Earth land polygons (public domain). Pack texts stay with their cited sources. CELT translations are not reproduced.
