export type Badge = 'evidence' | 'inference' | 'abstract-only';

export type EntryStatus = 'sourced' | 'placeholder' | 'example';

export interface Coords {
  lat: number;
  lon: number;
  source_format?: string;
}

export interface Entry {
  id: string;
  text: string;
  sources: string[];
  /** Raw pack label. The badge is derived; see badgeFor. */
  label: string;
  coords?: Coords | null;
  uncertainty?: string;
  sensitivity?: string;
  debate?: boolean;
  /** Cycle title, when the pack gives one. */
  name?: string;
  note?: string;
  /** Primary-text catalogue fields. The translation itself is never shown. */
  cycle?: string;
  translator?: string;
  url?: string;
  licence_note?: string;
  /** Pack link from a place to a cycle, when one is given. */
  myth_link?: string;
  figure_type?: string;
  /** Historical year. Negative values are BCE. */
  year?: number;
  /**
   * Omitted entries are the sourced pack.
   * placeholder and example must be shown as example data.
   */
  status?: EntryStatus;
}

export interface Source {
  id: string;
  title: string;
  author_org: string;
  url: string;
  date_accessed: string;
  quality: string;
}

export interface Meta {
  pack: string;
  version: number;
  created: string;
}

export interface Atlas {
  meta: Meta;
  sources: Source[];
  sections: { id: string; entries: Entry[] }[];
}

export interface MappedEntry extends Entry {
  coords: Coords;
}

export type ViewMode = 'archaeology' | 'myth' | 'present';

export type PeriodId = 'neolithic' | 'iron' | 'medieval';

export type PanelId = 'debate' | 'places' | 'cycles' | 'texts' | 'people' | 'timeline' | 'reading' | 'sources';
