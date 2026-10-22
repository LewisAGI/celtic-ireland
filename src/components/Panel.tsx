import {
  characterLinks,
  entryTitle,
  findEntry,
  isMapped,
  matchesPeriod,
  sectionEntries,
  timelineEntries,
  timelineLabel,
} from '../content';
import { CELT_NOTICE, NMS_CREDIT, NOTICE } from '../notice';
import { resultLabel } from '../relate';
import type { Atlas, Entry, PanelId, PeriodId } from '../types';
import { CycleGraph } from './CycleGraph';
import {
  ComparePage,
  EventPage,
  GlossaryPage,
  PersonPage,
  SearchPage,
  SitePage,
  StoryPage,
  TextLink,
  TextPage,
} from './Details';
import { EntryCard } from './EntryCard';
import { IconChevron } from './Icons';

interface PanelProps {
  atlas: Atlas;
  panel: PanelId;
  sheet: boolean;
  expanded: boolean;
  focusId: string | null;
  detailId: string | null;
  compareIds: [string, string] | null;
  query: string;
  period: PeriodId | null;
  onToggle: () => void;
  onOpen: (id: string) => void;
  onBack: () => void;
  onCompare: (a: string, b: string) => void;
}

const PAGE_PANELS: PanelId[] = ['people', 'timeline', 'reading', 'glossary', 'compare', 'search', 'place', 'story', 'text', 'person', 'event'];
const DETAIL_PANELS: PanelId[] = ['place', 'story', 'text', 'person', 'event', 'compare'];

export function Panel({
  atlas,
  panel,
  sheet,
  expanded,
  focusId,
  detailId,
  compareIds,
  query,
  period,
  onToggle,
  onOpen,
  onBack,
  onCompare,
}: PanelProps) {
  const detail = detailId ? findEntry(atlas, detailId) : null;
  const page = PAGE_PANELS.includes(panel);
  const title = titleFor(panel, atlas, detail);
  return (
    <section
      className={page ? (panel === 'compare' ? 'sheet is-page is-wide' : 'sheet is-page') : 'sheet'}
      data-expanded={expanded ? 'true' : 'false'}
      data-page={page ? panel : ''}
      aria-label={title}
    >
      <header className="sheet-head">
        <h1>{title}</h1>
        <div className="sheet-actions">
          {DETAIL_PANELS.includes(panel) ? (
            <button type="button" className="icon-button sheet-toggle" data-tip="Back" aria-label="Back" onClick={onBack}>
              <IconChevron direction="left" />
            </button>
          ) : null}
          {sheet ? (
            <button
              type="button"
              className="icon-button sheet-toggle"
              data-tip={expanded ? 'Collapse' : 'Expand'}
              aria-label={expanded ? 'Collapse' : 'Expand'}
              aria-expanded={expanded}
              onClick={onToggle}
            >
              <IconChevron direction={expanded ? 'down' : 'up'} />
            </button>
          ) : null}
        </div>
      </header>
      <div className="sheet-body">
        {panel === 'debate' ? <DebateList atlas={atlas} focusId={focusId} /> : null}
        {panel === 'places' ? <PlaceList atlas={atlas} focusId={focusId} period={period} onOpen={onOpen} /> : null}
        {panel === 'place' && detail ? <SitePage entry={detail} atlas={atlas} onOpen={onOpen} onCompare={onCompare} /> : null}
        {panel === 'cycles' ? <CycleList atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'story' && detail ? <StoryPage entry={detail} atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'texts' ? <TextLinks atlas={atlas} /> : null}
        {panel === 'text' && detail ? <TextPage entry={detail} atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'people' ? <PeoplePage atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'person' && detail ? <PersonPage entry={detail} atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'timeline' ? <TimelinePage atlas={atlas} period={period} onOpen={onOpen} /> : null}
        {panel === 'event' && detail ? <EventPage entry={detail} atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'reading' ? <ReadingPage atlas={atlas} focusId={focusId} /> : null}
        {panel === 'glossary' ? <GlossaryPage atlas={atlas} onOpen={onOpen} /> : null}
        {panel === 'search' ? <SearchPage atlas={atlas} query={query} onOpen={onOpen} /> : null}
        {panel === 'compare' ? <ComparePage atlas={atlas} ids={compareIds} onOpen={onOpen} /> : null}
        {panel === 'sources' ? <SourcesPage atlas={atlas} /> : null}
      </div>
    </section>
  );
}

function DebateList({ atlas, focusId }: { atlas: Atlas; focusId: string | null }) {
  const history = sectionEntries(atlas, 'history');
  const debate = history.filter((entry) => entry.debate);
  const rest = history.filter((entry) => !entry.debate);
  return (
    <>
      {[...debate, ...rest].map((entry) => (
        <EntryCard key={entry.id} entry={entry} atlas={atlas} focused={focusId === entry.id} />
      ))}
    </>
  );
}

function PlaceList({
  atlas,
  focusId,
  period,
  onOpen,
}: {
  atlas: Atlas;
  focusId: string | null;
  period: PeriodId | null;
  onOpen: (id: string) => void;
}) {
  const places = sectionEntries(atlas, 'places');
  const mapped = places.filter(isMapped);
  const unmapped = places.filter((entry) => !isMapped(entry));
  return (
    <>
      <h2 className="group-label">On the map</h2>
      {mapped.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          atlas={atlas}
          focused={focusId === entry.id}
          match={period ? matchesPeriod(entry, period) : null}
          onChoose={() => onOpen(entry.id)}
        />
      ))}
      {unmapped.length > 0 ? (
        <>
          <h2 className="group-label">No coordinates in this pack</h2>
          {unmapped.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              atlas={atlas}
              match={period ? matchesPeriod(entry, period) : null}
              onChoose={() => onOpen(entry.id)}
            />
          ))}
        </>
      ) : null}
    </>
  );
}

function CycleList({ atlas, onOpen }: { atlas: Atlas; onOpen: (id: string) => void }) {
  const cycles = sectionEntries(atlas, 'cycles');
  return (
    <>
      {cycles.filter((entry) => !entry.name).map((entry) => (
        <EntryCard key={entry.id} entry={entry} atlas={atlas} onChoose={() => onOpen(entry.id)} />
      ))}
      <CycleGraph links={characterLinks(cycles)} />
      {cycles.filter((entry) => entry.name).map((entry) => (
        <EntryCard key={entry.id} entry={entry} atlas={atlas} onChoose={() => onOpen(entry.id)} />
      ))}
    </>
  );
}

function TextLinks({ atlas }: { atlas: Atlas }) {
  const entries = sectionEntries(atlas, 'primary_texts');
  const groups = ['Mythological', 'Ulster', 'Fenian', 'Kings'].map((cycle) => ({
    cycle,
    entries: entries.filter((entry) => entry.cycle === cycle),
  }));
  return (
    <>
      <p id="celt-notice">{CELT_NOTICE}</p>
      {groups.map((group) =>
        group.entries.length === 0 ? null : (
          <section key={group.cycle} data-text-cycle={group.cycle}>
            <h2 className="group-label">{group.cycle}</h2>
            <ul className="text-links">
              {group.entries.map((entry) => (
                <TextLink key={entry.id} entry={entry} atlas={atlas} />
              ))}
            </ul>
          </section>
        ),
      )}
    </>
  );
}

function PeoplePage({ atlas, onOpen }: { atlas: Atlas; onOpen: (id: string) => void }) {
  const entries = sectionEntries(atlas, 'people');
  return (
    <>
      {['mythological', 'scholar'].map((type) => {
        const group = entries.filter((entry) => entry.figure_type === type);
        if (group.length === 0) return null;
        return (
          <section key={type} data-people={type}>
            <h2 className="group-label">{type === 'mythological' ? 'Mythological' : 'Scholar'}</h2>
            {group.map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} onChoose={() => onOpen(entry.id)} />
            ))}
          </section>
        );
      })}
    </>
  );
}

function TimelinePage({
  atlas,
  period,
  onOpen,
}: {
  atlas: Atlas;
  period: PeriodId | null;
  onOpen: (id: string) => void;
}) {
  return (
    <ol className="timeline-list">
      {timelineEntries(atlas).map((entry) => {
        const year = timelineLabel(entry);
        const match = period ? matchesPeriod(entry, period) : null;
        return (
          <li key={entry.id} data-timeline={entry.id} data-year={entry.year} data-match={match == null ? 'all' : match ? 'true' : 'false'}>
            {year ? <p className="timeline-year">{year}</p> : null}
            <EntryCard entry={entry} atlas={atlas} match={match} onChoose={() => onOpen(entry.id)} />
          </li>
        );
      })}
    </ol>
  );
}

function ReadingPage({ atlas, focusId }: { atlas: Atlas; focusId: string | null }) {
  return (
    <>
      {sectionEntries(atlas, 'further_reading').map((entry) => (
        <EntryCard key={entry.id} entry={entry} atlas={atlas} focused={focusId === entry.id} />
      ))}
    </>
  );
}

function SourcesPage({ atlas }: { atlas: Atlas }) {
  return (
    <>
      <p id="notice">{NOTICE}</p>
      <p id="nms-credit">{NMS_CREDIT}</p>
      <ul className="source-index">
        {atlas.sources.map((source) => (
          <li key={source.id} data-source={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer noopener">
              {source.title}
            </a>
            <span>{source.author_org}</span>
            <span>{source.quality}</span>
            <span>Accessed {source.date_accessed}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function titleFor(panel: PanelId, atlas: Atlas, detail: Entry | null): string {
  if (detail && (panel === 'place' || panel === 'story' || panel === 'person' || panel === 'event')) {
    return entryTitle(detail);
  }
  if (detail && panel === 'text') return resultLabel(detail, atlas.sources);
  if (panel === 'debate') return 'The ‘Celts’ label';
  if (panel === 'places' || panel === 'place') return 'Places';
  if (panel === 'cycles' || panel === 'story') return 'Cycles';
  if (panel === 'texts' || panel === 'text') return 'Texts';
  if (panel === 'people' || panel === 'person') return 'People';
  if (panel === 'timeline' || panel === 'event') return 'Timeline';
  if (panel === 'reading') return 'Further reading';
  if (panel === 'glossary') return 'Glossary';
  if (panel === 'search') return 'Search';
  if (panel === 'compare') return 'Compare';
  return 'Sources';
}
