import { useState, useMemo } from "react";
import "./App.css";
import { useArrivals } from "./hooks/useArrivals";
import type { Arrival } from "./api/client";

const DEFAULT_STOP_ID = "1_75403";

interface DirectionGroup {
  headsign: string;
  arrivals: { etaSeconds: number; predicted: boolean }[];
}

interface RouteGroup {
  routeId: string;
  routeShortName: string;
  directions: DirectionGroup[];
  nextArrival: number;
}

function groupArrivalsByRoute(arrivals: Arrival[]): RouteGroup[] {
  const routes = new Map<string, RouteGroup>();

  for (const arrival of arrivals) {
    if (!routes.has(arrival.routeId)) {
      routes.set(arrival.routeId, {
        routeId: arrival.routeId,
        routeShortName: arrival.routeShortName,
        directions: [],
        nextArrival: arrival.etaSeconds,
      });
    }

    const route = routes.get(arrival.routeId)!;

    if (arrival.etaSeconds < route.nextArrival) {
      route.nextArrival = arrival.etaSeconds;
    }

    let direction = route.directions.find((d) => d.headsign === arrival.headsign);
    if (!direction) {
      direction = { headsign: arrival.headsign, arrivals: [] };
      route.directions.push(direction);
    }

    direction.arrivals.push({
      etaSeconds: arrival.etaSeconds,
      predicted: arrival.predicted,
    });
  }

  const result = Array.from(routes.values());
  for (const route of result) {
    for (const direction of route.directions) {
      direction.arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
    }
    route.directions.sort((a, b) => a.arrivals[0].etaSeconds - b.arrivals[0].etaSeconds);
  }

  result.sort((a, b) => a.nextArrival - b.nextArrival);

  return result;
}

function formatEta(seconds: number): { value: string; isNow: boolean } {
  const minutes = Math.round(seconds / 60);
  if (minutes <= 0) {
    return { value: "NOW", isNow: true };
  }
  return { value: String(minutes), isNow: false };
}

function App() {
  const [stopId, setStopId] = useState(DEFAULT_STOP_ID);
  const { data, loading, error } = useArrivals(stopId);

  const groupedRoutes = useMemo(() => {
    if (!data) return [];
    return groupArrivalsByRoute(data);
  }, [data]);

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

          {!error && data && groupedRoutes.length === 0 && (
            <div className="sign-message">
              No Scheduled Arrivals
            </div>
          )}

          {!error && groupedRoutes.length > 0 && (
            <>
              {groupedRoutes.map((route) => (
                <div key={route.routeId} className="route-group">
                  <div className="route-header">
                    <div className="route-badge">
                      {route.routeShortName}
                    </div>
                  </div>
                  <div className="directions-list">
                    {route.directions.map((direction) => {
                      const allPredicted = direction.arrivals.every((a) => a.predicted);
                      return (
                        <div
                          key={direction.headsign}
                          className={`direction-row ${!allPredicted ? "scheduled" : ""}`}
                        >
                          <div className="direction-indicator">→</div>
                          <div className="destination">
                            {direction.headsign}
                          </div>
                          <div className="eta-group">
                            {direction.arrivals.map((arrival, index) => {
                              const eta = formatEta(arrival.etaSeconds);
                              return (
                                <span
                                  key={index}
                                  className={`eta-item ${eta.isNow ? "eta-now" : ""} ${!arrival.predicted ? "eta-scheduled" : ""}`}
                                >
                                  {eta.value}
                                  {!eta.isNow && index === 0 && <span className="eta-unit">min</span>}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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
