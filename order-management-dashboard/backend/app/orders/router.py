from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal

from app.database.session import get_db
from app.orders.service import OrderService
from app.orders.schemas import (
    OrderCreate,
    OrderResponse,
    OrderUpdate,
    OrderDetailResponse,
    OrderListResponse,
    OrderStatus,
)
from app.core.exceptions import (
    OrderNotFound,
    CustomerNotFound,
    InvalidOrderAmount,
    InvalidOrderStatus,
    InvalidOrderStatusTransition,
)

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    """Create a new order."""
    try:
        order = OrderService.create_order(
            db,
            customer_id=order_data.customer_id,
            amount=order_data.amount,
            description=order_data.description,
            status=order_data.status,
        )
        return order
    except CustomerNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOrderAmount as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create order")


@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    """Get order by ID with customer details."""
    try:
        order = OrderService.get_order_with_customer(db, order_id)
        return OrderDetailResponse(
            id=order.id,
            customer_id=order.customer_id,
            amount=order.amount,
            description=order.description,
            status=order.status,
            created_at=order.created_at,
            updated_at=order.updated_at,
            customer_name=order.customer.name,
            customer_email=order.customer.email,
        )
    except OrderNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: str = Query("created_at", pattern="^(created_at|amount|status|id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """Get orders with filtering, sorting, and pagination."""
    try:
        orders, total = OrderService.get_orders_with_filtering(
            db,
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        
        items = [
            OrderDetailResponse(
                id=order.id,
                customer_id=order.customer_id,
                amount=order.amount,
                description=order.description,
                status=order.status,
                created_at=order.created_at,
                updated_at=order.updated_at,
                customer_name=order.customer.name,
                customer_email=order.customer.email,
            )
            for order in orders
        ]
        
        total_pages = (total + page_size - 1) // page_size
        
        return OrderListResponse(
            items=items,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )
    except InvalidOrderStatus as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch orders")


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
):
    """Update order status."""
    try:
        order = OrderService.update_order_status(db, order_id, order_update.status)
        return order
    except OrderNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOrderStatus as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update order status")


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    """Cancel an order."""
    try:
        order = OrderService.cancel_order(db, order_id)
        return order
    except OrderNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOrderStatus as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to cancel order")
