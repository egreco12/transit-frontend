import { useEffect, useState } from "react";
import { api, type Arrival } from "../api/client";

export function useArrivals(stopId: string) {
  const [data, setData] = useState<Arrival[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const arrivals = await api.getArrivalsForStop(stopId);
        if (!cancelled) {
          setData(arrivals);
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

    // poll every 10 seconds
    const interval = setInterval(load, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stopId]);

  return { data, loading, error };
}