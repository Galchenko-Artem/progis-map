import { WMS_LAYERS } from "../config/layers";       
import { useMapStore } from "../app/store";          

export default function LayerToggle() {             
  const visible = useMapStore((s) => s.visible);     
  const setVisible = useMapStore((s) => s.setVisible);

  return (
    <div
      style={{
        position: "absolute", top: 12, left: 12,   
        background: "#fff", padding: 12, borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)", fontSize: 14,
        zIndex: 1000,                                
      }}
    >
      <b>Слои</b>
      {WMS_LAYERS.map((l) => (                      
        <label key={l.id} style={{ display: "block", marginTop: 8 }}>
          <input
            type="checkbox"
            checked={visible[l.id] ?? l.visible}      
            onChange={(e) => setVisible(l.id, e.target.checked)} 
          />{" "}
          {l.name}
        </label>
      ))}
    </div>
  );
}
