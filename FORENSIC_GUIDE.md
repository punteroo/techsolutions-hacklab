# FORENSIC ANALYSIS GUIDE

## Step-by-Step Forensic Investigation

This guide walks you through a complete forensic analysis of the TechSolutions S.A. security incident.

---

## Prerequisites

- TechSolutions lab environment running
- Basic knowledge of Linux/Unix commands
- Understanding of SQL and networking concepts
- Familiarity with log analysis

---

## Phase 1: Evidence Collection (30 minutes)

### 1.1 Secure the Environment

```bash
# Stop the compromised systems (Docker containers)
docker-compose down

# Create forensic working directory
mkdir -p forensics/evidence
mkdir -p forensics/analysis
mkdir -p forensics/reports

# Copy all logs for analysis
cp -r logs/ forensics/evidence/
cp -r s3-bucket/ forensics/evidence/
cp -r ransomware/ forensics/evidence/
```

### 1.2 Generate Initial Checksums

```bash
# Create hash checksums for evidence integrity
cd forensics/evidence
find . -type f -exec md5sum {} \; > ../checksums.txt
```

### 1.3 Document Initial Findings

Create a file `forensics/initial-observations.md`:

```markdown
# Initial Observations
- Date/Time of discovery: [Your date]
- Systems affected: Web server, database, file servers
- Evidence collected: Logs, encrypted files, network captures
- Investigator: [Your name]
```

---

## Phase 2: Log Analysis (60 minutes)

### 2.1 Authentication Log Analysis

```bash
# Navigate to logs directory
cd logs

# Count total log entries
wc -l AUTH_*.log

# Extract unique IP addresses
cat AUTH_*.log | jq '.ip' | sort | uniq -c | sort -rn

# Find failed login attempts
cat AUTH_*.log | jq 'select(.message | contains("Failed"))' 

# Identify SQL injection attempts
cat AUTH_*.log | jq 'select(.query | contains("UNION") or contains("--"))'

# Timeline of admin access
cat AUTH_*.log | jq 'select(.username | contains("admin"))' | jq '.timestamp, .message, .ip'
```

Expected findings:
- Multiple failed logins from 45.142.214.198
- SQL injection patterns in queries
- Unusual admin login from Tor exit node

### 2.2 Network Log Analysis

```bash
# Analyze network logs
cat NET_*.log | jq '.'

# Find large data transfers
cat NET_*.log | jq 'select(.bytes > 100000000)' # Over 100 MB

# Identify suspicious destinations
cat NET_*.log | jq 'select(.dstIp != "192.168.1.100")' | jq '.dstIp' | sort | uniq

# C2 communication patterns
cat NET_*.log | jq 'select(.dstPort == 8443)'
```

Expected findings:
- 1.8 GB transfer to 45.142.214.198
- 347 MB database exfiltration
- Periodic C2 beacons

### 2.3 Ransomware Log Analysis

```bash
# Examine ransomware activity
cat RANSOM_*.log | jq '.'

# Get encryption timeline
cat RANSOM_*.log | jq '.timestamp, .message'

# Extract file hash
cat RANSOM_*.log | jq 'select(.hash_md5)' | jq '.hash_md5'
```

---

## Phase 3: Database Forensics (45 minutes)

### 3.1 Connect to Database

```bash
# Start the database container
docker-compose up -d db

# Connect to MySQL
docker exec -it techsolutions-db mysql -u root -pvulnerable123
```

### 3.2 Investigate Unauthorized Access

```sql
USE techsolutions;

-- Check for backdoor accounts
SELECT * FROM users WHERE created_at > '2025-10-26' ORDER BY created_at DESC;

-- Find modified admin accounts
SELECT * FROM users WHERE role = 'admin' AND updated_at > '2025-10-26';

-- Analyze query log (if enabled)
SELECT * FROM mysql.general_log 
WHERE command_type = 'Query' 
AND argument LIKE '%UNION%' 
LIMIT 20;

-- Count affected customer records
SELECT COUNT(*) FROM customers;
```

Document findings:
- Backdoor account: `backup_svc`
- Number of customer records: 1,247
- Evidence of SQL injection

### 3.3 Export Forensic Data

```sql
-- Export user activity
SELECT * FROM mysql.general_log 
WHERE event_time > '2025-10-26' 
INTO OUTFILE '/tmp/db_audit.csv';
```

---

## Phase 4: S3 Bucket Investigation (30 minutes)

### 4.1 Examine Exposed Files

```bash
# List all S3 bucket files
find s3-bucket/ -type f -ls

# Check file permissions (simulated)
ls -la s3-bucket/backups/

# Search for sensitive data
grep -r "password\|secret\|key" s3-bucket/

# Examine backup contents
head -50 s3-bucket/backups/db_backup_2025-10-15.sql
cat s3-bucket/backups/credentials.txt
```

### 4.2 Document Exposed Information

Create `forensics/analysis/s3-exposure.md`:

```markdown
# S3 Bucket Exposure Analysis

## Files Exposed:
1. db_backup_2025-10-15.sql (Database dump)
2. customer_data_export.csv (Customer PII)
3. payment_records.json (Payment data)
4. credentials.txt (System credentials)

## Sensitive Data Found:
- Database credentials
- AWS access keys
- Admin passwords
- Customer personal information
- Payment card data (partial)

## Impact:
- Total data exposed: 1.8 GB
- Customer records: 1,247
- Compliance violations: GDPR, PCI-DSS
```

---

## Phase 5: Ransomware Analysis (45 minutes)

### 5.1 Examine Ransom Note

```bash
# Read ransom note
cat ransomware/README_DECRYPT.txt

# Extract IOCs
grep -E "Bitcoin|IP|Domain" ransomware/README_DECRYPT.txt
```

### 5.2 Analyze Encrypted Files

```bash
# List encrypted files
find ransomware/encrypted/ -name "*.locked"

# Check file headers (first ransomware usually modifies headers)
for file in ransomware/encrypted/*.locked; do
    echo "File: $file"
    hexdump -C "$file" | head -5
    echo "---"
done
```

### 5.3 Dropper Analysis

```bash
# Read dropper analysis
cat ransomware/dropper/Invoice_Q3_2025.pdf.exe.txt

# Extract hash values
grep -E "MD5|SHA256" ransomware/dropper/Invoice_Q3_2025.pdf.exe.txt
```

### 5.4 Search for IOCs

```bash
# Search logs for dropper hash
MD5_HASH="7a5d8f3e9c1b2d4a6e8f0a2c4e6d8b9f"
grep -r "$MD5_HASH" logs/

# Search for C2 communication
grep -r "45.142.214.198" logs/
```

---

## Phase 6: Dark Web Intelligence (30 minutes)

### 6.1 Analyze Leaked Data

```bash
# Examine dark web post
cat dark-web-leaks/forum_posts.txt

# Extract posted emails
grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' dark-web-leaks/forum_posts.txt

# Check correlation with database
npm run check-leaks
```

### 6.2 Document Leak Details

- Forum: RaidForums
- Posted: 2025-10-28
- Price: 0.5 BTC (~$25,000)
- Records: 1,247 customers
- Seller: DataBroker2025

---

## Phase 7: Timeline Reconstruction (45 minutes)

### 7.1 Generate Complete Timeline

```bash
# Run timeline generator
npm run generate-timeline

# Review generated timeline
cat ATTACK_TIMELINE.md
```

### 7.2 Create Attack Chain Diagram

```
[Reconnaissance] → [S3 Discovery] → [SQL Injection] → [Ransomware] → [Data Leak]
   Oct 26 18:30      Oct 26 23:15     Oct 27 02:47      Oct 27 03:14     Oct 28 15:00
```

### 7.3 Correlate Events

```bash
# Run correlation script
npm run correlate-timeline
```

---

## Phase 8: IOC Extraction and Reporting (30 minutes)

### 8.1 Compile IOCs

Create `forensics/reports/iocs.md`:

```markdown
# Indicators of Compromise (IOCs)

## IP Addresses
- 45.142.214.198 - Primary attacker IP
- 185.220.101.47 - Tor exit node  
- 23.95.112.34 - Data exfiltration destination

## File Hashes
- 7a5d8f3e9c1b2d4a6e8f0a2c4e6d8b9f (MD5) - Ransomware dropper

## Domains
- lockbit3oa7tbdgvz7w4qr6bgvhvknwgvxr5rpvdpnyn5p3j4gofh5id.onion

## Compromised Accounts
- carlos.admin@techsolutions.com
- backup_svc (backdoor)

## Bitcoin Wallet
- 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
```

### 8.2 MITRE ATT&CK Mapping

| Technique | ID | Evidence |
|-----------|----|-----------| 
| Active Scanning | T1595 | Port scans from 45.142.214.198 |
| Exploit Public-Facing App | T1190 | SQL injection |
| Valid Accounts | T1078 | Compromised admin credentials |
| Create Account | T1136 | Backdoor account creation |
| Exfiltration Over Web | T1567 | 2.1 GB data transfer |
| Data Encrypted for Impact | T1486 | 847 files encrypted |

---

## Phase 9: Impact Assessment (30 minutes)

### 9.1 Calculate Damages

```markdown
# Impact Assessment

## Data Breach
- Customer records exposed: 1,247
- Data volume: 2.1 GB
- PII types: Names, emails, phones, addresses, payment info

## System Impact
- Files encrypted: 847
- Servers affected: 3
- Downtime: 5 days estimated

## Financial Impact
- Ransom demand: $250,000
- Recovery costs: $140,000-$280,000
- Lost revenue: $75,000-$150,000
- Regulatory fines: $50,000-$500,000 (GDPR)
- TOTAL: $515,000-$1,180,000

## Reputational Impact
- Customer trust damaged
- Media coverage negative
- Competitor advantage gained
```

---

## Phase 10: Final Report (60 minutes)

### 10.1 Executive Summary

Write comprehensive incident report covering:

1. **Incident Overview**
   - What happened
   - When it occurred
   - How it was discovered

2. **Technical Analysis**
   - Attack vectors
   - Timeline of events
   - IOCs discovered

3. **Impact Assessment**
   - Systems affected
   - Data compromised
   - Financial impact

4. **Root Cause Analysis**
   - Public S3 bucket
   - SQL injection vulnerability
   - Weak password hygiene
   - Lack of email filtering

5. **Recommendations**
   - Immediate actions
   - Short-term fixes
   - Long-term strategy

### 10.2 Lessons Learned

- Importance of access controls
- Need for input validation
- Value of security monitoring
- Regular security training

---

## Additional Resources

- OWASP Testing Guide
- NIST Incident Response Guide
- SANS Forensics Cheat Sheets
- MITRE ATT&CK Framework

---

**Analysis Complete! 🎓**

You've successfully completed a full forensic investigation of a multi-stage cyber attack.
