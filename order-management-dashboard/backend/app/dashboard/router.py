from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dashboard.service import DashboardService
from app.dashboard.schemas import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: Session = Depends(get_db),
):
    """Get dashboard summary statistics."""
    try:
        summary = DashboardService.get_summary(db)
        return DashboardSummary(
            total_orders=summary["total_orders"],
            total_customers=summary["total_customers"],
            total_completed_value=summary["total_completed_value"],
            pending_orders=summary["pending_orders"],
            completed_orders=summary["completed_orders"],
            cancelled_orders=summary["cancelled_orders"],
            average_order_value=summary["average_order_value"],
            monthly_stats=summary["monthly_stats"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard summary")
