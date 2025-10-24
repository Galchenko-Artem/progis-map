import React, { useMemo } from "react";
import { MapContainer, TileLayer, WMSTileLayer, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import { WMS_LAYERS } from "../config/layers";
import { BASEMAP_OSM, OGC } from "../config/env";
import { useMapStore, type AttrRecord, type AttrValue } from "../app/store";
import AttributePopup from "./AttributePopup";
import LayerToggle from "./LayerToggle";
import { wfsGetFeature } from "../services/wfs";
import { buildGFIUrlLeaflet } from "../services/wms";
import type { Feature as GJFeature, FeatureCollection as GJFC } from "geojson";

function isFC(x: unknown): x is GJFC {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return obj["type"] === "FeatureCollection" && Array.isArray(obj["features"]);
}

function normalizeAttrs(obj: unknown): AttrRecord {
  const out: AttrRecord = {};
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      let val: AttrValue;
      if (v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        val = v as AttrValue;
      } else {
        try { val = JSON.stringify(v); } catch { val = null; }
      }
      out[k] = val;
    }
  }
  return out;
}

type ClickBox = { minx: number; miny: number; maxx: number; maxy: number };

function HighlightLayer() {
  const highlight = useMapStore((s) => s.highlight);
  const map = useMap();
  React.useEffect(() => {
    let layer: L.GeoJSON | null = null;
    if (highlight?.geometry) {
      layer = L.geoJSON(highlight as unknown as GJFeature, {
        style: { color: "#ff3333", weight: 3 },
        pointToLayer: (_f: GJFeature, latlng: L.LatLng) => L.circleMarker(latlng, { radius: 6 }),
      }).addTo(map);
    }
    return () => { if (layer) map.removeLayer(layer); };
  }, [highlight, map]);
  return null;
}

function computeClickBBox(map: L.Map, latlng: L.LatLng, srs: "EPSG:4326" | "EPSG:3857", pxPad = 12): ClickBox {
  const p = map.latLngToContainerPoint(latlng);
  const pMin = L.point(p.x - pxPad, p.y - pxPad);
  const pMax = L.point(p.x + pxPad, p.y + pxPad);
  const llMin = map.containerPointToLatLng(pMin);
  const llMax = map.containerPointToLatLng(pMax);
  if (srs === "EPSG:4326") {
    const minLon = Math.min(llMin.lng, llMax.lng);
    const maxLon = Math.max(llMin.lng, llMax.lng);
    const minLat = Math.min(llMin.lat, llMax.lat);
    const maxLat = Math.max(llMin.lat, llMax.lat);
    return { minx: minLon, miny: minLat, maxx: maxLon, maxy: maxLat };
  }
  const prMin = L.CRS.EPSG3857.project(llMin);
  const prMax = L.CRS.EPSG3857.project(llMax);
  return { minx: prMin.x, miny: prMin.y, maxx: prMax.x, maxy: prMax.y };
}

function ClickIdentify() {
  const showPopup = useMapStore((s) => s.showPopup);
  const hidePopup = useMapStore((s) => s.hidePopup);
  const setHighlight = useMapStore((s) => s.setHighlight);
  useMapEvent("click", async (e) => {
    hidePopup();
    setHighlight(null);
    const map = e.target as L.Map;
    for (const layer of WMS_LAYERS) {
      const isVisible = useMapStore.getState().visible[layer.id] ?? layer.visible;
      if (!isVisible) continue;
      const srs: "EPSG:3857" | "EPSG:4326" = (layer.srs as "EPSG:3857" | "EPSG:4326") ?? "EPSG:3857";
      try {
        const gfiUrl = buildGFIUrlLeaflet({
          map,
          click: e.latlng,
          wmsUrl: OGC.wms,
          layerName: layer.name,
          infoFormat: "application/json",
          srs,
        });
        const resp = await fetch(gfiUrl, { headers: { Accept: "application/json" } });
        if (resp.ok) {
          const data: unknown = await resp.json();
          if (isFC(data) && data.features.length > 0) {
            const f = data.features[0] as GJFeature;
            const props = normalizeAttrs(f.properties);
            showPopup(e.latlng.lat, e.latlng.lng, props);
            setHighlight({ ...f, properties: props });
            return;
          }
        }
      } catch (err) {
        console.warn("GFI error:", err);
      }
      if (!layer.wfsTypeName) continue;
      const box = computeClickBBox(map, e.latlng, srs, 12);
      const geom = layer.geomField ?? "the_geom";
      const cql = `BBOX(${geom},${box.minx},${box.miny},${box.maxx},${box.maxy},'${srs}')`;
      try {
        const fc = await wfsGetFeature({
          typeName: layer.wfsTypeName,
          cql,
          maxFeatures: 1,
          srsName: srs,
        });
        if (isFC(fc) && fc.features.length > 0) {
          const f = fc.features[0] as GJFeature;
          const props = normalizeAttrs(f.properties);
          showPopup(e.latlng.lat, e.latlng.lng, props);
          setHighlight({ ...f, properties: props });
          return;
        }
      } catch (err) {
        console.warn("WFS identify error:", err);
      }
    }
  });
  return null;
}

const MapView: React.FC = () => {
  const visible = useMapStore((s) => s.visible);
  React.useEffect(() => {
    const next = { ...useMapStore.getState().visible };
    for (const l of WMS_LAYERS) next[l.id] ??= l.visible;
    useMapStore.setState({ visible: next });
  }, []);
  const activeWms = useMemo(() => WMS_LAYERS.filter((l) => visible[l.id] ?? l.visible), [visible]);

  return (
    <div className="map-root">
      <LayerToggle />
      <MapContainer
        center={[39, -98]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={BASEMAP_OSM}
          attribution="&copy; OpenStreetMap contributors"
          updateWhenIdle
          keepBuffer={1}
        />
        {activeWms.map((l) => (
          <WMSTileLayer
            key={l.id}
            url={OGC.wms}
            layers={l.name}
            format={l.format ?? "image/png"}
            transparent={l.transparent ?? true}
            updateWhenIdle
            keepBuffer={1}
            crossOrigin
          />
        ))}
        <ClickIdentify />
        <HighlightLayer />
        <AttributePopup />
      </MapContainer>
    </div>
  );
};

export default MapView;
