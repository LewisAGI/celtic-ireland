/** Portrait phones, and short landscape phones, use the bottom sheet. */
export const SHEET_QUERY = '(max-width: 800px), (max-height: 700px)';

export function prefersSheet(): boolean {
  return window.matchMedia(SHEET_QUERY).matches;
}

const PAGE_HASH: Record<string, 'people' | 'timeline' | 'reading'> = {
  '#people': 'people',
  '#timeline': 'timeline',
  '#further-reading': 'reading',
};

export function panelForHash(hash: string): 'people' | 'timeline' | 'reading' | null {
  return PAGE_HASH[hash] ?? null;
}

export function hashForPanel(panel: string): string {
  if (panel === 'people') return '#people';
  if (panel === 'timeline') return '#timeline';
  if (panel === 'reading') return '#further-reading';
  return '';
}
