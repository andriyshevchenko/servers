# E-Commerce Project Example

This example demonstrates building a full-stack e-commerce platform using Atomic Memory MCP to coordinate work across multiple agents and sessions.

## 🎯 Project Overview

**Goal**: Build "ShopFast" - an e-commerce platform with product listings, shopping cart, checkout, and admin dashboard.

**Team Structure**:
- Main coordination agent
- Backend API agent  
- Frontend UI agent
- Database agent
- Payment integration agent
- DevOps agent

## 📝 Session 1: Project Initialization (Main Agent)

### Prompt 1: Initialize Project
```
I'm starting a new e-commerce project called "ShopFast". Please save this to memory:

Project Details:
- Name: ShopFast
- Type: E-commerce platform
- Goal: Fast, modern online shopping experience

Tech Stack:
- Frontend: Next.js 14 with App Router
- Styling: Tailwind CSS
- Backend: Next.js API routes
- Database: PostgreSQL with Prisma
- Auth: NextAuth.js
- Payments: Stripe
- Hosting: Vercel

Key Features:
- Product browsing and search
- Shopping cart
- User authentication
- Checkout with Stripe
- Order history
- Admin dashboard
```

### Prompt 2: Plan Architecture
```
Help me plan the architecture for ShopFast. After we finalize, save the architecture decisions to memory.
```

**Expected Memory Additions**:
```
Entities:
- ShopFast (Project)
- Next.js 14 (Framework)
- PostgreSQL (Database)
- Stripe (PaymentProvider)
- Vercel (HostingPlatform)

Relations:
- ShopFast uses Next.js 14
- ShopFast uses PostgreSQL
- ShopFast uses Stripe
- ShopFast deploys_to Vercel

Observations (on ShopFast):
- "App Router for modern Next.js features"
- "Server components for better performance"
- "API routes in /app/api directory"
- "Prisma ORM for type-safe database access"
```

## 📝 Session 2: Database Setup (Database Agent)

### Prompt: Read Context & Setup Database
```
I've been assigned to set up the database for ShopFast. Please read the memory to understand:
- What database technology we're using
- What features the application needs
- Any existing schema decisions

Then help me design and implement the database schema.
```

**Expected Actions**:
1. Agent reads memory and learns: PostgreSQL, Prisma, e-commerce features needed
2. Designs schema for: Users, Products, Orders, OrderItems, Cart, CartItems
3. Creates Prisma schema
4. Generates and runs migrations

### Save Progress
```
We've completed the database setup. Please save to memory:

Database Schema:
- User table: id, email, password_hash, name, created_at, updated_at
- Product table: id, name, description, price, image_url, stock, category, created_at
- Order table: id, user_id, total, status, stripe_payment_id, created_at
- OrderItem table: id, order_id, product_id, quantity, price_at_purchase
- Cart table: id, user_id, created_at, updated_at
- CartItem table: id, cart_id, product_id, quantity

Database Configuration:
- Prisma client generated in /prisma/client
- Connection string in DATABASE_URL env variable
- Migrations in /prisma/migrations
- Seed script in /prisma/seed.ts
```

## 📝 Session 3: Authentication (Backend Agent)

### Prompt: Implement Auth
```
I need to implement authentication for ShopFast. Please read memory for:
- Auth technology choice (NextAuth.js)
- User schema
- Project structure

Then help me set up NextAuth.js with email/password and Google OAuth.
```

### Save Progress
```
Authentication is complete. Save to memory:

Auth Implementation:
- NextAuth.js configured in /app/api/auth/[...nextauth]/route.ts
- Email/password provider with bcrypt hashing
- Google OAuth provider configured
- JWT strategy for sessions
- Session duration: 30 days
- Custom pages: /auth/signin, /auth/signup
- Protected routes use middleware in /middleware.ts

Environment Variables Needed:
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
```

## 📝 Session 4: Product Catalog (Frontend Agent)

### Prompt: Build Product Pages
```
I'm building the product catalog UI for ShopFast. Read memory for:
- Design system (Tailwind CSS)
- Database schema (Product table)
- Project structure

Help me create product listing and detail pages.
```

### Save Progress
```
Product catalog UI complete. Save to memory:

Frontend Components:
- ProductCard component in /components/ProductCard.tsx
- ProductGrid component in /components/ProductGrid.tsx
- ProductDetail page in /app/products/[id]/page.tsx
- Product list page in /app/products/page.tsx
- Search bar component in /components/SearchBar.tsx

Features Implemented:
- Grid layout with responsive design
- Product images with lazy loading
- Price formatting with currency
- Category filtering
- Search functionality
- Product detail view with "Add to Cart" button
- Stock availability display
```

## 📝 Session 5: Shopping Cart (Frontend + Backend Agent)

### Prompt: Implement Cart
```
Working on ShopFast shopping cart. Read memory for cart schema, auth setup, and frontend patterns. Implement cart functionality.
```

### Save Progress
```
Shopping cart complete. Save to memory:

Cart API:
- GET /api/cart - Fetch user's cart
- POST /api/cart/items - Add item to cart
- PUT /api/cart/items/[id] - Update item quantity
- DELETE /api/cart/items/[id] - Remove item

Cart Components:
- CartProvider context in /contexts/CartContext.tsx
- CartIcon with item count in /components/CartIcon.tsx
- CartDrawer slide-out panel in /components/CartDrawer.tsx
- CartItem component in /components/CartItem.tsx

Cart Features:
- Persistent cart across sessions
- Real-time quantity updates
- Automatic stock validation
- Price calculations with totals
- Guest cart stored in localStorage
- Cart merge on user login
```

## 📝 Session 6: Stripe Integration (Payment Agent)

### Prompt: Setup Payments
```
I need to integrate Stripe payments for ShopFast checkout. Read memory for:
- Payment provider (Stripe)
- Order schema
- Cart implementation

Set up Stripe checkout flow.
```

### Save Progress
```
Stripe integration complete. Save to memory:

Stripe Setup:
- Stripe SDK installed: stripe@14.x
- Checkout API in /app/api/checkout/route.ts
- Webhook handler in /app/api/webhooks/stripe/route.ts
- Success page: /checkout/success
- Cancel page: /checkout/cancel

Payment Flow:
1. User clicks "Checkout" from cart
2. POST to /api/checkout creates Stripe session
3. Redirect to Stripe hosted checkout
4. Webhook confirms payment
5. Order created in database
6. Cart cleared
7. User redirected to success page

Environment Variables:
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
```

## 📝 Session 7: Admin Dashboard (Backend + Frontend Agent)

### Prompt: Build Admin Panel
```
Create admin dashboard for ShopFast. Read memory for all features implemented. Build admin UI for managing products, orders, and users.
```

### Save Progress
```
Admin dashboard complete. Save to memory:

Admin Routes:
- /admin/dashboard - Overview with stats
- /admin/products - Product management
- /admin/orders - Order management
- /admin/users - User management

Admin Features:
- Product CRUD operations
- Order status updates
- User role management
- Sales analytics
- Inventory tracking
- Search and filters

Security:
- Admin role check in middleware
- Protected API routes
- Admin flag in User table
```

## 📝 Session 8: Deployment (DevOps Agent)

### Prompt: Deploy to Production
```
Time to deploy ShopFast to Vercel. Read memory for all environment variables needed and tech stack. Help with deployment.
```

### Save Progress
```
Deployment complete. Save to memory:

Deployment:
- Platform: Vercel
- Production URL: shopfast.vercel.app
- Database: Supabase PostgreSQL
- Environment: All secrets configured in Vercel dashboard

Deployment Configuration:
- Build command: npm run build
- Output directory: .next
- Node version: 20.x
- Environment variables: 12 total configured
- Automatic deployments on main branch
- Preview deployments on PRs

Post-Deployment:
- DNS configured
- SSL certificate active
- Database migrations run
- Stripe webhook endpoint registered
- Google OAuth callback URLs updated
```

## 🎯 Key Takeaways

### Memory Organization
- **Main entities**: Project, frameworks, services, features
- **Relations**: "uses", "deploys_to", "depends_on"
- **Atomic facts**: Each observation is specific and actionable

### Multi-Agent Benefits
1. **Specialized focus**: Each agent tackles their domain
2. **Full context**: All agents access shared memory
3. **Efficient delegation**: Clear handoffs with context
4. **Progress tracking**: Complete project history in memory

### Best Practices Demonstrated
- Regular memory snapshots after major milestones
- Atomic observations (one fact per observation)
- Clear entity types (Component, API, Feature, Config)
- Descriptive relation types
- Environment variables documented
- File paths included for reference

## 🔄 Maintenance & Updates

When updating features later:

```
I need to add product reviews to ShopFast. Please read memory to understand the current:
- Product schema
- Frontend components
- API patterns

Then help me implement reviews.
```

The memory system ensures any agent can pick up where others left off, even weeks or months later!
