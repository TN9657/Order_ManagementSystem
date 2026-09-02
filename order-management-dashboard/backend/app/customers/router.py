from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.customers.service import CustomerService
from app.customers.schemas import (
    CustomerCreate,
    CustomerResponse,
    CustomerDetailResponse,
    CustomerSummaryResponse,
    CustomerListResponse,
)
from app.orders.schemas import OrderDetailResponse
from app.core.exceptions import CustomerNotFound
from decimal import Decimal

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
):
    """Create a new customer."""
    try:
        new_customer = CustomerService.create_customer(db, customer.name, customer.email)
        return CustomerResponse(
            id=new_customer.id,
            name=new_customer.name,
            email=new_customer.email,
            created_at=new_customer.created_at,
            updated_at=new_customer.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=CustomerListResponse)
async def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get all customers with pagination and summary statistics."""
    try:
        customers, total = CustomerService.get_all_customers(db, page, page_size, search)
        
        items = []
        for customer in customers:
            summary = CustomerService.get_customer_summary(db, customer.id)
            items.append(
                CustomerSummaryResponse(
                    id=customer.id,
                    name=customer.name,
                    email=customer.email,
                    created_at=customer.created_at,
                    updated_at=customer.updated_at,
                    completed_orders_count=summary["completed_orders_count"],
                    completed_orders_value=summary["completed_orders_value"],
                )
            )
        
        total_pages = (total + page_size - 1) // page_size
        
        return CustomerListResponse(
            items=items,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch customers")


@router.get("/{customer_id}", response_model=CustomerDetailResponse)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    """Get customer by ID."""
    try:
        customer = CustomerService.get_customer(db, customer_id)
        return CustomerDetailResponse(
            id=customer.id,
            name=customer.name,
            email=customer.email,
            created_at=customer.created_at,
            updated_at=customer.updated_at,
        )
    except CustomerNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{customer_id}/summary", response_model=CustomerSummaryResponse)
async def get_customer_summary(
    customer_id: int,
    db: Session = Depends(get_db),
):
    """Get customer summary with completed orders statistics."""
    try:
        summary = CustomerService.get_customer_summary(db, customer_id)
        return CustomerSummaryResponse(
            id=summary["customer"].id,
            name=summary["customer"].name,
            email=summary["customer"].email,
            created_at=summary["customer"].created_at,
            updated_at=summary["customer"].updated_at,
            completed_orders_count=summary["completed_orders_count"],
            completed_orders_value=summary["completed_orders_value"],
        )
    except CustomerNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
