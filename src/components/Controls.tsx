import { useEffect, useRef, type ReactNode } from 'react';
import { PERIODS } from '../content';
import type { ComparePair } from '../relate';
import type { PanelId, PeriodId, Popout, ViewMode } from '../types';
import {
  IconCompare,
  IconCycles,
  IconDebate,
  IconFilter,
  IconGlossary,
  IconLayers,
  IconMinus,
  IconMyth,
  IconNow,
  IconPeople,
  IconPin,
  IconPlus,
  IconReading,
  IconSearch,
  IconSources,
  IconStone,
  IconTexts,
  IconTime,
} from './Icons';

interface ControlsProps {
  panel: PanelId;
  view: ViewMode;
  period: PeriodId | null;
  query: string;
  pairs: ComparePair[];
  popout: Popout;
  onZoom: (direction: 'in' | 'out') => void;
  onPanel: (panel: PanelId) => void;
  onPopout: (popout: Popout) => void;
  onView: (view: ViewMode) => void;
  onPeriod: (period: PeriodId) => void;
  onQuery: (query: string) => void;
  onCompare: (a: string, b: string) => void;
}

export function Controls({
  panel,
  view,
  period,
  query,
  pairs,
  popout,
  onZoom,
  onPanel,
  onPopout,
  onView,
  onPeriod,
  onQuery,
  onCompare,
}: ControlsProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (popout === 'search') searchRef.current?.focus();
  }, [popout]);

  return (
    <div className="tools" data-popout-root>
      <div className="tool-row">
        <IconButton tip="Zoom in" onClick={() => onZoom('in')}>
          <IconPlus />
        </IconButton>
        <IconButton tip="Zoom out" onClick={() => onZoom('out')}>
          <IconMinus />
        </IconButton>
        <IconButton tip="Search" expanded={popout === 'search'} onClick={() => onPopout(popout === 'search' ? null : 'search')}>
          <IconSearch />
        </IconButton>
        <IconButton tip="The ‘Celts’ label" current={panel === 'debate'} onClick={() => onPanel('debate')}>
          <IconDebate />
        </IconButton>
        <IconButton tip="Places" current={panel === 'places' || panel === 'place'} onClick={() => onPanel('places')}>
          <IconPin />
        </IconButton>
        <IconButton tip="Cycles" current={panel === 'cycles' || panel === 'story'} onClick={() => onPanel('cycles')}>
          <IconCycles />
        </IconButton>
        <IconButton tip="Texts" current={panel === 'texts' || panel === 'text'} onClick={() => onPanel('texts')}>
          <IconTexts />
        </IconButton>
        <IconButton tip="People" current={panel === 'people' || panel === 'person'} onClick={() => onPanel('people')}>
          <IconPeople />
        </IconButton>
        <IconButton tip="Timeline" current={panel === 'timeline' || panel === 'event'} onClick={() => onPanel('timeline')}>
          <IconTime />
        </IconButton>
        <IconButton
          tip="Periods"
          pressed={period != null}
          expanded={popout === 'periods'}
          onClick={() => onPopout(popout === 'periods' ? null : 'periods')}
        >
          <IconFilter />
        </IconButton>
        <IconButton tip="Further reading" current={panel === 'reading'} onClick={() => onPanel('reading')}>
          <IconReading />
        </IconButton>
        <IconButton tip="Glossary" current={panel === 'glossary'} onClick={() => onPanel('glossary')}>
          <IconGlossary />
        </IconButton>
        <IconButton
          tip="Compare"
          current={panel === 'compare'}
          expanded={popout === 'compare'}
          onClick={() => onPopout(popout === 'compare' ? null : 'compare')}
        >
          <IconCompare />
        </IconButton>
        <IconButton tip="Layers" expanded={popout === 'layers'} onClick={() => onPopout(popout === 'layers' ? null : 'layers')}>
          <IconLayers />
        </IconButton>
        <IconButton tip="Sources" current={panel === 'sources'} onClick={() => onPanel('sources')}>
          <IconSources />
        </IconButton>
      </div>
      {popout === 'search' ? (
        <div className="tool-pop tool-pop-field" id="search-pop" data-pop="search">
          <input
            id="search-input"
            ref={searchRef}
            aria-label="Search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
        </div>
      ) : null}
      {popout === 'periods' ? (
        <div className="tool-pop" id="periods-pop" data-pop="periods">
          {PERIODS.map((item) => (
            <IconButton key={item.id} tip={item.tip} pressed={period === item.id} onClick={() => onPeriod(item.id)}>
              <PeriodGlyph id={item.id} />
            </IconButton>
          ))}
        </div>
      ) : null}
      {popout === 'layers' ? (
        <div className="tool-pop" id="layers-pop" data-pop="layers">
          <IconButton tip="Archaeology" current={view === 'archaeology'} onClick={() => onView('archaeology')}>
            <IconStone />
          </IconButton>
          <IconButton tip="Myth" current={view === 'myth'} onClick={() => onView('myth')}>
            <IconMyth />
          </IconButton>
          <IconButton tip="Present day" current={view === 'present'} onClick={() => onView('present')}>
            <IconNow />
          </IconButton>
        </div>
      ) : null}
      {popout === 'compare' ? (
        <div className="tool-pop" id="compare-pop" data-pop="compare">
          {pairs.map((pair) => (
            <IconButton key={pair.id} tip={pair.label} pair={pair.id} onClick={() => onCompare(pair.a, pair.b)}>
              <IconCompare />
            </IconButton>
          ))}
        </div>
      ) : null}
    </div>
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

function IconButton({
  tip,
  current,
  pressed,
  expanded,
  pair,
  onClick,
  children,
}: {
  tip: string;
  current?: boolean;
  pressed?: boolean;
  expanded?: boolean;
  pair?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      data-tip={tip}
      data-pair={pair}
      aria-label={tip}
      aria-current={current ? 'true' : undefined}
      aria-pressed={pressed === undefined ? undefined : pressed}
      aria-expanded={expanded === undefined ? undefined : expanded}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
