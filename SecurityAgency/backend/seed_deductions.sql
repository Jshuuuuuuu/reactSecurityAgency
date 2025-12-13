-- Seed deduction types for salary management
-- Run this file to populate the deductions table

-- Clear existing data
TRUNCATE TABLE deductions CASCADE;

-- Insert common deduction types with explicit IDs
INSERT INTO deductions (deduction_id, deduction_type) VALUES
(1, 'SSS Contribution'),
(2, 'PhilHealth'),
(3, 'Pag-IBIG'),
(4, 'Withholding Tax'),
(5, 'Cash Advance'),
(6, 'Loan Repayment'),
(7, 'Uniform Deduction'),
(8, 'Other Deductions');

-- Verify insertions
SELECT * FROM deductions ORDER BY deduction_id;
