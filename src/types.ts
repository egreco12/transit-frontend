export interface StopConfig {
  id: string;
  name: string;
}

export interface StopGroupConfig {
  name: string;
  stops: StopConfig[];
}

export interface DirectionGroup {
  headsign: string;
  arrivals: { etaSeconds: number; predicted: boolean }[];
}

export interface RouteGroup {
  routeId: string;
  routeShortName: string;
  directions: DirectionGroup[];
  nextArrival: number;
}
