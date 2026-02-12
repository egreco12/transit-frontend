import { useState, useEffect } from "react";
import { api, type Arrival } from "../api/client";

export function useMultiStopArrivals(stopIds: string[]) {
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
