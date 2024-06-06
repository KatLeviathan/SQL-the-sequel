const express = require('express');
const { Client } = require('pg');
const inquirer = require('inquirer');

const app = express();
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Connect to the PostgreSQL database
async function connectDatabase() {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Create a table if it doesn't exist
async function createTableIfNotExists() {
  const query = `
    CREATE TABLE IF NOT EXISTS department (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );
  `;

  try {
    await client.query(query);
    console.log('Checked for department table and created if not exists');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

// Add a department
app.post('/departments', async (req, res) => {
  const { name } = req.body;

  try {
    const result = await client.query('INSERT INTO department (name) VALUES ($1) RETURNING *', [name]);
    res.json({ message: 'New department added', department: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creating department' });
  }
});

// Get all departments
app.get('/departments', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM department');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error getting departments' });
  }
});

// Other routes for roles, employees, and additional functionality

// Start the Express server
app.listen(3000, async () => {
  await connectDatabase();
  await createTableIfNotExists();
  console.log('Server is running on port 3000');
});