# API Reference

This page provides a comprehensive reference for the Agentik REST API, including all endpoints, request/response schemas, and practical examples.

## Base URL

- **Development**: `http://localhost:5001`
- **Production**: `https://your-production-domain.com`

## Authentication

Currently, the API uses anonymous access with owner-based resource isolation. All resources are created under the `'anon'` owner identifier.

**Future**: JWT-based authentication will be implemented for user management.

## Common Response Format

All API responses follow a consistent format:

```json
{
  "ok": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "ok": false,
  "error": "Error message description"
}
```

## Endpoints

### Simulation Templates

Manage simulation templates that define world configuration, agents, and AI models.

#### Create/Update Template

```http
POST /api/sims/templates
```

**Request Body:**

```json
{
  "name": "Simple Ecosystem",
  "world": {
    "width": 100,
    "height": 100,
    "tiles": []
  },
  "agents": [
    {
      "name": "Herbivore",
      "type": "plant_eater",
      "count": 10
    }
  ],
  "story": "A simple ecosystem with herbivores and plants",
  "model": {
    "provider": "ollama",
    "model": "llama3.1"
  }
}
```

**Response:**

```json
{
  "ok": true,
  "template": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "owner": "anon",
    "name": "Simple Ecosystem",
    "world": { ... },
    "agents": [ ... ],
    "story": "A simple ecosystem with herbivores and plants",
    "model": { ... },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/sims/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Simple Ecosystem",
    "world": {"width": 100, "height": 100, "tiles": []},
    "agents": [{"name": "Herbivore", "type": "plant_eater", "count": 10}],
    "story": "A simple ecosystem with herbivores and plants",
    "model": {"provider": "ollama", "model": "llama3.1"}
  }'
```

#### List Templates

```http
GET /api/sims/templates
```

**Response:**

```json
{
  "ok": true,
  "templates": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Simple Ecosystem",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**cURL Example:**

```bash
curl http://localhost:5001/api/sims/templates
```

#### Get Template

```http
GET /api/sims/templates/{id}
```

**Parameters:**
- `id` (path): Template UUID

**Response:**

```json
{
  "ok": true,
  "template": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "owner": "anon",
    "name": "Simple Ecosystem",
    "world": { ... },
    "agents": [ ... ],
    "story": "A simple ecosystem with herbivores and plants",
    "model": { ... },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**cURL Example:**

```bash
curl http://localhost:5001/api/sims/templates/123e4567-e89b-12d3-a456-426614174000
```

#### Delete Template

```http
DELETE /api/sims/templates/{id}
```

**Parameters:**
- `id` (path): Template UUID

**Response:**

```json
{
  "ok": true
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:5001/api/sims/templates/123e4567-e89b-12d3-a456-426614174000
```

### Simulation Runs

Control simulation execution and manage running simulations.

#### Start Simulation

```http
POST /api/runs/start
```

**Request Body:**

```json
{
  "snapshot": {
    "agents": [],
    "world": {},
    "time": 0
  },
  "templateId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**

```json
{
  "ok": true,
  "run": {
    "id": "987fcdeb-51a2-43f1-9b8c-765432109876",
    "owner": "anon",
    "template_id": "123e4567-e89b-12d3-a456-426614174000",
    "snapshot": { ... },
    "status": "running",
    "created_at": "2025-01-15T10:30:00Z",
    "stopped_at": null
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/runs/start \
  -H "Content-Type: application/json" \
  -d '{
    "snapshot": {"agents": [], "world": {}, "time": 0},
    "templateId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

#### Stop Simulation

```http
POST /api/runs/stop
```

**Request Body:**

```json
{
  "runId": "987fcdeb-51a2-43f1-9b8c-765432109876"
}
```

**Response:**

```json
{
  "ok": true,
  "run": {
    "id": "987fcdeb-51a2-43f1-9b8c-765432109876",
    "owner": "anon",
    "template_id": "123e4567-e89b-12d3-a456-426614174000",
    "snapshot": { ... },
    "status": "stopped",
    "created_at": "2025-01-15T10:30:00Z",
    "stopped_at": "2025-01-15T10:35:00Z"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/runs/stop \
  -H "Content-Type: application/json" \
  -d '{"runId": "987fcdeb-51a2-43f1-9b8c-765432109876"}'
```

### AI Models

Test and interact with AI model providers for agent decision-making.

#### Test Model Provider

```http
POST /api/models/test
```

**Request Body:**

```json
{
  "provider": "ollama",
  "config": {
    "baseUrl": "http://localhost:11434",
    "model": "llama3.1"
  },
  "prompt": "Hello, how are you today?"
}
```

**Response:**

```json
{
  "ok": true,
  "latencyMs": 1250,
  "outputPreview": "Hello! I'm doing well, thank you for asking. How are you today?"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/models/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "ollama",
    "config": {"baseUrl": "http://localhost:11434", "model": "llama3.1"},
    "prompt": "Hello, how are you today?"
  }'
```

#### Custom HTTP Provider

```json
{
  "provider": "custom",
  "config": {
    "baseUrl": "https://api.example.com",
    "params": {
      "temperature": 0.7
    }
  },
  "prompt": "Generate a creative story"
}
```

#### Get Inference (Placeholder)

```http
POST /api/models/infer
```

**Note**: This endpoint is currently a placeholder for future runtime AI inference.

**Response:**

```json
{
  "ok": false,
  "error": "not-implemented"
}
```

### Maps and Assets

Manage map drafts, publish maps, and handle tileset uploads.

#### Save Map Draft

```http
POST /api/maps/save
```

**Request Body:**

```json
{
  "name": "My Custom World",
  "mapJson": {
    "version": "1.0",
    "width": 50,
    "height": 50,
    "layers": []
  }
}
```

**Response:**

```json
{
  "ok": true,
  "id": "abc123-def456-ghi789",
  "name": "My Custom World",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/maps/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom World",
    "mapJson": {"version": "1.0", "width": 50, "height": 50, "layers": []}
  }'
```

#### Publish Map

```http
POST /api/maps/publish
```

**Request Body:**

```json
{
  "id": "abc123-def456-ghi789"
}
```

**Response:**

```json
{
  "ok": true,
  "mapKey": "maps/xyz789-uvw012-abc345.json"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/maps/publish \
  -H "Content-Type: application/json" \
  -d '{"id": "abc123-def456-ghi789"}'
```

#### Get Map Draft

```http
GET /api/maps/{id}
```

**Parameters:**
- `id` (path): Draft UUID

**Response:**

```json
{
  "ok": true,
  "draft": {
    "id": "abc123-def456-ghi789",
    "name": "My Custom World",
    "mapJson": { ... },
    "updated_at": "2025-01-15T10:30:00Z",
    "publishedKey": null
  }
}
```

#### Get Published Map

```http
GET /api/maps/by-key/{mapKey}
```

**Parameters:**
- `mapKey` (path): Public map key (e.g., `maps/xyz789.json`)

**Response:** Raw map JSON data

**cURL Example:**

```bash
curl http://localhost:5001/api/maps/by-key/maps/xyz789-uvw012-abc345.json
```

#### Upload Tileset

```http
POST /api/maps/upload-tileset
```

**Request Body:** `multipart/form-data`

**Parameters:**
- `file`: Image file (PNG, JPEG, GIF, WebP)

**Response:**

```json
{
  "ok": true,
  "url": "/uploads/tilesets/anon/1704067200000-tileset.png"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/maps/upload-tileset \
  -F "file=@tileset.png"
```

## Error Handling

### HTTP Status Codes

- **200**: Success
- **400**: Bad Request (missing fields, validation errors)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Common Error Messages

- `"missing fields"`: Required request body fields are missing
- `"not found"`: Requested resource doesn't exist
- `"no file"`: File upload request missing file data
- `"draft not found"`: Map draft ID doesn't exist

### Validation Rules

- **Template Names**: 1-100 characters, non-empty
- **Story Descriptions**: 1-1000 characters, non-empty
- **Map Names**: 1-100 characters, non-empty
- **File Types**: PNG, JPEG, GIF, WebP for tilesets
- **File Sizes**: Maximum 4MB for map data, 10MB for tilesets

## Rate Limiting

API endpoints are protected by rate limiting to prevent abuse:

- **General**: 100 requests per minute per IP
- **File Uploads**: 10 uploads per minute per IP
- **AI Model Testing**: 20 requests per minute per IP

## CORS Configuration

The API supports cross-origin requests with configurable policies:

```javascript
// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## WebSocket Support

For real-time simulation updates, WebSocket connections are supported:

```javascript
// WebSocket connection
const ws = new WebSocket('ws://localhost:5001/simulation');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Simulation update:', update);
};
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install agentik-client
```

```typescript
import { AgentikClient } from 'agentik-client';

const client = new AgentikClient('http://localhost:5001');

// Create template
const template = await client.templates.create({
  name: 'My World',
  world: { width: 100, height: 100 },
  agents: [],
  story: 'A test world',
  model: { provider: 'ollama' }
});

// Start simulation
const run = await client.runs.start({
  snapshot: { agents: [], world: {}, time: 0 },
  templateId: template.id
});
```

### Python

```bash
pip install agentik-python
```

```python
from agentik import Client

client = Client('http://localhost:5001')

# Create template
template = client.templates.create(
    name='My World',
    world={'width': 100, 'height': 100},
    agents=[],
    story='A test world',
    model={'provider': 'ollama'}
)

# Start simulation
run = client.runs.start(
    snapshot={'agents': [], 'world': {}, 'time': 0},
    template_id=template['id']
)
```

## Testing

### Health Check

```bash
curl http://localhost:5001/health
```

### API Status

```bash
curl http://localhost:5001/api/status
```

## Support

For API support and questions:

- **Documentation**: [Full API Spec](/spec/openapi)
- **GitHub Issues**: [Report bugs](https://github.com/Agentik-commit/AgentIk/issues)
- **Discussions**: [Community Q&A](https://github.com/Agentik-commit/AgentIk/discussions)
