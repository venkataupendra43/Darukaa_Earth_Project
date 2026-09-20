# Darukaa.Earth | Geospatial Data Analytics Platform

[![Continuous Integration](https://github.com/darukaa-earth/darukaa-earth/actions/workflows/ci.yml/badge.svg)](https://github.com/darukaa-earth/darukaa-earth/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791.svg?style=flat&logo=postgresql)](https://postgis.net)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg?style=flat&logo=react)](https://reactjs.org)
[![Mapbox GL JS](https://img.shields.io/badge/Mapbox-GL--JS-000000.svg?style=flat&logo=mapbox)](https://mapbox.com)

**Darukaa.Earth** is a full-stack, production-structured geospatial data analytics platform engineered for managing carbon sequestration and biodiversity conservation projects. Built for environmental administrators and solution architects, the platform enables real-time project creation, multi-polygon site drawing on high-resolution satellite maps, geodesic surface area computation, metric tracking over time, and time-series performance analytics.

---

## Table of Contents

- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Folder Structure](#project-folder-structure)
- [Database Schema & PostGIS Specifications](#database-schema--postgis-specifications)
- [Local Setup & Quickstart](#local-setup--quickstart)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose Setup (Recommended)](#option-a-docker-compose-setup-recommended)
  - [Option B: Non-Docker Setup (Local Python & Node)](#option-b-non-docker-setup-local-python--node)
- [Environment Variables](#environment-variables)
- [Database Migrations & Seed Data](#database-migrations--seed-data)
- [API Reference](#api-reference)
- [Testing & Code Quality](#testing--code-quality)
- [CI/CD Workflow & Deployment](#cicd-workflow--deployment)
- [Submission & Access Instructions](#submission--access-instructions)

---

## Key Features

1. **JWT Authentication & Access Control**
   - Secure user registration and login with bcrypt password hashing and 24-hour expiration JWT tokens.
   - Protected API routes enforcing user ownership of projects, sites, and environmental observations.

2. **Project & Multi-Site Portfolio Management**
   - Categorize environmental projects across *Carbon projects*, *Biodiversity projects*, *Forest restoration*, *Land rehabilitation*, and *Other*.
   - Add multiple geographical sites to any project with custom land-use classifications.

3. **Mapbox GL JS Polygon Mapping & Drawing**
   - Interactive Mapbox satellite mapping with `@mapbox/mapbox-gl-draw` polygon sketching controls.
   - Capture multi-vertex GeoJSON polygons directly from the map interface.
   - Automatic zoom and bounds fitting to active site geometries.

4. **Server-Side PostGIS & Geodesic Surface Area Calculation**
   - Validates GeoJSON ring closure, coordinate bounds, and non-self-intersecting polygon geometries.
   - Computes server-side geodesic surface area in hectares (`ha`) using WGS84 ellipsoid projections (`pyproj.Geod`), eliminating client-side trust assumptions.

5. **Environmental Metrics & Time-Series Analytics**
   - Record historical observations for *Soil Organic Carbon (%)*, *Soil pH*, *Soil Moisture (%)*, *Biodiversity Index (0-100)*, *Species Richness*, *Vegetation Coverage (%)*, *Temperature (°C)*, and *Rainfall (mm)*.
   - Dynamic Chart.js line charts for trend analytics over time, plus summary statistics (Min, Max, Mean, Latest Value, Data Points).

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + Vite)"]
        UI["React SPA Dashboard"]
        Map["Mapbox GL JS + Mapbox Draw"]
        Charts["Chart.js (react-chartjs-2)"]
        API_Client["Centralized Axios HTTP Client"]
    end

    subgraph Backend ["Backend API (FastAPI + Python 3.11+)"]
        Main["FastAPI App (/health, /api/*)"]
        Auth["JWT Auth & Security (bcrypt)"]
        GeoUtil["Geospatial Validator & Geodesic Engine (Shapely + PyProj)"]
        ORMLayer["SQLAlchemy 2.x ORM"]
    end

    subgraph DB ["Database (PostgreSQL 15 + PostGIS 3.3)"]
        UsersTab[("users Table")]
        ProjTab[("projects Table")]
        SitesTab[("sites Table (Geometry Polygon 4326 + GIST Index)")]
        MetricsTab[("site_metrics Table")]
    end

    UI --> Map
    UI --> Charts
    UI --> API_Client
    API_Client -- "HTTPS / JSON + Bearer JWT" --> Main
    Main --> Auth
    Main --> GeoUtil
    Main --> ORMLayer
    ORMLayer --> UsersTab
    ORMLayer --> ProjTab
    ORMLayer --> SitesTab
    ORMLayer --> MetricsTab
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with request/response Bearer token interceptors
- **Mapping**: Mapbox GL JS & `@mapbox/mapbox-gl-draw`
- **Charting**: Chart.js & `react-chartjs-2`
- **UI Components**: Lucide React Icons & CSS Modules / Custom Design System
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI with Uvicorn ASGI
- **ORM & Database**: SQLAlchemy 2.x, GeoAlchemy2, psycopg2-binary
- **Geospatial Engine**: Shapely & PyProj (WGS84 Ellipsoidal Geodesics)
- **Security & Auth**: PyJWT, bcrypt password hashing
- **Migrations**: Alembic
- **Testing**: Pytest & HTTPX TestClient

### DevOps & Infrastructure
- **Database Engine**: PostgreSQL 15 + PostGIS 3.3 extension
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions (`ci.yml` & `deploy.yml`)
- **Hosting**: Render (Backend API & PostgreSQL) & Vercel (Frontend Static Host)

---

## Project Folder Structure

```
darukaa-earth/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # LoadingSpinner, Modal, Alert, EmptyState
│   │   │   ├── layout/         # Navbar, Sidebar, Layout wrapper
│   │   │   ├── maps/           # SiteMap, MapDrawControl (Mapbox GL JS + Draw)
│   │   │   ├── charts/         # MetricChart, ComparisonChart (Chart.js)
│   │   │   ├── projects/       # ProjectCard, CreateProjectModal
│   │   │   └── sites/          # SiteCard, AddSiteModal, AddMetricModal
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── SiteDetails.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/           # api.js, authService, projectService, siteService, analyticsService
│   │   ├── context/            # AuthContext.jsx
│   │   ├── routes/             # ProtectedRoute.jsx
│   │   ├── utils/              # formatters.js, geojson.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── .eslintrc.cjs
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/               # config.py, security.py, database.py
│   │   ├── models/             # user.py, project.py, site.py, metric.py
│   │   ├── schemas/            # user.py, project.py, site.py, metric.py
│   │   ├── api/routes/         # auth.py, projects.py, sites.py, analytics.py
│   │   └── utils/              # geo_utils.py (polygon validation & geodesic area), seed_data.py
│   ├── tests/                  # Pytest integration & unit test suite
│   ├── alembic/                # Migration scripts
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── database/
│   └── init.sql                # PostGIS initialization SQL script
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # GitHub Actions CI workflow
│       └── deploy.yml          # GitHub Actions Deployment workflow
│
├── docker-compose.yml
├── .lintstagedrc.json
├── .gitignore
└── README.md
```

---

## Database Schema & PostGIS Specifications

### Entity-Relationship Diagram

```
+--------------------------------+       +-----------------------------------+
|             USERS              |       |             PROJECTS              |
+--------------------------------+       +-----------------------------------+
| PK id            SERIAL        |<------| PK id            SERIAL           |
|    full_name     VARCHAR(255)  |       | FK created_by    INTEGER (Users)  |
| UQ email         VARCHAR(255)  |       |    name          VARCHAR(255)     |
|    password_hash VARCHAR(255)  |       |    project_type   VARCHAR(100)     |
|    is_active     BOOLEAN       |       |    location_name VARCHAR(255)     |
|    created_at    TIMESTAMPTZ   |       |    created_at    TIMESTAMPTZ      |
+--------------------------------+       +-----------------------------------+
                                                           |
                                                           | 1:N
                                                           v
+--------------------------------+       +-----------------------------------+
|          SITE_METRICS          |       |               SITES               |
+--------------------------------+       +-----------------------------------+
| PK id            SERIAL        |       | PK id            SERIAL           |
| FK site_id       INTEGER(Sites)|<------| FK project_id    INTEGER(Projects)|
|    metric_name   VARCHAR(100)  |       |    name          VARCHAR(255)     |
|    metric_value  DOUBLE PREC   |       |    geometry      GEOMETRY(Poly,4326)|
|    unit          VARCHAR(50)   |       |    area          DOUBLE PREC (ha) |
|    recorded_at   TIMESTAMPTZ   |       |    land_use_type VARCHAR(100)     |
+--------------------------------+       +-----------------------------------+
```

- **Spatial Coordinate Reference System (SRID)**: `4326` (WGS 84 geographic coordinates in `[Longitude, Latitude]`).
- **Spatial Indexing**: `GIST` index on `sites.geometry` for high-performance spatial query execution.
- **Dual-Engine Compatibility**: Full PostGIS support in Docker & Production PostgreSQL environments, with automatic Shapely GeoJSON serialization fallback for local SQLite testing.

---

## Local Setup & Quickstart

### Prerequisites
- **Node.js**: v18.0.0+
- **Python**: v3.11+
- **Docker & Docker Compose** (Optional, for PostGIS container execution)

---

### Option A: Docker Compose Setup (Recommended)

Run the entire application stack (PostgreSQL + PostGIS database, FastAPI backend) in isolated containers:

1. **Clone Repository**:
   ```bash
   git clone https://github.com/darukaa-earth/darukaa-earth.git
   cd darukaa-earth
   ```

2. **Start Containers**:
   ```bash
   docker-compose up --build -d
   ```
   *This initializes PostGIS, executes `database/init.sql`, applies migrations, and starts the API at `http://localhost:8000`.*

3. **Start React Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### Option B: Non-Docker Setup (Local Python & Node)

If Docker is not installed, run backend and frontend natively:

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Populate Seed Data**:
   ```bash
   python app/utils/seed_data.py
   ```

3. **Run Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Run Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Environment Variables

### Backend (`backend/.env`)
```ini
DATABASE_URL=postgresql://darukaa_user:darukaa_password@localhost:5432/darukaa_db
SECRET_KEY=darukaa-earth-super-secret-jwt-key-change-in-production-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2x4ZGVtb3NhbXBsZXRva2VuMDExIn0.demo_public_token
```

---

## Database Migrations & Seed Data

### Alembic Migrations
To run database migrations manually:
```bash
cd backend
alembic upgrade head
```

To create a new migration:
```bash
alembic revision -m "add_custom_spatial_column"
```

### Seed Development Data
Populate demo admin account, environmental projects, valid polygon sites, and sample metric time series:
```bash
python app/utils/seed_data.py
```
- **Demo Admin Email**: `admin@darukaa.earth`
- **Demo Password**: `Darukaa2026!`

---

## API Reference

### Health
- `GET /health`: Returns service status, version, and database connectivity.

### Authentication
- `POST /api/auth/register`: Register new administrator account.
- `POST /api/auth/login`: Authenticate email/password and issue Bearer JWT access token.
- `GET /api/auth/me`: Retrieve profile metadata for current authenticated user.

### Projects
- `GET /api/projects`: List projects owned by user with site counts and total area.
- `POST /api/projects`: Create a new project (*Carbon project*, *Biodiversity project*, etc.).
- `GET /api/projects/{id}`: Retrieve project details.
- `PUT /api/projects/{id}`: Update project details.
- `DELETE /api/projects/{id}`: Delete project and cascade associated sites/metrics.

### Sites & Geometries
- `GET /api/projects/{project_id}/sites`: List geographical sites for project.
- `POST /api/projects/{project_id}/sites`: Validate GeoJSON polygon, compute geodesic area, and store geometry in PostGIS.
- `GET /api/sites/{id}`: Retrieve site details and geometry.
- `PUT /api/sites/{id}`: Update site geometry or metadata.
- `DELETE /api/sites/{id}`: Delete site.

### Metrics & Analytics
- `POST /api/sites/{site_id}/metrics`: Record environmental metric observation.
- `GET /api/sites/{site_id}/metrics`: Retrieve historical metric records.
- `GET /api/sites/{site_id}/analytics`: Retrieve structured summaries (Min, Mean, Max, Latest Value) and time-series for Chart.js.

---

## Testing & Code Quality

### Backend Automated Test Suite
Run 13 isolated integration tests covering health checks, registration, duplicate email validation, login, JWT protection, project CRUD, site GeoJSON polygon validation, geodesic area calculation, and analytics:
```bash
cd backend
python -m pytest -v
```

### Backend Linting (Ruff)
```bash
cd backend
ruff check app tests
```

### Frontend Build & Linting (ESLint & Vite)
```bash
cd frontend
npm run lint
npm run build
```

---

## CI/CD Workflow & Deployment

### GitHub Actions CI Workflow (`.github/workflows/ci.yml`)
Triggers automatically on every push or pull request to `main`:
1. Launches PostgreSQL + PostGIS container service in GitHub runner.
2. Installs Python dependencies and runs `ruff` linting.
3. Executes complete `pytest` suite.
4. Installs Node dependencies, runs `eslint`, and verifies Vite production bundle build.

### Deployment Setup (`.github/workflows/deploy.yml`)
- **Backend API**: Prepared for deployment on [Render](https://render.com) using Python Docker runtime.
- **Frontend SPA**: Configured for static hosting on [Vercel](https://vercel.com).

---

## Submission & Access Instructions

- **GitHub Repository**: [https://github.com/darukaa-earth/darukaa-earth](https://github.com/darukaa-earth/darukaa-earth)
- **Live Public Demo**: [https://darukaa-earth.vercel.app](https://darukaa-earth.vercel.app)
- **Admin Access**:
  - Email: `admin@darukaa.earth`
  - Password: `Darukaa2026!`
