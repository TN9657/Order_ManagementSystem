# Architecture Decisions

## Technology Choices

### Why React + TypeScript + Vite?
- **React**: Industry standard, large ecosystem, excellent developer experience
- **TypeScript**: Type safety catches errors early, improves code maintainability
- **Vite**: Fast development server, optimized production builds, modern tooling
- **TanStack Query**: Enterprise-grade data fetching, caching, and synchronization

### Why FastAPI?
- High performance async framework
- Automatic API documentation (Swagger/OpenAPI)
- Built-in validation with Pydantic
- Modern Python (3.7+) with async/await support
- Easy to test and extend

### Why PostgreSQL?
- Robust ACID compliance for financial data
- Support for DECIMAL type for monetary values
- Excellent query performance with proper indexing
- JSON support for future extensibility
- Mature ecosystem and community

### Why SQLAlchemy?
- ORM with powerful query capabilities
- Database-agnostic (can migrate to other DBs)
- Type hints support with modern versions
- Built-in relationship management
- Query result caching options

## Architecture Pattern

### Modular Monolith
We chose modular monolith over microservices because:
1. **Simplicity**: Easier to understand and maintain for team learning
2. **Performance**: No network overhead, single database transactions
3. **Development Speed**: Simpler deployment pipeline
4. **Cost Effective**: Single infrastructure setup
5. **Future Flexibility**: Can be split into microservices later without major rewrites

Structure:
```
Backend
├── Customers Module (independent)
├── Orders Module (dependent on Customers)
└── Dashboard Module (aggregates data)
```

Each module has clear separation:
- **Router**: HTTP endpoint handlers
- **Service**: Business logic
- **Repository**: Data access
- **Models**: Database schema
- **Schemas**: Request/response validation

This allows future extraction of modules into separate services.

### Frontend Architecture
- **Component-Based**: Reusable, testable components
- **Hook-Based**: Modern React patterns for state management
- **API Abstraction**: Centralized API client with TanStack Query
- **Type Safety**: Full TypeScript coverage
- **Separation of Concerns**: Utilities, hooks, components clearly separated

## Database Design Decisions

### DECIMAL for Money
- **Why Not Float**: Floating-point arithmetic causes rounding errors
- **Why DECIMAL(12,2)**: Supports up to 12 digits with 2 decimal places
  - Max value: ₹9,999,999,999.99
  - Sufficient for order amounts
  - Standard accounting practice

### Indexes
```
- customers.email: Fast email lookups and uniqueness checks
- orders.customer_id: FK lookups and customer-related queries
- orders.status: Fast filtering by status
- orders.created_at: Sorting and temporal queries
```

Why these?
- Indexed foreign keys: Support the N+1 prevention in relationship loading
- Status index: Common filtering operation
- Created_at index: Sorting and date range queries

### No Product Table (Initially)
- Requirement: Order Management, not e-commerce platform
- Decision: Simple customer + order model first
- Future: Products can be added if needed for order items tracking

## API Design

### REST over GraphQL
- **Simplicity**: Easier to understand and debug
- **Caching**: HTTP caching works naturally
- **Debugging**: Tools like Postman, curl work out of the box
- **Specification**: OpenAPI/Swagger for documentation

### Server-Side Operations
Search, filtering, and sorting are done server-side:
```
❌ BAD:  Fetch all 5M orders → Filter in JavaScript
✅ GOOD: Query only needed orders from database
```

Benefits:
- Reduced network payload
- Better performance
- Database query optimization
- Consistent behavior

### Pagination
- **Offset/Limit**: Simple to implement and understand
- **Future**: Cursor pagination for 5M+ datasets
- **Page Size**: Configurable (default 20, max 100)

## Status Transitions

```
pending ─→ completed
   ↓        (end state)
cancelled
(end state)
```

Business logic:
- Completed and cancelled are terminal states
- No reversal of orders (business requirement)
- Prevents accidental status changes

## Validation Strategy

### Frontend Validation
- Real-time feedback to user
- Improved UX
- Reduces invalid requests

### Backend Validation (Pydantic)
- **Never trust frontend**: Validation is security measure
- **Comprehensive**: Type checking, range validation, format validation
- **Error Messages**: Clear, actionable feedback

Example:
```python
class OrderCreate(BaseModel):
    customer_id: int
    amount: Decimal = Field(gt=0, decimal_places=2)  # Must be > 0
    status: OrderStatus  # Must be valid enum
```

## Error Handling

### HTTP Status Codes
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Invalid operation (e.g., status transition)
- `422 Unprocessable Entity`: Validation failure
- `500 Internal Server Error`: Unexpected error

### No Stack Traces to Clients
- Security concern: Reveals implementation details
- Exception caught and logged
- Generic error message returned

## Scalability Path

### Current (Handle 100K orders)
- Offset/limit pagination
- Indexed queries
- Connection pooling

### Short Term (Handle 1M orders)
- Cursor-based pagination
- Query optimization review
- Database statistics tuning

### Medium Term (Handle 5M+ orders)
- Read replicas for read queries
- Materialized views for dashboard
- Archive old orders
- Asynchronous processing for heavy operations

### Long Term (If needed)
- Service extraction (Orders, Customers → separate services)
- Event sourcing for order lifecycle
- CQRS for read-heavy dashboard
- Distributed caching (Redis)

## Performance Optimization

### Database
- Batch loading relationships
- Query result caching (if heavy aggregations)
- Explain/analyze slow queries

### Frontend
- Lazy route loading
- Code splitting with Vite
- Query caching with TanStack Query
- Debounced search input
- Virtualized lists (if 1000s of items)

## Security Considerations

### Validation
- All inputs validated (frontend + backend)
- Type checking prevents injection attacks
- ORM prevents SQL injection

### CORS
```python
CORS_ORIGINS = ["http://localhost:5173"]  # Only frontend
```

### Future Authentication
- JWT tokens in Authorization header
- Role-based access control
- Audit logging of changes

### No Secrets in Code
- Environment variables for sensitive data
- .env files in .gitignore
- Different .env for dev, staging, prod

## Testing Strategy

### Backend Tests
- Unit tests for business logic
- Integration tests for API endpoints
- Database tests (with test database)
- Coverage target: >80%

### Frontend Tests
- Component tests (if complexity justifies)
- Integration tests for critical flows
- E2E tests for user workflows (future)

### Why pytest for Backend?
- Powerful fixtures system
- Great assertion messages
- Wide adoption in Python community
- Works well with SQLAlchemy

## Logging

### Current
- Basic Python logging
- Console output

### Future
- Structured logging (JSON)
- Log aggregation (ELK, Datadog)
- Performance metrics
- Request tracing

## Deployment

### Docker
- Consistent environments (dev = prod)
- Easy scaling
- Database persistence with volumes

### Why Docker Compose?
- Local development environment
- Clear service dependencies
- Production-like setup
- Easy to extend

### Production Considerations
- Use managed PostgreSQL (RDS, Azure Database)
- Use container registry (Docker Hub, ECR)
- Environment-specific configurations
- Secrets management (AWS Secrets, HashiCorp Vault)

## What Was NOT Implemented

### Authentication
- Not required for operations dashboard
- Adds complexity
- Can be added later without major changes

### Payment Gateway
- Out of scope (not e-commerce)
- Could be added as separate module

### Microservices
- Adds operational complexity
- Worth it only at 10M+ orders
- Modular monolith allows future extraction

### Caching Layer
- Database queries are fast enough currently
- Can add Redis if dashboard metrics are slow
- Query optimization first, caching second

### Message Queue
- Synchronous operations are sufficient
- Future: Order processing, notifications

### Search Engine (Elasticsearch)
- PostgreSQL full-text search sufficient
- Complex search with 5M+ orders → consider later

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Modular Monolith | Simplicity, fast development | Can't scale modules independently |
| REST API | Easy to understand | Less efficient than GraphQL for complex queries |
| Offset Pagination | Simple to implement | Slower for deep pagination (5M+ rows) |
| Server-side filtering | Efficient, scalable | More backend complexity |
| DECIMAL for money | Accuracy | Slightly slower than float (negligible) |

## Conclusion

This architecture is designed to be:
1. **Correct**: Handles monetary values safely
2. **Simple**: Easy to understand and extend
3. **Maintainable**: Clear separation of concerns
4. **Scalable**: Designed with 5M+ orders in mind
5. **Performant**: Optimized queries and frontend
6. **Reliable**: Proper error handling and validation
