# Demo E-Commerce Backend

A full-featured e-commerce backend API built with NestJS, TypeScript, and PostgreSQL (TypeORM). This application provides comprehensive functionality for user authentication, product management, shopping cart operations, and order processing with email notifications.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Key Architectural Decisions](#key-architectural-decisions)
- [Assumptions Made](#assumptions-made)

## 🛠 Tech Stack

### Core Framework & Language
- **NestJS** (v11.0.1) - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment

### Database & ORM
- **PostgreSQL** - Relational database
- **TypeORM** (v0.3.28) - Object-Relational Mapping
- **Decimal.js** - Precise decimal calculations for prices

### Authentication & Security
- **Passport** - Authentication middleware
- **Passport-JWT** - JWT authentication strategy
- **Passport-Local** - Local authentication strategy
- **bcrypt** (v6.0.0) - Password hashing

### Validation & Data Handling
- **class-validator** (v0.14.3) - DTO validation
- **class-transformer** (v0.5.1) - Object transformation

### External Communication
- **Axios** (v1.13.5) - HTTP client for API requests
- **@nestjs/axios** (v4.0.1) - NestJS Axios integration

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## ✨ Features

### User Management
- User registration with email verification (OTP-based)
- Role-based access control (Admin/Customer)
- JWT-based authentication
- Password hashing with bcrypt
- Email OTP with 5-minute expiry
- Resend OTP functionality

### Product Management (Admin Only)
- Create, read, update, and delete products
- Product inventory tracking
- Admin ownership of products

### Shopping Cart
- Add/remove products from cart
- Update item quantities
- View cart contents
- Clear entire cart
- Automatic cart creation per user

### Order Management
- Create orders from cart items
- Stock validation and pessimistic locking
- Transactional order processing
- Order status tracking (8 states)
- Order cancellation with stock restoration
- Email notifications for order confirmation/cancellation
- View order history
- Admin order status updates

### Email Notifications
- Order confirmation emails
- Order cancellation emails
- Email verification OTP
- OTP resend emails

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Email API service (for email functionality)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ank-p-turza/demo-ecommerce-backend.git
   cd demo-ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory based on `example.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=demo_ecom
   JWT_SECRET_KEY=your_jwt_secret_key
   EMAIL_API_URL=your_email_api_url
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb demo_ecom
   ```
   
   The application will automatically create tables using TypeORM's `synchronize: true` option (development only).

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the API**
   
   The API will be available at: `http://localhost:3000`

### Available Scripts

#### Installation
```bash
# Install all dependencies
npm install
```

#### Build
```bash
# Build the project for production
npm run build
```

#### Run Application
```bash
# Start application in development mode with hot reload
npm run start:dev

# Start application in regular mode
npm run start

# Start application in production mode (requires build first)
npm run start:prod

# Start application in debug mode
npm run start:debug
```

#### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate test coverage report
npm run test:cov

# Run tests in debug mode
npm run test:debug
```

#### Code Quality
```bash
# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint
```

## 🗄 Database Schema

### Entity Relationship Diagram

```

    users {
        int id PK
        varchar name
        varchar email UK
        varchar password
        enum role
        boolean is_verified
        varchar otp
        timestamptz otp_expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    products {
        int id PK
        text name
        text description
        numeric price
        int quantity
        int owner_id FK
    }

    carts {
        int id PK
        int user_id FK
    }

    cartitems {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
    }

    orders {
        int id PK
        int user_id FK
        decimal totalAmount
        enum status
        text shippingAddress
        text notes
        timestamp createdAt
        timestamp updatedAt
    }

    orderitems {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal priceAtPurchase
        decimal subtotal
    }
```

### Database Tables

#### users
- Stores user account information
- Supports role-based access (ADMIN/CUSTOMER)
- Email verification with OTP (5-minute expiry)
- Password hashed with bcrypt

#### products
- Product catalog managed by admins
- Tracks inventory quantity
- Linked to admin owner

#### carts & cartitems
- One cart per user (1:1 relationship)
- Cart items reference products
- Supports quantity adjustments

#### orders & orderitems
- Immutable order records
- Captures price at purchase time
- 8 order statuses: PENDING, PAYMENT_PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
- Automatic stock management

### Enums

**RoleEnum**: `ADMIN`, `CUSTOMER`

**OrderStatus**: `PENDING`, `PAYMENT_PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - Register new user (sends OTP email)
- `POST /auth/signin` - Login user (returns JWT token)
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/resend-otp` - Resend OTP email
- `GET /auth/test` - Test endpoint (Admin only)

### Products (`/products`)
- `GET /products` - Get all products (public)
- `GET /products/:id` - Get product by ID (public)
- `POST /products` - Create product (Admin only, requires JWT)
- `PATCH /products/:id` - Update product (Admin only, requires JWT)
- `DELETE /products/:id` - Delete product (Admin only, requires JWT)

### Cart (`/cart`)
- `GET /cart` - Get user cart (requires JWT)
- `POST /cart/items` - Add item to cart (requires JWT)
- `PATCH /cart/items/:cartItemId` - Update item quantity (requires JWT)
- `DELETE /cart/items/:cartItemId` - Remove item from cart (requires JWT)
- `DELETE /cart` - Clear entire cart (requires JWT)

### Orders (`/orders`)
- `POST /orders` - Create order (requires JWT, sends email)
- `GET /orders` - Get user order history (requires JWT)
- `GET /orders/:orderId` - Get specific order (requires JWT)
- `PATCH /orders/:orderId/cancel` - Cancel order (requires JWT, sends email)
- `PATCH /orders/:orderId/status` - Update order status (Admin only, requires JWT)

### Authentication Headers
```
Authorization: Bearer <jwt_token>
```

## 🏗 Key Architectural Decisions

### 1. **Module-Based Architecture**
   - Separated concerns into distinct modules (Auth, Users, Products, Cart, Orders)
   - Each module is self-contained with its own controllers, services, entities, and DTOs
   - Promotes maintainability and scalability

### 2. **Repository Pattern with TypeORM**
   - Used TypeORM repositories for database operations
   - Provides abstraction over database layer
   - Enables easy testing and database switching

### 3. **JWT-Based Authentication**
   - Stateless authentication using JWT tokens
   - Tokens expire after 1 hour (3600 seconds)
   - Passport strategies for local and JWT authentication

### 4. **Role-Based Access Control (RBAC)**
   - Custom decorators (`@Roles`) for route protection
   - Guards (`JwtAuthGuard`, `RolesGuard`) for authorization
   - Two roles: ADMIN (product management) and CUSTOMER (shopping)

### 5. **Transaction Management**
   - Used QueryRunner for complex operations (orders, cancellations)
   - Pessimistic locking prevents race conditions on inventory
   - Ensures data consistency with automatic rollback on errors

### 6. **Email Verification with OTP**
   - 8-character alphanumeric OTP
   - 5-minute expiry (set in BeforeInsert hook)
   - Non-blocking: email failures don't prevent order creation

### 7. **Decimal Precision for Money**
   - Used `Decimal.js` for accurate financial calculations
   - Prevents floating-point arithmetic errors
   - Stored as `decimal(10,2)` in database

### 8. **DTOs with Validation**
   - class-validator for automatic request validation
   - ValidationPipe for DTO transformation
   - Type-safe request/response handling

### 9. **Separation of Concerns**
   - Business logic in services
   - HTTP handling in controllers
   - Data access in repositories
   - Authentication logic in Auth module (not Users)

### 10. **Email Service Integration**
   - Abstracted email sending to EmailApi service
   - Supports external email API
   - Error handling doesn't block main operations

## 📝 Assumptions Made

### 1. **Business Logic Assumptions**
   - Each user can have only one cart
   - Admin users can only manage their own products
   - Price is captured at purchase time (orderitems.priceAtPurchase)
   - Orders can only be cancelled in PENDING or PAYMENT_PENDING status
   - Stock is automatically deducted on order creation and restored on cancellation

### 2. **Security Assumptions**
   - Passwords must contain: uppercase, lowercase, digit, symbol, min 8 characters
   - JWT secret is strong and kept secure
   - HTTPS is used in production
   - Database credentials are properly secured

### 3. **Email System Assumptions**
   - External email API service is available and configured
   - Email delivery is asynchronous and may fail without affecting operations
   - Users have valid email addresses
   - OTP emails are delivered within 5 minutes

### 4. **Database Assumptions**
   - PostgreSQL is properly configured and accessible
   - `synchronize: true` is only used in development (manual migrations in production)
   - Database has sufficient storage and performance
   - Proper indexes exist for frequently queried fields

### 5. **User Flow Assumptions**
   - Users must verify email before full access (though not enforced in current implementation)
   - Users are logged in via JWT for protected routes
   - Admin role is assigned during registration (not through promotion)

### 6. **Inventory Management Assumptions**
   - Negative inventory is prevented
   - Stock checks happen at order creation, not cart addition
   - Concurrent order processing is handled via pessimistic locks
   - No reservation system for cart items

### 7. **Order Management Assumptions**
   - Orders are immutable once created (status can change, but items cannot)
   - Total amount includes all items, no taxes or shipping fees
   - Shipping address is stored as plain text
   - Order history is kept indefinitely

### 8. **Error Handling Assumptions**
   - Email failures are logged but don't throw errors
   - Database errors trigger transaction rollback
   - All user-facing errors provide meaningful messages

### 9. **Performance Assumptions**
   - Application handles moderate concurrent load
   - Database connection pooling is managed by TypeORM
   - No caching layer implemented (relies on database performance)

### 10. **Development vs Production**
   - `synchronize: true` should be disabled in production
   - Environment variables are securely managed
   - Logging is more verbose in development
   - Error stack traces are hidden in production

## 📄 License

This project is licensed under UNLICENSED.

## 👤 Author

**Anka Paul Turza**

---

For questions and support, please open an issue in the repository.
