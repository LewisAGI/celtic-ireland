import { describe, expect, it } from 'vitest';
import {
  LEINSTER_SOURCE,
  allEntries,
  atlas,
  badgeFor,
  characterLinks,
  debateEntries,
  isExample,
  isMapped,
  labelNote,
  mappedEntries,
  matchesPeriod,
  mentionsMyth,
  parseSourceFormat,
  pinDimmed,
  presentPrimary,
  sectionEntries,
  timelineEntries,
  unmappedEntries,
  validateAtlas,
  visiblePins,
} from '../src/content';
import { CELT_NOTICE, NMS_CREDIT, NOTICE } from '../src/notice';
import { visibleLabelIds } from '../src/labels';
import { displayPositions } from '../src/spread';

const TAIN_CATALOGUE =
  "English translation: Táin Bó Cúalnge from the Book of Leinster — Cecile O'Rahilly (tr.) - CELT: academic/teaching use with consent. Cycle: Ulster.";
const ACALLAM_CATALOGUE =
  "English translation: Acallamh na Senórach ('The Colloquy with the Ancients') in Silva Gadelica vol. II, S.H. O'Grady 1892 (Irish text vol. I pp.94-233; translation vol. II pp.101-265). Cycle: Fenian.";
const DMS = /^([NS])\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([EW])\s*(\d+)\s+(\d+)\s+([\d.]+)$/i;

const EMPTY_SECTIONS = {
  history: [],
  cycles: [],
  places: [],
  primary_texts: [],
  people: [],
  timeline: [],
  further_reading: [],
};

describe('v3 pack', () => {
  it('loads 106 sourced entries and 32 sources', () => {
    expect(atlas.meta.pack).toBe('celtic-ireland');
    expect(atlas.meta.version).toBe(1);
    expect(allEntries(atlas)).toHaveLength(106);
    expect(sectionEntries(atlas, 'history')).toHaveLength(7);
    expect(sectionEntries(atlas, 'cycles')).toHaveLength(7);
    expect(sectionEntries(atlas, 'places')).toHaveLength(40);
    expect(sectionEntries(atlas, 'primary_texts')).toHaveLength(17);
    expect(sectionEntries(atlas, 'people')).toHaveLength(15);
    expect(sectionEntries(atlas, 'timeline')).toHaveLength(12);
    expect(sectionEntries(atlas, 'further_reading')).toHaveLength(8);
    expect(atlas.sources).toHaveLength(32);
    expect(allEntries(atlas).some(isExample)).toBe(false);
  });

  it('resolves every source and keeps ids unique', () => {
    const ids = new Set<string>();
    allEntries(atlas).forEach((entry) => {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
      expect(entry.sources.length).toBeGreaterThan(0);
      entry.sources.forEach((sourceId) => {
        expect(atlas.sources.some((source) => source.id === sourceId)).toBe(true);
      });
      expect(['evidence', 'inference', 'abstract-only']).toContain(badgeFor(entry.label));
    });
  });

  it('maps the 32 coordinated places and leaves eight unpinned', () => {
    const mapped = mappedEntries(atlas);
    expect(mapped).toHaveLength(32);
    expect(mapped.map((entry) => entry.id)).toEqual([
      'pl1',
      'pl2',
      'pl5',
      'pl6',
      'pl7',
      'pl8',
      'pl9',
      'pl14',
      'pl17',
      'pl18',
      'pl19',
      'pl20',
      'pl21',
      'pl22',
      'pl23',
      'pl24',
      'pl25',
      'pl26',
      'pl27',
      'pl28',
      'pl29',
      'pl30',
      'pl31',
      'pl32',
      'pl33',
      'pl34',
      'pl35',
      'pl36',
      'pl37',
      'pl38',
      'pl39',
      'pl40',
    ]);
    expect(unmappedEntries(atlas).map((entry) => entry.id)).toEqual([
      'pl3',
      'pl4',
      'pl10',
      'pl11',
      'pl12',
      'pl13',
      'pl15',
      'pl16',
    ]);
    expect(mapped.filter((entry) => entry.sources.includes('nms-mtv'))).toHaveLength(22);
    const navan = mapped.find((entry) => entry.id === 'pl39')!;
    const cairn = mapped.find((entry) => entry.id === 'pl40')!;
    expect(badgeFor(navan.label)).toBe('inference');
    expect(badgeFor(cairn.label)).toBe('inference');
    expect(labelNote(navan.label)).toMatch(/conversion/);
    expect(isMapped(sectionEntries(atlas, 'places').find((entry) => entry.id === 'pl10')!)).toBe(false);
  });

  it('checks DMS strings and leaves NMS decimals as published', () => {
    mappedEntries(atlas).forEach((entry) => {
      expect(Number.isFinite(entry.coords.lat)).toBe(true);
      expect(Number.isFinite(entry.coords.lon)).toBe(true);
      const format = entry.coords.source_format ?? '';
      if (!DMS.test(format)) {
        expect(parseSourceFormat(format)).toBeNull();
        return;
      }
      const parsed = parseSourceFormat(format);
      expect(parsed, entry.id).not.toBeNull();
      expect(Math.abs(parsed!.lat - entry.coords.lat)).toBeLessThan(1e-4);
      expect(Math.abs(parsed!.lon - entry.coords.lon)).toBeLessThan(1e-4);
    });
  });

  it('spreads the Newgrange pair without moving the stored point', () => {
    const points = mappedEntries(atlas).map((entry) => ({
      id: entry.id,
      lat: entry.coords.lat,
      lon: entry.coords.lon,
    }));
    const positions = displayPositions(points);
    const boyne = positions.get('pl1')!;
    const newgrange = positions.get('pl17')!;
    expect(boyne.offsetX === newgrange.offsetX && boyne.offsetY === newgrange.offsetY).toBe(false);
    expect(boyne.lat).toBe(points.find((point) => point.id === 'pl1')!.lat);
    expect(positions.get('pl2')!.offsetX).toBe(0);
    expect(positions.get('pl2')!.offsetY).toBe(0);
  });

  it('badges the Celts debate as abstract-only and keeps the verify qualifier', () => {
    const debate = debateEntries(atlas);
    expect(debate.map((entry) => entry.id)).toEqual(['h1', 'h2']);
    debate.forEach((entry) => expect(badgeFor(entry.label)).toBe('abstract-only'));
    expect(labelNote(debate[0].label)).toMatch(/not read/);
    const cooley = sectionEntries(atlas, 'places').find((entry) => entry.id === 'pl16')!;
    expect(badgeFor(cooley.label)).toBe('inference');
    const lug = sectionEntries(atlas, 'people').find((entry) => entry.id === 'pe1')!;
    expect(badgeFor(lug.label)).toBe('evidence');
    expect(labelNote(lug.label)).toMatch(/verify detail/);
    expect(badgeFor('inference (abstract-level)')).toBe('abstract-only');
  });

  it('places periods, myth links, and the timeline years where the pack says so', () => {
    const places = sectionEntries(atlas, 'places');
    const byId = (id: string) => places.find((entry) => entry.id === id)!;
    expect(matchesPeriod(byId('pl1'), 'neolithic')).toBe(true);
    expect(matchesPeriod(byId('pl2'), 'medieval')).toBe(true);
    expect(matchesPeriod(byId('pl9'), 'neolithic')).toBe(false);
    expect(mentionsMyth(byId('pl9'))).toBe(true);
    expect(mentionsMyth(byId('pl17'))).toBe(true);
    expect(mentionsMyth(byId('pl27'))).toBe(false);
    expect(mentionsMyth(byId('pl1'))).toBe(false);
    expect(pinDimmed(byId('pl1'), 'myth', null)).toBe(true);
    expect(pinDimmed(byId('pl17'), 'myth', null)).toBe(false);
    expect(pinDimmed(byId('pl2'), 'archaeology', 'neolithic')).toBe(true);
    expect(pinDimmed(byId('pl1'), 'archaeology', 'neolithic')).toBe(false);
    expect(visiblePins(mappedEntries(atlas), 'present')).toHaveLength(0);
    expect(visiblePins(mappedEntries(atlas), 'archaeology')).toHaveLength(32);
    const years = timelineEntries(atlas).map((entry) => entry.year);
    expect(years[0]).toBe(-3800);
    expect(years).toEqual([...years].sort((a, b) => (a ?? 0) - (b ?? 0)));
    const iron = sectionEntries(atlas, 'timeline').find((entry) => entry.id === 'tl5')!;
    expect(badgeFor(iron.label)).toBe('inference');
    expect(labelNote(iron.label)).toMatch(/no exact date/);
  });

  it('draws the character graph only from names in the cycle entries', () => {
    const links = characterLinks(sectionEntries(atlas, 'cycles'));
    expect(links.map((link) => link.name)).toEqual([
      'Lug Lámfhota',
      'Cú Chulainn',
      'Medb',
      'Fionn mac Cumhaill',
    ]);
    expect(links.find((link) => link.id === 'medb')?.cycleId).toBe('c2');
    expect(links.find((link) => link.id === 'cuchulainn')?.cycleId).toBe('c2');
  });

  it('links CELT, the Acallam, and Lebor Gabála, and does not present catalogue sentences', () => {
    const texts = sectionEntries(atlas, 'primary_texts');
    const leinster = texts.find((entry) => entry.id === 't6')!;
    expect(leinster.text).toBe(TAIN_CATALOGUE);
    expect(leinster.sources).toContain(LEINSTER_SOURCE);
    texts.forEach((entry) => {
      const presented = presentPrimary(entry, atlas.sources);
      expect(presented).not.toHaveProperty('gap');
      if (!('link' in presented)) return;
      expect(JSON.stringify(presented.link)).not.toContain(entry.text);
      expect(JSON.stringify(presented.link)).not.toContain('pp.101-265');
      expect(presented.link.title.length).toBeGreaterThan(0);
      expect(presented.link).not.toHaveProperty('text');
      expect(presented.link).not.toHaveProperty('licence_note');
      expect(presented.link).not.toHaveProperty('translator');
    });
    const shown = presentPrimary(leinster, atlas.sources);
    expect('link' in shown && shown.link.academicOnly).toBe(true);
    expect('link' in shown && shown.link.title).toBe('Táin Bó Cúalnge from the Book of Leinster');
    expect('link' in shown && shown.link.href).toBe('https://celt.ucc.ie/published/T301035/index.html');
    const acallam = texts.find((entry) => entry.id === 't16')!;
    expect(acallam.text).toBe(ACALLAM_CATALOGUE);
    const acallamLink = presentPrimary(acallam, atlas.sources);
    expect('link' in acallamLink && acallamLink.link.href).toBe('https://archive.org/details/silvagadelicaixx02ogra');
    expect('link' in acallamLink && acallamLink.link.academicOnly).toBe(false);
    const macalister = presentPrimary(texts.find((entry) => entry.id === 't17')!, atlas.sources);
    expect('link' in macalister && macalister.link.caution).toBe('Copyright varies by jurisdiction');
    expect('link' in macalister && macalister.link.href).toMatch(/^https:\/\/archive\.org\//);
  });

  it('credits the NMS licence and rejects a broken source id', () => {
    expect(NOTICE.length).toBeLessThan(1400);
    expect(NOTICE).toMatch(/National Monuments Service/);
    expect(NOTICE).toMatch(/Creative Commons Attribution 4\.0/);
    expect(NOTICE).toMatch(/Book of Leinster/);
    expect(NOTICE).toMatch(/living communities/);
    expect(NMS_CREDIT).toMatch(/CC BY 4\.0/);
    expect(NMS_CREDIT).toMatch(/Government of Ireland/);
    expect(CELT_NOTICE).toMatch(/linked, not reproduced/);
    expect(() => validateAtlas({ meta: atlas.meta, ...EMPTY_SECTIONS }, [])).not.toThrow();
    expect(() =>
      validateAtlas(
        {
          meta: atlas.meta,
          history: [{ ...sectionEntries(atlas, 'history')[0], sources: ['missing'] }],
          cycles: [],
          places: [],
          primary_texts: [],
        },
        atlas.sources,
      ),
    ).toThrow(/Missing section people/);
    expect(() =>
      validateAtlas(
        {
          meta: atlas.meta,
          ...EMPTY_SECTIONS,
          history: [{ ...sectionEntries(atlas, 'history')[0], sources: ['missing'] }],
        },
        atlas.sources,
      ),
    ).toThrow(/missing source/);
  });

  it('drops overlapping labels after the first', () => {
    const visible = visibleLabelIds([
      { id: 'a', left: 0, top: 0, right: 40, bottom: 12 },
      { id: 'b', left: 10, top: 0, right: 50, bottom: 12 },
      { id: 'c', left: 80, top: 0, right: 120, bottom: 12 },
    ]);
    expect([...visible]).toEqual(['a', 'c']);
  });
});
