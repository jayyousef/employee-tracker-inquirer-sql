const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const connection = require('./db/connection');
const {
  query
} = require('./db/connection');
const {} = require('inquirer/lib/utils/utils');

/**
 * when you connect/start up the application
 * you can do a query for all departments
 * and store them in an array
 * if a department already exists (checking with includes())
 * then add a row to your db and to the array
 */
// function which prompts the user for what action they should take

const start = () => {
  inquirer
    .prompt({
      name: 'start',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View Employees, Roles, or Departments', 'Add to the Database', 'Remove Employee', 'Update Employee Role', 'Exit'],
    })
    .then((answer) => {
      switch (answer.start) {
        case 'View Employees, Roles, or Departments':
          viewEmployees();
          break;

        case 'Add to the Database':
          addToDB();
          break;

        case 'Remove Employee':
          removeEmployee();
          break;

        case 'Update Employee Role':
          updateDB();
          break;

        default:
          connection.end();
          break;
      }
    })
};

//if the user says they would like to view employees this function runs
//this function will ask if they want to view all employees, by dept, or by manager
const viewEmployees = () => {
  inquirer
    .prompt({
      name: 'view',
      type: 'list',
      message: 'What would you like to view?',
      choices: ['View All Employees', 'View Employees By Department', 'View Employees By Manager', 'View Departments', 'View Roles', 'Return to start'],
    })
    //based on their response this function will call the correct function to query the DB and then take the back to the beginning of the app after the funtion is run
    .then((answer) => {
      switch (answer.view) {
        case 'View All Employees':
          viewAllEmployees();
          break;

        case 'View Employees By Department':
          employeesByDepartment();
          break;

        case 'View Employees By Manager':
          employeesByManager();
          break;

        case 'View Departments':
          viewDepartments();
          break;

        case 'View Roles':
          viewRoles();
          break;

        case 'Return to start':
          start();
          break;

        default:
          console.log('Something went wrong...');
          returningPrompt();
          setTimeout(start, 2000);
          break;
      }
    })
}

const viewDepartments = () => {
  const query = `SELECT id,
  name from department`
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results)
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  })
};

const viewRoles = () => {
  const query = `SELECT role.id,title, salary, department.name as department
  from role
  left join department on department_id=department.id`
  connection.query(query, (err, results) => {
    if (err) throw err;
    const employees = results;
    console.table(employees)
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  })
}

//this function is run when the user asks to see all employees. then it takes them back to the start()
const viewAllEmployees = () => {
  const query = `SELECT
  employee.id, employee.first_name,employee.last_name,role.title,role.salary,
  department.name AS department,
  CONCAT(manager.first_name,' ',manager.last_name) AS manager
  from employee
  left join role on employee.role_id=role.id
  left join department on department_id=department.id
  left join employee manager on employee.manager_id=manager.id`
  connection.query(query, (err, results) => {
    if (err) throw err;
    const employees = results;
    console.table(employees)
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  })
}
//when the user asks to see users by Dept, this function will query the DB to get a list of all the departments
const employeesByDepartment = () => {
  let departments;
  const getDepartments = () =>
    new Promise((resolve, reject) => {
      connection.query('SELECT id,name FROM department', (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        departments = results
        resolve(departments)
      })
    })
  //after this function gets the name of the departments, it uses those names to populate the choices of the inquirer question
  //then it calls the askDepartment function
  getDepartments().then((departments) => {
    let parsedDepartments;
    parsedDepartments = departments.map((i) => i.name);
    askDepartment(parsedDepartments)
  }).catch((err) => console.error('Promise rejected:', err))
}

//this function will ask them which department they would like to view
//then this function will query the DB based on the department they chose
//then it takes them back to the start()
const askDepartment = (departments) => {
  inquirer
    .prompt([{
      name: 'department',
      type: 'list',
      message: 'Which department would you like to view?',
      choices: departments
    }]).then((answer) => {
      const query = `SELECT employee.id, CONCAT(first_name,' ',last_name) AS name , role.title as title, role.salary, department.name as department
      FROM employees_DB.employee
      left join role on role_id = role.id
      left join department on role_id=department.id
      where department.name =?`
      connection.query(query, [answer.department], (err, results) => {
        if (err) throw err;
        console.table(results)
        setTimeout(returningPrompt, 1000);
        setTimeout(start, 3000);
      })
    })
}


//when the user asks to see users by manager, this function will query the DB to get a list of all the managers
const employeesByManager = () => {
  //this promise recieves a list of all the mangers in the database
  const getManagers =
    new Promise((resolve, reject) => {
      const query = `Select 
        concat(manager.first_name, ' ', manager.last_name) as manager
        FROM employee LEFT JOIN employee manager on employee.manager_id=manager.id;`
      connection.query(query, (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        managers = results
        resolve(managers)
      })
    })
  getManagers.then((managers) => {
    const cleanManagers = (managers) => {
      //this section of code removes all the duplicates from the DB and sends the new list minus duplicates to the askManager function
      let parsedManagers;
      parsedManagers = managers.map((i) => i.manager);
      let uniqueManagers = [...new Set(parsedManagers)];
      const filteredManagers = uniqueManagers.filter(n => n)
      askManager(filteredManagers)
    };
    //this runs the above functino
    cleanManagers(managers)

  }).catch((err) => console.error('Promise rejected:', err))
}


//this function will ask them which manager they would like to view
//then this function will query the DB based on the manager they chose
//then it takes them back to the start()
const askManager = (managers) => {
  inquirer
    .prompt([{
      name: 'manager',
      type: 'list',
      message: "Which Manager\'s employees would you like to view?",
      choices: managers
      //this function queries the DB bnased on the manager they chose including first and last name
      //then they return to the start
    }]).then((answer) => {
      let managerName = answer.manager
      managerName = managerName.split(" ")
      let managerLastName = managerName[1]
      let managerFirstName = managerName[0]
      const query = `SELECT 
      concat(sub.first_name, ' ',sub.last_name) as employee_name,
          concat(sup.first_name,' ',sup.last_name) as manager_name
                FROM employee as sub 
          LEFT JOIN employee as sup 
          ON sub.manager_id = sup.id
          where sup.last_name=?
          and sup.first_name=?`
      connection.query(query, [managerLastName, managerFirstName], (err, results) => {
        if (err) throw err;
        console.table(results)
        setTimeout(returningPrompt, 1000);
        setTimeout(start, 3000);
      })
    })
}

//THIS IS A DELETE FUNCTION
const askEmployee = (employees) => {
  inquirer
    .prompt([{
      name: 'employee',
      type: 'list',
      message: 'Select the name of the employee you would like to delete:',
      choices: employees
    }]).then((answer) => {
      const employeeFullName = answer.employee
      const employeeName = employeeFullName.split(" ")
      firstName = employeeName[0]
      lastName = employeeName[1]
      connection.query(
        'DELETE FROM employee WHERE first_name=? AND last_name=?',
        [firstName, lastName],
        (err, res) => {
          if (err) throw err;
          console.log(`Deleting ${employeeFullName} from the Employee Database...\n`);
        }
      )
      setTimeout(returningPrompt, 1000);
      setTimeout(start, 3000);
    })
}
//this function retrieves an employee and then passes it to the delete function above askEmployee()
const removeEmployee = () => {
  //first we need to retrive the list of employees to use in the inquirer question
  const getEmployees =
    new Promise((resolve, reject) => {
      connection.query(`SELECT concat(first_name,' ',last_name) as name FROM employee`, (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        const employeeArray = results.map((i) => i.name);
        const uniqueEmployees = [...new Set(employeeArray)];
        resolve(uniqueEmployees)
      })
    })

  getEmployees.then((employeeList) => {
      askEmployee(employeeList)
    })
    .catch((err) => console.error('Promise rejected:', err))
}


const addToDB = () => {
  inquirer
    .prompt({
      name: 'add',
      type: 'list',
      message: 'What would you like to add',
      choices: ['Add a new Employee', 'Add a new role', 'Add a new department', 'Return to Start'],
    })
    //based on their response this function will call the correct function to query the DB and then take the back to the beginning of the app after the funtion is run
    .then((answer) => {
      switch (answer.add) {
        case 'Add a new Employee':
          addEmployee();
          break;

        case 'Add a new role':
          getDepartmentsAddRole();
          break;

        case 'Add a new department':
          addDepartment();
          break;

        case 'Return to Start':
          start();
          break;

        default:
          console.log('Something went wrong...');
          returningPrompt();
          setTimeout(start, 2000);
          break;
      }
    })
}

//
const getRoles = (managers) => {
  const roles = new Promise((resolve, reject) =>
    connection.query('SELECT title FROM role', (err, results) => {
      if (err) reject(new Error('There was an error: ', err));
      resolve(results)
    }))
  roles.then((results) => {
      const rolesArray = results.map((i) => i.title);
      const uniqueRoles = [...new Set(rolesArray)];
      askEmployeeInformation(managers, uniqueRoles)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const getEmployeeInformation = () => {
  const getManager =
    new Promise((resolve, reject) => {
      const query = `Select 
        concat(first_name, ' ', last_name) as name
        FROM employee`
      connection.query(query, (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        resolve(results)
      })
    })
  getManager.then((results) => {
    const cleanManagers = (managers) => {
      //this section of code removes all the duplicates from the DB and sends the new list minus duplicates to the askManager function
      let parsedManagers;
      parsedManagers = managers.map((i) => i.name);
      let uniqueManagers = [...new Set(parsedManagers)];
      const filteredManagers = uniqueManagers.filter(n => n)
      filteredManagers.push("none")
      getRoles(filteredManagers)
    };
    cleanManagers(results)
  })
}

const addEmployee = () => {
  getEmployeeInformation()
}
//this function asks the user to input their new employees name, role, and manager name
const askEmployeeInformation = (employees, roles) => {
  inquirer
    .prompt([{
      name: 'first_name',
      type: 'input',
      message: 'What is the FIRST name of the employee you would like to add?'
    }, {
      name: 'last_name',
      type: 'input',
      message: 'What is the LAST name of the employee you would like to add?'
    }, {
      name: 'role',
      type: 'list',
      message: 'What is this employees role?',
      choices: roles
    }, {
      name: 'manager',
      type: 'list',
      message: 'What is his or her manager\'s name?',
      choices: employees
    }]).then((answers) => {
      if (answers.manager === 'none') {
        let managerid = null
        getRoleId(answers.first_name, answers.last_name, answers.role, managerid)
      } else {
        let managerid = answers.manager
        managerid = managerid.split(" ")
        managerid_firstName = managerid[0]
        managerid_lastName = managerid[1]
        getManagerID(answers.first_name, answers.last_name, answers.role, managerid_firstName, managerid_lastName)
      }
    })
}

//this function passes the manager ID and returns the ID number of the same manager
const getManagerID = (firstName, lastName, role_id, managerid_firstName, managerid_lastName) => {
  const getManagerID = () =>
    new Promise((resolve, reject) => {
      connection.query('SELECT id FROM employee WHERE first_name =? AND last_name=?', [managerid_firstName, managerid_lastName], (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        resolve(results)
      })
    })

  getManagerID().then((manager) => {
    const managers = manager.map((i) => i.id);
    const managerNum = managers[0]
    getRoleId(firstName, lastName, role_id, managerNum)
  }).catch((err) => console.error('Promise rejected:', err))

}

const getRoleId = (firstName, lastName, role_id, managerMapped) => {
  const roles = new Promise((resolve, reject) => {
    connection.query('SELECT id FROM role WHERE title=?', [role_id], (err, results) => {
      if (err) reject(new Error('There was an error: ', err));
      resolve(results)
    })
  })
  roles.then((role) => {
      const roles = role.map((i) => i.id);
      const role_id = roles[0]
      addEmployeeQuery(firstName, lastName, role_id, managerMapped)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const addEmployeeQuery = (firstName, lastName, role, managerNumber) => {
  let query;
  if (managerNumber === null) {
    query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}','${role}',${managerNumber})`

  } else {
    query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}','${role}','${managerNumber}')`

  }
  console.log(query)
  const queryPromise =
    new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) reject(new Error('There was an error: ', err));
        resolve(res)
      })
    })
  queryPromise.then(() => {
    console.log(`Adding ${firstName} ${lastName} to the Employee Database..\n`);
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  }).catch((err) => console.error('Promise rejected:', err))
}

const getDepartmentsAddRole = () => {
  const departmentsPromise = new Promise((resolve, reject) =>
    connection.query('SELECT name FROM department', (err, results) => {
      if (err) reject(new Error('There was an error: ', err));
      resolve(results)
    }))
  departmentsPromise.then((results) => {
      const deparmentsObject = results.map((i) => i.name);
      const uniqueDepartments = [...new Set(deparmentsObject)];
      askNewRole(uniqueDepartments)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const getDepartmentIDAddRole = (roleTitle, roleSalary, departmentName) => {
  const getDepartments = new Promise((resolve, reject) => {
    connection.query('SELECT id FROM department WHERE name=?', [departmentName], (err, results) => {
      if (err) reject(new Error('There was an error: ', err));
      resolve(results)
    })
  })
  getDepartments.then((departments) => {
      const departmentObject = departments.map((i) => i.id);
      const departmentID = departmentObject[0]
      addNewRole(roleTitle, roleSalary, departmentID)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const addNewRole = (newRole, newSalary, newDepartmentID) => {
  const query = `INSERT INTO role (title, salary, department_id) VALUES ('${newRole}', '${newSalary}','${newDepartmentID}')`
  const addRolePromise =
    new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) reject(new Error('There was an error: ', err));
        console.log(`Adding role ${newRole} into the Database!`)
        resolve(res)
      })
    })
  addRolePromise.then(() => {
    console.log(`Adding ${newRole} to the Employee Database..\n`);
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  }).catch((err) => console.error('Promise rejected:', err))
}

const askNewRole = (deparmentsArray) => {
  inquirer
    .prompt([{
      name: 'title',
      type: 'input',
      message: 'What is the title of this role (Ex. \'Salesman\' or \'Graphic Designer\')'
    }, {
      name: 'salary',
      type: 'input',
      message: 'What is the salary of this role? (Ex. \'45000\' or \'90000\')'
    }, {
      name: 'department',
      type: 'list',
      message: 'Which department does this role fall under?',
      choices: deparmentsArray
    }, ]).then((answer) => {
      getDepartmentIDAddRole(answer.title, answer.salary, answer.department)
    }).catch((err) => console.error('Promise rejected:', err))
}

const updateDB = () => {
  const employees = new Promise((resolve, reject) => {
    const query = `SELECT CONCAT(first_name,' ',last_name) AS name
  from employee`
    connection.query(query, (err, results) => {
      if (err) reject(new Error('There was an error: ', err));
      resolve(results)
    })
  })
  employees.then((results) => {
      const employeesArray = results.map((i) => i.name);
      const uniqueEmployees = [...new Set(employeesArray)];
      updateGetRoles(uniqueEmployees)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const updateGetRoles = (employeeNames) => {
  const roles = new Promise((resolve, reject) => {
    connection.query('SELECT title FROM role', (err, results) => {
      if (err) reject(new Error('There was an error: ', err));
      resolve(results)
    })
  })

  roles.then((results) => {
      const rolesArray = results.map((i) => i.title);
      const uniqueRoles = [...new Set(rolesArray)];
      askEmployeeNames(employeeNames, uniqueRoles)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const askEmployeeNames = (employeesArray, rolesArray) => {
  inquirer
    .prompt([{
        name: 'employee',
        type: 'list',
        message: 'What is the name of the employee you would like to update?',
        choices: employeesArray
      },
      {
        name: 'role',
        type: 'list',
        message: 'What is role you would like to give them?',
        choices: rolesArray
      }
    ]).then((answer) => {
      const query = `SELECT id FROM role WHERE title = '${answer.role}'`
      connection.query(query, (err, res) => {
        if (err) throw err;
        const roleName = answer.role
        const roleID = res.map((i) => i.id);
        const uniqueID = [...new Set(roleID)];
        const newRoleID = uniqueID[0]
        updateEmployeeRole(answer.employee, roleID, roleName)
      })
    }).catch((err) => console.error('Promise rejected:', err))
}

const updateEmployeeRole = (employeeFullName, role_ID, Role_name) => {
  const splitEmployeeName = employeeFullName.split(' ')
  const employeeFirstName = splitEmployeeName[0]
  const employeeLastName = splitEmployeeName[1]
  const query = `UPDATE employee SET role_id= ${role_ID} WHERE first_name='${employeeFirstName}' AND last_name='${employeeLastName}'`
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log(`Updating ${employeeFullName}'s role to ${Role_name} in the Employee Database..\n`);
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  })
}

const addDepartment = () => {
  inquirer
    .prompt([{
      name: 'department',
      type: 'input',
      message: 'What is the name of the department you would like to add?'
    }]).then((answer) => {

      connection.query(`INSERT INTO department (name) VALUES ('${answer.department}')`,
        (err, res) => {
          if (err) throw err;
          console.log(`Adding ${answer.department} to the Employee Database..\n`);
          setTimeout(returningPrompt, 1000);
          setTimeout(start, 3000);
        }
      )
    }).catch((err) => console.error('Promise rejected:', err))
}

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  console.log('                        __                                                                    ')
  console.log('  ___  ____ ___  ____  / /___  __  _____  ___     ____ ___  ____ _____  ____ _____ ____  _____')
  console.log(' / _  / __ `__  / __  / / __  / / / / _  / _  /   / __ `__// __ `/ __  / __ `/ __ `/ _  / ___/')
  console.log('/  __/ / / / / / /_/ / / /_/ / /_/ /  __/  __/  / / / / / / /_/ / / / / /_/ / /_/ /  __/ /    ')
  console.log(' ___/_/ /_/ /_/ .___/_/ ____/ __, / ___/ ___/  /_/ /_/ /_/ __,_/_/ /_/ __,_/___, /____/_/     ')
  console.log('             /_/            /____/                                         /____/             ')
  // run the start function after the connection is made to prompt the user
  start();
});

//this function tells the user that they're returning to the start 
const returningPrompt = () => {
  console.log(
    'Returning to start...'
  )
}

// console.table([
//   {
//     name: 'foo',
//     age: 10
//   }, {
//     name: 'bar',
//     age: 20
//   }
// ]);

//var values = [
//   ['name', 'age'],
//   ['max', 20],
//   ['joe', 30]
// ]
// console.table(values[0], values.slice(1));