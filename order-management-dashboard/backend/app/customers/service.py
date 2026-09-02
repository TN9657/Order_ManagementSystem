from sqlalchemy.orm import Session
from typing import Optional

from app.customers.repository import CustomerRepository
from app.core.exceptions import CustomerNotFound


class CustomerService:
    """Service for customer business logic."""
    
    @staticmethod
    def create_customer(db: Session, name: str, email: str):
        """Create a new customer."""
        # Check if email already exists
        existing = CustomerRepository.get_customer_by_email(db, email)
        if existing:
            raise ValueError(f"Customer with email {email} already exists")
        
        customer = CustomerRepository.create_customer(db, name, email)
        return customer
    
    @staticmethod
    def get_customer(db: Session, customer_id: int):
        """Get a customer by ID."""
        customer = CustomerRepository.get_customer(db, customer_id)
        if not customer:
            raise CustomerNotFound(f"Customer {customer_id} not found")
        return customer
    
    @staticmethod
    def get_all_customers(db: Session, page: int = 1, page_size: int = 20, search: Optional[str] = None):
        """Get all customers with optional search and pagination."""
        customers, total = CustomerRepository.get_all_customers(db, page, page_size, search)
        return customers, total
    
    @staticmethod
    def get_customer_summary(db: Session, customer_id: int):
        """Get customer summary with completed orders statistics."""
        summary = CustomerRepository.get_customer_summary(db, customer_id)
        if not summary:
            raise CustomerNotFound(f"Customer {customer_id} not found")
        return summary
