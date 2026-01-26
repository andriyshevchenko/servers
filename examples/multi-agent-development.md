# Multi-Agent Development Example

This example demonstrates how to coordinate multiple specialized agents working on different parts of a large codebase, with all agents sharing context through Atomic Memory.

## 🎯 Scenario: Refactoring a Legacy Monolith

**Project**: Modernize "LegacyApp" - a 10-year-old Node.js monolith into a microservices architecture.

**Challenge**: The codebase is large, poorly documented, and requires multiple specialists working in parallel.

## 🏗️ Agent Team Structure

```
Main Architect Agent
├── Analysis Agent (understand existing code)
├── Database Migration Agent  
├── API Design Agent
├── Service Extraction Agent (Auth)
├── Service Extraction Agent (Users)
├── Service Extraction Agent (Orders)
├── Frontend Update Agent
├── Testing Agent
└── Documentation Agent
```

## 📋 Phase 1: Discovery & Planning

### Main Architect: Initial Assessment

**Prompt**:
```
I'm leading a project to modernize LegacyApp, a Node.js monolith into microservices. Save this project info to memory:

Project: LegacyApp Modernization
Goal: Extract microservices from monolith
Current Stack: Node.js 12, Express, MySQL, jQuery
Target Stack: Node.js 20, NestJS, PostgreSQL, React
Timeline: 3 months
Team: 6 specialist agents

Phases:
1. Discovery and analysis
2. Database migration planning
3. Service extraction
4. Frontend modernization
5. Testing and deployment

First task: Delegate code analysis to Analysis Agent.
```

### Analysis Agent: Code Discovery

**Prompt**:
```
I'm the Analysis Agent for LegacyApp Modernization. Read memory for project context, then help me analyze:
- Main application entry points
- Database schema and queries
- API endpoints and routing
- Business logic patterns
- Dependencies and their versions
- Potential service boundaries
```

**After Analysis - Save to Memory**:
```
Code analysis complete. Save findings to memory:

Application Structure:
- Entry point: server.js (2500 lines)
- Routes in /routes directory (15 files)
- Business logic mixed with route handlers
- No clear separation of concerns
- 47 API endpoints identified

Service Boundary Candidates:
- Auth service: /routes/auth.js, /routes/users.js
- Order service: /routes/orders.js, /routes/cart.js
- Product service: /routes/products.js, /routes/inventory.js
- Payment service: /routes/payments.js, /routes/billing.js

Database Schema:
- 23 tables in MySQL
- No foreign key constraints (!)
- Inconsistent naming conventions
- Heavy use of JOIN queries in application code

Critical Dependencies:
- express@4.17.1 (upgrade available)
- mysql@2.18.1 (migrate to PostgreSQL planned)
- passport@0.4.1 (used for auth)
- stripe@8.x (outdated)

Tech Debt Identified:
- No unit tests
- No API documentation
- Hardcoded configuration
- Inconsistent error handling
- SQL injection vulnerabilities in 3 endpoints
```

## 📋 Phase 2: Database Strategy

### Database Migration Agent

**Prompt**:
```
I'm migrating LegacyApp from MySQL to PostgreSQL. Read memory for:
- Current database schema (23 tables)
- Service boundaries identified
- Application structure

Design a migration strategy that enables gradual microservices extraction.
```

**Save to Memory**:
```
Database migration strategy complete. Save to memory:

Migration Approach: Multi-Database Phase
Phase 1: Keep MySQL for monolith
Phase 2: New PostgreSQL databases per microservice
Phase 3: Gradual data migration
Phase 4: Deprecate MySQL

Database Per Service:
- auth_db: users, sessions, roles, permissions
- orders_db: orders, order_items, shipping
- products_db: products, categories, inventory
- payments_db: transactions, payment_methods

Migration Tools:
- Prisma for PostgreSQL schema management
- Custom migration scripts in /migrations
- Data sync scripts for transition period

Cross-Database Concerns:
- Event-driven updates using RabbitMQ
- Saga pattern for distributed transactions
- Eventual consistency acceptable
- API gateway handles service discovery
```

## 📋 Phase 3: Service Extraction

### Auth Service Agent

**Prompt**:
```
I'm extracting the Auth service from LegacyApp. Read memory for:
- Service boundaries (Auth service details)
- Database strategy (auth_db)
- Current auth implementation

Build a standalone auth microservice.
```

**Save to Memory**:
```
Auth service extracted. Save to memory:

Auth Service:
- Framework: NestJS 10
- Location: /services/auth-service
- Port: 3001
- Database: PostgreSQL (auth_db)

API Endpoints:
- POST /auth/login
- POST /auth/register  
- POST /auth/logout
- POST /auth/refresh
- GET /auth/verify
- GET /users/:id
- PATCH /users/:id

Authentication:
- JWT tokens with RS256
- Refresh token rotation
- Token expiry: 15 minutes (access), 7 days (refresh)
- Passwords hashed with bcrypt (12 rounds)

Database Schema (Prisma):
- User model: id, email, password, name, role, created_at, updated_at
- Session model: id, user_id, refresh_token, expires_at
- Role enum: USER, ADMIN, MODERATOR

Environment Variables:
- DATABASE_URL
- JWT_SECRET
- JWT_PUBLIC_KEY
- JWT_PRIVATE_KEY
- PORT=3001

Migration Status:
- Service code complete
- Tests written (87% coverage)
- Ready for integration testing
- Swagger docs at /api/docs
```

### Orders Service Agent

**Prompt**:
```
Extracting Orders service from LegacyApp. Read memory for project patterns established by Auth service. Follow same structure.
```

**Save to Memory**:
```
Orders service extracted. Save to memory:

Orders Service:
- Framework: NestJS 10
- Location: /services/orders-service
- Port: 3002
- Database: PostgreSQL (orders_db)

API Endpoints:
- GET /orders (list user orders)
- GET /orders/:id
- POST /orders (create order)
- PATCH /orders/:id/status
- DELETE /orders/:id
- GET /orders/:id/items

Business Logic:
- Order state machine: PENDING → PROCESSING → SHIPPED → DELIVERED
- Inventory check before order creation
- Payment verification required
- Email notifications on status changes

Database Schema:
- Order model: id, user_id, total, status, created_at, updated_at
- OrderItem model: id, order_id, product_id, quantity, price_at_purchase
- Status enum: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

Integration Points:
- Calls Auth service to verify user
- Calls Product service to check inventory
- Calls Payment service to verify payment
- Emits events to message queue

Events Published:
- order.created
- order.status_changed
- order.cancelled

Migration Status:
- Service functional
- Integration with Auth service: ✓
- Tests: 82% coverage
- Ready for Products service integration
```

## 📋 Phase 4: API Gateway

### API Design Agent

**Prompt**:
```
Design an API Gateway to coordinate microservices for LegacyApp modernization. Read memory for all extracted services and their endpoints.
```

**Save to Memory**:
```
API Gateway implemented. Save to memory:

API Gateway:
- Framework: Express + http-proxy-middleware
- Location: /services/api-gateway
- Port: 3000 (main entry point)

Route Configuration:
- /api/auth/* → Auth Service (3001)
- /api/orders/* → Orders Service (3002)
- /api/products/* → Products Service (3003)
- /api/payments/* → Payments Service (3004)

Features:
- JWT validation on protected routes
- Rate limiting (100 req/min per user)
- Request/response logging
- CORS configuration
- Health checks for all services

Middleware Pipeline:
1. CORS headers
2. Request logging
3. Rate limiting
4. JWT validation (if protected)
5. Route to microservice
6. Response formatting

Health Monitoring:
- GET /health (gateway status)
- GET /health/services (all services status)
- Checks every 30 seconds
- Circuit breaker pattern for failed services

Environment:
- AUTH_SERVICE_URL=http://localhost:3001
- ORDERS_SERVICE_URL=http://localhost:3002
- PRODUCTS_SERVICE_URL=http://localhost:3003
- PAYMENTS_SERVICE_URL=http://localhost:3004
- JWT_SECRET (shared with auth service)
```

## 📋 Phase 5: Frontend Migration

### Frontend Update Agent

**Prompt**:
```
Modernize frontend for LegacyApp. Read memory for:
- New API Gateway structure
- Microservices endpoints
- Auth implementation

Migrate from jQuery to React.
```

**Save to Memory**:
```
Frontend modernization complete. Save to memory:

Frontend Stack:
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for API calls
- Zustand for state management
- React Router for navigation
- Tailwind CSS for styling

Application Structure:
- /src/pages - Route components
- /src/components - Reusable components
- /src/api - API client functions
- /src/hooks - Custom React hooks
- /src/stores - Zustand stores
- /src/types - TypeScript types

API Integration:
- Base URL: http://localhost:3000/api
- Auth token stored in localStorage
- Automatic token refresh
- Request/response interceptors
- Error handling with toast notifications

Key Features:
- Protected routes with auth check
- Product catalog with search/filters
- Shopping cart management
- Checkout flow
- Order history
- User profile management

State Management:
- Auth store: user, token, login/logout
- Cart store: items, add/remove, quantities
- UI store: modals, notifications, loading states

Migration Status:
- All jQuery removed
- All pages converted to React
- API calls updated to new gateway
- Tests: 75% coverage
- Performance improved (lighthouse score: 92)
```

## 📋 Phase 6: Testing & Quality Assurance

### Testing Agent

**Prompt**:
```
Create comprehensive testing strategy for modernized LegacyApp. Read memory for all services and their endpoints. Ensure quality before production.
```

**Save to Memory**:
```
Testing infrastructure complete. Save to memory:

Testing Strategy:
- Unit tests: Jest + Testing Library
- Integration tests: Supertest
- E2E tests: Playwright
- Load tests: k6
- Security tests: OWASP ZAP

Test Coverage:
- Auth Service: 87%
- Orders Service: 82%
- Products Service: 89%
- Payments Service: 91%
- API Gateway: 78%
- Frontend: 75%

Test Automation:
- CI pipeline runs all tests on PR
- E2E tests run nightly
- Load tests run weekly
- Security scans on every deployment

Test Environments:
- Local: Docker Compose (all services)
- Staging: Kubernetes cluster
- Production: Blue-green deployment

Critical Test Scenarios:
✓ User registration and login
✓ Browse products and search
✓ Add items to cart
✓ Complete checkout with payment
✓ Track order status
✓ Admin product management
✓ Concurrent order processing
✓ Service failure recovery

Performance Benchmarks:
- API response time: < 200ms (p95)
- Page load time: < 2s
- Concurrent users: 1000+
- Orders per second: 50+
```

## 🎯 Key Patterns for Multi-Agent Development

### 1. **Clear Handoffs**
Each agent reads memory, completes work, saves detailed results for next agent.

### 2. **Consistent Patterns**
Early agents establish patterns (NestJS, Prisma, testing) that others follow.

### 3. **Integration Points**
Document how services communicate (API calls, events, shared contracts).

### 4. **Progress Tracking**
Regular memory snapshots show what's done, what's in progress, what's next.

### 5. **Knowledge Reuse**
Later agents benefit from earlier agents' discoveries and decisions.

## 💡 Memory Organization Tips

### Entity Types Used
- `Project` - Overall project
- `Service` - Each microservice
- `Database` - Database instances
- `API` - Endpoints and routes
- `Component` - Frontend components
- `Tool` - Development tools
- `Environment` - Deployment environments

### Relation Types Used
- `extracted_from` - Service extracted from monolith
- `depends_on` - Service dependencies
- `connects_to` - Database connections
- `routes_to` - API Gateway routing
- `implements` - Feature implementations

### Observation Patterns
```
✓ "Port 3001 for auth service"
✓ "JWT expiry is 15 minutes"
✓ "Uses Prisma ORM"
✗ "Service uses NestJS on port 3001 with JWT and Prisma" (too broad)
```

## 🔄 Benefits Realized

1. **Parallel Work**: 6 agents worked simultaneously without conflicts
2. **Consistent Quality**: Shared patterns maintained across all services
3. **Full Context**: No information lost between agent transitions
4. **Faster Onboarding**: New agents quickly understood project state
5. **Better Documentation**: Memory serves as living project documentation

This multi-agent approach reduced the project timeline from estimated 6 months to 3 months!
