from sqlalchemy import func
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import Optional, List, Tuple

from app.orders.models import Order, OrderStatus
from app.customers.models import Customer
from app.core.exceptions import OrderNotFound, InvalidOrderStatus


class OrderRepository:
    """Repository for order database operations."""
    
    @staticmethod
    def create_order(
        db: Session,
        customer_id: int,
        amount: Decimal,
        description: str,
        status: OrderStatus,
    ) -> Order:
        """Create a new order."""
        order = Order(
            customer_id=customer_id,
            amount=amount,
            description=description,
            status=status,
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def get_order(db: Session, order_id: int) -> Optional[Order]:
        """Get an order by ID."""
        return db.query(Order).filter(Order.id == order_id).first()
    
    @staticmethod
    def get_orders(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Order], int]:
        """Get orders with filtering, sorting, and pagination."""
        
        query = db.query(Order).join(Customer)
        
        # Apply search filter
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                (func.lower(Customer.name).like(search_term)) |
                (func.lower(Customer.email).like(search_term))
            )
        
        # Apply status filter
        if status:
            try:
                order_status = OrderStatus(status)
                query = query.filter(Order.status == order_status)
            except ValueError:
                raise InvalidOrderStatus(f"Invalid status: {status}")
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        allowed_sort_fields = {
            "created_at": Order.created_at,
            "amount": Order.amount,
            "status": Order.status,
            "id": Order.id,
        }
        
        sort_column = allowed_sort_fields.get(sort_by, Order.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        # Apply pagination
        skip = (page - 1) * page_size
        orders = query.offset(skip).limit(page_size).all()
        
        return orders, total
    
    @staticmethod
    def update_order_status(db: Session, order_id: int, new_status: OrderStatus) -> Order:
        """Update order status."""
        order = OrderRepository.get_order(db, order_id)
        if not order:
            raise OrderNotFound(f"Order {order_id} not found")
        
        # Validate status transition
        current_status = order.status
        
        # Valid transitions
        valid_transitions = {
            OrderStatus.PENDING: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
            OrderStatus.COMPLETED: [],
            OrderStatus.CANCELLED: [],
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            raise InvalidOrderStatus(
                f"Cannot transition from {current_status.value} to {new_status.value}"
            )
        
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def cancel_order(db: Session, order_id: int) -> Order:
        """Cancel an order."""
        order = OrderRepository.get_order(db, order_id)
        if not order:
            raise OrderNotFound(f"Order {order_id} not found")
        
        if order.status != OrderStatus.PENDING:
            raise InvalidOrderStatus(f"Cannot cancel order with status {order.status.value}")
        
        order.status = OrderStatus.CANCELLED
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def get_customer_orders(
        db: Session,
        customer_id: int,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Order], int]:
        """Get orders for a specific customer."""
        query = db.query(Order).filter(Order.customer_id == customer_id)
        total = query.count()
        
        skip = (page - 1) * page_size
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(page_size).all()
        
        return orders, total
