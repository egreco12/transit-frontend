import { useMemo } from "react";
import type { StopGroupConfig } from "../types";
import { useMultiStopArrivals } from "../hooks/useMultiStopArrivals";
import { groupArrivalsByRoute, formatEta } from "../utils/arrivals";

export function StopGroupSign({ group }: { group: StopGroupConfig }) {
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
