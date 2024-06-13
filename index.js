const { Client } = require("pg");
const inquirer = require("inquirer");
const { table } = require("table");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

async function connectDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

async function createTableIfNotExists() {
  const departmentQuery = `
    CREATE TABLE IF NOT EXISTS department (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );
  `;

  const rolesQuery = `
    CREATE TABLE IF NOT EXISTS role (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      salary NUMERIC NOT NULL,
      department_id INTEGER REFERENCES department(id)
    );
  `;

  const employeesQuery = `
    CREATE TABLE IF NOT EXISTS employee (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role_id INTEGER REFERENCES role(id),
      manager_id INTEGER REFERENCES employee(id)
    );
  `;

  try {
    await client.query(departmentQuery);
    console.log("Checked for department table and created if not exists");
    await client.query(rolesQuery);
    console.log("Checked for roles table and created if not exists");
    await client.query(employeesQuery);
    console.log("Checked for employees table and created if not exists");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

async function createDepartment(name) {
  const query = "INSERT INTO department (name) VALUES ($1) RETURNING *";
  const values = [name];

  try {
    const result = await client.query(query, values);
    console.log("New department added:", result.rows[0]);
    await handleUserAction(); // Return to the main menu after adding a department
  } catch (error) {
    console.error("Error creating department:", error);
  }
}

async function getDepartments() {
  const query = "SELECT * FROM department";

  try {
    const result = await client.query(query);
    console.log("Departments:", result.rows);
  } catch (error) {
    console.error("Error getting departments:", error);
  }
}

async function deleteDepartmentById() {
  try {
    const departments = await client.query("SELECT id, name FROM department");

    const departmentChoices = departments.rows.map((department) => ({
      name: `${department.name} (ID: ${department.id})`,
      value: department.id,
    }));

    const { departmentId } = await inquirer.prompt({
      type: "list",
      name: "departmentId",
      message: "Select a department to delete:",
      choices: departmentChoices,
    });

    const query = "DELETE FROM department WHERE id = $1";
    const values = [departmentId];

    await client.query(query, values);
    console.log(`Department with ID ${departmentId} deleted successfully`);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error("Error deleting department:", error);
  }
}

async function deleteEmployeeByName() {
  try {
    // Logic to query and delete an employee
    const employees = await client.query(
      "SELECT id, first_name, last_name FROM employee"
    );

    const employeeChoices = employees.rows.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    const { employeeId } = await inquirer.prompt({
      type: "list",
      name: "employeeId",
      message: "Select an employee to delete:",
      choices: employeeChoices,
    });

    const query = "DELETE FROM employee WHERE id = $1";
    const values = [employeeId];

    await client.query(query, values);
    console.log(`Employee deleted successfully`);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
}

async function deleteRoleByName() {
  try {
    const roles = await client.query("SELECT id, title FROM role");

    const roleChoices = roles.rows.map((role) => role.title);

    const { roleName } = await inquirer.prompt({
      type: "list",
      name: "roleName",
      message: "Select a role to delete:",
      choices: roleChoices,
    });

    const selectedRole = roles.rows.find((role) => role.title === roleName);

    const query = "DELETE FROM role WHERE id = $1";
    const values = [selectedRole.id];

    await client.query(query, values);
    console.log(`Role ${roleName} deleted successfully`);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error("Error deleting role:", error);
  }
}

async function viewData(query, dataType) {
  try {
    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.log(`No ${dataType} found.`);
    } else {
      let data = result.rows;

      // Format data for display based on dataType
      if (dataType === "Departments") {
        data = data.map((department) => [department.id, department.name]);
      } else if (dataType === "Roles") {
        data = data.map((role) => [
          role.id,
          role.title,
          role.salary,
          role.department_id,
        ]);
      } else if (dataType === "Employees") {
        data = data.map((employee) => [
          employee.id,
          employee.first_name,
          employee.last_name,
          employee.role_id,
          employee.manager_id,
        ]);
      }

      const output = table(data);
      console.log(`${dataType}:`);
      console.log(output);
    }

    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error(`Error fetching ${dataType}:`, error);
  }
}

async function displayMenu() {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "Select an action:",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
      "Delete a department",
      "Delete a role",
      "Delete an employee",
      "Exit",
    ],
  });

  return action;
}

async function addEmployee() {
  try {
    const { firstName } = await inquirer.prompt({
      type: 'input',
      name: 'firstName',
      message: 'Enter employee first name:'
    });

    const { lastName } = await inquirer.prompt({
      type: 'input',
      name: 'lastName',
      message: 'Enter employee last name:'
    });

    const departments = await client.query('SELECT id, name FROM department');
    const departmentChoices = departments.rows.map(department => department.name);

    const { departmentName } = await inquirer.prompt({
      type: 'list',
      name: 'departmentName',
      message: 'Select the department for the employee:',
      choices: departmentChoices
    });

    const selectedDepartment = departments.rows.find(department => department.name === departmentName);

    const roles = await client.query('SELECT id, title FROM role WHERE department_id = $1', [selectedDepartment.id]);
    const roleChoices = roles.rows.map(role => role.title);

    const { roleName } = await inquirer.prompt({
      type: 'list',
      name: 'roleName',
      message: 'Select the role for the employee:',
      choices: roleChoices
    });

    const selectedRole = roles.rows.find(role => role.title === roleName);

    // Fetch employees in the selected department to choose as manager
    const employeesInDepartment = await client.query(`
      SELECT id, first_name, last_name FROM employee WHERE role_id IN (
        SELECT id FROM role WHERE department_id = $1
      );
    `, [selectedDepartment.id]);

    const managerChoices = employeesInDepartment.rows.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));
    managerChoices.unshift({ name: 'None', value: null });

    const { managerId } = await inquirer.prompt({
      type: 'list',
      name: 'managerId',
      message: 'Select the manager for the employee:',
      choices: managerChoices
    });

    const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
    const values = [firstName, lastName, selectedRole.id, managerId];

    await client.query(query, values);
    console.log(`Employee ${firstName} ${lastName} added successfully to department ${departmentName}`);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error('Error adding employee:', error);
  }
}


async function addRole() {
  try {
    const { title } = await inquirer.prompt({
      type: "input",
      name: "title",
      message: "Enter role title:",
    });

    const { salary } = await inquirer.prompt({
      type: "input",
      name: "salary",
      message: "Enter role salary:",
    });

    if (isNaN(parseFloat(salary))) {
      console.log("Invalid salary input. Please enter a numeric value.");
      return;
    }

    const departments = await client.query("SELECT id, name FROM department");
    const departmentChoices = departments.rows.map(
      (department) => department.name
    );

    const { departmentName } = await inquirer.prompt({
      type: "list",
      name: "departmentName",
      message: "Select the department for the role:",
      choices: departmentChoices,
    });

    const selectedDepartment = departments.rows.find(
      (department) => department.name === departmentName
    );

    const query =
      "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)";
    const values = [title, parseFloat(salary), selectedDepartment.id];

    await client.query(query, values);
    console.log(
      `Role ${title} added successfully to department ${departmentName}`
    );
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

async function updateEmployeeRole() {
  try {
    const employees = await client.query(
      "SELECT id, first_name, last_name FROM employee"
    );
    const employeeChoices = employees.rows.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    const { employeeId } = await inquirer.prompt({
      type: "list",
      name: "employeeId",
      message: "Select an employee to update:",
      choices: employeeChoices,
    });

    const roles = await client.query("SELECT id, title FROM role");
    const roleChoices = roles.rows.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    const { roleId } = await inquirer.prompt({
      type: "list",
      name: "roleId",
      message: "Select the new role for the employee:",
      choices: roleChoices,
    });

    const query = "UPDATE employee SET role_id = $1 WHERE id = $2";
    const values = [roleId, employeeId];

    await client.query(query, values);
    console.log("Employee role updated successfully");
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

async function viewAllEmployees() {
  const query = `SELECT e.id, e.first_name, e.last_name, r.title, r.salary, d.name AS department, 
                m.first_name AS manager_first_name, m.last_name AS manager_last_name 
                FROM employee e LEFT JOIN role r ON e.role_id = r.id 
                LEFT JOIN department d ON r.department_id = d.id 
                LEFT JOIN employee m ON e.manager_id = m.id;`;

  try {
    const result = await client.query(query);
    const data = result.rows.map((employee) => [
      employee.id,
      employee.first_name,
      employee.last_name,
      employee.title,
      employee.department,
      employee.salary,
      employee.manager_first_name
        ? `${employee.manager_first_name} ${employee.manager_last_name}`
        : "None",
    ]);

    const output = table([
      [
        "ID",
        "First Name",
        "Last Name",
        "Title",
        "Department",
        "Salary",
        "Manager",
      ],
      ...data,
    ]);
    console.log(output);
    await handleUserAction(); // Return to the main menu
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

async function handleUserAction() {
  const action = await displayMenu();

  switch (action) {
    case "View all departments":
      await viewData("SELECT * FROM department", "Departments");
      break;
    case "View all roles":
      await viewData("SELECT * FROM role", "Roles");
      break;
    case "View all employees":
      await viewAllEmployees();
      break;
    case "Add a department":
      const { departmentName } = await inquirer.prompt({
        type: "input",
        name: "departmentName",
        message: "Enter department name:",
      });
      await createDepartment(departmentName);
      break;
    case "Add a role":
      await addRole();
      break;
    case "Add an employee":
      await addEmployee();
      break;
    case "Update an employee role":
      await updateEmployeeRole();
      break;
    case "Delete a department":
      await deleteDepartmentById();
      break;
    case "Delete a role":
      await deleteRoleByName();
      break;
    case "Delete an employee":
      await deleteEmployeeByName(); // Call your deleteEmployeeByName function here
      break;
    case "Exit":
      await client.end();
      console.log("Goodbye!");
      process.exit(0);
      break;
    default:
      console.log("Invalid action");
      await handleUserAction();
  }
}

connectDatabase()
  .then(async () => {
    await createTableIfNotExists();
    await handleUserAction();
  })
  .catch((error) => console.error("Error connecting to database:", error));
