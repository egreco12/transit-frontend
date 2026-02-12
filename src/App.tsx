import { useState } from "react";
import "./App.css";
import type { StopGroupConfig } from "./types";
import { loadDefaultStopGroups } from "./utils/arrivals";
import { StopGroupSign } from "./components/StopGroupSign";
import { AddStopForm } from "./components/AddStopForm";

const DEFAULT_STOP_GROUPS = loadDefaultStopGroups();

function App() {
  const [stopGroups, setStopGroups] = useState<StopGroupConfig[]>(DEFAULT_STOP_GROUPS);

  const addStopGroup = (group: StopGroupConfig) => {
    setStopGroups([...stopGroups, group]);
  };

  const removeStopGroup = (index: number) => {
    setStopGroups(stopGroups.filter((_, i) => i !== index));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">{import.meta.env.VITE_APP_TITLE || "Transit"}</h1>
        {import.meta.env.VITE_APP_SUBTITLE && (
          <p className="app-subtitle">{import.meta.env.VITE_APP_SUBTITLE}</p>
        )}
      </header>

      <div className="stops-grid">
        {stopGroups.map((group, index) => (
          <div key={`${group.name}-${index}`} className="stop-container">
            <button
              className="remove-stop-btn"
              onClick={() => removeStopGroup(index)}
              title="Remove stop"
            >
              ×
            </button>
            <StopGroupSign group={group} />
          </div>
        ))}
      </div>

      <AddStopForm onAdd={addStopGroup} />
    </div>
  );
}

export default App;
