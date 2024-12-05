const { Client } = require('pg');

const client = new Client({
    user: 'postgres', // Make sure this is the right username
    host: 'localhost', // Make sure this is correct
    database: 'inventory_db', // Ensure the database name is correct
    password: 'password', // Make sure the password is correctP
    port: 5432, // Default port
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => {
        console.error('Connection error', err.stack);
        process.exit(1); // Exit if the connection fails
    });

module.exports = client;
