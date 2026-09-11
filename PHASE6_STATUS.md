# TechSwap — Phase 6: Dockerization, OpenShift/HA Testing, Failure Testing

## 📋 Phase 6 Objectives

Phase 6 focuses on production-grade infrastructure delivery:
- **Docker image optimization** — Multi-stage builds, registry-ready images
- **OpenShift/Kubernetes validation** — Deploy and verify all resources
- **High Availability testing** — HPA scaling, pod failure recovery
- **Rolling deployment** — Zero-downtime updates
- **Health probes** — Liveness, readiness, startup configured
- **Load balancing** — Service distribution across pods
- **Failure testing** — Pod deletion, load generation, resilience verification
- **Monitoring & logging** — Integration with OpenShift metrics

## ✅ Phase 6: Infrastructure Summary (from Phases 1-5)

### Docker Configuration
| Component | File | Image | Status |
|-----------|------|-------|--------|
| Backend | `backend.Dockerfile` | `quay.io/techswap/backend:latest` | ✅ Multi-stage Node.js 20 Alpine |
| Frontend | `frontend.Dockerfile` | `quay.io/techswap/frontend:latest` | ✅ Node → nginx |
| Compose | `docker-compose.yml` | Local dev: frontend(5173), backend(3000), PostgreSQL(5432) | ✅ |

### OpenShift/Kubernetes Manifests
| Resource | File | Status |
|----------|------|--------|
| Namespace | `k8s/namespace.yaml` | ✅ Created |
| ConfigMap | `k8s/configmap.yaml` | ✅ Created |
| Secrets | `k8s/secrets.yaml` | ✅ Created ([REDACTED]) |
| All-in-one | `k8s/all-resources.yaml` | ✅ 26 documents validated |
| Frontend Deployment | `k8s/frontend-deployment.yaml` | ✅ 3 replicas |
| Frontend Service | `k8s/frontend-service.yaml` | ✅ LoadBalancer/Route |
| Backend Deployment | `k8s/backend-deployment.yaml` | ✅ 3 replicas, RollingUpdate |
| Backend Service | `k8s/backend-service.yaml` | ✅ ClusterIP + HPA |
| PostgreSQL Deployment | `k8s/postgres-deployment.yaml` | ✅ With PVC |
| PostgreSQL Service | `k8s/postgres-service.yaml` | ✅ ClusterIP |
| PersistentVolumeClaim | `k8s/postgres-pvc.yaml` | ✅ PVs for PostgreSQL |
| HPA | `k8s/hpa.yaml` | ✅ min 3, max 10, 70% CPU |
| Route/Ingress | `k8s/route.yaml` | ✅ OpenShift Route |
| RBAC | `k8s/rbac.yaml` | ✅ Service accounts/roles |
| NetworkPolicy | `k8s/network-policy.yaml` | ✅ Restricted access |

### Key Kubernetes Configuration

| Feature | Configuration | Purpose |
|---------|--------------|---------|
| **Replicas** | 3 each for frontend/backend | High availability |
| **RollingUpdate** | maxUnavailable: 1, maxSurge: 1 | Zero-downtime deployments |
| **HPA** | min: 3, max: 10, target 70% CPU | Auto-scaling |
| **Liveness Probe** | /health, delay 15s, period 10s | Detect unhealthy pods |
| **Readiness Probe** | /health, delay 10s, period 5s | Traffic admission control |
| **Startup Probe** | /health, delay 20s, period 10s, failures 12 | Wait for app init |
| **PersistentVolumeClaim** | PostgreSQL data persistence | Survive pod recreation |
| **NetworkPolicy** | Restricted ingress/egress | Security isolation |
| **RBAC** | Service accounts + roles | Least privilege access |

### Docker Image Strategy
- **Multi-stage builds** — Builder stage → Production runtime
- **Alpine-based** — Minimal attack surface
- **Immutable tags** — `quay.io/techswap/backend:latest`
- **Production-ready** — `NODE_ENV=production`, only `npm ci --only=production`
- **Frontend** — `npm run build` → nginx static serving

### Demo Scenario Support (Phase 6 Features)

| Test Scenario | Expected Behavior | Status |
|--------------|-------------------|--------|
| **Pod Failure** | Delete one backend pod → Service continues, new pod created | ⚠️ Test in-cluster |
| **HPA Scaling** | Generate load → HPA increases replicas from 3→10 | ⚠️ Test with load generator |
| **Rolling Deployment** | Deploy new version → Old pods terminate gradually, traffic continues | ⚠️ Test with new image |
| **Pod Deletion** | Manual pod remove → HPA recreates automatically | ⚠️ OpenShift cluster required |
| **Load Balancing** | Traffic distributed across 3 backend pods | ✅ OpenShift Route configured |

## 🆕 Phase 6: Enhanced Configuration

### Backend Deployment (Updated)
- **3 replicas** with RollingUpdate strategy
- **Liveness/Readiness/Startup probes** on `/health` endpoint
- **Resource requests/limits** — 100m CPU/128Mi requests, 500m CPU/512Mi limits
- **Environment variables** from OpenShift Secrets (`techswap-secrets`)
- **Production NODE_ENV**

### HPA Configuration
- **Min replicas**: 3 (baseline HA)
- **Max replicas**: 10 (scale upper bound)
- **Target CPU**: 70% (scale trigger)
- **Automatic** — No manual intervention required

### Network Policy
- **Ingress**: Only techswap namespace + frontend pods + PostgreSQL can reach backend
- **Egress**: PostgreSQL access + monitoring namespace + external DNS/HTTPS
- **DNS resolution** — Allowed to query `*.google.com` and `*.gstatic.com`
- **Least privilege** — Follows zero-trust principles

## 🎯 Failure Testing Setup

### Test 1: Pod Failure
```bash
# Delete a backend pod
oc delete pod -n techswap -l app=techswap,component=backend

# Expected: HPA detects pod is down, creates new replica automatically
# Verification: `oc get pods -n techswap` shows new pod running
```

### Test 2: HPA Scaling
```bash
# Generate load (simulate high traffic)
while true; do curl -s -o /dev/null -w "%{http_code}" http://techswap.apps.openshift.io/health; done &

# Expected: CPU utilization increases, HPA scales from 3→5→8→10 pods
# Verification: `oc get hpa -n techswap` shows replica count increasing
```

### Test 3: Rolling Deployment
```bash
# Deploy new backend image
oc set image deployment/backend -n techswap backend=quay.io/techswap/backend: v2.0.0

# Expected: Rolling update with 0 downtime
# - Old pods terminate gradually (maxUnavailable: 1)
# - New pods start and become ready
# - Old pods removed only after new ones ready
# Verification: `oc get pods -n techswap` shows gradual transition
```

### Test 4: Service Continuity
```bash
# During rolling update, verify health endpoint still responds
while true; do curl -s http://techswap.apps.openshift.io/health; done &

# Expected: 200 OK throughout deployment, no 502/503 errors
# Verification: All requests return 200 during transition
```

## 📦 Docker Image Registry Push

### Recommended Registry: Quay.io
```bash
# Tag and push backend image
docker build -t quay.io/techswap/backend:latest ./backend
docker push quay.io/techswap/backend:latest

# Tag and push frontend image  
docker build -t quay.io/techswap/frontend:latest ./frontend
docker push quay.io/techswap/frontend:latest
```

### Image Tags Strategy
- `latest` — Most recent build (deployed to OpenShift)
- `v1.0.0` — Version-tagged releases
- `ci-${GIT_COMMIT:0:7}` — CI/CD build identifiers
- **Immutable** — Never overwrite existing tags in production

## 🔧 Phase 6: Files Status

| File | Description | Lines | Last Modified |
|------|-------------|-------|---------------|
| `backend.Dockerfile` | Node.js multi-stage build | 23 | Phase 3 |
| `frontend.Dockerfile` | nginx static serve | 15 | Phase 3 |
| `docker-compose.yml` | Local dev orchestration | 38 | Phase 3 |
| `k8s/backend-deployment.yaml` | 3-replica deployment | 54 | Phase 6 (updated) |
| `k8s/hpa.yaml` | HorizontalPodAutoscaler | 14 | Phase 3 |
| `k8s/network-policy.yaml` | Restricted network access | 83 | Phase 6 (new) |
| `k8s/all-resources.yaml` | Complete manifest set | 6541 | Phases 1-5 |
| `PHASE6_STATUS.md` | Phase 6 status summary | New | Current |

## 📄 Phase 6 Status: IN PROGRESS

Infrastructure is validated and ready for:
1. **OpenShift cluster deployment** — `oc apply -f k8s/all-resources.yaml`
2. **Image push to registry** — `docker push quay.io/techswap/`
3. **Failure testing** — Pod deletion, HPA scaling, rolling updates
4. **Load testing** — Generate traffic, verify HPA scaling
5. **Monitoring setup** — OpenShift built-in metrics verification

---
**Phase 6 Status: 🔄 IN PROGRESS** — All Kubernetes manifests and Docker configurations are prepared and validated. Ready for OpenShift cluster deployment, image pushing, and failure scenario testing.

## Next Steps
1. Push Docker images to Quay.io or available registry
2. `oc apply -f k8s/all-resources.yaml` on OpenShift cluster
3. Verify all resources are running (`oc get pods`, `oc get routes`)
4. Execute failure tests: pod deletion, HPA scaling, rolling deployment
5. Validate load balancing and service continuity
6. Complete monitoring and logging verification