# Homed

A full-stack household management web application that helps roommates and families coordinate shared living. Homed brings together chore tracking, collaborative shopping lists, a shared recipe book, and a pantry item catalog — all scoped to a shared household that members create or join via an invite code.

## 🧾 Project Info

![License](https://img.shields.io/github/license/Tikkaaa3/homed?style=for-the-badge&cacheSeconds=60)
![Last Commit](https://img.shields.io/github/last-commit/Tikkaaa3/homed?style=for-the-badge)
![Repo Size](https://img.shields.io/github/repo-size/Tikkaaa3/homed?style=for-the-badge&cacheSeconds=60)

---

## 🧱 Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)

---

## ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)

---

## 🔐 Auth & Security

![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Argon2](https://img.shields.io/badge/Security-Argon2-5A0FC8)

---

## 🧰 Tooling & Infra

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Axios](https://img.shields.io/badge/HTTP-Axios-5A29E4?logo=axios&logoColor=white)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running with Docker (Recommended)](#running-with-docker-recommended)
  - [Running Locally (Without Docker)](#running-locally-without-docker)
  - [Seeding the Database](#seeding-the-database)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Multi-Tenancy Model](#multi-tenancy-model)

---

## 🎬 Demo Video

👉 Click the image below to watch the demo on YouTube:

[![▶ Watch Demo](https://img.youtube.com/vi/2OcQIb8wSiw/maxresdefault.jpg)](https://www.youtube.com/watch?v=2OcQIb8wSiw)

---

## ✨ Key Highlights

- 🏠 Multi-tenant household system (invite-based)
- 🔐 JWT authentication with secure Argon2 hashing
- 🔄 Recurring chore scheduling + completion tracking
- 🛒 Collaborative real-time shopping lists
- 🍳 Recipe suggestions based on available ingredients
- 🧱 Strong relational data model with enforced constraints

---

## Features

### Household Management

- Create a new household with a unique, auto-generated 6-character invite code
- Join an existing household by entering the invite code
- View all household members
- Leave a household at any time

### Chore Tracking

- Create chores with a recurrence frequency: `DAILY`, `WEEKLY`, `BIWEEKLY`, or `MONTHLY`
- Optionally assign chores to specific household members
- Reassign chores to different members
- Log chore completions with an optional note
- View completion history per chore

### Shopping Lists

- Create multiple named shopping lists per household
- Add items from the household's shared item catalog to any list
- Specify quantity and an optional unit override per line item
- Check off items as they are picked up (records who checked it)
- Remove individual items or delete entire lists

### Recipe Book

- Create recipes categorized as `MEAL` or `DESSERT`
- Add free-form notes and full recipe text
- Tag recipes for easy filtering
- Link ingredients to items in the household's catalog (with quantity and optional unit override)
- Get recipe suggestions based on a provided set of available items

### Item Catalog

- Maintain a shared pantry/catalog of named items with categories and units
- Items are the shared building block for both shopping lists and recipe ingredients
- Uniqueness is enforced per household — no duplicate item names within a house

---

## Tech Stack

| Layer       | Technology                                                        |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7      |
| State/Forms | React Context API, React Hook Form, Axios                         |
| Icons       | Lucide React                                                      |
| Backend     | Node.js, Express 5, TypeScript                                    |
| ORM         | Prisma 7 (with `@prisma/adapter-pg` for native PostgreSQL driver) |
| Database    | PostgreSQL 15                                                     |
| Auth        | JWT (jsonwebtoken), Argon2 password hashing                       |
| Dev Runtime | tsx (hot-reload via `tsx watch`)                                  |
| Containers  | Docker, Docker Compose                                            |

---

## Architecture Overview

```
┌─────────────────────┐        HTTP/JSON        ┌─────────────────────────┐
│                     │ ─────────────────────►  │                         │
│   React Frontend    │                         │   Express REST API      │
│   (Vite / Port 5173)│ ◄─────────────────────  │   (Node.js / Port 3000) │
│                     │    Bearer Token Auth     │                         │
└─────────────────────┘                         └────────────┬────────────┘
                                                             │ Prisma ORM
                                                             │
                                                ┌────────────▼────────────┐
                                                │                         │
                                                │   PostgreSQL 15         │
                                                │   (Port 5433 on host)   │
                                                │                         │
                                                └─────────────────────────┘
```

The frontend communicates exclusively through the REST API using an Axios client that automatically attaches the JWT from `localStorage` to every outgoing request. All protected API routes validate the token via a middleware before any business logic runs.

---

## Project Structure

```
homed/
├── docker-compose.yml          # Orchestrates all three services
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema and relations
│   │   ├── seed.ts             # Pantry seed script
│   │   └── migrations/         # Prisma migration history
│   ├── src/
│   │   ├── app.ts              # Express app setup, CORS, route mounting
│   │   ├── server.ts           # HTTP server entry point
│   │   ├── lib/
│   │   │   └── prisma.ts       # Prisma client singleton (pg adapter)
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  # JWT verification middleware
│   │   ├── modules/
│   │   │   ├── auth/           # Signup, login, /me
│   │   │   ├── houses/         # Create, join, leave, members, current
│   │   │   ├── items/          # CRUD for the pantry/catalog
│   │   │   ├── chores/         # CRUD + completions + reassignment
│   │   │   ├── shopping/       # Lists + line items (check/uncheck)
│   │   │   └── recipes/        # CRUD + ingredients + suggestions
│   │   └── types/
│   │       └── express.d.ts    # Extends Express Request with `userId`
│   ├── Dockerfile
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts       # Axios instance with auth interceptor
    │   ├── context/
    │   │   └── AuthContext.tsx # Global auth state (user, login, logout)
    │   ├── components/
    │   │   ├── MainLayout.tsx  # Sidebar (desktop) + bottom nav (mobile)
    │   │   └── ProtectedRoute.tsx # Guards routes, redirects to onboarding
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Signup.tsx
    │   │   ├── Onboarding.tsx  # Create or join a house
    │   │   ├── Dashboard.tsx   # Welcome view + invite code display
    │   │   ├── Chores.tsx
    │   │   ├── ShoppingLists.tsx
    │   │   └── Recipes.tsx
    │   └── App.tsx             # Route declarations
    ├── Dockerfile
    └── package.json
```

---

## Data Model

```
User ──────────────────────────────────────── House
 │  (houseId FK, optional)                    │
 │                               ┌────────────┼────────────┐
 │                               │            │            │
 ▼                           Item[]     ShoppingList[]  Chore[]   Recipe[]
Chore (assignedTo)              │            │            │
ChoreCompletion (completedBy)   │        ShoppingListItem │
                                │            │(qty,check) │
                                └────────────┘        ChoreCompletion
                                │
                            RecipeIngredient
                                │
                             Recipe
```

Key constraints:

- A user belongs to **at most one** household at a time (`houseId` is nullable)
- Items are **unique by name within a household** (`@@unique([houseId, name])`)
- Shopping list titles are **unique within a household** (`@@unique([houseId, title])`)
- A `ShoppingListItem` cannot repeat the same item in the same list (`@@unique([listId, itemId])`)
- Recipe ingredients cannot repeat the same item in the same recipe (`@@unique([recipeId, itemId])`)
- All house-scoped data cascades on house deletion; completions are restricted (cannot delete a user with completions)

---

## API Reference

All routes marked with `[Auth]` require an `Authorization: Bearer <token>` header.

### Auth — `/auth`

| Method | Path      | Auth   | Description                      |
| ------ | --------- | ------ | -------------------------------- |
| POST   | `/signup` |        | Register a new user, returns JWT |
| POST   | `/login`  |        | Authenticate, returns JWT        |
| GET    | `/me`     | [Auth] | Returns the current user profile |

### Houses — `/houses`

| Method | Path       | Auth   | Description                       |
| ------ | ---------- | ------ | --------------------------------- |
| POST   | `/`        | [Auth] | Create a new house                |
| POST   | `/join`    | [Auth] | Join a house by `joinCode`        |
| POST   | `/leave`   | [Auth] | Leave the current house           |
| GET    | `/current` | [Auth] | Get current house details         |
| GET    | `/members` | [Auth] | List all members of current house |

### Items — `/items`

| Method | Path   | Auth   | Description                  |
| ------ | ------ | ------ | ---------------------------- |
| GET    | `/`    | [Auth] | List all items for the house |
| POST   | `/`    | [Auth] | Create a new item            |
| PATCH  | `/:id` | [Auth] | Update an item               |
| DELETE | `/:id` | [Auth] | Delete an item               |

### Chores — `/chores`

| Method | Path               | Auth   | Description                      |
| ------ | ------------------ | ------ | -------------------------------- |
| GET    | `/`                | [Auth] | List all chores with completions |
| POST   | `/`                | [Auth] | Create a chore                   |
| PATCH  | `/:id/reassign`    | [Auth] | Change the assigned member       |
| POST   | `/:id/completions` | [Auth] | Log a chore completion           |
| DELETE | `/:id`             | [Auth] | Delete a chore                   |

### Shopping Lists — `/shopping-lists`

| Method | Path                       | Auth   | Description               |
| ------ | -------------------------- | ------ | ------------------------- |
| GET    | `/`                        | [Auth] | List all shopping lists   |
| POST   | `/`                        | [Auth] | Create a shopping list    |
| PATCH  | `/:id`                     | [Auth] | Rename a shopping list    |
| DELETE | `/:id`                     | [Auth] | Delete a shopping list    |
| POST   | `/:id/items`               | [Auth] | Add an item to a list     |
| PATCH  | `/:id/items/:lineId/check` | [Auth] | Check/uncheck a line item |
| DELETE | `/:id/items/:lineId`       | [Auth] | Remove a line item        |

### Recipes — `/recipes`

| Method | Path                             | Auth   | Description                           |
| ------ | -------------------------------- | ------ | ------------------------------------- |
| GET    | `/`                              | [Auth] | List all recipes with ingredients     |
| POST   | `/`                              | [Auth] | Create a recipe                       |
| POST   | `/suggest`                       | [Auth] | Suggest recipes by available item IDs |
| PATCH  | `/:id`                           | [Auth] | Update recipe details/tags/notes      |
| DELETE | `/:id`                           | [Auth] | Delete a recipe                       |
| POST   | `/:id/ingredients`               | [Auth] | Add an ingredient to a recipe         |
| DELETE | `/:id/ingredients/:ingredientId` | [Auth] | Remove an ingredient                  |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) — for the recommended containerized setup
- [Node.js](https://nodejs.org/) v22+ and npm — for running locally without Docker

### Running with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Tikkaaa3/homed.git
   cd homed
   ```

2. **Create a `.env` file** in the project root:

   ```env
   JWT_SECRET=your_strong_random_secret_here
   ```

   The database credentials default to `houseapp`/`houseapp`/`houseapp_dev` and can be overridden via `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`.

3. **Start all services**

   ```bash
   docker compose up --build
   ```

   This starts:
   - **PostgreSQL** on `localhost:5433`
   - **Backend API** on `http://localhost:3000`
   - **Frontend** on `http://localhost:5173`

4. **Run the initial database migration** (first time only)

   ```bash
   docker compose exec backend npx prisma migrate deploy
   ```

5. Open `http://localhost:5173` in your browser.

### Running Locally (Without Docker)

**Backend**

```bash
cd backend
cp .env.example .env       # or create .env manually (see Environment Variables)
npm install
npx prisma migrate dev     # applies migrations and generates the client
npm run dev                # starts tsx watch on port 3000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                # starts Vite dev server on port 5173
```

You will need a running PostgreSQL instance and the correct `DATABASE_URL` set in `backend/.env`.

### Seeding the Database

A seed script populates the first house it finds with a realistic pantry of 20 common items across Produce, Dairy, Meat, Pantry, Spices, and Household categories.

> **Important:** Create an account and a house through the UI before running the seed.

```bash
# With Docker
docker compose exec backend npx tsx prisma/seed.ts

# Without Docker (from the backend/ directory)
npx tsx prisma/seed.ts
```

The seed is idempotent — it will skip execution if the house already has items.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Required | Default | Description                  |
| -------------- | -------- | ------- | ---------------------------- |
| `DATABASE_URL` | Yes      | —       | PostgreSQL connection string |
| `JWT_SECRET`   | Yes      | —       | Secret key for signing JWTs  |

### Frontend (set via Docker Compose or Vite env)

| Variable       | Required | Default                 | Description                 |
| -------------- | -------- | ----------------------- | --------------------------- |
| `VITE_API_URL` | Yes      | `http://localhost:3000` | Base URL of the backend API |

---

## Authentication Flow

1. User registers (`POST /auth/signup`) or logs in (`POST /auth/login`)
2. Server returns a signed JWT (7-day expiry) alongside the user object
3. Frontend stores the token in `localStorage` under the key `homed_token`
4. The Axios client reads this token and attaches it as `Authorization: Bearer <token>` on every subsequent request
5. On app load, `AuthContext` calls `GET /auth/me` with the stored token to restore the session; if the token is invalid or expired, it is removed and the user is redirected to `/login`
6. All protected routes use the `authenticateToken` middleware which verifies the token and sets `req.userId` for downstream handlers

---

## Multi-Tenancy Model

Homed uses a **single-database, house-scoped** tenancy model:

- Every resource (Item, Chore, ShoppingList, Recipe) carries a `houseId` foreign key
- Every API handler resolves the calling user's `houseId` from their profile before touching any data
- Operations are always filtered by `houseId`, ensuring users can only read and write their own household's data — even if they somehow obtain another house's resource ID
- A user can belong to **only one house at a time**; leaving a house sets `houseId` to `null` without deleting any user data

---

## License

This project is licensed under the [MIT License](LICENSE).
