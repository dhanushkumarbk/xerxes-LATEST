const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testDatabase() {
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
    console.log('=== Testing Database Connection ===');
    
    // Test connection
    await db.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check table counts
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [dietRequests] = await db.query('SELECT COUNT(*) as count FROM diet_plan_requests');
    const [payments] = await db.query('SELECT COUNT(*) as count FROM payments');
    const [subscriptions] = await db.query('SELECT COUNT(*) as count FROM subscriptions');
    const [programs] = await db.query('SELECT COUNT(*) as count FROM training_programs');
    
    console.log('\n=== Table Counts ===');
    console.log(`Users: ${users[0].count}`);
    console.log(`Diet Plan Requests: ${dietRequests[0].count}`);
    console.log(`Payments: ${payments[0].count}`);
    console.log(`Subscriptions: ${subscriptions[0].count}`);
    console.log(`Training Programs: ${programs[0].count}`);
    
    // Test inserting a sample diet plan request
    console.log('\n=== Testing Diet Plan Request Insert ===');
    const [insertResult] = await db.query(
      `INSERT INTO diet_plan_requests (
        user_id, age, height_cm, weight_kg, workout_duration_minutes, 
        food_allergies, cuisine_preference, goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 25, 170, 70, 60, 'None', 'North Indian', 'Fat Loss']
    );
    console.log(`✅ Test diet plan request inserted with ID: ${insertResult.insertId}`);
    
    // Clean up test data
    await db.query('DELETE FROM diet_plan_requests WHERE id = ?', [insertResult.insertId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n=== Database Test Complete ===');
    
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
  } finally {
    await db.end();
  }
}

testDatabase(); 