import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

function generateTimestamp(date: Date): string {
  return date.toISOString();
}

function writeLog(filename: string, entries: LogEntry[]) {
  const logPath = path.join(logsDir, filename);
  const content = entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
  fs.writeFileSync(logPath, content);
  console.log(`✅ Generated: ${filename}`);
}

// Generate authentication logs showing the attack
function generateAuthLogs() {
  const baseDate = new Date('2025-10-27T00:00:00Z');
  const logs: LogEntry[] = [];

  // Normal activity
  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(baseDate.getTime() + i * 3600000); // Every hour
    logs.push({
      timestamp: generateTimestamp(timestamp),
      level: 'INFO',
      message: 'Successful login',
      username: i % 3 === 0 ? 'juan.user@techsolutions.com' : 'ana.developer@techsolutions.com',
      ip: '192.168.1.' + (10 + i),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }

  // Reconnaissance phase - port scanning
  const reconTime = new Date('2025-10-26T18:30:00Z');
  logs.push({
    timestamp: generateTimestamp(reconTime),
    level: 'WARN',
    message: 'Multiple connection attempts detected',
    ip: '45.142.214.198',
    attempts: 127,
    ports: [22, 80, 443, 3306, 8080]
  });

  // SQL injection attempts
  const injectionStart = new Date('2025-10-27T01:30:00Z');
  const injectionPayloads = [
    "admin' OR '1'='1",
    "admin'--",
    "' UNION SELECT null,null,null,null--",
    "' UNION SELECT id,username,password,email FROM users--",
    "1' AND '1'='1",
    "admin' ORDER BY 5--"
  ];

  injectionPayloads.forEach((payload, i) => {
    logs.push({
      timestamp: generateTimestamp(new Date(injectionStart.getTime() + i * 180000)), // Every 3 min
      level: 'WARN',
      message: 'SQL Query Executed (VULNERABLE)',
      query: `SELECT * FROM users WHERE username = '${payload}' AND password = ''`,
      ip: '45.142.214.198',
      suspicious: true
    });
  });

  // Successful SQL injection
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T02:45:33Z')),
    level: 'ERROR',
    message: 'Successful login',
    username: "admin' OR '1'='1",
    ip: '45.142.214.198',
    notes: 'SQL injection bypass - authentication circumvented'
  });

  // Bulk data extraction
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T02:47:33Z')),
    level: 'WARN',
    message: 'SQL Query Executed (VULNERABLE)',
    query: 'SELECT * FROM customers',
    ip: '45.142.214.198',
    rowsAffected: 1247
  });

  // Compromised admin account usage
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T03:15:00Z')),
    level: 'INFO',
    message: 'Successful login',
    username: 'carlos.admin@techsolutions.com',
    ip: '185.220.101.47',
    userAgent: 'Mozilla/5.0 (compatible; TorBrowser)',
    notes: 'Login from Tor exit node - unusual location'
  });

  // Backdoor account creation
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T03:20:15Z')),
    level: 'WARN',
    message: 'New admin user created',
    username: 'backup_svc',
    createdBy: 'carlos.admin@techsolutions.com',
    ip: '185.220.101.47',
    suspicious: true
  });

  // Failed login attempts on backdoor (persistence check)
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T10:01:32Z')),
    level: 'WARN',
    message: 'Failed login attempt',
    username: 'backup_svc',
    ip: '45.142.214.198',
    reason: 'Checking persistence'
  });

  writeLog('AUTH_2025-10-27T10-01-32.log', logs.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ));
}

// Generate network logs showing data exfiltration
function generateNetworkLogs() {
  const logs: LogEntry[] = [];
  const baseDate = new Date('2025-10-27T00:00:00Z');

  // Normal traffic
  for (let i = 0; i < 20; i++) {
    logs.push({
      timestamp: generateTimestamp(new Date(baseDate.getTime() + i * 1800000)),
      level: 'NET',
      message: 'HTTP Request',
      srcIp: '192.168.1.' + (10 + i % 10),
      dstIp: '192.168.1.100',
      srcPort: 50000 + i,
      dstPort: 443,
      protocol: 'HTTPS',
      bytes: Math.floor(Math.random() * 50000)
    });
  }

  // S3 bucket access
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-26T23:15:44Z')),
    level: 'NET',
    message: 'Large data transfer',
    srcIp: '192.168.1.100',
    dstIp: '45.142.214.198',
    srcPort: 443,
    dstPort: 54321,
    protocol: 'HTTPS',
    bytes: 1887436800, // 1.8 GB
    files: ['db_backup_2025-10-15.sql', 'customer_data_export.csv', 'credentials.txt']
  });

  // Database dump exfiltration
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T02:47:33Z')),
    level: 'NET',
    message: 'Database export',
    srcIp: '192.168.1.100',
    dstIp: '23.95.112.34',
    srcPort: 3306,
    dstPort: 443,
    protocol: 'HTTPS',
    bytes: 363724800, // 347 MB
    notes: 'Customer database dump'
  });

  // C2 communication
  const c2Start = new Date('2025-10-27T03:00:15Z');
  for (let i = 0; i < 15; i++) {
    logs.push({
      timestamp: generateTimestamp(new Date(c2Start.getTime() + i * 60000)), // Every minute
      level: 'NET',
      message: 'Suspicious outbound connection',
      srcIp: '192.168.1.105',
      dstIp: '45.142.214.198',
      srcPort: 49000 + i,
      dstPort: 8443,
      protocol: 'HTTPS',
      bytes: 1024,
      notes: 'Periodic beacon - possible C2 communication'
    });
  }

  // Ransomware file encryption traffic
  logs.push({
    timestamp: generateTimestamp(new Date('2025-10-27T03:14:55Z')),
    level: 'NET',
    message: 'SMB traffic spike',
    srcIp: '192.168.1.105',
    dstIp: '192.168.1.110',
    protocol: 'SMB',
    bytes: 4294967296, // 4 GB
    notes: 'Ransomware encryption activity'
  });

  writeLog('NET_2025-10-27T03-14-55.log', logs.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ));
}

// Generate ransomware activity logs
function generateRansomwareLogs() {
  const logs: LogEntry[] = [];
  const infectionTime = new Date('2025-10-27T03:00:15Z');

  logs.push({
    timestamp: generateTimestamp(infectionTime),
    level: 'ERROR',
    message: 'Suspicious process execution',
    process: 'Invoice_Q3_2025.pdf.exe',
    pid: 4872,
    parentProcess: 'outlook.exe',
    user: 'carlos.admin',
    commandLine: 'C:\\Users\\carlos.admin\\Downloads\\Invoice_Q3_2025.pdf.exe',
    hash_md5: '7a5d8f3e9c1b2d4a6e8f0a2c4e6d8b9f'
  });

  logs.push({
    timestamp: generateTimestamp(new Date(infectionTime.getTime() + 60000)),
    level: 'ERROR',
    message: 'Privilege escalation detected',
    process: 'Invoice_Q3_2025.pdf.exe',
    action: 'SeDebugPrivilege enabled',
    user: 'carlos.admin'
  });

  logs.push({
    timestamp: generateTimestamp(new Date(infectionTime.getTime() + 120000)),
    level: 'ERROR',
    message: 'Mass file modifications detected',
    process: 'Invoice_Q3_2025.pdf.exe',
    filesAffected: 847,
    extension: '.locked',
    directories: ['C:\\Data', 'D:\\Backups', '\\\\SERVER01\\Shared']
  });

  logs.push({
    timestamp: generateTimestamp(new Date(infectionTime.getTime() + 180000)),
    level: 'ERROR',
    message: 'Ransom note created',
    file: 'README_DECRYPT.txt',
    locations: 847
  });

  writeLog('RANSOM_2025-10-27T03-14-55.log', logs);
}

console.log('🔧 Generating forensic logs for TechSolutions Lab...\n');
generateAuthLogs();
generateNetworkLogs();
generateRansomwareLogs();
console.log('\n✅ All logs generated successfully!\n');
