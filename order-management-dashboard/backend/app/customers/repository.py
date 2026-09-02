from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from decimal import Decimal

from app.customers.models import Customer
from app.orders.models import Order, OrderStatus


class CustomerRepository:
    """Repository for customer database operations."""
    
    @staticmethod
    def create_customer(db: Session, name: str, email: str) -> Customer:
        """Create a new customer."""
        customer = Customer(name=name, email=email)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer
    
    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
        """Get a customer by ID."""
        return db.query(Customer).filter(Customer.id == customer_id).first()
    
    @staticmethod
    def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
        """Get a customer by email."""
        return db.query(Customer).filter(Customer.email == email).first()
    
    @staticmethod
    def get_all_customers(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
    ) -> Tuple[List[Customer], int]:
        """Get all customers with optional name/email search and pagination."""
        query = db.query(Customer).order_by(Customer.created_at.desc())

        if search:
            term = f"%{search.lower()}%"
            query = query.filter(
                func.lower(Customer.name).like(term) |
                func.lower(Customer.email).like(term)
            )

        total = query.count()

        skip = (page - 1) * page_size
        customers = query.offset(skip).limit(page_size).all()

        return customers, total
    
    @staticmethod
    def get_customer_summary(db: Session, customer_id: int) -> Optional[dict]:
        """Get customer summary with completed orders statistics."""
        customer = CustomerRepository.get_customer(db, customer_id)
        if not customer:
            return None
        
        # Get completed orders count
        completed_orders_count = db.query(func.count(Order.id)).filter(
            Order.customer_id == customer_id,
            Order.status == OrderStatus.COMPLETED
        ).scalar() or 0
        
        # Get completed orders value
        completed_orders_value = db.query(func.sum(Order.amount)).filter(
            Order.customer_id == customer_id,
            Order.status == OrderStatus.COMPLETED
        ).scalar() or Decimal("0.00")
        
        return {
            "customer": customer,
            "completed_orders_count": completed_orders_count,
            "completed_orders_value": completed_orders_value,
        }
