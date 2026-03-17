const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function insertSamplePrograms() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('=== Inserting Sample Training Programs ===');
    
    // Check if programs already exist
    const [existingPrograms] = await db.query('SELECT COUNT(*) as count FROM training_programs');
    if (existingPrograms[0].count > 0) {
      console.log('✅ Training programs already exist');
      return;
    }
    
    // Insert sample training programs
    await db.query(`
      INSERT INTO training_programs (name, description, duration_weeks, price) VALUES 
      ('Basic Fitness Plan', 'A comprehensive fitness program for beginners', 4, 999.00),
      ('Advanced Muscle Building', 'Intensive muscle building program for experienced users', 8, 1999.00),
      ('Weight Loss Program', 'Specialized program focused on fat loss and toning', 6, 1499.00),
      ('Premium Personal Training', 'One-on-one personalized training program', 12, 4999.00)
    `);
    
    console.log('✅ Sample training programs inserted successfully');
    
    // Verify the insertion
    const [programs] = await db.query('SELECT id, name, price FROM training_programs');
    console.log('\nInserted programs:');
    programs.forEach(program => {
      console.log(`- ID: ${program.id}, Name: ${program.name}, Price: ₹${program.price}`);
    });
    
  } catch (err) {
    console.error('❌ Error inserting programs:', err.message);
  } finally {
    await db.end();
  }
}

insertSamplePrograms(); 