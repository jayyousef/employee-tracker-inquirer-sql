const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: '',
  database: 'employees_DB',
});

// function which prompts the user for what action they should take
const start = () => {
  inquirer
    .prompt({
      name: 'start',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager', 'Add Employee', 'Add Department', 'Add Role', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager', 'Exit'],
    })
    .then((answer) => {
      // based on their answer, call the corresponding function
      if (answer.start === 'View All Employees') {
        viewAllEmployees();
      } else if (answer.start === 'View All Employees By Department') {
        employeesByDepartment();
      } else if (answer.start === 'View All Employees By Manager') {
        employeesByManager();
      } else if (answer.start === 'Add Employee') {
        addEmployee();
      } else if (answer.start === 'Add Department') {
        addDepartment();
      } else if (answer.start === 'Add Role') {
        addRole();
      } else if (answer.start === 'Remove Employee') {
        removeEmployee();
      } else if (answer.start === 'Update Employee Role') {
        updateEmployeeRole();
      } else if (answer.start === 'Update Employee Manager') {
        updateEmployeeManager();
      } else {
        connection.end();
      }
    });
};

const viewAllEmployees = () => {
  connection.query('SELECT * FROM employee', (err, results) => {
    if (err) throw err;
    const employees = results;
    console.table(employees)
    setTimeout(returningPrompt, 1000);
    setTimeout(start, 3000);
  })
}

const employeesByDepartment = () => {
  let departments;
  const getDepartments = () =>
    new Promise((resolve, reject) => {
      connection.query('SELECT departmentName FROM employee', (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        departments = JSON.parse(JSON.stringify(results))
        resolve(departments)
      })
    })

  getDepartments().then((departments) => {
    //attempting to remove duplicates from an array
    departments = Object.values(departments)
    let uniqueDepartments = [...new Set(departments)];
    console.log('this is uniqueDepartments', uniqueDepartments)
    askDepartment(uniqueDepartments)
  }).catch((err) => console.error('Promise rejected:', err))
}

const askDepartment = (departments) => {
  inquirer
    .prompt([{
      name: 'department',
      type: 'list',
      message: 'Which department would you like to view?',
      choices: departments
    }]).then((answer) => {
      connection.query('SELECT * FROM employee WHERE department_name=?', [answer.department], (err, results) => {
        if (err) throw err;
        console.log('this is results console log >>>', results);
        console.log('below is the console table >>>');
        console.table(results)
      })
    })
}


const employeesByManager = () => {
  let managers;
  const getManager = () =>
    new Promise((resolve, reject) => {
      connection.query('SELECT managerID FROM employee', (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        managers = JSON.parse(JSON.stringify(results))
        resolve(managers)
      })
    })

  getManager().then((managers) => {
    //attempting to remove duplicates from an array
    managers = Object.values(managers)
    let uniqueManagers = [...new Set(managers)];
    console.log('this is uniqueDepartments', uniqueManagers)
    askManager(uniqueManagerss)
  }).catch((err) => console.error('Promise rejected:', err))
}

const askManager = (managers) => {
  inquirer
    .prompt([{
      name: 'manager',
      type: 'list',
      message: "Which Manager\'s employees would you like to view?",
      choices: managers
    }]).then((answer) => {
      connection.query('SELECT * FROM employee WHERE managerID=?', [answer.manager], (err, results) => {
        if (err) throw err;
        console.log('this is results console log >>>', results);
        console.log('below is the console table >>>');
        console.table(results)
      })
    })
}

const removeEmployee = () => {
  let employees;
  //first we need to retrive the list of employees to use in the inquirer question
  const getEmployees = () =>
    new Promise((resolve, reject) =>
      connection.query('SELECT first_name,last_name FROM employee', (err, results) => {
        if (err) reject(new Error('There was an error: ', err));
        employees = JSON.parse(JSON.stringify(results));
        resolve(employees)
      }))
  getEmployees()
    .then(() => {
      askEmployee(employees)
    })
    .catch((err) => console.error('Promise rejected:', err))
}

const askEmployee = (employees) => {
  //TODO need to take the object and turn it into an array of [first_name last_name]
  //need to turn the employees into an array that can be read by inquirer
  inquirer
    .prompt([{
      name: 'employee',
      type: 'list',
      message: 'Select the name of the employee you would like to delete:',
      choices: employees
    }]).then((answer) => {
      //TODO: need to separate the values of the chosen employee into separate values to be inputted to SQL
      connection.query(
        'DELETE FROM employee WHERE first_name=? AND last_name=?',
        [first_name, last_name],
        (err, res) => {
          if (err) throw err;
          console.log(`Deleting ${res.affectedRows} from the database!\n`);
          console.log(`Deleting ${first_name} ${last_name} from the Employee Database..\n`);
        }
      )
      start()
    })
}


const addEmployee = () => {
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
      name: 'department',
      type: 'input',
      message: 'What is this employees title?'
    }, {
      name: 'salary',
      type: 'input',
      message: 'What is this employees yearly salary? (ex. \"50000\")'
    }]).then((answer) => {

      //TODO: need to separate the values of the chosen employee into separate values to be inputted to SQL
      connection.query(
        `INSERT INTO employee (first_name, last_name, departmentName, roleID, manager_id) VALUES (${answer.first_name}, ${answer.last_name},${answer.department},${answer.salary})`,
        (err, res) => {
          if (err) throw err;
          console.log(`Adding ${res.affectedRows} to the database!\n`);
          console.log(`Adding ${first_name} ${last_name} to the Employee Database..\n`);
        }
      )
      start()
    }).catch((err) => console.error('Promise rejected:', err))
}


// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  console.log('                        __                                                                    ')
  console.log('  ___  ____ ___  ____  / /___  __  _____  ___     ____ ___  ____ _____  ____ _____ ____  _____')
  console.log(' / _ \/ __ `__ \/ __ \/ / __ \/ / / / _ \/ _ \   / __ `__ \/ __ `/ __ \/ __ `/ __ `/ _ \/ ___/')
  console.log('/  __/ / / / / / /_/ / / /_/ / /_/ /  __/  __/  / / / / / / /_/ / / / / /_/ / /_/ /  __/ /    ')
  console.log('\___/_/ /_/ /_/ .___/_/\____/\__, /\___/\___/  /_/ /_/ /_/\__,_/_/ /_/\__,_/\__, /\___/_/     ')
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