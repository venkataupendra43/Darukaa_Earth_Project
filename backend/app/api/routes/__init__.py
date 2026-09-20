from app.api.routes.analytics import router as analytics_router
from app.api.routes.auth import router as auth_router
from app.api.routes.projects import router as projects_router
from app.api.routes.sites import router as sites_router

__all__ = ["analytics_router", "auth_router", "projects_router", "sites_router"]
