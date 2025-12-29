-- Add start_date and end_date columns to assignment table
ALTER TABLE assignment
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Optional: Add a check constraint to ensure end_date is after start_date
ALTER TABLE assignment
ADD CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date);
