# Fuel Station Finder

A web app that helps drivers locate nearby fuel stations, check recently reported prices, and most importantly see whether a station actually has fuel in stock before driving there. Built for the real-world pain point of fuel scarcity in Nigeria, where price is only half the problem.

**[Live Demo](#) · [Video Walkthrough](#)**

---

## Why this exists

Most fuel-finder tools only show price. But in markets where fuel scarcity is common, the more urgent question is: is there even fuel there right now? This app tracks both price and availability sourced from real driver reports, so you're not driving across town on a rumor.

---

## Features

- **Interactive map** of nearby fuel stations using Leaflet.js
- **Live-ish pricing** based on the most recent driver-submitted report
- **Fuel availability tracking** — "Fuel available" / "Out of fuel" badges with a timestamp of the last confirmation
- **Filtering** by fuel type, max price, distance/radius, and availability
- **Crowdsourced price reports** — any user can submit a new report for a station
- **Price history** per station, not just the latest snapshot

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Backend    | Node.js, Express, Sequelize ORM      |
| Database   | PostgreSQL                           |
| Frontend   | React (Vite), Leaflet.js             |
| Deployment | Railway / Render                     |


---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (local install, or use a free hosted instance from Neon/Supabase)
- npm

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/fuel-finder.git
cd fuel-finder
```

### 2. Set up the database
Create a Postgres database and user:
```bash
createuser fueluser --pwprompt
createdb fuelfinder -O fueluser
```

### 3. Configure and start the backend
```bash
cd backend
cp .env.example .env
# edit .env with your DB credentials / DATABASE_URL
npm install
npm run seed    # inserts ~12 sample Lagos stations
npm start
```
Backend runs at `http://localhost:5000`.

### 4. Start the frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Using Real Station Data

The seed script uses a small hardcoded list of Lagos stations. To pull real fuel station data for any city:

1. Go to [overpass-turbo.eu](https://overpass-turbo.eu)
2. Search `amenity=fuel` within your city's map view
3. Export the results as GeoJSON
4. Adapt `backend/src/seed/seedStations.js` to read that GeoJSON and insert each station's name/lat/lng instead of the hardcoded array

---

## API Reference

| Method | Endpoint                    | Description                              |
|--------|------------------------------|-------------------------------------------|
| GET    | `/api/stations`              | List stations (supports filters below)    |
| GET    | `/api/stations/:id`          | Get one station with its price history     |
| POST   | `/api/stations`              | Add a new station                          |
| POST   | `/api/stations/:id/prices`   | Submit a price report for a station        |

**Query filters — `GET /api/stations`**

| Param          | Description                                              |
|----------------|------------------------------------------------------------|
| `fuelType`     | `petrol`, `diesel`, `kerosene`, `gas`                     |
| `maxPrice`     | Filters by latest reported price                          |
| `lat`, `lng`, `radiusKm` | Sorts/filters by distance from a point           |
| `availableOnly`| `true` to only return stations currently reported in stock |

**Submit a price report — `POST /api/stations/:id/prices`**
```json
{
  "fuelType": "petrol",
  "price": 950,
  "fuelAvailable": true,
  "reportedBy": "anonymous"
}
```

---

## Deployment

| Component | Recommended Host                          |
|-----------|---------------------------------------------|
| Backend   | Railway or Render (free tier)                |
| Frontend  | Vercel, Netlify, or Render Static Site        |
| Database  | Railway/Render managed Postgres, or Neon/Supabase |

Before deploying the frontend, update `frontend/src/api.js` to point `API_BASE` at your deployed backend URL (ideally via an environment variable such as `VITE_API_BASE_URL` rather than hardcoding it).

Don't forget to update your backend's CORS configuration to allow requests from your deployed frontend domain.

---

## Ideas for futher improvement

- [ ] User accounts so reports carry more trust/reputation
- [ ] Push notifications when a favorited station reports fuel back in stock
- [ ] Historical price charts per station
- [ ] Admin moderation for spam/inaccurate reports

---

## Contributing

Issues and pull requests are welcome. If you're adding a new city's station data, please include the source of your GeoJSON export in the PR description.

## License

[MIT](./LICENSE)
