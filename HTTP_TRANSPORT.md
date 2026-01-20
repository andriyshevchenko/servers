# HTTP Transport Usage Examples

## Starting the Server with HTTP Transport

```bash
# Start with default settings (port 3000, localhost)
MCP_TRANSPORT=http npx mcp-server-memory-enhanced

# Start on custom port
MCP_TRANSPORT=http PORT=8080 npx mcp-server-memory-enhanced

# Start on custom host and port
MCP_TRANSPORT=http HOST=0.0.0.0 PORT=8080 npx mcp-server-memory-enhanced

# With custom memory directory
MCP_TRANSPORT=http PORT=3000 MEMORY_DIR_PATH=/path/to/data npx mcp-server-memory-enhanced
```

## Using the HTTP API

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "version": "0.2.0",
  "transport": "http"
}
```

### Initialize Connection

The MCP protocol over HTTP uses Server-Sent Events (SSE) for streaming responses. Clients must accept both `application/json` and `text/event-stream` content types.

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "my-client",
        "version": "1.0.0"
      }
    }
  }'
```

Response (SSE format):
```
event: message
data: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"memory-enhanced-server","version":"0.2.0"}},"jsonrpc":"2.0","id":1}
```

### List Available Tools

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

### Call a Tool (Create Entities)

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "create_entities",
      "arguments": {
        "entities": [
          {
            "name": "Alice",
            "entityType": "person",
            "observations": ["works at Tech Corp"],
            "agentThreadId": "thread-001",
            "timestamp": "2024-01-20T10:00:00Z",
            "confidence": 0.9,
            "importance": 0.8
          }
        ]
      }
    }
  }'
```

## Using with MCP Clients

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "memory-enhanced": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Python Client Example

```python
import requests
import json

# Initialize connection
response = requests.post(
    "http://localhost:3000/mcp",
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
    },
    json={
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "python-client",
                "version": "1.0.0"
            }
        }
    },
    stream=True
)

# Parse SSE response
for line in response.iter_lines():
    if line.startswith(b'data: '):
        data = json.loads(line[6:])
        print(json.dumps(data, indent=2))
```

### Node.js Client Example

```javascript
const fetch = require('node-fetch');

async function initializeMCP() {
  const response = await fetch('http://localhost:3000/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'node-client',
          version: '1.0.0'
        }
      }
    })
  });

  const text = await response.text();
  console.log(text);
}

initializeMCP();
```

## Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MCP_TRANSPORT` | Transport mode (`stdio` or `http`) | `stdio` | `http` |
| `PORT` | HTTP server port | `3000` | `8080` |
| `HOST` | HTTP server host | `127.0.0.1` | `0.0.0.0` |
| `MEMORY_DIR_PATH` | Directory for storing memory data | `./memory-data` | `/var/data/memory` |

## Security Considerations

- The HTTP server includes DNS rebinding protection for localhost addresses
- When binding to `0.0.0.0`, consider using authentication or restricting access
- Use HTTPS in production environments (requires reverse proxy like nginx)
- The server validates Host headers to prevent DNS rebinding attacks
