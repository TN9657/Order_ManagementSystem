# Project Architecture

## High-Level Overview

```
┌─────────────────────────────────────┐
│   React + TypeScript Frontend       │
│  (Dashboard, Orders, Customers)     │
└────────────────┬────────────────────┘
                 │
                 │ HTTP/REST
                 │
┌────────────────▼────────────────────┐
│      FastAPI Backend (Python)       │
│                                     │
│  ┌──────────────────────────────┐   │
│  │    Router Layer              │   │
│  │ - Orders, Customers, API     │   │
│  └──────────────┬───────────────┘   │
│                 │                   │
│  ┌──────────────▼───────────────┐   │
│  │   Service Layer              │   │
│  │ - Business Logic             │   │
│  │ - Validation                 │   │
│  │ - Status Transitions          │   │
│  └──────────────┬───────────────┘   │
│                 │                   │
│  ┌──────────────▼───────────────┐   │
│  │  Repository Layer            │   │
│  │ - Database Queries           │   │
│  │ - ORM (SQLAlchemy)           │   │
│  └──────────────┬───────────────┘   │
│                 │                   │
│  ┌──────────────▼───────────────┐   │
│  │  Pydantic Models & Schemas   │   │
│  │ - Request Validation         │   │
│  │ - Response Serialization     │   │
│  └──────────────┬───────────────┘   │
└────────────────┬────────────────────┘
                 │
                 │ SQL
                 │
┌────────────────▼────────────────────┐
│     PostgreSQL Database             │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Customers Table             │   │
│  │ - id, name, email, created_at│   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Orders Table                │   │
│  │ - id, customer_id, amount    │   │
│  │ - status, created_at         │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Request Lifecycle

### Example: List Orders

```
1. User clicks "Orders" in navbar
   └─> React Router navigates to /orders

2. Orders component renders
   └─> useOrders hook triggered

3. TanStack Query executes query
   └─> axios.get("/api/orders?page=1&page_size=20")

4. Browser sends HTTP GET request
   └─> http://localhost:8000/api/orders

5. FastAPI Router receives request
   └─> orders_router.list_orders(page, page_size, ...)

6. Service Layer processes parameters
   └─> OrderService.get_orders_with_filtering(...)
   └─> Validates search, status, sort parameters

7. Repository Layer queries database
   └─> OrderRepository.get_orders(db, page, page_size, ...)
   └─> SQLAlchemy builds WHERE, ORDER BY, LIMIT clauses

8. PostgreSQL executes query
   └─> SELECT * FROM orders 
       JOIN customers ON orders.customer_id = customers.id
       WHERE ... ORDER BY ... LIMIT ... OFFSET ...
   └─> Returns matching rows

9. SQLAlchemy maps results to Order objects
   └─> Service serializes to Pydantic schema

10. FastAPI returns JSON response
    └─> {
          "items": [...],
          "page": 1,
          "page_size": 20,
          "total": 100,
          "total_pages": 5
        }

11. Browser receives response
    └─> TanStack Query caches response
    └─> React component re-renders with data
    └─> OrderTable displays orders
```

## Module Structure

### Customers Module

```
app/customers/
├── models.py          # SQLAlchemy ORM models
│   └── Customer(id, name, email, created_at, updated_at)
│
├── schemas.py         # Pydantic validation schemas
│   ├── CustomerCreate
│   ├── CustomerResponse
│   └── CustomerSummaryResponse
│
├── repository.py      # Database operations
│   └── CustomerRepository
│       ├── create_customer()
│       ├── get_customer()
│       ├── get_all_customers()
│       └── get_customer_summary()
│
├── service.py         # Business logic
│   └── CustomerService
│       ├── create_customer()
│       ├── get_customer()
│       ├── get_all_customers()
│       └── get_customer_summary()
│
└── router.py          # HTTP endpoints
    ├── GET /api/customers
    ├── GET /api/customers/{id}
    └── GET /api/customers/{id}/summary
```

### Orders Module

```
app/orders/
├── models.py          # SQLAlchemy ORM models
│   ├── Order(id, customer_id, amount, status, created_at, updated_at)
│   └── OrderStatus enum (pending, completed, cancelled)
│
├── schemas.py         # Pydantic validation schemas
│   ├── OrderCreate
│   ├── OrderUpdate
│   ├── OrderResponse
│   └── OrderDetailResponse
│
├── repository.py      # Database operations
│   └── OrderRepository
│       ├── create_order()
│       ├── get_order()
│       ├── get_orders() - with search, filter, sort
│       ├── update_order_status()
│       ├── cancel_order()
│       └── get_customer_orders()
│
├── service.py         # Business logic
│   └── OrderService
│       ├── create_order()
│       ├── get_order_with_customer()
│       ├── get_orders_with_filtering()
│       ├── update_order_status()
│       └── cancel_order()
│
└── router.py          # HTTP endpoints
    ├── GET /api/orders
    ├── GET /api/orders/{id}
    ├── POST /api/orders
    ├── PATCH /api/orders/{id}/status
    └── POST /api/orders/{id}/cancel
```

### Dashboard Module

```
app/dashboard/
├── schemas.py         # Pydantic validation schemas
│   └── DashboardSummary
│
├── repository.py      # Database operations
│   └── DashboardRepository
│       └── get_dashboard_summary()
│           ├── Total orders count
│           ├── Total customers count
│           ├── Total completed value (SUM)
│           ├── Pending/completed/cancelled counts
│           └── Average order value
│
├── service.py         # Business logic
│   └── DashboardService
│       └── get_summary()
│
└── router.py          # HTTP endpoints
    └── GET /api/dashboard/summary
```

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── api/
│   └── client.ts              # Axios client and API methods
│       ├── ordersApi
│       ├── customersApi
│       └── dashboardApi
│
├── components/
│   ├── UI.tsx                 # Shared components (Loading, Error, Pagination)
│   ├── OrderTable.tsx         # Orders table component
│   ├── CustomerTable.tsx      # Customers table component
│   └── DashboardCards.tsx     # KPI cards
│
├── hooks/
│   ├── useApi.ts             # TanStack Query hooks
│   │   ├── useOrders()
│   │   ├── useCustomers()
│   │   ├── useDashboardSummary()
│   │   ├── useCreateOrder()
│   │   ├── useUpdateOrderStatus()
│   │   └── useCancelOrder()
│   ├── useFormatters.ts      # Formatting hooks
│   └── useDebounce.ts        # Debounce hook
│
├── layouts/
│   └── MainLayout.tsx         # Navbar + Sidebar layout
│
├── pages/
│   ├── Dashboard.tsx          # Dashboard page
│   ├── Orders.tsx             # Orders list page
│   ├── OrderDetails.tsx       # Order detail page
│   ├── Customers.tsx          # Customers list page
│   └── CustomerDetails.tsx    # Customer detail page
│
├── types/
│   └── index.ts              # TypeScript type definitions
│
├── utils/
│   └── formatters.ts         # Formatting utilities
│
├── App.tsx                   # Main app component with routes
└── main.tsx                  # Entry point
```

### Component Hierarchy

```
App (Router)
├── Route: / (Dashboard)
│   └── MainLayout
│       ├── Navbar
│       ├── Sidebar
│       └── Dashboard
│           ├── DashboardCards
│           └── OrderTable
│
├── Route: /orders (Orders)
│   └── MainLayout
│       ├── Navbar
│       ├── Sidebar
│       └── Orders
│           ├── Filters (Search, Status, Sort)
│           ├── OrderTable
│           └── Pagination
│
├── Route: /orders/:id (OrderDetails)
│   └── MainLayout
│       ├── Navbar
│       ├── Sidebar
│       └── OrderDetails
│           ├── Order Info
│           ├── Customer Info
│           ├── Action Buttons
│           └── Modal (Status Update, Cancel)
│
├── Route: /customers (Customers)
│   └── MainLayout
│       ├── Navbar
│       ├── Sidebar
│       └── Customers
│           ├── CustomerTable
│           └── Pagination
│
└── Route: /customers/:id (CustomerDetails)
    └── MainLayout
        ├── Navbar
        ├── Sidebar
        └── CustomerDetails
            ├── Customer Info
            ├── Order Summary
            ├── Order History Table
            └── Pagination
```

## Data Flow

### Creating an Order (Mutation)

```
User Input (Create Order Modal)
    ↓
Form Validation (Frontend)
    ↓
POST /api/orders
    ↓
FastAPI Router
    ├─> OrderCreate Pydantic validation
    └─> OrderService.create_order()
        ├─> Verify customer exists
        ├─> Validate amount > 0
        └─> OrderRepository.create_order()
            └─> db.add() → db.commit()
    ↓
Return OrderResponse
    ↓
TanStack Query
    ├─> Update cache
    ├─> Invalidate 'orders' query
    ├─> Invalidate 'dashboard' query
    └─> Invalidate 'customers' query
    ↓
React re-renders with new data
```

### Filtering Orders

```
User Changes Filter
    ↓
handleStatusChange() updates state
    ↓
useOrders hook triggered with new params
    ↓
GET /api/orders?status=completed
    ↓
FastAPI validates parameters
    ↓
OrderRepository filters database
    └─> query.filter(Order.status == OrderStatus.COMPLETED)
    ↓
Returns filtered results
    ↓
TanStack Query caches results
    ↓
React renders filtered table
```

## Database Query Examples

### Get Orders with Pagination, Search, Filter, Sort

```python
# Service receives parameters
page = 1
page_size = 20
search = "rahul"
status = "completed"
sort_by = "created_at"
sort_order = "desc"

# Repository builds query
query = db.query(Order).join(Customer)

# Apply search (backend filtering)
if search:
    query = query.filter(
        (func.lower(Customer.name).like(f"%{search.lower()}%")) |
        (func.lower(Customer.email).like(f"%{search.lower()}%"))
    )

# Apply status filter
if status:
    query = query.filter(Order.status == OrderStatus(status))

# Get total count
total = query.count()

# Apply sorting
if sort_order == "asc":
    query = query.order_by(Order.created_at.asc())
else:
    query = query.order_by(Order.created_at.desc())

# Apply pagination
skip = (page - 1) * page_size
orders = query.offset(skip).limit(page_size).all()

# SQL Generated:
# SELECT orders.id, orders.customer_id, orders.amount, orders.status, 
#        orders.created_at, customers.name, customers.email
# FROM orders
# JOIN customers ON orders.customer_id = customers.id
# WHERE (lower(customers.name) LIKE '%rahul%' 
#        OR lower(customers.email) LIKE '%rahul%')
#   AND orders.status = 'completed'
# ORDER BY orders.created_at DESC
# LIMIT 20 OFFSET 0
```

### Get Customer Summary

```python
# Repository queries
customer = db.query(Customer).filter(Customer.id == customer_id).first()

completed_count = db.query(func.count(Order.id)).filter(
    Order.customer_id == customer_id,
    Order.status == OrderStatus.COMPLETED
).scalar()

completed_value = db.query(func.sum(Order.amount)).filter(
    Order.customer_id == customer_id,
    Order.status == OrderStatus.COMPLETED
).scalar()

# SQL Generated:
# SELECT customer details
# SELECT COUNT(*) FROM orders 
#   WHERE customer_id = 15 AND status = 'completed'
# SELECT SUM(amount) FROM orders 
#   WHERE customer_id = 15 AND status = 'completed'
```

### Get Dashboard Summary

```python
# All queries hit database once during request
total_orders = db.query(func.count(Order.id)).scalar()
total_customers = db.query(func.count(Customer.id)).scalar()
total_completed = db.query(func.sum(Order.amount)).filter(
    Order.status == OrderStatus.COMPLETED
).scalar()
pending = db.query(func.count(Order.id)).filter(
    Order.status == OrderStatus.PENDING
).scalar()
# ... etc

# Aggregation happens in PostgreSQL, not Python
```

## Error Handling Flow

```
User Action
    ↓
API Call via TanStack Query
    ↓
Backend receives request
    ├─> If validation error → Pydantic catches → 422 Unprocessable Entity
    ├─> If customer not found → Repository raises CustomerNotFound → 404
    ├─> If invalid status → Service raises InvalidOrderStatus → 400
    ├─> If database error → Exception caught → 500 (logged, no stack trace)
    └─> If successful → 200/201
    ↓
Frontend TanStack Query
    ├─> If error → show Error component with onRetry()
    ├─> If success → cache and re-render
    └─> Loading state shown during request
    ↓
User sees result
```

## Caching Strategy

TanStack Query (React Query) automatically handles:

```
1. Query Caching
   - useOrders() → caches by [key: 'orders', page, pageSize, search, status, sortBy, sortOrder]
   - Revalidation on dependency change
   - Stale time: 5 minutes

2. Manual Invalidation
   - After order creation → invalidate 'orders', 'dashboard', 'customers'
   - After order update → invalidate 'order', 'orders', 'dashboard'
   - Triggers automatic refetch

3. Mutation Side Effects
   - onSuccess() → invalidate related queries
   - onError() → show error message
   - isPending → disable buttons during request
```

## Performance Optimization

### Database Level
- Indexes on `orders.customer_id`, `orders.status`, `orders.created_at`
- Foreign key constraints for referential integrity
- DECIMAL type for exact monetary values

### API Level
- Pagination (never fetch all records)
- Response filtering (only return needed fields)
- Batch loading (eager load relationships)

### Frontend Level
- TanStack Query caching
- Lazy route loading with React Router
- Code splitting via Vite
- Debounced search input

## Scalability Considerations

### Current Architecture (100K orders)
- Works efficiently as-is
- Single database connection
- Server-side pagination/filtering

### For 1M orders
- Add indexes if slow queries
- Consider read replicas for dashboard
- Implement cursor pagination

### For 5M+ orders
- Separate read/write databases
- Materialized views for dashboard
- Archive old orders
- Message queue for background jobs
- Consider microservices extraction

## Future Extensions

```
Current: Customers ← Orders → Dashboard
           ↓           ↓
        
Future: Products → OrderItems ← Orders → Customers
                      ↓
                  Inventory

Then: Microservices
    OrderService
    CustomerService
    InventoryService
    InvoiceService
    (Each with database)
```

## Monitoring & Observability

Currently: Basic Python logging

Future additions:
- Structured logging (JSON)
- Application performance monitoring (APM)
- Database query logging and analysis
- Frontend error tracking (Sentry)
- Request tracing (OpenTelemetry)
