# FIREtrack

Investment portfolio tracker for the **FIRE** (Financial Independence, Retire Early) movement. Track assets across brokers, see inflation-adjusted real returns, and get a projected retirement date — all with zero-knowledge encryption.

## Tech Stack

| Layer         | Technology               | Version |
| ------------- | ------------------------ | ------- |
| Frontend      | Next.js (App Router)     | 14.x    |
| Language      | TypeScript (strict mode) | 5.x     |
| Styling       | Tailwind CSS             | 3.x     |
| Charts        | Recharts                 | 2.x     |
| Local Storage | Dexie.js (IndexedDB)     | 4.x     |
| State         | Zustand                  | 4.x     |
| Encryption    | Web Crypto API           | native  |
| Backend       | Fastify                  | 4.x     |
| Runtime       | Node.js                  | 20 LTS  |
| Database      | PostgreSQL               | 16.x    |
| ORM           | Prisma                   | 5.x     |
| Cache         | Redis                    | 7.x     |
| Monorepo      | Turborepo + pnpm         | latest  |
| Testing       | Vitest + Playwright      | latest  |
| CI/CD         | GitHub Actions           | —       |

## Monorepo Structure

```
firetrack/
├── apps/web/              # Next.js frontend
├── packages/
│   ├── calculations/      # XIRR, TWR, CAGR, FIRE projections
│   ├── crypto/            # AES-256-GCM encryption, PBKDF2 key derivation
│   ├── types/             # Shared TypeScript interfaces
│   └── parsers/           # CSV/Excel column mapping, fingerprinting
├── services/api/          # Fastify backend
├── docker-compose.yml     # Local PostgreSQL + Redis
├── turbo.json
└── pnpm-workspace.yaml
```

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/) >= 9.x (`npm install -g pnpm`)
- [Docker](https://www.docker.com/) (for PostgreSQL and Redis)

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/karoltaylor/firetrack.git
cd firetrack

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start local databases
docker compose up -d

# 5. Build all packages
pnpm build

# 6. Run tests
pnpm test

# 7. Run linting
pnpm lint

# 8. Run type checking
pnpm typecheck
```

### Common Commands

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm build`        | Build all packages               |
| `pnpm dev`          | Start all packages in dev mode   |
| `pnpm test`         | Run all tests                    |
| `pnpm lint`         | Lint all packages                |
| `pnpm typecheck`    | Type-check all packages          |
| `pnpm format`       | Format all files with Prettier   |
| `pnpm format:check` | Check formatting without writing |

## License

[MIT](LICENSE)
