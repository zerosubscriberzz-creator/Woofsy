-- Create donations table for PayU integration
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  txnid VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(100),
  payment_mode VARCHAR(50),
  bank_ref_num VARCHAR(100),
  pg_type VARCHAR(50),
  bank_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_txnid ON donations(txnid);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);

-- Insert sample data
INSERT INTO donations (txnid, amount, donor_name, donor_email, message, status) VALUES
('TXN_SAMPLE_001', 500.00, 'John Doe', 'john@example.com', 'Happy to help!', 'success'),
('TXN_SAMPLE_002', 200.00, 'Jane Smith', 'jane@example.com', 'Love dogs!', 'success'),
('TXN_SAMPLE_003', 1000.00, 'Anonymous', 'donor@example.com', '', 'success');
