from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class OrderStatus(str, Enum):
    """Valid order status values."""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class OrderBase(BaseModel):
    """Base order schema."""

    customer_id: int
    amount: Decimal = Field(gt=0, decimal_places=2)
    description: str = Field(default="", min_length=0, max_length=500)
    status: OrderStatus = OrderStatus.PENDING


class OrderCreate(OrderBase):
    """Schema for creating an order."""
    pass


class OrderUpdate(BaseModel):
    """Schema for updating an order."""

    status: OrderStatus


class OrderResponse(OrderBase):
    """Schema for order response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderDetailResponse(OrderResponse):
    """Schema for detailed order response with customer info."""

    customer_name: str
    customer_email: str


class OrderListResponse(BaseModel):
    """Schema for paginated order list response."""

    items: list[OrderDetailResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
