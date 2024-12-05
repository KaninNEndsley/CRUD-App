const express = require('express');
const cors = require('cors');
const client = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', async ( req, res ) => {
    res.send("hi");
})

app.get('/test-db', async (req, res) => {
    const q = 'SHOW search_path;';

    try {
        const r = await client.query(q);
        res.status(200).send(r);
    } catch (err) {
        res.status(500).send('Error creating table');
    }

})

app.get('/create-db', async (req, res) => {
    // const query = "CREATE TABLE IF NOT EXISTS Item (id SERIAL PRIMARY KEY, First_Name VARCHAR(100), Last_Name VARCHAR(100), Username VARCHAR(100), Password VARCHAR(100))";

    const q = `SET search_path TO public;`;

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        First_Name VARCHAR(100),
        Last_Name VARCHAR(100),
        Username VARCHAR(100),
        Password VARCHAR(100)
    );
`;

    const test = 'SELECT * FROM pg_catalog.pg_tables;'

    try {
        await client.query(q);
        await client.query(createTableQuery);
        res.status(200).send("Table 'Users' created or already exists.");
    } catch (err) {
        console.error('Error creating table:', err);
        res.status(500).send('Error creating table');
    }

});


app.get('/add-user', async (req, res) => {
    // const query = "CREATE TABLE IF NOT EXISTS Item (id SERIAL PRIMARY KEY, First_Name VARCHAR(100), Last_Name VARCHAR(100), Username VARCHAR(100), Password VARCHAR(100))";

    const createTableQuery = `
    INSERT INTO Users (First_Name, Last_Name, Username, Password)
        VALUES ('Tom', 'Bradley', 'TomCool', 'Passpass');
`;

    try {
        await client.query(createTableQuery);
        // const db = await client.query(test);

        res.send("Successful");
    } catch ( err )
    {
        res.status(500).send('Error creating table');
    }

});


app.get('/select-user', async (req, res) => {
    // const query = "CREATE TABLE IF NOT EXISTS Item (id SERIAL PRIMARY KEY, First_Name VARCHAR(100), Last_Name VARCHAR(100), Username VARCHAR(100), Password VARCHAR(100))";

    const q = `SET search_path TO public;`;


    const createTableQuery = `
    SELECT *  FROM Users;
`;

    try {
        await client.query(q);
        const db = await client.query(createTableQuery);
        // const db = await client.query(test);

        res.send(db);
    } catch ( err )
    {
        res.status(500).send('Error creating table');
    }

});



// Route for getting all grocery items
app.get('/grocery-items', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM grocery_items');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching items:', err.stack);
        res.status(500).send('Error fetching items');
    }
});

// Route for getting a specific grocery item by id
app.get('/grocery-items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM grocery_items WHERE id = $1', [id]);
        const item = result.rows[0];

        if (item) {
            res.json(item);
        } else {
            res.status(404).send('Item not found');
        }
    } catch (err) {
        console.error('Error fetching item:', err.stack);
        res.status(500).send('Error fetching item');
    }
});

// Route for creating a new grocery item (POST method)
app.post('/grocery-items', async (req, res) => {
    const { name, description, quantity } = req.body;

    if (!name || !description || !quantity) {
        return res.status(400).send('All fields (name, description, and quantity) are required');
    }

    try {
        const result = await client.query(
            'INSERT INTO grocery_items (name, description, quantity) VALUES ($1, $2, $3) RETURNING *',
            [name, description, quantity]
        );
        const newItem = result.rows[0];
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Error creating item:', err.stack);
        res.status(500).send('Error creating item');
    }
});

// Route for updating an existing grocery item (PUT method)
app.put('/grocery-items/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, quantity } = req.body;

    try {
        const result = await client.query(
            'UPDATE grocery_items SET name = $1, description = $2, quantity = $3 WHERE id = $4 RETURNING *',
            [name || '', description || '', quantity || 0, id]
        );
        const updatedItem = result.rows[0];

        if (updatedItem) {
            res.json(updatedItem);
        } else {
            res.status(404).send('Item not found');
        }
    } catch (err) {
        console.error('Error updating item:', err.stack);
        res.status(500).send('Error updating item');
    }
});

// Route for deleting a grocery item (DELETE method)
app.delete('/grocery-items/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query('DELETE FROM grocery_items WHERE id = $1 RETURNING *', [id]);
        const deletedItem = result.rows[0];

        if (deletedItem) {
            res.json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).send('Item not found');
        }
    } catch (err) {
        console.error('Error deleting item:', err.stack);
        res.status(500).send('Error deleting item');
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
