import type {
  Geometry as GJGeometry,
  Feature as GJFeature,
  FeatureCollection as GJFeatureCollection,
  Position as GJPosition,
  Point as GJPoint,
  MultiPoint as GJMultiPoint,
  LineString as GJLineString,
  MultiLineString as GJMultiLineString,
  Polygon as GJPolygon,
  MultiPolygon as GJMultiPolygon,
} from "geojson";

export type Position = GJPosition;
export type Point = GJPoint;
export type MultiPoint = GJMultiPoint;
export type LineString = GJLineString;
export type MultiLineString = GJMultiLineString;
export type Polygon = GJPolygon;
export type MultiPolygon = GJMultiPolygon;

export type Geometry = GJGeometry;
export type Properties = Record<string, unknown>;

export type GeoJSONFeature = GJFeature<Geometry, Properties>;
export type GeoJSONFC = GJFeatureCollection<Geometry, Properties>;
