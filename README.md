# TechSwap

**AI-powered electronics marketplace and problem-solving platform.**

See the full specification in the build prompt. This repository contains the
frontend, backend, database migrations, Docker configurations, OpenShift/K8s
manifests, CI/CD pipeline, and serverless functions for the TechSwap hackathon
project.

## Quick links

- [Architecture & plan](#-architecture--plan-)
- [Installation & local development](#-installation--local-development-)
- [Docker & OpenShift deployment](#-docker--openshift-deployment-)
- [CI/CD pipeline](#-cicd-pipeline-)
- [Demo scenario](#-demo-scenario-)

---

## Architecture & plan

1. **Architecture overview** – full‑stack React + Node/Express + PostgreSQL,
   Docker, OpenShift.
2. **Technology stack** – React, Tailwind CSS, Node 20, Express, pg, PostgreSQL,
   Docker, Quay.io, GitHub Actions, OpenShift 4.
3. **Repository structure** – see the directory layout below.
4. **Database schema** – users, products, categories, orders, order_items,
   reviews, shops, technicians, condition_scorings.
5. **Frontend pages** – /, /login, /register, /buy, /product/:id, /sell,
   /my-listings, /orders, /cart, /checkout, /problem-solver, /nearby,
   /shops, /technicians, /profile, /admin.
6. **Backend API structure** – /api/auth, /api/users, /api/products,
   /api/categories, /api/listings, /api/orders, /api/cart, /api/reviews,
   /api/shops, /api/technicians, /api/problem-solver/analyze,
   /api/notifications, /api/admin.
7. **OpenShift/K8s resource plan** – namespace, configmap, secrets,
   deployments (frontend, backend, postgres), services, PVC, HPA, route,
   RBAC, network-policy.
8. **CI/CD architecture** – GitHub Actions: checkout → install → lint → test →
   build → push → deploy.
9. **Serverless event architecture** – order.created event → Knative trigger →
   serverless function (notification/record).
10. **Security architecture** – TLS via OpenShift Route, Secrets, RBAC,
    NetworkPolicy.
11. **Monitoring architecture** – OpenShift Monitoring (Prometheus + Grafana).
12. **External dependencies / credentials** – PostgreSQL, JWT secret, optional
    AI API key, Stripe test keys, Google Maps API key.
13. **Potential risks or limitations** – AI fallback reliability, sandbox payment
    limits, Maps deep‑link constraints, OpenShift cluster access.
14. **Recommended implementation order** – PHASE 1 → PHASE 28 (see build prompt).

## Technology stack

- **Frontend**: React 18 + React Router + Axios + Tailwind CSS
- **Backend**: Node.js 20 + Express + pg (PostgreSQL client)
- **Database**: PostgreSQL 15 (managed on OpenShift)
- **Containerization**: Docker + docker-compose (local), Quay.io (registry)
- **Orchestration**: OpenShift 4 / Kubernetes 1.29
- **CI/CD**: GitHub Actions
- **Styling**: Tailwind CSS (utility‑first, responsive)
- **State**: React Query for server state, localStorage for cart
- **Authentication**: JWT (jsonwebtoken) with refresh‑token rotation
- **AI**: Rule‑based fallback service + optional external AI provider
- **Maps**: Google Maps Javascript API (deep links only)
- **Testing**: Jest + React Testing Library + Supertest

## Directory layout

```
techswap/
├── frontend/           # React SPA
│   ├── src/
│   │   ├── components/   # reusable UI components
│   │   ├── pages/        # all page components
│   │   ├── hooks/        # custom hooks (useAuth, useProduct, useCart)
│   │   ├── api/          # API client interceptors
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/            # Node/Express API
│   ├── src/
│   │   ├── routes/           # /api/auth, /api/products, etc.
│   │   ├── middleware/       # auth, validation, error handler
│   │   ├── services/         # problem-solver, search, notification
│   │   ├── models/           # Sequelize/Knex models
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── migrations/
│   └── seeders/
├── database/           # SQL migration files
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── .dockerignore
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── frontend-deployment.yaml (replicas: 3, rolling update)
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml (replicas: 3, HPA)
│   ├── backend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── postgres-pvc.yaml
│   ├── hpa.yaml
│   ├── route.yaml
│   ├── rbac.yaml
│   └── network-policy.yaml
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── serverless/
│   └── order-event/           # Knative/OpenShift function
├── README.md
└── package.json
```

## CI/CD pipeline (GitHub Actions)

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd backend && npm ci && npm run lint && npm test
      - run: cd frontend && npm ci && npm run lint && npm test
      - run: cd backend && npm run build && cd frontend && npm run build
      - name: Login to Quay.io
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.QUAY_USER }}
          password: ${{ secrets.QUAY_TOKEN }}
      - name: Build and push backend
        run: |
          docker build -t techswap/backend ./backend
          docker push techswap/backend:{{ github.sha }}
      - name: Build and push frontend
        run: |
          docker build -t techswap/frontend ./frontend
          docker push techswap/frontend:{{ github.sha }}
      - name: Deploy to OpenShift
        run: |
          oc login ${{ secrets.OPENSHIFT_URL }} -u ${{ secrets.OPENSHIFT_USER }} -p ${{ secrets.OPENSHIFT_TOKEN }}
          oc project techswap
          oc apply -f k8s/
          oc set image deployment/backend backend=techswap/backend:${{ github.sha }}
          oc set image deployment/frontend frontend=techswap/frontend:${{ github.sha }}

  deploy: { needs: build-test, runs-on: openshift }
```

## Demo scenario (20 steps)

1. Open TechSwap.
2. Enter problem: "My laptop is very slow and I don't have enough storage."
3. Click **Find Solutions**.
4. AI recommends SSD, RAM.
5. Marketplace displays actual products (new/pre‑owned, different prices).
6. Compare prices.
7. Open a product.
8. Add to cart.
9. Checkout using test payment.
10. Order is created.
11. Demonstrate `order.created` event triggering serverless function.
12. Open Nearby → show shops & technicians.
13. Open Google Maps navigation for a shop/technician.
14. Switch to Sell → create a listing.
15. Listing appears in marketplace.
16. Open OpenShift → show multiple replicas, services, route, HPA, PVC, secrets, network‑policy.
17. Generate load → show HPA scaling.
18. Delete one pod → show automatic recovery.
19. Deploy new version → show rolling update with continued availability.
20. Open monitoring dashboard → show CPU, memory, pods, requests, errors, HPA.

## Local development

1. `cd techswap && cp .env.example .env` – fill in DB URL, JWT secret, etc.
2. `docker-compose up -d` – starts frontend, backend, postgres.
3. `cd backend && npm run dev` / `cd frontend && npm run dev` – hot‑reload.
4. Visit `http://localhost:5173` (Vite) or the port defined in the frontend config.

## Environment variables

See `.env.example` in the repo root. Never commit `.env`.

---

*Generated from the TechSwap build prompt.*