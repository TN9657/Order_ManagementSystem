from sqlalchemy import case, extract, func
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.orders.models import Order, OrderStatus
from app.customers.models import Customer

MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


class DashboardRepository:
    """Repository for dashboard statistics."""

    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        """Get dashboard summary statistics."""

        total_orders = db.query(func.count(Order.id)).scalar() or 0
        total_customers = db.query(func.count(Customer.id)).scalar() or 0
        total_completed_value = db.query(func.sum(Order.amount)).filter(
            Order.status == OrderStatus.COMPLETED
        ).scalar() or Decimal("0.00")
        pending_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.PENDING
        ).scalar() or 0
        completed_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.COMPLETED
        ).scalar() or 0
        cancelled_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.CANCELLED
        ).scalar() or 0
        average_order_value = db.query(func.avg(Order.amount)).scalar() or Decimal("0.00")

        # Monthly stats: combine all available years so seeded historical data is visible.
        monthly_rows = (
            db.query(
                extract("month", Order.created_at).label("month"),
                func.sum(
                    case(
                        (Order.status == OrderStatus.COMPLETED, Order.amount),
                        else_=Decimal("0.00"),
                    )
                ).label("amount"),
                func.count(Order.id).label("order_count"),
            )
            .group_by(extract("month", Order.created_at))
            .order_by(extract("month", Order.created_at))
            .all()
        )

        monthly_amount = {int(row.month): float(row.amount or 0) for row in monthly_rows}
        monthly_orders = {int(row.month): int(row.order_count or 0) for row in monthly_rows}

        monthly_stats = [
            {
                "month": MONTH_LABELS[m - 1],
                "amount_received": monthly_amount.get(m, 0),
                "order_count": monthly_orders.get(m, 0),
            }
            for m in range(1, 13)
        ]

        return {
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_completed_value": total_completed_value,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
            "cancelled_orders": cancelled_orders,
            "average_order_value": average_order_value,
            "monthly_stats": monthly_stats,
        }
