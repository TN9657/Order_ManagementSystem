from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.base import Base


class OrderStatus(str, enum.Enum):
    """Valid order status values."""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Order(Base):
    """Order model."""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    amount = Column(DECIMAL(12, 2), nullable=False)
    description = Column(String(500), default="", nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="orders")

    def __repr__(self):
        return f"<Order(id={self.id}, customer_id={self.customer_id}, amount={self.amount}, description={self.description}, status={self.status})>"
