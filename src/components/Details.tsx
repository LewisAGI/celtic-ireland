import {
  characterLinks,
  entrySection,
  exampleBanner,
  findEntry,
  presentPrimary,
  shortTitle,
  taleMark,
  timelineLabel,
} from '../content';
import { CELT_NOTICE } from '../notice';
import { comparePairs, glossary, relatedEntries, resultLabel, searchEntries } from '../relate';
import type { Atlas, Entry } from '../types';
import { Badge } from './Badge';
import { CycleGraph } from './CycleGraph';
import { EntryCard } from './EntryCard';

export function TextLink({ entry, atlas }: { entry: Entry; atlas: Atlas }) {
  const presented = presentPrimary(entry, atlas.sources);
  const banner = exampleBanner(entry);
  if ('gap' in presented) {
    return (
      <li data-text-gap={entry.id}>
        {banner ? <p className="example-data">{banner}</p> : null}
        {presented.gap.text}
      </li>
    );
  }
  return (
    <li data-text-link={entry.id} data-academic={presented.link.academicOnly ? 'true' : 'false'}>
      {banner ? <p className="example-data">{banner}</p> : null}
      <a href={presented.link.href} target="_blank" rel="noreferrer noopener">
        {presented.link.title}
      </a>
      {presented.link.academicOnly ? <span className="restriction">Academic use only</span> : null}
      {presented.link.caution ? <span className="restriction">{presented.link.caution}</span> : null}
    </li>
  );
}

export function CrossLinks({
  atlas,
  entries,
  onOpen,
}: {
  atlas: Atlas;
  entries: Entry[];
  onOpen: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="cross-links">
      <h2 className="group-label">Linked in this pack</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <button type="button" className="text-button" data-cross={entry.id} onClick={() => onOpen(entry.id)}>
              {resultLabel(entry, atlas.sources)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompareLinks({
  atlas,
  entryId,
  onCompare,
}: {
  atlas: Atlas;
  entryId: string;
  onCompare: (a: string, b: string) => void;
}) {
  const pairs = comparePairs(atlas).filter((pair) => pair.a === entryId || pair.b === entryId);
  if (pairs.length === 0) return null;
  return (
    <div className="cross-links">
      <h2 className="group-label">Compare</h2>
      <ul>
        {pairs.map((pair) => {
          const otherId = pair.a === entryId ? pair.b : pair.a;
          const other = findEntry(atlas, otherId);
          if (!other) return null;
          return (
            <li key={pair.id}>
              <button type="button" className="text-button" data-compare-open={pair.id} onClick={() => onCompare(pair.a, pair.b)}>
                {shortTitle(other)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SitePage({
  entry,
  atlas,
  onOpen,
  onCompare,
}: {
  entry: Entry;
  atlas: Atlas;
  onOpen: (id: string) => void;
  onCompare: (a: string, b: string) => void;
}) {
  return (
    <>
      <EntryCard entry={entry} atlas={atlas} />
      <CompareLinks atlas={atlas} entryId={entry.id} onCompare={onCompare} />
      <CrossLinks atlas={atlas} entries={relatedEntries(atlas, entry)} onOpen={onOpen} />
    </>
  );
}

export function StoryPage({ entry, atlas, onOpen }: { entry: Entry; atlas: Atlas; onOpen: (id: string) => void }) {
  return (
    <>
      <EntryCard entry={entry} atlas={atlas} />
      <CycleGraph links={characterLinks([entry])} />
      <CrossLinks atlas={atlas} entries={relatedEntries(atlas, entry)} onOpen={onOpen} />
    </>
  );
}

export function TextPage({ entry, atlas, onOpen }: { entry: Entry; atlas: Atlas; onOpen: (id: string) => void }) {
  return (
    <>
      <p id="celt-notice">{CELT_NOTICE}</p>
      <ul className="text-links">
        <TextLink entry={entry} atlas={atlas} />
      </ul>
      <CrossLinks atlas={atlas} entries={relatedEntries(atlas, entry)} onOpen={onOpen} />
    </>
  );
}

export function PersonPage({ entry, atlas, onOpen }: { entry: Entry; atlas: Atlas; onOpen: (id: string) => void }) {
  return (
    <>
      <EntryCard entry={entry} atlas={atlas} />
      <CrossLinks atlas={atlas} entries={relatedEntries(atlas, entry)} onOpen={onOpen} />
    </>
  );
}

export function EventPage({ entry, atlas, onOpen }: { entry: Entry; atlas: Atlas; onOpen: (id: string) => void }) {
  const year = timelineLabel(entry);
  return (
    <>
      {year ? <p className="timeline-year">{year}</p> : null}
      <EntryCard entry={entry} atlas={atlas} />
      <CrossLinks atlas={atlas} entries={relatedEntries(atlas, entry)} onOpen={onOpen} />
    </>
  );
}

export function GlossaryPage({ atlas, onOpen }: { atlas: Atlas; onOpen: (id: string) => void }) {
  return (
    <ul id="glossary" className="glossary">
      {glossary(atlas).map((item) => {
        const entry = findEntry(atlas, item.entryId);
        if (!entry) return null;
        const banner = exampleBanner(entry);
        return (
          <li key={item.term} data-glossary-term={item.term}>
            <button type="button" className="text-button" onClick={() => onOpen(item.entryId)}>
              {item.term}
            </button>
            <Badge label={entry.label} tale={taleMark(entry)} />
            {banner ? <p className="example-data">{banner}</p> : null}
            <p className="entry-text">{item.gloss}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function SearchPage({
  atlas,
  query,
  onOpen,
}: {
  atlas: Atlas;
  query: string;
  onOpen: (id: string) => void;
}) {
  const hits = searchEntries(atlas, query);
  const groups = atlas.sections
    .map((section) => ({
      id: section.id,
      entries: hits.filter((hit) => entrySection(atlas, hit.id) === section.id),
    }))
    .filter((group) => group.entries.length > 0);
  return (
    <div id="search-results" data-search-count={String(hits.length)}>
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="group-label">{sectionLabel(group.id)}</h2>
          <ul className="search-results">
            {group.entries.map((entry) => {
              const banner = exampleBanner(entry);
              return (
                <li key={entry.id} data-search-hit={entry.id}>
                  <button type="button" className="text-button" onClick={() => onOpen(entry.id)}>
                    {resultLabel(entry, atlas.sources)}
                  </button>
                  <Badge label={entry.label} tale={taleMark(entry)} />
                  {banner ? <p className="example-data">{banner}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ComparePage({
  atlas,
  ids,
  onOpen,
}: {
  atlas: Atlas;
  ids: [string, string] | null;
  onOpen: (id: string) => void;
}) {
  if (!ids) return null;
  const entries = ids.map((id) => findEntry(atlas, id)).filter((entry): entry is Entry => entry != null);
  return (
    <div id="compare-view" className="compare-grid" data-compare={ids.join(':')}>
      {entries.map((entry) => (
        <div key={entry.id}>
          {entry.url && entry.cycle ? (
            <ul className="text-links">
              <TextLink entry={entry} atlas={atlas} />
            </ul>
          ) : (
            <EntryCard entry={entry} atlas={atlas} onChoose={() => onOpen(entry.id)} />
          )}
        </div>
      ))}
    </div>
  );
}

function sectionLabel(id: string): string {
  if (id === 'primary_texts') return 'Texts';
  if (id === 'further_reading') return 'Reading';
  if (id === 'history') return 'History';
  return id.slice(0, 1).toUpperCase() + id.slice(1);
}
