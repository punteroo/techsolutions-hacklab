import fs from 'fs';
import path from 'path';
import db from '../src/config/database';
import { RowDataPacket } from 'mysql2';

const leakedDataFile = path.join(__dirname, '../dark-web-leaks/forum_posts.txt');

async function checkLeaks() {
  console.log('🔍 Checking for data leaks...\n');

  try {
    // Read leaked data
    const leakedContent = fs.readFileSync(leakedDataFile, 'utf8');
    
    // Extract emails from leaked data
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const leakedEmails = leakedContent.match(emailRegex) || [];
    const uniqueLeakedEmails = [...new Set(leakedEmails)];

    console.log(`📧 Found ${uniqueLeakedEmails.length} unique emails in dark web leak\n`);

    // Check against database
    const [customers] = await db.execute<RowDataPacket[]>(
      'SELECT email, first_name, last_name FROM customers'
    );

    let matchCount = 0;
    const matches: string[] = [];

    customers.forEach(customer => {
      if (uniqueLeakedEmails.includes(customer.email)) {
        matchCount++;
        matches.push(`${customer.first_name} ${customer.last_name} (${customer.email})`);
      }
    });

    console.log(`✅ Analysis Complete:`);
    console.log(`   Total customers in database: ${customers.length}`);
    console.log(`   Emails found in dark web leak: ${uniqueLeakedEmails.length}`);
    console.log(`   Confirmed matches: ${matchCount}\n`);

    if (matchCount > 0) {
      console.log(`⚠️  CONFIRMED DATA LEAK VICTIMS:\n`);
      matches.slice(0, 10).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match}`);
      });
      if (matches.length > 10) {
        console.log(`   ... and ${matches.length - 10} more\n`);
      }
    }

    console.log(`\n📊 Leak Impact Assessment:`);
    const leakPercentage = ((matchCount / customers.length) * 100).toFixed(2);
    console.log(`   Percentage of customers affected: ${leakPercentage}%`);
    console.log(`   Severity: ${leakPercentage > 50 ? 'CRITICAL' : leakPercentage > 20 ? 'HIGH' : 'MEDIUM'}`);

  } catch (error: any) {
    console.error('❌ Error checking leaks:', error.message);
  } finally {
    process.exit(0);
  }
}

checkLeaks();
