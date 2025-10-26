# API Reference

Base URL: `http://localhost:8000`

All API endpoints are prefixed with `/api`.

## Endpoints

### Health Check

Check if the backend API is running and responsive.

**Endpoint:** `GET /api/health`

**Request:**
```bash
curl http://localhost:8000/api/health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.123456"
}
```

**Response Fields:**
- `status` (string): Always "ok" if the service is running
- `timestamp` (string): ISO 8601 formatted timestamp of the request

**Use Cases:**
- Frontend health checks on mount
- Monitoring and alerting
- Load balancer health probes
- Deployment verification

**Example Usage (TypeScript):**
```typescript
import { api } from '@/lib/api';

const checkHealth = async () => {
  try {
    const response = await api.health();
    console.log('API Status:', response.status);
    console.log('Timestamp:', response.timestamp);
  } catch (error) {
    console.error('API is down:', error);
  }
};
```

---

### Debug Configuration

Retrieve current LLM provider and MCP transport configuration.

**Endpoint:** `GET /api/debug/config`

**Request:**
```bash
curl http://localhost:8000/api/debug/config
```

**Response:** `200 OK`
```json
{
  "llm_provider": "anthropic",
  "mcp_transport": "sse"
}
```

**Response Fields:**
- `llm_provider` (string): Current LLM provider ("anthropic" or "openai")
- `mcp_transport` (string): MCP transport type ("sse" or "stdio")

**Use Cases:**
- Debugging configuration issues
- Verifying environment variables
- Development and testing
- Admin dashboard display

**Example Usage (TypeScript):**
```typescript
import { api } from '@/lib/api';

const getConfig = async () => {
  try {
    const config = await api.debugConfig();
    console.log('LLM Provider:', config.llm_provider);
    console.log('MCP Transport:', config.mcp_transport);
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }
};
```

**Configuration:**

The LLM provider can be changed via environment variable:
```bash
LLM_PROVIDER=openai  # or "anthropic"
```

---

## Error Responses

All endpoints may return error responses in the following format:

### 500 Internal Server Error

**Response:**
```json
{
  "detail": "Internal server error message"
}
```

### 422 Validation Error

**Response:**
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Frontend development server)

All HTTP methods and headers are allowed for development.

**Production Note:** Update CORS configuration in `backend/main.py` to restrict origins in production.

---

## API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

These interfaces allow you to:
- View all available endpoints
- See request/response schemas
- Test endpoints directly in the browser
- Download OpenAPI specification

---

## Future Endpoints

The following endpoints are planned for future implementation:

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me
```

### Reports

```
GET /api/reports
POST /api/reports
GET /api/reports/{id}
PUT /api/reports/{id}
DELETE /api/reports/{id}
GET /api/reports/{id}/status
```

### MCP Tools

```
POST /api/tools/semrush/traffic
POST /api/tools/keyword-gap
POST /api/tools/content-scraper
```

### Users

```
GET /api/users/me
PUT /api/users/me
GET /api/users/{id}/reports
```

---

## Rate Limiting

**Current:** No rate limiting implemented

**Future:** Rate limiting will be implemented using:
- Middleware-based rate limiting
- Redis for distributed rate limit tracking
- Different limits for authenticated vs anonymous users

---

## Versioning

**Current:** No API versioning (v1 implicit)

**Future:** API versioning strategy:
- URL-based versioning: `/api/v2/endpoint`
- Header-based versioning as alternative
- Deprecation warnings in responses

---

## Authentication

**Current:** No authentication required

**Future:** JWT-based authentication:
```http
Authorization: Bearer <jwt_token>
```

All protected endpoints will require this header.

---

## Request Logging

All requests are logged to the backend console with:
- HTTP method
- Request path
- Timestamp
- Response status (in development)

Example log output:
```
INFO: GET /api/health - 2024-01-01T12:00:00.123456
INFO: GET /api/debug/config - 2024-01-01T12:00:05.789012
```

---

## TypeScript Types

Complete TypeScript types for API responses:

```typescript
// Health Check Response
interface HealthResponse {
  status: string;
  timestamp: string;
}

// Debug Config Response
interface DebugConfigResponse {
  llm_provider: string;
  mcp_transport: string;
}

// API Client
interface ApiClient {
  health(): Promise<HealthResponse>;
  debugConfig(): Promise<DebugConfigResponse>;
}
```

---

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/api/health

# Debug config
curl http://localhost:8000/api/debug/config

# Pretty print JSON
curl http://localhost:8000/api/health | jq
```

### Using HTTPie

```bash
# Health check
http GET localhost:8000/api/health

# Debug config
http GET localhost:8000/api/debug/config
```

### Using the Frontend

The frontend automatically calls the health endpoint on page load. Check the browser console for the response.

### Using Swagger UI

1. Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)
2. Click on an endpoint
3. Click "Try it out"
4. Click "Execute"
5. View the response
