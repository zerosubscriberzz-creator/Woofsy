-- Create donations table for storing donation records
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(255) PRIMARY KEY,
  amount INTEGER NOT NULL,
  donor_name VARCHAR(255),
  donor_email VARCHAR(255) NOT NULL,
  message TEXT,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Insert sample data
INSERT INTO donations (id, amount, donor_name, donor_email, message, transaction_id, order_id, status) VALUES
('pay_sample1', 500, 'Priya Sharma', 'priya@example.com', 'Hope this helps the dogs!', 'pay_sample1', 'order_sample1', 'completed'),
('pay_sample2', 1000, 'Rahul Kumar', 'rahul@example.com', 'Thank you for this wonderful work', 'pay_sample2', 'order_sample2', 'completed'),
('pay_sample3', 200, 'Anonymous', 'anon@example.com', '', 'pay_sample3', 'order_sample3', 'completed');
