import contentJson from '../data/content.json';
import sourcesJson from '../data/sources.json';
import type {
  Atlas,
  Badge,
  Coords,
  Entry,
  EntryStatus,
  MappedEntry,
  Meta,
  PeriodId,
  Source,
  ViewMode,
} from './types';

const SECTION_ORDER = ['history', 'cycles', 'places', 'primary_texts', 'people', 'timeline', 'further_reading'];
/** Book of Leinster Táin on CELT: academic use, link only. */
export const LEINSTER_SOURCE = 'celt-t301035';
const STATUSES: EntryStatus[] = ['sourced', 'placeholder', 'example'];

export const PERIODS: { id: PeriodId; tip: string; pattern: RegExp }[] = [
  { id: 'neolithic', tip: 'Neolithic', pattern: /neolithic/i },
  { id: 'iron', tip: 'Iron Age', pattern: /iron age/i },
  { id: 'medieval', tip: 'Early medieval', pattern: /early medieval/i },
];

const SOUGHT: { id: string; pattern: RegExp; name: string }[] = [
  { id: 'lug', pattern: /Lug Lámfhota/u, name: 'Lug Lámfhota' },
  { id: 'cuchulainn', pattern: /Cú Chulainn/u, name: 'Cú Chulainn' },
  { id: 'medb', pattern: /Medb/u, name: 'Medb' },
  { id: 'fionn', pattern: /Fionn mac Cumhaill/u, name: 'Fionn mac Cumhaill' },
];

export interface CharacterLink {
  id: string;
  name: string;
  cycleId: string;
  cycleName: string;
}

/**
 * abstract-only wins when the pack says the text was not read in full.
 * Otherwise an inference label stays inference, and evidence stays evidence.
 */
export function badgeFor(label: string): Badge {
  const value = label.trim().toLowerCase();
  if (
    value.includes('abstract') ||
    value.includes('summary') ||
    value.includes('summaries') ||
    value.includes('not read') ||
    value.includes('snippet only')
  ) {
    return 'abstract-only';
  }
  if (/\binference\b/.test(value)) return 'inference';
  return 'evidence';
}

/** Qualifier after the leading evidence or inference word, when the pack wrote one. */
export function labelNote(label: string): string | null {
  const stripped = label.replace(/^(evidence|inference)\b/i, '').trim();
  if (!stripped) return null;
  const unwrapped = stripped.replace(/^\((.*)\)$/s, '$1').trim();
  return unwrapped || null;
}

export function isExample(entry: Entry): boolean {
  return entry.status === 'placeholder' || entry.status === 'example';
}

/** Visible label for placeholder or example rows. Sourced entries stay unmarked. */
export function exampleBanner(entry: Entry): 'Example data' | null {
  return isExample(entry) ? 'Example data' : null;
}

export function isMapped(entry: Entry): entry is MappedEntry {
  return entry.coords != null && Number.isFinite(entry.coords.lat) && Number.isFinite(entry.coords.lon);
}

export function entryTitle(entry: Entry): string {
  if (entry.name) return entry.name;
  const colon = entry.text.indexOf(':');
  if (colon > 0 && colon <= 80) return entry.text.slice(0, colon).trim();
  const head = entry.text.split(' - ')[0].trim();
  return head.length <= 80 ? head : head.slice(0, 72).trim();
}

/** Title without a parenthetical catalogue qualifier. */
export function shortTitle(entry: Entry): string {
  return entryTitle(entry).split('(')[0].trim();
}

export function findEntry(atlas: Atlas, id: string): Entry | null {
  for (const section of atlas.sections) {
    const found = section.entries.find((entry) => entry.id === id);
    if (found) return found;
  }
  return null;
}

export function entrySection(atlas: Atlas, id: string): string | null {
  return atlas.sections.find((section) => section.entries.some((entry) => entry.id === id))?.id ?? null;
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return String(year);
}

/**
 * The timeline may show a year only when that number is already in the pack sentence.
 * A sort key such as tl5's -300 is not displayed as if the source had dated it.
 */
export function timelineLabel(entry: Entry): string | null {
  if (entry.year == null) return null;
  const digits = String(Math.abs(entry.year));
  if (!entry.text.includes(digits)) return null;
  return formatYear(entry.year);
}

export function allEntries(atlas: Atlas): Entry[] {
  return atlas.sections.flatMap((section) => section.entries);
}

export function sectionEntries(atlas: Atlas, id: string): Entry[] {
  return atlas.sections.find((section) => section.id === id)?.entries ?? [];
}

export function mappedEntries(atlas: Atlas): MappedEntry[] {
  return allEntries(atlas).filter(isMapped);
}

export function unmappedEntries(atlas: Atlas): Entry[] {
  return sectionEntries(atlas, 'places').filter((entry) => !isMapped(entry));
}

export function debateEntries(atlas: Atlas): Entry[] {
  return allEntries(atlas).filter((entry) => entry.debate === true);
}

export function timelineEntries(atlas: Atlas): Entry[] {
  return [...sectionEntries(atlas, 'timeline')].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
}

export function matchesPeriod(entry: Entry, period: PeriodId): boolean {
  const found = PERIODS.find((item) => item.id === period);
  return found ? found.pattern.test(entry.text) : false;
}

/** A place the pack ties to a tale, either by myth_link or by its own text. */
export function mentionsMyth(entry: Entry): boolean {
  if (entry.myth_link) return true;
  return /táin|ulster cycle|medb|children of lir|cruachan|mythological|fenian/i.test(entry.text);
}

/**
 * Myth mode dims pins whose own text does not name a tale.
 * A period dims pins whose text does not name that period.
 */
export function pinDimmed(entry: Entry, view: ViewMode, period: PeriodId | null): boolean {
  if (view === 'myth' && !mentionsMyth(entry)) return true;
  if (period && !matchesPeriod(entry, period)) return true;
  return false;
}

export interface PrimaryLink {
  id: string;
  href: string;
  title: string;
  academicOnly: boolean;
  /** Our own short caution. Never the translation. */
  caution?: string;
}

export interface PrimaryGap {
  id: string;
  text: string;
}

/**
 * CELT translations are links. The pack's catalogue sentence is not shown.
 * The Book of Leinster Táin is academic-use and is still only a link.
 * A primary-text entry with no translation URL is a gap note and may show its own sentence.
 */
export function presentPrimary(entry: Entry, sources: Source[]): { link: PrimaryLink } | { gap: PrimaryGap } {
  const specificId = entry.sources.find((id) => id !== 'celt-list');
  const specific = sources.find((source) => source.id === specificId);
  const href = entry.url ?? specific?.url;
  if (!href) return { gap: { id: entry.id, text: entry.text } };
  const academicOnly = entry.sources.includes(LEINSTER_SOURCE);
  const caution =
    !academicOnly && entry.licence_note && /copyright/i.test(entry.licence_note)
      ? 'Copyright varies by jurisdiction'
      : undefined;
  return {
    link: {
      id: entry.id,
      href,
      title: specific?.title ?? entry.id,
      academicOnly,
      caution,
    },
  };
}

export function visiblePins(entries: MappedEntry[], view: ViewMode): MappedEntry[] {
  if (view === 'present') return [];
  return entries;
}

/**
 * The four names asked for in the cycle explorer, included only when a named
 * cycle entry in this pack actually contains them. The edge is "named in".
 */
export function characterLinks(entries: Entry[]): CharacterLink[] {
  const links: CharacterLink[] = [];
  for (const sought of SOUGHT) {
    const entry = entries.find((item) => item.name && sought.pattern.test(item.text));
    if (!entry?.name) continue;
    links.push({ id: sought.id, name: sought.name, cycleId: entry.id, cycleName: entry.name });
  }
  return links;
}

/** UNESCO-style "N53 41 40.9 W6 28 31.8". */
export function parseSourceFormat(source: string): { lat: number; lon: number } | null {
  const match = source
    .trim()
    .match(/^([NS])\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([EW])\s*(\d+)\s+(\d+)\s+([\d.]+)$/i);
  if (!match) return null;
  const lat = dms(Number(match[2]), Number(match[3]), Number(match[4]), match[1].toUpperCase() === 'S');
  const lon = dms(Number(match[6]), Number(match[7]), Number(match[8]), match[5].toUpperCase() === 'W');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export function validateAtlas(content: unknown, sources: unknown): Atlas {
  const root = record(content, 'content');
  const meta = readMeta(root.meta);
  const sourceList = readSources(sources);
  const sourceIds = new Set(sourceList.map((source) => source.id));
  const sections = readSections(root, sourceIds);
  const seen = new Set<string>();
  sections.forEach((section) => {
    section.entries.forEach((entry) => {
      if (seen.has(entry.id)) throw new Error(`Duplicate entry id ${entry.id}`);
      seen.add(entry.id);
    });
  });
  return { meta, sources: sourceList, sections };
}

export const atlas = validateAtlas(contentJson, sourcesJson);

function dms(degrees: number, minutes: number, seconds: number, negative: boolean): number {
  const value = degrees + minutes / 60 + seconds / 3600;
  return negative ? -value : value;
}

function readMeta(value: unknown): Meta {
  const meta = record(value, 'meta');
  return {
    pack: readString(meta.pack, 'meta.pack'),
    version: readNumber(meta.version, 'meta.version'),
    created: readString(meta.created, 'meta.created'),
  };
}

function readSources(value: unknown): Source[] {
  if (!Array.isArray(value)) throw new Error('sources must be an array');
  const seen = new Set<string>();
  return value.map((item, index) => {
    const source = record(item, `sources[${index}]`);
    const id = readString(source.id, `sources[${index}].id`);
    if (seen.has(id)) throw new Error(`Duplicate source id ${id}`);
    seen.add(id);
    return {
      id,
      title: readString(source.title, `${id}.title`),
      author_org: readString(source.author_org, `${id}.author_org`),
      url: readString(source.url, `${id}.url`),
      date_accessed: readString(source.date_accessed, `${id}.date_accessed`),
      quality: readString(source.quality, `${id}.quality`),
    };
  });
}

function readSections(root: Record<string, unknown>, sourceIds: Set<string>): Atlas['sections'] {
  const keys = Object.keys(root).filter((key) => key !== 'meta' && Array.isArray(root[key]));
  for (const required of SECTION_ORDER) {
    if (!keys.includes(required)) throw new Error(`Missing section ${required}`);
  }
  const ordered = [
    ...SECTION_ORDER.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !SECTION_ORDER.includes(key)),
  ];
  return ordered.map((id) => ({
    id,
    entries: (root[id] as unknown[]).map((item, index) => readEntry(item, `${id}[${index}]`, sourceIds)),
  }));
}

function readEntry(value: unknown, where: string, sourceIds: Set<string>): Entry {
  const item = record(value, where);
  const id = readString(item.id, `${where}.id`);
  const sources = item.sources;
  if (!Array.isArray(sources) || sources.length < 1 || sources.some((source) => typeof source !== 'string' || source.length === 0)) {
    throw new Error(`${where}.sources must list at least one source id`);
  }
  sources.forEach((source) => {
    if (!sourceIds.has(source)) throw new Error(`${id} cites missing source ${source}`);
  });
  const entry: Entry = {
    id,
    text: readString(item.text, `${id}.text`),
    sources,
    label: readString(item.label, `${id}.label`),
  };
  if ('coords' in item) entry.coords = readCoords(item.coords, id);
  if ('uncertainty' in item && item.uncertainty != null) entry.uncertainty = readString(item.uncertainty, `${id}.uncertainty`);
  if ('sensitivity' in item && item.sensitivity != null) entry.sensitivity = readString(item.sensitivity, `${id}.sensitivity`);
  if ('debate' in item && item.debate != null) {
    if (typeof item.debate !== 'boolean') throw new Error(`${id}.debate must be boolean`);
    entry.debate = item.debate;
  }
  if ('name' in item && item.name != null) entry.name = readString(item.name, `${id}.name`);
  if ('note' in item && item.note != null) entry.note = readString(item.note, `${id}.note`);
  if ('cycle' in item && item.cycle != null) entry.cycle = readString(item.cycle, `${id}.cycle`);
  if ('translator' in item && item.translator != null) entry.translator = readString(item.translator, `${id}.translator`);
  if ('url' in item && item.url != null) entry.url = readString(item.url, `${id}.url`);
  if ('licence_note' in item && item.licence_note != null) entry.licence_note = readString(item.licence_note, `${id}.licence_note`);
  if ('myth_link' in item && item.myth_link != null) entry.myth_link = readString(item.myth_link, `${id}.myth_link`);
  if ('figure_type' in item && item.figure_type != null) entry.figure_type = readString(item.figure_type, `${id}.figure_type`);
  if ('year' in item && item.year != null) entry.year = readNumber(item.year, `${id}.year`);
  if ('status' in item && item.status != null) {
    if (typeof item.status !== 'string' || !STATUSES.includes(item.status as EntryStatus)) {
      throw new Error(`${id}.status is not a known status`);
    }
    entry.status = item.status as EntryStatus;
  }
  return entry;
}

function readCoords(value: unknown, id: string): Coords | null {
  if (value === null) return null;
  const coords = record(value, `${id}.coords`);
  const lat = readNumber(coords.lat, `${id}.lat`);
  const lon = readNumber(coords.lon, `${id}.lon`);
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new Error(`${id} coordinates are out of range`);
  const parsed: Coords = { lat, lon };
  if ('source_format' in coords && coords.source_format != null) {
    parsed.source_format = readString(coords.source_format, `${id}.source_format`);
  }
  return parsed;
}

function record(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${where} must be an object`);
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown, where: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${where} must be a non-empty string`);
  return value;
}

function readNumber(value: unknown, where: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${where} must be a finite number`);
  return value;
}
