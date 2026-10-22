import { useEffect, useRef, useState } from 'react';
import { Controls } from './components/Controls';
import { Panel } from './components/Panel';
import { atlas, entrySection, findEntry, isMapped, mappedEntries, visiblePins } from './content';
import { hashForRoute, prefersSheet, routeForHash, type Route } from './layout';
import { MapView } from './map/MapView';
import { comparePairs } from './relate';
import type { PanelId, PeriodId, Popout, ViewMode } from './types';

const DETAIL_PANELS: PanelId[] = ['place', 'story', 'text', 'person', 'event', 'search', 'glossary', 'compare', 'people', 'timeline', 'reading'];
const TALL_PANELS: PanelId[] = ['people', 'timeline', 'reading', 'glossary', 'compare', 'search', 'place', 'story', 'text', 'person', 'event'];

function expectedSection(panel: PanelId): string | null {
  if (panel === 'place') return 'places';
  if (panel === 'story') return 'cycles';
  if (panel === 'text') return 'primary_texts';
  if (panel === 'person') return 'people';
  if (panel === 'event') return 'timeline';
  return null;
}

export function App() {
  const initial = routeForHash(window.location.hash);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState(prefersSheet);
  const [panel, setPanel] = useState<PanelId>(initial?.panel ?? 'debate');
  const [detailId, setDetailId] = useState<string | null>(initial?.id ?? null);
  const [compareIds, setCompareIds] = useState<[string, string] | null>(initial?.compare ?? null);
  const [query, setQuery] = useState(initial?.query ?? '');
  const [expanded, setExpanded] = useState(!prefersSheet() || initial != null);
  const [view, setView] = useState<ViewMode>('archaeology');
  const [period, setPeriod] = useState<PeriodId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initial?.panel === 'place' ? initial.id ?? null : null);
  const [popout, setPopout] = useState<Popout>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const searchMarked = useRef(initial?.panel === 'search');
  const places = visiblePins(mappedEntries(atlas), view);
  const wide = panel === 'compare';
  const tall = TALL_PANELS.includes(panel);

  const commitRoute = (route: Route | null) => {
    searchMarked.current = route?.panel === 'search';
    if (!route) {
      setPanel((current) => (DETAIL_PANELS.includes(current) ? 'debate' : current));
      setDetailId(null);
      setCompareIds(null);
      setSelectedId(null);
      return;
    }
    const section = route.id ? entrySection(atlas, route.id) : null;
    const wanted = expectedSection(route.panel);
    if (route.id && wanted && section !== wanted) {
      setPanel(listFor(wanted));
      setDetailId(null);
      setSelectedId(null);
    } else {
      setPanel(route.panel);
      setDetailId(route.id ?? null);
      setSelectedId(route.panel === 'place' && route.id ? route.id : null);
    }
    setCompareIds(route.compare ?? null);
    if (route.query != null) setQuery(route.query);
    setExpanded(true);
    setPopout(null);
  };
  const commitRef = useRef(commitRoute);
  commitRef.current = commitRoute;

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
    const down = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element?.closest('[data-popout-root]')) setPopout(null);
    };
    document.addEventListener('click', down);
    return () => document.removeEventListener('click', down);
  }, [popout]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setPopout(null);
      setSelectedId(null);
      setDetailId(null);
      setCompareIds(null);
      setPanel('debate');
      syncHash('', 'push');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onHash = () => commitRef.current(routeForHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const id = detailId ?? selectedId ?? focusId;
    if (!id) return;
    document.getElementById(`entry-${id}`)?.scrollIntoView({ block: 'nearest' });
  }, [detailId, selectedId, focusId, panel]);

  function syncHash(hash: string, mode: 'push' | 'replace') {
    const next = `${window.location.pathname}${window.location.search}${hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current) return;
    if (mode === 'replace') history.replaceState(null, '', next);
    else history.pushState(null, '', next);
  }

  function openPanel(next: PanelId) {
    setPanel(next);
    setExpanded(true);
    setPopout(null);
    setDetailId(null);
    setCompareIds(null);
    if (next !== 'places' && next !== 'place') setSelectedId(null);
    if (next !== 'search') searchMarked.current = false;
    syncHash(hashForRoute({ panel: next, query: next === 'search' ? query : undefined }), 'push');
  }

  function openEntry(id: string) {
    const section = entrySection(atlas, id);
    setPopout(null);
    setFocusId(id);
    setExpanded(true);
    setCompareIds(null);
    if (section === 'places') {
      setSelectedId(id);
      setPanel('place');
      setDetailId(id);
      syncHash(`#place/${id}`, 'push');
      return;
    }
    if (section === 'cycles') {
      setSelectedId(null);
      setPanel('story');
      setDetailId(id);
      syncHash(`#story/${id}`, 'push');
      return;
    }
    if (section === 'primary_texts') {
      setSelectedId(null);
      setPanel('text');
      setDetailId(id);
      syncHash(`#text/${id}`, 'push');
      return;
    }
    if (section === 'people') {
      setSelectedId(null);
      setPanel('person');
      setDetailId(id);
      syncHash(`#person/${id}`, 'push');
      return;
    }
    if (section === 'timeline') {
      setSelectedId(null);
      setPanel('event');
      setDetailId(id);
      syncHash(`#event/${id}`, 'push');
      return;
    }
    if (section === 'further_reading') {
      setSelectedId(null);
      setPanel('reading');
      setDetailId(null);
      syncHash('#further-reading', 'push');
      return;
    }
    setSelectedId(null);
    setPanel('debate');
    setDetailId(null);
    syncHash('', 'push');
  }

  function openCompare(a: string, b: string) {
    const [left, right] = a < b ? [a, b] : [b, a];
    setCompareIds([left, right]);
    setPanel('compare');
    setDetailId(null);
    setExpanded(true);
    setPopout(null);
    const place = [left, right]
      .map((id) => findEntry(atlas, id))
      .find((entry) => entry && entrySection(atlas, entry.id) === 'places' && isMapped(entry));
    setSelectedId(place ? place.id : null);
    syncHash(`#compare/${left}/${right}`, 'push');
  }

  function onQuery(value: string) {
    setQuery(value);
    setPanel('search');
    setDetailId(null);
    setSelectedId(null);
    setCompareIds(null);
    setExpanded(true);
    const hash = hashForRoute({ panel: 'search', query: value });
    syncHash(hash, searchMarked.current ? 'replace' : 'push');
    searchMarked.current = true;
  }

  function chooseView(next: ViewMode) {
    setView(next);
    setPopout(null);
    if (next === 'present') {
      setSelectedId(null);
      return;
    }
    setPanel('debate');
    setDetailId(null);
    setExpanded(true);
    setFocusId(next === 'archaeology' ? 'h2' : 'h3');
    setSelectedId(null);
    syncHash('', 'push');
  }

  function choosePeriod(next: PeriodId) {
    setPeriod((current) => (current === next ? null : next));
    setPopout(null);
  }

  function back() {
    if (panel === 'place') openPanel('places');
    else if (panel === 'story') openPanel('cycles');
    else if (panel === 'text') openPanel('texts');
    else if (panel === 'person') openPanel('people');
    else if (panel === 'event') openPanel('timeline');
    else if (panel === 'compare') openPanel('places');
    else openPanel('debate');
  }

  function selectPlace(id: string | null) {
    if (!id) {
      setSelectedId(null);
      return;
    }
    openEntry(id);
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
      data-popout={popout ?? ''}
      data-pins={String(places.length)}
    >
      <MapView
        places={places}
        view={view}
        period={period}
        selectedId={selectedId}
        sheet={sheet}
        expanded={expanded}
        wide={wide}
        tall={tall}
        onSelect={selectPlace}
        onReady={() => setReady(true)}
      />
      <p className="wordmark">Celtic Ireland</p>
      <Controls
        panel={panel}
        view={view}
        period={period}
        query={query}
        pairs={comparePairs(atlas)}
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
        onPeriod={choosePeriod}
        onQuery={onQuery}
        onCompare={openCompare}
      />
      <Panel
        atlas={atlas}
        panel={panel}
        sheet={sheet}
        expanded={expanded}
        focusId={focusId}
        detailId={detailId}
        compareIds={compareIds}
        query={query}
        period={period}
        onToggle={() => setExpanded((value) => !value)}
        onOpen={openEntry}
        onBack={back}
        onCompare={openCompare}
      />
    </div>
  );
}

function listFor(section: string): PanelId {
  if (section === 'places') return 'places';
  if (section === 'cycles') return 'cycles';
  if (section === 'primary_texts') return 'texts';
  if (section === 'people') return 'people';
  if (section === 'timeline') return 'timeline';
  return 'debate';
}
