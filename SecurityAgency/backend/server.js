const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'jshunjed@2024',
  database: process.env.DB_NAME || 'securityagency',
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
    // Query user from database using your schema (user_id, password_hash)
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Check if password is hashed or plain text
    let isPasswordValid = false;
    if (user.password_hash.startsWith('$2')) {
      // Password is hashed with bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // Password is plain text (temporary for migration)
      isPasswordValid = password === user.password_hash;
      
      // If login successful with plain password, hash it for next time
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE user_id = $2',
          [hashedPassword, user.user_id]
        );
        console.log(`Password hashed for user: ${user.email}`);
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Return success with user data (excluding password)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        name: user.email.split('@')[0], // Extract name from email
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Hash all plain text passwords (run once to secure existing users)
app.get('/api/hash-passwords', async (req, res) => {
  try {
    // Get all users with plain text passwords
    const result = await pool.query(
      "SELECT user_id, email, password_hash FROM users WHERE password_hash NOT LIKE '$2%'"
    );

    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'All passwords are already hashed!' 
      });
    }

    // Hash each plain text password
    for (const user of result.rows) {
      const hashedPassword = await bcrypt.hash(user.password_hash, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE user_id = $2',
        [hashedPassword, user.user_id]
      );
    }

    res.json({ 
      success: true, 
      message: `Successfully hashed passwords for ${result.rows.length} user(s)`,
      users: result.rows.map(u => u.email)
    });
  } catch (error) {
    console.error('Hash passwords error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error hashing passwords',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api/setup to initialize the database`);
});
