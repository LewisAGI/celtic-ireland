import type { ReactNode } from 'react';
import type { PanelId, ViewMode } from '../types';
import {
  IconCycles,
  IconDebate,
  IconLayers,
  IconMinus,
  IconMyth,
  IconNow,
  IconPeople,
  IconPin,
  IconPlus,
  IconReading,
  IconSources,
  IconStone,
  IconTexts,
  IconTime,
} from './Icons';

interface ControlsProps {
  panel: PanelId;
  view: ViewMode;
  periodActive: boolean;
  popout: 'layers' | null;
  onZoom: (direction: 'in' | 'out') => void;
  onPanel: (panel: PanelId) => void;
  onPopout: (popout: 'layers' | null) => void;
  onView: (view: ViewMode) => void;
}

export function Controls({ panel, view, periodActive, popout, onZoom, onPanel, onPopout, onView }: ControlsProps) {
  return (
    <div className="tools">
      <IconButton tip="Zoom in" onClick={() => onZoom('in')}>
        <IconPlus />
      </IconButton>
      <IconButton tip="Zoom out" onClick={() => onZoom('out')}>
        <IconMinus />
      </IconButton>
      <IconButton tip="The ‘Celts’ label" current={panel === 'debate'} onClick={() => onPanel('debate')}>
        <IconDebate />
      </IconButton>
      <IconButton tip="Places" current={panel === 'places'} onClick={() => onPanel('places')}>
        <IconPin />
      </IconButton>
      <IconButton tip="Cycles" current={panel === 'cycles'} onClick={() => onPanel('cycles')}>
        <IconCycles />
      </IconButton>
      <IconButton tip="Texts" current={panel === 'texts'} onClick={() => onPanel('texts')}>
        <IconTexts />
      </IconButton>
      <IconButton tip="People" current={panel === 'people'} onClick={() => onPanel('people')}>
        <IconPeople />
      </IconButton>
      <IconButton tip="Timeline" current={panel === 'timeline' || periodActive} onClick={() => onPanel('timeline')}>
        <IconTime />
      </IconButton>
      <IconButton tip="Further reading" current={panel === 'reading'} onClick={() => onPanel('reading')}>
        <IconReading />
      </IconButton>
      <div className="tool" data-popout-root>
        <IconButton
          tip="Layers"
          expanded={popout === 'layers'}
          onClick={() => onPopout(popout === 'layers' ? null : 'layers')}
        >
          <IconLayers />
        </IconButton>
        {popout === 'layers' ? (
          <div className="tool-pop" id="layers-pop">
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
      </div>
      <IconButton tip="Sources" current={panel === 'sources'} onClick={() => onPanel('sources')}>
        <IconSources />
      </IconButton>
    </div>
  );
}

function IconButton({
  tip,
  current,
  expanded,
  onClick,
  children,
}: {
  tip: string;
  current?: boolean;
  expanded?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      data-tip={tip}
      aria-label={tip}
      aria-current={current ? 'true' : undefined}
      aria-expanded={expanded === undefined ? undefined : expanded}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

