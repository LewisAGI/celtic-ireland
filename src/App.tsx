import { useEffect, useState } from 'react';
import { Controls } from './components/Controls';
import { Panel } from './components/Panel';
import { atlas, mappedEntries, visiblePins } from './content';
import { hashForPanel, panelForHash, prefersSheet } from './layout';
import { MapView } from './map/MapView';
import type { PanelId, PeriodId, ViewMode } from './types';

const PAGE_PANELS: PanelId[] = ['people', 'timeline', 'reading'];

export function App() {
  const landing = panelForHash(window.location.hash);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState(prefersSheet);
  const [panel, setPanel] = useState<PanelId>(landing ?? 'debate');
  const [expanded, setExpanded] = useState(!prefersSheet() || landing != null);
  const [view, setView] = useState<ViewMode>('archaeology');
  const [period, setPeriod] = useState<PeriodId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popout, setPopout] = useState<'layers' | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const places = visiblePins(mappedEntries(atlas), view);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px), (max-height: 700px)');
    const onChange = () => {
      const next = media.matches;
      setSheet(next);
      if (!next) setExpanded(true);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let timer: number | null = null;
    const clear = () => {
      if (timer) window.clearTimeout(timer);
      timer = null;
      document.querySelectorAll('.is-long-tip').forEach((node) => node.classList.remove('is-long-tip'));
    };
    const down = (event: PointerEvent) => {
      clear();
      const element = event.target instanceof Element ? event.target : null;
      const host = element?.closest<HTMLElement>('[data-tip]');
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (host && (!fine || event.pointerType === 'touch')) {
        timer = window.setTimeout(() => host.classList.add('is-long-tip'), 500);
      }
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointerup', clear);
    document.addEventListener('pointercancel', clear);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', clear);
      document.removeEventListener('pointercancel', clear);
      clear();
    };
  }, []);

  useEffect(() => {
    if (!popout) return;
    const down = (event: PointerEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element?.closest('[data-popout-root]')) setPopout(null);
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [popout]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setPopout(null);
      setSelectedId(null);
      setPanel('debate');
      syncHash('debate');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const next = panelForHash(window.location.hash);
      if (!next) {
        setPanel((current) => (PAGE_PANELS.includes(current) ? 'debate' : current));
        return;
      }
      setPanel(next);
      setExpanded(true);
      setPopout(null);
      setSelectedId(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`entry-${selectedId}`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedId, panel]);

  function syncHash(next: PanelId) {
    const hash = hashForPanel(next);
    const url = `${window.location.pathname}${window.location.search}${hash}`;
    const onPage = panelForHash(window.location.hash) != null;
    if (hash) {
      if (window.location.hash !== hash) history.pushState(null, '', url);
      return;
    }
    if (onPage) history.pushState(null, '', url);
  }

  function openPanel(next: PanelId) {
    setPanel(next);
    setExpanded(true);
    setPopout(null);
    if (next !== 'places') setSelectedId(null);
    syncHash(next);
  }

  function chooseView(next: ViewMode) {
    setView(next);
    setPopout(null);
    if (next === 'present') {
      setSelectedId(null);
      return;
    }
    setPanel('debate');
    setExpanded(true);
    setFocusId(next === 'archaeology' ? 'h2' : 'h3');
    setSelectedId(null);
    syncHash('debate');
  }

  function choosePeriod(next: PeriodId) {
    setPeriod((current) => (current === next ? null : next));
    setPopout(null);
  }

  function selectPlace(id: string | null) {
    if (!id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setPanel('places');
    setExpanded(true);
    setPopout(null);
    setFocusId(id);
    syncHash('places');
  }

  return (
    <div
      id="app"
      data-ready={ready ? 'true' : 'false'}
      data-layout={sheet ? 'sheet' : 'panel'}
      data-expanded={expanded ? 'true' : 'false'}
      data-view={view}
      data-panel={panel}
      data-period={period ?? ''}
      data-pins={String(places.length)}
    >
      <MapView
        places={places}
        view={view}
        period={period}
        selectedId={selectedId}
        sheet={sheet}
        expanded={expanded}
        onSelect={selectPlace}
        onReady={() => setReady(true)}
      />
      <p className="wordmark">Celtic Ireland</p>
      <Controls
        panel={panel}
        view={view}
        periodActive={period != null}
        popout={popout}
        onZoom={(direction) => {
          const map = window.__celticMap;
          if (!map) return;
          if (direction === 'in') map.zoomIn({ duration: 200 });
          else map.zoomOut({ duration: 200 });
        }}
        onPanel={openPanel}
        onPopout={setPopout}
        onView={chooseView}
      />
      <Panel
        atlas={atlas}
        panel={panel}
        sheet={sheet}
        expanded={expanded}
        focusId={focusId}
        period={period}
        onToggle={() => setExpanded((value) => !value)}
        onPeriod={choosePeriod}
        onChoosePlace={(id) => selectPlace(id)}
      />
    </div>
  );
}
