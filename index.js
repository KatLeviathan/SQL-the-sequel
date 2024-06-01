const { Client } = require('pg');

const client = new Client({
  user: '',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Function to interact with the PostgreSQL database
async function interactWithDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Perform a query
    const query = 'SELECT * FROM department';
    const result = await client.query(query);
    console.log('Query Result:', result.rows);

  } catch (error) {
    console.error('Error interacting with the database:', error);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Call the function to interact with the database
interactWithDatabase();
// Function to insert a new department into the database
async function createDepartment(name) {
  const query = 'INSERT INTO department (name) VALUES ($1) RETURNING *';
  const values = [name];

  try {
    const result = await client.query(query, values);
    console.log('New department added:', result.rows[0]);
  } catch (error) {
    console.error('Error creating department:', error);
  }
}

// Function to retrieve all departments from the database
async function getDepartments() {
  const query = 'SELECT * FROM department';

  try {
    const result = await client.query(query);
    console.log('Departments:', result.rows);
  } catch (error) {
    console.error('Error getting departments:', error);
  }
}

// Connect to the database and perform operations
connectDatabase()
  .then(async () => {
    await createDepartment('Marketing');
    await getDepartments();
  })
  .finally(() => disconnectDatabase());

// Function to disconnect from the database
async function disconnectDatabase() {
  try {
    await client.end();
    console.log('Disconnected from the database');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
}

// Function to insert a new department into the database
async function createDepartment(name) {
  const query = 'INSERT INTO department (name) VALUES ($1) RETURNING *';
  const values = [name];

  try {
    const result = await client.query(query, values);
    console.log('New department added:', result.rows[0]);
  } catch (error) {
    console.error('Error creating department:', error);
  }
}

// Function to retrieve all departments from the database
async function getDepartments() {
  const query = 'SELECT * FROM department';

  try {
    const result = await client.query(query);
    console.log('Departments:', result.rows);
  } catch (error) {
    console.error('Error getting departments:', error);
  }
}

// Connect to the database and perform operations
connectDatabase()
  .then(() => {
    createDepartment('Marketing');
    getDepartments();
  })
  .finally(() => disconnectDatabase());