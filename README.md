# Coffee Shop API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A comprehensive RESTful API for managing coffee shop operations including product catalog, order processing, customer management, and staff administration.</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Project Setup](#project-setup)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Business Logic](#business-logic)
- [Security Features](#security-features)

## 🎯 Overview

The Coffee Shop API is a production-ready NestJS application designed to manage all aspects of a coffee shop's operations. It provides comprehensive functionality for product management, order processing, customer relationship management, and staff administration with robust authentication and authorization systems.

### Key Capabilities
- **Product Catalog Management**: Categories, products, pricing, and inventory
- **Order Processing**: Complete order lifecycle with status tracking and stock management
- **Real-time Order Events**: Server-Sent Events (SSE) for live order notifications
- **Customer Management**: Customer profiles, order history, and account linking
- **Staff Administration**: Role-based access control for different staff levels
- **API Access Management**: API key generation and management for integrations
- **Real-time Health Monitoring**: System health checks and status monitoring

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-Strategy Authentication**: JWT tokens, refresh tokens, and API keys
- **Combined Auth Guard**: Seamless support for both JWT and API key authentication
- **Role-Based Access Control (RBAC)**: Admin, Manager, Employee, and Customer roles
- **Secure Cookie-Based Auth**: HTTP-only cookies for refresh token storage
- **Token Management**: Automatic refresh token rotation and blacklisting
- **Privilege Escalation Protection**: Role assignment restricted to admins only
- **Secure Password Handling**: bcrypt hashing with salt rounds

### 📦 Product Management
- **Category System**: Hierarchical product categorization with slug generation
- **Inventory Tracking**: Real-time stock management and availability
- **Product Variants**: Support for different sizes, prices, and specifications
- **Promotional Features**: Product promotion flags and display ordering

### 🛒 Order Processing
- **Complete Order Lifecycle**: From creation to completion with status tracking
- **Real-time Notifications**: Server-Sent Events for live order updates to tablets/displays
- **Stock Management**: Automatic inventory updates and over-selling prevention
- **Order Validation**: Real-time availability checks and price calculations
- **Cancellation Handling**: Stock restoration and proper order state management

### 👥 Customer Relationship Management
- **Customer Profiles**: Comprehensive customer information management
- **Order History**: Complete order tracking and history
- **Account Integration**: Optional user account linking for customers

### 🔧 Administrative Features
- **User Management**: Staff account creation and role assignment
- **API Key Management**: Programmatic access control for integrations
- **Real-time Events**: SSE endpoint for order notifications to cafe tablets
- **Health Monitoring**: System status and performance monitoring
- **Comprehensive Logging**: Structured logging with Winston

## 🛠 Technology Stack

- **Framework**: NestJS v11.0.1 (Node.js/TypeScript)
- **Database**: SQLite with Prisma ORM v6.12.0
- **Authentication**: JSON Web Tokens (JWT) with refresh token rotation
- **Real-time**: Server-Sent Events (SSE) with RxJS observables
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, bcrypt, rate limiting (Throttler)
- **Logging**: Winston with structured logging
- **Testing**: Jest framework with unit and e2e testing
- **Package Management**: pnpm for efficient dependency management

## 🏗 System Architecture

### Module Structure

```
src/
├── auth/                    # Authentication & authorization
│   ├── guards/             # JWT, API key, combined, roles guards
│   ├── strategies/         # Passport strategies
│   ├── decorators/         # Public, roles decorators
│   └── dto/               # Authentication DTOs
├── users/                  # User management
├── customers/              # Customer management
├── products/               # Product catalog
├── categories/             # Product categories
├── orders/                 # Order processing
├── events/                 # Server-Sent Events for real-time notifications
├── api-keys/              # API key management
├── health/                # Health monitoring
├── config/                # Configuration files
└── shared/                # Shared utilities
    ├── filters/           # Exception filters
    ├── middleware/        # Custom middleware
    ├── modules/           # Shared modules (Prisma)
    └── utils/             # Utility functions
```

### Core Modules

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **AuthModule** | Authentication & authorization | JWT/API key strategies, combined guard, role management |
| **UsersModule** | User account management | CRUD operations, password management, role assignment |
| **ProductsModule** | Product catalog | Inventory tracking, category relationships, pricing |
| **CategoriesModule** | Product categorization | Slug generation, display ordering, hierarchy |
| **OrdersModule** | Order processing | Status workflow, stock management, real-time events |
| **EventsModule** | Real-time notifications | SSE endpoints, order event streaming, tablet integration |
| **CustomersModule** | Customer management | Profile management, order history tracking |
| **ApiKeysModule** | API access control | Key generation, expiration, usage tracking |
| **HealthModule** | System monitoring | Health checks, status reporting |

## 🔐 Authentication & Authorization

### Authentication Methods

#### 1. JWT Authentication
- **Access Tokens**: 15-minute expiration returned in response body
- **Refresh Tokens**: 7-day expiration stored as secure HTTP-only cookies
- **Cookie Security**: HTTP-only, secure, SameSite=strict protection
- **Token Blacklisting**: JTI-based revocation system for logout
- **Claims**: User ID, email, username, role, and unique token identifier

#### 2. API Key Authentication
- **Format**: UUID-based keys with optional expiration
- **Usage**: Header-based authentication (`X-API-Key`)
- **Management**: Named keys with usage tracking and revocation
- **Scope**: Full API access with role-based permissions

#### 3. Local Authentication
- **Login**: Username/email with password verification
- **Security**: bcrypt password hashing with salt rounds
- **Validation**: Active user status and credential verification

### Role-Based Access Control (RBAC)

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **ADMIN** | Full system access | All endpoints, user management, system configuration |
| **MANAGER** | Operations management | Product/category/order management, staff oversight |
| **EMPLOYEE** | Daily operations | Order processing, customer service, inventory updates |
| **CUSTOMER** | Personal access | Own profile, order history, account management |

### Security Features
- **Combined Authentication**: Unified guard supporting both JWT and API key authentication
- **Global Security**: Authentication + Roles guards on all endpoints by default
- **Public Endpoints**: Explicit decoration for public access
- **Cookie Security**: HTTP-only, secure, SameSite=strict refresh tokens
- **XSS Protection**: Refresh tokens not accessible via JavaScript
- **Privilege Escalation Prevention**: Only admins can assign/change user roles
- **Rate Limiting**: 50 requests per minute per IP address
- **Input Validation**: Comprehensive request validation with whitelisting
- **Password Security**: Strong hashing with bcrypt and security policies

## 📚 API Endpoints

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | User registration | Public |
| POST | `/login` | User authentication | Public |
| POST | `/refresh` | Token refresh | Public |
| POST | `/logout` | Logout with token invalidation | Authenticated |
| GET | `/me` | Get current user profile | Authenticated |

### 📦 Products (`/api/v1/products`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List products (paginated) | Public |
| GET | `/:id` | Get product details | Public |
| POST | `/` | Create new product | Admin/Manager |
| PATCH | `/:id` | Update product | Admin/Manager |
| DELETE | `/:id` | Delete product | Admin |

### 🏷 Categories (`/api/v1/categories`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List categories (paginated) | Public |
| GET | `/:id` | Get category with products | Public |
| POST | `/` | Create new category | Admin/Manager |
| PATCH | `/:id` | Update category | Admin/Manager |
| DELETE | `/:id` | Delete category | Admin |

### 🛒 Orders (`/api/v1/orders`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List orders with filtering | Employee+ |
| GET | `/:id` | Get order details | Employee+ |
| POST | `/` | Create new order | Employee+ |
| PATCH | `/:id` | Update order status | Employee+ |
| POST | `/:id/cancel` | Cancel order | Employee+ |

### 👥 Customers (`/api/v1/customers`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List customers (paginated) | Employee+ |
| GET | `/:id` | Get customer details | Employee+ |
| POST | `/` | Create customer | Employee+ |
| PATCH | `/:id` | Update customer | Employee+ |
| DELETE | `/:id` | Delete customer | Admin |

### 👤 Users (`/api/v1/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List users | Admin |
| GET | `/:id` | Get user details | Admin |
| POST | `/` | Create user | Admin |
| PATCH | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |
| POST | `/:id/change-password` | Change password | Admin/Self |

### 🔑 API Keys (`/api/v1/api-keys`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List own API keys | Authenticated |
| POST | `/` | Create API key | Authenticated |
| PATCH | `/:id` | Update API key | Owner |
| DELETE | `/:id` | Delete API key | Owner |

### 📡 Events (`/api/v1/events`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/orders` | Server-Sent Events for real-time order notifications | API Key or JWT |

### 🏥 Health (`/api/health`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | System health check | Public |

## 🗄 Database Schema

### Core Entities

#### Users & Authentication
```sql
User {
  id: Int (PK)
  email: String (Unique)
  username: String (Unique)
  password_hash: String
  role: Role (ADMIN|MANAGER|EMPLOYEE|CUSTOMER)
  is_active: Boolean
  customer_id: Int? (FK to Customer)
  created_at: DateTime
  updated_at: DateTime
}

ApiKey {
  id: Int (PK)
  key: String (Unique)
  name: String
  is_active: Boolean
  expires_at: DateTime?
  last_used_at: DateTime?
  user_id: Int (FK to User)
  created_at: DateTime
  updated_at: DateTime
}

RefreshToken {
  id: Int (PK)
  token: String (Unique)
  expires_at: DateTime
  is_revoked: Boolean
  user_id: Int (FK to User)
  created_at: DateTime
  updated_at: DateTime
}

BlacklistedToken {
  id: Int (PK)
  jti: String (Unique)
  expires_at: DateTime
  user_id: Int (FK to User)
  created_at: DateTime
}
```

#### Business Entities
```sql
Customer {
  id: Int (PK)
  email: String (Unique)
  first_name: String
  last_name: String
  phone: String?
  created_at: DateTime
  updated_at: DateTime
}

Category {
  id: Int (PK)
  name: String (Unique)
  description: String?
  slug: String (Unique)
  is_active: Boolean
  display_order: Int
  created_at: DateTime
  updated_at: DateTime
}

Product {
  id: Int (PK)
  name: String
  description: String?
  price: Float
  sku: String (Unique)
  stock: Int
  volume_ml: Int?
  is_active: Boolean
  is_promoted: Boolean
  image_url: String?
  category_id: Int (FK to Category)
  created_at: DateTime
  updated_at: DateTime
}

Order {
  id: Int (PK)
  order_number: String (Unique)
  status: OrderStatus
  total_amount: Float
  notes: String?
  customer_id: Int? (FK to Customer)
  created_at: DateTime
  updated_at: DateTime
}

OrderItem {
  id: Int (PK)
  order_id: Int (FK to Order)
  product_id: Int (FK to Product)
  quantity: Int
  unit_price: Float
  subtotal: Float
  created_at: DateTime
  updated_at: DateTime
}
```

### Relationships
- **User ↔ Customer**: One-to-one optional relationship
- **Category → Products**: One-to-many relationship
- **Customer → Orders**: One-to-many relationship
- **Order ↔ Products**: Many-to-many through OrderItems
- **User → ApiKeys/Tokens**: One-to-many relationships

## 🚀 Project Setup

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (package manager)
- SQLite (for database)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd coffee-shop-api/api
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Generate Prisma client
pnpm exec prisma generate

# Run database migrations
pnpm exec prisma db push

# (Optional) Seed database
pnpm exec prisma db seed
```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_EXPIRES_IN_SECONDS=900

# Refresh Token Configuration
REFRESH_TOKEN_EXPIRES_IN_DAYS=7

# Application Configuration
PORT=3000
NODE_ENV=development

# Optional: OpenAPI Export
EXPORT_OPENAPI=true
```

### Configuration Files
- `src/config/app.config.ts`: Application settings (port, environment)
- `src/config/auth.config.ts`: Authentication settings (JWT, token expiration)

## 💻 Development

### Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

### Database Operations

```bash
# View database in browser
pnpm exec prisma studio

# Reset database
pnpm exec prisma db push --force-reset

# Generate new migration
pnpm exec prisma migrate dev --name <migration-name>

# Deploy migrations
pnpm exec prisma migrate deploy
```

### Testing

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode for development
pnpm run test:watch
```

### Code Quality

```bash
# Linting
pnpm run lint

# Formatting
pnpm run format

# Type checking
pnpm run build
```

## 📖 API Documentation

### Swagger Documentation
- **URL**: `http://localhost:3000/docs` (when running locally)
- **Features**: Interactive API explorer, request/response examples, authentication testing
- **Export**: JSON and YAML specifications available at `/docs/api-json` and `/docs/api-yaml`

### Authentication in Swagger
1. **JWT Authentication**: Use the "Authorize" button with `Bearer <your-jwt-token>`
2. **API Key Authentication**: Add `X-API-Key` header with your API key

### OpenAPI Specification Export
When `EXPORT_OPENAPI=true` in development mode, OpenAPI specifications are automatically exported to:
- `docs/openapi-spec.json`
- `docs/openapi-spec.yaml`

## 📋 Business Logic

### Order Processing Workflow

1. **Order Creation**
   - Validate product availability and active status
   - Check sufficient stock for all items
   - Calculate item subtotals and order total
   - Generate unique order number (`ORD-YYYYMMDD-XXXX`)
   - Atomically create order and update product stock

2. **Order Status Management**
   ```
   PENDING → CONFIRMED → PREPARING → READY → COMPLETED
       ↓         ↓           ↓          ↓
   CANCELLED ← CANCELLED ← CANCELLED ← CANCELLED
   ```
   - Status transitions are validated
   - No transitions allowed from COMPLETED or CANCELLED
   - Stock restoration on cancellation

3. **Stock Management**
   - Real-time stock decrements on order creation
   - Automatic stock restoration on order cancellation
   - Prevention of over-selling with availability checks

### Product Management

1. **Category System**
   - Automatic slug generation from category names
   - Hierarchical organization with display ordering
   - Active/inactive status for visibility control

2. **Inventory Tracking**
   - Real-time stock levels
   - Low stock monitoring capabilities
   - Promotional product flagging

### Customer Management

1. **Profile Management**
   - Comprehensive customer information
   - Optional phone number collection
   - Email-based identification system

2. **Order History**
   - Complete order tracking
   - Customer-order relationship management
   - Historical purchase analysis

### Real-time Order Events

The API provides Server-Sent Events (SSE) for real-time order notifications, perfect for cafe tablets and display systems.

#### Event Types
- **order_created**: Triggered when a new order is placed
- **order_updated**: Triggered when order status changes
- **order_cancelled**: Triggered when an order is cancelled

#### Event Data Structure
```json
{
  "type": "order_created",
  "order_id": 123,
  "order_number": "ORD-20250125-0001",
  "status": "PENDING",
  "total_amount": 15.99,
  "customer_name": "John Doe",
  "created_at": "2025-01-25T10:00:00Z",
  "updated_at": "2025-01-25T10:00:00Z"
}
```

#### Usage Examples

**For Tablets (API Key Authentication):**
```javascript
const eventSource = new EventSource('/api/v1/events/orders', {
  headers: { 'X-API-Key': 'your-api-key' }
});

eventSource.addEventListener('message', (event) => {
  const orderEvent = JSON.parse(event.data);
  updateTabletDisplay(orderEvent);
});
```

**For Web Applications (JWT Authentication):**
```javascript
const eventSource = new EventSource('/api/v1/events/orders', {
  headers: { 'Authorization': 'Bearer your-jwt-token' }
});

eventSource.onmessage = (event) => {
  const orderEvent = JSON.parse(event.data);
  console.log('New order event:', orderEvent);
};
```

## 🔒 Security Features

### Security Measures
- **Rate Limiting**: 50 requests per minute per IP
- **Input Validation**: Comprehensive request validation with automatic sanitization
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Token Security**: JWT with short expiration and refresh token rotation
- **API Security**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

### Best Practices Implemented
- **Principle of Least Privilege**: Role-based access control
- **Defense in Depth**: Multiple security layers
- **Secure by Default**: Authentication required by default
- **Token Rotation**: Automatic refresh token rotation
- **Audit Trail**: Comprehensive logging of all operations

## 📞 Support & Resources

### Development Resources
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

### Health Monitoring
The API includes comprehensive health checks accessible via `/api/health` for monitoring system status and performance.

### Logging
Structured logging with Winston provides detailed operation logs for debugging and monitoring. Logs include request tracking, authentication events, and business operation details.

---

## 📄 License

This project is [MIT licensed](LICENSE).

---

*Built with ❤️ using [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient and scalable server-side applications.*