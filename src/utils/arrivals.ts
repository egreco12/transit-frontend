import type { Arrival } from "../api/client";
import type { RouteGroup, StopGroupConfig } from "../types";

export function groupArrivalsByRoute(arrivals: Arrival[]): RouteGroup[] {
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

export function formatEta(seconds: number): { value: string; isNow: boolean } {
  const minutes = Math.round(seconds / 60);
  if (minutes <= 0) {
    return { value: "NOW", isNow: true };
  }
  return { value: String(minutes), isNow: false };
}

export function loadDefaultStopGroups(): StopGroupConfig[] {
  const envConfig = import.meta.env.VITE_STOP_GROUPS;
  if (!envConfig) {
    return [];
  }
  try {
    return JSON.parse(envConfig) as StopGroupConfig[];
  } catch (e) {
    console.error("Failed to parse VITE_STOP_GROUPS:", e);
    return [];
  }
}
