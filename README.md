<!-- markdownlint-disable MD041 -->

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://via.placeholder.com/400x100/1a1a2e/ffffff?text=Acte">
    <img alt="Acte" src="https://via.placeholder.com/400x100/ffffff/1a1a2e?text=Acte" width="400">
  </picture>
</p>

<h1 align="center">Acte</h1>

<p align="center">
  <strong>Next‑gen monorepo — Web · Mobile · Backend</strong>
  <br />
  <sub>Bun · Turborepo · Next.js · Expo · Hono · PostgreSQL</sub>
</p>

<p align="center">
  <a href="https://github.com/acte/acte/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/acte/acte/ci.yml?branch=main&label=CI&logo=github" alt="CI"></a>
  <a href="https://github.com/acte/acte/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/acte/acte/codeql.yml?branch=main&label=CodeQL&logo=github" alt="CodeQL"></a>
  <a href="https://github.com/acte/acte"><img src="https://img.shields.io/github/v/release/acte/acte?include_prereleases&sort=semver&logo=semver" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-1.2.5-black?logo=bun" alt="Bun"></a>
  <a href="https://turbo.build"><img src="https://img.shields.io/badge/Turborepo-2.5.0-blue?logo=turborepo" alt="Turborepo"></a>
</p>

---

## 📋 İçindekiler — Table of Contents

- [Quick Start](#quick-start)
- [Proje Yapısı — Project Structure](#proje-yapısı--project-structure)
- [Mimari — Architecture](#mimari--architecture)
- [Geliştirme — Development](#geliştirme--development)
- [Deploy — Deployment](#deploy--deployment)
- [Test — Testing](#test--testing)
- [Ortam Değişkenleri — Environment Variables](#ortam-değişkenleri--environment-variables)
- [Katkıda Bulunma — Contributing](#katkıda-bulunma--contributing)
- [Lisans — License](#lisans--license)

---

## 🚀 Quick Start

### Ön Koşullar — Prerequisites

| Araç — Tool  | Sürüm — Version | Not                         |
| ------------- | --------------- | --------------------------- |
| [Bun]         | ≥ 1.2.5          | JavaScript runtime & pkg mgr |
| [Docker]      | ≥ 24             | PostgreSQL & Redis servisleri |
| [Docker Compose] | ≥ 2.24       | Container orchestration      |

[Bun]: https://bun.sh
[Docker]: https://docker.com
[Docker Compose]: https://docs.docker.com/compose/

### Kurulum — Setup

```bash
# 1. Repoyu klonla
git clone https://github.com/acte/acte.git
cd acte

# 2. Bağımlılıkları yükle ve arka plan servislerini başlat
make setup

# 3. (İlk sefer) Veritabanı migrasyonlarını çalıştır
make db-migrate
make db-seed

# 4. Geliştirme sunucularını başlat
make dev
```

Tarayıcında aç: [http://localhost:3000](http://localhost:3000)

---

## 📁 Proje Yapısı — Project Structure

```
acte/
├── apps/                     # Uygulamalar (deploy edilebilir)
│   ├── web/                  #   Next.js (Web)
│   ├── mobile/               #   Expo (iOS / Android)
│   └── backend/              #   Hono (API Server, Bun)
│
├── packages/                 # Paylaşımlı paketler
│   ├── api-client/           #   API istemci SDK'sı (Zod)
│   ├── db/                   #   Drizzle ORM (PostgreSQL)
│   ├── email/                #   E-posta şablonları (React Email)
│   ├── env/                  #   Zod doğrulamalı env yöneticisi
│   ├── feature-flags/        #   Özellik bayrakları (React Context)
│   ├── jobs/                 #   Kuyruk / iş tanımları (BullMQ)
│   └── shared/               #   Paylaşılan tipler, sabitler, şemalar
│
├── docker/                   # Docker Compose konfigürasyonları
│   ├── docker-compose.yml    #   Yerel geliştirme (Postgres + Redis)
│   └── docker-compose.prod.yml  # Prod ortamı (Nginx + Backend + DB)
│
├── monitoring/               # Monitoring / Observability
│   ├── prometheus/           #   Prometheus scrape config
│   └── grafana/              #   Grafana dashboards & provisioning
│
├── scripts/                  # Shell scriptleri (deploy, vs.)
├── .github/                  # CI / CD (Dependabot, CodeQL, Actions)
├── .husky/                   # Git hooks (pre-push)
├── turbo.json                # Turborepo pipeline yapılandırması
├── Makefile                  # Yardımcı komutlar
└── package.json              # Monorepo root (Bun workspaces)
```

### Klasör Açıklamaları

| Dizin              | Ne işe yarar                                  |
| ------------------ | --------------------------------------------- |
| `apps/web`         | Next.js 16 ile modern web uygulaması          |
| `apps/mobile`      | Expo ile cross‑platform mobil uygulama        |
| `apps/backend`     | Hono ile yüksek performanslı API (Bun)        |
| `packages/db`      | Drizzle ORM + PostgreSQL schema & migrations   |
| `packages/shared`  | TypeScript tipleri, validasyon, sabitler      |
| `packages/env`     | Zod tabanlı ortam değişkeni doğrulama         |
| `packages/email`   | React Email ile e‑posta şablonları            |
| `monitoring/`      | Prometheus + Grafana altyapısı                |

---

## 🏗️ Mimari — Architecture

### Tech Stack

| Layer       | Teknoloji                                   |
| ----------- | ------------------------------------------- |
| **Runtime** | Bun 1.2.5                                   |
| **Monorepo**| Turborepo 2.5 + Bun Workspaces              |
| **Web**     | Next.js 16, React 19, Tailwind CSS 4        |
| **Mobile**  | Expo 56, React Native 0.85, NativeWind      |
| **Backend** | Hono 4, Zod OpenAPI, Better‑Auth            |
| **Database**| PostgreSQL 17 (Drizzle ORM)                 |
| **Cache**   | Redis 7 (BullMQ queues)                     |
| **Email**   | Resend / React Email                        |
| **Storage** | AWS S3 (presigned URLs)                     |
| **CI/CD**   | GitHub Actions + Dependabot + CodeQL        |
| **Monitoring** | Prometheus + Grafana                    |
| **Deploy**  | Docker Compose (VPS) + Cloudflare Pages     |

### Veri Akışı — Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Mobile       │    │  Web          │    │  External     │
│  (Expo)       │    │  (Next.js)    │    │  (Clients)    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼───────┐
                    │  Backend API  │  Hono + Zod OpenAPI
                    │  (apps/backend)│
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼────┐  ┌─────▼─────┐  ┌────▼─────┐
     │ PostgreSQL │  │   Redis   │  │   AWS S3  │
     │ (Drizzle)  │  │ (BullMQ)  │  │ (Storage) │
     └────────────┘  └───────────┘  └──────────┘
```

---

## 💻 Geliştirme — Development

### Yardımcı Komutlar — Makefile

```text
Target           Description
─────           ───────────
make dev        Tüm geliştirme sunucularını başlat
make build      Tüm paketleri ve uygulamaları derle
make test       Tüm testleri çalıştır
make lint       Biome ile lint kontrolü
make lint-fix   Lint hatalarını otomatik düzelt
make format     Biome ile kod formatla
make clean      Derleme çıktılarını temizle
make typecheck  TypeScript tip kontrolü

make setup      Bağımlılıkları yükle + Docker'ı başlat
make db-up      PostgreSQL + Redis Docker containerlarını başlat
make db-down    Containerları durdur
make db-reset   Volume'ları sil ve containerları yeniden başlat
make db-migrate Drizzle migrasyonlarını çalıştır (packages/db)
make db-generate  Drizzle schema'dan migration oluştur
make db-studio  Drizzle Studio'yu aç (DB GUI)
make db-seed    Test verileri ile DB'yi doldur

make deploy     Production VPS'e deploy et (./scripts/deploy.sh)
make help       Tüm komutları listele
```

### Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/) formatını kullanıyoruz:

```
<type>(<scope>): <description>

# Örnekler
feat(backend): add user preferences endpoint
fix(web): correct login form validation
chore(deps): update drizzle to 0.43
docs(readme): add deployment section
refactor(shared): extract validation helpers
```

| Type       | Anlamı                        |
| ---------- | ----------------------------- |
| `feat`     | Yeni özellik                  |
| `fix`      | Hata düzeltmesi               |
| `chore`    | Bakım / bağımlılık güncelleme |
| `docs`     | Dokümantasyon                 |
| `refactor` | Kod yeniden düzenleme         |
| `test`     | Test ekleme / düzeltme        |
| `style`    | Format / stil değişikliği     |

### Branch Stratejisi — Branch Strategy

```
develop  ────>  feature/my-feature   (yeni özellik)
develop  ────>  fix/my-bug           (hata düzeltmesi)
develop  ────>  PR ────>  main       (release)
```

1. `develop` branch'inden bir `feature/` veya `fix/` branch'i aç
2. Değişiklikleri yap, commit'le, push'la
3. `develop`'a PR aç (pre-push hook'u lint + typecheck + test çalıştırır)
4. Review sonrası merge et
5. `develop` → `main` PR'ı ile release

---

## 🚢 Deploy — Deployment

### Web — Cloudflare Pages

```bash
# Cloudflare Pages dashboard'u üzerinden apps/web bağlanır
# Build komutu: next build
# Build output: .next
```

### Backend — Docker + VPS (Nginx)

```bash
# Tek komutla deploy:
SSH_HOST=49.12.109.24 make deploy
```

Bu komut:
1. SSH ile production sunucusuna bağlanır
2. `docker-compose.prod.yml` ve `nginx.conf`'u upload eder
3. En son Docker imajlarını GHCR'den çeker
4. Servisleri `up -d` ile başlatır
5. Atıl Docker imajlarını temizler
6. Health check yapar

### Mobile — Fastlane (iOS)

```bash
# Expo + Fastlane ile App Store / TestFlight
cd apps/mobile
fastlane ios beta       # TestFlight
fastlane ios release    # App Store
```

---

## 🧪 Test — Testing

### CI Pipeline

```
push / PR
  │
  ├── 1. Lint (Biome)          ←  lint
  ├── 2. Type Check (tsc)       ←  typecheck
  ├── 3. Unit Tests (Vitest)    ←  test
  ├── 4. CodeQL (security)      ←  codeql.yml
  └── 5. Build                  ←  build
```

Testleri yerelde çalıştırmak için:

```bash
make lint       # Biome ile lint + format kontrolü
make typecheck  # TypeScript tip güvenliği
make test       # Tüm birim testleri
```

### Pre-push Hook

`.husky/pre-push` hook'u her `git push` öncesinde şu adımları çalıştırır:

```bash
bun run lint        # Lint kontrolü
bun run check-types # TypeScript tip kontrolü
bun run test        # Unit testler
```

Eğer adımlardan biri başarısız olursa push engellenir.

---

## 🔐 Ortam Değişkenleri — Environment Variables

> Ortam değişkenleri `packages/env` paketi ile Zod tabanlı doğrulanır.
> Eksik / hatalı değişkenler uygulama başlatılırken hata fırlatır.

### Tüm Uygulamalar İçin Ortak

| Değişken          | Zorunlu | Varsayılan                              | Açıklama                          |
| ----------------- | ------- | ----------------------------------------- | --------------------------------- |
| `NODE_ENV`        | Hayır   | `development`                             | Çalışma ortamı                    |
| `PORT`            | Hayır   | `4000`                                    | Backend API port                  |
| `DATABASE_URL`    | Hayır   | `postgres://acte:***@localhost:5432/acte` | PostgreSQL bağlantı dizesi        |
| `REDIS_URL`       | Hayır   | `redis://localhost:***@acte.app`          | Redis bağlantı dizesi             |
| `SENTRY_DSN`      | Hayır   | —                                         | Sentry monitoring                 |
| `AWS_ACCESS_KEY_ID` | Hayır | —                                       | AWS / S3 erişim anahtarı          |
| `AWS_SECRET_ACCESS_KEY` | Hayır | —                                  | AWS / S3 gizli anahtarı           |
| `AWS_REGION`      | Hayır   | `us-east-1`                               | AWS bölgesi                       |
| `S3_BUCKET`       | Hayır   | —                                         | S3 bucket adı                     |

### Web (Next.js) İçin

| Değişken                   | Zorunlu | Açıklama                          |
| -------------------------- | ------- | --------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Evet    | Backend API base URL              |
| `NEXT_PUBLIC_SENTRY_DSN`   | Hayır   | Sentry public DSN (client-side)   |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Hayır   | PostHog feature flags public key  |
| `NEXT_PUBLIC_POSTHOG_HOST` | Hayır   | PostHog host                      |

### Mobile (Expo) İçin

| Değişken                | Zorunlu | Açıklama                          |
| ----------------------- | ------- | --------------------------------- |
| `EXPO_PUBLIC_API_URL`   | Evet    | Backend API base URL              |
| `EXPO_PUBLIC_SENTRY_DSN`| Hayır   | Sentry public DSN (client-side)   |

### Backend İçin

| Değişken          | Zorunlu | Açıklama                          |
| ----------------- | ------- | --------------------------------- |
| `DATABASE_URL`    | Evet    | PostgreSQL bağlantı dizesi        |
| `REDIS_URL`       | Evet    | Redis bağlantı dizesi             |
| `RESEND_API_KEY`  | Hayır   | Resend e-posta API anahtarı       |
| `SENTRY_DSN`      | Hayır   | Sentry DSN (server-side)          |
| `AWS_*`           | Hayır   | AWS S3 credential'ları            |

### Örnek `.env` Dosyası

```bash
# Root .env (örnek)
cp .env.example .env.local
```

---

## 🤝 Katkıda Bulunma — Contributing

1. Bu repoyu fork'layın
2. `develop` branch'inden feature branch'i açın: `git checkout -b feature/amazing-feature`
3. Değişikliklerinizi yapın ve commit'leyin (Conventional Commits)
4. Push'layın: `git push origin feature/amazing-feature`
5. `develop` branch'ine Pull Request açın

### Code Review Süreci

- Tüm PR'lar CodeQL security analizinden geçmelidir
- En az 1 review onayı gereklidir
- Pre-push hook tüm adımları geçmelidir (lint + typecheck + test)

---

## 📄 Lisans — License

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<p align="center">
  <sub>Built with ❤️ by the Acte Team</sub>
  <br />
  <sub>İstanbul · Berlin · Remote</sub>
</p>
