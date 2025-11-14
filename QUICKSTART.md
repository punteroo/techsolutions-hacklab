# Quick Start Guide - TechSolutions Security Lab

## 1. Prerequisites

```bash
# Install Node.js (18+)
node --version  # Should be 18+

# Install Docker and Docker Compose
docker --version
docker-compose --version
```

## 2. Setup /etc/hosts

Add this line to your `/etc/hosts` file:

```
127.0.0.1   techsolutions.com.test
```

On Linux/Mac:
```bash
sudo nano /etc/hosts
```

On Windows (as Administrator):
```
notepad C:\Windows\System32\drivers\etc\hosts
```

## 3. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd techsolutions

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## 4. Start the Lab

```bash
# Start all services (database + web app)
docker-compose up -d

# Wait for database to be ready (10-15 seconds)
sleep 15

# Initialize database with vulnerable data
npm run init-db

# Generate forensic logs
npm run generate-logs

# Start the web application
npm run dev
```

## 5. Access the Application

Open your browser and navigate to:
```
http://techsolutions.com.test:3000
```

**Test Credentials:**
- Username: `carlos.admin@techsolutions.com`
- Password: `TechSol2024!Admin`

**SQL Injection Test:**
- Username: `admin' OR '1'='1`
- Password: `anything`

## 6. Explore Vulnerabilities

### SQL Injection
```bash
# Test with curl
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

### S3 Bucket Exposure
```bash
# View exposed files
ls -la s3-bucket/backups/
cat s3-bucket/backups/credentials.txt
```

### Ransomware Artifacts
```bash
# Examine encrypted files
ls ransomware/encrypted/
cat ransomware/README_DECRYPT.txt
```

## 7. Forensic Analysis

```bash
# Generate attack timeline
npm run generate-timeline

# Check for data leaks
npm run check-leaks

# Analyze ransomware
npm run analyze-ransomware

# Correlate events
npm run correlate-timeline
```

## 8. Stop the Lab

```bash
# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

## Troubleshooting

### Port 3000 already in use:
```bash
# Change PORT in .env file
PORT=3001
```

### Database connection failed:
```bash
# Restart database
docker-compose restart db

# Check database logs
docker logs techsolutions-db
```

### Cannot resolve techsolutions.com.test:
```bash
# Verify /etc/hosts entry
cat /etc/hosts | grep techsolutions
```

## Next Steps

1. Read the full README.md
2. Follow the FORENSIC_GUIDE.md
3. Try all exploitation scenarios
4. Practice incident response

Happy hacking! 🔒
