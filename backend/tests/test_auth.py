def test_register_user_success(client):
    """Test successful user registration."""
    payload = {
        "full_name": "Jane Doe",
        "email": "jane@darukaa.earth",
        "password": "SecurePassword123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "jane@darukaa.earth"
    assert data["full_name"] == "Jane Doe"
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    """Test registering with an existing email fails with 400 error."""
    payload = {
        "full_name": "Jane Doe",
        "email": "jane@darukaa.earth",
        "password": "SecurePassword123!",
    }
    client.post("/api/auth/register", json=payload)

    # Attempt duplicate registration
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client):
    """Test logging in with valid credentials returns JWT token."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "John Smith",
            "email": "john@darukaa.earth",
            "password": "Password123!",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "john@darukaa.earth", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "john@darukaa.earth"


def test_login_invalid_password(client):
    """Test logging in with wrong password fails with 401 Unauthorized."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "John Smith",
            "email": "john@darukaa.earth",
            "password": "Password123!",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "john@darukaa.earth", "password": "WrongPassword"},
    )
    assert response.status_code == 401


def test_get_me_authenticated(client, auth_headers):
    """Test /api/auth/me returns current user profile when authorized."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@darukaa.earth"


def test_get_me_unauthorized(client):
    """Test /api/auth/me returns 401 when token is missing or invalid."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
