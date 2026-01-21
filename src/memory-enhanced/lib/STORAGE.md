# Storage Abstraction

This directory contains the storage abstraction layer for the MCP Memory Graph Enhanced project. The abstraction allows for different storage backends to be used interchangeably.

## Architecture

The storage abstraction consists of:

1. **`IStorageAdapter`** interface - Defines the contract for storage implementations
2. **`JsonlStorageAdapter`** - Default implementation using JSONL (JSON Lines) files
3. **`Neo4jStorageAdapter`** - Skeleton implementation for Neo4j graph database (future)

## Interface

All storage adapters must implement the `IStorageAdapter` interface:

```typescript
interface IStorageAdapter {
  // Load the entire knowledge graph from storage
  loadGraph(): Promise<KnowledgeGraph>;
  
  // Save the entire knowledge graph to storage
  saveGraph(graph: KnowledgeGraph): Promise<void>;
  
  // Initialize the storage (create directories, connections, etc.)
  initialize(): Promise<void>;
}
```

## Default Implementation: JSONL

The `JsonlStorageAdapter` stores data in JSON Lines format:
- One file per agent thread: `thread-{agentThreadId}.jsonl`
- Each line is a JSON object representing an entity or relation
- Atomic file operations ensure data consistency

### Usage (default)

```typescript
import { KnowledgeGraphManager } from './index.js';

// Uses JSONL storage by default
const manager = new KnowledgeGraphManager('/path/to/memory-data');

// Note: Storage is automatically initialized on first use
// You can now use the manager
await manager.createEntities([/* ... */]);
```

## Custom Storage Adapters

You can create your own storage adapter by implementing the `IStorageAdapter` interface:

```typescript
import { IStorageAdapter, KnowledgeGraphManager } from './index.js';

class MyCustomStorageAdapter implements IStorageAdapter {
  async loadGraph(): Promise<KnowledgeGraph> {
    // Your implementation
  }
  
  async saveGraph(graph: KnowledgeGraph): Promise<void> {
    // Your implementation
  }
  
  async initialize(): Promise<void> {
    // Your implementation
  }
}

// Use custom adapter
const customStorage = new MyCustomStorageAdapter();
const manager = new KnowledgeGraphManager('', customStorage);
```

## Example: In-Memory Storage

```typescript
import { IStorageAdapter, KnowledgeGraphManager } from './index.js';

class InMemoryStorageAdapter implements IStorageAdapter {
  private graph: KnowledgeGraph = { entities: [], relations: [] };

  async loadGraph(): Promise<KnowledgeGraph> {
    return { ...this.graph };
  }

  async saveGraph(graph: KnowledgeGraph): Promise<void> {
    this.graph = { ...graph };
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }
}

const manager = new KnowledgeGraphManager('', new InMemoryStorageAdapter());
```

## Future: Neo4j Storage

A full production implementation is provided in `neo4j-storage-adapter.ts`:

```typescript
import { Neo4jStorageAdapter, KnowledgeGraphManager } from './index.js';

// Create Neo4j adapter
const neo4jAdapter = new Neo4jStorageAdapter({
  uri: 'neo4j://localhost:7687',
  username: 'neo4j',
  password: 'password',
  database: 'neo4j'  // Optional
});

// Initialize connection
await neo4jAdapter.initialize();

// Use with manager
const manager = new KnowledgeGraphManager('', neo4jAdapter);

// All operations now use Neo4j
await manager.createEntities([/* ... */]);
const graph = await manager.readGraph();

// Clean up when done
await neo4jAdapter.close();
```

### Environment-Based Configuration

The server automatically detects Neo4j configuration:

```bash
# Set environment variables
export NEO4J_URI=neo4j://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=password
export NEO4J_DATABASE=neo4j  # Optional

# Start server - automatically uses Neo4j
npx mcp-server-memory-enhanced
```

If Neo4j is not configured or connection fails, the server automatically falls back to JSONL storage.

### Docker Compose Setup

Use the provided `docker-compose.yml` for local development:

```bash
docker-compose up
```

This starts:
- Neo4j 5.15.0 (with Browser at http://localhost:7474)
- MCP Memory Enhanced Server (configured to use Neo4j)

### Testing

Run E2E tests with Neo4j:

```bash
# Start Neo4j
docker-compose up -d neo4j

# Run tests
export NEO4J_URI=neo4j://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=testpassword
npm test -- neo4j-e2e.test.ts

# Or use the test script
./test-neo4j.sh
```

## Testing

See `__tests__/storage-abstraction.test.ts` for examples of:
- Testing with the default JSONL adapter
- Testing with a custom in-memory adapter
- Direct adapter testing

## Benefits

The storage abstraction provides:

1. **Flexibility** - Easy to switch storage backends without changing application code
2. **Testability** - Use in-memory storage for fast unit tests
3. **Extensibility** - Add new storage backends (Neo4j, PostgreSQL, MongoDB, etc.)
4. **Maintainability** - Separation of concerns between business logic and storage
5. **Performance** - Optimize storage for specific use cases (graph DB for complex queries)

## Migration Guide

To migrate to a different storage backend:

1. Implement `IStorageAdapter` for your target storage
2. Test thoroughly with existing test suite
3. Create a migration script to move data from JSONL to new storage
4. Update initialization code to use new adapter
5. All existing functionality continues to work unchanged
