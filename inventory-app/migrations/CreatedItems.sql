CREATE TABLE IF NOT EXISTS grocery_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL
);
