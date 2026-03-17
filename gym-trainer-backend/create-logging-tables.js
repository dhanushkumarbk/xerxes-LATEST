const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createLoggingTables() {
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
    console.log('=== Creating Logging Tables ===');
    
    // Create user activity logs table
    await db.query(`CREATE TABLE IF NOT EXISTS user_activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_name VARCHAR(255),
      activity_type ENUM('login', 'logout', 'diet_plan_request', 'workout_plan_request', 'payment_attempt', 'payment_success', 'payment_failed', 'subscription_created', 'subscription_cancelled') NOT NULL,
      activity_details JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    console.log('✅ user_activity_logs table created');

    // Create payment logs table
    await db.query(`CREATE TABLE IF NOT EXISTS payment_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_name VARCHAR(255),
      payment_id INT,
      order_id VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      payment_method VARCHAR(50),
      status ENUM('initiated', 'processing', 'success', 'failed', 'cancelled') NOT NULL,
      razorpay_payment_id VARCHAR(255),
      razorpay_order_id VARCHAR(255),
      error_message TEXT,
      program_id INT,
      program_name VARCHAR(255),
      subscription_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id),
      FOREIGN KEY (program_id) REFERENCES training_programs(id),
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    )`);
    console.log('✅ payment_logs table created');

    // Create program purchase logs table
    await db.query(`CREATE TABLE IF NOT EXISTS program_purchase_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_name VARCHAR(255),
      program_id INT NOT NULL,
      program_name VARCHAR(255),
      program_price DECIMAL(10,2),
      payment_id INT,
      subscription_id INT,
      purchase_status ENUM('initiated', 'payment_pending', 'completed', 'failed', 'cancelled') NOT NULL,
      purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (program_id) REFERENCES training_programs(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id),
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    )`);
    console.log('✅ program_purchase_logs table created');

    console.log('\n=== All Logging Tables Created Successfully! ===');
    
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
  } finally {
    await db.end();
  }
}

createLoggingTables(); 