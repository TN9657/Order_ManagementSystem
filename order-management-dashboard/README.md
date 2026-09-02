# Order Management Dashboard

A production-quality internal Order Management Dashboard for operations teams. Built with React, FastAPI, and PostgreSQL.

## Features

### Dashboard
- KPI cards showing key metrics
- Total orders, customers, and revenue
- Order status breakdown
- Recent orders list

### Orders Management
- View all orders with pagination
- Search orders by customer name or email
- Filter by status (pending, completed, cancelled)
- Sort by date or amount
- View order details
- Create new orders
- Update order status (pending → completed/cancelled)
- Cancel orders
- Real-time status indicators

### Customer Management
- View all customers with summary statistics
- Search and pagination support
- Customer profile with order history
- Completed orders count and total value
- View customer details and related orders

### Additional Features
- Responsive design optimized for desktop and tablet
- Real-time data updates via TanStack Query
- Clean, professional UI with Tailwind CSS
- Comprehensive error handling
- Loading states and empty states
- RESTful API with proper HTTP status codes

## Technology Stack

### Frontend
- React 18.2
- TypeScript
- Vite
- React Router
- TanStack Query (React Query)
- Tailwind CSS
- Axios

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy ORM
- Pydantic for validation
- PostgreSQL
- Alembic for migrations

### Database
- PostgreSQL 14+
- DECIMAL(12,2) for monetary values

## Project Structure

```
order-management-dashboard/
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── api/          # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── core/        # Configuration, exceptions, logging
│   │   ├── database/    # SQLAlchemy setup
│   │   ├── customers/   # Customer module (router, service, repository, models, schemas)
│   │   ├── orders/      # Orders module (router, service, repository, models, schemas)
│   │   ├── dashboard/   # Dashboard module
│   │   └── main.py      # FastAPI app
│   ├── tests/           # Pytest test suite
│   ├── seed.py          # Database seeding script
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
├── DECISIONS.md
├── PROJECT_ARCHITECTURE.md
├── INTERVIEW_GUIDE.md
├── docker-compose.yml
└── .gitignore
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- OR Node.js 18+ and Python 3.11+

### Quick Start with Docker

```bash
# Clone or navigate to the project directory
cd order-management-dashboard

# Build and start services
docker-compose up --build

# In another terminal, seed the database
docker-compose exec backend python seed.py

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start PostgreSQL
# Make sure PostgreSQL is running and accessible

# Create database
createdb order_management

# Run migrations (if using Alembic)
# alembic upgrade head

# Seed database
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard metrics

### Orders
- `GET /api/orders` - List orders (supports pagination, search, filtering, sorting)
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}/status` - Update order status
- `POST /api/orders/{id}/cancel` - Cancel an order

### Customers
- `GET /api/customers` - List customers (supports pagination)
- `GET /api/customers/{id}` - Get customer details
- `GET /api/customers/{id}/summary` - Get customer summary with stats

## Query Parameters

### Orders List
- `page` (int, default: 1) - Page number
- `page_size` (int, default: 20, max: 100) - Items per page
- `search` (string) - Search by customer name or email
- `status` (string) - Filter by status: pending, completed, cancelled
- `sort_by` (string) - Sort field: created_at, amount, status, id
- `sort_order` (string) - Sort direction: asc, desc

Example:
```
GET /api/orders?page=1&page_size=20&search=rahul&status=completed&sort_by=created_at&sort_order=desc
```

## Database Schema

### Customers
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `customers.email` - For email-based lookups
- `orders.customer_id` - For customer relationship queries
- `orders.status` - For filtering by status
- `orders.created_at` - For sorting by date

## Order Status Transitions

Valid transitions:
- `pending` → `completed`
- `pending` → `cancelled`
- `completed` → (no transitions allowed)
- `cancelled` → (no transitions allowed)

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v

# Run specific test file
pytest tests/test_orders.py -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

### Running Tests in Docker
```bash
docker-compose exec backend pytest tests/ -v
```

## Seed Data

The database includes:
- 20 sample customers
- 45+ sample orders with various statuses
- Mix of pending, completed, and cancelled orders
- Multiple orders per customer for realistic testing

Run seed data:
```bash
python seed.py
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://orderuser:orderpass@localhost:5432/order_management
DEBUG=False
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### Frontend
Frontend configuration is in `vite.config.ts` with API proxy to `http://localhost:8000`

## Performance Considerations

### Database
- Indexes on foreign keys and frequently filtered columns
- DECIMAL type for monetary values (prevents floating-point errors)
- Efficient pagination using offset/limit
- Query optimization using SQLAlchemy relationships

### Frontend
- Code splitting via Vite
- Query caching with TanStack Query
- Lazy loading of routes
- Debounced search input
- Efficient table rendering

### Scalability Path
For 5M+ orders:
1. Implement cursor-based pagination
2. Add read replicas for queries
3. Consider materialized views for dashboard
4. Implement caching layer (Redis)
5. Archive old orders to separate table
6. Consider service extraction for analytics

## Deployment

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend health (via browser)
http://localhost:5173
```

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb order_management`

### Port Already in Use
```bash
# Backend (8000)
lsof -i :8000
kill -9 <PID>

# Frontend (5173)
lsof -i :5173
kill -9 <PID>
```

### Module Not Found (Python)
```bash
pip install -r requirements.txt
```

### Module Not Found (Node)
```bash
npm install
```

## Future Enhancements

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Audit logging

2. **Advanced Analytics**
   - Customer lifetime value
   - Order trends
   - Predictive analytics

3. **Workflow Automation**
   - Automated order fulfillment
   - Scheduled reports
   - Bulk operations

4. **Integration**
   - Email notifications
   - Payment gateway integration
   - Shipping provider APIs

5. **Performance Optimization**
   - GraphQL option
   - WebSocket for real-time updates
   - Advanced caching strategies

## Support

For issues or questions:
1. Check DECISIONS.md for design rationale
2. Review PROJECT_ARCHITECTURE.md for system design
3. See INTERVIEW_GUIDE.md for detailed explanations
4. Check API documentation at http://localhost:8000/docs

## License

Proprietary - Internal Use Only
