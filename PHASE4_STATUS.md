# TechSwap — Phase 4: Product Marketplace / BUY

## 📋 Phase 4 Objectives

Implement the complete product marketplace functionality enabling users to:
- Browse products with pagination, search, and filtering
- Search products by name, brand, category, condition, price range
- View product details
- Add products to cart
- Foundation for the demo scenario steps 5-8 (AI recommendations → products → compare → cart)

## ✅ Phase 4 Features Implemented

### Backend API Endpoints

| Endpoint | Description | Query Parameters |
|----------|-------------|------------------|
| `GET /api/products/` | List all products with pagination, search, filter | `page`, `limit`, `search`, `category`, `brand`, `minPrice`, `maxPrice`, `condition` |
| `GET /api/products/:id` | Get single product by UUID | `id` (UUID) |
| `GET /api/products/search` | Search products (alias for main list) | Same as `/api/products/` |

### Search & Filter Capabilities

- **Search**: Matches against product name and description (ILIKE)
- **Category filter**: Filter by exact category match
- **Brand filter**: Filter by exact brand name
- **Price range**: `minPrice` and `maxPrice` as floating point values
- **Condition filter**: `NEW`, `PRE_OWNED`, or `USED`
- **Pagination**: `page` (default 1), `limit` (default 20, max 100)
- **Sorting**: By `created_at` DESC (extendable to price, rating, etc.)

### Example API Calls

```bash
# List all products (page 1, limit 20)
GET /api/products/

# Search for "laptop"
GET "/api/products/?search=laptop"

# Filter by category SSD
GET "/api/products/?category=SSD"

# Filter by brand and price range
GET "/api/products/?brand=Samsung&minPrice=1000&maxPrice=5000"

# Filter by condition (Pre-Owned)
GET "/api/products/?condition=PRE_OWNED"

# Paginated results
GET "/api/products/?page=2&limit=10"

# Combined search and filter
GET "/api/products/?search=SSD&category=SSD&condition=NEW&minPrice=500&maxPrice=2000"
```

### Frontend Integration

The frontend `useProducts` hook (`frontend/src/hooks/useHooks.ts`) connects to these endpoints:

```typescript
// Example usage in Buy page:
const { data: products, isLoading, refetch } = useProducts(filters);

// Filters interface:
interface ProductFilters {
  category?: string;
  brand?: string;
  condition?: 'NEW' | 'PRE_OWNED';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_low' | 'price_high' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;  // max 100
}
```

The hook automatically sends all filters as query parameters to `/products/search`.

### Product Card Component

The Buy page (`frontend/src/pages/Buy.tsx`) displays products with:
- Product name and brand
- Price in Indian Rupees (₹)
- Condition badge (NEW/PRE_OWNED)
- Stock availability
- "View Details" button linking to `/product/:id`

### Demo Scenario Support (Steps 5-8)

| Step | Feature | Status |
|------|---------|--------|
| V STEP 5 | AI recommends SSD/RAM | ✅ Rule-based fallback in `useProblemSolver` hook |
| V STEP 5 | TechSwap displays actual products from database | ✅ Backend returns real products with pagination |
| V STEP 6 | Compare prices | ✅ Price display with condition badges |
| V STEP 7 | Open a product | ✅ `GET /api/products/:id` detail endpoint |
| V STEP 8 | Add it to cart | ✅ `useAddToCart` mutation in `useHooks.ts` |

### Cart Integration

The `useAddToCart` hook (`frontend/src/hooks/useHooks.ts`) handles:
- Fetching product details from API
- Creating cart item with product data
- Incrementing quantity if already in cart
- Persisting to localStorage
- Removing from cart via `useRemoveFromCart`
- Updating quantity via `useUpdateCartQuantity`

### Search/Filter UI (Already in Buy Page)

The Buy page includes UI for:
- Category dropdown (SSD, RAM, Laptop, Smartphone, Tablet, etc.)
- Brand dropdown (Kingston, Crucial, Samsung, Corsair)
- Condition filter (New, Pre-Owned)
- Price range inputs (Min/Max)
- Search box with debounced refetch
- Product grid with cards

## 🔧 Backend Routes Created/Updated

- `src/routes/product.js` — Complete product routes with search, filter, pagination
- `src/app.js` — Already includes `/api/products` route registration
- `frontend/src/hooks/useHooks.ts` — `useProducts` hook with full filter support
- `frontend/src/pages/Buy.tsx` — Complete search/filter UI + product grid

## 📦 Build & Test

```bash
# Start backend
cd techswap/backend
npm start   # or npm run dev with nodemon

# Start full stack with frontend
cd techswap
# Frontend dev server at http://localhost:5173
# Backend API at http://localhost:3000/api

# Verify product search
curl "http://localhost:3000/api/products?search=laptop&condition=NEW"
```

## 🎯 Phase 4 Checklist

| ✅ | Component |
|---|---|
| Product listing with pagination | |
| Product search by name/brand | |
| Product filtering (category, condition, price) | |
| Product details endpoint | |
| Add to cart functionality | |
| Search/filter UI in Buy page | |
| useProducts hook integration | |
| Demo scenario steps 5-8 support | |

## 🎯 Phase 5: Next Steps

Phase 5 will focus on:
1. **Cart and checkout** — Complete cart management, Stripe sandbox payment integration
2. **Order management** — Full order lifecycle, order history
3. **Serverless order events** — `order.created` → Knative/OpenShift function
4. **Nearby shops/technicians** — Google Maps integration
5. **AI Problem Solver enhancements** — External AI provider integration

## 📄 Phase 4 Status: IN PROGRESS

All core backend search/filter/pagination functionality is implemented and verified.
Frontend Buy page has complete UI. Cart integration is partially implemented.
Ready to proceed with cart/checkout and order management in Phase 5.