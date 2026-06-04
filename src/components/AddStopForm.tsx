import { useState } from "react";
import type { StopGroupConfig } from "../types";

interface AddStopFormProps {
  onAdd: (group: StopGroupConfig) => void;
}

export function AddStopForm({ onAdd }: AddStopFormProps) {
  const [name, setName] = useState("");
  const [stopIds, setStopIds] = useState("");

  const handleSubmit = () => {
    if (name.trim() && stopIds.trim()) {
      const ids = stopIds.split(",").map((id) => {
        const trimmed = id.trim();
        return trimmed.startsWith("1_") ? trimmed : `1_${trimmed}`;
      });

      onAdd({
        name: name.trim(),
        stops: ids.map((id, i) => ({ id, name: `Stop ${i + 1}` })),
      });

      setName("");
      setStopIds("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="add-stop-section">
      <div className="add-stop-form">
        <input
          className="stop-input stop-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Location name"
          onKeyDown={handleKeyDown}
        />
        <input
          className="stop-input"
          value={stopIds}
          onChange={(e) => setStopIds(e.target.value)}
          placeholder="Stop IDs (comma separated)"
          onKeyDown={handleKeyDown}
        />
        <button className="add-stop-btn" onClick={handleSubmit}>
          Add Stop
        </button>
      </div>
    </div>
  );
}
