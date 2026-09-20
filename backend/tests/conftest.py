import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app

# Respect configured DATABASE_URL (PostgreSQL+PostGIS in CI/prod, SQLite in local dev)
TEST_DATABASE_URL = settings.DATABASE_URL

if TEST_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(
        TEST_DATABASE_URL,
        pool_pre_ping=True,
    )
    # Ensure PostGIS extension is active when using PostgreSQL
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.commit()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create fresh database tables for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Test client with database dependency override."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """Helper fixture to create user and return Bearer token headers."""
    register_data = {
        "full_name": "Test User",
        "email": "testuser@darukaa.earth",
        "password": "Password123!",
    }
    client.post("/api/auth/register", json=register_data)

    login_resp = client.post(
        "/api/auth/login",
        json={
            "email": "testuser@darukaa.earth",
            "password": "Password123!",
        },
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
