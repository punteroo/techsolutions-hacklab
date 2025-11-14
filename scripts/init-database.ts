import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  let connection;

  try {
    console.log('🔧 Initializing TechSolutions database...\n');

    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'vulnerable123',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute init.sql
    const fs = require('fs');
    const path = require('path');
    const initSQL = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');

    await connection.query(initSQL);

    console.log('✅ Database schema created');
    console.log('✅ Vulnerable user accounts created');
    console.log('✅ Sample customer data inserted (1,247 records)');
    console.log('✅ Sample orders created');
    console.log('\n📊 Database initialization complete!\n');

    console.log('🔐 Compromised Admin Credentials:');
    console.log('   Username: carlos.admin@techsolutions.com');
    console.log('   Password: TechSol2024!Admin');
    console.log('\n⚠️  Backdoor Account Created:');
    console.log('   Username: backup_svc');
    console.log('   Password: B@ckup!2024\n');

  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
