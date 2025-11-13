# Deployment Guide

This guide covers deploying the Elegant Flow UI to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Environment Configuration](#environment-configuration)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Docker](#docker)
- [Backend API Configuration](#backend-api-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ or 20+ installed
- npm or pnpm package manager
- Backend API server deployed and accessible
- API endpoint URL for production

## Build Process

### 1. Install Dependencies

```bash
cd elegant-flow-ui
npm install
```

### 2. Configure Environment Variables

Create a `.env.production` file:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Important:** Replace `https://api.yourdomain.com` with your actual backend API URL.

### 3. Run Type Checking

Ensure no TypeScript errors:

```bash
npm run type-check
```

### 4. Run Linting

Check code quality:

```bash
npm run lint
```

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 6. Preview Build Locally (Optional)

Test the production build locally:

```bash
npm run preview
```

Visit `http://localhost:4173` to preview.

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.yourdomain.com` |

### Environment Files

- `.env` - Local development (not committed)
- `.env.example` - Template for required variables (committed)
- `.env.production` - Production configuration (not committed)

### Security Notes

- Never commit `.env` or `.env.production` files to version control
- Environment variables are embedded at build time (not runtime)
- Only variables prefixed with `VITE_` are exposed to client-side code
- Avoid storing sensitive secrets in client-side environment variables

## Deployment Platforms

### Vercel

Vercel provides zero-configuration deployment for Vite applications.

#### Deploy via CLI

1. **Install Vercel CLI:**

```bash
npm install -g vercel
```

2. **Login to Vercel:**

```bash
vercel login
```

3. **Deploy:**

```bash
vercel
```

4. **Set Environment Variables:**

```bash
vercel env add VITE_API_BASE_URL production
```

Enter your API URL when prompted.

5. **Deploy to Production:**

```bash
vercel --prod
```

#### Deploy via Git Integration

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables in project settings
4. Deploy automatically on every push to main branch

#### Vercel Configuration

Create `vercel.json` in the project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

---

### Netlify

Netlify offers continuous deployment with Git integration.

#### Deploy via CLI

1. **Install Netlify CLI:**

```bash
npm install -g netlify-cli
```

2. **Login to Netlify:**

```bash
netlify login
```

3. **Initialize Site:**

```bash
netlify init
```

4. **Deploy:**

```bash
netlify deploy --prod
```

#### Deploy via Git Integration

1. Push your code to GitHub, GitLab, or Bitbucket
2. Create new site in Netlify dashboard
3. Connect your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables in site settings
6. Deploy automatically on every push

#### Netlify Configuration

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### AWS S3 + CloudFront

Deploy as a static website on AWS infrastructure.

#### Prerequisites

- AWS account
- AWS CLI installed and configured
- S3 bucket created
- CloudFront distribution (optional, for CDN)

#### Deployment Steps

1. **Build the Application:**

```bash
npm run build
```

2. **Upload to S3:**

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. **Configure S3 Bucket for Static Hosting:**

```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

4. **Set Bucket Policy for Public Access:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

5. **Create CloudFront Distribution (Optional):**

- Origin: Your S3 bucket
- Default root object: `index.html`
- Error pages: Configure 404 to return `index.html` with 200 status

6. **Invalidate CloudFront Cache After Updates:**

```bash
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Automated Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://your-bucket-name --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

echo "Deployment complete!"
```

Make it executable:

```bash
chmod +x deploy.sh
```

Run deployment:

```bash
./deploy.sh
```

---

### Docker

Containerize the application for deployment on any platform.

#### Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build Docker Image

```bash
docker build -t elegant-flow-ui:latest .
```

#### Run Docker Container

```bash
docker run -d -p 80:80 --name elegant-flow-ui elegant-flow-ui:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com
    restart: unless-stopped
```

Run with Docker Compose:

```bash
docker-compose up -d
```

---

## Backend API Configuration

### CORS Configuration

Ensure your backend API allows requests from your frontend domain.

**Python Flask Example:**

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",  # Development
    "https://yourdomain.com",  # Production
])
```

### API Endpoint

The frontend expects the following endpoint:

- **URL:** `POST /api/generate`
- **Request Body:**

```json
{
  "user_prompt": "a smartphone on a white background",
  "preset_name": "preset_bright_clean.json",
  "reference_image_base64": "base64_string_here"
}
```

- **Response (Success):**

```json
{
  "success": true,
  "final_image_url": "https://bria-api.com/images/abc123.jpg"
}
```

- **Response (Error):**

```json
{
  "success": false,
  "error": "Error message here"
}
```

### SSL/HTTPS

For production deployments:

- Use HTTPS for both frontend and backend
- Configure SSL certificates (Let's Encrypt recommended)
- Update `VITE_API_BASE_URL` to use `https://`

---

## Post-Deployment Checklist

After deploying, verify the following:

### Functionality

- [ ] Application loads without errors
- [ ] Product description input works
- [ ] Style preset selection works
- [ ] Reference image upload works
- [ ] Generate button triggers API call
- [ ] Loading state displays correctly
- [ ] Generated image displays correctly
- [ ] Download button works
- [ ] Error handling works (test with invalid inputs)

### Performance

- [ ] First Contentful Paint < 1.5 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] Lighthouse Performance score > 90
- [ ] Images load efficiently
- [ ] No console errors or warnings

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible
- [ ] ARIA labels present

### Responsive Design

- [ ] Works on desktop (≥1024px)
- [ ] Works on tablet (768px-1023px)
- [ ] Works on mobile (375px-767px)
- [ ] Touch interactions work on mobile
- [ ] No horizontal scrolling

### Security

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed
- [ ] Content Security Policy configured (optional)

---

## Troubleshooting

### Build Errors

**Issue:** TypeScript errors during build

**Solution:**

```bash
npm run type-check
```

Fix any type errors before building.

---

**Issue:** Module not found errors

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Runtime Errors

**Issue:** API requests fail with CORS errors

**Solution:**

- Check backend CORS configuration
- Ensure frontend domain is whitelisted
- Verify `VITE_API_BASE_URL` is correct

---

**Issue:** Environment variables not working

**Solution:**

- Ensure variables are prefixed with `VITE_`
- Rebuild application after changing environment variables
- Check `.env` file is in the correct location

---

**Issue:** 404 errors on page refresh

**Solution:**

- Configure server to serve `index.html` for all routes
- For Netlify: Add `_redirects` file or use `netlify.toml`
- For Nginx: Use `try_files $uri $uri/ /index.html;`
- For S3: Set error document to `index.html`

---

### Performance Issues

**Issue:** Slow initial load

**Solution:**

- Enable gzip compression on server
- Use CDN (CloudFront, Vercel Edge Network)
- Optimize images before upload
- Check bundle size with `npm run build -- --analyze`

---

**Issue:** Slow API responses

**Solution:**

- Check backend server performance
- Implement caching on backend
- Use CDN for generated images
- Consider adding loading indicators

---

## Monitoring and Analytics

### Recommended Tools

- **Error Tracking:** Sentry, Rollbar
- **Analytics:** Google Analytics, Plausible
- **Performance Monitoring:** Lighthouse CI, WebPageTest
- **Uptime Monitoring:** UptimeRobot, Pingdom

### Integration Example (Sentry)

1. **Install Sentry:**

```bash
npm install @sentry/react
```

2. **Initialize in `main.tsx`:**

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

3. **Wrap App with ErrorBoundary:**

```typescript
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

---

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./elegant-flow-ui

      - name: Type check
        run: npm run type-check
        working-directory: ./elegant-flow-ui

      - name: Lint
        run: npm run lint
        working-directory: ./elegant-flow-ui

      - name: Build
        run: npm run build
        working-directory: ./elegant-flow-ui
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./elegant-flow-ui
```

---

## Support

For deployment issues or questions:

- Check the [main README](./README.md) for setup instructions
- Review [COMPONENTS.md](./COMPONENTS.md) for API documentation
- Check backend API logs for errors
- Verify environment configuration

---

## License

See the main project LICENSE file for details.
