import axios, { type AxiosResponse } from "axios";
import { OGC } from "../config/env";
import type { GeoJSONFC } from "../types/geojson";

export type WFSGetFeatureOpts = {
  typeName: string;
  cql?: string;
  bbox?: readonly [number, number, number, number, string];
  srsName?: "EPSG:3857" | "EPSG:4326" | (string & {});
  maxFeatures?: number;
  outputFormat?:
    | "application/json"
    | "application/json; subtype=geojson"
    | (string & {});
};

function isGeoJSONFC(x: unknown): x is GeoJSONFC {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return o["type"] === "FeatureCollection" && Array.isArray(o["features"]);
}

function buildUrl(base: string, opts: WFSGetFeatureOpts, outputFormat: string): string {
  const { typeName, cql, bbox, srsName, maxFeatures } = opts;
  const url = new URL(base);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("version", "2.0.0");
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("typenames", typeName);
  url.searchParams.set("typeName", typeName); // на всякий
  if (srsName) url.searchParams.set("srsName", srsName);
  if (cql) url.searchParams.set("CQL_FILTER", cql);
  if (bbox) url.searchParams.set("BBOX", bbox.join(","));
  if (typeof maxFeatures === "number") {
    url.searchParams.set("count", String(maxFeatures));
    url.searchParams.set("maxFeatures", String(maxFeatures));
  }
  url.searchParams.set("outputFormat", outputFormat);
  url.searchParams.set("exceptions", "application/json");
  return url.toString();
}

export async function wfsGetFeature(opts: WFSGetFeatureOpts): Promise<GeoJSONFC> {
  const fmts: readonly string[] = [
    opts.outputFormat ?? "application/json",
    "application/json; subtype=geojson",
  ];

  for (const fmt of fmts) {
    const urlStr = buildUrl(OGC.wfs, opts, fmt);
    const resp: AxiosResponse<unknown> = await axios.get(urlStr, {
      responseType: "json",
      headers: { Accept: "application/json" },
      validateStatus: () => true,
    });

    if (isGeoJSONFC(resp.data)) return resp.data;

    if (typeof resp.data === "string") {
      try {
        const parsed: unknown = JSON.parse(resp.data);
        if (isGeoJSONFC(parsed)) return parsed;
      } catch {
        /* ignore */
      }
    }
    console.warn("WFS non-GeoJSON:", resp.status, urlStr);
  }

  throw new Error("WFS failed: non-GeoJSON");
}
