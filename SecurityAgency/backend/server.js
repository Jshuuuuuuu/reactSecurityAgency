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
  password: process.env.DB_PASSWORD || '123',
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

// ============= PERSONNEL MANAGEMENT API =============

// Get all personnel with optional search
app.get('/api/personnel', async (req, res) => {
  const { search } = req.query;
  
  try {
    let query = `
      SELECT 
        p.personnel_id,
        p.personnel_name,
        p.personnel_age,
        p.contact_no,
        p.email,
        p.civilstatus_id,
        p.gender_id,
        p.address_id,
        cs.title as civil_status,
        g.gender_name as gender,
        a.street,
        a.barangay,
        a.city,
        a.province,
        a.postal_code,
        CONCAT_WS(', ', 
          NULLIF(a.street, ''), 
          NULLIF(a.barangay, ''), 
          NULLIF(a.city, ''), 
          NULLIF(a.province, '')
        ) as address
      FROM personnel p
      LEFT JOIN civilstatus cs ON p.civilstatus_id = cs.civilstatus_id
      LEFT JOIN gender g ON p.gender_id = g.gender_id
      LEFT JOIN address a ON p.address_id = a.address_id
    `;
    
    const params = [];
    if (search) {
      query += ` WHERE LOWER(p.personnel_name) LIKE LOWER($1) 
                 OR LOWER(p.email) LIKE LOWER($1) 
                 OR LOWER(p.contact_no) LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY p.personnel_id DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({ success: false, message: 'Error fetching personnel' });
  }
});

// Get single personnel by ID
app.get('/api/personnel/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.*,
        cs.title as civil_status,
        g.gender_name as gender
      FROM personnel p
      LEFT JOIN civilstatus cs ON p.civilstatus_id = cs.civilstatus_id
      LEFT JOIN gender g ON p.gender_id = g.gender_id
      WHERE p.personnel_id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({ success: false, message: 'Error fetching personnel' });
  }
});

// Add new personnel
app.post('/api/personnel', async (req, res) => {
  const { 
    personnel_name, 
    personnel_age, 
    civilstatus_id, 
    gender_id, 
    contact_no, 
    email,
    street,
    barangay,
    city,
    province,
    postal_code
  } = req.body;

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Insert address first
    let address_id = null;
    if (street || barangay || city || province) {
      const addressResult = await pool.query(
        `INSERT INTO address (street, barangay, city, province, postal_code)
         VALUES ($1, $2, $3, $4, $5) RETURNING address_id`,
        [street, barangay, city, province, postal_code]
      );
      address_id = addressResult.rows[0].address_id;
    }

    // Insert personnel
    const personnelResult = await pool.query(
      `INSERT INTO personnel (personnel_name, personnel_age, civilstatus_id, gender_id, address_id, contact_no, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [personnel_name, personnel_age, civilstatus_id, gender_id, address_id, contact_no, email]
    );

    await pool.query('COMMIT');
    res.json({ success: true, message: 'Personnel added successfully', data: personnelResult.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Add personnel error:', error);
    res.status(500).json({ success: false, message: 'Error adding personnel', error: error.message });
  }
});

// Update personnel
app.put('/api/personnel/:id', async (req, res) => {
  const { 
    personnel_name, 
    personnel_age, 
    civilstatus_id, 
    gender_id, 
    contact_no, 
    email,
    street,
    barangay,
    city,
    province,
    postal_code
  } = req.body;

  let address_id = req.body.address_id;

  try {
    await pool.query('BEGIN');

    // Update or create address
    if (address_id) {
      await pool.query(
        `UPDATE address SET street = $1, barangay = $2, city = $3, province = $4, postal_code = $5
         WHERE address_id = $6`,
        [street, barangay, city, province, postal_code, address_id]
      );
    } else if (street || barangay || city || province) {
      const addressResult = await pool.query(
        `INSERT INTO address (street, barangay, city, province, postal_code)
         VALUES ($1, $2, $3, $4, $5) RETURNING address_id`,
        [street, barangay, city, province, postal_code]
      );
      address_id = addressResult.rows[0].address_id;
    }

    // Update personnel
    const result = await pool.query(
      `UPDATE personnel 
       SET personnel_name = $1, personnel_age = $2, civilstatus_id = $3, 
           gender_id = $4, address_id = $5, contact_no = $6, email = $7
       WHERE personnel_id = $8 RETURNING *`,
      [personnel_name, personnel_age, civilstatus_id, gender_id, address_id, contact_no, email, req.params.id]
    );

    await pool.query('COMMIT');
    res.json({ success: true, message: 'Personnel updated successfully', data: result.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Update personnel error:', error);
    res.status(500).json({ success: false, message: 'Error updating personnel', error: error.message });
  }
});

// Delete personnel
app.delete('/api/personnel/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM personnel WHERE personnel_id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }

    res.json({ success: true, message: 'Personnel deleted successfully' });
  } catch (error) {
    console.error('Delete personnel error:', error);
    res.status(500).json({ success: false, message: 'Error deleting personnel', error: error.message });
  }
});

// Get lookup data for dropdowns
app.get('/api/lookup-data', async (req, res) => {
  try {
    const [genders, civilStatuses] = await Promise.all([
      pool.query('SELECT * FROM gender ORDER BY gender_id'),
      pool.query('SELECT * FROM civilstatus ORDER BY civilstatus_id')
    ]);

    res.json({
      success: true,
      data: {
        genders: genders.rows,
        civilStatuses: civilStatuses.rows
      }
    });
  } catch (error) {
    console.error('Get lookup data error:', error);
    res.status(500).json({ success: false, message: 'Error fetching lookup data' });
  }
});

// ==================== SALARY MANAGEMENT ENDPOINTS ====================

// Get all personnel with salary information
app.get('/api/salary/personnel', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.personnel_id,
        p.personnel_name,
        COALESCE(ps.base_salary, 0) as base_salary,
        COALESCE(ps.base_bonus, 0) as base_bonus,
        COALESCE(ps.base_allowance, 0) as base_allowance,
        COALESCE(s.total_deductions, 0) as total_deductions,
        COALESCE(s.net_gross, 0) as net_salary,
        NULL as last_payment_date,
        NULL as next_payment_due,
        NULL as days_until_next_payment,
        CASE WHEN ps.personnel_id IS NOT NULL THEN true ELSE false END as has_salary,
        'unpaid' as payment_status,
        false as payment_due
      FROM personnel p
      LEFT JOIN personnelsalary ps ON p.personnel_id = ps.personnel_id
      LEFT JOIN salary s ON ps.personnel_id = s.personnel_id
      ORDER BY p.personnel_id ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get personnel salary error:', error);
    res.status(500).json({ success: false, message: 'Error fetching personnel salary data', error: error.message });
  }
});

// Get all deduction types
app.get('/api/salary/deductions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT deduction_id, deduction_type FROM deductions ORDER BY deduction_id'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get deductions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching deductions' });
  }
});

// Get deductions for a specific personnel salary
app.get('/api/salary/:personnelId/deductions', async (req, res) => {
  const { personnelId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        d.deduction_id,
        d.deduction_type,
        sd.amount
       FROM salarydeductions sd
       JOIN personnel_deductions pd ON sd.deduct_id = pd.deduct_id
       JOIN deductions d ON pd.deduction_id = d.deduction_id
       WHERE pd.personnel_id = $1`,
      [personnelId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get personnel deductions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching deductions' });
  }
});

// Calculate and save salary
app.post('/api/salary/calculate', async (req, res) => {
  const { personnel_id, base_salary, base_bonus, base_allowance, payment_status, deductions } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Calculate totals
    const grossSalary = parseFloat(base_salary) + parseFloat(base_bonus) + parseFloat(base_allowance);
    const totalDeductions = deductions.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const netSalary = grossSalary - totalDeductions;
    
    // Check if personnel salary already exists
    const existingSalary = await client.query(
      'SELECT personnel_id FROM personnelsalary WHERE personnel_id = $1',
      [personnel_id]
    );
    
    if (existingSalary.rows.length > 0) {
      // Update existing personnel salary (without date columns to avoid errors)
      await client.query(
        `UPDATE personnelsalary 
         SET base_salary = $1, base_bonus = $2, base_allowance = $3
         WHERE personnel_id = $4`,
        [base_salary, base_bonus, base_allowance, personnel_id]
      );
    } else {
      // Insert new personnel salary (without date columns to avoid errors)
      await client.query(
        `INSERT INTO personnelsalary (personnel_id, base_salary, base_bonus, base_allowance)
         VALUES ($1, $2, $3, $4)`,
        [personnel_id, base_salary, base_bonus, base_allowance]
      );
    }
    
    // Check if salary record exists
    const existingSalaryRecord = await client.query(
      'SELECT salary_id FROM salary WHERE personnel_id = $1',
      [personnel_id]
    );
    
    let salaryId;
    
    if (existingSalaryRecord.rows.length > 0) {
      // Update existing salary record
      salaryId = existingSalaryRecord.rows[0].salary_id;
      await client.query(
        `UPDATE salary 
         SET total_deductions = $1, total_gross = $2, net_gross = $3
         WHERE salary_id = $4`,
        [totalDeductions, grossSalary, netSalary, salaryId]
      );
      
      // Delete existing deductions
      await client.query('DELETE FROM salarydeductions WHERE salary_id = $1', [salaryId]);
    } else {
      // Insert new salary record
      const salaryResult = await client.query(
        `INSERT INTO salary (personnel_id, total_deductions, total_gross, net_gross)
         VALUES ($1, $2, $3, $4)
         RETURNING salary_id`,
        [personnel_id, totalDeductions, grossSalary, netSalary]
      );
      salaryId = salaryResult.rows[0].salary_id;
    }
    
    // Insert deductions
    if (deductions && deductions.length > 0) {
      for (const deduction of deductions) {
        try {
          // First insert into personnel_deductions
          const pdResult = await client.query(
            `INSERT INTO personnel_deductions (personnel_id, deduction_id, contribution_amount)
             VALUES ($1, $2, $3)
             ON CONFLICT ON CONSTRAINT personnel_deductions_pkey
             DO UPDATE SET contribution_amount = $3
             RETURNING deduct_id`,
            [personnel_id, deduction.deduction_id, deduction.amount]
          );
          
          const deductId = pdResult.rows[0].deduct_id;
          
          // Then insert into salarydeductions
          await client.query(
            `INSERT INTO salarydeductions (salary_id, deduct_id, amount)
             VALUES ($1, $2, $3)`,
            [salaryId, deductId, deduction.amount]
          );
        } catch (err) {
          console.error('Deduction insertion error:', err);
          // Continue with other deductions
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Salary calculated and saved successfully',
      data: {
        salary_id: salaryId,
        gross_salary: grossSalary,
        total_deductions: totalDeductions,
        net_salary: netSalary
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Calculate salary error:', error);
    res.status(500).json({ success: false, message: 'Error calculating salary' });
  } finally {
    client.release();
  }
});

// Delete salary record
app.delete('/api/salary/:personnelId', async (req, res) => {
  const { personnelId } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get salary_id
    const salaryResult = await client.query(
      'SELECT salary_id FROM salary WHERE personnel_id = $1',
      [personnelId]
    );
    
    if (salaryResult.rows.length > 0) {
      const salaryId = salaryResult.rows[0].salary_id;
      
      // Delete salary deductions
      await client.query('DELETE FROM salarydeductions WHERE salary_id = $1', [salaryId]);
      
      // Delete salary record
      await client.query('DELETE FROM salary WHERE salary_id = $1', [salaryId]);
    }
    
    // Delete personnel salary
    await client.query('DELETE FROM personnelsalary WHERE personnel_id = $1', [personnelId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Salary record deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete salary error:', error);
    res.status(500).json({ success: false, message: 'Error deleting salary record' });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api/setup to initialize the database`);
});
