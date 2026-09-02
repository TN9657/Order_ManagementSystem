from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CustomerBase(BaseModel):
    """Base customer schema."""

    name: str
    email: str


class CustomerCreate(CustomerBase):
    """Schema for creating a customer."""
    pass


class CustomerResponse(CustomerBase):
    """Schema for customer response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerSummaryResponse(CustomerResponse):
    """Schema for customer summary with order statistics."""

    completed_orders_count: int
    completed_orders_value: Decimal


class CustomerDetailResponse(CustomerResponse):
    """Schema for detailed customer response."""

    pass


class CustomerListResponse(BaseModel):
    """Schema for paginated customer list response."""

    items: list[CustomerSummaryResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
