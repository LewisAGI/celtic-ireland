import { describe, expect, it } from 'vitest';
import ciWorkflow from '../.github/workflows/ci.yml?raw';
import webkitWorkflow from '../.github/workflows/webkit.yml?raw';
import headersFile from '../public/_headers?raw';
import { SECURITY_HEADERS } from '../headers';
import { atlas, findEntry } from '../src/content';
import { hashForRoute, routeForHash } from '../src/layout';
import { comparePairs, glossary, relatedEntries, resultLabel, searchEntries } from '../src/relate';

describe('cross-links, search, glossary, and comparisons', () => {
  it('links a cycle to its people, texts, and places', () => {
    const ids = relatedEntries(atlas, findEntry(atlas, 'c2')!).map((entry) => entry.id);
    expect(ids).toContain('pe5');
    expect(ids).toContain('pe6');
    expect(ids).toContain('t6');
    expect(ids).toContain('pl9');
    expect(ids).not.toContain('c2');
  });

  it('links Newgrange to the Boyne landscape and the timeline', () => {
    const ids = relatedEntries(atlas, findEntry(atlas, 'pl17')!).map((entry) => entry.id);
    expect(ids).toContain('pl1');
    expect(ids).toContain('tl2');
  });

  it('links Macalister to Lebor Gabála without showing the catalogue sentence', () => {
    const ids = relatedEntries(atlas, findEntry(atlas, 'pe13')!).map((entry) => entry.id);
    expect(ids).toContain('t17');
    const acallam = findEntry(atlas, 't16')!;
    const label = resultLabel(acallam, atlas.sources);
    expect(label).not.toMatch(/pp\./);
    expect(label).not.toBe(acallam.text);
    expect(acallam.text).toContain('pp.101-265');
  });

  it('searches folded text and ignores a one-character query', () => {
    const hits = searchEntries(atlas, 'Ceide').map((entry) => entry.id);
    expect(hits).toContain('tl1');
    expect(hits).toContain('pl27');
    expect(searchEntries(atlas, 'a')).toEqual([]);
    expect(searchEntries(atlas, "O'Rahilly").some((entry) => entry.id === 't6')).toBe(true);
    const shown = searchEntries(atlas, 'Acallamh').map((entry) => resultLabel(entry, atlas.sources));
    expect(shown.join('\n')).not.toMatch(/pp\.101-265/);
  });

  it('builds glossary glosses only from pack sentences that contain the term', () => {
    const terms = glossary(atlas);
    expect(terms.map((term) => term.term)).toEqual(
      expect.arrayContaining(['Celtoscepticism', 'Mythological Cycle', 'Táin', 'CELT', 'Emain Macha']),
    );
    terms.forEach((term) => {
      const entry = findEntry(atlas, term.entryId);
      expect(entry?.text).toBe(term.gloss);
    });
    expect(terms.some((term) => /pronunciation|audio/i.test(term.term))).toBe(false);
  });

  it('pairs duplicate records and the pack’s own comparison', () => {
    const ids = comparePairs(atlas).map((pair) => pair.id);
    expect(ids).toEqual(
      expect.arrayContaining(['pl1:pl17', 'pl1:pl18', 'pl2:pl34', 'pl5:pl24', 'pl7:pl20', 'pl8:pl21', 'pl9:pl19', 'pl10:pl39', 'pl14:pl23', 'pl15:pl40', 'pl19:pl20']),
    );
    expect(ids).not.toContain('pl16:pl30');
    expect(ids.length).toBeLessThanOrEqual(16);
    expect(comparePairs(atlas).every((pair) => pair.label.length > 3)).toBe(true);
  });

  it('routes story, site, search, and reading hashes', () => {
    expect(routeForHash('#people')).toEqual({ panel: 'people' });
    expect(routeForHash('#further-reading')).toEqual({ panel: 'reading' });
    expect(routeForHash('#place/pl1')).toEqual({ panel: 'place', id: 'pl1' });
    expect(routeForHash('#story/c2')).toEqual({ panel: 'story', id: 'c2' });
    expect(routeForHash('#compare/pl1/pl17')).toEqual({ panel: 'compare', compare: ['pl1', 'pl17'] });
    expect(routeForHash('#search/C%C3%A9ide')).toEqual({ panel: 'search', query: 'Céide' });
    expect(hashForRoute({ panel: 'reading' })).toBe('#further-reading');
    expect(hashForRoute({ panel: 'search', query: 'Céide' })).toBe('#search/C%C3%A9ide');
    expect(hashForRoute({ panel: 'debate' })).toBe('');
  });
});

describe('security headers and CI permissions', () => {
  it('mirrors the CSP, nosniff, and referrer policy into _headers', () => {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      expect(headersFile).toContain(`${key}: ${value}`);
    }
    expect(headersFile).toContain("default-src 'self'");
    expect(headersFile).toContain('https://gibs.earthdata.nasa.gov');
  });

  it('pins actions and grants only contents read', () => {
    for (const text of [ciWorkflow, webkitWorkflow]) {
      expect(text).toMatch(/permissions:\n {2}contents: read/);
      expect(text).not.toMatch(/contents:\s+write/);
      expect(text).not.toMatch(/uses:\s+actions\/[a-z0-9-]+@v\d/i);
      const uses = [...text.matchAll(/uses:\s+actions\/[a-z0-9-]+@([0-9a-f]{40})/g)];
      expect(uses.length).toBeGreaterThanOrEqual(2);
    }
  });
});
