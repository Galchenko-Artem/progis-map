export type WMSSpec = {
  id: string;
  name: string;
  visible: boolean;
  format?: string;
  transparent?: boolean;
  infoFormat?: string;
  srs?: "EPSG:3857" | "EPSG:4326";
  wfsTypeName?: string;
  idField?: string;
  geomField?: string;
};

export const WMS_LAYERS: WMSSpec[] = [
  {
    id: "states",
    name: "topp:states",
    visible: true,
    transparent: true,
    infoFormat: "application/json",
    srs: "EPSG:3857",
    wfsTypeName: "topp:states",
    idField: "STATE_NAME",
    geomField: "the_geom",
  },
];
