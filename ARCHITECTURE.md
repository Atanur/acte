# Acte — Enterprise Architecture Blueprint

> Monorepo: Web (Next.js) + Backend (Hono/Bun) + Mobile (Expo)
> Version: 0.1.0 | Status: Blueprint

---

## İçindekiler

1. [Semantic Versioning Pipeline](#1-semantic-versioning-pipeline)
2. [Monorepo Yapısı ve Paketler](#2-monorepo-yapısı-ve-paketler)
3. [CI/CD Pipeline](#3-cicd-pipeline)
4. [Database Layer (Drizzle + PostgreSQL)](#4-database-layer-drizzle--postgresql)
5. [Data Fetching & State (TanStack Query)](#5-data-fetching--state-tanstack-query)
6. [Authentication (Better Auth)](#6-authentication-better-auth)
7. [API Tasarımı & İletişim](#7-api-tasarımı--iletişim)
8. [Testing Stratejisi](#8-testing-stratejisi)
9. [Code Quality & Pre-commit](#9-code-quality--pre-commit)
10. [Observability & Monitoring](#10-observability--monitoring)
11. [Docker & Deployment](#11-docker--deployment)
12. [Security](#12-security)
13. [Push Notifications](#13-push-notifications)
14. [Offline-first Stratejisi](#14-offline-first-stratejisi)
15. [i18n / Çoklu Dil Desteği](#15-i18n--çoklu-dil-desteği)
16. [EAS Build & Store Submit](#16-eas-build--store-submit)
17. [Background Jobs & Queue (BullMQ + Redis)](#17-background-jobs--queue-bullmq--redis)
18. [Email Servisi (Resend)](#18-email-servisi-resend)
19. [File Upload & CDN (Cloudflare R2)](#19-file-upload--cdn-cloudflare-r2)
20. [Analytics (PostHog)](#20-analytics-posthog)
21. [Feature Flags](#21-feature-flags)
22. [Deep Linking / Universal Links](#22-deep-linking--universal-links)
23. [Environment Management](#23-environment-management)
24. [Performance Budget](#24-performance-budget)
25. [UI Library (Mobile)](#25-ui-library-mobile)
26. [API Versioning](#26-api-versioning)
27. [Development Phases](#27-development-phases)

---

## 1. Semantic Versioning Pipeline

### 1.1 Felsefe

Tüm uygulamalar (web, mobile, backend) **tek bir versiyon numarasını** paylaşır. Versiyon, root `package.json`'daki `version` alanından okunur ve her app kendi ortamında bu versiyonu gösterir.

```
Örn: v1.2.3
  major = 1 (breaking change)
  minor = 2 (feat)
  patch = 3 (fix)
```

### 1.2 Commit Convention

```
<type>: <description>

[optional body]

[optional footer: BREAKING CHANGE]
```

**İzin verilen tipler:**

| Type | Etki | Version Bump |
|------|------|-------------|
| `feat` | Yeni özellik | minor (x.1.0) |
| `fix` | Hata düzeltmesi | patch (x.x.1) |
| `BREAKING CHANGE` (footer'da) | Geri uyumsuz değişiklik | major (1.0.0) |

**Yasak tipler:** `chore`, `docs`, `refactor`, `style`, `test`, `perf` — commit mesajında kullanılabilir ama version bump tetiklemez.

**Örnekler:**
```
feat: add user profile page
fix: resolve login timeout issue
feat: implement push notifications

BREAKING CHANGE: migrate auth from JWT to session-based
```

### 1.3 Araçlar ve Akış

```
[Developer]
    │
    ├─ husky + commitlint ───────────────────── commit message validation
    ├─ lint-staged ───────────────────────────── staged file lint/format
    │
    ▼
[Git Push → main/master]
    │
    ├─ GitHub Actions: CI ───────────────────── lint + typecheck + test + build
    │
    ▼
[GitHub Actions: Release]
    │
    ├─ semantic-release ─────────────────────── analyze commits → bump version
    ├─ Update root package.json version
    ├─ Generate CHANGELOG.md
    ├─ Create Git tag (v{major}.{minor}.{patch})
    ├─ Create GitHub Release
    │
    ▼
[Post-release]
    ├─ Web: build & deploy
    ├─ Backend: Docker build & push & deploy
    └─ Mobile: EAS Build (manual trigger)
```

### 1.4 semantic-release Yapılandırması

```js
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ],
  "preset": "conventionalcommits"
}
```

### 1.5 Versiyon Görünürlüğü

Her app, versiyonu kullanıcıya gösterir:

| App | Kaynak |
|-----|--------|
| Web | `process.env.NEXT_PUBLIC_APP_VERSION` → root package.json |
| Backend | `/api/health` → `version` alanı |
| Mobile | `expo-constants` → `app.json` version (CI'da güncellenir) |

---

## 2. Monorepo Yapısı ve Paketler

```
developer/acte/
│
├── apps/
│   ├── web/                      # Next.js 16 + React 19
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router
│   │   │   ├── components/       # UI components
│   │   │   ├── hooks/            # Custom hooks (TanStack Query wrappers)
│   │   │   ├── lib/              # Utils, API client instance
│   │   │   └── providers/        # QueryClient, Auth providers
│   │   └── package.json
│   │
│   ├── backend/                  # Hono 4 + Bun
│   │   ├── src/
│   │   │   ├── index.ts          # Server entry
│   │   │   ├── routes/           # Route handlers
│   │   │   ├── middleware/       # Auth, logging, validation
│   │   │   └── lib/              # Utils, services
│   │   └── package.json
│   │
│   └── mobile/                   # Expo SDK 56
│       ├── src/
│       │   ├── app/              # Expo Router (file-based)
│       │   ├── components/       # Native UI components
│       │   ├── hooks/            # Custom hooks (TanStack Query wrappers)
│       │   ├── lib/              # Utils, API client instance
│       │   └── providers/        # QueryClient, Auth providers
│       └── package.json
│
├── packages/
│   ├── shared/                   # Pure TS: Types, Zod schemas, constants
│   │   └── src/
│   │       ├── types/            # Domain types, DTOs
│   │       ├── schemas/          # Zod validation schemas
│   │       ├── constants/        # Enums, config constants
│   │       └── utils/            # Pure utility functions
│   │
│   ├── db/                       # Drizzle ORM: Schema, migrations, queries
│   │   ├── src/
│   │   │   ├── schema/           # Table definitions
│   │   │   ├── migrations/       # Generated SQL migrations
│   │   │   ├── queries/          # Type-safe query helpers
│   │   │   └── seed/             # Seed scripts
│   │   └── package.json
│   │
│   ├── api-client/               # Typed HTTP client (shared web + mobile)
│   │   ├── src/
│   │   │   ├── client.ts         # Fetch wrapper (base URL, headers, errors)
│   │   │   ├── endpoints/        # Type-safe endpoint functions
│   │   │   └── types.ts          # API request/response DTOs
│   │   └── package.json
│   │
│   └── config/                   # Shared env validation
│       ├── src/
│       │   └── env.ts            # Zod env schema (dev/prod validation)
│       └── package.json
│
├── docker/
│   ├── Dockerfile.backend        # Multi-stage Bun build
│   ├── docker-compose.yml        # Local dev (postgres, redis, backend)
│   └── docker-compose.prod.yml   # Production stack
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # PR checks
│       ├── cd.yml                # Deploy on push to main
│       └── release.yml          # semantic-release
│
├── scripts/                      # VPS bootstrap, deploy helpers
├── docs/                         # ADR, architecture docs
│
├── package.json                  # Bun workspaces + version
├── turbo.json                    # Task pipeline
├── .commitlintrc.json            # Commit message rules
├── .releaserc.json               # semantic-release config
└── ARCHITECTURE.md               # This file
```

### Paket Bağımlılık Grafiği

```
web ──────────┬─ api-client ──┬─ shared
              │               │
backend ──────┼─ db ──────────┴─ shared
              │   │
mobile ───────┴─ api-client ──┬─ shared
                              │
config ───────────────────────┴─ shared
```

---

## 3. CI/CD Pipeline

### 3.1 CI — Pull Request Quality Gates

```yaml
# .github/workflows/ci.yml
on: pull_request
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install --frozen-lockfile
      - run: bun lint              # Biome / ESLint
      - run: bun typecheck         # tsc --noEmit (all packages)
      - run: bun test              # Vitest
      - run: bun build             # Turbo build
```

### 3.2 CD — Deploy (Main Branch)

```yaml
# .github/workflows/cd.yml
on:
  push:
    branches: [main]

jobs:
  # ─── Quality Gate ─────────────────────────────
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun lint
      - run: bun typecheck
      - run: bun test
      - run: bun build

  # ─── Web: Cloudflare Pages ────────────────────
  deploy-web:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: cd apps/web && bun run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          command: pages deploy apps/web/out --project-name=acte-web

  # ─── Backend: Docker + VPS ────────────────────
  deploy-backend:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build --filter=backend...
      - run: docker build -f docker/Dockerfile.backend -t ghcr.io/acte/backend:${{ github.sha }} .
      - run: docker push ghcr.io/acte/backend:${{ github.sha }}
      - run: |
          ssh deploy@49.12.109.24 "
            cd /opt/acte &&
            docker compose pull backend &&
            docker compose up -d backend
          "

  # ─── Mobile: Fastlane iOS → TestFlight ────────
  deploy-mobile-ios:
    needs: quality
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: cd apps/mobile && npx expo prebuild --platform ios
      - run: bundle exec fastlane match appstore --readonly
      - run: bundle exec fastlane gym --scheme acte --export_method app-store
      - run: bundle exec fastlane pilot upload
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
```

### 3.3 Release — Semantic Versioning

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile

      - run: bunx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 4. Database Layer (Drizzle + PostgreSQL)

### 4.1 Paket: `packages/db`

```typescript
// packages/db/src/schema/users.ts
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 4.2 Migration Pipeline

```bash
# packages/db/package.json scripts
bun run db:generate    # drizzle-kit generate — SQL migration oluştur
bun run db:migrate     # drizzle-kit migrate — veritabanına uygula
bun run db:push        # drizzle-kit push — dev'de hızlı şema push
bun run db:studio      # drizzle-kit studio — GUI veritabanı yöneticisi
bun run db:seed        # seed script'ini çalıştır
```

### 4.3 Repository Pattern

```typescript
// packages/db/src/queries/users.ts
import { db } from "../connection";
import { users } from "../schema/users";
import { eq } from "drizzle-orm";

export const findUserByEmail = async (email: string) =>
  db.select().from(users).where(eq(users.email, email)).limit(1);

export const createUser = async (data: typeof users.$inferInsert) =>
  db.insert(users).values(data).returning();
```

### 4.4 Docker Compose (Local Dev)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: acte
      POSTGRES_USER: acte
      POSTGRES_PASSWORD: acte_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 5. Data Fetching & State (TanStack Query)

### 5.1 Web & Mobile Ortak Yapı

Her iki platform da **TanStack Query** (React Query v5) kullanır:

| Platform | Kütüphane |
|----------|-----------|
| Web | `@tanstack/react-query` |
| Mobile | `@tanstack/react-query` |

### 5.2 Provider Yapısı

```tsx
// apps/web/src/providers/query-provider.tsx
// apps/mobile/src/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 dk
      retry: 2,
      refetchOnWindowFocus: false,   // mobile'da mantıklı
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 5.3 API Client (Shared)

```typescript
// packages/api-client/src/client.ts
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new ApiError(res.status, await res.json());
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res.status, await res.json());
    return res.json();
  }
}

// Singleton instance (env'den baseUrl alır)
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? // web
  process.env.EXPO_PUBLIC_API_URL ?? // mobile
  "http://localhost:4000"
);
```

### 5.4 Query Hook Örneği

```typescript
// apps/web/src/hooks/use-message.ts
// apps/mobile/src/hooks/use-message.ts   ← AYNI KOD
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "api-client";

export function useMessage() {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => apiClient.get<MessageResponse>("/api/message"),
  });
}
```

### 5.5 State Management: Zustand

Global state için **Zustand** kullanılır:

```typescript
// apps/mobile/src/hooks/use-auth-store.ts
import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));
```

---

## 6. Authentication (Better Auth)

Better Auth, kullanıcının tercih ettiği self-hosted auth kütüphanesidir.

| Özellik | Açıklama |
|---------|----------|
| **Provider** | Better Auth (server-side) |
| **Strategies** | Email/Password, Google OAuth, Apple OAuth |
| **Session** | JWT + HTTP-only cookie (web), Bearer token (mobile) |
| **RBAC** | Role-based access (admin, user) |
| **API** | `packages/api-client` üzerinden token iletimi |

```typescript
// apps/backend/src/middleware/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: { clientId: "", clientSecret: "" },
    apple: { clientId: "", clientSecret: "" },
  },
});
```

---

## 7. API Tasarımı & İletişim

### 7.1 RESTful API Tasarımı

```
GET    /api/health           # Health check
GET    /api/info             # App info

POST   /api/auth/login       # Login
POST   /api/auth/register    # Register
POST   /api/auth/logout      # Logout

GET    /api/users/me         # Current user
PATCH  /api/users/me         # Update profile

GET    /api/items            # List (paginated)
POST   /api/items            # Create
GET    /api/items/:id        # Get by ID
PATCH  /api/items/:id        # Update
DELETE /api/items/:id        # Delete
```

### 7.2 Response Format (Standart)

```typescript
// Başarılı
{
  "status": "ok",
  "data": { ... },
  "timestamp": "2026-06-16T20:00:00.000Z"
}

// Hatalı
{
  "status": "error",
  "error": "VALIDATION_ERROR",
  "message": "Email is required",
  "details": { ... },
  "timestamp": "2026-06-16T20:00:00.000Z"
}

// Paginated
{
  "status": "ok",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 7.3 Error Handling (Backend)

```typescript
// apps/backend/src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

// Global error middleware
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ status: "error", error: err.code, message: err.message }, err.statusCode);
  }
  return c.json({ status: "error", error: "INTERNAL_ERROR", message: "Something went wrong" }, 500);
});
```

---

## 8. Testing Stratejisi

| Katman | Araç | Kapsam |
|--------|------|--------|
| **Backend (Unit)** | `bun test` / Vitest | Service logic, middleware, validators |
| **Backend (API)** | Vitest + `hono/testing` | Endpoint tests, auth flow |
| **Web (Unit)** | Vitest + React Testing Library | Component rendering, hooks |
| **Mobile (Unit)** | Jest + React Native Testing Library | Native component tests |
| **E2E (Web)** | Playwright | Critical user flows |
| **E2E (Mobile)** | Detox / Maestro | Native app flows |
| **API Mocking** | MSW (Mock Service Worker) | Consistent mocks across tests |

```json
// Root package.json (test scripts)
{
  "scripts": {
    "test": "turbo test",
    "test:web": "cd apps/web && vitest run",
    "test:backend": "cd apps/backend && vitest run",
    "test:mobile": "cd apps/mobile && jest",
    "test:e2e:web": "cd apps/web && playwright test"
  }
}
```

---

## 9. Code Quality & Pre-commit

### 9.1 Araçlar

| Araç | Amaç |
|------|------|
| **Biome** | Linting + Formatting (ESLint/Prettier alternatifi) |
| **Husky** | Git hooks yöneticisi |
| **lint-staged** | Sadece staged dosyalara lint çalıştır |
| **commitlint** | Commit mesajı validasyonu |

### 9.2 Pre-commit Akışı

```
.git/hooks/pre-commit (husky)
  └─ lint-staged
       ├─ biome check --write          # Lint + format staged files
       └─ biome check --linter-enabled # Error varsa commit engelle

.git/hooks/commit-msg (husky)
  └─ commitlint --edit $1
       ├─ feat: ✅ izin ver
       ├─ fix:  ✅ izin ver
       └─ diğer: ❌ reddet
```

### 9.3 commitlint Config

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", ["feat", "fix", "chore", "docs", "refactor", "test"]],
    "subject-case": [2, "always", "lower-case"],
    "body-max-line-length": [2, "always", 100]
  }
}
```

> **Not:** `chore`, `docs`, `refactor`, `test` commit tiplerine izin verilir ama `semantic-release` yalnızca `feat` ve `fix` için version bump yapar. Böylece developer rahat commit atabilir ama sadece anlamlı değişiklikler versiyonu etkiler.

---

## 10. Observability & Monitoring

### 10.1 Logging (Backend)

```typescript
// apps/backend/src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  level: process.env.LOG_LEVEL ?? "info",
});
```

### 10.2 Sentry (Error Tracking)

```typescript
// apps/web/src/lib/sentry.ts
// apps/mobile/src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 10.3 Backend Health Check

```typescript
// apps/backend/src/routes/health.ts
app.get("/api/health", async (c) => {
  const dbOk = await checkDatabaseConnection();
  return c.json({
    status: dbOk ? "ok" : "degraded",
    version: process.env.npm_package_version ?? "0.1.0",
    uptime: process.uptime(),
    checks: {
      database: dbOk ? "healthy" : "unhealthy",
    },
  });
});
```

### 10.4 Monitoring Stack (Opsiyonel, Phase 2+)

| Servis | Rol |
|--------|-----|
| **Prometheus** | Metrik toplama (request rate, latency, error rate) |
| **Grafana** | Dashboard görselleştirme |
| **Loki** | Log toplama ve sorgulama |
| **OpenTelemetry** | Distributed tracing |

---

## 11. Docker & Deployment

### 11.1 Backend Dockerfile (Multi-stage)

```dockerfile
# docker/Dockerfile.backend
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build --filter=backend...

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:4000/api/health || exit 1
CMD ["bun", "run", "start"]
```

### 11.2 Production Docker Compose (VPS — Nginx + Backend + PostgreSQL)

```yaml
# docker/docker-compose.prod.yml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - certbot_data:/var/www/certbot
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: ghcr.io/acte/backend:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
    expose:
      - "4000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U acte"]
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: acte
      POSTGRES_USER: acte
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    expose:
      - "5432"

volumes:
  pgdata:
  certbot_data:
```

### 11.3 Nginx Config

```nginx
# docker/nginx.conf
events {}

http {
  # Backend reverse proxy
  upstream backend {
    server backend:4000;
  }

  server {
    listen 80;
    server_name api.acte.app;

    location / {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ACME challenge for SSL
    location /.well-known/acme-challenge/ {
      root /var/www/certbot;
    }
  }

  # HTTPS (after certbot)
  server {
    listen 443 ssl;
    server_name api.acte.app;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

### 11.4 VPS Deployment Script (Nginx + Certbot SSL)

```bash
# scripts/deploy.sh
#!/bin/bash
set -e

SERVER="deploy@49.12.109.24"
PROJECT="acte"

echo "🔄 Pulling latest images..."
ssh "$SERVER" "cd /opt/$PROJECT && docker compose pull"

echo "🚀 Restarting services..."
ssh "$SERVER" "cd /opt/$PROJECT && docker compose up -d"

echo "✅ Health check..."
sleep 5
curl -f "https://api.acte.app/api/health" || echo "⚠️ Health check failed"
```

---

## 12. Security

| Kategori | Çözüm |
|----------|-------|
| **Input Validation** | Zod schemas (backend + shared) |
| **Rate Limiting** | `hono-rate-limiter` / upstash |
| **CORS** | Hono cors middleware (whitelist origins) |
| **Security Headers** | Hono `secureHeaders()` middleware |
| **CSRF** | Double-submit cookie pattern (web) |
| **Secrets** | GitHub Secrets + `.env` files (gitignored) |
| **Dependency Scanning** | `bun audit` / Dependabot (GitHub) |
| **Docker Security** | Non-root user, slim images, no shell |
| **DB Security** | Connection pooling, least-privilege user |

```typescript
// apps/backend/src/index.ts
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";

app.use("*", secureHeaders());
app.use("*", csrf({ origin: ["http://localhost:3000", "https://acte.app"] }));
```

---

## 13. Push Notifications

Mobil uygulama için push notification altyapısı.

| Bileşen | Teknoloji |
|---------|-----------|
| **Service** | Expo Push Notifications API + FCM (Android) / APNs (iOS) |
| **Backend** | Hono endpoint → `expo-server-sdk` → Expo Push Service |
| **Queue** | BullMQ (Redis) ile notification gönderimini kuyruğa al |
| **Storage** | `packages/db` → `push_tokens` tablosu |

```typescript
// apps/backend/src/services/notifications.ts
import { Expo } from "expo-server-sdk";
const expo = new Expo();

export async function sendPushNotification(token: string, title: string, body: string) {
  if (!Expo.isExpoPushToken(token)) return;
  await expo.sendPushNotificationsAsync([
    { to: token, title, body, sound: "default" },
  ]);
}
```

### Kullanıcı İzin Yönetimi

```tsx
// apps/mobile/src/hooks/use-push-notifications.ts
import { usePushNotifications } from "expo-notifications";

// Token al → backend'e kaydet → push al
```

---

## 14. Offline-first Stratejisi

Mobil uygulama internete bağlı olmadığında da çalışabilmeli.

### Katmanlar

| Katman | Çözüm |
|--------|-------|
| **Local Cache** | TanStack Query's `persistQueryClient` ile AsyncStorage'da query cache |
| **Offline Storage** | `expo-sqlite` (veya `op-sqlite`) ile local DB |
| **Sync Queue** | `@tanstack/react-query` + `onlineManager` ile queue mekanizması |
| **Conflict Resolution** | Last-writer-wins (Phase 1 için yeterli) |

### Akış

```
[Kullanıcı] → Mutation → [Online?]
    ├─ Evet → Backend'e gönder → Cache güncelle
    └─ Hayır → Local queue'a ekle → Online olunca sync et
```

```typescript
// TanStack Query persister
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "TANSTACK_QUERY_CACHE",
});
```

---

## 15. i18n / Çoklu Dil Desteği

Web ve Mobile ortak dil altyapısı.

| Platform | Kütüphane |
|----------|-----------|
| **Web** | `next-intl` (Next.js App Router) |
| **Mobile** | `expo-localization` + `i18next` |
| **Shared** | `packages/shared/src/i18n/` — ortak JSON translation dosyaları |

### Yapı

```
packages/shared/src/i18n/
├── locales/
│   ├── tr.json        # Türkçe
│   └── en.json        # İngilizce (fallback)
├── config.ts          # i18next config
└── types.ts           # Type-safe translation keys
```

```json
// tr.json
{
  "app": {
    "name": "Acte",
    "tagline": "Monorepo Demo"
  },
  "common": {
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "retry": "Tekrar dene"
  }
}
```

---

## 16. Mobile: Fastlane iOS Build & TestFlight

### 16.1 Neden Fastlane (EAS değil)?

| Özellik | EAS Build | Fastlane |
|---------|-----------|----------|
| **Build altyapısı** | Expo sunucuları | Kendi runner'ın (GitHub macOS) |
| **Kontrol** | Kısıtlı | Full kontrol (signing, provisioning) |
| **İş akışı** | `eas build --platform ios` | `expo prebuild → fastlane gym → pilot` |
| **Ücret** | 30 build/ay ücretsiz | GitHub Actions dakikasıyla |
| **Code signing** | Expo yönetir | Fastlane Match ile |

### 16.2 Fastlane Setup

```
apps/mobile/
├── fastlane/
│   ├── Fastfile           # Lane tanımları
│   ├── Matchfile          # Code signing config
│   └── Appfile            # Apple ID, bundle ID
└── Gemfile                # fastlane bağımlılığı
```

### 16.3 Fastfile

```ruby
# apps/mobile/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :release do
    match(type: :appstore)
    gym(
      scheme: "acte",
      export_method: "app-store",
      workspace: "acte.xcworkspace",
    )
    pilot(
      skip_waiting_for_build_processing: true,
      distribute_external: false,
    )
  end

  desc "Build for development"
  lane :dev do
    match(type: :development)
    gym(
      scheme: "acte",
      export_method: "development",
    )
  end
end
```

### 16.4 GitHub Actions macOS Runner Workflow

```yaml
# .github/workflows/mobile-ios.yml
name: Mobile iOS Build
on:
  push:
    branches: [main]
    paths:
      - "apps/mobile/**"
      - "packages/shared/**"
      - "packages/api-client/**"

jobs:
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install --frozen-lockfile

      - name: Generate native code
        run: cd apps/mobile && npx expo prebuild --platform ios --clean

      - name: Fastlane build & upload
        run: |
          cd apps/mobile
          bundle exec fastlane ios release
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
          APP_STORE_CONNECT_KEY_ID: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
          APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
```

### 16.5 Gereksinimler (Setup Checklist)

- [ ] Apple Developer Program üyeliği ($99/yıl)
- [ ] App Store Connect'ta uygulama kaydı
- [ ] App Store Connect API Key oluşturma (App Store Connect → Users → Keys)
- [ ] GitHub Secrets'e ekleme:
  - `APP_STORE_CONNECT_API_KEY` (base64 encoded .p8 key)
  - `APP_STORE_CONNECT_KEY_ID`
  - `APP_STORE_CONNECT_ISSUER_ID`
  - `MATCH_PASSWORD`
  - `MATCH_GIT_BASIC_AUTHORIZATION`
  - `APPLE_ID`
  - `APPLE_APP_SPECIFIC_PASSWORD`
- [ ] Fastlane Match repo'su oluşturma (private git repo)
- [ ] Sertifikaları Match'e yükleme: `fastlane match init` + `fastlane match appstore`

---

## 17. Background Jobs & Queue (BullMQ + Redis)

Async işlemler için Redis tabanlı queue sistemi.

### Neden Redis?

| Kullanım | Açıklama |
|----------|----------|
| **Queue** | BullMQ ile iş kuyruğu (email, push, image processing) |
| **Cache** | Redis Cache (API response, session) |
| **Rate Limiting** | Redis-based rate limiter |
| **Pub/Sub** | Real-time event broadcasting (ileri faz) |

### Docker Compose

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
```

### Queue Yapısı

```typescript
// packages/queue/src/email.queue.ts
import { Queue, Worker } from "bullmq";

const connection = { host: "localhost", port: 6379 };

export const emailQueue = new Queue("email", { connection });

export const emailWorker = new Worker("email", async (job) => {
  const { to, subject, body } = job.data;
  await sendEmail(to, subject, body);
}, { connection });
```

### Backend Entegrasyonu

```typescript
// apps/backend/src/index.ts
import { emailQueue } from "queue";

app.post("/api/contact", async (c) => {
  const data = await c.req.json();
  await emailQueue.add("send-contact-email", {
    to: "hello@acte.app",
    subject: `New contact: ${data.email}`,
    body: data.message,
  });
  return c.json({ status: "ok", message: "Queued" });
});
```

---

## 18. Email Servisi (Resend)

Transactional email gönderimi için **Resend** kullanılır.

### Neden Resend?

- **Ücretsiz**: 100 email/gün (solo proje için yeterli)
- **React Email**: JSX ile email template oluşturma
- **SDK**: Basit API, TypeScript first
- **Delivery**: Yüksek deliverability (AWS SES altyapısı)

### Setup

```typescript
// packages/email/src/index.ts
import { Resend } from "resend";
import { WelcomeEmail } from "./templates/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: "Acte <hello@acte.app>",
    to: email,
    subject: "Hoşgeldin!",
    react: WelcomeEmail({ name }),
  });
}
```

### Email Templates (React Email)

```
packages/email/
├── src/
│   ├── templates/
│   │   ├── welcome.tsx
│   │   ├── reset-password.tsx
│   │   └── notification.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 19. File Upload & CDN (Cloudflare R2)

Kullanıcı dosyaları (avatar, resim, attachment) için Cloudflare R2.

### R2 Free Tier

| Metrik | Limit |
|--------|-------|
| **Storage** | 10 GB / ay (ücretsiz) |
| **Class A Ops** (write) | 1M istek / ay |
| **Class B Ops** (read) | 10M istek / ay |
| **Egress** | ✅ **Ücretsiz** (S3'ten farkı bu) |

> Egress ücreti olmaması R2'yi S3'e göre büyük avantajlı kılar. Özellikle kullanıcı resimleri gibi sık okunan dosyalar için idealdir.

### Backend Upload Flow

```typescript
// apps/backend/src/routes/upload.ts
import { S3Client } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

app.post("/api/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"] as File;

  await r2.send(new PutObjectCommand({
    Bucket: "acte-uploads",
    Key: `avatars/${crypto.randomUUID()}`,
    Body: file.stream(),
    ContentType: file.type,
  }));

  return c.json({ status: "ok" });
});
```

### Public URL Yapısı

```bash
# R2 public bucket (veya custom domain)
https://uploads.acte.app/avatars/uuid.jpg
# Caddy reverse proxy ile:
uploads.acte.app → R2 bucket
```

---

## 20. Analytics (PostHog)

Kullanıcı davranışı ve product telemetry için **PostHog**.

### Neden PostHog?

| Özellik | PostHog |
|---------|---------|
| **Fiyat** | 1M event/ay ücretsiz + self-host seçeneği |
| **Product Analytics** | Funnel, retention, trend, path analysis |
| **Session Recording** | Kullanıcı oturumu kaydı |
| **Feature Flags** | Dahili feature flag sistemi (PostHog kullanılıyorsa ayrı flag servisi gerekmez) |
| **Self-host** | Docker ile kendi sunucunda çalıştırabilirsin |
| **Açık Kaynak** | MIT licensed |

### Setup

```typescript
// apps/web/src/lib/posthog.ts
import { PostHog } from "posthog-js";

export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
```

```typescript
// apps/mobile/src/lib/posthog.ts
import PostHog from "posthog-react-native";
// Aynı API, native wrapper
```

### Track Edilmesi Gereken Eventler

```typescript
// Kullanıcı event'leri
posthog.capture("user_signed_up", { method: "google" });
posthog.capture("item_created", { itemType: "note" });
posthog.capture("screen_viewed", { screen: "profile" });

// Performans
posthog.capture("api_error", { endpoint: "/api/items", statusCode: 500 });
```

---

## 21. Feature Flags

Özellikleri deploy etmeden açıp kapatmak için.

### Seçenekler

| Çözüm | Açıklama |
|-------|----------|
| **PostHog** (built-in) | PostHog kullanılıyorsa ayrı servis gerekmez |
| **Flagsmith** | Self-host, open source |
| **Env-based** | Basit: `.env` ile toggle. CI'da değiştirilir. |

### PostHog Feature Flags

```typescript
// Örnek: yeni özellik sadece %50 kullanıcıya açık
if (posthog.isFeatureEnabled("new-onboarding")) {
  return <NewOnboarding />;
}
return <OldOnboarding />;
```

### Flag Yönetimi

| Flag Adı | Varsayılan | Açıklama |
|----------|-----------|----------|
| `new-onboarding` | false | Yeni onboarding akışı |
| `dark-mode` | true | Karanlık tema |
| `ai-features` | false | AI özellikleri (kapalı gelir) |

---

## 22. Deep Linking / Universal Links

Mobil uygulamada dış bağlantıları yakalama ve yönlendirme.

### Yapı

| Platform | Yöntem |
|----------|--------|
| **iOS** | Universal Links (`acte.app/...`) |
| **Android** | App Links (`acte.app/...`) |
| **Custom Scheme** | `acte://item/123` (fallback) |

### Expo Router Config

```json
// apps/mobile/app.json
{
  "expo": {
    "scheme": "acte",
    "plugins": [
      "expo-router"
    ]
  }
}
```

### Route Yapısı

```tsx
// apps/mobile/src/app/item/[id].tsx  ← Deep link: acte://item/123
export default function ItemScreen() {
  const { id } = useLocalSearchParams();
  // ...
}
```

### Push'tan Yönlendirme

```typescript
// Push notification'dan gelen data ile routing
notifications.addNotificationResponseReceivedListener((response) => {
  const { screen, params } = response.notification.request.content.data;
  router.push(`/${screen}/${params.id}`);
});
```

---

## 23. Environment Management

Her ortam için ayrı yapılandırma.

### Ortamlar

| Ortam | Amaç | Domain | PostgreSQL | Redis |
|-------|------|--------|-----------|-------|
| **development** | Local geliştirme | localhost:3000/4000/8081 | Docker (local) | Docker (local) |
| **staging** | Test/QA | staging.acte.app | Staging DB | Staging |
| **production** | Canlı | acte.app | Production DB | Production + Cluster |

### .env Dosya Yapısı

```
.env.example             # Tüm değişkenlerin şablonu
apps/backend/.env        # Backend development
apps/backend/.env.staging
apps/backend/.env.production
apps/web/.env.local      # Web development
apps/web/.env.staging
apps/web/.env.production
```

### Zod ile Runtime Validation

```typescript
// packages/config/src/env.ts
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "staging", "production"]),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().min(1),
  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY: z.string().min(1),
  R2_SECRET_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

---

## 24. Performance Budget

Web ve Mobile için performans hedefleri.

### Web (Core Web Vitals)

| Metrik | Hedef | Araç |
|--------|-------|------|
| **LCP** (Loading) | < 2.5s | Lighthouse, Web Vitals |
| **FID/INP** (Interaction) | < 200ms | Lighthouse |
| **CLS** (Layout Shift) | < 0.1 | Lighthouse |
| **Bundle Size** (JS) | < 200KB (gzip) | `next/bundle-analyzer` |
| **Lighthouse Score** | > 90 | CI'da otomatik kontrol |

### Mobile

| Metrik | Hedef | Araç |
|--------|-------|------|
| **App Size** | < 50MB (IPA/APK) | EAS Build reports |
| **Launch Time** | < 2s cold start | Metro profiling |
| **FPS** | 60fps scrolling | FPS Monitor (dev) |
| **Network** | Minify + compress API | TanStack Query caching |

### CI'da Performance Gate

```yaml
# GitHub Actions - performance check
- run: npx lighthouse-ci https://staging.acte.app
- run: npx bundlesize --threshold 200KB
```

---

## 25. UI Library (Mobile)

Expo uygulaması için UI component kütüphanesi.

### Öneri: **NativeWind v4**

Web'de Tailwind v4 kullanıldığı için mobilde de **NativeWind** en doğal seçim.

| Özellik | NativeWind v4 |
|---------|---------------|
| **Stil** | Tailwind utility class (web ile aynı) |
| **Setup** | Metro bundler plugin |
| **TypeScript** | Full type-safe class names |
| **Performance** | Compile-time CSS → minimal runtime |
| **Expo SDK 56** | ✅ Tam uyumlu |
| **Versiyon** | v4.2.5 (Tailwind v4 ile eşleşir) |

### Alternatifler

| Kütüphane | Yaklaşım | Neden Olmasın? |
|-----------|----------|----------------|
| **Tamagui** | Full framework | Ağır, web ile aynı Tailwind mentalitesi kaybolur |
| **React Native Paper** | Material Design | Ayrı bir tasarım dili öğrenmek gerekir |
| **Gluestack UI** | Universal | NativeWind kadar olgun değil |

### Setup

```bash
cd apps/mobile
bun add nativewind
bun add --dev @types/nativewind

# metro.config.js'e NativeWind plugin'i eklenir
```

```tsx
// Kullanım (Web ile aynı!)
export default function Card() {
  return (
    <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <Text className="text-emerald-400 text-lg font-medium">
        Merhaba!
      </Text>
    </View>
  );
}
```

---

## 26. API Versioning

Mobile client'lar geride kaldığında eski API versiyonlarını destekleme.

### Strateji: Header-based Versioning

```typescript
// İstek: Accept-Version: v1 (header)
// Varsayılan: en son versiyon
```

### Backend Implementasyonu

```typescript
// apps/backend/src/middleware/version.ts
app.use("/api/*", async (c, next) => {
  const version = c.req.header("Accept-Version") || `v${LATEST_VERSION}`;
  c.set("apiVersion", version);
  await next();
});

// Route handler'da versiyon kontrolü
app.get("/api/items", async (c) => {
  const version = c.get("apiVersion");
  if (version === "v1") return handleV1(c);
  return handleV2(c);
});
```

### Version Lifecycle

```
v1 → v2 çıktı → v1 deprecated (uyarı log'u) → v1 sunset (404)
├─ v1 ile v2 arasında en az 6 ay
├─ Deprecated mobil client'lara header ile uyarı
└─ Sunset tarihi response header'ında bildirilir
```

```typescript
// Deprecation header
app.use("/api/*", async (c, next) => {
  const version = c.get("apiVersion");
  if (version === "v1") {
    c.header("X-API-Deprecated", "true");
    c.header("X-API-Sunset", "2027-06-01");
  }
  await next();
});
```

---

## 27. Development Phases

### Phase 0 — Foundation ⬅️ **Şu an buradayız**

```
Amaç:      Monorepo altyapısı, tooling, git workflow
Durum:     ✅ Tamam
Çıktılar:
  - Turborepo + Bun workspaces
  - Next.js web, Hono backend, Expo mobile
  - Shared types/schemas/constants
  - Git init + .gitignore
  - .env files
  - API demo (web+mobile → backend)
```

### Phase 1 — Enterprise Toolchain

```
Amaç:      Semantic versioning, pre-commit, CI/CD
Plan:
  - Husky + commitlint + lint-staged
  - semantic-release setup
  - .releaserc.json + CHANGELOG.md
  - GitHub Actions: CI, CD, Release
  - Biome (lint + format)
  - Root VERSION dosyası ve versiyon senkronizasyonu
```

### Phase 2 — Database & Auth

```
Amaç:      PostgreSQL + Drizzle ORM + Better Auth
Plan:
  - Docker Compose (postgres)
  - packages/db: schema, migrations, queries
  - Better Auth kurulumu (backend)
  - Auth hooks (web + mobile)
  - packages/api-client: authenticated requests
```

### Phase 3 — Data Fetching & State

```
Amaç:      TanStack Query + Zustand + API client
Plan:
  - TanStack Query kurulumu (web + mobile)
  - Zustand store yapısı
  - packages/api-client: typed endpoints
  - Query hooks paylaşımı
  - Infinite scroll / pagination patterns
```

### Phase 4 — UI & Development

```
Amaç:      Component kütüphaneleri, form yönetimi
Plan:
  - Web: shadcn/ui (Tailwind v4 uyumlu)
  - Mobile: React Native Paper / NativeWind
  - Form: React Hook Form + Zod resolver
  - Shared UI components (packages/ui)
```

### Phase 5 — Testing

```
Amaç:      Unit, integration, E2E test altyapısı
Plan:
  - Vitest + React Testing Library (web)
  - Jest + React Native Testing Library (mobile)
  - MSW (API mock)
  - Playwright (web E2E)
  - CI'da test koşumu
```

### Phase 6 — Deployment & Monitoring

```
Amaç:      Docker, VPS deploy, monitoring
Plan:
  - Dockerfile (multi-stage)
  - Docker Compose (prod)
  - Nginx reverse proxy + SSL (Certbot)
  - VPS deploy script
  - Pino structured logging
  - Sentry error tracking
  - Health check endpoints
```

### Phase 7 — Observability (Gelişmiş)

```
Amaç:      Prometheus + Grafana + Loki
Plan:
  - Prometheus metrics endpoint
  - Grafana dashboard
  - Loki log aggregation
  - Alert rules
```

---

## Teknoloji Stack Özeti

| Alan | Teknoloji | Sebep |
|------|-----------|-------|
| **Runtime** | Bun | TS-native, hızlı, monorepo dostu |
| **Monorepo** | Turborepo + Bun Workspaces | Build caching, parallel tasks |
| **Web** | Next.js 16 + React 19 | SSR, App Router, ekosistem |
| **Backend** | Hono 4 | Hafif, Bun-native, middleware yapısı |
| **Mobile** | Expo SDK 56 | Cross-platform, TS paylaşımı |
| **Database** | PostgreSQL 17 | Production-grade, ilişkisel |
| **ORM** | Drizzle | SQL-like, type-safe, hafif |
| **Auth** | Better Auth | Self-hosted, güçlü özellikler |
| **Data Fetching** | TanStack Query v5 | Caching, pagination, sync |
| **State** | Zustand | Minimal, TS-native |
| **Validation** | Zod | Tip çıkarımı, ekosistem |
| **Versioning** | semantic-release | Conventional commits + auto tag |
| **Lint/Format** | Biome | Hızlı, tek araç |
| **Git Hooks** | Husky + lint-staged + commitlint | Kalite gates |
| **CI/CD** | GitHub Actions | GitHub ile entegre |
| **Container** | Docker + Docker Compose | Taşınabilir deploy |
| **Proxy** | Nginx | Reverse proxy, SSL, esnek |
| **Queue** | BullMQ + Redis 7 | Async işlemler, cache, rate limiting |
| **Email** | Resend | 100 email/gün ücretsiz, React Email templates |
| **File Storage** | Cloudflare R2 | 10GB ücretsiz, egress ücreti yok, S3 uyumlu |
| **Analytics** | PostHog | 1M event/ay ücretsiz, self-host, feature flags |
| **Logging** | Pino | En hızlı Node.js logger |
| **Error Tracking** | Sentry | 5K error/ay ücretsiz |
| **Mobile UI** | NativeWind v4 | Tailwind v4 ile aynı mentalite |
| **i18n** | next-intl + i18next | Web + Mobile ortak dil altyapısı |
| **Push Notifications** | Expo Push API | FCM + APNs entegrasyonu |
| **Testing** | Vitest, RTL, Playwright | Modern test araçları |
| **E2E Mobile** | Detox / Maestro | Native app test |
| **API Mock** | MSW | Consistent mock |
| **Form** | React Hook Form + Zod | Type-safe formlar |

---

> **📌 Not:** Bu blueprint karar ağacı olarak tasarlanmıştır. Her Phase'e geçmeden önce hangi teknolojileri ekleyeceğimize birlikte karar veririz. Şimdi Phase 1 ile başlamak istersen — semantic versioning ve pre-commit altyapısını kuralım.
