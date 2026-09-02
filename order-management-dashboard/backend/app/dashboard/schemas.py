from decimal import Decimal
from pydantic import BaseModel


class MonthlyStatItem(BaseModel):
    month: str
    amount_received: float
    order_count: int


class DashboardSummary(BaseModel):
    """Dashboard summary schema."""

    total_orders: int
    total_customers: int
    total_completed_value: Decimal
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    average_order_value: Decimal
    monthly_stats: list[MonthlyStatItem]
