import { useState } from "react";
import "./App.css";
import { useArrivals } from "./hooks/useArrivals";

const DEFAULT_STOP_ID = "1_75403"; // pick your favorite Seattle stop

function App() {
  const [stopId, setStopId] = useState(DEFAULT_STOP_ID);
  const { data, loading, error } = useArrivals(stopId);

  return (
    <div style={{ padding: "1rem", fontFamily: "system-ui" }}>
      <h1>Seattle Transit Dashboard</h1>

      <label>
        Stop ID:
        <input
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        />
      </label>

      {loading && <p>Loading arrivals…</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      {data && data.length === 0 && !loading && <p>No upcoming arrivals</p>}

      {data && data.length > 0 && (
        <table style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Route</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Headsign</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>ETA</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Predicted?</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={`${a.routeId}-${a.arrivalTimeEpochMs}`}>
                <td style={{ padding: "0.5rem" }}>{a.routeShortName}</td>
                <td style={{ padding: "0.5rem" }}>{a.headsign}</td>
                <td style={{ padding: "0.5rem" }}>
                  {Math.max(0, Math.round(a.etaSeconds / 60))} min
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {a.predicted ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;