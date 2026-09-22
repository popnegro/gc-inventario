# Aura Store Locator

A responsive Store Locator built with React, TypeScript, Tailwind CSS, Express, and Google Maps Platform APIs.

---

## Features

- **Proximity Search**: Real-time geodesic distance calculations ranking stores by closest proximity to user GPS or searched address.
- **Place Autocomplete**: Address search powered by Google Maps Place Autocomplete with quick-select city chips.
- **Interactive Map**: Google Maps with Advanced Markers, custom styling, info windows, and 1-click driving directions.
- **Store Filters**: Filter by real-time operating hours ("Open Now") and amenities (EV Charging, Curbside Pickup, etc.).
- **Store Details**: Weekly hours breakdown, phone dialing, photo previews, and customer ratings.
- **Dark / Light Mode**: Seamless theme switching with responsive desktop & mobile layouts.

---

## Google Maps API Key

Configure your key in AI Studio Secrets or `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY="AIzaSyYourApiKeyHere"
```

---

## Customizing Store Locations

Edit `src/data/stores.ts` to add or update your branch locations with coordinates, addresses, operating hours, and amenities.

---

## Development

```bash
# Start development server
npm run dev

# Type check
npm run lint

# Build for production
npm run build
```