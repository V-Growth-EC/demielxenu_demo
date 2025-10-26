-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    order_id      SERIAL PRIMARY KEY,
    order_info_id VARCHAR(255) NOT NULL,
    customer_id   INTEGER,
    order_status  VARCHAR(255) NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    order_data    JSON NOT NULL
);

-- Create index on order_info_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_info_id ON orders(order_info_id);

-- Create index on customer_id for faster customer order lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Create index on order_status for status-based queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Add foreign key constraint to customers table if it exists
-- (This will only work if the customers table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE orders 
        ADD CONSTRAINT fk_orders_customer_id 
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id);
    END IF;
END $$;

-- Insert a sample order for testing (optional)
INSERT INTO orders (order_info_id, customer_id, order_status, order_data, updated_at)
VALUES (
    'ORD_TEST_20231201120000_1234567890',
    1,
    'pending',
    '{"orderId": 1234567890, "amount": 10000, "customerInfo": {"name": "Test User", "email": "test@example.com"}, "products": {"names": "Test Product x1"}, "pricing": {"total": 10000}}',
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Show table structure
\d orders;

-- Show sample data
SELECT * FROM orders LIMIT 5;
