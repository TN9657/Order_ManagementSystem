from sqlalchemy.orm import Session
from decimal import Decimal
from typing import Optional, List

from app.orders.repository import OrderRepository
from app.orders.models import OrderStatus
from app.customers.repository import CustomerRepository
from app.core.exceptions import (
    OrderNotFound,
    CustomerNotFound,
    InvalidOrderAmount,
    InvalidOrderStatus,
    InvalidOrderStatusTransition,
)


class OrderService:
    """Service for order business logic."""
    
    @staticmethod
    def create_order(
        db: Session,
        customer_id: int,
        amount: Decimal,
        description: str = "",
        status: OrderStatus = OrderStatus.PENDING,
    ):
        """Create a new order with validation."""

        # Validate amount
        if amount <= 0:
            raise InvalidOrderAmount("Order amount must be greater than zero")

        # Verify customer exists
        customer = CustomerRepository.get_customer(db, customer_id)
        if not customer:
            raise CustomerNotFound(f"Customer {customer_id} not found")

        # Create order
        order = OrderRepository.create_order(
            db,
            customer_id,
            amount,
            description or "",
            status,
        )
        return order
    
    @staticmethod
    def get_order_with_customer(db: Session, order_id: int):
        """Get order with customer details."""
        order = OrderRepository.get_order(db, order_id)
        if not order:
            raise OrderNotFound(f"Order {order_id} not found")
        return order
    
    @staticmethod
    def get_orders_with_filtering(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ):
        """Get filtered and paginated orders."""
        
        orders, total = OrderRepository.get_orders(
            db,
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return orders, total
    
    @staticmethod
    def update_order_status(db: Session, order_id: int, new_status: OrderStatus):
        """Update order status with validation."""
        order = OrderRepository.update_order_status(db, order_id, new_status)
        return order
    
    @staticmethod
    def cancel_order(db: Session, order_id: int):
        """Cancel an order with validation."""
        order = OrderRepository.cancel_order(db, order_id)
        return order
