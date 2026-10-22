import {
  allEntries,
  entrySection,
  entryTitle,
  findEntry,
  presentPrimary,
  sectionEntries,
  shortTitle,
} from './content';
import type { Atlas, Entry, Source } from './types';

export interface GlossaryTerm {
  term: string;
  entryId: string;
  gloss: string;
}

export interface ComparePair {
  id: string;
  a: string;
  b: string;
  /** Hover label. Not drawn until the pointer asks for it. */
  label: string;
}

interface PersonForm {
  id: string;
  forms: string[];
}

interface KeyPattern {
  key: string;
  pattern: RegExp;
}

/**
 * Closed list of place-names the pack actually uses.
 * Word boundaries stop "emain" matching inside "remains".
 */
const SITE_KEYS: KeyPattern[] = [
  { key: 'boyne', pattern: /brú na bóinne|newgrange|knowth|(?<![\p{L}])dowth(?![\p{L}])/iu },
  { key: 'tara', pattern: /(?<![\p{L}])tara(?![\p{L}])/iu },
  { key: 'skellig', pattern: /sceilg|skellig/iu },
  { key: 'navan', pattern: /(?<![\p{L}])(?:navan|emain|eamhain)(?![\p{L}])/iu },
  { key: 'carrowkeel', pattern: /carrowkeel/iu },
  { key: 'carrowmore', pattern: /carrowmore/iu },
  { key: 'uisneach', pattern: /uisneach/iu },
  { key: 'cashel', pattern: /(?<![\p{L}])cashel(?![\p{L}])/iu },
  { key: 'rathcroghan', pattern: /rathcroghan|(?<![\p{L}])cruachan(?![\p{L}])/iu },
  { key: 'ceide', pattern: /céide|ceide/iu },
  { key: 'corlea', pattern: /corlea/iu },
  { key: 'loughcrew', pattern: /loughcrew/iu },
  { key: 'aileach', pattern: /aileach|grianán|grianan/iu },
  { key: 'lir', pattern: /children of lir|loch dairbhreach|lough derravaragh|sruth na maoile|inis gluaire|iorrus domnann/iu },
  { key: 'cooley', pattern: /(?<![\p{L}])cooley(?![\p{L}])|cúailnge|cuailnge/iu },
  { key: 'dun ailinne', pattern: /dún ailinne|dun ailinne/iu },
  { key: 'clonmacnoise', pattern: /clonmacnoise/iu },
  { key: 'glendalough', pattern: /glendalough/iu },
  { key: 'mellifont', pattern: /mellifont/iu },
];

/** Duplicate records of one site, matched on the title rather than a passing mention. */
const COMPARE_FAMILIES: KeyPattern[] = SITE_KEYS.filter((item) =>
  ['boyne', 'tara', 'skellig', 'navan', 'carrowkeel', 'carrowmore', 'uisneach', 'cashel', 'rathcroghan'].includes(item.key),
);

const CYCLE_HINTS: KeyPattern[] = [
  { key: 'Mythological', pattern: /(?<![\p{L}])mythological(?![\p{L}])|tuatha dé danann|children of lir|lebor gabála|mag tuired|tochmarc étaíne|(?<![\p{L}])étaín(?![\p{L}])/iu },
  { key: 'Ulster', pattern: /(?<![\p{L}])ulster(?![\p{L}])|(?<![\p{L}])táin(?![\p{L}])|tain bó|cú chulainn|cu chulainn|(?<![\p{L}])medb(?![\p{L}])|(?<![\p{L}])deirdre(?![\p{L}])/iu },
  { key: 'Fenian', pattern: /(?<![\p{L}])fenian(?![\p{L}])|(?<![\p{L}])fianna(?![\p{L}])|fionn mac cumhaill|acallam/iu },
  { key: 'Kings', pattern: /cycle of the kings|historical cycle|buile shuibhne|cormac mac airt/iu },
];

const CYCLE_NAMES = ['Mythological', 'Ulster', 'Fenian', 'Kings'] as const;

const SECTION_RANK = ['places', 'timeline', 'cycles', 'primary_texts', 'people', 'history', 'further_reading'];

/**
 * Glossary terms point at a pack entry whose own sentence contains the term.
 * The gloss is that sentence. Nothing is paraphrased.
 */
const GLOSSARY_TERMS: { term: string; entryId: string }[] = [
  { term: 'Celtoscepticism', entryId: 'h1' },
  { term: 'Royal Sites', entryId: 'h4' },
  { term: 'Four-cycle division', entryId: 'c0' },
  { term: 'Mythological Cycle', entryId: 'c1' },
  { term: 'Ulster Cycle', entryId: 'c2' },
  { term: 'Fenian Cycle', entryId: 'c3' },
  { term: 'Cycle of the Kings', entryId: 'c4' },
  { term: 'Three Sorrows of Storytelling', entryId: 'c5' },
  { term: 'Children of Lir', entryId: 'c6' },
  { term: 'Táin', entryId: 'c0' },
  { term: 'Tuatha Dé Danann', entryId: 'c1' },
  { term: 'Brú na Bóinne', entryId: 'pl1' },
  { term: 'Emain Macha', entryId: 'pl10' },
  { term: 'CELT', entryId: 'fr1' },
];

export function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Link title for a translation. Catalogue sentences stay out of the interface. */
export function resultLabel(entry: Entry, sources: Source[]): string {
  if (entry.url && entry.cycle) {
    const presented = presentPrimary(entry, sources);
    if ('link' in presented) return presented.link.title;
  }
  return entryTitle(entry);
}

export function glossary(atlas: Atlas): GlossaryTerm[] {
  const items: GlossaryTerm[] = [];
  for (const item of GLOSSARY_TERMS) {
    const entry = findEntry(atlas, item.entryId);
    if (!entry || (entry.url && entry.cycle)) continue;
    if (!fold(entry.text).includes(fold(item.term))) continue;
    items.push({ term: item.term, entryId: entry.id, gloss: entry.text });
  }
  items.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
  return items;
}

export function searchEntries(atlas: Atlas, query: string): Entry[] {
  const needle = fold(query.trim());
  if (needle.length < 2) return [];
  const hits = allEntries(atlas).filter((entry) => {
    const blob = fold(
      [resultLabel(entry, atlas.sources), entry.text, entry.name, entry.myth_link, entry.note, entry.cycle]
        .filter((part): part is string => Boolean(part))
        .join('\n'),
    );
    return blob.includes(needle);
  });
  hits.sort((a, b) => {
    const aTitle = fold(resultLabel(a, atlas.sources)).includes(needle) ? 0 : 1;
    const bTitle = fold(resultLabel(b, atlas.sources)).includes(needle) ? 0 : 1;
    if (aTitle !== bTitle) return aTitle - bTitle;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return hits;
}

export function comparePairs(atlas: Atlas): ComparePair[] {
  const places = sectionEntries(atlas, 'places');
  const pairs = new Map<string, [string, string]>();
  const add = (left: string, right: string) => {
    if (left === right) return;
    const [a, b] = orderIds(left, right);
    pairs.set(`${a}:${b}`, [a, b]);
  };
  const eligible = places.filter((place) => matchingKeys(entryTitle(place), COMPARE_FAMILIES).length === 1);
  for (const family of COMPARE_FAMILIES) {
    const members = eligible.filter((place) => family.pattern.test(entryTitle(place)));
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) add(members[i].id, members[j].id);
    }
  }
  for (const place of places) {
    for (const other of places) {
      if (place.id === other.id) continue;
      const title = headedTitle(other);
      if (!title) continue;
      if (mentionsPhrase(place.text, title)) add(place.id, other.id);
    }
  }
  return [...pairs.values()]
    .sort((a, b) => {
      const byA = orderIds(a[0], b[0]);
      if (byA[0] !== a[0]) return 1;
      if (byA[0] !== b[0]) return -1;
      const byB = orderIds(a[1], b[1]);
      return byB[0] === a[1] ? -1 : 1;
    })
    .map(([a, b]) => {
      const left = findEntry(atlas, a);
      const right = findEntry(atlas, b);
      const label = left && right ? `${shortTitle(left)} · ${shortTitle(right)}` : `${a} · ${b}`;
      return { id: `${a}:${b}`, a, b, label };
    });
}

export function relatedEntries(atlas: Atlas, entry: Entry): Entry[] {
  const people = sectionEntries(atlas, 'people').map((person) => ({ id: person.id, forms: personForms(person) }));
  const related = allEntries(atlas).filter((other) => other.id !== entry.id && isRelated(atlas, entry, other, people));
  related.sort((a, b) => {
    const rankA = SECTION_RANK.indexOf(entrySection(atlas, a.id) ?? '');
    const rankB = SECTION_RANK.indexOf(entrySection(atlas, b.id) ?? '');
    if (rankA !== rankB) return rankA - rankB;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return related.slice(0, 18);
}

function isRelated(atlas: Atlas, a: Entry, b: Entry, people: PersonForm[]): boolean {
  if (sharedSite(atlas, a, b)) return true;
  if (a.name && mentionsPhrase(b.text, a.name)) return true;
  if (b.name && mentionsPhrase(a.text, b.name)) return true;
  if (namedCycleHits(a, b)) return true;
  if (personMention(atlas, a, b, people)) return true;
  return false;
}

function sharedSite(atlas: Atlas, a: Entry, b: Entry): boolean {
  const keysA = matchingKeys(siteBlob(a), SITE_KEYS);
  const keysB = matchingKeys(siteBlob(b), SITE_KEYS);
  if (!keysA.some((key) => keysB.includes(key))) return false;
  const sections = new Set([entrySection(atlas, a.id), entrySection(atlas, b.id)]);
  return sections.has('places') || sections.has('timeline');
}

function namedCycleHits(a: Entry, b: Entry): boolean {
  const left = cycleKeyFromName(a.name);
  const right = cycleKeyFromName(b.name);
  if (left && !right && hintedKeys(b).has(left)) return true;
  if (right && !left && hintedKeys(a).has(right)) return true;
  return false;
}

function personMention(atlas: Atlas, a: Entry, b: Entry, people: PersonForm[]): boolean {
  return mentionsPerson(atlas, a, b, people) || mentionsPerson(atlas, b, a, people);
}

function mentionsPerson(atlas: Atlas, speaker: Entry, maybePerson: Entry, people: PersonForm[]): boolean {
  if (entrySection(atlas, maybePerson.id) !== 'people') return false;
  const forms = people.find((item) => item.id === maybePerson.id)?.forms ?? [];
  const blob = [speaker.text, speaker.name, speaker.myth_link, speaker.note].filter(Boolean).join('\n');
  return forms.some((form) => mentionsPhrase(blob, form));
}

function hintedKeys(entry: Entry): Set<string> {
  const keys = new Set<string>();
  const fromCycle = normalizeCycle(entry.cycle);
  if (fromCycle) keys.add(fromCycle);
  if (entry.myth_link) {
    for (const key of CYCLE_NAMES) {
      if (mentionsPhrase(entry.myth_link, key)) keys.add(key);
    }
  }
  const blob = `${entry.myth_link ?? ''}\n${entry.text}`;
  for (const hint of CYCLE_HINTS) {
    if (hint.pattern.test(blob)) keys.add(hint.key);
  }
  return keys;
}

function cycleKeyFromName(name: string | undefined): string | null {
  return normalizeCycle(name);
}

function normalizeCycle(value: string | undefined): string | null {
  if (!value) return null;
  if (/mythological/i.test(value)) return 'Mythological';
  if (/ulster/i.test(value)) return 'Ulster';
  if (/fenian/i.test(value)) return 'Fenian';
  if (/king/i.test(value)) return 'Kings';
  return null;
}

function personForms(entry: Entry): string[] {
  const head = entry.text.split(':')[0].replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = head.split(/\s+and\s+/i).map((part) => part.trim()).filter((part) => part.length >= 3);
  return [...new Set([head, ...parts])].filter((part) => part.length >= 3);
}

function siteBlob(entry: Entry): string {
  return [entry.text, entry.name, entry.myth_link].filter(Boolean).join('\n');
}

function matchingKeys(value: string, keys: KeyPattern[]): string[] {
  return keys.filter((item) => item.pattern.test(value)).map((item) => item.key);
}

function headedTitle(entry: Entry): string | null {
  const colon = entry.text.indexOf(':');
  if (colon <= 0 || colon > 80) return null;
  const title = entry.text.slice(0, colon).split('(')[0].trim();
  return title.length >= 8 ? title : null;
}

function orderIds(left: string, right: string): [string, string] {
  const leftRank = idRank(left);
  const rightRank = idRank(right);
  if (leftRank === rightRank) return left < right ? [left, right] : [right, left];
  return leftRank < rightRank ? [left, right] : [right, left];
}

function idRank(id: string): number {
  const match = /(\d+)$/.exec(id);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function mentionsPhrase(haystack: string, phrase: string): boolean {
  if (phrase.trim().length < 3) return false;
  const pattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegExp(phrase)}(?=$|[^\\p{L}\\p{N}])`, 'iu');
  return pattern.test(haystack);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
