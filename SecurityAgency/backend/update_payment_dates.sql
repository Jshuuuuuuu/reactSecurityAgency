-- Add payment tracking columns to personnelsalary table
ALTER TABLE personnelsalary 
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_payment_due TIMESTAMP;

-- Display the updated table structure
\d personnelsalary
