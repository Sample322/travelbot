import React, { useEffect, useRef } from 'react';

// Typings for Yandex Maps may not be available, so we declare the
// global ymaps object on the window. When using this component you
// must pass in an API key via props. The component will load the
// Yandex Maps script once and then initialise a map with markers and
// a polyline connecting them.

declare global {
  interface Window {
    ymaps: any;
  }
}

// Helper to load Yandex Maps asynchronously. Returns a promise
// resolved when the API is ready. It caches the loaded state to
// avoid loading the script multiple times.
let yandexLoaded: Promise<void> | null = null;
function loadYandexMaps(key: string, lang = 'ru_RU') {
  if (typeof window === 'undefined') return Promise.resolve();
  if (yandexLoaded) return yandexLoaded;
  yandexLoaded = new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?lang=${lang}&apikey=${key}`;
    script.onload = () => window.ymaps.ready(() => resolve());
    document.head.appendChild(script);
  });
  return yandexLoaded;
}

interface MapYandexProps {
  /**
   * An array of latitude/longitude pairs for the polyline. If empty,
   * the map will not render any markers or lines.
   */
  points: Array<{ lat: number; lng: number; name?: string }>;
  /** API key for Yandex Maps JS API */
  apiKey: string;
  /** Locale code (e.g. 'ru_RU' or 'en_US'). Used when loading the API. */
  lang?: string;
}

export default function MapYandex({ points, apiKey, lang = 'ru_RU' }: MapYandexProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    (async () => {
      if (!mapRef.current || !points || points.length === 0) return;
      await loadYandexMaps(apiKey, lang);
      const center = [points[0].lat, points[0].lng];
      const map = new window.ymaps.Map(mapRef.current, {
        center,
        zoom: 13,
        controls: ['zoomControl']
      });
      const collection = new window.ymaps.GeoObjectCollection({}, { preset: 'islands#redIcon' });
      const lineCoords: number[][] = [];
      points.forEach((p) => {
        if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
        collection.add(new window.ymaps.Placemark([p.lat, p.lng], { balloonContent: p.name || '' }));
        lineCoords.push([p.lat, p.lng]);
      });
      map.geoObjects.add(collection);
      if (lineCoords.length > 1) {
        const polyline = new window.ymaps.Polyline(lineCoords, {}, { strokeWidth: 4 });
        map.geoObjects.add(polyline);
        map.setBounds(polyline.geometry.getBounds(), { checkZoomRange: true, zoomMargin: 20 });
      }
    })();
  }, [points, apiKey, lang]);
  return <div ref={mapRef} style={{ width: '100%', height: '360px', borderRadius: 12 }} />;
}