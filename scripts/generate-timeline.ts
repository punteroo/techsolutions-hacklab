import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../logs');
const outputFile = path.join(__dirname, '../ATTACK_TIMELINE.md');

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

function readLogFile(filename: string): LogEntry[] {
  const filePath = path.join(logsDir, filename);
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

function generateTimeline() {
  console.log('🔍 Analyzing logs and generating attack timeline...\n');

  // Read all log files
  const authLogs = readLogFile('AUTH_2025-10-27T10-01-32.log');
  const netLogs = readLogFile('NET_2025-10-27T03-14-55.log');
  const ransomLogs = readLogFile('RANSOM_2025-10-27T03-14-55.log');

  // Combine and sort all events
  const allEvents = [...authLogs, ...netLogs, ...ransomLogs]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Generate markdown timeline
  let markdown = `# TechSolutions S.A. - Attack Timeline

**Generated:** ${new Date().toISOString()}  
**Incident Date:** October 26-27, 2025  
**Attack Type:** Multi-stage cyber attack (Reconnaissance → Exploitation → Impact)

---

## Executive Summary

TechSolutions S.A. experienced a sophisticated multi-stage cyber attack resulting in:
- **Data Breach:** 1,247 customer records exfiltrated (1.8 GB)
- **Ransomware Impact:** 847 files encrypted across 3 servers
- **Compromised Credentials:** Admin account used for unauthorized access
- **Data Leak:** Customer information posted on dark web forums

---

## Detailed Timeline

`;

  const events: Array<{time: string, phase: string, description: string, ioc: string[]}> = [];

  allEvents.forEach(log => {
    let phase = 'Unknown';
    let description = log.message;
    let iocs: string[] = [];

    if (log.ip) iocs.push(`IP: ${log.ip}`);
    if (log.hash_md5) iocs.push(`MD5: ${log.hash_md5}`);
    if (log.query) iocs.push(`SQL: ${log.query.substring(0, 100)}...`);

    // Categorize by MITRE ATT&CK phases
    if (log.message.includes('connection attempts') || log.message.includes('port scanning')) {
      phase = 'Reconnaissance';
    } else if (log.message.includes('SQL') && log.suspicious) {
      phase = 'Initial Access';
    } else if (log.message.includes('admin user created') || log.message.includes('privilege')) {
      phase = 'Persistence/Privilege Escalation';
    } else if (log.message.includes('data transfer') || log.message.includes('export')) {
      phase = 'Exfiltration';
    } else if (log.message.includes('encryption') || log.message.includes('ransomware') || log.message.includes('file modifications')) {
      phase = 'Impact';
    }

    events.push({
      time: new Date(log.timestamp).toLocaleString('es-AR', { 
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      phase,
      description,
      ioc: iocs
    });
  });

  // Group by phase
  const phases = ['Reconnaissance', 'Initial Access', 'Persistence/Privilege Escalation', 'Exfiltration', 'Impact'];
  
  phases.forEach(phase => {
    const phaseEvents = events.filter(e => e.phase === phase);
    if (phaseEvents.length === 0) return;

    markdown += `### 🎯 ${phase}\n\n`;
    markdown += `| Time (ART) | Event | Indicators of Compromise |\n`;
    markdown += `|------------|-------|-------------------------|\n`;

    phaseEvents.forEach(event => {
      markdown += `| ${event.time} | ${event.description} | ${event.ioc.join('<br>')} |\n`;
    });

    markdown += `\n`;
  });

  // Add MITRE ATT&CK mapping
  markdown += `---

## MITRE ATT&CK Mapping

| Tactic | Technique | Technique ID | Evidence |
|--------|-----------|--------------|----------|
| Reconnaissance | Active Scanning | T1595 | Port scanning from 45.142.214.198 |
| Initial Access | Exploit Public-Facing Application | T1190 | SQL Injection on login form |
| Initial Access | Valid Accounts | T1078 | Compromised admin credentials used |
| Persistence | Create Account | T1136 | Backdoor account 'backup_svc' created |
| Privilege Escalation | Valid Accounts | T1078 | Admin account exploitation |
| Exfiltration | Exfiltration Over Web Service | T1567 | Data transferred to 23.95.112.34 |
| Impact | Data Encrypted for Impact | T1486 | Ransomware encryption (847 files) |

---

## Indicators of Compromise (IOCs)

### IP Addresses
- \`45.142.214.198\` - Primary attacker IP (SQL injection, data exfiltration)
- \`185.220.101.47\` - Tor exit node (compromised credentials usage)
- \`23.95.112.34\` - Data exfiltration destination

### File Hashes
- \`7a5d8f3e9c1b2d4a6e8f0a2c4e6d8b9f\` (MD5) - Invoice_Q3_2025.pdf.exe (ransomware dropper)

### Compromised Accounts
- \`carlos.admin@techsolutions.com\` - Leaked credentials
- \`backup_svc\` - Backdoor account created by attacker

### Network Indicators
- C2 Communication: 45.142.214.198:8443 (HTTPS beacons every 60 seconds)
- Unusual SMB traffic spike: 4 GB transfer during encryption

---

## Recommendations

### Immediate Actions
1. ✅ Isolate affected systems from network
2. ✅ Reset all administrative credentials
3. ✅ Block malicious IPs at firewall level
4. ✅ Disable 'backup_svc' account
5. ✅ Preserve forensic evidence

### Short-term (1-2 weeks)
1. Patch SQL injection vulnerability in login form
2. Implement Web Application Firewall (WAF)
3. Enable Multi-Factor Authentication (MFA) for all admin accounts
4. Restore encrypted files from offline backups
5. Notify affected customers (GDPR requirement)

### Long-term (1-3 months)
1. Security code review of all web applications
2. Implement Data Loss Prevention (DLP) solution
3. Deploy Endpoint Detection and Response (EDR)
4. Conduct security awareness training (phishing)
5. Implement network segmentation
6. Regular penetration testing
7. Implement SIEM for real-time threat detection

---

**Report Generated:** ${new Date().toISOString()}  
**Analyzed Logs:** ${authLogs.length + netLogs.length + ransomLogs.length} events  
**Classification:** CONFIDENTIAL - Internal Use Only
`;

  fs.writeFileSync(outputFile, markdown);
  console.log(`✅ Timeline generated: ${outputFile}\n`);
  console.log(`📊 Total events analyzed: ${allEvents.length}`);
  console.log(`📁 Output file: ATTACK_TIMELINE.md\n`);
}

generateTimeline();
