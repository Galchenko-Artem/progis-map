import { create } from "zustand";
import type { GeoJSONFeature } from "../types/geojson";

export type AttrValue = string | number | boolean | null;
export type AttrRecord = Record<string, AttrValue>;
export type LayerVisibility = Record<string, boolean>;
export type PopupState =
  | { lat: number; lng: number; attrs: AttrRecord }
  | null;

type MapState = {
  visible: LayerVisibility;
  highlight: GeoJSONFeature | null;
  popup: PopupState;
  setVisible: (id: string, value: boolean) => void;
  setHighlight: (f: GeoJSONFeature | null) => void;
  showPopup: (lat: number, lng: number, attrs: AttrRecord) => void;
  hidePopup: () => void;
};

export const useMapStore = create<MapState>((set) => ({
  visible: {},
  highlight: null,
  popup: null,
  setVisible: (id, value) =>
    set((s) => ({ visible: { ...s.visible, [id]: value } })),
  setHighlight: (f) => set({ highlight: f }),
  showPopup: (lat, lng, attrs) => set({ popup: { lat, lng, attrs } }),
  hidePopup: () => set({ popup: null }),
}));
