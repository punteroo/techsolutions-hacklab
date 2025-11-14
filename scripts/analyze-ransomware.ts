import fs from 'fs';
import path from 'path';

const ransomwareDir = path.join(__dirname, '../ransomware');

function analyzeRansomware() {
  console.log('🔍 Analyzing Ransomware Artifacts...\n');

  // Read ransom note
  const ransomNote = fs.readFileSync(path.join(ransomwareDir, 'README_DECRYPT.txt'), 'utf8');
  
  // Extract IOCs
  const bitcoinMatch = ransomNote.match(/Bitcoin Address: ([a-zA-Z0-9]+)/);
  const uniqueIdMatch = ransomNote.match(/Unique ID: ([A-Z0-9-]+)/);
  const amountMatch = ransomNote.match(/Amount: ([\d.]+) Bitcoin/);

  console.log('📋 Ransomware Analysis Report\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🦠 Ransomware Family: LockBit 3.0');
  console.log('📅 Infection Date: 2025-10-27 03:00:15 UTC');
  console.log('🎯 Entry Vector: Phishing email attachment');
  console.log('📧 Initial File: Invoice_Q3_2025.pdf.exe\n');

  console.log('💰 Ransom Demand:');
  console.log(`   Amount: ${amountMatch ? amountMatch[1] : 'Unknown'} BTC (~$250,000 USD)`);
  console.log(`   Bitcoin Wallet: ${bitcoinMatch ? bitcoinMatch[1] : 'Unknown'}`);
  console.log(`   Victim ID: ${uniqueIdMatch ? uniqueIdMatch[1] : 'Unknown'}\n`);

  // Count encrypted files
  const encryptedDir = path.join(ransomwareDir, 'encrypted');
  const encryptedFiles = fs.readdirSync(encryptedDir);
  
  console.log('📁 Encrypted Files:');
  console.log(`   Total files: ${encryptedFiles.length}`);
  encryptedFiles.forEach((file, i) => {
    const filePath = path.join(encryptedDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${i + 1}. ${file} (${stats.size} bytes)`);
  });

  console.log('\n🔐 Encryption Details:');
  console.log('   Algorithm: AES-256-CBC');
  console.log('   Key Exchange: RSA-2048');
  console.log('   Extension: .locked');

  console.log('\n🌐 Network Indicators:');
  console.log('   C2 Server: 45.142.214.198:8443');
  console.log('   Tor Hidden Service: lockbit3oa7tbdgvz7w4qr6bgvhvknwgvxr5rpvdpnyn5p3j4gofh5id.onion');
  console.log('   Beacon Interval: 60 seconds\n');

  // Dropper analysis
  const dropperInfo = fs.readFileSync(path.join(ransomwareDir, 'dropper/Invoice_Q3_2025.pdf.exe.txt'), 'utf8');
  const md5Match = dropperInfo.match(/MD5: ([a-f0-9]+)/);
  const sha256Match = dropperInfo.match(/SHA256: ([a-f0-9]+)/);

  console.log('🔬 Malware Analysis:');
  console.log(`   MD5: ${md5Match ? md5Match[1] : 'Unknown'}`);
  console.log(`   SHA256: ${sha256Match ? sha256Match[1] : 'Unknown'}`);
  console.log('   File Type: PE32 executable (GUI) Intel 80386');
  console.log('   File Size: 847 KB\n');

  console.log('⚠️  Recommended Actions:');
  console.log('   1. Isolate infected systems immediately');
  console.log('   2. Block C2 server IPs at firewall');
  console.log('   3. Search for file hash across network');
  console.log('   4. Check email gateway for similar attachments');
  console.log('   5. Restore from offline backups');
  console.log('   6. DO NOT pay ransom (no guarantee of decryption)\n');

  console.log('═══════════════════════════════════════════════════════════\n');
}

analyzeRansomware();
