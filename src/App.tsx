import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { api, type Arrival } from "./api/client";

interface StopConfig {
  id: string;
  name: string;
}

interface StopGroupConfig {
  name: string;
  stops: StopConfig[];
}

// Default stop groups - can be customized
const DEFAULT_STOP_GROUPS: StopGroupConfig[] = [
  {
    name: "S Jackson St & 18th Ave",
    stops: [
      { id: "1_11980", name: "Eastbound" },
      { id: "1_11940", name: "Westbound" },
    ],
  },
  {
    name: "Rainier Ave S & Charles",
    stops: [
      { id: "1_8494", name: "NW bound (Downtown)" },
      { id: "1_8590", name: "SE bound (Rainier Beach)" },
    ],
  },
];

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

// Hook to fetch arrivals for multiple stops and combine them
function useMultiStopArrivals(stopIds: string[]) {
  const [data, setData] = useState<Arrival[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          stopIds.map((id) => api.getArrivalsForStop(id))
        );
        if (!cancelled) {
          const combined = results.flat();
          setData(combined);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = setInterval(load, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stopIds.join(",")]);

  return { data, loading, error };
}

function StopGroupSign({ group }: { group: StopGroupConfig }) {
  const stopIds = useMemo(() => group.stops.map((s) => s.id), [group.stops]);
  const { data, loading, error } = useMultiStopArrivals(stopIds);

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
    <div className="transit-sign">
      <div className="sign-header">
        <h2 className="sign-title">{group.name}</h2>
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
        <span>{group.stops.map((s) => s.id.replace("1_", "#")).join(" / ")}</span>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}

function App() {
  const [stopGroups, setStopGroups] = useState<StopGroupConfig[]>(DEFAULT_STOP_GROUPS);
  const [newGroupName, setNewGroupName] = useState("");
  const [newStopIds, setNewStopIds] = useState("");

  const addStopGroup = () => {
    if (newGroupName.trim() && newStopIds.trim()) {
      const ids = newStopIds.split(",").map((id) => {
        const trimmed = id.trim();
        return trimmed.startsWith("1_") ? trimmed : `1_${trimmed}`;
      });

      const newGroup: StopGroupConfig = {
        name: newGroupName.trim(),
        stops: ids.map((id, i) => ({ id, name: `Stop ${i + 1}` })),
      };

      setStopGroups([...stopGroups, newGroup]);
      setNewGroupName("");
      setNewStopIds("");
    }
  };

  const removeStopGroup = (index: number) => {
    setStopGroups(stopGroups.filter((_, i) => i !== index));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Seattle Transit</h1>
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

      <div className="add-stop-section">
        <div className="add-stop-form">
          <input
            className="stop-input stop-name-input"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Location name"
            onKeyDown={(e) => e.key === "Enter" && addStopGroup()}
          />
          <input
            className="stop-input"
            value={newStopIds}
            onChange={(e) => setNewStopIds(e.target.value)}
            placeholder="Stop IDs (comma separated)"
            onKeyDown={(e) => e.key === "Enter" && addStopGroup()}
          />
          <button className="add-stop-btn" onClick={addStopGroup}>
            Add Stop
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
