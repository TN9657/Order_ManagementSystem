# Order Management Dashboard - Quick Start Guide

## Option 1: Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Start the application

```bash
# Navigate to project root
cd order-management-dashboard

# Build and start services
docker-compose up --build

# In another terminal, seed the database
docker-compose exec backend python seed.py

# Access the application
Frontend: http://localhost:5173
API Docs: http://localhost:8000/docs
```

### Verify it's working

1. Open http://localhost:5173 in your browser
2. You should see the Dashboard with KPIs
3. Navigate to Orders → see list of orders
4. Navigate to Customers → see list of customers
5. Try creating an order, updating status, canceling orders

## Option 2: Local Development

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (on Windows)
venv\Scripts\activate

# Activate (on Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Make sure PostgreSQL is running and accessible
# Update DATABASE_URL in .env if needed

# Seed database
python seed.py

# Start backend server
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### Frontend Setup (in new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

## Testing the API

### Using curl

```bash
# Get orders
curl http://localhost:8000/api/orders

# Get dashboard summary
curl http://localhost:8000/api/dashboard/summary

# Get customers
curl http://localhost:8000/api/customers

# Create order
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "amount": 2500.00,
    "status": "pending"
  }'

# Update order status
curl -X PATCH http://localhost:8000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Cancel order
curl -X POST http://localhost:8000/api/orders/1/cancel
```

### Using Postman or Insomnia

Import these endpoints:
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders`
- `PATCH /api/orders/{id}/status`
- `POST /api/orders/{id}/cancel`
- `GET /api/customers`
- `GET /api/customers/{id}`
- `GET /api/customers/{id}/summary`
- `GET /api/dashboard/summary`

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_orders.py -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Building for Production

### Backend

```bash
# Build docker image
docker build -t order-management-api ./backend

# Run container
docker run -p 8000:8000 -e DATABASE_URL=... order-management-api
```

### Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### PostgreSQL Connection Error
```
Error: could not connect to database
```
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- If using Docker: `docker-compose logs postgres`

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001 --reload
```

### Module Not Found (Python)
```bash
pip install -r requirements.txt
```

### Module Not Found (Node)
```bash
npm install
```

### Database Empty
```bash
# Seed database with sample data
python seed.py
```

### API Not Responding
```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS is configured correctly
# Frontend should be able to access backend at http://localhost:8000
```

## Development Workflow

1. **Start backend**: `uvicorn app.main:app --reload`
2. **Start frontend**: `npm run dev`
3. **Make changes**: Edit code, changes auto-reload
4. **Test APIs**: Use Postman or curl
5. **Run tests**: `pytest tests/ -v`
6. **Commit**: `git add . && git commit -m "..."`

## Key Files to Know

### Backend
- `app/main.py` - FastAPI app entry point
- `app/customers/` - Customer module
- `app/orders/` - Orders module
- `app/dashboard/` - Dashboard module
- `tests/` - Test suite
- `seed.py` - Database seeding

### Frontend
- `src/App.tsx` - Main React app
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/hooks/useApi.ts` - TanStack Query hooks
- `src/types/index.ts` - TypeScript types
- `src/utils/` - Utility functions

## Next Steps

1. ✅ Get application running
2. ✅ Explore the UI (Dashboard, Orders, Customers)
3. ✅ Try creating an order
4. ✅ Read DECISIONS.md for architecture rationale
5. ✅ Read PROJECT_ARCHITECTURE.md for detailed design
6. ✅ Read INTERVIEW_GUIDE.md for explanations
7. ✅ Run tests: `pytest tests/ -v`
8. ✅ Explore API docs: http://localhost:8000/docs
9. ✅ Make changes and commit

## Support

- Check README.md for feature overview
- Check DECISIONS.md for why things are done this way
- Check PROJECT_ARCHITECTURE.md for system design
- Check INTERVIEW_GUIDE.md for detailed explanations
- Check API docs at http://localhost:8000/docs
