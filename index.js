const { Client } = require('pg');
const inquirer = require('inquirer');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function connectDatabase() {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

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

async function getDepartments() {
  const query = 'SELECT * FROM department';

  try {
    const result = await client.query(query);
    console.log('Departments:', result.rows);
  } catch (error) {
    console.error('Error getting departments:', error);
  }
}

async function deleteDepartmentById(id) {
  const query = 'DELETE FROM department WHERE id = $1';
  const values = [id];

  try {
    await client.query(query, values);
    console.log(`Department with id ${id} deleted successfully`);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error('Error deleting department:', error);
  }
}

async function viewData(query, dataType) {
  try {
    const result = await client.query(query);
    console.log(`${dataType}:`, result.rows);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error(`Error fetching ${dataType}:`, error);
  }
}

async function displayMenu() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Select an action:',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Delete a department',
      'Exit'
    ]
  });

  return action;
}

async function handleUserAction() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Select an action:',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Delete a department',
      'Exit'
    ]
  });

  switch (action) {
    case 'View all departments':
      await viewData('SELECT * FROM department', 'Departments');
      break;
    case 'View all roles':
      await viewData('SELECT * FROM roles', 'Roles');
      break;
    case 'View all employees':
      await viewData('SELECT * FROM employees', 'Employees');
      break;
    case 'Add a department':
      const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter department name:'
      });
      await createDepartment(name);
      break;
    case 'Delete a department':
      const { id } = await inquirer.prompt({
        type: 'input',
        name: 'id',
        message: 'Enter department id to delete:'
      });
      await deleteDepartmentById(id);
      break;
    // Other cases for adding, updating, and exiting
    default:
      console.log('Invalid action. Please select a valid option.');
  }
}

// Connect to the database, perform operations, and handle user actions
connectDatabase()
  .then(async () => {
    await createTableIfNotExists(); 
    await handleUserAction(); // Call handleUserAction only once
  })
  .catch(error => console.error('Error:', error));

async function disconnectDatabase() {
  try {
    await client.end();
    console.log('Disconnected from the database');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
}
