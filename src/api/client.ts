const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api";

export interface Arrival {
  routeId: string;
  routeShortName: string;
  headsign: string;
  etaSeconds: number;
  arrivalTimeEpochMs: number;
  predicted: boolean;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getArrivalsForStop(stopId: string) {
    return getJson<Arrival[]>(`/stops/${stopId}/arrivals`);
  },
};
