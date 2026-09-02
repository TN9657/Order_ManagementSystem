# Interview Guide

Comprehensive explanations for discussing the Order Management Dashboard project in interviews.

## 1. Overall Architecture

**Q: Walk us through the architecture of this application.**

A: The application is built as a modular monolith with clear separation between layers:

- **Frontend**: React + TypeScript + Vite handles the user interface with lazy-loaded routes and TanStack Query for data management
- **Backend**: FastAPI provides RESTful APIs organized into modules (Customers, Orders, Dashboard)
- **Database**: PostgreSQL stores all data with proper indexes and decimal types for monetary values

The key architectural pattern is layers:
```
Frontend → API Client (Axios)
   ↓
Backend Routers → Services → Repositories → ORM (SQLAlchemy)
   ↓
PostgreSQL
```

Each module is self-contained with clear boundaries, making it easy to test and maintain. The modular design also allows us to extract services into microservices later without major refactoring.

## 2. Why Modular Monolith?

**Q: Why did you choose a modular monolith instead of microservices?**

A: Several reasons:

1. **Complexity vs. Benefit Trade-off**: Microservices add significant operational overhead (deployment, monitoring, inter-service communication). For an operations dashboard with 100K-1M orders, a monolith is sufficient.

2. **Development Speed**: Single codebase, single deployment, no network calls between services. We can focus on features instead of infrastructure.

3. **Transactions**: Orders need to update customer info atomically. With microservices, this becomes significantly more complex.

4. **Future Flexibility**: The modular design allows us to extract services later when needed (5M+ orders). We're not locked in.

5. **Cost-Effective**: Single infrastructure, single database, single deployment pipeline.

The customer and order modules are designed independently, so if we need to scale them separately later, extracting them is straightforward.

## 3. Database Design

**Q: Tell me about your database schema.**

A: We have two main tables:

**Customers Table:**
- id (primary key)
- name, email (both indexed for search)
- created_at, updated_at

**Orders Table:**
- id (primary key)
- customer_id (foreign key, indexed)
- amount (DECIMAL not FLOAT)
- status (ENUM: pending, completed, cancelled)
- created_at, updated_at (created_at indexed for sorting)

**Indexes:**
```
- customers.email (search, uniqueness)
- orders.customer_id (relationship queries, FK)
- orders.status (filtering)
- orders.created_at (sorting, date ranges)
```

Why DECIMAL for money? Floating-point arithmetic causes rounding errors. DECIMAL(12,2) stores exact values like ₹9,999,999.99 without precision loss.

## 4. API Design

**Q: Why did you choose REST over GraphQL?**

A: REST is simpler and better for this use case:

1. **Simplicity**: Easier to understand, test, and debug
2. **Caching**: HTTP caching works naturally
3. **Tooling**: Works with Postman, curl, browser dev tools
4. **Specification**: OpenAPI/Swagger auto-generated
5. **Status Codes**: Natural way to communicate success/failure

Example endpoint:
```
GET /api/orders?page=1&page_size=20&search=rahul&status=completed&sort_by=created_at&sort_order=desc
```

GraphQL would be beneficial for a mobile app with many device types, but for an internal dashboard, REST is cleaner.

## 5. Search and Filtering

**Q: How do you handle search and filtering for 5M+ orders?**

A: Server-side operations, never client-side:

```python
# GOOD: Query only needed records
query = db.query(Order).join(Customer)
query = query.filter(
    (func.lower(Customer.name).like(f"%{search}%")) |
    (func.lower(Customer.email).like(f"%{search}%"))
)
query = query.filter(Order.status == status)
results = query.order_by(Order.created_at.desc()).limit(20).offset(0).all()

# BAD: Fetch 5M records then filter in Python
all_orders = db.query(Order).all()  # ❌ Out of memory
filtered = [o for o in all_orders if search in o.customer.name]  # ❌ Slow
```

This approach:
- Reduces network payload (only needed records)
- Uses database indexes for performance
- Scales to millions of records

## 6. Pagination Strategy

**Q: How do you implement pagination for large datasets?**

A: Currently using offset/limit pagination:

```python
skip = (page - 1) * page_size
orders = query.offset(skip).limit(page_size).all()
```

This works well for 1M orders. For 5M+ orders, I'd implement cursor pagination:

```python
# Cursor pagination
# Pass last_order_id = 12345 from previous page
orders = query.filter(Order.id > last_order_id).limit(20).all()
```

Cursor pagination is faster because:
- Doesn't require COUNT(*) on entire table
- Efficient for deep pagination (page 10,000)
- Consistent if data changes between requests

## 7. Order Status Transitions

**Q: How do you validate order status transitions?**

A: Business rules enforced at the service layer:

```python
valid_transitions = {
    OrderStatus.PENDING: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    OrderStatus.COMPLETED: [],  # Terminal state
    OrderStatus.CANCELLED: [],  # Terminal state
}

if new_status not in valid_transitions[current_status]:
    raise InvalidOrderStatus(f"Cannot transition from {current_status} to {new_status}")
```

This prevents:
- Resurreecting completed orders
- Invalid status values
- Accidental reversals

The validation happens at:
1. **Pydantic schema** - Type checking
2. **Service layer** - Business rule validation
3. **Database constraints** - Last line of defense

## 8. Decimal vs Float

**Q: Why use DECIMAL(12,2) instead of float for money?**

A: Floating-point arithmetic is inexact:

```python
# Float problem
amount = 0.1 + 0.2
print(amount)  # 0.30000000000000004 ❌

# Decimal solution
from decimal import Decimal
amount = Decimal("0.1") + Decimal("0.2")
print(amount)  # 0.3 ✓
```

In accounting, precision matters. DECIMAL type in PostgreSQL:
- Stores exact decimal values
- No rounding errors
- Standard accounting practice

Database setup:
```sql
amount DECIMAL(12, 2)  -- 12 digits total, 2 after decimal point
-- Max value: ₹9,999,999,999.99
```

## 9. Customer Summary Query

**Q: How do you calculate customer summary statistics efficiently?**

A: Use database aggregation functions:

```python
# Get completed orders count
count = db.query(func.count(Order.id)).filter(
    Order.customer_id == customer_id,
    Order.status == OrderStatus.COMPLETED
).scalar()

# Get completed orders total value
total = db.query(func.sum(Order.amount)).filter(
    Order.customer_id == customer_id,
    Order.status == OrderStatus.COMPLETED
).scalar()
```

Generated SQL:
```sql
SELECT COUNT(*) FROM orders 
WHERE customer_id = 15 AND status = 'completed';

SELECT SUM(amount) FROM orders 
WHERE customer_id = 15 AND status = 'completed';
```

This is efficient because:
- PostgreSQL does the aggregation
- Single aggregate query instead of loading all orders
- Scales to millions of orders

## 10. Dashboard Aggregation

**Q: How do you calculate dashboard metrics?**

A: All calculations in database, never Python:

```python
total_orders = db.query(func.count(Order.id)).scalar()
total_completed = db.query(func.sum(Order.amount)).filter(
    Order.status == OrderStatus.COMPLETED
).scalar()
pending = db.query(func.count(Order.id)).filter(
    Order.status == OrderStatus.PENDING
).scalar()
average = db.query(func.avg(Order.amount)).scalar()
```

Why database?
- Fast aggregation on indexed columns
- Reduces network payload
- No loading 5M records into Python

## 11. N+1 Query Problem

**Q: How do you avoid N+1 queries?**

A: Explicit eager loading with SQLAlchemy:

```python
# ❌ N+1 Problem
orders = db.query(Order).all()
for order in orders:
    print(order.customer.name)  # N queries to load customers

# ✓ Eager loading (not implemented in current version, but possible)
from sqlalchemy.orm import joinedload
orders = db.query(Order).options(
    joinedload(Order.customer)
).all()
```

In current implementation, we use JOIN in the query:
```python
orders = db.query(Order).join(Customer).filter(...).all()
```

This loads both Order and Customer in single query.

## 12. Transactions

**Q: How do you handle transactions?**

A: SQLAlchemy session handles transactions:

```python
try:
    order = Order(...)
    db.add(order)
    db.commit()  # Transaction succeeds
except Exception:
    db.rollback()  # Undo changes
    raise
```

For complex operations with inventory:
```python
try:
    # Create order
    order = Order(...)
    db.add(order)
    
    # Update inventory
    product.inventory -= quantity
    db.add(product)
    
    db.commit()  # Both succeed or both fail
except Exception:
    db.rollback()
    raise
```

## 13. Error Handling

**Q: How do you handle errors?**

A: Layered approach:

1. **Pydantic Validation** (automatic):
   ```python
   class OrderCreate(BaseModel):
       amount: Decimal = Field(gt=0)  # Validation error if <= 0
   ```
   Returns: 422 Unprocessable Entity

2. **Business Logic Validation** (service layer):
   ```python
   if not customer:
       raise CustomerNotFound(f"Customer {id} not found")
   ```
   Returns: 404 Not Found

3. **Database Errors** (caught, logged, not exposed):
   ```python
   try:
       db.execute(query)
   except DatabaseError as e:
       logger.error(str(e))
       raise HTTPException(500, "Database error")
   ```
   Returns: 500 Internal Server Error

Never expose stack traces to clients—security risk.

## 14. Frontend Data Fetching

**Q: How does the frontend manage data fetching?**

A: TanStack Query (React Query) handles:

1. **Caching**: Queries cached by dependency array
   ```typescript
   useQuery({
       queryKey: ['orders', page, pageSize, search, status],
       queryFn: () => ordersApi.list(page, pageSize, search, status),
       staleTime: 5 * 60 * 1000,  // Cache 5 minutes
   })
   ```

2. **Automatic Invalidation**: After mutations, invalidate related queries
   ```typescript
   useMutation({
       mutationFn: (data) => ordersApi.create(data),
       onSuccess: () => {
           queryClient.invalidateQueries(['orders']);
           queryClient.invalidateQueries(['dashboard']);
       }
   })
   ```

3. **Loading States**: Automatic loading/error states
   ```typescript
   const { data, isLoading, error } = useOrders(page);
   ```

## 15. Why TypeScript?

**Q: What are benefits of using TypeScript?**

A: Type safety prevents many bugs:

```typescript
// TypeScript catches this
const order: OrderDetail = { ... };
order.customer_name.toUpperCase();  // ✓ Correct

order.status.toUpperCase();  // ✓ Correct (status is 'pending' string)
order.nonexistent;  // ❌ Compiler error

// JavaScript would fail at runtime
```

Benefits:
1. Catch errors before deployment
2. Improved IDE autocomplete
3. Self-documenting code
4. Easier refactoring

## 16. How to Scale to 5M+ Orders

**Q: How would you scale this system to 5M+ orders?**

A: Step-by-step approach:

1. **Database Level**:
   - Implement cursor-based pagination (faster than offset/limit)
   - Add read replicas for SELECT queries
   - Consider materialized views for dashboard metrics
   - Table partitioning by date (e.g., orders_2024_01, orders_2024_02)

2. **Caching**:
   - Add Redis for dashboard metrics
   - Cache frequently accessed customer summaries

3. **Archiving**:
   - Move old orders to archive table
   - Dashboard/search only on recent orders

4. **Service Extraction**:
   - Extract Orders service (separate database)
   - Extract Analytics service (separate database)
   - Use message queue (Kafka) for event notifications

5. **Infrastructure**:
   - Load balancer for multiple backend instances
   - Managed PostgreSQL (RDS, Azure Database)
   - CDN for frontend
   - Container orchestration (Kubernetes)

6. **API Optimization**:
   - Field selection (only return needed fields)
   - GraphQL for mobile apps with different data needs
   - API versioning strategy

The modular design makes this transition smoother.

## 17. Validation Strategy

**Q: How do you validate input?**

A: Multi-layer validation:

```python
# 1. Type validation (Pydantic)
class OrderCreate(BaseModel):
    customer_id: int
    amount: Decimal = Field(gt=0, decimal_places=2)
    status: OrderStatus  # Enum validation

# 2. Business logic validation (Service)
customer = db.query(Customer).filter(Customer.id == customer_id).first()
if not customer:
    raise CustomerNotFound(...)

# 3. Database constraints
orders
    customer_id INTEGER NOT NULL REFERENCES customers(id)
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0)
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled'))
```

Never trust frontend validation alone—backend validation is security measure.

## 18. Authentication (Future)

**Q: How would you add authentication?**

A: Implementation strategy:

```python
# Backend: JWT-based
from fastapi_jwt_extended import create_access_token, JWTBearer

@app.post("/login")
async def login(credentials: LoginRequest):
    user = authenticate(credentials.username, credentials.password)
    token = create_access_token(identity=user.id)
    return {"access_token": token}

@app.get("/api/orders")
async def list_orders(current_user = Depends(JWTBearer())):
    # current_user is authenticated
    return orders
```

```typescript
// Frontend: Store token and attach to requests
const token = localStorage.getItem('access_token');
axios.defaults.headers.Authorization = `Bearer ${token}`;
```

Could add:
- Role-based access control (RBAC)
- Audit logging
- Rate limiting per user

## 19. Testing Strategy

**Q: How do you test this application?**

A: Multi-level testing:

1. **Unit Tests** (Repository/Service):
   ```python
   def test_create_order():
       order = OrderService.create_order(db, customer_id=1, amount=2500)
       assert order.status == OrderStatus.PENDING
   ```

2. **Integration Tests** (API Endpoints):
   ```python
   def test_create_order_api(client, sample_customer):
       response = client.post("/api/orders", json={
           "customer_id": sample_customer.id,
           "amount": 2500.00
       })
       assert response.status_code == 201
   ```

3. **Error Tests**:
   ```python
   def test_create_order_invalid_customer(client):
       response = client.post("/api/orders", json={
           "customer_id": 9999,
           "amount": 2500.00
       })
       assert response.status_code == 404
   ```

Run tests:
```bash
pytest tests/ -v --cov=app
```

## 20. CORS Configuration

**Q: Why do you configure CORS?**

A: Security and cross-origin requests:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- `allow_origins`: Only specified domains can access API
- `allow_credentials`: Allow cookies/auth headers
- `allow_methods`: Allowed HTTP methods (GET, POST, etc.)
- `allow_headers`: Allowed request headers

Without this, browser prevents frontend from calling backend (security feature).

## Difficult Questions

**Q: What's the most challenging part of this project?**

A: Balancing simplicity with scalability. We chose a modular monolith which is simple now, but if we grow to 5M+ orders, we'll need to refactor into microservices. The modular design helps, but there's always risk. The alternative (start with microservices) adds complexity we don't need today.

**Q: What would you do differently?**

A: 
1. Start with GraphQL to avoid API versioning issues later
2. Add authentication earlier (currently not needed but operations might require it)
3. More comprehensive error handling for edge cases
4. Add request logging/tracing for debugging

**Q: How do you ensure data consistency?**

A: 
1. Database constraints (FK, CHECK, unique)
2. Transaction handling (commit/rollback)
3. Validation at multiple layers
4. Tests verify business rules

**Q: How would you debug a slow query?**

A: 
```python
# Enable query logging
engine = create_engine(DATABASE_URL, echo=True)

# Use EXPLAIN ANALYZE
db.execute("EXPLAIN ANALYZE SELECT ...");

# Check indexes
db.execute("SELECT * FROM pg_stat_user_indexes");

# Add missing indexes if needed
db.execute("CREATE INDEX idx_orders_status ON orders(status)");
```

Then run tests to verify performance improvement.

## Summary of Key Concepts

- **Modular Monolith**: Simple now, scalable later
- **Server-side Operations**: Search/filter/sort in database, not frontend
- **Decimal for Money**: Prevents rounding errors
- **Layered Validation**: Type → Business → Database
- **TanStack Query**: Automatic caching and refetching
- **REST API**: Simple, cacheable, well-tooled
- **Error Handling**: Caught, logged, generic response to client
- **Pagination**: Offset/limit now, cursor pagination for 5M+ orders
- **Status Transitions**: Defined business rules, enforced at service layer
- **N+1 Prevention**: Eager loading or JOIN queries
- **Testing**: Unit, integration, error cases
