import { Popup } from "react-leaflet";
import { useMapStore } from "../app/store";

export default function AttributePopup() {
  const popup = useMapStore((s) => s.popup);
  const hide = useMapStore((s) => s.hidePopup);
  if (!popup) return null;

  const { lat, lng, attrs } = popup;

  return (
    <Popup position={[lat, lng]} eventHandlers={{ remove: hide }}>
      <div style={{ maxWidth: 320 }}>
        <b>Свойства</b>
        <ul style={{ paddingLeft: 16, margin: "6px 0" }}>
          {Object.entries(attrs).map(([k, v]) => (
            <li key={k}>
              <b>{k}:</b> {v === null ? "—" : String(v)}
            </li>
          ))}
        </ul>
      </div>
    </Popup>
  );
}
