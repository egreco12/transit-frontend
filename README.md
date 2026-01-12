# Seattle Transit Dashboard

A real-time transit arrivals display that mimics LED signs at bus stops. Built with React, TypeScript, and Vite.

## Features

- **LED-style UI** - Dark theme with glowing blue text, mimicking real transit arrival signs
- **Multi-stop support** - Display multiple stops in a responsive grid layout
- **Grouped arrivals** - Arrivals grouped by route, showing all directions with combined ETAs
- **Real-time updates** - Auto-refreshes every 10 seconds
- **Configurable** - Stop groups configured via environment variables

## Screenshot

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SEATTLE TRANSIT                              │
│                        Central District                             │
├─────────────────────────────┬───────────────────────────────────────┤
│  S JACKSON ST & 18TH AVE    │  RAINIER AVE S & CHARLES              │
│  ┌───────────────────────┐  │  ┌─────────────────────────────────┐  │
│  │ [14]                  │  │  │ [7]                             │  │
│  │  → MT BAKER  5, 12min │  │  │  → DOWNTOWN         3, 15 min  │  │
│  │  → DOWNTOWN  8 min    │  │  │  → RAINIER BEACH    8, 22 min  │  │
│  └───────────────────────┘  │  │ [554]                           │  │
│                             │  │  → ISSAQUAH          12 min     │  │
│                             │  │  → DOWNTOWN          18 min     │  │
│                             │  └─────────────────────────────────┘  │
└─────────────────────────────┴───────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- A running [OneBusAway API server](https://github.com/OneBusAway/onebusaway-application-modules)

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file with your configuration:

```bash
# API endpoint for your OneBusAway server
VITE_API_BASE=http://localhost:8080/api

# App title and subtitle (optional)
VITE_APP_TITLE=Seattle Transit
VITE_APP_SUBTITLE=Central District

# Stop groups configuration (JSON array)
# Each group combines multiple physical stops (e.g., both directions at an intersection)
VITE_STOP_GROUPS='[
  {
    "name": "S Jackson St & 18th Ave",
    "stops": [
      {"id": "1_11980", "name": "Eastbound"},
      {"id": "1_11940", "name": "Westbound"}
    ]
  },
  {
    "name": "Rainier Ave S & Charles",
    "stops": [
      {"id": "1_8494", "name": "NW bound"},
      {"id": "1_8590", "name": "SE bound"}
    ]
  }
]'
```

### Finding Stop IDs

Stop IDs can be found using:
- [OneBusAway Puget Sound](https://pugetsound.onebusaway.org/) - Search by address or route
- Physical bus stop signs - Look for the stop number (prefix with `1_` for OneBusAway)
- [King County Metro Trip Planner](https://tripplanner.kingcounty.gov/)

### Running

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Adding Stops via UI

Use the form at the bottom of the page:
1. Enter a location name (e.g., "3rd & Pike")
2. Enter comma-separated stop IDs (e.g., "1_431, 1_432")
3. Click "Add Stop"

### Removing Stops

Click the × button on any stop card to remove it.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Share Tech Mono** - Monospace font for LED aesthetic

## API

The app expects a backend API with the following endpoint:

```
GET /api/stops/{stopId}/arrivals
```

Response format:
```json
[
  {
    "routeId": "1_100252",
    "routeShortName": "7",
    "headsign": "Downtown Seattle",
    "etaSeconds": 180,
    "arrivalTimeEpochMs": 1704825600000,
    "predicted": true
  }
]
```

## License

MIT
