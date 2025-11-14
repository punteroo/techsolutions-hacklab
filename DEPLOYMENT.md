# Deployment Guide - TechSolutions Security Lab

## 🚀 Complete Deployment Instructions

This guide will help you deploy the TechSolutions Security Lab from scratch.

---

## Prerequisites Check

### Required Software

```bash
# Check Node.js version (must be 18+)
node --version

# Check npm
npm --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version

# Check git
git --version
```

If any are missing, install them:

**Ubuntu/Debian:**
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Git
sudo apt-get install git
```

**macOS:**
```bash
# Using Homebrew
brew install node
brew install --cask docker
```

**Windows:**
- Install Node.js from https://nodejs.org
- Install Docker Desktop from https://www.docker.com
- Install Git from https://git-scm.com

---

## Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/techsolutions-lab.git
cd techsolutions-lab

# Or if you downloaded as ZIP
unzip techsolutions-lab.zip
cd techsolutions-lab
```

---

## Step 2: Configure DNS

### Linux/Mac

```bash
# Add entry to /etc/hosts
echo "127.0.0.1   techsolutions.com.test" | sudo tee -a /etc/hosts

# Verify
cat /etc/hosts | grep techsolutions
```

### Windows (Run as Administrator)

```powershell
# Open PowerShell as Administrator
Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1   techsolutions.com.test"

# Verify
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String techsolutions
```

---

## Step 3: Install Dependencies

```bash
# Install Node.js packages
npm install

# This will install:
# - express, mysql2, cors, dotenv
# - TypeScript and development tools
# - All type definitions

# Verify installation
npm list --depth=0
```

---

## Step 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit if needed (optional for lab use)
nano .env
```

The default `.env` file contains:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=vulnerable123
DB_NAME=techsolutions
NODE_ENV=development
PORT=3000
JWT_SECRET=insecure-secret-key-do-not-use-in-production
LOG_LEVEL=debug
```

---

## Step 5: Start Database

```bash
# Start only the database first
docker-compose up -d db

# Wait for MySQL to be ready (15-20 seconds)
echo "Waiting for database to be ready..."
sleep 20

# Check database is running
docker-compose ps

# View database logs
docker logs techsolutions-db
```

Expected output:
```
Container techsolutions-db  Started
```

---

## Step 6: Initialize Database

```bash
# Run database initialization script
npm run init-db
```

Expected output:
```
🔧 Initializing TechSolutions database...

✅ Connected to MySQL server
✅ Database schema created
✅ Vulnerable user accounts created
✅ Sample customer data inserted (1,247 records)
✅ Sample orders created

📊 Database initialization complete!

🔐 Compromised Admin Credentials:
   Username: carlos.admin@techsolutions.com
   Password: TechSol2024!Admin

⚠️  Backdoor Account Created:
   Username: backup_svc
   Password: B@ckup!2024
```

---

## Step 7: Generate Forensic Logs

```bash
# Generate all forensic log files
npm run generate-logs
```

Expected output:
```
🔧 Generating forensic logs for TechSolutions Lab...

✅ Generated: AUTH_2025-10-27T10-01-32.log
✅ Generated: NET_2025-10-27T03-14-55.log
✅ Generated: RANSOM_2025-10-27T03-14-55.log

✅ All logs generated successfully!
```

---

## Step 8: Start Web Application

### Development Mode (Recommended for Lab)

```bash
# Start with auto-reload
npm run dev
```

Expected output:
```
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║        TechSolutions S.A. - Security Lab                 ║
  ║        ⚠️  VULNERABLE APPLICATION - LAB USE ONLY ⚠️       ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  
  Server running on: http://techsolutions.com.test:3000
  Database: MySQL (Port 3306)
  
  Available endpoints:
  - POST /api/auth/login (VULNERABLE to SQL Injection)
  - POST /api/auth/register
  - GET  /api/admin/users (Requires authentication)
  - GET  /api/customers (Requires authentication)
```

### Production Mode (Optional)

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

---

## Step 9: Verify Installation

### Test Web Access

```bash
# Test homepage
curl http://techsolutions.com.test:3000

# Test health check
curl http://techsolutions.com.test:3000/health
```

### Test Database Connection

```bash
# Connect to MySQL
docker exec -it techsolutions-db mysql -u root -pvulnerable123

# Run in MySQL:
USE techsolutions;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM customers;
EXIT;
```

### Test Vulnerable Login (SQL Injection)

```bash
# Test SQL injection
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

---

## Step 10: Access the Lab

### Web Browser

1. Open browser: http://techsolutions.com.test:3000

2. Test normal login:
   - Username: `carlos.admin@techsolutions.com`
   - Password: `TechSol2024!Admin`

3. Test SQL injection:
   - Username: `admin' OR '1'='1`
   - Password: `anything`

### File System Access

```bash
# Explore S3 bucket simulation
ls -la s3-bucket/backups/
cat s3-bucket/backups/credentials.txt

# Examine ransomware
cat ransomware/README_DECRYPT.txt
ls ransomware/encrypted/

# Review logs
cat logs/AUTH_2025-10-27T10:01:32.log | jq
cat logs/NET_2025-10-27T03:14:55.log | jq
```

---

## Alternative: Docker-Only Deployment

If you want to run everything in Docker:

```bash
# Start all services with Docker Compose
docker-compose up -d

# Initialize database
docker exec techsolutions-web npm run init-db

# Generate logs
docker exec techsolutions-web npm run generate-logs

# View logs
docker-compose logs -f web
```

---

## Troubleshooting

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
PORT=3001

# Restart
npm run dev
```

### Issue: Database connection failed

```bash
# Check database status
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker logs techsolutions-db

# Wait longer for MySQL to start
sleep 30
npm run init-db
```

### Issue: DNS not resolving

```bash
# Test resolution
ping techsolutions.com.test

# If fails, verify /etc/hosts
cat /etc/hosts | grep techsolutions

# Flush DNS cache
# Mac:
sudo dscacheutil -flushcache

# Linux:
sudo systemd-resolve --flush-caches

# Windows:
ipconfig /flushdns
```

### Issue: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: TypeScript compilation errors

```bash
# Check TypeScript version
npx tsc --version

# Clean build
rm -rf dist/
npm run build
```

---

## Uninstallation

### Complete Cleanup

```bash
# Stop all containers
docker-compose down

# Remove volumes (database data)
docker-compose down -v

# Remove images
docker rmi techsolutions-web mysql:8.0

# Remove DNS entry
sudo sed -i '/techsolutions.com.test/d' /etc/hosts

# Delete project
cd ..
rm -rf techsolutions-lab
```

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Host Machine                                                 │
│                                                              │
│  ┌────────────────────┐         ┌────────────────────┐     │
│  │ Web Browser        │         │ Terminal/CLI       │     │
│  │ localhost:3000     │         │ Scripts & Tools    │     │
│  └────────┬───────────┘         └─────────┬──────────┘     │
│           │                                │                 │
│           │    HTTP                        │  Docker CLI     │
│           ▼                                ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Docker Network (techsolutions-network)              │   │
│  │                                                      │   │
│  │  ┌──────────────────┐    ┌──────────────────┐     │   │
│  │  │ Web Container    │───▶│ DB Container     │     │   │
│  │  │ Node.js/Express  │    │ MySQL 8.0        │     │   │
│  │  │ Port: 3000       │    │ Port: 3306       │     │   │
│  │  └──────────────────┘    └──────────────────┘     │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  File System:                                               │
│  - /s3-bucket/        (Simulated S3)                       │
│  - /logs/             (Forensic logs)                      │
│  - /ransomware/       (Encrypted files)                    │
│  - /dark-web-leaks/   (OSINT data)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Warnings

⚠️  **CRITICAL SECURITY WARNINGS** ⚠️

1. **Never expose this lab to the internet**
   - Bind only to localhost/127.0.0.1
   - Use firewall rules to block external access
   - Don't open ports in cloud environments

2. **Never use these credentials elsewhere**
   - All passwords are intentionally weak
   - Credentials are publicly documented
   - Never reuse in real systems

3. **Never run on production networks**
   - Use isolated VM or container
   - Separate network segment
   - Air-gapped environment recommended

4. **Never store real data**
   - All data is fake/simulated
   - Don't input real PII
   - Don't connect to real services

---

## Post-Deployment Checklist

- [ ] Database is running and accessible
- [ ] Web application responds on port 3000
- [ ] DNS resolves techsolutions.com.test
- [ ] Can login with test credentials
- [ ] SQL injection works
- [ ] S3 bucket files are accessible
- [ ] Ransomware artifacts are present
- [ ] Logs are generated
- [ ] All npm scripts work
- [ ] Docker containers are healthy

---

## Next Steps After Deployment

1. **Explore the Application**
   - Login with valid credentials
   - Browse the dashboard
   - View customer data

2. **Test Vulnerabilities**
   - Try SQL injection payloads
   - Access S3 bucket files
   - Review leaked credentials

3. **Forensic Analysis**
   - Follow FORENSIC_GUIDE.md
   - Analyze all log files
   - Generate attack timeline

4. **Generate Reports**
   - Run all forensic scripts
   - Create incident report
   - Document findings

---

**Deployment Complete! Ready to hack! 🎉**

For help, see README.md or open an issue on GitHub.
