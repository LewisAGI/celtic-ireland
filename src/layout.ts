import type { PanelId } from './types';

/** Portrait phones, and short landscape phones, use the bottom sheet. */
export const SHEET_QUERY = '(max-width: 800px), (max-height: 700px)';

export function prefersSheet(): boolean {
  return window.matchMedia(SHEET_QUERY).matches;
}

export interface Route {
  panel: PanelId;
  id?: string;
  compare?: [string, string];
  query?: string;
}

const SIMPLE: Record<string, PanelId> = {
  '#people': 'people',
  '#timeline': 'timeline',
  '#further-reading': 'reading',
  '#glossary': 'glossary',
  '#sources': 'sources',
  '#texts': 'texts',
  '#cycles': 'cycles',
  '#places': 'places',
  '#debate': 'debate',
  '#compare': 'compare',
  '#search': 'search',
};

export function routeForHash(hash: string): Route | null {
  const simple = SIMPLE[hash];
  if (simple) return { panel: simple };
  const place = /^#place\/([a-z0-9]+)$/i.exec(hash);
  if (place) return { panel: 'place', id: place[1] };
  const story = /^#story\/([a-z0-9]+)$/i.exec(hash);
  if (story) return { panel: 'story', id: story[1] };
  const text = /^#text\/([a-z0-9]+)$/i.exec(hash);
  if (text) return { panel: 'text', id: text[1] };
  const person = /^#person\/([a-z0-9]+)$/i.exec(hash);
  if (person) return { panel: 'person', id: person[1] };
  const event = /^#event\/([a-z0-9]+)$/i.exec(hash);
  if (event) return { panel: 'event', id: event[1] };
  const compare = /^#compare\/([a-z0-9]+)\/([a-z0-9]+)$/i.exec(hash);
  if (compare) return { panel: 'compare', compare: [compare[1], compare[2]] };
  const search = /^#search\/(.*)$/.exec(hash);
  if (search) return { panel: 'search', query: decodeQuery(search[1]) };
  return null;
}

export function hashForRoute(route: Route): string {
  if (route.panel === 'people') return '#people';
  if (route.panel === 'timeline') return '#timeline';
  if (route.panel === 'reading') return '#further-reading';
  if (route.panel === 'glossary') return '#glossary';
  if (route.panel === 'place' && route.id) return `#place/${route.id}`;
  if (route.panel === 'story' && route.id) return `#story/${route.id}`;
  if (route.panel === 'text' && route.id) return `#text/${route.id}`;
  if (route.panel === 'person' && route.id) return `#person/${route.id}`;
  if (route.panel === 'event' && route.id) return `#event/${route.id}`;
  if (route.panel === 'compare' && route.compare) return `#compare/${route.compare[0]}/${route.compare[1]}`;
  if (route.panel === 'compare') return '#compare';
  if (route.panel === 'search') {
    const query = route.query?.trim();
    return query ? `#search/${encodeURIComponent(query)}` : '#search';
  }
  return '';
}

export function panelForHash(hash: string): 'people' | 'timeline' | 'reading' | null {
  const route = routeForHash(hash);
  if (!route) return null;
  if (route.panel === 'people' || route.panel === 'timeline' || route.panel === 'reading') return route.panel;
  return null;
}

export function hashForPanel(panel: string): string {
  return hashForRoute({ panel: panel as PanelId });
}

function decodeQuery(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
