import { Map as MapLibreMap, setWorkerUrl, type PaddingOptions, type StyleSpecification } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// Vite does not emit MapLibre's worker unless the URL is set. Without it the
// production build 404s and the land does not draw. Same requirement as the
// history-of-humanity globe.
setWorkerUrl(workerUrl);

export function mountGlobe(container: HTMLElement, padding: PaddingOptions): {
  map: MapLibreMap;
  ready: Promise<void>;
} {
  const narrow = container.clientWidth < 800 || container.clientHeight < 500;
  const map = new MapLibreMap({
    container,
    style: mapStyle(),
    center: [-8.15, 53.35],
    zoom: narrow ? (container.clientHeight < 500 ? 4.55 : 5.15) : 6.05,
    minZoom: 3.2,
    maxZoom: 14,
    maxPitch: 0,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    attributionControl: {
      compact: true,
      customAttribution: 'NASA Blue Marble · Natural Earth · National Monuments Service (CC BY 4.0)',
    },
    maplibreLogo: false,
    fadeDuration: 0,
  });
  map.setPadding(padding);

  const ready = new Promise<void>((resolve) => {
    let started = false;
    const setup = () => {
      if (started) return;
      started = true;
      map.setProjection({ type: 'globe' });
      map.setSky({
        'sky-color': '#070b12',
        'horizon-color': '#8ec5ff',
        'sky-horizon-blend': 0.36,
        'atmosphere-blend': 0.92,
      });
      resolve();
    };
    map.on('style.load', setup);
    if (map.isStyleLoaded()) setup();
  });

  return { map, ready };
}

export function mapPadding(sheet: boolean, expanded: boolean, wide = false, tall = false): PaddingOptions {
  if (!sheet) return { top: 56, bottom: 28, left: wide ? 720 : 460, right: 88 };
  const ratio = tall && expanded ? 0.7 : expanded ? 0.5 : window.innerHeight < 500 ? 0.36 : 0.42;
  return { top: 72, bottom: Math.round(window.innerHeight * ratio), left: 12, right: 16 };
}

function mapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      land: { type: 'geojson', data: '/ne_110m_land.geojson' },
      marble: {
        type: 'raster',
        tiles: [
          'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
        ],
        tileSize: 256,
        maxzoom: 8,
      },
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': '#071018' } },
      { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': '#1a2822' } },
      { id: 'coast', type: 'line', source: 'land', paint: { 'line-color': '#24362e', 'line-width': 0.6 } },
      {
        id: 'marble',
        type: 'raster',
        source: 'marble',
        paint: {
          'raster-saturation': 0.15,
          'raster-contrast': -0.05,
          'raster-brightness-min': 0,
          'raster-brightness-max': 0.92,
        },
      },
    ],
  };
}
