# TechSwap — Phase 3: Backend Foundation

## ✅ Phase 3 Complete Checklist

### Database & Connection
- **pg connection pool** — `/src/db/index.js` — configured with `DATABASE_URL` env var
- **Connection test** — verified server starts without DB errors (uses `SELECT 1` test query)

### API Routes
| Route | Description | Status |
|-------|-------------|--------|
| `GET /api/auth/register` | User registration with bcrypt password hashing | ✅ |
| `POST /api/auth/login` | User login with JWT token issuance | ✅ |
| `GET /api/auth/profile` | Protected profile endpoint (JWT auth required) | ✅ |
| `GET /api/users` | Get all users (admin only) | ✅ |
| `GET /api/users/:id` | Get user by ID (admin only) | ✅ |
| `POST /api/products` | Create product (authenticated seller) | ✅ |
| `GET /api/products` | Get all products with pagination | ✅ |
| `GET /api/products/:id` | Get single product | ✅ |
| `GET /api/categories` | Get all categories | ✅ |
| `POST /api/orders` | Create new order with stock reservation | ✅ |
| `GET /api/orders` | Get user's orders | ✅ |
| `GET /api/orders/:id` | Get single order (auth/owner check) | ✅ |
| `PATCH /api/orders/:id/status` | Update order status (admin only) | ✅ |
| `PATCH /api/orders/:id/cancel` | Cancel order (owner/admin) | ✅ |
| `GET /api/shops` | Get shops (basic) | ✅ |
| `GET /api/technicians` | Get technicians (basic) | ✅ |

### Middleware
- **helmet** — Security headers configured
- **cors** — Configurable origins with credentials support
- **express-rate-limit** — 100 requests/15min per IP on `/api/` endpoints
- **express.json** — 10KB body parsing limit
- **morgan** — Combined request logger
- **errorHandler** — Centralized error handling with production-safe messages
- **notFoundHandler** — 404 JSON responses
- **validation** — Express-validator with custom validators for arrays

### Express App (`app.js`)
- Security headers (helmet)
- CORS configuration
- Rate limiting (100 req/15min)
- Body parsing with size limits
- HTTP request logging (morgan)
- All API routes registered
- Health check endpoint (`/health`)
- 404 and error handlers
- Automatic database connection test on startup

### Models Directory
Models directory exists but individual model files were replaced by direct pg queries in routes. This is acceptable for the hackathon scope — direct queries provide maximum control and simplicity.

### Verified Working
- ✅ Server starts without errors
- ✅ Database connection test passes (`SELECT 1`)
- ✅ All routes import successfully
- ✅ No syntax errors in any route file

### Infrastructure
- **backend.Dockerfile** — Multi-stage Node.js build (already created)
- **k8s/backend-deployment.yaml** — 3 replicas, RollingUpdate strategy (already created)
- **k8s/hpa.yaml** — HPA min 3, max 10, target 70% CPU (already created)
- **k8s/all-resources.yaml** — Complete manifest set (already created, validated 26 docs)
- **.env.example** — Environment template with [REDACTED] placeholders (already created)

### Integration Points
- Backend API base: `http://localhost:3000/api/`
- Frontend VITE_API_URL should point to backend host
- Authentication flows match frontend useHooks implementation
- Product pagination aligns with frontend Buy page expectations
- Order creation includes stock reservation logic

### Next Steps — Phase 4
Phase 4 will focus on:
1. **Serverless event architecture** — `order.created` event → Knative/OpenShift function
2. **Cart and checkout** — Cart management, sandbox payment (Stripe test mode)
3. **AI Problem Solver service** — External AI integration + rule-based fallback
4. **Full end-to-end testing** — Simulate the demo scenario from step 1-20

## 📦 Build & Run Commands

```bash
# Start backend only
cd techswap/backend
npm start        # Uses nodemon: npm run dev

# Start with Docker Compose
cd techswap
docker-compose up -d    # frontend(5173), backend(3000), PostgreSQL(5432)

# Verify server is running
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}
```

## 🔧 Environment Variables (already in .env.example)

```
DATABASE_URL=postgresql://postgres:***@localhost:5432/techswap [REDACTED]
JWT_SECRET=change-this-secret-in-production [REDACTED]
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

All sensitive values are [REDACTED] — never commit actual credentials.

## 🎯 Phase 4 Preview

- Serverless `order.created` event → Knative function
- Cart management with localStorage/persistent backend
- Stripe sandbox payment integration
- AI Problem Solver rule-based recommendations
- Demo scenario walkthrough (steps 1-20)