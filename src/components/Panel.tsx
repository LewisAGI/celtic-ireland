import { PERIODS, characterLinks, debateEntries, isMapped, matchesPeriod, presentPrimary, sectionEntries, timelineEntries } from '../content';
import { CELT_NOTICE, NMS_CREDIT, NOTICE } from '../notice';
import type { Atlas, Entry, PanelId, PeriodId } from '../types';
import { CycleGraph } from './CycleGraph';
import { EntryCard } from './EntryCard';
import { IconChevron } from './Icons';

interface PanelProps {
  atlas: Atlas;
  panel: PanelId;
  sheet: boolean;
  expanded: boolean;
  focusId: string | null;
  period: PeriodId | null;
  onToggle: () => void;
  onPeriod: (period: PeriodId) => void;
  onChoosePlace: (id: string) => void;
}

export function Panel({ atlas, panel, sheet, expanded, focusId, period, onToggle, onPeriod, onChoosePlace }: PanelProps) {
  const history = sectionEntries(atlas, 'history');
  const debate = debateEntries(atlas);
  const rest = history.filter((entry) => !entry.debate);
  const places = sectionEntries(atlas, 'places');
  const cycles = sectionEntries(atlas, 'cycles');
  const texts = sectionEntries(atlas, 'primary_texts');
  const people = sectionEntries(atlas, 'people');
  const reading = sectionEntries(atlas, 'further_reading');
  const links = characterLinks(cycles);
  const page = panel === 'people' || panel === 'timeline' || panel === 'reading';
  return (
    <section className={page ? 'sheet is-page' : 'sheet'} data-expanded={expanded ? 'true' : 'false'} data-page={page ? panel : ''} aria-label={titleFor(panel)}>
      <header className="sheet-head">
        <h1>{titleFor(panel)}</h1>
        {sheet ? (
          <button type="button" className="icon-button sheet-toggle" data-tip={expanded ? 'Collapse' : 'Expand'} aria-label={expanded ? 'Collapse' : 'Expand'} aria-expanded={expanded} onClick={onToggle}>
            <IconChevron direction={expanded ? 'down' : 'up'} />
          </button>
        ) : null}
      </header>
      <div className="sheet-body">
        {panel === 'debate' ? (
          <>
            {debate.map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} focused={focusId === entry.id} />
            ))}
            {rest.map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} focused={focusId === entry.id} />
            ))}
          </>
        ) : null}
        {panel === 'places' ? <PlaceList places={places} atlas={atlas} focusId={focusId} onChoosePlace={onChoosePlace} /> : null}
        {panel === 'cycles' ? (
          <>
            {cycles.filter((entry) => !entry.name).map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} />
            ))}
            <CycleGraph links={links} />
            {cycles.filter((entry) => entry.name).map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} />
            ))}
          </>
        ) : null}
        {panel === 'texts' ? <TextLinks entries={texts} atlas={atlas} /> : null}
        {panel === 'people' ? <PeoplePage entries={people} atlas={atlas} /> : null}
        {panel === 'timeline' ? (
          <TimelinePage atlas={atlas} period={period} onPeriod={onPeriod} />
        ) : null}
        {panel === 'reading' ? (
          <>
            {reading.map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} />
            ))}
          </>
        ) : null}
        {panel === 'sources' ? (
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
        ) : null}
      </div>
    </section>
  );
}

function PlaceList({
  places,
  atlas,
  focusId,
  onChoosePlace,
}: {
  places: Entry[];
  atlas: Atlas;
  focusId: string | null;
  onChoosePlace: (id: string) => void;
}) {
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
          onChoose={() => onChoosePlace(entry.id)}
        />
      ))}
      {unmapped.length > 0 ? (
        <>
          <h2 className="group-label">No coordinates in this pack</h2>
          {unmapped.map((entry) => (
            <EntryCard key={entry.id} entry={entry} atlas={atlas} />
          ))}
        </>
      ) : null}
    </>
  );
}

function TextLinks({ entries, atlas }: { entries: Entry[]; atlas: Atlas }) {
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
              {group.entries.map((entry) => {
                const presented = presentPrimary(entry, atlas.sources);
                if ('gap' in presented) {
                  return (
                    <li key={entry.id} data-text-gap={entry.id}>
                      {presented.gap.text}
                    </li>
                  );
                }
                return (
                  <li key={entry.id} data-text-link={entry.id} data-academic={presented.link.academicOnly ? 'true' : 'false'}>
                    <a href={presented.link.href} target="_blank" rel="noreferrer noopener">
                      {presented.link.title}
                    </a>
                    {presented.link.academicOnly ? <span className="restriction">Academic use only</span> : null}
                    {presented.link.caution ? <span className="restriction">{presented.link.caution}</span> : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ),
      )}
    </>
  );
}

function PeoplePage({ entries, atlas }: { entries: Entry[]; atlas: Atlas }) {
  const types = ['mythological', 'scholar'];
  return (
    <>
      {types.map((type) => {
        const group = entries.filter((entry) => entry.figure_type === type);
        if (group.length === 0) return null;
        return (
          <section key={type} data-people={type}>
            <h2 className="group-label">{type === 'mythological' ? 'Mythological' : 'Scholar'}</h2>
            {group.map((entry) => (
              <EntryCard key={entry.id} entry={entry} atlas={atlas} />
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
  onPeriod,
}: {
  atlas: Atlas;
  period: PeriodId | null;
  onPeriod: (period: PeriodId) => void;
}) {
  return (
    <>
      <div className="period-row" id="timeline-periods">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="icon-button"
            data-tip={item.tip}
            aria-label={item.tip}
            aria-current={period === item.id ? 'true' : undefined}
            onClick={() => onPeriod(item.id)}
          >
            <PeriodGlyph id={item.id} />
          </button>
        ))}
      </div>
      <ol className="timeline-list">
        {timelineEntries(atlas).map((entry) => (
          <li key={entry.id} data-timeline={entry.id} data-year={entry.year} data-match={period && matchesPeriod(entry, period) ? 'true' : 'false'}>
            <EntryCard entry={entry} atlas={atlas} />
          </li>
        ))}
      </ol>
    </>
  );
}

function PeriodGlyph({ id }: { id: PeriodId }) {
  if (id === 'neolithic') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    );
  }
  if (id === 'iron') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 16l5-9 5 9H7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 16V9.5M12 16V7M18 16v-4M4.5 16h15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function titleFor(panel: PanelId): string {
  if (panel === 'debate') return 'The ‘Celts’ label';
  if (panel === 'places') return 'Places';
  if (panel === 'cycles') return 'Cycles';
  if (panel === 'texts') return 'Texts';
  if (panel === 'people') return 'People';
  if (panel === 'timeline') return 'Timeline';
  if (panel === 'reading') return 'Further reading';
  return 'Sources';
}
