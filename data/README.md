# celtic-ireland content pack (v1, 2026-10-22)
Files: content.json (entries grouped by section), sources.json (id, title, author_org, url, date_accessed, quality).
Entry schema: {id, text, sources[] (ids in sources.json), label ("evidence" | "inference" | qualified evidence), optional coords {lat, lon, source_format DMS}, uncertainty, sensitivity, debate}.
Coordinates: only where a source (UNESCO) gives them, converted from DMS. null means not sourced. UNESCO points are site centroids.
Labels: "evidence" means it is stated in the cited source. "inference" is marked inline. Some peer-reviewed items were read only at abstract or summary level, and their labels say so.
Validation: valid JSON; every entry has >=1 source id that resolves in sources.json.

## Gaps / uncertainty
The 'Celts' debate is sourced from abstracts and summaries; read the full papers before writing long copy. Tara, Emain Macha (Navan Fort) and the Mayo Lir site have no sourced coordinates yet (try National Monuments Service / Historic Environment Scotland-NI). No primary-text translations cited (CELT, UCC corpus recommended). Kings-cycle date range comes from a secondary pathfinder.

## v2 expansion (2026-10-22)
Counts: history 7, cycles 7, places 16, primary_texts 16. 27 sources.
- Coordinates: five Royal Sites have coordinates from the UNESCO Tentative List.
- Translations: 15 English translations on CELT (UCC) plus 1 gap note. Link to them; don't reproduce text without checking CELT licences. The Book of Leinster Táin is restricted to academic use.
Remaining gaps:
- No sourced coordinates for Navan Fort, the Lir locations, Cooley, Brú na Bóinne's individual mounds or the Sligo complexes (UNESCO gives UTM only; not converted).
- No English translation of Acallam na Senórach on CELT (the O'Grady 1892 Silva Gadelica translation is a candidate).
- Lebor Gabála Érenn translation not sourced yet.
- Modern place-name equivalents (Lough Derravaragh, Cooley) are labelled inference.

## v3 (2026-10-22)
Added 24 places with official NMS "Monuments to Visit" lat/long (SMR ids), Navan Fort (Irish Grid H 8470 4514, converted) and Carrowkeel Cairn F (converted - inference). Translations: Acallamh (O'Grady 1892, Silva Gadelica II pp.101-265, PD) and Lebor Gabála Érenn (Macalister, ITS; copyright varies). New sections people/timeline/further_reading.
Gaps: Lough Derravaragh coords; mythological-figure details beyond cycle membership need checking against translations; Macalister vols 2-5 links not added individually.
