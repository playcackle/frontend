# SnapScore Frontend - Docker Setup

This document explains how to run the SnapScore frontend using Docker.

## Quick Start

### Production Build

From the `snapscore_backend` directory (where docker-compose.yml is located):

```bash
# Build and run the entire stack including frontend
docker-compose up --build

# Run only the frontend (assuming backend services are running)
docker-compose up frontend
```

The frontend will be available at: http://localhost:3000

### Development Mode

For development with hot reloading:

```bash
# Use the development override
docker-compose -f docker-compose.yml -f docker-compose.override.yml up frontend

# Or build specifically for development
docker build --target development -t snapscore-frontend-dev .
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules snapscore-frontend-dev
```

## Architecture

### Multi-stage Dockerfile

The Dockerfile uses multiple stages for optimization:

1. **base**: Base Node.js 20 Alpine image
2. **deps**: Install dependencies only 
3. **development**: Development stage with hot reloading
4. **builder**: Build the production application
5. **runner**: Final optimized production image

### Environment Variables

The frontend uses these environment variables:

- `NODE_ENV`: Development or production mode
- `NEXT_PUBLIC_LOBBY_MANAGER_URL`: Backend API URL (exposed to browser)
- `NEXT_PUBLIC_LOBBY_WS_BASE_URL`: WebSocket URL (exposed to browser)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry

### Network Communication

In Docker Compose:
- Frontend: http://localhost:3000 (external) / http://frontend:3000 (internal)
- Backend API: http://localhost:8001 (external) / http://lobby_manager:8001 (internal)  
- WebSocket: ws://localhost:8000 (external) / ws://lobby:8000 (internal)

## Files Created

- `Dockerfile`: Multi-stage build configuration
- `.dockerignore`: Optimize build context
- `.env.production`: Production environment variables
- `.env.example`: Example environment configuration
- `docker-compose.override.yml`: Development overrides
- `next.config.mjs`: Updated with standalone output for Docker

## Commands

```bash
# Build production image
docker build -t snapscore-frontend .

# Build development image  
docker build --target development -t snapscore-frontend-dev .

# Run production container
docker run -p 3000:3000 snapscore-frontend

# Run with custom environment
docker run -p 3000:3000 -e NODE_ENV=production -e NEXT_PUBLIC_LOBBY_MANAGER_URL=http://localhost:8001 snapscore-frontend

# Run entire stack
cd snapscore_backend
docker-compose up --build

# Run for development with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

## Optimization Features

- **Standalone Build**: Uses Next.js standalone output for minimal production image
- **Multi-stage Build**: Separates dependencies, build, and runtime for smaller final image  
- **Alpine Linux**: Lightweight base image
- **Non-root User**: Runs as non-privileged user for security
- **Build Cache**: Optimized layer ordering for better Docker build caching

## Troubleshooting

### Port Conflicts
If port 3000 is in use, change the port mapping:
```bash
docker run -p 3001:3000 snapscore-frontend
```

### Environment Issues
Check that environment variables are correctly set:
```bash
docker exec -it <container-id> env | grep NEXT_PUBLIC
```

### WebSocket Connection Issues
Ensure the WebSocket URLs are reachable from the browser (not just within Docker network).