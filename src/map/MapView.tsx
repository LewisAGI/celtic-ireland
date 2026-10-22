import { Marker, type Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { entryTitle, pinDimmed } from '../content';
import { displayPositions } from '../spread';
import { LABEL_MIN_ZOOM, visibleLabelIds, type LabelBox } from '../labels';
import type { MappedEntry, PeriodId, ViewMode } from '../types';
import { mapPadding, mountGlobe } from './globe';

interface MapViewProps {
  places: MappedEntry[];
  view: ViewMode;
  period: PeriodId | null;
  selectedId: string | null;
  sheet: boolean;
  expanded: boolean;
  wide: boolean;
  tall: boolean;
  onSelect: (id: string | null) => void;
  onReady: () => void;
}

interface Pin {
  id: string;
  element: HTMLButtonElement;
  label: HTMLElement;
  marker: Marker;
}

export function MapView({ places, view, period, selectedId, sheet, expanded, wide, tall, onSelect, onReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pinsRef = useRef<Pin[]>([]);
  const readyRef = useRef(false);
  const easedRef = useRef<string | null>(null);
  const stateRef = useRef({ places, view, period, selectedId, sheet, expanded, wide, tall });
  const onSelectRef = useRef(onSelect);
  const onReadyRef = useRef(onReady);
  stateRef.current = { places, view, period, selectedId, sheet, expanded, wide, tall };
  onSelectRef.current = onSelect;
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const initial = stateRef.current;
    const { map, ready } = mountGlobe(container, mapPadding(initial.sheet, initial.expanded, initial.wide, initial.tall));
    mapRef.current = map;
    window.__celticMap = map;
    let cancelled = false;
    map.on('click', (event) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('.pin, .sheet, .tools')) return;
      onSelectRef.current(null);
    });
    const relabel = () => {
      if (!mapRef.current) return;
      layoutLabels(mapRef.current, pinsRef.current, stateRef.current.selectedId);
    };
    map.on('zoom', relabel);
    map.on('move', relabel);
    map.on('idle', relabel);
    void ready.then(() => {
      if (cancelled) return;
      readyRef.current = true;
      apply();
      onReadyRef.current();
    });
    return () => {
      cancelled = true;
      readyRef.current = false;
      pinsRef.current.forEach((pin) => pin.marker.remove());
      pinsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    apply();
  }, [places, view, period, selectedId, sheet, expanded, wide, tall]);

  function apply() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const state = stateRef.current;
    const padding = mapPadding(state.sheet, state.expanded, state.wide, state.tall);
    map.setPadding(padding);
    syncPins(map, state.places, state.view, state.period, state.selectedId);
    const selected = state.places.find((place) => place.id === state.selectedId);
    if (!selected || state.view === 'present') {
      easedRef.current = null;
      return;
    }
    if (easedRef.current === selected.id) return;
    easedRef.current = selected.id;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.easeTo({
      center: [selected.coords.lon, selected.coords.lat],
      zoom: Math.max(map.getZoom(), 11),
      padding,
      duration: reduce ? 0 : 500,
    });
  }

  function syncPins(
    map: MapLibreMap,
    nextPlaces: MappedEntry[],
    nextView: ViewMode,
    nextPeriod: PeriodId | null,
    nextSelected: string | null,
  ) {
    const shown = nextView === 'present' ? [] : nextPlaces;
    const positions = displayPositions(shown.map((place) => ({ id: place.id, lat: place.coords.lat, lon: place.coords.lon })));
    const wanted = new Set(shown.map((place) => place.id));
    pinsRef.current.filter((pin) => !wanted.has(pin.id)).forEach((pin) => pin.marker.remove());
    const next: Pin[] = [];
    shown.forEach((place) => {
      let pin = pinsRef.current.find((item) => item.id === place.id);
      if (!pin) {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'pin';
        element.dataset.id = place.id;
        element.setAttribute('aria-label', entryTitle(place));
        element.innerHTML = '<span class="dot"></span><span class="pin-label"></span>';
        const label = element.querySelector('.pin-label') as HTMLElement;
        label.textContent = entryTitle(place);
        element.addEventListener('click', (event) => {
          event.stopPropagation();
          onSelectRef.current(place.id);
        });
        const marker = new Marker({ element, anchor: 'center' }).setLngLat([place.coords.lon, place.coords.lat]).addTo(map);
        pin = { id: place.id, element, label, marker };
      }
      const position = positions.get(place.id);
      if (position) pin.marker.setOffset([position.offsetX, position.offsetY]);
      const dimmed = pinDimmed(place, nextView, nextPeriod);
      pin.element.classList.toggle('is-dimmed', dimmed);
      pin.element.classList.toggle('is-selected', place.id === nextSelected);
      next.push(pin);
    });
    pinsRef.current = next;
    layoutLabels(map, next, nextSelected);
  }

  return <div id="map" ref={containerRef} />;
}

function layoutLabels(map: MapLibreMap, pins: Pin[], selectedId: string | null) {
  const zoom = map.getZoom();
  const boxes: LabelBox[] = [];
  const ordered = [...pins].sort((a, b) => {
    if (a.id === selectedId) return -1;
    if (b.id === selectedId) return 1;
    const aLabel = a.element.getAttribute('aria-label') ?? a.id;
    const bLabel = b.element.getAttribute('aria-label') ?? b.id;
    return aLabel.localeCompare(bLabel);
  });
  ordered.forEach((pin) => pin.label.classList.add('is-on'));
  ordered.forEach((pin) => {
    if (zoom < LABEL_MIN_ZOOM && pin.id !== selectedId) {
      pin.label.classList.remove('is-on');
      return;
    }
    const rect = pin.label.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      pin.label.classList.remove('is-on');
      return;
    }
    boxes.push({ id: pin.id, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
  });
  const visible = visibleLabelIds(boxes);
  pins.forEach((pin) => {
    const on = pin.id === selectedId || (zoom >= LABEL_MIN_ZOOM && visible.has(pin.id));
    pin.label.classList.toggle('is-on', on);
  });
}

declare global {
  interface Window {
    __celticMap?: MapLibreMap;
  }
}
