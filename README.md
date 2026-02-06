# Carte des Collèges

Interactive map visualizing ~7,000 French middle schools (collèges) with social position index (IPS) and DNB exam results.

## Stack

- **Framework:** Nuxt 4.3 (Vue 3.5, TypeScript strict)
- **UI:** Nuxt UI v4 (Tailwind CSS v4)
- **Map:** MapLibre GL 5.17
- **Animation:** Motion-v 1.10
- **Package Manager:** pnpm 10.28

## Development

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
```

## Data Sources

- **IPS (Indice de Position Sociale)** — Social position index from DEPP
- **IVAC** — DNB success rates, grades, and value-added indicators
- **Annuaire de l'éducation** — Geographic coordinates and school metadata

All data sourced from [data.education.gouv.fr](https://data.education.gouv.fr)

## Architecture

```
app/
├── components/    # Vue components (CollegeMap, FilterSidebar, etc.)
├── composables/   # Composables (useColleges, useFilterSync)
├── pages/         # Routes (index, about)
├── utils/         # Types, colors, formatting utilities
└── app.config.ts  # UI configuration

server/
├── api/           # API endpoints (colleges.get.ts)
└── utils/         # Server utilities (education-api.ts)
```

## Key Features

- Real-time filtering by region, sector, IPS range, DNB metrics
- URL-synced filters for shareable views
- Interactive map with hover tooltips and smart zoom
- Animated histogram visualization
- Responsive sidebar with collapsible sections

## Contributing

See [AGENTS.md](./AGENTS.md) for coding conventions and development guidelines.

## License

MIT
