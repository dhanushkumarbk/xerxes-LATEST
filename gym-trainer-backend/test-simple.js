const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testSimple() {
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
    console.log('=== Simple Database Test ===');
    
    // Test basic insert
    const [result] = await db.query(
      `INSERT INTO diet_plan_requests (
        user_id, age, height_cm, weight_kg, workout_duration_minutes, 
        food_allergies, cuisine_preference, goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 25, 170, 70, 60, 'None', 'North Indian', 'Fat Loss']
    );
    
    console.log('✅ Insert successful, ID:', result.insertId);
    
    // Check count
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM diet_plan_requests');
    console.log('✅ Total diet plan requests:', countResult[0].count);
    
    // Clean up
    await db.query('DELETE FROM diet_plan_requests WHERE id = ?', [result.insertId]);
    console.log('✅ Test data cleaned up');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await db.end();
  }
}

testSimple(); 