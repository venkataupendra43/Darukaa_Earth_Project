from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes import (
    analytics_router,
    auth_router,
    projects_router,
    sites_router,
)
from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.utils.seed_data import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    try:
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
        try:
            seed_database(db)
        except Exception as seed_err:
            print(f"[Seed Note] {seed_err}")
        finally:
            db.close()
    except Exception as db_init_err:
        print(f"[DB Warning] {db_init_err}")

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack geospatial data analytics platform for carbon and biodiversity projects.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(sites_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint returning API and database connection status."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {e}"

    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
    }


@app.post("/api/seed", tags=["Development"])
def trigger_seed(db: Session = Depends(get_db)):
    """Development helper endpoint to trigger seed sample data."""
    try:
        seed_database(db)
        return {"status": "success", "message": "Demo data populated successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Seed error: {e}",
        )
