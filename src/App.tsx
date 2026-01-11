import { useState } from "react";
import "./App.css";
import { useArrivals } from "./hooks/useArrivals";

const DEFAULT_STOP_ID = "1_75403";

function App() {
  const [stopId, setStopId] = useState(DEFAULT_STOP_ID);
  const { data, loading, error } = useArrivals(stopId);

  const formatEta = (seconds: number): { value: string; isNow: boolean } => {
    const minutes = Math.round(seconds / 60);
    if (minutes <= 0) {
      return { value: "NOW", isNow: true };
    }
    return { value: String(minutes), isNow: false };
  };

  const getStatusDotClass = () => {
    if (error) return "status-dot error";
    if (loading) return "status-dot loading";
    return "status-dot";
  };

  const getStatusText = () => {
    if (error) return "Error";
    if (loading) return "Updating";
    return "Live";
  };

  return (
    <>
      <div className="stop-selector">
        <label htmlFor="stop-input">Stop ID:</label>
        <input
          id="stop-input"
          className="stop-input"
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          placeholder="Enter stop ID"
        />
      </div>

      <div className="transit-sign">
        <div className="sign-header">
          <h1 className="sign-title">Arrivals</h1>
          <div className="sign-status">
            <span className={getStatusDotClass()} />
            <span>{getStatusText()}</span>
          </div>
        </div>

        <div className="arrivals-display">
          {error && (
            <div className="sign-message error">
              Connection Error
            </div>
          )}

          {!error && loading && !data && (
            <div className="sign-message">
              Loading...
            </div>
          )}

          {!error && data && data.length === 0 && (
            <div className="sign-message">
              No Scheduled Arrivals
            </div>
          )}

          {!error && data && data.length > 0 && (
            <>
              {data.map((arrival) => {
                const eta = formatEta(arrival.etaSeconds);
                return (
                  <div
                    key={`${arrival.routeId}-${arrival.arrivalTimeEpochMs}`}
                    className={`arrival-row ${!arrival.predicted ? "scheduled" : ""}`}
                  >
                    <div className="route-badge">
                      {arrival.routeShortName}
                    </div>
                    <div className="destination">
                      {arrival.headsign}
                    </div>
                    <div className="eta">
                      <div className={`eta-minutes ${eta.isNow ? "eta-now" : ""}`}>
                        {eta.value}
                      </div>
                      <div className="eta-label">
                        {eta.isNow ? "" : "min"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="sign-footer">
          <span>Sound Transit</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </>
  );
}

export default App;
