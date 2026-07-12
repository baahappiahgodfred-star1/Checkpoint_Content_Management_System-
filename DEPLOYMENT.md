# EduCMS Deployment Guide

## 🚀 Deployment Options

This guide covers deploying EduCMS Backend API to various platforms.

## 1. Deploy to Render

### Prerequisites
- Render account (https://render.com)
- GitHub repository with your code
- PostgreSQL database

### Steps

1. **Create PostgreSQL Database on Render**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Set database name: `educms-db`
   - Set region and plan
   - Create database
   - Copy the internal database URL

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables:
     ```
     PORT=5000
     NODE_ENV=production
     DB_HOST=[from PostgreSQL service]
     DB_PORT=5432
     DB_NAME=educms_db
     DB_USER=[from PostgreSQL]
     DB_PASSWORD=[from PostgreSQL]
     JWT_SECRET=[generate a strong secret]
     FRONTEND_URL=[your frontend URL]
     ```
   - Deploy

3. **Run Database Migrations**
   ```bash
   psql [DATABASE_URL] < database-schema.sql
   ```

4. **Access Your API**
   ```
   https://educms-api.onrender.com/api/v1
   ```

## 2. Deploy to Fly.io

### Prerequisites
- Fly.io account (https://fly.io)
- Fly CLI installed
- PostgreSQL database

### Steps

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   flyctl auth login
   ```

3. **Create Fly App**
   ```bash
   flyctl launch
   ```

4. **Create PostgreSQL Database**
   ```bash
   flyctl postgres create
   ```

5. **Set Environment Variables**
   ```bash
   flyctl secrets set \
     JWT_SECRET="your-secret-key" \
     DB_HOST="your-db-host" \
     DB_PASSWORD="your-db-password"
   ```

6. **Deploy**
   ```bash
   flyctl deploy
   ```

## 3. Deploy to Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create educms-api
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Migrations**
   ```bash
   heroku run psql < database-schema.sql
   ```

## 4. Deploy to AWS

### Using Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init -p node.js-16 educms-api
   ```

3. **Create Environment**
   ```bash
   eb create educms-env
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv JWT_SECRET="your-secret-key" NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Using EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security group (allow ports 80, 443, 5000)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql postgresql-contrib
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/educms-backend.git
   cd educms-backend
   ```

5. **Install Node Packages**
   ```bash
   npm install
   ```

6. **Setup PostgreSQL**
   ```bash
   sudo -u postgres psql < database-schema.sql
   ```

7. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

8. **Start Application**
   ```bash
   npm start
   ```

## 5. Deploy to DigitalOcean

### Using App Platform

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Select your GitHub repository

2. **Configure App**
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add environment variables

3. **Create Database**
   - Add PostgreSQL database cluster
   - Configure connection

4. **Deploy**
   - Click "Deploy"

### Using Droplet

Similar to AWS EC2 deployment process.

## 6. Deploy to Azure

### Using App Service

1. **Create Resource Group**
   ```bash
   az group create --name educms-rg --location eastus
   ```

2. **Create App Service Plan**
   ```bash
   az appservice plan create --name educms-plan --resource-group educms-rg --sku B1 --is-linux
   ```

3. **Create Web App**
   ```bash
   az webapp create --resource-group educms-rg --plan educms-plan --name educms-api --runtime "node|16-lts"
   ```

4. **Deploy from GitHub**
   ```bash
   az webapp deployment source config-zip --resource-group educms-rg --name educms-api --src deploy.zip
   ```

## 7. Deploy with Docker

### Create Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t educms-api .
docker run -p 5000:5000 -e DB_HOST=host.docker.internal educms-api
```

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `PORT` - Server port (default: 5000)
- [ ] `NODE_ENV` - Environment (production/development)
- [ ] `DB_HOST` - Database host
- [ ] `DB_PORT` - Database port (default: 5432)
- [ ] `DB_NAME` - Database name
- [ ] `DB_USER` - Database user
- [ ] `DB_PASSWORD` - Database password (use strong password)
- [ ] `JWT_SECRET` - JWT secret key (minimum 32 characters)
- [ ] `JWT_EXPIRE` - JWT expiration time
- [ ] `FRONTEND_URL` - Frontend application URL
- [ ] `BCRYPT_ROUNDS` - Bcrypt rounds (default: 10)
- [ ] `RATE_LIMIT_WINDOW` - Rate limit window in minutes
- [ ] `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Post-Deployment Steps

1. **Run Database Migrations**
   ```bash
   psql [DATABASE_URL] < database-schema.sql
   ```

2. **Test API Health**
   ```bash
   curl https://your-api-url/health
   ```

3. **Create Admin User**
   ```bash
   curl -X POST https://your-api-url/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@example.com",
       "password": "securepassword",
       "first_name": "Admin",
       "last_name": "User"
     }'
   ```

4. **Setup SSL/TLS**
   - Use Let's Encrypt for free SSL certificates
   - Configure HTTPS redirects

5. **Setup Monitoring**
   - Configure error tracking (Sentry)
   - Setup performance monitoring
   - Configure log aggregation

6. **Setup Backups**
   - Configure automated database backups
   - Test backup restoration

## Troubleshooting

### Database Connection Issues
- Verify database credentials
- Check firewall rules
- Ensure database is running
- Test connection string

### Application Won't Start
- Check logs: `npm start`
- Verify all dependencies installed
- Check environment variables
- Verify Node.js version compatibility

### High Memory Usage
- Check for memory leaks
- Optimize database queries
- Implement caching (Redis)
- Scale horizontally

### Performance Issues
- Enable compression
- Implement caching
- Optimize database indexes
- Use CDN for static files

## Monitoring & Maintenance

### Recommended Tools
- **Error Tracking**: Sentry
- **Performance Monitoring**: New Relic, DataDog
- **Log Aggregation**: LogRocket, Papertrail
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Database Monitoring**: pgAdmin, AWS RDS Console

### Regular Maintenance
- Monitor disk space
- Review error logs
- Update dependencies
- Backup database regularly
- Monitor API performance

## Security Considerations

- [ ] Use HTTPS/TLS
- [ ] Rotate JWT secrets regularly
- [ ] Use strong database passwords
- [ ] Enable database backups
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Use security headers

## Support

For deployment issues, refer to:
- Platform-specific documentation
- GitHub Issues
- Stack Overflow
- Community forums

---

**Last Updated**: June 2026
