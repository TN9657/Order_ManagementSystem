from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.orders.router import router as orders_router
from app.customers.router import router as customers_router
from app.dashboard.router import router as dashboard_router


def ensure_seed_data() -> None:
    """Keep the database empty unless explicit seeding is requested."""
    return None


Base.metadata.create_all(bind=engine)
ensure_seed_data()

# Create FastAPI app
app = FastAPI(
    title="Order Management Dashboard API",
    description="API for order and customer management",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders_router)
app.include_router(customers_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Order Management Dashboard API is running"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
