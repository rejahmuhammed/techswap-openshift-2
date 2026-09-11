# TechSwap - OpenShift Fast Demo

## 1. Build configs
oc apply -f k8s/00-builds.yaml

## 2. Build images from the project root
oc start-build techswap-backend --from-dir=. --follow
oc start-build techswap-frontend --from-dir=. --follow

## 3. Database
oc apply -f k8s/01-postgres.yaml
oc rollout status deployment/postgres

# Load schema
oc run psql-init --rm -i --restart=Never --image=postgres:16-alpine --env="PGPASSWORD=TechSwapDB2026!" --command -- psql -h postgres -U techswap -d techswap -f /schema/schema.sql

# If using the ConfigMap file, mount it first or use the individual SQL files from your local source.

## 4. Backend + frontend
oc apply -f k8s/02-backend.yaml
oc apply -f k8s/03-frontend.yaml
oc apply -f k8s/04-hpa.yaml

## 5. Verify
oc get pods
oc get svc
oc get route
oc get hpa

## Important
The frontend uses /api by default. For the demo, expose backend separately if needed and set VITE_API_URL at build time. The current demo gracefully shows marketplace fallback data if the database is empty.
