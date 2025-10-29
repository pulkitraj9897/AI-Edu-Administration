# 🚀 Deployment Guide

## Production Deployment Options

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - Set API URL to your backend URL

**Vercel Dashboard Steps:**
- Go to [vercel.com](https://vercel.com)
- Import Git repository
- Select `frontend` folder as root directory
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Deploy

#### Option 2: Netlify

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

**Or via Netlify Dashboard:**
- Go to [netlify.com](https://netlify.com)
- Drag and drop the `dist` folder
- Or connect Git repository
- Build Command: `npm run build`
- Publish Directory: `dist`

#### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install -D gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/edu-admin",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

---

### Backend Deployment

#### Option 1: Railway (Recommended)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create new project** → Deploy from GitHub

3. **Add Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-secret
   OPENAI_API_KEY=your-api-key
   NODE_ENV=production
   ```

4. **Railway will auto-deploy** from your Git repository

**Or use Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app**
   ```bash
   heroku login
   cd backend
   heroku create edu-admin-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set OPENAI_API_KEY=your-key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Create Procfile** in backend folder:
   ```
   web: node server.js
   ```

#### Option 3: DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
2. Create new app from GitHub repository
3. Select `backend` folder
4. Set build command: `npm install`
5. Set run command: `npm start`
6. Add environment variables
7. Deploy

#### Option 4: AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   cd backend
   eb init
   ```

3. **Create environment**
   ```bash
   eb create edu-admin-env
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

---

### Database Deployment

#### MongoDB Atlas (Recommended for Production)

1. **Sign up** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create cluster** (Free tier available)

3. **Create database user**
   - Username: admin
   - Password: (generate secure password)

4. **Whitelist IP addresses**
   - Add: 0.0.0.0/0 (allow from anywhere)
   - Or specific IPs for security

5. **Get connection string**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/edu-admin
   ```

6. **Update backend .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edu-admin
   ```

---

## Environment Variables Checklist

### Backend (.env)
```env
# Required
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-key-min-32-chars

# Optional
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend
Update `src/utils/api.ts` or create `.env` file:
```env
VITE_API_URL=https://your-backend-api.com
```

---

## Pre-Deployment Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Use MongoDB Atlas or secure database
- [ ] Enable HTTPS (SSL)
- [ ] Set proper CORS origins
- [ ] Remove console.log statements
- [ ] Add rate limiting
- [ ] Implement input validation
- [ ] Sanitize user inputs

### Performance
- [ ] Enable compression
- [ ] Add caching headers
- [ ] Optimize images
- [ ] Minify assets
- [ ] Use CDN for static files
- [ ] Enable HTTP/2

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add logging (Winston)
- [ ] Monitor uptime
- [ ] Set up alerts
- [ ] Track performance metrics

---

## Production Configuration Updates

### Backend (server.js)

```javascript
// Update CORS for production
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Add helmet for security
import helmet from 'helmet';
app.use(helmet());

// Add compression
import compression from 'compression';
app.use(compression());

// Add rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Frontend (vite.config.ts)

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
        }
      }
    }
  }
});
```

---

## Docker Deployment (Advanced)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: |
          cd frontend
          npm ci
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Post-Deployment Testing

1. **Test all endpoints**
   ```bash
   curl https://your-api.com/api/health
   ```

2. **Test authentication**
   - Login with demo accounts
   - Verify JWT tokens work

3. **Test core features**
   - Dashboard loads
   - Charts render
   - CRUD operations work
   - Dark mode persists

4. **Performance testing**
   - Use Lighthouse
   - Check load times
   - Monitor memory usage

5. **Security testing**
   - SSL certificate valid
   - CORS working correctly
   - No exposed secrets

---

## Monitoring & Maintenance

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics
- **Performance**: New Relic or DataDog
- **Logs**: Papertrail or LogDNA

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Monitor database size
- [ ] Check API response times
- [ ] Review error logs
- [ ] Backup database regularly

---

## Rollback Plan

If deployment fails:

1. **Revert to previous version**
   ```bash
   git revert HEAD
   git push
   ```

2. **Check logs**
   ```bash
   heroku logs --tail  # Heroku
   railway logs        # Railway
   ```

3. **Restore database backup** if needed

---

## Cost Estimation

### Free Tier Options
- **Frontend**: Vercel/Netlify (Free)
- **Backend**: Railway (Free tier)
- **Database**: MongoDB Atlas (512MB free)
- **Total**: $0/month for development

### Paid Options (Production)
- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Railway ($5-10/month)
- **Database**: MongoDB Atlas ($9/month)
- **Total**: $34-39/month

---

## Support & Troubleshooting

### Common Issues

**Build fails**
- Check Node version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors

**Database connection fails**
- Verify MongoDB Atlas whitelist
- Check connection string format
- Ensure database user has permissions

**CORS errors**
- Update CORS_ORIGIN in backend
- Verify frontend API URL
- Check request headers

**Performance issues**
- Enable caching
- Optimize images
- Use CDN
- Monitor database queries

---

**Need help?** Create an issue on GitHub or check the documentation.

**Happy Deploying! 🚀**
