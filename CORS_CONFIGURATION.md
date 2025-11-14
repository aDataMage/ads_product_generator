# CORS Configuration Documentation

## Overview

The Flask API server uses Flask-CORS to enable Cross-Origin Resource Sharing (CORS) for frontend applications. This allows React development servers running on different ports to make API requests to the Flask backend.

## Configuration

### Allowed Origins

The server is configured to accept requests from the following origins:

- `http://localhost:3000` - Standard React development server (Create React App default)
- `http://localhost:5173` - Vite development server (elegant-flow-ui)

### Affected Endpoints

CORS is configured at the **application level**, which means it applies to **all routes** automatically:

- `/api/generate` - Standard image generation endpoint
- `/api/generate/pro` - Pro Mode structured prompt endpoint
- Any future endpoints added to the application

### How It Works

1. **Preflight Requests**: Flask-CORS automatically handles OPTIONS preflight requests sent by browsers before actual POST requests
2. **Response Headers**: All responses include appropriate CORS headers:
   - `Access-Control-Allow-Origin`: Matches the requesting origin if allowed
   - `Access-Control-Allow-Methods`: Lists allowed HTTP methods (GET, POST, OPTIONS, etc.)
   - `Access-Control-Allow-Headers`: Lists allowed request headers (Content-Type, etc.)

## Implementation Details

### Code Location

File: `api_server.py`

```python
def create_app():
    app = Flask(__name__)
    
    # Configure CORS to allow requests from React development servers
    # This applies to ALL routes including:
    # - /api/generate (standard mode)
    # - /api/generate/pro (Pro Mode)
    # Automatically handles preflight OPTIONS requests
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])
    
    return app
```

### Why Application-Level CORS?

We use application-level CORS configuration (rather than per-route) because:

1. **Simplicity**: Single configuration point for all endpoints
2. **Consistency**: All API endpoints have the same CORS policy
3. **Maintainability**: New endpoints automatically inherit CORS configuration
4. **Automatic Preflight Handling**: Flask-CORS handles OPTIONS requests for all routes

## Testing CORS

### Manual Testing

You can test CORS configuration using the provided test script:

```bash
# Start the Flask server in one terminal
python api_server.py

# Run CORS tests in another terminal
python test_cors.py
```

The test script verifies:

- Preflight OPTIONS requests are handled correctly
- CORS headers are present in responses
- Both allowed origins work correctly
- Disallowed origins are rejected

### Browser Testing

You can also test CORS by:

1. Starting the Flask server: `python api_server.py`
2. Starting the React development server: `cd elegant-flow-ui && npm run dev`
3. Opening the browser console and checking for CORS errors
4. Making API requests from the React app

### Expected Behavior

**Allowed Origins** (localhost:3000, localhost:5173):

- ✓ Preflight OPTIONS requests return 200 with CORS headers
- ✓ POST requests include `Access-Control-Allow-Origin` header
- ✓ No CORS errors in browser console

**Disallowed Origins** (any other domain):

- ✗ Preflight requests may succeed but without proper CORS headers
- ✗ Browser blocks the actual request
- ✗ CORS error appears in browser console

## Production Considerations

### Security

For production deployment, you should:

1. **Update Allowed Origins**: Replace localhost origins with your production domain(s)
2. **Use Environment Variables**: Configure origins via environment variables
3. **Enable HTTPS**: Ensure all origins use HTTPS in production
4. **Restrict Origins**: Only allow specific, trusted domains

### Example Production Configuration

```python
import os

# Get allowed origins from environment variable
allowed_origins = os.environ.get('CORS_ORIGINS', '').split(',')

# Configure CORS with production origins
CORS(app, origins=allowed_origins)
```

Then set the environment variable:

```bash
# Linux/Mac
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Windows
set CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Troubleshooting

### CORS Error in Browser

If you see CORS errors in the browser console:

1. **Check Server is Running**: Ensure Flask server is running on the expected port
2. **Verify Origin**: Check that your frontend is running on an allowed origin
3. **Check Server Logs**: Look for CORS-related messages in Flask logs
4. **Clear Browser Cache**: Sometimes browsers cache CORS preflight responses

### Preflight Request Fails

If OPTIONS requests fail:

1. **Check Flask-CORS Installation**: Ensure `flask-cors` is installed (`pip list | grep flask-cors`)
2. **Verify Configuration**: Check that CORS is configured in `create_app()`
3. **Check Firewall**: Ensure no firewall is blocking OPTIONS requests

### Headers Missing

If CORS headers are missing from responses:

1. **Verify CORS Initialization**: Ensure `CORS(app, ...)` is called before route definitions
2. **Check Origin Match**: Verify the requesting origin exactly matches an allowed origin
3. **Test with curl**: Use curl to manually test OPTIONS and POST requests

## References

- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS Specification](https://fetch.spec.whatwg.org/#http-cors-protocol)
