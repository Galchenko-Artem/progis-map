import L, { type Map as LMap, type LatLng } from "leaflet";

export function buildGFIUrlLeaflet(opts: {
  map: LMap;
  click: LatLng;
  wmsUrl: string;
  layerName: string;
  infoFormat?: "application/json" | (string & {});
  srs?: "EPSG:3857" | "EPSG:4326" | (string & {});
}): string {
  const { map, click, wmsUrl, layerName, infoFormat = "application/json", srs = "EPSG:3857" } = opts;
  const size = map.getSize();
  const b = map.getBounds();
  const sw = b.getSouthWest();
  const ne = b.getNorthEast();
  const bbox =
    srs === "EPSG:4326"
      ? [sw.lng, sw.lat, ne.lng, ne.lat]
      : (() => {
          const p1 = L.CRS.EPSG3857.project(sw);
          const p2 = L.CRS.EPSG3857.project(ne);
          return [p1.x, p1.y, p2.x, p2.y];
        })();
  const pt = map.latLngToContainerPoint(click);
  const url = new URL(wmsUrl);
  url.searchParams.set("SERVICE", "WMS");
  url.searchParams.set("VERSION", "1.1.1"); 
  url.searchParams.set("REQUEST", "GetFeatureInfo");
  url.searchParams.set("SRS", srs);
  url.searchParams.set("BBOX", bbox.join(","));
  url.searchParams.set("WIDTH", String(size.x));
  url.searchParams.set("HEIGHT", String(size.y));
  url.searchParams.set("LAYERS", layerName);
  url.searchParams.set("QUERY_LAYERS", layerName);
  url.searchParams.set("STYLES", "");
  url.searchParams.set("FORMAT", "image/png");
  url.searchParams.set("INFO_FORMAT", infoFormat);
  url.searchParams.set("FEATURE_COUNT", "5");
  url.searchParams.set("X", String(Math.round(pt.x)));
  url.searchParams.set("Y", String(Math.round(pt.y)));
  url.searchParams.set("TILED", "true");
  return url.toString();
}
