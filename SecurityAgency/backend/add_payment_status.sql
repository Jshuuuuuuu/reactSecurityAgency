-- Add payment status column to salary table
ALTER TABLE salary 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';

-- Create an enum type for payment status
-- (or just use varchar if enum is not preferred)

-- Verify the column was added
\d salary
