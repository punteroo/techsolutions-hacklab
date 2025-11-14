# TechSolutions S.A. - Security Lab Summary

## 🎯 Lab Overview

This repository contains a complete, self-contained security training lab that simulates a real-world cybersecurity incident at a fictional company called TechSolutions S.A.

## 📦 What's Included

### 1. **Vulnerable Web Application** (TypeScript + Express)
- Intentionally vulnerable login endpoint (SQL Injection)
- Unsafe credential storage (plain text passwords)
- Exposed admin panel
- JWT authentication (with weak secrets)
- Complete user management system

### 2. **Database** (MySQL)
- 1,247 customer records
- Compromised admin accounts
- Backdoor user account
- Query logging enabled for forensics

### 3. **Simulated S3 Bucket**
- Database backups with sensitive data
- Customer PII export
- Payment records
- Hardcoded credentials
- AWS access keys

### 4. **Ransomware Artifacts**
- 4 encrypted files (.locked extension)
- Ransom note (LockBit 3.0 simulation)
- Malware dropper information
- IOCs (Indicators of Compromise)

### 5. **Forensic Logs**
- Authentication logs (SQL injection attempts)
- Network traffic logs (data exfiltration)
- Ransomware execution logs
- Complete timeline of attack

### 6. **Dark Web Intelligence**
- Simulated forum post
- Leaked data advertisement
- Bitcoin wallet for ransom
- OSINT research materials

## 🔐 Vulnerabilities Implemented

| # | Vulnerability | OWASP Top 10 | Severity | Location |
|---|---------------|--------------|----------|----------|
| 1 | SQL Injection | A03:2021 | Critical | `/api/auth/login` |
| 2 | Insecure Data Storage | A02:2021 | Critical | S3 bucket simulation |
| 3 | Broken Authentication | A07:2021 | High | Compromised credentials |
| 4 | Security Misconfiguration | A05:2021 | High | Public S3 bucket |
| 5 | Insufficient Logging | A09:2021 | Medium | Delayed detection |

## 🎓 Learning Objectives

After completing this lab, you will:

1. ✅ Understand common web application vulnerabilities
2. ✅ Perform SQL injection attacks and exploitation
3. ✅ Conduct digital forensics investigation
4. ✅ Analyze ransomware behavior and IOCs
5. ✅ Correlate events from multiple log sources
6. ✅ Create comprehensive incident response reports
7. ✅ Map attacks to MITRE ATT&CK framework
8. ✅ Practice remediation and security hardening

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Add to /etc/hosts
echo "127.0.0.1   techsolutions.com.test" | sudo tee -a /etc/hosts

# 2. Clone and setup
git clone <your-repo-url>
cd techsolutions
npm install

# 3. Start the lab
docker-compose up -d
sleep 15
npm run init-db
npm run generate-logs

# 4. Start web app
npm run dev

# 5. Access the lab
open http://techsolutions.com.test:3000
```

## 📖 Documentation Structure

- **README.md** - Complete lab documentation (you are here)
- **QUICKSTART.md** - Fast setup guide
- **FORENSIC_GUIDE.md** - Step-by-step forensic analysis (350+ lines)
- **ATTACK_TIMELINE.md** - Generated after running `npm run generate-timeline`
- **LICENSE** - MIT License with educational use disclaimer

## 🔬 Forensic Analysis Tools

The lab includes several helper scripts:

```bash
npm run generate-timeline    # Create complete attack timeline
npm run check-leaks          # Match DB records with dark web leaks
npm run analyze-ransomware   # Examine ransomware artifacts
npm run correlate-timeline   # Correlate events across logs
npm run simulate-recovery    # Ransomware recovery simulation
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL 8.0
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Containerization**: Docker, Docker Compose
- **Logging**: Custom JSON-based logging system

## 📊 Attack Scenario Timeline

```
Day 1 (Oct 26)
├─ 18:30 - Reconnaissance (port scanning)
├─ 23:15 - S3 bucket discovered and downloaded (1.8 GB)

Day 2 (Oct 27)
├─ 01:30 - SQL injection attempts begin
├─ 02:47 - Database exfiltrated (347 MB)
├─ 03:00 - Phishing email opened (ransomware dropper)
├─ 03:14 - File encryption begins (847 files)
├─ 10:01 - Incident discovered

Day 3 (Oct 28)
└─ 15:00 - Data posted on dark web forum
```

## 🎯 Use Cases

### For Students
- Learn offensive security techniques
- Practice forensic analysis
- Understand attack methodologies
- Prepare for certifications (OSCP, CEH, GCIH)

### For Teachers
- Ready-to-use lab environment
- Comprehensive documentation
- Assessment scenarios
- Hands-on learning material

### For Security Professionals
- Incident response practice
- Forensic analysis training
- Tool development and testing
- Security awareness demonstrations

## ⚠️ Important Disclaimers

### Legal Warning
```
⚠️  LEGAL WARNING ⚠️

This lab contains intentionally vulnerable code and simulated malware.

DO NOT:
- Use in production environments
- Attack systems you don't own
- Deploy on public networks
- Share credentials from this lab

ONLY USE:
- For educational purposes
- In isolated lab environments
- With explicit permission
- For security research

Unauthorized computer access is illegal. The authors are not
responsible for any misuse of this software.
```

### Technical Limitations

- This is a **simulation** - not real malware
- Ransomware files are harmless text files
- No actual encryption algorithms used
- Network captures are synthetic
- S3 bucket is a local directory

## 🔧 Troubleshooting

### Docker Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up -d
```

### Port Conflicts
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Web app
  - "3307:3306"  # MySQL
```

### DNS Resolution
```bash
# Verify /etc/hosts entry
cat /etc/hosts | grep techsolutions

# Test resolution
ping techsolutions.com.test
```

## 📚 Additional Resources

### Learning Materials
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [SANS Digital Forensics](https://www.sans.org/cyber-security-courses/)

### Tools to Practice With
- SQLMap - Automated SQL injection
- Burp Suite - Web security testing
- Wireshark - Network analysis
- Autopsy - Digital forensics

## 🤝 Contributing

Contributions welcome! Ideas for improvements:

- Additional vulnerability scenarios
- More realistic log data
- Additional forensic artifacts
- Automated testing scripts
- Docker Compose improvements

## 📝 License

MIT License - See LICENSE file for details.

Educational use only. Contains intentionally vulnerable code.

## 🎓 Credits

Created for cybersecurity education and training purposes.

**Inspired by:**
- DVWA (Damn Vulnerable Web Application)
- OWASP WebGoat
- HackTheBox
- TryHackMe

---

## 📈 Lab Statistics

- **Lines of Code**: 2,500+
- **Documentation**: 1,500+ lines
- **Log Entries**: 50+ forensic events
- **Vulnerabilities**: 5 major categories
- **Simulated Data**: 1,247 customer records
- **Total Files**: 60+ files
- **Setup Time**: 5 minutes
- **Learning Time**: 4-8 hours

---

## 🎯 Next Steps

1. Complete the QUICKSTART.md setup
2. Explore the vulnerable web application
3. Follow the FORENSIC_GUIDE.md step-by-step
4. Try exploitation scenarios from README.md
5. Generate your own attack timeline
6. Write a comprehensive incident report

---

**Ready to start? Follow QUICKSTART.md!** 🚀

Questions? Issues? Open an issue on GitHub!

Happy learning and stay secure! 🔒
