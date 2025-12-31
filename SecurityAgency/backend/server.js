require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Trust proxy for Render
app.set('trust proxy', 1);

// PostgreSQL Pool configuration for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Security Agency API',
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint with database test
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
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

// ==================== CLIENT MANAGEMENT ENDPOINTS ====================

// Get all clients with optional search
app.get('/api/clients', async (req, res) => {
  const { search } = req.query;
  
  try {
    let query = `
      SELECT 
        c.client_id,
        c.client_name AS business_name,
        c.contact_person,
        c.contact_number AS contact_no,
        c.email,
        c.clienttype_id,
        c.address_id,
        ct.business_type as client_type,
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
      FROM client c
      LEFT JOIN clienttype ct ON c.clienttype_id = ct.clienttype_id
      LEFT JOIN address a ON c.address_id = a.address_id
    `;
    
    const params = [];
    if (search) {
      query += ` WHERE LOWER(c.client_name) LIKE LOWER($1) 
                 OR LOWER(c.contact_person) LIKE LOWER($1) 
                 OR LOWER(c.email) LIKE LOWER($1) 
                 OR CAST(c.contact_number AS TEXT) LIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY c.client_id DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, message: 'Error fetching clients' });
  }
});

// Get single client by ID
app.get('/api/clients/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.client_id,
        c.client_name AS business_name,
        c.contact_person,
        c.contact_number AS contact_no,
        c.email,
        c.clienttype_id,
        c.address_id,
        ct.business_type as client_type,
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
      FROM client c
      LEFT JOIN clienttype ct ON c.clienttype_id = ct.clienttype_id
      LEFT JOIN address a ON c.address_id = a.address_id
      WHERE c.client_id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ success: false, message: 'Error fetching client' });
  }
});

// Add new client
app.post('/api/clients', async (req, res) => {
  const { 
    business_name, 
    contact_person, 
    contact_no, 
    email,
    clienttype_id,
    street,
    barangay,
    city,
    province,
    postal_code
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert address first
    let address_id = null;
    if (street || barangay || city || province) {
      const addressResult = await client.query(
        `INSERT INTO address (street, barangay, city, province, postal_code)
         VALUES ($1, $2, $3, $4, $5) RETURNING address_id`,
        [street, barangay, city, province, postal_code]
      );
      address_id = addressResult.rows[0].address_id;
    }

    // Insert client
    // Extract only digits from contact_no and truncate to fit integer (last 9 digits)
    const contactNumber = contact_no ? parseInt(contact_no.replace(/\D/g, '').slice(-9)) : null;
    const clientResult = await client.query(
      `INSERT INTO client (client_name, contact_person, contact_number, email, clienttype_id, address_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [business_name, contact_person, contactNumber, email, clienttype_id, address_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Client added successfully', data: clientResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add client error:', error);
    res.status(500).json({ success: false, message: 'Error adding client', error: error.message });
  } finally {
    client.release();
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  const { 
    business_name, 
    contact_person, 
    contact_no, 
    email,
    clienttype_id,
    street,
    barangay,
    city,
    province,
    postal_code
  } = req.body;

  let address_id = req.body.address_id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update or create address
    if (address_id) {
      await client.query(
        `UPDATE address SET street = $1, barangay = $2, city = $3, province = $4, postal_code = $5
         WHERE address_id = $6`,
        [street, barangay, city, province, postal_code, address_id]
      );
    } else if (street || barangay || city || province) {
      const addressResult = await client.query(
        `INSERT INTO address (street, barangay, city, province, postal_code)
         VALUES ($1, $2, $3, $4, $5) RETURNING address_id`,
        [street, barangay, city, province, postal_code]
      );
      address_id = addressResult.rows[0].address_id;
    }

    // Update client
    // Extract only digits from contact_no and truncate to fit integer (last 9 digits)
    const contactNumber = contact_no ? parseInt(contact_no.replace(/\D/g, '').slice(-9)) : null;
    const result = await client.query(
      `UPDATE client 
       SET client_name = $1, contact_person = $2, contact_number = $3, 
           email = $4, clienttype_id = $5, address_id = $6
       WHERE client_id = $7 RETURNING *`,
      [business_name, contact_person, contactNumber, email, clienttype_id, address_id, req.params.id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Client updated successfully', data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update client error:', error);
    res.status(500).json({ success: false, message: 'Error updating client', error: error.message });
  } finally {
    client.release();
  }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM client WHERE client_id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, message: 'Error deleting client', error: error.message });
  }
});

// Get client types for dropdown
app.get('/api/client-types', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT clienttype_id, business_type as title FROM clienttype ORDER BY clienttype_id'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get client types error:', error);
    res.status(500).json({ success: false, message: 'Error fetching client types' });
  }
});

// Get payment types
app.get('/api/payment-types', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT paymenttype_id, type FROM paymenttype ORDER BY paymenttype_id'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get payment types error:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment types' });
  }
});

// ==================== ASSIGNMENT MANAGEMENT ENDPOINTS ====================

// Get all assignments with optional search
app.get('/api/assignments', async (req, res) => {
  const { search } = req.query;
  
  try {
    let query = `
      SELECT 
        a.assignment_id,
        a.personnel_id,
        a.client_id,
        a.assignment_start as start_date,
        a.assignment_end as end_date,
        a.status_id,
        a.paymenttype_id,
        p.personnel_name,
        cl.client_name,
        s.status_name as status,
        pt.type as payment_type
      FROM assignment a
      LEFT JOIN personnel p ON a.personnel_id = p.personnel_id
      LEFT JOIN client cl ON a.client_id = cl.client_id
      LEFT JOIN status s ON a.status_id = s.status_id
      LEFT JOIN paymenttype pt ON a.paymenttype_id = pt.paymenttype_id
    `;
    
    const params = [];
    if (search) {
      query += ` WHERE 
                 CAST(a.assignment_id AS TEXT) LIKE $1 OR
                 LOWER(p.personnel_name) LIKE LOWER($1) OR 
                 LOWER(cl.client_name) LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY a.assignment_id DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching assignments' });
  }
});

// Get single assignment by ID
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        a.assignment_start as start_date,
        a.assignment_end as end_date,
        p.personnel_name,
        cl.client_name,
        s.status_name as status,
        pt.type as payment_type
      FROM assignment a
      LEFT JOIN personnel p ON a.personnel_id = p.personnel_id
      LEFT JOIN client cl ON a.client_id = cl.client_id
      LEFT JOIN status s ON a.status_id = s.status_id
      LEFT JOIN paymenttype pt ON a.paymenttype_id = pt.paymenttype_id
      WHERE a.assignment_id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ success: false, message: 'Error fetching assignment' });
  }
});

// Add new assignment
app.post('/api/assignments', async (req, res) => {
  const { 
    personnel_id, 
    client_id,
    status_id,
    start_date,
    end_date,
    paymenttype_id
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO assignment (personnel_id, client_id, status_id, assignment_start, assignment_end, paymenttype_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [personnel_id, client_id, status_id, start_date, end_date, paymenttype_id]
    );

    res.json({ success: true, message: 'Assignment added successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Add assignment error:', error);
    res.status(500).json({ success: false, message: 'Error adding assignment', error: error.message });
  }
});

// Update assignment
app.put('/api/assignments/:id', async (req, res) => {
  const { 
    personnel_id, 
    client_id,
    status_id,
    start_date,
    end_date,
    paymenttype_id
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE assignment 
       SET personnel_id = $1, client_id = $2, status_id = $3, assignment_start = $4, assignment_end = $5, paymenttype_id = $6
       WHERE assignment_id = $7 RETURNING *`,
      [personnel_id, client_id, status_id, start_date, end_date, paymenttype_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Assignment updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Error updating assignment', error: error.message });
  }
});

// Delete assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM assignment WHERE assignment_id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Error deleting assignment', error: error.message });
  }
});

// Get assignment statuses for dropdown
app.get('/api/assignment-statuses', async (req, res) => {
  try {
    // Check if assignmentstatus table exists
    const tableExists = await pool.query(
      `SELECT EXISTS(
        SELECT FROM information_schema.tables 
        WHERE table_name = 'assignmentstatus'
      )`
    );

    if (tableExists.rows[0].exists) {
      const result = await pool.query(
        'SELECT status_id, status_name FROM assignmentstatus ORDER BY status_id'
      );
      res.json({ success: true, data: result.rows });
    } else {
      // Return hardcoded statuses if table doesn't exist
      const statuses = [
        { status_id: 1, status_name: 'Active' },
        { status_id: 2, status_name: 'Pending' },
        { status_id: 3, status_name: 'Completed' },
        { status_id: 4, status_name: 'On Hold' },
        { status_id: 5, status_name: 'Cancelled' }
      ];
      res.json({ success: true, data: statuses });
    }
  } catch (error) {
    console.error('Get assignment statuses error:', error);
    // Return hardcoded statuses as fallback
    const statuses = [
      { status_id: 1, status_name: 'Active' },
      { status_id: 2, status_name: 'Pending' },
      { status_id: 3, status_name: 'Completed' },
      { status_id: 4, status_name: 'On Hold' },
      { status_id: 5, status_name: 'Cancelled' }
    ];
    res.json({ success: true, data: statuses });
  }
});

// ==================== CONTRACT MANAGEMENT ENDPOINTS ====================

// Get all contracts with optional search
app.get('/api/contracts', async (req, res) => {
  const { search } = req.query;
  
  try {
    let query = `
      SELECT 
        c.contract_id,
        c.client_id,
        c.start_date,
        c.end_date,
        c.contract_value,
        cl.client_name as company_name,
        ct.business_type as contract_type
      FROM contract c
      LEFT JOIN client cl ON c.client_id = cl.client_id
      LEFT JOIN clienttype ct ON cl.clienttype_id = ct.clienttype_id
    `;
    
    const params = [];
    if (search) {
      query += ` WHERE 
                 CAST(c.contract_id AS TEXT) LIKE $1 OR
                 LOWER(cl.client_name) LIKE LOWER($1) OR 
                 LOWER(ct.business_type) LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY c.end_date ASC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching contracts' });
  }
});

// Get single contract by ID
app.get('/api/contracts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.contract_id,
        c.client_id,
        c.start_date,
        c.end_date,
        c.contract_value,
        cl.client_name as company_name,
        ct.business_type as contract_type
      FROM contract c
      LEFT JOIN client cl ON c.client_id = cl.client_id
      LEFT JOIN clienttype ct ON cl.clienttype_id = ct.clienttype_id
      WHERE c.contract_id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ success: false, message: 'Error fetching contract' });
  }
});

// Add new contract
app.post('/api/contracts', async (req, res) => {
  const { 
    client_id, 
    start_date, 
    end_date, 
    contract_value
  } = req.body;

  try {
    // Use current date as start_date if not provided
    const finalStartDate = start_date || new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      `INSERT INTO contract (client_id, start_date, end_date, contract_value)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [client_id, finalStartDate, end_date, contract_value || 0]
    );

    res.json({ success: true, message: 'Contract added successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Add contract error:', error);
    res.status(500).json({ success: false, message: 'Error adding contract', error: error.message });
  }
});

// Update contract
app.put('/api/contracts/:id', async (req, res) => {
  const { 
    client_id, 
    start_date, 
    end_date, 
    contract_value
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE contract 
       SET client_id = $1, start_date = $2, end_date = $3, contract_value = $4
       WHERE contract_id = $5 RETURNING *`,
      [client_id, start_date, end_date, contract_value || 0, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.json({ success: true, message: 'Contract updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ success: false, message: 'Error updating contract', error: error.message });
  }
});

// Delete contract
app.delete('/api/contracts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM contract WHERE contract_id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ success: false, message: 'Error deleting contract', error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  await pool.end();
  process.exit(0);
});

// Start server - bind to 0.0.0.0 for Render
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  if (process.env.FRONTEND_URL) {
    console.log(`✅ CORS enabled for: ${process.env.FRONTEND_URL}`);
  }
});
