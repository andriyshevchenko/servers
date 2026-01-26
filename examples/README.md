# Examples

This directory contains practical examples demonstrating how to use Atomic Memory MCP Server in real-world scenarios.

## 📚 Available Examples

### 1. [E-Commerce Project](./ecommerce-project.md)
Building a full-stack e-commerce application with multiple agents handling different aspects of the project.

### 2. [Research Assistant](./research-assistant.md)
Using memory to accumulate research findings across multiple conversation sessions.

### 3. [Multi-Agent Development](./multi-agent-development.md)
Coordinating multiple specialized agents working on different parts of a large codebase.

### 4. [Learning and Tutorials](./learning-tutorials.md)
Tracking progress through learning materials and building knowledge over time.

## 🚀 Quick Start Example

Here's a minimal example to get started:

### Step 1: Save Information
```
I'm starting a new project called "TaskTracker". Please save to memory:
- Project name: TaskTracker
- Type: Todo application
- Stack: React + Node.js + PostgreSQL
- Features: Task management, user authentication, real-time updates
```

### Step 2: Work on a Feature (Same or New Chat)
```
I'm working on TaskTracker. Please read the memory and help me set up authentication.
```

### Step 3: Save Progress
```
We've completed authentication. Please save to memory:
- Authentication: JWT-based with refresh tokens
- User schema: id, email, password_hash, created_at
- Auth endpoints: /api/login, /api/register, /api/refresh
- Middleware: authMiddleware in src/middleware/auth.js
```

### Step 4: Continue or Delegate
```
Please delegate the database setup to a new agent. Save all necessary context about our PostgreSQL needs and authentication schema to memory.
```

## 💡 Tips for Using Examples

- Start with the simplest example that matches your use case
- Copy and adapt the prompts to your specific needs
- Pay attention to the atomic facts principle - keep observations small and focused
- Use thread IDs to separate different projects or contexts
- Regular snapshots (every 10-20 messages) help maintain context

## 🤝 Contributing Examples

Have a great use case? We'd love to add more examples! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
