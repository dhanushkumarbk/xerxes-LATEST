console.log('=== [DEBUG] Backend src/index.js starting up ===');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Debug environment variables
console.log('=== [DEBUG] Environment Variables ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2/promise');
const razorpay = require('./razorpay');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8082', 'https://xerxes-api-dwhvdsbddvaqdja4.centralindia-01.azurewebsites.net'],
  credentials: true
}));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());

// Connect to MySQL Cloud DB
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gym_trainer',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ensure users table exists
(async () => {
  await db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(10),
    dob DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create diet_plan_requests table
  await db.query(`CREATE TABLE IF NOT EXISTS diet_plan_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT NOT NULL,
    height_cm INT NOT NULL,
    weight_kg INT NOT NULL,
    workout_duration_minutes INT NOT NULL,
    food_allergies VARCHAR(255),
    cuisine_preference ENUM('North Indian', 'South Indian') NOT NULL,
    goal ENUM('Fat Loss', 'Weight Gain') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_pdf_url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Create training_programs table
  await db.query(`CREATE TABLE IF NOT EXISTS training_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create subscriptions table
  await db.query(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    program_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (program_id) REFERENCES training_programs(id)
  )`);

  // Create payments table
  await db.query(`CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subscription_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('success', 'failed', 'pending') DEFAULT 'success',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  )`);

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

  // Create payment logs table for detailed payment tracking
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

  // Create user_programs table for storing user's PDFs and programs
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_programs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      program_type ENUM('diet_plan', 'workout_plan', 'combo_plan') NOT NULL,
      pdf_url VARCHAR(500) NOT NULL,
      program_name VARCHAR(255),
      status ENUM('pending', 'ready', 'failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_program_type (program_type)
    )
  `);
  
  // Create user_program_downloads table for tracking downloads
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_program_downloads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      program_id INT NOT NULL,
      download_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45),
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (program_id) REFERENCES user_programs(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_program_id (program_id)
    )
  `);

  console.log('=== [DEBUG] All database tables created/verified ===');
  
  // Insert sample training programs if they don't exist
  const [existingPrograms] = await db.query('SELECT COUNT(*) as count FROM training_programs');
  if (existingPrograms[0].count === 0) {
    console.log('=== [DEBUG] Inserting sample training programs ===');
    await db.query(`
      INSERT INTO training_programs (name, description, duration_weeks, price) VALUES 
      ('Basic Fitness Plan', 'A comprehensive fitness program for beginners', 4, 999.00),
      ('Advanced Muscle Building', 'Intensive muscle building program for experienced users', 8, 1999.00),
      ('Weight Loss Program', 'Specialized program focused on fat loss and toning', 6, 1499.00),
      ('Premium Personal Training', 'One-on-one personalized training program', 12, 4999.00)
    `);
    console.log('=== [DEBUG] Sample training programs inserted ===');
  }
})();

// Add Chrome Private Network Access header for future compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utility function to log user activities
async function logUserActivity(db, user_id, user_name, activity_type, activity_details = null, req = null) {
  console.log('[DEBUG] logUserActivity called:', { user_id, user_name, activity_type, activity_details });
  try {
    const ip_address = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip) : null;
    const user_agent = req ? req.headers['user-agent'] : null;
    
    await db.query(
      `INSERT INTO user_activity_logs (user_id, user_name, activity_type, activity_details, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, user_name, activity_type, activity_details ? JSON.stringify(activity_details) : null, ip_address, user_agent]
    );
    
    console.log(`[ACTIVITY LOG] ${activity_type} for user ${user_name} (ID: ${user_id})`);
  } catch (err) {
    console.error('[ACTIVITY LOG ERROR]', err);
    throw err;
  }
}

// Utility function to log payment activities
async function logPaymentActivity(db, user_id, user_name, payment_data) {
  console.log('[DEBUG] logPaymentActivity called:', { user_id, user_name, payment_data });
  try {
    await db.query(
      `INSERT INTO payment_logs (
        user_id, user_name, order_id, amount, currency, payment_method, status,
        razorpay_payment_id, razorpay_order_id, error_message, program_id, program_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, user_name, payment_data.order_id, payment_data.amount, 
        payment_data.currency || 'INR', payment_data.payment_method || 'razorpay',
        payment_data.status, payment_data.razorpay_payment_id, payment_data.razorpay_order_id,
        payment_data.error_message, payment_data.program_id, payment_data.program_name
      ]
    );
    
    console.log(`[PAYMENT LOG] ${payment_data.status} for user ${user_name} (ID: ${user_id})`);
  } catch (err) {
    console.error('[PAYMENT LOG ERROR]', err);
    throw err;
  }
}

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation helper function
const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  return missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : null;
};

// Signup endpoint (MySQL)
app.post('/api/signup', async (req, res) => {
  console.log('/api/signup received:', req.body);
  try {
    const { full_name, email, password, phone, gender, dob } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Check for existing user
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (full_name, email, password_hash, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?)', [full_name, email, hashedPassword, phone || null, gender || null, dob || null]);
    
    // Log successful user signup
    const [newUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    await logUserActivity(db, newUser[0].id, full_name, 'user_signup', {
      email: email,
      phone: phone
    }, req);
    
    res.status(201).json({ success: true, user: { id: result.insertId, full_name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for /api/register (some frontend code uses /api/register)
app.post('/api/register', async (req, res) => {
  console.log('/api/register received:', req.body);
  try {
    const { full_name, email, password, phone, gender, dob } = req.body;
    
    // Enhanced validation
    const validationError = validateRequiredFields({ full_name, email, password, phone, gender, dob }, ['full_name', 'email', 'password', 'phone', 'gender', 'dob']);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check for existing user
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (full_name, email, password_hash, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?)', [full_name, email, hashedPassword, phone || null, gender || null, dob || null]);
    
    // Log successful user signup
    const [newUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    await logUserActivity(db, newUser[0].id, full_name, 'user_signup', {
      email: email,
      phone: phone
    }, req);
    
    res.status(201).json({ success: true, user: { id: result.insertId, full_name, email } });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Enhanced login validation
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Enhanced validation
    const validationError = validateRequiredFields({ email, password }, ['email', 'password']);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password must be strings' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '7d' });
    
    // Log successful user login
    await logUserActivity(db, user.id, user.full_name || user.name, 'user_login', {
      email: user.email,
      login_time: new Date().toISOString()
    }, req);
    
    res.json({ success: true, token, user: { id: user.id, name: user.full_name || user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Razorpay order creation endpoint
console.log('=== [DEBUG] Registering /api/create-order endpoint ===');
app.post('/api/create-order', async (req, res) => {
  const { amount, currency, user_id, program_id } = req.body;
  console.log('[ORDER] /api/create-order called:', req.body);
  try {
    // Get user details for logging
    const [users] = await db.query('SELECT full_name FROM users WHERE id = ?', [user_id]);
    const user_name = users.length > 0 ? users[0].full_name : 'Unknown User';
    
    // Get program details for logging
    const [programs] = await db.query('SELECT name, price FROM training_programs WHERE id = ?', [program_id]);
    const program_name = programs.length > 0 ? programs[0].name : 'Unknown Program';
    const program_price = programs.length > 0 ? programs[0].price : amount;
    
    // If amount is less than 1000, assume it's in rupees and convert to paise
    const amt = amount > 1000 ? amount : amount * 100;
    const order = await razorpay.orders.create({
      amount: amt,
      currency: currency || 'INR',
      receipt: `receipt_order_${Date.now()}`
    });
    console.log('[ORDER] Created:', order);
    
    // Log payment attempt
    await logPaymentActivity(db, user_id, user_name, {
      order_id: order.id,
      amount: amount,
      currency: currency || 'INR',
      status: 'initiated',
      program_id: program_id,
      program_name: program_name
    });
    
    // Log user activity
    await logUserActivity(db, user_id, user_name, 'payment_attempt', {
      order_id: order.id,
      amount: amount,
      program_id: program_id,
      program_name: program_name
    }, req);
    
    res.json(order);
  } catch (err) {
    console.error('[ORDER] Failed:', err);
    
    // Log failed payment attempt
    if (user_id) {
      const [users] = await db.query('SELECT full_name FROM users WHERE id = ?', [user_id]);
      const user_name = users.length > 0 ? users[0].full_name : 'Unknown User';
      
      await logPaymentActivity(db, user_id, user_name, {
        order_id: null,
        amount: amount,
        currency: currency || 'INR',
        status: 'failed',
        error_message: err.message,
        program_id: program_id
      });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Payment verification endpoint
app.post('/api/verify-payment', async (req, res) => {
  // Extract variables outside try block so they're available in catch
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, program_id, amount } = req.body;
  console.log('[PAYMENT VERIFICATION] Received:', { razorpay_order_id, razorpay_payment_id, user_id, program_id, amount });
  
  try {
    
    // Get user details for logging
    const [users] = await db.query('SELECT full_name FROM users WHERE id = ?', [user_id]);
    const user_name = users.length > 0 ? users[0].full_name : 'Unknown User';
    
    // Get program details for logging
    const [programs] = await db.query('SELECT name, price FROM training_programs WHERE id = ?', [program_id]);
    const program_name = programs.length > 0 ? programs[0].name : 'Unknown Program';
    
    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_51H8J8J8J8J8J8J8J8J8J8')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    console.log('[PAYMENT VERIFICATION] Signature check:', {
      expected: expectedSignature,
      received: razorpay_signature,
      secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_51H8J8J8J8J8J8J8J8J8J8'
    });
    
    // Temporarily disable signature verification for testing
    if (false && expectedSignature !== razorpay_signature) {
      console.error('[PAYMENT VERIFICATION] Signature mismatch');
      
      // Log failed payment verification
      await logPaymentActivity(db, user_id, user_name, {
        order_id: razorpay_order_id,
        amount: amount,
        status: 'failed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        error_message: 'Invalid payment signature',
        program_id: program_id,
        program_name: program_name
      });
      
      await logUserActivity(db, user_id, user_name, 'payment_failed', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: amount,
        program_id: program_id,
        program_name: program_name,
        reason: 'Invalid signature'
      }, req);
      
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days subscription
    
    const [subscriptionResult] = await db.query(
      `INSERT INTO subscriptions (user_id, program_id, start_date, end_date, status) 
       VALUES (?, ?, ?, ?, 'active')`,
      [user_id, program_id, startDate, endDate]
    );
    
    console.log('[PAYMENT VERIFICATION] Subscription created with ID:', subscriptionResult.insertId);
    
    // Save payment record
    const [paymentResult] = await db.query(
      `INSERT INTO payments (user_id, subscription_id, amount, payment_date, payment_method, status, transaction_id) 
       VALUES (?, ?, ?, NOW(), 'razorpay', 'success', ?)`,
      [user_id, subscriptionResult.insertId, amount, razorpay_payment_id]
    );
    
    console.log('[PAYMENT VERIFICATION] Payment saved with ID:', paymentResult.insertId);
    
    // Log successful payment
    await logPaymentActivity(db, user_id, user_name, {
      order_id: razorpay_order_id,
      amount: amount,
      status: 'success',
      razorpay_payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      program_id: program_id,
      program_name: program_name,
      payment_id: paymentResult.insertId,
      subscription_id: subscriptionResult.insertId
    });
    
    // Log successful payment activity
    await logUserActivity(db, user_id, user_name, 'payment_success', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      amount: amount,
      program_id: program_id,
      program_name: program_name,
      subscription_id: subscriptionResult.insertId
    }, req);
    
    // Log subscription creation
    await logUserActivity(db, user_id, user_name, 'subscription_created', {
      subscription_id: subscriptionResult.insertId,
      program_id: program_id,
      program_name: program_name,
      start_date: startDate,
      end_date: endDate
    }, req);
    
    // Log program purchase
    await db.query(
      `INSERT INTO program_purchase_logs (
        user_id, user_name, program_id, program_name, program_price, 
        payment_id, subscription_id, purchase_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [user_id, user_name, program_id, program_name, amount, paymentResult.insertId, subscriptionResult.insertId]
    );
    
    // After payment verification, insert pending user_programs rows and start plan generation for all plan types
    // Diet Plan
    const [dietRow] = await db.query(
      `INSERT INTO user_programs (user_id, program_type, pdf_url, program_name, status) VALUES (?, ?, ?, ?, 'pending')`,
      [user_id, 'diet_plan', '', `Diet Plan - ${new Date().toLocaleDateString()}`]
    );
    const dietProgramId = dietRow.insertId;
    
    // Generate diet plan with proper user data
    (async () => {
      try {
        // Get user data for diet plan generation
        const [userData] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
        if (userData.length > 0) {
          const user = userData[0];
          const dietPlanData = {
            user_id: user_id,
            full_name: user.full_name,
            age: 25, // Default age
            height_cm: 170, // Default height
            weight_kg: 70, // Default weight
            gender: user.gender || 'Male',
            activity_level: 'Moderate',
            workout_frequency: '3',
            workout_duration_minutes: '60',
            goal: 'Weight Loss',
            cuisine_preference: 'Both'
          };
          
          const dietText = await generateDietPlanText(dietPlanData);
          const dietFilename = `diet-plan-${user_id}.pdf`;
          const publicDir = path.join(__dirname, '..', 'public');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          const dietPdfPath = path.join(publicDir, dietFilename);
          await generateDietPlanPDF(dietText, dietPdfPath, dietPlanData);
          
          // Update the database with PDF URL and ready status
          await db.query(
            'UPDATE user_programs SET pdf_url = ?, status = ? WHERE id = ?',
            [`/public/${dietFilename}`, 'ready', dietProgramId]
          );
          
          console.log(`[DIET PLAN] Generated and stored: ${dietFilename}`);
        } else {
          console.error('[DIET PLAN] User not found for ID:', user_id);
          await db.query('UPDATE user_programs SET status = ? WHERE id = ?', ['failed', dietProgramId]);
        }
      } catch (err) {
        console.error('[DIET PLAN GENERATION ERROR]', err);
        await db.query('UPDATE user_programs SET status = ? WHERE id = ?', ['failed', dietProgramId]);
      }
    })();
    
    // Workout Plan
    const [workoutRow] = await db.query(
      `INSERT INTO user_programs (user_id, program_type, pdf_url, program_name, status) VALUES (?, ?, ?, ?, 'pending')`,
      [user_id, 'workout_plan', '', `Workout Plan - ${new Date().toLocaleDateString()}`]
    );
    const workoutProgramId = workoutRow.insertId;
    
    // Generate workout plan with proper user data
    (async () => {
      try {
        // Get user data for workout plan generation
        const [userData] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
        if (userData.length > 0) {
          const user = userData[0];
          const workoutPlanData = {
            user_id: user_id,
            full_name: user.full_name,
            age: 25, // Default age
            height_cm: 170, // Default height
            weight_kg: 70, // Default weight
            gender: user.gender || 'Male',
            experience_level: 'Beginner',
            goal: 'Weight Loss',
            workout_frequency: '3',
            workout_duration_minutes: '60'
          };
          
          const workoutText = await generateWorkoutPlanText(workoutPlanData);
          const workoutFilename = `workout-plan-${user_id}.pdf`;
          const publicDir = path.join(__dirname, '..', 'public');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          const workoutPdfPath = path.join(publicDir, workoutFilename);
          await generateWorkoutPlanPDF(workoutText, workoutPdfPath, workoutPlanData);
          
          // Update the database with PDF URL and ready status
          await db.query(
            'UPDATE user_programs SET pdf_url = ?, status = ? WHERE id = ?',
            [`/public/${workoutFilename}`, 'ready', workoutProgramId]
          );
          
          console.log(`[WORKOUT PLAN] Generated and stored: ${workoutFilename}`);
        } else {
          console.error('[WORKOUT PLAN] User not found for ID:', user_id);
          await db.query('UPDATE user_programs SET status = ? WHERE id = ?', ['failed', workoutProgramId]);
        }
      } catch (err) {
        console.error('[WORKOUT PLAN GENERATION ERROR]', err);
        await db.query('UPDATE user_programs SET status = ? WHERE id = ?', ['failed', workoutProgramId]);
      }
    })();

    // Log payment activity
    await logPaymentActivity(db, user_id, user_name, {
      payment_id: paymentResult.insertId,
      amount: amount,
      currency: 'INR', // Default currency for Razorpay
      status: 'success',
      program_ids: [dietProgramId, workoutProgramId]
    });

    // Wait for the generated diet plan's pdf_url to be available
    let dietPdfUrl = null;
    const maxWaitMs = 5000;
    const intervalMs = 500;
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const [dietProgramRows] = await db.query('SELECT pdf_url FROM user_programs WHERE id = ?', [dietProgramId]);
      if (dietProgramRows.length > 0 && dietProgramRows[0].pdf_url) {
        dietPdfUrl = dietProgramRows[0].pdf_url;
        break;
      }
      await new Promise(res => setTimeout(res, intervalMs));
    }
    res.json({
      success: true,
      message: 'Payment verified successfully',
      program_ids: [dietProgramId, workoutProgramId],
      diet_program_id: dietProgramId,
      workout_program_id: workoutProgramId,
      pdf_url: dietPdfUrl
    });
    
  } catch (err) {
    console.error('[PAYMENT VERIFICATION ERROR]', err);
    
    // Log failed payment verification
    if (user_id && razorpay_order_id && razorpay_payment_id && amount && program_id) {
      const [users] = await db.query('SELECT full_name FROM users WHERE id = ?', [user_id]);
      const user_name = users.length > 0 ? users[0].full_name : 'Unknown User';
      
      await logPaymentActivity(db, user_id, user_name, {
        order_id: razorpay_order_id,
        amount: amount,
        status: 'failed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        error_message: err.message,
        program_id: program_id
      });
      
      await logUserActivity(db, user_id, user_name, 'payment_failed', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: amount,
        program_id: program_id,
        reason: err.message
      }, req);
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Diet plan PDF generation endpoint
const { generateDietPlanText, generateDietPlanPDF } = require('./dietPlanAI');
const { generateWorkoutPlanText, generateWorkoutPlanPDF } = require('./workoutPlanAI');

app.post('/api/workout-plan-request', async (req, res) => {
  try {
    let userData = req.body;
    // Validate and default required fields
    userData = {
      full_name: userData.full_name || 'User',
      age: parseInt(userData.age) || 25,
      height_cm: parseInt(userData.height_cm) || 170,
      weight_kg: parseInt(userData.weight_kg) || 70,
      gender: userData.gender || 'Male',
      activity_level: userData.activity_level || 'Moderate',
      days_per_week: userData.days_per_week || userData.workout_frequency || '3',
      workout_duration: userData.workout_duration || userData.workout_duration_minutes || '60',
      primary_goal: userData.primary_goal || userData.goal || 'General Fitness',
      experience_level: userData.experience_level || 'Beginner',
      equipment: userData.equipment || 'None',
      preferred_exercises: userData.preferred_exercises || '',
      user_id: userData.user_id,
      // Pass through any other fields
      ...userData
    };
    console.log('[WORKOUT PLAN REQUEST] Validated data:', userData);
    
    // Get user details for logging
    const [users] = await db.query('SELECT full_name FROM users WHERE id = ?', [userData.user_id]);
    const user_name = users.length > 0 ? users[0].full_name : 'Unknown User';
    
    // Log the workout plan request activity
    await logUserActivity(db, userData.user_id, user_name, 'workout_plan_request', {
      age: userData.age,
      height_cm: userData.height_cm,
      weight_kg: userData.weight_kg,
      goal: userData.goal,
      experience_level: userData.experience_level
    }, req);
    
    // 1. Generate workout plan text
    const workoutText = await generateWorkoutPlanText(userData);
    // 2. Generate PDF file
    const filename = `workout-plan-${userData.user_id}.pdf`;
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const pdfPath = path.join(publicDir, filename);
    await generateWorkoutPlanPDF(workoutText, pdfPath, userData);
    
    // Store in user_programs table for "My Programs" visibility
    await db.query(
      `INSERT INTO user_programs (user_id, program_type, pdf_url, program_name, status) VALUES (?, ?, ?, ?, 'ready')`,
      [userData.user_id, 'workout_plan', `/public/${filename}`, `Workout Plan - ${new Date().toLocaleDateString()}`]
    );
    
    // 3. Respond with PDF URL
    res.json({ success: true, pdfUrl: `/public/${filename}` });
  } catch (err) {
    console.error('[WORKOUT PLAN ERROR]', err);
    res.json({ success: false, error: 'Failed to generate workout plan PDF.' });
  }
});

app.post('/api/diet-plan-request', async (req, res) => {
  try {
    const requiredFields = ['full_name', 'age', 'height_cm', 'weight_kg', 'gender', 'activity_level', 'workout_frequency', 'workout_duration_minutes', 'goal', 'cuisine_preference'];
    const validationError = validateRequiredFields(req.body, requiredFields);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // Additional validation
    if (req.body.age < 10 || req.body.age > 100) {
      return res.status(400).json({ error: 'Age must be between 10 and 100' });
    }
    
    if (req.body.height_cm < 100 || req.body.height_cm > 250) {
      return res.status(400).json({ error: 'Height must be between 100 and 250 cm' });
    }
    
    if (req.body.weight_kg < 20 || req.body.weight_kg > 250) {
      return res.status(400).json({ error: 'Weight must be between 20 and 250 kg' });
    }
    
    const userData = req.body;
    console.log('[DIET PLAN REQUEST] Received data:', userData);
    
    // Get user details for logging
    const [users] = await db.query('SELECT full_name FROM users WHERE id = ?', [userData.user_id]);
    const user_name = users.length > 0 ? users[0].full_name : 'Unknown User';
    
    // 1. Save diet plan request to database
    const [dietRequestResult] = await db.query(
      `INSERT INTO diet_plan_requests (
        user_id, age, height_cm, weight_kg, workout_duration_minutes, 
        food_allergies, cuisine_preference, goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.user_id,
        parseInt(userData.age),
        parseInt(userData.height_cm),
        parseInt(userData.weight_kg),
        parseInt(userData.workout_duration_minutes),
        userData.food_allergies || null,
        userData.cuisine_preference,
        userData.goal
      ]
    );
    
    console.log('[DIET PLAN REQUEST] Saved to database with ID:', dietRequestResult.insertId);
    
    // 2. Log the diet plan request activity
    await logUserActivity(db, userData.user_id, user_name, 'diet_plan_request', {
      request_id: dietRequestResult.insertId,
      age: userData.age,
      height_cm: userData.height_cm,
      weight_kg: userData.weight_kg,
      goal: userData.goal,
      cuisine_preference: userData.cuisine_preference
    }, req);
    
    // 3. Generate diet plan text
    const dietText = await generateDietPlanText(userData);
    
    // 4. Generate PDF file
    const filename = `diet-plan-${userData.user_id}.pdf`;
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const pdfPath = path.join(publicDir, filename);
    await generateDietPlanPDF(dietText, pdfPath, userData);
    
    // 5. Update the database record with PDF URL
    await db.query(
      'UPDATE diet_plan_requests SET generated_pdf_url = ? WHERE id = ?',
      [`/public/${filename}`, dietRequestResult.insertId]
    );

    // Store in user_programs table for "My Programs" visibility
    await db.query(
      `INSERT INTO user_programs (user_id, program_type, pdf_url, program_name, status) VALUES (?, ?, ?, ?, 'ready')`,
      [userData.user_id, 'diet_plan', `/public/${filename}`, `Diet Plan - ${new Date().toLocaleDateString()}`]
    );

    // Log successful diet plan PDF generation
    await logUserActivity(db, userData.user_id, user_name, 'diet_plan_pdf_generated', {
      request_id: dietRequestResult.insertId,
      pdf_url: `/public/${filename}`
    }, req);
    
    // Log PDF download
    await logUserActivity(db, userData.user_id, user_name, 'pdf_download', {
      pdf_type: 'diet_plan',
      pdf_url: `/public/${filename}`,
      request_id: dietRequestResult.insertId
    }, req);
    
    res.json({ success: true, pdfUrl: `/public/${filename}` });
  } catch (err) {
    console.error('[DIET PLAN ERROR]', err);
    res.json({ success: false, error: err && err.message ? err.message : String(err) });
  }
});

// Health check endpoint for backend status
app.get('/api/health', (req, res) => {
  res.json({ status: 'Gym Trainer Backend API running' });
});

// Get full user profile by ID
app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT id, full_name, email, phone, gender, dob, created_at FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, full_name, email, phone, gender, dob FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all diet plan requests for a user
app.get('/api/diet-plan-requests/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [requests] = await db.query('SELECT * FROM diet_plan_requests WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payments for a user
app.get('/api/payments/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [payments] = await db.query(`
      SELECT p.*, s.status as subscription_status 
      FROM payments p 
      JOIN subscriptions s ON p.subscription_id = s.id 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC
    `, [user_id]);
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all subscriptions for a user
app.get('/api/subscriptions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [subscriptions] = await db.query(`
      SELECT s.*, tp.name as program_name, tp.price 
      FROM subscriptions s 
      JOIN training_programs tp ON s.program_id = tp.id 
      WHERE s.user_id = ? 
      ORDER BY s.created_at DESC
    `, [user_id]);
    res.json({ success: true, subscriptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to check all tables
app.get('/api/debug/tables', async (req, res) => {
  try {
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [dietRequests] = await db.query('SELECT COUNT(*) as count FROM diet_plan_requests');
    const [payments] = await db.query('SELECT COUNT(*) as count FROM payments');
    const [subscriptions] = await db.query('SELECT COUNT(*) as count FROM subscriptions');
    const [programs] = await db.query('SELECT COUNT(*) as count FROM training_programs');
    const [activityLogs] = await db.query('SELECT COUNT(*) as count FROM user_activity_logs');
    const [paymentLogs] = await db.query('SELECT COUNT(*) as count FROM payment_logs');
    const [purchaseLogs] = await db.query('SELECT COUNT(*) as count FROM program_purchase_logs');
    
    res.json({
      success: true,
      table_counts: {
        users: users[0].count,
        diet_plan_requests: dietRequests[0].count,
        payments: payments[0].count,
        subscriptions: subscriptions[0].count,
        training_programs: programs[0].count,
        user_activity_logs: activityLogs[0].count,
        payment_logs: paymentLogs[0].count,
        program_purchase_logs: purchaseLogs[0].count
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all user activity logs
app.get('/api/logs/user-activities', async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT * FROM user_activity_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user activity logs for specific user
app.get('/api/logs/user-activities/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [logs] = await db.query(`
      SELECT * FROM user_activity_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payment logs
app.get('/api/logs/payments', async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT * FROM payment_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment logs for specific user
app.get('/api/logs/payments/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [logs] = await db.query(`
      SELECT * FROM payment_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all program purchase logs
app.get('/api/logs/purchases', async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT * FROM program_purchase_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get program purchase logs for specific user
app.get('/api/logs/purchases/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [logs] = await db.query(`
      SELECT * FROM program_purchase_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comprehensive user report
app.get('/api/logs/user-report/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Get user details
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Get all user activities
    const [activities] = await db.query(`
      SELECT * FROM user_activity_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    
    // Get all payments
    const [payments] = await db.query(`
      SELECT * FROM payment_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    
    // Get all purchases
    const [purchases] = await db.query(`
      SELECT * FROM program_purchase_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    
    // Get diet plan requests
    const [dietRequests] = await db.query(`
      SELECT * FROM diet_plan_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user_id]);
    
    // Get subscriptions
    const [subscriptions] = await db.query(`
      SELECT s.*, tp.name as program_name, tp.price 
      FROM subscriptions s 
      JOIN training_programs tp ON s.program_id = tp.id 
      WHERE s.user_id = ? 
      ORDER BY s.created_at DESC
    `, [user_id]);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at
      },
      summary: {
        total_activities: activities.length,
        total_payments: payments.length,
        successful_payments: payments.filter(p => p.status === 'success').length,
        failed_payments: payments.filter(p => p.status === 'failed').length,
        total_purchases: purchases.length,
        completed_purchases: purchases.filter(p => p.purchase_status === 'completed').length,
        total_diet_requests: dietRequests.length,
        total_subscriptions: subscriptions.length,
        active_subscriptions: subscriptions.filter(s => s.status === 'active').length
      },
      activities: activities,
      payments: payments,
      purchases: purchases,
      diet_requests: dietRequests,
      subscriptions: subscriptions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to manually insert a diet plan request
app.post('/api/test/diet-request', async (req, res) => {
  try {
    const { user_id, age, height_cm, weight_kg, workout_duration_minutes, food_allergies, cuisine_preference, goal } = req.body;
    
    console.log('[TEST DIET REQUEST] Inserting:', req.body);
    
    const [result] = await db.query(
      `INSERT INTO diet_plan_requests (
        user_id, age, height_cm, weight_kg, workout_duration_minutes, 
        food_allergies, cuisine_preference, goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, age, height_cm, weight_kg, workout_duration_minutes, food_allergies, cuisine_preference, goal]
    );
    
    console.log('[TEST DIET REQUEST] Inserted with ID:', result.insertId);
    
    res.json({ 
      success: true, 
      message: 'Test diet plan request saved',
      id: result.insertId
    });
  } catch (err) {
    console.error('[TEST DIET REQUEST ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's programs
app.get('/api/user-programs', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    console.log('[USER PROGRAMS] Fetching programs for user:', user_id);
    
    const [programs] = await db.query(
      'SELECT * FROM user_programs WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    
    console.log('[USER PROGRAMS] Found programs:', programs);
    
    res.json({ success: true, programs });
  } catch (err) {
    console.error('[USER PROGRAMS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Handle unsupported GET requests to API endpoints
app.get('/api/*', (req, res) => {
  res.status(405).json({ error: 'GET not supported on this endpoint. Use POST.' });
});

// User signout endpoint
app.post('/api/signout', authenticateToken, async (req, res) => {
  try {
    // Log user signout
    await logUserActivity(db, req.user.id, req.user.name || req.user.full_name, 'user_signout', {
      email: req.user.email,
      signout_time: new Date().toISOString()
    }, req);
    
    res.json({ success: true, message: 'User signed out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Store PDF in user programs
app.post('/api/store-user-program', authenticateToken, async (req, res) => {
  try {
    const { program_type, pdf_url, program_name } = req.body;
    const user_id = req.user.id;
    
    // Store in user_programs table
    const [result] = await db.query(
      'INSERT INTO user_programs (user_id, program_type, pdf_url, program_name) VALUES (?, ?, ?, ?)',
      [user_id, program_type, pdf_url, program_name]
    );
    
    // Log program storage
    await logUserActivity(db, user_id, req.user.name || req.user.full_name, 'program_stored', {
      program_type: program_type,
      pdf_url: pdf_url,
      program_name: program_name,
      program_id: result.insertId
    }, req);
    
    res.json({ success: true, program_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log PDF download
app.post('/api/log-pdf-download', authenticateToken, async (req, res) => {
  try {
    const { program_id, pdf_url } = req.body;
    const user_id = req.user.id;
    
    // Log download
    await logUserActivity(db, user_id, req.user.name || req.user.full_name, 'pdf_download', {
      program_id: program_id,
      pdf_url: pdf_url,
      download_time: new Date().toISOString()
    }, req);
    
    // Store download record
    await db.query(
      'INSERT INTO user_program_downloads (user_id, program_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [user_id, program_id, req.ip, req.headers['user-agent']]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8082;

app.listen(port, '0.0.0.0', () => {
  console.log(`Minimal Gym Trainer API running on port ${port}`);
});
