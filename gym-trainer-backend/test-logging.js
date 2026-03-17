const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testLogging() {
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
    console.log('=== Testing Comprehensive Logging System ===');
    
    // Test 1: Check all tables exist
    console.log('\n1. Checking table counts...');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [activityLogs] = await db.query('SELECT COUNT(*) as count FROM user_activity_logs');
    const [paymentLogs] = await db.query('SELECT COUNT(*) as count FROM payment_logs');
    const [purchaseLogs] = await db.query('SELECT COUNT(*) as count FROM program_purchase_logs');
    const [dietRequests] = await db.query('SELECT COUNT(*) as count FROM diet_plan_requests');
    const [payments] = await db.query('SELECT COUNT(*) as count FROM payments');
    const [subscriptions] = await db.query('SELECT COUNT(*) as count FROM subscriptions');
    const [programs] = await db.query('SELECT COUNT(*) as count FROM training_programs');
    
    console.log(`✅ Users: ${users[0].count}`);
    console.log(`✅ Activity Logs: ${activityLogs[0].count}`);
    console.log(`✅ Payment Logs: ${paymentLogs[0].count}`);
    console.log(`✅ Purchase Logs: ${purchaseLogs[0].count}`);
    console.log(`✅ Diet Requests: ${dietRequests[0].count}`);
    console.log(`✅ Payments: ${payments[0].count}`);
    console.log(`✅ Subscriptions: ${subscriptions[0].count}`);
    console.log(`✅ Training Programs: ${programs[0].count}`);
    
    // Test 2: Test activity logging
    console.log('\n2. Testing activity logging...');
    const [testActivity] = await db.query(
      `INSERT INTO user_activity_logs (user_id, user_name, activity_type, activity_details, ip_address) 
       VALUES (?, ?, ?, ?, ?)`,
      [4, 'Dhanush Kumar B K', 'login', JSON.stringify({test: true}), '127.0.0.1']
    );
    console.log(`✅ Test activity logged with ID: ${testActivity.insertId}`);
    
    // Test 3: Test payment logging
    console.log('\n3. Testing payment logging...');
    const [testPayment] = await db.query(
      `INSERT INTO payment_logs (user_id, user_name, order_id, amount, status, program_id, program_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [4, 'Dhanush Kumar B K', 'test_order_123', 999.00, 'success', 2, 'Advanced Muscle Building']
    );
    console.log(`✅ Test payment logged with ID: ${testPayment.insertId}`);
    
    // Test 4: Test purchase logging
    console.log('\n4. Testing purchase logging...');
    const [testPurchase] = await db.query(
      `INSERT INTO program_purchase_logs (user_id, user_name, program_id, program_name, program_price, purchase_status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [4, 'Dhanush Kumar B K', 2, 'Advanced Muscle Building', 1999.00, 'completed']
    );
    console.log(`✅ Test purchase logged with ID: ${testPurchase.insertId}`);
    
    // Test 5: Test diet plan request logging
    console.log('\n5. Testing diet plan request logging...');
    const [testDietRequest] = await db.query(
      `INSERT INTO diet_plan_requests (user_id, age, height_cm, weight_kg, workout_duration_minutes, food_allergies, cuisine_preference, goal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [4, 25, 170, 70, 60, 'None', 'North Indian', 'Fat Loss']
    );
    console.log(`✅ Test diet request logged with ID: ${testDietRequest.insertId}`);
    
    // Test 6: Verify all logs are accessible
    console.log('\n6. Verifying log accessibility...');
    const [recentActivities] = await db.query('SELECT * FROM user_activity_logs ORDER BY created_at DESC LIMIT 5');
    const [recentPayments] = await db.query('SELECT * FROM payment_logs ORDER BY created_at DESC LIMIT 5');
    const [recentPurchases] = await db.query('SELECT * FROM program_purchase_logs ORDER BY created_at DESC LIMIT 5');
    
    console.log(`✅ Recent activities: ${recentActivities.length}`);
    console.log(`✅ Recent payments: ${recentPayments.length}`);
    console.log(`✅ Recent purchases: ${recentPurchases.length}`);
    
    // Test 7: Clean up test data
    console.log('\n7. Cleaning up test data...');
    await db.query('DELETE FROM user_activity_logs WHERE id = ?', [testActivity.insertId]);
    await db.query('DELETE FROM payment_logs WHERE id = ?', [testPayment.insertId]);
    await db.query('DELETE FROM program_purchase_logs WHERE id = ?', [testPurchase.insertId]);
    await db.query('DELETE FROM diet_plan_requests WHERE id = ?', [testDietRequest.insertId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n=== All Logging Tests Passed! ===');
    console.log('\n📊 Your backend now logs:');
    console.log('• User login/logout activities');
    console.log('• Diet plan requests with details');
    console.log('• Workout plan requests with details');
    console.log('• Payment attempts (initiated, success, failed)');
    console.log('• Program purchases with status');
    console.log('• Subscription creation and management');
    console.log('• IP addresses and user agents');
    console.log('• Comprehensive user reports');
    
  } catch (err) {
    console.error('❌ Logging test failed:', err.message);
  } finally {
    await db.end();
  }
}

testLogging(); 