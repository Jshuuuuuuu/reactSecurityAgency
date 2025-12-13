-- Add payment tracking columns to personnelsalary table
ALTER TABLE personnelsalary 
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_payment_due TIMESTAMP;

-- Update existing records to set payment dates
UPDATE personnelsalary 
SET last_payment_date = CURRENT_TIMESTAMP,
    next_payment_due = CURRENT_TIMESTAMP + INTERVAL '14 days'
WHERE last_payment_date IS NULL;
