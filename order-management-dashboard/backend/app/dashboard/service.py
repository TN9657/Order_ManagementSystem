from sqlalchemy.orm import Session

from app.dashboard.repository import DashboardRepository


class DashboardService:
    """Service for dashboard business logic."""
    
    @staticmethod
    def get_summary(db: Session) -> dict:
        """Get dashboard summary."""
        return DashboardRepository.get_dashboard_summary(db)
