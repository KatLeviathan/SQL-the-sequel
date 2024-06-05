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
      'Exit'
    ]
  });

  switch (action) {
    case 'View all departments':
      await getDepartments();
      break;
    case 'View all roles':
      // Add functionality to view all roles
      break;
    case 'View all employees':
      // Add functionality to view all employees
      break;
    case 'Add a department':
      const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter department name:'
      });
      await createDepartment(name);
      break;
    case 'Add a role':
      const { title } = await inquirer.prompt({
        type: 'input',
        name: 'title',
        message: 'Enter role title:'
      });
      const { salary } = await inquirer.prompt({
        type: 'input',
        name: 'salary',
        message: 'Enter role salary:'
      });
      await createRole(title, salary);
      break;
    case 'Add an employee':
      // Add functionality to add an employee
      break;
    case 'Update an employee role':
      // Add functionality to update an employee role
      break;
    case 'Exit':
      await disconnectDatabase();
      process.exit();
      break;
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